import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reclama · Disputas con evidencia",
  description:
    "Atención bilingüe de disputas con evidencia verificable. Sandbox Factored 2026.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
