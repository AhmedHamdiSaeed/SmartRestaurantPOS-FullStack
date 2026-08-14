// ============================================================
// Kitchen Mock Service — Live load simulation
// ============================================================
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, interval, Subject, BehaviorSubject, merge } from 'rxjs';
import { map, share, takeUntil } from 'rxjs/operators';
import { KitchenLoad, KitchenStation, getAlertLevel } from '../../../core/models/kitchen.model';

const STATION_DEFS = [
  { id: 'grill',     name: 'Grill Station',    type: 'grill'     as const, maxCapacity: 20 },
  { id: 'fryer',     name: 'Fryer Station',    type: 'fryer'     as const, maxCapacity: 25 },
  { id: 'salad',     name: 'Cold Kitchen',     type: 'salad'     as const, maxCapacity: 15 },
  { id: 'dessert',   name: 'Dessert Station',  type: 'dessert'   as const, maxCapacity: 12 },
  { id: 'drinks',    name: 'Beverages',        type: 'drinks'    as const, maxCapacity: 30 },
  { id: 'packaging', name: 'Packaging',        type: 'packaging' as const, maxCapacity: 35 },
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStation(def: typeof STATION_DEFS[0], prevLoad = 50): KitchenStation {
  // Gradually drift load ±15% for realism
  const delta = randomBetween(-15, 15);
  const newLoad = Math.max(0, Math.min(100, prevLoad + delta));
  const activeOrders = Math.round((newLoad / 100) * def.maxCapacity);

  let status: KitchenStation['status'] = 'normal';
  if (newLoad >= 90) status = 'overloaded';
  else if (newLoad >= 70) status = 'busy';

  return {
    ...def,
    currentLoad: newLoad,
    activeOrders,
    avgPrepTime: randomBetween(8, 20),
    status,
    lastUpdated: new Date(),
  };
}

function buildKitchenLoad(stations: KitchenStation[]): KitchenLoad {
  const weights = [0.3, 0.25, 0.1, 0.1, 0.1, 0.15]; // Grill/Fryer matter most
  const overallLoad = stations.reduce((sum, s, i) => sum + s.currentLoad * weights[i], 0);
  const queueDepth = stations.reduce((sum, s) => sum + s.activeOrders, 0);
  const estimatedDelay = overallLoad > 80 ? Math.round((overallLoad - 80) * 0.5) : 0;

  return {
    overallLoad: Math.round(overallLoad),
    stations,
    queueDepth,
    estimatedDelay,
    alertLevel: getAlertLevel(overallLoad),
    lastUpdated: new Date(),
  };
}

@Injectable({ providedIn: 'root' })
export class KitchenMockService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private currentStations: KitchenStation[] = STATION_DEFS.map(d => generateStation(d, 50));
  private readonly manualLoad$ = new Subject<KitchenLoad>();

  /** Initial snapshot */
  getInitialLoad(): KitchenLoad {
    return buildKitchenLoad(this.currentStations);
  }

  /**
   * Simulated live stream — updates every 5 seconds.
   * Stations drift gradually to simulate realistic kitchen behavior.
   */
  getKitchenLoadStream(): Observable<KitchenLoad> {
    const auto$ = interval(5000).pipe(
      map(() => {
        this.currentStations = this.currentStations.map((s, i) =>
          generateStation(STATION_DEFS[i], s.currentLoad)
        );
        return buildKitchenLoad(this.currentStations);
      }),
      takeUntil(this.destroy$)
    );

    return merge(auto$, this.manualLoad$).pipe(share());
  }

  /** Simulate a sudden rush (for UI testing button) */
  simulateRush(): void {
    this.currentStations = STATION_DEFS.map(d => generateStation(d, 88));
    this.manualLoad$.next(buildKitchenLoad(this.currentStations));
  }

  /** Simulate cool-down */
  simulateCooldown(): void {
    this.currentStations = STATION_DEFS.map(d => generateStation(d, 25));
    this.manualLoad$.next(buildKitchenLoad(this.currentStations));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
