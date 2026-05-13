import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantService } from '../../services/tenant.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <div class="setup-header">
          <h1>Inventory Module</h1>
          <p>Multi-Tenant Management System</p>
        </div>

        <div class="setup-content">
          <!-- Login Section -->
          <div class="login-section" *ngIf="!tenantService.hasTenantContext()">
            <h3>Login</h3>
            <p class="text-secondary">Sign in with your email and password.</p>
            
            <form (ngSubmit)="login()">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  [(ngModel)]="loginForm.email"
                  name="email"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  [(ngModel)]="loginForm.password"
                  name="password"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div class="button-row">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="!loginForm.email || !loginForm.password || loggingIn"
                >
                  {{ loggingIn ? 'Signing in...' : 'Sign In' }}
                </button>
              </div>

              <div class="alert alert-error" *ngIf="loginError">
                {{ loginError }}
              </div>
            </form>

            <div class="divider">
              <span>OR</span>
            </div>
          </div>

          <!-- Quick Setup Section -->
          <div class="setup-section" *ngIf="!tenantService.hasTenantContext()">
            <h3>Quick Setup</h3>
            <p class="text-secondary">Enter tenant credentials to access the system.</p>
            
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
              <label class="form-label">Role</label>
              <select class="form-control" [value]="tenantService.getUserRole() || 'STANDARD'" (change)="updateUserRole($event)">
                <option value="STANDARD">Standard User</option>
                <option value="TENANT_ADMIN">Tenant Admin</option>
                <option value="GLOBAL_ADMIN">Global Admin</option>
              </select>
            </div>

            <div class="button-row">
              <button class="btn btn-primary" (click)="saveAndContinue()">
                Continue
              </button>
            </div>

            <div class="alert alert-error" *ngIf="setupError">
              {{ setupError }}
            </div>
          </div>

          <!-- Connected State -->
          <div *ngIf="tenantService.hasTenantContext()" class="setup-section">
            <div class="success-message">
              <h3>Connected</h3>
              <p><strong>Tenant:</strong> {{ tenantService.getTenantId() }}</p>
              <p><strong>Role:</strong> {{ tenantService.getUserRole() }}</p>
            </div>
            
            <div class="button-row">
              <button class="btn btn-primary" (click)="goToDealers()">
                Go to Dashboard
              </button>
              <button class="btn btn-outline" (click)="clearAndRestart()">
                Switch Tenant
              </button>
            </div>
          </div>
        </div>

        <div class="setup-footer">
          <p class="text-secondary">API: http://localhost:8080</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }

    .setup-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 450px;
      overflow: hidden;
    }

    .setup-header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .setup-header h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
    }

    .setup-header p {
      margin: 0;
      opacity: 0.9;
    }

    .setup-content {
      padding: 2rem;
    }

    .login-section {
      margin-bottom: 1.5rem;
    }

    .login-section h3, .setup-section h3 {
      margin: 0 0 0.5rem;
    }

    .divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      border-top: 1px solid var(--border-color);
    }

    .divider span {
      background: white;
      padding: 0 1rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
      position: relative;
    }

    .success-message {
      text-align: center;
      padding: 1.5rem;
      background: var(--background-color);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
    }

    .success-message h3 {
      color: var(--success-color);
    }

    .success-message p {
      margin: 0.25rem 0;
      font-size: 0.875rem;
    }

    .setup-footer {
      padding: 1rem 2rem;
      background: var(--background-color);
      text-align: center;
      border-top: 1px solid var(--border-color);
    }

    .setup-footer p {
      margin: 0;
      font-size: 0.75rem;
    }

    .button-row {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .button-row .btn {
      flex: 1;
    }

    .alert {
      margin-top: 1rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  loginForm = {
    email: '',
    password: ''
  };
  loggingIn = false;
  loginError = '';
  setupError = '';

  constructor(
    private router: Router,
    public tenantService: TenantService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Auto-redirect if already has tenant context
    if (this.tenantService.hasTenantContext()) {
      this.goToDealers();
    }
  }

  login(): void {
    this.loggingIn = true;
    this.loginError = '';

    this.apiService.login({ email: this.loginForm.email, password: this.loginForm.password }).subscribe({
      next: (response) => {
        this.tenantService.setUserFromLogin(response);
        this.loggingIn = false;
        this.loginForm = { email: '', password: '' };
        this.goToDealers();
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Login failed';
        this.loggingIn = false;
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

  saveAndContinue(): void {
    const tenantId = this.tenantService.getTenantId();
    const userId = this.tenantService.getUserId();
    const userRole = this.tenantService.getUserRole();

    if (!tenantId || !userId || !userRole) {
      this.setupError = 'Please fill in all fields';
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      this.setupError = 'Tenant ID must be a valid UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)';
      return;
    }

    if (!uuidRegex.test(userId)) {
      this.setupError = 'User ID must be a valid UUID';
      return;
    }

    this.setupError = '';
    this.goToDealers();
  }

  goToDealers(): void {
    // Redirect to appropriate dashboard based on role
    if (this.tenantService.isGlobalAdmin()) {
      this.router.navigate(['/admin']);
    } else if (this.tenantService.isTenantAdmin()) {
      this.router.navigate(['/tenant-admin']);
    } else {
      this.router.navigate(['/dealers']);
    }
  }

  clearAndRestart(): void {
    this.tenantService.clearContext();
  }
}