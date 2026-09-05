import { useRuntimeConfig } from "#app";
import { useAuth } from "./useAuth";

/**
 * Direct HTTP Client for GENIUS UNU 2026 Admin Control Center.
 * Connects directly to Hono/Elysia backend REST API with Bearer JWT tokens.
 * Zero mock database or static fallback.
 */
export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuth();

  const getBaseUrl = () => {
    return config.public?.apiBase || "http://localhost:3001/api";
  };

  async function request<T = any>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const method = (options.method || "GET").toUpperCase();
    let path = endpoint.trim();

    let targetUrl: string;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      targetUrl = path;
    } else {
      if (path.startsWith("/api")) {
        path = path.substring(4);
      }
      if (!path.startsWith("/")) {
        path = `/${path}`;
      }
      targetUrl = `${getBaseUrl()}${path}`;
    }

    const headers: Record<string, string> = {
      ...(options.headers || {}),
    };

    if (auth.token?.value) {
      headers["Authorization"] = `Bearer ${auth.token.value}`;
    }

    try {
      const response = await $fetch<T>(targetUrl, {
        method: method as any,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(method) ? options.body : undefined,
        params: options.params,
      });

      return response;
    } catch (err: any) {
      // Auto-logout if token is expired/invalid (401)
      if (err?.statusCode === 401 || err?.response?.status === 401) {
        console.warn("[useApi] Sesi kedaluwarsa atau token tidak valid (401).");
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          auth.logout();
        }
      }
      throw err;
    }
  }

  return {
    request,
    get: <T = any>(endpoint: string, params?: Record<string, any>) =>
      request<T>(endpoint, { method: "GET", params }),
    post: <T = any>(endpoint: string, body?: any, options?: Record<string, any>) =>
      request<T>(endpoint, { method: "POST", body, ...options }),
    put: <T = any>(endpoint: string, body?: any, options?: Record<string, any>) =>
      request<T>(endpoint, { method: "PUT", body, ...options }),
    patch: <T = any>(endpoint: string, body?: any, options?: Record<string, any>) =>
      request<T>(endpoint, { method: "PATCH", body, ...options }),
    del: <T = any>(endpoint: string, options?: Record<string, any>) =>
      request<T>(endpoint, { method: "DELETE", ...options }),
    delete: <T = any>(endpoint: string, options?: Record<string, any>) =>
      request<T>(endpoint, { method: "DELETE", ...options }),
  };
}
