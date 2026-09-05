import { ref, computed } from "vue";
import { navigateTo } from "#app";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "BUDDY";
  teamId?: string;
  teamName?: string;
  assignedFloor?: number;
}

export const defaultAdmin: User = {
  id: "usr-admin",
  username: "admin",
  fullName: "Super Admin GENIUS 2026",
  role: "ADMIN",
};

export const defaultBuddy01: User = {
  id: "usr-buddy-budi",
  username: "buddy01",
  fullName: "Budi Santoso",
  role: "BUDDY",
  teamId: "group-01",
  teamName: "Genius 01",
  assignedFloor: 3,
};

export const defaultBuddy03: User = {
  id: "usr-buddy-dewi",
  username: "buddy03",
  fullName: "Dewi Lestari",
  role: "BUDDY",
  teamId: "group-03",
  teamName: "Genius 03",
  assignedFloor: 5,
};

export const defaultBuddy07: User = {
  id: "usr-buddy-farhan",
  username: "buddy07",
  fullName: "Farhan Hakim",
  role: "BUDDY",
  teamId: "group-07",
  teamName: "Genius 07",
  assignedFloor: 7,
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
  {
    role: "BUDDY" as const,
    username: "buddy01",
    password: "buddy2026",
    label: "Budi Santoso (Genius 01)",
    user: defaultBuddy01,
  },
  {
    role: "BUDDY" as const,
    username: "buddy03",
    password: "buddy2026",
    label: "Dewi Lestari (Genius 03)",
    user: defaultBuddy03,
  },
  {
    role: "BUDDY" as const,
    username: "buddy07",
    password: "buddy2026",
    label: "Farhan Hakim (Genius 07)",
    user: defaultBuddy07,
  },
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

      if (parsed.username === "buddy01" || (parsed.teamName && /Garuda/i.test(parsed.teamName))) {
        parsed.fullName = "Budi Santoso";
        parsed.teamName = "Genius 01";
        parsed.teamId = "group-01";
      } else if (parsed.username === "buddy03" || (parsed.teamName && /Khawarizmi/i.test(parsed.teamName))) {
        parsed.fullName = "Dewi Lestari";
        parsed.teamName = "Genius 03";
        parsed.teamId = "group-03";
      } else if (parsed.username === "buddy07" || (parsed.teamName && /Ibnu\s*Sina/i.test(parsed.teamName))) {
        parsed.fullName = "Farhan Hakim";
        parsed.teamName = "Genius 07";
        parsed.teamId = "group-07";
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    const cleanUser = usernameInput.trim().toLowerCase();

    // Match with predefined dummy accounts
    const matched = DUMMY_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === cleanUser || a.label.toLowerCase().includes(cleanUser)
    );

    let activeUser: User;
    if (matched) {
      activeUser = { ...matched.user };
    } else if (cleanUser.includes("budi") || cleanUser === "buddy01" || cleanUser === "1") {
      activeUser = { ...defaultBuddy01 };
    } else if (cleanUser.includes("dewi") || cleanUser === "buddy03" || cleanUser === "3") {
      activeUser = { ...defaultBuddy03 };
    } else if (cleanUser.includes("farhan") || cleanUser === "buddy07" || cleanUser === "7") {
      activeUser = { ...defaultBuddy07 };
    } else if (cleanUser.includes("buddy")) {
      activeUser = {
        id: `usr-${cleanUser}`,
        username: cleanUser,
        fullName: `Buddy (${cleanUser})`,
        role: "BUDDY",
        teamId: "group-01",
        teamName: "Genius 01",
      };
    } else {
      activeUser = {
        id: "usr-admin",
        username: cleanUser || "admin",
        fullName: cleanUser === "admin" ? "Super Admin GENIUS 2026" : `Admin (${cleanUser})`,
        role: "ADMIN",
      };
    }

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

  function loginAsPreset(presetUser: User) {
    token.value = "mock-static-token";
    user.value = { ...presetUser };
    if (typeof window !== "undefined") {
      localStorage.setItem("genius_admin_token", "mock-static-token");
      localStorage.setItem("genius_admin_user", JSON.stringify(presetUser));
    }
    if (presetUser.role === "BUDDY") {
      navigateTo("/buddy");
    } else {
      navigateTo("/");
    }
  }

  function switchRole(targetRole: "ADMIN" | "BUDDY") {
    if (targetRole === "BUDDY") {
      user.value = { ...defaultBuddy };
    } else {
      user.value = { ...defaultAdmin };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("genius_admin_user", JSON.stringify(user.value));
    }

    if (targetRole === "BUDDY") {
      navigateTo("/buddy");
    } else {
      navigateTo("/");
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
