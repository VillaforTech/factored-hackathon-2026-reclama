# Costo de los recorridos, 30 de septiembre de 2026

**Costo total medido: desconocido.** El [probe de casos completos](full-case-rerun-2026-09-30.json) registró 70 solicitudes HTTP para 15 recorridos preparados en un servidor de desarrollo local: 6 por intake ES, 2 por aclaración PT y 6 por handoff PT. Midió tiempo de pared; no registró CPU facturable, filas D1 leídas/escritas, almacenamiento, transferencia, minutos de cómputo de la plataforma ni factura. Los cinco intakes son recepción de casos, no resoluciones financieras. Por ello el costo por resolución financiera automatizada no tiene denominador y no se presenta como USD 0.

## Modelo para estimación futura

Si el despliegue usa **Cloudflare Workers Paid y D1 directamente**, la [tarifa publicada de Workers](https://developers.cloudflare.com/workers/platform/pricing/) enumera USD 5 por cuenta/mes con 10 millones de solicitudes y 30 millones de ms de CPU incluidos; el excedente cuesta USD 0,30 por millón de solicitudes y USD 0,02 por millón de ms de CPU. La [tarifa publicada de D1](https://developers.cloudflare.com/d1/platform/pricing/) enumera 25.000 millones de filas leídas, 50 millones escritas y 5 GB incluidos al mes en ese plan, con excedentes de USD 0,001 por millón de lecturas, USD 1 por millón de escrituras y USD 0,75 por GB-mes. Estos precios son **supuestos condicionales**: no hemos verificado que el producto Sites facture al propietario exactamente así, ni su consumo mensual o créditos.

Para un mes con `R` solicitudes, `C` ms de CPU facturable, `L` filas D1 leídas, `W` escritas y `G` GB-mes, un cálculo ilustrativo sería:

`USD/mes = 5 + 0,30·max(R−10M,0)/1M + 0,02·max(C−30M,0)/1M + 0,001·max(L−25.000M,0)/1M + 1·max(W−50M,0)/1M + 0,75·max(G−5,0)`

La fórmula excluye otros productos, transferencia y costos humanos. También mezcla un cargo fijo de cuenta con costos marginales, así que dividirla por 15 casos locales no produciría un precio válido por caso. Para obtener un costo por intake o handoff alojado hacen falta la factura/plan real, telemetría de CPU y D1 por recorrido, volumen mensual y una regla explícita para repartir el cargo fijo. La inferencia de categoría está empaquetada en el servicio; no se observó una factura de API de modelo. Ningún importe total se declara cero.
