# Evidence and limits — 5 October 2026

The defensible contribution is a narrow transaction-intake workflow that keeps authorization outside its classifier, requires informed confirmation and recovers the same auditable case after a simulated lost response. Local software checks demonstrate these behaviors. Operational savings, superiority to other products and absolute novelty have not been established.

## Official-corpus diagnostic

The separate evaluation worker inspected 7,671 CSV files, 13 tables and 23,495,188 rows. Complaints and transcripts comprise 2,194 CSV files and 238,416 rows but only **47 distinct original customer inputs** in one connected grouping component. All 47 occurred in the earlier sample. This is retrospective analysis, not an unseen holdout. All inputs are Spanish; Portuguese has zero coverage.

Two AI reviews agreed on 25 labels, disagreed on 21 and both abstained on one. On the same 25 agreed inputs, rules match **25/25** and frozen v2 matches **21/25**. This reference supports only `account_query` (21) and `other` (4). Model v2 incorrectly labels the four `other` inputs: three as `unrecognized`, one as `merchant_issue`. No agreed reference examples cover `card_lost`, `credit_query`, `duplicate`, `merchant_issue`, `refund_request` or `unrecognized`.

AI agreement does not establish human ground truth. Repeated rows do not increase independent sample size. No confidence interval is justified by the single grouping component. The unchanged routing gate asks for clarification on **47/47** inputs: zero accepted, coverage zero, selective accuracy undefined. Zero accepted false positives under abstention is not evidence of safe autonomous resolution. This diagnostic establishes **no learned advantage** over rules and **no challenge-valid ES/PT benchmark**. The model and thresholds remain frozen.

The sanitized [aggregate](corpus-diagnostic.json) includes source report hashes, without private texts, customer records or acquisition credentials. It incorporates the other worker's existing results; it does not rerun or duplicate labeling. Historical 218/256 versus 168/256 scores describe an AI-authored development experiment only. They cannot supply the missing independent benchmark.

## Prepared local workflow measurements

Source: `docs/evidence/full-case-rerun-2026-10-02.json`, measured 2 October. These are three authored API sequences, five repeats each in separate owner-scoped local runs. Seventy timed requests exclude setup requests.

| Scenario | Correct prepared outcome | Passed / attempts | Sequence p50 / p95 |
| --- | --- | --- | --- |
| Normal ES | Persisted intake with readback and audit | 5/5 | 110.15 / 265.60 ms |
| Ambiguous PT | Clarification with no case created | 5/5 | 37.01 / 54.38 ms |
| Unsupported/reversed PT | Persisted support handoff with readback and audit | 5/5 | 101.37 / 104.55 ms |

The denominator is 15 prepared sequences, not 15 independent customers. At n=5, nearest-rank p95 is the maximum. Timing excludes login, run creation, rendering, user thought and human review. A build ran concurrently. These results are not hosted, cold-start or production end-to-end performance. Financial resolutions are zero by design; an autonomous financial-resolution success rate has no applicable denominator. No general unsafe-action rate or population safety claim is measured. Assertions observed the stated safety boundaries in the prepared cases only.

## Cost

Total measured cost per case is **unknown**. Request counts and elapsed time were measured; billable CPU, D1 rows, storage, transfer and invoices were not. Inference has no external model API dependency. That does not imply zero total cost. `docs/evidence/CASE_COST_MODEL_2026-09-30.md` records the conditional Workers/D1 model and official tariff links last checked 2 October. The assumed direct paid plan begins at USD 5/month plus excess usage; applicability to Sites billing is unverified. Allocate fixed cost using a stated monthly workload only after actual telemetry and the billing plan are known. Do not divide a monthly fixed fee by this test's 15 attempts.

## Official rules and internal checks

The [event hub](https://www.factored.ai/careers/ai-data-hackathon) requires ES/PT interactions, a public repository, working deployed link, 4–6 slides and a video no longer than three minutes. The [English clarification](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1791153414484629) requires English deliverables and does not require a face on camera. Both were reread 5 October.

The [mock-data thread](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790698838166839), reread 5 October, permits generated mocks in general when not used for testing and asks for context. It does not establish an exception for our authored model evaluation. Whether its testing wording also excludes software QA fixtures has not been separately clarified. We describe those fixtures as engineering checks, never as admissible benchmark data. No organizer was contacted.

Human Portuguese review, human audio review and a two-real-account isolation exercise are internal credibility/safety recommendations, not additional official submission clauses. Normal authenticated access is still needed to substantiate a working hosted experience. The linked challenge Google Doc could not be retrieved anew on 5 October; no new rule or scoring weight is inferred from that failure.
