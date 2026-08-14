// ============================================================
// Kitchen Store Tests
// ============================================================
import { TestBed } from '@angular/core/testing';
import { KitchenStore } from './kitchen.store';
import { KitchenMockService } from '../services/kitchen-mock.service';
import { OrdersStore } from '../../orders/store/orders.store';
import { NotificationService } from '../../../core/services/notification.service';
import { OfflineQueueService } from '../../../core/services/offline-queue.service';
import { ConnectionService } from '../../../core/services/connection.service';

describe('KitchenStore', () => {
  let store: InstanceType<typeof KitchenStore>;
  let kitchenService: KitchenMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KitchenStore, KitchenMockService, OrdersStore,
        NotificationService, OfflineQueueService, ConnectionService,
      ],
    });
    store = TestBed.inject(KitchenStore);
    kitchenService = TestBed.inject(KitchenMockService);
  });

  it('should initialize with null load', () => {
    expect(store.load()).toBeNull();
    expect(store.overallLoad()).toBe(0);
  });

  describe('initialize()', () => {
    it('should load initial kitchen data', () => {
      store.initialize();
      expect(store.load()).not.toBeNull();
      expect(store.load()?.stations.length).toBe(6);
    });

    it('should compute alertLevel correctly', () => {
      store.initialize();
      const validLevels = ['green', 'yellow', 'orange', 'red'];
      expect(validLevels).toContain(store.alertLevel());
    });

    it('should set overallLoad as a number 0–100', () => {
      store.initialize();
      expect(store.overallLoad()).toBeGreaterThanOrEqual(0);
      expect(store.overallLoad()).toBeLessThanOrEqual(100);
    });
  });

  describe('alertColor()', () => {
    it('should return a valid CSS color string', () => {
      store.initialize();
      expect(store.alertColor()).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('stationsSorted()', () => {
    it('should sort stations by load descending', () => {
      store.initialize();
      const sorted = store.stationsSorted();
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].currentLoad).toBeGreaterThanOrEqual(sorted[i + 1].currentLoad);
      }
    });
  });

  describe('loadTrend()', () => {
    it('should return stable when history has < 2 entries', () => {
      expect(store.loadTrend()).toBe('stable');
    });
  });

  describe('estimatedDelay()', () => {
    it('should return 0 initially', () => {
      expect(store.estimatedDelay()).toBe(0);
    });
  });

  describe('Simulation', () => {
    it('triggerRush() should not throw', () => {
      expect(() => store.triggerRush()).not.toThrow();
    });

    it('triggerCooldown() should not throw', () => {
      expect(() => store.triggerCooldown()).not.toThrow();
    });
  });
});
