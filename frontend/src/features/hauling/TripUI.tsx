import type { TripStage } from "@/data/dispatchData";
import { TRIP_ORDER } from "@/data/dispatchData";

export type Role = "customer" | "operator" | "admin";
export const BLUE = "#1D55D6", ORANGE = "#F47B20", GREEN = "#16A34A", RED = "#DC2626", INK = "#0D1828", MUTED = "#64748b", BORDER = "rgba(0,0,0,0.08)";
export const roleColor = (r: Role) => (r === "operator" ? ORANGE : BLUE);
const idx = (s: TripStage) => TRIP_ORDER.indexOf(s);

export function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[11px] flex-shrink-0" style={{ color: MUTED }}>{k}</span>
      <span className={`text-[11px] text-right ${strong ? "font-black" : "font-semibold"}`} style={{ color: INK }}>{v}</span>
    </div>
  );
}
export function Sec({ title, children, accent }: { title?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${accent ?? BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {title && <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color: MUTED }}>{title.toUpperCase()}</p>}
      {children}
    </div>
  );
}
export function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color: fg }}>{text}</span>;
}
export function Btn({ children, onClick, disabled, color = ORANGE }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; color?: string }) {
  return <button onClick={onClick} disabled={disabled} className="w-full py-4 rounded-2xl text-[14px] font-black text-white active:opacity-80" style={{ background: disabled ? "#CBD5E1" : color }}>{children}</button>;
}
export function Ghost({ children, onClick, color = ORANGE }: { children: React.ReactNode; onClick: () => void; color?: string }) {
  return <button onClick={onClick} className="w-full py-3 rounded-xl text-[12px] font-bold active:opacity-70" style={{ background: "#fff", color, border: `1.5px solid ${color}` }}>{children}</button>;
}
export function Header({ title, sub, onBack, right }: { title: string; sub: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3" style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${BORDER}` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div className="flex-1"><h1 className="text-[14px] font-black" style={{ color: INK }}>{title}</h1><p className="text-[10px]" style={{ color: MUTED }}>{sub}</p></div>
      {right}
    </div>
  );
}
export function Banner({ tone, children }: { tone: "green" | "orange" | "red"; children: React.ReactNode }) {
  const c = tone === "green" ? ["rgba(22,163,74,0.08)", "rgba(22,163,74,0.25)", "#15803d"] : tone === "red" ? ["rgba(220,38,38,0.07)", "rgba(220,38,38,0.25)", RED] : ["rgba(244,123,32,0.08)", "rgba(244,123,32,0.3)", "#c2410c"];
  return <div className="rounded-xl px-3 py-2.5" style={{ background: c[0], border: `1px solid ${c[1]}` }}><p className="text-[11px] font-bold" style={{ color: c[2] }}>{children}</p></div>;
}
export function Modal({ title, msg, ok, cancel, onOk, onCancel, color }: { title: string; msg: string; ok: string; cancel: string; onOk: () => void; onCancel: () => void; color: string }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(13,24,40,0.55)" }}>
      <div className="w-full rounded-t-3xl px-5 pt-5 pb-6" style={{ background: "#fff" }}>
        <h3 className="text-[16px] font-black mb-1" style={{ color: INK }}>{title}</h3>
        <p className="text-[12px] mb-4" style={{ color: MUTED }}>{msg}</p>
        <div className="space-y-2"><Btn color={color} onClick={onOk}>{ok}</Btn><Ghost color={color} onClick={onCancel}>{cancel}</Ghost></div>
      </div>
    </div>
  );
}


export function HaulTimeline({ stage, confirmed, issue, completed }: { stage: TripStage; confirmed?: boolean; issue?: boolean; completed?: boolean }) {
  const i = idx(stage);
  const base = [
    { l: "Booking Confirmed", at: 0 }, { l: "Truck En Route to Pickup", at: idx("enroute") }, { l: "Arrived at Pickup", at: idx("arrived") },
    { l: "Pickup Confirmed", at: idx("loaded") }, { l: "Cargo Loaded", at: idx("loaded") }, { l: "In Transit", at: idx("transit") },
    { l: "Arrived at Destination", at: idx("destination") }, { l: "Delivered", at: idx("delivered") },
  ];
  const steps = [...base.map((x) => x.l), issue ? "Issue Under Review" : confirmed ? "Customer Confirmed" : "Customer Confirmation", ...(confirmed || completed ? [completed ? "Completed" : "Awaiting Completion"] : [])];
  let cur = base.reduce((a, s, k) => (i >= s.at ? k : a), 0);
  if (stage === "delivered") cur = completed ? 10 : confirmed ? 9 : 8;
  return (
    <div>
      {steps.map((l, k) => {
        const done = k < cur;
        const active = k === cur;
        const col = done ? GREEN : active ? (issue && k === 8 ? RED : ORANGE) : "#CBD5E1";
        return (
          <div key={l} className="flex items-center gap-2.5 py-1">
            <span className="w-4 text-center text-[12px] font-black" style={{ color: col }}>{done ? "✓" : active ? "●" : "○"}</span>
            <span className="text-[12px]" style={{ color: done ? GREEN : active ? INK : "#94a3b8", fontWeight: active || done ? 700 : 500 }}>{l}</span>
          </div>
        );
      })}
    </div>
  );
}
