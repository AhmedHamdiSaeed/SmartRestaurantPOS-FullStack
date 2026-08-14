// ============================================================
// Global Models — Order Domain
// ============================================================

export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type OrderChannel = 'walkin' | 'delivery' | 'online';

export type OrderPriority = 'normal' | 'high' | 'critical';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  allergens?: string[];
  category: string;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  status: OrderStatus;
  priority: OrderPriority;
  items: OrderItem[];
  customer: CustomerInfo;
  tableNumber?: number;
  deliveryAddress?: string;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  notes?: string;
  isDelayed: boolean;
  delayReason?: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  newStatus: OrderStatus;
  timestamp: Date;
  reason?: string;
}

export interface OrderFilter {
  channel: OrderChannel | 'all';
  status: OrderStatus | 'all';
  priority: OrderPriority | 'all';
  searchTerm: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received:  'Received',
  preparing: 'Preparing',
  ready:     'Ready',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'received', 'preparing', 'ready', 'delivered', 'completed'
];

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  walkin:   'Walk-in',
  delivery: 'Delivery',
  online:   'Online',
};
