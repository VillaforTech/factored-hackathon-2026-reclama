# Reclama — data card and contracts

**Two deliberately separate assets:** `report.json` contains aggregate observations computed from the authorized organizer dataset; `demo.json` contains wholly invented public sandbox records. The latter were authored from scratch. No customer, identifier, merchant, amount, transaction or complaint was copied from an original row.

## Scope and evidence

- Organizer dataset: synthetic, documented as covering Mexico, Colombia and Argentina. Synthetic origin does not establish unrestricted redistribution rights. Original files stay private and ignored by Git.
- Inspection: 50 existing local files; full supplied customer/product dimensions plus 12 temporal partitions of each of transactions, complaints, call-center interactions and transcripts. Selection covers time, is not random, and does not support population prevalence estimates.
- Partition dates: 2023-06-17, 2023-09-25, 2024-01-02, 2024-04-11, 2024-07-20, 2024-10-27, 2025-02-04, 2025-05-14, 2025-08-22, 2025-11-30, 2026-03-09, 2026-06-17.
- Primary schema references: [official summary](https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4MV86KA5/latam_bank_dataset_summary__1_.pdf) and [official dictionary](https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4LF2AVLJ/latam_bank_complete_data_dictionary__2_.pdf). The linked dictionary has access details: do not copy its full contents into a public repository or model context.
- Local research manifest: `research/analysis/sample-manifest.json`; existing independent comparison: `research/analysis/dispute-intake-profile.json`.

The pipeline re-computes 48,810 transactions and 10,903 structurally valid approved card purchases. Among those approved card purchases, 531 lack a merchant. The 448 historical complaints with a product reference point to a product owned by a different customer. Those **links** are quarantined; this is not proof every complaint row is intrinsically wrong. The 252 remaining complaints have no such link. Neither group can establish the transaction behind a new dispute.

These results support **finding a customer's selected purchase** and building a new intake record. They do not establish fraud, settlement, reimbursement entitlement or formal card-network dispute eligibility. Treat the customer's account of events as a declaration, separate from verified source facts.

## Public demo

`demo.json` declares `provenance: team-generated`, `isLive: false`, `sourceVersion: reclama-demo-v1` and fixed `snapshotAt: 2026-06-17T18:00:00-05:00`.

| Asset | Authored contents |
| --- | --- |
| Customers | Ana Torres (`es`) and Lucas Costa (`pt`), entirely fictitious; no contacts, address, national identifier or score |
| Cards | Two for Ana (USD, COP), one for Lucas (ARS); opaque IDs and invented last four digits |
| Purchases | 12 records; Approved, Pending, Reversed and Declined; one missing merchant |
| Ambiguity | Two Luna Digital purchases for USD 84.90, seven minutes apart, with distinct transaction IDs |
| Source trace | Every record has a stable sourceRef and the snapshot sourceVersion |

Currency follows the selected card, not the interface language. Portuguese does not imply a Brazilian account or Brazilian legal rules. All currencies in this fixture use two decimal places: `amountMinor: 8490` means USD 84.90; `amountMinor: 7580000` means COP 75,800.00. Keep integer minor units in storage and use a decimal-safe formatter. Never infer duplicates from amount/merchant alone.

**Demo lookup shortcuts for the application:**

- Ana customer ID: `cus_58d410ab`; USD card `crd_070b6f52`; COP card `crd_965ea3d1`.
- Lucas customer ID: `cus_c2e79604`; ARS card `crd_e4c2318a`.
- Ambiguous pair: `txn_bf51a0c9` and `txn_63ea729b`.
- Missing merchant: `txn_36c80dab`.
- Portuguese normal case: `txn_417fdc86`, Livraria Aurora, ARS 18,500.00.

These identifiers are fixture references, not authentication secrets. The server must resolve the active customer from a trusted session and enforce ownership on every lookup and mutation. A caller providing a correct customer ID is not authenticated by that fact.

## Contracts and quarantine

| Contract | Enforcement |
| --- | --- |
| Schema | Required allowlisted fields; unknown fields forbidden in public demo; no sensitive fields or outcome labels |
| Unique identity | Reject every row sharing a duplicate ID, including the first occurrence; do not silently deduplicate conflicting versions |
| Ownership | Customer exists; card belongs to that customer; transaction belongs to both |
| Currency | Supported code and exact transaction/card equality; no automatic FX conversion |
| Amount | Positive integer minor units within JavaScript's safe integer range for purchases; no boolean, fraction or silent rounding |
| State | Only documented enum values; Approved is not a refund decision and Reversed is not evidence of money credited |
| Provenance | Snapshot version matches each transaction and sourceRef is present |
| Temporal | Demo timestamps must contain offsets and cannot exceed snapshotAt; source naive timestamps do not acquire an invented timezone |
| Missing merchant | Explicit `null` is valid; preserve “merchant unavailable” and use other fields or human review |

`pipeline.py` quarantines structurally invalid source rows/links in memory and writes only reason counts. It does **not** export a clean source dataset or source record IDs. Hashes of the input files make a rerun traceable. Schema, file size or source-path failures abort with a value-free error code.

The pipeline separately reports temporal warnings. All original transaction timestamps inspected lack an explicit timezone, and process dates can precede event calendar dates. A partition or process_date is not a reliable available-at timestamp. Static product dimensions are not historical ownership snapshots. Some product updates fall after the documented coverage end. Therefore **verifiedLiveRecords is 0**; structural integrity must never be displayed as live banking freshness.

Incremental policy: fail closed on ambiguous identity/version changes; quarantine incompatible updates; require an explicit source sequence or effective-time contract before merging. For controlled update demos, create a separately labelled fixture version and log before/after source versions. Invalidate prepared case consent if a selected transaction's immutable evidence changes; re-read before committing and confirm again. Never reinterpret a newer ingestion time as evidence of a fresh banking event.

## Reproduce

From the repository root, with Python 3.10+ and authorized original files already present:

```sh
python3 data-pipeline/pipeline.py
python3 data-pipeline/validate_assets.py
```

There are no network calls or extra Python dependencies. The private source files remain under `research/data/`; no credentials are needed by these scripts. The original acquisition procedure is outside this public fixture package.

`validate_assets.py` runs the 16 independently specified integrity mutations, exact-money edge cases and aggregate denominator checks; it cross-checks the previously computed dispute profile when available. `validation-report.json` is a **data-contract test result**, not a score for the learned component or proof of production safety.

## Evaluation limits

- The official transcript sample has 1,748 Spanish records, 42 distinct customer utterances, all containing “saldo”. This is insufficient support for a broad natural dispute-dialogue benchmark.
- Portuguese inputs and dispute conversation scenarios must be authored/translated separately, marked synthetic and reviewed by someone competent in Portuguese.
- Avoid using historical agent responses, fraud labels, complaint resolution or future timestamps as prediction inputs. This package does not read fraud outcome fields into model-facing records.
- Separate scenario development from held-out evaluation by customer/transaction/scenario family, and keep ES/PT translations in the same split. Do not claim this 12-transaction demo is a held-out benchmark.
- Report action safety, missed escalation, unnecessary escalation, evidence fidelity, latency and costs on the actual application separately. No measured model gains or production savings are contained here.

## Integration

The app may copy `demo.json` and the aggregate `report.json`; it must not bundle `research/data`, original PDFs or private acquisition tools. Use `report.metrics` for evidence numbers and keep the provenance/limitations visible. For the user-facing flow, expose only the active customer's transactions through server tools, even though all authored fixture rows are safe to publish.
