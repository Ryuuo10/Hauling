import type { Booking } from "@/api/bookings";
import type { CargoIssue, Photo } from "@/data/dispatchData";

export type BookingCase = {
  key: string;
  id: string;
  bookingId: string;
  reference: string;
  kind: "cargo" | "payment";
  type: string;
  status: "Under Review" | "More Information Requested" | "Resolved";
  customer: string;
  operator: string;
  description: string;
  createdAt: string;
  reportedBy: string;
  photos: Photo[];
  attachmentIds: string[];
  response: { text: string; photos: Photo[] } | null;
  adminNotes: string[];
  resolution?: string;
  resolvedAt?: string;
};

export function casesForBookings(bookings: Booking[]): BookingCase[] {
  const cases: BookingCase[] = [];
  for (const booking of bookings) {
    const base = { bookingId: booking.id, reference: booking.bookingId || booking.requestId, customer: booking.customer, operator: booking.assignment?.business || "Not assigned" };
    const cargo: (CargoIssue & { resolution?: string; resolvedAt?: string })[] = [...(booking.resolvedIssues || []), ...(booking.dispatch.issue ? [booking.dispatch.issue] : [])];
    cargo.forEach((issue, index) => {
      const archived = !!issue.resolvedAt;
      cases.push({ ...base, key: `${booking.id}:cargo:${issue.id}`, id: issue.id, kind: "cargo", type: issue.type, status: archived ? "Resolved" : issue.status, description: issue.desc, createdAt: issue.createdAt || booking.events.filter(event => event.label === "Cargo Issue Reported")[index]?.at || booking.createdAt, reportedBy: "Customer", photos: issue.photos || [], attachmentIds: [], response: issue.response, adminNotes: issue.adminNotes || [], resolution: archived ? issue.resolution : undefined, resolvedAt: archived ? issue.resolvedAt : undefined });
    });
    const issue = booking.dispatch.payIssue;
    if (issue) cases.push({ ...base, key: `${booking.id}:payment:${issue.id}`, id: issue.id, kind: "payment", type: issue.type, status: issue.status, description: issue.note, createdAt: issue.createdAt || booking.events.find(event => event.label === "Payment Issue Reported")?.at || booking.createdAt, reportedBy: issue.by === "customer" ? "Customer" : "Driver / Operator", photos: [], attachmentIds: issue.attachmentIds || [], response: null, adminNotes: [], resolution: issue.resolution, resolvedAt: issue.resolvedAt });
  }
  return cases.sort((a, b) => Date.parse(b.resolvedAt || b.createdAt) - Date.parse(a.resolvedAt || a.createdAt) || a.key.localeCompare(b.key));
}
