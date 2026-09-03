import { Elysia, t } from "elysia";
import { db } from "../db";
import { auditLogs, users } from "../db/schema";
import { eq, sql, desc, and, or, ilike } from "drizzle-orm";
import { requireAdmin, authMiddleware } from "../middleware/auth";

export const auditLogRoutes = new Elysia({
  prefix: "/api/audit-logs",
  detail: {
    tags: ["Audit Logs & Security"],
  },
})
  .use(authMiddleware)
  .use(requireAdmin)

  // GET /api/audit-logs — List structured audit logs
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const actorId = query.actorId || "";
    const action = query.action || "";
    const targetType = query.targetType || "";
    const search = query.search?.trim();

    let q = db
      .select({
        id: auditLogs.id,
        actorId: auditLogs.actorId,
        actorName: users.fullName,
        actorUsername: users.username,
        actorRole: auditLogs.actorRole,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        targetId: auditLogs.targetId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .$dynamic();

    const conditions = [];
    if (actorId) conditions.push(eq(auditLogs.actorId, actorId));
    if (action) conditions.push(eq(auditLogs.action, action));
    if (targetType) conditions.push(eq(auditLogs.targetType, targetType));
    if (search) {
      conditions.push(
        or(
          ilike(auditLogs.action, `%${search}%`),
          ilike(auditLogs.targetType, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      q = q.where(and(...conditions));
    }

    const data = await q.orderBy(desc(auditLogs.createdAt)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(auditLogs);

    return {
      success: true,
      data,
      meta: { page, pageSize, total: Number(count) },
    };
  });
