Update the existing KadaGo mobile prototype.

IMPORTANT:
Do NOT redesign the whole application.
Do NOT remove the existing system structure.
Only improve and correct the CUSTOMER-facing entry flow, login flow, dashboard theme, and prototype navigation.

Use the attached screenshots as reference:
- First image = preferred visual direction for cleaner white + blue + orange styling
- Second image = current landing page to update
- Third image = current customer login screen to correct
- Fourth image = current customer dashboard to fix navigation and clickability

==================================================
1. CUSTOMER VISUAL STYLE UPDATE
==================================================

Update the CUSTOMER-facing screens to use a cleaner and lighter visual style inspired by the first reference image.

Use:
- White or very light gray background for major content areas
- Blue as the main customer action color
- Orange as the highlight / CTA accent color
- Keep KadaGo branding and logo
- Keep the app professional, clean, and modern
- Keep mobile layout only

Apply this cleaner white + blue + orange style to:
- Customer landing / entry
- Customer login
- Customer home dashboard
- Customer Vacant tab
- Customer Offers tab

Do not apply this change to the Rider/Admin/Fleet flows unless needed later.

==================================================
2. CUSTOMER LANDING PAGE CORRECTION
==================================================

Update the customer landing / portal selection area.

Remove the visible:
- “Terms, Safety Policies & Pricing Floors” checkbox section

Remove the terms block from the landing page.

Keep:
- KadaGo logo
- Login as Customer
- Login as Rider
- Continue with Google
- Demo buttons
- Fleet Operator
- Admin Command
- Sign Up buttons if already present

Add or keep:
- Customer Demo
- Rider Demo

Make the customer-facing landing page visually cleaner and more similar to the first image.

==================================================
3. CUSTOMER LOGIN SCREEN CORRECTION
==================================================

When the user chooses CUSTOMER, the Customer Login screen must be CUSTOMER ONLY.

IMPORTANT:
Remove the Rider / Driver toggle from the Customer Login page.

So on the Customer Login screen:
- show only Customer login
- do not show Rider / Driver as an option there
- do not show a Customer/Rider tab switch
- keep it focused only on Customer login

Also remove the Terms / Safety checkbox section from the Customer Login screen.

Do NOT require customer to check terms on this page.

Keep:
- Mobile number or email input
- Password field
- Continue with Google
- Login button

Button text can be:
“Log In & Continue”

==================================================
4. PREDEFINED CUSTOMER DEMO DATA
==================================================

Because this is a prototype, use pre-filled sample customer data so the user can continue and explore the system without entering information manually.

Pre-fill Customer login with demo values such as:

Email or Mobile:
customer@kadago.demo
or
+63 917 555 0192

Password:
••••••••••

Customer name:
Maria Clara Santos

Location:
Malaybalay City, Bukidnon

When user uses Customer Demo or the Customer login prototype path, allow them to continue directly into the Customer Dashboard.

Make it clear this is demo data for prototype use.

Do not block prototype viewing because of empty form fields.

==================================================
5. CUSTOMER DASHBOARD SERVICE CARDS MUST WORK
==================================================

On the Customer Home Dashboard, make these service cards clickable:

- Ride
- Parcel
- Pabili
- Hardware & Cement
- Heavy Trucking
- Lipat-Bahay

Each card must lead to the appropriate booking/request flow.

At minimum, clicking each should open a working booking screen or service-specific form.

Expected behavior:
- Ride → Ride booking / passenger details
- Parcel → Parcel booking
- Pabili → Pabili / Errand booking
- Hardware & Cement → Cargo / construction booking
- Heavy Trucking → Heavy cargo booking
- Lipat-Bahay → House moving booking

Use predefined demo values in the booking forms so users can continue through the prototype.

==================================================
6. PRE-FILLED BOOKING FORM DATA
==================================================

Because this is a prototype, all major customer booking forms should open with predefined sample values already filled in.

Example demo values:

Customer:
Maria Clara Santos

Pickup:
ABC Hardware & Construction Depot, Fortich St.

Destination:
Lot 14 Blk 3, Pinecrest Subdivision, Brgy. San Jose

Cargo:
30 Sacks of Portland Cement (Type 1)

Weight:
1,200 kg

Vehicle:
4-Wheel Truck

Payment:
GCash

Proposed Price:
₱950

For Ride:
Passengers:
1
Luggage:
None

Allow the values to be edited, but make sure the prototype can proceed immediately without manual input.

==================================================
7. FIX CUSTOMER BOTTOM NAVIGATION
==================================================

Make sure the Customer bottom navigation is fully working.

Tabs:
- Home
- Vacant
- Activity
- Tracking
- Offers

All tabs must be clickable and connected.

==================================================
8. FIX VACANT TAB
==================================================

The “Vacant” tab must not be empty.

Connect it to a populated page:
“Search Vacant Riders & Vehicles”

Show demo rider cards with sample data such as:
- Juan Dela Cruz
- Rogelio Mendoza
- Danilo Cruz
- Marlon Bautista

Each rider card should show:
- Driver photo
- Name
- Online indicator
- ETA / time away
- Vehicle image
- Vehicle name
- Plate number
- Passenger capacity
- Rating
- Minimum floor
- Verified badges

Buttons:
- View Profile
- Book Now

IMPORTANT:
Customers should only see verification status, not private document images.

Show:
- License Verified
- OR/CR Verified
- Vehicle Verified
- Insurance Verified

Do not show actual private document files.

==================================================
9. FIX OFFERS TAB
==================================================

The “Offers” tab must not be empty.

Connect it to a working page:
“Compare & Select Your Driver”

This page should show driver offers after a request is posted.

At the top, show:
- request summary
- target budget
- service / cargo summary

Show sample offer cards with demo data such as:
1. Juan Dela Cruz
   Offered Price: ₱850
   ETA: 15 mins
   Vehicle: Isuzu Elf Dropside Truck

2. Rey Tamayo
   Offered Price: ₱750
   ETA: 20 mins
   Vehicle: Toyota Hilux 4x4 Pickup

3. XYZ Mindanao Logistics Fleet
   Offered Price: ₱1100
   ETA: 25 mins
   Vehicle: 4-Wheel Heavy Dropside

Each offer card must include:
- Driver photo
- Name
- Rating
- Jobs completed
- Verification badges
- Vehicle
- Plate number
- Capacity
- Driver message
- Distance
- ETA
- Offered price

Buttons:
- Chat
- Profile
- Select & Book

Highlight one as:
“Top Recommended Pro”

==================================================
10. PROTOTYPE CONNECTIONS
==================================================

Create working prototype links for this customer flow:

Landing
→ Login as Customer
→ Customer Login
→ Customer Dashboard

Customer Dashboard
→ Ride / Parcel / Pabili / Hardware / Heavy / Lipat-Bahay
→ relevant booking flow

Customer Dashboard
→ Vacant tab
→ Search Vacant Riders & Vehicles

Customer Dashboard
→ Offers tab
→ Compare & Select Your Driver

Customer Dashboard
→ Activity tab
→ Activity & Past Deliveries

Customer Dashboard
→ Tracking tab
→ Live Tracking or No Active Trip state

==================================================
11. IMPORTANT LOGIN RULE
==================================================

Customer Login should be simple for prototype use.

Do not require:
- Rider/Driver toggle
- Terms checkbox
- extra unnecessary blocking steps

Use demo/pre-filled data so the viewer can continue into the system easily.

==================================================
12. KEEP THESE UNCHANGED
==================================================

Do not remove:
- KadaGo branding
- core customer booking flow
- rider flow
- admin flow
- fleet flow

Only improve:
- customer visual style
- customer login experience
- customer dashboard clickability
- vacant tab
- offers tab
- predefined demo data

The result should be a cleaner, more usable CUSTOMER prototype that is easy to present and explore.