import model from "../data/model.json";
import { predictIntent } from "./inference.mjs";
const guidance = {
  es: {
    clarify:
      "Quiero asegurarme del motivo. Selecciona el movimiento y confirma si no lo reconoces, aparece duplicado o hay un problema con el comercio.",
    unrecognized:
      "Podemos preparar una reclamación por cargo no reconocido. Selecciona el movimiento exacto y describe qué ocurrió.",
    duplicate:
      "Veo una posible consulta por duplicado. Dos cargos parecidos no prueban un error: selecciona uno y documentaremos la duda para revisión.",
    merchant_issue:
      "Podemos documentar el problema con el comercio y derivarlo a revisión. Selecciona el movimiento relacionado.",
    refund_request:
      "Puedo preparar una solicitud para revisión; no puedo autorizar ni prometer un reembolso.",
    card_lost:
      "Esta demo no puede bloquear tarjetas. Contacta a tu banco por su canal oficial para reportar la pérdida; evita compartir PIN o CVV.",
    account_query:
      "Esta herramienta prepara expedientes de disputas. Para saldos o pagos, utiliza el canal oficial de tu banco.",
    credit_query:
      "La información y elegibilidad de crédito están fuera de este flujo. Utiliza el canal oficial de tu banco.",
    other:
      "No tengo suficiente contexto. Describe el problema sin incluir PIN, CVV, contraseñas ni números completos de tarjeta.",
  },
  pt: {
    clarify:
      "Quero confirmar o motivo. Selecione a transação e indique se não a reconhece, se parece duplicada ou se há um problema com o estabelecimento.",
    unrecognized:
      "Podemos preparar uma contestação de compra não reconhecida. Selecione a transação exata e descreva o que aconteceu.",
    duplicate:
      "Identifiquei uma possível dúvida sobre duplicidade. Duas compras parecidas não comprovam um erro: selecione uma para revisão.",
    merchant_issue:
      "Podemos documentar o problema com o estabelecimento e encaminhar para análise. Selecione a transação.",
    refund_request:
      "Posso preparar uma solicitação para análise; não posso autorizar nem prometer um reembolso.",
    card_lost:
      "Esta demonstração não bloqueia cartões. Entre em contato com o banco pelo canal oficial para informar a perda; não compartilhe senha ou CVV.",
    account_query:
      "Esta ferramenta prepara contestações. Para saldo ou pagamentos, utilize o canal oficial do banco.",
    credit_query:
      "Informações e elegibilidade de crédito estão fora deste fluxo. Utilize o canal oficial do banco.",
    other:
      "Preciso de mais contexto. Descreva o problema sem informar senhas, CVV ou o número completo do cartão.",
  },
};
export function classifyMessage(text: string, locale: "es" | "pt") {
  const p = predictIntent(model, text);
  const key = p.accepted ? p.intent : "clarify";
  return {
    ...p,
    abstain: !p.accepted,
    modelVersion: "reclama-intent-v1.1",
    autonomousRouting: false,
    message:
      guidance[locale][key as keyof typeof guidance.es] ||
      guidance[locale].clarify,
  };
}
