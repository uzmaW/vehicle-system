import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TenantService } from '../../services/tenant.service';
import { DealerResponse, VehicleResponse, SubscriptionCountResponse } from '../../models/models';
import { PagedResponse } from '../../models/models';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Admin</h2>
          <span class="badge badge-basic">TENANT</span>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/tenant-admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/dealers" routerLinkActive="active" class="nav-item">
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
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              {{ (tenantService.getUserEmail() || 'A').charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ tenantService.getUserEmail() }}</span>
              <span class="user-role">Tenant Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <!-- Access Warning -->
        <div class="alert alert-warning" *ngIf="!tenantService.isAdmin()">
          <strong>Access Restricted:</strong> This dashboard is only available to users with TENANT_ADMIN or GLOBAL_ADMIN role.
        </div>

        <ng-container *ngIf="tenantService.isAdmin()">
          <!-- Page Header -->
          <div class="page-header">
            <div>
              <h2>Tenant Dashboard</h2>
              <p class="text-secondary">Manage your organization</p>
            </div>
            <button class="btn btn-outline" (click)="loadAllData()" [disabled]="loading">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <!-- Tenant Info Card -->
          <div class="card tenant-info-card">
            <div class="tenant-info-content">
              <div class="tenant-detail">
                <span class="label">Tenant ID</span>
                <code>{{ tenantService.getTenantId() }}</code>
              </div>
              <div class="tenant-detail">
                <span class="label">Plan</span>
                <span class="badge badge-premium">Premium</span>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon dealers">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-label">Dealers</span>
                <span class="stat-value">{{ dealerCount }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon vehicles">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-label">Vehicles</span>
                <span class="stat-value">{{ vehicleCount }}</span>
                <span class="stat-change" [class.positive]="availableVehicles > 0">
                  {{ availableVehicles }} available
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon available">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-label">Available</span>
                <span class="stat-value">{{ availableVehicles }}</span>
                <span class="stat-change positive">{{ getAvailablePercentage() }}% of inventory</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon sold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 8l-8 8"></path>
                  <path d="M8 8l8 8"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-label">Sold</span>
                <span class="stat-value">{{ soldVehicles }}</span>
                <span class="stat-change">{{ getSoldPercentage() }}% of inventory</span>
              </div>
            </div>
          </div>

          <!-- Vehicle Status Chart -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Vehicle Status</h3>
              <a routerLink="/vehicles" class="btn btn-sm btn-outline">View All</a>
            </div>
            <div class="chart-container">
              <div class="distribution-bar">
                <div class="bar-segment available" [style.width.%]="getAvailablePercentage() || 50">
                  <span class="bar-label" *ngIf="getAvailablePercentage() > 10">{{ getAvailablePercentage().toFixed(1) }}%</span>
                </div>
                <div class="bar-segment sold" [style.width.%]="getSoldPercentage() || 50">
                  <span class="bar-label" *ngIf="getSoldPercentage() > 10">{{ getSoldPercentage().toFixed(1) }}%</span>
                </div>
              </div>
              <div class="distribution-legend">
                <div class="legend-item">
                  <span class="legend-color available"></span>
                  <span>Available ({{ availableVehicles }})</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color sold"></span>
                  <span>Sold ({{ soldVehicles }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Data -->
          <div class="tables-grid">
            <!-- Recent Dealers -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Dealers</h3>
                <a routerLink="/dealers" class="btn btn-sm btn-outline">View All</a>
              </div>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Vehicles</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let dealer of dealers">
                      <td>{{ dealer.name }}</td>
                      <td>{{ dealer.email }}</td>
                      <td>{{ dealer.vehicleCount }}</td>
                    </tr>
                    <tr *ngIf="dealers.length === 0 && !loading">
                      <td colspan="3" class="text-center text-secondary">No dealers found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Vehicles -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Vehicles</h3>
                <a routerLink="/vehicles" class="btn btn-sm btn-outline">View All</a>
              </div>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let vehicle of vehicles">
                      <td>{{ vehicle.model }}</td>
                      <td>\${{ vehicle.price | number }}</td>
                      <td>
                        <span class="badge" [ngClass]="vehicle.status === 'AVAILABLE' ? 'badge-available' : 'badge-sold'">
                          {{ vehicle.status }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="vehicles.length === 0 && !loading">
                      <td colspan="3" class="text-center text-secondary">No vehicles found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Platform Info -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Tenant Information</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">API Scope</span>
                <span>Tenant-specific (X-Tenant-Id header)</span>
              </div>
              <div class="info-item">
                <span class="info-label">Required Role</span>
                <span class="badge badge-basic">TENANT_ADMIN</span>
              </div>
              <div class="info-item">
                <span class="info-label">Data Visibility</span>
                <span>Current tenant only</span>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Error Alert -->
        <div class="alert alert-error" *ngIf="error">
          {{ error }}
          <button class="btn btn-sm btn-outline" (click)="error = null" style="margin-left: auto;">Dismiss</button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
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
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--secondary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .admin-main {
      flex: 1;
      padding: 2rem;
      background: var(--background-color);
      overflow-x: hidden;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      margin-bottom: 0.25rem;
    }

    .tenant-info-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 1.5rem;
    }

    .tenant-info-content {
      display: flex;
      gap: 3rem;
      flex-wrap: wrap;
    }

    .tenant-detail {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tenant-detail .label {
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .tenant-detail code {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
    }

    .tenant-detail .badge {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.dealers {
      background: #dbeafe;
      color: #1e40af;
    }

    .stat-icon.vehicles {
      background: #dcfce7;
      color: #166534;
    }

    .stat-icon.available {
      background: #dcfce7;
      color: #166534;
    }

    .stat-icon.sold {
      background: #fee2e2;
      color: #991b1b;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0.25rem 0;
    }

    .stat-change {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .stat-change.positive {
      color: var(--success-color);
    }

    .chart-container {
      padding: 0.5rem 0;
    }

    .distribution-bar {
      height: 40px;
      background: var(--background-color);
      border-radius: var(--radius-md);
      display: flex;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .bar-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.5s ease;
    }

    .bar-segment.available {
      background: #22c55e;
    }

    .bar-segment.sold {
      background: #ef4444;
    }

    .bar-label {
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .distribution-legend {
      display: flex;
      gap: 2rem;
      justify-content: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.available {
      background: #22c55e;
    }

    .legend-color.sold {
      background: #ef4444;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 992px) {
      .tables-grid {
        grid-template-columns: 1fr;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .admin-layout {
        flex-direction: column;
      }
      
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }
      
      .admin-main {
        padding: 1rem;
      }
    }
  `]
})
export class TenantDashboardComponent implements OnInit {
  dealerCount = 0;
  vehicleCount = 0;
  availableVehicles = 0;
  soldVehicles = 0;

  dealers: DealerResponse[] = [];
  vehicles: VehicleResponse[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    public tenantService: TenantService
  ) {}

  ngOnInit(): void {
    if (this.tenantService.isAdmin()) {
      this.loadAllData();
    }
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;

    this.loadDealers();
    this.loadVehicles();
  }

  loadDealers(): void {
    this.apiService.listDealers(0, 5).subscribe({
      next: (response) => {
        this.dealers = response.content;
        this.dealerCount = response.totalElements;
      },
      error: (err) => this.handleError(err)
    });
  }

  loadVehicles(): void {
    this.apiService.searchVehicles({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        const vehicles = response.content;
        this.vehicleCount = response.totalElements;
        this.availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
        this.soldVehicles = vehicles.filter(v => v.status === 'SOLD').length;
        this.vehicles = vehicles.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
        this.loading = false;
      }
    });
  }

  getAvailablePercentage(): number {
    if (this.vehicleCount === 0) return 0;
    return (this.availableVehicles / this.vehicleCount) * 100;
  }

  getSoldPercentage(): number {
    if (this.vehicleCount === 0) return 0;
    return (this.soldVehicles / this.vehicleCount) * 100;
  }

  private handleError(err: any): void {
    console.error('API Error:', err);
    if (err.status === 403) {
      this.error = 'Access denied - TENANT_ADMIN role required';
    } else if (err.error?.message) {
      this.error = err.error.message;
    } else if (err.status === 0) {
      this.error = 'Cannot connect to server - is the backend running?';
    }
  }
}