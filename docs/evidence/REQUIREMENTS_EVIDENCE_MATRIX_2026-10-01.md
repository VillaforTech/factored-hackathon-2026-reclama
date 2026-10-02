# Reclama — requirements, evidence and remaining decisions

**Updated 2 October 2026. Private review package; not submitted.** This retains the Library identity and original creation-date filename. Local English documentation is complete; the original video remains unchanged by user instruction. Full submission compliance is not claimed.

## Official requirements and source coverage

[André requires English deliverables](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790871863271959). That thread and the [mock-data clarification](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549?thread_ts=1790698838.166839) were reread on 2 October. The [event hub](https://www.factored.ai/careers/ai-data-hackathon), reviewed earlier the same day, requires a public repository, a working deployed link, 4–6 slides and a video. The recorded deadline is [5 October, 23:59 UTC−5; video at most three minutes](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809). Recheck final announcements before submission.

The previously reviewed [challenge](https://docs.google.com/document/d/18AwONT8hQupRcfNPLFrPo6fHOJ_OUn1nBf-3jMnla2c/edit) calls for ES/PT customer interactions and an end-to-end banking workflow with a learned component compared against a baseline on a valid held-out set. Its Google Doc was not newly retrievable in the earlier 2 October browser check; no new clauses are attributed to it here. English explanation must coexist with ES/PT interaction. No numeric scoring weights or applicable exceptions are assumed.

| Requirement / dimension | Verified evidence | Status and limitation |
| --- | --- | --- |
| English documentation | All eleven local `/guia` chapters, shared labels and metadata translated; 652 entries. Current README, ML README, reviewer companion, cost, delivery/access documents, submission draft and video documentation are English. Local guide browser checks 18/18. | Local correction only. Hosted guide remains the earlier Spanish edition until approved deployment. Frozen historical sources stay unchanged with an English companion. Video-language compliance remains pending. |
| ES/PT interaction | Recorded ES intake and PT support handoff; previous automatic review covered 195 literal UI pairs and 18 assistant keys per locale. Customer app source is unchanged in this correction. | No competent human Portuguese review claimed. Spanish/Portuguese examples remain deliberately in their original language. |
| Focused complete workflow | 15/15 prepared local API sequences: five ES intakes, five PT clarifications with no write, five PT handoffs. [Receipt](full-case-rerun-2026-10-02.json). | Engineering QA with invented fixtures, not representative banking evaluation or financial resolution. |
| Safe controls and recovery | Identity, ownership, consent and idempotency remain outside the classifier. Original continuous UI take passed 9/9 assertions, including reload, reviewer version 2 and lost-response retry without duplication. | Local development identity only. Hosted login and two-real-account isolation are not established. No general zero-risk claim. |
| Learned component and baseline | Frozen model; archived authored comparison 218/256 versus rules 168/256. Provenance/freeze checks 6/6 passed after translation. | 256 AI-authored messages in 128 ES/PT families, without organizer records or human review. **Not independent validation or an admissible challenge benchmark.** No retraining or relabeling performed. |
| Admissible test feasibility | Read-only aggregate audit of existing CSVs: 700 complaints have five exact/normalized descriptions; each description mixes all four `case_type` values. 1,748 customer transcripts have 42 variants, all declared `es`; 7,095 contact reasons have six variants. Twelve existing partitions per table, zero additional local partitions. | No defensible eight-intent ES/PT held-out test established. `case_type` is not the intent taxonomy. Need suitable authorized unseen data, independent bilingual labels and a grouped protocol; human labeling cannot create missing diversity. No raw rows exported. |
| Mock-data rule | Organizer permits generated mocks with context but excludes their use for testing. | No exception inferred. Scope for engineering QA fixtures remains unresolved; those checks are never presented as challenge-valid model testing. No organizer contacted. |
| Latency and cost | Local sequence p50/p95: normal ES 110.15/265.60 ms; ambiguous PT 37.01/54.38 ms; handoff PT 101.37/104.55 ms. Five attempts per scenario, 70 measured requests. | Setup, login, browser rendering, human decisions and hosted network excluded. Build shared the Mac. Nearest-rank p95 equals the maximum at n=5. Total cost unknown; no financial-resolution denominator. |
| Deployment and access | Existing [restricted demo](https://reclama-factored-2026.villafortech.chatgpt.site), V6 from `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`. Recorded deployment succeeded; audience remains owner plus two authorized visitors. Anonymous GET returned 401. | No deployment from this correction. Parent coordinates secure hosted login; normal login, reload and real-account A/B checks remain pending. Anonymous denial does not establish failed normal login. |
| Public repository | [Repository](https://github.com/VillaforTech/factored-hackathon-2026-reclama) remains private. Default `codex/reclama` at `3ae216e`; [draft PR #2](https://github.com/VillaforTech/factored-hackathon-2026-reclama/pull/2) remote `fa53b35` has passing CI. English changes are local on `codex/reclama-acceptance-v6-20261002`. | Official public-repository requirement unresolved. No push, merge, publication or deployment authorized here. Local changes do not inherit another SHA's CI. |
| Presentation | Separate worker delivered English six-slide PPTX plus notes and PDF, both Library v2; parent confirmed completion. IDs below. | This worker did not alter or independently re-review those outputs. Spanish V5 repository binaries remain historical and must not be substituted. |
| Video | Original continuous local capture: 107.320 seconds, fourteen Spanish explanatory subtitle cues, no audio. MP4/SRT exactly match original manifest hashes. No cuts or acceleration. | **English-video work stopped by explicit user instruction.** A local English render completed before the stop, was never delivery-validated or uploaded, and is retained separately in ignored work. Original video-language compliance remains unresolved; no exemption claimed. |
| Organizer submission | [English unsent draft](../SUBMISSION_DRAFT.md) references the original interactive video and flags language/access/evaluation gaps. Recorded recipient `hackathon.admin@factored.ai`. | Not sent; no receipt. Recheck recipient/announcements and obtain explicit sending approval. |

## Checks and failures

- **Passed now:** TypeScript, application ESLint, production build, provenance/frozen evidence 6/6, guide browser 18/18, diff whitespace check. Assistant visually inspected desktop architecture and mobile overview; no document-width overflow at 1440/390 px.
- **Corrected during review:** ten JSX apostrophe lint errors. Initial browser harness flagged the expected signed-out homepage `/api/session` 401; rerun recorded that exact response separately and found no unexpected errors.
- **Video attempt:** the first English narration attempt failed because a 6.433-second phrase exceeded its 5.858-second slot. A shorter local render completed before the stop instruction. No full delivery review, listening claim or Library media replacement followed; originals were restored and hash-verified.
- **Not run/completed:** hosted account acceptance, independent/challenge-valid model evaluation, human language/listening review, representative safe-resolution or harm rates, total billed cost, publication and organizer submission.
- **Preservation:** original checkout at `6715df4`, earlier working copy at `fde31ef`, prior PR copy at `e2f58a6` and release copy at `3ae216e` were checked clean. Only the separate acceptance checkout changed. No private rows, credentials, model weights or another worker's slide files were changed.

The 15 API attempts, nine recorded UI assertions, 28 historical HTTP checks and 160 repeated contract assertions have separate denominators. They are not financial cases resolved. The 160 contract assertions created no cases. Zero financial resolutions is by design, not a zero-cost result.

The [conditional cost model](CASE_COST_MODEL_2026-09-30.md) uses public Workers/D1 tariffs rechecked on 2 October; the actual Sites billing plan, billable CPU, database rows and invoice remain unmeasured. No runtime external-model API is required; total cost is still unknown.

Human Portuguese review, human listening review and two-account acceptance are internal credibility/safety recommendations, not additional textual organizer clauses. The English deliverable rule and public-repository rule are official.

## Retained Library identities

| Artifact | Exact identity and state |
| --- | --- |
| English PPTX | `libfile_2903b3baa6048191b0ea20acb3b7b8a3`, v2, separate worker/parent confirmation; untouched here. |
| English PDF | `libfile_b38a58b1715c81918bfcb742f6ddc0b5`, v2, separate worker/parent confirmation; untouched here. |
| Original interactive video | `libfile_f5b35f28dae88191b47ae89ba8235bc5`, initial upload unchanged. |
| Original Spanish SRT | `libfile_7f35053934f88191ad759fd0cf1aa3d0`, initial upload unchanged; identity re-resolved from Library. |
| Original manifest | `libfile_8be706f0e53c81918977983db036cbf2`, initial upload unchanged. |
| This matrix | `libfile_0cad1f86ce7c8191abf96eeb27e405a2`; use the confirmed replacement receipt for its current version. |

## Approval package

The [exact approval document](../ACCESS_APPROVAL_2026-09-30.md) separates local completion from consequences: approve any push/integration into `codex/reclama` and exact-SHA deployment; decide public repository or obtain a written exception; identify and authorize judge access; resolve evaluation and video-language compliance; separately authorize submission. Publication exposes repository history/code/media to third parties. The demo rule asks for a working link, not expressly anonymous access.

For hosted acceptance, use two existing authorized members in independent normal sessions: A creates an ES intake and verifies the same case after reload; B cannot list/read A's case and creates/reloads a PT handoff; A cannot read B's case; A's own simulated reviewer update increments version and audit. No new accounts, credentials, cookie export or permission changes are needed or authorized here. No approval action or organizer contact was executed.
