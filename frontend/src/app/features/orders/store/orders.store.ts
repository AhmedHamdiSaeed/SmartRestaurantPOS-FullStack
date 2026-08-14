// ============================================================
// Orders SignalStore — NgRx SignalStore
// ============================================================
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order, OrderStatus, OrderChannel, OrderPriority, ORDER_STATUS_FLOW, OrderFilter } from '../../../core/models/order.model';
import { OrdersApiService } from '../services/orders-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OfflineQueueService } from '../../../core/services/offline-queue.service';
import { ConnectionService } from '../../../core/services/connection.service';

// ---- State Interface ----
interface OrdersState {
  orders: Order[];
  filter: OrderFilter;
  selectedOrderId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  lastSyncAt: Date | null;
  simulationActive: boolean;
}

const initialState: OrdersState = {
  orders: [],
  filter: { channel: 'all', status: 'all', priority: 'all', searchTerm: '' },
  selectedOrderId: null,
  isLoading: false,
  isInitialized: false,
  lastSyncAt: null,
  simulationActive: false,
};

// ---- Store ----
export const OrdersStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ orders, filter, selectedOrderId }) => ({
    /** Filter orders based on active filter state */
    filteredOrders: computed(() => {
      const all = orders();
      const f = filter();
      return all.filter(o => {
        if (f.channel !== 'all' && o.channel !== f.channel) return false;
        if (f.status !== 'all' && o.status !== f.status) return false;
        if (f.priority !== 'all' && o.priority !== f.priority) return false;
        if (f.searchTerm) {
          const q = f.searchTerm.toLowerCase();
          return (
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            o.items.some(i => i.name.toLowerCase().includes(q))
          );
        }
        return true;
      });
    }),

    /** Orders grouped by status for Kanban view */
    ordersByStatus: computed(() => {
      const all = orders();
      const f = filter();

      // Apply channel, priority, and search filters (but NOT status filter,
      // since kanban columns already separate by status)
      const filtered = all.filter(o => {
        if (f.channel !== 'all' && o.channel !== f.channel) return false;
        if (f.priority !== 'all' && o.priority !== f.priority) return false;
        if (f.searchTerm) {
          const q = f.searchTerm.toLowerCase();
          return (
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            o.items.some(i => i.name.toLowerCase().includes(q))
          );
        }
        return true;
      });

      const statusOrder = ORDER_STATUS_FLOW;
      return statusOrder.reduce((acc, status) => {
        acc[status] = filtered
          .filter(o => o.status === status)
          .sort((a, b) => {
            // Critical first, then High, then by age
            const pMap = { critical: 0, high: 1, normal: 2 };
            const pd = pMap[a.priority] - pMap[b.priority];
            return pd !== 0 ? pd : a.createdAt.getTime() - b.createdAt.getTime();
          });
        return acc;
      }, {} as Record<OrderStatus, Order[]>);
    }),

    /** Selected order object */
    selectedOrder: computed(() => {
      const id = selectedOrderId();
      return id ? orders().find(o => o.id === id) ?? null : null;
    }),

    /** Dashboard stats */
    stats: computed(() => {
      const all = orders();
      return {
        total: all.length,
        received: all.filter(o => o.status === 'received').length,
        preparing: all.filter(o => o.status === 'preparing').length,
        ready: all.filter(o => o.status === 'ready').length,
        delivered: all.filter(o => o.status === 'delivered').length,
        completed: all.filter(o => o.status === 'completed').length,
        delayed: all.filter(o => o.isDelayed).length,
        critical: all.filter(o => o.priority === 'critical').length,
        walkin: all.filter(o => o.channel === 'walkin').length,
        delivery: all.filter(o => o.channel === 'delivery').length,
        online: all.filter(o => o.channel === 'online').length,
        totalRevenue: all
          .filter(o => ['delivered','completed'].includes(o.status))
          .reduce((s, o) => s + o.total, 0),
      };
    }),
  })),

  withMethods((store, ordersService = inject(OrdersApiService), notifications = inject(NotificationService), offlineQueue = inject(OfflineQueueService), connection = inject(ConnectionService)) => ({
    /** Load initial orders from API */
    initialize(): void {
      if (store.isInitialized()) return;
      patchState(store, { isLoading: true });

      ordersService.getOrders().subscribe({
        next: orders => {
          patchState(store, {
            orders,
            isLoading: false,
            isInitialized: true,
            lastSyncAt: new Date(),
          });
        },
        error: () => {
          patchState(store, { isLoading: false, isInitialized: true });
          notifications.error('Load Failed', 'Could not load orders from server');
        },
      });
    },

    /** Poll orders for live updates */
    startEventStream(destroyRef: DestroyRef): void {
      patchState(store, { simulationActive: true });

      ordersService.pollOrders(8000)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: orders => {
            const prevCount = store.orders().length;
            patchState(store, { orders, lastSyncAt: new Date() });
            if (orders.length > prevCount) {
              const newest = orders[0];
              if (newest) {
                notifications.info('New Order', `#${newest.orderNumber} — ${newest.channel}`);
              }
            }
          },
        });
    },

    /** Optimistic status update via API */
    updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
      const original = store.orders().find(o => o.id === orderId);
      if (!original) return;

      patchState(store, {
        orders: store.orders().map(o =>
          o.id === orderId
            ? { ...o, status: newStatus, updatedAt: new Date() }
            : o
        ),
      });

      if (!connection.isOnline()) {
        offlineQueue.enqueue('order_status_update', { orderId, newStatus });
        notifications.warning('Offline', 'Status update queued for sync');
        return;
      }

      ordersService.updateStatus(orderId, newStatus).subscribe({
        next: updated => {
          patchState(store, {
            orders: store.orders().map(o => o.id === orderId ? updated : o),
          });
        },
        error: () => {
          patchState(store, {
            orders: store.orders().map(o =>
              o.id === orderId ? { ...o, status: original.status } : o
            ),
          });
          notifications.error('Update Failed', 'Order status could not be updated');
        },
      });
    },

    setOrderPriority(orderId: string, priority: OrderPriority): void {
      const original = store.orders().find(o => o.id === orderId);
      if (!original) return;

      patchState(store, {
        orders: store.orders().map(o =>
          o.id === orderId ? { ...o, priority, updatedAt: new Date() } : o
        ),
      });

      ordersService.updatePriority(orderId, priority).subscribe({
        next: updated => {
          patchState(store, {
            orders: store.orders().map(o => o.id === orderId ? updated : o),
          });
        },
        error: () => {
          patchState(store, {
            orders: store.orders().map(o =>
              o.id === orderId ? { ...o, priority: original.priority } : o
            ),
          });
        },
      });
    },

    addOrderItem(orderId: string, item: { name: string; price: number; quantity: number; allergens?: string[]; category: string }): void {
      patchState(store, {
        orders: store.orders().map(o => {
          if (o.id !== orderId) return o;
          
          const newItem = {
            id: `item_${Date.now()}`,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            allergens: item.allergens ?? [],
            category: item.category
          };
          
          const items = [...o.items, newItem];
          const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const tax = subtotal * 0.15;
          const total = subtotal + tax;
          
          return {
            ...o,
            items,
            subtotal,
            tax,
            total,
            updatedAt: new Date()
          };
        })
      });
    },

    assignOrderTable(orderId: string, tableNumber: number): void {
      patchState(store, {
        orders: store.orders().map(o =>
          o.id === orderId
            ? { ...o, tableNumber, updatedAt: new Date() }
            : o
        )
      });
    },

    selectOrder(orderId: string | null): void {
      patchState(store, { selectedOrderId: orderId });
    },

    setFilter(partial: Partial<OrderFilter>): void {
      patchState(store, { filter: { ...store.filter(), ...partial } });
    },

    resetFilter(): void {
      patchState(store, { filter: initialState.filter });
    },

    /** Called by KitchenStore when load changes significantly */
    applyKitchenLoadEffect(overallLoad: number): void {
      const orders = store.orders();
      const updated = orders.map(order => {
        if (['completed', 'cancelled', 'delivered'].includes(order.status)) return order;

        let priority = order.priority;
        let isDelayed = order.isDelayed;
        let delayReason: string | undefined;

        if (overallLoad >= 90 && order.status === 'received') {
          priority = 'critical';
          isDelayed = true;
          delayReason = 'Kitchen at max capacity';
        } else if (overallLoad >= 75 && order.status === 'received') {
          priority = priority === 'normal' ? 'high' : priority;
          isDelayed = true;
          delayReason = 'High kitchen load';
        }

        return { ...order, priority, isDelayed, delayReason };
      });

      patchState(store, { orders: updated });

      if (overallLoad >= 90) {
        notifications.error('🔥 Kitchen Overloaded!', `Load at ${overallLoad}% — Orders will be delayed`);
      } else if (overallLoad >= 75) {
        notifications.warning('Kitchen Busy', `Load at ${overallLoad}% — Minor delays expected`);
      }
    },
  }))
);
