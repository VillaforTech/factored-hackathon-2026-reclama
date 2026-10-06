# Workflow cost model

**Tariffs last rechecked on 2 October 2026** against the official sources below. The [new local measurement](full-case-rerun-2026-10-02.json) includes 15 prepared sequences and 70 timed requests, but does not instrument billing, CPU or D1 usage. Setup requests are additional. **Total measured cost remains unknown.**

The [earlier complete-case probe](full-case-rerun-2026-09-30.json) likewise recorded 70 HTTP requests for 15 prepared local sequences: six per ES intake, two per PT clarification and six per PT handoff. It measured wall time, not billable CPU, D1 rows read/written, storage, transfer, platform compute minutes or an invoice. Five intakes are received cases, not financial resolutions. Cost per automated financial resolution therefore has no denominator and is not reported as USD 0.

## Conditional estimate

If a deployment uses **Cloudflare Workers Paid and D1 directly**, the [published Workers tariff](https://developers.cloudflare.com/workers/platform/pricing/) lists USD 5 per account/month including 10 million requests and 30 million CPU milliseconds; excess costs USD 0.30 per million requests and USD 0.02 per million CPU milliseconds. The [published D1 tariff](https://developers.cloudflare.com/d1/platform/pricing/) includes 25 billion rows read, 50 million rows written and 5 GB/month on that plan; excess costs USD 0.001 per million reads, USD 1 per million writes and USD 0.75 per GB-month.

These are conditional assumptions. We have not verified that Sites bills the owner on precisely this basis, or measured their monthly usage or credits. For monthly `R` requests, `C` billable CPU milliseconds, `L` D1 rows read, `W` rows written and `G` GB-months:

`USD/month = 5 + 0.30·max(R−10M,0)/1M + 0.02·max(C−30M,0)/1M + 0.001·max(L−25,000M,0)/1M + 1·max(W−50M,0)/1M + 0.75·max(G−5,0)`

The formula excludes other products, transfer and human costs. It combines a fixed account charge with marginal costs: dividing it by 15 local attempts would not produce a valid per-case price. Hosted intake/handoff cost needs the actual invoice/plan, CPU and D1 telemetry per sequence, monthly volume and an explicit fixed-cost allocation. Intent inference is bundled in the service; no external-model API invoice was observed. Total cost is not zero by assumption.
