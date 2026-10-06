# Feasibility of a valid held-out evaluation

Read-only inspection on 2 October 2026 of organizer CSVs already downloaded locally. [Aggregate receipt](official-data-evaluation-feasibility-2026-10-02.json). No raw rows/texts, customer IDs, credentials or local private paths are exported. No labels, predictions, model changes or new data acquisition were produced.

| Source | Observed local evidence | Evaluation consequence |
| --- | --- | --- |
| Complaints | 700 rows; five exact and five normalized descriptions. All five groups contain all four case types. Counts: Complaint 435, Claim 169, Request 69, Suggestion 27. Each description corresponds to one category; no `origin_interaction_id` is populated. | `case_type` is not the app's eight-intent taxonomy. Random row splits would repeat the same five templates. Category prediction would largely identify a repeated description, not evaluate bilingual intent understanding. Do not invent a mapping from case type/category to intent. |
| Call transcripts | 1,748 rows, 42 exact/normalized customer texts; every customer text contains “saldo”. All rows declare `detected_language=es`; no PT metadata coverage. 290 distinct full transcripts and two distinct detected-intent field values. | Automated detected labels are not human ground truth. Agent answers/full transcripts could leak outcomes and are not valid customer-only model inputs. No broad ES/PT intent benchmark is established. Language metadata is not a human language review. |
| Call-center interactions | 7,095 rows, six exact/normalized contact-reason texts. | Repeated categories/reasons do not independently label eight customer intents. |
| Availability | Twelve local partitions for each inspected table, all already present in the existing research manifest. Zero additional local partitions found. | No new unseen local sample is available from this check. This says nothing about the contents of undownloaded organizer data. |

Normalization used Unicode NFKD, lowercase, accent-mark removal and collapsed whitespace, retaining punctuation. Exact and normalized counts match. The earlier source profile also found 448/448 non-null complaint-to-product links with mismatched owners; this audit did not silently repair them or repeat that relationship join.

## What is missing

A defensible test of the frozen model needs suitable authorized customer-only examples with independent reference labels for its existing eight intents, including ambiguity/unsupported cases and ES/PT coverage. Labels require a documented rubric, qualified bilingual annotators, disagreement adjudication and a grouped split that prevents repeated scenarios/templates or customers from crossing development and evaluation. The model, baseline and policy must remain frozen before opening that test.

Human labels alone cannot turn five repeated descriptions into a representative dataset or create Portuguese coverage. Automatically translating or inventing test inputs would not resolve the [organizer's prohibition on generated mocks for testing](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549). A narrow, transparently scoped official-data check might be possible under an agreed protocol, but no such test or admissibility decision exists here.

Existing local read access supports this aggregate audit. We have not established permission to redistribute organizer rows or send them to outside annotators/services. Acquiring further partitions, obtaining suitable evaluation data and any organizer clarification require an agreed authorized route. Contacting Diego has not been authorized or performed. No broad claim of inability across the entire organizer dataset is made.
