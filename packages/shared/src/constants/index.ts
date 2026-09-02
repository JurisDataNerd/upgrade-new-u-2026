import type { LevelInfo } from '../types/game';

export const APP_CONFIG = {
  APP_NAME: 'GENIUS UNU 2026',
  YEAR: 2026,
  TOTAL_FLOORS: 9,
  TOTAL_BOOTHS: 18,
  XP_PER_CORRECT_ANSWER: 50,
  XP_COMPLETION_BONUS: 100,
  XP_FLOOR_BONUS: 200,
};

export const PLAYER_LEVELS: LevelInfo[] = [
  {
    level: 'New You',
    minFloors: 0,
    maxFloors: 1,
    title: 'New You',
    description: 'Langkah pertama menjelajahi Kampus Terpadu UNU Yogyakarta.',
    badgeIcon: 'seedling',
    color: '#10B981',
  },
  {
    level: 'Explorer',
    minFloors: 2,
    maxFloors: 4,
    title: 'Explorer',
    description: 'Mulai memahami nilai ke-NU-an, anti-korupsi, dan etika kampus.',
    badgeIcon: 'compass',
    color: '#3B82F6',
  },
  {
    level: 'Achiever',
    minFloors: 5,
    maxFloors: 7,
    title: 'Achiever',
    description: 'Konsisten menyelesaikan tantangan dan menguasai materi orientasi.',
    badgeIcon: 'medal',
    color: '#8B5CF6',
  },
  {
    level: 'Almost There',
    minFloors: 8,
    maxFloors: 8,
    title: 'Almost There',
    description: 'Tinggal selangkah lagi menyempurnakan seluruh lantai eksplorasi!',
    badgeIcon: 'sparkle',
    color: '#F59E0B',
  },
  {
    level: 'Upgraded You',
    minFloors: 9,
    maxFloors: 9,
    title: 'Upgraded You',
    description: 'Karakter unggul, berdaya saing global, dan siap menjadi agen perubahan.',
    badgeIcon: 'crown',
    color: '#EC4899',
  },
];
