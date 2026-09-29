# Interactive project guide — local verification

Date: 2026-09-29. Route: `/guia`. The guide explains functional V3 source commit `c0d9fe6f7ed9654fe8979f0b765f76d30fb22a9d`; it does not change that model or the case API.

## Observed locally

- HTTP 200 at the guide route; TypeScript and application ESLint pass. The normal `lint:app` command now includes the guide.
- Eleven chapters render individually and in continuous reading mode.
- Case explorer: selecting step 7 shows persistence/read-back; changing Approved to Pending changes the result to support intake.
- Data exercise distinguishes an existing foreign key from matching ownership, with different feedback for both answers.
- Character explorer normalizes `não reconheço`; selecting five-character fragments produces the expected visible padded fragments. This is an extractor demonstration, not a model inference.
- Evaluation selector renders PT counts 84/128, 102/128, 108/128 and ES counts 84/128, 109/128, 110/128 for rules/V1/V2. The statistical intervals are explicitly labeled as global ES+PT comparisons.
- Architecture persistence selector shows D1 responsibilities, the reason for the choice and the matching schema source link.
- Stale-tab fault selector shows `409 SESSION_CONTEXT_CHANGED` and states that the context marker does not grant authorization.
- Continuous mode contains 11 chapter headings and all six table wrappers are focusable, labeled regions. The Spanish guide has its own `lang="es"`; chapter focus carries the selected chapter name.
- At 390×844, document scroll width equals viewport width (390 pixels) in continuous mode. Mobile overview and desktop architecture at 1440×1000 were visually inspected. No browser errors were reported at the final local check.
- Independent read-only content reviews checked data/model claims and API/control boundaries. Corrections were applied for the card-product subset, global statistical intervals, sandbox reviewer scope, session role selection and the required regression output argument.

## Boundaries

These are local browser and source checks, not a screen-reader certification, a new heldout model evaluation, or hosted two-account acceptance. Interactive guide controls use page-local state and do not create banking cases. Original protected source rows and credentials are absent. Source links are pinned to V3; official references retain the research date and access limitations described in the guide. Deployment and GitHub CI results are verified separately after this source is built.
