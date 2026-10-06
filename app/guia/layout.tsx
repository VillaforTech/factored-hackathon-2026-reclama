import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Inside Reclama · Project guide",
  description:
    "Reclama's decisions, data, architecture, AI and evaluation, explained step by step.",
};
export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
