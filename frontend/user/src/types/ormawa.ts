export type OrmawaCategory =
  | 'BELA_DIRI'
  | 'TEKNOLOGI'
  | 'SENI_BUDAYA'
  | 'SOSIAL_KEMANUSIAAN'
  | 'OLAHRAGA'
  | 'PENALARAN_KEISLAMAN';

export interface OrmawaStand {
  id: string;
  name: string;
  shortName: string;
  category: OrmawaCategory;
  floor: 3 | 4 | 5;
  location: string;
  qrToken: string;
  tagline: string;
  description: string;
  instagram: string;
  badgeTitle: string;
  badgeColor: string;
  activities: string[];
  requirements: string[];
  contactPerson?: string;
}

export interface OrmawaScanResult {
  success: boolean;
  message: string;
  xpEarned: number;
  stand?: OrmawaStand;
  isCapped: boolean;
}
