import type { PoolClient } from "pg";
import { postgres } from "../../shared/db/postgres";
import type {
  ComputedInvoiceLine,
  CreateInvoicePayload,
  InvoiceLineRecord,
  InvoiceRecord,
  InvoiceWithLines,
} from "./billing.types";

interface CreateInvoiceTotals {
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
}

interface CustomerSummary {
  id: string;
  customer_code: string;
  legal_name: string;
  billing_email: string | null;
  receivable_account_id: string | null;
}

interface AccountSummary {
  id: string;
}

interface JournalEntrySummary {
  id: string;
}

export class BillingRepository {
  async createInvoice(
    payload: CreateInvoicePayload,
    lines: ComputedInvoiceLine[],
    totals: CreateInvoiceTotals,
    createdBy?: string,
  ): Promise<InvoiceRecord> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const invoiceResult = await client.query<InvoiceRecord>(
        `
        INSERT INTO billing_invoices (
          customer_id,
          invoice_date,
          due_date,
          status,
          currency_code,
          subtotal,
          tax_total,
          total_amount,
          amount_paid,
          notes,
          created_by
        ) VALUES ($1, $2, $3, 'issued', $4, $5, $6, $7, 0, $8, $9)
        RETURNING *
        `,
        [
          payload.customerId,
          payload.invoiceDate,
          payload.dueDate,
          payload.currencyCode ?? "INR",
          totals.subtotal,
          totals.taxTotal,
          totals.totalAmount,
          payload.notes ?? null,
          createdBy ?? null,
        ],
      );

      let invoice = invoiceResult.rows[0];

      for (const [index, line] of lines.entries()) {
        await client.query(
          `
          INSERT INTO billing_invoice_lines (
            invoice_id,
            line_no,
            product_id,
            description,
            quantity,
            unit_price,
            tax_rate,
            line_total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            invoice.id,
            index + 1,
            line.productId ?? null,
            line.description,
            line.quantity,
            line.unitPrice,
            line.gstRate,
            line.lineTotal,
          ],
        );
      }

      invoice = await this.postInvoiceAccounting(client, invoice, createdBy);

      await client.query("COMMIT");
      return invoice;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getInvoiceWithLines(invoiceId: string): Promise<InvoiceWithLines | null> {
    const invoiceResult = await postgres.query<InvoiceRecord>(
      "SELECT * FROM billing_invoices WHERE id = $1 LIMIT 1",
      [invoiceId],
    );

    const invoice = invoiceResult.rows[0] ?? null;

    if (!invoice) {
      return null;
    }

    const customerResult = await postgres.query<CustomerSummary>(
      "SELECT id, customer_code, legal_name, billing_email, receivable_account_id FROM crm_customers WHERE id = $1 LIMIT 1",
      [invoice.customer_id],
    );

    const customer = customerResult.rows[0] ?? null;

    if (!customer) {
      return null;
    }

    const linesResult = await postgres.query<InvoiceLineRecord>(
      "SELECT * FROM billing_invoice_lines WHERE invoice_id = $1 ORDER BY line_no ASC",
      [invoiceId],
    );

    return {
      invoice,
      customer,
      lines: linesResult.rows,
    };
  }

  private async postInvoiceAccounting(client: PoolClient, invoice: InvoiceRecord, createdBy?: string): Promise<InvoiceRecord> {
    const customerResult = await client.query<CustomerSummary>(
      "SELECT id, customer_code, legal_name, billing_email, receivable_account_id FROM crm_customers WHERE id = $1 LIMIT 1",
      [invoice.customer_id],
    );

    const customer = customerResult.rows[0];

    if (!customer) {
      throw new Error("Customer not found for invoice posting.");
    }

    const arAccountId = customer.receivable_account_id ?? (await this.findAccountIdByType(client, "asset"));
    const revenueAccountId = await this.findAccountIdByType(client, "revenue");

    const journalEntry = await client.query<JournalEntrySummary>(
      `
      INSERT INTO accounting_journal_entries (
        entry_date,
        reference_type,
        reference_id,
        memo,
        created_by
      ) VALUES ($1, 'billing_invoice', $2, $3, $4)
      RETURNING id
      `,
      [invoice.invoice_date, invoice.id, `Invoice ${invoice.invoice_no} posted`, createdBy ?? null],
    );

    const journalEntryId = journalEntry.rows[0].id;
    const totalAmount = Number(invoice.total_amount);

    await client.query(
      `
      INSERT INTO accounting_journal_lines (
        journal_entry_id,
        account_id,
        description,
        debit,
        credit
      ) VALUES
        ($1, $2, $3, $4, 0),
        ($1, $5, $6, 0, $4)
      `,
      [
        journalEntryId,
        arAccountId,
        `Invoice ${invoice.invoice_no} receivable`,
        totalAmount,
        revenueAccountId,
        `Invoice ${invoice.invoice_no} revenue`,
      ],
    );

    const invoiceUpdate = await client.query<InvoiceRecord>(
      `
      UPDATE billing_invoices
      SET posted_journal_entry_id = $1,
          ar_account_id = $2,
          revenue_account_id = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [journalEntryId, arAccountId, revenueAccountId, invoice.id],
    );

    return invoiceUpdate.rows[0];
  }

  private async findAccountIdByType(client: PoolClient, type: "asset" | "revenue"): Promise<string> {
    const result = await client.query<AccountSummary>(
      `
      SELECT id
      FROM accounting_accounts
      WHERE account_type = $1
        AND is_active = TRUE
      ORDER BY code ASC
      LIMIT 1
      `,
      [type],
    );

    const accountId = result.rows[0]?.id;

    if (!accountId) {
      throw new Error(`No active ${type} account configured in accounting_accounts.`);
    }

    return accountId;
  }
}
