import { db } from "../db";
import { users, scoreTransactions } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export const DRAWING_SENTENCES: string[] = [
  "Presiden naik kuda melompati pelangi",
  "Kuda minum es cekek di pinggir lapangan",
  "Robot sedang belajar membatik kain halus",
  "Kucing memakai kacamata hitam di laboratorium kimia",
  "Ayam jantan main gitar listrik di panggung konser",
  "Astronaut jualan bakso bakar di luar angkasa",
  "Naga makan pizza super pedas sambil menangis",
  "Bebek pake jas hujan naik motor vespa",
  "Dinosaurus sedang webinar Zoom di laptop",
  "Paus biru terbang menggunakan balon udara",
  "Gajah main skateboard di atas gedung bertingkat",
  "Alien jualan es dawet di pasar tradisional",
  "Jerapah main selancar air di ombak besar",
  "Kura-kura lari maraton memakai sepatu roda",
  "Penguin jualan martabak telur malam hari",
  "Monyet jadi DJ sambil putar piringan hitam",
  "Kancil main catur melawan komputer super",
  "Zebra belanja baju batik di toko busana",
  "Harimau belajar merajut syal warna-warni",
  "Panda makan mie ayam pake sumpit raksasa",
  "Singa pangkas rambut gaya mohawk di salon",
  "Unta main ice skating di lapangan es",
  "Serigala bernyanyi opera di bawah bulan purnama",
  "Lumba-lumba main basket cetak slam dunk",
  "Kupu-kupu raksasa angkut bus sekolah",
  "Sapi potong rumput pakaikan mesin pemotong modern",
  "Kambing main drum di band rock papan atas",
  "Beruang kutub minum kopi hangat di cafe kekinian",
  "Tikus canggih meretas komputer server utama",
  "Semut gotong royong angkat kue ulang tahun raksasa",
  "Kura-kura ninja jualan gorengan hangat",
  "Burung hantu baca koran pake kacamata minus",
  "Gorila main piano klasik lagu Beethoven",
  "Cheetah naik sepeda ontel tua bawa keranjang",
  "Tupai simpan emas batangan dalam lubang pohon",
  "Katak menyelam di laut dalam bawa senter",
  "Kancil pake helm bawa motor balap Moto GP",
  "Hamster lari di roda putar sambil ketik skripsi",
  "Burung cendrawasih menari tari kecak Bali",
  "Komodo berkemah di tenda sambil bakar jagung"
];

/** Get a random drawing prompt sentence */
export function getRandomDrawingSentence(participantIndex: number = 0): string {
  const index = Math.floor(Math.random() * DRAWING_SENTENCES.length);
  return DRAWING_SENTENCES[(index + participantIndex) % DRAWING_SENTENCES.length];
}

export interface AIEvaluationResult {
  score: number;
  feedback: string;
  titles: string[];
}

import { aiGateway } from "../lib/aiGateway";

/** Evaluate WebP drawing using Gemini Vision API via aiGateway with Senior Art Curator Persona */
export async function evaluateDrawingWithAI(
  promptSentence: string,
  webpBase64Data: string
): Promise<AIEvaluationResult> {
  // Clean base64 string if data URL prefix exists
  const cleanBase64 = webpBase64Data.replace(/^data:image\/(webp|png|jpeg);base64,/, "");

  if (process.env.NODE_ENV !== "test" && cleanBase64.length > 50) {
    try {
      const systemInstruction = `Kamu adalah seorang Kurator Seni Senior kelas dunia yang sangat berpendidikan, paham estetika tinggi, santai, ramah, namun memiliki ciri khas SELALU MENSARKAS SECARA INTELEKTUAL DAN MENDIDIK.

Tugasmu:
Evaluasi gambar kanvas (format WebP) hasil lukisan peserta berdasarkan kalimat prompt berikut: "${promptSentence}".

ATURAN WAJIB (STRICT SAFETY):
- DILARANG KERAS menggunakan kata-kata kotor, makian, kasar, atau merendahkan martabat (Strictly zero profanity/vulgarity).
- Sarkasme harus berupa humor cerdas & apresiasi estetik atas interpretasi visual peserta.

Output WAJIB berupa JSON murni tanpa markdown (\`\`\`json):
{
  "score": number (0-100 berdasarkan kreativitas, kemiripan konsep dengan prompt, dan niat menggambar),
  "feedback": "Tulis ulasan 2-3 paragraf terpisah (pisahkan tiap paragraf dengan \\n\\n) bernuansa kurator seni sarkastik, cerdas, santai, dan mendidik...",
  "titles": ["Gelar Lucu/Unik 1", "Gelar Lucu/Unik 2"]
}`;

      const aiRes = await aiGateway.execute({
        prompt: `Evaluasi lukisan kanvas untuk prompt: "${promptSentence}".`,
        systemPrompt: systemInstruction,
        jsonMode: true,
        imageBase64: cleanBase64,
        mimeType: "image/webp",
        preferredModel: "gemini-2.0-flash",
        cacheTtlMinutes: 180, // Cache for 3 hours
      });

      const parsed = aiRes.parsedJson || aiGateway.extractJson(aiRes.text);
      if (parsed) {
        return {
          score: Math.min(100, Math.max(0, Number(parsed.score) || 75)),
          feedback: String(parsed.feedback || "Sebuah karya yang sangat berani menantang estetika konvensional.").trim(),
          titles: Array.isArray(parsed.titles) && parsed.titles.length > 0
            ? parsed.titles.map(String)
            : ["Maestro Garis Abstrak"]
        };
      }
    } catch (err: any) {
      console.warn("[AI Drawing] Gateway call error, falling back to local curator:", err.message);
    }
  }

  // Fallback Curator Engine when API key is missing, busy, or offline
  const randomScore = Math.floor(Math.random() * 21) + 75; // 75 - 95
  const fallbackFeedbacks = [
    `Sungguh karya yang melampaui zaman! Meskipun proporsinya agak melawan hukum fisika, keberanianmu memvisualisasikan "${promptSentence}" patut diacungi jempol.\n\nKomposisi garisnya menyiratkan determinasi tinggi seorang pelukis yang berkejaran dengan waktu. Pertahankan orisinalitas ini di masa depan!`,
    `Hmm, sebuah guratan garis yang penuh dengan kontemplasi eksistensial. Memang tidak mirip Picasso, tapi interpretasi kamu untuk "${promptSentence}" sangat berkarakter!\n\nEstetika minimalis yang kamu tampilkan memberi ruang luas bagi penikmat seni untuk berimajinasi. Sangat berjiwa bebas!`,
    `Gaya visualnya sangat avant-garde! Komposisi warna dan bentuknya membuat saya berpikir dua kali apakah ini karya seni kontemporer atau coretan penuh inspirasi.\n\nBagus sekali, kamu berhasil menyampaikan esensi ide dengan cara yang unik dan tak terduga.`
  ];
  const fallbackTitles = [
    ["Maestro Line Art", "Pelukis Surealis"],
    ["Pelukis Komposisi Abstrak", "Kolektor Garis Liar"],
    ["Kreator Visual Ekspresif", "Legenda Canvas Pixel"]
  ];

  const feedback = fallbackFeedbacks[Math.floor(Math.random() * fallbackFeedbacks.length)];
  const titles = fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];

  return {
    score: randomScore,
    feedback,
    titles
  };
}

/** Save result, award titles, and add score transaction */
export async function saveAIDrawingResult(params: {
  userId?: string;
  teamId?: string;
  gameSessionId?: string;
  result: AIEvaluationResult;
}): Promise<{ newTitles: string[]; currentUnlockedTitles: string[] }> {
  const { userId, teamId, result } = params;

  // Validate UUID for guest testing
  const isValidUuid = typeof userId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  if (!isValidUuid) {
    return {
      newTitles: result.titles,
      currentUnlockedTitles: ["Novice Adventurer", ...result.titles]
    };
  }

  try {
    // 1. Get current user titles
    const [user] = await db
      .select({ unlockedTitles: users.unlockedTitles })
      .from(users)
      .where(eq(users.id, userId!))
      .limit(1);

    const existingTitles: string[] = user?.unlockedTitles || ["Novice Adventurer"];
    const newUniqueTitles = result.titles.filter((t) => !existingTitles.includes(t));
    const updatedTitles = [...existingTitles, ...newUniqueTitles];

    // 2. Update user unlockedTitles in DB
    await db
      .update(users)
      .set({
        unlockedTitles: updatedTitles,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId!));

    // 3. Insert score transaction for accumulation
    const isValidTeamUuid = typeof teamId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teamId);

    if (result.score > 0 && isValidTeamUuid) {
      await db.insert(scoreTransactions).values({
        participantId: userId!,
        teamId: teamId!,
        amount: result.score,
        sourceType: "GAME",
        reason: `AI Canvas Drawing Evaluation: ${result.feedback.slice(0, 80)}...`
      });
    }

    return {
      newTitles: newUniqueTitles,
      currentUnlockedTitles: updatedTitles
    };
  } catch (err) {
    console.warn("[AI Drawing] DB save warning:", err);
    return {
      newTitles: result.titles,
      currentUnlockedTitles: ["Novice Adventurer", ...result.titles]
    };
  }
}
