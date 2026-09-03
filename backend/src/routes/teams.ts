import { Elysia, t } from "elysia";
import { db } from "../db";
import { teams, teamMembers, users, routes, scoreTransactions } from "../db/schema";
import { eq, sql, desc, inArray, or, ilike, and } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const teamRoutes = new Elysia({ prefix: "/api/teams" })
  .use(requireAdmin)

  // GET /api/teams — List all teams with route, buddy list, and participant counts
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 100;
    const offset = (page - 1) * pageSize;
    const search = query.search?.trim();

    let queryBuilder = db
      .select({
        id: teams.id,
        name: teams.name,
        code: teams.code,
        captainId: teams.captainId,
        routeId: teams.routeId,
        routeName: routes.name,
        status: teams.status,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .leftJoin(routes, eq(teams.routeId, routes.id));

    let baseTeams;
    if (search) {
      baseTeams = await queryBuilder
        .where(or(ilike(teams.name, `%${search}%`), ilike(teams.code, `%${search}%`)))
        .orderBy(desc(teams.createdAt))
        .limit(pageSize)
        .offset(offset);
    } else {
      baseTeams = await queryBuilder
        .orderBy(desc(teams.createdAt))
        .limit(pageSize)
        .offset(offset);
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(teams);

    if (baseTeams.length === 0) {
      return {
        success: true,
        data: [],
        meta: { page, pageSize, total: Number(count) },
      };
    }

    const teamIds = baseTeams.map((t) => t.id);

    // Fetch all members for these teams
    const allMembers = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        gender: users.gender,
        characterClass: users.characterClass,
        characterTitle: users.characterTitle,
        characterTier: users.characterTier,
        isCaptain: teamMembers.isCaptain,
        buddyRole: teamMembers.buddyRole,
        joinedAt: teamMembers.joinedAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(inArray(teamMembers.teamId, teamIds));

    // Aggregate members by team
    const data = baseTeams.map((team) => {
      const members = allMembers.filter((m) => m.teamId === team.id);
      const participants = members.filter((m) => m.role === "PARTICIPANT");
      const buddies = members.filter((m) => m.role === "BUDDY");
      const captain = participants.find((p) => p.isCaptain || p.userId === team.captainId);

      return {
        ...team,
        participantCount: participants.length,
        buddyCount: buddies.length,
        captain: captain
          ? {
              userId: captain.userId,
              username: captain.username,
              fullName: captain.fullName,
            }
          : null,
        buddies: buddies.map((b) => ({
          userId: b.userId,
          username: b.username,
          fullName: b.fullName,
          buddyRole: b.buddyRole || "PRIMARY",
        })),
        members: participants.map((p) => ({
          userId: p.userId,
          username: p.username,
          fullName: p.fullName,
          gender: p.gender,
          characterClass: p.characterClass,
          characterTitle: p.characterTitle,
          characterTier: p.characterTier,
          isCaptain: p.isCaptain || p.userId === team.captainId,
        })),
      };
    });

    return {
      success: true,
      data,
      meta: { page, pageSize, total: Number(count) },
    };
  })

  // GET /api/teams/:id — Single team with full roster and total score
  .get("/:id", async ({ params, set }) => {
    const [team] = await db
      .select({
        id: teams.id,
        name: teams.name,
        code: teams.code,
        captainId: teams.captainId,
        routeId: teams.routeId,
        routeName: routes.name,
        status: teams.status,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .leftJoin(routes, eq(teams.routeId, routes.id))
      .where(eq(teams.id, params.id))
      .limit(1);

    if (!team) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Team not found" } };
    }

    // Get team members
    const members = await db
      .select({
        id: teamMembers.id,
        userId: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        gender: users.gender,
        characterClass: users.characterClass,
        characterTitle: users.characterTitle,
        characterTier: users.characterTier,
        unlockedTitles: users.unlockedTitles,
        avatarUrl: users.avatarUrl,
        isCaptain: teamMembers.isCaptain,
        buddyRole: teamMembers.buddyRole,
        joinedAt: teamMembers.joinedAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, params.id));

    // Calculate individual participant scores
    const memberUserIds = members.map((m) => m.userId);
    let memberScoresMap = new Map<string, number>();
    if (memberUserIds.length > 0) {
      const memberScoreRows = await db
        .select({
          participantId: scoreTransactions.participantId,
          score: sql<number>`coalesce(sum(${scoreTransactions.amount}), 0)`,
        })
        .from(scoreTransactions)
        .where(inArray(scoreTransactions.participantId, memberUserIds))
        .groupBy(scoreTransactions.participantId);

      memberScoreRows.forEach((r) => {
        if (r.participantId) memberScoresMap.set(r.participantId, Number(r.score));
      });
    }

    const enrichedMembers = members.map((m) => ({
      ...m,
      totalScore: memberScoresMap.get(m.userId) || 0,
    }));

    // Calculate total score from ledger (team transactions or sum of members)
    const [scoreRow] = await db
      .select({ totalScore: sql<number>`coalesce(sum(${scoreTransactions.amount}), 0)` })
      .from(scoreTransactions)
      .where(or(eq(scoreTransactions.teamId, params.id), memberUserIds.length > 0 ? inArray(scoreTransactions.participantId, memberUserIds) : sql`1=0`));

    // Recent score history for team
    const scoreHistory = await db
      .select()
      .from(scoreTransactions)
      .where(or(eq(scoreTransactions.teamId, params.id), memberUserIds.length > 0 ? inArray(scoreTransactions.participantId, memberUserIds) : sql`1=0`))
      .orderBy(desc(scoreTransactions.createdAt))
      .limit(30);

    return {
      success: true,
      data: {
        ...team,
        totalScore: Number(scoreRow?.totalScore || 0),
        members: enrichedMembers,
        scoreHistory,
      },
    };
  })

  // POST /api/teams/:id/captain — Submitting & Setting Team Captain (Ketua Tim dari Peserta)
  .post(
    "/:id/captain",
    async ({ params, body, set }) => {
      const { captainId } = body;

      if (captainId) {
        const [member] = await db
          .select({
            id: teamMembers.id,
            role: users.role,
            fullName: users.fullName,
            username: users.username,
          })
          .from(teamMembers)
          .innerJoin(users, eq(teamMembers.userId, users.id))
          .where(and(eq(teamMembers.teamId, params.id), eq(teamMembers.userId, captainId)))
          .limit(1);

        if (!member) {
          set.status = 400;
          return {
            success: false,
            error: { code: "NOT_MEMBER", message: "Calon ketua tim harus merupakan anggota peserta di dalam tim ini." },
          };
        }

        if (member.role !== "PARTICIPANT") {
          set.status = 400;
          return {
            success: false,
            error: { code: "INVALID_CAPTAIN", message: "Ketua tim harus berasal dari peserta (mahasiswa), Buddy bertindak sebagai pendamping." },
          };
        }

        // Reset previous captain in team_members, then assign new captain
        await db.update(teamMembers).set({ isCaptain: false }).where(eq(teamMembers.teamId, params.id));
        await db
          .update(teamMembers)
          .set({ isCaptain: true })
          .where(and(eq(teamMembers.teamId, params.id), eq(teamMembers.userId, captainId)));

        // Update team captainId
        await db.update(teams).set({ captainId, updatedAt: new Date() }).where(eq(teams.id, params.id));

        return {
          success: true,
          message: `Berhasil menetapkan ${member.fullName} (@${member.username}) sebagai Ketua Tim!`,
        };
      } else {
        // Clear captain
        await db.update(teamMembers).set({ isCaptain: false }).where(eq(teamMembers.teamId, params.id));
        await db.update(teams).set({ captainId: null, updatedAt: new Date() }).where(eq(teams.id, params.id));

        return { success: true, message: "Ketua tim berhasil dikosongkan." };
      }
    },
    {
      body: t.Object({
        captainId: t.Nullable(t.String()),
      }),
    }
  )

  // POST /api/teams — Create team
  .post(
    "/",
    async ({ body, set }) => {
      const existing = await db
        .select()
        .from(teams)
        .where(eq(teams.code, body.code.toUpperCase().trim()))
        .limit(1);

      if (existing.length > 0) {
        set.status = 409;
        return { success: false, error: { code: "CODE_EXISTS", message: "Team code already exists" } };
      }

      const [team] = await db
        .insert(teams)
        .values({
          name: body.name.trim(),
          code: body.code.toUpperCase().trim(),
          routeId: body.routeId || null,
        })
        .returning();

      return { success: true, data: team };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        code: t.String({ minLength: 1 }),
        routeId: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // PUT /api/teams/:id — Update team
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name.trim();
      if (body.code) updates.code = body.code.toUpperCase().trim();
      if (body.routeId !== undefined) updates.routeId = body.routeId || null;
      if (body.status) updates.status = body.status;

      const [team] = await db
        .update(teams)
        .set(updates)
        .where(eq(teams.id, params.id))
        .returning();

      if (!team) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Team not found" } };
      }

      return { success: true, data: team };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        code: t.Optional(t.String()),
        routeId: t.Optional(t.Nullable(t.String())),
        status: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/teams/:id — Delete team
  .delete("/:id", async ({ params, set }) => {
    await db.delete(teamMembers).where(eq(teamMembers.teamId, params.id));
    const [team] = await db.delete(teams).where(eq(teams.id, params.id)).returning({ id: teams.id });
    if (!team) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Team not found" } };
    }
    return { success: true, data: { id: team.id } };
  })

  // POST /api/teams/:id/members — Add member to team
  .post(
    "/:id/members",
    async ({ params, body, set }) => {
      const [team] = await db.select().from(teams).where(eq(teams.id, params.id)).limit(1);
      if (!team) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Team not found" } };
      }

      // Remove previous team membership (1 user = 1 team)
      await db.delete(teamMembers).where(eq(teamMembers.userId, body.userId));

      const [member] = await db
        .insert(teamMembers)
        .values({
          teamId: params.id,
          userId: body.userId,
          buddyRole: (body.buddyRole as any) || null,
        })
        .returning();

      return { success: true, data: member };
    },
    {
      body: t.Object({
        userId: t.String(),
        buddyRole: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // POST /api/teams/:id/batch-members — Batch assign participants to team
  .post(
    "/:id/batch-members",
    async ({ params, body, set }) => {
      const [team] = await db.select().from(teams).where(eq(teams.id, params.id)).limit(1);
      if (!team) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Team not found" } };
      }

      const { userIds, buddyRole } = body;
      if (userIds.length === 0) {
        return { success: true, message: "No user IDs provided", count: 0 };
      }

      // Remove previous memberships
      await db.delete(teamMembers).where(inArray(teamMembers.userId, userIds));

      // Insert new memberships
      const inserts = userIds.map((userId) => ({
        teamId: params.id,
        userId,
        buddyRole: (buddyRole as any) || null,
      }));

      await db.insert(teamMembers).values(inserts);

      return {
        success: true,
        message: `Successfully assigned ${userIds.length} members to team ${team.name}`,
        count: userIds.length,
      };
    },
    {
      body: t.Object({
        userIds: t.Array(t.String()),
        buddyRole: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // DELETE /api/teams/:id/members/:userId — Remove member from team
  .delete("/:id/members/:userId", async ({ params, set }) => {
    const [member] = await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, params.userId))
      .returning({ id: teamMembers.id });

    if (!member) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Member not found" } };
    }
    return { success: true, data: { id: member.id } };
  });
