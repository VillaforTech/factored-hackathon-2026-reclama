"""Dependency-free contracts for wholly authored public demo records.

No authorization decisions are made here: a valid record still requires a trusted
server session and a customer-scoped lookup. IDs supplied by the user are not auth.
"""
from collections import Counter
from datetime import datetime
import re

CURRENCIES = {"USD", "COP", "ARS"}
TRANSACTION_STATUSES = {"Approved", "Pending", "Reversed", "Declined"}
CARD_STATUSES = {"Active", "Blocked", "Closed", "Suspended"}
FIELDS = {
    "customers": {"id", "name", "language"},
    "cards": {"id", "customerId", "label", "last4", "currency", "status"},
    "transactions": {"id", "customerId", "cardId", "merchant", "amountMinor", "currency", "occurredAt", "status", "sourceRef", "sourceVersion"},
}
PREFIXES = {"customers": "cus", "cards": "crd", "transactions": "txn"}


def known_string(value, options):
    return isinstance(value, str) and value in options


def safe_lookup(mapping, key):
    return mapping.get(key) if isinstance(key, str) else None


def parsed_time(value):
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def validate_demo(data):
    """Return value-free violations. Reject all duplicated identities, not just later rows."""
    issues = []

    def issue(collection, index, code):
        item = {"collection": collection, "index": index, "code": code}
        if item not in issues:
            issues.append(item)

    if not isinstance(data, dict):
        return [{"collection": "snapshot", "index": None, "code": "INVALID_SNAPSHOT"}]
    if set(data) - {"schemaVersion", "sourceVersion", "provenance", "snapshotAt", "isLive", "description", "customers", "cards", "transactions"}:
        issue("snapshot", None, "UNEXPECTED_FIELD")
    if data.get("provenance") != "team-generated":
        issue("snapshot", None, "UNEXPECTED_PROVENANCE")
    if data.get("isLive") is not False:
        issue("snapshot", None, "MUST_DECLARE_NOT_LIVE")
    if data.get("schemaVersion") != "1.0.0":
        issue("snapshot", None, "UNSUPPORTED_SCHEMA")
    if not isinstance(data.get("sourceVersion"), str) or not data["sourceVersion"]:
        issue("snapshot", None, "SOURCE_VERSION_REQUIRED")
    snapshot = parsed_time(data.get("snapshotAt"))
    if not snapshot:
        issue("snapshot", None, "INVALID_SNAPSHOT_TIME")
    elif snapshot.tzinfo is None or snapshot.utcoffset() is None:
        issue("snapshot", None, "TIMEZONE_REQUIRED")
        snapshot = None

    tables = {}
    for collection, fields in FIELDS.items():
        rows = data.get(collection)
        if not isinstance(rows, list):
            issue(collection, None, "COLLECTION_REQUIRED")
            tables[collection] = {}
            continue
        ids = [r.get("id") for r in rows if isinstance(r, dict) and isinstance(r.get("id"), str)]
        duplicates = {value for value, count in Counter(ids).items() if count > 1}
        tables[collection] = {r["id"]: r for r in rows if isinstance(r, dict) and isinstance(r.get("id"), str) and r["id"] not in duplicates}
        for index, row in enumerate(rows):
            if not isinstance(row, dict):
                issue(collection, index, "ROW_MUST_BE_OBJECT")
                continue
            if set(row) - fields:
                issue(collection, index, "UNEXPECTED_FIELD")
            if fields - set(row):
                issue(collection, index, "MISSING_FIELD")
            identifier = row.get("id")
            if not isinstance(identifier, str) or not re.fullmatch(PREFIXES[collection] + r"_[a-z0-9]{8,32}", identifier):
                issue(collection, index, "INVALID_ID")
            elif identifier in duplicates:
                issue(collection, index, "DUPLICATE_ID")
            if collection == "customers":
                if not known_string(row.get("language"), {"es", "pt"}):
                    issue(collection, index, "UNSUPPORTED_LANGUAGE")
                if not isinstance(row.get("name"), str) or not row["name"].strip():
                    issue(collection, index, "NAME_REQUIRED")
            else:
                if not known_string(row.get("currency"), CURRENCIES):
                    issue(collection, index, "UNSUPPORTED_CURRENCY")
                if safe_lookup(tables.get("customers", {}), row.get("customerId")) is None:
                    issue(collection, index, "UNKNOWN_CUSTOMER")
            if collection == "cards":
                if not known_string(row.get("status"), CARD_STATUSES):
                    issue(collection, index, "UNKNOWN_CARD_STATUS")
                if not isinstance(row.get("last4"), str) or not re.fullmatch(r"[0-9]{4}", row["last4"]):
                    issue(collection, index, "INVALID_LAST4")
                if not isinstance(row.get("label"), str) or not row["label"].strip():
                    issue(collection, index, "LABEL_REQUIRED")
            if collection == "transactions":
                card = safe_lookup(tables.get("cards", {}), row.get("cardId"))
                if card is None:
                    issue(collection, index, "UNKNOWN_CARD")
                else:
                    if card.get("customerId") != row.get("customerId"):
                        issue(collection, index, "OWNER_MISMATCH")
                    if card.get("currency") != row.get("currency"):
                        issue(collection, index, "CURRENCY_MISMATCH")
                if type(row.get("amountMinor")) is not int or not 0 < row["amountMinor"] <= 9_007_199_254_740_991:
                    issue(collection, index, "INVALID_AMOUNT_MINOR")
                if not known_string(row.get("status"), TRANSACTION_STATUSES):
                    issue(collection, index, "UNKNOWN_TRANSACTION_STATUS")
                merchant = row.get("merchant")
                if merchant is not None and (not isinstance(merchant, str) or not merchant.strip()):
                    issue(collection, index, "INVALID_MERCHANT")
                event = parsed_time(row.get("occurredAt"))
                if not event:
                    issue(collection, index, "INVALID_EVENT_TIME")
                elif event.tzinfo is None or event.utcoffset() is None:
                    issue(collection, index, "TIMEZONE_REQUIRED")
                elif snapshot and event > snapshot:
                    issue(collection, index, "EVENT_AFTER_SNAPSHOT")
                if row.get("sourceVersion") != data.get("sourceVersion"):
                    issue(collection, index, "SOURCE_VERSION_MISMATCH")
                if not isinstance(row.get("sourceRef"), str) or not row["sourceRef"].startswith("authored-demo/"):
                    issue(collection, index, "INVALID_SOURCE_REF")
    return issues
