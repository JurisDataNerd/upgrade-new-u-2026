/**
 * GENIUS UNU 2026 — 50 Official PKKMB Buddies & Teams Roster
 * Formatted from official committee records.
 * Rules: No "Kak" prefix, Title Case names, assigned to Genius 01-50.
 */

export interface OfficialBuddy {
  id: string;
  num: number;
  username: string;
  altUsername: string;
  fullName: string;
  prodi: string;
  faculty: string;
  gender: "MALE" | "FEMALE";
  avatarUrl: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  assignedFloor: number;
  role: "BUDDY";
  buddyRole: "PRIMARY" | "ASSISTANT";
  status: "ACTIVE";
  email: string;
  bonusSpent: number;
  createdAt: string;
}

export const RAW_BUDDY_DATA: Array<{
  num: number;
  fullName: string;
  prodi: string;
  faculty: string;
  gender: "MALE" | "FEMALE";
  slug: string;
}> = [
  { num: 1, fullName: "Agnes Anggraini Risdiyanto", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "agnes" },
  { num: 2, fullName: "Agnesya Putri Triyana", prodi: "Teknik Elektro", faculty: "Fakultas Teknologi Informasi", gender: "FEMALE", slug: "agnesya" },
  { num: 3, fullName: "Ahmad Fadlil Munajad", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", slug: "fadlil" },
  { num: 4, fullName: "Ahmad Ichsan Maulana", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "MALE", slug: "ichsan" },
  { num: 5, fullName: "Aning Gusmi Rahayu", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "FEMALE", slug: "aning" },
  { num: 6, fullName: "Arselia Sakina", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "arselia" },
  { num: 7, fullName: "Asadurrahman Mujtaba Alhamidy", prodi: "Pendidikan Bahasa Inggris", faculty: "Fakultas Ilmu Pendidikan", gender: "MALE", slug: "asadurrahman" },
  { num: 8, fullName: "Dafa Alif Laguna", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", slug: "dafa" },
  { num: 9, fullName: "Destiya Lintang Dwi Utami", prodi: "Farmasi", faculty: "Fakultas Ilmu Kesehatan", gender: "FEMALE", slug: "destiya" },
  { num: 10, fullName: "Dzulfa Sindi Saputri", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "dzulfa" },
  { num: 11, fullName: "Eka Setiawan", prodi: "Teknik Elektro", faculty: "Fakultas Teknologi Informasi", gender: "MALE", slug: "ekasetiawan" },
  { num: 12, fullName: "Farazinia Aditiani Putri", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "farazinia" },
  { num: 13, fullName: "Fathi Rizqy Ramadhan", prodi: "Informatika", faculty: "Fakultas Teknologi Informasi", gender: "MALE", slug: "fathi" },
  { num: 14, fullName: "Fauza Ramadani", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "FEMALE", slug: "fauza" },
  { num: 15, fullName: "Fina Nur Jayanti", prodi: "Pendidikan Bahasa Inggris", faculty: "Fakultas Ilmu Pendidikan", gender: "FEMALE", slug: "fina" },
  { num: 16, fullName: "Isna Shabrina Berliana", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "isna" },
  { num: 17, fullName: "Istiqomah Kurniawati", prodi: "Teknik Elektro", faculty: "Fakultas Teknologi Informasi", gender: "FEMALE", slug: "istiqomah" },
  { num: 18, fullName: "Jernikan Qalbi Zauqillah", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "jernikan" },
  { num: 19, fullName: "Khansa Saifanah Khair", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "FEMALE", slug: "khansa" },
  { num: 20, fullName: "Khoirunnisa Aulia Rahmah", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "khoirunnisa" },
  { num: 21, fullName: "Moh. Dimas Adi Putra", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", slug: "dimas" },
  { num: 22, fullName: "Mohamad Budi Wibowo", prodi: "Informatika", faculty: "Fakultas Teknologi Informasi", gender: "MALE", slug: "budi" },
  { num: 23, fullName: "Mohammad Hilman Umami", prodi: "Teknik Elektro", faculty: "Fakultas Teknologi Informasi", gender: "MALE", slug: "hilman" },
  { num: 24, fullName: "Muhammad Ma'shum", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "MALE", slug: "mashum" },
  { num: 25, fullName: "Muhammad Naufal Rosyiq Ammar", prodi: "Teknologi Hasil Pertanian", faculty: "Fakultas Bioindustri", gender: "MALE", slug: "naufal" },
  { num: 26, fullName: "Muhammad Pradana Sidiq Nurcahyo", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "MALE", slug: "pradana" },
  { num: 27, fullName: "Mutiara Nisa Cahya Kusuma", prodi: "Farmasi", faculty: "Fakultas Ilmu Kesehatan", gender: "FEMALE", slug: "mutiara" },
  { num: 28, fullName: "Nazriel Rizky Fadilah", prodi: "Pendidikan Bahasa Inggris", faculty: "Fakultas Ilmu Pendidikan", gender: "MALE", slug: "nazriel" },
  { num: 29, fullName: "Nur Raihana Zulfa", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "raihana" },
  { num: 30, fullName: "Nurhidayah Irawan", prodi: "Pendidikan Guru Sekolah Dasar (PGSD)", faculty: "Fakultas Ilmu Pendidikan", gender: "FEMALE", slug: "nurhidayah" },
  { num: 31, fullName: "Orryza Sativa Qurrota A'yun", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "orryza" },
  { num: 32, fullName: "Pandu Alfa Pratama", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "MALE", slug: "pandu" },
  { num: 33, fullName: "Ramanda", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", slug: "ramanda" },
  { num: 34, fullName: "Refina Aprillia", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "refina" },
  { num: 35, fullName: "Rizka Sonia Octavia", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "rizkasonia" },
  { num: 36, fullName: "Rizki Nur Aini", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "rizkinur" },
  { num: 37, fullName: "Sakina Tasya", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "sakinatasya" },
  { num: 38, fullName: "Salis Nawalin Najah", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "salis" },
  { num: 39, fullName: "Sevia Mila Sari", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "sevia" },
  { num: 40, fullName: "Siti Via Syahrani Putri", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "sitivia" },
  { num: 41, fullName: "Sovi Sarah", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "FEMALE", slug: "sovisarah" },
  { num: 42, fullName: "Sukma Maulana Pangesti", prodi: "Studi Islam Interdisipliner", faculty: "Fakultas Dirasat Islamiyah", gender: "MALE", slug: "sukma" },
  { num: 43, fullName: "Talitha Zerlina Aurellia", prodi: "Farmasi", faculty: "Fakultas Ilmu Kesehatan", gender: "FEMALE", slug: "talitha" },
  { num: 44, fullName: "Usman Raya", prodi: "Manajemen", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", slug: "usman" },
  { num: 45, fullName: "Yoga Rama Indardy", prodi: "Akuntansi", faculty: "Fakultas Ekonomi dan Bisnis", gender: "MALE", slug: "yoga" },
  { num: 46, fullName: "Yulita Wahyu Utami", prodi: "Pendidikan Guru Sekolah Dasar (PGSD)", faculty: "Fakultas Ilmu Pendidikan", gender: "FEMALE", slug: "yulita" },
  { num: 47, fullName: "Zahra Audrina Fadhilah", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "zahra" },
  { num: 48, fullName: "Zahro Makhbubah", prodi: "Agribisnis", faculty: "Fakultas Bioindustri", gender: "FEMALE", slug: "zahro" },
  { num: 49, fullName: "Zakiya Aisyah Dealatifa", prodi: "Teknik Elektro", faculty: "Fakultas Teknologi Informasi", gender: "FEMALE", slug: "zakiya" },
  { num: 50, fullName: "Zulaika", prodi: "Farmasi", faculty: "Fakultas Ilmu Kesehatan", gender: "FEMALE", slug: "zulaika" },
];

export const OFFICIAL_BUDDIES: OfficialBuddy[] = RAW_BUDDY_DATA.map((item) => {
  const padNum = String(item.num).padStart(2, "0");
  const username = `buddy${padNum}`;
  const teamId = `team-${item.num}`;
  const teamName = `Genius ${padNum}`;
  const teamCode = `GENIUS-${padNum}`;
  const assignedFloor = ((item.num - 1) % 8) + 1; // Floor 1-8

  return {
    id: `usr-b${item.num}`,
    num: item.num,
    username,
    altUsername: `buddy.${item.slug}`,
    fullName: item.fullName,
    prodi: item.prodi,
    faculty: item.faculty,
    gender: item.gender,
    avatarUrl: item.gender === "FEMALE" ? "/character-cewek-avatar.png" : "/character-cowok-avatar.png",
    teamId,
    teamName,
    teamCode,
    assignedFloor,
    role: "BUDDY" as const,
    buddyRole: "PRIMARY" as const,
    status: "ACTIVE" as const,
    email: `${item.slug}@unu-jogja.ac.id`,
    bonusSpent: 0,
    createdAt: "2026-09-01T00:00:00Z",
  };
});

export function findBuddyByQuery(query: string): OfficialBuddy | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();

  // Match exact username buddy01, buddy02...
  const byUsername = OFFICIAL_BUDDIES.find((b) => b.username.toLowerCase() === clean);
  if (byUsername) return byUsername;

  // Match alt username (e.g. buddy.budi, buddy.fathi)
  const byAlt = OFFICIAL_BUDDIES.find((b) => b.altUsername.toLowerCase() === clean);
  if (byAlt) return byAlt;

  // Match numeric 1, 01, 2, ...
  const numMatch = clean.match(/^(\d{1,2})$/);
  if (numMatch) {
    const numVal = parseInt(numMatch[1], 10);
    const byNum = OFFICIAL_BUDDIES.find((b) => b.num === numVal);
    if (byNum) return byNum;
  }

  // Match full name contains query or query contains slug
  const byName = OFFICIAL_BUDDIES.find((b) => {
    const nameLower = b.fullName.toLowerCase();
    const slug = b.altUsername.replace("buddy.", "");
    return nameLower.includes(clean) || clean.includes(slug) || slug.includes(clean);
  });
  if (byName) return byName;

  return undefined;
}
