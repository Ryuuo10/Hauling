Update the existing KadaGo mobile application.

IMPORTANT:
Do NOT redesign the existing application.
Do NOT remove any existing Customer, Rider, Fleet, or Admin functionality.

Keep exactly the same:
- mobile screen size
- KadaGo branding
- logo
- dark navy design
- orange Rider / Driver actions
- blue Customer actions
- green verified states
- red warning/error states
- typography
- rounded cards
- buttons
- spacing
- icons

This update is specifically for RIDER SIGN-UP, CERTIFICATION, ADMIN APPROVAL, AND LOGIN SECURITY.

==================================================
1. UPDATE RIDER SIGN-UP FLOW
==================================================

When a new user chooses:

“Sign Up as Rider”

Do NOT allow them to immediately access the Rider Portal.

The required flow must be:

Rider Sign Up
→ Terms Agreement
→ Vehicle & Documents
→ Official Face ID Capture
→ Review Application
→ Submit to Admin
→ Pending Admin Confirmation
→ Admin Approves
→ Rider Account Activated
→ Rider Login
→ Face Verification
→ Rider Dashboard

==================================================
2. RIDER BASIC REGISTRATION
==================================================

Keep/create the existing Rider registration screen.

Include:

- Full Name
- Mobile Number
- Email
- Password
- Confirm Password

Customer / Rider toggle:
Highlight:
“Rider / Driver”

Mandatory checkbox:

“I agree to the Terms, Operating Policies & Minimum Pricing Floors.”

Button:

“Proceed to Documents & Face Verification”

The rider cannot continue without accepting the Terms.

==================================================
3. RIDER CERTIFICATION
==================================================

Create a 3-step Rider Certification process.

Progress indicator:

1. Vehicle & Docs
2. Face (Official ID)
3. Submit to Admin

==================================================
STEP 1 — VEHICLE & DOCUMENTS
==================================================

Title:

“Vehicle Build & OR/CR Specs”

Subtitle:

“Enter vehicle information found in your official LTO Certificate of Registration.”

VEHICLE BUILD SPECIFICATIONS

Required fields:

- Make & Brand
  Example: Isuzu

- Model & Year
  Example: Elf Dropside N-Series

- Body Type
  Example:
  Dropside Open Bed

- Plate Number
  Example:
  ABC 1234

- OR/CR Number

- Passenger Capacity
  Example:
  2 passengers

- Maximum Payload / Cargo Capacity
  Example:
  2,500 kg

- Vehicle Color

- Vehicle Type:
  Motorcycle / Scooter
  Sedan / Hatchback
  Van / MPV
  Pickup Truck
  4-Wheel Truck
  Heavy Truck

IMPORTANT:
Passenger capacity and maximum cargo capacity must be saved as part of the verified vehicle information.

==================================================
4. REQUIRED DOCUMENT UPLOADS
==================================================

Require:

1. LTO Official Receipt / Certificate of Registration (OR/CR)

2. Clear Picture of the Vehicle
   - Full vehicle must be visible
   - Plate number should be visible when possible

3. Professional Driver’s License

4. Police or Barangay Clearance

5. Vehicle Insurance, if required by KadaGo policy

Show each document with status:

- Not Uploaded
- Attached
- Pending Review
- Verified
- Rejected
- Needs Resubmission

Do not allow submission if mandatory documents are missing.

Button:

“Proceed to Face Verification (ID Photo)”

==================================================
5. OFFICIAL RIDER FACE ID
==================================================

Step 2:

Title:
“Official KadaGo Profile Picture & ID”

Explain:

“This live face capture will be used as your official KadaGo profile picture and verification ID for future rider logins.”

Show:

- Live camera
- Face alignment frame
- Liveness verification
- Attempt counter

Maximum:
3 attempts

Button:

“Capture Face ID”

The captured image becomes the rider’s official identity/profile image after approval.

Do not allow uploading a random gallery photo as the official face verification photo.

==================================================
6. FACE CAPTURE FAILURE
==================================================

If face verification fails:

Show attempts remaining.

Example:

“Attempt 2 of 3”

Button:
“Try Again”

After 3 failed attempts:

Show:

“Face Verification Requires Review”

Allow the application to be sent to Admin for manual verification.

==================================================
7. REVIEW APPLICATION
==================================================

Step 3:

Title:
“Submit Application for Verification”

Show a complete summary:

RIDER
- Name
- Phone
- Captured official face ID

VEHICLE
- Make
- Model
- Body type
- Plate number
- Passenger capacity
- Maximum payload

DOCUMENTS
- OR/CR Attached
- Vehicle Picture Attached
- Professional License Attached
- Clearance Attached
- Insurance Attached if applicable

Button:

“Submit Documents”

Add text:

“Your application will be reviewed by KadaGo Admin before your Rider account can accept bookings.”

==================================================
8. PENDING ADMIN CONFIRMATION
==================================================

After submission, create a dedicated status screen.

Title:

“Application Pending Verification”

Status badge:

“PENDING ADMIN CONFIRMATION”

Message:

“Your documents and identity have been submitted to KadaGo Admin for verification. You cannot access Rider jobs until your account is approved.”

Show application progress:

✓ Registration Completed
✓ Documents Submitted
✓ Face ID Captured
● Admin Review Pending
○ Rider Account Activation

Buttons:
- View Application Status
- Return to Login

IMPORTANT:
DO NOT allow access to the Rider Dashboard while status is Pending.

==================================================
9. ADMIN CONNECTION
==================================================

Connect the submitted application to the existing Admin Command Center.

Admin should be able to review:

Rider:
- Full name
- Mobile number
- Official face ID

Driver Documents:
- Professional Driver’s License
- Police / Barangay Clearance

Vehicle:
- Make / model
- Body type
- Plate
- OR/CR
- Passenger capacity
- Payload capacity
- Vehicle picture
- Insurance

Admin actions:

- Approve Rider
- Reject Rider
- Request Resubmission
- Add Admin Note

==================================================
10. APPROVED RIDER STATE
==================================================

When Admin approves:

Create notification:

“Your KadaGo Rider Account Has Been Verified!”

Show:

✓ Identity Verified
✓ Driver License Verified
✓ Vehicle Verified
✓ OR/CR Verified

Status:

“VERIFIED RIDER”

Button:

“Log In to Rider Portal”

Only approved riders can accept customer bookings.

==================================================
11. REJECTED / RESUBMISSION STATE
==================================================

If Admin needs changes:

Show:

“Action Required”

Explain which document must be corrected.

Example:

“Please upload a clearer image of your OR/CR.”

Button:

“Resubmit Documents”

Do not require the rider to restart the entire registration.

==================================================
12. RIDER LOGIN SECURITY
==================================================

IMPORTANT:

Even after the Rider has already been approved, EVERY RIDER LOGIN must still require face verification.

Flow:

Rider Login
→ Credentials
→ Face Verification
→ Identity Match Successful
→ Rider Dashboard

Compare the live face with the approved official Rider Face ID.

If successful:
“Identity Verified”

Then allow Rider Dashboard access.

If unsuccessful:
Do NOT allow Rider Portal access.

Show:
“Face Verification Failed”

Maximum:
3 attempts.

After 3 failed attempts:
“Verification Under Review”

This helps prevent:
- account sharing
- unauthorized drivers
- impersonation
- another person using an approved Rider account

==================================================
13. CUSTOMER TRUST INFORMATION
==================================================

When customers view a Rider / Driver profile, show the verified information that is safe to display:

- Verified Driver badge
- Driver photo
- Driver rating
- Completed jobs
- Vehicle make/model
- Vehicle type
- Plate number
- Passenger capacity
- Cargo capacity
- OR/CR Verified
- Driver License Verified
- Insurance Verified, if applicable

Do NOT expose sensitive document numbers or copies of private documents publicly.

Customers can see that documents are verified, but not the private document itself.

==================================================
14. 5–7 MINUTE TARGET
==================================================

Keep the immediate booking highlight:

“5–7 MINS TARGET ARRIVAL”

IMPORTANT:
Use “TARGET” consistently.

Do not imply that 5–7 minutes is guaranteed.

Use it only for immediate booking / nearby vacant rider availability.

Scheduled bookings must display the selected scheduled date and time instead.

==================================================
15. SCHEDULED DELIVERY
==================================================

Keep both:

“Deliver Now”
and
“Schedule Booking”

Schedule Booking must include:

- Calendar date picker
- Time picker
- Confirm schedule

After scheduling:
show the scheduled date and time clearly on the booking summary.

==================================================
16. SECURITY RULE
==================================================

A Rider must NOT become “Verified” simply by submitting documents.

Correct states:

Registration Started
→ Documents Submitted
→ Pending Admin Confirmation
→ Admin Approved
→ Verified Rider

Only KadaGo Admin can change:

Pending
→ Verified

IMPORTANT:
Update the existing prototype and connect these states to the existing Rider and Admin screens.

Do not create duplicate Rider dashboards.
Do not redesign completed screens.
Only strengthen and connect the Rider certification, approval, and login-security flow.