import { Routes } from '@angular/router';
import { ShopShellComponent } from './shop-shell/shop-shell.component';
import { checkoutStepGuard } from './checkout/checkout-step.guard';
import { productResolver } from './product-detail/product-detail.resolver';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    component: ShopShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./catalogue/catalogue.component').then((m) => m.CatalogueComponent),
      },
      {
        path: 'products/:id',
        resolve: { product: productResolver },
        loadComponent: () =>
          import('./product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout/step/1',
        loadComponent: () =>
          import('./checkout/checkout-step1/checkout-step1.component').then((m) => m.CheckoutStep1Component),
      },
      {
        path: 'checkout/step/2',
        canActivate: [checkoutStepGuard],
        loadComponent: () =>
          import('./checkout/checkout-step2/checkout-step2.component').then((m) => m.CheckoutStep2Component),
      },
      {
        path: 'checkout/step/3',
        canActivate: [checkoutStepGuard],
        loadComponent: () =>
          import('./checkout/checkout-step3/checkout-step3.component').then((m) => m.CheckoutStep3Component),
      },
      {
        path: 'order-confirmation/:id',
        loadComponent: () =>
          import('./order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent),
      },
    ],
  },
];
