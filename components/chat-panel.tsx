import { Bot, Send, ShieldCheck, WandSparkles } from "lucide-react";

import { agents, assistantConversation } from "@/data/mock";

export function ChatPanel() {
  return (
    <aside className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-row">
          <div>
            <p className="eyebrow eyebrow-violet">AI cockpit</p>
            <h2 className="panel-title">Repository-aware assistant</h2>
          </div>
          <Bot size={24} color="#c4b5fd" />
        </div>
      </div>

      <div className="panel-block">
        <div className="capability-grid">
          <div className="panel-card">
            <WandSparkles size={16} color="#22d3ee" />
            <div style={{ marginTop: 10 }}>Context-aware AI</div>
          </div>
          <div className="panel-card">
            <ShieldCheck size={16} color="#34d399" />
            <div style={{ marginTop: 10 }}>Auto-fix + security scan</div>
          </div>
        </div>
      </div>

      <div className="chat-body">
        <div className="chat-list">
          {assistantConversation.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message ${message.role === "assistant" ? "assistant" : "user"}`}>
              <div className="message-role">{message.role}</div>
              <p className="message-copy">{message.content}</p>
            </div>
          ))}
        </div>

        <div className="prompt-card">
          <div className="message-role">Agents</div>
          <div className="agent-list">
            {agents.map((agent) => (
              <div key={agent.name} className="agent-card">
                <div className="agent-top">
                  <span>{agent.name}</span>
                  <span className="agent-latency">{agent.latency}</span>
                </div>
                <p className="agent-copy">{agent.specialty}</p>
                <div className="agent-status">{agent.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-footer">
        <div className="prompt-card">
          <div className="message-role">Prompt</div>
          <p className="prompt-copy">
            Build a REST API for ecommerce, add tests, and deploy a preview environment.
          </p>
          <button className="dispatch-button">
            <Send className="icon-inline" size={16} />
            Dispatch to agents
          </button>
        </div>
      </div>
    </aside>
  );
}
