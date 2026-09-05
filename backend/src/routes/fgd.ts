import { Elysia, t } from "elysia";
import { db } from "../db";
import { fgdEvaluations, users, teams, teamMembers, scoreTransactions } from "../db/schema";
import { eq, and, sql, desc, or } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { broadcastLeaderboardUpdate, broadcastAdminEvent } from "../realtime";

async function handleEvaluationSubmit({
  body,
  user,
  set,
}: {
  body: {
    sessionId: string;
    participantId?: string;
    nim?: string;
    teamId?: string;
    rubricScores: { keaktifan: number; kedalaman: number; adab: number };
    feedbackNotes?: string;
  };
  user?: any;
  set: any;
}) {
  const targetId = (body.participantId || body.nim || "").trim();
  const { sessionId, rubricScores, feedbackNotes } = body;
  let teamId = body.teamId;

  // 1. Verifikasi peserta via UUID atau NIM/Username
  const [participant] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.id, targetId), eq(users.username, targetId)))
    .limit(1);

  if (!participant) {
    set.status = 404;
    return { success: false, error: { code: "USER_NOT_FOUND", message: "Data mahasiswa tidak ditemukan" } };
  }

  const participantId = participant.id;

  // 2. Lookup kelompok jika tidak dikirim
  let targetTeamId = teamId;
  if (!targetTeamId) {
    const [membership] = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, participantId))
      .limit(1);
    targetTeamId = membership?.teamId;
  }
  if (!targetTeamId) {
    const [defaultTeam] = await db.select({ id: teams.id }).from(teams).limit(1);
    if (defaultTeam) targetTeamId = defaultTeam.id;
  }

  // 3. Verifikasi evaluator (Buddy / Admin)
  let buddyId = user?.userId;
  if (!buddyId) {
    // Fallback untuk mode development / mock: cari buddy dari tim atau admin
    const [anyBuddy] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "BUDDY"))
      .limit(1);
    buddyId = anyBuddy?.id || participantId;
  }

  // 4. Kalkulasi skor rubrik 3 pilar (Skala 3 - 15)
  const { keaktifan, kedalaman, adab } = rubricScores;
  const totalScore = keaktifan + kedalaman + adab;
  // Konversi ke XP: Maksimal 200 XP (Total 15 = 200 XP, Total 14 = 187 XP, dst)
  const xpAwarded = Math.round((totalScore / 15) * 200);

  // 5. Cek apakah sudah pernah dievaluasi untuk sesi ini (Upsert logic)
  const [existing] = await db
    .select()
    .from(fgdEvaluations)
    .where(
      and(
        eq(fgdEvaluations.sessionId, sessionId),
        eq(fgdEvaluations.participantId, participantId)
      )
    )
    .limit(1);

  let evaluationRecord;
  let xpDelta = xpAwarded;

  if (existing) {
    xpDelta = xpAwarded - existing.xpAwarded;

    [evaluationRecord] = await db
      .update(fgdEvaluations)
      .set({
        rubricScores,
        totalScore,
        xpAwarded,
        feedbackNotes: feedbackNotes || existing.feedbackNotes,
        submittedAt: new Date(),
      })
      .where(eq(fgdEvaluations.id, existing.id))
      .returning();
  } else {
    [evaluationRecord] = await db
      .insert(fgdEvaluations)
      .values({
        sessionId,
        participantId,
        teamId: targetTeamId || null,
        buddyId,
        rubricScores,
        totalScore,
        xpAwarded,
        feedbackNotes: feedbackNotes || null,
      })
      .returning();
  }

  // 6. Masukkan transaksi skor ke ledger (jika ada tim valid dan delta skor)
  if (xpDelta !== 0 && targetTeamId) {
    await db.insert(scoreTransactions).values({
      participantId,
      teamId: targetTeamId,
      amount: xpDelta,
      sourceType: "BONUS",
      reason: `Evaluasi ${sessionId} (${totalScore}/15 pts - Keaktifan:${keaktifan}, Kedalaman:${kedalaman}, Adab:${adab})`,
      createdBy: buddyId,
    });
  }

  // 7. Siarkan event skor live via WebSocket
  broadcastLeaderboardUpdate({
    type: "FGD_EVALUATION_AWARDED",
    sessionId,
    participantId,
    teamId: targetTeamId,
    totalScore,
    xpAwarded,
  });

  broadcastAdminEvent("FGD_EVALUATION_SUBMITTED", {
    sessionId,
    participantId,
    participantName: participant.fullName,
    totalScore,
    xpAwarded,
    evaluatedBy: buddyId,
  });

  return {
    success: true,
    message: `Penilaian ${sessionId} berhasil disimpan! Mahasiswa memperoleh +${xpAwarded} XP.`,
    data: evaluationRecord,
  };
}

export const fgdRoutes = new Elysia({
  prefix: "/api/buddy/evaluations",
  detail: {
    tags: ["FGD Evaluation & Buddy Rubrik"],
  },
})
  .use(authMiddleware)

  // POST /api/buddy/evaluations — Buddy submit evaluasi rubrik 3 pilar FGD
  .post(
    "/",
    async ({ body, user, set }) => {
      return handleEvaluationSubmit({ body, user, set });
    },
    {
      detail: {
        summary: "Submit evaluasi rubrik 3 pilar FGD (Keaktifan, Kedalaman, Adab)",
        description: "Buddy menginput nilai rubrik 3 pilar (skala 3-15) yang otomatis dikonversi menjadi hingga +200 XP live ke leaderboard.",
      },
      body: t.Object({
        sessionId: t.String({ minLength: 3 }),
        participantId: t.Optional(t.String()),
        nim: t.Optional(t.String()),
        teamId: t.Optional(t.String()),
        rubricScores: t.Object({
          keaktifan: t.Number({ minimum: 1, maximum: 5 }),
          kedalaman: t.Number({ minimum: 1, maximum: 5 }),
          adab: t.Number({ minimum: 1, maximum: 5 }),
        }),
        feedbackNotes: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/buddy/evaluations/submit — Endpoint alias sesuai REST API Spec
  .post(
    "/submit",
    async ({ body, user, set }) => {
      return handleEvaluationSubmit({ body, user, set });
    },
    {
      detail: {
        summary: "Submit evaluasi rubrik 3 pilar FGD (Alias Endpoint)",
      },
      body: t.Object({
        sessionId: t.String({ minLength: 3 }),
        participantId: t.Optional(t.String()),
        nim: t.Optional(t.String()),
        teamId: t.Optional(t.String()),
        rubricScores: t.Object({
          keaktifan: t.Number({ minimum: 1, maximum: 5 }),
          kedalaman: t.Number({ minimum: 1, maximum: 5 }),
          adab: t.Number({ minimum: 1, maximum: 5 }),
        }),
        feedbackNotes: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/buddy/evaluations/team/:teamId — Ambil seluruh evaluasi anggota kelompok bimbingan
  .get(
    "/team/:teamId",
    async ({ params, query }) => {
      const { teamId } = params;
      const sessionId = query.sessionId;

      // 1. Ambil seluruh anggota regu
      const members = await db
        .select({
          userId: users.id,
          fullName: users.fullName,
          username: users.username,
          avatarUrl: users.avatarUrl,
          characterClass: users.characterClass,
          characterTier: users.characterTier,
        })
        .from(teamMembers)
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .where(eq(teamMembers.teamId, teamId));

      // 2. Ambil seluruh evaluasi FGD tim tersebut
      const conditions = [eq(fgdEvaluations.teamId, teamId)];
      if (sessionId) {
        conditions.push(eq(fgdEvaluations.sessionId, sessionId));
      }

      const evals = await db
        .select()
        .from(fgdEvaluations)
        .where(and(...conditions));

      // 3. Petakan evaluasi ke masing-masing anggota
      const mapped = members.map((member) => {
        const memberEvals = evals.filter((e) => e.participantId === member.userId);
        return {
          ...member,
          evaluations: memberEvals,
          evaluatedSessions: memberEvals.map((e) => e.sessionId),
          totalFgdXp: memberEvals.reduce((sum, e) => sum + (e.xpAwarded || 0), 0),
        };
      });

      return {
        success: true,
        data: {
          teamId,
          totalMembers: members.length,
          members: mapped,
        },
      };
    },
    {
      detail: {
        summary: "Rekap evaluasi FGD seluruh anggota kelompok",
        description: "Menampilkan matriks penilaian seluruh anggota tim untuk sesi FGD 1, FGD 2, dan FGD 6 beserta total perolehan XP.",
      },
      params: t.Object({ teamId: t.String() }),
      query: t.Object({ sessionId: t.Optional(t.String()) }),
    }
  )

  // GET /api/buddy/evaluations/participant/:participantId — Riwayat evaluasi mahasiswa
  .get(
    "/participant/:participantId",
    async ({ params }) => {
      const { participantId } = params;

      const list = await db
        .select({
          id: fgdEvaluations.id,
          sessionId: fgdEvaluations.sessionId,
          rubricScores: fgdEvaluations.rubricScores,
          totalScore: fgdEvaluations.totalScore,
          xpAwarded: fgdEvaluations.xpAwarded,
          feedbackNotes: fgdEvaluations.feedbackNotes,
          submittedAt: fgdEvaluations.submittedAt,
          evaluatorName: users.fullName,
        })
        .from(fgdEvaluations)
        .leftJoin(users, eq(fgdEvaluations.buddyId, users.id))
        .where(eq(fgdEvaluations.participantId, participantId))
        .orderBy(desc(fgdEvaluations.submittedAt));

      return {
        success: true,
        data: list,
      };
    },
    {
      detail: {
        summary: "Riwayat penilaian evaluasi mahasiswa",
        description: "Menampilkan seluruh riwayat penilaian FGD yang diperoleh oleh mahasiswa dari Buddy pendampingnya.",
      },
      params: t.Object({ participantId: t.String() }),
    }
  );
