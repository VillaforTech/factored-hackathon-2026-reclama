import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const bytes = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const json = (path) => JSON.parse(bytes(path));
const sha = (path) => createHash("sha256").update(bytes(path)).digest("hex");

test("active model metadata classifies the authored experiment without independent-validation claims", () => {
  const report = json("lib/data/model-report.json");
  const freeze = json("ml/heldout-v2/freeze.json");
  assert.equal(report.evidenceType, "authored-development-experiment");
  assert.equal(report.historicalMetricsOnly, true);
  assert.equal(report.independentValidation, false);
  assert.equal(report.challengeBenchmarkEstablished, false);
  assert.equal(
    report.containsOrganizerRecords,
    freeze.containsOrganizerRecords,
  );
  assert.equal(report.humanReviewed, freeze.humanReviewed);
  assert.equal(report.containsOrganizerRecords, false);
  assert.equal(report.humanReviewed, false);
  assert.equal(report.messages, freeze.texts);
  assert.equal(report.scenarioFamilies, freeze.families);
  assert.equal(report.datasetHash, freeze.corpusSha256);
  assert.equal(report.autonomousRouting, false);
});

test("correction preserves frozen training artifacts, comparison inputs and active model", () => {
  const freeze = json("ml/v2/FREEZE.json");
  for (const [path, hash] of Object.entries(freeze.sha256)) {
    assert.equal(
      sha(`ml/v2/${path}`),
      hash,
      `Frozen artifact changed: ${path}`,
    );
  }
  const inputs = json("ml/v2/evaluation-inputs.json");
  for (const [key, path] of Object.entries({
    v1_model: "ml/v1/model.json",
    v1_inference_and_baseline: "ml/v1/train.py",
    v2_model: "ml/v2/model.json",
    heldout: "ml/heldout-v2/corpus.jsonl",
  }))
    assert.equal(sha(path), inputs[key], `Comparison input changed: ${key}`);
  assert.equal(sha("lib/data/model.json"), inputs.v2_model);
});

test("historical scores remain unchanged and are separated from current claims", () => {
  const history = json("ml/v2/test-report.json");
  const report = json("lib/data/model-report.json");
  assert.equal(history.counts.messages, 256);
  assert.equal(history.counts.families, 128);
  assert.equal(history.results.v2.accuracy, 218 / 256);
  assert.equal(history.results.baseline.accuracy, 168 / 256);
  assert.equal(report.accuracy, history.results.v2.accuracy);
  assert.equal(report.macroF1, history.results.v2.macro_f1);
  assert.equal(report.historicalMetricsOnly, true);
});

test("uncorrected media exports remain blocked from being represented as corrected", () => {
  const manifest = json("docs/video/manifest-v4.json");
  const slides = json("docs/presentation/metrics-v4.json");
  assert.match(manifest.status, /stale_render_required/);
  assert.equal(manifest.video.matches_corrected_sources, false);
  assert.equal(manifest.subtitles.embedded_mp4_matches_current_srt, false);
  assert.match(manifest.presentation.status, /stale/);
  assert.match(slides.renderedArtifactsStatus, /stale/);
  assert.equal(
    slides.historicalDevelopmentExperiment.independentValidation,
    false,
  );
  assert.equal(
    slides.historicalDevelopmentExperiment.eligibleOfficialChallengeBenchmark,
    false,
  );
  for (const [path, metadata] of Object.entries(manifest.corrected_sources)) {
    if (path === "docs/video/GUION_VIDEO.md") continue;
    assert.equal(
      sha(path),
      metadata.sha256,
      `Corrected source hash mismatch: ${path}`,
    );
  }
  assert.notEqual(
    sha("docs/video/GUION_VIDEO.md"),
    manifest.corrected_sources["docs/video/GUION_VIDEO.md"].sha256,
    "The V4 manifest must remain a historical snapshot after the V5 timing edit",
  );
  assert.equal(sha(manifest.subtitles.path), manifest.subtitles.sha256);
});

test("V5 render and measured sources match their current manifest", () => {
  const manifest = json("docs/video/manifest-v5.json");
  assert.equal(manifest.status, "v5_private_review_render_not_submitted");
  assert.ok(manifest.video.format_duration_seconds < 180);
  assert.equal(sha(manifest.video.path), manifest.video.sha256);
  // The current entry-point README can evolve. Keep the exact render-time
  // document in the archive and continue checking the original manifest hash.
  const historicalSources = {
    "docs/video/README.md": "docs/video/archive/README-v5-render-source.md",
  };
  for (const [path, metadata] of Object.entries(manifest.sources))
    assert.equal(
      sha(historicalSources[path] ?? path),
      metadata.sha256,
      `V5 source changed: ${path}`,
    );
  assert.equal(manifest.qa.external_embedded_text_and_timestamp_match, true);
  assert.equal(manifest.qa.human_listening_review, false);
});

test("corrected V5 deck matches its verified exports without relabeling the old video", () => {
  const manifest = json("docs/video/manifest-v4.json");
  const presentation = manifest.corrected_presentation;
  const metrics = json("docs/presentation/metrics-v5.json");
  const receipt = json("docs/presentation/render-v5.json");
  assert.equal(
    presentation.status,
    "v5_pptx_pdf_rendered_and_visually_checked",
  );
  assert.equal(presentation.used_in_existing_mp4, false);
  assert.equal(receipt.allSixSlidesVisuallyInspected, true);
  assert.equal(receipt.packageAndLayoutFindings, 0);
  assert.equal(receipt.pdfPageCount, 6);
  assert.equal(receipt.historicalV4Preserved, true);
  for (const extension of ["pptx", "pdf"]) {
    assert.equal(
      sha(presentation[extension]),
      presentation[`${extension}_sha256`],
    );
    assert.equal(
      metrics.renderedArtifacts[extension].sha256,
      presentation[`${extension}_sha256`],
    );
  }
});
