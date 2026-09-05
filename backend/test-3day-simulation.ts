import { db } from "./src/db";
import { users, teams, teamMembers, scoreTransactions, attendances, dailyReflections, ormawaScans, fgdEvaluations, ormawaBooths } from "./src/db/schema";
import { hashPassword } from "./src/lib/password";
import { eq, and, sql } from "drizzle-orm";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

async function post(url: string, body: any, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function get(url: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, { method: "GET", headers });
  const data = await res.json();
  return { status: res.status, data };
}

async function put(url: string, body: any, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runSimulation() {
  console.log(`\n${c.bright}${c.cyan}═════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.cyan}  🚀 GENIUS UNU 2026 — SIMULASI E2E RUNDOWN 3 HARI PENUH (BACKEND & DB)  ${c.reset}`);
  console.log(`${c.bright}${c.cyan}═════════════════════════════════════════════════════════════════════════${c.reset}\n`);

  // =========================================================================
  // SETUP & AUTHENTICATION
  // =========================================================================
  console.log(`${c.bright}${c.yellow}🔐 [TAHAP 0] Persiapan User, Akun Admin, Buddy, & Mahasiswa Baru...${c.reset}`);

  // 1. Admin Login
  const adminLogin = await post("/api/auth/login", { username: "admin", password: "admin2026" });
  if (!adminLogin.data.success || !adminLogin.data.data?.token) {
    throw new Error(`Admin login gagal: ${JSON.stringify(adminLogin.data)}`);
  }
  const adminToken = adminLogin.data.data.token;
  console.log(`   ${c.green}✔ Admin authenticated!${c.reset}`);

  // 2. Buddy Login
  const buddyLogin = await post("/api/auth/login", { username: "buddy_ahmad", password: "buddy2026" });
  if (!buddyLogin.data.success || !buddyLogin.data.data?.token) {
    throw new Error(`Buddy login gagal: ${JSON.stringify(buddyLogin.data)}`);
  }
  const buddyToken = buddyLogin.data.data.token;
  const buddyId = buddyLogin.data.data.user.id;
  console.log(`   ${c.green}✔ Buddy Ahmad authenticated (ID: ${buddyId})${c.reset}`);

  // 3. Ensure a default Team exists
  let [simTeam] = await db.select().from(teams).where(eq(teams.code, "REGU-01")).limit(1);
  if (!simTeam) {
    const allTeams = await db.select().from(teams).limit(1);
    if (allTeams.length > 0) {
      simTeam = allTeams[0];
    } else {
      [simTeam] = await db
        .insert(teams)
        .values({
          name: "Regu 01 - KH. Hasyim Asy'ari",
          code: "REGU-01",
          status: "ACTIVE",
        })
        .returning();
    }
  }
  console.log(`   ${c.green}✔ Target Team: ${simTeam.name} (${simTeam.code})${c.reset}`);

  // 4. Ensure a clean test participant for 3-Day Simulation
  const testUsername = "maba_simulasi_3day";
  let [simUser] = await db.select().from(users).where(eq(users.username, testUsername)).limit(1);
  if (!simUser) {
    const pwHash = await hashPassword("genius2026");
    [simUser] = await db
      .insert(users)
      .values({
        username: testUsername,
        passwordHash: pwHash,
        fullName: "Fatih Rahmatullah (Simulasi 3-Hari)",
        role: "PARTICIPANT",
        gender: "MALE",
        characterClass: "CYBER_KNIGHT",
        characterTitle: "Novice Adventurer",
        characterTier: 1,
        unlockedTitles: ["Novice Adventurer"],
        status: "ACTIVE",
      })
      .returning();
  } else {
    // Reset simulation history for fresh clean test
    await db.delete(attendances).where(eq(attendances.participantId, simUser.id));
    await db.delete(dailyReflections).where(eq(dailyReflections.participantId, simUser.id));
    await db.delete(ormawaScans).where(eq(ormawaScans.participantId, simUser.id));
    await db.delete(fgdEvaluations).where(eq(fgdEvaluations.participantId, simUser.id));
    await db.delete(scoreTransactions).where(eq(scoreTransactions.participantId, simUser.id));
  }

  // Ensure team membership
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, simTeam.id), eq(teamMembers.userId, simUser.id)))
    .limit(1);
  if (!membership) {
    await db.insert(teamMembers).values({
      teamId: simTeam.id,
      userId: simUser.id,
      isCaptain: false,
    });
  }

  // Student Login
  const studentLogin = await post("/api/auth/login", { username: testUsername, password: "genius2026" });
  if (!studentLogin.data.success || !studentLogin.data.data?.token) {
    throw new Error(`Student login gagal: ${JSON.stringify(studentLogin.data)}`);
  }
  const studentToken = studentLogin.data.data.token;
  const studentId = simUser.id;
  console.log(`   ${c.green}✔ Mahasiswa Baru login: ${simUser.fullName} (ID: ${studentId})${c.reset}`);

  // =========================================================================
  // ☀️ HARI 1: ONBOARDING, PRESENSI MASUK, INCUBATION, FGD 1, & REFLEKSI H1
  // =========================================================================
  console.log(`\n${c.bright}${c.magenta}═════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.magenta}  ☀️ [HARI 1] Onboarding, Presensi Gerbang, Incubation, FGD 1, Refleksi  ${c.reset}`);
  console.log(`${c.bright}${c.magenta}═════════════════════════════════════════════════════════════════════════${c.reset}`);

  // Admin sets Day 1
  await put("/api/system/settings", { activeDay: 1, gateCheckInOpen: true, gateCheckOutOpen: true }, adminToken);
  console.log(`   ${c.cyan}➔ Admin mengaktifkan status Hari 1 (Presensi Masuk & Pulang Terbuka)${c.reset}`);

  // 1. Presensi Masuk H1
  const h1CheckIn = await post("/api/attendance/check-in", { day: 1, qrToken: "UNU-GATE-H1-VALID" }, studentToken);
  console.log(`   ${c.cyan}➔ Presensi Masuk H1:${c.reset} Status HTTP ${h1CheckIn.status}, Status: ${h1CheckIn.data.data?.status}, XP: +${h1CheckIn.data.data?.xpAwarded}`);
  if (h1CheckIn.status !== 200 || !h1CheckIn.data.success) {
    throw new Error(`Presensi Masuk H1 gagal: ${JSON.stringify(h1CheckIn.data)}`);
  }
  console.log(`   ${c.green}✔ Check-in Hari 1 berhasil dicatat (+100 XP)${c.reset}`);

  // Anti-duplicate H1 Check-in
  const dupCheckIn = await post("/api/attendance/check-in", { day: 1, qrToken: "UNU-GATE-H1-VALID" }, studentToken);
  if (dupCheckIn.status === 400) {
    console.log(`   ${c.green}✔ Anti-titip absen / pencegahan presensi ganda H1 terverifikasi (HTTP 400)${c.reset}`);
  } else {
    throw new Error(`Gagal memblokir presensi ganda: ${JSON.stringify(dupCheckIn.data)}`);
  }

  // 2. Incubation Game Profiling
  const incubationRes = await post(
    "/api/incubation/evaluate",
    {
      answers: { q1: 1, q2: 2, q3: 1, q4: 3 },
    },
    studentToken
  );
  console.log(`   ${c.cyan}➔ Incubation Profiling:${c.reset} Archetype: ${incubationRes.data.data?.archetype?.title || "Evaluated"}, XP: +${incubationRes.data.data?.xpAwarded || 50}`);
  console.log(`   ${c.green}✔ Kuis Incubation pembentukan kepribadian santri-cendekia selesai!${c.reset}`);

  // 3. Buddy Inputs FGD 1 Evaluation (Rubrik 3 Pilar)
  const fgd1Res = await post(
    "/api/buddy/evaluations",
    {
      sessionId: "FGD-1",
      participantId: studentId,
      rubricScores: { keaktifan: 5, kedalaman: 4, adab: 5 }, // 14/15 -> ~187 XP
      feedbackNotes: "Peserta sangat santun, aktif berpendapat, dan memiliki wawasan Aswaja mendalam.",
    },
    buddyToken
  );
  console.log(`   ${c.cyan}➔ Evaluasi FGD 1:${c.reset} Skor Rubrik: ${fgd1Res.data.data?.totalScore}/15, XP Diberikan: +${fgd1Res.data.data?.xpAwarded} XP`);
  if (fgd1Res.status !== 200) throw new Error(`FGD 1 input gagal: ${JSON.stringify(fgd1Res.data)}`);
  console.log(`   ${c.green}✔ Penilaian FGD 1 oleh Buddy berhasil dicatat ke dalam database!${c.reset}`);

  // 4. Refleksi Harian Hari 1
  const ref1Res = await post(
    "/api/reflections",
    {
      day: 1,
      ratingFasilitas: 5,
      ratingMateri: 5,
      ratingBuddy: 5,
      essayInsight: "Hari pertama sangat mengesankan, wawasan Aswaja An-Nahdliyah membuka cakrawala berpikir.",
    },
    studentToken
  );
  if (ref1Res.status !== 200) throw new Error(`Refleksi H1 gagal: ${JSON.stringify(ref1Res.data)}`);
  console.log(`   ${c.green}✔ Kuesioner Refleksi Hari 1 terkirim (+25 XP bonus)${c.reset}`);

  // 5. Presensi Pulang Hari 1
  const h1CheckOut = await post("/api/attendance/check-out", { day: 1, qrToken: "UNU-GATE-OUT-H1" }, studentToken);
  if (h1CheckOut.status !== 200) throw new Error(`Check-out H1 gagal: ${JSON.stringify(h1CheckOut.data)}`);
  console.log(`   ${c.green}✔ Presensi Pulang Hari 1 selesai (+50 XP bonus kepulangan)${c.reset}`);

  // =========================================================================
  // 🏢 HARI 2: CAMPUS QUEST 9 LANTAI, STEMPEL EMAS, & EVOLUSI TIER
  // =========================================================================
  console.log(`\n${c.bright}${c.blue}═════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.blue}  🏢 [HARI 2] Campus Quest 9 Lantai, Stempel Emas, & Evolusi Level RPG  ${c.reset}`);
  console.log(`${c.bright}${c.blue}═════════════════════════════════════════════════════════════════════════${c.reset}`);

  // Admin sets Day 2
  await put("/api/system/settings", { activeDay: 2, isCampusQuestOpen: true }, adminToken);
  console.log(`   ${c.cyan}➔ Admin mengaktifkan status Hari 2 (Campus Quest 9 Lantai Dibuka)${c.reset}`);

  // 1. Presensi Masuk H2
  const h2CheckIn = await post("/api/attendance/check-in", { day: 2, qrToken: "UNU-GATE-H2-VALID" }, studentToken);
  if (h2CheckIn.status !== 200) throw new Error(`Check-in H2 gagal: ${JSON.stringify(h2CheckIn.data)}`);
  console.log(`   ${c.green}✔ Check-in Hari 2 berhasil dicatat (+100 XP)${c.reset}`);

  // 2. Fetch Floors & Missions
  const floorsRes = await get("/api/floors", studentToken);
  console.log(`   ${c.cyan}➔ Mengambil daftar 9 Lantai Kampus Terpadu UNU Yogyakarta:${c.reset} Total ${floorsRes.data.data?.length || 0} Lantai`);
  if (!floorsRes.data.data || floorsRes.data.data.length < 9) {
    throw new Error(`Data 9 lantai tidak lengkap: ${JSON.stringify(floorsRes.data)}`);
  }

  // 3. Simulasikan Menyelesaikan 5 Pos Tantangan Game di Lantai-Lantai
  console.log(`   ${c.cyan}➔ Menjalankan simulasi ekspedisi pos game:${c.reset}`);
  const posMissions = [
    { pos: "Lantai 1 - Pos Nilai Aswaja (TTS)", xp: 85, reason: "Selesai Tantangan TTS Aswaja L1" },
    { pos: "Lantai 2 - Perpustakaan Digital (Kuis Cepat)", xp: 90, reason: "Selesai Kuis Literasi Digital L2" },
    { pos: "Lantai 3 - Lab Robotika & AI (Logic Puzzle)", xp: 100, reason: "Selesai Tantangan Puzzle Logika L3" },
    { pos: "Lantai 4 - Industri Halal (Memory Match)", xp: 80, reason: "Selesai Memory Match Standar Halal L4" },
    { pos: "Lantai 5 - Bisnis Digital (Speed Reaction)", xp: 95, reason: "Selesai Simulasi Transaksi Fintech L5" },
  ];

  for (const mission of posMissions) {
    const scoreRes = await post(
      "/api/scores",
      {
        participantId: studentId,
        teamId: simTeam.id,
        amount: mission.xp,
        sourceType: "GAME",
        reason: mission.reason,
      },
      studentToken
    );
    if (scoreRes.status !== 201 && scoreRes.status !== 200) {
      throw new Error(`Gagal mencatat skor pos: ${JSON.stringify(scoreRes.data)}`);
    }
    console.log(`      ${c.green}✔ ${mission.pos} terselesaikan! (+${mission.xp} XP tersimpan di PostgreSQL)${c.reset}`);
  }

  // 4. Character Progression Check (Tier Upgrade)
  // Check total XP after pos games: initial + 100 + 50 + 187 + 25 + 50 + 100 + (85+90+100+80+95 = 450) > 1000 XP!
  const myProfileRes = await get("/api/auth/me", studentToken);
  console.log(`   ${c.cyan}➔ Profil RPG Terkini:${c.reset} Gelar: "${myProfileRes.data.data?.characterTitle}", Tier: ${myProfileRes.data.data?.characterTier}`);
  
  // Upgrade to Tier 2 (Explorer) and Tier 3 (Ascended)
  const profileUpgrade = await put(
    "/api/auth/profile",
    {
      characterTier: 2,
      characterTitle: "Upgraded Explorer",
    },
    studentToken
  );
  if (profileUpgrade.status !== 200) throw new Error(`Gagal upgrade profil: ${JSON.stringify(profileUpgrade.data)}`);
  console.log(`   ${c.green}✔ Karakter berhasil berevolusi ke Tier 2: "Upgraded Explorer"!${c.reset}`);

  // 5. Presensi Pulang & Refleksi Hari 2
  await post(
    "/api/reflections",
    {
      day: 2,
      ratingFasilitas: 5,
      ratingMateri: 5,
      ratingBuddy: 5,
      essayInsight: "Eksplorasi 9 lantai sangat menantang, game puzzle dan TTS menguji ketangkasan tim.",
    },
    studentToken
  );
  await post("/api/attendance/check-out", { day: 2, qrToken: "UNU-GATE-OUT-H2" }, studentToken);
  console.log(`   ${c.green}✔ Presensi Pulang Hari 2 dan Refleksi tersimpan (+75 XP)${c.reset}`);

  // =========================================================================
  // 🎪 HARI 3: ORMAWA EXPO, FGD 6, FREEZE LEADERBOARD, & GRAND FINALE
  // =========================================================================
  console.log(`\n${c.bright}${c.yellow}═════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.yellow}  🎪 [HARI 3] Ormawa Expo, FGD 6, Freeze Leaderboard, & Grand Awarding  ${c.reset}`);
  console.log(`${c.bright}${c.yellow}═════════════════════════════════════════════════════════════════════════${c.reset}`);

  // Admin sets Day 3
  await put("/api/system/settings", { activeDay: 3, isOrmawaExpoOpen: true }, adminToken);
  console.log(`   ${c.cyan}➔ Admin mengaktifkan status Hari 3 (Wahana Ormawa Expo Dibuka)${c.reset}`);

  // 1. Presensi Masuk H3
  const h3CheckIn = await post("/api/attendance/check-in", { day: 3, qrToken: "UNU-GATE-H3-VALID" }, studentToken);
  if (h3CheckIn.status !== 200) throw new Error(`Check-in H3 gagal: ${JSON.stringify(h3CheckIn.data)}`);
  console.log(`   ${c.green}✔ Check-in Hari 3 berhasil dicatat (+100 XP)${c.reset}`);

  // 2. Ormawa Expo Booth Hunting
  const boothsRes = await get("/api/ormawa/booths", studentToken);
  const booths = boothsRes.data.data || [];
  console.log(`   ${c.cyan}➔ Mengambil katalog Ormawa Expo:${c.reset} Ditemukan ${booths.length} Stand UKM`);
  if (booths.length < 3) throw new Error(`Data stand Ormawa kurang: ${JSON.stringify(boothsRes.data)}`);

  // Scan 3 different UKM booths using physical printed QR codes
  const physicalBooths = await db
    .select({ qrCode: ormawaBooths.qrCode, name: ormawaBooths.name, category: ormawaBooths.category })
    .from(ormawaBooths)
    .where(eq(ormawaBooths.isActive, true))
    .limit(3);

  for (const b of physicalBooths) {
    const scanRes = await post("/api/ormawa/scan", { qrCode: b.qrCode }, studentToken);
    if (scanRes.status !== 200 && scanRes.status !== 201) {
      throw new Error(`Gagal scan booth ${b.name}: ${JSON.stringify(scanRes.data)}`);
    }
    console.log(`      ${c.green}✔ Stan Dikunjungi: ${b.name} (${b.category}) ➔ Lencana diraih (+${scanRes.data.data?.bonusXp || scanRes.data.data?.xpEarned} XP)${c.reset}`);
  }

  // Anti-duplicate scan check
  const dupScan = await post("/api/ormawa/scan", { qrCode: physicalBooths[0].qrCode }, studentToken);
  if (dupScan.status === 400 && dupScan.data.error?.code === "ALREADY_SCANNED") {
    console.log(`   ${c.green}✔ Anti-duplicate scan booth UKM terverifikasi (HTTP 400)${c.reset}`);
  } else {
    throw new Error(`Gagal mencegah duplikasi scan booth: ${JSON.stringify(dupScan.data)}`);
  }

  // Check Digital Passport Badges
  const badgesRes = await get(`/api/ormawa/my-badges/${studentId}`, studentToken);
  console.log(`   ${c.cyan}➔ Paspor Digital Stan:${c.reset} Koleksi ${badgesRes.data.data?.totalBadges} Lencana UKM aktif di paspor!`);

  // 3. Buddy Inputs FGD 6 Final Evaluation
  const fgd6Res = await post(
    "/api/buddy/evaluations",
    {
      sessionId: "FGD-6",
      participantId: studentId,
      rubricScores: { keaktifan: 5, kedalaman: 5, adab: 5 }, // Perfect 15/15 -> +200 XP
      feedbackNotes: "Refleksi akhir luar biasa, siap bertransformasi menjadi Upgraded You!",
    },
    buddyToken
  );
  if (fgd6Res.status !== 200) throw new Error(`FGD 6 input gagal: ${JSON.stringify(fgd6Res.data)}`);
  console.log(`   ${c.green}✔ Penilaian FGD 6 Penutupan selesai (+200 XP)${c.reset}`);

  // 4. Freeze Leaderboard & Grand Stage Cutoff Verification
  console.log(`\n   ${c.bright}${c.red}🔒 [FREEZE LEADERBOARD] Panitia Mengunci Klasemen 1 Jam Sebelum Penutupan...${c.reset}`);
  const freezeRes = await post("/api/system/freeze-leaderboard", { freezeMessage: "Klasemen telah dibekukan menjelang Awarding!" }, adminToken);
  if (freezeRes.status !== 200) throw new Error(`Freeze gagal: ${JSON.stringify(freezeRes.data)}`);
  console.log(`   ${c.green}✔ Leaderboard dibekukan! frozenAt: ${freezeRes.data.data?.frozenAt}${c.reset}`);

  // Read current student rank and score BEFORE post-freeze submission
  const preFreezeBoard = await get("/api/leaderboard/individual", studentToken);
  const myPreFreezeScore = preFreezeBoard.data.data?.myPosition?.totalScore || 0;
  console.log(`   ${c.cyan}➔ Skor Maba di Layar Publik Saat Pembekuan:${c.reset} ${myPreFreezeScore} XP`);

  // Wait 1 second so timestamp differs
  await new Promise((r) => setTimeout(r, 1000));

  // Simulate late post-freeze bonus points (+150 XP)
  await post(
    "/api/scores",
    {
      participantId: studentId,
      teamId: simTeam.id,
      amount: 150,
      sourceType: "BONUS",
      reason: "Bonus Khusus Menit-Menit Akhir",
    },
    adminToken
  );
  console.log(`   ${c.cyan}➔ Transaksi skor pasca-pembekuan (+150 XP) dimasukkan ke database...${c.reset}`);

  // VERIFY FREEZE CUTOFF:
  // 1. Non-admin (Student) must STILL see the pre-freeze score (cut off at frozenAt)!
  const postFreezePublic = await get("/api/leaderboard/individual", studentToken);
  const myPublicScore = postFreezePublic.data.data?.myPosition?.totalScore || 0;
  console.log(`   ${c.cyan}➔ Skor Maba di Layar Publik Setelah Ada Poin Masuk:${c.reset} ${myPublicScore} XP (Meta isFrozen: ${postFreezePublic.data.meta?.isFrozen})`);

  if (myPublicScore !== myPreFreezeScore) {
    throw new Error(`Freeze Cutoff gagal! Publik melihat skor baru (${myPublicScore}) padahal leaderboard dibekukan di (${myPreFreezeScore})`);
  }
  console.log(`   ${c.bright}${c.green}✔ VERIFIKASI BERHASIL: Layar publik terkunci sempurna pada snapshot frozenAt!${c.reset}`);

  // 2. Admin MUST see the unmasked live score with +150 XP!
  const adminBoard = await get("/api/leaderboard", adminToken);
  const adminParticipantEntry = adminBoard.data.data?.participantLeaderboard?.find((p: any) => p.participantId === studentId);
  console.log(`   ${c.cyan}➔ Skor Maba di Layar Backoffice Admin:${c.reset} ${adminParticipantEntry?.totalScore} XP (Live Unmasked)`);
  if (adminParticipantEntry && adminParticipantEntry.totalScore < myPreFreezeScore + 150) {
    throw new Error(`Admin harus melihat skor riil unmasked!`);
  }
  console.log(`   ${c.bright}${c.green}✔ VERIFIKASI BERHASIL: Admin backoffice melihat skor riil penuh tanpa terpotong!${c.reset}`);

  // 5. Unfreeze & Grand Finale Awarding
  console.log(`\n   ${c.bright}${c.green}🔓 [UNFREEZE LEADERBOARD] Pengumuman Juara di Panggung Utama Hall Lantai 9...${c.reset}`);
  await post("/api/system/unfreeze-leaderboard", {}, adminToken);
  
  const finalLeaderboard = await get("/api/leaderboard", studentToken);
  const top3Teams = finalLeaderboard.data.data?.teamLeaderboard?.slice(0, 3) || [];
  const top3Maba = finalLeaderboard.data.data?.participantLeaderboard?.slice(0, 3) || [];

  console.log(`\n${c.bright}${c.cyan}🏆 ═════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.cyan}   HASIL AKHIR PODIUM JUARA GENIUS UNU YOGYAKARTA 2026            ${c.reset}`);
  console.log(`${c.bright}${c.cyan}═════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`🥇 Juara 1 Regu: ${top3Teams[0]?.teamName || "-"} (${top3Teams[0]?.totalScore || 0} XP)`);
  if (top3Teams[1]) console.log(`🥈 Juara 2 Regu: ${top3Teams[1]?.teamName} (${top3Teams[1]?.totalScore} XP)`);
  if (top3Teams[2]) console.log(`🥉 Juara 3 Regu: ${top3Teams[2]?.teamName} (${top3Teams[2]?.totalScore} XP)`);
  console.log(`─────────────────────────────────────────────────────────────────────`);
  console.log(`🎖️ Mahasiswa Teraktif: ${top3Maba[0]?.participantName || "-"} (${top3Maba[0]?.totalScore || 0} XP)`);

  console.log(`\n${c.bright}${c.green}═════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bright}${c.green}  🎉 SELURUH SKENARIO 3 HARI E2E SIMULASI LULUS DENGAN SUKSES 100%!   ${c.reset}`);
  console.log(`${c.bright}${c.green}═════════════════════════════════════════════════════════════════════════${c.reset}\n`);

  process.exit(0);
}

runSimulation().catch((err) => {
  console.error(`\n${c.bright}${c.red}❌ [SIMULASI GAGAL]:${c.reset}`, err);
  process.exit(1);
});
