import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TenantService } from '../../services/tenant.service';
import {
  VehicleResponse,
  VehicleCreateRequest,
  VehicleUpdateRequest,
  DealerResponse,
  PagedResponse,
  SubscriptionType,
  VehicleStatus
} from '../../models/models';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <div class="page-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>{{ tenantService.isGlobalAdmin() ? 'Global' : 'Tenant' }}</h2>
          <span class="badge" [ngClass]="tenantService.isGlobalAdmin() ? 'badge-premium' : 'badge-basic'">
            {{ tenantService.isGlobalAdmin() ? 'GLOBAL' : 'ADMIN' }}
          </span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dealers" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Dealers</span>
          </a>
          <a routerLink="/vehicles" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Vehicles</span>
          </a>
          <a routerLink="/users" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Users</span>
          </a>
          <a routerLink="/admin" routerLinkActive="active" class="nav-item" *ngIf="tenantService.isGlobalAdmin()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Admin</span>
          </a>
          <a routerLink="/tenant-admin" routerLinkActive="active" class="nav-item" *ngIf="tenantService.isTenantAdmin() && !tenantService.isGlobalAdmin()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ (tenantService.getUserEmail() || 'U').charAt(0).toUpperCase() }}</div>
            <div class="user-details">
              <span class="user-name">{{ tenantService.getUserEmail() }}</span>
              <span class="user-role">{{ tenantService.getUserRole() }}</span>
            </div>
          </div>
        </div>
      </aside>
      <main class="page-main">
        <div class="vehicle-list">
      <div class="page-header">
        <div>
          <h2>Vehicle Inventory</h2>
          <p class="text-secondary">Manage vehicles in your inventory</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          + Add Vehicle
        </button>
      </div>

      <!-- Filters -->
      <div class="card filters-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Search Model</label>
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="filters.model"
              placeholder="Search by model..."
              (keyup.enter)="applyFilters()"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" [(ngModel)]="filters.status">
              <option [ngValue]="null">All Statuses</option>
              <option [ngValue]="VehicleStatus.AVAILABLE">Available</option>
              <option [ngValue]="VehicleStatus.SOLD">Sold</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Price Range</label>
            <div class="price-range">
              <input 
                type="number" 
                class="form-control" 
                [(ngModel)]="filters.priceMin"
                placeholder="Min"
              />
              <span>-</span>
              <input 
                type="number" 
                class="form-control" 
                [(ngModel)]="filters.priceMax"
                placeholder="Max"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Dealer Subscription</label>
            <select class="form-control" [(ngModel)]="filters.subscription">
              <option [ngValue]="null">All Subscriptions</option>
              <option [ngValue]="SubscriptionType.BASIC">Basic</option>
              <option [ngValue]="SubscriptionType.PREMIUM">Premium</option>
            </select>
          </div>
          
          <div class="form-group filter-actions">
            <button class="btn btn-primary" (click)="applyFilters()">Apply Filters</button>
            <button class="btn btn-outline" (click)="clearFilters()">Clear</button>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
        <button class="btn btn-sm btn-outline" (click)="error = null" style="margin-left: auto;">Dismiss</button>
      </div>

      <!-- Vehicle Table -->
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Dealer</th>
                <th>Subscription</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="7" class="text-center">
                  <div class="spinner"></div>
                  <span style="margin-left: 0.5rem;">Loading vehicles...</span>
                </td>
              </tr>
              <tr *ngIf="!loading && vehicles.length === 0">
                <td colspan="7" class="text-center text-secondary">
                  No vehicles found. Click "Add Vehicle" to create one.
                </td>
              </tr>
              <tr *ngFor="let vehicle of vehicles">
                <td class="font-bold">{{ vehicle.model }}</td>
                <td>{{ vehicle.dealerName }}</td>
                <td>
                  <span class="badge" [ngClass]="vehicle.dealerSubscriptionType === 'PREMIUM' ? 'badge-premium' : 'badge-basic'">
                    {{ vehicle.dealerSubscriptionType }}
                  </span>
                </td>
                <td>{{ vehicle.price | currency }}</td>
                <td>
                  <span class="badge" [ngClass]="vehicle.status === 'AVAILABLE' ? 'badge-available' : 'badge-sold'">
                    {{ vehicle.status }}
                  </span>
                </td>
                <td>{{ vehicle.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-outline" (click)="openEditModal(vehicle)">Edit</button>
                    <button 
                      class="btn btn-sm btn-success" 
                      *ngIf="vehicle.status === 'AVAILABLE'"
                      (click)="markAsSold(vehicle)">
                      Mark Sold
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="confirmDelete(vehicle)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pageInfo">
          <div class="pagination-info">
            Showing {{ vehicles.length }} of {{ pageInfo.totalElements }} vehicles
            (Page {{ pageInfo.pageNumber + 1 }} of {{ pageInfo.totalPages }})
          </div>
          <div class="pagination-controls">
            <button 
              class="btn btn-outline btn-sm" 
              [disabled]="pageInfo.first"
              (click)="loadPage(pageInfo.pageNumber - 1)">
              Previous
            </button>
            <button 
              class="btn btn-outline btn-sm" 
              [disabled]="pageInfo.last"
              (click)="loadPage(pageInfo.pageNumber + 1)">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form #vehicleForm="ngForm" (ngSubmit)="submitForm()">
              <div class="form-group">
                <label class="form-label">Dealer *</label>
                <select 
                  class="form-control" 
                  [(ngModel)]="formData.dealerId" 
                  name="dealerId"
                  required
                  #dealerInput="ngModel">
                  <option [ngValue]="null">Select a dealer</option>
                  <option *ngFor="let dealer of dealers" [ngValue]="dealer.id">
                    {{ dealer.name }} ({{ dealer.subscriptionType }})
                  </option>
                </select>
                <span class="form-error" *ngIf="dealerInput.invalid && dealerInput.touched">
                  Dealer is required
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Model *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="formData.model" 
                  name="model"
                  required
                  #modelInput="ngModel"
                />
                <span class="form-error" *ngIf="modelInput.invalid && modelInput.touched">
                  Model is required
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Price *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  [(ngModel)]="formData.price" 
                  name="price"
                  required
                  min="0.01"
                  step="0.01"
                  #priceInput="ngModel"
                />
                <span class="form-error" *ngIf="priceInput.invalid && priceInput.touched">
                  Valid price is required
                </span>
              </div>

              <div class="form-group" *ngIf="editingVehicle">
                <label class="form-label">Status</label>
                <select 
                  class="form-control" 
                  [(ngModel)]="formData.status" 
                  name="status">
                  <option [ngValue]="VehicleStatus.AVAILABLE">Available</option>
                  <option [ngValue]="VehicleStatus.SOLD">Sold</option>
                </select>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  [disabled]="vehicleForm.invalid || submitting">
                  {{ submitting ? 'Saving...' : (editingVehicle ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="showDeleteModal = false">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width: 400px;">
          <div class="modal-header">
            <h3 class="modal-title">Confirm Delete</h3>
            <button class="modal-close" (click)="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ vehicleToDelete?.model }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger" (click)="deleteVehicle()" [disabled]="submitting">
              {{ submitting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </main>
    </div>
  `,
  styles: [`
    .page-layout {
      display: flex;
      min-height: calc(100vh - 140px);
      margin: -2rem 0;
    }
    .sidebar {
      width: 260px;
      background: white;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-header h2 { margin: 0; font-size: 1.25rem; }
    .sidebar-nav { padding: 1rem; flex: 1; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .nav-item:hover { background: var(--background-color); color: var(--text-primary); }
    .nav-item.active { background: #eff6ff; color: var(--primary-color); }
    .sidebar-footer { padding: 1rem; border-top: 1px solid var(--border-color); }
    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--secondary-color); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.875rem;
    }
    .user-details { display: flex; flex-direction: column; }
    .user-name { font-size: 0.8rem; font-weight: 500; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.7rem; color: var(--text-secondary); }
    .page-main { flex: 1; padding: 2rem; background: var(--background-color); overflow-x: hidden; }
    @media (max-width: 768px) {
      .page-layout { flex-direction: column; }
      .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); }
    }
    .filters-card {
      margin-bottom: 1.5rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .price-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-range input {
      flex: 1;
    }

    .price-range span {
      color: var(--text-secondary);
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
      padding-bottom: 0;
    }
  `]
})
export class VehicleListComponent implements OnInit {
  vehicles: VehicleResponse[] = [];
  dealers: DealerResponse[] = [];
  pageInfo?: PagedResponse<VehicleResponse>;
  loading = false;
  error: string | null = null;
  showModal = false;
  showDeleteModal = false;
  editingVehicle: VehicleResponse | null = null;
  vehicleToDelete: VehicleResponse | null = null;
  submitting = false;

  filters = {
    model: '',
    status: null as VehicleStatus | null,
    priceMin: null as number | null,
    priceMax: null as number | null,
    subscription: null as SubscriptionType | null
  };

  formData = {
    dealerId: '',
    model: '',
    price: 0,
    status: VehicleStatus.AVAILABLE
  };

  SubscriptionType = SubscriptionType;
  VehicleStatus = VehicleStatus;

  constructor(
    private apiService: ApiService,
    public tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.loadDealers();
    this.loadVehicles();
  }

  loadDealers(): void {
    this.apiService.listDealers(0, 100).subscribe({
      next: (response) => {
        this.dealers = response.content;
      },
      error: (err) => {
        console.error('Failed to load dealers:', err);
      }
    });
  }

  loadVehicles(page: number = 0): void {
    if (!this.tenantService.hasTenantContext()) {
      this.error = 'Please configure a Tenant ID in Settings';
      return;
    }

    this.loading = true;
    this.error = null;

    this.apiService.searchVehicles({
      model: this.filters.model || undefined,
      status: this.filters.status || undefined,
      priceMin: this.filters.priceMin || undefined,
      priceMax: this.filters.priceMax || undefined,
      subscription: this.filters.subscription || undefined,
      page: page,
      size: 10
    }).subscribe({
      next: (response) => {
        this.vehicles = response.content;
        this.pageInfo = response;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  loadPage(page: number): void {
    this.loadVehicles(page);
  }

  applyFilters(): void {
    this.loadVehicles(0);
  }

  clearFilters(): void {
    this.filters = {
      model: '',
      status: null,
      priceMin: null,
      priceMax: null,
      subscription: null
    };
    this.loadVehicles(0);
  }

  openCreateModal(): void {
    this.editingVehicle = null;
    this.formData = {
      dealerId: '',
      model: '',
      price: 0,
      status: VehicleStatus.AVAILABLE
    };
    this.showModal = true;
  }

  openEditModal(vehicle: VehicleResponse): void {
    this.editingVehicle = vehicle;
    this.formData = {
      dealerId: vehicle.dealerId,
      model: vehicle.model,
      price: vehicle.price,
      status: vehicle.status
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingVehicle = null;
  }

  submitForm(): void {
    if (this.submitting) return;

    this.submitting = true;
    this.error = null;

    if (this.editingVehicle) {
      const request: VehicleUpdateRequest = {
        dealerId: this.formData.dealerId,
        model: this.formData.model,
        price: this.formData.price,
        status: this.formData.status
      };

      this.apiService.updateVehicle(this.editingVehicle.id, request).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadVehicles(this.pageInfo?.pageNumber || 0);
        },
        error: (err) => {
          this.submitting = false;
          this.handleError(err);
        }
      });
    } else {
      const request: VehicleCreateRequest = {
        dealerId: this.formData.dealerId,
        model: this.formData.model,
        price: this.formData.price,
        status: this.formData.status
      };

      this.apiService.createVehicle(request).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadVehicles();
        },
        error: (err) => {
          this.submitting = false;
          this.handleError(err);
        }
      });
    }
  }

  markAsSold(vehicle: VehicleResponse): void {
    this.apiService.updateVehicle(vehicle.id, { status: VehicleStatus.SOLD }).subscribe({
      next: () => {
        this.loadVehicles(this.pageInfo?.pageNumber || 0);
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  confirmDelete(vehicle: VehicleResponse): void {
    this.vehicleToDelete = vehicle;
    this.showDeleteModal = true;
  }

  deleteVehicle(): void {
    if (!this.vehicleToDelete || this.submitting) return;

    this.submitting = true;

    this.apiService.deleteVehicle(this.vehicleToDelete.id).subscribe({
      next: () => {
        this.submitting = false;
        this.showDeleteModal = false;
        this.vehicleToDelete = null;
        this.loadVehicles(this.pageInfo?.pageNumber || 0);
      },
      error: (err) => {
        this.submitting = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    console.error('API Error:', err);
    if (err.error?.message) {
      this.error = err.error.message;
    } else if (err.status === 400) {
      this.error = 'Bad request - please check your input';
    } else if (err.status === 403) {
      this.error = 'Access denied - check your tenant context';
    } else if (err.status === 0) {
      this.error = 'Cannot connect to server - is the backend running?';
    } else {
      this.error = 'An unexpected error occurred';
    }
  }
}