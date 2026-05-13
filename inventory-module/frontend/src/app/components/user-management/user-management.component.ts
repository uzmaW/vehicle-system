import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TenantService } from '../../services/tenant.service';
import { UserRole, UserResponse, PagedUsersResponse, UserCreateRequest } from '../../models/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SlicePipe, RouterLink, RouterLinkActive],
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
          <a routerLink="/vehicles" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Vehicles</span>
          </a>
          <a routerLink="/users" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
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
        <div class="user-management">
      <div class="header-row">
        <h2>User Management</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Cancel' : '+ Add User' }}
        </button>
      </div>

      <!-- Create User Form -->
      <div class="form-panel" *ngIf="showCreateForm">
        <h3>Create New User</h3>
        <form (ngSubmit)="createUser()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" [(ngModel)]="newUser.name" name="name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="newUser.email" name="email" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" [(ngModel)]="newUser.password" name="password" required />
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select class="form-control" [(ngModel)]="newUser.role" name="role">
                <option [value]="UserRole.STANDARD">Standard User</option>
                <option [value]="UserRole.TENANT_ADMIN">Tenant Admin</option>
              </select>
            </div>
          </div>
          <div class="button-row">
            <button type="submit" class="btn btn-primary" [disabled]="creating">
              {{ creating ? 'Creating...' : 'Create User' }}
            </button>
          </div>
          <div class="alert alert-error" *ngIf="error">{{ error }}</div>
          <div class="alert alert-success" *ngIf="success">{{ success }}</div>
        </form>
      </div>

      <!-- User List -->
      <div class="user-list">
        <h3>Users ({{ totalElements }})</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" [ngClass]="user.role === 'GLOBAL_ADMIN' ? 'badge-premium' : 'badge-basic'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="status" [class.active]="user.active" [class.inactive]="!user.active">
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>{{ user.createdAt | date:'short' }}</td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="5" class="empty-state">No users found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="btn btn-sm" [disabled]="page === 0" (click)="loadUsers(page - 1)">
            Previous
          </button>
          <span>Page {{ page + 1 }} of {{ totalPages }}</span>
          <button class="btn btn-sm" [disabled]="page >= totalPages - 1" (click)="loadUsers(page + 1)">
            Next
          </button>
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
    .user-management {
      padding: 1rem 0;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header-row h2 {
      margin: 0;
    }
    .form-panel {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .form-panel h3 {
      margin-bottom: 1rem;
    }
    .user-list {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    .user-list h3 {
      margin-bottom: 1rem;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    .data-table th {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .empty-state {
      text-align: center;
      color: var(--text-secondary);
      padding: 2rem !important;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    .badge-premium {
      background: #d97706;
      color: white;
    }
    .badge-basic {
      background: #3b82f6;
      color: white;
    }
    .status.active {
      color: #22c55e;
    }
    .status.inactive {
      color: #ef4444;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  UserRole = UserRole;

  users: UserResponse[] = [];
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  showCreateForm = false;
  creating = false;
  error = '';
  success = '';

  newUser: UserCreateRequest = {
    name: '',
    email: '',
    password: '',
    role: UserRole.STANDARD
  };

  constructor(
    private apiService: ApiService,
    public tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.loadUsers(0);
  }

  loadUsers(page: number): void {
    this.page = page;
    const tenantId = this.tenantService.getTenantId();
    if (!tenantId) return;

    this.apiService.listTenantUsers(tenantId, page, this.size).subscribe({
      next: (response: PagedUsersResponse) => {
        this.users = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load users';
      }
    });
  }

  createUser(): void {
    this.error = '';
    this.success = '';
    this.creating = true;

    const tenantId = this.tenantService.getTenantId();
    if (!tenantId) {
      this.error = 'No tenant context';
      this.creating = false;
      return;
    }

    this.apiService.createTenantUser(tenantId, this.newUser).subscribe({
      next: (user) => {
        this.success = `User ${user.name} created successfully`;
        this.creating = false;
        this.showCreateForm = false;
        this.newUser = { name: '', email: '', password: '', role: UserRole.STANDARD };
        this.loadUsers(0);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create user';
        this.creating = false;
      }
    });
  }
}