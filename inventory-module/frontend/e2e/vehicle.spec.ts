import { test, expect } from '@playwright/test';
import {
  TEST_TENANT_ID,
  setTenantContext,
  createDealerViaAPI,
  createVehicleViaAPI,
  cleanupTenantData,
} from './helpers/test-setup';

test.describe('Vehicle Inventory', () => {
  let dealerId: string;

  test.beforeEach(async ({ page }) => {
    await cleanupTenantData(TEST_TENANT_ID);
    // Seed a dealer for vehicle tests
    const dealer = await createDealerViaAPI(TEST_TENANT_ID, 'Vehicle Test Dealer', 'vtd@test.com', 'PREMIUM');
    dealerId = dealer.id;
    
    await page.goto('/vehicles');
    await setTenantContext(page, TEST_TENANT_ID);
  });

  test.afterEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
  });

  // ==================== Page Load ====================

  test('should display Vehicle Inventory heading', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Vehicle Inventory');
  });

  test('should show filter controls', async ({ page }) => {
    await expect(page.locator('input[placeholder="Search by model..."]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Apply Filters' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Clear' })).toBeVisible();
  });

  test('should show empty state when no vehicles exist', async ({ page }) => {
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('td', { hasText: 'No vehicles found' })).toBeVisible();
  });

  // ==================== Create Vehicle ====================

  test('should create a vehicle successfully', async ({ page }) => {
    await page.reload();
    await page.waitForTimeout(500);

    await page.locator('button', { hasText: '+ Add Vehicle' }).click();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await expect(page.locator('.modal-title')).toHaveText('Add New Vehicle');

    // Fill form
    await page.locator('select[name="dealerId"]').selectOption({ index: 1 }); // First real dealer
    await page.locator('input[name="model"]').fill('Tesla Model 3');
    await page.locator('input[name="price"]').fill('42000');

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.locator('.modal').waitFor({ state: 'hidden' });

    // Verify in table
    await expect(page.locator('td', { hasText: 'Tesla Model 3' })).toBeVisible();
    await expect(page.locator('td', { hasText: '$42,000.00' })).toBeVisible();
    await expect(page.locator('.badge-available')).toBeVisible();
  });

  // ==================== Edit Vehicle ====================

  test('should edit a vehicle', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'BMW X5', 65000);
    await page.reload();
    await page.waitForTimeout(1000);

    await page.locator('button', { hasText: 'Edit' }).first().click();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await expect(page.locator('.modal-title')).toHaveText('Edit Vehicle');

    // Update model
    const modelInput = page.locator('input[name="model"]');
    await modelInput.clear();
    await modelInput.fill('BMW X7');

    await page.locator('button[type="submit"]').click();
    await page.locator('.modal').waitFor({ state: 'hidden' });

    await expect(page.locator('td', { hasText: 'BMW X7' })).toBeVisible();
  });

  // ==================== Mark as Sold ====================

  test('should mark a vehicle as sold', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Sold Car', 30000);
    await page.reload();
    await page.waitForTimeout(1000);

    // Available badge should be visible
    await expect(page.locator('.badge-available')).toBeVisible();

    // Click "Mark Sold"
    await page.locator('button', { hasText: 'Mark Sold' }).click();
    await page.waitForTimeout(1000);

    // Now should show SOLD badge
    await expect(page.locator('.badge-sold')).toBeVisible();
    // Mark Sold button should disappear
    await expect(page.locator('button', { hasText: 'Mark Sold' })).not.toBeVisible();
  });

  // ==================== Delete Vehicle ====================

  test('should delete a vehicle with confirmation', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Delete Me', 15000);
    await page.reload();
    await page.waitForTimeout(1000);

    await expect(page.locator('td', { hasText: 'Delete Me' })).toBeVisible();

    await page.locator('button', { hasText: 'Delete' }).first().click();
    const modal = page.locator('.modal', { hasText: 'Confirm Delete' });
    await expect(modal).toBeVisible();

    await modal.locator('button', { hasText: 'Delete' }).click();
    await modal.waitFor({ state: 'hidden' });

    await expect(page.locator('td', { hasText: 'Delete Me' })).not.toBeVisible();
  });

  // ==================== Filters ====================

  test('should filter vehicles by model name', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Toyota Camry', 28000);
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Honda Civic', 24000);
    await page.reload();
    await page.waitForTimeout(1000);

    // Type in model filter
    await page.locator('input[placeholder="Search by model..."]').fill('Toyota');
    await page.locator('button', { hasText: 'Apply Filters' }).click();
    await page.waitForTimeout(1000);

    // Toyota should be visible, Honda should not
    await expect(page.locator('td', { hasText: 'Toyota Camry' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Honda Civic' })).not.toBeVisible();
  });

  test('should filter vehicles by status', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Available Car', 20000, 'AVAILABLE');
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Sold Car', 18000, 'SOLD');
    await page.reload();
    await page.waitForTimeout(1000);

    // Filter by SOLD status
    const statusSelect = page.locator('.filters-grid select').first();
    await statusSelect.selectOption({ label: 'Sold' });
    await page.locator('button', { hasText: 'Apply Filters' }).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('td', { hasText: 'Sold Car' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Available Car' })).not.toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Car A', 20000);
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Car B', 30000);
    await page.reload();
    await page.waitForTimeout(1000);

    // Apply a model filter
    await page.locator('input[placeholder="Search by model..."]').fill('Car A');
    await page.locator('button', { hasText: 'Apply Filters' }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('td', { hasText: 'Car B' })).not.toBeVisible();

    // Clear filters
    await page.locator('button', { hasText: 'Clear' }).click();
    await page.waitForTimeout(1000);

    // Both should be visible again
    await expect(page.locator('td', { hasText: 'Car A' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Car B' })).toBeVisible();
  });

  test('should filter by price range', async ({ page }) => {
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Cheap Car', 15000);
    await createVehicleViaAPI(TEST_TENANT_ID, dealerId, 'Expensive Car', 80000);
    await page.reload();
    await page.waitForTimeout(1000);

    // Set price range 10000-30000
    const priceInputs = page.locator('.price-range input');
    await priceInputs.first().fill('10000');
    await priceInputs.last().fill('30000');
    await page.locator('button', { hasText: 'Apply Filters' }).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('td', { hasText: 'Cheap Car' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Expensive Car' })).not.toBeVisible();
  });
});
