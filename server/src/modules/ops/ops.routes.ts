import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { requireRoles } from "../../shared/middlewares/rbac.middleware";
import { OpsController } from "./ops.controller";
import { OpsRepository } from "./ops.repository";
import { OpsService } from "./ops.service";

const repository = new OpsRepository();
const service = new OpsService(repository);
const controller = new OpsController(service);

export const opsRouter = Router();

opsRouter.get("/notifications", authMiddleware, controller.listNotifications);
opsRouter.patch("/notifications/:notificationId/read", authMiddleware, controller.markNotificationAsRead);

opsRouter.post(
  "/notifications",
  authMiddleware,
  requireRoles("admin", "manager"),
  controller.createNotification,
);
opsRouter.get("/activity-logs", authMiddleware, requireRoles("admin", "manager"), controller.listActivityLogs);
opsRouter.get("/audit-trails", authMiddleware, requireRoles("admin"), controller.listAuditTrails);
