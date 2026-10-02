import type { ReactNode } from "react";
import { FileText } from "lucide-react";
export const REPO =
  "https://github.com/VillaforTech/factored-hackathon-2026-reclama";
const BASE = `${REPO}/blob/c0d9fe6f7ed9654fe8979f0b765f76d30fb22a9d/`;
// Link corrected interpretations to an immutable correction commit while keeping
// frozen experiment/code evidence pinned to its historical source.
const CORRECTION_BASE = `${REPO}/blob/4975d7f7b520296664ad1dfb642b80118795bd5d/`;
const correctedSources = new Set([
  "ml/README.md",
  "ml/v1/model-card.md",
  "ml/v2/model-card.md",
  "ml/heldout-v2/README.md",
  "docs/evidence/EVALUATION_PROVENANCE_CORRECTION_2026-10-01.md",
]);
export function Source({ path, label }: { path: string; label?: string }) {
  return (
    <a
      className="guide-source"
      href={(correctedSources.has(path) ? CORRECTION_BASE : BASE) + path}
      target="_blank"
      rel="noreferrer"
    >
      <FileText size={14} />
      {label || path}
    </a>
  );
}
export function Note({
  children,
  kind = "decision",
  title,
}: {
  children: ReactNode;
  kind?: "fact" | "decision" | "limit" | "pending";
  title?: string;
}) {
  const labels = {
    fact: "Implemented / measured",
    decision: "Design decision",
    limit: "Evidence limit",
    pending: "Pending",
  };
  return (
    <aside className={`guide-note ${kind}`}>
      <strong>{title || labels[kind]}</strong>
      <div>{children}</div>
    </aside>
  );
}
export function Section({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="guide-chapter">
      <p className="guide-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p className="guide-intro">{intro}</p>}
      {children}
    </section>
  );
}
export function Detail({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="guide-detail">
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}
