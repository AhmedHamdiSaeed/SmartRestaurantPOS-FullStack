export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
export type OrderChannel = 'walkin' | 'delivery' | 'online';
export type OrderPriority = 'normal' | 'high' | 'critical';

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  allergens?: string;
  category?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  status: OrderStatus;
  priority: OrderPriority;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  loyaltyPoints?: number;
  tableNumber?: number;
  deliveryAddress?: string;
  subtotal: number;
  tax: number;
  total: number;
  isDelayed?: boolean;
  delayReason?: string;
  notes?: string;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
