# Grabación interactiva local — V6

[MP4 continuo](Reclama_demo_local_v6_interactive.mp4) · [Subtítulos SRT](Reclama_demo_local_v6_interactive.srt) · [Manifest](manifest.json) · [Recibo de ejecución](recording-receipt.json)

107,320 segundos, 1440×1000, 25 fps, H.264. Es una grabación real de acciones de interfaz realizadas por Playwright en Chromium contra el sandbox local corregido. No es una actuación humana ni una aceptación alojada. No hay cortes, aceleración ni imágenes fijas insertadas. La narrativa usa 14 subtítulos seleccionables, marcados como pista predeterminada; activar subtítulos en el reproductor si no aparecen. No tiene pista de audio.

## Resultado visible

1. Dos compras ES similares requieren selección explícita.
2. Declaración, hechos y preguntas abiertas se separan; el consentimiento empieza desmarcado.
3. Intake `RC-1C5D2366`, persistencia tras recarga local, revisión y auditoría v1→v2.
4. Interacción PT y compra revertida: se prepara un handoff, no un reembolso.
5. Pérdida de respuesta provocada desde el laboratorio visible. Reintento de la misma solicitud recupera `RC-B495D939`; tras recargar queda un solo caso.
6. Cierre con límites del modelo y aceptación alojada pendiente.

Pasaron 9/9 comprobaciones del navegador y la decodificación completa. Los 14 cues externos e incrustados coinciden. Se revisó la secuencia completa mediante 36 muestras a intervalos de tres segundos y cuatro vistas ampliadas, además de ocho vistas de resumen. Es inspección por el asistente; no revisión humana cuadro a cuadro. El manifest registra hashes y límites.

La primera toma se detuvo por un selector del guion que no contemplaba el contador en el nombre de una pestaña. Se preserva localmente y no se utilizó en el archivo final. La segunda toma terminó completa. Cuatro subtítulos se abreviaron después para mejorar legibilidad; no se modificó el contenido visual.

## Reproducir sin tocar producción

Requiere dependencias de la aplicación y Playwright Python 1.58 con Chromium. Instalar esos requisitos en un entorno de pruebas propio si no están disponibles. Iniciar `npm run db:local` y `npm run dev -- --port 5357 --host 127.0.0.1` conforme al README del proyecto. En otra terminal:

```bash
python3 tests/record-local-demo.py --base-url http://127.0.0.1:5357 --output work/new-interactive-take --hold-seconds 5.5
```

El script rechaza URLs alojadas antes de abrir el navegador, no carga perfiles ni cookies preexistentes, usa controles de interfaz y crea recorridos nuevos sin borrar los anteriores. Produce WebM continuo, captions y recibo. No promete un tiempo fijo: depende de la máquina y del estado local. Revisar resultado y duración antes de usar otra toma. Los datos de ejecución quedan en `work/`, ignorado por Git.

El MP4 V5 y sus slides se conservan como referencia histórica de montaje narrado. Esta grabación no cambia el modelo, backend, privacidad o despliegue. Login alojado y dos cuentas reales siguen pendientes y se coordinan por separado. No enviado a organizadores.
