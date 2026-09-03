const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const api = {
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('genius_user_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn(`[API] Request failed to ${endpoint}:`, err.message);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal terhubung ke backend server',
        },
      };
    }
  },

  // Auth
  async login(username: string, password: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem('genius_user_token', res.data.token);
      localStorage.setItem('genius_user_profile', JSON.stringify(res.data.user));
    }

    return res;
  },

  logout() {
    localStorage.removeItem('genius_user_token');
    localStorage.removeItem('genius_user_profile');
  },

  // Floors & Locations
  async getFloors() {
    return this.request('/floors');
  },

  // Leaderboard
  async getLeaderboard(limit = 20) {
    return this.request(`/leaderboard?limit=${limit}`);
  },

  // Submit Game Score
  async submitScore(payload: {
    participantId: string;
    teamId: string;
    amount: number;
    sourceType: string;
    reason?: string;
  }) {
    return this.request('/scores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Health check
  async checkHealth() {
    try {
      const res = await fetch('http://localhost:3001/api/health');
      return await res.json();
    } catch {
      return null;
    }
  },
};
