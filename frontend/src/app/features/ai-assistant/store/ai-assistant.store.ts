// ============================================================
// AI Assistant SignalStore — NgRx SignalStore
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
import { of } from 'rxjs';
import { catchError, delay, switchMap, take } from 'rxjs/operators';
import { NotificationService } from '../../../core/services/notification.service';
import { AiAssistantState, AiStreamingState, AiSuggestion } from '../../../core/models/ai-suggestion.model';
import { Order } from '../../../core/models/order.model';
import { AiAssistantMockService } from '../services/ai-assistant-mock.service';

interface AiStoreState {
  states: Record<string, AiAssistantState>;
  globalLoading: boolean;
}

const initialState: AiStoreState = {
  states: {},
  globalLoading: false,
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2500, 5000]; // ms

export const AiAssistantStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ states }) => ({
    getStateForOrder: computed(() => (orderId: string): AiAssistantState | null =>
      states()[orderId] ?? null
    ),

    hasActiveStreaming: computed(() =>
      Object.values(states()).some(s => s.streamingState === 'streaming')
    ),
  })),

  withMethods((store, aiService = inject(AiAssistantMockService), notifications = inject(NotificationService)) => {
    function setOrderState(orderId: string, partial: Partial<AiAssistantState>): void {
      const current = store.states()[orderId] ?? {
        orderId,
        suggestions: [],
        streamingState: 'idle' as AiStreamingState,
        retryCount: 0,
        maxRetries: MAX_RETRIES,
      };
      patchState(store, {
        states: { ...store.states(), [orderId]: { ...current, ...partial } },
      });
    }

    function streamSuggestionsForOrder(
      order: Order,
      kitchenLoad: number,
      retryCount: number,
      destroyRef: DestroyRef
    ): void {
      setOrderState(order.id, {
        streamingState: retryCount > 0 ? 'retrying' : 'streaming',
        retryCount,
      });

      aiService.streamSuggestions(order, kitchenLoad)
        .pipe(
          catchError(err => {
            if (retryCount < MAX_RETRIES) {
              const delayMs = RETRY_DELAYS[retryCount] ?? 5000;
              console.warn(`[AiStore] Retry ${retryCount + 1}/${MAX_RETRIES} for order ${order.id} in ${delayMs}ms`);
              return of(null).pipe(
                delay(delayMs),
                switchMap(() => {
                  streamSuggestionsForOrder(order, kitchenLoad, retryCount + 1, destroyRef);
                  return of(null);
                })
              );
            }
            // Max retries exhausted
            setOrderState(order.id, {
              streamingState: 'error',
              errorMessage: `Failed after ${MAX_RETRIES} retries. ${err.message}`,
            });
            notifications.error('AI Assistant Error', 'Could not load suggestions for this order');
            return of(null);
          }),
          take(1),
          takeUntilDestroyed(destroyRef)
        )
        .subscribe(suggestions => {
          if (!suggestions) return;

          // Begin streaming each suggestion's message character by character
          const initialSuggestions: AiSuggestion[] = suggestions.map((s: AiSuggestion) => ({ ...s, streamedMessage: '' }));
          setOrderState(order.id, {
            suggestions: initialSuggestions,
            streamingState: 'streaming',
            lastFetchedAt: new Date(),
          });

          // Stream each suggestion's message
          suggestions.forEach((suggestion: AiSuggestion, idx: number) => {
            const startDelay = idx * 800; // stagger suggestions
            setTimeout(() => {
              aiService.streamMessage(order.id, suggestion.id, suggestion.message)
                .pipe(takeUntilDestroyed(destroyRef))
                .subscribe({
                  next: chunk => {
                    const current = store.states()[order.id];
                    if (!current) return;
                    const updatedSuggestions = current.suggestions.map(s =>
                      s.id === chunk.suggestionId
                        ? { ...s, streamedMessage: s.streamedMessage + chunk.chunk }
                        : s
                    );
                    setOrderState(order.id, { suggestions: updatedSuggestions });
                  },
                  complete: () => {
                    if (idx === suggestions.length - 1) {
                      setOrderState(order.id, { streamingState: 'complete' });
                    }
                  },
                });
            }, startDelay);
          });
        });
    }

    return {
      /** Fetch and stream AI suggestions for an order */
      fetchForOrder(order: Order, kitchenLoad: number, destroyRef: DestroyRef): void {
        const existing = store.states()[order.id];
        // Don't re-fetch if already streaming or recently fetched
        if (existing?.streamingState === 'streaming' || existing?.streamingState === 'retrying') return;
        if (existing?.streamingState === 'complete' && existing.lastFetchedAt) {
          const ageMs = Date.now() - existing.lastFetchedAt.getTime();
          if (ageMs < 60000) return; // Cache for 1 minute
        }

        streamSuggestionsForOrder(order, kitchenLoad, 0, destroyRef);
      },

      /** Force refresh (bypass cache) */
      refreshForOrder(order: Order, kitchenLoad: number, destroyRef: DestroyRef): void {
        setOrderState(order.id, { streamingState: 'idle', suggestions: [] });
        streamSuggestionsForOrder(order, kitchenLoad, 0, destroyRef);
      },

      clearForOrder(orderId: string): void {
        const { [orderId]: _, ...rest } = store.states();
        patchState(store, { states: rest });
      },

      dismissSuggestion(orderId: string, suggestionId: string): void {
        const current = store.states()[orderId];
        if (!current) return;
        setOrderState(orderId, {
          suggestions: current.suggestions.filter(s => s.id !== suggestionId),
        });
      },
    };
  })
);
