Continue the existing KadaGo mobile app prototype.

PHASE 9: FINAL POLISH, CONSISTENCY, ACCESSIBILITY, AND PROTOTYPE CONNECTIONS.

IMPORTANT:
Do not redesign the entire application.
Do not remove existing features.
Do not change the main KadaGo branding.

Keep the same:
- mobile screen size
- clean flat KadaGo logo
- dark navy brand color
- orange accent / rider actions
- blue customer actions
- green success / verified states
- red SOS / emergency states
- typography
- rounded cards
- icon style
- button style
- spacing system
- navigation style

The goal of Phase 9 is to REVIEW, CLEAN UP, and CONNECT the entire existing prototype from Phase 1 to Phase 8.

==================================================
1. REVIEW ALL MOBILE SCREENS
==================================================

Check all existing screens for:
- consistent screen size
- consistent margins
- consistent padding
- consistent typography
- consistent card radius
- consistent button height
- consistent icon sizes
- consistent colors
- consistent header styles
- consistent bottom navigation

Fix any screens that look visually different from the rest of KadaGo.

Do not change the functionality.

==================================================
2. FIX KADAGO LOGO CONSISTENCY
==================================================

Use the same clean flat KadaGo logo on all important screens.

Logo style:
- blue transport vehicle
- orange cargo/package
- orange human figure
- blue directional arrow
- “KADA” in blue
- “GO” in orange
- tagline:
  “Kada karga, kada errand — All-in-one sa KadaGo”

Do not use a glowing or redesigned logo variation.

==================================================
3. CUSTOMER NAVIGATION CONSISTENCY
==================================================

Customer bottom navigation must consistently use:

- Home
- Vacant
- Activity
- Tracking
- Offers

Make sure:
- active tab is clearly highlighted
- inactive tabs are readable
- every tab is clickable
- tab behavior is consistent

Connections:

Home
→ Customer Dashboard

Vacant
→ Search Vacant Riders

Activity
→ Activity & Past Deliveries

Tracking
→ Live GPS if active job exists
→ “No Active Trip” state if none

Offers
→ Current Driver Offers / Waiting for Offers

==================================================
4. RIDER NAVIGATION CONSISTENCY
==================================================

Rider bottom navigation must consistently use:

- Home
- Jobs
- Active
- Earnings
- Profile

Connections:

Home
→ Rider Dashboard

Jobs
→ Available Jobs

Active
→ Active Assignment
or
→ No Active Assignment

Earnings
→ Rider Earnings

Profile
→ Rider Profile

==================================================
5. FLEET NAVIGATION CONSISTENCY
==================================================

Fleet bottom navigation:

- Dashboard
- Drivers
- Vehicles
- Jobs
- Earnings

Connect every tab correctly.

==================================================
6. ADMIN NAVIGATION CONSISTENCY
==================================================

Admin bottom navigation:

- Dashboard
- Users
- Jobs
- Safety
- More

More should open:
- Pricing
- Services
- Reviews
- Reports
- Audit Logs
- Settings

==================================================
7. CONNECT THE CUSTOMER FLOW COMPLETELY
==================================================

Make this customer flow fully clickable:

Landing
→ Customer Login
→ Terms
→ Face Verification
→ Verification Success
→ Customer Home
→ Select Service
→ Booking Builder
→ Review Request
→ Request Posted
→ Waiting for Offers
→ Compare Driver Offers
→ Driver Profile
→ Select & Book
→ Booking Confirmation
→ Active Job
→ Live GPS
→ Delivered
→ E-Receipt
→ Rate Driver
→ Review Submitted
→ Activity / Home

Also connect:

Customer Home
→ Search Vacant Riders
→ Driver Profile
→ Book Driver
→ Confirmation

Customer Home
→ Public Feedback

Customer Home
→ Notifications

Customer Home
→ Profile

==================================================
8. CONNECT THE RIDER FLOW COMPLETELY
==================================================

Make this clickable:

Landing
→ Rider Login
→ Terms
→ Face Verification
→ Rider Dashboard
→ Go Online
→ Available Jobs
→ Job Details
→ Send Offer
→ Offer Submitted
→ Offer Accepted
→ Start Assignment
→ GPS to Pickup
→ Arrived at Pickup
→ Confirm Pickup
→ In Transit
→ Near Destination
→ Proof of Delivery
→ Job Completed
→ Earnings Updated
→ Rider Dashboard

==================================================
9. CONNECT FLEET FLOW
==================================================

Fleet Operator
→ Fleet Dashboard
→ Drivers
→ Driver Detail
→ Assign Vehicle

Fleet Dashboard
→ Vehicles
→ Vehicle Detail
→ Maintenance

Fleet Dashboard
→ Active Jobs
→ Track Job

Fleet Dashboard
→ Earnings

==================================================
10. CONNECT ADMIN FLOW
==================================================

Admin Command
→ Admin Dashboard

Admin Dashboard
→ Driver Verification
→ Review Driver
→ Approve / Reject

Admin Dashboard
→ Vehicle Verification
→ Approve / Reject

Admin Dashboard
→ Face Verification Review

Admin Dashboard
→ Live Jobs

Admin Dashboard
→ SOS Alert
→ View GPS
→ Resolve

Admin Dashboard
→ Complaints
→ Complaint Detail
→ Resolve

Admin Dashboard
→ Payment Disputes

Admin Dashboard
→ Pricing

Admin Dashboard
→ Reports

Admin Dashboard
→ Audit Logs

==================================================
11. BACK BUTTON BEHAVIOR
==================================================

Check every screen that has a Back button.

Back should return to the correct previous screen.

Examples:

Driver Profile
→ Compare Offers or Vacant Riders

E-Receipt
→ Activity

Job Details
→ Activity

GPS
→ Active Job

Rider Job Details
→ Available Jobs

Driver Verification Review
→ Driver Approval Queue

Never send users to an unrelated screen.

==================================================
12. BUTTON STATE CONSISTENCY
==================================================

Create consistent button states:

- Default
- Pressed
- Disabled
- Loading
- Success

Examples:

Post Request
→ loading state:
“Posting Request…”

Submit Offer
→ loading:
“Sending Offer…”

Confirm Delivered
→ loading:
“Completing Job…”

Save Changes
→ success:
“Saved”

==================================================
13. LOADING STATES
==================================================

Create reusable mobile loading states for:

- Logging in
- Face verification
- Searching for riders
- Posting request
- Waiting for offers
- Loading GPS
- Submitting payment
- Uploading photo
- Submitting review
- Loading jobs

Use skeleton cards or subtle loading indicators.

Do not overuse full-screen spinners.

==================================================
14. ERROR STATES
==================================================

Make error messages clear and user-friendly.

Examples:

“No internet connection”
Button:
“Try Again”

“Unable to load GPS”
Button:
“Retry GPS”

“Payment unsuccessful”
Buttons:
“Try Again”
“Change Payment Method”

“Photo upload failed”
Button:
“Upload Again”

“Something went wrong”
Button:
“Try Again”

==================================================
15. FORM VALIDATION
==================================================

Add clear validation to forms.

Examples:

“Mobile number is required.”

“Please enter a valid Philippine mobile number.”

“Pickup location is required.”

“Destination is required.”

“Proposed price cannot be below the minimum pricing floor.”

“Please select a payment method.”

“Please upload the required document.”

Use small red helper text below the affected field.

==================================================
16. REQUIRED FIELD INDICATORS
==================================================

Add an asterisk or clear label for required fields.

Example:
Mobile Number *

Do not mark optional fields as required.

==================================================
17. DISABLED BUTTON STATES
==================================================

Disable primary CTA until required information is completed.

Examples:

Login disabled
until required credentials + terms are completed.

Continue disabled
until required booking fields are completed.

Post Request disabled
until booking details are valid.

Submit Offer disabled
until rider enters a valid offer.

Confirm Delivered disabled
until required proof is added.

==================================================
18. CONFIRMATION MODALS
==================================================

Create consistent confirmation modal style for important actions:

- Cancel Request
- Cancel Job
- Decline Job
- Suspend User
- Remove Vehicle
- Logout
- Send SOS
- Confirm Delivered

Example:

“Cancel this request?”

Text:
“This action cannot be undone.”

Buttons:
- Keep Request
- Cancel Request

==================================================
19. SUCCESS MESSAGES
==================================================

Use consistent green success feedback:

- Identity Verified
- Request Posted
- Driver Selected
- Payment Successful
- Offer Sent
- Job Completed
- Review Submitted
- Document Uploaded
- Changes Saved

==================================================
20. EMPTY STATES
==================================================

Ensure every major list has an empty state.

Customer:
- No offers
- No active trip
- No history
- No reviews

Rider:
- No available jobs
- No active assignment
- No earnings history

Fleet:
- No drivers
- No vehicles
- No active jobs

Admin:
- No approvals
- No complaints
- No disputes
- No SOS alerts

Each empty state should include:
- simple icon
- clear message
- useful next action when applicable

==================================================
21. NOTIFICATION CONSISTENCY
==================================================

Use consistent notification cards for:
- information
- success
- warning
- emergency

Show:
- icon
- title
- short description
- timestamp
- unread indicator

==================================================
22. SOS VISIBILITY
==================================================

Make SOS easy to access but visually separate from normal actions.

Use:
- red color
- clear SOS label
- emergency icon

Require confirmation before triggering emergency action.

==================================================
23. ACCESSIBILITY
==================================================

Improve accessibility across the app.

Requirements:
- minimum touch target around 44 x 44 px
- readable text sizes
- strong text/background contrast
- do not use color alone to communicate status
- add icons + labels where useful
- avoid tiny buttons
- form labels must remain visible
- support long text without clipping

==================================================
24. MOBILE SAFE AREAS
==================================================

Check:
- top safe area
- bottom safe area
- navigation does not cover content
- sticky CTA does not cover form fields
- modals fit within the mobile viewport
- scrollable screens scroll correctly

==================================================
25. TEXT CONSISTENCY
==================================================

Standardize terminology.

Use:

Customer
Rider / Driver
Fleet Operator
Admin

Use:
“Pickup”
not mixed versions like “Pick-up” unless already required.

Use:
“Drop-off”

Use:
“Job ID”

Use:
“Verified Driver”

Use:
“Minimum Pricing Floor”

Use:
“Proposed Price”

Use:
“Book Again”

Avoid inconsistent wording across screens.

==================================================
26. PHILIPPINE LOCALIZATION
==================================================

Keep KadaGo appropriate for the Philippines.

Use:
- ₱ PHP
- +63 mobile format
- Bukidnon / Malaybalay sample locations
- GCash
- Maya
- Cash COD
- Philippine Driver License / LTO terminology
- OR/CR

Keep English as the main interface language with occasional natural local phrases such as:
“Maayong adlaw”

Do not make the interface difficult to understand.

==================================================
27. STATUS COLOR SYSTEM
==================================================

Use a consistent status system:

Green:
- Verified
- Completed
- Successful
- Online

Orange:
- In Progress
- Pending
- Current stage
- Attention

Red:
- Error
- Emergency
- Suspended
- Failed

Gray:
- Inactive
- Upcoming
- Disabled

Blue:
- Information
- Customer secondary actions

Always include text labels with status color.

==================================================
28. COMPONENT CONSISTENCY
==================================================

Convert repeated UI into reusable component styles where possible:

- Headers
- Bottom navigation
- Driver cards
- Job cards
- Service cards
- Status chips
- Buttons
- Form fields
- Notifications
- Confirmation modals
- Empty states
- Review cards
- Vehicle cards

Keep variants visually consistent.

==================================================
29. PROTOTYPE QUALITY CHECK
==================================================

Review the prototype and fix:

- broken buttons
- dead links
- incorrect back links
- screens with no exit
- duplicated screens
- inconsistent navigation
- wrong role navigation
- missing modal close buttons
- buttons that overlap text
- cards cut off on mobile
- unreadable text
- missing states

Do not leave placeholder links if the destination screen already exists.

==================================================
30. CREATE A SIMPLE ROLE SELECTION MAP
==================================================

Create one internal prototype overview frame showing:

KadaGo

Customer
→ Booking
→ Offers
→ Tracking
→ Completion

Rider
→ Jobs
→ Offer
→ Assignment
→ Completion

Fleet
→ Drivers
→ Vehicles
→ Jobs
→ Earnings

Admin
→ Verification
→ Operations
→ Safety
→ Disputes
→ Reports

This frame is for prototype organization only and should not appear as a customer-facing app screen.

==================================================
FINAL REQUIREMENT
==================================================

After completing Phase 9:

The KadaGo prototype should feel like one complete mobile application, not separate disconnected screen sets.

Every main action should have:
- destination
- loading or state feedback where needed
- success/error state where appropriate
- correct Back behavior

Do not create new major features.

Focus only on:
POLISH
CONSISTENCY
ACCESSIBILITY
MOBILE RESPONSIVENESS
ERROR STATES
COMPLETE PROTOTYPE CONNECTIONS