import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {predictIntent} from './inference.mjs';
const model=JSON.parse(readFileSync(new URL('./model.json',import.meta.url),'utf8'));
const fixtures=JSON.parse(readFileSync(new URL('./parity-vectors.json',import.meta.url),'utf8'));
let maxError=0;
for(const f of fixtures.cases){
 const r=predictIntent(model,f.text);
 for(const key of ['intent','accepted','decision'])assert.equal(r[key],f[key]);
 for(const name of fixtures.classes){const e=Math.abs(r.probabilities[name]-f.probabilities[name]);maxError=Math.max(e,maxError);assert.ok(e<=fixtures.tolerance);}
 for(const key of ['confidence','margin','feature_coverage'])assert.ok(Math.abs(r[key]-f[key])<=fixtures.tolerance);
}
console.log(JSON.stringify({status:'passed',cases:fixtures.cases.length,max_probability_error:maxError,tolerance:fixtures.tolerance}));
