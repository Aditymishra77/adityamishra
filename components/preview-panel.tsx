"use client";

import Link from "next/link";
import { ExternalLink, MonitorPlay } from "lucide-react";
import { useMemo, useState } from "react";

const previewOptions = [
  { id: "react-app", label: "React App", description: "Dashboard starter with analytics widgets." },
  { id: "node-api", label: "Node API", description: "Operational monitor for generated backend services." },
  { id: "ai-app", label: "AI App", description: "AI-native product shell with agents and knowledge workflows." }
] as const;

export function PreviewPanel() {
  const [activePreview, setActivePreview] = useState<(typeof previewOptions)[number]["id"]>("react-app");

  const active = useMemo(
    () => previewOptions.find((option) => option.id === activePreview) ?? previewOptions[0],
    [activePreview]
  );

  return (
    <div>
      <div className="block-title">
        <MonitorPlay size={16} color="#22d3ee" />
        Live Preview & Deployments
      </div>

      <div className="preview-toolbar">
        <div className="preview-tabs">
          {previewOptions.map((option) => (
            <button
              key={option.id}
              className={`preview-tab ${option.id === activePreview ? "preview-tab-active" : ""}`}
              onClick={() => setActivePreview(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <Link className="preview-link" href={`/preview/${activePreview}`} target="_blank">
          <ExternalLink size={14} />
          Open preview
        </Link>
      </div>

      <p className="preview-description">{active.description}</p>

      <div className="preview-frame-shell">
        <iframe
          key={activePreview}
          className="preview-frame"
          src={`/preview/${activePreview}`}
          title={`${active.label} live preview`}
        />
      </div>

      <div className="preview-grid" style={{ marginTop: 12 }}>
        <div className="preview-card cyan">Hot reload ready for local development on `npm run dev`.</div>
        <div className="preview-card violet">Shareable routes make generated app states easy to review and demo.</div>
      </div>
    </div>
  );
}
