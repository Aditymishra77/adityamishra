import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { BillingController } from "./billing.controller";
import { BillingRepository } from "./billing.repository";
import { BillingService } from "./billing.service";

const repository = new BillingRepository();
const service = new BillingService(repository);
const controller = new BillingController(service);

export const billingRouter = Router();

billingRouter.post("/invoices", authMiddleware, controller.createInvoice);
billingRouter.get("/invoices/:invoiceId/pdf", authMiddleware, controller.exportInvoicePdf);
