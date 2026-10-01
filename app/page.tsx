"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Search,
  MessageSquare,
  Layers3,
  Activity,
  LockKeyhole,
  CreditCard,
  Check,
  Globe2,
  ChevronRight,
  ArrowUpRight,
  Send,
  Loader2,
  FileCheck2,
  AlertCircle,
  FlaskConical,
  LogIn,
  Download,
  X,
  Play,
  Plus,
  History,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  api as transport,
  ClientError,
  money,
  date,
  type Locale,
  type Tx,
  type SessionView,
  type Draft,
  type CaseView,
  type Audit,
} from "@/lib/client-types";
import { matchTransactions, type AssistantResult } from "@/lib/assistant";
import { useWebMCP } from "@/lib/use-webmcp";
import dataReport from "@/lib/data/data-report.json";
import modelReport from "@/lib/data/model-report.json";

type Chat = { side: "assistant" | "user"; text: string; model?: string };
type RunView = { id: string; created_at: string | null };
const reasons = ["unrecognized", "duplicate", "merchant_issue", "other"];
const statusLabels: Record<string, [string, string]> = {
  Approved: ["Registrado", "Registrada"],
  Pending: ["Pendiente", "Pendente"],
  Reversed: ["Reversado", "Revertida"],
  Declined: ["Rechazado", "Recusada"],
  received: ["Recibido", "Recebido"],
  in_review: ["En revisión", "Em análise"],
  needs_information: ["Información solicitada", "Informações solicitadas"],
};
export default function Home() {
  const pendingRequests = useRef(new Set<AbortController>());
  const activeContext = useRef<string | undefined>(undefined);
  const contextEpoch = useRef(0);
  const api = useCallback(
    async <T,>(path: string, method = "GET", body?: unknown): Promise<T> => {
      const controller = new AbortController();
      const epoch = contextEpoch.current;
      pendingRequests.current.add(controller);
      try {
        const contextFree =
          path === "runs" || (path === "session" && method !== "PATCH");
        const data = await transport<T>(
          path,
          method,
          body,
          controller.signal,
          contextFree ? undefined : activeContext.current,
        );
        if (controller.signal.aborted || epoch !== contextEpoch.current)
          throw new DOMException("Context changed", "AbortError");
        if (
          (path === "session" || (path === "runs" && method === "POST")) &&
          data &&
          typeof data === "object" &&
          "contextId" in data
        )
          activeContext.current = String(data.contextId);
        return data;
      } finally {
        pendingRequests.current.delete(controller);
      }
    },
    [],
  );
  const [assistance, setAssistance] = useState<AssistantResult | null>(null);
  const [runs, setRuns] = useState<RunView[]>([]);
  const [guided, setGuided] = useState(false);
  const [newRunOpen, setNewRunOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("es");
  const [session, setSession] = useState<SessionView | null>(null);
  const [auth, setAuth] = useState<"loading" | "login" | "ready">("loading");
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [selected, setSelected] = useState<Tx | null>(null);
  const [reason, setReason] = useState("");
  const [statement, setStatement] = useState("");
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("attention");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [consent, setConsent] = useState(false);
  const [idempotency, setIdempotency] = useState("");
  const [result, setResult] = useState<CaseView | null>(null);
  const [cases, setCases] = useState<CaseView[]>([]);
  const [detail, setDetail] = useState<{
    case: CaseView;
    audit: Audit[];
  } | null>(null);
  const [note, setNote] = useState("");
  const [fault, setFault] = useState(false);
  const [notice, setNotice] = useState("");
  const [metrics, setMetrics] = useState<
    { operation: string; result: string; latency_ms: number }[]
  >([]);
  useWebMCP(!!session);
  const t = (es: string, pt: string) => (locale === "es" ? es : pt);
  const reasonName = (r: string) =>
    ({
      unrecognized: t("Cargo no reconocido", "Compra não reconhecida"),
      duplicate: t("Posible duplicado", "Possível duplicidade"),
      merchant_issue: t(
        "Problema con el comercio",
        "Problema com o estabelecimento",
      ),
      other: t("Necesito revisión", "Preciso de revisão"),
    })[r] || r;
  const statusName = (s: string) => {
    const label = statusLabels[s];
    return label ? t(...label) : s;
  };
  function errorText(e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") return "";
    const code = e instanceof ClientError ? e.code : "SERVICE_UNAVAILABLE";
    const map: Record<string, [string, string]> = {
      RUN_LIMIT: [
        "Alcanzaste los 50 recorridos. Puedes recuperar uno guardado.",
        "Você atingiu 50 percursos. Pode recuperar um salvo.",
      ],
      CASE_ALREADY_EXISTS: [
        "Ya existe un expediente para este movimiento. Cierra el resumen y ábrelo en Mesa de revisión.",
        "Já existe um caso para esta transação. Feche o resumo e abra-o na Mesa de análise.",
      ],
      SESSION_EXPIRED: [
        "Tu sesión expiró. Inicia una nueva sesión de prueba.",
        "Sua sessão expirou. Inicie uma nova sessão de teste.",
      ],
      SENSITIVE_CONTENT: [
        "Retira PIN, CVV, contraseñas, correo y números completos de tarjeta.",
        "Remova senhas, CVV, e-mail e números completos de cartão.",
      ],
      STATEMENT_LENGTH: [
        "Describe lo ocurrido en 12 a 2.000 caracteres.",
        "Descreva o ocorrido em 12 a 2.000 caracteres.",
      ],
      SIMULATED_TIMEOUT: [
        "El envío perdió la respuesta. Reintenta con la misma solicitud: no se creará otro caso.",
        "O envio perdeu a resposta. Tente novamente com a mesma solicitação: outro caso não será criado.",
      ],
      SOURCE_CHANGED: [
        "La evidencia cambió. Revisa de nuevo antes de confirmar.",
        "A evidência mudou. Revise novamente antes de confirmar.",
      ],
      DRAFT_EXPIRED: [
        "El resumen expiró. Cierra esta ventana y prepara otro.",
        "O resumo expirou. Feche esta janela e prepare outro.",
      ],
      VERSION_CONFLICT: [
        "Otro cambio actualizó el caso. Ábrelo de nuevo antes de guardar.",
        "Outra alteração atualizou o caso. Abra-o novamente antes de salvar.",
      ],
      CONSENT_INVALID: [
        "La confirmación ya no corresponde a esta sesión. Prepara otro resumen.",
        "A confirmação não corresponde a esta sessão. Prepare outro resumo.",
      ],
    };
    if (
      code === "SESSION_EXPIRED" ||
      code === "SIGN_IN_REQUIRED" ||
      code === "SESSION_CONTEXT_CHANGED"
    ) {
      clearContext();
      setSession(null);
      setAuth(code === "SIGN_IN_REQUIRED" ? "login" : "ready");
    }
    if (code === "SESSION_CONTEXT_CHANGED")
      return t(
        "La sesión cambió en otra pestaña. Vuelve a abrir el recorrido antes de continuar.",
        "A sessão mudou em outra aba. Abra o percurso novamente antes de continuar.",
      );
    return map[code]
      ? t(...map[code])
      : t(
          "No pudimos completar la operación. Reintenta sin cambiar la solicitud.",
          "Não foi possível concluir a operação. Tente novamente sem alterar a solicitação.",
        ) +
          " (" +
          code +
          ")";
  }
  const clearContext = useCallback(() => {
    contextEpoch.current += 1;
    for (const controller of pendingRequests.current) controller.abort();
    pendingRequests.current.clear();
    setAssistance(null);
    setTransactions([]);
    setSelected(null);
    setDraft(null);
    setResult(null);
    setReason("");
    setStatement("");
    setChats([]);
    setConsent(false);
    setFault(false);
    setCases([]);
    setDetail(null);
    setNote("");
    setText("");
    setQuery("");
    setMetrics([]);
    setNotice("");
    setGuided(false);
  }, []);
  async function loadRuns() {
    setRuns((await api<{ runs: RunView[] }>("runs")).runs);
  }
  async function changeLocale() {
    const next = locale === "es" ? "pt" : "es";
    if (!session) {
      setLocale(next);
      return;
    }
    setBusy(true);
    setError("");
    try {
      setSession(await api<SessionView>("session", "PATCH", { locale: next }));
      setLocale(next);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function newRun() {
    setBusy(true);
    setError("");
    try {
      const s = await api<SessionView>("runs", "POST", {
        persona,
        locale,
      });
      clearContext();
      setSession(s);
      setAuth("ready");
      setNewRunOpen(false);
      setTab("attention");
      setGuided(true);
      const [tx, rs] = await Promise.all([
        api<{ transactions: Tx[] }>("transactions"),
        api<{ runs: RunView[] }>("runs"),
      ]);
      setTransactions(tx.transactions);
      setRuns(rs.runs);
      setNotice(
        t(
          "Recorrido nuevo. Los anteriores siguen guardados.",
          "Novo percurso. Os anteriores continuam salvos.",
        ),
      );
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  const loadCases = useCallback(async () => {
    const r = await api<{ cases: CaseView[] }>("cases");
    setCases(r.cases);
  }, [api]);
  useEffect(() => {
    let cancelled = false;
    const requests = pendingRequests.current;
    api<SessionView>("session")
      .then(async (s) => {
        if (cancelled) return;
        setSession(s);
        setLocale(s.locale);
        setAuth("ready");
        const savedRuns = await api<{ runs: RunView[] }>("runs");
        if (!cancelled) setRuns(savedRuns.runs);
        const c = await api<{ cases: CaseView[] }>("cases");
        if (!cancelled) setCases(c.cases);
        if (s.role === "customer") {
          const r = await api<{ transactions: Tx[] }>("transactions");
          if (!cancelled) setTransactions(r.transactions);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setAuth(
            e instanceof ClientError && e.code === "SIGN_IN_REQUIRED"
              ? "login"
              : "ready",
          );
      });
    return () => {
      cancelled = true;
      for (const controller of requests) controller.abort();
    };
  }, [api]);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        clearContext();
        setSession(null);
        setAuth("ready");
        setNotice(
          session.locale === "es"
            ? "La sesión venció. Recupera tu recorrido para continuar; los casos guardados se conservan."
            : "A sessão expirou. Recupere seu percurso para continuar; os casos salvos são preservados.",
        );
      },
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session, clearContext]);
  async function start(
    persona: "ana" | "lucas",
    role: "customer" | "agent" = "customer",
    lang: Locale = locale,
    runId?: string,
  ) {
    setBusy(true);
    setError("");
    try {
      const s = await api<SessionView>("session", "POST", {
        persona,
        role,
        locale: lang,
        ...(runId ? { runId } : {}),
      });
      clearContext();
      setSession(s);
      setLocale(lang);
      setSelected(null);
      setDraft(null);
      setResult(null);
      setReason("");
      setStatement("");
      setChats([]);
      setConsent(false);
      setFault(false);
      if (role === "customer") {
        setTransactions(
          (await api<{ transactions: Tx[] }>("transactions")).transactions,
        );
      } else setTransactions([]);
      await Promise.all([loadCases(), loadRuns()]);
      setAuth("ready");
    } catch (e) {
      if (e instanceof ClientError && e.code === "SIGN_IN_REQUIRED")
        setAuth("login");
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function send(value = text) {
    if (!value.trim() || busy || !session) return;
    setBusy(true);
    setError("");

    try {
      const r = await api<{
        message: string;
        abstain: boolean;
        modelVersion: string;
        intent: string;
        assistance: AssistantResult;
      }>("message", "POST", {
        text: value,
        ...(selected ? { selectedTransactionId: selected.id } : {}),
        ...(reason ? { confirmedReason: reason } : {}),
      });
      setAssistance(r.assistance);
      setText("");
      setChats((c) => [
        ...c,
        { side: "user", text: value },
        {
          side: "assistant",
          text: r.message,
          model: r.abstain
            ? t("Hipótesis sin confirmar: ", "Hipótese não confirmada: ") +
              (
                {
                  unrecognized: t(
                    "cargo no reconocido",
                    "compra não reconhecida",
                  ),
                  duplicate: t("posible duplicado", "possível duplicidade"),
                  merchant_issue: t(
                    "problema con el comercio",
                    "problema com estabelecimento",
                  ),
                  refund_request: t(
                    "solicitud de reembolso",
                    "pedido de reembolso",
                  ),
                  card_lost: t("tarjeta perdida", "cartão perdido"),
                  account_query: t("consulta de cuenta", "consulta de conta"),
                  credit_query: t("consulta de crédito", "consulta de crédito"),
                  other: t("otra consulta", "outra consulta"),
                } as Record<string, string>
              )[r.intent]
            : t(
                "Orientación del modelo · confirma el motivo",
                "Orientação do modelo · confirme o motivo",
              ),
        },
      ]);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  function selectTx(tx: Tx) {
    setAssistance(null);
    setSelected(tx);
    setDraft(null);
    setResult(null);
    setConsent(false);
    setError("");
  }
  async function prepare() {
    if (!session || !selected || !reason) return;
    setBusy(true);
    setError("");
    try {
      const d = await api<Draft>("drafts", "POST", {
        transactionId: selected.id,
        statement,
        reason,
      });
      setDraft(d);
      setConsent(false);
      setIdempotency(crypto.randomUUID());
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    if (!session || !draft || !consent) return;
    setBusy(true);
    setError("");
    try {
      const r = await api<{
        case: CaseView;
        replayed?: boolean;
      }>("cases", "POST", {
        draftId: draft.draftId,
        confirmationToken: draft.confirmationToken,
        idempotencyKey: idempotency,
        confirmed: true,
      });
      setResult(r.case);
      setDraft(null);
      setFault(false);
      setNotice(
        r.replayed
          ? t(
              "Respuesta recuperada. Existe un solo expediente.",
              "Resposta recuperada. Existe apenas um caso.",
            )
          : "",
      );
      await loadCases();
    } catch (e) {
      if (e instanceof ClientError && e.code === "CASE_ALREADY_EXISTS") {
        try {
          const existing = await api<{ cases: CaseView[] }>("cases");
          const original = existing.cases.find(
            (c) => c.transaction_id === draft.transaction.id,
          );
          if (!original) throw e;
          setCases(existing.cases);
          setResult(original);
          setDraft(null);
          setNotice(
            t(
              "Ya existía un caso para este movimiento. Consultamos el expediente original, sin crear otro.",
              "Já existia um caso para esta transação. Consultamos o caso original, sem criar outro.",
            ),
          );
        } catch (recoveryError) {
          setError(errorText(recoveryError));
        }
      } else setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function openCase(id: string) {
    setBusy(true);
    setError("");
    try {
      setDetail(await api<{ case: CaseView; audit: Audit[] }>("cases/" + id));
      setNote("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function updateCase(status: string) {
    if (!detail) return;
    setBusy(true);
    setError("");
    try {
      await api("cases/" + detail.case.id, "PATCH", {
        status,
        note,
        version: detail.case.version,
      });
      await openCase(detail.case.id);
      await loadCases();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function armFault() {
    try {
      await api("demo/fault", "POST", { kind: "timeout_after_commit" });
      setFault(true);
      setNotice(
        t(
          "Prueba activada: el próximo envío guardará el caso y perderá la respuesta.",
          "Teste ativado: o próximo envio salvará o caso e perderá a resposta.",
        ),
      );
    } catch (e) {
      setError(errorText(e));
    }
  }
  function downloadCase(c: CaseView) {
    const blob = new Blob(
      [
        JSON.stringify(
          { sandbox: true, financialResolution: false, case: c },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = c.id + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function changeTab(value: string) {
    setTab(value);
    setError("");
    if (session)
      try {
        await loadCases();
        if (value === "evidence")
          setMetrics(
            (await api<{ attempts: typeof metrics }>("metrics")).attempts,
          );
      } catch (e) {
        setError(errorText(e));
      }
  }
  const queryMatches =
    query.trim() && session
      ? matchTransactions({
          text: query,
          customerId: session.customer.id,
          transactions,
          snapshotAt: session.snapshot.snapshotAt,
        }).candidates.map((c) => c.id)
      : [];
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  const visible = !query.trim()
    ? transactions
    : transactions.filter(
        (tx) =>
          queryMatches.includes(tx.id) ||
          `${tx.merchant || ""} ${tx.currency} ${tx.id} ${tx.cardLast4 || ""} ${money(tx, locale)} ${(tx.amountMinor / 100).toFixed(2)}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(normalizedQuery),
      );
  const persona = session?.customer.id === "cus_c2e79604" ? "lucas" : "ana";
  const latest = metrics.map((m) => m.latency_ms).sort((a, b) => a - b);
  const percentile = (p: number) =>
    latest.length ? latest[Math.ceil(latest.length * p) - 1] + " ms" : "—";
  return (
    <main className="shell">
      <aside className="rail">
        <Link className="brand" href="/" aria-label="Reclama">
          r<span>.</span>
        </Link>
        <div className="rail-items">
          <button
            aria-label={t("Atención", "Atendimento")}
            onClick={() => void changeTab("attention")}
          >
            <MessageSquare />
          </button>
          <button
            aria-label={t("Mesa de revisión", "Mesa de análise")}
            onClick={() => void changeTab("review")}
          >
            <Layers3 />
          </button>
          <button
            aria-label={t("Evidencia", "Evidências")}
            onClick={() => void changeTab("evidence")}
          >
            <Activity />
          </button>
        </div>
        <ShieldCheck className="rail-bottom" />
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="wordmark">
            reclama<span className="brand-dot">.</span>
            <span className="topbar-divider" />
            <span className="product-label">
              {t("DISPUTAS CON EVIDENCIA", "CONTESTAÇÕES COM EVIDÊNCIAS")}
            </span>
          </div>
          <div className="topbar-right">
            <span className="sandbox-dot" />{" "}
            {t("Equipo privado", "Equipe privada")} · Factored 2026{" "}
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void changeLocale()}
            >
              <Globe2 />
              {locale.toUpperCase()}
            </Button>
          </div>
        </header>
        <div className="page-content">
          <div className="page-intro">
            <div>
              <p className="eyebrow">
                {t("ATENCIÓN CON CRITERIO", "ATENDIMENTO COM CRITÉRIO")}
              </p>
              <h1>
                {t("De un cargo desconocido", "De uma compra desconhecida")}
                <br />
                {t("a un caso claro.", "a um caso claro.")}
              </h1>
              <p className="subheading">
                {t(
                  "Revisa el movimiento y tu declaración. Conserva la evidencia.",
                  "Revise a transação e seu relato. Preserve as evidências.",
                )}
              </p>
            </div>
            <div className="trust-note">
              <ShieldCheck />
              <div>
                <strong>
                  {t("Tú confirmas cada paso", "Você confirma cada etapa")}
                </strong>
                <p>
                  {t(
                    "Sin reembolsos ni decisiones automáticas de fraude.",
                    "Sem reembolsos ou decisões automáticas de fraude.",
                  )}
                </p>
              </div>
            </div>
          </div>
          {auth !== "loading" && !session && (
            <section className="session-banner">
              <LockKeyhole />
              <div>
                <strong>
                  {t(
                    "Un espacio de prueba, solo tuyo",
                    "Um espaço de teste só seu",
                  )}
                </strong>
                <p>
                  {t(
                    "Datos ficticios en tu espacio de prueba. Acceso restringido al equipo.",
                    "Dados fictícios no seu espaço de teste. Acesso restrito à equipe.",
                  )}
                </p>
              </div>
              {auth === "login" ? (
                <Button asChild>
                  <a href="/signin-with-chatgpt?return_to=/" target="_top">
                    <LogIn />
                    {t("Entrar con ChatGPT", "Entrar com ChatGPT")}
                  </a>
                </Button>
              ) : (
                <Button disabled={busy} onClick={() => void start("ana")}>
                  {busy ? <Loader2 className="spin" /> : <ArrowRight />}
                  {t("Iniciar sandbox", "Iniciar sandbox")}
                </Button>
              )}
            </section>
          )}
          {session && (
            <section
              className="run-toolbar"
              aria-label={t(
                "Recorridos de demostración",
                "Percursos de demonstração",
              )}
            >
              <div className="run-current">
                <History size={17} />
                <span>{t("Tu recorrido", "Seu percurso")}</span>
                <Select
                  value={session.runId || "default"}
                  disabled={busy}
                  onValueChange={(id) =>
                    void start(persona, "customer", locale, id)
                  }
                >
                  <SelectTrigger
                    aria-label={t("Recorrido guardado", "Percurso salvo")}
                    className="run-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {runs.map((r, i) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.id === "default"
                          ? t("Inicial", "Inicial")
                          : `${t("Recorrido", "Percurso")} ${runs.length - i} · ${r.created_at ? date(r.created_at, locale) : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="button-row">
                <Button
                  size="sm"
                  variant={guided ? "secondary" : "outline"}
                  onClick={() => setGuided(!guided)}
                >
                  <Play size={14} />
                  {t("Guía de 3 minutos", "Guia de 3 minutos")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setNewRunOpen(true)}
                >
                  <Plus size={15} />
                  {t("Nuevo recorrido", "Novo percurso")}
                </Button>
              </div>
            </section>
          )}
          {guided && session && (
            <section
              className="guided-strip"
              aria-label={t("Pasos del recorrido", "Etapas do percurso")}
            >
              <div className={!selected && !result ? "current" : "done"}>
                <span>01</span>
                <strong>{t("Encuentra el cargo", "Encontre a compra")}</strong>
                <p>
                  {persona === "lucas"
                    ? t(
                        "Prueba «Livraria Aurora, 18.500,00 ARS» y revisa el movimiento.",
                        "Experimente «Livraria Aurora, 18.500,00 ARS» e confira a compra.",
                      )
                    : t(
                        "Prueba «Luna Digital, 84,90 USD» y compara las horas.",
                        "Experimente «Luna Digital, 84,90 USD» e compare os horários.",
                      )}
                </p>
              </div>
              <div
                className={
                  selected && !result ? "current" : result ? "done" : ""
                }
              >
                <span>02</span>
                <strong>
                  {t("Documenta y confirma", "Documente e confirme")}
                </strong>
                <p>
                  {t(
                    "Elige el motivo y revisa tu relato antes de enviar.",
                    "Escolha o motivo e revise seu relato antes de enviar.",
                  )}
                </p>
              </div>
              <div className={result ? "current" : ""}>
                <span>03</span>
                <strong>{t("Sigue la revisión", "Acompanhe a análise")}</strong>
                <p>
                  {t(
                    "Abre la mesa y verifica el expediente y su historial.",
                    "Abra a mesa e confira o caso e seu histórico.",
                  )}
                </p>
              </div>
            </section>
          )}
          {error && (
            <div role="alert" className="alert error">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                aria-label={t("Cerrar", "Fechar")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="alert notice">
              <ShieldCheck size={17} />
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                aria-label={t("Cerrar", "Fechar")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <Tabs value={tab} onValueChange={(v) => void changeTab(v)}>
            <div className="tabs-row">
              <TabsList variant="line">
                <TabsTrigger value="attention">
                  <MessageSquare />
                  {t("Atención", "Atendimento")}
                </TabsTrigger>
                <TabsTrigger value="review">
                  <Layers3 />
                  {t("Mesa de revisión", "Mesa de análise")}{" "}
                  {cases.length > 0 && (
                    <span className="count-badge">{cases.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="evidence">
                  <Activity />
                  {t("Evidencia", "Evidências")}
                </TabsTrigger>
              </TabsList>
              <span className="snapshot">
                <LockKeyhole size={12} />
                {t(
                  "Datos ficticios · corte 17 jun 2026",
                  "Dados fictícios · corte 17 jun 2026",
                )}
              </span>
            </div>
            <TabsContent value="attention">
              {session?.role === "agent" ? (
                <section className="panel empty-panel">
                  <Layers3 />
                  <h2>
                    {t(
                      "Estás en modo revisor de tu sandbox",
                      "Você está no modo revisor do seu sandbox",
                    )}
                  </h2>
                  <p>
                    {t(
                      "Vuelve a una identidad de cliente para iniciar otra solicitud.",
                      "Volte a uma identidade de cliente para iniciar outra solicitação.",
                    )}
                  </p>
                  <Button onClick={() => void start(persona)}>
                    {t("Volver a atención", "Voltar ao atendimento")}
                  </Button>
                </section>
              ) : (
                <div className="attention-grid">
                  <section className="conversation panel">
                    <div className="panel-title">
                      <div className="assistant-icon">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h2>
                          {t(
                            "Asistente de disputas",
                            "Assistente de contestações",
                          )}
                        </h2>
                        <p>
                          {locale === "es" ? "Español" : "Português"} ·{" "}
                          {t(
                            "Encuentra el movimiento y prepara tu solicitud",
                            "Encontre a transação e prepare sua solicitação",
                          )}
                        </p>
                      </div>
                      <span className="ready-dot" />
                    </div>
                    <div className="conversation-body">
                      <div className="chat-stream" aria-live="polite">
                        <div className="assistant-message">
                          <p>
                            {t(
                              `Hola${session ? ", " + session.customer.name.split(" ")[0] : ""}. Si hay un cargo que no reconoces, podemos preparar un expediente para revisión.`,
                              `Olá${session ? ", " + session.customer.name.split(" ")[0] : ""}. Se há uma compra que você não reconhece, podemos preparar um caso para análise.`,
                            )}
                          </p>
                          <p>
                            {t(
                              "Selecciona el movimiento exacto. Cuando se parecen, fecha y hora ayudan a distinguirlos.",
                              "Selecione a transação exata. Quando são parecidas, data e hora ajudam a distingui-las.",
                            )}
                          </p>
                        </div>
                        {chats.map((c, i) => (
                          <div
                            className={
                              c.side === "user"
                                ? "user-message"
                                : "assistant-message"
                            }
                            key={i}
                          >
                            <p>{c.text}</p>
                            {c.side === "user" &&
                              c.text.trim().length >= 12 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="reuse-statement"
                                  disabled={busy || !session}
                                  onClick={() => {
                                    setStatement(c.text);
                                    setDraft(null);
                                    setNotice(
                                      t(
                                        "Relato copiado sin cambios. Elige el movimiento y confirma el motivo.",
                                        "Relato copiado sem alterações. Escolha a transação e confirme o motivo.",
                                      ),
                                    );
                                  }}
                                >
                                  <ClipboardCheck size={14} />
                                  {t("Usar este relato", "Usar este relato")}
                                </Button>
                              )}
                            {c.model && (
                              <small className="model-note">
                                <Activity size={11} />
                                {c.model}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                      {assistance && (
                        <section
                          className="candidate-panel"
                          aria-label={t(
                            "Coincidencias del mensaje",
                            "Correspondências da mensagem",
                          )}
                        >
                          {assistance.candidates.length > 0 && (
                            <>
                              <div className="candidate-heading">
                                <Search size={17} />
                                {assistance.candidates.length > 1
                                  ? t(
                                      "Compara antes de elegir",
                                      "Compare antes de escolher",
                                    )
                                  : t(
                                      "Revisa esta coincidencia",
                                      "Confira esta correspondência",
                                    )}
                              </div>
                              <div className="candidate-grid">
                                {assistance.candidates.map((candidate) => (
                                  <button
                                    type="button"
                                    className="candidate-card"
                                    key={candidate.id}
                                    aria-pressed={selected?.id === candidate.id}
                                    disabled={busy || !session}
                                    onClick={() => {
                                      const tx = transactions.find(
                                        (x) => x.id === candidate.id,
                                      );
                                      if (tx) selectTx(tx);
                                    }}
                                  >
                                    <strong>
                                      {candidate.merchant ||
                                        t(
                                          "Comercio no informado",
                                          "Estabelecimento não informado",
                                        )}
                                    </strong>
                                    <span className="candidate-amount">
                                      {new Intl.NumberFormat(
                                        locale === "es" ? "es-EC" : "pt-BR",
                                        {
                                          style: "currency",
                                          currency: candidate.currency,
                                        },
                                      ).format(candidate.amountMinor / 100)}
                                    </span>
                                    <small>
                                      {date(candidate.occurredAt, locale)} ·{" "}
                                      {candidate.currency}
                                    </small>
                                    <small>
                                      {statusName(candidate.status)} · •
                                      {
                                        transactions.find(
                                          (x) => x.id === candidate.id,
                                        )?.cardLast4
                                      }
                                    </small>
                                    <span className="candidate-action">
                                      {t(
                                        "Elegir este movimiento",
                                        "Escolher esta transação",
                                      )}
                                    </span>
                                  </button>
                                ))}
                              </div>
                              <p className="candidate-caption">
                                {t(
                                  "Coincidencias con tu fuente ficticia. Ninguna transacción se selecciona automáticamente.",
                                  "Correspondências com sua fonte fictícia. Nenhuma transação é selecionada automaticamente.",
                                )}
                              </p>
                            </>
                          )}
                          <div className="assistance-next">
                            {assistance.guidance.nextStep}
                          </div>
                          {assistance.guidance.code ===
                            "selection_conflict" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelected(null);
                                setDraft(null);
                                setReason("");
                                setConsent(false);
                              }}
                            >
                              {t("Revisar la selección", "Rever a seleção")}
                            </Button>
                          )}
                        </section>
                      )}
                      {chats.length === 0 && (
                        <div className="suggestions">
                          <Button
                            variant="outline"
                            disabled={!session || busy}
                            onClick={() =>
                              void send(
                                persona === "lucas"
                                  ? t(
                                      "No reconozco una compra de 18.500,00 ARS en Livraria Aurora.",
                                      "Não reconheço uma compra de 18.500,00 ARS na Livraria Aurora.",
                                    )
                                  : t(
                                      "No reconozco una compra de 84,90 USD en Luna Digital.",
                                      "Não reconheço uma compra de 84,90 USD na Luna Digital.",
                                    ),
                              )
                            }
                          >
                            {t(
                              "No reconozco un cargo",
                              "Não reconheço uma compra",
                            )}
                            <ArrowUpRight />
                          </Button>
                        </div>
                      )}
                      {result ? (
                        <div className="success-card" role="status">
                          <FileCheck2 />
                          <h3>{t("Expediente recibido", "Caso recebido")}</h3>
                          <strong className="case-code">{result.id}</strong>
                          <p>
                            {t(
                              "Solicitud recibida. El equipo revisará el movimiento y tu declaración. No implica que se haya autorizado un reembolso.",
                              "Solicitação recebida. A equipe analisará a transação e seu relato. Não significa que um reembolso foi autorizado.",
                            )}
                          </p>
                          <dl className="receipt-details">
                            <div>
                              <dt>{t("Movimiento", "Transação")}</dt>
                              <dd>
                                {result.facts.merchant ||
                                  t("Sin comercio", "Sem estabelecimento")}{" "}
                                · {money(result.facts, locale)}
                              </dd>
                            </div>
                            <div>
                              <dt>{t("Recibido", "Recebido")}</dt>
                              <dd>{date(result.created_at, locale)}</dd>
                            </div>
                            <div>
                              <dt>{t("Siguiente paso", "Próxima etapa")}</dt>
                              <dd>{t("Revisión humana", "Análise humana")}</dd>
                            </div>
                          </dl>
                          <div className="button-row">
                            <Button
                              size="sm"
                              onClick={() => void openCase(result.id)}
                            >
                              {t("Ver expediente", "Ver caso")}
                              <ChevronRight />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setResult(null);
                                setSelected(null);
                                setStatement("");
                                setReason("");
                              }}
                            >
                              {t("Otra solicitud", "Outra solicitação")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        selected && (
                          <section className="intake-form">
                            <div className="selected-summary">
                              <Check size={15} />
                              <span>
                                {selected.merchant ||
                                  t(
                                    "Comercio no informado",
                                    "Estabelecimento não informado",
                                  )}{" "}
                                · {money(selected, locale)} ·{" "}
                                {date(selected.occurredAt, locale)}
                              </span>
                            </div>
                            {selected.status !== "Approved" && (
                              <div className="inline-warning">
                                <AlertCircle size={15} />
                                {t(
                                  "Este estado requiere revisión. Crearemos una solicitud de soporte, sin afirmar que existe un cargo definitivo.",
                                  "Este estado exige análise. Criaremos uma solicitação de suporte sem afirmar que existe uma cobrança definitiva.",
                                )}
                              </div>
                            )}
                            <label htmlFor="reason">
                              {t("Confirma el motivo", "Confirme o motivo")}
                            </label>
                            <Select
                              value={reason}
                              onValueChange={(v) => {
                                setReason(v);
                                setDraft(null);
                              }}
                            >
                              <SelectTrigger id="reason" className="w-full">
                                <SelectValue
                                  placeholder={t(
                                    "Selecciona un motivo",
                                    "Selecione um motivo",
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {reasons.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {reasonName(r)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <label htmlFor="statement">
                              {t("Tu declaración", "Seu relato")}
                            </label>
                            <Textarea
                              id="statement"
                              placeholder={t(
                                "Describe qué no reconoces y cualquier detalle que ayude. No incluyas datos secretos.",
                                "Descreva o que não reconhece e detalhes que possam ajudar. Não informe dados secretos.",
                              )}
                              value={statement}
                              maxLength={2000}
                              onChange={(e) => {
                                setStatement(e.target.value);
                                setDraft(null);
                              }}
                            />
                            <div className="field-hint">
                              {t(
                                "Se conserva como tu afirmación, no como un hecho confirmado.",
                                "Será preservado como seu relato, não como fato confirmado.",
                              )}
                              <span>{statement.length}/2000</span>
                            </div>
                            <Button
                              className="prepare-button"
                              disabled={
                                busy ||
                                !session ||
                                assistance?.guidance.code ===
                                  "selection_conflict" ||
                                !reason ||
                                statement.trim().length < 12
                              }
                              onClick={() => void prepare()}
                            >
                              {busy ? (
                                <Loader2 className="spin" />
                              ) : (
                                <FileCheck2 />
                              )}
                              {t(
                                "Revisar antes de enviar",
                                "Revisar antes de enviar",
                              )}
                              <ArrowRight />
                            </Button>
                          </section>
                        )
                      )}
                      <div className="flow-steps">
                        <div className={!selected ? "active" : ""}>
                          <span>{selected ? <Check size={11} /> : 1}</span>
                          {t("Identificar", "Identificar")}
                        </div>
                        <div className={selected && !result ? "active" : ""}>
                          <span>2</span>
                          {t("Documentar", "Documentar")}
                        </div>
                        <div className={result ? "active" : ""}>
                          <span>{result ? <Check size={11} /> : 3}</span>
                          {t("Confirmar", "Confirmar")}
                        </div>
                      </div>
                    </div>
                    <form
                      className="composer"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void send();
                      }}
                    >
                      <Input
                        aria-label={t(
                          "Mensaje al asistente",
                          "Mensagem ao assistente",
                        )}
                        value={text}
                        maxLength={2000}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t(
                          "Cuéntame qué ocurrió…",
                          "Conte o que aconteceu…",
                        )}
                        disabled={!session || busy}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!session || busy || !text.trim()}
                        aria-label={t("Enviar mensaje", "Enviar mensagem")}
                      >
                        {busy ? <Loader2 className="spin" /> : <Send />}
                      </Button>
                    </form>
                    <p className="composer-note">
                      {t(
                        "Nunca compartas tu PIN, CVV o contraseña.",
                        "Nunca compartilhe seu PIN, CVV ou senha.",
                      )}
                    </p>
                  </section>
                  <section className="transactions panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">
                          {t("TU EVIDENCIA", "SUAS EVIDÊNCIAS")}
                        </p>
                        <h2>
                          {t("Movimientos recientes", "Transações recentes")}
                        </h2>
                      </div>
                      <CreditCard size={22} />
                    </div>
                    <div className="account-strip">
                      <span className="avatar">
                        {session?.customer.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("") || "—"}
                      </span>
                      <div>
                        <strong>
                          {session?.customer.name ||
                            t("Sesión no iniciada", "Sessão não iniciada")}
                        </strong>
                        <p>
                          {t(
                            "Identidad ficticia de prueba",
                            "Identidade fictícia de teste",
                          )}
                        </p>
                      </div>
                      {session && (
                        <Select
                          value={persona}
                          onValueChange={(v) =>
                            void start(
                              v as "ana" | "lucas",
                              "customer",
                              v === "lucas" ? "pt" : "es",
                            )
                          }
                          disabled={busy}
                        >
                          <SelectTrigger
                            aria-label={t(
                              "Identidad de demostración",
                              "Identidade de demonstração",
                            )}
                            className="persona-select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ana">Ana · ES</SelectItem>
                            <SelectItem value="lucas">Lucas · PT</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="search-field">
                      <Search size={15} />
                      <Input
                        aria-label={t(
                          "Filtrar movimientos",
                          "Filtrar transações",
                        )}
                        placeholder={t(
                          "Buscar comercio, importe o moneda",
                          "Buscar estabelecimento, valor ou moeda",
                        )}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="transaction-list">
                      {visible.map((tx) => (
                        <button
                          className={`transaction ${selected?.id === tx.id ? "selected" : ""}`}
                          key={tx.id}
                          onClick={() => selectTx(tx)}
                          disabled={busy || !session}
                          aria-pressed={selected?.id === tx.id}
                        >
                          <span className="merchant-icon">
                            {tx.merchant?.charAt(0) || "?"}
                          </span>
                          <span className="transaction-detail">
                            <strong>
                              {tx.merchant ||
                                t(
                                  "Comercio no informado",
                                  "Estabelecimento não informado",
                                )}
                            </strong>
                            <small>
                              {date(tx.occurredAt, locale)} · •{tx.cardLast4}
                            </small>
                            <small
                              className={
                                tx.status === "Approved"
                                  ? "status-good"
                                  : "status-warn"
                              }
                            >
                              {statusName(tx.status)}
                            </small>
                          </span>
                          <span className="transaction-amount">
                            {money(tx, locale)}
                            <small>{tx.currency}</small>
                          </span>
                          <span className="selection-ring">
                            {selected?.id === tx.id && <Check size={12} />}
                          </span>
                        </button>
                      ))}
                      {!visible.length && (
                        <div className="empty-transactions">
                          {t(
                            session
                              ? "No hay coincidencias."
                              : "Inicia la sesión para ver movimientos ficticios.",
                            session
                              ? "Nenhum resultado."
                              : "Inicie a sessão para ver transações fictícias.",
                          )}
                        </div>
                      )}
                    </div>
                    <div className="evidence-note">
                      <Search size={16} />
                      <p>
                        {t(
                          "Dos movimientos similares no prueban un cobro duplicado. La selección siempre es explícita.",
                          "Duas transações semelhantes não comprovam cobrança duplicada. A seleção é sempre explícita.",
                        )}
                      </p>
                    </div>
                    <div className="source-strip">
                      <span>{t("FUENTE", "FONTE")}: reclama-demo-v1</span>
                      <span>17 JUN 2026 · UTC−5</span>
                    </div>
                  </section>
                </div>
              )}
              {session && (
                <div className="sandbox-tools">
                  <FlaskConical size={14} />
                  <strong>
                    {t(
                      "Laboratorio de resiliencia",
                      "Laboratório de resiliência",
                    )}
                  </strong>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy || fault || session.role !== "customer"}
                    onClick={() => void armFault()}
                  >
                    {fault
                      ? t("Fallo activado", "Falha ativada")
                      : t(
                          "Simular pérdida de respuesta",
                          "Simular perda de resposta",
                        )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={async () => {
                      try {
                        await api("demo/fault", "POST", { kind: "expire" });
                        clearContext();
                        setSession(null);
                        setNotice(
                          t(
                            "Sesión expirada intencionalmente. El servidor rechazará acciones con ella.",
                            "Sessão expirada intencionalmente. O servidor rejeitará ações com ela.",
                          ),
                        );
                      } catch (e) {
                        setError(errorText(e));
                      }
                    }}
                  >
                    {t("Expirar sesión", "Expirar sessão")}
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="review">
              <section className="panel review-panel">
                <div className="review-heading">
                  <div>
                    <p className="eyebrow">
                      {t("DEL RELATO AL EXPEDIENTE", "DO RELATO AO CASO")}
                    </p>
                    <h2>
                      {t(
                        "Cada hecho tiene una fuente.",
                        "Cada fato tem uma fonte.",
                      )}
                    </h2>
                    <p>
                      {t(
                        "Solo casos de tu espacio de demostración. El rol revisor es simulado.",
                        "Apenas casos do seu espaço de demonstração. O papel de revisor é simulado.",
                      )}
                    </p>
                  </div>
                  {session && (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void start(
                          persona,
                          session.role === "agent" ? "customer" : "agent",
                        )
                      }
                    >
                      {session.role === "agent"
                        ? t("Volver a cliente", "Voltar ao cliente")
                        : t(
                            "Entrar como revisor demo",
                            "Entrar como revisor demo",
                          )}
                      <ArrowRight />
                    </Button>
                  )}
                </div>
                {cases.length === 0 ? (
                  <div className="empty-panel">
                    <Layers3 />
                    <h2>
                      {t("Todavía no hay expedientes", "Ainda não há casos")}
                    </h2>
                    <p>
                      {t(
                        "Completa y confirma una solicitud en Atención. Aparecerá aquí después de guardarse.",
                        "Conclua e confirme uma solicitação em Atendimento. Ela aparecerá aqui após ser salva.",
                      )}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => void changeTab("attention")}
                    >
                      {t("Ir a atención", "Ir ao atendimento")}
                    </Button>
                  </div>
                ) : (
                  <div className="case-list">
                    {cases.map((c) => (
                      <button
                        key={c.id}
                        className="case-row"
                        onClick={() => void openCase(c.id)}
                      >
                        <div className="assistant-icon">
                          <FileCheck2 size={20} />
                        </div>
                        <div>
                          <strong>
                            {c.facts.merchant ||
                              t(
                                "Comercio no informado",
                                "Estabelecimento não informado",
                              )}
                          </strong>
                          <p>
                            {c.id} · {reasonName(c.reason)}
                          </p>
                          <p>
                            {t("Recibido", "Recebido")} ·{" "}
                            {date(c.created_at, locale)}
                          </p>
                        </div>
                        <span className="case-money">
                          {money(c.facts, locale)}
                        </span>
                        <span className="status-pill">
                          {statusName(c.status)}
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>
            <TabsContent value="evidence">
              <div className="evidence-heading">
                <p className="eyebrow">
                  {t("EVIDENCIA, NO PROMESAS", "EVIDÊNCIAS, NÃO PROMESSAS")}
                </p>
                <h2>
                  {t(
                    "Lo que medimos. Lo que todavía no sabemos.",
                    "O que medimos. O que ainda não sabemos.",
                  )}
                </h2>
                <p>
                  {t(
                    "Resultados observados; las pruebas sintéticas no demuestran seguridad en un banco real.",
                    "Resultados observados; testes sintéticos não demonstram segurança em um banco real.",
                  )}
                </p>
              </div>
              <div className="metric-grid">
                <Metric
                  value="48.810"
                  label={t(
                    "Transacciones con propietario coherente",
                    "Transações com titular coerente",
                  )}
                  detail={t(
                    "Muestra oficial · 12 cortes temporales",
                    "Amostra oficial · 12 cortes temporais",
                  )}
                />
                <Metric
                  value="10.903"
                  label={t(
                    "Compras de tarjeta aprobadas",
                    "Compras aprovadas de cartão",
                  )}
                  detail={t(
                    "531 sin comercio identificado",
                    "531 sem estabelecimento identificado",
                  )}
                />
                <Metric
                  value="448"
                  label={t(
                    "Enlaces históricos en cuarentena",
                    "Vínculos históricos em quarentena",
                  )}
                  detail={t(
                    "Queja y producto con distinto propietario",
                    "Reclamação e produto com titulares diferentes",
                  )}
                />
                <Metric
                  value="0"
                  label={t(
                    "Registros certificados en vivo",
                    "Registros certificados em tempo real",
                  )}
                  detail={t(
                    "Corte y sandbox siempre visibles",
                    "Corte e sandbox sempre visíveis",
                  )}
                />
              </div>
              <div className="evidence-grid">
                <section className="panel evidence-card">
                  <Activity />
                  <h3>
                    {t(
                      "Un modelo orientativo, con límites medidos",
                      "Um modelo orientativo, com limites medidos",
                    )}
                  </h3>
                  <p>
                    {t(
                      "TF-IDF de caracteres + regresión logística. Ocho intenciones; 256 mensajes reservados, creados por IA independientemente del entrenamiento. Revisión humana pendiente.",
                      "TF-IDF de caracteres + regressão logística. Oito intenções; 256 mensagens reservadas, criadas por IA independentemente do treino. Revisão humana pendente.",
                    )}
                  </p>
                  <div className="comparison">
                    <div>
                      <span>
                        {t(
                          "Modelo · aciertos en casos reservados",
                          "Modelo · acertos em casos reservados",
                        )}
                      </span>
                      <strong>218 / 256</strong>
                      <div style={{ width: "85.15625%" }} />
                    </div>
                    <div>
                      <span>
                        {t("Reglas · mismos casos", "Regras · mesmos casos")}
                      </span>
                      <strong>168 / 256</strong>
                      <div style={{ width: "65.625%" }} />
                    </div>
                  </div>
                  <div className="inline-warning">
                    <AlertCircle size={17} />
                    {t(
                      "La exactitud global no autoriza acciones: solo reconoce 9 de 32 casos «other». La apertura autónoma quedó deshabilitada; tú confirmas el motivo.",
                      "A acurácia global não autoriza ações: reconhece apenas 9 de 32 casos «other». A abertura autônoma ficou desativada; você confirma o motivo.",
                    )}
                  </div>
                  <details>
                    <summary>
                      {t(
                        "Procedencia y reproducción",
                        "Procedência e reprodução",
                      )}
                    </summary>
                    <p>
                      {modelReport.experiment} ·{" "}
                      {t(
                        "634 entrenamiento / 128 validación / 256 reservados. Modelo y protocolo congelados antes de evaluar. Exactitud: ES 85,94%; PT 84,38%. Son etiquetas sintéticas, no resultados de un banco real.",
                        "634 treino / 128 validação / 256 reservados. Modelo e protocolo congelados antes da avaliação. Acurácia: ES 85,94%; PT 84,38%. São rótulos sintéticos, não resultados de um banco real.",
                      )}
                    </p>
                  </details>
                </section>
                <section className="panel evidence-card">
                  <ShieldCheck />
                  <h3>
                    {t(
                      "Límites que el servidor hace cumplir",
                      "Limites impostos pelo servidor",
                    )}
                  </h3>
                  <ul className="guardrail-list">
                    {[
                      t(
                        "Identidad de plataforma + sesión opaca con vencimiento.",
                        "Identidade da plataforma + sessão opaca com expiração.",
                      ),
                      t(
                        "Propietario validado en lectura y escritura.",
                        "Titular validado na leitura e na gravação.",
                      ),
                      t(
                        "Confirmación ligada al resumen inmutable y su evidencia.",
                        "Confirmação vinculada ao resumo imutável e às evidências.",
                      ),
                      t(
                        "Un caso por movimiento; reintentos recuperan el original.",
                        "Um caso por transação; novas tentativas recuperam o original.",
                      ),
                      t(
                        "Auditoría atómica y control de versiones en revisión.",
                        "Auditoria atômica e controle de versões na análise.",
                      ),
                    ].map((x) => (
                      <li key={x}>
                        <Check size={15} />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <p className="boundary-note">
                    {t(
                      "Recibir un expediente no resuelve la disputa financiera. No hay transferencia, bloqueo ni reembolso.",
                      "Receber um caso não resolve a contestação financeira. Não há transferência, bloqueio ou reembolso.",
                    )}
                  </p>
                </section>
              </div>
              <section className="panel runtime-card">
                <div>
                  <p className="eyebrow">
                    {t(
                      "OBSERVACIÓN DE TU SANDBOX",
                      "OBSERVAÇÃO DO SEU SANDBOX",
                    )}
                  </p>
                  <h3>
                    {t(
                      "Latencia registrada del servidor",
                      "Latência registrada do servidor",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Últimos 200 registros de mensajes y creación. No incluye red ni todos los errores; no es una evaluación reservada.",
                      "Últimos 200 registros de mensagens e criação. Não inclui rede nem todos os erros; não é uma avaliação reservada.",
                    )}
                  </p>
                </div>
                <div className="runtime-number">
                  <strong>{percentile(0.5)}</strong>
                  <span>p50</span>
                </div>
                <div className="runtime-number">
                  <strong>{percentile(0.95)}</strong>
                  <span>p95</span>
                </div>
                <div className="runtime-number">
                  <strong>{metrics.length}</strong>
                  <span>{t("registros", "registros")}</span>
                </div>
              </section>
              <details className="data-provenance">
                <summary>
                  {t(
                    "Fuentes y alcance de los datos",
                    "Fontes e escopo dos dados",
                  )}
                </summary>
                <p>
                  {t(
                    "50 archivos oficiales, muestra temporal no aleatoria. La demo usa 12 compras totalmente inventadas; no se publica ninguna fila original.",
                    "50 arquivos oficiais, amostra temporal não aleatória. A demo usa 12 compras totalmente inventadas; nenhuma linha original é publicada.",
                  )}
                </p>
                <p>
                  {t(
                    "Coste de API externa de inferencia: 0 llamadas. Infraestructura y coste total no instrumentados.",
                    "Custo de API externa de inferência: 0 chamadas. Infraestrutura e custo total não instrumentados.",
                  )}
                </p>
                {dataReport.officialSources.map((s) => (
                  <a href={s.url} target="_blank" rel="noreferrer" key={s.url}>
                    {s.label}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </details>
            </TabsContent>
          </Tabs>
          <footer className="page-footer">
            <span>RECLAMA / FACTORED AI & DATA HACKATHON 2026</span>
            <span>
              {t(
                "Hechos separados de afirmaciones. Siempre.",
                "Fatos separados de relatos. Sempre.",
              )}
            </span>
          </footer>
        </div>
      </div>
      <Dialog
        open={!!draft}
        onOpenChange={(v) => {
          if (!v && !busy) {
            setDraft(null);
            setError("");
          }
        }}
      >
        <DialogContent
          className="review-dialog"
          closeLabel={t("Cerrar", "Fechar")}
        >
          <DialogHeader>
            <DialogTitle>
              {t(
                "Confirma exactamente lo que enviaremos",
                "Confirme exatamente o que será enviado",
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Este resumen es inmutable. Para corregirlo, vuelve al formulario.",
                "Este resumo é imutável. Para corrigir, volte ao formulário.",
              )}
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <>
              <EvidenceFacts tx={draft.transaction} locale={locale} />
              <div className="statement-block">
                <p className="eyebrow">
                  {t(
                    "TU DECLARACIÓN · SIN VERIFICAR",
                    "SEU RELATO · NÃO VERIFICADO",
                  )}
                </p>
                <p>{draft.statement}</p>
                <small>{reasonName(draft.reason)}</small>
              </div>
              <div className="unknown-block">
                <p className="eyebrow">
                  {t("LO QUE AÚN NO SABEMOS", "O QUE AINDA NÃO SABEMOS")}
                </p>
                <p>
                  {t(
                    "Quién autorizó la compra, qué evidencia tiene el comercio y si corresponde un reembolso. Tu confirmación abre una revisión; no verifica estos puntos.",
                    "Quem autorizou a compra, quais evidências o estabelecimento possui e se cabe reembolso. Sua confirmação inicia uma análise; não verifica esses pontos.",
                  )}
                </p>
              </div>
              <div className="inline-warning">
                <AlertCircle size={16} />
                {draft.kind === "dispute_intake"
                  ? t(
                      "Se registrará una reclamación para revisión humana. No implica fraude confirmado ni reembolso.",
                      "Será registrada uma contestação para análise humana. Não implica fraude confirmado nem reembolso.",
                    )
                  : t(
                      "Se registrará una solicitud de soporte para revisión humana.",
                      "Será registrada uma solicitação de suporte para análise humana.",
                    )}
              </div>
              <label className="consent-row">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  disabled={busy}
                />
                <span>
                  {t(
                    "Confirmo este movimiento, motivo y declaración. Autorizo registrar este expediente ficticio.",
                    "Confirmo esta transação, motivo e relato. Autorizo o registro deste caso fictício.",
                  )}
                </span>
              </label>
              {error && (
                <p role="alert" className="dialog-error">
                  {error}
                </p>
              )}
              <Button
                disabled={!session || !consent || busy}
                onClick={() => void confirm()}
              >
                {busy ? <Loader2 className="spin" /> : <ShieldCheck />}
                {error
                  ? t(
                      "Reintentar misma solicitud",
                      "Repetir a mesma solicitação",
                    )
                  : t("Confirmar y registrar", "Confirmar e registrar")}
              </Button>
              <small className="dialog-caption">
                {t(
                  "Válido 10 minutos · no se mueve dinero",
                  "Válido por 10 minutos · não movimenta dinheiro",
                )}
              </small>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={newRunOpen} onOpenChange={setNewRunOpen}>
        <DialogContent closeLabel={t("Cerrar", "Fechar")}>
          <DialogHeader>
            <DialogTitle>
              {t("Un recorrido limpio", "Um novo percurso")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Tendrás las mismas transacciones ficticias para repetir la demostración. Los casos anteriores se conservan y puedes recuperarlos desde el selector de recorridos. Se descartará cualquier formulario que aún no hayas confirmado.",
                "Você terá as mesmas transações fictícias para repetir a demonstração. Os casos anteriores são preservados e podem ser recuperados pelo seletor de percursos. Formulários ainda não confirmados serão descartados.",
              )}
            </DialogDescription>
          </DialogHeader>
          <Button disabled={busy} onClick={() => void newRun()}>
            {busy ? <Loader2 className="spin" /> : <Plus />}
            {t("Crear recorrido", "Criar percurso")}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!detail}
        onOpenChange={(v) => {
          if (!v) setDetail(null);
        }}
      >
        <DialogContent
          className="case-dialog"
          closeLabel={t("Cerrar", "Fechar")}
        >
          <DialogHeader>
            <DialogTitle>
              {detail?.case.id}{" "}
              <span className="status-pill">
                {detail && statusName(detail.case.status)}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t(
                "Expediente de sandbox · revisión humana pendiente",
                "Caso de sandbox · análise humana pendente",
              )}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <>
              <EvidenceFacts tx={detail.case.facts} locale={locale} />
              <div className="statement-block">
                <p className="eyebrow">
                  {t(
                    "DECLARACIÓN DEL CLIENTE · SIN VERIFICAR",
                    "RELATO DO CLIENTE · NÃO VERIFICADO",
                  )}
                </p>
                <p>{detail.case.statement}</p>
                <small>{reasonName(detail.case.reason)}</small>
              </div>
              <div className="unknown-block">
                <p className="eyebrow">
                  {t("PENDIENTE DE INVESTIGACIÓN", "AGUARDANDO INVESTIGAÇÃO")}
                </p>
                <p>
                  {t(
                    "Autorización real de la compra, evidencia del comercio y procedencia de reembolso. El sistema no infiere estos resultados.",
                    "Autorização real da compra, evidências do estabelecimento e cabimento de reembolso. O sistema não infere esses resultados.",
                  )}
                </p>
              </div>
              <div className="audit-trail">
                <p className="eyebrow">
                  {t("RASTRO DE AUDITORÍA", "TRILHA DE AUDITORIA")}
                </p>
                {detail.audit.map((a, i) => (
                  <div key={i}>
                    <span className="audit-dot" />
                    <strong>
                      {a.event === "case_received"
                        ? t("Recepción confirmada", "Recebimento confirmado")
                        : t("Revisión actualizada", "Análise atualizada")}
                    </strong>
                    <span>
                      {date(a.created_at, locale)} · v{a.version}
                    </span>
                  </div>
                ))}
              </div>
              {detail.case.note && (
                <div className="review-note">
                  <strong>{t("Nota de revisión", "Nota de análise")}</strong>
                  <p>{detail.case.note}</p>
                </div>
              )}
              {session?.role === "agent" && (
                <div className="agent-form">
                  <label htmlFor="agent-note">
                    {t(
                      "Nota para el siguiente revisor",
                      "Nota para o próximo revisor",
                    )}
                  </label>
                  <Textarea
                    id="agent-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                    placeholder={t(
                      "Documenta el siguiente paso sin afirmar un resultado financiero.",
                      "Documente o próximo passo sem afirmar um resultado financeiro.",
                    )}
                  />
                  <div className="button-row">
                    <Button
                      disabled={busy || note.trim().length < 12}
                      onClick={() => void updateCase("in_review")}
                    >
                      {t("Marcar en revisión", "Marcar em análise")}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy || note.trim().length < 12}
                      onClick={() => void updateCase("needs_information")}
                    >
                      {t(
                        "Marcar que falta información",
                        "Marcar informações pendentes",
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {error && (
                <p className="dialog-error" role="alert">
                  {error}
                </p>
              )}
              <Button
                variant="outline"
                onClick={() => downloadCase(detail.case)}
              >
                <Download />
                {t("Descargar expediente JSON", "Baixar caso JSON")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
function Metric({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <section className="panel metric-card">
      <strong>{value}</strong>
      <h3>{label}</h3>
      <p>{detail}</p>
    </section>
  );
}
function EvidenceFacts({ tx, locale }: { tx: Tx; locale: Locale }) {
  const t = (es: string, pt: string) => (locale === "es" ? es : pt);
  return (
    <div className="facts-block">
      <p className="eyebrow">
        <ShieldCheck size={13} />
        {t("HECHOS DE LA FUENTE FICTICIA", "FATOS DA FONTE FICTÍCIA")}
      </p>
      <div className="facts-main">
        <strong>
          {tx.merchant ||
            t("Comercio no informado", "Estabelecimento não informado")}
        </strong>
        <span>{money(tx, locale)}</span>
      </div>
      <dl>
        <div>
          <dt>{t("Fecha · Ecuador UTC−5", "Data · Equador UTC−5")}</dt>
          <dd>{date(tx.occurredAt, locale)}</dd>
        </div>
        <div>
          <dt>{t("Estado original", "Estado original")}</dt>
          <dd>
            {statusLabels[tx.status]
              ? t(...statusLabels[tx.status])
              : tx.status}
          </dd>
        </div>
        <div>
          <dt>{t("Movimiento", "Transação")}</dt>
          <dd>{tx.id}</dd>
        </div>
        <div>
          <dt>{t("Referencia de origen", "Referência da origem")}</dt>
          <dd>{tx.sourceRef}</dd>
        </div>
      </dl>
      <small>
        {tx.sourceVersion} ·{" "}
        {t(
          "Corte 17 jun 2026; no está en vivo",
          "Corte 17 jun 2026; sem dados em tempo real",
        )}
      </small>
    </div>
  );
}
