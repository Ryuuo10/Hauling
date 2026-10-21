import { useState } from "react";
import { REQ, AGREEMENT, MATCHES, TRIP_TIMES } from "@/data/dispatchData";
import type { Dispatch, Photo, PickupEvidence, DeliveryEvidence } from "@/data/dispatchData";
import { BLUE, ORANGE, GREEN, RED, INK, MUTED, BORDER, roleColor, Row, Sec, Pill, Btn, Ghost, Header, Banner, Modal, HaulTimeline } from "@/features/hauling/TripUI";
import type { Role } from "@/features/hauling/TripUI";
import { uploadPhoto } from "@/api/bookings";
import { useBookings, useBookingData } from "@/features/customer/BookingContext";

type Patch = (p: Partial<Dispatch>) => void | Promise<boolean>;

// ── Photos (simulated) ─────────────────────────────────────────────────────────
let seq = 100;
const CATALOG: Record<Photo["stage"], string[]> = {
  Pickup: ["Cargo at loading area", "Tarp and tie-downs", "Loaded truck bed", "Cargo count"],
  Delivery: ["Cargo at Warehouse B", "Unloaded cargo", "Receiver check", "Delivery area"],
  Issue: ["Damaged packaging", "Torn sacks", "Cargo count"],
};
function newPhoto(stage: Photo["stage"], by: Photo["by"], count: number): Photo {
  const list = CATALOG[stage];
  return { id: ++seq, label: list[count % list.length], stage, by, time: new Date().toLocaleString() };
}
const TINTS = [["#DBEAFE", "#93C5FD"], ["#FEF3C7", "#FCD34D"], ["#DCFCE7", "#86EFAC"], ["#FFE4E6", "#FDA4AF"]];
function Thumb({ p, size, onClick, onRemove }: { p: Photo; size: number; onClick?: () => void; onRemove?: () => void }) {
  const t = TINTS[p.id % 4];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <button onClick={onClick} className="w-full h-full rounded-xl flex flex-col items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${t[0]}, ${t[1]})`, border: `1px solid ${BORDER}` }}>
        {p.attachmentId ? <img src={`/api/attachments/${p.attachmentId}`} alt={p.label} className="w-full min-h-0 flex-1 object-cover" /> : <span style={{ fontSize: size / 2.6 }}>📦</span>}
        {size >= 60 && <span className="text-[8px] font-bold px-1 text-center leading-tight" style={{ color: INK }}>{p.label}</span>}
      </button>
      {onRemove && <button onClick={onRemove} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: INK }}>✕</button>}
    </div>
  );
}
function Preview({ p, onClose }: { p: Photo; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[60] flex items-end" style={{ background: "rgba(13,24,40,0.6)" }}>
      <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
        <h3 className="text-[15px] font-black mb-3" style={{ color: INK }}>Evidence Preview</h3>
        <div className="mb-3"><div className="w-full"><Thumb p={p} size={170} /></div></div>
        <Row k="Stage" v={p.stage} /><Row k="Date / Time" v={p.time} /><Row k="Uploaded By" v={p.by} /><Row k="Photo" v={p.label} />
        <div className="mt-3"><Ghost color={BLUE} onClick={onClose}>Close</Ghost></div>
      </div>
    </div>
  );
}
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [prev, setPrev] = useState<Photo | null>(null);
  if (!photos.length) return <p className="text-[11px]" style={{ color: MUTED }}>No photos added.</p>;
  return (
    <>
      <div className="flex flex-wrap gap-2">{photos.map((p) => <Thumb key={p.id} p={p} size={64} onClick={() => setPrev(p)} />)}</div>
      {prev && <Preview p={prev} onClose={() => setPrev(null)} />}
    </>
  );
}
function Photos({ photos, onChange, stage, by, hint }: { photos: Photo[]; onChange: (p: Photo[]) => void; stage: Photo["stage"]; by: Photo["by"]; hint: string }) {
  const { selected } = useBookings();
  const [prev, setPrev] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const color = by === "Operator" ? ORANGE : BLUE;
  const add = async (file?: File) => {
    if (!file || !selected) return;
    setUploading(true); setError("");
    try { const attachment = await uploadPhoto(file, selected.id); onChange([...photos, { ...newPhoto(stage, by, photos.length), label: file.name, attachmentId: attachment.id }]); }
    catch (e) { setError(e instanceof Error ? e.message : "Photo upload failed."); }
    finally { setUploading(false); }
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <label className="py-4 rounded-2xl text-center text-[12px] font-black text-white active:opacity-80 cursor-pointer" style={{ background: color }}>{uploading ? "Uploading…" : "Take Photo"}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" disabled={uploading} onChange={(e) => { void add(e.target.files?.[0]); e.target.value = ""; }} /></label>
        <label className="py-4 rounded-2xl text-center text-[12px] font-black active:opacity-80 cursor-pointer" style={{ background: "#fff", color, border: `1.5px solid ${color}` }}>Upload Photo<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => { void add(e.target.files?.[0]); e.target.value = ""; }} /></label>
      </div>
      <p className="text-[10px] mt-1.5 mb-2" style={{ color: MUTED }}>{hint}</p>
      {error && <p role="alert" className="mb-2 text-[10px] text-red-600">{error}</p>}
      {photos.length > 0 && <div className="flex flex-wrap gap-2">{photos.map((p) => <Thumb key={p.id} p={p} size={64} onClick={() => setPrev(p)} onRemove={() => onChange(photos.filter((x) => x.id !== p.id))} />)}</div>}
      {prev && <Preview p={prev} onClose={() => setPrev(null)} />}
    </div>
  );
}

// ── Small form helpers ─────────────────────────────────────────────────────────
function Chips<T extends string>({ options, value, onChange, color = ORANGE }: { options: T[]; value: T | null; onChange: (v: T) => void; color?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((x) => <button key={x} onClick={() => onChange(x)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: value === x ? color : "rgba(0,0,0,0.04)", color: value === x ? "#fff" : INK, border: `1px solid ${value === x ? color : BORDER}` }}>{x}</button>)}
    </div>
  );
}
const inputStyle = { background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: INK };
function Text({ value, onChange, placeholder, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full mt-2 px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none" style={inputStyle} />;
}
function Input({ value, onChange, placeholder, mode }: { value: string; onChange: (v: string) => void; placeholder?: string; mode?: "numeric" }) {
  return <input value={value} inputMode={mode} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl text-[13px] font-bold outline-none" style={inputStyle} />;
}
function Check({ on, label, onToggle }: { on: boolean; label: string; onToggle?: () => void }) {
  return (
    <button onClick={onToggle} disabled={!onToggle} className="w-full flex items-center gap-2.5 py-1.5 text-left">
      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[12px] font-black text-white" style={{ background: on ? GREEN : "#fff", border: `1.5px solid ${on ? GREEN : "#CBD5E1"}` }}>{on ? "✓" : ""}</span>
      <span className="text-[12px] font-semibold" style={{ color: INK }}>{label}</span>
    </button>
  );
}
function Stamp({ k, v }: { k: string; v: string }) {
  return <Row k={k} v={v} strong />;
}
const Scroll = ({ children }: { children: React.ReactNode }) => <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">{children}</div>;
const Page = ({ children }: { children: React.ReactNode }) => <div className="h-full flex flex-col relative" style={{ background: "#F8FAFF" }}>{children}</div>;

// ── Status chips ───────────────────────────────────────────────────────────────
export function pickupIssue(p: PickupEvidence, expected = parseFloat(REQ.quantity) || 0) { return p.condition !== "Good Condition" || p.qty !== expected; }
export function deliveryIssue(p: DeliveryEvidence, expected = parseFloat(REQ.quantity) || 0) { return p.condition !== "Good Condition" || p.qty !== expected; }
export function pickupChip(d: Dispatch) {
  const green = ["rgba(22,163,74,0.12)", "#15803d"], gray = ["rgba(100,116,139,0.12)", MUTED], org = ["rgba(244,123,32,0.12)", "#c2410c"], red = ["rgba(220,38,38,0.1)", RED];
  const t = d.pickup ? (pickupIssue(d.pickup) ? ["Issue Recorded", red] : ["Confirmed", green]) : d.tripStage === "arrived" || d.tripStage === "loading" ? ["In Progress", org] : ["Not Started", gray];
  return <Pill text={t[0] as string} bg={(t[1] as string[])[0]} fg={(t[1] as string[])[1]} />;
}
export function deliveryChip(d: Dispatch) {
  const green = ["rgba(22,163,74,0.12)", "#15803d"], gray = ["rgba(100,116,139,0.12)", MUTED], org = ["rgba(244,123,32,0.12)", "#c2410c"], red = ["rgba(220,38,38,0.1)", RED];
  const t = d.issue ? ["Issue Reported", red] : d.customerConfirm ? ["Customer Confirmed", green] : d.tripStage === "delivered" ? ["Delivered", green] : d.tripStage === "handover" ? ["Evidence Added", org] : ["Awaiting Delivery", gray];
  return <Pill text={t[0] as string} bg={(t[1] as string[])[0]} fg={(t[1] as string[])[1]} />;
}

// ── Proof of Pickup ────────────────────────────────────────────────────────────
export function ProofOfPickup({ dispatch, onDispatch, onBack }: { dispatch: Dispatch; onDispatch: Patch; onBack: () => void }) {
  const { EXPECTED_QTY, TRUCK, OPERATOR, REQ, AGREEMENT, TRIP_TIMES } = useBookingData();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cond, setCond] = useState<PickupEvidence["condition"]>("Good Condition");
  const [condNote, setCondNote] = useState("");
  const [condPhotos, setCondPhotos] = useState<Photo[]>([]);
  const [qty, setQty] = useState(String(EXPECTED_QTY));
  const [qtyNote, setQtyNote] = useState("");
  const [wMode, setWMode] = useState<"confirm" | "adjust">("confirm");
  const [weight, setWeight] = useState(REQ.weight);
  const [wReason, setWReason] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [ties, setTies] = useState(false);
  const [tarp, setTarp] = useState(false);
  const [notes, setNotes] = useState("");
  const [ask, setAsk] = useState(false);
  void dispatch;
  const needTarp = /tarp/i.test(REQ.requirements);
  const qn = parseInt(qty, 10) || 0;
  const qtyOk = qn === EXPECTED_QTY;
  const condOk = cond === "Good Condition" || condNote.trim().length > 0;
  const qOk = qtyOk || qtyNote.trim().length > 0;
  const wOk = wMode === "confirm" || (weight.trim().length > 0 && wReason.trim().length > 0);
  const ready = photos.length > 0 && condOk && qOk && wOk && loaded && ties && (!needTarp || tarp);
  const save = () => {
    const ev: PickupEvidence = { photos: [...photos, ...condPhotos], condition: cond, condNote: condNote.trim(), qty: qn, qtyNote: qtyNote.trim(), weight: wMode === "confirm" ? REQ.weight : weight.trim(), weightReason: wMode === "adjust" ? wReason.trim() : "", notes: notes.trim() };
    onDispatch({ pickup: ev, tripStage: "loaded" });
  };
  return (
    <Page>
      <Header title="Proof of Pickup" sub="Confirm the cargo details before departure." onBack={onBack} />
      <Scroll>
        <Sec title="Pickup Summary">
          <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={REQ.customer} /><Row k="Cargo" v={REQ.cargo} />
          <Row k="Expected Quantity" v={REQ.quantity} /><Row k="Expected Weight" v={REQ.weight} /><Row k="Pickup" v={REQ.pickup} />
          <Row k="Truck" v={TRUCK} /><Row k="Operator" v={OPERATOR} />
        </Sec>
        <Sec title="Pickup Photos">
          <Photos photos={photos} onChange={setPhotos} stage="Pickup" by="Operator" hint="Add clear photos showing the cargo before departure." />
        </Sec>
        <Sec title="Timestamps"><Stamp k="Arrived at Pickup" v={TRIP_TIMES.arrivedPickup} /><Stamp k="Cargo Loaded" v={TRIP_TIMES.loaded} /></Sec>
        <Sec title="Cargo Condition at Pickup">
          <Chips options={["Good Condition", "Minor Issue", "Damage / Discrepancy"]} value={cond} onChange={setCond} />
          {cond !== "Good Condition" && (
            <div className="mt-2">
              <Text value={condNote} onChange={setCondNote} placeholder="Add Condition Note — e.g. Two sacks had torn outer packaging before loading." />
              <div className="mt-2"><Photos photos={condPhotos} onChange={setCondPhotos} stage="Pickup" by="Operator" hint="Add Evidence Photo" /></div>
            </div>
          )}
        </Sec>
        <Sec title="Quantity">
          <Row k="Expected Quantity" v={REQ.quantity} />
          <div className="flex items-center gap-2 mt-1"><span className="text-[11px]" style={{ color: MUTED }}>Actual Loaded</span><div className="flex-1"><Input value={qty} onChange={setQty} mode="numeric" /></div><span className="text-[11px] font-bold" style={{ color: INK }}>units</span></div>
          <div className="mt-2">{qtyOk ? <Banner tone="green">✓ Quantity Confirmed</Banner> : <><Banner tone="orange">Loaded quantity does not match the request.</Banner><Text value={qtyNote} onChange={setQtyNote} placeholder="Short note (required)" /></>}</div>
        </Sec>
        <Sec title="Weight">
          <Row k="Expected Weight" v={REQ.weight} />
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button onClick={() => setWMode("confirm")} className="py-2.5 rounded-xl text-[12px] font-black" style={{ background: wMode === "confirm" ? GREEN : "#fff", color: wMode === "confirm" ? "#fff" : GREEN, border: `1.5px solid ${GREEN}` }}>Confirm {REQ.weight}</button>
            <button onClick={() => setWMode("adjust")} className="py-2.5 rounded-xl text-[12px] font-black" style={{ background: wMode === "adjust" ? ORANGE : "#fff", color: wMode === "adjust" ? "#fff" : ORANGE, border: `1.5px solid ${ORANGE}` }}>Adjust</button>
          </div>
          {wMode === "adjust" && <div className="mt-2 space-y-2"><Input value={weight} onChange={setWeight} placeholder="Confirmed weight" /><Text value={wReason} onChange={setWReason} placeholder="Reason (required) — e.g. Updated after warehouse weighing." /></div>}
        </Sec>
        <Sec title="Checklist">
          <Check on label="Cargo details checked" />
          <Check on={qOk} label="Quantity confirmed" />
          <Check on={condOk} label="Cargo condition reviewed" />
          <Check on={loaded} label="Cargo loaded" onToggle={() => setLoaded(!loaded)} />
          <Check on={ties} label="Tie-downs secured" onToggle={() => setTies(!ties)} />
          {needTarp && <Check on={tarp} label="Tarp installed" onToggle={() => setTarp(!tarp)} />}
        </Sec>
        <Sec title="Pickup Notes (optional)"><Text value={notes} onChange={setNotes} placeholder="Add a short note if needed." /></Sec>
        <Btn disabled={!ready} onClick={() => setAsk(true)}>Confirm Pickup</Btn>
        {!ready && <p className="text-[10px] text-center" style={{ color: MUTED }}>Add a photo, finish the checklist and any required notes to confirm pickup.</p>}
      </Scroll>
      {ask && <Modal color={ORANGE} title="Confirm cargo pickup?" msg="This will record the pickup evidence and cargo condition." ok="Confirm Pickup" cancel="Review Again" onCancel={() => setAsk(false)} onOk={save} />}
    </Page>
  );
}

// ── Proof of Delivery ──────────────────────────────────────────────────────────
type Ack = "Receiver Confirmed" | "Sign Here" | "4-Digit Code";
export function ProofOfDelivery({ dispatch, onDispatch, onBack }: { dispatch: Dispatch; onDispatch: Patch; onBack: () => void }) {
  const { EXPECTED_QTY, OPERATOR, REQ, AGREEMENT, TRIP_TIMES } = useBookingData();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { selected } = useBookings();
  const [receiver, setReceiver] = useState(selected?.request.delivery.contact || "");
  const [role, setRole] = useState("");
  const [ack, setAck] = useState<Ack | null>(null);
  const [signed, setSigned] = useState(false);
  const [code, setCode] = useState("");
  const [qty, setQty] = useState(String(EXPECTED_QTY));
  const [qtyNote, setQtyNote] = useState("");
  const [cond, setCond] = useState<DeliveryEvidence["condition"]>("Good Condition");
  const [condNote, setCondNote] = useState("");
  const [marked, setMarked] = useState(true);
  const [issuePhotos, setIssuePhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState("");
  const [ask, setAsk] = useState(false);
  void dispatch;
  const qn = parseInt(qty, 10) || 0;
  const qtyOk = qn === EXPECTED_QTY;
  const condOk = cond === "Good Condition" || condNote.trim().length > 0;
  const ackOk = ack === "Receiver Confirmed" || (ack === "Sign Here" && signed) || (ack === "4-Digit Code" && /^\d{4}$/.test(code));
  const ready = photos.length > 0 && receiver.trim().length > 0 && ackOk && (qtyOk || qtyNote.trim().length > 0) && condOk;
  const save = () => {
    const ackText = ack === "Sign Here" ? "Signed on screen (demo)" : ack === "4-Digit Code" ? `Confirmation code ${code}` : "Receiver Confirmed";
    const ev: DeliveryEvidence = { photos: [...photos, ...issuePhotos], receiver: receiver.trim(), receiverRole: role.trim(), ack: ackText, qty: qn, qtyNote: qtyNote.trim(), condition: cond, condNote: condNote.trim(), issueMarked: cond !== "Good Condition" && marked, notes: notes.trim() };
    onDispatch({ delivery: ev, tripStage: "delivered" });
  };
  return (
    <Page>
      <Header title="Proof of Delivery" sub="Record the delivered cargo and receiver confirmation." onBack={onBack} />
      <Scroll>
        <Sec title="Delivery Summary">
          <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={REQ.customer} /><Row k="Cargo" v={REQ.cargo} />
          <Row k="Expected Quantity" v={REQ.quantity} /><Row k="Destination" v={REQ.dest} /><Row k="Receiver" v={receiver || "Not specified"} /><Row k="Operator" v={OPERATOR} />
        </Sec>
        <Sec title="Delivery Photos"><Photos photos={photos} onChange={setPhotos} stage="Delivery" by="Operator" hint="Add clear photos showing the delivered cargo." /></Sec>
        <Sec title="Timestamps"><Stamp k="Arrived at Destination" v={TRIP_TIMES.arrivedDest} /><Stamp k="Delivered" v={TRIP_TIMES.delivered} /></Sec>
        <Sec title="Receiver Information">
          <p className="text-[10px] mb-1" style={{ color: MUTED }}>Receiver Name</p><Input value={receiver} onChange={setReceiver} />
          <p className="text-[10px] mt-2 mb-1" style={{ color: MUTED }}>Receiver Role (optional)</p><Input value={role} onChange={setRole} />
        </Sec>
        <Sec title="Receiver Acknowledgment">
          <Chips options={["Receiver Confirmed", "Sign Here", "4-Digit Code"]} value={ack} onChange={setAck} />
          {ack === "Sign Here" && (
            <button onClick={() => setSigned(true)} className="w-full mt-2 h-24 rounded-xl flex items-center justify-center" style={{ background: "#fff", border: `2px dashed ${signed ? GREEN : "#CBD5E1"}` }}>
              {signed ? <svg width="140" height="50" viewBox="0 0 140 50"><path d="M5 35 C 20 5, 30 45, 45 20 S 70 5, 80 30 S 105 40, 135 12" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg> : <span className="text-[12px] font-bold" style={{ color: MUTED }}>✍️ Tap to sign here</span>}
            </button>
          )}
          {ack === "4-Digit Code" && <div className="mt-2 flex gap-2 items-center"><div className="flex-1"><Input value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 4))} placeholder="Enter 4-digit code" mode="numeric" /></div><button onClick={() => setCode("4721")} className="text-[11px] font-bold px-2" style={{ color: ORANGE }}>Use 4721</button></div>}
          <p className="text-[9px] mt-2" style={{ color: MUTED }}>Demo acknowledgment only. Not a legally certified electronic signature.</p>
        </Sec>
        <Sec title="Delivery Quantity">
          <Row k="Expected" v={REQ.quantity} />
          <div className="flex items-center gap-2 mt-1"><span className="text-[11px]" style={{ color: MUTED }}>Delivered</span><div className="flex-1"><Input value={qty} onChange={setQty} mode="numeric" /></div><span className="text-[11px] font-bold" style={{ color: INK }}>units</span></div>
          <div className="mt-2">{qtyOk ? <Banner tone="green">✓ Quantity Complete</Banner> : <><Banner tone="red">Shortage Detected</Banner><Text value={qtyNote} onChange={setQtyNote} placeholder="Short note (required)" /></>}</div>
        </Sec>
        <Sec title="Cargo Condition at Delivery">
          <Chips options={["Good Condition", "Minor Damage", "Major Damage", "Missing / Shortage"]} value={cond} onChange={setCond} />
          {cond !== "Good Condition" && (
            <div className="mt-2">
              <Text value={condNote} onChange={setCondNote} placeholder="Description (required)" />
              <div className="mt-2"><Photos photos={issuePhotos} onChange={setIssuePhotos} stage="Delivery" by="Operator" hint="Upload Photo of the issue." /></div>
              <div className="mt-1"><Check on={marked} label="Mark as Issue" onToggle={() => setMarked(!marked)} /></div>
            </div>
          )}
        </Sec>
        <Sec title="Delivery Notes (optional)"><Text value={notes} onChange={setNotes} placeholder="e.g. Cargo unloaded at Warehouse B. Receiver confirmed quantity." /></Sec>
        <Btn disabled={!ready} onClick={() => setAsk(true)}>Confirm Delivered</Btn>
        {!ready && <p className="text-[10px] text-center" style={{ color: MUTED }}>Add a photo, receiver acknowledgment and any required notes to confirm delivery.</p>}
      </Scroll>
      {ask && <Modal color={ORANGE} title="Confirm delivery?" msg="Make sure the delivered quantity, condition, and receiver acknowledgment are correct." ok="Confirm Delivered" cancel="Review Again" onCancel={() => setAsk(false)} onOk={save} />}
    </Page>
  );
}

// ── Read-only evidence views ───────────────────────────────────────────────────
export function PickupEvidenceView({ d, role, onBack }: { d: Dispatch; role: Role; onBack: () => void }) {
  const { TRUCK, OPERATOR, AGREEMENT, TRIP_TIMES } = useBookingData();
  const p = d.pickup;
  return (
    <Page>
      <Header title="Pickup Evidence" sub={`${AGREEMENT.booking} · Read-only`} onBack={onBack} right={pickupChip(d)} />
      <Scroll>
        {!p ? <Banner tone="orange">Pickup evidence has not been recorded yet.</Banner> : (
          <>
            <Sec title="Pickup Details">
              <Row k="Pickup Date / Time" v={TRIP_TIMES.loaded} strong /><Row k="Operator" v={OPERATOR} /><Row k="Truck" v={TRUCK} />
              <Row k="Loaded Quantity" v={`${p.qty} units`} strong /><Row k="Confirmed Weight" v={p.weight} />
              {p.weightReason && <Row k="Weight Note" v={p.weightReason} />}
              {p.qtyNote && <Row k="Quantity Note" v={p.qtyNote} />}
              <Row k="Cargo Condition" v={p.condition} strong />
              {p.condNote && <Row k="Condition Note" v={p.condNote} />}
              <Row k="Status" v={pickupIssue(p) ? "Issue Recorded" : "Pickup Confirmed"} />
            </Sec>
            <Sec title="Pickup Photos"><PhotoGrid photos={p.photos} /></Sec>
            <Sec title="Pickup Checklist"><p className="text-[11px]" style={{ color: "#15803d" }}>✓ Cargo details checked · ✓ Quantity confirmed · ✓ Condition reviewed · ✓ Cargo loaded · ✓ Tie-downs secured</p></Sec>
            <Sec title="Operator Notes"><p className="text-[12px]" style={{ color: INK }}>{p.notes || "No notes added."}</p></Sec>
          </>
        )}
        <p className="text-[9px] text-center" style={{ color: roleColor(role) }}>Evidence is visible only to the customer, assigned operator and KadaGo Admin / Dispatch.</p>
      </Scroll>
    </Page>
  );
}
export function DeliveryEvidenceView({ d, role, onBack, footer }: { d: Dispatch; role: Role; onBack: () => void; footer?: React.ReactNode }) {
  const { TRUCK, OPERATOR, AGREEMENT, TRIP_TIMES } = useBookingData();
  const p = d.delivery;
  return (
    <Page>
      <Header title="Delivery Evidence" sub={`${AGREEMENT.booking} · Read-only`} onBack={onBack} right={deliveryChip(d)} />
      <Scroll>
        {!p ? <Banner tone="orange">Delivery evidence has not been recorded yet.</Banner> : (
          <>
            <Sec title="Delivery Details">
              <Row k="Delivery Time" v={TRIP_TIMES.delivered} strong /><Row k="Operator" v={OPERATOR} /><Row k="Truck" v={TRUCK} />
              <Row k="Receiver" v={p.receiverRole ? `${p.receiver} (${p.receiverRole})` : p.receiver} />
              <Row k="Delivered Quantity" v={`${p.qty} units`} strong />
              {p.qtyNote && <Row k="Quantity Note" v={p.qtyNote} />}
              <Row k="Cargo Condition" v={p.condition} strong />
              {p.condNote && <Row k="Condition Note" v={p.condNote} />}
              {p.issueMarked && <Row k="Operator Flag" v="Marked as Issue" />}
            </Sec>
            <Sec title="Delivery Photos"><PhotoGrid photos={p.photos} /></Sec>
            <Sec title="Receiver Acknowledgment"><Row k="Acknowledgment" v={p.ack} strong /><p className="text-[9px] mt-1" style={{ color: MUTED }}>Demo acknowledgment, not a certified e-signature.</p></Sec>
            <Sec title="Operator Notes"><p className="text-[12px]" style={{ color: INK }}>{p.notes || "No notes added."}</p></Sec>
          </>
        )}
        {footer}
        <p className="text-[9px] text-center" style={{ color: roleColor(role) }}>Evidence is visible only to the customer, assigned operator and KadaGo Admin / Dispatch.</p>
      </Scroll>
    </Page>
  );
}

export function EvidenceTimeline({ d }: { d: Dispatch }) {
  const { TRIP_TIMES } = useBookingData();
  const rows: [string, string, boolean][] = [
    ["Pickup Confirmed", d.pickup ? TRIP_TIMES.loaded : "Pending", !!d.pickup],
    ["Cargo Loaded", d.pickup ? TRIP_TIMES.loaded : "Pending", !!d.pickup],
    ["Delivered", d.delivery ? TRIP_TIMES.delivered : "Pending", !!d.delivery],
    ["Customer Confirmation", d.customerConfirm ? "Confirmed" : d.issue ? "Issue reported" : "Pending", d.customerConfirm],
  ];
  return (
    <Sec title="Evidence Timeline">
      {rows.map(([l, v, ok]) => (
        <div key={l} className="flex justify-between py-1.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <span className="text-[12px] font-bold" style={{ color: INK }}><span style={{ color: ok ? GREEN : "#CBD5E1" }}>{ok ? "✓" : "○"}</span> {l}</span>
          <span className="text-[11px] font-semibold" style={{ color: ok ? GREEN : MUTED }}>{v}</span>
        </div>
      ))}
      <div className="flex justify-between py-1.5"><span className="text-[12px] font-bold" style={{ color: INK }}>Issue</span><span className="text-[11px] font-bold" style={{ color: d.issue ? RED : MUTED }}>{d.issue ? d.issue.status : "None"}</span></div>
      {d.tripStage === "delivered" && !d.issue && <div className="mt-1"><Banner tone="green">✓ No Delivery Issues Reported</Banner></div>}
    </Sec>
  );
}

// ── Customer issue flow ────────────────────────────────────────────────────────
const ISSUE_TYPES = ["Missing Cargo", "Cargo Shortage", "Visible Damage", "Incorrect Cargo", "Delivery Condition Issue", "Other"];
export function ReportIssueForm({ onBack, onSubmit }: { onBack: () => void; onSubmit: (type: string, desc: string, photos: Photo[], note: string) => void }) {
  const { m, TRUCK, REQ, AGREEMENT } = useBookingData();
  const [type, setType] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  return (
    <Page>
      <Header title="Report Cargo Issue" sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        <Sec title="Attached Automatically"><Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={REQ.customer} /><Row k="Operator" v={m.business} /><Row k="Truck" v={TRUCK} /></Sec>
        <Sec title="Issue Type"><Chips options={ISSUE_TYPES} value={type} onChange={setType} color={BLUE} />{tried && !type && <p className="text-[11px] font-bold mt-1.5" style={{ color: RED }}>Please choose an issue type.</p>}</Sec>
        <Sec title="What happened?"><Text value={desc} onChange={setDesc} placeholder="e.g. Three sacks arrived with damaged packaging." />{tried && !desc.trim() && <p className="text-[11px] font-bold mt-1.5" style={{ color: RED }}>Please describe the issue.</p>}</Sec>
        <Sec title="Evidence"><Photos photos={photos} onChange={setPhotos} stage="Issue" by="Customer" hint="Add photos of the issue (optional)." /><Text value={note} onChange={setNote} placeholder="Add Note (optional)" /></Sec>
        <Btn color={BLUE} onClick={() => { setTried(true); if (type && desc.trim()) onSubmit(type, desc.trim(), photos, note.trim()); }}>Submit Issue</Btn>
        <p className="text-[10px] text-center" style={{ color: MUTED }}>KadaGo Admin / Dispatch will review the evidence. No automatic refund or compensation is promised.</p>
      </Scroll>
    </Page>
  );
}
export function SuccessScreen({ title, rows, msg, primary, secondary, color = GREEN }: { title: string; rows: [string, string][]; msg: string; primary: [string, () => void]; secondary?: [string, () => void]; color?: string }) {
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3" style={{ background: "rgba(22,163,74,0.12)" }}>✅</div>
        <h2 className="text-[18px] font-black mb-3" style={{ color: INK }}>{title}</h2>
        <div className="w-full mb-3"><Sec>{rows.map(([k, v]) => <Row key={k} k={k} v={v} strong />)}</Sec></div>
        <p className="text-[12px]" style={{ color: MUTED }}>{msg}</p>
      </div>
      <div className="px-4 pb-4 space-y-2"><Btn color={color === GREEN ? BLUE : color} onClick={primary[1]}>{primary[0]}</Btn>{secondary && <Ghost color={BLUE} onClick={secondary[1]}>{secondary[0]}</Ghost>}</div>
    </div>
  );
}

// ── Case view (operator / admin / customer) ────────────────────────────────────
export function CaseView({ d, role, onDispatch, onBack }: { d: Dispatch; role: Role; onDispatch: Patch; onBack: () => void }) {
  const { m, TRUCK, REQ, AGREEMENT } = useBookingData();
  const { resolveIssue } = useBookings();
  const [sub, setSub] = useState<null | "pickup" | "delivery">(null);
  const [respond, setRespond] = useState(false);
  const [text, setText] = useState("");
  const [rp, setRp] = useState<Photo[]>([]);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const is = d.issue;
  if (sub === "pickup") return <PickupEvidenceView d={d} role={role} onBack={() => setSub(null)} />;
  if (sub === "delivery") return <DeliveryEvidenceView d={d} role={role} onBack={() => setSub(null)} />;
  if (!is) return <Page><Header title="Cargo Issue" sub={AGREEMENT.booking} onBack={onBack} /><Scroll><Banner tone="green">✓ No Delivery Issues Reported</Banner></Scroll></Page>;
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1800); };
  const accent = roleColor(role);
  return (
    <Page>
      <Header title={role === "operator" ? "Cargo Issue Details" : `Case ${is.id}`} sub={`${is.id} · ${AGREEMENT.booking}`} onBack={onBack} right={<Pill text={is.status.toUpperCase()} bg="rgba(220,38,38,0.1)" fg={RED} />} />
      <Scroll>
        <Sec title="Customer Report" accent="rgba(220,38,38,0.3)">
          <Row k="Case ID" v={is.id} strong /><Row k="Booking" v={AGREEMENT.booking} /><Row k="Issue Type" v={is.type} strong /><Row k="Customer" v={REQ.customer} />
          <p className="text-[12px] mt-1.5" style={{ color: INK }}>{is.desc}</p>
          {is.note && <p className="text-[11px] mt-1" style={{ color: MUTED }}>Note: {is.note}</p>}
          <div className="mt-2"><PhotoGrid photos={is.photos} /></div>
        </Sec>
        <Sec title="Operator Response">
          {is.response ? <><p className="text-[12px]" style={{ color: INK }}>{is.response.text}</p><div className="mt-2"><PhotoGrid photos={is.response.photos} /></div></> : <p className="text-[11px]" style={{ color: MUTED }}>No operator response yet.</p>}
        </Sec>
        {role === "admin" && (
          <>
            <Sec title="Cargo Information"><Row k="Cargo" v={REQ.cargo} /><Row k="Expected Quantity" v={REQ.quantity} /><Row k="Operator" v={m.business} /><Row k="Truck" v={TRUCK} /><Row k="Current Status" v={is.status} strong /></Sec>
            <Sec title="Booking Timeline"><HaulTimeline stage={d.tripStage} confirmed={d.customerConfirm} issue /></Sec>
            {is.adminNotes.length > 0 && <Sec title="Admin Notes">{is.adminNotes.map((n, k) => <p key={k} className="text-[12px] py-0.5" style={{ color: INK }}>• {n}</p>)}</Sec>}
          </>
        )}
        <Sec title="Evidence">
          <div className="grid grid-cols-2 gap-2"><Ghost color={accent} onClick={() => setSub("pickup")}>Pickup Evidence</Ghost><Ghost color={accent} onClick={() => setSub("delivery")}>Delivery Evidence</Ghost></div>
        </Sec>
        {role === "operator" && !is.response && !respond && <Btn onClick={() => setRespond(true)}>Add Operator Response</Btn>}
        {role === "operator" && respond && !is.response && (
          <Sec title="Operator Response">
            <Text value={text} onChange={setText} placeholder="Short response" />
            <div className="mt-2"><Photos photos={rp} onChange={setRp} stage="Delivery" by="Operator" hint="Upload Evidence (optional)." /></div>
            <div className="mt-2"><Btn disabled={!text.trim()} onClick={async () => { if (await onDispatch({ issue: { ...is, response: { text: text.trim(), photos: rp } } }) !== false) { setRespond(false); flash("Response submitted"); } }}>Submit Response</Btn></div>
          </Sec>
        )}
        {role === "operator" && <p className="text-[9px] text-center" style={{ color: MUTED }}>Customer evidence cannot be edited or deleted.</p>}
        {role === "admin" && (
          <Sec title="Admin Actions">
            <Text value={note} onChange={setNote} placeholder="Add Admin Note" rows={2} />
            <div className="space-y-2 mt-2">
              <Ghost color={BLUE} onClick={async () => { if (note.trim()) { if (await onDispatch({ issue: { ...is, adminNotes: [...is.adminNotes, note.trim()] } }) !== false) { setNote(""); flash("Admin note added"); } } else flash("Type a note first"); }}>Add Admin Note</Ghost>
              <Ghost color={BLUE} onClick={async () => { if (await onDispatch({ issue: { ...is, status: "More Information Requested" } }) !== false) flash("Information requested"); }}>Request More Information</Ghost>
              <Btn color={BLUE} onClick={async () => { if (await onDispatch({ issue: { ...is, status: "Under Review" } }) !== false) flash("Marked Under Review"); }}>Mark Under Review</Btn>
              <Btn color={GREEN} disabled={!note.trim()} onClick={async () => { if (await resolveIssue(note.trim())) setNote(""); }}>Resolve Issue</Btn>
            </div>
            <p className="text-[9px] mt-2 text-center" style={{ color: MUTED }}>Enter a resolution note before resolving the issue. No automatic refund or compensation is issued.</p>
          </Sec>
        )}
      </Scroll>
      {toast && <div className="absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[11px] font-bold text-white z-50" style={{ background: INK }}>{toast}</div>}
    </Page>
  );
}
