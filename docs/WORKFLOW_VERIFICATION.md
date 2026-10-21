# KadaGo workflow verification — 2026-10-21

Scope: repair the seven audited issues in the existing customer, Admin and individual truck operator journey. Existing screen layouts and sign-in sequence were retained.

## Repairs

1. Declining an assignment saves a required reason and explanation, releases its truck, returns the request to matching, excludes the declined operator from that request's next match, and preserves a private declined-assignment history.
2. Admin proposes a positive hauling rate after assignment confirmation. The operator confirms or requests review before Admin finalizes it. Zero rates cannot be confirmed. Legacy zero-rate confirmations can receive a fresh proposal.
3. Admin can revise a declined quotation and send a new quotation while retaining the previous quotation record.
4. Admin can resolve a cargo issue with a required resolution note. Unresolved cargo and payment issues prevent completion.
5. Requested deposits and verified receipts are separate. Only received, verified deposits reduce the payable balance. Full prepayment still requires delivery and customer confirmation before completion.
6. Receipts and payment issue evidence use real image uploads. Evidence previews serve actual uploaded bytes. Driver income, completed counts, ratings and historical lists use saved records; monthly income uses verification dates. Current request details replace sample identities, routes and schedules in the repaired screens. Driver availability updates registered trucks.
7. Actions that advance the workflow await the saved result. Errors remain visible until dismissed or retried; a failed save does not show success or advance to the next screen.

The browser check also caught a pickup blocker: timestamp photo IDs exceeded the API's numeric limit. Uploads now use the existing bounded photo sequence. Delivery's optional receiver role is also optional in the API.

## Verification

- TypeScript checking and production build.
- Backend and matching regression suite: 40 tests, including request persistence, assignment safety, decline/rematch, positive rates, quotation revision, both agreements, actual image upload/download, pickup/delivery gates, issue resolution, partial/full deposits, rejected-payment correction, verified balance payment, completion and one-time rating.
- Headless Chrome at 390 × 844 using the built application and isolated in-memory booking handlers. Browser actions verified rate proposal/confirmation, quotation send, customer decline, Admin revision/resend, both agreement confirmations, pickup and delivery with uploaded files, customer cargo issue submission, Admin resolution, deposit verification, delivery confirmation, receipt upload, Admin balance verification, completion, customer rating and operator earnings.
- A forced HTTP 409 during delivery confirmation left the confirmation dialog open and the saved booking unchanged. Retrying succeeded.
- The synthetic browser booking completed with a PHP 9,000 rate: PHP 2,000 verified deposit plus PHP 7,000 verified balance. The operator saw one completed booking and the saved customer rating. No browser runtime exceptions occurred during that journey.

These tests used synthetic accounts and isolated storage. They did not create or change production customer bookings, test a live Google login, or establish live MongoDB availability.

## Current flow

Customer request → Admin match → operator confirm/decline → Admin rate proposal → operator rate response → Admin quotation → customer accept/decline → customer agreement → operator agreement → pickup/evidence → delivery/evidence → customer confirmation or issue → verified payment → completion → rating and operator income records.

## Remaining application limits

The verified operational journey is for the individual operator portal. The separate fleet portal, several Admin dashboard counters/reports/maps and other auxiliary screens still contain prototype content. Login facial verification and some agreement acknowledgment/export controls remain demonstrations. Live GPS requires the operator's device permission and location sharing; illustrative maps are still labeled as demos. Payments are recorded and verified after being made outside KadaGo; the application does not transfer money.

This verification establishes the repaired journey and tested branches, not production readiness of every screen or external service.
