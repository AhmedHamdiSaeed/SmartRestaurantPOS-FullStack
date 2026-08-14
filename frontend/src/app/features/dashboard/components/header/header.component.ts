import {
  Component, inject, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionService } from '../../../../core/services/connection.service';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { OrdersStore } from '../../../orders/store/orders.store';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styles: [`
    /* ---- Header base ---- */
    .app-header {
      height: var(--header-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: var(--z-header);
    }
    .offline-banner {
      background: rgba(239,68,68,0.95);
      color: #fff;
      text-align: center;
      padding: 4px;
      font-size: var(--text-xs);
      font-weight: 600;
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: calc(var(--z-toast) + 10);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-xl);
      height: 100%;
      gap: var(--space-xl);
    }

    /* ---- Hamburger (mobile only) ---- */
    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      border: 1px solid var(--border-normal);
      color: var(--text-primary);
      font-size: 18px;
      cursor: pointer;
      flex-shrink: 0;
      transition: background var(--transition-fast);
    }
    .hamburger-btn:hover { background: var(--bg-hover); }

    .header-left { display: flex; align-items: center; gap: var(--space-md); }
    .header-context { display: flex; align-items: center; gap: var(--space-sm); }
    .header-separator { color: var(--text-muted); }

    .header-stats {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: 10px var(--space-2xl);
    }
    .header-stat { display: flex; flex-direction: column; align-items: center; }
    .header-stat__value { font-size: var(--text-xl); font-weight: 800; line-height: 1.1; color: var(--text-primary); }
    .header-stat__label { font-size: var(--text-sm); color: var(--text-muted); margin-top: 2px; }
    .header-stat-divider {
      width: 1px;
      height: 32px;
      background: var(--border-subtle);
    }

    .header-right { display: flex; align-items: center; gap: var(--space-md); }
    .header-alert {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--radius-full);
      padding: 4px 10px;
    }
    .header-alert__dot {
      width: 8px; height: 8px;
      background: var(--text-danger);
      border-radius: 50%;
      display: inline-block;
    }
    .header-connection { display: flex; align-items: center; gap: 6px; }
    .header-connection--offline .text-secondary { color: var(--text-danger) !important; }

    /* ---- Tablet (641–1024px) ---- */
    @media (max-width: 1024px) {
      .header-inner { gap: var(--space-md); padding: 0 var(--space-lg); }
      .header-stats { gap: var(--space-md); padding: 8px var(--space-lg); }
      .header-stat__value { font-size: var(--text-lg); }
      .header-stat__label { font-size: var(--text-xs); }
      .header-context { display: none; }
    }

    /* ---- Mobile (≤640px) ---- */
    @media (max-width: 640px) {
      .header-inner { padding: 0 var(--space-md); gap: var(--space-sm); }
      .hamburger-btn { display: flex; }
      .header-stats { display: none; }
      .header-alert { display: none; }
      .header-context { display: none; }
    }
  `]
})
export class HeaderComponent {
  protected readonly layout = inject(LayoutService);
  protected readonly connection = inject(ConnectionService);
  protected readonly kitchenStore = inject(KitchenStore);
  protected readonly ordersStore = inject(OrdersStore);

  currentTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  currentDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
}
