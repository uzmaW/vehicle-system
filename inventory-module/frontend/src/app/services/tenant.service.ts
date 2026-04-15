import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TenantRegisterRequest, TenantResponse } from '../models/models';
import { tap } from 'rxjs/operators';

/**
 * Service for managing tenant context in the frontend.
 *
 * Stores and provides the current tenant ID and user role
 * for API requests and UI rendering.
 */
@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private readonly TENANT_KEY = 'inventory_tenant_id';
  private readonly USER_ID_KEY = 'inventory_user_id';
  private readonly USER_ROLE_KEY = 'inventory_user_role';

  private tenantIdSubject = new BehaviorSubject<string | null>(this.getStoredTenantId());
  private userRoleSubject = new BehaviorSubject<string | null>(this.getStoredUserRole());

  tenantId$ = this.tenantIdSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Register a new tenant and automatically set it as current tenant.
   */
  registerTenant(request: TenantRegisterRequest): Observable<TenantResponse> {
    return this.apiService.registerTenant(request).pipe(
      tap(tenant => {
        this.setTenantId(tenant.uuid);
      })
    );
  }

  /**
   * Gets the current tenant ID.
   */
  getTenantId(): string | null {
    return this.tenantIdSubject.value;
  }

  /**
   * Sets the current tenant ID.
   */
  setTenantId(tenantId: string): void {
    localStorage.setItem(this.TENANT_KEY, tenantId);
    this.tenantIdSubject.next(tenantId);
  }

  /**
   * Gets the current user role.
   */
  getUserRole(): string | null {
    return this.userRoleSubject.value;
  }

  /**
   * Sets the current user role.
   */
  setUserRole(role: string): void {
    localStorage.setItem(this.USER_ROLE_KEY, role);
    this.userRoleSubject.next(role);
  }

  /**
   * Gets the current user ID.
   */
  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  /**
   * Sets the current user ID.
   */
  setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  /**
   * Checks if the current user is a global admin.
   */
  isGlobalAdmin(): boolean {
    return this.userRoleSubject.value === 'GLOBAL_ADMIN';
  }

  /**
   * Clears all stored context.
   */
  clearContext(): void {
    localStorage.removeItem(this.TENANT_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    this.tenantIdSubject.next(null);
    this.userRoleSubject.next(null);
  }

  /**
   * Checks if tenant context is set.
   */
  hasTenantContext(): boolean {
    return !!this.tenantIdSubject.value;
  }

  private getStoredTenantId(): string | null {
    return localStorage.getItem(this.TENANT_KEY);
  }

  private getStoredUserRole(): string | null {
    return localStorage.getItem(this.USER_ROLE_KEY);
  }
}