import { useState } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

// ── Tokens ────────────────────────────────────────────────────────────────────
const CA = {
  bg: "#F8FAFF", card: "#FFFFFF", cardJob: "#EEF2FF", cardJobBorder: "rgba(29,85,214,0.15)",
  orange: "#1D55D6", blue: "#1D55D6", green: "#16A34A", red: "#DC2626",
  yellow: "#EAB308", border: "rgba(0,0,0,0.08)", borderMd: "rgba(0,0,0,0.14)",
  muted: "#64748b", mutedFg: "#94a3b8", inputBg: "rgba(0,0,0,0.04)",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type CAPage = "list" | "details" | "receipt" | "rate" | "review-done" | "view-review" | "book-again" | "public-feedback";
type ActivityTab = "active" | "completed" | "canceled";

// ── Sample data ───────────────────────────────────────────────────────────────

interface Job {
  id: string; service: string; emoji: string; item: string;
  pickup: string; destination: string; driver: string; driverInitials: string; driverColor: string;
  vehicle: string; plate: string; fare: number; payment: string;
  date: string; time: string; status: "delivered" | "canceled-customer" | "canceled-driver" | "canceled-system";
  rated?: boolean; rating?: number; eta?: string;
}

const COMPLETED_JOBS: Job[] = [
  {
    id: "BK-8789", service: "Construction Materials", emoji: "🧱",
    item: "30 Sacks of Portland Cement (Type 1)",
    pickup: "ABC Construction Depot, Malaybalay City",
    destination: "Cagayan de Oro City Warehouse",
    driver: "Juan Dela Cruz", driverInitials: "JD", driverColor: "#1D55D6",
    vehicle: "Isuzu FVM 10-Wheeler Wing Van", plate: "ABC-1234",
    fare: 28500, payment: "Bank Transfer", date: "Sep 5, 2026", time: "3:42 PM",
    status: "delivered", rated: false,
  },
  {
    id: "BK-8775", service: "Agricultural Cargo", emoji: "🌾",
    item: "80 Sacks of Corn",
    pickup: "Don Carlos Grain Depot, Bukidnon",
    destination: "Cagayan de Oro City Warehouse",
    driver: "Rey Tamayo", driverInitials: "RT", driverColor: "#7C3AED",
    vehicle: "Isuzu Forward Dropside", plate: "DEF-5678",
    fare: 24000, payment: "Bank Transfer", date: "Sep 3, 2026", time: "8:15 AM",
    status: "delivered", rated: true, rating: 5,
  },
  {
    id: "BK-8760", service: "Other Commercial Cargo", emoji: "📦",
    item: "20 Cartons — Retail Stock",
    pickup: "Poblacion Warehouse, Malitbog, Bukidnon",
    destination: "Kalasungay, Malaybalay City",
    driver: "Danilo Cruz", driverInitials: "DC", driverColor: "#059669",
    vehicle: "Isuzu FVM 10-Wheeler Closed Van", plate: "GHI-9012",
    fare: 18500, payment: "Bank Transfer", date: "Sep 1, 2026", time: "11:30 AM",
    status: "delivered", rated: true, rating: 4,
  },
  {
    id: "BK-8741", service: "Construction Materials", emoji: "🧱",
    item: "Steel Bars — 2 tons",
    pickup: "Malaybalay Steel Supply",
    destination: "Brgy. 8 Jobsite, Malaybalay",
    driver: "Marlon Bautista", driverInitials: "MB", driverColor: "#DC2626",
    vehicle: "Isuzu Forward Dropside", plate: "JKL-3456",
    fare: 31000, payment: "Bank Transfer", date: "Aug 28, 2026", time: "2:00 PM",
    status: "delivered", rated: false,
  },
  {
    id: "BK-8720", service: "Bulky & Heavy Goods", emoji: "🏗️",
    item: "Industrial Machinery (1 unit)",
    pickup: "Purok 5, Brgy. Aglayan, Malaybalay City",
    destination: "Davao City Industrial Site",
    driver: "XYZ Trucking Services", driverInitials: "XZ", driverColor: "#374151",
    vehicle: "Isuzu FVM 10-Wheeler Closed Van", plate: "MNO-7890",
    fare: 45000, payment: "Bank Transfer", date: "Aug 22, 2026", time: "7:00 AM",
    status: "delivered", rated: false,
  },
];

const CANCELED_JOBS: Job[] = [
  {
    id: "BK-8710", service: "Construction Materials", emoji: "🧱",
    item: "20 Sacks of Sand & Gravel",
    pickup: "Brgy. Bangcud Materials Depot",
    destination: "Brgy. Laguitas, Malaybalay",
    driver: "Rogelio Mendoza", driverInitials: "RM", driverColor: "#D97706",
    vehicle: "Isuzu Forward Dropside", plate: "PQR-2345",
    fare: 22000, payment: "Bank Transfer", date: "Aug 20, 2026", time: "9:00 AM",
    status: "canceled-customer",
  },
  {
    id: "BK-8788", service: "Other Commercial Cargo", emoji: "📦",
    item: "Office Supplies — 1 pallet",
    pickup: "National Bookstore, CM Recto Ave.",
    destination: "Brgy. Linabo, Valencia City",
    driver: "—", driverInitials: "—", driverColor: CA.muted,
    vehicle: "Unassigned", plate: "—",
    fare: 19500, payment: "Bank Transfer", date: "Aug 15, 2026", time: "1:30 PM",
    status: "canceled-system",
  },
];

const ACTIVE_JOB: Job = {
  id: "BK-8789", service: "Construction Materials", emoji: "🧱",
  item: "30 Sacks of Portland Cement (Type 1)",
  pickup: "ABC Construction Depot, Malaybalay City",
  destination: "Cagayan de Oro City Warehouse",
  driver: "Juan Dela Cruz", driverInitials: "JD", driverColor: "#1D55D6",
  vehicle: "Isuzu FVM 10-Wheeler Wing Van", plate: "ABC-1234",
  fare: 28500, payment: "Bank Transfer", date: "Sep 6, 2026", time: "2:15 PM",
  status: "delivered", eta: "~12 mins",
};

const PUBLIC_REVIEWS = [
  { name: "Maria C.", rating: 5, service: "Construction Materials", date: "Sep 5, 2026", comment: "Juan Dela Cruz was very professional and arrived on time. All cargo secured properly. Highly recommended!" },
  { name: "Ricardo P.", rating: 5, service: "Agricultural Cargo", date: "Sep 4, 2026", comment: "Corn delivery arrived on schedule. The operator was professional and well coordinated." },
  { name: "Grace T.", rating: 4, service: "Other Commercial Cargo", date: "Sep 3, 2026", comment: "Good service overall. Cargo arrived safely. Minor delay but communicated well." },
  { name: "Bernardo L.", rating: 5, service: "Bulky & Heavy Goods", date: "Sep 2, 2026", comment: "The operator team handled our machinery carefully. Nothing was damaged." },
  { name: "Nena S.", rating: 5, service: "Construction Materials", date: "Aug 31, 2026", comment: "Quick and efficient. Cargo was covered and arrived dry." },
  { name: "Arnel G.", rating: 4, service: "Other Commercial Cargo", date: "Aug 28, 2026", comment: "Reliable service. The operator was friendly and updated me throughout the delivery." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Job["status"] }) {
  const map = {
    "delivered": { label: "Delivered", bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.25)", color: "#16A34A" },
    "canceled-customer": { label: "Canceled by You", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.2)", color: "#DC2626" },
    "canceled-driver": { label: "Canceled by Operator", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.2)", color: "#DC2626" },
    "canceled-system": { label: "Canceled by System", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)", color: "#92400E" },
  };
  const s = map[status];
  return (
    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
}

function DriverAvatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.32 }}>
      {initials}
    </div>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n <= rating ? CA.yellow : "rgba(0,0,0,0.12)"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function BackHeader({ title, subtitle, onBack, right }: {
  title: string; subtitle?: string; onBack: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${CA.border}` }}>
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
          style={{ background: CA.inputBg, border: `1px solid ${CA.border}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "40px", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-black leading-tight" style={{ color: "#0D1828" }}>{title}</h1>
          {subtitle && <p className="text-[10px]" style={{ color: CA.mutedFg }}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, body, action, onAction }: {
  icon: string; title: string; body: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-[15px] font-black mb-2" style={{ color: "#0D1828" }}>{title}</h3>
      <p className="text-[12px] leading-relaxed mb-6" style={{ color: CA.mutedFg }}>{body}</p>
      {action && onAction && (
        <button onClick={onAction}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          {action}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      )}
    </div>
  );
}

// ── Active tab ────────────────────────────────────────────────────────────────

function ActiveTab({ onTrackLive, onBook }: { onTrackLive: () => void; onBook: () => void }) {
  return (
    <div className="px-3 pt-3 pb-3">
      {/* Active job card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CA.cardJob, border: `1px solid ${CA.cardJobBorder}` }}>
        <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(29,85,214,0.12)` }}>
          <div>
            <span className="text-[9px] font-black tracking-wider" style={{ color: CA.blue }}>ACTIVE HAULING</span>
            <p className="text-[13px] font-black" style={{ color: "#0D1828" }}>{ACTIVE_JOB.emoji} {ACTIVE_JOB.service}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: CA.green, animation: "livenessBlip 1.4s ease-in-out infinite" }}/>
              <span className="text-[9px] font-black" style={{ color: CA.green }}>LIVE</span>
            </div>
            <span className="text-[10px] font-black" style={{ color: CA.orange }}>ETA {ACTIVE_JOB.eta}</span>
          </div>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <DriverAvatar initials={ACTIVE_JOB.driverInitials} color={ACTIVE_JOB.driverColor} size={32} />
            <div>
              <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{ACTIVE_JOB.driver}</p>
              <p className="text-[10px]" style={{ color: CA.mutedFg }}>{ACTIVE_JOB.vehicle}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[15px] font-black" style={{ color: CA.orange }}>₱{ACTIVE_JOB.fare}</p>
              <p className="text-[9px]" style={{ color: CA.mutedFg }}>{ACTIVE_JOB.payment}</p>
            </div>
          </div>

          {[
            { dot: CA.blue, label: "Pickup", val: ACTIVE_JOB.pickup },
            { dot: CA.orange, label: "Drop-off", val: ACTIVE_JOB.destination },
          ].map(r => (
            <div key={r.label} className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: r.dot }}/>
              <div>
                <p className="text-[9px]" style={{ color: CA.mutedFg }}>{r.label}</p>
                <p className="text-[11px] font-semibold leading-snug" style={{ color: "#0D1828" }}>{r.val}</p>
              </div>
            </div>
          ))}

          <button onClick={onTrackLive}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[12px] text-white mt-1 transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></svg>
            Track Cargo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Completed tab ─────────────────────────────────────────────────────────────

function CompletedTab({ onDetails, onReceipt, onRate, onBookAgain, onViewReview }: {
  onDetails: (j: Job) => void; onReceipt: (j: Job) => void; onRate: (j: Job) => void;
  onBookAgain: (j: Job) => void; onViewReview: (j: Job) => void;
}) {
  return (
    <div className="px-3 pt-3 pb-3 space-y-3">
      {COMPLETED_JOBS.map(job => (
        <div key={job.id} className="rounded-2xl overflow-hidden" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Header row */}
          <div className="px-4 pt-3 pb-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{job.emoji}</span>
              <div>
                <p className="text-[12px] font-black leading-tight" style={{ color: "#0D1828" }}>{job.service}</p>
                <p className="text-[10px]" style={{ color: CA.muted }}>{job.id}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={job.status} />
              <p className="text-[10px] mt-1" style={{ color: CA.muted }}>{job.date}</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-[11px]" style={{ color: CA.mutedFg }}>
              <span className="font-semibold" style={{ color: "#374151" }}>{job.item}</span>
            </p>

            {[
              { dot: CA.blue, label: "From", val: job.pickup },
              { dot: CA.orange, label: "To", val: job.destination },
            ].map(r => (
              <div key={r.label} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: r.dot }}/>
                <div className="min-w-0">
                  <span className="text-[9px]" style={{ color: CA.muted }}>{r.label} · </span>
                  <span className="text-[10px] font-semibold leading-snug" style={{ color: "#374151" }}>{r.val}</span>
                </div>
              </div>
            ))}

            {/* Driver + fare row */}
            <div className="flex items-center gap-2.5 pt-1" style={{ borderTop: `1px solid ${CA.border}` }}>
              <DriverAvatar initials={job.driverInitials} color={job.driverColor} size={28} />
              <div className="flex-1">
                <p className="text-[11px] font-bold" style={{ color: "#0D1828" }}>{job.driver}</p>
                <p className="text-[10px]" style={{ color: CA.mutedFg }}>{job.vehicle}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-black" style={{ color: CA.orange }}>₱{job.fare.toLocaleString()}</p>
                <p className="text-[9px]" style={{ color: CA.mutedFg }}>{job.payment}</p>
              </div>
            </div>

            {/* Rating if submitted */}
            {job.rated && job.rating && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                <StarRow rating={job.rating} size={12} />
                <span className="text-[10px] font-bold" style={{ color: "#92400E" }}>You rated {job.rating}.0</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-3 flex gap-2 flex-wrap">
            <button onClick={() => onDetails(job)}
              className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center transition-opacity active:opacity-70 min-w-[72px]"
              style={{ background: CA.inputBg, border: `1px solid ${CA.border}`, color: "#374151" }}>
              Details
            </button>
            <button onClick={() => onReceipt(job)}
              className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center transition-opacity active:opacity-70 min-w-[72px]"
              style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.2)", color: CA.blue }}>
              E-Receipt
            </button>
            {job.rated
              ? (
                <button onClick={() => onViewReview(job)}
                  className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center transition-opacity active:opacity-70 min-w-[72px]"
                  style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "#92400E" }}>
                  View Review
                </button>
              ) : (
                <button onClick={() => onRate(job)}
                  className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center transition-opacity active:opacity-70 min-w-[72px]"
                  style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "#92400E" }}>
                  Rate Operator
                </button>
              )
            }
            <button onClick={() => onBookAgain(job)}
              className="w-full py-2.5 rounded-xl text-[11px] font-black text-white text-center transition-opacity active:opacity-80 mt-0.5"
              style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
              Request Again
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Canceled tab ──────────────────────────────────────────────────────────────

function CanceledTab({ onBookAgain }: { onBookAgain: (j: Job) => void }) {
  const refundLabel = (s: Job["status"]) => {
    if (s === "canceled-customer") return { text: "No charge made", color: CA.green };
    if (s === "canceled-system") return { text: "Simulated record only", color: CA.blue };
    return { text: "Simulated record only", color: CA.yellow };
  };

  if (CANCELED_JOBS.length === 0) {
    return <EmptyState icon="✅" title="No Canceled Bookings" body="You have not canceled any bookings. Great consistency!" />;
  }

  return (
    <div className="px-3 pt-3 pb-3 space-y-3">
      {CANCELED_JOBS.map(job => {
        const refund = refundLabel(job.status);
        return (
          <div key={job.id} className="rounded-2xl overflow-hidden" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${CA.border}` }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{job.emoji}</span>
                <div>
                  <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{job.service}</p>
                  <p className="text-[10px]" style={{ color: CA.muted }}>{job.id}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={job.status} />
                <p className="text-[10px] mt-1" style={{ color: CA.muted }}>{job.date}</p>
              </div>
            </div>

            <div className="px-4 py-3 space-y-2">
              {[
                { dot: CA.blue, label: "From", val: job.pickup },
                { dot: CA.orange, label: "To", val: job.destination },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: r.dot }}/>
                  <div>
                    <span className="text-[9px]" style={{ color: CA.muted }}>{r.label} · </span>
                    <span className="text-[10px] font-semibold leading-snug" style={{ color: "#374151" }}>{r.val}</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: CA.inputBg, border: `1px solid ${CA.border}` }}>
                <div>
                  <p className="text-[10px]" style={{ color: CA.mutedFg }}>Payment</p>
                  <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>₱{job.fare.toLocaleString()} · {job.payment}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px]" style={{ color: CA.mutedFg }}>Payment Record</p>
                  <p className="text-[10px] font-bold" style={{ color: refund.color }}>{refund.text}</p>
                </div>
              </div>

              {job.status === "canceled-customer" && (
                <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)" }}>
                  <p className="text-[10px]" style={{ color: "#DC2626" }}>Canceled within free window — no cancellation fee charged.</p>
                </div>
              )}
              {job.status === "canceled-system" && (
                <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <p className="text-[10px]" style={{ color: "#92400E" }}>No truck assignment was confirmed in time. Request auto-canceled.</p>
                </div>
              )}
            </div>

            <div className="px-4 pb-3 flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-opacity active:opacity-70"
                style={{ background: CA.inputBg, border: `1px solid ${CA.border}`, color: "#374151" }}>
                View Details
              </button>
              <button onClick={() => onBookAgain(job)}
                className="flex-1 py-2.5 rounded-xl text-[11px] font-black text-white transition-opacity active:opacity-80"
                style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
                Request Again
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Job Details screen ────────────────────────────────────────────────────────

function JobDetailsScreen({ job, onBack, onReceipt, onRate, onBookAgain }: {
  job: Job; onBack: () => void; onReceipt: () => void; onRate: () => void; onBookAgain: () => void;
}) {
  const timeline = [
    "Operator Assigned", "Heading to Pickup", "Arrived at Pickup",
    "Cargo Loaded", "In Transit", "Near Destination", "Delivered",
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      <BackHeader title="Booking Details" subtitle={`${job.id} · ${job.date}`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: CA.cardJob, border: `1px solid ${CA.cardJobBorder}` }}>
          <div>
            <p className="text-[11px]" style={{ color: CA.blue }}>JOB STATUS</p>
            <p className="text-[15px] font-black" style={{ color: "#0D1828" }}>{job.emoji} {job.service}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Job info */}
        <div className="rounded-2xl overflow-hidden" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: CA.mutedFg }}>BOOKING DETAILS</p>
          </div>
          {[
            { label: "Booking ID", value: job.id },
            { label: "Date", value: `${job.date} · ${job.time}` },
            { label: "Customer", value: "Maria Clara Santos" },
            { label: "Item", value: job.item },
            { label: "Pickup", value: job.pickup },
            { label: "Destination", value: job.destination },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${CA.border}` : "none" }}>
              <span className="text-[10px] flex-shrink-0 pt-0.5" style={{ color: CA.mutedFg, minWidth: "68px" }}>{r.label}</span>
              <span className="text-[11px] font-semibold leading-snug" style={{ color: "#374151" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Driver */}
        <div className="rounded-2xl overflow-hidden" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: CA.mutedFg }}>OPERATOR & TRUCK</p>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <DriverAvatar initials={job.driverInitials} color={job.driverColor} size={44} />
            <div className="flex-1">
              <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>{job.driver}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: CA.green }}>VERIFIED</span>
                <span className="text-[10px]" style={{ color: "#92400E" }}>⭐ 4.9</span>
              </div>
            </div>
          </div>
          {[
            { label: "Vehicle", value: job.vehicle },
            { label: "Plate", value: job.plate },
            { label: "Final Hauling Rate", value: `₱${job.fare.toLocaleString()}`, highlight: true },
            { label: "Payment", value: job.payment },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: `1px solid ${CA.border}`, borderBottom: i < arr.length - 1 ? "none" : "none" }}>
              <span className="text-[10px] flex-shrink-0" style={{ color: CA.mutedFg, minWidth: "68px" }}>{r.label}</span>
              <span className="text-[12px] font-bold leading-snug" style={{ color: r.highlight ? CA.orange : "#374151" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Delivery timeline */}
        <div className="px-4 py-4 rounded-2xl" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: CA.mutedFg }}>DELIVERY TIMELINE</p>
          {timeline.map((step, i) => {
            const done = true;
            return (
              <div key={step} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: CA.green }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {i < timeline.length - 1 && <div className="w-px my-0.5" style={{ height: "14px", background: CA.green }}/>}
                </div>
                <div className="pb-1">
                  <p className="text-[11px] font-semibold leading-tight" style={{ color: CA.green, textDecoration: done ? "none" : "none" }}>{step}</p>
                  {step === "Delivered" && <p className="text-[9px] mt-0.5" style={{ color: CA.muted }}>{job.date} · {job.time}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2" style={{ background: "#FFFFFF", borderTop: `1px solid ${CA.border}` }}>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onReceipt}
            className="py-3 rounded-xl text-[11px] font-bold transition-opacity active:opacity-70"
            style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.2)", color: CA.blue }}>
            📄 E-Receipt
          </button>
          <button onClick={onRate}
            className="py-3 rounded-xl text-[11px] font-bold transition-opacity active:opacity-70"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "#92400E" }}>
            ⭐ Rate Operator
          </button>
        </div>
        <button onClick={onBookAgain}
          className="w-full py-3.5 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          Request Again
        </button>
      </div>
    </div>
  );
}

// ── E-Receipt screen ──────────────────────────────────────────────────────────

function EReceiptScreen({ job, onBack }: { job: Job; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      <BackHeader title="E-Receipt" subtitle={`${job.id} · Completed`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Receipt header */}
          <div className="flex flex-col items-center px-4 py-5" style={{ background: "linear-gradient(180deg, rgba(29,85,214,0.06) 0%, transparent 100%)", borderBottom: `1px solid ${CA.border}` }}>
            <img src={kadaGoLogo} alt="KadaGo" style={{ width: "80px", marginBottom: "8px" }} />
            <p className="text-[9px] font-black tracking-widest" style={{ color: CA.mutedFg }}>OFFICIAL E-RECEIPT</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[22px] font-black" style={{ color: CA.orange }}>₱{job.fare.toLocaleString()}.00</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={CA.green} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-[10px] font-black" style={{ color: CA.green }}>PAID · {job.payment}</span>
            </div>
          </div>

          {/* Transaction */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: CA.mutedFg }}>TRANSACTION</p>
            {[
              { label: "Booking ID",         value: job.id },
              { label: "Transaction ID", value: `TXN-2026-${job.id.replace("KG-", "")}` },
              { label: "Date",           value: job.date },
              { label: "Completion",     value: job.time },
            ].map(r => (
              <div key={r.label} className="flex items-start gap-3 py-1.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
                <span className="text-[10px] flex-shrink-0" style={{ color: CA.mutedFg, minWidth: "84px" }}>{r.label}</span>
                <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* People */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: CA.mutedFg }}>PARTIES</p>
            {[
              { label: "Customer", value: "Maria Clara Santos" },
              { label: "Driver",   value: `${job.driver} — Verified` },
            ].map(r => (
              <div key={r.label} className="flex items-start gap-3 py-1.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
                <span className="text-[10px] flex-shrink-0" style={{ color: CA.mutedFg, minWidth: "84px" }}>{r.label}</span>
                <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Service */}
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: CA.mutedFg }}>SERVICE</p>
            {[
              { label: "Category",    value: `${job.emoji} ${job.service}` },
              { label: "Vehicle",     value: job.vehicle },
              { label: "Plate",       value: job.plate },
              { label: "Pickup",      value: job.pickup },
              { label: "Destination", value: job.destination },
            ].map(r => (
              <div key={r.label} className="flex items-start gap-3 py-1.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
                <span className="text-[10px] flex-shrink-0" style={{ color: CA.mutedFg, minWidth: "84px" }}>{r.label}</span>
                <span className="text-[11px] font-semibold leading-snug" style={{ color: "#374151" }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Hauling rate breakdown */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: CA.mutedFg }}>FARE BREAKDOWN</p>
            {[
              { label: "Agreed Hauling Rate",  value: `₱${job.fare.toLocaleString()}` },
              { label: "Helper Fee",   value: "Included" },
              { label: "Extra Charge", value: "₱0" },
              { label: "Discount",     value: "₱0" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
                <span className="text-[11px]" style={{ color: CA.mutedFg }}>{r.label}</span>
                <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>{r.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="text-[13px] font-black" style={{ color: "#0D1828" }}>TOTAL PAID</span>
              <span className="text-[20px] font-black" style={{ color: CA.orange }}>₱{job.fare.toLocaleString()}.00</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: `1px solid ${CA.border}`, background: "rgba(0,0,0,0.02)" }}>
            <p className="text-center text-[9px] leading-relaxed" style={{ color: CA.muted }}>
              Official KadaGo E-Receipt · For disputes contact support@kadago.ph within 48 hrs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button className="py-3.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
            style={{ background: CA.inputBg, border: `1px solid ${CA.border}`, color: "#374151" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={CA.mutedFg} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
          <button className="py-3.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
            style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.2)", color: CA.blue }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={CA.blue} strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>

        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${CA.border}` }}>
        <button onClick={onBack}
          className="w-full py-3.5 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          Back to Activity
        </button>
      </div>
    </div>
  );
}

// ── Rate Operator screen ────────────────────────────────────────────────────────

const RATE_CATEGORIES = ["Driver Professionalism", "Communication", "Safety", "Timeliness", "Vehicle Condition", "Cargo Handling"];

function RateDriverScreen({ job, onSubmit, onBack }: {
  job: Job; onSubmit: (rating: number) => void; onBack: () => void;
}) {
  const [overall, setOverall] = useState(5);
  const [cats, setCats] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      <BackHeader title="Rate Your Truck Operator" subtitle="How was your KadaGo experience?" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Driver card */}
        <div className="flex flex-col items-center text-center mb-5">
          <DriverAvatar initials={job.driverInitials} color={job.driverColor} size={56} />
          <p className="text-[16px] font-black mt-3" style={{ color: "#0D1828" }}>{job.driver}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: CA.green }}>VERIFIED DRIVER</span>
            <span className="text-[10px]" style={{ color: CA.mutedFg }}>· {job.id}</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: CA.mutedFg }}>{job.vehicle}</p>
        </div>

        {/* Overall stars */}
        <div className="flex flex-col items-center mb-5">
          <p className="text-[11px] mb-3 font-semibold" style={{ color: CA.mutedFg }}>Overall Rating</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setOverall(n)}>
                <svg width="40" height="40" viewBox="0 0 24 24"
                  fill={n <= overall ? CA.yellow : "rgba(0,0,0,0.12)"}
                  className="transition-all"
                  style={{ filter: n <= overall ? "drop-shadow(0 0 6px rgba(234,179,8,0.5))" : "none" }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <p className="text-[13px] font-bold mt-2" style={{ color: "#0D1828" }}>
            {overall === 5 ? "Excellent!" : overall === 4 ? "Very Good" : overall === 3 ? "Good" : overall === 2 ? "Fair" : "Poor"}
          </p>
        </div>

        {/* Category ratings */}
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: CA.mutedFg }}>RATE BY CATEGORY</p>
          <div className="space-y-2.5">
            {RATE_CATEGORIES.map(cat => {
              const val = cats[cat] ?? 5;
              return (
                <div key={cat} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: CA.inputBg, border: `1px solid ${CA.border}` }}>
                  <span className="text-[11px] font-semibold flex-1" style={{ color: "#374151" }}>{cat}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setCats(prev => ({ ...prev, [cat]: n }))}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={n <= val ? CA.yellow : "rgba(0,0,0,0.12)"}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment box */}
        <div className="mb-3">
          <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: CA.mutedFg }}>YOUR REVIEW</p>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Tell us about your experience…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-[12px] resize-none outline-none placeholder-gray-400"
            style={{ background: "#FFFFFF", border: `1px solid rgba(0,0,0,0.12)`, color: "#374151" }}/>
        </div>

        {/* Upload photo */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3" style={{ background: CA.inputBg, border: `1px solid ${CA.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CA.mutedFg} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold" style={{ color: "#374151" }}>Upload Photo</p>
            <p className="text-[10px]" style={{ color: CA.mutedFg }}>Optional — share a photo of your delivery</p>
          </div>
          <button className="text-[11px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(29,85,214,0.08)", color: CA.blue, border: "1px solid rgba(29,85,214,0.2)" }}>
            Choose
          </button>
        </div>

        {/* Public toggle */}
        <button onClick={() => setIsPublic(v => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-opacity active:opacity-70"
          style={{ background: CA.inputBg, border: `1px solid ${CA.border}` }}>
          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: isPublic ? CA.green : "rgba(0,0,0,0.08)", border: isPublic ? "none" : "1px solid rgba(0,0,0,0.15)" }}>
            {isPublic && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span className="text-[12px] font-semibold" style={{ color: "#374151" }}>Show my review publicly</span>
        </button>

        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2.5" style={{ background: "#FFFFFF", borderTop: `1px solid ${CA.border}` }}>
        <button onClick={() => onSubmit(overall)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          Submit Review
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button onClick={onBack}
          className="w-full py-3 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${CA.border}`, color: "#64748b" }}>
          Skip for Now
        </button>
      </div>
    </div>
  );
}

// ── Review Submitted screen ───────────────────────────────────────────────────

function ReviewSubmittedScreen({ rating, onActivity, onHome }: {
  rating: number; onActivity: () => void; onHome: () => void;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center" style={{ background: CA.bg }}>
      <img src={kadaGoLogo} alt="KadaGo" style={{ width: "100px", marginBottom: "24px" }} />

      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.35)", animation: "successBounce 0.65s cubic-bezier(.22,1,.36,1) forwards" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={CA.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div className="px-3 py-1 rounded-full mb-3" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.22)" }}>
        <span className="text-[10px] font-black tracking-wider" style={{ color: CA.green }}>REVIEW SUBMITTED</span>
      </div>

      <h2 className="text-xl font-black mb-2" style={{ color: "#0D1828" }}>Thank You for Your Feedback!</h2>
      <p className="text-[12px] leading-relaxed mb-6" style={{ color: CA.mutedFg, maxWidth: "260px" }}>
        Your review helps KadaGo maintain safe and reliable service for everyone.
      </p>

      <div className="flex flex-col items-center gap-1 mb-8 px-6 py-4 rounded-2xl" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <p className="text-[10px]" style={{ color: CA.mutedFg }}>Your Rating</p>
        <p className="text-[32px] font-black" style={{ color: CA.yellow }}>{rating}.0 ★</p>
        <StarRow rating={rating} size={20} />
      </div>

      <div className="w-full space-y-2.5">
        <button onClick={onActivity}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          Back to Activity
        </button>
        <button onClick={onHome}
          className="w-full py-3 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${CA.border}`, color: "#64748b" }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── View My Review screen ─────────────────────────────────────────────────────

function ViewReviewScreen({ job, onBack }: { job: Job; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      <BackHeader title="My Review" subtitle={`${job.id} · ${job.date}`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Driver */}
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl mb-3" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <DriverAvatar initials={job.driverInitials} color={job.driverColor} size={44} />
          <div className="flex-1">
            <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>{job.driver}</p>
            <p className="text-[10px]" style={{ color: CA.mutedFg }}>{job.vehicle} · {job.id}</p>
            <p className="text-[10px] mt-0.5" style={{ color: CA.muted }}>{job.date}</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-black" style={{ color: CA.yellow }}>{job.rating}.0</p>
            <StarRow rating={job.rating ?? 5} size={12} />
          </div>
        </div>

        {/* Category ratings */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: CA.mutedFg }}>CATEGORY RATINGS</p>
          </div>
          {RATE_CATEGORIES.map((cat, i, arr) => (
            <div key={cat} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${CA.border}` : "none" }}>
              <span className="text-[11px]" style={{ color: "#374151" }}>{cat}</span>
              <StarRow rating={job.rating ?? 5} size={12} />
            </div>
          ))}
        </div>

        {/* Comment */}
        <div className="px-4 py-4 rounded-2xl mb-3" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black tracking-wider" style={{ color: CA.mutedFg }}>YOUR COMMENT</p>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black" style={{ background: "rgba(22,163,74,0.1)", color: CA.green }}>VERIFIED REVIEW</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "#374151" }}>
            Juan Dela Cruz was very professional and arrived on time. All cargo was secured properly. Will definitely book again!
          </p>
        </div>

        {/* Edit note */}
        <div className="px-4 py-3 rounded-xl mb-4" style={{ background: CA.inputBg, border: `1px solid ${CA.border}` }}>
          <p className="text-[10px]" style={{ color: CA.mutedFg }}>Reviews can be edited within 7 days of submission.</p>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${CA.border}` }}>
        <button
          className="w-full py-3.5 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          Edit Review
        </button>
      </div>
    </div>
  );
}

// ── Request Again modal ──────────────────────────────────────────────────────────

function BookAgainModal({ job, onContinue, onCancel }: {
  job: Job; onContinue: () => void; onCancel: () => void;
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      <BackHeader title="Book This Service Again?" subtitle="Review pre-filled details below" onBack={onCancel} />

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Service badge */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4" style={{ background: CA.cardJob, border: `1px solid ${CA.cardJobBorder}` }}>
          <span className="text-2xl">{job.emoji}</span>
          <div>
            <p className="text-[9px] font-black tracking-wider" style={{ color: CA.blue }}>PREVIOUS SERVICE</p>
            <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>{job.service}</p>
          </div>
        </div>

        {/* Pre-filled details */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${CA.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: CA.mutedFg }}>PRE-FILLED DETAILS</p>
          </div>
          {[
            { label: "Service",     value: job.service },
            { label: "Item / Cargo",value: job.item },
            { label: "Pickup",      value: job.pickup },
            { label: "Destination", value: job.destination },
            { label: "Vehicle",     value: job.vehicle },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${CA.border}` : "none" }}>
              <span className="text-[10px] flex-shrink-0 pt-0.5" style={{ color: CA.mutedFg, minWidth: "68px" }}>{r.label}</span>
              <span className="text-[11px] font-semibold leading-snug" style={{ color: "#374151" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Pricing notice */}
        <div className="px-4 py-3.5 rounded-2xl mb-4" style={{ background: "rgba(244,123,32,0.07)", border: "1px solid rgba(244,123,32,0.2)" }}>
          <div className="flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CA.orange} strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p className="text-[11px] font-bold mb-0.5" style={{ color: "#0D1828" }}>Pricing Notice</p>
              <p className="text-[10px] leading-relaxed" style={{ color: "#92400E" }}>
                Current pricing may vary based on availability, distance, and pricing floors. The previous fare of ₱{job.fare.toLocaleString()} is not guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2.5" style={{ background: "#FFFFFF", borderTop: `1px solid ${CA.border}` }}>
        <button onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${CA.orange}, #1447B8)` }}>
          Continue to Booking
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button onClick={onCancel}
          className="w-full py-3 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${CA.border}`, color: "#64748b" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Public Feedback screen ────────────────────────────────────────────────────

type FeedbackFilter = "all" | "customer" | "operator" | "latest" | "highest";

function PublicFeedbackScreen({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<FeedbackFilter>("all");
  const filters: { id: FeedbackFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "customer", label: "Customer" },
    { id: "operator", label: "Operator" },
    { id: "latest", label: "Latest" },
    { id: "highest", label: "Highest" },
  ];
  const ratingDist = [
    { stars: 5, count: 1840, pct: 92 },
    { stars: 4, count: 120, pct: 6 },
    { stars: 3, count: 30, pct: 1.5 },
    { stars: 2, count: 6, pct: 0.3 },
    { stars: 1, count: 4, pct: 0.2 },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      <BackHeader title="Reviews & Feedback" subtitle="KadaGo verified reviews" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        {/* Overall score */}
        <div className="px-4 py-4" style={{ background: CA.card, borderBottom: `1px solid ${CA.border}` }}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[40px] font-black leading-none" style={{ color: CA.yellow }}>4.92</p>
              <p className="text-[10px]" style={{ color: CA.mutedFg }}>out of 5.0</p>
              <StarRow rating={5} size={14} />
            </div>
            <div className="flex-1 space-y-1.5">
              {ratingDist.map(r => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-[10px] w-3 text-right" style={{ color: CA.mutedFg }}>{r.stars}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={CA.yellow}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.stars >= 4 ? CA.green : r.stars === 3 ? CA.yellow : CA.red }}/>
                  </div>
                  <span className="text-[9px] w-8" style={{ color: CA.muted }}>{r.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: CA.mutedFg }}>Based on 2,000 verified reviews</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-3 py-3 overflow-x-auto" style={{ borderBottom: `1px solid ${CA.border}` }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all"
              style={{ background: filter === f.id ? CA.orange : CA.inputBg, color: filter === f.id ? "white" : CA.mutedFg, border: `1px solid ${filter === f.id ? CA.orange : CA.border}` }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Reviews */}
        <div className="px-3 pt-3 pb-4 space-y-3">
          {PUBLIC_REVIEWS.map((r, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: CA.card, border: `1px solid ${CA.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: `1px solid ${CA.border}` }}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: CA.blue }}>
                      {r.name[0]}
                    </div>
                    <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{r.name}</p>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: CA.green }}>VERIFIED</span>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <StarRow rating={r.rating} size={11} />
                    <span className="text-[9px]" style={{ color: CA.muted }}>{r.date}</span>
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: CA.inputBg, color: CA.mutedFg }}>
                  {r.service}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-[12px] leading-relaxed" style={{ color: "#374151" }}>{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Activity List screen ──────────────────────────────────────────────────────

function ActivityListScreen({ tab, setTab, onJob, onReceipt, onRate, onViewReview, onBookAgain, onTrackLive, onBook }: {
  tab: ActivityTab; setTab: (t: ActivityTab) => void;
  onJob: (j: Job) => void; onReceipt: (j: Job) => void; onRate: (j: Job) => void;
  onViewReview: (j: Job) => void; onBookAgain: (j: Job) => void;
  onTrackLive: () => void; onBook: () => void;
}) {
  const TABS: { id: ActivityTab; label: string; count?: number }[] = [
    { id: "active",    label: "Active",    count: 1 },
    { id: "completed", label: "Completed", count: COMPLETED_JOBS.length },
    { id: "canceled",  label: "Canceled",  count: CANCELED_JOBS.length },
  ];

  return (
    <>
      {/* Tab row */}
      <div className="flex-shrink-0 flex gap-0 px-4 pt-3 pb-0" style={{ borderBottom: `1px solid ${CA.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 pb-2.5 flex items-center justify-center gap-1.5 text-[12px] font-black transition-all"
            style={{ color: tab === t.id ? CA.blue : CA.muted, borderBottom: tab === t.id ? `2px solid ${CA.blue}` : "2px solid transparent" }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: tab === t.id ? "rgba(29,85,214,0.1)" : "rgba(0,0,0,0.06)", color: tab === t.id ? CA.blue : CA.muted }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "active" && <ActiveTab onTrackLive={onTrackLive} onBook={onBook} />}
        {tab === "completed" && (
          COMPLETED_JOBS.length === 0
            ? <EmptyState icon="📋" title="No Completed Bookings" body="Your completed hauling bookings will appear here." action="Request a Truck" onAction={onBook} />
            : <CompletedTab onDetails={onJob} onReceipt={onReceipt} onRate={onRate} onViewReview={onViewReview} onBookAgain={onBookAgain} />
        )}
        {tab === "canceled" && <CanceledTab onBookAgain={onBookAgain} />}
      </div>
    </>
  );
}

// ── Main CustomerActivity Component ───────────────────────────────────────────

interface CustomerActivityProps {
  initialPage?: CAPage;
  onClose: () => void;
  onTrackLive: () => void;
  onBookAgain: () => void;
}

export default function CustomerActivity({ initialPage = "list", onClose, onTrackLive, onBookAgain }: CustomerActivityProps) {
  const [page, setPage] = useState<CAPage>(initialPage);
  const [tab, setTab] = useState<ActivityTab>("completed");
  const [selectedJob, setSelectedJob] = useState<Job>(COMPLETED_JOBS[0]);
  const [submittedRating, setSubmittedRating] = useState(5);

  const goToList = () => setPage("list");

  const handleJobSelect = (j: Job) => { setSelectedJob(j); setPage("details"); };
  const handleReceipt  = (j: Job) => { setSelectedJob(j); setPage("receipt"); };
  const handleRate     = (j: Job) => { setSelectedJob(j); setPage("rate"); };
  const handleViewReview = (j: Job) => { setSelectedJob(j); setPage("view-review"); };
  const handleBookAgain  = (j: Job) => { setSelectedJob(j); setPage("book-again"); };
  const handleRateSubmit = (rating: number) => { setSubmittedRating(rating); setPage("review-done"); };

  const renderPage = () => {
    switch (page) {
      case "list":
        return (
          <ActivityListScreen
            tab={tab} setTab={setTab}
            onJob={handleJobSelect} onReceipt={handleReceipt}
            onRate={handleRate} onViewReview={handleViewReview}
            onBookAgain={handleBookAgain} onTrackLive={onTrackLive} onBook={onBookAgain}
          />
        );
      case "details":
        return (
          <JobDetailsScreen
            job={selectedJob} onBack={goToList}
            onReceipt={() => setPage("receipt")}
            onRate={() => setPage("rate")}
            onBookAgain={() => setPage("book-again")}
          />
        );
      case "receipt":
        return <EReceiptScreen job={selectedJob} onBack={() => setPage(page === "receipt" && selectedJob ? "details" : "list")} />;
      case "rate":
        return <RateDriverScreen job={selectedJob} onSubmit={handleRateSubmit} onBack={goToList} />;
      case "review-done":
        return <ReviewSubmittedScreen rating={submittedRating} onActivity={goToList} onHome={onClose} />;
      case "view-review":
        return <ViewReviewScreen job={selectedJob} onBack={goToList} />;
      case "book-again":
        return <BookAgainModal job={selectedJob} onContinue={onBookAgain} onCancel={goToList} />;
      case "public-feedback":
        return <PublicFeedbackScreen onBack={onClose} />;
    }
  };

  const showHeader = page === "list" || page === "public-feedback";

  return (
    <div className="h-full flex flex-col" style={{ background: CA.bg }}>
      {showHeader && (
        <BackHeader
          title={page === "public-feedback" ? "Reviews & Feedback" : "Hauling Records"}
          subtitle={page === "public-feedback" ? "KadaGo verified reviews" : "Demo hauling history"}
          onBack={onClose}
        />
      )}
      {renderPage()}
    </div>
  );
}
