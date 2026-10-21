import { useEffect, useRef, useState } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";
import { MatchStatus, RequestStatusScreen } from "@/features/customer/HaulingStatus";
import { uploadPhoto } from "@/api/bookings";
import type { HaulingRequest } from "@/api/bookings";
import { useBookings } from "@/features/customer/BookingContext";

const B = {
  bg: "#F8FAFF",
  card: "#FFFFFF",
  blue: "#1D55D6",
  green: "#16A34A",
  red: "#DC2626",
  border: "rgba(0,0,0,0.08)",
  muted: "#64748b",
  mutedFg: "#94a3b8",
  text: "#0D1828",
};

export type CargoCategoryId = "agri" | "construction" | "bulky" | "other";

export const CATEGORIES: { id: CargoCategoryId; icon: "agri" | "construction" | "bulky" | "other"; label: string; sub: string; eg: string }[] = [
  { id: "agri", icon: "agri", label: "Agricultural Cargo", sub: "Farm and bulk agricultural products", eg: "Corn, rice, copra, grains, vegetables" },
  { id: "construction", icon: "construction", label: "Construction Materials", sub: "Building and construction supplies", eg: "Cement, steel, lumber, blocks, aggregates" },
  { id: "bulky", icon: "bulky", label: "Bulky & Heavy Goods", sub: "Large equipment and commercial cargo", eg: "Machinery, industrial equipment, oversized goods" },
  { id: "other", icon: "other", label: "Other Commercial Cargo", sub: "Other business cargo requiring truck transport", eg: "Other commercial cargo" },
];

export function CargoIcon({ type, size = 24 }: { type: "agri" | "construction" | "bulky" | "other"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (type === "agri") return <svg {...common}><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z"/><path d="M4 21c3-5 7-8 12-11"/></svg>;
  if (type === "construction") return <svg {...common}><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-5h6v5M8 11h2m4 0h2"/></svg>;
  if (type === "bulky") return <svg {...common}><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>;
  return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></svg>;
}

const WEIGHTS = ["50 kg", "200 kg", "600 kg", "1.2 tons", "2.5 tons", "5 tons", "10 tons"];
const HANDLING = ["Fragile", "Weather Sensitive", "Oversized", "Tarp Required", "Tie-down Required", "Other"];
const TRUCK_TYPES = ["No Preference", "Closed Van", "Wing Van", "Dropside", "Flatbed", "Dump Truck", "Other"];
const LOADING = ["Customer will load", "Loading assistance needed", "Forklift needed", "Crane needed", "Manual loading"];
const UNLOADING = ["Receiver will unload", "Unloading assistance needed", "Forklift needed", "Crane needed", "Manual unloading"];
const EQUIPMENT = ["Tarp", "Tie-downs", "Other"];
const STEP_LABELS = ["Cargo Category", "Pickup & Delivery", "Cargo Details", "Hauling Requirements", "Schedule & Notes", "Review Request"];

const cardStyle = { background: B.card, border: "1px solid #E2E8F0", boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)" };
const inputStyle = { background: "#FFFFFF", border: "1px solid #CBD5E1", color: B.text };

function SectionHeader({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0 shadow-sm" style={{ background: B.blue }}>{n}</div>
      <span className="text-base font-extrabold tracking-tight" style={{ color: B.text }}>{label}</span>
    </div>
  );
}

function Field({ label, value, placeholder, optional, type = "text", onChange, error }: { label: string; value?: string; placeholder?: string; optional?: boolean; type?: string; onChange?: (v: string) => void; error?: string }) {
  const inputId = `booking-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const valueProps = onChange ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : { defaultValue: value };
  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>{label}{optional && <span className="font-normal text-slate-500"> (optional)</span>}</label>
      <input id={inputId} type={type} {...valueProps} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} className="w-full min-h-11 px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" style={error ? { ...inputStyle, border: `1px solid ${B.red}` } : inputStyle} />
      {error && <p id={`${inputId}-error`} role="alert" className="text-xs font-semibold mt-1.5" style={{ color: B.red }}>{error}</p>}
    </div>
  );
}

function Chip({ label, active, onClick, round }: { label: string; active: boolean; onClick: () => void; round?: boolean }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-10 px-3.5 py-2 text-xs font-semibold transition-all active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${round ? "rounded-full" : "rounded-xl"}`}
      style={{ background: active ? B.blue : "#FFFFFF", color: active ? "white" : "#334155", border: `1px solid ${active ? B.blue : "#CBD5E1"}` }}>
      {label}
    </button>
  );
}

function CheckPill({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={checked} onClick={onToggle} className="flex min-h-10 items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      style={{ background: checked ? "#EFF6FF" : "#FFFFFF", border: `1px solid ${checked ? B.blue : "#CBD5E1"}`, color: checked ? B.blue : "#334155" }}>
      <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0" style={{ background: checked ? B.blue : "rgba(0,0,0,0.06)", border: checked ? "none" : "1.5px solid rgba(0,0,0,0.12)" }}>
        {checked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      {label}
    </button>
  );
}

function SubLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold tracking-wide mb-2" style={{ color: "#475569" }}>{children}</p>;
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function FormHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-3 sm:px-6" style={{ background: "#FFFFFF", borderBottom: `1px solid ${B.border}` }}>
      <div className="flex items-center gap-3">
        <button onClick={onBack} aria-label="Go back" className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 active:opacity-70" style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "52px" }} />
        <div className="min-w-0">
          <h1 className="text-lg font-black leading-tight" style={{ color: B.text }}>{title}</h1>
          {subtitle && <p className="text-xs leading-snug mt-0.5" style={{ color: "#64748B" }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <div className="flex-shrink-0 px-4 py-3 sm:px-6" style={{ background: "#fff", borderBottom: `1px solid ${B.border}` }}>
      <div className="flex items-center gap-1.5 mb-2.5" aria-label={`Step ${step + 1} of ${STEP_LABELS.length}`}>
        {STEP_LABELS.map((_, i) => (
          <button key={i} aria-label={`Step ${i + 1}: ${STEP_LABELS[i]}`} aria-current={i === step ? "step" : undefined} onClick={() => i < step && onGo(i)} className="flex-1 flex items-center">
            <span className="block w-full h-2 rounded-full transition-colors" style={{ background: i <= step ? B.blue : "#E2E8F0" }} />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: "#475569" }}>Step {step + 1} of 6</span>
        <span className="text-xs font-extrabold" style={{ color: B.blue }}>{STEP_LABELS[step]}</span>
      </div>
    </div>
  );
}

interface FormVals { pickup: string; pickupLandmark: string; pickupCity: string; pickupProvince: string; pickupContact: string; pickupPhone: string; pickupInstructions: string; delivery: string; deliveryLandmark: string; deliveryCity: string; deliveryProvince: string; receiver: string; receiverPhone: string; deliveryInstructions: string; cargo: string; qty: string; dimensions: string; notes: string; budget: string; pickupDate: string; pickupTime: string; deliveryDate: string; deliveryTime: string }
type Errors = Partial<Record<keyof FormVals | "weight", string>>;

// â”€â”€ Steps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StepCategory({ selected, onSelect }: { selected: CargoCategoryId; onSelect: (id: CargoCategoryId) => void }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <SectionHeader n={1} label="Cargo Category" />
      <div className="booking-categories space-y-2">
        {CATEGORIES.map((c) => {
          const active = selected === c.id;
          return (
            <button key={c.id} type="button" aria-pressed={active} onClick={() => onSelect(c.id)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              style={{ background: active ? "#EFF6FF" : "#FFFFFF", border: `1.5px solid ${active ? B.blue : "#CBD5E1"}`, boxShadow: active ? "0 3px 12px rgba(29,85,214,0.10)" : "none" }}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><CargoIcon type={c.icon} size={24} /></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: B.text }}>{c.label}</p>
                <p className="text-xs leading-snug mt-1" style={{ color: "#475569" }}>{c.sub}</p>
                <p className="text-[11px] leading-snug mt-1" style={{ color: "#64748B" }}>Examples: {c.eg}</p>
              </div>
              <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `1.5px solid ${active ? B.blue : "rgba(0,0,0,0.2)"}`, background: active ? B.blue : "transparent" }}>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepRoute({ f, set, errors }: { f: FormVals; set: (k: keyof FormVals, v: string) => void; errors: Errors }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <SectionHeader n={2} label="Pickup & Delivery" />
      <div className="space-y-3">
        <div className="rounded-2xl p-4" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={B.blue} strokeWidth="2"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="text-sm font-extrabold" style={{ color: B.blue }}>PICKUP LOCATION</span>
          </div>
          <div className="space-y-2">
            <Field label="Pickup Location (Address / Depot Name)" value={f.pickup} onChange={(v) => set("pickup", v)} error={errors.pickup} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Landmark" value={f.pickupLandmark} onChange={(v) => set("pickupLandmark", v)} optional />
              <Field label="City / Municipality" value={f.pickupCity} onChange={(v) => set("pickupCity", v)} error={errors.pickupCity} />
              <Field label="Province" value={f.pickupProvince} onChange={(v) => set("pickupProvince", v)} error={errors.pickupProvince} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Pickup Contact" value={f.pickupContact} onChange={(v) => set("pickupContact", v)} error={errors.pickupContact} />
              <Field label="Pickup Contact Number" value={f.pickupPhone} onChange={(v) => set("pickupPhone", v)} type="tel" error={errors.pickupPhone} />
            </div>
            <Field label="Pickup Instructions" value={f.pickupInstructions} onChange={(v) => set("pickupInstructions", v)} optional />
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="2"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="text-sm font-extrabold" style={{ color: "#15803D" }}>DELIVERY DESTINATION</span>
          </div>
          <div className="space-y-2">
            <Field label="Delivery Destination (Address)" value={f.delivery} onChange={(v) => set("delivery", v)} error={errors.delivery} />
            <Field label="Landmark" value={f.deliveryLandmark} onChange={(v) => set("deliveryLandmark", v)} optional />
            <div className="grid grid-cols-2 gap-2">
              <Field label="City / Municipality" value={f.deliveryCity} onChange={(v) => set("deliveryCity", v)} error={errors.deliveryCity} />
              <Field label="Province" value={f.deliveryProvince} onChange={(v) => set("deliveryProvince", v)} error={errors.deliveryProvince} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Receiver Contact" value={f.receiver} onChange={(v) => set("receiver", v)} error={errors.receiver} />
              <Field label="Receiver Contact Number" value={f.receiverPhone} onChange={(v) => set("receiverPhone", v)} type="tel" error={errors.receiverPhone} />
            </div>
            <Field label="Unloading Instructions" value={f.deliveryInstructions} onChange={(v) => set("deliveryInstructions", v)} optional />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCargo({ f, set, errors, weight, setWeight, handling, setHandling, photo, setPhoto }: { f: FormVals; set: (k: keyof FormVals, v: string) => void; errors: Errors; weight: string; setWeight: (v: string) => void; handling: string[]; setHandling: (v: string[]) => void; photo: File | null; setPhoto: (v: File | null) => void }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <SectionHeader n={3} label="Cargo Details" />
      <div className="space-y-3">
        <Field label="Cargo Description" value={f.cargo} onChange={(v) => set("cargo", v)} error={errors.cargo} />
        <Field label="Quantity / Count" value={f.qty} onChange={(v) => set("qty", v)} error={errors.qty} />
        <div role="group" aria-label="Estimated cargo weight" aria-invalid={!!errors.weight} aria-describedby={errors.weight ? "booking-weight-error" : undefined} tabIndex={-1}>
          <p className="text-sm font-semibold mb-2.5" style={{ color: "#334155" }}>Estimated Cargo Weight (kg or metric tons)</p>
          <div className="flex flex-wrap gap-2">
            {WEIGHTS.map((w) => <Chip key={w} label={w} round active={weight === w} onClick={() => setWeight(weight === w ? "" : w)} />)}
          </div>
          {errors.weight && <p id="booking-weight-error" role="alert" className="text-xs font-semibold mt-2" style={{ color: B.red }}>{errors.weight}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Dimensions L / W / H <span className="font-normal text-slate-500">(optional)</span></p>
          <div className="grid grid-cols-3 gap-2">
            <input value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="Length × Width × Height (m)" aria-label="Cargo dimensions, optional" className="w-full min-h-11 px-3.5 py-2.5 rounded-xl text-sm outline-none col-span-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" style={inputStyle} />
          </div>
        </div>
        <div>
          <SubLabel>SPECIAL HANDLING</SubLabel>
          <div className="flex flex-wrap gap-2">
            {HANDLING.map((h) => <CheckPill key={h} label={h} checked={handling.includes(h)} onToggle={() => setHandling(toggle(handling, h))} />)}
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "#F1F5FF", border: "1px solid #DBEAFE" }}>
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 text-blue-700" style={{ background: "rgba(0,0,0,0.04)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9H2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3"/></svg></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-1" style={{ color: B.text }}>Cargo photo</p>
            <p className="text-xs leading-relaxed mb-2.5" style={{ color: "#475569" }}>Optional. Add a JPEG, PNG, or WebP photo (up to 2 MB) to help dispatch assess your cargo.</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => document.getElementById("cargo-photo")?.click()} className="min-h-10 rounded-lg px-3 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", color: B.blue }}>
                {photo ? `Replace photo: ${photo.name}` : "Upload Photo (optional)"}
              </button>
              {photo && <button type="button" onClick={() => { setPhoto(null); const input = document.getElementById("cargo-photo") as HTMLInputElement | null; if (input) input.value = ""; }} className="min-h-10 rounded-lg px-3 text-xs font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: "#FFFFFF", border: "1px solid #CBD5E1" }}>Remove</button>}
            </div>
            <input id="cargo-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRequirements({ truckType, setTruckType, loading, setLoading, unloading, setUnloading, equipment, setEquipment, helpers, setHelpers }: {
  truckType: string; setTruckType: (v: string) => void;
  loading: string; setLoading: (v: string) => void;
  unloading: string; setUnloading: (v: string) => void;
  equipment: string[]; setEquipment: (v: string[]) => void;
  helpers: boolean; setHelpers: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <SectionHeader n={4} label="Hauling Requirements" />
        <div className="space-y-5">
        <div>
          <SubLabel>TRUCK MATCHING</SubLabel>
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <div className="w-5 h-5 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: B.blue }}><div className="w-2 h-2 rounded-full bg-white" /></div>
            <div>
              <p className="text-sm font-bold" style={{ color: B.text }}>Let KadaGo match the truck</p>
              <p className="text-xs leading-relaxed mt-1" style={{ color: "#475569" }}>Dispatch will suggest a verified truck based on your cargo weight, route, schedule, and requirements.</p>
            </div>
          </div>
          <p className="text-xs font-semibold mt-4 mb-2" style={{ color: "#334155" }}>Preferred truck type <span className="font-normal text-slate-500">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {TRUCK_TYPES.map((t) => <Chip key={t} label={t} active={truckType === t} onClick={() => setTruckType(t)} />)}
          </div>
          <p className="text-xs leading-relaxed mt-2" style={{ color: "#64748B" }}>Final truck assignment is confirmed by KadaGo dispatch.</p>
        </div>
        <div>
          <SubLabel>LOADING</SubLabel>
          <div className="flex flex-wrap gap-2">{LOADING.map((l) => <Chip key={l} label={l} active={loading === l} onClick={() => setLoading(l)} />)}</div>
        </div>
        <div>
          <SubLabel>UNLOADING</SubLabel>
          <div className="flex flex-wrap gap-2">{UNLOADING.map((l) => <Chip key={l} label={l} active={unloading === l} onClick={() => setUnloading(l)} />)}</div>
        </div>
        <div>
          <SubLabel>SPECIAL EQUIPMENT</SubLabel>
          <div className="flex flex-wrap gap-2">{EQUIPMENT.map((e) => <CheckPill key={e} label={e} checked={equipment.includes(e)} onToggle={() => setEquipment(toggle(equipment, e))} />)}</div>
        </div>
        <div>
          <SubLabel>HELPERS</SubLabel>
          <CheckPill label="Need Helpers" checked={helpers} onToggle={() => setHelpers(!helpers)} />
        </div>
      </div>
    </div>
  );
}

function StepSchedule({ f, set, errors, flexible, setFlexible }: { f: FormVals; set: (k: keyof FormVals, v: string) => void; errors: Errors; flexible: boolean; setFlexible: (v: boolean) => void }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <SectionHeader n={5} label="Schedule & Notes" />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Preferred pickup date" value={f.pickupDate} onChange={(v) => set("pickupDate", v)} type="date" error={errors.pickupDate} />
          <Field label="Preferred pickup time" value={f.pickupTime} onChange={(v) => set("pickupTime", v)} type="time" error={errors.pickupTime} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Preferred delivery date" optional value={f.deliveryDate} onChange={(v) => set("deliveryDate", v)} type="date" error={errors.deliveryDate} />
          <Field label="Preferred delivery time" optional value={f.deliveryTime} onChange={(v) => set("deliveryTime", v)} type="time" error={errors.deliveryTime} />
        </div>
        <button type="button" role="switch" aria-checked={flexible} aria-label="Flexible schedule" onClick={() => setFlexible(!flexible)} className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: "#F1F5FF", border: `1px solid ${B.border}` }}>
          <span>
            <p className="text-sm font-bold" style={{ color: B.text }}>Flexible schedule</p>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>KadaGo may coordinate a different pickup time with you.</p>
          </span>
          <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full transition-colors" style={{ background: flexible ? B.blue : "#64748B" }}>
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out" style={{ transform: flexible ? "translateX(20px)" : "translateX(0)" }} />
          </span>
        </button>
        <div>
          <Field label="Estimated budget (PHP)" optional value={f.budget} onChange={(v) => set("budget", v)} type="number" error={errors.budget} />
          <p className="text-xs leading-relaxed mt-1.5" style={{ color: "#64748B" }}>Optional reference only. Dispatch will coordinate the final hauling rate with you.</p>
        </div>
        <div>
          <label htmlFor="booking-additional-instructions" className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Additional instructions <span className="font-normal text-slate-500">(optional)</span></label>
          <textarea id="booking-additional-instructions" rows={4} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Add instructions for your shipment" className="w-full px-3.5 py-3 rounded-xl text-sm outline-none resize-y focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" style={inputStyle} />
        </div>
      </div>
    </div>
  );
}

function StepReview({ f, categoryLabel, weight, handling, loading, unloading, equipment, truckType, helpers, flexible, onEdit }: {
  f: FormVals; categoryLabel: string; weight: string; handling: string[]; loading: string; unloading: string; equipment: string[]; truckType: string; helpers: boolean; flexible: boolean; onEdit: () => void;
}) {
  const pickup = [f.pickup, f.pickupCity, f.pickupProvince].filter(Boolean).join(", ");
  const delivery = [f.delivery, f.deliveryCity, f.deliveryProvince].filter(Boolean).join(", ");
  const pickupContact = [f.pickupContact, f.pickupPhone].filter(Boolean).join(" · ");
  const deliveryContact = [f.receiver, f.receiverPhone].filter(Boolean).join(" · ");
  const scheduled = new Date(`${f.pickupDate}T${f.pickupTime}`).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
  const deliveryScheduled = f.deliveryDate && f.deliveryTime ? new Date(`${f.deliveryDate}T${f.deliveryTime}`).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "To be coordinated";
  const requirements = [loading, unloading, ...handling, ...equipment, helpers ? "Helpers requested" : ""].filter(Boolean).join(", ") || "No special requirements";
  const rows: [string, string][] = [
    ["Cargo Category", categoryLabel],
    ["Cargo", f.cargo],
    ["Quantity", f.qty || "Not specified"],
    ["Estimated Weight", weight],
    ["Dimensions", f.dimensions || "Not specified"],
    ["Pickup", pickup],
    ["Pickup Contact", pickupContact],
    ["Delivery", delivery],
    ["Receiver Contact", deliveryContact],
    ["Pickup Schedule", `${scheduled}${flexible ? " (flexible)" : ""}`],
    ["Delivery Schedule", deliveryScheduled],
    ["Requirements", requirements],
    ["Truck Matching", truckType === "No Preference" ? "To be matched by KadaGo" : `To be matched by KadaGo (prefers ${truckType})`],
    ["Budget", f.budget ? `PHP ${Number(f.budget).toLocaleString()} (optional reference)` : "Not specified"],
  ];
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <SectionHeader n={6} label="Review Your Hauling Request" />
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-4" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700"><CargoIcon type="other" size={18} /></span>
        <div><p className="text-sm font-bold" style={{ color: B.text }}>Review before submitting</p><p className="mt-0.5 text-xs" style={{ color: "#475569" }}>Your request ID will be created when it is saved.</p></div>
      </div>
      <div>
        {rows.map(([k, v], i) => (
          <div key={k} className="grid grid-cols-[minmax(100px,0.75fr)_minmax(0,1.25fr)] items-start gap-3 py-3" style={{ borderTop: i ? `1px solid ${B.border}` : "none" }}>
            <span className="text-xs font-medium" style={{ color: "#64748B" }}>{k}</span>
            <span className="text-sm font-semibold text-right break-words" style={{ color: B.text }}>{v}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onEdit} className="w-full min-h-11 mt-4 py-2.5 rounded-xl text-sm font-bold active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", color: "#334155" }}>Edit Request Details</button>
    </div>
  );
}

// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Props {
  onClose: () => void;
  initialCategory?: CargoCategoryId;
  status: MatchStatus;
  matchIdx?: number;
  onStatus: (s: MatchStatus) => void;
  onSubmitted: () => void;
  onCreate?: (key: string, data: HaulingRequest) => Promise<unknown>;
}

export default function BookingBuilder({ onClose, initialCategory = "construction", status, matchIdx = 0, onStatus, onSubmitted, onCreate }: Props) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState<CargoCategoryId>(initialCategory);
  const [weight, setWeight] = useState("");
  const [handling, setHandling] = useState<string[]>([]);
  const [truckType, setTruckType] = useState("No Preference");
  const [loading, setLoading] = useState("Loading assistance needed");
  const [unloading, setUnloading] = useState("Receiver will unload");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [helpers, setHelpers] = useState(false);
  const [flexible, setFlexible] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [f, setF] = useState<FormVals>({ pickup: "", pickupLandmark: "", pickupCity: "", pickupProvince: "", pickupContact: "", pickupPhone: "", pickupInstructions: "", delivery: "", deliveryLandmark: "", deliveryCity: "", deliveryProvince: "", receiver: "", receiverPhone: "", deliveryInstructions: "", cargo: "", qty: "", dimensions: "", notes: "", budget: "", pickupDate: "", pickupTime: "", deliveryDate: "", deliveryTime: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [validationAttempt, setValidationAttempt] = useState(0);
  const formBody = useRef<HTMLDivElement>(null);
  const submissionKey = useRef(crypto.randomUUID());
  useEffect(() => {
    if (!validationAttempt) return;
    const frame = requestAnimationFrame(() => {
      const invalid = formBody.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (!invalid) return;
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [step, validationAttempt]);
  const set = (k: keyof FormVals, v: string) => { setF((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };
  const setW = (v: string) => { setWeight(v); setErrors((p) => ({ ...p, weight: undefined })); };

  const getErrors = (st: number): Errors => {
    const e: Errors = {};
    if (st === 1) {
      if (!f.pickup.trim()) e.pickup = "Pickup location is required.";
      if (!f.delivery.trim()) e.delivery = "Delivery destination is required.";
      for (const [key, label] of [["pickupCity", "Pickup city"], ["pickupProvince", "Pickup province"], ["pickupContact", "Pickup contact"], ["pickupPhone", "Pickup phone"], ["deliveryCity", "Delivery city"], ["deliveryProvince", "Delivery province"], ["receiver", "Receiver name"], ["receiverPhone", "Receiver phone"]] as const) if (!f[key].trim()) e[key] = `${label} is required.`;
      const validPhone = (value: string) => /^(?:\+?63|0)9\d{9}$/.test(value.replace(/[\s()-]/g, ""));
      if (f.pickupPhone.trim() && !validPhone(f.pickupPhone)) e.pickupPhone = "Enter a valid Philippine mobile number.";
      if (f.receiverPhone.trim() && !validPhone(f.receiverPhone)) e.receiverPhone = "Enter a valid Philippine mobile number.";
    }
    if (st === 2) {
      if (!f.cargo.trim()) e.cargo = "Cargo description is required.";
      if (!f.qty.trim()) e.qty = "Quantity is required.";
      if (!weight) e.weight = "Cargo weight is required.";
    }
    if (st === 4) {
      const pickup = new Date(`${f.pickupDate}T${f.pickupTime}`);
      if (!f.pickupDate) e.pickupDate = "Choose a pickup date.";
      if (!f.pickupTime) e.pickupTime = "Choose a pickup time.";
      if (f.pickupDate && f.pickupTime && pickup <= new Date()) e.pickupTime = "Choose a future pickup time.";
      if (f.deliveryDate && !f.deliveryTime) e.deliveryTime = "Add a delivery time or clear the delivery date.";
      if (!f.deliveryDate && f.deliveryTime) e.deliveryDate = "Add a delivery date or clear the delivery time.";
      if (f.deliveryDate && f.deliveryTime && new Date(`${f.deliveryDate}T${f.deliveryTime}`) < pickup) e.deliveryDate = "Delivery must be after pickup.";
      if (f.budget && (!Number.isFinite(Number(f.budget)) || Number(f.budget) <= 0)) e.budget = "Enter a positive budget.";
    }
    return e;
  };
  const validate = (st: number): boolean => {
    const stepErrors = getErrors(st);
    setErrors(stepErrors);
    setSubmitError("");
    if (Object.keys(stepErrors).length) setValidationAttempt(attempt => attempt + 1);
    return Object.keys(stepErrors).length === 0;
  };
  const next = () => { if (validate(step)) setStep(step + 1); };
  const goBack = (to: number) => { setErrors({}); setSubmitError(""); setStep(to); };

  if (submitted) {
    return <RequestStatusScreen matchIdx={matchIdx} status={status} onStatus={onStatus} justSubmitted onDone={onClose} doneLabel="Back to Home" />;
  }

  const categoryLabel = CATEGORIES.find((c) => c.id === category)!.label;
  const last = step === 5;

  const submit = async () => {
    const routeErrors = getErrors(1);
    const cargoErrors = getErrors(2);
    const scheduleErrors = getErrors(4);
    const allErrors = { ...routeErrors, ...cargoErrors, ...scheduleErrors };
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      setSubmitError("");
      setStep(Object.keys(routeErrors).length ? 1 : Object.keys(cargoErrors).length ? 2 : 4);
      setValidationAttempt(attempt => attempt + 1);
      return;
    }
    setSubmitting(true); setSubmitError("");
    try {
      if (!onCreate) throw Error("Request saving is unavailable. Please sign in again.");
      const photos = photo ? [await uploadPhoto(photo)] : [];
      const toLocation = (prefix: "pickup" | "delivery"): HaulingRequest["pickup"] => prefix === "pickup" ? { address: f.pickup, landmark: f.pickupLandmark, city: f.pickupCity, province: f.pickupProvince, contact: f.pickupContact, phone: f.pickupPhone, instructions: f.pickupInstructions } : { address: f.delivery, landmark: f.deliveryLandmark, city: f.deliveryCity, province: f.deliveryProvince, contact: f.receiver, phone: f.receiverPhone, instructions: f.deliveryInstructions };
      const weightKg = Number(weight.replace(/[^\d.]/g, "")) * (/ton/i.test(weight) ? 1000 : 1);
      const request: HaulingRequest = { category, pickup: toLocation("pickup"), delivery: toLocation("delivery"), cargo: f.cargo, quantity: f.qty, weightKg, truckType, scheduledAt: new Date(`${f.pickupDate}T${f.pickupTime}`).toISOString(), deliveryAt: f.deliveryDate && f.deliveryTime ? new Date(`${f.deliveryDate}T${f.deliveryTime}`).toISOString() : null, handling, equipment, loading, unloading, dimensions: f.dimensions, helpers, flexible, budget: f.budget ? Number(f.budget) : null, notes: f.notes, photos: photos.map(p => p.id) };
      // The backend creates the request in "review" already. Sending that same
      // status through the transition endpoint is rejected for customer roles.
      await onCreate(submissionKey.current, request); onSubmitted(); setSubmitted(true);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Could not submit the request."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="booking-screen h-full flex flex-col" style={{ background: B.bg }}>
      <FormHeader title="Request a Truck" subtitle="Provide your cargo, pickup, delivery, and schedule details." onBack={step === 0 ? onClose : () => goBack(step - 1)} />
      <ProgressBar step={step} onGo={goBack} />

      <div ref={formBody} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto w-full max-w-3xl">
        {step === 0 && <StepCategory selected={category} onSelect={setCategory} />}
        {step === 1 && <StepRoute f={f} set={set} errors={errors} />}
        {step === 2 && <StepCargo f={f} set={set} errors={errors} weight={weight} setWeight={setW} handling={handling} setHandling={setHandling} photo={photo} setPhoto={setPhoto} />}
        {step === 3 && <StepRequirements truckType={truckType} setTruckType={setTruckType} loading={loading} setLoading={setLoading} unloading={unloading} setUnloading={setUnloading} equipment={equipment} setEquipment={setEquipment} helpers={helpers} setHelpers={setHelpers} />}
        {step === 4 && <StepSchedule f={f} set={set} errors={errors} flexible={flexible} setFlexible={setFlexible} />}
        {step === 5 && <StepReview f={f} categoryLabel={categoryLabel} weight={weight} handling={handling} loading={loading} unloading={unloading} equipment={equipment} truckType={truckType} helpers={helpers} flexible={flexible} onEdit={() => goBack(0)} />}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 sm:px-6" style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0", boxShadow: "0 -4px 14px rgba(15,23,42,0.04)" }}>
        <div className="mx-auto max-w-3xl">
        {submitError && <p role="alert" className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{submitError}</p>}
        <div className="flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => goBack(step - 1)} className="min-h-12 px-5 rounded-xl text-sm font-bold active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", color: "#334155" }}>Back</button>
        )}
        <button type="button" disabled={submitting} onClick={() => { if (last) void submit(); else next(); }} className="flex-1 min-h-12 rounded-xl text-sm font-bold text-white shadow-sm active:opacity-80 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: B.blue }}>
          {submitting ? "Submitting…" : last ? "Submit Hauling Request" : step === 4 ? "Review Request" : "Continue"}
        </button>
        </div>
        </div>
      </div>
    </div>
  );
}
