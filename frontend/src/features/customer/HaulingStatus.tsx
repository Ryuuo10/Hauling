import { MATCHES, fmtKg } from "@/data/dispatchData";
import { useBookingData } from "@/features/customer/BookingContext";

export type MatchStatus = "review" | "suggested" | "approved" | "confirmed" | "quote" | "accepted" | "declined" | "booked";

export const REQUEST = {
  id: "KG-HR-12389",
  cargo: "30 Sacks of Portland Cement",
  category: "Construction Materials",
  route: "Malaybalay → Cagayan de Oro",
  routeShort: "Malaybalay → CDO",
  date: "Oct 22, 2026 • 8:00 AM",
};

export const STATUS_LABEL: Record<MatchStatus, string> = {
  review: "Under KadaGo Review",
  suggested: "Matching Suitable Truck",
  approved: "Waiting for Operator Confirmation",
  confirmed: "Quotation Preparation",
  quote: "Quotation Ready",
  accepted: "Quotation Accepted",
  declined: "Quotation Declined",
  booked: "Booking Confirmed",
};

const T = {
  blue: "#1D55D6",
  green: "#16A34A",
  border: "rgba(0,0,0,0.08)",
  mutedFg: "#94a3b8",
  muted: "#64748b",
  text: "#0D1828",
};

const ACTIVE_INDEX: Record<MatchStatus, number> = { review: 1, suggested: 3, approved: 4, confirmed: 5, quote: 6, declined: 6, accepted: 7, booked: 8 };

function stepLabel(i: number, status: MatchStatus) {
  const active = ACTIVE_INDEX[status];
  const done = i < active;
  switch (i) {
    case 0: return "Request Submitted";
    case 1: return "KadaGo Review";
    case 2: return "Suitable Match Suggested";
    case 3: return "Admin Approval";
    case 4: return "Operator Confirmation";
    case 5: return "Quotation Preparation";
    case 6: return done ? "Quotation Accepted" : status === "declined" ? "Quotation Declined" : "Quotation Ready";
    case 7: return done ? "Booking Agreement Confirmed" : "Booking Agreement";
    default: return "Upcoming Pickup — Oct 22 at 8:00 AM";
  }
}

const STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function RequestStepper({ status, compact = false }: { status: MatchStatus; compact?: boolean }) {
  const active = ACTIVE_INDEX[status];
  const visible = compact ? STEPS.map((s, i) => ({ s, i })).filter(({ i }) => i <= active + 1) : STEPS.map((s, i) => ({ s, i }));
  return (
    <div>
      {visible.map(({ s, i }, idx) => {
        const done = i < active;
        const isActive = i === active && !done;
        return (
          <div key={s} className="flex items-start gap-2.5">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: done ? T.green : isActive ? T.blue : "transparent",
                  border: done || isActive ? "none" : "1.5px solid rgba(0,0,0,0.18)",
                }}
              >
                {done ? (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                ) : null}
              </div>
              {idx < visible.length - 1 && <div className="w-px" style={{ height: "16px", background: done ? T.green : "rgba(0,0,0,0.1)" }} />}
            </div>
            <p className="text-[12px] leading-tight pb-2.5" style={{ color: done ? T.green : isActive ? T.text : T.mutedFg, fontWeight: isActive || done ? 700 : 500 }}>
              {stepLabel(i, status)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: T.mutedFg }}>{k}</span>
      <span className="text-[11px] font-bold text-right" style={{ color: T.text }}>{v}</span>
    </div>
  );
}

const card = { background: "#FFFFFF", border: `1px solid ${T.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };

export function RequestStatusScreen({
  status, onStatus, onBack, justSubmitted = false, onDone, doneLabel = "Back to Home", matchIdx = 0, onViewQuotation, completed = false,
}: {
  completed?: boolean;
  onViewQuotation?: () => void;
  matchIdx?: number;
  status: MatchStatus;
  onStatus: (s: MatchStatus) => void;
  onBack?: () => void;
  justSubmitted?: boolean;
  onDone?: () => void;
  doneLabel?: string;
}) {
  const { REQUEST, MATCHES } = useBookingData();
  const headline = justSubmitted && status === "review"
    ? { title: "Hauling Request Submitted!", sub: "KadaGo is reviewing your cargo, route, schedule, and hauling requirements.", badge: "UNDER KADAGO REVIEW" }
    : status === "review"
    ? { title: "Under KadaGo Review", sub: "KadaGo is reviewing your cargo, route, schedule, and hauling requirements.", badge: "UNDER KADAGO REVIEW" }
    : status === "suggested"
    ? { title: "Matching Suitable Truck", sub: "KadaGo Dispatch is reviewing suitable trucks and operators for your request.", badge: "MATCHING SUITABLE TRUCK" }
    : status === "approved"
    ? { title: "Truck & Operator Approved", sub: "Admin / Dispatch approved the match. Waiting for the operator to confirm the assignment.", badge: "WAITING FOR OPERATOR CONFIRMATION" }
    : status === "confirmed"
    ? { title: "Operator Confirmed", sub: "KadaGo will now coordinate the hauling rate and prepare the quotation.", badge: "QUOTATION PREPARATION" }
    : status === "quote"
    ? { title: "Quotation Ready", sub: "Your coordinated hauling quotation is ready for review.", badge: "AWAITING YOUR APPROVAL" }
    : status === "accepted"
    ? { title: "Quotation Accepted", sub: "KadaGo will now prepare the Booking Agreement.", badge: "BOOKING AGREEMENT NEXT" }
    : status === "booked" && completed
    ? { title: "Booking Completed", sub: "Your hauling was delivered, confirmed, and the payment record was verified as Paid.", badge: "COMPLETED" }
    : status === "booked"
    ? { title: "Booking Confirmed", sub: "Both parties confirmed the Booking Agreement. Your hauling is ready for the scheduled pickup.", badge: "UPCOMING PICKUP" }
    : { title: "Quotation Declined", sub: "KadaGo Dispatch will review the request and determine the next step.", badge: "UNDER KADAGO REVIEW" };

  const ok = status === "review";
  const m = MATCHES[Math.min(matchIdx, MATCHES.length - 1)];

  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center gap-3" style={{ background: "#fff", borderBottom: `1px solid ${T.border}` }}>
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-70" style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${T.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div>
          <h1 className="text-[15px] font-black leading-tight" style={{ color: T.text }}>Request Status</h1>
          <p className="text-[10px]" style={{ color: T.mutedFg }}>{REQUEST.id}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <div className="rounded-2xl px-4 py-5 text-center" style={{ background: "#EEF2FF", border: "1px solid rgba(29,85,214,0.2)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: ok ? T.blue : T.green, animation: "successBounce 0.6s ease-out" }}>
            {ok ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            )}
          </div>
          <h2 className="text-[18px] font-black mb-1" style={{ color: T.text }}>{headline.title}</h2>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: T.muted }}>{headline.sub}</p>
          <span className="inline-block text-[10px] font-black tracking-wider px-3 py-1 rounded-full text-white" style={{ background: ok ? T.blue : status === "suggested" || status === "declined" ? "#EAB308" : T.green }}>{headline.badge}</span>
          <p className="text-[11px] font-bold mt-3" style={{ color: T.blue }}>Request ID: {REQUEST.id}</p>
        </div>

        {["quote", "accepted", "booked"].includes(status) && (
          <div className="rounded-2xl px-4 py-4" style={card}>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: T.blue }}>
              {status === "suggested" ? "KADAGO RECOMMENDATION" : "ASSIGNED TRUCK & OPERATOR"}
            </p>
            <Row k="Operator" v={m.business} />
            <Row k="Driver" v={m.driver} />
            <Row k="Truck" v={status === "suggested" ? m.truck : m.truckShort} />
            <Row k="Verified Payload" v={fmtKg(m.payloadKg)} />
            {status === "suggested" && (
              <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${T.border}` }}>
                {["Capacity suitable", "Cargo type suitable", "Route covered", "Operator available", "Schedule available"].map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>{r}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 px-3 py-2 rounded-xl text-[11px] font-bold text-center" style={{ background: status === "suggested" ? "rgba(234,179,8,0.12)" : "rgba(29,85,214,0.08)", color: status === "suggested" ? "#A16207" : T.blue }}>
              {status === "suggested" ? "Pending Admin Approval" : status === "approved" ? "Waiting for Operator Confirmation" : status === "confirmed" ? "Operator Confirmed" : STATUS_LABEL[status]}
            </div>
          </div>
        )}

        {(status === "quote" || status === "accepted" || status === "booked") && onViewQuotation && (
          <button onClick={onViewQuotation} className="w-full py-3.5 rounded-2xl text-[13px] font-black text-white active:opacity-80" style={{ background: T.blue }}>{status === "booked" ? "View Booking Agreement" : status === "accepted" ? "Continue to Booking Agreement" : "View Quotation"}</button>
        )}

        <div className="rounded-2xl px-4 py-4" style={card}>
          <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: T.blue }}>REQUEST PROGRESS</p>
          <RequestStepper status={status} />
        </div>

        <div className="rounded-2xl px-4 py-3" style={card}>
          <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: T.blue }}>REQUEST SUMMARY</p>
          <Row k="Cargo" v={REQUEST.cargo} />
          <Row k="Category" v={REQUEST.category} />
          <Row k="Route" v={REQUEST.route} />
          <Row k="Preferred Pickup" v={REQUEST.date} />
          <p className="text-[10px] leading-relaxed pt-1" style={{ color: T.mutedFg }}>KadaGo suggests and coordinates the truck. You do not need to select a driver.</p>
        </div>

        {(status === "review" || status === "suggested" || status === "approved") && <div className="rounded-2xl px-4 py-3" style={{ background: "#F1F5FF", border: "1px solid rgba(29,85,214,0.2)" }}><p className="text-[11px] leading-relaxed" style={{ color: T.muted }}>{status === "review" ? "KadaGo is reviewing your request. We will update this page when a verified truck is assigned." : status === "suggested" ? "KadaGo has found a suitable truck. Dispatch is reviewing the assignment." : "The assigned operator is reviewing the request."}</p></div>}
      </div>

      {onDone && (
        <div className="flex-shrink-0 px-4 py-3" style={{ background: "#fff", borderTop: `1px solid ${T.border}` }}>
          <button onClick={onDone} className="w-full py-3 rounded-xl text-[13px] font-bold text-white active:opacity-80" style={{ background: T.blue }}>{doneLabel}</button>
        </div>
      )}
    </div>
  );
}
