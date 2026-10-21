import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { MongoClient, ObjectId } from 'mongodb';
import { OAuth2Client } from 'google-auth-library';
import { mongoUriFromEnv } from './env.mjs';
import { createBookingsApi } from './bookings.mjs';
import { createOperatorApplicationsApi, operatorStatus } from './operator-applications.mjs';

const scrypt = promisify(scryptCallback);
const roles = ['customer', 'rider', 'fleet', 'admin'];
const lifetime = 7 * 24 * 60 * 60 * 1000;
const digest = value => createHash('sha256').update(value).digest('hex');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const text = (value, max = 200) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const email = value => text(value).toLowerCase();
const phone = value => {
  const digits = text(value, 30).replace(/\D/g, '');
  return digits.startsWith('0') ? '63' + digits.slice(1) : digits.length === 10 ? '63' + digits : digits;
};
const safeUser = user => ({ id: user._id.toString(), email: user.email, name: user.name, role: user.role, verificationStatus: user.verificationStatus });

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  const [salt, hash] = (encoded || '').split(':');
  if (!salt || !hash || hash.length !== 128) return false;
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').flatMap(part => {
    const separator = part.indexOf('=');
    return separator < 0 ? [] : [[part.slice(0, separator).trim(), part.slice(separator + 1).trim()]];
  }));
}

async function readBody(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Send JSON data.');
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 16384) fail(413, 'Request is too large.');
  }
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error();
    return body;
  } catch { fail(400, 'Invalid JSON data.'); }
}

export function createAuthApi({ env, getDb: injectedDb, verifyGoogle: injectedGoogle, allowLocalDevelopmentOrigin = false } = {}) {
  env ||= process.env;
  let client;
  let database;
  const google = new OAuth2Client();
  const attempts = new Map();
  const configuredOrigin = env.APP_ORIGIN ? new URL(env.APP_ORIGIN).origin : null;
  const validOrigin = req => {
    if (req.headers.origin === (configuredOrigin || `http://${req.headers.host}`)) return true;
    // Vite may select another port when the configured port is already occupied.
    // Only its explicit development integration can accept a same-origin loopback request.
    if (!allowLocalDevelopmentOrigin || env.NODE_ENV === 'production') return false;
    try {
      const origin = new URL(req.headers.origin);
      return origin.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)
        && origin.origin === req.headers.origin && origin.host === req.headers.host;
    } catch { return false; }
  };
  const secure = configuredOrigin?.startsWith('https://') || env.NODE_ENV === 'production';
  const cookie = (name, value, age) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure ? '; Secure' : ''}`;
  const send = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify(data));
  };
  const getDb = injectedDb || (async () => {
    if (!database) {
      const uri = mongoUriFromEnv(env);
      if (!uri || uri.includes('<db_password>') || (!env.MONGODB_PASSWORD && (env.MONGODB_URI || '').includes('<db_password>'))) fail(503, 'Database connection is not configured.');
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, maxPoolSize: 10 });
      database = (async () => {
        await client.connect();
        const db = client.db(env.MONGODB_DB || 'kadago');
        await db.collection('users').createIndexes([
          { key: { email: 1 }, unique: true },
          { key: { googleSub: 1 }, unique: true, partialFilterExpression: { googleSub: { $type: 'string' } } },
          { key: { phone: 1 }, unique: true, partialFilterExpression: { phone: { $type: 'string' } } },
        ]);
        await db.collection('sessions').createIndexes([
          { key: { tokenHash: 1 }, unique: true },
          { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
        ]);
        return db;
      })().catch(async error => { database = undefined; await client?.close(); throw error; });
    }
    return database;
  });

  async function startSession(db, req, res, user, role = user.role) {
    const previous = cookies(req).kg_session;
    if (previous) await db.collection('sessions').deleteOne({ tokenHash: digest(previous) });
    const token = randomBytes(32).toString('base64url');
    await db.collection('sessions').insertOne({ tokenHash: digest(token), userId: user._id, role, expiresAt: new Date(Date.now() + lifetime) });
    res.setHeader('Set-Cookie', cookie('kg_session', token, lifetime / 1000));
    send(res, 200, { user: safeUser({ ...user, role, verificationStatus: await operatorStatus(db, user, role) }) });
  }

  const getUser = async req => {
    const token = cookies(req).kg_session;
    if (!token) return null;
    const db = await getDb();
    const session = await db.collection('sessions').findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
    if (!session) return null;
    const user = await db.collection('users').findOne({ _id: session.userId });
    const role = session.role || user?.role;
    if (!user || (role !== user.role && !user.googleRoles?.includes(role))) return null;
    return { ...user, role, verificationStatus: await operatorStatus(db, user, role) };
  };
  const checkMutation = req => {
    const csrf = req.headers['x-csrf-token'], expected = cookies(req).kg_csrf;
    if (!validOrigin(req) || typeof csrf !== 'string' || !/^[a-f0-9]{64}$/.test(csrf) || !expected || csrf.length !== expected.length || !timingSafeEqual(Buffer.from(csrf), Buffer.from(expected))) fail(403, 'Please reload the page and try again.');
  };
  const bookingsApi = createBookingsApi({ getDb, getUser, checkMutation });
  const applicationsApi = createOperatorApplicationsApi({ getDb, getUser, checkMutation });
  const middleware = async (req, res, next = () => send(res, 404, { error: 'Not found.' })) => {
    const path = (req.url || '').split('?')[0];
    if (!path.startsWith('/api/auth/')) return applicationsApi(req, res, () => bookingsApi(req, res, next));
    try {
      if (path === '/api/auth/config' && req.method === 'GET') {
        const csrf = /^[a-f0-9]{64}$/.test(cookies(req).kg_csrf || '') ? cookies(req).kg_csrf : randomBytes(32).toString('hex');
        res.setHeader('Set-Cookie', cookie('kg_csrf', csrf, 3600));
        return send(res, 200, { googleClientId: env.GOOGLE_CLIENT_ID || '', csrfToken: csrf });
      }
      if (path === '/api/auth/session' && req.method === 'GET') {
        const user = await getUser(req);
        return send(res, 200, { user: user ? safeUser(user) : null });
      }
      if (req.method !== 'POST' || !['/api/auth/register', '/api/auth/login', '/api/auth/google', '/api/auth/logout'].includes(path)) return send(res, 404, { error: 'Not found.' });
      checkMutation(req);

      const key = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      for (const [address, attempt] of attempts) if (attempt.until <= now) attempts.delete(address);
      const attempt = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
      if (path !== '/api/auth/logout' && ++attempt.count > 30) fail(429, 'Too many attempts. Please try again in 15 minutes.');
      attempts.set(key, attempt);
      const body = await readBody(req);

      if (path === '/api/auth/logout') {
        const token = cookies(req).kg_session;
        // Expire the browser cookie even if Atlas is temporarily unavailable;
        // otherwise the UI cannot sign out when session revocation hits a DB error.
        res.setHeader('Set-Cookie', cookie('kg_session', '', 0));
        if (token) {
          try { await (await getDb()).collection('sessions').deleteOne({ tokenHash: digest(token) }); }
          catch { /* The cleared client cookie still ends this browser session. */ }
        }
        return send(res, 200, { ok: true });
      }
      if (path === '/api/auth/register') {
        if (!['customer', 'rider', 'fleet'].includes(body.role)) fail(400, 'Choose a valid account type.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email(body.email))) fail(400, 'Enter a valid email address.');
        if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) fail(400, 'Use a password between 8 and 128 characters.');
        if (!text(body.name)) fail(400, 'Enter your name.');
        const normalizedPhone = phone(body.phone);
        if (body.phone && !/^639\d{9}$/.test(normalizedPhone)) fail(400, 'Enter a valid Philippine mobile number.');
        const user = { email: email(body.email), name: text(body.name), role: body.role, passwordHash: await hashPassword(body.password), verificationStatus: 'pending', createdAt: new Date(), profile: { businessName: text(body.businessName), businessType: text(body.businessType), address: text(body.address, 500), emergencyContact: text(body.emergencyContact), emergencyPhone: text(body.emergencyPhone, 30) } };
        if (normalizedPhone) user.phone = normalizedPhone;
        const db = await getDb();
        await db.collection('users').insertOne(user);
        return send(res, 201, { ok: true });
      }
      if (path === '/api/auth/login') {
        if (!roles.includes(body.role) || typeof body.password !== 'string' || body.password.length > 128 || typeof body.identifier !== 'string') fail(401, 'Account details or account type are incorrect.');
        const db = await getDb();
        const identifier = text(body.identifier);
        const user = await db.collection('users').findOne(identifier.includes('@') ? { email: email(identifier) } : { phone: phone(identifier) });
        const validPassword = await verifyPassword(body.password, user?.passwordHash || '00000000000000000000000000000000:' + '0'.repeat(128));
        if (!validPassword || !user || user.role !== body.role) fail(401, 'Account details or account type are incorrect.');
        return await startSession(db, req, res, user);
      }
      if (path === '/api/auth/google') {
        if (!env.GOOGLE_CLIENT_ID) fail(503, 'Google sign-in is not configured.');
        if (typeof body.credential !== 'string' || body.credential.length > 10000) fail(401, 'Google sign-in could not be verified.');
        let payload;
        try { payload = injectedGoogle ? await injectedGoogle(body.credential) : (await google.verifyIdToken({ idToken: body.credential, audience: env.GOOGLE_CLIENT_ID })).getPayload(); }
        catch { fail(401, 'Google sign-in could not be verified.'); }
        if (!payload?.sub || !payload.email || !payload.email_verified) fail(401, 'Use a verified Google account.');
        const db = await getDb();
        let user = await db.collection('users').findOne({ googleSub: payload.sub });
        if (!user) {
          if (await db.collection('users').findOne({ email: email(payload.email) })) fail(409, 'This email already has an account. Please sign in with its password.');
          if (body.role === 'auto') fail(404, 'No account is registered with this Google account yet. Choose Sign Up and select your account type first.');
          if (!['customer', 'rider', 'fleet'].includes(body.role)) fail(403, 'Ask an administrator to provision your account.');
          user = { email: email(payload.email), googleSub: payload.sub, name: text(payload.name) || email(payload.email), role: body.role, verificationStatus: 'pending', createdAt: new Date() };
          await db.collection('users').insertOne(user);
        }
        if (body.role === 'auto') {
          if (user.role === 'admin') fail(403, 'Use your administrator email address and password to sign in.');
          const registeredRoles = [...new Set([user.role, ...(user.googleRoles || [])])].filter(role => ['customer', 'rider', 'fleet'].includes(role));
          if (!registeredRoles.length) fail(403, 'No supported account type is registered.');
          if (registeredRoles.length > 1) return send(res, 200, { roles: registeredRoles });
          return await startSession(db, req, res, user, registeredRoles[0]);
        }
        const role = body.role || user.role;
        if (role !== user.role && !user.googleRoles?.includes(role)) {
          if (body.intent !== 'signup' || user.role === 'admin' || !['customer', 'rider', 'fleet'].includes(role)) fail(403, 'This account type is not registered for your Google account. Use its sign-up page first.');
          // Google proves ownership; explicit sign-up adds a public role without
          // changing existing roles or the role of any other active session.
          await db.collection('users').updateOne({ _id: user._id }, { $addToSet: { googleRoles: role } });
        }
        return await startSession(db, req, res, user, role);
      }
    } catch (error) {
      if (res.headersSent) return res.end();
      if (error.code === 11000) return send(res, 409, { error: 'An account with this email or mobile number already exists.' });
      send(res, error.status || 503, { error: error.status ? error.message : 'Cannot connect to the account service. Please try again shortly.' });
    }
  };
  middleware.close = async () => { await client?.close(); };
  return middleware;
}
