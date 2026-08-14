// ============================================================
// Global Models — Notification & User Domain
// ============================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;  // ms — undefined = persistent
  timestamp: Date;
}

export type UserRole = 'cashier' | 'manager' | 'kitchen' | 'support';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  branch: string;
  avatar?: string;
}

export const USER_ROLES: { value: UserRole; label: string; icon: string; color: string }[] = [
  { value: 'cashier',  label: 'Cashier',         icon: '💳', color: '#60a5fa' },
  { value: 'manager',  label: 'Branch Manager',  icon: '👔', color: '#f59e0b' },
  { value: 'kitchen',  label: 'Kitchen Staff',   icon: '👨‍🍳', color: '#34d399' },
  { value: 'support',  label: 'Customer Support',icon: '🎧', color: '#c084fc' },
];

export interface OfflineQueueItem {
  id: string;
  type: string;
  payload: unknown;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'replaying' | 'failed';
}
