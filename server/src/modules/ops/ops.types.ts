export interface NotificationRecord {
  id: string;
  user_id: string;
  notification_type: "lead_assignment" | "invoice_posted" | "system_alert" | "task";
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: Date;
  read_at: Date | null;
}

export interface ActivityLogRecord {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  description: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
}

export interface AuditTrailRecord {
  id: string;
  actor_user_id: string | null;
  actor_role: "admin" | "manager" | "staff" | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationRecord["notification_type"];
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}
