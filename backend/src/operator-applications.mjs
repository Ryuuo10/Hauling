import { ObjectId } from "mongodb"

const fail = (status, message) => {
  throw Object.assign(new Error(message), { status })
}
const text = (value, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : ""
const required = (value, label) =>
  text(value) || fail(400, `${label} is required.`)
const operator = (role) => ["rider", "fleet"].includes(role)
export const applicationKey = (userId, role) => `${userId}-${role}`
export async function operatorStatus(db, user, role = user.role) {
  if (!operator(role)) return user.verificationStatus
  const application = await db
    .collection("operatorApplications")
    .findOne({ _id: applicationKey(user._id, role) })
  return application?.status || "pending"
}
const kinds = [
  "license",
  "identity",
  "clearance",
  "orcr",
  "vehiclePhoto",
  "insurance",
  "registration",
  "permit",
]
const publicApplication = (value) =>
  value && { ...value, id: value._id, _id: undefined }
async function body(req, limit = 20000) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    fail(415, "Send JSON data.")
  let raw = ""
  for await (const chunk of req) {
    raw += chunk
    if (Buffer.byteLength(raw) > limit)
      fail(413, "File or request is too large.")
  }
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw Error()
    return value
  } catch {
    fail(400, "Invalid request data.")
  }
}

export function createOperatorApplicationsApi({
  getDb,
  getUser,
  checkMutation,
}) {
  return async (req, res, next) => {
    const path = (req.url || "").split("?")[0]
    if (!/^\/api\/operator-(applications|documents)(\/|$)/.test(path))
      return next()
    const send = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      })
      res.end(JSON.stringify(data))
    }
    try {
      const user = await getUser(req)
      if (!user) fail(401, "Please log in to continue.")
      if (!["GET", "POST"].includes(req.method))
        fail(405, "Method not allowed.")
      if (req.method !== "GET") checkMutation(req)
      const db = await getDb()
      const applications = db.collection("operatorApplications"),
        documents = db.collection("operatorDocuments")
      const userId = user._id.toString()
      const key = applicationKey(userId, user.role)
      const fileRoute = path.match(
        /^\/api\/operator-documents\/([a-f0-9]{24})$/,
      )
      if (fileRoute && req.method === "GET") {
        const file = await documents.findOne({
          _id: new ObjectId(fileRoute[1]),
        })
        if (
          !file ||
          (user.role !== "admin" &&
            (file.userId !== userId || file.role !== user.role))
        )
          fail(404, "Document not found.")
        res.writeHead(200, {
          "Content-Type": file.mime,
          "Content-Disposition": `inline; filename="${file.name.replace(/[^A-Za-z0-9._-]/g, "_")}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; sandbox",
        })
        return res.end(Buffer.from(file.data, "base64"))
      }
      if (path === "/api/operator-documents" && req.method === "POST") {
        if (!operator(user.role))
          fail(403, "Only operators can upload application documents.")
        const application = await applications.findOne({ _id: key })
        if (application && ["pending", "approved"].includes(application.status))
          fail(409, "This application is already submitted.")
        const value = await body(req, 2900000)
        if (!kinds.includes(value.kind))
          fail(400, "Choose a valid document type.")
        const match =
          typeof value.data === "string" &&
          value.data.match(
            /^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/,
          )
        if (!match) fail(400, "Upload a JPEG, PNG, WebP, or PDF file.")
        const bytes = Buffer.from(match[2], "base64")
        const mime = match[1]
        const valid =
          mime === "application/pdf"
            ? bytes.subarray(0, 5).toString() === "%PDF-"
            : mime === "image/jpeg"
              ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
              : mime === "image/png"
                ? bytes
                    .subarray(0, 8)
                    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
                : bytes.subarray(0, 4).toString() === "RIFF" &&
                  bytes.subarray(8, 12).toString() === "WEBP"
        if (!valid || !bytes.length || bytes.length > 2000000)
          fail(400, "Choose a valid file under 2 MB.")
        if (
          ["identity", "vehiclePhoto"].includes(value.kind) &&
          mime === "application/pdf"
        )
          fail(400, "Upload a photo for this field.")
        const recent = await documents.countDocuments({
          userId,
          createdAt: { $gte: new Date(Date.now() - 3600000).toISOString() },
        })
        if (recent >= 40)
          fail(429, "Too many uploads. Please try again in an hour.")
        const file = {
          _id: new ObjectId(),
          userId,
          role: user.role,
          kind: value.kind,
          name: required(value.name, "Filename"),
          mime,
          data: match[2],
          createdAt: new Date().toISOString(),
        }
        await documents.insertOne(file)
        return send(201, {
          document: {
            id: file._id.toString(),
            name: file.name,
            kind: file.kind,
          },
        })
      }
      if (path === "/api/operator-applications/me") {
        if (!operator(user.role))
          fail(403, "Only operators have an application.")
        const previous = await applications.findOne({ _id: key })
        if (req.method === "GET")
          return send(200, { application: publicApplication(previous) })
        if (previous && ["pending", "approved"].includes(previous.status))
          return send(200, { application: publicApplication(previous) })
        const value = await body(req)
        const profile = {
          name: required(value.profile?.name, "Name"),
          phone: required(value.profile?.phone, "Mobile number"),
          address: required(value.profile?.address, "Address"),
          businessName: text(value.profile?.businessName),
          emergencyContact: text(value.profile?.emergencyContact),
          emergencyPhone: text(value.profile?.emergencyPhone),
        }
        if (!/^(?:\+?63|0)9\d{9}$/.test(profile.phone.replace(/[\s()-]/g, "")))
          fail(400, "Enter a valid Philippine mobile number.")
        if (user.role === "fleet" && !profile.businessName)
          fail(400, "Business name is required.")
        const truck = {
          make: required(value.truck?.make, "Truck make / model"),
          plate: required(value.truck?.plate, "Plate number").toUpperCase(),
          bodyType: required(value.truck?.bodyType, "Body type"),
          payloadKg: Number(value.truck?.payloadKg),
          serviceAreas: required(value.truck?.serviceAreas, "Service areas"),
        }
        // Preserve the original certification form's vehicle specifications.
        // Optional fields keep existing application clients compatible.
        const vehicleDetails = {}
        for (const field of ["brand", "model", "orcr", "color", "vehicleType"]) {
          if (value.truck?.[field] !== undefined)
            vehicleDetails[field] = text(value.truck[field], 200)
        }
        if (value.truck?.passengerCapacity !== undefined) {
          const passengers = value.truck.passengerCapacity
          if (!Number.isInteger(passengers) || passengers < 0 || passengers > 100)
            fail(400, "Enter a valid passenger capacity.")
          vehicleDetails.passengerCapacity = passengers
        }
        Object.assign(truck, vehicleDetails)
        if (
          !Number.isFinite(truck.payloadKg) ||
          truck.payloadKg <= 0 ||
          truck.payloadKg > 1000000
        )
          fail(400, "Enter a valid truck payload.")
        const submitted = []
        if (
          !Array.isArray(value.documents) ||
          value.documents.length > kinds.length
        )
          fail(400, "Upload your verification documents.")
        for (const item of value.documents) {
          if (
            !kinds.includes(item.kind) ||
            !/^[a-f0-9]{24}$/.test(item.id || "")
          )
            fail(400, "Invalid application document.")
          const file = await documents.findOne({
            _id: new ObjectId(item.id),
            userId,
            role: user.role,
            kind: item.kind,
          })
          if (!file || submitted.some((other) => other.kind === item.kind))
            fail(400, "Upload your own documents, once per document type.")
          submitted.push({
            id: file._id.toString(),
            kind: file.kind,
            name: file.name,
          })
        }
        if (
          ["license", "identity", "orcr", "vehiclePhoto"].some(
            (kind) => !submitted.some((file) => file.kind === kind),
          )
        )
          fail(
            400,
            "Upload your license, identity photo, OR/CR, and truck photo.",
          )
        const trucks = db.collection("trucks")
        await trucks.createIndexes([{ key: { plate: 1 }, unique: true }])
        let vehicle = await trucks.findOne({ plate: truck.plate })
        if (vehicle && vehicle.ownerId !== userId)
          fail(
            409,
            "This plate is registered to another account. Contact Dispatch.",
          )
        if (!vehicle) {
          vehicle = {
            _id: new ObjectId(),
            ownerId: userId,
            business: profile.businessName || profile.name,
            driver: profile.name,
            truck: truck.make,
            bodyType: truck.bodyType,
            plate: truck.plate,
            payloadKg: truck.payloadKg,
            areas: truck.serviceAreas
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            equipment: [],
            ...vehicleDetails,
            verified: false,
            available: true,
            createdAt: new Date().toISOString(),
          }
          try {
            await trucks.insertOne(vehicle)
          } catch (error) {
            if (error.code === 11000)
              fail(
                409,
                "Truck registration changed. Please try submitting again.",
              )
            throw error
          }
        } else if (!vehicle.verified) {
          await trucks.updateOne(
            { _id: vehicle._id, ownerId: userId, verified: false },
            {
              $set: {
                business: profile.businessName || profile.name,
                driver: profile.name,
                truck: truck.make,
                bodyType: truck.bodyType,
                payloadKg: truck.payloadKg,
                ...vehicleDetails,
                areas: truck.serviceAreas
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
              },
            },
          )
        }
        const application = {
          _id: key,
          userId,
          role: user.role,
          email: user.email,
          profile,
          truck,
          truckId: vehicle._id.toString(),
          documents: submitted,
          status: "pending",
          feedback: "",
          submittedAt: new Date().toISOString(),
          version: (previous?.version || 0) + 1,
          reviewedAt: null,
          reviewedBy: null,
        }
        if (previous) {
          const { _id, ...change } = application
          const result = await applications.updateOne(
            { _id: key, version: previous.version, status: previous.status },
            { $set: change },
          )
          if (!result.modifiedCount)
            fail(409, "The application changed. Refresh and try again.")
        } else {
          try {
            await applications.insertOne(application)
          } catch (error) {
            if (error.code === 11000)
              fail(
                409,
                "The application was already submitted. Refresh its status.",
              )
            throw error
          }
        }
        return send(201, { application: publicApplication(application) })
      }
      if (path === "/api/operator-applications" && req.method === "GET") {
        if (user.role !== "admin")
          fail(403, "Only Admin can review applications.")
        return send(200, {
          applications: (
            await applications
              .find({})
              .sort({ submittedAt: -1 })
              .limit(500)
              .toArray()
          ).map(publicApplication),
        })
      }
      const review = path.match(
        /^\/api\/operator-applications\/([a-f0-9]{24}-(?:rider|fleet))\/review$/,
      )
      if (review && req.method === "POST") {
        if (user.role !== "admin")
          fail(403, "Only Admin can review applications.")
        const value = await body(req)
        if (
          !["approved", "rejected", "changes_requested"].includes(value.status)
        )
          fail(400, "Choose a valid review decision.")
        const feedback = text(value.feedback, 2000)
        if (value.status !== "approved" && !feedback)
          fail(400, "Explain what the applicant needs to change.")
        const application = await applications.findOne({ _id: review[1] })
        if (!application) fail(404, "Application not found.")
        const change = {
          status: value.status,
          feedback,
          reviewedAt: new Date().toISOString(),
          reviewedBy: userId,
          version: application.version + 1,
        }
        const result = await applications.updateOne(
          { _id: review[1], status: "pending", version: value.version },
          { $set: change },
        )
        if (!result.modifiedCount)
          fail(
            409,
            "This application was already reviewed or changed. Refresh the queue.",
          )
        return send(200, {
          application: publicApplication({ ...application, ...change }),
        })
      }
      fail(404, "Not found.")
    } catch (error) {
      if (res.headersSent) return res.end()
      send(error.status || 503, {
        error: error.status
          ? error.message
          : "The application service is unavailable. Please try again.",
      })
    }
  }
}
