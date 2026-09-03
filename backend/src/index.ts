import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { rateLimiter } from "./middleware/rate-limiter";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { teamRoutes } from "./routes/teams";
import { stageRoutes } from "./routes/stages";
import { floorRoutes } from "./routes/floors";
import { locationRoutes } from "./routes/locations";
import { routeRoutes } from "./routes/routes";
import { missionRoutes } from "./routes/missions";
import { gameRoutes } from "./routes/games";
import { gameSessionRoutes } from "./routes/game-sessions";
import { questionRoutes } from "./routes/questions";
import { leaderboardRoutes } from "./routes/leaderboard";
import { scoreRoutes } from "./routes/scores";
import { achievementRoutes } from "./routes/achievements";
import { auditLogRoutes } from "./routes/audit-logs";
import { monitoringRoutes } from "./routes/monitoring";
import { aiRoutes } from "./routes/ai";
import { incubationRoutes } from "./routes/incubation";
import { attendanceRoutes } from "./routes/attendance";
import { fgdRoutes } from "./routes/fgd";
import { realtimeRoutes, setGlobalWsApp } from "./realtime";
import { swagger } from "@elysiajs/swagger";

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const app = new Elysia()
  // Global CORS configuration for campus LAN & Admin dev server
  .use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    })
  )

  // Rate Limiter
  .use(rateLimiter)

  // OpenAPI & Scalar API Reference Documentation
  .use(
    swagger({
      provider: "scalar",
      path: "/swagger",
      documentation: {
        info: {
          title: "GENIUS UNU 2026 API Documentation",
          version: "1.0.0",
          description: "Dokumentasi Resmi RESTful API & Realtime Gamifikasi PKKMB UNU Yogyakarta 2026",
        },
        tags: [
          { name: "Auth", description: "Otentikasi & Sesi Pengguna" },
          { name: "Attendance", description: "Presensi Digital Gerbang Masuk & Pulang" },
          { name: "FGD Evaluation", description: "Rubrik Penilaian Buddy 3 Pilar" },
          { name: "Scores", description: "Pencatatan Transaksi Skor & XP" },
          { name: "Floors", description: "Denah 9 Lantai & Pos Kampus" },
          { name: "Leaderboard", description: "Papan Peringkat Realtime" },
          { name: "Teams", description: "Regu & Kelompok Mahasiswa" },
          { name: "Games", description: "Katalog Mini-Game & Sesi Permainan" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    })
  )

  // Alias /reference to redirect to /swagger
  .get("/reference", ({ set }) => {
    set.redirect = "/swagger";
  })

  // Realtime Native WebSocket
  .use(realtimeRoutes)

  // Health check & Version
  .get("/", () => ({
    name: "GENIUS 2026 Gamification API",
    version: "1.0.0",
    status: "online",
    university: "Universitas Nahdlatul Ulama Yogyakarta",
  }))
  .get("/api/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))

  // Mount API modules
  .use(authRoutes)
  .use(userRoutes)
  .use(teamRoutes)
  .use(stageRoutes)
  .use(floorRoutes)
  .use(locationRoutes)
  .use(routeRoutes)
  .use(missionRoutes)
  .use(gameRoutes)
  .use(gameSessionRoutes)
  .use(questionRoutes)
  .use(leaderboardRoutes)
  .use(scoreRoutes)
  .use(achievementRoutes)
  .use(auditLogRoutes)
  .use(aiRoutes)
  .use(monitoringRoutes)
  .use(incubationRoutes)
  .use(attendanceRoutes)
  .use(fgdRoutes)

  // Global Structured Error Handler
  .onError(({ code, error, set, request }) => {
    console.error(`[API Error] ${code}:`, error);
    const path = new URL(request.url).pathname;
    const timestamp = new Date().toISOString();

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Resource tidak ditemukan" },
        path,
        timestamp,
      };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      const msg = typeof (error as any)?.message === "string" ? (error as any).message : "Validasi input gagal";
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: msg, details: (error as any)?.all || null },
        path,
        timestamp,
      };
    }

    if (code === "PARSE") {
      set.status = 400;
      return {
        success: false,
        error: { code: "PARSE_ERROR", message: "Format payload JSON tidak valid" },
        path,
        timestamp,
      };
    }

    set.status = 500;
    const msg = typeof (error as any)?.message === "string" ? (error as any).message : "Terjadi kesalahan internal server";
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: msg,
      },
      path,
      timestamp,
    };
  })

  // Start HTTP & WebSocket Listener
  .listen({ port: Number(PORT), hostname: HOST }, (serverInstance) => {
    console.log(`🚀 GENIUS 2026 Backend running at http://${serverInstance.hostname}:${serverInstance.port}`);
    console.log(`⚡ WebSocket Server listening on ws://${serverInstance.hostname}:${serverInstance.port}/ws`);
    console.log(`📊 Health check available at http://${serverInstance.hostname}:${serverInstance.port}/api/health`);
  });

setGlobalWsApp(app);

export { app };
export type App = typeof app;
