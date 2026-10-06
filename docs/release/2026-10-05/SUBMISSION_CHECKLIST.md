# Release approval and submission checklist — not sent

## Destinations and current state

- Demo: https://reclama-factored-2026.villafortech.chatgpt.site . Sites read on 5 October: active, version 6, custom access revision 4, owner plus one external viewer. Existing deployed source `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`. English-guide/release work is local.
- Private repository: https://github.com/VillaforTech/factored-hackathon-2026-reclama . Draft PR: https://github.com/VillaforTech/factored-hackathon-2026-reclama/pull/2 . Proposed integration: `codex/reclama-acceptance-v6-20261002` → `codex/reclama`. Remote PR head `fa53b3578a2ea33c3037a5c4620832d3d3519a27`; successful CI https://github.com/VillaforTech/factored-hackathon-2026-reclama/actions/runs/36997154601 . Later local commits need approved push and their own CI.
- Local pending changes include English `/guia` and reviewer documentation (`c1235b1`), hosted-access evidence (`bea69a5`), this release package and the historical-README provenance fix. PR #2 also contains the PT PIN wording correction and original local recording. Review the final diff before integration. No model retraining or permission change is proposed.
- Existing hosting IDs for exact release targeting: project `appgprj_6abc00f0842c819197acbfaf114112a0`; deployment `appgdep_6abedf7171988191b1c8c4c75229a1e2`; saved version `appgprj_6abc00f0842c819197acbfaf114112a0~appgver_4e1667f776788191a87a00a637bb9918`. A deployment must use the exact approved pushed commit and a new saved build version.

## Official requirements

The [hub](https://www.factored.ai/careers/ai-data-hackathon), reread 5 October, requires a **public GitHub repository** named `factored-hackathon-2026-[your-team-name]`, a working deployed link, 4–6 slides, and a video ≤3 minutes. It lists `hackathon.admin@factored.ai` as the submission destination. The registered team name still needs confirmation; do not rename automatically.

[English deliverables and no face required](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1791153414484629) were reread 5 October. [Public demo access is preferred](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1791153383839789); judges are assigned randomly and may contact the submitter about access failures. This does not create a verified exception to the public-repository rule or mandate anonymous demo access. Keep ES/PT customer interactions.

Recorded deadline: [5 October, 23:59 UTC−5](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619). Recheck final announcements immediately before sending. No submission receipt exists.

## Exact approval decisions for Roberto

1. **Integrate/push/deploy the reviewed local candidate:** approve pushing the specified acceptance branch, checking its new CI, merging PR #2 into `codex/reclama`, and publishing the resulting exact commit to the existing site. Consequence: remote history and the live application change. Current public/private audience should remain unchanged unless separately approved. None of these actions has been executed by this release preparation.
2. **Repository visibility:** approve changing this repository from private to public after final tracked-file/history review, or obtain an organizer-approved exception. Consequence: source, historical artifacts, commit authors and history become visible outside the team. No exception or public-release approval is currently recorded. A root project license is an owner choice, not an extra official submission requirement.
3. **Demo access:** choose a public site link or retain custom access with a workable response/invitation process. Consequence of public access: anyone with the URL can reach the demo entry point; authenticated sandbox operations retain server controls. For custom access, exact judge email identities are not available because assignment is random. They must be provided/confirmed before any invitation, or the submitter must handle access requests. Do not invent emails or create accounts.
4. **Final recording and send:** Roberto records the English demo using `RECORDING_SCRIPT_EN.md`, reviews the export, confirms team name/final attachments, then explicitly approves submission to the official address. Publishing the repo or deploying does not send the entry.

## Real-account hosted acceptance plan

This is an internal release-quality check supporting the claim that the link works, not a newly invented organizer clause. Use two existing, authorized human accounts A and B with normal browser sign-in. The verified custom audience contains the owner and one external viewer; confirm those people can participate, or obtain exact emails and permission before adding anyone. Credentials remain with their owners.

1. A opens the existing URL, follows **Entrar con ChatGPT** normally, starts the fictional sandbox and creates a fresh run. Record time, deployed source/version and pass/fail only, not tokens or cookies.
2. A performs the ES intake, reloads and reads back the case/audit. Repeat the PT support handoff and simulated lost-response retry within A's sandbox.
3. B signs in through a separate clean browser/profile using their own existing account. B must not see A's cases or runs. A direct read/update attempt for A's synthetic case ID must deny access without returning A's details. Test the reciprocal direction with B's fictional case. Do not impersonate headers or reuse session credentials.
4. Test logout/session expiry and reload. Verify no previous-user details remain on screen and new writes require a valid session.
5. Record observed outcomes in a dated receipt. Until that happens: normal hosted login, persistence and two-account isolation remain **not tested**. Eight anonymous-denial checks from 4 October do not substitute for this acceptance.

## Send-ready email text, after the checklist is actually complete

To: `hackathon.admin@factored.ai`

Subject: `Factored AI & Data Hackathon 2026 — Reclama — Roberto Villafuerte`

Reclama is a Spanish/Portuguese card-dispute intake sandbox. It separates source facts from customer statements, obtains explicit consent and creates a recoverable case with an audit trail for human review. It does not adjudicate fraud or issue refunds.

Repository: https://github.com/VillaforTech/factored-hackathon-2026-reclama

Demo: https://reclama-factored-2026.villafortech.chatgpt.site

Attachments: English six-slide presentation and the user's final English demo video. Reproduction instructions and measured limitations are in the repository. The frozen classifier remains advisory. Our corpus diagnostic does not establish independent ES/PT model performance; prepared software checks have separate denominators.

**Before using this text:** attach the actual final recording, confirm access/visibility, remove no material limitation and retain the real send receipt. This is a draft, not authorization to send.
