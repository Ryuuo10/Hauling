import { useBookings, useBookingData } from "@/features/customer/BookingContext";
import { useState } from "react";
import type { LiveLocation } from "@/api/bookings";
import { MATCHES, REQ, AGREEMENT, TRIP_ORDER, TRIP_STATUS, TRIP_TIMES, isCompleted, payStatus, TIMES_DONE } from "@/data/dispatchData";
import type { Dispatch, TripStage } from "@/data/dispatchData";
import { BLUE, ORANGE, GREEN, RED, INK, MUTED, BORDER, roleColor, Row, Sec, Pill, Btn, Ghost, Header, Banner, Modal, HaulTimeline } from "@/features/hauling/TripUI";
import type { Role } from "@/features/hauling/TripUI";
import { CustomerPayment, OperatorPayment, OperatorTransaction, CompletionChecks, PayChip, NewRatingCard } from "@/features/hauling/Payments";
import { ProofOfPickup, ProofOfDelivery, PickupEvidenceView, DeliveryEvidenceView, CaseView, EvidenceTimeline, ReportIssueForm, SuccessScreen, pickupChip, deliveryChip } from "@/features/hauling/Evidence";
export type { Role };

const mapStage = (s: TripStage) => idx(s) >= idx("enroute") && idx(s) <= idx("handover");
const idx = (s: TripStage) => TRIP_ORDER.indexOf(s);
type Patch = (p: Partial<Dispatch>) => void | Promise<boolean>;

export const DELAY_REASONS = ["Traffic", "Road Condition", "Weather", "Vehicle Issue", "Loading Delay", "Route Restriction", "Other"];
export const PROBLEM_TYPES = ["Vehicle Issue", "Cargo Issue", "Route Problem", "Receiver Unavailable", "Safety Concern", "Other"];

export function tripStatusText(d: Dispatch) {
  if (isCompleted(d)) return "Completed";
  if (d.tripStage === "delivered" && d.customerConfirm && !d.issue && d.pay) return payStatus(d) === "Disputed" ? "Delivered — Payment Disputed" : d.pay.status === "Paid" ? "Delivered — Payment Received" : "Delivered — Payment Pending Verification";
  if (d.tripStage === "delivered") return d.issue ? "Delivered — Issue Under Review" : d.customerConfirm ? "Delivered — Customer Confirmed" : "Delivered";
  return TRIP_STATUS[d.tripStage] + (d.delay ? " — Delayed" : "");
}
export function tripMetrics(d: Dispatch) {
  const s = d.tripStage;
  if (s === "enroute") return { dist: "18 km", eta: d.delay?.eta ?? "32 mins", label: "Distance to Pickup", etaLabel: "Estimated Arrival" };
  if (s === "transit") return { dist: "102 km", eta: d.delay?.eta ?? "2 hrs 15 mins", label: "Distance Remaining", etaLabel: "ETA" };
  return { dist: s === "destination" || s === "handover" || s === "delivered" ? "0 km" : "0 km", eta: "—", label: "Distance", etaLabel: "ETA" };
}

// ── Simulated map ──────────────────────────────────────────────────────────────
const PICK = { x: 62, y: 118 }, DEST = { x: 262, y: 38 };
const TRUCK_AT: Record<TripStage, { x: number; y: number }> = {
  upcoming: { x: 24, y: 146 }, enroute: { x: 38, y: 134 }, arrived: PICK, loading: PICK, loaded: PICK,
  transit: { x: 168, y: 82 }, destination: DEST, handover: DEST, delivered: DEST,
};
export function TripMap({ stage, delayed, liveLocation }: { stage: TripStage; delayed?: boolean; liveLocation?: LiveLocation | null }) {
  const { m } = useBookingData();
  const t = TRUCK_AT[stage];
  if (liveLocation) {
    const delta = Math.max(0.003, Math.min(0.02, liveLocation.accuracy / 111320 * 3));
    const bbox = `${liveLocation.longitude - delta},${liveLocation.latitude - delta},${liveLocation.longitude + delta},${liveLocation.latitude + delta}`;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${liveLocation.latitude},${liveLocation.longitude}`;
    const mapLink = `https://www.openstreetmap.org/?mlat=${liveLocation.latitude}&mlon=${liveLocation.longitude}#map=16/${liveLocation.latitude}/${liveLocation.longitude}`;
    return <div className="overflow-hidden rounded-2xl" style={{ background: "#EAF1FB", border: `1px solid ${BORDER}` }}><iframe title="Live truck location map" src={mapUrl} className="block h-56 w-full border-0" loading="lazy" referrerPolicy="no-referrer" /><div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white"><div><p className="text-[11px] font-bold text-green-700">Live GPS location</p><p className="text-[10px] text-slate-500">Updated {new Date(liveLocation.updatedAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })} ? accuracy +/- {Math.round(liveLocation.accuracy)} m</p></div><a href={mapLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-700">Open map</a></div></div>;
  }
  const phase2 = idx(stage) >= idx("loaded");
  const route = `M ${PICK.x} ${PICK.y} C 110 120, 120 60, 170 80 S 230 40, ${DEST.x} ${DEST.y}`;
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "#EAF1FB", border: `1px solid ${BORDER}` }}>
      <svg viewBox="0 0 320 170" className="w-full block">
        <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(29,85,214,0.07)" strokeWidth="1"/></pattern></defs>
        <rect width="320" height="170" fill="url(#grid)" />
        <path d={`M 24 146 L ${PICK.x} ${PICK.y}`} stroke={!phase2 ? ORANGE : "#CBD5E1"} strokeWidth="4" strokeLinecap="round" strokeDasharray={!phase2 ? "0" : "6 6"} fill="none" />
        <path d={route} stroke={phase2 ? ORANGE : "#CBD5E1"} strokeWidth="4" strokeLinecap="round" strokeDasharray={phase2 ? "0" : "6 6"} fill="none" />
        <g><circle cx={PICK.x} cy={PICK.y} r="8" fill={BLUE} stroke="#fff" strokeWidth="2.5" /><text x={PICK.x} y={PICK.y + 22} fontSize="9" fontWeight="800" textAnchor="middle" fill={INK}>Pickup</text></g>
        <g><circle cx={DEST.x} cy={DEST.y} r="8" fill={GREEN} stroke="#fff" strokeWidth="2.5" /><text x={DEST.x} y={DEST.y + 22} fontSize="9" fontWeight="800" textAnchor="middle" fill={INK}>Destination</text></g>
        <g style={{ transition: "transform 0.8s ease", transform: `translate(${t.x}px, ${t.y - 16}px)` }}>
          <circle cx="0" cy="16" r="14" fill={delayed ? RED : ORANGE} opacity="0.18" />
          <rect x="-10" y="6" width="20" height="14" rx="4" fill={delayed ? RED : ORANGE} stroke="#fff" strokeWidth="2" />
          <text x="0" y="17" fontSize="10" textAnchor="middle">🚛</text>
        </g>
      </svg>
      <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.92)", color: INK, border: `1px solid ${BORDER}` }}>{stage === "delivered" ? "Demo Trip History — Trip Ended" : "Demo GPS — Simulated Location"}</span>
    </div>
  );
}

function TripHistoryCard({ onOpen }: { onOpen?: () => void }) {
  const { TRIP_TIMES } = useBookingData();
  return (
    <Sec title="Trip History" accent="rgba(22,163,74,0.35)">
      <p className="text-[11px] mb-1.5" style={{ color: MUTED }}>Trip ended. No active map is shown. Times below come from this booking.</p>
      <Row k="Trip Started" v={TRIP_TIMES.started} /><Row k="Delivered" v={TRIP_TIMES.delivered} />
      {onOpen && <div className="mt-2"><Ghost color={BLUE} onClick={onOpen}>View Trip History</Ghost></div>}
    </Sec>
  );
}

function TripSummary({ d, role }: { d: Dispatch; role: Role }) {
  const { m, TRUCK_LABEL, REQ, AGREEMENT } = useBookingData();
  const mt = tripMetrics(d);
  const live = mapStage(d.tripStage);
  return (
    <>
      <Sec>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[13px] font-black" style={{ color: roleColor(role) }}>{AGREEMENT.booking}</span>
          <Pill text={tripStatusText(d).toUpperCase()} bg={d.delay ? "rgba(220,38,38,0.1)" : d.tripStage === "delivered" ? "rgba(22,163,74,0.12)" : "rgba(244,123,32,0.12)"} fg={d.delay ? RED : d.tripStage === "delivered" ? "#15803d" : "#c2410c"} />
        </div>
        <Row k="Customer" v={REQ.customer} />
        {role !== "operator" && <Row k="Operator" v={m.business} />}
        {role !== "operator" && <Row k="Driver" v={m.driver} />}
        <Row k="Cargo" v={REQ.cargoShort} />
        <Row k="Truck" v={TRUCK_LABEL} />
        <Row k="Route" v={REQ.route} />
        {live && <><Row k={mt.label} v={mt.dist} strong /><Row k={mt.etaLabel} v={mt.eta} strong /><Row k="Demo GPS Update" v="2 mins ago" /></>}
      </Sec>
      {d.delay && d.tripStage !== "delivered" && (
        <Banner tone="red">Delayed · Reason: {d.delay.reason} · Updated ETA: {d.delay.eta}</Banner>
      )}
    </>
  );
}

function History({ d, onBack, role }: { d: Dispatch; onBack: () => void; role: Role }) {
  const { TRIP_TIMES, TIMES_DONE } = useBookingData();
  const rows = [["Trip Started", TRIP_TIMES.started], ["Arrived at Pickup", TRIP_TIMES.arrivedPickup], ["Cargo Loaded", TRIP_TIMES.loaded], ["Delivery Started", TRIP_TIMES.deliveryStarted], ["Arrived at Destination", TRIP_TIMES.arrivedDest], ["Delivered", TRIP_TIMES.delivered]];
  if (isCompleted(d)) rows.push(["Completed", TIMES_DONE.completed.replace("Oct 22, 2026 ", "")]);
  const done = rows.filter((_, k) => idx(d.tripStage) >= [idx("enroute"), idx("arrived"), idx("loaded"), idx("transit"), idx("destination"), idx("delivered"), idx("delivered")][k]);
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <Header title="Trip History" sub="Recorded trip events" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3"><Sec title="Trip History">
        {done.map(([l, t]) => <div key={l} className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${BORDER}` }}><span className="text-[12px] font-bold" style={{ color: INK }}><span style={{ color: GREEN }}>✓</span> {l}</span><span className="text-[11px]" style={{ color: roleColor(role) }}>{t}</span></div>)}
      </Sec></div>
    </div>
  );
}

function DelayForm({ onSubmit, onBack }: { onSubmit: (r: string, eta: string, n: string) => void; onBack: () => void }) {
  const { AGREEMENT } = useBookingData();
  const [r, setR] = useState<string | null>(null);
  const [eta, setEta] = useState("5:00 PM");
  const [n, setN] = useState("");
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <Header title="Report Delay" sub={AGREEMENT.booking} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        <Sec title="Reason"><div className="flex flex-wrap gap-1.5">{DELAY_REASONS.map((x) => <button key={x} onClick={() => setR(x)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: r === x ? ORANGE : "rgba(0,0,0,0.04)", color: r === x ? "#fff" : INK, border: `1px solid ${r === x ? ORANGE : BORDER}` }}>{x}</button>)}</div></Sec>
        <Sec title="Updated ETA"><input value={eta} onChange={(e) => setEta(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-[14px] font-black outline-none" style={{ background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: INK }} />
          <textarea value={n} onChange={(e) => setN(e.target.value)} rows={2} placeholder="Short notes (optional)" className="w-full mt-2 px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none" style={{ background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: INK }} /></Sec>
        <Btn disabled={!r || !eta.trim()} onClick={() => r && onSubmit(r, eta.trim(), n)}>Submit Delay</Btn>
      </div>
    </div>
  );
}
function ProblemForm({ onSubmit, onBack }: { onSubmit: (p: string, n: string) => void; onBack: () => void }) {
  const { AGREEMENT } = useBookingData();
  const [r, setR] = useState<string | null>(null);
  const [n, setN] = useState("");
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <Header title="Report Problem" sub={AGREEMENT.booking} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        <Sec title="Problem Type"><div className="flex flex-wrap gap-1.5">{PROBLEM_TYPES.map((x) => <button key={x} onClick={() => setR(x)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: r === x ? ORANGE : "rgba(0,0,0,0.04)", color: r === x ? "#fff" : INK, border: `1px solid ${r === x ? ORANGE : BORDER}` }}>{x}</button>)}</div>
          <textarea value={n} onChange={(e) => setN(e.target.value)} rows={2} placeholder="Notes (optional)" className="w-full mt-3 px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none" style={{ background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: INK }} /></Sec>
        <Btn disabled={!r} onClick={() => r && onSubmit(r, n.trim())}>Submit Report</Btn>
      </div>
    </div>
  );
}

// ── Operator ───────────────────────────────────────────────────────────────────
export function OperatorTrip({ dispatch, onDispatch, onBack, onSOS, onBooking, locationSharing, locationError, liveLocation, onToggleLocationSharing }: { dispatch: Dispatch; onDispatch: Patch; onBack: () => void; onSOS: () => void; onBooking: () => void; locationSharing: boolean; locationError: string; liveLocation: LiveLocation | null; onToggleLocationSharing: () => void }) {
  const { TRUCK_LABEL, REQ, AGREEMENT, TRIP_TIMES, TIMES_DONE } = useBookingData();
  const [sub, setSub] = useState<null | "notice" | "delay" | "problem" | "history" | "pickupEv" | "deliveryEv" | "case" | "pay" | "txn">(null);
  const [modal, setModal] = useState<null | "start" | "loaded" | "delivered">(null);
  const [toast, setToast] = useState<string | null>(null);
  const s = dispatch.tripStage;
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1800); };
  const set = (tripStage: TripStage) => onDispatch({ tripStage });

  if (sub === "notice") {
    return (
      <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-3xl" style={{ background: "rgba(244,123,32,0.12)" }}>📍</div>
          <h2 className="text-[18px] font-black mb-2" style={{ color: INK }}>Location Sharing</h2>
          <p className="text-[12px] leading-relaxed" style={{ color: MUTED }}>Share your device GPS during this active trip. The location is sent to KadaGo and shown on the linked customer booking.</p>
        </div>
        <div className="px-4 pb-4"><Btn onClick={() => setSub(null)}>Open Active Hauling</Btn></div>
      </div>
    );
  }
  if (sub === "delay") return <DelayForm onBack={() => setSub(null)} onSubmit={async (reason, eta, notes) => { if (await onDispatch({ delay: { reason, eta, notes } }) !== false) { setSub(null); flash("Delay reported to KadaGo"); } }} />;
  if (sub === "problem") return <ProblemForm onBack={() => setSub(null)} onSubmit={async (p, n) => { if (await onDispatch({ problem: p, problemNote: n, problemAck: false }) !== false) { setSub(null); flash("Problem reported to KadaGo"); } }} />;
  if (sub === "history") return <History d={dispatch} role="operator" onBack={() => setSub(null)} />;
  if (sub === "pickupEv") return <PickupEvidenceView d={dispatch} role="operator" onBack={() => setSub(null)} />;
  if (sub === "deliveryEv") return <DeliveryEvidenceView d={dispatch} role="operator" onBack={() => setSub(null)} />;
  if (sub === "case") return <CaseView d={dispatch} role="operator" onDispatch={onDispatch} onBack={() => setSub(null)} />;
  if (sub === "pay") return <OperatorPayment d={dispatch} onDispatch={onDispatch} onBack={() => setSub(null)} onTransaction={() => setSub("txn")} />;
  if (sub === "txn") return <OperatorTransaction d={dispatch} onBack={() => setSub("pay")} />;

  if (s === "upcoming") {
    return (
      <div className="h-full flex flex-col relative" style={{ background: "#F8FAFF" }}>
        <Header title="Upcoming Pickup" sub={AGREEMENT.booking} onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
          <Banner tone="orange">UPCOMING PICKUP · Booking Confirmed</Banner>
          <Sec title="Booking">
            <Row k="Booking" v={AGREEMENT.booking} strong />
            <Row k="Customer" v={REQ.customer} />
            <Row k="Cargo" v={REQ.cargo} />
            <Row k="Weight" v={REQ.weight} />
            <Row k="Truck" v={TRUCK_LABEL} />
            <Row k="Pickup" v={REQ.pickup} />
            <Row k="Schedule" v={REQ.schedule} />
            <Row k="Destination" v={REQ.dest} />
          </Sec>
          <div className="space-y-2 pt-1"><Btn onClick={() => setModal("start")}>Start Trip to Pickup</Btn><Ghost onClick={onBooking}>View Booking</Ghost></div>
        </div>
        {modal === "start" && <Modal color={ORANGE} title="Start trip to pickup?" msg="This will begin the active hauling trip. You can then choose to share GPS from your device." ok="Start Trip" cancel="Cancel" onCancel={() => setModal(null)} onOk={async () => { if (await set("enroute") !== false) { setModal(null); setSub(null); } }} />}
      </div>
    );
  }

  if (s === "loading") return <ProofOfPickup dispatch={dispatch} onDispatch={onDispatch} onBack={onBack} />;
  if (s === "handover") return <ProofOfDelivery dispatch={dispatch} onDispatch={onDispatch} onBack={onBack} />;

  const mt = tripMetrics(dispatch);
  const primary: Record<string, { label: string; go: () => void } | undefined> = {
    enroute: { label: "I Arrived at Pickup", go: () => set("arrived") },
    arrived: { label: "Begin Cargo Pickup", go: () => set("loading") },
    loaded: { label: "Start Delivery", go: () => set("transit") },
    transit: { label: "Arrived at Destination", go: () => set("destination") },
    destination: { label: "Begin Delivery", go: () => set("handover") },
  };
  const p = primary[s];
  const toDest = idx(s) >= idx("loaded");
  return (
    <div className="h-full flex flex-col relative" style={{ background: "#F8FAFF" }}>
      <Header title={s === "delivered" ? "Delivery Recorded" : "Active Hauling"} sub={`${AGREEMENT.booking} · ${tripStatusText(dispatch)}`} onBack={onBack} right={<button onClick={onSOS} className="text-[11px] font-black px-3 py-1.5 rounded-full text-white" style={{ background: RED }}>SOS</button>} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {s === "delivered" ? (
          <>
            {dispatch.issue ? <Banner tone="red">Cargo Issue Reported · Case {dispatch.issue.id}</Banner> : dispatch.customerConfirm ? <Banner tone="green">Customer Confirmed Delivery</Banner> : <Banner tone="green">Delivered · {TRIP_TIMES.delivered}. Delivery evidence recorded. Waiting for customer confirmation.</Banner>}
            <TripSummary d={dispatch} role="operator" />
            {dispatch.customerConfirm && !dispatch.issue ? <Btn onClick={() => setSub("pay")}>{dispatch.pay?.status === "Pending Verification" ? "Review Payment Record" : dispatch.pay ? "View Payment" : "Payment Details"}</Btn> : null}
            {isCompleted(dispatch) && <Banner tone="green">🏁 Booking Completed · {TIMES_DONE.completed}</Banner>}
            {isCompleted(dispatch) && <NewRatingCard d={dispatch} />}
            {dispatch.customerConfirm && dispatch.issue && <Ghost onClick={() => setSub("pay")}>Payment Details</Ghost>}
            {dispatch.customerConfirm && !dispatch.issue ? <Ghost onClick={onBooking}>View Booking</Ghost> : <Btn onClick={onBooking}>View Booking</Btn>}
            <div className="flex items-center justify-between px-1"><span className="text-[10px] font-black" style={{ color: MUTED }}>PICKUP</span>{pickupChip(dispatch)}<span className="text-[10px] font-black" style={{ color: MUTED }}>DELIVERY</span>{deliveryChip(dispatch)}</div>
            <div className="grid grid-cols-2 gap-2"><Ghost onClick={() => setSub("pickupEv")}>Pickup Evidence</Ghost><Ghost onClick={() => setSub("deliveryEv")}>Delivery Evidence</Ghost></div>
            {dispatch.issue && <Ghost color={RED} onClick={() => setSub("case")}>Cargo Issue Details</Ghost>}
            <EvidenceTimeline d={dispatch} />
            <Ghost onClick={() => setSub("history")}>View Trip History</Ghost>
          </>
        ) : (
          <>
            <section className="rounded-2xl bg-white p-3" style={{ border: `1px solid ${BORDER}` }}>
              <div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-bold" style={{ color: INK }}>{locationSharing ? "Live location sharing is on" : "Share live GPS location"}</p><p className="mt-1 text-[10px] leading-relaxed" style={{ color: MUTED }}>{locationSharing ? liveLocation ? "Your location is visible to the customer on this booking." : "Waiting for a GPS fix..." : "When enabled, your device location is sent to KadaGo and shown to the customer for this active booking. The map uses OpenStreetMap, which receives the displayed map coordinates."}</p></div><button type="button" onClick={onToggleLocationSharing} className="shrink-0 rounded-xl px-3 py-2 text-[10px] font-bold text-white" style={{ background: locationSharing ? RED : BLUE }}>{locationSharing ? "Stop sharing" : "Start sharing"}</button></div>
              {locationError && <p role="alert" className="mt-2 text-[10px] text-red-700">{locationError}</p>}
            </section>
            <TripMap stage={s} delayed={!!dispatch.delay} liveLocation={liveLocation} />
            <TripSummary d={dispatch} role="operator" />
            {s === "arrived" && <Sec title="Pickup"><Row k="Arrival Time" v={TRIP_TIMES.arrivedPickup} strong /><Row k="Pickup" v={REQ.customer} /><Row k="Contact" v={REQ.rep} /><Row k="Instructions" v="Enter through Gate 2" /></Sec>}
            {s === "loaded" && <Sec accent="rgba(22,163,74,0.35)"><p className="text-[14px] font-black mb-1" style={{ color: "#15803d" }}>✅ Pickup Confirmed</p><Row k="Status" v="Cargo Loaded" strong /><Row k="Timestamp" v={TRIP_TIMES.loaded} strong /><div className="mt-2"><Ghost onClick={() => setSub("pickupEv")}>View Pickup Evidence</Ghost></div></Sec>}
            {(s === "destination") && <Sec title="Destination"><Row k="Arrival Time" v={TRIP_TIMES.arrivedDest} strong /><Row k="Destination" v={REQ.dest} /><Row k="Receiver" v="CDO Warehouse Manager" /><Row k="Instructions" v="Unload beside Warehouse B" /></Sec>}
            {s === "enroute" && <Sec title="Pickup"><Row k="Pickup Contact" v={REQ.rep} /><Row k="Pickup Address" v={REQ.pickup} /></Sec>}
            {toDest && s !== "destination" && <Sec title="Destination"><Row k="Destination" v={REQ.dest} /><Row k="Distance Remaining" v={mt.dist} strong /><Row k="ETA" v={mt.eta} strong /></Sec>}
            {p && <Btn onClick={p.go}>{p.label}</Btn>}
            <div className="grid grid-cols-2 gap-2">
              <Ghost onClick={() => flash("Calling customer (simulated)")}>Contact Customer</Ghost>
              <Ghost onClick={() => setSub("delay")}>Report Delay</Ghost>
              <Ghost onClick={() => setSub("problem")}>Report Problem</Ghost>
              <Ghost onClick={() => flash("Map opened (simulated)")}>Open Map</Ghost>
            </div>
          </>
        )}
      </div>
      {toast && <div className="absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[11px] font-bold text-white z-50" style={{ background: INK }}>{toast}</div>}
    </div>
  );
}

// ── Customer ───────────────────────────────────────────────────────────────────
export function CustomerTrack({ dispatch, onDispatch, onBack, liveLocation }: { dispatch: Dispatch; onDispatch: Patch; onBack: () => void; liveLocation?: LiveLocation | null }) {
  const { m, REQ, AGREEMENT, TRIP_TIMES } = useBookingData();
  type CSub = null | "history" | "sos" | "pickupEv" | "review" | "deliveryEv" | "report" | "issueDone" | "case" | "confirmed" | "pay";
  const [sub, setSub] = useState<CSub>(null);
  const [ask, setAsk] = useState(false);
  const s = dispatch.tripStage;
  const sent = !!dispatch.customerSOS;
  const delivered = s === "delivered";
  if (sub === "pay") return <CustomerPayment d={dispatch} onDispatch={onDispatch} onBack={() => setSub(null)} />;
  if (sub === "history") return <History d={dispatch} role="customer" onBack={() => setSub(null)} />;
  if (sub === "pickupEv") return <PickupEvidenceView d={dispatch} role="customer" onBack={() => setSub(null)} />;
  if (sub === "deliveryEv") return <DeliveryEvidenceView d={dispatch} role="customer" onBack={() => setSub(null)} />;
  if (sub === "case") return <CaseView d={dispatch} role="customer" onDispatch={onDispatch} onBack={() => setSub(null)} />;
  if (sub === "report") return <ReportIssueForm onBack={() => setSub("review")} onSubmit={async (type, desc, photos, note) => { if (await onDispatch({ issue: { id: "", type, desc, photos, note, status: "Under Review", response: null, adminNotes: [] } }) !== false) setSub("issueDone"); }} />;
  if (sub === "issueDone") return <SuccessScreen title="Cargo Issue Submitted" rows={[["Case ID", dispatch.issue?.id || "Pending"], ["Status", "Under Review"]]} msg="KadaGo Admin / Dispatch can review the pickup and delivery evidence." primary={["View Case", () => setSub("case")]} secondary={["Back to Booking", () => setSub(null)]} />;
  if (sub === "confirmed") return <SuccessScreen title="Delivery Confirmed" rows={[["Booking", AGREEMENT.booking], ["Status", "Customer Confirmed"]]} msg="Your delivery confirmation has been recorded. Next: review the payment." primary={["View Payment", () => setSub("pay")]} secondary={["Back to Booking", () => setSub(null)]} />;
  if (sub === "review") {
    const footer = dispatch.issue ? (
      <><Banner tone="red">Issue Under Review · Case {dispatch.issue.id}</Banner><Btn color={BLUE} onClick={() => setSub("case")}>View Case</Btn></>
    ) : dispatch.customerConfirm ? (
      <Banner tone="green">✓ Delivery Confirmed · Customer Confirmed</Banner>
    ) : (
      <div className="space-y-2"><Btn color={BLUE} onClick={() => setAsk(true)}>Confirm Delivery</Btn><Ghost color={RED} onClick={() => setSub("report")}>Report a Problem</Ghost></div>
    );
    return (
      <div className="h-full relative">
        <DeliveryEvidenceView d={dispatch} role="customer" onBack={() => setSub(null)} footer={footer} />
        {ask && (
          <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
            <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
              <h3 className="text-[16px] font-black mb-3" style={{ color: INK }}>Confirm cargo received?</h3>
              <div className="space-y-2">
                <Btn color={GREEN} onClick={async () => { if (await onDispatch({ customerConfirm: true }) !== false) { setAsk(false); setSub("confirmed"); } }}>Received as Expected</Btn>
                <Ghost color={RED} onClick={() => { setAsk(false); setSub("report"); }}>Received with Issue</Ghost>
                <Ghost color={BLUE} onClick={() => setAsk(false)}>Cancel</Ghost>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col relative" style={{ background: "#F8FAFF" }}>
      <Header title={delivered ? "Cargo Delivered" : s === "upcoming" ? "Truck Assigned" : "Track My Cargo"} sub={AGREEMENT.booking} onBack={onBack} right={<button onClick={() => setSub("sos")} className="text-[10px] font-black px-3 py-1.5 rounded-full" style={{ color: RED, border: `1.5px solid ${RED}`, background: "#fff" }}>Safety / SOS</button>} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {delivered && !dispatch.issue && !dispatch.customerConfirm && <Banner tone="green">Cargo Delivered · {TRIP_TIMES.delivered}. Please review and confirm the delivery.</Banner>}
        {delivered && dispatch.customerConfirm && <Banner tone="green">Delivery Confirmed · Customer Confirmed</Banner>}
        {delivered && dispatch.issue && <Banner tone="red">Issue Under Review · Case {dispatch.issue.id}</Banner>}
        {s === "upcoming" && <Banner tone="orange">TRUCK ASSIGNED · Pickup {REQ.schedule}. Tracking starts when the operator begins the trip.</Banner>}
        {delivered && !dispatch.customerConfirm && <Btn color={BLUE} onClick={() => setSub("review")}>Review Delivery</Btn>}
        {delivered && dispatch.customerConfirm && (
          <Sec title="Payment & Completion" accent={BLUE}>
            <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Cargo" v={REQ.cargo} /><Row k="Operator" v={m.business} />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>Payment</span><PayChip d={dispatch} /></div>
            <Row k="Status" v={tripStatusText(dispatch)} strong />
            <div className="mt-2 space-y-2">
              <Btn color={BLUE} onClick={() => setSub("pay")}>{isCompleted(dispatch) ? (dispatch.rating ? "View Booking" : "Rate Operator") : "View Payment"}</Btn>
              <Ghost color={BLUE} onClick={() => setSub("review")}>Review Delivery</Ghost>
            </div>
          </Sec>
        )}
        {mapStage(s) ? <TripMap stage={s} delayed={!!dispatch.delay} liveLocation={liveLocation} /> : s === "delivered" ? <TripHistoryCard onOpen={() => setSub("history")} /> : null}
        <TripSummary d={dispatch} role="customer" />
        <Sec title="Hauling Timeline"><HaulTimeline stage={s} confirmed={dispatch.customerConfirm} issue={!!dispatch.issue} completed={isCompleted(dispatch)} /></Sec>
        {idx(s) >= idx("loaded") && (
          <Sec title="Evidence">
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold" style={{ color: INK }}>Pickup</span>{pickupChip(dispatch)}</div>
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold" style={{ color: INK }}>Delivery</span>{deliveryChip(dispatch)}</div>
            <div className="grid grid-cols-2 gap-2"><Ghost color={BLUE} onClick={() => setSub("pickupEv")}>Pickup Evidence</Ghost><Ghost color={BLUE} onClick={() => setSub(dispatch.delivery ? "deliveryEv" : "review")}>Delivery Evidence</Ghost></div>
          </Sec>
        )}
        {idx(s) >= idx("loaded") && <EvidenceTimeline d={dispatch} />}
        {idx(s) >= idx("delivered") && <Ghost color={BLUE} onClick={() => setSub("history")}>View Trip History</Ghost>}
      </div>
      {sub === "sos" && !sent && <Modal color={RED} title="Send SOS?" msg="This saves an SOS alert with this booking and sends it to KadaGo Dispatch. It does not contact emergency services or share live GPS." ok="Send SOS to Dispatch" cancel="Cancel" onCancel={() => setSub(null)} onOk={() => { onDispatch({ customerSOS: "active", customerSOSReason: "Emergency reported during trip" }); }} />}
      {sub === "sos" && sent && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
          <div className="w-full rounded-t-3xl px-5 pt-5 pb-6 text-center" style={{ background: "#fff" }}>
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl mb-2" style={{ background: "rgba(22,163,74,0.12)" }}>✅</div>
            <h3 className="text-[16px] font-black mb-1" style={{ color: INK }}>SOS Sent</h3>
            <p className="text-[12px] mb-4" style={{ color: MUTED }}>{dispatch.customerSOS === "acknowledged" ? "KadaGo Dispatch acknowledged your saved alert." : `KadaGo Dispatch received your saved alert: ${dispatch.customerSOSReason || "Emergency reported during trip"}. No call was placed to emergency services.`}</p>
            <Ghost color={BLUE} onClick={() => setSub(null)}>Close</Ghost>
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomerHaulingCard({ dispatch, onTrack }: { dispatch: Dispatch; onTrack: () => void }) {
  const { m, REQ, AGREEMENT } = useBookingData();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${BLUE}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-1.5"><span className="text-[10px] font-black tracking-wider" style={{ color: BLUE }}>ACTIVE HAULING</span><Pill text={tripStatusText(dispatch)} bg="rgba(244,123,32,0.12)" fg="#c2410c" /></div>
        <p className="text-[13px] font-black" style={{ color: INK }}>{AGREEMENT.booking}</p>
        <Row k="Cargo" v={REQ.cargoShort} /><Row k="Route" v={REQ.route} /><Row k="Operator" v={m.business} />
      </div>
      <div className="px-4 pb-3"><button onClick={onTrack} className="w-full py-3 rounded-xl text-[13px] font-black text-white" style={{ background: BLUE }}>Track Cargo</button></div>
    </div>
  );
}

// ── Admin ──────────────────────────────────────────────────────────────────────
export function AdminTrack({ dispatch, onDispatch, onBack }: { dispatch: Dispatch; onDispatch: Patch; onBack: () => void }) {
  const { AGREEMENT, TRIP_TIMES } = useBookingData();
  const [sub, setSub] = useState<null | "pickupEv" | "deliveryEv" | "case">(null);
  const s = dispatch.tripStage;
  if (sub === "pickupEv") return <PickupEvidenceView d={dispatch} role="admin" onBack={() => setSub(null)} />;
  if (sub === "deliveryEv") return <DeliveryEvidenceView d={dispatch} role="admin" onBack={() => setSub(null)} />;
  if (sub === "case") return <CaseView d={dispatch} role="admin" onDispatch={onDispatch} onBack={() => setSub(null)} />;
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <Header title="Hauling Tracking" sub={AGREEMENT.booking} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {mapStage(s) ? <TripMap stage={s} delayed={!!dispatch.delay} /> : s === "delivered" ? <TripHistoryCard /> : <Banner tone="orange">TRUCK ASSIGNED · Trip not started yet. No map until the trip starts.</Banner>}
        <TripSummary d={dispatch} role="admin" />
        {dispatch.problem && <Banner tone="red">Problem reported: {dispatch.problem}</Banner>}
        {dispatch.issue && <button onClick={() => setSub("case")} className="w-full text-left"><Banner tone="red">⚠️ Cargo Issue {dispatch.issue.id} · {dispatch.issue.status} — tap to open case</Banner></button>}
        {s === "delivered" && <Sec title="Delivery"><Row k="Status" v="Delivered" strong /><Row k="Delivery Time" v={TRIP_TIMES.delivered} /></Sec>}
        <Sec title="Evidence Status">
          <Row k="Pickup Evidence" v={dispatch.pickup ? "Confirmed" : "Not recorded"} strong />
          <Row k="Delivery Evidence" v={dispatch.delivery ? "Confirmed" : "Not recorded"} strong />
          <Row k="Customer Confirmation" v={dispatch.customerConfirm ? "Confirmed" : "Pending"} strong />
          <Row k="Issue" v={dispatch.issue ? dispatch.issue.status : "None"} strong />
          <div className="grid grid-cols-2 gap-2 mt-2"><Ghost color={BLUE} onClick={() => setSub("pickupEv")}>Pickup Evidence</Ghost><Ghost color={BLUE} onClick={() => setSub("deliveryEv")}>Delivery Evidence</Ghost></div>
        </Sec>
        {s === "delivered" && <CompletionChecks d={dispatch} />}
        {s === "delivered" && dispatch.payIssue && <Banner tone="red">Payment dispute {dispatch.payIssue.id} · {dispatch.payIssue.status}</Banner>}
        <EvidenceTimeline d={dispatch} />
        <Sec title="Hauling Timeline"><HaulTimeline stage={s} confirmed={dispatch.customerConfirm} issue={!!dispatch.issue} completed={isCompleted(dispatch)} /></Sec>
      </div>
    </div>
  );
}

export function AdminTripCard({ dispatch, onView }: { dispatch: Dispatch; onView: () => void }) {
  const { m, TRUCK_LABEL, REQ, AGREEMENT } = useBookingData();
  const mt = tripMetrics(dispatch);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${dispatch.delay ? RED : BLUE}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[12px] font-black" style={{ color: INK }}>{AGREEMENT.booking}</span>
          <div className="flex gap-1">{dispatch.delay && <Pill text="DELAYED HAULING" bg="rgba(220,38,38,0.1)" fg={RED} />}<Pill text={TRIP_STATUS[dispatch.tripStage].toUpperCase()} bg="rgba(244,123,32,0.12)" fg="#c2410c" /></div>
        </div>
        <Row k="Customer" v={REQ.customer} /><Row k="Operator" v={m.business} /><Row k="Truck" v={TRUCK_LABEL} />
        <Row k="Last GPS Update" v="2 mins ago (Demo GPS — Simulated)" />
        <Row k="ETA" v={mt.eta} />
        {dispatch.problem && <Row k="Problem" v={dispatch.problem} />}
        <div className="mt-2"><button onClick={onView} className="w-full py-3 rounded-xl text-[12px] font-black text-white" style={{ background: BLUE }}>View Tracking</button></div>
      </div>
    </div>
  );
}

export function ReportedProblems({ dispatch, onDispatch, onBack, onBooking }: { dispatch: Dispatch; onDispatch: Patch; onBack: () => void; onBooking: () => void }) {
  const { m } = useBookingData();
  const { AGREEMENT } = useBookingData();
  const p = dispatch.problem;
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <Header title="Reported Problems" sub={p ? "1 active report" : "No active reports"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {!p && <p className="text-[12px] text-center pt-10" style={{ color: MUTED }}>No problems reported.</p>}
        {p && (
          <Sec accent="rgba(220,38,38,0.35)">
            <div className="flex justify-between items-center mb-1"><span className="text-[13px] font-black" style={{ color: INK }}>{AGREEMENT.booking}</span><Pill text={dispatch.problemAck ? "ACKNOWLEDGED" : "OPEN"} bg={dispatch.problemAck ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.1)"} fg={dispatch.problemAck ? "#15803d" : RED} /></div>
            <Row k="Reported by" v={m.driver} />
            <Row k="Type" v={p} strong />
            <Row k="Note" v={dispatch.problemNote || "No notes"} />
            <Row k="Status" v={dispatch.problemAck ? "Acknowledged" : "Open"} />
            <div className="space-y-2 mt-2">
              <Btn color={BLUE} onClick={onBooking}>View Booking</Btn>
              {!dispatch.problemAck && <Ghost color={BLUE} onClick={() => onDispatch({ problemAck: true })}>Mark Acknowledged</Ghost>}
            </div>
          </Sec>
        )}
      </div>
    </div>
  );
}
