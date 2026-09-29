import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {predictIntent} from './inference.mjs';
const source=readFileSync(new URL('../heldout-v2/corpus.jsonl',import.meta.url));
const hash=createHash('sha256').update(source).digest('hex');
if(hash!=='fbc39220225f6f55eb32110c3e400ae038f8ebd4ec7731ae911906cdde682ea9')throw Error('Unexpected corpus');
const rows=source.toString('utf8').trim().split('\n').map(x=>JSON.parse(x));
const model=JSON.parse(readFileSync(new URL('./model.json',import.meta.url),'utf8'));
// Warm every input once. Timed calls only measure CPU of already-parsed model.
for(const row of rows)predictIntent(model,row.text);
const durations=[];
for(let repeat=0;repeat<20;repeat++)for(const row of rows){const start=performance.now();predictIntent(model,row.text);durations.push(performance.now()-start);}
durations.sort((a,b)=>a-b);
const q=p=>durations[Math.floor((durations.length-1)*p)];
const report={kind:'local CPU warm inference only',model_version:model.model_version,messages:rows.length,repetitions:20,timed_calls:durations.length,
  p50_ms:q(.5),p95_ms:q(.95),p99_ms:q(.99),max_ms:durations.at(-1),mean_ms:durations.reduce((a,b)=>a+b,0)/durations.length,
  environment:{node:process.version,platform:process.platform,architecture:process.arch},
  excluded:['network','model JSON parsing','cold start','authentication','database','UI','all end-to-end latency'],
  api_calls:0,not_a_hosting_cost_estimate:true};
writeFileSync(new URL('./cpu-benchmark.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
