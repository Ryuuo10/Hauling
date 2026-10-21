import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../../frontend/src/data/dispatchData.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const module = { exports: {} };
runInNewContext(compiled, { module, exports: module.exports });
const data = module.exports;
const request = { weightKg: 1200, pickup: { city: 'Malaybalay', province: 'Bukidnon' }, delivery: { city: 'Cagayan de Oro', province: 'Misamis Oriental' }, equipment: ['Tarp'], truckType: 'Wing Van' };
const truck = { id: 'real-truck', business: 'Registered Operator', driver: 'Real Driver', truck: 'Isuzu Wing Van', plate: 'REAL 123', bodyType: 'Wing Van', payloadKg: 3000, areas: ['Bukidnon', 'Cagayan de Oro'], equipment: ['Tarp'], verified: true, available: true, operatorApproved: true, hasActiveAssignment: false };

test('only real verified, approved, available trucks satisfying capacity, route and equipment are suggested', () => {
  const matches = data.registeredTruckMatches([truck], request);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].truckId, truck.id);
  assert.equal(matches[0].level, 'highly');
  for (const change of [
    { id: undefined }, { verified: false }, { operatorApproved: false }, { operatorApproved: undefined },
    { available: false }, { hasActiveAssignment: true }, { payloadKg: 1000 },
    { areas: ['Bukidnon'] }, { areas: ['Cagayan de Oro'] }, { areas: [''] }, { equipment: [] },
  ]) assert.equal(data.registeredTruckMatches([{ ...truck, ...change }], request).length, 0, JSON.stringify(change));
});

test('recommendations prefer the requested body type, then the smallest sufficient capacity', () => {
  const matches = data.registeredTruckMatches([
    { ...truck, id: 'large', payloadKg: 15000 },
    { ...truck, id: 'other-body', bodyType: 'Dropside', payloadKg: 2000 },
    { ...truck, id: 'small', payloadKg: 2000 },
  ], request);
  assert.equal(matches[0].truckId, 'small');
  assert.equal(matches[1].truckId, 'large');
  assert.equal(matches[2].truckId, 'other-body');
  assert.equal(matches[2].level, 'suitable');
});

test('empty inventory never falls back to demo operators and assigned trucks remain visible', () => {
  const booking = { requestId: 'REAL-REQUEST', bookingId: null, customer: 'Real Customer', representative: 'Contact', request: { ...request, category: 'agri', cargo: 'Rice', quantity: '20 sacks', scheduledAt: new Date(Date.now() + 86400000).toISOString(), handling: [], loading: '', unloading: '', helpers: false, budget: null }, assignment: null, dispatch: data.INITIAL_DISPATCH, quotes: [], events: [] };
  data.syncDispatchData(booking, [truck]);
  assert.equal(data.MATCHES[0].business, truck.business);
  data.syncDispatchData(booking, []);
  assert.equal(data.MATCHES[0].truckId, undefined);
  assert.equal(data.MATCHES[0].business, 'No suitable truck available');
  assert.equal(data.REQ.customer, 'Real Customer');
  const assigned = data.registeredTruckMatches([{ ...truck, available: false, hasActiveAssignment: true }], request, true);
  assert.equal(assigned[0].truckId, truck.id);
});

test('monthly earnings count verified receipts in their received month without demo totals or double counting a full deposit', () => {
  const now = new Date('2026-10-21T12:00:00Z');
  const make = (pay, depositRecords = [], deposit = 0) => ({ dispatch: { ...data.INITIAL_DISPATCH, finalRate: 10000, pay, deposit }, depositRecords });
  const base = { method: 'Bank Transfer', ref: 'TEST', date: '2026-10-20', status: 'Paid', amount: 8000, verifiedAt: '2026-10-21T00:00:00Z' };
  assert.equal(data.monthlyPayments([], now), 0);
  assert.equal(data.monthlyPayments([
    make(base, [{ amount: 2000, verifiedAt: '2026-09-30T00:00:00Z' }], 2000),
    make({ ...base, amount: 6000, status: 'Pending Verification' }),
    make({ ...base, amount: 3000, status: 'Rejected' }),
    make({ ...base, amount: 0, method: 'Verified Deposit' }, [{ amount: 10000, verifiedAt: '2026-10-15T00:00:00Z' }], 10000),
  ], now), 18000);
});
