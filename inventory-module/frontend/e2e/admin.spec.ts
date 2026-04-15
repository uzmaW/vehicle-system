import { test, expect } from '@playwright/test';
import {
  TEST_TENANT_ID,
  TEST_TENANT_ID_2,
  setTenantContext,
  createDealerViaAPI,
  cleanupTenantData,
} from './helpers/test-setup';

test.describe('Admin Dashboard', () => {

  test.beforeEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  test.afterEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  // ==================== Access Control ====================

  test('should show access warning for non-admin users', async ({ page }) => {
    await page.goto('/admin');
    await setTenantContext(page, TEST_TENANT_ID, 'STANDARD');

    await expect(page.locator('.alert-warning')).toBeVisible();
    await expect(page.locator('.alert-warning')).toContainText('Access Restricted');
  });

  test('should not show stats cards for non-admin users', async ({ page }) => {
    await page.goto('/admin');
    await setTenantContext(page, TEST_TENANT_ID, 'STANDARD');

    await expect(page.locator('.stats-grid')).not.toBeVisible();
  });

  // ==================== Admin View ====================

  test('should display stats for GLOBAL_ADMIN users', async ({ page }) => {
    // Seed data across tenants
    await createDealerViaAPI(TEST_TENANT_ID, 'Basic Dealer 1', 'd1@test.com', 'BASIC');
    await createDealerViaAPI(TEST_TENANT_ID, 'Premium Dealer 1', 'd2@test.com', 'PREMIUM');
    await createDealerViaAPI(TEST_TENANT_ID_2, 'Basic Dealer 2', 'd3@test.com', 'BASIC');

    await page.goto('/admin');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.waitForTimeout(1500);

    // Stats cards should be visible
    await expect(page.locator('.stats-grid')).toBeVisible();

    // Should show at least the stat cards
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(3); // Basic, Premium, Total
  });

  test('should show subscription distribution bar for admin', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'Basic', 'b@test.com', 'BASIC');
    await createDealerViaAPI(TEST_TENANT_ID, 'Premium', 'p@test.com', 'PREMIUM');

    await page.goto('/admin');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.waitForTimeout(1500);

    // Distribution bar and legend should be visible
    await expect(page.locator('.distribution-bar')).toBeVisible();
    await expect(page.locator('.distribution-legend')).toBeVisible();
  });

  test('should refresh stats when clicking Refresh button', async ({ page }) => {
    await page.goto('/admin');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.waitForTimeout(1500);

    const refreshBtn = page.locator('button', { hasText: 'Refresh' });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForTimeout(1000);

    // Page should still show stats after refresh
    await expect(page.locator('.stats-grid')).toBeVisible();
  });

  // ==================== Admin Info Section ====================

  test('should show admin info with endpoint details', async ({ page }) => {
    await page.goto('/admin');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.waitForTimeout(1000);

    await expect(page.locator('code', { hasText: 'GET /admin/dealers/countBySubscription' })).toBeVisible();
    await expect(page.locator('code', { hasText: 'GLOBAL_ADMIN' })).toBeVisible();
  });
});
