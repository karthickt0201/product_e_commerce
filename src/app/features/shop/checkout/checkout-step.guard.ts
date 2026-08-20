import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from './checkout.service';

export const checkoutStepGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const cart = inject(CartService);
  const checkout = inject(CheckoutService);

  if (cart.isEmpty()) {
    return router.createUrlTree(['/shop']);
  }

  const targetStep = route.url[route.url.length - 1]?.path;

  if (targetStep === '2' && !checkout.step1Complete()) {
    return router.createUrlTree(['/shop/checkout/step/1']);
  }
  if (targetStep === '3' && !checkout.step2Complete()) {
    return router.createUrlTree(['/shop/checkout/step/2']);
  }

  return true;
};
