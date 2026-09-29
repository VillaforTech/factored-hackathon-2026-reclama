"""One frozen evaluation; refuses to overwrite an existing report.
Authorized independent set only, no fitting or threshold changes.
"""
import argparse,hashlib,json,sys
from collections import Counter
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parent
EXPECTED='fbc39220225f6f55eb32110c3e400ae038f8ebd4ec7731ae911906cdde682ea9'

def route(rows,pred):
 accepted=[i for i,p in enumerate(pred) if p['accepted']]
 supported=[i for i in accepted if pred[i]['intent']=='unrecognized']
 return dict(n=len(rows),accepted=len(accepted),coverage=len(accepted)/len(rows),
             selective_accuracy=sum(pred[i]['intent']==rows[i]['intent'] for i in accepted)/len(accepted) if accepted else None,
             unrecognized_accepted=len(supported),unrecognized_false_accept=sum(rows[i]['intent']!='unrecognized' for i in supported),
             unrecognized_accept_precision=sum(rows[i]['intent']=='unrecognized' for i in supported)/len(supported) if supported else None,
             unrecognized_accept_recall=sum(rows[i]['intent']=='unrecognized' for i in supported)/sum(r['intent']=='unrecognized' for r in rows))

def main():
 parser=argparse.ArgumentParser(description='Reproduce frozen evaluation into a new directory; never fit or overwrite results.')
 parser.add_argument('--assets-dir',type=Path,default=ROOT)
 parser.add_argument('--v1-dir',type=Path)
 parser.add_argument('--heldout',type=Path)
 parser.add_argument('--output-dir',type=Path)
 args=parser.parse_args()
 assets=args.assets_dir.resolve()
 v1_dir=(args.v1_dir or next((p for p in [assets.parent/'v1',assets.parent/'ml'] if (p/'train.py').exists()),assets.parent/'v1')).resolve()
 output=(args.output_dir or assets).resolve()
 if (output/'test-report.json').exists():raise SystemExit('Evaluation already exists; no overwrite or refitting permitted. Use a new --output-dir for reproduction.')
 sys.path.insert(0,str(v1_dir));sys.path.insert(0,str(assets))
 import train as v1
 import train_v2
 freeze=json.loads((assets/'FREEZE.json').read_text())
 for file,expected in freeze['sha256'].items():
  assert hashlib.sha256((assets/file).read_bytes()).hexdigest()==expected,file+' changed after freeze'
 source=(args.heldout or assets.parent/'heldout-v2'/'corpus.jsonl').resolve()
 assert hashlib.sha256(source.read_bytes()).hexdigest()==EXPECTED,'Unexpected heldout'
 raw=[json.loads(x) for x in source.read_text().splitlines()]
 rows=[dict(id=r['id'],family=r['familyId'],pair=r['pairId'],language=r['locale'],intent=r['label'],text=r['text']) for r in raw]
 assert all(r['intent'] in v1.CLASSES for r in rows)
 m2=json.loads((assets/'model.json').read_text());m1=json.loads((v1_dir/'model.json').read_text())
 p2=[train_v2.predict(m2,r['text']) for r in rows];p1=[v1.export_predict(r['text'],m1) for r in rows];pb=[v1.baseline(r['text']) for r in rows]
 preds={'v2':[p['intent'] for p in p2],'v1':[p['intent'] for p in p1],'baseline':pb}
 families=list(dict.fromkeys(r['family'] for r in rows));rng=np.random.default_rng(29092028);comparisons={}
 for other in ['baseline','v1']:
  diffs=np.array([np.mean([int(preds['v2'][i]==r['intent'])-int(preds[other][i]==r['intent']) for i,r in enumerate(rows) if r['family']==f]) for f in families])
  bootstrap=np.mean(rng.choice(diffs,size=(4000,len(families)),replace=True),axis=1)
  comparisons[other]=dict(paired_accuracy_difference=float(diffs.mean()),family_bootstrap_95_percentile_interval=np.quantile(bootstrap,[.025,.975]).tolist(),replicates=4000,seed=29092028)
 report=dict(protocol='Single frozen heldout evaluation, no tuning after access',dataset_sha256=EXPECTED,
             freeze=freeze,provenance='Independent AI-authored synthetic holdout, not a real banking sample or human-reviewed Portuguese benchmark.',
             counts=dict(messages=len(rows),families=len(families),pairs=len(set(r['pair'] for r in rows)),class_counts=dict(Counter(r['intent'] for r in rows))),
             results={name:train_v2.metrics(rows,p) for name,p in preds.items()},routing=dict(v2=route(rows,p2),v1=route(rows,p1)),comparisons=comparisons,
             errors=[dict(r,baseline=pb[i],v1=p1[i],v2=p2[i]) for i,r in enumerate(rows) if preds['v2'][i]!=r['intent']],
             limitations=['Synthetic, balanced and AI-authored; not representative of demand or financial risk.',
                          'Familial bootstrap retains correlated ES/PT/paraphrases but excludes author and labeling biases.',
                          'V2 abstains all under its frozen routing controls; raw classification improvement does not validate automatic routing.',
                          'No measured production savings, real fraud outcomes, human language adjudication or end-to-end action safety.'])
 output.mkdir(parents=True,exist_ok=True)
 (output/'test-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (output/'predictions-heldout.jsonl').write_text(''.join(json.dumps(dict(r,baseline=pb[i],v1=p1[i],v2=p2[i]),ensure_ascii=False)+'\n' for i,r in enumerate(rows)))
 print(json.dumps(dict(counts=report['counts'],metrics={name:{k:v[k] for k in ['accuracy','macro_f1','by_language']} for name,v in report['results'].items()},routing=report['routing'],comparisons=comparisons),indent=2))

if __name__=='__main__':main()
