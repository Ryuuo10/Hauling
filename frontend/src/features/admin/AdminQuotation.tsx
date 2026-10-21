import { useBookingData } from "@/features/customer/BookingContext";
import { useState } from "react";
import { A, BackHeader } from "@/features/admin/AdminPortal";
import { Card, Label, Row, Pill, Primary, Secondary } from "@/features/admin/AdminDispatch";
import { MATCHES, REQ, QUOTE, PROPOSED_RATE, peso, quoteRate } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";

type Patch = (p: Partial<Dispatch>) => void | Promise<boolean>;
const ink = "#0D1828";

function Dashed({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl px-4 py-3" style={{ border: "1.5px dashed rgba(29,85,214,0.4)", background: "#F8FAFF" }}>{children}</div>;
}
const digits = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

// ── Rate Coordination ──────────────────────────────────────────────────────────
export function RateScreen({ dispatch, onBack, onDispatch, onPrepare }: { dispatch: Dispatch; onBack: () => void; onDispatch: Patch; onPrepare: () => void }) {
  const { REQ, QUOTE, PROPOSED_RATE } = useBookingData();
  const { m } = useBookingData();
  const stage = dispatch.rateStage;
  const proposing = stage === "pending" || (stage === "confirmed" && PROPOSED_RATE <= 0);
  const [setting, setSetting] = useState(false);
  const [val, setVal] = useState(String(dispatch.requestedRate ?? PROPOSED_RATE));
  const [note, setNote] = useState("");
  const finalNum = digits(val);
  const changed = finalNum !== PROPOSED_RATE;
  const canSet = finalNum > 0 && (!changed || note.trim().length > 0);
  const quoteOut = dispatch.status === "quote" || dispatch.status === "accepted";
  const declined = dispatch.status === "declined";
  const finalize = (rate: number) => onDispatch({ rateStage: "finalized", finalRate: rate, status: "confirmed" });
  const response =
    stage === "pending" ? "Waiting for operator" : stage === "confirmed" ? "Confirmed"
    : stage === "review" ? `Rate Review Requested: ${peso(dispatch.requestedRate ?? 0)}` : "Finalized";

  const SetForm = (
    <Card>
      <Label>{proposing ? "PROPOSE HAULING RATE" : "SET FINAL RATE"}</Label>
      <p className="text-[10px] font-bold mb-1" style={{ color: A.mutedFg }}>Final Hauling Rate</p>
      <input value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="w-full px-3 py-2.5 rounded-xl text-[14px] font-black outline-none mb-2" style={{ background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: ink }} />
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={changed ? "Short note (required when changing the rate)" : "Short note (optional)"} className="w-full px-3 py-2.5 rounded-xl text-[12px] resize-none outline-none mb-3" style={{ background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: ink }} />
      <Primary disabled={!canSet} onClick={async () => { const saved = proposing ? await onDispatch({ proposedRate: finalNum }) : await finalize(finalNum); if (saved !== false) setSetting(false); }}>{proposing ? "Send Proposed Rate" : "Set Final Rate"}</Primary>
    </Card>
  );

  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Rate Coordination" subtitle={REQ.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {declined && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <p className="text-[10px] font-black" style={{ color: A.red }}>CUSTOMER DECLINED QUOTATION</p>
            <p className="text-[11px]" style={{ color: ink }}>{QUOTE.id} · Reason: {dispatch.quoteDecline}</p>
          </div>
        )}
        <p className="text-[9.5px] font-bold text-center leading-snug px-2" style={{ color: A.mutedFg }}>
          Operator Confirms → Rate Coordination → Admin Finalizes Rate → Admin Sends Quotation → Customer Accepts / Declines
        </p>
        <Card>
          <Row k="Request" v={REQ.id} strong />
          <Row k="Operator" v={m.business} />
          <Row k="Truck" v={m.truckShort} />
          <Row k="Customer Budget (reference)" v={REQ.budget} />
          <Row k="KadaGo Proposed Rate" v={peso(PROPOSED_RATE)} strong />
          <Row k="Operator Response" v={response} />
        </Card>

        {proposing && <>{SetForm}<p className="text-center text-[11px] px-6" style={{ color: A.mutedFg }}>{PROPOSED_RATE > 0 ? "Waiting for the operator to confirm this proposed rate or request a review." : "Enter a proposed rate for the operator to review."}</p></>}

        {stage === "confirmed" && !proposing && <Primary disabled={PROPOSED_RATE <= 0} onClick={() => finalize(PROPOSED_RATE)}>Finalize Rate</Primary>}

        {stage === "review" && (
          <>
            <Card highlight>
              <div className="flex justify-between"><div><Label>CURRENT PROPOSED RATE</Label><p className="text-[18px] font-black" style={{ color: ink }}>{peso(PROPOSED_RATE)}</p></div>
                <div className="text-right"><Label color={A.orange}>OPERATOR REQUEST</Label><p className="text-[18px] font-black" style={{ color: A.orange }}>{peso(dispatch.requestedRate ?? 0)}</p></div></div>
              <Row k="Reason" v={dispatch.rateReason ?? "—"} />
              {dispatch.rateNote && <Row k="Notes" v={dispatch.rateNote} />}
            </Card>
            {!setting && (
              <div className="space-y-2">
                <Primary onClick={() => finalize(dispatch.requestedRate ?? PROPOSED_RATE)}>Approve Requested Rate</Primary>
                <Secondary onClick={() => finalize(PROPOSED_RATE)}>Keep Current Rate</Secondary>
                <Secondary onClick={() => setSetting(true)}>Set Final Rate</Secondary>
              </div>
            )}
            {setting && SetForm}
          </>
        )}

        {stage === "finalized" && (
          <>
            <Card highlight>
              <Label color={A.blue}>FINAL HAULING RATE</Label>
              <p className="text-[24px] font-black mb-1" style={{ color: ink }}>{peso(quoteRate(dispatch))}</p>
              <Pill text="FINALIZED" bg="rgba(22,163,74,0.1)" fg="#15803d" />
            </Card>
            {setting && SetForm}
            <div className="space-y-2">
              {quoteOut
                ? <Primary disabled>Quotation Sent</Primary>
                : <Primary onClick={onPrepare}>Prepare Quotation</Primary>}
              {declined && !setting && <Secondary onClick={() => setSetting(true)}>Revise Final Rate</Secondary>}
              <Secondary onClick={onBack}>Back</Secondary>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Quotation details (Admin) ──────────────────────────────────────────────────
function QuoteDetails({ dispatch, editable, onDeposit }: { dispatch: Dispatch; editable?: boolean; onDeposit?: (n: number) => void }) {
  const { REQ, QUOTE } = useBookingData();
  const { m } = useBookingData();
  const total = quoteRate(dispatch);
  return (
    <>
      <Card>
        <Label>QUOTATION</Label>
        <Row k="Quotation ID" v={QUOTE.id} strong />
        <Row k="Request" v={REQ.id} />
        <Row k="Customer" v={REQ.customer} />
        <Row k="Operator" v={m.business} />
        <Row k="Driver" v={m.driver} />
        <Row k="Truck" v={m.truck} />
        <Row k="Cargo" v={REQ.cargoShort} />
        <Row k="Weight" v={REQ.weight} />
        <Row k="Pickup" v={REQ.pickup} />
        <Row k="Destination" v={REQ.dest} />
        <Row k="Pickup Schedule" v={QUOTE.pickupSchedule} />
        <Row k="Estimated Delivery" v={QUOTE.delivery} />
      </Card>
      <Card highlight>
        <Label color={A.blue}>TOTAL HAULING RATE</Label>
        <p className="text-[24px] font-black mb-2" style={{ color: ink }}>{peso(total)}</p>
        <Label color="#15803d">INCLUDED</Label>
        <div className="grid grid-cols-2 gap-1 mb-2.5">
          {QUOTE.included.map((i) => <p key={i} className="text-[11px] font-semibold" style={{ color: "#15803d" }}>✓ {i}</p>)}
        </div>
        <Label color={A.orange}>CHARGED SEPARATELY</Label>
        {QUOTE.separate.map((r) => <Row key={r.k} k={r.k} v={r.v} />)}
      </Card>
      <Card>
        <Label>PAYMENT TERMS</Label>
        {editable ? (
          <div className="flex justify-between items-center py-1">
            <span className="text-[11px]" style={{ color: A.mutedFg }}>Deposit</span>
            <input value={String(dispatch.requiredDeposit || 0)} onChange={(e) => onDeposit?.(Math.min(digits(e.target.value), total))} inputMode="numeric" className="w-28 px-2 py-1 rounded-lg text-[12px] font-black text-right outline-none" style={{ background: "#F8FAFF", border: "1px solid rgba(0,0,0,0.12)", color: ink }} />
          </div>
        ) : <Row k="Deposit" v={peso(dispatch.requiredDeposit || 0)} />}
        <Row k="Remaining Balance" v={peso(total - (dispatch.requiredDeposit || 0))} />
        <Row k="Balance Due" v="Upon Confirmed Delivery" />
        <p className="text-[10px] mt-1" style={{ color: A.muted }}>Payment record for the prototype only. No real payment is processed.</p>
      </Card>
      <Card>
        <Label>QUOTATION VALIDITY</Label>
        <Row k="Valid Until" v={QUOTE.validUntil} strong />
        <p className="text-[10px]" style={{ color: A.muted }}>The customer must accept before the quotation expires.</p>
      </Card>
    </>
  );
}

export function PrepareQuoteScreen({ dispatch, onBack, onDispatch, onNext }: { dispatch: Dispatch; onBack: () => void; onDispatch: Patch; onNext: () => void }) {
  const { QUOTE } = useBookingData();
  const [deposit, setDeposit] = useState(dispatch.requiredDeposit || 0);
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Prepare Quotation" subtitle={QUOTE.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        <QuoteDetails dispatch={{ ...dispatch, requiredDeposit: deposit }} editable onDeposit={setDeposit} />
        <Primary onClick={async () => { if (await onDispatch({ requiredDeposit: deposit }) !== false) onNext(); }}>Review Quotation</Primary>
      </div>
    </div>
  );
}

export function ReviewQuoteScreen({ dispatch, onBack, onEdit, onSend }: { dispatch: Dispatch; onBack: () => void; onEdit: () => void; onSend: () => void }) {
  const { QUOTE } = useBookingData();
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Review Quotation" subtitle={QUOTE.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        <QuoteDetails dispatch={dispatch} />
        <div className="space-y-2">
          <Primary onClick={onSend}>Send Quotation</Primary>
          <Secondary onClick={onEdit}>Edit Quotation</Secondary>
        </div>
      </div>
    </div>
  );
}

export function QuoteSentScreen({ dispatch, onView, onBack }: { dispatch: Dispatch; onView: () => void; onBack: () => void }) {
  const { REQ, QUOTE } = useBookingData();
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Quotation Sent" subtitle={QUOTE.id} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white" style={{ background: A.green, animation: "successBounce 0.6s ease-out" }}>✓</div>
        <h2 className="text-[19px] font-black mb-5" style={{ color: ink }}>Quotation Sent</h2>
        <div className="text-left"><Card>
          <Row k="Quotation" v={QUOTE.id} strong />
          <Row k="Customer" v={REQ.customer} />
          <Row k="Amount" v={peso(quoteRate(dispatch))} strong />
          <div className="flex justify-between items-center pt-1.5">
            <span className="text-[11px]" style={{ color: A.mutedFg }}>Status</span>
            <Pill text="Waiting for Customer Decision" bg="rgba(244,123,32,0.12)" fg="#c2410c" />
          </div>
        </Card></div>
      </div>
      <div className="px-4 pb-4"><Primary onClick={onView}>View Booking</Primary></div>
    </div>
  );
}
