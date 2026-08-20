import { Routes } from '@angular/router';
import { AdminShellComponent } from './admin-shell/admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/order-list/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.component').then((m) => m.AnalyticsComponent),
      },
    ],
  },
];
