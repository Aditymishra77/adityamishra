import type { NextFunction, Request, Response } from "express";
import { CrmService } from "./crm.service";

export class CrmController {
  constructor(private readonly service: CrmService) {}

  createLead = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.createLead(request.body, request.user?.sub, request.user?.role);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateLead = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const lead = await this.service.updateLead(request.params.leadId, request.body);
      response.status(200).json({ lead });
    } catch (error) {
      next(error);
    }
  };

  convertLead = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const customer = await this.service.convertLeadToCustomer(request.params.leadId, request.body ?? {});
      response.status(201).json({ customer });
    } catch (error) {
      next(error);
    }
  };

  getLeadSuggestion = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const suggestion = await this.service.getLeadSuggestion(request.params.leadId);
      response.status(200).json({ suggestion });
    } catch (error) {
      next(error);
    }
  };

}
