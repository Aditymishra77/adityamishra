export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

export type ChatMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

export const workspaceTree: FileNode[] = [
  {
    id: "app",
    name: "app",
    type: "folder",
    children: [
      { id: "app-page", name: "page.tsx", type: "file" },
      { id: "app-layout", name: "layout.tsx", type: "file" },
      {
        id: "app-api",
        name: "api",
        type: "folder",
        children: [
          { id: "api-chat", name: "chat/route.ts", type: "file" },
          { id: "api-generate", name: "generate/route.ts", type: "file" }
        ]
      }
    ]
  },
  {
    id: "components",
    name: "components",
    type: "folder",
    children: [
      { id: "cmp-shell", name: "ide-shell.tsx", type: "file" },
      { id: "cmp-chat", name: "chat-panel.tsx", type: "file" },
      { id: "cmp-editor", name: "editor-pane.tsx", type: "file" }
    ]
  },
  {
    id: "agents",
    name: "agents",
    type: "folder",
    children: [
      { id: "agent-codegen", name: "code-generator.ts", type: "file" },
      { id: "agent-bugfix", name: "bug-fix.ts", type: "file" },
      { id: "agent-security", name: "security.ts", type: "file" }
    ]
  }
];

export const openTabs = [
  "app/page.tsx",
  "components/ide-shell.tsx",
  "lib/agent-orchestrator.ts"
];

export const editorCode = `import { orchestrateAgents } from \"@/lib/agent-orchestrator\";

export async function buildFeature(request: string) {
  const plan = await orchestrateAgents({
    goal: request,
    agents: [
      \"code-generator\",
      \"bug-fix\",
      \"test-case-generator\",
      \"documentation\"
    ]
  });

  return {
    files: plan.files,
    terminal: [\"npm install\", \"npm run lint\", \"npm run test\"],
    deployment: plan.deploymentTarget
  };
}`;

export const assistantConversation: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "I indexed 128 files, identified the auth flow, and found 3 missing tests in the billing module."
  },
  {
    role: "user",
    content: "Create a secure Node.js login system with JWT and refresh tokens."
  },
  {
    role: "assistant",
    content:
      "Done. I generated the API routes, auth service, Prisma schema updates, and a React sign-in page. Want me to add OAuth providers next?"
  }
];

export const agents = [
  {
    name: "Code Generator",
    specialty: "Scaffolds apps, APIs, UIs, and infrastructure from prompts.",
    status: "Active",
    latency: "1.2s"
  },
  {
    name: "Bug Fix Agent",
    specialty: "Triages stack traces, patches regressions, and proposes diffs.",
    status: "Watching runtime",
    latency: "850ms"
  },
  {
    name: "Refactor Agent",
    specialty: "Improves architecture, extracts modules, and raises code quality.",
    status: "Ready",
    latency: "1.0s"
  },
  {
    name: "Test Generator",
    specialty: "Creates unit, integration, and end-to-end tests on demand.",
    status: "Active",
    latency: "900ms"
  },
  {
    name: "Security Scanner",
    specialty: "Finds secrets, dependency risks, and unsafe code patterns.",
    status: "Scanning",
    latency: "2.4s"
  },
  {
    name: "Documentation Agent",
    specialty: "Explains systems and keeps docs synchronized with code changes.",
    status: "Ready",
    latency: "700ms"
  }
];

export const metrics = [
  { label: "Repositories indexed", value: "4.2K" },
  { label: "Avg AI completion", value: "310ms" },
  { label: "Active collaborators", value: "18" },
  { label: "Deployments today", value: "126" }
];

export const templates = [
  "React App",
  "Next.js SaaS Dashboard",
  "Node REST API",
  "AI Automation App",
  "Mobile Backend"
];

export const terminalLines = [
  "$ npm run dev",
  "✓ workspace indexed in 1.3s",
  "✓ code agents connected",
  "✓ preview ready on http://localhost:3000",
  "$ git checkout -b feat/ai-repository-memory"
];

export const searchSuggestions = [
  "Find authentication logic",
  "Locate API routes",
  "Show where Stripe billing is handled",
  "Which files define the agent runtime?"
];

export const integrations = [
  "OpenAI / Claude / DeepSeek model router",
  "PostgreSQL memory + embeddings",
  "WebSocket collaboration engine",
  "S3 project snapshots",
  "Vercel / Netlify / AWS deploy adapters"
];
