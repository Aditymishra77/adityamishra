import { postgres } from "../../shared/db/postgres";
import type {
  ActivityLogRecord,
  AuditTrailRecord,
  CreateNotificationPayload,
  NotificationRecord,
} from "./ops.types";

export class OpsRepository {
  async createNotification(payload: CreateNotificationPayload): Promise<NotificationRecord> {
    const result = await postgres.query<NotificationRecord>(
      `
      INSERT INTO notifications (user_id, notification_type, title, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [payload.userId, payload.type, payload.title, payload.message, payload.metadata ?? null],
    );

    return result.rows[0];
  }

  async listNotifications(userId: string): Promise<NotificationRecord[]> {
    const result = await postgres.query<NotificationRecord>(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
      `,
      [userId],
    );

    return result.rows;
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<NotificationRecord | null> {
    const result = await postgres.query<NotificationRecord>(
      `
      UPDATE notifications
      SET is_read = TRUE,
          read_at = NOW()
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [notificationId, userId],
    );

    return result.rows[0] ?? null;
  }

  async createActivityLog(payload: {
    userId?: string;
    entityType: string;
    entityId?: string;
    action: string;
    description: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    await postgres.query(
      `
      INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, metadata, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        payload.userId ?? null,
        payload.entityType,
        payload.entityId ?? null,
        payload.action,
        payload.description,
        payload.metadata ?? null,
        payload.ipAddress ?? null,
      ],
    );
  }

  async createAuditTrail(payload: {
    actorUserId?: string;
    actorRole?: "admin" | "manager" | "staff";
    action: string;
    entityType: string;
    entityId?: string;
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await postgres.query(
      `
      INSERT INTO audit_trails (
        actor_user_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        before_state,
        after_state,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        payload.actorUserId ?? null,
        payload.actorRole ?? null,
        payload.action,
        payload.entityType,
        payload.entityId ?? null,
        payload.beforeState ?? null,
        payload.afterState ?? null,
        payload.metadata ?? null,
      ],
    );
  }

  async listActivityLogs(): Promise<ActivityLogRecord[]> {
    const result = await postgres.query<ActivityLogRecord>(
      `
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 200
      `,
    );

    return result.rows;
  }

  async listAuditTrails(): Promise<AuditTrailRecord[]> {
    const result = await postgres.query<AuditTrailRecord>(
      `
      SELECT *
      FROM audit_trails
      ORDER BY created_at DESC
      LIMIT 200
      `,
    );

    return result.rows;
  }

  async findUsersByRoles(roles: Array<"admin" | "manager" | "staff">): Promise<Array<{ id: string }>> {
    const result = await postgres.query<{ id: string }>(
      `
      SELECT id
      FROM users
      WHERE role = ANY($1::user_role[])
      `,
      [roles],
    );

    return result.rows;
  }
}
