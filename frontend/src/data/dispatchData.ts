import type { MatchStatus } from "@/features/customer/HaulingStatus";

export interface Photo { id: number; label: string; stage: "Pickup" | "Delivery" | "Issue"; by: "Operator" | "Customer"; time: string; attachmentId?: string }
export interface PickupEvidence { photos: Photo[]; condition: "Good Condition" | "Minor Issue" | "Damage / Discrepancy"; condNote: string; qty: number; qtyNote: string; weight: string; weightReason: string; notes: string }
export interface DeliveryEvidence { photos: Photo[]; receiver: string; receiverRole: string; ack: string; qty: number; qtyNote: string; condition: "Good Condition" | "Minor Damage" | "Major Damage" | "Missing / Shortage"; condNote: string; issueMarked: boolean; notes: string }
export interface CargoIssue { createdAt?: string; id: string; type: string; desc: string; photos: Photo[]; note: string; status: "Under Review" | "More Information Requested"; response: { text: string; photos: Photo[] } | null; adminNotes: string[] }

export type TripStage = "upcoming" | "enroute" | "arrived" | "loading" | "loaded" | "transit" | "destination" | "handover" | "delivered";
export const TRIP_ORDER: TripStage[] = ["upcoming", "enroute", "arrived", "loading", "loaded", "transit", "destination", "handover", "delivered"];
export const TRIP_STATUS: Record<TripStage, string> = {
  upcoming: "Truck Assigned", enroute: "En Route to Pickup", arrived: "Arrived at Pickup", loading: "Arrived at Pickup", loaded: "Cargo Loaded",
  transit: "In Transit", destination: "Arrived at Destination", handover: "Arrived at Destination", delivered: "Delivered",
};
export let TRIP_TIMES = { started: "7:28 AM", arrivedPickup: "8:05 AM", loaded: "8:31 AM", deliveryStarted: "8:40 AM", arrivedDest: "3:48 PM", delivered: "4:05 PM" };

export type RateStage = "pending" | "confirmed" | "review" | "finalized";

export interface PayRecord { amount: number; method: string; ref: string; date: string; notes: string; receipt: boolean; receiptId?: string | null; verifiedAt?: string; status: "Pending Verification" | "Paid" | "Rejected" }
export interface PayIssue { createdAt?: string; resolution?: string; resolvedAt?: string; resolvedBy?: string; id: string; by: "customer" | "operator"; type: string; note: string; evidence: boolean; attachmentIds?: string[]; status: "Under Review" | "Resolved" }
export interface Rating { stars: number; cats: Record<string, number>; tags: string[]; comment: string }

export interface Dispatch {
  status: MatchStatus;
  matchIdx: number;
  declineReason: string | null;
  proposedRate?: number | null;
  requiredDeposit?: number;
  declineNote?: string;
  rateStage: RateStage;
  requestedRate: number | null;
  rateReason: string | null;
  rateNote: string;
  finalRate: number | null;
  deposit: number;
  quoteSent: boolean;
  quoteDecline: string | null;
  cancelled: boolean;
  agreement: "customer" | "operator";
  agreementIssue: boolean;
  agreementUpdate: boolean;
  tripStage: TripStage;
  delay: { reason: string; eta: string; notes: string } | null;
  problem: string | null;
  problemNote: string;
  problemAck: boolean;
  customerSOS: "active" | "acknowledged" | null;
  customerSOSReason?: string | null;
  operatorSOS: "active" | "acknowledged" | null;
  pickup: PickupEvidence | null;
  delivery: DeliveryEvidence | null;
  customerConfirm: boolean;
  issue: CargoIssue | null;
  pay: PayRecord | null;
  payIssue: PayIssue | null;
  rating: Rating | null;
}

export const INITIAL_DISPATCH: Dispatch = {
  status: "review", matchIdx: 0, declineReason: null,
  rateStage: "pending", requestedRate: null, rateReason: null, rateNote: "", finalRate: null,
  deposit: 0, requiredDeposit: 0, quoteSent: false, quoteDecline: null, cancelled: false,
  agreement: "customer", agreementIssue: false, agreementUpdate: false,
  tripStage: "upcoming", delay: null, problem: null, problemNote: "", problemAck: false, customerSOS: null, customerSOSReason: null, operatorSOS: null, pickup: null, delivery: null, customerConfirm: false, issue: null, pay: null, payIssue: null, rating: null,
};

export let PROPOSED_RATE = 28500;
export let TIMES_DONE = { delivered: "Oct 22, 2026 4:05 PM", completed: "Oct 22, 2026 4:20 PM" };
export function payTotals(d: Dispatch) {
  const rate = d.finalRate ?? PROPOSED_RATE;
  const balancePaid = d.pay?.status === "Paid";
  const paid = d.deposit + (balancePaid ? d.pay!.amount : 0);
  return { rate, deposit: d.deposit, paid, remaining: Math.max(0, rate - paid), due: rate - d.deposit };
}
export function monthlyPayments(bookings: { dispatch: Dispatch; depositRecords?: { amount: number; verifiedAt: string }[] }[], now = new Date()) {
  const inMonth = (value: string) => { const date = new Date(value); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); };
  return Math.round(bookings.reduce((sum, b) => {
    const deposits = (b.depositRecords || []).filter(record => inMonth(record.verifiedAt)).reduce((total, record) => total + record.amount, 0);
    const pay = b.dispatch.pay;
    return sum + deposits + (pay?.status === "Paid" && inMonth(pay.verifiedAt || pay.date) ? pay.amount : 0);
  }, 0) * 100) / 100;
}
export function payStatus(d: Dispatch): "Partially Paid" | "Pending Verification" | "Paid" | "Disputed" | "Rejected" {
  if (d.payIssue && d.payIssue.status !== "Resolved") return "Disputed";
  if (!d.pay) return "Partially Paid";
  if (d.pay.status === "Rejected") return "Rejected";
  return d.pay.status === "Paid" ? "Paid" : "Pending Verification";
}
export function blockingIssue(d: Dispatch) { return !!d.issue || (!!d.payIssue && d.payIssue.status !== "Resolved"); }
export function isCompleted(d: Dispatch) {
  return d.status === "booked" && d.tripStage === "delivered" && d.customerConfirm && d.pay?.status === "Paid" && !blockingIssue(d);
}
export const RATE_REVIEW_REASONS = ["Route Distance", "Fuel Cost", "Loading Requirement", "Special Equipment", "Schedule", "Road Condition", "Other"];
export const QUOTE_DECLINE_REASONS = ["Price", "Schedule", "Truck Type", "Payment Terms", "Other"];
export let QUOTE = {
  id: "QT-20345",
  pickupSchedule: "Oct 22 at 8:00 AM",
  delivery: "Oct 22, 3:00 PM–5:00 PM",
  validUntil: "Oct 20, 2026, 6:00 PM",
  included: ["Driver", "Fuel", "Tarp", "Tie-downs"],
  separate: [
    { k: "Toll Fees", v: "Actual cost if applicable" },
    { k: "Waiting Fee", v: "₱500/hour after first 2 hours" },
    { k: "Extra Stop", v: "Requires prior approval" },
    { k: "Special Equipment", v: "If later requested" },
  ],
};
export const peso = (n: number) => `₱${n.toLocaleString()}`;
export const AFTER_CONFIRM: MatchStatus[] = ["confirmed", "quote", "accepted", "declined", "booked"];
export const quoteRate = (d: Dispatch) => d.finalRate ?? PROPOSED_RATE;

export let REQ = {
  id: "KG-HR-12389",
  customer: "Santos Agricultural Trading",
  rep: "Maria Clara Santos",
  category: "Construction Materials",
  cargo: "30 sacks Portland Cement Type 1",
  cargoShort: "30 sacks Portland Cement",
  quantity: "30 sacks",
  weight: "1.2 tons",
  weightKg: 1200,
  pickup: "Malaybalay City, Bukidnon",
  dest: "Cagayan de Oro City",
  route: "Malaybalay → Cagayan de Oro",
  schedule: "Oct 22 at 8:00 AM",
  requirements: "Tarp Required",
  budget: "₱28,000",
};

export type Level = "highly" | "suitable" | "partial" | "not";
export type Check = "ok" | "warn" | "fail";

export interface MatchRaw {
  truckId?: string;
  business: string;
  driver: string;
  truck: string;
  truckShort: string;
  plate: string;
  payloadKg: number;
  cargoKg?: number;
  availability: string;
  areas: string[];
  rating: string;
  checks: { cargoType: Check; pickup: Check; dest: Check; schedule: Check; equipment: Check };
  equipmentText: string;
  scheduleText: string;
}

export interface TruckMatch extends MatchRaw {
  level: Level;
  reasons: { state: Check; text: string }[];
  reasonSummary: string;
}

export const LEVEL_LABEL: Record<Level, string> = {
  highly: "Highly Suitable",
  suitable: "Suitable",
  partial: "Partial Match",
  not: "Not Suitable",
};

export const LEVEL_COLOR: Record<Level, { bg: string; fg: string }> = {
  highly: { bg: "rgba(22,163,74,0.12)", fg: "#15803d" },
  suitable: { bg: "rgba(29,85,214,0.1)", fg: "#1D55D6" },
  partial: { bg: "rgba(234,179,8,0.14)", fg: "#a16207" },
  not: { bg: "rgba(220,38,38,0.1)", fg: "#DC2626" },
};

export function evaluate(m: MatchRaw, weightKg: number): TruckMatch {
  const capacityOk = (m.cargoKg ?? weightKg) <= m.payloadKg;
  const reasons: { state: Check; text: string }[] = [
    { state: capacityOk ? "ok" : "fail", text: capacityOk ? "Capacity Suitable" : "Cargo exceeds verified truck capacity." },
    { state: m.checks.cargoType, text: m.checks.cargoType === "ok" ? "Cargo Type Suitable" : "Cargo type needs review" },
    { state: m.checks.pickup, text: m.checks.pickup === "ok" ? "Pickup Area Covered" : "Pickup area partly covered" },
    { state: m.checks.dest, text: m.checks.dest === "ok" ? "Destination Covered" : "Destination not in service areas" },
    { state: m.checks.schedule, text: m.checks.schedule === "ok" ? "Schedule Available" : "Schedule conflict" },
    { state: m.checks.equipment, text: m.equipmentText },
  ];
  const fails = reasons.filter((r) => r.state === "fail").length;
  const warns = reasons.filter((r) => r.state === "warn").length;
  const level: Level = !capacityOk || fails ? "not" : warns === 0 ? "highly" : warns === 1 ? "suitable" : "partial";
  const reasonSummary = !capacityOk
    ? "Cargo exceeds verified truck capacity."
    : level === "highly" ? "All capacity, route, schedule, and equipment checks passed."
    : reasons.filter((r) => r.state === "warn").map((r) => r.text).join("; ") + ".";
  return { ...m, level, reasons, reasonSummary };
}

export function noTruckMatch(weightKg = 1): TruckMatch {
  return evaluate({ business: "No suitable truck available", driver: "Not assigned", truck: "Not assigned", truckShort: "Not assigned", plate: "Not assigned", payloadKg: 0, availability: "Unavailable", areas: [], rating: "—", checks: { cargoType: "fail", pickup: "fail", dest: "fail", schedule: "fail", equipment: "fail" }, equipmentText: "No verified matching truck", scheduleText: "Awaiting a suitable truck" }, weightKg);
}

type MatchTruck = { id?: string; business: string; driver: string; truck: string; plate: string; bodyType?: string; payloadKg: number; areas: string[]; equipment: string[]; verified: boolean; available: boolean; operatorApproved?: boolean; hasActiveAssignment?: boolean };
type MatchRequest = { weightKg: number; pickup: { city: string; province: string }; delivery: { city: string; province: string }; equipment: string[]; truckType?: string };

export function registeredTruckMatches(trucks: MatchTruck[], request: MatchRequest, assigned = false): TruckMatch[] {
  const normalize = (value: string) => value.toLowerCase().trim();
  return trucks.flatMap(truck => {
    const covers = (place: { city: string; province: string }) => truck.areas.some(area => !!normalize(area) && [place.city, place.province].some(name => normalize(name).includes(normalize(area)) || normalize(area).includes(normalize(name))));
    const equipment = request.equipment.every(item => normalize(item) === "other" || truck.equipment.some(value => normalize(value) === normalize(item)));
    if (!assigned && (!truck.id || !truck.verified || truck.operatorApproved !== true || !truck.available || truck.hasActiveAssignment || truck.payloadKg < request.weightKg || !covers(request.pickup) || !covers(request.delivery) || !equipment)) return [];
    const preference = !request.truckType || request.truckType === "No Preference" || normalize(truck.bodyType || truck.truck).includes(normalize(request.truckType));
    const match = evaluate({ truckId: truck.id, business: truck.business, driver: truck.driver, truck: truck.truck, truckShort: `${truck.truck} · ${truck.plate}`, plate: truck.plate, payloadKg: truck.payloadKg, availability: truck.available ? "Available" : "Unavailable", areas: truck.areas, rating: "—", checks: { cargoType: preference ? "ok" : "warn", pickup: covers(request.pickup) ? "ok" : "fail", dest: covers(request.delivery) ? "ok" : "fail", schedule: assigned || truck.available && !truck.hasActiveAssignment ? "ok" : "fail", equipment: equipment ? "ok" : "fail" }, equipmentText: truck.equipment.join(", ") || "No special equipment required", scheduleText: assigned ? "Assigned to this request" : "No active assignment; operator must confirm pickup schedule" }, request.weightKg);
    if (!preference) match.reasons = match.reasons.map(reason => reason.text === "Cargo type needs review" ? { ...reason, text: "Truck body differs from the customer's preference" } : reason);
    return [match];
  }).sort((a, b) => ({ highly: 0, suitable: 1, partial: 2, not: 3 }[a.level] - { highly: 0, suitable: 1, partial: 2, not: 3 }[b.level]) || a.payloadKg - b.payloadKg || a.plate.localeCompare(b.plate));
}

export let MATCHES: TruckMatch[] = [noTruckMatch()];

export const fmtKg = (n: number) => `${n.toLocaleString()} kg`;

export const DECLINE_REASONS = ["Schedule Conflict", "Truck Unavailable", "Vehicle Issue", "Route Concern", "Capacity Concern", "Other"];

export let AGREEMENT = {
  id: "KA-2026-00482",
  booking: "BK-8721",
  customerAt: "Oct 18, 2026 · 10:42 AM",
  operatorAt: "Oct 18, 2026 · 10:48 AM",
};

export function syncDispatchData(booking: { requestId: string; bookingId: string | null; customer: string; representative: string; request: { category: string; cargo: string; quantity: string; weightKg: number; pickup: { address: string; city: string; province: string }; delivery: { address: string; city: string; province: string }; scheduledAt: string; budget: number | null; handling: string[]; equipment: string[]; loading: string; unloading: string; helpers: boolean }; assignment: { id?: string; business: string; driver: string; truck: string; plate: string; payloadKg: number; areas: string[]; equipment: string[]; verified: boolean; available: boolean } | null; dispatch: Dispatch; quotes: { id: string; rate: number; deposit: number; included: string[]; separate: string; terms: string }[]; tripTimes?: Record<string, string>; completedAt?: string; events: { label: string; at: string }[] }, availableTrucks: { id?: string; operatorApproved?: boolean; hasActiveAssignment?: boolean; business: string; driver: string; truck: string; plate: string; payloadKg: number; areas: string[]; equipment: string[]; verified: boolean; available: boolean }[] = []) {
  const r = booking.request;
  const categoryNames: Record<string, string> = { agri: "Agricultural Cargo", construction: "Construction Materials", bulky: "Bulky & Heavy Goods", other: "Other Commercial Cargo" };
  REQ = { ...REQ, id: booking.requestId, customer: booking.customer, rep: booking.representative, category: categoryNames[r.category] || r.category, cargo: r.cargo, cargoShort: r.cargo, quantity: r.quantity, weight: `${r.weightKg.toLocaleString()} kg`, weightKg: r.weightKg, pickup: `${r.pickup.address}, ${r.pickup.city}, ${r.pickup.province}`, dest: `${r.delivery.address}, ${r.delivery.city}, ${r.delivery.province}`, route: `${r.pickup.city} → ${r.delivery.city}`, schedule: new Date(r.scheduledAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }), budget: r.budget ? `₱${r.budget.toLocaleString()}` : "Not specified", requirements: [...r.handling, ...r.equipment, r.loading, r.unloading, r.helpers ? "Helpers requested" : ""].filter(Boolean).join(", ") };
  const trucks = booking.assignment ? [booking.assignment] : availableTrucks;
  const matches = registeredTruckMatches(trucks, r, !!booking.assignment);
  MATCHES = matches.length ? matches : [noTruckMatch(r.weightKg)];
  const q = booking.quotes.at(-1);
  if (q) QUOTE = { ...QUOTE, id: q.id, pickupSchedule: REQ.schedule, delivery: "As stated in the request", validUntil: q.terms, included: q.included, separate: q.separate ? [{ k: "Additional charges", v: q.separate }] : [] };
  AGREEMENT = { id: q ? `KA-${q.id.slice(3)}` : "Pending", booking: booking.bookingId || "Pending confirmation", customerAt: booking.events.find(e => e.label === "Customer Confirmed Agreement")?.at || "Pending", operatorAt: booking.events.find(e => e.label === "Booking Confirmed")?.at || "Pending" };
  const time = (key: string) => booking.tripTimes?.[key] ? new Date(booking.tripTimes[key]).toLocaleString("en-PH") : "Pending";
  TRIP_TIMES = { started: time("enroute"), arrivedPickup: time("arrived"), loaded: time("loaded"), deliveryStarted: time("transit"), arrivedDest: time("destination"), delivered: time("delivered") };
  PROPOSED_RATE = booking.dispatch.proposedRate || booking.dispatch.finalRate || 0;
  TIMES_DONE = { delivered: time("delivered"), completed: booking.completedAt ? new Date(booking.completedAt).toLocaleString("en-PH") : "Pending" };
}
export type AgreementStage = "customer" | "operator" | "confirmed";
export const agreementStage = (d: Dispatch): AgreementStage => (d.status === "booked" ? "confirmed" : d.agreement === "customer" ? "customer" : "operator");
export const AGREEMENT_STATUS: Record<AgreementStage, string> = {
  customer: "Awaiting Customer Confirmation",
  operator: "Awaiting Operator Confirmation",
  confirmed: "Confirmed",
};

export interface SimNotif { icon: string; title: string; body: string; time: string; target?: string }
const nf = (icon: string, title: string, body: string, target?: string): SimNotif => ({ icon, title, body, time: "Just now", target });
const STATUS_RANK: MatchStatus[] = ["review", "suggested", "approved", "confirmed", "quote", "accepted", "declined", "booked"];
function statusNotifs(d: Dispatch, role: "customer" | "operator" | "admin"): SimNotif[] {
  const at = (s: MatchStatus) => STATUS_RANK.indexOf(d.status) >= STATUS_RANK.indexOf(s);
  const n = (icon: string, title: string, body: string): SimNotif => ({ icon, title, body, time: "Just now" });
  const out: SimNotif[] = [];
  if (role === "customer") {
    if (at("quote") && d.status !== "declined") out.push(n("📄", "Quotation Ready", "Quotation QT-20345 is ready for your review."));
    if (d.status === "declined") out.push(n("❌", "Quotation Declined", "You declined QT-20345. KadaGo may send an updated quotation."));
  } else if (role === "operator") {
    if (d.status === "approved") out.push(n("🚛", "New Assignment", "Request KG-HR-12389 needs your confirmation."));
    if (at("confirmed")) out.push(n("✅", "Assignment Confirmed", "Rate coordination for KG-HR-12389 is with KadaGo."));
    if (at("quote") && d.status !== "declined") out.push(n("📤", "Quotation Sent to Customer", "KadaGo sent QT-20345 to Santos Agricultural Trading."));
  } else {
    if (d.status === "review" || d.status === "suggested") out.push(n("🧭", "Match Approval Needed", "KG-HR-12389 has a suggested truck waiting for review."));
    if (d.status === "approved") out.push(n("⏳", "Awaiting Operator Confirmation", "Match approved. Waiting for Dela Cruz Trucking Services."));
    if (d.status === "confirmed") out.push(n("💬", "Quotation Ready to Finalize", "Operator confirmed. Finalize and send the quotation."));
    if (d.status === "declined") out.push(n("❌", "Quotation Declined", "Customer declined QT-20345."));
  }
  if (d.customerSOS && role === "admin") out.unshift(n("🚨", "SOS Alert", "Customer SOS raised on BK-8721."));
  if (d.operatorSOS && role === "admin") out.unshift(n("🚨", "SOS Alert", "Truck Operator SOS raised on BK-8721."));
  return out.reverse();
}

export function agreementNotifs(d: Dispatch, role: "customer" | "operator" | "admin"): SimNotif[] {
  const out: SimNotif[] = [...tripNotifs(d, role)];
  const acc = d.status === "accepted" || d.status === "booked";
  if (!acc) return [...out, ...statusNotifs(d, role)];
  const st = agreementStage(d);
  if (role === "customer") {
    if (st === "confirmed") out.push(nf("🎉", "Booking Confirmed", "BK-8721 is ready for the scheduled pickup, Oct 22 at 8:00 AM.", "agreement"));
    if (st !== "customer") out.push(nf("✅", "Operator Confirmed Agreement", "Dela Cruz Trucking Services confirmed KA-2026-00482.", "agreement"));
    out.push(nf("📄", "Booking Agreement Ready", "Review and confirm Agreement KA-2026-00482.", "agreement"));
  } else if (role === "operator") {
    if (st === "confirmed") out.push(nf("🎉", "Booking Confirmed", "BK-8721 is confirmed. Upcoming pickup Oct 22 at 8:00 AM.", "agreement"));
    if (st !== "customer") out.push(nf("✅", "Customer Confirmed Agreement", "Santos Agricultural Trading confirmed KA-2026-00482.", "agreement"));
    out.push(nf("📄", "Booking Agreement Ready", "Review and confirm Agreement KA-2026-00482.", "agreement"));
    out.push(nf("👍", "Quotation Accepted", "Santos Agricultural Trading accepted QT-20345.", "quotation"));
  } else {
    if (st === "confirmed") {
      out.push(nf("🎉", "Booking Confirmed", "BK-8721 confirmed by customer and operator.", "agreement"));
      out.push(nf("📄", "Booking Agreement Confirmed", "KA-2026-00482 confirmed by customer and operator.", "agreement"));
    }
    out.push(nf("👍", "Quotation Accepted", "Santos Agricultural Trading accepted QT-20345.", "quotation"));
  }
  return [...out, ...statusNotifs(d, role)];
}

export function tripNotifs(d: Dispatch, role: "customer" | "operator" | "admin"): SimNotif[] {
  const out: SimNotif[] = [];
  if (role === "admin") {
    if (d.status === "declined") out.push(nf("🚫", "Operator Declined", `Dela Cruz Trucking Services declined${d.declineReason ? `: ${d.declineReason}` : ""}.`, "assignment"));
    if (d.rateStage === "review") out.push(nf("💬", "Rate Review Requested", `Operator requested ${d.requestedRate ? peso(d.requestedRate) : "a rate review"} for KG-HR-12389.`, "quotation"));
    if (d.customerSOS) out.push(nf("🆘", "SOS Alert", `Customer SOS ${d.customerSOS === "active" ? "is active" : "was acknowledged"} for BK-8721 (simulated).`, "sos"));
  }
  if (d.status !== "booked") return out.reverse();
  const i = TRIP_ORDER.indexOf(d.tripStage);
  const at = (s: TripStage) => i >= TRIP_ORDER.indexOf(s);
  const n = nf;
  if (role === "customer") {
    if (at("enroute")) out.push(n("🚛", "Truck En Route", "The BK-8721 truck is on the way to pickup.", "track"));
    if (at("arrived")) out.push(n("📍", "Truck Arrived at Pickup", "The truck arrived at Malaybalay City.", "track"));
    if (d.pickup) out.push(n("✅", "Pickup Confirmed", "Pickup evidence was recorded at 8:31 AM.", "track"));
    if (at("loaded")) out.push(n("📦", "Cargo Loaded", "Your cargo has been loaded.", "track"));
    if (at("transit")) out.push(n("🛣️", "Cargo In Transit", "Your cargo is on the way to Cagayan de Oro.", "track"));
    if (d.delay) out.push(n("⏱️", "Delivery Delayed", `Reason: ${d.delay.reason}. Updated ETA ${d.delay.eta}.`, "track"));
    if (at("destination")) out.push(n("📍", "Truck Arrived at Destination", "The truck arrived in Cagayan de Oro.", "track"));
    if (d.delivery) out.push(n("📸", "Delivery Evidence Added", "The operator recorded delivery photos and receiver acknowledgment.", "delivery"));
    if (at("delivered")) out.push(n("✅", "Cargo Delivered", "Delivered at 4:05 PM. Review the delivery next.", "delivery"));
    if (at("delivered") && !d.customerConfirm && !d.issue) out.push(n("🔔", "Please Confirm Delivery", "Review the delivery evidence and confirm receipt.", "delivery"));
    if (d.issue) out.push(n("⚠️", "Cargo Issue Submitted", `Case ${d.issue.id} is under review.`, "case"));
    if (d.customerConfirm) out.push(n("💳", "Balance Due", `Remaining balance ${peso(payTotals(d).due)} is due upon confirmed delivery.`, "payment"));
    if (d.pay) out.push(n("🧾", "Payment Record Submitted", "Your balance payment record is waiting for verification.", "payment"));
    if (d.pay?.status === "Paid") out.push(n("✅", "Payment Verified", "The operator confirmed your payment.", "payment"), n("💰", "Payment Status: Paid", "BK-8721 is fully paid.", "payment"));
    if (d.payIssue) out.push(n("⚠️", "Payment Issue Submitted", `Case ${d.payIssue.id} is under review.`, "payment"));
    if (isCompleted(d)) {
      out.push(n("🏁", "Booking Completed", "BK-8721 is completed.", "completed"));
      if (!d.rating) out.push(n("⭐", "Please Rate Your Experience", "Tell us how the hauling went.", "rating"));
    }
  } else if (role === "operator") {
    if (d.tripStage === "upcoming") { out.push(n("⏰", "Start Trip Reminder", "Pickup is on Oct 22 at 8:00 AM. Start your trip.", "track")); out.push(n("📅", "Pickup Reminder", "BK-8721 pickup is coming up.", "track")); }
    if (d.pickup) out.push(n("📝", "Pickup Evidence Recorded", "Pickup confirmed at 8:31 AM.", "track"));
    if (d.delivery) out.push(n("📝", "Delivery Evidence Recorded", "Delivery recorded at 4:05 PM.", "delivery"));
    if (d.customerConfirm) out.push(n("✅", "Customer Confirmed Delivery", "The customer confirmed BK-8721 was received.", "delivery"));
    if (d.issue) out.push(n("⚠️", "Customer Reported a Cargo Issue", `Case ${d.issue.id}. Open Cargo Issue Details to respond.`, "case"));
    if (d.pay) out.push(n("🧾", "Customer Added Payment Record", `${peso(d.pay.amount)} via ${d.pay.method}.`, "payment"));
    if (d.pay?.status === "Pending Verification") out.push(n("🔔", "Payment Confirmation Needed", "Confirm the payment once you have received it.", "payment"));
    if (d.pay?.status === "Paid") out.push(n("💰", "Payment Received", "BK-8721 payment marked as received.", "payment"));
    if (d.payIssue) out.push(n("⚠️", "Payment Issue Case", `Case ${d.payIssue.id} is under review.`, "payment"));
    if (isCompleted(d)) out.push(n("🏁", "Booking Completed", "BK-8721 is completed.", "completed"));
    if (d.rating) out.push(n("⭐", "New Rating Received", `Santos Agricultural Trading rated you ${d.rating.stars.toFixed(1)}.`, "rating"));
  } else {
    if (at("enroute")) out.push(n("🚛", "Trip Started", "BK-8721 trip started (simulated).", "track"));
    if (d.delay) out.push(n("⏱️", "Delay Reported", `BK-8721 delayed: ${d.delay.reason}.`, "track"));
    if (d.problem) out.push(n("⚠️", "Problem Reported", `BK-8721: ${d.problem}.`, "track"));
    if (at("delivered")) out.push(n("✅", "Cargo Delivered", "BK-8721 delivered. Customer confirmation pending.", "delivery"));
    if (d.issue) out.push(n("⚠️", "Cargo Issue Reported", `Case ${d.issue.id} (${d.issue.type}) needs review.`, "case"));
    if (d.pay) out.push(n("💳", "Payment Record Updated", `BK-8721 payment: ${d.pay.status}.`, "payment"));
    if (d.payIssue) out.push(n("⚠️", "Payment Dispute Opened", `Case ${d.payIssue.id} for BK-8721.`, "case"));
    if (isCompleted(d)) out.push(n("🏁", "Booking Completed", "BK-8721 met all completion conditions.", "completed"));
  }
  return out.reverse();
}
