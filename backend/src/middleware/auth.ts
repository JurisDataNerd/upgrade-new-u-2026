import { Elysia } from "elysia";
import { verifyToken, type TokenPayload } from "../lib/jwt";
import { db } from "../db";
import { teamMembers } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Parses JWT token from either 'Authorization: Bearer <token>' header or 'auth_token' cookie.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive({ as: "scoped" }, async ({ request, cookie }) => {
    let token: string | null = null;

    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (cookie && typeof cookie.auth_token?.value === "string") {
      token = cookie.auth_token.value;
    } else {
      // Fallback parse cookie from header string if cookie object is not present
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/auth_token=([^;]+)/);
        if (match) token = match[1];
      }
    }

    if (!token) {
      return { user: null as TokenPayload | null };
    }

    try {
      const payload = await verifyToken(token);
      return { user: payload as TokenPayload | null };
    } catch {
      return { user: null as TokenPayload | null };
    }
  });

/**
 * Restricts access to authenticated users only.
 */
export const requireUser = new Elysia({ name: "require-user" })
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } };
    }
  });

/**
 * Restricts access to ADMIN role only.
 */
export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } };
    }
    if (user.role !== "ADMIN") {
      set.status = 403;
      return { success: false, error: { code: "FORBIDDEN", message: "Admin permission required" } };
    }
  });

/**
 * Restricts access to BUDDY or ADMIN roles.
 */
export const requireBuddyOrAdmin = new Elysia({ name: "require-buddy-or-admin" })
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } };
    }
    if (user.role !== "ADMIN" && user.role !== "BUDDY") {
      set.status = 403;
      return { success: false, error: { code: "FORBIDDEN", message: "Buddy or Admin permission required" } };
    }
  });

/**
 * Validates that a Buddy can only perform actions on their assigned team (Admins bypass this restriction).
 */
export async function validateBuddyTeamScope(user: TokenPayload | null, targetTeamId: string): Promise<boolean> {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role !== "BUDDY") return false;

  const [membership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.userId))
    .limit(1);

  return Boolean(membership && membership.teamId === targetTeamId);
}
