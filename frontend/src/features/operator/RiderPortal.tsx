import DriverSOS from "@/features/operator/DriverSOS";
import { bookingsApi } from "@/api/bookings";
import { useEffect, useRef, useState } from "react";
import OperatorHeader from "@/features/operator/OperatorHeader";
import type { Dispatch } from "@/data/dispatchData";
import { AgreementScreen, AgreementsList } from "@/features/hauling/AgreementView";
import { displayDate, useBookingData, useBookings } from "@/features/customer/BookingContext";
import { agreementNotifs, TRIP_STATUS, TRIP_ORDER, isCompleted, AFTER_CONFIRM, REQ, MATCHES, AGREEMENT, payTotals, peso, monthlyPayments } from "@/data/dispatchData";
import { EarningsBookings, NewRatingCard, OperatorTransaction } from "@/features/hauling/Payments";
import { OperatorTrip } from "@/features/hauling/TripView";
import { HomeAssignmentCard, AssignmentsInbox, AssignmentDetail, RateCoordination } from "@/features/operator/OperatorAssignments";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

// ── Tokens ────────────────────────────────────────────────────────────────────
const R = {
  bg: "#F8FAFF", card: "#FFFFFF", cardOrange: "#FFF7ED", cardOrangeBorder: "rgba(244,123,32,0.2)",
  orange: "#F47B20", blue: "#1D55D6", green: "#16A34A", red: "#DC2626",
  yellow: "#EAB308", border: "rgba(0,0,0,0.08)", borderMd: "rgba(0,0,0,0.12)",
  muted: "#64748b", mutedFg: "#94a3b8", inputBg: "#FFFFFF",
  shadow: "0 1px 4px rgba(0,0,0,0.06)",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type RPage =
  | "home" | "earnings" | "profile" | "documents" | "reviews"
  | "assignments" | "bookings" | "notifications" | "privacy" | "help" | "assignment-detail" | "rate-coordination" | "agreement" | "agreements" | "trip" | "txn";
type RTab = "home" | "assignments" | "bookings" | "earnings" | "account";

const TAB_OF: Record<RPage, RTab> = {
  home: "home", notifications: "home",
  assignments: "assignments", "assignment-detail": "assignments", "rate-coordination": "assignments",
  bookings: "bookings", trip: "bookings", agreement: "bookings", agreements: "bookings",
  earnings: "earnings", txn: "earnings",
  profile: "account", documents: "account", reviews: "account", privacy: "account", help: "account",
};

// ── Static data ───────────────────────────────────────────────────────────────
function useOperatorSummary() {
  const { bookings, user, profile, declinedAssignments } = useBookings();
  const completed = bookings.filter(b => b.completed);
  const rated = completed.filter(b => b.dispatch.rating);
  const rating = rated.length ? rated.reduce((sum, b) => sum + b.dispatch.rating!.stars, 0) / rated.length : 0;
  const responses = bookings.flatMap(b => b.events.filter(e => e.actor === user.id && e.label === "Operator Confirmed Assignment"));
  const declined = declinedAssignments;
  const acceptance = responses.length + declined.length ? `${Math.round(responses.length / (responses.length + declined.length) * 100)}%` : "Not yet";
  const now = new Date();
  const monthly = bookings.filter(b => { const dt = new Date(b.completedAt || b.dispatch.pay?.date || b.createdAt); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear(); });
  const paid = monthlyPayments(bookings, now);
  const name = profile?.name || user.name;
  return { bookings, completed, rated, rating, acceptance, paid, monthlyCompleted: monthly.filter(b => b.completed).length,
    rider: { approved: user.verificationStatus === "approved", address: profile?.address || "Not provided", emergency: [profile?.emergencyContact, profile?.emergencyPhone].filter(Boolean).join(" / ") || "Not provided", name, initials: name.split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase(), phone: profile?.phone || "Not provided", email: user.email, rating: rating ? rating.toFixed(1) : "Not yet", jobs: completed.length, acceptance } };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function RiderAvatar({ size = 40 }: { size?: number }) {
  const { rider: RIDER } = useOperatorSummary();
  return (
    <div className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${R.orange}, #C85A00)`, fontSize: size * 0.3 }}>
      {RIDER.initials}
    </div>
  );
}

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-px">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? R.yellow : "rgba(0,0,0,0.1)"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function RBottomNav({ active, onChange }: { active: RTab; onChange: (t: RTab) => void }) {
  const tabs: { id: RTab; label: string; icon: (a: boolean) => React.ReactNode }[] = [
    { id: "home", label: "Home",
      icon: a => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? R.orange : R.muted} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: "assignments", label: "Assignments",
      icon: a => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? R.orange : R.muted} strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
    { id: "bookings", label: "Bookings",
      icon: a => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? R.orange : R.muted} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></svg> },
    { id: "earnings", label: "Earnings",
      icon: a => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? R.orange : R.muted} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    { id: "account", label: "Account",
      icon: a => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? R.orange : R.muted} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <nav aria-label="Operator navigation" className="app-navigation operator-navigation flex-shrink-0 px-3 pb-1 pt-2" style={{ background: "#FFFFFF", borderTop: `1px solid ${R.border}` }}>
      <div className="navigation-brand"><img src={kadaGoLogo} alt="KadaGo" /><p>Truck Operator</p></div>
      <div className="navigation-items flex items-center justify-around">
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button key={t.id} aria-current={isActive ? "page" : undefined} onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl transition-all"
              style={{ minWidth: 0, background: isActive ? "rgba(244,123,32,0.1)" : "transparent" }}>
              {t.icon(isActive)}
              <span className="whitespace-nowrap text-[9px] font-bold" style={{ color: isActive ? R.orange : R.muted }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Simulated GPS map ─────────────────────────────────────────────────────────


// ── SOS overlay ───────────────────────────────────────────────────────────────


// ══════════════════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════════════════

// ── Home Dashboard ────────────────────────────────────────────────────────────


function HomeScreen({ online, setOnline, onGoTo, onSOS, onNotif, unread, activeVehicle, dispatch }: {
  dispatch: Dispatch;
  online: boolean; setOnline: (v: boolean) => void;
  onGoTo: (p: RPage) => void;
  onSOS: () => void; onNotif: () => void; unread: number; activeVehicle: string;
}) {
  const summary = useOperatorSummary();
  const { REQ, AGREEMENT } = useBookingData();
  const done = isCompleted(dispatch);
  const booked = dispatch.status === "booked";
  const upcoming = booked && dispatch.tripStage === "upcoming";
  const showCard = dispatch.matchIdx === 0 && ["confirmed", "quote", "accepted", "declined", "booked"].includes(dispatch.status) && !done;
  const cardLabel = booked ? (upcoming ? "UPCOMING PICKUP" : "ACTIVE HAULING") : "CURRENT ASSIGNMENT";
  const stats = [
    { label: "THIS MONTH PAID", value: peso(summary.paid), sub: `${summary.monthlyCompleted} completed bookings`, color: R.green },
    { label: "COMPLETED", value: String(summary.completed.length), sub: "Hauling jobs done", color: R.orange },
    { label: "RATING", value: summary.rider.rating, sub: `${summary.rated.length} reviews`, color: R.yellow },
    { label: "ACCEPTANCE", value: summary.acceptance, sub: "Assignments accepted", color: R.blue },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Portal header */}
      <div className="px-4 pt-3 pb-3" style={{ background: "#FFFFFF", borderBottom: `1px solid ${R.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <img src={kadaGoLogo} alt="KadaGo" style={{ width: "38px" }} />
          <div className="flex-1">
            <p className="text-[9px] font-black tracking-wider" style={{ color: R.orange }}>🚛 TRUCK OPERATOR PORTAL</p>
            <p className="text-[11px] font-semibold" style={{ color: "#374151" }}>Assignments & Hauling Operations</p>
          </div>
          <button onClick={onNotif} aria-label="Notifications" className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${R.border}` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={R.mutedFg} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {unread > 0 && <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: R.red }}>{unread}</div>}
          </button>
          <button onClick={onSOS} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-white" style={{ background: R.red }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            SOS
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${R.border}`, width: "fit-content" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={R.mutedFg} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          <span className="text-[10px] font-semibold" style={{ color: "#374151" }}>Malaybalay, Bukidnon · Demo GPS — Simulated Location</span>
        </div>
      </div>

      <div className="dashboard-grid operator-home px-3 pt-3 space-y-3">
        {/* Operator availability card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: R.cardOrange, border: `1px solid ${R.cardOrangeBorder}`, boxShadow: R.shadow }}>
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3 mb-3">
              <RiderAvatar size={52} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-[14px] font-black" style={{ color: "#0D1828" }}>Maayong adlaw, {summary.rider.name.split(" ")[0]}!</p>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(244,123,32,0.2)", color: R.orange, border: `1px solid rgba(244,123,32,0.4)` }}>{summary.rider.approved ? "VERIFIED OPERATOR" : "PENDING ADMIN APPROVAL"}</span>
                </div>
                <p className="text-[10px]" style={{ color: R.mutedFg }}>Assigned truck: {activeVehicle}</p>
              </div>
            </div>

            <button onClick={() => setOnline(!online)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-2 transition-all"
              style={{ background: online ? "rgba(22,163,74,0.1)" : "rgba(100,116,139,0.08)", border: `1.5px solid ${online ? "rgba(22,163,74,0.35)" : "rgba(100,116,139,0.2)"}` }}>
              <div className="text-left">
                <p className="text-[13px] font-black" style={{ color: online ? R.green : R.muted }}>
                  {online ? "● Available for Assignments" : "○ Unavailable for Assignments"}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: online ? "#15803d" : R.mutedFg }}>
                  {online ? "KadaGo Dispatch can assign hauling jobs to you." : "KadaGo will not send you new assignments."}
                </p>
              </div>
              <div className="w-12 h-6 rounded-full flex-shrink-0 flex items-center transition-all" style={{ background: online ? R.green : "rgba(100,116,139,0.3)", padding: "2px" }}>
                <div className="w-5 h-5 rounded-full bg-white transition-all" style={{ transform: online ? "translateX(24px)" : "translateX(0)" }}/>
              </div>
            </button>

          </div>
        </div>

        {/* Earnings summary + performance */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onGoTo("earnings")} className="col-span-2 px-4 py-3 rounded-2xl text-left" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
            <p className="text-[8px] font-black tracking-wider mb-1" style={{ color: R.mutedFg }}>EARNINGS · THIS MONTH (PAID)</p>
            <p className="text-[22px] font-black" style={{ color: R.green }}>{peso(summary.paid)}</p>
            <p className="text-[9px]" style={{ color: R.muted }}>Hauling rates from paid bookings · tap for details</p>
          </button>
          {stats.map(s => (
            <div key={s.label} className="px-3 py-3 rounded-2xl" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
              <p className="text-[8px] font-black tracking-wider mb-1" style={{ color: R.mutedFg }}>{s.label}</p>
              <p className="text-[18px] font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: R.muted }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Current assignment / upcoming pickup / active hauling */}
        {showCard && (
          <div className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
            <div className="px-4 py-2.5 flex items-center justify-between gap-2" style={{ background: "rgba(244,123,32,0.06)", borderBottom: `1px solid rgba(244,123,32,0.15)` }}>
              <div>
                <p className="text-[9px] font-black tracking-wider" style={{ color: R.orange }}>{dispatch.status === "booked" && dispatch.tripStage !== "upcoming" ? "ACTIVE HAULING" : "CURRENT ASSIGNMENT"}</p>
                <p className="text-[13px] font-black" style={{ color: "#0D1828" }}>Request {REQ.id}</p>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.12)", color: "#15803d", border: "1px solid rgba(22,163,74,0.25)" }}>
                {dispatch.status === "booked" ? (dispatch.tripStage === "upcoming" ? "BOOKING CONFIRMED" : TRIP_STATUS[dispatch.tripStage].toUpperCase()) : dispatch.status === "accepted" ? "QUOTATION ACCEPTED" : dispatch.status === "declined" ? "QUOTATION DECLINED" : "OPERATOR CONFIRMED"}
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { label: "Customer", val: REQ.customer },
                { label: "Cargo", val: REQ.cargo },
                { label: "Weight", val: REQ.weight },
                { label: "Route", val: REQ.route },
                ...(dispatch.status !== "booked" || dispatch.tripStage === "upcoming" ? [{ label: "Upcoming Pickup", val: REQ.schedule }] : []),
                { label: "Assigned Truck", val: activeVehicle },
                { label: "Status", val: dispatch.status === "booked" ? (dispatch.tripStage === "upcoming" ? "Booking Confirmed · Upcoming Pickup" : TRIP_STATUS[dispatch.tripStage]) : dispatch.status === "accepted" ? (dispatch.agreement === "operator" ? "Booking Agreement Ready" : "Waiting for Booking Agreement") : dispatch.status === "declined" ? "Quotation Declined by Customer" : "Operator Confirmed" },
              ].map(x => (
                <div key={x.label} className="flex items-start gap-2">
                  <span className="text-[9px] flex-shrink-0 pt-0.5" style={{ color: R.mutedFg, minWidth: "78px" }}>{x.label}</span>
                  <span className="text-[11px] font-semibold leading-snug" style={{ color: "#374151" }}>{x.val}</span>
                </div>
              ))}
              {(dispatch.status === "accepted" || booked) ? (
                <>
                  {booked && (
                    <button onClick={() => onGoTo("trip")}
                      className="w-full py-3.5 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
                      style={{ background: `linear-gradient(135deg, ${R.orange}, #C85A00)` }}>
                      {upcoming ? "Start Trip to Pickup" : dispatch.tripStage === "delivered" ? "View Delivery" : "View Active Trip"}
                    </button>
                  )}
                  <button onClick={() => onGoTo("agreement")}
                    className="w-full py-3 rounded-xl font-bold text-[12px] transition-opacity active:opacity-80"
                    style={booked ? { background: "#fff", color: R.orange, border: `1.5px solid ${R.orange}` } : { background: `linear-gradient(135deg, ${R.orange}, #C85A00)`, color: "#fff" }}>
                    {booked ? "View Booking Agreement" : "Review Agreement"}
                  </button>
                  <button onClick={() => onGoTo("agreements")} className="w-full py-2.5 rounded-xl text-[11px] font-bold" style={{ background: "#fff", color: R.orange, border: `1.5px solid ${R.orange}` }}>Booking Agreements</button>
                </>
              ) : (
                <button onClick={() => onGoTo(dispatch.status === "declined" ? "assignments" : "rate-coordination")}
                  className="w-full py-3.5 rounded-2xl font-black text-[13px] text-white transition-opacity active:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${R.orange}, #C85A00)` }}>
                  {dispatch.status === "declined" ? "View Assignments" : "View Rate Coordination"}
                </button>
              )}
            </div>
          </div>
        )}

        {done ? (
          <>
            <div className="rounded-2xl px-4 py-3" style={{ background: R.card, border: "1.5px solid rgba(22,163,74,0.35)", boxShadow: R.shadow }}>
              <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: R.green }}>COMPLETED BOOKING</p>
              <p className="text-[13px] font-bold" style={{ color: "#0D1828" }}>{AGREEMENT.booking} · {REQ.customer}</p>
              <p className="text-[11px] mb-2" style={{ color: R.mutedFg }}>Payment received. Earnings updated.</p>
              <div className="flex gap-2">
                <button onClick={() => onGoTo("earnings")} className="flex-1 py-2.5 rounded-xl text-[12px] font-black text-white" style={{ background: R.orange }}>View Earnings</button>
                <button onClick={() => onGoTo("trip")} className="flex-1 py-2.5 rounded-xl text-[12px] font-black" style={{ background: "#fff", color: R.orange, border: `1.5px solid ${R.orange}` }}>View Booking</button>
              </div>
            </div>
            <NewRatingCard d={dispatch} />
          </>
        ) : <HomeAssignmentCard dispatch={dispatch} onOpen={() => onGoTo("assignments")} />}

        <div className="dashboard-spacer" style={{ height: "6px" }}/>
      </div>
    </div>
  );
}

// ── Job Details ───────────────────────────────────────────────────────────────


// ── Send Offer ────────────────────────────────────────────────────────────────


// ── Offer Submitted ───────────────────────────────────────────────────────────


// ── Active Job (Rider side) ───────────────────────────────────────────────────


// ── Proof of Delivery ─────────────────────────────────────────────────────────


// ── Job Completed ─────────────────────────────────────────────────────────────


// ── Earnings ──────────────────────────────────────────────────────────────────

function EarningsScreen({ dispatch, onTxn }: { dispatch: Dispatch; onTxn: () => void }) {
  const { completed } = useOperatorSummary();
  const { selected } = useBookings();
  const EARNINGS_HISTORY = completed.filter(b => b.id !== selected?.id).map(b => ({ id: b.bookingId || b.requestId, recordId: b.id, service: b.request.cargo, date: displayDate(b.completedAt), customer: b.customer, amount: payTotals(b.dispatch).paid }));
  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Earnings" subtitle="Hauling income from verified payments" />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        <EarningsBookings d={dispatch} onTransaction={onTxn} />
        <div>
          <p className="text-[10px] font-black tracking-wider mb-2 px-1" style={{ color: R.mutedFg }}>EARLIER COMPLETED BOOKINGS</p>
          <div className="space-y-2">
            {EARNINGS_HISTORY.length === 0 && <p className="text-xs text-slate-500">No earlier completed bookings.</p>}
            {EARNINGS_HISTORY.map(e => (
              <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
                <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: `1px solid ${R.border}` }}>
                  <div>
                    <p className="text-[12px] font-black" style={{ color: "#0D1828" }}>{e.service}</p>
                    <p className="text-[10px]" style={{ color: R.muted }}>{e.id} · {e.date}</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.12)", color: "#15803d", border: "1px solid rgba(22,163,74,0.25)" }}>PAID</span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <p className="text-[10px]" style={{ color: R.mutedFg }}>Customer: {e.customer}</p>
                  <p className="text-[16px] font-black" style={{ color: R.green }}>₱{e.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rider Profile ─────────────────────────────────────────────────────────────

function RiderProfileScreen({ onGoTo, onLogout }: { onGoTo: (p: RPage) => void; onLogout: () => void }) {
  const { rider: RIDER } = useOperatorSummary();
  const sections = [
    { label: "Verification Documents",icon: "📋", page: "documents" as RPage },
    { label: "Earnings",              icon: "💰", page: "earnings" as RPage },
    { label: "My Reviews",            icon: "⭐", page: "reviews" as RPage },
    { label: "Notification Settings", icon: "🔔", page: "notifications" as RPage },
    { label: "Privacy & Security",    icon: "🔒", page: "privacy" as RPage },
    { label: "Help & Support",        icon: "❓", page: "help" as RPage },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Account" subtitle="Driver account" />
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        {/* Profile card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: R.cardOrange, border: `1px solid ${R.cardOrangeBorder}`, boxShadow: R.shadow }}>
          <div className="flex items-start gap-3 p-4">
            <RiderAvatar size={52} />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold leading-snug text-slate-900 [overflow-wrap:anywhere]">{RIDER.name}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 [overflow-wrap:anywhere]">{RIDER.phone === "Not provided" ? "Mobile number not added" : RIDER.phone}</p>
              <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-100/70 px-2 py-1 text-[9px] font-semibold leading-relaxed text-orange-800">
                <svg aria-hidden="true" className="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Z" />{RIDER.approved && <path d="m8 12 3 3 5-6" />}</svg>
                {RIDER.approved ? "Verified operator" : "Pending admin approval"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Completed jobs", value: String(RIDER.jobs), color: "#C2410C", detail: "" },
            { label: "Rating", value: RIDER.rating === "Not yet" ? "—" : `${RIDER.rating} ★`, color: "#A16207", detail: RIDER.rating === "Not yet" ? "No reviews yet" : "" },
            { label: "Acceptance", value: RIDER.acceptance === "Not yet" ? "—" : RIDER.acceptance, color: "#15803D", detail: RIDER.acceptance === "Not yet" ? "No responses yet" : "" },
          ].map(s => (
            <div key={s.label} className="min-w-0 rounded-2xl px-1.5 py-3 text-center" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
              <p className="whitespace-nowrap text-[18px] font-bold leading-7 tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-600">{s.label}</p>
              {s.detail && <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">{s.detail}</p>}
            </div>
          ))}
        </div>

        {/* Personal info */}
        <div className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${R.border}` }}><p className="text-[10px] font-black tracking-wider" style={{ color: R.mutedFg }}>OPERATOR INFORMATION</p></div>
          {[
            { label: "Full Name", value: RIDER.name },
            { label: "Mobile",    value: RIDER.phone },
            { label: "Email",     value: RIDER.email },
            { label: "Address",   value: RIDER.address },
            { label: "Emergency", value: RIDER.emergency },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${R.border}` : "none" }}>
              <span className="text-[10px] flex-shrink-0 pt-0.5" style={{ color: R.mutedFg, minWidth: "64px" }}>{r.label}</span>
              <span className="min-w-0 text-[11px] font-semibold leading-relaxed [overflow-wrap:anywhere]" style={{ color: "#374151" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Sections list */}
        <div className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
          {sections.map((s, i, arr) => (
            <button key={s.label} onClick={() => onGoTo(s.page)}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-opacity active:opacity-70"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${R.border}` : "none" }}>
              <span className="text-lg">{s.icon}</span>
              <span className="flex-1 text-[13px] font-semibold text-left" style={{ color: "#374151" }}>{s.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={R.muted} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={onLogout}
          className="w-full py-4 rounded-2xl font-black text-[13px] transition-opacity active:opacity-80"
          style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", color: R.red }}>
          Log Out
        </button>

        <div style={{ height: "4px" }}/>
      </div>
    </div>
  );
}

// ── Documents ─────────────────────────────────────────────────────────────────

function DocumentsScreen({ onBack }: { onBack: () => void }) {
  const docs = [
    { name: "Professional Driver's License", status: "verified",    expiry: "Mar 2028" },
    { name: "Police / Barangay Clearance",   status: "expiring",    expiry: "Nov 20, 2026" },
    { name: "Face Verification",             status: "verified",    expiry: "Active" },
  ];
  const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
    verified:  { label: "Verified",       bg: "rgba(22,163,74,0.12)",  color: "#15803d" },
    expiring:  { label: "Expiring Soon",  bg: "rgba(234,179,8,0.12)",  color: "#ca8a04" },
    expired:   { label: "Expired",        bg: "rgba(220,38,38,0.1)",   color: R.red },
    pending:   { label: "Pending Review", bg: "rgba(29,85,214,0.1)",   color: R.blue },
    resubmit:  { label: "Needs Resubmit", bg: "rgba(220,38,38,0.1)",   color: R.red },
  };

  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Verification Documents" subtitle="Truck Operator Verification files" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-2">
        {docs.map(d => {
          const s = statusCfg[d.status];
          return (
            <div key={d.name} className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${d.status === "expiring" ? "rgba(234,179,8,0.25)" : R.border}`, boxShadow: R.shadow }}>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(0,0,0,0.04)" }}>📄</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold leading-tight" style={{ color: "#0D1828" }}>{d.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: R.mutedFg }}>Expiry / Valid: {d.expiry}</p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <div className="px-4 pb-3 flex gap-2">
                <button className="flex-1 py-2 rounded-xl text-[10px] font-bold" style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${R.border}`, color: "#374151" }}>View File</button>
                <button className="flex-1 py-2 rounded-xl text-[10px] font-bold" style={{ background: d.status === "expiring" ? "rgba(234,179,8,0.1)" : "rgba(0,0,0,0.04)", border: `1px solid ${d.status === "expiring" ? "rgba(234,179,8,0.25)" : R.border}`, color: d.status === "expiring" ? "#ca8a04" : "#374151" }}>
                  {d.status === "expiring" ? "Renew Now" : "Replace"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Rider Reviews ─────────────────────────────────────────────────────────────

function RiderReviewsScreen({ onBack, dispatch }: { onBack: () => void; dispatch: Dispatch }) {
  const { rider: RIDER, rated } = useOperatorSummary();
  const REVIEWS_DATA = rated.map(b => ({ name: b.customer, rating: b.dispatch.rating!.stars, date: displayDate(b.completedAt), service: b.request.cargo, comment: b.dispatch.rating!.comment }));
  const cats = ["On-Time Service", "Communication", "Cargo Handling", "Professionalism"];
  const catRatings = cats.map(c => { const values = rated.map(b => b.dispatch.rating!.cats[c]).filter(v => typeof v === "number"); return values.length ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1)) : 0; });

  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="My Reviews" subtitle="Business customer feedback" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        <NewRatingCard d={dispatch} />
        {/* Overall */}
        <div className="px-4 py-4 rounded-2xl flex items-center gap-4" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
          <div className="text-center">
            <p className="text-[40px] font-black leading-none" style={{ color: R.yellow }}>{RIDER.rating}</p>
            <p className="text-[10px] mt-0.5" style={{ color: R.mutedFg }}>out of 5.0</p>
            <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(n => <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill={R.yellow}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</div>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold mb-1" style={{ color: "#0D1828" }}>{rated.length} verified reviews</p>
            <p className="text-[11px]" style={{ color: R.mutedFg }}>{RIDER.jobs} completed hauling jobs · {RIDER.acceptance} acceptance</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${R.border}` }}><p className="text-[10px] font-black tracking-wider" style={{ color: R.mutedFg }}>CATEGORY RATINGS</p></div>
          {cats.map((c, i) => (
            <div key={c} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < cats.length - 1 ? `1px solid ${R.border}` : "none" }}>
              <span className="text-[11px] flex-1" style={{ color: "#374151" }}>{c}</span>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={n <= Math.round(catRatings[i]) ? R.yellow : "rgba(0,0,0,0.1)"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</div>
              <span className="text-[11px] font-bold w-6 text-right" style={{ color: R.yellow }}>{catRatings[i]}</span>
            </div>
          ))}
        </div>

        {/* Recent reviews */}
        <div>
          <p className="text-[10px] font-black tracking-wider mb-2 px-1" style={{ color: R.mutedFg }}>RECENT REVIEWS</p>
          <div className="space-y-2">
            {REVIEWS_DATA.length === 0 && <p className="text-xs text-slate-500">No customer reviews yet.</p>}
            {REVIEWS_DATA.map((r, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
                <div className="px-4 pt-3 pb-2 flex items-start justify-between" style={{ borderBottom: `1px solid ${R.border}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: R.blue }}>{r.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{r.name}</p>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.12)", color: "#15803d" }}>VERIFIED</span>
                      </div>
                      <div className="flex items-center gap-2"><StarRow rating={r.rating} size={11} /><span className="text-[9px]" style={{ color: R.muted }}>{r.date}</span></div>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: R.mutedFg }}>{r.service}</span>
                </div>
                <div className="px-4 py-3"><p className="text-[12px] leading-relaxed" style={{ color: R.mutedFg }}>{r.comment}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Arrived at Pickup ─────────────────────────────────────────────────────────


// ── Confirm Pickup ────────────────────────────────────────────────────────────


// ── In Transit ────────────────────────────────────────────────────────────────


// ── Near Destination ──────────────────────────────────────────────────────────


// ── Empty / Status States ─────────────────────────────────────────────────────


// ── Report Issue ──────────────────────────────────────────────────────────────


// ── Notifications ─────────────────────────────────────────────────────────────

function NotificationsScreen({ onBack, dispatch, onOpen }: { onBack: () => void; dispatch: Dispatch; onOpen: (key: string) => void }) {
  const { notifications, select, markNotificationsRead } = useBookings();
  const items = notifications.map(n => ({ ...n, unread: !n.read }));
  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Notifications" subtitle="Assignment & hauling updates" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-2">
        {items.length === 0 && <p className="text-center text-[12px] py-10" style={{ color: R.muted }}>You are all caught up. No notifications yet.</p>}
        {items.map(n => (
          <button type="button" key={n.id} onClick={async () => { select(n.bookingRecordId); if (await markNotificationsRead()) onOpen(n.target || n.title); }} className="w-full text-left flex items-start gap-3 p-3 rounded-2xl transition-opacity active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            style={{ background: n.unread ? "#FFF7ED" : R.card, border: `1px solid ${n.unread ? "rgba(244,123,32,0.18)" : R.border}`, boxShadow: R.shadow }}>
            <div aria-hidden="true" className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: n.unread ? "#FFEDD5" : "#F1F5F9", color: n.unread ? "#C2410C" : R.muted }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-[12px] font-bold leading-relaxed [overflow-wrap:anywhere]" style={{ color: "#0D1828" }}>{n.title}</p>
                {n.unread && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: R.orange }}/>}
              </div>
              <p className="text-[11px] mt-1 leading-relaxed [overflow-wrap:anywhere]" style={{ color: R.muted }}>{n.body}</p>
              <time dateTime={Number.isFinite(Date.parse(n.time)) ? n.time : undefined} className="block text-[10px] mt-1.5 leading-relaxed [overflow-wrap:anywhere]" style={{ color: R.muted }}>
                {Number.isFinite(Date.parse(n.time)) ? new Date(n.time).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }) : "Time unavailable"}
              </time>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Bookings tab ──────────────────────────────────────────────────────────────

function BookingsScreen({ onOpen }: { onOpen: () => void }) {
  const { bookings, select } = useBookings();
  type BookingTab = "upcoming" | "active" | "completed";
  const items = bookings.filter(b => b.dispatch.status === "booked" && !b.dispatch.cancelled).map(booking => ({
    booking, kind: (isCompleted(booking.dispatch) ? "completed" : booking.dispatch.tripStage === "upcoming" ? "upcoming" : "active") as BookingTab,
  }));
  const [tab, setTab] = useState<BookingTab>(() => items.find(item => item.kind === "active")?.kind || items[0]?.kind || "upcoming");
  const shown = items.filter(item => item.kind === tab);
  const empty = {
    upcoming: "No upcoming bookings. Jobs appear here once the customer and driver confirm the agreement.",
    active: "No active hauling. Start a confirmed booking to begin a trip.",
    completed: "No completed bookings. Completed jobs appear after delivery confirmation and payment verification.",
  };
  return (
    <div className="h-full min-h-0 flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Bookings" subtitle="Upcoming, active and completed hauling" />
      <div className="grid shrink-0 grid-cols-3 gap-1 px-3 py-2">
        {(["upcoming", "active", "completed"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="min-w-0 rounded-lg py-2 text-[11px] font-bold capitalize"
            style={{ background: tab === t ? R.orange : "#fff", color: tab === t ? "#fff" : R.muted }}>{t} ({items.filter(item => item.kind === t).length})</button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="mx-auto w-full max-w-2xl space-y-2">
          {shown.map(({ booking, kind }) => (
            <article key={booking.id} className="rounded-xl border bg-white p-3" style={{ borderColor: R.border }}>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="text-[11px] font-bold" style={{ color: R.orange }}>{booking.bookingId || booking.requestId}</p>
                <span className="text-[10px] font-semibold" style={{ color: R.muted }}>{kind === "completed" ? "Completed" : TRIP_STATUS[booking.dispatch.tripStage]}</span>
              </div>
              <h2 className="mt-1 break-words text-xs font-bold">{booking.request.cargo}</h2>
              <p className="mt-1 break-words text-[11px]" style={{ color: R.muted }}>{booking.customer}</p>
              <p className="mt-1 break-words text-[11px]" style={{ color: R.muted }}>{booking.request.pickup.city} → {booking.request.delivery.city}</p>
              <p className="mt-1 text-[11px]" style={{ color: R.muted }}>{displayDate(booking.request.scheduledAt)}</p>
              <p className="mt-1 text-[11px] font-semibold">Hauling rate: {peso(booking.dispatch.finalRate || 0)}</p>
              <button onClick={() => { select(booking.id); onOpen(); }} className="mt-3 w-full rounded-lg py-2.5 text-xs font-bold text-white" style={{ background: R.orange }}>
                {kind === "active" ? "Continue Hauling" : kind === "completed" ? "View Completed Booking" : "View Booking"}
              </button>
            </article>
          ))}
          {shown.length === 0 && <div className="rounded-xl border bg-white px-4 py-8 text-center text-[11px] leading-relaxed" style={{ color: R.muted, borderColor: R.border }}>{empty[tab]}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Privacy & Help ────────────────────────────────────────────────────────────

function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const [toggles, setToggles] = useState({ twofa: true, loc: true, share: false });
  const rows: { k: keyof typeof toggles; label: string; sub: string }[] = [
    { k: "twofa", label: "Two-Step Verification", sub: "Demo setting only" },
    { k: "loc", label: "Share Demo GPS During Hauling", sub: "Visible to KadaGo Dispatch and the customer" },
    { k: "share", label: "Show Profile to Other Operators", sub: "Off by default" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Privacy & Security" subtitle="Account protection" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-2">
        {rows.map(r => (
          <button key={r.k} onClick={() => setToggles(t => ({ ...t, [r.k]: !t[r.k] }))} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
            <div className="flex-1"><p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{r.label}</p><p className="text-[10px]" style={{ color: R.mutedFg }}>{r.sub}</p></div>
            <div className="w-11 h-6 rounded-full flex items-center flex-shrink-0" style={{ background: toggles[r.k] ? R.green : "rgba(100,116,139,0.3)", padding: "2px" }}>
              <div className="w-5 h-5 rounded-full bg-white transition-all" style={{ transform: toggles[r.k] ? "translateX(20px)" : "translateX(0)" }}/>
            </div>
          </button>
        ))}
        <p className="text-[10px] text-center pt-2" style={{ color: R.muted }}>Prototype settings. Nothing is saved.</p>
      </div>
    </div>
  );
}

function HelpScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const faqs = [
    { q: "How do I receive assignments?", a: "KadaGo suggests a match, Admin approves it, and you confirm it from the Assignments tab." },
    { q: "How does the hauling rate work?", a: "You confirm the rate in Rate Review. KadaGo finalizes it and sends the quotation to the customer." },
    { q: "When is a booking Completed?", a: "After delivery, customer confirmation, and a verified payment record, with no open issue." },
    { q: "What does SOS do?", a: "It sends a simulated alert to KadaGo Dispatch. Real emergency services are not contacted." },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: R.bg }}>
      <OperatorHeader title="Help & Support" subtitle="Truck Operator guide" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-2">
        {faqs.map(f => (
          <button key={f.q} onClick={() => setOpen(open === f.q ? null : f.q)} className="w-full text-left px-4 py-3.5 rounded-2xl" style={{ background: R.card, border: `1px solid ${R.border}`, boxShadow: R.shadow }}>
            <p className="text-[12px] font-bold" style={{ color: "#0D1828" }}>{f.q}</p>
            {open === f.q && <p className="text-[11px] mt-1.5 leading-snug" style={{ color: R.muted }}>{f.a}</p>}
          </button>
        ))}
        <p className="text-[11px] text-center pt-2" style={{ color: R.muted }}>Need more help? Contact KadaGo Dispatch (demo).</p>
      </div>
    </div>
  );
}



// ══════════════════════════════════════════════════════════════════════════════
// MAIN RiderPortal Component
// ══════════════════════════════════════════════════════════════════════════════

interface RiderPortalProps {
  onLogout: () => void;
  dispatch: Dispatch;
  onDispatch: (p: Partial<Dispatch>) => void | Promise<boolean>;
}

export default function RiderPortal({ onLogout, dispatch, onDispatch }: RiderPortalProps) {
  const [page, setPage] = useState<RPage>("home");
  const [tab, setTab] = useState<RTab>("home");
  const [showSOS, setShowSOS] = useState(false);
  const { selected, updateLiveLocation, trucks, run } = useBookings();
  const online = trucks.some(truck => truck.available);
  const setOnline = (available: boolean) => run(async () => {
    if (!trucks.length) throw Error("A registered truck is required before accepting assignments.");
    await Promise.all(trucks.map(truck => bookingsApi.updateTruck(truck.id, { available })));
  });
  const activeVehicle = selected?.assignment?.truck || "No truck assigned";
  const [sharingBookingId, setSharingBookingId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState("");
  const activeBookingId = selected?.id;
  const sharingLocation = !!activeBookingId && sharingBookingId === activeBookingId;
  const activeTrip = selected?.dispatch.status === "booked" && ["enroute", "arrived", "loading", "loaded", "transit", "destination", "handover"].includes(selected.dispatch.tripStage);
  const latestFix = useRef<{ latitude: number; longitude: number; accuracy: number; heading: number | null; speed: number | null } | null>(null);

  useEffect(() => {
    if (!sharingLocation || !activeBookingId) return;
    if (!activeTrip) { setSharingBookingId(null); setLocationError("Location sharing is available during an active trip."); return; }
    if (!navigator.geolocation) { setSharingBookingId(null); setLocationError("This browser does not support location sharing."); return; }
    let watchId: number | undefined;
    let sending = false;
    let lastSent = 0;
    let disposed = false;
    const sendLatest = async () => {
      const fix = latestFix.current;
      if (!fix || sending || Date.now() - lastSent < 15000) return;
      sending = true;
      try { await updateLiveLocation(activeBookingId, fix); lastSent = Date.now(); if (!disposed) setLocationError(""); }
      catch (error) { if (!disposed) setLocationError(error instanceof Error ? error.message : "Could not send your location. Check your connection."); }
      finally { sending = false; }
    };
    watchId = navigator.geolocation.watchPosition(position => {
      latestFix.current = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, heading: Number.isFinite(position.coords.heading) ? position.coords.heading : null, speed: Number.isFinite(position.coords.speed) ? position.coords.speed : null };
      void sendLatest();
    }, error => {
      if (disposed) return;
      setLocationError(error.code === error.PERMISSION_DENIED ? "Location permission was denied. Allow it in your browser settings to share GPS." : error.code === error.TIMEOUT ? "GPS is taking too long. Check that location services are on." : "Your location is unavailable. Check device location settings.");
      setSharingBookingId(null);
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    const heartbeat = window.setInterval(() => { void sendLatest(); }, 15000);
    return () => {
      disposed = true;
      window.clearInterval(heartbeat);
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      latestFix.current = null;
      void updateLiveLocation(activeBookingId, null).catch(() => undefined);
    };
  }, [sharingLocation, activeBookingId, activeTrip, updateLiveLocation]);

  const unreadNotifs = useBookings().notifications.filter(n => !n.read).length;

  const goTo = (p: RPage) => { setPage(p); setTab(TAB_OF[p]); };
  const back = (p: RPage) => goTo(p);
  const goHome = () => goTo("home");

  const handleTabChange = (t: RTab) => {
    if (t === "home") goTo("home");
    else if (t === "assignments") goTo("assignments");
    else if (t === "bookings") goTo("bookings");
    else if (t === "earnings") goTo("earnings");
    else goTo("profile");
  };

  const openNotif = (key?: string) => {
    if (key === "assignment" || key === "New Assignment") goTo("assignment-detail");
    else if (key === "agreement") goTo("agreement");
    else if (key === "quotation") goTo("rate-coordination");
    else if (key === "rating" || key === "New Rating Received") goTo("reviews");
    else if (key === "Driver Document Expiring") goTo("documents");
    else if (key === "payment" && dispatch.pay?.status === "Paid") goTo("txn");
    else if (key === "completed") goTo("bookings");
    else if (key === "track" || key === "delivery" || key === "case" || key === "payment") goTo("trip");
    else if (key === "KadaGo Admin Update") goTo("assignments");
    else goTo("home");
  };

  const renderContent = () => {
    switch (page) {
      case "home":
        return (
          <HomeScreen
            online={online} setOnline={setOnline}
            dispatch={dispatch} onGoTo={goTo}
            onSOS={() => setShowSOS(true)} onNotif={() => goTo("notifications")}
            unread={unreadNotifs} activeVehicle={activeVehicle}
          />
        );
      case "assignments":
        return <AssignmentsInbox onOpen={() => goTo("assignment-detail")} />;
      case "bookings":
        return <BookingsScreen onOpen={() => goTo("trip")} />;
      case "assignment-detail":
        return <AssignmentDetail dispatch={dispatch} onBack={() => back("assignments")} onDispatch={onDispatch} onRate={() => goTo("rate-coordination")} />;
      case "trip":
        return <OperatorTrip dispatch={dispatch} onDispatch={onDispatch} onBack={() => goTo("bookings")} onSOS={() => setShowSOS(true)} onBooking={() => goTo("agreement")} locationSharing={sharingLocation} locationError={locationError} liveLocation={selected?.liveLocation || null} onToggleLocationSharing={() => { setLocationError(""); setSharingBookingId(current => current === activeBookingId ? null : activeBookingId || null); }} />;
      case "agreement":
        return <AgreementScreen role="operator" dispatch={dispatch} onDispatch={onDispatch} onBack={goHome} onStartTrip={() => goTo("trip")} />;
      case "agreements":
        return <AgreementsList role="operator" dispatch={dispatch} onOpen={() => goTo("agreement")} onBack={goHome} />;
      case "rate-coordination":
        return <RateCoordination dispatch={dispatch} onBack={goHome} onDispatch={onDispatch} onAgreement={() => goTo("agreement")} />;
      case "earnings":
        return <EarningsScreen dispatch={dispatch} onTxn={() => goTo("txn")} />;
      case "txn":
        return <OperatorTransaction d={dispatch} onBack={() => back("earnings")} />;
      case "profile":
        return <RiderProfileScreen onGoTo={goTo} onLogout={onLogout} />;
      case "documents":
        return <DocumentsScreen onBack={() => back("profile")} />;
      case "reviews":
        return <RiderReviewsScreen onBack={() => goTo("profile")} dispatch={dispatch} />;
      case "privacy":
        return <PrivacyScreen onBack={() => goTo("profile")} />;
      case "help":
        return <HelpScreen onBack={() => goTo("profile")} />;
      case "notifications":
        return <NotificationsScreen onBack={goHome} dispatch={dispatch} onOpen={openNotif} />;
    }
  };

  const content = renderContent();

  return (
    <div className="portal-layout h-full flex flex-col relative" style={{ background: R.bg }}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">{content}</div>
      {sharingLocation && page !== "trip" && <div className="absolute left-3 right-3 top-3 z-40 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-white px-3 py-2.5 shadow-lg"><div className="min-w-0"><p className="text-xs font-bold text-green-800">Live GPS sharing is on</p><p className="truncate text-[10px] text-slate-600">This booking's customer can see your location.</p>{locationError && <p role="alert" className="text-[10px] text-red-700">{locationError}</p>}</div><button type="button" onClick={() => setSharingBookingId(null)} className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-bold text-red-700">Stop sharing</button></div>}
      <RBottomNav active={tab} onChange={handleTabChange} />
      {showSOS && <DriverSOS onClose={() => setShowSOS(false)} onSend={() => onDispatch({ operatorSOS: "active" })} />}
    </div>
  );
}
