# Pruebas HTTP ejecutables de Reclama

El script `http-integration.py` usa únicamente Python 3 y la biblioteca estándar. Efectúa peticiones reales a un sandbox; crea cuatro expedientes propios de fixture por ejecución completa, además de borradores. No borra datos, cambia permisos de hosting, falsifica identidad SIWC, guarda cookies ni envía registros de los organizadores.

## Ejecución local legítima

Con el preview portable iniciado y D1 migrada:

```sh
python3 tests/http-integration.py \
  --base-url http://127.0.0.1:5173 \
  --output /tmp/reclama-http-integration.json
```

El harness navega por `GET /signin-with-chatgpt?return_to=/` con semántica de navegación, sigue solo redirecciones al mismo origen y acepta la cookie emitida por el middleware local documentado. Luego llama a `POST /api/session`. No construye la cookie de SIWC ni inserta cabeceras de identidad. El middleware de desarrollo permite esto únicamente en loopback y su identidad es `local_seedy`; no se incluye en producción.

Fuentes de este mecanismo: `README.md`, `build/sites-vite-plugin.ts` y `app/chatgpt-auth.ts`. No hace falta desactivar controles ni modificar código de autenticación para ejecutar las pruebas.

El resultado observado el 30 de septiembre fue 28/28 en una D1 local nueva; véase `../docs/evidence/http-integration-rerun-2026-09-30.json`. Para comprobar dos handoffs persistidos en ES/PT con la misma base, ejecutar después `python3 tests/http-handoff.py --output /tmp/reclama-handoff.json`. Esa suite crea dos casos ficticios adicionales. Los 160 contratos sin nuevos casos se repiten con `python3 tests/workflow-probe.py --repeats 10 --output /tmp/reclama-contracts.json`; véase `../docs/evidence/WORKFLOW_API_EVALUATION.md`.

Para un sandbox remoto se exige `--allow-remote-sandbox` y `--cookie-jar` obtenido mediante sign-in legítimo. El archivo debe tener permisos 0600. Nunca pasar tokens por CLI, publicarlos ni incluir ese archivo en Git. El harness rechaza redirecciones a proveedores externos: el login alojado se completa mediante navegador, no por una API alternativa. La opción remota es una capacidad, no una afirmación de prueba ya realizada.

## Estado medido al crear este documento

- Primera ejecución: **23/23 pruebas HTTP pasaron**. Evidencia `http-integration-first.json`.
- Exploración adicional encontró **dos fallos** fuera de esos primeros 23: cuatro formas naturales ES/PT con secretos sintéticos se aceptaron en borradores; PATCH válido de agente devolvió 409 aun cuando sí modificó estado/versionado. Evidencia `http-extended-first.json` y `CONTRACT_FINDINGS.md`.
- El harness se amplió a **28 pruebas** para que esos bordes y otros controles se evalúen de forma repetible. El resultado previo 23/23 no se presenta como resultado de estas 28.

`pass` solo significa que las aserciones de ese caso se observaron. `blocked`, `error` o `fail` producen exit code 1; no se cuentan como éxito. Si la base ya tiene casos para demasiadas compras, el script informa `fixture_exhausted`; se necesita una D1 de prueba inicializada por el proceso del proyecto. El script no reinicia ni elimina datos para “hacer pasar” las pruebas.

## Cobertura y límites

Se cubren anonimato, flujo legítimo de sesión, cookies, Origin, aislamiento Ana/Lucas, consentimiento/token, borrador inmutable, estados humanos, persistencia/readback, idempotencia, duplicado con clave nueva, carrera concurrente, fallo después de commit, roles, estado de agente, secreto sintético, lenguaje de declaración, caché y sesión vencida/alterada.

El contrato real crea borradores `support_handoff` para Pending/Reversed/Declined. El test acepta ese camino y verifica que no sean `dispute_intake`; no exige que desaparezca la posibilidad de pedir revisión humana.

No prueba:

- aislamiento entre dos identidades SIWC reales: el mock local solo ofrece una;
- calidad de la clasificación aprendida, mejora frente a baseline, naturalidad de portugués o resultados de un held-out;
- accesibilidad visual, protección CSRF completa de navegador, supervivencia a reinicio de servidor, limpieza de retención o paquetes salientes a proveedores;
- funcionamiento de dinero, fraude o política bancaria real.

Las duraciones de peticiones son evidencia técnica de integración, no p50/p95 de un benchmark del servicio. El reporte no imprime cuerpos privados, cookies o tokens; solo estados, conteos y aserciones sanitizadas.
