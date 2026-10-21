import { MongoClient } from 'mongodb';
import { loadServerEnv, mongoUriFromEnv } from '../src/env.mjs';

const env = loadServerEnv();
const uri = mongoUriFromEnv(env);
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
try {
  await client.db(env.MONGODB_DB || 'kadago').command({ ping: 1 });
  console.log('MongoDB connection succeeded.');
} catch (error) {
  if (error.code === 18 || /bad auth|authentication failed|authentication failure/i.test(error.message || '')) console.error('MongoDB rejected the username or password. Update backend/.env.');
  else if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEOUT'].includes(error.code)) console.error('Atlas DNS lookup failed. Check the cluster address and local DNS resolver.');
  else console.error('Atlas is unreachable. Check that the cluster is running, allow this machine in Atlas Network Access, and check firewall/TLS restrictions.');
  process.exitCode = 1;
} finally { await client.close(); }
