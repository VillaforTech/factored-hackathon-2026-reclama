"use client";
import { useCallback, useEffect, useState } from "react";
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
  api,
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
import { useWebMCP } from "@/lib/use-webmcp";
import dataReport from "@/lib/data/data-report.json";
import modelReport from "@/lib/data/model-report.json";

type Chat = { side: "assistant" | "user"; text: string; model?: string };
const reasons = ["unrecognized", "duplicate", "merchant_issue", "other"];
export default function Home() {
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
  const statusName = (s: string) =>
    ({
      Approved: t("Registrado", "Registrada"),
      Pending: t("Pendiente", "Pendente"),
      Reversed: t("Reversado", "Revertida"),
      Declined: t("Rechazado", "Recusada"),
      received: t("Recibido", "Recebida"),
      in_review: t("En revisión", "Em análise"),
      needs_information: t("Información solicitada", "Informações solicitadas"),
    })[s] || s;
  function errorText(e: unknown) {
    const code = e instanceof ClientError ? e.code : "SERVICE_UNAVAILABLE";
    const map: Record<string, [string, string]> = {
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
    if (code === "SESSION_EXPIRED") {
      setSession(null);
      setAuth("ready");
    }
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
  const loadCases = useCallback(async () => {
    const r = await api<{ cases: CaseView[] }>("cases");
    setCases(r.cases);
  }, []);
  useEffect(() => {
    let cancelled = false;
    api<SessionView>("session")
      .then(async (s) => {
        if (cancelled) return;
        setSession(s);
        setLocale(s.locale);
        setAuth("ready");
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
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  async function start(
    persona: "ana" | "lucas",
    role: "customer" | "agent" = "customer",
    lang: Locale = locale,
  ) {
    setBusy(true);
    setError("");
    try {
      const s = await api<SessionView>("session", "POST", {
        persona,
        role,
        locale: lang,
      });
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
      await loadCases();
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
    if (!value.trim() || busy) return;
    setBusy(true);
    setError("");
    setChats((c) => [...c, { side: "user", text: value }]);
    setText("");
    try {
      const r = await api<{
        message: string;
        abstain: boolean;
        modelVersion: string;
      }>("message", "POST", { text: value });
      setChats((c) => [
        ...c,
        {
          side: "assistant",
          text: r.message,
          model: r.abstain
            ? t("Modelo: pide aclaración", "Modelo: pede esclarecimento")
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
    setSelected(tx);
    setDraft(null);
    setResult(null);
    setConsent(false);
    setError("");
  }
  async function prepare() {
    if (!selected || !reason) return;
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
    if (!draft || !consent) return;
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
  const visible = transactions.filter((x) =>
    (
      (x.merchant || "") +
      " " +
      x.currency +
      " " +
      x.id +
      " " +
      x.amountMinor / 100
    )
      .toLowerCase()
      .includes(query.toLowerCase()),
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
            <span className="sandbox-dot" /> Sandbox · Factored 2026{" "}
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() =>
                session
                  ? void start(
                      persona,
                      session.role,
                      locale === "es" ? "pt" : "es",
                    )
                  : setLocale(locale === "es" ? "pt" : "es")
              }
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
                  "Identifica el movimiento. Confirma los hechos. Conserva la evidencia.",
                  "Identifique a transação. Confirme os fatos. Preserve as evidências.",
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
                    "Identidades y movimientos ficticios. Cada cuenta tiene su propio espacio aislado.",
                    "Identidades e transações fictícias. Cada conta tem seu próprio espaço isolado.",
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
                            "clasificador aprendido + flujo verificado",
                            "classificador treinado + fluxo verificado",
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
                            {c.model && (
                              <small className="model-note">
                                <Activity size={11} />
                                {c.model}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                      {chats.length === 0 && (
                        <div className="suggestions">
                          <Button
                            variant="outline"
                            disabled={!session || busy}
                            onClick={() =>
                              void send(
                                t(
                                  "No reconozco un cargo de Luna Digital.",
                                  "Não reconheço uma compra da Livraria Aurora.",
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
                              "Guardado y leído de vuelta. Pendiente de revisión humana; no es una resolución ni una promesa de reembolso.",
                              "Salvo e verificado após a gravação. Aguarda análise humana; não é uma resolução nem uma promessa de reembolso.",
                            )}
                          </p>
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
                                busy || !reason || statement.trim().length < 12
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
                        "Nunca compartilhe sua senha ou CVV.",
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
                        setSession(null);
                        setDraft(null);
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
                      "Un modelo que reconoce sus límites",
                      "Um modelo que reconhece seus limites",
                    )}
                  </h3>
                  <p>
                    {t(
                      "TF-IDF + regresión logística. Ocho intenciones, corpus sintético ES/PT creado por IA, sin revisión humana.",
                      "TF-IDF + regressão logística. Oito intenções, corpus sintético ES/PT criado por IA, sem revisão humana.",
                    )}
                  </p>
                  <div className="comparison">
                    <div>
                      <span>
                        {t(
                          "Modelo · aciertos exploratorios",
                          "Modelo · acertos exploratórios",
                        )}
                      </span>
                      <strong>46 / 64</strong>
                      <div style={{ width: "71.875%" }} />
                    </div>
                    <div>
                      <span>
                        {t("Reglas · mismos casos", "Regras · mesmos casos")}
                      </span>
                      <strong>43 / 64</strong>
                      <div style={{ width: "67.1875%" }} />
                    </div>
                  </div>
                  <div className="inline-warning">
                    <AlertCircle size={17} />
                    {t(
                      "No demuestra superioridad: macro-F1 ligeramente peor. El modelo orienta; la persona confirma el motivo.",
                      "Não demonstra superioridade: macro-F1 ligeiramente menor. O modelo orienta; a pessoa confirma o motivo.",
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
                        "192 entrenamiento / 64 validación / 64 exploratorios. Familias ES/PT separadas. Diez vectores de paridad Python/JS.",
                        "192 treino / 64 validação / 64 exploratórios. Famílias ES/PT separadas. Dez vetores de paridade Python/JS.",
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
                disabled={!consent || busy}
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
                      {t("Solicitar información", "Solicitar informações")}
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
          <dd>{tx.status}</dd>
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
