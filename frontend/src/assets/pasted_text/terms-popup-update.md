Update the existing KadaGo mobile prototype.

IMPORTANT:
Do not redesign the whole app.
Do not remove any existing flows or screens.
Keep the current branding, colors, typography, mobile size, and prototype structure.

I want to add a TERMS & CONDITIONS POP-UP on both the CUSTOMER LOGIN and RIDER / DRIVER LOGIN screens.

==================================================
MAIN IDEA
==================================================

When the user taps the main login button on either:

- Customer Login
or
- Rider / Driver Login

show a modal / pop-up first for Terms & Conditions.

Only after the user agrees should they continue to the next step.

==================================================
1. CUSTOMER LOGIN TERMS POP-UP
==================================================

On the Customer Login screen:

When the user taps:
“Log In & Continue”

show a centered modal / pop-up overlay.

Modal title:
“Terms & Conditions Agreement”

Subtitle:
“KadaGo Customer Platform Access”

Message:
“Before continuing, please review and accept KadaGo’s Terms & Conditions, Safety Policies, and applicable service rules.”

Use a scrollable content area.

Include summarized sections such as:

1. Acceptance of Terms
By using KadaGo, the customer agrees to the platform’s service rules and policies.

2. Accurate Booking Information
Customers must provide correct pickup, drop-off, recipient, and cargo/passenger details.

3. Fair Pricing & Booking Rules
Customers understand that rider offers may vary, and final booking is subject to driver availability and pricing floors.

4. Safety & Proper Use
Customers must use the app responsibly and only for legitimate rides, deliveries, hauling, and errands.

5. Payments & Cancellations
Payments, cancellations, and refund handling follow KadaGo platform policy.

6. Privacy & Verification
KadaGo may use account verification and service-related notifications for safety and platform operations.

At the bottom of the modal, add:

Checkbox:
“I have read and agree to the Customer Terms & Conditions”

Buttons:
- “I Agree & Continue”
- “Cancel”

Behavior:
- If checkbox is not selected, disable “I Agree & Continue”
- If user taps Cancel, close modal and remain on Customer Login
- If user agrees, continue to Customer Dashboard or next login step

==================================================
2. RIDER / DRIVER LOGIN TERMS POP-UP
==================================================

On the Rider / Driver Login screen:

When the user taps:
“Log In & Verify Identity”

show a centered modal / pop-up overlay.

Modal title:
“Terms & Conditions Agreement”

Subtitle:
“KadaGo Rider / Driver Platform Access”

Message:
“Before continuing, please review and accept KadaGo’s Rider Operating Policies, Safety Policies, Verification Rules, and Minimum Pricing Floor policies.”

Use a scrollable content area.

Include summarized sections such as:

1. Acceptance of Terms
Riders agree to follow KadaGo platform rules and transport regulations.

2. Verified Identity Requirement
Only the approved rider account owner may use the account.

3. Face Verification on Login
Rider login requires face verification to prevent impersonation and account sharing.

4. Vehicle & Document Compliance
Riders must maintain valid driver’s license, OR/CR, required vehicle details, and other submitted documents.

5. Minimum Pricing Floors
Riders acknowledge KadaGo pricing floors and offer rules.

6. Professional Conduct & Safety
Riders must provide safe, lawful, and professional service to customers.

7. Admin Review & Account Restrictions
KadaGo may suspend or restrict accounts for failed verification, expired documents, or policy violations.

At the bottom of the modal, add:

Checkbox:
“I have read and agree to the Rider Terms, Operating Policies & Minimum Pricing Floors”

Buttons:
- “I Agree & Continue”
- “Cancel”

Behavior:
- If checkbox is not selected, disable “I Agree & Continue”
- If user taps Cancel, close modal and remain on Rider Login
- If user agrees, continue to Face Verification and then Rider Dashboard

==================================================
3. MODAL DESIGN
==================================================

Use a clean modern modal style.

Style:
- centered modal
- rounded corners
- white background
- soft shadow
- dark readable text
- blue accent for Customer modal
- orange accent for Rider modal
- dark semi-transparent overlay behind the modal

Include:
- close icon at top right
- scrollable content area
- sticky action area at bottom if needed

==================================================
4. PROTOTYPE DATA / DEMO FLOW
==================================================

Because this is a prototype, keep the existing pre-filled demo login data.

Customer example:
- customer@kadago.demo
- Maria Clara Santos

Rider example:
- rider@kadago.demo
- Juan Dela Cruz

The modal should appear after tapping the login button, even when demo data is already pre-filled.

If user agrees:
- Customer → continue into Customer system
- Rider → continue into Rider face verification, then Rider system

==================================================
5. OPTIONAL SAVED CONSENT STATE
==================================================

For prototype simplicity, you may create one of these behaviors:

Option A:
Show the Terms pop-up every time the login button is tapped

or

Option B:
Show it only the first time, then remember user consent in the prototype

If easier for prototype presentation, use Option A.

==================================================
6. KEEP EXISTING LOGIN PAGES CLEAN
==================================================

Do not clutter the login page with long terms text.

The detailed terms should live inside the modal/pop-up only.

A small link under the login button is okay:
“View Terms & Conditions”

But the main behavior should be:
Tap login button → Terms pop-up → Agree → Continue

==================================================
7. PROTOTYPE CONNECTIONS
==================================================

Connect the flow like this:

Customer Login
→ Tap “Log In & Continue”
→ Terms & Conditions Pop-up
→ Agree
→ Customer Dashboard

Rider Login
→ Tap “Log In & Verify Identity”
→ Terms & Conditions Pop-up
→ Agree
→ Rider Face Verification
→ Rider Dashboard

==================================================
8. DO NOT CHANGE THESE
==================================================

Do not remove:
- pre-filled demo data
- customer and rider login structure
- face verification flow for rider
- customer and rider role separation
- overall KadaGo branding

Only add the Terms & Conditions modal behavior to both login flows.