# Reclama: guion del video V5

**Corrección de fuentes y render V5 del 1 de octubre de 2026.** El MP4 V5 incorpora la diapositiva 5 corregida, la narración nueva y los subtítulos sincronizados. El MP4 V4 sigue desactualizado.

Montaje narrado con capturas locales reales y diapositivas; no es una sesión alojada continua. Voz sintética genérica Paulina (es-MX). El MP4 V5 dura 168,300 s. Los tiempos de la tabla provienen de las 26 frases de audio medidas; la escena corregida ocupa 02:03.70–02:24.99. El [manifest V5](manifest-v5.json) documenta las comprobaciones técnicas.

| Tiempo | Visual | Narración |
| --- | --- | --- |
| 00:00.00–00:17.02 | slide-1 | Somos Roberto Villafuerte, Jorge Arguello y Daniel Andrade. Reclama recibe solicitudes por compras de tarjeta no reconocidas y prepara un expediente verificable. Este borrador es un recorrido narrado con capturas reales, no una sesión continua. |
| 00:17.02–00:38.74 | slide-4 | En doce cortes temporales del dataset sintético encontramos diez mil novecientas tres compras de tarjeta aprobadas, con titularidad coherente. Los enlaces defectuosos de las quejas históricas nos hicieron descartarlos como evidencia de un nuevo expediente. Partimos de la transacción verificada y de la declaración actual del cliente. |
| 00:38.74–01:02.46 | review-es | Esta captura real muestra la revisión en español. La declaración del cliente se identifica como no verificada; la autorización de la compra y la procedencia de un reembolso quedan pendientes de investigación. La recepción y las actualizaciones tienen rastro de auditoría. Recibido significa pendiente de revisión, no fraude confirmado ni dinero devuelto. |
| 01:02.46–01:15.58 | mobile-pt | La captura móvil muestra la interfaz en portugués y movimientos de una identidad ficticia de prueba. El cliente selecciona la transacción exacta, revisa su declaración y confirma antes de enviar. |
| 01:15.58–01:37.05 | slide-3 | El clasificador sugiere el motivo; el servicio controla identidad, titularidad, consentimiento y escritura. Un borrador no crea un caso. La confirmación se vincula al borrador, y una lectura posterior verifica el expediente guardado. Una sesión vencida o una transacción ajena no permiten continuar. |
| 01:37.05–02:03.70 | checks | Pasaron veintiocho pruebas de integración HTTP, incluidas concurrencia, consentimiento y recuperación tras una respuesta perdida. Otro workload tuvo ciento sesenta comprobaciones de API aprobadas: dieciséis escenarios bilingües, repetidos diez veces. Son pruebas locales de comportamiento; no representan ciento sesenta clientes independientes ni seguridad bancaria demostrada. |
| 02:03.70–02:24.99 | slide-5 | El experimento de desarrollo usa doscientos cincuenta y seis mensajes creados por IA, en ciento veintiocho familias bilingües. No incluye registros del organizador ni revisión humana. El conjunto no sirve como validación independiente ni como benchmark del reto, y el modelo solo sugiere con confirmación obligatoria. |
| 02:24.99–02:48.30 | slide-6 | La demo y el repositorio siguen privados por decisión del propietario. El acceso de los jueces y la validación alojada con dos cuentas reales siguen pendientes. Tenemos un sandbox reproducible con datos ficticios, permisos y trazas. No mueve dinero ni resuelve financieramente disputas: prepara una solicitud clara para revisión humana. |

## Fuentes y límites

- Las capturas ES y PT son del sandbox local con datos inventados. La aceptación de login alojado, recarga y aislamiento entre dos cuentas reales queda pendiente.
- La demostración mide recepción, handoff y recuperación técnica; no constituye decisión financiera ni tasa de resolución.
- 28/28 HTTP, 160/160 aserciones repetidas y 2/2 handoffs preparados son QA de software con denominadores separados, sin validar el modelo.
- El experimento de desarrollo contiene 256 mensajes creados por IA y 128 familias de escenarios bilingües, sin registros del organizador ni revisión humana. Los resultados históricos 218/256 frente a 168/256 (+19,53 pp) se conservan en notas de procedencia y no forman parte del titular ni de la narración corregida. No constituyen validación independiente ni un benchmark admisible del reto.
- Las 1.748 transcripciones oficiales ES contienen 42 textos distintos, todos sobre saldo. No permiten un benchmark amplio de intenciones ES/PT.
- La demo y el repositorio siguen privados. Falta decisión expresa sobre acceso de jueces. No se ha enviado este video.
- [Manifest V5](manifest-v5.json) registra hashes y verificaciones del nuevo MP4. La revisión automática de audio, subtítulos y fotogramas no sustituye la escucha de pronunciación ni la revisión del equipo antes de una entrega.
