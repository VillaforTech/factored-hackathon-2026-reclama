# Reproduction — local release candidate

Use the separate acceptance checkout or an approved integrated copy. Existing repository: https://github.com/VillaforTech/factored-hackathon-2026-reclama . Branch: `codex/reclama-acceptance-v6-20261002`, targeting `codex/reclama` through draft PR #2. Remote head `fa53b3578a2ea33c3037a5c4620832d3d3519a27` omits the later English-guide and release commits. The incremental source Git bundle supplied with this package preserves the proposed local commits after that remote head without publishing them. It requires the `fa53b3578a2ea33c3037a5c4620832d3d3519a27` base objects from this private repository. In a separate clone that already contains that base, use `git bundle verify <bundle>` and `git fetch <bundle> codex/reclama-acceptance-v6-20261002:review-release-20261005`, then inspect `review-release-20261005`. This does not merge or deploy anything. Do not assume cloning the remote alone yields this candidate.

## Requirements and commands

Node.js ≥22.13 and Python ≥3.11. A compatible macOS/Linux environment and ordinary package-download access are needed for a clean install. No bank credentials, private corpus or paid model API key is required to run the invented sandbox. The optional browser rehearsal requires Playwright and Chromium; the automated review reused existing installed tools.

```sh
# Existing checkout: do not overwrite someone else's work.
npm run install:ci
npm run check
npm run build
npm run test:assistant
npm run test:provenance
node ml/v1/verify-parity.mjs
node ml/v2/verify-parity.mjs
python3 data-pipeline/validate_assets.py
npm run db:local
npm run dev -- --hostname 127.0.0.1 --port 5357
```

Choose another free loopback port if occupied and use that port consistently. Do not expose the development server externally. Wait for initial compilation, then use the local mock sign-in. `db:local` applies migrations; do not delete existing state. Fresh **Nuevo recorrido / Novo percurso** paths isolate repeated demos while retaining older cases.

With the server running:

```sh
python3 tests/full-case-probe.py --base-url http://127.0.0.1:5357 --repeats 5 --output work/my-full-case-report.json
python3 tests/workflow-probe.py --base-url http://127.0.0.1:5357
```

`tests/workflow-probe.py` is the current path. The old `research/build-assets/review/workflow-probe.py` command is obsolete. Each test has its own denominator; do not sum request assertions into customer successes. The HTTP integration suite `tests/http-integration.py` is designed for fresh fixtures and reports exhausted fixtures without deleting prior cases. Do not run it repeatedly against valued state expecting a reset.

## What was rechecked on 5 October

TypeScript and application ESLint, production build, 20/20 assistant tests, 6/6 provenance checks, Python/JS model parity (10 per model) and data fixtures (16 integrity + 8 arithmetic cases) passed. The first provenance run failed because the evolving video README no longer matched the render-time hash. The exact historical README is now archived at `docs/video/archive/README-v5-render-source.md`; the test still enforces the original manifest hash. Model, video, subtitles and old manifests are unchanged.

A no-recording Playwright rehearsal passed 10/10 checks: nine workflow assertions and a 390px viewport overflow check. It used a local mock identity, ES/PT personas and new fictional runs. It created two local cases. Its first cold-start attempt timed out before the first interaction; the warm rerun passed. No new video or audio was produced. Existing development framework warnings about route classification/module registration remain; the build succeeded.

The fresh-DB 28 HTTP suite, 160 workflow assertions and 15-sequence latency experiment were not rerun on 5 October. Their dated evidence remains separate. No hosted login, two-real-account test, financial resolution, billing measurement or human linguistic review is claimed. Successful CI applies only to remote `fa53b35`, not the later local changes.

## Dependency and source boundaries

`dependency-inventory.json` inventories every entry in `package-lock.json` with its declared license. `THIRD_PARTY_NOTICES.txt` contains license/notice files found for installed packages. Optional packages absent on this platform retain metadata entries. `DEPENDENCIES.md` explains limits and reproduction. Do not redistribute `node_modules`, toolchain binaries, private organizer CSVs, access-bearing dictionaries or local session state. The team's project does not currently declare a root open-source license; this package does not choose one on their behalf.
