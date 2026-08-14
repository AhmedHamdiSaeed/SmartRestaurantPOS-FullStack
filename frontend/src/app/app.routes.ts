import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/components/order-board/order-board.component')
        .then(m => m.OrderBoardComponent),
    title: 'Live Orders — Sahm POS',
  },
  {
    path: 'kitchen',
    loadComponent: () =>
      import('./features/kitchen/components/kitchen-monitor/kitchen-monitor.component')
        .then(m => m.KitchenMonitorComponent),
    title: 'Kitchen Monitor — Sahm POS',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/product-search/components/product-search/product-search.component')
        .then(m => m.ProductSearchComponent),
    title: 'Product Search — Sahm POS',
  },
  {
    path: 'offline-demo',
    loadComponent: () =>
      import('./features/dashboard/components/offline-demo/offline-demo.component')
        .then(m => m.OfflineDemoComponent),
    title: 'Offline Support — Sahm POS',
  },
  { path: '**', redirectTo: 'orders' },
];
