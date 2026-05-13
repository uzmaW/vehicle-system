import { Routes } from '@angular/router';
import { tenantGuard, globalAdminGuard, tenantAdminGuard } from './guards/tenant.guard';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dealers',
    loadComponent: () => import('./components/dealer-list/dealer-list.component').then(m => m.DealerListComponent),
    canActivate: [tenantGuard]
  },
  {
    path: 'vehicles',
    loadComponent: () => import('./components/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent),
    canActivate: [tenantGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [globalAdminGuard]
  },
  {
    path: 'tenant-admin',
    loadComponent: () => import('./components/tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent),
    canActivate: [tenantAdminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [tenantGuard]
  }
];