# Reclama intent v2 — modelo congelado, uso orientativo

## Corrección de interpretación · 1 de octubre de 2026

La comparación de 218/256 frente a 168/256 es **un experimento de desarrollo de autoría IA**, no validación independiente ni un benchmark oficial/admisible del reto. Las 128 familias ES/PT reservadas no contienen registros del organizador y no tienen revisión humana. Autores separados, ausencia de duplicados y congelación no establecen independencia de validación. Se conservan modelos, corpus, predicciones, resultados y hashes históricos sin retocar.

See / Véase: [provenance correction](../../docs/evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md).

**Estado:** apto para una sugerencia revisable de intención; **no apto para
enrutamiento autónomo**. Siempre pedir al usuario que elija/confirme el motivo y
permitir «otra consulta». El modelo no autoriza acceso, abre casos ni determina
fraude, elegibilidad o devolución de dinero.

La diferencia frente al baseline de reglas se observa en textos de desarrollo de autoría IA, reservados durante el ajuste; no valida calidad independiente. La mejora frente a v1 es pequeña y no concluyente. La detección de
consultas ajenas sigue siendo débil; no ocultarla detrás del promedio general.

## Datos y procedencia

**634 mensajes de entrenamiento, 317 familias ES/PT**, compuestos de:

- 192 mensajes de la partición train de v1, sin utilizar su validation/test;
- 314 mensajes generados por `gemma2:9b` GGUF Q4_0 en Ollama local;
- 128 mensajes adicionales escritos y curados por un agente de IA.

La validación consta de **128 mensajes nuevos, 64 familias ES/PT**, escritos por
un agente IA. Toda la información es sintética. No se enviaron registros del banco,
datos personales ni credenciales a modelos. No existe revisión humana de etiquetas
ni validación humana de portugués. La cura IA no sustituye esos controles.

La generación local mostró defectos: etiquetas equivocadas, propósito ambiguo,
placeholders, metadatos separados de los pares y tandas que repetían la misma
plantilla cambiando el comercio. Se conservaron las respuestas originales y se
registraron **99 entradas rechazadas** por estructura, etiqueta, repetición o
duplicación. El conteo incluye entradas de metadatos sin mensajes, no solo familias.
Los placeholders se eliminaron de los textos conservados y la edición se registra.
No se infló el volumen para llegar artificialmente a 800 ejemplos.

Los pares de idioma nunca se separan entre train/validation. Se comprueba ausencia
de duplicados normalizados entre particiones y se eliminan del entrenamiento
familias con Jaccard de palabras ≥0,80 frente a validación; no se hallaron esas
coincidencias en el corpus final. Esto no demuestra independencia semántica completa.

Fuentes reproducibles: `raw/`, `curation.json`, `corpus.jsonl`, `corpus-audit.json`,
`training-supplement.tsv`, `validation-source.tsv` y `generate.py`. Las ocho tandas
locales duraron aproximadamente 12 minutos y 12 segundos en total; no incluyen el
primer intento fallido HTTP 500 con contexto 8192. Se redujo a 4096; no se
descargaron pesos ni usaron APIs pagadas. La API está documentada en
[Ollama Generate](https://docs.ollama.com/api/generate).

## Selección y congelación

Se compararon nueve regresiones logísticas: features word, char o hybrid y C de
1, 4 o 12; pesos de clase balanceados, TF sublineal, IDF suave, norma L2, min_df=2
y máximo 3500 features. Se seleccionó macro-F1 de validación; los desempates
fueron exactitud, menor vocabulario y menor C.

Ganó **char, C=12, 3500 features**, con 107/128 aciertos (83,59%) y macro-F1 0,8326
en validación. El baseline fijo obtuvo 65/128 (50,78%), macro-F1 0,5216. Estas cifras
son evidencia de selección, no resultados de test independiente.

La regla de abstención fijada antes de acceder al test exigía ≥95% de exactitud
selectiva, al menos ocho `unrecognized` aceptados y cero falsos aceptados de esa
clase en validación. **Ninguna combinación de la rejilla cumplió todas las
condiciones.** El export conserva `min_probability=1`, `min_margin=1` y
`min_feature_coverage=1`: abstención total. No se relajó el protocolo para mejorar
el test ni la demo.

`FREEZE.json` registra la congelación el **2026-09-29 a las 19:04:13 UTC**, antes de
la autorización y lectura del nuevo holdout. Incluye hashes de modelo, corpus,
scripts, protocolo, validación y paridad.

Modelo: `model.json`, **682.953 bytes**.

SHA256: `cb5be3f82c25aa337767c0f479b12a9b4c5d3cf5409d8b7d3ff0be3d6e51226a`.

## Experimento de desarrollo reservado: registro histórico, sin ajustes posteriores

Un agente distinto preparó **256 mensajes, 128 familias ES/PT**, con 32 mensajes
por cada una de las ocho clases. Se mantuvieron ocultos al entrenamiento hasta
congelar el modelo. Esto describe separación del ajuste, no validación independiente, revisión humana, admisibilidad para el reto ni una muestra representativa de consultas bancarias.

Hash del corpus de test:
`fbc39220225f6f55eb32110c3e400ae038f8ebd4ec7731ae911906cdde682ea9`.

Auditoría posterior, sin cambiar ni excluir resultados: **cero coincidencias
textuales exactas normalizadas** entre los 256 mensajes reservados y los 634 de
train/128 de validation. Se normalizó NFKD, marcas U+0300–U+036F, minúsculas y
tokens `[a-z0-9]+`. Está registrada en `overlap-audit-heldout.json`; la ausencia de
coincidencias exactas no demuestra independencia semántica.

| Medida sobre las mismas 256 entradas | Reglas | v1 | v2 |
|---|---:|---:|---:|
| Exactitud top-1 | 168/256 = 65,63% | 211/256 = 82,42% | 218/256 = 85,16% |
| Macro-F1 | 0,6752 | 0,7904 | 0,8310 |
| Exactitud ES, n=128 | 65,63% | 85,16% | 85,94% |
| Exactitud PT, n=128 | 65,63% | 79,69% | 84,38% |

Diferencia de exactitud de v2 frente a reglas: +19,53 puntos; intervalo bootstrap
pareado por familia del 95% [11,72; 27,34]. Frente a v1: +2,73 puntos, intervalo
[−1,17; 6,64]. No hay evidencia concluyente de superioridad sobre v1. Se usaron
4000 réplicas, semilla fija y familias completas; el intervalo no cubre sesgos de
autoría, etiquetas, representatividad ni distribución futura.

| Clase v2, soporte 32 cada una | Precisión top-1 | Recall top-1 |
|---|---:|---:|
| account_query | 84,21% | 100,00% |
| card_lost | 78,95% | 93,75% |
| credit_query | 88,89% | 100,00% |
| duplicate | 91,18% | 96,88% |
| merchant_issue | 93,10% | 84,38% |
| other | 100,00% | **28,13%** |
| refund_request | 84,21% | 100,00% |
| unrecognized | **73,53%** | **78,13%** |

Los límites principales son claros: 23/32 consultas `other` reciben una sugerencia
de otra clase; de 34 predicciones `unrecognized`, nueve son incorrectas. El sistema
debe conservar la selección explícita de motivo. Las probabilidades softmax no son
probabilidades calibradas de fraude o riesgo.

Con sus umbrales congelados, v2 se abstiene en 256/256: cobertura de aceptación 0%,
precisión selectiva **no definida**, no 100%. Su top-1 puede mostrarse únicamente
como sugerencia no confirmada. v1 acepta 160/256 con 155 aciertos; sus 21
`unrecognized` aceptados incluyen cuatro falsos. Ninguno demuestra automatización
segura de una disputa ni mide resolución bancaria end-to-end.

Predicciones y errores completos: `predictions-heldout.jsonl` y `test-report.json`.
`evaluate_once.py` comprueba el freeze/hash y se niega a sobrescribir un reporte
existente. No volver a usar este test para ajustar y luego afirmar independencia.

## Inferencia exacta de Worker

Usar el nuevo `inference.mjs` junto con `model.json`; **no reutilizar el extractor
word-only de v1**. La función conserva `intent`, `confidence`, `margin`, `accepted`,
`decision` y `probabilities`; cambia cobertura a `feature_coverage`.

1. NFKD, eliminar U+0300–U+036F, minúsculas, tokens `/[a-z0-9]+/g`.
2. Para cada token, añadir un espacio al inicio y al final. Extraer todos los
   n-gramas de caracteres de tamaños 3, 4 y 5 y prefijarlos con `c:`.
3. Contar repeticiones. Para features en vocabulario: `(1+ln(count))*idf[index]`.
4. Normalizar el vector conocido a L2. Calcular logits con `coef` e `intercept` y
   softmax estable; desempatar con orden de `classes`.
5. `feature_coverage` es la fracción de ocurrencias de features conocidas entre
   todas las ocurrencias extraídas, contando repeticiones.
6. Aplicar los umbrales exportados. Un vector vacío usa solo intercepts y se
   abstiene. No cambiar umbrales en la app para hacer que un ejemplo pase.

Las flags `autonomous_routing_allowed:false` y
`requires_user_intent_confirmation:true` son obligatorias. Fuera del clasificador
deben residir sesión, autorización por cliente, límites de entrada, estado del
diálogo, confirmaciones, persistencia, políticas e idempotencia.

Paridad Python→JavaScript: **10/10**, error máximo **4,44e−16**, tolerancia 1e−9.
Incluye ambos idiomas, acentos, Unicode de compatibilidad, repeticiones y entradas
vacías. `parity-vectors.json` y `verify-parity.mjs` permiten verificar el portado.

## Latencia y reproducción

Sobre Node v26 en macOS ARM64, 256 entradas con calentamiento y 20 repeticiones
(5120 inferencias): CPU local p50 **0,043 ms**, p95 **0,082 ms**. Se excluyen red,
parseo del JSON, cold start, autenticación, almacenamiento y UI. No es latencia
E2E ni costo de hosting; el componente no hace llamadas de API en runtime.

```bash
.venv/bin/python research/build-assets/ml-v2/train_v2.py
node research/build-assets/ml-v2/verify-parity.mjs
node research/build-assets/ml-v2/benchmark.mjs
```

Los comandos anteriores describen el entorno original de investigación. En el
paquete público se reproduce el entrenamiento desde `corpus.jsonl` mediante
`train_from_corpus.py --output-dir CARPETA_NUEVA`, sin Ollama ni raw privados y sin
tocar este export. La ejecución local comprobada reprodujo exactamente todos los
parámetros numéricos; el nuevo JSON cambia de hash porque tiene nueva procedencia.
No se garantiza igualdad entre entornos. Ver comandos completos y requisitos en
[el README del paquete](../README.md). El entrenamiento nuevo no utiliza validación
ni holdout. La evaluación autorizada ya está completa y no requiere repetirse.

Para reproducir la comparación en el layout empaquetado de la app sin sobrescribir
el resultado original, copiar este `evaluate_once.py` a `app/ml/v2` y usar una
carpeta de salida nueva:

```bash
.venv/bin/python app/ml/v2/evaluate_once.py \
  --v1-dir app/ml/v1 \
  --heldout app/ml/heldout-v2/corpus.jsonl \
  --output-dir tmp/ml-v2-reproduction
```

El evaluador comprueba los hashes congelados, incluidos los de entrenamiento,
pero solo ejecuta inferencia. No modifica modelo, umbrales, corpus o métricas
originales. `--assets-dir` permite utilizar otra ubicación de los mismos assets.
