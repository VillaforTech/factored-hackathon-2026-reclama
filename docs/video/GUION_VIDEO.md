# Reclama — guion del video borrador

Duración de narración: **172.74 segundos**. Voz genérica local macOS **Paulina (es-MX)**; no imita la voz de ninguna persona del equipo.

**Formato:** recorrido narrado con capturas reales y diapositivas. No es una grabación continua ni una prueba del login público. Video local de revisión; no enviado al organizador.

| Tiempo | Visual | Narración |
|---|---|---|
| 00:00.00–00:17.02 | slide-1 | Somos Roberto Villafuerte, Jorge Arguello y Daniel Andrade. Reclama recibe solicitudes por compras de tarjeta no reconocidas y prepara un expediente verificable. Este borrador es un recorrido narrado con capturas reales, no una sesión continua. |
| 00:17.02–00:38.74 | slide-4 | En doce cortes temporales del dataset sintético encontramos diez mil novecientas tres compras de tarjeta aprobadas, con titularidad coherente. Los enlaces defectuosos de las quejas históricas nos hicieron descartarlos como evidencia de un nuevo expediente. Partimos de la transacción verificada y de la declaración actual del cliente. |
| 00:38.74–01:02.46 | review-es | Esta captura real muestra la revisión en español. La declaración del cliente se identifica como no verificada; la autorización de la compra y la procedencia de un reembolso quedan pendientes de investigación. La recepción y las actualizaciones tienen rastro de auditoría. Recibido significa pendiente de revisión, no fraude confirmado ni dinero devuelto. |
| 01:02.46–01:15.58 | mobile-pt | La captura móvil muestra la interfaz en portugués y movimientos de una identidad ficticia de prueba. El cliente selecciona la transacción exacta, revisa su declaración y confirma antes de enviar. |
| 01:15.58–01:37.05 | slide-3 | El clasificador sugiere el motivo; el servicio controla identidad, titularidad, consentimiento y escritura. Un borrador no crea un caso. La confirmación se vincula al borrador, y una lectura posterior verifica el expediente guardado. Una sesión vencida o una transacción ajena no permiten continuar. |
| 01:37.05–02:03.70 | checks | Pasaron veintiocho pruebas de integración HTTP, incluidas concurrencia, consentimiento y recuperación tras una respuesta perdida. Otro workload tuvo ciento sesenta comprobaciones de API aprobadas: dieciséis escenarios bilingües, repetidos diez veces. Son pruebas locales de comportamiento; no representan ciento sesenta clientes independientes ni seguridad bancaria demostrada. |
| 02:03.70–02:26.74 | slide-5 | En doscientos cincuenta y seis textos sintéticos reservados, el clasificador acertó doscientos dieciocho; las reglas, ciento sesenta y ocho. Las etiquetas fueron asistidas por inteligencia artificial y requieren revisión humana. La evaluación no justificó autonomía: el modelo solo sugiere y la confirmación sigue siendo obligatoria. |
| 02:26.74–02:52.74 | slide-6 | El sitio público y el repositorio están disponibles; las acciones requieren inicio de sesión con ChatGPT. La verificación del acceso completo desde un navegador público sigue pendiente. Entregamos un sandbox reproducible con fuentes sintéticas, permisos y trazas. No mueve dinero ni resuelve financieramente disputas: prepara una solicitud clara para revisión humana. |

## Fuentes y límites

- Las capturas reales son `review-es.png` y `mobile-pt.png`, tomadas del prototipo con fixtures propios. Los recortes están identificados; no se generaron botones, respuestas ni transiciones ficticias.
- Se usaron las diapositivas finales v3. La tarjeta de pruebas se basa en los reportes de integración y contratos de API.
- 218/256 frente a 168/256 mide clasificación de textos sintéticos reservados. No es tasa de resolución de disputas; las anotaciones requieren revisión humana. El modelo es orientativo.
- 160/160 son aserciones de 16 escenarios repetidos diez veces. No son 160 clientes independientes.
- La narración identifica el acceso de navegador público completo como pendiente. No afirma que se haya completado ese login.
- Revisar pronunciación, legibilidad y decisión de entrega con el equipo. La voz sintética es un recurso para el borrador; no implica que los integrantes hayan grabado esta locución.

Enlaces:

- [Prototipo público](https://reclama-factored-2026.villafortech.chatgpt.site)
- [Código y reproducción](https://github.com/VillaforTech/factored-hackathon-2026-reclama)
