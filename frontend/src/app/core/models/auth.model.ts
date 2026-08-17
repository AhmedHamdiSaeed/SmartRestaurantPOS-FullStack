export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  role: string;
  branch: string;
}

export type UserRole = 'cashier' | 'manager' | 'kitchen' | 'support';

export interface CurrentUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  tenantId?: string;
  role: UserRole;
  branch: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: CurrentUser;
}
