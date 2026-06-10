import type { NextFunction, Request, Response } from "express";
import { InventoryService } from "./inventory.service";

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  addProduct = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.addProduct(request.body);
      response.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  };

  stockIn = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.stockIn(request.body, request.user?.sub);
      response.status(200).json({ message: "Stock-in completed." });
    } catch (error) {
      next(error);
    }
  };

  stockOut = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.stockOut(request.body, request.user?.sub);
      response.status(200).json({ message: "Stock-out completed." });
    } catch (error) {
      next(error);
    }
  };

  lowStockAlerts = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await this.service.getLowStockAlerts();
      response.status(200).json({ alerts });
    } catch (error) {
      next(error);
    }
  };
}
