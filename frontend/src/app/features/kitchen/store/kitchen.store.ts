// ============================================================
// Kitchen SignalStore — NgRx SignalStore
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
import { KitchenLoad, KitchenStation } from '../../../core/models/kitchen.model';
import { KitchenApiService } from '../services/kitchen-api.service';
import { OrdersStore } from '../../orders/store/orders.store';

interface KitchenState {
  load: KitchenLoad | null;
  isLoading: boolean;
  history: { load: number; timestamp: Date }[];
}

const MAX_HISTORY = 20;

const initialState: KitchenState = {
  load: null,
  isLoading: false,
  history: [],
};

export const KitchenStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ load, history }) => ({
    overallLoad: computed(() => load()?.overallLoad ?? 0),

    alertLevel: computed(() => load()?.alertLevel ?? 'green'),

    alertColor: computed(() => {
      const level = load()?.alertLevel ?? 'green';
      const colors = { green: '#10b981', yellow: '#f59e0b', orange: '#f97316', red: '#ef4444' };
      return colors[level];
    }),

    stationsSorted: computed(() =>
      [...(load()?.stations ?? [])].sort((a, b) => b.currentLoad - a.currentLoad)
    ),

    loadTrend: computed(() => {
      const h = history();
      if (h.length < 2) return 'stable';
      const last = h[h.length - 1].load;
      const prev = h[h.length - 2].load;
      if (last - prev > 5) return 'rising';
      if (prev - last > 5) return 'falling';
      return 'stable';
    }),

    estimatedDelay: computed(() => load()?.estimatedDelay ?? 0),
  })),

  withMethods((store, kitchenService = inject(KitchenApiService), ordersStore = inject(OrdersStore)) => ({
    initialize(): void {
      kitchenService.getKitchenLoad().subscribe(load => {
        patchState(store, { load });
      });
    },

    startStream(destroyRef: DestroyRef): void {
      kitchenService.pollKitchenLoad(5000)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe(load => {
          const history = [
            ...store.history(),
            { load: load.overallLoad, timestamp: load.lastUpdated },
          ].slice(-MAX_HISTORY);

          patchState(store, { load, history });
          ordersStore.applyKitchenLoadEffect(load.overallLoad);
        });
    },

    triggerRush(): void {
      // Backend handles scheduled load changes; refresh current state
      kitchenService.getKitchenLoad().subscribe(load => patchState(store, { load }));
    },

    triggerCooldown(): void {
      kitchenService.getKitchenLoad().subscribe(load => patchState(store, { load }));
    },
  }))
);
