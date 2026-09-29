# Reclama — guion de demo, 175 segundos

Versión: 29 septiembre 2026. **Guion previsto, no grabación ni prueba de funcionamiento.** No grabar frases de ejecución hasta verificarlas. Los únicos resultados cuantitativos ya medidos que se mencionan son del dataset. Las métricas del asistente permanecen pendientes.

Título visible: **Reclama — del cargo no reconocido a una solicitud verificable**. Rótulo persistente: “Sandbox · datos de demo sintéticos · no mueve dinero”. Un caso completo ES y un caso humano PT; nada de información personal real en pantalla.

| Tiempo | Pantalla / acción | Narración sugerida |
|---|---|---|
| 0–18 s | Título y tres cifras del análisis, con etiqueta muestra temporal | “Reclama recibe reclamos por compras de tarjeta no reconocidas. En doce cortes del dataset encontramos 10.903 compras aprobadas con titularidad coherente. Las quejas históricas tienen enlaces defectuosos: por eso partimos de la transacción y de la declaración actual del cliente.” |
| 18–48 s | Sesión de cliente ES. Escribir “No reconozco un cargo de 42,50 dólares”. Aparecen dos cargos propios; elegir por fecha | “Hay dos cargos posibles. El asistente conserva el contexto y pide aclaración antes de elegir. La búsqueda se limita al cliente autenticado desde el servidor, y cada hecho viene del snapshot. Ahora selecciono el cargo correcto.” |
| 48–82 s | Escribir declaración. Mostrar borrador con facts/allegation separados, confirmar. Recibo con ID, estado y readback | “El expediente separa lo verificado de lo que yo declaro. Reviso importe, moneda, fecha y mi declaración antes de confirmar. El servicio valida nuevamente titularidad y versión del borrador. Solo anuncia recepción después de leer el registro guardado. Esto significa pendiente de revisión: no fraude confirmado ni reembolso aprobado.” |
| 82–112 s | Cambiar a personaje/lengua PT. Preguntar “Não reconheço esta cobrança pendente. O dinheiro será devolvido?”. Mostrar handoff con desconocidos | “Em português, esta cobrança está pendente. O sistema não promete estorno nem inventa um prazo. Ele reúne o que sabemos, registra o que falta e encaminha para revisão humana. A regra é a mesma nos dois idiomas.” |
| 112–137 s | Panel de prueba controlada: timeout tras commit, retry con misma key; mostrar un solo case ID y contador persistido | “Aquí simulamos una respuesta perdida después de guardar. Reintentamos con la misma clave: obtenemos el mismo expediente, no un duplicado. El control vive en el servicio. También probamos acceso ajeno, sesión vencida, consentimiento alterado e instrucciones maliciosas.” |
| 137–160 s | Tarjeta de evaluación real, baseline vs sistema, n y fallos; mostrar una limitación | “Comparamos [BASELINE REAL] con [MODELO/VERSIÓN] sobre los mismos [N] casos reservados. Medimos recepción segura, transferencias, incidentes, latencia y costo por idioma. [DECIR SOLO UNA DIFERENCIA MEDIDA Y UN FALLO REAL]. Las conversaciones son fixtures del equipo, no una evaluación de producción bancaria.” |
| 160–175 s | Arquitectura simple y enlaces de reproducción | “Una capa de datos valida, el modelo interpreta y el servicio decide permisos y escrituras. Entregamos cliente, bandeja de agentes, trazas y reproducción. El siguiente paso hacia banca real requiere identidad, políticas, integración operativa y evaluación con conversaciones autorizadas.” |

## Condiciones antes de grabar

- Resolver placeholders de 137–160 s únicamente desde el reporte ejecutado. No sustituirlos con objetivos. Si no hay evaluación real, el proyecto no está listo para afirmar cumplimiento completo.
- La frase “desde el servidor” exige comprobar petición directa; un botón oculto no basta.
- El timeout debe ocurrir después del commit en una herramienta de fallo explícitamente marcada, con lectura independiente del expediente y conteo; no animar un éxito ficticio.
- El idioma PT requiere revisión por alguien competente; este texto es una propuesta del equipo, no traducción validada.
- Si no está implementado el cambio de lengua/personaje, grabar dos sesiones claramente identificadas; no fingir continuidad de identidad.
- El bloque de 175 s deja cinco segundos de margen al máximo oficial de 180. Cronometrar la locución y recortar silencios; no acelerar hasta volverla incomprensible.
- Mostrar datos propios de fixture, con referencias ficticias, no filas del dataset original. Mantener secretas credenciales, claves, IDs/tokens de sesión y paneles de proveedor.

## Fuentes de las cifras del guion

`research/analysis/dispute-intake-profile.json`: 10.903 compras de tarjeta Approved, 10.036 clientes, 531 sin comercio, 0 discrepancias de titularidad en las compras enlazadas. `research/analysis/relations-profile.json`: 448 quejas con producto, 0 coincidencias de propietario; 700/700 quejas sin origin_interaction_id. Doce cortes temporales, no muestra aleatoria. Esos conteos respaldan diseño y límites; no prueban demanda, ahorro o fraude.
