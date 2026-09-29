# Reclama — evaluación observada de API y flujo

Corte: 2026-09-29T19:04:20Z. Prueba local real en `http://127.0.0.1:5173`. Fixtures propios, no registros de los organizadores. No es una prueba reservada ni una medición de producción.

## Resultado principal

- **28/28 pruebas HTTP de integración** pasaron en `http-integration-final.json`. Incluyen sesiones, propiedad, consentimiento, idempotencia, concurrencia, timeout, persistencia y actualización de agente.
- Después se encontró F03 (alias de clave para respuesta duplicada); la corrección devuelve **409 CASE_ALREADY_EXISTS**, y el retest dio **2/2**, sin crear expedientes (`idempotency-alias-final.json`).
- F01/F02 — secretos sintéticos en frases naturales ES/PT y respuesta falsa de conflicto del agente — tienen **6/6 regresiones** aprobadas.
- El workload adicional ejecutó **16 pares escenario/idioma × 10 repeticiones = 160 peticiones**. **160/160 aserciones deterministas pasaron**. Son 16 escenarios repetidos, no 160 ejemplos independientes.
- Este workload no envió `POST /api/cases`: creó borradores de prueba, no nuevos expedientes. El número total de expedientes permaneció igual.

## Latencia real por escenario

Cada valor es latencia cliente de **una petición HTTP local**, con servidor de desarrollo en ejecución y procesamiento secuencial. No incluye navegador, tiempo del cliente humano ni tránsito de un despliegue remoto. Cuantil nearest-rank; con n=10, p95 coincide con el máximo observado.

| Escenario | ES p50 / p95 (ms) | PT p50 / p95 (ms) | n por idioma |
|---|---:|---:|---:|
| Hechos de transacciones propias | 5.61 / 7.94 | 5.18 / 9.62 | 10 |
| Rechazo de transacción ajena | 5.21 / 6.47 | 5.00 / 8.40 | 10 |
| Borrador con comercio ausente | 5.49 / 6.66 | 5.44 / 6.62 | 10 |
| Pending → support_handoff | 5.65 / 6.59 | 5.26 / 11.57 | 10 |
| Declined → support_handoff | 5.22 / 6.35 | 5.55 / 8.54 | 10 |
| Reversed → support_handoff | 5.29 / 7.66 | 5.94 / 8.85 | 10 |
| Consulta ambigua → seleccionar | 5.85 / 11.27 | 5.98 / 22.75 | 10 |
| Inyección → respuesta consultiva sin acción | 5.77 / 6.56 | 5.59 / 6.98 | 10 |

La prueba de ambigüedad comprueba que no se elige/crea automáticamente una transacción y que se solicita selección. La de inyección comprueba el contrato consultivo de la respuesta; no constituye una tasa general de detección de ataques. La prueba de hechos compara campos exactos contra el fixture autorizado; la de estados compara `kind` contra reglas del servicio.

## Numeradores del flujo, separados de los 28 controles

Una lectura retrospectiva encontró los **cuatro expedientes** creados por la ejecución completa de integración, vinculados por el marcador sintético único de aquella ejecución. Dos eran compras Approved con motivo unrecognized; dos eran estados que requerían revisión humana.

| Resultado de esos cuatro escenarios preparados | Numerador / denominador |
|---|---:|
| Recepción nueva de disputa completada y verificada | **2 / 4 casos del alcance** |
| Intento de automatizar recepción de disputa | **2 / 4 casos del alcance** |
| Recepción completada entre los dos casos designados automatizables | **2 / 2** |
| Expediente de soporte persistido para intervención humana | **2 / 2 casos designados humanos** |
| Resoluciones financieras de disputas | **0 / 4** |
| Reembolsos o movimientos de dinero | **0** |

**No dividir 2 por 28:** los otros controles son aserciones técnicas heterogéneas, no consultas independientes del cliente. Tampoco presentar 2/2 como tasa global. Los cuatro casos son de integración con transacción explícitamente seleccionada; no miden selección autónoma multivuelta, naturalidad lingüística, eficacia de agentes humanos ni reducción de costos de un banco.

En el workload de 160 peticiones no se midió finalización de intake: numerador 0, denominador de conversaciones completas 0, tasa **no definida**. Detener deliberadamente la prueba en un borrador no es un fallo de entrega de la aplicación.

## Costo y componente aprendido

- **0 llamadas a APIs externas de modelos y USD 0 de costo externo de inferencia** en esta ruta: el código ejecutado usa el clasificador TF-IDF/regresión logística empaquetado localmente. Esta conclusión combina ruta de código inspeccionada y peticiones ejecutadas; no se hizo captura de red.
- CPU, almacenamiento y hosting **no instrumentados**. Por tanto, costo total por intento o recepción segura: **no medido**, no “gratis”.
- El hash del artefacto de modelo fue igual antes y después del workload. El reporte registra hashes y versiones que respondió el API.
- Esta pieza **no compara calidad de inferencia contra baseline**. Ese resultado debe citar el reporte separado del experimento ML, con su split, corpus y resultados propios. No atribuir 160/160 al clasificador.

## Reproducción y límites

Ejecutar desde la raíz del proyecto, con preview portable y D1 migrada:

```sh
python3 research/build-assets/review/workflow-probe.py --base-url http://127.0.0.1:5173 --repeats 10
```

La autenticación sigue el flujo local legítimo. No se falsifican cabeceras de identidad. La prueba solo representa una identidad SIWC local con personas de demo distintas; el aislamiento entre dos SIWC reales sigue sin verificarse aquí. Las pruebas de accesibilidad, retención y supervivencia a reinicio requieren evidencia separada. No se garantiza ausencia de riesgos a partir de este conjunto.

Artefactos: `workflow-probe.py`, `workflow-api-report.json` (160 resultados individuales y hashes), `http-integration-final.json`, `http-regression-results.json` e `idempotency-alias-final.json`.
