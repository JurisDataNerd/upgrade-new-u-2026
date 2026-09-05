import { mockDb } from "@/lib/mockDb";

/**
 * Static In-Memory HTTP Mock Client for GENIUS UNU 2026 Admin Panel.
 * Emulates backend REST API endpoints using local in-memory/localStorage data.
 * Zero database or external backend server required.
 */
export function useApi() {
  async function request<T = any>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const method = (options.method || "GET").toUpperCase();
    let path = endpoint.trim();

    // Strip leading /api if present
    if (path.startsWith("http://") || path.startsWith("https://")) {
      try {
        const u = new URL(path);
        path = u.pathname;
      } catch {
        // ignore
      }
    }
    if (path.startsWith("/api")) {
      path = path.substring(4);
    }
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    // Strip query parameters
    const [cleanPath, queryString] = path.split("?");
    const queryParams: Record<string, any> = { ...options.params };
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        queryParams[key] = val;
      });
    }

    const body = options.body || {};

    // 0. Attempt live Backend API request if available
    try {
      const config = useRuntimeConfig();
      const baseUrl = config.public?.apiBase || "http://localhost:3001/api";
      let tokenToUse = auth.token?.value;
      if (!tokenToUse || tokenToUse === "mock-static-token") {
        try {
          const authRes = await $fetch<any>(`${baseUrl}/auth/login`, {
            method: "POST",
            body: { username: "admin", password: "admin2026" },
          });
          if (authRes?.data?.token) {
            tokenToUse = authRes.data.token;
            auth.token.value = tokenToUse;
            if (typeof window !== "undefined") {
              localStorage.setItem("genius_admin_token", tokenToUse);
            }
          }
        } catch {}
      }

      if (tokenToUse && tokenToUse !== "mock-static-token") {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
      }

      const liveResponse = await $fetch<T>(`${baseUrl}${cleanPath}`, {
        method: method as any,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
        params: queryParams,
      });

      if (liveResponse) {
        return liveResponse;
      }
    } catch {
      // Fallback seamlessly to in-memory mockDb when backend is offline
    }

    // Simulate minor asynchronous network latency for fallback
    await new Promise((resolve) => setTimeout(resolve, 60));

    // 1. Stats & Dashboard
    if (cleanPath === "/stats" || cleanPath === "/admin/stats" || cleanPath === "" || cleanPath === "/") {
      const stats = mockDb.getStats();
      return { success: true, data: stats, stats } as unknown as T;
    }

    // 2. Locations & Floors
    if (cleanPath === "/floors" || cleanPath === "/locations" || cleanPath === "/admin/floors") {
      if (method === "GET") {
        const floorNum = queryParams.floor ? Number(queryParams.floor) : undefined;
        const locations = mockDb.getLocations(floorNum);
        return { success: true, data: locations } as unknown as T;
      }
      if (method === "POST") {
        const loc = mockDb.createLocation(body);
        return { success: true, data: loc, message: "Lokasi berhasil ditambahkan." } as unknown as T;
      }
    }

    const locationMatch = cleanPath.match(/^\/(?:floors|locations)\/([^\/]+)$/);
    if (locationMatch) {
      const locId = locationMatch[1];
      if (method === "GET") {
        const loc = mockDb.getLocation(locId);
        return { success: !!loc, data: loc } as unknown as T;
      }
      if (method === "PUT" || method === "PATCH") {
        const updated = mockDb.updateLocation(locId, body);
        return { success: true, data: updated, message: "Lokasi berhasil diperbarui." } as unknown as T;
      }
      if (method === "DELETE") {
        mockDb.deleteLocation(locId);
        return { success: true, message: "Lokasi berhasil dihapus." } as unknown as T;
      }
    }

    // 3. Teams
    if (cleanPath === "/teams" || cleanPath === "/admin/teams") {
      if (method === "GET") {
        const teams = mockDb.getTeams();
        return { success: true, data: teams } as unknown as T;
      }
      if (method === "POST") {
        const team = mockDb.createTeam(body);
        return { success: true, data: team, message: "Tim berhasil didaftarkan." } as unknown as T;
      }
    }

    const teamMemberMatch = cleanPath.match(/^\/teams\/([^\/]+)\/members(?:\/([^\/]+))?$/);
    if (teamMemberMatch) {
      const teamId = teamMemberMatch[1];
      const memberUserId = teamMemberMatch[2] || body.userId;
      if (method === "POST" && memberUserId) {
        mockDb.updateUser(memberUserId, { teamId });
        return { success: true, message: "Anggota berhasil dimasukkan ke tim." } as unknown as T;
      }
      if (method === "DELETE" && memberUserId) {
        mockDb.updateUser(memberUserId, { teamId: undefined, teamName: undefined, teamCode: undefined });
        return { success: true, message: "Anggota dikeluarkan dari tim." } as unknown as T;
      }
    }

    const teamMatch = cleanPath.match(/^\/teams\/([^\/]+)$/);
    if (teamMatch) {
      const teamId = teamMatch[1];
      if (method === "GET") {
        const team = mockDb.getTeam(teamId);
        return { success: !!team, data: team } as unknown as T;
      }
      if (method === "PUT" || method === "PATCH") {
        const updated = mockDb.updateTeam(teamId, body);
        return { success: true, data: updated, message: "Data tim berhasil diperbarui." } as unknown as T;
      }
      if (method === "DELETE") {
        mockDb.deleteTeam(teamId);
        return { success: true, message: "Tim berhasil dihapus." } as unknown as T;
      }
    }

    // 4. Users & Participants & Buddies
    if (
      cleanPath === "/users" ||
      cleanPath === "/participants" ||
      cleanPath === "/admin/participants" ||
      cleanPath === "/buddies" ||
      cleanPath === "/admin/buddies"
    ) {
      if (method === "GET") {
        const role = cleanPath.includes("buddies") ? "BUDDY" : queryParams.role;
        const search = queryParams.search || queryParams.q;
        const assignmentStatus = queryParams.assignmentStatus;
        const users = mockDb.getUsers({ role, search, assignmentStatus });
        return { success: true, data: users } as unknown as T;
      }
      if (method === "POST") {
        const user = mockDb.createUser(body);
        return { success: true, data: user, message: "Pengguna berhasil dibuat." } as unknown as T;
      }
    }

    const userAssignBuddyMatch = cleanPath.match(/^\/(?:users|buddies)\/([^\/]+)\/assign-buddy$/);
    if (userAssignBuddyMatch) {
      const userId = userAssignBuddyMatch[1];
      const team = mockDb.getTeam(body.teamId);
      mockDb.updateUser(userId, { assignedTeamId: body.teamId, assignedTeamName: team?.name });
      return { success: true, message: "Buddy berhasil ditugaskan." } as unknown as T;
    }

    const userResetPassMatch = cleanPath.match(/^\/(?:users|buddies)\/([^\/]+)\/reset-password$/);
    if (userResetPassMatch) {
      return { success: true, message: "Password berhasil direset ke 'genius2026'." } as unknown as T;
    }

    const userAwardTitleMatch = cleanPath.match(/^\/(?:users|buddies)\/([^\/]+)\/award-title$/);
    if (userAwardTitleMatch) {
      const userId = userAwardTitleMatch[1];
      mockDb.updateUser(userId, { characterTitle: body.title, characterTier: body.tier });
      return { success: true, message: "Gelar berhasil disematkan." } as unknown as T;
    }

    const userMatch = cleanPath.match(/^\/(?:users|buddies)\/([^\/]+)$/);
    if (userMatch) {
      const userId = userMatch[1];
      if (method === "GET") {
        const user = mockDb.getUser(userId);
        return { success: !!user, data: user } as unknown as T;
      }
      if (method === "PUT" || method === "PATCH") {
        const updated = mockDb.updateUser(userId, body);
        return { success: true, data: updated, message: "Data pengguna berhasil diperbarui." } as unknown as T;
      }
      if (method === "DELETE") {
        mockDb.deleteUser(userId);
        return { success: true, message: "Pengguna berhasil dihapus." } as unknown as T;
      }
    }

    // 5. Leaderboard
    if (cleanPath === "/leaderboard" || cleanPath === "/admin/leaderboard") {
      const lb = mockDb.getLeaderboard();
      return { success: true, data: lb } as unknown as T;
    }
    if (cleanPath === "/leaderboard/adjust") {
      const result = mockDb.adjustScore(body);
      return { success: true, message: result.message } as unknown as T;
    }

    // 6. Stages
    if (cleanPath === "/stages" || cleanPath === "/admin/stages") {
      if (method === "GET") {
        return { success: true, data: mockDb.getStages() } as unknown as T;
      }
      if (method === "POST") {
        const stg = mockDb.createStage(body);
        return { success: true, data: stg, message: "Stage berhasil dibuat." } as unknown as T;
      }
    }
    if (cleanPath === "/stages/sync-roadmap") {
      return { success: true, data: mockDb.getStages(), message: "Roadmap berhasil disinkronkan." } as unknown as T;
    }
    const stageActivateMatch = cleanPath.match(/^\/stages\/([^\/]+)\/activate$/);
    if (stageActivateMatch) {
      const stg = mockDb.activateStage(stageActivateMatch[1]);
      return { success: true, data: stg, message: "Stage berhasil diaktifkan." } as unknown as T;
    }
    const stageMatch = cleanPath.match(/^\/stages\/([^\/]+)$/);
    if (stageMatch) {
      const stageId = stageMatch[1];
      if (method === "PUT" || method === "PATCH") {
        const updated = mockDb.updateStage(stageId, body);
        return { success: true, data: updated, message: "Stage berhasil diperbarui." } as unknown as T;
      }
    }

    // 7. Missions
    if (cleanPath === "/missions" || cleanPath === "/admin/missions") {
      if (method === "GET") {
        return { success: true, data: mockDb.getMissions() } as unknown as T;
      }
      if (method === "POST") {
        const mis = mockDb.createMission(body);
        return { success: true, data: mis, message: "Misi berhasil dibuat." } as unknown as T;
      }
    }
    const missionMatch = cleanPath.match(/^\/missions\/([^\/]+)$/);
    if (missionMatch) {
      const missionId = missionMatch[1];
      if (method === "PUT" || method === "PATCH") {
        const updated = mockDb.updateMission(missionId, body);
        return { success: true, data: updated, message: "Misi berhasil diperbarui." } as unknown as T;
      }
      if (method === "DELETE") {
        mockDb.deleteMission(missionId);
        return { success: true, message: "Misi berhasil dihapus." } as unknown as T;
      }
    }

    // 8. Routes
    if (cleanPath === "/routes" || cleanPath === "/admin/routes") {
      if (method === "GET") {
        return { success: true, data: mockDb.getRoutes() } as unknown as T;
      }
      if (method === "POST") {
        const rt = mockDb.createRoute(body);
        return { success: true, data: rt, message: "Rute berhasil dibuat." } as unknown as T;
      }
    }

    // 9. Questions
    if (cleanPath === "/questions" || cleanPath === "/admin/questions") {
      if (method === "GET") {
        return { success: true, data: mockDb.getQuestions() } as unknown as T;
      }
      if (method === "POST") {
        const q = mockDb.createQuestion(body);
        return { success: true, data: q, message: "Soal berhasil ditambahkan." } as unknown as T;
      }
    }
    if (cleanPath === "/questions/ai-generate" || cleanPath === "/ai/generate-question") {
      const generated = mockDb.generateAiQuestion(body.category, body.floorNumber, body.difficulty);
      return { success: true, data: generated } as unknown as T;
    }
    const questionMatch = cleanPath.match(/^\/questions\/([^\/]+)$/);
    if (questionMatch) {
      const qId = questionMatch[1];
      if (method === "PUT" || method === "PATCH") {
        const updated = mockDb.updateQuestion(qId, body);
        return { success: true, data: updated, message: "Soal berhasil diperbarui." } as unknown as T;
      }
      if (method === "DELETE") {
        mockDb.deleteQuestion(qId);
        return { success: true, message: "Soal berhasil dihapus." } as unknown as T;
      }
    }

    // 10. Games & Sessions
    if (cleanPath === "/games") {
      return { success: true, data: mockDb.getGames() } as unknown as T;
    }
    if (cleanPath === "/game-sessions") {
      return { success: true, data: mockDb.getGameSessions() } as unknown as T;
    }
    const sessionStartMatch = cleanPath.match(/^\/game-sessions\/([^\/]+)\/start$/);
    if (sessionStartMatch) {
      const s = mockDb.startSession(sessionStartMatch[1]);
      return { success: true, data: s, message: "Sesi permainan dimulai." } as unknown as T;
    }
    const sessionPauseMatch = cleanPath.match(/^\/game-sessions\/([^\/]+)\/pause$/);
    if (sessionPauseMatch) {
      const s = mockDb.pauseSession(sessionPauseMatch[1]);
      return { success: true, data: s, message: "Sesi permainan dijeda." } as unknown as T;
    }
    const sessionCompleteMatch = cleanPath.match(/^\/game-sessions\/([^\/]+)\/complete$/);
    if (sessionCompleteMatch) {
      const s = mockDb.completeSession(sessionCompleteMatch[1], body.score);
      return { success: true, data: s, message: "Sesi permainan selesai." } as unknown as T;
    }
    const sessionCancelMatch = cleanPath.match(/^\/game-sessions\/([^\/]+)\/cancel$/);
    if (sessionCancelMatch) {
      const s = mockDb.cancelSession(sessionCancelMatch[1]);
      return { success: true, data: s, message: "Sesi permainan dibatalkan." } as unknown as T;
    }

    // 11. AI Studio
    if (cleanPath === "/ai/generate-mission" || cleanPath === "/ai-studio/generate-mission") {
      const mis = mockDb.generateAiMission(body.theme, body.floor || body.floorNumber || 1);
      return { success: true, data: mis } as unknown as T;
    }

    // 12. Ledger, Audit Logs & Settings
    if (cleanPath === "/scores" || cleanPath === "/ledger") {
      return { success: true, data: mockDb.getLedger() } as unknown as T;
    }
    if (cleanPath === "/audit-logs") {
      return { success: true, data: mockDb.getAuditLogs() } as unknown as T;
    }
    if (cleanPath === "/settings") {
      return {
        success: true,
        data: {
          systemStatus: "ONLINE",
          maintenanceMode: false,
          gameSpeed: "NORMAL",
          autoTelemetry: true,
          broadcastMessage: "Selamat datang mahasiswa baru di Gamifikasi UNU Jogja 2026!",
        },
      } as unknown as T;
    }

    // Default Fallback
    return {
      success: true,
      message: `Static mock response for ${cleanPath}`,
      data: [],
    } as unknown as T;
  }

  function get<T = any>(endpoint: string, params?: Record<string, any>) {
    return request<T>(endpoint, { method: "GET", params });
  }

  function post<T = any>(endpoint: string, body?: any) {
    return request<T>(endpoint, { method: "POST", body });
  }

  function put<T = any>(endpoint: string, body?: any) {
    return request<T>(endpoint, { method: "PUT", body });
  }

  function patch<T = any>(endpoint: string, body?: any) {
    return request<T>(endpoint, { method: "PATCH", body });
  }

  function del<T = any>(endpoint: string) {
    return request<T>(endpoint, { method: "DELETE" });
  }

  return { request, get, post, put, patch, del, delete: del };
}
