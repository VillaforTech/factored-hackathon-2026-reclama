# Estado de entrega de Reclama

**Actualización de procedencia, 1 de octubre de 2026:** se corrigieron las fuentes de app/documentación y medios. El resultado del modelo es un experimento de desarrollo de autoría IA, no validación independiente ni benchmark admisible del reto. La presentación V5 ya está regenerada y revisada visualmente; los PPTX/PDF V4 históricos y el MP4 V4 conservan afirmaciones obsoletas. La corrección no despliega ni cambia accesos. [Alcance y evidencia](evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md).

El siguiente corte es histórico, con resultados locales del 30 de septiembre; no acredita la validación del código corregido. Corte local: 30 de septiembre de 2026. Esta copia parte de `6715df4936a1c7f18064ea7210d1d1172f024c10`; los cambios de este corte no se han subido ni desplegado. Sites y GitHub se consultaron en modo lectura; no se ejecutó aceptación alojada nueva.

| Entregable | Estado y evidencia |
| --- | --- |
| Aplicación local | Flujo V3 ES/PT con elección explícita, confirmación versionada, caso persistido, auditoría y vista de agente. Typecheck, lint y build pasaron en esta copia. La aceptación visual previa de escritorio y 390 px está en [BROWSER_V3](evidence/BROWSER_V3.md). |
| Integración y handoff | [28/28 HTTP](evidence/http-integration-rerun-2026-09-30.json), [160/160 contratos](evidence/workflow-api-rerun-2026-09-30.json), [2/2 handoffs ES/PT](evidence/handoff-rerun-2026-09-30.json) y [15/15 recorridos completos preparados](evidence/full-case-rerun-2026-09-30.json) pasaron localmente. Son denominadores separados. [Interpretación, latencias y costo desconocido](evidence/WORKFLOW_API_EVALUATION.md). |
| Modelo | V2 sigue congelado y coincide con el artefacto usado por la app. Resultado histórico de desarrollo: 218/256 frente a 168/256 en textos de autoría IA, sin registros del organizador ni revisión humana; no es validación independiente ni benchmark admisible del reto. Sugiere, no autoriza acciones. Etiquetas y portugués requieren revisión humana. |
| Demo privada | Sites versión 4, fuente `6715df4`, despliegue correcto y política `custom` para Roberto y dos invitados externos del equipo. No se hizo despliegue nuevo en este corte. URL: https://reclama-factored-2026.villafortech.chatgpt.site. |
| Login alojado | Sin prueba completa de login normal, persistencia tras recarga ni aislamiento entre dos cuentas reales. Una prueba anterior se detuvo en la verificación de seguridad del proveedor de identidad; no se eludió. |
| Repositorio | https://github.com/VillaforTech/factored-hackathon-2026-reclama sigue privado según la consulta de solo lectura; rama predeterminada `codex/reclama`. La CI de `6715df4` constaba como correcta; los cambios locales actuales no tienen CI remota. |
| Presentación (actualizada 1 oct) | [PPTX V5](presentation/Reclama_Hackathon_6_slides_v5.pptx) y [PDF V5](presentation/Reclama_Hackathon_6_slides_v5.pdf) corregidos y revisados visualmente; tabla nativa y enlaces conservados. [Verificación](presentation/render-v5.json). Revisión del equipo pendiente. V4/V3 quedan históricos y obsoletos para entrega. |
| Video | [V4 de revisión](video/Reclama_demo_v4_review.mp4), 169,6 s, con 45 subtítulos y escena de acceso privado. El MP4 y sus pistas conservan afirmaciones de evaluación obsoletas; las fuentes corregidas requieren nuevo render. [Revisión automática](evidence/LANGUAGE_VIDEO_AUDIT_2026-09-30.md) completada; escucha y portugués humanos siguen recomendados. Es un montaje narrado, no una sesión continua. |
| Entrega al organizador | Ningún formulario, correo ni recibo final confirmado. |

La [página oficial](https://www.factored.ai/careers/ai-data-hackathon) pide repositorio público, enlace funcional, 4–6 diapositivas y video; no especifica acceso anónimo a la demo. El propietario decidió mantener repositorio y demo privados. [Paquete de aprobación](ACCESS_APPROVAL_2026-09-30.md) precisa consecuencias y verificaciones; esta actualización no cambia accesos. El plazo **5 de octubre, 23:59 UTC−5** procede de la aclaración oficial de Slack registrada el 28 de septiembre; verificar si hubo cambios posteriores antes de la entrega.

## Pendientes de aceptación

1. En navegador normal, iniciar sesión en la demo privada con una cuenta autorizada, crear un caso ficticio, recargar y verificar el mismo expediente.
2. Repetir la consulta de aislamiento con una segunda cuenta real autorizada, sin compartir cookies ni credenciales. Registrar 403/404 y ausencia de datos ajenos.
3. Revisar la presentación V5 y regenerar el video desde las fuentes corregidas; establecer un protocolo de evaluación admisible antes de anunciar rendimiento independiente. Como recomendación interna, obtener revisión humana competente del texto PT y escuchar la locución/subtítulos V4. Registrar correcciones sin retocar el test congelado a posteriori.
4. Acordar el acceso de jueces y los enlaces que realmente podrán abrir; después comprobarlos con su audiencia prevista.
5. Verificar anuncios finales, nombre de equipo, archivos, destinatario y recibo de entrega. El objetivo interno sigue siendo terminar antes de las 20:00 de Ecuador del 5 de octubre.

El sandbox contiene sólo datos inventados. No integra un banco, decide fraude, adjudica disputas ni mueve fondos. Retención, límites de tasa, monitoreo, identidad institucional y costo total siguen fuera del alcance probado.
