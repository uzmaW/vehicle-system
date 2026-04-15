import { test, expect } from '@playwright/test';
import {
  TEST_TENANT_ID,
  TEST_TENANT_ID_2,
  setTenantContext,
  createDealerViaAPI,
  cleanupTenantData,
} from './helpers/test-setup';

test.describe('Multi-Tenancy & Navigation', () => {

  test.beforeEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  test.afterEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
    await cleanupTenantData(TEST_TENANT_ID_2);
  });

  // ==================== Tenant Isolation ====================

  test('should only show dealers for the current tenant', async ({ page }) => {
    // Seed dealers in two different tenants
    await createDealerViaAPI(TEST_TENANT_ID, 'Tenant 1 Dealer', 't1@test.com');
    await createDealerViaAPI(TEST_TENANT_ID_2, 'Tenant 2 Dealer', 't2@test.com');

    // Set context to tenant 1
    await page.goto('/dealers');
    await setTenantContext(page, TEST_TENANT_ID);
    await page.reload();
    await page.waitForTimeout(1000);

    // Should see tenant 1 data only
    await expect(page.locator('td', { hasText: 'Tenant 1 Dealer' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Tenant 2 Dealer' })).not.toBeVisible();
  });

  test('should switch tenant and see different data', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'Alpha Corp', 'alpha@test.com');
    await createDealerViaAPI(TEST_TENANT_ID_2, 'Beta Corp', 'beta@test.com');

    // View tenant 1
    await page.goto('/dealers');
    await setTenantContext(page, TEST_TENANT_ID);
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('td', { hasText: 'Alpha Corp' })).toBeVisible();

    // Switch to tenant 2
    await setTenantContext(page, TEST_TENANT_ID_2);
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('td', { hasText: 'Beta Corp' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Alpha Corp' })).not.toBeVisible();
  });

  // ==================== Settings Panel ====================

  test('should toggle settings panel', async ({ page }) => {
    await page.goto('/dealers');

    // Settings should be hidden initially
    await expect(page.locator('.settings-panel')).not.toBeVisible();

    // Open
    await page.locator('button', { hasText: 'Settings' }).click();
    await expect(page.locator('.settings-panel')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Connection Settings' })).toBeVisible();

    // Close
    await page.locator('button', { hasText: 'Hide' }).click();
    await expect(page.locator('.settings-panel')).not.toBeVisible();
  });

  test('should display tenant ID in header after setting it', async ({ page }) => {
    await page.goto('/dealers');
    await setTenantContext(page, TEST_TENANT_ID);

    // Tenant ID should appear in the header
    await expect(page.locator('.tenant-id')).toContainText(TEST_TENANT_ID);
  });

  test('should show admin warning when GLOBAL_ADMIN role is selected', async ({ page }) => {
    await page.goto('/dealers');

    // Open settings and select GLOBAL_ADMIN (second select is the role dropdown)
    await page.locator('button', { hasText: 'Settings' }).click();
    await page.locator('.settings-panel select').nth(1).selectOption('GLOBAL_ADMIN');

    // Admin warning should appear
    await expect(page.locator('.alert-warning', { hasText: 'Admin Mode' })).toBeVisible();
  });

  // ==================== Navigation ====================

  test('should navigate between Dealers and Vehicles pages', async ({ page }) => {
    await page.goto('/dealers');
    await setTenantContext(page, TEST_TENANT_ID);

    // Should be on Dealers page
    await expect(page.locator('h2')).toHaveText('Dealer Management');

    // Navigate to Vehicles
    await page.locator('a', { hasText: 'Vehicles' }).click();
    await expect(page.locator('h2')).toHaveText('Vehicle Inventory');

    // Navigate back to Dealers
    await page.locator('a', { hasText: 'Dealers' }).click();
    await expect(page.locator('h2')).toHaveText('Dealer Management');
  });

  test('should show Admin nav link only for GLOBAL_ADMIN', async ({ page }) => {
    await page.goto('/dealers');
    
    // Standard user — no Admin link
    await setTenantContext(page, TEST_TENANT_ID, 'STANDARD');
    await expect(page.locator('a.nav-link', { hasText: 'Admin' })).not.toBeVisible();

    // Switch to admin
    await setTenantContext(page, TEST_TENANT_ID, 'GLOBAL_ADMIN');
    await expect(page.locator('a.nav-link', { hasText: 'Admin' })).toBeVisible();
  });

  test('should redirect root to /dealers', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dealers/);
  });

  // ==================== Error Handling ====================

  test('should show error when no tenant is configured', async ({ page }) => {
    // Clear localStorage to remove tenant context
    await page.goto('/dealers');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(500);

    // Should show tenant error
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toContainText('Tenant ID');
  });

  // ==================== Tenant Registration ====================

  test('should register a new tenant successfully', async ({ page }) => {
    await page.goto('/');

    // Open settings panel to access registration form
    await page.locator('button', { hasText: 'Settings' }).click();
    await expect(page.locator('.settings-panel')).toBeVisible();

    // Fill registration form
    await page.locator('input[placeholder="Enter organization name"]').fill('Test Company');
    await page.locator('input[placeholder="Enter email address"]').fill('test@company.com');
    await page.locator('input[placeholder="Enter phone number"]').fill('+1234567890');

    // Select subscription type (Premium)
    await page.locator('.settings-panel select').selectOption({ label: 'Premium' });

    // Submit
    await page.locator('button', { hasText: 'Register Tenant' }).click();

    // Should show success with UUID
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toContainText('Tenant registered!');
    await expect(page.locator('.alert-success')).toContainText(/[0-9a-f-]{36}/);
  });

  test('should register tenant with BASIC subscription', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Settings' }).click();

    await page.locator('input[placeholder="Enter organization name"]').fill('Basic Corp');
    await page.locator('input[placeholder="Enter email address"]').fill('basic@corp.com');

    // Select Basic subscription
    await page.locator('.settings-panel select').selectOption({ label: 'Basic' });

    await page.locator('button', { hasText: 'Register Tenant' }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('should require name and email for registration', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Settings' }).click();

    // Button should be disabled when fields are empty
    const registerBtn = page.locator('button', { hasText: 'Register Tenant' });
    await expect(registerBtn).toBeDisabled();
  });
});
