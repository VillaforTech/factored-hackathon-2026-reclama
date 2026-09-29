/**
 * Grounded candidate discovery, never transaction selection or banking action.
 * This module is deliberately independent of the frozen learned classifier.
 * Amount/date/merchant matches are literal hints, not an understanding of intent.
 */
export type AssistantLocale = "es" | "pt";
export type AssistantTransaction = {
  id: string;
  customerId: string;
  merchant: string | null;
  amountMinor: number;
  currency: string;
  occurredAt: string;
  status: string;
  cardLast4?: string;
};
export type AssistantReason =
  "unrecognized" | "duplicate" | "merchant_issue" | "other";
export type MatchInput = {
  text: string;
  customerId: string;
  transactions: readonly AssistantTransaction[];
  snapshotAt: string;
};
export type AssistantInput = MatchInput & {
  locale: AssistantLocale;
  selectedTransactionId?: string | null;
  confirmedReason?: string | null;
  /** Raw learned-model hypothesis; never grants workflow authority. */
  intentHint?: string | null;
};
export type MatchField = "amount" | "currency" | "merchant" | "card" | "date";
export type AssistantCandidate = Pick<
  AssistantTransaction,
  "id" | "merchant" | "amountMinor" | "currency" | "occurredAt" | "status"
> & {
  matchedBy: MatchField[];
};
export type ExtractedHints = {
  amountsMinor: number[];
  currencies: string[];
  merchantTerms: string[];
  cardLast4: string[];
  dates: string[];
  warnings: string[];
};
export type AssistantState =
  | "needs_transaction"
  | "multiple_candidates"
  | "no_match"
  | "needs_reason"
  | "ready_for_draft"
  | "support_handoff"
  | "source_unavailable"
  | "invalid_selection";
export type AssistantResult = {
  version: "reclama-assistant-v3";
  state: AssistantState;
  extracted: ExtractedHints;
  candidates: AssistantCandidate[];
  selectedTransactionId: string | null;
  message: string;
  guidance: {
    code: string;
    nextStep: string;
    canPrepareDraft: boolean;
    kind: "dispute_intake" | "support_handoff" | null;
    requiresTransactionSelection: true;
    requiresReasonConfirmation: true;
    requiresFinalConfirmation: true;
  };
  autonomousAction: false;
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const unique = <T>(values: T[]) => [...new Set(values)];
const reasons = new Set([
  "unrecognized",
  "duplicate",
  "merchant_issue",
  "other",
]);
const currencies = [
  "USD",
  "COP",
  "ARS",
  "BRL",
  "EUR",
  "MXN",
  "PEN",
  "CLP",
  "UYU",
  "BOB",
];
const genericMerchantWords = new Set([
  "cafe",
  "tienda",
  "mercado",
  "oficina",
  "estudio",
  "livraria",
  "musica",
  "digital",
  "cursos",
  "parque",
]);

function validSource(t: AssistantTransaction, snapshotAt: string) {
  const occurred = Date.parse(t.occurredAt);
  const snapshot = Date.parse(snapshotAt);
  return (
    Number.isFinite(snapshot) &&
    Number.isFinite(occurred) &&
    occurred <= snapshot &&
    Number.isSafeInteger(t.amountMinor) &&
    t.amountMinor > 0 &&
    /^[A-Z]{3}$/.test(t.currency) &&
    ["Approved", "Pending", "Reversed", "Declined"].includes(t.status)
  );
}

function isoDate(year: number, month: number, day: number): string | null {
  if (
    year < 1900 ||
    year > 2200 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    return null;
  const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

/** Supports exact two-decimal notation with optional unambiguous grouping. */
export function parseAmountMinor(
  raw: string,
  allowInteger = false,
): number | null {
  if (!/^\d[\d.,]*$/.test(raw)) return null;
  if (/^\d+$/.test(raw)) {
    const value = Number(raw) * 100;
    return allowInteger && Number.isSafeInteger(value) && value > 0
      ? value
      : null;
  }
  const separator = Math.max(raw.lastIndexOf("."), raw.lastIndexOf(","));
  if (raw.length - separator - 1 !== 2) return null;
  const major = raw.slice(0, separator);
  const decimalMark = raw[separator];
  const groupingMark = decimalMark === "." ? "," : ".";
  if (major.includes(decimalMark)) return null;
  if (major.includes(groupingMark)) {
    const groups = major.split(groupingMark);
    if (
      !/^\d{1,3}$/.test(groups[0]) ||
      groups.slice(1).some((g) => !/^\d{3}$/.test(g))
    )
      return null;
  } else if (!/^\d+$/.test(major)) return null;
  const value =
    Number(major.split(groupingMark).join("")) * 100 +
    Number(raw.slice(separator + 1));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function extractHints(
  text: string,
  own: readonly AssistantTransaction[],
): ExtractedHints {
  const normalized = normalize(text.slice(0, 2000));
  const hints: ExtractedHints = {
    amountsMinor: [],
    currencies: [],
    merchantTerms: [],
    cardLast4: [],
    dates: [],
    warnings: [],
  };
  let withoutDatesAndCards = normalized;
  for (const currency of currencies) {
    if (new RegExp(`\\b${currency.toLowerCase()}\\b`).test(normalized))
      hints.currencies.push(currency);
  }
  if (/\bus\s*\$/.test(normalized)) hints.currencies.push("USD");
  if (/\br\s*\$/.test(normalized) || /\breais\b/.test(normalized))
    hints.currencies.push("BRL");
  const cardPattern =
    /\b(?:tarjeta|cartao|cartao de credito|tarjeta de credito)?\s*(?:terminad[ao]\s*(?:en|em)?|final|ultimos?\s*(?:4|cuatro|quatro)?\s*(?:digitos)?)[\s:*#-]*(\d{4})\b/g;
  withoutDatesAndCards = withoutDatesAndCards.replace(
    cardPattern,
    (full, last4: string) => {
      hints.cardLast4.push(last4);
      return " ".repeat(full.length);
    },
  );
  withoutDatesAndCards = withoutDatesAndCards.replace(
    /\b(\d{4})-(\d{2})-(\d{2})\b/g,
    (full, y: string, m: string, d: string) => {
      const date = isoDate(Number(y), Number(m), Number(d));
      if (date) hints.dates.push(date);
      else hints.warnings.push("invalid_date");
      return " ".repeat(full.length);
    },
  );
  withoutDatesAndCards = withoutDatesAndCards.replace(
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/g,
    (full, d: string, m: string, y: string) => {
      // Only one interpretation is possible when the first component exceeds 12.
      const date =
        Number(d) > 12 ? isoDate(Number(y), Number(m), Number(d)) : null;
      if (date) hints.dates.push(date);
      else hints.warnings.push("ambiguous_or_invalid_date_use_iso");
      return " ".repeat(full.length);
    },
  );
  if (
    /\b(?:ayer|hoy|ontem|hoje|anoche|ayer|semana pasada|semana passada)\b/.test(
      normalized,
    )
  )
    hints.warnings.push("relative_date_not_inferred");
  const amountPattern = /\b\d(?:[\d.,]*\d)?\b/g;
  for (const match of withoutDatesAndCards.matchAll(amountPattern)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const preceding = withoutDatesAndCards.slice(
      Math.max(0, index - 12),
      index,
    );
    const following = withoutDatesAndCards.slice(
      index + raw.length,
      index + raw.length + 12,
    );
    if (/-\s*$/.test(preceding)) {
      hints.warnings.push("negative_amount_not_matched");
      continue;
    }
    // An unadorned integer could be a date, account reference or last four digits.
    const currencyNear =
      /(?:\b(?:usd|cop|ars|brl|eur|mxn|pen|clp|uyu|bob)|\$)\s*$/.test(
        preceding,
      ) ||
      /^\s*(?:usd|cop|ars|brl|eur|mxn|pen|clp|uyu|bob|reais)\b/.test(following);
    const amount = parseAmountMinor(raw, currencyNear);
    if (amount !== null) hints.amountsMinor.push(amount);
    else if (/[.,]/.test(raw))
      hints.warnings.push("ambiguous_amount_use_two_decimals");
  }
  const words = new Set(normalized.match(/[a-z0-9]+/g) ?? []);
  for (const merchant of unique(
    own.map((t) => t.merchant).filter((v): v is string => !!v),
  )) {
    const merchantNormalized = normalize(merchant);
    const merchantWords = merchantNormalized.match(/[a-z0-9]+/g) ?? [];
    const full =
      merchantWords.length > 0 && merchantWords.every((w) => words.has(w));
    const distinctive = merchantWords.filter(
      (w) => w.length >= 4 && !genericMerchantWords.has(w),
    );
    if (full || distinctive.some((w) => words.has(w)))
      hints.merchantTerms.push(merchant);
  }
  for (const key of [
    "amountsMinor",
    "currencies",
    "merchantTerms",
    "cardLast4",
    "dates",
    "warnings",
  ] as const) {
    // Keep the explicit arrays strongly typed without a mixed indexed assignment.
    if (key === "amountsMinor") hints.amountsMinor = unique(hints.amountsMinor);
    else hints[key] = unique(hints[key]);
  }
  return hints;
}

export function matchTransactions(input: MatchInput): {
  extracted: ExtractedHints;
  candidates: AssistantCandidate[];
} {
  const own = input.transactions.filter(
    (t) =>
      t.customerId === input.customerId && validSource(t, input.snapshotAt),
  );
  const extracted = extractHints(input.text, own);
  const hasHints =
    extracted.amountsMinor.length +
      extracted.currencies.length +
      extracted.merchantTerms.length +
      extracted.cardLast4.length +
      extracted.dates.length >
    0;
  const candidates = own.flatMap((t): AssistantCandidate[] => {
    const matchedBy: MatchField[] = [];
    const constraints: [MatchField, boolean, boolean][] = [
      [
        "amount",
        !!extracted.amountsMinor.length,
        extracted.amountsMinor.includes(t.amountMinor),
      ],
      [
        "currency",
        !!extracted.currencies.length,
        extracted.currencies.includes(t.currency),
      ],
      [
        "merchant",
        !!extracted.merchantTerms.length,
        !!t.merchant && extracted.merchantTerms.includes(t.merchant),
      ],
      [
        "card",
        !!extracted.cardLast4.length,
        !!t.cardLast4 && extracted.cardLast4.includes(t.cardLast4),
      ],
      [
        "date",
        !!extracted.dates.length,
        extracted.dates.includes(t.occurredAt.slice(0, 10)),
      ],
    ];
    for (const [field, required, matches] of constraints) {
      if (required && !matches) return [];
      if (required) matchedBy.push(field);
    }
    if (!hasHints) return [];
    return [
      {
        id: t.id,
        merchant: t.merchant,
        amountMinor: t.amountMinor,
        currency: t.currency,
        occurredAt: t.occurredAt,
        status: t.status,
        matchedBy,
      },
    ];
  });
  // Source order is preserved. Ranking never implies likelihood or ownership proof.
  return { extracted, candidates };
}

const copy = {
  es: {
    source:
      "No puedo verificar la fecha del corte de datos. Solicita revisión humana antes de continuar.",
    invalid:
      "La selección no está disponible en tus movimientos verificables. Vuelve a seleccionar un movimiento.",
    conflict:
      "Los datos de tu mensaje no coinciden con el movimiento seleccionado. Revisa la selección o corrige los datos antes de preparar el borrador.",
    none: "No encontré una coincidencia exacta con esos datos. Revisa el importe con dos decimales, la moneda o el comercio, o selecciona un movimiento de la lista.",
    start:
      "Describe el importe y el comercio, o selecciona un movimiento de tu lista. No elegiré una transacción por ti.",
    one: "Encontré un posible movimiento por coincidencia de datos. Revisa el importe, el comercio y la fecha, y selecciónalo si corresponde.",
    many: "Encontré {n} movimientos que coinciden con los datos indicados. Compara sus fechas y selecciona el que quieres revisar; la coincidencia no prueba un cobro duplicado.",
    reason:
      "Confirma el motivo de tu solicitud. La sugerencia del modelo es una hipótesis y puede estar equivocada.",
    ready:
      "El movimiento seleccionado y el motivo están listos para preparar un borrador. Revisa tu declaración; después tendrás que confirmar expresamente el envío.",
    Pending:
      "El corte de datos registra este movimiento como pendiente. Podemos preparar una consulta para soporte; no podemos afirmar que se haya completado ni prometer su cancelación.",
    Reversed:
      "El corte de datos registra este movimiento como reversado. Ese estado no acredita un reembolso disponible. Podemos preparar una consulta para soporte.",
    Declined:
      "El corte de datos registra este movimiento como rechazado. No demuestra que se haya cobrado. Podemos preparar una consulta para soporte.",
    support:
      "Prepararemos una solicitud de revisión humana. Este motivo no determina fraude, duplicidad ni derecho a reembolso.",
    selection: "Selecciona explícitamente un movimiento de tu lista.",
    confirmReason: "Elige y confirma un motivo; después revisa la declaración.",
    draft:
      "Prepara el borrador y revisa los hechos antes de confirmar el envío.",
    out: " Si tu consulta es sobre pérdida de tarjeta, cuentas o crédito, usa el canal oficial del banco; aquí puedes preparar solicitudes relacionadas con movimientos.",
    warning:
      " Hay datos que no interpreté con certeza. Usa una fecha AAAA-MM-DD y un importe con dos decimales si necesitas precisar la búsqueda.",
  },
  pt: {
    source:
      "Não consigo verificar a data do recorte de dados. Peça uma revisão humana antes de continuar.",
    invalid:
      "A seleção não está disponível nas suas transações verificáveis. Selecione uma transação novamente.",
    conflict:
      "Os dados da sua mensagem não correspondem à transação selecionada. Confira a seleção ou corrija os dados antes de preparar o rascunho.",
    none: "Não encontrei uma correspondência exata com esses dados. Confira o valor com duas casas decimais, a moeda ou o estabelecimento, ou selecione uma transação da lista.",
    start:
      "Descreva o valor e o estabelecimento ou selecione uma transação da sua lista. Não escolherei uma transação por você.",
    one: "Encontrei uma possível transação por correspondência de dados. Confira o valor, o estabelecimento e a data e selecione-a se for a correta.",
    many: "Encontrei {n} transações que correspondem aos dados informados. Compare as datas e selecione a que deseja revisar; a correspondência não comprova uma cobrança duplicada.",
    reason:
      "Confirme o motivo da sua solicitação. A sugestão do modelo é uma hipótese e pode estar errada.",
    ready:
      "A transação selecionada e o motivo estão prontos para preparar um rascunho. Confira sua declaração; depois será necessário confirmar expressamente o envio.",
    Pending:
      "O recorte de dados registra esta transação como pendente. Podemos preparar uma consulta para o suporte; não podemos afirmar que foi concluída nem prometer seu cancelamento.",
    Reversed:
      "O recorte de dados registra esta transação como revertida. Esse estado não comprova um reembolso disponível. Podemos preparar uma consulta para o suporte.",
    Declined:
      "O recorte de dados registra esta transação como recusada. Isso não comprova que houve cobrança. Podemos preparar uma consulta para o suporte.",
    support:
      "Prepararemos uma solicitação de revisão humana. Este motivo não determina fraude, duplicidade nem direito a reembolso.",
    selection: "Selecione explicitamente uma transação da sua lista.",
    confirmReason: "Escolha e confirme um motivo; depois confira a declaração.",
    draft: "Prepare o rascunho e confira os fatos antes de confirmar o envio.",
    out: " Se sua consulta for sobre perda de cartão, contas ou crédito, use o canal oficial do banco; aqui você pode preparar solicitações relacionadas a transações.",
    warning:
      " Há dados que não interpretei com certeza. Use uma data AAAA-MM-DD e um valor com duas casas decimais se precisar refinar a busca.",
  },
};

export function buildAssistant(input: AssistantInput): AssistantResult {
  const { extracted, candidates } = matchTransactions(input);
  const c = copy[input.locale];
  const result: AssistantResult = {
    version: "reclama-assistant-v3",
    state: "needs_transaction",
    extracted,
    candidates,
    selectedTransactionId: null,
    message: c.start,
    guidance: {
      code: "select_transaction",
      nextStep: c.selection,
      canPrepareDraft: false,
      kind: null,
      requiresTransactionSelection: true,
      requiresReasonConfirmation: true,
      requiresFinalConfirmation: true,
    },
    autonomousAction: false,
  };
  if (!Number.isFinite(Date.parse(input.snapshotAt))) {
    result.state = "source_unavailable";
    result.message = c.source;
    result.guidance.code = "source_unavailable";
    return result;
  }
  const selected = input.selectedTransactionId
    ? input.transactions.find(
        (t) =>
          t.id === input.selectedTransactionId &&
          t.customerId === input.customerId &&
          validSource(t, input.snapshotAt),
      )
    : undefined;
  if (input.selectedTransactionId && !selected) {
    result.state = "invalid_selection";
    result.message = c.invalid;
    result.guidance.code = "invalid_selection";
    return result;
  }
  if (selected) {
    result.selectedTransactionId = selected.id;
    const constrained =
      extracted.amountsMinor.length +
        extracted.currencies.length +
        extracted.merchantTerms.length +
        extracted.cardLast4.length +
        extracted.dates.length >
      0;
    if (
      constrained &&
      !candidates.some((candidate) => candidate.id === selected.id)
    ) {
      result.message = c.conflict;
      result.guidance.code = "selection_conflict";
      return result;
    }
    const reasonConfirmed =
      !!input.confirmedReason && reasons.has(input.confirmedReason);
    result.guidance.canPrepareDraft = reasonConfirmed;
    result.guidance.kind =
      selected.status === "Approved" && input.confirmedReason === "unrecognized"
        ? "dispute_intake"
        : "support_handoff";
    result.guidance.nextStep = reasonConfirmed ? c.draft : c.confirmReason;
    if (selected.status !== "Approved") {
      result.state = "support_handoff";
      result.message =
        c[selected.status as "Pending" | "Reversed" | "Declined"] +
        (reasonConfirmed ? " " + c.draft : " " + c.reason);
      result.guidance.code = `${selected.status.toLowerCase()}_support`;
    } else if (!reasonConfirmed) {
      result.state = "needs_reason";
      result.message = c.reason;
      result.guidance.code = "confirm_reason";
      result.guidance.kind = null;
    } else {
      result.state = "ready_for_draft";
      result.message =
        result.guidance.kind === "dispute_intake"
          ? c.ready
          : c.support + " " + c.draft;
      result.guidance.code = "ready_for_draft";
    }
  } else if (candidates.length > 1) {
    result.state = "multiple_candidates";
    result.message = c.many.replace("{n}", String(candidates.length));
    result.guidance.code = "clarify_matches";
  } else if (candidates.length === 1) {
    result.message = c.one;
  } else if (
    extracted.amountsMinor.length ||
    extracted.currencies.length ||
    extracted.merchantTerms.length ||
    extracted.cardLast4.length ||
    extracted.dates.length
  ) {
    result.state = "no_match";
    result.message = c.none;
    result.guidance.code = "no_match";
  }
  if (
    !selected &&
    ["card_lost", "account_query", "credit_query"].includes(
      input.intentHint ?? "",
    )
  )
    result.message += c.out;
  if (extracted.warnings.length) result.message += c.warning;
  return result;
}
