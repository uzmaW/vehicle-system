import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TenantService } from './services/tenant.service';
import { ApiService } from './services/api.service';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionType, UserRole } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NgClass, NgFor, FormsModule],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="container header-content">
          <div class="logo-section">
            <h1 class="logo">Inventory Module</h1>
            <span class="subtitle">Multi-Tenant Management System</span>
          </div>

          <nav class="nav">
            <a routerLink="/dealers" routerLinkActive="active" class="nav-link">Dealers</a>
            <a routerLink="/vehicles" routerLinkActive="active" class="nav-link">Vehicles</a>
            <a routerLink="/admin" routerLinkActive="active" class="nav-link" *ngIf="tenantService.isGlobalAdmin()">Admin</a>
          </nav>

          <div class="tenant-section">
            <div class="tenant-info" *ngIf="tenantService.hasTenantContext()">
              <span class="tenant-label">Tenant:</span>
              <span class="tenant-id">{{ tenantService.getTenantId() }}</span>
              <span class="badge" [ngClass]="tenantService.isGlobalAdmin() ? 'badge-premium' : 'badge-basic'">
                {{ tenantService.isGlobalAdmin() ? 'GLOBAL_ADMIN' : 'STANDARD' }}
              </span>
            </div>
            <button class="btn btn-outline btn-sm" (click)="showSettings = !showSettings">
              {{ showSettings ? 'Hide' : 'Settings' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Tenant Settings Panel -->
      <div class="settings-panel" *ngIf="showSettings">
        <div class="container">
          <!-- Tenant Registration Form (shown when no tenant is set) -->
          <div class="settings-content" *ngIf="!tenantService.hasTenantContext()">
            <h3>Register Tenant</h3>
            <p class="text-secondary">Create a new tenant to get started.</p>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Organization Name</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="newTenant.name"
                  placeholder="Enter organization name"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  [(ngModel)]="newTenant.email"
                  placeholder="Enter email address"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Phone (Optional)</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="newTenant.phone"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Subscription Type</label>
                <select class="form-control" [(ngModel)]="newTenant.subscriptionType">
                  <option [ngValue]="SubscriptionType.BASIC">Basic</option>
                  <option [ngValue]="SubscriptionType.PREMIUM">Premium</option>
                </select>
              </div>
            </div>

            <div class="button-row">
              <button
                class="btn btn-primary"
                (click)="registerTenant()"
                [disabled]="!newTenant.name || !newTenant.email || registering"
              >
                {{ registering ? 'Registering...' : 'Register Tenant' }}
              </button>
            </div>

            <div class="alert alert-danger" *ngIf="registrationError">
              {{ registrationError }}
            </div>

            <div class="alert alert-success" *ngIf="registrationSuccess">
              Tenant registered! UUID: {{ registrationSuccess }}
            </div>

            <hr />

            <h4>Or Enter Existing Tenant ID</h4>
            <p class="text-secondary">If you already have a tenant UUID, enter it below.</p>
          </div>

          <!-- Connection Settings (shown when tenant is already set) -->
          <div class="settings-content">
            <h3>Connection Settings</h3>
            <p class="text-secondary">Configure your tenant context for API requests.</p>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tenant ID (UUID)</label>
                <input
                  type="text"
                  class="form-control"
                  [value]="tenantService.getTenantId() || ''"
                  (input)="updateTenantId($event)"
                  placeholder="Enter tenant UUID"
                />
              </div>

              <div class="form-group">
                <label class="form-label">User ID</label>
                <input
                  type="text"
                  class="form-control"
                  [value]="tenantService.getUserId() || ''"
                  (input)="updateUserId($event)"
                  placeholder="Enter user ID"
                />
              </div>

              <div class="form-group">
                <label class="form-label">User Role</label>
                <select
                  class="form-control"
                  [value]="tenantService.getUserRole() || 'STANDARD'"
                  (change)="updateUserRole($event)"
                >
                  <option value="STANDARD">Standard User</option>
                  <option value="GLOBAL_ADMIN">Global Admin</option>
                </select>
              </div>
            </div>

            <div class="alert alert-warning" *ngIf="tenantService.isGlobalAdmin()">
              <strong>Admin Mode:</strong> You have global access to all tenant data. Use with caution.
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 Inventory Management Module - Modular Monolith Architecture</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
    }

    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }

    .subtitle {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .nav {
      display: flex;
      gap: 0.5rem;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .nav-link:hover {
      color: var(--text-primary);
      background-color: var(--background-color);
    }

    .nav-link.active {
      color: var(--primary-color);
      background-color: #eff6ff;
    }

    .tenant-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .tenant-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .tenant-label {
      color: var(--text-secondary);
    }

    .tenant-id {
      font-family: monospace;
      background: var(--background-color);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }

    .settings-panel {
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
      padding: 1.5rem 0;
    }

    .settings-content {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .settings-content h3 {
      margin-bottom: 0.5rem;
    }

    .settings-content p {
      margin-bottom: 1rem;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .footer {
      background: white;
      border-top: 1px solid var(--border-color);
      padding: 1.5rem 0;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class AppComponent {
  // Expose enums to template
  SubscriptionType = SubscriptionType;
  UserRole = UserRole;

  showSettings = false;

  // New tenant registration
  newTenant = {
    name: '',
    email: '',
    phone: '',
    subscriptionType: 'BASIC'
  };
  registering = false;
  registrationError = '';
  registrationSuccess = '';

  constructor(
    public tenantService: TenantService,
    private apiService: ApiService
  ) {}

  registerTenant(): void {
    this.registering = true;
    this.registrationError = '';
    this.registrationSuccess = '';

    this.tenantService.registerTenant({
      name: this.newTenant.name,
      email: this.newTenant.email,
      phone: this.newTenant.phone || undefined,
      subscriptionType: this.newTenant.subscriptionType as any
    }).subscribe({
      next: (tenant) => {
        this.registrationSuccess = tenant.uuid;
        this.registering = false;
        // Clear form
        this.newTenant = {
          name: '',
          email: '',
          phone: '',
          subscriptionType: 'BASIC'
        };
      },
      error: (err) => {
        this.registrationError = err.error?.message || 'Registration failed';
        this.registering = false;
      }
    });
  }

  updateTenantId(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.tenantService.setTenantId(value);
    }
  }

  updateUserId(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.tenantService.setUserId(value);
    }
  }

  updateUserRole(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.tenantService.setUserRole(value);
  }
}