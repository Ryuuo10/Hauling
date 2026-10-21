Update the existing KadaGo mobile prototype.

IMPORTANT:
Do not redesign the whole application.
Do not remove any existing Customer, Rider, Fleet, Admin, booking, tracking, or verification functionality.

Keep the existing:
- KadaGo logo
- mobile screen size
- blue Customer identity
- orange Rider / Driver identity
- green verified/success states
- red SOS/error states
- prototype connections

This update should improve:
1. Sign Up navigation
2. Rider Login visual style
3. Rider demo/predefined login data

==================================================
1. SIMPLIFY THE MAIN LANDING PAGE SIGN-UP
==================================================

On the main KadaGo landing page:

REMOVE the separate:
“Sign Up as Rider / Driver”

button from the main landing screen.

Keep only one general Sign Up action:

“New to KadaGo? Sign Up”

When the user taps:
“Sign Up”

open a new mobile screen:

“Create Your KadaGo Account”

==================================================
2. ACCOUNT TYPE SELECTION SCREEN
==================================================

Create a clean white-background page.

Title:
“Create Your KadaGo Account”

Subtitle:
“Choose how you want to use KadaGo.”

Show two large account type cards:

CUSTOMER

Icon:
Person / Customer

Description:
“Book rides, deliveries, errands, hauling, and other KadaGo services.”

Button / Card:
“Sign Up as Customer”

Use BLUE accents.

RIDER / DRIVER

Icon:
Truck / Driver

Description:
“Accept customer jobs, submit offers, transport passengers or cargo, and earn through KadaGo.”

Button / Card:
“Sign Up as Rider / Driver”

Use ORANGE accents.

Add:
“Already have an account? Log In”

==================================================
3. CUSTOMER SIGN-UP FLOW
==================================================

When user selects:
“Sign Up as Customer”

open Customer Registration.

Use the existing Customer registration flow.

Use the white-background style.

Include:
- Full Name
- Mobile Number
- Email
- Password
- Confirm Password

Because this is a prototype, add predefined editable demo values.

Example:

Full Name:
Maria Clara Santos

Mobile:
+63 917 555 0192

Email:
customer@kadago.demo

Password:
••••••••

Button:
“Create Customer Account”

Allow the prototype to continue without requiring the user to manually type every field.

==================================================
4. RIDER / DRIVER SIGN-UP FLOW
==================================================

When user selects:
“Sign Up as Rider / Driver”

connect to the existing Rider Certification flow.

Flow:

Sign Up as Rider / Driver
→ Basic Rider Registration
→ Vehicle & Documents
→ Official Face ID
→ Submit to Admin
→ Pending Admin Confirmation
→ Admin Approval
→ Verified Rider

Do not skip Rider certification.

==================================================
5. UPDATE RIDER LOGIN TO WHITE THEME
==================================================

Update the existing Rider Login screen shown in the reference image.

The current Rider Login uses a dark navy background.

Change it to the SAME clean white/light visual system used by the Customer login.

Use:

- White main background
- Very light gray secondary sections
- Dark navy text
- Orange Rider / Driver accent
- White cards
- Soft borders / shadows
- Orange primary login button
- Green verified states
- Red errors if needed

Keep KadaGo branding.

==================================================
6. RIDER LOGIN SHOULD BE RIDER-ONLY
==================================================

The Rider Login page should be dedicated only to Rider / Driver.

Do not show Customer/Rider toggle.

Do not require the user to switch account types inside this page.

Header:
“Log In as Rider”

Subtitle:
“Enter your credentials. You will pass face verification next.”

Keep:
- Continue with Google
- Mobile Number / Email
- Password
- Show/hide password

Remove:
“Want to log in as Customer? Switch”

The user can return using the Back button if they selected the wrong portal.

==================================================
7. PREDEFINED RIDER DEMO LOGIN DATA
==================================================

Because this is a prototype, pre-fill Rider Login with editable demo information.

Example:

Mobile Number:
+63 918 444 8821

Email:
rider@kadago.demo

Password:
••••••••

Rider:
Juan Dela Cruz

Account Status:
Verified Rider

Active Vehicle:
Isuzu Elf Dropside N-Series

Plate:
ABC 1234

Make the primary login button enabled using these predefined values.

Button:
“Log In & Verify Identity”

==================================================
8. RIDER LOGIN SECURITY
==================================================

Even with predefined prototype data, keep the face verification step.

Prototype flow:

Rider Login
→ Log In & Verify Identity
→ Face Verification
→ Identity Verified
→ Rider Dashboard

Use predefined/demo face verification success so the prototype presentation can continue easily.

Also keep optional prototype states for:
- Face Verification Failed
- Verification Under Review

==================================================
9. RIDER DEMO SHORTCUT
==================================================

Keep the existing:
“Rider Demo”

button on the landing page.

Rider Demo can use the same predefined verified Rider account:

Juan Dela Cruz
Verified Rider
Isuzu Elf Dropside N-Series
ABC 1234

Rider Demo should allow quick prototype access.

Normal Rider Login should still demonstrate:
Credentials
→ Face Verify
→ Rider Dashboard

==================================================
10. VISUAL CONSISTENCY
==================================================

Landing:
White/light background

Customer:
Blue accents

Rider:
Orange accents

Sign-Up Account Selection:
White background with separate Blue Customer and Orange Rider cards.

Customer Login:
White background + Blue

Rider Login:
White background + Orange

All screens should look like part of the same KadaGo application.

==================================================
11. PROTOTYPE CONNECTIONS
==================================================

Connect:

Landing
→ Sign Up
→ Choose Account Type

Choose Account Type
→ Sign Up as Customer
→ Customer Registration

Choose Account Type
→ Sign Up as Rider / Driver
→ Rider Registration
→ Certification
→ Admin Verification

Landing
→ Login as Rider
→ Rider Login
→ Face Verification
→ Rider Dashboard

Landing
→ Rider Demo
→ Rider Dashboard with predefined data

Landing
→ Login as Customer
→ Customer Login
→ Customer Dashboard

IMPORTANT:
Do not create duplicate dashboards or duplicate Rider Certification screens.

Reuse and connect the existing screens wherever possible.