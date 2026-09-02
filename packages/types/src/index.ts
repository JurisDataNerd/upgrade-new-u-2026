// ============================================================
// GENIUS 2026 — Shared Types & Enums
// ============================================================

// --- User Roles ---
export enum UserRole {
  ADMIN = "ADMIN",
  BUDDY = "BUDDY",
  PARTICIPANT = "PARTICIPANT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// --- Buddy Roles ---
export enum BuddyRole {
  PRIMARY = "PRIMARY",
  ASSISTANT = "ASSISTANT",
}

// --- Stage ---
export enum StageStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

// --- Location ---
export enum LocationStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  OCCUPIED = "OCCUPIED",
  COMPLETED = "COMPLETED",
  LOCKED = "LOCKED",
}

// --- Mission ---
export enum MissionType {
  MAIN = "MAIN",
  SIDE_QUEST = "SIDE_QUEST",
  MYSTERY_EGG = "MYSTERY_EGG",
}

export enum MissionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// --- Game ---
export enum GameType {
  QUIZ = "QUIZ",
  PUZZLE = "PUZZLE",
  MEMORY = "MEMORY",
  REACTION = "REACTION",
  RAPID_ANSWER = "RAPID_ANSWER",
  SEQUENCE = "SEQUENCE",
  WORD_GAME = "WORD_GAME",
  IMAGE_GUESS = "IMAGE_GUESS",
  LOGIC = "LOGIC",
  TEAM_CHALLENGE = "TEAM_CHALLENGE",
  EXPLORATION = "EXPLORATION",
}

export enum GameStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// --- Game Session ---
export enum GameSessionStatus {
  PENDING = "PENDING",
  READY = "READY",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

// --- Question ---
export enum QuestionDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
}

export enum QuestionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}

// --- Score ---
export enum ScoreSourceType {
  GAME = "GAME",
  BONUS = "BONUS",
  PENALTY = "PENALTY",
  CORRECTION = "CORRECTION",
  ACHIEVEMENT = "ACHIEVEMENT",
}

// --- Buddy Bonus ---
export enum BuddyBonusReason {
  TEAMWORK = "TEAMWORK",
  LEADERSHIP = "LEADERSHIP",
  CREATIVITY = "CREATIVITY",
  SPORTSMANSHIP = "SPORTSMANSHIP",
  DISCIPLINE = "DISCIPLINE",
  SPECIAL_ACHIEVEMENT = "SPECIAL_ACHIEVEMENT",
}

// --- Route ---
export enum RouteStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// --- Achievement ---
export enum AchievementStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// --- Audit Log ---
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  START_GAME = "START_GAME",
  END_GAME = "END_GAME",
  SCORE_BONUS = "SCORE_BONUS",
  SCORE_CORRECTION = "SCORE_CORRECTION",
}

// ============================================================
// RPG & Character Evolution System
// ============================================================

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum CharacterTier {
  BASIC = 1,      // Tier 1: Dasar / Novice
  ADVANCED = 2,   // Tier 2: Lanjutan / Adept (Pts >= 200)
  MASTER = 3,     // Tier 3: Legendaris / Ascended (Pts >= 500)
}

export enum CharacterClass {
  CYBER_KNIGHT = "CYBER_KNIGHT",
  TECH_MAGE = "TECH_MAGE",
  CODE_ARCHER = "CODE_ARCHER",
  DATA_ALCHEMIST = "DATA_ALCHEMIST",
  SHADOW_ASSASSIN = "SHADOW_ASSASSIN",
  QUANTUM_SCHOLAR = "QUANTUM_SCHOLAR",
  MECHA_PALADIN = "MECHA_PALADIN",
  RUNIC_ENGINEER = "RUNIC_ENGINEER",
}

export interface CharacterEvolutionStage {
  tier: CharacterTier;
  tierName: string;
  tierNameId: string;
  badge: string;
  defaultTitle: string;
  requiredPoints: number;
  statMultiplier: number;
  glowAuraColor: string;
  auraName: string;
  avatarMale: string;
  avatarFemale: string;
  features: string[];
}

export interface RPGCharacterInfo {
  id: CharacterClass;
  name: string;
  nameId: string;
  icon: string;
  role: string;
  specialty: string;
  description: string;
  color: string;
  stats: {
    str: number;
    int: number;
    agi: number;
    vit: number;
    wis: number;
  };
  defaultAvatarMale: string;
  defaultAvatarFemale: string;
  evolutions: Record<CharacterTier, CharacterEvolutionStage>;
}

export const RPG_CHARACTERS: Record<CharacterClass, RPGCharacterInfo> = {
  [CharacterClass.CYBER_KNIGHT]: {
    id: CharacterClass.CYBER_KNIGHT,
    name: "Cyber Knight",
    nameId: "Ksatria Siber",
    icon: "🛡️",
    role: "Tank / Defender",
    specialty: "Pertahanan & Ketahanan Tim",
    description: "Pelindung tim yang tangguh dalam menjaga ketahanan saat tantangan beruntun.",
    color: "#38bdf8",
    stats: { str: 85, int: 60, agi: 55, vit: 95, wis: 65 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightM1&backgroundColor=0284c7",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightF1&backgroundColor=0284c7",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Cyber Squire",
        tierNameId: "Ksatria Siber Magang",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Novice Adventurer",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#38bdf8",
        auraName: "Neon Shield",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightM1&backgroundColor=0284c7",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightF1&backgroundColor=0284c7",
        features: ["Perisai Data Dasar", "Ketahanan Tim Standar"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Cyber Paladin",
        tierNameId: "Paladin Siber",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Aegis Vanguard",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#60a5fa",
        auraName: "Rune Fortress Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightM2&backgroundColor=1d4ed8",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightF2&backgroundColor=1d4ed8",
        features: ["Aegis Firewall Barrier", "+40% Stat Defense Multiplier"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Supreme Firewall Sovereign",
        tierNameId: "Benteng Siber Utama",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Lord of the Firewall",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#facc15",
        auraName: "Legendary Sunfire Shield",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightM3&backgroundColor=b45309",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightF3&backgroundColor=b45309",
        features: ["Unbreakable Citadel", "+100% Stat Max Boost", "Golden Aura"],
      },
    },
  },
  [CharacterClass.TECH_MAGE]: {
    id: CharacterClass.TECH_MAGE,
    name: "Tech Mage",
    nameId: "Penyihir Teknologi",
    icon: "🔮",
    role: "Burst Solver / Analyst",
    specialty: "Pemecahan Logika & Analisis Data",
    description: "Ahli logika & data yang cepat memecahkan teka-teki rumit.",
    color: "#a855f7",
    stats: { str: 45, int: 98, agi: 60, vit: 50, wis: 92 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageM1&backgroundColor=7e22ce",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageF1&backgroundColor=7e22ce",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Code Apprentice",
        tierNameId: "Penyihir Kode Pemula",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Code Apprentice",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#a855f7",
        auraName: "Arcane Spark",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageM1&backgroundColor=7e22ce",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageF1&backgroundColor=7e22ce",
        features: ["Analisis Kode Dasar", "Pemecah Soal Cepat"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Cyber Arcanist",
        tierNameId: "Pakar Data Siber",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Archmage of Code",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#c084fc",
        auraName: "Mystic Circuit Matrix",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageM2&backgroundColor=6b21a8",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageF2&backgroundColor=6b21a8",
        features: ["Algorithmic Overdrive", "+40% INT & Wisdom Surge"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Quantum Reality Weaver",
        tierNameId: "Master Kuantum",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Singularity Sage",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#f43f5e",
        auraName: "Cosmic Singularity Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageM3&backgroundColor=9f1239",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageF3&backgroundColor=9f1239",
        features: ["Reality Code Rewrite", "+100% Supreme Wisdom Boost"],
      },
    },
  },
  [CharacterClass.CODE_ARCHER]: {
    id: CharacterClass.CODE_ARCHER,
    name: "Code Archer",
    nameId: "Pemanah Kode",
    icon: "🏹",
    role: "Precision / Speed Shooter",
    specialty: "Kecepatan Reaksi & Akurasi",
    description: "Penjelajah lincah dengan akurasi dan refleks tinggi untuk game kecepatan.",
    color: "#22c55e",
    stats: { str: 60, int: 75, agi: 95, vit: 60, wis: 70 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherM1&backgroundColor=15803d",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherF1&backgroundColor=15803d",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Algorithm Scout",
        tierNameId: "Pengintai Algoritma",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Algorithm Scout",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#22c55e",
        auraName: "Wind Arrow Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherM1&backgroundColor=15803d",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherF1&backgroundColor=15803d",
        features: ["Panah Akurasi Refleks", "Kecepatan Timer Standard"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Sniper of Algorithms",
        tierNameId: "Penembak Jitu Kode",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Master Kuis Cepat",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#4ade80",
        auraName: "Lightning Precision Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherM2&backgroundColor=166534",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherF2&backgroundColor=166534",
        features: ["Eagle Eye Accuracy", "+40% Agility & Reaction Time"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Divine Ray Marksman",
        tierNameId: "Master Presisi Utama",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Hawkeye of UNU",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#38bdf8",
        auraName: "Celestial Light Ray",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherM3&backgroundColor=075985",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherF3&backgroundColor=075985",
        features: ["Instant Hit Mastery", "+100% Agility & Critical Boost"],
      },
    },
  },
  [CharacterClass.DATA_ALCHEMIST]: {
    id: CharacterClass.DATA_ALCHEMIST,
    name: "Data Alchemist",
    nameId: "Alkemis Data",
    icon: "🧪",
    role: "Catalyst / Strategist",
    specialty: "Memori & Pola Informasi",
    description: "Strategis yang mahir mengolah petunjuk acak menjadi poin tim.",
    color: "#eab308",
    stats: { str: 50, int: 90, agi: 70, vit: 65, wis: 88 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistM1&backgroundColor=a16207",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistF1&backgroundColor=a16207",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Data Seeker",
        tierNameId: "Pencari Pola",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Data Seeker",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#eab308",
        auraName: "Golden Flask Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistM1&backgroundColor=a16207",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistF1&backgroundColor=a16207",
        features: ["Pencium Pola Puzzle", "Memory Sequence Standard"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Grand Data Alchemist",
        tierNameId: "Alkemis Data Senior",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Data Wizard",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#facc15",
        auraName: "Philosopher's Circuit",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistM2&backgroundColor=854d0e",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistF2&backgroundColor=854d0e",
        features: ["Matrix Pattern Decoder", "+40% Intelligence Multiplier"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Omni Sage of Big Data",
        tierNameId: "Pakar Data Utama",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Oracle of 9 Floors",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#a855f7",
        auraName: "Infinite Knowledge Orb",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistM3&backgroundColor=581c87",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistF3&backgroundColor=581c87",
        features: ["Omniscient Insight", "+100% INT & Wisdom Mastery"],
      },
    },
  },
  [CharacterClass.SHADOW_ASSASSIN]: {
    id: CharacterClass.SHADOW_ASSASSIN,
    name: "Shadow Assassin",
    nameId: "Pengelana Bayangan",
    icon: "🗡️",
    role: "Speed / Infiltrator",
    specialty: "Kecepatan Reaksi & Pergerakan",
    description: "Pengintai gesit yang bergerak cepat menembus rute di gedung 9 lantai.",
    color: "#f43f5e",
    stats: { str: 70, int: 70, agi: 98, vit: 55, wis: 60 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinM1&backgroundColor=be123c",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinF1&backgroundColor=be123c",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Silent Runner",
        tierNameId: "Pelari Senyap",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Silent Runner",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#f43f5e",
        auraName: "Shadow Veil",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinM1&backgroundColor=be123c",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinF1&backgroundColor=be123c",
        features: ["Navigasi Rute Cepat", "Refleks Reaksi Dasar"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Phantom Infiltrator",
        tierNameId: "Penyusup Senyap",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Speed Solver",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#fb7185",
        auraName: "Crimson Ghost Trail",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinM2&backgroundColor=9f1239",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinF2&backgroundColor=9f1239",
        features: ["Speed Rush", "+40% Agility Multiplier"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Ghost of the 9th Floor",
        tierNameId: "Penakluk Menara",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Lantai 9 Conqueror",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#ca8a04",
        auraName: "Shadow Sovereign Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinM3&backgroundColor=713f12",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinF3&backgroundColor=713f12",
        features: ["Ghostly Teleport", "+100% Agility Max Burst"],
      },
    },
  },
  [CharacterClass.QUANTUM_SCHOLAR]: {
    id: CharacterClass.QUANTUM_SCHOLAR,
    name: "Quantum Scholar",
    nameId: "Cendekiawan Kuantum",
    icon: "📜",
    role: "Knowledge Master",
    specialty: "Penguasaan Kuis Teori & Wawasan",
    description: "Pakar ensiklopedia berjalan yang menguasai berbagai bank soal akademik dan sejarah universitas.",
    color: "#6366f1",
    stats: { str: 40, int: 95, agi: 50, vit: 60, wis: 98 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarM1&backgroundColor=4338ca",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarF1&backgroundColor=4338ca",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Curious Scholar",
        tierNameId: "Cendekiawan Peneliti",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Curious Scholar",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#6366f1",
        auraName: "Scroll of Truth",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarM1&backgroundColor=4338ca",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarF1&backgroundColor=4338ca",
        features: ["Akurasi Soal Teori", "Wawasan Kampus"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Quantum Architect",
        tierNameId: "Arsitek Kuantum",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Strategis Jenius",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#818cf8",
        auraName: "Harmonic Wave Field",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarM2&backgroundColor=3730a3",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarF2&backgroundColor=3730a3",
        features: ["Strategic Mindset", "+40% Wisdom & Strategy Boost"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Cosmic Grandmaster",
        tierNameId: "Grandmaster Kosmik UNU",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Grand Master of UNU",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#facc15",
        auraName: "Crown of Enlightenment",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarM3&backgroundColor=854d0e",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumScholarF3&backgroundColor=854d0e",
        features: ["All-Seeing Wisdom", "+100% Wisdom Max Boost"],
      },
    },
  },
  [CharacterClass.MECHA_PALADIN]: {
    id: CharacterClass.MECHA_PALADIN,
    name: "Mecha Paladin",
    nameId: "Paladin Penjaga",
    icon: "⚡",
    role: "Leader / Morale Booster",
    specialty: "Sinergi Kolaborasi & Semangat Tim",
    description: "Pemimpin tangguh berzirah mekanik yang membakar semangat tim saat menaklukkan stage tersulit.",
    color: "#f97316",
    stats: { str: 88, int: 65, agi: 60, vit: 90, wis: 80 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinM1&backgroundColor=c2410c",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinF1&backgroundColor=c2410c",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Iron Sentry",
        tierNameId: "Penjaga Baja",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Iron Sentry",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#f97316",
        auraName: "Spark Generator",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinM1&backgroundColor=c2410c",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinF1&backgroundColor=c2410c",
        features: ["Semangat Kolaborasi", "Kekuatan Tim Dasar"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Titan Guardian",
        tierNameId: "Penjaga Titan",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Benteng Pertahanan",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#fb923c",
        auraName: "Titan Armor Field",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinM2&backgroundColor=9a3412",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinF2&backgroundColor=9a3412",
        features: ["Titan Morale Shield", "+40% Strength & Stamina"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Apex Mecha Sovereign",
        tierNameId: "Raja Mecha Penakluk Tertinggi",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Unbreakable Titan",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#eab308",
        auraName: "Solar Core Overdrive",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinM3&backgroundColor=78350f",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaPaladinF3&backgroundColor=78350f",
        features: ["Solar Core Power", "+100% Strength & Vitality Max"],
      },
    },
  },
  [CharacterClass.RUNIC_ENGINEER]: {
    id: CharacterClass.RUNIC_ENGINEER,
    name: "Runic Engineer",
    nameId: "Insinyur Runa",
    icon: "⚙️",
    role: "Mechanic / Innovator",
    specialty: "Pemecah Mekanisme & Pola Logika",
    description: "Ahli rancang bangun yang mahir membongkar pola puzzle spasial dan tantangan logika lantai.",
    color: "#14b8a6",
    stats: { str: 65, int: 88, agi: 70, vit: 75, wis: 78 },
    defaultAvatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerM1&backgroundColor=0f766e",
    defaultAvatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerF1&backgroundColor=0f766e",
    evolutions: {
      [CharacterTier.BASIC]: {
        tier: CharacterTier.BASIC,
        tierName: "Tinker Novice",
        tierNameId: "Mekanik Runa Pemula",
        badge: "⭐ TIER 1: NOVICE",
        defaultTitle: "Tinker Novice",
        requiredPoints: 0,
        statMultiplier: 1.0,
        glowAuraColor: "#14b8a6",
        auraName: "Gear Mechanism Spark",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerM1&backgroundColor=0f766e",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerF1&backgroundColor=0f766e",
        features: ["Pemecah Puzzle Standar", "Analisis Rangkaian Dasar"],
      },
      [CharacterTier.ADVANCED]: {
        tier: CharacterTier.ADVANCED,
        tierName: "Master Technomancer",
        tierNameId: "Teknomanser Ahli",
        badge: "⭐⭐ TIER 2: ADVANCED",
        defaultTitle: "Arsitek Sistem",
        requiredPoints: 200,
        statMultiplier: 1.4,
        glowAuraColor: "#2dd4bf",
        auraName: "Rune Pulse Generator",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerM2&backgroundColor=115e59",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerF2&backgroundColor=115e59",
        features: ["Technomancy Core", "+40% INT & Technical Agility"],
      },
      [CharacterTier.MASTER]: {
        tier: CharacterTier.MASTER,
        tierName: "Cybernetic Demigod",
        tierNameId: "Pencipta Runa Semesta",
        badge: "👑 TIER 3: ASCENDED",
        defaultTitle: "Prime Creator",
        requiredPoints: 500,
        statMultiplier: 2.0,
        glowAuraColor: "#f59e0b",
        auraName: "Eternal Clockwork Aura",
        avatarMale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerM3&backgroundColor=78350f",
        avatarFemale: "https://api.dicebear.com/7.x/bottts/svg?seed=RunicEngineerF3&backgroundColor=78350f",
        features: ["Architect of Reality", "+100% Max Stat Mastery"],
      },
    },
  },
};

// ============================================================
// Title Definitions & Unlock System (99 Titles with R/E/SR/SSR Rarity)
// ============================================================

export enum TitleRarity {
  RARE = "RARE",
  EPIC = "EPIC",
  SR = "SR",
  SSR = "SSR",
}

export interface TitleDefinition {
  id: string; // e.g. "TTL-001"
  title: string;
  rarity: TitleRarity;
  category: string;
  icon: string;
  description: string;
  unlockType: "DEFAULT" | "POINTS" | "TIER" | "ADMIN" | "SPECIAL";
  requiredPoints: number;
  requiredTier: CharacterTier;
  associatedClass?: CharacterClass;
}

export function getTitleRarityDetails(rarity: TitleRarity | string) {
  switch (rarity) {
    case TitleRarity.SSR:
      return {
        label: "SPECIALLY SUPER RARE",
        shortLabel: "SSR",
        badgeColor: "linear-gradient(135deg, #FF0080 0%, #7928CA 50%, #00DFD8 100%)",
        textColor: "#ffffff",
        glowColor: "#00DFD8",
        borderColor: "#ec4899",
        bgTint: "rgba(236, 72, 153, 0.15)",
        auraClass: "title-ssr-glow",
        icon: "🌈",
      };
    case TitleRarity.SR:
      return {
        label: "SUPER RARE",
        shortLabel: "SR",
        badgeColor: "#F59E0B",
        textColor: "#fef08a",
        glowColor: "#f59e0b",
        borderColor: "#d97706",
        bgTint: "rgba(245, 158, 11, 0.15)",
        auraClass: "title-sr-glow",
        icon: "🟨",
      };
    case TitleRarity.EPIC:
      return {
        label: "EPIC",
        shortLabel: "EPIC",
        badgeColor: "#A855F7",
        textColor: "#e9d5ff",
        glowColor: "#a855f7",
        borderColor: "#9333ea",
        bgTint: "rgba(168, 85, 247, 0.15)",
        auraClass: "title-epic-glow",
        icon: "🟪",
      };
    case TitleRarity.RARE:
    default:
      return {
        label: "RARE",
        shortLabel: "RARE",
        badgeColor: "#3B82F6",
        textColor: "#bfdbfe",
        glowColor: "#3b82f6",
        borderColor: "#2563eb",
        bgTint: "rgba(59, 130, 246, 0.15)",
        auraClass: "title-rare-glow",
        icon: "🟦",
      };
  }
}

export function findTitleDefinition(titleOrId: string): TitleDefinition | undefined {
  return TITLE_CATALOG.find((t) => t.id === titleOrId || t.title === titleOrId);
}

export const TITLE_CATALOG: TitleDefinition[] = [
  // ==========================================
  // 🟦 BAGIAN 1: RARE (R) — 36 Gelar (TTL-001 s/d TTL-036)
  // ==========================================
  {
    id: "TTL-001",
    title: "Campus Pathfinder 2026",
    rarity: TitleRarity.RARE,
    category: "Day 1 Incubation",
    icon: "🧭",
    description: "Menyelesaikan registrasi awal & profil KTM RPG petualang.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-002",
    title: "Ground Zero Stepper",
    rarity: TitleRarity.RARE,
    category: "Eksplorasi Lantai",
    icon: "🏢",
    description: "Menginjakkan kaki & check-in pertama di Lantai 1.",
    unlockType: "POINTS",
    requiredPoints: 20,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-003",
    title: "Intelektual Muda Aswaja",
    rarity: TitleRarity.RARE,
    category: "Aswaja & Nilai",
    icon: "🕌",
    description: "Menuntaskan Corner Aswaja Corner di Lantai 1.",
    unlockType: "POINTS",
    requiredPoints: 40,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-004",
    title: "Etika & Empati Medika",
    rarity: TitleRarity.RARE,
    category: "Eksplorasi Lantai",
    icon: "🏥",
    description: "Menuntaskan Corner Health & Ethics di Lantai 2.",
    unlockType: "POINTS",
    requiredPoints: 60,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-005",
    title: "Kawan Kolaborasi Baru",
    rarity: TitleRarity.RARE,
    category: "Sosial & Tim",
    icon: "🤝",
    description: "Melakukan interaksi kelompok pertama di Lantai 3.",
    unlockType: "POINTS",
    requiredPoints: 75,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-006",
    title: "Penyelam Samudra Buku",
    rarity: TitleRarity.RARE,
    category: "Literasi",
    icon: "📚",
    description: "Mengunjungi Library Corner di Lantai 4.",
    unlockType: "POINTS",
    requiredPoints: 90,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-007",
    title: "Sahabat Anti-Bullying",
    rarity: TitleRarity.RARE,
    category: "Integritas",
    icon: "🛡️",
    description: "Mengikuti deklarasi anti-perundungan di Lantai 5.",
    unlockType: "POINTS",
    requiredPoints: 100,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-008",
    title: "Laboran Pemula UNU",
    rarity: TitleRarity.RARE,
    category: "Sains & Riset",
    icon: "🔬",
    description: "Menyelesaikan pengenalan Lab Riset di Lantai 6.",
    unlockType: "POINTS",
    requiredPoints: 110,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-009",
    title: "AI Curiosity Seeker",
    rarity: TitleRarity.RARE,
    category: "AI & Teknologi",
    icon: "🤖",
    description: "Menyapa AI Hub pertama kali di Lantai 7.",
    unlockType: "POINTS",
    requiredPoints: 120,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-010",
    title: "Penyusun Masa Depan",
    rarity: TitleRarity.RARE,
    category: "Karir & Akademik",
    icon: "💼",
    description: "Menyelesaikan modul Career Path di Lantai 8.",
    unlockType: "POINTS",
    requiredPoints: 130,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-011",
    title: "Penatap Langit Rooftop",
    rarity: TitleRarity.RARE,
    category: "Puncak Gedung",
    icon: "🌆",
    description: "Mencapai Lantai 9 untuk pertama kali.",
    unlockType: "POINTS",
    requiredPoints: 140,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-012",
    title: "Pengumpul 3 Stempel",
    rarity: TitleRarity.RARE,
    category: "Stempel Paspor",
    icon: "🎟️",
    description: "Mengumpulkan total 3 stempel corner.",
    unlockType: "POINTS",
    requiredPoints: 60,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-013",
    title: "Penikmat Kopi Harmoni",
    rarity: TitleRarity.RARE,
    category: "Archetype Harmonizer",
    icon: "☕",
    description: "Memilih opsi dialog empati 3 kali berturut-turut.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-014",
    title: "Perumus Taktik Awal",
    rarity: TitleRarity.RARE,
    category: "Archetype Strategist",
    icon: "👓",
    description: "Menyelesaikan skenario 1 Incubation dengan logis.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-015",
    title: "Pencetus Ide Spontan",
    rarity: TitleRarity.RARE,
    category: "Archetype Innovator",
    icon: "💡",
    description: "Memilih solusi out-of-the-box pada Day 1.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-016",
    title: "Penaung Suara Tim",
    rarity: TitleRarity.RARE,
    category: "Archetype Mobilizer",
    icon: "📣",
    description: "Mengambil peran juru bicara kelompok Day 1.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-017",
    title: "Coretan Pertama Kanvas",
    rarity: TitleRarity.RARE,
    category: "AI Canvas Drawing",
    icon: "🖌️",
    description: "Mengunggah gambar pertama ke AI Curator.",
    unlockType: "POINTS",
    requiredPoints: 50,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-018",
    title: "Garis Spontan Minimalis",
    rarity: TitleRarity.RARE,
    category: "AI Canvas Drawing",
    icon: "📐",
    description: "Mendapat rating minimal bintang 3 dari AI Curator.",
    unlockType: "POINTS",
    requiredPoints: 70,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-019",
    title: "Penjaga Ketertiban Baris",
    rarity: TitleRarity.RARE,
    category: "Kedisiplinan",
    icon: "⏱️",
    description: "Check-in tepat waktu di setiap pos orientasi.",
    unlockType: "POINTS",
    requiredPoints: 80,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-020",
    title: "Pembelajar Tawassuth",
    rarity: TitleRarity.RARE,
    category: "Aswaja & Nilai",
    icon: "⚖️",
    description: "Memilih sikap moderat dalam studi kasus konflik.",
    unlockType: "POINTS",
    requiredPoints: 85,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-021",
    title: "Penebar Senyum Hangat",
    rarity: TitleRarity.RARE,
    category: "Sosial & Tim",
    icon: "😊",
    description: "Berkenalan dengan 5 mahasiswa dari fakultas berbeda.",
    unlockType: "POINTS",
    requiredPoints: 90,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-022",
    title: "Pembaca Petunjuk Teliti",
    rarity: TitleRarity.RARE,
    category: "Eksplorasi Lantai",
    icon: "📜",
    description: "Membaca seluruh papan panduan corner tanpa skip.",
    unlockType: "POINTS",
    requiredPoints: 95,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-023",
    title: "Detektif Fakta Kampus",
    rarity: TitleRarity.RARE,
    category: "Literasi",
    icon: "🔍",
    description: "Menjawab kuis sejarah UNU Yogyakarta dengan benar.",
    unlockType: "POINTS",
    requiredPoints: 100,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-024",
    title: "Pejuang Koneksi Wifi",
    rarity: TitleRarity.RARE,
    category: "Teknologi",
    icon: "📶",
    description: "Terhubung sukses dan login ke portal digital.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-025",
    title: "Penyimak Sabda Senior",
    rarity: TitleRarity.RARE,
    category: "NPC Senior Mentor",
    icon: "🎓",
    description: "Menyelesaikan seluruh dialog tutorial Senior Mentor AI.",
    unlockType: "POINTS",
    requiredPoints: 50,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-026",
    title: "Kolektor Pin Orientasi",
    rarity: TitleRarity.RARE,
    category: "Gamifikasi",
    icon: "🎖️",
    description: "Membuka 3 achievement kategori umum.",
    unlockType: "POINTS",
    requiredPoints: 105,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-027",
    title: "Pelindung Sahabat Baru",
    rarity: TitleRarity.RARE,
    category: "Solidaritas",
    icon: "🫂",
    description: "Membantu teman satu kelompok yang tertinggal.",
    unlockType: "POINTS",
    requiredPoints: 115,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-028",
    title: "Pengamat Sudut Hijau",
    rarity: TitleRarity.RARE,
    category: "Lingkungan",
    icon: "🌱",
    description: "Menemukan titik eco-green di area kampus.",
    unlockType: "POINTS",
    requiredPoints: 120,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-029",
    title: "Pemuja Garis Presisi",
    rarity: TitleRarity.RARE,
    category: "AI Canvas Drawing",
    icon: "✏️",
    description: "Menggambar geometri rapi di kanvas digital.",
    unlockType: "POINTS",
    requiredPoints: 125,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-030",
    title: "Penjelajah Tangga Darurat",
    rarity: TitleRarity.RARE,
    category: "Eksplorasi",
    icon: "🪜",
    description: "Menaiki 3 lantai tanpa lift untuk kebugaran.",
    unlockType: "POINTS",
    requiredPoints: 130,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-031",
    title: "Suara Penggugah Semangat",
    rarity: TitleRarity.RARE,
    category: "Yel-Yel & Dinamika",
    icon: "📢",
    description: "Menyanyikan mars/yel kelompok dengan lantang.",
    unlockType: "POINTS",
    requiredPoints: 135,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-032",
    title: "Pengarsip Berkas Rapi",
    rarity: TitleRarity.RARE,
    category: "Administrasi",
    icon: "📂",
    description: "Melengkapi 100% data profil mahasiswa di aplikasi.",
    unlockType: "DEFAULT",
    requiredPoints: 0,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-033",
    title: "Penatap Horizon Jogja",
    rarity: TitleRarity.RARE,
    category: "Puncak Gedung",
    icon: "🌅",
    description: "Mengambil foto panorama dari spot Lantai 9.",
    unlockType: "POINTS",
    requiredPoints: 145,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-034",
    title: "Pemberi Respons Kilat",
    rarity: TitleRarity.RARE,
    category: "Kecepatan",
    icon: "⚡",
    description: "Menjawab kuis dalam waktu di bawah 10 detik.",
    unlockType: "POINTS",
    requiredPoints: 150,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-035",
    title: "Penemu Ruang Sunyi",
    rarity: TitleRarity.RARE,
    category: "Literasi",
    icon: "🤫",
    description: "Mengunjungi zona hening perpustakaan.",
    unlockType: "POINTS",
    requiredPoints: 155,
    requiredTier: CharacterTier.BASIC,
  },
  {
    id: "TTL-036",
    title: "Bintang Harapan Kelas",
    rarity: TitleRarity.RARE,
    category: "Pemula",
    icon: "🌟",
    description: "Menyelesaikan seluruh rangkaian pos di hari pertama.",
    unlockType: "POINTS",
    requiredPoints: 160,
    requiredTier: CharacterTier.BASIC,
  },

  // ==========================================
  // 🟪 BAGIAN 2: EPIC (E) — 33 Gelar (TTL-037 s/d TTL-069)
  // ==========================================
  {
    id: "TTL-037",
    title: "Arsitek Ambisi Angkatan",
    rarity: TitleRarity.EPIC,
    category: "Archetype Strategist",
    icon: "🏛️",
    description: "Skor Logika ≥ 85% pada Game 1 Incubation.",
    unlockType: "TIER",
    requiredPoints: 180,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-038",
    title: "Pabrik Ide Avant-Garde",
    rarity: TitleRarity.EPIC,
    category: "Archetype Innovator",
    icon: "⚡",
    description: "Skor Inovasi ≥ 85% pada Game 1 Incubation.",
    unlockType: "TIER",
    requiredPoints: 180,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-039",
    title: "Panglima Aksi Lapangan",
    rarity: TitleRarity.EPIC,
    category: "Archetype Mobilizer",
    icon: "🛡️",
    description: "Skor Leadership ≥ 85% pada Game 1 Incubation.",
    unlockType: "TIER",
    requiredPoints: 180,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-040",
    title: "Perekat Jiwa Kelompok",
    rarity: TitleRarity.EPIC,
    category: "Archetype Harmonizer",
    icon: "🌿",
    description: "Skor Empati ≥ 85% pada Game 1 Incubation.",
    unlockType: "TIER",
    requiredPoints: 180,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-041",
    title: "Penakluk 6 Lantai",
    rarity: TitleRarity.EPIC,
    category: "Eksplorasi Lantai",
    icon: "🏰",
    description: "Mengumpulkan stempel penuh dari Lantai 1 s/d 6.",
    unlockType: "POINTS",
    requiredPoints: 200,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-042",
    title: "Master Moderasi Aswaja",
    rarity: TitleRarity.EPIC,
    category: "Aswaja & Nilai",
    icon: "📖",
    description: "Skor 100% pada Corner Nilai Aswaja & Kebangsaan.",
    unlockType: "POINTS",
    requiredPoints: 210,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-043",
    title: "Duta Integritas Kampus",
    rarity: TitleRarity.EPIC,
    category: "Integritas",
    icon: "⚖️",
    description: "Menyelesaikan seluruh kuis etika & anti-korupsi.",
    unlockType: "POINTS",
    requiredPoints: 220,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-044",
    title: "Pakar Prompt AI Perdana",
    rarity: TitleRarity.EPIC,
    category: "AI & Teknologi",
    icon: "🧠",
    description: "Memecahkan teka-teki AI Hub dengan skor tertinggi.",
    unlockType: "POINTS",
    requiredPoints: 230,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-045",
    title: "Kurator Visual Ekspresif",
    rarity: TitleRarity.EPIC,
    category: "AI Canvas Drawing",
    icon: "🎨",
    description: "Menghasilkan gambar dengan interpretasi filosofis AI.",
    unlockType: "POINTS",
    requiredPoints: 240,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-046",
    title: "Maestro Warna Kontemporer",
    rarity: TitleRarity.EPIC,
    category: "AI Canvas Drawing",
    icon: "🌈",
    description: "Mendapatkan apresiasi 'High Aesthetic' dari AI Curator.",
    unlockType: "POINTS",
    requiredPoints: 250,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-047",
    title: "Kapten Barisan Tangguh",
    rarity: TitleRarity.EPIC,
    category: "Leadership",
    icon: "🚩",
    description: "Memimpin tim meraih kemenangan pada mini-game beregu.",
    unlockType: "POINTS",
    requiredPoints: 260,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-048",
    title: "Diplomat Solutif Konflik",
    rarity: TitleRarity.EPIC,
    category: "Solidaritas",
    icon: "🕊️",
    description: "Memilih solusi win-win di seluruh simulasi musyawarah.",
    unlockType: "POINTS",
    requiredPoints: 270,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-049",
    title: "Ahli Strategi Studi 4 Tahun",
    rarity: TitleRarity.EPIC,
    category: "Akademik",
    icon: "📊",
    description: "Menyusun roadmap studi komprehensif tanpa celah.",
    unlockType: "POINTS",
    requiredPoints: 280,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-050",
    title: "Navigator Perpustakaan Modern",
    rarity: TitleRarity.EPIC,
    category: "Literasi",
    icon: "🧭",
    description: "Menemukan 5 referensi tersembunyi di Digital Library.",
    unlockType: "POINTS",
    requiredPoints: 290,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-051",
    title: "Inovator Solusi Masa Depan",
    rarity: TitleRarity.EPIC,
    category: "Inovasi",
    icon: "🔮",
    description: "Memberikan gagasan proyek sosial terbaik di kelompok.",
    unlockType: "POINTS",
    requiredPoints: 300,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-052",
    title: "Penggerak Solidaritas Angkatan",
    rarity: TitleRarity.EPIC,
    category: "Sosial",
    icon: "👥",
    description: "Mengumpulkan tanda tangan digital dari 20 rekan.",
    unlockType: "POINTS",
    requiredPoints: 310,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-053",
    title: "Peneliti Muda Berbakat",
    rarity: TitleRarity.EPIC,
    category: "Riset & Lab",
    icon: "🧪",
    description: "Menyelesaikan simulasi eksperimen lab sains Lantai 6.",
    unlockType: "POINTS",
    requiredPoints: 320,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-054",
    title: "Juara Kuis Kilat Orientasi",
    rarity: TitleRarity.EPIC,
    category: "Kecepatan & Akurasi",
    icon: "🎯",
    description: "Menjawab 10 pertanyaan berturut-turut benar.",
    unlockType: "POINTS",
    requiredPoints: 330,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-055",
    title: "Penjaga Nilai Tawazun",
    rarity: TitleRarity.EPIC,
    category: "Aswaja & Nilai",
    icon: "⚖️",
    description: "Menyeimbangkan nilai akademik dan organisasi di game.",
    unlockType: "POINTS",
    requiredPoints: 340,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-056",
    title: "Maestro Analisis Algoritma",
    rarity: TitleRarity.EPIC,
    category: "Logika",
    icon: "💻",
    description: "Menyelesaikan teka-teki logika kode tanpa petunjuk.",
    unlockType: "POINTS",
    requiredPoints: 350,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-057",
    title: "Pelukis Konsep Futuristik",
    rarity: TitleRarity.EPIC,
    category: "AI Canvas Drawing",
    icon: "🌌",
    description: "Menggambar visi kampus 2050 yang disetujui AI Curator.",
    unlockType: "POINTS",
    requiredPoints: 360,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-058",
    title: "Penakluk Labirin Gedung",
    rarity: TitleRarity.EPIC,
    category: "Eksplorasi",
    icon: "🗺️",
    description: "Menyelesaikan rute 9 lantai tanpa salah urutan pos.",
    unlockType: "POINTS",
    requiredPoints: 370,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-059",
    title: "Duta Sehat & Bugar",
    rarity: TitleRarity.EPIC,
    category: "Kesehatan",
    icon: "🏃",
    description: "Menuntaskan seluruh pos kebugaran fisik kampus.",
    unlockType: "POINTS",
    requiredPoints: 380,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-060",
    title: "Pemberdaya Ruang Kolaboratif",
    rarity: TitleRarity.EPIC,
    category: "Kolaborasi",
    icon: "💡",
    description: "Menjadi fasilitator forum diskusi meja bundar Lantai 3.",
    unlockType: "POINTS",
    requiredPoints: 390,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-061",
    title: "Kolektor 10 Stempel Emas",
    rarity: TitleRarity.EPIC,
    category: "Stempel Paspor",
    icon: "✨",
    description: "Mengumpulkan 10 stempel pos dengan nilai sempurna.",
    unlockType: "POINTS",
    requiredPoints: 400,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-062",
    title: "Pembicara Publik Karismatik",
    rarity: TitleRarity.EPIC,
    category: "Komunikasi",
    icon: "🎙️",
    description: "Menyampaikan orasi ide di hadapan kelompok.",
    unlockType: "POINTS",
    requiredPoints: 410,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-063",
    title: "Sintesis Seni & Teknologi",
    rarity: TitleRarity.EPIC,
    category: "Kreativitas",
    icon: "🎭",
    description: "Menggabungkan elemen data & estetika pada proyek.",
    unlockType: "POINTS",
    requiredPoints: 420,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-064",
    title: "Pengawal Budaya Ramah",
    rarity: TitleRarity.EPIC,
    category: "Karakter",
    icon: "🌺",
    description: "Meraih predikat 'Most Friendly Peer' dari voter teman.",
    unlockType: "POINTS",
    requiredPoints: 430,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-065",
    title: "Penyelesai Kasus Kompleks",
    rarity: TitleRarity.EPIC,
    category: "Problem Solving",
    icon: "🧩",
    description: "Memecahkan studi kasus krisis kepanitiaan Day 1.",
    unlockType: "POINTS",
    requiredPoints: 440,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-066",
    title: "Ahli Taktik Manajemen Waktu",
    rarity: TitleRarity.EPIC,
    category: "Manajemen",
    icon: "⏳",
    description: "Menyelesaikan semua pos 30 menit sebelum batas waktu.",
    unlockType: "POINTS",
    requiredPoints: 450,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-067",
    title: "Pelopor Inisiatif Hijau",
    rarity: TitleRarity.EPIC,
    category: "Keberlanjutan",
    icon: "🌿",
    description: "Menuntaskan modul sustainability & zero-waste kampus.",
    unlockType: "POINTS",
    requiredPoints: 460,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-068",
    title: "Koreografer Gerak Bersama",
    rarity: TitleRarity.EPIC,
    category: "Kekompakan",
    icon: "💃",
    description: "Membimbing koreografi yel-yel angkatan.",
    unlockType: "POINTS",
    requiredPoints: 470,
    requiredTier: CharacterTier.ADVANCED,
  },
  {
    id: "TTL-069",
    title: "Penghubung Lintas Disiplin",
    rarity: TitleRarity.EPIC,
    category: "Kolaborasi",
    icon: "🌐",
    description: "Membentuk tim mini yang terdiri atas 4 prodi berbeda.",
    unlockType: "POINTS",
    requiredPoints: 480,
    requiredTier: CharacterTier.ADVANCED,
  },

  // ==========================================
  // 🟨 BAGIAN 3: SUPER RARE (SR) — 20 Gelar (TTL-070 s/d TTL-089)
  // ==========================================
  {
    id: "TTL-070",
    title: "Grandmaster Strategi UNU",
    rarity: TitleRarity.SR,
    category: "Archetype Strategist",
    icon: "🏛️",
    description: "Murni Archetype The Strategist dengan Skor ≥ 95%.",
    unlockType: "TIER",
    requiredPoints: 500,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-071",
    title: "Inovator Radikal Kampus",
    rarity: TitleRarity.SR,
    category: "Archetype Innovator",
    icon: "⚡",
    description: "Murni Archetype The Innovator dengan Skor ≥ 95%.",
    unlockType: "TIER",
    requiredPoints: 500,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-072",
    title: "Orator Karismatik 2026",
    rarity: TitleRarity.SR,
    category: "Archetype Mobilizer",
    icon: "🛡️",
    description: "Murni Archetype The Mobilizer dengan Skor ≥ 95%.",
    unlockType: "TIER",
    requiredPoints: 500,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-073",
    title: "Empathetic Vanguard",
    rarity: TitleRarity.SR,
    category: "Archetype Harmonizer",
    icon: "🌿",
    description: "Murni Archetype The Harmonizer dengan Skor ≥ 95%.",
    unlockType: "TIER",
    requiredPoints: 500,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-074",
    title: "Pelukis Surealis Avant-Garde",
    rarity: TitleRarity.SR,
    category: "AI Canvas Drawing",
    icon: "🎨",
    description: "Meraih skor 95+ dari AI Curator dengan julukan seni tinggi.",
    unlockType: "POINTS",
    requiredPoints: 510,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-075",
    title: "Master of Quantum Canvas",
    rarity: TitleRarity.SR,
    category: "AI Canvas Drawing",
    icon: "🌌",
    description: "Gambar AI dinilai memiliki kedalaman metafora tingkat dewa.",
    unlockType: "POINTS",
    requiredPoints: 520,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-076",
    title: "Penakluk 9 Cakrawala Lantai",
    rarity: TitleRarity.SR,
    category: "Eksplorasi 9 Lantai",
    icon: "🏰",
    description: "Menuntaskan seluruh stempel dari Lantai 1 hingga Lantai 9.",
    unlockType: "POINTS",
    requiredPoints: 530,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-077",
    title: "Duta Utama Aswaja An-Nahdliyyah",
    rarity: TitleRarity.SR,
    category: "Aswaja & Nilai",
    icon: "🕌",
    description: "Penguasaan mutlak 4 pilar Aswaja (Tawassuth, I'tidal, Tasamuh, Tawazun).",
    unlockType: "POINTS",
    requiredPoints: 540,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-078",
    title: "Mastermind Riset & Laboratorium",
    rarity: TitleRarity.SR,
    category: "Sains & AI",
    icon: "🔬",
    description: "Menuntaskan seluruh challenge Lab Lantai 6 & AI Hub Lantai 7.",
    unlockType: "POINTS",
    requiredPoints: 550,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-079",
    title: "Benteng Integritas & Anti-Kekerasan",
    rarity: TitleRarity.SR,
    category: "Etika & Moral",
    icon: "🛡️",
    description: "Meraih nilai 100% pada semua simulasi etika, anti-bullying & PPKS.",
    unlockType: "POINTS",
    requiredPoints: 560,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-080",
    title: "Kolektor 18 Stempel Paripurna",
    rarity: TitleRarity.SR,
    category: "Stempel Paspor",
    icon: "🎫",
    description: "Menyelesaikan seluruh 18 Corner tanpa ada yang terlewat.",
    unlockType: "POINTS",
    requiredPoints: 570,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-081",
    title: "Jenderal Barisan Mahasiswa",
    rarity: TitleRarity.SR,
    category: "Leadership",
    icon: "🎖️",
    description: "Membawa kelompok meraih predikat 'Best Team Performance'.",
    unlockType: "POINTS",
    requiredPoints: 580,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-082",
    title: "Pakar Arsitektur Solusi Masa Depan",
    rarity: TitleRarity.SR,
    category: "Inovasi Terapan",
    icon: "📐",
    description: "Memenangkan sesi pitching solusi tantangan masa depan.",
    unlockType: "POINTS",
    requiredPoints: 590,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-083",
    title: "Top 5 Leaderboard Speedrunner",
    rarity: TitleRarity.SR,
    category: "Kecepatan",
    icon: "⚡",
    description: "Bertengger di jajaran 5 besar waktu penyelesaian tercepat.",
    unlockType: "POINTS",
    requiredPoints: 600,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-084",
    title: "Penyelaras Harmoni Nusantara",
    rarity: TitleRarity.SR,
    category: "Sosial & Budaya",
    icon: "🌏",
    description: "Mempersatukan kolaborasi antar-mahasiswa lintas provinsi.",
    unlockType: "POINTS",
    requiredPoints: 610,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-085",
    title: "Sang Filsuf Muda Kampus",
    rarity: TitleRarity.SR,
    category: "Intelektualitas",
    icon: "🦉",
    description: "Menjawab seluruh pertanyaan kritik logika Senior Mentor AI.",
    unlockType: "POINTS",
    requiredPoints: 620,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-086",
    title: "Maestro Diplomasi Meja Bundar",
    rarity: TitleRarity.SR,
    category: "Negosiasi",
    icon: "🤝",
    description: "Memenangkan sesi simulasi sidang umum orientasi.",
    unlockType: "POINTS",
    requiredPoints: 630,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-087",
    title: "Visioner Sains Berkelanjutan",
    rarity: TitleRarity.SR,
    category: "Keberlanjutan",
    icon: "🌱",
    description: "Merancang konsep kampus hijau dengan rating tertinggi.",
    unlockType: "POINTS",
    requiredPoints: 640,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-088",
    title: "Ksatria Pelindung Kebajikan",
    rarity: TitleRarity.SR,
    category: "Akhlak",
    icon: "⚔️",
    description: "Mengumpulkan poin respect/kebaikan tertinggi di angkatan.",
    unlockType: "POINTS",
    requiredPoints: 650,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-089",
    title: "Pionir Transformasi Digital",
    rarity: TitleRarity.SR,
    category: "Teknologi",
    icon: "🚀",
    description: "Memanfaatkan seluruh fitur aplikasi orientasi tanpa eror.",
    unlockType: "POINTS",
    requiredPoints: 660,
    requiredTier: CharacterTier.MASTER,
  },

  // ==========================================
  // 🌈 BAGIAN 4: SPECIALLY SUPER RARE (SSR) — 10 Gelar (TTL-090 s/d TTL-099)
  // ==========================================
  {
    id: "TTL-090",
    title: "👑 The Living Legend of 9 Floors",
    rarity: TitleRarity.SSR,
    category: "Legenda Eksplorasi",
    icon: "👑",
    description: "Menyelesaikan seluruh 18 Corner 9 Lantai dengan skor 100% tanpa salah.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-091",
    title: "⚡ Speedrunner Dewa Orientasi 2026",
    rarity: TitleRarity.SSR,
    category: "Rekor Kecepatan",
    icon: "⚡",
    description: "Peringkat #1 Tercepat menyelesaikan seluruh misi orientasi di Leaderboard.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-092",
    title: "🏛️ Sang Arsitek Peradaban Kampus",
    rarity: TitleRarity.SSR,
    category: "Puncak Strategist",
    icon: "🏛️",
    description: "Meraih Skor Sempurna (100%) Logika & Blueprint Studi 4 Tahun Terpilih.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-093",
    title: "💡 Mahapatih Inovasi Avant-Garde",
    rarity: TitleRarity.SSR,
    category: "Puncak Innovator",
    icon: "💡",
    description: "Menciptakan ide terobosan terkreatif yang dipilih oleh dewan juri.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-094",
    title: "🛡️ Panglima Tertinggi Revolusi Cendekia",
    rarity: TitleRarity.SSR,
    category: "Puncak Mobilizer",
    icon: "🛡️",
    description: "Memimpin seluruh angkatan dalam ikrar mahasiswa baru di Lantai 9.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-095",
    title: "🌿 Sang Rahmat Lil 'Alamin Muda",
    rarity: TitleRarity.SSR,
    category: "Puncak Harmonizer",
    icon: "🌿",
    description: "Meraih predikat keteladanan akhlak, empati, dan moderasi tertinggi.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-096",
    title: "🎨 Maestro Legenda Kanvas Emas",
    rarity: TitleRarity.SSR,
    category: "Puncak Seni AI",
    icon: "🎨",
    description: "Meraih pujian 'Masterpiece Abadi' dari Senior Art Curator AI.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-097",
    title: "⭐ Bintang Kejora UNU 2026",
    rarity: TitleRarity.SSR,
    category: "Prestasi Akademik",
    icon: "⭐",
    description: "Memperoleh akumulasi poin kuis & tantangan tertinggi seluruh angkatan.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-098",
    title: "🌟 Duta Utama 'Upgraded You' 2026",
    rarity: TitleRarity.SSR,
    category: "Transformasi Total",
    icon: "🌟",
    description: "Menyelesaikan seluruh evolusi Level 1 → Level 5 dengan stempel emas.",
    unlockType: "SPECIAL",
    requiredPoints: 700,
    requiredTier: CharacterTier.MASTER,
  },
  {
    id: "TTL-099",
    title: "🏆 The Sovereign Genius of 2026",
    rarity: TitleRarity.SSR,
    category: "MVP Orientasi",
    icon: "🏆",
    description: "GELAR TERTINGGI KAMPUS: Meraih predikat Mahasiswa Terbaik Orientasi 2026.",
    unlockType: "SPECIAL",
    requiredPoints: 750,
    requiredTier: CharacterTier.MASTER,
  },
];

export const DEFAULT_CHARACTER_TITLES = TITLE_CATALOG.map((t) => ({
  title: t.title,
  category: t.category,
  icon: t.icon,
  rarity: t.rarity,
}));

export const PRESET_AVATARS = [
  { id: "avatar_1", name: "Cyber Adventurer M", gender: Gender.MALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberAdv1&backgroundColor=0284c7" },
  { id: "avatar_2", name: "Cyber Adventurer F", gender: Gender.FEMALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberAdv2&backgroundColor=0284c7" },
  { id: "avatar_3", name: "Tech Sorcerer M", gender: Gender.MALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=TechSorc1&backgroundColor=7e22ce" },
  { id: "avatar_4", name: "Tech Sorceress F", gender: Gender.FEMALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=TechSorc2&backgroundColor=7e22ce" },
  { id: "avatar_5", name: "Code Ranger M", gender: Gender.MALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeRang1&backgroundColor=15803d" },
  { id: "avatar_6", name: "Code Ranger F", gender: Gender.FEMALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeRang2&backgroundColor=15803d" },
  { id: "avatar_7", name: "Data Alchemist M", gender: Gender.MALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlch1&backgroundColor=a16207" },
  { id: "avatar_8", name: "Data Alchemist F", gender: Gender.FEMALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlch2&backgroundColor=a16207" },
  { id: "avatar_9", name: "Shadow Blade M", gender: Gender.MALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowBld1&backgroundColor=be123c" },
  { id: "avatar_10", name: "Shadow Blade F", gender: Gender.FEMALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowBld2&backgroundColor=be123c" },
  { id: "avatar_11", name: "Quantum Scholar M", gender: Gender.MALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantSch1&backgroundColor=4338ca" },
  { id: "avatar_12", name: "Quantum Scholar F", gender: Gender.FEMALE, url: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantSch2&backgroundColor=4338ca" },
];

// Helper functions for RPG Evolution
export function calculateCharacterTier(points: number): CharacterTier {
  if (points >= 500) return CharacterTier.MASTER;
  if (points >= 200) return CharacterTier.ADVANCED;
  return CharacterTier.BASIC;
}

export function getEvolutionForClassAndTier(
  characterClass: CharacterClass | string,
  tier: CharacterTier | number
): CharacterEvolutionStage {
  const c = (characterClass as CharacterClass) || CharacterClass.CYBER_KNIGHT;
  const t = (tier as CharacterTier) || CharacterTier.BASIC;
  const classInfo = RPG_CHARACTERS[c] || RPG_CHARACTERS[CharacterClass.CYBER_KNIGHT];
  return classInfo.evolutions[t] || classInfo.evolutions[CharacterTier.BASIC];
}

// ============================================================
// API Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserProfileUpdatePayload {
  fullName?: string;
  avatarUrl?: string | null;
  gender?: Gender | string;
  characterClass?: CharacterClass | string;
  characterTitle?: string;
  characterTier?: number;
  unlockedTitles?: string[];
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    gender?: Gender | string;
    characterClass?: CharacterClass | string;
    characterTitle?: string;
    characterTier?: number;
    unlockedTitles?: string[];
    avatarUrl?: string | null;
    teamId?: string;
    teamName?: string;
    teamCode?: string;
  };
}
