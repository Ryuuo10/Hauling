import { useEffect, useState, CSSProperties } from "react";

import React from "react";

import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

import { QuotationTab, QuotationFlow } from "@/features/customer/CustomerQuotation";

import type { Dispatch } from "@/data/dispatchData";

import { isCompleted, peso, payTotals, QUOTE } from "@/data/dispatchData";

import { CustomerPayment, CompletedCard, CustomerTransactions } from "@/features/hauling/Payments";

import { CustomerTrack, CustomerHaulingCard } from "@/features/hauling/TripView";

import { MatchStatus, REQUEST, STATUS_LABEL, RequestStepper, RequestStatusScreen } from "@/features/customer/HaulingStatus";

import { CATEGORIES, CargoIcon, CargoCategoryId } from "@/features/customer/BookingBuilder";

import { useBookingData, useBookings } from "@/features/customer/BookingContext";

import type { Booking, UserNotification } from "@/api/bookings";



// â”€â”€â”€ Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const D = {

  bg: "#F8FAFF",

  card: "#FFFFFF",

  cardJob: "#EEF2FF",

  cardJobBorder: "rgba(29,85,214,0.2)",

  orange: "#1D55D6",

  orangeLight: "#3B6FE8",

  blue: "#1D55D6",

  green: "#16A34A",

  red: "#DC2626",

  yellow: "#EAB308",

  border: "rgba(0,0,0,0.08)",

  borderMd: "rgba(0,0,0,0.12)",

  muted: "#64748b",

  mutedFg: "#94a3b8",

  inputBg: "#FFFFFF",

};



type DashTab = "home" | "requests" | "quotation" | "tracking" | "account";

type Overlay = null | "notifications" | "profile" | "sos";



interface Props {

  onLogout: () => void;

  onBooking: (category?: CargoCategoryId) => void;

  matchStatus: MatchStatus;

  matchIdx?: number;

  onMatchStatus: (s: MatchStatus) => void;

  initialView?: "home" | "status";

  dispatch: Dispatch;

  onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>;

}



// â”€â”€â”€ Placeholder Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function PlaceholderScreen({ title, onBack }: { title: string; onBack: () => void }) {
  return <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}><BackHeader title={title} onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 py-5"><div className="rounded-2xl p-4 mb-4" style={{ background: D.cardJob, border: `1px solid ${D.cardJobBorder}` }}><p className="text-sm font-bold" style={{ color: "#0D1828" }}>Customer service terms</p><p className="mt-2 text-xs leading-relaxed" style={{ color: D.muted }}>The customer terms and safety policies are presented during sign-in. They cover request accuracy, quotation and booking confirmation, payment records, safe hauling, and emergency reporting.</p></div><div className="rounded-2xl p-4" style={{ background: "#F8FAFC", border: `1px solid ${D.border}` }}><p className="text-xs font-bold" style={{ color: "#0D1828" }}>Need the current full policy copy?</p><p className="mt-1 text-xs leading-relaxed" style={{ color: D.muted }}>Contact KadaGo Support and include your account email for assistance.</p><a href="mailto:support@kadago.ph?subject=KadaGo%20Customer%20Terms" className="mt-3 inline-flex min-h-10 items-center rounded-xl px-4 text-xs font-bold text-white" style={{ background: D.blue }}>Email Support</a></div></div></div>;
}

function DashHeader({ onBell, onAvatar, onSOS, bellActive, avatarActive, unread, name, location }: {

  onBell: () => void; onAvatar: () => void; onSOS: () => void; bellActive: boolean; avatarActive: boolean; unread: number; name: string; location: string;

}) {

  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "KC";

  return (

    <div className="flex-shrink-0" style={{ background: "#FFFFFF", borderBottom: `1px solid ${D.border}` }}>

      {/* Main row */}

      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2">

        {/* Logo + portal */}

        <div className="flex items-center gap-2 min-w-0">

          <img src={kadaGoLogo} alt="KadaGo" className="w-9 sm:w-12 shrink-0" />

          <div className="min-w-0">

            <div className="flex items-center gap-1.5">

              <span className="text-[13px] font-black leading-tight" style={{ color: "#0D1828" }}>Business Portal</span>

              <div className="w-2 h-2 rounded-full" style={{ background: D.green, boxShadow: "0 0 6px #16A34A" }}/>

            </div>

            <span className="text-[9px] font-medium" style={{ color: D.mutedFg }}>KADAGO Heavy Hauling</span>

          </div>

        </div>



        <div className="flex-1"/>



        {/* SOS */}

        <button onClick={onSOS} className="px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 transition-opacity active:opacity-70" style={{ background: D.red }}>

          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

          <span className="text-[10px] font-black text-white tracking-wider">SOS</span>

        </button>



        {/* Bell */}

        <button onClick={onBell} aria-label="Notifications" className="relative p-1.5 rounded-xl flex-shrink-0 transition-opacity active:opacity-70" style={{ background: bellActive ? "rgba(29,85,214,0.1)" : "rgba(0,0,0,0.04)", border: `1px solid ${bellActive ? "rgba(29,85,214,0.3)" : D.border}` }}>

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>

          {unread > 0 && (

            <div className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full flex items-center justify-center" style={{ background: D.red }}>

              <span className="text-[9px] font-black text-white">{unread}</span>

            </div>

          )}

        </button>



        {/* Avatar */}

        <button onClick={onAvatar} aria-label="Account menu" className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl flex-shrink-0 transition-opacity active:opacity-70" style={{ background: avatarActive ? "rgba(29,85,214,0.08)" : "rgba(0,0,0,0.04)", border: `1px solid ${avatarActive ? "rgba(29,85,214,0.25)" : D.border}` }}>

          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ background: "linear-gradient(135deg, #1D55D6, #F47B20)" }}>{initials}</div>

          <div className="hidden sm:block text-left">

            <p className="text-[10px] font-semibold leading-tight" style={{ color: "#0D1828" }}>{name}</p>

            <p className="text-[8px]" style={{ color: D.mutedFg }}>Business</p>

          </div>

          <svg className="hidden sm:block" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={D.mutedFg} strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>

        </button>

      </div>



      {/* Location bar */}

      <div className="flex items-center gap-1.5 px-3 pb-2">

        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={D.orange} strokeWidth="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg>

        <span className="text-[10px] font-semibold" style={{ color: "#0D1828" }}>{location || "Business location not set"}</span>

        <span className="text-[10px]" style={{ color: D.mutedFg }}>â€¢ Bukidnon â€¢ PH</span>

      </div>

    </div>

  );

}



// â”€â”€â”€ SOS Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



const sosOptions = ["Road accident", "Medical emergency", "Unsafe situation", "Vehicle breakdown", "Cargo safety issue", "Other emergency"];



function SOSOverlay({ onClose, onSend, booking }: { onClose: () => void; onSend: (reason: string) => Promise<boolean>; booking: Booking | null }) {

  const [sosStep, setSosStep] = useState<"menu" | "confirm" | "sent">(booking?.dispatch.customerSOS ? "sent" : "menu");

  const [selectedOption, setSelectedOption] = useState<string>("");

  const [sending, setSending] = useState(false);

  const [sendError, setSendError] = useState("");

  const canAlert = booking?.dispatch.status === "booked" && !booking.completed && !booking.dispatch.cancelled;



  const handleOptionTap = (opt: string) => {

    setSelectedOption(opt);

    setSosStep("confirm");

  };



  const handleSend = async () => {

    setSending(true);

    setSendError("");

    try {

      const saved = await onSend(selectedOption);

      if (!saved) throw Error("The alert could not be saved. Please try again.");

      setSosStep("sent");

    } catch (error) { setSendError(error instanceof Error ? error.message : "The alert could not be saved. Please try again."); }

    finally { setSending(false); }

  };



  const overlayBg: CSSProperties = {

    position: "absolute",

    inset: 0,

    background: "rgba(13,24,40,0.58)",

    zIndex: 60,

  };



  const sheetStyle: CSSProperties = {

    position: "absolute",

    bottom: 0,

    left: 0,

    right: 0,

    background: "#FFFFFF",

    borderRadius: "24px 24px 0 0",

    maxHeight: "85%",

    overflowY: "auto",

    zIndex: 61,

    boxShadow: "0 -12px 40px rgba(15,23,42,0.18)",

  };



  if (sosStep === "menu") {

    return (

      <div style={overlayBg}>

        <div style={sheetStyle}>

          {/* Header */}

          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${D.border}` }}>

            <div className="flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: D.red }}>

                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4m0 3h.01"/></svg>

              </span>

              <div>

                <p className="text-sm font-black tracking-tight" style={{ color: "#0D1828" }}>SOS Emergency</p>

                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>KadaGo safety alert</p>

              </div>

            </div>

            <button onClick={onClose} aria-label="Close SOS" className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100 active:opacity-60" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

            </button>

          </div>



          <div className="px-5 py-4">

            {canAlert ? (

              <>

                <div className="mb-4 flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>

                  <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={D.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5m0 3h.01"/></svg>

                  <p className="text-[13px] leading-relaxed" style={{ color: "#7F1D1D" }}><strong>This alerts KadaGo Dispatch about {booking?.bookingId || booking?.requestId}.</strong> It does not call emergency services or share live GPS.</p>

                </div>

                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">Choose the main reason</h3>

                <div className="space-y-2.5">

                  {sosOptions.map((opt) => (

                    <button key={opt} onClick={() => handleOptionTap(opt)} className="w-full min-h-14 flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-50">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#FEF2F2", color: D.red }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4m0 3h.01"/></svg></span>

                      <span className="flex-1 text-sm font-semibold text-slate-800">{opt}</span>

                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>

                    </button>

                  ))}

                </div>

              </>

            ) : (

              <>

                <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">

                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg></span>

                  <p className="text-sm font-bold text-slate-900">No active booking to attach an SOS alert to</p>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-700">KadaGo Dispatch alerts are available once a hauling request is confirmed and active.</p>

                  <button onClick={onClose} className="mt-4 min-h-11 rounded-xl px-5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ background: D.blue }}>Close</button>

                </div>

                <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">For immediate danger, contact local emergency services directly. This screen does not place emergency calls.</p>

              </>

            )}

          </div>

        </div>

      </div>

    );

  }



  if (sosStep === "confirm") {

    return (

      <div style={overlayBg}>

        <div style={sheetStyle}>

          {/* Header */}

          <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${D.border}` }}>

            <button onClick={() => setSosStep("menu")} className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-60" style={{ background: "rgba(0,0,0,0.06)" }}>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>

            </button>

            <h3 className="text-[16px] font-black" style={{ color: "#0D1828" }}>Send Emergency Alert?</h3>

          </div>



          <div className="px-4 py-5 space-y-4">

            {/* Selected option */}

            <div className="px-4 py-4 rounded-xl" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)" }}>

              <p className="text-[14px] font-bold" style={{ color: D.red }}>{selectedOption}</p>

            </div>



            {/* Warning */}

            <p className="text-[13px] leading-relaxed" style={{ color: D.muted }}>

              Your SOS reason and active booking details will be saved for KadaGo Dispatch. This does not call emergency services or transmit your live location.

            </p>

            {sendError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{sendError}</p>}



            {/* Buttons */}

            <div className="flex gap-3 pt-2">

              <button

                onClick={() => setSosStep("menu")}

                className="flex-1 py-3.5 rounded-xl font-bold text-[14px] transition-opacity active:opacity-70"

                style={{ background: "transparent", border: `1.5px solid ${D.border}`, color: "#374151" }}

              >

                Cancel

              </button>

              <button

                onClick={handleSend}

                disabled={sending}

                className="flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white transition-opacity active:opacity-70"

                style={{ background: D.red, opacity: sending ? 0.7 : 1 }}

              >

                {sending ? "Sending alert…" : "Send SOS to Dispatch"}

              </button>

            </div>

          </div>

        </div>

      </div>

    );

  }



  // sent state

  return (

    <div style={overlayBg}>

      <div style={sheetStyle}>

        <div className="px-4 py-6 flex flex-col items-center">

          {/* Checkmark */}

          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(220,38,38,0.1)", border: "2px solid rgba(220,38,38,0.4)" }}>

            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={D.red} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>

          </div>



          <h3 className="text-[20px] font-black mb-5" style={{ color: "#0D1828" }}>SOS Alert Sent</h3>



          {/* Info cards */}

          <div className="w-full space-y-2 mb-4">

            {[

              { label: "Booking", value: booking?.bookingId || booking?.requestId || "Unavailable" },

              { label: "Customer", value: booking?.customer || "Your account" },

              { label: "Pickup", value: booking ? `${booking.request.pickup.city}, ${booking.request.pickup.province}` : "Unavailable" },

              { label: "Time", value: new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) },

              { label: "Alert", value: selectedOption || booking?.dispatch.customerSOSReason || "SOS alert" },

            ].map((row) => (

              <div key={row.label} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${D.border}` }}>

                <span className="text-[11px] font-semibold" style={{ color: D.muted }}>{row.label}</span>

                <span className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{row.value}</span>

              </div>

            ))}

          </div>



          {/* Success text */}

          <p className="text-[13px] font-semibold mb-5" style={{ color: D.green }}>Your alert was saved and sent to KadaGo Dispatch.</p>



          {/* Buttons */}

          <div className="w-full space-y-2">

            <p className="text-center text-xs leading-relaxed text-slate-600">For immediate danger, contact local emergency services directly. KadaGo has not placed a call.</p>

            <button

              onClick={onClose}

              className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-opacity active:opacity-70"

              style={{ background: "transparent", border: `1.5px solid ${D.blue}`, color: D.blue }}

            >

              Back to Dashboard

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}



// â”€â”€â”€ Service Hub Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function ServiceHubCard({ onPostRequest, onServiceClick, name }: { onPostRequest: () => void; onServiceClick: (id: CargoCategoryId) => void; name: string }) {

  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (

    <div className="mx-3 rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

      <div className="px-4 pt-4 pb-3">

        <div className="flex items-center gap-1.5 mb-3">

          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-700"><CargoIcon type="bulky" size={15} /></span>

          <span className="text-[10px] font-black tracking-wider" style={{ color: D.orange }}>KADAGO Heavy Hauling</span>

        </div>



        <h2 className="text-2xl font-black leading-tight mb-1" style={{ color: "#0D1828" }}>Maayong adlaw,<br/>{firstName}!</h2>

        <p className="text-sm mb-4" style={{ color: D.mutedFg }}>What cargo do you need transported?</p>



        <button onClick={onPostRequest} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white mb-4 transition-opacity active:opacity-80" style={{ background: D.orange }}>

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>

          Request a Truck

        </button>



        <div className="grid grid-cols-2 gap-2">

          {CATEGORIES.map((c) => (

            <button key={c.id} onClick={() => onServiceClick(c.id)} className="flex flex-col items-start text-left p-3 rounded-xl transition-opacity active:opacity-70" style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${D.border}` }}>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.2)" }}>

          <CargoIcon type={c.icon} size={22} />

              </div>

              <span className="text-[11px] font-bold leading-tight" style={{ color: "#0D1828" }}>{c.label}</span>

              <span className="text-[9px] leading-snug mt-0.5" style={{ color: D.muted }}>{c.sub}</span>

              <span className="text-[8px] leading-snug mt-1" style={{ color: D.mutedFg }}>e.g. {c.eg}</span>

            </button>

          ))}

        </div>

      </div>

    </div>

  );

}



// â”€â”€â”€ Active Job Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function NoActiveHauling({ onRequest }: { onRequest: () => void }) {

  return (

    <div className="mx-3 rounded-2xl px-4 py-6 text-center" style={{ background: D.cardJob, border: `1px solid ${D.cardJobBorder}` }}>

      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><CargoIcon type="bulky" size={24} /></div>

      <p className="text-[14px] font-bold mb-1" style={{ color: "#0D1828" }}>No active hauling yet</p>

      <p className="text-[11px] leading-relaxed mb-3" style={{ color: D.mutedFg }}>Tracking appears here once a truck is assigned to a confirmed booking.</p>

      <button onClick={onRequest} className="px-4 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: D.blue }}>Request a Truck</button>

    </div>

  );

}



// â”€â”€â”€ Request Status Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function RequestStatusCard({ status, onView }: { status: MatchStatus; onView: () => void }) {
  const { REQUEST } = useBookingData();

  const { selected } = useBookings();

  const pickupTime = selected?.request.scheduledAt ? new Date(selected.request.scheduledAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "Schedule pending";

  return (

    <div className="mx-3 rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

      <div className="px-4 pt-4 pb-3">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2">

            <div className="w-2 h-2 rounded-full" style={{ background: D.blue, boxShadow: "0 0 6px #1D55D6" }}/>

            <span className="text-[12px] font-black" style={{ color: "#0D1828" }}>RECENT REQUEST STATUS</span>

          </div>

          <span className="text-[10px] font-semibold" style={{ color: D.blue }}>{REQUEST.id}</span>

        </div>

        <h3 className="text-[14px] font-bold leading-snug" style={{ color: "#0D1828" }}>{REQUEST.cargo}</h3>

        <p className="text-[10px] mb-0.5" style={{ color: D.muted }}>{REQUEST.category}</p>

        <p className="text-[11px] mb-3" style={{ color: D.mutedFg }}>{REQUEST.route}</p>

        <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black mb-3" style={{ background: "rgba(29,85,214,0.1)", color: D.blue, border: "1px solid rgba(29,85,214,0.2)" }}>

          {status === "suggested" ? "Suitable Truck Suggested" : status === "approved" ? "Truck & Operator Approved" : status === "confirmed" ? "Operator Confirmed" : STATUS_LABEL[status]}

        </div>

        {status === "booked" && <p className="text-[11px] font-bold mb-2" style={{ color: D.green }}>Upcoming Pickup â€” Oct 22 at 8:00 AM</p>}

        <RequestStepper status={status} compact />

      </div>

      <button onClick={onView} className="w-full flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold transition-opacity active:opacity-70" style={{ color: D.blue, borderTop: `1px solid ${D.border}` }}>

        View Request Status

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={D.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>

      </button>

    </div>

  );

}



// â”€â”€â”€ Requests Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function RequestsScreen({ status, onView, dispatch, onOpenCompleted, onRequest }: { status: MatchStatus; onView: () => void; dispatch: Dispatch; onOpenCompleted: (start?: "rate") => void; onRequest: () => void }) {
  const { REQUEST } = useBookingData();

  const { bookings, selected, select } = useBookings();

  const done = isCompleted(dispatch);

  const [tab, setTab] = useState<"Active" | "Completed" | "Cancelled">("Active");

  if (!bookings.length) return <div className="flex-1 overflow-y-auto"><div className="px-4 pt-4 pb-2"><h2 className="text-[18px] font-black" style={{ color: "#0D1828" }}>My Hauling Requests</h2></div><div className="flex gap-2 px-4 pb-3">{(["Active", "Completed", "Cancelled"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-full text-[11px] font-bold" style={{ background: tab === t ? D.blue : "rgba(0,0,0,0.05)", color: tab === t ? "#fff" : D.muted }}>{t}</button>)}</div><div className="mx-3 rounded-2xl px-4 py-8 text-center" style={{ background: D.card, border: `1px solid ${D.border}` }}><p className="text-[13px] font-bold" style={{ color: "#0D1828" }}>No {tab.toLowerCase()} requests yet</p><p className="text-[11px] mt-1" style={{ color: D.mutedFg }}>Your requests will appear here after you submit them.</p><button onClick={onRequest} className="mt-4 px-4 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: D.blue }}>Request a Truck</button></div></div>;

  return (

    <div className="flex-1 overflow-y-auto">

      <div className="px-4 pt-4 pb-2">

        <h2 className="text-[18px] font-black" style={{ color: "#0D1828" }}>My Hauling Requests</h2>

      </div>

      <div className="flex gap-2 px-4 pb-3">

        {(["Active", "Completed", "Cancelled"] as const).map((t) => (

          <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-full text-[11px] font-bold" style={{ background: tab === t ? D.blue : "rgba(0,0,0,0.05)", color: tab === t ? "#fff" : D.muted }}>{t}</button>

        ))}

      </div>

      {bookings.length > 1 && <div className="px-3 pb-3 space-y-2">{bookings.filter(b => tab === "Completed" ? b.completed : tab === "Cancelled" ? b.dispatch.cancelled : !b.completed && !b.dispatch.cancelled).map(b => {

        const selectedItem = b.id === selected?.id;

        return <button key={b.id} onClick={() => select(b.id)} className="w-full rounded-xl p-3 text-left" style={{ background: selectedItem ? "#EEF2FF" : "#fff", border: `1px solid ${selectedItem ? D.blue : D.border}` }}><span className="text-[10px] font-black text-blue-700">{b.requestId}</span><span className="float-right text-[10px] text-slate-500">{b.completed ? "Completed" : b.dispatch.cancelled ? "Cancelled" : STATUS_LABEL[b.dispatch.status]}</span><p className="mt-1 text-xs font-bold text-slate-800">{b.request.cargo}</p><p className="text-[10px] text-slate-500">{b.request.pickup.city} â†’ {b.request.delivery.city}</p></button>;

      })}</div>}

      <div className="px-3 space-y-3 pb-4">

        {tab === "Completed" && done ? (

          <CompletedCard d={dispatch} role="customer" onView={() => onOpenCompleted()} onRate={() => onOpenCompleted("rate")} />

        ) : tab === "Active" && done ? (

          <div className="rounded-2xl py-10 text-center" style={{ background: D.card, border: `1px solid ${D.border}` }}>

            <p className="text-[13px] font-bold" style={{ color: "#0D1828" }}>No active requests</p>

            <p className="text-[11px] mt-1" style={{ color: D.mutedFg }}>Completed hauling is under the Completed tab.</p>

          </div>

        ) : tab === "Active" ? (

          <div className="rounded-2xl p-4" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

            <div className="flex items-center justify-between mb-1">

              <span className="text-[11px] font-black" style={{ color: D.blue }}>{REQUEST.id}</span>

              <span className="text-[10px]" style={{ color: D.mutedFg }}>{REQUEST.date}</span>

            </div>

            <p className="text-[14px] font-bold" style={{ color: "#0D1828" }}>{REQUEST.cargo}</p>

            <p className="text-[10px]" style={{ color: D.muted }}>{REQUEST.category}</p>

            <p className="text-[11px] mb-1" style={{ color: D.mutedFg }}>{REQUEST.routeShort}</p>

            {status === "booked" && <p className="text-[11px] font-bold mb-2" style={{ color: D.green }}>Upcoming Pickup â€” Oct 22 at 8:00 AM</p>}

            <div className="flex items-center justify-between mt-2">

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black" style={{ background: "rgba(234,179,8,0.14)", color: "#A16207" }}>{status === "review" ? "Under KadaGo Review" : STATUS_LABEL[status]}</span>

              <button onClick={onView} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white active:opacity-70" style={{ background: D.blue }}>View Status</button>

            </div>

          </div>

        ) : (

          <div className="rounded-2xl py-10 text-center" style={{ background: D.card, border: `1px solid ${D.border}` }}>

            <p className="text-[13px] font-bold" style={{ color: "#0D1828" }}>No {tab.toLowerCase()} requests</p>

            <p className="text-[11px] mt-1" style={{ color: D.mutedFg }}>Your {tab.toLowerCase()} hauling requests will appear here.</p>

          </div>

        )}

      </div>

    </div>

  );

}



type AccountIconName = "profile" | "notifications" | "privacy" | "history" | "payments" | "help";

function AccountIcon({ name }: { name: AccountIconName }) {

  const p = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };

  if (name === "profile") return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>;

  if (name === "notifications") return <svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4"/></svg>;

  if (name === "privacy") return <svg {...p}><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;

  if (name === "history") return <svg {...p}><path d="M8 4h11v17H5V7zM8 4v4H5M9 12h7M9 16h7"/></svg>;

  if (name === "payments") return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>;

  return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-1 1.2-2.1 1.3-2.1 3M12 17.5v.1"/></svg>;

}



function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("") || "KG"; }



function AccountScreen({ onAction, onLogout, onTerms, user, profile }: { onAction: (a: string) => void; onLogout: () => void; onTerms: () => void; user: ReturnType<typeof useBookings>["user"]; profile: ReturnType<typeof useBookings>["profile"] }) {

  const contact = user.name;

  const info: [string, string][] = [

    ["Business Name", profile?.businessName || "Not added yet"],

    ["Business Type", profile?.businessType || "Not specified"],

    ["Contact Person", contact],

    ["Mobile", profile?.contactPhone || profile?.phone || "Not added yet"],

    ["Email", user.email],

    ["Address", profile?.address || "Not added yet"],

  ];

  return (

    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

      <div className="rounded-2xl px-4 py-5 text-center" style={{ background: D.cardJob, border: `1px solid ${D.cardJobBorder}` }}>

        <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white mx-auto mb-3" style={{ background: "linear-gradient(135deg, #1D55D6, #F47B20)" }}>{initials(contact)}</div>

        <h3 className="text-base font-black" style={{ color: "#0D1828" }}>{profile?.businessName || user.name}</h3>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)" }}>

          <div className="w-1.5 h-1.5 rounded-full" style={{ background: D.green }}/>

          <span className="text-[10px] font-bold" style={{ color: D.blue }}>{profile?.verificationStatus === "verified" ? "Verified Customer" : "Customer Portal"}</span>

        </div>

      </div>

      <div className="rounded-2xl px-4 py-2" style={{ background: D.card, border: `1px solid ${D.border}` }}>

        {info.map(([k, v], i) => (

          <div key={k} className="flex justify-between gap-3 py-2.5" style={{ borderTop: i ? `1px solid ${D.border}` : "none" }}>

            <span className="text-[10px] font-semibold" style={{ color: D.mutedFg }}>{k}</span>

            <span className="text-[11px] font-bold text-right" style={{ color: "#0D1828" }}>{v}</span>

          </div>

        ))}

      </div>

      <div className="space-y-1.5">

        {[{ icon: "profile", label: "Edit Profile" }, { icon: "notifications", label: "Notification Settings" }, { icon: "privacy", label: "Privacy & Security" }, { icon: "history", label: "Hauling History" }, { icon: "payments", label: "Transaction History" }, { icon: "help", label: "Help & Support" }].map(({ icon, label }) => (

          <button key={label} onClick={() => onAction(label)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl active:opacity-60" style={{ background: D.card, border: `1px solid ${D.border}` }}>

            <span className="text-blue-700"><AccountIcon name={icon as AccountIconName} /></span><span className="text-[13px] font-medium" style={{ color: "#374151" }}>{label}</span>

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={D.muted} strokeWidth="2.5" className="ml-auto"><path d="M9 18l6-6-6-6"/></svg>

          </button>

        ))}

      </div>

      <TermsCard onView={onTerms} />

      <button onClick={onLogout} className="w-full py-3.5 rounded-xl font-bold text-sm active:opacity-70" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: D.red }}>Log Out</button>

    </div>

  );

}



// â”€â”€â”€ Terms Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function TermsCard({ onView }: { onView: () => void }) {

  return (

    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

      <div className="px-4 pt-4 pb-3 flex-1">

        <div className="flex items-center gap-1.5 mb-2">

          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={D.orange} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>

          <span className="text-[9px] font-black tracking-wider" style={{ color: D.orange }}>TERMS &amp; STANDARDS</span>

        </div>

        <h4 className="text-[13px] font-black mb-2 leading-snug" style={{ color: "#0D1828" }}>KadaGo Safety &amp; Terms</h4>

        <p className="text-[10px] leading-relaxed mb-3" style={{ color: D.mutedFg }}>Platform policies, verified operator standards, and hauling coordination rules.</p>

      </div>

      <button onClick={onView} className="mx-3 mb-3 py-2.5 rounded-xl text-[11px] font-bold text-center transition-opacity active:opacity-70" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${D.border}`, color: "#374151" }}>

        View Terms &amp; Conditions

      </button>

    </div>

  );

}



// â”€â”€â”€ Safety Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



const safetyItems = [

  { icon: "shield", color: D.green, title: "Verified Trucks & Operators", text: "KadaGo coordinates hauling with verified operators and truck records." },

  { icon: "star", color: D.blue, title: "KadaGo-Coordinated Quotation", text: "Hauling rates are coordinated before customer approval." },

  { icon: "box", color: D.orange, title: "Cargo & Delivery Records", text: "Saved hauling requests and trip updates stay linked to your account." },

];



function TrustIcon({ name }: { name: string }) {

  const props = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };

  if (name === "shield") return <svg {...props}><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;

  if (name === "star") return <svg {...props}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>;

  return <CargoIcon type="other" size={20} />;

}



function SafetyCards() {

  return (

    <div className="mx-3 space-y-2">

      {safetyItems.map((item) => (

        <div key={item.title} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>

            <span style={{ color: item.color }}><TrustIcon name={item.icon} /></span>

          </div>

          <div>

            <p className="text-[12px] font-bold mb-0.5" style={{ color: "#0D1828" }}>{item.title}</p>

            <p className="text-[10px] leading-relaxed" style={{ color: D.mutedFg }}>{item.text}</p>

          </div>

        </div>

      ))}

    </div>

  );

}



// â”€â”€â”€ Bottom Nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



const navIcon = (a: boolean, d: React.ReactNode, fill = false) => (

  <svg width="20" height="20" viewBox="0 0 24 24" fill={fill && a ? "#1D55D6" : "none"} stroke={a ? "#1D55D6" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>

);



const tabs: { id: DashTab; label: string; icon: (active: boolean) => React.ReactElement }[] = [

  { id: "home", label: "Home", icon: (a) => navIcon(a, <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, true) },

  { id: "requests", label: "Requests", icon: (a) => navIcon(a, <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></>) },

  { id: "quotation", label: "Quotation", icon: (a) => navIcon(a, <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/></>) },

  { id: "tracking", label: "Tracking", icon: (a) => navIcon(a, <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></>) },

  { id: "account", label: "Account", icon: (a) => navIcon(a, <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></>) },

];



function BottomNav({ active, onChange }: { active: DashTab; onChange: (t: DashTab) => void }) {

  return (

    <nav aria-label="Customer navigation" className="app-navigation flex-shrink-0 px-4 pb-1 pt-2" style={{ background: "#FFFFFF", borderTop: `1px solid ${D.border}` }}>

      <div className="navigation-brand"><img src={kadaGoLogo} alt="KadaGo" /><p>Business Customer</p></div>

      <div className="navigation-items flex items-center justify-around">

        {tabs.map((t) => {

          const isActive = active === t.id;

          return (

            <button key={t.id} aria-current={isActive ? "page" : undefined} onClick={() => onChange(t.id)} className="flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl transition-all" style={{ minWidth: "56px", background: isActive ? "rgba(29,85,214,0.08)" : "transparent" }}>

              {t.icon(isActive)}

              <span className="text-[9px] font-bold" style={{ color: isActive ? D.blue : D.muted }}>{t.label}</span>

            </button>

          );

        })}

      </div>

    </nav>

  );

}



// â”€â”€â”€ Notification Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function NotificationDropdown({ onClose, items, unread, onMarkRead, onOpen }: { onClose: () => void; items: UserNotification[]; unread: number; onMarkRead: () => void; onOpen: (target?: string) => void }) {

  return (

    <>

      <div className="absolute inset-0 z-40" onClick={onClose}/>

      <div className="absolute top-0 left-0 right-0 z-50 rounded-b-3xl overflow-hidden flex flex-col" style={{ maxHeight: "82%", background: "#FFFFFF", border: `1px solid ${D.borderMd}`, borderTop: "none", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>

        <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${D.border}` }}>

          <div className="flex items-center gap-2">

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>

            <span className="text-sm font-black" style={{ color: "#0D1828" }}>Notifications</span>

            {unread > 0 && (

              <div className="min-w-5 h-5 px-1 rounded-full flex items-center justify-center" style={{ background: D.red }}>

                <span className="text-[9px] font-black text-white">{unread}</span>

              </div>

            )}

          </div>

          <button onClick={onMarkRead} disabled={!unread} className="text-xs font-semibold disabled:opacity-50" style={{ color: D.blue }}>Mark all read</button>

        </div>

        <div className="divide-y overflow-y-auto" style={{ borderColor: D.border }}>

          {items.length === 0 && <p className="px-4 py-8 text-center text-[12px]" style={{ color: D.mutedFg }}>No notifications yet.</p>}

          {items.map((n) => (

            <button key={n.id} type="button" onClick={() => onOpen(n.target)} className="w-full flex items-start gap-3 px-4 py-3.5 text-left cursor-pointer transition-opacity active:opacity-70" style={{ background: n.read ? "transparent" : "rgba(29,85,214,0.04)" }}>

              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-700" style={{ background: n.target === "sos" ? "#FEF2F2" : "#EFF6FF", border: `1px solid ${n.target === "sos" ? "#FECACA" : "#BFDBFE"}` }}>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={n.target === "sos" ? D.red : D.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>

              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-0.5">

                  <p className="text-[12px] font-bold leading-tight" style={{ color: "#0D1828" }}>{n.title}</p>

                  {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: D.blue }}/>}

                </div>

                <p className="text-[11px] leading-relaxed mb-1" style={{ color: "#475569" }}>{n.body}</p>

                <span className="text-[10px]" style={{ color: D.muted }}>{new Date(n.time).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</span>

              </div>

            </button>

          ))}

        </div>

        <button onClick={onClose} className="w-full py-3.5 text-xs font-semibold text-center flex-shrink-0" style={{ color: D.mutedFg, borderTop: `1px solid ${D.border}` }}>

          Close

        </button>

      </div>

    </>

  );

}



// â”€â”€â”€ Profile Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function ProfileDropdown({ onClose, onLogout, onProfileAction, user, profile }: { onClose: () => void; onLogout: () => void; onProfileAction: (action: string) => void; user: ReturnType<typeof useBookings>["user"]; profile: ReturnType<typeof useBookings>["profile"] }) {

  const name = user.name;

  return (

    <>

      <div className="absolute inset-0 z-40" onClick={onClose}/>

      <div className="absolute top-0 right-0 left-0 z-50 rounded-b-3xl overflow-hidden" style={{ background: "#FFFFFF", border: `1px solid ${D.borderMd}`, borderTop: "none", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>

        {/* Profile header */}

        <div className="px-5 pt-5 pb-4 text-center" style={{ borderBottom: `1px solid ${D.border}` }}>

          <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white mx-auto mb-3" style={{ background: "linear-gradient(135deg, #1D55D6, #F47B20)" }}>{initials(name)}</div>

          <h3 className="text-base font-black mb-0.5" style={{ color: "#0D1828" }}>{name}</h3>

          <p className="text-[12px] mb-1" style={{ color: D.mutedFg }}>{profile?.contactPhone || profile?.phone || user.email}</p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(29,85,214,0.08)", border: "1px solid rgba(29,85,214,0.2)" }}>

            <div className="w-1.5 h-1.5 rounded-full" style={{ background: D.green }}/>

            <span className="text-[10px] font-semibold" style={{ color: D.blue }}>Business Account · Customer Portal</span>

          </div>

        </div>



        {/* Menu items */}

        <div className="px-4 py-3 space-y-1">

          {[

            { icon: "profile", label: "Edit Profile" },

            { icon: "notifications", label: "Notification Settings" },

            { icon: "privacy", label: "Privacy & Security" },

            { icon: "history", label: "Hauling History" },

            { icon: "help", label: "Help & Support" },

          ].map((item) => (

            <button

              key={item.label}

              onClick={() => { onClose(); onProfileAction(item.label); }}

              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-opacity active:opacity-60"

              style={{ background: "rgba(0,0,0,0.03)" }}

            >

              <span className="text-blue-700"><AccountIcon name={item.icon as AccountIconName} /></span>

              <span className="text-[13px] font-medium" style={{ color: "#374151" }}>{item.label}</span>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={D.muted} strokeWidth="2.5" className="ml-auto"><path d="M9 18l6-6-6-6"/></svg>

            </button>

          ))}

        </div>



        {/* Logout */}

        <div className="px-4 pb-5">

          <button onClick={() => { onClose(); onLogout(); }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-opacity active:opacity-70" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: D.red }}>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={D.red} strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

            Log Out

          </button>

        </div>

      </div>

    </>

  );

}



// â”€â”€â”€ Back Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {

  return (

    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5" style={{ background: "#FFFFFF", borderBottom: `1px solid ${D.border}` }}>

      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-60" style={{ background: "rgba(0,0,0,0.06)" }}>

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>

      </button>

      <h2 className="text-[16px] font-black" style={{ color: "#0D1828" }}>{title}</h2>

    </div>

  );

}



// â”€â”€â”€ Edit Profile Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function EditProfileScreen({ onBack }: { onBack: () => void }) {

  const { profile, user, saveProfile } = useBookings();

  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState("");

  const [vals, setVals] = useState({ businessName: "", businessType: "", contactName: "", mobile: "", address: "" });

  useEffect(() => setVals({ businessName: profile?.businessName || user.name, businessType: profile?.businessType || "", contactName: profile?.contactName || user.name, mobile: profile?.contactPhone || profile?.phone || "", address: profile?.address || "" }), [profile?.businessName, profile?.businessType, profile?.contactName, profile?.contactPhone, profile?.phone, profile?.address, user.name]);

  const fields: { key: keyof typeof vals; label: string }[] = [

    { key: "businessName", label: "Business Name" }, { key: "businessType", label: "Business Type" }, { key: "contactName", label: "Contact Person" }, { key: "mobile", label: "Mobile" }, { key: "address", label: "Business Address" },

  ];

  const handleSave = async () => {

    setError("");

    if (!vals.businessName.trim() || !vals.contactName.trim() || !vals.address.trim()) { setError("Add your business name, contact person, and address to continue."); return; }

    if (vals.mobile.trim() && !/^(?:\+?63|0)9\d{9}$/.test(vals.mobile.replace(/[\s()-]/g, ""))) { setError("Enter a valid Philippine mobile number."); return; }

    setSaving(true);

    const ok = await saveProfile({ ...(profile || { name: user.name, email: user.email, phone: "", verificationStatus: user.verificationStatus }), businessName: vals.businessName.trim(), businessType: vals.businessType.trim(), contactName: vals.contactName.trim(), contactPhone: vals.mobile.trim(), address: vals.address.trim() });

    setSaving(false);

    if (ok) { setSaved(true); window.setTimeout(onBack, 900); } else setError("We couldn?t save your changes. Please try again.");

  };

  return <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}><BackHeader title="Edit Profile" onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

    <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: D.cardJob, border: `1px solid ${D.cardJobBorder}` }}><div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #1D55D6, #F47B20)" }}>{initials(user.name)}</div><div className="min-w-0"><p className="text-sm font-bold truncate" style={{ color: "#0D1828" }}>{user.name}</p><p className="text-xs truncate" style={{ color: D.muted }}>{user.email}</p><p className="text-[10px] mt-1" style={{ color: D.mutedFg }}>Name and email are managed by your sign-in account.</p></div></div>

    {fields.map(({ key, label }) => <div key={key}><label htmlFor={`profile-${key}`} className="text-[11px] font-semibold mb-1 block" style={{ color: D.muted }}>{label}{["businessName", "contactName", "address"].includes(key) && <span className="text-red-600"> *</span>}</label><input id={`profile-${key}`} value={vals[key]} onChange={(e) => setVals(prev => ({ ...prev, [key]: e.target.value }))} autoComplete={key === "mobile" ? "tel" : undefined} placeholder={`Enter ${label}`} className="w-full px-3 py-3 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-blue-200" style={{ background: "#F8FAFC", border: `1px solid ${D.borderMd}`, color: "#0D1828" }} /></div>)}

    {error && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}{saved && <p role="status" className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">Profile changes saved.</p>}

    <button onClick={() => void handleSave()} disabled={saving || saved} className="w-full py-3.5 rounded-xl font-bold text-[14px] text-white disabled:opacity-60" style={{ background: D.blue }}>{saving ? "Saving?" : "Save Changes"}</button>

  </div></div>;

}



function NotificationSettingsScreen({ onBack }: { onBack: () => void }) {

  const { profile, user, saveProfile } = useBookings();

  const [toggles, setToggles] = useState({ bookings: true, trips: true, payments: true });

  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState("");

  useEffect(() => setToggles({ bookings: profile?.notificationSettings?.bookings ?? true, trips: profile?.notificationSettings?.trips ?? true, payments: profile?.notificationSettings?.payments ?? true }), [profile?.notificationSettings?.bookings, profile?.notificationSettings?.trips, profile?.notificationSettings?.payments]);

  const options = [{ key: "bookings" as const, label: "Booking and quotation updates", detail: "Request reviews, quotes, and booking changes" }, { key: "trips" as const, label: "Trip and delivery updates", detail: "Pickup, in-transit, and delivery progress" }, { key: "payments" as const, label: "Payment updates", detail: "Payment records and verification status" }];

  const handleSave = async () => {

    setSaving(true); setError("");

    const ok = await saveProfile({ ...(profile || { name: user.name, email: user.email, phone: "", verificationStatus: user.verificationStatus }), businessName: profile?.businessName || user.name, contactName: profile?.contactName || user.name, address: profile?.address || "", notificationSettings: toggles });

    setSaving(false); setSaved(ok); if (!ok) setError("Settings could not be saved. Please try again.");

  };

  return <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}><BackHeader title="Notification Settings" onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 py-4"><p className="text-[12px] leading-relaxed mb-4" style={{ color: D.muted }}>Choose which KadaGo updates appear in your account.</p><div className="space-y-2 mb-5">{options.map(item => <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-4 rounded-xl" style={{ background: "#F8FAFC", border: `1px solid ${D.border}` }}><div><p className="text-[13px] font-semibold" style={{ color: "#0D1828" }}>{item.label}</p><p className="text-[10px] mt-1" style={{ color: D.muted }}>{item.detail}</p></div><button type="button" role="switch" aria-checked={toggles[item.key]} aria-label={item.label} onClick={() => { setSaved(false); setToggles(prev => ({ ...prev, [item.key]: !prev[item.key] })); }} className="w-11 h-6 rounded-full transition-all relative flex-shrink-0" style={{ background: toggles[item.key] ? D.green : "#CBD5E1" }}><span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: toggles[item.key] ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} /></button></div>)}</div><div className="rounded-xl px-4 py-3 mb-4" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}><p className="text-xs font-semibold text-amber-900">Safety alerts stay enabled</p><p className="text-[10px] mt-1 text-amber-800">Critical notices related to an active hauling request cannot be turned off.</p></div>{error && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">{error}</p>}{saved && <p role="status" className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 mb-3">Notification preferences saved.</p>}<button onClick={() => void handleSave()} disabled={saving} className="w-full py-3.5 rounded-xl font-bold text-[14px] text-white disabled:opacity-60" style={{ background: D.blue }}>{saving ? "Saving?" : "Save Settings"}</button></div></div>;

}



function PrivacySecurityScreen({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {

  const { user } = useBookings();

  return <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}><BackHeader title="Privacy & Security" onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"><div className="rounded-2xl p-4" style={{ background: D.cardJob, border: `1px solid ${D.cardJobBorder}` }}><div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: "#FFFFFF", color: D.blue }}><AccountIcon name="privacy" /></div><h3 className="text-sm font-bold" style={{ color: "#0D1828" }}>Your account is protected</h3><p className="text-xs mt-1 leading-relaxed" style={{ color: D.muted }}>Use the sign-in method associated with your account, keep those credentials private, and sign out of KadaGo on shared devices.</p></div><div className="rounded-xl px-4 py-4" style={{ background: "#F8FAFC", border: `1px solid ${D.border}` }}><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.muted }}>Account email</p><p className="text-sm font-semibold mt-1 break-all" style={{ color: "#0D1828" }}>{user.email}</p></div><button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: D.red }}>Sign out of this device</button></div></div>;

}



function BookingHistoryScreen({ onBack }: { onBack: () => void }) {

  const { bookings } = useBookings();

  const records = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}><BackHeader title="Hauling History" onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"><p className="text-[11px] font-bold tracking-wide" style={{ color: D.muted }}>SAVED REQUESTS</p>{records.length === 0 ? <div className="rounded-2xl p-6 text-center" style={{ background: "#F8FAFC", border: `1px solid ${D.border}` }}><div className="mx-auto mb-3 text-blue-700"><AccountIcon name="history" /></div><p className="text-sm font-bold text-slate-800">No hauling history yet</p><p className="mt-1 text-xs text-slate-500">Your saved hauling requests will appear here.</p></div> : records.map(b => { const status = b.completed ? "Completed" : b.dispatch.status === "booked" ? "Booked" : b.dispatch.status === "quote" ? "Quote ready" : "In review"; const route = `${b.request.pickup.city} ? ${b.request.delivery.city}`; return <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl" style={{ background: "#F8FAFC", border: `1px solid ${D.border}` }}><div className="min-w-0"><p className="text-[10px] font-black" style={{ color: D.blue }}>{b.bookingId || b.requestId} ? {new Date(b.createdAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</p><p className="text-[13px] font-semibold truncate" style={{ color: "#0D1828" }}>{b.request.cargo || "Hauling request"}</p><p className="text-[11px] truncate" style={{ color: D.muted }}>{route}</p></div><div className="text-right flex-shrink-0"><p className="text-[10px] font-semibold" style={{ color: b.completed ? D.green : D.blue }}>{status}</p></div></div>; })}</div></div>;

}



function HelpSupportScreen({ onBack }: { onBack: () => void }) {
  const { user, selected } = useBookings();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { question: "How do I request a truck?", answer: "Complete the hauling request form with your cargo, pickup and delivery details, and preferred schedule. Your request is saved to your account for KadaGo review." },
    { question: "When will I see a quotation?", answer: "KadaGo Dispatch reviews your request and adds a quotation when one is ready. Review the amount and terms before accepting." },
    { question: "Does tracking show the truck's live location?", answer: "Live GPS is not connected yet. The tracking screen shows trip progress recorded by the operator, not a real-time map location." },
    { question: "Can I pay through KadaGo?", answer: "KadaGo currently records payments made directly to the operator. It does not process or hold money." },
    { question: "What happens when I send SOS?", answer: "An SOS alert with your selected reason is saved for KadaGo Dispatch and linked to your active booking. It does not call emergency services." },
  ];
  const reference = selected?.bookingId || selected?.requestId || "No active request";
  const subject = encodeURIComponent(`KadaGo customer support - ${reference}`);
  const body = encodeURIComponent(`Hello KadaGo Support,\n\nAccount email: ${user.email}\nRequest reference: ${reference}\n\nHow can we help?\n`);
  const contact = `mailto:support@kadago.ph?subject=${subject}&body=${body}`;
  return <div className="h-full flex flex-col" style={{ background: "#FFFFFF" }}><BackHeader title="Help & Support" onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 py-4"><p className="text-xs leading-relaxed mb-4" style={{ color: D.muted }}>Answers about requests, bookings, payments, and safety.</p><div className="space-y-2">{faqs.map((item, index) => <div key={item.question} className="overflow-hidden rounded-xl" style={{ background: "#F8FAFC", border: `1px solid ${D.border}` }}><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"><span className="text-[13px] font-semibold" style={{ color: "#0D1828" }}>{item.question}</span><span className="text-lg leading-none" style={{ color: D.blue }}>{open === index ? "?" : "+"}</span></button>{open === index && <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: D.muted }}>{item.answer}</p>}</div>)}</div><div className="mt-5 rounded-2xl p-4" style={{ background: D.cardJob, border: `1px solid ${D.cardJobBorder}` }}><p className="text-sm font-bold" style={{ color: "#0D1828" }}>Need more help?</p><p className="text-xs mt-1 mb-3" style={{ color: D.muted }}>Email KadaGo Support. Your account email and request reference will be included so you can review them before sending.</p><a href={contact} className="flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-white" style={{ background: D.blue }}>Email KadaGo Support</a><p className="mt-2 text-[10px] leading-relaxed" style={{ color: D.muted }}>This opens your device's email app. If no email app is configured, contact support@kadago.ph directly.</p></div></div></div>;
}

export default function CustomerDashboard({ onLogout, onBooking, matchStatus, matchIdx = 0, onMatchStatus, initialView = "home", dispatch, onDispatch }: Props) {

  const { selected, user, profile, notifications, markNotificationsRead } = useBookings();

  const hasRequest = !!selected;

  const [showQuote, setShowQuote] = useState<null | "detail" | "agreements">(null);

  const [showTrack, setShowTrack] = useState(false);

  const [showPay, setShowPay] = useState<null | "completed" | "rate">(null);

  const done = isCompleted(dispatch);

  const [tab, setTab] = useState<DashTab>(initialView === "status" ? "requests" : "home");

  const [showStatus, setShowStatus] = useState(initialView === "status");

  const [overlay, setOverlay] = useState<Overlay>(null);

  const [placeholder, setPlaceholder] = useState<string | null>(null);

  const [profileView, setProfileView] = useState<string | null>(null);

  const notifs = notifications;

  const unread = Math.min(notifs.filter(item => !item.read).length, 9);

  const activeHauling = dispatch.status === "booked" && !done;



  const goTo = (name: string) => { setOverlay(null); setPlaceholder(name); };

  const toggleOverlay = (o: Overlay) => setOverlay((prev) => (prev === o ? null : o));

  const openNotif = (target?: string) => {

    setOverlay(null);

    const live = () => { if (dispatch.status === "booked") setShowTrack(true); else { setTab("requests"); setShowStatus(true); } };

    if (target === "quotation") { setTab("quotation"); setShowQuote("detail"); }

    else if (target === "agreement") { setTab("quotation"); setShowQuote("agreements"); }

    else if (target === "completed") { if (done) setShowPay("completed"); else live(); }

    else if (target === "rating") { if (done) setShowPay("rate"); else live(); }

    else if (target === "payment" || target === "delivery" || target === "case") { if (done) setShowPay("completed"); else live(); }

    else if (target === "sos") setOverlay("sos");

    else if (target === "track") live();

    else { setTab("requests"); }

  };



  const changeTab = (t: DashTab) => { setTab(t); setOverlay(null); };



  if (tab === "tracking" && dispatch.status === "booked" && !showTrack && !showPay && !showQuote && !showStatus && !placeholder && !profileView) {

    return (

      <div className="portal-layout h-full flex flex-col relative" style={{ background: D.bg }}>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden"><CustomerTrack dispatch={dispatch} onDispatch={onDispatch} onBack={() => setTab("home")} liveLocation={selected?.liveLocation} /></div>

        <BottomNav active="tracking" onChange={changeTab} />

      </div>

    );

  }



  if (showPay) return <CustomerPayment d={dispatch} onDispatch={onDispatch} onBack={() => setShowPay(null)} start={showPay === "rate" ? "rate" : "completed"} />;

  if (showTrack) return <CustomerTrack dispatch={dispatch} onDispatch={onDispatch} onBack={() => setShowTrack(false)} liveLocation={selected?.liveLocation} />;

  if (showQuote) {

    return <QuotationFlow dispatch={dispatch} onDispatch={onDispatch} onBack={() => setShowQuote(null)} initial={showQuote} />;

  }



  if (showStatus) {

    return <RequestStatusScreen completed={isCompleted(dispatch)} matchIdx={matchIdx} status={matchStatus} onStatus={onMatchStatus} onBack={() => setShowStatus(false)} onViewQuotation={() => setShowQuote("detail")} />;

  }



  if (placeholder) {

    return <PlaceholderScreen title={placeholder} onBack={() => setPlaceholder(null)} />;

  }



  if (profileView === "Edit Profile") {

    return <EditProfileScreen onBack={() => setProfileView(null)} />;

  }



  if (profileView === "Notification Settings") {

    return <NotificationSettingsScreen onBack={() => setProfileView(null)} />;

  }



  if (profileView === "Privacy & Security") {

    return <PrivacySecurityScreen onBack={() => setProfileView(null)} onLogout={onLogout} />;

  }



  if (profileView === "Transaction History") {

    return <CustomerTransactions d={dispatch} onBack={() => setProfileView(null)} />;

  }



  if (profileView === "Hauling History") {

    return <BookingHistoryScreen onBack={() => setProfileView(null)} />;

  }



  if (profileView === "Help & Support") {

    return <HelpSupportScreen onBack={() => setProfileView(null)} />;

  }



  return (

    <div className="portal-layout h-full flex flex-col relative" style={{ background: D.bg }}>

      <DashHeader

        onBell={() => toggleOverlay("notifications")}

        onAvatar={() => toggleOverlay("profile")}

        onSOS={() => setOverlay("sos")}

        bellActive={overlay === "notifications"}

        avatarActive={overlay === "profile"}

        unread={unread}

        name={profile?.businessName || user.name}

        location={profile?.address || ""}

      />



      {tab === "home" && (

        <div className="flex-1 overflow-y-auto">

          <div className="dashboard-grid customer-home space-y-3 pt-3 pb-4">

            <ServiceHubCard name={profile?.contactName || user.name} onPostRequest={() => onBooking()} onServiceClick={(id) => onBooking(id)} />

            {hasRequest && <RequestStatusCard status={matchStatus} onView={() => setShowStatus(true)} />}

            {done ? (

              !dispatch.rating && (

                <div className="mx-3 rounded-2xl px-4 py-3" style={{ background: D.card, border: `1.5px solid ${D.blue}` }}>

                  <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: D.blue }}>NEEDS ATTENTION</p>

                  <p className="text-[13px] font-bold" style={{ color: "#0D1828" }}>Rate Completed Booking</p>

                  <p className="text-[11px] mb-2" style={{ color: D.mutedFg }}>BK-8721 Â· Dela Cruz Trucking Services</p>

                  <button onClick={() => setShowPay("rate")} className="w-full py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: D.blue }}>Rate Operator</button>

                </div>

              )

            ) : dispatch.status === "booked" ? <div className="mx-3"><CustomerHaulingCard dispatch={dispatch} onTrack={() => setShowTrack(true)} /></div> : <NoActiveHauling onRequest={() => onBooking()} />}



            <SafetyCards />

          </div>

        </div>

      )}

      {tab === "requests" && <RequestsScreen status={matchStatus} onView={() => setShowStatus(true)} dispatch={dispatch} onOpenCompleted={(st) => setShowPay(st === "rate" ? "rate" : "completed")} onRequest={() => onBooking()} />}

      {tab === "quotation" && (hasRequest ? <QuotationTab dispatch={dispatch} onOpen={() => setShowQuote("detail")} onAgreements={() => setShowQuote("agreements")} /> : <div className="flex-1 p-4"><div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${D.border}` }}><p className="text-sm font-bold text-slate-800">No quotation yet</p><p className="mt-1 text-xs text-slate-500">KadaGo will add a quotation here after reviewing one of your requests.</p><button onClick={() => onBooking()} className="mt-4 rounded-xl px-4 py-2.5 text-xs font-bold text-white" style={{ background: D.blue }}>Request a Truck</button></div></div>)}

      {tab === "tracking" && (

        <div className="flex-1 overflow-y-auto pt-4">

          <p className="text-[11px] font-bold tracking-wide mx-4 mb-2" style={{ color: D.muted }}>TRACKING</p>

          <NoActiveHauling onRequest={() => onBooking()} />

        </div>

      )}

      {tab === "account" && <AccountScreen onAction={setProfileView} onLogout={onLogout} onTerms={() => goTo("Terms & Conditions")} user={user} profile={profile} />}



      <BottomNav

        active={tab}

        onChange={changeTab}

      />



      {/* Overlays */}

      {overlay === "notifications" && (

        <NotificationDropdown onClose={() => setOverlay(null)} items={notifs} unread={unread} onMarkRead={() => { void markNotificationsRead(); }} onOpen={openNotif} />

      )}

      {overlay === "profile" && (

        <ProfileDropdown onClose={() => setOverlay(null)} onLogout={onLogout} onProfileAction={(action) => { setProfileView(action); }} user={user} profile={profile} />

      )}

      {overlay === "sos" && (

        <SOSOverlay onClose={() => setOverlay(null)} booking={selected} onSend={async (reason) => (await onDispatch({ customerSOS: "active", customerSOSReason: reason })) !== false} />

      )}

    </div>

  );

}

