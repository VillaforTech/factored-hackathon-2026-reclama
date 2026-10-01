# Reclama: fuentes de presentación V4 corregidas

**Estado al 1 de octubre de 2026: el PPTX y el PDF V4 están desactualizados.** Sus diapositivas aún contienen la comparación del experimento de desarrollo como afirmación de evaluación del modelo. No usarlos para presentar o entregar hasta regenerarlos y revisarlos.

- [PowerPoint V4 histórico de seis diapositivas](Reclama_Hackathon_6_slides_v4.pptx). La estructura y el renderizado se comprobaron antes de esta corrección. No se ha regenerado ni revisado con el contenido corregido.
- [PDF V4 histórico de seis páginas](Reclama_Hackathon_6_slides_v4.pdf). Las páginas 1–4 conservaban el PDF vectorial anterior y las páginas 5–6 eran imágenes rasterizadas del PPTX V4. También requiere regeneración.
- [Contenido y notas corregidos](../SLIDES_6_CONTENT.md) y [contenido visible y evidencia histórica separada](metrics-v4.json).

La diapositiva 5 corregida separa QA de software de evaluación del modelo: 28/28 casos HTTP, 160/160 aserciones repetidas y 2/2 handoffs preparados ES/PT. Estas comprobaciones verifican rutas locales preparadas, sin validar el modelo ni demostrar resolución financiera.

Los 218/256 aciertos del modelo y 168/256 de reglas (+19,53 pp) se conservan solo como evidencia histórica de un experimento de desarrollo: 256 mensajes creados por IA en 128 familias de escenarios bilingües, sin registros del organizador y sin revisión humana. No constituyen validación independiente ni un benchmark admisible del reto. La tabla comparativa y el titular de mejora deben retirarse de la diapositiva renderizada.

La demo y el repositorio siguen privados por decisión del propietario. La diapositiva final indica que faltan la aceptación del login alojado con dos cuentas reales y la decisión sobre acceso de jueces. Ni este PPTX ni el PDF se enviaron a los organizadores. La versión V3 queda como antecedente y contiene afirmaciones de acceso público que ya no deben usarse para la entrega.

El material usa datos de demostración inventados y agregados; no incluye registros originales, credenciales ni archivos que otorguen acceso al dataset. Un expediente recibido requiere revisión humana: Reclama no decide fraude ni emite reembolsos.

## Pendiente antes de usar los archivos

1. Regenerar PPTX y PDF desde estas fuentes, conservando seis diapositivas y colocando los resultados históricos únicamente en notas de procedencia.
2. Revisar visualmente las seis diapositivas, la legibilidad de los límites y los enlaces en ambos formatos.
3. Actualizar hashes y verificaciones después de inspeccionar los nuevos archivos. Las comprobaciones previas pertenecen a los binarios históricos.
