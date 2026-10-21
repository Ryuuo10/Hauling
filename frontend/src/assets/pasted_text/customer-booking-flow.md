Continue the existing KadaGo mobile application.

PHASE 3: CUSTOMER BOOKING / REQUEST BUILDER

IMPORTANT:
Do not redesign any existing Phase 1 or Phase 2 screens.

Keep exactly the same:
- Mobile screen size
- KadaGo clean flat logo
- Dark navy background
- Blue customer actions
- Orange primary action/accent
- Green verified/success states
- Typography
- Cards
- Buttons
- Icons
- Spacing
- Bottom navigation style

Build the complete CUSTOMER BOOKING FLOW.

This flow opens when the customer taps:
“Post a Request”
or selects one of the KadaGo service categories.

==================================================
SCREEN 1: SELECT SERVICE
==================================================

Title:
“Mag-book ng KadaGo Transport”

Subtitle:
“Choose what you need today.”

Show service cards:

1. Ride
   - Passenger transportation
   - 1–4 passengers

2. Parcel Delivery
   - Packages and small deliveries

3. Pabili / Errands
   - Grocery, medicine, food, or item purchasing

4. Hardware & Cement
   - Construction materials
   - Add “Popular” badge

5. Heavy Trucking
   - Heavy and commercial cargo

6. Lipat-Bahay
   - Household moving

7. Express Delivery

8. Machinery Transport

9. Custom Hauling

Add Back and Close buttons.

IMPORTANT:
All categories use the same general booking process,
but the information requested should change depending on the selected service.

==================================================
SCREEN 2: DELIVERY TIME
==================================================

Title:
“When do you need it?”

Options:

DELIVER NOW
- Immediate dispatch
- Target arrival: 5–7 minutes

SCHEDULE BOOKING
- Book a future date and time

If Schedule Booking is selected:
- Date picker
- Time picker
- Confirm button

==================================================
SCREEN 3: ROUTE & CONTACTS
==================================================

Title:
“Pickup & Destination”

PICKUP LOCATION / POINT A

Fields:
- Address / Depot Name
- Landmark
- City / Province
- Pickup Contact Name
- Pickup Contact Number
- Pickup Instructions

Buttons:
- Use Current Location
- Pin on Map

DROP-OFF / POINT B

Fields:
- Destination Address / Jobsite
- Landmark
- Recipient Name
- Recipient Contact Number
- Delivery / Unloading Instructions

Add a small route preview map between Point A and Point B.

Button:
“Continue”

==================================================
SCREEN 4A: CARGO DETAILS
==================================================

Use this for:
- Parcel
- Hardware & Cement
- Heavy Trucking
- Lipat-Bahay
- Machinery
- Custom Hauling

Title:
“Cargo & Item Details”

Fields:
- What are we transporting?
- Quantity / Count

Estimated Cargo Weight:
- 15 kg
- 50 kg
- 200 kg
- 600 kg
- 1.2T
- 2.5T
- 5T

Cargo options:
- Heavy Cargo
- Fragile Item
- Oversized Bulk
- Need Helpers

If Need Helpers is selected:
- Number of helpers:
  1, 2, 3+

Photo section:
“Cargo Photo Attachment”

Options:
- Take Photo
- Upload Image

Text:
“Drivers can view the cargo before submitting an offer.”

==================================================
SCREEN 4B: RIDE DETAILS
==================================================

When “Ride” is selected, do NOT show cargo weight.

Create a passenger-specific screen.

Title:
“Passenger Details”

Fields:
- Number of passengers
  1, 2, 3, 4
- Luggage
  None / Small / Large
- Pickup notes
- Destination notes

Optional:
- Child seat needed
- Accessibility assistance
- Extra luggage

==================================================
SCREEN 4C: PABILI / ERRAND DETAILS
==================================================

When Pabili / Errands is selected:

Title:
“Pabili / Errand Details”

Fields:
- Store / Shop Name
- Shopping List
- Estimated Purchase Amount
- Customer Notes

Options:
- Grocery
- Food
- Medicine
- General Errand
- Other

Allow:
- Upload Shopping List Photo
- Upload Product Reference Image

==================================================
SCREEN 4D: LIPAT-BAHAY DETAILS
==================================================

If Lipat-Bahay is selected, add:

- Household items description
- Approximate number of boxes
- Large furniture toggle
- Appliances toggle
- Floor level at pickup
- Floor level at destination
- Elevator available?
- Helpers needed
- Estimated cargo weight

==================================================
SCREEN 4E: MACHINERY / HEAVY CARGO DETAILS
==================================================

Add:
- Equipment or cargo name
- Estimated weight
- Dimensions
- Loading method
- Unloading method
- Forklift required
- Crane required
- Tie-down requirement
- Special handling instructions

==================================================
SCREEN 5: VEHICLE SELECTION
==================================================

Title:
“Choose Your Vehicle”

Create Smart Recommendation banner.

Example:
“Smart Recommendation:
4-Wheel Truck”

Text:
“Best match based on cargo weight and service type.”

Vehicle options:

Motorcycle / Scooter
- Max 20 kg
- Passenger: 1
- Floor: ₱50

Sedan / Hatchback
- Max 200 kg
- Up to 4 passengers
- Floor: ₱120

Van / MPV
- Max 800 kg
- Up to 7–12 passengers
- Floor: ₱280

Pickup Truck
- Max 1,000 kg
- Floor: ₱380

4-Wheel Truck
- Max 2,500 kg
- Floor: ₱500

Heavy Truck
- For larger loads

Add:
“Let KadaGo Match”
for automatic vehicle selection.

IMPORTANT:
Vehicle recommendation must change depending on the service.

Examples:

Ride
→ Sedan / Hatchback

Parcel
→ Motorcycle

Pabili
→ Motorcycle

Hardware & Cement, 1.2 tons
→ 4-Wheel Truck

Lipat-Bahay
→ Pickup / Van / Truck

Heavy Trucking
→ Heavy Truck

==================================================
SCREEN 6: FAIR PRICE PROPOSAL
==================================================

Title:
“Fair Price Proposal”

Create a green pricing protection card.

Show:

Minimum Pricing Floor:
₱1,035

Recommended Fair Price:
₱1,380

Buttons:
“Set to Minimum Floor”
“Set to Fair Price”

Field:
“Your Proposed Price (₱ PHP)”

Allow customer to manually enter price.

Supporting text:
“Drivers can accept your proposed price or send counter-offers.”

==================================================
SCREEN 7: PAYMENT METHOD
==================================================

Title:
“Payment Method”

Options:
- GCash
- Maya
- Cash COD

Show selected payment method clearly.

Text:
“No upfront charge until you select a verified driver.”

==================================================
SCREEN 8: REVIEW REQUEST
==================================================

Before posting, show a booking summary.

Include:

SERVICE
Hardware & Cement

PICKUP
ABC Hardware & Construction Depot

DESTINATION
Lot 14 Blk 3, Pinecrest Subdivision

CARGO
30 Sacks of Portland Cement

WEIGHT
1.2 tons

VEHICLE
4-Wheel Truck

HELPERS
2

PROPOSED PRICE
₱1,035

PAYMENT
GCash

DELIVERY
Deliver Now

Buttons:
“Edit Request”
“Post Request”

==================================================
SCREEN 9: REQUEST POSTED
==================================================

Success screen.

Title:
“Request Posted!”

Show:
- Job ID: KG-12389
- Searching for verified drivers
- Animated/searching indicator

Text:
“Nearby qualified riders and drivers can now send offers.”

Show:
“0 Driver Offers”

Buttons:
- View Request
- Cancel Request

Add:
“Expected first responses within a few minutes.”

==================================================
SCREEN 10: WAITING FOR OFFERS
==================================================

Create a waiting screen that updates when offers arrive.

Show:
“Drivers Responding…”

Example:
“3 verified drivers have sent offers.”

Button:
“Compare Driver Offers”

==================================================
PROTOTYPE FLOW
==================================================

Make the screens clickable:

Customer Home
→ Post a Request
→ Select Service
→ Delivery Time
→ Pickup & Destination
→ Service-specific Details
→ Vehicle Selection
→ Fair Price
→ Payment
→ Review Request
→ Post Request
→ Waiting for Driver Offers

IMPORTANT:
Use mobile screens only.

Do not build the driver comparison page yet.
That will be Phase 4.

Make the booking form easy to complete with large touch targets, clear progress steps, and Back/Continue buttons.

Show a progress indicator such as:
1 Service
2 Route
3 Details
4 Vehicle
5 Price
6 Review