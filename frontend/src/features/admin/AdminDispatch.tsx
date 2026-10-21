import { useState } from "react";
import { useBookingData, useBookings } from "@/features/customer/BookingContext";
import { A, BackHeader } from "@/features/admin/AdminPortal";
import { MATCHES, REQ, LEVEL_LABEL, LEVEL_COLOR, fmtKg, AFTER_CONFIRM, QUOTE, peso, isCompleted, TRIP_STATUS } from "@/data/dispatchData";
import type { Dispatch, TruckMatch } from "@/data/dispatchData";

type Patch = (p: Partial<Dispatch>) => void | Promise<boolean>;

const ink = "#0D1828";

export function Card({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: highlight ? "#F1F5FF" : A.card, border: `1px solid ${highlight ? "rgba(29,85,214,0.3)" : A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {children}
    </div>
  );
}
export function Label({ children, color = A.mutedFg }: { children: React.ReactNode; color?: string }) {
  return <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color }}>{children}</p>;
}
export function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[11px]" style={{ color: A.mutedFg }}>{k}</span>
      <span className={`text-[11px] text-right ${strong ? "font-black" : "font-semibold"}`} style={{ color: ink }}>{v}</span>
    </div>
  );
}
export function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color: fg }}>{text}</span>;
}
export function Primary({ children, onClick, disabled, color = A.blue }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; color?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full py-3 rounded-xl text-[13px] font-black text-white transition-opacity active:opacity-80" style={{ background: disabled ? "#CBD5E1" : color }}>
      {children}
    </button>
  );
}
export function Secondary({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-3 rounded-xl text-[12px] font-bold transition-opacity active:opacity-70" style={{ background: "#fff", color: A.blue, border: `1.5px solid ${A.blue}` }}>
      {children}
    </button>
  );
}
function Tabs<T extends string>({ tabs, value, onChange, counts }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div aria-label="Filter by status" className="flex min-w-0 shrink-0 gap-2 overflow-x-auto px-3 py-3">
      {tabs.map((t) => (
        <button type="button" key={t.id} aria-pressed={value === t.id} onClick={() => onChange(t.id)} className="flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 text-[11px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: value === t.id ? A.blue : A.card, color: value === t.id ? "#fff" : A.mutedFg, borderColor: value === t.id ? A.blue : A.border }}>
          <span>{t.label}</span>
          {counts && counts[t.id] !== undefined && <span className="flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] leading-4 tabular-nums" style={{ background: value === t.id ? "rgba(255,255,255,0.2)" : "#EEF2F7", color: value === t.id ? "#fff" : ink }}>{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  );
}
function LevelPill({ m }: { m: TruckMatch }) {
  const c = LEVEL_COLOR[m.level];
  return <Pill text={LEVEL_LABEL[m.level].toUpperCase()} bg={c.bg} fg={c.fg} />;
}
export function Empty({ text }: { text: string }) {
  return <div className="text-center py-14 px-8"><p className="text-4xl mb-2">📭</p><p className="text-[12px]" style={{ color: A.mutedFg }}>{text}</p></div>;
}

const isDeclined = (d: Dispatch) => d.declineReason !== null && d.matchIdx >= 1;

// ── Dashboard "Needs Your Attention" ───────────────────────────────────────────
export function NeedsAttention({ dispatch, onReview, onAssignments, onRate, onPrepare, onCancel }: { dispatch: Dispatch; onReview: () => void; onAssignments: () => void; onRate: () => void; onPrepare: () => void; onCancel: () => void }) {
  const { selected } = useBookings();
  const m = MATCHES[dispatch.matchIdx] || MATCHES[0];
  if (!selected) return <Card><Label>NO REQUEST SELECTED</Label><p className="text-xs text-slate-500">Customer requests appear here after they are submitted.</p></Card>;
  if (!selected.assignment && !m.truckId) return <div><p className="mb-2 px-1 text-[10px] font-black text-slate-500">NEEDS YOUR ATTENTION</p><Card><Label color={A.orange}>NO SUITABLE TRUCK AVAILABLE</Label><Row k="Request" v={selected.requestId} strong /><Row k="Customer" v={selected.customer} /><p className="mt-3 text-xs leading-relaxed text-slate-500">No registered truck currently meets the approval, capacity, route, availability, and equipment requirements. Review applications and truck verification in More.</p><div className="mt-3"><Secondary onClick={onReview}>Review Request</Secondary></div></Card></div>;
  const st = dispatch.status;
  const declined = isDeclined(dispatch) && st === "suggested";
  const waiting = st === "approved";
  const after = AFTER_CONFIRM.includes(st);
  const rs = dispatch.rateStage;
  let tag = declined ? "OPERATOR DECLINED ASSIGNMENT" : waiting ? "WAITING FOR OPERATOR" : "SYSTEM MATCH READY";
  let tagColor = declined ? A.red : waiting ? A.orange : A.blue;
  if (after) {
    tagColor = A.green;
    tag = st === "quote" ? "QUOTATION SENT" : st === "booked" ? "BOOKING AGREEMENT CONFIRMED" : st === "accepted" ? "CUSTOMER ACCEPTED QUOTATION" : st === "declined" ? "CUSTOMER DECLINED QUOTATION"
      : rs === "review" ? "RATE REVIEW REQUESTED" : rs === "finalized" ? "RATE FINALIZED" : "OPERATOR CONFIRMED";
    if (st === "declined" || rs === "review") tagColor = A.red;
  }
  if (st === "booked" && dispatch.tripStage !== "upcoming") { tag = isCompleted(dispatch) ? "BOOKING COMPLETED" : `ACTIVE HAULING · ${TRIP_STATUS[dispatch.tripStage].toUpperCase()}`; tagColor = A.green; }
  if (dispatch.cancelled) { tag = "REQUEST CANCELLED"; tagColor = A.mutedFg; }
  return (
    <div>
      <p className="text-[10px] font-black tracking-wider mb-2 px-1" style={{ color: A.mutedFg }}>NEEDS YOUR ATTENTION</p>
      <div className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1.5px solid ${tagColor}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: tagColor }} />
            <span className="text-[10px] font-black tracking-wider" style={{ color: tagColor }}>{tag}</span>
          </div>
          <Row k="Request" v={REQ.id} strong />
          <Row k="Customer" v={REQ.customer} />
          {!after && <Row k="Cargo" v={REQ.category} />}
          {after && !dispatch.cancelled && st !== "confirmed" && <Row k="Quotation" v={QUOTE.id} />}
          {st === "declined" && <Row k="Reason" v={dispatch.quoteDecline ?? "—"} />}
          {rs === "review" && st === "confirmed" && <Row k="Operator Request" v={peso(dispatch.requestedRate ?? 0)} />}
          {declined && <Row k="Reason" v={dispatch.declineReason ?? ""} />}
          <Row k={declined ? "Next Match" : waiting || after ? "Assigned To" : "System Recommendation"} v={m.business} />
        </div>
        {!dispatch.cancelled && (
          <div className="px-4 pb-3 space-y-2">
            {st === "declined" ? (
              <>
                <Primary onClick={onRate} color={A.red}>Review Rate</Primary>
                <Secondary onClick={onAssignments}>Review Assignment</Secondary>
                <Secondary onClick={onCancel}>Cancel Request</Secondary>
              </>
            ) : st === "confirmed" ? (
              rs === "finalized" ? <Primary onClick={onPrepare}>Prepare Quotation</Primary>
                : <Primary onClick={onRate} color={rs === "review" ? A.red : A.blue}>{rs === "review" ? "Review Rate" : "Coordinate Rate"}</Primary>
            ) : waiting || after
              ? <Secondary onClick={onAssignments}>View Assignment</Secondary>
              : <Primary onClick={onReview} color={declined ? A.red : A.blue}>{declined ? "Review Next Suggested Match" : "Review Match"}</Primary>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hauling Requests ───────────────────────────────────────────────────────────
type ReqTab = "new" | "review" | "matched" | "assigned" | "completed";
export function RequestsScreen({ dispatch, onBack, onReview, onAssignment, onSuitableTrucks }: { dispatch: Dispatch; onBack: () => void; onReview: () => void; onAssignment: () => void; onSuitableTrucks: () => void }) {
  const { selected } = useBookings();
  const { REQ, MATCHES: requestMatches } = useBookingData();
  const availableMatches = selected && !selected.assignment && !selected.dispatch.cancelled && !selected.completed
    ? requestMatches.filter(match => match.truckId && match.level !== "not") : [];
  const bestMatch = availableMatches[0];
  const [tab, setTab] = useState<ReqTab>("new");
  const s = dispatch.status;
  const mine: ReqTab = s === "review" ? "new" : s === "suggested" ? "matched" : "assigned";
  const label = s === "review" ? "Under KadaGo Review" : s === "suggested" ? (isDeclined(dispatch) ? "Operator Declined — Next Match Ready" : "Match Pending Approval") : s === "approved" ? "Waiting for Operator Confirmation" : s === "quote" ? "Quotation Sent" : s === "booked" ? "Booking Confirmed" : s === "accepted" ? "Quotation Accepted" : s === "declined" ? "Quotation Declined" : dispatch.rateStage === "finalized" ? "Rate Finalized" : dispatch.rateStage === "review" ? "Rate Review Requested" : "Operator Confirmed";
  const counts: Record<ReqTab, number> = { new: selected && mine === "new" ? 1 : 0, review: 0, matched: selected && mine === "matched" ? 1 : 0, assigned: selected && mine === "assigned" ? 1 : 0, completed: 2 };
  return (
    <div className="h-full min-w-0 flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Hauling Requests" subtitle="Submitted by business customers" onBack={onBack} />
      <Tabs<ReqTab>
        tabs={[{ id: "new", label: "New" }, { id: "review", label: "Under Review" }, { id: "matched", label: "Matched" }, { id: "assigned", label: "Assigned" }, { id: "completed", label: "Completed" }]}
        value={tab} onChange={setTab} counts={counts} />
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 space-y-3">
        {selected && tab === mine && (
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 break-words text-[11px] font-extrabold tracking-wide" style={{ color: A.blue }}>{REQ.id}</span>
              <span className="max-w-full rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold leading-relaxed text-amber-800">{label}</span>
            </div>
            <p className="break-words text-[14px] font-extrabold leading-snug" style={{ color: ink }}>{REQ.customer}</p>
            <p className="mt-1 break-words text-[11px] leading-relaxed" style={{ color: A.mutedFg }}>{REQ.category} • {REQ.cargoShort}</p>
            <dl className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
              {[["Weight", REQ.weight], ["Route", REQ.route], ["Pickup", REQ.schedule]].map(([name, value]) => (
                <div key={name} className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3 text-[11px] leading-relaxed">
                  <dt style={{ color: A.mutedFg }}>{name}</dt>
                  <dd className="m-0 break-words text-right font-semibold" style={{ color: ink }}>{value}</dd>
                </div>
              ))}
            </dl>
            {!selected.assignment && !selected.dispatch.cancelled && !selected.completed && (
              <section aria-label="Suitable available trucks" className={`mt-4 rounded-xl border p-3 ${bestMatch ? "border-emerald-100 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-[11px] font-extrabold ${bestMatch ? "text-emerald-800" : "text-slate-600"}`}>
                  {bestMatch ? `${availableMatches.length} suitable ${availableMatches.length === 1 ? "truck" : "trucks"} available` : "No suitable truck available"}
                </p>
                {bestMatch ? (
                  <>
                    <p className="mt-2 break-words text-[12px] font-bold leading-relaxed text-slate-900">{bestMatch.truck}</p>
                    <p className="mt-0.5 break-words text-[11px] leading-relaxed text-slate-600">{bestMatch.plate} · {fmtKg(bestMatch.payloadKg)} capacity</p>
                    <p className="mt-1 break-words text-[11px] leading-relaxed text-slate-600">{bestMatch.business} · {bestMatch.driver}</p>
                    {bestMatch.checks.cargoType === "warn" && <p className="mt-2 text-[11px] leading-relaxed text-amber-800">Truck body differs from the customer's preference. Review before approving.</p>}
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Verified truck and approved operator. Capacity, route, equipment, and availability checked. Pickup schedule requires operator confirmation.</p>
                    <button type="button" onClick={onSuitableTrucks} className="mt-2 min-h-11 w-full rounded-lg border border-emerald-200 bg-white px-3 text-[11px] font-bold text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">View Suitable Trucks</button>
                  </>
                ) : <p className="mt-1 text-[11px] leading-relaxed text-slate-500">No registered truck currently passes all required checks. Approve the operator, verify the truck, and check its service areas, capacity, equipment, and availability.</p>}
              </section>
            )}
            <div className="mt-4">
              {mine === "assigned" ? <Secondary onClick={onAssignment}>View Assignment</Secondary> : <Primary onClick={onReview}>Review Request</Primary>}
            </div>
          </Card>
        )}
        {tab === "completed" && [
          { id: "KG-HR-12301", c: "Valencia Hardware Depot", cargo: "Steel Bars • 3.5 tons", route: "Valencia → Malaybalay" },
          { id: "KG-HR-12288", c: "Bukidnon Feeds Corp.", cargo: "Animal Feed • 6 tons", route: "Maramag → CDO" },
        ].map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between mb-1"><span className="text-[12px] font-black" style={{ color: A.blue }}>{r.id}</span><Pill text="COMPLETED" bg="rgba(22,163,74,0.1)" fg="#15803d" /></div>
            <p className="text-[12px] font-bold" style={{ color: ink }}>{r.c}</p>
            <p className="text-[10px]" style={{ color: A.mutedFg }}>{r.cargo} • {r.route}</p>
          </Card>
        ))}
        {(!selected || tab !== mine) && tab !== "completed" && <Empty text="No Requests. New hauling requests will appear here." />}
      </div>
    </div>
  );
}

// ── Review Hauling Request + System Suggested Match ────────────────────────────
function MatchBody({ m }: { m: TruckMatch }) {
  return (
    <>
      <p className="text-[14px] font-black" style={{ color: ink }}>{m.business}</p>
      <p className="text-[11px] mb-1.5" style={{ color: A.mutedFg }}>Operator {m.driver}</p>
      <Row k="Truck" v={m.truck} />
      <Row k="Plate" v={m.plate} />
      {m.cargoKg && <Row k="Cargo Weight" v={fmtKg(m.cargoKg)} strong />}
      <Row k="Verified Payload" v={fmtKg(m.payloadKg)} strong />
      <Row k="Availability" v={m.availability} />
      <Row k="Service Areas" v={m.areas.join(" / ")} />
      <div className="flex gap-1.5 my-2">
        <Pill text="✓ VERIFIED OPERATOR" bg="rgba(22,163,74,0.1)" fg="#15803d" />
        <Pill text="✓ VERIFIED TRUCK" bg="rgba(22,163,74,0.1)" fg="#15803d" />
      </div>
      <Label>MATCH REASONS</Label>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2.5">
        {m.reasons.map((r) => (
          <p key={r.text} className="text-[10.5px] font-semibold" style={{ color: r.state === "ok" ? "#15803d" : r.state === "warn" ? "#a16207" : A.red }}>
            {r.state === "ok" ? "✓" : r.state === "warn" ? "!" : "✕"} {r.text}
          </p>
        ))}
      </div>
    </>
  );
}

const CK = (state: "ok" | "warn" | "fail") => state === "ok" ? { icon: "✓", color: "#15803d" } : state === "warn" ? { icon: "!", color: "#a16207" } : { icon: "✕", color: A.red };

function MatchChecks({ m, cargoKg, cargoType, pickup, dest, schedule, requirement }: { m: TruckMatch; cargoKg: number; cargoType: string; pickup: string; dest: string; schedule: string; requirement: string }) {
  const capOk = cargoKg <= m.payloadKg;
  const rows: { k: string; v: string; s: "ok" | "warn" | "fail" }[] = [
    { k: "Cargo weight vs truck payload", v: `${fmtKg(cargoKg)} vs ${fmtKg(m.payloadKg)}`, s: capOk ? "ok" : "fail" },
    { k: "Cargo type", v: cargoType, s: m.checks.cargoType },
    { k: "Pickup", v: pickup, s: m.checks.pickup },
    { k: "Destination", v: dest, s: m.checks.dest },
    { k: "Service area", v: m.areas.join(" / "), s: m.checks.dest === "ok" && m.checks.pickup === "ok" ? "ok" : "warn" },
    { k: "Schedule", v: `${schedule} · ${m.scheduleText}`, s: m.checks.schedule },
    { k: "Availability", v: m.availability, s: m.availability === "Available" ? "ok" : "warn" },
    { k: "Required equipment", v: `${requirement} · ${m.equipmentText}`, s: m.checks.equipment },
  ];
  return (
    <div className="mb-2.5">
      <Label>MATCHING CHECKS</Label>
      {rows.map((r) => (
        <div key={r.k} className="flex items-start gap-2 py-0.5">
          <span className="text-[11px] font-black w-3" style={{ color: CK(r.s).color }}>{CK(r.s).icon}</span>
          <span className="flex-1 text-[10.5px]" style={{ color: A.mutedFg }}>{r.k}</span>
          <span className="text-[10.5px] font-semibold text-right max-w-[55%]" style={{ color: CK(r.s).color }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

export function ReviewRequestScreen({ dispatch, matchIdx, onBack, onOthers, onApprove }: { dispatch: Dispatch; matchIdx: number; onBack: () => void; onOthers: () => void; onApprove: () => void }) {
  const [modal, setModal] = useState(false);
  const [photos, setPhotos] = useState(false);
  const m = MATCHES[matchIdx] || MATCHES[0];
  if (!m.truckId) return <div className="h-full flex flex-col bg-slate-50"><BackHeader title="Review Hauling Request" subtitle={REQ.id} onBack={onBack} /><div className="overflow-y-auto p-3"><Card><Label color={A.orange}>NO SUITABLE TRUCK AVAILABLE</Label><Row k="Customer" v={REQ.customer} /><Row k="Cargo" v={REQ.cargo} /><Row k="Weight" v={REQ.weight} /><Row k="Pickup" v={REQ.pickup} /><Row k="Destination" v={REQ.dest} /><Row k="Equipment" v={REQ.requirements || "None specified"} /><p className="mt-3 text-xs text-slate-500">Approve an operator and verify a truck that meets these requirements. The system will recommend it once it is available.</p><div className="mt-3"><Primary disabled>Approve Match</Primary></div></Card></div></div>;
  const locked = dispatch.status === "approved" || AFTER_CONFIRM.includes(dispatch.status);
  const next = isDeclined(dispatch) && matchIdx >= 1;
  const unsafe = m.level === "not";
  return (
    <div className="h-full flex flex-col relative" style={{ background: A.bg }}>
      <BackHeader title="Review Hauling Request" subtitle={REQ.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {next && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <p className="text-[10px] font-black" style={{ color: A.red }}>OPERATOR DECLINED ASSIGNMENT</p>
            <p className="text-[11px]" style={{ color: ink }}>Dela Cruz Trucking Services declined. Reason: {dispatch.declineReason}.</p>
          </div>
        )}

        <Card highlight>
          <Label color={A.blue}>{next ? "NEXT RECOMMENDED MATCH" : "SYSTEM SUGGESTED MATCH"}</Label>
          <p className="text-[10px] mb-2.5 leading-snug" style={{ color: A.mutedFg }}>Based on registered truck capacity, body preference, service areas, current availability, and required equipment. The operator confirms the pickup schedule.</p>
          <MatchBody m={m} />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black" style={{ color: A.mutedFg }}>STATUS</span>
            <LevelPill m={m} />
          </div>
          {unsafe && <p className="text-[11px] font-black mb-2" style={{ color: A.red }}>⚠ NOT SUITABLE — {m.reasonSummary}</p>}
          <div className="space-y-2">
            {locked
              ? <Primary disabled>Match Approved</Primary>
              : <Primary onClick={() => setModal(true)} disabled={unsafe}>Approve Match</Primary>}
            <Secondary onClick={onOthers}>View Other Matches</Secondary>
          </div>
        </Card>

        <Card>
          <Label>CUSTOMER</Label>
          <Row k="Business" v={REQ.customer} strong />
          <Row k="Representative" v={REQ.rep} />
        </Card>
        <Card>
          <Label>CARGO</Label>
          <Row k="Category" v={REQ.category} />
          <Row k="Cargo" v={REQ.cargo} />
          <Row k="Quantity" v={REQ.quantity} />
          <Row k="Weight" v={REQ.weight} strong />
          <Row k="Special Requirements" v={REQ.requirements} />
        </Card>
        <Card>
          <Label>ROUTE & SCHEDULE</Label>
          <Row k="Pickup" v={REQ.pickup} />
          <Row k="Destination" v={REQ.dest} />
          <Row k="Schedule" v={REQ.schedule} />
        </Card>
        <Card>
          <Label>CUSTOMER BUDGET</Label>
          <Row k="Reference only (optional)" v={REQ.budget} />
        </Card>
        <Card>
          <Label>CARGO PHOTOS</Label>
          <button onClick={() => setPhotos(!photos)} className="text-[12px] font-bold" style={{ color: A.blue }}>{photos ? "Hide Attachments" : "View Attachments"}</button>
          {photos && (
            <div className="flex gap-2 mt-2">
              {["Cement stack", "Loading area"].map((p) => (
                <div key={p} className="flex-1 h-16 rounded-lg flex items-center justify-center text-[10px]" style={{ background: "#E2E8F0", color: A.mutedFg }}>📷 {p}</div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {modal && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
          <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
            <h3 className="text-[16px] font-black mb-1" style={{ color: ink }}>Approve this truck and operator?</h3>
            <p className="text-[10.5px] mb-3" style={{ color: A.mutedFg }}>The assignment will be sent to the operator for confirmation (simulated).</p>
            <div className="rounded-xl px-3 py-2 mb-4" style={{ background: A.bg, border: `1px solid ${A.border}` }}>
              <Row k="Request" v={REQ.id} />
              <Row k="Operator" v={m.business} />
              <Row k="Driver" v={m.driver} />
              <Row k="Truck" v={m.truckShort} />
            </div>
            <div className="space-y-2">
              <Primary onClick={() => { setModal(false); onApprove(); }}>Send Assignment</Primary>
              <Secondary onClick={() => setModal(false)}>Cancel</Secondary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compare Suitable Trucks & Operators ────────────────────────────────────────
export function CompareScreen({ dispatch, onBack, onSelect }: { dispatch: Dispatch; onBack: () => void; onSelect: (i: number) => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Compare Suitable Trucks & Operators" subtitle={`${REQ.id} • ${REQ.weight} • ${REQ.route}`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {!MATCHES.some(m => m.truckId) && <Empty text="No registered truck currently meets this request. Verify an approved operator's truck and check its capacity, route, equipment, and availability." />}
        {MATCHES.map((m, i) => {
          if (!m.truckId) return null;
          const declinedOne = isDeclined(dispatch) && i < dispatch.matchIdx;
          const disabled = m.level === "not" || declinedOne;
          return (
            <Card key={m.plate} highlight={i === dispatch.matchIdx && !disabled}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <Label>MATCH {i + 1}</Label>
                  <p className="text-[13px] font-black leading-tight" style={{ color: ink }}>{m.business}</p>
                </div>
                {declinedOne ? <Pill text="DECLINED" bg="rgba(220,38,38,0.1)" fg={A.red} /> : <LevelPill m={m} />}
              </div>
              <Row k="Driver" v={m.driver} />
              <Row k="Truck Type" v={m.truck} />
              {m.cargoKg && <Row k="Cargo Weight" v={fmtKg(m.cargoKg)} strong />}
      <Row k="Verified Payload" v={fmtKg(m.payloadKg)} strong />
              <Row k="Cargo Suitability" v={m.checks.cargoType === "ok" ? "Suitable" : "Needs review"} />
              <Row k="Route Coverage" v={m.areas.join(" / ")} />
              <Row k="Availability" v={m.availability} />
              <Row k="Schedule" v={m.scheduleText} />
              <Row k="Required Equipment" v={m.equipmentText} />
              <Row k="Verification" v="Operator ✓  Truck ✓" />
              <Row k="Rating" v={`★ ${m.rating}`} />
              {m.level === "not" && <p className="text-[10.5px] font-bold mt-1" style={{ color: A.red }}>⚠ Reason: {m.reasonSummary}</p>}
              {declinedOne && <p className="text-[10.5px] font-bold mt-1" style={{ color: A.red }}>Reason: {dispatch.declineReason}</p>}
              <div className="mt-2.5">
                <Primary disabled={disabled} onClick={() => onSelect(i)}>Select Match</Primary>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Assignment Approved ────────────────────────────────────────────────────────
export function ApprovedScreen({ matchIdx, onView, onBack }: { matchIdx: number; onView: () => void; onBack: () => void }) {
  const m = MATCHES[matchIdx] || MATCHES[0];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Assignment Approved" subtitle={REQ.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white" style={{ background: A.green, animation: "successBounce 0.6s ease-out" }}>✓</div>
        <h2 className="text-[19px] font-black mb-1" style={{ color: ink }}>Assignment Approved</h2>
        <p className="text-[11px] mb-5" style={{ color: A.mutedFg }}>The assignment was sent to the operator.</p>
        <div className="text-left"><Card>
          <Row k="Request" v={REQ.id} strong />
          <Row k="Customer" v={REQ.customer} />
          <Row k="Assigned Operator" v={m.business} />
          <Row k="Driver" v={m.driver} />
          <Row k="Truck" v={m.truckShort} />
          <div className="flex justify-between items-center pt-1.5">
            <span className="text-[11px]" style={{ color: A.mutedFg }}>Status</span>
            <Pill text="Waiting for Operator Confirmation" bg="rgba(244,123,32,0.12)" fg="#c2410c" />
          </div>
        </Card></div>
      </div>
      <div className="px-4 pb-4"><Primary onClick={onView}>View Assignment</Primary></div>
    </div>
  );
}

// ── Assignments ────────────────────────────────────────────────────────────────
type AsTab = "pending" | "confirmed" | "declined" | "completed";
export function AssignmentsScreen({ dispatch, onBack, onView }: { dispatch: Dispatch; onBack: () => void; onView: () => void }) {
  const [tab, setTab] = useState<AsTab>("pending");
  const m = MATCHES[dispatch.matchIdx] || MATCHES[0];
  const declined = isDeclined(dispatch);
  const active = dispatch.status === "approved" ? "pending" : AFTER_CONFIRM.includes(dispatch.status) ? "confirmed" : null;
  const cards: { tab: AsTab; m: TruckMatch; status: string; bg: string; fg: string; view: boolean }[] = [];
  if (active === "pending") cards.push({ tab: "pending", m, status: "Waiting for Operator Confirmation", bg: "rgba(244,123,32,0.12)", fg: "#c2410c", view: true });
  if (active === "confirmed") cards.push({ tab: "confirmed", m, status: dispatch.status === "confirmed" ? "Operator Confirmed" : dispatch.status === "quote" ? "Quotation Sent" : dispatch.status === "booked" ? "Booking Confirmed" : dispatch.status === "accepted" ? "Quotation Accepted" : "Quotation Declined", bg: "rgba(22,163,74,0.1)", fg: "#15803d", view: true });
  if (declined) cards.push({ tab: "declined", m: MATCHES[0], status: `Declined — ${dispatch.declineReason}`, bg: "rgba(220,38,38,0.1)", fg: A.red, view: false });
  const counts: Record<AsTab, number> = { pending: cards.filter((c) => c.tab === "pending").length, confirmed: cards.filter((c) => c.tab === "confirmed").length, declined: cards.filter((c) => c.tab === "declined").length, completed: 0 };
  const shown = cards.filter((c) => c.tab === tab);
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Assignments" subtitle="Matching & operator confirmation" onBack={onBack} />
      <Tabs<AsTab>
        tabs={[{ id: "pending", label: "Pending Operator Confirmation" }, { id: "confirmed", label: "Confirmed" }, { id: "declined", label: "Declined" }, { id: "completed", label: "Completed" }]}
        value={tab} onChange={setTab} counts={counts} />
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
        {shown.map((c) => (
          <Card key={c.tab}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-black" style={{ color: A.blue }}>{REQ.id}</span>
              <Pill text={c.status} bg={c.bg} fg={c.fg} />
            </div>
            <Row k="Customer" v={REQ.customer} />
            <Row k="Operator" v={c.m.business} />
            <Row k="Truck" v={c.m.truckShort} />
            <Row k="Schedule" v={REQ.schedule} />
            {c.view && <div className="mt-2"><Secondary onClick={onView}>View Assignment</Secondary></div>}
          </Card>
        ))}
        {shown.length === 0 && <Empty text="No Assignments in this tab." />}
        {tab === "pending" && dispatch.status === "suggested" && <p className="text-center text-[10.5px] px-6" style={{ color: A.mutedFg }}>No match approved yet. Review the system suggested match from the dashboard.</p>}
      </div>
    </div>
  );
}

export function AssignmentDetailScreen({ dispatch, onBack, onDispatch, onRate, onPrepare, onAgreement }: { dispatch: Dispatch; onBack: () => void; onDispatch: Patch; onRate: () => void; onPrepare: () => void; onAgreement: () => void }) {
  const m = MATCHES[dispatch.matchIdx] || MATCHES[0];
  const waiting = dispatch.status === "approved";
  const st = dispatch.status;
  const rs = dispatch.rateStage;
  const TL = ["Match Approved", "Operator Confirmed", "Rate Coordinated", "Quotation Sent", "Customer Accepted", "Agreement Confirmed", "Ready for Pickup"];
  const doneCount = waiting ? 1 : st === "confirmed" ? (rs === "finalized" ? 3 : 2) : st === "quote" || st === "declined" ? 4 : st === "accepted" ? 5 : 6;
  const statusText = st === "quote" ? "Quotation Sent" : st === "booked" ? "Booking Confirmed" : st === "accepted" ? (dispatch.agreement === "operator" ? "Awaiting Operator Confirmation" : "Awaiting Customer Confirmation") : st === "declined" ? "Quotation Declined by Customer" : "Operator Confirmed";
  const nextText = st === "confirmed" ? "Next: KadaGo coordinates the hauling rate and prepares the quotation." : st === "quote" ? "Waiting for the customer to accept or decline." : st === "accepted" ? "Next: Booking Agreement confirmation by both parties." : st === "booked" ? "Booking ready for pickup." : "Review the rate or assignment, or cancel the request.";
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Assignment" subtitle={REQ.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        <Card>
          <Label>STATUS</Label>
          <Pill text={waiting ? "Waiting for Operator Confirmation" : statusText} bg={waiting ? "rgba(244,123,32,0.12)" : "rgba(22,163,74,0.1)"} fg={waiting ? "#c2410c" : "#15803d"} />
          {!waiting && <p className="text-[11px] mt-2" style={{ color: A.mutedFg }}>{nextText}</p>}
        </Card>
        {!waiting && (
          <Card>
            <Label>ASSIGNMENT TIMELINE</Label>
            {TL.map((t, i) => {
              const done = i < doneCount; const active = i === doneCount;
              return (
                <div key={t} className="flex items-center gap-2.5 py-1">
                  <span className="w-4 text-center text-[12px] font-black" style={{ color: done ? A.green : active ? A.blue : A.muted }}>{done ? "✓" : active ? "●" : "○"}</span>
                  <span className="text-[12px]" style={{ color: done || active ? ink : A.muted, fontWeight: active ? 800 : 500 }}>{t}</span>
                </div>
              );
            })}
          </Card>
        )}
        <Card>
          <Label>ASSIGNED TO</Label>
          <Row k="Operator" v={m.business} strong />
          <Row k="Driver" v={m.driver} />
          <Row k="Truck" v={m.truck} />
          <Row k="Plate" v={m.plate} />
          <Row k="Verified Payload" v={fmtKg(m.payloadKg)} />
        </Card>
        <Card>
          <Label>REQUEST</Label>
          <Row k="Customer" v={REQ.customer} />
          <Row k="Cargo" v={REQ.cargoShort} />
          <Row k="Weight" v={REQ.weight} />
          <Row k="Route" v={REQ.route} />
          <Row k="Schedule" v={REQ.schedule} />
        </Card>
        {waiting && dispatch.matchIdx >= 1 && (
          <div className="rounded-2xl px-4 py-3" style={{ border: "1.5px dashed rgba(29,85,214,0.4)", background: "#F8FAFF" }}>
            <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color: A.blue }}>DEMO CONTROL</p>
            <p className="text-[10.5px] mb-2" style={{ color: A.mutedFg }}>The demo operator account belongs to Dela Cruz Trucking. Simulate this operator&apos;s reply.</p>
            <Primary onClick={() => onDispatch({ status: "confirmed" })}>Simulate Operator Confirmation</Primary>
          </div>
        )}
        {st === "confirmed" && <Primary onClick={rs === "finalized" ? onPrepare : onRate}>{rs === "finalized" ? "Prepare Quotation" : rs === "review" ? "Review Rate" : "Coordinate Rate"}</Primary>}
        {st === "declined" && <Primary onClick={onRate} color={A.red}>Review Rate</Primary>}
        {(st === "accepted" || st === "booked") && <Primary onClick={onAgreement}>View Booking Agreement</Primary>}
        {(st === "quote" || st === "accepted" || st === "booked") && <Secondary onClick={onRate}>View Rate Coordination</Secondary>}
      </div>
    </div>
  );
}
