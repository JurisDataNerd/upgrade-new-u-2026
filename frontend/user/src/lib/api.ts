const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const api = {
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('genius_user_token') : null;
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

  // Auth & Onboarding
  async login(username: string, password?: string) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password: password || 'genius2026' }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem('genius_user_token', res.data.token);
      localStorage.setItem('genius_user_profile', JSON.stringify(res.data.user));
    }

    return res;
  },

  async registerMaba(payload: {
    nim: string;
    name: string;
    gender?: string;
    faculty?: string;
    prodi?: string;
    characterClass?: string;
    avatar?: string;
    password?: string;
  }) {
    const res = await this.request<any>('/auth/register-maba', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem('genius_user_token', res.data.token);
      localStorage.setItem('genius_user_profile', JSON.stringify(res.data.user));
    }

    return res;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('genius_user_token');
      localStorage.removeItem('genius_user_profile');
    }
  },

  // Attendance Gate & Daily Reflections
  async checkIn(day: number, qrToken: string, participantId?: string) {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ day, qrToken, participantId }),
    });
  },

  async submitReflection(payload: {
    day: number;
    ratingFasilitas: number;
    ratingMateri: number;
    ratingBuddy: number;
    essayInsight: string;
    participantId?: string;
  }) {
    return this.request('/reflections', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async checkOut(day: number, qrToken: string, participantId?: string) {
    return this.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ day, qrToken, participantId }),
    });
  },

  async getAttendanceStatus(participantId?: string) {
    const query = participantId ? `?participantId=${participantId}` : '';
    return this.request(`/attendance/status${query}`);
  },

  // Campus Quest: Floors, Stages & Locations
  async getFloors() {
    return this.request('/floors');
  },

  async getStages() {
    return this.request('/stages');
  },

  async getLocations(floorId?: string) {
    const query = floorId ? `?floorId=${floorId}` : '';
    return this.request(`/locations${query}`);
  },

  // Ormawa & UKM Expo (Hari 3)
  async getOrmawaBooths(category?: string) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/ormawa/booths${query}`);
  },

  async scanOrmawa(qrCode: string, participantId?: string) {
    return this.request('/ormawa/scan', {
      method: 'POST',
      body: JSON.stringify({ qrCode, participantId }),
    });
  },

  async getMyOrmawaBadges(participantId?: string) {
    const query = participantId ? `?participantId=${participantId}` : '';
    return this.request(`/ormawa/my-badges${query}`);
  },

  // Leaderboard
  async getLeaderboard(limit = 20) {
    return this.request(`/leaderboard?limit=${limit}`);
  },

  // Submit Game Score
  async submitScore(payload: {
    participantId: string;
    teamId?: string;
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
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return null;
    }
  },
};
