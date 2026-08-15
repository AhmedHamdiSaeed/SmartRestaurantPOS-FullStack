import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // ── Public routes (no auth required) ─────────────────────────────────────
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/components/login/login.component')
        .then(m => m.LoginComponent),
    title: 'Sign In — SmartPOS',
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/components/register/register.component')
        .then(m => m.RegisterComponent),
    title: 'Create Account — SmartPOS',
  },

  // ── Protected routes (requires JWT) ──────────────────────────────────────
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/components/order-board/order-board.component')
        .then(m => m.OrderBoardComponent),
    title: 'Live Orders — SmartPOS',
  },
  {
    path: 'kitchen',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/kitchen/components/kitchen-monitor/kitchen-monitor.component')
        .then(m => m.KitchenMonitorComponent),
    title: 'Kitchen Display — SmartPOS',
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/product-search/components/product-search/product-search.component')
        .then(m => m.ProductSearchComponent),
    title: 'Product Search — SmartPOS',
  },
  {
    path: 'ai',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ai-assistant/components/ai-panel/ai-panel.component')
        .then(m => m.AiPanelComponent),
    title: 'AI Assistant — SmartPOS',
  },
  {
    path: 'offline-demo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/components/offline-demo/offline-demo.component')
        .then(m => m.OfflineDemoComponent),
    title: 'Offline Support — SmartPOS',
  },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'login' },
];
