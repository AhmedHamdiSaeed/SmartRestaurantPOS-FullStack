import {
  Component, Input, Output, EventEmitter,
  inject, DestroyRef, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, ORDER_CHANNEL_LABELS } from '../../../../core/models/order.model';
import { AiAssistantStore } from '../../../ai-assistant/store/ai-assistant.store';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { AiPanelComponent } from '../../../ai-assistant/components/ai-panel/ai-panel.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TimeAgoPipe, AiPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .detail-panel {
      width: 380px;
      min-width: 320px;
      background: var(--bg-surface);
      border-left: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .detail-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .detail-panel__title { font-size: var(--text-lg); font-weight: 700; }
    .detail-panel__body { padding: var(--space-lg); padding-bottom: var(--space-2xl); display: flex; flex-direction: column; gap: var(--space-xl); flex: 1; min-height: 0; }

    .detail-section {}
    .detail-section__title {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--space-md);
    }

    /* ---- Status Timeline ---- */
    .status-timeline { display: flex; gap: 0; overflow: hidden; }
    .status-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
    }
    .status-step__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--bg-overlay);
      border: 2px solid var(--border-normal);
      z-index: 1;
      transition: all var(--transition-normal);
    }
    .status-step--done .status-step__dot { background: var(--status-completed); border-color: var(--status-completed); }
    .status-step--active .status-step__dot {
      background: var(--brand-primary);
      border-color: var(--brand-primary);
      box-shadow: 0 0 8px rgba(245,158,11,0.6);
    }
    .status-step__line {
      position: absolute;
      top: 4px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: var(--bg-overlay);
    }
    .status-step--done .status-step__line { background: var(--status-completed); }
    .status-step__label {
      margin-top: var(--space-sm);
      font-size: 10px;
      color: var(--text-muted);
      text-align: center;
      white-space: nowrap;
    }
    .status-step--active .status-step__label { color: var(--brand-primary); font-weight: 600; }

    /* ---- Info Grid ---- */
    .info-grid { display: flex; flex-direction: column; gap: var(--space-sm); }
    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-label { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; }
    .info-value { font-size: var(--text-sm); color: var(--text-primary); }

    /* ---- Items ---- */
    .items-list { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .item-row__info { display: flex; gap: var(--space-sm); align-items: flex-start; flex: 1; min-width: 0; }
    .item-row__qty { font-size: var(--text-xs); color: var(--text-muted); font-weight: 700; flex-shrink: 0; margin-top: 2px; }
    .item-row__details { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .item-row__name { font-size: var(--text-sm); color: var(--text-primary); }
    .item-row__allergens { display: flex; flex-wrap: wrap; gap: 4px; }
    .allergen-tag {
      font-size: var(--text-xs);
      background: rgba(248,113,113,0.15);
      color: var(--text-danger);
      border: 1px solid rgba(248,113,113,0.3);
      border-radius: var(--radius-full);
      padding: 1px 6px;
    }
    .item-row__notes { font-size: var(--text-xs); color: var(--text-muted); font-style: italic; }
    .item-row__price { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); flex-shrink: 0; }

    .order-totals {
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .total-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--text-secondary); }
    .total-row--grand {
      font-weight: 700;
      font-size: var(--text-lg);
      color: var(--brand-primary);
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-sm);
      margin-top: var(--space-xs);
    }

    /* ---- @defer placeholder / loading / error ---- */
    .ai-defer-placeholder,
    .ai-defer-loading {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--bg-elevated);
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: var(--text-xs);
    }
    .ai-defer-loading__spinner {
      animation: spin 1.5s linear infinite;
      display: inline-block;
    }
    .ai-defer-error {
      padding: var(--space-sm) var(--space-md);
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: var(--radius-md);
      color: var(--text-danger);
      font-size: var(--text-xs);
    }
  `]
})
export class OrderDetailComponent implements OnChanges {
  @Input({ required: true }) order!: Order;
  @Output() close = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<{ order: Order; newStatus: OrderStatus }>();

  private readonly aiStore = inject(AiAssistantStore);
  private readonly kitchenStore = inject(KitchenStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusSteps = ORDER_STATUS_FLOW;

  get channelLabel(): string { return ORDER_CHANNEL_LABELS[this.order.channel]; }

  get nextStatus(): OrderStatus | null {
    const idx = ORDER_STATUS_FLOW.indexOf(this.order.status);
    if (idx === -1 || idx >= ORDER_STATUS_FLOW.length - 1) return null;
    return ORDER_STATUS_FLOW[idx + 1];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      // Trigger AI fetch when order is selected
      this.aiStore.fetchForOrder(
        this.order,
        this.kitchenStore.overallLoad(),
        this.destroyRef
      );
    }
  }

  statusLabel(s: OrderStatus): string { return ORDER_STATUS_LABELS[s]; }

  isStepDone(step: OrderStatus): boolean {
    return ORDER_STATUS_FLOW.indexOf(step) < ORDER_STATUS_FLOW.indexOf(this.order.status);
  }
}
