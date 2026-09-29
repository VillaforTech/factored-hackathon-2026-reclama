# Reclama: contenido de seis diapositivas, revisión 3

Actualizado el 29 de septiembre de 2026. Esta revisión incorpora el resultado del modelo v2. [PowerPoint editable](presentation/Reclama_Hackathon_6_slides_v3.pptx) y [PDF](presentation/Reclama_Hackathon_6_slides_v3.pdf) contienen seis diapositivas con enlaces al sitio y repositorio.

Alcance común: **sandbox con datos de demostración propios, recepción de solicitudes para revisión humana**. El sistema no confirma fraude, no adjudica disputas, no aprueba reembolsos y no mueve dinero. La interfaz pública y la ejecución local se verifican por separado.

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
| 448 de 448 quejas con referencia de producto tienen otro propietario | Excluir esa unión del expediente operativo. |
| 1.748 transcripciones ES, 42 textos distintos de cliente con “saldo” | No usarlas como etiquetas de disputa ni corpus portugués. |

Perfil: **50 archivos, doce cortes temporales no aleatorios**, más dimensiones suministradas de clientes/productos. Datos sintéticos. No permite estimar prevalencia bancaria real. Las 48.810 transacciones inspeccionadas tienen titularidad y moneda coherentes con la dimensión estática suministrada.

Los timestamps originales no permiten afirmar frescura bancaria en vivo. El snapshot de demo declara corte fijo y procedencia propia.

**Fuente reproducible pública:** [reporte agregado del pipeline](../data-pipeline/report.json). No se distribuyen registros originales, credenciales, archivos de acceso ni enlaces firmados en esta presentación.

## 5. Evaluación con errores y límites visibles

**Mensaje:** v2 mejora frente a reglas en clasificación del conjunto reservado. No demuestra resolución autónoma de disputas.

Único corpus reservado independiente: **256 textos, 128 familias con parejas ES/PT**. Anotación IA independiente de entrenamiento y predicciones, revisión humana pendiente. Comparación de los mismos textos y etiquetas.

| Método | Aciertos | Exactitud | Macro-F1 |
| --- | ---: | ---: | ---: |
| Reglas | 168/256 | 65,63% | 0,6752 |
| Modelo v1 | 211/256 | 82,42% | 0,7904 |
| Modelo v2 | 218/256 | 85,16% | 0,8310 |

La diapositiva muestra reglas y v2. v1 permanece aquí y en notas para conservar contexto sin mezclar experimentos.

- v2 frente a reglas: **+19,53 puntos porcentuales**, IC 95% mediante bootstrap por familias **[11,72; 27,34] pp**.
- v2 frente a v1: diferencia **no concluyente**, IC 95% **[-1,17; 6,64] pp**.
- v2: ES **85,94%** y PT **84,38%**. Los pares bilingües no son observaciones independientes.
- El gate de autonomía **no se superó por abstención total**. El despliegue utiliza la clasificación como sugerencia con confirmación explícita.

**Pruebas distintas y denominadores distintos:**

- **28/28 pruebas HTTP de integración** con base nueva.
- **160/160 aserciones de contratos** del flujo API.
- Tres fallos encontrados y corregidos durante la revisión. Estas comprobaciones funcionales no son un benchmark lingüístico end-to-end, no demuestran riesgo cero y no se suman al denominador 256.

**Antecedente exploratorio:** v1 obtuvo 46/64 y reglas 43/64 en un conjunto previo. Esa diferencia no justificó superioridad. No se mezcla ese experimento con el corpus independiente de 256 textos ni se presenta como otra evaluación reservada.

**Fuentes:** [test-report v2](../ml/v2/test-report.json), [model card](../ml/v2/model-card.md), [integración final](evidence/http-integration-final.json), [evaluación del flujo API](evidence/WORKFLOW_API_EVALUATION.md) y [reporte de contratos](evidence/workflow-api-report.json).

**Límites:** la clasificación no prueba recepción segura en conversaciones completas, adjudicación, ahorro operativo o rendimiento con clientes reales. No presentar latencia de inferencia como latencia conversacional end-to-end ni costo local por llamada como costo total de operación.

## 6. Entrega reproducible y próximos pasos

**Implementado y verificado localmente:** cliente ES/PT, vista de agente, casos persistidos, trazas, contratos y pruebas. La CI comprobó typecheck, lint, build, paridad de inferencia, fixtures y suite HTTP con base nueva.

- [Prototipo](https://reclama-factored-2026.villafortech.chatgpt.site): despliegue completado, política pública y render del frontend verificados. Login real de plataforma pendiente de validación. No afirmar autenticación pública completa.
- [Repositorio público](https://github.com/VillaforTech/factored-hackathon-2026-reclama): código y reproducción.
- [PPTX editable](presentation/Reclama_Hackathon_6_slides_v3.pptx) y [PDF](presentation/Reclama_Hackathon_6_slides_v3.pdf): seis diapositivas finales de esta revisión.

Antes de operar con un banco hacen falta identidad institucional, políticas aprobadas, integración con gestión de casos y evaluación con datos representativos autorizados. El sistema actual es un sandbox de recepción.

**Entrega del hackathon:** 5 de octubre de 2026 a las **23:59 UTC−5**. Video máximo tres minutos. Plazo confirmado previamente en fuentes oficiales, no una afirmación de envío realizado. Consultar la [página oficial](https://www.factored.ai/careers/ai-data-hackathon) y el registro de requisitos del equipo antes del envío final.

## Edición y procedencia

Los valores visibles están también en [metrics-v3.json](presentation/metrics-v3.json). Cada cambio debe conservar denominadores, split y límites. La revisión pública no contiene registros privados ni referencia al archivo que proporciona acceso al dataset. Las otras referencias oficiales en notas están sujetas al acceso de sus propietarios.

Paleta navy #112d40, teal #33917b y blanco. El PPTX contiene texto, tabla y diagrama nativos editables. El PDF conserva enlaces al prototipo y repositorio. No se verificó el comportamiento de edición dentro de Microsoft PowerPoint.

El envío final y la autenticación pública completa requieren verificación aparte.
