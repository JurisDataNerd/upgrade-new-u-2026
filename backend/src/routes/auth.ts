import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, teams, teamMembers } from "../db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { verifyPassword } from "../lib/password";
import { authMiddleware, requireUser } from "../middleware/auth";

export const authRoutes = new Elysia({
  prefix: "/api/auth",
  detail: {
    tags: ["Auth & Session"],
  },
})
  .use(authMiddleware)

  // POST /api/auth/login
  .post(
    "/login",
    async ({ body, set, cookie }) => {
      const { username, password } = body;

      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          passwordHash: users.passwordHash,
          fullName: users.fullName,
          role: users.role,
          status: users.status,
          gender: users.gender,
          characterClass: users.characterClass,
          characterTitle: users.characterTitle,
          characterTier: users.characterTier,
          unlockedTitles: users.unlockedTitles,
          avatarUrl: users.avatarUrl,
          teamId: teams.id,
          teamName: teams.name,
          teamCode: teams.code,
        })
        .from(users)
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .leftJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(users.username, username.trim()))
        .limit(1);

      if (!user) {
        set.status = 401;
        return { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" } };
      }

      if (user.status !== "ACTIVE") {
        set.status = 403;
        return { success: false, error: { code: "ACCOUNT_INACTIVE", message: "Account is inactive" } };
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        set.status = 401;
        return { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" } };
      }

      const token = await signToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        teamId: user.teamId || undefined,
      });

      // Set httpOnly cookie for secure auth
      if (cookie && cookie.auth_token) {
        cookie.auth_token.set({
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 86400 * 3, // 3 days
        });
      }

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            gender: user.gender || "MALE",
            characterClass: user.characterClass || "CYBER_KNIGHT",
            characterTitle: user.characterTitle || "Novice Adventurer",
            characterTier: user.characterTier || 1,
            unlockedTitles: user.unlockedTitles || ["Novice Adventurer"],
            avatarUrl: user.avatarUrl,
            teamId: user.teamId,
            teamName: user.teamName,
            teamCode: user.teamCode,
          },
        },
      };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // POST /api/auth/logout — Clears auth token cookie
  .post("/logout", async ({ cookie }) => {
    if (cookie && cookie.auth_token) {
      cookie.auth_token.remove();
    }
    return {
      success: true,
      message: "Successfully logged out",
    };
  })

  // POST /api/auth/refresh-token — Refresh JWT token for active session
  .post("/refresh-token", async ({ user, set, cookie }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
    }

    const [activeUser] = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        status: users.status,
        teamId: teamMembers.teamId,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!activeUser || activeUser.status !== "ACTIVE") {
      set.status = 401;
      return { success: false, error: { code: "ACCOUNT_INACTIVE", message: "Account is no longer active" } };
    }

    const newToken = await signToken({
      userId: activeUser.id,
      username: activeUser.username,
      role: activeUser.role,
      teamId: activeUser.teamId || undefined,
    });

    if (cookie && cookie.auth_token) {
      cookie.auth_token.set({
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 3,
      });
    }

    return {
      success: true,
      data: {
        token: newToken,
      },
    };
  })

  // Authenticated Profile Routes
  .use(requireUser)

  // GET /api/auth/me — Current logged in user info with team & RPG profile
  .get("/me", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
    }

    const [userData] = await db
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
        teamId: teams.id,
        teamName: teams.name,
        teamCode: teams.code,
        buddyRole: teamMembers.buddyRole,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!userData) {
      set.status = 404;
      return { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } };
    }

    return {
      success: true,
      data: {
        ...userData,
        gender: userData.gender || "MALE",
        characterClass: userData.characterClass || "CYBER_KNIGHT",
        characterTitle: userData.characterTitle || "Novice Adventurer",
        characterTier: userData.characterTier || 1,
        unlockedTitles: userData.unlockedTitles || ["Novice Adventurer"],
      },
    };
  })

  // PUT /api/auth/profile — Update own RPG Profile (Avatar, Gender, Character Class, Title, Full Name)
  .put(
    "/profile",
    async ({ user, body, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
      }

      const updates: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (body.fullName !== undefined) updates.fullName = body.fullName.trim();
      if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl;
      if (body.gender !== undefined) updates.gender = body.gender;
      if (body.characterClass !== undefined) updates.characterClass = body.characterClass;
      if (body.characterTitle !== undefined) updates.characterTitle = body.characterTitle.trim();
      if (body.characterTier !== undefined) updates.characterTier = body.characterTier;

      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, user.userId))
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

      if (!updatedUser) {
        set.status = 404;
        return { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } };
      }

      return {
        success: true,
        message: "Profil karakter petualang berhasil diperbarui!",
        data: updatedUser,
      };
    },
    {
      body: t.Object({
        fullName: t.Optional(t.String()),
        avatarUrl: t.Optional(t.Nullable(t.String())),
        gender: t.Optional(t.String()),
        characterClass: t.Optional(t.String()),
        characterTitle: t.Optional(t.String()),
        characterTier: t.Optional(t.Number()),
      }),
    }
  );
