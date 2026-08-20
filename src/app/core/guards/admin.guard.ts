import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Requires the `admin` role. An unauthenticated visitor is sent to /login with a
 * returnUrl; an authenticated non-admin (i.e. a `user`) is redirected to /shop
 * rather than /login, since they don't need to re-authenticate — they simply lack
 * permission for this section.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  if (auth.role() !== 'admin') {
    return router.createUrlTree(['/shop']);
  }

  return true;
};
