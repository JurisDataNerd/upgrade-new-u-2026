/**
 * Global authentication middleware for Admin Control Center.
 * Protects all routes except /login.
 * Redirects unauthenticated users to /login with a ?redirect= parameter.
 */
export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on the login page to avoid redirect loops
  if (to.path === "/login") return;

  // Check authentication status (client-side only)
  if (import.meta.client) {
    const token = localStorage.getItem("genius_admin_token");
    const userRaw = localStorage.getItem("genius_admin_user");

    if (!token || !userRaw) {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }

    // Verify role is ADMIN
    try {
      const user = JSON.parse(userRaw);
      if (user.role !== "ADMIN") {
        localStorage.removeItem("genius_admin_token");
        localStorage.removeItem("genius_admin_user");
        return navigateTo("/login");
      }
    } catch {
      return navigateTo("/login");
    }
  }
});
