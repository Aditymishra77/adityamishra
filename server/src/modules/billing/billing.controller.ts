import type { NextFunction, Request, Response } from "express";
import { BillingService } from "./billing.service";

export class BillingController {
  constructor(private readonly service: BillingService) {}

  createInvoice = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await this.service.createInvoice(request.body, request.user?.sub, request.user?.role);
      response.status(201).json({
        invoice,
        invoiceNumber: `INV-${Number(invoice.invoice_no).toString().padStart(6, "0")}`,
      });
    } catch (error) {
      next(error);
    }
  };

  exportInvoicePdf = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.exportInvoicePdf(request.params.invoiceId);

      response.setHeader("Content-Type", "application/pdf");
      response.setHeader("Content-Disposition", `attachment; filename=\"${result.fileName}\"`);
      response.status(200).send(result.data);
    } catch (error) {
      next(error);
    }
  };
}
