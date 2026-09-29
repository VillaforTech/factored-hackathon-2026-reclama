/** Exact deployable inference for v2. No libraries or network requests.
 * The model suggests intent. Always obtain explicit user confirmation.
 */
export function predictIntent(model, text) {
  if (typeof text !== "string")
    throw new TypeError("Intent input must be text");
  const tokens =
    text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g) || [];
  const terms = [];
  if (["word", "hybrid"].includes(model.feature_mode)) {
    for (const token of tokens) terms.push("w:" + token);
    for (let i = 0; i + 1 < tokens.length; i++)
      terms.push("b:" + tokens[i] + " " + tokens[i + 1]);
  }
  if (["char", "hybrid"].includes(model.feature_mode)) {
    for (const token of tokens) {
      const padded = " " + token + " ";
      for (const n of [3, 4, 5])
        for (let i = 0; i + n <= padded.length; i++)
          terms.push("c:" + padded.slice(i, i + n));
    }
  }
  const counts = new Map();
  for (const term of terms) counts.set(term, (counts.get(term) || 0) + 1);
  const features = [];
  let known = 0;
  for (const [term, count] of counts) {
    if (!Object.prototype.hasOwnProperty.call(model.vocabulary, term)) continue;
    known += count;
    const index = model.vocabulary[term];
    features.push([index, (1 + Math.log(count)) * model.idf[index]]);
  }
  const norm = Math.sqrt(features.reduce((sum, [, v]) => sum + v * v, 0));
  const logits = model.intercept.map((bias, c) => {
    let logit = bias;
    if (norm)
      for (const [i, v] of features) logit += (model.coef[c][i] * v) / norm;
    return logit;
  });
  const max = Math.max(...logits);
  const exp = logits.map((x) => Math.exp(x - max));
  const total = exp.reduce((a, b) => a + b, 0);
  const probs = exp.map((x) => x / total);
  const order = probs
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p || a.i - b.i);
  const confidence = order[0].p,
    margin = confidence - order[1].p;
  const featureCoverage = terms.length ? known / terms.length : 0;
  const a = model.abstention;
  const accepted =
    confidence >= a.min_probability &&
    margin >= a.min_margin &&
    featureCoverage >= a.min_feature_coverage;
  const intent = model.classes[order[0].i];
  return {
    intent,
    accepted,
    decision: accepted ? intent : "clarify",
    confidence,
    margin,
    feature_coverage: featureCoverage,
    probabilities: Object.fromEntries(
      model.classes.map((cl, i) => [cl, probs[i]]),
    ),
  };
}
