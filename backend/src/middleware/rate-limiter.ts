import { Elysia } from "elysia";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

// Cleanup stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipBuckets.entries()) {
    if (now > record.resetAt) {
      ipBuckets.delete(key);
    }
  }
}, 300000);

export const rateLimiter = new Elysia({ name: "rate-limiter" }).onBeforeHandle(
  ({ request, set }) => {
    const url = new URL(request.url);
    const path = url.pathname;

    // Skip health checks
    if (path === "/" || path === "/api/health") {
      return;
    }

    // Determine client identifier (IP address from headers)
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    const now = Date.now();
    const windowMs = 60000; // 1 minute window

    // Specific rate limits per path type
    let maxRequests = 120; // 120 req/min general default
    if (path.startsWith("/api/auth/login")) {
      maxRequests = 20; // 20 login attempts/min
    } else if (path.includes("/scores") || path.includes("/game-sessions/complete")) {
      maxRequests = 40; // 40 score submissions/min
    }

    const bucketKey = `${clientIp}:${path.startsWith("/api/auth") ? "auth" : "api"}`;
    let record = ipBuckets.get(bucketKey);

    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      ipBuckets.set(bucketKey, record);
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
