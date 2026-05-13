import { test, expect } from '@playwright/test';
import {
  TEST_TENANT_ID,
  TEST_TENANT_ID_2,
  setTenantContext,
  createDealerViaAPI,
  cleanupTenantData,
} from './helpers/test-setup';

test.describe('Global Admin Dashboard', () => {

  test.beforeEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  test.afterEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  // ==================== Access Control ====================

  test('should redirect non-global-admin users from /admin', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'STANDARD');
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    
    // Should be redirected away from /admin - either to / or /dealers
    const url = page.url();
    expect(url).not.toContain('/admin');
  });

  // ==================== Global Admin View ====================

  test('should display stats for GLOBAL_ADMIN users', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'Basic Dealer 1', 'd1@test.com', 'BASIC');
    await createDealerViaAPI(TEST_TENANT_ID, 'Premium Dealer 1', 'd2@test.com', 'PREMIUM');
    await createDealerViaAPI(TEST_TENANT_ID_2, 'Basic Dealer 2', 'd3@test.com', 'BASIC');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Should see the platform overview
    await expect(page.locator('h2', { hasText: 'Platform Overview' })).toBeVisible();
  });

  test('should show subscription distribution for admin', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'Basic', 'b@test.com', 'BASIC');
    await createDealerViaAPI(TEST_TENANT_ID, 'Premium', 'p@test.com', 'PREMIUM');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Subscription distribution should be visible
    await expect(page.locator('.card-title', { hasText: 'Subscription Distribution' })).toBeVisible();
  });
});

test.describe('Tenant Admin Dashboard', () => {

  test.beforeEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  test.afterEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  // ==================== Access Control ====================

  test('should show tenant dashboard for TENANT_ADMIN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'TENANT_ADMIN');
    await page.goto('/tenant-admin');
    await page.waitForTimeout(2000);

    // Should see tenant dashboard
    await expect(page.locator('h2', { hasText: 'Tenant Dashboard' })).toBeVisible();
  });

  test('should show tenant dashboard for GLOBAL_ADMIN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await page.goto('/tenant-admin');
    await page.waitForTimeout(2000);

    // Global admin can also access tenant admin dashboard
    await expect(page.locator('h2', { hasText: 'Tenant Dashboard' })).toBeVisible();
  });

  test('should redirect STANDARD users from /tenant-admin', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'STANDARD');
    await page.goto('/tenant-admin');
    await page.waitForTimeout(1000);
    
    // Should be redirected away from /tenant-admin
    const url = page.url();
    expect(url).not.toContain('/tenant-admin');
  });

  // ==================== Tenant Admin View ====================

  test('should display tenant stats for TENANT_ADMIN', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'Test Dealer', 'dealer@test.com', 'BASIC');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'TENANT_ADMIN');
    await page.goto('/tenant-admin');
    await page.waitForTimeout(2000);

    // Stats grid should be visible
    await expect(page.locator('.stats-grid')).toBeVisible();
  });

  test('should show vehicle status chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setTenantContext(page, TEST_TENANT_ID, 'TENANT_ADMIN');
    await page.goto('/tenant-admin');
    await page.waitForTimeout(2000);

    // Vehicle status should be visible
    await expect(page.locator('.card-title', { hasText: 'Vehicle Status' })).toBeVisible();
  });
});
