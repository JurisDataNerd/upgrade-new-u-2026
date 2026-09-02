export type UserRole = 'superadmin' | 'admin_floor' | 'pj_booth' | 'committee' | 'participant';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  assignedFloor?: number;
  assignedBoothId?: string;
  email?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
    nim?: string;
    email?: string;
    avatar?: string;
  };
  expiresAt: string;
}

export interface ParticipantLoginRequest {
  nim: string;
  name: string;
  prodi: string;
  faculty: string;
  avatar?: string;
  groupName?: string;
}

export interface AdminLoginRequest {
  username: string;
  passcode: string;
}
