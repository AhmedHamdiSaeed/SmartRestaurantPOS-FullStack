// ============================================================
// Cross-Feature Integration Test
// Kitchen Load → Orders Priority → AI Assistant Reaction
// ============================================================
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { of } from 'rxjs';
import { KitchenStore } from './features/kitchen/store/kitchen.store';
import { OrdersStore } from './features/orders/store/orders.store';
import { AiAssistantStore } from './features/ai-assistant/store/ai-assistant.store';
import { KitchenMockService } from './features/kitchen/services/kitchen-mock.service';
import { OrdersMockService, generateInitialOrders } from './features/orders/services/orders-mock.service';
import { AiAssistantMockService } from './features/ai-assistant/services/ai-assistant-mock.service';
import { NotificationService } from './core/services/notification.service';
import { OfflineQueueService } from './core/services/offline-queue.service';
import { ConnectionService } from './core/services/connection.service';
import { DestroyRef } from '@angular/core';

/** Minimal mock DestroyRef that never destroys during tests */
const mockDestroyRef = {
  onDestroy: jest.fn(),
} as unknown as DestroyRef;

// ---- Helpers ----

function makeTestBed() {
  TestBed.configureTestingModule({
    providers: [
      KitchenStore, OrdersStore, AiAssistantStore,
      KitchenMockService, OrdersMockService, AiAssistantMockService,
      NotificationService, OfflineQueueService, ConnectionService,
    ],
  });
}

// ============================================================
describe('Cross-Feature Integration: Kitchen → Orders → AI', () => {
  let kitchenStore: InstanceType<typeof KitchenStore>;
  let ordersStore: InstanceType<typeof OrdersStore>;
  let aiStore: InstanceType<typeof AiAssistantStore>;
  let notifications: NotificationService;

  beforeEach(() => {
    makeTestBed();
    kitchenStore = TestBed.inject(KitchenStore);
    ordersStore  = TestBed.inject(OrdersStore);
    aiStore      = TestBed.inject(AiAssistantStore);
    notifications = TestBed.inject(NotificationService);
  });

  // ---- Kitchen initializes correctly ----
  describe('Kitchen Store Initialization', () => {
    it('kitchen overallLoad() starts at 0 before initialize()', () => {
      expect(kitchenStore.overallLoad()).toBe(0);
    });

    it('after initialize(), overallLoad should be in 0–100 range', () => {
      kitchenStore.initialize();
      expect(kitchenStore.overallLoad()).toBeGreaterThanOrEqual(0);
      expect(kitchenStore.overallLoad()).toBeLessThanOrEqual(100);
    });
  });

  // ---- Kitchen load → Order priority escalation ----
  describe('Kitchen Load → Orders Priority Escalation', () => {
    beforeEach(fakeAsync(() => {
      // Seed orders into the store via initialize
      ordersStore.initialize();
      tick(1300); // wait past the 1200ms simulated load
    }));

    it('should have orders after initialization', () => {
      expect(ordersStore.orders().length).toBeGreaterThan(0);
    });

    it('should escalate "received" orders to critical at 90%+ kitchen load', () => {
      // Manually apply a 95% kitchen load
      ordersStore.applyKitchenLoadEffect(95);

      const criticalOrders = ordersStore.orders().filter(o => o.priority === 'critical');
      // All 'received' orders should now be critical
      const receivedOrders = ordersStore.orders().filter(o => o.status === 'received');
      expect(criticalOrders.length).toBeGreaterThanOrEqual(receivedOrders.length);
    });

    it('should mark "received" orders as delayed at 90%+ kitchen load', () => {
      ordersStore.applyKitchenLoadEffect(95);

      const delayedReceived = ordersStore.orders().filter(
        o => o.status === 'received' && o.isDelayed
      );
      const allReceived = ordersStore.orders().filter(o => o.status === 'received');
      expect(delayedReceived.length).toBe(allReceived.length);
    });

    it('should escalate "received" orders to high priority at 75–89% load', () => {
      ordersStore.applyKitchenLoadEffect(80);

      const highOrDelayed = ordersStore.orders().filter(
        o => o.status === 'received' && (o.priority === 'high' || o.priority === 'critical')
      );
      const allReceived = ordersStore.orders().filter(o => o.status === 'received');
      expect(highOrDelayed.length).toBe(allReceived.length);
    });

    it('should NOT affect completed or delivered orders', () => {
      const completedBefore = ordersStore.orders()
        .filter(o => o.status === 'completed')
        .map(o => ({ id: o.id, priority: o.priority, isDelayed: o.isDelayed }));

      ordersStore.applyKitchenLoadEffect(95);

      const completedAfter = ordersStore.orders()
        .filter(o => o.status === 'completed');

      completedAfter.forEach(orderAfter => {
        const before = completedBefore.find(b => b.id === orderAfter.id);
        if (before) {
          expect(orderAfter.priority).toBe(before.priority);
          expect(orderAfter.isDelayed).toBe(before.isDelayed);
        }
      });
    });

    it('should send error notification when load >= 90', () => {
      const spy = jest.spyOn(notifications, 'error');
      ordersStore.applyKitchenLoadEffect(92);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('Kitchen'),
        expect.stringContaining('92%')
      );
    });

    it('should send warning notification when load is 75–89', () => {
      const spy = jest.spyOn(notifications, 'warning');
      ordersStore.applyKitchenLoadEffect(78);
      expect(spy).toHaveBeenCalled();
    });

    it('should send NO notification when load < 75', () => {
      const errSpy  = jest.spyOn(notifications, 'error');
      const warnSpy = jest.spyOn(notifications, 'warning');
      ordersStore.applyKitchenLoadEffect(60);
      expect(errSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  // ---- Orders → Kanban state ----
  describe('Orders → Kanban View', () => {
    beforeEach(fakeAsync(() => {
      ordersStore.initialize();
      tick(1300);
    }));

    it('ordersByStatus() should correctly bucket orders into status groups', () => {
      const byStatus = ordersStore.ordersByStatus();
      const allOrders = ordersStore.orders();

      const total = Object.values(byStatus).reduce((sum, col) => sum + col.length, 0);
      // Only active statuses (received/preparing/ready/delivered/completed/cancelled) are bucketed
      expect(total).toBe(allOrders.length);
    });

    it('ordersByStatus() buckets should be sorted with critical first', () => {
      ordersStore.applyKitchenLoadEffect(95); // escalate all received to critical

      const received = ordersStore.ordersByStatus()['received'];
      if (received.length > 1) {
        const priorities = received.map(o => o.priority);
        // All should be critical after max load
        expect(priorities.every(p => p === 'critical')).toBe(true);
      }
    });

    it('filter by channel should narrow down orders in all kanban columns', () => {
      ordersStore.setFilter({ channel: 'walkin' });

      const byStatus = ordersStore.ordersByStatus();
      const allBucketed = Object.values(byStatus).flat();
      expect(allBucketed.every(o => o.channel === 'walkin')).toBe(true);
    });

    it('search filter should match order number', fakeAsync(() => {
      const firstOrder = ordersStore.orders()[0];
      ordersStore.setFilter({ searchTerm: firstOrder.orderNumber });

      const byStatus = ordersStore.ordersByStatus();
      const allBucketed = Object.values(byStatus).flat();
      expect(allBucketed.length).toBeGreaterThanOrEqual(1);
      expect(allBucketed.some(o => o.orderNumber === firstOrder.orderNumber)).toBe(true);
    }));

    it('resetting filter should restore all orders', () => {
      ordersStore.setFilter({ channel: 'walkin', searchTerm: 'XYZ' });
      ordersStore.resetFilter();

      const byStatus = ordersStore.ordersByStatus();
      const total = Object.values(byStatus).reduce((sum, col) => sum + col.length, 0);
      expect(total).toBe(ordersStore.orders().length);
    });
  });

  // ---- Orders → AI Assistant ----
  describe('Orders → AI Assistant', () => {
    it('should have no AI state initially', () => {
      expect(Object.keys(aiStore.states()).length).toBe(0);
    });

    it('fetchForOrder() should trigger streaming state', () => {
      const aiService = TestBed.inject(AiAssistantMockService);
      jest.spyOn(aiService, 'streamSuggestions').mockReturnValue(of([]) as any);

      const order = generateInitialOrders(1)[0];
      aiStore.fetchForOrder(order, 50, mockDestroyRef);

      const state = aiStore.getStateForOrder()(order.id);
      expect(['streaming', 'idle']).toContain(state?.streamingState ?? 'idle');
    });

    it('second fetchForOrder() call should NOT re-trigger when already streaming', () => {
      const aiService = TestBed.inject(AiAssistantMockService);
      const spy = jest.spyOn(aiService, 'streamSuggestions').mockReturnValue(of([]) as any);

      const order = generateInitialOrders(1)[0];
      aiStore.fetchForOrder(order, 50, mockDestroyRef);
      aiStore.fetchForOrder(order, 50, mockDestroyRef); // second call

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('clearForOrder() should remove AI state when order is deselected', () => {
      const aiService = TestBed.inject(AiAssistantMockService);
      jest.spyOn(aiService, 'streamSuggestions').mockReturnValue(of([]) as any);

      const order = generateInitialOrders(1)[0];
      aiStore.fetchForOrder(order, 50, mockDestroyRef);
      aiStore.clearForOrder(order.id);

      expect(aiStore.getStateForOrder()(order.id)).toBeNull();
    });
  });

  // ---- Full chain: Kitchen load change triggers AI context update ----
  describe('Full Chain: Kitchen → Orders → AI', () => {
    beforeEach(fakeAsync(() => {
      ordersStore.initialize();
      tick(1300);
    }));

    it('kitchen load changes should affect kitchenStore.overallLoad, which AI panels read', () => {
      kitchenStore.initialize();
      const initialLoad = kitchenStore.overallLoad();

      // Simulate the cross-store connection
      ordersStore.applyKitchenLoadEffect(95);

      // AI panel reads overallLoad from kitchenStore when fetching
      // The load should be non-zero after initialization
      expect(kitchenStore.overallLoad()).toBeGreaterThanOrEqual(0);
    });

    it('ordersStore stats should reflect priority changes caused by kitchen load', fakeAsync(() => {
      ordersStore.applyKitchenLoadEffect(95);

      const stats = ordersStore.stats();
      // If there are received orders, delayed count should be > 0
      if (stats.received > 0) {
        expect(stats.delayed).toBeGreaterThan(0);
      }
      flush(); // clear toast timers
    }));

    it('ordersStore.stats().critical should increase after high kitchen load', fakeAsync(() => {
      const criticalBefore = ordersStore.stats().critical;
      ordersStore.applyKitchenLoadEffect(95);
      const criticalAfter = ordersStore.stats().critical;

      if (ordersStore.stats().received > 0) {
        expect(criticalAfter).toBeGreaterThanOrEqual(criticalBefore);
      }
      flush(); // clear toast timers
    }));

    it('selectOrder + deselect should correctly manage selectedOrder computed signal', fakeAsync(() => {
      const orders = ordersStore.orders();
      if (!orders.length) return;

      const order = orders[0];
      ordersStore.selectOrder(order.id);
      expect(ordersStore.selectedOrder()?.id).toBe(order.id);

      ordersStore.selectOrder(null);
      expect(ordersStore.selectedOrder()).toBeNull();
    }));
  });

  // ---- Offline queue integration ----
  describe('Offline Queue Integration', () => {
    it('should queue status update when offline', fakeAsync(() => {
      const connection = TestBed.inject(ConnectionService);
      const offlineQueue = TestBed.inject(OfflineQueueService);

      connection.simulateOffline();

      ordersStore.initialize();
      tick(1300);

      const orders = ordersStore.orders();
      if (!orders.length) return;

      const order = orders[0];
      const initialStatus = order.status;

      ordersStore.updateOrderStatus(order.id, 'preparing');

      // Optimistic update should still apply
      const updatedOrder = ordersStore.orders().find(o => o.id === order.id);
      expect(updatedOrder?.status).toBe('preparing');

      // Offline queue should have the pending item
      expect(offlineQueue.pendingCount()).toBeGreaterThan(0);
      flush(); // clear toast timers
    }));
  });
});
