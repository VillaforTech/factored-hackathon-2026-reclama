# Evaluation provenance correction — 1 October 2026

## Decision

The existing model results are an **AI-authored development experiment**, not independent validation, an official benchmark, or evidence that the challenge's model-evaluation requirement is met. Author separation, a frozen model and zero exact train/test overlap are useful development controls; none establishes independent ground truth or eligible source data.

The headline improvement claim is withdrawn. The original measurements remain available as historical experiment evidence, with their scope visible wherever reused. No model was retrained, label rewritten, threshold relaxed or result replaced in this correction.

## Evidence and provenance

- [Reserved-set freeze](../../ml/heldout-v2/freeze.json): `containsOrganizerRecords: false`, `humanReviewed: false`; 256 AI-authored messages in 128 paired Spanish/Portuguese scenario families. The [corpus contract](../../ml/heldout-v2/README.md) records entirely invented scenarios and AI-authored annotations.
- [Historical v2 report](../../ml/v2/test-report.json): v2 218/256 versus rules 168/256; +19.53 percentage points and the reported paired-family interval describe only this authored experiment. They must not be advertised as validated bank performance or challenge-valid improvement.
- [V2 training provenance](../../ml/v2/model-card.md): 634 authored training messages and 128 authored selection/validation messages. [V1](../../ml/v1/model-card.md)'s 46/64 versus 43/64 was also authored and exploratory.
- The [official-data aggregate profile](../../data-pipeline/report.json) contains 48,810 coherent transaction/product/customer links, 10,903 approved card purchases, 531 missing merchants, and 448 complaint/product ownership mismatches quarantined. Its 1,748 Spanish transcript records contain only 42 distinct customer utterances, all balance-related. This is not a broad ES/PT intent-labeled benchmark. The original organizer files remain private; no raw rows were added.

## Software QA remains separate

The historical 28/28 HTTP checks, 160/160 repeated contract assertions, 2/2 prepared ES/PT handoffs and 15/15 prepared full flows test the implementation on fixtures. They do not measure independent model quality, banking outcomes or representative users. Preserve the fixtures and original reports; do not relabel them as an eligible model benchmark.

The [organizer clarification](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549?thread_ts=1790698838.166839&cid=C0BUZCY0TUY) allows mocks “if its not used for testing”. Its exact scope for software QA fixtures is unresolved. This correction neither claims organizer acceptance of authored model testing nor invents a blanket prohibition on engineering fixtures. No organizer was contacted as part of this change.

## Artifact integrity

- Preserve every file bound by `ml/v2/FREEZE.json` and `ml/v2/evaluation-inputs.json`, the heldout corpus/hash/freeze, all model parameters, predictions and raw score reports.
- `ml/v2/protocol.md` remains byte-for-byte historical because its hash is frozen. Its use of “independent” describes the original design intention, not the current validated evidence classification. This correction and the current ML README supersede that interpretation without rewriting the frozen record.
- App/guide, current README, submission/delivery documentation and slide/video sources label the experiment accurately. Detailed historical scores are disclosed under development-experiment context, not promoted as the headline.
- Current V4 PPTX, PDF and MP4 binaries are **stale for model-evaluation claims**. Corrected source text and SRT do not update slides, recorded audio, embedded captions or burned-in visuals. They must not be used as the corrected submission artifacts. New V5 PPTX/PDF files have now been rendered and visually checked ([receipt](../presentation/render-v5.json)); V4 is preserved. The MP4 still needs corrected narration, imagery and embedded captions, followed by full review.

## Remaining gate

An admissible independent evaluation has not been established. Any future claim requires a documented protocol, eligible data/provenance and appropriate labels/review, with results separated from engineering QA. Do not manufacture eligibility by renaming these corpora or retraining against known errors. Hosted acceptance, MP4 regeneration and any publication/submission decisions remain separate. This source correction does not deploy, merge, submit or change repository/site access.
