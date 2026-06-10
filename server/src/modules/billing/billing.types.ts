export interface CreateInvoiceLineInput {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export interface CreateInvoicePayload {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  currencyCode?: string;
  notes?: string;
  lines: CreateInvoiceLineInput[];
}

export interface ComputedInvoiceLine extends CreateInvoiceLineInput {
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface InvoiceRecord {
  id: string;
  invoice_no: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  status: "draft" | "issued" | "partially_paid" | "paid" | "void";
  currency_code: string;
  subtotal: string;
  tax_total: string;
  total_amount: string;
  amount_paid: string;
  notes: string | null;
  ar_account_id: string | null;
  revenue_account_id: string | null;
  posted_journal_entry_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceLineRecord {
  id: string;
  invoice_id: string;
  line_no: number;
  product_id: string | null;
  description: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  line_total: string;
}

export interface InvoiceWithLines {
  invoice: InvoiceRecord;
  customer: {
    id: string;
    customer_code: string;
    legal_name: string;
    billing_email: string | null;
  };
  lines: InvoiceLineRecord[];
}
