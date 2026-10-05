# English recording kit — user records the final demo

No new video has been generated. Record your own screen and English narration. Keep the customer interactions in Spanish and Portuguese. A face is not required. Target **165–175 seconds**, maximum 180. Timing below is a rehearsal plan, not a measured recording duration. The script has 227 words; rehearse once at your natural pace and leave time for the clicks. Do not accelerate or splice a failure into a success without disclosure.

## Prepare before recording

1. Use the final approved deployment if available. Otherwise show the **local sandbox URL** and say so explicitly; a local video does not fulfill the working-deployment requirement by itself. The hosted guide currently differs from the local English guide.
2. Follow `REPRODUCTION.md`. Open `http://127.0.0.1:5357`, let the first compilation finish, click **Entrar con ChatGPT**, then **Iniciar sandbox**. This is local mock sign-in, not hosted login. Use a desktop browser with 1440×1000 viewport or comparable readable size. Hide unrelated tabs/notifications. Enter fictional examples only.
3. Leave identity **Ana · ES** selected. Open **Nuevo recorrido** → **Crear recorrido**, then **Guía de 3 minutos**. Each new run preserves prior cases. Do not reset the database. Put the exact snippets below in a plain-text scratchpad for quick paste.
4. Open the six-slide English PDF to slides 3 and 5 in a second tab. The click path was rehearsed automatically on 5 October without recording: nine workflow assertions plus one mobile overflow check passed. The first cold compile exceeded a 12-second harness timeout; warm startup succeeded. This does not measure your speaking or recording speed.

## Narration and exact click path

| Target time | English narration | On-screen action |
| --- | --- | --- |
| 0–15 s | “Reclama turns an unclear card charge into an auditable request for human review. This is our local sandbox with fictional data. It never issues refunds or decides fraud.” | Show the local URL and Ana's fresh run. If recording a verified hosted deployment, replace only “local sandbox” with “hosted sandbox”. |
| 15–40 s | “In Spanish, I describe an unrecognized purchase. Two charges match. The assistant asks me to choose instead of guessing. I select the exact charge and confirm the reason.” | Paste ES message below into **Mensaje al asistente** → **Enviar mensaje**. Show both Luna Digital cards. Select the card displaying **02:22** (14:22 in the underlying source), then **Confirma el motivo** → **Cargo no reconocido**. Paste the ES statement. |
| 40–65 s | “The review separates transaction facts from my unverified statement and unanswered questions. Consent starts unchecked. Only my explicit confirmation creates the request. The receipt means received for review, not money returned.” | **Revisar antes de enviar**. Show disabled **Confirmar y registrar**. Check consent, then click it. Show receipt. |
| 65–85 s | “After reloading, the same case is still present. A simulated reviewer adds a note. The case version and audit trail retain the change.” | Reload. **Mesa de revisión** → new case ID → **Cerrar**. **Entrar como revisor demo** → same case → **Nota para el siguiente revisor**. Paste note → **Marcar en revisión**. Show version 2 → **Cerrar** → **Volver a cliente** → **Atención**. |
| 85–120 s | “In Portuguese, this purchase is already reversed. Reclama prepares a support handoff. I deliberately simulate a lost response after the save. Retrying the same request recovers the existing case rather than creating another one.” | Identity → **Lucas · PT**. **Novo percurso** → **Criar percurso** → **Guia de 3 minutos**. Paste PT message → **Enviar mensagem** → **Oficina Prisma** candidate → **Confirme o motivo** → **Compra não reconhecida**. Paste PT statement. **Simular perda de resposta** → **Revisar antes de enviar**, consent → **Confirmar e registrar**. Show simulated error → **Repetir a mesma solicitação**. |
| 120–140 s | “Reloading shows one persisted support case and its receipt. The classifier only suggests intent. Server-side ownership, consent, state checks and idempotency control every write.” | Reload → **Mesa de análise**. Show exactly one row and its case details/audit. Switch to architecture slide 3. |
| 140–170 s | “Fifteen prepared local API sequences passed, but that is software QA. Full corpus review found only forty-seven distinct Spanish inputs. Against an exploratory AI reference, the frozen model did not beat rules, and its gate deferred every input. Independent bilingual evaluation and hosted account acceptance remain open. Total operating cost is unmeasured. Our contribution is a recoverable, inspectable handoff.” | Show slide 5. Keep limitations visible. Finish before 180 s. |

## Paste-ready fictional snippets

ES message: `No reconozco una compra de 84,90 USD en Luna Digital.`

ES statement: `No reconozco la compra de Luna Digital por 84,90 USD del 16 de junio a las 14:22. Solicito revisión humana.`

Reviewer note: `Pendiente contrastar la autorización y solicitar evidencia al comercio. No se ha determinado fraude ni reembolso.`

PT message: `Não reconheço a compra revertida da Oficina Prisma por 63.000,00 ARS.`

PT statement: `Não reconheço esta compra revertida e solicito análise humana.`

## Final video check

Play the actual export from start to finish, verify English narration is intelligible, UI text remains legible, no secrets appear and duration is at most 180 seconds. If captions are added, make explanations English while retaining quoted ES/PT inputs. Human listening has not been performed by this automated review. Do not submit the preserved Spanish-captioned historical video as the final English recording. Publication/upload/submission still requires approval.
