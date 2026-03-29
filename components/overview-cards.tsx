import { BrainCircuit, Cloud, Database, Rocket } from "lucide-react";

import { integrations, metrics, templates } from "@/data/mock";

const icons = [BrainCircuit, Database, Cloud, Rocket];

export function OverviewCards() {
  return (
    <div className="overview">
      <div className="metrics-grid">
        {metrics.map((metric, index) => {
          const Icon = icons[index] ?? BrainCircuit;
          return (
            <div key={metric.label} className="metric-card">
              <Icon size={20} color="#22d3ee" />
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
            </div>
          );
        })}
      </div>

      <div className="arch-grid">
        <div className="arch-hero">
          <div className="eyebrow eyebrow-cyan">Platform architecture</div>
          <h3 className="hero-title">Modular AI-native workspace</h3>
          <p className="section-copy">
            Ship a full-stack coding IDE with repository memory, agent orchestration, natural language code search,
            plugin extensibility, deployment automation, and collaborative cloud development.
          </p>
          <div className="chip-row">
            {integrations.map((integration) => (
              <span key={integration} className="search-chip">
                {integration}
              </span>
            ))}
          </div>
        </div>

        <div className="stack-column">
          <div className="stack-card">
            <div className="eyebrow eyebrow-violet">Project templates</div>
            <div className="chip-row">
              {templates.map((template) => (
                <span key={template} className="template-chip">
                  {template}
                </span>
              ))}
            </div>
          </div>
          <div className="stack-card">
            <div className="eyebrow eyebrow-emerald">Security layer</div>
            <ul className="list-copy">
              <li>Static analysis, secret detection, and vulnerability triage.</li>
              <li>AI-assisted remediation patches and compliance-ready audit trails.</li>
              <li>Plugin-ready architecture for custom scanners and policy engines.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
