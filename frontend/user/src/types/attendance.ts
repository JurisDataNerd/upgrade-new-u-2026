export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT';

export interface DailyReflectionData {
  ratingFasilitas: number; // 1 - 5
  ratingMateri: number; // 1 - 5
  ratingBuddy: number; // 1 - 5
  essayInsight: string;
  submittedAt: string;
}

export interface DayAttendanceRecord {
  day: number;
  date: string;
  theme: string;
  checkInAt: string | null;
  checkInStatus: AttendanceStatus | null;
  checkInQrToken: string | null;
  checkOutAt: string | null;
  checkOutQrToken: string | null;
  reflection: DailyReflectionData | null;
  xpAwarded: number;
}

export type AttendanceStoreMap = Record<number, DayAttendanceRecord>;
