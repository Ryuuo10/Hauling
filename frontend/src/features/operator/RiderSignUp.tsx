import { useState } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { auth } from "@/api/auth";
import { bookingsApi } from "@/api/bookings";
import type { AuthUser } from "@/api/auth";

// ── Design tokens (light KadaGo palette) ──────────────────────────────────────
const RS = {
  bg: "#F8FAFF",
  card: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  inputBg: "#FFFFFF",
  orange: "#F47B20",
  blue: "#1D55D6",
  green: "#16A34A",
  red: "#DC2626",
  yellow: "#EAB308",
  muted: "#64748b",
  mutedFg: "#94a3b8",
};

type AccountType = "individual" | "business";

interface FormData {
  accountType: AccountType;
  fullName: string; businessName: string; businessType: string;
  phone: string; password: string; confirmPassword: string;
  email: string; address: string; emergencyContact: string; emergencyContactPhone: string;

}

const TRUCK_BUSINESS_TYPES = ["Trucking / Hauling Company", "Logistics / Forwarding", "Cooperative / Association", "Sole Proprietor Trucking", "Other"];

const RS_CHEV = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23F47B20\' stroke-width=\'3\' stroke-linecap=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 12px center';

const INIT: FormData = {
  accountType: "individual",
  fullName: "",
  businessName: "",
  businessType: "Trucking / Hauling Company",
  phone: "",
  password: "",
  confirmPassword: "",
  email: "",
  address: "",
  emergencyContact: "",
  emergencyContactPhone: "",

};

interface RiderSignUpProps {
  onBack: () => void;
  onGoToLogin: (accountType: AccountType) => void;
  onOpenTerms: () => void;
  onAuthenticated: (user: AuthUser) => void;
  onContinueVerification: (user: AuthUser) => void;
}

// ── Shared sub-components ──────────────────────────────────────────────────────
function FormInput({ label, value, onChange, placeholder, type = "text", required = true, readOnly = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold mb-1" style={{ color: RS.muted }}>{label}{required && <span style={{ color: RS.orange }}> *</span>}</label>
      <input type={type} value={value} readOnly={readOnly} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-[12px] rounded-xl outline-none placeholder-gray-400"
        style={{ background: RS.inputBg, border: `1px solid rgba(0,0,0,0.12)`, padding: "10px 12px", color: "#374151" }} />
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-bold mb-1" style={{ color: RS.muted }}>{label}<span style={{ color: RS.orange }}> *</span></label>
      <div className="flex items-center rounded-xl" style={{ background: RS.inputBg, border: `1px solid rgba(0,0,0,0.12)` }}>
        <div className="px-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RS.mutedFg} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] outline-none placeholder-gray-400" style={{ padding: "10px 0", color: "#374151" }} />
        <button onClick={() => setShow(!show)} className="px-3 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RS.mutedFg} strokeWidth="2" strokeLinecap="round">
            {show ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
          </svg>
        </button>
      </div>
    </div>
  );
}

function PhoneInput({ label, value, onChange, placeholder, required = true }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold mb-1" style={{ color: RS.muted }}>{label}{required && <span style={{ color: RS.orange }}> *</span>}</label>
      <div className="flex items-center rounded-xl overflow-hidden" style={{ background: RS.inputBg, border: `1px solid rgba(0,0,0,0.12)` }}>
        <span className="text-[12px] font-bold flex-shrink-0" style={{ color: "#374151", borderRight: `1px solid rgba(0,0,0,0.08)`, padding: "10px 10px" }}>+63</span>
        <input type="tel" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-[12px] outline-none placeholder-gray-400" style={{ padding: "10px 10px", color: "#374151" }} />
      </div>
    </div>
  );
}

function SignUpScreen({ form, setForm, onBack, onNext, onOpenTerms, googleUser, onGoogleAuthenticated }: {
  form: FormData; setForm: (f: FormData) => void; onBack: () => void; onNext: (user: AuthUser) => void; onOpenTerms: () => void; googleUser: AuthUser | null; onGoogleAuthenticated: (user: AuthUser) => void;
}) {
  const [termsChecked, setTermsChecked] = useState(false);
  const isBiz = form.accountType === "business";
  const passwordsMatch = form.password === form.confirmPassword;
  const baseOk = form.fullName.trim() && form.email.trim() && form.phone.trim() && form.address.trim() && (googleUser || form.password.length >= 8 && passwordsMatch);
  const canProceed = !!baseOk && (!isBiz || !!form.businessName.trim()) && termsChecked;
  const [submitting, setSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const createAccount = async () => {
    if (!canProceed || submitting) return;
    setSubmitting(true); setRegistrationError("");
    try {
      if (googleUser) {
        const digits = form.phone.replace(/\D/g, "");
        const contactPhone = digits.startsWith("0") ? `+63${digits.slice(1)}` : digits.startsWith("63") ? `+${digits}` : `+63${digits}`;
        const { profile } = await bookingsApi.profile();
        await bookingsApi.saveProfile({ ...profile, businessName: isBiz ? form.businessName : form.fullName, businessType: isBiz ? form.businessType : "Individual Truck Operator", contactName: form.fullName, contactPhone, address: form.address, emergencyContact: form.emergencyContact, emergencyPhone: form.emergencyContactPhone });
        onNext(googleUser);
      } else {
        await auth.register({ email: form.email, password: form.password, name: form.fullName, role: isBiz ? "fleet" : "rider", phone: form.phone, businessName: form.businessName, businessType: form.businessType, address: form.address, emergencyContact: form.emergencyContact, emergencyPhone: form.emergencyContactPhone });
        const { user } = await auth.login(form.email, form.password, isBiz ? "fleet" : "rider");
        onNext(user);
      }
    } catch (error) { setRegistrationError(error instanceof Error ? error.message : "Account creation failed. Please try again."); }
    finally { setSubmitting(false); }
  };
  const accountTypes: { id: AccountType; label: string }[] = [
    { id: "individual", label: "Individual Truck Operator" },
    { id: "business", label: "Trucking Business" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: RS.bg }}>
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${RS.border}` }}>
        <button onClick={onBack} className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: RS.muted }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <img src={kadaGoLogo} alt="KadaGo" style={{ width: "34px" }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div>
          <div className="flex items-start gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: RS.orange }}/>
            <h1 className="text-[19px] font-black leading-tight" style={{ color: "#0D1828" }}>Sign Up as Truck Operator / Trucking Business</h1>
          </div>
          <p className="text-[11px] pl-4" style={{ color: RS.mutedFg }}>Register your details. Truck and identity verification come next.</p>
        </div>

        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(244,123,32,0.07)", border: "1px solid rgba(244,123,32,0.22)" }}>
          <span className="text-sm flex-shrink-0">💡</span>
          <div>
            <p className="text-[10px] font-black" style={{ color: RS.orange }}>Operator &amp; Fleet Registration</p>
            <p className="text-[10px] leading-relaxed" style={{ color: RS.muted }}>Enter your own contact and business details to create your account.</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: RS.muted }}>Account Type<span style={{ color: RS.orange }}> *</span></p>
          <div className="flex rounded-xl p-1" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${RS.border}` }}>
            {accountTypes.map(t => {
              const on = form.accountType === t.id;
              return (
                <button key={t.id} onClick={() => setForm({ ...form, accountType: t.id })}
                  className="flex-1 py-2.5 rounded-lg text-[11px] font-bold leading-tight px-1 transition-all"
                  style={{ background: on ? RS.orange : "transparent", color: on ? "white" : RS.muted }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {googleUser ? (
          <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-xs text-green-800">
            <p className="font-bold">Google account connected</p>
            <p className="mt-1 break-all">{googleUser.email}</p>
            <p className="mt-1">Your name and email are filled in. Complete your contact details and accept the terms to continue to verification.</p>
          </div>
        ) : <GoogleSignInButton role={isBiz ? "fleet" : "rider"} intent="signup" onSuccess={onGoogleAuthenticated} />}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: RS.border }}/>
          <span className="text-[9px] font-bold tracking-widest" style={{ color: "#94a3b8" }}>OR WITH CREDENTIALS</span>
          <div className="flex-1 h-px" style={{ background: RS.border }}/>
        </div>

        <div className="registration-fields space-y-3">
        {isBiz && (
          <>
            <FormInput label="Business Name" value={form.businessName} onChange={v => setForm({ ...form, businessName: v })} placeholder="Dela Cruz Trucking Services" />
            <div>
              <label className="block text-[10px] font-bold mb-1" style={{ color: RS.muted }}>Business Type<span style={{ color: RS.orange }}> *</span></label>
              <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })}
                className="w-full text-[12px] rounded-xl outline-none"
                style={{ border: `1px solid rgba(0,0,0,0.12)`, padding: "10px 32px 10px 12px", appearance: "none", background: `${RS_CHEV}, ${RS.inputBg}`, color: "#374151" }}>
                {TRUCK_BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}
        <FormInput label={isBiz ? "Owner / Authorized Representative" : "Full Name"} value={form.fullName} onChange={v => setForm({ ...form, fullName: v })} placeholder="Juan Dela Cruz" />
        <FormInput label="Email Address" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="operator@kadago.demo" type="email" readOnly={!!googleUser} />
        <PhoneInput label="Mobile Number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="918 444 8821" />
        <FormInput label={isBiz ? "Business Address" : "Home Address"} value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="Malaybalay City, Bukidnon" />
        {!googleUser && <>
        <PasswordInput label="Password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Create password (min. 8 characters)" />
        <PasswordInput label="Confirm Password" value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} placeholder="Confirm password" />
        {!passwordsMatch && <p className="text-[10px] px-1" style={{ color: RS.red }}>Passwords do not match.</p>}
        </>}

        <div className="grid grid-cols-2 gap-2">
          <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={v => setForm({ ...form, emergencyContact: v })} placeholder="Full Name" required={false} />
          <PhoneInput label="Emergency Number" value={form.emergencyContactPhone} onChange={v => setForm({ ...form, emergencyContactPhone: v })} placeholder="917 222 3344" required={false} />
        </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(244,123,32,0.06)", border: "1px solid rgba(244,123,32,0.18)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RS.orange} strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <span className="text-[11px] font-bold" style={{ color: RS.orange }}>Account Type: Truck Operator / Trucking Business</span>
        </div>

        <button onClick={() => setTermsChecked(!termsChecked)} className="w-full flex items-start gap-2.5 p-3 rounded-xl text-left transition-opacity active:opacity-70"
          style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${termsChecked ? "rgba(22,163,74,0.25)" : RS.border}` }}>
          <div className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5"
            style={{ background: termsChecked ? RS.green : "rgba(0,0,0,0.05)", border: termsChecked ? "none" : `1px solid ${RS.border}` }}>
            {termsChecked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span className="text-[11px] mt-0.5" style={{ color: RS.muted }}>
            I agree to the{" "}
            <span className="underline font-semibold" style={{ color: "#16A34A" }} onClick={e => { e.stopPropagation(); onOpenTerms(); }}>
              Terms, Operating Policies, Safety Rules, and Hauling Guidelines
            </span>.
          </span>
        </button>

        <div style={{ height: "4px" }} />
      </div>

      <div className="flex-shrink-0 px-4 py-3" style={{ background: "#FFFFFF", borderTop: `1px solid ${RS.border}` }}>
        {registrationError && <p role="alert" className="text-xs text-red-600 mb-3">{registrationError}</p>}
        <button onClick={() => { void createAccount(); }} disabled={!canProceed || submitting}
          className="w-full py-4 rounded-2xl font-black text-[13px] text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: RS.orange, opacity: canProceed ? 1 : 0.4, cursor: canProceed ? "pointer" : "not-allowed" }}>
          {submitting ? "Creating account…" : "Proceed to Truck & Identity Verification"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Screen 2: Step 1 — Truck & Documents ──────────────────────────────────────
export default function RiderSignUp({ onBack, onOpenTerms, onAuthenticated, onContinueVerification }: RiderSignUpProps) {
  const [form, setForm] = useState<FormData>(INIT);
  const [googleUser, setGoogleUser] = useState<AuthUser | null>(null);
  const handleGoogleAuthenticated = (user: AuthUser) => {
    setGoogleUser(user);
    setForm(previous => ({ ...previous, accountType: user.role === "fleet" ? "business" : "individual", fullName: user.name, email: user.email, password: "", confirmPassword: "" }));
    onAuthenticated(user);
  };
  const updateForm = (next: FormData) => {
    if (googleUser && next.accountType !== form.accountType) setGoogleUser(null);
    setForm(next);
  };
  return <SignUpScreen form={form} setForm={updateForm} onBack={onBack} onNext={onContinueVerification} onOpenTerms={onOpenTerms} googleUser={googleUser} onGoogleAuthenticated={handleGoogleAuthenticated} />;
}
