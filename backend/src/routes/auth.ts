import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, teams, teamMembers } from "../db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
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

  // POST /api/auth/register-maba — Onboarding Registrasi Mahasiswa Baru (Hari 1)
  .post(
    "/register-maba",
    async ({ body, set, cookie }) => {
      const nim = (body.nim || body.username || "").trim();
      if (!nim) {
        set.status = 400;
        return { success: false, error: { code: "VALIDATION_ERROR", message: "NIM wajib diisi" } };
      }

      // Check if user already exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.username, nim))
        .limit(1);

      if (existing) {
        const token = await signToken({
          userId: existing.id,
          username: existing.username,
          role: existing.role,
        });
        return {
          success: true,
          message: "Akun mahasiswa sudah terdaftar, login otomatis!",
          data: {
            token,
            user: {
              id: existing.id,
              nim: existing.username,
              username: existing.username,
              fullName: existing.fullName,
              characterClass: existing.characterClass,
              characterTitle: existing.characterTitle,
              characterTier: existing.characterTier,
              avatarUrl: existing.avatarUrl,
            },
          },
        };
      }

      const passwordHash = await hashPassword(body.password || "genius2026");
      const fullName = (body.name || body.fullName || `Mahasiswa ${nim}`).trim();
      const characterClass = body.characterClass || "CYBER_KNIGHT";
      const avatarUrl = body.avatar || body.avatarUrl || null;

      const [newUser] = await db
        .insert(users)
        .values({
          username: nim,
          passwordHash,
          fullName,
          role: "PARTICIPANT",
          status: "ACTIVE",
          gender: body.gender || "MALE",
          characterClass,
          characterTitle: "Novice Adventurer",
          characterTier: 1,
          unlockedTitles: ["Novice Adventurer"],
          avatarUrl,
        })
        .returning();

      // Assign to team if specified or default team
      let targetTeamId = body.groupId || body.teamId;
      if (targetTeamId) {
        const [teamExists] = await db.select().from(teams).where(eq(teams.id, targetTeamId)).limit(1);
        if (teamExists) {
          await db.insert(teamMembers).values({
            teamId: targetTeamId,
            userId: newUser.id,
            isCaptain: false,
          });
        }
      } else {
        const [defaultTeam] = await db.select().from(teams).limit(1);
        if (defaultTeam) {
          targetTeamId = defaultTeam.id;
          await db.insert(teamMembers).values({
            teamId: defaultTeam.id,
            userId: newUser.id,
            isCaptain: false,
          });
        }
      }

      const token = await signToken({
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role,
        teamId: targetTeamId || undefined,
      });

      if (cookie && cookie.auth_token) {
        cookie.auth_token.set({
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 86400 * 3,
        });
      }

      return {
        success: true,
        message: "Pendaftaran berhasil, profil karakter RPG aktif!",
        data: {
          token,
          user: {
            id: newUser.id,
            nim: newUser.username,
            username: newUser.username,
            fullName: newUser.fullName,
            role: newUser.role,
            characterClass: newUser.characterClass,
            characterTitle: newUser.characterTitle,
            characterTier: newUser.characterTier,
            avatarUrl: newUser.avatarUrl,
            teamId: targetTeamId,
          },
        },
      };
    },
    {
      detail: {
        summary: "Registrasi onboarding Mahasiswa Baru (Hari 1)",
        description: "Mendaftarkan mahasiswa baru secara instan, mengaktifkan profil karakter RPG, dan mengembalikan token sesi JWT.",
      },
      body: t.Object({
        nim: t.Optional(t.String()),
        username: t.Optional(t.String()),
        name: t.Optional(t.String()),
        fullName: t.Optional(t.String()),
        email: t.Optional(t.String()),
        prodi: t.Optional(t.String()),
        faculty: t.Optional(t.String()),
        password: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        characterClass: t.Optional(t.String()),
        avatar: t.Optional(t.Nullable(t.String())),
        avatarUrl: t.Optional(t.Nullable(t.String())),
        groupId: t.Optional(t.String()),
        teamId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/auth/login-maba — Login Mahasiswa Baru via NIM
  .post(
    "/login-maba",
    async ({ body, set }) => {
      const nim = (body.nim || body.username || "").trim();
      const password = body.password || "genius2026";

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
          avatarUrl: users.avatarUrl,
          teamId: teams.id,
          teamName: teams.name,
          teamCode: teams.code,
        })
        .from(users)
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .leftJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(users.username, nim))
        .limit(1);

      if (!user) {
        set.status = 401;
        return { success: false, error: { code: "INVALID_CREDENTIALS", message: "NIM tidak ditemukan. Silakan registrasi terlebih dahulu." } };
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        set.status = 401;
        return { success: false, error: { code: "INVALID_CREDENTIALS", message: "Password salah" } };
      }

      const token = await signToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        teamId: user.teamId || undefined,
      });

      return {
        success: true,
        message: "Login MABA berhasil!",
        data: {
          token,
          user,
        },
      };
    },
    {
      detail: {
        summary: "Login Mahasiswa Baru berbasis NIM",
      },
      body: t.Object({
        nim: t.Optional(t.String()),
        username: t.Optional(t.String()),
        password: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/auth/login-admin — Login Panitia (Admin & Buddy)
  .post(
    "/login-admin",
    async ({ body, set }) => {
      const username = body.username.trim();
      const password = body.passcode || body.password || "";

      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          passwordHash: users.passwordHash,
          fullName: users.fullName,
          role: users.role,
          status: users.status,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user || (user.role !== "ADMIN" && user.role !== "BUDDY")) {
        set.status = 401;
        return { success: false, error: { code: "INVALID_CREDENTIALS", message: "Akun panitia tidak ditemukan" } };
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        set.status = 401;
        return { success: false, error: { code: "INVALID_CREDENTIALS", message: "Password atau passcode salah" } };
      }

      const token = await signToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      return {
        success: true,
        message: "Login Panitia berhasil!",
        data: {
          token,
          user,
        },
      };
    },
    {
      detail: {
        summary: "Login Admin & Buddy Panitia",
      },
      body: t.Object({
        username: t.String(),
        passcode: t.Optional(t.String()),
        password: t.Optional(t.String()),
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
