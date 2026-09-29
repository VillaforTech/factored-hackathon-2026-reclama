export type Locale = "es" | "pt";
export type Tx = {
  id: string;
  customerId: string;
  cardId: string;
  cardLast4?: string;
  merchant: string | null;
  amountMinor: number;
  currency: string;
  occurredAt: string;
  status: string;
  sourceRef: string;
  sourceVersion: string;
};
export type SessionView = {
  contextId: string;
  role: "customer" | "agent";
  locale: Locale;
  expiresAt: number;
  runId: string;
  snapshot: { snapshotAt: string; sourceVersion: string; isLive: false };
  customer: { id: string; name: string; language: string };
};
export type Draft = {
  draftId: string;
  confirmationToken: string;
  version: number;
  expiresAt: number;
  transaction: Tx;
  statement: string;
  reason: string;
  kind: string;
};
export type CaseView = {
  id: string;
  customer_id: string;
  transaction_id: string;
  reason: string;
  statement: string;
  facts: Tx;
  status: string;
  kind: string;
  version: number;
  note: string;
  created_at: string;
  updated_at: string;
};
export type Audit = {
  event: string;
  version: number;
  created_at: string;
  detail: string;
};
export class ClientError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
  contextId?: string,
): Promise<T> {
  const r = await fetch("/api/" + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(contextId ? { "X-Reclama-Context": contextId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    signal,
  });
  const data = (await r.json()) as Record<string, unknown>;
  if (!r.ok)
    throw new ClientError(
      String(data.error || "SERVICE_UNAVAILABLE"),
      r.status,
    );
  return data as T;
}
export function money(t: Tx, locale: Locale) {
  return new Intl.NumberFormat(locale === "es" ? "es-EC" : "pt-BR", {
    style: "currency",
    currency: t.currency,
  }).format(t.amountMinor / 100);
}
export function date(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-EC" : "pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  }).format(new Date(value));
}
