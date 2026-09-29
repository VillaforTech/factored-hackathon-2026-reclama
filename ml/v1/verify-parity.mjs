import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {predictIntent} from './inference.mjs';
const model = JSON.parse(readFileSync(new URL('./model.json', import.meta.url), 'utf8'));
const fixtures = JSON.parse(readFileSync(new URL('./parity-vectors.json', import.meta.url), 'utf8'));
let maxError = 0;
for (const example of fixtures.cases) {
  const result = predictIntent(model, example.text);
  for (const key of ['intent', 'accepted', 'decision']) assert.equal(result[key], example[key], key);
  for (const name of fixtures.classes) {
    const error = Math.abs(result.probabilities[name] - example.probabilities[name]);
    maxError = Math.max(error, maxError);
    assert.ok(error <= fixtures.tolerance, 'Probability parity ' + name);
  }
  for (const key of ['confidence','margin','known_token_ratio']) {
    assert.ok(Math.abs(result[key] - example[key]) <= fixtures.tolerance, key);
  }
}
console.log(JSON.stringify({cases:fixtures.cases.length, max_probability_error:maxError, tolerance:fixtures.tolerance, status:'passed'}));
