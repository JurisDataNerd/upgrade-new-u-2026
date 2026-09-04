import { db } from "./db";
import {
  users,
  floors,
  locations,
  stages,
  games,
  questions,
  teams,
  teamMembers,
  routes,
  routeStops,
  missions,
  ormawaBooths,
} from "./db/schema";
import { hashPassword } from "./lib/password";
import { eq, and } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting GENIUS 2026 Database Seeding...");

  // 1. Seed Admin & Sample Users
  console.log("Creating Admin & Demo Users...");
  const adminPassword = await hashPassword("admin2026");
  const defaultPassword = await hashPassword("genius2026");

  // Check if admin exists
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  let adminUser = existingAdmin;
  if (!existingAdmin) {
    [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        passwordHash: adminPassword,
        fullName: "Administrator GENIUS",
        role: "ADMIN",
        status: "ACTIVE",
      })
      .returning();
    console.log("  ✅ Admin created: username 'admin', password 'admin2026'");
  }

  // Create sample Buddy
  const [existingBuddy] = await db
    .select()
    .from(users)
    .where(eq(users.username, "buddy_budi"))
    .limit(1);

  let buddyUser = existingBuddy;
  if (!existingBuddy) {
    [buddyUser] = await db
      .insert(users)
      .values({
        username: "buddy_budi",
        passwordHash: defaultPassword,
        fullName: "Budi Santoso (Buddy)",
        role: "BUDDY",
        status: "ACTIVE",
      })
      .returning();
    console.log("  ✅ Sample Buddy created: username 'buddy_budi'");
  }

  // Create sample Participants with rich RPG profiles & evolution tiers
  const sampleParticipantsConfig = [
    {
      username: "peserta_1",
      fullName: "Ahmad Dahlan",
      gender: "MALE",
      characterClass: "CYBER_KNIGHT",
      characterTitle: "Novice Adventurer",
      characterTier: 1,
      unlockedTitles: ["Novice Adventurer", "Penjelajah Kampus Baru"],
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnightM1&backgroundColor=0284c7",
    },
    {
      username: "peserta_2",
      fullName: "Fatimah Azzahra",
      gender: "FEMALE",
      characterClass: "TECH_MAGE",
      characterTitle: "Master Kuis Cepat",
      characterTier: 2,
      unlockedTitles: ["Novice Adventurer", "Code Apprentice", "Master Kuis Cepat", "Archmage of Code"],
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=TechMageF2&backgroundColor=6b21a8",
    },
    {
      username: "peserta_3",
      fullName: "Rian Pratama",
      gender: "MALE",
      characterClass: "CODE_ARCHER",
      characterTitle: "Ahli Refleks Kilat",
      characterTier: 2,
      unlockedTitles: ["Novice Adventurer", "Algorithm Scout", "Ahli Refleks Kilat"],
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeArcherM2&backgroundColor=166534",
    },
    {
      username: "peserta_4",
      fullName: "Siti Nurhaliza",
      gender: "FEMALE",
      characterClass: "DATA_ALCHEMIST",
      characterTitle: "Pakar Teka-Teki Kuno",
      characterTier: 2,
      unlockedTitles: ["Novice Adventurer", "Data Seeker", "Pakar Teka-Teki Kuno", "Data Wizard"],
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=DataAlchemistF2&backgroundColor=854d0e",
    },
    {
      username: "peserta_5",
      fullName: "Kevin Wijaya",
      gender: "MALE",
      characterClass: "SHADOW_ASSASSIN",
      characterTitle: "Penakluk 9 Lantai",
      characterTier: 3,
      unlockedTitles: ["Novice Adventurer", "Silent Runner", "Speed Solver", "Penakluk 9 Lantai", "Lantai 9 Conqueror"],
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowAssassinM3&backgroundColor=713f12",
    },
  ];

  const sampleParticipants = [];
  for (const pConfig of sampleParticipantsConfig) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, pConfig.username))
      .limit(1);

    if (!existing) {
      const [p] = await db
        .insert(users)
        .values({
          username: pConfig.username,
          passwordHash: defaultPassword,
          fullName: pConfig.fullName,
          role: "PARTICIPANT",
          status: "ACTIVE",
          gender: pConfig.gender,
          characterClass: pConfig.characterClass,
          characterTitle: pConfig.characterTitle,
          characterTier: pConfig.characterTier,
          unlockedTitles: pConfig.unlockedTitles,
          avatarUrl: pConfig.avatarUrl,
        })
        .returning();
      sampleParticipants.push(p);
    } else {
      // Update with RPG metadata
      await db
        .update(users)
        .set({
          fullName: pConfig.fullName,
          gender: pConfig.gender,
          characterClass: pConfig.characterClass,
          characterTitle: pConfig.characterTitle,
          characterTier: pConfig.characterTier,
          unlockedTitles: pConfig.unlockedTitles,
          avatarUrl: pConfig.avatarUrl,
        })
        .where(eq(users.id, existing.id));
      sampleParticipants.push(existing);
    }
  }
  console.log(`  ✅ ${sampleParticipants.length} Sample RPG Participants verified/updated`);

  // 2. Seed 9 Floors of UNU Yogyakarta
  console.log("Creating 9 Campus Floors...");
  const floorConfig = [
    { number: 1, name: "Lantai 1: Lobby Utama & Student Center", description: "Lobby resepsionis, pusat layanan mahasiswa, dan plaza kampus." },
    { number: 2, name: "Lantai 2: Perpustakaan & Digital Learning Lab", description: "Pusat literasi digital, koleksi buku referensi, dan lab pembelajaran mandiri." },
    { number: 3, name: "Lantai 3: Fakultas Teknologi Informasi & AI Lab", description: "Lab komputasi awan, lab kecerdasan buatan, dan ruang kuliah FTI." },
    { number: 4, name: "Lantai 4: Fakultas Industri Halal & Bioteknologi", description: "Laboratorium halal research, bioteknologi terapan, dan agritech." },
    { number: 5, name: "Lantai 5: Fakultas Ekonomi & Bisnis Digital", description: "Smart classroom, inkubator startup syariah, dan mini financial trading room." },
    { number: 6, name: "Lantai 6: Fakultas Studi Islam & Bahasa Global", description: "Pusat studi Islam Nusantara, laboratorium bahasa asing, dan ruang debat." },
    { number: 7, name: "Lantai 7: Fakultas Ilmu Pendidikan & Seni Budaya", description: "Studio multimedia kreatif, microteaching lab, dan galeri kebudayaan." },
    { number: 8, name: "Lantai 8: Rektorat & Pusat Riset Inovasi UNU", description: "Kantor pimpinan universitas, dewan pertimbangan, dan pusat inovasi strategis." },
    { number: 9, name: "Lantai 9: Convention Hall & Rooftop Sky Garden", description: "Auditorium utama, sky garden panoramic view, dan arena grand final." },
  ];

  const createdFloors = [];
  for (const fc of floorConfig) {
    const [existing] = await db
      .select()
      .from(floors)
      .where(eq(floors.number, fc.number))
      .limit(1);

    if (!existing) {
      const [f] = await db
        .insert(floors)
        .values({
          number: fc.number,
          name: fc.name,
          description: fc.description,
        })
        .returning();
      createdFloors.push(f);
    } else {
      await db.update(floors).set({ name: fc.name, description: fc.description }).where(eq(floors.id, existing.id));
      createdFloors.push(existing);
    }
  }
  console.log("  ✅ 9 Floors seeded with detailed facility names");

  // 3. Seed 18 Campus Pos Locations (Zona A & B per Lantai)
  console.log("Creating 18 Physical Pos Locations & QR Identifiers...");
  const sampleLocationData = [
    // Lantai 1
    { code: "POS-L1-A", name: "Lantai 1: Lobby Utama (Zona Barat)", floorNum: 1, qrCode: "UNU-QR-L1-ZONA-A-2026", desc: "Pos Pendaftaran & Orientasi Awal Mahasiswa Baru" },
    { code: "POS-L1-B", name: "Lantai 1: Student Center (Zona Timur)", floorNum: 1, qrCode: "UNU-QR-L1-ZONA-B-2026", desc: "Pos UKM & Informasi Komunitas Kampus" },
    // Lantai 2
    { code: "POS-L2-A", name: "Lantai 2: Perpustakaan (Zona Barat)", floorNum: 2, qrCode: "UNU-QR-L2-ZONA-A-2026", desc: "Pos Literasi & Arsip Khazanah Ilmu" },
    { code: "POS-L2-B", name: "Lantai 2: Digital Learning Lab (Zona Timur)", floorNum: 2, qrCode: "UNU-QR-L2-ZONA-B-2026", desc: "Pos E-Learning & Akses Jurnal Internasional" },
    // Lantai 3
    { code: "POS-L3-A", name: "Lantai 3: Lab Komputer AI (Zona Barat)", floorNum: 3, qrCode: "UNU-QR-L3-ZONA-A-2026", desc: "Pos Algoritma & Pemrograman Cerdas" },
    { code: "POS-L3-B", name: "Lantai 3: Smart FTI Hall (Zona Timur)", floorNum: 3, qrCode: "UNU-QR-L3-ZONA-B-2026", desc: "Pos Jaringan & Infrastruktur Siber Kampus" },
    // Lantai 4
    { code: "POS-L4-A", name: "Lantai 4: Lab Riset Halal (Zona Barat)", floorNum: 4, qrCode: "UNU-QR-L4-ZONA-A-2026", desc: "Pos Standarisasi & Sains Industri Halal" },
    { code: "POS-L4-B", name: "Lantai 4: Bioteknologi Terapan (Zona Timur)", floorNum: 4, qrCode: "UNU-QR-L4-ZONA-B-2026", desc: "Pos Eksperimen Hayati & Keberlanjutan" },
    // Lantai 5
    { code: "POS-L5-A", name: "Lantai 5: Smart Classroom FEB (Zona Barat)", floorNum: 5, qrCode: "UNU-QR-L5-ZONA-A-2026", desc: "Pos Manajemen & Simulasi Bisnis Modern" },
    { code: "POS-L5-B", name: "Lantai 5: Inkubator Startup (Zona Timur)", floorNum: 5, qrCode: "UNU-QR-L5-ZONA-B-2026", desc: "Pos Inovasi Ekonomi Kreatif Digital" },
    // Lantai 6
    { code: "POS-L6-A", name: "Lantai 6: Pusat Studi Islam (Zona Barat)", floorNum: 6, qrCode: "UNU-QR-L6-ZONA-A-2026", desc: "Pos Khazanah Islam Nusantara & Kebangsaan" },
    { code: "POS-L6-B", name: "Lantai 6: Lab Bahasa Global (Zona Timur)", floorNum: 6, qrCode: "UNU-QR-L6-ZONA-B-2026", desc: "Pos Diplomasi & Komunikasi Multibahasa" },
    // Lantai 7
    { code: "POS-L7-A", name: "Lantai 7: Studio Multimedia (Zona Barat)", floorNum: 7, qrCode: "UNU-QR-L7-ZONA-A-2026", desc: "Pos Desain Kreatif & Visualisasi Digital" },
    { code: "POS-L7-B", name: "Lantai 7: Microteaching Lab (Zona Timur)", floorNum: 7, qrCode: "UNU-QR-L7-ZONA-B-2026", desc: "Pos Karakter Pendidik & Metodologi Belajar" },
    // Lantai 8
    { code: "POS-L8-A", name: "Lantai 8: Pusat Inovasi Riset (Zona Barat)", floorNum: 8, qrCode: "UNU-QR-L8-ZONA-A-2026", desc: "Pos Kolaborasi Strategis & Riset Terapan" },
    { code: "POS-L8-B", name: "Lantai 8: Ruang Rapat Pimpinan (Zona Timur)", floorNum: 8, qrCode: "UNU-QR-L8-ZONA-B-2026", desc: "Pos Tata Kelola & Kepemimpinan Kampus" },
    // Lantai 9
    { code: "POS-L9-A", name: "Lantai 9: Convention Hall (Zona Barat)", floorNum: 9, qrCode: "UNU-QR-L9-ZONA-A-2026", desc: "Pos Puncak Arena Grand Quest & Sidang Pleno" },
    { code: "POS-L9-B", name: "Lantai 9: Rooftop Sky Garden (Zona Timur)", floorNum: 9, qrCode: "UNU-QR-L9-ZONA-B-2026", desc: "Pos Epilog & Titik Foto Kemenangan Tim" },
  ];

  const createdLocations = [];
  for (const loc of sampleLocationData) {
    const floor = createdFloors.find((f) => f.number === loc.floorNum);
    if (!floor) continue;

    const [existing] = await db
      .select()
      .from(locations)
      .where(eq(locations.code, loc.code))
      .limit(1);

    if (!existing) {
      const [l] = await db
        .insert(locations)
        .values({
          code: loc.code,
          name: loc.name,
          description: loc.desc,
          floorId: floor.id,
          qrCode: loc.qrCode,
          capacity: 4,
          status: "AVAILABLE",
        })
        .returning();
      createdLocations.push(l);
    } else {
      await db
        .update(locations)
        .set({
          name: loc.name,
          description: loc.desc,
          qrCode: loc.qrCode,
          capacity: 4,
        })
        .where(eq(locations.id, existing.id));
      createdLocations.push(existing);
    }
  }
  console.log(`  ✅ ${createdLocations.length} Physical Pos Locations mapped with verified QR codes`);

  // 4. Seed Stages with Explicit Daily Schedules (Stage 1, 2, 3)
  console.log("Creating Event Stages with Daily Schedule Timestamps...");
  const baseDate = new Date();
  baseDate.setHours(8, 0, 0, 0);

  const day1Start = new Date(baseDate);
  const day1End = new Date(baseDate);
  day1End.setHours(16, 0, 0, 0);

  const day2Start = new Date(baseDate);
  day2Start.setDate(day2Start.getDate() + 1);
  const day2End = new Date(day2Start);
  day2End.setHours(16, 0, 0, 0);

  const day3Start = new Date(baseDate);
  day3Start.setDate(day3Start.getDate() + 2);
  const day3End = new Date(day3Start);
  day3End.setHours(17, 30, 0, 0);

  const stageData = [
    {
      name: "Stage 1: Campus Discovery (Hari 1)",
      order: 1,
      status: "ACTIVE" as const,
      startTime: day1Start,
      endTime: day1End,
      description: "Eksplorasi fisik lantai 1-3, orientasi fakultas, pengenalan sistem kuis pos, dan pembentukan sinergi tim.",
    },
    {
      name: "Stage 2: Logic & Teamwork (Hari 2)",
      order: 2,
      status: "UPCOMING" as const,
      startTime: day2Start,
      endTime: day2End,
      description: "Penjelajahan lantai 4-7, tantangan pemecahan masalah multidisiplin, dan pengumpulan poin tier lanjutan.",
    },
    {
      name: "Stage 3: Grand Quest Final (Hari 3)",
      order: 3,
      status: "UPCOMING" as const,
      startTime: day3Start,
      endTime: day3End,
      description: "Penaklukan lantai 8-9, pertarungan kuis kecepatan tinggi, perebutan tahta juara, dan upacara penganugerahan gelar.",
    },
  ];

  const createdStages = [];
  for (const s of stageData) {
    const [existing] = await db
      .select()
      .from(stages)
      .where(eq(stages.order, s.order))
      .limit(1);

    if (!existing) {
      const [st] = await db
        .insert(stages)
        .values({
          name: s.name,
          order: s.order,
          status: s.status,
          startTime: s.startTime,
          endTime: s.endTime,
          description: s.description,
        })
        .returning();
      createdStages.push(st);
    } else {
      await db.update(stages).set(s).where(eq(stages.id, existing.id));
      createdStages.push(existing);
    }
  }
  console.log("  ✅ Stages seeded with exact schedule");

  // 5. Seed Mini Games Definitions (Focusing on Team Quiz Challenge)
  console.log("Creating Mini Game Definitions (Focus on Team Quiz)...");
  const gameDefs = [
    {
      name: "Team Quiz Challenge",
      type: "QUIZ" as const,
      description: "Kuis wawasan kampus, nilai Aswaja, teknologi, dan khazanah UNU Yogyakarta.",
      instructions: "Jawab seluruh soal pilihan ganda bersama tim secara cepat dan akurat untuk memaksimalkan speed bonus!",
      config: {
        questionCount: 5,
        timeLimit: 90,
        baseScorePerQuestion: 15,
        maxSpeedBonusPerQuestion: 10,
      },
      questionBankCategory: "Umum",
      status: "ACTIVE" as const,
    },
    {
      name: "Speed Reaction Blitz",
      type: "REACTION" as const,
      description: "Uji refleks tim dalam menanggapi sinyal pos.",
      instructions: "Tap setiap target secepat mungkin saat muncul di layar!",
      config: {
        targetCount: 10,
        timeLimit: 60,
        targetTimeoutMs: 2000,
        baseScorePerTarget: 10,
      },
      status: "ACTIVE" as const,
    },
    {
      name: "Memory Match Pairs",
      type: "MEMORY" as const,
      description: "Cari & cocokkan pasangan lambang serta fasilitas kampus.",
      instructions: "Buka dan temukan seluruh pasangan kartu yang cocok dalam batas waktu!",
      config: {
        gridSize: "4x4",
        totalPairs: 8,
        timeLimit: 120,
        scorePerMatch: 15,
      },
      status: "ACTIVE" as const,
    },
  ];

  const createdGames = [];
  let mainQuizGame: any = null;
  for (const g of gameDefs) {
    const [existing] = await db
      .select()
      .from(games)
      .where(eq(games.name, g.name))
      .limit(1);

    if (!existing) {
      const [game] = await db.insert(games).values(g).returning();
      createdGames.push(game);
      if (game.type === "QUIZ") mainQuizGame = game;
    } else {
      await db.update(games).set(g).where(eq(games.id, existing.id));
      createdGames.push(existing);
      if (existing.type === "QUIZ") mainQuizGame = existing;
    }
  }
  console.log("  ✅ Mini Game definitions initialized");

  // 6. Seed Rich Question Bank (15+ Curated Questions for UNU Yogyakarta)
  console.log("Creating Expanded Question Bank (UNU Yogyakarta & GENIUS 2026)...");
  const sampleQuestions = [
    {
      category: "Wawasan Kampus",
      difficulty: "EASY" as const,
      questionText: "Berapa jumlah lantai utama pada Gedung Kampus Terpadu UNU Yogyakarta?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["7 Lantai", "8 Lantai", "9 Lantai", "10 Lantai"],
      correctAnswer: "9 Lantai",
      explanation: "Gedung Kampus Terpadu UNU Yogyakarta memiliki 9 lantai dengan fasilitas terpadu dari lobby hingga rooftop.",
      baseScore: 15,
      tags: ["kampus", "fasilitas"],
    },
    {
      category: "Wawasan Kampus",
      difficulty: "EASY" as const,
      questionText: "Fasilitas Lab Komputer & Kecerdasan Buatan (AI) UNU Yogyakarta terletak pada lantai berapa?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Lantai 1", "Lantai 2", "Lantai 3", "Lantai 5"],
      correctAnswer: "Lantai 3",
      explanation: "Fakultas Teknologi Informasi beserta Laboratorium Komputasi dan AI berpusat di Lantai 3.",
      baseScore: 15,
      tags: ["kampus", "fti", "ai"],
    },
    {
      category: "Teknologi",
      difficulty: "MEDIUM" as const,
      questionText: "Protokol apa yang digunakan oleh platform GENIUS 2026 untuk sinkronisasi multiplayer realtime dalam jaringan kampus?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["WebSocket Native", "SMS Gateway", "Bluetooth Beacon", "Polling HTTP 1.0"],
      correctAnswer: "WebSocket Native",
      explanation: "WebSocket native Bun/Elysia memungkinkan sinkronisasi sesi multiplayer, countdown timer, dan skor secara realtime tanpa jeda.",
      baseScore: 20,
      tags: ["teknologi", "realtime", "websocket"],
    },
    {
      category: "Wawasan Kampus",
      difficulty: "MEDIUM" as const,
      questionText: "Apa nama lokasi yang berada di Lantai 9 Gedung UNU Yogyakarta yang digunakan untuk acara akbar dan arena puncak?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Convention Hall & Rooftop Sky Garden", "Basement Parking", "Perpustakaan Kuno", "Asrama Mahasiswa"],
      correctAnswer: "Convention Hall & Rooftop Sky Garden",
      explanation: "Lantai 9 adalah Convention Hall luas berstandar internasional dan Rooftop Sky Garden dengan pemandangan terbuka.",
      baseScore: 20,
      tags: ["lantai9", "venue"],
    },
    {
      category: "Karakter & Nilai",
      difficulty: "EASY" as const,
      questionText: "Landasan nilai keagamaan dan kebangsaan apakah yang diintegrasikan dengan sains teknologi di UNU Yogyakarta?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Ahlussunnah wal Jama'ah An-Nahdliyyah & Keunggulan IPTEK", "Individualisme Murni", "Sains Sekuler Tanpa Etika", "Materialisme Praktis"],
      correctAnswer: "Ahlussunnah wal Jama'ah An-Nahdliyyah & Keunggulan IPTEK",
      explanation: "UNU Yogyakarta mengintegrasikan nilai-nilai luhur Aswaja dengan inovasi sains dan teknologi masa depan.",
      baseScore: 15,
      tags: ["nilai", "aswaja", "karakter"],
    },
    {
      category: "Wawasan Kampus",
      difficulty: "MEDIUM" as const,
      questionText: "Fakultas apa di UNU Yogyakarta yang berfokus pada riset halal, keamanan pangan, dan bioteknologi terapan?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Fakultas Industri Halal", "Fakultas Kedokteran Hewan", "Fakultas Kelautan", "Fakultas Metalurgi"],
      correctAnswer: "Fakultas Industri Halal",
      explanation: "Fakultas Industri Halal UNU Yogyakarta merupakan salah satu fakultas pelopor riset halal dan bioteknologi di Indonesia.",
      baseScore: 20,
      tags: ["fakultas", "industri-halal"],
    },
    {
      category: "Sistem RPG",
      difficulty: "EASY" as const,
      questionText: "Berapa tier evolusi karakter RPG yang dapat diraih peserta sepanjang petualangan GENIUS 2026?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["3 Tier (Novice, Advanced, Ascended)", "1 Tier Saja", "5 Tier", "10 Tier"],
      correctAnswer: "3 Tier (Novice, Advanced, Ascended)",
      explanation: "Karakter peserta berevolusi dari Tier 1 (Novice), Tier 2 (Advanced 200+ pts), hingga Tier 3 (Ascended 500+ pts).",
      baseScore: 15,
      tags: ["rpg", "tier", "evolusi"],
    },
    {
      category: "Karakter & Nilai",
      difficulty: "MEDIUM" as const,
      questionText: "Apa peran utama seorang Buddy dalam petualangan tim GENIUS 2026?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Pemandu, fasilitator misi, dan motivator tim", "Wasit yang hanya mencatat pelanggaran", "Pemain pengganti peserta", "Juri tunggal penentu nilai"],
      correctAnswer: "Pemandu, fasilitator misi, dan motivator tim",
      explanation: "Buddy mendampingi tim, mengontrol sesi permainan di pos, memotivasi peserta, dan memberikan apresiasi bonus.",
      baseScore: 20,
      tags: ["buddy", "tim", "orientasi"],
    },
    {
      category: "Wawasan Kampus",
      difficulty: "HARD" as const,
      questionText: "Lantai manakah di Gedung UNU Yogyakarta yang menjadi pusat inkubator startup dan smart classroom ekonomi syariah?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Lantai 5 (Fakultas Ekonomi & Bisnis Digital)", "Lantai 1", "Lantai 7", "Lantai 8"],
      correctAnswer: "Lantai 5 (Fakultas Ekonomi & Bisnis Digital)",
      explanation: "Lantai 5 didesain untuk Fakultas Ekonomi & Bisnis Digital lengkap dengan inkubator startup dan smart classroom.",
      baseScore: 25,
      tags: ["feb", "lantai5", "startup"],
    },
    {
      category: "Wawasan Kampus",
      difficulty: "HARD" as const,
      questionText: "Di lantai berapakah Studio Multimedia Kreatif dan Microteaching Lab berada?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Lantai 7 (Fakultas Ilmu Pendidikan & Seni)", "Lantai 2", "Lantai 4", "Lantai 6"],
      correctAnswer: "Lantai 7 (Fakultas Ilmu Pendidikan & Seni)",
      explanation: "Lantai 7 adalah rumah bagi Fakultas Ilmu Pendidikan dan Studio Multimedia Kreatif.",
      baseScore: 25,
      tags: ["fip", "lantai7", "studio"],
    },
  ];

  for (const q of sampleQuestions) {
    const [existing] = await db
      .select()
      .from(questions)
      .where(eq(questions.questionText, q.questionText))
      .limit(1);

    if (!existing) {
      await db.insert(questions).values(q);
    } else {
      await db.update(questions).set(q).where(eq(questions.id, existing.id));
    }
  }
  console.log(`  ✅ ${sampleQuestions.length} Curated Questions active in Question Bank`);

  // 7. Seed Missions & Routes Mapping to 9 Floors
  console.log("Setting up Stage Routes and Missions for all 9 Floors...");
  const stage1 = createdStages.find((s) => s.order === 1) || createdStages[0];
  
  if (stage1 && mainQuizGame) {
    const [existingRoute] = await db
      .select()
      .from(routes)
      .where(eq(routes.name, "Rute Utama Ekspedisi 9 Lantai"))
      .limit(1);

    let mainRoute = existingRoute;
    if (!existingRoute) {
      [mainRoute] = await db
        .insert(routes)
        .values({
          name: "Rute Utama Ekspedisi 9 Lantai",
          stageId: stage1.id,
          status: "ACTIVE",
        })
        .returning();
    }

    // Attach route stops for each floor
    for (let fNum = 1; fNum <= 9; fNum++) {
      const posLoc = createdLocations.find((l) => l.code === `POS-L${fNum}-A`);
      if (posLoc && mainRoute) {
        const [existingStop] = await db
          .select()
          .from(routeStops)
          .where(and(eq(routeStops.routeId, mainRoute.id), eq(routeStops.order, fNum)))
          .limit(1);

        if (!existingStop) {
          await db.insert(routeStops).values({
            routeId: mainRoute.id,
            locationId: posLoc.id,
            order: fNum,
            isRequired: true,
            estimatedDurationMin: 15,
          });
        }

        // Attach mission for this pos
        const [existingMission] = await db
          .select()
          .from(missions)
          .where(eq(missions.locationId, posLoc.id))
          .limit(1);

        if (!existingMission) {
          await db.insert(missions).values({
            name: `Tantangan Kuis Pos Lantai ${fNum}`,
            description: `Selesaikan kuis wawasan dan uji kecerdasan tim di ${posLoc.name}`,
            type: "MAIN",
            locationId: posLoc.id,
            stageId: stage1.id,
            gameId: mainQuizGame.id,
            order: fNum,
            timeLimit: 120,
            status: "ACTIVE",
          });
        }
      }
    }
    console.log("  ✅ 9 Floor Routes & Quiz Missions attached to Stage 1");
  }

  // 8. Seed Sample Team & Member Assignment
  console.log("Creating Sample Team 'Genius 01'...");
  const [existingTeam] = await db
    .select()
    .from(teams)
    .where(eq(teams.code, "GENIUS-01"))
    .limit(1);

  let sampleTeam = existingTeam;
  if (!existingTeam) {
    [sampleTeam] = await db
      .insert(teams)
      .values({
        name: "Genius 01",
        code: "GENIUS-01",
        status: "ACTIVE",
      })
      .returning();

    // Assign Buddy to Team
    if (buddyUser) {
      await db.insert(teamMembers).values({
        teamId: sampleTeam.id,
        userId: buddyUser.id,
        buddyRole: "PRIMARY",
      });
    }

    // Assign Participants to Team
    for (const p of sampleParticipants) {
      await db.insert(teamMembers).values({
        teamId: sampleTeam.id,
        userId: p.id,
      });
    }
    console.log("  ✅ Team 'Genius 01' with 1 Buddy and 5 Participants created");
  }

  // 9. Seed Sample Ormawa Booths (Expo Hari 3)
  console.log("🎪 Seeding Sample Ormawa Booths (Expo Hari 3)...");
  const sampleOrmawa = [
    {
      code: "ORMAWA-SILAT",
      name: "Pagar Nusa & Pencak Silat UNU Jogja",
      shortName: "Silat Pagar Nusa",
      category: "Olahraga & Seni Beladiri",
      boothNumber: "E3-01",
      description: "Pengembangan seni beladiri tradisional dan kebugaran jasmani mahasiswa.",
      qrCode: "UNU-ORMAWA-SILAT-2026",
      xpReward: 75,
      badgeIcon: "Shield",
      badgeColor: "#16a34a",
      contactPerson: "Zaki (+6281399887766)",
      instagram: "@silat_unujogja",
    },
    {
      code: "ORMAWA-ROBOTIK",
      name: "Komunitas Robotika & AI UNU",
      shortName: "Robotika AI Club",
      category: "Sains & Teknologi",
      boothNumber: "E3-02",
      description: "Riset dan pengembangan robot cerdas, drone, dan IoT kampus.",
      qrCode: "UNU-ORMAWA-ROBOTIK-2026",
      xpReward: 75,
      badgeIcon: "Cpu",
      badgeColor: "#38bdf8",
      contactPerson: "Farhan (+6281234567891)",
      instagram: "@robotika_unujogja",
    },
    {
      code: "ORMAWA-PADUS",
      name: "Paduan Suara Mahasiswa Gita Nusantara",
      shortName: "PSM Gita Nusantara",
      category: "Seni & Vokal",
      boothNumber: "E3-03",
      description: "Paduan suara representasi kampus pada agenda protokoler dan festival padus nasional.",
      qrCode: "UNU-ORMAWA-PADUS-2026",
      xpReward: 75,
      badgeIcon: "MusicNotes",
      badgeColor: "#ec4899",
      contactPerson: "Nabila (+6281298765432)",
      instagram: "@psm_unujogja",
    },
    {
      code: "ORMAWA-TEATER",
      name: "Teater & Seni Peran Candradimuka",
      shortName: "Teater Candradimuka",
      category: "Seni Pertunjukan",
      boothNumber: "E3-04",
      description: "Apresiasi sastra, lakon panggung, dan seni peran mahasiswa.",
      qrCode: "UNU-ORMAWA-TEATER-2026",
      xpReward: 75,
      badgeIcon: "MasksTheater",
      badgeColor: "#a855f7",
      contactPerson: "Danang (+6285612345678)",
      instagram: "@teater_unujogja",
    },
    {
      code: "ORMAWA-KSR",
      name: "Korps Sukarela (KSR) PMI Unit UNU",
      shortName: "KSR PMI UNU",
      category: "Sosial & Kemanusiaan",
      boothNumber: "E3-05",
      description: "Pelayanan pertolongan pertama, donor darah, dan tanggap bencana kampus.",
      qrCode: "UNU-ORMAWA-KSR-2026",
      xpReward: 75,
      badgeIcon: "FirstAidKit",
      badgeColor: "#ef4444",
      contactPerson: "Rina (+6287711223344)",
      instagram: "@ksrpmi_unujogja",
    },
  ];

  for (const ob of sampleOrmawa) {
    const [existing] = await db
      .select()
      .from(ormawaBooths)
      .where(eq(ormawaBooths.code, ob.code))
      .limit(1);

    if (!existing) {
      await db.insert(ormawaBooths).values(ob);
    }
  }
  console.log(`  ✅ ${sampleOrmawa.length} Sample Ormawa Booths seeded`);

  console.log("🎉 GENIUS 2026 Seeding Completed Successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
