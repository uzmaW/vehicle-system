import { Routes } from '@angular/router';
import { tenantGuard, adminGuard } from './guards/tenant.guard';
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
    canActivate: [adminGuard]
  }
];