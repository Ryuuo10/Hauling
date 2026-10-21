// Manually provision a sample Fleet login. No real documents are verified.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { MongoClient, ObjectId } from 'mongodb';
import { createAuthApi, hashPassword } from '../src/auth.mjs';
import { loadServerEnv, mongoUriFromEnv } from '../src/env.mjs';

const env = loadServerEnv();
const client = new MongoClient(mongoUriFromEnv(env), { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
const email = 'fleet@kadago.local';
const fixtureKey = 'kadago-fleet-login-sample-2026-10-21';
let server, api;
try {
 const db = client.db(env.MONGODB_DB || 'kadago');
 const users = db.collection('users');
 assert.equal(await users.findOne({ email }), null, 'This email already exists. Existing credentials and roles were not changed.');
 const password = `Fleet!${randomBytes(9).toString('base64url')}`;
 const now = new Date().toISOString();
 const user = {
  _id: new ObjectId(), email, name: 'Fleet Test Manager', role: 'fleet',
  passwordHash: await hashPassword(password), verificationStatus: 'approved', createdAt: new Date(),
  profile: { businessName: 'KadaGo Sample Fleet', businessType: 'Trucking Business', address: 'Malaybalay, Bukidnon', emergencyContact: '', emergencyPhone: '' },
  isTestData: true, testFixtureKey: fixtureKey,
 };
 await users.insertOne(user);
 try {
  await db.collection('operatorApplications').insertOne({
   _id: `${user._id}-fleet`, userId: user._id.toString(), role: 'fleet', email,
   profile: { name: user.name, phone: '', address: user.profile.address, businessName: user.profile.businessName, emergencyContact: '', emergencyPhone: '' },
   truck: { make: 'No truck registered', plate: '', bodyType: '', payloadKg: 0, serviceAreas: '' },
   truckId: null, documents: [], status: 'approved', version: 1,
   feedback: 'Sample Fleet login approved at the user’s request for portal testing. No real documents, company, or vehicle verified.',
   submittedAt: now, reviewedAt: now, reviewedBy: 'manual-test-fixture', isTestData: true, testFixtureKey: fixtureKey,
  });
 } catch (error) {
  await users.deleteOne({ _id: user._id, testFixtureKey: fixtureKey });
  throw error;
 }
 // Exercise password login, session role, and logout through the real auth API.
 api = createAuthApi({ env: { APP_ORIGIN: 'http://localhost:8443' }, getDb: async () => db });
 server = createServer((req, res) => { void api(req, res); });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const base = `http://127.0.0.1:${server.address().port}/api/auth/`;
 const configResponse = await fetch(`${base}config`);
 const config = await configResponse.json();
 let cookie = configResponse.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
 const loginResponse = await fetch(`${base}login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8443', Cookie: cookie, 'X-CSRF-Token': config.csrfToken }, body: JSON.stringify({ identifier: email, password, role: 'fleet' }) });
 const login = await loginResponse.json();
 assert.equal(loginResponse.status, 200, JSON.stringify(login));
 assert.equal(login.user.role, 'fleet');
 assert.equal(login.user.verificationStatus, 'approved');
 const sessionCookie = loginResponse.headers.getSetCookie().find(c => c.startsWith('kg_session='));
 assert.ok(sessionCookie);
 cookie += `; ${sessionCookie.split(';')[0]}`;
 const sessionResponse = await fetch(`${base}session`, { headers: { Cookie: cookie } });
 const session = await sessionResponse.json();
 assert.equal(session.user.id, user._id.toString());
 assert.equal(session.user.role, 'fleet');
 const logout = await fetch(`${base}logout`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8443', Cookie: cookie, 'X-CSRF-Token': config.csrfToken }, body: '{}' });
 assert.equal(logout.status, 200);
 console.log(JSON.stringify({ email, password, role: 'fleet', approval: 'sample-only', loginVerified: true, sessionVerified: true, logoutVerified: true, existingDriverTrucksUnchanged: true }, null, 2));
} catch (error) {
 console.error(error.name === 'AssertionError' ? error.message : `Fleet provisioning failed (${error.code || error.name}).`);
 process.exitCode = 1;
} finally {
 if (server) await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
 await api?.close(); await client.close();
}
