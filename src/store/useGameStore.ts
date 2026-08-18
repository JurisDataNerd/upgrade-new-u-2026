'use client';

import { create } from 'zustand';
import { Participant, PlayerLevel, StampRecord } from '../types/game';
import { BOOTHS_DATA, FLOORS_DATA, INITIAL_PARTICIPANT } from '../data/mockData';
import { soundEngine } from '../lib/sound';

interface GameState {
  participant: Participant;
  soundEnabled: boolean;
  crtEffect: boolean;

  // Actions
  setParticipantInfo: (info: Partial<Participant>) => void;
  toggleSound: () => void;
  toggleCrt: () => void;
  completeBooth: (
    boothId: string,
    score: number,
    totalQuestions: number
  ) => {
    isNewStamp: boolean;
    isFloorCompleted: boolean;
    isLevelUp: boolean;
    oldLevel: PlayerLevel;
    newLevel: PlayerLevel;
  };
  resetProgress: () => void;

  // Selectors/Helpers
  getFloorStatus: (floorNumber: number) => 'not_started' | 'partial' | 'completed';
  getCompletedFloorsCount: () => number;
  getCurrentLevel: () => PlayerLevel;
  getTotalStampsCount: () => number;
  isBoothCompleted: (boothId: string) => boolean;
}

const calculateLevel = (completedFloorsCount: number): PlayerLevel => {
  if (completedFloorsCount >= 9) return 'Upgraded You';
  if (completedFloorsCount >= 6) return 'Almost There';
  if (completedFloorsCount >= 4) return 'Achiever';
  if (completedFloorsCount >= 2) return 'Explorer';
  return 'New You';
};

export const useGameStore = create<GameState>((set, get) => ({
  participant: INITIAL_PARTICIPANT,
  soundEnabled: true,
  crtEffect: false,

  setParticipantInfo: (info) => {
    set((state) => ({
      participant: {
        ...state.participant,
        ...info,
      },
    }));
  },

  toggleSound: () => {
    set((state) => {
      const nextVal = !state.soundEnabled;
      soundEngine.setMuted(!nextVal);
      if (nextVal) {
        soundEngine.playClick();
      }
      return { soundEnabled: nextVal };
    });
  },

  toggleCrt: () => {
    set((state) => {
      if (state.soundEnabled) soundEngine.playClick();
      return { crtEffect: !state.crtEffect };
    });
  },

  completeBooth: (boothId: string, score: number, totalQuestions: number) => {
    const state = get();
    const booth = BOOTHS_DATA[boothId];
    if (!booth) {
      return {
        isNewStamp: false,
        isFloorCompleted: false,
        isLevelUp: false,
        oldLevel: state.getCurrentLevel(),
        newLevel: state.getCurrentLevel(),
      };
    }

    const isAlreadyCompleted = state.participant.completedBooths.includes(boothId);
    const oldCompletedFloors = state.getCompletedFloorsCount();
    const oldLevel = calculateLevel(oldCompletedFloors);

    const newCompletedBooths = isAlreadyCompleted
      ? state.participant.completedBooths
      : [...state.participant.completedBooths, boothId];

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
      ...state.participant.stamps,
      [boothId]: stampRecord,
    };

    const xpEarned = isAlreadyCompleted ? 0 : 150 + score * 50;
    const newTotalXp = state.participant.totalXp + xpEarned;

    // Check if current floor is now completed
    const floor = FLOORS_DATA.find((f) => f.number === booth.floorNumber);
    const floorBooths = floor ? floor.boothIds : [];
    const isFloorNowCompleted = floorBooths.every((bId) => newCompletedBooths.includes(bId));
    const wasFloorPreviouslyCompleted = floorBooths.every((bId) =>
      state.participant.completedBooths.includes(bId)
    );

    // Calculate new total completed floors count
    const newCompletedFloorsCount = FLOORS_DATA.filter((f) =>
      f.boothIds.every((bId) => newCompletedBooths.includes(bId))
    ).length;

    const newLevel = calculateLevel(newCompletedFloorsCount);
    const isLevelUp = newLevel !== oldLevel;

    set({
      participant: {
        ...state.participant,
        completedBooths: newCompletedBooths,
        stamps: newStamps,
        totalXp: newTotalXp,
      },
    });

    return {
      isNewStamp: !isAlreadyCompleted,
      isFloorCompleted: isFloorNowCompleted && !wasFloorPreviouslyCompleted,
      isLevelUp,
      oldLevel,
      newLevel,
    };
  },

  resetProgress: () => {
    set({
      participant: {
        ...INITIAL_PARTICIPANT,
        completedBooths: [],
        stamps: {},
        totalXp: 0,
      },
    });
    soundEngine.playClick();
  },

  getFloorStatus: (floorNumber: number) => {
    const floor = FLOORS_DATA.find((f) => f.number === floorNumber);
    if (!floor) return 'not_started';

    const completedCount = floor.boothIds.filter((id) =>
      get().participant.completedBooths.includes(id)
    ).length;

    if (completedCount === 2) return 'completed';
    if (completedCount === 1) return 'partial';
    return 'not_started';
  },

  getCompletedFloorsCount: () => {
    const completedBooths = get().participant.completedBooths;
    return FLOORS_DATA.filter((f) =>
      f.boothIds.every((bId) => completedBooths.includes(bId))
    ).length;
  },

  getCurrentLevel: () => {
    const completedFloors = get().getCompletedFloorsCount();
    return calculateLevel(completedFloors);
  },

  getTotalStampsCount: () => {
    return get().participant.completedBooths.length;
  },

  isBoothCompleted: (boothId: string) => {
    return get().participant.completedBooths.includes(boothId);
  },
}));
