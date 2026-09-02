import type { Booth, Floor, Participant, StampRecord, LeaderboardUser, LeaderboardGroup } from './game';
import type { AdminUser, AuthSession } from './auth';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Request & Response Contracts
export interface SubmitStampRequest {
  boothId: string;
  score: number;
  totalQuestions: number;
  answers?: Record<string, any>;
}

export interface SubmitStampResponse {
  stamp: StampRecord;
  xpEarned: number;
  newTotalXp: number;
  unlockedLevel: string;
  floorsCompleted: number;
}

export interface AdminStatsResponse {
  totalParticipants: number;
  activeToday: number;
  totalStampsIssued: number;
  averageFloorsCompleted: number;
  topBooths: {
    boothId: string;
    boothName: string;
    completionsCount: number;
    avgScore: number;
  }[];
  floorCompletions: {
    floorNumber: number;
    floorName: string;
    count: number;
  }[];
}
