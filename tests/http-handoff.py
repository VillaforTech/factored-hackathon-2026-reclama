#!/usr/bin/env python3
"""Verify two real local API handoffs using only invented demo transactions."""
import argparse
import hashlib
import importlib.util
import json
import time
import uuid
from pathlib import Path
from urllib.parse import quote, urlsplit

spec = importlib.util.spec_from_file_location('integration', Path(__file__).with_name('http-integration.py'))
http = importlib.util.module_from_spec(spec)
spec.loader.exec_module(http)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:5173')
    parser.add_argument('--output', type=Path, default=Path('docs/evidence/handoff-rerun.json'))
    args = parser.parse_args()
    url = urlsplit(args.base_url)
    if url.scheme != 'http' or url.hostname not in ('127.0.0.1', 'localhost', '::1') or url.path not in ('', '/') or url.query or url.fragment or url.username or url.password:
        parser.error('Local loopback HTTP fixture only.')
    root = Path(__file__).resolve().parent.parent
    fixture = json.loads((root / 'lib/data/demo.json').read_text())
    clients = {}
    for persona, locale in [('ana', 'es'), ('lucas', 'pt')]:
        client = http.Client(args.base_url, 20)
        client.navigate_local_signin()
        session = client.request('POST', '/api/session', {'persona': persona, 'role': 'customer', 'locale': locale})
        http.require(session['status'] == 201, 'Local session bootstrap failed.')
        clients[persona] = client

    marker = 'handoff-' + uuid.uuid4().hex[:12]
    results = []
    for persona, locale, status, statement in [
        ('ana', 'es', 'Pending', 'Quiero que una persona revise esta compra pendiente.'),
        ('lucas', 'pt', 'Reversed', 'Quero que uma pessoa analise esta compra revertida.'),
    ]:
        client = clients[persona]
        other = clients['lucas' if persona == 'ana' else 'ana']
        try:
            transactions = http.collection(client.request('GET', '/api/transactions'), 'transactions')
            cases_before = http.collection(client.request('GET', '/api/cases'), 'cases')
            used = {http.case_tx(case) for case in cases_before}
            candidates = [tx for tx in transactions if tx.get('status') == status and http.identifier(tx, 'transaction') not in used]
            http.require(bool(candidates), 'No unused fixture transaction with required status.')
            tx = candidates[0]
            txid = http.identifier(tx, 'transaction')
            source_tx = next(row for row in fixture['transactions'] if row['id'] == txid)
            allegation = statement + ' ' + marker
            draft_response = client.request('POST', '/api/drafts', {'transactionId': txid, 'statement': allegation, 'reason': 'unrecognized'})
            http.require(draft_response['status'] == 201, 'Handoff draft was not created.')
            draft = http.entity(draft_response, 'draft')
            http.require(draft.get('kind') == 'support_handoff', 'Unsupported status was classified as ordinary intake.')
            http.require(draft.get('transaction') == source_tx and draft.get('statement') == allegation, 'Draft did not preserve source facts and allegation.')
            payload = {'draftId': http.identifier(draft, 'draft'), 'confirmationToken': draft['confirmationToken'], 'idempotencyKey': str(uuid.uuid4()), 'confirmed': True}
            submit = client.request('POST', '/api/cases', payload)
            http.require(submit['status'] == 201, 'Confirmed handoff was not persisted.')
            case_id = http.case_id(submit)
            readback = client.request('GET', '/api/cases/' + quote(case_id, safe=''))
            http.require(readback['status'] == 200, 'Handoff readback failed.')
            case = http.entity(readback, 'case')
            audit = http.collection(readback, 'audit')
            http.require(case.get('kind') == 'support_handoff' and case.get('status') == 'received', 'Readback reported the wrong handoff state.')
            http.require(http.case_tx(case) == txid and http.statement_of(case) == allegation, 'Handoff changed the selected transaction or statement.')
            http.require(case.get('facts', {}).get('status') == status, 'Handoff source status changed.')
            http.require(any(event.get('event') == 'case_received' and event.get('detail') == 'support_handoff' for event in audit), 'Handoff audit event missing.')
            http.require(len(http.collection(client.request('GET', '/api/cases'), 'cases')) == len(cases_before) + 1, 'Handoff created an unexpected number of cases.')
            foreign = other.request('GET', '/api/cases/' + quote(case_id, safe=''))
            http.require(foreign['status'] == 404, 'Other local persona could read the handoff.')
            results.append({'persona': persona, 'language': locale, 'source_status': status, 'pass': True, 'case_identifier_sha256_12': hashlib.sha256(case_id.encode()).hexdigest()[:12], 'audit_received': True, 'other_persona_http': foreign['status']})
        except http.CheckFailure as error:
            results.append({'persona': persona, 'language': locale, 'source_status': status, 'pass': False, 'reason': str(error)})
        except Exception as error:
            results.append({'persona': persona, 'language': locale, 'source_status': status, 'pass': False, 'reason': type(error).__name__})

    passed = sum(result['pass'] for result in results)
    report = {'schema_version': '1.0', 'created_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'scope': 'Two authored ES/PT local handoff paths; approved intake and ML quality are separate tests.', 'base_url': args.base_url, 'gate_passed': passed == 2, 'counts': {'scenarios': 2, 'passed': passed, 'failed': 2 - passed, 'verified_support_handoffs': passed, 'financial_resolutions': 0}, 'limits': ['One documented local platform identity with two demo personas; not two real platform accounts.', 'Readback and audit prove local persistence for these cases, not human review quality or production durability.', 'Statements and transactions are invented fixtures; scenarios are selected, not held out or representative.'], 'results': results}
    output = args.output if args.output.is_absolute() else root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'report': str(output), 'gate_passed': report['gate_passed'], 'counts': report['counts'], 'results': results}, ensure_ascii=False, indent=2))
    return 0 if report['gate_passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
