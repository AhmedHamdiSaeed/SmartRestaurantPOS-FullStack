import { UserRole } from './app.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email?: string;
  role?: string;
  branch?: string;
  tenantId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
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
  user: AuthUser;
}
