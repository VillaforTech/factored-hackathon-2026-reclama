# Componente de intención y evidencia reproducible

Esta carpeta contiene dos clasificadores locales de intención ES/PT, sus corpus
sintéticos, evaluación, modelos exportados y una implementación JavaScript sin
dependencias. La app usa v2 como **hipótesis no confirmada**: el usuario elige el
motivo y nunca se inicia una disputa por la predicción del modelo.

**v2 se abstiene en todos los casos bajo los umbrales congelados.** Su etiqueta
top-1 puede mostrarse para orientar, pero `accepted` permanece `false` y `decision`
es `clarify`. No cambiar umbrales para mejorar una demo. Sesión, autorización,
confirmación y escrituras pertenecen a la aplicación, no al clasificador.

## Contenido

- `v1/`: modelo inicial word-TFIDF + regresión logística, baseline bilingüe fijo,
  corpus, informe, predicciones y paridad.
- `v2/`: char-TFIDF + regresión logística, entrenamiento/validación sintéticos,
  modelo congelado, informe de selección, test independiente y auditorías.
- `heldout-v2/`: 256 mensajes sintéticos, 128 parejas/familias ES/PT preparadas por
  otro agente; se mantuvieron ocultos al ajuste de v2 hasta la congelación.
- `verify_package.py`: comprueba hashes, imports y 20 ejemplos fijos de paridad,
  sin entrenar, reevaluar el test ni modificar resultados.

Consultar las limitaciones completas en [model-card de v2](v2/model-card.md),
el [protocolo](v2/protocol.md), [test-report](v2/test-report.json) y el
[documento del holdout](heldout-v2/README.md). Los mensajes fueron escritos por IA;
no son registros bancarios reales ni cuentan con revisión humana de portugués.

## Preparación

Los comandos siguientes se ejecutan desde la raíz de este repositorio público,
es decir, el directorio que contiene `package.json` y `ml/`.

Probado con Python 3.12.14, NumPy 2.3.5, SciPy 1.18.1, scikit-learn 1.9.1 y Node
v26.0.0. El runtime JavaScript de inferencia no necesita paquetes de npm. Python
se utiliza para auditar o reproducir la evaluación offline; no es necesario para
ejecutar el modelo dentro de la app.

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r ml/v1/requirements.txt
.venv/bin/python ml/verify_package.py
node ml/v1/verify-parity.mjs
node ml/v2/verify-parity.mjs
```

La comprobación Python importa `v1/train.py` y `v2/train_v2.py` exclusivamente para
sus funciones puras de inferencia y métricas. Importarlos no ejecuta entrenamiento.
El evaluador resuelve las carpetas hermanas `v1`, `v2` y `heldout-v2`; no depende de
la antigua ubicación privada de investigación.

## Reproducir la comparación sin ajustar el modelo

La evaluación original ya está guardada. Para reproducirla, usar una carpeta
nueva de salida; el script se niega a sobrescribir `test-report.json` existente:

```bash
RECLAMA_EVAL_DIR="$(mktemp -d)"
.venv/bin/python ml/v2/evaluate_once.py \
  --v1-dir ml/v1 \
  --heldout ml/heldout-v2/corpus.jsonl \
  --output-dir "$RECLAMA_EVAL_DIR"
```

El script comprueba los hashes congelados, ejecuta los tres sistemas sobre las
mismas entradas y escribe `test-report.json` y `predictions-heldout.jsonl` en esa
carpeta. Usa semilla fija para 4000 réplicas bootstrap por familia. No entrena,
selecciona ejemplos, cambia umbrales ni excluye errores. `--assets-dir` permite
indicar otra copia idéntica de `v2`. `--help` muestra las opciones.

Reproducir un cálculo no convierte el corpus en un nuevo test. Cualquier ajuste
basado en estos errores necesitaría otro conjunto reservado para afirmar una
evaluación independiente.

## Resultado y límites

| Sobre los mismos 256 mensajes | Reglas | v1 | v2 |
|---|---:|---:|---:|
| Exactitud top-1 | 65,63% | 82,42% | 85,16% |
| Macro-F1 | 0,6752 | 0,7904 | 0,8310 |

v2 mejora frente a reglas en este test sintético. Su mejora frente a v1 no es
concluyente: intervalo de diferencia de exactitud del 95% [−1,17; 6,64] puntos.
No se debe generalizar este resultado a consultas bancarias reales.

Limitaciones que cambian el uso del producto:

- `other` se reconoce correctamente en **9/32** casos.
- De 34 etiquetas top-1 `unrecognized`, **25 son correctas**; nueve son falsas.
- La política de abstención falló sus requisitos de validación y se conservó
  cerrada: **cobertura aceptada 0%**, precisión selectiva no definida.
- Las probabilidades softmax no son probabilidades calibradas de fraude o riesgo.
- No se evaluaron aquí autorizaciones, seguridad de acciones o resolución E2E.
- No hay coincidencias textuales exactas normalizadas entre train/validation y
  holdout; eso no demuestra independencia semántica ni elimina sesgo sintético.

## Inferencia y rendimiento

Para v2 se requieren `v2/model.json` y `v2/inference.mjs`. No usar el extractor de
palabras de v1 con el modelo de caracteres de v2. El contrato exacto y los diez
vectores de paridad están documentados en la model card. El modelo pesa 682.953
bytes y no realiza llamadas de red.

El benchmark guardado mide solo CPU local caliente: p50 0,043 ms y p95 0,082 ms.
Excluye parseo del modelo, cold start, red, almacenamiento, autorización e interfaz.
No es latencia E2E ni costo de hosting. `benchmark.mjs` puede repetirse para medir
otra máquina, pero sobrescribe únicamente `v2/cpu-benchmark.json`; conviene guardar
la medición nueva por separado si se quiere conservar la original.

## Reproducir el entrenamiento desde el corpus final

`train_from_corpus.py` entrena un **artefacto nuevo** desde las 634 filas `train` de
`v2/corpus.jsonl`, con la configuración ya seleccionada: char-TFIDF, C=12,
min_df=2, máximo 3500 features y regresión logística balanceada. No utiliza las
filas de validación, no lee el holdout y no busca hiperparámetros ni umbrales.

```bash
RECLAMA_TRAIN_BASE="$(mktemp -d)"
.venv/bin/python ml/v2/train_from_corpus.py \
  --output-dir "$RECLAMA_TRAIN_BASE/new-model"
```

La salida es obligatoria, debe ser una carpeta inexistente y debe estar fuera de
los directorios archivados `v1`, `v2` y `heldout-v2`. Se escriben `model.json` y
`training-report.json` nuevos; no se modifican pesos, corpus o informes originales.
Los controles de abstención permanecen cerrados y la confirmación explícita sigue
siendo obligatoria.

El informe nuevo compara vocabulario, clases y parámetros numéricos con el export
congelado, indicando igualdad exacta y máxima diferencia absoluta por componente.
**No se garantiza identidad numérica entre versiones de bibliotecas, plataformas
o implementaciones de BLAS.** El hash del JSON nuevo difiere por diseño porque
cambian versión y metadatos de procedencia, incluso cuando los parámetros son
idénticos. No produce nuevas métricas de test ni demuestra nueva seguridad.

Comprobación local realizada con las versiones indicadas: el entrenamiento tardó
0,26 segundos y reprodujo exactamente clases, vocabulario, IDF, coeficientes e
interceptos (máxima diferencia absoluta 0). Es evidencia de esa ejecución concreta,
no garantía de igualdad entre entornos. El nuevo JSON tuvo otro hash por sus
metadatos; el modelo original no cambió.

El código histórico `train_v2.py` conserva su contexto original y necesita las
respuestas crudas de Ollama para volver a ensamblar el corpus. Esas respuestas no
están empaquetadas: **usar `train_from_corpus.py`, no ejecutar el histórico como
CLI**. Para reproducir desde el corpus público final no hacen falta Ollama, GPU,
claves de API ni descargas de pesos.

Si se alteran ejemplos, configuración o decisiones a partir de errores conocidos,
será otro experimento y requerirá un nuevo test reservado para afirmar evaluación
independiente; conservar siempre los resultados presentes.
