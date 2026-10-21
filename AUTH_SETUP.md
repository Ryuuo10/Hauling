# KadaGo authentication setup

Credentials are loaded only by the Node server from the ignored `backend/.env` file.
The Google client ID is public; the MongoDB URI/password must never use a `VITE_` prefix or be placed in `frontend/src`.

## Local development

1. Install packages with `npm install`.
2. Use `backend/.env.example` as the template for `backend/.env`. Replace `MONGODB_PASSWORD` with the rotated password from Atlas. Values set by the deployment environment override this file.
3. In Google Cloud Console, open the supplied **Web application** OAuth client and add `http://localhost:8443` to **Authorized JavaScript origins**. Configure the consent screen and test users if the app is in testing. The button uses a popup and a JavaScript credential callback; a client secret is not required.
4. In Atlas Network Access, allow the IP of the machine running Node. The browser never connects to Atlas directly. Use a database user with read/write access to the `kadago` database rather than Atlas-wide administration for ongoing use.
5. Start or restart Vite with `npm run dev`. Its server plugin handles `/api/auth/*` on the same port, so a separate API process is unnecessary during development.

Run `npm run check-db` to perform a read-only connection check without printing credentials. If the local DNS resolver refuses Atlas SRV/TXT records, the optional `MONGODB_DNS_SERVERS` setting selects a DNS resolver for this Node process only. This workstation uses `1.1.1.1` for those lookups. The current configuration has successfully connected to Atlas.

Keep `<db_password>` in `MONGODB_URI` and set the actual password in `MONGODB_PASSWORD`. When both a separate password and an embedded URI password are present, `MONGODB_PASSWORD` takes precedence so a password update cannot silently use a stale URI credential.

Email/password signup creates a MongoDB account with a salted password hash. Login checks the stored password and role. Google ID tokens are verified by the Node server before an account or session is created. Sessions use HTTP-only cookies and hashed tokens stored in MongoDB with expiration. Cross-origin mutation requests are rejected and mutation requests require a CSRF token.

Public registration allows Customer, Truck Operator, and Fleet accounts. Admin accounts cannot be created through public signup. To provision one, temporarily set `ADMIN_EMAIL`, `ADMIN_NAME`, and a strong `ADMIN_PASSWORD` in `backend/.env`, run `npm run create-admin`, then remove `ADMIN_PASSWORD` from the file. Existing accounts are never promoted by this command.

## Running the built app

Run `npm run build`, then `npm start`. Node serves both `dist` and the authentication API on `API_PORT` (default 3001). Set `APP_ORIGIN` to the exact public origin, including a non-default port, and add that origin to Google's authorized JavaScript origins. For an Internet deployment, use HTTPS with `APP_ORIGIN=https://your-domain`. Static-only hosting needs a separately hosted backend; uploading `dist` alone does not provide authentication.

## Booking workflow and current limits

Customer hauling requests, profiles, registered trucks, truck verification, dispatch assignment, quotations, agreement confirmation, trip events, evidence uploads, delivery confirmation, payment records, issue reports, and ratings are persisted in MongoDB. Customers can view only their own requests; dispatch and operators see requests assigned to their accounts. Operators must register a truck and an Admin must verify it before it can be assigned.

Location tracking is not live GPS yet. Payment records are verified by an Admin or operator; the app does not charge a card or connect to a payment gateway. Camera/document-based identity verification and some non-booking portal sections remain prototype features. The existing face flow is an interface demonstration, not an authentication factor.

References: [Google token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token), [Google button setup](https://developers.google.com/identity/gsi/web/guides/display-button), [MongoDB Node driver](https://www.mongodb.com/docs/drivers/node/current/get-started/), [Vite environment variables](https://vite.dev/guide/env-and-mode).
