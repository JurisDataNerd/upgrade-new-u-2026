import { Elysia, t } from "elysia";
import { db } from "../db";
import { ormawaBooths, ormawaScans, users, teams, teamMembers, scoreTransactions, floors } from "../db/schema";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

export const ormawaRoutes = new Elysia({
  prefix: "/api/ormawa",
  detail: {
    tags: ["Ormawa & UKM Expo"],
  },
})
  .use(authMiddleware)

  // GET /api/ormawa/booths — Ambil daftar seluruh stan UKM & Ormawa (dengan jumlah pengunjung & QR code)
  .get(
    "/booths",
    async ({ query }) => {
      const category = query.category;
      const includeInactive = query.includeInactive === "true";

      // Subquery untuk menghitung total pengunjung per stan
      const visitorCountSubquery = db
        .select({
          boothId: ormawaScans.boothId,
          visitorCount: sql<number>`count(${ormawaScans.id})`.as("visitor_count"),
        })
        .from(ormawaScans)
        .groupBy(ormawaScans.boothId)
        .as("sq_visitors");

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
          qrCode: ormawaBooths.qrCode,
          xpReward: ormawaBooths.xpReward,
          badgeIcon: ormawaBooths.badgeIcon,
          badgeColor: ormawaBooths.badgeColor,
          contactPerson: ormawaBooths.contactPerson,
          instagram: ormawaBooths.instagram,
          isActive: ormawaBooths.isActive,
          visitorCount: sql<number>`COALESCE(${visitorCountSubquery.visitorCount}, 0)`.as("visitor_count"),
          createdAt: ormawaBooths.createdAt,
        })
        .from(ormawaBooths)
        .leftJoin(floors, eq(ormawaBooths.floorId, floors.id))
        .leftJoin(visitorCountSubquery, eq(ormawaBooths.id, visitorCountSubquery.boothId))
        .$dynamic();

      const conditions = [];
      if (!includeInactive) {
        conditions.push(eq(ormawaBooths.isActive, true));
      }
      if (category) {
        conditions.push(eq(ormawaBooths.category, category));
      }

      if (conditions.length > 0) {
        q = q.where(and(...conditions));
      }

      const list = await q.orderBy(floors.number, ormawaBooths.boothNumber, ormawaBooths.name);

      return {
        success: true,
        data: list.map((item) => ({
          ...item,
          visitorCount: Number(item.visitorCount || 0),
        })),
      };
    },
    {
      detail: {
        summary: "Katalog seluruh stan UKM & Ormawa Expo",
        description: "Menampilkan daftar stan UKM aktif di lantai 3-5 lengkap dengan kategori, QR code token, dan jumlah kunjungan maba.",
      },
      query: t.Object({
        category: t.Optional(t.String()),
        includeInactive: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/ormawa/booths/:id — Detail satu stan spesifik
  .get(
    "/booths/:id",
    async ({ params, set }) => {
      const [booth] = await db
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
          qrCode: ormawaBooths.qrCode,
          xpReward: ormawaBooths.xpReward,
          badgeIcon: ormawaBooths.badgeIcon,
          badgeColor: ormawaBooths.badgeColor,
          contactPerson: ormawaBooths.contactPerson,
          instagram: ormawaBooths.instagram,
          isActive: ormawaBooths.isActive,
          createdAt: ormawaBooths.createdAt,
        })
        .from(ormawaBooths)
        .leftJoin(floors, eq(ormawaBooths.floorId, floors.id))
        .where(eq(ormawaBooths.id, params.id))
        .limit(1);

      if (!booth) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Stan Ormawa tidak ditemukan" } };
      }

      const [visitors] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ormawaScans)
        .where(eq(ormawaScans.boothId, params.id));

      return {
        success: true,
        data: {
          ...booth,
          visitorCount: Number(visitors?.count || 0),
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // GET /api/ormawa/booths/:id/visitors — Rekap daftar siapa saja maba yang absen/scan stan ini
  .get(
    "/booths/:id/visitors",
    async ({ params, set }) => {
      const [booth] = await db
        .select({ id: ormawaBooths.id, name: ormawaBooths.name, code: ormawaBooths.code })
        .from(ormawaBooths)
        .where(eq(ormawaBooths.id, params.id))
        .limit(1);

      if (!booth) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Stan Ormawa tidak ditemukan" } };
      }

      const attendees = await db
        .select({
          scanId: ormawaScans.id,
          participantId: ormawaScans.participantId,
          fullName: users.fullName,
          username: users.username, // NIM
          avatarUrl: users.avatarUrl,
          gender: users.gender,
          characterClass: users.characterClass,
          characterTier: users.characterTier,
          teamId: teams.id,
          teamName: teams.name,
          teamCode: teams.code,
          xpEarned: ormawaScans.xpEarned,
          scannedAt: ormawaScans.scannedAt,
        })
        .from(ormawaScans)
        .innerJoin(users, eq(ormawaScans.participantId, users.id))
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .leftJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(ormawaScans.boothId, params.id))
        .orderBy(desc(ormawaScans.scannedAt));

      return {
        success: true,
        data: {
          booth,
          totalAttendees: attendees.length,
          attendees,
        },
      };
    },
    {
      detail: {
        summary: "Daftar mahasiswa yang hadir / absen di stan spesifik",
        description: "Menampilkan daftar seluruh mahasiswa (Nama, NIM, Tim, Waktu Scan, XP) yang telah mengunjungi stan ini.",
      },
      params: t.Object({ id: t.String() }),
    }
  )

  // GET /api/ormawa/visitors — Rekap arus log absensi seluruh stan Ormawa Expo
  .get(
    "/visitors",
    async ({ query }) => {
      const limit = Number(query.limit) || 100;

      const scans = await db
        .select({
          scanId: ormawaScans.id,
          participantId: ormawaScans.participantId,
          fullName: users.fullName,
          username: users.username, // NIM
          avatarUrl: users.avatarUrl,
          gender: users.gender,
          teamName: teams.name,
          boothId: ormawaBooths.id,
          boothName: ormawaBooths.name,
          boothCode: ormawaBooths.code,
          category: ormawaBooths.category,
          boothNumber: ormawaBooths.boothNumber,
          xpEarned: ormawaScans.xpEarned,
          scannedAt: ormawaScans.scannedAt,
        })
        .from(ormawaScans)
        .innerJoin(users, eq(ormawaScans.participantId, users.id))
        .innerJoin(ormawaBooths, eq(ormawaScans.boothId, ormawaBooths.id))
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .leftJoin(teams, eq(teamMembers.teamId, teams.id))
        .orderBy(desc(ormawaScans.scannedAt))
        .limit(limit);

      const [totalVisits] = await db
        .select({ total: sql<number>`count(*)` })
        .from(ormawaScans);

      return {
        success: true,
        data: {
          totalVisits: Number(totalVisits?.total || 0),
          scans,
        },
      };
    },
    {
      detail: {
        summary: "Rekapitulasi log seluruh kunjungan mahasiswa ke stan expo",
      },
      query: t.Object({
        limit: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/ormawa/booths — Admin buat stan Ormawa baru
  .post(
    "/booths",
    async ({ body, user, set }) => {
      const code = body.code.toUpperCase().trim();
      const qrCode = (body.qrCode || `ORMAWA-QR-${code.replace(/[^A-Z0-9]/g, "-")}-UNU2026`).trim();

      const [existing] = await db
        .select({ id: ormawaBooths.id })
        .from(ormawaBooths)
        .where(or(eq(ormawaBooths.code, code), eq(ormawaBooths.qrCode, qrCode)))
        .limit(1);

      if (existing) {
        set.status = 409;
        return {
          success: false,
          error: { code: "CODE_EXISTS", message: "Kode stan atau QR Code stan sudah digunakan!" },
        };
      }

      const [newBooth] = await db
        .insert(ormawaBooths)
        .values({
          code,
          name: body.name.trim(),
          shortName: body.shortName ? body.shortName.trim() : null,
          category: body.category.trim(),
          floorId: body.floorId || null,
          boothNumber: body.boothNumber ? body.boothNumber.trim() : null,
          description: body.description ? body.description.trim() : null,
          qrCode,
          xpReward: body.xpReward || 75,
          badgeIcon: body.badgeIcon || "Shield",
          badgeColor: body.badgeColor || "#16a34a",
          contactPerson: body.contactPerson ? body.contactPerson.trim() : null,
          instagram: body.instagram ? body.instagram.trim() : null,
          isActive: body.isActive !== undefined ? body.isActive : true,
        })
        .returning();

      broadcastAdminEvent("ORMAWA_BOOTH_CREATED", {
        boothId: newBooth.id,
        name: newBooth.name,
        code: newBooth.code,
      });

      return {
        success: true,
        message: `Stan Ormawa '${newBooth.name}' berhasil ditambahkan!`,
        data: newBooth,
      };
    },
    {
      detail: {
        summary: "Buat stan Ormawa / UKM baru (Admin Only)",
      },
      body: t.Object({
        code: t.String({ minLength: 2 }),
        name: t.String({ minLength: 2 }),
        shortName: t.Optional(t.Nullable(t.String())),
        category: t.String({ minLength: 2 }),
        floorId: t.Optional(t.Nullable(t.String())),
        boothNumber: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
        qrCode: t.Optional(t.Nullable(t.String())),
        xpReward: t.Optional(t.Number()),
        badgeIcon: t.Optional(t.Nullable(t.String())),
        badgeColor: t.Optional(t.Nullable(t.String())),
        contactPerson: t.Optional(t.Nullable(t.String())),
        instagram: t.Optional(t.Nullable(t.String())),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  // PUT /api/ormawa/booths/:id — Admin perbarui data stan Ormawa
  .put(
    "/booths/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, any> = {};
      if (body.name) updates.name = body.name.trim();
      if (body.shortName !== undefined) updates.shortName = body.shortName ? body.shortName.trim() : null;
      if (body.category) updates.category = body.category.trim();
      if (body.floorId !== undefined) updates.floorId = body.floorId || null;
      if (body.boothNumber !== undefined) updates.boothNumber = body.boothNumber ? body.boothNumber.trim() : null;
      if (body.description !== undefined) updates.description = body.description ? body.description.trim() : null;
      if (body.qrCode) updates.qrCode = body.qrCode.trim();
      if (body.xpReward !== undefined) updates.xpReward = body.xpReward;
      if (body.badgeIcon !== undefined) updates.badgeIcon = body.badgeIcon;
      if (body.badgeColor !== undefined) updates.badgeColor = body.badgeColor;
      if (body.contactPerson !== undefined) updates.contactPerson = body.contactPerson ? body.contactPerson.trim() : null;
      if (body.instagram !== undefined) updates.instagram = body.instagram ? body.instagram.trim() : null;
      if (body.isActive !== undefined) updates.isActive = body.isActive;

      const [updated] = await db
        .update(ormawaBooths)
        .set(updates)
        .where(eq(ormawaBooths.id, params.id))
        .returning();

      if (!updated) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Stan Ormawa tidak ditemukan" } };
      }

      broadcastAdminEvent("ORMAWA_BOOTH_UPDATED", {
        boothId: updated.id,
        name: updated.name,
      });

      return {
        success: true,
        message: `Stan '${updated.name}' berhasil diperbarui!`,
        data: updated,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        shortName: t.Optional(t.Nullable(t.String())),
        category: t.Optional(t.String()),
        floorId: t.Optional(t.Nullable(t.String())),
        boothNumber: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
        qrCode: t.Optional(t.String()),
        xpReward: t.Optional(t.Number()),
        badgeIcon: t.Optional(t.Nullable(t.String())),
        badgeColor: t.Optional(t.Nullable(t.String())),
        contactPerson: t.Optional(t.Nullable(t.String())),
        instagram: t.Optional(t.Nullable(t.String())),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  // DELETE /api/ormawa/booths/:id — Admin hapus stan Ormawa
  .delete(
    "/booths/:id",
    async ({ params, set }) => {
      // Hapus riwayat scan terkait stan ini lebih dulu
      await db.delete(ormawaScans).where(eq(ormawaScans.boothId, params.id));

      const [deleted] = await db
        .delete(ormawaBooths)
        .where(eq(ormawaBooths.id, params.id))
        .returning({ id: ormawaBooths.id, name: ormawaBooths.name });

      if (!deleted) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Stan Ormawa tidak ditemukan" } };
      }

      broadcastAdminEvent("ORMAWA_BOOTH_DELETED", { boothId: deleted.id });

      return {
        success: true,
        message: `Stan '${deleted.name}' berhasil dihapus.`,
        data: deleted,
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // POST /api/ormawa/scan — Mahasiswa scan QR stan UKM (+75 XP capped 10 stan)
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
