import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DealerCreateRequest,
  DealerUpdateRequest,
  DealerResponse,
  VehicleCreateRequest,
  VehicleUpdateRequest,
  VehicleResponse,
  VehicleSearchRequest,
  PagedResponse,
  SubscriptionCountResponse,
  TenantRegisterRequest,
  TenantResponse,
  LoginRequest,
  LoginResponse,
  UserCreateRequest,
  UserResponse,
  PagedUsersResponse
} from '../models/models';

/**
 * Base API service for the Inventory Module.
 * 
 * Provides HTTP methods for communicating with the Spring Boot backend.
 * All requests automatically include tenant headers via the TenantInterceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // ==================== Dealer Endpoints ====================

  /**
   * Creates a new dealer.
   */
  createDealer(request: DealerCreateRequest): Observable<DealerResponse> {
    return this.http.post<DealerResponse>(`${this.baseUrl}/dealers`, request);
  }

  /**
   * Gets a dealer by ID.
   */
  getDealer(id: string): Observable<DealerResponse> {
    return this.http.get<DealerResponse>(`${this.baseUrl}/dealers/${id}`);
  }

  /**
   * Lists all dealers with pagination.
   */
  listDealers(page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDirection: string = 'DESC'): Observable<PagedResponse<DealerResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);
    
    return this.http.get<PagedResponse<DealerResponse>>(`${this.baseUrl}/dealers`, { params });
  }

  /**
   * Updates a dealer.
   */
  updateDealer(id: string, request: DealerUpdateRequest): Observable<DealerResponse> {
    return this.http.patch<DealerResponse>(`${this.baseUrl}/dealers/${id}`, request);
  }

  /**
   * Deletes a dealer.
   */
  deleteDealer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dealers/${id}`);
  }

  // ==================== Vehicle Endpoints ====================

  /**
   * Creates a new vehicle.
   */
  createVehicle(request: VehicleCreateRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(`${this.baseUrl}/vehicles`, request);
  }

  /**
   * Gets a vehicle by ID.
   */
  getVehicle(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}/vehicles/${id}`);
  }

  /**
   * Searches vehicles with filters and pagination.
   */
  searchVehicles(search: VehicleSearchRequest): Observable<PagedResponse<VehicleResponse>> {
    let params = new HttpParams()
      .set('page', (search.page || 0).toString())
      .set('size', (search.size || 20).toString())
      .set('sortBy', search.sortBy || 'createdAt')
      .set('sortDirection', search.sortDirection || 'DESC');
    
    if (search.model) {
      params = params.set('model', search.model);
    }
    if (search.status) {
      params = params.set('status', search.status);
    }
    if (search.priceMin !== undefined) {
      params = params.set('priceMin', search.priceMin.toString());
    }
    if (search.priceMax !== undefined) {
      params = params.set('priceMax', search.priceMax.toString());
    }
    if (search.subscription) {
      params = params.set('subscription', search.subscription);
    }
    
    return this.http.get<PagedResponse<VehicleResponse>>(`${this.baseUrl}/vehicles`, { params });
  }

  /**
   * Updates a vehicle.
   */
  updateVehicle(id: string, request: VehicleUpdateRequest): Observable<VehicleResponse> {
    return this.http.patch<VehicleResponse>(`${this.baseUrl}/vehicles/${id}`, request);
  }

  /**
   * Deletes a vehicle.
   */
  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
  }

  // ==================== Admin Endpoints ====================

  /**
   * Gets global subscription counts (GLOBAL_ADMIN only).
   */
  getGlobalSubscriptionCounts(): Observable<SubscriptionCountResponse> {
    return this.http.get<SubscriptionCountResponse>(`${this.baseUrl}/admin/dealers/countBySubscription`);
  }

  // ==================== Tenant Endpoints ====================

  /**
   * Register a new tenant.
   * This is a public endpoint (no X-Tenant-Id required).
   */
  registerTenant(request: TenantRegisterRequest): Observable<TenantResponse> {
    return this.http.post<TenantResponse>(`${this.baseUrl}/api/tenants/register`, request);
  }

  /**
   * Get tenant information by UUID.
   * This is a public endpoint (no X-Tenant-Id required).
   */
  getTenant(uuid: string): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`${this.baseUrl}/api/tenants/${uuid}`);
  }

  /**
   * Get all tenants with pagination.
   * This is a public endpoint (no X-Tenant-Id required).
   */
  getAllTenants(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: string = 'DESC'
  ): Observable<PagedResponse<TenantResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<PagedResponse<TenantResponse>>(
      `${this.baseUrl}/api/tenants`,
      { params }
    );
  }

  // ==================== Auth Endpoints ====================

  /**
   * Login with email and password.
   * Returns JWT token and user info.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, request);
  }

  /**
   * Logout - invalidates current token.
   */
  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/logout`, {});
  }

  /**
   * Get current user info.
   */
  getCurrentUser(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.baseUrl}/api/auth/me`);
  }

  // ==================== User Management Endpoints ====================

  /**
   * List users for a specific tenant.
   * Requires TENANT_ADMIN or GLOBAL_ADMIN role.
   */
  listTenantUsers(tenantUuid: string, page: number = 0, size: number = 20): Observable<PagedUsersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedUsersResponse>(`${this.baseUrl}/api/tenants/${tenantUuid}/users`, { params });
  }

  /**
   * Create a user within a specific tenant.
   * Requires TENANT_ADMIN or GLOBAL_ADMIN role.
   */
  createTenantUser(tenantUuid: string, request: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/api/tenants/${tenantUuid}/users`, request);
  }

  /**
   * List all users (platform-level, GLOBAL_ADMIN only).
   */
  listAllUsers(page: number = 0, size: number = 20): Observable<PagedUsersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedUsersResponse>(`${this.baseUrl}/api/users`, { params });
  }

  /**
   * Create a user at platform level (GLOBAL_ADMIN only).
   */
  createUser(request: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/api/users`, request);
  }

  // ==================== Admin Dashboard Endpoints ====================

  /**
   * Get platform-wide vehicle counts by status (GLOBAL_ADMIN only).
   */
  getGlobalVehicleCounts(): Observable<{ available: number; sold: number }> {
    return this.http.get<{ available: number; sold: number }>(`${this.baseUrl}/admin/vehicles/countByStatus`);
  }

  /**
   * Get platform-wide dealer count (GLOBAL_ADMIN only).
   */
  getGlobalDealerCount(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/admin/dealers/count`);
  }

  /**
   * Get platform-wide vehicle count (GLOBAL_ADMIN only).
   */
  getGlobalVehicleCount(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/admin/vehicles/count`);
  }

  /**
   * Get recent dealers (GLOBAL_ADMIN only).
   */
  getRecentDealers(limit: number = 5): Observable<DealerResponse[]> {
    const params = new HttpParams()
      .set('limit', limit.toString());
    return this.http.get<DealerResponse[]>(`${this.baseUrl}/admin/dealers/recent`, { params });
  }

  /**
   * Get recent tenants (GLOBAL_ADMIN only).
   */
  getRecentTenants(limit: number = 5): Observable<TenantResponse[]> {
    const params = new HttpParams()
      .set('limit', limit.toString());
    return this.http.get<TenantResponse[]>(`${this.baseUrl}/admin/tenants/recent`, { params });
  }
}