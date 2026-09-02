import type {
  Floor,
  Booth,
  Participant,
  StampRecord,
  LeaderboardUser,
  LeaderboardGroup,
  AdminUser,
} from '@genius-unu/shared';

// In-Memory Data Store for Development & Demonstrations
export class DataStore {
  public participants: Map<string, Participant> = new Map();
  public leaderboardUsers: LeaderboardUser[] = [];
  public leaderboardGroups: LeaderboardGroup[] = [];
  public adminUsers: AdminUser[] = [
    {
      id: 'adm-1',
      username: 'admin',
      name: 'Super Admin PKKMB 2026',
      role: 'superadmin',
      email: 'admin@unu-jogja.ac.id',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'adm-2',
      username: 'pj_lantai_1',
      name: 'PJ Lantai 1 (Aswaja)',
      role: 'admin_floor',
      assignedFloor: 1,
      email: 'pj.lantai1@unu-jogja.ac.id',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial mock participants
    const mockStudents: Participant[] = [
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
    ];

    mockStudents.forEach((student) => {
      this.participants.set(student.nim, student);
    });

    this.updateLeaderboards();
  }

  public updateLeaderboards() {
    const list: LeaderboardUser[] = Array.from(this.participants.values())
      .map((p, idx) => ({
        id: `usr-${p.nim}`,
        rank: idx + 1,
        name: p.name,
        nim: p.nim,
        faculty: p.faculty,
        prodi: p.prodi,
        avatar: p.avatar,
        totalXp: p.totalXp,
        stampsCount: Object.keys(p.stamps).length,
        completedFloors: Math.floor(p.completedBooths.length / 2),
        groupId: p.groupId || 'grp-1',
        groupName: p.groupName || 'Kelompok 01',
      }))
      .sort((a, b) => b.totalXp - a.totalXp);

    this.leaderboardUsers = list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }
}

export const db = new DataStore();
