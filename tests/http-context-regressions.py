#!/usr/bin/env python3
"""Loopback-only tests for stale UI session context. Creates one run and one
uncommitted draft, zero cases. Uses documented local sign-in, never fabricated
identity, direct DB writes, persisted cookies, or external authentication.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
from pathlib import Path
import re
import time
import urllib.parse
import uuid


def find_client(explicit=None):
    if explicit:
        return Path(explicit).resolve()
    for parent in Path(__file__).resolve().parents:
        for rel in ('tests/http-integration.py', 'app/tests/http-integration.py'):
            candidate = parent / rel
            if candidate.is_file():
                return candidate
    raise FileNotFoundError('Use --client-module to locate tests/http-integration.py')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:5173')
    parser.add_argument('--client-module')
    parser.add_argument('--output', required=True)
    parser.add_argument('--timeout', type=float, default=20)
    args = parser.parse_args()
    url = urllib.parse.urlsplit(args.base_url)
    if url.scheme != 'http' or url.hostname not in ('127.0.0.1', 'localhost', '::1') or url.username or url.password or url.path not in ('', '/') or url.query or url.fragment:
        parser.error('Only an exact HTTP loopback origin is permitted.')
    spec = importlib.util.spec_from_file_location('reclama_http_client', find_client(args.client_module))
    api = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(api)
    results, state = [], {}
    started = time.time()

    def need(key):
        if key not in state:
            raise api.Blocked('Missing successful prerequisite: ' + key)
        return state[key]

    def test(key, description, function):
        begin = time.monotonic()
        try:
            evidence = function() or {}
            row = dict(id=key, description=description, status='pass', evidence=evidence)
        except api.Blocked as exc:
            row = dict(id=key, description=description, status='blocked', reason=str(exc))
        except api.CheckFailure as exc:
            row = dict(id=key, description=description, status='fail', reason=str(exc))
        except Exception as exc:
            row = dict(id=key, description=description, status='error', reason=type(exc).__name__)
        row['elapsed_ms'] = round((time.monotonic() - begin) * 1000, 2)
        results.append(row)
        print(f'{row["status"].upper():7s} {key} {description}', flush=True)

    def view(client, headers=None):
        response = client.request('GET', '/api/session', extra_headers=headers)
        api.require(response['status'] == 200, f'Session recovery HTTP {response["status"]}.')
        return api.entity(response, 'session')

    def rejected(response):
        api.require(response['status'] == 409, f'Expected stale-context 409, got {response["status"]}.')
        api.require(response['json'].get('error') == 'SESSION_CONTEXT_CHANGED', 'Expected typed stale-context error.')

    def anonymous():
        client = api.Client(args.base_url, args.timeout)
        response = client.request('GET', '/api/transactions', extra_headers={'X-Reclama-Context': '0' * 64})
        api.require(response['status'] == 401, 'Context header incorrectly replaced platform identity.')
        return {'status': 401}
    test('CTX-001', 'Context header never authorizes anonymous access', anonymous)

    def setup():
        client = api.Client(args.base_url, args.timeout)
        client.navigate_local_signin()
        response = client.request('POST', '/api/session', {'persona': 'ana', 'role': 'customer', 'locale': 'es', 'runId': 'default'})
        api.require(response['status'] == 201, 'Default session creation failed.')
        original = view(client)
        api.require(bool(re.fullmatch(r'[0-9a-f]{64}', original.get('contextId', ''))), 'Session must expose a non-secret hash contextId.')
        runs = api.collection(client.request('GET', '/api/runs'), 'runs')
        if len([run for run in runs if run['id'] != 'default']) >= 50:
            raise api.Blocked('One free run slot required; this suite will not delete existing runs.')
        state.update(client=client, context_a=original['contextId'])
        return {'context_present': True, 'context_logged': False}
    test('CTX-002', 'Documented sign-in provides context for current session', setup)

    def switch_run():
        client = need('client')
        response = client.request('POST', '/api/runs', {'persona': 'ana', 'locale': 'es'})
        api.require(response['status'] == 201, f'Run creation HTTP {response["status"]}.')
        current = view(client)
        api.require(bool(re.fullmatch(r'[0-9a-f]{64}', current.get('contextId', ''))), 'New run missing context.')
        api.require(current['contextId'] != need('context_a'), 'New session reused previous context.')
        api.require(not api.collection(client.request('GET', '/api/cases'), 'cases'), 'New run inherited cases.')
        transactions = api.collection(client.request('GET', '/api/transactions'), 'transactions')
        state.update(context_b=current['contextId'], current=current, tx=transactions[0]['id'])
        return {'runs_created': 1, 'same_persona': True, 'context_changed': True}
    test('CTX-003', 'New run changes cookie context even for the same persona', switch_run)

    def stale_reads():
        client = need('client'); need('context_b')
        for path in ('transactions', 'cases', 'metrics'):
            rejected(client.request('GET', '/api/' + path, extra_headers={'X-Reclama-Context': need('context_a')}))
        return {'rejected_endpoints': 3}
    test('CTX-004', 'Old tab context cannot read current run data', stale_reads)

    def stale_writes():
        client = need('client'); original = need('current')
        headers = {'X-Reclama-Context': need('context_a')}
        requests = [
            ('PATCH', 'session', {'locale': 'pt'}),
            ('POST', 'message', {'text': 'No reconozco esta compra de Luna Digital.'}),
            ('POST', 'drafts', {'transactionId': need('tx'), 'reason': 'unrecognized', 'statement': 'No reconozco esta compra, solicito revisión.'}),
            ('PATCH', 'cases/RC-00000000', {'status': 'in_review', 'note': 'Solicito revisión humana del movimiento.', 'version': 1}),
            ('POST', 'demo/fault', {'kind': 'expire'}),
        ]
        for method, path, body in requests:
            rejected(client.request(method, '/api/' + path, body, extra_headers=headers))
        api.require(view(client) == original, 'Rejected stale mutation changed current session.')
        api.require(not api.collection(client.request('GET', '/api/metrics'), 'attempts'), 'Rejected message was recorded as successful operation.')
        return {'rejected_endpoints': len(requests), 'session_unchanged': True}
    test('CTX-005', 'Stale context rejects writes before role, schema and mutation', stale_writes)

    def recovery():
        current = view(need('client'), {'X-Reclama-Context': need('context_a')})
        api.require(current['contextId'] == need('context_b'), 'Recovery did not return current context.')
        return {'status': 200, 'stale_context_recovered': True}
    test('CTX-006', 'GET session recovers current context despite a stale header', recovery)

    def valid_locale():
        client = need('client'); original = need('current')
        headers = {'X-Reclama-Context': need('context_b')}
        response = client.request('PATCH', '/api/session', {'locale': 'pt'}, extra_headers=headers)
        api.require(response['status'] == 200, 'Valid context could not change locale.')
        current = view(client)
        for field in ('contextId', 'runId', 'customer', 'role', 'expiresAt'):
            api.require(current[field] == original[field], 'Locale changed protected session field: ' + field)
        api.require(current['locale'] == 'pt', 'Locale did not persist.')
        api.require(client.request('GET', '/api/transactions', extra_headers=headers)['status'] == 200, 'Valid context rejected a permitted read.')
        return {'status': 200, 'context_and_scope_preserved': True}
    test('CTX-007', 'Matching context works and survives locale changes', valid_locale)

    def stale_consent():
        client = need('client')
        response = client.request('POST', '/api/drafts', {'transactionId': need('tx'), 'reason': 'unrecognized', 'statement': 'Não reconheço esta compra; solicito análise.'}, extra_headers={'X-Reclama-Context': need('context_b')})
        api.require(response['status'] == 201, 'Matching context failed to prepare a draft.')
        draft = api.entity(response, 'draft')
        payload = {'draftId': draft['draftId'], 'confirmationToken': draft['confirmationToken'], 'idempotencyKey': str(uuid.uuid4()), 'confirmed': True}
        rejected(client.request('POST', '/api/cases', payload, extra_headers={'X-Reclama-Context': need('context_a')}))
        api.require(not api.collection(client.request('GET', '/api/cases'), 'cases'), 'Stale tab committed a case.')
        return {'uncommitted_drafts_created': 1, 'cases_created': 0}
    test('CTX-008', 'Stale context cannot submit otherwise valid draft consent', stale_consent)

    def compatibility():
        response = need('client').request('GET', '/api/transactions')
        api.require(response['status'] == 200, 'Optional guard broke existing authenticated clients.')
        return {'status': 200, 'guard_is_not_authentication': True}
    test('CTX-009', 'Authenticated clients without context retain existing semantics', compatibility)

    counts = {status: sum(row['status'] == status for row in results) for status in ('pass', 'fail', 'error', 'blocked')}
    report = {'suite': 'reclama-session-context-regressions', 'executed_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(started)), 'scope': 'one documented local identity, stale UI context, not cross-account production security', 'cases_created': 0, 'records_deleted': 0, 'cookies_logged': False, 'summary': counts, 'results': results}
    output = Path(args.output); output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(counts))
    return 0 if counts['pass'] == len(results) else 1


if __name__ == '__main__':
    raise SystemExit(main())
