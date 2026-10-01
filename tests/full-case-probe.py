#!/usr/bin/env python3
"""Measure three bounded, fictional local API paths without deleting state."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import time
import uuid
from pathlib import Path
from urllib.parse import quote, urlsplit


spec = importlib.util.spec_from_file_location("integration", Path(__file__).with_name("http-integration.py"))
http = importlib.util.module_from_spec(spec)
spec.loader.exec_module(http)


def quantile(values: list[float], fraction: float) -> float:
    ordered = sorted(values)
    return ordered[max(0, math.ceil(len(ordered) * fraction) - 1)]


def require(condition: bool, message: str) -> None:
    http.require(condition, message)


def execute(client: http.Client, scenario: str, repeat: int) -> dict:
    language = "es" if scenario == "normal_es" else "pt"
    calls = []

    def call(method: str, path: str, body=None):
        result = client.request(method, path, body)
        require(result["status"] != 0, "Local request failed.")
        calls.append({"method": method, "path": path.split("/")[2], "http": result["status"], "ms": result["elapsed_ms"]})
        return result

    message = {
        "normal_es": "No reconozco una compra de Luna Digital por USD 84,90. Quiero revisar el cargo exacto.",
        "ambiguous_pt": "Não reconheço uma das duas cobranças de Luna Digital de USD 84,90. Qual foi?",
        "handoff_pt": "Não reconheço uma compra revertida. Preciso de uma pessoa para analisar o caso.",
    }[scenario]
    cases_before = http.collection(client.request("GET", "/api/cases"), "cases")
    started = time.perf_counter()
    advisory = call("POST", "/api/message", {"text": message})
    require(advisory["status"] == 200 and advisory["json"].get("autonomousRouting") is False, "Advisory did not remain non-authoritative.")
    if scenario == "ambiguous_pt":
        answer = str(advisory["json"].get("message", "")).lower()
        require("selecione" in answer or "selecion" in answer, "Ambiguity did not ask for exact selection.")
        after = http.collection(call("GET", "/api/cases"), "cases")
        require(after == cases_before, "Ambiguous advisory wrote a case.")
        outcome = "clarification_without_case"
    else:
        transactions = http.collection(call("GET", "/api/transactions"), "transactions")
        wanted = "Approved" if scenario == "normal_es" else "Reversed"
        candidate = next((tx for tx in transactions if tx.get("status") == wanted), None)
        require(candidate is not None, "Required fictional transaction missing.")
        transaction_id = http.identifier(candidate, "transaction")
        statement = (
            "No reconozco esta compra y solicito revisión humana."
            if language == "es" else "Não reconheço esta compra revertida e solicito análise humana."
        )
        draft_response = call("POST", "/api/drafts", {"transactionId": transaction_id, "statement": statement, "reason": "unrecognized"})
        require(draft_response["status"] == 201, "Draft was not created.")
        draft = http.entity(draft_response, "draft")
        wanted_kind = "dispute_intake" if scenario == "normal_es" else "support_handoff"
        require(draft.get("kind") == wanted_kind, "Draft kind did not follow source status.")
        require(draft.get("statement") == statement, "Statement was modified in draft.")
        payload = {
            "draftId": http.identifier(draft, "draft"),
            "confirmationToken": draft["confirmationToken"],
            "idempotencyKey": str(uuid.uuid4()),
            "confirmed": True,
        }
        submitted = call("POST", "/api/cases", payload)
        require(submitted["status"] == 201, "Confirmed case was not saved.")
        case_id = http.case_id(submitted)
        reread = call("GET", "/api/cases/" + quote(case_id, safe=""))
        require(reread["status"] == 200, "Saved case could not be read back.")
        case = http.entity(reread, "case")
        audit = http.collection(reread, "audit")
        require(case.get("kind") == wanted_kind and case.get("status") == "received", "Readback case kind/state changed.")
        require(http.case_tx(case) == transaction_id and http.statement_of(case) == statement, "Readback lost exact source choice or statement.")
        require(any(event.get("event") == "case_received" and event.get("detail") == wanted_kind for event in audit), "Receipt audit event missing.")
        after = http.collection(call("GET", "/api/cases"), "cases")
        require(len(after) == len(cases_before) + 1, "Attempt did not create exactly one case.")
        outcome = wanted_kind + "_persisted"

    total_ms = round((time.perf_counter() - started) * 1000, 2)
    return {
        "scenario": scenario,
        "language": language,
        "repeat": repeat,
        "passed": True,
        "outcome": outcome,
        "api_request_count": len(calls),
        "measured_sequence_ms": total_ms,
        "api_request_sum_ms": round(sum(x["ms"] for x in calls), 2),
        "http_statuses": [x["http"] for x in calls],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:5173")
    parser.add_argument("--repeats", type=int, default=5)
    parser.add_argument("--output", type=Path, default=Path("docs/evidence/full-case-rerun-2026-09-30.json"))
    args = parser.parse_args()
    url = urlsplit(args.base_url)
    if url.scheme != "http" or url.hostname not in ("127.0.0.1", "localhost", "::1") or url.path not in ("", "/") or url.query or url.fragment or url.username or url.password:
        parser.error("A local loopback HTTP origin is required.")
    if not 1 <= args.repeats <= 10:
        parser.error("--repeats must be 1–10 to bound persistent demo runs.")
    root = Path(__file__).resolve().parent.parent
    model = root / "lib/data/model.json"
    model_hash_before = hashlib.sha256(model.read_bytes()).hexdigest()
    client = http.Client(args.base_url, 20)
    client.navigate_local_signin()
    session = client.request("POST", "/api/session", {"persona": "ana", "role": "customer", "locale": "es", "runId": "default"})
    require(session["status"] == 201, "Documented local session failed.")
    runs = http.collection(client.request("GET", "/api/runs"), "runs")
    scenarios = ("normal_es", "ambiguous_pt", "handoff_pt")
    require(len(runs) - 1 + len(scenarios) * args.repeats <= 50, "Insufficient run capacity; do not delete existing local state.")
    results = []
    for repeat in range(1, args.repeats + 1):
        for scenario in scenarios:
            actor = client.clone()
            language = "es" if scenario == "normal_es" else "pt"
            persona = "ana" if scenario == "normal_es" else "lucas" if scenario == "handoff_pt" else "ana"
            created = actor.request("POST", "/api/runs", {"persona": persona, "locale": language})
            require(created["status"] == 201, "Could not create an empty owned run.")
            try:
                results.append(execute(actor, scenario, repeat))
            except http.CheckFailure as error:
                results.append({"scenario": scenario, "language": language, "repeat": repeat, "passed": False, "reason": str(error)})
            except Exception as error:
                results.append({"scenario": scenario, "language": language, "repeat": repeat, "passed": False, "reason": type(error).__name__})
    summary = []
    for scenario in scenarios:
        subset = [item for item in results if item["scenario"] == scenario]
        successful = [item for item in subset if item["passed"]]
        durations = [item["measured_sequence_ms"] for item in successful]
        summary.append({
            "scenario": scenario,
            "attempts": len(subset),
            "passed": len(successful),
            "failed": len(subset) - len(successful),
            "api_request_count_total": sum(item.get("api_request_count", 0) for item in successful),
            "p50_sequence_ms_successes_only": quantile(durations, .5) if durations else None,
            "p95_sequence_ms_successes_only": quantile(durations, .95) if durations else None,
            "latency_sample_count": len(durations),
        })
    model_hash_after = hashlib.sha256(model.read_bytes()).hexdigest()
    report = {
        "schema_version": "1.0",
        "created_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "base_url": args.base_url,
        "scope": "Three authored API-level paths, each repeated in a new owner-scoped local run with invented data.",
        "model_sha256_before": model_hash_before,
        "model_sha256_after": model_hash_after,
        "gate_passed": all(item["passed"] for item in results) and model_hash_before == model_hash_after,
        "counts": {
            "attempts": len(results),
            "passed": sum(item["passed"] for item in results),
            "failed": sum(not item["passed"] for item in results),
            "verified_dispute_intakes": sum(item.get("outcome") == "dispute_intake_persisted" for item in results),
            "verified_support_handoffs": sum(item.get("outcome") == "support_handoff_persisted" for item in results),
            "clarifications_without_case": sum(item.get("outcome") == "clarification_without_case" for item in results),
            "measured_api_requests": sum(item.get("api_request_count", 0) for item in results),
        },
        "outcome_definition": {
            "normal_es": "Confirmed approved-card intake persisted and independently read with audit.",
            "ambiguous_pt": "Assistant requests exact selection and creates no case; clarification is the correct stopping outcome for this input.",
            "handoff_pt": "Confirmed reversed-card support handoff persisted and independently read with audit.",
        },
        "latency_definition": "Client wall clock from first /api/message request through readback/audit and final case-count check, or ambiguity no-case check. Excludes sign-in, run creation, browser rendering, user thinking/selection and human review. Sequential warm local development server; n=5 per path by default; nearest-rank p95 equals maximum at n=5.",
        "cost_basis": {
            "measured": ["API request counts", "local elapsed wall time"],
            "not_measured": ["billable Worker CPU", "D1 rows read/written", "storage", "bandwidth", "total hosting cost"],
            "external_model_api_calls_expected": 0,
            "external_model_api_cost_not_used_as_total_cost": True,
        },
        "financial_resolutions": 0,
        "representative_workload": False,
        "safe_automated_resolution_rate": None,
        "summaries": summary,
        "attempts": results,
    }
    output = args.output if args.output.is_absolute() else root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"report": str(output), "gate_passed": report["gate_passed"], "summaries": summary}, ensure_ascii=False, indent=2))
    return 0 if report["gate_passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
