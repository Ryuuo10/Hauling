import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const text = (v, max = 500) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const required = (v, label, max) => text(v, max) || fail(400, `${label} is required.`);
const number = (v, label, min = 0, max = 100000000) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fail(400, `Enter a valid ${label}.`);
const money = (v, label = 'amount') => Math.round(number(v, label) * 100) / 100;
const strings = (v, max = 20) => Array.isArray(v) && v.length <= max && v.every(x => typeof x === 'string' && x.length <= 200) ? [...new Set(v.map(x => x.trim()))] : fail(400, 'Invalid list.');
const oid = value => /^[a-f0-9]{24}$/.test(value || '') ? new ObjectId(value) : fail(404, 'Record not found.');
const tripOrder = ['upcoming', 'enroute', 'arrived', 'loading', 'loaded', 'transit', 'destination', 'handover', 'delivered'];
const initial = () => ({ status: 'review', matchIdx: 0, declineReason: null, rateStage: 'pending', proposedRate: null, requestedRate: null, rateReason: null, rateNote: '', finalRate: null, deposit: 0, requiredDeposit: 0, quoteSent: false, quoteDecline: null, cancelled: false, agreement: 'customer', agreementIssue: false, agreementUpdate: false, tripStage: 'upcoming', delay: null, problem: null, problemNote: '', problemAck: false, customerSOS: null, operatorSOS: null, pickup: null, delivery: null, customerConfirm: false, issue: null, pay: null, payIssue: null, rating: null });
export const completed = d => d.status === 'booked' && !d.cancelled && d.tripStage === 'delivered' && d.customerConfirm && d.pay?.status === 'Paid' && !d.issue && (!d.payIssue || d.payIssue.status === 'Resolved');

async function body(req, limit = 100000) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Send JSON data.');
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > limit) fail(413, 'Request is too large.'); }
  try { const value = JSON.parse(raw); if (!value || Array.isArray(value) || typeof value !== 'object') throw Error(); return value; }
  catch { fail(400, 'Invalid JSON data.'); }
}
function location(v, label) {
  if (!v || typeof v !== 'object') fail(400, `${label} details are required.`);
  const result = {};
  for (const key of ['address', 'city', 'province', 'contact', 'phone']) result[key] = required(v[key], `${label} ${key}`, key === 'address' ? 500 : 150);
  if (!/^(?:\+?63|0)9\d{9}$/.test(result.phone.replace(/[\s()-]/g, ''))) fail(400, `Enter a valid ${label.toLowerCase()} mobile number.`);
  for (const key of ['landmark', 'instructions']) result[key] = text(v[key]);
  return result;
}
function requestData(v) {
  if (!['agri', 'construction', 'bulky', 'other'].includes(v.category)) fail(400, 'Choose a cargo category.');
  const pickup = location(v.pickup, 'Pickup'), delivery = location(v.delivery, 'Delivery');
  const cargo = required(v.cargo, 'Cargo description'), quantity = required(v.quantity, 'Quantity', 100);
  const weightKg = number(v.weightKg, 'cargo weight', 0.01, 1000000);
  if (!['No Preference', 'Closed Van', 'Wing Van', 'Dropside', 'Dump Truck', 'Flatbed', 'Other'].includes(v.truckType)) fail(400, 'Choose a truck preference.');
  const scheduledAt = new Date(v.scheduledAt);
  if (!Number.isFinite(+scheduledAt) || +scheduledAt < Date.now() - 60000) fail(400, 'Choose a future pickup date and time.');
  const deliveryAt = v.deliveryAt ? new Date(v.deliveryAt) : null;
  if (deliveryAt && (!Number.isFinite(+deliveryAt) || deliveryAt < scheduledAt)) fail(400, 'Delivery must be after pickup.');
  return { category: v.category, pickup, delivery, cargo, quantity, weightKg, truckType: v.truckType, scheduledAt: scheduledAt.toISOString(), deliveryAt: deliveryAt?.toISOString() || null, handling: strings(v.handling || []), equipment: strings(v.equipment || []), loading: text(v.loading), unloading: text(v.unloading), dimensions: text(v.dimensions), helpers: v.helpers === true, flexible: v.flexible === true, budget: v.budget == null ? null : money(v.budget, 'budget'), notes: text(v.notes, 2000), photos: strings(v.photos || [], 6) };
}
const visible = (booking, user) => user.role === 'admin' || booking.customerId === user._id.toString() || booking.operatorId === user._id.toString();
function event(label, user, patch = {}) { return { id: randomUUID(), at: new Date().toISOString(), actor: user._id.toString(), role: user.role, label, ...patch }; }
function publicBooking(b, user) {
  const { _id, submissionKey, ...value } = b;
  const gps = b.liveLocation;
  if (user.role !== 'admin') delete value.assignmentDeclines;
  value.liveLocation = gps && Date.now() - Date.parse(gps.updatedAt) <= 90000 ? gps : null;
  if (user.role === 'customer') {
    delete value.declineReason;
    value.dispatch = { ...value.dispatch, requestedRate: null, rateReason: null, rateNote: '' };
    value.events = value.events.filter(e => !e.internal);
  }
  return { ...value, id: _id.toString(), completed: completed(b.dispatch) };
}
function photos(v, stage, user) {
  if (!Array.isArray(v) || !v.length || v.length > 6) fail(400, 'Add between one and six evidence photos.');
  return v.map(p => ({ id: number(p.id, 'photo ID'), attachmentId: required(p.attachmentId, 'Photo attachment', 24), label: required(p.label, 'Photo label', 150), stage, by: user.role === 'customer' ? 'Customer' : 'Operator', time: new Date().toISOString() }));
}
function evidence(v, stage, user) {
  if (!v || typeof v !== 'object') fail(400, 'Evidence is required.');
  const result = { photos: photos(v.photos, stage, user), qty: number(v.qty, 'quantity', 0), qtyNote: text(v.qtyNote), condition: required(v.condition, 'Cargo condition', 100), notes: text(v.notes, 2000) };
  if (stage === 'Pickup') Object.assign(result, { condNote: text(v.condNote), weight: required(v.weight, 'Confirmed weight', 100), weightReason: text(v.weightReason) });
  else Object.assign(result, { condNote: text(v.condNote), receiver: required(v.receiver, 'Receiver name', 150), receiverRole: text(v.receiverRole, 100), ack: required(v.ack, 'Receiver acknowledgment', 300), issueMarked: v.issueMarked === true });
  return result;
}

export function createBookingsApi({ getDb, getUser, checkMutation }) {
  let indexes;
  async function dbReady() {
    const db = await getDb();
    indexes ||= Promise.all([
      db.collection('bookings').createIndexes([{ key: { customerId: 1, submissionKey: 1 }, unique: true }, { key: { operatorId: 1, updatedAt: -1 } }, { key: { activeTruckId: 1 }, unique: true, partialFilterExpression: { activeTruckId: { $type: 'string' } } }]),
      db.collection('trucks').createIndexes([{ key: { plate: 1 }, unique: true }]),
      db.collection('attachments').createIndexes([{ key: { ownerId: 1, createdAt: -1 } }]),
    ]).catch(error => { indexes = undefined; throw error; });
    await indexes;
    return db;
  }
  return async (req, res, next) => {
    const pathname = (req.url || '').split('?')[0];
    if (!/^\/api\/(bookings|trucks|profile|attachments|notifications)(\/|$)/.test(pathname)) return next();
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(data)); };
    try {
      const user = await getUser(req);
      if (!user) fail(401, 'Please log in to continue.');
      if (['rider', 'fleet'].includes(user.role) && user.verificationStatus !== 'approved' && pathname !== '/api/profile') fail(403, 'Your application must be approved by Admin before accessing hauling operations.');
      if (!['GET', 'POST', 'PATCH'].includes(req.method)) fail(405, 'Method not allowed.');
      if (req.method !== 'GET') checkMutation(req);
      const db = await dbReady();
      const bookings = db.collection('bookings'), trucks = db.collection('trucks');
      if (pathname === '/api/notifications' && req.method === 'GET') {
        const userId = user._id.toString();
        const query = user.role === 'admin' ? {} : user.role === 'customer' ? { customerId: userId } : { operatorId: userId };
        const readThrough = user.notificationReadThrough ? new Date(user.notificationReadThrough).getTime() : 0;
        const notifications = (await bookings.find(query).sort({ updatedAt: -1 }).limit(200).toArray())
          .flatMap(booking => (booking.events || []).filter(item => !item.internal && (item.actor !== userId || user.role === 'admin' && item.label === 'Request Submitted')).map(item => {
            const target = item.label.includes('SOS') ? 'sos' : item.label.includes('Quotation') ? 'quotation' : ['Trip Progress Updated', 'Cargo Delivered', 'Pickup Evidence Recorded'].includes(item.label) ? 'track' : 'booking';
            const detail = item.details ? ` ${item.details}` : '';
            return { id: item.id, bookingRecordId: booking._id.toString(), bookingId: booking.bookingId || booking.requestId, requestId: booking.requestId, title: item.label, body: `${booking.requestId} · ${booking.request?.cargo || 'Hauling request'}.${detail}`, time: item.at, target, read: new Date(item.at).getTime() <= readThrough };
          }))
          .sort((a, b) => b.time.localeCompare(a.time)).slice(0, 100);
        return send(200, { notifications });
      }
      if (pathname === '/api/notifications/read' && req.method === 'PATCH') {
        await body(req, 4096);
        const readThrough = new Date().toISOString();
        await db.collection('users').updateOne({ _id: user._id }, { $set: { notificationReadThrough: readThrough } });
        return send(200, { readThrough });
      }
      if (pathname === '/api/profile') {
        if (req.method === 'GET') return send(200, { profile: { name: user.name, email: user.email, phone: user.phone || '', verificationStatus: user.verificationStatus, ...user.profile } });
        const v = await body(req);
        const previous = user.profile || {};
        const submittedSettings = v.notificationSettings && typeof v.notificationSettings === 'object' ? Object.fromEntries(Object.entries(v.notificationSettings).filter(([k, val]) => ['bookings', 'trips', 'payments'].includes(k) && typeof val === 'boolean')) : undefined;
        const profile = { businessName: v.businessName === undefined ? (previous.businessName || user.name) : required(v.businessName, 'Business name', 200), businessType: v.businessType === undefined ? (previous.businessType || '') : text(v.businessType, 100), address: v.address === undefined ? (previous.address || '') : text(v.address, 500), contactName: v.contactName === undefined ? (previous.contactName || user.name) : required(v.contactName, 'Contact person', 200), contactPhone: v.contactPhone === undefined ? (previous.contactPhone || '') : text(v.contactPhone, 30), notificationSettings: submittedSettings || previous.notificationSettings || {}, readThrough: v.readThrough === undefined ? (previous.readThrough || '') : text(v.readThrough, 40) };
        profile.emergencyContact = v.emergencyContact === undefined ? (previous.emergencyContact || '') : text(v.emergencyContact, 200);
        profile.emergencyPhone = v.emergencyPhone === undefined ? (previous.emergencyPhone || '') : text(v.emergencyPhone, 30);
        if (profile.contactPhone && !/^(?:\+?63|0)9\d{9}$/.test(profile.contactPhone.replace(/[\s()-]/g, ''))) fail(400, 'Enter a valid contact mobile number.');
        await db.collection('users').updateOne({ _id: user._id }, { $set: { profile } });
        return send(200, { profile: { name: user.name, email: user.email, phone: user.phone || '', verificationStatus: user.verificationStatus, ...profile } });
      }
      if (pathname === '/api/trucks') {
        if (user.role === 'customer') fail(403, 'KadaGo handles truck matching.');
        if (req.method === 'GET') {
          const records = await trucks.find(user.role === 'admin' ? {} : { ownerId: user._id.toString() }).sort({ createdAt: -1 }).limit(200).toArray();
          const result = await Promise.all(records.map(async ({ _id, ...truck }) => {
            const operatorApproved = !!(await db.collection('operatorApplications').findOne({ _id: `${truck.ownerId}-rider`, status: 'approved' }) || await db.collection('operatorApplications').findOne({ _id: `${truck.ownerId}-fleet`, status: 'approved' }));
            const active = await bookings.findOne({ activeTruckId: _id.toString() });
            return { id: _id.toString(), ...truck, operatorApproved, hasActiveAssignment: !!active };
          }));
          return send(200, { trucks: result });
        }
        if (!['rider', 'fleet'].includes(user.role)) fail(403, 'Only operators and fleets can register a truck.');
        const v = await body(req);
        const truck = { ownerId: user._id.toString(), business: required(user.profile?.businessName || user.name, 'Business name'), driver: required(v.driver, 'Driver name', 150), truck: required(v.truck, 'Truck name', 150), bodyType: required(v.bodyType, 'Truck body type', 100), plate: required(v.plate, 'Plate number', 20).toUpperCase(), payloadKg: number(v.payloadKg, 'verified payload', 1, 1000000), areas: strings(v.areas), equipment: strings(v.equipment || []), verified: false, available: true, createdAt: new Date().toISOString() };
        if (!truck.areas.length) fail(400, 'Add at least one service area.');
        await trucks.insertOne(truck);
        return send(201, { truck: { ...truck, id: truck._id.toString(), _id: undefined } });
      }
      const truckRoute = pathname.match(/^\/api\/trucks\/([a-f0-9]{24})$/);
      if (truckRoute && req.method === 'PATCH') {
        const truck = await trucks.findOne({ _id: oid(truckRoute[1]) });
        if (!truck || user.role !== 'admin' && truck.ownerId !== user._id.toString()) fail(404, 'Truck not found.');
        const v = await body(req), patch = {};
        if (typeof v.verified === 'boolean') { if (user.role !== 'admin') fail(403, 'Only Admin can verify a truck.'); patch.verified = v.verified; }
        if (typeof v.available === 'boolean') patch.available = v.available;
        if (!Object.keys(patch).length) fail(400, 'No supported truck changes.');
        await trucks.updateOne({ _id: truck._id }, { $set: patch });
        return send(200, { ok: true });
      }
      if (pathname === '/api/attachments' && req.method === 'POST') {
        const v = await body(req, 3000000);
        const content = required(v.data, 'Image', 2800000);
        const match = content.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
        if (!match) fail(400, 'Upload a JPEG, PNG, or WebP image.');
        const bytes = Buffer.from(match[2], 'base64');
        if (!bytes.length || bytes.length > 2000000) fail(400, 'Each photo must be under 2 MB.');
        const signature = match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : match[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
        if (!signature) fail(400, 'This image file is invalid.');
        let bookingId = null;
        if (v.bookingId) { const b = await bookings.findOne({ _id: oid(v.bookingId) }); if (!b || !visible(b, user)) fail(404, 'Booking not found.'); bookingId = v.bookingId; }
        const recentCount = await db.collection('attachments').countDocuments({ ownerId: user._id.toString(), createdAt: { $gte: new Date(Date.now() - 3600000).toISOString() } });
        if (recentCount >= 40) fail(429, 'Photo upload limit reached. Please try again later.');
        const attachment = { ownerId: user._id.toString(), bookingId, name: required(v.name, 'File name', 150), mime: `image/${match[1]}`, data: bytes, createdAt: new Date().toISOString() };
        await db.collection('attachments').insertOne(attachment);
        return send(201, { id: attachment._id.toString(), name: attachment.name });
      }
      const attachmentRoute = pathname.match(/^\/api\/attachments\/([a-f0-9]{24})$/);
      if (attachmentRoute && req.method === 'GET') {
        const a = await db.collection('attachments').findOne({ _id: oid(attachmentRoute[1]) });
        if (!a) fail(404, 'Photo not found.');
        const b = a.bookingId && await bookings.findOne({ _id: oid(a.bookingId) });
        if (a.ownerId !== user._id.toString() && !(b && visible(b, user))) fail(404, 'Photo not found.');
        res.writeHead(200, { 'Content-Type': a.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
        return res.end(Buffer.isBuffer(a.data) ? a.data : Buffer.from(a.data.buffer || a.data));
      }
      if (pathname === '/api/bookings') {
        if (req.method === 'GET') {
          const query = user.role === 'admin' ? {} : user.role === 'customer' ? { customerId: user._id.toString() } : { operatorId: user._id.toString() };
          const declinedAssignments = ['rider', 'fleet'].includes(user.role)
            ? (await bookings.find({ 'assignmentDeclines.operatorId': user._id.toString() }).sort({ updatedAt: -1 }).limit(200).toArray()).flatMap(b => (b.assignmentDeclines || []).filter(item => item.operatorId === user._id.toString()).map(item => ({ requestId: b.requestId, cargo: b.request.cargo, route: `${b.request.pickup.city} → ${b.request.delivery.city}`, scheduledAt: b.request.scheduledAt, reason: item.reason, note: item.note, at: item.at })))
            : [];
          return send(200, { bookings: (await bookings.find(query).sort({ createdAt: -1 }).limit(200).toArray()).map(b => publicBooking(b, user)), declinedAssignments });
        }
        if (req.method !== 'POST' || user.role !== 'customer') fail(403, 'Only customers can submit hauling requests.');
        const v = await body(req), submissionKey = required(v.submissionKey, 'Submission key', 80);
        const previous = await bookings.findOne({ customerId: user._id.toString(), submissionKey });
        if (previous) return send(200, { booking: publicBooking(previous, user) });
        const request = requestData(v.request || {});
        const b = { _id: new ObjectId(), requestId: `KG-HR-${randomUUID().slice(0, 8).toUpperCase()}`, bookingId: null, customerId: user._id.toString(), customer: user.profile?.businessName || user.name, representative: user.name, operatorId: null, assignment: null, request, dispatch: initial(), version: 1, quotes: [], events: [event('Request Submitted', user)], submissionKey, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        for (const id of request.photos) {
          const a = await db.collection('attachments').findOne({ _id: oid(id), ownerId: user._id.toString(), bookingId: null });
          if (!a) fail(400, 'Cargo photo is not available.');
        }
        try { await bookings.insertOne(b); }
        catch (error) { if (error.code !== 11000) throw error; return send(200, { booking: publicBooking(await bookings.findOne({ customerId: user._id.toString(), submissionKey }), user) }); }
        for (const id of request.photos) await db.collection('attachments').updateOne({ _id: oid(id) }, { $set: { bookingId: b._id.toString() } });
        return send(201, { booking: publicBooking(b, user) });
      }
      const route = pathname.match(/^\/api\/bookings\/([a-f0-9]{24})(?:\/(patch|quote|resolve-issue|deposit|location))?$/);
      if (!route) return send(404, { error: 'Not found.' });
      const b = await bookings.findOne({ _id: oid(route[1]) });
      if (!b || !visible(b, user)) fail(404, 'Booking not found.');
      if (route[2] === 'location') {
        if (req.method !== 'POST') fail(405, 'Method not allowed.');
        if (!['rider', 'fleet'].includes(user.role) || b.operatorId !== user._id.toString()) fail(404, 'Booking not found.');
        const v = await body(req, 4096);
        if (v.sharing === false) {
          await bookings.updateOne({ _id: b._id }, { $set: { liveLocation: null } });
          return send(200, { liveLocation: null });
        }
        if (b.dispatch.status !== 'booked' || !['enroute', 'arrived', 'loading', 'loaded', 'transit', 'destination', 'handover'].includes(b.dispatch.tripStage)) fail(409, 'Location sharing is only available during an active trip.');
        const latitude = number(v.latitude, 'latitude', -90, 90), longitude = number(v.longitude, 'longitude', -180, 180), accuracy = number(v.accuracy, 'GPS accuracy', 0, 1000);
        const heading = v.heading == null ? null : number(v.heading, 'heading', 0, 360);
        const speed = v.speed == null ? null : number(v.speed, 'speed', 0, 1000);
        const liveLocation = { latitude, longitude, accuracy, heading, speed, updatedAt: new Date().toISOString() };
        await bookings.updateOne({ _id: b._id }, { $set: { liveLocation } });
        return send(200, { liveLocation });
      }
      if (req.method === 'GET' && !route[2]) return send(200, { booking: publicBooking(b, user) });
      if (req.method !== 'POST' || !route[2]) fail(405, 'Method not allowed.');
      const v = await body(req);
      if (v.version !== b.version) fail(409, 'This booking changed. Reload the latest details and try again.');
      const d = structuredClone(b.dispatch), original = b.dispatch;
      const admin = user.role === 'admin', customer = user.role === 'customer', operator = ['rider', 'fleet'].includes(user.role);
      const requireRole = allowed => { if (!allowed) fail(403, 'Your account cannot perform this action.'); };
      const requireState = (allowed, msg = 'This action is unavailable at the current booking stage.') => { if (!allowed) fail(409, msg); };
      let label = 'Booking Updated', internal = false;
      if (route[2] === 'quote') {
        requireRole(admin); requireState(['confirmed', 'declined'].includes(d.status));
        requireState(!!b.assignment, 'Assign an operator before sending a quotation.');
        const rate = money(v.rate, 'hauling rate'), requiredDeposit = money(v.deposit || 0, 'deposit');
        if (rate <= 0 || requiredDeposit > rate) fail(400, 'The rate must be positive and the deposit cannot exceed it.');
        const quote = { id: `QT-${randomUUID().slice(0, 8).toUpperCase()}`, rate, deposit: requiredDeposit, included: strings(v.included || ['Driver', 'Fuel']), separate: text(v.separate, 2000), terms: required(v.terms, 'Payment terms', 2000), sentAt: new Date().toISOString(), status: 'sent' };
        b.quotes.push(quote);
        Object.assign(d, { status: 'quote', quoteSent: true, quoteDecline: null, finalRate: rate, requiredDeposit, rateStage: 'finalized' });
        label = 'Quotation Ready';
      } else if (route[2] === 'deposit') {
        requireRole(admin); requireState(['accepted', 'booked'].includes(d.status) && !d.pay);
        const amount = money(v.amount);
        if (amount <= 0 || d.deposit + amount > d.requiredDeposit) fail(400, 'The received deposit must not exceed the requested deposit.');
        b.depositRecords = [...(b.depositRecords || []), { amount, reference: required(v.reference, 'Deposit reference', 150), verifiedAt: new Date().toISOString(), verifiedBy: user._id.toString() }];
        d.deposit = money(d.deposit + amount); label = 'Deposit Receipt Verified';
        if (d.finalRate > 0 && d.deposit === d.finalRate) d.pay = { amount: 0, method: 'Verified Deposit', ref: v.reference.trim(), date: new Date().toISOString().slice(0, 10), notes: 'Full hauling rate received as verified deposit.', receipt: false, receiptId: null, status: 'Paid', verifiedAt: new Date().toISOString(), verifiedBy: user._id.toString() };
      } else if (route[2] === 'resolve-issue') {
        requireRole(admin); requireState(!!d.issue);
        const note = required(v.note, 'Resolution note', 2000);
        b.resolvedIssues = [...(b.resolvedIssues || []), { ...d.issue, resolution: note, resolvedBy: user._id.toString(), resolvedAt: new Date().toISOString() }];
        d.issue = null; label = 'Cargo Issue Resolved';
      } else {
        const p = v.patch;
        if (!p || typeof p !== 'object' || Array.isArray(p) || !Object.keys(p).length) fail(400, 'No changes supplied.');
        if (d.cancelled) fail(409, 'This request is cancelled.');
        const handled = new Set();
        const apply = (keys, handler) => { if (keys.some(k => Object.hasOwn(p, k))) { keys.forEach(k => handled.add(k)); handler(); } };
        apply(['status'], () => {
          const s = p.status;
          if (s === 'suggested' && operator) {
            requireState(original.status === 'approved');
            const reason = required(p.declineReason, 'Decline reason');
            const note = required(p.declineNote, 'Decline explanation', 2000);
            b.assignmentDeclines = [...(b.assignmentDeclines || []), { operatorId: b.operatorId, truckId: b.assignment?.id, reason, note, at: new Date().toISOString() }];
            b.operatorId = null; b.assignment = null; b.activeTruckId = null;
            Object.assign(d, { declineReason: reason, matchIdx: 0, rateStage: 'pending', proposedRate: null, finalRate: null, requestedRate: null });
            handled.add('declineReason'); handled.add('declineNote');
            label = 'Matching Suitable Truck';
          }
          else if (s === 'suggested' && admin) { requireState(['review', 'suggested'].includes(d.status)); label = 'Matching Suitable Truck'; }
          else if (s === 'approved') {
            requireRole(admin); requireState(['review', 'suggested', 'approved'].includes(d.status));
          } else if (s === 'confirmed' && operator) { requireState(d.status === 'approved'); label = 'Operator Confirmed Assignment'; }
          else if (s === 'confirmed' && admin) { requireState(['confirmed', 'declined'].includes(d.status)); label = 'Quotation Rate Finalized'; }
          else if (s === 'accepted') { requireRole(customer); requireState(d.status === 'quote'); label = 'Quotation Accepted'; b.quotes.at(-1).status = 'accepted'; }
          else if (s === 'declined') { requireRole(customer); requireState(d.status === 'quote'); d.quoteDecline = required(p.quoteDecline, 'Decline reason'); handled.add('quoteDecline'); b.quotes.at(-1).status = 'declined'; label = 'Quotation Declined'; }
          else if (s === 'booked') { requireRole(operator); requireState(d.status === 'accepted' && d.agreement === 'operator' && !d.agreementIssue); b.bookingId ||= `BK-${randomUUID().slice(0, 8).toUpperCase()}`; label = 'Booking Confirmed'; }
          else fail(403, 'This status change is not permitted.');
          d.status = s;
        });
        // Assignment is validated asynchronously before the state transition is committed.
        if (p.status === 'approved') {
          const t = await trucks.findOne({ _id: oid(v.truckId) });
          requireState(!(b.assignmentDeclines || []).some(item => item.truckId === t?._id.toString() || item.operatorId === t?.ownerId), 'Choose another truck; this assignment was declined.');
          requireState(t?.verified && t.available && t.payloadKg >= b.request.weightKg, 'Choose an available verified truck with sufficient capacity.');
          const ownerApplication = await db.collection('operatorApplications').findOne({ _id: `${t.ownerId}-rider`, status: 'approved' }) || await db.collection('operatorApplications').findOne({ _id: `${t.ownerId}-fleet`, status: 'approved' });
          requireState(!!ownerApplication, 'The truck operator must be approved before receiving assignments.');
          const normalized = a => a.toLowerCase().trim();
          const covered = loc => t.areas.some(a => [loc.city, loc.province].some(x => normalized(x).includes(normalized(a)) || normalized(a).includes(normalized(x))));
          requireState(covered(b.request.pickup) && covered(b.request.delivery), 'This truck does not cover both service areas.');
          requireState(b.request.equipment.every(e => e === 'Other' || t.equipment.some(x => normalized(x) === normalized(e))), 'This truck does not have the requested equipment.');
          const conflict = await bookings.findOne({ operatorId: t.ownerId, 'assignment.id': t._id.toString(), 'dispatch.cancelled': false, 'dispatch.tripStage': { $ne: 'delivered' }, _id: { $ne: b._id } });
          if (conflict) fail(409, 'This truck already has an active assignment.');
          b.operatorId = t.ownerId; b.activeTruckId = t._id.toString(); b.assignment = { ...t, _id: undefined, id: t._id.toString() }; d.matchIdx = 0; label = 'Awaiting Operator Confirmation'; handled.add('matchIdx');
        }
        apply(['agreement', 'agreementUpdate'], () => { requireRole(customer); requireState(original.status === 'accepted' && original.agreement === 'customer'); if (p.agreement !== 'operator') fail(400, 'Invalid agreement confirmation.'); d.agreement = 'operator'; d.agreementUpdate = false; label = 'Customer Confirmed Agreement'; });
        apply(['agreementIssue'], () => { requireRole(operator); requireState(d.status === 'accepted'); d.agreementIssue = true; label = 'Agreement Issue Reported'; });
        apply(['proposedRate'], () => {
          requireRole(admin); requireState(original.status === 'confirmed' && (['pending', 'review'].includes(original.rateStage) || original.rateStage === 'confirmed' && !(original.proposedRate || original.finalRate)));
          const rate = money(p.proposedRate, 'proposed hauling rate');
          if (rate <= 0) fail(400, 'The proposed hauling rate must be positive.');
          d.proposedRate = rate; d.rateStage = 'pending'; label = 'Hauling Rate Proposed';
        });
        apply(['rateStage', 'requestedRate', 'rateReason', 'rateNote', 'finalRate'], () => {
          if (admin) {
            requireState(['confirmed', 'declined'].includes(original.status) && ['confirmed', 'declined'].includes(d.status));
            requireState(original.status === 'declined' || ['confirmed', 'review', 'finalized'].includes(original.rateStage), 'Wait for the operator to respond to the proposed rate.');
            if (p.rateStage !== 'finalized') fail(400, 'Invalid rate finalization.');
            const rate = money(p.finalRate, 'final hauling rate');
            if (rate <= 0) fail(400, 'The final hauling rate must be positive.');
            d.finalRate = rate; d.rateStage = 'finalized'; label = 'Quotation Rate Finalized'; internal = true;
          } else {
            requireRole(operator); requireState(original.status === 'confirmed');
            if (!['confirmed', 'review'].includes(p.rateStage)) fail(400, 'Invalid rate response.');
            if (p.rateStage === 'confirmed') requireState((d.proposedRate || d.finalRate || 0) > 0, 'Wait for Admin to propose a positive rate, or request a rate review.');
            d.rateStage = p.rateStage;
            if (p.rateStage === 'review') { d.requestedRate = money(p.requestedRate); if (d.requestedRate <= 0) fail(400, 'Enter a positive requested rate.'); d.rateReason = required(p.rateReason, 'Rate review reason'); d.rateNote = text(p.rateNote); }
            label = 'Operator Rate Response'; internal = true;
          }
        });
        apply(['requiredDeposit'], () => { requireRole(admin); requireState(['confirmed', 'declined'].includes(d.status)); const amount = money(p.requiredDeposit, 'deposit'); if (amount < d.deposit || amount > (d.finalRate || 0)) fail(400, 'Requested deposit must cover verified deposits and cannot exceed the quoted rate.'); d.requiredDeposit = amount; label = 'Quotation Deposit Updated'; internal = true; });
        apply(['pickup'], () => { requireRole(operator); requireState(d.status === 'booked' && ['arrived', 'loading'].includes(original.tripStage)); d.pickup = evidence(p.pickup, 'Pickup', user); label = 'Pickup Evidence Uploaded'; });
        apply(['delivery'], () => { requireRole(operator); requireState(d.status === 'booked' && ['destination', 'handover'].includes(original.tripStage)); d.delivery = evidence(p.delivery, 'Delivery', user); label = 'Delivery Evidence Uploaded'; });
        apply(['tripStage'], () => {
          requireRole(operator); requireState(d.status === 'booked');
          const from = tripOrder.indexOf(original.tripStage), to = tripOrder.indexOf(p.tripStage);
          requireState(to === from + 1 || p.tripStage === 'loaded' && ['arrived', 'loading'].includes(original.tripStage) || p.tripStage === 'delivered' && ['destination', 'handover'].includes(original.tripStage), 'Trip stages must move forward in order.');
          if (to >= tripOrder.indexOf('loaded')) requireState(!!d.pickup, 'Upload pickup evidence first.');
          if (p.tripStage === 'delivered') requireState(!!d.delivery, 'Upload delivery evidence first.');
          d.tripStage = p.tripStage; b.tripTimes = { ...b.tripTimes, [p.tripStage]: new Date().toISOString() }; label = p.tripStage === 'delivered' ? 'Cargo Delivered' : 'Trip Progress Updated';
        });
        apply(['customerConfirm'], () => { requireRole(customer); requireState(d.status === 'booked' && d.tripStage === 'delivered' && !!d.delivery && !d.issue && !d.customerConfirm); if (p.customerConfirm !== true) fail(400, 'Invalid delivery confirmation.'); d.customerConfirm = true; label = 'Delivery Confirmed'; });
        apply(['issue'], () => {
          requireState(d.status === 'booked' && !completed(original));
          if (!d.issue) { requireRole(customer); const i = p.issue; d.issue = { id: `ISS-${randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), type: required(i?.type, 'Issue type', 100), desc: required(i?.desc, 'Issue description', 2000), photos: i.photos?.length ? photos(i.photos, 'Issue', user) : [], note: text(i.note), status: 'Under Review', response: null, adminNotes: [] }; label = 'Cargo Issue Reported'; }
          else if (admin) { d.issue.adminNotes = strings(p.issue?.adminNotes || [], 50); d.issue.status = ['Under Review', 'More Information Requested'].includes(p.issue?.status) ? p.issue.status : d.issue.status; label = 'Cargo Issue Updated'; }
          else { requireRole(customer || operator); const r = p.issue?.response; d.issue.response = { text: required(r?.text, 'Response', 2000), photos: r?.photos?.length ? photos(r.photos, 'Issue', user) : [] }; label = 'Cargo Issue Response'; }
        });
        apply(['pay'], () => {
          const pay = p.pay;
          if (customer) {
            requireState(d.status === 'booked' && d.customerConfirm && (!d.pay || d.pay.status === 'Rejected'), 'Confirm delivery before recording payment.');
            const amount = money(pay?.amount);
            if (amount !== Math.round((d.finalRate - d.deposit) * 100) / 100 || amount <= 0) fail(400, 'Record the exact outstanding balance.');
            const date = new Date(pay.date);
            if (!Number.isFinite(+date) || +date > Date.now() + 86400000) fail(400, 'Enter a valid payment date.');
            d.pay = { amount, method: required(pay.method, 'Payment method', 80), ref: required(pay.ref, 'Transaction reference', 150), date: date.toISOString().slice(0, 10), notes: text(pay.notes, 2000), receipt: !!pay.receiptId, receiptId: text(pay.receiptId, 24) || null, status: 'Pending Verification' }; label = 'Payment Record Submitted';
          } else {
            requireRole(admin || operator); requireState(d.pay?.status === 'Pending Verification' && d.customerConfirm);
            if (!['Paid', 'Rejected'].includes(pay?.status)) fail(400, 'Choose Paid or Rejected.');
            d.pay.status = pay.status; d.pay.verifiedAt = new Date().toISOString(); d.pay.verifiedBy = user._id.toString(); label = pay.status === 'Paid' ? 'Payment Verified' : 'Payment Record Rejected';
          }
        });
        apply(['payIssue'], () => {
          requireState(d.status === 'booked');
          if (d.payIssue) { requireRole(admin); if (p.payIssue?.status !== 'Resolved') fail(400, 'Invalid payment issue resolution.'); d.payIssue.status = 'Resolved'; d.payIssue.resolution = text(p.payIssue.resolution, 2000); d.payIssue.resolvedAt = new Date().toISOString(); d.payIssue.resolvedBy = user._id.toString(); label = 'Payment Issue Resolved'; }
          else { requireRole(customer || operator); d.payIssue = { id: `PAY-${randomUUID().slice(0, 8).toUpperCase()}`, by: customer ? 'customer' : 'operator', createdAt: new Date().toISOString(), type: required(p.payIssue?.type, 'Issue type', 100), note: required(p.payIssue?.note, 'Issue description', 2000), attachmentIds: strings(p.payIssue?.attachmentIds || [], 6), evidence: !!p.payIssue?.attachmentIds?.length, status: 'Under Review' }; label = 'Payment Issue Reported'; }
        });
        apply(['rating'], () => { requireRole(customer); requireState(completed(original) && !d.rating, 'Ratings are available once after completion.'); const r = p.rating; const stars = number(r?.stars, 'star rating', 1, 5); if (!Number.isInteger(stars)) fail(400, 'Choose a whole star rating.'); const cats = {}; for (const [k, value] of Object.entries(r.cats || {})) { if (k.length > 100 || !Number.isInteger(value) || value < 1 || value > 5) fail(400, 'Invalid category rating.'); cats[k] = value; } d.rating = { stars, cats, tags: strings(r.tags || [], 10), comment: text(r.comment, 2000) }; label = 'Operator Rated'; });
        apply(['delay'], () => { requireRole(operator); requireState(d.status === 'booked' && d.tripStage !== 'delivered'); d.delay = { reason: required(p.delay?.reason, 'Delay reason'), eta: required(p.delay?.eta, 'Updated ETA'), notes: text(p.delay?.notes) }; label = 'Hauling Delayed'; });
        apply(['problem', 'problemNote', 'problemAck'], () => { requireState(d.status === 'booked'); if (admin) { if (p.problemAck !== true) fail(400, 'Invalid acknowledgment.'); d.problemAck = true; } else { requireRole(operator); d.problem = required(p.problem, 'Problem'); d.problemNote = text(p.problemNote); d.problemAck = false; } label = 'Trip Problem Updated'; });
        apply(['customerSOS', 'operatorSOS', 'customerSOSReason'], () => { requireState(d.status === 'booked' && !completed(d)); const key = Object.hasOwn(p, 'customerSOS') ? 'customerSOS' : 'operatorSOS'; if (admin) { if (p[key] !== 'acknowledged') fail(400, 'Invalid SOS acknowledgment.'); d[key] = 'acknowledged'; } else { requireRole(key === 'customerSOS' ? customer : operator); if (p[key] !== 'active') fail(400, 'Invalid SOS alert.'); d[key] = 'active'; if (key === 'customerSOS') d.customerSOSReason = required(p.customerSOSReason, 'Emergency reason', 120); } label = 'SOS Dispatch Alert'; });
        apply(['cancelled'], () => { requireRole(admin || customer); requireState(!['accepted', 'booked'].includes(original.status), 'Contact dispatch to cancel an accepted booking.'); if (p.cancelled !== true) fail(400, 'Invalid cancellation.'); d.cancelled = true; label = 'Request Cancelled'; });
        for (const key of Object.keys(p)) if (!handled.has(key)) fail(400, `Unsupported change: ${key}.`);
      }
      for (const p of [d.pickup, d.delivery, d.issue, d.issue?.response]) for (const photo of p?.photos || []) {
        if (!await db.collection('attachments').findOne({ _id: oid(photo.attachmentId), bookingId: b._id.toString() })) fail(400, 'Upload evidence photos for this booking first.');
      }
      for (const id of d.payIssue?.attachmentIds || []) if (!await db.collection('attachments').findOne({ _id: oid(id), bookingId: b._id.toString() })) fail(400, 'Upload payment issue evidence for this booking first.');
      if (d.pay?.receiptId && !await db.collection('attachments').findOne({ _id: oid(d.pay.receiptId), bookingId: b._id.toString() })) fail(400, 'Upload the receipt for this booking first.');
      if (completed(d) && !completed(original)) { label = 'Booking Completed'; b.completedAt = new Date().toISOString(); }
      if (d.tripStage === 'delivered' || d.cancelled) { b.activeTruckId = null; b.liveLocation = null; }
      b.dispatch = d; b.updatedAt = new Date().toISOString(); b.events.push(event(label, user, { internal, ...(label === 'SOS Dispatch Alert' && d.customerSOSReason ? { details: `Customer reported: ${d.customerSOSReason}` } : {}) }));
      const { _id, version, ...changes } = b;
      const result = await bookings.updateOne({ _id, version }, { $set: changes, $inc: { version: 1 } });
      if (!result.modifiedCount) fail(409, 'This booking changed. Reload the latest details and try again.');
      return send(200, { booking: publicBooking({ ...b, version: version + 1 }, user) });
    } catch (error) {
      if (res.headersSent) return res.end();
      if (error.code === 11000) return send(409, { error: 'This record already exists.' });
      send(error.status || 503, { error: error.status ? error.message : 'The booking service is unavailable. Please try again.' });
    }
  };
}
