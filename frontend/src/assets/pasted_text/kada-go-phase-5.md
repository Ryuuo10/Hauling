Continue the existing KadaGo mobile app design.

IMPORTANT:
Keep the exact same:
- mobile screen size
- KadaGo logo
- dark navy brand style
- orange primary actions
- blue customer actions
- green verified/success states
- red SOS/emergency actions
- typography
- rounded cards
- spacing
- icon style
- bottom navigation
- overall visual consistency

Do not redesign any existing Phase 1–4 screens.

Create PHASE 5: ACTIVE JOB + LIVE GPS TRACKING.

==================================================
1. ACTIVE JOB SCREEN
==================================================

Create a mobile customer screen shown after a driver is selected and booked.

Header:
- Back button
- Job ID: KG-12389
- Status badge: ACTIVE JOB
- SOS button

Main job summary:
- Service:
  Hardware & Cement
- Item:
  30 Sacks of Portland Cement (Type 1)
- Pickup:
  ABC Hardware & Construction Depot, Fortich St.
- Drop-off:
  Lot 14 Blk 3, Pinecrest Subdivision, Brgy. San Jose

Driver card:
- Driver photo
- Juan Dela Cruz
- Verified Driver badge
- Rating: 4.9
- 245 completed jobs
- Vehicle:
  Isuzu Elf Dropside Truck
- Plate:
  ABC 1234
- Agreed Fare:
  ₱850
- Payment:
  GCash

Buttons:
- Call Driver
- Chat
- Live GPS
- Share Trip

==================================================
2. DELIVERY STATUS PROGRESSION
==================================================

Create a clear status tracker with these 7 stages:

1. Driver Assigned
2. Heading to Pickup
3. Arrived at Pickup
4. Cargo Loaded / Passenger Picked Up
5. In Transit
6. Near Destination
7. Delivered

Show:
- completed steps in green
- current active step in orange
- upcoming steps in gray

Add current status message, for example:

“Current Stage: Heading to Pickup”
“Driver is en route to supplier depot.”

Also show:
- Updated live via GPS
- ETA: ~6 mins

==================================================
3. LIVE GPS TRACKING SCREEN
==================================================

Create a dedicated mobile GPS tracking screen.

Header:
- Back button
- LIVE GPS TRACKING
- Job ID
- Share Trip
- SOS

Show a large map area.

Map should display:
- Pickup Point A
- Drop-off Point B
- Live driver vehicle icon
- Route line
- Driver current position
- Pickup marker
- Destination marker
- Live GPS indicator

Floating info card:
- ETA: ~15 mins
- 4.2 km remaining

Map controls:
- Zoom in
- Zoom out
- Recenter / current location

Below the map show:
- Current delivery status
- Driver information
- Vehicle
- Plate number
- Fare
- Payment method

Buttons:
- Call Driver
- Chat Driver

==================================================
4. HEADING TO PICKUP STATE
==================================================

Create an active tracking state where:

Current stage:
“Heading to Pickup”

Show:
- driver moving toward Point A
- ETA to pickup
- distance to pickup
- pickup contact details
- customer notes
- navigation status

==================================================
5. ARRIVED AT PICKUP STATE
==================================================

Create a state where the driver has reached the pickup location.

Show:
“Driver Arrived at Pickup”

Include:
- arrival timestamp
- pickup address
- contact
- waiting indicator
- cargo loading status

Customer notification:
“Your driver has arrived at the pickup location.”

==================================================
6. CARGO LOADED / PASSENGER PICKED UP STATE
==================================================

Create a status screen showing:

For cargo:
“Cargo Loaded”

For Ride:
“Passenger Picked Up”

Include:
- pickup confirmation
- pickup timestamp
- optional proof of pickup photo
- next stage:
  In Transit

==================================================
7. IN TRANSIT STATE
==================================================

Create a live tracking state where the driver is traveling from Point A to Point B.

Show:
- route progress
- live vehicle position
- destination
- ETA
- distance remaining

Current status:
“In Transit”

Add message:
“Your delivery is on the way.”

==================================================
8. NEAR DESTINATION STATE
==================================================

Create a state showing:

“Driver Near Destination”

Show:
- ETA: 2–5 mins
- distance remaining
- destination details
- recipient name
- unloading instructions

Notification:
“Your driver is approaching the destination.”

==================================================
9. DELIVERED STATE
==================================================

Create a delivery-complete screen.

Use green success styling.

Show:
- “Delivered Successfully”
- Job ID
- Delivery completion timestamp
- Driver
- Vehicle
- Final fare
- Payment method

Show proof of delivery:
- delivery photo
- recipient name
- signature status if applicable

Buttons:
- View E-Receipt
- Rate Driver
- Book Again
- Back to Home

==================================================
10. CHAT SCREEN
==================================================

Create a detailed in-app chat page.

Header:
- Driver photo
- Juan Dela Cruz
- Verified badge
- Job ID
- Call button

Message thread example:
Customer:
“Hi Juan, please call me when you reach the depot.”

Driver:
“Sure Ma’am, I’m about 6 minutes away.”

Customer:
“Thank you.”

Input area:
- message field
- send button
- camera/photo attachment
- share location
- quick reply options

==================================================
11. CALL DRIVER STATE
==================================================

Create a simple call confirmation bottom sheet.

Show:
- Driver name
- Mobile contact
- “Call Juan Dela Cruz?”

Buttons:
- Call Now
- Cancel

==================================================
12. SHARE TRIP SCREEN / MODAL
==================================================

Create Share Trip functionality.

Show:
- Job ID
- Live location sharing
- Estimated arrival

Options:
- Copy Tracking Link
- Share via Messenger
- Share via SMS
- Share via WhatsApp
- Share via other apps

Include text:
“Anyone with this link can view the live trip status until the job is completed.”

==================================================
13. SOS EMERGENCY SCREEN
==================================================

Create an emergency modal/screen.

Use red accents.

Title:
“SOS Emergency”

Message:
“Use SOS only for emergencies or immediate safety concerns.”

Options:
- Alert KadaGo Admin
- Call Emergency Services
- Call Emergency Contact
- Share Live Location
- Report Accident
- Report Unsafe Behavior
- Report Cargo Issue

Require confirmation:
“Send Emergency Alert?”

Buttons:
- Send SOS
- Cancel

==================================================
14. NOTIFICATION STATES
==================================================

Create notification examples for:

- Driver Assigned
- Driver Heading to Pickup
- Driver Arrived
- Cargo Loaded
- In Transit
- Near Destination
- Delivered Successfully

Each notification should show:
- status icon
- short message
- timestamp

==================================================
15. TRACKING TAB
==================================================

Connect the existing Customer bottom navigation “Tracking” tab.

If customer has an active job:
→ open Live GPS Tracking

If no active job:
Create empty state:
“No Active Trip”
“Your current delivery or ride will appear here.”

Button:
“Book a Service”

==================================================
PROTOTYPE FLOW
==================================================

Make the following clickable:

Select & Book Confirmation
→ Active Job

Active Job
→ Live GPS

Status progression:
Driver Assigned
→ Heading to Pickup
→ Arrived at Pickup
→ Cargo Loaded / Passenger Picked Up
→ In Transit
→ Near Destination
→ Delivered

Active Job
→ Chat
→ Call Driver
→ Share Trip
→ SOS

Delivered
→ View E-Receipt
→ Rate Driver
→ Book Again

Bottom Navigation:
Tracking
→ Live GPS when active job exists

IMPORTANT:
Create Phase 5 only.
Do not create Rider Portal job controls yet.
Those will be created in the next phase.