# Held-out v2 — frozen AI-authored development corpus

## Provenance correction · 1 October 2026

This frozen set is an **AI-authored development experiment**, not independent validation or an official/challenge-valid benchmark. Its 256 messages are 128 bilingual scenario families, not organizer records or human-reviewed labels. A separate author and a pre-score freeze do not establish independent validation. Preserve corpus bytes, hashes and historical predictions. Do not reuse the historical scores as a headline model-quality claim.

See / Véase: [provenance correction](../../docs/evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md).

**Status: frozen, AI-authored annotations, human review pending.** These are entirely invented scenarios. They contain no original customer data and are not sampled from the organizer's transcripts. No training corpus, ML implementation or model predictions were read while authoring this set. Do not describe these annotations as human-adjudicated banking ground truth.

## Scope

- 128 distinct scenario families: 16 per class, eight classes.
- One Spanish and one Portuguese formulation per family: 256 records, 128 per language and 32 per class.
- The paired formulations preserve the requested intent; they are not independent observations.
- Records are shuffled deterministically. IDs do not contain class names.
- `corpus.jsonl` fields: `id`, `familyId`, `pairId`, `locale`, `text`, `label`.
- Exactly one label per utterance; the classifier must infer the user's actionable intent, not whether the underlying complaint is factually true.

## Label contract

| Label | Positive scope | Boundary |
| --- | --- | --- |
| `unrecognized` | Customer alleges a transaction was not theirs or not authorized, including an unexplained purchase they cannot identify. | Recognition of a legitimate purchase plus a second charge is `duplicate`. Do not infer fraud was proved. |
| `duplicate` | Customer asks to examine repeated charging/payment for the same purchase or obligation. | Whether two entries really are duplicate charges is a separate evidence task. Pending/approved pairs can still express duplicate-charge concern. |
| `merchant_issue` | Customer reports a problem with delivery, product, contract conditions or the service provided by a merchant. | An explicit primary request to obtain or follow up a refund is `refund_request`; mere reporting of a merchant problem stays here. |
| `refund_request` | Customer explicitly asks for money back or for the status of an agreed/requested refund. | This label does not establish entitlement or authorize a refund. |
| `card_lost` | Customer reports a physical card lost, stolen, retained or otherwise outside their possession, or asks to block/replace it because of that loss. | Merely wondering where it might be while explicitly withholding a loss report and block request is not enough. |
| `account_query` | Customer requests account facts, balances, statements, transaction/payment status, receipts or account identifiers. | A specific refund-status request goes to `refund_request`. An unidentified screen/message without enough context stays `other`. |
| `credit_query` | Customer asks about borrowing, financing, credit-product requirements, terms or eligibility, including assessment of a limit increase. | “Crédito” meaning money credited to an account is not automatically a lending intent. |
| `other` | No supported intent can be established from the utterance, including unresolved ambiguity or explicit rejection of candidate intents without another determinable request. | Ask for clarification; do not silently assign a banking workflow based on one keyword. |

Use the explicitly requested action to resolve context overlap. Denied or hypothetical intents are not positive labels. There are no hidden customer-context fields or transaction facts to consult when assigning these labels. If competent reviewers disagree, flag the case for adjudication instead of forcing agreement with a model.

## Negation and ambiguity allocation

Balanced classes require `other` to be 12.5% of all texts. Therefore the 25% difficult-case requirement is implemented as **32 designated families / 64 texts**:

- 16 indeterminate/ambiguous families, all labelled `other`.
- 16 contrastive-negation families whose final supported intent remains explicit, distributed across the other classes.

Designated contrastive-negation family IDs: `fam_0014`, `fam_0015`, `fam_0030`, `fam_0031`, `fam_0032`, `fam_0046`, `fam_0047`, `fam_0062`, `fam_0063`, `fam_0064`, `fam_0078`, `fam_0079`, `fam_0094`, `fam_0095`, `fam_0110`, `fam_0111`.

Designated indeterminate family IDs: `fam_0113` through `fam_0128` inclusive.

This designation counts contrastive reasoning or unresolved intent, not every grammatical “no/não”. Ordinary denial of authorizing a charge is intrinsic to `unrecognized` and occurs elsewhere too. Unsupported ambiguity is always labelled `other`; a clear intent following a negation is not automatically `other`.

## Freeze and use

`SHA256SUMS` binds the exact UTF-8 bytes of `corpus.jsonl`. `freeze.json` records counts, hash, timestamp and annotation status. Keep both together with the file. Freeze is an integrity/versioning convention, not an access-control mechanism.

Run the independent structural validator without loading a model:

```sh
python3 research/build-assets/heldout-v2/validate.py
```

Only `text` and optionally `locale` may be passed to the classifier. Never send `label`, `id`, `familyId`, `pairId`, file order or this README as model input. Keep the full corpus and per-example predictions away from training/prompt authors until the model/configuration and scoring implementation have been frozen.

Historical use: a single post-freeze development comparison against the locked baseline and candidate with identical inputs. If it influences feature, threshold, prompt, training-data or policy changes, retire it to validation data and create a new untouched hold-out. Do not tune on failed cases and continue calling the result held-out.

Report macro-F1 and confusion matrix, recall for `other`, missed escalation/forced routing for indeterminate cases, and ES/PT results separately. Score paired-language consistency and use `familyId` as the resampling unit for confidence intervals. Do not treat 256 correlated bilingual records as 256 independent families.

Human reviewers competent in Spanish and Portuguese should independently verify meaning, naturalness and the single primary intent, then adjudicate disagreements blind to model outputs. If annotations change, create a new version and new checksum. Preserve the original for audit. No human review, empirical model score, production representativeness, customer benefit or safety improvement is claimed by this artifact.
