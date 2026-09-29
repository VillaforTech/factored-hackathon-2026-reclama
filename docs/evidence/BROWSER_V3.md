# V3 browser acceptance

Executed 29 September 2026 against the local Sites application at 127.0.0.1:5173 with agent-browser. This used the documented local sign-in, real UI actions and persistent local D1. It is not evidence of hosted OAuth or two real accounts.

- Created a fresh saved run through its confirmation dialog; previous runs remained available.
- Spanish and Portuguese Luna Digital amount queries returned two candidates with distinct times; neither was selected automatically.
- Explicit candidate selection and “Usar este relato” populated the form. Changing ES to PT preserved the chosen transaction, exact customer declaration and reason.
- Prepared the immutable confirmation, inspected source facts, unverified declaration and unknowns before checking consent.
- Registered case RC-8FD1F8BF in Portuguese, opened the reviewer inbox, explicitly entered the sandbox reviewer role, saved a review note and observed status “Em análise” with audit versions 1 and 2.
- At 390 × 844, document width was 390px: no horizontal overflow. The formatted COP search “75.800” returned only Mercado Horizonte. Screenshots were visually inspected.
- “Expirar sessão” cleared transactions, cases and editable state and disabled the composer. Starting a new session recovered the same run and persisted case with the updated review status.
- Browser error collector reported no uncaught page errors at the end of the main flow.

Screenshots: `browser-v3/candidates-pt.png`, `browser-v3/review-pt.png`, `browser-v3/mobile-pt.png`. These are actual rendered local UI, not mockups.

Separate checks: 20 deterministic assistant tests, 16 run/locale HTTP regressions, 9 stale-context HTTP regressions, TypeScript and lint passed. Frozen classifier evaluation is unchanged. Portuguese still needs a fluent human review.
