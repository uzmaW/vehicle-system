import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TenantService } from '../../services/tenant.service';
import {
  DealerResponse,
  DealerCreateRequest,
  DealerUpdateRequest,
  PagedResponse,
  SubscriptionType,
  ErrorResponse
} from '../../models/models';

@Component({
  selector: 'app-dealer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <div class="page-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>{{ tenantService.isGlobalAdmin() ? 'Global' : 'Tenant' }}</h2>
          <span class="badge" [ngClass]="tenantService.isGlobalAdmin() ? 'badge-premium' : 'badge-basic'">
            {{ tenantService.isGlobalAdmin() ? 'GLOBAL' : 'ADMIN' }}
          </span>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dealers" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Dealers</span>
          </a>
          <a routerLink="/vehicles" routerLinkActive="active" class="nav-item">
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
            <div class="user-avatar">
              {{ (tenantService.getUserEmail() || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ tenantService.getUserEmail() }}</span>
              <span class="user-role">{{ tenantService.getUserRole() }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="page-main">
        <div class="dealer-list">
      <div class="page-header">
        <div>
          <h2>Dealer Management</h2>
          <p class="text-secondary">Manage dealers within your tenant</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          + Add Dealer
        </button>
      </div>

      <!-- Error Alert -->
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
        <button class="btn btn-sm btn-outline" (click)="error = null" style="margin-left: auto;">Dismiss</button>
      </div>

      <!-- Dealer Table -->
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subscription</th>
                <th>Vehicles</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="6" class="text-center">
                  <div class="spinner"></div>
                  <span style="margin-left: 0.5rem;">Loading dealers...</span>
                </td>
              </tr>
              <tr *ngIf="!loading && dealers.length === 0">
                <td colspan="6" class="text-center text-secondary">
                  No dealers found. Click "Add Dealer" to create one.
                </td>
              </tr>
              <tr *ngFor="let dealer of dealers">
                <td class="font-bold">{{ dealer.name }}</td>
                <td>{{ dealer.email }}</td>
                <td>
                  <span class="badge" [ngClass]="dealer.subscriptionType === 'PREMIUM' ? 'badge-premium' : 'badge-basic'">
                    {{ dealer.subscriptionType }}
                  </span>
                </td>
                <td>{{ dealer.vehicleCount }}</td>
                <td>{{ dealer.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-outline" (click)="openEditModal(dealer)">Edit</button>
                    <button class="btn btn-sm btn-danger" (click)="confirmDelete(dealer)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pageInfo">
          <div class="pagination-info">
            Showing {{ dealers.length }} of {{ pageInfo.totalElements }} dealers
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
            <h3 class="modal-title">{{ editingDealer ? 'Edit Dealer' : 'Add New Dealer' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form #dealerForm="ngForm" (ngSubmit)="submitForm()">
              <div class="form-group">
                <label class="form-label">Dealer Name *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="formData.name" 
                  name="name"
                  required
                  minlength="2"
                  #nameInput="ngModel"
                />
                <span class="form-error" *ngIf="nameInput.invalid && nameInput.touched">
                  Name is required (min 2 characters)
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Email *</label>
                <input 
                  type="email" 
                  class="form-control" 
                  [(ngModel)]="formData.email" 
                  name="email"
                  required
                  email
                  #emailInput="ngModel"
                />
                <span class="form-error" *ngIf="emailInput.invalid && emailInput.touched">
                  Valid email is required
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Subscription Type *</label>
                <select 
                  class="form-control" 
                  [(ngModel)]="formData.subscriptionType" 
                  name="subscriptionType"
                  required>
                  <option [ngValue]="SubscriptionType.BASIC">BASIC</option>
                  <option [ngValue]="SubscriptionType.PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  [disabled]="dealerForm.invalid || submitting">
                  {{ submitting ? 'Saving...' : (editingDealer ? 'Update' : 'Create') }}
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
            <p>Are you sure you want to delete <strong>{{ dealerToDelete?.name }}</strong>?</p>
            <p class="text-danger">This will also delete all associated vehicles.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger" (click)="deleteDealer()" [disabled]="submitting">
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
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    .sidebar-nav {
      padding: 1rem;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: all var(--transition-fast);
      margin-bottom: 0.25rem;
    }
    .nav-item:hover {
      background: var(--background-color);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: #eff6ff;
      color: var(--primary-color);
    }
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--secondary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--text-secondary);
    }
    .page-main {
      flex: 1;
      padding: 2rem;
      background: var(--background-color);
      overflow-x: hidden;
    }
    @media (max-width: 768px) {
      .page-layout {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }
    }
  `]
})
export class DealerListComponent implements OnInit {
  dealers: DealerResponse[] = [];
  pageInfo?: PagedResponse<DealerResponse>;
  loading = false;
  error: string | null = null;
  showModal = false;
  showDeleteModal = false;
  editingDealer: DealerResponse | null = null;
  dealerToDelete: DealerResponse | null = null;
  submitting = false;

  formData = {
    name: '',
    email: '',
    subscriptionType: SubscriptionType.BASIC
  };

  SubscriptionType = SubscriptionType;

  constructor(
    private apiService: ApiService,
    public tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.loadDealers();
  }

  loadDealers(page: number = 0): void {
    if (!this.tenantService.hasTenantContext()) {
      this.error = 'Please configure a Tenant ID in Settings';
      return;
    }

    this.loading = true;
    this.error = null;

    this.apiService.listDealers(page, 10).subscribe({
      next: (response) => {
        this.dealers = response.content;
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
    this.loadDealers(page);
  }

  openCreateModal(): void {
    this.editingDealer = null;
    this.formData = {
      name: '',
      email: '',
      subscriptionType: SubscriptionType.BASIC
    };
    this.showModal = true;
  }

  openEditModal(dealer: DealerResponse): void {
    this.editingDealer = dealer;
    this.formData = {
      name: dealer.name,
      email: dealer.email,
      subscriptionType: dealer.subscriptionType
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingDealer = null;
  }

  submitForm(): void {
    if (this.submitting) return;

    this.submitting = true;
    this.error = null;

    if (this.editingDealer) {
      // Update existing dealer
      const request: DealerUpdateRequest = {
        name: this.formData.name,
        email: this.formData.email,
        subscriptionType: this.formData.subscriptionType
      };

      this.apiService.updateDealer(this.editingDealer.id, request).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadDealers(this.pageInfo?.pageNumber || 0);
        },
        error: (err) => {
          this.submitting = false;
          this.handleError(err);
        }
      });
    } else {
      // Create new dealer
      const request: DealerCreateRequest = {
        name: this.formData.name,
        email: this.formData.email,
        subscriptionType: this.formData.subscriptionType
      };

      this.apiService.createDealer(request).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadDealers();
        },
        error: (err) => {
          this.submitting = false;
          this.handleError(err);
        }
      });
    }
  }

  confirmDelete(dealer: DealerResponse): void {
    this.dealerToDelete = dealer;
    this.showDeleteModal = true;
  }

  deleteDealer(): void {
    if (!this.dealerToDelete || this.submitting) return;

    this.submitting = true;

    this.apiService.deleteDealer(this.dealerToDelete.id).subscribe({
      next: () => {
        this.submitting = false;
        this.showDeleteModal = false;
        this.dealerToDelete = null;
        this.loadDealers(this.pageInfo?.pageNumber || 0);
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