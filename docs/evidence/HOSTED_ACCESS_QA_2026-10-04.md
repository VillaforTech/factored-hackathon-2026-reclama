# Reclama — hosted access and account-isolation checkpoint

**4 October 2026. Partial hosted QA; no authenticated acceptance claimed.** Roberto authorized checking existing invited access and real-account isolation while preserving privacy. This report supersedes the earlier count of two external visitors; it does not claim that anyone was removed or that the policy changed.

Demo: https://reclama-factored-2026.villafortech.chatgpt.site

## Verified result

- Sites reports the app active, existing V6 deployment succeeded, source `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`. The existing deployment timestamp is 1 October; no new deployment occurred.
- Current access is **custom, revision 4**, with **one workspace owner (A) and one external viewer (B)**, no groups or editors. A is Roberto; B is the one currently listed invited account. Private email addresses and account/grant IDs are omitted. The policy was read before and after the checks and is unchanged.
- **8/8 anonymous protected requests returned HTTP 401**: five GETs and three empty-JSON POSTs. Responses were HTML from the access boundary; they do not constitute app-level case authorization tests.
- The same-origin sign-in entry returned **302 to `https://auth.openai.com/oauth/authorize`**. The redirect was not followed; query parameters and cookies were not retained. This proves the sign-in entry is wired, not successful login.
- **Zero real visitor accounts were tested.** Sites connector owner access is not a browser visitor session. No session-store, cookie, password or browser-profile inspection was performed.

Receipts: [anonymous HTTP checks](hosted-anonymous-access-2026-10-04.json) and [sanitized policy/deployment snapshot](hosted-access-policy-2026-10-04.json).

## Account and operation matrix

| Identity / operation | Environment | Observed result | Interpretation |
| --- | --- | --- | --- |
| Anonymous GET `/` | Hosted HTTPS | 401 | Private page access denied. |
| Anonymous GET `/guia` | Hosted HTTPS | 401 | Private guide access denied. |
| Anonymous GET `/api/session` | Hosted HTTPS | 401 | No anonymous session read. |
| Anonymous GET `/api/runs` | Hosted HTTPS | 401 | No anonymous run listing. |
| Anonymous GET `/api/cases` | Hosted HTTPS | 401 | No anonymous case listing. |
| Anonymous POST `/api/session`, `{}` | Hosted HTTPS | 401 | Unauthenticated empty-payload request denied. |
| Anonymous POST `/api/drafts`, `{}` | Hosted HTTPS | 401 | Unauthenticated empty-payload request denied. |
| Anonymous POST `/api/cases`, `{}` | Hosted HTTPS | 401 | Unauthenticated empty-payload request denied. |
| Anonymous GET sign-in entry | Hosted HTTPS | 302 to identity provider | Entry point works; login not completed. |
| A: normal login and page access | Hosted | **Not run** | No connected controllable browser session available here. |
| A: own intake write/read, reload and same-request replay | Hosted | **Not run** | Requires A's normal visitor login. |
| B: invited link access and own handoff write/read/reload | Hosted | **Not run** | Allowlist entry alone does not prove access; requires B's own login. |
| A reads/writes B's case/run | Hosted | **Not run** | Need independently authenticated A/B and actual test identifiers. |
| B reads/writes A's case/run | Hosted | **Not run** | No second identity was invented or simulated. |
| Judge access via an already invited account | Hosted | **Not verified** | No successful invited visitor session observed; no judge identity added. |
| Previous local persona/run tests | Local, earlier dates | Historical evidence only | Ana/Lucas under a mock account do not establish hosted A/B isolation. |

## Exact blocker and minimum next step

This execution environment exposes Sites configuration reads and shell tools, but no supported browser-control execution tool connected to the user's existing sessions. The Browser skill was read and available/deferred tool names were searched twice. No browser session was connected or inspected. The missing result is therefore a **verification-environment limitation**, not an observed login defect.

Resume in a session with a supported controllable browser. A and the one currently invited B must each open the existing demo and complete their own normal sign-in in separate browser contexts. Use the exact invited email already shown to the owner in Sites sharing; do not create an account, invite anyone, copy credentials/cookies or switch privacy. If the provider requests verification, the account holder completes it normally. No password or MFA code should be sent to the assistant.

Once A can open the app, complete the A-only persistence/retry checks even if B is not ready. After B can also open it, execute the cross-account checks below. If either account is denied, record the visible error and whether that same signed-in email matches the existing grant. Do not alter security to make the test pass.

## Prepared A/B checks — not execution evidence

1. A creates a clearly labeled QA run using fictional data, records its real returned run/case IDs, receives an ES intake, reloads and verifies the same statement, transaction, case and `case_received` audit event. Keep existing records untouched.
2. In a separate A-owned QA run, use the app's existing lost-response simulation and retry the same operation. Confirm one case and unchanged identifier; record the actual replay response. Do not create or modify another user's case.
3. B signs in as the existing invited account, creates a separate fictional PT handoff and verifies reload/readback. B must not list A's run or case; A must not list B's.
4. From each normal session, read the other account's recorded QA case ID and try to open the other QA run. Record actual denial without exporting any returned private data if a failure is found.
5. For cross-account write protection, submit a version-checked update to the other account's **disposable QA case only**, using its already-existing status and note verbatim. Expected result is denial (404/403), not 200. Record the response and verify that case version/audit/content did not change. If it succeeds, stop that scenario and report the isolation defect; never repeat it against ordinary records. This step has not been run.
6. No delete API or cleanup entitlement was assumed. Keep labeled QA runs if deletion is unsupported; do not remove anyone else's records or use direct database edits. No case rows were created during this checkpoint.

## Scope and checks

The first shell attempt could not resolve DNS under the network sandbox; the authorized network retry produced the recorded hosted statuses. No model/data evaluation, local app server, new account, token generation, service-token bypass, permission change, invitation, push, merge, deployment, publication, organizer contact or video work occurred.

Application source and model/media artifacts are unchanged. The local checkout began clean at `c1235b1`. Only this report, its sanitized receipts and pointers in current local status/approval documentation were added. JSON structure, result counts and diff whitespace were checked; application build/tests were not rerun because application code did not change. Earlier Library matrix v4 remains the 2 October snapshot and is not silently relabeled as this checkpoint.
