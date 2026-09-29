import demo from "../data/demo.json";
export type Locale = "es" | "pt";
export type Transaction = (typeof demo.transactions)[number];
export type Session = {
  id: string;
  workspace: string;
  customer_id: string;
  role: "customer" | "agent";
  locale: Locale;
  expires_at: number;
  fault: string | null;
};
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export function fail(status: number, code: string): never {
  throw new ApiError(status, code);
}
export const identifier = () => crypto.randomUUID();
export async function hash(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function ownTransaction(customerId: string, id: string) {
  const t = demo.transactions.find(
    (t) => t.id === id && t.customerId === customerId,
  );
  if (!t) fail(404, "NOT_FOUND");
  const card = demo.cards.find(
    (c) =>
      c.id === t.cardId &&
      c.customerId === customerId &&
      c.currency === t.currency,
  );
  if (
    !card ||
    !Number.isSafeInteger(t.amountMinor) ||
    t.amountMinor <= 0 ||
    Date.parse(t.occurredAt) > Date.parse(demo.snapshotAt)
  )
    fail(409, "SOURCE_INTEGRITY");
  return t;
}
export function safeStatement(value: string) {
  const s = value.trim();
  if (s.length < 12 || s.length > 2000) fail(422, "STATEMENT_LENGTH");
  if (
    /\b\d(?:[ -]?\d){12,18}\b/.test(s) ||
    /\b(?:cvv|cvc|pin|password|contrase[nñ]a|senha)\s*(?:(?:es|[ée]|is|e)\s+)?[:=]?\s*\S{3,}/i.test(
      s,
    ) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(s)
  )
    fail(422, "SENSITIVE_CONTENT");
  return s;
}
export const reasonValues = [
  "unrecognized",
  "duplicate",
  "merchant_issue",
  "other",
] as const;
export function caseKind(t: Transaction, reason: string) {
  return t.status === "Approved" && reason === "unrecognized"
    ? "dispute_intake"
    : "support_handoff";
}
export function customerTransactions(id: string) {
  return demo.transactions
    .filter((t) => t.customerId === id)
    .map((t) => ({
      ...t,
      cardLast4: demo.cards.find((c) => c.id === t.cardId)?.last4,
    }));
}
export const snapshot = {
  snapshotAt: demo.snapshotAt,
  sourceVersion: demo.sourceVersion,
  isLive: false,
  provenance: demo.provenance,
};
export const personas = demo.customers;
