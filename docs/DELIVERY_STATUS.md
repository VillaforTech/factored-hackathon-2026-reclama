# Estado de entrega de Reclama

**Corte verificado: 2 de octubre de 2026. Sin entrega al organizador.**

| Ámbito | Resultado comprobado |
| --- | --- |
| Remoto privado | `codex/reclama` en `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`; [PR #1](https://github.com/VillaforTech/factored-hackathon-2026-reclama/pull/1) integrado; [CI del SHA](https://github.com/VillaforTech/factored-hackathon-2026-reclama/actions/runs/36935070857) correcta. |
| Alojado existente | [Demo](https://reclama-factored-2026.villafortech.chatgpt.site), Sites V6, mismo SHA; despliegue `appgdep_6abedf7171988191b1c8c4c75229a1e2` correcto. Política `custom` revisión 4: propietario y dos visitantes autorizados. GET anónimo: 401. |
| Trabajo local nuevo | Rama `codex/reclama-acceptance-v6-20261002`, copia aislada `task-4/reclama-acceptance-v6`: error PT de datos sensibles ahora menciona PIN, documentación actualizada y recibos de evidencia. Autorizados commit/push privado y PR en borrador; sin merge ni despliegue nuevos. |
| Pruebas del 2 de octubre | TypeScript, lint y build pasaron tras la corrección PT. Procedencia 6/6 y 15/15 recorridos API locales pasaron; [detalle y denominadores](evidence/REQUIREMENTS_EVIDENCE_MATRIX_2026-10-01.md). |
| Presentación y video | PPTX/PDF V5, seis diapositivas; MP4 V5, 168,3 s. Hashes verificados por las pruebas de procedencia; ya guardados en Library, versión 1. V4 es histórico y obsoleto. El MP4 es montaje narrado de capturas locales, no grabación alojada continua. |
| Modelo | Congelado. 218/256 frente a 168/256 son resultados históricos de autoría IA sin validación independiente ni benchmark admisible del reto. |

## Pendientes reales

1. Login normal alojado, persistencia tras recarga y aislamiento de dos cuentas reales autorizadas. El hilo padre coordina un inicio de sesión seguro en su navegador cloud; estas pruebas siguen pendientes y no se duplican aquí.
2. Resolver el requisito de **repositorio público** y acceso efectivo de jueces al enlace. La regla no especifica demo anónima. [Paquete de aprobación vigente](ACCESS_APPROVAL_2026-09-30.md).
3. Evaluación independiente/admisible antes de cualquier afirmación de rendimiento del modelo. La [respuesta del organizador sobre mocks](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549?thread_ts=1790698838.166839) permite mocks con contexto, excluyendo testing; su alcance para fixtures de QA de software requiere aclaración, no se presume una excepción.
4. [Grabación interactiva local](video/interactive-v6/README.md) terminada: 107,320 s, 9/9 comprobaciones y 14 subtítulos verificados. Sin cortes/aceleración ni voz. V5 se conserva; revisión del equipo pendiente. Revisión competente PT y escucha humana del montaje V5 son recomendaciones internas, no requisitos oficiales textuales.
5. Aprobar y efectuar entrega; comprobar recibo. Plazo revalidado: [5 de octubre, 23:59 UTC−5; video máximo tres minutos](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809).

El sandbox recibe expedientes ficticios para revisión humana. No mueve fondos, decide fraude ni concede reembolsos. Costo total por caso desconocido. El original en `Documents/ChatGPT/Factored-Hackaton/app` y los otros checkouts permanecen limpios; el trabajo nuevo queda aislado.
