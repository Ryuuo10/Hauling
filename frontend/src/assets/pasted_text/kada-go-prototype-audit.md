Audit and update the existing KadaGo mobile prototype.

IMPORTANT:
Do not redesign the entire application.
Do not remove existing features.
Do not create duplicate screens if an appropriate screen already exists.

The purpose of this update is to:

1. Add the complete Customer Sign-Up verification flow
2. Fix the Customer SOS functionality
3. Make all Customer Profile menu items clickable
4. Audit the entire KadaGo prototype and connect any currently non-working buttons, tabs, cards, and pages

Keep the existing white/light KadaGo design system:

- White / very light gray backgrounds
- Blue = Customer
- Orange = Rider / Driver
- Green = Verified / Success
- Red = SOS / Error / Danger
- Dark navy text
- Clean rounded cards
- Consistent mobile layout

==================================================
PART 1 — CUSTOMER SIGN-UP FLOW
==================================================

When the user chooses:

Sign Up
→ Sign Up as Customer

create or update the Customer Registration flow.

Use predefined editable DEMO DATA because this is a prototype.

The customer must be able to continue through all steps without manually entering everything.

==================================================
STEP 1 — CUSTOMER IDENTIFICATION PROGRAM (CIP)
==================================================

Title:
“Verify Your Identity”

Subtitle:
“Step 1 of 3 — Customer Identification”

Create a section:

PERSONAL DATA

Fields:

First Name:
Maria Clara

Surname:
Santos

Date of Birth:
June 15, 1995

Residential Address:
Malaybalay City, Bukidnon

Mobile Number:
+63 917 555 0192

Email Address:
customer@kadago.demo

All values should be pre-filled but editable.

==================================================
VALID ID
==================================================

Title:
“Upload a Valid ID”

Accepted IDs:

- National ID
- Passport
- Driver’s License
- UMID

Create ID type selector.

Example selected:
National ID

Because this is a prototype, show:

✓ Demo ID Attached

Allow prototype actions:
- Preview
- Replace
- Remove

Do not require a real ID file for the demo flow.

==================================================
OTP VERIFICATION
==================================================

Create:

“Verify Your Mobile Number”

Show:

OTP sent to:
+63 917 *** 0192

Create 6 OTP input boxes.

Use predefined demo OTP:

123456

Buttons:
- Verify OTP
- Resend Code

Add timer example:
“Resend code in 00:45”

When correct demo OTP is entered:
show:

✓ Mobile Number Verified

Button:
“Continue to Face Verification”

==================================================
STEP 2 — ELECTRONIC KYC & BIOMETRICS
==================================================

Title:
“Face Verification”

Subtitle:
“Step 2 of 3 — e-KYC & Biometrics”

Explain:

“We’ll compare your live face with the identity document you submitted.”

Create:

- Live camera frame
- Face alignment guide
- Liveness check
- ID comparison indicator

Instructions:

- Position your face inside the frame
- Look directly at the camera
- Remove sunglasses or face coverings

Show:

Attempt 1 of 3

Button:
“Verify My Identity”

For prototype behavior:

Tap Verify
→ simulate successful face match

Show:

✓ Liveness Check Passed
✓ Face Match Confirmed
✓ ID Match Confirmed

Then continue.

Also create optional states:

Face Verification Failed
→ Try Again

Maximum 3 attempts.

After 3 failed attempts:
→ Verification Under Review

==================================================
STEP 3 — DEVICE VERIFICATION
==================================================

Title:
“Secure This Device”

Subtitle:
“Step 3 of 3 — Device Verification”

IMPORTANT:
This is a PROTOTYPE simulation only.

Figma does not perform real device fingerprinting.

Show information such as:

Device:
iPhone / Demo Mobile Device

Browser / App:
KadaGo Mobile

Location:
Bukidnon, Philippines

Status:
“New Device”

Explain:

“KadaGo uses device information to help protect your account from unauthorized access.”

Button:
“Trust This Device”

After tapping:

✓ Device Registered

Then show:

“Customer Verification Complete”

==================================================
CUSTOMER SIGN-UP SUCCESS
==================================================

Create final success screen.

Title:
“Welcome to KadaGo!”

Show:

✓ Personal Information Verified
✓ Mobile Number Verified
✓ Identity Verified
✓ Device Registered

Account:
Maria Clara Santos

Status:
VERIFIED CUSTOMER

Button:
“Continue to Customer Portal”

==================================================
PART 2 — CUSTOMER SOS MUST WORK
==================================================

The Customer SOS button currently appears but does not function.

Fix it.

The SOS button must be clickable from:

- Customer Dashboard
- Active Job
- Live GPS Tracking

When tapped, open:

“SOS Emergency”

Use red accents.

Message:

“Use SOS only for emergencies or immediate safety concerns.”

Options:

- Alert KadaGo Admin
- Call Emergency Services
- Call Emergency Contact
- Share Live Location
- Report Accident
- Report Unsafe Behavior
- Report Driver Issue
- Report Cargo Issue

When an option is selected, show:

“Send Emergency Alert?”

Buttons:

- Send SOS
- Cancel

==================================================
SOS CONFIRMATION
==================================================

When user taps Send SOS:

Create success / emergency state:

“SOS Alert Sent”

Show:

- Job ID if applicable
- Customer name
- Current location
- Time
- Alert type

Message:

“KadaGo Admin has been notified.”

Buttons:

- Call Emergency Services
- Return to Trip

==================================================
SOS ADMIN CONNECTION
==================================================

Connect Customer SOS to the existing Admin Command Center.

Admin should receive an SOS alert showing:

- Customer
- Job ID
- Driver
- Live location
- Time
- Alert category

Admin actions:

- View Live GPS
- Call Customer
- Call Driver
- Contact Emergency Services
- Resolve Alert

==================================================
PART 3 — FIX CUSTOMER PROFILE MENU
==================================================

The following Customer Profile items currently appear but may not work:

- Edit Profile
- Notification Settings
- Privacy & Security
- Booking History
- Help & Support
- Log Out

Make ALL of them clickable.

==================================================
EDIT PROFILE
==================================================

Open Customer Profile Editor.

Include:

- Profile photo
- First name
- Surname
- Mobile
- Email
- Residential address
- Emergency contact

Button:
“Save Changes”

Show:
“Profile Updated Successfully”

==================================================
NOTIFICATION SETTINGS
==================================================

Create settings page with toggles:

- Driver Offers
- Booking Updates
- Driver Arrival
- Delivery Status
- Payment Notifications
- Promotions
- Safety Alerts

Safety Alerts should remain enabled by default.

Button:
“Save Settings”

==================================================
PRIVACY & SECURITY
==================================================

Create page containing:

- Change Password
- Face Verification
- Trusted Device
- Login Activity
- Privacy Preferences
- Account Security

Show current device:
“This Device — Trusted”

Allow:
“Remove Trusted Device”

==================================================
BOOKING HISTORY
==================================================

Connect this directly to the existing:

“Activity & Past Deliveries”

Do not create a duplicate page.

Show tabs:

- Active
- Completed
- Canceled

==================================================
HELP & SUPPORT
==================================================

Create Help & Support page.

Options:

- Frequently Asked Questions
- Booking Help
- Payment Help
- Report a Driver
- Report a Problem
- Safety Support
- Contact KadaGo

Add:

“Chat with Support”

and

“Submit Support Request”

==================================================
LOG OUT
==================================================

When tapped, show confirmation modal:

“Log Out of KadaGo?”

Buttons:

- Cancel
- Log Out

Log Out
→ return to KadaGo Landing page.

==================================================
PART 4 — CUSTOMER DASHBOARD FUNCTIONALITY
==================================================

Audit these Customer Dashboard cards and make sure they are clickable:

Ride
→ Passenger Ride booking

Parcel
→ Parcel Delivery booking

Pabili
→ Pabili / Errand booking

Hardware & Cement
→ Construction / Cargo booking

Heavy Trucking
→ Heavy Cargo booking

Lipat-Bahay
→ Household Moving booking

Post a Request
→ Booking Builder

Search Riders
→ Vacant Riders

Schedule
→ Schedule Booking

Active Job
→ Active Job Details

==================================================
PART 5 — CUSTOMER BOTTOM NAVIGATION
==================================================

Make every bottom navigation tab work.

HOME
→ Customer Dashboard

VACANT
→ Search Vacant Riders & Vehicles

ACTIVITY
→ Activity & Past Deliveries

TRACKING
If active booking:
→ Live GPS Tracking

If no active booking:
→ No Active Trip state

OFFERS
If offers exist:
→ Compare & Select Your Driver

If no request:
→ No Active Offers state

==================================================
PART 6 — VACANT RIDERS PAGE
==================================================

Ensure Vacant is populated with demo data.

Show drivers:

Juan Dela Cruz
Rogelio Mendoza
Danilo Cruz
Marlon Bautista

Each must have working:

- View Profile
- Book Now

View Profile
→ Driver Profile

Book Now
→ Booking Confirmation

==================================================
PART 7 — OFFERS PAGE
==================================================

Ensure Offers is populated with demo bids.

Show:

Juan Dela Cruz
₱850
ETA 15 mins

Rey Tamayo
₱750
ETA 20 mins

XYZ Mindanao Logistics
₱1,100
ETA 25 mins

Each offer must have:

- Chat
- Profile
- Select & Book

Chat
→ Customer / Driver Chat

Profile
→ Driver Profile

Select & Book
→ Booking Confirmation
→ Active Job

==================================================
PART 8 — FULL PROTOTYPE FUNCTIONALITY AUDIT
==================================================

Audit ALL existing KadaGo screens.

Check Customer, Rider, Fleet, and Admin.

Find and fix:

- buttons with no prototype interaction
- service cards that do nothing
- empty navigation tabs
- menu items that do nothing
- incorrect back buttons
- dead-end screens
- duplicate screens
- missing close buttons
- tabs that do not switch
- buttons linked to the wrong screen
- screens with no way to return
- broken prototype links
- placeholder destination screens when a real screen already exists

Do NOT redesign functioning screens.

Only repair their prototype connections.

==================================================
PART 9 — BUTTON QA CHECK
==================================================

Specifically test and connect these:

CUSTOMER

Login
Sign Up
Google Demo
Customer Demo
Post Request
Ride
Parcel
Pabili
Hardware
Heavy Trucking
Lipat-Bahay
Search Riders
Schedule
SOS
Notifications
Profile
Vacant
Activity
Tracking
Offers
View Driver
Book Now
Chat
Select & Book
Call Driver
Share Trip
View Receipt
Rate Driver
Book Again
Edit Profile
Notification Settings
Privacy & Security
Booking History
Help & Support
Log Out

RIDER

Login
Sign Up
Certification
Document Upload
Face Verification
Submit to Admin
Go Online
View Job
Send Offer
Active Assignment
GPS
Call Customer
Chat
Proof of Delivery
Complete Job
Earnings
Profile
Vehicles
Documents
SOS
Log Out

FLEET

Drivers
Vehicles
Jobs
Earnings
Driver Detail
Vehicle Detail
Assign Driver
Track Job
Maintenance

ADMIN

Driver Approval
Vehicle Approval
Face Review
Users
Jobs
SOS Alerts
Complaints
Payments
Pricing
Services
Reports
Audit Logs

==================================================
PART 10 — PROTOTYPE DEMO REQUIREMENT
==================================================

Because this is a prototype:

Use predefined editable data whenever possible.

The tester should be able to demonstrate the app without manually entering large amounts of information.

Use demo information, demo OTP, demo documents, demo drivers, and demo bookings.

Do not require real:
- SMS
- ID verification service
- camera biometric service
- GPS service
- device fingerprint service
- Google authentication

Simulate these interactions realistically.

==================================================
FINAL REQUIREMENT
==================================================

After this update, perform a prototype connection audit.

Every visible button, navigation item, service card, profile option, and major CTA should either:

1. open the correct existing screen,
2. open the correct modal,
3. change state,
or
4. provide clear feedback.

There should be no major clickable-looking elements that do nothing.

Do not redesign the whole application.

Focus on:
CUSTOMER SIGN-UP VERIFICATION
SOS FUNCTIONALITY
PROFILE MENU FUNCTIONALITY
FULL PROTOTYPE CONNECTION QA