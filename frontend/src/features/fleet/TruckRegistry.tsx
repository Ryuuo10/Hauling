import { useState } from "react";
import { bookingsApi } from "@/api/bookings";
import type { Truck } from "@/api/bookings";
import { useBookings } from "@/features/customer/BookingContext";
import OperatorHeader from "@/features/operator/OperatorHeader";

export default function TruckRegistry({ onBack }: { onBack?: () => void }) {
  const { user, trucks, run, refresh } = useBookings();
  const [form, setForm] = useState({ driver: user.name, truck: "", bodyType: "", plate: "", payloadKg: "", areas: "", equipment: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const canRegister = user.role === "fleet" || user.role === "rider";
  const input = (key: keyof typeof form, label: string, type = "text") => <label className="block text-xs font-semibold text-slate-600">{label}<input type={type} value={form[key]} onChange={e => setForm(previous => ({ ...previous, [key]: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>;
  const submit = async () => {
    setSaving(true); setError("");
    try {
      const ok = await run(() => bookingsApi.addTruck({ ...form, payloadKg: Number(form.payloadKg), areas: form.areas.split(",").map(x => x.trim()).filter(Boolean), equipment: form.equipment.split(",").map(x => x.trim()).filter(Boolean) }));
      if (ok) { setForm({ driver: user.name, truck: "", bodyType: "", plate: "", payloadKg: "", areas: "", equipment: "" }); await refresh(); }
      else setError("Check the form and try again.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not register truck."); }
    finally { setSaving(false); }
  };
  const verify = async (truck: Truck) => { const ok = await run(() => bookingsApi.updateTruck(truck.id, { verified: true })); if (ok) await refresh(); };
  return <div className="flex h-full min-h-0 flex-col bg-slate-50">{onBack && <OperatorHeader title={canRegister ? "Fleet vehicles" : "Truck Verification"} subtitle={canRegister ? "Register and manage your trucks" : "Review registered vehicles before assignment"} onBack={onBack} />}<div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"><div className="mx-auto max-w-3xl space-y-5"><div>{!onBack && <h1 className="text-xl font-black text-slate-900">{canRegister ? "Truck fleet" : "Truck verification"}</h1>}<p className="mt-1 text-sm text-slate-600">Registered vehicles are matched by verified capacity, route coverage, availability, and equipment.</p></div>
    {canRegister && <section className="space-y-3 rounded-2xl border bg-white p-4"><h2 className="font-bold text-slate-900">Register a truck</h2><div className="grid gap-3 sm:grid-cols-2">{input("driver", "Driver name")}{input("truck", "Truck make / model")}{input("bodyType", "Truck body type")}{input("plate", "Plate number")}{input("payloadKg", "Verified payload (kg)", "number")}{input("areas", "Service cities / provinces (comma separated)")}{input("equipment", "Available equipment (comma separated)")}</div><p className="text-xs text-slate-500">Dispatch must verify a new truck before it can be assigned.</p>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={saving} onClick={() => void submit()} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Register truck"}</button></section>}
    <section className="space-y-3">{trucks.length ? trucks.map(truck => <article key={truck.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><p className="font-bold text-slate-900">{truck.truck} · {truck.plate}</p><p className="text-xs text-slate-600">{truck.business} · {truck.driver}</p><p className="mt-1 text-xs text-slate-500">{truck.bodyType} · {truck.payloadKg.toLocaleString()} kg · {truck.areas.join(", ")}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${truck.verified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{truck.verified ? "Verified" : "Pending verification"}</span>{user.role === "admin" && !truck.verified && <button onClick={() => void verify(truck)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white">Verify</button>}</div></article>) : <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No trucks have been registered yet.</div>}</section>
  </div></div></div>;
}
