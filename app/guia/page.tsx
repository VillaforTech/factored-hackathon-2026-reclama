"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Database,
  GitBranch,
  Layers3,
  ShieldCheck,
  FlaskConical,
  Code2,
  Check,
  FileText,
  ChevronRight,
} from "lucide-react";
import "./guide.css";

import { REPO, Source, Note, Section, Detail } from "./guide-ui";
import {
  DataChapter,
  WorkflowChapter,
  ArchitectureChapter,
  ModelChapter,
  EvaluationChapter,
  SecurityChapter,
  BuildChapter,
  DeliveryChapter,
  SourcesChapter,
} from "./guide-chapters";

function Overview() {
  return (
    <Section
      eyebrow="01 / El propósito"
      title="Recibir bien un reclamo es un problema completo."
      intro="Reclama convierte un cargo que el cliente no reconoce en un expediente verificable para revisión humana. Ese es el resultado que construimos y medimos."
    >
      <div className="guide-contrast">
        <div>
          <span className="guide-label">Antes</span>
          <h3>«No hice esta compra»</h3>
          <p>
            El cliente trae una declaración. Todavía no sabemos qué transacción
            es, si existen cargos parecidos ni qué hechos la respaldan.
          </p>
        </div>
        <ChevronRight aria-hidden="true" />
        <div>
          <span className="guide-label">Después</span>
          <h3>Solicitud recibida</h3>
          <p>
            Una transacción elegida, un relato confirmado, un identificador
            persistente y un historial que la vista de revisor del mismo sandbox
            puede consultar.
          </p>
        </div>
      </div>
      <div className="guide-grid three">
        <article>
          <ShieldCheck />
          <h3>El cliente decide</h3>
          <p>
            Selecciona el movimiento, el motivo y el texto que autoriza
            registrar. Una predicción no sustituye su confirmación.
          </p>
        </article>
        <article>
          <Database />
          <h3>El servidor comprueba</h3>
          <p>
            Identidad, titularidad, estado de la fuente, consentimiento y
            repetición del envío se validan antes de guardar.
          </p>
        </article>
        <article>
          <BookOpen />
          <h3>El revisor recibe contexto</h3>
          <p>
            Ve los hechos de la fuente, las afirmaciones del cliente y las
            preguntas pendientes en campos separados.
          </p>
        </article>
      </div>
      <Note kind="fact">
        La aplicación tiene interfaz ES/PT, dos personas ficticias, doce
        transacciones, casos persistidos, revisión y auditoría. La versión
        funcional V3 fue desplegada con CI aprobado; esta guía explica ese
        código.
      </Note>
      <h3>La promesa exacta</h3>
      <p>
        Si la compra está registrada (<code>Approved</code>) y el motivo
        confirmado es «cargo no reconocido», se recibe una disputa para
        análisis. Otros motivos o estados generan una solicitud de soporte.
        Registrar cualquiera de ellas no confirma fraude ni concede un
        reembolso.
      </p>
      <Note kind="limit">
        No hay integración con un banco real, movimiento de dinero, bloqueo de
        tarjetas ni decisión crediticia. «Aprobado» en la transacción describe
        su estado de origen; no significa «reclamo aprobado».
      </Note>
      <h3>Para qué sirve cada capa</h3>
      <ol className="guide-reading-list">
        <li>
          <strong>Producto:</strong> convertir una conversación ambigua en una
          solicitud correcta.
        </li>
        <li>
          <strong>Datos:</strong> saber qué información podemos usar y cuál
          debemos rechazar.
        </li>
        <li>
          <strong>IA:</strong> sugerir la intención de un mensaje, con errores
          visibles.
        </li>
        <li>
          <strong>Software:</strong> conservar el caso correcto y resistir
          reintentos y sesiones inválidas.
        </li>
        <li>
          <strong>Evaluación:</strong> distinguir lo que probamos de lo que
          todavía desconocemos.
        </li>
      </ol>
      <Source path="README.md" label="Alcance y estado de la implementación" />
    </Section>
  );
}

const choices = [
  {
    title: "Disputas: recepción nueva",
    verdict: "Elegida",
    reason:
      "Podemos comprobar una compra, recoger la declaración actual y verificar que se guardó un caso. El resultado es concreto y observable.",
    evidence:
      "Transacción, propietario, moneda, importe, fecha y estado; comercio cuando existe.",
    cost: "Hay que desambiguar cargos y separar declaración de evidencia. No se reconstruyen quejas históricas ni se adjudica fraude.",
  },
  {
    title: "Información y elegibilidad de crédito",
    verdict: "Descartada para este equipo",
    reason:
      "Era viable como orientación bajo una política sintética explícita, pero requería añadir reglas de producto que el dataset no nos daba de forma suficiente.",
    evidence:
      "Perfil, ingreso estimado y score no bastan para validar riesgo de impago ni una decisión económica.",
    cost: "Un motor de reglas inventadas puede evaluarse contra esas mismas reglas, pero eso no valida que sean una buena política bancaria.",
  },
  {
    title: "Reconstruir o resolver disputas antiguas",
    verdict: "Descartada por evidencia insuficiente",
    reason:
      "Las relaciones entre queja, producto e interacción no permiten construir expedientes históricos fiables en la muestra inspeccionada.",
    evidence:
      "448 relaciones queja→producto no nulas tenían producto existente, pero el propietario no coincidía; origin_interaction_id estaba vacío en las 700 quejas.",
    cost: "Unir solo por un ID existente daría una apariencia de trazabilidad mientras asocia evidencia de otra persona.",
  },
];
function Decisions() {
  const [choice, setChoice] = useState(0);
  const current = choices[choice];
  return (
    <Section
      eyebrow="02 / La estrategia"
      title="Elegimos una acción que podemos demostrar."
      intro="La decisión no fue que las disputas fueran fáciles, sino que una recepción nueva permitía un resultado evaluable con menos supuestos financieros que crédito."
    >
      <div
        className="guide-segment"
        role="group"
        aria-label="Comparar alternativas"
      >
        {choices.map((c, i) => (
          <button
            key={c.title}
            aria-pressed={choice === i}
            onClick={() => setChoice(i)}
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="guide-selection" aria-live="polite">
        <span className="guide-label">{current.verdict}</span>
        <h3>{current.title}</h3>
        <p>{current.reason}</p>
        <dl>
          <dt>Datos que la sostienen</dt>
          <dd>{current.evidence}</dd>
          <dt>Coste o riesgo principal</dt>
          <dd>{current.cost}</dd>
        </dl>
      </div>
      <h3>Cómo llegamos aquí</h3>
      <p>
        La investigación comenzó comparando consultas y pagos, tarjetas,
        disputas y crédito. La recomendación inicial más conservadora fue pagos.
        Después acotaste la elección a disputas o crédito. Corregimos entonces
        una distinción: unas quejas históricas defectuosas impiden reconstruir
        esos expedientes, pero no impiden recibir una solicitud nueva sobre una
        compra verificable.
      </p>
      <div className="guide-grid two">
        <article>
          <h3>Lo que favorece al proyecto</h3>
          <p>
            En una demo corta se puede ver una ambigüedad, una confirmación, una
            escritura real y su recuperación. La seguridad y la ingeniería de
            datos quedan visibles en el mismo flujo.
          </p>
        </article>
        <article>
          <h3>Lo que puede restarle fuerza</h3>
          <p>
            Puede parecer un formulario si no se explica el valor de localizar
            el cargo, conservar evidencia y evitar errores. La IA actual
            orienta; su aporte autónomo es deliberadamente limitado.
          </p>
        </article>
      </div>
      <Note title="Criterio, no predicción de ganar">
        La elección busca un resultado funcional y defendible. No tenemos una
        base para asignar probabilidades de ganar ni para asegurar cómo lo
        puntuarán los jueces.
      </Note>
      <Detail title="Rúbrica y requisitos: qué conocemos">
        <p>
          En la revisión oficial del 28 de septiembre se localizaron dimensiones
          cualitativas de solución funcional, razonamiento/documentación, AI
          engineering, data engineering, ML y análisis; no pesos numéricos ni un
          paquete de casos privados. Los pesos usados en la estrategia inicial
          eran provisionales, no oficiales.
        </p>
        <p>
          También se documentaron un único flujo, español y portugués, baseline
          y evaluación reservada, manejo de ambigüedad/fallos y entrega
          reproducible. El experimento de desarrollo actual no acredita el
          cumplimiento de esa evaluación. La grabación solo se revisó
          parcialmente. Estas son observaciones de ese corte; no una garantía de
          que no existan aclaraciones posteriores.
        </p>
      </Detail>
      <Source
        path="data-pipeline/data-card.md"
        label="Evidencia de datos que condicionó la decisión"
      />
    </Section>
  );
}

const chapters = [
  {
    id: "proposito",
    title: "El propósito",
    subtitle: "Qué resuelve y qué promete",
    icon: BookOpen,
    render: Overview,
  },
  {
    id: "decision",
    title: "La decisión",
    subtitle: "Disputas frente a crédito",
    icon: GitBranch,
    render: Decisions,
  },
  {
    id: "datos",
    title: "Los datos",
    subtitle: "Tres fuentes, tres propósitos",
    icon: Database,
    render: DataChapter,
  },
  {
    id: "flujo",
    title: "Un caso completo",
    subtitle: "Recorre nueve etapas",
    icon: GitBranch,
    render: WorkflowChapter,
  },
  {
    id: "arquitectura",
    title: "La arquitectura",
    subtitle: "Responsabilidad de cada pieza",
    icon: Layers3,
    render: ArchitectureChapter,
  },
  {
    id: "ia",
    title: "Cómo funciona la IA",
    subtitle: "Modelo, búsqueda y límites",
    icon: Code2,
    render: ModelChapter,
  },
  {
    id: "evaluacion",
    title: "Las pruebas",
    subtitle: "Resultados y denominadores",
    icon: FlaskConical,
    render: EvaluationChapter,
  },
  {
    id: "seguridad",
    title: "Seguridad y fallos",
    subtitle: "Explora siete escenarios",
    icon: ShieldCheck,
    render: SecurityChapter,
  },
  {
    id: "proceso",
    title: "Cómo se construyó",
    subtitle: "Iteraciones y compromisos",
    icon: Code2,
    render: BuildChapter,
  },
  {
    id: "entrega",
    title: "Reproducir y terminar",
    subtitle: "Estado, roles y próximos pasos",
    icon: Check,
    render: DeliveryChapter,
  },
  {
    id: "fuentes",
    title: "Fuentes y glosario",
    subtitle: "Verifica y profundiza",
    icon: FileText,
    render: SourcesChapter,
  },
];

export default function ProjectGuide() {
  const [chapter, setChapter] = useState(0);
  const [continuous, setContinuous] = useState(false);
  const heading = useRef<HTMLDivElement>(null);
  function go(index: number) {
    setChapter(index);
    setContinuous(false);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  const Current = chapters[chapter].render;
  return (
    <div id="reclama-guide" lang="es">
      <a className="guide-skip" href="#guide-content">
        Saltar al contenido
      </a>
      <header className="guide-header">
        <Link className="guide-brand" href="/">
          reclama<span>.</span>
        </Link>
        <span className="guide-header-caption">Cuaderno del proyecto</span>
        <Link className="guide-demo-link" href="/">
          Abrir la aplicación
        </Link>
      </header>
      <div className="guide-layout">
        <aside className="guide-sidebar">
          <p className="guide-eyebrow">RECLAMA, POR DENTRO</p>
          <h1>Entender cada decisión.</h1>
          <p>
            Del problema al despliegue: una guía para Roberto, Jorge y Daniel.
          </p>
          <nav aria-label="Capítulos de la guía">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => go(i)}
                aria-current={!continuous && chapter === i ? "step" : undefined}
              >
                <span className="guide-chapter-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.subtitle}</small>
                </span>
                {!continuous && chapter === i && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>
          <button
            className="guide-read-all"
            aria-pressed={continuous}
            onClick={() => setContinuous(!continuous)}
          >
            {continuous ? "Volver a capítulos" : "Leer todo de corrido"}
          </button>
          <div className="guide-cut">
            <span>Lectura del código V3</span>
            <strong>29 sep 2026 · c0d9fe6</strong>
            <p>
              Hechos observados, razones de diseño y límites identificados por
              separado.
            </p>
          </div>
        </aside>
        <main id="guide-content" className="guide-main">
          <div
            className="guide-main-top"
            tabIndex={-1}
            ref={heading}
            role="group"
            aria-label={
              continuous ? "Todos los capítulos" : chapters[chapter].title
            }
          >
            <span>
              {continuous
                ? "Todos los capítulos"
                : `${String(chapter + 1).padStart(2, "0")} / ${chapters.length}`}
            </span>
            <span className="guide-private">
              <ShieldCheck size={14} /> Guía del equipo · acceso privado
            </span>
          </div>
          {continuous ? (
            chapters.map((c) => <c.render key={c.id} />)
          ) : (
            <Current />
          )}
          {!continuous && (
            <footer className="guide-pagination">
              <button disabled={chapter === 0} onClick={() => go(chapter - 1)}>
                Anterior
              </button>
              <span>{chapters[chapter].title}</span>
              <button
                disabled={chapter === chapters.length - 1}
                onClick={() => go(chapter + 1)}
              >
                Siguiente capítulo
              </button>
            </footer>
          )}
          <footer className="guide-footer">
            Las simulaciones de esta guía son educativas: no crean casos ni
            llaman a un banco.{" "}
            <a href={REPO} target="_blank" rel="noreferrer">
              Repositorio privado
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
