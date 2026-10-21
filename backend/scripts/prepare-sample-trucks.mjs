// User-requested sample inventory. Never run automatically at startup.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { MongoClient, ObjectId } from 'mongodb';
import { loadServerEnv, mongoUriFromEnv } from '../src/env.mjs';

const fixtureKey = 'kadago-manual-match-test-2026-10-21';
const ownerId = '6ad7d9e2f6956d218cc3d6a2';
const business = 'KadaGo Hauling Services';
const env = loadServerEnv();
const client = new MongoClient(mongoUriFromEnv(env), { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
try {
 const db = client.db(env.MONGODB_DB || 'kadago');
 const trucks = db.collection('trucks'), applications = db.collection('operatorApplications');
 const app = await applications.findOne({ _id: `${ownerId}-rider`, testFixtureKey: fixtureKey, status: 'approved' });
 const driver = await db.collection('users').findOne({ _id: new ObjectId(ownerId), role: 'rider' });
 assert.ok(app && driver, 'Expected sample application and registered driver are required.');
 const primary = await trucks.findOne({ _id: new ObjectId(app.truckId), ownerId, testFixtureKey: fixtureKey });
 assert.ok(primary, 'Original sample truck not found.');
 const specs = [
  { plate: 'KDG 1001', truck: 'Isuzu Elf Closed Van', bodyType: 'Closed Van', payloadKg: 1000 },
  { plate: 'KDG 1002', truck: 'Isuzu Forward Wing Van', bodyType: 'Wing Van', payloadKg: 3000 },
  { plate: 'KDG 1003', truck: 'Mitsubishi Canter Closed Van', bodyType: 'Closed Van', payloadKg: 2000 },
 ];
 // Check all plate collisions before changing any records.
 for (let i = 0; i < specs.length; i++) {
  const existing = await trucks.findOne({ plate: specs[i].plate });
  assert.ok(!existing || existing.testFixtureKey === fixtureKey && existing.ownerId === ownerId && (i !== 0 || existing._id.equals(primary._id)), 'A sample plate belongs to a different vehicle.');
 }
 const now = new Date().toISOString();
 const saved = [];
 for (let i = 0; i < specs.length; i++) {
  const spec = specs[i];
  if (i === 0) {
   await trucks.updateOne({ _id: primary._id, testFixtureKey: fixtureKey }, { $set: { truck: spec.truck, plate: spec.plate, business, isTestData: true } });
  } else {
   await trucks.updateOne({ plate: spec.plate, testFixtureKey: fixtureKey, ownerId }, { $setOnInsert: {
    ...spec, ownerId, driver: driver.name, business, verified: true, available: true,
    areas: ['Malaybalay', 'Bukidnon'], equipment: [], createdAt: now,
    isTestData: true, testFixtureKey: fixtureKey,
    verificationNote: 'Synthetic sample vehicle for user-authorized development testing. No real vehicle or documents verified.',
   } }, { upsert: true });
  }
  const truck = await trucks.findOne({ plate: spec.plate, testFixtureKey: fixtureKey, ownerId });
  saved.push(truck);
  // Booking snapshots retain their assignment and status; only display names change.
  await db.collection('bookings').updateMany({ 'assignment.id': truck._id.toString(), $or: [
   { 'assignment.truck': { $ne: truck.truck } }, { 'assignment.plate': { $ne: truck.plate } }, { 'assignment.business': { $ne: business } },
  ] }, { $set: { 'assignment.truck': truck.truck, 'assignment.plate': truck.plate, 'assignment.business': business, 'assignment.isTestData': true, 'assignment.testFixtureKey': fixtureKey, updatedAt: now }, $inc: { version: 1 } });
 }
 await applications.updateOne({ _id: app._id, testFixtureKey: fixtureKey }, { $set: {
  'profile.businessName': business, 'truck.make': specs[0].truck, 'truck.plate': specs[0].plate, isTestData: true,
 } });
 const source = ts.transpileModule(readFileSync(new URL('../../frontend/src/data/dispatchData.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
 const matching = { exports: {} }; runInNewContext(source, { module: matching, exports: matching.exports });
 const booking = await db.collection('bookings').findOne({ requestId: 'KG-HR-0DC89ED0' });
 assert.ok(booking, 'Target request not found.');
 const summary = [];
 for (const truck of saved) {
  const active = await db.collection('bookings').findOne({ activeTruckId: truck._id.toString() });
  const inventory = { ...truck, id: truck._id.toString(), operatorApproved: true, hasActiveAssignment: !!active };
  const matches = matching.exports.registeredTruckMatches([inventory], booking.request);
  assert.ok(active || matches.length === 1, 'Available sample truck failed matching.');
  assert.ok(!/test/i.test(`${truck.truck} ${truck.plate} ${truck.business}`), 'Display label still contains TEST.');
  assert.equal(truck.isTestData, true);
  summary.push({ truck: truck.truck, plate: truck.plate, capacityKg: truck.payloadKg, availableForMatching: matches.length === 1, activeAssignment: !!active, sampleData: true });
 }
 assert.equal(await trucks.countDocuments({ ownerId, testFixtureKey: fixtureKey }), 3);
 console.log(JSON.stringify({ business, driver: driver.name, trucks: summary, totalSampleTrucks: 3, bookingStatus: booking.dispatch.status, message: 'Saved three sample trucks with normal display names. Existing assignments retained; no bookings approved by this script.' }, null, 2));
} catch (error) {
 console.error(error.name === 'AssertionError' ? error.message : `Sample inventory operation failed (${error.code || error.name}).`);
 process.exitCode = 1;
} finally { await client.close(); }
