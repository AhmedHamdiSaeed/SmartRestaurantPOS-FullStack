// ============================================================
// Orders Store Tests
// ============================================================
import { TestBed } from '@angular/core/testing';
import { OrdersStore } from './orders.store';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';
import { OfflineQueueService } from '../../../core/services/offline-queue.service';
import { ConnectionService } from '../../../core/services/connection.service';

const mockOrder: Order = {
  id: 'test_order_1',
  orderNumber: 'ABC123',
  channel: 'walkin',
  status: 'received',
  priority: 'normal',
  items: [
    { id: 'item_1', name: 'Classic Burger', quantity: 1, price: 9.99, category: 'burgers', allergens: ['gluten'] }
  ],
  customer: { name: 'Test Customer', loyaltyPoints: 100 },
  tableNumber: 5,
  subtotal: 9.99,
  tax: 1.50,
  total: 11.49,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDelayed: false,
};

describe('OrdersStore', () => {
  let store: InstanceType<typeof OrdersStore>;
  let notificationService: NotificationService;
  let connectionService: ConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdersStore, NotificationService, OfflineQueueService, ConnectionService],
    });
    store = TestBed.inject(OrdersStore);
    notificationService = TestBed.inject(NotificationService);
    connectionService = TestBed.inject(ConnectionService);
  });

  it('should initialize with empty orders and idle state', () => {
    expect(store.orders()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.isInitialized()).toBe(false);
  });

  it('should mark as loading during initialization', () => {
    store.initialize();
    expect(store.isLoading()).toBe(true);
  });

  it('should set isInitialized to true after initialize()', done => {
    store.initialize();
    setTimeout(() => {
      expect(store.isInitialized()).toBe(true);
      expect(store.orders().length).toBeGreaterThan(0);
      done();
    }, 1500);
  });

  describe('Filter', () => {
    it('should start with all-filter defaults', () => {
      const f = store.filter();
      expect(f.channel).toBe('all');
      expect(f.status).toBe('all');
      expect(f.priority).toBe('all');
      expect(f.searchTerm).toBe('');
    });

    it('should update filter with setFilter()', () => {
      store.setFilter({ channel: 'walkin' });
      expect(store.filter().channel).toBe('walkin');
    });

    it('should reset filter to defaults', () => {
      store.setFilter({ channel: 'delivery', searchTerm: 'test' });
      store.resetFilter();
      expect(store.filter().channel).toBe('all');
      expect(store.filter().searchTerm).toBe('');
    });
  });

  describe('Order Selection', () => {
    it('should select an order by ID', () => {
      store.selectOrder('order_123');
      expect(store.selectedOrderId()).toBe('order_123');
    });

    it('should deselect when null is passed', () => {
      store.selectOrder('order_123');
      store.selectOrder(null);
      expect(store.selectedOrderId()).toBeNull();
    });

    it('selectedOrder() returns null when no ID set', () => {
      expect(store.selectedOrder()).toBeNull();
    });
  });

  describe('Status Updates', () => {
    beforeEach(() => {
      // Manually inject an order into the store state
      // by using applyKitchenLoadEffect won't work — we test via state manipulation
    });

    it('should not throw when updating non-existent order', () => {
      expect(() => store.updateOrderStatus('non_existent', 'preparing')).not.toThrow();
    });
  });

  describe('Kitchen Load Effects', () => {
    it('should not throw for any load value', () => {
      expect(() => store.applyKitchenLoadEffect(0)).not.toThrow();
      expect(() => store.applyKitchenLoadEffect(75)).not.toThrow();
      expect(() => store.applyKitchenLoadEffect(90)).not.toThrow();
      expect(() => store.applyKitchenLoadEffect(100)).not.toThrow();
    });

    it('should send notification when load >= 90', () => {
      const spy = jest.spyOn(notificationService, 'error');
      store.applyKitchenLoadEffect(95);
      expect(spy).toHaveBeenCalled();
    });

    it('should send warning notification when load is 75–89', () => {
      const spy = jest.spyOn(notificationService, 'warning');
      store.applyKitchenLoadEffect(80);
      expect(spy).toHaveBeenCalled();
    });

    it('should not send notification when load < 75', () => {
      const errSpy = jest.spyOn(notificationService, 'error');
      const warnSpy = jest.spyOn(notificationService, 'warning');
      store.applyKitchenLoadEffect(60);
      expect(errSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Computed Stats', () => {
    it('stats() should return zeroes for empty orders', () => {
      const s = store.stats();
      expect(s.total).toBe(0);
      expect(s.received).toBe(0);
      expect(s.totalRevenue).toBe(0);
    });
  });

  describe('Kanban - ordersByStatus()', () => {
    it('should return object keyed by all status values', () => {
      const byStatus = store.ordersByStatus();
      expect(byStatus).toHaveProperty('received');
      expect(byStatus).toHaveProperty('preparing');
      expect(byStatus).toHaveProperty('ready');
      expect(byStatus).toHaveProperty('delivered');
      expect(byStatus).toHaveProperty('completed');
    });

    it('all statuses should be arrays', () => {
      const byStatus = store.ordersByStatus();
      Object.values(byStatus).forEach(col => expect(Array.isArray(col)).toBe(true));
    });
  });
});
