import { useBookingData } from "@/features/customer/BookingContext";
import { useState } from "react";
import { AgreementScreen, AgreementsList, StatusPill } from "@/features/hauling/AgreementView";
import { MATCHES, REQ, QUOTE, QUOTE_DECLINE_REASONS, peso, quoteRate } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";

const C = { bg: "#F8FAFF", card: "#FFFFFF", blue: "#1D55D6", green: "#16A34A", red: "#DC2626", orange: "#F47B20", border: "rgba(0,0,0,0.08)", muted: "#64748b", ink: "#0D1828" };
const m = MATCHES[0];

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[11px]" style={{ color: C.muted }}>{k}</span>
      <span className={`text-[11px] text-right ${strong ? "font-black" : "font-semibold"}`} style={{ color: C.ink }}>{v}</span>
    </div>
  );
}
function Card({ children, tint }: { children: React.ReactNode; tint?: boolean }) {
  return <div className="rounded-2xl px-4 py-3" style={{ background: tint ? "#F1F5FF" : C.card, border: `1px solid ${tint ? "rgba(29,85,214,0.3)" : C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>{children}</div>;
}
function Label({ children, color = C.muted }: { children: React.ReactNode; color?: string }) {
  return <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color }}>{children}</p>;
}
function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color: fg }}>{text}</span>;
}
function Btn({ children, onClick, disabled, color = C.blue }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; color?: string }) {
  return <button onClick={onClick} disabled={disabled} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white active:opacity-80" style={{ background: disabled ? "#CBD5E1" : color }}>{children}</button>;
}
function Ghost({ children, onClick, color = C.blue }: { children: React.ReactNode; onClick: () => void; color?: string }) {
  return <button onClick={onClick} className="w-full py-3 rounded-xl text-[12px] font-bold active:opacity-70" style={{ background: "#fff", color, border: `1.5px solid ${color}` }}>{children}</button>;
}
function Header({ title, sub, onBack }: { title: string; sub?: string; onBack: () => void }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3" style={{ background: "#fff", borderBottom: `1px solid ${C.border}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${C.border}` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div><h1 className="text-[14px] font-black" style={{ color: C.ink }}>{title}</h1>{sub && <p className="text-[10px]" style={{ color: C.muted }}>{sub}</p>}</div>
    </div>
  );
}

export const quoteAvailable = (d: Dispatch) => d.status === "quote" || d.status === "accepted" || d.status === "declined" || d.status === "booked";

// ── Quotation tab ──────────────────────────────────────────────────────────────
export function QuotationTab({ dispatch, onOpen, onAgreements }: { dispatch: Dispatch; onOpen: () => void; onAgreements: () => void }) {
  const { m, QUOTE } = useBookingData();
  const st = dispatch.status;
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-2"><h2 className="text-[18px] font-black" style={{ color: C.ink }}>Quotations</h2></div>
      {!quoteAvailable(dispatch) ? (
        <div className="mx-3 mt-2 rounded-2xl px-6 py-10 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: "rgba(29,85,214,0.08)" }}>🧾</div>
          <p className="text-[14px] font-bold mb-1" style={{ color: C.ink }}>No quotations yet.</p>
          <p className="text-[11px] leading-relaxed" style={{ color: C.muted }}>Your quotation will appear here after KadaGo confirms the truck and operator assignment and the hauling rate. You can only accept or decline it.</p>
        </div>
      ) : (
        <div className="mx-3 mt-2 rounded-2xl overflow-hidden" style={{ background: C.card, border: `1.5px solid ${C.blue}`, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <div className="px-4 pt-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black tracking-wider" style={{ color: C.blue }}>{st === "quote" ? "QUOTATION READY" : st === "accepted" || st === "booked" ? "QUOTATION ACCEPTED" : "QUOTATION DECLINED"}</span>
              <Pill text={st === "quote" ? "Awaiting Your Approval" : st === "accepted" || st === "booked" ? "Accepted" : "Declined"} bg={st === "quote" ? "rgba(244,123,32,0.12)" : st !== "declined" ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)"} fg={st === "quote" ? "#c2410c" : st !== "declined" ? "#15803d" : C.red} />
            </div>
            <p className="text-[13px] font-black" style={{ color: C.ink }}>{QUOTE.id}</p>
            <p className="text-[11px] mb-1.5" style={{ color: C.muted }}>KadaGo Hauling Quotation</p>
            <Row k="Operator" v={m.business} />
            <Row k="Truck" v={m.truckShort} />
            <Row k="Hauling Rate" v={peso(quoteRate(dispatch))} strong />
            <Row k="Pickup" v={QUOTE.pickupSchedule} />
          </div>
          <div className="px-4 pb-3"><Btn onClick={onOpen}>View Quotation</Btn></div>
        </div>
      )}
      {(st === "accepted" || st === "booked") && (
        <div className="mx-3 mt-3 rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-2"><span className="text-[12px] font-black" style={{ color: C.ink }}>Booking Agreements</span><StatusPill d={dispatch} /></div>
          <Ghost onClick={onAgreements}>Open Booking Agreements</Ghost>
        </div>
      )}
    </div>
  );
}

// ── Quotation detail + decision flow ───────────────────────────────────────────
type View = "detail" | "decline" | "accepted" | "agreement" | "agreements";

export function QuotationFlow({ dispatch, onDispatch, onBack, initial = "detail" }: { dispatch: Dispatch; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; onBack: () => void; initial?: "detail" | "agreements" }) {
  const { m, REQ, QUOTE } = useBookingData();
  const [view, setView] = useState<View>(initial);
  const [modal, setModal] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const total = quoteRate(dispatch);
  const st = dispatch.status;

  if (view === "agreement") return <AgreementScreen role="customer" dispatch={dispatch} onDispatch={onDispatch} onBack={() => (initial === "agreements" ? setView("agreements") : setView("detail"))} />;
  if (view === "agreements") return <AgreementsList role="customer" dispatch={dispatch} onOpen={() => setView("agreement")} onBack={onBack} />;

  if (view === "accepted") {
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <div className="flex-1 overflow-y-auto px-4 pt-12 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white" style={{ background: C.green, animation: "successBounce 0.6s ease-out" }}>✓</div>
          <h2 className="text-[20px] font-black mb-5" style={{ color: "#15803d" }}>Quotation Accepted!</h2>
          <div className="text-left"><Card>
            <Row k="Quotation" v={QUOTE.id} strong />
            <Row k="Hauling Rate" v={peso(total)} strong />
            <div className="flex justify-between items-center py-1"><span className="text-[11px]" style={{ color: C.muted }}>Status</span><Pill text="Accepted" bg="rgba(22,163,74,0.1)" fg="#15803d" /></div>
            <Row k="Next Step" v="Booking Agreement" />
          </Card></div>
        </div>
        <div className="px-4 pb-4"><Btn color={C.green} onClick={() => setView("agreement")}>Continue to Booking Agreement</Btn></div>
      </div>
    );
  }

  if (view === "decline") {
    return (
      <div className="h-full flex flex-col" style={{ background: C.bg }}>
        <Header title="Decline Quotation" sub={QUOTE.id} onBack={() => setView("detail")} />
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
          <Card>
            <Label>REASON (OPTIONAL)</Label>
            <div className="flex flex-wrap gap-1.5">
              {QUOTE_DECLINE_REASONS.map((r) => (
                <button key={r} onClick={() => setReason(reason === r ? null : r)} className="px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: reason === r ? C.blue : "rgba(0,0,0,0.04)", color: reason === r ? "#fff" : C.ink, border: `1px solid ${reason === r ? C.blue : C.border}` }}>{r}</button>
              ))}
            </div>
          </Card>
          <Btn color={C.red} onClick={async () => { if (await onDispatch({ status: "declined", quoteDecline: reason ?? "Not specified" }) !== false) setView("detail"); }}>Decline Quotation</Btn>
        </div>
      </div>
    );
  }

  const decided = st === "accepted" || st === "declined" || st === "booked";
  return (
    <div className="h-full flex flex-col relative" style={{ background: C.bg }}>
      <Header title="Hauling Quotation" sub={QUOTE.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {st === "declined" && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <p className="text-[11px] font-black" style={{ color: C.red }}>Quotation Declined</p>
            <p className="text-[11px]" style={{ color: C.ink }}>KadaGo Dispatch will review the request and determine the next step.</p>
          </div>
        )}
        {(st === "accepted" || st === "booked") && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)" }}>
            <p className="text-[11px] font-bold" style={{ color: "#15803d" }}>{st === "booked" ? "Quotation Accepted. Booking Agreement confirmed by both parties." : dispatch.agreement === "operator" ? "Quotation Accepted. You confirmed the Booking Agreement. Waiting for the Truck Operator." : "Quotation Accepted. Review and confirm your Booking Agreement."}</p>
          </div>
        )}
        <Card>
          <Row k="Quotation ID" v={QUOTE.id} strong />
          <Row k="Request" v={REQ.id} />
        </Card>
        <Card>
          <Label>ASSIGNED OPERATOR</Label>
          <Row k="Operator" v={m.business} strong />
          <Row k="Driver" v={m.driver} />
          <div className="pt-1"><Pill text="✓ VERIFIED OPERATOR" bg="rgba(22,163,74,0.1)" fg="#15803d" /></div>
        </Card>
        <Card>
          <Label>ASSIGNED TRUCK</Label>
          <Row k="Truck" v={m.truck} strong />
          <Row k="Plate" v={m.plate} />
          <Row k="Verified Payload" v={`${m.payloadKg.toLocaleString()} kg`} />
        </Card>
        <Card>
          <Label>HAULING DETAILS</Label>
          <Row k="Cargo" v={REQ.cargo} />
          <Row k="Weight" v={REQ.weight} />
          <Row k="Pickup" v={REQ.pickup} />
          <Row k="Destination" v={REQ.dest} />
          <Row k="Pickup Schedule" v={QUOTE.pickupSchedule} />
          <Row k="Expected Delivery" v={QUOTE.delivery} />
        </Card>
        <Card tint>
          <Label color={C.blue}>TOTAL HAULING RATE</Label>
          <p className="text-[28px] font-black mb-2" style={{ color: C.ink }}>{peso(total)}</p>
          <Label color="#15803d">INCLUDED</Label>
          <div className="grid grid-cols-2 gap-1 mb-3">{QUOTE.included.map((i) => <p key={i} className="text-[11px] font-semibold" style={{ color: "#15803d" }}>✓ {i}</p>)}</div>
          <Label color={C.orange}>SEPARATE CHARGES</Label>
          {QUOTE.separate.map((r) => <Row key={r.k} k={r.k} v={r.v} />)}
        </Card>
        <Card>
          <Label>PAYMENT TERMS</Label>
          <Row k="Deposit" v={peso(dispatch.requiredDeposit || 0)} />
          <Row k="Remaining Balance" v={peso(total - (dispatch.requiredDeposit || 0))} />
          <Row k="Balance Due" v="Upon Confirmed Delivery" />
        </Card>
        <Card>
          <Row k="Valid Until" v={QUOTE.validUntil} strong />
          <p className="text-[10px]" style={{ color: C.muted }}>The customer must accept before the quotation expires.</p>
        </Card>
        {!decided && (
          <div className="space-y-2 pt-1">
            <Btn onClick={() => setModal(true)}>Accept Quotation</Btn>
            <Ghost color={C.red} onClick={() => setView("decline")}>Decline Quotation</Ghost>
          </div>
        )}
        {(st === "accepted" || st === "booked") && <Btn onClick={() => setView("agreement")}>{st === "booked" || dispatch.agreement === "operator" ? "View Booking Agreement" : "Continue to Booking Agreement"}</Btn>}
      </div>
      {modal && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
          <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
            <h3 className="text-[16px] font-black mb-2" style={{ color: C.ink }}>Accept this quotation?</h3>
            <Row k="Assigned Operator" v={m.business} />
            <Row k="Truck" v={m.truckShort} />
            <Row k="Total" v={peso(total)} strong />
            <Row k="Pickup" v={QUOTE.pickupSchedule} />
            <p className="text-[12px] my-3" style={{ color: C.muted }}>After acceptance, KadaGo will prepare the Booking Agreement.</p>
            <div className="space-y-2">
              <Btn onClick={async () => { if (await onDispatch({ status: "accepted" }) !== false) { setModal(false); setView("accepted"); } }}>Accept Quotation</Btn>
              <Ghost onClick={() => setModal(false)}>Cancel</Ghost>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
