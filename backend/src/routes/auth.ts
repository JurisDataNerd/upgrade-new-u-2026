import { Hono } from 'hono';
import { db } from '../data/store';
import type { ApiResponse, ParticipantLoginRequest, AdminLoginRequest } from '@genius-unu/shared';

export const authRouter = new Hono();

// Participant Registration / Login
authRouter.post('/login', async (c) => {
  const body = await c.req.json<ParticipantLoginRequest>();

  if (!body.nim || !body.name) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'NIM dan Nama Lengkap wajib diisi',
        timestamp: new Date().toISOString(),
      },
      400
    );
  }

  let participant = db.participants.get(body.nim);
  if (!participant) {
    participant = {
      name: body.name,
      nim: body.nim,
      prodi: body.prodi || 'Informatika',
      faculty: body.faculty || 'Fakultas Teknologi Informasi',
      avatar: body.avatar || 'character-cowok-avatar.png',
      totalXp: 0,
      completedBooths: [],
      stamps: {},
      groupId: 'grp-1',
      groupName: body.groupName || 'Kelompok 01 - KH. Hasyim Asyari',
      isRegistered: true,
    };
    db.participants.set(body.nim, participant);
    db.updateLeaderboards();
  }

  return c.json<ApiResponse>({
    success: true,
    message: 'Login mahasiswa berhasil',
    data: {
      participant,
      token: `token_user_${body.nim}_${Date.now()}`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Admin Login
authRouter.post('/admin/login', async (c) => {
  const body = await c.req.json<AdminLoginRequest>();

  if (body.username === 'admin' && body.passcode === 'unu2026') {
    const adminUser = db.adminUsers[0];
    return c.json<ApiResponse>({
      success: true,
      message: 'Login Admin berhasil',
      data: {
        user: adminUser,
        token: `admin_secret_token_${Date.now()}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return c.json<ApiResponse>(
    {
      success: false,
      error: 'Username atau Passcode Admin salah (Gunakan passcode default: unu2026)',
      timestamp: new Date().toISOString(),
    },
    401
  );
});
