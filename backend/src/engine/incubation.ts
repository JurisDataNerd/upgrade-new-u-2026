import { db } from "../db";
import { users, scoreTransactions, gameSessions } from "../db/schema";
import { eq } from "drizzle-orm";

export interface IncubationQuestion {
  id: number;
  category: "PSYCHOLOGY" | "LOGIC" | "ROADMAP" | "TEAM_DYNAMICS";
  scenario: string;
  options: Array<{
    text: string;
    traitWeights: {
      logicalReasoning?: number;
      creativeInnovation?: number;
      leadershipInfluence?: number;
      socialEmpathy?: number;
      gritAdaptability?: number;
    };
  }>;
}

export const INCUBATION_QUESTIONS: IncubationQuestion[] = [
  // --- Bagian 1: Psikologis & Pengambilan Keputusan ---
  {
    id: 1,
    category: "PSYCHOLOGY",
    scenario: "Memasuki semester 3, kamu punya waktu luang 20 jam per minggu di luar jam kuliah. Opsi mana yang kamu pilih untuk investasi diri?",
    options: [
      { text: "Bergabung di laboratorium riset bersama dosen untuk publikasi jurnal ilmiah.", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "Membangun rintisan startup digital bersama teman untuk kompetisi hibah bisnis.", traitWeights: { creativeInnovation: 25, leadershipInfluence: 15 } },
      { text: "Menjadi pengurus inti BEM/Himpunan untuk memperluas jaringan dan kepemimpinan.", traitWeights: { leadershipInfluence: 25, socialEmpathy: 15 } },
      { text: "Mengambil sertifikasi profesional industri mandiri dan memperdalam portofolio teknis.", traitWeights: { logicalReasoning: 20, gritAdaptability: 20 } }
    ]
  },
  {
    id: 2,
    category: "PSYCHOLOGY",
    scenario: "Dalam tugas kelompok bernilai 40% dari nilai akhir, ada 1 anggota yang sama sekali tidak berkontribusi hingga H-2 deadline. Sikapmu:",
    options: [
      { text: "Membagi ulang tugasnya secara sistematis ke anggota yang aktif, lalu mencoret namanya dari lembar tugas.", traitWeights: { logicalReasoning: 20, leadershipInfluence: 15 } },
      { text: "Mengajaknya berbicara empat mata dari hati ke hati untuk mencari tahu kendalanya dan memberi tugas yang sesuai.", traitWeights: { socialEmpathy: 25, leadershipInfluence: 10 } },
      { text: "Mengambil alih seluruh sisa pekerjaannya sendiri demi memastikan kualitas tugas sempurna.", traitWeights: { gritAdaptability: 25, logicalReasoning: 10 } },
      { text: "Menjadikan situasi ini bahan evaluasi kelompok untuk menetapkan aturan kesepakatan tim yang lebih ketat.", traitWeights: { leadershipInfluence: 20, creativeInnovation: 15 } }
    ]
  },
  {
    id: 3,
    category: "PSYCHOLOGY",
    scenario: "Pekan UTS bersamaan dengan deadline proposal organisasi dan tugas besar. Kamu merasa sangat kewalahan (burnout). Apa langkah pertamamu?",
    options: [
      { text: "Membuat matriks prioritas Eisenhower (Mendesak vs Penting) dan mendelegasikan tugas non-kritis.", traitWeights: { logicalReasoning: 25, leadershipInfluence: 10 } },
      { text: "Mengambil jeda istirahat penuh selama 3 jam untuk menenangkan pikiran sebelum menyusun strategi.", traitWeights: { gritAdaptability: 20, socialEmpathy: 15 } },
      { text: "Meminta bantuan rekan tim dan berdiskusi terbuka tentang beban yang sedang dihadapi.", traitWeights: { socialEmpathy: 25, leadershipInfluence: 10 } },
      { text: "Menggandakan fokus dengan begadang teratur sampai seluruh tanggung jawab selesai satu per satu.", traitWeights: { gritAdaptability: 25 } }
    ]
  },
  {
    id: 4,
    category: "PSYCHOLOGY",
    scenario: "Ide proyek yang kamu banggakan dikritik habis-habisan oleh dosen pembimbing di depan kelas karena dinilai tidak realistis. Responmu:",
    options: [
      { text: "Mencatat seluruh poin kritik secara objektif untuk mencari data pendukung baru yang membuktikan kelayakan.", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "Langsung meminta saran alternatif dari dosen dan segera merombak konsep agar sesuai arahan akademik.", traitWeights: { gritAdaptability: 20, socialEmpathy: 15 } },
      { text: "Mengajak diskusi lebih dalam seusai kelas untuk menjelaskan visi di balik ide tersebut dengan data komparatif.", traitWeights: { leadershipInfluence: 25, creativeInnovation: 10 } },
      { text: "Menjadikan kritik tersebut bahan lecutan motivasi untuk membuktikan keberhasilan prototipe di lapangan.", traitWeights: { gritAdaptability: 25, creativeInnovation: 15 } }
    ]
  },

  // --- Bagian 2: Logika, Strategi & Problem Solving ---
  {
    id: 5,
    category: "LOGIC",
    scenario: "Kampus padam listrik total saat kelompokmu giliran presentasi di hadapan dewan penguji. Proyektor mati dan baterai laptop tersisa 5%. Keputusan kelompokmu:",
    options: [
      { text: "Menggunakan papan tulis manual untuk menggambar arsitektur ide sambil melakukan storytelling interaktif.", traitWeights: { creativeInnovation: 25, leadershipInfluence: 15 } },
      { text: "Membuka laptop 5% tersebut khusus untuk diperlihatkan bergantian ke meja penguji secara intim.", traitWeights: { logicalReasoning: 20, gritAdaptability: 15 } },
      { text: "Mengubah format presentasi menjadi sesi tanya-jawab interaktif berbasis studi kasus langsung.", traitWeights: { leadershipInfluence: 25, socialEmpathy: 15 } }
    ]
  },
  {
    id: 6,
    category: "LOGIC",
    scenario: "Kamu sedang merancang sistem AI kampus. Model akurasi meningkat 30% jika menggunakan data chat pribadi mahasiswa tanpa persetujuan eksplisit. Keputusanmu:",
    options: [
      { text: "Mutlak menolak penggunaan data tanpa izin dan memilih mengoptimalkan algoritma pada dataset publik berlisensi resmi.", traitWeights: { logicalReasoning: 20, socialEmpathy: 20 } },
      { text: "Menggunakan teknik anonimisasi data ketat (hashing/pseudonym) agar privasi terjaga namun performa model tetap tinggi.", traitWeights: { logicalReasoning: 25, creativeInnovation: 15 } },
      { text: "Membuat sistem opt-in transparan dengan insentif poin bagi mahasiswa yang bersedia membagikan datanya.", traitWeights: { leadershipInfluence: 20, socialEmpathy: 20 } }
    ]
  },
  {
    id: 7,
    category: "LOGIC",
    scenario: "Timmu memenangkan dana hibah penelitian Rp 15.000.000. Komposisi alokasi yang paling bijak menurutmu:",
    options: [
      { text: "70% untuk pembelian alat/server komputasi, 20% operasional, 10% publikasi.", traitWeights: { logicalReasoning: 25, gritAdaptability: 10 } },
      { text: "40% untuk eksperimen lapangan/survei pengguna, 40% prototipe cepat, 20% diseminasi.", traitWeights: { creativeInnovation: 20, socialEmpathy: 20 } },
      { text: "50% untuk riset mendalam & literatur berbayar, 30% paten, 20% tim.", traitWeights: { logicalReasoning: 20, leadershipInfluence: 15 } }
    ]
  },
  {
    id: 8,
    category: "LOGIC",
    scenario: "Dua dosen ahli memberikan arahan metodologi yang 180 derajat bertolak belakang untuk topik skripsimu. Solusi logismu:",
    options: [
      { text: "Membandingkan literatur jurnal bereputasi global (Q1) untuk melihat metodologi dengan basis bukti ilmiah terkuat.", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "Mempertemukan kedua dosen dalam satu sesi diskusi ilmiah dengan menyajikan perbandingan matriks komparatif.", traitWeights: { leadershipInfluence: 25, socialEmpathy: 15 } },
      { text: "Mengembangkan metode hybrid yang menggabungkan keunggulan masing-masing pendekatan secara inovatif.", traitWeights: { creativeInnovation: 25, logicalReasoning: 15 } }
    ]
  },

  // --- Bagian 3: Simulasi Visi Akademik 4 Tahun ---
  {
    id: 9,
    category: "ROADMAP",
    scenario: "Apa tolok ukur sukses pribadimu saat menutup tahun pertama kuliah (Semester 1 - 2)?",
    options: [
      { text: "IPK di atas 3.75 dan pemahaman konsep dasar studi yang sangat kuat.", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "Memiliki lingkaran pertemanan suportif lintas jurusan dan mengenal minimal 3 dosen mentor.", traitWeights: { socialEmpathy: 25, leadershipInfluence: 15 } },
      { text: "Menghasilkan minimal 1 karya prototipe nyata atau tulisan yang dipublikasikan.", traitWeights: { creativeInnovation: 25, gritAdaptability: 10 } },
      { text: "Menemukan 1 organisasi/komunitas mahasiswa yang benar-benar sejalan dengan visi masa depanku.", traitWeights: { leadershipInfluence: 20, socialEmpathy: 15 } }
    ]
  },
  {
    id: 10,
    category: "ROADMAP",
    scenario: "Di tahun kedua (Semester 3 - 4), fokus penguatan skill mana yang menjadi target utamamu?",
    options: [
      { text: "Hard skill teknis tingkat lanjut (Coding AI, Analisis Data Kompleks, Rekayasa Sistem).", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "Soft skill kepemimpinan, negosiasi, public speaking, dan manajemen konflik.", traitWeights: { leadershipInfluence: 25, socialEmpathy: 15 } },
      { text: "Kemampuan riset ilmiah, penulisan akademik, dan metodologi kuantitatif/kualitatif.", traitWeights: { logicalReasoning: 20, gritAdaptability: 20 } },
      { text: "Validasi ide bisnis, riset pasar, dan pembuatan model bisnis berkelanjutan.", traitWeights: { creativeInnovation: 25, leadershipInfluence: 15 } }
    ]
  },
  {
    id: 11,
    category: "ROADMAP",
    scenario: "Program Merdeka Belajar (MBKM) mana yang paling ingin kamu taklukkan di Tahun ke-3?",
    options: [
      { text: "Magang industri bersertifikat di perusahaan teknologi terkemuka / BUMN.", traitWeights: { logicalReasoning: 20, leadershipInfluence: 20 } },
      { text: "Pertukaran mahasiswa ke universitas mitra di luar negeri (Student Exchange).", traitWeights: { gritAdaptability: 25, creativeInnovation: 15 } },
      { text: "Membangun startup binaan inkubator kampus dengan pendanaan nyata.", traitWeights: { creativeInnovation: 25, leadershipInfluence: 15 } },
      { text: "Proyek Kemanusiaan & Pengabdian Masyarakat di wilayah 3T berbasis inovasi tepat guna.", traitWeights: { socialEmpathy: 25, gritAdaptability: 15 } }
    ]
  },
  {
    id: 12,
    category: "ROADMAP",
    scenario: "Saat toga wisuda dikenakan di Tahun ke-4, pencapaian apa yang paling membanggakan bagimu?",
    options: [
      { text: "Lulus dengan tawaran kerja impian di tangan berkat portofolio projek yang solid.", traitWeights: { logicalReasoning: 20, gritAdaptability: 20 } },
      { text: "Menghasilkan karya skripsi/produk yang benar-benar digunakan dan menyelesaikan masalah nyata masyarakat.", traitWeights: { creativeInnovation: 20, socialEmpathy: 20 } },
      { text: "Memiliki startup/bisnis yang sudah berjalan mandiri dan membuka lapangan kerja bagi sesama.", traitWeights: { leadershipInfluence: 25, creativeInnovation: 15 } },
      { text: "Mendapatkan letter of acceptance (LoA) beasiswa S2 ke kampus kelas dunia.", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } }
    ]
  },

  // --- Bagian 4: Dinamika Tim & Kepemimpinan ---
  {
    id: 13,
    category: "TEAM_DYNAMICS",
    scenario: "Saat tim berada di ruangan tertutup untuk brainstorming ide baru, peran mana yang secara alami kamu ambil?",
    options: [
      { text: "Mengajukan pertanyaan-pertanyaan kritis untuk menguji kelemahan setiap ide yang muncul.", traitWeights: { logicalReasoning: 25, leadershipInfluence: 10 } },
      { text: "Melemparkan puluhan ide liar dan tidak biasa tanpa takut salah.", traitWeights: { creativeInnovation: 25, gritAdaptability: 10 } },
      { text: "Mengorganisir papan tulis, memetakan ide ke dalam kategori rapi, dan mencatat timeline.", traitWeights: { leadershipInfluence: 20, logicalReasoning: 15 } },
      { text: "Menjembatani pendapat yang berselisih dan memastikan semua orang didengar suaranya.", traitWeights: { socialEmpathy: 25, leadershipInfluence: 10 } }
    ]
  },
  {
    id: 14,
    category: "TEAM_DYNAMICS",
    scenario: "Rundown acara yang sudah dirancang selama 1 bulan tiba-tiba harus diubah total 1 jam sebelum acara dimulai karena cuaca ekstrem. Tindakanmu:",
    options: [
      { text: "Tetap tenang, segera memetakan rencana kontingensi Plan B dalam 10 menit, dan membagi tugas darurat.", traitWeights: { leadershipInfluence: 25, logicalReasoning: 15 } },
      { text: "Memberikan semangat moral kepada seluruh panitia agar tidak panik dan tetap fokus.", traitWeights: { socialEmpathy: 25, gritAdaptability: 15 } },
      { text: "Berkoordinasi langsung dengan pihak venue dan pengisi acara untuk menyesuaikan teknis panggung.", traitWeights: { gritAdaptability: 20, leadershipInfluence: 15 } }
    ]
  },
  {
    id: 15,
    category: "TEAM_DYNAMICS",
    scenario: "Bagaimana pandanganmu tentang relasi antara nilai IPK di kelas dengan kesuksesan karir masa depan?",
    options: [
      { text: "IPK adalah bukti disiplin dan komitmen mendasar; pondasi kuat mutlak diperlukan untuk keunggulan teknis.", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "IPK adalah tiket awal, namun portofolio nyata dan daya adaptasi di industri jauh lebih menentukan.", traitWeights: { creativeInnovation: 20, gritAdaptability: 20 } },
      { text: "Yang terpenting adalah kemampuan membangun jaringan pertemanan dan kepemimpinan sosial.", traitWeights: { leadershipInfluence: 25, socialEmpathy: 15 } },
      { text: "Keseimbangan emas antara akademis yang bertanggung jawab dan eksplorasi karya di luar kelas.", traitWeights: { logicalReasoning: 15, socialEmpathy: 15, creativeInnovation: 15 } }
    ]
  },
  {
    id: 16,
    category: "TEAM_DYNAMICS",
    scenario: "Dari kalimat berikut, mana yang paling mencerminkan filosofi hidupmu 4 tahun ke depan?",
    options: [
      { text: "\"Menjadi ahli di bidangku yang karyanya diakui secara global.\"", traitWeights: { logicalReasoning: 25, gritAdaptability: 15 } },
      { text: "\"Menciptakan karya inovatif yang mendobrak kebiasaan lama.\"", traitWeights: { creativeInnovation: 25, leadershipInfluence: 15 } },
      { text: "\"Menginspirasi dan menggerakkan banyak orang menuju kehidupan yang lebih baik.\"", traitWeights: { leadershipInfluence: 25, socialEmpathy: 15 } },
      { text: "\"Menemukan makna hidup melalui kebermanfaatan bagi sesama dan lingkungan sekitar.\"", traitWeights: { socialEmpathy: 25, gritAdaptability: 15 } }
    ]
  }
];

export interface TraitScores {
  logicalReasoning: number;
  creativeInnovation: number;
  leadershipInfluence: number;
  socialEmpathy: number;
  gritAdaptability: number;
}

export type Archetype = "STRATEGIST" | "INNOVATOR" | "MOBILIZER" | "HARMONIZER";

export interface IncubationEvaluationResult {
  traits: TraitScores;
  primaryArchetype: Archetype;
  secondaryArchetype: Archetype;
  aiReview: string;
  fourYearSurvivalTip: string;
  titles: string[];
}

/** Calculate trait scores and archetypes based on chosen option indices (0-based) */
export function calculateIncubationTraits(answers: number[]): {
  traits: TraitScores;
  primaryArchetype: Archetype;
  secondaryArchetype: Archetype;
} {
  const raw: TraitScores = {
    logicalReasoning: 20,
    creativeInnovation: 20,
    leadershipInfluence: 20,
    socialEmpathy: 20,
    gritAdaptability: 20
  };

  answers.forEach((optionIdx, qIdx) => {
    const q = INCUBATION_QUESTIONS[qIdx];
    if (q && q.options[optionIdx]) {
      const w = q.options[optionIdx].traitWeights;
      if (w.logicalReasoning) raw.logicalReasoning += w.logicalReasoning;
      if (w.creativeInnovation) raw.creativeInnovation += w.creativeInnovation;
      if (w.leadershipInfluence) raw.leadershipInfluence += w.leadershipInfluence;
      if (w.socialEmpathy) raw.socialEmpathy += w.socialEmpathy;
      if (w.gritAdaptability) raw.gritAdaptability += w.gritAdaptability;
    }
  });

  // Normalize scores to 50-98 range
  const normalize = (val: number) => Math.min(98, Math.max(50, Math.round((val / 130) * 100)));

  const traits: TraitScores = {
    logicalReasoning: normalize(raw.logicalReasoning),
    creativeInnovation: normalize(raw.creativeInnovation),
    leadershipInfluence: normalize(raw.leadershipInfluence),
    socialEmpathy: normalize(raw.socialEmpathy),
    gritAdaptability: normalize(raw.gritAdaptability)
  };

  // Determine Archetypes
  const archetypeMap: Array<{ type: Archetype; score: number }> = [
    { type: "STRATEGIST", score: traits.logicalReasoning },
    { type: "INNOVATOR", score: traits.creativeInnovation },
    { type: "MOBILIZER", score: traits.leadershipInfluence },
    { type: "HARMONIZER", score: traits.socialEmpathy }
  ];

  archetypeMap.sort((a, b) => b.score - a.score);

  return {
    traits,
    primaryArchetype: archetypeMap[0].type,
    secondaryArchetype: archetypeMap[1].type
  };
}

import { aiGateway } from "../lib/aiGateway";

/** Evaluate incubation profiling with Gemini AI Senior Mentor via aiGateway (Sarcastic, Educational, Polite, No Vulgarity) */
export async function evaluateIncubationWithAI(params: {
  fullName?: string;
  traits: TraitScores;
  primaryArchetype: Archetype;
  secondaryArchetype: Archetype;
}): Promise<{ aiReview: string; fourYearSurvivalTip: string; titles: string[] }> {
  const { fullName = "Mahasiswa Baru", traits, primaryArchetype, secondaryArchetype } = params;

  if (process.env.NODE_ENV !== "test") {
    try {
      const systemPrompt = `Kamu adalah seorang Mahasiswa Senior Berprestasi (Senior Mentor) di kampus UNU Yogyakarta.
Karaktermu: Sangat cerdas, berpendidikan tinggi, chill, santai, ramah, namun memiliki gaya bahasa khas: SELALU MENSARKAS SECARA INTELEKTUAL DAN MENDIDIK.

ATURAN WAJIB (STRICT SAFETY):
- DILARANG KERAS menggunakan kata-kata kotor, makian, kasar, atau merendahkan martabat (Strictly zero profanity/vulgarity).
- Sarkasme harus berupa "humor cerdas" tentang romantika & kenaifan mahasiswa baru yang ingin lulus 3.5 tahun IPK 4.0 sambil memimpin semua organisasi.
- Berikan apresiasi tulus dan tips konkret yang membimbing peserta menghadapi 3-4 tahun masa studi perkuliahan.

Output WAJIB berupa JSON murni valid tanpa markdown (\`\`\`json):
{
  "aiReview": "Tuliskan ulasan dalam 2-3 paragraf terpisah (pisahkan tiap paragraf dengan \\n\\n) bernuansa sarkastik intelek tapi mendidik, ramah, dan memotivasi...",
  "fourYearSurvivalTip": "Saran konkret bertahan hidup 4 tahun perkuliahan...",
  "titles": ["Title 1", "Title 2"]
}`;

      const userPrompt = `Data Peserta:
- Nama: ${fullName}
- Skor Traits: Logika: ${traits.logicalReasoning}%, Inovasi: ${traits.creativeInnovation}%, Leadership: ${traits.leadershipInfluence}%, Empati: ${traits.socialEmpathy}%, Resiliensi: ${traits.gritAdaptability}%
- Archetype Utama: ${primaryArchetype}, Sekunder: ${secondaryArchetype}

Berikan evaluasi mentoring sekarang.`;

      const aiRes = await aiGateway.execute({
        prompt: userPrompt,
        systemPrompt,
        jsonMode: true,
        preferredModel: "gemini-2.0-flash",
        cacheTtlMinutes: 240, // Cache for 4 hours
      });

      const parsed = aiRes.parsedJson || aiGateway.extractJson(aiRes.text);
      if (parsed) {
        return {
          aiReview: String(parsed.aiReview || "").trim(),
          fourYearSurvivalTip: String(parsed.fourYearSurvivalTip || "").trim(),
          titles: Array.isArray(parsed.titles) ? parsed.titles.map(String) : ["Campus Pathfinder 2026"]
        };
      }
    } catch (err: any) {
      console.warn("[Incubation] Gateway call error, falling back to local Senior Mentor:", err.message);
    }
  }

  // Fallback Senior Mentor Logic
  if (primaryArchetype === "STRATEGIST") {
    return {
      aiReview: `Wah, lihat siapa yang mendaftar. Seorang arsitek masa depan dengan skor logika ${traits.logicalReasoning}! Dari pola jawabanmu, sepertinya kamu tipe mahasiswa yang bakal menghitung probabilitas IPK sampai ke 4 angka di belakang koma sebelum memilih jadwal kuliah. Ambisimu sangat terstruktur, tapi ingat ya adik tingkat: dunia kampus tidak selalu linier seperti rumus matematika. Jangan sampai kamu lupa cara mengobrol di kantin hanya karena sibuk menyusun jadwal belajar harian. Pertahankan analisis tajammu, tapi izinkan dirimu sesekali menikmati ketidakteraturan hidup!`,
      fourYearSurvivalTip: "Cari teman dari jurusan non-teknis agar perspektifmu seimbang, dan jangan lupa tidur sebelum jam 2 pagi saat pekan UTS.",
      titles: ["Arsitek Algoritma Kampus", "Kalkulator Berjalan 2026", "Master of Logic"]
    };
  } else if (primaryArchetype === "INNOVATOR") {
    return {
      aiReview: `Luar biasa, satu lagi pencetus ide revolusioner yang siap mengubah dunia sebelum wisuda semester 7! Skor inovasimu mencapai ${traits.creativeInnovation}. Ide-idemu sangat segar dan berani mendobrak pakem, khas mahasiswa baru yang belum pernah merasakan revisi bab 3 skripsi belasan kali. Kreativitasmu adalah aset mahal di era AI, tapi jangan sampai kamu punya 50 ide cemerlang namun tidak ada satupun yang diselesaikan sampai tuntas. Pilih 1 ide terbaikmu, eksekusi sampai selesai, baru kemudian rancang roket berikutnya!`,
      fourYearSurvivalTip: "Fokus pada konsistensi eksekusi dan pencatatan portofolio, bukan hanya pesta brainstorming ide tanpa hasil jadi.",
      titles: ["Pabrik Ide Avant-Garde", "Kreator Tanpa Batas", "Visionary Pioneer 2026"]
    };
  } else if (primaryArchetype === "MOBILIZER") {
    return {
      aiReview: `Halo calon Presiden Mahasiswa masa depan! Skor kepemimpinanmu ${traits.leadershipInfluence} menyala terang dari kejauhan. Kamu punya karisma alami yang membuat orang lain mau ikut ke mana pun kamu melangkah. Tapi ingat ya adik tingkat: menjadi penggerak organisasi itu bukan cuma soal megang megafon saat orasi, tapi juga tentang memastikan tugas kuliahmu tidak terbengkalai sampai dosen mencari-cari kamu di grup WhatsApp. Seimbangkan panggung organisasi dan panggung akademis!`,
      fourYearSurvivalTip: "Kuasai manajemen kalender digital sejak semester satu agar tidak ada bentrok antara rapat panitia dan praktikum lab.",
      titles: ["Komandan Lapangan 2026", "Penggerak Massa Kampus", "Visionary Leader"]
    };
  } else {
    return {
      aiReview: `Senang melihat jiwa humanis sejati di angkatan 2026 ini! Skor empatimu mencapai ${traits.socialEmpathy}. Kamu adalah perekat kekompakan tim yang selalu memastikan tidak ada teman yang tertinggal saat diskusi kelompok. Tapi hati-hati ya, jangan sampai karena terlalu sungkan dan ingin membahagiakan semua orang, kamu malah mengerjakan semua tugas free-rider sendirian sampai mengorbankan kesehatanmu. Kebaikanmu berharga, pasang batasan yang sehat!`,
      fourYearSurvivalTip: "Belajar berkata 'tidak' secara asertif pada tugas di luar kapasitasmu agar energimu tetap terjaga untuk hal yang berdampak nyata.",
      titles: ["Perekat Jiwa Tim", "Empathetic Vanguard", "Campus Guardian"]
    };
  }
}

/** In-memory status for Incubation game access (admin-controlled) */
let incubationGameStatus: "LOCKED" | "OPEN" = "OPEN";

export function getIncubationGameStatus(): "LOCKED" | "OPEN" {
  return incubationGameStatus;
}

export function setIncubationGameStatus(status: "LOCKED" | "OPEN") {
  incubationGameStatus = status;
}

/** Save incubation profiling result into user titles and score ledger */
export async function saveIncubationResult(params: {
  userId?: string;
  teamId?: string;
  result: IncubationEvaluationResult;
}): Promise<{ newTitles: string[]; currentUnlockedTitles: string[] }> {
  const { userId, teamId, result } = params;

  // If testing as guest / no valid UUID
  const isValidUuid = typeof userId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  if (!isValidUuid) {
    return {
      newTitles: result.titles,
      currentUnlockedTitles: ["Novice Adventurer", ...result.titles]
    };
  }

  try {
    // 1. Get current user
    const [user] = await db
      .select({ unlockedTitles: users.unlockedTitles })
      .from(users)
      .where(eq(users.id, userId!))
      .limit(1);

    const existingTitles: string[] = user?.unlockedTitles || ["Novice Adventurer"];
    const newUniqueTitles = result.titles.filter((t) => !existingTitles.includes(t));
    const updatedTitles = [...existingTitles, ...newUniqueTitles];

    // 2. Update user titles in DB
    await db
      .update(users)
      .set({
        unlockedTitles: updatedTitles,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId!));

    // 3. Award completion points (100 pts for completing Day 1 Incubation)
    const isValidTeamUuid = typeof teamId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teamId);

    if (isValidTeamUuid) {
      await db.insert(scoreTransactions).values({
        participantId: userId!,
        teamId: teamId!,
        amount: 100,
        sourceType: "ACHIEVEMENT",
        reason: `Day 1 Incubation: Archetype ${result.primaryArchetype} Unlocked`
      });
    }

    return {
      newTitles: newUniqueTitles,
      currentUnlockedTitles: updatedTitles
    };
  } catch (err) {
    console.warn("[Incubation] DB save warning:", err);
    return {
      newTitles: result.titles,
      currentUnlockedTitles: ["Novice Adventurer", ...result.titles]
    };
  }
}
