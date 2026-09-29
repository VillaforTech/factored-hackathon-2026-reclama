# Reclama: gate de revisión y aceptación

Fecha: 29 de septiembre de 2026. Autoría del equipo asistida por IA. **Estado: diseño de pruebas; no certifica que la aplicación las haya pasado.** Este documento propone controles del sandbox, no reglas bancarias, legales o regulatorias.

La base oficial es el [enunciado](https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4J2YFMHC/factored_ai___data_hackathon_2026__1_.pdf), cuyo texto local está en `research/sources/challenge-public-doc.txt`. Exige un flujo funcional, ES/PT, controles externos al modelo, baseline y componente aprendido sobre held-out, fallos, trazas, costos, latencia y límites honestos. El [cierre y video máximo de tres minutos](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809) se verificaron el 28 de septiembre; revisar mensajes posteriores antes de entregar.

## Qué se está construyendo

Recepción de una solicitud nueva por una compra de tarjeta que el cliente no reconoce. El resultado automatizable es **recepción persistida y verificada**, pendiente de revisión humana. El producto no detecta fraude, adjudica disputas, aprueba reembolsos, bloquea tarjetas ni mueve dinero. Un cliente selecciona una transacción de su propio ámbito, aporta su declaración, revisa un borrador y confirma su envío. Un agente recibe hechos verificados, alegaciones, acciones y preguntas pendientes en campos separados.

Regla propuesta del sandbox: las compras de tarjeta `Approved` con titularidad, importe y moneda verificables pueden pasar al intake automático. `Pending`, `Reversed`, `Declined`, tipos no soportados o datos críticos inconsistentes requieren explicación limitada y derivación. Esto **no afirma elegibilidad legal para reclamar**, plazo de disputa ni política real del banco. Comercio faltante por sí solo no impide recibir un reclamo de una transacción inequívoca.

## Modelo de amenazas breve

| Activo/frontera | Adversario o fallo | Invariante y evidencia requerida |
|---|---|---|
| Sesión → servicio | Cliente altera `customer_id`, `tenant_id` o `role`; token vencido | Identidad/rol de sesión confiable; filtros y autorización en cada herramienta. Inspeccionar respuestas y estado persistido. |
| Fuente → contexto/modelo/UI | Comercio o alegación contiene instrucciones, HTML o datos sensibles | Datos sin autoridad; escapado de texto; campos mínimos; ningún secreto ni registro restringido en el modelo o logs. |
| Modelo → herramienta | Modelo elige cargo, permiso o estado incorrecto | Esquemas tipados más reglas del servidor; el modelo no puede conceder permisos ni generar consentimiento válido. |
| Borrador → confirmación → escritura | Cambio de cargo, declaración o versión después de revisar | Consentimiento unido a actor/sesión, borrador, versión y contenido; revalidación de datos actuales al escribir. |
| Solicitud → almacenamiento → respuesta | Timeout después del commit, concurrencia, replay | Persistencia atómica, idempotencia por actor/operación/payload y prevención de duplicados con clave diferente. Readback verificable. |
| Cliente → agente | Caso ajeno, rol suplantado, resumen que agrega hechos | Ámbito de agente controlado; alegaciones separadas; ningún contenido de otro cliente. |
| Retención → auditoría | Borradores eternos, PII en logs, falsas promesas de borrado | Plazos reales documentados y limpieza ejecutable; auditoría mínima; límites de backups explícitos. |
| Interfaz → usuario | Confirmación ambigua, foco perdido, idioma mal traducido | Resumen completo, acción accesible, equivalencia ES/PT y revisión humana del portugués. |

## Prioridad P0: cualquier fallo bloquea entrega

1. **Aislamiento por cliente y ámbito de servicio.** Listar, buscar, leer, crear, exportar y ver trazas deben usar identidad de servidor. Un ID conocido no autoriza acceso. Si el despliegue es de un solo banco, documentar ese límite y rechazar la selección de otro tenant; no fingir multi-tenancy.
2. **Autenticación y roles.** Sesión confiable, expiración comprobada también al escribir, sesión anterior invalidada al cambiar usuario, endpoints de agente protegidos. Una pantalla de selección de personajes de demo no es autenticación bancaria real: identificarla como sesión de prueba.
3. **Titularidad referencial.** La transacción, el producto y el cliente concuerdan. No basta con encontrar una FK existente. Las quejas históricas con enlaces defectuosos quedan fuera del expediente operativo.
4. **Consentimiento específico y vigente.** Seleccionar un cargo, conversar o decir “ese” no equivale a enviar. El servidor valida borrador/versión/contenido revisado. Un cambio de transacción o declaración invalida confirmación anterior. No aceptar un booleano genérico generado por el LLM como autorización.
5. **Escritura coherente.** La restricción de duplicados y la clave idempotente se aplican atómicamente. Reusar una clave con otro payload produce conflicto. Reintentar después de una respuesta perdida recupera el mismo expediente.
6. **Verdad financiera.** No existe operación de reembolso, dinero o adjudicación. Ni cliente ni agente pueden insertar estados arbitrarios que prometan esos resultados. La UI distingue caso recibido de disputa resuelta.
7. **Privacidad y límites del modelo.** Datos originales restringidos fuera de GitHub público y del prompt externo; fixtures propios identificados. Inyección, XSS o campos alterados no cambian autoridad. No secretos ni textos completos sensibles en telemetría.

Los P0 corresponden a 32 escenarios del JSON; cada uno tiene variante ES y PT. Una prueba solo pasa con todas las aserciones cumplidas y ninguna conducta prohibida. `not_run`, `blocked` y `not_implemented` jamás cuentan como `pass`.

## Prioridad P1: necesarias para una entrega defendible

- Camino completo funciona ES y PT, incluidas aclaración, edición del borrador, confirmación, readback y bandeja de agente.
- Casos no soportados obtienen una derivación útil con hechos, alegaciones y faltantes. Persistir handoff antes de decir que se envió; no afirmar que una persona ya lo revisó.
- Modelo caído, JSON inválido o almacenamiento inaccesible tienen reintentos limitados y fallback comprensible. Si no se verifica el resultado, decirlo sin inventar recibo.
- Estado dura después de recargar y del ciclo de reinicio que el despliegue declara soportar. `localStorage` o memoria del componente no demuestran persistencia de servicio.
- Contratos de datos, lineage, snapshot y actualización se pueden reproducir. `process_date` no demuestra por sí solo cuándo se conocía un dato. Una actualización de prueba se etiqueta como fixture.
- Retención está configurada, implementada y ensayada. No elegir plazos por imitación de una regulación no investigada. Borrado de borrador, cierre de sesión y conservación de caso son operaciones distintas.
- Accesibilidad: navegación por teclado, nombres y errores asociados, foco visible/gestionado, anuncios de estado, contraste, lectura a 200% y pantalla estrecha. No afirmar conformidad WCAG completa sin auditoría apropiada.
- Un componente aprendido se ejecuta realmente y se compara contra un baseline razonable. Si es fallback puramente determinista, reportarlo; no presentarlo como ejecución de LLM.

## Matriz de aceptación entregada

`acceptance-cases.json` contiene **58 casos base / 116 variantes lingüísticas**. Todas las identidades/transacciones son fixtures del equipo, independientes de los registros de los organizadores. Los nombres de acciones y estados son semánticos: deben mapearse al contrato real sin cambiar el resultado esperado.

| Grupo | Casos |
|---|---|
| Recepción, ES/PT, ambigüedad, comercio ausente | 001–005 |
| Cliente, tenant, expediente, rol, sesión y titularidad | 006–014 |
| Consentimiento, edición, versión y cambio de fuente | 015–020 |
| Idempotencia, duplicados, carreras, fallos y readback | 021–026 |
| Estados no soportados, dinero y calidad de alegaciones | 027–031 |
| Inyección, XSS, secretos y salida hacia modelo | 032–036 |
| Importe, fecha, corrección, idioma, alcance y dato crítico | 037–042 |
| Retención y accesibilidad | 043–047 |
| Trazas, caídas, frescura, persistencia y estado de agente | 048–052 |
| Carrera con cancelación, límites, handoff y actualización | 053–056 |
| Origen de escritura/CSRF e integridad de sesión | 057–058 |

**Estos casos son visibles al equipo que construye: son aceptación de desarrollo, no un benchmark reservado.** No entrenar/promptear con ellos y luego llamarlos “unseen”. Preparar un conjunto independiente; agrupar familia de paráfrasis, cliente/transacción y pareja ES/PT en el mismo split.

## Contrato mínimo que se debe revisar

| Operación lógica | Validación del servicio | Evidencia de salida |
|---|---|---|
| `session` | Sesión confiable, sujeto, rol, ámbito, expiración | Identidad de prueba sin tokens expuestos |
| `search_transactions` / `get_transaction` | Sujeto, ámbito, campos de filtro validados | Registros mínimos autorizados, snapshot/versionado |
| `create_or_update_draft` | Cargo permitido, identidad, campos; optimistic version | Borrador exacto, hash/version y faltantes; sin escritura de caso |
| `confirm_and_submit` | Sesión/rol; borrador revisado; consentimiento vigente; titular/estado actual; idempotencia; duplicado | Caso persistido o conflicto/error/resultado incierto distinguible |
| `get_case` | Cliente propio o agente autorizado | Mismo ID y hechos que la escritura; alegación separada |
| `create_handoff` | Mismo aislamiento; sin datos inventados | Expediente humano con request, facts, allegations, actions, evidence, unresolved |
| `agent_update` | Rol/ámbito; transición enum soportada; audit | Estado administrativo verificado, sin adjudicación financiera |
| `cleanup_expired_drafts` | Operador/cron autorizado | Conteos, auditoría mínima y verificación de expiración |

El frontend no es una frontera de seguridad. Campos ocultos, rutas no enlazadas o botones deshabilitados no prueban un control del servidor.

## Evidencia de evaluación, sin inflar métricas

Registrar versión de aplicación, modelo, prompt, fixtures/política, número de intentos, trazas de herramienta, fallos, tiempos E2E y costo. Separar tres conjuntos:

1. **Aceptación funcional/adversarial**: este archivo, determinista donde es posible, revisión humana para lenguaje/fidelidad/accesibilidad.
2. **Evaluación reservada del servicio**: escenarios independientes, etiquetas de si se automatiza/aclara/deriva, transaction_id de referencia y campos requeridos. Baseline y sistema comparten exactamente workload y controles. No omitir los fallos del denominador.
3. **Evaluación del componente aprendido**: intención/slots/referencias/alegaciones, frente a reglas o formulario apropiado; evaluar fidelidad y completitud, no solo fluidez. Evitar `agent_text` o etiquetas de resultado como entrada.

Métricas obligatorias propuestas:

- Finalización segura de recepción / todos los casos dentro del alcance; porcentaje donde se intentó automatizar. Denominarlo recepción: no confundir con resolución financiera.
- Selección de cargo correcta; fidelidad de importe/moneda/declaración; porcentaje de casos ambiguos que se aclararon adecuadamente.
- Transferencias requeridas omitidas y transferencias innecesarias, con referencia explícita.
- Divulgaciones, acciones indebidas, casos duplicados y afirmaciones materiales falsas: **conteos/denominador**, además de ejemplos de fallo.
- Paridad ES/PT: publicar n por idioma y diferencia observada, sin generalizar desde muestras pequeñas.
- p50/p95 E2E y costo por intento y recepción segura. Si ninguna termina, costo por recepción segura = **no definido**. Tarifas/modelo y fecha documentados; local o simulado marcado como tal.
- Repetir escenarios con componente estocástico y reportar variabilidad. Validar con humanos un subconjunto si se usa un LLM juez.

Un resultado de 0 incidentes en este pequeño conjunto no significa riesgo cero. El dataset es sintético, la muestra temporal no aleatoria y las conversaciones son del equipo; no se puede afirmar ahorro real de un banco.

## Decisión de salida

**Pasa al ensayo final** solo cuando los P0 pasan sobre servicio real, el camino completo ES/PT persiste, existe evaluación reservada de componente aprendido frente a baseline, y el paquete documenta los límites que siguen abiertos. Los P1 incompletos se corrigen o se declara y reevalúa el alcance; no se pintan como implementados.

**No entregar como completo** si los controles existen solo en UI/prompt, no hay persistencia durable, el recibo no se verifica, el modelo nunca se ejecuta, la evaluación carece de baseline o se publican métricas proyectadas como mediciones.

La rúbrica no permite garantizar ganar; la meta defendible es una solución que haga lo prometido, lo pruebe y permita a los jueces reproducirlo.
