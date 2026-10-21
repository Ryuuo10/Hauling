import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mongoUriFromEnv } from '../src/env.mjs';

test('separate database password replaces a stale password embedded in the URI', () => {
  const uri = mongoUriFromEnv({ MONGODB_URI: 'mongodb+srv://test-user:old-password@cluster.example.test/?authSource=admin', MONGODB_PASSWORD: 'new-password' });
  const parsed = new URL(uri);
  assert.equal(parsed.password, 'new-password');
  assert.equal(parsed.username, 'test-user');
  assert.equal(parsed.hostname, 'cluster.example.test');
  assert.equal(parsed.searchParams.get('authSource'), 'admin');
});

test('placeholder passwords are substituted and special characters are encoded', () => {
  const password = 'a@b:#/%secret';
  const uri = mongoUriFromEnv({ MONGODB_URI: 'mongodb+srv://test-user:<db_password>@cluster.example.test/', MONGODB_PASSWORD: password });
  assert.equal(decodeURIComponent(new URL(uri).password), password);
});

test('URI-only credentials remain supported when no separate password is configured', () => {
  const uri = 'mongodb+srv://test-user:existing-password@cluster.example.test/';
  assert.equal(mongoUriFromEnv({ MONGODB_URI: uri }), uri);
});
