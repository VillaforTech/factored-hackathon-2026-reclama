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
      eyebrow="01 / Purpose"
      title="Receiving a dispute correctly is a complete problem."
      intro="Reclama turns an unrecognized charge into a verifiable case for human review. That is the outcome we build and measure."
    >
      <div className="guide-contrast">
        <div>
          <span className="guide-label"> Before </span>
          <h3> “I did not make this purchase” </h3>
          <p>
            {" "}
            The customer brings a statement. We still need to identify the
            transaction, check similar charges and establish the supporting
            facts.{" "}
          </p>
        </div>
        <ChevronRight aria-hidden="true" />
        <div>
          <span className="guide-label"> After </span>
          <h3> Request received </h3>
          <p>
            {" "}
            A selected transaction, a confirmed statement, a persistent
            identifier and a history available to the reviewer in the same
            sandbox.{" "}
          </p>
        </div>
      </div>
      <div className="guide-grid three">
        <article>
          <ShieldCheck />
          <h3> The customer decides </h3>
          <p>
            {" "}
            They select the transaction, reason and text they authorize us to
            record. A prediction cannot replace confirmation.{" "}
          </p>
        </article>
        <article>
          <Database />
          <h3> The server checks </h3>
          <p>
            {" "}
            Identity, ownership, source state, consent and repeated submissions
            are checked before saving.{" "}
          </p>
        </article>
        <article>
          <BookOpen />
          <h3> The reviewer receives context </h3>
          <p>
            {" "}
            Source facts, customer statements and open questions appear in
            separate fields.{" "}
          </p>
        </article>
      </div>
      <Note kind="fact">
        {" "}
        The app has an ES/PT interface, two fictional personas, twelve
        transactions, persisted cases, review and audit. Hosted V6 remains at
        source 3ae216e; this English guide is a local correction awaiting
        integration and deployment.{" "}
      </Note>
      <h3> The exact promise </h3>
      <p>
        {" "}
        If the purchase is recorded ( <code>Approved</code> ) and the confirmed
        reason is “unrecognized charge”, a dispute intake is received for
        analysis. Other reasons or states create a support request. Neither
        outcome confirms fraud or grants a refund.{" "}
      </p>
      <Note kind="limit">
        {" "}
        There is no real bank integration, money movement, card blocking or
        credit decision. “Approved” describes the source transaction state; it
        does not mean “dispute approved”.{" "}
      </Note>
      <h3> What each layer does </h3>
      <ol className="guide-reading-list">
        <li>
          <strong> Product: </strong> turn an ambiguous conversation into a
          correctly scoped request.{" "}
        </li>
        <li>
          <strong> Data: </strong> identify information we can use and
          information we must reject.{" "}
        </li>
        <li>
          <strong> AI: </strong> suggest message intent while exposing
          errors.{" "}
        </li>
        <li>
          <strong> Software: </strong> preserve the correct case and withstand
          retries and invalid sessions.{" "}
        </li>
        <li>
          <strong> Evaluation: </strong> separate demonstrated behavior from
          what remains unknown.{" "}
        </li>
      </ol>
      <Source path="README.md" label="Implementation scope and status" />
    </Section>
  );
}

const choices = [
  {
    title: "Disputes: new intake",
    verdict: "Selected",
    reason:
      "We can verify a purchase, collect the current statement and confirm that a case was saved. The result is concrete and observable.",
    evidence:
      "Transaction, owner, currency, amount, date and state; merchant when available.",
    cost: "Charges must be disambiguated and statements separated from evidence. We do not reconstruct historical complaints or adjudicate fraud.",
  },
  {
    title: "Credit information and eligibility",
    verdict: "Outside this team's scope",
    reason:
      "Guidance under an explicit synthetic policy was feasible, but required additional product rules not sufficiently supported by the dataset.",
    evidence:
      "Profile, estimated income and score do not validate default risk or a financial decision.",
    cost: "An invented rule engine can be tested against its own rules; that does not establish that they are good banking policy.",
  },
  {
    title: "Reconstructing or resolving old disputes",
    verdict: "Insufficient evidence",
    reason:
      "Complaint, product and interaction relationships do not support reliable historical case files in the inspected sample.",
    evidence:
      "All 448 non-null complaint-to-product links pointed to existing products but had mismatched owners; origin_interaction_id was empty in all 700 complaints.",
    cost: "Joining on an existing ID alone would suggest traceability while attaching another person's evidence.",
  },
];
function Decisions() {
  const [choice, setChoice] = useState(0);
  const current = choices[choice];
  return (
    <Section
      eyebrow="02 / Strategy"
      title="We chose an action we can demonstrate."
      intro="New intake provided an evaluable outcome with fewer financial assumptions than credit. This did not make disputes inherently easy."
    >
      <div
        className="guide-segment"
        role="group"
        aria-label="Compare alternatives"
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
          <dt> Supporting data </dt>
          <dd>{current.evidence}</dd>
          <dt> Main cost or risk </dt>
          <dd>{current.cost}</dd>
        </dl>
      </div>
      <h3> How we reached this decision </h3>
      <p>
        {" "}
        Research compared account inquiries and payments, cards, disputes and
        credit. The first conservative recommendation was payments; the scope
        later narrowed to disputes or credit. Unreliable historical complaints
        prevent reconstructing those files, but do not prevent a new request
        about a verifiable purchase.{" "}
      </p>
      <div className="guide-grid two">
        <article>
          <h3> What supports the project </h3>
          <p>
            {" "}
            A short demo can show ambiguity, confirmation, a real local write
            and recovery. Security and data engineering become visible in the
            same workflow.{" "}
          </p>
        </article>
        <article>
          <h3> What could weaken it </h3>
          <p>
            {" "}
            It can look like a form unless we explain the value of finding the
            charge, retaining evidence and avoiding mistakes. The current AI
            advises; its autonomy is deliberately limited.{" "}
          </p>
        </article>
      </div>
      <Note title="A defensible choice, without a prediction of winning">
        {" "}
        The choice targets a functional, defensible result. We have no basis for
        assigning odds of winning or predicting the judges&apos; scores.{" "}
      </Note>
      <Detail title="Rubric and requirements: what we know">
        <p>
          {" "}
          The 28 September review found qualitative dimensions covering
          functionality, reasoning/documentation, AI engineering, data
          engineering, ML and analysis; no numeric weights or private test
          package. Weights in the initial strategy were provisional, not
          official.{" "}
        </p>
        <p>
          {" "}
          The challenge calls for a complete workflow, Spanish and Portuguese, a
          baseline and reserved evaluation, ambiguity/failure handling and
          reproducibility. Our authored development experiment does not
          establish evaluation compliance. The organizer&apos;s 2 October
          clarification requires deliverables in English; customer interactions
          remain ES/PT. Consult the current evidence matrix for later
          corrections.{" "}
        </p>
      </Detail>
      <Source
        path="data-pipeline/data-card.md"
        label="Data evidence behind the decision"
      />
    </Section>
  );
}

const chapters = [
  {
    id: "proposito",
    title: "Purpose",
    subtitle: "The problem and exact promise",
    icon: BookOpen,
    render: Overview,
  },
  {
    id: "decision",
    title: "The decision",
    subtitle: "Disputes versus credit",
    icon: GitBranch,
    render: Decisions,
  },
  {
    id: "datos",
    title: "The data",
    subtitle: "Three sources, three purposes",
    icon: Database,
    render: DataChapter,
  },
  {
    id: "flujo",
    title: "A complete case",
    subtitle: "Explore nine stages",
    icon: GitBranch,
    render: WorkflowChapter,
  },
  {
    id: "arquitectura",
    title: "Architecture",
    subtitle: "Each component's responsibility",
    icon: Layers3,
    render: ArchitectureChapter,
  },
  {
    id: "ia",
    title: "How the AI works",
    subtitle: "Model, search and limits",
    icon: Code2,
    render: ModelChapter,
  },
  {
    id: "evaluacion",
    title: "Tests and evidence",
    subtitle: "Results and denominators",
    icon: FlaskConical,
    render: EvaluationChapter,
  },
  {
    id: "seguridad",
    title: "Security and failures",
    subtitle: "Explore seven scenarios",
    icon: ShieldCheck,
    render: SecurityChapter,
  },
  {
    id: "proceso",
    title: "How it was built",
    subtitle: "Iterations and tradeoffs",
    icon: Code2,
    render: BuildChapter,
  },
  {
    id: "entrega",
    title: "Reproduce and finish",
    subtitle: "Status, roles and next steps",
    icon: Check,
    render: DeliveryChapter,
  },
  {
    id: "fuentes",
    title: "Sources and glossary",
    subtitle: "Verify and explore further",
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
    <div id="reclama-guide" lang="en">
      <a className="guide-skip" href="#guide-content">
        {" "}
        Skip to content{" "}
      </a>
      <header className="guide-header">
        <Link className="guide-brand" href="/">
          reclama<span>.</span>
        </Link>
        <span className="guide-header-caption"> Project notebook </span>
        <Link className="guide-demo-link" href="/">
          {" "}
          Open the app{" "}
        </Link>
      </header>
      <div className="guide-layout">
        <aside className="guide-sidebar">
          <p className="guide-eyebrow"> INSIDE RECLAMA </p>
          <h1> Understand each decision. </h1>
          <p>
            {" "}
            From problem to deployment: a guide for the team and reviewers.{" "}
          </p>
          <nav aria-label="Guide chapters">
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
            {continuous ? "Return to chapters" : "Read all chapters"}
          </button>
          <div className="guide-cut">
            <span> English review edition </span>
            <strong> 2 Oct 2026 · local correction </strong>
            <p>
              {" "}
              Observed facts, design reasons and known limits are distinguished
              throughout.{" "}
            </p>
          </div>
        </aside>
        <main id="guide-content" className="guide-main">
          <div
            className="guide-main-top"
            tabIndex={-1}
            ref={heading}
            role="group"
            aria-label={continuous ? "All chapters" : chapters[chapter].title}
          >
            <span>
              {continuous
                ? "All chapters"
                : `${String(chapter + 1).padStart(2, "0")} / ${chapters.length}`}
            </span>
            <span className="guide-private">
              <ShieldCheck size={14} /> Team guide · restricted access{" "}
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
                {" "}
                Previous{" "}
              </button>
              <span>{chapters[chapter].title}</span>
              <button
                disabled={chapter === chapters.length - 1}
                onClick={() => go(chapter + 1)}
              >
                {" "}
                Next chapter{" "}
              </button>
            </footer>
          )}
          <footer className="guide-footer">
            {" "}
            Guide simulations are educational: they create no cases and call no
            bank.{" "}
            <a href={REPO} target="_blank" rel="noreferrer">
              {" "}
              Private repository{" "}
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
