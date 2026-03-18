import { NextResponse } from "next/server";

const starterFiles = {
  "src/app/page.tsx": "export default function Home() { return <main>AI project scaffold</main>; }",
  "src/components/dashboard.tsx": "export function Dashboard() { return <section>Dashboard UI</section>; }",
  "src/lib/api.ts": "export const api = { baseUrl: '/api' };"
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { idea?: string };
  const idea = body.idea?.trim() || "Next.js SaaS dashboard";

  return NextResponse.json({
    idea,
    dependencies: ["next", "react", "typescript", "tailwindcss", "prisma"],
    folders: ["src/app", "src/components", "src/lib", "src/server", "tests"],
    files: starterFiles,
    agents: ["Code Generator", "Test Generator", "Documentation Agent"]
  });
}
