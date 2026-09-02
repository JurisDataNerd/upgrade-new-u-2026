import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  AdminUser,
  Participant,
  AdminStatsResponse,
  LeaderboardUser,
  LeaderboardGroup,
} from '@genius-unu/shared';

export const useAdminStore = defineStore('admin', () => {
  const currentUser = ref<AdminUser | null>({
    id: 'adm-1',
    username: 'admin',
    name: 'Super Admin PKKMB 2026',
    role: 'superadmin',
    email: 'admin@unu-jogja.ac.id',
    createdAt: new Date().toISOString(),
  });

  const isAuthenticated = computed(() => currentUser.value !== null);

  const stats = ref<AdminStatsResponse>({
    totalParticipants: 1450,
    activeToday: 1380,
    totalStampsIssued: 8940,
    averageFloorsCompleted: 6.2,
    topBooths: [
      { boothId: 'booth-1a', boothName: 'Aswaja & Ke-NU-an', completionsCount: 1420, avgScore: 94 },
      { boothId: 'booth-1b', boothName: 'Sejarah & Visi UNU', completionsCount: 1380, avgScore: 91 },
      { boothId: 'booth-2a', boothName: 'Integritas Anti-Korupsi', completionsCount: 1310, avgScore: 88 },
      { boothId: 'booth-2b', boothName: 'Zona Bersih Narkoba', completionsCount: 1290, avgScore: 90 },
      { boothId: 'booth-3a', boothName: 'Etika Digital Kampus', completionsCount: 1220, avgScore: 95 },
    ],
    floorCompletions: [
      { floorNumber: 1, floorName: 'Lantai 1 - Pondasi Karakter & Aswaja', count: 1420 },
      { floorNumber: 2, floorName: 'Lantai 2 - Integritas & Anti-Korupsi', count: 1290 },
      { floorNumber: 3, floorName: 'Lantai 3 - Etika & Literasi Digital', count: 1220 },
      { floorNumber: 4, floorName: 'Lantai 4 - Riset, Sains & Inovasi', count: 1100 },
      { floorNumber: 5, floorName: 'Lantai 5 - Kewirausahaan & Karir', count: 980 },
      { floorNumber: 6, floorName: 'Lantai 6 - Kepemimpinan & Organisasi', count: 890 },
      { floorNumber: 7, floorName: 'Lantai 7 - Wawasan Global & Bahasa', count: 750 },
      { floorNumber: 8, floorName: 'Lantai 8 - Moderasi Beragama', count: 680 },
      { floorNumber: 9, floorName: 'Lantai 9 - Upgraded You Final Stage', count: 610 },
    ],
  });

  const participants = ref<Participant[]>([
    {
      name: 'Ahmad Fauzi Ridwan',
      nim: '260100101',
      prodi: 'Informatika',
      faculty: 'Fakultas Teknologi Informasi',
      avatar: 'character-cowok-avatar.png',
      totalXp: 1850,
      completedBooths: ['booth-1a', 'booth-1b', 'booth-2a', 'booth-2b', 'booth-3a'],
      stamps: {},
      groupId: 'grp-1',
      groupName: 'Kelompok 01 - KH. Hasyim Asyari',
      isRegistered: true,
    },
    {
      name: 'Siti Nur Azizah',
      nim: '260100102',
      prodi: 'Bioteknologi',
      faculty: 'Fakultas Ilmu Terapan',
      avatar: 'character-cewek-avatar.png',
      totalXp: 1600,
      completedBooths: ['booth-1a', 'booth-1b', 'booth-2a', 'booth-2b'],
      stamps: {},
      groupId: 'grp-1',
      groupName: 'Kelompok 01 - KH. Hasyim Asyari',
      isRegistered: true,
    },
    {
      name: 'M. Rizqi Pratama',
      nim: '260100103',
      prodi: 'Manajemen',
      faculty: 'Fakultas Ekonomi Bisnis',
      avatar: 'character-cowok-avatar.png',
      totalXp: 1450,
      completedBooths: ['booth-1a', 'booth-1b', 'booth-2a'],
      stamps: {},
      groupId: 'grp-2',
      groupName: 'Kelompok 02 - KH. Wahab Chasbullah',
      isRegistered: true,
    },
    {
      name: 'Dewi Ayu Larasati',
      nim: '260100104',
      prodi: 'Teknik Elektro',
      faculty: 'Fakultas Teknologi Informasi',
      avatar: 'character-cewek-avatar.png',
      totalXp: 1950,
      completedBooths: ['booth-1a', 'booth-1b', 'booth-2a', 'booth-2b', 'booth-3a', 'booth-3b'],
      stamps: {},
      groupId: 'grp-3',
      groupName: 'Kelompok 03 - KH. Bisri Syansuri',
      isRegistered: true,
    },
  ]);

  const searchQuery = ref('');

  const filteredParticipants = computed(() => {
    if (!searchQuery.value.trim()) return participants.value;
    const q = searchQuery.value.toLowerCase();
    return participants.value.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nim.toLowerCase().includes(q) ||
        p.prodi.toLowerCase().includes(q) ||
        (p.groupName && p.groupName.toLowerCase().includes(q))
    );
  });

  const login = (passcode: string) => {
    if (passcode === 'unu2026') {
      currentUser.value = {
        id: 'adm-1',
        username: 'admin',
        name: 'Super Admin PKKMB 2026',
        role: 'superadmin',
        email: 'admin@unu-jogja.ac.id',
        createdAt: new Date().toISOString(),
      };
      return true;
    }
    return false;
  };

  const logout = () => {
    currentUser.value = null;
  };

  const resetParticipantProgress = (nim: string) => {
    const p = participants.value.find((item) => item.nim === nim);
    if (p) {
      p.totalXp = 0;
      p.completedBooths = [];
      p.stamps = {};
    }
  };

  return {
    currentUser,
    isAuthenticated,
    stats,
    participants,
    searchQuery,
    filteredParticipants,
    login,
    logout,
    resetParticipantProgress,
  };
});
