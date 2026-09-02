export type CategoryType =
  | 'umum'
  | 'anti_korupsi'
  | 'anti_narkoba'
  | 'anti_kekerasan'
  | 'etika_digital'
  | 'riset_inovasi'
  | 'pengembangan_karir';

export type GameType =
  | 'tts'
  | 'tebak_kata'
  | 'tebak_posisi'
  | 'memory_match'
  | 'kuis_cepat'
  | 'benar_salah'
  | 'kuis';

export type BoothType = GameType;

export type PlayerLevel =
  | 'New You'
  | 'Explorer'
  | 'Achiever'
  | 'Almost There'
  | 'Upgraded You';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Mini-game Specific Content Interfaces

// 1. TTS (Teka-Teki Silang)
export interface TtsClue {
  id: string;
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string; // Uppercase
  row: number; // 0-indexed start row in grid
  col: number; // 0-indexed start col in grid
}

export interface TtsContent {
  gridRows: number;
  gridCols: number;
  clues: TtsClue[];
}

// 2. Tebak Kata (Word Scramble / Blank Filling)
export interface TebakKataItem {
  id: string;
  clue: string;
  targetWord: string; // Uppercase e.g. "TASAMUH"
  scrambledLetters: string[]; // e.g. ["T", "A", "S", "A", "M", "U", "H", "K", "L"]
  hint?: string;
  explanation: string;
}

export interface TebakKataContent {
  items: TebakKataItem[];
}

// 3. Tebak Posisi (Photo / Campus Spot Identification)
export interface TebakPosisiItem {
  id: string;
  prompt: string;
  imageUrl: string;
  imageAlt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  locationHint?: string;
}

export interface TebakPosisiContent {
  items: TebakPosisiItem[];
}

// 4. Memory Match (Pair Matching)
export interface MemoryPair {
  id: string;
  labelA: string; // e.g. "Tawazun"
  labelB: string; // e.g. "Sikap Seimbang & Proporsional"
  tag?: string;
}

export interface MemoryMatchContent {
  pairs: MemoryPair[];
  themeDescription?: string;
}

// 5. Kuis Cepat (Timed Multiple Choice)
export interface KuisCepatContent {
  timeLimitSeconds: number; // e.g. 20 seconds per question or total
  questions: Question[];
}

// 6. Benar / Salah Cepat (True / False Rapid Rounds)
export interface BenarSalahStatement {
  id: string;
  statement: string;
  isCorrect: boolean; // true if the statement is TRUE, false if FALSE
  explanation: string;
}

export interface BenarSalahContent {
  statements: BenarSalahStatement[];
}

export interface Booth {
  id: string;
  floorNumber: number;
  code: string; // e.g. "B1-A", "B1-B"
  name: string;
  subtitle: string;
  type: BoothType;
  tipe_game: GameType;
  category: CategoryType;
  story: string;
  videoUrl?: string;
  readingTime: string;
  iconName: string;
  stampIcon: string;
  stampTitle: string;
  stampColor: string;
  badgeTag: string;
  questions: Question[];
  // Specific mini-game content payloads
  ttsContent?: TtsContent;
  tebakKataContent?: TebakKataContent;
  tebakPosisiContent?: TebakPosisiContent;
  memoryMatchContent?: MemoryMatchContent;
  kuisCepatContent?: KuisCepatContent;
  benarSalahContent?: BenarSalahContent;
}

export interface FloorStoryIntro {
  title: string;
  narrative: string;
  guideMessage: string;
  keyLearning: string[];
}

export interface Floor {
  number: number;
  name: string;
  theme: string;
  description: string;
  icon: string;
  accentColor: string;
  boothIds: [string, string];
  storyIntro?: FloorStoryIntro;
}

export interface StampRecord {
  boothId: string;
  boothName: string;
  floorNumber: number;
  stampTitle: string;
  stampIcon: string;
  stampColor: string;
  earnedAt: string;
  score: number;
  totalQuestions: number;
}

export interface Participant {
  name: string;
  nim: string;
  prodi: string;
  faculty: string;
  avatar: string;
  totalXp: number;
  completedBooths: string[];
  stamps: Record<string, StampRecord>;
  groupId?: string;
  groupName?: string;
  isRegistered?: boolean;
}

export interface LevelInfo {
  level: PlayerLevel;
  minFloors: number;
  maxFloors: number;
  title: string;
  description: string;
  badgeIcon: string;
  iconName?: string;
  color: string;
}

// Leaderboard Models
export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  nim: string;
  faculty: string;
  prodi: string;
  avatar: string;
  totalXp: number;
  stampsCount: number;
  completedFloors: number;
  isCurrentUser?: boolean;
  groupId: string;
  groupName: string;
}

export interface GroupMember {
  id: string;
  name: string;
  nim: string;
  prodi: string;
  avatar: string;
  totalXp: number;
  stampsCount: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardGroup {
  id: string;
  rank: number;
  name: string;
  motto: string;
  cluster: string;
  members: GroupMember[];
  avgXp: number;
  totalXp: number;
  totalStampsAvg: number;
  trend?: 'up' | 'down' | 'same';
}
