import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../services/tenant.service';

/**
 * Home component - handles initial routing based on tenant context.
 * If tenant context exists, redirects to dealers.
 * Otherwise, stays at '/' and AppComponent will show settings panel.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  template: `<div class="container" style="padding: 2rem; text-align: center;">
    <div class="spinner"></div>
    <p style="margin-top: 1rem;">Loading...</p>
  </div>`
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    if (this.tenantService.hasTenantContext()) {
      this.router.navigate(['/dealers']);
    }
    // If no tenant context, stay here - AppComponent shows settings panel
  }
}
