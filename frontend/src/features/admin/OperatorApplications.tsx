import { useEffect, useRef, useState } from "react"
import {
  applicationDocumentLabels,
  applicationStatusLabel,
  operatorApplications,
} from "@/api/operatorApplications"
import type { OperatorApplication } from "@/api/operatorApplications"
import OperatorHeader from "@/features/operator/OperatorHeader"

export default function OperatorApplications({
  onBack,
}: {
  onBack: () => void
}) {
  const [applications, setApplications] = useState<OperatorApplication[]>([]),
    [filter, setFilter] = useState<OperatorApplication["status"]>("pending")
  const [selectedId, setSelectedId] = useState<string | null>(null),
    [feedback, setFeedback] = useState("")
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const selected = applications.find((item) => item.id === selectedId)
  const refresh = async () => {
    const value = await operatorApplications.list()
    setApplications(value.applications)
  }
  useEffect(() => {
    let active = true
    const update = () => {
      if (lock.current) return
      void operatorApplications
        .list()
        .then((result) => {
          if (active) {
            setApplications(result.applications)
            setError("")
          }
        })
        .catch((e) => {
          if (active) setError(e.message)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }
    update()
    const timer = window.setInterval(update, 10000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])
  const review = async (status: OperatorApplication["status"]) => {
    if (!selected || lock.current) return
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const result = await operatorApplications.review(
        selected,
        status,
        feedback,
      )
      setApplications((items) =>
        items.map((item) =>
          item.id === result.application.id ? result.application : item,
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed.")
      try {
        await refresh()
      } catch {
        /* Keep the review error visible. */
      }
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <OperatorHeader
        title="Operator Applications"
        subtitle="Review driver and trucking business registrations"
        onBack={selected ? () => setSelectedId(null) : onBack}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mx-auto max-w-3xl space-y-3">
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
              <button
                className="ml-3 underline"
                onClick={() => {
                  void refresh()
                    .then(() => setError(""))
                    .catch((e) => setError(e.message))
                }}
              >
                Retry
              </button>
            </p>
          )}
          {loading ? (
            <p role="status">Loading applications…</p>
          ) : selected ? (
            <>
              <section className="space-y-2 rounded-2xl border bg-white p-4">
                <p className="text-xs font-bold text-orange-700">
                  {applicationStatusLabel[selected.status]}
                </p>
                <h1 className="text-lg font-black">{selected.profile.name}</h1>
                <p className="break-all text-sm">{selected.email}</p>
                <p className="text-sm">
                  {selected.role === "rider"
                    ? "Individual Driver"
                    : "Trucking Business"}
                  {selected.profile.businessName
                    ? ` · ${selected.profile.businessName}`
                    : ""}
                </p>
                <p className="text-sm">{selected.profile.phone}</p>
                <p className="text-sm">{selected.profile.address}</p>
                <p className="text-xs text-slate-500">
                  Submitted:{" "}
                  {new Date(selected.submittedAt).toLocaleString("en-PH")}
                </p>
                {selected.profile.emergencyContact && (
                  <p className="text-sm">
                    Emergency: {selected.profile.emergencyContact} ·{" "}
                    {selected.profile.emergencyPhone}
                  </p>
                )}
              </section>
              <section className="space-y-2 rounded-2xl border bg-white p-4">
                <h2 className="font-bold">Truck information</h2>
                <p className="text-sm">
                  {selected.truck.make} · {selected.truck.plate}
                </p>
                <p className="text-sm">
                  {selected.truck.bodyType} ·{" "}
                  {selected.truck.payloadKg.toLocaleString()} kg
                </p>
                <p className="text-sm">
                  Service areas: {selected.truck.serviceAreas}
                </p>
              </section>
              <section className="space-y-3 rounded-2xl border bg-white p-4">
                <h2 className="font-bold">Uploaded documents</h2>
                <p className="text-xs text-slate-500">
                  Review the license, identity photo, and truck documents before
                  approving. Identity is checked manually.
                </p>
                {selected.documents.map((file) => (
                  <a
                    className="block break-words text-sm text-blue-700 underline"
                    key={file.id}
                    href={`/api/operator-documents/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {applicationDocumentLabels[file.kind]} — {file.name}
                  </a>
                ))}
              </section>
              {selected.feedback && (
                <p className="whitespace-pre-wrap rounded-xl border bg-white p-3 text-sm">
                  Admin feedback: {selected.feedback}
                </p>
              )}
              {selected.status === "pending" && (
                <section className="space-y-3 rounded-2xl border bg-white p-4">
                  <label className="block text-xs font-bold">
                    Feedback (required for rejection or changes)
                    <textarea
                      disabled={busy}
                      value={feedback}
                      maxLength={2000}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="mt-2 w-full rounded-xl border p-3 text-sm"
                      rows={3}
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button
                      disabled={busy}
                      onClick={() => {
                        void review("approved")
                      }}
                      className="rounded-xl bg-green-600 px-3 py-3 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Approve Account
                    </button>
                    <button
                      disabled={busy || !feedback.trim()}
                      onClick={() => {
                        void review("changes_requested")
                      }}
                      className="rounded-xl bg-orange-500 px-3 py-3 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Request Changes
                    </button>
                    <button
                      disabled={busy || !feedback.trim()}
                      onClick={() => {
                        void review("rejected")
                      }}
                      className="rounded-xl bg-red-600 px-3 py-3 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Reject Application
                    </button>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(
                  applicationStatusLabel,
                ) as OperatorApplication["status"][]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`rounded-xl border p-2 text-xs font-bold ${
                      filter === status
                        ? "bg-orange-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    {applicationStatusLabel[status]} (
                    {
                      applications.filter((item) => item.status === status)
                        .length
                    }
                    )
                  </button>
                ))}
              </div>
              {applications
                .filter((item) => item.status === filter)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id)
                      setFeedback("")
                    }}
                    className="block w-full rounded-2xl border bg-white p-4 text-left"
                  >
                    <p className="text-sm font-bold">{item.profile.name}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {item.email} ·{" "}
                      {item.role === "rider" ? "Driver" : "Trucking Business"}
                    </p>
                    <p className="mt-2 text-xs font-bold text-orange-600">
                      Review Application →
                    </p>
                  </button>
                ))}
              {!applications.some((item) => item.status === filter) && (
                <p className="rounded-xl border bg-white p-6 text-center text-sm text-slate-500">
                  No applications with this status.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
