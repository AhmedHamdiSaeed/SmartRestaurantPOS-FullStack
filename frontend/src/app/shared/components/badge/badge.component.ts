import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus, OrderChannel, OrderPriority } from '../../../core/models/order.model';

type BadgeVariant = 'status' | 'channel' | 'priority' | 'custom';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styles: [`
    :host { display: inline-flex; }
    .badge-icon { font-size: 10px; }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'custom';
  @Input() status?: OrderStatus;
  @Input() channel?: OrderChannel;
  @Input() priority?: OrderPriority;
  @Input() label = '';
  @Input() icon = '';
  @Input() color = '';
  @Input() bg = '';
  @Input() showDot = false;
  @Input() ariaLabel = '';

  get dotColor(): string { return this.resolvedColor; }

  get resolvedColor(): string {
    if (this.color) return this.color;
    if (this.status) {
      const map: Record<OrderStatus, string> = {
        received:  '#3b82f6', preparing: '#f59e0b', ready: '#10b981',
        delivered: '#8b5cf6', completed: '#6b7280', cancelled: '#ef4444',
      };
      return map[this.status];
    }
    if (this.channel) {
      const map: Record<OrderChannel, string> = {
        walkin: '#06b6d4', delivery: '#8b5cf6', online: '#10b981',
      };
      return map[this.channel];
    }
    if (this.priority) {
      const map: Record<OrderPriority, string> = {
        normal: '#64748b', high: '#f97316', critical: '#ef4444',
      };
      return map[this.priority];
    }
    return '#64748b';
  }

  get resolvedBg(): string {
    if (this.bg) return this.bg;
    return this.resolvedColor + '22'; // 13% opacity
  }

  get badgeStyle(): Record<string, string> {
    return {
      color: this.resolvedColor,
      background: this.resolvedBg,
      border: `1px solid ${this.resolvedColor}44`,
    };
  }
}
