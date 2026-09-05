import { Elysia } from "elysia";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitRecord>();

// Cleanup stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of buckets.entries()) {
    if (now > record.resetAt) {
      buckets.delete(key);
    }
  }
}, 300000);

export const rateLimiter = new Elysia({ name: "rate-limiter" }).onBeforeHandle(
  ({ request, set }) => {
    // If rate limiting is explicitly disabled
    if (process.env.RATE_LIMIT_DISABLED === "true") {
      return;
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Skip health checks, swagger documentation, and static files
    if (
      path === "/" ||
      path === "/api/health" ||
      path.startsWith("/swagger") ||
      path.startsWith("/reference")
    ) {
      return;
    }

    const isCampusNatMode = process.env.CAMPUS_NAT_MODE === "true";

    // 1. Identify client: prioritize Bearer token (per-student bucket) over IP (NAT shared bucket)
    const authHeader = request.headers.get("authorization");
    let clientIdentifier: string;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Use token suffix/hash for distinct user-based quota even on shared NAT IP
      const token = authHeader.substring(7).trim();
      clientIdentifier = `user:${token.slice(-16)}`;
    } else {
      // Fallback to IP address
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "unknown-ip";
      clientIdentifier = `ip:${clientIp}`;
    }

    const now = Date.now();
    const windowMs = 60000; // 1 minute window

    // Specific rate limits per path type (NAT-aware scaling)
    let maxRequests = isCampusNatMode ? 3000 : 180; // General API calls per minute
    if (path.startsWith("/api/auth/login")) {
      maxRequests = isCampusNatMode ? 300 : 30; // Login attempts per minute
    } else if (path.includes("/scores") || path.includes("/game-sessions/complete") || path.includes("/ormawa/scan")) {
      maxRequests = isCampusNatMode ? 600 : 60; // Score & scan submissions per minute
    }

    const bucketKey = `${clientIdentifier}:${path.startsWith("/api/auth") ? "auth" : "api"}`;
    let record = buckets.get(bucketKey);

    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      buckets.set(bucketKey, record);
      return;
    }

    record.count++;

    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      set.status = 429;
      set.headers["Retry-After"] = String(retryAfterSec);
      return {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Terlalu banyak permintaan. Silakan tunggu ${retryAfterSec} detik.`,
        },
      };
    }
  }
);

