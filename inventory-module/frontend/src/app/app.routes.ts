import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dealers',
    pathMatch: 'full'
  },
  {
    path: 'dealers',
    loadComponent: () => import('./components/dealer-list/dealer-list.component').then(m => m.DealerListComponent)
  },
  {
    path: 'vehicles',
    loadComponent: () => import('./components/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  }
];