import type { InvoiceWithLines } from "../../modules/billing/billing.types";

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(lines: string[]): Buffer {
  const textOperations = lines
    .map((line, index) => `1 0 0 1 50 ${790 - index * 18} Tm (${escapePdfText(line)}) Tj`)
    .join("\n");

  const contentStream = `BT\n/F1 12 Tf\n${textOperations}\nET`;

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf-8");
}

export function generateInvoicePdf(data: InvoiceWithLines, displayNumber: string): Buffer {
  const totals = {
    subtotal: Number(data.invoice.subtotal).toFixed(2),
    tax: Number(data.invoice.tax_total).toFixed(2),
    total: Number(data.invoice.total_amount).toFixed(2),
  };

  const lines = [
    "TAX INVOICE",
    `Invoice No: ${displayNumber}`,
    `Invoice Date: ${data.invoice.invoice_date}`,
    `Due Date: ${data.invoice.due_date}`,
    `Customer: ${data.customer.legal_name}`,
    `Customer Code: ${data.customer.customer_code}`,
    "",
    "Items:",
    "Description | Qty | Unit Price | GST% | Line Total",
    ...data.lines.map(
      (line) =>
        `${line.description.slice(0, 30)} | ${line.quantity} | ${line.unit_price} | ${line.tax_rate} | ${line.line_total}`,
    ),
    "",
    `Subtotal: ${totals.subtotal} ${data.invoice.currency_code}`,
    `GST Total: ${totals.tax} ${data.invoice.currency_code}`,
    `Grand Total: ${totals.total} ${data.invoice.currency_code}`,
  ];

  return buildPdf(lines);
}
