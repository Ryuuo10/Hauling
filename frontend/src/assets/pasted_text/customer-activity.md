Continue the existing KadaGo mobile app design.

IMPORTANT:
Keep the exact same:
- mobile screen size
- KadaGo logo
- dark navy brand style
- orange primary actions
- blue customer actions
- green verified/success states
- red danger/emergency actions
- typography
- rounded cards
- spacing
- icon style
- bottom navigation
- overall visual consistency

Do not redesign any existing Phase 1–5 screens.

Create PHASE 6: CUSTOMER ACTIVITY, HISTORY, E-RECEIPT, RATINGS & FEEDBACK.

==================================================
1. ACTIVITY & PAST DELIVERIES SCREEN
==================================================

Create a mobile screen called:
“Activity & Past Deliveries”

This screen opens from the existing Customer bottom navigation:
Activity

Header:
- Back button if needed
- Title: “Activity & Past Deliveries”
- Subtitle:
  “Your transport & hauling records”

Create 3 tabs:
- Active
- Completed
- Canceled

Default tab:
Completed

Each job card should show:
- Service category
- Job ID
- Date
- Item or passenger summary
- Pickup location
- Destination
- Driver name
- Vehicle
- Price
- Payment method
- Job status

Example completed job:

Category:
Hardware & Cement

Job ID:
KG-12389

Item:
30 Sacks of Portland Cement (Type 1)

Pickup:
ABC Hardware & Construction Depot, Fortich St.

Destination:
Lot 14 Blk 3, Pinecrest Subdivision, Brgy. San Jose

Driver:
Juan Dela Cruz

Vehicle:
Isuzu Elf Dropside Truck

Fare:
₱850

Payment:
GCash

Status:
Delivered

Buttons:
- View Details
- View E-Receipt
- Book Again

==================================================
2. ACTIVE TAB
==================================================

Create an Active tab state.

Show current ongoing bookings.

Each active card should include:
- Job ID
- Service
- Driver
- Current status
- ETA
- Pickup
- Destination

Button:
“Track Live”

If there are no active jobs:
Create empty state:
“No Active Jobs”

Text:
“Your current ride or delivery will appear here.”

Button:
“Book a Service”

==================================================
3. COMPLETED TAB
==================================================

Show multiple sample completed jobs.

Include examples:
- Hardware & Cement
- Passenger Ride
- Parcel Delivery
- Pabili / Errand
- Lipat-Bahay

Completed cards should show:
- Delivered badge
- Final price
- Driver
- Date

Buttons:
- View E-Receipt
- Rate Driver
- Book Again

If the customer already rated the driver:
Replace “Rate Driver” with:
“View Review”

==================================================
4. CANCELED TAB
==================================================

Create canceled booking cards.

Show:
- Job ID
- Service
- Date
- Pickup
- Destination
- Cancellation status
- Who canceled:
  Customer / Driver / System

Optional:
- Cancellation reason
- Refund status

Example:
“Canceled by Customer”

Refund status:
“Refund Completed”
or
“No charge made”

Buttons:
- View Details
- Book Again

==================================================
5. JOB DETAILS SCREEN
==================================================

Create a full booking details screen for a completed job.

Title:
“Job Details”

Show:
- Job ID
- Status
- Service type
- Date & time
- Customer
- Driver
- Driver rating
- Vehicle
- Plate number
- Pickup address
- Destination address
- Cargo/passenger details
- Helpers if applicable
- Final fare
- Payment method

Add delivery timeline:
- Driver Assigned
- Heading to Pickup
- Arrived
- Picked Up / Cargo Loaded
- In Transit
- Near Destination
- Delivered

Show completion timestamp.

Buttons:
- View E-Receipt
- Book Again
- Rate Driver

==================================================
6. E-RECEIPT SCREEN
==================================================

Create a professional digital receipt.

Header:
“KadaGo E-Receipt”

Show KadaGo logo.

Include:

TRANSACTION
- Job ID
- Transaction ID
- Date
- Completion time

CUSTOMER
- Maria Clara Santos

DRIVER
- Juan Dela Cruz
- Verified Driver

VEHICLE
- Isuzu Elf Dropside Truck
- Plate: ABC 1234

SERVICE
- Hardware & Cement

PICKUP
- ABC Hardware & Construction Depot

DESTINATION
- Lot 14 Blk 3, Pinecrest Subdivision

FARE BREAKDOWN
- Base / Agreed Fare
- Helper Fee if applicable
- Additional Fee if applicable
- Discount if applicable
- Total

Example:
Agreed Fare: ₱850
Helper Fee: Included
Total Paid: ₱850

PAYMENT
- GCash
- Paid

Add:
- Payment status badge
- “PAID”

Buttons:
- Download Receipt
- Share Receipt
- Back to Activity

==================================================
7. RATE DRIVER SCREEN
==================================================

Create a post-delivery customer rating screen.

Title:
“How was your KadaGo experience?”

Driver card:
- Juan Dela Cruz
- Verified Driver
- Vehicle
- Job ID

Main rating:
1–5 stars

Rating categories:
- Driver Professionalism
- Communication
- Safety
- Timeliness
- Vehicle Condition
- Cargo Handling

Use simple 1–5 star controls or rating chips.

Comment box:
“Tell us about your experience”

Optional:
- Upload Photo

Checkbox:
“Show my review publicly”

Button:
“Submit Review”

==================================================
8. REVIEW SUBMITTED SCREEN
==================================================

Create a green success screen.

Show:
- Success icon
- Title:
  “Thank You for Your Feedback!”

Message:
“Your review helps KadaGo maintain safe and reliable service.”

Show submitted rating:
Example:
5.0 ★

Buttons:
- Back to Activity
- Back to Home

==================================================
9. VIEW MY REVIEW SCREEN
==================================================

Create screen showing an already submitted review.

Include:
- Driver
- Job ID
- Date
- Star rating
- Category ratings
- Customer comment
- Uploaded image if any
- Verified Review badge

Button:
- Edit Review

Optional:
Allow editing only within a limited period.

==================================================
10. BOOK AGAIN FLOW
==================================================

When customer taps:
“Book Again”

Create a confirmation screen/modal.

Title:
“Book This Service Again?”

Pre-fill:
- Service category
- Previous pickup
- Previous destination
- Previous item/passenger details
- Previous vehicle type

Important:
Do NOT automatically reuse the previous price.

Show:
“Current pricing may vary based on availability, distance, and pricing floors.”

Buttons:
- Continue to Booking
- Cancel

Continue to Booking should reopen the existing Request Builder with previous details pre-filled.

==================================================
11. PUBLIC FEEDBACK & REVIEWS SCREEN
==================================================

Connect the existing:
“Read Reviews & Feedbacks”

Create a public feedback screen.

Header:
“KadaGo Reviews & Feedback”

Show:
- Overall rating:
  4.92 / 5.0
- Total verified reviews

Rating breakdown:
- 5 stars
- 4 stars
- 3 stars
- 2 stars
- 1 star

Filters:
- All
- Customer Reviews
- Driver Reviews
- Latest
- Highest Rated

Each review card should show:
- Reviewer first name or display name
- Verified Review badge
- Rating
- Date
- Service used
- Comment

Do not display private customer information.

==================================================
12. RECEIPT / REVIEW NOTIFICATIONS
==================================================

Create notification examples:

- “Delivery Completed”
- “Your E-Receipt is Ready”
- “Rate Your Driver”
- “Thank You for Your Review”
- “Your GCash Payment Was Successful”

==================================================
13. EMPTY STATES
==================================================

Create:
- No booking history
- No completed jobs
- No canceled jobs
- No reviews yet

Example:
“No Booking History Yet”

Text:
“Your completed rides and deliveries will appear here.”

Button:
“Book Your First Service”

==================================================
14. BOTTOM NAVIGATION
==================================================

Use existing Customer bottom navigation:
- Home
- Vacant
- Activity
- Tracking
- Offers

Highlight Activity when on history screens.

==================================================
PROTOTYPE FLOW
==================================================

Create these clickable paths:

Customer Home
→ Activity

Activity
→ Active
→ Track Live

Activity
→ Completed
→ Job Details
→ E-Receipt

Completed Job
→ Rate Driver
→ Review Submitted

Completed Job
→ Book Again
→ Existing Request Builder with details pre-filled

Customer Home
→ Public Feedback
→ Reviews & Feedback

Notification:
“Your E-Receipt is Ready”
→ E-Receipt

IMPORTANT:
Create Phase 6 only.

Do not create Rider earnings or Rider job management yet.
Do not create Admin or Fleet Operator screens yet.