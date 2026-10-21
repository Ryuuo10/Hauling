import { useEffect, useRef, useState } from "react"
import type { AuthUser } from "@/api/auth"
import { auth } from "@/api/auth"
import { bookingsApi } from "@/api/bookings"
import { operatorApplications } from "@/api/operatorApplications"
import type {
  ApplicationDocument,
  ApplicationSubmission,
  OperatorApplication,
} from "@/api/operatorApplications"
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png"

const orange = "#F47B20"
type Vehicle = {
  brand: string
  model: string
  bodyType: string
  passengers: string
  plate: string
  orcr: string
  payload: string
  color: string
  vehicleType: string
  serviceAreas: string
}
const initialVehicle: Vehicle = {
  brand: "Isuzu",
  model: "Elf Dropside N-Series",
  bodyType: "Dropside Open Bed",
  passengers: "2",
  plate: "ABC 1234",
  orcr: "OR-LTO-2026-991204",
  payload: "2500",
  color: "White",
  vehicleType: "4-Wheel Truck",
  serviceAreas: "Bukidnon",
}
const documents = [
  { kind: "orcr", label: "LTO OR/CR", required: true },
  { kind: "vehiclePhoto", label: "Vehicle Picture", required: true },
  { kind: "license", label: "Professional License", required: true },
  { kind: "clearance", label: "Clearance", required: false },
  { kind: "insurance", label: "Insurance", required: false },
]
const card =
  "overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
const inputClass =
  "mt-1 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 py-3 text-[12px] text-slate-700 outline-none focus:border-orange-400"

export default function DriverCertification({
  user,
  onLogout,
  onApproved,
}: {
  user: AuthUser
  onLogout: () => void
  onApproved: (user: AuthUser) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle)
  const [profile, setProfile] = useState<ApplicationSubmission["profile"]>({
    name: user.name,
    phone: "",
    address: "",
    businessName: "",
    emergencyContact: "",
    emergencyPhone: "",
  })
  const [files, setFiles] = useState<ApplicationDocument[]>([])
  const [application, setApplication] = useState<OperatorApplication | null>(
    null,
  )
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const lock = useRef(false)
  const content = useRef<HTMLDivElement>(null)
  const submitted =
    application && ["pending", "approved"].includes(application.status)
  useEffect(() => {
    let active = true
    void Promise.all([operatorApplications.mine(), bookingsApi.profile()])
      .then(([result, saved]) => {
        if (!active) return
        const app = result.application,
          p = saved.profile
        setApplication(app)
        setProfile(
          app?.profile || {
            name: p.contactName || p.name || user.name,
            phone: p.contactPhone || p.phone || "",
            address: p.address || "",
            businessName: p.businessName || "",
            emergencyContact: p.emergencyContact || "",
            emergencyPhone: p.emergencyPhone || "",
          },
        )
        if (app) {
          setFiles(app.documents)
          setVehicle({
            ...initialVehicle,
            brand: app.truck.brand || app.truck.make,
            model: app.truck.model || "",
            plate: app.truck.plate,
            bodyType: app.truck.bodyType,
            payload: String(app.truck.payloadKg),
            serviceAreas: app.truck.serviceAreas,
            orcr: app.truck.orcr || "",
            passengers: String(app.truck.passengerCapacity ?? 2),
            color: app.truck.color || "",
            vehicleType: app.truck.vehicleType || "4-Wheel Truck",
          })
        }
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user.id])
  useEffect(() => {
    content.current?.scrollTo(0, 0)
    setError("")
  }, [step])
  useEffect(() => {
    if (application?.status !== "pending") return
    let active = true
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "hidden")
        void operatorApplications
          .mine()
          .then((result) => {
            if (active) setApplication(result.application)
          })
          .catch(() => {})
    }, 10000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [application?.status])

  const upload = async (file: File | undefined, kind: string) => {
    if (!file || lock.current) return false
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const result = await operatorApplications.upload(file, kind)
      setFiles((previous) => [
        ...previous.filter((item) => item.kind !== kind),
        result.document,
      ])
      return true
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not upload this document.",
      )
      return false
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const capture = async () => {
    if (lock.current || attempts >= 3) return
    setError("")
    // A clearly named placeholder lets the prototype flow be tested without
    // camera access or any claim that a real identity check took place.
    const png = Uint8Array.from(
      atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGJkAAAAASUVORK5CYII=",
      ),
      (character) => character.charCodeAt(0),
    )
    const blob = new Blob([png], { type: "image/png" })
    setAttempts((value) => Math.min(value + 1, 3))
    if (
      await upload(
        new File([blob], "PROTOTYPE_SIMULATED_FACE_CAPTURE.png", {
          type: "image/png",
        }),
        "identity",
      )
    ) {
      setStep(3)
    }
  }
  const next = () => {
    if (
      !vehicle.brand.trim() ||
      !vehicle.model.trim() ||
      !vehicle.bodyType.trim() ||
      !vehicle.plate.trim() ||
      !vehicle.orcr.trim() ||
      !vehicle.serviceAreas.trim() ||
      !(Number(vehicle.payload) > 0) ||
      !Number.isInteger(Number(vehicle.passengers)) ||
      Number(vehicle.passengers) < 0
    ) {
      setError(
        "Complete the required vehicle specifications before continuing.",
      )
      return
    }
    const missing = documents.filter(
      (d) => d.required && !files.some((file) => file.kind === d.kind),
    )
    if (missing.length) {
      setError(`Attach: ${missing.map((d) => d.label).join(", ")}.`)
      return
    }
    setStep(2)
  }
  const submit = async () => {
    if (lock.current) return
    if (!files.some((file) => file.kind === "identity")) {
      setStep(2)
      return
    }
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const result = await operatorApplications.submit({
        profile,
        truck: {
          make: `${vehicle.brand} ${vehicle.model}`.trim(),
          brand: vehicle.brand,
          model: vehicle.model,
          bodyType: vehicle.bodyType,
          plate: vehicle.plate,
          payloadKg: Number(vehicle.payload),
          serviceAreas: vehicle.serviceAreas,
          orcr: vehicle.orcr,
          passengerCapacity: Number(vehicle.passengers),
          color: vehicle.color,
          vehicleType: vehicle.vehicleType,
        },
        documents: files,
      })
      setApplication(result.application)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not submit your application. Please try again.",
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const checkStatus = async () => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const result = await operatorApplications.mine()
      setApplication(result.application)
      if (result.application?.status === "approved") {
        const session = await auth.session()
        if (session.user) onApproved(session.user)
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not check application status.",
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const field = (
    key: keyof Vehicle,
    label: string,
    required = true,
    type = "text",
  ) => (
    <label className="min-w-0 text-[10px] font-semibold text-slate-500">
      {label}
      {required && <span className="text-orange-500"> *</span>}
      <input
        type={type}
        value={vehicle[key]}
        onChange={(e) =>
          setVehicle((previous) => ({ ...previous, [key]: e.target.value }))
        }
        className={inputClass}
      />
    </label>
  )
  const identity = files.find((file) => file.kind === "identity")
  const footerButton =
    "flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-[12px] font-extrabold leading-relaxed text-white disabled:opacity-50"

  return (
    <div className="driver-certification flex h-full min-h-0 flex-col bg-[#F8FAFF] text-[#0D1828]">
      <header className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-4 py-4">
        {!submitted ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (step === 1) onLogout()
              else setStep(step === 3 ? 2 : 1)
            }}
            className="flex items-center gap-1 text-[12px] font-semibold text-slate-500"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5m7-7-7 7 7 7" />
            </svg>
            Back
          </button>
        ) : (
          <img src={kadaGoLogo} alt="KadaGo" className="w-7" />
        )}
        <div className="flex items-center gap-2">
          {!submitted && <img src={kadaGoLogo} alt="" className="w-6" />}
          <span
            className="text-[9px] font-black tracking-widest"
            style={{ color: submitted ? orange : "#64748B" }}
          >
            RIDER CERTIFICATION
          </span>
        </div>
      </header>
      {!submitted && (
        <div className="flex shrink-0 gap-1.5 border-b border-black/10 bg-[#F1F4FF] px-3 py-3">
          {[
            "Vehicle & Docs",
            "Face Capture (Prototype)",
            "Submit to Admin",
          ].map((label, i) => (
            <div
              key={label}
              className="flex min-h-7 min-w-0 flex-1 items-center justify-center rounded-full px-1 py-2 text-center text-[8px] font-extrabold leading-tight"
              style={{
                background:
                  step === i + 1
                    ? orange
                    : step > i + 1
                      ? "#D7EEE8"
                      : "#E2E6EF",
                color:
                  step === i + 1
                    ? "white"
                    : step > i + 1
                      ? "#16A34A"
                      : "#64748B",
              }}
            >
              {step > i + 1 ? "✓ " : ""}
              {i + 1}. {label}
            </div>
          ))}
        </div>
      )}
      <div ref={content} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <p role="status" className="py-10 text-center text-xs text-slate-500">
            Loading verification details…
          </p>
        ) : submitted ? (
          <div className="mx-auto max-w-xl space-y-5 py-3 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-300 bg-amber-50">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
            <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[8px] font-black text-amber-800">
              ●{" "}
              {application.status === "approved"
                ? "ADMIN APPROVED"
                : "PENDING ADMIN CONFIRMATION"}
            </span>
            <h1 className="mx-auto max-w-[260px] text-[20px] font-black leading-snug">
              {application.status === "approved"
                ? "Application Approved"
                : "Application Pending Verification"}
            </h1>
            <p className="px-2 text-[12px] leading-relaxed text-slate-500">
              {application.status === "approved"
                ? "KadaGo Admin has approved your application. Your account can now access hauling operations."
                : "Your application has been submitted to KadaGo Admin. The face capture is simulated for this prototype and does not verify identity."}
            </p>
            <div className={`${card} text-left`}>
              <p className="border-b border-black/10 bg-slate-50 px-4 py-3 text-[9px] font-extrabold text-slate-400">
                APPLICATION PROGRESS
              </p>
              {[
                "Registration Completed",
                "Documents Submitted",
                "Face Capture Simulated",
                application.status === "approved"
                  ? "Admin Review Approved"
                  : "Admin Review Pending",
                "Rider Account Activation",
              ].map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border-b border-black/5 px-4 py-3 text-[11px] font-semibold"
                  style={{
                    color:
                      i < 3 || application.status === "approved"
                        ? "#16A34A"
                        : i === 3
                          ? "#C2410C"
                          : "#94A3B8",
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">
                    {i < 3 || application.status === "approved" ? "✓" : "●"}
                  </span>
                  {label}
                </div>
              ))}
            </div>
            {application.feedback && (
              <p className="text-left text-xs leading-relaxed text-slate-500">
                {application.feedback}
              </p>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {application && (
              <p className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
                {application.feedback ||
                  "Please update your application and resubmit."}
              </p>
            )}
            {step === 1 && (
              <>
                <div>
                  <h1 className="text-[18px] font-black">
                    Vehicle Build &amp; OR/CR Specs
                  </h1>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    Enter vehicle information found in your official LTO
                    Certificate of Registration.
                  </p>
                </div>
                {!application && (
                  <div className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50/70 p-3">
                    <span>💡</span>
                    <div>
                      <p className="text-[10px] font-extrabold text-orange-500">
                        Demo Vehicle Pre-filled
                      </p>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                        Isuzu Elf Dropside N-Series · ABC 1234 · Edit any field
                        to match your vehicle. Attach your documents below.
                      </p>
                    </div>
                  </div>
                )}
                <section className={card}>
                  <h2 className="border-b border-black/10 bg-orange-50/70 px-4 py-3 text-[11px] font-bold text-orange-500">
                    🚚 Vehicle Build Specifications
                  </h2>
                  <div className="grid grid-cols-2 gap-3 p-3">
                    {field("brand", "Make & Brand")}
                    {field("model", "Model & Year")}
                    {field("bodyType", "Body Type")}
                    {field("passengers", "Passenger Capacity", true, "number")}
                    {field("plate", "Plate Number")}
                    {field("orcr", "OR/CR Number")}
                    {field("payload", "Max Payload (kg)", true, "number")}
                    {field("color", "Vehicle Color", false)}
                    <div className="col-span-2">
                      <p className="mb-2 text-[10px] font-semibold text-slate-500">
                        Vehicle Type <span className="text-orange-500">*</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Motorcycle / Scooter",
                          "Sedan / Hatchback",
                          "Van / MPV",
                          "Pickup Truck",
                          "4-Wheel Truck",
                          "Heavy Truck",
                        ].map((type) => (
                          <button
                            type="button"
                            aria-pressed={vehicle.vehicleType === type}
                            key={type}
                            onClick={() =>
                              setVehicle((v) => ({ ...v, vehicleType: type }))
                            }
                            className="rounded-full border border-black/10 px-2.5 py-2 text-[9px] font-bold"
                            style={{
                              background:
                                vehicle.vehicleType === type
                                  ? orange
                                  : "#F1F2F4",
                              color:
                                vehicle.vehicleType === type
                                  ? "white"
                                  : "#64748B",
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      {field(
                        "serviceAreas",
                        "Service cities / provinces (comma separated)",
                      )}
                    </div>
                  </div>
                </section>
                <section className={card}>
                  <h2 className="border-b border-black/10 bg-orange-50/70 px-4 py-3 text-[11px] font-bold text-orange-500">
                    Vehicle &amp; Driver Documents
                  </h2>
                  <div className="space-y-3 p-3">
                    {documents.map((doc) => {
                      const attached = files.find(
                        (file) => file.kind === doc.kind,
                      )
                      return (
                        <label
                          key={doc.kind}
                          className="block rounded-xl border border-black/10 p-3"
                        >
                          <span className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
                            {doc.label}
                            {doc.required ? " *" : " (optional)"}
                            <span
                              className={
                                attached ? "text-green-600" : "text-slate-400"
                              }
                            >
                              {attached ? "✓ Attached" : "Not Uploaded"}
                            </span>
                          </span>
                          {attached && (
                            <p className="mt-1 break-all text-[10px] text-slate-500">
                              {attached.name}
                            </p>
                          )}
                          <input
                            aria-label={doc.label}
                            type="file"
                            accept={
                              doc.kind === "vehiclePhoto"
                                ? "image/jpeg,image/png,image/webp"
                                : "image/jpeg,image/png,image/webp,application/pdf"
                            }
                            disabled={busy}
                            onChange={(e) => {
                              void upload(e.target.files?.[0], doc.kind)
                              e.target.value = ""
                            }}
                            className="mt-2 block w-full min-w-0 text-[10px] text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:font-semibold file:text-orange-700"
                          />
                        </label>
                      )
                    })}
                  </div>
                </section>
              </>
            )}
            {step === 2 && (
              <>
                <div className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50/60 p-3">
                  <span className="text-orange-500">⚠</span>
                  <div>
                    <h1 className="text-[12px] font-extrabold">
                      Face Capture Prototype
                    </h1>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                      This demo simulates face capture so you can test the
                      application flow. It does not use your camera or verify
                      your identity. You have{" "}
                      <strong className="text-orange-500">
                        {Math.max(0, 3 - attempts)} attempts remaining
                      </strong>{" "}
                      out of 3 total.
                    </p>
                  </div>
                </div>
                <div className="py-4">
                  <div className="relative mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-dashed border-orange-400 bg-[#F1F5FF] shadow-[0_0_25px_rgba(29,85,214,0.15)]">
                    <div className="text-center text-slate-400">
                      <svg
                        className="mx-auto mb-2"
                        width="44"
                        height="44"
                        viewBox="0 0 48 48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="24" cy="19" r="8" />
                        <path d="M10 44v-7c0-12 28-12 28 0v7M4 16V4h12m16 0h12v12M4 32v12h12m16 0h12V32" />
                      </svg>
                      <span className="text-[10px]">Prototype Preview</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          attempts > i
                            ? "bg-orange-400"
                            : "border border-black/10 bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-center text-[11px] font-semibold text-slate-500">
                    Attempt {Math.min(attempts + 1, 3)} of 3
                  </p>
                </div>
                <p className="rounded-xl border border-black/10 bg-slate-100 px-3 py-3 text-center text-[10px] text-slate-500">
                  Prototype mode: tap below to simulate a face capture. No
                  camera is used.
                </p>
                {attempts >= 3 && !identity && (
                  <p className="text-xs text-red-600">
                    Face capture could not be saved. Contact KadaGo Admin for
                    assistance before submitting.
                  </p>
                )}
              </>
            )}
            {step === 3 && (
              <>
                <div>
                  <h1 className="text-[18px] font-black">
                    Submit Application for Verification
                  </h1>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    Documents will be sent to the KadaGo Admin Portal for
                    mandatory approval before login.
                  </p>
                </div>
                <section className={card}>
                  <div className="flex items-center gap-3 border-b border-black/10 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-extrabold text-amber-700">
                      DEMO
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-[14px] font-extrabold">
                        {profile.name}
                      </p>
                      <p className="mt-1 break-words text-[10px] text-slate-400">
                        {profile.phone} · {user.email}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-green-600">
                        Prototype face capture simulated (not verified)
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {[
                      ["Vehicle Build", `${vehicle.brand} ${vehicle.model}`],
                      [
                        "Body & Capacity",
                        `${vehicle.bodyType} (${vehicle.passengers} pax)`,
                      ],
                      ["Plate & OR/CR", vehicle.plate],
                      [
                        "Payload Max",
                        `${Number(vehicle.payload).toLocaleString()} kg max`,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <p className="text-[9px] text-slate-400">{label}</p>
                        <p className="mt-0.5 break-words text-[11px] font-extrabold">
                          {value}
                        </p>
                      </div>
                    ))}
                    <div className="col-span-2 flex flex-wrap gap-1.5">
                      {documents
                        .filter((doc) =>
                          files.some((file) => file.kind === doc.kind),
                        )
                        .map((doc) => (
                          <span
                            key={doc.kind}
                            className="rounded-full border border-green-200 bg-green-50 px-2 py-1.5 text-[9px] font-bold text-green-600"
                          >
                            ✓ {doc.label} Attached
                          </span>
                        ))}
                    </div>
                  </div>
                </section>
                <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-600">
                  Prototype identity capture is simulated. Your other
                  application documents will be reviewed by KadaGo Admin before
                  your Rider account can accept bookings. You can check your
                  application status after submission.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <footer className="shrink-0 space-y-2 border-t border-black/10 bg-white px-3 py-3">
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-[11px] leading-relaxed text-red-600"
          >
            {error}
          </p>
        )}
        {submitted ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void checkStatus()
              }}
              className="min-h-12 w-full rounded-xl border border-black/10 bg-slate-100 px-3 py-3 text-[12px] font-bold text-slate-700"
            >
              {busy
                ? "Checking status…"
                : application.status === "approved"
                  ? "Continue to KadaGo"
                  : "View Application Status"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onLogout}
              className="min-h-12 w-full rounded-xl border border-black/10 bg-slate-50 px-3 py-3 text-[12px] font-bold text-slate-500"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={
                loading || busy || (step === 2 && attempts >= 3 && !identity)
              }
              onClick={() => {
                if (step === 1) next()
                else if (step === 2) {
                  void capture()
                } else {
                  void submit()
                }
              }}
              className={footerButton}
              style={{ background: orange }}
            >
              {busy
                ? "Saving…"
                : step === 1
                  ? "Proceed to Face Verification (ID Photo) →"
                  : step === 2
                    ? `Simulate Face Capture (Attempt ${Math.min(attempts + 1, 3)}/3)`
                    : "Submit Documents (Pending Admin Confirmation)"}
            </button>
          </>
        )}
      </footer>
    </div>
  )
}
