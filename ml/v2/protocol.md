# Protocolo v2 fijado antes del holdout independiente

El agente de entrenamiento no accede a `research/build-assets/heldout-v2` antes
de congelar modelo, umbrales y decisión de uso y notificarlo al coordinador.
No se modifica ningún artefacto de v1.

## Datos

- Entrenamiento: exclusivamente la partición train de v1 más familias bilingües
  generadas por Gemma2 9B local, sin transferir registros bancarios.
- Validación: 64 familias nuevas ES/PT, 128 mensajes, escritas por un agente IA,
  con propósito principal explícito y situaciones variadas. No son validación
  humana ni evidencia representativa de consultas reales.
- Cada pareja ES/PT permanece en una partición. Rechazar duplicados normalizados
  y eliminar del entrenamiento familias con Jaccard de palabras >=0,80 respecto
  de un ejemplo de validación en el mismo idioma.
- No fabricar miles de ejemplos por sustitución de nombres/importes. Conservar
  toda generación cruda, metadatos, rechazos y ediciones de placeholders.
- Etiquetas Gemma son las pedidas en el prompt: no fueron adjudicadas por humanos.

## Candidatos y selección

Nueve regresiones logísticas: features word, char o hybrid, cada una con C 1, 4 o
12; class_weight balanced; TF sublineal, IDF suave, norma L2, min_df 2, máximo
3500 términos. Tokenizar NFKD sin marcas U+0300–U+036F, minúsculas, `[a-z0-9]+`.
Word utiliza palabras y bigramas adyacentes; char utiliza n-gramas 3/4/5 por
palabra, rellenada con un espacio en ambos extremos. El export describe el modo.

Elegir macro-F1 de validación; desempatar exactitud, menor número de features y
C más bajo. No optimizar contra el nuevo holdout.

Calibrar una rejilla fija de score mínimo [0,2;0,3;0,4;0,5;0,6;0,7;0,8], margen
[0;0,05;0,1;0,2;0,3], cobertura de features [0,25;0,5;0,65]. Exigir exactitud
selectiva >=95%, al menos ocho `unrecognized` aceptados y cero falsos aceptados
de esa clase en validación; maximizar cobertura. Si no existe combinación,
abstener en todo. No relajar estas condiciones tras observar el holdout.

**Uso máximo permitido:** sugerencia revisable; confirmación explícita siempre.
Incluso si pasan los criterios, este clasificador no autoriza ni abre disputas.
Ninguna probabilidad softmax se presenta como calibración de riesgo de fraude.

## Evidencia que se exige antes de promoción

Resultados del holdout independiente contra baseline fijo y v1; errores por
clase e idioma, cobertura, falsos positivos y fallos de inferencia. Si fracasa,
conservar v1 o formulario explícito, sin ocultar el resultado.

La API local utilizada está documentada en
[Ollama Generate](https://docs.ollama.com/api/generate). No se descargaron pesos,
abrieron puertos públicos ni usaron claves de proveedores.
