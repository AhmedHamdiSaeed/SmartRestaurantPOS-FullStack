import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { Order, ORDER_STATUS_FLOW, OrderStatus, ORDER_CHANNEL_LABELS, ORDER_STATUS_LABELS } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-card.component.html',
  styles: [`
    .order-card {
      position: relative;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      cursor: pointer;
      transition: all var(--transition-normal);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      overflow: hidden;
      animation: fadeIn 0.3s ease;
    }
    .order-card:hover {
      border-color: var(--border-normal);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .order-card--selected {
      border-color: var(--brand-primary) !important;
      box-shadow: 0 0 0 2px rgba(245,158,11,0.2), var(--shadow-md);
    }
    .order-card--delayed { border-color: rgba(249,115,22,0.4) !important; }
    .order-card--critical {
      border-color: rgba(239,68,68,0.5) !important;
      animation: criticalPulse 2s infinite;
    }
    @keyframes criticalPulse {
      0%, 100% { border-color: rgba(239,68,68,0.5); }
      50%       { border-color: rgba(239,68,68,0.9); }
    }
    .order-card__priority-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      transition: background var(--transition-normal);
    }
    .order-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .order-card__number { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
    .order-card__delay-badge { font-size: 14px; }
    .order-card__customer { display: flex; align-items: center; gap: var(--space-sm); }
    .order-card__customer-name { font-size: var(--text-sm); color: var(--text-secondary); flex: 1; }
    .order-card__table {
      font-size: var(--text-xs); color: var(--brand-primary); font-weight: 600;
      background: rgba(245,158,11,0.1); padding: 2px 6px; border-radius: var(--radius-full); flex-shrink: 0;
    }
    .order-card__items { display: flex; flex-direction: column; gap: 2px; }
    .order-card__item { font-size: var(--text-xs); color: var(--text-secondary); display: flex; gap: 4px; }
    .order-card__item-qty { color: var(--text-muted); font-weight: 600; flex-shrink: 0; }
    .order-card__more { font-size: var(--text-xs); color: var(--text-muted); font-style: italic; }
    .order-card__footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: var(--space-xs); border-top: 1px solid var(--border-subtle);
    }
    .order-card__total { font-size: var(--text-sm); color: var(--brand-primary); }
    .order-card__status-row { display: flex; gap: 4px; padding: 2px 0; }
    .order-card__status-step {
      flex: 1; height: 3px; border-radius: var(--radius-full);
      background: var(--bg-overlay); transition: background var(--transition-normal);
    }
    .order-card__status-step--done { background: var(--status-completed); }
    .order-card__status-step--active { background: var(--brand-primary); }
    .order-card__actions { display: flex; gap: var(--space-sm); justify-content: flex-end; padding-top: 2px; }
  `]
})
export class OrderCardComponent {
  @Input({ required: true }) order!: Order;
  @Input() isSelected = false;
  @Output() select = new EventEmitter<Order>();
  @Output() advanceStatus = new EventEmitter<{ order: Order; newStatus: OrderStatus }>();
  @Output() viewDetails = new EventEmitter<Order>();

  readonly statusSteps: OrderStatus[] = ORDER_STATUS_FLOW;

  get displayItems() { return this.order.items.slice(0, 2); }
  get hiddenCount() { return Math.max(0, this.order.items.length - 2); }

  get channelLabel(): string {
    const map: Record<string, string> = { walkin: 'Walk-in', delivery: 'Delivery', online: 'Online' };
    return map[this.order.channel] ?? this.order.channel;
  }

  get channelIcon(): string {
    const map: Record<string, string> = { walkin: '🪑', delivery: '🛵', online: '📱' };
    return map[this.order.channel] ?? '📋';
  }

  get priorityLabel(): string {
    const map: Record<string, string> = { normal: 'Normal', high: 'High', critical: '🔴 Critical' };
    return map[this.order.priority] ?? this.order.priority;
  }

  get nextStatus(): OrderStatus | null {
    const idx = ORDER_STATUS_FLOW.indexOf(this.order.status);
    if (idx === -1 || idx >= ORDER_STATUS_FLOW.length - 1) return null;
    return ORDER_STATUS_FLOW[idx + 1];
  }

  get nextStatusLabel(): string {
    if (!this.nextStatus) return '';
    const map: Record<string, string> = {
      received: 'Received', preparing: 'Start Prep', ready: 'Mark Ready',
      delivered: 'Mark Delivered', completed: 'Complete'
    };
    return map[this.nextStatus] ?? this.nextStatus;
  }

  get priorityBarStyle(): Record<string, string> {
    const colors: Record<string, string> = {
      normal: 'transparent', high: 'var(--priority-high)', critical: 'var(--priority-critical)',
    };
    return { background: colors[this.order.priority] ?? 'transparent' };
  }

  isStepDone(step: OrderStatus): boolean {
    return ORDER_STATUS_FLOW.indexOf(step) < ORDER_STATUS_FLOW.indexOf(this.order.status);
  }
}
