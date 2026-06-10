import { BillingRepository } from "./billing.repository";
import { generateInvoicePdf } from "../../shared/utils/pdf";
import { OpsRepository } from "../ops/ops.repository";
import { OpsService } from "../ops/ops.service";
import type {
  ComputedInvoiceLine,
  CreateInvoicePayload,
  InvoiceRecord
} from "./billing.types";

export class BillingService {
  private readonly opsService: OpsService;

  constructor(private readonly repository: BillingRepository) {
    this.opsService = new OpsService(new OpsRepository());
  }

  async createInvoice(payload: CreateInvoicePayload, createdBy?: string, actorRole?: "admin" | "manager" | "staff"): Promise<InvoiceRecord> {
    this.validatePayload(payload);

    const computedLines = payload.lines.map((line) => this.computeLine(line));

    const subtotal = computedLines.reduce((sum, line) => sum + line.lineSubtotal, 0);
    const taxTotal = computedLines.reduce((sum, line) => sum + line.lineTax, 0);
    const totalAmount = subtotal + taxTotal;

    const invoice = await this.repository.createInvoice(
      payload,
      computedLines,
      {
        subtotal: this.round(subtotal),
        taxTotal: this.round(taxTotal),
        totalAmount: this.round(totalAmount),
      },
      createdBy,
    );

    await this.opsService.createNotificationForRoles(["admin", "manager"], {
      type: "invoice_posted",
      title: "Invoice posted",
      message: `Invoice ${invoice.invoice_no} has been created and posted to accounting.`,
      metadata: {
        invoiceId: invoice.id,
        postedJournalEntryId: invoice.posted_journal_entry_id,
      },
    });

    await this.opsService.logActivity({
      userId: createdBy,
      entityType: "billing_invoice",
      entityId: invoice.id,
      action: "create_and_post",
      description: `Invoice ${invoice.invoice_no} created and accounting entry posted`,
      metadata: {
        customerId: invoice.customer_id,
        totalAmount: invoice.total_amount,
      },
    });

    await this.opsService.logAudit({
      actorUserId: createdBy,
      actorRole: actorRole ?? "staff",
      action: "invoice_posted",
      entityType: "billing_invoice",
      entityId: invoice.id,
      afterState: {
        status: invoice.status,
        totalAmount: invoice.total_amount,
        postedJournalEntryId: invoice.posted_journal_entry_id,
      },
    });

    return invoice;
  }

  async exportInvoicePdf(invoiceId: string): Promise<{ fileName: string; data: Buffer }> {
    const details = await this.repository.getInvoiceWithLines(invoiceId);

    if (!details) {
      throw new Error("Invoice not found.");
    }

    const displayNumber = this.formatInvoiceNumber(details.invoice.invoice_no);
    const pdf = generateInvoicePdf(details, displayNumber);

    return {
      fileName: `${displayNumber}.pdf`,
      data: pdf,
    };
  }

  private validatePayload(payload: CreateInvoicePayload): void {
    if (!payload.customerId) {
      throw new Error("customerId is required.");
    }

    if (!payload.invoiceDate || !payload.dueDate) {
      throw new Error("invoiceDate and dueDate are required.");
    }

    if (!payload.lines?.length) {
      throw new Error("At least one invoice line is required.");
    }

    for (const line of payload.lines) {
      if (!line.description?.trim()) {
        throw new Error("Each line must include description.");
      }

      if (line.quantity <= 0 || line.unitPrice < 0) {
        throw new Error("Line quantity must be > 0 and unitPrice must be >= 0.");
      }

      if (line.gstRate < 0) {
        throw new Error("GST rate cannot be negative.");
      }
    }
  }

  private computeLine(line: CreateInvoicePayload["lines"][number]): ComputedInvoiceLine {
    const lineSubtotal = this.round(line.quantity * line.unitPrice);
    const lineTax = this.round((lineSubtotal * line.gstRate) / 100);
    const lineTotal = this.round(lineSubtotal + lineTax);

    return {
      ...line,
      lineSubtotal,
      lineTax,
      lineTotal,
    };
  }

  private formatInvoiceNumber(invoiceNo: string): string {
    const numeric = Number(invoiceNo);
    return `INV-${numeric.toString().padStart(6, "0")}`;
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
