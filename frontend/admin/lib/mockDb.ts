/**
 * GENIUS UNU 2026 — Static Mock Database & In-Memory Store
 * Provides full realistic mock data for 9 Floors UNU Jogja Gamification RPG.
 * Allows the admin panel to run completely standalone without backend or external database.
 */

import { OFFICIAL_BUDDIES } from "./officialBuddies";

export interface MockLocation {
  id: string;
  floorNumber: number;
  name: string;
  code: string;
  qrCode: string;
  roomNumber: string;
  description: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'COMPLETED' | 'LOCKED';
  capacity: number;
  currentTeamsCount: number;
  maxTeamsCount: number;
  beaconId?: string;
  createdAt: string;
}

export interface MockTeam {
  id: string;
  teamId?: string;
  code: string;
  name: string;
  leaderName: string;
  leaderId?: string;
  buddyName?: string;
  buddyId?: string;
  currentFloor: number;
  currentLocationId?: string;
  totalScore: number;
  completedMissionsCount: number;
  memberCount: number;
  status: 'ACTIVE' | 'IDLE' | 'COMPLETED' | 'DISQUALIFIED';
  members: MockUser[];
  buddies?: Array<{
    userId: string;
    fullName: string;
    buddyRole: string;
  }>;
  assignedRouteId?: string;
  assignedRouteName?: string;
  createdAt: string;
}

export interface MockUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'BUDDY' | 'PARTICIPANT';
  status: 'ACTIVE' | 'INACTIVE';
  nim?: string;
  prodi?: string;
  faculty?: string;
  gender?: 'MALE' | 'FEMALE';
  characterClass?: 'CYBER_KNIGHT' | 'DATA_ALCHEMIST' | 'QUANTUM_MAGE' | 'SHADOW_SCOUT';
  characterTier?: number;
  characterTitle?: string;
  totalScore?: number;
  teamId?: string;
  teamName?: string;
  teamCode?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  buddyRole?: 'PRIMARY' | 'ASSISTANT';
  bonusSpent?: number;
  avatarUrl?: string;
  stamps?: Record<string, boolean>;
  completedBooths?: string[];
  avatar?: string;
  createdAt: string;
}

export interface MockMission {
  id: string;
  title: string;
  code: string;
  floorNumber: number;
  locationId: string;
  locationName: string;
  type: 'MAIN' | 'SIDE_QUEST' | 'MYSTERY_EGG';
  status: 'ACTIVE' | 'INACTIVE';
  points: number;
  durationMinutes: number;
  description: string;
  instructions: string;
  clues: string[];
  badgeReward?: string;
  requiredClass?: string;
  createdAt: string;
}

export interface MockStage {
  id: string;
  stageNumber: number;
  name: string;
  code: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startTime?: string;
  endTime?: string;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export interface MockRoute {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  floorSequence: number[];
  assignedTeamsCount: number;
  createdAt: string;
}

export interface MockQuestion {
  id: string;
  question: string;
  category: string;
  floorNumber: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  points: number;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  createdAt: string;
}

export interface MockGame {
  id: string;
  title: string;
  code: string;
  category: 'QUIZ' | 'PUZZLE' | 'MEMORY' | 'REACTION' | 'LOGIC' | 'WORD_GAME';
  floorNumber: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  durationSeconds: number;
  maxScore: number;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  description: string;
  rules: string[];
  createdAt: string;
}

export interface MockGameSession {
  id: string;
  gameId: string;
  gameTitle: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  floorNumber: number;
  locationName: string;
  status: 'PENDING' | 'READY' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  score: number;
  startedAt?: string;
  elapsedSeconds: number;
  buddyName: string;
}

export interface MockLedgerEntry {
  id: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  amount: number;
  type: 'MISSION_REWARD' | 'GAME_SCORE' | 'ADMIN_ADJUSTMENT' | 'PENALTY' | 'BONUS';
  reason: string;
  operator: string;
  createdAt: string;
}

export interface MockAuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  operator: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// Initial Static Data
export function createInitialMockData() {
  const locations: MockLocation[] = [
    { id: "loc-1", floorNumber: 1, name: "Lobby Utama & Galeri Sejarah UNU", code: "L1-A101", qrCode: "UNU-L1-LOBBY-01", roomNumber: "1.01", description: "Pusat orientasi, pameran visi kampus, dan pos karakter Aswaja.", status: "AVAILABLE", capacity: 150, currentTeamsCount: 2, maxTeamsCount: 4, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-2", floorNumber: 1, name: "Pos Muassis NU & Nilai Kebangsaan", code: "L1-A102", qrCode: "UNU-L1-ASWAJA-02", roomNumber: "1.04", description: "Pos eksplorasi tokoh pendiri NU dan peradaban Islam Nusantara.", status: "AVAILABLE", capacity: 60, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-3", floorNumber: 2, name: "Zona Integritas Anti-Korupsi", code: "L2-B201", qrCode: "UNU-L2-INTEGRITY-01", roomNumber: "2.02", description: "Simulasi etika kepemimpinan dan deklarasi pakta integritas mahasiswa.", status: "AVAILABLE", capacity: 80, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-4", floorNumber: 2, name: "Perpustakaan & Ruang Literasi Terpadu", code: "L2-B202", qrCode: "UNU-L2-LIBRARY-02", roomNumber: "2.08", description: "Pencarian petunjuk buku rahasia dan arsip karya ilmiah UNU Jogja.", status: "AVAILABLE", capacity: 100, currentTeamsCount: 2, maxTeamsCount: 3, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-5", floorNumber: 3, name: "Lab Komputer Cyber & Keamanan Digital", code: "L3-C301", qrCode: "UNU-L3-CYBER-01", roomNumber: "3.01", description: "Tantangan kode sandi etika siber dan literasi digital masa kini.", status: "OCCUPIED", capacity: 50, currentTeamsCount: 2, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-6", floorNumber: 3, name: "Smart Classroom 3A", code: "L3-C302", qrCode: "UNU-L3-SMART-02", roomNumber: "3.05", description: "Ruang interaktif game kolaborasi tim.", status: "AVAILABLE", capacity: 60, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-7", floorNumber: 4, name: "Laboratorium Sains & Bioteknologi", code: "L4-D401", qrCode: "UNU-L4-SCIENCE-01", roomNumber: "4.02", description: "Eksplorasi riset terapan, mikroskop digital, dan sains masa depan.", status: "AVAILABLE", capacity: 45, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-8", floorNumber: 4, name: "Innovation Hub & Robotika", code: "L4-D402", qrCode: "UNU-L4-ROBOT-02", roomNumber: "4.06", description: "Eksperimen prototyping teknologi dan IoT.", status: "AVAILABLE", capacity: 50, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-9", floorNumber: 5, name: "Business Incubator & Start-Up Studio", code: "L5-E501", qrCode: "UNU-L5-INCUBATOR-01", roomNumber: "5.01", description: "Pos ideasi bisnis kreatif santripreneur dan presentasi kilat.", status: "OCCUPIED", capacity: 70, currentTeamsCount: 2, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-10", floorNumber: 5, name: "Career Development Center (CDC)", code: "L5-E502", qrCode: "UNU-L5-CAREER-02", roomNumber: "5.04", description: "Pemetaan bakat, karir global, dan sertifikasi profesional.", status: "AVAILABLE", capacity: 50, currentTeamsCount: 0, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-11", floorNumber: 6, name: "Aula Organisasi & Forum Ormawa", code: "L6-F601", qrCode: "UNU-L6-ORMAWA-01", roomNumber: "6.02", description: "Ruang simulasi sidang musyawarah dan dinamika kepemimpinan mahasiswa.", status: "AVAILABLE", capacity: 120, currentTeamsCount: 1, maxTeamsCount: 3, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-12", floorNumber: 7, name: "International Corner & Language Hub", code: "L7-G701", qrCode: "UNU-L7-GLOBAL-01", roomNumber: "7.01", description: "Pos wawasan kerjasama internasional, beasiswa global, dan multi-bahasa.", status: "AVAILABLE", capacity: 80, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-13", floorNumber: 8, name: "Pusat Studi Islam Transformatif & Moderasi", code: "L8-H801", qrCode: "UNU-L8-MODERASI-01", roomNumber: "8.01", description: "Pos penguatan moderasi beragama, toleransi, dan dakwah digital ramah.", status: "AVAILABLE", capacity: 90, currentTeamsCount: 1, maxTeamsCount: 2, createdAt: "2026-09-01T08:00:00Z" },
    { id: "loc-14", floorNumber: 9, name: "Auditorium Utama & Upgraded You Arena", code: "L9-I901", qrCode: "UNU-L9-BOSS-01", roomNumber: "9.01", description: "Panggung megah penyelesaian misi puncak RPG dan penobatan gelar juara.", status: "AVAILABLE", capacity: 300, currentTeamsCount: 2, maxTeamsCount: 6, createdAt: "2026-09-01T08:00:00Z" },
  ];

  const users: MockUser[] = [
    {
      id: "usr-admin",
      username: "admin",
      fullName: "Super Admin GENIUS 2026",
      email: "admin@unu-jogja.ac.id",
      role: "ADMIN",
      status: "ACTIVE",
      avatarUrl: "/unu.png",
      createdAt: "2026-09-01T00:00:00Z",
    },
    // 50 Official Buddies (Game Masters)
    ...OFFICIAL_BUDDIES.map((b) => ({
      id: b.id,
      username: b.username,
      fullName: b.fullName,
      email: b.email,
      role: "BUDDY" as const,
      status: "ACTIVE" as const,
      avatarUrl: b.avatarUrl,
      assignedTeamId: b.teamId,
      assignedTeamName: b.teamName,
      teamId: b.teamId,
      teamName: b.teamName,
      buddyRole: b.buddyRole,
      prodi: b.prodi,
      faculty: b.faculty,
      gender: b.gender,
      bonusSpent: 0,
      createdAt: b.createdAt,
    })),
    // Representative Participants
    { id: "usr-p1", username: "260100101", fullName: "Ahmad Fauzi Ridwan", email: "fauzi.26@mhs.unu-jogja.ac.id", nim: "260100101", prodi: "Informatika", faculty: "Fakultas Teknologi Informasi", gender: "MALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cowok-avatar.png", characterClass: "CYBER_KNIGHT", characterTier: 2, characterTitle: "Cyber Adept", totalScore: 980, teamId: "team-1", teamName: "Genius 01", teamCode: "GENIUS-01", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p2", username: "260100102", fullName: "Siti Nur Azizah", email: "azizah.26@mhs.unu-jogja.ac.id", nim: "260100102", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cewek-avatar.png", characterClass: "DATA_ALCHEMIST", characterTier: 2, characterTitle: "Bio Alchemist", totalScore: 920, teamId: "team-2", teamName: "Genius 02", teamCode: "GENIUS-02", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p3", username: "260100103", fullName: "Dewi Ayu Larasati", email: "dewi.26@mhs.unu-jogja.ac.id", nim: "260100103", prodi: "Teknik Elektro", faculty: "Fakultas Teknologi Informasi", gender: "FEMALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cewek-avatar.png", characterClass: "QUANTUM_MAGE", characterTier: 3, characterTitle: "Arcane Master", totalScore: 1120, teamId: "team-3", teamName: "Genius 03", teamCode: "GENIUS-03", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p4", username: "260100104", fullName: "M. Rizqi Pratama", email: "rizqi.26@mhs.unu-jogja.ac.id", nim: "260100104", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cowok-avatar.png", characterClass: "SHADOW_SCOUT", characterTier: 1, characterTitle: "Apprentice Scout", totalScore: 780, teamId: "team-4", teamName: "Genius 04", teamCode: "GENIUS-04", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p5", username: "260100105", fullName: "Annisa Maharani", email: "annisa.26@mhs.unu-jogja.ac.id", nim: "260100105", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cewek-avatar.png", characterClass: "DATA_ALCHEMIST", characterTier: 2, characterTitle: "Data Artisan", totalScore: 840, teamId: "team-1", teamName: "Genius 01", teamCode: "GENIUS-01", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p6", username: "260100106", fullName: "Budi Santoso", email: "budi.26@mhs.unu-jogja.ac.id", nim: "260100106", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "MALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cowok-avatar.png", characterClass: "CYBER_KNIGHT", characterTier: 1, characterTitle: "Guardian Cadet", totalScore: 710, teamId: "team-2", teamName: "Genius 02", teamCode: "GENIUS-02", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p7", username: "260100107", fullName: "Fajar Hidayatullah", email: "fajar.26@mhs.unu-jogja.ac.id", nim: "260100107", prodi: "Teknologi Hasil Pertanian", faculty: "Fakultas Bioindustri", gender: "MALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cowok-avatar.png", characterClass: "SHADOW_SCOUT", characterTier: 2, characterTitle: "Ranger Pathfinder", totalScore: 890, teamId: "team-3", teamName: "Genius 03", teamCode: "GENIUS-03", createdAt: "2026-09-01T06:00:00Z" },
    { id: "usr-p8", username: "260100108", fullName: "Zahra Salsabila", email: "zahra.26@mhs.unu-jogja.ac.id", nim: "260100108", prodi: "Farmasi", faculty: "Fakultas Ilmu Kesehatan", gender: "FEMALE", role: "PARTICIPANT", status: "ACTIVE", avatarUrl: "/character-cewek-avatar.png", characterClass: "QUANTUM_MAGE", characterTier: 1, characterTitle: "Novice Elementalist", totalScore: 760, teamId: "team-4", teamName: "Genius 04", teamCode: "GENIUS-04", createdAt: "2026-09-01T06:00:00Z" },
  ];

  const routePresets = [
    { id: "route-1", name: "Rute Hijau Aswaja (L1-L3-L5-L7-L9)" },
    { id: "route-2", name: "Rute Emas Integritas (L2-L4-L6-L8-L9)" },
    { id: "route-3", name: "Rute Biru Sains & Inovasi (L4-L5-L3-L1-L9)" },
    { id: "route-4", name: "Rute Merah Kepemimpinan Global (L6-L7-L8-L2-L9)" },
  ];

  const teams: MockTeam[] = OFFICIAL_BUDDIES.map((b, idx) => {
    const currentFloor = ((b.num - 1) % 8) + 1;
    const routeIndex = (b.num - 1) % 4;
    const assignedRoute = routePresets[routeIndex];
    const baseScore = 2850 - (idx * 16) + ((idx % 3) * 20);

    return {
      id: b.teamId,
      teamId: b.teamId,
      code: b.teamCode,
      name: b.teamName,
      leaderName: `Ketua ${b.teamName}`,
      buddyName: b.fullName,
      buddyId: b.id,
      currentFloor,
      currentLocationId: `loc-${currentFloor}`,
      totalScore: Math.max(1850, baseScore),
      completedMissionsCount: Math.max(3, 8 - (idx % 4)),
      memberCount: 12 + (idx % 3),
      status: "ACTIVE",
      assignedRouteId: assignedRoute.id,
      assignedRouteName: assignedRoute.name,
      buddies: [
        {
          userId: b.id,
          fullName: b.fullName,
          buddyRole: "PRIMARY",
        },
      ],
      members: users.filter((u) => u.teamId === b.teamId),
      createdAt: "2026-09-01T06:00:00Z",
    };
  });

  const stages: MockStage[] = [
    {
      id: "stg-1",
      stageNumber: 1,
      name: "Stage 1: The Induction — Eksplorasi 9 Lantai & Mini Games",
      code: "INDUCTION-2026",
      description: "Tahap awal orientasi kampus UNU Jogja: Tim menjelajahi 9 lantai bersama Buddy GM, memindai QR, dan memecahkan tantangan pos.",
      status: "ACTIVE",
      startTime: "2026-09-02T07:30:00Z",
      totalTasks: 9,
      completedTasks: 6,
      createdAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "stg-2",
      stageNumber: 2,
      name: "Stage 2: The Collaboration — Inter-Team Syndicate Battle",
      code: "SYNDICATE-BATTLE",
      description: "Pertarungan kooperatif antar-kelompok di lantai 5 dan 6 untuk menyelesaikan studi kasus kebangsaan dan proyek inovasi.",
      status: "UPCOMING",
      totalTasks: 6,
      completedTasks: 0,
      createdAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "stg-3",
      stageNumber: 3,
      name: "Stage 3: The Ascension — Upgraded You & Inaugurasi",
      code: "FINAL-ASCENSION",
      description: "Puncak inaugurasi di Auditorium Lantai 9: Boss Quiz Show, pengukuhan gelar mahasiswa, dan penyerahan piala rektor.",
      status: "UPCOMING",
      totalTasks: 3,
      completedTasks: 0,
      createdAt: "2026-09-01T00:00:00Z",
    },
  ];

  const missions: MockMission[] = [
    { id: "mis-1", title: "Menelusuri Jejak Sejarah & Muassis NU", code: "MS-L1-01", floorNumber: 1, locationId: "loc-1", locationName: "Lobby Utama & Galeri Sejarah UNU", type: "MAIN", status: "ACTIVE", points: 200, durationMinutes: 15, description: "Cari 3 pilar peradaban Islam Nusantara pada display interaktif galeri UNU.", instructions: "Scan QR di samping lukisan KH. Hasyim Asy'ari dan jawab kuis validasi.", clues: ["Perhatikan panel sejarah tahun 1926 di sebelah timur lobby."], badgeReward: "Aswaja Guardian", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-2", title: "Sumpah Integritas & Zona Anti Korupsi", code: "MS-L2-01", floorNumber: 2, locationId: "loc-3", locationName: "Zona Integritas Anti-Korupsi", type: "MAIN", status: "ACTIVE", points: 250, durationMinutes: 20, description: "Selesaikan studi kasus etika dan tandatangani komitmen moral anti-kecurangan.", instructions: "Scan QR di meja komisi integritas Lantai 2.", clues: ["Cari dinding komitmen berlogo perisai emas."], badgeReward: "Integrity Shield", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-3", title: "Cyber Codebreaker: Etika & Literasi Digital", code: "MS-L3-01", floorNumber: 3, locationId: "loc-5", locationName: "Lab Komputer Cyber & Keamanan Digital", type: "MAIN", status: "ACTIVE", points: 300, durationMinutes: 25, description: "Dekripsi teka-teki logika algoritma keamanan informasi dan cek fakta digital.", instructions: "Masukkan kode rahasia yang tersembunyi pada terminal komputer lab 3.", clues: ["Angka biner pada monitor 07 mewakili huruf awal nama rektor."], badgeReward: "Cyber Cipher", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-4", title: "Eksperimen Biosains & Inovasi Masa Depan", code: "MS-L4-01", floorNumber: 4, locationId: "loc-7", locationName: "Laboratorium Sains & Bioteknologi", type: "MAIN", status: "ACTIVE", points: 300, durationMinutes: 20, description: "Identifikasi sampel mikroorganisme terbarukan di laboratorium terapan.", instructions: "Scan QR dekat alat sentrifugasi digital Lantai 4.", clues: ["Tabung reaksi nomor 09 berwarna toska."], badgeReward: "Bio Alchemist", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-5", title: "Elevator Pitch Santripreneur 60 Detik", code: "MS-L5-01", floorNumber: 5, locationId: "loc-9", locationName: "Business Incubator & Start-Up Studio", type: "MAIN", status: "ACTIVE", points: 350, durationMinutes: 20, description: "Presentasikan solusi inovasi sosial di hadapan Buddy mentor inkubator.", instructions: "Simulasikan pitch ide startup kelompok Anda.", clues: ["Panggung mini dengan backdrop bertuliskan 'Create The Future'."], badgeReward: "Venture Pioneer", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-6", title: "Konsensus Sidang Musyawarah Ormawa", code: "MS-L6-01", floorNumber: 6, locationId: "loc-11", locationName: "Aula Organisasi & Forum Ormawa", type: "MAIN", status: "ACTIVE", points: 250, durationMinutes: 15, description: "Simulasi pengambilan keputusan mufakat berdasarkan asas demokrasi deliberatif.", instructions: "Scan QR di podium utama aula ormawa.", clues: ["Meja bundar nomor 01."], badgeReward: "Diplomat Crown", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-7", title: "Global Citizen Diplomatic Challenge", code: "MS-L7-01", floorNumber: 7, locationId: "loc-12", locationName: "International Corner & Language Hub", type: "MAIN", status: "ACTIVE", points: 250, durationMinutes: 15, description: "Jawab kuis diplomasi internasional dalam 3 bahasa asing.", instructions: "Scan QR peta dunia di Lantai 7.", clues: ["Bendera ASEAN di sisi barat lorong."], badgeReward: "Global Envoy", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-8", title: "Harmoni Dialog & Moderasi Beragama", code: "MS-L8-01", floorNumber: 8, locationId: "loc-13", locationName: "Pusat Studi Islam Transformatif & Moderasi", type: "MAIN", status: "ACTIVE", points: 300, durationMinutes: 20, description: "Refleksi konsep Islam Rahmatan lil 'Alamin dan kerukunan multikultural.", instructions: "Scan QR di pohon harapan toleransi.", clues: ["Kaligrafi ayat kebhinekaan dekat pintu masuk."], badgeReward: "Harmony Emissary", createdAt: "2026-09-01T08:00:00Z" },
    { id: "mis-9", title: "The Grand Finale: Upgraded You RPG Boss Stage", code: "MS-L9-01", floorNumber: 9, locationId: "loc-14", locationName: "Auditorium Utama & Upgraded You Arena", type: "MAIN", status: "ACTIVE", points: 500, durationMinutes: 30, description: "Pertarungan kuis akbar pamungkas untuk mengukuhkan status mahasiswa paripurna!", instructions: "Scan QR raksasa di layar panggung auditorium Lantai 9.", clues: ["Pusat podium kehormatan Rektorat."], badgeReward: "Ascended Scholar", createdAt: "2026-09-01T08:00:00Z" },
  ];

  const routes: MockRoute[] = [
    { id: "route-1", name: "Rute Hijau Aswaja (Ganjil Utama)", code: "ROUTE-GREEN", color: "#22c55e", description: "Perjalanan eksplorasi dimulai dari Lantai 1 -> 3 -> 5 -> 7 -> 9 -> 2 -> 4 -> 6 -> 8", floorSequence: [1, 3, 5, 7, 9, 2, 4, 6, 8], assignedTeamsCount: 4, createdAt: "2026-09-01T08:00:00Z" },
    { id: "route-2", name: "Rute Emas Integritas (Genap Utama)", code: "ROUTE-GOLD", color: "#f59e0b", description: "Perjalanan eksplorasi dimulai dari Lantai 2 -> 4 -> 6 -> 8 -> 1 -> 3 -> 5 -> 7 -> 9", floorSequence: [2, 4, 6, 8, 1, 3, 5, 7, 9], assignedTeamsCount: 4, createdAt: "2026-09-01T08:00:00Z" },
    { id: "route-3", name: "Rute Biru Sains & Inovasi", code: "ROUTE-BLUE", color: "#06b6d4", description: "Perjalanan terfokus riset & teknologi: Lantai 4 -> 5 -> 3 -> 1 -> 2 -> 6 -> 7 -> 8 -> 9", floorSequence: [4, 5, 3, 1, 2, 6, 7, 8, 9], assignedTeamsCount: 3, createdAt: "2026-09-01T08:00:00Z" },
    { id: "route-4", name: "Rute Merah Kepemimpinan Global", code: "ROUTE-RED", color: "#ef4444", description: "Perjalanan terfokus diplomasi & ormawa: Lantai 6 -> 7 -> 8 -> 1 -> 2 -> 3 -> 4 -> 5 -> 9", floorSequence: [6, 7, 8, 1, 2, 3, 4, 5, 9], assignedTeamsCount: 3, createdAt: "2026-09-01T08:00:00Z" },
  ];

  const questions: MockQuestion[] = [
    { id: "q-1", question: "Siapakah tokoh pendiri Nahdlatul Ulama yang mendirikan Pesantren Tebuireng Jombang?", category: "Aswaja & Ke-NU-an", floorNumber: 1, difficulty: "EASY", type: "MULTIPLE_CHOICE", options: [{ key: "A", text: "KH. Hasyim Asy'ari" }, { key: "B", text: "KH. Wahab Chasbullah" }, { key: "C", text: "KH. Bisri Syansuri" }, { key: "D", text: "KH. Ahmad Dahlan" }], correctAnswer: "A", explanation: "KH. Hasyim Asy'ari adalah pendiri NU sekaligus pengasuh Pesantren Tebuireng.", points: 50, status: "ACTIVE", createdAt: "2026-09-01T08:00:00Z" },
    { id: "q-2", question: "Berapa jumlah lantai gedung kampus terpadu UNU Yogyakarta?", category: "Profil Kampus", floorNumber: 1, difficulty: "EASY", type: "MULTIPLE_CHOICE", options: [{ key: "A", text: "7 Lantai" }, { key: "B", text: "9 Lantai" }, { key: "C", text: "11 Lantai" }, { key: "D", text: "12 Lantai" }], correctAnswer: "B", explanation: "Kampus Terpadu UNU Yogyakarta memiliki 9 lantai dengan fungsi tematik per lantai.", points: 50, status: "ACTIVE", createdAt: "2026-09-01T08:00:00Z" },
    { id: "q-3", question: "Nilai luhur apa yang menjadi pilar utama zona integritas Lantai 2?", category: "Integritas & Karakter", floorNumber: 2, difficulty: "MEDIUM", type: "MULTIPLE_CHOICE", options: [{ key: "A", text: "Kejujuran, Tanggung Jawab, dan Anti-Korupsi" }, { key: "B", text: "Kecepatan dan Pragmatisme" }, { key: "C", text: "Eksklusivisme Kelompok" }, { key: "D", text: "Kerahasiaan Tertutup" }], correctAnswer: "A", explanation: "Zona integritas menekankan transparansi, etika, kejujuran, dan komitmen anti-korupsi.", points: 60, status: "ACTIVE", createdAt: "2026-09-01T08:00:00Z" },
    { id: "q-4", question: "Apa peran utama konsep Islam 'Rahmatan lil Alamin' dalam moderasi beragama di era digital?", category: "Moderasi Beragama", floorNumber: 8, difficulty: "MEDIUM", type: "MULTIPLE_CHOICE", options: [{ key: "A", text: "Membawa kedamaian, kasih sayang, dan toleransi bagi seluruh alam" }, { key: "B", text: "Menolak seluruh bentuk teknologi" }, { key: "C", text: "Membatasi pergaulan sosial" }, { key: "D", text: "Hanya berinteraksi dengan kelompok seiman" }], correctAnswer: "A", explanation: "Islam Rahmatan lil Alamin bermakna membawa rahmat dan kemaslahatan bagi kemanusiaan.", points: 60, status: "ACTIVE", createdAt: "2026-09-01T08:00:00Z" },
  ];

  const games: MockGame[] = [
    { id: "game-1", title: "Aswaja Speed Quiz Arena", code: "GAME-QUIZ-01", category: "QUIZ", floorNumber: 1, difficulty: "EASY", durationSeconds: 120, maxScore: 200, status: "ACTIVE", description: "Jawab serangkaian soal cepat seputar sejarah dan nilai ke-NU-an.", rules: ["Tiap jawaban benar mendapat +20 poin", "Waktu 120 detik untuk 10 pertanyaan"], createdAt: "2026-09-01T08:00:00Z" },
    { id: "game-2", title: "Cyber Protocol Matrix Breaker", code: "GAME-LOGIC-02", category: "LOGIC", floorNumber: 3, difficulty: "MEDIUM", durationSeconds: 180, maxScore: 300, status: "ACTIVE", description: "Pecahkan susunan cipher pola digital bersama anggota tim.", rules: ["Kerjakan secara bergantian", "3 kali kesempatan mencoba"], createdAt: "2026-09-01T08:00:00Z" },
    { id: "game-3", title: "Memory Tile 9 Lantai UNU", code: "GAME-MEM-03", category: "MEMORY", floorNumber: 2, difficulty: "MEDIUM", durationSeconds: 90, maxScore: 250, status: "ACTIVE", description: "Cocokkan pasangan kartu foto fasilitas gedung 9 lantai UNU Jogja.", rules: ["Buka 2 kartu yang cocok secara berurutan"], createdAt: "2026-09-01T08:00:00Z" },
  ];

  const gameSessions: MockGameSession[] = [
    { id: "ses-1", gameId: "game-2", gameTitle: "Cyber Protocol Matrix Breaker", teamId: "team-1", teamName: "Genius 01", teamCode: "GENIUS-01", floorNumber: 3, locationName: "Lab Komputer Cyber", status: "ACTIVE", score: 280, startedAt: "2026-09-02T08:15:00Z", elapsedSeconds: 142, buddyName: "Agnes Anggraini Risdiyanto" },
    { id: "ses-2", gameId: "game-1", gameTitle: "Aswaja Speed Quiz Arena", teamId: "team-2", teamName: "Genius 02", teamCode: "GENIUS-02", floorNumber: 1, locationName: "Lobby Utama", status: "ACTIVE", score: 190, startedAt: "2026-09-02T08:18:00Z", elapsedSeconds: 84, buddyName: "Agnesya Putri Triyana" },
    { id: "ses-3", gameId: "game-3", gameTitle: "Memory Tile 9 Lantai UNU", teamId: "team-3", teamName: "Genius 03", teamCode: "GENIUS-03", floorNumber: 2, locationName: "Perpustakaan Terpadu", status: "READY", score: 0, elapsedSeconds: 0, buddyName: "Ahmad Fadlil Munajad" },
  ];

  const ledger: MockLedgerEntry[] = [
    { id: "led-1", teamId: "team-1", teamName: "Genius 01", teamCode: "GENIUS-01", amount: 200, type: "MISSION_REWARD", reason: "Selesai Misi L1: Jejak Sejarah NU", operator: "Agnes", createdAt: "2026-09-02T08:05:00Z" },
    { id: "led-2", teamId: "team-1", teamName: "Genius 01", teamCode: "GENIUS-01", amount: 300, type: "MISSION_REWARD", reason: "Selesai Misi L3: Cyber Codebreaker", operator: "Agnes", createdAt: "2026-09-02T08:25:00Z" },
    { id: "led-3", teamId: "team-2", teamName: "Genius 02", teamCode: "GENIUS-02", amount: 250, type: "MISSION_REWARD", reason: "Selesai Misi L2: Sumpah Integritas", operator: "Agnesya", createdAt: "2026-09-02T08:15:00Z" },
    { id: "led-4", teamId: "team-3", teamName: "Genius 03", teamCode: "GENIUS-03", amount: 50, type: "ADMIN_ADJUSTMENT", reason: "Bonus Yel-Yel Kreatif Terheboh Lantai 1", operator: "Super Admin", createdAt: "2026-09-02T08:30:00Z" },
  ];

  const auditLogs: MockAuditLog[] = [
    { id: "log-1", action: "STAGE_ACTIVATED", targetType: "STAGE", targetId: "stg-1", targetName: "Stage 1: The Induction", operator: "Super Admin", details: "Mengaktifkan Stage 1 untuk seluruh 50 tim petualang.", ipAddress: "127.0.0.1", createdAt: "2026-09-02T07:30:00Z" },
    { id: "log-2", action: "SCORE_ADJUSTED", targetType: "TEAM", targetId: "team-3", targetName: "Genius 03", operator: "Super Admin", details: "Menambahkan +50 poin bonus yel-yel kreatif.", ipAddress: "127.0.0.1", createdAt: "2026-09-02T08:30:00Z" },
    { id: "log-3", action: "LOCATION_STATUS_CHANGED", targetType: "LOCATION", targetId: "loc-5", targetName: "Lab Komputer Cyber", operator: "System Telemetry", details: "Status diubah menjadi OCCUPIED (2 tim sedang aktif).", ipAddress: "127.0.0.1", createdAt: "2026-09-02T08:15:00Z" },
  ];

  return {
    locations,
    users,
    teams,
    stages,
    missions,
    routes,
    questions,
    games,
    gameSessions,
    ledger,
    auditLogs,
  };
}

const DB_VERSION_KEY = "genius_mock_db_version";
const CURRENT_DB_VERSION = "2026-09-05-v6-50-official-buddies-guaranteed";

class MockDatabase {
  private data = createInitialMockData();

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    if (typeof window !== "undefined") {
      try {
        const storedVersion = localStorage.getItem(DB_VERSION_KEY);
        // Force flush outdated mock database if from older version
        if (storedVersion !== CURRENT_DB_VERSION) {
          localStorage.removeItem("genius_mock_db");
          localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
          this.data = createInitialMockData();
          this.save();
          return;
        }

        const stored = localStorage.getItem("genius_mock_db");
        if (stored) {
          const parsed = JSON.parse(stored);
          this.data = { ...this.data, ...parsed };
        }

        // Safety guarantee: ensure all 50 official buddies always exist in users array
        const currentBuddies = (this.data.users || []).filter((u) => u.role === "BUDDY");
        if (currentBuddies.length < 50) {
          const initialBuddies = createInitialMockData().users.filter((u) => u.role === "BUDDY");
          const nonBuddies = (this.data.users || []).filter((u) => u.role !== "BUDDY");
          this.data.users = [...initialBuddies, ...nonBuddies];
          this.save();
        }

        // Safety guarantee: ensure teams have at least 50 official teams
        if (!this.data.teams || this.data.teams.length < 50) {
          this.data.teams = createInitialMockData().teams;
          this.save();
        }
      } catch {
        this.data = createInitialMockData();
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("genius_mock_db", JSON.stringify(this.data));
      } catch {
        // ignore
      }
    }
  }

  // Stats / Dashboard Telemetry
  getStats() {
    const totalParticipants = this.data.users.filter((u) => u.role === "PARTICIPANT").length;
    const totalTeams = this.data.teams.length;
    const activeTeams = this.data.teams.filter((t) => t.status === "ACTIVE").length;
    const totalLocations = this.data.locations.length;
    const occupiedLocations = this.data.locations.filter((l) => l.status === "OCCUPIED").length;
    const totalMissions = this.data.missions.length;
    const activeSessions = this.data.gameSessions.filter((s) => s.status === "ACTIVE").length;
    const activeStage = this.data.stages.find((s) => s.status === "ACTIVE") || this.data.stages[0];

    const floorDistribution = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((floorNum) => {
      const teamsOnFloor = this.data.teams.filter((t) => t.currentFloor === floorNum).length;
      return {
        floor: floorNum,
        floorNumber: floorNum,
        floorName: `Lantai ${floorNum}`,
        teamsCount: teamsOnFloor,
        count: teamsOnFloor * 12 + 10,
      };
    });

    return {
      totalParticipants: totalParticipants > 10 ? totalParticipants : 624,
      activeParticipants: totalParticipants > 10 ? totalParticipants : 612,
      totalTeams: totalTeams || 50,
      activeTeams: activeTeams || 50,
      totalLocations,
      occupiedLocations,
      totalMissions,
      activeSessions,
      activeStage,
      floorDistribution,
      floorCompletions: floorDistribution,
      topBooths: [
        { boothId: "loc-1", boothName: "Lobby & Galeri Aswaja", completionsCount: 48, avgScore: 92 },
        { boothId: "loc-3", boothName: "Zona Integritas Anti-Korupsi", completionsCount: 46, avgScore: 88 },
        { boothId: "loc-5", boothName: "Cyber Codebreaker L3", completionsCount: 42, avgScore: 85 },
        { boothId: "loc-7", boothName: "Lab Sains & Bioteknologi", completionsCount: 39, avgScore: 89 },
        { boothId: "loc-9", boothName: "Start-Up Incubator L5", completionsCount: 35, avgScore: 94 },
      ],
      systemStatus: {
        server: "ONLINE",
        database: "MOCK_STANDALONE",
        latencyMs: 12,
        syncStatus: "SYNCHRONIZED",
      },
    };
  }

  // Floors & Locations
  getLocations(floorNumber?: number) {
    if (floorNumber && floorNumber > 0) {
      return this.data.locations.filter((l) => l.floorNumber === floorNumber);
    }
    return this.data.locations;
  }

  getLocation(id: string) {
    return this.data.locations.find((l) => l.id === id || l.code === id);
  }

  createLocation(payload: Partial<MockLocation>) {
    const loc: MockLocation = {
      id: `loc-${Date.now()}`,
      floorNumber: payload.floorNumber || 1,
      name: payload.name || "Titik Pos Baru",
      code: payload.code || `L${payload.floorNumber || 1}-POS-${Date.now().toString().slice(-3)}`,
      qrCode: payload.qrCode || `UNU-L${payload.floorNumber || 1}-${Date.now()}`,
      roomNumber: payload.roomNumber || "1.00",
      description: payload.description || "",
      status: payload.status || "AVAILABLE",
      capacity: payload.capacity || 50,
      currentTeamsCount: 0,
      maxTeamsCount: payload.maxTeamsCount || 2,
      createdAt: new Date().toISOString(),
    };
    this.data.locations.unshift(loc);
    this.save();
    return loc;
  }

  updateLocation(id: string, payload: Partial<MockLocation>) {
    const index = this.data.locations.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.data.locations[index] = { ...this.data.locations[index], ...payload };
      this.save();
      return this.data.locations[index];
    }
    return null;
  }

  deleteLocation(id: string) {
    this.data.locations = this.data.locations.filter((l) => l.id !== id);
    this.save();
    return true;
  }

  // Teams
  getTeams() {
    return this.data.teams.map((t) => {
      const assignedBuddies = this.data.users
        .filter((u) => u.role === "BUDDY" && (u.assignedTeamId === t.id || u.teamId === t.id))
        .map((b) => ({
          userId: b.id,
          fullName: b.fullName,
          buddyRole: b.buddyRole || "PRIMARY",
        }));

      const officialBuddy = OFFICIAL_BUDDIES.find((b) => b.teamId === t.id || b.teamName === t.name);
      const effectiveBuddyName = assignedBuddies[0]?.fullName || t.buddyName || officialBuddy?.fullName || "Buddy GM";
      const effectiveBuddies = assignedBuddies.length > 0
        ? assignedBuddies
        : officialBuddy
        ? [{ userId: officialBuddy.id, fullName: officialBuddy.fullName, buddyRole: officialBuddy.buddyRole || "PRIMARY" }]
        : (t.buddies || []);

      const members = this.data.users
        .filter((u) => u.teamId === t.id || u.assignedTeamId === t.id)
        .map((u) => ({ ...u, userId: u.id }));

      return {
        ...t,
        teamId: t.id,
        buddyName: effectiveBuddyName,
        buddies: effectiveBuddies,
        members,
        memberCount: t.memberCount || members.length || 12,
      };
    });
  }

  getTeam(id: string) {
    const team = this.data.teams.find((t) => t.id === id || t.teamId === id || t.code === id);
    if (!team) return null;
    const assignedBuddies = this.data.users
      .filter((u) => u.role === "BUDDY" && (u.assignedTeamId === team.id || u.teamId === team.id))
      .map((b) => ({
        userId: b.id,
        fullName: b.fullName,
        buddyRole: b.buddyRole || "PRIMARY",
      }));

    const officialBuddy = OFFICIAL_BUDDIES.find((b) => b.teamId === team.id || b.teamName === team.name);
    const effectiveBuddyName = assignedBuddies[0]?.fullName || team.buddyName || officialBuddy?.fullName || "Buddy GM";
    const effectiveBuddies = assignedBuddies.length > 0
      ? assignedBuddies
      : officialBuddy
      ? [{ userId: officialBuddy.id, fullName: officialBuddy.fullName, buddyRole: officialBuddy.buddyRole || "PRIMARY" }]
      : (team.buddies || []);

    const members = this.data.users
      .filter((u) => u.teamId === team.id || u.assignedTeamId === team.id)
      .map((u) => ({ ...u, userId: u.id }));

    return {
      ...team,
      teamId: team.id,
      buddyName: effectiveBuddyName,
      buddies: effectiveBuddies,
      members,
      memberCount: team.memberCount || members.length || 12,
    };
  }

  createTeam(payload: Partial<MockTeam>) {
    const team: MockTeam = {
      id: `team-${Date.now()}`,
      teamId: `team-${Date.now()}`,
      code: payload.code || `TIM-${Date.now().toString().slice(-3)}`,
      name: payload.name || "Tim Petualang Baru",
      leaderName: payload.leaderName || "Ketua Tim",
      leaderId: payload.leaderId,
      buddyName: payload.buddyName || "Buddy GM",
      buddyId: payload.buddyId,
      currentFloor: payload.currentFloor || 1,
      totalScore: payload.totalScore || 0,
      completedMissionsCount: 0,
      memberCount: 0,
      status: "ACTIVE",
      assignedRouteId: payload.assignedRouteId || "route-1",
      assignedRouteName: payload.assignedRouteName || "Rute Hijau Aswaja",
      members: [],
      createdAt: new Date().toISOString(),
    };
    this.data.teams.push(team);
    this.save();
    return team;
  }

  updateTeam(id: string, payload: Partial<MockTeam>) {
    const index = this.data.teams.findIndex((t) => t.id === id || t.teamId === id);
    if (index !== -1) {
      this.data.teams[index] = { ...this.data.teams[index], ...payload };
      this.save();
      return this.data.teams[index];
    }
    return null;
  }

  deleteTeam(id: string) {
    this.data.teams = this.data.teams.filter((t) => t.id !== id && t.teamId !== id);
    this.save();
    return true;
  }

  // Users & Participants
  getUsers(params?: { role?: string; search?: string; assignmentStatus?: string }) {
    let result = [...this.data.users];
    if (params?.role) {
      const targetRole = params.role.toUpperCase();
      result = result.filter((u) => u.role === targetRole);
    }
    if (params?.assignmentStatus === "assigned") {
      result = result.filter((u) => !!u.assignedTeamId || !!u.teamId);
    } else if (params?.assignmentStatus === "unassigned") {
      result = result.filter((u) => !u.assignedTeamId && !u.teamId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.nim && u.nim.toLowerCase().includes(q)) ||
          (u.prodi && u.prodi.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getBuddies() {
    const list = this.getUsers({ role: "BUDDY" });
    if (list.length >= 50) return list;
    // Guarantee returning all 50 official buddies
    return OFFICIAL_BUDDIES.map((b) => ({
      id: b.id,
      username: b.username,
      fullName: b.fullName,
      email: b.email,
      role: "BUDDY" as const,
      status: "ACTIVE" as const,
      avatarUrl: b.avatarUrl,
      assignedTeamId: b.teamId,
      assignedTeamName: b.teamName,
      teamId: b.teamId,
      teamName: b.teamName,
      buddyRole: b.buddyRole,
      prodi: b.prodi,
      faculty: b.faculty,
      gender: b.gender,
      bonusSpent: 0,
      createdAt: b.createdAt,
    }));
  }

  getBuddy(id: string) {
    const user = this.getUser(id);
    if (user && user.role === "BUDDY") return user;
    const match = OFFICIAL_BUDDIES.find((b) => b.id === id || b.username === id);
    if (match) {
      return {
        id: match.id,
        username: match.username,
        fullName: match.fullName,
        email: match.email,
        role: "BUDDY" as const,
        status: "ACTIVE" as const,
        avatarUrl: match.avatarUrl,
        assignedTeamId: match.teamId,
        assignedTeamName: match.teamName,
        teamId: match.teamId,
        teamName: match.teamName,
        buddyRole: match.buddyRole,
        prodi: match.prodi,
        faculty: match.faculty,
        gender: match.gender,
        bonusSpent: 0,
        createdAt: match.createdAt,
      };
    }
    return null;
  }

  getUser(id: string) {
    const found = this.data.users.find((u) => u.id === id || u.username === id || u.nim === id);
    if (found) return found;
    const match = OFFICIAL_BUDDIES.find((b) => b.id === id || b.username === id);
    if (match) {
      return {
        id: match.id,
        username: match.username,
        fullName: match.fullName,
        email: match.email,
        role: "BUDDY" as const,
        status: "ACTIVE" as const,
        avatarUrl: match.avatarUrl,
        assignedTeamId: match.teamId,
        assignedTeamName: match.teamName,
        teamId: match.teamId,
        teamName: match.teamName,
        buddyRole: match.buddyRole,
        prodi: match.prodi,
        faculty: match.faculty,
        gender: match.gender,
        bonusSpent: 0,
        createdAt: match.createdAt,
      };
    }
    return null;
  }

  createUser(payload: Partial<MockUser>) {
    const user: MockUser = {
      id: `usr-${Date.now()}`,
      username: payload.username || `user${Date.now().toString().slice(-4)}`,
      fullName: payload.fullName || "User Baru",
      email: payload.email || `${payload.username || "user"}@unu-jogja.ac.id`,
      role: payload.role || "PARTICIPANT",
      status: payload.status || "ACTIVE",
      nim: payload.nim,
      prodi: payload.prodi || "Informatika",
      faculty: payload.faculty || "Fakultas Teknologi Informasi",
      gender: payload.gender || "MALE",
      characterClass: payload.characterClass || "CYBER_KNIGHT",
      characterTier: payload.characterTier || 1,
      characterTitle: payload.characterTitle || "Novice Adventurer",
      totalScore: payload.totalScore || 0,
      teamId: payload.teamId,
      teamName: payload.teamName,
      teamCode: payload.teamCode,
      createdAt: new Date().toISOString(),
    };
    this.data.users.unshift(user);
    this.save();
    return user;
  }

  updateUser(id: string, payload: Partial<MockUser>) {
    const index = this.data.users.findIndex((u) => u.id === id || u.username === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...payload };
      this.save();
      return this.data.users[index];
    }
    return null;
  }

  deleteUser(id: string) {
    this.data.users = this.data.users.filter((u) => u.id !== id && u.username !== id);
    this.save();
    return true;
  }

  // Leaderboard
  getLeaderboard() {
    const teams = this.getTeams().sort((a, b) => b.totalScore - a.totalScore);
    const participants = this.data.users
      .filter((u) => u.role === "PARTICIPANT")
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    return {
      teams,
      teamLeaderboard: teams.map((t, idx) => ({
        ...t,
        rank: idx + 1,
        teamId: t.id,
        teamName: t.name,
        buddy: t.buddyName,
      })),
      participants,
      participantLeaderboard: participants.map((p, idx) => ({
        ...p,
        rank: idx + 1,
      })),
      recentTransactions: this.data.ledger,
      ledger: this.data.ledger,
      lastUpdated: new Date().toISOString(),
    };
  }

  adjustScore(payload: { teamId?: string; participantId?: string; amount: number; reason: string; operator?: string }) {
    const amount = Number(payload.amount) || 0;
    const operator = payload.operator || "Super Admin";

    if (payload.teamId) {
      const team = this.data.teams.find((t) => t.id === payload.teamId || t.teamId === payload.teamId);
      if (team) {
        team.totalScore = Math.max(0, (team.totalScore || 0) + amount);
        this.data.ledger.unshift({
          id: `led-${Date.now()}`,
          teamId: team.id,
          teamName: team.name,
          teamCode: team.code,
          amount,
          type: amount >= 0 ? "BONUS" : "PENALTY",
          reason: payload.reason || "Koreksi Skor Admin",
          operator,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (payload.participantId) {
      const user = this.data.users.find((u) => u.id === payload.participantId);
      if (user) {
        user.totalScore = Math.max(0, (user.totalScore || 0) + amount);
      }
    }

    this.save();
    return { success: true, message: "Skor berhasil disesuaikan." };
  }

  // Stages
  getStages() {
    return this.data.stages;
  }

  activateStage(id: string) {
    this.data.stages.forEach((s) => {
      s.status = s.id === id ? "ACTIVE" : "UPCOMING";
    });
    this.save();
    return this.data.stages.find((s) => s.id === id);
  }

  createStage(payload: Partial<MockStage>) {
    const stage: MockStage = {
      id: `stg-${Date.now()}`,
      stageNumber: payload.stageNumber || this.data.stages.length + 1,
      name: payload.name || "Tahap Baru",
      code: payload.code || `STAGE-${Date.now().toString().slice(-3)}`,
      description: payload.description || "",
      status: payload.status || "UPCOMING",
      totalTasks: payload.totalTasks || 5,
      completedTasks: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.stages.push(stage);
    this.save();
    return stage;
  }

  updateStage(id: string, payload: Partial<MockStage>) {
    const index = this.data.stages.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.data.stages[index] = { ...this.data.stages[index], ...payload };
      this.save();
      return this.data.stages[index];
    }
    return null;
  }

  // Missions
  getMissions() {
    return this.data.missions;
  }

  createMission(payload: Partial<MockMission>) {
    const mission: MockMission = {
      id: `mis-${Date.now()}`,
      title: payload.title || "Misi Baru",
      code: payload.code || `MS-${Date.now().toString().slice(-4)}`,
      floorNumber: payload.floorNumber || 1,
      locationId: payload.locationId || "loc-1",
      locationName: payload.locationName || "Lobby Utama",
      type: payload.type || "MAIN",
      status: payload.status || "ACTIVE",
      points: payload.points || 200,
      durationMinutes: payload.durationMinutes || 15,
      description: payload.description || "",
      instructions: payload.instructions || "",
      clues: payload.clues || [],
      badgeReward: payload.badgeReward,
      createdAt: new Date().toISOString(),
    };
    this.data.missions.unshift(mission);
    this.save();
    return mission;
  }

  updateMission(id: string, payload: Partial<MockMission>) {
    const index = this.data.missions.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.data.missions[index] = { ...this.data.missions[index], ...payload };
      this.save();
      return this.data.missions[index];
    }
    return null;
  }

  deleteMission(id: string) {
    this.data.missions = this.data.missions.filter((m) => m.id !== id);
    this.save();
    return true;
  }

  // Routes
  getRoutes() {
    return this.data.routes;
  }

  createRoute(payload: Partial<MockRoute>) {
    const route: MockRoute = {
      id: `route-${Date.now()}`,
      name: payload.name || "Rute Baru",
      code: payload.code || `ROUTE-${Date.now().toString().slice(-3)}`,
      color: payload.color || "#22c55e",
      description: payload.description || "",
      floorSequence: payload.floorSequence || [1, 2, 3, 4, 5, 6, 7, 8, 9],
      assignedTeamsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.routes.push(route);
    this.save();
    return route;
  }

  // Questions
  getQuestions() {
    return this.data.questions;
  }

  createQuestion(payload: Partial<MockQuestion>) {
    const question: MockQuestion = {
      id: `q-${Date.now()}`,
      question: payload.question || "Pertanyaan Baru",
      category: payload.category || "Aswaja & Ke-NU-an",
      floorNumber: payload.floorNumber || 1,
      difficulty: payload.difficulty || "MEDIUM",
      type: payload.type || "MULTIPLE_CHOICE",
      options: payload.options || [
        { key: "A", text: "Pilihan A" },
        { key: "B", text: "Pilihan B" },
        { key: "C", text: "Pilihan C" },
        { key: "D", text: "Pilihan D" },
      ],
      correctAnswer: payload.correctAnswer || "A",
      explanation: payload.explanation || "",
      points: payload.points || 50,
      status: payload.status || "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.data.questions.unshift(question);
    this.save();
    return question;
  }

  updateQuestion(id: string, payload: Partial<MockQuestion>) {
    const index = this.data.questions.findIndex((q) => q.id === id);
    if (index !== -1) {
      this.data.questions[index] = { ...this.data.questions[index], ...payload };
      this.save();
      return this.data.questions[index];
    }
    return null;
  }

  deleteQuestion(id: string) {
    this.data.questions = this.data.questions.filter((q) => q.id !== id);
    this.save();
    return true;
  }

  // Games & Game Sessions
  getGames() {
    return this.data.games;
  }

  getGameSessions() {
    return this.data.gameSessions;
  }

  startSession(id: string) {
    const session = this.data.gameSessions.find((s) => s.id === id);
    if (session) {
      session.status = "ACTIVE";
      session.startedAt = new Date().toISOString();
      this.save();
    }
    return session;
  }

  pauseSession(id: string) {
    const session = this.data.gameSessions.find((s) => s.id === id);
    if (session) {
      session.status = "PAUSED";
      this.save();
    }
    return session;
  }

  completeSession(id: string, score: number = 200) {
    const session = this.data.gameSessions.find((s) => s.id === id);
    if (session) {
      session.status = "COMPLETED";
      session.score = score;
      this.save();
    }
    return session;
  }

  cancelSession(id: string) {
    const session = this.data.gameSessions.find((s) => s.id === id);
    if (session) {
      session.status = "CANCELLED";
      this.save();
    }
    return session;
  }

  // Ledger & Audit
  getLedger() {
    return this.data.ledger;
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }

  // AI Studio Generator Simulation
  generateAiMission(theme: string, floor: number) {
    return {
      title: `Tantangan Rahasia Lantai ${floor}: ${theme || 'Inovasi Aswaja Masa Depan'}`,
      code: `AI-MIS-L${floor}-${Date.now().toString().slice(-4)}`,
      floorNumber: floor,
      type: "SIDE_QUEST",
      points: 250,
      description: `Misi kecerdasan buatan berbasis tema ${theme}. Mahasiswa ditantang untuk merumuskan integrasi nilai Aswaja dan teknologi digital di Lantai ${floor}.`,
      instructions: "Scan QR di titik stasiun AI dan kumpulkan 3 bukti kolaborasi digital kelompok.",
      clues: [`Temukan petunjuk hologram di dekat pintu laboratorium Lantai ${floor}.`],
      badgeReward: "AI Quest Master",
    };
  }

  generateAiQuestion(category: string, floor: number, difficulty: string) {
    return {
      question: `Bagaimana prinsip ${category || 'Aswaja'} diterapkan dalam memecahkan tantangan teknologi di era digital kampus UNU?`,
      category: category || "Aswaja & Ke-NU-an",
      floorNumber: floor || 1,
      difficulty: difficulty || "MEDIUM",
      type: "MULTIPLE_CHOICE",
      options: [
        { key: "A", text: "Mengedepankan sikap Tawassuth (moderat) dan adaptasi ilmiah yang beretika" },
        { key: "B", text: "Menolak perkembangan artificial intelligence secara mutlak" },
        { key: "C", text: "Mengabaikan nilai-nilai moral keagamaan demi efisiensi semata" },
        { key: "D", text: "Hanya menggunakan teknologi konvensional tanpa pembaruan" },
      ],
      correctAnswer: "A",
      explanation: "Prinsip Tawassuth mengajarkan keseimbangan antara mempertahankan tradisi yang baik dan mengadopsi inovasi baru yang lebih baik (Al-Muhafazhah 'alal Qadimis Shalih wal Akhdzu bil Jadidil Ashlah).",
      points: difficulty === "HARD" ? 100 : difficulty === "MEDIUM" ? 60 : 40,
    };
  }
}

export const mockDb = new MockDatabase();
