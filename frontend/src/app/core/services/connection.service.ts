// ============================================================
// Connection Service — Online/Offline detection
// ============================================================
import { Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { Subject, fromEvent, merge } from 'rxjs';
import { takeUntil, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';

export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class ConnectionService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  /** Writable signal for current connection status */
  private readonly _status = signal<ConnectionStatus>(
    navigator.onLine ? 'online' : 'offline'
  );

  /** Public read-only computed signals */
  readonly status = computed(() => this._status());
  readonly isOnline = computed(() => this._status() === 'online');
  readonly isOffline = computed(() => this._status() === 'offline');
  readonly isReconnecting = computed(() => this._status() === 'reconnecting');

  /** Emit connection events for other services to react to */
  readonly connectionChange$ = new Subject<ConnectionStatus>();

  constructor() {
    this.initConnectionListeners();

    // Log connection changes
    effect(() => {
      const status = this._status();
      console.info(`[ConnectionService] Status: ${status}`);
    });
  }

  private initConnectionListeners(): void {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$)
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(isOnline => {
        if (isOnline) {
          this._status.set('reconnecting');
          this.connectionChange$.next('reconnecting');
          // Small delay to verify connection before marking truly online
          setTimeout(() => {
            this._status.set('online');
            this.connectionChange$.next('online');
          }, 1500);
        } else {
          this._status.set('offline');
          this.connectionChange$.next('offline');
        }
      });
  }

  /** Manually simulate offline for testing */
  simulateOffline(): void {
    this._status.set('offline');
    this.connectionChange$.next('offline');
  }

  simulateOnline(): void {
    this._status.set('reconnecting');
    this.connectionChange$.next('reconnecting');
    setTimeout(() => {
      this._status.set('online');
      this.connectionChange$.next('online');
    }, 2000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
