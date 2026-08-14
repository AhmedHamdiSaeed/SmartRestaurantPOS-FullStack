import {
  Component, inject, signal, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ConnectionService } from '../../../../core/services/connection.service';
import { OfflineQueueService } from '../../../../core/services/offline-queue.service';
import { OrdersStore } from '../../../orders/store/orders.store';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { CurrentUser, UserRole, USER_ROLES } from '../../../../core/models/app.model';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styles: [`
    /* ---- Base sidebar ---- */
    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal), min-width var(--transition-normal), transform var(--transition-normal);
      overflow: hidden;
      z-index: var(--z-sidebar);
      flex-shrink: 0;
    }
    .sidebar--collapsed {
      width: var(--sidebar-collapsed);
      min-width: var(--sidebar-collapsed);
    }

    /* ---- Logo ---- */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-lg);
      border-bottom: 1px solid var(--border-subtle);
      height: var(--header-height);
      flex-shrink: 0;
    }
    .sidebar-logo__icon { font-size: 30px; flex-shrink: 0; }
    .sidebar-logo__text { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .sidebar-logo__brand { font-size: var(--text-xl); font-weight: 800; color: var(--brand-primary); line-height: 1.1; }
    .sidebar-logo__sub { font-size: var(--text-sm); color: var(--text-muted); }
    .sidebar-toggle {
      margin-left: auto;
      font-size: 20px;
      color: var(--text-muted);
      border: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .sidebar-toggle:hover { color: var(--text-primary); }

    /* ---- User ---- */
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .sidebar-user__avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark));
      color: #0b0d14;
      font-weight: 800;
      font-size: var(--text-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar-user__info { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
    .sidebar-user__name { font-size: var(--text-base); font-weight: 600; }
    .sidebar-user__role { font-size: var(--text-sm); }

    /* ---- Role Switcher ---- */
    .role-switcher {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px;
      padding: var(--space-sm) var(--space-lg);
      flex-shrink: 0;
    }
    .role-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-size: var(--text-sm);
      font-weight: 500;
      transition: all var(--transition-fast);
      white-space: nowrap;
      overflow: hidden;
    }
    .role-btn:hover { border-color: var(--border-normal); color: var(--text-secondary); }
    .role-btn--active { background: rgba(245,158,11,0.08); }

    .sidebar-divider { height: 1px; background: var(--border-subtle); margin: var(--space-xs) 0; flex-shrink: 0; }

    /* ---- Nav ---- */
    .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: var(--space-sm) var(--space-sm); flex-shrink: 0; }
    .sidebar-nav__item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 12px var(--space-lg);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: var(--text-base);
      font-weight: 500;
      transition: all var(--transition-fast);
      position: relative;
      white-space: nowrap;
      overflow: hidden;
    }
    .sidebar-nav__item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .sidebar-nav__item--active {
      background: rgba(245,158,11,0.12);
      color: var(--brand-primary);
    }
    .sidebar-nav__icon { font-size: 20px; flex-shrink: 0; width: 26px; text-align: center; }
    .sidebar-nav__label { flex: 1; font-size: var(--text-base); }
    .sidebar-nav__badge {
      background: var(--brand-secondary);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    .sidebar-spacer { flex: 1; }

    /* ---- Status Panel ---- */
    .sidebar-status {
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .status-item { display: flex; align-items: center; gap: var(--space-sm); }

    /* ---- Branch ---- */
    .sidebar-branch {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .sidebar-branch__icon { font-size: 16px; flex-shrink: 0; }
    .sidebar-branch__info { display: flex; flex-direction: column; overflow: hidden; }
    .sidebar-branch__name { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); }

    /* ---- Tablet (641–1024px): auto-collapse ---- */
    @media (max-width: 1024px) and (min-width: 641px) {
      :host .sidebar {
        width: var(--sidebar-collapsed);
        min-width: var(--sidebar-collapsed);
      }
    }

    /* ---- Mobile (≤640px): full-width overlay drawer ---- */
    @media (max-width: 640px) {
      :host .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 280px !important;
        min-width: 280px !important;
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
        box-shadow: var(--shadow-xl);
      }
      :host .sidebar--mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  protected readonly layout = inject(LayoutService);
  protected readonly connection = inject(ConnectionService);
  protected readonly offlineQueue = inject(OfflineQueueService);
  protected readonly ordersStore = inject(OrdersStore);
  protected readonly kitchenStore = inject(KitchenStore);

  readonly userRoles = USER_ROLES;
  readonly isCollapsed = signal(false);

  /** On tablet, sidebar always shows as icon-only regardless of toggle */
  readonly isEffectivelyCollapsed = computed(() => this.isCollapsed());

  /** Whether to show text labels (collapsed or mobile-open-as-expanded) */
  readonly showLabels = computed(() => !this.isCollapsed());

  readonly currentUser = signal<CurrentUser>({
    id: 'usr_1',
    name: 'Ahmed Al-Rashidi',
    role: 'cashier',
    branch: 'Riyadh — King Fahd Rd',
  });

  readonly navItems = [
    {
      id: 'orders',
      path: '/orders',
      label: 'Live Orders',
      icon: '📋',
      badge: computed(() => this.ordersStore.stats().received + this.ordersStore.stats().preparing),
    },
    {
      id: 'kitchen',
      path: '/kitchen',
      label: 'Kitchen Monitor',
      icon: '👨‍🍳',
      badge: null,
    },
    {
      id: 'search',
      path: '/search',
      label: 'Product Search',
      icon: '🔍',
      badge: null,
    },
    {
      id: 'offline',
      path: '/offline-demo',
      label: 'Offline Demo',
      icon: '📴',
      badge: computed(() => this.offlineQueue.pendingCount()),
    },
  ];

  toggleCollapsed(): void { this.isCollapsed.update(v => !v); }

  /** Close drawer on mobile when a nav item is clicked */
  onNavClick(): void { this.layout.closeMobileNav(); }

  switchRole(role: UserRole): void {
    const roleUser: Record<UserRole, Partial<CurrentUser>> = {
      cashier:  { name: 'Ahmed Al-Rashidi', role: 'cashier' },
      manager:  { name: 'Fatima Al-Zahra', role: 'manager' },
      kitchen:  { name: 'Omar Nasser', role: 'kitchen' },
      support:  { name: 'Sara Mohammed', role: 'support' },
    };
    this.currentUser.update(u => ({ ...u, ...roleUser[role] }));
  }

  roleColor(): string {
    const found = USER_ROLES.find(r => r.value === this.currentUser().role);
    return found?.color ?? 'var(--text-secondary)';
  }

  roleIcon(): string {
    const found = USER_ROLES.find(r => r.value === this.currentUser().role);
    return found?.icon ?? '👤';
  }

  roleLabel(): string {
    const found = USER_ROLES.find(r => r.value === this.currentUser().role);
    return found?.label ?? 'User';
  }

  currentTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
