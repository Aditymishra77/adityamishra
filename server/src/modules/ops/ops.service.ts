import { OpsRepository } from "./ops.repository";
import type { ActivityLogRecord, AuditTrailRecord, CreateNotificationPayload, NotificationRecord } from "./ops.types";

export class OpsService {
  constructor(private readonly repository: OpsRepository) {}

  createNotification(payload: CreateNotificationPayload): Promise<NotificationRecord> {
    return this.repository.createNotification(payload);
  }

  async createNotificationForRoles(
    roles: Array<"admin" | "manager" | "staff">,
    payload: Omit<CreateNotificationPayload, "userId">,
  ): Promise<void> {
    const users = await this.repository.findUsersByRoles(roles);

    for (const user of users) {
      await this.repository.createNotification({ ...payload, userId: user.id });
    }
  }

  listNotifications(userId: string): Promise<NotificationRecord[]> {
    return this.repository.listNotifications(userId);
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<NotificationRecord> {
    const notification = await this.repository.markNotificationAsRead(notificationId, userId);

    if (!notification) {
      throw new Error("Notification not found.");
    }

    return notification;
  }

  logActivity(payload: Parameters<OpsRepository["createActivityLog"]>[0]): Promise<void> {
    return this.repository.createActivityLog(payload);
  }

  logAudit(payload: Parameters<OpsRepository["createAuditTrail"]>[0]): Promise<void> {
    return this.repository.createAuditTrail(payload);
  }

  listActivityLogs(): Promise<ActivityLogRecord[]> {
    return this.repository.listActivityLogs();
  }

  listAuditTrails(): Promise<AuditTrailRecord[]> {
    return this.repository.listAuditTrails();
  }
}
