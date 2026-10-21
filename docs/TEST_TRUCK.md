# Sample trucks for request KG-HR-0DC89ED0

Created at the user's explicit request for test data on 2026-10-21.

- Operator display name: **KadaGo Hauling Services**
- **Isuzu Elf Closed Van**, **KDG 1001**, **1,000 kg**
- **Isuzu Forward Wing Van**, **KDG 1002**, **3,000 kg**
- **Mitsubishi Canter Closed Van**, **KDG 1003**, **2,000 kg**
- Service areas: **Malaybalay, Bukidnon**
- Registered driver account: **Jhib Rendon**
- Truck verification and operator application approval: **test fixtures only**; no real vehicle or identity documents were verified.

The fixture is stored in the normal `trucks` and `operatorApplications` collections so the existing inventory, matching, and assignment APIs can use it. Both records have `isTestData: true` and a `testFixtureKey`. The application has no document uploads and explicitly describes the test approval. The driver's credentials and user record were not changed. Authentication derives driver approval from the application record; sign out and back in if an existing driver session still shows Pending.

Initial setup script: `node backend/scripts/seed-test-truck.mjs`. It targets the existing registered driver and request and refuses to overwrite a real application or unrelated truck. It never runs at app startup.

The user subsequently requested three trucks and removal of visible TEST labels. `node backend/scripts/prepare-sample-trucks.mjs` renamed the original truck and its saved booking assignment, and added the two reserves. All three retain sample-data metadata; plates are invented. It preserves existing assignment status and availability. At verification, KDG 1001 had an active assignment, while KDG 1002 and KDG 1003 both passed matching and were available. All three are linked to the same driver account; this does not create additional drivers. Declining an operator excludes that operator's other trucks from the same request under the existing matching rules.

Validation used the actual MongoDB inventory API and frontend matching function. Approval succeeded against an isolated copy of the request through the normal booking handler, and the driver could retrieve that assignment. Temporary test collections were removed. The original request's version and assignment remained unchanged.

Refresh Admin to see normal names on the current assignment. Available reserve trucks can match other requests meeting their capacity, route, equipment, and approval checks. These remain synthetic vehicles for testing.

To remove this sample inventory and its fixture application:

```powershell
node backend/scripts/seed-test-truck.mjs --remove
```

Removal refuses while the test truck has an active assignment. Complete or cancel that booking first. Removing the fixture application returns this account to Pending unless a real application replaces it. The driver account and booking history are retained.
