import model from "../data/model.json";
import { predictIntent } from "./inference.mjs";
const labels = {
  es: {
    unrecognized: "cargo no reconocido",
    duplicate: "posible cobro duplicado",
    merchant_issue: "problema con el comercio",
    refund_request: "solicitud de reembolso",
    card_lost: "tarjeta perdida",
    account_query: "consulta de cuenta",
    credit_query: "consulta de crédito",
    other: "otra consulta",
  },
  pt: {
    unrecognized: "compra não reconhecida",
    duplicate: "possível cobrança duplicada",
    merchant_issue: "problema com o estabelecimento",
    refund_request: "solicitação de reembolso",
    card_lost: "cartão perdido",
    account_query: "consulta de conta",
    credit_query: "consulta de crédito",
    other: "outra consulta",
  },
};
/** A raw top-1 hypothesis is displayed, never used as a workflow authorization. */
export function classifyMessage(text: string, locale: "es" | "pt") {
  const p = predictIntent(model, text);
  const label =
    labels[locale][p.intent as keyof typeof labels.es] || labels[locale].other;
  const hypothesis =
    locale === "es"
      ? `Mi hipótesis es «${label}». Confirma o corrige esta interpretación: el modelo puede equivocarse.`
      : `Minha hipótese é «${label}». Confirme ou corrija esta interpretação: o modelo pode errar.`;
  const next =
    locale === "es"
      ? " Si necesitas reclamar un movimiento, selecciónalo y elige el motivo. Este asistente no autoriza reembolsos ni bloquea tarjetas."
      : " Se precisa contestar uma transação, selecione-a e escolha o motivo. Este assistente não autoriza reembolsos nem bloqueia cartões.";
  return {
    ...p,
    abstain: !p.accepted,
    modelVersion: "reclama-intent-v2-frozen",
    autonomousRouting: false,
    message: hypothesis + next,
  };
}
