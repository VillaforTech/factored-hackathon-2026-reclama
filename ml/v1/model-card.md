# Reclama: clasificador local de intención ES/PT

## Corrección de interpretación · 1 de octubre de 2026

El resultado exploratorio de 46/64 frente a 43/64 usa textos y etiquetas de autoría IA. Es un experimento de desarrollo; **no es validación independiente ni un benchmark oficial/admisible del reto**. Se conserva la evidencia histórica, sin cambiar el modelo ni los resultados.

See / Véase: [provenance correction](../../docs/evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md).

**Versión:** `reclama-intent-2026-09-29-v1.1`.

**Decisión: orientativo, no apto para enrutamiento autónomo.** El experimento
encontró límites relevantes, especialmente en la intención que inicia una disputa.
El producto debe obtener una elección explícita del motivo antes de continuar.
El modelo nunca autentica, autoriza acceso, guarda un reclamo por sí solo,
confirma fraude, concede crédito ni aprueba reembolsos.

## Qué se ejecutó

Un clasificador de regresión logística multinomial aprendido con TF-IDF de palabras
y bigramas. Todo se entrenó y evaluó localmente, sin APIs pagadas ni solicitudes
externas con mensajes. Se usó scikit-learn 1.9.1, Python 3.12 y numpy 2.3.5.

Las ocho clases son `unrecognized`, `duplicate`, `merchant_issue`, `refund_request`,
`card_lost`, `account_query`, `credit_query` y `other`. Las probabilidades exportadas
son valores softmax; **no se ha demostrado calibración probabilística**.

El baseline es un clasificador de reglas bilingües ponderadas con expresiones
regulares, señales compuestas y una regla de negación explícita. Está en `train.py`.
Es determinista, no usa resultados de referencia al predecir y no se ajustó tras
observar el test. No es un baseline que responda siempre la clase mayoritaria.

## Corpus y separación

Los **320 mensajes son enteramente sintéticos y escritos por IA**, incluyendo las
versiones portuguesas. No existe revisión humana de idioma ni adjudicación humana
de las etiquetas. No se usaron los transcripts del banco, datos de clientes ni
etiquetas históricas de quejas para entrenar o medir este componente.

Hay 160 familias de situación, cada una con una pareja ES/PT. No son traducciones
obtenidas de un proveedor externo. Las versiones de una familia permanecen juntas:

| Partición | Familias | Mensajes | Por clase |
|---|---:|---:|---:|
| Train | 96 | 192 | 24 |
| Validation | 32 | 64 | 8 |
| Test exploratorio | 32 | 64 | 8 |

El constructor verifica que ninguna familia ni cadena normalizada idéntica aparezca
en particiones distintas. El vocabulario y el IDF se ajustan solo en train. Las
familias cambian de situación y redacción; no hay un generador de plantillas de la
regla baseline. Esto no elimina el sesgo del mismo autor de IA ni prueba
independencia semántica exhaustiva: toda clasificación comparte conceptos.

Se probaron C = 0,5; 1; 4; 12 solo con validation, eligiendo macro-F1 y prefiriendo
el C menor en empates. Ganó C = 4 con macro-F1 de validación 0,6693. No se reentrenó
con validation o test. Las clases están balanceadas por diseño; sus proporciones
no representan demanda bancaria real.

## Resultados observados

| Medida sobre los mismos 64 mensajes | Reglas | Modelo aprendido |
|---|---:|---:|
| Exactitud sin abstención | 43/64 = 67,19% | 46/64 = 71,88% |
| Macro-F1 | 0,7134 | 0,7073 |
| Exactitud ES | 22/32 = 68,75% | 22/32 = 68,75% |
| Exactitud PT | 21/32 = 65,63% | 24/32 = 75,00% |

La diferencia de exactitud es +4,69 puntos, pero el intervalo bootstrap por familia
del 95% va de −15,63 a +25 puntos. El macro-F1 empeora. **No hay evidencia suficiente
para afirmar que el modelo supera al baseline.** El intervalo solo refleja este
conjunto sintético pequeño, no incertidumbre de generalización a clientes reales.

La abstención seleccionada acepta 19/64 mensajes de test: 18 correctos, cobertura
29,69% y exactitud selectiva 94,74%. Este promedio oculta un fallo importante:

**El único `unrecognized` aceptado es incorrecto, y ninguno de los ocho
`unrecognized` verdaderos se acepta.** El error aceptado es una consulta sobre un
código de acceso por SMS. Por ello no se debe usar esta salida para abrir ni
enrutar automáticamente una disputa. La UI puede mostrar una sugerencia revisable,
seguida de elección explícita, o pedir directamente el motivo.

Los 64 resultados, incluidas abstenciones y errores, están en
`predictions-test.jsonl`; métricas, matriz de confusión y errores en `report.json`.

## Umbrales y cambio de protocolo documentado

La primera política exigía ≥90% de exactitud selectiva en validación, cero falsos
`unrecognized` aceptados y al menos cuatro ejemplos de esa clase aceptados. Ninguna
combinación de la rejilla cumplió estas condiciones: el modo estricto falló.

Después de reportar los primeros agregados de test se examinó **solo validation**
y se añadió un fallback exclusivamente orientativo, con soporte mínimo de dos
mensajes. No se cambiaron corpus, features, C, pesos del modelo ni baseline después
del test. La revisión del protocolo impide llamar a esos resultados un benchmark
final independiente; `report.json` los declara exploratorios.

La regla orientativa seleccionada es:

- score máximo ≥ 0,30;
- diferencia entre los dos scores mayores ≥ 0,10;
- fracción de tokens presentes en vocabulario ≥ 0,50.

En validation acepta 21/64, con 20 aciertos. Solo dos mensajes `unrecognized`
aportan evidencia favorable; ambos proceden de una misma familia ES/PT. No es una
validación suficiente de esa clase. El export contiene
`autonomous_routing_allowed: false` y `requires_user_intent_confirmation: true`.

Antes de cambiar este estado se necesita ampliar diversidad de entrenamiento,
revisión humana ES/PT y un nuevo conjunto reservado por un evaluador independiente.
El test actual puede convertirse en regresión, pero no reutilizarse como evidencia
independiente después de modificar el modelo en respuesta a sus errores.

## Contrato exacto de inferencia en Worker

`model.json` pesa 444.643 bytes y tiene 2.213 características. Solo ese archivo y
`inference.mjs` son necesarios en la app; los textos de entrenamiento quedan fuera.

1. Normalizar Unicode NFKD, eliminar U+0300–U+036F y pasar a minúsculas.
2. Extraer tokens con `/[a-z0-9]+/g`. No eliminar stopwords ni hacer stemming.
3. Crear unigramas y bigramas adyacentes unidos por un espacio. La puntuación no
   marca límites de frase: un bigrama puede atravesarla, igual que en Python.
4. Contar términos. Para cada término conocido, `x = (1 + ln(count)) * idf[index]`.
5. Normalizar el vector de términos conocidos a norma L2. Un vector sin términos
   conocidos se mantiene vacío. No recalcular IDF en producción.
6. Para cada clase en `classes`, `logit = intercept[c] + sum(coef[c][j] * x[j])`.
7. Aplicar softmax restando el mayor logit antes de exponenciar.
8. Calcular score, margen y fracción de tokens conocidos contando repeticiones.
   Resolver empates con el orden de `classes`.
9. Aplicar los umbrales de `abstention`. `decision` es la clase si los cumple o
   `clarify` si no; siempre requiere confirmación de intención antes del flujo.

```js
import model from './model.json';
import {predictIntent} from './inference.mjs';

const suggestion = predictIntent(model, message);
// accepted significa apto para sugerir una opción, nunca autorización.
// Aplicar autenticación, límites de entrada, aislamiento y confirmaciones fuera.
```

El llamador debe limitar la longitud de entrada, controlar el estado del diálogo y
no ejecutar acciones por `intent` o `accepted`. Una frase de seguimiento como “ese
mismo” necesita contexto del diálogo; este clasificador solo evalúa el mensaje
inicial. Entradas de múltiples intenciones no se descomponen. El clasificador no es
un detector de prompt injection: esa defensa corresponde a permisos y herramientas.

## Reproducción y paridad

Desde la raíz del proyecto:

```bash
.venv/bin/python -m pip install -r research/build-assets/ml/requirements.txt
.venv/bin/python research/build-assets/ml/train.py
node research/build-assets/ml/verify-parity.mjs
```

La semilla es 29092026. El reporte guarda los hashes del corpus y del modelo, versiones
y candidatos evaluados. La inferencia de referencia JavaScript pasa los diez vectores
de paridad contra Python con error máximo de probabilidad **1,11e−16** (tolerancia
1e−9). Incluyen ES/PT, acentos, caracteres Unicode de compatibilidad, repeticiones,
entrada vacía y puntuación sin tokens. Este check prueba el portado numérico, no la
calidad lingüística o seguridad del sistema bancario completo.

No hay costo de API por inferencia de este componente: no hace llamadas de red.
Eso no equivale a costo cero de CPU/hosting ni mide la latencia E2E de Reclama.
