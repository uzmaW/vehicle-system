import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TenantService } from '../../services/tenant.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SubscriptionCountResponse, TenantResponse, DealerResponse } from '../../models/models';

interface DashboardStats {
  basicSubscriptions: number;
  premiumSubscriptions: number;
  totalDealers: number;
  totalVehicles: number;
  availableVehicles: number;
  soldVehicles: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Admin</h2>
          <span class="badge badge-premium">GLOBAL</span>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
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
              {{ (tenantService.getUserEmail() || 'admin').charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ tenantService.getUserEmail() }}</span>
              <span class="user-role">Global Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <!-- Access Warning -->
        <div class="alert alert-warning" *ngIf="!tenantService.isGlobalAdmin()">
          <strong>Access Restricted:</strong> This dashboard is only available to users with the GLOBAL_ADMIN role.
        </div>

        <ng-container *ngIf="tenantService.isGlobalAdmin()">
          <!-- Page Header -->
          <div class="page-header">
            <div>
              <h2>Platform Overview</h2>
              <p class="text-secondary">Monitor your multi-tenant inventory platform</p>
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
                <span class="stat-label">Total Dealers</span>
                <span class="stat-value">{{ stats.totalDealers }}</span>
                <span class="stat-change positive">Active across platform</span>
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
                <span class="stat-label">Total Vehicles</span>
                <span class="stat-value">{{ stats.totalVehicles }}</span>
                <span class="stat-change" [class.positive]="stats.availableVehicles > 0">
                  {{ stats.availableVehicles }} available
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon basic">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-label">Basic Plans</span>
                <span class="stat-value">{{ stats.basicSubscriptions }}</span>
                <span class="stat-change">{{ getBasicPercentage() }}% of dealers</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon premium">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-label">Premium Plans</span>
                <span class="stat-value">{{ stats.premiumSubscriptions }}</span>
                <span class="stat-change positive">{{ getPremiumPercentage() }}% of dealers</span>
              </div>
            </div>
          </div>

          <!-- Charts & Tables Row -->
          <div class="content-grid">
            <!-- Subscription Distribution -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Subscription Distribution</h3>
              </div>
              <div class="chart-container">
                <div class="distribution-bar">
                  <div class="bar-segment basic" [style.width.%]="getBasicPercentage() || 50">
                    <span class="bar-label" *ngIf="getBasicPercentage() > 10">{{ getBasicPercentage().toFixed(1) }}%</span>
                  </div>
                  <div class="bar-segment premium" [style.width.%]="getPremiumPercentage() || 50">
                    <span class="bar-label" *ngIf="getPremiumPercentage() > 10">{{ getPremiumPercentage().toFixed(1) }}%</span>
                  </div>
                </div>
                <div class="distribution-legend">
                  <div class="legend-item">
                    <span class="legend-color basic"></span>
                    <span>Basic ({{ stats.basicSubscriptions }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color premium"></span>
                    <span>Premium ({{ stats.premiumSubscriptions }})</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vehicle Status -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Vehicle Status</h3>
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
                    <span>Available ({{ stats.availableVehicles }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color sold"></span>
                    <span>Sold ({{ stats.soldVehicles }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Data Tables -->
          <div class="tables-grid">
            <!-- Recent Tenants -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Recent Tenants</h3>
                <a routerLink="/dealers" class="btn btn-sm btn-outline">View All</a>
              </div>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subscription</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let tenant of recentTenants">
                      <td>{{ tenant.name }}</td>
                      <td>{{ tenant.email }}</td>
                      <td>
                        <span class="badge" [ngClass]="tenant.subscriptionType === 'PREMIUM' ? 'badge-premium' : 'badge-basic'">
                          {{ tenant.subscriptionType }}
                        </span>
                      </td>
                      <td>
                        <span class="status-dot" [class.active]="tenant.active"></span>
                        {{ tenant.active ? 'Active' : 'Inactive' }}
                      </td>
                    </tr>
                    <tr *ngIf="recentTenants.length === 0 && !loading">
                      <td colspan="4" class="text-center text-secondary">No tenants found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Dealers -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Recent Dealers</h3>
                <a routerLink="/dealers" class="btn btn-sm btn-outline">View All</a>
              </div>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subscription</th>
                      <th>Vehicles</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let dealer of recentDealers">
                      <td>{{ dealer.name }}</td>
                      <td>{{ dealer.email }}</td>
                      <td>
                        <span class="badge" [ngClass]="dealer.subscriptionType === 'PREMIUM' ? 'badge-premium' : 'badge-basic'">
                          {{ dealer.subscriptionType }}
                        </span>
                      </td>
                      <td>{{ dealer.vehicleCount }}</td>
                    </tr>
                    <tr *ngIf="recentDealers.length === 0 && !loading">
                      <td colspan="4" class="text-center text-secondary">No dealers found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Platform Info -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Platform Information</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">API Endpoint</span>
                <code>GET /admin/dealers/countBySubscription</code>
              </div>
              <div class="info-item">
                <span class="info-label">Required Role</span>
                <span class="badge badge-premium">GLOBAL_ADMIN</span>
              </div>
              <div class="info-item">
                <span class="info-label">Data Scope</span>
                <span>Platform-wide (all tenants)</span>
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
      background: var(--primary-color);
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

    .stat-icon.basic {
      background: #fef3c7;
      color: #92400e;
    }

    .stat-icon.premium {
      background: #f3e8ff;
      color: #7c3aed;
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

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 992px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
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

    .bar-segment.basic {
      background: #fbbf24;
    }

    .bar-segment.premium {
      background: #a855f7;
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

    .legend-color.basic {
      background: #fbbf24;
    }

    .legend-color.premium {
      background: #a855f7;
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

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-secondary);
      margin-right: 0.5rem;
    }

    .status-dot.active {
      background: var(--success-color);
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

    .info-item code {
      background: var(--background-color);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
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
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    basicSubscriptions: 0,
    premiumSubscriptions: 0,
    totalDealers: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0
  };

  subscriptionCounts: SubscriptionCountResponse | null = null;
  recentTenants: TenantResponse[] = [];
  recentDealers: DealerResponse[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    public tenantService: TenantService
  ) {}

  ngOnInit(): void {
    if (this.tenantService.isGlobalAdmin()) {
      this.loadAllData();
    }
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;

    this.loadSubscriptionCounts();
    this.loadVehicleCounts();
    this.loadDealerCount();
    this.loadRecentData();
  }

  loadSubscriptionCounts(): void {
    this.apiService.getGlobalSubscriptionCounts().subscribe({
      next: (response) => {
        this.subscriptionCounts = response;
        this.stats.basicSubscriptions = response.basic;
        this.stats.premiumSubscriptions = response.premium;
        this.stats.totalDealers = response.basic + response.premium;
      },
      error: (err) => this.handleError(err)
    });
  }

  loadVehicleCounts(): void {
    this.apiService.getGlobalVehicleCounts().subscribe({
      next: (response) => {
        this.stats.availableVehicles = response.available;
        this.stats.soldVehicles = response.sold;
        this.stats.totalVehicles = response.available + response.sold;
      },
      error: (err) => this.handleError(err)
    });
  }

  loadDealerCount(): void {
    this.apiService.getGlobalDealerCount().subscribe({
      next: (response) => {
        this.stats.totalDealers = response.total;
      },
      error: (err) => this.handleError(err)
    });
  }

  loadRecentData(): void {
    this.apiService.getRecentTenants(5).subscribe({
      next: (tenants) => {
        this.recentTenants = tenants;
      },
      error: (err) => {
        console.error('Failed to load recent tenants:', err);
      }
    });

    this.apiService.getRecentDealers(5).subscribe({
      next: (dealers) => {
        this.recentDealers = dealers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recent dealers:', err);
        this.loading = false;
      }
    });
  }

  getBasicPercentage(): number {
    if (this.stats.totalDealers === 0) return 0;
    return (this.stats.basicSubscriptions / this.stats.totalDealers) * 100;
  }

  getPremiumPercentage(): number {
    if (this.stats.totalDealers === 0) return 0;
    return (this.stats.premiumSubscriptions / this.stats.totalDealers) * 100;
  }

  getAvailablePercentage(): number {
    if (this.stats.totalVehicles === 0) return 0;
    return (this.stats.availableVehicles / this.stats.totalVehicles) * 100;
  }

  getSoldPercentage(): number {
    if (this.stats.totalVehicles === 0) return 0;
    return (this.stats.soldVehicles / this.stats.totalVehicles) * 100;
  }

  private handleError(err: any): void {
    console.error('API Error:', err);
    this.loading = false;
    if (err.status === 403) {
      this.error = 'Access denied - GLOBAL_ADMIN role required';
    } else if (err.error?.message) {
      this.error = err.error.message;
    } else if (err.status === 0) {
      this.error = 'Cannot connect to server - is the backend running?';
    }
  }
}