#!/usr/bin/env python3
"""Two-run, loopback-only regressions for Reclama's owner-scoped demo runs.

Uses the existing integration client's documented local sign-in. Creates at most
2 runs and 2 synthetic cases. Never clears storage, fabricates platform identity,
persists cookies or follows external authentication redirects.
"""
from __future__ import annotations
import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import time
import urllib.parse
import uuid


def find_client(explicit=None):
    if explicit:
        return Path(explicit).resolve()
    here = Path(__file__).resolve()
    for parent in here.parents:
        for rel in ('http-integration.py', 'tests/http-integration.py', 'app/tests/http-integration.py'):
            path = parent / rel
            if path.is_file():
                return path
    raise FileNotFoundError('Use --client-module to locate tests/http-integration.py')


class Gate:
    def __init__(self, args, api):
        self.args, self.api = args, api
        self.results, self.ctx = [], {}
        self.started = time.time()
        self.session_cookie = 'reclama_session'

    def need(self, key):
        if key not in self.ctx:
            raise self.api.Blocked('Missing prerequisite: ' + key)
        return self.ctx[key]

    def test(self, key, description, function):
        started = time.monotonic()
        try:
            evidence = function() or {}
            row = dict(id=key, description=description, status='pass', evidence=evidence)
        except self.api.Blocked as exc:
            row = dict(id=key, description=description, status='blocked', reason=str(exc))
        except self.api.CheckFailure as exc:
            row = dict(id=key, description=description, status='fail', reason=str(exc))
        except Exception as exc:
            row = dict(id=key, description=description, status='error', reason=type(exc).__name__)
        row['elapsed_ms'] = round((time.monotonic()-started)*1000, 2)
        self.results.append(row)
        print(f'{row["status"].upper():7s} {key} {description}', flush=True)

    def require(self, condition, message):
        self.api.require(condition, message)

    def cookie(self, client):
        values = [c.value for c in client.jar if c.name == self.session_cookie]
        self.require(len(values) == 1, 'Expected exactly one application session cookie.')
        return values[0]

    def view(self, client):
        r = client.request('GET', '/api/session')
        self.require(r['status'] == 200, f'Session read HTTP {r["status"]}.')
        return self.api.entity(r, 'session')

    def cases(self, client):
        return self.api.collection(client.request('GET', '/api/cases'), 'cases')

    def metrics(self, client):
        return self.api.collection(client.request('GET', '/api/metrics'), 'attempts')

    def draft(self, client, transaction, statement):
        r = client.request('POST', '/api/drafts', {'transactionId': transaction, 'reason': 'unrecognized', 'statement': statement})
        self.require(r['status'] == 201, f'Draft HTTP {r["status"]}.')
        d = self.api.entity(r, 'draft')
        return {'draftId': d.get('draftId') or d.get('id'), 'confirmationToken': d['confirmationToken'], 'idempotencyKey': str(uuid.uuid4()), 'confirmed': True}

    def run(self):
        api = self.api
        def anonymous():
            c = api.Client(self.args.base_url, self.args.timeout)
            paths = [('GET', '/api/runs', None), ('POST', '/api/runs', {'persona':'ana','locale':'es'}), ('PATCH', '/api/session', {'locale':'pt'})]
            statuses = []
            for method,path,body in paths:
                r = c.request(method,path,body); statuses.append(r['status'])
                self.require(r['status'] == 401, 'New endpoint allowed an anonymous request.')
            return {'statuses': statuses}
        self.test('RUN-001', 'New run and locale endpoints require platform sign-in', anonymous)

        def setup():
            c = api.Client(self.args.base_url, self.args.timeout)
            c.navigate_local_signin()
            r = c.request('POST', '/api/session', {'persona':'ana','role':'customer','locale':'es','runId':'default'})
            self.require(r['status'] == 201, f'Default session HTTP {r["status"]}.')
            self.require(self.view(c)['runId'] == 'default', 'Explicit default run is not active.')
            runs = api.collection(c.request('GET', '/api/runs'), 'runs')
            if len([x for x in runs if x['id'] != 'default']) > 48:
                raise api.Blocked('Two available run slots required; harness will not delete or reset existing runs.')
            self.ctx.update(base=c, default_ids={x['id'] for x in self.cases(c)}, default_metrics=self.metrics(c))
            return {'existing_run_count': len(runs)-1, 'cookies_logged': False}
        self.test('RUN-002', 'Documented sign-in and explicit default workspace', setup)

        def new_runs():
            base = self.need('base')
            ids = []
            for key in ['a','b']:
                client = base.clone()
                r = client.request('POST', '/api/runs', {'persona':'ana','locale':'es' if key == 'a' else 'pt'})
                self.require(r['status'] == 201, f'Create run {key} HTTP {r["status"]}.')
                view = self.view(client)
                self.require(view['role'] == 'customer' and view['customer']['id'], 'Run creation failed to mint customer session.')
                rid = view['runId']; uuid.UUID(rid); ids.append(rid)
                self.require(not self.cases(client) and not self.metrics(client), 'New run inherited cases or attempts.')
                self.ctx.update({key:client,key+'_run':rid})
            self.require(ids[0] != ids[1], 'Two new runs reused an ID.')
            rows = api.collection(base.request('GET','/api/runs'),'runs')
            self.require(set(ids).issubset({x['id'] for x in rows}), 'Owned new runs absent from list.')
            self.require(all(set(x) == {'id','created_at'} for x in rows), 'Run list leaked internal fields.')
            return {'runs_created':2,'new_namespaces_empty':True}
        self.test('RUN-003', 'Two owned runs start empty and have distinct IDs', new_runs)

        def invalid_run():
            c = self.need('a'); before = self.cookie(c); view = self.view(c)
            r = c.request('POST','/api/session',{'persona':'ana','role':'agent','locale':'es','runId':str(uuid.uuid4())})
            self.require(r['status'] == 404, 'Invented run was accepted or returned wrong status.')
            self.require(self.cookie(c) == before and self.view(c) == view, 'Rejected run request changed active session.')
            return {'status':r['status'],'session_unchanged':True}
        self.test('RUN-004', 'Invented run cannot be opened and leaves active session intact', invalid_run)

        def draft_locale():
            c = self.need('a'); before = self.cookie(c); view = self.view(c)
            txs = api.collection(c.request('GET','/api/transactions'),'transactions')
            transaction = next(x['id'] for x in txs if x['status'] == 'Approved')
            statement = 'No reconozco esta compra; solicito revisión del movimiento.'
            payload = self.draft(c,transaction,statement)
            r = c.request('PATCH','/api/session',{'locale':'pt'})
            self.require(r['status'] == 200, 'Locale PATCH was rejected.')
            after = self.view(c)
            self.require(after['locale'] == 'pt', 'Locale was not persisted.')
            self.require(self.cookie(c) == before, 'Locale PATCH rotated session cookie and could invalidate draft.')
            for field in ['runId','customer','role','expiresAt']:
                self.require(after[field] == view[field], 'Locale PATCH changed protected session field: '+field)
            self.require(not self.cases(c), 'Locale PATCH or draft preparation created a case.')
            self.ctx.update(a_payload=payload,transaction=transaction,statement=statement)
            return {'cookie_preserved':True,'customer_role_run_expiry_preserved':True,'draft_not_committed':True}
        self.test('RUN-005', 'ES to PT preserves cookie, ownership, expiry and pending draft', draft_locale)

        def invalid_locale():
            c = self.need('a'); before = self.cookie(c); view = self.view(c)
            bodies = [{'locale':'fr'},{'locale':'es','role':'agent'},{'locale':'es','runId':self.need('b_run')},{'locale':'es','customer_id':'invented'}]
            for body in bodies:
                r = c.request('PATCH','/api/session',body)
                self.require(r['status'] == 422, 'Locale schema accepted unsupported locale or injected protected field.')
            self.require(self.cookie(c) == before and self.view(c) == view, 'Rejected locale mutation changed session.')
            return {'rejected_payloads':len(bodies),'session_unchanged':True}
        self.test('RUN-006', 'Locale endpoint rejects role, run and owner injection', invalid_locale)

        def origin():
            c=self.need('a'); before=self.view(c)
            statuses=[]
            for method,path,body in [('PATCH','/api/session',{'locale':'es'}),('POST','/api/runs',{'persona':'ana','locale':'es'}),('POST','/api/session',{'persona':'ana','role':'agent','locale':'es','runId':self.need('b_run')})]:
                r=c.request(method,path,body,origin='https://attacker.invalid');statuses.append(r['status'])
                self.require(r['status']==403, 'Foreign origin was allowed to mutate run/session.')
            self.require(self.view(c)==before,'Foreign origin changed session.')
            return {'statuses':statuses}
        self.test('RUN-007','Run/session mutations reject cross-origin requests',origin)

        def foreign_draft():
            c=self.need('b');r=c.request('POST','/api/cases',self.need('a_payload'))
            self.require(r['status']==403,'Draft consent crossed the run boundary.')
            self.require(not self.cases(c),'Rejected foreign draft created case in second run.')
            return {'status':r['status'],'no_case_created':True}
        self.test('RUN-008','A draft from one run cannot be committed in another',foreign_draft)

        def cookie_without_auth():
            c=self.need('a').clone()
            for cookie in list(c.jar):
                if cookie.name != self.session_cookie: c.jar.clear(cookie.domain,cookie.path,cookie.name)
            r=c.request('PATCH','/api/session',{'locale':'es'})
            self.require(r['status']==401,'App cookie bypassed platform sign-in.')
            return {'status':r['status'],'fabricated_identity':False}
        self.test('RUN-009','Application session cookie alone cannot replace platform identity',cookie_without_auth)

        def timeout_commit():
            c=self.need('a');p=self.need('a_payload')
            arm=c.request('POST','/api/demo/fault',{'kind':'timeout_after_commit'})
            self.require(arm['status']==200,'Could not arm local synthetic timeout.')
            r=c.request('POST','/api/cases',p)
            self.require(r['status']==503 and (r['json'] or {}).get('error')=='SIMULATED_TIMEOUT','Expected timeout after commit was not observed.')
            rows=self.cases(c);self.require(len(rows)==1,'Timeout must leave exactly one persisted case.')
            record=rows[0]
            self.require(api.statement_of(record)==self.need('statement'),'Locale change altered saved statement.')
            self.require(api.case_tx(record)==self.need('transaction'),'Locale change altered selected transaction.')
            self.ctx['a_case']=record['id']
            self.require(self.view(c)['locale']=='pt','Submission lost chosen language.')
            return {'timeout_http':503,'persisted_cases':1,'original_statement_preserved':True}
        self.test('RUN-010','Pre-switch draft commits after locale change and survives timeout',timeout_commit)

        def retries():
            c=self.need('a');p=self.need('a_payload');cid=self.need('a_case')
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                responses=list(pool.map(lambda clone:clone.request('POST','/api/cases',p),[c.clone(),c.clone()]))
            self.require(all(r['status']==200 and api.case_id(r)==cid for r in responses),'Retry did not return the original case.')
            self.require(len(self.cases(c))==1,'Concurrent retries duplicated a case.')
            return {'retries':2,'same_case':True,'case_count':1}
        self.test('RUN-011','Concurrent original-key retries recover one committed case',retries)

        def isolation():
            a=self.need('a');b=self.need('b');cid=self.need('a_case')
            self.require(b.request('GET','/api/cases/'+cid)['status']==404,'Run B can read case A.')
            self.require(not self.cases(b) and not self.metrics(b),'Run B sees case A or run A attempts.')
            agent=b.clone();r=agent.request('POST','/api/session',{'persona':'ana','role':'agent','locale':'pt','runId':self.need('b_run')})
            self.require(r['status']==201,'Run B reviewer session failed.')
            self.require(agent.request('GET','/api/cases/'+cid)['status']==404,'Run B agent sees case A.')
            r=agent.request('PATCH','/api/cases/'+cid,{'status':'in_review','note':'Revisión del expediente en entorno sintético.','version':1})
            self.require(r['status']==404,'Run B agent changed case A.')
            detail=api.entity(a.request('GET','/api/cases/'+cid),'case')
            self.require(detail['version']==1 and detail['status']=='received','Foreign update mutated original case.')
            return {'customer_read':404,'agent_read':404,'agent_update':404,'original_version':1}
        self.test('RUN-012','Run isolation covers customer and reviewer read/update',isolation)

        def second_case():
            b=self.need('b');p=self.draft(b,self.need('transaction'),'Não reconheço esta compra; solicito análise da transação.')
            p['idempotencyKey']=self.need('a_payload')['idempotencyKey']
            r=b.request('POST','/api/cases',p)
            self.require(r['status']==201,'Same synthetic transaction/key cannot be independently used in another run.')
            cid=api.case_id(r);self.ctx['b_case']=cid
            self.require(cid!=self.need('a_case') and len(self.cases(b))==1,'Second run case is not independent.')
            self.require(self.need('a').request('GET','/api/cases/'+cid)['status']==404,'Run A can read case B.')
            return {'cases_created_total':2,'same_transaction_and_key_isolated':True,'reciprocal_read':404}
        self.test('RUN-013','Idempotency and transaction uniqueness are scoped to each run',second_case)

        def metrics():
            a=self.need('a');b=self.need('b')
            for text in ['No reconozco una compra.', 'Necesito revisar este cargo.']:
                self.require(a.request('POST','/api/message',{'text':text})['status']==200,'Run A message failed.')
            am,bm=self.metrics(a),self.metrics(b)
            self.require(len(am)==3 and len(bm)==1,'Run metrics mixed or omitted successful operations.')
            self.require(sum(x['operation']=='message' for x in am)==2,'Run A message attempts missing.')
            self.require(not any(x['operation']=='message' for x in bm),'Run B inherited run A messages.')
            return {'run_a_attempts':3,'run_b_attempts':1,'messages_do_not_cross_runs':True}
        self.test('RUN-014','Metrics stay within active run',metrics)

        def recover():
            c=self.need('b').clone()
            r=c.request('POST','/api/session',{'persona':'ana','role':'agent','locale':'es','runId':self.need('a_run')})
            self.require(r['status']==201 and self.view(c)['runId']==self.need('a_run'),'Previous run could not be reopened.')
            self.require({x['id'] for x in self.cases(c)}=={self.need('a_case')},'Recovered run read wrong case set.')
            r=c.request('PATCH','/api/cases/'+self.need('a_case'),{'status':'in_review','note':'Expediente recuperado y revisado en su propio entorno.','version':1})
            self.require(r['status']==200,'Recovered reviewer cannot update own-run case.')
            record=api.entity(r,'case');self.require(record['version']==2,'Recovered update did not increment version.')
            r=c.request('POST','/api/session',{'persona':'ana','role':'customer','locale':'pt','runId':self.need('b_run')})
            self.require(r['status']==201 and {x['id'] for x in self.cases(c)}=={self.need('b_case')},'Second run cannot be recovered.')
            return {'both_runs_recoverable':True,'own_run_review_version':2}
        self.test('RUN-015','Owned earlier runs can be recovered and reviewed',recover)

        def return_default():
            c=self.need('a').clone();r=c.request('POST','/api/session',{'persona':'ana','role':'customer','locale':'es','runId':'default'})
            self.require(r['status']==201 and self.view(c)['runId']=='default','Explicit return to default failed.')
            self.require({x['id'] for x in self.cases(c)}==self.need('default_ids'),'New runs mutated legacy/default case set.')
            self.require(self.metrics(c)==self.need('default_metrics'),'New runs leaked attempts into default workspace.')
            return {'legacy_cases_preserved':True,'legacy_metrics_preserved':True,'deletions':0}
        self.test('RUN-016','Default run remains recoverable without deleting earlier records',return_default)

        counts={s:sum(x['status']==s for x in self.results) for s in ['pass','fail','blocked','error']}
        return {'schema_version':1,'suite':'reclama-demo-runs-and-locale','target':self.args.base_url,'created_at_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'duration_seconds':round(time.time()-self.started,3),'gate_passed':len(self.results)==counts['pass'],'counts':counts,'limits':['Loopback-only documented local authentication; no production identity is fabricated.','Two namespaces under ONE authenticated local identity; cross-owner SIWC isolation is not dynamically established.','Creates at most two runs and two synthetic cases, never deletes or resets storage.','Development-visible regressions, not held-out ML quality or full browser user-experience evaluation.'],'results':self.results}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--base-url',default='http://127.0.0.1:5173')
    p.add_argument('--timeout',type=float,default=20)
    p.add_argument('--client-module')
    p.add_argument('--output',default=str(Path(__file__).with_name('http-runs-results.json')))
    args=p.parse_args();url=urllib.parse.urlsplit(args.base_url)
    if url.scheme not in ('http','https') or url.hostname not in ('localhost','127.0.0.1','::1') or url.username or url.password or url.path not in ('','/') or url.query or url.fragment:
        p.error('Only a loopback origin is permitted; no production or remote authentication.')
    args.base_url=args.base_url.rstrip('/')
    spec=importlib.util.spec_from_file_location('reclama_http_client',find_client(args.client_module));api=importlib.util.module_from_spec(spec);spec.loader.exec_module(api)
    report=Gate(args,api).run();out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'gate_passed':report['gate_passed'],'counts':report['counts'],'report':str(out)}))
    return 0 if report['gate_passed'] else 1

if __name__=='__main__':
    sys.exit(main())
