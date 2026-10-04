# Reclama delivery status

> **4 October access checkpoint:** [Hosted QA report](evidence/HOSTED_ACCESS_QA_2026-10-04.md) verifies 8/8 anonymous denials and a working sign-in redirect. Current Sites policy lists the owner plus **one** external viewer, superseding the earlier visitor count below. Real-account A/B access, persistence and isolation remain untested because no supported browser session is connected here. This QA is authorized; publication, invitations and deployment remain unauthorized.

**2 October 2026. Review package only; not submitted.**

| Scope | Verified state |
| --- | --- |
| Existing remote | Private repository, default branch `codex/reclama` at `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`. PR #1 merged previously; [source CI passed](https://github.com/VillaforTech/factored-hackathon-2026-reclama/actions/runs/36935070857). |
| Existing hosted app | [Restricted demo](https://reclama-factored-2026.villafortech.chatgpt.site), Sites V6 from that same source SHA. Custom audience: owner and two authorized team visitors. Anonymous GET returned 401; normal authenticated acceptance remains pending. |
| Existing draft PR | [PR #2](https://github.com/VillaforTech/factored-hackathon-2026-reclama/pull/2), branch `codex/reclama-acceptance-v6-20261002`, remote head `fa53b3578a2ea33c3037a5c4620832d3d3519a27`; [CI passed](https://github.com/VillaforTech/factored-hackathon-2026-reclama/actions/runs/36997154601). Includes PT PIN wording correction and original continuous local recording. Not merged or deployed. |
| New local correction | English eleven-chapter `/guia`, ML README, current review/submission/access documentation and evidence interpretation. No model, authorization or customer ES/PT behavior changes. Local checks do not inherit CI from another SHA. See [language QA](evidence/ENGLISH_READINESS_2026-10-02.md). |
| Presentation | Separate worker delivered six English slides and notes: PPTX `libfile_2903b3baa6048191b0ea20acb3b7b8a3` v2 and PDF `libfile_b38a58b1715c81918bfcb742f6ddc0b5` v2, confirmed by the parent. This worker did not edit those files. Repository V5 Spanish binaries remain historical. |
| Current video | [Original continuous local V6](video/interactive-v6/README.md): 107.320 seconds, nine assertions, 14 Spanish explanatory cues, no voice. Original MP4/SRT hashes preserved. User explicitly stopped English video production on 2 October; no English media were uploaded. Video-language compliance remains unresolved. |
| Frozen model | 218/256 versus rules 168/256 is an AI-authored development experiment, not independent validation or a challenge-admissible benchmark. Frozen artifact checks remain authoritative. |

## Remaining decisions and evidence

1. Normal hosted sign-in, reload persistence and isolation between two real authorized accounts. Secure sign-in is coordinated separately by the parent thread. No bypass, imported cookies or new accounts.
2. Official public-repository requirement and effective judge access. A working deployed link is required; anonymous demo access is not explicitly required. [Exact approval package](ACCESS_APPROVAL_2026-09-30.md).
3. A valid held-out comparison against the baseline. The [organizer's mock-data clarification](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549?thread_ts=1790698838.166839) excludes generated mocks from testing. Do not relabel engineering fixture checks as admissible model evaluation.
4. English-video compliance is pending by user choice; no exception is established. Human Portuguese review and human listening review are internal recommendations, not additional textual organizer rules.
5. Approve final integration/deployment, access changes and submission separately. The recorded deadline is [5 October, 23:59 UTC−5; video at most three minutes](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809). Recheck final announcements before sending.

The sandbox receives fictional cases for human review. It moves no money, adjudicates no fraud and grants no refunds. Total cost per case remains unknown. All new work stays in the separate acceptance checkout; no push, merge, deployment, privacy change or organizer message is authorized by this correction.
