# Reclama: contenido de seis diapositivas, revisión 4

**Render vigente, 1 de octubre:** [PPTX V5](presentation/Reclama_Hackathon_6_slides_v5.pptx) y [PDF V5](presentation/Reclama_Hackathon_6_slides_v5.pdf) regenerados y revisados visualmente. La advertencia de obsolescencia inferior se refiere a los binarios V4, que se conservan.

Fuentes corregidas el 1 de octubre de 2026, sin reentrenar el modelo v2. **El [PowerPoint V4](presentation/Reclama_Hackathon_6_slides_v4.pptx) y el [PDF V4](presentation/Reclama_Hackathon_6_slides_v4.pdf) están desactualizados: aún contienen una afirmación de evaluación del modelo que estas fuentes retiran. Requieren regeneración y revisión visual antes de usarse.** Esta corrección solo actualiza texto y metadatos, no los archivos renderizados.

Alcance común: **sandbox con datos de demostración propios, recepción de solicitudes para revisión humana**. El sistema no confirma fraude, no adjudica disputas, no aprueba reembolsos y no mueve dinero. El despliegue privado documentado y la ejecución local se verifican por separado; el flujo autenticado alojado sigue pendiente.

## 1. Reclama: disputas de tarjeta con evidencia verificable

**Mensaje:** el cliente identifica el cargo y el agente recibe un expediente confirmado.

El flujo recibe un reclamo nuevo por una compra de tarjeta no reconocida. El cliente revisa el cargo exacto y su declaración. El sistema registra la solicitud y verifica su persistencia. El resultado significa **recibido, pendiente de revisión**, no resolución económica.

Equipo: Roberto Villafuerte, Jorge Arguello y Daniel Andrade.

**Visual:** portada tipográfica navy, blanco y teal. No muestra un banco ni un cliente real.

**Nota de exposición:** el análisis de datos sintéticos no estima demanda o fraude real. La oportunidad demostrada es la calidad verificable de recepción del caso.

## 2. Una solicitud completa, en español y portugués

**Mensaje:** identificar, confirmar y registrar tienen resultados observables.

1. **Identificar:** consultar compras del titular y seleccionar la transacción exacta. Cargos parecidos requieren aclaración.
2. **Confirmar:** revisar hechos de fuente y declaración del cliente por separado. La confirmación corresponde a una versión del borrador.
3. **Registrar:** persistir con controles de duplicados y realizar lectura posterior antes de mostrar el recibo.

El agente recibe hechos verificables, la declaración y preguntas abiertas. Ante estados o peticiones que requieren revisión humana, el sistema conserva ese contexto sin prometer devolución.

**Visual:** tres pasos y captura real de la vista de agente ejecutada localmente, con fixtures inventados. La captura no demuestra autenticación de producción ni acceso público de principio a fin.

**Demo:** los cargos ambiguos actuales son dos compras de Luna Digital por **USD 84,90**, con horas distinguibles.

## 3. Arquitectura implementada

**Mensaje:** el modelo sugiere una intención y el servicio aplica permisos y controla la escritura.

| Componente | Implementación y función |
| --- | --- |
| Cliente ES/PT | React 19, TypeScript y Vinext. Selección y confirmación visibles. |
| Clasificador | TF-IDF y regresión logística exportados a JSON. Inferencia local en Worker, sin API paga para clasificar. |
| Servicio | Cloudflare Worker. Sesión, aislamiento por cliente, estados y consentimiento versionado. |
| Persistencia | D1 / SQLite. Restricciones de unicidad, auditoría, idempotencia y lectura posterior. |
| Vista de agente | Expediente persistido, declaración, hechos, pendientes y revisión. |
| Datos | Pipeline Python sobre fuentes privadas. La app contiene únicamente fixtures inventados y agregados. |

La integración con identidad SIWC confía en el header de plataforma y una sesión HTTPS opaca. El flujo local con identidad de prueba está verificado. **El login de una sesión real de plataforma sigue pendiente de validación** por la barrera observada de Cloudflare. Esto no equivale a autenticación bancaria de producción.

**Visual:** diagrama nativo editable con componentes, dirección del flujo y controles junto al servicio. Las fronteras de confianza no se delegan al texto del modelo.

## 4. Un ID existente no garantiza titularidad

**Mensaje:** validar una relación requiere verificar quién es dueño del producto.

| Observación | Decisión |
| --- | --- |
| 10.903 compras de tarjeta aprobadas con relaciones coherentes | Base para identificar un cargo propio. |
| 531 de esas compras carecen de comercio | Conservar la ausencia, sin completar por inferencia. |
| 448 de 448 quejas con referencia de producto tienen otro propietario | Poner esas uniones en cuarentena y excluirlas del expediente operativo. |
| 1.748 transcripciones ES, 42 textos distintos de cliente, todos sobre saldo | Insuficientes para un benchmark amplio de intenciones ES/PT. No usarlas como etiquetas de disputa ni corpus portugués. |

Perfil: **50 archivos, doce cortes temporales no aleatorios**, más dimensiones suministradas de clientes/productos. Datos sintéticos. No permite estimar prevalencia bancaria real. Las 48.810 transacciones inspeccionadas tienen titularidad y moneda coherentes con la dimensión estática suministrada.

Los timestamps originales no permiten afirmar frescura bancaria en vivo. El snapshot de demo declara corte fijo y procedencia propia.

**Fuente reproducible pública:** [reporte agregado del pipeline](../data-pipeline/report.json). No se distribuyen registros originales, credenciales, archivos de acceso ni enlaces firmados en esta presentación.

## 5. QA de software y evaluación del modelo pendiente

**Mensaje visible:** las pruebas locales comprueban comportamiento del software. La validación independiente del modelo sigue pendiente.

**Contenido visible de la diapositiva:**

- **28/28 pruebas HTTP de integración** con base nueva.
- **160/160 aserciones de contratos** del flujo API: escenarios preparados y repetidos.
- **2/2 handoffs ES/PT** persistidos, reconsultados y auditados en rutas locales preparadas.
- **Modelo:** el conjunto de 256 mensajes es un experimento de desarrollo creado con IA, sin registros del organizador ni revisión humana. No constituye validación independiente ni un benchmark admisible del reto.

Estos denominadores describen QA de software y rutas preparadas. No miden precisión del modelo, clientes independientes, resolución financiera ni seguridad bancaria general. Tres fallos encontrados durante la revisión se corrigieron. El clasificador sugiere y el flujo exige confirmación explícita.

**Notas de procedencia, fuera del titular y de la tabla visible:** el experimento de desarrollo contiene **256 mensajes creados por IA, agrupados en 128 familias de escenarios bilingües ES/PT**. Las etiquetas también proceden de IA y carecen de revisión humana. El conjunto no contiene registros del organizador. La separación respecto del entrenamiento y la comparación sobre los mismos textos no acreditan independencia, representatividad ni admisibilidad como benchmark oficial del reto.

Se conservan los resultados históricos para trazabilidad, sin presentarlos como validación o rendimiento generalizable:

| Método, experimento de desarrollo creado con IA | Aciertos históricos | Exactitud histórica | Macro-F1 histórico |
| --- | ---: | ---: | ---: |
| Reglas | 168/256 | 65,63% | 0,6752 |
| Modelo v1 | 211/256 | 82,42% | 0,7904 |
| Modelo v2 | 218/256 | 85,16% | 0,8310 |

- La diferencia histórica v2 frente a reglas es **+19,53 puntos porcentuales**. El IC 95% por bootstrap de familias **[11,72; 27,34] pp** describe solo este experimento creado con IA.
- La diferencia histórica v2 frente a v1 fue **no concluyente**, IC 95% **[-1,17; 6,64] pp**.
- Los resultados históricos v2 por idioma fueron ES **85,94%** y PT **84,38%**. Las parejas bilingües no son observaciones independientes.
- El gate de autonomía histórico **no se superó por abstención total**. Ese resultado tampoco acredita validación independiente.

Los intervalos y porcentajes no corrigen la falta de datos elegibles ni de revisión humana. No deben convertirse en titulares de rendimiento, tasas de éxito con clientes o evidencia oficial del reto.

**Antecedente exploratorio:** v1 obtuvo 46/64 y reglas 43/64 en un conjunto previo. Se conserva como otro antecedente de desarrollo, sin alegar superioridad ni sumarlo al denominador de 256.

**Fuentes:** [test-report v2](../ml/v2/test-report.json), [model card](../ml/v2/model-card.md), [integración nueva](evidence/http-integration-rerun-2026-09-30.json), [evaluación del flujo API](evidence/WORKFLOW_API_EVALUATION.md), [contratos nuevos](evidence/workflow-api-rerun-2026-09-30.json), [handoff nuevo](evidence/handoff-rerun-2026-09-30.json) y [recorridos completos](evidence/full-case-rerun-2026-09-30.json).

**Límites:** falta un benchmark admisible, con procedencia y revisión humana documentadas. Los datos oficiales disponibles, con 42 textos distintos ES sobre saldo, no cubren una evaluación amplia de intenciones ES/PT. La clasificación no prueba recepción segura en conversaciones completas, adjudicación, ahorro operativo o rendimiento con clientes reales. No presentar latencia de inferencia como latencia conversacional end-to-end ni costo local por llamada como costo total de operación.

## 6. Entrega reproducible y próximos pasos

**Implementado y verificado localmente:** cliente ES/PT, vista de agente, casos persistidos, trazas, contratos y pruebas. La CI comprobó typecheck, lint, build, paridad de inferencia, fixtures y suite HTTP con base nueva.

- [Prototipo privado](https://reclama-factored-2026.villafortech.chatgpt.site): Sites confirma V4 sobre `6715df4` con política `custom` para el propietario y dos invitados del equipo. Login real de plataforma y acceso de jueces pendientes de validación.
- [Repositorio privado del equipo](https://github.com/VillaforTech/factored-hackathon-2026-reclama): código y reproducción.
- [PPTX editable V4](presentation/Reclama_Hackathon_6_slides_v4.pptx) y [PDF V4](presentation/Reclama_Hackathon_6_slides_v4.pdf): versiones desactualizadas, pendientes de regenerar con estas fuentes y revisar. No enviadas.

Antes de operar con un banco hacen falta identidad institucional, políticas aprobadas, integración con gestión de casos y evaluación con datos representativos autorizados. El sistema actual es un sandbox de recepción.

**Entrega del hackathon:** 5 de octubre de 2026 a las **23:59 UTC−5**. Video máximo tres minutos. Plazo confirmado previamente en fuentes oficiales, no una afirmación de envío realizado. Consultar la [página oficial](https://www.factored.ai/careers/ai-data-hackathon) y el registro de requisitos del equipo antes del envío final.

## Edición y procedencia

El contenido visible corregido y los resultados históricos separados están en [metrics-v4.json](presentation/metrics-v4.json). Los resultados históricos del experimento de desarrollo no deben volver a la tabla visible de rendimiento. Cada cambio debe conservar denominadores, procedencia y límites. La presentación no contiene registros privados ni referencia al archivo que proporciona acceso al dataset. Las otras referencias oficiales en notas están sujetas al acceso de sus propietarios.

Paleta navy #112d40, teal #33917b y blanco. El PPTX V4 histórico contiene texto, tabla y diagrama nativos editables, y el PDF histórico conserva enlaces al prototipo y repositorio. Esas comprobaciones no validan los cambios de estas fuentes. Faltan regeneración e inspección de las seis diapositivas y de ambos archivos finales. No se verificó el comportamiento de edición dentro de Microsoft PowerPoint.

El envío final y la autenticación pública completa requieren verificación aparte.
