import { useEffect, useRef, useState } from "react"

import type { AuthUser } from "@/api/auth"

import { auth } from "@/api/auth"

import { bookingsApi } from "@/api/bookings"

import {
  applicationDocumentLabels,
  applicationStatusLabel,
  operatorApplications,
} from "@/api/operatorApplications"

import type {
  ApplicationSubmission,
  OperatorApplication,
} from "@/api/operatorApplications"

import OperatorHeader from "./OperatorHeader"

export default function OperatorApplicationScreen({
  user,
  onApproved,
  onLogout,
}: {
  user: AuthUser
  onApproved: (user: AuthUser) => void
  onLogout: () => void
}) {
  const [application, setApplication] = useState<OperatorApplication | null>(
    null,
  )

  const [form, setForm] = useState<ApplicationSubmission>({
    profile: {
      name: user.name,
      phone: "",
      address: "",
      businessName: "",
      emergencyContact: "",
      emergencyPhone: "",
    },
    truck: {
      make: "",
      plate: "",
      bodyType: "Wing Van",
      payloadKg: 0,
      serviceAreas: "",
    },
    documents: [],
  })

  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("")

  const [editing, setEditing] = useState(false),
    [confirmed, setConfirmed] = useState(false)

  const uploadLock = useRef(false),
    submitLock = useRef(false)

  const refresh = async () => {
    const result = await operatorApplications.mine()
    setApplication(result.application)
    return result.application
  }

  useEffect(() => {
    let active = true

    void Promise.all([operatorApplications.mine(), bookingsApi.profile()])
      .then(([result, { profile }]) => {
        if (!active) return

        setApplication(result.application)

        setForm(
          result.application
            ? {
                profile: result.application.profile,
                truck: result.application.truck,
                documents: result.application.documents,
              }
            : {
                profile: {
                  name: profile.contactName || user.name,
                  phone: profile.contactPhone || profile.phone,
                  address: profile.address || "",
                  businessName: profile.businessName || "",
                  emergencyContact: profile.emergencyContact || "",
                  emergencyPhone: profile.emergencyPhone || "",
                },
                truck: {
                  make: "",
                  plate: "",
                  bodyType: "Wing Van",
                  payloadKg: 0,
                  serviceAreas: "",
                },
                documents: [],
              },
        )
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
  }, [user.id, user.role])

  useEffect(() => {
    if (!application || application.status !== "pending") return

    let active = true

    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return
      void operatorApplications
        .mine()
        .then((result) => {
          if (active) setApplication(result.application)
        })
        .catch(() => undefined)
    }, 10000)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [application?.status, user.id, user.role])

  const upload = async (file: File | undefined, kind: string) => {
    if (!file || uploadLock.current || submitLock.current) return

    uploadLock.current = true
    setBusy(true)
    setError("")

    try {
      const { document } = await operatorApplications.upload(file, kind)
      setForm((value) => ({
        ...value,
        documents: [
          ...value.documents.filter((item) => item.kind !== kind),
          document,
        ],
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.")
    } finally {
      uploadLock.current = false
      setBusy(false)
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!confirmed || submitLock.current || uploadLock.current) return

    submitLock.current = true
    setBusy(true)
    setError("")

    try {
      const result = await operatorApplications.submit(form)
      setApplication(result.application)
      setEditing(false)
      setConfirmed(false)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not submit your application.",
      )
    } finally {
      submitLock.current = false
      setBusy(false)
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"

  const field = (
    key: keyof ApplicationSubmission["profile"],
    label: string,
    required = true,
  ) => (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      {required ? " *" : ""}
      <input
        required={required}
        value={form.profile[key]}
        onChange={(e) =>
          setForm((value) => ({
            ...value,
            profile: { ...value.profile, [key]: e.target.value },
          }))
        }
        className={inputClass}
      />
    </label>
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <OperatorHeader
        title="Operator Application"
        subtitle="Submit your details for Admin approval"
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-2xl space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {loading ? (
            <p role="status" className="py-10 text-center text-sm">
              Loading application…
            </p>
          ) : application && !editing ? (
            <>
              <section className="rounded-2xl border bg-white p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                  {applicationStatusLabel[application.status]}
                </p>
                <h1 className="mt-3 text-xl font-black">
                  {application.status === "approved"
                    ? "Your account is approved"
                    : application.status === "pending"
                      ? "Application submitted"
                      : "Your application needs attention"}
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  {application.status === "pending"
                    ? "Admin received your application and files. You can access hauling operations after approval. This page checks for updates automatically."
                    : application.status === "approved"
                      ? "You can now open your portal. Truck verification is handled separately by Dispatch."
                      : "Review Admin’s feedback below and update your application before submitting again."}
                </p>
                {application.feedback && (
                  <div className="mt-4 rounded-xl bg-orange-50 p-3 text-left text-sm">
                    <p className="font-bold">Admin feedback</p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {application.feedback}
                    </p>
                  </div>
                )}
                <p className="mt-4 text-xs text-slate-500">
                  Submitted:{" "}
                  {new Date(application.submittedAt).toLocaleString("en-PH")}
                </p>
              </section>
              <section className="rounded-2xl border bg-white p-4">
                <h2 className="font-bold">Submitted documents</h2>
                <ul className="mt-2 space-y-2">
                  {application.documents.map((file) => (
                    <li
                      key={file.kind}
                      className="break-words text-xs text-slate-600"
                    >
                      <a
                        className="text-blue-700 underline"
                        href={`/api/operator-documents/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {applicationDocumentLabels[file.kind]}: {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              {application.status === "approved" ? (
                <button
                  disabled={busy}
                  onClick={() => {
                    setBusy(true)
                    setError("")
                    void auth
                      .session()
                      .then(({ user: current }) => {
                        if (
                          !current ||
                          current.id !== user.id ||
                          current.role !== user.role ||
                          current.verificationStatus !== "approved"
                        )
                          throw Error("Please sign in again to continue.")
                        onApproved(current)
                      })
                      .catch((e) => setError(e.message))
                      .finally(() => setBusy(false))
                  }}
                  className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white"
                >
                  Open My Portal
                </button>
              ) : (
                application.status !== "pending" && (
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white"
                  >
                    Update and Resubmit
                  </button>
                )
              )}
              <button
                disabled={busy}
                onClick={() => {
                  setError("")
                  void refresh().catch((e) => setError(e.message))
                }}
                className="w-full rounded-xl border bg-white py-3 text-sm font-bold"
              >
                Refresh Status
              </button>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <section className="space-y-3 rounded-2xl border bg-white p-4">
                <h1 className="text-base font-black">Contact details</h1>
                <p className="break-all text-xs text-slate-500">
                  Account: {user.email}
                </p>
                {field("name", "Full name")}
                {field("phone", "Mobile number (09… or +639…)")}
                {field("address", "Address")}
                {user.role === "fleet" &&
                  field("businessName", "Business name")}
                {field("emergencyContact", "Emergency contact", false)}
                {field("emergencyPhone", "Emergency contact number", false)}
              </section>
              <section className="space-y-3 rounded-2xl border bg-white p-4">
                <h2 className="font-black">Truck details</h2>
                <p className="text-xs text-slate-500">
                  These details are reviewed with your application. They do not
                  automatically verify a truck.
                </p>
                {([
                  ["make", "Truck make / model"],
                  ["plate", "Plate number"],
                  ["bodyType", "Body type"],
                  ["serviceAreas", "Service areas"],
                ] as const).map(([key, label]) => (
                  <label
                    key={key}
                    className="block text-xs font-semibold text-slate-600"
                  >
                    {label} *
                    <input
                      required
                      value={form.truck[key]}
                      onChange={(e) =>
                        setForm((value) => ({
                          ...value,
                          truck: { ...value.truck, [key]: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
                <label className="block text-xs font-semibold text-slate-600">
                  Payload capacity (kg) *
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    required
                    value={form.truck.payloadKg || ""}
                    onChange={(e) =>
                      setForm((value) => ({
                        ...value,
                        truck: {
                          ...value.truck,
                          payloadKg: Number(e.target.value),
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              </section>
              <section className="space-y-3 rounded-2xl border bg-white p-4">
                <h2 className="font-black">Verification documents</h2>
                <p className="text-xs text-slate-500">
                  Upload clear files under 2 MB each. Identity photos are
                  reviewed manually by Admin; this is not automated face
                  verification.
                </p>
                {Object.entries(applicationDocumentLabels)
                  .filter(
                    ([kind]) =>
                      user.role === "fleet" ||
                      !["registration", "permit"].includes(kind),
                  )
                  .map(([kind, label]) => {
                    const file = form.documents.find(
                      (item) => item.kind === kind,
                    )
                    const required = [
                      "license",
                      "identity",
                      "orcr",
                      "vehiclePhoto",
                    ].includes(kind)
                    return (
                      <label
                        key={kind}
                        className="block rounded-xl border border-slate-200 p-3 text-xs font-semibold"
                      >
                        {label}
                        {required ? " *" : " (optional)"}
                        {file && (
                          <span className="mt-1 block break-all font-normal text-green-700">
                            Uploaded: {file.name}
                          </span>
                        )}
                        <input
                          type="file"
                          accept={
                            ["identity", "vehiclePhoto"].includes(kind)
                              ? "image/jpeg,image/png,image/webp"
                              : "image/jpeg,image/png,image/webp,application/pdf"
                          }
                          disabled={busy}
                          className="mt-2 block w-full text-xs"
                          onChange={(e) => {
                            void upload(e.target.files?.[0], kind)
                            e.target.value = ""
                          }}
                        />
                      </label>
                    )
                  })}
              </section>
              <label className="flex items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                I confirm these details and documents are mine and are accurate.
                I understand that Admin must approve my application.
              </label>
              <button
                disabled={busy || !confirmed}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Submit Application to Admin"}
              </button>
            </form>
          )}
          <button
            disabled={busy}
            onClick={onLogout}
            className="w-full rounded-xl border bg-white py-3 text-sm font-semibold text-slate-600"
          >
            Sign Out / Return to Login
          </button>
        </div>
      </div>
    </div>
  )
}
