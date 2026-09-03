import { Elysia, t } from "elysia";
import { db } from "../db";
import { attendances, users, teams, teamMembers, scoreTransactions } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

export const attendanceRoutes = new Elysia({
  prefix: "/api/attendance",
  detail: {
    tags: ["Attendance & Presensi Gate"],
  },
})
  .use(authMiddleware)

  // POST /api/attendance/check-in — Mahasiswa scan QR kedatangan pagi
  .post(
    "/check-in",
    async ({ body, user, set }) => {
      const participantId = body.participantId || user?.userId;
      const { day, qrToken } = body;

      if (!participantId) {
        set.status = 400;
        return { success: false, error: { code: "MISSING_PARTICIPANT", message: "ID Peserta wajib disertakan" } };
      }

      // 1. Verifikasi eksistensi pengguna
      const [participant] = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, participantId))
        .limit(1);

      if (!participant) {
        set.status = 404;
        return { success: false, error: { code: "USER_NOT_FOUND", message: "Data mahasiswa tidak ditemukan" } };
      }

      // 2. Cari kelompok peserta (jika ada) untuk update leaderboard regu
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

      // 3. Validasi token QR gerbang
      const upperToken = qrToken.trim().toUpperCase();
      const isValidToken =
        upperToken.includes("PRESENSI") ||
        upperToken.includes(`H${day}`) ||
        upperToken.startsWith("QR-PRESENSI") ||
        upperToken.includes("GATE");

      if (!isValidToken) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "INVALID_QR_TOKEN",
            message: `Token QR tidak valid untuk presensi Hari ${day}. Pastikan memindai QR resmi di gerbang.`,
          },
        };
      }

      // 4. Cek apakah mahasiswa sudah presensi pada hari ini
      const [existing] = await db
        .select()
        .from(attendances)
        .where(and(eq(attendances.participantId, participantId), eq(attendances.day, day)))
        .limit(1);

      if (existing?.checkInAt) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "ALREADY_CHECKED_IN",
            message: `Mahasiswa sudah melakukan presensi masuk pada Hari ke-${day}.`,
          },
        };
      }

      // 5. Kalkulasi status ketepatan waktu (Batas standar: 07:30 WIB)
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 7 || (hours === 7 && minutes > 30);
      const checkInStatus = isLate ? "LATE" : "ON_TIME";
      const xpAwarded = 100;
      const dateStr = now.toISOString().split("T")[0];

      // 6. Simpan atau perbarui record attendances
      let attendanceRecord;
      if (existing) {
        [attendanceRecord] = await db
          .update(attendances)
          .set({
            checkInAt: now,
            checkInStatus,
            checkInQrToken: qrToken,
            xpAwarded: (existing.xpAwarded || 0) + xpAwarded,
          })
          .where(eq(attendances.id, existing.id))
          .returning();
      } else {
        [attendanceRecord] = await db
          .insert(attendances)
          .values({
            participantId,
            day,
            date: dateStr,
            checkInAt: now,
            checkInStatus,
            checkInQrToken: qrToken,
            xpAwarded,
          })
          .returning();
      }

      // 7. Catat transaksi skor +100 XP ke ledger jika memiliki tim valid
      if (targetTeamId) {
        await db.insert(scoreTransactions).values({
          participantId,
          teamId: targetTeamId,
          amount: xpAwarded,
          sourceType: "BONUS",
          reason: `Presensi Masuk Hari ${day} (${checkInStatus === "ON_TIME" ? "Tepat Waktu" : "Terlambat"})`,
          createdBy: user?.userId || participantId,
        });
      }

      // 8. Broadcast pembaruan live skor ke WebSocket
      broadcastLeaderboardUpdate({
        type: "ATTENDANCE_CHECK_IN",
        participantId,
        teamId: targetTeamId,
        day,
        status: checkInStatus,
        xpAwarded,
      });

      broadcastAdminEvent("ATTENDANCE_CHECK_IN", {
        participantId,
        participantName: participant.fullName,
        day,
        checkInStatus,
        time: now.toISOString(),
      });

      return {
        success: true,
        message: `Presensi masuk Hari ${day} berhasil! Anda memperoleh +${xpAwarded} XP (${checkInStatus}).`,
        data: attendanceRecord,
      };
    },
    {
      detail: {
        summary: "Check-in presensi gerbang pagi (Anti-Titip Absen +100 XP)",
        description: "Validasi token QR gerbang pagi, mencegah presensi ganda di hari yang sama, menghitung status ON_TIME / LATE, serta menginjeksi +100 XP ke leaderboard.",
      },
      body: t.Object({
        participantId: t.Optional(t.String()),
        day: t.Number({ minimum: 1, maximum: 3 }),
        qrToken: t.String({ minLength: 3 }),
      }),
    }
  )

  // POST /api/attendance/check-out — Mahasiswa scan QR kepulangan sore
  .post(
    "/check-out",
    async ({ body, user, set }) => {
      const participantId = body.participantId || user?.userId;
      const { day, qrToken } = body;

      if (!participantId) {
        set.status = 400;
        return { success: false, error: { code: "MISSING_PARTICIPANT", message: "ID Peserta wajib disertakan" } };
      }

      // 1. Cek riwayat presensi masuk
      const [existing] = await db
        .select()
        .from(attendances)
        .where(and(eq(attendances.participantId, participantId), eq(attendances.day, day)))
        .limit(1);

      if (!existing || !existing.checkInAt) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "NOT_CHECKED_IN",
            message: `Mahasiswa belum melakukan presensi masuk pada Hari ke-${day}.`,
          },
        };
      }

      if (existing.checkOutAt) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "ALREADY_CHECKED_OUT",
            message: `Mahasiswa sudah melakukan presensi pulang pada Hari ke-${day}.`,
          },
        };
      }

      // 2. Ambil kelompok
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

      const now = new Date();
      const xpAwarded = 50;

      // 3. Update waktu pulang
      const [updatedRecord] = await db
        .update(attendances)
        .set({
          checkOutAt: now,
          checkOutQrToken: qrToken,
          xpAwarded: (existing.xpAwarded || 0) + xpAwarded,
        })
        .where(eq(attendances.id, existing.id))
        .returning();

      // 4. Catat transaksi skor +50 XP
      if (targetTeamId) {
        await db.insert(scoreTransactions).values({
          participantId,
          teamId: targetTeamId,
          amount: xpAwarded,
          sourceType: "BONUS",
          reason: `Presensi Pulang Hari ${day}`,
          createdBy: user?.userId || participantId,
        });
      }

      // 5. Broadcast live update
      broadcastLeaderboardUpdate({
        type: "ATTENDANCE_CHECK_OUT",
        participantId,
        teamId: targetTeamId,
        day,
        xpAwarded,
      });

      return {
        success: true,
        message: `Presensi pulang Hari ${day} berhasil! Anda memperoleh bonus kepulangan +${xpAwarded} XP.`,
        data: updatedRecord,
      };
    },
    {
      detail: {
        summary: "Check-out presensi kepulangan sore (+50 XP)",
        description: "Mencatat waktu kepulangan mahasiswa dan memberikan bonus presensi kepulangan +50 XP.",
      },
      body: t.Object({
        participantId: t.Optional(t.String()),
        day: t.Number({ minimum: 1, maximum: 3 }),
        qrToken: t.String({ minLength: 3 }),
      }),
    }
  )

  // GET /api/attendance/status/:participantId — Cek status presensi hari ini
  .get(
    "/status/:participantId",
    async ({ params, query }) => {
      const { participantId } = params;
      const day = query.day ? Number(query.day) : 1;

      const [record] = await db
        .select()
        .from(attendances)
        .where(and(eq(attendances.participantId, participantId), eq(attendances.day, day)))
        .limit(1);

      if (!record) {
        return {
          success: true,
          data: {
            day,
            hasCheckedIn: false,
            hasCheckedOut: false,
            checkInAt: null,
            checkOutAt: null,
            status: "ABSENT",
            reflectionSubmitted: false,
          },
        };
      }

      return {
        success: true,
        data: {
          ...record,
          hasCheckedIn: !!record.checkInAt,
          hasCheckedOut: !!record.checkOutAt,
        },
      };
    },
    {
      detail: {
        summary: "Cek status presensi harian mahasiswa",
        description: "Mengembalikan detail status presensi masuk dan pulang mahasiswa pada hari yang diminta.",
      },
      params: t.Object({ participantId: t.String() }),
      query: t.Object({ day: t.Optional(t.String()) }),
    }
  )

  // GET /api/attendance/recap — Rekapitulasi kehadiran untuk admin & buddy
  .get(
    "/recap",
    async ({ query }) => {
      const day = query.day ? Number(query.day) : 1;

      // Agregasi jumlah status
      const stats = await db
        .select({
          status: attendances.checkInStatus,
          count: sql<number>`count(*)`,
        })
        .from(attendances)
        .where(eq(attendances.day, day))
        .groupBy(attendances.checkInStatus);

      // Daftar presensi terakhir
      const list = await db
        .select({
          id: attendances.id,
          participantId: attendances.participantId,
          fullName: users.fullName,
          username: users.username,
          characterClass: users.characterClass,
          day: attendances.day,
          checkInAt: attendances.checkInAt,
          checkInStatus: attendances.checkInStatus,
          checkOutAt: attendances.checkOutAt,
          xpAwarded: attendances.xpAwarded,
          reflectionSubmitted: attendances.reflectionSubmitted,
          teamName: teams.name,
        })
        .from(attendances)
        .innerJoin(users, eq(attendances.participantId, users.id))
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .leftJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(attendances.day, day))
        .orderBy(desc(attendances.checkInAt))
        .limit(100);

      const totalCheckedIn = list.length;
      const onTimeCount = stats.find((s) => s.status === "ON_TIME")?.count || 0;
      const lateCount = stats.find((s) => s.status === "LATE")?.count || 0;

      return {
        success: true,
        data: {
          day,
          summary: {
            totalCheckedIn: Number(totalCheckedIn),
            onTime: Number(onTimeCount),
            late: Number(lateCount),
          },
          attendees: list,
        },
      };
    },
    {
      detail: {
        summary: "Rekapitulasi kehadiran panitia & buddy per hari",
        description: "Menghasilkan statistik jumlah kehadiran (tepat waktu, terlambat) dan daftar mahasiswa yang telah hadir.",
      },
      query: t.Object({ day: t.Optional(t.String()) }),
    }
  );
