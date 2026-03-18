import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    templates: [
      { name: "React App", stack: ["React", "Vite", "TypeScript"] },
      { name: "Next.js App", stack: ["Next.js", "PostgreSQL", "Auth.js"] },
      { name: "Node API", stack: ["Express", "Prisma", "PostgreSQL"] },
      { name: "SaaS Dashboard", stack: ["Next.js", "Stripe", "Tailwind"] },
      { name: "AI App", stack: ["Next.js", "OpenAI", "LangGraph"] }
    ]
  });
}
