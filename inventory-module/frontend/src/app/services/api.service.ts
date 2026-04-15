import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  TenantResponse
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
}