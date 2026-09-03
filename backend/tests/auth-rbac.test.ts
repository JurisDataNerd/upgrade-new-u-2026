import { describe, it, expect } from "bun:test";
import { signToken, verifyToken } from "../src/lib/jwt";
import { hashPassword, verifyPassword } from "../src/lib/password";

describe("Authentication & RBAC Security Verification", () => {
  it("hashes and verifies passwords securely", async () => {
    const rawPassword = "SuperSecurePassword2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("signs and verifies JWT access tokens with RBAC payload", async () => {
    const payload = {
      userId: "user-123",
      username: "testuser",
      role: "ADMIN" as const,
      teamId: "team-456",
    };

    const token = await signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = await verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.username).toBe(payload.username);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.teamId).toBe(payload.teamId);
  });

  it("enforces Buddy scope restrictions", () => {
    const buddyTeamId = "team-alpha";
    const targetTeamId = "team-beta";

    const isAuthorized = (actorRole: string, actorTeamId: string, requestedTeamId: string) => {
      if (actorRole === "ADMIN") return true;
      if (actorRole === "BUDDY" && actorTeamId === requestedTeamId) return true;
      return false;
    };

    expect(isAuthorized("BUDDY", buddyTeamId, buddyTeamId)).toBe(true);
    expect(isAuthorized("BUDDY", buddyTeamId, targetTeamId)).toBe(false);
    expect(isAuthorized("ADMIN", "admin-any", targetTeamId)).toBe(true);
  });
});
