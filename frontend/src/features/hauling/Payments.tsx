import { uploadPhoto } from "@/api/bookings";
import { useBookings, useBookingData } from "@/features/customer/BookingContext";
import { useState } from "react";
import { REQ, QUOTE, AGREEMENT, MATCHES, peso, monthlyPayments, payTotals, payStatus, isCompleted, blockingIssue, TIMES_DONE } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";
import { Row, Sec, Pill, Btn, Ghost, Header, Banner, Modal, BLUE, ORANGE, GREEN, RED, INK, MUTED, BORDER } from "@/features/hauling/TripUI";
import type { Role } from "@/features/hauling/TripUI";
import { SuccessScreen } from "@/features/hauling/Evidence";

type Patch = (p: Partial<Dispatch>) => void | Promise<boolean>;
const METHODS = ["Bank Transfer", "GCash", "Maya", "Cash", "Other"];

// ── helpers ────────────────────────────────────────────────────────────────────
const Page = ({ children }: { children: React.ReactNode }) => <div className="h-full flex flex-col relative" style={{ background: "#F8FAFF" }}>{children}</div>;
const Scroll = ({ children }: { children: React.ReactNode }) => <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">{children}</div>;
const Foot = ({ children }: { children: React.ReactNode }) => <div className="flex-shrink-0 px-4 py-3 space-y-2" style={{ background: "#fff", borderTop: `1px solid ${BORDER}` }}>{children}</div>;
const field = { background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: INK };
function Label({ children }: { children: React.ReactNode }) { return <p className="text-[10px] font-black tracking-wider mb-1 mt-2.5" style={{ color: MUTED }}>{children}</p>; }
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl text-[13px] font-bold outline-none" style={field} />;
}
function Notes({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none" style={field} />;
}
function Chips({ options, value, onChange, color, multi }: { options: string[]; value: string[]; onChange: (v: string) => void; color: string; multi?: boolean }) {
  void multi;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((x) => { const on = value.includes(x); return <button key={x} onClick={() => onChange(x)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: on ? color : "rgba(0,0,0,0.04)", color: on ? "#fff" : INK, border: `1px solid ${on ? color : BORDER}` }}>{x}</button>; })}
    </div>
  );
}
export function Stars({ value, onChange, size = 28 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} star`}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill={n <= value ? "#F59E0B" : "#E2E8F0"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </button>
      ))}
    </div>
  );
}
export function PayChip({ d }: { d: Dispatch }) {
  const s = payStatus(d);
  const t = s === "Paid" ? ["rgba(22,163,74,0.12)", "#15803d"] : s === "Disputed" ? ["rgba(220,38,38,0.1)", RED] : s === "Pending Verification" ? ["rgba(234,179,8,0.16)", "#A16207"] : ["rgba(244,123,32,0.12)", "#c2410c"];
  return <Pill text={s.toUpperCase()} bg={t[0]} fg={t[1]} />;
}
function Big({ label, value, color = INK }: { label: string; value: string; color?: string }) {
  return <div className="text-center flex-1"><p className="text-[9px] font-black tracking-wider" style={{ color: MUTED }}>{label}</p><p className="text-[17px] font-black" style={{ color }}>{value}</p></div>;
}
function Totals({ d, color }: { d: Dispatch; color: string }) {
  const t = payTotals(d);
  return (
    <div className="rounded-2xl px-4 py-4" style={{ background: "#fff", border: `1.5px solid ${color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <p className="text-[9px] font-black tracking-wider text-center" style={{ color: MUTED }}>AGREED HAULING RATE</p>
      <p className="text-[30px] font-black text-center leading-tight mb-2" style={{ color }}>{peso(t.rate)}</p>
      <div className="flex pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Big label="DEPOSIT" value={peso(t.deposit)} />
        <Big label={t.remaining === 0 ? "TOTAL PAID" : "REMAINING"} value={peso(t.remaining === 0 ? t.paid : t.remaining)} color={t.remaining === 0 ? GREEN : INK} />
        <Big label="PAID" value={peso(t.paid)} color={t.paid >= t.rate ? GREEN : INK} />
      </div>
      <div className="flex items-center justify-between mt-3"><span className="text-[11px]" style={{ color: MUTED }}>Payment Status</span><PayChip d={d} /></div>
    </div>
  );
}
function PaymentDetails({ d, color }: { d: Dispatch; color: string }) {
  const { m, CUSTOMER, AGREEMENT } = useBookingData();
  const t = payTotals(d);
  return (
    <Sec title="Payment Details" accent={color}>
      <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={CUSTOMER} /><Row k="Operator" v={m.business} />
      <Row k="Agreed Rate" v={peso(t.rate)} strong /><Row k="Deposit" v={peso(t.deposit)} /><Row k="Remaining" v={peso(t.remaining)} strong /><Row k="Due" v="Upon Confirmed Delivery" />
    </Sec>
  );
}
function RecordRows({ d }: { d: Dispatch }) {
  const { CUSTOMER, AGREEMENT } = useBookingData();
  const p = d.pay;
  if (!p) return null;
  return (
    <Sec title="Payment Record">
      <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={CUSTOMER} /><Row k="Amount" v={peso(p.amount)} strong /><Row k="Method" v={p.method} /><Row k="Reference" v={p.ref || "—"} />
      <Row k="Payment Date" v={p.date} />{p.receiptId && <a href={`/api/attachments/${p.receiptId}`} target="_blank" rel="noreferrer" className="text-blue-700 text-xs underline">View receipt</a>}<Row k="Receipt" v={p.receipt ? "Attached" : "Not attached"} />{p.notes && <Row k="Notes" v={p.notes} />}
      <div className="flex items-center justify-between mt-1"><span className="text-[11px]" style={{ color: MUTED }}>Status</span><PayChip d={d} /></div>
    </Sec>
  );
}

export function CompletionChecks({ d }: { d: Dispatch }) {
  const delivered = d.tripStage === "delivered";
  const paid = d.pay?.status === "Paid";
  const blocked = blockingIssue(d);
  const rows: [string, boolean, string][] = [
    ["Cargo Delivered", delivered, delivered ? "✓" : "Pending"],
    ["Customer Confirmed", d.customerConfirm, d.customerConfirm ? "✓" : "Pending"],
    ["Payment Status", paid, paid ? "Paid" : payStatus(d)],
    ["Blocking Issue", !blocked, blocked ? (d.issue ? `Cargo ${d.issue.id}` : `Payment ${d.payIssue!.id}`) : "None"],
  ];
  return (
    <Sec title="Completion Conditions">
      {rows.map(([k, ok, v]) => (
        <div key={k} className="flex justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>{k}</span><span className="text-[11px] font-black" style={{ color: ok ? GREEN : blocked && k === "Blocking Issue" ? RED : "#A16207" }}>{v}</span></div>
      ))}
      <div className="flex justify-between pt-1.5 mt-1" style={{ borderTop: `1px solid ${BORDER}` }}><span className="text-[11px] font-bold" style={{ color: INK }}>Booking Status</span><span className="text-[11px] font-black" style={{ color: isCompleted(d) ? GREEN : "#A16207" }}>{isCompleted(d) ? "Completed" : delivered && blocked ? "Delivered — Issue Under Review" : "Not yet completed"}</span></div>
    </Sec>
  );
}

// ── Booking summary ────────────────────────────────────────────────────────────
export function BookingSummary({ d, role, onBack }: { d: Dispatch; role: Role; onBack: () => void }) {
  const { m, TRUCK, DRIVER, CUSTOMER, AGREEMENT, REQ, QUOTE, TIMES_DONE } = useBookingData();
  const done = isCompleted(d);
  return (
    <Page>
      <Header title="Booking Summary" sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        <Sec title="Booking">
          <Row k="Request ID" v={REQ.id} /><Row k="Quotation ID" v={QUOTE.id} /><Row k="Agreement ID" v={AGREEMENT.id} /><Row k="Booking ID" v={AGREEMENT.booking} strong />
          <Row k="Customer" v={CUSTOMER} /><Row k="Operator" v={m.business} /><Row k="Driver" v={DRIVER} /><Row k="Truck" v={TRUCK} />
        </Sec>
        <Sec title="Hauling">
          <Row k="Cargo" v={REQ.cargo} /><Row k="Pickup" v={REQ.pickup} /><Row k="Destination" v={REQ.dest} /><Row k="Delivery Time" v={TIMES_DONE.delivered} />
        </Sec>
        <Sec title="Payment & Status">
          <Row k="Final Rate" v={peso(payTotals(d).rate)} strong />
          <div className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>Payment Status</span><PayChip d={d} /></div>
          <Row k="Delivery Confirmation" v={d.customerConfirm ? "Customer Confirmed" : "Pending"} />
          <Row k="Overall Status" v={done ? "Completed" : "In Progress"} strong />
        </Sec>
        {role !== "customer" && <CompletionChecks d={d} />}
      </Scroll>
    </Page>
  );
}

// ── Customer payment flow ──────────────────────────────────────────────────────
type CV = "summary" | "form" | "review" | "submitted" | "issue" | "issueDone" | "completed" | "booking" | "rate" | "thanks";
export function CustomerPayment({ d, onDispatch, onBack, start }: { d: Dispatch; onDispatch: Patch; onBack: () => void; start?: CV }) {
  const { m, TRUCK, AGREEMENT, REQ, TIMES_DONE } = useBookingData();
  const t = payTotals(d);
  const [view, setView] = useState<CV>(start ?? (isCompleted(d) ? "completed" : "summary"));
  const [method, setMethod] = useState("Bank Transfer");
  const [ref, setRef] = useState(d.pay?.ref || "");
  const [date, setDate] = useState(d.pay?.date || new Date().toLocaleDateString("en-CA"));
  const { selected, run } = useBookings();
  const [receiptId, setReceiptId] = useState<string | null>(d.pay?.receiptId || null);
  const [receiptName, setReceiptName] = useState(d.pay?.receiptId ? "Uploaded receipt" : "");
  const receipt = !!receiptId;
  const [notes, setNotes] = useState("");
  const [tried, setTried] = useState(false);
  const [amount, setAmount] = useState(String(t.due));
  const amt = Number(amount.replace(/[^0-9.]/g, "")) || 0;
  const summary = () => setView("summary");

  if (view === "booking") return <BookingSummary d={d} role="customer" onBack={() => setView("completed")} />;

  if (view === "form") {
    return (
      <Page>
        <Header title="Record Balance Payment" sub={`${AGREEMENT.booking} · Balance ${peso(t.due)}`} onBack={summary} />
        <Scroll>
          <Sec>
            <Label>AMOUNT PAID (₱)</Label><Input value={amount} onChange={setAmount} />{tried && amt <= 0 && <p className="text-[11px] font-bold mt-1" style={{ color: RED }}>Payment amount is required.</p>}
            <Label>PAYMENT METHOD</Label><Chips options={METHODS} value={[method]} onChange={setMethod} color={BLUE} />{tried && (!method || !ref.trim() || !date || amt !== t.due) && <p className="text-[11px] font-bold mt-1" style={{ color: RED }}>Enter the exact balance, a transaction reference, and a valid payment date.</p>}
            <Label>TRANSACTION REFERENCE</Label><Input value={ref} onChange={setRef} placeholder="e.g. BPI-889204" />
            <Label>PAYMENT DATE</Label><Input value={date} onChange={setDate} />
            <Label>RECEIPT</Label>
            <label className="block w-full py-3 rounded-xl text-center text-[12px] font-bold cursor-pointer" style={{ border: `1.5px dashed ${receipt ? GREEN : BLUE}`, color: receipt ? GREEN : BLUE }}>
              {receipt ? receiptName : "Upload Receipt"}
              <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={async e => { const file = e.target.files?.[0]; if (!file || !selected) return; await run(async () => { const saved = await uploadPhoto(file, selected.id); setReceiptId(saved.id); setReceiptName(saved.name); }); e.target.value = ""; }} />
            </label>
            {receipt && <button className="text-xs text-red-600" onClick={() => { setReceiptId(null); setReceiptName(""); }}>Remove receipt</button>}
            <Label>NOTES (OPTIONAL)</Label><Notes value={notes} onChange={setNotes} placeholder="Add a short note" />
          </Sec>
          <p className="text-[10px] px-1" style={{ color: MUTED }}>This only records a payment you already made outside KadaGo. No money moves in this prototype.</p>
        </Scroll>
        <Foot><Btn color={BLUE} onClick={() => { setTried(true); if (amt === t.due && amt > 0 && method && ref.trim() && date) setView("review"); }}>Review Payment</Btn></Foot>
      </Page>
    );
  }

  if (view === "review") {
    return (
      <Page>
        <Header title="Review Payment" sub="Check before submitting" onBack={() => setView("form")} />
        <Scroll>
          <Sec><Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Amount" v={peso(amt)} strong /><Row k="Method" v={method} /><Row k="Reference" v={ref || "—"} /><Row k="Payment Date" v={date} /><Row k="Receipt Attached" v={receipt ? "Yes" : "No"} />{notes && <Row k="Notes" v={notes} />}</Sec>
        </Scroll>
        <Foot>
          <Btn color={BLUE} onClick={async () => { if (await onDispatch({ pay: { amount: amt, method, ref, date, notes, receipt, receiptId, status: "Pending Verification" } }) !== false) setView("submitted"); }}>Submit Payment Record</Btn>
          <Ghost color={BLUE} onClick={() => setView("form")}>Edit</Ghost>
        </Foot>
      </Page>
    );
  }

  if (view === "submitted") {
    return <SuccessScreen title="Payment Record Submitted" rows={[["Amount", peso(d.pay?.amount ?? amt)], ["Status", "Pending Verification"]]} msg="The payment record has been added and is waiting for verification." primary={["View Payment", summary]} />;
  }

  if (view === "issue") return <PaymentIssueForm role="customer" onBack={summary} onSubmit={async (type, note, evidence, attachmentIds) => { if (await onDispatch({ payIssue: { id: "", by: "customer", type, note, evidence, attachmentIds, status: "Under Review" } }) !== false) setView("issueDone"); }} />;

  if (view === "issueDone") {
    return <SuccessScreen title="Payment Issue Submitted" rows={[["Case ID", d.payIssue?.id || "Pending"], ["Booking", AGREEMENT.booking], ["Status", "Under Review"]]} msg="KadaGo Admin will review this payment issue. The booking cannot be completed until it is resolved." primary={["Back to Payment", summary]} />;
  }

  if (view === "rate") return <RateOperator onBack={() => setView("completed")} onSubmit={async (r) => { if (await onDispatch({ rating: r }) !== false) setView("thanks"); }} />;

  if (view === "thanks" && d.rating) {
    const r = d.rating;
    return (
      <Page>
        <Header title="Thank You" sub="Your rating was submitted" onBack={() => setView("completed")} />
        <Scroll>
          <div className="text-center pt-4 pb-1"><div className="text-4xl mb-2">🙏</div><h2 className="text-[18px] font-black" style={{ color: INK }}>Thank You for Your Feedback</h2></div>
          <Sec><div className="flex justify-center py-1"><Stars value={r.stars} size={32} /></div>
            {r.tags.length > 0 && <div className="flex flex-wrap gap-1.5 justify-center mt-2">{r.tags.map((x) => <Pill key={x} text={x} bg="rgba(29,85,214,0.1)" fg={BLUE} />)}</div>}
            {r.comment && <p className="text-[12px] italic text-center mt-3" style={{ color: INK }}>"{r.comment}"</p>}
          </Sec>
        </Scroll>
        <Foot><Btn color={BLUE} onClick={() => setView("completed")}>Done</Btn></Foot>
      </Page>
    );
  }

  if (view === "completed" && isCompleted(d)) {
    return (
      <Page>
        <Header title="Booking Completed" sub={AGREEMENT.booking} onBack={onBack} />
        <Scroll>
          <div className="text-center py-2"><div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2" style={{ background: "rgba(22,163,74,0.12)" }}>🏁</div><h2 className="text-[18px] font-black" style={{ color: INK }}>Booking Completed</h2></div>
          <Sec>
            <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Cargo" v={REQ.cargo} /><Row k="Operator" v={m.business} /><Row k="Truck" v={TRUCK} />
            <Row k="Final Hauling Rate" v={peso(t.rate)} strong /><Row k="Delivered" v={TIMES_DONE.delivered} /><Row k="Completed" v={TIMES_DONE.completed} />
            <div className="flex items-center justify-between mt-1"><span className="text-[11px]" style={{ color: MUTED }}>Payment</span><PayChip d={d} /></div>
          </Sec>
          {d.rating && <Sec title="Your Rating"><Stars value={d.rating.stars} size={22} /></Sec>}
        </Scroll>
        <Foot>
          {d.rating ? <Btn color={BLUE} onClick={() => setView("booking")}>View Booking Summary</Btn> : <Btn color={BLUE} onClick={() => setView("rate")}>Rate Operator</Btn>}
          {d.rating ? null : <Ghost color={BLUE} onClick={() => setView("booking")}>View Booking Summary</Ghost>}
        </Foot>
      </Page>
    );
  }

  const paid = d.pay?.status === "Paid";
  const blocked = blockingIssue(d);
  const disputed = payStatus(d) === "Disputed";
  return (
    <Page>
      <Header title={paid ? "Payment Complete" : "Payment Summary"} sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        {paid && !blocked && <Banner tone="green">✓ Payment Complete · Paid {peso(t.paid)} · Balance ₱0</Banner>}
        {paid && blocked && <Banner tone="red">Delivered — Issue Under Review. The booking completes once the case is resolved.</Banner>}
        {disputed && <Banner tone="red">DISPUTED · Case {d.payIssue?.id} · Under Review</Banner>}
        <Totals d={d} color={paid ? GREEN : BLUE} />
        <Sec><Row k="Payment Terms" v="Balance upon confirmed delivery" /></Sec>
        {d.pay && <RecordRows d={d} />}
        {!d.pay && !d.customerConfirm && <Banner tone="orange">Confirm the delivery first, then record your balance payment.</Banner>}
      </Scroll>
      <Foot>
        {!d.pay && t.due > 0 && <Btn color={BLUE} disabled={!d.customerConfirm} onClick={() => setView("form")}>Record Balance Payment</Btn>}
        {d.pay?.status === "Pending Verification" && !disputed && <Banner tone="orange">Waiting for the operator to verify your payment.</Banner>}
        {isCompleted(d) && <Btn color={BLUE} onClick={() => setView("completed")}>View Completed Booking</Btn>}
        {d.pay?.status === "Rejected" && !disputed && !isCompleted(d) && !paid && <Ghost color={BLUE} onClick={() => setView("form")}>Correct Rejected Payment Record</Ghost>}
        {!disputed && d.customerConfirm && <Ghost color={RED} onClick={() => setView("issue")}>Report Payment Issue</Ghost>}
      </Foot>
    </Page>
  );
}

// ── Payment issue form (customer / operator) ───────────────────────────────────
function PaymentIssueForm({ role, onBack, onSubmit }: { role: "customer" | "operator"; onBack: () => void; onSubmit: (type: string, note: string, evidence: boolean, attachmentIds: string[]) => void }) {
  const { AGREEMENT } = useBookingData();
  const types = role === "customer" ? ["Incorrect Amount", "Duplicate Payment", "Additional Charge Dispute", "Billing Concern", "Other"] : ["Payment Not Received", "Incorrect Amount", "Receipt Issue", "Other"];
  const color = role === "customer" ? BLUE : ORANGE;
  const [type, setType] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { selected, run } = useBookings();
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>([]);
  return (
    <Page>
      <Header title={role === "customer" ? "Payment Issue" : "Report Payment Issue"} sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        <Sec>
          <Label>WHAT IS THE ISSUE?</Label><Chips options={types} value={type ? [type] : []} onChange={setType} color={color} />
          <Label>SHORT NOTE</Label><Notes value={note} onChange={setNote} placeholder="Describe the issue briefly" />
          <Label>EVIDENCE (OPTIONAL)</Label>
          <label className="block py-3 text-center border border-dashed rounded-xl text-xs text-blue-700 cursor-pointer">Add Evidence
            <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={async e => { const file = e.target.files?.[0]; if (!file || !selected || attachments.length >= 6) return; await run(async () => { const saved = await uploadPhoto(file, selected.id); setAttachments(items => [...items, saved]); }); e.target.value = ""; }} />
          </label>
          {attachments.map(file => <button key={file.id} className="block text-xs mt-2 text-red-600" onClick={() => setAttachments(items => items.filter(item => item.id !== file.id))}>{file.name} ? Remove</button>)}
        </Sec>
        <p className="text-[10px] px-1" style={{ color: MUTED }}>This saves a payment issue for KadaGo Admin to review. Payments are made outside KadaGo.</p>
      </Scroll>
      <Foot><Btn color={RED} disabled={!type || !note.trim()} onClick={() => onSubmit(type!, note, attachments.length > 0, attachments.map(item => item.id))}>Submit Issue</Btn></Foot>
    </Page>
  );
}

// ── Rating ─────────────────────────────────────────────────────────────────────
const POS = ["On Time", "Professional", "Good Communication", "Cargo Handled Well", "Reliable"];
const NEG = ["Late", "Poor Communication", "Cargo Handling Issue", "Schedule Problem"];
const CATS = ["On-Time Service", "Communication", "Cargo Handling", "Professionalism"];
function RateOperator({ onBack, onSubmit }: { onBack: () => void; onSubmit: (r: { stars: number; cats: Record<string, number>; tags: string[]; comment: string }) => void }) {
  const { m, TRUCK, DRIVER, AGREEMENT } = useBookingData();
  const [stars, setStars] = useState(0);
  const [cats, setCats] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const tog = (x: string) => setTags((t) => (t.includes(x) ? t.filter((y) => y !== x) : [...t, x]));
  return (
    <Page>
      <Header title="Rate Your Hauling Experience" sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        <Sec><Row k="Operator" v={m.business} strong /><Row k="Driver" v={DRIVER} /><Row k="Truck" v={TRUCK} /></Sec>
        <Sec title="Overall Rating"><div className="flex justify-center py-1"><Stars value={stars} onChange={setStars} size={36} /></div></Sec>
        <Sec title="Rate by Category (Optional)">
          {CATS.map((c) => <div key={c} className="flex items-center justify-between py-1"><span className="text-[11px] font-semibold" style={{ color: INK }}>{c}</span><Stars value={cats[c] ?? 0} onChange={(n) => setCats({ ...cats, [c]: n })} size={18} /></div>)}
        </Sec>
        <Sec title="What went well?"><Chips options={POS} value={tags} onChange={tog} color={GREEN} /></Sec>
        <Sec title="What could be better?"><Chips options={NEG} value={tags} onChange={tog} color={RED} /></Sec>
        <Sec title="Share Feedback (Optional)"><Notes value={comment} onChange={setComment} placeholder="Smooth delivery and the operator kept us updated." /></Sec>
      </Scroll>
      <Foot><Btn color={BLUE} disabled={stars === 0} onClick={() => onSubmit({ stars, cats, tags, comment })}>Submit Rating</Btn></Foot>
    </Page>
  );
}

export function NewRatingCard({ d }: { d: Dispatch }) {
  const { CUSTOMER, AGREEMENT } = useBookingData();
  const r = d.rating;
  if (!r) return null;
  return (
    <Sec title="New Rating Received" accent={ORANGE}>
      <Row k="Customer" v={CUSTOMER} /><Row k="Booking" v={AGREEMENT.booking} />
      <div className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>Rating</span><div className="flex items-center gap-1.5"><Stars value={r.stars} size={14} /><span className="text-[12px] font-black" style={{ color: INK }}>{r.stars.toFixed(1)}</span></div></div>
      {r.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{r.tags.map((x) => <Pill key={x} text={x} bg="rgba(244,123,32,0.12)" fg="#c2410c" />)}</div>}
      {r.comment && <p className="text-[11px] italic mt-2" style={{ color: INK }}>"{r.comment}"</p>}
    </Sec>
  );
}

// ── Operator payment view ──────────────────────────────────────────────────────
export function OperatorPayment({ d, onDispatch, onBack, onTransaction }: { d: Dispatch; onDispatch: Patch; onBack: () => void; onTransaction: () => void }) {
  const { AGREEMENT, TIMES_DONE } = useBookingData();
  const [ask, setAsk] = useState(false);
  const [issue, setIssue] = useState(false);
  const [issueDone, setIssueDone] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const t = payTotals(d);
  if (showSummary) return <BookingSummary d={d} role="operator" onBack={() => setShowSummary(false)} />;
  if (issue) return <PaymentIssueForm role="operator" onBack={() => setIssue(false)} onSubmit={async (type, note, evidence, attachmentIds) => { if (await onDispatch({ payIssue: { id: "", by: "operator", type, note, evidence, attachmentIds, status: "Under Review" } }) !== false) { setIssue(false); setIssueDone(true); } }} />;
  if (issueDone) return <SuccessScreen title="Payment Issue Reported" rows={[["Case ID", d.payIssue?.id || "Pending"], ["Booking", AGREEMENT.booking], ["Status", "Under Review"]]} msg="KadaGo Admin will review this case." primary={["Back to Payment", () => setIssueDone(false)]} color={ORANGE} />;
  const paid = d.pay?.status === "Paid";
  const disputed = payStatus(d) === "Disputed";
  return (
    <Page>
      <Header title={paid ? "Payment Received" : d.pay ? "Payment Record Added" : "Payment Details"} sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        {!d.customerConfirm && <Banner tone="orange">Waiting for the customer to confirm delivery.</Banner>}
        {d.customerConfirm && !d.pay && <Banner tone="orange">Delivery confirmed. Waiting for the customer to record the balance payment.</Banner>}
        {d.pay && !paid && !disputed && <Banner tone="orange">The customer added a payment record. Please review it.</Banner>}
        {paid && !blockingIssue(d) && <Banner tone="green">✓ Payment Received · PAID</Banner>}
        {paid && blockingIssue(d) && <Banner tone="red">Delivered — Issue Under Review</Banner>}
        {disputed && <Banner tone="red">DISPUTED · Case {d.payIssue?.id} · Under Review</Banner>}
        <Totals d={d} color={paid ? GREEN : ORANGE} />
        {d.pay ? <RecordRows d={d} /> : <PaymentDetails d={d} color={BORDER} />}
        {isCompleted(d) && <Banner tone="green">🏁 Booking Completed · {TIMES_DONE.completed}</Banner>}
        {isCompleted(d) && <NewRatingCard d={d} />}
      </Scroll>
      <Foot>
        {d.pay?.status === "Pending Verification" && !disputed && <Btn color={ORANGE} onClick={() => setAsk(true)}>Confirm Payment Received</Btn>}
        {paid && <Btn color={ORANGE} onClick={onTransaction}>View Transaction</Btn>}
        {isCompleted(d) && <Ghost color={ORANGE} onClick={() => setShowSummary(true)}>View Booking Summary</Ghost>}
        {d.pay && !paid && !disputed && <Ghost color={RED} onClick={() => setIssue(true)}>Report Payment Issue</Ghost>}
      </Foot>
      {ask && d.pay && <Modal color={ORANGE} title="Confirm payment received?" msg={`Amount ${peso(d.pay.amount)}. Only confirm if you have received this payment.`} ok="Confirm Payment" cancel="Cancel" onCancel={() => setAsk(false)} onOk={async () => { if (await onDispatch({ pay: { ...d.pay!, status: "Paid" } }) !== false) setAsk(false); }} />}
      {void t}
    </Page>
  );
}

export function OperatorTransaction({ d, onBack }: { d: Dispatch; onBack: () => void }) {
  const { CUSTOMER, AGREEMENT } = useBookingData();
  const t = payTotals(d);
  const p = d.pay;
  return (
    <Page>
      <Header title="Transaction Details" sub={AGREEMENT.booking} onBack={onBack} />
      <Scroll>
        <Sec>
          <Row k="Booking ID" v={AGREEMENT.booking} strong /><Row k="Customer" v={CUSTOMER} /><Row k="Hauling Rate" v={peso(t.rate)} strong /><Row k="Deposit" v={peso(t.deposit)} />
          <Row k="Balance" v={peso(t.due)} /><Row k="Total Paid" v={peso(t.paid)} strong /><Row k="Method" v={p?.method ?? "—"} /><Row k="Reference" v={p?.ref ?? "—"} /><Row k="Date" v={p?.date ?? "—"} />
          <div className="flex items-center justify-between mt-1"><span className="text-[11px]" style={{ color: MUTED }}>Status</span><PayChip d={d} /></div>
        </Sec>
        <p className="text-[10px] px-1" style={{ color: MUTED }}>Payment record only. Payments are made outside KadaGo.</p>
      </Scroll>
    </Page>
  );
}

export function EarningsBookings({ d, onTransaction }: { d: Dispatch; onTransaction: () => void }) {
  const { CUSTOMER, AGREEMENT } = useBookingData();
  const rate = payTotals(d).rate;
  const done = isCompleted(d);
  const { bookings } = useBookings();
  const now = new Date();
  const month = bookings.filter(b => { const date = new Date(b.completedAt || b.dispatch.pay?.date || b.createdAt); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); });
  const paid = monthlyPayments(bookings, now);
  const pending = month.filter(b => b.dispatch.pay?.status === "Pending Verification").reduce((sum, b) => sum + (b.dispatch.pay?.amount || 0), 0);
  const jobs = month.filter(b => b.completed).length;
  const gross = paid + pending;
  return (
    <>
      <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
        <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: MUTED }}>HAULING BOOKINGS · THIS MONTH</p>
        <Row k="Gross Hauling Fees" v={peso(gross)} strong /><Row k="Completed Bookings" v={String(jobs)} /><Row k="Pending Payments" v={peso(pending)} /><Row k="Paid" v={peso(paid)} strong />
        <div className="mt-2 px-3 py-2 rounded-lg" style={{ background: "rgba(100,116,139,0.08)" }}>
          <p className="text-[10px] font-bold" style={{ color: INK }}>Verified payment records</p>
          <p className="text-[9px]" style={{ color: MUTED }}>Payments are made outside KadaGo. No commission is deducted here.</p>
        </div>
      </div>
      <p className="text-[10px] font-black tracking-wider px-1" style={{ color: MUTED }}>HAULING TRANSACTIONS</p>
      {d.pay?.status === "Paid" ? (
        <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
          <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={CUSTOMER} /><Row k="Hauling Rate" v={peso(rate)} strong /><Row k="Date" v={d.pay.date} />
          <div className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>Payment Status</span><PayChip d={d} /></div>
          <button onClick={onTransaction} className="w-full mt-2 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: ORANGE }}>View Transaction</button>
        </div>
      ) : (
        <div className="rounded-2xl py-6 text-center" style={{ background: "#fff", border: `1px solid ${BORDER}` }}><p className="text-[12px]" style={{ color: MUTED }}>No transaction records yet.</p></div>
      )}
    </>
  );
}

// ── Completed booking cards ────────────────────────────────────────────────────
export function CompletedCard({ d, role, onView, onRate }: { d: Dispatch; role: Role; onView: () => void; onRate?: () => void }) {
  const { CUSTOMER, ROUTE, AGREEMENT, REQ } = useBookingData();
  const color = role === "operator" ? ORANGE : BLUE;
  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-1"><span className="text-[11px] font-black" style={{ color }}>{AGREEMENT.booking}</span><Pill text="COMPLETED" bg="rgba(22,163,74,0.12)" fg="#15803d" /></div>
      <p className="text-[14px] font-bold" style={{ color: INK }}>{REQ.category}</p>
      {role !== "customer" && <p className="text-[10px]" style={{ color: MUTED }}>{CUSTOMER}</p>}
      <p className="text-[11px] mb-2" style={{ color: MUTED }}>{ROUTE}</p>
      <div className="flex items-center justify-between"><span className="text-[11px]" style={{ color: MUTED }}>Final Rate</span><span className="text-[13px] font-black" style={{ color: INK }}>{peso(payTotals(d).rate)}</span></div>
      <div className="flex gap-2 mt-2">
        <button onClick={onView} className="flex-1 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: color }}>View Details</button>
        {onRate && !d.rating && <button onClick={onRate} className="flex-1 py-2.5 rounded-xl text-[12px] font-black" style={{ color, border: `1.5px solid ${color}`, background: "#fff" }}>Rate Operator</button>}
      </div>
    </div>
  );
}

// ── Customer transaction history ───────────────────────────────────────────────
export function CustomerTransactions({ d, onBack }: { d: Dispatch; onBack: () => void }) {
  const { AGREEMENT } = useBookingData();
  const { selected } = useBookings();
  const [sel, setSel] = useState<"deposit" | "balance" | null>(null);
  const has = d.status === "booked";
  const t = payTotals(d);
  const rows = [
    ...(has && t.deposit > 0 ? [{ id: "deposit" as const, date: selected?.depositRecords?.at(-1)?.verifiedAt?.slice(0, 10) || "Not recorded", label: "Verified Deposits", amt: t.deposit, st: "Verified" }] : []),
    ...(d.pay ? [{ id: "balance" as const, date: d.pay.date, label: "Balance", amt: d.pay.amount, st: payStatus(d) === "Disputed" ? "Disputed" : d.pay.status === "Paid" ? "Paid" : "Pending Verification" }] : []),
  ];
  if (sel) {
    const r = rows.find((x) => x.id === sel)!;
    return (
      <Page>
        <Header title="Transaction Details" sub={`${AGREEMENT.booking} · ${r.label}`} onBack={() => setSel(null)} />
        <Scroll><Sec><Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Type" v={r.label} /><Row k="Amount" v={peso(r.amt)} strong /><Row k="Date" v={r.date} /><Row k="Method" v={sel === "balance" ? d.pay!.method : "Verified deposit"} /><Row k="Reference" v={sel === "balance" ? d.pay!.ref : selected?.depositRecords?.map(record => record.reference).join(", ") || "Not recorded"} /><Row k="Status" v={r.st} strong /></Sec></Scroll>
      </Page>
    );
  }
  return (
    <Page>
      <Header title="Transaction History" sub="Payment records for your bookings" onBack={onBack} />
      <Scroll>
        {rows.length === 0 && <div className="rounded-2xl py-10 text-center" style={{ background: "#fff", border: `1px solid ${BORDER}` }}><p className="text-[12px]" style={{ color: MUTED }}>No payment records yet.</p></div>}
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between"><span className="text-[11px] font-black" style={{ color: INK }}>{r.date} · {AGREEMENT.booking}</span><Pill text={r.st.toUpperCase()} bg={r.st === "Disputed" ? "rgba(220,38,38,0.1)" : r.st === "Pending Verification" ? "rgba(234,179,8,0.16)" : "rgba(22,163,74,0.12)"} fg={r.st === "Disputed" ? RED : r.st === "Pending Verification" ? "#A16207" : "#15803d"} /></div>
            <div className="flex items-center justify-between mt-1"><span className="text-[12px]" style={{ color: MUTED }}>{r.label}</span><span className="text-[14px] font-black" style={{ color: INK }}>{peso(r.amt)}</span></div>
            <button onClick={() => setSel(r.id)} className="text-[11px] font-bold mt-1" style={{ color: BLUE }}>View Details →</button>
          </div>
        ))}
      </Scroll>
    </Page>
  );
}

// ── Admin ──────────────────────────────────────────────────────────────────────
export function AdminPaymentReview({ d, onDispatch, onBack, onTrack }: { d: Dispatch; onDispatch: Patch; onBack: () => void; onTrack: () => void }) {
  const { m, CUSTOMER, AGREEMENT } = useBookingData();
  const [view, setView] = useState<null | "pay" | "case">(null);
  const [info, setInfo] = useState(false);
  const { verifyDeposit } = useBookings();
  const [depositAmount, setDepositAmount] = useState("");
  const [depositReference, setDepositReference] = useState("");
  const t = payTotals(d);
  const A = "#7C3AED";
  if (view === "pay") return <Page><Header title="Payment Details" sub={AGREEMENT.booking} onBack={() => setView(null)} /><Scroll><Totals d={d} color={A} />{d.pay ? <RecordRows d={d} /> : <PaymentDetails d={d} color={BORDER} />}<CompletionChecks d={d} /></Scroll></Page>;
  if (view === "case" && d.payIssue) {
    const c = d.payIssue;
    return (
      <Page>
        <Header title="Payment Dispute" sub={c.id} onBack={() => setView(null)} />
        <Scroll>
          <Banner tone={c.status === "Resolved" ? "green" : "red"}>{c.status === "Resolved" ? "Resolved" : "DISPUTED · Under Review"}</Banner>
          <Sec><Row k="Case ID" v={c.id} strong /><Row k="Booking" v={AGREEMENT.booking} /><Row k="Raised By" v={c.by === "customer" ? CUSTOMER : m.business} /><Row k="Type" v={c.type} /><Row k="Evidence" v={c.evidence ? "Attached" : "None"} />{c.note && <Row k="Note" v={c.note} />}{c.attachmentIds?.map((id, index) => <a key={id} href={`/api/attachments/${id}`} target="_blank" rel="noreferrer" className="block text-xs text-blue-700 underline">View evidence {index + 1}</a>)}</Sec>
          {info && c.status !== "Resolved" && <Banner tone="orange">Information requested from both parties (simulated).</Banner>}
          <p className="text-[10px] px-1" style={{ color: MUTED }}>Simulated case. KadaGo does not move, hold, or refund money in this prototype.</p>
        </Scroll>
        {c.status !== "Resolved" && <Foot><Btn color={GREEN} onClick={() => onDispatch({ payIssue: { ...c, status: "Resolved" } })}>Mark Resolved</Btn><Ghost color={A} onClick={() => setInfo(true)}>Request Information</Ghost></Foot>}
      </Page>
    );
  }
  const has = d.status === "booked" && d.customerConfirm;
  return (
    <Page>
      <Header title="Payment Review" sub="Payment and deposit verification" onBack={onBack} />
      <Scroll>
        {["accepted", "booked"].includes(d.status) && !d.pay && (d.requiredDeposit || 0) > d.deposit && <Sec title="Verify Received Deposit">
          <Row k="Requested Deposit" v={peso(d.requiredDeposit || 0)} /><Row k="Verified Received" v={peso(d.deposit)} />
          <Input value={depositAmount} onChange={setDepositAmount} placeholder="Amount actually received" />
          <Input value={depositReference} onChange={setDepositReference} placeholder="Transaction / receipt reference" />
          <Btn color={GREEN} disabled={Number(depositAmount) <= 0 || !depositReference.trim()} onClick={async () => { if (await verifyDeposit(Number(depositAmount), depositReference.trim())) { setDepositAmount(""); setDepositReference(""); } }}>Verify Received Deposit</Btn>
        </Sec>}
        {!has && <div className="rounded-2xl py-10 text-center" style={{ background: "#fff", border: `1px solid ${BORDER}` }}><p className="text-[12px]" style={{ color: MUTED }}>No payments waiting for review.</p></div>}
        {has && (
          <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
            <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={CUSTOMER} /><Row k="Operator" v={m.business} /><Row k="Agreed Rate" v={peso(t.rate)} strong /><Row k="Paid" v={peso(t.paid)} strong /><Row k="Reference" v={d.pay?.ref ?? "—"} />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>Status</span><PayChip d={d} /></div>
            {d.payIssue && <Row k="Dispute" v={`${d.payIssue.id} · ${d.payIssue.status}`} />}
            <div className="flex gap-2 mt-2"><button onClick={() => setView("pay")} className="flex-1 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: A }}>View Payment</button>{d.payIssue && <button onClick={() => setView("case")} className="flex-1 py-2.5 rounded-xl text-[12px] font-black" style={{ color: RED, border: `1.5px solid ${RED}`, background: "#fff" }}>View Case</button>}</div>
          </div>
        )}
        {has && d.pay?.status === "Pending Verification" && <Sec title="Verify Balance Payment">
          <RecordRows d={d} />
          <Btn color={GREEN} onClick={() => onDispatch({ pay: { ...d.pay!, status: "Paid" } })}>Verify Payment Received</Btn>
          <Ghost color={RED} onClick={() => onDispatch({ pay: { ...d.pay!, status: "Rejected" } })}>Reject Payment Record</Ghost>
        </Sec>}
        {has && <CompletionChecks d={d} />}
        {has && <Ghost color={A} onClick={onTrack}>View Booking</Ghost>}
      </Scroll>
    </Page>
  );
}

export function AdminCompleted({ d, onBack }: { d: Dispatch; onBack: () => void }) {
  const { m, CUSTOMER, AGREEMENT, REQ } = useBookingData();
  const [sum, setSum] = useState(false);
  const done = isCompleted(d);
  if (sum) return <BookingSummary d={d} role="admin" onBack={() => setSum(false)} />;
  return (
    <Page>
      <Header title="Completed Hauling" sub="Completed bookings" onBack={onBack} />
      <Scroll>
        {!done && <div className="rounded-2xl py-10 text-center" style={{ background: "#fff", border: `1px solid ${BORDER}` }}><p className="text-[12px]" style={{ color: MUTED }}>No completed hauling yet.</p></div>}
        {done && (
          <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
            <Row k="Booking" v={AGREEMENT.booking} strong /><Row k="Customer" v={CUSTOMER} /><Row k="Operator" v={m.business} /><Row k="Cargo Type" v={REQ.category} /><Row k="Final Rate" v={peso(payTotals(d).rate)} strong />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: MUTED }}>Status</span><Pill text="COMPLETED" bg="rgba(22,163,74,0.12)" fg="#15803d" /></div>
            <button onClick={() => setSum(true)} className="w-full mt-2 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: "#7C3AED" }}>View Booking Summary</button>
          </div>
        )}
      </Scroll>
    </Page>
  );
}
