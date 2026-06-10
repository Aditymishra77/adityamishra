-- =========================================================
-- Enterprise relational schema
-- Domains: CRM, Billing, Inventory, Accounting, Production
-- =========================================================

-- -----------------------------
-- Shared enums
-- -----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_lead_status') THEN
    CREATE TYPE crm_lead_status AS ENUM ('new', 'qualified', 'proposal', 'won', 'lost');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'void');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'check', 'wallet', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('finished_good', 'service', 'raw_material');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_movement_type') THEN
    CREATE TYPE stock_movement_type AS ENUM ('opening', 'inbound', 'outbound', 'transfer_in', 'transfer_out', 'adjustment');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'production_order_status') THEN
    CREATE TYPE production_order_status AS ENUM ('planned', 'released', 'in_progress', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
  END IF;
END $$;

-- -----------------------------
-- Accounting
-- -----------------------------
CREATE TABLE IF NOT EXISTS accounting_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_type account_type NOT NULL,
  parent_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounting_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_no BIGSERIAL UNIQUE,
  entry_date DATE NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  memo TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounting_journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES accounting_journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounting_accounts(id) ON DELETE RESTRICT,
  description TEXT,
  debit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  cost_center TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON accounting_journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON accounting_journal_lines(account_id);

-- -----------------------------
-- CRM
-- -----------------------------
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  lead_status crm_lead_status NOT NULL DEFAULT 'new',
  estimated_value NUMERIC(18,2),
  notes TEXT,
  converted_customer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code TEXT NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  display_name TEXT,
  tax_id TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country_code CHAR(2),
  credit_limit NUMERIC(18,2) NOT NULL DEFAULT 0,
  receivable_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  created_from_lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE crm_leads
  ADD CONSTRAINT fk_leads_converted_customer
  FOREIGN KEY (converted_customer_id) REFERENCES crm_customers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS crm_customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  subject TEXT,
  notes TEXT,
  interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((customer_id IS NOT NULL) OR (lead_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_name ON crm_customers(legal_name);

-- -----------------------------
-- Inventory
-- -----------------------------
CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  product_type product_type NOT NULL DEFAULT 'finished_good',
  uom TEXT NOT NULL,
  sale_price NUMERIC(18,2),
  cost_price NUMERIC(18,2),
  min_stock_level NUMERIC(18,3) NOT NULL DEFAULT 0,
  max_stock_level NUMERIC(18,3),
  inventory_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  revenue_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  expense_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country_code CHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES inventory_warehouses(id) ON DELETE CASCADE,
  quantity_on_hand NUMERIC(18,3) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(18,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id),
  CHECK (quantity_on_hand >= 0),
  CHECK (quantity_reserved >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_type stock_movement_type NOT NULL,
  product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES inventory_warehouses(id) ON DELETE RESTRICT,
  quantity NUMERIC(18,3) NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(18,4),
  reference_type TEXT,
  reference_id UUID,
  movement_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON inventory_stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse ON inventory_stock_movements(warehouse_id);

-- -----------------------------
-- Billing
-- -----------------------------
CREATE TABLE IF NOT EXISTS billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no BIGSERIAL UNIQUE,
  customer_id UUID NOT NULL REFERENCES crm_customers(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  currency_code CHAR(3) NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(18,2) NOT NULL DEFAULT 0,
  notes TEXT,
  ar_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  revenue_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  posted_journal_entry_id UUID REFERENCES accounting_journal_entries(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (due_date >= invoice_date),
  CHECK (subtotal >= 0 AND tax_total >= 0 AND discount_total >= 0),
  CHECK (total_amount >= 0 AND amount_paid >= 0)
);

CREATE TABLE IF NOT EXISTS billing_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  product_id UUID REFERENCES inventory_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(18,3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(18,4) NOT NULL CHECK (unit_price >= 0),
  tax_rate NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
  discount_rate NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (discount_rate >= 0),
  line_total NUMERIC(18,2) NOT NULL,
  revenue_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (invoice_id, line_no)
);

CREATE TABLE IF NOT EXISTS billing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_no BIGSERIAL UNIQUE,
  customer_id UUID NOT NULL REFERENCES crm_customers(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency_code CHAR(3) NOT NULL DEFAULT 'USD',
  method payment_method NOT NULL,
  external_reference TEXT,
  unapplied_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (unapplied_amount >= 0),
  cash_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  posted_journal_entry_id UUID REFERENCES accounting_journal_entries(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES billing_payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
  allocated_amount NUMERIC(18,2) NOT NULL CHECK (allocated_amount > 0),
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payment_id, invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON billing_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON billing_payments(customer_id);

-- -----------------------------
-- Production
-- -----------------------------
CREATE TABLE IF NOT EXISTS production_raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES inventory_products(id) ON DELETE CASCADE,
  standard_cost NUMERIC(18,4),
  preferred_vendor TEXT,
  lead_time_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finished_product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (finished_product_id, version_no)
);

CREATE TABLE IF NOT EXISTS production_bom_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES production_boms(id) ON DELETE CASCADE,
  raw_material_product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
  quantity_per_unit NUMERIC(18,4) NOT NULL CHECK (quantity_per_unit > 0),
  scrap_rate NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (scrap_rate >= 0),
  line_no INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bom_id, line_no)
);

CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no BIGSERIAL UNIQUE,
  finished_product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
  bom_id UUID REFERENCES production_boms(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES inventory_warehouses(id) ON DELETE SET NULL,
  planned_quantity NUMERIC(18,3) NOT NULL CHECK (planned_quantity > 0),
  produced_quantity NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (produced_quantity >= 0),
  order_status production_order_status NOT NULL DEFAULT 'planned',
  planned_start_at TIMESTAMPTZ,
  planned_end_at TIMESTAMPTZ,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  manufacturing_cost NUMERIC(18,2) NOT NULL DEFAULT 0,
  wip_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  variance_account_id UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  posted_journal_entry_id UUID REFERENCES accounting_journal_entries(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_order_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  raw_material_product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
  planned_quantity NUMERIC(18,4) NOT NULL CHECK (planned_quantity > 0),
  consumed_quantity NUMERIC(18,4) NOT NULL DEFAULT 0 CHECK (consumed_quantity >= 0),
  unit_cost NUMERIC(18,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (production_order_id, raw_material_product_id)
);

CREATE TABLE IF NOT EXISTS production_order_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
  quantity NUMERIC(18,3) NOT NULL CHECK (quantity > 0),
  warehouse_id UUID REFERENCES inventory_warehouses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_orders_status ON production_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_prod_orders_product ON production_orders(finished_product_id);

-- -----------------------------
-- Useful views
-- -----------------------------
CREATE OR REPLACE VIEW billing_customer_balances AS
SELECT
  c.id AS customer_id,
  c.customer_code,
  c.legal_name,
  COALESCE(SUM(i.total_amount), 0) AS invoiced_total,
  COALESCE(SUM(i.amount_paid), 0) AS paid_against_invoices,
  COALESCE(SUM(i.total_amount - i.amount_paid), 0) AS outstanding_balance
FROM crm_customers c
LEFT JOIN billing_invoices i ON i.customer_id = c.id AND i.status <> 'void'
GROUP BY c.id, c.customer_code, c.legal_name;

CREATE OR REPLACE VIEW inventory_available_stock AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  w.id AS warehouse_id,
  w.code AS warehouse_code,
  sl.quantity_on_hand,
  sl.quantity_reserved,
  (sl.quantity_on_hand - sl.quantity_reserved) AS quantity_available
FROM inventory_stock_levels sl
JOIN inventory_products p ON p.id = sl.product_id
JOIN inventory_warehouses w ON w.id = sl.warehouse_id;
