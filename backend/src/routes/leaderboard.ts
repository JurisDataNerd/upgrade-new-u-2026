import { Hono } from 'hono';
import { db } from '../data/store';
import type { ApiResponse } from '@genius-unu/shared';

export const leaderboardRouter = new Hono();

// Get individual leaderboard
leaderboardRouter.get('/users', (c) => {
  db.updateLeaderboards();
  return c.json<ApiResponse>({
    success: true,
    data: db.leaderboardUsers,
    timestamp: new Date().toISOString(),
  });
});

// Get groups leaderboard
leaderboardRouter.get('/groups', (c) => {
  const mockGroups = [
    {
      id: 'grp-1',
      rank: 1,
      name: 'Kelompok 01 - KH. Hasyim Asyari',
      motto: 'Maju Bersama Aswaja',
      cluster: 'Cluster Sains & Humaniora',
      members: [],
      avgXp: 1725,
      totalXp: 3450,
      totalStampsAvg: 4.5,
      trend: 'up' as const,
    },
    {
      id: 'grp-2',
      rank: 2,
      name: 'Kelompok 02 - KH. Wahab Chasbullah',
      motto: 'Inovasi Berkelanjutan',
      cluster: 'Cluster Bisnis & Manajemen',
      members: [],
      avgXp: 1450,
      totalXp: 1450,
      totalStampsAvg: 3,
      trend: 'same' as const,
    },
  ];

  return c.json<ApiResponse>({
    success: true,
    data: mockGroups,
    timestamp: new Date().toISOString(),
  });
});
