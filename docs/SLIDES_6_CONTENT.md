# Reclama — contenido de seis diapositivas

Documento de contenido, no presentación creada ni entrega realizada. Fecha 29 septiembre 2026. Cifras de perfil medidas el 28 septiembre; resultados del sistema aún pendientes. Incluir pie “Sandbox · fixtures de demostración propios · ninguna decisión financiera real” en las láminas de producto.

## 1. Del cargo no reconocido a un expediente verificable

**Mensaje principal:** El cliente sabe qué está reclamando y el agente recibe hechos, declaración y preguntas pendientes en un expediente confirmado.

- Recepción de reclamos por compras de tarjeta en español y portugués.
- Una acción concreta: registrar la solicitud y verificar su persistencia.
- El resultado es “recibido, pendiente de revisión”.
- Equipo: Roberto Villafuerte · Jorge Arguello · Daniel Andrade.

**Visual propuesto:** Cliente → cargo identificado → borrador confirmado → expediente para revisión. Usar captura real solo cuando la aplicación funcione.

**Nota de presentación:** No afirmar que automatizamos la resolución económica de disputas o identificamos fraude. La selección del proyecto prioriza un resultado evaluable y datos utilizables, no una demanda bancaria estimada sin evidencia.

## 2. Lo que los datos permiten, y lo que no

**Mensaje principal:** Validamos relaciones antes de automatizar; un ID existente no garantiza titularidad.

| Hallazgo medido | Decisión de ingeniería |
|---|---|
| 10.903 compras de tarjeta Approved, de 10.036 clientes | Identificar el cargo mediante transacción y producto con titular coherente |
| 531 compras aprobadas sin comercio | Admitir ausencia si el cargo es inequívoco; nunca completar con invención |
| 448 quejas con producto; 0 propietarios coincidentes | Excluir esa unión del expediente operativo |
| 1.748 transcripciones, todas ES; 42 textos de cliente distintos con “saldo” | No tratarlas como etiquetas de disputa ni corpus portugués |

**Pie de evidencia:** Datos sintéticos. Doce cortes temporales, no aleatorios. No estiman prevalencia real de reclamos. Análisis local reproducible: `dispute-intake-profile.json`, `relations-profile.json`.

**Visual propuesto:** Dos columnas, “Usamos para recibir una solicitud nueva” y “No usamos como evidencia de esa solicitud”, cada una con la decisión correspondiente. Nada de filas individuales.

## 3. El flujo completo, con límites observables

**Mensaje principal:** El sistema pide aclaración, permite corregir y solo confirma resultados verificados.

1. Sesión confiable de prueba; búsqueda de compras propias.
2. Interpretación ES/PT; selección inequívoca de la transacción.
3. Declaración mínima del cliente separada de hechos de fuente.
4. Borrador revisado; confirmación ligada a su versión.
5. Escritura idempotente; lectura posterior; recibo y vista de agente.

**Caso humano:** Pending/Reversed/Declined, información crítica inconsistente o solicitud fuera del alcance. Se transfieren hechos, alegaciones, acciones realizadas y preguntas pendientes.

**Visual propuesto:** Tres capturas verificadas: aclaración ES, confirmación, handoff PT. Marcar con claridad las rutas que aún no estén implementadas; no presentar mockup como evidencia de ejecución.

## 4. El modelo interpreta; el servicio controla

**Mensaje principal:** La autorización y las acciones no dependen de una respuesta persuasiva del LLM.

```text
Fuentes privadas autorizadas / fixtures públicos propios
                 ↓ contratos · titularidad · versión
         Snapshot mínimo y trazable
                 ↓
UI ES/PT → intérprete aprendido → herramientas tipadas
                 ↓                   ↓
            aclaración         sesión · permisos · estado
                                     ↓
                         borrador + consentimiento específico
                                     ↓
                         persistencia atómica + readback
                                     ↓
                         recibo · bandeja de agente · trazas
```

- Idempotencia y prevención de duplicados, incluidos envíos concurrentes.
- Instrucciones en mensajes o datos carecen de autoridad sobre herramientas.
- Reintentos limitados, fallo explícito, fallback y política de retención.
- Las etiquetas de sandbox no sustituyen pruebas de aislamiento.

**Estado de evidencia:** Sustituir este diagrama por componentes realmente implementados antes de cerrar la presentación; explicar cualquier diferencia.

## 5. Evaluación: mismo workload, resultados honestos

**Mensaje principal:** Comparamos contra un baseline y hacemos visibles los errores.

| Medida | Baseline [VERSIÓN] | Reclama [VERSIÓN] |
|---|---:|---:|
| Casos reservados ES / PT | PENDIENTE | PENDIENTE |
| Recepción segura / todos los casos del alcance | PENDIENTE | PENDIENTE |
| Intentos de automatización / casos | PENDIENTE | PENDIENTE |
| Transferencias requeridas omitidas / requeridas | PENDIENTE | PENDIENTE |
| Incidentes de acceso/acción / intentos | PENDIENTE | PENDIENTE |
| p50 / p95 E2E | PENDIENTE | PENDIENTE |
| Costo por intento / recepción segura | PENDIENTE | PENDIENTE |

**Preparación ya realizada, no resultado de la app:** se diseñaron 58 casos de aceptación / 116 variantes ES/PT. Son pruebas visibles de desarrollo, no held-out. Conversaciones de evaluación propias y etiquetadas; separar familias, clientes/transacciones y pares ES/PT. Validar la calidad del portugués con revisión humana.

**Visual propuesto:** Gráfico o tabla solo desde reporte real. Mostrar un fallo concreto y la corrección/limitación. No dibujar barras con cifras objetivo ni anunciar “0 riesgo”.

**Nota de presentación:** Si no se completa la evaluación, decir que está pendiente; no afirmar que se cumple el requisito ni ocultar n=0.

## 6. Qué entregamos y qué falta para un banco real

**Mensaje principal:** Un flujo reproducible, con alcance y fronteras explícitos.

**Checklist para marcar únicamente tras verificar:**

- [ ] Cliente ES/PT y bandeja de agentes persistentes.
- [ ] Modelo aprendido ejecutado y baseline comparable.
- [ ] Contratos de datos, pruebas críticas y reporte de evaluación.
- [ ] Reproducción limpia, versiones y límites operativos documentados.
- [ ] Video <3 minutos, GitHub público seguro y acceso verificable al prototipo.

**Límites:** Fuentes sintéticas; conversaciones propias; banco/política real no integrados; no adjudicación, reembolsos ni dinero. Latencia/costo offline no prueban ahorro de producción. Antes de operar: identidad real, autorización institucional, política documentada, integración con gestión de casos y validación con datos autorizados representativos.

**Enlaces finales:** [URL REAL DEL PROTOTIPO] · [REPOSITORIO VERIFICADO] · [REPORTE DE EVALUACIÓN]. Mantener placeholders hasta disponer de destinos reales; comprobar acceso desde sesión independiente.

---

Fuentes oficiales: [enunciado](https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4J2YFMHC/factored_ai___data_hackathon_2026__1_.pdf), [kickoff](https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4EU9MQS1/datathon_2026_kickoff.pdf), [duración máxima del video y cierre](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809). Esta pieza reutiliza hechos ya verificados en el registro local; no afirma una revisión nueva de Slack el 29 septiembre.
