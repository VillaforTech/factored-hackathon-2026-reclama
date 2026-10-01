# Paquete concreto para aprobación de Roberto

**Estado actualizado al 1 de octubre:** consultar la [matriz de requisitos, evidencia y decisiones](evidence/REQUIREMENTS_EVIDENCE_MATRIX_2026-10-01.md). La tabla siguiente es una fotografía anterior a la integración y no identifica el despliegue ni el PR actuales.

**Corte: 30 de septiembre de 2026. Ninguna acción de publicación/entrega se había ejecutado entonces.** El 1 de octubre Roberto autorizó integrar estos cambios, hacer push al repositorio privado y desplegar conservando el acceso restringido actual. No autorizó hacer público el repositorio, ampliar la audiencia ni enviar la entrega al organizador. Las tablas siguientes documentan el estado anterior a esa integración.

## Estado comprobado y destino

| Elemento | Estado / URL exacta |
| --- | --- |
| Demo existente | https://reclama-factored-2026.villafortech.chatgpt.site — despliegue V4 `appgdep_6abc41d5cde881919301dbe4432d28f0`, estado `succeeded`, fuente `6715df4936a1c7f18064ea7210d1d1172f024c10` según Sites. No es el código local nuevo. |
| Acceso actual de Sites | Política `custom`: Roberto y dos invitados externos del equipo (Jorge y Daniel); invitaciones externas habilitadas. No se confirmó acceso de jueces ni inicio de sesión normal desde dos cuentas reales. |
| Repositorio destino | https://github.com/VillaforTech/factored-hackathon-2026-reclama — privado, rama predeterminada `codex/reclama`, fuente actual `6715df4936a1c7f18064ea7210d1d1172f024c10`. |
| Trabajo local pendiente | Clon aislado `task-4/reclama`, sobre el mismo SHA, con cambios **sin commit ni push**: receta y sondas reproducibles, corrección ES/PT, matrices de evidencia, deck/PDF/video V4. Checkout original `/Users/villafuertech/Documents/ChatGPT/Factored-Hackaton/app` intacto y limpio en el mismo SHA. |

La [página oficial del hackathon](https://www.factored.ai/careers/ai-data-hackathon) pide expresamente **repositorio GitHub público** con nombre `factored-hackathon-2026-[your-team-name]`, enlace funcional a solución desplegada, presentación de 4–6 diapositivas y video. No dice explícitamente que la demo deba permitir acceso anónimo. Dejar el repositorio privado incumpliría literalmente ese requisito salvo excepción escrita del organizador; hacer público el repo expondría todo el historial/archivos visibles de esa rama a cualquiera. La modalidad de acceso a la demo debe permitir que la audiencia evaluadora pruebe el enlace y sus cuentas.

## Decisiones exactas y estado al 1 de octubre

1. **Integración y despliegue — autorizado el 1 de octubre:** convertir el diff del clon en commit revisado sobre `codex/reclama`, hacer push y desplegar **el SHA nuevo exacto** a la URL existente, conservando `custom`. Implica reemplazar la V4 alojada; se verificará versión/SHA y funcionamiento después.
2. **Privacidad del repositorio:** autorizar cambio de privado a público para cumplir la regla textual, tras revisar el árbol y el historial para secretos/datos ajenos; o aportar excepción escrita del organizador y decidir mantenerlo privado. No se hará el cambio por inferencia.
3. **Acceso de jueces a la demo:** indicar identidades/correos autorizados de evaluadores o mecanismo acordado para darles acceso al sitio. Con política `custom`, la URL por sí sola no demuestra entrada para terceros. No se propone crear cuentas ni abrir acceso público sin instrucción específica.
4. **Prueba alojada:** disponer de dos cuentas reales autorizadas para el sandbox, con titulares de demostración distintos, o facilitar dos miembros del equipo que hagan la prueba. Ensayo: login normal de A, selección de compra, intake y relectura tras recarga; login normal de B, comprobar 404/no acceso al caso de A y crear/leer su propio handoff; volver a A y comprobar aislamiento. Registrar capturas sin credenciales ni datos sensibles. La identidad local simulada no sustituye esta prueba.
5. **Entrega:** después de aceptación y revisión del material, autorización separada para enviar URLs y PPTX/PDF/video a `hackathon.admin@factored.ai` y comprobar recibo. El envío, permisos e invitaciones siguen pendientes.

El plazo **5 de octubre de 2026 a las 23:59 de Guayaquil** consta en una aclaración de Slack del 28 de septiembre; la página pública sólo muestra el intervalo 25 de septiembre–5 de octubre. Se debe revalidar el anuncio vigente antes de enviar. Hay una respuesta de Slack sobre datos/mock todavía no verificada; este paquete no la interpreta como autorización. Diego de Factored ofreció ayuda técnica, pero no se le contactó.
