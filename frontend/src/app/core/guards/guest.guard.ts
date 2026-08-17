import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Redirects authenticated users away from public pages (login, register).
 * Use this on /login and /register routes.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/orders']);
  }

  return true;
};
