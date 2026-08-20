export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
export type OrderChannel = 'walkin' | 'delivery' | 'online';
export type OrderPriority = 'normal' | 'high' | 'critical';

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  allergens?: string | string[];
  category?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  status: OrderStatus;
  priority: OrderPriority;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
    loyaltyPoints?: number;
  };
  loyaltyPoints?: number;
  tableNumber?: number;
  deliveryAddress?: string;
  subtotal: number;
  tax: number;
  total: number;
  isDelayed?: boolean;
  delayReason?: string;
  notes?: string;
  estimatedReadyTime?: string | Date;
  actualReadyTime?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItem[];
}
