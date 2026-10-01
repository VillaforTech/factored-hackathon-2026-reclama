# Evaluation correction checks — 1 October 2026

Scope: correction of active evaluation claims, preservation of historical experiments, and regenerated presentation. These checks validate software, artifact integrity and the wording change. They do not establish independent model quality or eligibility of authored testing under the challenge.

## Passed locally

- `npm run check`: TypeScript and application lint
- `npm run build`: production Worker bundle
- `npm run test:assistant`: 20/20 deterministic assistant tests
- `npm run test:provenance`: 5/5 checks for provenance classification, unchanged frozen artifacts/inputs/model, retained historic scores, stale V4 media status/source hashes, and corrected V5 export hashes
- `node ml/v1/verify-parity.mjs` and `node ml/v2/verify-parity.mjs`: 10 probes each
- `python3 ml/verify_package.py`: 10 frozen artifact hashes, four comparison inputs and 20 parity probes; no training or heldout reevaluation
- `python3 data-pipeline/validate_assets.py`: 16 integrity cases, eight arithmetic cases and aggregate-evidence checks
- `python3 tests/http-integration.py`: 28/28 local HTTP checks
- `python3 tests/http-runs-regressions.py`: 16/16 run and locale regressions
- `python3 tests/http-context-regressions.py`: 9/9 stale-session-context checks
- `git diff --check`: clean

HTTP suites ran against local D1, using documented mock sign-in and authored fixtures. No production endpoint, real account or bank integration was exercised. All model parameters, frozen manifests, corpora, raw reports and predictions remain unchanged. The hash-bound historical protocol was not rewritten.

## Presentation and video sources

[Presentation render receipt](../presentation/render-v5.json) records six inspected PPTX/PDF slides, preserved editable table/diagram and links, zero package/layout findings, and unchanged-slide comparisons. Native Microsoft PowerPoint editing was not tested.

The corrected external SRT has 45 cues; only scene 07's cues 34–39 change. Original timing is retained provisionally, with a maximum of two lines and 41 characters per line. Narration text and source hashes match the correction manifest. This does not prove synchronization to the old recorded audio.

The V4 MP4 is explicitly stale. Its old audio, embedded captions and slide imagery have not been regenerated. Source changes and the V5 deck do not silently update it. The original generic macOS Paulina voice is not available in this Linux environment; no substitute voice, silent patch or unreviewed video is claimed as final.

## Not completed here

- Interactive browser/screenshot regression of the corrected app: Chromium launch failed because the executor disallowed its required local socket, including the supported escalation attempt. This is a verification limit, not an observed app failure
- Hosted sign-in, reload and isolation between two real accounts
- Re-synthesized scene 07 narration, MP4 render, full listening and subtitle synchronization
- Human ES/PT label review or an admissible independent model evaluation
- Merge, deployment, access changes or organizer submission

The private draft PR's checks show remote verification for its exact head commit; do not substitute a prior commit's green run for the final head.
