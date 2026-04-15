import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TenantService } from '../../services/tenant.service';
import { SubscriptionCountResponse } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-dashboard">
      <div class="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p class="text-secondary">Platform-wide statistics and management</p>
        </div>
      </div>

      <!-- Access Warning -->
      <div class="alert alert-warning" *ngIf="!tenantService.isGlobalAdmin()">
        <strong>Access Restricted:</strong> This dashboard is only available to users with the GLOBAL_ADMIN role.
        Please update your role in Settings to access this page.
      </div>

      <!-- Content for Admin Users -->
      <ng-container *ngIf="tenantService.isGlobalAdmin()">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon basic">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Basic Subscriptions</h3>
              <p class="stat-value">{{ subscriptionCounts?.basic ?? '-' }}</p>
              <p class="stat-label">dealers on basic plan</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon premium">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Premium Subscriptions</h3>
              <p class="stat-value">{{ subscriptionCounts?.premium ?? '-' }}</p>
              <p class="stat-label">dealers on premium plan</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon total">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Total Dealers</h3>
              <p class="stat-value">{{ totalCount }}</p>
              <p class="stat-label">across all tenants</p>
            </div>
          </div>
        </div>

        <!-- Subscription Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Subscription Distribution</h3>
            <button class="btn btn-outline btn-sm" (click)="loadStats()" [disabled]="loading">
              {{ loading ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>

          <div class="distribution-bar" *ngIf="totalCount > 0">
            <div class="bar-segment basic" [style.width.%]="basicPercentage">
              <span class="bar-label" *ngIf="basicPercentage > 10">{{ basicPercentage.toFixed(1) }}%</span>
            </div>
            <div class="bar-segment premium" [style.width.%]="premiumPercentage">
              <span class="bar-label" *ngIf="premiumPercentage > 10">{{ premiumPercentage.toFixed(1) }}%</span>
            </div>
          </div>

          <div class="distribution-legend">
            <div class="legend-item">
              <span class="legend-color basic"></span>
              <span>Basic ({{ subscriptionCounts?.basic ?? 0 }})</span>
            </div>
            <div class="legend-item">
              <span class="legend-color premium"></span>
              <span>Premium ({{ subscriptionCounts?.premium ?? 0 }})</span>
            </div>
          </div>
        </div>

        <!-- Admin Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Admin Access Information</h3>
          </div>
          <div class="info-content">
            <p><strong>Endpoint:</strong> <code>GET /admin/dealers/countBySubscription</code></p>
            <p><strong>Required Role:</strong> <code>GLOBAL_ADMIN</code></p>
            <p><strong>Scope:</strong> These counts represent <strong>overall platform-wide statistics</strong> across all tenants.</p>
            <p class="text-secondary mt-2">
              This endpoint is useful for platform billing, capacity planning, and business intelligence.
              Standard tenant-scoped requests will only return counts within their tenant.
            </p>
          </div>
        </div>
      </ng-container>

      <!-- Error Alert -->
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
        <button class="btn btn-sm btn-outline" (click)="error = null" style="margin-left: auto;">Dismiss</button>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
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

    .stat-icon.basic {
      background: #fef3c7;
      color: #92400e;
    }

    .stat-icon.premium {
      background: #dbeafe;
      color: #1e40af;
    }

    .stat-icon.total {
      background: #dcfce7;
      color: #166534;
    }

    .stat-content h3 {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .distribution-bar {
      height: 32px;
      background: var(--background-color);
      border-radius: var(--radius-md);
      display: flex;
      overflow: hidden;
      margin: 1.5rem 0;
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
      background: #3b82f6;
    }

    .bar-label {
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .distribution-legend {
      display: flex;
      gap: 2rem;
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
      background: #3b82f6;
    }

    .info-content {
      font-size: 0.875rem;
    }

    .info-content p {
      margin-bottom: 0.5rem;
    }

    .info-content code {
      background: var(--background-color);
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
      font-family: monospace;
      font-size: 0.8rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  subscriptionCounts: SubscriptionCountResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    public tenantService: TenantService
  ) {}

  ngOnInit(): void {
    if (this.tenantService.isGlobalAdmin()) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getGlobalSubscriptionCounts().subscribe({
      next: (response) => {
        this.subscriptionCounts = response;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  get totalCount(): number {
    if (!this.subscriptionCounts) return 0;
    return this.subscriptionCounts.basic + this.subscriptionCounts.premium;
  }

  get basicPercentage(): number {
    if (!this.subscriptionCounts || this.totalCount === 0) return 0;
    return (this.subscriptionCounts.basic / this.totalCount) * 100;
  }

  get premiumPercentage(): number {
    if (!this.subscriptionCounts || this.totalCount === 0) return 0;
    return (this.subscriptionCounts.premium / this.totalCount) * 100;
  }

  private handleError(err: any): void {
    console.error('API Error:', err);
    if (err.status === 403) {
      this.error = 'Access denied - GLOBAL_ADMIN role required';
    } else if (err.error?.message) {
      this.error = err.error.message;
    } else if (err.status === 0) {
      this.error = 'Cannot connect to server - is the backend running?';
    } else {
      this.error = 'An unexpected error occurred';
    }
  }
}