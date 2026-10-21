import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/api/auth";
import { bookingsApi } from "@/api/bookings";
import type { Booking, DeclinedAssignment, HaulingRequest, LiveLocation, Profile, Truck, UserNotification } from "@/api/bookings";
import { INITIAL_DISPATCH, MATCHES, registeredTruckMatches, noTruckMatch, syncDispatchData } from "@/data/dispatchData";
import type { Dispatch } from "@/data/dispatchData";

type Store = { declinedAssignments: DeclinedAssignment[]; resolveIssue: (note: string) => Promise<boolean>; verifyDeposit: (amount: number, reference: string) => Promise<boolean>; user: AuthUser; bookings: Booking[]; selected: Booking | null; trucks: Truck[]; profile: Profile | null; notifications: UserNotification[]; loading: boolean; busy: boolean; error: string; epoch: number; select: (id: string) => void; refresh: () => Promise<void>; patch: (p: Partial<Dispatch>) => Promise<boolean>; markNotificationsRead: () => Promise<boolean>; create: (key: string, data: HaulingRequest) => Promise<Booking>; run: (action: () => Promise<unknown>) => Promise<boolean>; saveProfile: (p: Profile) => Promise<boolean>; updateLiveLocation: (bookingId: string, location: Omit<LiveLocation, "updatedAt"> | null) => Promise<void> };
const Context = createContext<Store | null>(null);
export function useBookings() { const value = useContext(Context); if (!value) throw Error("Booking context is missing."); return value; }
const categories: Record<string, string> = { agri: "Agricultural Cargo", construction: "Construction Materials", bulky: "Bulky & Heavy Goods", other: "Other Commercial Cargo" };
export const displayDate = (value?: string | null) => value ? new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "Not yet recorded";
export function useBookingData() {
  const { selected: b, trucks, user, profile } = useBookings();
  const r = b?.request;
  const REQ = { id: b?.requestId || "No request yet", customer: b?.customer || profile?.businessName || user.name, rep: b?.representative || user.name, category: categories[r?.category || ""] || "", cargo: r?.cargo || "", cargoShort: r?.cargo || "", quantity: r?.quantity || "", weight: r ? `${r.weightKg.toLocaleString()} kg` : "", weightKg: r?.weightKg || 0, pickup: r ? `${r.pickup.address}, ${r.pickup.city}, ${r.pickup.province}` : "", dest: r ? `${r.delivery.address}, ${r.delivery.city}, ${r.delivery.province}` : "", route: r ? `${r.pickup.city} → ${r.delivery.city}` : "", schedule: displayDate(r?.scheduledAt), requirements: r ? [...r.handling, ...r.equipment, r.loading, r.unloading, r.helpers ? "Helpers requested" : ""].filter(Boolean).join(", ") : "", budget: r?.budget ? `₱${r.budget.toLocaleString()}` : "Not specified" };
  const list = b?.assignment ? [b.assignment] : trucks.filter(t => !b?.assignmentDeclines?.some(item => item.truckId === t.id || item.operatorId === t.ownerId));
  const matches = r ? registeredTruckMatches(list, r, !!b?.assignment) : [];
  const MATCHES = matches.length ? matches : [noTruckMatch(REQ.weightKg)], m = MATCHES[0];
  const q = b?.quotes.at(-1);
  const QUOTE = { id: q?.id || "Not issued", pickupSchedule: REQ.schedule, delivery: displayDate(r?.deliveryAt), validUntil: "As stated in payment terms", included: q?.included || ["Driver", "Fuel", ...(r?.equipment || [])], separate: q?.separate ? [{ k: "Additional charges", v: q.separate }] : [], terms: q?.terms || "", deposit: q?.deposit || 0 };
  const AGREEMENT = { id: q ? `KA-${q.id.slice(3)}` : "Not issued", booking: b?.bookingId || "Pending confirmation", customerAt: displayDate(b?.events.find(e => e.label === "Customer Confirmed Agreement")?.at), operatorAt: displayDate(b?.events.find(e => e.label === "Booking Confirmed")?.at) };
  const time = (key: string) => displayDate(b?.tripTimes?.[key]);
  return { REQ, REQUEST: { id: REQ.id, cargo: REQ.cargo, category: REQ.category, route: REQ.route, routeShort: REQ.route, date: REQ.schedule }, MATCHES, m, QUOTE, AGREEMENT, TRIP_TIMES: { started: time("enroute"), arrivedPickup: time("arrived"), loaded: time("loaded"), deliveryStarted: time("transit"), arrivedDest: time("destination"), delivered: time("delivered") }, TIMES_DONE: { delivered: time("delivered"), completed: displayDate(b?.completedAt) }, PROPOSED_RATE: b?.dispatch.proposedRate || b?.dispatch.finalRate || 0, CUSTOMER: REQ.customer, DRIVER: m.driver, OPERATOR: m.driver, TRUCK: m.truckShort, TRUCK_LABEL: m.truckShort, ROUTE: REQ.route, EXPECTED_QTY: parseFloat(r?.quantity || "0") || 0 };
}
export default function BookingProvider({ user, children }: { user: AuthUser; children: ReactNode }) {
  const [declinedAssignments, setDeclinedAssignments] = useState<DeclinedAssignment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]), [trucks, setTrucks] = useState<Truck[]>([]), [profile, setProfile] = useState<Profile | null>(null), [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [selectedId, setSelectedId] = useState(() => { try { return localStorage.getItem(`kadago-booking-${user.id}`) || ""; } catch { return ""; } });
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(""), [epoch, setEpoch] = useState(0);
  const busyRef = useRef(false), requestGeneration = useRef(0), mounted = useRef(true);
  const selected = bookings.find(b => b.id === selectedId) || bookings[0] || null;
  if (selected) syncDispatchData(selected, trucks.filter(t => !selected.assignmentDeclines?.some(item => item.truckId === t.id || item.operatorId === t.ownerId)));
  const select = (id: string) => { setSelectedId(id); try { localStorage.setItem(`kadago-booking-${user.id}`, id); } catch { /* Selection remains usable without local storage. */ } };
  const refresh = async () => {
    const generation = ++requestGeneration.current;
    if (user.role === "rider" && user.verificationStatus !== "approved") {
      // Pending riders can open their existing dashboard after login. Hauling
      // operations still require Admin approval; do not request protected data.
      const { profile: savedProfile } = await bookingsApi.profile();
      if (mounted.current && generation === requestGeneration.current && !busyRef.current) {
        setBookings([]); setTrucks([]); setNotifications([]); setProfile(savedProfile);
      }
      return;
    }
    const [b, p, t, n] = await Promise.all([bookingsApi.list(), bookingsApi.profile(), user.role === "customer" ? Promise.resolve({ trucks: [] as Truck[] }) : bookingsApi.trucks(), bookingsApi.notifications()]);
    if (mounted.current && generation === requestGeneration.current && !busyRef.current) { setBookings(b.bookings); setDeclinedAssignments(b.declinedAssignments || []); setProfile(p.profile); setTrucks(t.trucks); setNotifications(n.notifications); }
  };
  useEffect(() => {
    mounted.current = true;
    const update = () => { if (!busyRef.current && document.visibilityState !== "hidden") void refresh().catch(e => { if (mounted.current) setError(e.message); }).finally(() => { if (mounted.current) setLoading(false); }); };
    update(); const timer = window.setInterval(update, 5000); window.addEventListener("focus", update);
    return () => { mounted.current = false; requestGeneration.current++; clearInterval(timer); window.removeEventListener("focus", update); };
  }, [user.id]);
  const run = async (action: () => Promise<unknown>) => {
    if (busyRef.current) return false;
    busyRef.current = true; ++requestGeneration.current; setBusy(true); setError("");
    try { await action(); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setEpoch(x => x + 1); return false; }
    finally { busyRef.current = false; setBusy(false); try { await refresh(); } catch { /* Keep the explicit operation result visible. */ } }
  };
  const patch = async (p: Partial<Dispatch>) => {
    if (!selected) { setError("Select a saved request first."); return false; }
    return run(async () => {
      const candidates = selected.assignment ? [selected.assignment] : trucks;
      const chosen = p.status === "approved" ? MATCHES[p.matchIdx || 0] : undefined;
      const chosenTruck = candidates.find(t => t.id === chosen?.truckId);
      const result = p.status === "quote"
        ? await bookingsApi.quote(selected, { rate: selected.dispatch.finalRate || 0, deposit: selected.dispatch.requiredDeposit || 0, included: ["Driver", "Fuel", ...selected.request.equipment], separate: "No additional charges quoted", terms: "Payment is due after confirmed delivery. Record payments made outside KadaGo; dispatch verifies payment records." })
        : await bookingsApi.patch(selected, p, p.status === "approved" ? chosenTruck?.id : undefined);
      setBookings(items => items.map(b => b.id === result.booking.id ? result.booking : b));
    });
  };
  const markNotificationsRead = async () => {
    try {
      await bookingsApi.markNotificationsRead();
      setNotifications(items => items.map(item => ({ ...item, read: true })));
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update notifications."); return false; }
  };
  const create = async (key: string, data: HaulingRequest) => {
    // Form handles its own save/error state and keeps the same key for retries.
    const result = await bookingsApi.create(key, data);
    setBookings(items => [result.booking, ...items.filter(b => b.id !== result.booking.id)]); select(result.booking.id); return result.booking;
  };
  const resolveIssue = (note: string) => run(async () => {
    if (!selected) throw Error("Select a booking first.");
    const result = await bookingsApi.resolve(selected, note);
    setBookings(items => items.map(b => b.id === result.booking.id ? result.booking : b));
  });
  const verifyDeposit = (amount: number, reference: string) => run(async () => {
    if (!selected) throw Error("Select a booking first.");
    const result = await bookingsApi.deposit(selected, amount, reference);
    setBookings(items => items.map(b => b.id === result.booking.id ? result.booking : b));
  });
  const saveProfile = (p: Profile) => run(async () => { const result = await bookingsApi.saveProfile(p); setProfile(result.profile); });
  const updateLiveLocation = useCallback(async (bookingId: string, location: Omit<LiveLocation, "updatedAt"> | null) => {
    const result = await bookingsApi.updateLiveLocation(bookingId, location);
    setBookings(items => items.map(booking => booking.id === bookingId ? { ...booking, liveLocation: result.liveLocation } : booking));
  }, []);
  const value = useMemo(() => ({ user, bookings, declinedAssignments, selected, trucks, profile, notifications, loading, busy, error, epoch, select, refresh, patch, markNotificationsRead, create, run, saveProfile, updateLiveLocation, resolveIssue, verifyDeposit }), [user, bookings, declinedAssignments, selected, trucks, profile, notifications, loading, busy, error, epoch, updateLiveLocation]);
  return <Context.Provider value={value}>
    {error && <div role="alert" className="px-4 py-3 bg-red-50 text-red-700 text-sm flex gap-3 items-center"><span className="flex-1">{error}</span><button onClick={() => { void refresh().catch(e => setError(e.message)); }}>Retry</button><button aria-label="Dismiss error" onClick={() => setError("")}>×</button></div>}
    {loading ? <div role="status" className="m-auto p-8 text-center">Loading your KadaGo requests…</div> : children}
    {busy && <div role="status" aria-live="polite" className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 text-blue-700 font-bold">Saving…</div>}
  </Context.Provider>;
}
