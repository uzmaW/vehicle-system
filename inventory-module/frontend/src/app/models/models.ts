// Enums
export enum SubscriptionType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD'
}

export enum UserRole {
  STANDARD = 'STANDARD',
  GLOBAL_ADMIN = 'GLOBAL_ADMIN'
}

// DTOs
export interface DealerCreateRequest {
  name: string;
  email: string;
  subscriptionType: SubscriptionType;
}

export interface DealerUpdateRequest {
  name?: string;
  email?: string;
  subscriptionType?: SubscriptionType;
}

export interface DealerResponse {
  id: string;
  name: string;
  email: string;
  subscriptionType: SubscriptionType;
  vehicleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCreateRequest {
  dealerId: string;
  model: string;
  price: number;
  status?: VehicleStatus;
}

export interface VehicleUpdateRequest {
  dealerId?: string;
  model?: string;
  price?: number;
  status?: VehicleStatus;
}

export interface VehicleResponse {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerSubscriptionType: SubscriptionType;
  model: string;
  price: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSearchRequest {
  model?: string;
  status?: VehicleStatus;
  priceMin?: number;
  priceMax?: number;
  subscription?: SubscriptionType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SubscriptionCountResponse {
  basic: number;
  premium: number;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  errorCode: string;
  validationErrors?: string[];
  tenantId?: string;
}

// Tenant DTOs
export interface TenantRegisterRequest {
  name: string;
  email: string;
  phone?: string;
  subscriptionType?: SubscriptionType;
}

export interface TenantResponse {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  subscriptionType: SubscriptionType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}