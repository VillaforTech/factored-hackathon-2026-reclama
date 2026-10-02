# Reclama — matriz de requisitos, evidencia y decisiones

**Actualización: 2 de octubre de 2026.** Se conserva la identidad del archivo iniciado el 1 de octubre. Material privado para revisión; sin entrega a organizadores. Este corte añade la grabación interactiva y registra autorización de rama privada/PR borrador; no autoriza merge ni deploy. La página oficial y las dos aclaraciones de Slack se releyeron hoy. El Google Doc del reto no fue accesible mediante el navegador web de esta ejecución; no se atribuyen a él requisitos nuevos.

## Fuentes oficiales y alcance

La [página oficial](https://www.factored.ai/careers/ai-data-hackathon) exige repo público, enlace funcional desplegado, 4–6 diapositivas, video máximo tres minutos e interacciones ES/PT. No especifica demo anónima. [Antonio confirmó](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809) 5 de octubre, 23:59 UTC−5. [Diego respondió sobre mocks](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549?thread_ts=1790698838.166839): permite generarlos con contexto pero excluye testing. El alcance para fixtures de QA de software no quedó aclarado; no se presume aceptación del experimento sintético como evaluación del reto. No se contactó a nadie.

Revisión competente de portugués, escucha humana y aceptación con dos cuentas reales son controles internos recomendados, no condiciones textuales adicionales que atribuyamos al organizador.

## Matriz

| Criterio | Evidencia comprobada | Estado y límite |
| --- | --- | --- |
| Flujo focalizado y seguro | [Recorrido API del 2 oct](full-case-rerun-2026-10-02.json): 5/5 intakes ES guardados y releídos con auditoría; 5/5 ambigüedades PT aclaradas sin crear caso; 5/5 handoffs PT guardados y releídos. | QA local con datos inventados. No aceptación alojada, benchmark independiente ni resolución financiera. |
| Interacciones ES/PT | [Revisión automática del 2 oct](language-review-2026-10-02.json): 195 pares literales, dos pares dinámicos y tres consultas de tablas; 18 claves del asistente por idioma con claves y placeholders iguales. Inspección automática de textos y tablas. | Se añadió PIN al error PT de datos sensibles. Build, TypeScript y lint posteriores pasaron. La documentación técnica `/guia` está en español; los flujos de cliente y revisor tienen ES/PT. Revisión humana PT pendiente. |
| Autorización y consentimiento fuera del modelo | Backend conserva identidad, titularidad, borrador inmutable, confirmación, idempotencia y auditoría. [28/28 HTTP previos](http-integration-final.json), más los nuevos 15 recorridos. | La suite HTTP completa es evidencia previa, no se volvió a ejecutar hoy. El modelo no autoriza acciones. Dos cuentas reales siguen sin acreditar. |
| Componente aprendido y baseline | Modelo congelado; 218/256 vs. 168/256 en el mismo conjunto, preservados como resultado histórico. [Corrección de procedencia](EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md); 6/6 comprobaciones pasaron hoy. | 256 mensajes/etiquetas de autoría IA, 128 familias ES/PT, sin registros del organizador ni revisión humana. **No es validación independiente ni benchmark admisible del reto.** |
| Métricas y costo | 15 intentos, 70 solicitudes medidas; tabla siguiente. [Modelo condicional de costo](CASE_COST_MODEL_2026-09-30.md), tarifas revalidadas hoy. | Costo total desconocido; no USD 0. Sin tasa de resolución segura sobre workload representativo. Cero resoluciones financieras por diseño. |
| Demo desplegada | [URL existente](https://reclama-factored-2026.villafortech.chatgpt.site): Sites V6, despliegue `appgdep_6abedf7171988191b1c8c4c75229a1e2` correcto; fuente `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`. | `custom`, revisión 4, propietario y dos invitados autorizados. GET anónimo 401. Login normal, recarga y aislamiento A/B no corridos aquí; el hilo padre coordina la sesión segura en su navegador cloud y sigue pendiente la prueba de dos identidades reales. |
| Repositorio público | [Repo](https://github.com/VillaforTech/factored-hackathon-2026-reclama), rama `codex/reclama`, SHA `3ae216e`; [PR #1](https://github.com/VillaforTech/factored-hackathon-2026-reclama/pull/1) integrado y [CI del SHA](https://github.com/VillaforTech/factored-hackathon-2026-reclama/actions/runs/36935070857) correcta. | **Sigue privado: requisito de público pendiente.** No hay excepción escrita. Confirmar nombre inscrito del equipo. CI no acredita aceptación alojada. |
| Presentación | PPTX/PDF V5, seis diapositivas; hashes coinciden con [recibo de render](../presentation/render-v5.json). Exportaciones inspeccionadas previamente y preservadas. | V4 obsoleto. Revisión del equipo y edición nativa en PowerPoint no acreditadas. |
| Video | [Grabación interactiva V6](../video/interactive-v6/README.md): 107,320 s, 1440×1000/25 fps, 9/9 comprobaciones, 14 subtítulos coincidentes. [Manifest](../video/interactive-v6/manifest.json) y recibo conservados. | Captura continua de clicks automatizados en localhost, sin cortes/aceleración; no login alojado. Narrativa textual, sin voz. V5 se conserva como montaje de referencia. |
| Entrega | Destino oficial: `hackathon.admin@factored.ai`. [Borrador](../SUBMISSION_DRAFT.md) no enviado. | Sin recibo. Envío, privacidad y ampliación de audiencia requieren autorización expresa. |

## Denominadores y latencia local del 2 de octubre

| Escenario | Intentos correctos / total | p50 / p95 de secuencia | Solicitudes medidas |
| --- | --- | --- | --- |
| Normal ES | 5/5 intakes persistidos y releídos | 110,15 / 265,60 ms | 30 |
| Ambiguo PT | 5/5 aclaraciones sin caso nuevo | 37,01 / 54,38 ms | 10 |
| Handoff PT | 5/5 solicitudes de soporte persistidas y releídas | 101,37 / 104,55 ms | 30 |

Reloj del primer mensaje hasta relectura/auditoría y conteo final, excluyendo login, preparación de run, navegador, red alojada, interacción y revisión humana. Cinco muestras por escenario; p95 por rango más cercano equivale al máximo. Servidor de desarrollo local compartiendo Mac con un build concurrente, sin controlar carga ni aislar arranque frío: son tiempos observados, no comparación de rendimiento ni SLA. No sumar estos intentos con 160 aserciones repetidas ni con 28 casos de prueba HTTP.

70 es el número de solicitudes dentro de las secuencias cronometradas; hubo solicitudes adicionales de preparación fuera del reloj. No hubo fallos de recorrido (0/15), pero el diseño preparado no estima inseguridad o daño en población real. El hash del modelo antes/después es idéntico: `cb5be3f82c25aa337767c0f479b12a9b4c5d3cf5409d8b7d3ff0be3d6e51226a`.

### Costo

CPU facturable, filas D1, almacenamiento, factura e infraestructura de Sites no medidos. El [modelo de costo](CASE_COST_MODEL_2026-09-30.md) usa tarifas condicionales de [Workers](https://developers.cloudflare.com/workers/platform/pricing/) y [D1](https://developers.cloudflare.com/d1/platform/pricing/) revalidadas el 2 oct; no se confirmó que sean el plan facturado del sitio. La inferencia empaquetada no necesita API externa de modelo; esto no convierte el costo total en cero. Costo por resolución financiera no definido, al no haber resoluciones financieras.

## Pruebas pasadas, fallidas y no corridas

- **Grabación interactiva:** 9/9 verificaciones y decodificación completa; subtítulos externos/incrustados 14/14; revisión visual de toda la secuencia mediante 36 muestras cada tres segundos y cuatro vistas ampliadas. La primera toma falló por un selector del contador; la segunda pasó completa, sin editar la primera para fingir continuidad.
- **Pasadas hoy:** `npm run check`, `npm run build` tras la corrección PT; `npm run test:provenance` 6/6 (modelo/materiales congelados intactos); 15/15 recorridos preparados; comparación de claves/placeholders ES/PT; `git diff --check`.
- **Advertencias sin fallo:** build advierte de `module.register()` deprecado y clasificación estática de rutas incompleta en vinext. No se cambiaron dependencias por estas advertencias.
- **Bloqueo de entorno ya resuelto:** primera inicialización local de D1 necesitó permiso para loopback; la ejecución posterior funcionó. Se cerró el único servidor de esta tarea, puerto 5357.
- **No corridas hoy:** suites completas HTTP/contexto/paridad (con evidencia previa/CI existente), login alojado/recarga/A-B, revisión humana PT, escucha humana y ASR semántico, evaluación independiente, costo facturable. Las comprobaciones técnicas anteriores de subtítulos/audio siguen asociadas al MP4 V5 cuyo hash no cambió.

## Separación local/remoto/entrega

- **Local nuevo:** `task-4/reclama-acceptance-v6`, rama `codex/reclama-acceptance-v6-20261002`. Un cambio de texto PT, documentación/evidencia y grabación/script locales. Commit/push privado y PR borrador autorizados; merge/deploy pendientes. Sin cambio del modelo, backend o permisos. Original `Documents/ChatGPT/Factored-Hackaton/app` limpio en `6715df4`; las otras copias estaban y siguen limpias.
- **Remoto:** privado; base `codex/reclama` en `3ae216e`. PR #1 ya integrado, CI correcta. No presentar esa integración previa como pendiente ni como trabajo remoto ejecutado hoy.
- **Alojado:** V6 desde `3ae216e`. La corrección PT nueva no está desplegada. No se realizó ningún nuevo despliegue.
- **Entrega:** no confirmada; no se envió correo, invitación ni material al organizador.

## Archivos nativos de Library confirmados

| Artefacto vigente | Identidad y versión de Library | Acceso al archivo |
| --- | --- | --- |
| PPTX V5 | `libfile_2903b3baa6048191b0ea20acb3b7b8a3`, versión 1 | [Descargar PPTX](https://chatgpt.com/api/library/files/libfile_2903b3baa6048191b0ea20acb3b7b8a3/download) |
| PDF V5 | `libfile_b38a58b1715c81918bfcb742f6ddc0b5`, versión 1 | [Descargar PDF](https://chatgpt.com/api/library/files/libfile_b38a58b1715c81918bfcb742f6ddc0b5/download) |
| MP4 V5 | `libfile_ed7387abeea48191b6e2af7920f17acf`, versión 1 | [Descargar video](https://chatgpt.com/api/library/files/libfile_ed7387abeea48191b6e2af7920f17acf/download) |
| MP4 interactivo V6 | `libfile_f5b35f28dae88191b47ae89ba8235bc5`, versión 0 | [Descargar grabación real local](https://chatgpt.com/api/library/files/libfile_f5b35f28dae88191b47ae89ba8235bc5/download) |
| SRT interactivo V6 | `libfile_7f35053934f88191ad759fd0cf1aa3d0`, versión 0 | [Descargar subtítulos](https://chatgpt.com/api/library/files/libfile_7f35053934f88191ad759fd0cf1aa3d0/download) |
| Manifest interactivo V6 | `libfile_8be706f0e53c81918977983db036cbf2`, versión 0 | [Descargar manifest](https://chatgpt.com/api/library/files/libfile_8be706f0e53c81918977983db036cbf2/download) |
| Esta matriz | `libfile_0cad1f86ce7c8191abf96eeb27e405a2`; conservar identidad, versión final indicada en recibo de guardado | [Abrir matriz vigente](https://chatgpt.com/api/library/files/libfile_0cad1f86ce7c8191abf96eeb27e405a2/download) |

No se duplicaron ni reescribieron PPTX/PDF/MP4. Los enlaces relativos de evidencia apuntan al checkout; los JSON nuevos sólo estarán en GitHub después de integrar el diff autorizado.

## Paquete de aprobación para Roberto

[Detalle y pasos A/B](../ACCESS_APPROVAL_2026-09-30.md). Decidir por separado:

1. Commit/push privado y PR borrador ya autorizados. Aprobar por separado merge desde `codex/reclama-acceptance-v6-20261002` hacia `codex/reclama` y despliegue del SHA resultante conservando `custom`. Sustituiría V6 por la corrección PT; V5 ya está integrado.
2. Publicar el repositorio después de revisar árbol e historial, o aportar excepción escrita. Consecuencia: código, medios e historial visibles para terceros. No hacerlo por inferencia.
3. Facilitar identidades/correos exactos de jueces y autorizar sus invitaciones o acordar otro mecanismo. No se requieren nuevas cuentas para la prueba de equipo: ya hay propietario y dos invitados; sí hacen falta dos personas con sesiones reales independientes y un navegador controlable.
4. A crea un caso ES, recarga y verifica el mismo expediente; B no puede leerlo/listarlo y crea un handoff PT propio; A tampoco accede al caso B. Guardar recibos/capturas sin credenciales. La identidad simulada de Ana/Lucas no demuestra aislamiento de cuentas.
5. Revisar medios, confirmar el nombre de equipo y autorizar expresamente envío a `hackathon.admin@factored.ai`; después conservar recibo. Consultar a Diego sobre evaluación sólo con permiso separado.

**Diferenciación defendible:** una recepción recuperable y explicable: selección de compra propia, hechos separados del relato, consentimiento ligado al borrador, recuperación sin duplicado y handoff con preguntas pendientes. Las pruebas internas acreditan comportamientos concretos; no demuestran ahorro bancario, superioridad frente a competidores ni novedad absoluta.
