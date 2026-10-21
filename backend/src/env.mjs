import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { setServers } from 'node:dns';

export function mongoUriFromEnv(env) {
  const uri = env.MONGODB_URI || '';
  if (!env.MONGODB_PASSWORD) return uri;
  const password = encodeURIComponent(env.MONGODB_PASSWORD);
  if (uri.includes('<db_password>')) return uri.replace('<db_password>', password);
  return uri.replace(/^(mongodb(?:\+srv)?:\/\/[^:@/]+:)[^@]*(@)/, (_match, prefix, suffix) => prefix + password + suffix);
}

export function loadServerEnv() {
  let local = {};
  try { local = parseEnv(readFileSync(new URL('../.env', import.meta.url), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const env = { ...local, ...process.env };
  if (env.MONGODB_DNS_SERVERS) setServers(env.MONGODB_DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean));
  return env;
}
