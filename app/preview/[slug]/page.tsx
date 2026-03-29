import { notFound } from "next/navigation";

const previews = {
  "react-app": {
    title: "React Dashboard Preview",
    subtitle: "Starter analytics workspace rendered inside the built-in IDE preview.",
    accent: "#22d3ee",
    cards: [
      { label: "MRR", value: "$128K" },
      { label: "Active Users", value: "8,492" },
      { label: "Deploys", value: "14 today" }
    ]
  },
  "node-api": {
    title: "Node API Monitor",
    subtitle: "Inspect endpoints, jobs, and queue activity for a generated Express service.",
    accent: "#34d399",
    cards: [
      { label: "Healthy routes", value: "24/24" },
      { label: "Queue latency", value: "82ms" },
      { label: "Background jobs", value: "17 running" }
    ]
  },
  "ai-app": {
    title: "AI Workspace Preview",
    subtitle: "Prototype an AI-native product with retrieval, chat, and automation pipelines.",
    accent: "#a78bfa",
    cards: [
      { label: "Embeddings", value: "1.2M" },
      { label: "Success rate", value: "98.4%" },
      { label: "Agents", value: "6 online" }
    ]
  }
} as const;

type PreviewSlug = keyof typeof previews;

export default function PreviewPage({ params }: { params: { slug: string } }) {
  const slug = params.slug as PreviewSlug;
  const preview = previews[slug];

  if (!preview) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "32px",
        background: "radial-gradient(circle at top, rgba(15,23,42,0.95), #020617 60%)",
        color: "white",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: 28,
          padding: 28,
          background: "rgba(15,23,42,0.86)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)"
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.3em", color: preview.accent }}>
          Live preview
        </div>
        <h1 style={{ margin: "12px 0 8px", fontSize: 36 }}>{preview.title}</h1>
        <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>{preview.subtitle}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginTop: 28 }}>
          {preview.cards.map((card) => (
            <section
              key={card.label}
              style={{
                borderRadius: 22,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(2,6,23,0.75)"
              }}
            >
              <div style={{ color: "#94a3b8", fontSize: 13 }}>{card.label}</div>
              <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>{card.value}</div>
            </section>
          ))}
        </div>

        <section
          style={{
            marginTop: 24,
            borderRadius: 24,
            border: "1px solid rgba(148,163,184,0.16)",
            background: "rgba(2,6,23,0.72)",
            padding: 24
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>Preview-ready local development</h2>
              <p style={{ margin: "10px 0 0", color: "#94a3b8", maxWidth: 680, lineHeight: 1.7 }}>
                This route is designed to render inside the IDE iframe so developers can validate generated projects,
                inspect visual changes, and share browser previews without leaving the workspace.
              </p>
            </div>
            <a
              href="/"
              style={{
                alignSelf: "start",
                borderRadius: 14,
                padding: "12px 16px",
                background: preview.accent,
                color: "#020617",
                fontWeight: 700
              }}
            >
              Back to IDE
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
