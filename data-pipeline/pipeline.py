#!/usr/bin/env python3
"""Read local authorized research samples; publish aggregates, never original records.

Uses only Python's standard library. No network calls, provider keys, training labels,
or copied fixture records. Input hashes bind every result to the exact local sample.
"""
from collections import Counter
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
import argparse
import csv
import hashlib
import json
import re
import sys

HERE = Path(__file__).resolve().parent
TABLE_KEYS = {
    "customers": "customer_id", "products": "product_id",
    "transactions": "transaction_id", "complaints": "complaint_id",
    "call_center_interactions": "interaction_id", "call_transcripts": "transcript_id",
}
REQUIRED = {
    "customers": {"customer_id", "country", "customer_status"},
    "products": {"product_id", "customer_id", "product_type", "currency", "product_status", "last_updated"},
    "transactions": {"transaction_id", "customer_id", "product_id", "transaction_type", "transaction_status", "amount", "currency", "transaction_date", "process_date", "merchant_name"},
    "complaints": {"complaint_id", "customer_id", "affected_product_id", "origin_interaction_id", "description"},
    "call_center_interactions": {"interaction_id", "customer_id"},
    "call_transcripts": {"transcript_id", "interaction_id", "customer_id", "detected_language", "customer_text"},
}
CARDS = {"Tarjeta Crédito", "Tarjeta Débito"}
STATUSES = {"Approved", "Declined", "Pending", "Reversed"}
CURRENCIES = {"USD", "COP", "ARS", "MXN"}


def parse_date(value):
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, TypeError, AttributeError):
        return None


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def exact_minor(value):
    """Fail closed on non-finite or sub-cent values. Never round a financial amount."""
    try:
        amount = Decimal(value)
        minor = amount * 100
        if not amount.is_finite() or minor != minor.to_integral_value() or minor < 0:
            return None
        return int(minor)
    except (InvalidOperation, TypeError, ValueError, OverflowError):
        return None


class InputContractError(Exception):
    """Value-free exception: caller prints only a safe error code."""


def inspect_official(root):
    root = root.resolve()
    manifest = json.loads((root / "analysis/sample-manifest.json").read_text())
    sources = []
    for item in manifest:
        table = item.get("table")
        if table not in REQUIRED:
            raise InputContractError("UNSUPPORTED_TABLE")
        path = (root / item["file"]).resolve()
        if not path.is_relative_to(root / "data") or not path.is_file():
            raise InputContractError("INVALID_LOCAL_SOURCE_PATH")
        with path.open(encoding="utf-8-sig", newline="") as stream:
            header = next(csv.reader(stream), [])
        if REQUIRED[table] - set(header) or len(header) != len(set(header)):
            raise InputContractError("SCHEMA_CONTRACT_FAILED")
        if path.stat().st_size != item["bytes"]:
            raise InputContractError("SOURCE_SIZE_CHANGED")
        sources.append({"table": table, "path": str(path.relative_to(root)), "sha256": sha256_file(path), "bytes": path.stat().st_size, "schemaColumns": len(header)})

    def rows(table):
        for source in sources:
            if source["table"] == table:
                with (root / source["path"]).open(encoding="utf-8-sig", newline="") as stream:
                    yield from csv.DictReader(stream)

    # First pass identifies every member of an ambiguous identity group. In a real
    # incremental adapter these are quarantined until a source version resolves them.
    identities = {table: Counter(row[TABLE_KEYS[table]] for row in rows(table)) for table in REQUIRED}
    count = {table: sum(ids.values()) for table, ids in identities.items()}
    duplicate_rows = {table: sum(n for key, n in ids.items() if n > 1 or not key) for table, ids in identities.items()}
    customers = {key for key, n in identities["customers"].items() if key and n == 1}
    products = {}
    product_reasons = Counter()
    product_quarantined = 0
    product_future = 0
    product_time_naive = 0
    # A declared calendar coverage boundary, not a claim about banking event timezone.
    declared_end = datetime(2026, 6, 18)
    for row in rows("products"):
        reasons = set()
        if not row["product_id"] or identities["products"][row["product_id"]] != 1:
            reasons.add("DUPLICATE_OR_MISSING_PRODUCT_ID")
        if row["customer_id"] not in customers:
            reasons.add("UNKNOWN_OR_AMBIGUOUS_CUSTOMER")
        if row["currency"] not in CURRENCIES:
            reasons.add("UNSUPPORTED_CURRENCY")
        if row["product_status"] not in {"Active", "Blocked", "Closed", "Suspended"}:
            reasons.add("UNKNOWN_PRODUCT_STATUS")
        updated = parse_date(row["last_updated"])
        if updated is None:
            product_reasons["INVALID_UPDATED_TIME"] += 1
        elif updated.tzinfo is None:
            product_time_naive += 1
            product_future += updated >= declared_end
        else:
            # Calendar comparison only: source chronology cannot be inferred from it.
            product_future += updated.date() >= declared_end.date()
        if reasons:
            product_quarantined += 1
            product_reasons.update(reasons)
        else:
            products[row["product_id"]] = {field: row[field] for field in REQUIRED["products"]}

    tx_reasons = Counter()
    tx_accepted = 0
    tx_quarantined = 0
    all_owner_pass = 0
    all_currency_pass = 0
    card_purchase_statuses = Counter()
    approved_currencies = Counter()
    approved_customers = set()
    approved_missing_merchant = 0
    event_naive = 0
    process_naive = 0
    invalid_event = 0
    invalid_process = 0
    process_before_event_day = 0
    event_min = None
    event_max = None
    tx_types = Counter()
    for row in rows("transactions"):
        reasons = set()
        if not row["transaction_id"] or identities["transactions"][row["transaction_id"]] != 1:
            reasons.add("DUPLICATE_OR_MISSING_TRANSACTION_ID")
        if row["customer_id"] not in customers:
            reasons.add("UNKNOWN_OR_AMBIGUOUS_CUSTOMER")
        product = products.get(row["product_id"])
        if not product:
            reasons.add("UNKNOWN_OR_QUARANTINED_PRODUCT")
        else:
            if product["customer_id"] != row["customer_id"]:
                reasons.add("OWNER_MISMATCH")
            else:
                all_owner_pass += 1
            if product["currency"] != row["currency"]:
                reasons.add("CURRENCY_MISMATCH")
            else:
                all_currency_pass += 1
        if row["transaction_status"] not in STATUSES:
            reasons.add("UNKNOWN_TRANSACTION_STATUS")
        if row["currency"] not in CURRENCIES:
            reasons.add("UNSUPPORTED_CURRENCY")
        minor = exact_minor(row["amount"])
        if minor is None or (row["transaction_type"] == "Purchase" and minor <= 0):
            reasons.add("INVALID_EXACT_MINOR_AMOUNT")
        if row["transaction_type"] not in {"Purchase", "Payment", "Transfer", "Deposit", "Withdrawal", "Adjustment"}:
            reasons.add("UNKNOWN_TRANSACTION_TYPE")
        event = parse_date(row["transaction_date"])
        process = parse_date(row["process_date"])
        if event is None:
            invalid_event += 1
            reasons.add("INVALID_EVENT_TIME")
        else:
            event_naive += event.tzinfo is None
            # Values are source-local calendar values only; no timezone conversion.
            calendar = event.isoformat()
            event_min = min(event_min, calendar) if event_min else calendar
            event_max = max(event_max, calendar) if event_max else calendar
        if process is None:
            invalid_process += 1
        else:
            process_naive += process.tzinfo is None
        if event and process:
            process_before_event_day += process.date() < event.date()
        tx_types[row["transaction_type"]] += 1
        if reasons:
            tx_quarantined += 1
            tx_reasons.update(reasons)
            continue
        tx_accepted += 1
        if row["transaction_type"] == "Purchase" and product["product_type"] in CARDS:
            card_purchase_statuses[row["transaction_status"]] += 1
            if row["transaction_status"] == "Approved":
                approved_customers.add(row["customer_id"])
                approved_currencies[row["currency"]] += 1
                approved_missing_merchant += not row["merchant_name"].strip()

    complaint_links = Counter()
    descriptions = set()
    for row in rows("complaints"):
        descriptions.add(row["description"])
        if row["origin_interaction_id"]:
            complaint_links["originInteractionPresent"] += 1
        if row["affected_product_id"]:
            complaint_links["productPresent"] += 1
            product = products.get(row["affected_product_id"])
            if product:
                complaint_links["productExists"] += 1
                if product["customer_id"] != row["customer_id"]:
                    complaint_links["ownerMismatch"] += 1
                else:
                    complaint_links["ownerMatches"] += 1
            else:
                complaint_links["unknownOrQuarantinedProduct"] += 1
    languages = Counter()
    customer_texts = set()
    saldo_rows = 0
    dispute_keyword_rows = 0
    terms = re.compile(r"desconoz|no reconoz|no autoriza|duplicad|fraud|reembols|devoluci|disputa|contracargo|cobro indeb", re.I)
    for row in rows("call_transcripts"):
        languages[row["detected_language"]] += 1
        customer_texts.add(row["customer_text"])
        saldo_rows += "saldo" in row["customer_text"].lower()
        dispute_keyword_rows += bool(terms.search(row["customer_text"]))

    # Only fixed, permitted language codes are emitted; unexpected codes are grouped.
    safe_languages = {key: languages[key] for key in ("es", "pt", "en") if languages[key]}
    unexpected_languages = sum(value for key, value in languages.items() if key not in {"es", "pt", "en"})
    if unexpected_languages:
        safe_languages["otherOrMissing"] = unexpected_languages
    dates = sorted({re.search(r"_(\d{8})\.csv$", source["path"]).group(1) for source in sources if re.search(r"_(\d{8})\.csv$", source["path"])})
    source_version = hashlib.sha256(json.dumps(sources, sort_keys=True).encode()).hexdigest()
    return {
        "schemaVersion": "1.0.0",
        "reportVersion": "reclama-profile-v1",
        "sourceVersion": "sha256:" + source_version,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "provenance": "computed-from-organizer-synthetic-data",
        "containsOriginalRecords": False,
        "officialSources": [
            {"label": "Dataset summary", "url": "https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4MV86KA5/latam_bank_dataset_summary__1_.pdf"},
            {"label": "Data dictionary", "url": "https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4LF2AVLJ/latam_bank_complete_data_dictionary__2_.pdf"},
        ],
        "scope": {
            "fileCount": len(sources), "temporalCutsPerFactTable": len(dates),
            "sampling": "bounded-temporal-coverage-not-random",
            "partitionDates": [f"{d[:4]}-{d[4:6]}-{d[6:]}" for d in dates],
            "dimensions": ["customers", "products"],
            "tables": {table: {"rows": count[table], "files": sum(source["table"] == table for source in sources)} for table in REQUIRED},
            "populationInferencePermitted": False,
        },
        "metrics": {
            "transactions": count["transactions"], "ownershipMatches": all_owner_pass,
            "currencyMatches": all_currency_pass, "structurallyValidTransactions": tx_accepted,
            "cardPurchases": sum(card_purchase_statuses.values()),
            "approvedCardPurchases": card_purchase_statuses["Approved"],
            "approvedCardPurchaseCustomers": len(approved_customers),
            "approvedCardPurchasesMissingMerchant": approved_missing_merchant,
            "cardPurchaseStatuses": dict(sorted(card_purchase_statuses.items())),
            "approvedCardPurchaseCurrencies": dict(sorted(approved_currencies.items())),
            "complaintRows": count["complaints"],
            "complaintsWithProduct": complaint_links["productPresent"],
            "complaintProductOwnerMismatch": complaint_links["ownerMismatch"],
            "complaintProductOwnerMatches": complaint_links["ownerMatches"],
            "complaintsWithOriginInteraction": complaint_links["originInteractionPresent"],
            "uniqueComplaintDescriptions": len(descriptions),
            "transcripts": count["call_transcripts"], "transcriptLanguages": safe_languages,
            "uniqueCustomerUtterances": len(customer_texts), "transcriptsContainingSaldo": saldo_rows,
            "transcriptsMatchingDisputeKeywords": dispute_keyword_rows,
        },
        "contracts": {
            "schemaFilesPassed": len(sources), "duplicateRowsByTable": duplicate_rows,
            "products": {"acceptedStructural": count["products"] - product_quarantined, "quarantinedStructural": product_quarantined, "reasonCounts": dict(product_reasons)},
            "transactions": {"acceptedStructural": tx_accepted, "quarantinedStructural": tx_quarantined, "reasonCounts": dict(tx_reasons)},
            "complaintProductJoin": {"acceptedLinks": complaint_links["ownerMatches"], "quarantinedLinks": complaint_links["ownerMismatch"] + complaint_links["unknownOrQuarantinedProduct"], "unavailableLinks": count["complaints"] - complaint_links["productPresent"], "policy": "Never expose another customer's product through a complaint foreign key."},
            "quarantineRetention": "Counts only in public artifacts; no original identifiers or financial records exported.",
        },
        "temporal": {
            "verifiedLiveRecords": 0,
            "transactionTimesWithoutTimezone": event_naive,
            "processTimesWithoutTimezone": process_naive,
            "invalidTransactionTimes": invalid_event,
            "invalidProcessTimes": invalid_process,
            "processDateBeforeTransactionCalendarDate": process_before_event_day,
            "productUpdatesWithoutTimezone": product_time_naive,
            "productUpdatesAfterDeclaredCalendarCoverage": product_future,
            "eventCalendarMin": event_min, "eventCalendarMax": event_max,
            "interpretation": "Source-local calendar values only. process_date is not a trusted available-at timestamp. Static product dimensions are not as-of ownership history. No source-live freshness claim is justified.",
        },
        "sourceFiles": sources,
        "limitations": [
            "Synthetic organizer data and bounded temporal coverage; no estimate of real banking demand or fraud prevalence.",
            "Structurally valid approved purchases support selecting a transaction, not proving fraud, posted settlement, reimbursement rights or policy eligibility.",
            "Ownership is internally consistent with the provided static dimension, not independently verified identity or historical ownership.",
            "The public demo uses separate, entirely team-generated records and explicit sandbox time; it does not expose these source records.",
            "Portuguese dialogues require separately authored or translated cases and human review. No Portuguese corpus was observed.",
            "No raw transcripts, outcome labels, personal fields or secrets appear in this report. Aggregated research metrics are not product evaluation scores.",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, default=HERE.parents[1])
    parser.add_argument("--output", type=Path, default=HERE / "report.json")
    args = parser.parse_args()
    report = inspect_official(args.source_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": "ok", "output": str(args.output), "sourceFiles": report["scope"]["fileCount"], "transactions": report["metrics"]["transactions"], "approvedCardPurchases": report["metrics"]["approvedCardPurchases"], "quarantinedComplaintLinks": report["contracts"]["complaintProductJoin"]["quarantinedLinks"]}))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Deliberately avoid printing exception values, paths supplied by untrusted
        # CSV rows, individual financial records, or provider connection details.
        code = str(exc) if isinstance(exc, InputContractError) else type(exc).__name__
        print(json.dumps({"status": "failed", "safeCode": code}), file=sys.stderr)
        sys.exit(1)
