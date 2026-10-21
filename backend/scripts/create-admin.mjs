import { MongoClient } from 'mongodb';
import { hashPassword } from '../src/auth.mjs';
import { loadServerEnv, mongoUriFromEnv } from '../src/env.mjs';

const env = loadServerEnv();
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 12) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in backend/.env before provisioning an administrator.');
  process.exit(1);
}
const uri = mongoUriFromEnv(env);
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  const users = client.db(env.MONGODB_DB || 'kadago').collection('users');
  await users.createIndex({ email: 1 }, { unique: true });
  const result = await users.updateOne({ email: env.ADMIN_EMAIL.trim().toLowerCase() }, { $setOnInsert: { name: env.ADMIN_NAME || 'KadaGo Administrator', role: 'admin', passwordHash: await hashPassword(env.ADMIN_PASSWORD), createdAt: new Date(), verificationStatus: 'approved' } }, { upsert: true });
  console.log(result.upsertedCount ? 'Administrator created. Remove ADMIN_PASSWORD from backend/.env now.' : 'An account with this email already exists; its role and password were not changed.');
} catch { console.error('Administrator creation failed. Check the database connection and Atlas network access.'); process.exitCode = 1; }
finally { await client.close(); }
