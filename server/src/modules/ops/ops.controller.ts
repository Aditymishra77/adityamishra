import type { NextFunction, Request, Response } from "express";
import { OpsService } from "./ops.service";

export class OpsController {
  constructor(private readonly service: OpsService) {}

  createNotification = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await this.service.createNotification(request.body);
      response.status(201).json({ notification });
    } catch (error) {
      next(error);
    }
  };

  listNotifications = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = request.user?.sub;

      if (!userId) {
        throw new Error("Unauthorized");
      }

      const notifications = await this.service.listNotifications(userId);
      response.status(200).json({ notifications });
    } catch (error) {
      next(error);
    }
  };

  markNotificationAsRead = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = request.user?.sub;

      if (!userId) {
        throw new Error("Unauthorized");
      }

      const notification = await this.service.markNotificationAsRead(request.params.notificationId, userId);
      response.status(200).json({ notification });
    } catch (error) {
      next(error);
    }
  };

  listActivityLogs = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.service.listActivityLogs();
      response.status(200).json({ logs });
    } catch (error) {
      next(error);
    }
  };

  listAuditTrails = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const audits = await this.service.listAuditTrails();
      response.status(200).json({ audits });
    } catch (error) {
      next(error);
    }
  };
}
