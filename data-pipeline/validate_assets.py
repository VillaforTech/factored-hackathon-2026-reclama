#!/usr/bin/env python3
"""Validate demo contracts, adversarial fixtures, and evidence denominators."""
from collections import Counter
from copy import deepcopy
from pathlib import Path
import json
import sys
from contracts import validate_demo
from pipeline import exact_minor

HERE = Path(__file__).resolve().parent


def main():
    demo = json.loads((HERE / "demo.json").read_text())
    fixtures = json.loads((HERE / "integrity-fixtures.json").read_text())
    base_issues = validate_demo(demo)
    if base_issues:
        raise AssertionError("BASE_CONTRACT_FAILED")
    assert len(demo["customers"]) == 2
    assert len(demo["cards"]) == 3
    assert len(demo["transactions"]) == 12
    assert {row["currency"] for row in demo["transactions"]} == {"USD", "COP", "ARS"}
    assert {row["status"] for row in demo["transactions"]} == {"Approved", "Pending", "Reversed", "Declined"}
    assert sum(row["merchant"] is None for row in demo["transactions"]) == 1
    ambiguous = [row for row in demo["transactions"] if row["merchant"] == "Luna Digital" and row["amountMinor"] == 8490]
    assert len(ambiguous) == 2 and ambiguous[0]["id"] != ambiguous[1]["id"]
    assert ambiguous[0]["customerId"] == ambiguous[1]["customerId"]
    outcomes = []
    for fixture in fixtures["cases"]:
        mutated = deepcopy(demo)
        rows = mutated[fixture["collection"]]
        if fixture["operation"] == "appendCopy":
            rows.append(deepcopy(rows[fixture["index"]]))
        elif fixture["operation"] == "set":
            rows[fixture["index"]][fixture["field"]] = fixture["value"]
        else:
            raise AssertionError("UNKNOWN_TEST_OPERATION")
        issues = validate_demo(mutated)
        actual_codes = {issue["code"] for issue in issues}
        expected = fixture["expectedCode"]
        if expected is None:
            assert not issues, fixture["id"]
        else:
            assert expected in actual_codes, fixture["id"]
        if fixture["id"] == "duplicate_id":
            # Reject both conflicting identities. Keeping the first hides ambiguity.
            assert sum(issue["code"] == "DUPLICATE_ID" for issue in issues) == 2
        outcomes.append({"id": fixture["id"], "expectedCode": expected, "passed": True})
    # Financial arithmetic should never silently round or treat booleans as cents.
    amounts = {"84.90": 8490, "75800.00": 7580000, "0": 0, "1.001": None, "NaN": None, "Infinity": None, "-0.01": None, "1e2": 10000}
    for amount, expected in amounts.items():
        assert exact_minor(amount) == expected
    report = json.loads((HERE / "report.json").read_text())
    metrics = report["metrics"]
    tx = report["contracts"]["transactions"]
    assert tx["acceptedStructural"] + tx["quarantinedStructural"] == metrics["transactions"]
    assert sum(metrics["cardPurchaseStatuses"].values()) == metrics["cardPurchases"]
    assert sum(metrics["approvedCardPurchaseCurrencies"].values()) == metrics["approvedCardPurchases"]
    assert metrics["approvedCardPurchasesMissingMerchant"] <= metrics["approvedCardPurchases"]
    assert metrics["complaintProductOwnerMismatch"] + metrics["complaintProductOwnerMatches"] <= metrics["complaintsWithProduct"]
    assert report["scope"]["fileCount"] == len(report["sourceFiles"]) == 50
    assert report["scope"]["temporalCutsPerFactTable"] == 12
    assert report["temporal"]["verifiedLiveRecords"] == 0
    assert report["containsOriginalRecords"] is False
    # Compare re-computation with the independent earlier profile; no truth claims
    # about production performance follow from these source-data consistency checks.
    research = HERE.parents[1]
    prior_path = research / "analysis/dispute-intake-profile.json"
    if prior_path.exists():
        prior = json.loads(prior_path.read_text())
        assert metrics["approvedCardPurchases"] == prior["approved_card_purchases"]
        assert metrics["approvedCardPurchasesMissingMerchant"] == prior["approved_missing_merchant"]
        assert metrics["cardPurchaseStatuses"] == prior["statuses"]
    result = {
        "status": "passed", "provenance": "team-generated-contract-tests",
        "demo": {"customers": 2, "cards": 3, "transactions": 12, "violations": len(base_issues)},
        "integrityCases": outcomes, "arithmeticCases": len(amounts),
        "evidenceAggregateChecks": "passed", "independentProfileMatch": prior_path.exists(),
        "notModelEvaluation": True,
    }
    (HERE / "validation-report.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "passed", "integrityCases": len(outcomes), "arithmeticCases": len(amounts), "evidenceAggregateChecks": "passed"}))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"status": "failed", "safeCode": type(exc).__name__}), file=sys.stderr)
        sys.exit(1)
