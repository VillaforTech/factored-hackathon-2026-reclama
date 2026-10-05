# Reclama — requirements, evidence and remaining decisions

**Updated 5 October 2026. Private release candidate, not submitted.** The creation-date filename and Library identity are retained. See the [release kit](../release/2026-10-05/START_HERE.md) and [exact approval checklist](../release/2026-10-05/SUBMISSION_CHECKLIST.md).

## Official source coverage

The [event hub](https://www.factored.ai/careers/ai-data-hackathon), [English/no-face clarification](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1791153414484629), [demo-access guidance](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1791153383839789) and [mock-data thread](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790698838166839) were reread 5 October. A public repository is required. A public demo link is preferred; the rule calls for a working deployed link, without an express anonymous-access mandate. Judges are randomly assigned and may contact the submitter for access. English explanations coexist with required ES/PT customer interactions. No numeric judging weights or rule exceptions are assumed.

The linked challenge Google Doc was not freshly retrievable. Its previously reviewed scope includes a focused banking workflow and learned component compared to a baseline on a valid held-out set; no new clauses are inferred. Recorded deadline: [5 October, 23:59 UTC−5](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619). Recheck final announcements before sending.

| Requirement / dimension | Evidence | Status and limitation |
| --- | --- | --- |
| Focused banking workflow | Exact transaction selection, statement/fact separation, consent, persisted intake, human review and auditable recovery. | Local fictional sandbox. No real bank action, refund, fraud decision or measured business savings. |
| Spanish and Portuguese | Existing automatic review covered 195 literal UI pairs and 18 assistant keys per locale. Current app hash matches that review. Fresh no-recording ES/PT walkthrough: 10/10 checks, including a mobile-width check. | Automated review only; no human Portuguese certification. |
| English explanation | Local eleven-chapter `/guia`, reviewer docs and six-slide English release deck. English narration/click script provided. | Guide changes are local and not yet deployed. User's final English video still needs recording. Historical Spanish sources remain audit material. |
| Deterministic controls | 20/20 assistant tests; fresh UI checks for unchecked consent, explicit selection, reload, reviewer version and same-request recovery. | Identity/ownership/consent/idempotency remain outside the model. Local simulated personas do not establish two-real-account isolation. |
| Learned model and baseline | Full authorized corpus diagnostic: 7,671 CSV, 13 tables, 23,495,188 rows. Relevant 2,194 CSV / 238,416 rows yield 47 distinct Spanish customer inputs, all previously seen. On 25 AI-agreement labels, v2 matches 21 and rules 25. Gate clarifies 47/47. | Retrospective AI reference, no human gold, no Portuguese inputs, six unsupported intent classes, one grouping component. **No model advantage or valid independent ES/PT benchmark established.** Model unchanged. |
| Historical experiment | Archived v2 218/256 versus rules 168/256; freeze and provenance checks 6/6 pass. | AI-authored messages and labels in 128 bilingual families. Development history only; no benchmark claim. |
| Normal / ambiguous / handoff | 2 October receipt: 15/15 prepared local API sequences, five per scenario, 70 timed requests. | Five intakes, five no-write clarifications and five support handoffs. Separate from model evaluation and financial outcomes. |
| Latency | Sequence p50/p95 ms: ES intake 110.15/265.60; PT ambiguity 37.01/54.38; PT handoff 101.37/104.55. | n=5 per path; p95=max. Excludes setup, login, render, human time and hosted network. A build shared the Mac. Not rerun 5 October. |
| Resolution / unsafe actions / cost | Prepared checks verify specific local boundaries and handoff outcomes. Financial resolutions are zero by design. Conditional cost model documents assumptions and tariffs checked 2 October. | Representative safe-resolution/unsafe-action rates and total billed cost are unmeasured. Cost is **unknown**, not USD 0. |
| Generated mocks | Organizer permits mocks generally when not used for testing and asks for context. | No exception for the AI-authored benchmark. Engineering-QA fixture scope remains unclarified; no organizer contact performed. |
| Working deployed link | Fresh Sites read: active V6, custom access revision 4, owner plus **one** external viewer. Existing deployment source `3ae216e`. 4 October: 8/8 anonymous denials and sign-in redirect. | Normal hosted login, persistence and real-account isolation not run. Link/access record does not establish authenticated acceptance. No new deployment. |
| Public repository | Existing private repo; default branch `codex/reclama`. Draft PR #2 remote head `fa53b35` has successful CI. Later local candidate documented in release kit. | Official visibility requirement unresolved under owner's explicit privacy decision. Needs approval or organizer exception. Later local changes do not inherit remote CI. |
| 4–6 slides | Six-slide English PPTX and PDF, updated evidence, sources in notes, native editable table/diagram retained. All six slides and PDF pages visually inspected automatically. | PDF is a high-resolution rendered review copy. Keynote native export timed out; editable master is PPTX. Microsoft PowerPoint editing not tested. |
| Video ≤3 minutes | English narration and exact click path ready for the user. Prior silent V6 video, 107.320 s, remains unchanged with Spanish captions. | Final English recording/export is pending. No new video or audio generated. Human listening not claimed. |
| Organizer submission | Official destination rechecked: `hackathon.admin@factored.ai`. Unsent email draft and attachment checklist prepared. | Not sent; no receipt. Team registration/name and final video/access must be confirmed. |

## Fresh checks, failures and preservation

- Passed 5 October: typecheck, application lint, production build, 20 assistant tests, 6 provenance tests, 10 parity cases per model, 16 data-integrity plus 8 arithmetic fixture checks, no-recording browser rehearsal 10/10.
- First provenance run failed on the translated current video README. The exact historical README is now archived and checked against the original manifest hash; no historical media/hash or model change was used to hide the failure.
- First browser attempt timed out during cold compilation before its first interaction. Warm rerun passed with bounded 30-second action waits. Server stopped afterward. Initial failure receipt retained in local work.
- Keynote PDF export timed out. Delivered PDF derives from the final Artifact Tool slide renders at 2560×1440, with working destination links. PPTX remains editable. Native-app export/PowerPoint compatibility are not claimed.
- Not rerun now: historical 28 HTTP checks, 160 contract assertions, 15-sequence latency experiment and 18-guide-check suite. Dated receipts retain their own denominators and source versions.
- Not completed: hosted real-account acceptance, challenge-valid bilingual model benchmark, human language/listening review, billed cost measurement, release permissions or organizer submission.
- All edits remain in the separate acceptance checkout. Original and sibling checkouts are preserved. The model, thresholds, original videos/subtitles, deployment and audience remain unchanged. The diagnostic copies aggregates and hashes only, without private corpus records or credentials.

Human Portuguese/audio review and two-real-account tests are internal quality recommendations, not additional official clauses. The English and public-repository requirements are official. The absence of a valid benchmark is reported as a substantive evidence limitation, not silently replaced by software tests.

## Library identities

English PPTX: `libfile_2903b3baa6048191b0ea20acb3b7b8a3`; English PDF: `libfile_b38a58b1715c81918bfcb742f6ddc0b5`; this matrix: `libfile_0cad1f86ce7c8191abf96eeb27e405a2`. Use the confirmed release write receipts for the latest versions.

Preserved original interactive video: `libfile_f5b35f28dae88191b47ae89ba8235bc5`; Spanish SRT: `libfile_7f35053934f88191ad759fd0cf1aa3d0`; manifest: `libfile_8be706f0e53c81918977983db036cbf2`. No replacement or English-compliance claim is made for those media.

## Remaining approval sequence

Approve the exact candidate push/CI/integration and deployment, resolve public repository and demo access separately, complete or explicitly disclose acceptance/evaluation limits, record the English demo, then approve sending the final package. The [approval document](../release/2026-10-05/SUBMISSION_CHECKLIST.md) provides exact URLs, branches, consequences and the A/B account test path. No new identities or credentials have been requested or invented.
