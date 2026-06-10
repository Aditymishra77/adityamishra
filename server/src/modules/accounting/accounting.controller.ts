import type { NextFunction, Request, Response } from "express";
import { AccountingService } from "./accounting.service";

export class AccountingController {
  constructor(private readonly service: AccountingService) {}

  createJournalEntry = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.createJournalEntry(request.body, request.user?.sub);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getLedger = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const ledger = await this.service.getLedger({
        accountId: this.getStringQuery(request.query.accountId),
        fromDate: this.getStringQuery(request.query.fromDate),
        toDate: this.getStringQuery(request.query.toDate),
      });

      response.json({ rows: ledger, count: ledger.length });
    } catch (error) {
      next(error);
    }
  };

  private getStringQuery(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
  }
}
