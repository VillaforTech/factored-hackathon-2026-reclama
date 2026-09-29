#!/usr/bin/env python3
"""Structural checks only. Does not import or inspect training code or predictions."""
from collections import Counter, defaultdict
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parent
LABELS = {"unrecognized", "duplicate", "merchant_issue", "refund_request", "card_lost", "account_query", "credit_query", "other"}
KEYS = {"id", "familyId", "pairId", "locale", "text", "label"}


def main():
    raw = (ROOT / "corpus.jsonl").read_bytes()
    rows = [json.loads(line) for line in raw.decode("utf-8").splitlines()]
    assert len(rows) == 256
    assert len({row["id"] for row in rows}) == 256
    assert len({row["text"].strip().casefold() for row in rows}) == 256
    assert Counter(row["label"] for row in rows) == Counter({label: 32 for label in LABELS})
    assert Counter(row["locale"] for row in rows) == Counter({"es": 128, "pt": 128})
    families = defaultdict(list)
    pairs = defaultdict(list)
    for row in rows:
        assert set(row) == KEYS
        assert all(isinstance(value, str) and value.strip() for value in row.values())
        assert row["label"] in LABELS
        assert row["locale"] in {"es", "pt"}
        assert len(row["text"]) >= 40
        families[row["familyId"]].append(row)
        pairs[row["pairId"]].append(row)
    assert len(families) == len(pairs) == 128
    for group in list(families.values()) + list(pairs.values()):
        assert len(group) == 2
        assert {row["locale"] for row in group} == {"es", "pt"}
        assert len({row["label"] for row in group}) == 1
        assert len({row["familyId"] for row in group}) == 1
        assert len({row["pairId"] for row in group}) == 1
    assert Counter(group[0]["label"] for group in families.values()) == Counter({label: 16 for label in LABELS})
    contrastive = [14, 15, 30, 31, 32, 46, 47, 62, 63, 64, 78, 79, 94, 95, 110, 111]
    indeterminate = list(range(113, 129))
    assert len(contrastive + indeterminate) == len(set(contrastive + indeterminate)) == 32
    for number in contrastive:
        assert families[f"fam_{number:04d}"][0]["label"] != "other"
    for number in indeterminate:
        assert families[f"fam_{number:04d}"][0]["label"] == "other"
    digest = hashlib.sha256(raw).hexdigest()
    expected = (ROOT / "SHA256SUMS").read_text().split()[0]
    freeze = json.loads((ROOT / "freeze.json").read_text())
    assert digest == expected == freeze["corpusSha256"]
    assert freeze["humanReviewed"] is False
    assert freeze["trainingFilesInspected"] is False
    print(json.dumps({"status": "passed", "texts": len(rows), "families": len(families), "classes": len(LABELS), "designatedChallengeTexts": 64, "sha256": digest, "semanticHumanReview": "pending"}))


if __name__ == "__main__":
    main()
