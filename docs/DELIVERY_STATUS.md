# Delivery status

Updated 29 September 2026. This records observed state, not an organizer submission receipt.

| Deliverable | Verified state |
|---|---|
| Local app | Real UI case creation, persistent readback, reviewer note/version update and audit observed. ES/PT hypothesis and explicit choice implemented. |
| Private team demo | https://reclama-factored-2026.villafortech.chatgpt.site — V2 deployed; access changed to custom owner-only on 29 September at the explicit request of the owner. Teammate access requires exact emails. Never republish publicly without a new request. |
| Hosted authentication | V2 frontend rendered before the privacy change; normal ChatGPT OAuth reached an identity-provider security verification. Authenticated hosted case creation and two-real-account isolation remain unverified. A Sites audience bearer does not mint app identity; the API correctly returned 401. No bypass was attempted. |
| Private team source | https://github.com/VillaforTech/factored-hackathon-2026-reclama — private, branch codex/reclama. JorgeArguello1999 was invited with write access; acceptance remains pending. Daniel’s exact GitHub login and both demo emails are still required. Initial CI 36615993807 passed all 28 HTTP checks after the idempotency correction; the latest commit’s check must be read independently. |
| Additional tests | 160/160 contract assertions, 16 bilingual scenarios. Different tests and denominators from language-model accuracy and financial outcomes. |
| Model v2 | Frozen before independent test: 218/256 versus 168/256 rules. Entirely synthetic; zero exact normalized train/validation overlaps. No autonomous routing. Human PT review pending. |
| Presentation | Six editable slides and PDF in docs/presentation; historical V2 draft, access wording needs revision before submission. |
| Video | Narrated draft built from actual screenshots and explanatory slides; exact duration and provenance are in its manifest. Does not establish hosted login completion. |
| Submission | No organizer form, email or final submission has been sent. |

Known limits: no real bank backend, adjudication, refunds or certified live data. AI-authored labels and Portuguese wording require human review. Raw top-1 suggestions can be wrong (`other` recall 9/32); explicit reason selection is mandatory. Operational rate limits, retention and production monitoring require further work before handling real personal data. This private team sandbox must use invented data only.

## Final human acceptance

1. Open the private team URL in a normal browser and complete normal sign-in; create one fictional case and confirm it survives reload.
2. Have a second team member verify account isolation using their own account; never share cookies or tokens.
3. Review the Portuguese text and reserved labels; document corrections in a new evaluation round without retuning against this frozen test.
4. Rehearse the live timeout/retry and expired-session paths. Review the narrated draft before the official submission.
5. Submit the official package before 5 October 2026, 23:59 UTC−5, and preserve the actual receipt. Internal target 20:00.

## V3 implementation

Implemented owner-scoped saved runs, language changes without losing the current draft, pending-request cancellation on expiry, source-backed transaction candidates, explicit reuse of a customer message, improved receipt and confirmation facts/unknowns. Local additional checks: 16/16 run/locale HTTP regressions , 9/9 stale-context HTTP regressions and 20/20 deterministic assistant tests. These are not model accuracy or hosted two-account verification. Desktop and 390px mobile browser acceptance passed locally; see evidence/BROWSER_V3.md. Private V3 deployment is pending until the deployment result is recorded.
