import {
  Component, inject, DestroyRef, OnInit,
  ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../../store/orders.store';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { OrderCardComponent } from '../order-card/order-card.component';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { Order, OrderStatus, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, OrderChannel } from '../../../../core/models/order.model';
import { OrdersMockService } from '../../services/orders-mock.service';

const KANBAN_STATUSES: OrderStatus[] = ['received', 'preparing', 'ready', 'delivered'];

@Component({
  selector: 'app-order-board',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    OrderCardComponent, OrderDetailComponent,
    SkeletonComponent, EmptyStateComponent, BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-board.component.html',
  styles: [`
    .board-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    /* ---- Toolbar ---- */
    .board-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg) var(--space-xl);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      flex-shrink: 0;
      flex-wrap: wrap;
      gap: var(--space-md);
    }
    .board-toolbar__left { display: flex; align-items: center; gap: var(--space-lg); flex-wrap: wrap; }
    .board-toolbar__right { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }

    .board-title { font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); }
    .board-live-indicator { display: flex; align-items: center; gap: var(--space-xs); }
    .board-stats { display: flex; gap: var(--space-md); }
    .board-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
    .board-stat__value { font-size: var(--text-lg); font-weight: 700; line-height: 1; }
    .board-stat__label { font-size: var(--text-xs); color: var(--text-muted); }

    /* ---- Search ---- */
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-box__icon {
      position: absolute;
      left: 10px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1;
    }
    .search-box__input {
      padding-left: 32px;
      min-width: 180px;
      max-width: 240px;
    }

    /* ---- Channel filter ---- */
    .channel-filter { display: flex; gap: 4px; }
    .channel-btn {
      border: 1px solid var(--border-subtle);
      background: var(--bg-overlay);
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }
    .channel-btn--active {
      background: rgba(245,158,11,0.15);
      color: var(--brand-primary);
      border-color: rgba(245,158,11,0.4);
    }

    .sim-controls { display: flex; gap: 4px; }

    /* ---- Board content ---- */
    .board-content {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      position: relative;
    }

    /* ---- Kanban ---- */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      padding: var(--space-lg) var(--space-xl);
      flex: 1;
      min-height: 0;
      overflow-x: auto;
      align-items: start;
    }

    .kanban-col {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      min-height: 200px;
      min-width: 280px;
      max-height: calc(100vh - 200px);
      overflow: hidden;
    }

    .kanban-col__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md) var(--space-lg);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .kanban-col__status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .kanban-col__title { font-size: var(--text-base); font-weight: 700; color: var(--text-primary); }
    .kanban-col__count {
      font-size: var(--text-sm);
      font-weight: 700;
      background: var(--bg-overlay);
      color: var(--text-secondary);
      padding: 3px 9px;
      border-radius: var(--radius-full);
    }
    .kanban-col__badge { font-size: var(--text-sm); font-weight: 700; }

    .kanban-col__body {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-md);
      overflow-y: auto;
      flex: 1;
    }

    /* ---- Loading skeleton ---- */
    .board-loading {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      padding: var(--space-lg) var(--space-xl);
      width: 100%;
    }
    .kanban-col-skeleton {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
    }

    @media (max-width: 1100px) {
      .kanban-board { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 700px) {
      .kanban-board { grid-template-columns: 1fr; }
    }
  `]
})
export class OrderBoardComponent implements OnInit {
  protected readonly ordersStore = inject(OrdersStore);
  private readonly kitchenStore = inject(KitchenStore);
  private readonly ordersService = inject(OrdersMockService);
  private readonly destroyRef = inject(DestroyRef);

  readonly kanbanStatuses = KANBAN_STATUSES;

  readonly channels = [
    { value: 'all' as const,      label: 'All',      icon: '📋' },
    { value: 'walkin' as const,   label: 'Walk-in',  icon: '🪑' },
    { value: 'delivery' as const, label: 'Delivery', icon: '🛵' },
    { value: 'online' as const,   label: 'Online',   icon: '📱' },
  ];

  readonly statItems = computed(() => {
    const s = this.ordersStore.stats();
    return [
      { label: 'Active',   value: s.received + s.preparing + s.ready, color: 'var(--text-primary)' },
      { label: 'Preparing', value: s.preparing, color: 'var(--status-preparing)' },
      { label: 'Ready',    value: s.ready,    color: 'var(--status-ready)' },
      { label: 'Delayed',  value: s.delayed,  color: 'var(--priority-high)' },
    ];
  });

  ngOnInit(): void {
    this.ordersStore.initialize();
    this.ordersStore.startEventStream(this.destroyRef);
    this.kitchenStore.initialize();
    this.kitchenStore.startStream(this.destroyRef);
  }

  columnOrders(status: OrderStatus): Order[] {
    return this.ordersStore.ordersByStatus()[status] ?? [];
  }

  statusLabel(status: OrderStatus): string { return ORDER_STATUS_LABELS[status]; }

  statusColor(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      received:  'var(--status-received)',
      preparing: 'var(--status-preparing)',
      ready:     'var(--status-ready)',
      delivered: 'var(--status-delivered)',
      completed: 'var(--status-completed)',
      cancelled: 'var(--status-cancelled)',
    };
    return map[status];
  }

  emptyIcon(status: OrderStatus): string {
    const map: Record<string, string> = {
      received: '📥', preparing: '👨‍🍳', ready: '✅',
      delivered: '🛵', completed: '🎉', cancelled: '❌'
    };
    return map[status] ?? '📭';
  }

  selectOrder(order: Order): void {
    const current = this.ordersStore.selectedOrderId();
    this.ordersStore.selectOrder(current === order.id ? null : order.id);
  }

  advanceOrderStatus(event: { order: Order; newStatus: OrderStatus }): void {
    this.ordersStore.updateOrderStatus(event.order.id, event.newStatus);
  }

  triggerNewOrder(): void {
    this.ordersService.triggerNewOrderManual();
  }

  triggerLunchRush(): void {
    this.ordersService.triggerLunchRushManual();
    this.kitchenStore.triggerRush();
  }
}
