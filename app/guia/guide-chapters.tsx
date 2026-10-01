"use client";
import { useState } from "react";
import { ShieldCheck, Check, CircleHelp } from "lucide-react";
import { REPO, Source, Note, Section, Detail } from "./guide-ui";

export function DataChapter() {
  const [join, setJoin] = useState<string | null>(null);
  return (
    <Section
      eyebrow="03 / Evidencia de origen"
      title="Tres conjuntos de datos. Tres propósitos distintos."
      intro="No entrenamos la IA con los movimientos que ves en pantalla. Tampoco convertimos las quejas históricas en expedientes de la demo."
    >
      <div className="guide-grid three">
        <article>
          <span className="guide-label">Investigación</span>
          <h3>Dataset oficial</h3>
          <p>
            Sirvió para perfilar relaciones, detectar problemas y decidir qué
            información podía sostener un flujo.
          </p>
        </article>
        <article>
          <span className="guide-label">Producto</span>
          <h3>Fixture inventado</h3>
          <p>
            Ana, Lucas, tres tarjetas y doce transacciones creadas desde cero
            permiten repetir la demo sin distribuir filas originales.
          </p>
        </article>
        <article>
          <span className="guide-label">Aprendizaje</span>
          <h3>Conversaciones ES/PT</h3>
          <p>
            Mensajes sintéticos separados para entrenar, seleccionar y medir
            intención. No son conversaciones bancarias reales.
          </p>
        </article>
      </div>
      <h3>Cómo investigamos</h3>
      <p>
        Se inspeccionaron 50 archivos: las dimensiones completas de 150.000
        clientes y 400.000 productos, más doce cortes temporales de
        transacciones, quejas, interacciones y transcripciones. También
        analizamos el subconjunto de productos de tarjeta. No se procesaron las
        aproximadamente 19 millones de filas del conjunto completo.
      </p>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Observaciones del dataset"
      >
        <table>
          <caption>
            Observaciones de nuestra muestra, no de toda la población
          </caption>
          <thead>
            <tr>
              <th>Observación</th>
              <th>Consecuencia</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "48.810 transacciones con propietario y moneda coherentes",
                "Se puede comprobar la relación antes de utilizar una compra.",
              ],
              [
                "10.903 compras de tarjeta aprobadas; 531 sin comercio",
                "Un comercio desconocido permanece desconocido.",
              ],
              [
                "448/448 relaciones queja→producto con distinto propietario",
                "Se pone en cuarentena la relación: existir no equivale a pertenecer.",
              ],
              [
                "1.748 transcripciones; 42 textos de cliente distintos, todos con «saldo»",
                "No sostienen un corpus variado de disputas ni aportan portugués observado.",
              ],
              [
                "12.268 fechas de proceso anteriores al día del evento",
                "La fecha de carga no se interpreta como evidencia de disponibilidad temporal.",
              ],
            ].map(([a, b]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note kind="limit">
        La selección de cortes es temporal, no aleatoria: no estima prevalencia
        bancaria. Las anomalías invalidan una unión o una interpretación; no
        demuestran que toda una queja sea falsa. Las dimensiones estáticas
        tampoco reconstruyen por sí solas la titularidad histórica.
      </Note>
      <div className="guide-lab">
        <span className="guide-label">
          Prueba de criterio · ejemplo inventado
        </span>
        <h3>El producto existe. ¿La unión es válida?</h3>
        <div className="guide-code-pair">
          <code>queja: cliente_A → producto_7</code>
          <code>producto_7 → propietario cliente_B</code>
        </div>
        <div className="guide-segment">
          <button aria-pressed={join === "id"} onClick={() => setJoin("id")}>
            Sí: el ID existe
          </button>
          <button
            aria-pressed={join === "owner"}
            onClick={() => setJoin("owner")}
          >
            No: el titular no coincide
          </button>
        </div>
        {join && (
          <p
            className={join === "owner" ? "guide-answer good" : "guide-answer"}
            role="status"
          >
            {join === "owner"
              ? "Exacto. La clave foránea pasa, pero la propiedad falla. Esa evidencia no puede entrar al expediente de cliente_A."
              : "Encontrar el producto solo comprueba existencia. Falta comprobar que pertenece al cliente de la queja."}
          </p>
        )}
      </div>
      <h3>Por qué inventamos doce movimientos</h3>
      <ul>
        <li>
          Dos compras de Luna Digital por USD 84,90, separadas por siete
          minutos, obligan a desambiguar.
        </li>
        <li>
          Approved, Pending, Reversed y Declined obligan a distinguir estados.
        </li>
        <li>
          Comercio ausente y monedas USD/COP/ARS obligan a respetar la fuente.
          El idioma no determina la moneda.
        </li>
        <li>
          Un snapshot fijo al 17 de junio de 2026, sourceVersion y sourceRef
          permiten identificar qué evidencia se mostró.
        </li>
      </ul>
      <Detail title="Dinero, procedencia y privacidad">
        <p>
          USD 84,90 se almacena como <code>amountMinor: 8490</code> y{" "}
          <code>currency: USD</code>. Son unidades menores enteras; no se
          almacena dinero como aproximaciones decimales ni se convierte moneda
          automáticamente.
        </p>
        <p>
          Ninguna fila, identificador, importe o comercio del fixture se copió
          de los originales. El origen sintético del dataset no se tomó como
          licencia automática para redistribuirlo. Los CSV privados y el
          documento de acceso quedan fuera del repositorio.
        </p>
      </Detail>
      <Detail title="Proceso reproducible de datos">
        <p>
          Inventario autorizado → muestra temporal → tipos y esquema →
          existencia, propietario y moneda → perfil de anomalías → cuarentena de
          relaciones inválidas → informe agregado. El fixture posterior prueba
          esos contratos, pero no representa usuarios reales.
        </p>
      </Detail>
      <Source path="data-pipeline/data-card.md" label="Tarjeta de datos" />
      <Source path="data-pipeline/report.json" label="Perfil agregado" />
    </Section>
  );
}

const flow = [
  [
    "Entrar",
    "Cuenta de plataforma",
    "Sites/ChatGPT proporciona la identidad real. El cuerpo de la petición no puede elegir al propietario.",
    "Sin identidad: SIGN_IN_REQUIRED.",
  ],
  [
    "Abrir sandbox",
    "Sesión de 30 minutos",
    "Se elige Ana o Lucas y un rol de demostración. El servidor devuelve una cookie opaca.",
    "La persona ficticia y la cuenta real son distintas.",
  ],
  [
    "Encontrar la compra",
    "Búsqueda + hipótesis",
    "El mensaje produce intención orientativa y candidatos por importe, comercio, moneda, tarjeta y fecha.",
    "Ni un candidato único se selecciona automáticamente.",
  ],
  [
    "Elegir y documentar",
    "Decisión del cliente",
    "La persona selecciona transacción y motivo; escribe el relato o copia literalmente su mensaje.",
    "La declaración no se convierte en hecho comprobado.",
  ],
  [
    "Preparar",
    "Borrador de 10 minutos",
    "El servidor guarda el resumen, la huella de la compra y un token ligado a la sesión. Para corregir, se prepara otro.",
    "Todavía no existe un caso presentado.",
  ],
  [
    "Confirmar",
    "Consentimiento específico",
    "El cliente revisa hechos, relato y preguntas pendientes; confirma el borrador, su token y una clave de idempotencia.",
    "No envía un importe editable que sustituya la fuente.",
  ],
  [
    "Guardar y verificar",
    "Caso persistente",
    "Se revalidan sesión, propiedad, caducidad, fuente y repetición. Se inserta el caso con auditoría y se lee lo guardado.",
    "El comprobante se devuelve después de persistir.",
  ],
  [
    "Revisar",
    "Handoff humano",
    "Un revisor del sandbox añade una nota y marca «en revisión» o «falta información» con control de versión.",
    "Ningún estado confirma fraude ni concede reembolso.",
  ],
  [
    "Recuperar",
    "Continuidad",
    "Al reabrir el recorrido se recuperan casos y eventos. Un recorrido nuevo conserva los anteriores.",
    "El chat en memoria no es un historial persistente completo.",
  ],
];
export function WorkflowChapter() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("Approved");
  const [reason, setReason] = useState("unrecognized");
  const c = flow[step];
  const dispute = status === "Approved" && reason === "unrecognized";
  return (
    <Section
      eyebrow="04 / El recorrido"
      title="Sigue una solicitud de principio a fin."
      intro="Avanza o elige un paso. Cada uno combina una decisión humana con una comprobación concreta del sistema."
    >
      <div
        className="guide-flowsteps"
        role="group"
        aria-label="Pasos de una solicitud"
      >
        {flow.map((s, i) => (
          <button
            key={s[0]}
            aria-pressed={step === i}
            onClick={() => setStep(i)}
          >
            <span>{i + 1}</span>
            {s[0]}
          </button>
        ))}
      </div>
      <div className="guide-flowcard" aria-live="polite">
        <span className="guide-label">
          Paso {step + 1} · {c[1]}
        </span>
        <h3>{c[0]}</h3>
        <p>{c[2]}</p>
        <div className="guide-flow-rule">
          <ShieldCheck size={20} />
          <span>{c[3]}</span>
        </div>
        <div className="guide-inline-actions">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}>
            Paso anterior
          </button>
          <button disabled={step === 8} onClick={() => setStep(step + 1)}>
            Paso siguiente
          </button>
        </div>
      </div>
      <div className="guide-lab">
        <span className="guide-label">
          Regla del prototipo · sin guardar datos
        </span>
        <h3>¿Qué tipo de expediente se recibe?</h3>
        <div className="guide-controls">
          <label>
            Estado de la transacción
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["Approved", "Pending", "Reversed", "Declined"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Motivo confirmado
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="unrecognized">Cargo no reconocido</option>
              <option value="duplicate">Posible duplicado</option>
              <option value="merchant_issue">Problema con el comercio</option>
              <option value="other">Necesito revisión</option>
            </select>
          </label>
        </div>
        <div className="guide-lab-result" role="status">
          <span className="guide-label">Resultado simulado</span>
          <strong>
            {dispute ? "Recepción de disputa" : "Solicitud de soporte"}
          </strong>
          <p>
            {dispute
              ? "La compra está registrada y el cliente confirma que no la reconoce. Se recibe una solicitud para revisión humana."
              : "Esta combinación se deriva a soporte. No se cambia el estado del movimiento ni se presenta como una disputa adjudicada."}
          </p>
          <code>{dispute ? "dispute_intake" : "support_handoff"}</code>
        </div>
      </div>
      <Note>
        Esta bifurcación es una regla explícita del sandbox, no una política
        bancaria verificada, un plazo legal ni una regla de una red de tarjetas.
      </Note>
      <Detail title="Qué queda guardado y qué no">
        <p>
          Se guardan sesiones, recorridos, borradores, casos, auditoría y
          métricas instrumentadas. El relato confirmado y una copia de los
          hechos quedan en el caso. Los mensajes del chat viven en React:
          recargar no reconstruye la conversación completa. Cambiar ES/PT
          conserva el formulario durante la sesión.
        </p>
      </Detail>
      <Source
        path="lib/server/domain.ts"
        label="Regla de recepción frente a soporte"
      />
      <Source path="lib/server/api.ts" label="Ciclo de operaciones" />
    </Section>
  );
}

const modules = [
  [
    "Interfaz",
    "app/page.tsx",
    "React + TypeScript",
    "Mantiene conversación, selección, formulario y revisión. Muestra hechos y alegaciones por separado; no decide permisos.",
    "Una sola aplicación comparte la lógica de operaciones ES/PT y facilita demostrar ambos lados.",
  ],
  [
    "Identidad y sesión",
    "app/chatgpt-auth.ts",
    "Sites + sesión propia",
    "La plataforma aporta la cuenta real. El servidor deriva el espacio del propietario y liga la cookie a persona, rol, recorrido y caducidad.",
    "Reutiliza el acceso de Sites; otro hosting necesita su propia integración de identidad comprobada.",
  ],
  [
    "API y contratos",
    "lib/server/api.ts",
    "Cloudflare Worker + Zod",
    "Valida JSON estricto, origen, tamaño, sesión, rol, propietario, consentimiento y versión. SQL parametrizado.",
    "Las reglas críticas se comprueban aunque alguien modifique la interfaz.",
  ],
  [
    "Modelo de intención",
    "lib/server/model.ts",
    "TF-IDF + regresión logística",
    "Sugiere una de ocho intenciones; no autoriza operaciones y no estima riesgo de fraude.",
    "Inferencia dentro del Worker, sin proveedor de modelos externo en runtime.",
  ],
  [
    "Asistente contextual",
    "lib/assistant.ts",
    "Búsqueda determinista",
    "Cruza importe, moneda, comercio, tarjeta y fecha con transacciones propias. Explica ambigüedad, ausencia y conflictos.",
    "Candidatos verificables separados de la etiqueta aprendida y de la selección del cliente.",
  ],
  [
    "Fuente de demo",
    "lib/data/demo.json",
    "Snapshot inventado",
    "Dos personas, tres tarjetas y doce movimientos con corte, versión y referencias; no son datos vivos.",
    "Escenarios repetibles sin publicar registros originales.",
  ],
  [
    "Persistencia y auditoría",
    "db/schema.ts",
    "D1 / SQLite",
    "Guarda borradores y casos. Índices únicos evitan duplicados; triggers registran cambios en la misma operación.",
    "Base relacional pequeña y observable; no es un ledger bancario ni auditoría criptográfica.",
  ],
];
const endpoints = [
  ["GET /api/runs", "Recorridos de la cuenta"],
  ["POST /api/runs", "Nuevo recorrido y sesión; máximo 50 adicionales"],
  ["POST /api/session", "Abrir persona/rol en recorrido propio"],
  ["GET /api/session", "Contexto vigente y snapshot"],
  ["PATCH /api/session", "Cambiar solo idioma"],
  ["GET /api/transactions", "Movimientos propios; rol cliente"],
  ["POST /api/message", "Hipótesis y candidatos"],
  ["POST /api/drafts", "Preparar resumen validado"],
  ["POST /api/cases", "Confirmar y persistir"],
  ["GET /api/cases", "Casos autorizados"],
  ["GET /api/cases/:id", "Detalle e historial autorizado"],
  ["PATCH /api/cases/:id", "Revisión con nota y versión"],
  ["POST /api/demo/fault", "Expiración o respuesta perdida simuladas"],
  ["GET /api/metrics", "Hasta 200 operaciones instrumentadas del recorrido"],
];
export function ArchitectureChapter() {
  const [node, setNode] = useState(0);
  const m = modules[node];
  return (
    <Section
      eyebrow="05 / Arquitectura"
      title="La IA propone. El servidor controla. La base conserva."
      intro="Selecciona una pieza para ver su responsabilidad, su límite y el código que la implementa."
    >
      <div className="guide-architecture">
        <div
          className="guide-architecture-map"
          role="group"
          aria-label="Componentes de Reclama"
        >
          {modules.map((m, i) => (
            <button
              key={m[0]}
              onClick={() => setNode(i)}
              aria-pressed={node === i}
            >
              <span className="guide-label">
                {String(i + 1).padStart(2, "0")}
              </span>
              <strong>{m[0]}</strong>
              <small>{m[2]}</small>
            </button>
          ))}
        </div>
        <div className="guide-module" aria-live="polite">
          <span className="guide-label">Responsabilidad</span>
          <h3>{m[0]}</h3>
          <p>{m[3]}</p>
          <h4>Por qué está así</h4>
          <p>{m[4]}</p>
          <Source path={m[1]} />
        </div>
      </div>
      <h3>Límites de confianza</h3>
      <div className="guide-pipeline">
        <span>Navegador</span>
        <b>→</b>
        <span>Identidad y API</span>
        <b>→</b>
        <span>Contratos y consentimiento</span>
        <b>→</b>
        <span>D1 y lectura posterior</span>
      </div>
      <p>
        Al crear o modificar un caso, el servidor obtiene los importes y
        propietarios de la fuente, y el rol autorizado de la sesión. Una
        predicción nunca concede permisos. El inicio de sesión del sandbox sí
        permite elegir un rol ficticio, incluido revisor, dentro del espacio
        propio; no representa autorización de un banco real.
      </p>
      <Detail title="Qué hay en las seis tablas">
        <div
          className="guide-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Tablas de persistencia"
        >
          <table>
            <thead>
              <tr>
                <th>Tabla</th>
                <th>Responsabilidad</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "sessions",
                  "Persona, rol, idioma, vencimiento y fallo de demo.",
                ],
                ["demo_runs", "Propiedad y fecha del recorrido."],
                ["drafts", "Resumen, sesión, token y huella de los hechos."],
                ["cases", "Relato, evidencia, estado, versión y nota actual."],
                ["audit", "Evento, actor interno, versión, estado y fecha."],
                [
                  "attempts",
                  "Operación instrumentada, resultado, latencia y fecha.",
                ],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td>
                    <code>{a}</code>
                  </td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Las tarjetas y compras vienen del fixture versionado. D1 conserva el
          trabajo realizado sobre ellas.
        </p>
      </Detail>
      <Detail title="Mapa completo de la API">
        <p>
          Todas las rutas exigen identidad de plataforma. El flujo necesita
          además sesión válida; crear/listar recorridos y abrir sesión son las
          excepciones a este segundo requisito.
        </p>
        <div
          className="guide-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Operaciones de la API"
        >
          <table>
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Propósito</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(([a, b]) => (
                <tr key={a}>
                  <td>
                    <code>{a}</code>
                  </td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Detail>
      <Detail title="Por qué no microservicios, colas o RAG">
        <p>
          El flujo cabe en una aplicación y una base relacional. Más servicios
          introducirían coordinación sin resolver una necesidad demostrada del
          prototipo. Tampoco tenemos un corpus documental bancario validado que
          justifique presentar RAG como parte del producto. Es una decisión de
          alcance, no una afirmación de que esas técnicas sean inútiles.
        </p>
      </Detail>
      <Note kind="limit">
        El rol revisor se elige dentro del propio sandbox para ensayar ambos
        lados. No es autenticación de empleados ni gestión real de permisos de
        un banco.
      </Note>
      <Source path="db/schema.ts" label="Esquema" />
      <Source
        path="drizzle/0000_misty_nightshade.sql"
        label="Índices y triggers"
      />
    </Section>
  );
}

export function ModelChapter() {
  const [word, setWord] = useState("desconozco");
  const [size, setSize] = useState(3);
  const tokens =
    word
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g) || [];
  const grams = tokens.flatMap((t) => {
    const p = ` ${t} `;
    return Array.from({ length: Math.max(0, p.length - size + 1) }, (_, i) =>
      p.slice(i, i + size),
    );
  });
  return (
    <Section
      eyebrow="06 / El componente aprendido"
      title="Qué hace la IA, exactamente."
      intro="En ejecución no hay un LLM generando respuestas. Hay un clasificador aprendido y, por separado, búsqueda y orientación deterministas."
    >
      <div className="guide-grid two">
        <article>
          <span className="guide-label">Aprendido con ejemplos</span>
          <h3>Intención del mensaje</h3>
          <p>
            TF-IDF convierte fragmentos de texto en números. La regresión
            logística los combina para proponer una de ocho clases.
          </p>
        </article>
        <article>
          <span className="guide-label">Programado y verificable</span>
          <h3>Candidatos y siguiente paso</h3>
          <p>
            El asistente compara pistas como «84,90 USD» con transacciones. Un
            score nunca concede permiso ni selecciona un cargo.
          </p>
        </article>
      </div>
      <div className="guide-chips">
        {[
          "Cargo no reconocido",
          "Posible duplicado",
          "Problema con comercio",
          "Reembolso",
          "Tarjeta perdida",
          "Consulta de cuenta",
          "Consulta de crédito",
          "Otra / ambigua",
        ].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <p>
        Clasificar «reembolso» significa que el cliente lo solicita. No
        demuestra derecho a recibirlo ni que exista una herramienta para
        hacerlo.
      </p>
      <h3>Del texto a la hipótesis</h3>
      <ol className="guide-reading-list">
        <li>
          <strong>Normalizar:</strong> Unicode, minúsculas, quitar marcas de
          acento y extraer tokens.
        </li>
        <li>
          <strong>Fragmentar:</strong> secuencias de tres, cuatro y cinco
          caracteres de cada palabra, con espacios en los extremos.
        </li>
        <li>
          <strong>Ponderar:</strong> TF-IDF asigna peso por frecuencia y rareza
          en entrenamiento; el vector se normaliza.
        </li>
        <li>
          <strong>Clasificar:</strong> pesos e interceptos aprendidos producen
          puntuaciones; softmax las compara entre clases.
        </li>
        <li>
          <strong>Aplicar política:</strong> los umbrales congelados deciden si
          aceptar. En V2 no se acepta ninguna; se exige elección explícita.
        </li>
      </ol>
      <div className="guide-lab">
        <span className="guide-label">
          Explora el extractor · no es una predicción
        </span>
        <h3>¿Qué es un n-grama de caracteres?</h3>
        <label className="guide-input-label">
          Palabra o frase corta
          <input
            value={word}
            maxLength={50}
            onChange={(e) => setWord(e.target.value)}
            spellCheck={false}
          />
        </label>
        <div
          className="guide-segment"
          role="group"
          aria-label="Tamaño del fragmento"
        >
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              aria-pressed={size === n}
              onClick={() => setSize(n)}
            >
              {n} caracteres
            </button>
          ))}
        </div>
        <div className="guide-grams" aria-live="polite">
          {grams.slice(0, 42).map((g, i) => (
            <code key={`${i}-${g}`}>{g.replace(/ /g, "␣")}</code>
          ))}
        </div>
        <p className="guide-small">
          {grams.length} fragmentos; se muestran hasta 42. ␣ es un espacio. El
          modelo real combina los tres tamaños y solo usa su vocabulario
          aprendido. Este explorador no consulta pesos ni calcula intención; el
          texto permanece local, sin guardarse ni enviarse.
        </p>
      </div>
      <Detail title="Un poco de matemática, sin magia">
        <p>
          Para una característica conocida:{" "}
          <code>x = (1 + ln(repeticiones)) × IDF</code>. Se divide el vector por
          su norma L2. Cada clase calcula{" "}
          <code>z = intercepto + suma(peso × x)</code>. Softmax compara esos
          valores. No se ha demostrado calibración probabilística: no es
          «probabilidad de fraude».
        </p>
        <p>
          El JSON exportado contiene vocabulario, IDF, pesos, interceptos y
          política. JavaScript reproduce el cálculo de Python; no reentrena ni
          recalcula IDF con cada mensaje.
        </p>
      </Detail>
      <h3>De reglas a V2</h3>
      <div className="guide-timeline">
        <article>
          <span>Reglas</span>
          <div>
            <h3>Un baseline real</h3>
            <p>
              Patrones bilingües ponderados, señales compuestas y negación
              explícita; no una regla trivial que siempre elige la clase
              mayoritaria.
            </p>
          </div>
        </article>
        <article>
          <span>V1</span>
          <div>
            <h3>Palabras y bigramas</h3>
            <p>
              320 mensajes IA: 192 train, 64 validación y 64 test. El test
              original dio 46/64 frente a 43/64 de reglas, sin mejora
              concluyente. Una revisión de política tras ver agregados dejó el
              experimento como exploratorio.
            </p>
          </div>
        </article>
        <article>
          <span>V2</span>
          <div>
            <h3>Caracteres y congelación previa</h3>
            <p>
              634 mensajes train y 128 de validación. Nueve candidatos:
              word/char/hybrid y C=1/4/12. Ganó char, C=12 y 3.500
              características por macro-F1 de validación. No se eligió mirando
              el conjunto de desarrollo reservado, también creado por IA.
            </p>
          </div>
        </article>
      </div>
      <Detail title="Dónde usamos un LLM durante el desarrollo">
        <p>
          Gemma2 9B local generó 314 mensajes conservados. Se sumaron 192 del
          train V1 y 128 escritos/curados por IA. Se registraron 99 entradas
          rechazadas, incluidas entradas de metadatos, por errores de
          estructura, etiquetas, repetición o duplicación.
        </p>
        <p>
          El LLM ayudó a producir datos de entrenamiento; no responde en
          producción. No enviamos registros bancarios a un proveedor generativo.
          Las etiquetas IA y el portugués aún requieren revisión humana.
        </p>
      </Detail>
      <Note kind="limit" title="El gate falló y lo mantuvimos cerrado">
        La validación exigía ≥95% de exactitud selectiva, al menos ocho «no
        reconocido» aceptados y cero falsos aceptados de esa clase. Ninguna
        combinación cumplió todo. V2 se abstiene siempre: muestra top-1 como
        hipótesis, no como motivo confirmado.
      </Note>
      <Source path="ml/v2/model-card.md" label="Model card V2 histórica" />
      <Source path="ml/v2/protocol.md" label="Protocolo histórico congelado" />
      <Source path="lib/assistant.ts" label="Componente determinista" />
    </Section>
  );
}

export function EvaluationChapter() {
  const [locale, setLocale] = useState("all");
  const n = locale === "all" ? 256 : 128;
  const scores =
    locale === "all"
      ? [168, 211, 218]
      : locale === "es"
        ? [84, 109, 110]
        : [84, 102, 108];
  return (
    <Section
      eyebrow="07 / Evaluación"
      title="Cada resultado tiene un denominador y un límite."
      intro="Clasificación, seguridad de una escritura y experiencia en navegador se miden por separado. Un resultado no valida automáticamente las otras capas."
    >
      <Note kind="limit" title="No hay validación independiente acreditada">
        El conjunto reservado contiene 256 mensajes de autoría IA en 128
        familias ES/PT, sin registros del organizador ni revisión humana. Es un
        experimento de desarrollo; no constituye un benchmark oficial ni válido
        del reto. Separar autores y congelar pesos no cambia esa procedencia.
      </Note>
      <Detail title="Resultados históricos del experimento de desarrollo">
        <h3>Mismos textos creados por IA para los tres sistemas</h3>
        <div
          className="guide-segment"
          role="group"
          aria-label="Idioma evaluado"
        >
          {[
            ["all", "ES + PT"],
            ["es", "Español"],
            ["pt", "Portugués"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={locale === id}
              onClick={() => setLocale(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="guide-chart" aria-live="polite">
          {["Reglas", "Modelo V1", "Modelo V2"].map((name, i) => (
            <div key={name} className="guide-bar-row">
              <div>
                <strong>{name}</strong>
                <span>
                  {scores[i]}/{n} ·{" "}
                  {((100 * scores[i]) / n).toLocaleString("es-EC", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  %
                </span>
              </div>
              <div className="guide-bar-track">
                <div
                  className={i === 2 ? "candidate" : ""}
                  style={{ width: `${(100 * scores[i]) / n}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="guide-small">
          Exactitud top-1: coincidencia entre la etiqueta más probable y la
          referencia de autoría IA. No es validación independiente, rendimiento
          sobre datos del reto ni porcentaje de disputas resueltas.
        </p>
        <h3>Comparación histórica ES+PT · 256 mensajes de desarrollo</h3>
        <div className="guide-grid two">
          <article>
            <h4>V2 frente a reglas</h4>
            <p>
              +19,53 puntos de exactitud; intervalo bootstrap por familia del
              95% [11,72; 27,34]. Macro-F1: 0,8310 frente a 0,6752.
            </p>
          </article>
          <article>
            <h4>V2 frente a V1</h4>
            <p>
              +2,73 puntos; intervalo [−1,17; 6,64]. Incluye cero: no hay
              superioridad concluyente frente a V1.
            </p>
          </article>
        </div>
        <Note kind="limit" title="El promedio oculta errores importantes">
          V2 reconoce solo 9/32 mensajes «other». De 34 sugerencias
          «unrecognized», nueve son incorrectas. Su top-1 no puede sustituir la
          elección del usuario.
        </Note>
      </Detail>
      <h3>Controles del experimento y sus límites</h3>
      <ol className="guide-reading-list">
        <li>
          <strong>Pares juntos:</strong> la misma situación ES/PT permanece en
          una partición.
        </li>
        <li>
          <strong>Validación para elegir:</strong> configuración y umbrales se
          seleccionan sin el conjunto de desarrollo reservado, también creado
          por IA.
        </li>
        <li>
          <strong>Congelación:</strong> hashes fijan modelo, corpus, scripts y
          política antes de abrir el holdout.
        </li>
        <li>
          <strong>Autor separado:</strong> otro agente IA produjo 256 textos,
          128 familias, 32 por clase; no es adjudicación humana.
        </li>
        <li>
          <strong>Mismas entradas:</strong> reglas, V1 y V2 ven los mismos
          textos, sin etiquetas ni IDs.
        </li>
        <li>
          <strong>Sin retocar:</strong> si los errores del test influyen en una
          mejora, deja de ser una comparación reservada. Un nuevo conjunto de
          autoría IA tampoco acredita por sí solo validación independiente.
        </li>
      </ol>
      <Detail title="Exactitud, precisión, recall y macro-F1">
        <ul>
          <li>
            <strong>Exactitud:</strong> aciertos sobre todos los ejemplos.
          </li>
          <li>
            <strong>Precisión:</strong> de las sugerencias de una clase, cuántas
            son correctas.
          </li>
          <li>
            <strong>Recall:</strong> de los ejemplos de referencia de esa clase,
            cuántos encontramos.
          </li>
          <li>
            <strong>Macro-F1:</strong> promedia el equilibrio de
            precisión/recall dando igual peso a cada clase.
          </li>
          <li>
            <strong>Bootstrap por familia:</strong> remuestrea situaciones
            completas con ambos idiomas porque sus traducciones están
            relacionadas.
          </li>
        </ul>
      </Detail>
      <Detail title="Abstenerse siempre no significa 100% de seguridad">
        <p>
          La cobertura de aceptación es 0%. La exactitud selectiva es indefinida
          porque no hay aceptaciones. Se puede medir top-1 como hipótesis aunque
          no tenga autoridad para dirigir una operación.
        </p>
      </Detail>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Resultados de pruebas de software"
      >
        <table>
          <caption>Evidencia de software del commit funcional V3</caption>
          <thead>
            <tr>
              <th>Prueba</th>
              <th>Resultado</th>
              <th>Qué cubre</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "HTTP original",
                "28/28",
                "Flujo y controles a través de la API.",
              ],
              [
                "Recorridos e idioma",
                "16/16",
                "Borrador, recuperación, reintento y aislamiento de recorridos.",
              ],
              [
                "Contexto obsoleto",
                "9/9",
                "Peticiones de una pestaña con contexto anterior.",
              ],
              [
                "Asistente determinista",
                "20/20",
                "Matching, ambigüedad, propiedad y orientación.",
              ],
              [
                "Paridad Python/JS V2",
                "10/10",
                "Portado numérico; no valida las etiquetas.",
              ],
              [
                "Navegador",
                "Recorrido observado",
                "Creación, revisión, recuperación y móvil local a 390px.",
              ],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note kind="pending">
        Todo el corpus del experimento fue creado y etiquetado por IA. Las
        pruebas de software con fixtures tampoco validan la calidad del modelo.
        Faltan evaluación independiente admisible, revisión humana ES/PT y
        aceptación con dos cuentas reales en producción. Cero coincidencias
        textuales exactas no demuestra independencia semántica ni
        representatividad bancaria.
      </Note>
      <h3>Latencia y coste</h3>
      <p>
        CPU local caliente del modelo: p95 0,082 ms. Excluye red, carga del
        JSON, arranque, autenticación, almacenamiento e interfaz. No es latencia
        E2E. No hay llamadas externas al modelo en runtime; hosting y operación
        no están medidos completamente, así que no afirmamos coste total cero.
      </p>
      <p className="guide-small">
        Los enlaces del experimento conservan la versión histórica. Sus términos
        de «independiente» quedan supersedidos por esta corrección de
        procedencia; los archivos congelados no se reescriben.
      </p>
      <Source
        path="ml/v2/test-report.json"
        label="Experimento de desarrollo histórico"
      />
      <Source path="docs/evidence/BROWSER_V3.md" label="Aceptación local" />
      <a
        className="guide-source"
        href={`${REPO}/actions/runs/36624297648`}
        target="_blank"
        rel="noreferrer"
      >
        CI de V3
      </a>
    </Section>
  );
}

const failures = [
  [
    "Respuesta perdida",
    "503 SIMULATED_TIMEOUT",
    "El servidor guarda el caso y se pierde la respuesta.",
    "Reintentar con la misma clave y borrador.",
    "Se devuelve el original; no se duplica.",
    "La clave identifica una operación; no autentica al usuario.",
  ],
  [
    "Caso ajeno",
    "404 NOT_FOUND",
    "Un cliente consulta otra persona; cualquier rol consulta otro recorrido o propietario.",
    "El servidor restringe por propietario y recorrido. Para clientes, también por persona.",
    "Se rechaza ese acceso. El revisor sí puede consultar ambas personas de su propio recorrido.",
    "El revisor es un rol ficticio dentro del mismo sandbox. Las pruebas locales no sustituyen dos cuentas reales alojadas.",
  ],
  [
    "Sesión expirada",
    "401 SESSION_EXPIRED",
    "La sesión deja de ser válida.",
    "Limpiar datos y controles, cancelar peticiones y abrir otra sesión.",
    "Los casos guardados se pueden recuperar.",
    "Un borrador ligado a la sesión anterior necesita nueva preparación.",
  ],
  [
    "Otra pestaña",
    "409 SESSION_CONTEXT_CHANGED",
    "Otra pestaña cambia la cookie compartida mientras esta conserva contexto anterior.",
    "Comparar la huella esperada; descartar respuestas de una generación vieja.",
    "Se exige recuperar el contexto.",
    "El marcador es opcional para clientes API y nunca sustituye autorización.",
  ],
  [
    "Evidencia distinta",
    "SOURCE_CHANGED",
    "La transacción ya no coincide con la huella del borrador.",
    "Rechazar la confirmación de hechos obsoletos.",
    "Preparar y revisar un nuevo resumen.",
    "La fuente de esta demo es estática; el contrato contempla cambios futuros.",
  ],
  [
    "Dos revisores",
    "409 VERSION_CONFLICT",
    "Ambos leen v1; uno actualiza a v2 antes del segundo.",
    "El UPDATE exige la versión que se leyó.",
    "Se rechaza la escritura vieja para no sobrescribir silenciosamente.",
    "No se fusionan notas; audit no guarda todas las notas completas.",
  ],
  [
    "Texto sensible",
    "422 SENSITIVE_CONTENT",
    "El texto contiene patrones de PIN, contraseña, correo o tarjeta completa.",
    "Rechazar antes de agregar el mensaje aceptado al chat.",
    "Se pide retirar la información sensible.",
    "Regex no es prevención exhaustiva de fugas: usar solo datos inventados.",
  ],
];
export function SecurityChapter() {
  const [fault, setFault] = useState(0);
  const f = failures[fault];
  return (
    <Section
      eyebrow="08 / Controles y fallos"
      title="Qué ocurre cuando el camino feliz se rompe."
      intro="Selecciona un escenario. Los controles residen fuera del modelo y tienen respuestas observables."
    >
      <div
        className="guide-segment"
        role="group"
        aria-label="Escenario de fallo"
      >
        {failures.map((f, i) => (
          <button
            key={f[0]}
            aria-pressed={fault === i}
            onClick={() => setFault(i)}
          >
            {f[0]}
          </button>
        ))}
      </div>
      <div className="guide-failure" aria-live="polite">
        <code>{f[1]}</code>
        <h3>{f[0]}</h3>
        <ol>
          <li>
            <strong>Qué pasa:</strong> {f[2]}
          </li>
          <li>
            <strong>Qué hacemos:</strong> {f[3]}
          </li>
          <li>
            <strong>Resultado:</strong> {f[4]}
          </li>
        </ol>
        <p className="guide-small">Límite: {f[5]}</p>
      </div>
      <h3>Idempotencia, sin jerga</h3>
      <p>
        Repetir la misma operación con la misma clave y contenido devuelve el
        resultado original. Reusar la clave con otro contenido produce{" "}
        <code>IDEMPOTENCY_CONFLICT</code>; otra clave para el mismo movimiento
        produce <code>CASE_ALREADY_EXISTS</code>.
      </p>
      <p>
        Dos índices únicos refuerzan el código: recorrido + clave, y recorrido +
        cliente + transacción. Esto también protege carreras concurrentes: no
        dependemos solo de comprobar primero y escribir después.
      </p>
      <Detail title="Cuenta, persona, rol, sesión y recorrido">
        <dl>
          <dt>Cuenta real</dt>
          <dd>Identidad autenticada por Sites/ChatGPT.</dd>
          <dt>Persona</dt>
          <dd>Ana o Lucas dentro del sandbox de esa cuenta.</dd>
          <dt>Rol</dt>
          <dd>Cliente/revisor ficticio para demostrar ambos lados.</dd>
          <dt>Sesión</dt>
          <dd>Contexto temporal del servidor ligado a cookie opaca.</dd>
          <dt>Recorrido</dt>
          <dd>
            Espacio del propietario para repetir la demo conservando los casos
            previos; máximo 50 adicionales.
          </dd>
          <dt>Contexto</dt>
          <dd>
            Huella no secreta de la sesión que detecta pestañas desactualizadas;
            no concede permisos.
          </dd>
        </dl>
      </Detail>
      <Detail title="Qué protege el consentimiento">
        <p>
          Borrador inmutable, diez minutos de vigencia, token, misma
          sesión/persona/recorrido, <code>confirmed:true</code> y una fuente sin
          cambios. Es confirmación técnica de un resumen específico, no firma
          electrónica certificada ni garantía legal.
        </p>
        <p>
          Un reintento válido puede recuperar el caso original aunque el
          borrador haya caducado, porque se busca primero esa operación. No
          permite crear un caso nuevo desde un borrador vencido.
        </p>
      </Detail>
      <Detail title="Auditoría atómica y sus límites">
        <p>
          Un trigger registra el evento en la misma operación que crea o
          actualiza el caso. La interfaz no tiene que recordar una segunda
          llamada.
        </p>
        <p>
          No es cadena criptográfica inalterable ni event sourcing completo.
          Guarda evento, estado, actor, versión y fecha. La nota actual está en
          el caso; una edición la reemplaza y el historial no conserva cada nota
          íntegra.
        </p>
      </Detail>
      <Note kind="fact">
        Escrituras con origen exacto, JSON limitado y esquemas Zod estrictos.
        Cookie HttpOnly, SameSite=Lax y Secure en HTTPS. Propiedad, expiración y
        rol siguen siendo necesarios: ninguna defensa reemplaza a las demás.
      </Note>
      <Source path="lib/server/api.ts" label="Controles del servidor" />
      <Source
        path="docs/evidence/RUNS_SECURITY_REVIEW.md"
        label="Revisión de aislamiento"
      />
    </Section>
  );
}

export function BuildChapter() {
  return (
    <Section
      eyebrow="09 / Proceso"
      title="Investigamos, acotamos, medimos y corregimos."
      intro="El proyecto cambió cuando aparecieron datos o fallos que invalidaban una suposición. Los primeros documentos son historia, no siempre descripción del código actual."
    >
      <div className="guide-timeline">
        {[
          [
            "Investigar",
            "Requisitos y viabilidad",
            "Enunciado, kickoff, diccionario, resumen, mensajes y parte de la grabación. Perfilado de relaciones antes de decidir qué prometer.",
          ],
          [
            "Acotar",
            "Recepción nueva de disputas",
            "Separar registrar una solicitud de adjudicarla. Definir un final observable: recibir, persistir y entregar a un revisor.",
          ],
          [
            "Construir",
            "Flujo con controles",
            "Sesión, movimientos propios, borrador, confirmación, persistencia y auditoría; estados y contratos explícitos.",
          ],
          [
            "Aprender",
            "Baseline, V1 y V2",
            "El primer experimento no justificó autonomía. El segundo añadió diversidad y congeló antes del nuevo test. No se ocultaron resultados negativos.",
          ],
          [
            "Revisar",
            "Correcciones de V3",
            "Cambiar idioma borraba trabajo; «84,90» no encontraba el importe; repetir la demo agotaba casos; dos pestañas podían divergir. Se corrigieron estado, búsqueda, recorridos y contexto.",
          ],
          [
            "Entregar",
            "Código, build y despliegue",
            "Paquete construido desde el commit subido a GitHub y Sites. CI contra D1 local nueva. La versión V3 terminó desplegada y privada.",
          ],
        ].map(([a, b, c]) => (
          <article key={a}>
            <span>{a}</span>
            <div>
              <h3>{b}</h3>
              <p>{c}</p>
            </div>
          </article>
        ))}
      </div>
      <h3>Ventajas y costes de la tecnología</h3>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Decisiones de tecnología"
      >
        <table>
          <thead>
            <tr>
              <th>Elección</th>
              <th>Ventaja buscada</th>
              <th>Límite</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "React + TypeScript",
                "Interfaz ES/PT y tipos compartidos.",
                "Los tipos no validan peticiones en runtime. La vista principal creció y convendría dividirla.",
              ],
              [
                "Vinext / Worker",
                "Usar el entorno Sites existente y una API desplegable.",
                "Acoplamiento a runtime e identidad; otro hosting requiere adaptación.",
              ],
              [
                "D1 / SQLite",
                "Persistencia, índices únicos y operaciones pequeñas.",
                "Sin demostración de alta carga, operación bancaria o recuperación de desastre.",
              ],
              [
                "Clasificador local",
                "Pequeño, reproducible y sin API de modelo en runtime.",
                "Menor flexibilidad conversacional; dificultad con contexto, negación y ambigüedad.",
              ],
              [
                "HTTP + navegador",
                "Verificar contratos y experiencia.",
                "Local no prueba por sí solo OAuth ni aislamiento real alojado.",
              ],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note title="De propuesta a implementación">
        La estrategia original contemplaba un LLM y decía que el prototipo aún
        no existía. El código actual usa clasificador local, asistente
        determinista y casos persistentes. No debemos presentar una intención
        inicial como funcionalidad implementada.
      </Note>
      <Detail title="Cómo se distribuyó el trabajo entre agentes">
        <p>
          Investigación de datos, entrenamiento, autoría del holdout, revisión
          adversarial y pruebas se separaron en tareas acotadas. El integrador
          manejó código y despliegue. Separar al autor del test del
          entrenamiento reduce contaminación directa; no equivale a evaluación
          humana independiente.
        </p>
      </Detail>
      <Source path=".github/workflows/verify.yml" label="Pipeline CI" />
      <Source path="docs/evidence/BROWSER_V3.md" label="Aceptación V3" />
    </Section>
  );
}

export function DeliveryChapter() {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <Section
      eyebrow="10 / Reproducir y terminar"
      title="Desplegar y entregar no son el mismo estado."
      intro="La aplicación funcional existe. La aceptación con cuentas reales, el material final y el envío requieren su propia evidencia."
    >
      <div className="guide-grid two">
        <article>
          <Check />
          <h3>Confirmado en V3</h3>
          <ul>
            <li>Código subido y repositorio privado.</li>
            <li>Versión desplegada con acceso restringido.</li>
            <li>CI verde en c0d9fe6.</li>
            <li>Recorrido local, revisión y recuperación del caso.</li>
          </ul>
        </article>
        <article>
          <CircleHelp />
          <h3>Pendiente</h3>
          <ul>
            <li>Login normal y aislamiento con dos cuentas reales.</li>
            <li>Revisión humana ES/PT y de etiquetas.</li>
            <li>Actualizar slides y video finales.</li>
            <li>Decisión de publicación, envío y recibo.</li>
          </ul>
        </article>
      </div>
      <Note kind="limit">
        La prueba automática del login alojado encontró una verificación de
        seguridad del proveedor. No se eludió. Un despliegue «succeeded» no
        demuestra que una persona completó el flujo autenticado.
      </Note>
      <h3>Desde un clon limpio</h3>
      <p>
        Acceso al repositorio privado, Node.js 22.13+ y Python 3.11+ para app y
        pruebas básicas. El modelo exportado no necesita GPU ni clave de API.
      </p>
      <pre>
        <code>
          {[
            "git clone https://github.com/VillaforTech/factored-hackathon-2026-reclama.git",
            "cd factored-hackathon-2026-reclama",
            "git switch codex/reclama",
            "npm run install:ci",
            "npm run build",
            "npm run db:local",
            "npm run dev",
          ].join("\n")}
        </code>
      </pre>
      <p>
        Abre la URL que imprima el servidor y usa el inicio de sesión local
        documentado. Esa identidad es de desarrollo: no expongas el servidor ni
        confíes en sus encabezados fuera del entorno previsto.
      </p>
      <Detail title="Verificar aplicación y contratos">
        <pre>
          <code>
            {[
              "npm run check",
              "npm run test:assistant",
              "node ml/v2/verify-parity.mjs",
              "python3 data-pipeline/validate_assets.py",
              "python3 tests/http-integration.py --base-url http://127.0.0.1:5173 --output /tmp/reclama-http-results.json",
              "python3 tests/http-runs-regressions.py --base-url http://127.0.0.1:5173 --output /tmp/reclama-runs-results.json",
              "python3 tests/http-context-regressions.py --base-url http://127.0.0.1:5173 --output /tmp/reclama-context-results.json",
            ].join("\n")}
          </code>
        </pre>
        <p>
          Las pruebas HTTP crean casos ficticios; no borran anteriores. La suite
          original necesita una base local nueva para un pase completo. Si el
          fixture se agotó, usa un checkout separado de verificación; no borres
          datos silenciosamente.
        </p>
      </Detail>
      <Detail title="Reproducir el modelo sin alterar el original">
        <p>
          El README ML documenta el entorno Python y{" "}
          <code>train_from_corpus.py --output-dir CARPETA_NUEVA</code>. Entrena
          desde los 634 textos train seleccionados, sin usar validación ni
          holdout y fuera de los artefactos congelados.
        </p>
        <p>
          Reproducir parámetros no es nueva evaluación independiente. Si se
          ajusta a errores conocidos, hace falta otro test reservado.
        </p>
        <Source path="ml/README.md" label="Comandos vigentes ML" />
      </Detail>
      <h3>Responsabilidades propuestas</h3>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Responsabilidades propuestas del equipo"
      >
        <table>
          <thead>
            <tr>
              <th>Persona</th>
              <th>Trabajo propuesto</th>
              <th>Evidencia de cierre</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Roberto</td>
              <td>Integración, aceptación alojada y preservar experimentos.</td>
              <td>Dos cuentas verificadas y versión congelada.</td>
            </tr>
            <tr>
              <td>Jorge</td>
              <td>Clon limpio y revisión de controles/flujo cliente.</td>
              <td>Registro reproducible de ejecución y hallazgos.</td>
            </tr>
            <tr>
              <td>Daniel</td>
              <td>Experiencia, escenarios bilingües y materiales.</td>
              <td>Recorrido ensayado, revisión lingüística y video fiel.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="guide-small">
        Las asignaciones de Jorge y Daniel deben acordarse con ellos; no son
        habilidades ni compromisos confirmados.
      </p>
      <Detail title="Plan diario hasta la entrega">
        <ul>
          <li>
            <strong>30 sep:</strong> login normal, dos cuentas y móvil.
          </li>
          <li>
            <strong>1 oct:</strong> auditoría de etiquetas y portugués,
            preservando el test congelado.
          </li>
          <li>
            <strong>2 oct:</strong> cerrar fallos críticos y medir con
            denominadores claros.
          </li>
          <li>
            <strong>3 oct:</strong> congelar alcance y reproducir desde clon
            limpio.
          </li>
          <li>
            <strong>4 oct:</strong> actualizar demo y seis diapositivas;
            verificar cada afirmación.
          </li>
          <li>
            <strong>5 oct:</strong> comprobar enlaces, permisos y paquete;
            enviar temprano y conservar recibo.
          </li>
        </ul>
        <p>
          La aclaración oficial revisada el 28 de septiembre fijó el 5 de
          octubre a las 23:59 UTC−5, Ecuador continental. Meta interna: 20:00.
          Revisar el último anuncio antes de enviar. La entrega documentada
          requiere repositorio público, demo o excepción local explicada, 4–6
          diapositivas y video máximo de tres minutos.
        </p>
      </Detail>
      <Note kind="pending" title="Privacidad por decisión tuya">
        Demo y repositorio deben seguir privados hasta una nueva instrucción. El
        requisito de publicación al entregar no autoriza publicarlos ahora. Los
        usuarios GitHub no sustituyen los correos de acceso al sitio.
      </Note>
      <h3>Cuándo cambiaríamos de rumbo</h3>
      <p>
        Si no podemos reproducir propiedad coherente o evaluar una recepción
        segura, reducimos a soporte con evidencia. Crédito solo sería
        alternativa con catálogo y política explícitos evaluables. Si el modelo
        no mejora una tarea, limitamos su papel o usamos formulario. Un control
        crítico fallido bloquea esa versión.
      </p>
      <div className="guide-lab">
        <span className="guide-label">Comprueba la idea central</span>
        <h3>
          ¿Puede un resultado de desarrollo autorizar una disputa por sí solo?
        </h3>
        <div className="guide-segment">
          <button aria-pressed={answer === 0} onClick={() => setAnswer(0)}>
            Sí, con score alto
          </button>
          <button aria-pressed={answer === 1} onClick={() => setAnswer(1)}>
            No: faltan selección y confirmación
          </button>
        </div>
        {answer !== null && (
          <p
            className={answer === 1 ? "guide-answer good" : "guide-answer"}
            role="status"
          >
            {answer === 1
              ? "Exacto. La métrica mide etiquetas sintéticas; no aporta identidad, propiedad, consentimiento ni evidencia de fraude."
              : "Un score no concede permisos. Además, la política V2 se abstiene de aceptar predicciones: siguen siendo necesarias las validaciones y la confirmación."}
          </p>
        )}
      </div>
      <Source path="docs/DELIVERY_PLAN.md" label="Plan propuesto" />
      <Source path="docs/SUBMISSION_DRAFT.md" label="Entrega no enviada" />
    </Section>
  );
}

export function SourcesChapter() {
  return (
    <Section
      eyebrow="11 / Referencias"
      title="Cómo verificar lo que acabas de leer."
      intro="Los enlaces de código apuntan al commit funcional V3, c0d9fe6, para conservar la evidencia que sustenta la explicación. El repositorio sigue privado."
    >
      <div className="guide-grid two">
        <article>
          <h3>Hechos implementados</h3>
          <p>
            Derivan de código y ejecuciones guardadas. Una prueba confirma su
            escenario y entorno, no cualquier situación futura.
          </p>
        </article>
        <article>
          <h3>Razones y límites</h3>
          <p>
            Las decisiones explican compromisos. Las limitaciones identifican lo
            que el código o las mediciones todavía no prueban.
          </p>
        </article>
      </div>
      <h3>Fuentes del proyecto</h3>
      <div className="guide-source-list">
        {[
          ["README.md", "Visión general y reproducción"],
          ["data-pipeline/data-card.md", "Datos y privacidad"],
          ["data-pipeline/report.json", "Perfil agregado"],
          ["ml/v1/model-card.md", "V1: experimento exploratorio"],
          ["ml/v2/model-card.md", "V2: resultados y errores"],
          ["ml/v2/protocol.md", "Protocolo congelado"],
          ["ml/heldout-v2/README.md", "Procedencia del conjunto de desarrollo"],
          ["lib/server/api.ts", "API y autorización"],
          ["lib/assistant.ts", "Búsqueda determinista"],
          ["docs/evidence/BROWSER_V3.md", "Navegador"],
          [
            "docs/evidence/http-context-results.json",
            "Contexto entre pestañas",
          ],
          [".github/workflows/verify.yml", "CI"],
        ].map(([path, label]) => (
          <Source key={path} path={path} label={label} />
        ))}
      </div>
      <h3>Fuentes oficiales</h3>
      <p>
        Revisadas en la investigación del 28 de septiembre. En esta edición, el
        lector web no pudo reabrir el hub ni Google Docs; no afirmamos una nueva
        revisión completa de Slack o la grabación.
      </p>
      <ul className="guide-official">
        {[
          [
            "https://docs.google.com/document/d/18AwONT8hQupRcfNPLFrPo6fHOJ_OUn1nBf-3jMnla2c/edit",
            "Enunciado en Google Docs",
          ],
          [
            "https://www.factored.ai/careers/ai-data-hackathon",
            "Página del evento",
          ],
          [
            "https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4EU9MQS1/datathon_2026_kickoff.pdf",
            "Diapositivas del kickoff",
          ],
          [
            "https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809",
            "Plazo y duración máxima del video",
          ],
          [
            "https://factored-hackathon.slack.com/archives/C0BU1199KFX/p1790389966930169?thread_ts=1790377325.677879",
            "Herramientas locales y despliegue",
          ],
          [
            "https://factored-hackathon.slack.com/archives/C0BU1199KFX/p1790366324592219?thread_ts=1790363080.139599",
            "Componente aprendido y baseline",
          ],
        ].map(([url, label]) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noreferrer">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <Note kind="limit">
        El resumen habla de aproximadamente 19 millones de filas y trece tablas.
        Nuestro perfil es una muestra acotada. No se copian aquí documentos que
        contienen información privada de acceso.
      </Note>
      <h3>Glosario para leer el código</h3>
      {[
        [
          "Sandbox y fixture",
          "Sandbox es un entorno de prueba. Fixture es un conjunto controlado y repetible para provocar escenarios sin usar datos reales.",
        ],
        [
          "Snapshot y procedencia",
          "Un corte de datos y su origen: sourceRef identifica una fila inventada; sourceVersion, su versión. El hash del borrador permite detectar cambios en sus hechos.",
        ],
        [
          "Train, validation y holdout",
          "Train aprende pesos; validation selecciona configuración y política; holdout reserva datos hasta fijar decisiones. Aquí las tres particiones son de autoría IA: la separación no acredita validación independiente ni un benchmark válido del reto.",
        ],
        [
          "Leakage o fuga de evaluación",
          "Información del supuesto test influye en entrenamiento o decisiones. Separar familias y congelar reduce vías concretas, pero no elimina todo sesgo.",
        ],
        [
          "Abstención",
          "La política puede negarse a aceptar aunque siempre exista una clase con mayor puntuación. En V2 toda etiqueta es una hipótesis no confirmada.",
        ],
        [
          "Idempotencia",
          "Repetir la misma operación con igual clave y contenido devuelve el original sin duplicar su efecto.",
        ],
        [
          "Atomicidad",
          "Una operación se completa como unidad o falla. El trigger evita una escritura independiente de auditoría que pudiera olvidarse.",
        ],
        [
          "Concurrencia optimista",
          "El servidor actualiza solo si sigue vigente la versión leída; en caso contrario exige volver a consultar.",
        ],
        [
          "Paridad",
          "Comparar salidas numéricas del mismo modelo en dos implementaciones. Pueden coincidir perfectamente y aun así clasificar mal.",
        ],
        [
          "CI, build y despliegue",
          "CI ejecuta checks; build produce el paquete; despliegue publica una versión. Ninguno equivale a aceptación con cuentas reales o recibo del hackathon.",
        ],
      ].map(([title, text]) => (
        <Detail key={title} title={title}>
          <p>{text}</p>
        </Detail>
      ))}
    </Section>
  );
}
