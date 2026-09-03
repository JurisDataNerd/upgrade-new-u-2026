import { db } from "./index";
import {
  users,
  teams,
  teamMembers,
  stages,
  floors,
  locations,
  games,
  missions,
  questions,
  achievements,
} from "./schema";
import { hashPassword } from "../lib/password";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  console.log("🌱 [Seed] Starting GENIUS 2026 Database Seeding...");

  // 1. Seed Floors (Lantai 1 - Lantai 9 Gedung Terpadu UNU Yogyakarta)
  console.log("🏢 Seeding 9 Floors of UNU Yogyakarta...");
  const floorData = [
    { number: 1, name: "Lantai 1: Lobby Utama & Student Center", description: "Pusat informasi, registrasi, dan aula penerimaan mahasiswa baru" },
    { number: 2, name: "Lantai 2: Perpustakaan & Digital Learning", description: "Pusat literasi, ruang baca modern, dan e-library" },
    { number: 3, name: "Lantai 3: Fakultas Teknologi Informasi", description: "Laboratorium AI, software engineering, dan data science" },
    { number: 4, name: "Lantai 4: Fakultas Industri Halal", description: "Laboratorium pangan halal, bioteknologi, dan standarisasi" },
    { number: 5, name: "Lantai 5: Fakultas Ekonomi & Bisnis Digital", description: "Inkubator startup, lab pasar modal, dan fintech" },
    { number: 6, name: "Lantai 6: Fakultas Studi Islam & Bahasa", description: "Kajian keislaman moderat dan pusat bahasa global" },
    { number: 7, name: "Lantai 7: Fakultas Ilmu Pendidikan & Seni", description: "Micro-teaching lab, studio media kreatif, dan seni budaya" },
    { number: 8, name: "Lantai 8: Rektorat & Pusat Inovasi UNU", description: "Ruang senat, kantor pimpinan, dan partnership hub" },
    { number: 9, name: "Lantai 9: Convention Hall & Sky Garden", description: "Auditorium utama grand ceremony dan observatorium" },
  ];

  let createdFloors = await db.select().from(floors);
  if (createdFloors.length === 0) {
    createdFloors = await db.insert(floors).values(floorData).returning();
  }

  // 2. Seed Locations with QR Tokens
  console.log("📍 Seeding Pos Lokasi & QR Code Tokens...");
  let createdLocations = await db.select().from(locations);
  if (createdLocations.length === 0) {
    const locationInserts: any[] = [];
    for (const fl of createdFloors) {
      locationInserts.push(
        {
          floorId: fl.id,
          name: `Pos ${fl.name} - Zona A`,
          code: `POS-L${fl.number}-A`,
          description: `Pos eksplorasi dan mini game zona barat Lantai ${fl.number}`,
          qrToken: `UNU-QR-L${fl.number}-ZONA-A-${crypto.randomUUID().slice(0, 8)}`,
          maxCapacity: 50,
          currentOccupancy: 0,
          status: "AVAILABLE" as const,
        },
        {
          floorId: fl.id,
          name: `Pos ${fl.name} - Zona B`,
          code: `POS-L${fl.number}-B`,
          description: `Pos tantangan kolaborasi zona timur Lantai ${fl.number}`,
          qrToken: `UNU-QR-L${fl.number}-ZONA-B-${crypto.randomUUID().slice(0, 8)}`,
          maxCapacity: 50,
          currentOccupancy: 0,
          status: "AVAILABLE" as const,
        }
      );
    }
    createdLocations = await db.insert(locations).values(locationInserts).returning();
  }

  // 3. Seed Stages
  console.log("🚩 Seeding 5 Stages Event GENIUS 2026...");
  let createdStages = await db.select().from(stages);
  if (createdStages.length === 0) {
    const stageData = [
      { order: 1, name: "Stage 1: Orientasi & Pembukaan", description: "Pengenalan nilai-nilai ke-NU-an, visi kampus, dan pembentukan regu", status: "ACTIVE" as const },
      { order: 2, name: "Stage 2: Penjelajahan 9 Lantai", description: "Eksplorasi seluruh fakultas dan laboratorium terpadu", status: "UPCOMING" as const },
      { order: 3, name: "Stage 3: Kolaborasi & Teamwork", description: "Uji kekompakan regu dalam menyelesaikan teka-teki interdisiplin", status: "UPCOMING" as const },
      { order: 4, name: "Stage 4: Inovasi & Tantangan Digital", description: "Hackathon mini dan pemecahan kasus berbasis teknologi AI", status: "UPCOMING" as const },
      { order: 5, name: "Stage 5: Grand Finale & Penobatan", description: "Penghitungan leaderboard akhir dan penobatan Juara GENIUS 2026", status: "UPCOMING" as const },
    ];
    createdStages = await db.insert(stages).values(stageData).returning();
  }

  // 4. Seed Games
  console.log("🎮 Seeding 5 Mini Games Engine...");
  let createdGames = await db.select().from(games);
  if (createdGames.length === 0) {
    const gameData = [
      {
        name: "Campus Trivia UNU",
        type: "QUIZ" as const,
        description: "Kuis kilat wawasan sejarah UNU Yogyakarta, pahlawan nasional, dan nilai Aswaja",
        config: { questionsCount: 5, timeLimitPerQuestion: 15, allowSkip: false },
      },
      {
        name: "Cyber Decoder",
        type: "PUZZLE" as const,
        description: "Dekripsi sinyal biner dan teka-teki logika kriptografi sandi kampus",
        config: { targetLength: 6, maxErrors: 3, difficulty: "MEDIUM" },
      },
      {
        name: "Memory Matrix",
        type: "MEMORY" as const,
        description: "Uji daya ingat pola matriks simbol sains & teknologi",
        config: { gridSize: 4, sequenceLength: 5, roundCount: 3 },
      },
      {
        name: "Speed Reflex Tap",
        type: "REACTION" as const,
        description: "Uji kecepatan refleks sentuhan visual target energi kampus",
        config: { targetCount: 20, speedMultiplier: 1.2 },
      },
      {
        name: "Logic Circuit Flow",
        type: "LOGIC" as const,
        description: "Merangkai aliran gerbang logika AI untuk mengaktifkan server lantai",
        config: { gatesCount: 4, maxTries: 5, difficulty: "HARD" },
      },
    ];
    createdGames = await db.insert(games).values(gameData).returning();
  }

  // 5. Seed Missions
  console.log("🎯 Seeding Campus Missions...");
  const existingMissions = await db.select().from(missions);
  if (existingMissions.length === 0 && createdLocations.length > 0 && createdStages.length > 0 && createdGames.length > 0) {
    const missionInserts: any[] = [];
    createdLocations.slice(0, 8).forEach((loc, idx) => {
      const g = createdGames[idx % createdGames.length];
      missionInserts.push({
        name: `Misi Pos ${idx + 1}: ${g.name}`,
        description: `Tantangan mini game ${g.name} di ${loc.name}`,
        type: "MAIN",
        locationId: loc.id,
        stageId: createdStages[0].id,
        gameId: g.id,
        order: idx + 1,
        isRequired: true,
        timeLimit: 300,
        status: "ACTIVE" as const,
      });
    });
    await db.insert(missions).values(missionInserts);
  }

  // 6. Seed Achievements (Titles & Badges)
  console.log("🏆 Seeding RPG Achievements & Title Upgrades...");
  const existingAchievements = await db.select().from(achievements);
  if (existingAchievements.length === 0) {
    const achievementData = [
      {
        name: "Langkah Pertama",
        title: "Novice Adventurer",
        description: "Menyelesaikan misi pos pertama dalam petualangan kampus",
        condition: { type: "MISSIONS_COMPLETED", count: 1 },
        icon: "boot-outline",
      },
      {
        name: "Penjelajah 9 Lantai",
        title: "Master Navigator",
        description: "Mengunjungi minimal 1 pos di setiap 9 lantai Gedung UNU",
        condition: { type: "FLOORS_EXPLORED", count: 9 },
        icon: "compass-outline",
      },
      {
        name: "Otak Brilian AI",
        title: "Cyber Alchemist",
        description: "Meraih skor sempurna 100% pada kuis logika dan kecerdasan buatan",
        condition: { type: "PERFECT_SCORE_GAMES", count: 3 },
        icon: "sparkles",
      },
      {
        name: "Sahabat Solid",
        title: "Pilar Regu Sejati",
        description: "Menerima bonus apresiasi kekompakan dari Buddy pendamping",
        condition: { type: "BUDDY_BONUS_RECEIVED", count: 2 },
        icon: "heart-handshake",
      },
      {
        name: "Sang Legenda Kampus",
        title: "Grand Archon UNU 2026",
        description: "Mencapai total akumulasi lebih dari 500 poin di leaderboard",
        condition: { type: "TOTAL_SCORE", threshold: 500 },
        icon: "trophy-award",
      },
    ];
    await db.insert(achievements).values(achievementData);
  }

  // 7. Seed Question Bank
  console.log("❓ Seeding Question Bank...");
  const existingQuestions = await db.select().from(questions);
  if (existingQuestions.length === 0) {
    const questionData = [
      {
        category: "Kampus UNU",
        difficulty: "EASY" as const,
        questionText: "Gedung kampus terpadu Universitas Nahdlatul Ulama (UNU) Yogyakarta memiliki berapa lantai?",
        type: "MULTIPLE_CHOICE" as const,
        options: ["7 Lantai", "8 Lantai", "9 Lantai", "10 Lantai"],
        correctAnswer: "9 Lantai",
        explanation: "Gedung terpadu UNU Yogyakarta memiliki 9 lantai dengan fasilitas perkuliahan, laboratorium riset, dan convention hall modern.",
        baseScore: 10,
      },
      {
        category: "Kampus UNU",
        difficulty: "EASY" as const,
        questionText: "Organisasi induk keagamaan yang menaungi berdirinya UNU Yogyakarta adalah...",
        type: "MULTIPLE_CHOICE" as const,
        options: ["Muhammadiyah", "Nahdlatul Ulama", "Persis", "Al-Washliyah"],
        correctAnswer: "Nahdlatul Ulama",
        explanation: "UNU Yogyakarta didirikan di bawah naungan Pengurus Besar Nahdlatul Ulama (PBNU).",
        baseScore: 10,
      },
      {
        category: "Teknologi & AI",
        difficulty: "MEDIUM" as const,
        questionText: "Cabang ilmu kecerdasan buatan yang mempelajari pemahaman dan pengolahan bahasa manusia disebut...",
        type: "MULTIPLE_CHOICE" as const,
        options: ["Computer Vision", "Natural Language Processing (NLP)", "Reinforcement Learning", "Edge Computing"],
        correctAnswer: "Natural Language Processing (NLP)",
        explanation: "NLP adalah bidang AI yang berfokus pada interaksi antara komputer dan bahasa alami manusia.",
        baseScore: 15,
      },
      {
        category: "Kampus UNU",
        difficulty: "MEDIUM" as const,
        questionText: "Prinsip dasar keislaman yang dijunjung tinggi oleh sivitas akademika UNU Yogyakarta adalah...",
        type: "MULTIPLE_CHOICE" as const,
        options: ["Ahlussunnah wal Jama'ah An-Nahdliyah", "Sekulerisme", "Pragmatisme", "Eksklusivisme"],
        correctAnswer: "Ahlussunnah wal Jama'ah An-Nahdliyah",
        explanation: "Aswaja An-Nahdliyah menjunjung tinggi moderasi (tawassuth), keseimbangan (tawazun), keadilan (i'tidal), dan toleransi (tasamuh).",
        baseScore: 15,
      },
      {
        category: "Teknologi & AI",
        difficulty: "HARD" as const,
        questionText: "Dalam arsitektur model transformer AI, mekanisme utama yang memungkinkan pemrosesan relasi antar token secara paralel disebut...",
        type: "MULTIPLE_CHOICE" as const,
        options: ["Self-Attention Mechanism", "Convolution Layer", "Recurrent Gate", "Pooling Layer"],
        correctAnswer: "Self-Attention Mechanism",
        explanation: "Mekanisme Self-Attention memungkinkan transformer menghitung bobot keterkaitan antar semua token dalam input sequence sekaligus.",
        baseScore: 20,
      },
    ];
    await db.insert(questions).values(questionData);
  }

  // 8. Seed Core Users (Admin, Buddies, Teams, Participants)
  console.log("👥 Seeding Core System Users & RPG Characters...");
  const adminPasswordHash = await hashPassword("admin2026");
  const buddyPasswordHash = await hashPassword("buddy2026");
  const userPasswordHash = await hashPassword("genius2026");

  // Upsert or Ensure Admin User exists
  const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN" as const,
      fullName: "Administrator GENIUS",
      gender: "MALE",
      characterClass: "CYBER_KNIGHT",
      characterTitle: "Grand Archon UNU 2026",
      characterTier: 3,
      unlockedTitles: ["Grand Archon UNU 2026", "Novice Adventurer"],
    });
  } else {
    // Update admin password to admin2026 just in case
    await db.update(users).set({ passwordHash: adminPasswordHash }).where(eq(users.username, "admin"));
  }

  // Buddies
  const existingBuddy1 = await db.select().from(users).where(eq(users.username, "buddy_ahmad"));
  if (existingBuddy1.length === 0) {
    await db.insert(users).values([
      {
        username: "buddy_ahmad",
        passwordHash: buddyPasswordHash,
        role: "BUDDY" as const,
        fullName: "Ahmad Fauzi (Buddy)",
        gender: "MALE",
        characterClass: "MECHA_PALADIN",
        characterTitle: "Pilar Regu Sejati",
        characterTier: 2,
        unlockedTitles: ["Pilar Regu Sejati", "Novice Adventurer"],
      },
      {
        username: "buddy_siti",
        passwordHash: buddyPasswordHash,
        role: "BUDDY" as const,
        fullName: "Siti Nurhaliza (Buddy)",
        gender: "FEMALE",
        characterClass: "TECH_MAGE",
        characterTitle: "Master Navigator",
        characterTier: 2,
        unlockedTitles: ["Master Navigator", "Novice Adventurer"],
      },
    ]);
  }

  console.log("✅ [Seed] Database successfully seeded and verified!");
}

// Run standalone if executed directly via bun
if (import.meta.main) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ [Seed] Error seeding database:", err);
      process.exit(1);
    });
}
