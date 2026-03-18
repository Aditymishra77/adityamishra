# CursorForge IDE

CursorForge IDE is a scalable AI-first coding workspace inspired by Cursor-style developer tools. It combines a modern multi-panel code editor, repository-aware AI assistance, autonomous coding agents, live preview workflows, terminal integration, deployment automation, and a plugin-ready architecture.

## Features

- **AI Code Editor** with file explorer, tabs, line numbers, editor canvas, terminal panel, Git entry points, and VS Code-inspired dark styling.
- **AI Coding Assistant** panel for repository-aware chat, selected-code editing, debugging, explanation, and autonomous prompt dispatch.
- **Code Generation APIs** for scaffolding projects, files, dependencies, and templates.
- **Repository Understanding** endpoint with indexing insights, hotspots, and recommendations.
- **Specialized Agents** for generation, bug fixing, refactoring, testing, documentation, and security scanning.
- **Live Preview + Deployment** cards designed for browser previews and one-click deployment targets.
- **Scalable Modular Architecture** using reusable components and route handlers ready to plug into real model providers and backend services.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **UI:** Custom dashboard layout with Lucide icons
- **Backend/API:** Next.js Route Handlers (expandable to Node/Express services)
- **AI Layer:** Ready for OpenAI, Claude, and DeepSeek routing
- **Data Layer:** Prepared for PostgreSQL + embeddings memory
- **Realtime:** Ready for WebSockets collaboration
- **Storage:** Ready for S3-backed project snapshots

## Project Structure

- `app/` – App Router pages, global styles, and mock API endpoints
- `components/` – Modular IDE shell components (sidebar, editor, chat, terminal, overview)
- `data/` – Mock repository, agent, and UI state used to render the experience
- `lib/` – Shared helpers

## API Endpoints

- `POST /api/chat` – Returns a repository-aware AI workflow plan
- `POST /api/generate` – Returns generated folder/file scaffolding metadata
- `GET /api/repository` – Returns indexing and improvement recommendations
- `GET /api/templates` – Returns starter template options
- `GET /api/agents` – Returns available AI agents and orchestration summary

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the AI IDE interface.

## Next Expansion Ideas

1. Replace mocked data with Monaco Editor, persistent workspace files, and real terminal sessions.
2. Connect model adapters for OpenAI, Claude, and DeepSeek with streaming chat responses.
3. Add PostgreSQL-backed repository memory and vector search for context retrieval.
4. Implement collaborative cursors and live editing over WebSockets.
5. Add OAuth/email authentication, Git push/pull flows, and plugin marketplace installation.
