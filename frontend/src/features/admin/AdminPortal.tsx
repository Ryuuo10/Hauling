import AdminCases from "@/features/admin/AdminCases";
import { casesForBookings } from "@/data/bookingCases";
import { useEffect, useState } from "react";
import OperatorApplications from "@/features/admin/OperatorApplications";
import TruckRegistry from "@/features/fleet/TruckRegistry";
import { operatorApplications } from "@/api/operatorApplications";
import type { Dispatch } from "@/data/dispatchData";
import { AgreementScreen } from "@/features/hauling/AgreementView";
import { isCompleted, payStatus, MATCHES, agreementNotifs } from "@/data/dispatchData";
import { AdminPaymentReview, AdminCompleted } from "@/features/hauling/Payments";
import { AdminTrack, AdminTripCard, ReportedProblems } from "@/features/hauling/TripView";
import { RateScreen, PrepareQuoteScreen, ReviewQuoteScreen, QuoteSentScreen } from "@/features/admin/AdminQuotation";
import { NeedsAttention, RequestsScreen, ReviewRequestScreen, CompareScreen, ApprovedScreen, AssignmentsScreen, AssignmentDetailScreen } from "@/features/admin/AdminDispatch";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";
import { useBookings } from "@/features/customer/BookingContext";
import type { UserNotification } from "@/api/bookings";

// ── Design tokens ──────────────────────────────────────────────────────────────
export const A = {
  bg: "#F8FAFF",
  card: "#FFFFFF",
  cardRed: "#FFF1F1",
  border: "rgba(0,0,0,0.08)",
  inputBg: "#FFFFFF",
  red: "#DC2626",
  orange: "#F47B20",
  blue: "#1D55D6",
  green: "#16A34A",
  yellow: "#EAB308",
  purple: "#7C3AED",
  muted: "#94a3b8",
  mutedFg: "#64748b",
};

type APage =
  | "home" | "driver-queue" | "driver-review" | "vehicle-queue" | "vehicle-review"
  | "face-review" | "users" | "live-jobs" | "hauling-track" | "problems" | "pay-review" | "completed-hauling" | "gps-map" | "sos" | "complaints"
  | "complaint-detail" | "disputes" | "pricing" | "services" | "areas"
  | "reviews" | "suspension" | "analytics" | "audit" | "notifications" | "profile" | "more" | "safety"
  | "requests" | "request-review" | "compare" | "approved" | "assignments" | "assignment-detail" | "rate" | "prepare-quote" | "review-quote" | "quote-sent" | "agreement";
type ATab = "home" | "requests" | "assignments" | "safety" | "more";

interface AdminPortalProps { onLogout: () => void; dispatch: Dispatch; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; }

// ── Static data ────────────────────────────────────────────────────────────────
const ADMIN_USER = { name: "Admin Mark Reyes", initials: "MR", role: "Platform Administrator" };

const TAB_OF: Record<APage, ATab> = {
  home: "home", notifications: "home",
  requests: "requests", "request-review": "requests", compare: "requests",
  assignments: "assignments", approved: "assignments", "assignment-detail": "assignments", rate: "assignments", "prepare-quote": "assignments", "review-quote": "assignments", "quote-sent": "assignments", agreement: "assignments",
  safety: "safety", "live-jobs": "safety", "hauling-track": "safety", problems: "safety", "gps-map": "safety", sos: "safety",
  "driver-queue": "more", "driver-review": "more", "vehicle-queue": "more", "vehicle-review": "more", "face-review": "more", users: "more", "pay-review": "more", "completed-hauling": "more",
  complaints: "more", "complaint-detail": "more", disputes: "more", pricing: "more", services: "more", areas: "more", reviews: "more", suspension: "more", analytics: "more", audit: "more", profile: "more", more: "more",
};


interface LiveJob {
  id: string; customer: string; driver: string; vehicle: string;
  service: string; pickup: string; destination: string; fare: number;
  status: "active" | "delayed" | "sos" | "disputed"; eta: string;
}
const LIVE_JOBS: LiveJob[] = [
  { id: "KG-HR-12301", customer: "Valencia Hardware Depot", driver: "Juan Dela Cruz", vehicle: "Isuzu 10-Wheeler · ABC 1234", service: "Construction Materials", pickup: "Valencia City",   destination: "Malaybalay City",   fare: 24500, status: "active",  eta: "1h 20m" },
  { id: "KG-HR-12291", customer: "Bukidnon Feeds Corp.",    driver: "Pedro Manalo",   vehicle: "Fuso 10-Wheeler · NMX 4521",  service: "Agricultural Cargo",     pickup: "Maramag",         destination: "Cagayan de Oro",    fare: 31000, status: "delayed", eta: "2h 45m" },
  { id: "KG-HR-12284", customer: "Mindanao Steel Supply",   driver: "Rodrigo C.",     vehicle: "Hino 6-Wheeler · HNO 8812",   service: "Other Commercial Cargo", pickup: "Malaybalay City", destination: "Valencia City",     fare: 9800,  status: "delayed", eta: "—" },
  { id: "KG-HR-12270", customer: "Casisang Aggregates",     driver: "Alvin Reyes",    vehicle: "Dump Truck · DMP 5521",       service: "Construction Materials", pickup: "Casisang Quarry", destination: "Manolo Fortich",    fare: 12800, status: "active",  eta: "3h" },
];

interface Dispute {
  id: string; jobId: string; customer: string; operator: string;
  payment: string; amount: number; reason: string;
  status: "open" | "review" | "resolved" | "refunded";
}
const DISPUTES: Dispute[] = [
  { id: "PAY-DSP-1031", jobId: "KG-HR-12281", customer: "Valencia Hardware Depot", operator: "Bukidnon Cargo Movers",       payment: "Bank Transfer", amount: 24500, reason: "Payment record amount does not match the quotation", status: "open" },
  { id: "PAY-DSP-1029", jobId: "KG-HR-12272", customer: "Bukidnon Feeds Corp.",    operator: "Northern Mindanao Logistics", payment: "Bank Transfer", amount: 31000, reason: "Balance payment not yet confirmed by operator", status: "review" },
  { id: "PAY-DSP-1022", jobId: "KG-HR-12263", customer: "Casisang Aggregates",     operator: "Northern Mindanao Logistics", payment: "Cash",          amount: 12800, reason: "Duplicate payment record submitted", status: "resolved" },
];

const PRICING_CATEGORIES = [
  { service: "Construction Materials", minFloor: 6000,  recommended: 12000, baseDist: "20km", perKm: 85,  helper: "₱800",   peak: "+15%" },
  { service: "Agricultural Cargo",     minFloor: 5000,  recommended: 10000, baseDist: "20km", perKm: 80,  helper: "₱600",   peak: "+20%" },
  { service: "Bulky & Heavy Goods",        minFloor: 15000, recommended: 28000, baseDist: "20km", perKm: 150, helper: "—",      peak: "+25%" },
  { service: "Other Commercial Cargo", minFloor: 4000,  recommended: 8000,  baseDist: "20km", perKm: 70,  helper: "₱500",   peak: "+10%" },
];

const SERVICE_AREAS = [
  { area: "Malaybalay City",  type: "City",         active: true },
  { area: "Valencia City",    type: "City",         active: true },
  { area: "Manolo Fortich",   type: "Municipality", active: true },
  { area: "Cabanglasan",      type: "Municipality", active: false },
  { area: "Don Carlos",       type: "Municipality", active: true },
  { area: "Lantapan",         type: "Municipality", active: false },
  { area: "Maramag",          type: "Municipality", active: true },
];

const AUDIT_LOGS = [
  { admin: "Mark Reyes", action: "Approved Operator",       target: "Samuel Bautista",       date: "Sep 6", time: "3:12 PM" },
  { admin: "Mark Reyes", action: "Changed Pricing Floor", target: "Construction Materials",       date: "Sep 5", time: "11:00 AM" },
  { admin: "Mark Reyes", action: "Suspended Account",     target: "Ramon Villanueva",      date: "Sep 5", time: "9:45 AM" },
  { admin: "Mark Reyes", action: "Reviewed Dispute",       target: "DIS002 · ₱31,000",     date: "Sep 4", time: "2:30 PM" },
  { admin: "Mark Reyes", action: "Approved Truck",        target: "Flatbed · FLT 3307", date: "Sep 3", time: "4:00 PM" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
export function BackHeader({ title, subtitle, onBack, right }: {
  title: string; subtitle?: string; onBack: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${A.border}` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1828" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <img src={kadaGoLogo} alt="KadaGo" style={{ width: "34px", flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black truncate" style={{ color: "#0D1828" }}>{title}</p>
        {subtitle && <p className="text-[10px] truncate" style={{ color: A.mutedFg }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function AStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:            { bg: "rgba(234,179,8,0.1)",   color: "#a16207", label: "Pending" },
    approved:           { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "Approved" },
    rejected:           { bg: "rgba(220,38,38,0.1)",   color: "#DC2626", label: "Rejected" },
    resubmit:           { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED", label: "Needs Resubmission" },
    active:             { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "Active" },
    delayed:            { bg: "rgba(234,179,8,0.1)",   color: "#a16207", label: "Delayed" },
    sos:                { bg: "rgba(220,38,38,0.12)",  color: "#DC2626", label: "🚨 SOS" },
    disputed:           { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED", label: "Disputed" },
    new:                { bg: "rgba(220,38,38,0.1)",   color: "#DC2626", label: "New" },
    review:             { bg: "rgba(29,85,214,0.1)",   color: "#1D55D6", label: "Under Review" },
    "waiting-customer": { bg: "rgba(234,179,8,0.1)",   color: "#a16207", label: "Waiting Customer" },
    "waiting-driver":   { bg: "rgba(244,123,32,0.1)",  color: "#c2410c", label: "Waiting Operator" },
    resolved:           { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "Resolved" },
    closed:             { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Closed" },
    open:               { bg: "rgba(220,38,38,0.1)",   color: "#DC2626", label: "Open" },
    refunded:           { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED", label: "Refund Recorded (Simulated)" },
    escalated:          { bg: "rgba(220,38,38,0.12)",  color: "#DC2626", label: "Escalated" },
  };
  const s = map[status] ?? map.closed;
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

// ── Admin Live GPS Map ─────────────────────────────────────────────────────────
function AdminMap({ height = 240 }: { height?: number }) {
  const markers = [
    { x: 88,  y: 188, type: "truck",  label: "KG-HR-12301", color: A.orange },
    { x: 238, y: 118, type: "truck",  label: "KG-HR-12291", color: A.yellow },
    { x: 128, y: 160, type: "truck", label: "KG-HR-12284", color: A.orange },
    { x: 310, y: 80,  type: "truck",  label: "KG-HR-12270", color: A.green },
    { x: 60,  y: 240, type: "pickup", label: "Pickup",      color: A.blue },
    { x: 360, y: 50,  type: "dest",   label: "Drop",        color: A.purple },
  ];
  return (
    <svg width="100%" height={height} viewBox={`0 0 390 ${height}`} preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs><pattern id="ag" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(220,38,38,0.05)" strokeWidth="0.5"/></pattern></defs>
      <rect width="390" height={height} fill="#F1F5FF"/>
      <rect width="390" height={height} fill="url(#ag)"/>
      <line x1="0" y1={height * 0.64} x2="390" y2={height * 0.64} stroke="rgba(0,0,0,0.07)" strokeWidth="14"/>
      <line x1="170" y1="0" x2="170" y2={height} stroke="rgba(0,0,0,0.05)" strokeWidth="10"/>
      <line x1="0" y1={height * 0.35} x2="390" y2={height * 0.65} stroke="rgba(0,0,0,0.04)" strokeWidth="7"/>
      {[{ x: 25, y: height * 0.58, t: "Malaybalay" }, { x: 270, y: height * 0.58, t: "Valencia" }].map(l => (
        <text key={l.t} x={l.x} y={l.y} fontSize="9" fill="rgba(0,0,0,0.4)" fontFamily="system-ui">{l.t}</text>
      ))}
      {markers.map(m => (
        <g key={m.label}>
          <circle cx={m.x} cy={m.y} r={m.type === "sos" ? 18 : 13} fill={m.color} opacity={m.type === "sos" ? 0.25 : 0.12}/>
          <circle cx={m.x} cy={m.y} r={m.type === "sos" ? 12 : 8} fill={m.color} opacity={0.9}/>
          <text x={m.x} y={m.y + 3.5} textAnchor="middle" fontSize="7" fill="white">
            {m.type === "sos" ? "🚨" : m.type === "pickup" ? "📍" : m.type === "dest" ? "🎯" : "🚛"}
          </text>
          <text x={m.x} y={m.y + 26} textAnchor="middle" fontSize="7" fill={m.color} fontFamily="system-ui" fontWeight="bold">{m.label}</text>
        </g>
      ))}
      {/* SOS pulse */}
      <circle cx={128} cy={160} r={24} fill="none" stroke={A.red} strokeWidth="1.5" opacity={0.4} style={{ animation: "pulseOval 1.5s ease-in-out infinite" }}/>
      <rect x="8" y="8" width="150" height="18" rx="9" fill="rgba(13,24,40,0.78)"/>
      <text x="83" y="20" textAnchor="middle" fontSize="8.5" fill="white" fontFamily="system-ui" fontWeight="bold">Demo GPS — Simulated Location</text>
    </svg>
  );
}

// ── 17. Admin Dashboard ────────────────────────────────────────────────────────
function AdminDashboard({ onGoTo, dispatch, onReviewMatch, onRate, onPrepare, onCancel, notificationUnread, bookingLabel }: { onGoTo: (p: APage) => void; dispatch: Dispatch; onReviewMatch: () => void; onRate: () => void; onPrepare: () => void; onCancel: () => void; notificationUnread: number; bookingLabel: string }) {
  const { trucks, bookings } = useBookings();
  const [pendingOperators, setPendingOperators] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const update = () => { void operatorApplications.list().then(result => { if (active) setPendingOperators(result.applications.filter(item => item.status === "pending").length); }).catch(() => { if (active) setPendingOperators(null); }); };
    update(); const timer = window.setInterval(update, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const done = isCompleted(dispatch);
  const bookedActive = dispatch.status === "booked" && !done;
  const stats: { label: string; value: number | string; icon: string; color: string; go: () => void }[] = [
    { label: "New Hauling Requests",          value: 2 + (dispatch.status === "review" ? 1 : 0),      icon: "📥", color: A.blue,   go: () => onGoTo("requests") },
    { label: "Pending Match Approval",        value: 1 + (dispatch.status === "suggested" ? 1 : 0),   icon: "🧭", color: A.yellow, go: onReviewMatch },
    { label: "Operator Confirmation",         value: dispatch.status === "approved" ? 1 : 0,          icon: "⏳", color: A.orange, go: () => onGoTo("assignments") },
    { label: "Active Hauling",                value: LIVE_JOBS.length + (bookedActive ? 1 : 0),       icon: "🚛", color: A.green,  go: () => onGoTo("live-jobs") },
    { label: "Pending Operator Verification", value: pendingOperators ?? "Unavailable", icon: "👤", color: A.yellow, go: () => onGoTo("driver-queue") },
    { label: "Pending Truck Verification",    value: trucks.filter(truck => !truck.verified).length, icon: "🛻", color: A.yellow, go: () => onGoTo("vehicle-queue") },
    { label: "Open Cases",                    value: casesForBookings(bookings).filter(item => item.status !== "Resolved").length, icon: "📋", color: A.red, go: () => onGoTo("complaints") },
    { label: "Completed Today",               value: 8 + (done ? 1 : 0),                              icon: "✅", color: A.green,  go: () => onGoTo("completed-hauling") },
  ];
  const bell = notificationUnread;
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-3 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <img src={kadaGoLogo} alt="KadaGo" style={{ width: "38px" }} />
          <div className="flex-1">
            <p className="text-[9px] font-black tracking-wider" style={{ color: A.red }}>🛡️ ADMIN / DISPATCH CENTER</p>
            <p className="text-[11px] font-bold" style={{ color: "#0D1828" }}>Hauling Operations</p>
          </div>
          <button onClick={() => onGoTo("notifications")} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.mutedFg} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-white" style={{ background: A.red }}>{bell}</div>
          </button>
          <button onClick={() => onGoTo("profile")} className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white" style={{ background: A.red }}>MR</button>
        </div>
        {dispatch.status === "booked" && dispatch.tripStage !== "upcoming" && (
          <button onClick={() => onGoTo("live-jobs")} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left" style={{ background: dispatch.delay ? "rgba(220,38,38,0.07)" : "rgba(244,123,32,0.08)", border: `1px solid ${dispatch.delay ? "rgba(220,38,38,0.25)" : "rgba(244,123,32,0.3)"}` }}>
            <span className="text-[10px] font-black" style={{ color: dispatch.delay ? A.red : A.orange }}>{dispatch.delay ? "⏱️ DELAYED HAULING 1 — BK-8721" : dispatch.issue ? "⚠️ BK-8721 Cargo Issue Reported · DSP-1042 Under Review" : isCompleted(dispatch) ? "🏁 BK-8721 Completed · Payment Paid" : dispatch.payIssue && dispatch.payIssue.status !== "Resolved" ? "⚠️ BK-8721 Payment Disputed · PAY-DSP-1047" : dispatch.pay ? `💳 BK-8721 Payment Record · ${payStatus(dispatch)}` : dispatch.customerConfirm ? "✅ BK-8721 Delivered · Customer Confirmed" : dispatch.tripStage === "delivered" ? "✅ BK-8721 Delivered · Customer Confirmation Pending" : "🚛 BK-8721 Active Hauling"}</span>
            <span className="ml-auto text-[9px] font-black" style={{ color: A.blue }}>View →</span>
          </button>
        )}
        {dispatch.problem && (
          <button onClick={() => onGoTo("problems")} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <span className="text-[10px] font-black" style={{ color: A.red }}>⚠️ Reported Problems · BK-8721 · {dispatch.problem}</span>
            <span className="ml-auto text-[9px] font-black" style={{ color: A.blue }}>View →</span>
          </button>
        )}
        {/* SOS banner */}
        {(dispatch.customerSOS === "active" || dispatch.operatorSOS === "active") && (() => {
          const c = (dispatch.customerSOS === "active" ? 1 : 0) + (dispatch.operatorSOS === "active" ? 1 : 0);
          return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: A.red, animation: "livenessBlip 1s ease-in-out infinite" }}/>
              <span className="text-[10px] font-black" style={{ color: A.red }}>{`🚨 ${c} ACTIVE SOS ALERT${c > 1 ? "S" : ""} — ${bookingLabel}`}</span>
              <button onClick={() => onGoTo("sos")} className="ml-auto text-[9px] font-black text-white px-2 py-0.5 rounded-lg" style={{ background: A.red }}>Respond</button>
            </div>
          );
        })()}
      </div>

      <div className="dashboard-grid admin-home px-3 pt-3 space-y-3">
        {/* Stats grid */}
        <div className="dashboard-stats grid grid-cols-2 min-[400px]:grid-cols-4 gap-1.5">
          {stats.map(s => (
            <button key={s.label} onClick={s.go}
              className="flex flex-col items-center px-1 py-3 rounded-2xl transition-opacity active:opacity-70"
              style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <span className="text-lg mb-0.5">{s.icon}</span>
              <p className="text-[16px] font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[7.5px] font-semibold text-center leading-tight mt-0.5" style={{ color: A.muted }}>{s.label}</p>
            </button>
          ))}
        </div>

        <NeedsAttention dispatch={dispatch} onReview={onReviewMatch} onAssignments={() => onGoTo("assignments")} onRate={onRate} onPrepare={onPrepare} onCancel={onCancel} />

        {/* Live jobs map */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>Hauling Map · Demo GPS</p>
            <button onClick={() => onGoTo("gps-map")} className="text-[10px] font-bold" style={{ color: A.blue }}>Full Map →</button>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F1F5FF", border: `1px solid ${A.border}` }}>
            <AdminMap height={180} />
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-[10px] font-black tracking-wider mb-2 px-1" style={{ color: A.mutedFg }}>QUICK ACTIONS</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Match Approvals",       icon: "🧭", page: "requests"      as APage, color: A.blue },
              { label: "Operator Verification", icon: "👤", page: "driver-queue"  as APage, color: A.yellow },
              { label: "Truck Verification",    icon: "🚛", page: "vehicle-queue" as APage, color: A.yellow },
              { label: "Safety Center",         icon: "🛡️", page: "safety"        as APage, color: A.green },
              { label: "SOS Alerts",            icon: "🚨", page: "sos"           as APage, color: A.red },
              { label: "Payment Review",        icon: "🧾", page: "pay-review"    as APage, color: A.blue },
            ].map(b => (
              <button key={b.label} onClick={() => onGoTo(b.page)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl transition-opacity active:opacity-70"
                style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${A.border}` }}>
                <span className="text-xl">{b.icon}</span>
                <span className="text-[9px] font-bold text-center leading-tight" style={{ color: b.color }}>{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-spacer" style={{ height: "6px" }} />
      </div>
    </div>
  );
}

// ── 18. Driver Approval Queue ──────────────────────────────────────────────────
function FaceReviewScreen({ onBack }: { onBack: () => void }) {
  const cases = [
    { name: "Delia Macaraeg", initials: "DM", type: "Customer", attempts: 3, reason: "Face mismatch on 3rd attempt", color: A.blue },
    { name: "Efren Ramos",    initials: "ER", type: "Operator", attempts: 3, reason: "Liveness check failed",        color: A.orange },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Identity Document Review" subtitle={`${cases.length} pending manual review`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 pb-3">
        {cases.map(c => (
          <div key={c.name} className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2.5 flex items-center gap-3" style={{ borderBottom: `1px solid ${A.border}` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white" style={{ background: c.color }}>{c.initials}</div>
              <div className="flex-1">
                <p className="text-[13px] font-black" style={{ color: "#0D1828" }}>{c.name}</p>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>{c.type} · {c.attempts} failed attempts</p>
                <p className="text-[10px] font-semibold" style={{ color: A.yellow }}>⚠️ {c.reason}</p>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.1)", color: "#a16207" }}>Under Review</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-3 py-2.5">
              {[
                { label: "Approve Identity", color: A.green },
                { label: "New Verification", color: A.blue },
                { label: "Reject",           color: A.red },
                { label: "Suspend Account",  color: A.red },
              ].map(b => (
                <button key={b.label} className="py-2.5 rounded-xl text-[10px] font-black transition-opacity active:opacity-70"
                  style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${A.border}`, color: b.color }}>{b.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 23. User Management ────────────────────────────────────────────────────────
function UsersScreen({ onBack }: { onBack: () => void }) {
  const [userTab, setUserTab] = useState<"customers" | "operators" | "trucks">("customers");
  const users = {
    customers: [
      { name: "Santos Agricultural Trading", id: "BC001", status: "active",    jobs: 24, joined: "Jan 2025" },
      { name: "Valencia Hardware Depot",     id: "BC002", status: "active",    jobs: 15, joined: "Mar 2025" },
      { name: "Casisang Aggregates",         id: "BC003", status: "suspended", jobs: 8,  joined: "Jun 2025" },
    ],
    operators: [
      { name: "Dela Cruz Trucking Services", id: "TO001", status: "active",    jobs: 245, joined: "Jan 2024" },
      { name: "Northern Mindanao Logistics", id: "TO002", status: "active",    jobs: 180, joined: "Mar 2024" },
      { name: "Bukidnon Cargo Movers",       id: "TO003", status: "suspended", jobs: 56,  joined: "Aug 2025" },
    ],
    trucks: [
      { name: "Isuzu 10-Wheeler Wing Van · ABC 1234", id: "TR001", status: "active", jobs: 142, joined: "Nov 2024" },
      { name: "Fuso 10-Wheeler Dropside · NMX 4521",  id: "TR002", status: "active", jobs: 98,  joined: "Feb 2025" },
      { name: "Hino 6-Wheeler · HNO 8812",            id: "TR003", status: "active", jobs: 64,  joined: "May 2025" },
    ],
  }[userTab];
  const tabLabel = { customers: "Business Customers", operators: "Truck Operators", trucks: "Trucks" };
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="User Management" subtitle="Business Customers · Truck Operators · Trucks" onBack={onBack} />
      <div className="flex-shrink-0 flex gap-1 px-3 pt-3 pb-2">
        {(["customers", "operators", "trucks"] as const).map(t => (
          <button key={t} onClick={() => setUserTab(t)}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all"
            style={{ background: userTab === t ? A.blue : "rgba(0,0,0,0.03)", border: `1px solid ${userTab === t ? A.blue : A.border}`, color: userTab === t ? "white" : "#374151" }}>
            {tabLabel[t]}
          </button>
        ))}
      </div>
      <div className="flex-shrink-0 px-3 pb-2">
        <input type="text" placeholder="Search by name, phone, email, or ID…"
          className="w-full px-4 py-2.5 rounded-xl text-[12px] outline-none placeholder-gray-400"
          style={{ background: "#F8FAFF", border: `1px solid rgba(0,0,0,0.12)`, color: "#0D1828" }} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-3">
        {users.map(u => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white" style={{ background: u.status === "suspended" ? A.red : A.blue }}>
              {u.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: "#0D1828" }}>{u.name}</p>
              <p className="text-[10px]" style={{ color: A.mutedFg }}>{u.id} · {u.jobs} hauls · Joined {u.joined}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <AStatusBadge status={u.status} />
              <div className="flex gap-1.5">
                <button className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(29,85,214,0.07)", color: A.blue }}>View</button>
                <button className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ background: u.status === "suspended" ? "rgba(22,163,74,0.07)" : "rgba(220,38,38,0.07)", color: u.status === "suspended" ? A.green : A.red }}>
                  {u.status === "suspended" ? "Reactivate" : "Suspend"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 24. Live Job Monitoring ────────────────────────────────────────────────────
function LiveJobsScreen({ onBack, onGPS, dispatch, onTrack }: { onBack: () => void; onGPS: () => void; dispatch: Dispatch; onTrack: () => void }) {
  const [filter, setFilter] = useState<"all" | "active" | "delayed" | "sos" | "disputed">("all");
  const filtered = filter === "all" ? LIVE_JOBS : LIVE_JOBS.filter(j => j.status === filter);
  const showOwn = dispatch.status === "booked" && !isCompleted(dispatch) && (filter === "all" || filter === "active" || (filter === "delayed" && !!dispatch.delay));
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Active Hauling Monitoring" subtitle="Demo GPS — Simulated Location" onBack={onBack}
        right={<button onClick={onGPS} className="text-[10px] font-black px-2.5 py-1.5 rounded-xl text-white" style={{ background: A.blue }}>📍 Demo Map</button>} />
      <div className="flex-shrink-0 flex gap-1 px-3 pt-3 pb-2 overflow-x-auto">
        {(["all", "active", "delayed", "sos", "disputed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black capitalize transition-all"
            style={{ background: filter === f ? (f === "sos" ? A.red : A.orange) : "rgba(0,0,0,0.03)", border: `1px solid ${filter === f ? (f === "sos" ? A.red : A.orange) : A.border}`, color: filter === f ? "white" : "#374151" }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-3">
        {showOwn && <AdminTripCard dispatch={dispatch} onView={onTrack} />}
        {!showOwn && filtered.length === 0 && <AdminEmptyState type="no-jobs" />}
        {filtered.map(j => (
          <div key={j.id} className="rounded-2xl overflow-hidden" style={{ background: j.status === "sos" ? A.cardRed : A.card, border: `1px solid ${j.status === "sos" ? "rgba(220,38,38,0.35)" : A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: `1px solid ${j.status === "sos" ? "rgba(220,38,38,0.15)" : A.border}` }}>
              <div>
                <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{j.id} · {j.service}</p>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>{j.customer} → {j.driver} (Operator)</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-black" style={{ color: A.green }}>₱{j.fare.toLocaleString()}</p>
                <AStatusBadge status={j.status} />
              </div>
            </div>
            <div className="px-4 py-2.5 space-y-1">
              <p className="text-[10px]" style={{ color: A.mutedFg }}>{j.vehicle}</p>
              <p className="text-[9px]" style={{ color: A.muted }}>Demo GPS — Simulated Location</p>
              <div className="flex items-start gap-1.5"><div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: A.blue }}/><p className="text-[10px]" style={{ color: "#374151" }}>{j.pickup}</p></div>
              <div className="flex items-start gap-1.5"><div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: A.orange }}/><p className="text-[10px]" style={{ color: "#374151" }}>{j.destination}</p></div>
              <p className="text-[10px]" style={{ color: A.mutedFg }}>ETA: {j.eta}</p>
            </div>
            <div className="px-3 pb-3">
              <button onClick={onGPS} className="w-full py-2.5 rounded-xl text-[10px] font-black text-white transition-opacity active:opacity-70"
                style={{ background: j.status === "sos" ? A.red : A.blue }}>
                {j.status === "sos" ? "🚨 Respond to SOS" : "📍 View Tracking"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 25. Admin Live GPS Map ─────────────────────────────────────────────────────
function AdminGPSMapScreen({ onBack }: { onBack: () => void }) {
  const [serviceFilter, setServiceFilter] = useState<string>("All");
  const services = ["All", "Construction", "Agricultural", "Commercial"];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Active Hauling Map" subtitle="Demo GPS — Simulated Location" onBack={onBack} />
      <div className="flex-shrink-0 flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto">
        {services.map(s => (
          <button key={s} onClick={() => setServiceFilter(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all"
            style={{ background: serviceFilter === s ? A.blue : "rgba(0,0,0,0.03)", border: `1px solid ${serviceFilter === s ? A.blue : A.border}`, color: serviceFilter === s ? "white" : "#374151" }}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-3 rounded-2xl overflow-hidden" style={{ background: "#F1F5FF", border: `1px solid ${A.border}` }}>
          <AdminMap height={320} />
          {/* Legend */}
          <div className="grid grid-cols-4 px-4 py-2.5 gap-2" style={{ borderTop: `1px solid ${A.border}` }}>
            {[
              { color: A.orange, label: "Truck" },
              { color: A.blue,   label: "Pickup" },
              { color: A.purple, label: "Destination" },
              { color: A.red,    label: "SOS Alert" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }}/><span className="text-[9px]" style={{ color: A.mutedFg }}>{l.label}</span></div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pt-2 space-y-2 pb-3">
          {LIVE_JOBS.map(j => (
            <div key={j.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: j.status === "sos" ? A.cardRed : A.card, border: `1px solid ${j.status === "sos" ? "rgba(220,38,38,0.3)" : A.border}` }}>
              <div><p className="text-[11px] font-bold" style={{ color: "#0D1828" }}>{j.id}</p><p className="text-[10px]" style={{ color: A.mutedFg }}>{j.driver}</p></div>
              <div className="flex-1"><p className="text-[10px]" style={{ color: "#374151" }}>{j.service}</p><p className="text-[9px]" style={{ color: A.mutedFg }}>ETA {j.eta}</p></div>
              <AStatusBadge status={j.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 26. SOS Alert Center ───────────────────────────────────────────────────────
function SOSAlertScreen({ onBack, dispatch, onDispatch, onBooking, onTracking, booking }: { onBack: () => void; dispatch: Dispatch; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; onBooking: () => void; onTracking: () => void; booking: import("@/api/bookings").Booking | null }) {
  const alerts = ([
    { key: "customerSOS" as const, label: "Customer", by: booking?.customer || "Customer", role: "Business Customer" },
    { key: "operatorSOS" as const, label: "Operator", by: booking?.assignment?.driver || "Truck operator", role: "Truck Operator" },
  ]).filter(item => dispatch[item.key]);
  const location = booking ? `${booking.request.pickup.city}, ${booking.request.pickup.province}` : "Unavailable";
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="SOS Alert Center" subtitle="Saved alerts from confirmed bookings" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 pb-3">
        {alerts.length === 0 && <AdminEmptyState type="no-sos" />}
        {alerts.map(item => {
          const st = dispatch[item.key]!;
          const event = booking?.events.filter(e => e.label === "SOS Dispatch Alert" && (item.key === "customerSOS" ? e.role === "customer" : e.role !== "customer" && e.role !== "admin")).at(-1);
          const reason = item.key === "customerSOS" ? dispatch.customerSOSReason || event?.details || "Emergency reported" : "Emergency reported by operator";
          return (
            <div key={item.key} className="rounded-2xl overflow-hidden" style={{ background: A.cardRed, border: "2px solid rgba(220,38,38,0.4)" }}>
              <div className="px-4 pt-3 pb-2.5" style={{ borderBottom: "1px solid rgba(220,38,38,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: st === "active" ? A.red : A.green }}/>
                  <span className="text-[11px] font-black" style={{ color: st === "active" ? A.red : "#15803d" }}>{st === "active" ? "ACTIVE" : "ACKNOWLEDGED"} SOS</span>
                  <span className="ml-auto text-[9px]" style={{ color: A.muted }}>{event ? new Date(event.at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "Time unavailable"}</span>
                </div>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>Saved to the booking record. No emergency services call or live GPS sharing was made.</p>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Alert ID: {event?.id.slice(0, 12) || "Unavailable"}</p>
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Booking: {booking?.bookingId || booking?.requestId || "Unavailable"}</p>
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Raised By: {item.by}</p>
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Role: {item.role}</p>
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Pickup: {location}</p>
                <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>Reason: {reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                <button onClick={onBooking} className="py-3 rounded-xl text-[10px] font-black" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.blue}33`, color: A.blue }}>View Booking</button>
                <button onClick={onTracking} className="py-3 rounded-xl text-[10px] font-black" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${A.orange}33`, color: A.orange }}>View Tracking</button>
                <button disabled={st === "acknowledged"} onClick={() => onDispatch({ [item.key]: "acknowledged" })} className="col-span-2 py-3 rounded-xl text-[10px] font-black text-white disabled:bg-slate-300" style={{ background: st === "acknowledged" ? "#CBD5E1" : A.red }}>{st === "acknowledged" ? "Acknowledged" : "Mark Acknowledged"}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DisputesScreen({ onBack, dispatch, onDispatch, onPayReview }: { onBack: () => void; dispatch: Dispatch; onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>; onPayReview: () => void }) {
  const [items, setItems] = useState(DISPUTES);
  const [notice, setNotice] = useState<string | null>(null);
  const set = (id: string, status: Dispute["status"]) => setItems(it => it.map(d => d.id === id ? { ...d, status } : d));
  const pi = dispatch.payIssue;
  const openCount = items.filter(d => d.status === "open").length + (pi && pi.status !== "Resolved" ? 1 : 0);
  const btn = (label: string, onClick: () => void, color: string, bg: string) => (
    <button onClick={onClick} className="py-2.5 rounded-xl text-[9px] font-black leading-tight" style={{ background: bg, border: `1px solid ${A.border}`, color }}>{label}</button>
  );
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Payment Disputes" subtitle={`${openCount} open`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        <p className="text-[9.5px] px-1 leading-snug" style={{ color: A.muted }}>Payment records are for the prototype only. No money is moved, refunded or released.</p>
        {notice && <div className="px-3 py-2 rounded-xl text-[10px] font-bold" style={{ background: "rgba(29,85,214,0.07)", color: A.blue }}>{notice}</div>}
        {pi && (
          <div className="rounded-2xl overflow-hidden" style={{ background: A.cardRed, border: "1.5px solid rgba(220,38,38,0.3)" }}>
            <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(220,38,38,0.15)" }}>
              <div>
                <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{pi.id} · ₱{(dispatch.finalRate ?? 28500).toLocaleString()}</p>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>Booking BK-8721 · Santos Agricultural Trading vs {MATCHES[0].business}</p>
                <p className="text-[10px] font-semibold" style={{ color: "#374151" }}>{pi.type}</p>
              </div>
              <AStatusBadge status={pi.status === "Resolved" ? "resolved" : "review"} />
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-3 py-2.5">
              {btn("Review", onPayReview, A.blue, "rgba(29,85,214,0.07)")}
              {btn("Request Information", () => setNotice(`Information request recorded for ${pi.id} (simulated).`), "#374151", "rgba(0,0,0,0.03)")}
              {btn("Mark Resolved", () => onDispatch({ payIssue: { ...pi, status: "Resolved" } }), "#15803d", "rgba(22,163,74,0.08)")}
              {btn("Record Refund (Simulated)", () => setNotice(`Simulated refund record noted for ${pi.id}. No money moved.`), "#7C3AED", "rgba(124,58,237,0.07)")}
            </div>
          </div>
        )}
        {items.length === 0 && !pi && <AdminEmptyState type="no-disputes" />}
        {items.map(d => (
          <div key={d.id} className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2" style={{ borderBottom: `1px solid ${A.border}` }}>
              <div>
                <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{d.id} · ₱{d.amount.toLocaleString()}</p>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>Booking {d.jobId} · {d.payment}</p>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>{d.customer} vs {d.operator}</p>
                <p className="text-[10px] font-semibold" style={{ color: "#374151" }}>{d.reason}</p>
              </div>
              <AStatusBadge status={d.status} />
            </div>
            <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5">
              <button onClick={() => set(d.id, "review")} className="py-2.5 rounded-xl text-[9px] font-black" style={{ background: "rgba(29,85,214,0.07)", border: `1px solid ${A.border}`, color: A.blue }}>Review</button>
              <button onClick={() => setNotice(`Information request sent for ${d.id} (simulated).`)} className="py-2.5 rounded-xl text-[9px] font-black" style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${A.border}`, color: "#374151" }}>Request Information</button>
              <button onClick={() => set(d.id, "resolved")} className="py-2.5 rounded-xl text-[9px] font-black" style={{ background: "rgba(22,163,74,0.08)", border: `1px solid ${A.border}`, color: "#15803d" }}>Mark Resolved</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 30. Pricing Floor Management ────────────────────────────────────────────────
function PricingScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Hauling Rate Rules" subtitle="Minimum floor rates" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)" }}>
          <p className="text-[11px] font-semibold" style={{ color: "#15803d" }}>⚠️ Hauling rate floors protect fair operator earnings. Changes take effect after 24h notice.</p>
        </div>
        {PRICING_CATEGORIES.map(p => (
          <div key={p.service} className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${A.border}` }}>
              <p className="text-[13px] font-black" style={{ color: "#0D1828" }}>{p.service}</p>
              <button className="text-[10px] font-black px-2.5 py-1 rounded-xl" style={{ background: "rgba(244,123,32,0.07)", color: A.orange, border: `1px solid rgba(244,123,32,0.2)` }}>Edit</button>
            </div>
            <div className="px-4 py-2.5 grid grid-cols-2 gap-x-6 gap-y-1">
              {[
                { label: "Min Floor",    value: `₱${p.minFloor}` },
                { label: "Recommended", value: `₱${p.recommended}` },
                { label: "Base Dist",   value: p.baseDist },
                { label: "Per km",      value: `₱${p.perKm}` },
                { label: "Helper Fee",  value: p.helper },
                { label: "Peak Rate",   value: p.peak },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="text-[9px]" style={{ color: A.muted, minWidth: "68px" }}>{r.label}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#0D1828" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 31. Service Categories ─────────────────────────────────────────────────────
function ServicesScreen({ onBack }: { onBack: () => void }) {
  const svcs = [
    { name: "Construction Materials", emoji: "🧱", active: true,  vehicles: "Dropside, Dump Truck",   limits: "16,000 kg" },
    { name: "Agricultural Cargo",     emoji: "🌾", active: true,  vehicles: "Wing Van, Dropside",     limits: "15,000 kg" },
    { name: "Bulky & Heavy Goods",        emoji: "⚙️",  active: true,  vehicles: "Flatbed, Lowbed",        limits: "Permit req." },
    { name: "Other Commercial Cargo", emoji: "📦", active: true,  vehicles: "6-Wheeler, Wing Van",    limits: "10,000 kg" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Cargo Categories" subtitle="Platform service config" onBack={onBack}
        right={<button className="text-[10px] font-black px-2.5 py-1.5 rounded-xl text-white" style={{ background: A.blue }}>+ Add</button>} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {svcs.map(s => (
          <div key={s.name} className="px-4 py-3.5 rounded-2xl flex items-center gap-3" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span className="text-2xl">{s.emoji}</span>
            <div className="flex-1">
              <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{s.name}</p>
              <p className="text-[9px]" style={{ color: A.mutedFg }}>{s.vehicles} · Limit: {s.limits}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-5 rounded-full flex items-center" style={{ background: s.active ? A.green : "rgba(100,116,139,0.3)", padding: "2px" }}>
                <div className="w-4 h-4 rounded-full bg-white" style={{ transform: s.active ? "translateX(20px)" : "none", transition: "transform 0.2s" }}/>
              </div>
              <button className="text-[10px] font-black" style={{ color: A.orange }}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 32. Service Area Management ────────────────────────────────────────────────
function AreasScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Service Areas" subtitle="Active coverage zones" onBack={onBack}
        right={<button className="text-[10px] font-black px-2.5 py-1.5 rounded-xl text-white" style={{ background: A.blue }}>+ Add Area</button>} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {SERVICE_AREAS.map(a => (
          <div key={a.area} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span className="text-lg">📍</span>
            <div className="flex-1">
              <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{a.area}</p>
              <p className="text-[10px]" style={{ color: A.mutedFg }}>{a.type}</p>
            </div>
            <div className="w-10 h-5 rounded-full flex items-center cursor-pointer" style={{ background: a.active ? A.green : "rgba(100,116,139,0.3)", padding: "2px" }}>
              <div className="w-4 h-4 rounded-full bg-white" style={{ transform: a.active ? "translateX(20px)" : "none" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 33. Reviews Moderation ─────────────────────────────────────────────────────
function ReviewsModerationScreen({ onBack }: { onBack: () => void }) {
  const reviews = [
    { reviewer: "Maria Santos",     subject: "Juan Dela Cruz", rating: 5, comment: "Very professional and on time!", jobId: "KG-HR-12301", reported: false },
    { reviewer: "Carlos Reyes",     subject: "Pedro Manalo",   rating: 1, comment: "Demanded extra payment. Very bad.", jobId: "KG-HR-12291", reported: true },
    { reviewer: "Ana Buenaventura", subject: "Rodrigo C.",     rating: 4, comment: "Fast delivery, a little rough on cargo.", jobId: "KG-HR-12270", reported: false },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Reviews Moderation" subtitle={`${reviews.filter(r => r.reported).length} reported`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: r.reported ? A.cardRed : A.card, border: `1px solid ${r.reported ? "rgba(220,38,38,0.3)" : A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2.5 flex items-start justify-between" style={{ borderBottom: `1px solid ${r.reported ? "rgba(220,38,38,0.1)" : A.border}` }}>
              <div>
                <p className="text-[11px] font-black" style={{ color: "#0D1828" }}>{r.reviewer} → {r.subject}</p>
                <div className="flex">{"★".repeat(r.rating).padEnd(5, "☆").split("").map((s, j) => <span key={j} style={{ color: j < r.rating ? A.yellow : A.muted, fontSize: "10px" }}>{s}</span>)}</div>
                <p className="text-[10px]" style={{ color: A.mutedFg }}>Booking {r.jobId}</p>
              </div>
              {r.reported && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}>Reported</span>}
            </div>
            <p className="px-4 py-2.5 text-[11px] italic" style={{ color: "#374151" }}>"{r.comment}"</p>
            <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
              {["Keep", "Hide", "Investigate"].map(a => (
                <button key={a} className="py-2.5 rounded-xl text-[9px] font-black transition-opacity active:opacity-70"
                  style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${A.border}`, color: a === "Hide" ? A.red : a === "Keep" ? A.green : A.yellow }}>{a}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 34. Account Suspension Modal ────────────────────────────────────────────────
function SuspensionScreen({ onBack }: { onBack: () => void }) {
  const [duration, setDuration] = useState<string>("24h");
  const [note, setNote] = useState("");
  const durations = ["Warning Only", "24 Hours", "7 Days", "30 Days", "Permanent"];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Account Suspension" subtitle="Bukidnon Cargo Movers · TO003" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-4">
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white" style={{ background: A.red }}>BC</div>
          <div>
            <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>Ramon Villanueva</p>
            <p className="text-[10px]" style={{ color: A.mutedFg }}>Truck Operator · R005 · 3 prior warnings</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black mb-2" style={{ color: A.mutedFg }}>SUSPENSION DURATION</p>
          <div className="space-y-2">
            {durations.map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-opacity active:opacity-70"
                style={{ background: duration === d ? "rgba(220,38,38,0.06)" : "#F8FAFF", border: `1.5px solid ${duration === d ? "rgba(220,38,38,0.3)" : A.border}` }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: duration === d ? A.red : "rgba(0,0,0,0.04)", border: duration === d ? "none" : `1px solid ${A.border}` }}>
                  {duration === d && <div className="w-2.5 h-2.5 rounded-full bg-white"/>}
                </div>
                <span className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{d}</span>
                {d === "Permanent" && <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}>Irreversible</span>}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black mb-1.5" style={{ color: A.mutedFg }}>ADMIN NOTES (Required)</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="State reason for suspension…"
            className="w-full px-4 py-3 rounded-xl text-[12px] resize-none outline-none placeholder-gray-400"
            style={{ background: "#F8FAFF", border: `1px solid rgba(0,0,0,0.12)`, color: "#0D1828" }} />
        </div>
      </div>
      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${A.border}` }}>
        <button disabled={!note.trim()}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity"
          style={{ background: note.trim() ? A.red : "rgba(0,0,0,0.06)", opacity: note.trim() ? 1 : 0.5 }}>
          Confirm Suspension
        </button>
      </div>
    </div>
  );
}

// ── 35. Admin Reports & Analytics ───────────────────────────────────────────────
function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const data = {
    today: { requests: 9,   completed: 8,   active: 4,  cancelled: 1,  avgValue: 24500, trucks: 38, operators: 31, pending: 2,  cases: 3, rate: "89%" },
    week:  { requests: 61,  completed: 54,  active: 4,  cancelled: 3,  avgValue: 26200, trucks: 38, operators: 34, pending: 2,  cases: 3, rate: "93%" },
    month: { requests: 248, completed: 229, active: 4,  cancelled: 11, avgValue: 25800, trucks: 41, operators: 36, pending: 2,  cases: 3, rate: "95%" },
  }[period];
  const metrics = [
    { label: "Total Hauling Requests",  value: `${data.requests}`,   color: A.blue },
    { label: "Completed Hauling Jobs",  value: `${data.completed}`,  color: A.green },
    { label: "Active Bookings",         value: `${data.active}`,     color: A.orange },
    { label: "Cancelled Bookings",      value: `${data.cancelled}`,  color: A.red },
    { label: "Average Hauling Value",   value: `₱${data.avgValue.toLocaleString()}`, color: A.yellow },
    { label: "Verified Trucks",         value: `${data.trucks}`,     color: A.blue },
    { label: "Active Operators",        value: `${data.operators}`,  color: A.green },
    { label: "Pending Match Approvals", value: `${data.pending}`,    color: A.yellow },
    { label: "Open Cases",              value: `${data.cases}`,      color: A.red },
    { label: "Completion Rate",         value: data.rate,            color: A.green },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Reports & Analytics" subtitle="Hauling performance" onBack={onBack} />
      <div className="flex-shrink-0 flex gap-1 px-3 pt-3 pb-2">
        {(["today", "week", "month"] as const).map(t => (
          <button key={t} onClick={() => setPeriod(t)}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black capitalize transition-all"
            style={{ background: period === t ? A.orange : "rgba(0,0,0,0.03)", border: `1px solid ${period === t ? A.orange : A.border}`, color: period === t ? "white" : "#374151" }}>
            {t === "today" ? "Today" : t === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(m => (
            <div key={m.label} className="px-4 py-3.5 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p className="text-[8px] font-black tracking-wider mb-1" style={{ color: A.mutedFg }}>{m.label.toUpperCase()}</p>
              <p className="text-[20px] font-black" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 36. Audit Logs ─────────────────────────────────────────────────────────────
function AuditLogsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Audit Logs" subtitle="Admin action history" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {AUDIT_LOGS.map((l, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3.5 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white flex-shrink-0" style={{ background: A.blue }}>MR</div>
            <div className="flex-1">
              <p className="text-[11px] font-black" style={{ color: "#0D1828" }}>{l.action}</p>
              <p className="text-[10px]" style={{ color: A.mutedFg }}>Target: {l.target}</p>
              <p className="text-[10px]" style={{ color: A.muted }}>Admin: {l.admin}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold" style={{ color: "#0D1828" }}>{l.time}</p>
              <p className="text-[9px]" style={{ color: A.muted }}>{l.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 37. Admin Notifications ─────────────────────────────────────────────────────
function AdminNotificationsScreen({ onBack, items, onMarkRead, onOpen }: { onBack: () => void; items: UserNotification[]; onMarkRead: () => void; onOpen: (notification: UserNotification) => void }) {
  const unread = items.filter(n => !n.read).length;
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Notifications" subtitle={`${unread} unread`} onBack={onBack}
        right={unread > 0 ? <button onClick={onMarkRead} className="text-[10px] font-black px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(0,0,0,0.05)", color: A.mutedFg }}>Mark all read</button> : undefined} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {items.length === 0 && <AdminEmptyState type="no-notifications" />}
        {items.map(n => (
          <button key={n.id} type="button" onClick={() => onOpen(n)} className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl text-left" style={{ background: n.target === "sos" ? "#FEF2F2" : (n.read ? A.card : "#EEF2FF"), border: `1px solid ${n.target === "sos" ? "rgba(220,38,38,0.2)" : (n.read ? A.border : "rgba(29,85,214,0.15)")}` }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white" style={{ color: n.target === "sos" ? A.red : A.blue }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] font-black" style={{ color: "#0D1828" }}>{n.title}</span>
                <span className="text-[9px] shrink-0" style={{ color: A.muted }}>{new Date(n.time).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</span>
              </span>
              <span className="block text-[10px] leading-snug" style={{ color: A.mutedFg }}>{n.body}</span>
            </span>
            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: n.target === "sos" ? A.red : A.blue }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function SafetyScreen({ onGoTo, onBack, dispatch }: { onGoTo: (p: APage) => void; onBack: () => void; dispatch: Dispatch }) {
  const sosCount = (dispatch.customerSOS === "active" ? 1 : 0) + (dispatch.operatorSOS === "active" ? 1 : 0);
  const items: { label: string; sub: string; icon: string; page: APage; color: string }[] = [
    { label: "Active Hauling",       sub: `${LIVE_JOBS.length + (dispatch.status === "booked" && !isCompleted(dispatch) ? 1 : 0)} live bookings · tracking`, icon: "🚛", page: "live-jobs", color: A.green },
    { label: "SOS Alert Center",     sub: `${sosCount} active saved alerts`, icon: "🚨", page: "sos", color: A.red },
    { label: "Reported Problems",    sub: dispatch.problem ? `BK-8721 · ${dispatch.problem}` : "Problems reported by truck operators", icon: "⚠️", page: "problems", color: A.orange },
    { label: "GPS Map",              sub: "Demo GPS — Simulated Location", icon: "📍", page: "gps-map", color: A.blue },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Safety" subtitle="Active hauling, SOS & reported problems" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-2">
        {items.map(it => (
          <button key={it.label} onClick={() => onGoTo(it.page)} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-opacity active:opacity-70" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span className="text-2xl w-9 text-center">{it.icon}</span>
            <div className="flex-1">
              <p className="text-[13px] font-black" style={{ color: it.color }}>{it.label}</p>
              <p className="text-[10px]" style={{ color: A.mutedFg }}>{it.sub}</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 38. Admin Profile ───────────────────────────────────────────────────────────
function AdminProfileScreen({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const sections = [
    { icon: "👤", label: "Admin Profile",          sub: "Name, photo, contact" },
    { icon: "🔐", label: "Permissions",            sub: "Role & access level" },
    { icon: "🔒", label: "Security",               sub: "Password, 2FA, sessions" },
    { icon: "🔔", label: "Notification Settings",  sub: "Alerts & priorities" },
    { icon: "📋", label: "Audit Access",           sub: "View all admin actions" },
    { icon: "❓", label: "Help & Documentation",   sub: "Admin guide & FAQs" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="Admin Profile" subtitle="Account & settings" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 pb-3">
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: A.card, border: `1px solid ${A.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white" style={{ background: A.red }}>MR</div>
          <div>
            <p className="text-[15px] font-black" style={{ color: "#0D1828" }}>{ADMIN_USER.name}</p>
            <p className="text-[11px]" style={{ color: A.mutedFg }}>{ADMIN_USER.role}</p>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}>🛡️ SUPER ADMIN</span>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1px solid ${A.border}` }}>
          {sections.map((s, i, arr) => (
            <button key={s.label} className="w-full flex items-center gap-3 px-4 py-3.5 transition-opacity active:opacity-70" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${A.border}` : "none" }}>
              <span className="text-lg flex-shrink-0">{s.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: A.muted }}>{s.sub}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
        <button onClick={onLogout}
          className="w-full py-4 rounded-2xl font-black text-[13px] transition-opacity active:opacity-80"
          style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", color: A.red }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

// ── 39. More Menu ────────────────────────────────────────────────────────────────
function MoreMenuScreen({ onGoTo, onBack }: { onGoTo: (p: APage) => void; onBack: () => void }) {
  const items: { label: string; icon: string; page: APage; color: string }[] = [
    { label: "Users",                      icon: "👥", page: "users",         color: A.blue },
    { label: "Truck Operator Verification", icon: "👤", page: "driver-queue",  color: A.yellow },
    { label: "Truck Verification",         icon: "🚛", page: "vehicle-queue", color: A.yellow },
    { label: "Cases (Complaints & Cargo Issues)", icon: "📋", page: "complaints", color: A.orange },
    { label: "Payment Review",             icon: "🧾", page: "pay-review",        color: A.blue },
    { label: "Completed Hauling",          icon: "🏁", page: "completed-hauling", color: A.green },
    { label: "Payment Disputes",           icon: "💳", page: "disputes",      color: A.red },
    { label: "Reports & Analytics",        icon: "📊", page: "analytics",     color: A.blue },
    { label: "Hauling Rate Rules",         icon: "💰", page: "pricing",       color: A.green },
    { label: "Cargo Categories",           icon: "🗂️", page: "services",      color: A.blue },
    { label: "Service Areas",              icon: "📍", page: "areas",         color: A.orange },
    { label: "Reviews Moderation",         icon: "⭐", page: "reviews",       color: A.yellow },
    { label: "Audit Logs",                 icon: "📋", page: "audit",         color: A.purple },
    { label: "Account Suspension",         icon: "🔒", page: "suspension",    color: A.red },
    { label: "Identity Document Review",   icon: "🪪", page: "face-review",   color: A.yellow },
    { label: "Settings",                   icon: "⚙️",  page: "profile",       color: A.muted },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: A.bg }}>
      <BackHeader title="More" subtitle="Users, verification, cases & reports" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
        <div className="rounded-2xl overflow-hidden" style={{ background: A.card, border: `1px solid ${A.border}` }}>
          {items.map((item, i, arr) => (
            <button key={item.label} onClick={() => onGoTo(item.page)}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-opacity active:opacity-70"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${A.border}` : "none" }}>
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span className="flex-1 text-[12px] font-bold text-left" style={{ color: "#0D1828" }}>{item.label}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 39. Admin Bottom Navigation ─────────────────────────────────────────────────
function ABottomNav({ active, onChange }: { active: ATab; onChange: (t: ATab) => void }) {
  const tabs: { id: ATab; icon: string; label: string; alert?: boolean }[] = [
    { id: "home",   icon: "🏠", label: "Dashboard" },
    { id: "requests",    icon: "📥", label: "Requests" },
    { id: "assignments", icon: "🧭", label: "Assignments" },
    { id: "safety", icon: "🚨", label: "Safety",  alert: true },
    { id: "more",   icon: "⋯",  label: "More" },
  ];
  return (
    <nav aria-label="Admin navigation" className="app-navigation flex-shrink-0 px-1 py-1" style={{ background: "#FFFFFF", borderTop: `1px solid ${A.border}`, minHeight: "60px" }}>
      <div className="navigation-brand"><img src={kadaGoLogo} alt="KadaGo" /><p>Admin / Dispatch</p></div>
      <div className="navigation-items flex items-center w-full">
      {tabs.map(t => (
        <button key={t.id} aria-current={active === t.id ? "page" : undefined} onClick={() => onChange(t.id)} className="flex-1 relative flex flex-col items-center gap-0.5 py-1 rounded-xl transition-opacity active:opacity-70">
          <span className="text-base" style={{ filter: active === t.id ? "none" : "grayscale(1)", opacity: active === t.id ? 1 : 0.4 }}>{t.icon}</span>
          <span className="text-[8px] font-bold" style={{ color: active === t.id ? A.red : A.muted }}>{t.label}</span>
          {t.alert && <div className="absolute top-1 right-4 w-2 h-2 rounded-full" style={{ background: A.red }}/>}
        </button>
      ))}
      </div>
    </nav>
  );
}

// ── 40. Empty States ───────────────────────────────────────────────────────────
function AdminEmptyState({ type }: { type: string }) {
  const configs: Record<string, { icon: string; title: string; body: string }> = {
    "no-approvals":  { icon: "✅", title: "No Pending Approvals", body: "All operator and truck submissions have been reviewed." },
    "no-complaints": { icon: "😊", title: "No Active Complaints", body: "No open complaints at this time." },
    "no-notifications": { icon: "🔔", title: "You Are All Caught Up", body: "No notifications right now." },
    "no-sos":        { icon: "🟢", title: "No SOS Alerts", body: "Platform is currently safe. No active emergency alerts." },
    "no-disputes":   { icon: "💚", title: "No Payments to Review", body: "No payment disputes right now." },
    "no-jobs":       { icon: "📦", title: "No Active Hauling", body: "No active hauling bookings right now." },
    "no-permission": { icon: "🔒", title: "Permission Denied", body: "You do not have access to this section." },
    "network-error": { icon: "📶", title: "Network Error", body: "Unable to load data. Check connection and retry." },
  };
  const c = configs[type] ?? configs["network-error"];
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-16">
      <div className="text-5xl mb-4">{c.icon}</div>
      <h2 className="text-[17px] font-black mb-2" style={{ color: "#0D1828" }}>{c.title}</h2>
      <p className="text-[12px] leading-relaxed" style={{ color: A.mutedFg, maxWidth: "240px" }}>{c.body}</p>
    </div>
  );
}

// ── Main AdminPortal Component ──────────────────────────────────────────────────
export default function AdminPortal({ onLogout, dispatch, onDispatch }: AdminPortalProps) {
  const { notifications, markNotificationsRead, selected: selectedBooking, select, patch: patchBooking } = useBookings();
  const [page, setPage] = useState<APage>("home");
  const [hist, setHist] = useState<APage[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);

  const tab = TAB_OF[page];
  const goTo = (p: APage) => { setHist(h => [...h, page]); setPage(p); };
  const goBack = () => { const prev = hist[hist.length - 1]; setHist(h => h.slice(0, -1)); setPage(prev ?? "home"); };
  const toAssignment = () => { setHist(["assignments"]); setPage("assignment-detail"); };
  const goHome = () => { setHist([]); setPage("home"); };
  const openReview = () => { setReviewIdx(dispatch.matchIdx); goTo("request-review"); };

  const handleTabChange = (t: ATab) => {
    setHist([]);
    setPage(t === "safety" ? "safety" : t);
  };

  const renderContent = () => {
    switch (page) {
      case "home":            return <AdminDashboard onGoTo={goTo} dispatch={dispatch} onReviewMatch={openReview} onRate={() => goTo("rate")} onPrepare={() => goTo("prepare-quote")} onCancel={() => onDispatch({ cancelled: true })} notificationUnread={notifications.filter(n => !n.read).length} bookingLabel={selectedBooking?.bookingId || selectedBooking?.requestId || "Booking"} />;
      case "requests":        return <RequestsScreen dispatch={dispatch} onBack={goBack} onReview={openReview} onAssignment={() => goTo("assignment-detail")} onSuitableTrucks={() => goTo("compare")} />;
      case "request-review":  return <ReviewRequestScreen dispatch={dispatch} matchIdx={reviewIdx} onBack={goBack} onOthers={() => goTo("compare")}
                                onApprove={() => { void patchBooking({ status: "approved", matchIdx: reviewIdx }).then(ok => { if (ok) goTo("approved"); }); }} />;
      case "compare":         return <CompareScreen dispatch={dispatch} onBack={() => goTo("request-review")} onSelect={i => { setReviewIdx(i); goTo("request-review"); }} />;
      case "approved":        return <ApprovedScreen matchIdx={dispatch.matchIdx} onBack={goHome} onView={() => { goTo("assignment-detail"); }} />;
      case "assignments":     return <AssignmentsScreen dispatch={dispatch} onBack={goHome} onView={() => goTo("assignment-detail")} />;
      case "assignment-detail": return <AssignmentDetailScreen dispatch={dispatch} onBack={() => goTo("assignments")} onDispatch={onDispatch} onRate={() => goTo("rate")} onPrepare={() => goTo("prepare-quote")} onAgreement={() => goTo("agreement")} />;
      case "agreement":       return <AgreementScreen role="admin" dispatch={dispatch} onDispatch={onDispatch} onBack={() => goTo("assignment-detail")} />;
      case "rate":            return <RateScreen dispatch={dispatch} onBack={goHome} onDispatch={onDispatch} onPrepare={() => goTo("prepare-quote")} />;
      case "prepare-quote":   return <PrepareQuoteScreen dispatch={dispatch} onBack={() => goTo("rate")} onDispatch={onDispatch} onNext={() => goTo("review-quote")} />;
      case "review-quote":    return <ReviewQuoteScreen dispatch={dispatch} onBack={() => goTo("prepare-quote")} onEdit={() => goTo("prepare-quote")} onSend={async () => { if (await onDispatch({ status: "quote", quoteSent: true, quoteDecline: null }) !== false) goTo("quote-sent"); }} />;
      case "quote-sent":      return <QuoteSentScreen dispatch={dispatch} onBack={goHome} onView={() => { goTo("assignment-detail"); }} />;
      case "driver-queue": return <OperatorApplications onBack={goHome} />;
      case "driver-review": return <OperatorApplications onBack={() => goTo("driver-queue")} />;
      case "vehicle-queue": return <TruckRegistry onBack={goBack} />;
      case "vehicle-review": return <TruckRegistry onBack={goBack} />;
      case "face-review":     return <FaceReviewScreen onBack={() => goTo("more")} />;
      case "users":           return <UsersScreen onBack={goHome} />;
      case "live-jobs":       return <LiveJobsScreen onBack={goHome} onGPS={() => goTo("gps-map")} dispatch={dispatch} onTrack={() => goTo("hauling-track")} />;
      case "problems":        return <ReportedProblems dispatch={dispatch} onDispatch={onDispatch} onBack={goHome} onBooking={() => { goTo("assignment-detail"); }} />;
      case "hauling-track":   return <AdminTrack dispatch={dispatch} onDispatch={onDispatch} onBack={() => goTo("live-jobs")} />;
      case "gps-map":         return <AdminGPSMapScreen onBack={() => goTo("live-jobs")} />;
      case "safety":          return <SafetyScreen onGoTo={goTo} onBack={goHome} dispatch={dispatch} />;
      case "sos":             return <SOSAlertScreen onBack={goHome} dispatch={dispatch} onDispatch={onDispatch} booking={selectedBooking} onBooking={() => { goTo("assignment-detail"); }} onTracking={() => goTo("hauling-track")} />;
      case "complaints":
      case "complaint-detail": return <AdminCases onBack={goHome} onBooking={() => goTo("hauling-track")} onPayment={() => goTo("pay-review")} />;
      case "pay-review":      return <AdminPaymentReview d={dispatch} onDispatch={onDispatch} onBack={() => goTo("more")} onTrack={() => goTo("hauling-track")} />;
      case "completed-hauling": return <AdminCompleted d={dispatch} onBack={() => goTo("more")} />;
      case "disputes":        return <DisputesScreen dispatch={dispatch} onDispatch={onDispatch} onPayReview={() => goTo("pay-review")} onBack={goHome} />;
      case "pricing":         return <PricingScreen onBack={() => goTo("more")} />;
      case "services":        return <ServicesScreen onBack={() => goTo("more")} />;
      case "areas":           return <AreasScreen onBack={() => goTo("more")} />;
      case "reviews":         return <ReviewsModerationScreen onBack={() => goTo("more")} />;
      case "suspension":      return <SuspensionScreen onBack={() => goTo("more")} />;
      case "analytics":       return <AnalyticsScreen onBack={() => goTo("more")} />;
      case "audit":           return <AuditLogsScreen onBack={() => goTo("more")} />;
      case "notifications":   return <AdminNotificationsScreen onBack={goHome} items={notifications} onMarkRead={() => { void markNotificationsRead(); }} onOpen={notification => {
        select(notification.bookingRecordId);
        const t = notification.title;
        if (t.includes("SOS")) goTo("sos");
        else if (t.includes("Match")) openReview();
        else if (t.includes("Quotation Ready")) goTo("prepare-quote");
        else if (t.includes("Payment")) goTo("pay-review");
        else if (t.includes("Complaint")) goTo("complaints");
        else if (t.includes("Operator Awaiting")) goTo("driver-queue");
        else if (t.includes("Truck Doc") || t.includes("Document")) goTo("vehicle-queue");
        else { goTo("assignment-detail"); }
      }} />;
      case "profile":         return <AdminProfileScreen onBack={goHome} onLogout={onLogout} />;
      case "more":            return <MoreMenuScreen onGoTo={goTo} onBack={goHome} />;
    }
  };

  return (
    <div className="portal-layout h-full flex flex-col relative" style={{ background: A.bg }}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">{renderContent()}</div>
      <ABottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
