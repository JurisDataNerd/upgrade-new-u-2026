import { defineStore } from 'pinia';
import { Participant, PlayerLevel, StampRecord } from '../types/game';
import { BOOTHS_DATA, FLOORS_DATA, INITIAL_PARTICIPANT } from '../data/mockData';
import { soundEngine } from '../lib/sound';
import { AttendanceStoreMap, DailyReflectionData, AttendanceStatus } from '../types/attendance';
import { ORMAWA_STANDS } from '../data/ormawaData';
import { OrmawaScanResult } from '../types/ormawa';
import { api } from '../lib/api';

const STORAGE_KEY = 'genius_unu_user_storage_v1';

export const DEFAULT_ATTENDANCE: AttendanceStoreMap = {
  1: {
    day: 1,
    date: '22 September 2026',
    theme: 'Identity & Niat: Ke UNU Apa Yang Kau Cari?',
    checkInAt: null,
    checkInStatus: null,
    checkInQrToken: null,
    checkOutAt: null,
    checkOutQrToken: null,
    reflection: null,
    xpAwarded: 0,
  },
  2: {
    day: 2,
    date: '23 September 2026',
    theme: '9-Floor Campus Quest & Tech Innovation',
    checkInAt: null,
    checkInStatus: null,
    checkInQrToken: null,
    checkOutAt: null,
    checkOutQrToken: null,
    reflection: null,
    xpAwarded: 0,
  },
  3: {
    day: 3,
    date: '24 September 2026',
    theme: 'Academic Mastery & Ormawa Expo Discovery',
    checkInAt: null,
    checkInStatus: null,
    checkInQrToken: null,
    checkOutAt: null,
    checkOutQrToken: null,
    reflection: null,
    xpAwarded: 0,
  },
};

const calculateLevel = (completedFloorsCount: number): PlayerLevel => {
  if (completedFloorsCount >= 9) return 'Upgraded You';
  if (completedFloorsCount >= 6) return 'Almost There';
  if (completedFloorsCount >= 4) return 'Achiever';
  if (completedFloorsCount >= 2) return 'Explorer';
  return 'New You';
};

function loadInitialState() {
  if (typeof window === 'undefined') {
    return {
      participant: { ...INITIAL_PARTICIPANT } as Participant,
      attendance: { ...DEFAULT_ATTENDANCE },
      visitedOrmawa: [] as string[],
      isLoggedIn: false,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const participant = { ...INITIAL_PARTICIPANT, ...(parsed.participant || {}) } as Participant;
      const isLoggedIn = Boolean(parsed.isLoggedIn ?? (participant.isRegistered && participant.name));
      return {
        participant,
        attendance: { ...DEFAULT_ATTENDANCE, ...(parsed.attendance || {}) } as AttendanceStoreMap,
        visitedOrmawa: (parsed.visitedOrmawa || []) as string[],
        isLoggedIn,
      };
    }
  } catch (err) {
    console.warn('[Store] Failed to load local storage state:', err);
  }

  return {
    participant: { ...INITIAL_PARTICIPANT } as Participant,
    attendance: { ...DEFAULT_ATTENDANCE },
    visitedOrmawa: [] as string[],
    isLoggedIn: false,
  };
}

const saved = loadInitialState();

export const useGameStore = defineStore('game', {
  state: () => ({
    participant: saved.participant,
    attendance: saved.attendance,
    visitedOrmawa: saved.visitedOrmawa as string[],
    isLoggedIn: saved.isLoggedIn,
    soundEnabled: true,
    crtEffect: false,
    activeDay: 1 as 1 | 2 | 3,
    isLeaderboardFrozen: false,
  }),

  getters: {
    getFloorStatus: (state) => (floorNumber: number): 'not_started' | 'partial' | 'completed' => {
      const floor = FLOORS_DATA.find((f) => f.number === floorNumber);
      if (!floor) return 'not_started';

      const completedCount = floor.boothIds.filter((id) =>
        state.participant.completedBooths.includes(id)
      ).length;

      if (completedCount === 2) return 'completed';
      if (completedCount === 1) return 'partial';
      return 'not_started';
    },

    getCompletedFloorsCount: (state) => (): number => {
      const completedBooths = state.participant.completedBooths;
      return FLOORS_DATA.filter((f) =>
        f.boothIds.every((bId) => completedBooths.includes(bId))
      ).length;
    },

    getCurrentLevel: (state) => (): PlayerLevel => {
      const completedBooths = state.participant.completedBooths;
      const completedFloors = FLOORS_DATA.filter((f) =>
        f.boothIds.every((bId) => completedBooths.includes(bId))
      ).length;
      return calculateLevel(completedFloors);
    },

    getTotalStampsCount: (state) => (): number => {
      return state.participant.completedBooths.length;
    },

    isBoothCompleted: (state) => (boothId: string): boolean => {
      return state.participant.completedBooths.includes(boothId);
    },

    getAttendanceForDay: (state) => (day: number) => {
      return state.attendance[day] || DEFAULT_ATTENDANCE[day] || null;
    },

    isDayCheckedIn: (state) => (day: number): boolean => {
      return Boolean(state.attendance[day]?.checkInAt);
    },

    isDayReflectionSubmitted: (state) => (day: number): boolean => {
      return Boolean(state.attendance[day]?.reflection);
    },

    isDayCheckedOut: (state) => (day: number): boolean => {
      return Boolean(state.attendance[day]?.checkOutAt);
    },

    getTotalAttendanceXp: (state) => (): number => {
      return Object.values(state.attendance).reduce((acc, curr) => acc + (curr.xpAwarded || 0), 0);
    },

    visitedOrmawaCount: (state) => state.visitedOrmawa.length,

    ormawaXpEarned: (state) => Math.min(state.visitedOrmawa.length, 10) * 75,

    isOrmawaCapped: (state) => state.visitedOrmawa.length >= 10,

    isStandVisited: (state) => (standId: string): boolean => {
      return state.visitedOrmawa.includes(standId);
    },
  },

  actions: {
    saveToStorage() {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            participant: this.participant,
            attendance: this.attendance,
            visitedOrmawa: this.visitedOrmawa,
            isLoggedIn: this.isLoggedIn,
          })
        );
      } catch (err) {
        console.warn('[Store] Failed to save state to localStorage:', err);
      }
    },

    loginMaba(data?: Partial<Participant>) {
      this.isLoggedIn = true;
      if (data) {
        this.participant = {
          ...this.participant,
          ...data,
        };
      }
      this.saveToStorage();
    },

    completeProfile(data: { name: string; nim: string; faculty: string; prodi: string; avatar: string }) {
      this.participant = {
        ...this.participant,
        name: data.name.trim(),
        nim: data.nim.trim(),
        faculty: data.faculty,
        prodi: data.prodi,
        avatar: data.avatar,
        isRegistered: true,
      };
      this.isLoggedIn = true;
      this.saveToStorage();

      // Asynchronously sync to live PostgreSQL database
      api.registerMaba({
        nim: data.nim.trim(),
        name: data.name.trim(),
        faculty: data.faculty,
        prodi: data.prodi,
        avatar: data.avatar,
      }).then((res) => {
        if (res.success && res.data?.user) {
          this.participant.id = res.data.user.id;
          if (res.data.user.teamId) {
            this.participant.teamId = res.data.user.teamId;
          }
          this.saveToStorage();
        }
      }).catch((err) => {
        console.warn('[Store] Live registerMaba sync note:', err);
      });
    },

    logoutMaba() {
      this.isLoggedIn = false;
      this.participant.isRegistered = false;
      this.participant.name = '';
      this.participant.nim = '';
      api.logout();
      this.saveToStorage();
    },

    setParticipantInfo(info: Partial<Participant>) {
      this.participant = {
        ...this.participant,
        ...info,
      };
      this.saveToStorage();
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      soundEngine.setMuted(!this.soundEnabled);
      if (this.soundEnabled) {
        soundEngine.playClick();
      }
    },

    toggleCrt() {
      if (this.soundEnabled) soundEngine.playClick();
      this.crtEffect = !this.crtEffect;
    },

    setActiveDay(day: 1 | 2 | 3) {
      this.activeDay = day;
      if (this.soundEnabled) soundEngine.playSelect();
    },

    // --- Daily Attendance Actions ---
    checkIn(day: number, qrToken: string): { success: boolean; message: string; xpEarned: number } {
      if (!this.attendance[day]) {
        return { success: false, message: 'Hari acara tidak valid', xpEarned: 0 };
      }

      if (this.attendance[day].checkInAt) {
        return {
          success: false,
          message: `Anda sudah melakukan presensi masuk Hari ke-${day} sebelumnya.`,
          xpEarned: 0,
        };
      }

      // Validasi token gerbang
      const upperToken = qrToken.trim().toUpperCase();
      const expectedToken = `UNU-PRESENSI-H${day}-GATE-2026`;
      const isGenericValid = upperToken.includes(`H${day}`) && (upperToken.includes('GATE') || upperToken.includes('PRESENSI'));

      if (upperToken !== expectedToken && !isGenericValid) {
        return {
          success: false,
          message: `QR Code tidak cocok untuk Gerbang Presensi Hari ${day}. Kode yang dipindai: ${qrToken}`,
          xpEarned: 0,
        };
      }

      // Evaluasi status on-time vs late
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // On-time jika sebelum jam 07:30 (atau saat testing/demo default ke ON_TIME)
      const isLate = hours > 7 || (hours === 7 && minutes > 30);
      const status: AttendanceStatus = isLate ? 'LATE' : 'ON_TIME';

      const xpEarned = 100;
      this.attendance[day].checkInAt = now.toISOString();
      this.attendance[day].checkInStatus = status;
      this.attendance[day].checkInQrToken = qrToken;
      this.attendance[day].xpAwarded = (this.attendance[day].xpAwarded || 0) + xpEarned;

      this.participant.totalXp += xpEarned;
      this.saveToStorage();

      if (this.soundEnabled) soundEngine.playCorrect();

      // Sync to live PostgreSQL backend
      api.checkIn(day, qrToken, this.participant.id || undefined).then((res) => {
        if (res.success && res.data) {
          console.log('[Store] Live check-in synced to PostgreSQL:', res.data);
        }
      }).catch((err) => {
        console.warn('[Store] Live check-in sync note:', err);
      });

      return {
        success: true,
        message: `Presensi Masuk Hari ${day} Berhasil! (+${xpEarned} XP)`,
        xpEarned,
      };
    },

    submitReflection(
      day: number,
      data: { ratingFasilitas: number; ratingMateri: number; ratingBuddy: number; essayInsight: string }
    ): { success: boolean; message: string; xpEarned: number } {
      if (!this.attendance[day]) {
        return { success: false, message: 'Hari acara tidak valid', xpEarned: 0 };
      }

      if (this.attendance[day].reflection) {
        return { success: false, message: 'Refleksi hari ini sudah diisi sebelumnya.', xpEarned: 0 };
      }

      const xpEarned = 25;
      const now = new Date();

      this.attendance[day].reflection = {
        ratingFasilitas: data.ratingFasilitas,
        ratingMateri: data.ratingMateri,
        ratingBuddy: data.ratingBuddy,
        essayInsight: data.essayInsight,
        submittedAt: now.toISOString(),
      };

      this.attendance[day].xpAwarded = (this.attendance[day].xpAwarded || 0) + xpEarned;
      this.participant.totalXp += xpEarned;
      this.saveToStorage();

      if (this.soundEnabled) soundEngine.playCorrect();

      // Sync to live PostgreSQL backend
      api.submitReflection({
        day,
        ratingFasilitas: data.ratingFasilitas,
        ratingMateri: data.ratingMateri,
        ratingBuddy: data.ratingBuddy,
        essayInsight: data.essayInsight,
        participantId: this.participant.id || undefined,
      }).then((res) => {
        if (res.success && res.data) {
          console.log('[Store] Live reflection synced to PostgreSQL:', res.data);
        }
      }).catch((err) => {
        console.warn('[Store] Live reflection sync note:', err);
      });

      return {
        success: true,
        message: `Kuesioner Refleksi Hari ${day} Berhasil Terkirim! (+${xpEarned} XP)`,
        xpEarned,
      };
    },

    checkOut(day: number, qrToken: string): { success: boolean; message: string; xpEarned: number } {
      if (!this.attendance[day]) {
        return { success: false, message: 'Hari acara tidak valid', xpEarned: 0 };
      }

      if (!this.attendance[day].checkInAt) {
        return {
          success: false,
          message: `Anda belum melakukan presensi masuk Hari ${day}.`,
          xpEarned: 0,
        };
      }

      if (!this.attendance[day].reflection) {
        return {
          success: false,
          message: 'Silakan isi Kuesioner Refleksi Harian terlebih dahulu sebelum check-out pulang.',
          xpEarned: 0,
        };
      }

      if (this.attendance[day].checkOutAt) {
        return {
          success: false,
          message: `Presensi Pulang Hari ${day} sudah tercatat sebelumnya.`,
          xpEarned: 0,
        };
      }

      const upperToken = qrToken.trim().toUpperCase();
      const expectedToken = `UNU-PRESENSI-H${day}-CHECKOUT-2026`;
      const isGenericValid = upperToken.includes(`H${day}`) && (upperToken.includes('CHECKOUT') || upperToken.includes('PULANG'));

      if (upperToken !== expectedToken && !isGenericValid) {
        return {
          success: false,
          message: `QR Code tidak cocok untuk Gerbang Kepulangan Hari ${day}. Kode yang dipindai: ${qrToken}`,
          xpEarned: 0,
        };
      }

      const xpEarned = 50;
      const now = new Date();

      this.attendance[day].checkOutAt = now.toISOString();
      this.attendance[day].checkOutQrToken = qrToken;
      this.attendance[day].xpAwarded = (this.attendance[day].xpAwarded || 0) + xpEarned;

      this.participant.totalXp += xpEarned;
      this.saveToStorage();

      if (this.soundEnabled) soundEngine.playFanfare();

      // Sync to live PostgreSQL backend
      api.checkOut(day, qrToken, this.participant.id || undefined).then((res) => {
        if (res.success && res.data) {
          console.log('[Store] Live check-out synced to PostgreSQL:', res.data);
        }
      }).catch((err) => {
        console.warn('[Store] Live check-out sync note:', err);
      });

      return {
        success: true,
        message: `Presensi Pulang Hari ${day} Selesai! (+${xpEarned} XP)`,
        xpEarned,
      };
    },

    completeBooth(boothId: string, score: number, totalQuestions: number) {
      const booth = BOOTHS_DATA[boothId];
      if (!booth) {
        return {
          isNewStamp: false,
          isFloorCompleted: false,
          isLevelUp: false,
          oldLevel: this.getCurrentLevel(),
          newLevel: this.getCurrentLevel(),
        };
      }

      const isAlreadyCompleted = this.participant.completedBooths.includes(boothId);
      const oldCompletedFloors = this.getCompletedFloorsCount();
      const oldLevel = calculateLevel(oldCompletedFloors);

      const newCompletedBooths = isAlreadyCompleted
        ? this.participant.completedBooths
        : [...this.participant.completedBooths, boothId];

      const stampRecord: StampRecord = {
        boothId,
        boothName: booth.name,
        floorNumber: booth.floorNumber,
        stampTitle: booth.stampTitle,
        stampIcon: booth.stampIcon,
        stampColor: booth.stampColor,
        earnedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        score,
        totalQuestions,
      };

      const newStamps = {
        ...this.participant.stamps,
        [boothId]: stampRecord,
      };

      const xpEarned = isAlreadyCompleted ? 0 : 150 + score * 50;
      const newTotalXp = this.participant.totalXp + xpEarned;

      const floor = FLOORS_DATA.find((f) => f.number === booth.floorNumber);
      const floorBooths = floor ? floor.boothIds : [];
      const isFloorNowCompleted = floorBooths.every((bId) => newCompletedBooths.includes(bId));
      const wasFloorPreviouslyCompleted = floorBooths.every((bId) =>
        this.participant.completedBooths.includes(bId)
      );

      const newCompletedFloorsCount = FLOORS_DATA.filter((f) =>
        f.boothIds.every((bId) => newCompletedBooths.includes(bId))
      ).length;

      const newLevel = calculateLevel(newCompletedFloorsCount);
      const isLevelUp = newLevel !== oldLevel;

      this.participant = {
        ...this.participant,
        completedBooths: newCompletedBooths,
        stamps: newStamps,
        totalXp: newTotalXp,
      };

      this.saveToStorage();

      return {
        isNewStamp: !isAlreadyCompleted,
        isFloorCompleted: isFloorNowCompleted && !wasFloorPreviouslyCompleted,
        isLevelUp,
        oldLevel,
        newLevel,
      };
    },

    scanOrmawa(rawToken: string): OrmawaScanResult {
      const token = rawToken.trim().toUpperCase();

      const stand = ORMAWA_STANDS.find((s) => {
        const expected = s.qrToken.toUpperCase();
        return (
          token === expected ||
          token === s.id.toUpperCase() ||
          token.includes(s.id.toUpperCase())
        );
      });

      if (!stand) {
        return {
          success: false,
          message: `QR Code Ormawa tidak dikenali: "${rawToken}". Pastikan memindai barcode stan resmi.`,
          xpEarned: 0,
          isCapped: this.visitedOrmawa.length >= 10,
        };
      }

      if (this.visitedOrmawa.includes(stand.id)) {
        return {
          success: false,
          message: `Stan "${stand.shortName}" sudah pernah Anda kunjungi dan terdaftar di paspor.`,
          xpEarned: 0,
          stand,
          isCapped: this.visitedOrmawa.length >= 10,
        };
      }

      const currentCount = this.visitedOrmawa.length;
      const isCapped = currentCount >= 10;
      const xpEarned = isCapped ? 0 : 75;

      this.visitedOrmawa.push(stand.id);
      if (xpEarned > 0) {
        this.participant.totalXp += xpEarned;
      }
      this.saveToStorage();

      if (this.soundEnabled) {
        if (isCapped) {
          soundEngine.playSelect();
        } else {
          soundEngine.playCorrect();
        }
      }

      const message = isCapped
        ? `Kunjungan ${stand.shortName} dicatat! (Batas XP Capping 10 Stan Tercapai, +0 XP)`
        : `Lencana "${stand.badgeTitle}" diraih dari ${stand.shortName}! (+${xpEarned} XP)`;

      // Sync scan to live PostgreSQL backend
      api.scanOrmawa(rawToken, this.participant.id || undefined).then((res) => {
        if (res.success && res.data) {
          console.log('[Store] Live Ormawa scan recorded in PostgreSQL:', res.data);
        }
      }).catch((err) => {
        console.warn('[Store] Live Ormawa scan sync note:', err);
      });

      return {
        success: true,
        message,
        xpEarned,
        stand,
        isCapped: this.visitedOrmawa.length >= 10,
      };
    },

    resetProgress() {
      this.participant = {
        ...INITIAL_PARTICIPANT,
        completedBooths: [],
        stamps: {},
        totalXp: 0,
      };
      this.attendance = { ...DEFAULT_ATTENDANCE };
      this.visitedOrmawa = [];
      this.saveToStorage();
      soundEngine.playClick();
    },
  },
});
