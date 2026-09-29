import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  workspace: text("workspace").notNull(),
  customerId: text("customer_id").notNull(),
  role: text("role").notNull(),
  locale: text("locale").notNull(),
  expiresAt: integer("expires_at").notNull(),
  fault: text("fault"),
});
export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  workspace: text("workspace").notNull(),
  customerId: text("customer_id").notNull(),
  transactionId: text("transaction_id").notNull(),
  reason: text("reason").notNull(),
  statement: text("statement").notNull(),
  token: text("token").notNull(),
  factsHash: text("facts_hash").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});
export const cases = sqliteTable(
  "cases",
  {
    id: text("id").primaryKey(),
    workspace: text("workspace").notNull(),
    customerId: text("customer_id").notNull(),
    transactionId: text("transaction_id").notNull(),
    draftId: text("draft_id").notNull(),
    reason: text("reason").notNull(),
    statement: text("statement").notNull(),
    facts: text("facts").notNull(),
    status: text("status").notNull(),
    kind: text("kind").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    payloadHash: text("payload_hash").notNull(),
    version: integer("version").notNull().default(1),
    note: text("note").notNull().default(""),
    lastActor: text("last_actor").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("case_idempotency").on(t.workspace, t.idempotencyKey),
    uniqueIndex("case_transaction").on(
      t.workspace,
      t.customerId,
      t.transactionId,
    ),
  ],
);
export const audit = sqliteTable("audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caseId: text("case_id").notNull(),
  event: text("event").notNull(),
  actor: text("actor").notNull(),
  version: integer("version").notNull(),
  createdAt: text("created_at").notNull(),
  detail: text("detail").notNull(),
});
export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  workspace: text("workspace").notNull(),
  operation: text("operation").notNull(),
  result: text("result").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: text("created_at").notNull(),
});

// Each named demo run belongs to one trusted platform identity. No shared anonymous namespace.
export const demoRuns = sqliteTable(
  "demo_runs",
  {
    id: text("id").primaryKey(),
    ownerWorkspace: text("owner_workspace").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [uniqueIndex("demo_run_owner").on(t.ownerWorkspace, t.id)],
);
