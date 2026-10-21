import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { ObjectId } from "mongodb"
import { createAuthApi } from "../src/auth.mjs"

function memoryDatabase() {
  const tables = new Map()
  const matches = (record, query) =>
    Object.entries(query).every(([key, value]) => {
      const actual = key.split(".").reduce((item, part) => item?.[part], record)
      if (value && typeof value === "object" && "$gt" in value)
        return actual > value.$gt
      if (value && typeof value === "object" && "$gte" in value)
        return actual >= value.$gte
      if (value && typeof value === "object" && "$ne" in value)
        return String(actual) !== String(value.$ne)
      return String(actual) === String(value)
    })
  return {
    collection(name) {
      if (!tables.has(name)) tables.set(name, [])
      const records = tables.get(name)
      return {
        records,
        async createIndexes() {},
        async findOne(query) {
          return records.find((record) => matches(record, query)) || null
        },
        find(query = {}) {
          return {
            sort() {
              return this
            },
            limit() {
              return this
            },
            async toArray() {
              return records.filter((record) => matches(record, query))
            },
          }
        },
        async countDocuments(query) {
          return records.filter((record) => matches(record, query)).length
        },
        async insertOne(record) {
          record._id ||= new ObjectId()
          if (
            records.some(
              (item) =>
                String(item._id) === String(record._id) ||
                (name === "trucks" && item.plate === record.plate),
            )
          )
            throw Object.assign(Error("duplicate"), { code: 11000 })
          records.push(record)
          return { insertedId: record._id }
        },
        async deleteOne(query) {
          const i = records.findIndex((record) => matches(record, query))
          if (i >= 0) records.splice(i, 1)
        },
        async updateOne(query, change) {
          const record = records.find((record) => matches(record, query))
          if (!record) return { modifiedCount: 0 }
          Object.assign(record, change.$set || {})
          for (const [key, value] of Object.entries(change.$addToSet || {})) {
            record[key] ||= []
            if (!record[key].includes(value)) record[key].push(value)
          }
          return { modifiedCount: 1 }
        },
      }
    },
  }
}

async function setup(t) {
  const db = memoryDatabase()
  await db
    .collection("users")
    .insertOne({
      email: "admin@example.test",
      googleSub: "admin",
      name: "Admin",
      role: "admin",
    })
  const api = createAuthApi({
    env: {
      GOOGLE_CLIENT_ID: "test-client",
      APP_ORIGIN: "http://localhost:8443",
    },
    getDb: async () => db,
    verifyGoogle: async (credential) => ({
      sub: credential,
      email: `${credential}@example.test`,
      name: credential,
      email_verified: true,
    }),
  })
  const server = createServer((req, res) => {
    void api(req, res)
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections()
        server.close(resolve)
      }),
  )
  const base = `http://127.0.0.1:${server.address().port}/api/`
  async function client(credential, role) {
    const configResponse = await fetch(base + "auth/config")
    const config = await configResponse.json()
    let cookie = configResponse.headers
      .getSetCookie()
      .map((item) => item.split(";")[0])
      .join("; ")
    const call = async (path, value, extra = {}) => {
      const response = await fetch(base + path, {
        method: value === undefined ? "GET" : "POST",
        headers: {
          Origin: "http://localhost:8443",
          Cookie: cookie,
          "Content-Type": "application/json",
          "X-CSRF-Token": config.csrfToken,
          ...extra,
        },
        body: value === undefined ? undefined : JSON.stringify(value),
      })
      const session = response.headers
        .getSetCookie()
        .find((item) => item.startsWith("kg_session="))
      if (session)
        cookie = cookie
          .split("; ")
          .filter((item) => !item.startsWith("kg_session="))
          .concat(session.split(";")[0])
          .join("; ")
      const data = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : await response.arrayBuffer()
      return { response, data }
    }
    assert.equal(
      (await call("auth/google", { credential, role, intent: "signup" }))
        .response.status,
      200,
    )
    return call
  }
  return { db, client }
}

const photo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGJkAAAAASUVORK5CYII="
const submission = {
  profile: {
    name: "New Driver",
    phone: "+639171234567",
    address: "Malaybalay, Bukidnon",
    businessName: "",
    emergencyContact: "Family",
    emergencyPhone: "09181234567",
  },
  truck: {
    make: "Isuzu Elf",
    plate: "APP 1234",
    bodyType: "Dropside",
    payloadKg: 3000,
    serviceAreas: "Bukidnon, Cagayan de Oro",
  },
}
async function uploadDocuments(call) {
  const documents = []
  for (const kind of ["license", "identity", "orcr", "vehiclePhoto"]) {
    const result = await call("operator-documents", {
      kind,
      data: photo,
      name: `${kind}.png`,
    })
    assert.equal(result.response.status, 201, JSON.stringify(result.data))
    documents.push(result.data.document)
  }
  return documents
}

test("driver submits real files, Admin requests changes and approves, and the existing session unlocks", async (t) => {
  const { db, client } = await setup(t)
  const driver = await client("driver", "rider"),
    admin = await client("admin", "admin")
  assert.equal(
    (await driver("operator-applications/me")).data.application,
    null,
  )
  assert.equal((await driver("bookings")).response.status, 403)
  const documents = await uploadDocuments(driver)
  const submitted = await driver("operator-applications/me", {
    ...submission,
    documents,
  })
  assert.equal(submitted.response.status, 201, JSON.stringify(submitted.data))
  const application = submitted.data.application
  assert.equal(application.status, "pending")
  assert.equal(
    (await driver("operator-applications/me", { ...submission, documents }))
      .data.application.version,
    1,
  )
  assert.equal(db.collection("operatorApplications").records.length, 1)
  assert.equal(db.collection("trucks").records[0].verified, false)
  assert.equal(
    (await admin("operator-applications")).data.applications[0].id,
    application.id,
  )
  assert.equal(
    (await admin(`operator-documents/${documents[0].id}`)).response.status,
    200,
  )
  assert.equal(
    (await driver(`operator-documents/${documents[0].id}`)).response.status,
    200,
  )
  const changes = await admin(
    `operator-applications/${application.id}/review`,
    {
      status: "changes_requested",
      feedback: "Please correct your address.",
      version: application.version,
    },
  )
  assert.equal(changes.response.status, 200)
  assert.equal(
    (await driver("operator-applications/me")).data.application.feedback,
    "Please correct your address.",
  )
  assert.equal(
    (await driver("auth/session")).data.user.verificationStatus,
    "changes_requested",
  )
  const resubmit = await driver("operator-applications/me", {
    ...submission,
    profile: { ...submission.profile, address: "Corrected address" },
    documents,
  })
  assert.equal(resubmit.response.status, 201)
  assert.equal(resubmit.data.application.version, 3)
  assert.equal(
    (
      await admin(`operator-applications/${application.id}/review`, {
        status: "approved",
        feedback: "",
        version: 1,
      })
    ).response.status,
    409,
  )
  const approved = await admin(
    `operator-applications/${application.id}/review`,
    { status: "approved", feedback: "Documents reviewed.", version: 3 },
  )
  assert.equal(approved.response.status, 200)
  assert.equal(
    (await driver("auth/session")).data.user.verificationStatus,
    "approved",
  )
  assert.equal((await driver("trucks")).response.status, 200)
  assert.equal((await driver("bookings")).response.status, 200)
  assert.equal(
    (
      await admin(`operator-applications/${application.id}/review`, {
        status: "rejected",
        feedback: "Stale review",
        version: 3,
      })
    ).response.status,
    409,
  )
})

test("original certification vehicle details persist for Admin review without self-verifying a truck", async (t) => {
  const { db, client } = await setup(t)
  const driver = await client("certification-driver", "rider")
  const documents = await uploadDocuments(driver)
  const details = { brand: "Isuzu", model: "Elf 2024", orcr: "OR-123", passengerCapacity: 2, color: "White", vehicleType: "4-Wheel Truck" }
  const invalid = await driver("operator-applications/me", { ...submission, truck: { ...submission.truck, ...details, passengerCapacity: -1 }, documents })
  assert.equal(invalid.response.status, 400)
  const result = await driver("operator-applications/me", { ...submission, truck: { ...submission.truck, ...details }, documents })
  assert.equal(result.response.status, 201, JSON.stringify(result.data))
  for (const [key, value] of Object.entries(details)) {
    assert.equal(result.data.application.truck[key], value)
    assert.equal(db.collection("trucks").records[0][key], value)
  }
  assert.equal(result.data.application.status, "pending")
  assert.equal(db.collection("trucks").records[0].verified, false)
})

test("applicants cannot self-approve, view other applications or files, or bypass CSRF", async (t) => {
  const { client } = await setup(t)
  const driver = await client("driver", "rider"),
    other = await client("other", "rider"),
    customer = await client("customer", "customer"),
    admin = await client("admin", "admin")
  const documents = await uploadDocuments(driver)
  const { data } = await driver("operator-applications/me", {
    ...submission,
    documents,
  })
  assert.equal(
    (
      await driver(`operator-applications/${data.application.id}/review`, {
        status: "approved",
        version: 1,
      })
    ).response.status,
    403,
  )
  assert.equal((await driver("operator-applications")).response.status, 403)
  assert.equal((await customer("operator-applications")).response.status, 403)
  assert.equal(
    (await customer("operator-applications/me")).response.status,
    403,
  )
  assert.equal(
    (await other(`operator-documents/${documents[0].id}`)).response.status,
    404,
  )
  assert.equal(
    (await other("operator-applications/me", { ...submission, documents }))
      .response.status,
    400,
  )
  assert.equal(
    (
      await other(
        "operator-documents",
        { kind: "identity", data: photo, name: "me.png" },
        { "X-CSRF-Token": "" },
      )
    ).response.status,
    403,
  )
  assert.equal(
    (
      await admin(`operator-applications/${data.application.id}/review`, {
        status: "rejected",
        feedback: "",
        version: 1,
      })
    ).response.status,
    400,
  )
  assert.equal(
    (
      await admin(`operator-applications/${data.application.id}/review`, {
        status: "rejected",
        feedback: "License is unreadable.",
        version: 1,
      })
    ).response.status,
    200,
  )
  assert.equal(
    (await driver("auth/session")).data.user.verificationStatus,
    "rejected",
  )
  assert.equal((await driver("bookings")).response.status, 403)
})

test("missing documents, forged file content, and oversized uploads are rejected", async (t) => {
  const { client } = await setup(t)
  const driver = await client("driver", "rider")
  assert.equal(
    (await driver("operator-applications/me", { ...submission, documents: [] }))
      .response.status,
    400,
  )
  assert.equal(
    (
      await driver("operator-documents", {
        kind: "license",
        name: "fake.pdf",
        data:
          "data:application/pdf;base64," +
          Buffer.from("not a pdf").toString("base64"),
      })
    ).response.status,
    400,
  )
  assert.equal(
    (
      await driver("operator-documents", {
        kind: "identity",
        name: "image.pdf",
        data:
          "data:application/pdf;base64," +
          Buffer.from("%PDF-1.4 test").toString("base64"),
      })
    ).response.status,
    400,
  )
  assert.equal(
    (
      await driver("operator-documents", {
        kind: "license",
        name: "big.pdf",
        data:
          "data:application/pdf;base64," +
          Buffer.from("%PDF-" + "x".repeat(2000000)).toString("base64"),
      })
    ).response.status,
    400,
  )
})

test("approval belongs to the selected role and does not approve a different Google role", async (t) => {
  const { client } = await setup(t)
  const driver = await client("same-person", "rider"),
    admin = await client("admin", "admin")
  const documents = await uploadDocuments(driver)
  const { data } = await driver("operator-applications/me", {
    ...submission,
    documents,
  })
  await admin(`operator-applications/${data.application.id}/review`, {
    status: "approved",
    version: 1,
  })
  assert.equal(
    (await driver("auth/session")).data.user.verificationStatus,
    "approved",
  )
  await driver("auth/google", {
    credential: "same-person",
    role: "fleet",
    intent: "signup",
  })
  assert.equal(
    (await driver("auth/session")).data.user.verificationStatus,
    "pending",
  )
  assert.equal(
    (await driver("operator-applications/me")).data.application,
    null,
  )
  assert.equal((await driver("bookings")).response.status, 403)
})
