import { useState } from "react";
import { bookingsApi } from "@/api/bookings";
import { casesForBookings } from "@/data/bookingCases";
import { displayDate, useBookings } from "@/features/customer/BookingContext";
import { A, BackHeader } from "@/features/admin/AdminPortal";

function Status({ status }: { status: string }) {
  return <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${status === "Resolved" ? "bg-green-50 text-green-700" : status === "More Information Requested" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{status}</span>;
}

export default function AdminCases({ onBack, onBooking, onPayment }: { onBack: () => void; onBooking: () => void; onPayment: () => void }) {
  const { bookings, select, run, busy } = useBookings();
  const [filter, setFilter] = useState<"All" | "Open" | "Resolved">("All");
  const [opened, setOpened] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const cases = casesForBookings(bookings);
  const active = cases.find(item => item.key === opened);
  const booking = active && bookings.find(item => item.id === active.bookingId);
  const openCount = cases.filter(item => item.status !== "Resolved").length;
  const show = (key: string) => { setOpened(key); setNote(""); setError(""); };
  const resolve = async () => {
    if (!active || !booking || active.status === "Resolved" || busy) return;
    if (!note.trim()) { setError("Enter a resolution note before closing this case."); return; }
    setError("");
    const saved = await run(async () => {
      if (active.kind === "cargo") await bookingsApi.resolve(booking, note.trim());
      else if (booking.dispatch.payIssue?.id === active.id) await bookingsApi.patch(booking, { payIssue: { ...booking.dispatch.payIssue, status: "Resolved", resolution: note.trim() } });
      else throw Error("This case changed. Refresh and review the latest details.");
    });
    if (saved) setNote("");
    else setError("The case was not closed. Review the error and retry with the latest booking details.");
  };

  if (opened) return <div className="flex h-full min-h-0 flex-col" style={{ background: A.bg }}>
    <BackHeader title="Case Details" subtitle={active ? `${active.id} · ${active.kind === "cargo" ? "Cargo issue" : "Payment issue"}` : "Case unavailable"} onBack={() => setOpened(null)} />
    {!active || !booking ? <div className="p-6 text-center text-xs text-slate-500">This case is no longer available. Return to Cases to refresh the list.</div> : <>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-extrabold">{active.id} · {active.type}</h2><Status status={active.status} /></div>
          <p className="text-xs text-slate-600">Booking: {active.reference}</p>
          <p className="text-xs text-slate-600">{active.customer} · {active.operator}</p>
          <p className="text-[10px] text-slate-500">Reported by {active.reportedBy} · {displayDate(active.createdAt)}</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="mb-2 text-xs font-bold">Reported issue</h3><p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700">{active.description}</p></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="mb-2 text-xs font-bold">Booking details</h3><p className="text-xs text-slate-700">{booking.request.cargo}</p><p className="mt-1 text-xs text-slate-500">{booking.request.pickup.city} → {booking.request.delivery.city}</p><p className="mt-1 text-xs text-slate-500">Pickup: {displayDate(booking.request.scheduledAt)}</p><button onClick={() => { select(booking.id); onBooking(); }} className="mt-3 min-h-11 w-full rounded-xl border border-blue-200 text-xs font-bold text-blue-700">View Booking & Evidence</button>{active.kind === "payment" && <button onClick={() => { select(booking.id); onPayment(); }} className="mt-2 min-h-11 w-full rounded-xl border border-blue-200 text-xs font-bold text-blue-700">View Payment Record</button>}</section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="mb-2 text-xs font-bold">Case evidence</h3>{!active.photos.length && !active.attachmentIds.length ? <p className="text-xs text-slate-500">No evidence attached to this report.</p> : <div className="flex flex-wrap gap-2">{active.photos.filter(photo => photo.attachmentId).map(photo => <a key={photo.attachmentId} href={`/api/attachments/${photo.attachmentId}`} target="_blank" rel="noreferrer"><img src={`/api/attachments/${photo.attachmentId}`} alt={photo.label} className="h-20 w-20 rounded-xl border object-cover" /></a>)}{active.attachmentIds.map((id, index) => <a key={id} href={`/api/attachments/${id}`} target="_blank" rel="noreferrer" className="block text-xs text-blue-700 underline">View evidence {index + 1}</a>)}</div>}</section>
        {active.kind === "cargo" && <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="mb-2 text-xs font-bold">Operator response</h3><p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{active.response?.text || "No response submitted yet."}</p>{active.response?.photos.filter(photo => photo.attachmentId).map(photo => <a key={photo.attachmentId} href={`/api/attachments/${photo.attachmentId}`} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-blue-700 underline">{photo.label}</a>)}</section>}
        {!!active.adminNotes.length && <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="mb-2 text-xs font-bold">Admin notes</h3>{active.adminNotes.map((text, index) => <p key={index} className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{text}</p>)}</section>}
        {active.status === "Resolved" ? <section className="rounded-2xl border border-green-200 bg-green-50 p-4"><h3 className="mb-2 text-xs font-bold text-green-800">Resolution</h3><p className="whitespace-pre-wrap text-xs text-green-900">{active.resolution || "No resolution note recorded for this older case."}</p>{active.resolvedAt && <p className="mt-2 text-[10px] text-green-700">Resolved: {displayDate(active.resolvedAt)}</p>}</section> : <section className="rounded-2xl border border-slate-200 bg-white p-4"><label htmlFor="case-resolution" className="mb-2 block text-xs font-bold">Resolution note <span className="text-red-600">*</span></label><textarea id="case-resolution" value={note} onChange={event => { setNote(event.target.value); setError(""); }} maxLength={2000} rows={3} placeholder="Describe what was checked and how the issue was resolved." className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /><p className="mt-2 text-[10px] leading-relaxed text-slate-500">Resolving a case clears its completion block. Payment verification is handled separately.</p></section>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3"><button disabled={busy || active.status === "Resolved"} onClick={resolve} className="min-h-12 w-full rounded-xl bg-green-600 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">{active.status === "Resolved" ? "Resolved" : busy ? "Saving…" : "Mark Case Resolved"}</button></div>
    </>}
  </div>;

  const shown = cases.filter(item => filter === "All" || (filter === "Open" ? item.status !== "Resolved" : item.status === "Resolved"));
  return <div className="flex h-full min-h-0 flex-col" style={{ background: A.bg }}>
    <BackHeader title="Cases" subtitle={`${openCount} open · saved cargo & payment issues`} onBack={onBack} />
    <div className="flex shrink-0 gap-2 px-3 py-3" aria-label="Filter cases">{(["All", "Open", "Resolved"] as const).map(value => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 rounded-full border px-4 text-xs font-bold ${filter === value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{value} ({value === "All" ? cases.length : value === "Open" ? openCount : cases.length - openCount})</button>)}</div>
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
      {!shown.length && <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center"><h2 className="text-sm font-bold">{cases.length ? `No ${filter.toLowerCase()} cases` : "No cases reported"}</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">{cases.length ? "Check the other filters for saved cases." : "Cargo and payment issues will appear here when a customer or driver submits a report."}</p></div>}
      {shown.map(item => <article key={item.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-4"><div className="flex items-start justify-between gap-2"><h2 className="min-w-0 break-words text-xs font-extrabold">{item.id} · {item.type}</h2><Status status={item.status} /></div><p className="mt-1 text-[10px] text-slate-500">Booking: {item.reference} · {displayDate(item.createdAt)}</p><p className="mt-1 text-[10px] text-slate-500">{item.customer} · {item.operator}</p><p className="mt-2 text-[10px] font-semibold text-slate-600">{item.kind === "cargo" ? "Cargo issue" : "Payment issue"}</p></div><div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-3 py-3"><button onClick={() => show(item.key)} className="min-h-11 rounded-xl bg-blue-600 text-[10px] font-bold text-white">View Case</button><button disabled={item.status === "Resolved"} onClick={() => show(item.key)} className="min-h-11 rounded-xl bg-green-600 text-[10px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">{item.status === "Resolved" ? "Resolved" : "Mark Resolved"}</button></div></article>)}
    </div>
  </div>;
}
