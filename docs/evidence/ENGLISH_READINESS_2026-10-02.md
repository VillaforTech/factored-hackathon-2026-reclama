# English readiness and local verification

2 October 2026. Automated assistant review, not human linguistic certification.

## Completed

- Translated 652 user-visible strings/text nodes across all eleven `/guia` chapters, its metadata and shared note labels. Preserved chapter navigation, data exercise, nine workflow stages, case-type simulation, architecture selector, character explorer, historical chart, seven failure scenarios and consent exercise. `lang="en"` and numeric formatting match the English guide.
- Current README, ML README, reviewer companion, cost model, delivery/access documentation, submission draft and video entry points are English. Historical frozen model/evidence/media sources remain unchanged, with their meaning and limits explained in the reviewer companion. Exact ES/PT app labels and examples are intentionally retained where needed.
- TypeScript, application ESLint, production build and provenance checks **6/6 passed** after the translation. The first lint pass found ten unescaped JSX apostrophes; these were corrected before the successful pass.
- [Local browser receipt](guide-english-qa-2026-10-02.json): **18/18 checks passed** using existing Playwright/Chromium. All eleven chapters rendered; interaction outcomes and ES/PT historical counts remained correct. Continuous mode had eleven headings; no page-width overflow at 1440 or 390 pixels. Desktop architecture and mobile overview screenshots were visually inspected by the assistant.
- No unexpected browser errors. The first harness incorrectly treated the signed-out homepage's expected `/api/session` 401 as a guide error; the rerun records that exact expected response separately. No login or case writes were performed. `agent-browser` was unavailable; no tools were installed.
- React review: no new hooks, network effects, authorization paths or component structure changes; stable existing keys and accessible control labels preserved. New English text and updated documentation account for the change.

## Preserved and not completed

- User stopped English video work. A local render completed before that instruction, was not delivery-validated or uploaded, and remains separately under ignored `work/english-review/english.mp4`. The original MP4 and SRT were restored exactly to their existing manifest SHA-256 hashes. No further English narration, subtitle or video production is part of this task. Original manifest and Library media identities are unchanged.
- Separate worker's English PPTX/PDF Library v2 were reported complete by the parent; they were not edited or re-reviewed by this worker.
- Hosted acceptance, independent/challenge-admissible model evaluation, human Portuguese review and organizer submission are not completed. The English guide is local, not the currently deployed edition. Full-package English compliance is not claimed because the original video remains Spanish-captioned by user choice.
- Build emits existing Vinext route-classification and Node deprecation notices; compilation succeeds. These warnings do not establish hosted acceptance.

The authorized work changed only the separate acceptance checkout. No original checkout, other worker's slides, model bytes, private source rows or credentials were modified. No push, merge, deploy, audience change or organizer message was performed.
