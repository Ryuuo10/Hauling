# Fleet portal test access

Created at the user's request on 2026-10-21.

- Login email: `fleet@kadago.local`
- Role: `fleet`
- Display name: Fleet Test Manager
- Sample business: KadaGo Sample Fleet
- The generated password is shared in the chat, stored only as a salted hash in MongoDB, and not committed to source files.

`backend/scripts/create-test-fleet.mjs` provisions a sample user and an approved Fleet application. Both carry `isTestData` and `testFixtureKey` metadata. The application contains no verified real documents or registered trucks; approval exists only to allow user-authorized portal testing. The script refuses to overwrite an existing account or reset its credentials.

Open Fleet Operator from the landing page, enter the email and password, and follow the existing terms and identity verification screens. The Fleet login itself offers email and password only, without the account-type selector or Google button. Customer and Driver sign-in choices remain in place.

Validation: password login, Fleet session restoration, and logout passed through the actual authentication middleware using the MongoDB account. TypeScript, production build, and all 21 authentication/environment tests passed. The Fleet login was checked at 320, 384, and 768 pixels with no horizontal page overflow.

This account does not transfer Jhib Rendon's three sample trucks into Fleet ownership. The main Fleet dashboard still contains its existing sample drivers, vehicles, jobs, earnings, and map. The separate Manage trucks registry uses database records and starts empty for this new account.
