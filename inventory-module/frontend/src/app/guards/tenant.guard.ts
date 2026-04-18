import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantService } from '../services/tenant.service';

/**
 * Guard that prevents access to routes when tenant context is not configured.
 */
export const tenantGuard: CanActivateFn = () => {
  const tenantService = inject(TenantService);
  const router = inject(Router);

  if (tenantService.hasTenantContext()) {
    return true;
  }

  // Block and navigate to home (which shows settings)
  router.navigate(['/']);
  return false;
};

/**
 * Guard for admin routes that requires GLOBAL_ADMIN role.
 */
export const adminGuard: CanActivateFn = () => {
  const tenantService = inject(TenantService);

  return tenantService.isGlobalAdmin();
};
