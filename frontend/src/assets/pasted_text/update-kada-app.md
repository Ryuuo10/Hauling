Update the existing KadaGo mobile app.

IMPORTANT:
Do not redesign the app.
Keep the same branding, mobile style, colors, typography, button styles, cards, spacing, and KadaGo logo.

Use the attached screenshots as REFERENCE for functionality and layout.

I want to clearly separate two Customer screens:

1. VACANT RIDERS SCREEN
2. DRIVER OFFERS / COMPARE SCREEN

These are different pages and should not be merged.

==================================================
1. CUSTOMER VACANT RIDERS SCREEN
==================================================

Create or update the Customer “Vacant” tab so it matches the first reference image.

Purpose:
This page lets the customer browse nearby available riders and vehicles before or without waiting for offers.

Title:
“Search Vacant Riders & Vehicles”

Subtitle:
“Verified drivers in Bukidnon with full OR/CR, vehicle build specs & passenger capacities”

Add:
- Live Available badge
- Search bar
- Search placeholder:
  “Search by rider name, vehicle build, plate, or Malaybalay location…”

Add quick tag/highlight:
“Fast 5–7 Mins Target Arrival”

Show rider cards with:

- Driver photo
- Driver name
- Online indicator
- Location
- Time away badge
- Vehicle image
- Vehicle name / build
- Vehicle description
- Plate number
- Passenger capacity
- Rating
- Number of reviews
- Minimum pricing floor

Buttons:
- View Profile
- Book Now

IMPORTANT:
Do NOT expose private document files to customers.
Instead of showing actual OR/CR documents, show verification badges such as:

- License Verified
- OR/CR Verified
- Vehicle Verified
- Insurance Verified

At the bottom, add note:
“All vacant riders are pre-verified with Philippine LTO and KadaGo Admin clearance.”

This screen belongs to:
Customer Bottom Navigation → Vacant

==================================================
2. CUSTOMER DRIVER OFFERS SCREEN
==================================================

Create or update the Customer “Offers” flow so it matches the second reference image.

Purpose:
This page appears after the customer posts a request and drivers respond with offers.

Title:
“Compare & Select Your Driver”

Add top helper label:
“LIVE BIDS (4 DRIVERS RESPONDED)”

Add sort dropdown:
- Best Match
- Lowest Price
- Highest Rating
- Fastest Arrival

At the top, show request summary card:

- Service icon
- Item:
  “30 Sacks of Portland Cement (Type 1)”
- Summary:
  “30 sacks • 1200 kg • Pickup: ABC Hardware & Construction Depot, Fortich St.”
- Customer target budget:
  “₱950”

Then show driver offer cards.

Each offer card should include:

- Driver photo
- Driver name
- PRO badge if applicable
- Rating
- Jobs completed
- Verification badges:
  - License
  - Vehicle
  - Insured
- Vehicle name
- Plate number
- Capacity
- Driver message
- Distance
- ETA
- Offered price
- Included note such as:
  “Includes fuel & helper loading”

Buttons on each card:
- Chat
- Profile
- Select & Book

Highlight one card as:
“TOP RECOMMENDED PRO”

Use sample drivers like:
- Juan Dela Cruz
- Rey Tamayo
- XYZ Mindanao Logistics Fleet

This screen belongs to:
Customer Bottom Navigation → Offers
or
Booking Flow → Waiting for Offers → Compare & Select Your Driver

==================================================
3. CUSTOMER FLOW CONNECTIONS
==================================================

Connect the screens properly:

Customer Home
→ Vacant tab
→ Search Vacant Riders & Vehicles

Customer Home
→ Post Request
→ Request Posted
→ Waiting for Offers
→ Compare & Select Your Driver

Vacant Riders screen and Driver Offers screen must remain separate.

==================================================
4. IMPORTANT CUSTOMER TRUST RULE
==================================================

Customers can see verified status, but not private document copies.

Show:
- Verified Driver
- OR/CR Verified
- Vehicle Verified
- License Verified
- Passenger Capacity
- Cargo Capacity
- Plate Number
- Vehicle Build / Type

Do NOT show:
- full OR/CR image
- driver’s license image
- private clearance document
- insurance document copy

==================================================
5. BUTTON DESTINATIONS
==================================================

Vacant Riders Screen:
- View Profile → Driver Profile
- Book Now → Booking confirmation or direct booking flow

Driver Offers Screen:
- Chat → Customer-Driver chat
- Profile → Driver Profile
- Select & Book → Booking confirmation → Active Job

Only update/add these customer screens.
Do not redesign other phases.
Keep the entire KadaGo prototype visually consistent.



==================================================
6. PROTOTYPE DEMO DATA / PRE-FILLED INFORMATION
==================================================

Because this is a prototype, use predefined sample information so the Customer and Rider/Driver can proceed through the flow without manually entering every field.

IMPORTANT:
Use realistic DEMO DATA only.
Do not use real personal information.
The goal is to make the prototype easy to test and present.

CUSTOMER DEMO ACCOUNT

Pre-fill sample information such as:

Name:
Maria Clara Santos

Mobile:
+63 917 555 0192

Location:
Malaybalay City, Bukidnon

Account Type:
Personal Account

Example pickup:
ABC Hardware & Construction Depot, Fortich St.

Example destination:
Lot 14 Blk 3, Pinecrest Subdivision, Brgy. San Jose

Example service:
Hardware & Cement

Example cargo:
30 Sacks of Portland Cement (Type 1)

Example weight:
1,200 kg

Example payment:
GCash

Example proposed price:
₱950

When using Customer Demo, required booking fields may already contain sample values so the user can immediately continue through the prototype.

Allow the user to edit the values if desired.

==================================================
RIDER / DRIVER DEMO ACCOUNT
==================================================

Pre-fill sample Rider information:

Name:
Juan Dela Cruz

Mobile:
+63 918 444 8821

Status:
Verified Rider

Rating:
4.9

Completed Jobs:
245

Acceptance Rate:
96%

Active Vehicle:
Isuzu Elf Dropside N-Series

Plate:
ABC 1234

Vehicle Type:
4-Wheel Truck

Passenger Capacity:
2

Maximum Payload:
2,500 kg

Verification:
- Driver License Verified
- OR/CR Verified
- Vehicle Verified
- Insurance Verified
- Face ID Verified

Example Rider earnings:
₱1,250 Today

For Rider Demo, the rider should already have an approved/verified account so the prototype can proceed directly to:
- Rider Dashboard
- Available Jobs
- Send Offer
- Active Assignment
- GPS Navigation
- Job Completion

==================================================
PROTOTYPE LOGIN BEHAVIOR
==================================================

For Customer Demo:
Customer Demo
→ open Customer Portal using predefined sample customer information.

For Rider Demo:
Rider Demo
→ open Rider Portal using predefined verified rider information.

For normal Login / Sign Up:
Keep the full authentication, certification, face verification, and admin approval flows.

Do not remove the real workflow.

The Demo buttons are only shortcuts for prototype testing and presentation.

==================================================
PRE-FILLED FORM BEHAVIOR
==================================================

For prototype demonstration:

- Customer booking forms may open with sample pickup, destination, cargo, vehicle, price, and payment already filled.
- Rider job forms may open with sample offer price, ETA, vehicle, and helper information already filled.
- The user should still be able to edit the sample values.
- Primary buttons should be enabled when all required demo fields are already valid.

This allows the prototype flow to be tested without repeatedly entering data manually.

Clearly label demo/sample information where appropriate.