import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ObjectId } from 'mongodb';
import { createAuthApi } from '../src/auth.mjs';

function memoryDatabase() {
  const tables = new Map();
  const matches = (record, query) => Object.entries(query).every(([key, value]) => value?.$gt ? record[key] > value.$gt : String(record[key]) === String(value));
  return { collection(name) {
    if (!tables.has(name)) tables.set(name, []);
    const records = tables.get(name);
    return {
      records,
      async createIndexes() {},
      async findOne(query) { return records.find(record => matches(record, query)) || null; },
      async insertOne(record) {
        if (name === 'users' && records.some(existing => existing.email === record.email || record.googleSub && existing.googleSub === record.googleSub || record.phone && existing.phone === record.phone)) throw Object.assign(new Error(), { code: 11000 });
        record._id ||= new ObjectId(); records.push(record); return { insertedId: record._id };
      },
      async deleteOne(query) { const index = records.findIndex(record => matches(record, query)); if (index >= 0) records.splice(index, 1); },
      async updateOne(query, change) {
        const record = records.find(record => matches(record, query));
        if (!record) return { modifiedCount: 0 };
        Object.assign(record, change.$set || {});
        for (const [key, value] of Object.entries(change.$addToSet || {})) {
          record[key] ||= [];
          if (!record[key].includes(value)) record[key].push(value);
        }
        return { modifiedCount: 1 };
      },
    };
  } };
}

async function setup(t, verifyGoogle = async () => { throw Error('invalid token'); }, databaseGetter, options = {}) {
  const db = memoryDatabase();
  const api = createAuthApi({ env: { GOOGLE_CLIENT_ID: 'test-client', APP_ORIGIN: 'http://localhost:8443' }, getDb: databaseGetter || (async () => db), verifyGoogle, ...options });
  const server = createServer((req, res) => { void api(req, res); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}/api/auth/`;
  const configResponse = await fetch(base + 'config');
  const config = await configResponse.json();
  let cookie = configResponse.headers.getSetCookie().map(item => item.split(';')[0]).join('; ');
  return { db, config, configResponse, base,
    async post(path, body, headers = {}) {
      const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8443', Cookie: cookie, 'X-CSRF-Token': config.csrfToken, ...headers }, body: JSON.stringify(body) });
      const data = await response.json();
      const session = response.headers.getSetCookie().find(item => item.startsWith('kg_session='));
      if (session) cookie = cookie.split('; ').filter(item => !item.startsWith('kg_session=')).concat(session.split(';')[0]).join('; ');
      return { response, data, session };
    },
    async session() { return (await fetch(base + 'session', { headers: { Cookie: cookie } })).json(); },
  };
}
const registration = { email: 'person@example.test', password: 'a-strong-test-password', role: 'fleet', name: 'Test Person', phone: '+63 917 123 4567', businessName: 'Test Fleet' };

test('public configuration contains only the client ID and CSRF token', async t => {
  const app = await setup(t);
  assert.deepEqual(Object.keys(app.config).sort(), ['csrfToken', 'googleClientId']);
  assert.match(app.configResponse.headers.getSetCookie()[0], /HttpOnly; SameSite=Lax/);
  assert.equal((await app.session()).user, null);
});

test('signup stores salted hashes and rejects role escalation and duplicates', async t => {
  const app = await setup(t);
  assert.equal((await app.post('register', { ...registration, role: 'admin' })).response.status, 400);
  assert.equal((await app.post('register', registration)).response.status, 201);
  const stored = app.db.collection('users').records[0];
  assert.notEqual(stored.passwordHash, registration.password);
  assert.equal(stored.password, undefined);
  assert.equal(stored.phone, '639171234567');
  assert.equal(stored.verificationStatus, 'pending');
  assert.equal((await app.post('register', registration)).response.status, 409);
});

test('login enforces the password and stored role, creates a session, and logout revokes it', async t => {
  const app = await setup(t);
  await app.post('register', registration);
  assert.equal((await app.post('login', { identifier: registration.email, password: 'wrong-password', role: 'fleet' })).response.status, 401);
  assert.equal((await app.post('login', { identifier: registration.email, password: registration.password, role: 'admin' })).response.status, 401);
  const login = await app.post('login', { identifier: '09171234567', password: registration.password, role: 'fleet' });
  assert.equal(login.response.status, 200);
  assert.match(login.session, /HttpOnly; SameSite=Lax/);
  assert.equal(login.data.user.role, 'fleet');
  assert.equal(login.data.user.passwordHash, undefined);
  const token = login.session.split(';')[0].split('=')[1];
  assert.notEqual(app.db.collection('sessions').records[0].tokenHash, token);
  assert.equal((await app.session()).user.email, registration.email);
  await app.post('logout', {});
  assert.equal((await app.session()).user, null);
});

test('logout clears the browser session cookie when MongoDB is unavailable', async t => {
  const app = await setup(t, undefined, async () => { throw Error('database unavailable'); });
  const result = await app.post('logout', {}, { Cookie: `kg_csrf=${app.config.csrfToken}; kg_session=opaque-session-token` });
  assert.equal(result.response.status, 200);
  assert.match(result.response.headers.getSetCookie().join(';'), /kg_session=;.*Max-Age=0/);
});

test('expired sessions are rejected even before MongoDB TTL cleanup', async t => {
  const app = await setup(t);
  await app.post('register', registration);
  await app.post('login', { identifier: registration.email, password: registration.password, role: 'fleet' });
  app.db.collection('sessions').records[0].expiresAt = new Date(0);
  assert.equal((await app.session()).user, null);
});

test('cross-origin and missing, malformed, or mismatched CSRF requests are rejected', async t => {
  const app = await setup(t);
  for (const headers of [{ Origin: 'https://other.example' }, { 'X-CSRF-Token': '' }, { 'X-CSRF-Token': 'x'.repeat(64) }, { 'X-CSRF-Token': '0'.repeat(64) }]) {
    assert.equal((await app.post('register', registration, headers)).response.status, 403);
  }
  assert.equal(app.db.collection('users').records.length, 0);
});

test('unverified Google credentials never create an account or session', async t => {
  const app = await setup(t);
  assert.equal((await app.post('google', { credential: 'forged-token', role: 'admin' })).response.status, 401);
  assert.equal(app.db.collection('users').records.length, 0);
  assert.equal(app.db.collection('sessions').records.length, 0);
});

test('Vite alternate localhost port can create a hauling request and retry without duplicates', async t => {
  const app = await setup(t, undefined, undefined, { allowLocalDevelopmentOrigin: true });
  const headers = { Origin: new URL(app.base).origin };
  const customer = { ...registration, role: 'customer' };
  assert.equal((await app.post('register', customer, headers)).response.status, 201);
  assert.equal((await app.post('login', { identifier: customer.email, password: customer.password, role: 'customer' }, headers)).response.status, 200);
  const location = { address: 'Casisang', city: 'Malaybalay', province: 'Bukidnon', contact: 'Test Contact', phone: '09876543210' };
  const request = { category: 'construction', pickup: location, delivery: { ...location, address: 'Kalasungay' }, cargo: 'Cement', quantity: '20', weightKg: 200, truckType: 'No Preference', scheduledAt: new Date(Date.now() + 86400000).toISOString(), deliveryAt: null, handling: [], equipment: [], photos: [], helpers: false, flexible: false, budget: null };
  const first = await app.post('../bookings', { submissionKey: 'alternate-port-test', request }, headers);
  assert.equal(first.response.status, 201, JSON.stringify(first.data));
  assert.equal(first.data.booking.request.cargo, 'Cement');
  assert.equal(first.data.booking.dispatch.status, 'review');
  const retry = await app.post('../bookings', { submissionKey: 'alternate-port-test', request }, headers);
  assert.equal(retry.response.status, 200);
  assert.equal(retry.data.booking.id, first.data.booking.id);
  assert.equal(app.db.collection('bookings').records.length, 1);
  assert.equal((await app.post('logout', {}, headers)).response.status, 200);
  assert.equal((await app.session()).user, null);
});

test('alternate development port still rejects cross-origin requests and invalid CSRF tokens', async t => {
  const app = await setup(t, undefined, undefined, { allowLocalDevelopmentOrigin: true });
  for (const headers of [
    { Origin: 'http://localhost:8444', Host: 'localhost:8443' },
    { Origin: 'http://untrusted.example:8444', Host: 'untrusted.example:8444' },
    { Origin: '', Host: 'localhost:8444' },
    { Origin: new URL(app.base).origin, 'X-CSRF-Token': '' },
    { Origin: new URL(app.base).origin, 'X-CSRF-Token': '0'.repeat(64) },
  ]) assert.equal((await app.post('logout', {}, headers)).response.status, 403);
});

test('alternate localhost origin stays disabled outside Vite and in production', async t => {
  for (const options of [{}, { allowLocalDevelopmentOrigin: true, env: { APP_ORIGIN: 'http://localhost:8443', NODE_ENV: 'production' } }]) {
    const app = await setup(t, undefined, undefined, options);
    assert.equal((await app.post('logout', {}, { Origin: new URL(app.base).origin })).response.status, 403);
  }
});

test('verified Google signup uses sub, cannot register an admin, and cannot overwrite a password account', async t => {
  const app = await setup(t, async () => ({ sub: 'google-person-1', email: 'google@example.test', name: 'Google Person', email_verified: true }));
  assert.equal((await app.post('google', { credential: 'test-verified', role: 'admin' })).response.status, 403);
  assert.equal((await app.post('google', { credential: 'test-verified', role: 'customer' })).response.status, 200);
  assert.equal(app.db.collection('users').records[0].googleSub, 'google-person-1');
  assert.equal((await app.post('google', { credential: 'test-verified', role: 'admin' })).response.status, 403);
  const another = await setup(t, async () => ({ sub: 'different-google', email: registration.email, email_verified: true }));
  await another.post('register', registration);
  assert.equal((await another.post('google', { credential: 'test-verified', role: 'fleet' })).response.status, 409);
  assert.equal(another.db.collection('users').records[0].googleSub, undefined);
});

test('repeated login attempts are rate limited', async t => {
  const app = await setup(t);
  for (let i = 0; i < 30; i++) assert.equal((await app.post('login', { role: 'invalid' })).response.status, 401);
  assert.equal((await app.post('login', { role: 'invalid' })).response.status, 429);
  assert.equal((await app.post('logout', {})).response.status, 200);
});

test('Google signup registers the selected customer, driver, or fleet role and restores it', async t => {
  for (const role of ['customer', 'rider', 'fleet']) {
    const app = await setup(t, async () => ({ sub: `google-${role}`, email: `${role}@example.test`, name: 'Google User', email_verified: true }));
    const result = await app.post('google', { credential: 'verified', role, intent: 'signup' });
    assert.equal(result.response.status, 200);
    assert.equal(result.data.user.role, role);
    assert.equal((await app.session()).user.role, role);
    assert.equal(app.db.collection('users').records[0].role, role);
    assert.equal(result.data.user.verificationStatus, 'pending');
  }
});

test('explicit Google signup adds another public role without replacing existing access', async t => {
  for (const [originalRole, addedRole] of [['customer', 'rider'], ['rider', 'customer'], ['customer', 'fleet']]) {
    const app = await setup(t, async () => ({ sub: 'same-google', email: 'same@example.test', name: 'Same Person', email_verified: true }));
    const original = await app.post('google', { credential: 'verified', role: originalRole, intent: 'signup' });
    const originalCookie = original.session.split(';')[0];
    const wrongLogin = await app.post('google', { credential: 'verified', role: addedRole, intent: 'signin' });
    assert.equal(wrongLogin.response.status, 403);
    const signup = await app.post('google', { credential: 'verified', role: addedRole, intent: 'signup' }, { Cookie: `kg_csrf=${app.config.csrfToken}` });
    assert.equal(signup.response.status, 200);
    assert.equal(signup.data.user.role, addedRole);
    assert.equal(signup.data.user.id, original.data.user.id);
    assert.equal((await app.session()).user.role, addedRole);
    const oldSession = await (await fetch(app.base + 'session', { headers: { Cookie: originalCookie } })).json();
    assert.equal(oldSession.user.role, originalRole);
    const record = app.db.collection('users').records[0];
    assert.equal(record.role, originalRole);
    assert.deepEqual(record.googleRoles, [addedRole]);
    assert.equal(app.db.collection('users').records.length, 1);
    const denied = await app.post('google', { credential: 'verified', role: 'admin', intent: 'signup' });
    assert.equal(denied.response.status, 403);
    for (const role of [originalRole, addedRole, addedRole]) {
      const login = await app.post('google', { credential: 'verified', role, intent: 'signin' });
      assert.equal(login.response.status, 200);
      assert.equal(login.data.user.role, role);
      assert.equal((await app.session()).user.role, role);
      const request = await app.post('../bookings', {});
      assert.equal(request.response.status, role === 'customer' ? 400 : 403);
    }
    await app.post('google', { credential: 'verified', role: addedRole, intent: 'signup' });
    assert.deepEqual(record.googleRoles, [addedRole]);
  }
});

test('legacy Google sessions without a stored role still restore the original account', async t => {
  const app = await setup(t, async () => ({ sub: 'legacy-google', email: 'legacy@example.test', email_verified: true }));
  await app.post('google', { credential: 'verified', role: 'rider', intent: 'signup' });
  delete app.db.collection('sessions').records[0].role;
  assert.equal((await app.session()).user.role, 'rider');
});

test('landing Google sign-in detects the registered customer, driver, or fleet role', async t => {
  for (const role of ['customer', 'rider', 'fleet']) {
    const app = await setup(t, async () => ({ sub: `detect-${role}`, email: `${role}@example.test`, name: 'Registered Person', email_verified: true }));
    await app.post('google', { credential: 'verified', role, intent: 'signup' });
    const result = await app.post('google', { credential: 'verified', role: 'auto', intent: 'signin' });
    assert.equal(result.response.status, 200);
    assert.equal(result.data.user.role, role);
    assert.equal((await app.session()).user.role, role);
    assert.equal(app.db.collection('users').records.length, 1);
    assert.equal(app.db.collection('users').records[0].googleRoles, undefined);
    if (role !== 'customer') {
      assert.equal(result.data.user.verificationStatus, 'pending');
      await app.db.collection('operatorApplications').insertOne({ _id: `${result.data.user.id}-${role}`, status: 'approved' });
      const approved = await app.post('google', { credential: 'verified', role: 'auto', intent: 'signin' });
      assert.equal(approved.data.user.verificationStatus, 'approved');
    }
  }
});

test('landing Google sign-in offers only registered roles and waits for a selection', async t => {
  const app = await setup(t, async () => ({ sub: 'multi-role', email: 'multi@example.test', email_verified: true }));
  await app.post('google', { credential: 'verified', role: 'customer', intent: 'signup' });
  await app.post('google', { credential: 'verified', role: 'rider', intent: 'signup' });
  await app.post('logout', {});
  const result = await app.post('google', { credential: 'verified', role: 'auto', intent: 'signin' });
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.data.roles, ['customer', 'rider']);
  assert.equal(result.data.user, undefined);
  assert.equal((await app.session()).user, null);
  assert.equal(app.db.collection('sessions').records.length, 0);
  const selected = await app.post('google', { credential: 'verified', role: 'rider', intent: 'signin' });
  assert.equal(selected.response.status, 200);
  assert.equal(selected.data.user.role, 'rider');
  assert.equal((await app.session()).user.role, 'rider');
  assert.equal(app.db.collection('users').records[0].role, 'customer');
});

test('automatic Google sign-in does not create accounts or grant administrator access', async t => {
  const app = await setup(t, async () => ({ sub: 'not-registered', email: 'new@example.test', email_verified: true }));
  assert.equal((await app.post('google', { credential: 'verified', role: 'auto', intent: 'signin' })).response.status, 404);
  assert.equal(app.db.collection('users').records.length, 0);
  await app.db.collection('users').insertOne({ googleSub: 'not-registered', email: 'admin@example.test', role: 'admin', name: 'Admin' });
  assert.equal((await app.post('google', { credential: 'verified', role: 'auto', intent: 'signin' })).response.status, 403);
  assert.equal((await app.session()).user, null);
  const unverified = await setup(t, async () => ({ sub: 'unverified', email: 'unverified@example.test', email_verified: false }));
  assert.equal((await unverified.post('google', { credential: 'unverified', role: 'auto', intent: 'signin' })).response.status, 401);
});
