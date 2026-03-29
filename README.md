# CursorForge IDE

CursorForge IDE is a scalable AI-first coding workspace inspired by Cursor-style developer tools. It combines a modern multi-panel code editor, repository-aware AI assistance, autonomous coding agents, live preview workflows, terminal integration, deployment automation, and a plugin-ready architecture.

## Features

- **AI Code Editor** with file explorer, tabs, line numbers, editor canvas, terminal panel, Git entry points, and VS Code-inspired dark styling.
- **AI Coding Assistant** panel for repository-aware chat, selected-code editing, debugging, explanation, and autonomous prompt dispatch.
- **Code Generation APIs** for scaffolding projects, files, dependencies, and templates.
- **Repository Understanding** endpoint with indexing insights, hotspots, and recommendations.
- **Specialized Agents** for generation, bug fixing, refactoring, testing, documentation, and security scanning.
- **Live Preview Support** with built-in iframe previews and shareable preview routes for generated apps.
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

- `app/` – App Router pages, preview routes, global styles, and mock API endpoints
- `components/` – Modular IDE shell components (sidebar, editor, chat, terminal, overview, preview)
- `data/` – Mock repository, agent, and UI state used to render the experience
- `lib/` – Shared helpers
- `Dockerfile` / `compose.yaml` – Optional local container-based development setup

## API Endpoints

- `POST /api/chat` – Returns a repository-aware AI workflow plan
- `POST /api/generate` – Returns generated folder/file scaffolding metadata
- `GET /api/repository` – Returns indexing and improvement recommendations
- `GET /api/templates` – Returns starter template options
- `GET /api/agents` – Returns available AI agents and orchestration summary

## Local Development

### Option 1: Run directly with Node.js

1. Use **Node.js 20+**.
2. Copy environment defaults:

   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app on all interfaces for local previewing:

   ```bash
   npm run dev:host
   ```

5. Open `http://localhost:3000`.

### Option 2: Run with Docker Compose

```bash
docker compose up --build
```

This starts the app at `http://localhost:3000` with your repository mounted into the container for iterative development.

## Preview Support

- The IDE includes built-in preview tabs rendered through an iframe in the lower-right panel.
- Shareable preview routes are available under:
  - `/preview/react-app`
  - `/preview/node-api`
  - `/preview/ai-app`
- Use the **Open preview** action from the IDE to launch the active preview route in a new tab.

## Next Expansion Ideas

1. Replace mocked data with Monaco Editor, persistent workspace files, and real terminal sessions.
2. Connect model adapters for OpenAI, Claude, and DeepSeek with streaming chat responses.
3. Add PostgreSQL-backed repository memory and vector search for context retrieval.
4. Implement collaborative cursors and live editing over WebSockets.
5. Add OAuth/email authentication, Git push/pull flows, and plugin marketplace installation.
