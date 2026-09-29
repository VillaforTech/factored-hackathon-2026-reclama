/** Reference Cloudflare-compatible pure JavaScript inference; no dependencies.
 * The output is a routing suggestion. It never grants access or approves actions.
 * Stable probability ties follow the exported classes order (Python argmax).
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
  const terms = [...tokens];
  for (let i = 0; i + 1 < tokens.length; i++)
    terms.push(tokens[i] + " " + tokens[i + 1]);
  const counts = new Map();
  for (const term of terms) counts.set(term, (counts.get(term) || 0) + 1);
  const features = [];
  for (const [term, count] of counts) {
    // Guard own-property membership so input cannot use prototype properties.
    if (!Object.prototype.hasOwnProperty.call(model.vocabulary, term)) continue;
    const index = model.vocabulary[term];
    features.push([index, (1 + Math.log(count)) * model.idf[index]]);
  }
  const norm = Math.sqrt(
    features.reduce((sum, [, value]) => sum + value * value, 0),
  );
  const logits = model.intercept.map((intercept, classIndex) => {
    let logit = intercept;
    if (norm)
      for (const [index, value] of features)
        logit += (model.coef[classIndex][index] * value) / norm;
    return logit;
  });
  const maxLogit = Math.max(...logits);
  const exp = logits.map((logit) => Math.exp(logit - maxLogit));
  const denominator = exp.reduce((sum, value) => sum + value, 0);
  const probabilities = exp.map((value) => value / denominator);
  const order = probabilities
    .map((probability, index) => ({ probability, index }))
    .sort((a, b) => b.probability - a.probability || a.index - b.index);
  const confidence = order[0].probability;
  const margin = confidence - order[1].probability;
  const known = tokens.length
    ? tokens.filter((t) =>
        Object.prototype.hasOwnProperty.call(model.vocabulary, t),
      ).length / tokens.length
    : 0;
  const { min_probability, min_margin, min_known_token_ratio } =
    model.abstention;
  const accepted =
    confidence >= min_probability &&
    margin >= min_margin &&
    known >= min_known_token_ratio;
  const intent = model.classes[order[0].index];
  return {
    intent,
    accepted,
    decision: accepted ? intent : "clarify",
    confidence,
    margin,
    known_token_ratio: known,
    probabilities: Object.fromEntries(
      model.classes.map((name, index) => [name, probabilities[index]]),
    ),
  };
}
