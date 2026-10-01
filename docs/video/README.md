# Reclama: video V5 de revisión

**Estado al 1 de octubre de 2026: el MP4 V5 incorpora las diapositivas, la narración y los subtítulos corregidos. Es un borrador de revisión del equipo; no se ha enviado a los organizadores.**

[MP4 V5](Reclama_demo_v5_review.mp4) · [SRT V5](Reclama_demo_v5_review.srt) · [guion y tiempos medidos](GUION_VIDEO.md) · [manifest de verificación](manifest-v5.json)

La escena 02:03.70–02:24.99 describe un experimento de desarrollo con 256 mensajes creados por IA, agrupados en 128 familias bilingües. No usa registros del organizador ni tiene revisión humana. No constituye validación independiente ni un benchmark admisible del reto. Los resultados 218/256 frente a 168/256 (+19,53 pp) quedan solo como evidencia histórica de desarrollo. Las pruebas 28/28 HTTP, 160/160 aserciones y 2/2 handoffs preparados corresponden por separado a QA de software.

La narración de macOS Paulina (es-MX) tiene 26 frases sintetizadas y 168,298 s medidos. Los 45 subtítulos externos coinciden exactamente, en texto y tiempos, con los incrustados. El MP4 dura 168,300 s, mide 1920 × 1080 a 30 fps y contiene H.264, AAC y mov_text. Pasó decodificación completa sin errores; el pico de audio fue −6,8 dB y no hubo silencios superiores a dos segundos al umbral de −35 dB. Se inspeccionaron fotogramas de las ocho escenas; la revisión fue automática y visual por el asistente, no una aprobación humana del equipo ni una escucha humana de pronunciación.

Es un montaje narrado de capturas locales reales y diapositivas, con datos ficticios; no es una grabación continua de inicio de sesión alojado. La voz genérica de macOS Paulina no pertenece a un integrante del equipo. La escena final declara que la demo y el repositorio son privados, y que faltan acceso de jueces y aceptación alojada con dos cuentas reales.

Pendientes de uso externo: revisión del equipo de pronunciación, legibilidad y cifras; acceso de jueces conforme a las reglas; login alojado, persistencia tras recarga y aislamiento entre dos cuentas reales. El video no demuestra ninguna resolución financiera.

[MP4 V4 histórico desactualizado](Reclama_demo_v4_review.mp4) y [manifest V4](manifest-v4.json) se preservan para auditoría; su audio y diapositiva 5 contienen la afirmación anterior de evaluación. No usarlos como material actual.

`Reclama_demo_draft.mp4`, `Reclama_demo_draft.srt` y `manifest.json` documentan la versión anterior y no son materiales vigentes de entrega: esa narración afirmaba acceso público. No se modificaron esos antecedentes.

La presentación corregida es [PPTX/PDF V5](../presentation/README.md) y es la fuente de las diapositivas del MP4 V5.
