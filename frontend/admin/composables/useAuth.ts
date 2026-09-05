import { ref, computed } from "vue";
import { navigateTo, useRuntimeConfig } from "#app";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "BUDDY" | "PARTICIPANT";
  status?: string;
  gender?: string;
  characterClass?: string;
  characterTitle?: string;
  characterTier?: number;
  unlockedTitles?: string[];
  avatarUrl?: string;
  teamId?: string;
  teamName?: string;
  teamCode?: string;
  buddyRole?: "PRIMARY" | "ASSISTANT";
  assignedFloor?: number;
}

const token = ref<string | null>(null);
const user = ref<User | null>(null);
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
      token.value = null;
      user.value = null;
      localStorage.removeItem("genius_admin_token");
      localStorage.removeItem("genius_admin_user");
    }
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const isBuddy = computed(() => user.value?.role === "BUDDY");

  const userInitials = computed(() => {
    if (!user.value?.fullName) return "GM";
    return user.value.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  /**
   * Real Authentication via Backend REST API (/api/auth/login)
   */
  async function login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    try {
      const config = useRuntimeConfig();
      const baseUrl = config.public?.apiBase || "http://localhost:3001/api";

      const res = await $fetch<{
        success: boolean;
        data?: {
          token: string;
          user: User;
        };
        error?: {
          code: string;
          message: string;
        };
        message?: string;
      }>(`${baseUrl}/auth/login`, {
        method: "POST",
        body: {
          username: usernameInput.trim(),
          password: passwordInput,
        },
      });

      if (!res.success || !res.data?.token || !res.data?.user) {
        return {
          success: false,
          error: res.error?.message || res.message || "Gagal masuk. Periksa username dan password.",
        };
      }

      // Verify that user is Panitia (ADMIN or BUDDY)
      if (res.data.user.role !== "ADMIN" && res.data.user.role !== "BUDDY") {
        return {
          success: false,
          error: "Akses ditolak: Akun Anda terdaftar sebagai Peserta, bukan Panitia/Buddy.",
        };
      }

      token.value = res.data.token;
      user.value = res.data.user;

      if (typeof window !== "undefined") {
        localStorage.setItem("genius_admin_token", res.data.token);
        localStorage.setItem("genius_admin_user", JSON.stringify(res.data.user));
      }

      if (res.data.user.role === "BUDDY") {
        navigateTo("/buddy");
      } else {
        navigateTo("/");
      }

      return { success: true };
    } catch (err: any) {
      const errMsg =
        err?.data?.error?.message ||
        err?.data?.message ||
        err?.message ||
        "Gagal terhubung ke server backend GENIUS.";
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  }

  function switchRole(targetRole: "ADMIN" | "BUDDY") {
    if (targetRole === "BUDDY") {
      navigateTo("/buddy");
    } else {
      navigateTo("/");
    }
  }

  async function logout() {
    try {
      const config = useRuntimeConfig();
      const baseUrl = config.public?.apiBase || "http://localhost:3001/api";
      if (token.value) {
        await $fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token.value}` },
        }).catch(() => {});
      }
    } finally {
      token.value = null;
      user.value = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("genius_admin_token");
        localStorage.removeItem("genius_admin_user");
      }
      navigateTo("/login");
    }
  }

  async function confirmLogout() {
    const { show } = useConfirm();
    const confirmed = await show({
      title: "Keluar dari Portal Admin?",
      description: "Sesi aktif Anda akan diakhiri. Pastikan semua perubahan data telah tersimpan sebelum keluar.",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      variant: "danger",
      icon: "logout",
    });

    if (confirmed) {
      const toast = useToast();
      toast.info("Sampai Jumpa!", "Anda telah keluar dari sesi admin.");
      await logout();
    }
  }

  async function verify(): Promise<boolean> {
    if (!token.value) return false;
    try {
      const config = useRuntimeConfig();
      const baseUrl = config.public?.apiBase || "http://localhost:3001/api";
      const res = await $fetch<{ success: boolean; data: User }>(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });

      if (res.success && res.data) {
        user.value = res.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("genius_admin_user", JSON.stringify(res.data));
        }
        return true;
      }
      return false;
    } catch {
      await logout();
      return false;
    }
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
    switchRole,
    logout,
    confirmLogout,
    verify,
  };
}
