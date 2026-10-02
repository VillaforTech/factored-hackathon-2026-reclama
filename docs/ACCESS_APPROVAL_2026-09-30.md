# Paquete concreto para aprobación de Roberto

**Actualizado el 2 de octubre de 2026.** La autorización previa ya produjo la integración de PR #1 y V6. La instrucción posterior autoriza commit/push en rama privada y PR borrador, sin merge ni deploy. Publicación, audiencia y envío siguen pendientes.

## Estado comprobado y destino

- Demo existente: https://reclama-factored-2026.villafortech.chatgpt.site. V6, despliegue correcto `appgdep_6abedf7171988191b1c8c4c75229a1e2`, fuente `3ae216e005b9625a9bc68e4bbf082d86dec7e53b`. GET anónimo 401; no equivale a fallo del login normal.
- Repo: https://github.com/VillaforTech/factored-hackathon-2026-reclama, **privado**, rama destino `codex/reclama`, mismo SHA, PR #1 integrado y CI correcta.
- Acceso: Sites `custom`, revisión 4, propietario y dos visitantes externos autorizados del equipo. Existen identidades invitadas; no se necesita crear cuentas para pedirles la prueba. Su login efectivo no se ha demostrado. Los correos no se incluyen en este artefacto.
- Pendiente local: rama `codex/reclama-acceptance-v6-20261002` en copia aislada. Único cambio de app: incorporar PIN al error PT de datos sensibles. El resto actualiza estado/matriz, registra resultados reales e incorpora una grabación continua local y su script. Modelo, backend, permisos y materiales V5 sin cambios.

## Decisiones separadas y consecuencias

1. **Merge y despliegue pendientes:** commit/push privado y PR borrador están autorizados en `codex/reclama-acceptance-v6-20261002`. Para integrar en `codex/reclama` y desplegar el SHA exacto conservando `custom` hace falta aprobación adicional. Reemplazaría V6 por la corrección PT; los materiales V5 ya estaban integrados. La aceptación alojada se coordina en el navegador cloud del hilo padre; no se duplicará el login.
2. **Hacer público el repositorio:** la [regla oficial](https://www.factored.ai/careers/ai-data-hackathon) exige repositorio GitHub público `factored-hackathon-2026-[your-team-name]`. Autorizar expresamente el cambio después de revisar archivos e historial, o aportar excepción escrita. La publicación permite acceso de terceros a código, medios, historial e identidades de commits visibles. Confirmar también el nombre de equipo inscrito.
3. **Acceso de jueces:** la regla pide enlace funcional, no establece acceso anónimo. Para conservar `custom` se necesitan correos/identidades exactas de evaluadores y aprobación para invitarlos, o un mecanismo acordado con el organizador. Abrir la demo a todo público sería otra decisión.
4. **Entrega:** aprobación independiente para enviar archivos/URLs finales a `hackathon.admin@factored.ai` y conservar recibo. Publicar o desplegar no acredita entrega. Plazo [revalidado](https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809): 5 de octubre a las 23:59 UTC−5; video máximo 180 segundos.
5. **Aclaración técnica opcional:** autorizar contacto con Diego sólo si se decide consultarle el protocolo de evaluación. La [respuesta sobre mocks](https://factored-hackathon.slack.com/archives/C0BUZCY0TUY/p1790699312315549?thread_ts=1790698838.166839) excluye su uso para testing. El experimento de 256 mensajes no se presenta como evaluación admisible; no se infiere permiso ni se contactó a nadie.

## Prueba alojada con dos cuentas existentes

Control interno de seguridad y credibilidad, no condición textual adicional del organizador. El hilo padre espera el inicio de sesión seguro del usuario en su navegador cloud. Ese flujo no se duplica aquí; aún falta la prueba A/B. No solicitar contraseñas, exportar cookies, crear cuentas ni modificar permisos para simular la prueba.

1. Dos miembros ya autorizados abren la URL desde sesiones normales independientes. Cada persona realiza su propio login. Registrar versión V6, fecha y etiquetas A/B, sin credenciales ni correos en capturas.
2. A crea un recorrido nuevo, elige Ana/ES y la compra aprobada exacta de Luna Digital por USD 84,90 a las 14:22, confirma un relato ficticio y consentimiento. Guardar el identificador del caso que realmente devuelve la app.
3. A recarga, recupera el mismo recorrido y abre el expediente: mismo identificador, transacción, relato, estado recibido y evento `case_received`.
4. B inicia su propio recorrido y comprueba que no lista el caso ni recorrido de A. Una consulta de lectura al ID de A desde la sesión B debe devolver denegación/404 sin datos. No inventar un resultado si no se ejecuta.
5. B, como Lucas/PT, crea un handoff de la compra revertida Oficina Prisma, relee y recarga su propio expediente. A tampoco debe poder leer el caso de B. Ana/Lucas son personas ficticias: el aislamiento requiere identidades de plataforma diferentes.
6. A entra como revisor demo de su espacio y registra una nota factual. Comprobar versión/auditoría; ese rol es simulado, no identidad de empleado bancario.

Registrar cada paso como pasado/fallido/no corrido. Si aparece CAPTCHA o verificación del proveedor, el titular la completa normalmente. Para realizarlo con herramientas aquí hace falta navegador autorizado y controlable; alternativamente los dos miembros pueden aportar recibos y capturas sin secretos.
