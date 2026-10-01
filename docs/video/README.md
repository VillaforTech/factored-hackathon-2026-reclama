# Reclama: video V4 desactualizado, fuentes corregidas

**Estado al 1 de octubre de 2026: el MP4 V4 conserva una afirmación de evaluación del modelo que se retiró de las fuentes. No usarlo para presentar o entregar.** Falta regenerar las diapositivas afectadas, el audio y el video.

[MP4 V4 histórico](Reclama_demo_v4_review.mp4) · [SRT corregido con tiempos provisionales](Reclama_demo_v4_review.srt) · [guion corregido](GUION_VIDEO.md) · [manifest de procedencia y estado](manifest-v4.json)

La escena 02:03.70–02:26.74 ahora describe en guion, narración y SRT un experimento de desarrollo con 256 mensajes creados por IA, agrupados en 128 familias bilingües. No usa registros del organizador ni tiene revisión humana. No constituye validación independiente ni un benchmark admisible del reto. Los resultados 218/256 frente a 168/256 (+19,53 pp) quedan solo como evidencia histórica de desarrollo. Las pruebas 28/28 HTTP, 160/160 aserciones y 2/2 handoffs preparados corresponden por separado a QA de software.

Los tiempos de escenas y subtítulos se conservaron como ventanas provisionales de edición. **El SRT corregido no coincide con el audio ni con los subtítulos incrustados del MP4 existente.** La nueva narración todavía no se sintetizó y su duración y sincronización no están verificadas.

El archivo MP4 histórico dura **169,6 segundos**, mide 1920 × 1080 píxeles a 30 fps y contiene H.264, AAC y subtítulos mov_text. Es un montaje narrado de capturas locales reales y diapositivas, con datos ficticios; no es una grabación continua de inicio de sesión alojado. La voz genérica de macOS Paulina (es-MX) no pertenece a un integrante del equipo.

La escena final dice que la demo y el repositorio son privados, y que faltan acceso de jueces y aceptación alojada con dos cuentas reales. La decodificación, las pistas, el nivel de audio y la inspección de fotogramas anteriores corresponden únicamente al MP4 histórico. No se envió a los organizadores.

Antes de usar una nueva versión, regenerar slide 5 y audio, renderizar el MP4 con los subtítulos corregidos, comprobar todos los textos y tiempos, verificar duración inferior a tres minutos y actualizar hashes. También faltan escucha humana de pronunciación y revisión visual de cada subtítulo. El manifest conserva las comprobaciones antiguas como evidencia histórica, sin atribuirlas a una versión regenerada.

`Reclama_demo_draft.mp4`, `Reclama_demo_draft.srt` y `manifest.json` documentan la versión anterior y no son materiales vigentes de entrega: esa narración afirmaba acceso público. No se modificaron esos antecedentes.

La presentación corregida ya existe como [PPTX/PDF V5](../presentation/README.md). Esto no actualiza las diapositivas incrustadas en el MP4 V4; al re-renderizar, usar V5.
