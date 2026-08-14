import {
  Component, Input, inject, DestroyRef,
  ChangeDetectionStrategy, computed, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../../core/models/order.model';
import { AiAssistantStore } from '../../store/ai-assistant.store';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { OrdersStore } from '../../../orders/store/orders.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import {
  AiSuggestion,
  AI_SUGGESTION_ICONS,
  AI_SEVERITY_COLORS,
  AiStreamingState
} from '../../../../core/models/ai-suggestion.model';

@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-panel.component.html',
  styles: [`
    .ai-panel {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .ai-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md) var(--space-lg);
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(139,92,246,0.05);
    }
    .ai-icon { font-size: 14px; }
    .ai-panel__label { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
    .ai-spinner { font-size: 14px; color: var(--brand-accent); display: inline-block; }
    .ai-panel__status { font-size: var(--text-xs); font-weight: 600; }

    .ai-panel__loading,
    .ai-panel__retrying,
    .ai-panel__error,
    .ai-panel__empty { padding: var(--space-md); }

    .ai-panel__error {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-sm);
    }
    .ai-error-icon { font-size: 32px; }
    .ai-error-msg { font-size: var(--text-sm); color: var(--text-danger); max-width: 240px; }

    /* ---- Suggestion cards ---- */
    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-md) var(--space-xl) var(--space-md);
      max-height: 280px;
      overflow-y: auto;
    }
    .suggestion-card {
      border-radius: var(--radius-md);
      border: 1px solid;
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .suggestion-card:last-child {
      margin-bottom: var(--space-md);
    }
    .suggestion-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-sm);
    }
    .suggestion-icon { font-size: 14px; flex-shrink: 0; }
    .suggestion-card__title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
    .suggestion-confidence { font-size: 10px; color: var(--text-muted); flex-shrink: 0; }
    .suggestion-dismiss {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px 4px;
      font-size: 10px;
      line-height: 1;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
      flex-shrink: 0;
    }
    .suggestion-dismiss:hover { color: var(--text-primary); }
    .suggestion-card__body {}
    .suggestion-text {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.6;
      word-break: break-word;
    }
    .suggestion-card__footer { display: flex; }
  `]
})
export class AiPanelComponent implements OnChanges {
  @Input({ required: true }) order!: Order;

  private readonly aiStore = inject(AiAssistantStore);
  private readonly kitchenStore = inject(KitchenStore);
  private readonly ordersStore = inject(OrdersStore);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = computed(() => this.aiStore.getStateForOrder()(this.order?.id ?? ''));
  readonly streamingState = computed(() => this.state()?.streamingState ?? 'idle');
  readonly suggestions = computed(() => this.state()?.suggestions ?? []);
  readonly retryCount = computed(() => this.state()?.retryCount ?? 0);
  readonly errorMessage = computed(() => this.state()?.errorMessage ?? 'An error occurred');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      this.aiStore.fetchForOrder(this.order, this.kitchenStore.overallLoad(), this.destroyRef);
    }
  }

  isComplete() { return this.streamingState() === 'complete'; }
  canRetry()   { return this.streamingState() === 'error'; }

  statusLabel(): string {
    const map: Record<string, string> = {
      idle: '',
      loading: 'Loading...',
      streaming: 'Generating...',
      complete: 'Complete',
      error: 'Error',
      retrying: 'Retrying...',
    };
    return map[this.streamingState()] ?? '';
  }

  statusColor(): string {
    const map: Record<string, string> = {
      loading: 'var(--text-secondary)',
      streaming: 'var(--brand-accent)',
      complete: 'var(--text-success)',
      error: 'var(--text-danger)',
      retrying: 'var(--text-warning)',
    };
    return map[this.streamingState()] ?? 'var(--text-muted)';
  }

  suggestionIcon(s: AiSuggestion): string {
    return AI_SUGGESTION_ICONS[s.type] ?? '💡';
  }

  confidenceBar(confidence: number): string {
    const pct = Math.round(confidence * 100);
    const bars = Math.round(confidence * 5);
    return '█'.repeat(bars) + '░'.repeat(5 - bars) + ` ${pct}%`;
  }

  isStreaming(suggestion: AiSuggestion): boolean {
    return this.streamingState() === 'streaming' &&
      suggestion.streamedMessage.length < suggestion.message.length &&
      suggestion.streamedMessage.length > 0;
  }

  suggestionStyle(s: AiSuggestion): Record<string, string> {
    const color = AI_SEVERITY_COLORS[s.severity];
    return {
      borderColor: color + '44',
      background: color + '0d',
    };
  }

  actionBtnStyle(s: AiSuggestion): Record<string, string> {
    const color = AI_SEVERITY_COLORS[s.severity];
    return {
      background: color + '22',
      color: color,
      border: `1px solid ${color}44`,
    };
  }

  retry(): void {
    this.aiStore.refreshForOrder(this.order, this.kitchenStore.overallLoad(), this.destroyRef);
  }

  refresh(): void {
    this.aiStore.refreshForOrder(this.order, this.kitchenStore.overallLoad(), this.destroyRef);
  }

  dismissSuggestion(id: string): void {
    this.aiStore.dismissSuggestion(this.order.id, id);
  }

  executeAction(suggestion: AiSuggestion): void {
    if (!suggestion.actionLabel) return;

    const label = suggestion.actionLabel.toLowerCase();

    if (label.includes('add dessert')) {
      this.ordersStore.addOrderItem(this.order.id, {
        name: 'Chocolate Lava Cake',
        price: 15.00,
        quantity: 1,
        category: 'dessert'
      });
      this.notifications.success('Order Updated', 'Chocolate Lava Cake added to order.');
    } else if (label.includes('add to order')) {
      this.ordersStore.addOrderItem(this.order.id, {
        name: 'Mango Smoothie',
        price: 4.49,
        quantity: 1,
        category: 'drinks'
      });
      this.notifications.success('Order Updated', 'Mango Smoothie added to order.');
    } else if (label.includes('assign table')) {
      this.ordersStore.assignOrderTable(this.order.id, 8);
      this.notifications.success('Table Assigned', 'Table 8 assigned to order.');
    } else if (label.includes('confirm')) {
      this.notifications.success('Allergens Confirmed', 'Dietary requirements confirmed. Preparing safely.');
    } else if (label.includes('notify')) {
      this.notifications.success('Customer Notified', 'Proactively informed customer about the delay.');
    } else if (label.includes('driver')) {
      this.notifications.success('Driver Dispatched', 'Driver assigned. Estimated pickup in 5 minutes.');
    } else if (label.includes('reward')) {
      this.ordersStore.addOrderItem(this.order.id, {
        name: 'Chocolate Lava Cake (Reward)',
        price: 0.00,
        quantity: 1,
        category: 'dessert'
      });
      this.notifications.success('Loyalty Reward Applied', 'Free Chocolate Lava Cake added.');
    } else if (label.includes('inventory')) {
      this.notifications.success('Inventory Checked', 'Guacamole substitution verified and available.');
    } else {
      this.notifications.info('Action Executed', `Executed action: ${suggestion.actionLabel}`);
    }

    // Dismiss suggestion after successful action
    this.dismissSuggestion(suggestion.id);
  }
}
