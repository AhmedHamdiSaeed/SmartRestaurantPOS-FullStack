// ============================================================
// Offline Queue Service Tests
// ============================================================
import { TestBed } from '@angular/core/testing';
import { OfflineQueueService } from './offline-queue.service';
import { ConnectionService } from './connection.service';

const STORAGE_KEY = 'sahm_pos_offline_queue';

describe('OfflineQueueService', () => {
  let service: OfflineQueueService;
  let connectionService: ConnectionService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [OfflineQueueService, ConnectionService],
    });
    service = TestBed.inject(OfflineQueueService);
    connectionService = TestBed.inject(ConnectionService);
  });

  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('should initialize with empty queue', () => {
    expect(service.queue()).toEqual([]);
    expect(service.pendingCount()).toBe(0);
  });

  describe('enqueue()', () => {
    it('should add item to queue', () => {
      service.enqueue('test_action', { data: 'test' });
      expect(service.queue().length).toBe(1);
      expect(service.pendingCount()).toBe(1);
    });

    it('should set correct type and status', () => {
      service.enqueue('order_update', { orderId: '123' });
      const item = service.queue()[0];
      expect(item.type).toBe('order_update');
      expect(item.status).toBe('pending');
    });

    it('should generate unique IDs for each item', () => {
      service.enqueue('action_1', {});
      service.enqueue('action_2', {});
      const ids = service.queue().map(i => i.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('should persist to localStorage', () => {
      service.enqueue('test', {});
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored.length).toBe(1);
    });

    it('should enqueue multiple items', () => {
      service.enqueue('action_a', { a: 1 });
      service.enqueue('action_b', { b: 2 });
      service.enqueue('action_c', { c: 3 });
      expect(service.queue().length).toBe(3);
      expect(service.pendingCount()).toBe(3);
    });
  });

  describe('removeItem()', () => {
    it('should remove item by ID', () => {
      const item = service.enqueue('test', {});
      service.removeItem(item.id);
      expect(service.queue().length).toBe(0);
    });

    it('should not affect other items when removing one', () => {
      const a = service.enqueue('action_a', {});
      service.enqueue('action_b', {});
      service.removeItem(a.id);
      expect(service.queue().length).toBe(1);
      expect(service.queue()[0].type).toBe('action_b');
    });

    it('should update localStorage after removal', () => {
      const item = service.enqueue('test', {});
      service.removeItem(item.id);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored.length).toBe(0);
    });
  });

  describe('clearQueue()', () => {
    it('should empty the queue', () => {
      service.enqueue('a', {});
      service.enqueue('b', {});
      service.clearQueue();
      expect(service.queue()).toEqual([]);
      expect(service.pendingCount()).toBe(0);
    });

    it('should clear localStorage', () => {
      service.enqueue('a', {});
      service.clearQueue();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('pendingCount()', () => {
    it('should only count pending items', () => {
      service.enqueue('a', {});
      service.enqueue('b', {});
      expect(service.pendingCount()).toBe(2);
    });

    it('should return 0 when queue is empty', () => {
      expect(service.pendingCount()).toBe(0);
    });
  });

  describe('isReplaying()', () => {
    it('should start as false', () => {
      expect(service.isReplaying()).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should restore queue from localStorage on init', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        {
          id: 'existing_1',
          type: 'order_update',
          payload: {},
          timestamp: new Date().toISOString(),
          retryCount: 0,
          status: 'pending',
        }
      ]));
      // Re-inject to trigger constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [OfflineQueueService, ConnectionService] });
      const freshService = TestBed.inject(OfflineQueueService);
      expect(freshService.queue().length).toBe(1);
      expect(freshService.queue()[0].id).toBe('existing_1');
    });

    it('should reset replaying items to pending on restore', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        {
          id: 'r1', type: 'update', payload: {},
          timestamp: new Date().toISOString(),
          retryCount: 0, status: 'replaying'
        }
      ]));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [OfflineQueueService, ConnectionService] });
      const freshService = TestBed.inject(OfflineQueueService);
      expect(freshService.queue()[0].status).toBe('pending');
    });
  });
});
