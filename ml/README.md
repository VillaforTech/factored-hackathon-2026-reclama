# Intent model and reproducible evidence

## Provenance correction — 1 October 2026

These results are an **AI-authored development experiment**, not independent validation or an official/admissible challenge benchmark. Training (634 messages), selection (128), and the reserved set (256 messages in 128 ES/PT families) were authored by AI. The reserved set contains no organizer records and has not received human review. The v1 result of 46/64 versus 43/64 is also AI-authored. Historical metrics are retained for audit, not presented as validated banking performance. `v2/protocol.md` remains byte-identical because it is bound to the freeze hash; its historical use of “independent” is corrected by this notice.

See the [provenance correction](../docs/evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md).

The application uses v2 only as an **unconfirmed hypothesis**. The customer chooses the reason. Model predictions never initiate a dispute. Under the frozen thresholds, **v2 abstains on every reserved-set example**: `accepted` remains `false`, and `decision` is `clarify`. Its top-1 label may be displayed as guidance. Do not change thresholds to improve a demo. Identity, authorization, consent and writes are application responsibilities.

## Package

- `v1/`: word-TFIDF logistic regression, fixed bilingual rules baseline, corpus, reports, predictions and parity checks.
- `v2/`: character-TFIDF logistic regression, authored training/selection data, frozen model, selection report, development experiment and audits.
- `heldout-v2/`: 256 authored messages in 128 ES/PT families, prepared by a separate agent and withheld from v2 fitting until freezing. This process does not establish independent validation.
- `verify_package.py`: hashes, imports and 20 fixed parity examples; no training, reevaluation or result modification.

Read the [v2 model card](v2/model-card.md), [frozen protocol](v2/protocol.md), [report](v2/test-report.json) and [reserved-set documentation](heldout-v2/README.md). Historical source documents remain unchanged and may be Spanish; the [English reviewer companion](../docs/JUDGE_README.md) explains their current interpretation. These messages are not real banking records and have no competent human Portuguese review.

## Setup and verification

Run commands from the repository root containing `package.json` and `ml/`. The repository is currently private; publication requires a separate decision.

Previously verified with Python 3.12.14, NumPy 2.3.5, SciPy 1.18.1, scikit-learn 1.9.1 and Node v26.0.0. JavaScript inference has no npm dependencies. Python is needed for offline audit/reproduction, not application inference.

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r ml/v1/requirements.txt
.venv/bin/python ml/verify_package.py
node ml/v1/verify-parity.mjs
node ml/v2/verify-parity.mjs
```

Python imports `v1/train.py` and `v2/train_v2.py` only for pure inference and metric functions. Importing does not train. Paths resolve the adjacent `v1`, `v2` and `heldout-v2` folders, without the former private research location.

## Reproduce the historical comparison without fitting

The original evaluation is archived. Use a fresh output directory; existing `test-report.json` cannot be overwritten:

```bash
RECLAMA_EVAL_DIR="$(mktemp -d)"
.venv/bin/python ml/v2/evaluate_once.py \
  --v1-dir ml/v1 \
  --heldout ml/heldout-v2/corpus.jsonl \
  --output-dir "$RECLAMA_EVAL_DIR"
```

The script verifies frozen hashes, applies all three systems to the same inputs, and writes `test-report.json` and `predictions-heldout.jsonl`. It uses a fixed seed for 4,000 family-bootstrap replicates. It does not train, select examples, change thresholds or exclude mistakes. `--assets-dir` accepts another identical v2 copy; see `--help`.

Recomputing a result does not create a new test. Changes informed by known errors require a new protocol and genuinely independent, admissible data. Another AI-authored reserved set does not establish independence.

## Historical development results and limits

| Same 256 authored messages | Rules | v1 | v2 |
| --- | ---: | ---: | ---: |
| Top-1 accuracy | 65.63% | 82.42% | 85.16% |
| Macro-F1 | 0.6752 | 0.7904 | 0.8310 |

v2 had more correct predictions than rules in this authored experiment. This is not independently validated improvement or proof of challenge compliance. Its accuracy difference against v1 was inconclusive: 95% interval [−1.17, 6.64] percentage points. Do not generalize to real customer requests.

- `other`: 9/32 correctly recognized.
- Of 34 top-1 `unrecognized` predictions, 25 were correct and nine false.
- The abstention policy failed its selection requirements and remained closed: accepted coverage 0%; selective precision undefined.
- Softmax scores are not calibrated fraud/risk probabilities.
- This experiment did not evaluate authorization, action safety or end-to-end resolution.
- No exact normalized text overlap was found between train/selection and reserved data. That does not establish semantic independence or eliminate synthetic bias.

## Inference and timing

Use `v2/model.json` with `v2/inference.mjs`; the v1 word extractor is incompatible with the character model. The model card documents the contract and ten parity vectors. The model is 682,953 bytes and makes no network calls.

The archived warm local CPU benchmark reported p50 0.043 ms and p95 0.082 ms. It excludes model parsing, cold start, network, storage, authorization and UI. It is neither end-to-end latency nor hosting cost. `benchmark.mjs` overwrites `v2/cpu-benchmark.json`; preserve the archived measurement and write any new measurement separately.

## Reproduce training as a separate artifact

`train_from_corpus.py` trains a **new artifact** from the 634 training rows of `v2/corpus.jsonl`, using the selected configuration: character-TFIDF, C=12, min_df=2, at most 3,500 features, balanced logistic regression. It does not use selection rows, read the reserved set, or search hyperparameters/thresholds.

```bash
RECLAMA_TRAIN_BASE="$(mktemp -d)"
.venv/bin/python ml/v2/train_from_corpus.py \
  --output-dir "$RECLAMA_TRAIN_BASE/new-model"
```

The output path is required, must not exist, and must be outside archived `v1`, `v2` and `heldout-v2` directories. New `model.json` and `training-report.json` files do not modify original weights, data or reports. Abstention remains closed and explicit confirmation remains mandatory.

The new report compares vocabulary, classes and numerical parameters with the frozen export. **Numerical identity is not guaranteed across library versions, platforms or BLAS implementations.** JSON hashes differ by design because version/provenance metadata changes. This produces no new test metric or safety evidence.

One previously recorded run using the versions above took 0.26 seconds and exactly reproduced classes, vocabulary, IDF, coefficients and intercepts (maximum absolute difference 0). This is evidence of that run only, not a cross-environment guarantee. The original model remained unchanged.

Historical `train_v2.py` needs raw Ollama responses to reassemble its original corpus; they are not packaged. **Use `train_from_corpus.py`, not the historical training CLI.** Reproduction from the final packaged corpus needs no Ollama, GPU, API credentials or model-weight downloads. Changes based on known mistakes constitute a different experiment; preserve existing results.
