import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/components/order-board/order-board.component').then(m => m.OrderBoardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'kitchen',
    loadComponent: () => import('./features/kitchen/components/kitchen-monitor/kitchen-monitor.component').then(m => m.KitchenMonitorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./features/product-search/components/product-search/product-search.component').then(m => m.ProductSearchComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: '**', redirectTo: 'orders' }
];
