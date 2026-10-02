# Reclama — English reviewer guide

**Private review package, 2 October 2026. Not submitted and not fully submission-compliant.** The local interactive `/guia` is English, with eleven chapters and its original examples. The currently hosted guide remains the earlier Spanish edition until an approved deployment. Customer-facing app interactions remain ES/PT as required.

Reclama receives a card-dispute request that can be explained, recovered and handed to a human. It helps a customer locate the exact purchase, distinguishes source facts from unverified statements, requires specific consent and persists one auditable case even when a response is lost. This demonstrates controlled intake in a sandbox, not measured bank savings, competitor superiority or absolute novelty.

## Review order

1. [Repository overview and setup](../README.md) explains the workflow, trust boundaries and local reproduction.
2. [Current evidence matrix](evidence/REQUIREMENTS_EVIDENCE_MATRIX_2026-10-01.md) distinguishes official requirements, local QA, unknowns and access decisions.
3. [Current original video](video/interactive-v6/README.md) demonstrates real continuous local actions in 107.320 seconds: ES ambiguity/intake, local reload, reviewer version 2, PT support handoff, deliberately lost response, retry and no duplicate. It has Spanish explanatory subtitles and no audio. English video production was stopped by the user; language compliance remains unresolved.
4. English presentation: six slides and notes, delivered by a separate worker. PPTX Library `libfile_2903b3baa6048191b0ea20acb3b7b8a3` v2; PDF `libfile_b38a58b1715c81918bfcb742f6ddc0b5` v2. Spanish V5 repository binaries are historical, not these English exports.
5. [ML overview](../ml/README.md) and [official-data feasibility](evidence/OFFICIAL_DATA_FEASIBILITY_2026-10-02.md) explain why no challenge-valid model evaluation is established.
6. [Delivery status](DELIVERY_STATUS.md), [exact approval package](ACCESS_APPROVAL_2026-09-30.md) and [unsent draft](SUBMISSION_DRAFT.md) state what still needs approval or evidence.

## English companion to preserved historical evidence

Historical files are retained unchanged for audit. They may contain Spanish text, old dates and superseded wording. They are supporting source records, not current submission prose. Quoted ES/PT customer examples preserve the required interaction languages. This guide and the ML README provide their current English interpretation; no frozen artifact is relabeled or overwritten.

- **Data:** [data card](../data-pipeline/data-card.md) is English. The [aggregate report](../data-pipeline/report.json) describes a bounded sample: 48,810 coherent transaction links and 10,903 approved card purchases, including 531 without a merchant. All 448 inspected non-null complaint/product links had mismatched owners and were quarantined. This is neither live bank state nor a random prevalence sample.
- **Training/protocol:** V2 uses character TF-IDF and logistic regression, selected from nine candidates using validation. Training/validation counts are 634/128. The frozen acceptance gate failed; acceptance coverage is 0%, selective accuracy undefined, top-1 advisory only. It cannot authorize, choose the transaction or create consent.
- **Historical authored comparison:** on the same 256 AI-authored messages in 128 ES/PT families, rules/V1/V2 scored 168/211/218. V2 macro-F1 was 0.8310 versus rules 0.6752. V2 recognizes only 9/32 `other` messages and has 25/34 precision for `unrecognized`. The numerical result is a development comparison, not independent or admissible challenge validation. Preserved “independent” terminology in older records is superseded by this interpretation.
- **Software QA:** 28 historical HTTP checks, 160 repeated contract assertions, two separately persisted handoffs, 15 prepared API sequences and nine recorded UI assertions are different denominators. They must not be added into a customer count or financial-resolution rate. The 160 contract assertions created no cases. The corrected command is `python3 tests/workflow-probe.py --help`; the earlier `research/build-assets/review/workflow-probe.py` recipe is obsolete.
- **Latency/cost:** the 2 October sequences measured p50/p95 of 110.15/265.60 ms (normal ES), 37.01/54.38 ms (ambiguous PT) and 101.37/104.55 ms (handoff PT), five attempts each, 70 timed HTTP requests. Setup, human time, hosted login/network and browser rendering are excluded. With n=5, p95 is the maximum. [Total cost is unknown](evidence/CASE_COST_MODEL_2026-09-30.md); a conditional tariff model is not an invoice.
- **Language/media QA:** the earlier automatic review checked 195 literal interface pairs and 18 assistant keys per locale. It is not competent human Portuguese review. Original V6 video QA and subtitle timings remain in its manifest; no new audio review is claimed for a silent video. V4 exports contain stale evaluation claims; V5 is a historical montage. Neither replaces the current interaction receipt.

## Readiness limits

The [official English requirement](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790871863271959), public-repository rule, accessible working demo and valid baseline/held-out evaluation cannot be marked complete. The current repository is private, the video-language issue is unresolved, and real-account hosted persistence/isolation remain unverified. Human PT review and two-account testing are internal credibility/safety checks, not invented organizer clauses.

No real funds move, no card is blocked, no fraud is adjudicated and no refund is granted. Review status is not financial resolution. There is no submission receipt and no publication or permission change from this work.
