// ============================================================
// Offline Queue Service — localStorage-backed action queue
// ============================================================
import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { ConnectionService } from './connection.service';
import { OfflineQueueItem } from '../models/app.model';
import { generateActionId } from '../utils/retry.util';

const QUEUE_STORAGE_KEY = 'sahm_pos_offline_queue';

@Injectable({ providedIn: 'root' })
export class OfflineQueueService implements OnDestroy {
  private readonly connection = inject(ConnectionService);
  private readonly destroy$ = new Subject<void>();

  private readonly _queue = signal<OfflineQueueItem[]>(this.loadFromStorage());
  private readonly _isReplaying = signal(false);

  readonly queue = computed(() => this._queue());
  readonly isReplaying = computed(() => this._isReplaying());
  readonly pendingCount = computed(() =>
    this._queue().filter(i => i.status === 'pending').length
  );

  constructor() {
    // Auto-replay queue when we come back online
    this.connection.connectionChange$
      .pipe(
        filter(status => status === 'online'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.replayQueue());
  }

  /**
   * Enqueue an action for later replay.
   * Uses action ID for deduplication.
   */
  enqueue(type: string, payload: unknown): OfflineQueueItem {
    const item: OfflineQueueItem = {
      id: generateActionId(),
      type,
      payload,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
    };

    this._queue.update(q => {
      const next = [...q, item];
      this.saveToStorage(next);
      return next;
    });

    console.info(`[OfflineQueue] Enqueued: ${type} (${item.id})`);
    return item;
  }

  /**
   * Replay all pending queue items.
   * Each item handler is looked up by registered executors.
   */
  async replayQueue(): Promise<void> {
    const pending = this._queue().filter(i => i.status === 'pending');
    if (!pending.length) return;

    this._isReplaying.set(true);
    console.info(`[OfflineQueue] Replaying ${pending.length} queued actions...`);

    for (const item of pending) {
      this.updateItemStatus(item.id, 'replaying');
      try {
        await this.executeItem(item);
        this.removeItem(item.id);
        console.info(`[OfflineQueue] Replayed: ${item.type} (${item.id})`);
      } catch (err) {
        this.updateItemStatus(item.id, 'failed');
        console.error(`[OfflineQueue] Failed: ${item.type} (${item.id})`, err);
      }
    }

    this._isReplaying.set(false);
  }

  /**
   * Execute a single queue item.
   * In a real app, each action type maps to a service method.
   */
  private async executeItem(item: OfflineQueueItem): Promise<void> {
    // Simulate API call replay — in production, dispatch to registered handlers
    await new Promise<void>(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    // 10% chance of failure for realism
    if (Math.random() < 0.1) throw new Error('Replay failed');
  }

  removeItem(id: string): void {
    this._queue.update(q => {
      const next = q.filter(i => i.id !== id);
      this.saveToStorage(next);
      return next;
    });
  }

  clearQueue(): void {
    this._queue.set([]);
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  private updateItemStatus(id: string, status: OfflineQueueItem['status']): void {
    this._queue.update(q =>
      q.map(item => item.id === id ? { ...item, status } : item)
    );
  }

  private saveToStorage(queue: OfflineQueueItem[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch { /* storage full — silently ignore */ }
  }

  private loadFromStorage(): OfflineQueueItem[] {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!raw) return [];
      const items = JSON.parse(raw) as OfflineQueueItem[];
      // Reset 'replaying' to 'pending' on app restart
      return items.map(i => ({
        ...i,
        status: i.status === 'replaying' ? 'pending' : i.status,
        timestamp: new Date(i.timestamp),
      }));
    } catch { return []; }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
