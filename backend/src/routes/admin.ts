import { Hono } from 'hono';
import { db } from '../data/store';
import type { ApiResponse, AdminStatsResponse, Participant } from '@genius-unu/shared';

export const adminRouter = new Hono();

// Get admin dashboard summary statistics
adminRouter.get('/stats', (c) => {
  const participants = Array.from(db.participants.values());
  const totalParticipants = participants.length;
  const totalStampsIssued = participants.reduce(
    (acc, p) => acc + Object.keys(p.stamps).length,
    0
  );
  const totalFloorsDone = participants.reduce(
    (acc, p) => acc + Math.floor(p.completedBooths.length / 2),
    0
  );
  const averageFloorsCompleted = totalParticipants > 0 ? totalFloorsDone / totalParticipants : 0;

  const stats: AdminStatsResponse = {
    totalParticipants,
    activeToday: totalParticipants,
    totalStampsIssued,
    averageFloorsCompleted: Number(averageFloorsCompleted.toFixed(1)),
    topBooths: [
      { boothId: 'booth-1a', boothName: 'Aswaja & Ke-NU-an', completionsCount: 24, avgScore: 92 },
      { boothId: 'booth-1b', boothName: 'Sejarah & Visi UNU', completionsCount: 22, avgScore: 88 },
      { boothId: 'booth-2a', boothName: 'Integritas Anti-Korupsi', completionsCount: 19, avgScore: 85 },
      { boothId: 'booth-2b', boothName: 'Zona Bersih Narkoba', completionsCount: 18, avgScore: 89 },
      { boothId: 'booth-3a', boothName: 'Etika Digital Kampus', completionsCount: 15, avgScore: 94 },
    ],
    floorCompletions: [
      { floorNumber: 1, floorName: 'Lantai 1 - Pondasi Karakter & Aswaja', count: 22 },
      { floorNumber: 2, floorName: 'Lantai 2 - Integritas & Anti-Korupsi', count: 18 },
      { floorNumber: 3, floorName: 'Lantai 3 - Etika & Literasi Digital', count: 14 },
      { floorNumber: 4, floorName: 'Lantai 4 - Riset, Sains & Inovasi', count: 11 },
      { floorNumber: 5, floorName: 'Lantai 5 - Kewirausahaan & Karir', count: 8 },
    ],
  };

  return c.json<ApiResponse<AdminStatsResponse>>({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
});

// Get all participants
adminRouter.get('/participants', (c) => {
  const participants = Array.from(db.participants.values());
  return c.json<ApiResponse<Participant[]>>({
    success: true,
    data: participants,
    timestamp: new Date().toISOString(),
  });
});

// Reset participant progress
adminRouter.post('/participants/:nim/reset', (c) => {
  const nim = c.req.param('nim');
  const participant = db.participants.get(nim);

  if (!participant) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Mahasiswa tidak ditemukan',
        timestamp: new Date().toISOString(),
      },
      404
    );
  }

  participant.totalXp = 0;
  participant.completedBooths = [];
  participant.stamps = {};
  db.updateLeaderboards();

  return c.json<ApiResponse>({
    success: true,
    message: `Progress mahasiswa ${participant.name} (${nim}) berhasil di-reset.`,
    data: participant,
    timestamp: new Date().toISOString(),
  });
});
