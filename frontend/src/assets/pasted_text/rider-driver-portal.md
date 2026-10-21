Continue the existing KadaGo mobile app design.

IMPORTANT:
Keep the exact same:
- mobile screen size
- KadaGo logo
- dark navy brand style
- orange Rider / Driver accent color
- green verified and online states
- blue secondary information/actions where appropriate
- red SOS / danger actions
- typography
- rounded cards
- button styles
- spacing
- icon style
- navigation structure
- overall visual consistency

Do not redesign any existing Phase 1–6 screens.

Create PHASE 7: RIDER / DRIVER PORTAL.

This phase is for verified riders and drivers who accept transport, delivery, hauling, and passenger jobs.

==================================================
1. RIDER / DRIVER HOME DASHBOARD
==================================================

Create the main Rider & Driver Portal screen.

Header:
- KadaGo logo
- Label: “Rider & Driver Portal”
- Subtitle:
  “Active Dispatch & Bidding Stream”
- Current location:
  “Malaybalay / QC”
  “Bukidnon • PH”
- SOS button
- Notification bell
- Rider profile avatar

Main rider availability card:

Show:
- Rider photo
- “Maayong Adlaw, Juan!”
- Badge: “VERIFIED PRO”
- Active vehicle:
  “Isuzu Elf Dropside N-Series (ABC 1234)”

Large availability toggle:
“ONLINE • ACCEPTING JOBS”

When offline:
“OFFLINE • NOT ACCEPTING JOBS”

Text:
“Your vehicle is visible to customers in Bukidnon & nearby areas.”

Button:
“Switch Vehicle”

==================================================
2. RIDER PERFORMANCE SUMMARY
==================================================

Create 4 compact performance cards:

TODAY’S NET
₱1,250.00
+₱450 vs yesterday

COMPLETED
245
Total jobs done

RATING
4.9 ★
188 customer reviews

ACCEPTANCE
96%
Response speed: ~1.2m

==================================================
3. ACTIVE ASSIGNMENT CARD
==================================================

Create an Active Assignment section.

Example:

ACTIVE ASSIGNMENT
Job #KG-12389

STATUS:
DRIVER ASSIGNED

Customer:
Maria Santos

Service:
Hardware & Cement

Cargo:
30 Sacks of Portland Cement
1,200 kg

Pickup:
ABC Hardware & Construction Depot, Fortich St.

Destination:
Lot 14 Blk 3, Pinecrest Subdivision,
Brgy. San Jose

Your Earnings:
₱850

Button:
“Open GPS Navigation”

Also add:
- Call Customer
- Chat
- View Job Details

==================================================
4. AVAILABLE JOBS FEED
==================================================

Create section:
“Available Hauling & Delivery Jobs”

Subtitle:
“Jobs matching your active vehicle capacity”

Show:
“4 Nearby Requests”

Each job card should include:
- Service category
- Job ID
- Customer budget
- Item / passenger details
- Cargo weight if applicable
- Pickup
- Destination
- Distance from rider
- Estimated trip distance
- Required vehicle
- Helpers required if applicable

Buttons:
- View Job
- Send Offer

Example job:

CONSTRUCTION
Job #KG-12389

30 Sacks of Portland Cement
30 sacks • 1,200 kg

Pickup:
ABC Hardware & Construction Depot

Drop:
Pinecrest Subdivision

Distance:
3.5 km away

Customer Budget:
₱950

Button:
“Send Offer”

==================================================
5. RIDER JOB DETAILS SCREEN
==================================================

Create a full job details screen.

Include:

JOB INFORMATION
- Job ID
- Service category
- Deliver Now / Scheduled
- Request time

CUSTOMER
- Customer name
- Customer rating
- Verified customer status

PICKUP
- Full address
- Landmark
- Pickup contact
- Contact number
- Pickup instructions

DESTINATION
- Full address
- Landmark
- Recipient
- Contact number
- Delivery / unloading instructions

CARGO / SERVICE DETAILS
Show fields depending on service.

For cargo:
- Description
- Quantity
- Weight
- Cargo photo
- Heavy cargo
- Fragile
- Oversized
- Helpers required

For Ride:
- Number of passengers
- Luggage
- Pickup notes

For Pabili:
- Shopping list
- Store
- Estimated purchase amount

CUSTOMER BUDGET
Example:
₱950

PRICING FLOOR
Example:
Minimum floor ₱500

Buttons:
- Accept Customer Budget
- Send Counter Offer
- Decline Job

Secondary actions:
- Chat Customer
- Call Customer

==================================================
6. SEND OFFER SCREEN
==================================================

Create a rider offer screen.

Title:
“Send Your Offer”

Show request summary:
- Job ID
- Service
- Customer budget
- Minimum pricing floor
- Trip distance

Fields:

Your Offered Price:
₱ ______

Estimated Arrival:
- 5 mins
- 10 mins
- 15 mins
- 20 mins
- Custom

Driver Message:
Example:
“I have 2 assistants ready to help load and unload. I can arrive in 15 minutes.”

Confirm Vehicle:
- Current vehicle
- Vehicle capacity
- Plate number

Options:
- Helpers available
- Number of helpers
- Loading help included
- Tarp available
- Tie-downs available

Button:
“Submit Offer”

==================================================
7. OFFER SUBMITTED STATE
==================================================

Create success state:

“Offer Sent!”

Show:
- Job ID
- Offered price
- ETA
- Vehicle

Text:
“The customer can now review your offer.”

Buttons:
- View Request
- Back to Jobs

Add status:
“Waiting for Customer Decision”

==================================================
8. OFFER ACCEPTED NOTIFICATION
==================================================

Create a notification/modal:

“Your Offer Was Accepted!”

Show:
- Customer
- Job ID
- Agreed fare
- Pickup
- ETA requirement

Button:
“Start Assignment”

==================================================
9. RIDER ACTIVE JOB SCREEN
==================================================

Create the driver's active job control screen.

Show:
- Job ID
- Current status
- Customer
- Service
- Pickup
- Destination
- Cargo / passenger details
- Earnings

Driver should be able to update job progress.

STATUS STEPS:

1. Driver Assigned
2. Heading to Pickup
3. Arrived at Pickup
4. Cargo Loaded / Passenger Picked Up
5. In Transit
6. Near Destination
7. Delivered

Only allow progression forward unless Admin intervenes.

Large action button should change based on stage.

Examples:

When Driver Assigned:
“Start Trip to Pickup”

When Heading to Pickup:
“I Have Arrived”

When Arrived:
“Confirm Pickup”

When Cargo Loaded:
“Start Delivery”

When In Transit:
“Near Destination”

When Near Destination:
“Complete Delivery”

==================================================
10. RIDER GPS NAVIGATION
==================================================

Create mobile GPS navigation screen.

Map should show:
- Rider current location
- Pickup Point A
- Destination Point B
- Route
- Distance
- ETA

For first stage:
Navigate Rider → Pickup

After pickup:
Navigate Pickup → Destination

Show:
- Customer contact
- Job status
- Emergency SOS

Buttons:
- Recenter
- Call Customer
- Chat
- Report Issue

==================================================
11. ARRIVED AT PICKUP SCREEN
==================================================

Create status state:

“Arrived at Pickup”

Show:
- Arrival timestamp
- Pickup location
- Customer / depot contact
- Pickup instructions

Buttons:
- Call Contact
- Chat
- Confirm Pickup

For cargo:
Before confirming pickup, allow:
- Take pickup photo
- Upload pickup photo

==================================================
12. PICKUP CONFIRMATION
==================================================

Create confirmation screen.

For cargo:
“Confirm Cargo Loaded”

Show:
- Cargo description
- Quantity
- Weight

Optional:
- Upload photo
- Note any cargo damage before transport

Checkbox:
“I confirm the cargo has been loaded.”

Button:
“Confirm & Start Delivery”

For Ride:
Use:
“Passenger Picked Up”

==================================================
13. IN TRANSIT RIDER SCREEN
==================================================

Create active navigation state.

Show:
- “IN TRANSIT”
- Customer / recipient
- Destination
- ETA
- Distance remaining
- Earnings

Actions:
- Call
- Chat
- SOS
- Report Issue

Button:
“Mark Near Destination”

==================================================
14. NEAR DESTINATION SCREEN
==================================================

Show:
“Near Destination”

Include:
- Destination
- Recipient
- Contact number
- Unloading instructions
- ETA

Button:
“I Have Arrived at Destination”

==================================================
15. PROOF OF DELIVERY
==================================================

Create a Proof of Delivery screen.

Title:
“Complete Delivery”

Include:
- Take delivery photo
- Upload delivery photo
- Recipient name
- Recipient signature
- Delivery notes
- Completion timestamp

Optional checkbox:
“Cargo received in good condition”

Button:
“Confirm Delivered”

For Passenger Ride:
Use:
“Complete Ride”
without cargo photo requirement unless needed.

==================================================
16. JOB COMPLETED SCREEN
==================================================

Create green success screen.

Title:
“Job Completed!”

Show:
- Job ID
- Customer
- Service
- Completion time
- Final earnings:
  ₱850

Text:
“Your earnings have been added to your Rider account.”

Buttons:
- View Earnings
- Find Another Job
- Back to Rider Home

==================================================
17. RIDER EARNINGS DASHBOARD
==================================================

Create Rider Earnings screen.

Tabs:
- Today
- Week
- Month

Summary cards:
- Gross Earnings
- Platform Fees
- Net Earnings
- Completed Jobs
- Pending Earnings

Example:

Gross:
₱1,400

Platform Fees:
₱150

Net:
₱1,250

Create earnings transaction history.

Each record:
- Job ID
- Service
- Date
- Customer
- Gross fare
- Fees
- Net earnings
- Payment status

==================================================
18. RIDER NOTIFICATIONS
==================================================

Create notification center with examples:

- New Job Nearby
- Customer Sent Request
- Customer Accepted Your Offer
- Scheduled Job Reminder
- Customer Canceled
- Payment Added to Earnings
- New Customer Review
- Vehicle Document Expiring
- KadaGo Admin Update

==================================================
19. RIDER PROFILE
==================================================

Create rider profile screen.

Show:
- Rider photo
- Full name
- Verified Pro badge
- Rating
- Completed jobs
- Acceptance rate
- Mobile number
- Email
- Address
- Emergency contact

Sections:
- Personal Information
- Verification Documents
- My Vehicles
- Earnings
- Reviews
- Notification Settings
- Privacy & Security
- Help & Support
- Logout

==================================================
20. MY VEHICLES SCREEN
==================================================

Create vehicle management page.

Show current active vehicle.

Example:
Isuzu Elf Dropside N-Series
Plate: ABC 1234
Status: ACTIVE

Show:
- Vehicle type
- Cargo capacity
- Passenger capacity
- OR/CR status
- Insurance
- Photos

Buttons:
- Set Active
- View Documents
- Edit Vehicle

Add:
“Add Another Vehicle”

==================================================
21. SWITCH VEHICLE
==================================================

Create a modal/screen allowing rider to switch vehicles.

Example vehicles:
- Isuzu Elf Dropside
- Toyota Hilux 4x4
- Honda Click 125i

Show:
- Capacity
- Status
- Plate number

Button:
“Use This Vehicle”

Important:
Available jobs should update based on selected vehicle capacity.

==================================================
22. DOCUMENT VERIFICATION
==================================================

Create Rider Verification & Documents screen.

Show:
- Professional Driver License
- OR/CR
- Police / Barangay Clearance
- Vehicle Insurance
- Vehicle Photos
- Face Verification

Statuses:
- Verified
- Pending
- Expiring Soon
- Expired
- Needs Resubmission

Allow:
- Upload New Document
- Replace Document

==================================================
23. RIDER REVIEWS
==================================================

Create Rider Reviews screen.

Show:
- Overall rating
- Number of completed jobs
- Review breakdown
- Recent verified reviews

Categories:
- Professionalism
- Communication
- Safety
- Timeliness
- Vehicle Condition
- Cargo Handling

==================================================
24. REPORT ISSUE
==================================================

Create an issue reporting screen during a job.

Options:
- Customer Not Available
- Pickup Problem
- Vehicle Problem
- Cargo Issue
- Unsafe Situation
- Destination Problem
- Payment Issue
- Other

Allow:
- Description
- Upload photo

Buttons:
- Submit Report
- Contact KadaGo Admin

==================================================
25. SOS EMERGENCY
==================================================

Use the same KadaGo SOS system from Customer Portal.

Options:
- Alert KadaGo Admin
- Emergency Services
- Emergency Contact
- Share Live Location
- Report Accident
- Report Unsafe Behavior

==================================================
26. RIDER BOTTOM NAVIGATION
==================================================

Create fixed bottom navigation:

- Home
- Jobs
- Active
- Earnings
- Profile

Highlight the current tab.

==================================================
27. EMPTY / STATUS STATES
==================================================

Create:
- No Nearby Jobs
- No Active Assignment
- Offer Not Selected
- Customer Canceled
- Vehicle Not Verified
- Documents Expired
- Offline Mode
- GPS Unavailable
- Network Error

==================================================
PROTOTYPE FLOW
==================================================

Create these clickable flows:

Rider Login
→ Face Verification
→ Rider Dashboard
→ Go Online

Rider Dashboard
→ Available Job
→ View Job
→ Send Offer
→ Offer Submitted
→ Offer Accepted
→ Start Assignment

Active Assignment
→ GPS to Pickup
→ Arrived at Pickup
→ Confirm Pickup
→ In Transit
→ Near Destination
→ Proof of Delivery
→ Job Completed
→ Earnings Updated

Rider Dashboard
→ Switch Vehicle
→ Select Vehicle
→ Updated Job Feed

Rider Dashboard
→ Earnings

Rider Dashboard
→ Profile
→ My Vehicles
→ Documents
→ Reviews

IMPORTANT:
Create Phase 7 Rider / Driver screens only.

Do not create Fleet Operator or Admin Command Center yet.
Those will be created in the next phase.