import { db } from "../db";
import { auditLogs } from "../db/schema";

export interface LogAuditParams {
  actorId?: string | null;
  actorRole?: "ADMIN" | "BUDDY" | "PARTICIPANT" | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
}

/**
 * Structured Audit Logger for all critical platform actions
 */
export async function logAudit(params: LogAuditParams) {
  try {
    await db.insert(auditLogs).values({
      actorId: params.actorId || null,
      actorRole: params.actorRole || null,
      action: params.action,
      targetType: params.targetType || null,
      targetId: params.targetId || null,
      details: params.details || null,
      ipAddress: params.ipAddress || null,
    });
  } catch (err) {
    console.error("[AuditLog Error] Failed to write audit log:", err);
  }
}
