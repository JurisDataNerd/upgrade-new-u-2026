import { defineStore } from 'pinia';
import { Participant, PlayerLevel, StampRecord } from '../types/game';
import { BOOTHS_DATA, FLOORS_DATA, INITIAL_PARTICIPANT } from '../data/mockData';
import { soundEngine } from '../lib/sound';

const calculateLevel = (completedFloorsCount: number): PlayerLevel => {
  if (completedFloorsCount >= 9) return 'Upgraded You';
  if (completedFloorsCount >= 6) return 'Almost There';
  if (completedFloorsCount >= 4) return 'Achiever';
  if (completedFloorsCount >= 2) return 'Explorer';
  return 'New You';
};

export const useGameStore = defineStore('game', {
  state: () => ({
    participant: { ...INITIAL_PARTICIPANT } as Participant,
    soundEnabled: true,
    crtEffect: false,
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
  },

  actions: {
    setParticipantInfo(info: Partial<Participant>) {
      this.participant = {
        ...this.participant,
        ...info,
      };
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

      // Check if current floor is now completed
      const floor = FLOORS_DATA.find((f) => f.number === booth.floorNumber);
      const floorBooths = floor ? floor.boothIds : [];
      const isFloorNowCompleted = floorBooths.every((bId) => newCompletedBooths.includes(bId));
      const wasFloorPreviouslyCompleted = floorBooths.every((bId) =>
        this.participant.completedBooths.includes(bId)
      );

      // Calculate new total completed floors count
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

      return {
        isNewStamp: !isAlreadyCompleted,
        isFloorCompleted: isFloorNowCompleted && !wasFloorPreviouslyCompleted,
        isLevelUp,
        oldLevel,
        newLevel,
      };
    },

    resetProgress() {
      this.participant = {
        ...INITIAL_PARTICIPANT,
        completedBooths: [],
        stamps: {},
        totalXp: 0,
      };
      soundEngine.playClick();
    },
  },
});
