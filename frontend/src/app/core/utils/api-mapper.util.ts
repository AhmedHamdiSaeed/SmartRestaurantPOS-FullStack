import { Order, OrderChannel, OrderPriority, OrderStatus } from '../models/order.model';
import { KitchenLoad, KitchenStation, KitchenStationStatus } from '../models/kitchen.model';
import { Product, ProductCategory } from '../models/product.model';
import { UserRole } from '../models/app.model';
import { AuthUser } from '../models/auth.model';

export interface OrderResponseDto {
  id: string;
  orderNumber: string;
  channel: string;
  status: string;
  priority: string;
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
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    allergens?: string[];
    category: string;
  }[];
}

export function toLowerEnum<T extends string>(value: string): T {
  return value.toLowerCase() as T;
}

export function toUpperEnum(value: string): string {
  return value.toUpperCase();
}

export function mapUserRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === 'manager' || normalized === 'cashier' || normalized === 'kitchen' || normalized === 'support') {
    return normalized;
  }
  return 'cashier';
}

export function mapAuthUser(dto: { id: string; username: string; name: string; role: string; branch: string; avatar?: string }): AuthUser {
  return {
    id: dto.id,
    username: dto.username,
    name: dto.name,
    role: mapUserRole(dto.role),
    branch: dto.branch,
    avatar: dto.avatar,
  };
}

export function mapOrder(dto: OrderResponseDto): Order {
  return {
    id: dto.id,
    orderNumber: dto.orderNumber,
    channel: toLowerEnum<OrderChannel>(dto.channel),
    status: toLowerEnum<OrderStatus>(dto.status),
    priority: toLowerEnum<OrderPriority>(dto.priority),
    items: (dto.items ?? []).map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
      allergens: item.allergens ?? [],
      category: item.category,
    })),
    customer: {
      name: dto.customerName,
      phone: dto.customerPhone,
      address: dto.customerAddress,
      loyaltyPoints: dto.loyaltyPoints,
    },
    tableNumber: dto.tableNumber,
    deliveryAddress: dto.deliveryAddress,
    subtotal: dto.subtotal,
    tax: dto.tax,
    total: dto.total,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    estimatedReadyTime: dto.estimatedReadyTime ? new Date(dto.estimatedReadyTime) : undefined,
    actualReadyTime: dto.actualReadyTime ? new Date(dto.actualReadyTime) : undefined,
    notes: dto.notes,
    isDelayed: dto.isDelayed ?? false,
    delayReason: dto.delayReason,
  };
}

export function mapKitchenStation(dto: Record<string, unknown>): KitchenStation {
  return {
    id: String(dto['id']),
    name: String(dto['name']),
    type: toLowerEnum(dto['type'] as string) as KitchenStation['type'],
    currentLoad: Number(dto['currentLoad'] ?? 0),
    maxCapacity: Number(dto['maxCapacity'] ?? 100),
    activeOrders: Number(dto['activeOrders'] ?? 0),
    avgPrepTime: Number(dto['avgPrepTime'] ?? 0),
    status: toLowerEnum<KitchenStationStatus>(String(dto['status'])),
    lastUpdated: dto['lastUpdated'] ? new Date(String(dto['lastUpdated'])) : new Date(),
  };
}

export function mapKitchenLoad(dto: Record<string, unknown>): KitchenLoad {
  const stations = ((dto['stations'] as Record<string, unknown>[]) ?? []).map(mapKitchenStation);
  return {
    overallLoad: Number(dto['overallLoad'] ?? 0),
    stations,
    queueDepth: Number(dto['queueDepth'] ?? 0),
    estimatedDelay: Number(dto['estimatedDelay'] ?? 0),
    alertLevel: toLowerEnum(dto['alertLevel'] as string) as KitchenLoad['alertLevel'],
    lastUpdated: dto['lastUpdated'] ? new Date(String(dto['lastUpdated'])) : new Date(),
  };
}

export function mapProduct(dto: Record<string, unknown>): Product {
  return {
    id: String(dto['id']),
    name: String(dto['name']),
    nameAr: dto['nameAr'] ? String(dto['nameAr']) : undefined,
    sku: String(dto['sku']),
    category: toLowerEnum<ProductCategory>(String(dto['category'])),
    price: Number(dto['price']),
    description: String(dto['description'] ?? ''),
    imageUrl: dto['imageUrl'] ? String(dto['imageUrl']) : undefined,
    allergens: (dto['allergens'] as string[]) ?? [],
    calories: dto['calories'] != null ? Number(dto['calories']) : undefined,
    isAvailable: Boolean(dto['isAvailable']),
    isPopular: Boolean(dto['isPopular']),
    preparationTime: Number(dto['preparationTime'] ?? 0),
    tags: (dto['tags'] as string[]) ?? [],
    rating: dto['rating'] != null ? Number(dto['rating']) : undefined,
    salesCount: Number(dto['salesCount'] ?? 0),
  };
}
