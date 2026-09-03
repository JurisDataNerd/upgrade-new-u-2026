import { Elysia, t } from "elysia";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import { broadcastAdminEvent, broadcastAnnouncement } from "../realtime";

export interface EventSettings {
  activeDay: number;
  eventName: string;
  isLeaderboardFrozen: boolean;
  frozenAt: string | null;
  freezeMessage: string;
  isCampusQuestOpen: boolean;
  isOrmawaExpoOpen: boolean;
  isIncubationOpen: boolean;
  gateCheckInOpen: boolean;
  gateCheckOutOpen: boolean;
  updatedAt: string;
}

// Global In-Memory State untuk pengaturan event
let currentSettings: EventSettings = {
  activeDay: 1,
  eventName: "PKKMB UNU Yogyakarta 2026",
  isLeaderboardFrozen: false,
  frozenAt: null,
  freezeMessage: "Klasemen telah dibekukan panitia panggung menjelang Pengumuman Juara!",
  isCampusQuestOpen: true,
  isOrmawaExpoOpen: true,
  isIncubationOpen: true,
  gateCheckInOpen: true,
  gateCheckOutOpen: true,
  updatedAt: new Date().toISOString(),
};

export const getSystemSettings = (): EventSettings => ({ ...currentSettings });
export const isLeaderboardFrozen = (): boolean => currentSettings.isLeaderboardFrozen;

export const systemRoutes = new Elysia({
  prefix: "/api/system",
  detail: {
    tags: ["System & Event Controls"],
  },
})
  .use(authMiddleware)

  // GET /api/system/settings — Ambil konfigurasi status event saat ini
  .get(
    "/settings",
    () => {
      return {
        success: true,
        data: currentSettings,
      };
    },
    {
      detail: {
        summary: "Ambil pengaturan status event & freeze leaderboard",
        description: "Mengembalikan status hari aktif PKKMB, status freeze leaderboard, dan saklar gerbang pos.",
      },
    }
  )

  // PUT /api/system/settings — Update pengaturan event oleh Admin
  .put(
    "/settings",
    async ({ body }) => {
      currentSettings = {
        ...currentSettings,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      broadcastAdminEvent("SYSTEM_SETTINGS_UPDATED", {
        settings: currentSettings,
      });

      return {
        success: true,
        message: "Pengaturan event berhasil diperbarui!",
        data: currentSettings,
      };
    },
    {
      detail: {
        summary: "Update pengaturan status event PKKMB (Admin Only)",
        description: "Admin mengatur pergantian hari aktif, buka/tutup presensi gerbang, dan pembukaan wahana stan UKM.",
      },
      body: t.Object({
        activeDay: t.Optional(t.Number({ minimum: 1, maximum: 3 })),
        isCampusQuestOpen: t.Optional(t.Boolean()),
        isOrmawaExpoOpen: t.Optional(t.Boolean()),
        isIncubationOpen: t.Optional(t.Boolean()),
        gateCheckInOpen: t.Optional(t.Boolean()),
        gateCheckOutOpen: t.Optional(t.Boolean()),
      }),
    }
  )

  // POST /api/system/freeze-leaderboard — Bekukan leaderboard panggung menjelang Awarding
  .post(
    "/freeze-leaderboard",
    async ({ body }) => {
      const message = body?.freezeMessage || "Klasemen telah dibekukan panitia panggung menjelang Pengumuman Juara!";
      
      currentSettings.isLeaderboardFrozen = true;
      currentSettings.frozenAt = new Date().toISOString();
      currentSettings.freezeMessage = message;
      currentSettings.updatedAt = new Date().toISOString();

      // Broadcast ke proyektor panggung dan seluruh HP mahasiswa
      broadcastAnnouncement({
        title: "PEMBEKUAN KLASEMEN",
        message,
        severity: "CRITICAL",
      });
      broadcastAdminEvent("LEADERBOARD_FROZEN", {
        isFrozen: true,
        frozenAt: currentSettings.frozenAt,
        message,
      });

      return {
        success: true,
        message: "Leaderboard berhasil dibekukan! Tampilan proyektor panggung beralih ke mode tirai kompetisi.",
        data: currentSettings,
      };
    },
    {
      detail: {
        summary: "Bekukan leaderboard panggung (Freeze Mode)",
        description: "Membekukan ranking klasemen di proyektor panggung dan HP mahasiswa untuk menjaga kejutan juara awarding.",
      },
      body: t.Optional(
        t.Object({
          freezeMessage: t.Optional(t.String()),
        })
      ),
    }
  )

  // POST /api/system/unfreeze-leaderboard — Buka kembali pembekuan leaderboard
  .post(
    "/unfreeze-leaderboard",
    async () => {
      currentSettings.isLeaderboardFrozen = false;
      currentSettings.frozenAt = null;
      currentSettings.updatedAt = new Date().toISOString();

      broadcastAnnouncement({
        title: "KLASEMEN DIBUKA KEMBALI",
        message: "Klasemen leaderboard telah dibuka kembali!",
        severity: "SUCCESS",
      });
      broadcastAdminEvent("LEADERBOARD_UNFROZEN", {
        isFrozen: false,
      });

      return {
        success: true,
        message: "Pembekuan leaderboard telah dinonaktifkan. Ranking live kembali ditampilkan.",
        data: currentSettings,
      };
    },
    {
      detail: {
        summary: "Buka kembali pembekuan leaderboard (Unfreeze Mode)",
        description: "Mengembalikan leaderboard proyektor panggung dan HP maba ke pembaruan ranking real-time.",
      },
    }
  );
