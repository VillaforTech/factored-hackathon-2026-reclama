# Reclama — guion V4 de revisión

Montaje narrado con capturas locales reales y diapositivas; no es una sesión alojada continua. Voz sintética genérica Paulina (es-MX). Archivo MP4: 169,6 s. La última frase concluye a los 169,60 s; el archivo de tiempos de síntesis incluye una pausa final no incluida en el MP4.

| Tiempo | Visual | Narración |
| --- | --- | --- |
| 00:00.00–00:17.02 | slide-1 | Somos Roberto Villafuerte, Jorge Arguello y Daniel Andrade. Reclama recibe solicitudes por compras de tarjeta no reconocidas y prepara un expediente verificable. Este borrador es un recorrido narrado con capturas reales, no una sesión continua. |
| 00:17.02–00:38.74 | slide-4 | En doce cortes temporales del dataset sintético encontramos diez mil novecientas tres compras de tarjeta aprobadas, con titularidad coherente. Los enlaces defectuosos de las quejas históricas nos hicieron descartarlos como evidencia de un nuevo expediente. Partimos de la transacción verificada y de la declaración actual del cliente. |
| 00:38.74–01:02.46 | review-es | Esta captura real muestra la revisión en español. La declaración del cliente se identifica como no verificada; la autorización de la compra y la procedencia de un reembolso quedan pendientes de investigación. La recepción y las actualizaciones tienen rastro de auditoría. Recibido significa pendiente de revisión, no fraude confirmado ni dinero devuelto. |
| 01:02.46–01:15.58 | mobile-pt | La captura móvil muestra la interfaz en portugués y movimientos de una identidad ficticia de prueba. El cliente selecciona la transacción exacta, revisa su declaración y confirma antes de enviar. |
| 01:15.58–01:37.05 | slide-3 | El clasificador sugiere el motivo; el servicio controla identidad, titularidad, consentimiento y escritura. Un borrador no crea un caso. La confirmación se vincula al borrador, y una lectura posterior verifica el expediente guardado. Una sesión vencida o una transacción ajena no permiten continuar. |
| 01:37.05–02:03.70 | checks | Pasaron veintiocho pruebas de integración HTTP, incluidas concurrencia, consentimiento y recuperación tras una respuesta perdida. Otro workload tuvo ciento sesenta comprobaciones de API aprobadas: dieciséis escenarios bilingües, repetidos diez veces. Son pruebas locales de comportamiento; no representan ciento sesenta clientes independientes ni seguridad bancaria demostrada. |
| 02:03.70–02:26.74 | slide-5 | En doscientos cincuenta y seis textos sintéticos reservados, el clasificador acertó doscientos dieciocho; las reglas, ciento sesenta y ocho. Las etiquetas fueron asistidas por inteligencia artificial y requieren revisión humana. La evaluación no justificó autonomía: el modelo solo sugiere y la confirmación sigue siendo obligatoria. |
| 02:26.74–02:50.05 | slide-6 | La demo y el repositorio siguen privados por decisión del propietario. El acceso de los jueces y la validación alojada con dos cuentas reales siguen pendientes. Tenemos un sandbox reproducible con datos ficticios, permisos y trazas. No mueve dinero ni resuelve financieramente disputas: prepara una solicitud clara para revisión humana. |

## Fuentes y límites

- Las capturas ES y PT son del sandbox local con datos inventados. La aceptación de login alojado, recarga y aislamiento entre dos cuentas reales queda pendiente.
- La demostración mide recepción, handoff y recuperación técnica; no constituye decisión financiera ni tasa de resolución.
- 28/28 HTTP, 160/160 aserciones repetidas y 2/2 handoffs preparados son métricas separadas. 218/256 frente a 168/256 corresponde a clasificación de textos sintéticos reservados; las etiquetas y el portugués requieren revisión humana.
- La demo y el repositorio siguen privados. Falta decisión expresa sobre acceso de jueces. No se ha enviado este video.
- [Manifest V4](manifest-v4.json) conserva hashes y verificaciones. Falta escucha humana de pronunciación y revisión completa de subtítulos.
