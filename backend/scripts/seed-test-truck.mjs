// Explicit development fixture. Run manually; never runs during app startup.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { MongoClient, ObjectId } from 'mongodb';
import { loadServerEnv, mongoUriFromEnv } from '../src/env.mjs';
import { createBookingsApi } from '../src/bookings.mjs';
import { operatorStatus } from '../src/operator-applications.mjs';

const fixtureKey = 'kadago-manual-match-test-2026-10-21';
const requestId = 'KG-HR-0DC89ED0';
const driverId = '6ad7d9e2f6956d218cc3d6a2';
const plate = 'KDG 1001';
const env = loadServerEnv();
const client = new MongoClient(mongoUriFromEnv(env), { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
let server;
const temporaryCollections = [];
try {
  const db = client.db(env.MONGODB_DB || 'kadago');
  const users = db.collection('users'), trucks = db.collection('trucks'), applications = db.collection('operatorApplications');
  const applicationId = `${driverId}-rider`;
  const booking = await db.collection('bookings').findOne({ requestId });
  const driver = await users.findOne({ _id: new ObjectId(driverId), role: 'rider' });
  assert.ok(driver, 'Expected registered driver not found. No fixture created.');
  const existingTruck = await trucks.findOne({ plate });
  const existingApplication = await applications.findOne({ _id: applicationId });

  if (process.argv.includes('--remove')) {
    assert.ok(!existingTruck || existingTruck.testFixtureKey === fixtureKey, 'Truck is not this test fixture.');
    assert.ok(!existingApplication || existingApplication.testFixtureKey === fixtureKey, 'Application is not this test fixture.');
    const fixtureTrucks = await trucks.find({ ownerId: driverId, testFixtureKey: fixtureKey }).toArray();
    const active = await db.collection('bookings').findOne({ activeTruckId: { $in: fixtureTrucks.map(t => t._id.toString()) } });
    assert.ok(!active, 'A sample truck has an active assignment; complete or cancel it before removal.');
    await trucks.deleteMany({ ownerId: driverId, testFixtureKey: fixtureKey, _id: { $in: fixtureTrucks.map(t => t._id) } });
    if (existingApplication) await applications.deleteOne({ _id: applicationId, testFixtureKey: fixtureKey });
    console.log('Removed only this sample inventory and its test application. Driver account retained.');
  } else {
    assert.ok(booking && !booking.assignment && booking.dispatch.status === 'review' && !booking.dispatch.cancelled, 'The target request must still be unassigned and awaiting review.');
    assert.ok(!existingTruck || existingTruck.testFixtureKey === fixtureKey && existingTruck.ownerId === driverId, 'Plate belongs to a different record.');
    assert.ok(!existingApplication || existingApplication.testFixtureKey === fixtureKey, 'A real driver application exists; it will not be replaced.');
    assert.ok(booking.request.weightKg <= 1000, 'Test truck capacity insufficient.');
    assert.ok(booking.request.pickup.province.toLowerCase() === 'bukidnon' && booking.request.delivery.province.toLowerCase() === 'bukidnon', 'Request is outside the test service area.');
    const now = new Date().toISOString();
    const vehicle = {
      ownerId: driverId, business: 'KadaGo Hauling Services', driver: driver.name,
      truck: 'Isuzu Elf Closed Van', bodyType: 'Closed Van', plate,
      payloadKg: 1000, areas: ['Malaybalay', 'Bukidnon'], equipment: [],
      verified: true, available: true, isTestData: true, testFixtureKey: fixtureKey,
      verificationNote: 'Synthetic truck verified only for a user-requested development test. No real vehicle or documents verified.',
      createdAt: now,
    };
    assert.equal(booking.request.equipment.length, 0, 'Request now needs equipment; review the test fixture first.');
    const inserted = await trucks.updateOne({ plate, testFixtureKey: fixtureKey }, { $setOnInsert: vehicle }, { upsert: true });
    const truck = await trucks.findOne({ plate, testFixtureKey: fixtureKey });
    const application = {
      userId: driverId, role: 'rider', email: driver.email,
      profile: { name: driver.name, businessName: vehicle.business, phone: '', address: '[TEST] Malaybalay, Bukidnon', emergencyContact: '', emergencyPhone: '' },
      truck: { make: vehicle.truck, bodyType: vehicle.bodyType, plate, payloadKg: vehicle.payloadKg, serviceAreas: vehicle.areas.join(', '), orcr: '[TEST] No real OR/CR verified' },
      truckId: truck._id.toString(), documents: [], status: 'approved', version: 1,
      feedback: '[TEST DATA] User-authorized test approval for matching and assignment testing only. No identity or vehicle documents were submitted or verified.',
      submittedAt: now, reviewedAt: now, reviewedBy: 'manual-test-fixture',
      isTestData: true, testFixtureKey: fixtureKey,
    };
    try {
      await applications.updateOne({ _id: applicationId, testFixtureKey: fixtureKey }, { $setOnInsert: application }, { upsert: true });
    } catch (error) {
      if (inserted.upsertedCount) await trucks.deleteOne({ _id: truck._id, testFixtureKey: fixtureKey });
      throw error;
    }

    // Read inventory using the real API, then approve a disposable copy of the
    // request. The original request is never approved or updated by this script.
    const prefix = `match_check_${randomBytes(6).toString('hex')}_`;
    const testDb = { collection(name) {
      if (['bookings', 'attachments'].includes(name)) {
        const collectionName = `${prefix}${name}`;
        if (!temporaryCollections.includes(collectionName)) temporaryCollections.push(collectionName);
        return db.collection(collectionName);
      }
      return db.collection(name);
    } };
    const admin = await users.findOne({ role: 'admin' });
    assert.ok(admin, 'Admin account needed to run the approval check.');
    let actor = admin;
    const api = createBookingsApi({ getDb: async () => testDb, getUser: async () => actor, checkMutation: () => {} });
    server = createServer((req, res) => { void api(req, res, () => { res.writeHead(404); res.end(); }); });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api/`;
    const inventoryResponse = await fetch(`${base}trucks`);
    assert.equal(inventoryResponse.status, 200);
    const { trucks: inventory } = await inventoryResponse.json();
    const compiled = ts.transpileModule(readFileSync(new URL('../../frontend/src/data/dispatchData.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const matching = { exports: {} }; runInNewContext(compiled, { module: matching, exports: matching.exports });
    const candidates = inventory.filter(t => !(booking.assignmentDeclines || []).some(d => d.truckId === t.id || d.operatorId === t.ownerId));
    const matches = matching.exports.registeredTruckMatches(candidates, booking.request);
    assert.ok(matches.some(m => m.truckId === truck._id.toString()), 'Test truck was excluded by the actual matching rules.');
    const clone = { ...booking, _id: new ObjectId(), requestId: 'TEST-MATCH-APPROVAL', submissionKey: `${prefix}request`, events: [...booking.events] };
    await testDb.collection('bookings').insertOne(clone);
    const approvedResponse = await fetch(`${base}bookings/${clone._id}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: clone.version, patch: { status: 'approved' }, truckId: truck._id.toString() }) });
    const approved = await approvedResponse.json();
    assert.equal(approvedResponse.status, 200, JSON.stringify(approved));
    assert.equal(approved.booking.assignment.plate, plate);
    actor = { ...driver, verificationStatus: await operatorStatus(db, driver, 'rider') };
    const driverResponse = await fetch(`${base}bookings`);
    assert.equal(driverResponse.status, 200);
    assert.ok((await driverResponse.json()).bookings.some(b => b.id === clone._id.toString()), 'Assigned booking not visible to driver.');
    const unchanged = await db.collection('bookings').findOne({ _id: booking._id });
    assert.equal(unchanged.version, booking.version, 'Original request changed during testing.');
    assert.equal(unchanged.assignment, null);
    console.log(JSON.stringify({ result: 'Test truck saved; real API inventory, frontend matching, approval on disposable request, and driver visibility passed.', plate, truck: vehicle.truck, capacityKg: vehicle.payloadKg, driver: driver.name, operatorStatus: actor.verificationStatus, requestId, originalRequestStatus: unchanged.dispatch.status, originalRequestUnchanged: true, testData: true }, null, 2));
  }
} catch (error) {
  console.error(`Test fixture setup/check failed: ${error.code || error.name}: ${error.name === 'AssertionError' ? error.message : 'Check the database connection or fixture state.'}`);
  process.exitCode = 1;
} finally {
  if (server) await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
  for (const name of temporaryCollections) {
    assert.match(name, /^match_check_[a-f0-9]{12}_(bookings|attachments)$/);
    await client.db(env.MONGODB_DB || 'kadago').collection(name).drop().catch(error => { if (error.code !== 26) throw error; });
  }
  await client.close();
}
