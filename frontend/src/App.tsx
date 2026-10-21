import { useEffect, useState, CSSProperties } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";
import CustomerDashboard from "@/features/customer/CustomerDashboard";
import BookingBuilder from "@/features/customer/BookingBuilder";
import type { MatchStatus } from "@/features/customer/HaulingStatus";
import { INITIAL_DISPATCH } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";
import type { CargoCategoryId } from "@/features/customer/BookingBuilder";
import RiderPortal from "@/features/operator/RiderPortal";
import AdminPortal from "@/features/admin/AdminPortal";
import FleetPortal from "@/features/fleet/FleetPortal";
import RiderSignUp from "@/features/operator/RiderSignUp";
import OperatorApplicationScreen from "@/features/operator/OperatorApplication";
import SplashScreen from "@/components/SplashScreen";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { auth } from "@/api/auth";
import type { AuthRole, AuthUser } from "@/api/auth";
import BookingProvider, { useBookings } from "@/features/customer/BookingContext";
import TruckRegistry from "@/features/fleet/TruckRegistry";

type Screen = "landing" | "login" | "face-verify" | "face-success" | "face-failed" | "dashboard" | "booking" | "rider-portal" | "admin-portal" | "fleet-portal" | "prototype-map" | "rider-signup" | "signup-select" | "customer-signup" | "operator-application";
type LoginType = AuthRole;

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  customer: "#1D55D6",
  rider: "#F47B20",
  green: "#16A34A",
  red: "#DC2626",
  yellow: "#EAB308",
  navy900: "#080F1C",
  navy800: "#0D1828",
  navy700: "#152338",
  navy600: "#1A2D45",
  navyInput: "rgba(0,0,0,0.05)",
  navyBorder: "rgba(0,0,0,0.10)",
  muted: "#64748b",
  mutedFg: "#94a3b8",
  text: "#0D1828",
};

const accent = (type: LoginType) => {
  if (type === "rider" || type === "fleet") return C.rider;
  if (type === "admin") return "#DC2626";
  return C.customer;
};

// ─── Icons ──────────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const ArrowLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const Check = ({ size = 12, sw = 3.5 }: { size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PersonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const TruckIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const PhoneLineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.2 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const EyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.mutedFg} strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.mutedFg} strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ShieldIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const RetryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);

const CameraIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ClockIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ─── Logo Components ───────────────────────────────────────────────────────────

const KadaGoLogoFull = () => (
  <img src={kadaGoLogo} alt="KadaGo" style={{ width: "260px", display: "block" }} />
);

const KadaGoLogoMini = () => (
  <img src={kadaGoLogo} alt="KadaGo" style={{ width: "90px", display: "block" }} />
);

const KadaGoLogoCompact = () => (
  <img src={kadaGoLogo} alt="KadaGo" style={{ width: "180px", display: "block" }} />
);

// ─── Shared: Screen Header ─────────────────────────────────────────────────────

const ScreenHeader = ({ onBack, showLogo = true }: { onBack: () => void; showLogo?: boolean }) => (
  <div className="flex items-center justify-between mb-5 flex-shrink-0">
    <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium transition-opacity active:opacity-60" style={{ color: C.mutedFg }}>
      <ArrowLeft /><span>Back</span>
    </button>
    {showLogo && <KadaGoLogoMini />}
  </div>
);

// ─── Shared: Checkbox ─────────────────────────────────────────────────────────

const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div
    className="flex-shrink-0 flex items-center justify-center rounded transition-all cursor-pointer"
    style={{ width: "20px", height: "20px", background: checked ? C.green : "rgba(255,255,255,0.08)", border: checked ? "none" : "1px solid rgba(255,255,255,0.22)" }}
    onClick={onChange}
  >
    {checked && <Check />}
  </div>
);

// ─── Confirmation Modal ────────────────────────────────────────────────────────

function ConfirmModal({ title, body, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, pending = false, onConfirm, onCancel }: {
  title: string; body: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean; pending?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="modal-overlay absolute inset-0 z-50 flex items-end justify-center pb-2" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}>
      <div className="modal-panel w-full mx-3 mb-6 rounded-3xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div className="px-6 py-5 text-center" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 className="text-[16px] font-black mb-2" style={{ color: "#0D1828" }}>{title}</h3>
          <p className="text-[12px] leading-relaxed" style={{ color: "#64748b" }}>{body}</p>
        </div>
        <div className="flex gap-2.5 px-5 py-4">
          <button onClick={onCancel} disabled={pending}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)", color: "#64748b" }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={pending}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity active:opacity-80"
            style={{ background: danger ? "#DC2626" : C.customer }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Prototype Map Screen ──────────────────────────────────────────────────────

function PrototypeMapScreen({ onBack }: { onBack: () => void }) {
  const portals = [
    {
      role: "Business Customer", color: "#1D55D6", icon: "👤", description: "Request trucks for heavy cargo",
      flows: [
        { section: "Request",   steps: ["Choose Cargo Category", "Hauling Details", "Submit Request", "KadaGo Review"] },
        { section: "Quotation", steps: ["Quotation Ready", "Accept Quotation", "Booking Agreement", "Deposit Record"] },
        { section: "Tracking",  steps: ["Truck Assigned", "Demo GPS", "Pickup Evidence", "Delivery Evidence"] },
        { section: "Completion", steps: ["Confirm Delivery", "Payment Record", "Completed", "Rate Operator"] },
      ],
    },
    {
      role: "Truck Operator", color: "#F47B20", icon: "🚛", description: "Assignments, hauling & earnings",
      flows: [
        { section: "Assignments", steps: ["New Assignment", "Assignment Details", "Confirm Assignment", "Confirm Rate"] },
        { section: "Agreement",   steps: ["Booking Agreement", "Upcoming Pickup", "Start Trip"] },
        { section: "Hauling",     steps: ["Arrived at Pickup", "Cargo Loaded", "In Transit", "Delivered"] },
        { section: "Completion",  steps: ["Payment Record", "Completed Booking", "Earnings", "My Reviews"] },
      ],
    },
    {
      role: "Admin / Dispatch", color: "#DC2626", icon: "🛡️", description: "Matching, monitoring & safety",
      flows: [
        { section: "Matching",   steps: ["Hauling Requests", "Review Match", "Approve Match", "Send Quotation"] },
        { section: "Operations", steps: ["Assignments", "Active Hauling", "Demo GPS", "Evidence Review"] },
        { section: "Safety",     steps: ["SOS Alert Center", "Reported Problems", "Cases", "Payment Review"] },
        { section: "Verification", steps: ["Operator Verification", "Truck Verification", "Users", "Reports"] },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFF" }}>
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)", color: "#374151" }}>
          <ArrowLeft size={14} />
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "32px", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black tracking-wider" style={{ color: "#64748b" }}>INTERNAL · PROTOTYPE</p>
          <p className="text-[13px] font-black" style={{ color: "#0D1828" }}>Flow Map — Phase 1–9</p>
        </div>
        <div className="px-2 py-1 rounded-lg flex-shrink-0" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
          <span className="text-[9px] font-black" style={{ color: "#D97706" }}>DEV ONLY</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-3">
        <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(29,85,214,0.06)", border: "1px solid rgba(29,85,214,0.15)" }}>
          <p className="text-[11px] font-semibold" style={{ color: "#1D55D6" }}>
            KadaGo — 4 portal roles · 9 build phases · Bukidnon, Philippines
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: "#64748b" }}>Use demo buttons on the landing screen to jump directly to any portal.</p>
        </div>

        {portals.map(portal => (
          <div key={portal.role} className="rounded-2xl overflow-hidden" style={{ background: "white", border: `1px solid ${portal.color}30`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `${portal.color}0D`, borderBottom: `1px solid ${portal.color}22` }}>
              <span className="text-xl">{portal.icon}</span>
              <div>
                <p className="text-[13px] font-black" style={{ color: portal.color }}>{portal.role}</p>
                <p className="text-[9px]" style={{ color: "#64748b" }}>{portal.description}</p>
              </div>
            </div>
            <div className="px-3 py-2.5 space-y-2.5">
              {portal.flows.map(flow => (
                <div key={flow.section}>
                  <p className="text-[8px] font-black tracking-widest mb-1.5" style={{ color: portal.color, opacity: 0.7 }}>{flow.section.toUpperCase()}</p>
                  <div className="flex flex-wrap items-center gap-1">
                    {flow.steps.map((step, i) => (
                      <span key={step} className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold px-2 py-1 rounded-lg" style={{ background: "white", color: "#374151", border: "1px solid rgba(0,0,0,0.08)" }}>{step}</span>
                        {i < flow.steps.length - 1 && <span className="text-[9px]" style={{ color: "#94a3b8" }}>→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="px-4 py-3.5 rounded-2xl text-center" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.18)" }}>
          <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: "#D97706" }}>⚠️ INTERNAL PROTOTYPE REFERENCE</p>
          <p className="text-[10px]" style={{ color: "#64748b" }}>This screen is for prototype navigation reference only and does not appear in the production app.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up Select Screen ────────────────────────────────────────────────────

function SignUpSelectScreen({ onBack, onCustomer, onRider, onLogin }: {
  onBack: () => void; onCustomer: () => void; onRider: () => void; onLogin: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto px-5 py-3" style={{ background: "#F8FAFF" }}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium transition-opacity active:opacity-60" style={{ color: "#64748b" }}>
          <ArrowLeft /><span>Back</span>
        </button>
        <KadaGoLogoMini />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1" style={{ color: "#0D1828" }}>Create Your KadaGo Account</h1>
        <p className="text-sm" style={{ color: "#64748b" }}>Choose your account type.</p>
      </div>

      {/* Customer card */}
      <button onClick={onCustomer} className="w-full p-5 rounded-2xl mb-4 text-left transition-all active:scale-[0.98]"
        style={{ background: "#FFFFFF", border: "2px solid #1D55D6", boxShadow: "0 2px 14px rgba(29,85,214,0.12)" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(29,85,214,0.1)" }}>
            <PersonIcon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-base font-black block mb-1" style={{ color: "#1D55D6" }}>Business Customer</span>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#374151" }}>
              For businesses that need trucks for commercial cargo and hauling.
            </p>
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1D55D6" }}>
              <PersonIcon size={14} />
              <span className="text-sm font-bold text-white">Sign Up as Business Customer</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </button>

      {/* Rider card */}
      <button onClick={onRider} className="w-full p-5 rounded-2xl mb-6 text-left transition-all active:scale-[0.98]"
        style={{ background: "#FFFFFF", border: "2px solid #F47B20", boxShadow: "0 2px 14px rgba(244,123,32,0.12)" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(244,123,32,0.1)" }}>
            <TruckIcon size={24} color="#F47B20" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-base font-black block mb-1" style={{ color: "#F47B20" }}>Truck Operator / Trucking Business</span>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#374151" }}>
              For verified operators and trucking businesses that provide hauling services.
            </p>
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#F47B20" }}>
              <TruckIcon size={14} color="white" />
              <span className="text-sm font-bold text-white">Sign Up as Truck Operator</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </button>

      <p className="text-center text-sm" style={{ color: "#64748b" }}>
        Already have an account?{" "}
        <span className="font-bold cursor-pointer" style={{ color: "#1D55D6" }} onClick={onLogin}>Log In</span>
      </p>
    </div>
  );
}

// ─── Business Customer Sign Up + Business Verification ────────────────────────

type BizPage = "register" | "verify" | "submitted" | "status";
type RegistrationType = "Sole Proprietorship" | "Corporation" | "Partnership";
type BizDocKey = "reg" | "permit" | "id";

const BUSINESS_TYPES = [
  "Agricultural Trader",
  "Construction Supplier",
  "Construction Materials Supplier",
  "Manufacturer",
  "Distributor",
  "Retail / Wholesale",
  "Logistics / Forwarding",
  "Other",
];

const bizFieldStyle: CSSProperties = {
  background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "12px",
  padding: "12px 14px", fontSize: "14px", color: "#0D1828", width: "100%", outline: "none",
};

function BizLabel({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-xs font-semibold block mb-1.5" style={{ color: "#0D1828" }}>
      {children}{!optional && " *"}
    </label>
  );
}

function BizDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-left"
        style={{ ...bizFieldStyle, border: `1px solid ${open ? C.customer : "rgba(0,0,0,0.12)"}` }}>
        <span>{value}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.customer} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl overflow-hidden overflow-y-auto" style={{ background: "white", border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", maxHeight: "220px" }}>
          {options.map(o => (
            <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-3 text-sm text-left transition-colors active:bg-blue-50"
              style={{ color: o === value ? C.customer : "#0D1828", fontWeight: o === value ? 700 : 500, background: o === value ? "rgba(29,85,214,0.07)" : "white", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              {o}{o === value && <Check size={12} sw={3} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BizProgress({ active }: { active: 1 | 2 }) {
  const labels = ["Business Account", "Business Verification"];
  return (
    <div className="flex gap-2 mb-4">
      {([1, 2] as const).map(n => {
        const state = n < active ? "done" : n === active ? "active" : "upcoming";
        const col = state === "done" ? C.green : state === "active" ? C.customer : C.mutedFg;
        return (
          <div key={n} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-full" style={{ height: "6px", background: state === "upcoming" ? "rgba(0,0,0,0.12)" : col }} />
            <span className="text-[9px] font-semibold" style={{ color: col }}>{state === "done" ? "✓ " : ""}{n}. {labels[n - 1]}</span>
          </div>
        );
      })}
    </div>
  );
}

function BizHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium transition-opacity active:opacity-60" style={{ color: "#64748b" }}>
        <ArrowLeft /><span>Back</span>
      </button>
      <KadaGoLogoMini />
    </div>
  );
}

function BizDocCard({ icon, title, note, badge, fileName, viewing, onUpload, onReplace, onView }: {
  icon: string; title: string; note: string; badge: string; fileName: string | null; viewing: boolean;
  onUpload: () => void; onReplace: () => void; onView: () => void;
}) {
  const attached = fileName !== null;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: attached ? "rgba(22,163,74,0.05)" : "white", border: `1px solid ${attached ? "rgba(22,163,74,0.25)" : "rgba(0,0,0,0.10)"}` }}>
      <div className="flex items-start gap-3 px-3.5 pt-3 pb-2.5">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <p className="text-[12px] font-bold leading-tight" style={{ color: "#0D1828" }}>{title}</p>
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-wide" style={{ background: "rgba(29,85,214,0.08)", color: C.customer }}>{badge}</span>
          </div>
          <p className="text-[10px] leading-snug" style={{ color: "#64748b" }}>{note}</p>
          {attached && <p className="text-[10px] font-semibold mt-1 truncate" style={{ color: C.green }}>✓ {fileName}</p>}
        </div>
      </div>
      <div className="flex" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        {attached ? (
          <>
            <button onClick={onView} className="flex-1 py-2 text-[11px] font-bold transition-opacity active:opacity-60" style={{ color: C.customer, borderRight: "1px solid rgba(0,0,0,0.06)" }}>{viewing ? "Hide" : "View"}</button>
            <button onClick={onReplace} className="flex-1 py-2 text-[11px] font-bold transition-opacity active:opacity-60" style={{ color: "#374151" }}>Replace</button>
          </>
        ) : (
          <button onClick={onUpload} className="flex-1 py-2 text-[11px] font-bold transition-opacity active:opacity-60" style={{ color: C.customer }}>Upload</button>
        )}
      </div>
      {viewing && attached && (
        <div className="px-3.5 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "#F8FAFF" }}>
          <div className="rounded-xl flex flex-col items-center justify-center py-5" style={{ background: "white", border: "1px dashed rgba(0,0,0,0.18)" }}>
            <span className="text-2xl mb-1">{icon}</span>
            <p className="text-[11px] font-semibold" style={{ color: "#374151" }}>{fileName}</p>
            <p className="text-[9px]" style={{ color: "#94a3b8" }}>Demo preview — no real file attached</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BusinessSignUpScreen({ onBack, onGoToLogin, onAuthenticated }: { onBack: () => void; onGoToLogin: () => void; onAuthenticated: (user: AuthUser) => void }) {
  const [page, setPage] = useState<BizPage>("register");
  const [form, setForm] = useState({
    businessName: "",
    businessType: "Agricultural Trader",
    rep: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [tried, setTried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [regType, setRegType] = useState<RegistrationType>("Sole Proprietorship");
  const [docs, setDocs] = useState<Record<BizDocKey, { on: boolean; v: number }>>({
    reg: { on: true, v: 1 }, permit: { on: true, v: 1 }, id: { on: true, v: 1 },
  });
  const [viewing, setViewing] = useState<BizDocKey | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const requiredFilled = [form.businessName, form.rep, form.phone, form.email, form.address, form.password, form.confirm].every(v => v.trim());
  const passwordOk = form.password.length >= 8;
  const matchOk = form.password === form.confirm;
  const registerOk = requiredFilled && passwordOk && matchOk;

  const isSEC = regType !== "Sole Proprietorship";
  const slug = form.businessName.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "Business";
  const baseNames: Record<BizDocKey, string> = {
    reg: `${isSEC ? "SEC_Certificate" : "DTI_Registration"}_${slug}.pdf`,
    permit: `Mayors_Permit_2026_${slug}.pdf`,
    id: `Valid_ID_${form.rep.replace(/[^A-Za-z0-9]+/g, "_")}.jpg`,
  };
  const fileFor = (k: BizDocKey) => {
    if (!docs[k].on) return null;
    const n = baseNames[k];
    return docs[k].v > 1 ? n.replace(/(\.\w+)$/, `_v${docs[k].v}$1`) : n;
  };
  const upload = (k: BizDocKey) => setDocs(d => ({ ...d, [k]: { on: true, v: 1 } }));
  const replace = (k: BizDocKey) => setDocs(d => ({ ...d, [k]: { on: true, v: d[k].v + 1 } }));
  const verifyOk = docs.reg.on && docs.id.on;

  const go = (next: BizPage) => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage(next); }, 900);
  };

  const createAccount = async () => {
    setTried(true);
    if (!registerOk || loading) return;
    setLoading(true); setRegistrationError("");
    try {
      await auth.register({ email: form.email, password: form.password, name: form.rep, role: "customer", phone: form.phone, businessName: form.businessName, businessType: form.businessType, address: form.address });
      setPage("verify");
    } catch (error) { setRegistrationError(error instanceof Error ? error.message : "Account creation failed. Please try again."); }
    finally { setLoading(false); }
  };

  const Spinner = () => <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>;

  if (page === "register") {
    return (
      <div className="h-full overflow-y-auto px-5 py-3" style={{ background: "#F8FAFF" }}>
        <BizHeader onBack={onBack} />
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.customer }} />
            <h1 className="text-xl font-bold" style={{ color: "#0D1828" }}>Create Business Customer Account</h1>
          </div>
          <p className="text-xs pl-5" style={{ color: "#64748b" }}>Register your business information to request hauling services.</p>
        </div>
        <BizProgress active={1} />

        <GoogleSignInButton role="customer" intent="signup" onSuccess={onAuthenticated} />

        <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(29,85,214,0.07)", border: "1px solid rgba(29,85,214,0.18)" }}>
          <span className="text-sm flex-shrink-0">💡</span>
          <div>
            <p className="text-[11px] font-bold" style={{ color: C.customer }}>Business Account Registration</p>
            <p className="text-[11px]" style={{ color: "#64748b" }}>Enter your business details and an email address you can access.</p>
          </div>
        </div>

        <div className="registration-fields space-y-3 mb-4">
          <div><BizLabel>Business Name</BizLabel><input value={form.businessName} onChange={set("businessName")} style={bizFieldStyle} placeholder="Business name" /></div>
          <div>
            <BizLabel>Business Type</BizLabel>
            <BizDropdown value={form.businessType} options={BUSINESS_TYPES} onChange={v => setForm(f => ({ ...f, businessType: v }))} />
          </div>
          <div><BizLabel>Owner / Authorized Representative</BizLabel><input value={form.rep} onChange={set("rep")} style={bizFieldStyle} placeholder="Full name" /></div>
          <div><BizLabel>Mobile Number</BizLabel><input value={form.phone} onChange={set("phone")} style={bizFieldStyle} type="tel" placeholder="+63 9XX XXX XXXX" /></div>
          <div><BizLabel>Email Address</BizLabel><input value={form.email} onChange={set("email")} style={bizFieldStyle} type="email" placeholder="you@business.com" /></div>
          <div><BizLabel>Business Address</BizLabel><input value={form.address} onChange={set("address")} style={bizFieldStyle} placeholder="Street, Barangay, City, Province" /></div>
          <div>
            <BizLabel>Password</BizLabel>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)" }}>
              <input value={form.password} onChange={set("password")} type={showPass ? "text" : "password"} className="flex-1 bg-transparent px-3.5 py-3 text-sm outline-none" style={{ color: "#0D1828" }} placeholder="Password (min. 8 chars)" />
              <button onClick={() => setShowPass(p => !p)} className="px-3 flex-shrink-0">{showPass ? <EyeOff /> : <EyeOn />}</button>
            </div>
          </div>
          <div>
            <BizLabel>Confirm Password</BizLabel>
            <input value={form.confirm} onChange={set("confirm")} type={showPass ? "text" : "password"} style={bizFieldStyle} placeholder="Confirm password" />
          </div>
        </div>

        {tried && !registerOk && (
          <p className="text-[11px] mb-3 px-1" style={{ color: C.red }}>
            {!requiredFilled ? "Please complete all required fields." : !passwordOk ? "Password must be at least 8 characters." : "Passwords do not match."}
          </p>
        )}

        {registrationError && <p role="alert" className="text-xs text-red-600 mb-3">{registrationError}</p>}
        <button onClick={() => { void createAccount(); }} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80 mb-4"
          style={{ background: C.customer, boxShadow: "0 4px 16px rgba(29,85,214,0.32)" }}>
          {loading ? <><Spinner /> Saving…</> : <>Continue to Business Verification <ArrowRight /></>}
        </button>
        <p className="text-center text-sm pb-2" style={{ color: "#64748b" }}>
          Already have an account?{" "}
          <span className="font-bold cursor-pointer" style={{ color: C.customer }} onClick={onGoToLogin}>Log In</span>
        </p>
      </div>
    );
  }

  if (page === "verify") {
    return (
      <div className="h-full overflow-y-auto px-5 py-3" style={{ background: "#F8FAFF" }}>
        <BizHeader onBack={() => setPage("register")} />
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.customer }} />
            <h1 className="text-xl font-bold" style={{ color: "#0D1828" }}>Business Verification</h1>
          </div>
          <p className="text-xs pl-5" style={{ color: "#64748b" }}>Upload documents that help KadaGo verify your business.</p>
        </div>
        <BizProgress active={2} />

        <div className="rounded-2xl p-3.5 mb-4" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: "#94a3b8" }}>BUSINESS SUMMARY</p>
          <p className="text-sm font-black" style={{ color: "#0D1828" }}>{form.businessName}</p>
          <p className="text-[11px] mb-2" style={{ color: C.customer }}>{form.businessType}</p>
          <div className="space-y-0.5 text-[11px]" style={{ color: "#374151" }}>
            <p>👤 {form.rep}</p>
            <p>📍 {form.address}</p>
            <p>📞 {form.phone} · ✉️ {form.email}</p>
          </div>
        </div>

        <p className="text-xs font-semibold mb-1.5" style={{ color: "#0D1828" }}>Business Registration Type *</p>
        <div className="flex gap-1.5 mb-2">
          {(["Sole Proprietorship", "Corporation", "Partnership"] as RegistrationType[]).map(t => (
            <button key={t} onClick={() => setRegType(t)} className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all"
              style={{ background: regType === t ? C.customer : "white", color: regType === t ? "white" : "#64748b", border: `1px solid ${regType === t ? C.customer : "rgba(0,0,0,0.12)"}` }}>
              {t}
            </button>
          ))}
        </div>
        <p className="text-[10px] mb-4 px-0.5" style={{ color: "#64748b" }}>
          Only one registration certificate is needed: DTI for Sole Proprietorship, SEC for Corporation / Partnership.
        </p>

        <p className="text-[9px] font-black tracking-wider mb-2" style={{ color: "#94a3b8" }}>DOCUMENTS</p>
        <div className="space-y-2.5 mb-4">
          <BizDocCard icon="📄"
            title={isSEC ? "SEC Registration Certificate" : "DTI Business Name Registration Certificate"}
            note={isSEC ? "Use for: Corporation / Partnership" : "Use for: Sole Proprietorship"}
            badge="REQUIRED" fileName={fileFor("reg")} viewing={viewing === "reg"}
            onUpload={() => upload("reg")} onReplace={() => replace("reg")} onView={() => setViewing(v => v === "reg" ? null : "reg")} />
          <BizDocCard icon="🏛️" title="Mayor’s Permit / Business Permit" note="Where applicable"
            badge="IF APPLICABLE" fileName={fileFor("permit")} viewing={viewing === "permit"}
            onUpload={() => upload("permit")} onReplace={() => replace("permit")} onView={() => setViewing(v => v === "permit" ? null : "permit")} />
          <BizDocCard icon="🪪" title="Valid ID of Owner / Authorized Representative" note="Government-issued ID with photo and signature"
            badge="REQUIRED" fileName={fileFor("id")} viewing={viewing === "id"}
            onUpload={() => upload("id")} onReplace={() => replace("id")} onView={() => setViewing(v => v === "id" ? null : "id")} />
        </div>

        {!verifyOk && (
          <p className="text-[11px] mb-3 px-1" style={{ color: C.red }}>Upload the registration certificate and a valid ID to continue.</p>
        )}

        <button onClick={() => verifyOk && go("submitted")} disabled={loading || !verifyOk}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all mb-4"
          style={{ background: C.customer, opacity: verifyOk ? 1 : 0.45, boxShadow: "0 4px 16px rgba(29,85,214,0.32)" }}>
          {loading ? <><Spinner /> Submitting…</> : <><ShieldIcon size={16} color="white" /> Submit for Verification</>}
        </button>
      </div>
    );
  }

  const steps = [
    { label: "Account Created", done: true },
    { label: "Business Details Completed", done: true },
    { label: "Documents Submitted", done: true },
    { label: "Admin Review Pending", done: false, active: true },
    { label: "Business Account Verified", done: false },
  ];

  const ProgressCard = () => (
    <div className="w-full rounded-2xl overflow-hidden mb-5 text-left" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)" }}>
        <p className="text-[9px] font-black tracking-wider" style={{ color: "#94a3b8" }}>APPLICATION PROGRESS</p>
      </div>
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < steps.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: s.done ? "rgba(22,163,74,0.12)" : s.active ? "rgba(234,179,8,0.12)" : "rgba(0,0,0,0.05)", border: `1.5px solid ${s.done ? C.green : s.active ? "#D97706" : "rgba(0,0,0,0.12)"}` }}>
            {s.done ? <Check size={10} sw={3} /> : <div className="w-2 h-2 rounded-full" style={{ background: s.active ? "#D97706" : "rgba(0,0,0,0.18)" }} />}
          </div>
          <span className="text-[12px] font-semibold" style={{ color: s.done ? C.green : s.active ? "#92400E" : "#94a3b8" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  if (page === "status") {
    const docRows: { name: string; file: string | null; optional?: boolean }[] = [
      { name: isSEC ? "SEC Registration Certificate" : "DTI Registration Certificate", file: fileFor("reg") },
      { name: "Mayor’s Permit / Business Permit", file: fileFor("permit"), optional: true },
      { name: "Valid ID of Representative", file: fileFor("id") },
    ];
    return (
      <div className="h-full overflow-y-auto px-5 py-3" style={{ background: "#F8FAFF" }}>
        <BizHeader onBack={() => setPage("submitted")} />
        <h1 className="text-xl font-bold mb-1" style={{ color: "#0D1828" }}>Verification Status</h1>
        <p className="text-xs mb-4" style={{ color: "#64748b" }}>{form.businessName} · {form.businessType}</p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 w-fit" style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D97706" }} />
          <span className="text-[10px] font-black tracking-wider" style={{ color: "#92400E" }}>PENDING REVIEW</span>
        </div>
        <ProgressCard />
        <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)" }}>
            <p className="text-[9px] font-black tracking-wider" style={{ color: "#94a3b8" }}>SUBMITTED DOCUMENTS</p>
          </div>
          {docRows.map((d, i) => (
            <div key={d.name} className="px-4 py-2.5 flex items-center justify-between gap-2" style={{ borderBottom: i < docRows.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
              <div className="min-w-0">
                <p className="text-[11px] font-bold" style={{ color: "#0D1828" }}>{d.name}</p>
                <p className="text-[10px] truncate" style={{ color: "#64748b" }}>{d.file ?? (d.optional ? "Not applicable" : "Missing")}</p>
              </div>
              <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0" style={{ background: "rgba(234,179,8,0.12)", color: "#92400E" }}>{d.file ? "In review" : "—"}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-center pb-2" style={{ color: "#64748b" }}>
          KadaGo Admin / Dispatch will review your business details. You will be notified by SMS or email once reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center px-5 pt-5 pb-6 text-center" style={{ background: "#F8FAFF" }}>
      <KadaGoLogoCompact />
      <div className="w-full my-4" style={{ height: "1px", background: "rgba(0,0,0,0.08)" }} />
      <div className="rounded-full flex items-center justify-center mb-4"
        style={{ width: "96px", height: "96px", background: "rgba(234,179,8,0.1)", border: "2px solid #EAB308", boxShadow: "0 0 32px rgba(234,179,8,0.18)", animation: "successBounce 0.6s cubic-bezier(.22,1,.36,1) forwards" }}>
        <div className="rounded-full flex items-center justify-center" style={{ width: "70px", height: "70px", background: "#EAB308" }}>
          <ClockIcon size={32} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3" style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.35)" }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FBBF24" }} />
        <span className="text-[10px] font-black tracking-wider" style={{ color: "#D97706" }}>PENDING REVIEW</span>
      </div>
      <h1 className="text-xl font-black mb-2" style={{ color: "#0D1828" }}>Business Verification Submitted</h1>
      <p className="text-[12px] leading-relaxed mb-5" style={{ color: "#64748b" }}>
        {form.businessName} has been submitted to KadaGo Admin / Dispatch for verification.
      </p>
      <ProgressCard />
      <button onClick={() => setPage("status")}
        className="w-full py-3.5 rounded-2xl font-bold text-sm text-white mb-2.5 transition-opacity active:opacity-80"
        style={{ background: C.customer }}>
        View Verification Status
      </button>
      <button onClick={onGoToLogin}
        className="w-full py-3.5 rounded-2xl font-bold text-sm transition-opacity active:opacity-70"
        style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)", color: "#374151" }}>
        Return to Login
      </button>
    </div>
  );
}

// ─── Landing Screen ────────────────────────────────────────────────────────────

interface LandingProps {
  onLoginCustomer: () => void;
  onLoginRider: () => void;
  onSignUp: () => void;
  onPortalLogin: (t: LoginType) => void;
  onAuthenticated: (user: AuthUser) => void;
}

function LandingScreen({ onLoginCustomer, onLoginRider, onSignUp, onPortalLogin, onAuthenticated }: LandingProps) {
  const portals: { label: string; icon: React.ReactNode; color: string; type: LoginType }[] = [
    { label: "Fleet Operator", icon: <span aria-hidden="true">🏢</span>, color: C.customer, type: "fleet" },
    { label: "Admin", icon: <ShieldIcon size={14} color="#DC2626" />, color: "#DC2626", type: "admin" },
  ];
  return (
    <div className="landing-screen h-full overflow-y-auto px-5 pt-3 pb-4" style={{ background: "#F0F4FF" }}>
      {/* Hero */}
      <div className="landing-hero w-full flex flex-col items-center pt-3 pb-4">
        <KadaGoLogoFull />
        <p className="text-[13px] font-bold text-center mt-1" style={{ color: "#0D1828" }}>
          B2B Heavy Hauling &amp; Cargo Logistics
        </p>
        <p className="text-[11px] text-center mt-0.5" style={{ color: "#64748b" }}>
          Connecting businesses with verified truck operators through KadaGo.
        </p>
      </div>

      <div className="landing-actions">
      <button onClick={onLoginCustomer} className="w-full min-h-[52px] py-4 px-4 rounded-2xl font-bold text-white text-[13px] leading-none flex items-center justify-center gap-2 mb-3 transition-opacity active:opacity-80"
        style={{ background: C.customer, boxShadow: "0 4px 16px rgba(29,85,214,0.32)" }}>
        <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center"><PersonIcon size={18} /></span><span>Customer</span>
      </button>
      <button onClick={onLoginRider} className="w-full min-h-[52px] py-4 px-4 rounded-2xl font-bold text-white text-[13px] leading-none flex items-center justify-center gap-2 mb-3 transition-opacity active:opacity-80"
        style={{ background: C.rider, boxShadow: "0 4px 16px rgba(244,123,32,0.32)" }}>
        <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center"><TruckIcon size={18} /></span><span>Driver</span>
      </button>
      <GoogleSignInButton role="auto" onSuccess={onAuthenticated} />

      <div className="w-full mb-5">
        <div className="grid grid-cols-2 gap-2">
          {portals.map((d) => (
            <button key={d.label}
              onClick={() => onPortalLogin(d.type)}
              className="py-3 px-2 rounded-xl text-xs leading-none font-semibold flex items-center justify-center gap-1.5 transition-opacity active:opacity-60"
              style={{ background: "white", border: `1.5px solid ${d.color}40`, color: d.color, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">{d.icon}</span><span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between w-full mb-1">
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          New to KadaGo?{" "}
          <button className="font-semibold" style={{ color: C.customer }} onClick={onSignUp}>Sign Up</button>
        </p>
      </div>
      </div>
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────────

interface LoginProps {
  loginType: LoginType;
  onBack: () => void;
  onOpenTerms: () => void;
  onSubmit: (user: AuthUser) => void;
  onSwitchType: (t: LoginType) => void;
}

function LoginScreen({ loginType, onBack, onOpenTerms, onSubmit }: LoginProps) {
  const isCustomer = loginType === "customer";
  const isFleet = loginType === "fleet";
  const isAdmin = loginType === "admin";
  const [selectedInputMode, setInputMode] = useState<"phone" | "email">("email");
  const inputMode = isFleet ? "email" : selectedInputMode;
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ phone: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const ac = accent(loginType);

  const lightBg = isCustomer ? "#F0F4FF" : "#FFF8F2";
  const textCol = "#0D1828";
  const mutedCol = "#64748b";
  const inputBg = "white";
  const borderCol = "rgba(0,0,0,0.12)";
  const inputBase: CSSProperties = { background: inputBg, border: `1px solid ${borderCol}` };

  const phoneValid = inputMode === "phone" ? phone.replace(/\D/g, "").length >= 9 : phone.includes("@") && phone.includes(".");
  const passwordValid = password.length > 0;
  const canSubmit = phoneValid && passwordValid;

  const handleSubmit = async () => {
    setTouched({ phone: true, password: true });
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setLoginError("");
    try { const { user } = await auth.login(phone, password, loginType); onSubmit(user); }
    catch (error) { setLoginError(error instanceof Error ? error.message : "Login failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-3" style={{ background: lightBg }}>
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium transition-opacity active:opacity-60" style={{ color: mutedCol }}>
          <ArrowLeft /><span>Back</span>
        </button>
        <KadaGoLogoMini />
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: isCustomer ? "#3B82F6" : "#FB923C" }}/>
          <h1 className="text-xl font-bold" style={{ color: textCol }}>
            {isCustomer ? "Log In as Business Customer" : isAdmin ? "Admin Command Login" : isFleet ? "Fleet Login" : "Truck Operator Login"}
          </h1>
        </div>
        <p className="text-xs pl-5" style={{ color: mutedCol }}>
          {isCustomer ? "Enter your account details to continue." : "Enter your credentials. Identity verification will follow."}
        </p>
      </div>

      <p className="text-xs mb-4" style={{ color: mutedCol }}>{isFleet ? "Use your fleet account email address and password." : isAdmin ? "Use your administrator email address and password." : "Use the email address or mobile number registered to your account."}</p>
      {!isAdmin && !isFleet && <>
      <GoogleSignInButton role={loginType} onSuccess={onSubmit} />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }}/>
        <span className="text-[10px] font-semibold tracking-widest" style={{ color: "#94a3b8" }}>OR WITH CREDENTIALS</span>
        <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }}/>
      </div>
      </>}

      {/* Phone / Email */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold" style={{ color: textCol }}>{inputMode === "phone" ? "Mobile Number *" : "Email Address *"}</label>
          {!isAdmin && !isFleet && <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${borderCol}` }}>
            {(["phone", "email"] as const).map((m) => (
              <button key={m} onClick={() => { setInputMode(m); setPhone(m === "email" ? (isCustomer ? "customer@kadago.demo" : "operator@kadago.demo") : (isCustomer ? "" : "918 444 8821")); }} className="px-2.5 py-1 text-[10px] font-semibold transition-all"
                style={{ background: inputMode === m ? ac : "transparent", color: inputMode === m ? "white" : mutedCol }}>
                {m === "phone" ? "Phone #" : "Email"}
              </button>
            ))}
          </div>}
        </div>
        <div className="flex items-center rounded-xl overflow-hidden" style={{ ...inputBase, border: `1px solid ${touched.phone && !phoneValid ? "rgba(220,38,38,0.5)" : borderCol}` }}>
          {inputMode === "phone" ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-3.5 flex-shrink-0" style={{ borderRight: `1px solid ${borderCol}` }}>
                <PhoneLineIcon /><span className="text-sm font-semibold" style={{ color: textCol }}>+63</span>
              </div>
              <input type="tel" placeholder={isCustomer ? "917 555 0192" : "918 444 8821"} value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => setTouched(t => ({ ...t, phone: true }))} className="flex-1 bg-transparent px-3 py-3.5 text-sm outline-none" style={{ color: textCol }}/>
            </>
          ) : (
            <>
              <div className="px-3 py-3.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mutedCol} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <input type="email" placeholder="you@example.com" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => setTouched(t => ({ ...t, phone: true }))} className="flex-1 bg-transparent px-3 py-3.5 text-sm outline-none" style={{ color: textCol }}/>
            </>
          )}
        </div>
        {touched.phone && !phoneValid && (
          <p className="text-[10px] mt-1 pl-1" style={{ color: "#f87171" }}>
            {inputMode === "phone" ? "Please enter a valid Philippine mobile number." : "Please enter a valid email address."}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="text-xs font-semibold block mb-1.5" style={{ color: textCol }}>Password *</label>
        <div className="flex items-center rounded-xl" style={{ ...inputBase, border: `1px solid ${touched.password && !passwordValid ? "rgba(220,38,38,0.5)" : borderCol}` }}>
          <div className="px-3 py-3.5"><LockIcon /></div>
          <input type={showPass ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, password: true }))} className="flex-1 bg-transparent py-3.5 text-sm outline-none" style={{ color: textCol }}/>
          <button onClick={() => setShowPass(!showPass)} className="px-3 py-3.5 transition-opacity active:opacity-60">
            {showPass ? <EyeOff /> : <EyeOn />}
          </button>
        </div>
        {touched.password && !passwordValid && (
          <p className="text-[10px] mt-1 pl-1" style={{ color: "#f87171" }}>Enter your password.</p>
        )}
      </div>

      {loginError && <p role="alert" className="text-xs text-red-600 mb-3">{loginError}</p>}
      <button onClick={() => { void handleSubmit(); }} disabled={isLoading}
        className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
        style={{ background: ac, opacity: canSubmit && !isLoading ? 1 : 0.5, cursor: canSubmit && !isLoading ? "pointer" : "not-allowed", boxShadow: `0 4px 16px ${ac}40` }}>
        {isLoading ? (
          <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Logging in…</>
        ) : (
          <>{isFleet ? "Log In" : isCustomer ? "Log In & Continue" : "Log In & Verify Identity"} <ArrowRight /></>
        )}
      </button>

      {isCustomer && (
        <button onClick={() => { onOpenTerms(); }} className="w-full text-center text-[11px] mt-3 transition-opacity active:opacity-60" style={{ color: mutedCol }}>
          View Terms &amp; Conditions
        </button>
      )}
    </div>
  );
}

// ─── Login Terms Modal ────────────────────────────────────────────────────────

const customerTermsSections = [
  { num: "01", title: "Acceptance of Terms", body: "By using KadaGo, the Business Customer agrees to the platform rules, safety policies, and applicable hauling requirements." },
  { num: "02", title: "Accurate Hauling Information", body: "Customers must provide correct cargo description, weight, quantity, pickup, destination, and schedule details." },
  { num: "03", title: "KadaGo Matching & Assignment", body: "KadaGo reviews hauling requests and coordinates the assignment of a suitable verified truck and operator." },
  { num: "04", title: "Quotation Approval", body: "KadaGo will present the proposed hauling rate to the customer for approval before booking confirmation." },
  { num: "05", title: "Cargo Safety", body: "Cargo must comply with the verified truck capacity and applicable safety requirements." },
  { num: "06", title: "Delivery & Issue Reporting", body: "Customers may track booking progress, confirm delivery, and report hauling problems through KadaGo." },
];

const riderTermsSections = [
  { num: "01", title: "Accurate Operator Information", body: "Truck Operators and Trucking Businesses must provide true and complete registration details. Misrepresentation may lead to rejection or removal from the platform." },
  { num: "02", title: "Valid License & Truck Documents", body: "A valid professional driver's license, LTO OR/CR, insurance, and clearances must be kept current. Expired or invalid documents may result in suspension." },
  { num: "03", title: "Truck Capacity & Safety", body: "Trucks must be roadworthy and loaded within the verified maximum payload. Overloading and unsafe cargo handling are not permitted." },
  { num: "04", title: "KadaGo Assignment Process", body: "Truck Operators receive hauling assignments from KadaGo. KadaGo Admin / Dispatch reviews requests, matches a suitable verified truck, and coordinates the rate." },
  { num: "05", title: "Assignment Confirmation / Decline", body: "Operators will be asked to confirm or decline each assignment sent to them. Repeated late declines or cancellations may affect account standing." },
  { num: "06", title: "GPS During Active Hauling", body: "Location sharing must remain on while a hauling assignment is active so KadaGo and the customer can monitor progress." },
  { num: "07", title: "Pickup & Delivery Status Updates", body: "Operators must update pickup, in-transit, and delivery status promptly and accurately in the app." },
  { num: "08", title: "Proof of Pickup / Delivery", body: "Operators must capture proof of pickup and proof of delivery, such as cargo photos or recipient confirmation, for every assignment." },
  { num: "09", title: "SOS & Safety Reporting", body: "Operators must report accidents, breakdowns, cargo incidents, and safety concerns immediately. The SOS feature is for genuine emergencies only." },
];

function LoginTermsModal({ loginType, onAgree, onCancel }: { loginType: LoginType; onAgree: () => void; onCancel: () => void }) {
  const [checked, setChecked] = useState(false);
  const isCustomer = loginType === "customer";
  const ac = isCustomer ? "#1D55D6" : "#F47B20";
  const acLight = isCustomer ? "rgba(29,85,214,0.08)" : "rgba(244,123,32,0.08)";
  const acBorder = isCustomer ? "rgba(29,85,214,0.22)" : "rgba(244,123,32,0.22)";
  const sections = isCustomer ? customerTermsSections : riderTermsSections;
  const subtitle = isCustomer ? "KadaGo Business Customer Platform Access" : "KadaGo Truck Operator / Trucking Business Platform Access";
  const message = isCustomer
    ? "Before continuing, please review and accept KadaGo's Terms & Conditions, Safety Policies, and hauling requirements."
    : "Truck Operators receive hauling assignments from KadaGo. Before continuing, please review and accept KadaGo's Operating Policies, Safety Rules, and Hauling Guidelines.";
  const checkLabel = isCustomer
    ? "I have read and agree to the Business Customer Terms & Conditions"
    : "I have read and agree to the Truck Operator Terms, Operating Policies, Safety Rules & Hauling Guidelines";

  return (
    <div className="modal-overlay absolute inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="modal-panel w-full flex flex-col rounded-3xl overflow-hidden" style={{ background: "white", maxHeight: "88%", boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ac }}>
                <ShieldIcon size={20} color="white" />
              </div>
              <div>
                <h2 className="text-sm font-black leading-tight" style={{ color: "#0D1828" }}>Terms &amp; Conditions Agreement</h2>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: "#64748b" }}>{subtitle}</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-1.5 rounded-lg transition-opacity active:opacity-60 flex-shrink-0" style={{ background: "rgba(0,0,0,0.06)" }}>
              <XIcon size={16} />
            </button>
          </div>
          <div className="px-3 py-2.5 rounded-xl" style={{ background: acLight, border: `1px solid ${acBorder}` }}>
            <p className="text-[11px] leading-relaxed" style={{ color: "#374151" }}>{message}</p>
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
          {sections.map((s) => (
            <div key={s.num} className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="flex items-center gap-2.5 px-3.5 py-2" style={{ background: acLight }}>
                <span className="text-[10px] font-black tabular-nums" style={{ color: ac }}>{s.num}</span>
                <h3 className="text-[11px] font-bold" style={{ color: "#0D1828" }}>{s.title}</h3>
              </div>
              <div className="px-3.5 py-2.5">
                <p className="text-[11px] leading-relaxed" style={{ color: "#374151" }}>{s.body}</p>
              </div>
            </div>
          ))}
          <div className="h-1" />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pt-3 pb-5" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
          <button onClick={() => setChecked(c => !c)} className="flex items-start gap-3 w-full text-left mb-4 transition-opacity active:opacity-70">
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
              style={{ background: checked ? ac : "white", border: `2px solid ${checked ? ac : "rgba(0,0,0,0.2)"}` }}>
              {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
            </div>
            <span className="text-[11px] leading-relaxed font-medium" style={{ color: "#374151" }}>{checkLabel}</span>
          </button>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.12)", color: "#374151" }}>
              Cancel
            </button>
            <button onClick={onAgree} disabled={!checked}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: ac, opacity: checked ? 1 : 0.35, cursor: checked ? "pointer" : "not-allowed", boxShadow: checked ? `0 4px 14px ${ac}50` : "none" }}>
              I Agree &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Face Verify Screen ────────────────────────────────────────────────────────

interface FaceVerifyProps {
  loginType: LoginType;
  attempts: number;
  onSuccess: () => void;
  onFail: () => void;
  onBack: () => void;
}

function FaceVerifyScreen({ loginType, attempts, onSuccess, onFail, onBack }: FaceVerifyProps) {
  const [isScanning, setIsScanning] = useState(false);
  const ac = accent(loginType);
  const scanColor = isScanning ? "#00D4FF" : ac;

  const handleVerify = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => { setIsScanning(false); onSuccess(); }, 2800);
  };

  const cornerStyles: CSSProperties[] = [
    { top: 14, left: 14, borderTop: `2.5px solid ${scanColor}`, borderLeft: `2.5px solid ${scanColor}`, borderRadius: "6px 0 0 0" },
    { top: 14, right: 14, borderTop: `2.5px solid ${scanColor}`, borderRight: `2.5px solid ${scanColor}`, borderRadius: "0 6px 0 0" },
    { bottom: 14, left: 14, borderBottom: `2.5px solid ${scanColor}`, borderLeft: `2.5px solid ${scanColor}`, borderRadius: "0 0 0 6px" },
    { bottom: 14, right: 14, borderBottom: `2.5px solid ${scanColor}`, borderRight: `2.5px solid ${scanColor}`, borderRadius: "0 0 6px 0" },
  ];

  const landmarks = [
    { top: "27%", left: "31%" }, { top: "27%", left: "66%" },
    { top: "44%", left: "49%" },
    { top: "57%", left: "34%" }, { top: "57%", left: "63%" },
    { top: "65%", left: "42%" }, { top: "65%", left: "56%" },
  ];

  const instructions = [
    { icon: "🎯", text: "Position your face inside the frame" },
    { icon: "👁️", text: "Look directly at the camera" },
    { icon: "🚫", text: "Remove sunglasses or face coverings" },
  ];

  return (
    <div className="h-full overflow-y-auto px-5 py-3 flex flex-col" style={{ background: "#F8FAFF" }}>
      <ScreenHeader onBack={onBack} />

      {/* Title block */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ac}22`, border: `1px solid ${ac}44` }}>
            <CameraIcon size={16} />
          </div>
          <h1 className="text-lg font-bold" style={{ color: "#0D1828" }}>Identity Verification</h1>
        </div>
        <p className="text-[12px] leading-relaxed pl-10" style={{ color: C.muted }}>
          {loginType === "customer" || loginType === "fleet" ? "Capture a clear face photo so KadaGo can verify the registered business representative." : "Capture a clear face photo so KadaGo can verify the registered operator."}
        </p>
        <p className="text-[11px] leading-relaxed mt-2 text-amber-700">Prototype preview: this animation does not perform face matching.</p>
      </div>

      {/* Camera preview */}
      <div className="relative flex items-center justify-center mb-4 flex-shrink-0 rounded-3xl overflow-hidden"
        style={{ height: "280px", background: "linear-gradient(160deg, #030C1A 0%, #050E20 100%)", border: `1px solid rgba(255,255,255,0.07)` }}>
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${scanColor}08 1px, transparent 1px), linear-gradient(90deg, ${scanColor}08 1px, transparent 1px)`, backgroundSize: "28px 28px" }}/>

        {/* Oval guide */}
        <div style={{
          width: "178px", height: "224px", borderRadius: "50%",
          border: `2px solid ${scanColor}`,
          boxShadow: isScanning ? `0 0 28px rgba(0,212,255,0.22), inset 0 0 18px rgba(0,212,255,0.05)` : `0 0 14px ${ac}55`,
          position: "relative", overflow: "hidden",
          transition: "border-color 0.3s, box-shadow 0.3s",
          animation: isScanning ? "none" : "pulseOval 2.2s ease-in-out infinite",
        }}>
          {/* Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="100" height="128" viewBox="0 0 100 128" fill="none">
              <ellipse cx="50" cy="45" rx="29" ry="35" fill="white" opacity="0.05"/>
              <path d="M12 128 Q12 82 50 82 Q88 82 88 128" fill="white" opacity="0.05"/>
            </svg>
          </div>
          {/* Scan line */}
          {isScanning && (
            <div className="absolute left-0 right-0" style={{ height: "2px", background: "linear-gradient(90deg, transparent, #00D4FF, transparent)", boxShadow: "0 0 12px rgba(0,212,255,0.9)", animation: "scanLine 1.7s linear infinite", top: "5%" }}/>
          )}
          {/* Landmarks */}
          {isScanning && landmarks.map((p, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: "6px", height: "6px", top: p.top, left: p.left, background: "#00D4FF", boxShadow: "0 0 6px rgba(0,212,255,0.9)", animation: `livenessBlip ${0.5 + i * 0.12}s ease-in-out infinite` }}/>
          ))}
        </div>

        {/* Corner brackets */}
        {cornerStyles.map((s, i) => (
          <div key={i} className="absolute" style={{ width: "26px", height: "26px", transition: "border-color 0.3s", ...s }}/>
        ))}

        {/* Status chip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
          style={{ background: isScanning ? "rgba(0,0,0,0.8)" : "white", border: `1px solid ${isScanning ? "rgba(0,212,255,0.4)" : "rgba(0,0,0,0.12)"}`, color: isScanning ? "#00D4FF" : "#374151", backdropFilter: "blur(8px)", transition: "all 0.3s" }}>
          {isScanning ? "🔄 Scanning... hold still" : "📸 Camera ready"}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2 mb-4 flex-shrink-0">
        {instructions.map((item) => (
          <div key={item.text} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: "white", border: `1px solid rgba(0,0,0,0.08)` }}>
            <span className="text-base flex-shrink-0">{item.icon}</span>
            <span className="text-[12px] font-medium" style={{ color: "#374151" }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Liveness + Attempt */}
      <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "#0D1828" }}>Liveness Check</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-full" style={{ width: "7px", height: "7px", background: isScanning ? "#00D4FF" : ac, opacity: isScanning ? 1 : 0.3, animation: isScanning ? `livenessBlip ${0.55 + i * 0.2}s ease-in-out infinite` : "none", transition: "background 0.3s" }}/>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-full" style={{ width: "8px", height: "8px", background: n <= attempts ? C.red : ac, opacity: n <= attempts ? 1 : 0.35 }}/>
          ))}
          <span className="text-xs font-semibold ml-1" style={{ color: C.muted }}>Attempt {attempts + 1} of 3</span>
        </div>
      </div>

      {/* Verify button */}
      <button onClick={handleVerify} disabled={isScanning} className="w-full py-4 rounded-2xl font-bold text-white text-sm mb-2 transition-all flex-shrink-0"
        style={{ background: isScanning ? `${ac}50` : ac, cursor: isScanning ? "default" : "pointer" }}>
        {isScanning ? "Verifying..." : "Verify My Face"}
      </button>

      <button onClick={onFail} className="w-full py-2 text-xs transition-opacity active:opacity-50 flex-shrink-0" style={{ color: "#94a3b8" }}>
        Demo: Simulate Failure
      </button>
    </div>
  );
}

// ─── Verification Success Screen ───────────────────────────────────────────────

function FaceSuccessScreen({ loginType, onContinue }: { loginType: LoginType; onContinue: () => void }) {
  const ac = accent(loginType);
  const badges = ["Face Match Confirmed", "Liveness Check Passed", "Identity Authenticated"];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center" style={{ background: "#F8FAFF" }}>
      {/* Success ring */}
      <div className="rounded-full flex items-center justify-center mb-6"
        style={{ width: "116px", height: "116px", background: "rgba(22,163,74,0.12)", border: "2px solid #16A34A", boxShadow: "0 0 44px rgba(22,163,74,0.3)", animation: "successBounce 0.65s cubic-bezier(.22,1,.36,1) forwards" }}>
        <div className="rounded-full flex items-center justify-center" style={{ width: "82px", height: "82px", background: C.green }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-black mb-2" style={{ color: "#0D1828", animation: "fadeInUp 0.5s 0.3s both" }}>
        Identity Verified
      </h1>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "#64748b", animation: "fadeInUp 0.5s 0.4s both" }}>
        Your identity has been successfully verified.<br/>
        You are now cleared to access KadaGo.
      </p>

      <div className="flex flex-col gap-2 mb-8 w-full max-w-xs" style={{ animation: "fadeInUp 0.5s 0.5s both" }}>
        {badges.map((b) => (
          <div key={b} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)" }}>
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: "20px", height: "20px", background: C.green }}>
              <Check size={10} sw={3} />
            </div>
            <span className="text-sm font-medium text-left" style={{ color: "#16A34A" }}>{b}</span>
          </div>
        ))}
      </div>

      <button onClick={onContinue} className="w-full max-w-xs py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80"
        style={{ background: ac, animation: "fadeInUp 0.5s 0.6s both" }}>
        Continue to KadaGo <ArrowRight />
      </button>
    </div>
  );
}

// ─── Verification Failed Screen ────────────────────────────────────────────────

interface FaceFailedProps {
  loginType: LoginType;
  attempts: number;
  onTryAgain: () => void;
  onReturnToLogin: () => void;
}

function FaceFailedScreen({ loginType, attempts, onTryAgain, onReturnToLogin }: FaceFailedProps) {
  const isUnderReview = attempts >= 3;
  const remaining = 3 - attempts;
  const ac = accent(loginType);

  if (isUnderReview) {
    return (
      <div className="h-full overflow-y-auto flex flex-col items-center px-6 pt-5 pb-6 text-center" style={{ background: "#F8FAFF" }}>
        {/* Logo */}
        <KadaGoLogoCompact />

        {/* Divider */}
        <div className="w-full my-5" style={{ height: "1px", background: "rgba(0,0,0,0.08)" }}/>

        {/* Icon */}
        <div className="rounded-full flex items-center justify-center mb-4"
          style={{ width: "100px", height: "100px", background: "rgba(234,179,8,0.1)", border: "2px solid #EAB308", boxShadow: "0 0 36px rgba(234,179,8,0.2)", animation: "successBounce 0.55s cubic-bezier(.22,1,.36,1) forwards" }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: "72px", height: "72px", background: "#EAB308" }}>
            <ClockIcon size={34} />
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3" style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.35)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FBBF24" }}/>
          <span className="text-[10px] font-black tracking-wider" style={{ color: "#D97706" }}>PENDING ADMINISTRATIVE REVIEW</span>
        </div>

        <h1 className="text-xl font-black mb-3" style={{ color: "#0D1828" }}>Verification Under Review</h1>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "#374151" }}>
          You have reached the maximum number of identity verification attempts. Your account has been sent to KadaGo Admin for review.
        </p>

        {/* Supporting text card */}
        <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ background: "white", border: "1px solid rgba(234,179,8,0.3)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: "rgba(234,179,8,0.08)" }}>
            <span className="text-base">📋</span>
            <span className="text-xs font-bold" style={{ color: "#D97706" }}>What happens next</span>
          </div>
          <div className="px-4 py-3.5 space-y-3">
            {[
              { n: "1", t: "Our admin team will review your submitted information" },
              { n: "2", t: "You will receive an SMS or email notification within 24–48 hours" },
              { n: "3", t: "If approved, you may log in and retry verification" },
              { n: "4", t: "For urgent help, contact support@kadago.ph" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-2.5">
                <div className="rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ width: "18px", height: "18px", background: "rgba(234,179,8,0.18)", border: "1px solid rgba(234,179,8,0.35)" }}>
                  <span className="text-[9px] font-black" style={{ color: "#D97706" }}>{s.n}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-left" style={{ color: "#374151" }}>{s.t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting text */}
        <p className="text-xs leading-relaxed mb-6 px-2" style={{ color: "#64748b" }}>
          You will be notified once your verification has been reviewed.
        </p>

        <button onClick={onReturnToLogin}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.10)", color: "#374151" }}>
          <ArrowLeft size={16} /> Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center px-6 pt-5 pb-6 text-center" style={{ background: "#F8FAFF" }}>
      {/* Logo */}
      <KadaGoLogoCompact />

      {/* Divider */}
      <div className="w-full my-5" style={{ height: "1px", background: "rgba(0,0,0,0.08)" }}/>

      {/* Failed icon */}
      <div className="rounded-full flex items-center justify-center mb-4"
        style={{ width: "100px", height: "100px", background: "rgba(220,38,38,0.1)", border: "2px solid #DC2626", boxShadow: "0 0 36px rgba(220,38,38,0.2)", animation: "successBounce 0.55s cubic-bezier(.22,1,.36,1) forwards" }}>
        <div className="rounded-full flex items-center justify-center" style={{ width: "72px", height: "72px", background: C.red }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      </div>

      <h1 className="text-xl font-black mb-2" style={{ color: "#0D1828" }}>Identity Verification Failed</h1>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "#374151" }}>
        We could not verify your identity. Please try again.
      </p>

      {/* Attempts remaining */}
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-4"
        style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.22)" }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-full" style={{ width: "10px", height: "10px", background: n <= attempts ? C.red : "rgba(0,0,0,0.15)" }}/>
            ))}
          </div>
          <span className="text-sm font-bold" style={{ color: "#DC2626" }}>
            {remaining} attempt{remaining !== 1 ? "s" : ""} remaining
          </span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
          {attempts}/3
        </span>
      </div>

      {/* Tips */}
      <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.03)" }}>
          <span className="text-sm">💡</span>
          <p className="text-xs font-bold" style={{ color: "#0D1828" }}>Tips to improve verification</p>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {[
            { icon: "☀️", text: "Move to a well-lit area, avoid backlighting" },
            { icon: "📱", text: "Hold your device steady at eye level" },
            { icon: "😶", text: "Remove face coverings, glasses, or hats" },
            { icon: "🔍", text: "Clean the front camera lens" },
          ].map((tip) => (
            <div key={tip.text} className="flex items-center gap-2.5">
              <span className="text-sm flex-shrink-0">{tip.icon}</span>
              <p className="text-[11px] text-left" style={{ color: "#374151" }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onTryAgain}
        className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80 mb-3"
        style={{ background: ac }}>
        <RetryIcon /> Try Again
      </button>
      <button onClick={onReturnToLogin}
        className="w-full py-3 text-sm font-medium transition-opacity active:opacity-60"
        style={{ color: "#64748b" }}>
        Return to Login
      </button>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("landing");
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("review");
  const [dispatch, setDispatch] = useState<Dispatch>(INITIAL_DISPATCH);
  const dispatchState: Dispatch = { ...dispatch, status: matchStatus };
  const updateDispatch = (patch: Partial<Dispatch>) => {
    if (patch.status) setMatchStatus(patch.status);
    setDispatch((d) => ({ ...d, ...patch }));
  };
  const [bookingCategory, setBookingCategory] = useState<CargoCategoryId>("construction");
  const [loginType, setLoginType] = useState<LoginType>("customer");
  const [showTerms, setShowTerms] = useState(false);
  const [faceAttempts, setFaceAttempts] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginTerms, setShowLoginTerms] = useState(false);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 1800);
    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    let active = true;
    void auth.session().then(({ user }) => {
      if (!active || !user) return;
      setAuthUser(user); setLoginType(user.role);
      setScreen(user.role === "fleet" && user.verificationStatus !== "approved" ? "operator-application" : user.role === "admin" ? "admin-portal" : user.role === "fleet" ? "fleet-portal" : user.role === "rider" ? "rider-portal" : "dashboard");
    }).catch(() => { /* Login remains available if the account service is offline. */ });
    return () => { active = false; };
  }, []);

  const doLogout = async (destination: Screen = "landing") => {
    if (loggingOut) return;
    setLoggingOut(true); setAuthError("");
    try {
      await auth.logout();
      setAuthUser(null); setScreen(destination); setFaceAttempts(0); setShowLogoutConfirm(false);
      try { window.google?.accounts.id.disableAutoSelect(); } catch { /* The server session is already revoked. */ }
    } catch (error) { setShowLogoutConfirm(false); setAuthError(error instanceof Error ? error.message : "Logout failed. Please try again."); }
    finally { setLoggingOut(false); }
  };
  const requestLogout = () => setShowLogoutConfirm(true);

  const handlePortalLogin = (t: LoginType) => {
    setLoginType(t);
    setScreen("login");
  };

  const openTerms = () => setShowTerms(true);

  const handleLoginSubmit = (user: AuthUser) => {
    setAuthUser(user); setLoginType(user.role);
    if (user.role === "fleet" && user.verificationStatus !== "approved") {
      setScreen("operator-application");
      return;
    }
    setShowLoginTerms(true);
  };

  const handleLoginTermsAgree = () => {
    setShowLoginTerms(false);
    setScreen("face-verify");
  };

  const handleLoginTermsCancel = () => {
    setShowLoginTerms(false);
    void doLogout();
  };

  const handleFaceSuccess = () => setScreen("face-success");
  const handleFaceFail = () => { setFaceAttempts((n) => n + 1); setScreen("face-failed"); };
  const handleTryAgain = () => setScreen("face-verify");

  const handleReturnToLogin = () => {
    setScreen("login");
    setFaceAttempts(0);
  };

  const handleContinueFromSuccess = () => {
    if (!authUser) { setScreen("login"); return; }
    if (authUser.role === "rider") setScreen("rider-portal");
    else if (authUser.role === "fleet") setScreen("fleet-portal");
    else if (authUser.role === "admin") setScreen("admin-portal");
    else setScreen("dashboard");
    setFaceAttempts(0);
  };

  const isPortal = screen === "dashboard" || screen === "rider-portal" || screen === "admin-portal" || screen === "fleet-portal";
  const isForm = screen === "booking" || screen === "rider-signup" || screen === "customer-signup" || screen === "operator-application";

  if (showSplash) return <SplashScreen />;

  const authenticatedScreen = authUser && (isPortal || screen === "booking");

  return (
    <div className="app-shell app-shell--welcome-enter">
      <div className="app-frame" data-screen={screen}>
        {authError && <div role="alert" className="flex items-center justify-between gap-3 px-4 py-2 bg-red-50 text-red-700 text-xs"><p>{authError}</p><button onClick={() => setAuthError("")}>Dismiss</button></div>}
        <div className={`app-content ${isPortal || screen === "prototype-map" ? "" : isForm ? "app-content--form" : "app-content--auth"}`}>
          {authenticatedScreen ? (
            <BookingProvider user={authUser}>
              <AuthenticatedExperience user={authUser} screen={screen} category={bookingCategory} setCategory={setBookingCategory} setScreen={setScreen} onLogout={requestLogout} />
            </BookingProvider>
          ) : <>
          {screen === "operator-application" && authUser && <OperatorApplicationScreen user={authUser} onLogout={() => { void doLogout("login"); }} onApproved={(user) => { setAuthUser(user); setLoginType(user.role); setScreen(user.role === "fleet" ? "fleet-portal" : "rider-portal"); }} />}
          {screen === "dashboard" && (
            <CustomerDashboard
              onLogout={requestLogout}
              onBooking={(c) => { setBookingCategory(c ?? "construction"); setScreen("booking"); }}
              matchStatus={matchStatus}
              matchIdx={dispatch.matchIdx}
              onMatchStatus={setMatchStatus}
              dispatch={dispatchState}
              onDispatch={updateDispatch}
            />
          )}
          {screen === "booking" && (
            <BookingBuilder key={bookingCategory} initialCategory={bookingCategory} status={matchStatus} matchIdx={dispatch.matchIdx} onStatus={setMatchStatus} onSubmitted={() => {}} onClose={() => setScreen("dashboard")} />
          )}
          {screen === "rider-portal" && (
            <RiderPortal onLogout={requestLogout} dispatch={dispatchState} onDispatch={updateDispatch} />
          )}
          {screen === "admin-portal" && (
            <AdminPortal onLogout={requestLogout} dispatch={dispatchState} onDispatch={updateDispatch} />
          )}
          {screen === "fleet-portal" && (
            <FleetPortal onLogout={requestLogout} />
          )}
          {screen === "prototype-map" && (
            <PrototypeMapScreen onBack={() => setScreen("landing")} />
          )}
          {screen === "rider-signup" && (
            <RiderSignUp
              onBack={() => setScreen("landing")}
              onGoToLogin={(accountType) => { setLoginType(accountType === "business" ? "fleet" : "rider"); setScreen("login"); }}
              onOpenTerms={() => { setLoginType("rider"); setShowTerms(true); }}
              onAuthenticated={(user) => { setAuthUser(user); setLoginType(user.role); }}
              onContinueVerification={(user) => { setAuthUser(user); setLoginType(user.role); setScreen("operator-application"); }}
            />
          )}
          {screen === "landing" && (
            <LandingScreen
              onLoginCustomer={() => { setLoginType("customer"); setScreen("login"); }}
              onLoginRider={() => { setLoginType("rider"); setScreen("login"); }}
              onSignUp={() => setScreen("signup-select")}
              onPortalLogin={handlePortalLogin}
              onAuthenticated={handleLoginSubmit}
            />
          )}
          {screen === "signup-select" && (
            <SignUpSelectScreen
              onBack={() => setScreen("landing")}
              onCustomer={() => setScreen("customer-signup")}
              onRider={() => setScreen("rider-signup")}
              onLogin={() => { setLoginType("customer"); setScreen("login"); }}
            />
          )}
          {screen === "customer-signup" && (
            <BusinessSignUpScreen
              onAuthenticated={handleLoginSubmit}
              onBack={() => setScreen("signup-select")}
              onGoToLogin={() => { setLoginType("customer"); setScreen("login"); }}
            />
          )}
          {screen === "login" && (
            <LoginScreen
              loginType={loginType}
              onBack={() => setScreen("landing")}
              onOpenTerms={openTerms}
              onSubmit={handleLoginSubmit}
              onSwitchType={setLoginType}
            />
          )}
          {screen === "face-verify" && (
            <FaceVerifyScreen
              loginType={loginType}
              attempts={faceAttempts}
              onSuccess={handleFaceSuccess}
              onFail={handleFaceFail}
              onBack={() => setScreen("login")}
            />
          )}
          {screen === "face-success" && (
            <FaceSuccessScreen loginType={loginType} onContinue={handleContinueFromSuccess} />
          )}
          {screen === "face-failed" && (
            <FaceFailedScreen
              loginType={loginType}
              attempts={faceAttempts}
              onTryAgain={handleTryAgain}
              onReturnToLogin={handleReturnToLogin}
            />
          )}
          </>}
        </div>

        {showLoginTerms && (
          <LoginTermsModal loginType={loginType} onAgree={handleLoginTermsAgree} onCancel={handleLoginTermsCancel} />
        )}
        {showTerms && (
          <LoginTermsModal loginType={loginType} onAgree={() => setShowTerms(false)} onCancel={() => setShowTerms(false)} />
        )}
        {showLogoutConfirm && (
          <ConfirmModal
            title="Log Out of KadaGo?"
            body="You will need to verify your identity again to log back in."
            confirmLabel={loggingOut ? "Logging out…" : "Log Out"}
            cancelLabel="Stay"
            danger
            pending={loggingOut}
            onConfirm={() => { void doLogout(); }}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}

function AuthenticatedExperience({ user, screen, category, setCategory, setScreen, onLogout }: { user: AuthUser; screen: Screen; category: CargoCategoryId; setCategory: (category: CargoCategoryId) => void; setScreen: (screen: Screen) => void; onLogout: () => void }) {
  const state = useBookings();
  const [showTruckRegistry, setShowTruckRegistry] = useState(false);
  const booking = state.selected;
  const dispatch = booking?.dispatch || INITIAL_DISPATCH;
  const status = dispatch.status;
  const isCustomer = user.role === "customer";
  return <>
    {state.error && <div role="alert" className="px-4 py-2 bg-red-50 text-red-700 text-xs">{state.error}</div>}
    {isCustomer && screen === "dashboard" ? <CustomerDashboard onLogout={onLogout} onBooking={(next) => { if (next) setCategory(next); setScreen("booking"); }} matchStatus={status} matchIdx={dispatch.matchIdx} onMatchStatus={(next) => state.patch({ status: next })} dispatch={dispatch} onDispatch={state.patch} />
      : isCustomer && screen === "booking" ? <BookingBuilder key={category} initialCategory={category} status={status} matchIdx={dispatch.matchIdx} onStatus={(next) => state.patch({ status: next })} onSubmitted={() => undefined} onClose={() => setScreen("dashboard")} onCreate={state.create} />
      : user.role === "rider" ? <RiderPortal onLogout={onLogout} dispatch={dispatch} onDispatch={state.patch} />
      : user.role === "admin" ? <AdminPortal onLogout={onLogout} dispatch={dispatch} onDispatch={state.patch} />
      : user.role === "fleet" ? <div className="h-full flex min-h-0 flex-col">
        {!showTruckRegistry && <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b bg-white px-4 py-2"><span className="text-xs font-semibold text-slate-600">Fleet vehicles</span><button onClick={() => setShowTruckRegistry(true)} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700">Manage trucks</button></div>}
        <div className="min-h-0 flex-1">{showTruckRegistry ? <TruckRegistry onBack={() => setShowTruckRegistry(false)} /> : <FleetPortal onLogout={onLogout} />}</div>
      </div> : <FleetPortal onLogout={onLogout} />}
  </>;
}

