# Revisión automática ES/PT y video V4

30 de septiembre de 2026. Alcance: archivos locales en el clon aislado; **no es revisión humana de portugués ni escucha semántica humana**.

- El análisis sintáctico del TSX examinó 193 pares literales de `t(es, pt)`, dos pares dinámicos inspeccionados y 18 claves de respuestas del asistente por idioma. Los conjuntos de claves y marcadores de posición coinciden. Once pares son texto neutral compartido. No se detectó texto visible en inglés fuera de marca/metadatos de fuente en el JSX escaneado.
- Se corrigió el estado original de la transacción que aparecía crudo en inglés en el panel de evidencia, reutilizando la tabla ES/PT de estados. La advertencia PT ahora incluye PIN, CVV y contraseña. `npm run check` y `npm run build` pasaron después de estos cambios.
- El SRT V4 tiene 45 cues, máximo 41 caracteres por línea, máximo dos líneas y máximo 16,5 caracteres por segundo. El subtítulo incrustado en el MP4 coincide en texto/tiempos con el SRT externo y el texto concatenado coincide con el guion de narración. El video dura 169,6 s.
- La pista de video/audio/subtítulos se decodificó completa sin error con ffmpeg. Las 26 frases esperadas tienen fuente de audio; la correlación entre la narración fuente y audio extraído, remuestreados a 16 kHz, fue 0,99994. Pico de audio 0,4555 de escala completa (≈−6,8 dBFS), con señal en todos los intervalos subtitulados.

**Límites:** estas comprobaciones no detectan todos los matices de idioma, pronunciación o veracidad del relato; no hubo motor ASR instalado y esta sesión no pudo escuchar audio. El video es montaje de capturas locales, no aceptación alojada continua. La revisión competente de PT y una escucha humana completa son recomendaciones internas antes de presentar, no requisitos explícitos identificados en el enunciado disponible.
