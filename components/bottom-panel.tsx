import { Server, TerminalSquare } from "lucide-react";

import { terminalLines } from "@/data/mock";

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
        <div className="block-title">
          <Server size={16} color="#22d3ee" />
          Live Preview & Deployments
        </div>
        <div className="preview-grid">
          <div className="preview-card cyan">Preview container booted with instant reload and browser sandbox.</div>
          <div className="preview-card violet">One-click deployment adapters for Vercel, Netlify, AWS, and Docker.</div>
        </div>
      </div>
    </section>
  );
}
