import { Play, Sparkles } from "lucide-react";

import { editorCode, openTabs } from "@/data/mock";

export function EditorPane() {
  const lines = editorCode.split("\n");

  return (
    <section className="editor-pane">
      <div className="editor-topbar">
        {openTabs.map((tab, index) => (
          <button key={tab} className={`tab ${index === 0 ? "tab-active" : ""}`}>
            {tab}
          </button>
        ))}
        <div className="editor-actions">
          <button className="action-secondary">
            <Sparkles className="icon-inline" size={16} />
            Ask AI to edit selection
          </button>
          <button className="action-primary">
            <Play className="icon-inline" size={16} />
            Run preview
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="line-gutter">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <pre className="editor-code">
          {lines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </pre>
      </div>
    </section>
  );
}
