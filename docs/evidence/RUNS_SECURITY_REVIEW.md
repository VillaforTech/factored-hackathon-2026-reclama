# Demo runs and language-switch review

Reviewed locally on 2026-09-29. Scope: `app/lib/server/api.ts`, session contract, new `demo_runs` schema, and regression harness. This is a targeted review, not a production penetration test.

## Static findings

No confirmed new critical or high-severity defect was found in the reviewed run/locale changes.

- The owner namespace is derived from `getChatGPTUser().userId`, not request JSON. Run recovery checks both `id` and `owner_workspace`; a previous run cookie is accepted for namespace selection only when its owner prefix matches and the owned run exists.
- The subsequent session lookup checks the application cookie against that namespace and enforces expiry. A stale cookie can select a namespace for a new explicit sign-in session but cannot itself authorize normal operations.
- Session locale mutation accepts exactly `locale: es|pt`, keeps the existing session ID and scope, and therefore preserves pending draft consent. Role, customer and run are not writable through that endpoint.
- Case reads and updates use the current namespace. Customer case reads additionally filter by customer; reviewer access is deliberately limited to the person's own synthetic sandbox/run. Reviewer role is not a real bank permission.
- New runs are capped at 50 per owner. Run and session insertion are batched. No previous runs, cases or audit events are deleted by the new-run operation.
- Metrics and idempotency keys are namespace-scoped. Reusing a fixture transaction or key in a new run does not mutate earlier runs.
- All new writes retain the same-origin check. Run listing requires platform sign-in even before an application session is created.

## Dynamic coverage and limits

`http-runs-regressions.py` exercises the real loopback HTTP app using the documented local sign-in route and the existing integration client. It creates at most two runs and two synthetic cases. It never edits the database directly, deletes data, fabricates platform headers, persists cookies, or contacts a remote deployment.

The generated JSON report is the authoritative execution result. The suite covers language-preserved consent, schema/origin checks, run recovery, isolated case read/update/metrics, timeout recovery, concurrent idempotent retry, and default-run preservation.

**It uses one authenticated local identity.** Two run namespaces are not equivalent to two SIWC accounts. Cross-owner isolation still requires a legitimate two-account production check, including both direct case IDs and run IDs. The static ownership checks above do not establish that the hosting proxy strips untrusted platform-identity headers in production; that property belongs to the documented Sites authentication boundary.

A passing result does not establish Portuguese linguistic quality, model accuracy, end-to-end browser usability, or real bank safety. Those remain separate evidence sets.

## Executed result

The loopback suite completed successfully on 2026-09-29: **16/16 scenarios passed**, no failures, errors or blocked scenarios. Exactly two runs and two synthetic cases were created, and no data was deleted. The HTTP timeout simulation returned 503 after persistence; both concurrent original-key retries returned the original single case. Cross-run customer and reviewer reads and reviewer mutation returned 404. The original default workspace's cases and metrics were unchanged.

The measured execution is recorded in `http-runs-results.json`; do not treat this as production-authentication verification.
