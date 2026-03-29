import { BottomPanel } from "@/components/bottom-panel";
import { ChatPanel } from "@/components/chat-panel";
import { EditorPane } from "@/components/editor-pane";
import { OverviewCards } from "@/components/overview-cards";
import { Sidebar } from "@/components/sidebar";

export function IdeShell() {
  return (
    <main className="ide-root">
      <OverviewCards />
      <div className="workspace-grid">
        <Sidebar />
        <div className="center-column">
          <EditorPane />
          <BottomPanel />
        </div>
        <ChatPanel />
      </div>
    </main>
  );
}
