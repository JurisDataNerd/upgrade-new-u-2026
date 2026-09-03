import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, teams, teamMembers, scoreTransactions } from "../db/schema";
import { eq, like, or, sql, desc, inArray, and } from "drizzle-orm";
import { hashPassword } from "../lib/password";
import { requireAdmin } from "../middleware/auth";
import { RPG_CHARACTERS, TITLE_CATALOG, PRESET_AVATARS } from "@genius/types";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  // GET /api/users/rpg-catalog — Public/Authenticated catalog of RPG Classes, Evolution & Titles
  .get("/rpg-catalog", () => {
    return {
      success: true,
      data: {
        characters: Object.values(RPG_CHARACTERS),
        titles: TITLE_CATALOG,
        avatars: PRESET_AVATARS,
      },
    };
  })

  .use(requireAdmin)

  // GET /api/users — List all users with team info, RPG fields, and score aggregation
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const search = (query.search || "").trim();
    const role = (query.role || "").trim();
    const teamId = (query.teamId || "").trim();
    const assignmentStatus = (query.assignmentStatus || "").trim(); // "assigned" | "unassigned"
    const gender = (query.gender || "").trim();
    const characterClass = (query.characterClass || "").trim();
    const tier = (query.tier || "").trim();

    // Subquery for total participant score
    const userScoreSubquery = db
      .select({
        participantId: scoreTransactions.participantId,
        totalScore: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_score"),
      })
      .from(scoreTransactions)
      .groupBy(scoreTransactions.participantId)
      .as("sq_score");

    // Subquery for total bonus points granted by a buddy
    const buddyBonusSubquery = db
      .select({
        buddyId: scoreTransactions.createdBy,
        totalBonusGiven: sql<number>`COALESCE(SUM(${scoreTransactions.amount}), 0)`.as("total_bonus_given"),
      })
      .from(scoreTransactions)
      .where(eq(scoreTransactions.sourceType, "BONUS"))
      .groupBy(scoreTransactions.createdBy)
      .as("sq_buddy_bonus");

    let baseQuery = db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
        gender: users.gender,
        characterClass: users.characterClass,
        characterTitle: users.characterTitle,
        characterTier: users.characterTier,
        unlockedTitles: users.unlockedTitles,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        teamMemberId: teamMembers.id,
        teamId: teams.id,
        teamName: teams.name,
        teamCode: teams.code,
        buddyRole: teamMembers.buddyRole,
        joinedTeamAt: teamMembers.joinedAt,
        totalScore: sql<number>`COALESCE(${userScoreSubquery.totalScore}, 0)`,
        bonusSpent: sql<number>`COALESCE(${buddyBonusSubquery.totalBonusGiven}, 0)`,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .leftJoin(userScoreSubquery, eq(users.id, userScoreSubquery.participantId))
      .leftJoin(buddyBonusSubquery, eq(users.id, buddyBonusSubquery.buddyId))
      .$dynamic();

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.username, `%${search}%`),
          like(users.characterTitle, `%${search}%`)
        )
      );
    }
    if (role) {
      conditions.push(eq(users.role, role as any));
    }
    if (teamId) {
      conditions.push(eq(teams.id, teamId));
    }
    if (assignmentStatus === "assigned") {
      conditions.push(sql`${teams.id} IS NOT NULL`);
    } else if (assignmentStatus === "unassigned") {
      conditions.push(sql`${teams.id} IS NULL`);
    }
    if (gender) {
      conditions.push(eq(users.gender, gender));
    }
    if (characterClass) {
      conditions.push(eq(users.characterClass, characterClass));
    }
    if (tier) {
      conditions.push(eq(users.characterTier, Number(tier)));
    }

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    const data = await baseQuery
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Count total with conditions
    let countQuery = db
      .select({ count: sql<number>`count(DISTINCT ${users.id})` })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .$dynamic();

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const [{ count }] = await countQuery;

    return {
      success: true,
      data,
      meta: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    };
  })

  // GET /api/users/:id — Get single user with full profile & ledger
  .get("/:id", async ({ params, set }) => {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
        gender: users.gender,
        characterClass: users.characterClass,
        characterTitle: users.characterTitle,
        characterTier: users.characterTier,
        unlockedTitles: users.unlockedTitles,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        teamId: teams.id,
        teamName: teams.name,
        teamCode: teams.code,
        buddyRole: teamMembers.buddyRole,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.id, params.id))
      .limit(1);

    if (!user) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
    }

    // Fetch score history if participant
    const scoreHistory = await db
      .select()
      .from(scoreTransactions)
      .where(eq(scoreTransactions.participantId, params.id))
      .orderBy(desc(scoreTransactions.createdAt))
      .limit(50);

    const totalScore = scoreHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Fetch bonus transactions awarded by this buddy (if role is BUDDY)
    let bonusAwardsGiven: any[] = [];
    let assignedSquadMembers: any[] = [];

    if (user.role === "BUDDY") {
      bonusAwardsGiven = await db
        .select({
          id: scoreTransactions.id,
          amount: scoreTransactions.amount,
          reason: scoreTransactions.reason,
          stageId: scoreTransactions.stageId,
          participantId: scoreTransactions.participantId,
          recipientName: users.fullName,
          recipientUsername: users.username,
          createdAt: scoreTransactions.createdAt,
        })
        .from(scoreTransactions)
        .leftJoin(users, eq(scoreTransactions.participantId, users.id))
        .where(eq(scoreTransactions.createdBy, params.id))
        .orderBy(desc(scoreTransactions.createdAt))
        .limit(50);

      // If assigned to a team, fetch the team's participants
      if (user.teamId) {
        assignedSquadMembers = await db
          .select({
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            role: users.role,
            gender: users.gender,
            characterClass: users.characterClass,
            characterTitle: users.characterTitle,
            characterTier: users.characterTier,
            avatarUrl: users.avatarUrl,
            joinedAt: teamMembers.joinedAt,
          })
          .from(teamMembers)
          .innerJoin(users, eq(teamMembers.userId, users.id))
          .where(eq(teamMembers.teamId, user.teamId));
      }
    }

    const bonusSpent = bonusAwardsGiven.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
      success: true,
      data: {
        ...user,
        totalScore,
        bonusSpent,
        scoreHistory,
        bonusAwardsGiven,
        assignedSquadMembers,
      },
    };
  })

  // POST /api/users — Create single user
  .post(
    "/",
    async ({ body, set }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, body.username))
        .limit(1);

      if (existing.length > 0) {
        set.status = 409;
        return { success: false, error: { code: "USERNAME_EXISTS", message: "Username already exists" } };
      }

      const passwordHash = await hashPassword(body.password || "genius2026");
      const [user] = await db
        .insert(users)
        .values({
          username: body.username,
          passwordHash,
          fullName: body.fullName,
          role: (body.role as any) || "PARTICIPANT",
          status: (body.status as any) || "ACTIVE",
          gender: body.gender || "MALE",
          characterClass: body.characterClass || "CYBER_KNIGHT",
          characterTitle: body.characterTitle || "Novice Adventurer",
          characterTier: body.characterTier || 1,
          unlockedTitles: body.unlockedTitles || ["Novice Adventurer"],
          avatarUrl: body.avatarUrl || null,
        })
        .returning();

      // If teamId is supplied, assign to team
      if (body.teamId) {
        await db.insert(teamMembers).values({
          teamId: body.teamId,
          userId: user.id,
          buddyRole: (body.buddyRole as any) || (body.role === "BUDDY" ? "PRIMARY" : null),
        });
      }

      return { success: true, data: user };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
        password: t.Optional(t.String({ minLength: 4 })),
        fullName: t.String({ minLength: 1 }),
        role: t.Optional(t.String()),
        status: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        characterClass: t.Optional(t.String()),
        characterTitle: t.Optional(t.String()),
        characterTier: t.Optional(t.Number()),
        unlockedTitles: t.Optional(t.Array(t.String())),
        avatarUrl: t.Optional(t.Nullable(t.String())),
        teamId: t.Optional(t.Nullable(t.String())),
        buddyRole: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // POST /api/users/bulk-import — Bulk import participants / users from CSV/JSON
  .post(
    "/bulk-import",
    async ({ body }) => {
      const { items, defaultPassword = "genius2026", defaultRole = "PARTICIPANT" } = body;
      const defaultHash = await hashPassword(defaultPassword);

      const allTeams = await db.select().from(teams);
      const teamCodeMap = new Map(allTeams.map((t) => [t.code.toLowerCase(), t.id]));
      const teamNameMap = new Map(allTeams.map((t) => [t.name.toLowerCase(), t.id]));

      let successCount = 0;
      let skippedCount = 0;
      const errors: Array<{ row: number; username: string; message: string }> = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const username = item.username?.trim();
        const fullName = item.fullName?.trim() || username;

        if (!username) {
          errors.push({ row: i + 1, username: "", message: "Username cannot be empty" });
          continue;
        }

        try {
          const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

          let userId = existing?.id;

          if (!existing) {
            const pwdHash = item.password ? await hashPassword(item.password) : defaultHash;
            const [created] = await db
              .insert(users)
              .values({
                username,
                passwordHash: pwdHash,
                fullName,
                role: (item.role as any) || defaultRole,
                status: "ACTIVE",
                gender: item.gender || "MALE",
                characterClass: item.characterClass || "CYBER_KNIGHT",
                characterTitle: item.characterTitle || "Novice Adventurer",
                characterTier: item.characterTier || 1,
                unlockedTitles: item.unlockedTitles || ["Novice Adventurer"],
                avatarUrl: item.avatarUrl || null,
              })
              .returning();
            userId = created.id;
            successCount++;
          } else {
            // Update existing user's RPG metadata if provided
            const updates: Record<string, any> = {};
            if (item.gender) updates.gender = item.gender;
            if (item.characterClass) updates.characterClass = item.characterClass;
            if (item.characterTitle) updates.characterTitle = item.characterTitle;
            if (item.characterTier) updates.characterTier = item.characterTier;
            if (item.avatarUrl) updates.avatarUrl = item.avatarUrl;
            if (Object.keys(updates).length > 0) {
              await db.update(users).set(updates).where(eq(users.id, existing.id));
            }
            skippedCount++;
          }

          // Handle Team Assignment if teamCode or teamName is specified
          if (item.teamCode || item.teamName) {
            const codeKey = item.teamCode?.toLowerCase().trim();
            const nameKey = item.teamName?.toLowerCase().trim();
            const matchedTeamId = (codeKey && teamCodeMap.get(codeKey)) || (nameKey && teamNameMap.get(nameKey));

            if (matchedTeamId && userId) {
              // Remove old team membership if any
              await db.delete(teamMembers).where(eq(teamMembers.userId, userId));
              await db.insert(teamMembers).values({
                teamId: matchedTeamId,
                userId,
                buddyRole: (item.buddyRole as any) || (item.role === "BUDDY" ? "PRIMARY" : null),
              });
            }
          }
        } catch (err: any) {
          errors.push({ row: i + 1, username, message: err.message || "Insert failed" });
        }
      }

      return {
        success: true,
        data: {
          totalProcessed: items.length,
          successCount,
          skippedCount,
          errorCount: errors.length,
          errors,
        },
      };
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            username: t.String(),
            fullName: t.Optional(t.String()),
            password: t.Optional(t.String()),
            role: t.Optional(t.String()),
            gender: t.Optional(t.String()),
            characterClass: t.Optional(t.String()),
            characterTitle: t.Optional(t.String()),
            characterTier: t.Optional(t.Number()),
            unlockedTitles: t.Optional(t.Array(t.String())),
            avatarUrl: t.Optional(t.Nullable(t.String())),
            teamCode: t.Optional(t.String()),
            teamName: t.Optional(t.String()),
            buddyRole: t.Optional(t.String()),
          })
        ),
        defaultPassword: t.Optional(t.String()),
        defaultRole: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/users/batch-assign-team — Batch assign multiple participants/buddies to a team
  .post(
    "/batch-assign-team",
    async ({ body }) => {
      const { userIds, teamId, buddyRole } = body;

      if (!userIds || userIds.length === 0) {
        return { success: true, message: "No users provided" };
      }

      // Remove existing team memberships for these users
      await db.delete(teamMembers).where(inArray(teamMembers.userId, userIds));

      // If teamId is specified, assign all to this team
      if (teamId) {
        const valuesToInsert = userIds.map((userId) => ({
          teamId,
          userId,
          buddyRole: (buddyRole as any) || null,
        }));
        await db.insert(teamMembers).values(valuesToInsert);
      }

      return {
        success: true,
        data: {
          affectedUsers: userIds.length,
          teamId: teamId || null,
        },
      };
    },
    {
      body: t.Object({
        userIds: t.Array(t.String()),
        teamId: t.Optional(t.Nullable(t.String())),
        buddyRole: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // POST /api/users/:id/reset-password — Quick password reset
  .post(
    "/:id/reset-password",
    async ({ params, body, set }) => {
      const newPassword = body.password || "genius2026";
      const passwordHash = await hashPassword(newPassword);

      const [user] = await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, params.id))
        .returning({ id: users.id, username: users.username });

      if (!user) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
      }

      return { success: true, message: `Password for ${user.username} reset successfully` };
    },
    {
      body: t.Object({
        password: t.Optional(t.String({ minLength: 4 })),
      }),
    }
  )

  // POST /api/users/:id/assign-buddy — Assign / Reassign a Buddy to a specific team
  .post(
    "/:id/assign-buddy",
    async ({ params, body, set }) => {
      const { teamId, buddyRole = "PRIMARY" } = body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, params.id))
        .limit(1);

      if (!user) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Buddy user not found" } };
      }

      // 1 Buddy = 1 Team Rule: Remove any prior team assignment
      await db.delete(teamMembers).where(eq(teamMembers.userId, params.id));

      if (teamId) {
        // Check maximum 3 buddies per team
        const currentBuddies = await db
          .select()
          .from(teamMembers)
          .innerJoin(users, eq(teamMembers.userId, users.id))
          .where(and(eq(teamMembers.teamId, teamId), eq(users.role, "BUDDY")));

        if (currentBuddies.length >= 3) {
          set.status = 400;
          return {
            success: false,
            error: {
              code: "MAX_BUDDIES_REACHED",
              message: "Tim ini sudah memiliki batas maksimum 3 Buddy.",
            },
          };
        }

        // Insert new assignment
        await db.insert(teamMembers).values({
          teamId,
          userId: params.id,
          buddyRole: buddyRole as any,
        });
      }

      return {
        success: true,
        data: {
          buddyId: params.id,
          teamId: teamId || null,
          buddyRole: teamId ? buddyRole : null,
        },
      };
    },
    {
      body: t.Object({
        teamId: t.Optional(t.Nullable(t.String())),
        buddyRole: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/users/:id — Update user
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (body.fullName) updates.fullName = body.fullName;
      if (body.role) updates.role = body.role;
      if (body.status) updates.status = body.status;
      if (body.gender !== undefined) updates.gender = body.gender;
      if (body.characterClass !== undefined) updates.characterClass = body.characterClass;
      if (body.characterTitle !== undefined) updates.characterTitle = body.characterTitle;
      if (body.characterTier !== undefined) updates.characterTier = body.characterTier;
      if (body.unlockedTitles !== undefined) updates.unlockedTitles = body.unlockedTitles;
      if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl;
      if (body.password) updates.passwordHash = await hashPassword(body.password);

      const [user] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, params.id))
        .returning({
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          role: users.role,
          status: users.status,
          gender: users.gender,
          characterClass: users.characterClass,
          characterTitle: users.characterTitle,
          characterTier: users.characterTier,
          unlockedTitles: users.unlockedTitles,
          avatarUrl: users.avatarUrl,
        });

      if (!user) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
      }

      // Update team if provided
      if (body.teamId !== undefined) {
        await db.delete(teamMembers).where(eq(teamMembers.userId, params.id));
        if (body.teamId) {
          await db.insert(teamMembers).values({
            teamId: body.teamId,
            userId: params.id,
            buddyRole: (body.buddyRole as any) || (user.role === "BUDDY" ? "PRIMARY" : null),
          });
        }
      }

      return { success: true, data: user };
    },
    {
      body: t.Object({
        fullName: t.Optional(t.String()),
        role: t.Optional(t.String()),
        status: t.Optional(t.String()),
        password: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        characterClass: t.Optional(t.String()),
        characterTitle: t.Optional(t.String()),
        characterTier: t.Optional(t.Number()),
        unlockedTitles: t.Optional(t.Array(t.String())),
        avatarUrl: t.Optional(t.Nullable(t.String())),
        teamId: t.Optional(t.Nullable(t.String())),
        buddyRole: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // POST /api/users/:id/award-title — Award a title & optionally upgrade character tier
  .post(
    "/:id/award-title",
    async ({ params, body, set }) => {
      const { title, upgradeTier } = body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, params.id))
        .limit(1);

      if (!user) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
      }

      const currentTitles = (user.unlockedTitles as string[]) || ["Novice Adventurer"];
      const newTitles = Array.from(new Set([...currentTitles, title]));

      const updates: Record<string, any> = {
        unlockedTitles: newTitles,
        characterTitle: title,
        updatedAt: new Date(),
      };

      if (upgradeTier !== undefined) {
        updates.characterTier = upgradeTier;
      }

      const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, params.id))
        .returning({
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          characterClass: users.characterClass,
          characterTitle: users.characterTitle,
          characterTier: users.characterTier,
          unlockedTitles: users.unlockedTitles,
        });

      return {
        success: true,
        message: `Gelar '${title}' berhasil disematkan kepada ${updated.fullName}!`,
        data: updated,
      };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        upgradeTier: t.Optional(t.Number()),
      }),
    }
  )

  // DELETE /api/users/:id — Delete user
  .delete("/:id", async ({ params, set }) => {
    // Delete team membership first
    await db.delete(teamMembers).where(eq(teamMembers.userId, params.id));

    const [user] = await db
      .delete(users)
      .where(eq(users.id, params.id))
      .returning({ id: users.id });

    if (!user) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
    }

    return { success: true, data: { id: user.id } };
  });

