# Evaluación local de contratos y resultados del flujo

Actualizado el 30 de septiembre de 2026 sobre una D1 local migrada, con datos ficticios. No mide producción, clientes independientes ni decisiones financieras.

## Resultados observados

| Trabajo | Resultado | Qué demuestra |
| --- | ---: | --- |
| Integración HTTP | 28/28 | Sesión local, propiedad, consentimiento, persistencia, idempotencia, concurrencia, timeout y rol de agente. La ejecución creó cuatro intakes preparados con compras aprobadas. |
| Contratos bilingües | 160/160 | Dieciséis pares escenario/idioma repetidos diez veces. Leyó hechos, creó borradores y comprobó que las respuestas consultivas no escriben casos. **Cero casos creados por este probe.** |
| Handoff persistido | 2/2 | Una compra Pending en ES y una Reversed en PT terminaron como `support_handoff`, con relectura y evento de auditoría. La otra persona de demo recibió 404 al consultar cada caso. |
| Tres recorridos preparados completos | 15/15 | Cinco intakes ES, cinco aclaraciones PT sin escritura y cinco handoffs PT persistidos con auditoría y relectura. 70 solicitudes medidas; no incluye login ni interacción de navegador. |

Informes nuevos: [integración](http-integration-rerun-2026-09-30.json), [contratos](workflow-api-rerun-2026-09-30.json), [handoff](handoff-rerun-2026-09-30.json) y [recorridos completos](full-case-rerun-2026-09-30.json). Los cuatro tienen `gate_passed: true`. Son rutas preparadas, repetidas con datos inventados; los actores locales no prueban aislamiento entre dos cuentas reales.

**Corrección de evidencia:** el informe [histórico de contratos](workflow-api-report.json) atribuyó dos handoffs a los cuatro casos identificados de la integración anterior. Al repetir el harness actual, los cuatro casos fueron `dispute_intake`. Por ello retiramos el **2/4** histórico como tasa actual de reparto y medimos el handoff con dos rutas específicas. Esos seis casos preparados tampoco constituyen un denominador representativo de todas las consultas. El número de resoluciones financieras sigue siendo cero por diseño.

En los 160 pedidos secuenciales del servidor de desarrollo, el p50 por escenario fue de **5,93 a 7,49 ms** y el p95 de **9,35 a 36,47 ms**, con sólo diez repeticiones por escenario. Son latencias de petición HTTP local. En los 15 recorridos completos preparados, p50/p95 de secuencia fue **88,33/204,16 ms** para intake ES, **20,49/31,35 ms** para aclaración PT y **69,92/80,14 ms** para handoff PT, con n=5 por ruta y p95 igual al máximo. Esta segunda medida incluye API hasta relectura/auditoría o comprobación de no escritura; excluye login, navegador, espera humana y red alojada. [Modelo de costo y faltantes](CASE_COST_MODEL_2026-09-30.md): costo total y costo por caso **desconocidos**. La inferencia empaquetada no usa un proveedor externo de modelo en esta ruta; no equivale a costo total cero. No se extrapola a latencia o ahorro operativo de un banco.

La comparación aprendida tiene su propio [reporte reservado](../../ml/v2/test-report.json): 218/256 frente a 168/256 reglas sobre los mismos textos sintéticos. No se añade su denominador al de las pruebas HTTP; el modelo sólo sugiere una hipótesis y no autoriza escrituras.

## Reproducción

Desde la raíz de este repositorio, con Node instalado y una D1 **local nueva**:

```sh
npm run build
npm run db:local
npm run dev
```

En otra terminal, tras abrir el preview local:

```sh
python3 tests/http-integration.py --base-url http://127.0.0.1:5173 --output /tmp/reclama-http.json
python3 tests/http-handoff.py --base-url http://127.0.0.1:5173 --output /tmp/reclama-handoff.json
python3 tests/workflow-probe.py --base-url http://127.0.0.1:5173 --repeats 10 --output /tmp/reclama-contracts.json
python3 tests/full-case-probe.py --base-url http://127.0.0.1:5173 --repeats 5 --output /tmp/reclama-full-case.json
```

Las dos primeras suites crean expedientes ficticios y no borran datos. Para repetirlas completas se necesita otra base local limpia o un recorrido nuevo sin casos en las mismas transacciones. La autenticación sigue la navegación local documentada; el script no construye identidad SIWC ni sale de loopback. Esta secuencia no verifica login alojado, revisión humana del portugués, retención, eficacia de un agente real ni la supervivencia del servicio alojado tras recarga.
