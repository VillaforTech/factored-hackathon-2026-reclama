"use client";
import { useState } from "react";
import { ShieldCheck, Check, CircleHelp } from "lucide-react";
import { REPO, Source, Note, Section, Detail } from "./guide-ui";

export function DataChapter() {
  const [join, setJoin] = useState<string | null>(null);
  return (
    <Section
      eyebrow="03 / Source evidence"
      title="Three datasets. Three different purposes."
      intro="The AI is not trained on the transactions shown in the app. Historical complaints are not converted into demo cases."
    >
      <div className="guide-grid three">
        <article>
          <span className="guide-label"> Research </span>
          <h3> Official dataset </h3>
          <p>
            {" "}
            Used to profile relationships, identify problems and decide which
            information could support a workflow.{" "}
          </p>
        </article>
        <article>
          <span className="guide-label"> Product </span>
          <h3> Invented fixtures </h3>
          <p>
            {" "}
            Ana, Lucas, three cards and twelve transactions created from scratch
            make the demo repeatable without distributing original rows.{" "}
          </p>
        </article>
        <article>
          <span className="guide-label"> Learning </span>
          <h3> ES/PT conversations </h3>
          <p>
            {" "}
            Separate synthetic messages for training, selection and intent
            measurement. They are not real bank conversations.{" "}
          </p>
        </article>
      </div>
      <h3> How we investigated </h3>
      <p>
        {" "}
        We inspected 50 files: complete dimensions of 150,000 customers and
        400,000 products, plus twelve time cuts of transactions, complaints,
        interactions and transcripts. We also examined the card-product subset.
        We did not process the roughly 19 million rows in the full dataset.{" "}
      </p>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Dataset observations"
      >
        <table>
          <caption>
            {" "}
            Observations from our sample, not the full population{" "}
          </caption>
          <thead>
            <tr>
              <th> Observation </th>
              <th> Consequence </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "48,810 transactions with consistent owner and currency",
                "The relationship can be checked before using a purchase.",
              ],
              [
                "10,903 approved card purchases; 531 without a merchant",
                "An unknown merchant remains unknown.",
              ],
              [
                "448/448 complaint-to-product links with mismatched owners",
                "Quarantine the relationship: existence does not establish ownership.",
              ],
              [
                "1,748 transcripts; 42 distinct customer texts, all containing “saldo” (balance)",
                "They do not support a varied dispute corpus or provide observed Portuguese examples.",
              ],
              [
                "12,268 processing dates earlier than the event day",
                "The load date is not interpreted as evidence of temporal availability.",
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
        {" "}
        Time cuts are not a random sample and do not estimate banking
        prevalence. Anomalies invalidate a join or interpretation; they do not
        prove an entire complaint false. Static dimensions alone cannot
        reconstruct historical ownership.{" "}
      </Note>
      <div className="guide-lab">
        <span className="guide-label">
          {" "}
          Judgment exercise · invented example{" "}
        </span>
        <h3> The product exists. Is the join valid? </h3>
        <div className="guide-code-pair">
          <code> complaint: customer_A → product_7 </code>
          <code> product_7 → owner customer_B </code>
        </div>
        <div className="guide-segment">
          <button aria-pressed={join === "id"} onClick={() => setJoin("id")}>
            {" "}
            Yes: the ID exists{" "}
          </button>
          <button
            aria-pressed={join === "owner"}
            onClick={() => setJoin("owner")}
          >
            {" "}
            No: the owner differs{" "}
          </button>
        </div>
        {join && (
          <p
            className={join === "owner" ? "guide-answer good" : "guide-answer"}
            role="status"
          >
            {join === "owner"
              ? "Correct. The foreign key passes, but ownership fails. This evidence cannot enter customer_A's case."
              : "Finding the product only establishes existence. We still need to verify that it belongs to the complainant."}
          </p>
        )}
      </div>
      <h3> Why we invented twelve transactions </h3>
      <ul>
        <li>
          {" "}
          Two Luna Digital purchases for USD 84.90, seven minutes apart, force
          disambiguation.{" "}
        </li>
        <li>
          {" "}
          Approved, Pending, Reversed and Declined require different state
          handling.{" "}
        </li>
        <li>
          {" "}
          Missing merchants and USD/COP/ARS currencies require fidelity to the
          source. Language does not determine currency.{" "}
        </li>
        <li>
          {" "}
          A fixed 17 June 2026 snapshot, sourceVersion and sourceRef identify
          the evidence shown.{" "}
        </li>
      </ul>
      <Detail title="Money, provenance and privacy">
        <p>
          {" "}
          USD 84.90 is stored as <code>amountMinor: 8490</code> and{" "}
          <code>currency: USD</code> . Values are integer minor units; money is
          not stored as approximate decimals and currencies are not converted
          automatically.{" "}
        </p>
        <p>
          {" "}
          No fixture row, identifier, amount or merchant was copied from the
          originals. A synthetic dataset was not treated as automatic permission
          to redistribute it. Private CSVs and the access document stay outside
          the repository.{" "}
        </p>
      </Detail>
      <Detail title="Reproducible data process">
        <p>
          {" "}
          Authorized inventory → time sample → types and schema → existence,
          owner and currency → anomaly profile → quarantine invalid
          relationships → aggregate report. The later fixtures test those
          contracts but do not represent real users.{" "}
        </p>
      </Detail>
      <Source path="data-pipeline/data-card.md" label="Data card" />
      <Source path="data-pipeline/report.json" label="Aggregate profile" />
    </Section>
  );
}

const flow = [
  [
    "Sign in",
    "Platform account",
    "Sites/ChatGPT supplies the real identity. The request body cannot choose the owner.",
    "Without identity: SIGN_IN_REQUIRED.",
  ],
  [
    "Open sandbox",
    "30-minute session",
    "Choose Ana or Lucas and a demo role. The server returns an opaque cookie.",
    "The fictional persona and real account are different.",
  ],
  [
    "Find the purchase",
    "Search + hypothesis",
    "The message produces advisory intent and candidates by amount, merchant, currency, card and date.",
    "Even a single candidate is never selected automatically.",
  ],
  [
    "Select and document",
    "Customer decision",
    "The customer selects the transaction and reason, then writes a statement or copies their message verbatim.",
    "A statement does not become a verified fact.",
  ],
  [
    "Prepare",
    "10-minute draft",
    "The server stores the summary, purchase fingerprint and session-bound token. Corrections require a new draft.",
    "No submitted case exists yet.",
  ],
  [
    "Confirm",
    "Specific consent",
    "The customer reviews facts, statement and open questions; confirms the draft and token with an idempotency key.",
    "No editable amount replaces the source value.",
  ],
  [
    "Save and verify",
    "Persistent case",
    "Session, ownership, expiry, source and replay are checked again. The case and audit are inserted, then the saved record is read back.",
    "The receipt is returned after persistence.",
  ],
  [
    "Review",
    "Human handoff",
    "A sandbox reviewer adds a note and marks “under review” or “more information needed” using version checks.",
    "No status confirms fraud or grants a refund.",
  ],
  [
    "Recover",
    "Continuity",
    "Reopening a run retrieves its cases and events. A new run preserves previous runs.",
    "In-memory chat is not a complete persistent history.",
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
      eyebrow="04 / Workflow"
      title="Follow a request from start to finish."
      intro="Advance or select a step. Each combines a human decision with a concrete system check."
    >
      <div className="guide-flowsteps" role="group" aria-label="Request stages">
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
          {" "}
          Step {step + 1} · {c[1]}
        </span>
        <h3>{c[0]}</h3>
        <p>{c[2]}</p>
        <div className="guide-flow-rule">
          <ShieldCheck size={20} />
          <span>{c[3]}</span>
        </div>
        <div className="guide-inline-actions">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}>
            {" "}
            Previous step{" "}
          </button>
          <button disabled={step === 8} onClick={() => setStep(step + 1)}>
            {" "}
            Next step{" "}
          </button>
        </div>
      </div>
      <div className="guide-lab">
        <span className="guide-label"> Prototype rule · no data saved </span>
        <h3> Which kind of case is received? </h3>
        <div className="guide-controls">
          <label>
            {" "}
            Transaction state{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["Approved", "Pending", "Reversed", "Declined"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            {" "}
            Confirmed reason{" "}
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="unrecognized"> Unrecognized charge </option>
              <option value="duplicate"> Possible duplicate </option>
              <option value="merchant_issue"> Merchant issue </option>
              <option value="other"> Review needed </option>
            </select>
          </label>
        </div>
        <div className="guide-lab-result" role="status">
          <span className="guide-label"> Simulated result </span>
          <strong>{dispute ? "Dispute intake" : "Support request"}</strong>
          <p>
            {dispute
              ? "The purchase is recorded and the customer confirms they do not recognize it. A request is received for human review."
              : "This combination goes to support. The transaction state does not change and no dispute is adjudicated."}
          </p>
          <code>{dispute ? "dispute_intake" : "support_handoff"}</code>
        </div>
      </div>
      <Note>
        {" "}
        This branch is an explicit sandbox rule, not verified banking policy, a
        legal deadline or a card-network rule.{" "}
      </Note>
      <Detail title="What is saved and what is not">
        <p>
          {" "}
          Sessions, runs, drafts, cases, audit and instrumented metrics are
          stored. The confirmed statement and a copy of the facts remain in the
          case. Chat messages live in React: reloading does not restore the full
          conversation. Switching ES/PT preserves the form during the
          session.{" "}
        </p>
      </Detail>
      <Source path="lib/server/domain.ts" label="Intake versus support rule" />
      <Source path="lib/server/api.ts" label="Operation lifecycle" />
    </Section>
  );
}

const modules = [
  [
    "Interface",
    "app/page.tsx",
    "React + TypeScript",
    "Maintains conversation, selection, form and review. Displays facts and allegations separately; does not decide permissions.",
    "One application shares ES/PT operation logic and makes both sides demonstrable.",
  ],
  [
    "Identity and session",
    "app/chatgpt-auth.ts",
    "Sites + application session",
    "The platform supplies the real account. The server derives the owner's workspace and binds the cookie to persona, role, run and expiry.",
    "Reuses Sites access; another host needs its own verified identity integration.",
  ],
  [
    "API and contracts",
    "lib/server/api.ts",
    "Cloudflare Worker + Zod",
    "Validates strict JSON, origin, size, session, role, owner, consent and version. Uses parameterized SQL.",
    "Critical rules are checked even if someone changes the interface.",
  ],
  [
    "Intent model",
    "lib/server/model.ts",
    "TF-IDF + logistic regression",
    "Suggests one of eight intents; neither authorizes operations nor estimates fraud risk.",
    "Inference runs inside the Worker without an external model provider at runtime.",
  ],
  [
    "Contextual assistant",
    "lib/assistant.ts",
    "Deterministic search",
    "Matches amount, currency, merchant, card and date against owned transactions. Explains ambiguity, absence and conflicts.",
    "Verifiable candidates remain separate from the learned label and customer selection.",
  ],
  [
    "Demo source",
    "lib/data/demo.json",
    "Invented snapshot",
    "Two personas, three cards and twelve transactions with cutoff, version and references; these are not live data.",
    "Repeatable scenarios without publishing original records.",
  ],
  [
    "Persistence and audit",
    "db/schema.ts",
    "D1 / SQLite",
    "Stores drafts and cases. Unique indexes prevent duplicates; triggers record changes within the same operation.",
    "A small, observable relational database; not a banking ledger or cryptographic audit.",
  ],
];
const endpoints = [
  ["GET /api/runs", "Account runs"],
  ["POST /api/runs", "New run and session; at most 50 additional runs"],
  ["POST /api/session", "Open persona/role in an owned run"],
  ["GET /api/session", "Current context and snapshot"],
  ["PATCH /api/session", "Change language only"],
  ["GET /api/transactions", "Owned transactions; customer role"],
  ["POST /api/message", "Hypothesis and candidates"],
  ["POST /api/drafts", "Prepare validated summary"],
  ["POST /api/cases", "Confirm and persist"],
  ["GET /api/cases", "Authorized cases"],
  ["GET /api/cases/:id", "Authorized detail and history"],
  ["PATCH /api/cases/:id", "Review with note and version"],
  ["POST /api/demo/fault", "Simulated expiry or lost response"],
  ["GET /api/metrics", "Up to 200 instrumented operations in the run"],
];
export function ArchitectureChapter() {
  const [node, setNode] = useState(0);
  const m = modules[node];
  return (
    <Section
      eyebrow="05 / Architecture"
      title="AI proposes. The server controls. The database preserves."
      intro="Select a component to see its responsibility, limits and implementation."
    >
      <div className="guide-architecture">
        <div
          className="guide-architecture-map"
          role="group"
          aria-label="Reclama components"
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
          <span className="guide-label"> Responsibility </span>
          <h3>{m[0]}</h3>
          <p>{m[3]}</p>
          <h4> Why this design </h4>
          <p>{m[4]}</p>
          <Source path={m[1]} />
        </div>
      </div>
      <h3> Trust boundaries </h3>
      <div className="guide-pipeline">
        <span> Browser </span>
        <b>→</b>
        <span> Identity and API </span>
        <b>→</b>
        <span> Contracts and consent </span>
        <b>→</b>
        <span> D1 and read-after-write </span>
      </div>
      <p>
        {" "}
        When creating or updating a case, the server obtains amounts and owners
        from the source, and the authorized role from the session. Predictions
        never grant permissions. Sandbox sign-in allows choosing a fictional
        role, including reviewer, within the owner&apos;s workspace; it does not
        represent real bank authorization.{" "}
      </p>
      <Detail title="Inside the six tables">
        <div
          className="guide-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Persistence tables"
        >
          <table>
            <thead>
              <tr>
                <th> Table </th>
                <th> Responsibility </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["sessions", "Persona, role, language, expiry and demo fault."],
                ["demo_runs", "Run ownership and date."],
                ["drafts", "Summary, session, token and fact fingerprint."],
                [
                  "cases",
                  "Statement, evidence, state, version and current note.",
                ],
                ["audit", "Event, internal actor, version, state and date."],
                [
                  "attempts",
                  "Instrumented operation, result, latency and date.",
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
          {" "}
          Cards and purchases come from versioned fixtures. D1 preserves the
          work performed on them.{" "}
        </p>
      </Detail>
      <Detail title="Complete API map">
        <p>
          {" "}
          Every route requires platform identity. The workflow also requires a
          valid session; creating/listing runs and opening a session are
          exceptions to that second requirement.{" "}
        </p>
        <div
          className="guide-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="API operations"
        >
          <table>
            <thead>
              <tr>
                <th> Route </th>
                <th> Purpose </th>
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
      <Detail title="Why no microservices, queues or RAG">
        <p>
          {" "}
          The workflow fits one application and one relational database. More
          services would add coordination without meeting a demonstrated
          prototype need. We also lack a validated banking document corpus that
          would justify presenting RAG as a product capability. This is a scope
          decision, not a claim that those techniques lack value.{" "}
        </p>
      </Detail>
      <Note kind="limit">
        {" "}
        The reviewer role is selected within the same sandbox to rehearse both
        sides. It is not workforce authentication or real bank permission
        management.{" "}
      </Note>
      <Source path="db/schema.ts" label="Schema" />
      <Source
        path="drizzle/0000_misty_nightshade.sql"
        label="Indexes and triggers"
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
      eyebrow="06 / The learned component"
      title="What the AI does, exactly."
      intro="No LLM generates responses at runtime. A learned classifier operates separately from deterministic search and guidance."
    >
      <div className="guide-grid two">
        <article>
          <span className="guide-label"> Learned from examples </span>
          <h3> Message intent </h3>
          <p>
            {" "}
            TF-IDF converts text fragments into numbers. Logistic regression
            combines them to suggest one of eight classes.{" "}
          </p>
        </article>
        <article>
          <span className="guide-label"> Programmed and verifiable </span>
          <h3> Candidates and next step </h3>
          <p>
            {" "}
            The assistant compares clues such as “84,90 USD” against
            transactions. A score never grants permission or selects a
            charge.{" "}
          </p>
        </article>
      </div>
      <div className="guide-chips">
        {[
          "Unrecognized charge",
          "Possible duplicate",
          "Merchant issue",
          "Refund",
          "Lost card",
          "Account inquiry",
          "Credit inquiry",
          "Other / ambiguous",
        ].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <p>
        {" "}
        Classifying “refund” means the customer requests one. It establishes
        neither entitlement nor an available tool to issue it.{" "}
      </p>
      <h3> From text to hypothesis </h3>
      <ol className="guide-reading-list">
        <li>
          <strong> Normalize: </strong> Unicode, lowercase, remove accent marks
          and extract tokens.{" "}
        </li>
        <li>
          <strong> Split: </strong> sequences of three, four and five characters
          from each word, padded with spaces.{" "}
        </li>
        <li>
          <strong> Weight: </strong> TF-IDF weights features by training
          frequency and rarity; the vector is normalized.{" "}
        </li>
        <li>
          <strong> Classify: </strong> learned weights and intercepts produce
          scores; softmax compares classes.{" "}
        </li>
        <li>
          <strong> Apply policy: </strong> frozen thresholds determine
          acceptance. V2 accepts no prediction; explicit choice is
          required.{" "}
        </li>
      </ol>
      <div className="guide-lab">
        <span className="guide-label">
          {" "}
          Explore the extractor · not a prediction{" "}
        </span>
        <h3> What is a character n-gram? </h3>
        <label className="guide-input-label">
          {" "}
          Word or short phrase{" "}
          <input
            value={word}
            maxLength={50}
            onChange={(e) => setWord(e.target.value)}
            spellCheck={false}
          />
        </label>
        <div className="guide-segment" role="group" aria-label="Fragment size">
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              aria-pressed={size === n}
              onClick={() => setSize(n)}
            >
              {n} characters{" "}
            </button>
          ))}
        </div>
        <div className="guide-grams" aria-live="polite">
          {grams.slice(0, 42).map((g, i) => (
            <code key={`${i}-${g}`}>{g.replace(/ /g, "␣")}</code>
          ))}
        </div>
        <p className="guide-small">
          {grams.length} fragments; up to 42 shown. ␣ is a space. The actual
          model combines all three sizes and uses only its learned vocabulary.
          This explorer does not read weights or compute intent; text stays
          local and is neither stored nor transmitted.{" "}
        </p>
      </div>
      <Detail title="A little mathematics">
        <p>
          {" "}
          For a known feature: <code> x = (1 + ln(count)) × IDF </code> . Divide
          the vector by its L2 norm. Each class computes{" "}
          <code> z = intercept + sum(weight × x) </code> . Softmax compares
          these values. Probability calibration has not been established: this
          is not a “probability of fraud”.{" "}
        </p>
        <p>
          {" "}
          The exported JSON contains vocabulary, IDF, weights, intercepts and
          policy. JavaScript reproduces the Python calculation without
          retraining or recalculating IDF per message.{" "}
        </p>
      </Detail>
      <h3> From rules to V2 </h3>
      <div className="guide-timeline">
        <article>
          <span> Rules </span>
          <div>
            <h3> A substantive baseline </h3>
            <p>
              {" "}
              Weighted bilingual patterns, combined signals and explicit
              negation; not a trivial majority-class rule.{" "}
            </p>
          </div>
        </article>
        <article>
          <span>V1</span>
          <div>
            <h3> Words and bigrams </h3>
            <p>
              {" "}
              320 AI-authored messages: 192 training, 64 validation and 64 test.
              The original test scored 46/64 versus 43/64 for rules, without
              conclusive improvement. A policy revision after viewing aggregate
              results made this an exploratory experiment.{" "}
            </p>
          </div>
        </article>
        <article>
          <span>V2</span>
          <div>
            <h3> Characters and prior freezing </h3>
            <p>
              {" "}
              634 training messages and 128 validation messages. Nine
              candidates: word/char/hybrid with C=1/4/12. Character features,
              C=12 and 3,500 features won on validation macro-F1. Selection did
              not use the reserved development set, which was also
              AI-authored.{" "}
            </p>
          </div>
        </article>
      </div>
      <Detail title="Where an LLM was used during development">
        <p>
          {" "}
          Local Gemma2 9B generated 314 retained messages. These joined 192 V1
          training messages and 128 AI-written/curated messages. We logged 99
          rejected entries, including metadata entries, for structure, label,
          repetition or duplication issues.{" "}
        </p>
        <p>
          {" "}
          The LLM helped produce training data; it does not respond in
          production. Bank records were not sent to a generative provider. AI
          labels and Portuguese still lack human review; that review is an
          internal recommendation.{" "}
        </p>
      </Detail>
      <Note kind="limit" title="The gate failed and remains closed">
        {" "}
        Validation required ≥95% selective accuracy, at least eight accepted
        “unrecognized” examples and zero false acceptances of that class. No
        combination met all criteria. V2 always abstains: it shows top-1 as a
        hypothesis, never a confirmed reason.{" "}
      </Note>
      <Source
        path="ml/v2/model-card.md"
        label="V2 model card with corrected provenance"
      />
      <Source path="ml/v2/protocol.md" label="Frozen historical protocol" />
      <Source path="lib/assistant.ts" label="Deterministic component" />
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
      eyebrow="07 / Evaluation"
      title="Every result has a denominator and a limit."
      intro="Classification, write safety and browser experience are measured separately. A result does not automatically validate other layers."
    >
      <Note kind="limit" title="Independent validation is not established">
        {" "}
        The reserved set contains 256 AI-authored messages in 128 ES/PT
        families, without organizer records or human review. It is a development
        experiment, not an official or challenge-valid benchmark. Separate
        authors and frozen weights do not change its provenance.{" "}
      </Note>
      <Detail title="Historical development-experiment results">
        <h3> The same AI-authored texts for all three systems </h3>
        <div
          className="guide-segment"
          role="group"
          aria-label="Evaluated language"
        >
          {[
            ["all", "ES + PT"],
            ["es", "Spanish"],
            ["pt", "Portuguese"],
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
          {["Rules", "Model V1", "Model V2"].map((name, i) => (
            <div key={name} className="guide-bar-row">
              <div>
                <strong>{name}</strong>
                <span>
                  {scores[i]}/{n} ·{" "}
                  {((100 * scores[i]) / n).toLocaleString("en-US", {
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
          {" "}
          Top-1 accuracy: agreement between the highest-scoring label and an
          AI-authored reference. This is not independent validation,
          challenge-data performance or a percentage of disputes resolved.{" "}
        </p>
        <h3> Historical ES+PT comparison · 256 development messages </h3>
        <div className="guide-grid two">
          <article>
            <h4> V2 versus rules </h4>
            <p>
              {" "}
              +19.53 accuracy points; 95% family-bootstrap interval [11.72,
              27.34]. Macro-F1: 0.8310 versus 0.6752.{" "}
            </p>
          </article>
          <article>
            <h4> V2 versus V1 </h4>
            <p>
              {" "}
              +2.73 points; interval [−1.17, 6.64]. It includes zero:
              superiority over V1 is not conclusive.{" "}
            </p>
          </article>
        </div>
        <Note kind="limit" title="The average hides important errors">
          {" "}
          V2 recognizes only 9/32 “other” messages. Nine of 34 “unrecognized”
          suggestions are wrong. Top-1 cannot replace the user&apos;s choice.{" "}
        </Note>
      </Detail>
      <h3> Experiment controls and their limits </h3>
      <ol className="guide-reading-list">
        <li>
          <strong> Pairs together: </strong> the same ES/PT scenario stays in
          one partition.{" "}
        </li>
        <li>
          <strong> Validation for selection: </strong> configuration and
          thresholds are selected without the reserved development set, also
          AI-authored.{" "}
        </li>
        <li>
          <strong> Freeze: </strong> hashes fix the model, corpus, scripts and
          policy before opening the holdout.{" "}
        </li>
        <li>
          <strong> Separate author: </strong> another AI agent produced 256
          texts, 128 families and 32 messages per class; this is not human
          adjudication.{" "}
        </li>
        <li>
          <strong> Same inputs: </strong> rules, V1 and V2 see the same texts
          without labels or IDs.{" "}
        </li>
        <li>
          <strong> No retuning: </strong> if test errors influence an
          improvement, the comparison is no longer reserved. A new AI-authored
          set alone would not establish independent validation either.{" "}
        </li>
      </ol>
      <Detail title="Accuracy, precision, recall and macro-F1">
        <ul>
          <li>
            <strong> Accuracy: </strong> correct predictions divided by all
            examples.{" "}
          </li>
          <li>
            <strong> Precision: </strong> the fraction of a class&apos;s suggestions
            that are correct.{" "}
          </li>
          <li>
            <strong>Recall:</strong> the fraction of reference examples of that
            class that are found.{" "}
          </li>
          <li>
            <strong>Macro-F1:</strong> averages the precision/recall balance,
            giving every class equal weight.{" "}
          </li>
          <li>
            <strong> Family bootstrap: </strong> resamples complete bilingual
            scenarios because their translations are related.{" "}
          </li>
        </ul>
      </Detail>
      <Detail title="Always abstaining does not mean 100% safety">
        <p>
          {" "}
          Acceptance coverage is 0%. Selective accuracy is undefined because
          nothing is accepted. Top-1 can be measured as a hypothesis even though
          it has no authority to route an operation.{" "}
        </p>
      </Detail>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Software test results"
      >
        <table>
          <caption>
            {" "}
            Historical software evidence from the functional V3 commit{" "}
          </caption>
          <thead>
            <tr>
              <th> Test </th>
              <th> Result </th>
              <th> Coverage </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Original HTTP suite",
                "28/28",
                "Workflow and controls through the API.",
              ],
              [
                "Runs and language",
                "16/16",
                "Draft, recovery, retry and run isolation.",
              ],
              [
                "Stale context",
                "9/9",
                "Requests from a tab retaining previous context.",
              ],
              [
                "Deterministic assistant",
                "20/20",
                "Matching, ambiguity, ownership and guidance.",
              ],
              [
                "Python/JS V2 parity",
                "10/10",
                "Numeric port; does not validate labels.",
              ],
              [
                "Browser",
                "Observed walkthrough",
                "Creation, review, recovery and local mobile layout at 390px.",
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
        {" "}
        The entire experiment corpus was AI-authored and labeled. Fixture-based
        software tests do not validate model quality. Challenge-admissible
        independent evaluation and hosted two-account acceptance remain missing.
        Human ES/PT review is also recommended. Zero exact text overlaps
        establishes neither semantic independence nor banking
        representativeness.{" "}
      </Note>
      <h3> Latency and cost </h3>
      <p>
        {" "}
        Historical warm local model CPU p95: 0.082 ms, excluding network, JSON
        loading, startup, authentication, storage and UI. The 2 October local
        API sequences measured normal ES p50/p95 110.15/265.60 ms, ambiguous PT
        37.01/54.38 ms, and handoff PT 101.37/104.55 ms, with five attempts per
        scenario and 70 measured requests. Setup and user time are excluded;
        with n=5, p95 is the maximum. No external model API is called at
        runtime. Total hosting and operation cost is unknown.{" "}
      </p>
      <p className="guide-small">
        {" "}
        Experiment links preserve historical versions. Any historical
        “independent” terminology is superseded by the provenance correction;
        frozen files are not rewritten.{" "}
      </p>
      <Source
        path="docs/evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md"
        label="Provenance correction · 1 Oct 2026"
      />
      <Source
        path="ml/v2/test-report.json"
        label="Historical development experiment"
      />
      <Source path="docs/evidence/BROWSER_V3.md" label="Local acceptance" />
      <a
        className="guide-source"
        href={`${REPO}/actions/runs/36624297648`}
        target="_blank"
        rel="noreferrer"
      >
        {" "}
        Historical V3 CI{" "}
      </a>
    </Section>
  );
}

const failures = [
  [
    "Lost response",
    "503 SIMULATED_TIMEOUT",
    "The server saves the case, but the response is lost.",
    "Retry with the same key and draft.",
    "The original is returned without duplication.",
    "The key identifies an operation; it does not authenticate the user.",
  ],
  [
    "Another owner's case",
    "404 NOT_FOUND",
    "A customer queries another persona; any role queries another run or owner.",
    "The server scopes by owner and run; customers are also scoped by persona.",
    "Access is rejected. A reviewer can inspect both personas within their own run.",
    "Reviewer is a fictional role in the same sandbox. Local tests do not replace two real hosted accounts.",
  ],
  [
    "Expired session",
    "401 SESSION_EXPIRED",
    "The session is no longer valid.",
    "Clear data and controls, cancel requests and open another session.",
    "Saved cases can be recovered.",
    "A draft bound to the old session must be prepared again.",
  ],
  [
    "Another tab",
    "409 SESSION_CONTEXT_CHANGED",
    "Another tab changes the shared cookie while this tab retains stale context.",
    "Compare the expected context fingerprint and discard responses from an old generation.",
    "The current context must be recovered.",
    "The marker is optional for API clients and never replaces authorization.",
  ],
  [
    "Changed evidence",
    "SOURCE_CHANGED",
    "The transaction no longer matches the draft fingerprint.",
    "Reject confirmation of stale facts.",
    "Prepare and review a new summary.",
    "The demo source is static; the contract anticipates future changes.",
  ],
  [
    "Two reviewers",
    "409 VERSION_CONFLICT",
    "Both read v1; one updates to v2 before the other.",
    "The UPDATE requires the version originally read.",
    "The stale write is rejected to prevent silent overwriting.",
    "Notes are not merged; the audit does not retain every full note.",
  ],
  [
    "Sensitive text",
    "422 SENSITIVE_CONTENT",
    "The text contains PIN, password, email or full-card patterns.",
    "Reject before adding the accepted message to chat.",
    "Ask the user to remove sensitive information.",
    "Regex is not comprehensive leak prevention: use invented data only.",
  ],
];
export function SecurityChapter() {
  const [fault, setFault] = useState(0);
  const f = failures[fault];
  return (
    <Section
      eyebrow="08 / Controls and failures"
      title="What happens when the happy path breaks."
      intro="Select a scenario. Controls operate outside the model and have observable responses."
    >
      <div className="guide-segment" role="group" aria-label="Failure scenario">
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
            <strong> What happens: </strong> {f[2]}
          </li>
          <li>
            <strong> What we do: </strong> {f[3]}
          </li>
          <li>
            <strong> Result: </strong> {f[4]}
          </li>
        </ol>
        <p className="guide-small"> Limit: {f[5]}</p>
      </div>
      <h3> Idempotency in plain language </h3>
      <p>
        {" "}
        Repeating the same operation with the same key and content returns the
        original result. Reusing the key with different content produces{" "}
        <code>IDEMPOTENCY_CONFLICT</code> ; a different key for the same
        transaction produces <code>CASE_ALREADY_EXISTS</code>.
      </p>
      <p>
        {" "}
        Two unique indexes reinforce the code: run + key, and run + customer +
        transaction. They also protect against concurrent races; safety does not
        depend only on checking before writing.{" "}
      </p>
      <Detail title="Account, persona, role, session and run">
        <dl>
          <dt> Real account </dt>
          <dd> Identity authenticated by Sites/ChatGPT. </dd>
          <dt> Persona </dt>
          <dd> Ana or Lucas within that account&apos;s sandbox. </dd>
          <dt> Role </dt>
          <dd> Fictional customer/reviewer roles demonstrate both sides. </dd>
          <dt> Session </dt>
          <dd> Temporary server context bound to an opaque cookie. </dd>
          <dt> Run </dt>
          <dd>
            {" "}
            An owner-scoped space for repeating the demo while preserving
            earlier cases; at most 50 additional runs.{" "}
          </dd>
          <dt> Context </dt>
          <dd>
            {" "}
            A non-secret session fingerprint detects stale tabs; it grants no
            permissions.{" "}
          </dd>
        </dl>
      </Detail>
      <Detail title="What protects consent">
        <p>
          {" "}
          An immutable draft, ten-minute validity, token, same
          session/persona/run, <code>confirmed:true</code> and an unchanged
          source. This is technical confirmation of a specific summary, not a
          certified electronic signature or legal guarantee.{" "}
        </p>
        <p>
          {" "}
          A valid retry can recover the original case even after the draft
          expires because the operation is looked up first. It cannot create a
          new case from an expired draft.{" "}
        </p>
      </Detail>
      <Detail title="Atomic audit and its limits">
        <p>
          {" "}
          A trigger records an event in the same operation that creates or
          updates a case. The interface need not remember a second call.{" "}
        </p>
        <p>
          {" "}
          This is not an immutable cryptographic chain or complete event
          sourcing. It stores event, state, actor, version and date. The case
          contains the current note; editing replaces it, and history does not
          retain every complete note.{" "}
        </p>
      </Detail>
      <Note kind="fact">
        {" "}
        Mutations require exact origin, bounded JSON and strict Zod schemas. The
        cookie is HttpOnly, SameSite=Lax and Secure on HTTPS. Ownership, expiry
        and role checks remain necessary; each defense has a distinct
        purpose.{" "}
      </Note>
      <Source path="lib/server/api.ts" label="Server controls" />
      <Source
        path="docs/evidence/RUNS_SECURITY_REVIEW.md"
        label="Isolation review"
      />
    </Section>
  );
}

export function BuildChapter() {
  return (
    <Section
      eyebrow="09 / Process"
      title="We investigated, scoped, measured and corrected."
      intro="The project changed when data or failures invalidated assumptions. Early documents are historical records and may not describe the current code."
    >
      <div className="guide-timeline">
        {[
          [
            "Investigate",
            "Requirements and feasibility",
            "Challenge, kickoff, dictionary, summary, messages and part of the recording. Relationships were profiled before deciding what to promise.",
          ],
          [
            "Scope",
            "New dispute intake",
            "Separate receiving a request from adjudicating it. Define an observable endpoint: receive, persist and hand off to a reviewer.",
          ],
          [
            "Build",
            "Workflow with controls",
            "Session, owned transactions, draft, confirmation, persistence and audit; explicit states and contracts.",
          ],
          [
            "Learn",
            "Baseline, V1 and V2",
            "The first experiment did not justify autonomy. The second added diversity and froze decisions before a new test. Negative results were retained.",
          ],
          [
            "Review",
            "V3 corrections",
            "Switching language erased work; “84,90” failed amount search; repeated demos exhausted cases; two tabs could diverge. State, search, runs and context were corrected.",
          ],
          [
            "Deliver",
            "Code, build and deployment",
            "Historical packages were built from commits pushed to GitHub and Sites, with CI on fresh local D1. Hosted V6 now uses 3ae216e with restricted access. The current English correction remains local and does not change deployment.",
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
      <h3> Technology benefits and costs </h3>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Technology decisions"
      >
        <table>
          <thead>
            <tr>
              <th> Choice </th>
              <th> Intended benefit </th>
              <th> Limit </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "React + TypeScript",
                "ES/PT interface and shared types.",
                "Types do not validate runtime requests. The main view has grown and would benefit from decomposition.",
              ],
              [
                "Vinext / Worker",
                "Reuse the existing Sites environment and a deployable API.",
                "Runtime and identity coupling; another host requires adaptation.",
              ],
              [
                "D1 / SQLite",
                "Persistence, unique indexes and small operations.",
                "No demonstration of high load, banking operation or disaster recovery.",
              ],
              [
                "Local classifier",
                "Small, reproducible and without a runtime model API.",
                "Less conversational flexibility; difficulty with context, negation and ambiguity.",
              ],
              [
                "HTTP + browser",
                "Verify contracts and experience.",
                "Local testing alone does not prove OAuth or real hosted isolation.",
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
      <Note title="From proposal to implementation">
        {" "}
        The original strategy considered an LLM and described a prototype not
        yet built. Current code uses a local classifier, deterministic assistant
        and persistent cases. An initial intention must not be presented as an
        implemented feature.{" "}
      </Note>
      <Detail title="How agent work was divided">
        <p>
          {" "}
          Data research, training, holdout authorship, adversarial review and
          tests were separated into bounded tasks. The integrator handled code
          and deployment. Separating the test author from training reduces
          direct contamination; it does not establish independent human
          evaluation.{" "}
        </p>
      </Detail>
      <Source path=".github/workflows/verify.yml" label="CI pipeline" />
      <Source
        path="docs/evidence/BROWSER_V3.md"
        label="Historical V3 acceptance"
      />
    </Section>
  );
}

export function DeliveryChapter() {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <Section
      eyebrow="10 / Reproduce and finish"
      title="Deployment and submission are different states."
      intro="The functional app exists. Real-account acceptance, final materials and submission each need their own evidence."
    >
      <div className="guide-grid two">
        <article>
          <Check />
          <h3> Confirmed before this correction </h3>
          <ul>
            <li> Private repository; default branch at 3ae216e. </li>
            <li> Hosted V6 with restricted access. </li>
            <li> Draft PR #2 CI passed at fa53b35. </li>
            <li> Local walkthrough, case review and recovery. </li>
          </ul>
        </article>
        <article>
          <CircleHelp />
          <h3> Pending </h3>
          <ul>
            <li>
              {" "}
              Normal hosted login and isolation across two real accounts.{" "}
            </li>
            <li>
              {" "}
              Challenge-valid evaluation; recommended human ES/PT and label
              review.{" "}
            </li>
            <li>
              {" "}
              Video-language compliance: original preserved by user
              instruction.{" "}
            </li>
            <li> Publication decision, organizer submission and receipt. </li>
          </ul>
        </article>
      </div>
      <Note kind="limit">
        {" "}
        Automated hosted sign-in encountered the identity provider&apos;s security
        verification and did not bypass it. A successful deployment does not
        establish completion of the authenticated workflow. Hosted acceptance is
        coordinated separately.{" "}
      </Note>
      <h3> From a clean clone </h3>
      <p>
        {" "}
        Private repository access, Node.js 22.13+ and Python 3.11+ support the
        app and basic tests. The exported model needs neither GPU nor API
        key.{" "}
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
        {" "}
        Open the server&apos;s printed URL and use the documented local sign-in. This
        is a development identity: do not expose the server or trust its headers
        outside the intended environment.{" "}
      </p>
      <Detail title="Verify app and contracts">
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
          {" "}
          HTTP tests create fictional cases and preserve earlier ones. The
          original suite needs a fresh local database for a full pass. If
          fixtures are exhausted, use a separate verification checkout; do not
          silently delete data.{" "}
        </p>
      </Detail>
      <Detail title="Reproduce the model without altering the original">
        <p>
          {" "}
          The ML README documents the Python environment and{" "}
          <code> train_from_corpus.py --output-dir NEW_DIRECTORY </code> . It
          trains from the selected 634 training texts, without validation or
          holdout data and outside the frozen artifact paths.{" "}
        </p>
        <p>
          {" "}
          Reproducing parameters is not new independent evaluation. Adapting to
          known errors requires another reserved test.{" "}
        </p>
        <Source path="ml/README.md" label="Current ML commands" />
      </Detail>
      <h3> Proposed responsibilities </h3>
      <div
        className="guide-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Proposed team responsibilities"
      >
        <table>
          <thead>
            <tr>
              <th> Person </th>
              <th> Proposed work </th>
              <th> Completion evidence </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Roberto</td>
              <td>
                {" "}
                Integration, hosted acceptance and preservation of
                experiments.{" "}
              </td>
              <td> Two verified accounts and a frozen version. </td>
            </tr>
            <tr>
              <td>Jorge</td>
              <td> Clean clone and customer-flow/control review. </td>
              <td> Reproducible execution log and findings. </td>
            </tr>
            <tr>
              <td>Daniel</td>
              <td> Experience, bilingual scenarios and materials. </td>
              <td>
                {" "}
                Rehearsed walkthrough, language review and faithful video.{" "}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="guide-small">
        {" "}
        Jorge&apos;s and Daniel&apos;s assignments require their agreement; expertise and
        commitments are not assumed.{" "}
      </p>
      <Detail title="Original daily plan · not a completion record">
        <ul>
          <li>
            <strong> 30 Sep: </strong> normal login, two accounts and
            mobile.{" "}
          </li>
          <li>
            <strong> 1 Oct: </strong> label and Portuguese audit while
            preserving the frozen test.{" "}
          </li>
          <li>
            <strong> 2 Oct: </strong> close critical defects and measure with
            clear denominators.{" "}
          </li>
          <li>
            <strong> 3 Oct: </strong> freeze scope and reproduce from a clean
            clone.{" "}
          </li>
          <li>
            <strong> 4 Oct: </strong> check the demo and six slides; verify
            every claim.{" "}
          </li>
          <li>
            <strong> 5 Oct: </strong> check links, permissions and package; send
            only after approval and retain the receipt.{" "}
          </li>
        </ul>
        <p>
          {" "}
          The reviewed deadline clarification states 5 October at 23:59 UTC−5,
          continental Ecuador. The earlier internal target was 20:00. Recheck
          final announcements before sending. The event hub requires a public
          repository, a working deployed link, 4–6 slides and a video of at most
          three minutes. The organizer also requires English deliverables. No
          applicable exception is established.{" "}
        </p>
      </Detail>
      <Note kind="pending" title="Privacy remains the owner's decision">
        {" "}
        The demo retains its restricted audience and the repository remains
        private until explicitly authorized otherwise. A public-repository
        requirement does not authorize publication now. GitHub usernames do not
        substitute for site-access identities.{" "}
      </Note>
      <h3> When we would change direction </h3>
      <p>
        {" "}
        If coherent ownership or safe intake cannot be demonstrated, reduce the
        workflow to support with evidence. Credit would require an evaluable
        catalog and explicit policy. If a model does not improve the task, limit
        its role or use the form. A failed critical control blocks that
        version.{" "}
      </p>
      <div className="guide-lab">
        <span className="guide-label"> Check the central idea </span>
        <h3> Can a development result authorize a dispute by itself? </h3>
        <div className="guide-segment">
          <button aria-pressed={answer === 0} onClick={() => setAnswer(0)}>
            {" "}
            Yes, with a high score{" "}
          </button>
          <button aria-pressed={answer === 1} onClick={() => setAnswer(1)}>
            {" "}
            No: selection and confirmation are missing{" "}
          </button>
        </div>
        {answer !== null && (
          <p
            className={answer === 1 ? "guide-answer good" : "guide-answer"}
            role="status"
          >
            {answer === 1
              ? "Correct. The metric measures synthetic labels; it supplies no identity, ownership, consent or evidence of fraud."
              : "A score grants no permissions. V2's policy also abstains from accepting predictions: validation and confirmation remain necessary."}
          </p>
        )}
      </div>
      <Source path="docs/DELIVERY_PLAN.md" label="Proposed plan" />
      <Source path="docs/SUBMISSION_DRAFT.md" label="Unsent submission draft" />
    </Section>
  );
}

export function SourcesChapter() {
  return (
    <Section
      eyebrow="11 / References"
      title="How to verify what you have read."
      intro="Historical source links remain pinned to functional V3, c0d9fe6, with provenance corrections linked separately. Current local English explanations do not imply that this edition is deployed. The repository remains private."
    >
      <div className="guide-grid two">
        <article>
          <h3> Implemented facts </h3>
          <p>
            {" "}
            Derived from code and saved runs. A test establishes its scenario
            and environment, not every future situation.{" "}
          </p>
        </article>
        <article>
          <h3> Reasons and limits </h3>
          <p>
            {" "}
            Decisions explain tradeoffs. Limitations identify what code and
            measurements do not yet establish.{" "}
          </p>
        </article>
      </div>
      <h3> Project sources </h3>
      <div className="guide-source-list">
        {[
          ["README.md", "Overview and reproduction"],
          ["data-pipeline/data-card.md", "Data and privacy"],
          ["data-pipeline/report.json", "Aggregate profile"],
          ["ml/v1/model-card.md", "V1: exploratory experiment"],
          ["ml/v2/model-card.md", "V2: results and errors"],
          ["ml/v2/protocol.md", "Frozen protocol"],
          ["ml/heldout-v2/README.md", "Development-set provenance"],
          ["lib/server/api.ts", "API and authorization"],
          ["lib/assistant.ts", "Deterministic search"],
          ["docs/evidence/BROWSER_V3.md", "Browser"],
          ["docs/evidence/http-context-results.json", "Cross-tab context"],
          [".github/workflows/verify.yml", "CI"],
        ].map(([path, label]) => (
          <Source key={path} path={path} label={label} />
        ))}
      </div>
      <h3> Official sources </h3>
      <p>
        {" "}
        The original research was conducted on 28 September. Later verified
        clarifications include English deliverables and restrictions on mock
        data for testing. Links below preserve the original sources; this is not
        a claim to have reviewed every later message or the complete kickoff
        recording.{" "}
      </p>
      <ul className="guide-official">
        {[
          [
            "https://docs.google.com/document/d/18AwONT8hQupRcfNPLFrPo6fHOJ_OUn1nBf-3jMnla2c/edit",
            "Challenge in Google Docs",
          ],
          ["https://www.factored.ai/careers/ai-data-hackathon", "Event page"],
          [
            "https://factored-hackathon.slack.com/files/U0C3R316RQT/F0C4EU9MQS1/datathon_2026_kickoff.pdf",
            "Kickoff slides",
          ],
          [
            "https://factored-hackathon.slack.com/archives/C0BU54YAKMG/p1790614675075619?thread_ts=1790611564.552809",
            "Deadline and maximum video duration",
          ],
          [
            "https://factored-hackathon.slack.com/archives/C0BU1199KFX/p1790389966930169?thread_ts=1790377325.677879",
            "Local tools and deployment",
          ],
          [
            "https://factored-hackathon.slack.com/archives/C0BU1199KFX/p1790366324592219?thread_ts=1790363080.139599",
            "Learned component and baseline",
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
        {" "}
        The summary describes roughly 19 million rows and thirteen tables. Our
        profile uses a bounded sample. Documents containing private access
        information are not reproduced here.{" "}
      </Note>
      <h3> Code-reading glossary </h3>
      {[
        [
          "Sandbox and fixture",
          "A sandbox is a test environment. A fixture is a controlled, repeatable set for exercising scenarios without real data. Engineering fixtures do not establish challenge-testing compliance.",
        ],
        [
          "Snapshot and provenance",
          "A data cutoff and its origin: sourceRef identifies an invented row; sourceVersion identifies its version. The draft hash detects changes to its facts.",
        ],
        [
          "Train, validation and holdout",
          "Training learns weights; validation selects configuration and policy; holdout reserves data until decisions are fixed. All three partitions here are AI-authored: separation establishes neither independent validation nor a challenge-valid benchmark.",
        ],
        [
          "Evaluation leakage",
          "Information from an alleged test influences training or decisions. Separating families and freezing artifacts reduces specific pathways but does not remove all bias.",
        ],
        [
          "Abstention",
          "The policy can refuse acceptance even when a class has the highest score. In V2 every label remains an unconfirmed hypothesis.",
        ],
        [
          "Idempotency",
          "Repeating the same operation with the same key and content returns the original without duplicating its effect.",
        ],
        [
          "Atomicity",
          "An operation completes as one unit or fails. The trigger prevents a separate audit write from being forgotten.",
        ],
        [
          "Optimistic concurrency",
          "The server updates only if the previously read version is still current; otherwise the client must query again.",
        ],
        [
          "Parity",
          "Compare numeric outputs of one model in two implementations. They can agree perfectly and still classify incorrectly.",
        ],
        [
          "CI, build and deployment",
          "CI runs checks; a build produces a package; deployment publishes a version. None establishes real-account acceptance or a hackathon submission receipt.",
        ],
      ].map(([title, text]) => (
        <Detail key={title} title={title}>
          <p>{text}</p>
        </Detail>
      ))}
    </Section>
  );
}
