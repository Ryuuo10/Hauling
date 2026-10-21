import { useBookings, useBookingData } from "@/features/customer/BookingContext";
import { useState } from "react";
import { MATCHES, REQ, QUOTE, AGREEMENT, AGREEMENT_STATUS, agreementStage, peso, quoteRate, isCompleted } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";

export type Role = "customer" | "operator" | "admin";
const BLUE = "#1D55D6", ORANGE = "#F47B20", GREEN = "#16A34A", RED = "#DC2626", INK = "#0D1828", MUTED = "#64748b", BORDER = "rgba(0,0,0,0.08)";
const roleColor = (r: Role) => (r === "operator" ? ORANGE : BLUE);

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[11px] flex-shrink-0" style={{ color: MUTED }}>{k}</span>
      <span className={`text-[11px] text-right ${strong ? "font-black" : "font-semibold"}`} style={{ color: INK }}>{v}</span>
    </div>
  );
}
function Sec({ title, children, tint, accent }: { title: string; children: React.ReactNode; tint?: string; accent?: string }) {
  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: tint ?? "#fff", border: `1px solid ${accent ?? BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color: accent ? "#334155" : MUTED }}>{title.toUpperCase()}</p>
      {children}
    </div>
  );
}
function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color: fg }}>{text}</span>;
}
function Bullets({ items }: { items: string[] }) {
  return <div className="space-y-1">{items.map((i) => <p key={i} className="text-[11px] leading-snug" style={{ color: "#374151" }}>• {i}</p>)}</div>;
}
function Btn({ children, onClick, disabled, color }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; color: string }) {
  return <button onClick={onClick} disabled={disabled} className="w-full py-3.5 rounded-xl text-[13px] font-black text-white active:opacity-80" style={{ background: disabled ? "#CBD5E1" : color }}>{children}</button>;
}
function Ghost({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  return <button onClick={onClick} className="w-full py-3 rounded-xl text-[12px] font-bold active:opacity-70" style={{ background: "#fff", color, border: `1.5px solid ${color}` }}>{children}</button>;
}
function Header({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3" style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${BORDER}` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div><h1 className="text-[14px] font-black" style={{ color: INK }}>{title}</h1><p className="text-[10px]" style={{ color: MUTED }}>{sub}</p></div>
    </div>
  );
}
function Banner({ tone, children }: { tone: "green" | "orange" | "red"; children: React.ReactNode }) {
  const c = tone === "green" ? ["rgba(22,163,74,0.08)", "rgba(22,163,74,0.25)", "#15803d"] : tone === "red" ? ["rgba(220,38,38,0.07)", "rgba(220,38,38,0.25)", RED] : ["rgba(244,123,32,0.08)", "rgba(244,123,32,0.3)", "#c2410c"];
  return <div className="rounded-xl px-3 py-2.5" style={{ background: c[0], border: `1px solid ${c[1]}` }}><p className="text-[11px] font-bold" style={{ color: c[2] }}>{children}</p></div>;
}

export function StatusPill({ d }: { d: Dispatch }) {
  const st = agreementStage(d);
  return st === "confirmed" ? <Pill text="CONFIRMED" bg="rgba(22,163,74,0.12)" fg="#15803d" /> : <Pill text={AGREEMENT_STATUS[st].toUpperCase()} bg="rgba(244,123,32,0.12)" fg="#c2410c" />;
}

function AcceptanceRecord({ d }: { d: Dispatch }) {
  const { REQ, m, AGREEMENT } = useBookingData();
  const st = agreementStage(d);
  const cOk = st !== "customer";
  const oOk = st === "confirmed";
  return (
    <Sec title="Digital Acceptance Record">
      <div className="flex justify-between items-start py-1">
        <div><p className="text-[11px] font-bold" style={{ color: INK }}>Customer: {REQ.rep}</p><p className="text-[10px]" style={{ color: MUTED }}>Confirmed: {cOk ? AGREEMENT.customerAt : "Pending"}</p></div>
        <Pill text={cOk ? "CONFIRMED" : "PENDING"} bg={cOk ? "rgba(22,163,74,0.12)" : "rgba(0,0,0,0.05)"} fg={cOk ? "#15803d" : MUTED} />
      </div>
      <div className="flex justify-between items-start py-1">
        <div><p className="text-[11px] font-bold" style={{ color: INK }}>Operator: {m.driver}</p><p className="text-[10px]" style={{ color: MUTED }}>Confirmed: {oOk ? AGREEMENT.operatorAt : "Pending"}</p></div>
        <Pill text={oOk ? "CONFIRMED" : "PENDING"} bg={oOk ? "rgba(22,163,74,0.12)" : "rgba(0,0,0,0.05)"} fg={oOk ? "#15803d" : MUTED} />
      </div>
      <p className="text-[9.5px] mt-1" style={{ color: MUTED }}>Prototype confirmation record only. Not a certified e-signature.</p>
    </Sec>
  );
}

function Document({ d }: { d: Dispatch }) {
  const { selected } = useBookings();
  const { m, REQ, QUOTE } = useBookingData();
  const total = quoteRate(d);
  return (
    <>
      <Sec title="Business Customer">
        <Row k="Business" v={REQ.customer} strong />
        <Row k="Representative" v={REQ.rep} />
        <Row k="Contact" v={selected?.request.pickup.phone || "Not provided"} />
        <Row k="Pickup Address" v={REQ.pickup} />
        <div className="pt-1"><Pill text="✓ VERIFIED BUSINESS CUSTOMER" bg="rgba(22,163,74,0.1)" fg="#15803d" /></div>
      </Sec>
      <Sec title="Truck Operator / Trucking Business">
        <Row k="Business" v={m.business} strong />
        <Row k="Operator" v={m.driver} />
        <Row k="Status" v="Verified Operator" />
        <Row k="Rating" v={m.rating} />
        <div className="flex flex-wrap gap-1 pt-1">{["Operator Verified", "Driver Verified", "Truck Verified"].map((b) => <Pill key={b} text={`✓ ${b}`} bg="rgba(22,163,74,0.1)" fg="#15803d" />)}</div>
      </Sec>
      <Sec title="Assigned Truck">
        <Row k="Truck" v={m.truck} strong />
        <Row k="Plate" v={m.plate} />
        <Row k="Verified Payload" v={`${m.payloadKg.toLocaleString()} kg`} />
        <Row k="Cargo Weight" v={REQ.weight} />
        <Row k="Capacity" v="Suitable" />
      </Sec>
      <Sec title="Cargo Information">
        <Row k="Category" v={REQ.category} />
        <Row k="Description" v={REQ.cargo} />
        <Row k="Quantity" v={REQ.quantity} />
        <Row k="Weight" v={REQ.weight} />
        <Row k="Special Requirement" v={REQ.requirements} />
      </Sec>
      <Sec title="Pickup">
        <Row k="Location" v={REQ.pickup} />
        <Row k="Pickup Contact" v={selected?.request.pickup.contact || REQ.rep} />
        <Row k="Schedule" v={REQ.schedule} />
        <Row k="Instructions" v={selected?.request.pickup.instructions || "None specified"} />
      </Sec>
      <Sec title="Delivery">
        <Row k="Destination" v={REQ.dest} />
        <Row k="Receiver" v={selected?.request.delivery.contact || "Not specified"} />
        <Row k="Expected Delivery" v={QUOTE.delivery} />
        <Row k="Instructions" v={selected?.request.delivery.instructions || "None specified"} />
      </Sec>
      <Sec title="Agreed Hauling Rate" tint="#F1F5FF" accent="rgba(29,85,214,0.3)">
        <p className="text-[9px] font-black tracking-wider" style={{ color: BLUE }}>FINAL AGREED HAULING RATE</p>
        <p className="text-[28px] font-black leading-tight" style={{ color: INK }}>{peso(total)}</p>
        <p className="text-[10.5px]" style={{ color: MUTED }}>This rate is based on the quotation accepted by the customer.</p>
      </Sec>
      <Sec title="Payment Terms">
        <Row k="Deposit" v={peso(d.requiredDeposit || 0)} />
        <Row k="Remaining Balance" v={peso(total - (d.requiredDeposit || 0))} />
        <Row k="Balance Due" v="Upon confirmed delivery" />
        <p className="text-[10px] mt-1" style={{ color: MUTED }}>{`Requested deposit ${peso(d.requiredDeposit || 0)} + balance ${peso(total - (d.requiredDeposit || 0))} = ${peso(total)}. Payments are recorded in KadaGo; KadaGo does not hold or transfer money.`}</p>
        <Row k="Payment Method" v="To be recorded later" />
      </Sec>
      <Sec title="Included in the Hauling Rate">
        <div className="grid grid-cols-2 gap-1">{QUOTE.included.map((i) => <p key={i} className="text-[11px] font-semibold" style={{ color: "#15803d" }}>✓ {i}</p>)}</div>
      </Sec>
      <Sec title="Possible Additional Charges" tint="#FFF9F3" accent="rgba(244,123,32,0.3)">
        <p className="text-[10px] mb-1" style={{ color: MUTED }}>Not part of the agreed hauling rate.</p>
        {QUOTE.separate.map((r) => <Row key={r.k} k={r.k} v={r.v} />)}
      </Sec>
      <Sec title="Loading Responsibility">
        <p className="text-[10px] font-black" style={{ color: BLUE }}>Customer</p>
        <Bullets items={["Prepare cargo for loading"]} />
        <p className="text-[10px] font-black mt-2" style={{ color: ORANGE }}>Operator</p>
        <Bullets items={["Position truck safely", "Secure cargo", "Install tarp / tie-downs if required"]} />
      </Sec>
      <Sec title="Unloading Responsibility">
        <p className="text-[10px] font-black" style={{ color: BLUE }}>Receiver</p>
        <Bullets items={["Provide unloading personnel"]} />
        <p className="text-[10px] font-black mt-2" style={{ color: ORANGE }}>Operator</p>
        <Bullets items={["Position truck safely", "Hand over secured cargo when unloading begins"]} />
      </Sec>
      <Sec title="Schedule & Delay Guidelines">
        <Bullets items={["Both parties should report schedule changes.", "Operator should report delays.", "Customer should report loading or receiving delays.", "Waiting charges follow the approved quotation.", "Major schedule changes may require confirmation."]} />
      </Sec>
      <Sec title="Cancellation">
        <Bullets items={["Customer cancellation before dispatch", "Customer cancellation after dispatch", "Operator cancellation", "Schedule change", "Any applicable charge follows the approved booking terms"]} />
      </Sec>
      <Sec title="Cargo Issues">
        <p className="text-[10.5px] mb-1" style={{ color: MUTED }}>If cargo is missing or damaged:</p>
        <div className="space-y-1">{["Report the issue in KadaGo", "Upload photos or evidence", "Review pickup and delivery records", "Admin / Dispatch reviews the case"].map((t, i) => <p key={t} className="text-[11px]" style={{ color: "#374151" }}>{i + 1}. {t}</p>)}</div>
      </Sec>
    </>
  );
}

type View = "doc" | "custdone" | "success" | "booking";

export function AgreementScreen({ role, dispatch, onDispatch, onBack, onStartTrip }: { role: Role; dispatch: Dispatch; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; onBack: () => void; onStartTrip?: () => void }) {
  const { m, REQ, QUOTE, AGREEMENT } = useBookingData();
  const [view, setView] = useState<View>("doc");
  const [modal, setModal] = useState(false);
  const [ack, setAck] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const st = agreementStage(dispatch);
  const color = roleColor(role);
  const canAct = (role === "customer" && st === "customer") || (role === "operator" && st === "operator");
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1800); };

  const confirm = async () => {
    const saved = await onDispatch(role === "customer" ? { agreement: "operator", agreementUpdate: false } : { status: "booked" });
    if (saved !== false) { setModal(false); setView(role === "customer" ? "custdone" : "success"); }
  };

  if (view === "custdone") {
    return (
      <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
        <div className="flex-1 overflow-y-auto px-4 pt-12 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white" style={{ background: GREEN }}>✓</div>
          <h2 className="text-[19px] font-black mb-4" style={{ color: INK }}>Agreement Confirmed</h2>
          <div className="text-left"><Sec title="Customer Status">
            <Row k="Customer Status" v="Confirmed" strong />
            <Row k="Customer Confirmed" v={AGREEMENT.customerAt} />
          </Sec></div>
          <p className="text-[12px] mt-4 font-semibold" style={{ color: "#c2410c" }}>Waiting for Truck Operator confirmation.</p>
        </div>
        <div className="px-4 pb-4 space-y-2"><Btn color={BLUE} onClick={() => setView("doc")}>View Agreement</Btn><Ghost color={BLUE} onClick={onBack}>Back to Quotations</Ghost></div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
        <div className="flex-1 overflow-y-auto px-4 pt-12 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white" style={{ background: GREEN, animation: "successBounce 0.6s ease-out" }}>✓</div>
          <h2 className="text-[20px] font-black mb-4" style={{ color: "#15803d" }}>Booking Confirmed!</h2>
          <div className="text-left"><Sec title="Booking">
            <Row k="Booking" v={AGREEMENT.booking} strong />
            <Row k="Agreement" v={AGREEMENT.id} />
            <Row k="Customer" v="Confirmed" />
            <Row k="Operator" v="Confirmed" />
            <div className="flex justify-between items-center pt-1"><span className="text-[11px]" style={{ color: MUTED }}>Status</span><Pill text="BOOKING CONFIRMED" bg="rgba(22,163,74,0.12)" fg="#15803d" /></div>
          </Sec></div>
          <p className="text-[12px] mt-4" style={{ color: MUTED }}>The hauling service is ready for the scheduled pickup.</p>
        </div>
        <div className="px-4 pb-4"><Btn color={GREEN} onClick={() => setView("booking")}>View Booking</Btn></div>
      </div>
    );
  }

  if (view === "booking") {
    return (
      <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
        <Header title="Booking" sub={AGREEMENT.booking} onBack={() => setView("doc")} />
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
          <Banner tone="green">Booking Confirmed. Next: Upcoming Pickup.</Banner>
          <Sec title="Upcoming Pickup">
            <Row k="Booking" v={AGREEMENT.booking} strong />
            <Row k="Agreement" v={AGREEMENT.id} />
            <Row k="Pickup" v={REQ.schedule} />
            <Row k="Route" v={REQ.route} />
            <Row k="Truck" v={m.truckShort} />
            <Row k="Hauling Rate" v={peso(quoteRate(dispatch))} strong />
          </Sec>
          {onStartTrip
            ? <Btn color={color} onClick={onStartTrip}>Go to Upcoming Pickup</Btn>
            : <p className="text-[10.5px] text-center px-4" style={{ color: MUTED }}>The operator will start the trip on the pickup date.</p>}
          <Ghost color={color} onClick={() => setView("doc")}>View Agreement</Ghost>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative" style={{ background: "#F8FAFF" }}>
      <Header title="Booking Agreement" sub="Review the confirmed hauling details before final booking." onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {dispatch.agreementUpdate && st !== "confirmed" && <Banner tone="red">Agreement Update Required. Major details changed, so the agreement must be reconfirmed.</Banner>}
        {dispatch.agreementIssue && <Banner tone="orange">Agreement issue reported. KadaGo Dispatch will review.</Banner>}
        {st === "confirmed" && <Banner tone="green">Booking Confirmed. Both parties confirmed this agreement.</Banner>}
        <Sec title="Agreement">
          <Row k="Agreement ID" v={AGREEMENT.id} strong />
          <Row k="Booking ID" v={AGREEMENT.booking} />
          <Row k="Request ID" v={REQ.id} />
          <Row k="Quotation ID" v={QUOTE.id} />
          <div className="flex justify-between items-center pt-1"><span className="text-[11px]" style={{ color: MUTED }}>Status</span><StatusPill d={dispatch} /></div>
        </Sec>
        {role === "admin" && (
          <Sec title="Confirmation Monitor">
            <Row k="Customer Confirmation" v={st === "customer" ? "Pending" : "Confirmed"} strong />
            <Row k="Operator Confirmation" v={st === "confirmed" ? "Confirmed" : "Pending"} strong />
          </Sec>
        )}
        <Document d={dispatch} />
        {(st !== "customer" || role === "admin") && <AcceptanceRecord d={dispatch} />}

        {canAct && (
          <>
            <button onClick={() => setAck(!ack)} className="w-full flex items-start gap-2.5 text-left rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1.5px solid ${ack ? color : BORDER}` }}>
              <span className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[12px] font-black text-white mt-0.5" style={{ background: ack ? color : "#fff", border: `1.5px solid ${ack ? color : "#CBD5E1"}` }}>{ack ? "✓" : ""}</span>
              <span className="text-[11px] leading-snug" style={{ color: "#374151" }}>I have reviewed the cargo, truck, schedule, hauling rate, payment terms, responsibilities, and conditions shown in this Booking Agreement.</span>
            </button>
            <div className="space-y-2">
              <Btn color={color} disabled={!ack} onClick={() => setModal(true)}>{role === "customer" ? "Confirm Booking Agreement" : "Confirm Agreement"}</Btn>
              {role === "operator" && <Ghost color={color} onClick={async () => { if (await onDispatch({ agreementIssue: true }) !== false) flash("Issue reported to KadaGo Dispatch"); }}>Report Agreement Issue</Ghost>}
            </div>
          </>
        )}
        {!canAct && st === "customer" && role === "operator" && <p className="text-center text-[11px] font-semibold" style={{ color: "#c2410c" }}>Waiting for the customer to confirm the agreement.</p>}
        {!canAct && st === "operator" && role === "customer" && <p className="text-center text-[11px] font-semibold" style={{ color: "#c2410c" }}>Waiting for Truck Operator confirmation.</p>}
        {!canAct && st === "operator" && role === "admin" && <p className="text-center text-[11px] font-semibold" style={{ color: "#c2410c" }}>Waiting for Truck Operator confirmation.</p>}

        {st === "confirmed" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Ghost color={color} onClick={() => flash("Download started (simulated)")}>Download Copy</Ghost>
              <Ghost color={color} onClick={() => flash("Copy shared (simulated)")}>Share Copy</Ghost>
            </div>
            {role !== "admin" && <Btn color={GREEN} onClick={() => setView("booking")}>View Booking</Btn>}
            {role === "admin" && (
              <div className="rounded-2xl px-4 py-3" style={{ border: "1.5px dashed rgba(29,85,214,0.4)", background: "#F8FAFF" }}>
                <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color: BLUE }}>DEMO CONTROL</p>
                <Ghost color={BLUE} onClick={() => onDispatch({ status: "accepted", agreement: "customer", agreementUpdate: true })}>Simulate Major Change (Pickup Time)</Ghost>
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[11px] font-bold text-white z-50" style={{ background: INK }}>{toast}</div>}
      {modal && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
          <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
            <h3 className="text-[16px] font-black mb-1" style={{ color: INK }}>Confirm Booking Agreement?</h3>
            <p className="text-[12px] mb-4" style={{ color: MUTED }}>{role === "customer" ? "Please make sure all hauling details are correct before confirming." : "You are confirming the truck, cargo, route, schedule, and hauling rate."}</p>
            <div className="space-y-2">
              <Btn color={color} onClick={confirm}>{role === "customer" ? "Confirm Agreement" : "Confirm"}</Btn>
              <Ghost color={color} onClick={() => setModal(false)}>{role === "customer" ? "Review Again" : "Cancel"}</Ghost>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type LTab = "pending" | "confirmed" | "completed";
export function AgreementsList({ role, dispatch, onOpen, onBack }: { role: Role; dispatch: Dispatch; onOpen: () => void; onBack: () => void }) {
  const { m, REQ, QUOTE, AGREEMENT } = useBookingData();
  const [tab, setTab] = useState<LTab>("pending");
  const color = roleColor(role);
  const st = agreementStage(dispatch);
  const has = dispatch.matchIdx === 0 && (dispatch.status === "accepted" || dispatch.status === "booked");
  const done = isCompleted(dispatch);
  const inTab = (t: LTab) => has && (done ? t === "completed" : (t === "pending" && st !== "confirmed") || (t === "confirmed" && st === "confirmed"));
  const show = inTab(tab);
  const count = (t: LTab) => (inTab(t) ? 1 : 0);
  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <Header title="Booking Agreements" sub={role === "customer" ? "Your hauling agreements" : "Agreements with customers"} onBack={onBack} />
      <div className="flex gap-1.5 px-3 py-2.5" style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
        {(["pending", "confirmed", "completed"] as LTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-full text-[11px] font-bold capitalize" style={{ background: tab === t ? color : "rgba(0,0,0,0.04)", color: tab === t ? "#fff" : MUTED }}>{t} ({count(t)})</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-2.5">
        {show && (
          <Sec title={AGREEMENT.id}>
            <div className="flex justify-between items-center mb-1"><span className="text-[12px] font-black" style={{ color }}>{AGREEMENT.id}</span>{done ? <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.12)", color: "#15803d" }}>COMPLETED</span> : <StatusPill d={dispatch} />}</div>
            {role === "customer" ? (
              <>
                <Row k="Booking ID" v={AGREEMENT.booking} />
                <Row k="Operator" v={m.business} />
              </>
            ) : (
              <>
                <Row k="Customer" v={REQ.customer} />
                <Row k="Truck" v={m.truckShort} />
                <Row k="Pickup" v={QUOTE.pickupSchedule} />
              </>
            )}
            <Row k="Cargo" v={REQ.cargoShort} />
            <Row k="Rate" v={peso(quoteRate(dispatch))} strong />
            <div className="mt-2"><Btn color={color} onClick={onOpen}>{role === "customer" ? "View Agreement" : "Review Agreement"}</Btn></div>
          </Sec>
        )}
        {!show && (
          <div className="text-center py-14 px-8"><p className="text-4xl mb-2">📄</p><p className="text-[12px]" style={{ color: MUTED }}>{tab === "completed" ? "No completed agreements yet." : tab === "pending" ? "No pending agreements." : "No confirmed agreements yet."}</p></div>
        )}
      </div>
    </div>
  );
}
