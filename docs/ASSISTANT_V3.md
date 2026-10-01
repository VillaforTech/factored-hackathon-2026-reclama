# Assistant v3: grounded candidate discovery

`lib/assistant.ts` is a pure TypeScript module with no dependencies. It adds a useful conversational layer without changing the frozen learned classifier, training data or reserved evaluation set. A learned intent remains an unconfirmed hypothesis; source matching is transparent and deterministic.

## Integration

The server and UI import the shared `lib/assistant.ts` module. All IDs and confirmation fields passed from the client must still be validated at the API boundary. Call with the authenticated customer ID and the source snapshot; `customerTransactions(session.customer_id)` already includes optional `cardLast4` for card hints.

```ts
const assistant = buildAssistant({
  text,
  locale: session.locale,
  customerId: session.customer_id,
  transactions: customerTransactions(session.customer_id),
  snapshotAt: snapshot.snapshotAt,
  selectedTransactionId, // explicit UI context only; never extracted from text
  confirmedReason, // explicit UI confirmation only; never the model top-1
  intentHint: prediction.intent,
});
```

The model and assistant can be returned together. `assistant.message` is the grounded response. Display `prediction` separately as an unconfirmed hypothesis and show candidate buttons; clicking is the user's selection. `canPrepareDraft` is presentation guidance only, never an authorization token. The existing draft/create endpoints remain the authority for session, transaction ownership, input validation, source consistency, expiry, final confirmation and idempotency.

`matchTransactions({text,customerId,transactions,snapshotAt})` returns `{extracted,candidates}`. It re-filters ownership and source validity internally. Candidates preserve source order and contain only `id,merchant,amountMinor,currency,occurredAt,status,matchedBy`. An empty or unrelated query returns no candidates, so a UI filter can retain its normal full list when there are no extracted hints. An unmatched _specific_ query must display the no-match state rather than silently ignoring constraints.

Constraints across dimensions (amount/currency/merchant/card/date) are combined with AND. Multiple values within a dimension are alternatives and can produce ambiguity. Multiple similar transactions remain separate; there is no automatic selection even when a single candidate exists. Unknown merchants stay null. Unsupported, future or malformed source rows are omitted.

Amounts support `84.90`, `84,90`, `75.800,00`, `75,800.00` and explicit currency integers such as `ARS 18500`. Bare integers may be dates or card references and are not guessed. `1.234` and `1,234` are deliberately ambiguous; use two decimals. `$` never implies a particular currency. Full ISO dates and unambiguous `16/06/2026` work; `06/07/2026` and relative dates are not guessed from the present day or historical snapshot. Card matching requires a phrase such as `tarjeta terminada en 1842` or `cartão final 5921`.

A selected record plus a recognized explicitly confirmed reason can prepare a draft. The module never sends the draft, issues refunds, freezes cards or adjudicates fraud. Pending/Reversed/Declined always explain their snapshot status and yield a support handoff. Contradictory hints and an existing selection produce `guidance.code="selection_conflict"` with `canPrepareDraft=false`; the selected ID is retained only to show the existing UI state.

## Local checks

From the project root:

```sh
npm run test:assistant
npm run check
```

Twenty targeted tests verify matching, ambiguity, ownership, normalized amounts, missing merchants, relative dates, source integrity, explicit confirmation, contradiction, and safe support guidance. These are implementation tests using authored fixtures; they do not claim independent conversational quality or establish independent model validation. The reserved ML comparison is an AI-authored development experiment, not an official/challenge-valid benchmark; see [the provenance correction](evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md). Portuguese wording still needs a fluent human reviewer.
