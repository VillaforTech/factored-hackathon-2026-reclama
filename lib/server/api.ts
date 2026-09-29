import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../app/chatgpt-auth";
import { z } from "zod";
import {
  ApiError,
  fail,
  hash,
  identifier,
  ownTransaction,
  safeStatement,
  caseKind,
  customerTransactions,
  snapshot,
  personas,
  reasonValues,
  type Session,
} from "./domain";

type Row = Record<string, unknown>;
const COOKIE = "reclama_session";
const db = () => {
  if (!env.DB) fail(503, "STORAGE_UNAVAILABLE");
  return env.DB!;
};
const json = (
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
const one = <T>(sql: string, ...args: unknown[]) =>
  db()
    .prepare(sql)
    .bind(...args)
    .first<T>();
const run = (sql: string, ...args: unknown[]) =>
  db()
    .prepare(sql)
    .bind(...args)
    .run();
async function body(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json"))
    fail(415, "JSON_REQUIRED");
  if (Number(req.headers.get("content-length")) > 12000)
    fail(413, "BODY_TOO_LARGE");
  const text = await req.text();
  if (text.length > 12000) fail(413, "BODY_TOO_LARGE");
  try {
    return JSON.parse(text);
  } catch {
    fail(400, "INVALID_JSON");
  }
}
function cookieId(req: Request) {
  return (
    req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(COOKIE + "="))
      ?.slice(COOKIE.length + 1) || ""
  );
}
async function session(req: Request, workspace: string, ignoreContext = false) {
  const s = await one<Session>(
    "SELECT * FROM sessions WHERE id = ? AND workspace = ?",
    cookieId(req),
    workspace,
  );
  if (!s || s.expires_at < Date.now()) fail(401, "SESSION_EXPIRED");
  const expected = req.headers.get("X-Reclama-Context");
  if (
    !ignoreContext &&
    expected &&
    expected !== (await hash("reclama-context:" + s.id))
  )
    fail(409, "SESSION_CONTEXT_CHANGED");
  return s;
}
function role(s: Session, wanted: "customer" | "agent") {
  if (s.role !== wanted) fail(403, "ROLE_REQUIRED");
}
const sessionView = async (s: Session) => ({
  contextId: await hash("reclama-context:" + s.id),
  role: s.role,
  locale: s.locale,
  expiresAt: s.expires_at,
  customer: personas.find((p) => p.id === s.customer_id),
  snapshot,
  runId: s.workspace.includes(":run:")
    ? s.workspace.split(":run:")[1]
    : "default",
});
function publicCase(row: Row) {
  const { workspace, idempotency_key, payload_hash, last_actor, ...rest } = row;
  void workspace;
  void idempotency_key;
  void payload_hash;
  void last_actor;
  return { ...rest, facts: JSON.parse(String(row.facts)) };
}
async function getCase(id: string, s: Session) {
  const c = await one<Row>(
    "SELECT * FROM cases WHERE id=? AND workspace=?" +
      (s.role === "customer" ? " AND customer_id=?" : ""),
    ...[id, s.workspace, ...(s.role === "customer" ? [s.customer_id] : [])],
  );
  if (!c) fail(404, "NOT_FOUND");
  return c;
}
async function record(
  s: Session,
  operation: string,
  result: string,
  start: number,
) {
  await run(
    "INSERT INTO attempts (id,workspace,operation,result,latency_ms,created_at) VALUES (?,?,?,?,?,?)",
    identifier(),
    s.workspace,
    operation,
    result,
    Math.round(performance.now() - start),
    new Date().toISOString(),
  );
}
export async function handle(req: Request) {
  const start = performance.now();
  try {
    const user = await getChatGPTUser();
    if (!user) fail(401, "SIGN_IN_REQUIRED");
    const ownerWorkspace = await hash("reclama-v1:" + user.userId);
    let workspace = ownerWorkspace;
    const previous = await one<Session>(
      "SELECT * FROM sessions WHERE id=?",
      cookieId(req),
    );
    if (previous?.workspace.startsWith(ownerWorkspace + ":run:")) {
      const runId = previous.workspace.slice((ownerWorkspace + ":run:").length);
      if (
        await one(
          "SELECT id FROM demo_runs WHERE id=? AND owner_workspace=?",
          runId,
          ownerWorkspace,
        )
      )
        workspace = previous.workspace;
    }
    const path = new URL(req.url).pathname
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean);
    const method = req.method;
    if (method !== "GET") {
      const origin = req.headers.get("origin");
      if (!origin || origin !== new URL(req.url).origin)
        fail(403, "ORIGIN_REQUIRED");
      if (req.headers.get("sec-fetch-site") === "cross-site")
        fail(403, "ORIGIN_REQUIRED");
    }
    if (path[0] === "runs" && method === "GET") {
      const runs = await db()
        .prepare(
          "SELECT id,created_at FROM demo_runs WHERE owner_workspace=? ORDER BY created_at DESC LIMIT 50",
        )
        .bind(ownerWorkspace)
        .all();
      return json({
        runs: [{ id: "default", created_at: null }, ...runs.results],
      });
    }
    if (path[0] === "runs" && method === "POST") {
      const b = z
        .object({
          persona: z.enum(["ana", "lucas"]),
          locale: z.enum(["es", "pt"]),
        })
        .strict()
        .parse(await body(req));
      const runId = identifier();
      const nextWorkspace = ownerWorkspace + ":run:" + runId;
      const nextSession: Session = {
        id: identifier(),
        workspace: nextWorkspace,
        customer_id: personas[b.persona === "ana" ? 0 : 1].id,
        role: "customer",
        locale: b.locale,
        expires_at: Date.now() + 30 * 60 * 1000,
        fault: null,
      };
      const inserted = await db().batch([
        db()
          .prepare(
            "INSERT INTO demo_runs (id,owner_workspace,created_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM demo_runs WHERE owner_workspace=?)<50 RETURNING id",
          )
          .bind(
            runId,
            ownerWorkspace,
            new Date().toISOString(),
            ownerWorkspace,
          ),
        db()
          .prepare(
            "INSERT INTO sessions (id,workspace,customer_id,role,locale,expires_at) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT id FROM demo_runs WHERE id=?)",
          )
          .bind(
            nextSession.id,
            nextSession.workspace,
            nextSession.customer_id,
            nextSession.role,
            nextSession.locale,
            nextSession.expires_at,
            runId,
          ),
      ]);
      if (!inserted[0].results?.length) fail(429, "RUN_LIMIT");
      const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
      return json(await sessionView(nextSession), 201, {
        "Set-Cookie": `${COOKIE}=${nextSession.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800${secure}`,
      });
    }
    if (path[0] === "session" && method === "POST") {
      const b = z
        .object({
          persona: z.enum(["ana", "lucas"]),
          role: z.enum(["customer", "agent"]),
          locale: z.enum(["es", "pt"]),
          runId: z.string().max(80).optional(),
        })
        .strict()
        .parse(await body(req));
      if (b.runId && b.runId !== "default") {
        if (
          !(await one(
            "SELECT id FROM demo_runs WHERE id=? AND owner_workspace=?",
            b.runId,
            ownerWorkspace,
          ))
        )
          fail(404, "NOT_FOUND");
        workspace = ownerWorkspace + ":run:" + b.runId;
      } else if (b.runId === "default") workspace = ownerWorkspace;
      const s: Session = {
        id: identifier(),
        workspace,
        customer_id: personas[b.persona === "ana" ? 0 : 1].id,
        role: b.role,
        locale: b.locale,
        expires_at: Date.now() + 30 * 60 * 1000,
        fault: null,
      };
      await run(
        "INSERT INTO sessions (id,workspace,customer_id,role,locale,expires_at) VALUES (?,?,?,?,?,?)",
        s.id,
        s.workspace,
        s.customer_id,
        s.role,
        s.locale,
        s.expires_at,
      );
      const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
      return json(await sessionView(s), 201, {
        "Set-Cookie": `${COOKIE}=${s.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800${secure}`,
      });
    }
    const s = await session(
      req,
      workspace,
      path[0] === "session" && method === "GET",
    );
    if (path[0] === "session" && method === "GET")
      return json(await sessionView(s));
    if (path[0] === "session" && method === "PATCH") {
      const b = z
        .object({ locale: z.enum(["es", "pt"]) })
        .strict()
        .parse(await body(req));
      await run(
        "UPDATE sessions SET locale=? WHERE id=? AND workspace=?",
        b.locale,
        s.id,
        workspace,
      );
      return json(await sessionView({ ...s, locale: b.locale }));
    }
    if (path[0] === "transactions" && method === "GET") {
      role(s, "customer");
      return json({
        transactions: customerTransactions(s.customer_id),
        snapshot,
      });
    }
    if (path[0] === "message" && method === "POST") {
      role(s, "customer");
      const { text, selectedTransactionId, confirmedReason } = z
        .object({
          text: z.string().min(1).max(2000),
          selectedTransactionId: z.string().max(100).optional(),
          confirmedReason: z.enum(reasonValues).optional(),
        })
        .strict()
        .parse(await body(req));
      safeStatement(text.length < 12 ? text.padEnd(12, " ") + "." : text);
      // The learned classifier is advisory only; it has no permission to create drafts or cases.
      const { classifyMessage } = await import("./model");
      const result = classifyMessage(text, s.locale);
      if (selectedTransactionId)
        ownTransaction(s.customer_id, selectedTransactionId);
      const { buildAssistant } = await import("../assistant");
      const assistance = buildAssistant({
        text,
        locale: s.locale,
        customerId: s.customer_id,
        transactions: customerTransactions(s.customer_id),
        snapshotAt: snapshot.snapshotAt,
        selectedTransactionId,
        confirmedReason,
        intentHint: result.intent,
      });
      await record(s, "message", "advisory", start);
      return json({ ...result, message: assistance.message, assistance });
    }
    if (path[0] === "drafts" && method === "POST") {
      role(s, "customer");
      const b = z
        .object({
          transactionId: z.string().max(100),
          statement: z.string(),
          reason: z.enum(reasonValues),
        })
        .strict()
        .parse(await body(req));
      const statement = safeStatement(b.statement);
      const t = ownTransaction(s.customer_id, b.transactionId);
      const d = {
        id: identifier(),
        token: identifier(),
        expires: Date.now() + 10 * 60 * 1000,
        factsHash: await hash(JSON.stringify(t)),
        created: new Date().toISOString(),
      };
      await run(
        "INSERT INTO drafts (id,session_id,workspace,customer_id,transaction_id,reason,statement,token,facts_hash,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        d.id,
        s.id,
        s.workspace,
        s.customer_id,
        t.id,
        b.reason,
        statement,
        d.token,
        d.factsHash,
        d.expires,
        d.created,
      );
      return json(
        {
          draftId: d.id,
          confirmationToken: d.token,
          version: 1,
          expiresAt: d.expires,
          transaction: t,
          statement,
          reason: b.reason,
          kind: caseKind(t, b.reason),
          snapshot,
        },
        201,
      );
    }
    if (path[0] === "cases" && path.length === 1 && method === "POST") {
      role(s, "customer");
      const b = z
        .object({
          draftId: z.string().uuid(),
          confirmationToken: z.string().uuid(),
          idempotencyKey: z.string().uuid(),
          confirmed: z.literal(true),
        })
        .strict()
        .parse(await body(req));
      const d = await one<Row>(
        "SELECT * FROM drafts WHERE id=? AND session_id=? AND workspace=? AND customer_id=?",
        b.draftId,
        s.id,
        s.workspace,
        s.customer_id,
      );
      if (!d || d.token !== b.confirmationToken) fail(403, "CONSENT_INVALID");
      const payloadHash = await hash(
        JSON.stringify({
          draft: b.draftId,
          customer: s.customer_id,
          token: b.confirmationToken,
        }),
      );
      const prior = await one<Row>(
        "SELECT * FROM cases WHERE workspace=? AND idempotency_key=?",
        workspace,
        b.idempotencyKey,
      );
      if (prior) {
        if (
          prior.payload_hash !== payloadHash ||
          prior.customer_id !== s.customer_id
        )
          fail(409, "IDEMPOTENCY_CONFLICT");
        return json({ case: publicCase(prior), replayed: true });
      }
      if (Number(d.expires_at) < Date.now()) fail(409, "DRAFT_EXPIRED");
      const t = ownTransaction(s.customer_id, String(d.transaction_id));
      if ((await hash(JSON.stringify(t))) !== d.facts_hash)
        fail(409, "SOURCE_CHANGED");
      const existing = await one<Row>(
        "SELECT * FROM cases WHERE workspace=? AND customer_id=? AND transaction_id=?",
        workspace,
        s.customer_id,
        t.id,
      );
      if (existing) fail(409, "CASE_ALREADY_EXISTS");
      const id = "RC-" + identifier().slice(0, 8).toUpperCase();
      const now = new Date().toISOString();
      try {
        await run(
          "INSERT INTO cases (id,workspace,customer_id,transaction_id,draft_id,reason,statement,facts,status,kind,idempotency_key,payload_hash,version,note,last_actor,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          id,
          workspace,
          s.customer_id,
          t.id,
          b.draftId,
          d.reason,
          d.statement,
          JSON.stringify({ ...t, ...snapshot }),
          "received",
          caseKind(t, String(d.reason)),
          b.idempotencyKey,
          payloadHash,
          1,
          "",
          s.id,
          now,
          now,
        );
      } catch (error) {
        const retry = await one<Row>(
          "SELECT * FROM cases WHERE workspace=? AND (idempotency_key=? OR (customer_id=? AND transaction_id=?))",
          workspace,
          b.idempotencyKey,
          s.customer_id,
          t.id,
        );
        if (retry) {
          if (
            retry.customer_id !== s.customer_id ||
            (retry.idempotency_key === b.idempotencyKey &&
              retry.payload_hash !== payloadHash)
          )
            fail(409, "IDEMPOTENCY_CONFLICT");
          if (retry.idempotency_key !== b.idempotencyKey)
            fail(409, "CASE_ALREADY_EXISTS");
          return json({ case: publicCase(retry), replayed: true });
        }
        throw error;
      }
      if (s.fault === "timeout_after_commit") {
        await run("UPDATE sessions SET fault=NULL WHERE id=?", s.id);
        await record(s, "create_case", "simulated_timeout_after_commit", start);
        return json({ error: "SIMULATED_TIMEOUT", retrySameKey: true }, 503);
      }
      const saved = await getCase(id, s);
      await record(s, "create_case", "persisted_readback", start);
      return json({ case: publicCase(saved) }, 201);
    }
    if (path[0] === "cases" && method === "GET") {
      if (path[1]) {
        const c = await getCase(path[1], s);
        const events = await db()
          .prepare(
            "SELECT event,version,created_at,detail FROM audit WHERE case_id=? ORDER BY id",
          )
          .bind(c.id)
          .all();
        return json({ case: publicCase(c), audit: events.results });
      }
      const rows = await db()
        .prepare(
          "SELECT * FROM cases WHERE workspace=?" +
            (s.role === "customer" ? " AND customer_id=?" : "") +
            " ORDER BY created_at DESC",
        )
        .bind(workspace, ...(s.role === "customer" ? [s.customer_id] : []))
        .all<Row>();
      return json({ cases: rows.results.map(publicCase) });
    }
    if (path[0] === "cases" && path[1] && method === "PATCH") {
      role(s, "agent");
      const b = z
        .object({
          status: z.enum(["in_review", "needs_information"]),
          note: z.string().min(12).max(1000),
          version: z.number().int().positive(),
        })
        .strict()
        .parse(await body(req));
      const note = safeStatement(b.note);
      const c = await getCase(path[1], s);
      if (c.version !== b.version) fail(409, "VERSION_CONFLICT");
      const result = await one<{ id: string }>(
        "UPDATE cases SET status=?,note=?,version=version+1,last_actor=?,updated_at=? WHERE id=? AND workspace=? AND version=? RETURNING id",
        b.status,
        note,
        s.id,
        new Date().toISOString(),
        c.id,
        workspace,
        b.version,
      );
      if (!result) fail(409, "VERSION_CONFLICT");
      return json({ case: publicCase(await getCase(String(c.id), s)) });
    }
    if (path[0] === "demo" && path[1] === "fault" && method === "POST") {
      const b = z
        .object({ kind: z.enum(["expire", "timeout_after_commit"]) })
        .strict()
        .parse(await body(req));
      if (b.kind === "expire")
        await run(
          "UPDATE sessions SET expires_at=0 WHERE id=? AND workspace=?",
          s.id,
          workspace,
        );
      else
        await run(
          "UPDATE sessions SET fault=? WHERE id=? AND workspace=?",
          b.kind,
          s.id,
          workspace,
        );
      return json({ armed: b.kind, sandboxOnly: true });
    }
    if (path[0] === "metrics" && method === "GET") {
      const rows = await db()
        .prepare(
          "SELECT operation,result,latency_ms,created_at FROM attempts WHERE workspace=? ORDER BY created_at DESC LIMIT 200",
        )
        .bind(workspace)
        .all();
      return json({
        attempts: rows.results,
        scope: "this sandbox workspace, latest 200 recorded attempts",
        externalApiCost: 0,
        hostingCost: "not instrumented",
      });
    }
    fail(404, "NOT_FOUND");
  } catch (error) {
    if (error instanceof ApiError)
      return json({ error: error.code }, error.status);
    if (error instanceof z.ZodError)
      return json({ error: "INVALID_REQUEST" }, 422);
    return json({ error: "STORAGE_OR_SERVICE_UNAVAILABLE" }, 503);
  }
}
