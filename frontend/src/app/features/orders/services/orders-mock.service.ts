// ============================================================
// Orders Mock Service — Simulated WebSocket stream
// ============================================================
import { Injectable } from '@angular/core';
import { Observable, interval, Subject, merge, timer } from 'rxjs';
import { map, filter, share, switchMap, startWith } from 'rxjs/operators';
import { Order, OrderStatus, OrderChannel, OrderPriority, ORDER_STATUS_FLOW } from '../../../core/models/order.model';
import { generateOrderNumber } from '../../../core/utils/retry.util';

// ---- Mock Data Helpers ----
const CUSTOMER_NAMES = [
  'Ahmed Al-Rashidi','Sara Mohammed','Khalid Hassan','Fatima Al-Zahra',
  'Omar Nasser','Rania Ibrahim','Yusuf Al-Amin','Layla Saleh',
  'Tariq Mahmoud','Hana Al-Jabri','Bilal Karimi','Aisha Qasim',
  'Ziad El-Masri','Nour Haddad','Samir Farouk','Dina Khalil',
];

const MENU_ITEMS = [
  { name:'Classic Smash Burger', price:8.99, category:'burgers' },
  { name:'Crispy Chicken Burger', price:9.49, category:'burgers' },
  { name:'Margherita Pizza', price:11.99, category:'pizza' },
  { name:'Caesar Salad', price:7.99, category:'salads' },
  { name:'Spaghetti Bolognese', price:10.99, category:'pasta' },
  { name:'Crispy Fries', price:3.49, category:'sides' },
  { name:'Chocolate Lava Cake', price:5.99, category:'desserts' },
  { name:'Iced Latte', price:3.99, category:'drinks' },
  { name:'BBQ Chicken Pizza', price:13.99, category:'pizza' },
  { name:'Grilled Chicken Wrap', price:8.49, category:'sandwiches' },
  { name:'Burger & Fries Combo', price:12.99, category:'combos' },
  { name:'Mac & Cheese', price:4.49, category:'sides' },
  { name:'Tiramisu', price:5.99, category:'desserts' },
  { name:'Mango Smoothie', price:4.49, category:'drinks' },
  { name:'Avocado Toast', price:7.99, category:'breakfast' },
];

const CHANNELS: OrderChannel[] = ['walkin', 'delivery', 'online'];
const ALLERGENS = ['gluten', 'dairy', 'nuts', 'eggs', 'shellfish', 'soy'];
const DELIVERY_ADDRESSES = [
  'King Fahd Road, Riyadh', 'Olaya District', 'Al Malqa, Riyadh',
  'Tahlia Street', 'Al Nakheel, Riyadh', 'Exit 5, Ring Road',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrder(): Order {
  const channel = randomFrom(CHANNELS);
  const itemCount = randomBetween(1, 4);
  const items = Array.from({ length: itemCount }, (_, i) => {
    const menuItem = randomFrom(MENU_ITEMS);
    const qty = randomBetween(1, 3);
    return {
      id: `item_${Date.now()}_${i}`,
      name: menuItem.name,
      quantity: qty,
      price: menuItem.price,
      category: menuItem.category,
      allergens: Math.random() > 0.7 ? [randomFrom(ALLERGENS)] : [],
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.15;

  return {
    id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    orderNumber: generateOrderNumber(),
    channel,
    status: 'received',
    priority: 'normal',
    items,
    customer: {
      name: randomFrom(CUSTOMER_NAMES),
      phone: `+966 5${randomBetween(10000000, 99999999)}`,
      loyaltyPoints: randomBetween(0, 5000),
    },
    tableNumber: channel === 'walkin' ? randomBetween(1, 24) : undefined,
    deliveryAddress: channel === 'delivery' ? randomFrom(DELIVERY_ADDRESSES) : undefined,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat((subtotal + tax).toFixed(2)),
    createdAt: new Date(),
    updatedAt: new Date(),
    estimatedReadyTime: new Date(Date.now() + randomBetween(10, 30) * 60000),
    isDelayed: false,
    notes: Math.random() > 0.8 ? 'Extra sauce please' : undefined,
  };
}

// ---- Seed Orders ----
export function generateInitialOrders(count = 14): Order[] {
  const statuses: OrderStatus[] = ['received', 'received', 'preparing', 'preparing', 'preparing', 'ready', 'delivered'];
  return Array.from({ length: count }, (_, i) => {
    const order = generateOrder();
    order.status = statuses[i % statuses.length];
    order.createdAt = new Date(Date.now() - randomBetween(2, 45) * 60000);
    order.updatedAt = new Date(Date.now() - randomBetween(0, 5) * 60000);
    return order;
  });
}

// ---- Service ----
export interface OrderEvent {
  type: 'new_order' | 'status_update' | 'priority_change' | 'order_cancelled';
  orderId?: string;
  newStatus?: OrderStatus;
  newPriority?: OrderPriority;
  order?: Order;
}

@Injectable({ providedIn: 'root' })
export class OrdersMockService {
  private readonly manualEvents$ = new Subject<OrderEvent>();

  /**
   * Simulated WebSocket stream — emits random order events.
   * Interval: 4–12 seconds
   */
  getOrderEventStream(): Observable<OrderEvent> {
    const autoEvents$ = interval(6000).pipe(
      map(() => this.generateRandomEvent()),
      filter((e): e is OrderEvent => e !== null),
    );

    return merge(autoEvents$, this.manualEvents$).pipe(share());
  }

  /**
   * Burst of new orders — simulates lunch rush
   */
  triggerLunchRush(currentOrders: Order[]): OrderEvent[] {
    return Array.from({ length: randomBetween(3, 6) }, () => ({
      type: 'new_order' as const,
      order: generateOrder(),
    }));
  }

  /** Manually push an event (for testing / UI simulation buttons) */
  pushEvent(event: OrderEvent): void {
    this.manualEvents$.next(event);
  }

  /** Trigger a single new order manually */
  triggerNewOrderManual(): void {
    this.pushEvent({
      type: 'new_order',
      order: generateOrder(),
    });
  }

  /** Trigger a rush of multiple orders manually */
  triggerLunchRushManual(): void {
    const rushEvents = this.triggerLunchRush([]);
    rushEvents.forEach((ev, idx) => {
      setTimeout(() => this.pushEvent(ev), idx * 250);
    });
  }

  private generateRandomEvent(): OrderEvent | null {
    const roll = Math.random();

    if (roll < 0.35) {
      // New order arrival
      return { type: 'new_order', order: generateOrder() };
    } else if (roll < 0.85) {
      // Status update — needs the store to pick a target order
      return {
        type: 'status_update',
        orderId: '__random__',
        newStatus: randomFrom(['preparing', 'ready', 'delivered'] as OrderStatus[]),
      };
    } else if (roll < 0.95) {
      return {
        type: 'priority_change',
        orderId: '__random__',
        newPriority: randomFrom(['high', 'critical'] as OrderPriority[]),
      };
    }
    return null;
  }
}
