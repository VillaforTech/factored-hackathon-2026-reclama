import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Reclama por dentro · Guía del proyecto",
  description:
    "Decisiones, datos, arquitectura, IA y evaluación de Reclama, explicados paso a paso.",
};
export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
