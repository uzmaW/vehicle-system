import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TenantRegisterRequest, TenantResponse, LoginResponse, AuthUser } from '../models/models';
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
  private readonly USER_EMAIL_KEY = 'inventory_user_email';
  private readonly AUTH_TOKEN_KEY = 'inventory_auth_token';

  private tenantIdSubject = new BehaviorSubject<string | null>(this.getStoredTenantId());
  private userRoleSubject = new BehaviorSubject<string | null>(this.getStoredUserRole());
  private userIdSubject = new BehaviorSubject<string | null>(this.getStoredUserId());
  private userEmailSubject = new BehaviorSubject<string | null>(this.getStoredUserEmail());
  private authTokenSubject = new BehaviorSubject<string | null>(this.getStoredAuthToken());

  tenantId$ = this.tenantIdSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();
  authToken$ = this.authTokenSubject.asObservable();

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
   * Sets the auth token from login response.
   */
  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    this.authTokenSubject.next(token);
  }

  /**
   * Gets the current auth token.
   */
  getAuthToken(): string | null {
    return this.authTokenSubject.value;
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
    return this.userIdSubject.value;
  }

  /**
   * Sets the current user ID.
   */
  setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
    this.userIdSubject.next(userId);
  }

  /**
   * Gets the current user email.
   */
  getUserEmail(): string | null {
    return this.userEmailSubject.value;
  }

  /**
   * Sets the current user email.
   */
  setUserEmail(email: string): void {
    localStorage.setItem(this.USER_EMAIL_KEY, email);
    this.userEmailSubject.next(email);
  }

  /**
   * Checks if user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.authTokenSubject.value;
  }

  /**
   * Checks if the current user is a global admin.
   */
  isGlobalAdmin(): boolean {
    return this.userRoleSubject.value === 'GLOBAL_ADMIN';
  }

  /**
   * Sets user info from login response.
   */
  setUserFromLogin(loginResponse: LoginResponse): void {
    this.setAuthToken(loginResponse.token);
    this.setUserId(loginResponse.userId);
    this.setUserEmail(loginResponse.email);
    this.setTenantId(loginResponse.tenantId);
    this.setUserRole(loginResponse.role);
  }

  /**
   * Clears all stored context.
   */
  clearContext(): void {
    localStorage.removeItem(this.TENANT_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    this.tenantIdSubject.next(null);
    this.userRoleSubject.next(null);
    this.userIdSubject.next(null);
    this.userEmailSubject.next(null);
    this.authTokenSubject.next(null);
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

  private getStoredUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  private getStoredUserEmail(): string | null {
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  private getStoredAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
}