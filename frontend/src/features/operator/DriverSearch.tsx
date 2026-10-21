import { useState, useMemo } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

const DS = {
  bg: "#F8FAFF", card: "#FFFFFF", cardJob: "#F1F5FF", cardJobBorder: "rgba(0,0,0,0.08)",
  orange: "#F47B20", blue: "#1D55D6", green: "#16A34A", red: "#DC2626",
  yellow: "#EAB308", purple: "#7C3AED", teal: "#0B8E7E", tealDark: "#096E60",
  border: "rgba(0,0,0,0.08)", borderMd: "rgba(0,0,0,0.12)",
  muted: "#64748b", mutedFg: "#94a3b8", inputBg: "#FFFFFF",
  heading: "#0D1828", body: "#374151",
};

type DSPage = "search" | "compare" | "profile" | "confirm" | "chat";
type SortBy = "match" | "price" | "rating" | "eta";

interface Driver {
  id: string; name: string; initials: string; color: string;
  rating: number; jobs: number; reviews: number; acceptance: string; responseTime: string;
  location: string; timeAway: string;
  vehicle: string; vehicleShort: string; vehicleDesc: string; vehicleEmoji: string;
  plate: string; dist: string; distNum: number; eta: string; etaMin: number;
  capacity: string; pax: number | null; floor: number;
  licVerified: boolean; orcrVerified: boolean; vehicleVerified: boolean; insured: boolean;
  online: boolean; message: string; helpers: number; includes: string[]; fareNote: string;
  isPro: boolean; price: number; recommended?: boolean;
  showVacant: boolean; showCompare: boolean;
}

const DRIVERS: Driver[] = [
  {
    id: "juan", name: "Juan Dela Cruz", initials: "JD", color: "#1D55D6", isPro: true,
    rating: 4.95, reviews: 88, jobs: 245, acceptance: "94%", responseTime: "< 2 min",
    location: "Fortich St., Malaybalay City (Near Capitol)", timeAway: "5m away",
    vehicle: "Isuzu Elf N-Series Dropside", vehicleShort: "Isuzu Elf Dropside Heavy Truck",
    vehicleDesc: "Dropside Open Bed with High Stakes & Tarp", vehicleEmoji: "\u{1F69B}",
    plate: "ABC-1234", dist: "3.5 km", distNum: 3.5, eta: "~15 mins", etaMin: 15,
    capacity: "2,500 kg", pax: 2, floor: 500,
    licVerified: true, orcrVerified: true, vehicleVerified: true, insured: true, online: true,
    message: "Hello Maria! I have 2 assistants ready on board to help load and unload all 30 cement sacks. Can arrive in 15 mins.",
    fareNote: "Includes fuel & helper loading",
    helpers: 2, includes: ["2 Helpers — loading & unloading", "Weather-proof tarp", "Ratchet straps & tie-downs", "LTO-compliant route"],
    price: 850, recommended: true, showVacant: true, showCompare: true,
  },
  {
    id: "rey", name: "Rey Tamayo", initials: "RT", color: "#7C3AED", isPro: false,
    rating: 4.8, reviews: 182, jobs: 182, acceptance: "89%", responseTime: "< 5 min",
    location: "Cagayan De Oro Road, Malaybalay City", timeAway: "8m away",
    vehicle: "Toyota Hilux 4x4 Pickup", vehicleShort: "Toyota Hilux 4x4 Pickup",
    vehicleDesc: "Utility Pickup with Tarpaulin Cover", vehicleEmoji: "\u{1F6FB}",
    plate: "DEF-5678", dist: "4.8 km", distNum: 4.8, eta: "~20 mins", etaMin: 20,
    capacity: "1,000 kg", pax: 3, floor: 380,
    licVerified: true, orcrVerified: true, vehicleVerified: true, insured: false, online: true,
    message: "I can carry your materials safely with heavy-duty tarpaulin cover. Ready to load now.",
    fareNote: "Includes fuel & helper loading",
    helpers: 0, includes: ["Weather-proof tarp", "Basic tie-downs"],
    price: 750, showVacant: false, showCompare: true,
  },
  {
    id: "xyz", name: "XYZ Mindanao Logistics Fleet", initials: "XM", color: "#374151", isPro: true,
    rating: 4.95, reviews: 1420, jobs: 1420, acceptance: "96%", responseTime: "< 3 min",
    location: "Sayre Highway Commercial Area", timeAway: "9m away",
    vehicle: "Fuso Canter 4-Wheel Heavy Dropside", vehicleShort: "Fuso Canter 4-Wheel Heavy Dropside",
    vehicleDesc: "Commercial Heavy Dropside with GPS Tracker", vehicleEmoji: "\u{1F69B}",
    plate: "JKL-1121", dist: "6.2 km", distNum: 6.2, eta: "~25 mins", etaMin: 25,
    capacity: "3,000 kg", pax: 1, floor: 800,
    licVerified: true, orcrVerified: true, vehicleVerified: true, insured: true, online: true,
    message: "Official logistics company unit with GPS tracker, commercial cargo insurance coverage up to P100,000.",
    fareNote: "Includes fuel & helper loading",
    helpers: 3, includes: ["3 Helpers", "Full cargo insurance", "GPS tracking", "KadaGo Pro Partner"],
    price: 1100, showVacant: false, showCompare: true,
  },
  {
    id: "rogelio", name: "Rogelio Mendoza", initials: "RM", color: "#D97706", isPro: false,
    rating: 4.88, reviews: 64, jobs: 64, acceptance: "87%", responseTime: "< 6 min",
    location: "Sayre Highway, Valencia City, Bukidnon", timeAway: "6m away",
    vehicle: "Toyota Hilux Dropside 4x4", vehicleShort: "Toyota Hilux Dropside 4x4 Heavy Hauler",
    vehicleDesc: "Utility Pickup with Heavy Duty Springs", vehicleEmoji: "\u{1F6FB}",
    plate: "NGA-4412", dist: "4.8 km", distNum: 4.8, eta: "~20 mins", etaMin: 20,
    capacity: "1,000 kg", pax: 3, floor: 380,
    licVerified: true, orcrVerified: true, vehicleVerified: true, insured: false, online: true,
    message: "Tarp available. Good for medium loads. Can be there fast.",
    fareNote: "Includes tarp & basic loading",
    helpers: 0, includes: ["Weather-proof tarp", "Basic tie-downs"],
    price: 780, showVacant: true, showCompare: false,
  },
  {
    id: "danilo", name: "Danilo Cruz", initials: "DC", color: "#059669", isPro: false,
    rating: 4.92, reviews: 112, jobs: 112, acceptance: "78%", responseTime: "< 10 min",
    location: "Brgy. Casisang, Malaybalay City", timeAway: "5m away",
    vehicle: "Honda Click 125i Courier", vehicleShort: "Honda Click 125i (with 65L Insulated Top Box)",
    vehicleDesc: "Motorcycle Courier / Fast Errand Box", vehicleEmoji: "\u{1F3CD}️",
    plate: "MC-9012", dist: "2.1 km", distNum: 2.1, eta: "~10 mins", etaMin: 10,
    capacity: "65 L", pax: 1, floor: 50,
    licVerified: true, orcrVerified: true, vehicleVerified: true, insured: false, online: true,
    message: "Available now for immediate pickup. Fast courier for small items.",
    fareNote: "Fast courier delivery",
    helpers: 0, includes: ["Insulated top box 65L", "Fast errand delivery"],
    price: 120, showVacant: true, showCompare: false,
  },
  {
    id: "marlon", name: "Marlon Bautista", initials: "MB", color: "#DC2626", isPro: false,
    rating: 4.96, reviews: 45, jobs: 45, acceptance: "91%", responseTime: "< 3 min",
    location: "Manolo Fortich Highway Junction", timeAway: "7m away",
    vehicle: "Toyota Innova MPV", vehicleShort: "Toyota Innova / MPV Passenger & Parcel",
    vehicleDesc: "Air-Conditioned 7-Seater MPV", vehicleEmoji: "\u{1F690}",
    plate: "NCD-8819", dist: "1.8 km", distNum: 1.8, eta: "~8 mins", etaMin: 8,
    capacity: "800 kg", pax: 7, floor: 280,
    licVerified: true, orcrVerified: true, vehicleVerified: true, insured: true, online: true,
    message: "Available for immediate dispatch.",
    fareNote: "Includes basic transport",
    helpers: 0, includes: ["Basic transport", "AC vehicle", "Canvas tarp"],
    price: 780, showVacant: true, showCompare: false,
  },
];

const VACANT_DRIVERS = DRIVERS.filter(d => d.showVacant);
const COMPARE_DRIVERS = DRIVERS.filter(d => d.showCompare);

function Avatar({ d, size = 40 }: { d: Driver; size?: number }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="rounded-full flex items-center justify-center font-bold text-white"
        style={{ width: size, height: size, background: d.color, fontSize: size * 0.32 }}>
        {d.initials}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
        style={{ background: d.online ? DS.green : DS.muted, borderColor: "#FFFFFF" }}/>
    </div>
  );
}

function VerifyBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: ok ? "rgba(22,163,74,0.12)" : "rgba(100,116,139,0.1)" }}>
        {ok
          ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={DS.muted} strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        }
      </div>
      <span className="text-[10px] font-semibold" style={{ color: ok ? DS.green : DS.mutedFg }}>{label}</span>
    </div>
  );
}

function PageHeader({ title, subtitle, onBack, right }: {
  title: string; subtitle?: string; onBack: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${DS.border}` }}>
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.heading} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "40px", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-black leading-tight" style={{ color: DS.heading }}>{title}</h1>
          {subtitle && <p className="text-[10px]" style={{ color: DS.mutedFg }}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

// ── Vacant Rider Card ─────────────────────────────────────────────────────────

function VacantRiderCard({ d, onViewProfile, onBook }: {
  d: Driver; onViewProfile: (d: Driver) => void; onBook: (d: Driver) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: `1px solid ${d.recommended ? "rgba(244,123,32,0.3)" : DS.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="p-3">

        {/* Header row */}
        <div className="relative flex items-start gap-2 mb-2">
          <div className="relative flex-shrink-0">
            <div className="rounded-xl flex items-center justify-center font-bold text-white text-[12px]"
              style={{ width: 38, height: 38, background: d.color }}>
              {d.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: d.online ? DS.green : DS.muted, borderColor: "#FFFFFF" }}/>
          </div>
          <div className="flex-1 min-w-0" style={{ paddingRight: "40px" }}>
            <p className="text-[11px] font-black leading-tight" style={{ color: DS.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={DS.mutedFg} strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <p className="text-[7.5px] leading-tight" style={{ color: DS.mutedFg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "76px" }}>{d.location}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(11,142,126,0.1)", border: "1px solid rgba(11,142,126,0.3)" }}>
            <span className="text-[7.5px] font-black" style={{ color: DS.teal }}>{d.timeAway}</span>
          </div>
        </div>

        {/* Vehicle sub-card */}
        <div className="rounded-xl p-2 mb-2.5" style={{ background: "#F1F5FF", border: `1px solid ${DS.border}` }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[14px]"
              style={{ background: "rgba(29,85,214,0.1)", border: "1px solid rgba(29,85,214,0.15)" }}>
              {d.vehicleEmoji}
            </div>
            <div className="min-w-0">
              <p className="text-[8.5px] font-black leading-tight" style={{ color: DS.heading }}>{d.vehicleShort}</p>
              <p className="text-[7px] leading-tight" style={{ color: DS.mutedFg }}>{d.vehicleDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,0.06)", color: DS.muted }}>{d.plate}</span>
            {d.pax !== null && (
              <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                style={{ background: "rgba(29,85,214,0.08)", color: DS.blue }}>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="7" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                {d.pax} pax
              </span>
            )}
          </div>
        </div>

        {/* Rating + min floor */}
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <span className="text-[10px] font-bold" style={{ color: DS.yellow }}>&#9733; {d.rating}</span>
            <span className="text-[7.5px] ml-0.5" style={{ color: DS.muted }}>({d.reviews})</span>
          </div>
          <div className="text-right">
            <p className="text-[7px]" style={{ color: DS.muted }}>Min Floor</p>
            <p className="text-[12px] font-black" style={{ color: DS.orange }}>&#8369;{d.floor}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-1.5">
          <button onClick={() => onViewProfile(d)}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-[8px] font-bold transition-opacity active:opacity-70"
            style={{ background: "#EEF2FF", border: `1px solid rgba(29,85,214,0.2)`, color: DS.blue }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View OR/CR &amp; Specs
          </button>
          <button onClick={() => onBook(d)}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-bold text-white transition-opacity active:opacity-80"
            style={{ background: DS.blue }}>
            Book Now &gt;
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Screen: Search Vacant Riders ──────────────────────────────────────────────

function SearchVacantScreen({ onBack, onViewProfile, onBook }: {
  onBack: () => void;
  onViewProfile: (d: Driver) => void;
  onBook: (d: Driver) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return VACANT_DRIVERS;
    const q = query.toLowerCase();
    return VACANT_DRIVERS.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.vehicleShort.toLowerCase().includes(q) ||
      d.vehicleDesc.toLowerCase().includes(q) ||
      d.plate.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="h-full flex flex-col" style={{ background: DS.bg }}>

      {/* Blue gradient header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg, #1D55D6 0%, #1447B8 100%)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            &#x1F69B;
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-[14px] font-black text-white leading-tight">
                Search Vacant Riders &amp; Vehicles
              </h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(22,163,74,0.9)", border: "1px solid rgba(255,255,255,0.3)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white"/>
                <span className="text-[7.5px] font-black text-white">Live Available</span>
              </div>
            </div>
            <p className="text-[8.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
              Verified drivers in Bukidnon with full OR/CR, vehicle build specs &amp; passenger capacities
            </p>
          </div>
          <button onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search bar + Fast pill */}
      <div className="flex-shrink-0 px-3 py-3 flex items-center gap-2"
        style={{ background: "#FFFFFF", borderBottom: `1px solid ${DS.border}` }}>
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: DS.inputBg, border: `1px solid ${DS.border}` }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.muted} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by rider name, vehicle build, plate, or Malaybalay location..."
            className="flex-1 bg-transparent text-[10px] outline-none"
            style={{ color: DS.heading }}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DS.muted} strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-center justify-center px-2.5 py-2 rounded-xl"
          style={{ background: "rgba(244,123,32,0.08)", border: "1px solid rgba(244,123,32,0.25)", minWidth: "80px" }}>
          <span className="text-base leading-none mb-0.5">&#x26A1;</span>
          <span className="text-[7px] font-black text-center leading-tight" style={{ color: DS.orange }}>
            Fast 5-7 Mins<br/>Target Arrival
          </span>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(d => (
              <VacantRiderCard key={d.id} d={d} onViewProfile={onViewProfile} onBook={onBook} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-4xl mb-3">&#x1F50D;</span>
            <p className="text-sm font-bold mb-1" style={{ color: DS.heading }}>No drivers found</p>
            <p className="text-[11px]" style={{ color: DS.mutedFg }}>Try adjusting your search.</p>
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mt-4 mx-1 flex items-center gap-3">
          <p className="text-[8px] flex-1" style={{ color: DS.muted }}>
            All vacant riders are pre-verified with Philippine LTO and KadaGo Admin clearance.
          </p>
          <button onClick={onBack}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${DS.border}`, color: DS.body }}>
            Close
          </button>
        </div>
        <div style={{ height: "12px" }}/>
      </div>
    </div>
  );
}

// ── Compare Driver Card ───────────────────────────────────────────────────────

function CompareDriverCard({ d, onViewProfile, onSelect, onChat }: {
  d: Driver; onViewProfile: () => void; onSelect: () => void; onChat: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${d.recommended ? "rgba(244,123,32,0.4)" : DS.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>

      {d.recommended && (
        <div className="absolute top-0 right-0 z-10 px-3 py-1.5"
          style={{ background: DS.orange, borderRadius: "0 16px 0 12px" }}>
          <span className="text-[7.5px] font-black text-white">&#x2605; TOP RECOMMENDED PRO</span>
        </div>
      )}

      <div className="p-3" style={{ paddingTop: d.recommended ? "14px" : "12px" }}>
        <div className="flex gap-2">

          {/* LEFT: driver info */}
          <div style={{ width: "108px", flexShrink: 0 }}>
            <div className="relative mb-2" style={{ width: 44, height: 44 }}>
              <div className="rounded-xl flex items-center justify-center font-bold text-white text-[13px]"
                style={{ width: 44, height: 44, background: d.color }}>
                {d.initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{ background: DS.green, borderColor: "#FFFFFF" }}/>
            </div>
            <div className="flex items-center gap-1 flex-wrap mb-0.5">
              <span className="text-[10px] font-black leading-tight" style={{ color: DS.heading }}>{d.name}</span>
              {d.isPro && (
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ background: DS.orange, color: "white" }}>PRO</span>
              )}
            </div>
            <div className="flex items-center gap-0.5 mb-1.5 flex-wrap">
              <span className="text-[8px] font-bold" style={{ color: DS.yellow }}>&#9733; {d.rating}</span>
              <span className="text-[7px]" style={{ color: DS.muted }}> &middot; {d.jobs} jobs done</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {d.licVerified && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(22,163,74,0.1)", color: DS.green, border: "1px solid rgba(22,163,74,0.2)" }}>
                  &#x2713; License
                </span>
              )}
              {d.vehicleVerified && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(22,163,74,0.1)", color: DS.green, border: "1px solid rgba(22,163,74,0.2)" }}>
                  &#x2713; Vehicle
                </span>
              )}
              {d.insured && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(22,163,74,0.1)", color: DS.green, border: "1px solid rgba(22,163,74,0.2)" }}>
                  &#x2713; Insured
                </span>
              )}
            </div>
          </div>

          {/* MIDDLE: vehicle + message + dist/ETA */}
          <div className="flex-1 min-w-0 px-2.5"
            style={{ borderLeft: `1px solid ${DS.border}`, borderRight: `1px solid ${DS.border}` }}>
            <div className="flex items-center gap-1 mb-0.5">
              <svg width="11" height="9" viewBox="0 0 24 16" fill="none" className="flex-shrink-0">
                <rect x="0" y="2" width="16" height="10" rx="2" fill={DS.mutedFg}/>
                <path d="M16 5h5l3 5v4h-8V5z" fill={DS.mutedFg}/>
              </svg>
              <span className="text-[9px] font-bold leading-tight" style={{ color: DS.heading }}>{d.vehicleShort}</span>
            </div>
            <p className="text-[7.5px] mb-2" style={{ color: DS.mutedFg }}>
              Plate: {d.plate} &bull; {d.capacity}
            </p>
            {d.message && (
              <div className="px-2 py-1.5 rounded-lg mb-2"
                style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${DS.border}` }}>
                <p className="text-[7.5px] italic leading-relaxed" style={{ color: DS.mutedFg }}>
                  "{d.message}"
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={DS.mutedFg} strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-[7.5px]" style={{ color: DS.mutedFg }}>{d.dist} away</span>
              </div>
              <div className="flex items-center gap-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={DS.mutedFg} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-[7.5px]" style={{ color: DS.mutedFg }}>ETA {d.eta}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: price + action buttons */}
          <div className="flex flex-col items-end" style={{ width: "84px", flexShrink: 0 }}>
            <p className="text-[7px] font-black tracking-wider mb-0.5" style={{ color: DS.muted }}>OFFERED PRICE</p>
            <p className="text-[18px] font-black leading-tight" style={{ color: DS.orange }}>
              &#8369;{d.price}<span className="text-[10px]">.00</span>
            </p>
            <p className="text-[7px] italic mb-3 text-right" style={{ color: DS.green }}>{d.fareNote}</p>
            <div className="flex gap-1 w-full mb-1.5">
              <button onClick={onChat}
                className="flex items-center justify-center rounded-xl transition-opacity active:opacity-70 flex-shrink-0"
                style={{ width: 30, height: 30, background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}` }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.heading} strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </button>
              <button onClick={onViewProfile}
                className="flex-1 rounded-xl text-[8px] font-bold transition-opacity active:opacity-70"
                style={{ height: 30, background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}`, color: DS.body }}>
                Profile
              </button>
            </div>
            <button onClick={onSelect}
              className="w-full py-2 rounded-xl text-[8px] font-bold text-white text-center transition-opacity active:opacity-80"
              style={{ background: `linear-gradient(135deg, #1D55D6 0%, #1447B8 100%)` }}>
              &#x2713; Select &amp; Book
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Screen: Compare Driver Offers ─────────────────────────────────────────────

function CompareOffersScreen({ onBack, onViewProfile, onSelect, onChat }: {
  onBack: () => void;
  onViewProfile: (d: Driver) => void;
  onSelect: (d: Driver) => void;
  onChat: (d: Driver) => void;
}) {
  const [sortBy, setSortBy] = useState<SortBy>("match");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sorted = useMemo(() => {
    const list = [...COMPARE_DRIVERS];
    if (sortBy === "price") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "eta") list.sort((a, b) => a.etaMin - b.etaMin);
    else list.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    return list;
  }, [sortBy]);

  const sortLabels: Record<SortBy, string> = {
    match: "Best Match", price: "Lowest Price", rating: "Highest Rating", eta: "Fastest Arrival",
  };
  const SORT_OPTIONS: SortBy[] = ["match", "price", "rating", "eta"];

  return (
    <div className="h-full flex flex-col" style={{ background: DS.bg }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3"
        style={{ background: "#FFFFFF", borderBottom: `1px solid ${DS.border}` }}>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DS.green }}/>
          <span className="text-[9px] font-black tracking-wider" style={{ color: DS.orange }}>
            LIVE BIDS (4 DRIVERS RESPONDED)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.heading} strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-[15px] font-black flex-1" style={{ color: DS.heading }}>Compare &amp; Select Your Driver</h1>
          {/* Sort dropdown */}
          <div className="relative">
            <button onClick={() => setShowSortMenu(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold transition-opacity active:opacity-70"
              style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}`, color: DS.body }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DS.muted} strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              {sortLabels[sortBy]}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DS.body} strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-1 z-50 rounded-2xl overflow-hidden shadow-lg"
                style={{ background: "#FFFFFF", border: `1px solid ${DS.borderMd}`, minWidth: "158px" }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt}
                    onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[11px] font-semibold text-left transition-opacity active:opacity-70"
                    style={{
                      color: sortBy === opt ? DS.heading : DS.mutedFg,
                      background: sortBy === opt ? "rgba(29,85,214,0.06)" : "transparent",
                    }}>
                    <div style={{ width: 10 }}>
                      {sortBy === opt && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DS.orange} strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    {sortLabels[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSortMenu && (
        <div className="absolute inset-0 z-40" onClick={() => setShowSortMenu(false)}/>
      )}

      <div className="flex-1 overflow-y-auto">

        {/* Request summary */}
        <div className="mx-3 mt-3 px-4 py-3 rounded-2xl"
          style={{ background: DS.cardJob, border: `1px solid ${DS.cardJobBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
              style={{ background: DS.orange }}>
              &#x1F69B;
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black leading-tight" style={{ color: DS.heading }}>30 Sacks of Portland Cement (Type 1)</p>
              <p className="text-[9px] mt-0.5" style={{ color: DS.mutedFg }}>
                30 sacks &bull; 1200 kg &bull; Pickup: ABC Hardware &amp; Construction Depot, Fortich St.
              </p>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <p className="text-[7px] font-black tracking-wider" style={{ color: DS.muted }}>YOUR TARGET BUDGET</p>
              <p className="text-[22px] font-black leading-tight" style={{ color: DS.orange }}>&#8369;950</p>
            </div>
          </div>
        </div>

        {/* Driver offer cards */}
        <div className="px-3 pt-3 pb-3 space-y-3">
          {sorted.map(d => (
            <CompareDriverCard
              key={d.id}
              d={d}
              onViewProfile={() => onViewProfile(d)}
              onSelect={() => onSelect(d)}
              onChat={() => onChat(d)}
            />
          ))}
        </div>
        <div style={{ height: "8px" }}/>
      </div>
    </div>
  );
}

// ── Screen: Driver Profile ────────────────────────────────────────────────────

const SAMPLE_REVIEWS = [
  { author: "Maria C.", text: "Delivered on time! Very professional and careful with the cargo.", stars: 5, date: "Aug 2026" },
  { author: "Edgar T.", text: "Good driver, communicated well throughout the delivery. Will book again.", stars: 5, date: "Jul 2026" },
  { author: "Rhea M.", text: "Cargo arrived safely. Straps and tarp were solid. No complaints.", stars: 4, date: "Jun 2026" },
];

function DriverProfileScreen({ driver, fromPage, onBack, onBook, onChat }: {
  driver: Driver; fromPage: DSPage;
  onBack: () => void; onBook: () => void; onChat: () => void;
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: DS.bg }}>
      <PageHeader title="Driver Profile" subtitle={`${driver.vehicleShort} · ${driver.plate}`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-5 pb-4" style={{ background: "#FFFFFF", borderBottom: `1px solid ${DS.border}` }}>
          <div className="flex items-start gap-4 mb-4">
            <Avatar d={driver} size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-[18px] font-black" style={{ color: DS.heading }}>{driver.name}</h2>
                {driver.licVerified && driver.orcrVerified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[9px] font-black" style={{ color: DS.green }}>VERIFIED PRO</span>
                  </div>
                )}
                {driver.isPro && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: DS.orange, color: "white" }}>PRO</span>
                )}
              </div>
              <p className="text-[11px] mb-2" style={{ color: DS.mutedFg }}>Verified Professional Driver &middot; Bukidnon, PH</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black" style={{ color: DS.yellow }}>&#9733; {driver.rating}</span>
                <span className="text-[11px] font-semibold" style={{ color: DS.body }}>({driver.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Jobs Done", value: driver.jobs.toString() },
              { label: "Acceptance", value: driver.acceptance },
              { label: "Response", value: driver.responseTime },
            ].map(s => (
              <div key={s.label} className="text-center px-2 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}` }}>
                <p className="text-[15px] font-black" style={{ color: DS.heading }}>{s.value}</p>
                <p className="text-[9px]" style={{ color: DS.mutedFg }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 pt-3 space-y-3 pb-3">
          <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
            style={{ background: "#F1F5FF", border: `1px solid rgba(0,0,0,0.08)` }}>
            <div>
              <p className="text-[10px] font-black tracking-wider mb-0.5" style={{ color: DS.blue }}>OFFERED PRICE</p>
              <p className="text-[22px] font-black" style={{ color: DS.orange }}>&#8369;{driver.price}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: DS.mutedFg }}>Distance: {driver.dist}</p>
              <p className="text-[10px]" style={{ color: DS.mutedFg }}>ETA: {driver.eta}</p>
              {driver.helpers > 0 && <p className="text-[10px] mt-0.5" style={{ color: DS.green }}>{driver.helpers} helper{driver.helpers > 1 ? "s" : ""} included</p>}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: DS.card, border: `1px solid ${DS.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${DS.border}` }}>
              <p className="text-[10px] font-black tracking-wider" style={{ color: DS.muted }}>VEHICLE INFORMATION</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.15)" }}>
                  {driver.vehicleEmoji}
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: DS.heading }}>{driver.vehicleShort}</p>
                  <p className="text-[10px]" style={{ color: DS.mutedFg }}>Plate: {driver.plate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { label: "Cargo Capacity", value: driver.capacity },
                  { label: "Passengers", value: driver.pax ? `${driver.pax} pax` : "Cargo only" },
                  { label: "Min Floor Price", value: `₱${driver.floor}` },
                  { label: "Helpers", value: driver.helpers > 0 ? `${driver.helpers} available` : "None" },
                ].map(r => (
                  <div key={r.label} className="px-3 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${DS.border}` }}>
                    <p className="text-[9px] mb-0.5" style={{ color: DS.muted }}>{r.label}</p>
                    <p className="text-[12px] font-bold" style={{ color: DS.heading }}>{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: DS.card, border: `1px solid ${DS.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${DS.border}` }}>
              <p className="text-[10px] font-black tracking-wider" style={{ color: DS.muted }}>VERIFICATION STATUS</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {[
                { label: "PhilID — National Identity", ok: true },
                { label: "LTO Driver's License", ok: driver.licVerified },
                { label: `OR/CR — Plate ${driver.plate}`, ok: driver.orcrVerified },
                { label: "Vehicle Insurance", ok: driver.insured },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: v.ok ? "rgba(22,163,74,0.1)" : "rgba(234,179,8,0.1)" }}>
                    {v.ok
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.yellow} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                  </div>
                  <span className="text-[12px]" style={{ color: v.ok ? DS.body : DS.mutedFg }}>{v.label}</span>
                  {!v.ok && <span className="ml-auto text-[9px]" style={{ color: DS.yellow }}>Pending</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: DS.card, border: `1px solid ${DS.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${DS.border}` }}>
              <p className="text-[10px] font-black tracking-wider" style={{ color: DS.muted }}>CUSTOMER REVIEWS</p>
              <span className="text-[11px] font-semibold" style={{ color: DS.yellow }}>&#9733; {driver.rating} avg</span>
            </div>
            <div className="divide-y" style={{ borderColor: DS.border }}>
              {SAMPLE_REVIEWS.map(r => (
                <div key={r.author} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #1D55D6, #F47B20)" }}>
                        {r.author[0]}
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: DS.heading }}>{r.author}</span>
                    </div>
                    <span className="text-[9px]" style={{ color: DS.muted }}>{r.date}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: DS.mutedFg }}>"{r.text}"</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i < r.stars ? DS.yellow : "rgba(0,0,0,0.1)"}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2.5" style={{ background: "#FFFFFF", borderTop: `1px solid ${DS.border}` }}>
        <button onClick={onBook}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, #1D55D6 0%, #1447B8 100%)` }}>
          Book {driver.name.split(" ")[0]} &mdash; &#8369;{driver.price}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <div className="flex gap-2">
          <button onClick={onChat}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
            style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.25)", color: DS.blue }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.blue} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Chat
          </button>
          <button onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}`, color: DS.body }}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Confirm & Book ────────────────────────────────────────────────────

function ConfirmBookingScreen({ driver, onGoToActiveJob, onBack }: {
  driver: Driver; onGoToActiveJob: () => void; onBack: () => void;
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: DS.bg }}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${DS.border}` }}>
        <div className="flex items-center gap-3">
          <img src={kadaGoLogo} alt="KadaGo" style={{ width: "44px" }} />
          <div>
            <p className="text-[9px] font-black tracking-widest" style={{ color: DS.green }}>&#x2726; DRIVER CONFIRMED</p>
            <h1 className="text-[16px] font-black leading-tight" style={{ color: DS.heading }}>Driver Selected!</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.35)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full" style={{ animation: "pulseOval 2.5s ease-in-out infinite" }}/>
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: DS.heading }}>Driver Selected Successfully!</h2>
          <p className="text-[12px]" style={{ color: DS.mutedFg }}>Your booking is now confirmed and active.</p>
        </div>

        <div className="rounded-2xl mb-3" style={{ background: DS.cardJob, border: `1px solid ${DS.cardJobBorder}` }}>
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3 mb-3">
              <Avatar d={driver} size={50} />
              <div>
                <p className="text-[15px] font-black" style={{ color: DS.heading }}>{driver.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold" style={{ color: DS.yellow }}>&#9733; {driver.rating}</span>
                  <span className="text-[9px]" style={{ color: DS.muted }}>&middot; {driver.jobs} Jobs</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.1)", color: DS.green }}>Verified Pro</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Vehicle", value: driver.vehicleShort },
                { label: "Plate Number", value: driver.plate },
                { label: "Offered Price", value: `₱${driver.price}`, highlight: true },
                { label: "Estimated Arrival", value: driver.eta },
                { label: "Job ID", value: "KG-12389" },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${DS.border}` }}>
                  <span className="text-[11px]" style={{ color: DS.mutedFg }}>{r.label}</span>
                  <span className="text-[12px] font-bold" style={{ color: r.highlight ? DS.orange : DS.heading }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-3"
          style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.18)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
          <div>
            <p className="text-[12px] font-bold" style={{ color: DS.green }}>Live GPS Tracking is now active.</p>
            <p className="text-[10px] leading-relaxed" style={{ color: DS.mutedFg }}>You can now track your booking live. The driver is heading to the pickup location.</p>
          </div>
        </div>
        <div style={{ height: "4px" }}/>
      </div>

      <div className="flex-shrink-0 px-4 py-3 space-y-2.5" style={{ background: "#FFFFFF", borderTop: `1px solid ${DS.border}` }}>
        <button onClick={onGoToActiveJob}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, #1D55D6 0%, #1447B8 100%)` }}>
          Go to Active Job
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button onClick={onBack}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-center transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}`, color: DS.body }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── Screen: In-App Chat ───────────────────────────────────────────────────────

const CHAT_MESSAGES = [
  { from: "system", text: "Booking confirmed — Job KG-12389" },
  { from: "driver", text: "Hello Maria! I am now on my way to ABC Hardware & Construction Depot." },
  { from: "driver", text: "ETA approximately 15 minutes. I have 2 helpers with me." },
  { from: "you", text: "Thank you! The depot staff is expecting you." },
  { from: "you", text: "Please use Gate B for the cement loading area." },
  { from: "driver", text: "Noted! Will proceed to Gate B." },
  { from: "driver", text: "Sharing my live location now." },
  { from: "you", text: "Great, thank you!" },
];

function ChatScreen({ driver, onBack }: { driver: Driver; onBack: () => void }) {
  const [input, setInput] = useState("");

  return (
    <div className="h-full flex flex-col" style={{ background: DS.bg }}>
      <div className="flex-shrink-0 px-3 pt-3 pb-2.5" style={{ background: "#FFFFFF", borderBottom: `1px solid ${DS.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.heading} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <Avatar d={driver} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black leading-tight" style={{ color: DS.heading }}>{driver.name}</p>
            <p className="text-[10px]" style={{ color: DS.green }}>&#x25CF; Online &middot; Job KG-12389</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <span className="text-[11px] font-bold" style={{ color: DS.green }}>Call Driver</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {CHAT_MESSAGES.map((msg, i) => {
          if (msg.from === "system") {
            return (
              <div key={i} className="flex justify-center">
                <div className="px-3 py-1.5 rounded-full text-[10px] font-semibold"
                  style={{ background: "rgba(22,163,74,0.08)", color: DS.green, border: "1px solid rgba(22,163,74,0.18)" }}>
                  {msg.text}
                </div>
              </div>
            );
          }
          const isYou = msg.from === "you";
          return (
            <div key={i} className={`flex items-end gap-2 ${isYou ? "flex-row-reverse" : ""}`}>
              {!isYou && <Avatar d={driver} size={28} />}
              <div className="max-w-[75%] px-3 py-2.5 text-[12px] leading-relaxed"
                style={{
                  background: isYou ? `linear-gradient(135deg, ${DS.orange}, #E86500)` : "#FFFFFF",
                  color: isYou ? "white" : DS.body,
                  border: isYou ? "none" : `1px solid ${DS.border}`,
                  borderRadius: isYou ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  boxShadow: isYou ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 px-3 pb-4 pt-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${DS.border}` }}>
        <div className="flex gap-2 mb-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-opacity active:opacity-70"
            style={{ background: "#EEF2FF", border: "1px solid rgba(29,85,214,0.2)", color: DS.blue }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DS.blue} strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            Share Location
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${DS.border}`, color: DS.body }}>
            Job Details
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: DS.inputBg, border: `1px solid ${DS.border}` }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: DS.heading }}
            />
          </div>
          <button className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-70"
            style={{ background: `linear-gradient(135deg, ${DS.orange}, #E86500)` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main DriverSearch Component ───────────────────────────────────────────────

interface DriverSearchProps {
  initialScreen?: DSPage;
  onClose: () => void;
  onGoToActiveJob: () => void;
}

export default function DriverSearch({ initialScreen = "search", onClose, onGoToActiveJob }: DriverSearchProps) {
  const [page, setPage] = useState<DSPage>(initialScreen);
  const [selectedDriver, setSelectedDriver] = useState<Driver>(DRIVERS[0]);
  const [prevPage, setPrevPage] = useState<DSPage>(initialScreen);

  const goToProfile = (d: Driver, from: DSPage) => {
    setPrevPage(from);
    setSelectedDriver(d);
    setPage("profile");
  };

  const goToConfirm = (d: Driver) => {
    setSelectedDriver(d);
    setPage("confirm");
  };

  const goToChat = (d: Driver) => {
    setPrevPage(page);
    setSelectedDriver(d);
    setPage("chat");
  };

  switch (page) {
    case "search":
      return (
        <SearchVacantScreen
          onBack={onClose}
          onViewProfile={d => goToProfile(d, "search")}
          onBook={goToConfirm}
        />
      );
    case "compare":
      return (
        <CompareOffersScreen
          onBack={onClose}
          onViewProfile={d => goToProfile(d, "compare")}
          onSelect={goToConfirm}
          onChat={goToChat}
        />
      );
    case "profile":
      return (
        <DriverProfileScreen
          driver={selectedDriver}
          fromPage={prevPage}
          onBack={() => setPage(prevPage)}
          onBook={() => goToConfirm(selectedDriver)}
          onChat={() => goToChat(selectedDriver)}
        />
      );
    case "confirm":
      return (
        <ConfirmBookingScreen
          driver={selectedDriver}
          onGoToActiveJob={onGoToActiveJob}
          onBack={() => setPage(prevPage)}
        />
      );
    case "chat":
      return (
        <ChatScreen
          driver={selectedDriver}
          onBack={() => setPage(prevPage)}
        />
      );
  }
}
