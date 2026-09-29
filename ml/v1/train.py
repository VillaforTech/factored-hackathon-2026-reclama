"""Offline bilingual intent experiment. No APIs, bank records, or network calls.

Run: ../../.. / .venv/bin/python train.py (see model-card for exact command).
The corpus and rule baseline are frozen before test scoring. Model C and routing
thresholds are selected ONLY from validation; test never changes the export.
"""
from __future__ import annotations

import csv
import hashlib
import json
import math
import re
import sys
import time
import unicodedata
from collections import Counter
from pathlib import Path

import numpy as np
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

ROOT = Path(__file__).resolve().parent
CLASSES = ['account_query', 'card_lost', 'credit_query', 'duplicate', 'merchant_issue', 'other', 'refund_request', 'unrecognized']
SEED = 29092026


def normalize(text):
    return re.sub('[\u0300-\u036f]', '', unicodedata.normalize('NFKD', text)).lower()


def tokens(text):
    return re.findall('[a-z0-9]+', normalize(text))


def terms(text):
    ts = tokens(text)
    return ts + [a + ' ' + b for a, b in zip(ts, ts[1:])]


# Fixed bilingual expert-rule baseline. Weighted independent indicators, selected
# before model fit. It handles eight intents, strong multiword cues and explicit
# negation; it is not the model's vocabulary or an oracle for generated labels.
PATTERNS = {
    'unrecognized': [
        (4, r'\b(?:no|nao)\s+(?:lo\s+|la\s+|a\s+|o\s+)?(?:reconozco|reconheco|hice|fiz|autorice|autorizei|compre|comprei|pague|paguei|permiti)\b'),
        (3, r'\b(?:desconozco|desconocer|desconheco|sin mi permiso|sem a minha permissao|no es mio|nao e minha|ajena|alheia)\b'),
        (2, r'\b(?:nunca|jamas)\b.*\b(?:contrate|contratei|reserve|reservei|autorice|autorizei|estado|estive)\b'),
        (2, r'\b(?:comercio|tienda|loja|estabelecimento)\b.*\b(?:desconocid\w*|desconhecid\w*)\b'),
    ],
    'duplicate': [
        (4, r'\b(?:duplicad\w*|duplicacion|duplicacao|duplicidade|duplicado|repetid\w*)\b'),
        (3, r'\b(?:dos|duas|tres) veces\b|\b(?:duas|tres) vezes\b|\b(?:doble|dobro|por duplicado)\b'),
        (3, r'\b(?:dos|dois|duas|tres)\s+(?:cobros|cobrancas|debitos|descuentos|descontos|transacciones|transacoes)\b'),
        (2, r'\b(?:identicos|identicas|iguales|iguais)\b'),
    ],
    'merchant_issue': [
        (3, r'\b(?:danad\w*|danificad\w*|rot[oa]|quebrad\w*|falsificad\w*)\b'),
        (3, r'\b(?:nunca|jamas|nao|no)\s+(?:lo\s+|o\s+)?(?:llego|chegou|recibi|recebi|funciona|aparecio|apareceu|vino|veio)\b'),
        (3, r'\b(?:producto|produto|articulo|artigo)\b.*\b(?:distinto|diferente|usado|usad[ao])\b'),
        (3, r'\b(?:faltan|faltam|vacio|vazio|no se presto|nao foi prestado)\b'),
        (2, r'\b(?:vendedor|proveedor|fornecedor|entrega)\b'),
    ],
    'refund_request': [
        (4, r'\b(?:reembols\w*|reintegr\w*|estorn\w*|restituy\w*|restitu\w*)\b'),
        (3, r'\b(?:devolucion|devolucao|devolvi)\b'),
        (3, r'\b(?:devolver|devuelvan|devolvam|devolvido)\b.*\b(?:dinero|dinheiro|pagado|paguei|valor)\b'),
        (2, r'\b(?:abono|credito)\b.*\b(?:cancelacion|cancelamento)\b'),
    ],
    'card_lost': [
        (4, r'\b(?:perdi|perdida|perdido|extravi\w*|robaron|roubaram|assaltad\w*|asaltad\w*|furtad\w*|sustrajeron)\b'),
        (3, r'\b(?:bloquear\w*|congelar\w*|desactivar\w*|desativar\w*|inhabilit\w*|inutiliz\w*)\b'),
        (2, r'\b(?:no encuentro|nao encontro|no se donde|nao sei onde)\b.*\b(?:tarjeta|cartao|plastico)\b'),
    ],
    'account_query': [
        (3, r'\b(?:saldo|balance|extrato|extracto|estado de cuenta|cuenta de ahorros|conta poupanca)\b'),
        (2, r'\b(?:transferencia|deposito|nomina|salario|comprobante|comprovante)\b'),
        (2, r'\b(?:pendiente|pendente|rechazad\w*|recusad\w*|disponible|disponivel|movimientos|movimentacoes)\b'),
    ],
    'credit_query': [
        (4, r'\b(?:prestam\w*|emprestim\w*|hipoteca|financ\w*)\b'),
        (3, r'\b(?:elegib\w*|preaprobacion|pre-aprovacao|score|juros|intereses|tasa de interes)\b'),
        (2, r'\b(?:credito|cuotas|parcelas)\b'),
        (2, r'\b(?:solicitar|solicito|solicitacao|requisitos|qualifico|califico)\b'),
    ],
    'other': [
        (5, r'\b(?:contrasena|senha|sms|sucursal|agencia|horario|correo|e-mail|promocionales|promocionais|asesor humano|consultor humano|cocinar|cozinhar|capital|luna|lua)\b'),
        (3, r'\b(?:app|aplicacion|aplicativo|telefono|telefone|contacto|contato)\b'),
    ],
}


def baseline(text):
    tx = normalize(text)
    scores = {label: sum(weight for weight, rx in rules if re.search(rx, tx)) for label, rules in PATTERNS.items()}
    if re.search(r'\b(?:no|nao)\b.{0,24}\b(?:desconociendo|contestando|disputar|contestar)\b', tx):
        scores['unrecognized'] = 0
    # A greeting with no domain evidence should not invent a domain intent.
    best = max(CLASSES, key=lambda label: scores[label])
    return best if scores[best] >= 2 else 'other'


def corpus():
    rows = []
    for item in csv.DictReader((ROOT / 'corpus-source.tsv').open(), delimiter='\t'):
        for lang in ['es', 'pt']:
            rows.append(dict(id=item['family']+'_'+lang, family=item['family'], language=lang,
                             split=item['split'], intent=item['intent'], text=item[lang],
                             provenance='AI-authored synthetic; no human validation'))
    assert len(rows) == 320
    family_splits = {}
    normalized_splits = {}
    for row in rows:
        family_splits.setdefault(row['family'], set()).add(row['split'])
        normalized_splits.setdefault(' '.join(tokens(row['text'])), set()).add(row['split'])
    assert all(len(v) == 1 for v in family_splits.values()), 'Family split leakage'
    assert all(len(v) == 1 for v in normalized_splits.values()), 'Exact normalized text split leakage'
    for split in ['train', 'validation', 'test']:
        for label in CLASSES:
            count = sum(r['split'] == split and r['intent'] == label for r in rows)
            assert count == (24 if split == 'train' else 8)
    (ROOT / 'corpus.jsonl').write_text(''.join(json.dumps(r, ensure_ascii=False)+'\n' for r in rows))
    return rows


def softmax(logits):
    exps = np.exp(logits - np.max(logits, axis=-1, keepdims=True))
    return exps / np.sum(exps, axis=-1, keepdims=True)


def routing_stats(rows, predicted, accepted):
    truth = np.array([r['intent'] for r in rows])
    correct = np.array(predicted) == truth
    accept_u = np.array(accepted) & (np.array(predicted) == 'unrecognized')
    return dict(total=len(rows), accepted=int(sum(accepted)), abstained=int(len(rows)-sum(accepted)),
                coverage=float(np.mean(accepted)),
                selective_accuracy=float(np.mean(correct[accepted])) if any(accepted) else None,
                unrecognized_accepted=int(sum(accept_u)),
                unrecognized_false_accept=int(sum(accept_u & (truth != 'unrecognized'))),
                unrecognized_accept_precision=float(np.mean(truth[accept_u] == 'unrecognized')) if any(accept_u) else None,
                unrecognized_accept_recall=float(sum(accept_u & (truth == 'unrecognized'))/sum(truth == 'unrecognized')))


def metrics(rows, pred):
    truth = [r['intent'] for r in rows]
    return dict(n=len(rows), accuracy=accuracy_score(truth, pred),
                macro_f1=f1_score(truth, pred, labels=CLASSES, average='macro', zero_division=0),
                classes=CLASSES,
                confusion_matrix=confusion_matrix(truth, pred, labels=CLASSES).tolist(),
                class_report=classification_report(truth, pred, labels=CLASSES, output_dict=True, zero_division=0),
                by_language={lang: {'n':sum(r['language']==lang for r in rows),
                                   'accuracy':float(np.mean([p==r['intent'] for p,r in zip(pred,rows) if r['language']==lang]))}
                             for lang in ['es','pt']})


def export_predict(text, model):
    counts = Counter(terms(text))
    sparse = {model['vocabulary'][t]: (1+math.log(c))*model['idf'][model['vocabulary'][t]]
              for t,c in counts.items() if t in model['vocabulary']}
    norm = math.sqrt(sum(v*v for v in sparse.values()))
    logits = [b+sum(coefs[k]*(v/norm) for k,v in sparse.items()) if norm else b
              for b,coefs in zip(model['intercept'],model['coef'])]
    probs = softmax(np.array(logits)).tolist()
    order = sorted(range(len(probs)), key=lambda i:probs[i], reverse=True)
    ts=tokens(text)
    known=sum(t in model['vocabulary'] for t in ts)/len(ts) if ts else 0
    confidence=probs[order[0]]
    margin=probs[order[0]]-probs[order[1]]
    cfg=model['abstention']
    accepted=bool(confidence>=cfg['min_probability'] and margin>=cfg['min_margin'] and known>=cfg['min_known_token_ratio'])
    return {'intent':model['classes'][order[0]], 'accepted':accepted,
            'decision':model['classes'][order[0]] if accepted else 'clarify',
            'confidence':confidence,'margin':margin,'known_token_ratio':known,
            'probabilities':dict(zip(model['classes'],probs))}


def main():
    rows=corpus()
    train=[r for r in rows if r['split']=='train']
    val=[r for r in rows if r['split']=='validation']
    test=[r for r in rows if r['split']=='test']
    vec=TfidfVectorizer(analyzer=terms, sublinear_tf=True, norm='l2', smooth_idf=True, dtype=np.float64)
    xtrain=vec.fit_transform([r['text'] for r in train])
    xval=vec.transform([r['text'] for r in val])
    ytrain=[r['intent'] for r in train]
    yval=[r['intent'] for r in val]
    candidates=[]
    for c in [0.5, 1.0, 4.0, 12.0]:
        clf=LogisticRegression(C=c, max_iter=1000, solver='lbfgs', random_state=SEED, tol=1e-9)
        clf.fit(xtrain,ytrain)
        score=f1_score(yval,clf.predict(xval),labels=CLASSES,average='macro',zero_division=0)
        candidates.append((score,c,clf))
    # Macro F1 first; prefer lower C at ties. No fit on validation or test.
    score,c,clf=max(candidates,key=lambda a:(a[0],-a[1]))
    vp=clf.predict_proba(xval)
    sortedp=np.sort(vp,axis=1)
    maxp=sortedp[:,-1]
    margin=maxp-sortedp[:,-2]
    predictions=clf.classes_[vp.argmax(axis=1)]
    known=np.array([sum(t in vec.vocabulary_ for t in tokens(r['text']))/len(tokens(r['text'])) for r in val])
    thresholds=[]
    advisory_thresholds=[]
    # Predeclared threshold grid, utility and risk constraints. Validation counts
    # are tiny: these are routing controls, NOT estimates of deployment safety.
    for confidence in [0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7]:
        for gap in [0.0,0.05,0.1,0.15,0.2]:
            for lex in [0.0,0.35,0.5]:
                accepted=(maxp>=confidence)&(margin>=gap)&(known>=lex)
                stats=routing_stats(val,predictions,accepted)
                # At least four supported examples, no observed false accept,
                # 90% overall selective accuracy; maximize accepted coverage.
                if stats['unrecognized_false_accept']==0 and (stats['selective_accuracy'] or 0)>=0.90:
                    if stats['unrecognized_accepted']>=4:
                        thresholds.append((stats['coverage'],stats['selective_accuracy'],confidence,gap,lex,stats))
                    if stats['unrecognized_accepted']>=2:
                        advisory_thresholds.append((stats['coverage'],stats['selective_accuracy'],confidence,gap,lex,stats))
    if thresholds:
        best=max(thresholds,key=lambda a:(a[0],a[1],a[2],a[3],a[4]))
        _,_,conf,gap,lex,vs=best
        threshold_status='selected_using_validation_only'
    elif advisory_thresholds:
        # The stricter support-count gate failed in v1. Preserve this failure.
        # These controls permit a tentative UI suggestion only; an explicit
        # user-confirmed intent is mandatory before proceeding. The revision was
        # based on validation only after v1 test aggregates had been observed.
        best=max(advisory_thresholds,key=lambda a:(a[0],a[1],a[2],a[3],a[4]))
        _,_,conf,gap,lex,vs=best
        threshold_status='advisory_only_strict_support_gate_failed'
    else:
        conf,gap,lex=1.0,1.0,1.0
        vs=routing_stats(val,predictions,np.zeros(len(val),dtype=bool))
        threshold_status='validation_constraints_failed_abstain_all'
    model=dict(schema_version=1,model_version='reclama-intent-2026-09-29-v1.1',
               description='Synthetic bilingual initial-message intent routing; never an authorization or fraud model.',
               normalization=dict(unicode='NFKD',remove_regex='[\\u0300-\\u036f]',lowercase=True,token_regex='[a-z0-9]+',
                                  ngrams=[1,2],bigram_separator=' ',tf='1+ln(count)',idf='ln((1+n_train)/(1+df))+1',norm='l2'),
               classes=clf.classes_.tolist(),vocabulary=vec.vocabulary_,
               idf=vec.idf_.tolist(),coef=clf.coef_.tolist(),intercept=clf.intercept_.tolist(),
               abstention=dict(min_probability=conf,min_margin=gap,min_known_token_ratio=lex,selection=threshold_status),
               autonomous_routing_allowed=False,requires_user_intent_confirmation=True,
               supported_intake_intents=['unrecognized'],random_seed=SEED,
               corpus_sha256=hashlib.sha256((ROOT/'corpus-source.tsv').read_bytes()).hexdigest())
    # Test untouched until model and routing controls are fixed/exported.
    (ROOT/'model.json').write_text(json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n')
    xtest=vec.transform([r['text'] for r in test])
    lp=clf.predict_proba(xtest)
    learned=clf.classes_[lp.argmax(axis=1)]
    base=[baseline(r['text']) for r in test]
    results=[export_predict(r['text'],model) for r in test]
    err=max(abs(results[j]['probabilities'][cl]-lp[j,i]) for j in range(len(test)) for i,cl in enumerate(CLASSES))
    assert err<1e-10,err
    deltas=[]
    family=list(dict.fromkeys(r['family'] for r in test))
    famdiff=np.array([np.mean([int(learned[i]==r['intent'])-int(base[i]==r['intent']) for i,r in enumerate(test) if r['family']==fam]) for fam in family])
    rng=np.random.default_rng(SEED)
    for _ in range(2000):
        deltas.append(float(np.mean(rng.choice(famdiff,size=len(family),replace=True))))
    report=dict(experiment='reclama-intent-2026-09-29-v1.1',
                provenance='Entire corpus AI-authored synthetic; no human review; no bank transcripts or records used.',
                scope='8-way initial-message intent classification, not resolution quality, financial accuracy or production safety.',
                selection=dict(C=c,validation_macro_f1=score,C_candidates=[{'C':v,'validation_macro_f1':s} for s,v,_ in candidates],
                               threshold_policy='Max validation coverage with >=90% selective accuracy and zero observed false unrecognized accepts. Strict >=4 supported-count gate failed. Advisory-only fallback >=2; always require user intent confirmation.',
                               initial_strict_validation_gate_passed=bool(thresholds),
                               policy_revision_disclosure='v1 was evaluated before the advisory-only fallback was added. The fallback used validation results only; no model, corpus, C, baseline or features were changed after test observation. Treat test as exploratory, not an independent final benchmark.',
                               threshold= model['abstention'],validation_routing=vs),
                counts=dict(total=len(rows),train=len(train),validation=len(val),test=len(test),
                            train_families=len(train)//2,validation_families=len(val)//2,test_families=len(test)//2,
                            languages=['es','pt'],class_balance='equal; 24 train + 8 validation + 8 test utterances per intent'),
                leakage_checks=dict(family_overlap_across_splits=0,exact_normalized_text_overlap_across_splits=0,
                                    paired_languages_together=True,tfidf_fitted_on='train only',test_used_for_selection=False),
                baseline=metrics(test,base),learned=metrics(test,learned),
                learned_routing=routing_stats(test,learned,np.array([r['accepted'] for r in results])),
                paired_accuracy_difference=dict(learned_minus_baseline=float(np.mean(famdiff)),
                                                family_cluster_bootstrap_95_percentile_interval=np.quantile(deltas,[.025,.975]).tolist(),
                                                n_families=len(family),bootstrap_replicates=2000,
                                                caveat='Synthetic author and label biases are not covered by this interval.'),
                export=dict(filename='model.json',bytes=(ROOT/'model.json').stat().st_size,features=len(vec.vocabulary_),python_parity_max_error=err,
                            sha256=hashlib.sha256((ROOT/'model.json').read_bytes()).hexdigest()),
                environment=dict(python=sys.version.split()[0],sklearn=sklearn.__version__,numpy=np.__version__),
                errors=[dict(id=r['id'],family=r['family'],language=r['language'],text=r['text'],truth=r['intent'],
                             baseline=base[i],learned=str(learned[i]),accepted=results[i]['accepted'],confidence=results[i]['confidence'])
                        for i,r in enumerate(test) if base[i]!=r['intent'] or learned[i]!=r['intent']],
                limitations=['AI-authored synthetic balanced corpus is not representative of bank demand.',
                             'No independent human Portuguese review or label adjudication.',
                             'Only 32 independent test scenarios (ES/PT pairs), four per class.',
                             'Strict validation support-count gate failed; exported classifier is advisory only and requires explicit user confirmation. Threshold fallback was revised after initial test aggregate reporting, so results are exploratory.',
                             'Validation reused for hyperparameter and threshold selection; selection can overfit.',
                             'Softmax values are ranking scores, not empirically calibrated probabilities.',
                             'Whole-dialogue context, multi-intent inputs and policy injection defense are not evaluated by this classifier.',
                             'Intent suggestions never authorize account access, case persistence, refunds or fraud conclusions.'])
    (ROOT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'predictions-test.jsonl').write_text(''.join(json.dumps(dict(r,baseline=base[i],learned=results[i]),ensure_ascii=False)+'\n' for i,r in enumerate(test)))
    # Non-benchmark parity probes include punctuation, accents, unknown tokens,
    # repeated terms and empty input; they do not tune model or evaluation.
    probes=['No reconozco un cargo de 83 dólares.','Não reconheço essa cobrança de R$ 83,00!',
            'Me cobraron dos veces la misma compra.','Perdi meu cartão; quero bloqueá-lo.',
            'Quiero un préstamo para estudios.','Qual é meu saldo disponível?',
            'No reconozco, no reconozco, no reconozco ese cargo.',
            '¿¿¿', '', '𝙃𝙤𝙡𝙖 CAFÉ café\tCAFÉ — １２３']
    parity=dict(tolerance=1e-9,classes=CLASSES,cases=[dict(text=t,**export_predict(t,model)) for t in probes])
    (ROOT/'parity-vectors.json').write_text(json.dumps(parity,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ['selection','counts','learned_routing','paired_accuracy_difference','export']},indent=2))
    print('RAW ACCURACY: baseline=',report['baseline']['accuracy'],' learned=',report['learned']['accuracy'])
    print('RAW MACRO F1: baseline=',report['baseline']['macro_f1'],' learned=',report['learned']['macro_f1'])


if __name__=='__main__':
    main()
