# Enterprise Full-Stack Starter

Scalable full-stack template with:

- **Frontend:** Next.js 14 + App Router
- **Backend:** Node.js + Express (modular/layered design)
- **Database:** PostgreSQL
- **Authentication:** JWT (register, login, protected profile)

## Architecture

```text
app/                        # Next.js UI routes and pages
lib/                        # Shared frontend utilities (API client)
server/
  src/
    config/                 # Environment config
    modules/
      auth/                 # Domain module (routes, controller, service, repository, types)
      accounting/           # Double-entry journals + ledger APIs
      ops/                  # RBAC notifications, activity logs, audit trails
      health/
    shared/
      db/                   # PostgreSQL pool
      middlewares/          # auth + error middleware
      utils/                # JWT helpers
  database/migrations/      # SQL migrations
```

### Backend layering strategy

1. **Routes**: map HTTP endpoints to controller methods.
2. **Controllers**: translate HTTP request/response to service calls.
3. **Services**: enforce business rules and orchestration.
4. **Repositories**: isolated data-access operations.

This keeps transport, domain logic, and persistence decoupled for enterprise growth.

Role-based access is now supported with `admin`, `manager`, and `staff` roles, plus notification/activity/audit operations endpoints.

## API surface

Base URL: `http://localhost:4000/api/v1`

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token required)
- `POST /crm/leads` (create lead + auto-assign salesperson + AI suggestion, Bearer token required)
- `PATCH /crm/leads/:leadId` (update lead, Bearer token required)
- `POST /crm/leads/:leadId/convert` (convert lead to customer, Bearer token required)
- `GET /crm/leads/:leadId/ai-suggestion` (Gemini-powered next-step guidance, Bearer token required)
- `POST /billing/invoices` (create invoice with GST + auto invoice number + auto accounting journal posting, Bearer token required)
- `GET /billing/invoices/:invoiceId/pdf` (export invoice PDF, Bearer token required)
- `POST /inventory/products` (add product, Bearer token required)
- `POST /inventory/stock/in` (stock-in, Bearer token required)
- `POST /inventory/stock/out` (stock-out, Bearer token required)
- `GET /inventory/alerts/low-stock` (low stock alerts, Bearer token required)
- `POST /accounting/journal-entries` (create balanced journal entries, Bearer token required)
- `GET /accounting/ledger` (ledger view with running balance, Bearer token required)
- `GET /ops/notifications` (current user notifications, Bearer token required)
- `PATCH /ops/notifications/:notificationId/read` (mark notification as read, Bearer token required)
- `POST /ops/notifications` (admin/manager only)
- `GET /ops/activity-logs` (admin/manager only)
- `GET /ops/audit-trails` (admin only)

## Quick start

1. Copy env file:

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run frontend + API together:

   ```bash
   npm run dev:full
   ```

4. Ensure PostgreSQL is running locally with credentials from `.env.example`, or use Docker Compose.

5. Open:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:4000/api/v1/health`

6. Optional: set `GEMINI_API_KEY` in `.env.local` to enable Gemini-based CRM suggestions.

## Docker Compose

```bash
docker compose up --build
```

Compose boots 3 services:

- `web` (Next.js)
- `api` (Express)
- `db` (PostgreSQL 16)

Database migration SQL in `server/database/migrations` is mounted into Postgres init.


## Enterprise database schema

A complete PostgreSQL relational schema for CRM, Billing, Inventory, Accounting, and Production is included in:

- `server/database/migrations/002_enterprise_domains.sql`

The schema contains:

- core master tables (customers, products, warehouses, chart of accounts, BOMs)
- operational tables (leads, invoices/payments, stock movements, production orders)
- accounting journals and posting links to billing/production flows
- constraints, foreign keys, and indexes for data integrity and query performance
- reporting views for customer balances and available inventory

## Production hardening checklist

- Move from raw SQL files to a migration tool (Prisma, Knex, or Flyway).
- Rotate `JWT_SECRET` and store secrets in a vault.
- Add refresh-token strategy and revocation list.
- Add request validation (Zod/Joi) and structured logging.
- Add integration tests (API) + e2e tests (UI).
