Continue the existing KadaGo mobile app design.

IMPORTANT:
Keep the exact same:
- mobile screen size
- KadaGo branding
- clean flat KadaGo logo
- dark navy brand style
- orange and blue accent colors
- green verified/success states
- red warning/SOS states
- typography
- card styles
- rounded buttons
- spacing
- icon style
- bottom navigation
- overall visual consistency

Do not redesign any existing Phase 1–7 screens.

Create PHASE 8:
FLEET OPERATOR PORTAL + ADMIN COMMAND CENTER.

==================================================
PART A: FLEET OPERATOR PORTAL
==================================================

The Fleet Operator Portal is for businesses or operators managing multiple vehicles and drivers.

==================================================
1. FLEET OPERATOR DASHBOARD
==================================================

Create main Fleet Operator dashboard.

Header:
- KadaGo logo
- Label: “Fleet Operator Portal”
- Operator/company name
- Current location
- Notifications
- Profile

Summary cards:
- Active Drivers
- Available Vehicles
- Active Jobs
- Completed Jobs Today
- Today’s Fleet Earnings
- Vehicles Under Maintenance

Example:
Active Drivers: 12
Available Vehicles: 9
Active Jobs: 6
Completed Today: 18
Fleet Earnings: ₱18,450
Maintenance: 2

==================================================
2. DRIVER MANAGEMENT
==================================================

Create “My Drivers” screen.

Each driver card should show:
- Driver photo
- Full name
- Verified status
- Mobile number
- Assigned vehicle
- Online / Offline
- Rating
- Completed jobs
- Current assignment

Actions:
- View Driver
- Assign Vehicle
- Suspend Driver
- Message Driver

Add:
“Add Driver”

==================================================
3. ADD DRIVER
==================================================

Create form with:
- Full name
- Mobile number
- Email
- Address
- Driver license
- License upload
- Police / Barangay clearance
- Profile photo
- Emergency contact
- Assign vehicle
- Submit for verification

Statuses:
- Pending
- Verified
- Rejected
- Needs Resubmission

==================================================
4. DRIVER DETAIL SCREEN
==================================================

Show:
- Driver information
- Rating
- Completed jobs
- Acceptance rate
- Current vehicle
- Current job
- Verification documents
- Review history
- Earnings contribution

Actions:
- Assign Vehicle
- Suspend
- Reactivate
- Edit Driver

==================================================
5. VEHICLE MANAGEMENT
==================================================

Create “Fleet Vehicles” screen.

Each vehicle card should show:
- Vehicle photo
- Vehicle name/model
- Plate number
- Vehicle type
- Cargo capacity
- Passenger capacity
- Assigned driver
- Status

Statuses:
- Available
- Active Job
- Maintenance
- Document Expired
- Inactive

Actions:
- View Details
- Assign Driver
- Set Maintenance
- Edit Vehicle

Add:
“Add Vehicle”

==================================================
6. ADD VEHICLE
==================================================

Fields:
- Vehicle type
- Make / model
- Plate number
- OR/CR
- Insurance
- Vehicle photos
- Cargo capacity
- Passenger capacity
- Year
- Color
- Special equipment
- Upload documents

Button:
“Submit Vehicle”

==================================================
7. VEHICLE DETAIL
==================================================

Show:
- Photos
- Plate
- OR/CR
- Insurance
- Capacity
- Assigned driver
- Current status
- Maintenance history
- Document expiry dates

Actions:
- Assign Driver
- Switch Driver
- Mark Maintenance
- Update Documents

==================================================
8. ASSIGN DRIVER TO VEHICLE
==================================================

Create modal/screen.

Show:
- selected vehicle
- list of verified drivers
- driver availability
- rating
- current assignment

Button:
“Assign Driver”

Prevent assignment if:
- driver is already on active job
- vehicle is under maintenance
- documents are expired

==================================================
9. ACTIVE FLEET JOBS
==================================================

Create screen showing all active fleet jobs.

Each job should show:
- Job ID
- Driver
- Vehicle
- Customer
- Service
- Pickup
- Destination
- Current status
- ETA
- Earnings

Button:
“Track Job”

==================================================
10. FLEET GPS MONITORING
==================================================

Create map screen showing multiple active fleet vehicles.

Show:
- vehicle markers
- driver names
- active job IDs
- pickup/destination
- status

Allow:
- tap vehicle
- view job details
- call driver
- message driver

==================================================
11. FLEET EARNINGS
==================================================

Create earnings dashboard.

Tabs:
- Today
- Week
- Month

Show:
- Gross fleet earnings
- Platform fees
- Driver payouts
- Fleet net earnings
- Completed jobs
- Pending payments

Create transaction list by:
- Job ID
- Driver
- Vehicle
- Service
- Gross
- Driver share
- Fleet share
- Status

==================================================
12. MAINTENANCE MANAGEMENT
==================================================

Create vehicle maintenance screen.

Show:
- Vehicle
- Plate
- Maintenance type
- Last service date
- Next service due
- Maintenance status

Statuses:
- Due Soon
- Overdue
- In Maintenance
- Completed

Actions:
- Schedule Maintenance
- Mark Completed
- Add Maintenance Note

==================================================
13. DOCUMENT EXPIRY REMINDERS
==================================================

Create compliance screen.

Show documents:
- Driver License
- OR/CR
- Insurance
- Clearance

Statuses:
- Valid
- Expiring Soon
- Expired

Actions:
- Notify Driver
- Upload Renewal
- Suspend Vehicle / Driver

==================================================
14. FLEET OPERATOR NOTIFICATIONS
==================================================

Examples:
- Driver accepted a job
- Vehicle document expiring
- Driver document expired
- New fleet earnings
- Vehicle entered maintenance
- SOS alert from driver
- Driver suspended
- New job completed

==================================================
15. FLEET OPERATOR PROFILE
==================================================

Show:
- Company / Operator name
- Contact person
- Mobile
- Email
- Address
- Business details

Sections:
- Company Information
- Bank / Payout Settings
- Notifications
- Privacy & Security
- Help & Support
- Logout

==================================================
16. FLEET BOTTOM NAVIGATION
==================================================

Create bottom nav:
- Dashboard
- Drivers
- Vehicles
- Jobs
- Earnings

==================================================
PART B: ADMIN COMMAND CENTER
==================================================

The Admin Command Center manages KadaGo users, riders, fleets, jobs, safety, verification, pricing, disputes, and platform operations.

==================================================
17. ADMIN DASHBOARD
==================================================

Create mobile Admin Command Center.

Header:
- KadaGo logo
- “Admin Command”
- Admin user
- Notifications
- Emergency alerts

Main summary cards:
- Pending Driver Approvals
- Pending Vehicle Approvals
- Active Jobs
- Online Riders
- SOS Alerts
- Open Complaints
- Payment Disputes
- Completed Jobs Today

Example:
Pending Drivers: 14
Pending Vehicles: 9
Active Jobs: 42
Online Riders: 67
SOS Alerts: 1
Complaints: 6
Disputes: 3
Completed Today: 128

==================================================
18. DRIVER APPROVAL QUEUE
==================================================

Create “Driver Verification” screen.

Each pending driver card:
- Photo
- Name
- Mobile
- Location
- Date submitted
- Vehicle
- Verification status

Buttons:
- Review
- Approve
- Reject

Filters:
- Pending
- Approved
- Rejected
- Needs Resubmission

==================================================
19. DRIVER VERIFICATION REVIEW
==================================================

Show:
- Identity information
- Face verification result
- Driver license
- License number
- Police / Barangay clearance
- Vehicle association
- Previous failed attempts
- Fraud risk indicators if applicable

Actions:
- Approve Driver
- Reject Driver
- Request Resubmission
- Suspend Account

Add admin notes field.

==================================================
20. VEHICLE APPROVAL QUEUE
==================================================

Create pending vehicle list.

Show:
- Vehicle image
- Make/model
- Plate
- Owner / Driver
- Vehicle type
- Capacity
- OR/CR status
- Insurance status

Buttons:
- Review
- Approve
- Reject

==================================================
21. VEHICLE VERIFICATION REVIEW
==================================================

Show:
- Vehicle photos
- Plate number
- OR/CR
- Insurance
- Vehicle specs
- Cargo capacity
- Passenger capacity

Actions:
- Approve
- Reject
- Request New Document
- Suspend Vehicle

==================================================
22. FACE VERIFICATION REVIEW
==================================================

Create screen for accounts that failed face verification 3 times.

Show:
- User photo
- Registered ID photo
- Face scan result
- Attempts
- Reason for review
- Account type

Buttons:
- Approve Identity
- Request New Verification
- Reject
- Suspend Account

==================================================
23. USER MANAGEMENT
==================================================

Create screen with tabs:
- Customers
- Riders
- Fleet Operators

Search by:
- Name
- Mobile
- Email
- User ID

Each card:
- Name
- Account type
- Verification status
- Account status
- Jobs
- Date joined

Actions:
- View
- Suspend
- Reactivate

==================================================
24. LIVE JOB MONITORING
==================================================

Create Admin Active Jobs screen.

Show:
- Job ID
- Customer
- Driver
- Vehicle
- Service
- Pickup
- Destination
- Fare
- Status
- ETA

Filters:
- Active
- Delayed
- SOS
- Disputed
- Completed

Button:
“View Live Tracking”

==================================================
25. ADMIN LIVE GPS MAP
==================================================

Create full-screen admin map.

Show all active KadaGo jobs.

Use markers:
- Rider
- Customer pickup
- Destination
- SOS alert

Allow filtering by:
- Ride
- Parcel
- Pabili
- Hardware
- Heavy Trucking
- Lipat-Bahay

Tap marker to show:
- Job
- Driver
- Customer
- Status
- ETA

==================================================
26. SOS ALERT CENTER
==================================================

Create high-priority emergency screen.

Use red design accents.

Each alert:
- SOS ID
- Job ID
- User
- Driver
- Location
- Time
- Alert type

Types:
- Accident
- Unsafe Behavior
- Cargo Issue
- Medical Emergency
- Vehicle Problem
- Other

Actions:
- View Live GPS
- Call Rider
- Call Customer
- Contact Emergency Services
- Resolve Alert

==================================================
27. COMPLAINTS & DISPUTES
==================================================

Create complaints management screen.

Show:
- Complaint ID
- Job ID
- Customer
- Driver
- Type
- Status
- Date

Categories:
- Driver behavior
- Customer behavior
- Payment
- Damage
- Missing item
- Cancellation
- Pricing
- Safety
- Other

Statuses:
- New
- Under Review
- Waiting for Customer
- Waiting for Driver
- Resolved
- Closed

==================================================
28. COMPLAINT DETAIL
==================================================

Show:
- Complaint description
- Job details
- Customer statement
- Driver statement
- Uploaded photos
- Chat history
- GPS / timeline
- Payment information

Admin actions:
- Message Customer
- Message Driver
- Issue Warning
- Refund Customer
- Adjust Rider Earnings
- Suspend Account
- Resolve Complaint

==================================================
29. PAYMENT DISPUTES
==================================================

Create payment dispute queue.

Show:
- Job ID
- Customer
- Rider
- Payment method
- Amount
- Dispute reason
- Status

Actions:
- Review
- Refund
- Release Payment
- Hold Payment
- Escalate

==================================================
30. PRICING FLOOR MANAGEMENT
==================================================

Create Admin Pricing Management screen.

Show service categories:
- Ride
- Parcel
- Pabili
- Hardware & Cement
- Heavy Trucking
- Lipat-Bahay
- Express
- Machinery
- Custom Hauling

For each:
- Minimum pricing floor
- Recommended price
- Base distance
- Per km rate
- Heavy cargo multiplier
- Helper fee
- Peak rate if used

Buttons:
- Edit
- Save Changes

Add warning:
“Pricing floors protect minimum driver earnings.”

==================================================
31. SERVICE CATEGORY MANAGEMENT
==================================================

Create screen where Admin can:
- Add Service
- Edit Service
- Enable / Disable Service
- Set vehicle requirements
- Set cargo limits
- Set passenger limits
- Configure pricing rules

==================================================
32. SERVICE AREA MANAGEMENT
==================================================

Create map/list screen.

Manage:
- City
- Municipality
- Barangay
- Active service areas

Example:
- Malaybalay City
- Valencia City
- Manolo Fortich
- Nearby Bukidnon areas

Actions:
- Add Area
- Enable
- Disable

==================================================
33. REVIEWS MODERATION
==================================================

Create screen for platform reviews.

Show:
- Reviewer
- Driver / Customer
- Rating
- Comment
- Job ID
- Reported status

Actions:
- Keep Review
- Hide Review
- Request Investigation

==================================================
34. ACCOUNT SUSPENSION
==================================================

Create suspension confirmation modal.

Show:
- User
- Reason
- Suspension duration

Options:
- Warning Only
- 24 Hours
- 7 Days
- 30 Days
- Permanent

Require admin note.

Button:
“Confirm Suspension”

==================================================
35. ADMIN REPORTS & ANALYTICS
==================================================

Create analytics dashboard.

Show:
- Total bookings
- Completed jobs
- Canceled jobs
- Revenue
- Average fare
- Active riders
- Customer growth
- Driver growth
- Average rating
- Complaints rate

Filters:
- Today
- Week
- Month
- Custom Date

Create simple mobile charts/cards.

==================================================
36. AUDIT LOGS
==================================================

Create Admin Audit Log screen.

Show:
- Admin name
- Action
- Target account / job
- Date
- Time

Examples:
- Approved Driver
- Suspended Account
- Changed Pricing Floor
- Refunded Customer
- Closed Complaint

==================================================
37. ADMIN NOTIFICATIONS
==================================================

Examples:
- New Driver Awaiting Approval
- Vehicle Document Submitted
- SOS Alert
- New Complaint
- Payment Dispute
- Document Expiry
- High Cancellation Rate
- System Alert

==================================================
38. ADMIN PROFILE & SETTINGS
==================================================

Sections:
- Admin profile
- Permissions
- Security
- Notification settings
- Audit access
- Help
- Logout

==================================================
39. ADMIN BOTTOM NAVIGATION
==================================================

Create:
- Dashboard
- Users
- Jobs
- Safety
- More

“More” opens:
- Pricing
- Services
- Reviews
- Reports
- Audit Logs
- Settings

==================================================
40. EMPTY / ERROR STATES
==================================================

Create:
- No pending approvals
- No active complaints
- No SOS alerts
- No payment disputes
- No active jobs
- No fleet vehicles
- No drivers
- Network error
- Permission denied

==================================================
PROTOTYPE FLOWS
==================================================

FLEET FLOW:
Fleet Operator Login
→ Fleet Dashboard
→ Drivers
→ Driver Details
→ Assign Vehicle

Fleet Dashboard
→ Vehicles
→ Vehicle Details
→ Maintenance

Fleet Dashboard
→ Active Jobs
→ Track Job

Fleet Dashboard
→ Earnings

ADMIN FLOW:
Admin Command
→ Dashboard
→ Pending Driver
→ Review Driver
→ Approve / Reject

Admin Dashboard
→ Vehicle Verification
→ Approve / Reject

Admin Dashboard
→ SOS Alert
→ View GPS
→ Resolve Alert

Admin Dashboard
→ Complaint
→ Complaint Details
→ Resolve

Admin Dashboard
→ Pricing
→ Edit Pricing Floor

Admin Dashboard
→ Reports

IMPORTANT:
Create Phase 8 only.
Do not redesign Customer or Rider screens.
Keep Fleet and Admin clearly different from Customer and Rider while staying within the KadaGo brand system.