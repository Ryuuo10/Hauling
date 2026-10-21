import { authConfig } from "./auth";
import type { CargoIssue, Dispatch } from "@/data/dispatchData";

export type Location = { address: string; city: string; province: string; contact: string; phone: string; landmark: string; instructions: string };
export type HaulingRequest = { category: string; pickup: Location; delivery: Location; cargo: string; quantity: string; weightKg: number; truckType: string; scheduledAt: string; deliveryAt: string | null; handling: string[]; equipment: string[]; loading: string; unloading: string; dimensions: string; helpers: boolean; flexible: boolean; budget: number | null; notes: string; photos: string[] };
export type Truck = { id: string; ownerId: string; business: string; driver: string; truck: string; bodyType: string; plate: string; payloadKg: number; areas: string[]; equipment: string[]; verified: boolean; available: boolean; operatorApproved?: boolean; hasActiveAssignment?: boolean };
export type Quote = { id: string; rate: number; deposit: number; included: string[]; separate: string; terms: string; sentAt: string; status: string };
export type BookingEvent = { id: string; at: string; label: string; role: string; actor?: string; details?: string; internal?: boolean };
export type Booking = { resolvedIssues?: (CargoIssue & { resolution: string; resolvedAt: string; resolvedBy?: string })[]; depositRecords?: { amount: number; reference: string; verifiedAt: string; verifiedBy: string }[]; assignmentDeclines?: { operatorId: string; truckId: string; reason: string; note: string; at: string }[]; liveLocation?: LiveLocation | null; id: string; requestId: string; bookingId: string | null; customerId: string; customer: string; representative: string; operatorId: string | null; assignment: Truck | null; request: HaulingRequest; dispatch: Dispatch; version: number; quotes: Quote[]; events: BookingEvent[]; createdAt: string; updatedAt: string; completedAt?: string; tripTimes?: Record<string, string>; completed: boolean };
export type DeclinedAssignment = { requestId: string; cargo: string; route: string; scheduledAt: string; reason: string; note: string; at: string };
export type Profile = { name: string; email: string; phone: string; verificationStatus: string; businessName?: string; businessType?: string; address?: string; contactName?: string; contactPhone?: string; emergencyContact?: string; emergencyPhone?: string; notificationSettings?: Record<string, boolean>; readThrough?: string };
export type LiveLocation = { latitude: number; longitude: number; accuracy: number; heading: number | null; speed: number | null; updatedAt: string };
export type UserNotification = { id: string; bookingRecordId: string; bookingId: string; requestId: string; title: string; body: string; time: string; target: string; read: boolean };

export async function request<T>(path: string, data?: unknown, method = "POST"): Promise<T> {
  const headers: Record<string, string> = {};
  if (data !== undefined) { const config = await authConfig(); headers["Content-Type"] = "application/json"; headers["X-CSRF-Token"] = config.csrfToken; }
  const response = await fetch(`/api/${path}`, { method: data === undefined ? "GET" : method, credentials: "same-origin", cache: "no-store", headers, body: data === undefined ? undefined : JSON.stringify(data) });
  if (!response.headers.get("content-type")?.includes("application/json")) throw Error("The booking service is unavailable.");
  const value = await response.json();
  if (!response.ok) throw Error(value.error || "The request could not be completed.");
  return value;
}
export const bookingsApi = {
  list: () => request<{ bookings: Booking[]; declinedAssignments?: DeclinedAssignment[] }>("bookings"),
  create: (submissionKey: string, data: HaulingRequest) => request<{ booking: Booking }>("bookings", { submissionKey, request: data }),
  patch: (b: Booking, patch: Partial<Dispatch>, truckId?: string) => request<{ booking: Booking }>(`bookings/${b.id}/patch`, { version: b.version, patch, truckId }),
  quote: (b: Booking, quote: { rate: number; deposit: number; included: string[]; separate: string; terms: string }) => request<{ booking: Booking }>(`bookings/${b.id}/quote`, { version: b.version, ...quote }),
  resolve: (b: Booking, note: string) => request<{ booking: Booking }>(`bookings/${b.id}/resolve-issue`, { version: b.version, note }),
  deposit: (b: Booking, amount: number, reference: string) => request<{ booking: Booking }>(`bookings/${b.id}/deposit`, { version: b.version, amount, reference }),
  trucks: () => request<{ trucks: Truck[] }>("trucks"),
  addTruck: (truck: Partial<Truck>) => request("trucks", truck),
  updateTruck: (id: string, patch: Partial<Truck>) => request(`trucks/${id}`, patch, "PATCH"),
  profile: () => request<{ profile: Profile }>("profile"),
  saveProfile: (profile: Profile) => request<{ profile: Profile }>("profile", profile, "PATCH"),
  notifications: () => request<{ notifications: UserNotification[] }>("notifications"),
  markNotificationsRead: () => request<{ readThrough: string }>("notifications/read", {}, "PATCH"),
  updateLiveLocation: (bookingId: string, location: Omit<LiveLocation, "updatedAt"> | null) => request<{ liveLocation: LiveLocation | null }>(`bookings/${bookingId}/location`, location ? { ...location, sharing: true } : { sharing: false }, "POST"),
};
export async function uploadPhoto(file: File, bookingId?: string) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2000000) throw Error("Choose a JPEG, PNG, or WebP image under 2 MB.");
  const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(Error("Cannot read this image.")); reader.readAsDataURL(file); });
  return request<{ id: string; name: string }>("attachments", { data, name: file.name, bookingId });
}
