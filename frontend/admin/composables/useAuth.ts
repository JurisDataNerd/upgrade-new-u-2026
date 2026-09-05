import { ref, computed } from "vue";
import { navigateTo } from "#app";
import { OFFICIAL_BUDDIES, findBuddyByQuery, type OfficialBuddy } from "@/lib/officialBuddies";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "BUDDY";
  teamId?: string;
  teamName?: string;
  assignedFloor?: number;
  prodi?: string;
  faculty?: string;
  gender?: "MALE" | "FEMALE";
  avatarUrl?: string;
}

export const defaultAdmin: User = {
  id: "usr-admin",
  username: "admin",
  fullName: "Super Admin GENIUS 2026",
  role: "ADMIN",
  avatarUrl: "/unu.png",
};

// Official Buddies Presets
export const defaultBuddy01: User = {
  id: OFFICIAL_BUDDIES[0].id,
  username: OFFICIAL_BUDDIES[0].username,
  fullName: OFFICIAL_BUDDIES[0].fullName,
  role: "BUDDY",
  teamId: OFFICIAL_BUDDIES[0].teamId,
  teamName: OFFICIAL_BUDDIES[0].teamName,
  assignedFloor: OFFICIAL_BUDDIES[0].assignedFloor,
  prodi: OFFICIAL_BUDDIES[0].prodi,
  faculty: OFFICIAL_BUDDIES[0].faculty,
  gender: OFFICIAL_BUDDIES[0].gender,
  avatarUrl: OFFICIAL_BUDDIES[0].avatarUrl,
};

export const defaultBuddy02: User = {
  id: OFFICIAL_BUDDIES[1].id,
  username: OFFICIAL_BUDDIES[1].username,
  fullName: OFFICIAL_BUDDIES[1].fullName,
  role: "BUDDY",
  teamId: OFFICIAL_BUDDIES[1].teamId,
  teamName: OFFICIAL_BUDDIES[1].teamName,
  assignedFloor: OFFICIAL_BUDDIES[1].assignedFloor,
  prodi: OFFICIAL_BUDDIES[1].prodi,
  faculty: OFFICIAL_BUDDIES[1].faculty,
  gender: OFFICIAL_BUDDIES[1].gender,
  avatarUrl: OFFICIAL_BUDDIES[1].avatarUrl,
};

export const defaultBuddy03: User = {
  id: OFFICIAL_BUDDIES[2].id,
  username: OFFICIAL_BUDDIES[2].username,
  fullName: OFFICIAL_BUDDIES[2].fullName,
  role: "BUDDY",
  teamId: OFFICIAL_BUDDIES[2].teamId,
  teamName: OFFICIAL_BUDDIES[2].teamName,
  assignedFloor: OFFICIAL_BUDDIES[2].assignedFloor,
  prodi: OFFICIAL_BUDDIES[2].prodi,
  faculty: OFFICIAL_BUDDIES[2].faculty,
  gender: OFFICIAL_BUDDIES[2].gender,
  avatarUrl: OFFICIAL_BUDDIES[2].avatarUrl,
};

export const defaultBuddy07: User = {
  id: OFFICIAL_BUDDIES[6].id,
  username: OFFICIAL_BUDDIES[6].username,
  fullName: OFFICIAL_BUDDIES[6].fullName,
  role: "BUDDY",
  teamId: OFFICIAL_BUDDIES[6].teamId,
  teamName: OFFICIAL_BUDDIES[6].teamName,
  assignedFloor: OFFICIAL_BUDDIES[6].assignedFloor,
  prodi: OFFICIAL_BUDDIES[6].prodi,
  faculty: OFFICIAL_BUDDIES[6].faculty,
  gender: OFFICIAL_BUDDIES[6].gender,
  avatarUrl: OFFICIAL_BUDDIES[6].avatarUrl,
};

export const defaultBuddy22: User = {
  id: OFFICIAL_BUDDIES[21].id,
  username: OFFICIAL_BUDDIES[21].username,
  fullName: OFFICIAL_BUDDIES[21].fullName,
  role: "BUDDY",
  teamId: OFFICIAL_BUDDIES[21].teamId,
  teamName: OFFICIAL_BUDDIES[21].teamName,
  assignedFloor: OFFICIAL_BUDDIES[21].assignedFloor,
  prodi: OFFICIAL_BUDDIES[21].prodi,
  faculty: OFFICIAL_BUDDIES[21].faculty,
  gender: OFFICIAL_BUDDIES[21].gender,
  avatarUrl: OFFICIAL_BUDDIES[21].avatarUrl,
};

export const defaultBuddy: User = defaultBuddy01;

export const DUMMY_ACCOUNTS = [
  {
    role: "ADMIN" as const,
    username: "admin",
    password: "admin2026",
    label: "Super Admin (Full Control Center)",
    user: defaultAdmin,
  },
  ...OFFICIAL_BUDDIES.map((b) => ({
    role: "BUDDY" as const,
    username: b.username,
    password: "buddy2026",
    label: `${b.fullName} (${b.teamName} - ${b.prodi})`,
    user: {
      id: b.id,
      username: b.username,
      fullName: b.fullName,
      role: "BUDDY" as const,
      teamId: b.teamId,
      teamName: b.teamName,
      assignedFloor: b.assignedFloor,
      prodi: b.prodi,
      faculty: b.faculty,
      gender: b.gender,
      avatarUrl: b.avatarUrl,
    },
  })),
];

const token = ref<string | null>("mock-static-token");
const user = ref<User | null>(defaultAdmin);
const loading = ref(false);

// Hydrate from localStorage on client-side
if (typeof window !== "undefined") {
  const storedToken = localStorage.getItem("genius_admin_token");
  const storedUser = localStorage.getItem("genius_admin_user");
  if (storedToken && storedUser) {
    try {
      token.value = storedToken;
      const parsed = JSON.parse(storedUser);

      // Auto-sanitize legacy cached data from localStorage
      if (parsed.fullName) {
        parsed.fullName = parsed.fullName.replace(/^Kak(ak)?\s+/i, "").trim();
      }

      // Check if user is a buddy and map to official roster
      const matchedBuddy =
        findBuddyByQuery(parsed.username || "") ||
        findBuddyByQuery(parsed.fullName || "") ||
        (parsed.role === "BUDDY" && parsed.teamName ? findBuddyByQuery(parsed.teamName) : undefined);

      if (matchedBuddy) {
        parsed.id = matchedBuddy.id;
        parsed.username = matchedBuddy.username;
        parsed.fullName = matchedBuddy.fullName;
        parsed.teamName = matchedBuddy.teamName;
        parsed.teamId = matchedBuddy.teamId;
        parsed.assignedFloor = matchedBuddy.assignedFloor;
        parsed.prodi = matchedBuddy.prodi;
        parsed.faculty = matchedBuddy.faculty;
        parsed.gender = matchedBuddy.gender;
        parsed.avatarUrl = matchedBuddy.avatarUrl;
      } else if (parsed.teamName) {
        parsed.teamName = parsed.teamName.replace(/^Team\s+/i, "").trim();
      }

      user.value = parsed;
      // Persist the sanitized object back to localStorage immediately
      localStorage.setItem("genius_admin_user", JSON.stringify(parsed));
    } catch {
      token.value = "mock-static-token";
      user.value = defaultAdmin;
    }
  } else {
    token.value = "mock-static-token";
    user.value = defaultAdmin;
    localStorage.setItem("genius_admin_token", "mock-static-token");
    localStorage.setItem("genius_admin_user", JSON.stringify(defaultAdmin));
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const isBuddy = computed(() => user.value?.role === "BUDDY");

  const userInitials = computed(() => {
    if (!user.value?.fullName) return "SA";
    return user.value.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  async function login(usernameInput: string, passwordInput?: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true;

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput?.trim() || (cleanUser === "admin" || cleanUser.includes("super") ? "admin2026" : "buddy2026");

    let activeUser: User;
    if (cleanUser === "admin" || cleanUser.includes("super")) {
      activeUser = { ...defaultAdmin };
    } else {
      // Find in official buddies roster
      const buddyMatch = findBuddyByQuery(cleanUser);
      if (buddyMatch) {
        activeUser = {
          id: buddyMatch.id,
          username: buddyMatch.username,
          fullName: buddyMatch.fullName,
          role: "BUDDY",
          teamId: buddyMatch.teamId,
          teamName: buddyMatch.teamName,
          assignedFloor: buddyMatch.assignedFloor,
          prodi: buddyMatch.prodi,
          faculty: buddyMatch.faculty,
          gender: buddyMatch.gender,
          avatarUrl: buddyMatch.avatarUrl,
        };
      } else if (cleanUser.includes("buddy")) {
        activeUser = {
          id: `usr-${cleanUser}`,
          username: cleanUser,
          fullName: `Buddy (${cleanUser})`,
          role: "BUDDY",
          teamId: "team-1",
          teamName: "Genius 01",
          assignedFloor: 1,
          gender: "MALE",
          avatarUrl: "/character-cowok-avatar.png",
        };
      } else {
        activeUser = {
          id: "usr-admin",
          username: cleanUser || "admin",
          fullName: cleanUser === "admin" ? "Super Admin GENIUS 2026" : `Admin (${cleanUser})`,
          role: "ADMIN",
          avatarUrl: "/unu.png",
        };
      }
    }

    // 1. Attempt live backend authentication
    try {
      const config = useRuntimeConfig();
      const baseUrl = config.public?.apiBase || "http://localhost:3001/api";
      const liveRes = await $fetch<{ success: boolean; data?: { token: string; user: any }; error?: any }>(
        `${baseUrl}/auth/login`,
        {
          method: "POST",
          body: {
            username: activeUser.username || cleanUser,
            password: cleanPassword,
          },
        }
      );

      if (liveRes?.success && liveRes.data?.token) {
        token.value = liveRes.data.token;
        user.value = {
          ...activeUser,
          ...liveRes.data.user,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("genius_admin_token", liveRes.data.token);
          localStorage.setItem("genius_admin_user", JSON.stringify(user.value));
        }
        loading.value = false;
        if (user.value.role === "BUDDY") {
          navigateTo("/buddy");
        } else {
          navigateTo("/");
        }
        return { success: true };
      }
    } catch (err: any) {
      console.warn("[Auth] Live backend login error, using local session:", err?.message || err);
    }

    // 2. Fallback to local session if backend unreachable
    token.value = "mock-static-token";
    user.value = activeUser;
    if (typeof window !== "undefined") {
      localStorage.setItem("genius_admin_token", "mock-static-token");
      localStorage.setItem("genius_admin_user", JSON.stringify(activeUser));
    }

    loading.value = false;

    if (activeUser.role === "BUDDY") {
      navigateTo("/buddy");
    } else {
      navigateTo("/");
    }

    return { success: true };
  }

  async function loginAsPreset(presetUser: User) {
    return login(presetUser.username, presetUser.role === "ADMIN" ? "admin2026" : "buddy2026");
  }

  async function switchRole(targetRole: "ADMIN" | "BUDDY") {
    if (targetRole === "BUDDY") {
      return login(defaultBuddy.username, "buddy2026");
    } else {
      return login("admin", "admin2026");
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("genius_admin_token");
      localStorage.removeItem("genius_admin_user");
    }
    navigateTo("/login");
  }

  async function verify(): Promise<boolean> {
    const config = useRuntimeConfig();
    const baseUrl = config.public?.apiBase || "http://localhost:3001/api";

    // Auto-authenticate with live backend if current token is mock
    if (token.value === "mock-static-token" || !token.value) {
      try {
        const usernameToAuth = user.value?.username || "admin";
        const passwordToAuth = user.value?.role === "BUDDY" ? "buddy2026" : "admin2026";
        const res = await $fetch<{ success: boolean; data?: { token: string; user: any } }>(
          `${baseUrl}/auth/login`,
          {
            method: "POST",
            body: { username: usernameToAuth, password: passwordToAuth },
          }
        );
        if (res?.success && res.data?.token) {
          token.value = res.data.token;
          user.value = { ...user.value, ...res.data.user };
          if (typeof window !== "undefined") {
            localStorage.setItem("genius_admin_token", res.data.token);
            localStorage.setItem("genius_admin_user", JSON.stringify(user.value));
          }
          return true;
        }
      } catch {
        // Backend not reachable, stay in local mode
      }
    }
    return true;
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isBuddy,
    userInitials,
    login,
    loginAsPreset,
    switchRole,
    logout,
    verify,
    DUMMY_ACCOUNTS,
  };
}
