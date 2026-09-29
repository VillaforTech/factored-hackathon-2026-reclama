"""V2 experiment; deliberately never reads the independent heldout-v2 directory.
Only validation chooses features, C and abstention. train_v2 is frozen before
the independent evaluator receives its model. Preserve v1 artifacts unchanged.
"""
import csv, hashlib, json, math, re, sys, unicodedata
from collections import Counter
from pathlib import Path
import numpy as np
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parent/'ml'))
from train import baseline, CLASSES
SEED=29092027

def tokens(text):
 return re.findall('[a-z0-9]+',re.sub('[\u0300-\u036f]','',unicodedata.normalize('NFKD',text)).lower())

def features(text,mode):
 ts=tokens(text); out=[]
 if mode in ['word','hybrid']:
  out=['w:'+x for x in ts]+['b:'+a+' '+b for a,b in zip(ts,ts[1:])]
 if mode in ['char','hybrid']:
  for token in ts:
   padded=' '+token+' '
   for n in [3,4,5]:
    out.extend('c:'+padded[i:i+n] for i in range(len(padded)-n+1))
 return out

def assemble():
 rows=[]; rejected=[]
 curation=json.loads((ROOT/'curation.json').read_text())
 # V1 train only. V1 validation and test are never used for v2 fitting/selection.
 for line in (ROOT.parent/'ml'/'corpus.jsonl').read_text().splitlines():
  r=json.loads(line)
  if r['split']=='train':
   r=dict(r,id='v1_'+r['id'],family='v1_'+r['family'],provenance='v1 AI-curated synthetic training only; no human review')
   rows.append(r)
 for path in sorted((ROOT/'raw').glob('train-*.json')):
  run=json.loads(path.read_text())
  try: fams=json.loads(run['response'])['families']
  except Exception:
   rejected.append({'file':path.name,'reason':'invalid JSON or schema'}); continue
  for i,f in enumerate(fams):
   reason=curation['rejected'].get(run['label'],{}).get(str(i))
   if reason:
    rejected.append({'file':path.name,'row':i,'reason':'AI curation: '+reason});continue
   if not isinstance(f,dict) or not all(isinstance(f.get(k),str) for k in ['es','pt']):
    rejected.append({'file':path.name,'row':i,'reason':'missing language text'}); continue
   if not all(4<=len(tokens(f[k]))<=60 for k in ['es','pt']):
    rejected.append({'file':path.name,'row':i,'reason':'length outside 4-60 tokens'}); continue
   # A name placeholder cannot become a label cue. Remove placeholder contents,
   # retain the actual situation; disclose the edit. Do not invent account data.
   cleaned={lang:re.sub(r'\[[^\]]+\]','',f[lang]).strip() for lang in ['es','pt']}
   if not all(len(tokens(cleaned[k]))>=4 for k in ['es','pt']):
    rejected.append({'file':path.name,'row':i,'reason':'placeholder removal leaves insufficient text'}); continue
   family=f'gemma_{run["label"]}_{i:03}'
   for lang in ['es','pt']:
    rows.append(dict(id=family+'_'+lang,family=family,language=lang,split='train',intent=run['label'],text=cleaned[lang],
                     scenario=f.get('scenario'),provenance='local gemma2:9b Q4_0 synthetic; no human review',
                     source_file=path.name,placeholder_removed=cleaned[lang]!=f[lang]))
 for r in csv.DictReader((ROOT/'training-supplement.tsv').open(),delimiter='\t'):
  for lang in ['es','pt']:
   rows.append(dict(id=r['family']+'_'+lang,family=r['family'],language=lang,split='train',intent=r['intent'],text=r[lang],
                    provenance='AI-curated supplemental synthetic situations; no human review'))
 for r in csv.DictReader((ROOT/'validation-source.tsv').open(),delimiter='\t'):
  for lang in ['es','pt']:
   rows.append(dict(id=r['family']+'_'+lang,family=r['family'],language=lang,split='validation',intent=r['intent'],text=r[lang],
                    provenance='AI-curated synthetic validation, separate families; no human review'))
 # Remove exact duplicate training families as a whole. Never split ES/PT pairs.
 seen={}; bad=set()
 for r in rows:
  key=(r['language'],' '.join(tokens(r['text'])))
  if r['split']=='validation' and key in seen:
   bad.add(seen[key]); rejected.append({'family':seen[key],'reason':'exact normalized validation collision'})
  elif r['split']=='train' and key in seen and seen[key]!=r['family']:
   bad.add(r['family']); rejected.append({'family':r['family'],'reason':'exact training duplicate'})
  else: seen[key]=r['family']
 rows=[r for r in rows if r['family'] not in bad]
 # Conservative overlap audit only: do not select examples using class keywords.
 train=[r for r in rows if r['split']=='train']; val=[r for r in rows if r['split']=='validation']
 near=[]
 for a in val:
  aa=set(tokens(a['text']))
  for b in train:
   if a['language']!=b['language']: continue
   bb=set(tokens(b['text'])); score=len(aa&bb)/len(aa|bb)
   if score>=.8: near.append(dict(validation=a['id'],train=b['id'],word_set_jaccard=score))
 # Remove close training families to prevent near-copy validation leakage.
 nearbad={next(r['family'] for r in train if r['id']==x['train']) for x in near}
 rows=[r for r in rows if r['family'] not in nearbad]
 (ROOT/'corpus.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows))
 audit=dict(rejections=rejected,near_overlap_training_families_removed=sorted(nearbad),near_overlap_details=near,
            source='v1 train only + local Gemma-generated train; separate AI-curated validation',
            counts=dict(Counter(r['split'] for r in rows)),per_class={s:dict(Counter(r['intent'] for r in rows if r['split']==s)) for s in ['train','validation']})
 (ROOT/'corpus-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
 return rows,audit

def metrics(rows,pred):
 y=[r['intent'] for r in rows]
 return dict(n=len(y),accuracy=accuracy_score(y,pred),macro_f1=f1_score(y,pred,labels=CLASSES,average='macro',zero_division=0),
             classes=CLASSES,confusion_matrix=confusion_matrix(y,pred,labels=CLASSES).tolist(),
             class_report=classification_report(y,pred,labels=CLASSES,output_dict=True,zero_division=0),
             by_language={lang:dict(n=sum(r['language']==lang for r in rows),accuracy=float(np.mean([r['intent']==p for r,p in zip(rows,pred) if r['language']==lang]))) for lang in ['es','pt']})

def predict(model,text):
 fs=features(text,model['feature_mode']); counts=Counter(fs)
 sparse={model['vocabulary'][f]:(1+math.log(n))*model['idf'][model['vocabulary'][f]] for f,n in counts.items() if f in model['vocabulary']}
 norm=math.sqrt(sum(v*v for v in sparse.values()))
 logits=np.array([bias+sum(weight[i]*v/norm for i,v in sparse.items()) if norm else bias for bias,weight in zip(model['intercept'],model['coef'])])
 p=np.exp(logits-logits.max()); p=p/p.sum(); order=np.argsort(-p,kind='stable')
 confidence=float(p[order[0]]); gap=float(p[order[0]]-p[order[1]])
 coverage=sum(f in model['vocabulary'] for f in fs)/len(fs) if fs else 0.
 a=model['abstention']; accepted=confidence>=a['min_probability'] and gap>=a['min_margin'] and coverage>=a['min_feature_coverage']
 label=model['classes'][int(order[0])]
 return dict(intent=label,accepted=bool(accepted),decision=label if accepted else 'clarify',confidence=confidence,margin=gap,feature_coverage=coverage,probabilities=dict(zip(model['classes'],p.tolist())))

def main():
 rows,audit=assemble(); train=[r for r in rows if r['split']=='train']; val=[r for r in rows if r['split']=='validation']
 trials=[]
 for mode in ['word','char','hybrid']:
  analyzer=lambda s,mode=mode:features(s,mode)
  vec=TfidfVectorizer(analyzer=analyzer,min_df=2,max_features=3500,sublinear_tf=True,norm='l2',smooth_idf=True,dtype=np.float64)
  x=vec.fit_transform([r['text'] for r in train]); xv=vec.transform([r['text'] for r in val])
  for c in [1.,4.,12.]:
   clf=LogisticRegression(C=c,max_iter=1500,solver='lbfgs',class_weight='balanced',random_state=SEED,tol=1e-8).fit(x,[r['intent'] for r in train])
   m=metrics(val,clf.predict(xv)); trials.append((m['macro_f1'],m['accuracy'],-len(vec.vocabulary_),-c,mode,vec,clf,m))
 best=max(trials,key=lambda r:r[:4]); _,_,_,_,mode,vec,clf,met=best
 model=dict(schema_version=2,model_version='reclama-intent-v2-frozen',feature_mode=mode,
            normalization=dict(unicode='NFKD',remove_regex='[\\u0300-\\u036f]',lowercase=True,token_regex='[a-z0-9]+',word_prefix='w:',bigram_prefix='b:',bigram_separator=' ',char_prefix='c:',char_lengths=[3,4,5],char_word_padding=' ',tf='1+ln(count)',norm='l2'),
            classes=clf.classes_.tolist(),vocabulary={k:int(v) for k,v in vec.vocabulary_.items()},idf=vec.idf_.tolist(),coef=clf.coef_.tolist(),intercept=clf.intercept_.tolist(),
            abstention=dict(min_probability=1.,min_margin=1.,min_feature_coverage=1.),
            autonomous_routing_allowed=False,requires_user_intent_confirmation=True,supported_intake_intents=['unrecognized'],
            corpus_sha256=hashlib.sha256((ROOT/'corpus.jsonl').read_bytes()).hexdigest())
 vp=[predict(model,r['text']) for r in val]; thresholds=[]
 # Protocol fixed before looking at independent holdout. Always advisory, even
 # when these selection criteria pass; confirmation is a separate product gate.
 for conf in [.2,.3,.4,.5,.6,.7,.8]:
  for margin in [0.,.05,.1,.2,.3]:
   for coverage in [.25,.5,.65]:
    accepted=[i for i,p in enumerate(vp) if p['confidence']>=conf and p['margin']>=margin and p['feature_coverage']>=coverage]
    if not accepted:continue
    correct=sum(vp[i]['intent']==val[i]['intent'] for i in accepted)
    sup=[i for i in accepted if vp[i]['intent']=='unrecognized']
    wrongsup=sum(val[i]['intent']!='unrecognized' for i in sup)
    if correct/len(accepted)>=.95 and len(sup)>=8 and wrongsup==0:
     thresholds.append((len(accepted),correct/len(accepted),conf,margin,coverage))
 if thresholds:
  _,_,conf,margin,coverage=max(thresholds)
  model['abstention']=dict(min_probability=conf,min_margin=margin,min_feature_coverage=coverage,selection='validation_only_advisory')
 else:model['abstention']['selection']='validation_constraints_failed_abstain_all'
 (ROOT/'model.json').write_text(json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n')
 final=[predict(model,r['text']) for r in val]; accepted=[i for i,p in enumerate(final) if p['accepted']]; sup=[i for i in accepted if final[i]['intent']=='unrecognized']
 report=dict(experiment='v2',evaluation_partition='validation only; independent heldout-v2 never read',
             protocol=dict(model_selection='maximize macro-F1, then accuracy, then fewer features, then lower C',
                           threshold_selection='maximize coverage with >=95% selective accuracy, >=8 accepted unrecognized and zero observed false unrecognized. Otherwise abstain all. Never autonomous.',
                           random_seed=SEED),
             corpus=audit,selected=dict(feature_mode=mode,C=float(clf.C),features=len(vec.vocabulary_)),
             candidates=[dict(mode=t[4],C=float(t[6].C),features=len(t[5].vocabulary_),accuracy=t[7]['accuracy'],macro_f1=t[7]['macro_f1']) for t in trials],
             baseline=metrics(val,[baseline(r['text']) for r in val]),learned=met,
             routing=dict(n=len(val),accepted=len(accepted),coverage=len(accepted)/len(val),
                          correct=sum(final[i]['intent']==val[i]['intent'] for i in accepted),
                          selective_accuracy=sum(final[i]['intent']==val[i]['intent'] for i in accepted)/len(accepted) if accepted else None,
                          unrecognized_accepted=len(sup),unrecognized_false_accept=sum(val[i]['intent']!='unrecognized' for i in sup),
                          unrecognized_total=sum(r['intent']=='unrecognized' for r in val),thresholds=model['abstention']),
             export=dict(bytes=(ROOT/'model.json').stat().st_size,sha256=hashlib.sha256((ROOT/'model.json').read_bytes()).hexdigest()),
             environment=dict(python=sys.version.split()[0],sklearn=sklearn.__version__,numpy=np.__version__),
             limitations=['Synthetic train and validation, no independent human Portuguese or labeling review.','Gemma labels are prompt-assigned, not independently adjudicated.','Validation selected model and thresholds; its metrics are optimistic selection evidence, not a heldout generalization estimate.','No autonomous intent routing or financial decisions.','No evaluation of cross-customer authorization, action safety or end-to-end resolution by this component.'])
 (ROOT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'predictions-validation.jsonl').write_text(''.join(json.dumps(dict(r,prediction=p,baseline=baseline(r['text'])),ensure_ascii=False)+'\n' for r,p in zip(val,final)))
 probes=['No reconozco un cargo de 83 dólares.','Não reconheço essa cobrança de R$ 83,00!','Me cobraron dos veces la misma compra.','Perdi meu cartão; quero bloqueá-lo.','Quiero un préstamo para estudios.','Qual é meu saldo disponível?','No reconozco, no reconozco, no reconozco ese cargo.','¿¿¿','','𝙃𝙤𝙡𝙖 CAFÉ café\tCAFÉ — １２３']
 (ROOT/'parity-vectors.json').write_text(json.dumps(dict(tolerance=1e-9,classes=CLASSES,cases=[dict(text=t,**predict(model,t)) for t in probes]),ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:report[k] for k in ['selected','candidates','routing','export']},indent=2),flush=True)
 print('validation baseline',report['baseline']['accuracy'],report['baseline']['macro_f1'],' learned',report['learned']['accuracy'],report['learned']['macro_f1'],flush=True)

if __name__=='__main__':main()
