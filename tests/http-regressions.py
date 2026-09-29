#!/usr/bin/env python3
"""Retest only the natural-secret and agent-update findings on local fixtures.
No new case is created. An existing synthetic case is required for agent checks.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import time
import urllib.parse

path=Path(__file__).with_name('http-integration.py')
spec=importlib.util.spec_from_file_location('reclama_http',path)
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url',default='http://127.0.0.1:5173')
    parser.add_argument('--output',default=str(Path(__file__).with_name('http-regression-results.json')))
    args=parser.parse_args()
    parsed=urllib.parse.urlsplit(args.base_url)
    if parsed.hostname not in ('127.0.0.1','localhost','::1') or parsed.username or parsed.password or parsed.path not in ('','/') or parsed.query or parsed.fragment:
        parser.error('This regression helper accepts a loopback origin only.')
    base=args.base_url.rstrip('/');results=[]
    def record(key,fn):
        try:
            evidence=fn();results.append({'id':key,'status':'pass','evidence':evidence})
        except h.CheckFailure as error:
            results.append({'id':key,'status':'fail','reason':str(error)})
        except Exception as error:
            results.append({'id':key,'status':'error','reason':type(error).__name__})
    def actor(role):
        c=h.Client(base,20);c.navigate_local_signin()
        r=c.request('POST','/api/session',{'persona':'ana','role':role,'locale':'es'})
        h.require(r['status']==201,'Session bootstrap failed.')
        return c
    customer=actor('customer');agent=actor('agent')
    txs=h.collection(customer.request('GET','/api/transactions'),'transactions')
    tx=next(t['id'] for t in txs if t['status']=='Approved')
    inputs={'es_pin':'Mi PIN es 2719. No reconozco este cargo.','pt_pin':'Meu PIN é 2719. Não reconheço esta cobrança.','es_password':'Mi contraseña es ejemplo-sintetico. No reconozco el cargo.','pt_password':'Minha senha é exemplo-sintetico. Não reconheço a cobrança.'}
    for key,value in inputs.items():
        def check(value=value):
            r=customer.request('POST','/api/drafts',{'transactionId':tx,'statement':value,'reason':'unrecognized'})
            h.require(r['status']==422,'Sensitive synthetic sentence accepted or not rejected as validation error; HTTP '+str(r['status']))
            return {'http_status':r['status'],'real_credentials_used':False}
        record(key,check)
    records=h.collection(agent.request('GET','/api/cases'),'cases')
    context={}
    def valid_update():
        h.require(bool(records),'No existing synthetic case for agent regression.')
        c=records[0];cid=c['id'];v=c['version'];context.update(id=cid,old_version=v)
        r=agent.request('PATCH','/api/cases/'+urllib.parse.quote(cid,safe=''),{'status':'in_review','note':'Revisión humana iniciada durante una prueba de regresión.','version':v})
        after=h.entity(agent.request('GET','/api/cases/'+urllib.parse.quote(cid,safe='')),'case')
        h.require(r['status']==200,f'Valid update returned {r["status"]}; mutation_committed={after.get("version")!=v}.')
        h.require(after.get('version')==v+1 and h.state_of(after)=='in_review','Agent readback differs.')
        return {'http_status':200,'version_delta':1,'readback_verified':True}
    record('valid_agent_update',valid_update)
    def stale_update():
        h.require('id' in context,'Valid update setup absent.')
        cid=context['id'];before=h.entity(agent.request('GET','/api/cases/'+urllib.parse.quote(cid,safe='')),'case')
        r=agent.request('PATCH','/api/cases/'+urllib.parse.quote(cid,safe=''),{'status':'needs_information','note':'Esta versión anterior no debe modificar el expediente.','version':context['old_version']})
        after=h.entity(agent.request('GET','/api/cases/'+urllib.parse.quote(cid,safe='')),'case')
        h.require(r['status']==409 and before==after,'Stale update not rejected without state change.')
        return {'http_status':409,'state_unchanged':True}
    record('stale_agent_update',stale_update)
    report={'scope':'Six local regression checks only; not the full acceptance or held-out suite.','timestamp_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'real_credentials_used':False,'cases_created':0,'results':results,'counts':{s:sum(x['status']==s for x in results) for s in ['pass','fail','error']}}
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report['counts']['pass']==6 else 1

if __name__=='__main__':
    raise SystemExit(main())
