import { ref, computed } from "vue";
import { navigateTo } from "#app";

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

const defaultAdmin: User = {
  id: "usr-admin",
  username: "admin",
  fullName: "Super Admin GENIUS 2026",
  role: "ADMIN",
};

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
      user.value = JSON.parse(storedUser);
    } catch {
      token.value = "mock-static-token";
      user.value = defaultAdmin;
    }
  } else {
    // Default logged in as Superadmin for static preview
    token.value = "mock-static-token";
    user.value = defaultAdmin;
    localStorage.setItem("genius_admin_token", "mock-static-token");
    localStorage.setItem("genius_admin_user", JSON.stringify(defaultAdmin));
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const userInitials = computed(() => {
    if (!user.value?.fullName) return "SA";
    return user.value.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  async function login(username: string, password?: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Allow static login with any password or default credentials
    const activeUser: User = {
      id: "usr-admin",
      username: username || "admin",
      fullName: username === "admin" ? "Super Admin GENIUS 2026" : `Admin (${username})`,
      role: "ADMIN",
    };

    token.value = "mock-static-token";
    user.value = activeUser;
    if (typeof window !== "undefined") {
      localStorage.setItem("genius_admin_token", "mock-static-token");
      localStorage.setItem("genius_admin_user", JSON.stringify(activeUser));
    }

    loading.value = false;
    return { success: true };
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
    userInitials,
    login,
    logout,
    verify,
  };
}
