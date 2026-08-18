export type CategoryType =
  | 'umum'
  | 'anti_korupsi'
  | 'anti_narkoba'
  | 'anti_kekerasan'
  | 'etika_digital'
  | 'riset_inovasi'
  | 'pengembangan_karir';

export type BoothType = 'kuis' | 'video_kuis' | 'interaktif';

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

export interface Booth {
  id: string;
  floorNumber: number;
  code: string; // e.g. "B1-A", "B1-B"
  name: string;
  subtitle: string;
  type: BoothType;
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
}

export interface Floor {
  number: number;
  name: string;
  theme: string;
  description: string;
  icon: string;
  accentColor: string;
  boothIds: [string, string];
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
}

export interface LevelInfo {
  level: PlayerLevel;
  minFloors: number;
  maxFloors: number;
  title: string;
  description: string;
  badgeIcon: string;
  color: string;
}
