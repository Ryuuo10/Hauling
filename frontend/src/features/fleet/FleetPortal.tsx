import { useState } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

// ── Design tokens ──────────────────────────────────────────────────────────────
const F = {
  bg: "#F8FAFF",
  card: "#FFFFFF",
  cardBlue: "#EEF2FF",
  cardBlueBorder: "rgba(29,85,214,0.15)",
  border: "rgba(0,0,0,0.08)",
  inputBg: "#FFFFFF",
  blue: "#1D55D6",
  orange: "#F47B20",
  green: "#16A34A",
  red: "#DC2626",
  yellow: "#EAB308",
  purple: "#7C3AED",
  muted: "#94a3b8",
  mutedFg: "#64748b",
};

type FPage =
  | "home" | "drivers" | "add-driver" | "driver-detail"
  | "vehicles" | "add-vehicle" | "vehicle-detail" | "assign-driver"
  | "active-jobs" | "gps-monitor" | "earnings"
  | "maintenance" | "compliance" | "notifications" | "profile";
type FTab = "home" | "drivers" | "vehicles" | "jobs" | "earnings";

interface FleetPortalProps { onLogout: () => void; }

// ── Static data ────────────────────────────────────────────────────────────────
const OPERATOR = {
  company: "Santos Logistics Corp.",
  contact: "Ernesto B. Santos",
  phone: "+63 917 200 0001",
  email: "ernesto@santoslogistics.ph",
  address: "KM 4, Fortich St., Malaybalay City, Bukidnon",
};

const FLEET_STATS = [
  { label: "Active Drivers", value: "12", icon: "👤", color: F.blue },
  { label: "Available Vehicles", value: "9", icon: "🚛", color: F.orange },
  { label: "Active Jobs", value: "6", icon: "📦", color: F.green },
  { label: "Completed Today", value: "18", icon: "✅", color: F.green },
  { label: "Fleet Earnings", value: "₱18,450", icon: "💰", color: F.yellow },
  { label: "Maintenance", value: "2", icon: "🔧", color: F.red },
];

interface FDriver {
  id: string; name: string; initials: string;
  phone: string; vehicle: string; plate: string;
  online: boolean; rating: number; jobs: number;
  status: "active" | "idle" | "offline" | "suspended";
  currentJob?: string;
}
const DRIVERS: FDriver[] = [
  { id: "D001", name: "Juan Dela Cruz",    initials: "JD", phone: "+63 917 123 4567", vehicle: "Isuzu Elf Dropside",   plate: "ABC 1234", online: true,  rating: 4.9, jobs: 245, status: "active",    currentJob: "KG-12389" },
  { id: "D002", name: "Pedro Manalo",      initials: "PM", phone: "+63 928 234 5678", vehicle: "Toyota Hilux Pickup",  plate: "DEF 5678", online: true,  rating: 4.7, jobs: 180, status: "active",    currentJob: "KG-12391" },
  { id: "D003", name: "Rodrigo Castillo",  initials: "RC", phone: "+63 919 345 6789", vehicle: "Honda Click 125i",     plate: "GHI 9012", online: true,  rating: 4.8, jobs: 98,  status: "idle" },
  { id: "D004", name: "Alvin Reyes",       initials: "AR", phone: "+63 935 456 7890", vehicle: "Mitsubishi L300 Van",  plate: "JKL 3456", online: false, rating: 4.5, jobs: 312, status: "offline" },
  { id: "D005", name: "Ramon Villanueva",  initials: "RV", phone: "+63 908 567 8901", vehicle: "Isuzu N-Series Truck", plate: "MNO 7890", online: false, rating: 3.9, jobs: 56,  status: "suspended" },
];

interface FVehicle {
  id: string; name: string; plate: string; type: string;
  capacity: string; passengers: string;
  driver?: string; status: "available" | "active" | "maintenance" | "expired" | "inactive";
  orcrExpiry: string; insuranceExpiry: string;
}
const VEHICLES: FVehicle[] = [
  { id: "V001", name: "Isuzu Elf Dropside N-Series",    plate: "ABC 1234", type: "Dropside Truck",  capacity: "3 tons",   passengers: "—",  driver: "Juan Dela Cruz",   status: "active",      orcrExpiry: "Dec 2026", insuranceExpiry: "Jun 2027" },
  { id: "V002", name: "Toyota Hilux 4×4 Pickup",        plate: "DEF 5678", type: "Pickup",          capacity: "1 ton",    passengers: "2",  driver: "Pedro Manalo",     status: "active",      orcrExpiry: "Mar 2027", insuranceExpiry: "Mar 2027" },
  { id: "V003", name: "Honda Click 125i",                plate: "GHI 9012", type: "Motorcycle",      capacity: "30 kg",    passengers: "1",  driver: "Rodrigo Castillo", status: "available",   orcrExpiry: "Aug 2027", insuranceExpiry: "Aug 2027" },
  { id: "V004", name: "Mitsubishi L300 Cargo Van",       plate: "JKL 3456", type: "Cargo Van",       capacity: "1.5 tons", passengers: "—",  driver: undefined,          status: "available",   orcrExpiry: "May 2027", insuranceExpiry: "May 2027" },
  { id: "V005", name: "Isuzu N-Series Closed Van",       plate: "MNO 7890", type: "Closed Van",      capacity: "3.5 tons", passengers: "—",  driver: undefined,          status: "maintenance", orcrExpiry: "Jan 2027", insuranceExpiry: "Jan 2027" },
  { id: "V006", name: "Foton Gratour Mini Truck",        plate: "PQR 1234", type: "Mini Truck",      capacity: "500 kg",   passengers: "—",  driver: undefined,          status: "expired",     orcrExpiry: "May 2026", insuranceExpiry: "Apr 2026" },
];

interface ActiveFleetJob {
  id: string; driver: string; vehicle: string; customer: string;
  service: string; pickup: string; destination: string;
  status: string; eta: string; earnings: number;
}
const ACTIVE_FLEET_JOBS: ActiveFleetJob[] = [
  { id: "KG-12389", driver: "Juan Dela Cruz",   vehicle: "ABC 1234 · Isuzu Elf",      customer: "Maria Santos",  service: "Hardware & Cement", pickup: "ABC Depot, Fortich St.", destination: "Pinecrest Subd., San Jose",  status: "In Transit",       eta: "12 mins", earnings: 850 },
  { id: "KG-12391", driver: "Pedro Manalo",     vehicle: "DEF 5678 · Hilux Pickup",   customer: "Carlo Reyes",   service: "Construction",      pickup: "Bangcud Materials Depot", destination: "Brgy. Laguitas, Malaybalay", status: "Heading to Pickup", eta: "8 mins",  earnings: 950 },
  { id: "KG-12394", driver: "Rodrigo Castillo", vehicle: "GHI 9012 · Honda Click",    customer: "Ana Buenaventura", service: "Parcel",           pickup: "LBC Malaybalay Branch",   destination: "Brgy. Casisang",            status: "Arrived at Pickup", eta: "5 mins",  earnings: 200 },
];

interface MaintenanceRecord {
  id: string; vehicle: string; plate: string; type: string;
  lastService: string; nextDue: string; status: "due-soon" | "overdue" | "in-maintenance" | "ok";
}
const MAINTENANCE: MaintenanceRecord[] = [
  { id: "M001", vehicle: "Isuzu N-Series", plate: "MNO 7890", type: "Engine Service",            lastService: "Mar 2026", nextDue: "Sep 2026", status: "in-maintenance" },
  { id: "M002", vehicle: "Isuzu Elf",      plate: "ABC 1234", type: "Tire Rotation & Balancing", lastService: "Jun 2026", nextDue: "Sep 2026", status: "due-soon" },
  { id: "M003", vehicle: "Foton Gratour",  plate: "PQR 1234", type: "Full Mechanical Check",     lastService: "Nov 2025", nextDue: "May 2026", status: "overdue" },
  { id: "M004", vehicle: "Toyota Hilux",   plate: "DEF 5678", type: "Oil & Filter Change",       lastService: "Aug 2026", nextDue: "Feb 2027", status: "ok" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function BackHeader({ title, subtitle, onBack, right }: {
  title: string; subtitle?: string; onBack: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${F.border}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${F.border}` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1828" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <img src={kadaGoLogo} alt="KadaGo" style={{ width: "34px", flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black truncate" style={{ color: "#0D1828" }}>{title}</p>
        {subtitle && <p className="text-[10px] truncate" style={{ color: F.mutedFg }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:           { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "Active" },
    idle:             { bg: "rgba(29,85,214,0.1)",   color: "#1D55D6", label: "Idle" },
    offline:          { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Offline" },
    suspended:        { bg: "rgba(220,38,38,0.1)",   color: "#DC2626", label: "Suspended" },
    available:        { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "Available" },
    "active-job":     { bg: "rgba(244,123,32,0.1)",  color: "#c2410c", label: "Active Job" },
    maintenance:      { bg: "rgba(234,179,8,0.1)",   color: "#a16207", label: "Maintenance" },
    expired:          { bg: "rgba(220,38,38,0.1)",   color: "#DC2626", label: "Doc Expired" },
    inactive:         { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Inactive" },
    "due-soon":       { bg: "rgba(234,179,8,0.1)",   color: "#a16207", label: "Due Soon" },
    overdue:          { bg: "rgba(220,38,38,0.1)",   color: "#DC2626", label: "Overdue" },
    "in-maintenance": { bg: "rgba(29,85,214,0.1)",   color: "#1D55D6", label: "In Maintenance" },
    ok:               { bg: "rgba(22,163,74,0.1)",   color: "#15803d", label: "OK" },
  };
  const s = map[status] ?? map.inactive;
  return (
    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>{s.label}</span>
  );
}

// ── Fleet GPS Map ──────────────────────────────────────────────────────────────
function FleetMap() {
  const trucks = [
    { x: 88,  y: 188, label: "ABC 1234", job: "KG-12389", color: F.orange },
    { x: 238, y: 118, label: "DEF 5678", job: "KG-12391", color: F.blue },
    { x: 128, y: 160, label: "GHI 9012", job: "KG-12394", color: F.green },
  ];
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "#F1F5FF", border: `1px solid ${F.border}` }}>
      <svg width="100%" height="220" viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="fgrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(29,85,214,0.08)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="390" height="220" fill="#F1F5FF"/>
        <rect width="390" height="220" fill="url(#fgrid)"/>
        {/* Roads */}
        <line x1="0" y1="140" x2="390" y2="140" stroke="rgba(0,0,0,0.08)" strokeWidth="14"/>
        <line x1="160" y1="0" x2="160" y2="220" stroke="rgba(0,0,0,0.06)" strokeWidth="10"/>
        <line x1="0" y1="80" x2="390" y2="140" stroke="rgba(0,0,0,0.04)" strokeWidth="7"/>
        <line x1="0" y1="140" x2="390" y2="80" stroke="rgba(0,0,0,0.04)" strokeWidth="7"/>
        {/* Labels */}
        {[{ x: 30, y: 134, t: "Malaybalay" }, { x: 260, y: 134, t: "Valencia" }, { x: 148, y: 55, t: "Bukidnon" }].map(l => (
          <text key={l.t} x={l.x} y={l.y} fontSize="9" fill="rgba(0,0,0,0.4)" fontFamily="system-ui">{l.t}</text>
        ))}
        {/* Pickup & destination pins */}
        <circle cx={60} cy={192} r={5} fill={F.blue} opacity={0.8}/>
        <circle cx={340} cy={72} r={5} fill={F.orange} opacity={0.8}/>
        {/* Truck markers */}
        {trucks.map(t => (
          <g key={t.label}>
            <circle cx={t.x} cy={t.y} r={14} fill={t.color} opacity={0.15}/>
            <circle cx={t.x} cy={t.y} r={9} fill={t.color} opacity={0.9}/>
            <text x={t.x} y={t.y + 3} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">🚛</text>
            <text x={t.x} y={t.y + 22} textAnchor="middle" fontSize="7.5" fill={t.color} fontFamily="system-ui" fontWeight="bold">{t.label}</text>
          </g>
        ))}
        {/* Live blip */}
        <circle cx={88} cy={188} r={18} fill={F.orange} opacity={0.12} style={{ animation: "pulseOval 2s ease-in-out infinite" }}/>
      </svg>
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: F.green, animation: "livenessBlip 1.4s ease-in-out infinite" }}/>
        <span className="text-[10px] font-bold text-white">LIVE TRACKING</span>
      </div>
    </div>
  );
}

// ── 1. Fleet Dashboard ─────────────────────────────────────────────────────────
function FleetDashboard({ onGoTo, onLogout }: { onGoTo: (p: FPage) => void; onLogout: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-3 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${F.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <img src={kadaGoLogo} alt="KadaGo" style={{ width: "38px" }} />
          <div className="flex-1">
            <p className="text-[9px] font-black tracking-wider" style={{ color: F.blue }}>🏢 FLEET OPERATOR PORTAL</p>
            <p className="text-[11px] font-bold" style={{ color: "#0D1828" }}>{OPERATOR.company}</p>
          </div>
          <button onClick={() => onGoTo("notifications")} aria-label="Notifications" className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${F.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={F.mutedFg} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          <button onClick={() => onGoTo("profile")} aria-label="Fleet profile" className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-black text-sm text-white" style={{ background: F.blue }}>ES</button>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${F.border}`, width: "fit-content" }}>
          <span className="text-[9px]">📍</span>
          <span className="text-[10px] font-semibold" style={{ color: "#0D1828" }}>Malaybalay / Bukidnon</span>
        </div>
      </div>

      <div className="dashboard-grid fleet-home px-3 pt-3 space-y-3">
        {/* Summary stats grid */}
        <div className="fleet-stats grid grid-cols-2 min-[400px]:grid-cols-3 gap-2">
          {FLEET_STATS.map(s => (
            <div key={s.label} className="px-3 py-3 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <span className="text-lg">{s.icon}</span>
              <p className="text-[17px] font-black mt-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[8px] font-semibold leading-tight mt-0.5" style={{ color: F.muted }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Live GPS map */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>Live Fleet GPS</p>
            <button onClick={() => onGoTo("gps-monitor")} className="text-[10px] font-bold" style={{ color: F.blue }}>Full Map →</button>
          </div>
          <FleetMap />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Drivers",    icon: "👤", page: "drivers"     as FPage },
            { label: "Vehicles",   icon: "🚛", page: "vehicles"    as FPage },
            { label: "Jobs",       icon: "📦", page: "active-jobs" as FPage },
            { label: "Earnings",   icon: "💰", page: "earnings"    as FPage },
          ].map(b => (
            <button key={b.label} onClick={() => onGoTo(b.page)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}` }}>
              <span className="text-xl">{b.icon}</span>
              <span className="text-[9px] font-bold" style={{ color: "#0D1828" }}>{b.label}</span>
            </button>
          ))}
        </div>

        {/* Recent active jobs */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>Active Fleet Jobs ({ACTIVE_FLEET_JOBS.length})</p>
            <button onClick={() => onGoTo("active-jobs")} className="text-[10px] font-bold" style={{ color: F.blue }}>View All →</button>
          </div>
          <div className="space-y-2">
            {ACTIVE_FLEET_JOBS.map(j => (
              <div key={j.id} className="px-3 py-3 rounded-2xl" style={{ background: F.cardBlue, border: `1px solid ${F.cardBlueBorder}` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black" style={{ color: "#0D1828" }}>{j.id}</span>
                  <StatusBadge status={j.status.toLowerCase().replace(/ /g, "-")} />
                </div>
                <p className="text-[10px] font-semibold" style={{ color: "#0D1828" }}>{j.driver} · {j.vehicle.split("·")[0].trim()}</p>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{j.service} · ETA {j.eta}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance alerts */}
        <div className="px-4 py-3.5 rounded-2xl" style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-black" style={{ color: F.red }}>⚠️ Maintenance Alerts</p>
            <button onClick={() => onGoTo("maintenance")} className="text-[10px] font-bold" style={{ color: F.orange }}>View →</button>
          </div>
          <p className="text-[10px]" style={{ color: F.mutedFg }}>2 vehicles need attention · 1 overdue</p>
        </div>

        <div className="dashboard-spacer" style={{ height: "6px" }} />
      </div>
    </div>
  );
}

// ── 2. Driver Management ───────────────────────────────────────────────────────
function DriversScreen({ onBack, onAdd, onViewDriver }: { onBack: () => void; onAdd: () => void; onViewDriver: (d: FDriver) => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="My Drivers" subtitle={`${DRIVERS.length} registered drivers`} onBack={onBack}
        right={<button onClick={onAdd} className="px-3 py-1.5 rounded-xl text-[11px] font-black text-white" style={{ background: F.blue }}>+ Add</button>} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {DRIVERS.map(d => (
          <div key={d.id} className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2.5 flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white flex-shrink-0" style={{ background: d.online ? F.blue : "#94a3b8" }}>{d.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[13px] font-black truncate" style={{ color: "#0D1828" }}>{d.name}</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black" style={{ background: "rgba(22,163,74,0.1)", color: "#15803d" }}>✓ VERIFIED</span>
                </div>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{d.phone}</p>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{d.vehicle} · {d.plate}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="flex items-center px-4 pb-2.5 gap-4">
              <span className="text-[10px] font-bold" style={{ color: "#0D1828" }}>⭐ {d.rating}</span>
              <span className="text-[10px]" style={{ color: F.mutedFg }}>{d.jobs} jobs</span>
              {d.currentJob && <span className="text-[10px] font-semibold" style={{ color: F.orange }}>{d.currentJob}</span>}
            </div>
            <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
              {[
                { label: "View",    color: F.blue },
                { label: "Assign",  color: F.orange },
                { label: "Message", color: F.green },
                { label: "Suspend", color: d.status === "suspended" ? F.green : F.red, text: d.status === "suspended" ? "Reactivate" : "Suspend" },
              ].map(b => (
                <button key={b.label} onClick={b.label === "View" ? () => onViewDriver(d) : undefined}
                  className="py-2 rounded-xl text-[9px] font-bold transition-opacity active:opacity-70"
                  style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}`, color: b.color }}>
                  {b.text ?? b.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. Add Driver ──────────────────────────────────────────────────────────────
function AddDriverScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const fields = [
    { label: "Full Name",          placeholder: "Enter full name",        type: "text" },
    { label: "Mobile Number",      placeholder: "+63 917 xxx xxxx",       type: "tel" },
    { label: "Email Address",      placeholder: "driver@email.com",       type: "email" },
    { label: "Address",            placeholder: "Street, Barangay, City", type: "text" },
    { label: "Driver License No.", placeholder: "N01-12-345678",          type: "text" },
    { label: "Emergency Contact",  placeholder: "Name & contact number",  type: "text" },
  ];
  const uploads = ["Driver License (front & back)", "Police / NBI Clearance", "Barangay Clearance", "Profile Photo (2×2)"];
  const [vehicleAssigned, setVehicleAssigned] = useState(false);

  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Add Driver" subtitle="Submit for KadaGo verification" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-4">
        {/* Form fields */}
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${F.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: F.mutedFg }}>PERSONAL INFORMATION</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            {fields.map(f => (
              <div key={f.label}>
                <label className="text-[10px] font-black mb-1.5 block" style={{ color: F.mutedFg }}>{f.label.toUpperCase()}</label>
                <input type={f.type} placeholder={f.placeholder}
                  className="w-full px-3.5 py-3 rounded-xl text-[12px] outline-none placeholder-gray-400"
                  style={{ background: "#F8FAFF", border: `1px solid rgba(0,0,0,0.12)`, color: "#0D1828" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Document uploads */}
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${F.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: F.mutedFg }}>REQUIRED DOCUMENTS</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {uploads.map(u => (
              <button key={u} className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-opacity active:opacity-70"
                style={{ background: "#F8FAFF", border: "1.5px dashed rgba(0,0,0,0.12)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">📎</span>
                  <span className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>{u}</span>
                </div>
                <span className="text-[10px]" style={{ color: F.blue }}>Upload</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assign vehicle */}
        <button onClick={() => setVehicleAssigned(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-opacity active:opacity-70"
          style={{ background: vehicleAssigned ? F.cardBlue : "#F8FAFF", border: `1.5px solid ${vehicleAssigned ? F.cardBlueBorder : F.border}` }}>
          <div>
            <p className="text-[11px] font-bold text-left" style={{ color: "#0D1828" }}>Assign Vehicle (Optional)</p>
            <p className="text-[10px] text-left" style={{ color: F.mutedFg }}>{vehicleAssigned ? "Isuzu Elf Dropside — ABC 1234" : "Select a vehicle to assign"}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={F.blue} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* Status notice */}
        <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <p className="text-[10px] font-black mb-1" style={{ color: F.yellow }}>VERIFICATION STATUS</p>
          <p className="text-[11px]" style={{ color: "#374151" }}>After submission, driver will be reviewed by KadaGo. Status: <span style={{ color: F.yellow }}>Pending</span></p>
        </div>
      </div>
      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${F.border}` }}>
        <button onClick={onSubmit}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${F.blue}, #0E3AAD)` }}>
          Submit for Verification
        </button>
      </div>
    </div>
  );
}

// ── 4. Driver Detail ───────────────────────────────────────────────────────────
function DriverDetailScreen({ driver, onBack }: { driver: FDriver; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Driver Details" subtitle={`${driver.id} · ${driver.status}`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        {/* Profile banner */}
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white" style={{ background: driver.online ? F.blue : "#94a3b8" }}>{driver.initials}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[15px] font-black" style={{ color: "#0D1828" }}>{driver.name}</p>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: "#15803d" }}>✓ VERIFIED</span>
            </div>
            <p className="text-[10px]" style={{ color: F.mutedFg }}>{driver.phone}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] font-bold" style={{ color: "#0D1828" }}>⭐ {driver.rating}</span>
              <span className="text-[11px]" style={{ color: F.mutedFg }}>{driver.jobs} completed</span>
              <span className="text-[11px]" style={{ color: F.mutedFg }}>96% acceptance</span>
            </div>
          </div>
          <StatusBadge status={driver.status} />
        </div>

        {/* Info rows */}
        {[
          { label: "Assigned Vehicle", value: `${driver.vehicle} · ${driver.plate}` },
          { label: "Current Job",      value: driver.currentJob ?? "None" },
          { label: "Earnings (month)", value: "₱28,450" },
          { label: "Joined",           value: "January 2024" },
        ].map(r => (
          <div key={r.label} className="flex items-start gap-3 px-4 py-2.5 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}` }}>
            <span className="text-[10px] flex-shrink-0 pt-0.5" style={{ color: F.mutedFg, minWidth: "112px" }}>{r.label}</span>
            <span className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>{r.value}</span>
          </div>
        ))}

        {/* Documents */}
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}` }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${F.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: F.mutedFg }}>VERIFICATION DOCUMENTS</p>
          </div>
          {["Driver License · Expires Dec 2027", "Police Clearance · Expires Jun 2027", "Barangay Clearance · Expires Mar 2027"].map(doc => (
            <div key={doc} className="flex items-center gap-2.5 px-4 py-2.5" style={{ borderBottom: `1px solid ${F.border}` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(22,163,74,0.1)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>{doc}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Assign Vehicle", color: F.blue },
            { label: "Edit Driver",    color: F.orange },
            { label: "Suspend",        color: F.red },
            { label: "Message Driver", color: F.green },
          ].map(b => (
            <button key={b.label} className="py-3.5 rounded-2xl text-[11px] font-black transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}`, color: b.color }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 5. Vehicle Management ──────────────────────────────────────────────────────
function VehiclesScreen({ onBack, onAdd, onViewVehicle }: { onBack: () => void; onAdd: () => void; onViewVehicle: (v: FVehicle) => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Fleet Vehicles" subtitle={`${VEHICLES.length} vehicles`} onBack={onBack}
        right={<button onClick={onAdd} className="px-3 py-1.5 rounded-xl text-[11px] font-black text-white" style={{ background: F.blue }}>+ Add</button>} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {VEHICLES.map(v => (
          <div key={v.id} className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: `1px solid ${F.border}` }}>
              <div>
                <p className="text-[13px] font-black" style={{ color: "#0D1828" }}>{v.name}</p>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{v.plate} · {v.type}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <div className="px-4 py-2.5 space-y-1">
              <div className="flex gap-4">
                <span className="text-[10px]" style={{ color: F.mutedFg }}>Cargo: <span style={{ color: "#0D1828", fontWeight: 600 }}>{v.capacity}</span></span>
                <span className="text-[10px]" style={{ color: F.mutedFg }}>Pax: <span style={{ color: "#0D1828", fontWeight: 600 }}>{v.passengers}</span></span>
              </div>
              <p className="text-[10px]" style={{ color: F.mutedFg }}>Driver: <span style={{ color: "#0D1828", fontWeight: 600 }}>{v.driver ?? "Unassigned"}</span></p>
              <div className="flex gap-4">
                <span className="text-[9px]" style={{ color: v.orcrExpiry.includes("2026") ? F.yellow : F.mutedFg }}>OR/CR: {v.orcrExpiry}</span>
                <span className="text-[9px]" style={{ color: v.insuranceExpiry.includes("2026") ? F.red : F.mutedFg }}>Ins: {v.insuranceExpiry}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
              {["View", "Assign", "Maintain", "Edit"].map(a => (
                <button key={a} onClick={a === "View" ? () => onViewVehicle(v) : undefined}
                  className="py-2 rounded-xl text-[9px] font-bold transition-opacity active:opacity-70"
                  style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}`, color: "#374151" }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 6. Add Vehicle ─────────────────────────────────────────────────────────────
function AddVehicleScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const fields = [
    { label: "Vehicle Type",      placeholder: "Truck / Van / Motorcycle…" },
    { label: "Make & Model",      placeholder: "Isuzu Elf Dropside N-Series" },
    { label: "Plate Number",      placeholder: "ABC 1234" },
    { label: "Year",              placeholder: "2020" },
    { label: "Color",             placeholder: "White" },
    { label: "Cargo Capacity",    placeholder: "3 tons" },
    { label: "Passenger Cap.",    placeholder: "— or number" },
    { label: "Special Equipment", placeholder: "Crane, lift gate, refrigerator…" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Add Vehicle" subtitle="Register a new fleet vehicle" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${F.border}` }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: F.mutedFg }}>VEHICLE DETAILS</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            {fields.map(f => (
              <div key={f.label}>
                <label className="text-[10px] font-black mb-1 block" style={{ color: F.mutedFg }}>{f.label.toUpperCase()}</label>
                <input type="text" placeholder={f.placeholder}
                  className="w-full px-3.5 py-3 rounded-xl text-[12px] outline-none placeholder-gray-400"
                  style={{ background: "#F8FAFF", border: `1px solid rgba(0,0,0,0.12)`, color: "#0D1828" }} />
              </div>
            ))}
          </div>
        </div>
        {["OR/CR (current)", "Insurance Documents", "Vehicle Photos (front, back, sides)"].map(doc => (
          <button key={doc} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-opacity active:opacity-70"
            style={{ background: "#F8FAFF", border: "1.5px dashed rgba(0,0,0,0.12)" }}>
            <div className="flex items-center gap-2"><span>📎</span><span className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>{doc}</span></div>
            <span className="text-[10px] font-bold" style={{ color: F.blue }}>Upload</span>
          </button>
        ))}
      </div>
      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${F.border}` }}>
        <button onClick={onSubmit}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${F.blue}, #0E3AAD)` }}>
          Submit Vehicle
        </button>
      </div>
    </div>
  );
}

// ── 7. Vehicle Detail ──────────────────────────────────────────────────────────
function VehicleDetailScreen({ vehicle, onBack, onAssign }: { vehicle: FVehicle; onBack: () => void; onAssign: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Vehicle Details" subtitle={`${vehicle.plate} · ${vehicle.type}`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        {/* Photo placeholder */}
        <div className="h-32 rounded-2xl flex items-center justify-center" style={{ background: "#EEF2FF", border: `1px solid ${F.cardBlueBorder}` }}>
          <span className="text-5xl">🚛</span>
        </div>
        {/* Details */}
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {[
            { label: "Name",            value: vehicle.name },
            { label: "Plate",           value: vehicle.plate },
            { label: "Type",            value: vehicle.type },
            { label: "Cargo Cap.",      value: vehicle.capacity },
            { label: "Passengers",      value: vehicle.passengers },
            { label: "Assigned Driver", value: vehicle.driver ?? "Unassigned" },
            { label: "OR/CR Expiry",    value: vehicle.orcrExpiry },
            { label: "Insurance",       value: vehicle.insuranceExpiry },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${F.border}` : "none" }}>
              <span className="text-[10px] flex-shrink-0 pt-0.5" style={{ color: F.mutedFg, minWidth: "96px" }}>{r.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>{r.value}</span>
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Assign Driver",    action: onAssign, color: F.blue },
            { label: "Switch Driver",    action: () => {}, color: F.orange },
            { label: "Mark Maintenance", action: () => {}, color: F.yellow },
            { label: "Update Documents", action: () => {}, color: F.green },
          ].map(b => (
            <button key={b.label} onClick={b.action}
              className="py-3.5 rounded-2xl text-[11px] font-black transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}`, color: b.color }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 8. Assign Driver to Vehicle ────────────────────────────────────────────────
function AssignDriverScreen({ onBack, onAssign }: { onBack: () => void; onAssign: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const available = DRIVERS.filter(d => d.status !== "suspended" && !d.currentJob);
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Assign Driver" subtitle="Select a verified driver" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        <div className="px-4 py-3.5 rounded-2xl" style={{ background: F.cardBlue, border: `1px solid ${F.cardBlueBorder}` }}>
          <p className="text-[10px] font-black" style={{ color: F.blue }}>SELECTED VEHICLE</p>
          <p className="text-[12px] font-bold mt-0.5" style={{ color: "#0D1828" }}>Isuzu Elf Dropside N-Series · ABC 1234</p>
        </div>
        <p className="text-[10px] font-black px-1" style={{ color: F.mutedFg }}>AVAILABLE DRIVERS ({available.length})</p>
        {available.map(d => (
          <button key={d.id} onClick={() => setSelected(d.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-opacity active:opacity-70"
            style={{ background: selected === d.id ? F.cardBlue : F.card, border: `1.5px solid ${selected === d.id ? F.cardBlueBorder : F.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: F.blue }}>{d.initials}</div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{d.name}</p>
              <p className="text-[10px]" style={{ color: F.mutedFg }}>⭐ {d.rating} · {d.jobs} jobs · {d.status}</p>
            </div>
            {selected === d.id && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: F.blue }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}
          </button>
        ))}
        <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)" }}>
          <p className="text-[10px] font-black mb-1" style={{ color: F.red }}>⚠️ Assignment Restrictions</p>
          <p className="text-[10px]" style={{ color: "#374151" }}>Drivers on active jobs, suspended accounts, and vehicles under maintenance cannot be assigned.</p>
        </div>
      </div>
      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${F.border}` }}>
        <button onClick={selected ? onAssign : undefined} disabled={!selected}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white transition-opacity"
          style={{ background: selected ? `linear-gradient(135deg, ${F.blue}, #0E3AAD)` : "rgba(0,0,0,0.06)", opacity: selected ? 1 : 0.5 }}>
          Assign Driver
        </button>
      </div>
    </div>
  );
}

// ── 9. Active Fleet Jobs ───────────────────────────────────────────────────────
function ActiveFleetJobsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Active Fleet Jobs" subtitle={`${ACTIVE_FLEET_JOBS.length} ongoing`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {ACTIVE_FLEET_JOBS.map(j => (
          <div key={j.id} className="rounded-2xl overflow-hidden" style={{ background: F.cardBlue, border: `1px solid ${F.cardBlueBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(29,85,214,0.1)` }}>
              <div>
                <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{j.id} · {j.service}</p>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{j.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-black" style={{ color: F.green }}>₱{j.earnings}</p>
                <StatusBadge status={j.status.toLowerCase().replace(/ /g, "-")} />
              </div>
            </div>
            <div className="px-4 py-2.5 space-y-1.5">
              <p className="text-[10px] font-semibold" style={{ color: "#0D1828" }}>👤 {j.driver} · {j.vehicle}</p>
              <div className="flex items-start gap-1.5"><div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: F.blue }}/><p className="text-[10px]" style={{ color: "#374151" }}>{j.pickup}</p></div>
              <div className="flex items-start gap-1.5"><div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: F.orange }}/><p className="text-[10px]" style={{ color: "#374151" }}>{j.destination}</p></div>
              <p className="text-[10px]" style={{ color: F.mutedFg }}>ETA: {j.eta}</p>
            </div>
            <div className="px-3 pb-3">
              <button className="w-full py-2.5 rounded-xl text-[10px] font-black text-white transition-opacity active:opacity-70"
                style={{ background: `linear-gradient(135deg, ${F.blue}, #0E3AAD)` }}>
                📍 Track Job
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 10. Fleet GPS Monitoring ───────────────────────────────────────────────────
function GPSMonitorScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const markers = [
    { id: "KG-12389", x: 88,  y: 188, driver: "Juan D.C.",  plate: "ABC 1234", color: F.orange, status: "In Transit" },
    { id: "KG-12391", x: 238, y: 118, driver: "Pedro M.",   plate: "DEF 5678", color: F.blue,   status: "Heading to Pickup" },
    { id: "KG-12394", x: 128, y: 160, driver: "Rodrigo C.", plate: "GHI 9012", color: F.green,  status: "Arrived at Pickup" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Fleet GPS Monitor" subtitle={`${markers.length} active vehicles`} onBack={onBack} />
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Full map */}
        <div className="flex-shrink-0 mx-3 mt-3 rounded-2xl overflow-hidden" style={{ background: "#F1F5FF", border: `1px solid ${F.border}` }}>
          <svg width="100%" height="280" viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice">
            <defs><pattern id="mg" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(29,85,214,0.06)" strokeWidth="0.5"/></pattern></defs>
            <rect width="390" height="280" fill="#F1F5FF"/>
            <rect width="390" height="280" fill="url(#mg)"/>
            <line x1="0" y1="180" x2="390" y2="180" stroke="rgba(0,0,0,0.08)" strokeWidth="14"/>
            <line x1="180" y1="0" x2="180" y2="280" stroke="rgba(0,0,0,0.06)" strokeWidth="10"/>
            <line x1="0" y1="100" x2="390" y2="180" stroke="rgba(0,0,0,0.04)" strokeWidth="7"/>
            {[{ x: 30, y: 174, t: "Malaybalay" }, { x: 270, y: 174, t: "Valencia" }, { x: 168, y: 60, t: "Bukidnon" }].map(l => (
              <text key={l.t} x={l.x} y={l.y} fontSize="9" fill="rgba(0,0,0,0.4)" fontFamily="system-ui">{l.t}</text>
            ))}
            {markers.map(m => (
              <g key={m.id} onClick={() => setSelected(m.id)} style={{ cursor: "pointer" }}>
                <circle cx={m.x} cy={m.y} r={selected === m.id ? 20 : 14} fill={m.color} opacity={selected === m.id ? 0.2 : 0.12}/>
                <circle cx={m.x} cy={m.y} r={10} fill={m.color} opacity={0.9}/>
                <text x={m.x} y={m.y + 3.5} textAnchor="middle" fontSize="8" fill="white">🚛</text>
                <text x={m.x} y={m.y + 24} textAnchor="middle" fontSize="7" fill={m.color} fontFamily="system-ui" fontWeight="bold">{m.plate}</text>
              </g>
            ))}
            <circle cx={60} cy={250} r={5} fill={F.blue} opacity={0.8}/>
            <circle cx={350} cy={45} r={5} fill={F.orange} opacity={0.8}/>
          </svg>
          {/* Legend */}
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: `1px solid ${F.border}` }}>
            {[{ color: F.blue, label: "Pickup" }, { color: F.orange, label: "Destination" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: l.color }}/><span className="text-[9px]" style={{ color: F.mutedFg }}>{l.label}</span></div>
            ))}
            <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: F.green, animation: "livenessBlip 1.4s ease-in-out infinite" }}/><span className="text-[9px] font-bold" style={{ color: F.green }}>LIVE</span></div>
          </div>
        </div>
        {/* Vehicle list */}
        <div className="flex-1 overflow-y-auto px-3 pt-2 space-y-2 pb-3">
          {markers.map(m => (
            <button key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-opacity active:opacity-70"
              style={{ background: selected === m.id ? F.cardBlue : F.card, border: `1.5px solid ${selected === m.id ? F.cardBlueBorder : F.border}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: m.color }}>{m.driver.split(" ")[0][0]}</div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-bold" style={{ color: "#0D1828" }}>{m.driver} · {m.plate}</p>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{m.id} · {m.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-[10px] font-bold" style={{ color: F.green }}>📞</button>
                <button className="text-[10px] font-bold" style={{ color: F.blue }}>💬</button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 11. Fleet Earnings ─────────────────────────────────────────────────────────
function FleetEarningsScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"today" | "week" | "month">("week");
  const data = {
    today: { gross: 4200,  fees: 420,  driverPayout: 3024,  net: 756,   jobs: 6,   pending: 850 },
    week:  { gross: 28450, fees: 2845, driverPayout: 20484, net: 5121,  jobs: 38,  pending: 1200 },
    month: { gross: 98400, fees: 9840, driverPayout: 70848, net: 17712, jobs: 142, pending: 3600 },
  }[tab];
  const txns = [
    { id: "KG-12389", driver: "Juan D.C.",  vehicle: "ABC 1234", service: "Hardware",    gross: 850,  driverShare: 612,  fleetShare: 153, status: "Settled" },
    { id: "KG-12391", driver: "Pedro M.",   vehicle: "DEF 5678", service: "Construction", gross: 950, driverShare: 684,  fleetShare: 171, status: "Settled" },
    { id: "KG-12394", driver: "Rodrigo C.", vehicle: "GHI 9012", service: "Parcel",      gross: 200,  driverShare: 144,  fleetShare: 36,  status: "Pending" },
    { id: "KG-12386", driver: "Juan D.C.",  vehicle: "ABC 1234", service: "Lipat-Bahay", gross: 3200, driverShare: 2304, fleetShare: 576, status: "Settled" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Fleet Earnings" subtitle="Revenue & payout summary" onBack={onBack} />
      <div className="flex-shrink-0 flex items-center gap-1 px-3 pt-3 pb-2">
        {(["today", "week", "month"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-black capitalize transition-all"
            style={{ background: tab === t ? F.blue : "rgba(0,0,0,0.03)", border: `1px solid ${tab === t ? F.blue : F.border}`, color: tab === t ? "white" : "#374151" }}>
            {t === "today" ? "Today" : t === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-3">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Gross Earnings", value: `₱${data.gross.toLocaleString()}`,        color: F.green },
            { label: "Fleet Net",      value: `₱${data.net.toLocaleString()}`,          color: F.blue },
            { label: "Driver Payouts", value: `₱${data.driverPayout.toLocaleString()}`, color: F.orange },
            { label: "Platform Fees",  value: `₱${data.fees.toLocaleString()}`,         color: F.red },
          ].map(s => (
            <div key={s.label} className="px-4 py-3.5 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: F.mutedFg }}>{s.label.toUpperCase()}</p>
              <p className="text-[18px] font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-4 py-3 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}` }}>
            <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: F.mutedFg }}>COMPLETED JOBS</p>
            <p className="text-[18px] font-black" style={{ color: "#0D1828" }}>{data.jobs}</p>
          </div>
          <div className="px-4 py-3 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}` }}>
            <p className="text-[9px] font-black tracking-wider mb-1" style={{ color: F.yellow }}>PENDING</p>
            <p className="text-[18px] font-black" style={{ color: F.yellow }}>₱{data.pending.toLocaleString()}</p>
          </div>
        </div>
        {/* Transactions */}
        <p className="text-[10px] font-black px-1" style={{ color: F.mutedFg }}>TRANSACTION HISTORY</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}` }}>
          {txns.map((t, i, arr) => (
            <div key={t.id} className="px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${F.border}` : "none" }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-black" style={{ color: "#0D1828" }}>{t.id} · {t.service}</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: t.status === "Settled" ? "rgba(22,163,74,0.1)" : "rgba(234,179,8,0.1)", color: t.status === "Settled" ? "#15803d" : "#a16207" }}>{t.status}</span>
              </div>
              <p className="text-[10px]" style={{ color: F.mutedFg }}>{t.driver} · {t.vehicle}</p>
              <div className="flex gap-4 mt-0.5">
                <span className="text-[9px]" style={{ color: F.mutedFg }}>Gross: <span style={{ color: "#0D1828", fontWeight: 600 }}>₱{t.gross}</span></span>
                <span className="text-[9px]" style={{ color: F.mutedFg }}>Driver: <span style={{ color: "#374151" }}>₱{t.driverShare}</span></span>
                <span className="text-[9px]" style={{ color: F.green }}>Fleet: ₱{t.fleetShare}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 12. Maintenance Management ─────────────────────────────────────────────────
function MaintenanceScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Maintenance" subtitle="Vehicle service schedule" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {MAINTENANCE.map(m => (
          <div key={m.id} className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: `1px solid ${F.border}` }}>
              <div>
                <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{m.vehicle} · {m.plate}</p>
                <p className="text-[10px]" style={{ color: F.mutedFg }}>{m.type}</p>
              </div>
              <StatusBadge status={m.status} />
            </div>
            <div className="px-4 py-2.5 grid grid-cols-2 gap-x-4">
              <div><p className="text-[9px]" style={{ color: F.mutedFg }}>Last Service</p><p className="text-[11px] font-semibold" style={{ color: "#0D1828" }}>{m.lastService}</p></div>
              <div><p className="text-[9px]" style={{ color: F.mutedFg }}>Next Due</p><p className="text-[11px] font-semibold" style={{ color: m.status === "overdue" ? F.red : m.status === "due-soon" ? F.yellow : "#0D1828" }}>{m.nextDue}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
              {["Schedule", "Completed", "Add Note"].map(a => (
                <button key={a} className="py-2.5 rounded-xl text-[9px] font-bold transition-opacity active:opacity-70"
                  style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}`, color: "#374151" }}>{a}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 13. Document Expiry / Compliance ───────────────────────────────────────────
function ComplianceScreen({ onBack }: { onBack: () => void }) {
  const docs = [
    { vehicle: "Isuzu Elf · ABC 1234",      doc: "OR/CR",           status: "valid",          expiry: "Dec 2026" },
    { vehicle: "Foton Gratour · PQR 1234",  doc: "OR/CR",           status: "expired",        expiry: "May 2026" },
    { vehicle: "Foton Gratour · PQR 1234",  doc: "Insurance",       status: "expired",        expiry: "Apr 2026" },
    { vehicle: "Juan D.C. · D001",          doc: "Driver License",  status: "valid",          expiry: "Dec 2027" },
    { vehicle: "Isuzu Elf · ABC 1234",      doc: "Insurance",       status: "expiring-soon",  expiry: "Dec 2026" },
    { vehicle: "Isuzu N-Series · MNO 7890", doc: "OR/CR",           status: "valid",          expiry: "Jan 2027" },
  ];
  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    valid:           { bg: "rgba(22,163,74,0.1)",  color: "#15803d", label: "Valid" },
    expired:         { bg: "rgba(220,38,38,0.1)",  color: "#DC2626", label: "Expired" },
    "expiring-soon": { bg: "rgba(234,179,8,0.1)",  color: "#a16207", label: "Expiring Soon" },
  };
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Compliance & Docs" subtitle="Expiry monitoring" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Valid",        count: docs.filter(d => d.status === "valid").length,         color: F.green },
            { label: "Expiring",     count: docs.filter(d => d.status === "expiring-soon").length, color: F.yellow },
            { label: "Expired",      count: docs.filter(d => d.status === "expired").length,       color: F.red },
          ].map(s => (
            <div key={s.label} className="px-3 py-3 rounded-2xl text-center" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p className="text-[20px] font-black" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[8px] font-semibold leading-tight mt-0.5" style={{ color: F.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
        {/* Document list */}
        {docs.map((d, i) => {
          const s = statusMap[d.status];
          return (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}` }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${F.border}` }}>
                <div>
                  <p className="text-[11px] font-black" style={{ color: "#0D1828" }}>{d.vehicle}</p>
                  <p className="text-[10px]" style={{ color: F.mutedFg }}>{d.doc} · Expires {d.expiry}</p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5">
                {["Notify", "Upload", d.status === "expired" ? "Suspend" : "View"].map(a => (
                  <button key={a} className="py-2 rounded-xl text-[9px] font-bold transition-opacity active:opacity-70"
                    style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${F.border}`, color: a === "Suspend" ? F.red : "#374151" }}>{a}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 14. Fleet Notifications ────────────────────────────────────────────────────
function FleetNotificationsScreen({ onBack }: { onBack: () => void }) {
  const notifs = [
    { icon: "✅", title: "Job Completed",           body: "Juan Dela Cruz completed KG-12389 · ₱850 earned.", time: "5m ago",  unread: true },
    { icon: "⚠️", title: "Document Expiring",        body: "Foton Gratour insurance expires in 7 days.",    time: "1h ago",  unread: true },
    { icon: "🚨", title: "SOS Alert",               body: "Rodrigo Castillo triggered SOS on KG-12394.",    time: "2h ago",  unread: true },
    { icon: "🚛", title: "Vehicle Maintenance Due",  body: "Isuzu Elf ABC 1234 tire rotation due this week.", time: "3h ago",  unread: false },
    { icon: "👤", title: "New Job Accepted",         body: "Pedro Manalo accepted KG-12391 · Construction.", time: "4h ago",  unread: false },
    { icon: "🔒", title: "Driver Suspended",         body: "Ramon Villanueva account suspended by admin.",   time: "1d ago",  unread: false },
    { icon: "💰", title: "Fleet Earnings",           body: "₱28,450 settled to your account for this week.", time: "2d ago",  unread: false },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Notifications" subtitle={`${notifs.filter(n => n.unread).length} unread`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-2 pb-3">
        {notifs.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3.5 rounded-2xl" style={{ background: n.unread ? F.cardBlue : F.card, border: `1px solid ${n.unread ? F.cardBlueBorder : F.border}` }}>
            <span className="text-lg flex-shrink-0">{n.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[11px] font-black" style={{ color: "#0D1828" }}>{n.title}</p>
                <span className="text-[9px]" style={{ color: F.muted }}>{n.time}</span>
              </div>
              <p className="text-[10px] leading-snug" style={{ color: F.mutedFg }}>{n.body}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: F.blue }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 15. Fleet Operator Profile ─────────────────────────────────────────────────
function FleetProfileScreen({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const sections = [
    { icon: "🏢", label: "Company Information",    sub: "Details & registration" },
    { icon: "🏦", label: "Bank & Payout Settings", sub: "GCash, bank account" },
    { icon: "🔔", label: "Notification Settings",  sub: "Alerts & preferences" },
    { icon: "🔒", label: "Privacy & Security",     sub: "Password, 2FA" },
    { icon: "❓", label: "Help & Support",          sub: "FAQs, contact" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: F.bg }}>
      <BackHeader title="Fleet Profile" subtitle="Account & settings" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 pb-3">
        {/* Company banner */}
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: F.card, border: `1px solid ${F.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white" style={{ background: F.blue }}>SL</div>
          <div>
            <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>{OPERATOR.company}</p>
            <p className="text-[10px]" style={{ color: F.mutedFg }}>{OPERATOR.contact}</p>
            <p className="text-[10px]" style={{ color: F.mutedFg }}>{OPERATOR.phone}</p>
            <p className="text-[10px]" style={{ color: F.mutedFg }}>{OPERATOR.email}</p>
          </div>
        </div>
        <p className="text-[10px]" style={{ color: F.mutedFg, paddingLeft: "4px" }}>{OPERATOR.address}</p>
        {/* Sections */}
        <div className="rounded-2xl overflow-hidden" style={{ background: F.card, border: `1px solid ${F.border}` }}>
          {sections.map((s, i, arr) => (
            <button key={s.label} className="w-full flex items-center gap-3 px-4 py-3.5 transition-opacity active:opacity-70" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${F.border}` : "none" }}>
              <span className="text-lg flex-shrink-0">{s.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: F.muted }}>{s.sub}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={F.muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
        <button onClick={onLogout}
          className="w-full py-4 rounded-2xl font-black text-[13px] transition-opacity active:opacity-80"
          style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", color: F.red }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

// ── 16. Bottom Navigation ──────────────────────────────────────────────────────
function FBottomNav({ active, onChange }: { active: FTab; onChange: (t: FTab) => void }) {
  const tabs: { id: FTab; icon: string; label: string }[] = [
    { id: "home",     icon: "🏠", label: "Dashboard" },
    { id: "drivers",  icon: "👤", label: "Drivers" },
    { id: "vehicles", icon: "🚛", label: "Vehicles" },
    { id: "jobs",     icon: "📦", label: "Jobs" },
    { id: "earnings", icon: "💰", label: "Earnings" },
  ];
  return (
    <nav aria-label="Fleet navigation" className="app-navigation flex-shrink-0 px-1 py-1" style={{ background: "#FFFFFF", borderTop: `1px solid ${F.border}`, minHeight: "60px" }}>
      <div className="navigation-brand"><img src={kadaGoLogo} alt="KadaGo" /><p>Fleet Management</p></div>
      <div className="navigation-items flex items-center w-full">
      {tabs.map(t => (
        <button key={t.id} aria-current={active === t.id ? "page" : undefined} onClick={() => onChange(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-1 rounded-xl transition-opacity active:opacity-70">
          <span className="text-base" style={{ filter: active === t.id ? "none" : "grayscale(1)", opacity: active === t.id ? 1 : 0.45 }}>{t.icon}</span>
          <span className="text-[8px] font-bold" style={{ color: active === t.id ? F.blue : F.muted }}>{t.label}</span>
        </button>
      ))}
      </div>
    </nav>
  );
}

// ── Main FleetPortal Component ─────────────────────────────────────────────────
export default function FleetPortal({ onLogout }: FleetPortalProps) {
  const [page, setPage] = useState<FPage>("home");
  const [selectedDriver, setSelectedDriver] = useState<FDriver>(DRIVERS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<FVehicle>(VEHICLES[0]);

  const goTo = (p: FPage) => setPage(p);
  const goHome = () => setPage("home");
  const tab: FTab = ["drivers", "add-driver", "driver-detail"].includes(page) ? "drivers"
    : ["vehicles", "add-vehicle", "vehicle-detail", "assign-driver"].includes(page) ? "vehicles"
    : ["active-jobs", "gps-monitor"].includes(page) ? "jobs"
    : page === "earnings" ? "earnings" : "home";

  const handleTabChange = (t: FTab) => {
    if (t === "home")          setPage("home");
    else if (t === "drivers")  setPage("drivers");
    else if (t === "vehicles") setPage("vehicles");
    else if (t === "jobs")     setPage("active-jobs");
    else if (t === "earnings") setPage("earnings");
  };

  const hideNav = ["add-driver", "add-vehicle", "assign-driver"].includes(page);

  const renderContent = () => {
    switch (page) {
      case "home":          return <FleetDashboard onGoTo={goTo} onLogout={onLogout} />;
      case "drivers":       return <DriversScreen onBack={goHome} onAdd={() => goTo("add-driver")} onViewDriver={d => { setSelectedDriver(d); goTo("driver-detail"); }} />;
      case "add-driver":    return <AddDriverScreen onBack={() => goTo("drivers")} onSubmit={() => goTo("drivers")} />;
      case "driver-detail": return <DriverDetailScreen driver={selectedDriver} onBack={() => goTo("drivers")} />;
      case "vehicles":      return <VehiclesScreen onBack={goHome} onAdd={() => goTo("add-vehicle")} onViewVehicle={v => { setSelectedVehicle(v); goTo("vehicle-detail"); }} />;
      case "add-vehicle":   return <AddVehicleScreen onBack={() => goTo("vehicles")} onSubmit={() => goTo("vehicles")} />;
      case "vehicle-detail": return <VehicleDetailScreen vehicle={selectedVehicle} onBack={() => goTo("vehicles")} onAssign={() => goTo("assign-driver")} />;
      case "assign-driver": return <AssignDriverScreen onBack={() => goTo("vehicle-detail")} onAssign={() => goTo("vehicle-detail")} />;
      case "active-jobs":   return <ActiveFleetJobsScreen onBack={goHome} />;
      case "gps-monitor":   return <GPSMonitorScreen onBack={goHome} />;
      case "earnings":      return <FleetEarningsScreen onBack={goHome} />;
      case "maintenance":   return <MaintenanceScreen onBack={goHome} />;
      case "compliance":    return <ComplianceScreen onBack={goHome} />;
      case "notifications": return <FleetNotificationsScreen onBack={goHome} />;
      case "profile":       return <FleetProfileScreen onBack={goHome} onLogout={onLogout} />;
    }
  };

  return (
    <div className={`${hideNav ? "" : "portal-layout "}h-full flex flex-col relative`} style={{ background: F.bg }}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">{renderContent()}</div>
      {!hideNav && <FBottomNav active={tab} onChange={handleTabChange} />}
    </div>
  );
}
