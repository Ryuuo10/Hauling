import { useState } from "react";
import OperatorHeader from "@/features/operator/OperatorHeader";
import { displayDate, useBookingData, useBookings } from "@/features/customer/BookingContext";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";
import { MATCHES, REQ, DECLINE_REASONS, AFTER_CONFIRM, PROPOSED_RATE, QUOTE, RATE_REVIEW_REASONS, peso, isCompleted } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";

const O = { bg: "#F8FAFF", card: "#FFFFFF", orange: "#F47B20", blue: "#1D55D6", green: "#16A34A", red: "#DC2626", border: "rgba(0,0,0,0.08)", muted: "#64748b", ink: "#0D1828" };
type AsTab = "new" | "confirmed" | "declined" | "completed";

const isDeclined = (d: Dispatch) => d.declineReason !== null && d.matchIdx >= 1;
const isNew = (d: Dispatch) => d.matchIdx === 0 && d.status === "approved";
const isConfirmed = (d: Dispatch) => d.matchIdx === 0 && AFTER_CONFIRM.includes(d.status);

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 py-1.5">
      <span className="text-[11px]" style={{ color: O.muted }}>{k}</span>
      <span className="min-w-0 break-words text-[11px] font-semibold text-right" style={{ color: O.ink }}>{v}</span>
    </div>
  );
}
function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color: fg }}>{text}</span>;
}

export function HomeAssignmentCard({ dispatch, onOpen }: { dispatch: Dispatch; onOpen: () => void }) {
  const { selected } = useBookings();
  const { REQ } = useBookingData();
  const fresh = !!selected && !dispatch.cancelled && isNew(dispatch);
  return (
    <div>
      <p className="text-[13px] font-black mb-2 px-1" style={{ color: O.ink }}>KadaGo Assignments</p>
      <div className="rounded-2xl px-4 py-3" style={{ background: O.card, border: `1px solid ${fresh ? O.orange : O.border}`, borderLeft: `3px solid ${O.orange}` }}>
        {fresh ? (
          <>
            <Pill text="NEW ASSIGNMENT" bg="rgba(244,123,32,0.12)" fg="#c2410c" />
            <p className="text-[12px] font-black mt-2" style={{ color: O.ink }}>{REQ.id} · {REQ.cargoShort}</p>
            <p className="text-[10px] mb-2" style={{ color: O.muted }}>{REQ.route} · {REQ.schedule}</p>
            <button onClick={onOpen} className="w-full py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: O.orange }}>Review Assignment</button>
          </>
        ) : (
          <>
            <p className="text-[11px] leading-relaxed mb-2" style={{ color: O.muted }}>
              {dispatch.status === "booked" ? "Your booking is confirmed. Open Bookings for pickup details." : isConfirmed(dispatch) ? "Your assignment is confirmed. KadaGo will coordinate the hauling rate." : "Jobs are assigned by KadaGo Dispatch. You will be notified when a new assignment is sent to you."}
            </p>
            <button onClick={onOpen} className="text-[11px] font-bold" style={{ color: O.orange }}>Open Assignments →</button>
          </>
        )}
      </div>
    </div>
  );
}

export function AssignmentsInbox({ onOpen }: { onOpen: () => void }) {
  const { bookings, select, declinedAssignments } = useBookings();
  const classify = (d: Dispatch): AsTab | null => {
    if (isDeclined(d)) return "declined";
    if (d.cancelled) return null;
    if (isCompleted(d)) return "completed";
    if (isNew(d)) return "new";
    return isConfirmed(d) ? "confirmed" : null;
  };
  const items = bookings.map(booking => ({ booking, tab: classify(booking.dispatch) })).filter(item => item.tab !== null);
  const [tab, setTab] = useState<AsTab>(() => items.find(item => item.tab === "new")?.tab || items[0]?.tab || "new");
  const tabs: { id: AsTab; label: string }[] = [{ id: "new", label: "New" }, { id: "confirmed", label: "Confirmed" }, { id: "declined", label: "Declined" }, { id: "completed", label: "Completed" }];
  const shown = items.filter(item => item.tab === tab);
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <OperatorHeader title="Assignments" subtitle="Hauling jobs assigned to you by KadaGo" />
      <div role="tablist" aria-label="Assignment status" className="grid shrink-0 grid-cols-4 gap-1 px-3 pt-3 pb-3">
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} aria-controls="assignment-list" id={`assignment-tab-${t.id}`} onClick={() => setTab(t.id)}
            className="min-w-0 rounded-lg px-1 py-2 text-[10px] font-bold sm:text-xs"
            style={{ background: tab === t.id ? O.orange : "#fff", color: tab === t.id ? "#fff" : O.muted, border: `1px solid ${tab === t.id ? O.orange : O.border}` }}>
            <span className="block whitespace-nowrap">{t.label}</span>
            <span className="block text-[10px]">{t.id === "declined" ? declinedAssignments.length : items.filter(item => item.tab === t.id).length}</span>
          </button>
        ))}
      </div>
      <div id="assignment-list" role="tabpanel" aria-labelledby={`assignment-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="mx-auto w-full max-w-2xl space-y-2">
          {shown.map(({ booking, tab: kind }) => (
            <article key={booking.id} className="rounded-xl border bg-white p-3" style={{ borderColor: O.border }}>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="text-[11px] font-bold" style={{ color: O.orange }}>{booking.requestId}</p>
                <span className="text-[10px] font-semibold" style={{ color: O.muted }}>{kind === "new" ? "Needs confirmation" : kind === "completed" ? "Completed" : kind === "declined" ? "Declined" : "Confirmed"}</span>
              </div>
              <h2 className="mt-1 break-words text-xs font-bold" style={{ color: O.ink }}>{booking.request.cargo}</h2>
              <p className="mt-1 break-words text-[11px]" style={{ color: O.muted }}>{booking.customer}</p>
              <p className="mt-1 break-words text-[11px]" style={{ color: O.muted }}>{booking.request.pickup.city} → {booking.request.delivery.city}</p>
              <p className="mt-1 text-[11px]" style={{ color: O.muted }}>{displayDate(booking.request.scheduledAt)} · {booking.request.weightKg.toLocaleString()} kg</p>
              {kind === "declined" ? <p className="mt-2 text-[11px]" style={{ color: O.red }}>{booking.dispatch.declineReason}</p> :
                <button onClick={() => { select(booking.id); onOpen(); }} className="mt-3 w-full rounded-lg py-2.5 text-xs font-bold text-white" style={{ background: O.orange }}>{kind === "new" ? "Review Assignment" : "View Assignment"}</button>}
            </article>
          ))}
          {tab === "declined" && declinedAssignments.map(item => <article key={`${item.requestId}-${item.at}`} className="rounded-xl border bg-white p-3 text-xs space-y-1">
            <p className="font-bold text-orange-600">{item.requestId} ? Declined</p><p>{item.cargo}</p><p>{item.route}</p><p>{displayDate(item.scheduledAt)}</p><p className="text-red-600">{item.reason}: {item.note}</p>
          </article>)}
          {shown.length === 0 && (tab !== "declined" || declinedAssignments.length === 0) && (
            <div className="rounded-xl border bg-white px-4 py-8 text-center" style={{ borderColor: O.border }}>
              <p className="text-xs font-bold" style={{ color: O.ink }}>{tab === "new" ? "No new assignments" : `No ${tab} assignments`}</p>
              <p className="mt-2 text-[11px] leading-relaxed" style={{ color: O.muted }}>{tab === "new" ? "A job will appear here after KadaGo Dispatch assigns a verified truck to your account." : "Jobs appear here when they reach this status. Check the other tabs for your assignments."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssignmentDetail({ dispatch, onBack, onDispatch, onRate }: { dispatch: Dispatch; onBack: () => void; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; onRate: () => void }) {
  const [modal, setModal] = useState<"confirm" | "decline" | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { selected } = useBookings();
  const { REQ, m } = useBookingData();
  const confirmed = isConfirmed(dispatch);
  const declined = isDeclined(dispatch);
  if (!selected || dispatch.cancelled || (!isNew(dispatch) && !confirmed && !declined && !isCompleted(dispatch))) {
    return <div className="h-full overflow-y-auto p-3"><div className="rounded-xl border bg-white p-4"><h1 className="text-sm font-bold">No assignment selected</h1><p className="mt-2 text-xs text-slate-500">Open Assignments to review a job assigned to your account.</p><button onClick={onBack} className="mt-4 rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ background: O.orange }}>Back to Assignments</button></div></div>;
  }
  const statusText = declined ? "Declined" : dispatch.status === "accepted" ? "Quotation Accepted" : dispatch.status === "declined" ? "Quotation Declined by Customer" : confirmed ? "Assignment Confirmed" : "Needs Confirmation";
  const sc = declined ? { bg: "rgba(220,38,38,0.1)", fg: O.red } : confirmed ? { bg: "rgba(22,163,74,0.1)", fg: "#15803d" } : { bg: "rgba(244,123,32,0.12)", fg: "#c2410c" };
  return (
    <div className="h-full flex flex-col relative" style={{ background: O.bg }}>
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3" style={{ background: "#fff", borderBottom: `1px solid ${O.border}` }}>
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${O.border}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={O.ink} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "34px" }} />
        <div><h1 className="text-[14px] font-black" style={{ color: O.ink }}>Hauling Assignment</h1><p className="text-[10px]" style={{ color: O.muted }}>{REQ.id}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {confirmed && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)" }}>
            <p className="text-[11px] font-bold" style={{ color: "#15803d" }}>KadaGo will now coordinate the hauling rate and prepare the quotation.</p>
          </div>
        )}
        {confirmed && <button onClick={onRate} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white" style={{ background: O.orange }}>View Rate Coordination</button>}
        {declined && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <p className="text-[11px] font-bold" style={{ color: O.red }}>KadaGo Dispatch will review the next suitable match.</p>
          </div>
        )}
        <div className="rounded-2xl px-4 py-3" style={{ background: O.card, border: `1px solid ${O.border}` }}>
          <Row k="Request ID" v={REQ.id} />
          <Row k="Customer Business" v={REQ.customer} />
          <Row k="Cargo Category" v={REQ.category} />
          <Row k="Cargo Description" v={REQ.cargo} />
          <Row k="Weight" v={REQ.weight} />
          <Row k="Quantity" v={REQ.quantity} />
          <Row k="Pickup" v={REQ.pickup} />
          <Row k="Destination" v={REQ.dest} />
          <Row k="Schedule" v={REQ.schedule} />
          <Row k="Special Requirements" v={REQ.requirements} />
          <Row k="Assigned Truck" v={`${m.truck} · ${m.plate}`} />
          <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
            <span className="text-[11px]" style={{ color: O.muted }}>KadaGo Assignment Status</span>
            <Pill text={statusText} bg={sc.bg} fg={sc.fg} />
          </div>
        </div>
        {isNew(dispatch) && (
          <div className="space-y-2 pt-1">
            <button onClick={() => setModal("confirm")} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white" style={{ background: O.orange }}>Confirm Assignment</button>
            <button onClick={() => setModal("decline")} className="w-full py-3 rounded-xl text-[12px] font-bold" style={{ background: "#fff", color: O.red, border: `1.5px solid ${O.red}` }}>Decline Assignment</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
          <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
            {modal === "confirm" ? (
              <>
                <h3 className="text-[16px] font-black mb-1" style={{ color: O.ink }}>Confirm hauling assignment?</h3>
                <p className="text-[12px] mb-4" style={{ color: O.muted }}>You are confirming your availability for this truck, route, and schedule.</p>
                <div className="space-y-2">
                  <button onClick={async () => { if (await onDispatch({ status: "confirmed" }) !== false) { setModal(null); onRate(); } }} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white" style={{ background: O.orange }}>Confirm Assignment</button>
                  <button onClick={() => setModal(null)} className="w-full py-3 rounded-xl text-[12px] font-bold" style={{ color: O.muted, border: `1px solid ${O.border}` }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-[16px] font-black mb-3" style={{ color: O.ink }}>Decline assignment</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {DECLINE_REASONS.map((r) => (
                    <button key={r} onClick={() => setReason(r)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: reason === r ? O.red : "rgba(0,0,0,0.04)", color: reason === r ? "#fff" : O.ink, border: `1px solid ${reason === r ? O.red : O.border}` }}>{r}</button>
                  ))}
                </div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Short reason (required)"
                  className="w-full px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none mb-3" style={{ background: O.bg, border: "1px solid rgba(0,0,0,0.12)", color: O.ink }} />
                <div className="space-y-2">
                  <button disabled={!reason || !note.trim()} onClick={async () => { if (reason && await onDispatch({ status: "suggested", declineReason: reason, declineNote: note }) !== false) { setModal(null); onBack(); } }}
                    className="w-full py-3.5 rounded-xl text-[13px] font-black text-white" style={{ background: !reason || !note.trim() ? "#CBD5E1" : O.red }}>Submit Decline</button>
                  <button onClick={() => setModal(null)} className="w-full py-3 rounded-xl text-[12px] font-bold" style={{ color: O.muted, border: `1px solid ${O.border}` }}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rate Coordination (operator) ───────────────────────────────────────────────
function OpHeader({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3" style={{ background: "#fff", borderBottom: `1px solid ${O.border}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${O.border}` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={O.ink} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <img src={kadaGoLogo} alt="KadaGo" style={{ width: "34px" }} />
      <div><h1 className="text-[14px] font-black" style={{ color: O.ink }}>{title}</h1><p className="text-[10px]" style={{ color: O.muted }}>{sub}</p></div>
    </div>
  );
}
function OpBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white" style={{ background: disabled ? "#CBD5E1" : O.orange }}>{children}</button>;
}
function OpGhost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="w-full py-3 rounded-xl text-[12px] font-bold" style={{ background: "#fff", color: O.orange, border: `1.5px solid ${O.orange}` }}>{children}</button>;
}
const Note = ({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "orange" | "red" }) => {
  const c = tone === "green" ? ["rgba(22,163,74,0.08)", "rgba(22,163,74,0.25)", "#15803d"] : tone === "red" ? ["rgba(220,38,38,0.07)", "rgba(220,38,38,0.25)", O.red] : ["rgba(244,123,32,0.08)", "rgba(244,123,32,0.3)", "#c2410c"];
  return <div className="rounded-xl px-3 py-2.5" style={{ background: c[0], border: `1px solid ${c[1]}` }}><p className="text-[11px] font-bold" style={{ color: c[2] }}>{children}</p></div>;
};

export function RateCoordination({ dispatch, onBack, onDispatch, onAgreement }: { dispatch: Dispatch; onBack: () => void; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; onAgreement: () => void }) {
  const { REQ, m: m0, QUOTE, PROPOSED_RATE } = useBookingData();
  const [view, setView] = useState<"main" | "review" | "submitted">(dispatch.rateStage === "review" ? "submitted" : "main");
  const [modal, setModal] = useState(false);
  const [val, setVal] = useState("");
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const st = dispatch.status;
  const rs = dispatch.rateStage;
  const requested = Number(val.replace(/[^\d]/g, "")) || 0;

  if (view === "review") {
    return (
      <div className="h-full flex flex-col" style={{ background: O.bg }}>
        <OpHeader title="Request Rate Review" sub={REQ.id} onBack={() => setView("main")} />
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
          <div className="rounded-2xl px-4 py-3" style={{ background: O.card, border: `1px solid ${O.border}` }}>
            <Row k="Current Proposed Rate" v={peso(PROPOSED_RATE)} />
            <p className="text-[10px] font-bold mt-2 mb-1" style={{ color: O.muted }}>Requested Rate</p>
            <input value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="w-full px-3 py-2.5 rounded-xl text-[15px] font-black outline-none" style={{ background: O.bg, border: "1px solid rgba(0,0,0,0.12)", color: O.ink }} />
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ background: O.card, border: `1px solid ${O.border}` }}>
            <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: O.muted }}>REASON</p>
            <div className="flex flex-wrap gap-1.5">
              {RATE_REVIEW_REASONS.map((r) => (
                <button key={r} onClick={() => setReason(r)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: reason === r ? O.orange : "rgba(0,0,0,0.04)", color: reason === r ? "#fff" : O.ink, border: `1px solid ${reason === r ? O.orange : O.border}` }}>{r}</button>
              ))}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Short notes (optional)" className="w-full mt-3 px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none" style={{ background: O.bg, border: "1px solid rgba(0,0,0,0.12)", color: O.ink }} />
          </div>
          <OpBtn disabled={!reason || requested <= 0} onClick={async () => { if (await onDispatch({ rateStage: "review", requestedRate: requested, rateReason: reason, rateNote: note }) !== false) setView("submitted"); }}>Submit Rate Review</OpBtn>
        </div>
      </div>
    );
  }

  if (view === "submitted" && rs === "review") {
    return (
      <div className="h-full flex flex-col" style={{ background: O.bg }}>
        <div className="flex-1 px-4 pt-14 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white" style={{ background: O.orange }}>✓</div>
          <h2 className="text-[19px] font-black mb-5" style={{ color: O.ink }}>Rate Review Submitted</h2>
          <div className="rounded-2xl px-4 py-3 text-left mb-3" style={{ background: O.card, border: `1px solid ${O.border}` }}>
            <Row k="Requested Rate" v={peso(dispatch.requestedRate ?? 0)} />
            <div className="flex flex-wrap justify-between items-center gap-2 pt-2"><span className="text-[11px]" style={{ color: O.muted }}>Status</span><Pill text="Waiting for KadaGo Review" bg="rgba(244,123,32,0.12)" fg="#c2410c" /></div>
          </div>
          <p className="text-[11.5px] px-4" style={{ color: O.muted }}>KadaGo Dispatch will review the requested rate before preparing the customer quotation.</p>
        </div>
        <div className="px-4 pb-4"><OpBtn onClick={onBack}>Back to Assignments</OpBtn></div>
      </div>
    );
  }

  const final = dispatch.finalRate;
  let statusPill: { t: string; bg: string; fg: string } = { t: "Awaiting Your Response", bg: "rgba(244,123,32,0.12)", fg: "#c2410c" };
  let msg: { text: string; tone: "green" | "orange" | "red" } | null = null;
  if (st === "declined") { statusPill = { t: "Quotation Declined by Customer", bg: "rgba(220,38,38,0.1)", fg: O.red }; msg = { text: "KadaGo Dispatch will review the assignment.", tone: "red" }; }
  else if (st === "accepted") { statusPill = { t: "Waiting for Booking Agreement", bg: "rgba(22,163,74,0.1)", fg: "#15803d" }; msg = { text: "Quotation Accepted.", tone: "green" }; }
  else if (st === "quote") { statusPill = { t: "Quotation Sent to Customer", bg: "rgba(29,85,214,0.1)", fg: O.blue }; msg = { text: "KadaGo has sent the quotation. Waiting for the customer's decision.", tone: "orange" }; }
  else if (rs === "finalized") { statusPill = { t: "Rate Finalized", bg: "rgba(22,163,74,0.1)", fg: "#15803d" }; msg = { text: "KadaGo has finalized the hauling rate and is preparing the customer quotation.", tone: "green" }; }
  else if (rs === "confirmed") { statusPill = { t: "RATE CONFIRMED", bg: "rgba(22,163,74,0.1)", fg: "#15803d" }; msg = { text: "KadaGo Admin / Dispatch can now prepare the customer quotation.", tone: "green" }; }
  const pending = rs === "pending" && st === "confirmed";
  if (st === "booked") { statusPill = { t: "Booking Confirmed", bg: "rgba(22,163,74,0.1)", fg: "#15803d" }; msg = { text: "Booking confirmed. Next: Upcoming Pickup.", tone: "green" }; }
  else if (st === "accepted" && dispatch.agreement === "operator") { statusPill = { t: "Booking Agreement Ready", bg: "rgba(244,123,32,0.12)", fg: "#c2410c" }; }

  return (
    <div className="h-full flex flex-col relative" style={{ background: O.bg }}>
      <OpHeader title="Rate Coordination" sub="Review the hauling rate coordinated by KadaGo." onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {msg && <Note tone={msg.tone}>{msg.text}</Note>}
        <div className="rounded-2xl px-4 py-3" style={{ background: O.card, border: `1px solid ${O.border}` }}>
          <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: O.muted }}>REQUEST SUMMARY</p>
          <Row k="Request" v={REQ.id} />
          <Row k="Customer" v={REQ.customer} />
          <Row k="Cargo" v={REQ.cargoShort} />
          <Row k="Weight" v={REQ.weight} />
          <Row k="Pickup" v={REQ.pickup} />
          <Row k="Destination" v={REQ.dest} />
          <Row k="Schedule" v={REQ.schedule} />
          <Row k="Truck" v={m0.truck} />
          <div className="flex flex-wrap justify-between items-center gap-2 pt-2"><span className="text-[11px]" style={{ color: O.muted }}>Status</span><Pill text={statusPill.t} bg={statusPill.bg} fg={statusPill.fg} /></div>
        </div>
        <div className="rounded-2xl px-4 py-3.5" style={{ background: "#FFF7F0", border: `1.5px solid ${O.orange}` }}>
          <p className="text-[9px] font-black tracking-wider" style={{ color: O.orange }}>{final !== null && rs === "finalized" ? "FINAL HAULING RATE" : "KADAGO PROPOSED HAULING RATE"}</p>
          <p className="text-[28px] font-black my-0.5" style={{ color: O.ink }}>{peso(final !== null && rs === "finalized" ? final : PROPOSED_RATE)}</p>
          <p className="text-[10.5px] leading-snug mb-3" style={{ color: O.muted }}>This rate is coordinated based on the assigned truck, route, cargo requirements, schedule, and included services.</p>
          <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: "#15803d" }}>INCLUDED</p>
          <div className="grid grid-cols-2 gap-1 mb-3">{QUOTE.included.map((i) => <p key={i} className="text-[11px] font-semibold" style={{ color: "#15803d" }}>✓ {i}</p>)}</div>
          <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: O.muted }}>NOT INCLUDED</p>
          {["Toll fees if applicable", "Extra stops", "Extended waiting time", "Special equipment not originally requested"].map((i) => <p key={i} className="text-[11px]" style={{ color: O.muted }}>• {i}</p>)}
        </div>
        {(st === "accepted" || st === "booked") && <OpBtn onClick={onAgreement}>{st === "booked" ? "View Booking" : "Review Agreement"}</OpBtn>}
        {pending && (
          <div className="space-y-2 pt-1">
            <OpBtn onClick={() => setModal(true)}>Confirm Proposed Rate</OpBtn>
            <OpGhost onClick={() => setView("review")}>Request Rate Review</OpGhost>
          </div>
        )}
      </div>
      {modal && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
          <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
            <h3 className="text-[16px] font-black mb-1" style={{ color: O.ink }}>Confirm hauling rate?</h3>
            <p className="text-[24px] font-black mb-1" style={{ color: O.orange }}>{peso(PROPOSED_RATE)}</p>
            <p className="text-[12px] mb-4" style={{ color: O.muted }}>You are confirming the proposed hauling rate for this assignment.</p>
            <div className="space-y-2">
              <OpBtn disabled={PROPOSED_RATE <= 0} onClick={async () => { if (await onDispatch({ rateStage: "confirmed" }) !== false) setModal(false); }}>Confirm Rate</OpBtn>
              <button onClick={() => setModal(false)} className="w-full py-3 rounded-xl text-[12px] font-bold" style={{ color: O.muted, border: `1px solid ${O.border}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
