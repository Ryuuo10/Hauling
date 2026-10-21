import { useEffect, useRef, useState } from "react";
import { auth, authConfig } from "@/api/auth";
import type { AuthRole, AuthUser } from "@/api/auth";

type GoogleIdentity = {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }): void;
  renderButton(container: HTMLElement, options: { type: string; theme: string; size: string; text: string; shape: string; width: number }): void;
  disableAutoSelect(): void;
};
declare global { interface Window { google?: { accounts: { id: GoogleIdentity } }; } }

let sdk: Promise<void> | undefined;
function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (!sdk) sdk = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    const timer = window.setTimeout(() => failed(), 12000);
    function failed() { window.clearTimeout(timer); script.remove(); sdk = undefined; reject(new Error("Google sign-in could not load. Check your connection and try again.")); }
    script.onload = () => { window.clearTimeout(timer); resolve(); };
    script.onerror = failed;
    document.head.appendChild(script);
  });
  return sdk;
}

export default function GoogleSignInButton({ role = "customer", intent = "signin", onSuccess }: { role?: AuthRole | "auto"; intent?: "signin" | "signup"; onSuccess: (user: AuthUser) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onSuccess);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [choice, setChoice] = useState<{ credential: string; roles: AuthRole[] } | null>(null);
  const generation = useRef(0);
  useEffect(() => { callback.current = onSuccess; }, [onSuccess]);

  useEffect(() => {
    let cancelled = false;
    generation.current++;
    let observer: ResizeObserver | undefined;
    setError(""); setReady(false); setChoice(null);
    void Promise.all([authConfig(), loadGoogle()]).then(([config]) => {
      if (cancelled || !host.current) return;
      if (!config.googleClientId) throw new Error("Google sign-in is currently unavailable.");
      const identity = window.google!.accounts.id;
      identity.initialize({ client_id: config.googleClientId, auto_select: false, callback: response => {
        if (cancelled) return;
        setBusy(true); setError("");
        setChoice(null);
        void auth.google(response.credential, role, intent).then(result => {
          if (cancelled) return;
          if (result.user) callback.current(result.user);
          else setChoice({ credential: response.credential, roles: result.roles });
        }).catch(reason => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Google sign-in failed."); }).finally(() => { if (!cancelled) setBusy(false); });
      } });
      let previousWidth = 0;
      const render = () => {
        if (!host.current || cancelled) return;
        const width = Math.min(400, Math.floor(host.current.clientWidth));
        if (!width || width === previousWidth) return;
        previousWidth = width;
        host.current.replaceChildren();
        identity.renderButton(host.current, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", width });
      };
      render();
      observer = new ResizeObserver(render);
      observer.observe(host.current);
      setReady(true);
    }).catch(reason => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Google sign-in is unavailable."); });
    return () => { cancelled = true; generation.current++; observer?.disconnect(); };
  }, [role, intent, retry]);

  const chooseRole = (selectedRole: AuthRole) => {
    if (!choice || busy) return;
    const currentGeneration = generation.current;
    setBusy(true); setError("");
    void auth.google(choice.credential, selectedRole, "signin").then(result => {
      if (generation.current !== currentGeneration) return;
      if (!result.user) throw Error("Select one of your registered account types.");
      setChoice(null); callback.current(result.user);
    }).catch(reason => { if (generation.current === currentGeneration) setError(reason instanceof Error ? reason.message : "Google sign-in failed."); }).finally(() => { if (generation.current === currentGeneration) setBusy(false); });
  };

  return (
    <div className="google-sign-in mb-5" aria-busy={busy}>
      <div ref={host} className="google-sign-in-button" inert={busy} />
      {choice && <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3">
        <p className="mb-2 text-center text-xs font-semibold text-slate-600">Choose your registered account</p>
        <div className="grid gap-2 sm:grid-cols-2">{choice.roles.map(accountRole => <button key={accountRole} type="button" disabled={busy} onClick={() => chooseRole(accountRole)} className="rounded-lg border border-blue-200 px-3 py-2.5 text-xs font-bold text-blue-700 disabled:opacity-50">{accountRole === "rider" ? "Truck Operator / Driver" : accountRole === "fleet" ? "Trucking Business / Fleet" : "Business Customer"}</button>)}</div>
      </div>}
      {!ready && !error && <p className="text-center text-xs py-3 text-slate-500" role="status">Loading Google sign-in…</p>}
      {busy && <p className="text-center text-xs mt-2 text-slate-500" role="status">Signing in…</p>}
      {error && <div className="text-center text-xs mt-2"><p role="alert" className="text-red-600">{error}</p>{!ready && <button type="button" onClick={() => setRetry(value => value + 1)} className="text-blue-700 font-semibold">Try again</button>}</div>}
    </div>
  );
}
