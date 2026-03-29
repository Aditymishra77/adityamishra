import { GitBranch, LayoutTemplate, PlugZap, Search } from "lucide-react";

import { FileTree } from "@/components/file-tree";
import { searchSuggestions, workspaceTree } from "@/data/mock";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="eyebrow eyebrow-cyan">Workspace</p>
        <h2 className="panel-title">CursorForge IDE</h2>
      </div>

      <div className="panel-block">
        <div className="search-box">
          <Search size={16} />
          <span>Natural language code search</span>
        </div>
        <div className="search-list" style={{ marginTop: 12 }}>
          {searchSuggestions.map((item) => (
            <div key={item} className="search-chip">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-body">
        <div className="section-label">
          <LayoutTemplate size={16} />
          Explorer
        </div>
        <FileTree nodes={workspaceTree} />
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-action">
          <GitBranch size={16} color="#34d399" />
          Git
        </div>
        <div className="sidebar-action">
          <Search size={16} color="#22d3ee" />
          Search
        </div>
        <div className="sidebar-action">
          <PlugZap size={16} color="#a78bfa" />
          Plugins
        </div>
      </div>
    </aside>
  );
}
