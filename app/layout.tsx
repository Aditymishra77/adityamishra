import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CursorForge IDE",
  description:
    "An AI-first coding IDE inspired by Cursor, with repository-aware agents, code generation, debugging, collaboration, and cloud deployment workflows."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
