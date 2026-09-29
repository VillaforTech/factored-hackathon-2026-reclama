import type { ReactNode } from "react";
import { FileText } from "lucide-react";
export const REPO =
  "https://github.com/VillaforTech/factored-hackathon-2026-reclama";
const BASE = `${REPO}/blob/c0d9fe6f7ed9654fe8979f0b765f76d30fb22a9d/`;
export function Source({ path, label }: { path: string; label?: string }) {
  return (
    <a
      className="guide-source"
      href={BASE + path}
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
    fact: "Implementado / medido",
    decision: "Decisión de diseño",
    limit: "Límite de la evidencia",
    pending: "Pendiente",
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
