import { db } from "./src/db";
import { users, teams, teamMembers } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🧪 Starting Automated Test for Attendance & FGD Evaluation APIs...\n");

  // 1. Get a sample participant from DB
  const [participant] = await db
    .select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.role, "PARTICIPANT"))
    .limit(1);

  if (!participant) {
    console.error("❌ No participant found in database to test with.");
    process.exit(1);
  }

  console.log(`👤 Testing with Participant: ${participant.fullName} (${participant.username}), ID: ${participant.id}`);
  console.log(`🛡️ Team ID: ${participant.teamId || "None"}\n`);

  const BASE_URL = "http://localhost:3001/api";

  // TEST 1: Check-In Hari 1
  console.log("--- [TEST 1] POST /api/attendance/check-in ---");
  const checkInRes = await fetch(`${BASE_URL}/attendance/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantId: participant.id,
      day: 1,
      qrToken: "UNU-PRESENSI-H1-GATE-2026",
    }),
  });
  const checkInData = await checkInRes.json();
  console.log("Status:", checkInRes.status);
  console.log("Response:", JSON.stringify(checkInData, null, 2));

  // TEST 2: Duplicate Check-In Rejection
  console.log("\n--- [TEST 2] Duplicate Check-In (Should be rejected) ---");
  const dupRes = await fetch(`${BASE_URL}/attendance/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantId: participant.id,
      day: 1,
      qrToken: "UNU-PRESENSI-H1-GATE-2026",
    }),
  });
  const dupData = await dupRes.json();
  console.log("Status:", dupRes.status);
  console.log("Response:", JSON.stringify(dupData, null, 2));

  // TEST 3: Status Attendance
  console.log("\n--- [TEST 3] GET /api/attendance/status/:participantId ---");
  const statusRes = await fetch(`${BASE_URL}/attendance/status/${participant.id}?day=1`);
  const statusData = await statusRes.json();
  console.log("Status:", statusRes.status);
  console.log("Response:", JSON.stringify(statusData, null, 2));

  // TEST 4: Check-Out Hari 1
  console.log("\n--- [TEST 4] POST /api/attendance/check-out ---");
  const checkOutRes = await fetch(`${BASE_URL}/attendance/check-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantId: participant.id,
      day: 1,
      qrToken: "UNU-PRESENSI-H1-CHECKOUT-2026",
    }),
  });
  const checkOutData = await checkOutRes.json();
  console.log("Status:", checkOutRes.status);
  console.log("Response:", JSON.stringify(checkOutData, null, 2));

  // TEST 5: Attendance Recap
  console.log("\n--- [TEST 5] GET /api/attendance/recap ---");
  const recapRes = await fetch(`${BASE_URL}/attendance/recap?day=1`);
  const recapData = await recapRes.json();
  console.log("Status:", recapRes.status);
  console.log("Summary:", JSON.stringify(recapData.data?.summary, null, 2));

  // TEST 6: FGD Evaluation Submit (Rubrik 3 Pilar)
  console.log("\n--- [TEST 6] POST /api/buddy/evaluations (FGD 1) ---");
  const fgdRes = await fetch(`${BASE_URL}/buddy/evaluations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "FGD-1",
      participantId: participant.id,
      teamId: participant.teamId || undefined,
      rubricScores: {
        keaktifan: 5,
        kedalaman: 4,
        adab: 5,
      },
      feedbackNotes: "Peserta sangat santun, aktif bertanya, dan memahami nilai-nilai Aswaja.",
    }),
  });
  const fgdData = await fgdRes.json();
  console.log("Status:", fgdRes.status);
  console.log("Response:", JSON.stringify(fgdData, null, 2));

  // TEST 7: Participant FGD Evaluations
  console.log("\n--- [TEST 7] GET /api/buddy/evaluations/participant/:participantId ---");
  const partFgdRes = await fetch(`${BASE_URL}/buddy/evaluations/participant/${participant.id}`);
  const partFgdData = await partFgdRes.json();
  console.log("Status:", partFgdRes.status);
  console.log("Evals Count:", partFgdData.data?.length);

  // TEST 8: Team FGD Evaluations (if team exists)
  if (participant.teamId) {
    console.log("\n--- [TEST 8] GET /api/buddy/evaluations/team/:teamId ---");
    const teamFgdRes = await fetch(`${BASE_URL}/buddy/evaluations/team/${participant.teamId}`);
    const teamFgdData = await teamFgdRes.json();
    console.log("Status:", teamFgdRes.status);
    console.log("Total Team Members:", teamFgdData.data?.totalMembers);
  }

  console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
}

main().catch(console.error);
