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

  router.navigate(['/']);
  return false;
};

/**
 * Guard for global admin routes - requires GLOBAL_ADMIN role.
 */
export const globalAdminGuard: CanActivateFn = () => {
  const tenantService = inject(TenantService);
  const router = inject(Router);

  if (tenantService.isGlobalAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

/**
 * Guard for tenant admin routes - requires TENANT_ADMIN role.
 * Allows both TENANT_ADMIN and GLOBAL_ADMIN (global admin can access tenant admin routes).
 */
export const tenantAdminGuard: CanActivateFn = () => {
  const tenantService = inject(TenantService);
  const router = inject(Router);

  if (tenantService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

/**
 * Legacy guard - kept for backwards compatibility.
 */
export const adminGuard: CanActivateFn = () => {
  return true;
};