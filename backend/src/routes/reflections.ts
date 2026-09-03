import { Elysia, t } from "elysia";
import { db } from "../db";
import { dailyReflections, attendances, users, teams, teamMembers, scoreTransactions } from "../db/schema";
import { eq, and, sql, desc, avg } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

export const reflectionRoutes = new Elysia({
  prefix: "/api/reflections",
  detail: {
    tags: ["Daily Reflections & Evaluasi"],
  },
})
  .use(authMiddleware)

  // POST /api/reflections — Mahasiswa kirim kuesioner evaluasi harian (+25 XP)
  .post(
    "/",
    async ({ body, user, set }) => {
      const participantId = body.participantId || user?.userId;
      const { day, ratingFasilitas, ratingMateri, ratingBuddy, essayInsight } = body;

      if (!participantId) {
        set.status = 400;
        return { success: false, error: { code: "MISSING_PARTICIPANT", message: "ID Peserta wajib disertakan" } };
      }

      // 1. Cek apakah sudah pernah mengirimkan refleksi di hari yang sama
      const [existing] = await db
        .select()
        .from(dailyReflections)
        .where(and(eq(dailyReflections.participantId, participantId), eq(dailyReflections.day, day)))
        .limit(1);

      if (existing) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "ALREADY_SUBMITTED",
            message: `Kuesioner refleksi Hari ke-${day} sudah pernah Anda kirimkan.`,
          },
        };
      }

      // 2. Cari kelompok untuk alokasi XP
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

      // 3. Simpan data refleksi
      const [newReflection] = await db
        .insert(dailyReflections)
        .values({
          participantId,
          day,
          ratingFasilitas,
          ratingMateri,
          ratingBuddy,
          essayInsight: essayInsight || "",
        })
        .returning();

      // 4. Update flag refleksi pada tabel attendances hari tersebut
      await db
        .update(attendances)
        .set({ reflectionSubmitted: true })
        .where(and(eq(attendances.participantId, participantId), eq(attendances.day, day)));

      // 5. Berikan bonus reward +25 XP
      const xpAwarded = 25;
      if (targetTeamId) {
        await db.insert(scoreTransactions).values({
          participantId,
          teamId: targetTeamId,
          amount: xpAwarded,
          sourceType: "BONUS",
          reason: `Kuesioner Refleksi Hari ke-${day}`,
          createdBy: user?.userId || participantId,
        });

        broadcastLeaderboardUpdate({
          type: "REFLECTION_SUBMITTED",
          participantId,
          teamId: targetTeamId,
          day,
          xpAwarded,
        });
      }

      broadcastAdminEvent("REFLECTION_RECORDED", {
        participantId,
        day,
        ratingFasilitas,
        ratingMateri,
        ratingBuddy,
      });

      return {
        success: true,
        message: `Kuesioner refleksi Hari ke-${day} berhasil dikirim! Anda memperoleh reward +${xpAwarded} XP.`,
        data: newReflection,
      };
    },
    {
      detail: {
        summary: "Kirim kuesioner refleksi harian maba (+25 XP)",
        description: "Menyimpan penilaian fasilitas, materi, dan pendampingan buddy harian serta menerbitkan reward +25 XP sebelum check-out.",
      },
      body: t.Object({
        participantId: t.Optional(t.String()),
        day: t.Number({ minimum: 1, maximum: 3 }),
        ratingFasilitas: t.Number({ minimum: 1, maximum: 5 }),
        ratingMateri: t.Number({ minimum: 1, maximum: 5 }),
        ratingBuddy: t.Number({ minimum: 1, maximum: 5 }),
        essayInsight: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/reflections/status/:participantId — Cek status pengisian refleksi
  .get(
    "/status/:participantId",
    async ({ params, query }) => {
      const { participantId } = params;
      const day = query.day ? Number(query.day) : 1;

      const [record] = await db
        .select()
        .from(dailyReflections)
        .where(and(eq(dailyReflections.participantId, participantId), eq(dailyReflections.day, day)))
        .limit(1);

      return {
        success: true,
        data: {
          participantId,
          day,
          hasSubmitted: !!record,
          reflection: record || null,
        },
      };
    },
    {
      detail: {
        summary: "Cek status pengisian refleksi harian mahasiswa",
        description: "Memeriksa apakah mahasiswa sudah mengisi kuesioner evaluasi harian pada hari yang diminta.",
      },
      params: t.Object({
        participantId: t.String(),
      }),
      query: t.Object({
        day: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/reflections/recap — Rekapitulasi kepuasan mahasiswa untuk evaluasi panitia
  .get(
    "/recap",
    async ({ query }) => {
      const day = query.day ? Number(query.day) : 1;

      // Rata-rata rating
      const [averages] = await db
        .select({
          avgFasilitas: sql<number>`round(avg(${dailyReflections.ratingFasilitas})::numeric, 2)`,
          avgMateri: sql<number>`round(avg(${dailyReflections.ratingMateri})::numeric, 2)`,
          avgBuddy: sql<number>`round(avg(${dailyReflections.ratingBuddy})::numeric, 2)`,
          totalSubmissions: sql<number>`count(*)`,
        })
        .from(dailyReflections)
        .where(eq(dailyReflections.day, day));

      // 50 Kutipan refleksi & feedback terakhir
      const responses = await db
        .select({
          id: dailyReflections.id,
          participantId: dailyReflections.participantId,
          fullName: users.fullName,
          username: users.username,
          ratingFasilitas: dailyReflections.ratingFasilitas,
          ratingMateri: dailyReflections.ratingMateri,
          ratingBuddy: dailyReflections.ratingBuddy,
          essayInsight: dailyReflections.essayInsight,
          submittedAt: dailyReflections.submittedAt,
        })
        .from(dailyReflections)
        .innerJoin(users, eq(dailyReflections.participantId, users.id))
        .where(eq(dailyReflections.day, day))
        .orderBy(desc(dailyReflections.submittedAt))
        .limit(50);

      return {
        success: true,
        data: {
          day,
          metrics: {
            totalSubmissions: Number(averages?.totalSubmissions || 0),
            avgFasilitas: Number(averages?.avgFasilitas || 0),
            avgMateri: Number(averages?.avgMateri || 0),
            avgBuddy: Number(averages?.avgBuddy || 0),
          },
          recentInsights: responses,
        },
      };
    },
    {
      detail: {
        summary: "Rekap kepuasan mahasiswa & insight evaluasi panitia",
        description: "Menghitung rata-rata skor kepuasan fasilitas, materi, dan pendampingan buddy serta menampilkan daftar respon insight.",
      },
      query: t.Object({
        day: t.Optional(t.String()),
      }),
    }
  );
