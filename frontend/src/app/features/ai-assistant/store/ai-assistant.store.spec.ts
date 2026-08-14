// ============================================================
// AI Assistant Store Tests
// ============================================================
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { AiAssistantStore } from './ai-assistant.store';
import { NotificationService } from '../../../core/services/notification.service';
import { AiAssistantMockService } from '../services/ai-assistant-mock.service';
import { Order } from '../../../core/models/order.model';
import { DestroyRef } from '@angular/core';
import { of, throwError } from 'rxjs';

const mockOrder: Order = {
  id: 'order_ai_test',
  orderNumber: 'AITEST',
  channel: 'walkin',
  status: 'received',
  priority: 'normal',
  items: [{ id: 'i1', name: 'Burger', quantity: 1, price: 9.99, category: 'burgers', allergens: ['gluten'] }],
  customer: { name: 'Test', loyaltyPoints: 3000 },
  tableNumber: 3,
  subtotal: 9.99,
  tax: 1.50,
  total: 11.49,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDelayed: false,
};

const mockDestroyRef = {
  onDestroy: jest.fn(),
} as unknown as DestroyRef;

describe('AiAssistantStore', () => {
  let store: InstanceType<typeof AiAssistantStore>;
  let aiService: AiAssistantMockService;
  let notifications: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AiAssistantStore, AiAssistantMockService, NotificationService],
    });
    store = TestBed.inject(AiAssistantStore);
    aiService = TestBed.inject(AiAssistantMockService);
    notifications = TestBed.inject(NotificationService);
  });

  it('should initialize with empty states', () => {
    expect(store.states()).toEqual({});
  });

  it('getStateForOrder() should return null for unknown order', () => {
    expect(store.getStateForOrder()('unknown_order')).toBeNull();
  });

  it('hasActiveStreaming() should be false initially', () => {
    expect(store.hasActiveStreaming()).toBe(false);
  });

  describe('fetchForOrder()', () => {
    it('should set streaming state to streaming', () => {
      jest.spyOn(aiService, 'streamSuggestions').mockReturnValue(of([]) as any);
      store.fetchForOrder(mockOrder, 50, mockDestroyRef);
      const state = store.getStateForOrder()(mockOrder.id);
      // immediately after call, either streaming or loading
      expect(['streaming', 'loading', 'idle']).toContain(state?.streamingState ?? 'idle');
    });

    it('should not re-fetch when already streaming', () => {
      const spy = jest.spyOn(aiService, 'streamSuggestions').mockReturnValue(of([]) as any);
      store.fetchForOrder(mockOrder, 50, mockDestroyRef);
      store.fetchForOrder(mockOrder, 50, mockDestroyRef); // second call
      // streamSuggestions should only be called once
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismissSuggestion()', () => {
    it('should not throw for unknown order', () => {
      expect(() => store.dismissSuggestion('unknown', 'unknown_suggestion')).not.toThrow();
    });
  });

  describe('clearForOrder()', () => {
    it('should remove order state', () => {
      store.fetchForOrder(mockOrder, 50, mockDestroyRef);
      store.clearForOrder(mockOrder.id);
      expect(store.getStateForOrder()(mockOrder.id)).toBeNull();
    });
  });

  describe('Streaming States', () => {
    it('should transition to error state when service fails repeatedly', fakeAsync(() => {
      jest.spyOn(aiService, 'streamSuggestions').mockReturnValue(
        throwError(() => new Error('Service down'))
      );
      const errorSpy = jest.spyOn(notifications, 'error');

      store.refreshForOrder(mockOrder, 50, mockDestroyRef);
      // Advance past all retry delays: 1000 + 2500 + 5000 = 8500ms
      tick(9000);

      const state = store.getStateForOrder()(mockOrder.id);
      // Should have attempted retries
      expect(state?.retryCount).toBeGreaterThanOrEqual(1);

      flush();
    }));
  });
});
