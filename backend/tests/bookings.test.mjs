import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ObjectId } from 'mongodb';
import { createBookingsApi } from '../src/bookings.mjs';

function memoryDb() {
  const data = new Map();
  const matches = (record, query) => Object.entries(query).every(([key, value]) => {
    const values = key.split('.').reduce((items, part) => items.flatMap(item => Array.isArray(item) ? item.map(entry => entry?.[part]) : [item?.[part]]), [record]).flat();
    if (value && typeof value === 'object' && '$ne' in value) return values.every(actual => String(actual) !== String(value.$ne));
    if (value && typeof value === 'object' && '$gte' in value) return values.some(actual => actual >= value.$gte);
    return values.some(actual => String(actual) === String(value));
  });
  return { collection(name) {
    if (!data.has(name)) data.set(name, []);
    const rows = data.get(name);
    return {
      rows,
      async createIndexes() {},
      async findOne(query) { return rows.find(row => matches(row, query)) || null; },
      async countDocuments(query) { return rows.filter(row => matches(row, query)).length; },
      find(query = {}) { return { sort() { return this; }, limit() { return this; }, async toArray() { return rows.filter(row => matches(row, query)); } }; },
      async insertOne(row) { row._id ||= new ObjectId(); rows.push(row); return { insertedId: row._id }; },
      async updateOne(query, change) { const row = rows.find(item => matches(item, query)); if (!row) return { modifiedCount: 0 }; Object.assign(row, change.$set || {}); if (change.$inc) for (const [key, n] of Object.entries(change.$inc)) row[key] += n; return { modifiedCount: 1 }; },
    };
  } };
}

async function setup(t, role = 'customer') {
  const db = memoryDb();
  const user = { _id: new ObjectId(), id: '', email: 'customer@example.test', name: 'Test Customer', role, profile: { businessName: 'Test Business' } };
  user.id = user._id.toString();
  const api = createBookingsApi({ getDb: async () => db, getUser: async () => user, checkMutation: () => {} });
  const server = createServer((req, res) => { void api(req, res); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}/api/`;
  const future = new Date(Date.now() + 86400000).toISOString();
  const request = { category: 'construction', pickup: { address: 'Depot 1', city: 'Cebu City', province: 'Cebu', contact: 'Sender', phone: '+639171234567' }, delivery: { address: 'Warehouse 2', city: 'Mandaue City', province: 'Cebu', contact: 'Receiver', phone: '+639181234567' }, cargo: 'Steel bars', quantity: '20 pieces', weightKg: 1200, truckType: 'Wing Van', scheduledAt: future, deliveryAt: null, handling: [], equipment: [], loading: '', unloading: '', dimensions: '', helpers: false, flexible: false, budget: null, notes: '', photos: [] };
  return { db, user, base, request };
}

test('truck matching metadata reflects approval and active assignments, and the server rejects unsafe assignments', async t => {
  const { db, user, base, request } = await setup(t, 'admin');
  const ownerId = new ObjectId().toString();
  const vehicle = { _id: new ObjectId(), ownerId, business: 'Real Operator', driver: 'Real Driver', truck: 'Wing Van', plate: 'REAL 1234', bodyType: 'Wing Van', payloadKg: 3000, areas: ['Cebu'], equipment: [], verified: true, available: true };
  await db.collection('trucks').insertOne(vehicle);
  const inventory = async () => (await (await fetch(base + 'trucks')).json()).trucks[0];
  assert.equal((await inventory()).operatorApproved, false);
  assert.equal((await inventory()).hasActiveAssignment, false);
  const create = async key => {
    user.role = 'customer';
    const response = await fetch(base + 'bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionKey: key, request }) });
    user.role = 'admin';
    assert.equal(response.status, 201);
    return (await response.json()).booking;
  };
  const approve = booking => fetch(`${base}bookings/${booking.id}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: booking.version, patch: { status: 'approved' }, truckId: vehicle._id.toString() }) });
  const first = await create('real-match-1');
  assert.equal((await approve(first)).status, 409);
  await db.collection('operatorApplications').insertOne({ _id: `${ownerId}-rider`, status: 'approved' });
  assert.equal((await inventory()).operatorApproved, true);
  const approved = await approve(first);
  assert.equal(approved.status, 200, JSON.stringify(await approved.clone().json()));
  assert.equal((await approved.json()).booking.assignment.id, vehicle._id.toString());
  assert.equal((await inventory()).hasActiveAssignment, true);
  const second = await create('real-match-2');
  assert.equal((await approve(second)).status, 409);
});

test('customer request is saved to their account and an identical retry does not duplicate it', async t => {
  const { db, base, request } = await setup(t);
  const post = () => fetch(base + 'bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionKey: 'retry-key-1', request }) });
  const first = await post(), second = await post();
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  const { booking } = await first.json();
  assert.match(booking.requestId, /^KG-HR-/);
  assert.equal(booking.request.cargo, 'Steel bars');
  assert.equal(booking.dispatch.status, 'review');
  assert.equal(db.collection('bookings').rows.length, 1);
});

test('request validation rejects past schedules and invalid phone numbers', async t => {
  const { base, request } = await setup(t);
  for (const invalid of [{ ...request, scheduledAt: '2020-01-01T00:00:00Z' }, { ...request, pickup: { ...request.pickup, phone: '12345' } }]) {
    const response = await fetch(base + 'bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionKey: crypto.randomUUID(), request: invalid }) });
    assert.equal(response.status, 400);
  }
});

test('non-customer accounts cannot submit hauling requests', async t => {
  const { base, request } = await setup(t, 'rider');
  const response = await fetch(base + 'bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionKey: 'operator-key', request }) });
  assert.equal(response.status, 403);
});

test('SOS alerts are saved with their reason and visible to Dispatch as persistent notifications', async t => {
  const { db, user, base, request } = await setup(t);
  await db.collection('users').insertOne(user);
  const created = await fetch(base + 'bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionKey: 'sos-test', request }) });
  const { booking } = await created.json();
  const savedBooking = db.collection('bookings').rows[0];
  savedBooking.dispatch.status = 'booked';

  const sos = await fetch(`${base}bookings/${booking.id}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: 1, patch: { customerSOS: 'active', customerSOSReason: 'Road accident' } }) });
  assert.equal(sos.status, 200);
  assert.equal((await sos.json()).booking.dispatch.customerSOSReason, 'Road accident');
  assert.equal(savedBooking.events.at(-1).label, 'SOS Dispatch Alert');

  const adminId = new ObjectId();
  await db.collection('users').insertOne({ _id: adminId, role: 'admin', name: 'Test Admin' });
  user._id = adminId;
  user.role = 'admin';
  const unread = await fetch(base + 'notifications');
  const { notifications } = await unread.json();
  const alert = notifications.find(item => item.target === 'sos');
  assert.ok(alert);
  assert.match(alert.body, /Road accident/);
  assert.equal(alert.read, false);

  const marked = await fetch(base + 'notifications/read', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(marked.status, 200);
  const read = await fetch(base + 'notifications');
  assert.equal((await read.json()).notifications.find(item => item.id === alert.id).read, true);
});


test('profile edits and notification preferences persist without replacing sign-in identity', async t => {
  const { db, user, base } = await setup(t);
  await db.collection('users').insertOne(user);
  const first = await fetch(base + 'profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessName: 'North Star Cargo', businessType: 'Logistics', contactName: 'Taylor Customer', contactPhone: '09171234567', address: 'Cebu City', notificationSettings: { bookings: false, trips: true, payments: false } }) });
  assert.equal(first.status, 200);
  const saved = (await first.json()).profile;
  assert.equal(saved.name, 'Test Customer');
  assert.equal(saved.email, 'customer@example.test');
  assert.equal(saved.businessName, 'North Star Cargo');
  assert.deepEqual(saved.notificationSettings, { bookings: false, trips: true, payments: false });
  const prefs = await fetch(base + 'profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationSettings: { bookings: true, trips: false, payments: true } }) });
  assert.equal(prefs.status, 200);
  const updated = (await prefs.json()).profile;
  assert.equal(updated.name, 'Test Customer');
  assert.equal(updated.businessName, 'North Star Cargo');
  assert.equal(updated.address, 'Cebu City');
  assert.deepEqual(updated.notificationSettings, { bookings: true, trips: false, payments: true });
  assert.equal(user.profile.contactName, 'Taylor Customer');
});


test('live GPS is limited to the assigned operator and customer booking, and can be stopped', async t => {
  const { db, user, base, request } = await setup(t);
  const created = await fetch(base + 'bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionKey: 'gps-test', request }) });
  assert.equal(created.status, 201);
  const { booking } = await created.json();
  const record = db.collection('bookings').rows[0];
  const customerId = user._id.toString();
  const operatorId = new ObjectId();
  record.operatorId = operatorId.toString();
  record.dispatch.status = 'booked';
  record.dispatch.tripStage = 'enroute';
  user._id = operatorId;
  user.role = 'rider';
  user.verificationStatus = 'approved';

  const update = await fetch(`${base}bookings/${booking.id}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharing: true, latitude: 35.6895, longitude: 139.6917, accuracy: 12, heading: 90, speed: 4 }) });
  assert.equal(update.status, 200);
  assert.equal((await update.json()).liveLocation.longitude, 139.6917);
  const invalid = await fetch(`${base}bookings/${booking.id}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharing: true, latitude: 91, longitude: 139, accuracy: 12 }) });
  assert.equal(invalid.status, 400);

  user._id = new ObjectId();
  const unrelated = await fetch(`${base}bookings/${booking.id}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharing: true, latitude: 1, longitude: 1, accuracy: 5 }) });
  assert.equal(unrelated.status, 404);

  user._id = ObjectId.createFromHexString(customerId);
  user.role = 'customer';
  const visibleToCustomer = await fetch(base + 'bookings');
  assert.equal((await visibleToCustomer.json()).bookings[0].liveLocation.latitude, 35.6895);
  user._id = operatorId;
  user.role = 'rider';
  const stopped = await fetch(`${base}bookings/${booking.id}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharing: false }) });
  assert.equal(stopped.status, 200);
  assert.equal((await stopped.json()).liveLocation, null);
  assert.equal(record.liveLocation, null);
});

// Real HTTP handlers with isolated storage: no production accounts or bookings are changed.
async function workflow(t) {
  const fixture = await setup(t);
  const { db, user, base, request } = fixture;
  const identities = { customer: user._id, rider: new ObjectId(), admin: new ObjectId() };
  const actor = role => { user.role = role; user._id = identities[role]; user.id = user._id.toString(); user.verificationStatus = 'approved'; };
  let booking;
  async function post(path, payload, expected = 200) {
    const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    assert.equal(response.status, expected, `${path}: ${JSON.stringify(result)}`);
    if (result.booking) booking = result.booking;
    return result;
  }
  const patch = (p, expected = 200) => post(`bookings/${booking.id}/patch`, { version: booking.version, patch: p }, expected);
  const action = (route, payload, expected = 200) => post(`bookings/${booking.id}/${route}`, { version: booking.version, ...payload }, expected);
  await post('bookings', { submissionKey: crypto.randomUUID(), request }, 201);
  const truck = { _id: new ObjectId(), ownerId: identities.rider.toString(), business: 'Workflow Operator', driver: 'Workflow Driver', truck: 'Wing Van', plate: 'FLOW 1234', bodyType: 'Wing Van', payloadKg: 3000, areas: ['Cebu'], equipment: [], verified: true, available: true };
  await db.collection('trucks').insertOne(truck);
  await db.collection('operatorApplications').insertOne({ _id: `${truck.ownerId}-rider`, status: 'approved' });
  const assign = async (vehicle = truck, expected = 200) => { actor('admin'); return post(`bookings/${booking.id}/patch`, { version: booking.version, patch: { status: 'approved' }, truckId: vehicle._id.toString() }, expected); };
  const quote = (rate = 10000, deposit = 0) => action('quote', { rate, deposit, included: ['Driver', 'Fuel'], separate: 'No additional charges', terms: 'Balance after confirmed delivery' });
  const prepare = async (deposit = 0) => {
    await assign(); actor('rider'); await patch({ status: 'confirmed' });
    actor('admin'); await patch({ proposedRate: 10000 });
    actor('rider'); await patch({ rateStage: 'confirmed' });
    actor('admin'); await patch({ rateStage: 'finalized', finalRate: 10000, status: 'confirmed' });
    await patch({ requiredDeposit: deposit }); await quote(10000, deposit);
  };
  const book = async () => { actor('customer'); await patch({ status: 'accepted' }); await patch({ agreement: 'operator', agreementUpdate: false }); actor('rider'); await patch({ status: 'booked' }); };
  const upload = async name => (await post('attachments', { bookingId: booking.id, name, data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2V8AAAAASUVORK5CYII=' }, 201)).id;
  const deliver = async () => {
    actor('rider');
    await patch({ tripStage: 'enroute' }); await patch({ tripStage: 'arrived' }); await patch({ tripStage: 'loading' });
    await patch({ tripStage: 'loaded' }, 409);
    const photo = { id: 1, attachmentId: await upload('pickup.png'), label: 'Pickup' };
    await patch({ pickup: { photos: [photo], qty: 20, condition: 'Good Condition', weight: '1200 kg' }, tripStage: 'loaded' });
    await patch({ tripStage: 'transit' }); await patch({ tripStage: 'destination' }); await patch({ tripStage: 'handover' });
    await patch({ tripStage: 'delivered' }, 409);
    await patch({ delivery: { photos: [{ ...photo, attachmentId: await upload('delivery.png') }], qty: 20, condition: 'Good Condition', receiver: 'Receiver', receiverRole: '', ack: 'Received' }, tripStage: 'delivered' });
  };
  return { ...fixture, actor, identities, truck, assign, patch, action, quote, prepare, book, upload, deliver, get booking() { return booking; } };
}

test('operator decline releases the truck, preserves private history and permits a different approved assignment', async t => {
  const w = await workflow(t);
  await w.assign(); w.actor('rider');
  await w.patch({ status: 'suggested', declineReason: 'Schedule', declineNote: '' }, 400);
  await w.patch({ status: 'suggested', declineReason: 'Schedule', declineNote: 'Already committed that day' });
  assert.equal(w.booking.operatorId, null); assert.equal(w.booking.assignment, null);
  assert.equal(w.db.collection('bookings').rows[0].activeTruckId, null);
  const history = await (await fetch(w.base + 'bookings')).json();
  assert.equal(history.bookings.length, 0);
  assert.equal(history.declinedAssignments[0].note, 'Already committed that day');
  await w.patch({ status: 'confirmed' }, 404);
  await w.assign(w.truck, 409);
  const sameOperator = { ...w.truck, _id: new ObjectId(), plate: 'SAME 4567' };
  await w.db.collection('trucks').insertOne(sameOperator);
  await w.assign(sameOperator, 409);
  const next = { ...w.truck, _id: new ObjectId(), ownerId: new ObjectId().toString(), plate: 'NEXT 5678' };
  await w.db.collection('trucks').insertOne(next);
  await w.db.collection('operatorApplications').insertOne({ _id: `${next.ownerId}-rider`, status: 'approved' });
  await w.assign(next);
  assert.equal(w.booking.assignment.id, next._id.toString());
  w.actor('customer'); assert.equal((await (await fetch(w.base + 'bookings')).json()).declinedAssignments.length, 0);
});

test('positive proposed rates, review responses and declined quotation revisions follow the screen payloads', async t => {
  const w = await workflow(t); await w.assign(); w.actor('rider'); await w.patch({ status: 'confirmed' });
  await w.patch({ rateStage: 'confirmed' }, 409);
  w.actor('admin'); await w.patch({ proposedRate: 0 }, 400); await w.patch({ proposedRate: 10000 });
  await w.patch({ rateStage: 'finalized', finalRate: 10000, status: 'confirmed' }, 409);
  w.actor('rider'); await w.patch({ rateStage: 'review', requestedRate: 12000, rateReason: 'Fuel', rateNote: 'Long route' });
  w.actor('admin'); await w.patch({ rateStage: 'finalized', finalRate: 12000, status: 'confirmed' }); await w.quote(12000);
  w.actor('customer'); await w.patch({ status: 'declined', quoteDecline: 'Price' });
  w.actor('admin'); await w.patch({ rateStage: 'finalized', finalRate: 11000, status: 'confirmed' }); await w.quote(11000);
  assert.equal(w.booking.quotes.length, 2); assert.equal(w.booking.quotes[0].status, 'declined');
  assert.equal(w.booking.dispatch.finalRate, 11000); assert.equal(w.booking.dispatch.quoteDecline, null);
});

test('request to completion requires both agreements, real evidence, issue resolution and verified balance payment', async t => {
  const w = await workflow(t); await w.prepare(2000);
  assert.equal(w.booking.dispatch.deposit, 0, 'a requested deposit must not count as received');
  assert.equal(w.booking.dispatch.requiredDeposit, 2000);
  w.actor('rider'); await w.patch({ status: 'booked' }, 409);
  await w.book();
  w.actor('admin'); await w.action('deposit', { amount: 2500, reference: 'TOO-MUCH' }, 400);
  await w.action('deposit', { amount: 2000, reference: 'DEP-001' });
  assert.equal(w.booking.dispatch.deposit, 2000);
  await w.deliver(); w.actor('customer');
  await w.patch({ rating: { stars: 5 } }, 409);
  await w.patch({ issue: { type: 'Quantity', desc: 'Please check the count', photos: [] } });
  await w.patch({ customerConfirm: true }, 409);
  w.actor('admin'); await w.action('resolve-issue', { note: '' }, 400);
  await w.action('resolve-issue', { note: 'Count checked with both parties; all items received.' });
  assert.equal(w.booking.dispatch.issue, null);
  w.actor('customer'); await w.patch({ customerConfirm: true });
  const receiptId = await w.upload('receipt.png');
  const pay = { amount: 8000, method: 'Bank Transfer', ref: 'BAL-001', date: new Date().toISOString().slice(0, 10), receiptId };
  await w.patch({ pay: { ...pay, amount: 10000 } }, 400); await w.patch({ pay });
  assert.equal(w.booking.completed, false); assert.equal(w.booking.dispatch.pay.status, 'Pending Verification');
  w.actor('admin'); await w.patch({ pay: { status: 'Rejected' } });
  w.actor('customer'); await w.patch({ pay: { ...pay, ref: 'BAL-CORRECTED' } });
  await w.patch({ payIssue: { type: 'Receipt concern', note: 'Please verify receipt' } });
  w.actor('rider'); await w.patch({ pay: { status: 'Paid' } });
  assert.equal(w.booking.completed, false, 'unresolved payment issues block completion');
  w.actor('admin'); await w.patch({ payIssue: { status: 'Resolved' } });
  assert.equal(w.booking.completed, true); assert.ok(w.booking.completedAt);
  w.actor('customer'); await w.patch({ rating: { stars: 5, cats: { Communication: 5 }, tags: ['Reliable'], comment: 'Delivered safely' } });
  await w.patch({ rating: { stars: 1 } }, 409);
  assert.equal(w.booking.dispatch.rating.stars, 5);
  const receipt = await fetch(w.base + 'attachments/' + receiptId);
  assert.equal(receipt.status, 200); assert.equal(receipt.headers.get('content-type'), 'image/png');
  const bytes = Buffer.from(await receipt.arrayBuffer());
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(bytes.length, 68, 'the image response must contain only the uploaded bytes');
});

test('a verified full deposit settles payment but never completes before delivery and customer confirmation', async t => {
  const w = await workflow(t); await w.prepare(10000); await w.book();
  w.actor('admin'); await w.action('deposit', { amount: 10000, reference: 'FULL-DEP' });
  assert.equal(w.booking.dispatch.pay.status, 'Paid'); assert.equal(w.booking.completed, false);
  await w.deliver(); assert.equal(w.booking.completed, false);
  w.actor('customer'); await w.patch({ customerConfirm: true }); assert.equal(w.booking.completed, true);
});

test('saved case history and resolution notes survive reloading and enforce Admin permissions', async t => {
  const w = await workflow(t); await w.prepare(); await w.book();
  w.actor('customer'); await w.patch({ issue: { type: 'Cargo Shortage', desc: 'Check one crate', photos: [] } });
  const caseId=w.booking.dispatch.issue.id;
  assert.ok(w.booking.dispatch.issue.createdAt);
  w.actor('rider'); await w.action('resolve-issue', { note: 'Not authorized' }, 403);
  w.actor('admin'); await w.action('resolve-issue', { note: 'Receiver confirmed all crates received.' });
  const rows=await (await fetch(w.base+'bookings')).json();
  const saved=rows.bookings.find(b=>b.id===w.booking.id);
  assert.equal(saved.dispatch.issue,null);assert.equal(saved.resolvedIssues[0].id,caseId);
  assert.equal(saved.resolvedIssues[0].resolution,'Receiver confirmed all crates received.');
  assert.equal(saved.resolvedIssues[0].resolvedBy,w.identities.admin.toString());
  w.actor('customer');await w.patch({ payIssue:{type:'Receipt concern',note:'Please check bank reference'} });
  w.actor('rider');await w.patch({payIssue:{status:'Resolved',resolution:'Not authorized'}},403);
  w.actor('admin');await w.patch({payIssue:{status:'Resolved',resolution:'Bank reference checked against received payment.'}});
  const reloaded=await (await fetch(w.base+'bookings/'+w.booking.id)).json();
  assert.equal(reloaded.booking.dispatch.payIssue.status,'Resolved');
  assert.equal(reloaded.booking.dispatch.payIssue.resolution,'Bank reference checked against received payment.');
  assert.ok(reloaded.booking.dispatch.payIssue.resolvedAt);
  assert.equal(reloaded.booking.resolvedIssues[0].id,caseId);
});
