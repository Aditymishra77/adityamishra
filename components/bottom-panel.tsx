import { TerminalSquare } from "lucide-react";

import { terminalLines } from "@/data/mock";
import { PreviewPanel } from "@/components/preview-panel";

export function BottomPanel() {
  return (
    <section className="bottom-grid">
      <div className="bottom-block with-border">
        <div className="block-title">
          <TerminalSquare size={16} color="#34d399" />
          Integrated Terminal
        </div>
        <div className="terminal-box">
          {terminalLines.map((line) => (
            <div key={line} className="terminal-line">
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className="bottom-block">
        <PreviewPanel />
      </div>
    </section>
  );
}
