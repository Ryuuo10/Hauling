import { useEffect, useRef, useState } from "react";

type IconName = "alert" | "services" | "phone" | "location" | "accident" | "shield" | "arrow" | "check" | "close";

function SafetyIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    alert: <><path d="M7 17v-6a5 5 0 0 1 10 0v6M5 17h14v4H5zM12 2V1M4 5 2 3m18 2 2-2M1 11h2m18 0h2" /><path d="M12 9v4" /></>,
    services: <><path d="M14 6H3v12h2m4 0h6m4 0h2v-7l-4-5h-3v12" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M6 10h5m-2.5-2.5v5M15 8v4h6" /></>,
    phone: <path d="m8 3 2 5-3 2a15 15 0 0 0 7 7l2-3 5 2v3a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2h3Z" />,
    location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    accident: <><path d="m5 8 2-5h10l2 5M4 8h16v10H4zM7 18v3m10-3v3M7 12h.01M17 12h.01M1 4l2 2m18-2-2 2M10 8l2 3-2 3 3 2" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="M12 8v5m0 3h.01" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const tools: { icon: IconName; title: string; description: string; demo?: boolean }[] = [
  { icon: "services", title: "Emergency services", description: "Emergency assistance options", demo: true },
  { icon: "phone", title: "Emergency contact", description: "Your registered contact", demo: true },
  { icon: "location", title: "Share location", description: "Location sharing preview", demo: true },
  { icon: "accident", title: "Report an accident", description: "Alert Dispatch about a road incident" },
  { icon: "shield", title: "Report unsafe behavior", description: "Raise a safety concern with Dispatch" },
];

export default function DriverSOS({ onClose, onSend }: { onClose: () => void; onSend: () => void | Promise<boolean> }) {
  const [view, setView] = useState<"options" | "confirm" | "sent">("options");
  const [selectedTool, setSelectedTool] = useState("Alert KadaGo Admin");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentAt, setSentAt] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sendingRef.current) { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const focusable = [...(dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled), a[href], input:not(:disabled)") || [])].filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);

  const confirm = (tool: string) => { setSelectedTool(tool); setError(""); setView("confirm"); };
  const send = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true; setSending(true); setError("");
    try {
      if (await onSend() === false) { setError("Your alert could not be sent. Check your connection and active booking, then try again."); return; }
      setSentAt(new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }));
      setView("sent");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your alert could not be sent. Please try again."); }
    finally { sendingRef.current = false; setSending(false); }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm sm:p-5">
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="driver-sos-title" tabIndex={-1} className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-[#F7F8FA] text-slate-900 shadow-2xl outline-none sm:max-h-[800px] sm:rounded-3xl">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600"><SafetyIcon name="shield" className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">Driver safety</p>
            <h1 id="driver-sos-title" className="mt-0.5 text-lg font-extrabold tracking-tight">SOS Emergency</h1>
          </div>
          <button type="button" onClick={onClose} disabled={sending} aria-label="Close SOS emergency" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-40"><SafetyIcon name="close" /></button>
        </header>

        {view === "options" ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 p-5 text-white shadow-[0_8px_24px_rgba(185,28,28,0.16)]">
              <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full border-[24px] border-white/[0.06]" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em]"><SafetyIcon name="alert" className="h-5 w-5" />KadaGo Dispatch</div>
                <h2 className="text-[21px] font-extrabold tracking-tight">Help starts with an alert.</h2>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-red-100">Notify your operations team about an emergency during your hauling trip.</p>
                <button type="button" onClick={() => confirm("Alert KadaGo Admin")} className="mt-5 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-[13px] font-bold text-red-700 shadow-sm transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.99]">Alert KadaGo Admin<SafetyIcon name="arrow" /></button>
              </div>
            </section>

            <div className="mb-3 mt-6 flex items-center justify-between px-1"><h2 className="text-xs font-bold text-slate-900">Emergency tools</h2><span className="text-[10px] font-medium text-slate-500">Review before sending</span></div>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_6px_rgba(15,23,42,0.025)]">
              {tools.map(tool => (
                <button type="button" key={tool.title} onClick={() => confirm(tool.title)} className="group flex min-h-[74px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red-600 active:bg-slate-100">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600"><SafetyIcon name={tool.icon} /></span>
                  <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-xs font-semibold text-slate-900">{tool.title}</span>{tool.demo && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-500">Demo</span>}</span><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{tool.description}</span></span>
                  <SafetyIcon name="arrow" className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-3 text-slate-500"><SafetyIcon name="shield" className="mt-0.5 h-4 w-4 shrink-0" /><p className="text-[10px] leading-relaxed">These tools currently send an SOS alert to KadaGo Dispatch. Calls and location sharing are not started from this panel.</p></div>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center" aria-live="polite">
              <div className={`mb-6 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[10px] ${view === "sent" ? "border-emerald-50 bg-emerald-100 text-emerald-600" : "border-red-50 bg-red-100 text-red-600"}`}><SafetyIcon name={view === "sent" ? "check" : "alert"} className="h-10 w-10" /></div>
              <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${view === "sent" ? "text-emerald-700" : "text-red-600"}`}>{view === "sent" ? "Sent to KadaGo Dispatch" : "Confirm emergency alert"}</p>
              <h2 className="text-2xl font-extrabold tracking-tight">{view === "sent" ? "Your SOS alert is sent." : "Send an SOS alert?"}</h2>
              <p className="mt-3 max-w-xs text-xs leading-6 text-slate-500">{view === "sent" ? "Your alert has been saved with this booking and shared with KadaGo Admin / Dispatch." : "Your alert will be saved with your booking and shared with KadaGo Admin / Dispatch for review."}</p>
              <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{view === "sent" ? "Alert sent at" : "Selected action"}</p><p className="mt-1 text-xs font-semibold text-slate-800">{view === "sent" ? sentAt : selectedTool}</p></div>
              {view === "confirm" && <p className="mt-4 max-w-xs text-[10px] leading-relaxed text-slate-500">This sends a Dispatch alert. It does not place a phone call or start location sharing.</p>}
              {error && <p role="alert" className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-xs leading-relaxed text-red-700">{error}</p>}
            </div>
            <footer className="shrink-0 space-y-2 border-t border-slate-200/70 bg-white px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
              {view === "confirm" ? <><button type="button" disabled={sending} onClick={send} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60">{sending ? <><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sending alert…</> : <><SafetyIcon name="alert" className="h-4 w-4" />Send SOS alert</>}</button><button type="button" disabled={sending} onClick={() => { setError(""); setView("options"); }} className="min-h-12 w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-40">Go back</button></> : <button type="button" onClick={onClose} className="min-h-12 w-full rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-bold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Return to driver portal</button>}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
