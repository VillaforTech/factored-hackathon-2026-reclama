"""Train a new export from the final public corpus; never read heldout or mutate v2.
Uses the already selected v2 configuration. No hyperparameter/threshold search.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import time


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path,required=True,
                        help='New directory that must not already exist; originals are never overwritten.')
    args=parser.parse_args()
    source=Path(__file__).resolve().parent
    output=args.output_dir.resolve()
    if output.exists():
        parser.error('--output-dir already exists; choose a new directory.')
    # A new run must not be placed inside any archived experiment/holdout folder.
    for protected in [source,source.parent/'v1',source.parent/'heldout-v2']:
        if output==protected or protected in output.parents:
            parser.error('--output-dir must be outside the archived v1/v2/heldout folders.')
    freeze=json.loads((source/'FREEZE.json').read_text())
    for filename in ['corpus.jsonl','model.json','validation-report.json','train_v2.py']:
        if sha(source/filename)!=freeze['sha256'][filename]:
            parser.error('Frozen input changed: '+filename)

    # Imports are delayed so --help works even before optional Python ML deps.
    v1=source.parent/'v1'
    if not (v1/'train.py').exists():
        v1=source.parent/'ml'
    sys.path.insert(0,str(v1))
    sys.path.insert(0,str(source))
    import numpy as np
    import sklearn
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from train_v2 import features

    rows=[json.loads(line) for line in (source/'corpus.jsonl').read_text().splitlines()]
    training=[row for row in rows if row['split']=='train']
    # Validation rows are present in the corpus but never used for fitting,
    # threshold selection, scoring or model selection in this reproduction.
    reference=json.loads((source/'model.json').read_text())
    selected=json.loads((source/'validation-report.json').read_text())['selected']
    assert selected['feature_mode']=='char' and selected['C']==12.0
    config=dict(feature_mode='char',C=12.0,min_df=2,max_features=3500,
                sublinear_tf=True,smooth_idf=True,norm='l2',class_weight='balanced',
                solver='lbfgs',max_iter=1500,tol=1e-8,random_seed=29092027)
    started=time.monotonic()
    vectorizer=TfidfVectorizer(analyzer=lambda text:features(text,'char'),min_df=2,
                              max_features=3500,sublinear_tf=True,norm='l2',
                              smooth_idf=True,dtype=np.float64)
    matrix=vectorizer.fit_transform([row['text'] for row in training])
    classifier=LogisticRegression(C=12.0,max_iter=1500,solver='lbfgs',
                                  class_weight='balanced',random_state=29092027,tol=1e-8)
    classifier.fit(matrix,[row['intent'] for row in training])
    vocabulary={key:int(value) for key,value in vectorizer.vocabulary_.items()}
    checks=dict(classes_equal=classifier.classes_.tolist()==reference['classes'],
                vocabulary_equal=vocabulary==reference['vocabulary'])
    for field,actual in [('idf',vectorizer.idf_),('coef',classifier.coef_),('intercept',classifier.intercept_)]:
        expected=np.asarray(reference[field])
        checks[field+'_exact_equal']=bool(np.array_equal(actual,expected))
        checks[field+'_max_abs_difference']=float(np.max(np.abs(actual-expected))) if actual.shape==expected.shape else None
    export={**reference,
            'model_version':'reclama-intent-v2-retrained-from-public-corpus',
            'classes':classifier.classes_.tolist(),'vocabulary':vocabulary,
            'idf':vectorizer.idf_.tolist(),'coef':classifier.coef_.tolist(),
            'intercept':classifier.intercept_.tolist(),
            'abstention':{'min_probability':1.0,'min_margin':1.0,'min_feature_coverage':1.0,
                          'selection':'closed_controls_retained_without_recalibration'},
            'autonomous_routing_allowed':False,'requires_user_intent_confirmation':True,
            'training_origin':'Public final corpus, train partition only. New artifact, no heldout evaluation.',
            'source_frozen_model_sha256':sha(source/'model.json')}
    report=dict(configuration=config,train_messages=len(training),
                validation_messages_used=0,heldout_read=False,hyperparameters_tuned=False,
                thresholds_tuned=False,fit_seconds=time.monotonic()-started,
                source_corpus_sha256=sha(source/'corpus.jsonl'),
                source_model_sha256=sha(source/'model.json'),numeric_comparison=checks,
                environment={'python':sys.version.split()[0],'numpy':np.__version__,'scikit_learn':sklearn.__version__},
                caveat='Numeric equality is checked for this run only. JSON hash differs by design because version/provenance metadata changes. No new accuracy or safety claims.')
    # Create only after fitting succeeds. Existing outputs can never be replaced.
    output.mkdir(parents=True,exist_ok=False)
    (output/'model.json').write_text(json.dumps(export,ensure_ascii=False,separators=(',',':'))+'\n')
    report['new_model_sha256']=sha(output/'model.json')
    (output/'training-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'output_dir':str(output),**report},indent=2))


if __name__=='__main__':
    main()
