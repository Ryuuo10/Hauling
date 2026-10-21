import { request } from "./bookings"

export type ApplicationDocument = {
  id: string;
  kind: string;
  name: string;
};
export type OperatorApplication = {
  id: string
  userId: string
  role: "rider" | "fleet"
  email: string
  profile: {
    name: string
    phone: string
    address: string
    businessName: string
    emergencyContact: string
    emergencyPhone: string
  }
  truck: {
    make: string
    plate: string
    bodyType: string
    payloadKg: number
    serviceAreas: string
    brand?: string
    model?: string
    orcr?: string
    passengerCapacity?: number
    color?: string
    vehicleType?: string
  }
  documents: ApplicationDocument[]
  status: "pending" | "approved" | "rejected" | "changes_requested"
  feedback: string
  submittedAt: string
  reviewedAt: string | null
  version: number
}
export type ApplicationSubmission = Pick<OperatorApplication, "profile" | "truck" | "documents">
export const operatorApplications = {
  mine: () =>
    request<{ application: OperatorApplication | null }>(
      "operator-applications/me",
    ),
  submit: (data: ApplicationSubmission) =>
    request<{ application: OperatorApplication }>(
      "operator-applications/me",
      data,
    ),
  list: () =>
    request<{ applications: OperatorApplication[] }>("operator-applications"),
  review: (
    application: OperatorApplication,
    status: OperatorApplication["status"],
    feedback: string,
  ) =>
    request<{ application: OperatorApplication }>(
      `operator-applications/${application.id}/review`,
      { status, feedback, version: application.version },
    ),
  async upload(file: File, kind: string) {
    if (
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.type,
      ) ||
      file.size > 2000000
    )
      throw Error("Choose a JPEG, PNG, WebP, or PDF file under 2 MB.")
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(Error("Could not read the file."))
      reader.readAsDataURL(file)
    })
    return request<{ document: ApplicationDocument }>("operator-documents", {
      data,
      name: file.name,
      kind,
    })
  },
}
export const applicationStatusLabel = {
  pending: "Pending Admin Review",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes Required",
}
export const applicationDocumentLabels: Record<string, string> = {
  license: "Professional driver's license",
  identity: "Identity photo",
  clearance: "Police / barangay clearance",
  orcr: "Truck OR/CR",
  vehiclePhoto: "Truck photo showing plate",
  insurance: "Truck insurance",
  registration: "DTI / SEC registration",
  permit: "Business permit",
}
