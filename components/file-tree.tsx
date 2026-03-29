import { ChevronDown, ChevronRight, FileCode2, FolderTree } from "lucide-react";

import type { FileNode } from "@/data/mock";
import { cn } from "@/lib/utils";

type FileTreeProps = {
  nodes: FileNode[];
  depth?: number;
};

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  return (
    <div className="file-tree">
      {nodes.map((node) => {
        const isFolder = node.type === "folder";

        return (
          <div key={node.id}>
            <div
              className={cn("file-row", depth === 0 && "file-root")}
              style={{ paddingLeft: `${depth * 14 + 10}px` }}
            >
              {isFolder ? (
                <>
                  <ChevronDown size={16} color="#64748b" />
                  <FolderTree size={16} color="#22d3ee" />
                </>
              ) : (
                <>
                  <ChevronRight size={16} color="transparent" />
                  <FileCode2 size={16} color="#a78bfa" />
                </>
              )}
              <span>{node.name}</span>
            </div>
            {isFolder && node.children?.length ? <FileTree nodes={node.children} depth={depth + 1} /> : null}
          </div>
        );
      })}
    </div>
  );
}
