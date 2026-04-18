import { HttpInterceptorFn } from '@angular/common/http';
import { TenantService } from '../services/tenant.service';
import { inject } from '@angular/core';

/**
 * HTTP Interceptor that adds tenant, user context, and auth headers to all requests.
 *
 * Adds:
 * - X-Tenant-Id: The current tenant identifier
 * - X-User-Id: The current user identifier
 * - X-User-Role: The current user role
 * - Authorization: Bearer token (when authenticated)
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);

  const tenantId = tenantService.getTenantId();
  const userId = tenantService.getUserId();
  const userRole = tenantService.getUserRole();
  const authToken = tenantService.getAuthToken();

  // Clone request and add headers
  let headers = req.headers;

  if (tenantId) {
    headers = headers.set('X-Tenant-Id', tenantId);
  }

  if (userId) {
    headers = headers.set('X-User-Id', userId);
  }

  if (userRole) {
    headers = headers.set('X-User-Role', userRole);
  }

  if (authToken) {
    headers = headers.set('Authorization', `Bearer ${authToken}`);
  }

  const clonedRequest = req.clone({ headers });

  return next(clonedRequest);
};