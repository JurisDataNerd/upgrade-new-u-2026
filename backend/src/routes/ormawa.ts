import { Elysia, t } from "elysia";
import { db } from "../db";
import { ormawaBooths, ormawaScans, users, teams, teamMembers, scoreTransactions, floors } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

export const ormawaRoutes = new Elysia({
  prefix: "/api/ormawa",
  detail: {
    tags: ["Ormawa & UKM Expo"],
  },
})
  .use(authMiddleware)

  // GET /api/ormawa/booths — Ambil daftar seluruh stan UKM & Ormawa
  .get(
    "/booths",
    async ({ query }) => {
      const category = query.category;

      let q = db
        .select({
          id: ormawaBooths.id,
          code: ormawaBooths.code,
          name: ormawaBooths.name,
          shortName: ormawaBooths.shortName,
          category: ormawaBooths.category,
          floorId: ormawaBooths.floorId,
          floorNumber: floors.number,
          floorName: floors.name,
          boothNumber: ormawaBooths.boothNumber,
          description: ormawaBooths.description,
          xpReward: ormawaBooths.xpReward,
          badgeIcon: ormawaBooths.badgeIcon,
          badgeColor: ormawaBooths.badgeColor,
          contactPerson: ormawaBooths.contactPerson,
          instagram: ormawaBooths.instagram,
          isActive: ormawaBooths.isActive,
        })
        .from(ormawaBooths)
        .leftJoin(floors, eq(ormawaBooths.floorId, floors.id))
        .where(eq(ormawaBooths.isActive, true))
        .$dynamic();

      if (category) {
        q = q.where(eq(ormawaBooths.category, category));
      }

      const list = await q.orderBy(ormawaBooths.category, ormawaBooths.name);

      return {
        success: true,
        data: list,
      };
    },
    {
      detail: {
        summary: "Katalog seluruh stan UKM & Ormawa Expo",
        description: "Menampilkan daftar stan UKM aktif di lantai 3-5 lengkap dengan kategori, deskripsi, kontak, dan ikon lencana.",
      },
      query: t.Object({
        category: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/ormawa/scan — Mahasiswa scan QR stan UKM
  .post(
    "/scan",
    async ({ body, user, set }) => {
      const participantId = body.participantId || user?.userId;
      const qrCode = (body.qrCode || (body as any).qrToken || "").trim();

      if (!qrCode) {
        set.status = 400;
        return { success: false, error: { code: "MISSING_QR", message: "QR Code stan UKM wajib disertakan" } };
      }

      if (!participantId) {
        set.status = 400;
        return { success: false, error: { code: "MISSING_PARTICIPANT", message: "ID Peserta wajib disertakan" } };
      }

      // 1. Cari booth berdasarkan QR Code
      const [booth] = await db
        .select()
        .from(ormawaBooths)
        .where(and(eq(ormawaBooths.qrCode, qrCode), eq(ormawaBooths.isActive, true)))
        .limit(1);

      if (!booth) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: "BOOTH_NOT_FOUND",
            message: "QR Code stan UKM tidak valid atau stan sedang tidak aktif.",
          },
        };
      }

      // 2. Cek apakah sudah pernah scan stan ini (anti-duplicate scan)
      const [existingScan] = await db
        .select()
        .from(ormawaScans)
        .where(and(eq(ormawaScans.participantId, participantId), eq(ormawaScans.boothId, booth.id)))
        .limit(1);

      if (existingScan) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "ALREADY_SCANNED",
            message: `Anda sudah pernah mengunjungi stan ${booth.name} sebelumnya!`,
          },
        };
      }

      // 3. Cek capping aturan gamifikasi: maksimal 10 stan yang memberikan XP
      const [scanCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ormawaScans)
        .where(eq(ormawaScans.participantId, participantId));

      const previousScanCount = Number(scanCountResult?.count || 0);
      const MAX_REWARDED_BOOTHS = 10;
      const isEligibleForXp = previousScanCount < MAX_REWARDED_BOOTHS;
      const xpEarned = isEligibleForXp ? (booth.xpReward || 75) : 0;

      // 4. Cari regu mahasiswa untuk pembukuan scoreTransactions
      const [membership] = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, participantId))
        .limit(1);

      let targetTeamId = membership?.teamId;
      if (!targetTeamId) {
        const [defaultTeam] = await db.select({ id: teams.id }).from(teams).limit(1);
        if (defaultTeam) targetTeamId = defaultTeam.id;
      }

      // 5. Catat log kunjungan
      const [newScan] = await db
        .insert(ormawaScans)
        .values({
          participantId,
          boothId: booth.id,
          xpEarned,
        })
        .returning();

      // 6. Injeksi transaksi skor jika berhak mendapatkan XP
      if (xpEarned > 0 && targetTeamId) {
        await db.insert(scoreTransactions).values({
          participantId,
          teamId: targetTeamId,
          amount: xpEarned,
          sourceType: "BONUS",
          reason: `Kunjungan Stan Ormawa: ${booth.name}`,
          createdBy: user?.userId || participantId,
        });

        broadcastLeaderboardUpdate({
          type: "ORMAWA_BOOTH_SCANNED",
          participantId,
          teamId: targetTeamId,
          boothName: booth.name,
          xpEarned,
        });
      }

      broadcastAdminEvent("ORMAWA_VISIT_RECORDED", {
        participantId,
        boothName: booth.name,
        totalVisited: previousScanCount + 1,
      });

      const message = xpEarned > 0
        ? `Selamat! Kunjungan ke stan ${booth.name} berhasil. Anda memperoleh +${xpEarned} XP dan lencana stan!`
        : `Kunjungan ke stan ${booth.name} berhasil dicatat di paspor! (Kuota XP maksimal 10 stan / 750 XP telah tercapai).`;

      return {
        success: true,
        message,
        data: {
          scan: newScan,
          booth: {
            id: booth.id,
            name: booth.name,
            code: booth.code,
            category: booth.category,
            badgeIcon: booth.badgeIcon,
            badgeColor: booth.badgeColor,
          },
          xpEarned,
          totalScanned: previousScanCount + 1,
          isCapped: !isEligibleForXp,
        },
      };
    },
    {
      detail: {
        summary: "Scan QR stan UKM oleh mahasiswa (+75 XP capped 10 stan)",
        description: "Mencatat kunjungan stan ke paspor digital, memberikan reward +75 XP (maksimal 10 stan = 750 XP), dan mencegah scan ganda.",
      },
      body: t.Object({
        participantId: t.Optional(t.String()),
        qrCode: t.Optional(t.String()),
        qrToken: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/ormawa/my-badges/:participantId — Ambil daftar lencana stan yang telah dikumpulkan
  .get(
    "/my-badges/:participantId",
    async ({ params }) => {
      const { participantId } = params;

      const visits = await db
        .select({
          id: ormawaScans.id,
          scannedAt: ormawaScans.scannedAt,
          xpEarned: ormawaScans.xpEarned,
          boothId: ormawaBooths.id,
          boothName: ormawaBooths.name,
          boothCode: ormawaBooths.code,
          category: ormawaBooths.category,
          badgeIcon: ormawaBooths.badgeIcon,
          badgeColor: ormawaBooths.badgeColor,
          boothNumber: ormawaBooths.boothNumber,
          instagram: ormawaBooths.instagram,
        })
        .from(ormawaScans)
        .innerJoin(ormawaBooths, eq(ormawaScans.boothId, ormawaBooths.id))
        .where(eq(ormawaScans.participantId, participantId))
        .orderBy(desc(ormawaScans.scannedAt));

      const totalXp = visits.reduce((acc, v) => acc + (v.xpEarned || 0), 0);

      return {
        success: true,
        data: {
          participantId,
          totalBadges: visits.length,
          totalXpEarned: totalXp,
          badges: visits,
        },
      };
    },
    {
      detail: {
        summary: "Paspor lencana stan UKM mahasiswa",
        description: "Menampilkan koleksi lencana stan UKM yang telah dikunjungi dan total perolehan XP expo.",
      },
      params: t.Object({
        participantId: t.String(),
      }),
    }
  )

  // GET /api/ormawa/admin/stats — Rekap kunjungan stan UKM untuk panitia
  .get(
    "/admin/stats",
    async () => {
      const stats = await db
        .select({
          boothId: ormawaBooths.id,
          boothName: ormawaBooths.name,
          category: ormawaBooths.category,
          visitorCount: sql<number>`count(${ormawaScans.id})`,
        })
        .from(ormawaBooths)
        .leftJoin(ormawaScans, eq(ormawaBooths.id, ormawaScans.boothId))
        .groupBy(ormawaBooths.id, ormawaBooths.name, ormawaBooths.category)
        .orderBy(desc(sql`count(${ormawaScans.id})`));

      const [totalVisits] = await db
        .select({ total: sql<number>`count(*)` })
        .from(ormawaScans);

      return {
        success: true,
        data: {
          totalVisits: Number(totalVisits?.total || 0),
          booths: stats.map((s) => ({
            ...s,
            visitorCount: Number(s.visitorCount),
          })),
        },
      };
    },
    {
      detail: {
        summary: "Statistik popularitas stan UKM Expo panitia",
        description: "Menampilkan jumlah kunjungan maba ke masing-masing stan UKM untuk evaluasi panitia.",
      },
    }
  );
