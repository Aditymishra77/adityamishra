import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { AccountingRepository } from "./accounting.repository";
import { AccountingService } from "./accounting.service";
import { AccountingController } from "./accounting.controller";

const repository = new AccountingRepository();
const service = new AccountingService(repository);
const controller = new AccountingController(service);

export const accountingRouter = Router();

accountingRouter.post("/journal-entries", authMiddleware, controller.createJournalEntry);
accountingRouter.get("/ledger", authMiddleware, controller.getLedger);
