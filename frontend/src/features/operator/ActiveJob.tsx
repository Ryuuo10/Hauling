import { useState } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

// ── Tokens ────────────────────────────────────────────────────────────────────
const A = {
  bg: "#F8FAFF", card: "#FFFFFF", cardJob: "#EEF2FF", cardJobBorder: "rgba(29,85,214,0.2)",
  orange: "#1D55D6", blue: "#1D55D6", green: "#16A34A", red: "#DC2626",
  yellow: "#EAB308", border: "rgba(0,0,0,0.08)", borderMd: "rgba(0,0,0,0.14)",
  muted: "#64748b", mutedFg: "#94a3b8", inputBg: "#FFFFFF",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type AJPage = "job" | "gps" | "chat" | "delivered" | "receipt" | "rate";
type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ── Data ──────────────────────────────────────────────────────────────────────
const DRIVER = {
  name: "Juan Dela Cruz", initials: "JD", color: "#1D55D6",
  rating: 4.9, jobs: 245, acceptance: "94%",
  vehicle: "Isuzu FVM 10-Wheeler Wing Van", plate: "ABC-1234",
  fare: 850, payment: "GCash", phone: "+63 917 123 4567",
};

const STAGES: { label: string; msg: string; sub: string; eta: string; dist: string }[] = [
  { label: "Operator Assigned",        msg: "Dela Cruz Trucking Services confirmed the booking.",       sub: "The truck is preparing for departure.",          eta: "~20 mins", dist: "5.8 km" },
  { label: "Heading to Pickup",        msg: "Truck is en route to supplier depot.",        sub: "ETA ~6 mins to ABC Hardware, Fortich St.",    eta: "~6 mins",  dist: "1.4 km" },
  { label: "Arrived at Pickup",        msg: "Truck has arrived at pickup location.",       sub: "Cargo loading is now in progress.",           eta: "Loading",  dist: "0 km"   },
  { label: "Cargo Loaded",             msg: "All cargo loaded and secured.",                sub: "30 Sacks of Portland Cement — strapped.",     eta: "~18 mins", dist: "7.2 km" },
  { label: "In Transit",               msg: "Your delivery is on the way.",                 sub: "Traveling toward Pinecrest Subdivision.",     eta: "~12 mins", dist: "4.2 km" },
  { label: "Near Destination",         msg: "Truck is approaching the destination.",       sub: "Truck is ~3 mins from the delivery point.",       eta: "~3 mins",  dist: "0.8 km" },
  { label: "Delivered",                msg: "Delivered successfully!",                      sub: "Cargo received at Pinecrest Subdivision.",    eta: "Done",     dist: "0 km"   },
];

// Truck SVG positions per stage along the simulated route
const TRUCK_POS = [
  { x: 48,  y: 215 }, // 0: Driver Assigned
  { x: 88,  y: 188 }, // 1: Heading to Pickup
  { x: 128, y: 162 }, // 2: Arrived at Pickup
  { x: 128, y: 162 }, // 3: Cargo Loaded
  { x: 238, y: 118 }, // 4: In Transit
  { x: 308, y: 88  }, // 5: Near Destination
  { x: 342, y: 74  }, // 6: Delivered
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function DriverAvatar({ size = 44 }: { size?: number }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="rounded-full flex items-center justify-center font-bold text-white"
        style={{ width: size, height: size, background: DRIVER.color, fontSize: size * 0.32 }}>
        {DRIVER.initials}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
        style={{ background: A.green, borderColor: A.card }}/>
    </div>
  );
}

function PageHeader({ title, subtitle, onBack, right }: {
  title: string; subtitle?: string; onBack: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${A.border}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "40px", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-black leading-tight" style={{ color: "#0D1828" }}>{title}</h1>
          {subtitle && <p className="text-[10px]" style={{ color: A.mutedFg }}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

// ── Stage Tracker ─────────────────────────────────────────────────────────────

function StageTracker({ stage }: { stage: Stage }) {
  return (
    <div className="px-4 py-4 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black tracking-wider" style={{ color: A.mutedFg }}>DELIVERY STATUS</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: A.green, animation: "livenessBlip 1.5s ease-in-out infinite" }}/>
          <span className="text-[10px] font-semibold" style={{ color: A.green }}>Simulated demo location</span>
        </div>
      </div>

      {/* Current status */}
      <div className="flex items-start gap-3 p-3 rounded-xl mb-3" style={{ background: A.cardJob, border: `1px solid ${A.cardJobBorder}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${A.orange}22` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={A.orange}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black leading-tight" style={{ color: "#0D1828" }}>Current Stage: {STAGES[stage].label}</p>
          <p className="text-[11px] mt-0.5" style={{ color: A.mutedFg }}>{STAGES[stage].msg}</p>
          <p className="text-[10px] mt-1" style={{ color: A.orange }}>{STAGES[stage].sub}</p>
        </div>
        {stage < 6 && (
          <div className="text-right flex-shrink-0">
            <p className="text-[14px] font-black" style={{ color: A.orange }}>{STAGES[stage].eta}</p>
            <p className="text-[9px]" style={{ color: A.muted }}>{STAGES[stage].dist}</p>
          </div>
        )}
        {stage === 6 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(22,163,74,0.15)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.green} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}
      </div>

      {/* Step list */}
      <div className="space-y-0">
        {STAGES.map((s, i) => {
          const done = i < stage;
          const active = i === stage;
          const upcoming = i > stage;
          return (
            <div key={s.label} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: done ? A.green : active ? A.orange : "#E5E7EB", border: upcoming ? `1.5px solid rgba(0,0,0,0.12)` : "none" }}>
                  {done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  {active && <div className="w-2 h-2 rounded-full bg-white"/>}
                </div>
                {i < STAGES.length - 1 && (
                  <div className="w-px my-0.5" style={{ height: "14px", background: done ? A.green : "rgba(0,0,0,0.10)" }}/>
                )}
              </div>
              <div className="pb-0.5">
                <p className="text-[11px] font-semibold leading-tight"
                  style={{ color: done ? A.green : active ? "#0D1828" : A.mutedFg, textDecoration: done ? "line-through" : "none", opacity: upcoming ? 0.6 : 1 }}>
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Simulated GPS Map ─────────────────────────────────────────────────────────

function SimulatedMap({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const h = compact ? 220 : 280;
  const tp = TRUCK_POS[stage];
  const deliveredOrNear = stage >= 5;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: h, background: "#EFF6FF" }}>
      <svg width="100%" height={h} viewBox={`0 0 390 ${h}`} preserveAspectRatio="xMidYMid slice">

        {/* Street grid */}
        {[30, 70, 110, 150, 190, 230, 270, 310, 350].map(x => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={h} stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
        ))}
        {[30, 65, 100, 135, 170, 205, 240].map(y => (
          <line key={`h${y}`} x1={0} y1={y} x2={390} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
        ))}

        {/* Main road A — diagonal across map */}
        <line x1={0} y1={240} x2={390} y2={50} stroke="rgba(0,0,0,0.10)" strokeWidth={8}/>

        {/* Secondary road */}
        <line x1={0} y1={130} x2={390} y2={130} stroke="rgba(0,0,0,0.08)" strokeWidth={5}/>
        <line x1={195} y1={0} x2={195} y2={h} stroke="rgba(0,0,0,0.08)" strokeWidth={5}/>

        {/* Road labels */}
        <text x={55} y={228} fill="rgba(0,0,0,0.35)" fontSize="9" fontFamily="sans-serif">Fortich St.</text>
        <text x={200} y={124} fill="rgba(0,0,0,0.28)" fontSize="8" fontFamily="sans-serif">National Highway</text>
        <text x={285} y={100} fill="rgba(0,0,0,0.28)" fontSize="8" fontFamily="sans-serif">Brgy. San Jose Rd.</text>

        {/* Route path — gray upcoming portion */}
        <path d="M 48 215 Q 88 185 128 162 Q 185 135 238 118 Q 290 96 342 74"
          fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="3" strokeDasharray="6 4"/>

        {/* Route path — completed green portion */}
        {stage >= 1 && (
          <path d={`M 48 215 ${stage >= 2 ? "Q 88 185 128 162" : `Q ${tp.x} ${tp.y} ${tp.x} ${tp.y}`}`}
            fill="none" stroke={A.green} strokeWidth="3.5" strokeLinecap="round"/>
        )}
        {stage >= 4 && (
          <path d={`M 128 162 Q 185 135 ${stage >= 5 ? "238 118" : `${tp.x} ${tp.y}`}`}
            fill="none" stroke={A.green} strokeWidth="3.5" strokeLinecap="round"/>
        )}
        {stage >= 5 && (
          <path d={`M 238 118 Q 290 96 ${stage >= 6 ? "342 74" : `${tp.x} ${tp.y}`}`}
            fill="none" stroke={A.green} strokeWidth="3.5" strokeLinecap="round"/>
        )}

        {/* Pickup Point A */}
        <circle cx={128} cy={162} r={14} fill="rgba(29,85,214,0.15)" stroke={A.blue} strokeWidth="1.5"/>
        <circle cx={128} cy={162} r={6} fill={A.blue}/>
        <text x={115} y={150} fill={A.blue} fontSize="9" fontWeight="bold" fontFamily="sans-serif">A</text>
        <text x={100} y={142} fill="rgba(29,85,214,0.7)" fontSize="7" fontFamily="sans-serif">ABC Hardware</text>

        {/* Drop-off Point B */}
        <circle cx={342} cy={74} r={14} fill="rgba(244,123,32,0.15)" stroke={A.orange} strokeWidth="1.5"/>
        <circle cx={342} cy={74} r={6} fill={deliveredOrNear ? A.green : A.orange}/>
        <text x={330} y={62} fill={deliveredOrNear ? A.green : A.orange} fontSize="9" fontWeight="bold" fontFamily="sans-serif">B</text>
        <text x={308} y={54} fill="rgba(244,123,32,0.7)" fontSize="7" fontFamily="sans-serif">Pinecrest Subd.</text>

        {/* Truck icon */}
        {stage < 6 ? (
          <>
            <circle cx={tp.x} cy={tp.y} r={14} fill="rgba(29,85,214,0.25)" stroke={A.blue} strokeWidth="2"/>
            <circle cx={tp.x} cy={tp.y} r={10} fill={A.blue}/>
            <text x={tp.x} y={tp.y + 4} fill="white" fontSize="11" textAnchor="middle" fontFamily="sans-serif">🚛</text>
          </>
        ) : (
          <>
            <circle cx={tp.x} cy={tp.y} r={14} fill="rgba(22,163,74,0.25)" stroke={A.green} strokeWidth="2"/>
            <circle cx={tp.x} cy={tp.y} r={10} fill={A.green}/>
            <text x={tp.x} y={tp.y + 4} fill="white" fontSize="11" textAnchor="middle" fontFamily="sans-serif">✓</text>
          </>
        )}

        {/* Live GPS pulse ring */}
        {stage < 6 && (
          <circle cx={tp.x} cy={tp.y} r={20} fill="none" stroke={A.blue} strokeWidth="1" opacity="0.3"
            style={{ animation: "pulseOval 2s ease-in-out infinite" }}/>
        )}
      </svg>

      {/* Map controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {["+", "−", "⌖"].map(btn => (
          <button key={btn} className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: "rgba(255,255,255,0.92)", border: `1px solid ${A.border}`, color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}>
            {btn}
          </button>
        ))}
      </div>

      {/* LIVE badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.92)", border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: A.green, animation: "livenessBlip 1.5s ease-in-out infinite" }}/>
        <span className="text-[9px] font-black" style={{ color: A.green }}>DEMO GPS</span>
      </div>

      {/* ETA floating card */}
      {stage < 6 && (
        <div className="absolute bottom-3 left-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${A.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[9px]" style={{ color: A.mutedFg }}>ETA</p>
              <p className="text-[14px] font-black" style={{ color: A.orange }}>{STAGES[stage].eta}</p>
            </div>
            <div className="w-px h-7" style={{ background: A.border }}/>
            <div>
              <p className="text-[9px]" style={{ color: A.mutedFg }}>Remaining</p>
              <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>{STAGES[stage].dist}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Overlays ──────────────────────────────────────────────────────────────────

function CallDriverSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}/>
      <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", borderTop: `1px solid ${A.border}` }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }}/>
        </div>
        <div className="px-6 pt-3 pb-8 text-center">
          <DriverAvatar size={56} />
          <div className="mt-3 mb-1">
            <h2 className="text-lg font-black" style={{ color: "#0D1828" }}>Call {DRIVER.name}?</h2>
            <p className="text-[12px]" style={{ color: A.mutedFg }}>{DRIVER.phone}</p>
            <p className="text-[10px] mt-1" style={{ color: A.muted }}>Job KG-12389 · Active</p>
          </div>
          <div className="mt-5 space-y-2.5">
            <a href={`tel:${DRIVER.phone}`}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-opacity active:opacity-80"
              style={{ background: A.green, display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Call Now
            </a>
            <button onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${A.border}`, color: "#374151" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ShareTripModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { icon: "💬", label: "Share via Messenger", color: "#1877F2" },
    { icon: "💬", label: "Share via SMS",        color: A.green },
    { icon: "💬", label: "Share via WhatsApp",   color: "#25D366" },
    { icon: "⋯",  label: "More Options…",         color: A.muted },
  ];

  return (
    <>
      <div className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}/>
      <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", borderTop: `1px solid ${A.border}` }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }}/>
        </div>
        <div className="px-5 pt-2 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black" style={{ color: "#0D1828" }}>Share Trip</h2>
            <button onClick={onClose} className="text-[11px] font-semibold" style={{ color: A.blue }}>Done</button>
          </div>

          {/* Tracking link card */}
          <div className="px-4 py-3.5 rounded-2xl mb-4" style={{ background: "#F1F5FF", border: `1px solid ${A.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: A.green, animation: "livenessBlip 1.5s ease-in-out infinite" }}/>
              <p className="text-[11px] font-black" style={{ color: "#0D1828" }}>Job KG-12389 · Live Tracking</p>
            </div>
            <p className="text-[10px] mb-2" style={{ color: A.mutedFg }}>ETA: ~12 mins · Hardware &amp; Cement Delivery</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
              <span className="text-[10px] flex-1 truncate" style={{ color: A.muted }}>kadago.ph/track/KG-12389</span>
              <button onClick={copyLink} className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white transition-all"
                style={{ background: copied ? A.green : A.blue }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center mb-4 leading-relaxed" style={{ color: A.mutedFg }}>
            Anyone with this link can view the live trip status<br/>until the job is completed.
          </p>

          <div className="space-y-2">
            {shareOptions.map(o => (
              <button key={o.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-opacity active:opacity-70"
                style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${A.border}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${o.color}18` }}>
                  {o.icon}
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "#374151" }}>{o.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2.5" className="ml-auto"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SOSScreen({ onClose }: { onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [sent, setSent] = useState(false);

  const sosOptions = [
    { icon: "🚨", label: "Alert KadaGo Admin",      sub: "Notify our operations team immediately" },
    { icon: "🚒", label: "Call Emergency Services",  sub: "Direct call to 911 / local emergency" },
    { icon: "📞", label: "Call Emergency Contact",   sub: "Alert your registered emergency contact" },
    { icon: "📍", label: "Share Live Location",      sub: "Send your GPS coordinates to all contacts" },
    { icon: "🚗", label: "Report Accident",          sub: "Log a road accident or vehicle incident" },
    { icon: "⚠️", label: "Report Unsafe Behavior",  sub: "Flag operator or driver conduct or safety issue" },
    { icon: "📦", label: "Report Cargo Issue",       sub: "Damaged, missing, or tampered cargo" },
  ];

  if (sent) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "rgba(220,38,38,0.97)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.15)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">SOS Alert Sent!</h2>
        <p className="text-[13px] text-white/80 mb-8 leading-relaxed">KadaGo Admin and your emergency contacts have been notified. Help is on the way.</p>
        <button onClick={onClose}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-red-600 bg-white transition-opacity active:opacity-80">
          Close Emergency Mode
        </button>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "#1A0000" }}>
        <div className="flex-shrink-0 px-4 pt-5 pb-4" style={{ background: "rgba(220,38,38,0.2)", borderBottom: "1px solid rgba(220,38,38,0.3)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black tracking-widest" style={{ color: "#FCA5A5" }}>⚠ EMERGENCY CONFIRMATION</span>
          </div>
          <h1 className="text-xl font-black text-white">Send Emergency Alert?</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(220,38,38,0.2)", border: "2px solid rgba(220,38,38,0.5)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={A.red} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p className="text-[14px] text-white/80 mb-8 leading-relaxed">
            This will immediately alert the KadaGo operations team, your emergency contact, and share your live GPS location.
          </p>
          <div className="w-full space-y-3">
            <button onClick={() => setSent(true)}
              className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
              style={{ background: A.red }}>
              🚨 Send SOS Now
            </button>
            <button onClick={() => setConfirmed(false)}
              className="w-full py-3.5 rounded-xl font-bold text-[13px] text-white transition-opacity active:opacity-70"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "#100000" }}>
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-5 pb-4"
        style={{ background: "rgba(220,38,38,0.18)", borderBottom: "1px solid rgba(220,38,38,0.3)" }}>
        <div>
          <span className="text-[9px] font-black tracking-widest" style={{ color: "#FCA5A5" }}>⚠ EMERGENCY</span>
          <h1 className="text-xl font-black text-white mt-0.5">SOS Emergency</h1>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="px-4 py-3 rounded-xl mb-4" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)" }}>
          <p className="text-[12px] leading-relaxed" style={{ color: "#FCA5A5" }}>
            Use SOS only for emergencies or immediate safety concerns. False activations may affect your account.
          </p>
        </div>

        <div className="space-y-2">
          {sosOptions.map(opt => (
            <button key={opt.label} onClick={() => setConfirmed(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-opacity active:opacity-70"
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(220,38,38,0.15)" }}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-tight">{opt.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#FCA5A5" }}>{opt.sub}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(220,38,38,0.6)" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        <div style={{ height: "8px" }}/>
      </div>
    </div>
  );
}

// ── Screen: Active Job ────────────────────────────────────────────────────────

function ActiveJobScreen({ stage, setStage, onGPS, onChat, onCall, onShare, onSOS, onClose }: {
  stage: Stage; setStage: (s: Stage) => void;
  onGPS: () => void; onChat: () => void; onCall: () => void; onShare: () => void; onSOS: () => void; onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${A.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <img src={kadaGoLogo} alt="KadaGo" style={{ width: "40px", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-black" style={{ color: "#0D1828" }}>KG-BK-20418</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: A.orange }}>ACTIVE HAULING</span>
            </div>
            <p className="text-[10px]" style={{ color: A.mutedFg }}>Construction Materials · Malaybalay → CDO · {STAGES[stage].eta}</p>
          </div>
          <button onClick={onSOS}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-white flex-shrink-0"
            style={{ background: A.red }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            SOS
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Map preview */}
        <SimulatedMap stage={stage} compact />

        <div className="px-3 pt-3 pb-3 space-y-3">
          {/* Stage tracker */}
          <StageTracker stage={stage} />

          {/* Job summary */}
          <div className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="text-[10px] font-black tracking-wider" style={{ color: A.mutedFg }}>JOB SUMMARY</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { label: "Service", value: "🧱 Hardware & Cement" },
                { label: "Cargo", value: "30 Sacks of Portland Cement (Type 1)" },
                { label: "Pickup", value: "ABC Hardware & Construction Depot, Fortich St." },
                { label: "Drop-off", value: "Lot 14 Blk 3, Pinecrest Subdivision, Brgy. San Jose" },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-2" style={{ paddingBottom: "6px", borderBottom: `1px solid ${A.border}` }}>
                  <span className="text-[10px] flex-shrink-0 pt-0.5" style={{ color: A.mutedFg, minWidth: "52px" }}>{r.label}</span>
                  <span className="text-[11px] font-semibold leading-snug" style={{ color: "#0D1828" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Driver card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: A.cardJob, border: `1px solid ${A.cardJobBorder}` }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${A.cardJobBorder}` }}>
              <p className="text-[10px] font-black tracking-wider" style={{ color: A.blue }}>ASSIGNED OPERATOR &amp; TRUCK</p>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: A.green, border: "1px solid rgba(22,163,74,0.25)" }}>VERIFIED OPERATOR</span>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <DriverAvatar size={48} />
                <div className="flex-1">
                  <p className="text-[15px] font-black" style={{ color: "#0D1828" }}>Dela Cruz Trucking Services</p>
                  <p className="text-[10px]" style={{ color: A.muted }}>Driver: {DRIVER.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]" style={{ color: A.muted }}>Truck: {DRIVER.vehicle}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold" style={{ color: A.green }}>Booking Confirmed</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Vehicle", value: DRIVER.vehicle },
                  { label: "Plate", value: DRIVER.plate },
                ].map(r => (
                  <div key={r.label} className="px-3 py-2 rounded-xl" style={{ background: "rgba(29,85,214,0.06)" }}>
                    <p className="text-[9px]" style={{ color: A.muted }}>{r.label}</p>
                    <p className="text-[11px] font-bold leading-tight" style={{ color: "#0D1828" }}>{r.value}</p>
                  </div>
                ))}
              </div>
              {/* Action buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Call", icon: "📞", action: onCall,  color: A.green },
                  { label: "Chat", icon: "💬", action: onChat,  color: A.blue },
                  { label: "GPS",  icon: "📍", action: onGPS,   color: A.orange },
                  { label: "Share",icon: "🔗", action: onShare, color: A.muted },
                ].map(b => (
                  <button key={b.label} onClick={b.action}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-opacity active:opacity-70"
                    style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
                    <span style={{ fontSize: "18px" }}>{b.icon}</span>
                    <span className="text-[9px] font-bold" style={{ color: b.color }}>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Demo stage advance */}
          {stage < 6 && (
            <button onClick={() => setStage((stage + 1) as Stage)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-semibold transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px dashed rgba(0,0,0,0.10)", color: A.muted }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
              Demo: Advance to "{STAGES[stage + 1].label}"
            </button>
          )}
          {stage === 6 && (
            <button onClick={() => setStage(0)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-semibold transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px dashed rgba(0,0,0,0.10)", color: A.muted }}>
              Demo: Reset to Stage 1
            </button>
          )}
        </div>
      </div>

      {/* GPS sticky CTA when in transit */}
      {stage >= 4 && stage < 6 && (
        <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${A.border}` }}>
          <button onClick={onGPS}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${A.orange} 0%, #1447B8 100%)` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></svg>
            Demo GPS — Simulated Location
          </button>
        </div>
      )}
    </div>
  );
}

// ── Screen: Live GPS ──────────────────────────────────────────────────────────

function LiveGPSScreen({ stage, onBack, onChat, onCall, onSOS, onShare }: {
  stage: Stage; onBack: () => void; onChat: () => void; onCall: () => void; onSOS: () => void; onShare: () => void;
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      {/* Header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2.5" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${A.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-black tracking-wider" style={{ color: A.orange }}>📍 DEMO GPS — SIMULATED LOCATION</p>
            <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>KG-12389 · {STAGES[stage].label}</p>
          </div>
          <button onClick={onShare} className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
          <button onClick={onSOS} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-white" style={{ background: A.red }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            SOS
          </button>
        </div>
      </div>

      {/* Full-screen map */}
      <SimulatedMap stage={stage} />

      {/* Status + driver row */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        {/* Status pill */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: A.cardJob, border: `1px solid ${A.cardJobBorder}` }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage === 6 ? A.green : A.orange, animation: "livenessBlip 1.4s ease-in-out infinite" }}/>
          <div className="flex-1">
            <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{STAGES[stage].label}</p>
            <p className="text-[10px]" style={{ color: A.mutedFg }}>{STAGES[stage].sub}</p>
          </div>
          {stage < 6 && (
            <div className="text-right">
              <p className="text-[14px] font-black" style={{ color: A.orange }}>{STAGES[stage].eta}</p>
              <p className="text-[9px]" style={{ color: A.muted }}>{STAGES[stage].dist}</p>
            </div>
          )}
        </div>

        {/* Driver + fare info */}
        <div className="px-4 py-3 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 mb-2">
            <DriverAvatar size={40} />
            <div className="flex-1">
              <p className="text-[13px] font-bold" style={{ color: "#0D1828" }}>{DRIVER.name}</p>
              <p className="text-[10px]" style={{ color: A.mutedFg }}>{DRIVER.vehicle} · {DRIVER.plate}</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-black" style={{ color: A.orange }}>₱{DRIVER.fare}</p>
              <p className="text-[9px]" style={{ color: A.mutedFg }}>{DRIVER.payment}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onCall}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white"
              style={{ background: A.green }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Call Operator
            </button>
            <button onClick={onChat}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white"
              style={{ background: A.blue }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Chat Operator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Chat ──────────────────────────────────────────────────────────────

const CHAT_MESSAGES = [
  { from: "system", text: "✅ Booking confirmed — Job KG-12389 · Juan Dela Cruz" },
  { from: "you",    text: "Hi Juan, please call me when you reach the depot." },
  { from: "driver", text: "Sure Ma'am, I'm about 6 minutes away from ABC Hardware." },
  { from: "driver", text: "I have 2 helpers with me ready for loading." },
  { from: "you",    text: "Thank you. Please use Gate B for the loading area." },
  { from: "driver", text: "Noted! I'll proceed to Gate B. Will call when I arrive. 👍" },
  { from: "driver", text: "📍 Sharing live location with you now." },
];

const QUICK_REPLIES = ["On my way 👍", "Please hurry!", "Gate is open", "Thanks!"];

function ActiveJobChatScreen({ onBack, onCall }: { onBack: () => void; onCall: () => void }) {
  const [input, setInput] = useState("");

  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <div className="flex-shrink-0 px-3 pt-3 pb-2.5" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${A.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <DriverAvatar size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-black leading-tight" style={{ color: "#0D1828" }}>{DRIVER.name}</p>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.10)", color: A.green }}>VERIFIED</span>
            </div>
            <p className="text-[10px]" style={{ color: A.green }}>● Online · Job KG-12389</p>
          </div>
          <button onClick={onCall}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-opacity active:opacity-70"
            style={{ background: "rgba(22,163,74,0.10)", border: `1px solid rgba(22,163,74,0.25)`, color: A.green }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A.green} strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            Call
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {CHAT_MESSAGES.map((msg, i) => {
          if (msg.from === "system") return (
            <div key={i} className="flex justify-center">
              <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(22,163,74,0.10)", color: A.green, border: "1px solid rgba(22,163,74,0.2)" }}>
                {msg.text}
              </span>
            </div>
          );
          const isYou = msg.from === "you";
          return (
            <div key={i} className={`flex items-end gap-2 ${isYou ? "flex-row-reverse" : ""}`}>
              {!isYou && <DriverAvatar size={28} />}
              <div className="max-w-[76%] px-3.5 py-2.5 text-[12px] leading-relaxed"
                style={{
                  background: isYou ? `linear-gradient(135deg, ${A.orange}, #1447B8)` : "rgba(0,0,0,0.06)",
                  color: isYou ? "white" : "#374151",
                  borderRadius: isYou ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick replies */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto" style={{ borderTop: `1px solid ${A.border}`, background: "#FFFFFF" }}>
        {QUICK_REPLIES.map(r => (
          <button key={r} onClick={() => setInput(r)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
            style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${A.border}`, color: "#374151" }}>
            {r}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ background: "#FFFFFF" }}>
        <div className="flex items-center gap-2 mb-2">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.mutedFg} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.mutedFg} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: "#374151" }}/>
          </div>
          <button className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${A.orange}, #1447B8)` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Delivered ─────────────────────────────────────────────────────────

function DeliveredScreen({ onReceipt, onRate, onBookAgain, onHome }: {
  onReceipt: () => void; onRate: () => void; onBookAgain: () => void; onHome: () => void;
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
        <div className="flex items-center gap-3">
          <img src={kadaGoLogo} alt="KadaGo" style={{ width: "44px" }} />
          <div>
            <p className="text-[9px] font-black tracking-widest" style={{ color: A.green }}>✓ DELIVERED SUCCESSFULLY</p>
            <h1 className="text-[15px] font-black leading-tight" style={{ color: "#0D1828" }}>Delivery Complete</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Success visual */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(22,163,74,0.10)", border: "2px solid rgba(22,163,74,0.35)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={A.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="absolute inset-0 rounded-full" style={{ animation: "pulseOval 2.5s ease-in-out infinite" }}/>
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: "#0D1828" }}>Delivered Successfully!</h2>
          <p className="text-[11px]" style={{ color: A.mutedFg }}>Job KG-12389 · Completed 3:42 PM · Sep 5, 2026</p>
        </div>

        {/* Delivery summary */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {[
            { label: "Driver",       value: DRIVER.name },
            { label: "Vehicle",      value: DRIVER.vehicle },
            { label: "Plate",        value: DRIVER.plate },
            { label: "Final Fare",   value: `₱${DRIVER.fare}`, highlight: true },
            { label: "Payment",      value: DRIVER.payment },
            { label: "Cargo",        value: "30 Sacks of Portland Cement (Type 1)" },
            { label: "Delivered to", value: "Pinecrest Subdivision, Brgy. San Jose" },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${A.border}` : "none" }}>
              <span className="text-[10px] flex-shrink-0" style={{ color: A.mutedFg, minWidth: "64px" }}>{r.label}</span>
              <span className="text-[11px] font-bold leading-snug" style={{ color: r.highlight ? A.orange : "#0D1828" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Proof of delivery */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: A.mutedFg }}>PROOF OF DELIVERY</p>
          </div>
          <div className="px-4 py-3">
            <div className="w-full h-24 rounded-xl flex flex-col items-center justify-center mb-2" style={{ background: "rgba(0,0,0,0.04)", border: `2px dashed rgba(0,0,0,0.10)` }}>
              <span className="text-3xl mb-1">📷</span>
              <span className="text-[10px]" style={{ color: A.muted }}>Delivery photo captured by driver</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Recipient: Maria Santos</p>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>Cargo received — 3:42 PM</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: "rgba(22,163,74,0.10)", border: "1px solid rgba(22,163,74,0.25)" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={A.green} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-[9px] font-black" style={{ color: A.green }}>Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2.5" style={{ background: "#FFFFFF", borderTop: `1px solid ${A.border}` }}>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onReceipt}
            className="py-3 rounded-xl font-bold text-[12px] text-center transition-opacity active:opacity-70"
            style={{ background: "rgba(29,85,214,0.08)", border: `1px solid rgba(29,85,214,0.25)`, color: A.blue }}>
            📄 View E-Receipt
          </button>
          <button onClick={onRate}
            className="py-3 rounded-xl font-bold text-[12px] text-center transition-opacity active:opacity-70"
            style={{ background: "rgba(234,179,8,0.10)", border: `1px solid rgba(234,179,8,0.25)`, color: A.yellow }}>
            ⭐ Rate Operator
          </button>
        </div>
        <button onClick={onBookAgain}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${A.orange} 0%, #1447B8 100%)` }}>
          Request Again
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button onClick={onHome}
          className="w-full py-3 rounded-xl font-bold text-sm text-center transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}`, color: "#374151" }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── Screen: Rate Operator ───────────────────────────────────────────────────────

function RateDriverScreen({ onSubmit, onBack }: { onSubmit: () => void; onBack: () => void }) {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [tags, setTags] = useState<string[]>(["On Time", "Safe Driving"]);
  const allTags = ["On Time", "Safe Driving", "Professional", "Helpful", "Clean Vehicle", "Cargo Secured", "Communicative", "Would Request Again"];

  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <PageHeader title="Rate Your Operator" subtitle="Your review helps other customers" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Driver */}
        <div className="flex flex-col items-center text-center mb-5">
          <DriverAvatar size={60} />
          <h2 className="text-[16px] font-black mt-3 mb-0.5" style={{ color: "#0D1828" }}>{DRIVER.name}</h2>
          <p className="text-[11px]" style={{ color: A.mutedFg }}>{DRIVER.vehicle} · Job KG-12389</p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center mb-5">
          <p className="text-[12px] mb-3 font-semibold" style={{ color: A.mutedFg }}>How was your experience?</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setStars(n)}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill={n <= stars ? A.yellow : "rgba(0,0,0,0.08)"}
                  className="transition-all" style={{ filter: n <= stars ? "drop-shadow(0 0 6px rgba(234,179,8,0.4))" : "none" }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <p className="text-[12px] font-bold mt-2" style={{ color: "#0D1828" }}>
            {stars === 5 ? "Excellent!" : stars === 4 ? "Very Good" : stars === 3 ? "Good" : stars === 2 ? "Fair" : "Poor"}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: A.mutedFg }}>WHAT STOOD OUT? (Optional)</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map(t => {
              const active = tags.includes(t);
              return (
                <button key={t} onClick={() => setTags(active ? tags.filter(x => x !== t) : [...tags, t])}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                  style={{ background: active ? "rgba(234,179,8,0.12)" : "rgba(0,0,0,0.04)", border: `1.5px solid ${active ? A.yellow : A.border}`, color: active ? A.yellow : A.mutedFg }}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Review text */}
        <div className="mb-3">
          <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: A.mutedFg }}>WRITTEN REVIEW (Optional)</p>
          <textarea value={review} onChange={e => setReview(e.target.value)}
            placeholder="Share your experience with future customers…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-[12px] resize-none outline-none"
            style={{ background: "#FFFFFF", border: `1px solid rgba(0,0,0,0.12)`, color: "#374151" }}/>
        </div>

        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2.5" style={{ background: "#FFFFFF", borderTop: `1px solid ${A.border}` }}>
        <button onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${A.orange} 0%, #1447B8 100%)` }}>
          Submit Review
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button onClick={onBack} className="w-full py-3 rounded-xl font-bold text-sm text-center transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}`, color: "#374151" }}>
          Skip for Now
        </button>
      </div>
    </div>
  );
}

// ── Screen: E-Receipt ─────────────────────────────────────────────────────────

function EReceiptScreen({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <PageHeader title="E-Receipt" subtitle="Job KG-12389 · Completed" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Receipt card */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Header */}
          <div className="flex flex-col items-center px-4 py-5" style={{ background: "linear-gradient(180deg, rgba(29,85,214,0.06) 0%, transparent 100%)", borderBottom: `1px solid ${A.border}` }}>
            <img src={kadaGoLogo} alt="KadaGo" style={{ width: "80px", marginBottom: "8px" }} />
            <p className="text-[9px] font-black tracking-widest" style={{ color: A.mutedFg }}>OFFICIAL E-RECEIPT</p>
            <p className="text-xl font-black mt-1" style={{ color: "#0D1828" }}>₱{DRIVER.fare}.00</p>
            <p className="text-[10px] mt-0.5" style={{ color: A.green }}>✓ Payment Confirmed · {DRIVER.payment}</p>
          </div>

          {/* Details */}
          <div className="px-4 py-1">
            {[
              { label: "Receipt No.",    value: "RCP-2026-09-0042" },
              { label: "Job ID",         value: "KG-12389" },
              { label: "Date",           value: "September 5, 2026" },
              { label: "Time",           value: "3:42 PM" },
              { label: "Service",        value: "Hardware & Cement" },
              { label: "Cargo",          value: "30 Sacks of Portland Cement" },
              { label: "Pickup",         value: "ABC Hardware & Construction Depot" },
              { label: "Destination",    value: "Pinecrest Subdivision, Brgy. San Jose" },
              { label: "Driver",         value: DRIVER.name },
              { label: "Vehicle",        value: DRIVER.vehicle },
              { label: "Plate",          value: DRIVER.plate },
            ].map((r, i, arr) => (
              <div key={r.label} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${A.border}` : "none" }}>
                <span className="text-[10px] flex-shrink-0" style={{ color: A.mutedFg, minWidth: "80px" }}>{r.label}</span>
                <span className="text-[11px] font-semibold leading-snug" style={{ color: "#0D1828" }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Dotted divider */}
          <div className="mx-4 my-3 border-t-2 border-dashed" style={{ borderColor: "rgba(0,0,0,0.10)" }}/>

          {/* Total */}
          <div className="flex items-center justify-between px-4 pb-4">
            <span className="text-[13px] font-black" style={{ color: "#0D1828" }}>TOTAL PAID</span>
            <span className="text-[20px] font-black" style={{ color: A.orange }}>₱{DRIVER.fare}.00</span>
          </div>

          <div className="px-4 pb-4">
            <p className="text-center text-[9px] leading-relaxed" style={{ color: A.muted }}>
              This is an official KadaGo e-receipt. For disputes or refund requests,<br/>contact support@kadago.ph within 48 hours.
            </p>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mb-3 transition-opacity active:opacity-70"
          style={{ background: "rgba(29,85,214,0.08)", border: `1px solid rgba(29,85,214,0.25)`, color: A.blue }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download / Share Receipt
        </button>

        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${A.border}` }}>
        <button onClick={onHome}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${A.orange} 0%, #1447B8 100%)` }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── Tracking Empty State ──────────────────────────────────────────────────────

export function TrackingEmptyState({ onBook }: { onBook: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center" style={{ background: A.bg }}>
      <img src={kadaGoLogo} alt="KadaGo" style={{ width: "120px", marginBottom: "28px" }} />
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(244,123,32,0.08)", border: "1px solid rgba(244,123,32,0.2)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={A.orange} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></svg>
      </div>
      <div className="px-3 py-1.5 rounded-full mb-3" style={{ background: "rgba(100,116,139,0.10)", border: "1px solid rgba(100,116,139,0.20)" }}>
        <span className="text-[10px] font-black tracking-wider" style={{ color: A.mutedFg }}>NO ACTIVE TRIP</span>
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: "#0D1828" }}>Nothing to Track</h2>
      <p className="text-[12px] leading-relaxed mb-8" style={{ color: A.mutedFg, maxWidth: "240px" }}>
        Your current delivery or ride will appear here once you book a service.
      </p>
      <button onClick={onBook}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-opacity active:opacity-80"
        style={{ background: `linear-gradient(135deg, ${A.orange} 0%, #1447B8 100%)` }}>
        Book a Service
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
}

// ── Main ActiveJob Component ──────────────────────────────────────────────────

interface ActiveJobProps {
  onClose: () => void;
  onBookAgain: () => void;
}

export default function ActiveJob({ onClose, onBookAgain }: ActiveJobProps) {
  const [page, setPage] = useState<AJPage>("job");
  const [stage, setStage] = useState<Stage>(1);
  const [showCall, setShowCall] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  // Auto-advance to delivered screen when stage hits 6
  const advanceStage = (s: Stage) => {
    setStage(s);
    if (s === 6) setPage("delivered");
  };

  const renderPage = () => {
    switch (page) {
      case "job":
        return (
          <ActiveJobScreen
            stage={stage} setStage={advanceStage}
            onGPS={() => setPage("gps")}
            onChat={() => setPage("chat")}
            onCall={() => setShowCall(true)}
            onShare={() => setShowShare(true)}
            onSOS={() => setShowSOS(true)}
            onClose={onClose}
          />
        );
      case "gps":
        return (
          <LiveGPSScreen
            stage={stage}
            onBack={() => setPage("job")}
            onChat={() => setPage("chat")}
            onCall={() => setShowCall(true)}
            onSOS={() => setShowSOS(true)}
            onShare={() => setShowShare(true)}
          />
        );
      case "chat":
        return <ActiveJobChatScreen onBack={() => setPage("job")} onCall={() => setShowCall(true)} />;
      case "delivered":
        return (
          <DeliveredScreen
            onReceipt={() => setPage("receipt")}
            onRate={() => setPage("rate")}
            onBookAgain={onBookAgain}
            onHome={onClose}
          />
        );
      case "receipt":
        return <EReceiptScreen onBack={() => setPage("delivered")} onHome={onClose} />;
      case "rate":
        return <RateDriverScreen onSubmit={() => setPage("delivered")} onBack={() => setPage("delivered")} />;
    }
  };

  return (
    <div className="h-full flex flex-col relative" style={{ background: A.bg }}>
      {renderPage()}
      {showCall  && <div className="absolute inset-0 z-40"><CallDriverSheet  onClose={() => setShowCall(false)}  /></div>}
      {showShare && <div className="absolute inset-0 z-40"><ShareTripModal   onClose={() => setShowShare(false)} /></div>}
      {showSOS   && <div className="absolute inset-0 z-50"><SOSScreen        onClose={() => setShowSOS(false)}   /></div>}
    </div>
  );
}
