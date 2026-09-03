import { Elysia, t } from "elysia";
import { verifyToken, type TokenPayload } from "../lib/jwt";
import { db } from "../db";
import { gameSessions, teamMembers } from "../db/schema";
import { eq, and } from "drizzle-orm";

// In-memory active connections map and pub/sub registry
interface WebSocketClient {
  user: TokenPayload | null;
  subscribedTopics: Set<string>;
}

const activeSockets = new Map<any, WebSocketClient>();

// Exportable broadcaster instance to allow REST routes to trigger realtime updates
let globalWsApp: any = null;

export const broadcastAnnouncement = (data: { title: string; message: string; severity?: string; broadcastBy?: string }) => {
  const payload = {
    title: data.title || "SIARAN PUSAT GAME MASTER",
    message: data.message,
    severity: data.severity || "INFO",
    broadcastBy: data.broadcastBy || "ADMIN",
    timestamp: new Date().toISOString(),
  };

  broadcastToTopic("leaderboard:global", "GLOBAL_ANNOUNCEMENT", payload);
  broadcastToTopic("announcements:global", "GLOBAL_ANNOUNCEMENT", payload);

  // Also broadcast unconditionally to all active websocket connections
  const rawMsg = JSON.stringify({
    event: "GLOBAL_ANNOUNCEMENT",
    topic: "announcements:global",
    data: payload,
    timestamp: new Date().toISOString(),
  });

  for (const [ws] of activeSockets.entries()) {
    try {
      ws.send(rawMsg);
    } catch {
      // ignore
    }
  }
};

export const broadcastToTopic = (topic: string, event: string, payload: any) => {
  const message = JSON.stringify({
    topic,
    event,
    data: payload,
    timestamp: new Date().toISOString(),
  });

  if (globalWsApp && typeof globalWsApp.server?.publish === "function") {
    globalWsApp.server.publish(topic, message);
  } else {
    // Fallback broadcast over active sockets
    for (const [ws, client] of activeSockets.entries()) {
      if (client.subscribedTopics.has(topic)) {
        try {
          ws.send(message);
        } catch {
          // ignore dead sockets
        }
      }
    }
  }
};

export const broadcastLeaderboardUpdate = (leaderboardData: any) => {
  broadcastToTopic("leaderboard:global", "LEADERBOARD_UPDATED", leaderboardData);
};

export const broadcastLocationOccupancy = (locationId: string, status: string, locationData?: any) => {
  broadcastToTopic(`location:${locationId}`, "LOCATION_OCCUPANCY_CHANGED", { locationId, status, ...locationData });
  broadcastToTopic("admin:feed", "LOCATION_STATUS_UPDATE", { locationId, status, ...locationData });
};

export const broadcastAdminEvent = (action: string, details: any) => {
  broadcastToTopic("admin:feed", "ADMIN_FEED_EVENT", { action, details, timestamp: new Date().toISOString() });
};

export const broadcastGameSessionEvent = (sessionId: string, event: string, payload: any) => {
  broadcastToTopic(`game-session:${sessionId}`, event, payload);
};

export const realtimeRoutes = new Elysia({ prefix: "/ws" })
  .ws("/", {
    // Query parameter token authentication
    query: t.Object({
      token: t.Optional(t.String()),
    }),

    async open(ws) {
      let user: TokenPayload | null = null;
      const token = ws.data.query.token;

      if (token) {
        try {
          user = await verifyToken(token);
        } catch {
          user = null;
        }
      }

      const defaultTopics = new Set<string>(["leaderboard:global", "announcements:global"]);
      if (user?.teamId) {
        defaultTopics.add(`team:${user.teamId}`);
      }

      activeSockets.set(ws, {
        user,
        subscribedTopics: defaultTopics,
      });

      if (typeof ws.subscribe === "function") {
        ws.subscribe("leaderboard:global");
        ws.subscribe("announcements:global");
        if (user?.teamId) {
          ws.subscribe(`team:${user.teamId}`);
        }
      }

      // Send Welcome & Handshake ack
      ws.send(
        JSON.stringify({
          event: "CONNECTED",
          data: {
            authenticated: !!user,
            user: user
              ? {
                  userId: user.userId,
                  role: user.role,
                  username: user.username,
                  teamId: user.teamId,
                }
              : null,
            serverTime: new Date().toISOString(),
          },
        })
      );
    },

    async message(ws, message: any) {
      const client = activeSockets.get(ws);
      if (!client) return;

      let parsed: any;
      try {
        parsed = typeof message === "string" ? JSON.parse(message) : message;
      } catch {
        ws.send(JSON.stringify({ event: "ERROR", error: "Format payload JSON tidak valid" }));
        return;
      }

      const { type, topic, token, data } = parsed;

      // 1. WebSocket Authentication
      if (type === "AUTH" && token) {
        try {
          const verified = await verifyToken(token);
          client.user = verified;
          ws.send(
            JSON.stringify({
              event: "AUTH_SUCCESS",
              data: {
                userId: verified.userId,
                role: verified.role,
                username: verified.username,
                teamId: verified.teamId,
              },
            })
          );
        } catch {
          ws.send(JSON.stringify({ event: "AUTH_FAILED", error: "Token tidak valid atau kedaluwarsa" }));
        }
        return;
      }

      // 2. Room / Topic Subscription (with Scoped Authorization check)
      if (type === "SUBSCRIBE" && topic) {
        const user = client.user;

        // Verify topic scope authorization
        let isAuthorized = true;

        if (topic === "admin:feed") {
          // Admin-only topic
          if (!user || user.role !== "ADMIN") {
            isAuthorized = false;
          }
        } else if (topic.startsWith("team:")) {
          // Scoped team topic: only members, their Buddy, or Admin
          const targetTeamId = topic.split(":")[1];
          if (!user || (user.role === "PARTICIPANT" && user.teamId !== targetTeamId)) {
            isAuthorized = false;
          }
        } else if (topic.startsWith("game-session:")) {
          // Game session topic
          const sessionId = topic.split(":")[1];
          if (user?.role === "PARTICIPANT") {
            const [session] = await db
              .select({ teamId: gameSessions.teamId })
              .from(gameSessions)
              .where(eq(gameSessions.id, sessionId))
              .limit(1);
            if (session && user.teamId && session.teamId !== user.teamId) {
              isAuthorized = false;
            }
          }
        }

        if (!isAuthorized) {
          ws.send(
            JSON.stringify({
              event: "SUBSCRIBE_FAILED",
              topic,
              error: "Akses ditolak: Anda tidak memiliki izin untuk topik ini (Scoped Rule)",
            })
          );
          return;
        }

        client.subscribedTopics.add(topic);
        if (typeof ws.subscribe === "function") {
          ws.subscribe(topic);
        }

        ws.send(
          JSON.stringify({
            event: "SUBSCRIBED",
            topic,
            timestamp: new Date().toISOString(),
          })
        );
        return;
      }

      // 3. Unsubscribe from Topic
      if (type === "UNSUBSCRIBE" && topic) {
        client.subscribedTopics.delete(topic);
        if (typeof ws.unsubscribe === "function") {
          ws.unsubscribe(topic);
        }
        ws.send(JSON.stringify({ event: "UNSUBSCRIBED", topic }));
        return;
      }

      // 4. Multiplayer Game Session Events
      if (type === "GAME_PLAYER_READY" && data?.sessionId) {
        const { sessionId, participantId, characterClass, isReady } = data;
        broadcastToTopic(`game-session:${sessionId}`, "PLAYER_READY_STATUS", {
          participantId: participantId || client.user?.userId,
          characterClass,
          isReady: isReady !== false,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (type === "GAME_START_COUNTDOWN" && data?.sessionId) {
        const { sessionId, countdownSec = 3 } = data;
        broadcastToTopic(`game-session:${sessionId}`, "GAME_COUNTDOWN", {
          sessionId,
          countdownSec,
          serverStartAt: new Date(Date.now() + countdownSec * 1000).toISOString(),
        });
        return;
      }

      if (type === "GAME_ANSWER_SUBMITTED" && data?.sessionId) {
        const { sessionId, participantId, action, answerIndex } = data;
        broadcastToTopic(`game-session:${sessionId}`, "TEAM_ANSWER_FEEDBACK", {
          participantId: participantId || client.user?.userId,
          action,
          answerIndex,
          timestamp: Date.now(),
        });
        return;
      }

      // 5. Ping/Pong Heartbeat for Reconnection State Sync
      if (type === "PING") {
        ws.send(
          JSON.stringify({
            event: "PONG",
            serverTime: new Date().toISOString(),
            subscribedTopics: Array.from(client.subscribedTopics),
          })
        );
        return;
      }
    },

    close(ws) {
      activeSockets.delete(ws);
    },
  });

export const setGlobalWsApp = (appInstance: any) => {
  globalWsApp = appInstance;
};
