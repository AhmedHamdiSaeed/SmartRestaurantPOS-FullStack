import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionService } from '../../../../core/services/connection.service';
import { OfflineQueueService } from '../../../../core/services/offline-queue.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OfflineQueueItem } from '../../../../core/models/app.model';

@Component({
  selector: 'app-offline-demo',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offline-demo.component.html',
  styles: [`
    .offline-workspace {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      overflow-y: auto;
      height: 100%;
    }
    .offline-header {}
    .offline-title { font-size: var(--text-2xl); font-weight: 800; margin-bottom: 4px; }
    .section-title { font-size: var(--text-md); font-weight: 700; margin-bottom: var(--space-md); }

    .connection-card {}
    .connection-display {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      padding: var(--space-lg);
      background: var(--bg-overlay);
      border-radius: var(--radius-lg);
    }
    .connection-icon {
      font-size: 46px;
      transition: filter var(--transition-normal);
    }
    .connection-icon--offline { filter: grayscale(1); }
    .connection-info { display: flex; flex-direction: column; gap: 4px; }
    .connection-status { font-size: var(--text-2xl); font-weight: 800; }

    .queue-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--brand-secondary);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-left: 8px;
    }

    .replaying-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: rgba(251,191,36,0.1);
      border: 1px solid rgba(251,191,36,0.3);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md);
    }

    .empty-queue {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      justify-content: center;
      color: var(--text-muted);
    }
    .empty-queue__icon { font-size: 22px; }

    .queue-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .queue-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--bg-overlay);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
    }
    .queue-item--replaying {
      border-color: rgba(251,191,36,0.4);
      background: rgba(251,191,36,0.05);
      animation: pulse 1s infinite;
    }
    .queue-item--failed { border-color: rgba(239,68,68,0.4); }
    .queue-item__icon { font-size: 16px; flex-shrink: 0; }
    .queue-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .queue-item__type { color: var(--text-primary); }
    .queue-item__details { color: var(--text-secondary); word-break: break-word; }
    .queue-item__status { font-size: var(--text-xs); font-weight: 600; flex-shrink: 0; }

    .explanation-card {}
    .explanation-steps { display: flex; flex-direction: column; gap: var(--space-lg); }
    .explanation-step { display: flex; gap: var(--space-lg); align-items: flex-start; }
    .explanation-step__number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(245,158,11,0.15);
      border: 1px solid rgba(245,158,11,0.3);
      color: var(--brand-primary);
      font-weight: 800;
      font-size: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .explanation-step__title { font-size: var(--text-sm); font-weight: 700; margin-bottom: 4px; }
    .explanation-step__desc { line-height: 1.6; }
  `]
})
export class OfflineDemoComponent {
  protected readonly connection = inject(ConnectionService);
  protected readonly offlineQueue = inject(OfflineQueueService);
  private readonly notifications = inject(NotificationService);

  readonly queue = this.offlineQueue.queue;

  readonly explanationSteps = [
    {
      number: '1',
      title: 'Action Attempted While Offline',
      desc: 'When a user performs an action (e.g., status update, payment) while offline, the system intercepts it instead of letting it fail.',
    },
    {
      number: '2',
      title: 'Queued to localStorage',
      desc: 'The action is serialized and stored in localStorage with a unique ID to prevent duplicate replays.',
    },
    {
      number: '3',
      title: 'Optimistic UI Update',
      desc: 'The UI reflects the change immediately so the cashier can continue working without interruption.',
    },
    {
      number: '4',
      title: 'Connection Restored',
      desc: 'When the browser comes back online, the ConnectionService emits an event that triggers automatic queue replay.',
    },
    {
      number: '5',
      title: 'Replay & Confirm',
      desc: 'Each queued action is replayed in order. Success removes it from the queue; failure marks it as failed for manual review.',
    },
  ];

  statusLabel(): string {
    if (this.connection.isReconnecting()) return 'Reconnecting...';
    return this.connection.isOnline() ? 'Online' : 'Offline';
  }

  statusDescription(): string {
    if (this.connection.isReconnecting()) return 'Verifying connection and replaying queued actions...';
    return this.connection.isOnline()
      ? 'All systems operational. Actions sync in real-time.'
      : 'No connection. Actions are being queued locally.';
  }

  statusColor(): string {
    if (this.connection.isReconnecting()) return 'var(--text-warning)';
    return this.connection.isOnline() ? 'var(--text-success)' : 'var(--text-danger)';
  }

  simulateOrderUpdate(): void {
    if (this.connection.isOnline()) {
      this.notifications.warning('Demo', 'Go offline first to see queuing in action');
      return;
    }
    this.offlineQueue.enqueue('order_status_update', { orderId: 'demo_order_1', newStatus: 'preparing' });
    this.notifications.info('Queued', 'Order status update added to queue');
  }

  simulatePayment(): void {
    if (this.connection.isOnline()) {
      this.notifications.warning('Demo', 'Go offline first to see queuing in action');
      return;
    }
    this.offlineQueue.enqueue('process_payment', { orderId: 'demo_order_2', amount: 89.50, method: 'card' });
    this.notifications.info('Queued', 'Payment queued for sync');
  }

  simulateTableAssign(): void {
    if (this.connection.isOnline()) {
      this.notifications.warning('Demo', 'Go offline first to see queuing in action');
      return;
    }
    this.offlineQueue.enqueue('assign_table', { orderId: 'demo_order_3', tableNumber: 7 });
    this.notifications.info('Queued', 'Table assignment queued for sync');
  }

  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  statusColorForItem(status: string): string {
    const map: Record<string, string> = {
      pending: 'var(--text-warning)',
      replaying: 'var(--text-info)',
      failed: 'var(--text-danger)',
    };
    return map[status] ?? 'var(--text-muted)';
  }

  getActionTitle(type: string): string {
    switch (type) {
      case 'order_status_update':
        return '📋 Order Status Update';
      case 'process_payment':
        return '💳 Process Payment';
      case 'assign_table':
        return '🪑 Table Assignment';
      default:
        return type;
    }
  }

  getActionDetails(item: OfflineQueueItem): string {
    const payload = item.payload as any;
    if (!payload) return '';
    
    switch (item.type) {
      case 'order_status_update':
        return `Order #${payload.orderId?.replace('demo_order_', '') || payload.orderId} ➔ status: ${payload.newStatus}`;
      case 'process_payment':
        return `Order #${payload.orderId?.replace('demo_order_', '') || payload.orderId} — SAR ${payload.amount?.toFixed(2)} (${payload.method})`;
      case 'assign_table':
        return `Order #${payload.orderId?.replace('demo_order_', '') || payload.orderId} ➔ Table ${payload.tableNumber}`;
      default:
        return typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    }
  }
}
