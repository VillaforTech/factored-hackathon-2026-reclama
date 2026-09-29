"""Read-only package check: hashes, imports and fixed parity probes.
Does not train, evaluate the heldout, change thresholds or overwrite reports.
"""
from pathlib import Path
import hashlib
import json
import sys

ROOT=Path(__file__).resolve().parent
V1=ROOT/'v1'
V2=ROOT/'v2'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    freeze=json.loads((V2/'FREEZE.json').read_text())
    for name,expected in freeze['sha256'].items():
        assert sha(V2/name)==expected, f'Frozen artifact changed: {name}'
    inputs=json.loads((V2/'evaluation-inputs.json').read_text())
    assert sha(V1/'model.json')==inputs['v1_model'], 'v1 model changed'
    assert sha(V1/'train.py')==inputs['v1_inference_and_baseline'], 'v1 baseline/inference changed'
    assert sha(V2/'model.json')==inputs['v2_model'], 'v2 model changed'
    assert sha(ROOT/'heldout-v2'/'corpus.jsonl')==inputs['heldout'], 'heldout changed'
    # Import the archived modules in the same layout used by evaluate_once.py.
    sys.path.insert(0,str(V1))
    sys.path.insert(0,str(V2))
    import train as v1
    import train_v2 as v2
    import numpy
    import scipy
    import sklearn
    errors=[]
    count=0
    for directory,predictor in [(V1,lambda model,text:v1.export_predict(text,model)),(V2,v2.predict)]:
        model=json.loads((directory/'model.json').read_text())
        fixtures=json.loads((directory/'parity-vectors.json').read_text())
        assert model['autonomous_routing_allowed'] is False
        assert model['requires_user_intent_confirmation'] is True
        for fixture in fixtures['cases']:
            result=predictor(model,fixture['text'])
            for key in ['intent','accepted','decision']:
                assert result[key]==fixture[key], (directory.name,key)
            for intent in fixtures['classes']:
                delta=abs(result['probabilities'][intent]-fixture['probabilities'][intent])
                errors.append(delta)
                assert delta<=fixtures['tolerance'], (directory.name,intent,delta)
            count+=1
    print(json.dumps({'status':'passed','frozen_artifacts_checked':len(freeze['sha256']),
                      'comparison_inputs_checked':len(inputs),'parity_probes':count,
                      'max_probability_error':max(errors),'heldout_evaluated':False,
                      'training_performed':False,
                      'versions':{'python':sys.version.split()[0],'numpy':numpy.__version__,
                                  'scipy':scipy.__version__,'scikit_learn':sklearn.__version__}},indent=2))


if __name__=='__main__':
    main()
