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
    assert.equal(
      sha(path),
      metadata.sha256,
      `Corrected source hash mismatch: ${path}`,
    );
  }
  assert.equal(sha(manifest.subtitles.path), manifest.subtitles.sha256);
});
