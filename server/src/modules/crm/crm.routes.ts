import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { CrmController } from "./crm.controller";
import { CrmRepository } from "./crm.repository";
import { CrmService } from "./crm.service";

const repository = new CrmRepository();
const service = new CrmService(repository);
const controller = new CrmController(service);

export const crmRouter = Router();

crmRouter.post("/leads", authMiddleware, controller.createLead);
crmRouter.patch("/leads/:leadId", authMiddleware, controller.updateLead);
crmRouter.post("/leads/:leadId/convert", authMiddleware, controller.convertLead);

crmRouter.get("/leads/:leadId/ai-suggestion", authMiddleware, controller.getLeadSuggestion);
