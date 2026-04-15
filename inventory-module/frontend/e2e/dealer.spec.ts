import { test, expect } from '@playwright/test';
import {
  TEST_TENANT_ID,
  setTenantContext,
  createDealerViaAPI,
  cleanupTenantData,
} from './helpers/test-setup';

test.describe('Dealer Management', () => {

  test.beforeEach(async ({ page }) => {
    await cleanupTenantData(TEST_TENANT_ID);
    await page.goto('/dealers');
    await setTenantContext(page, TEST_TENANT_ID);
  });

  test.afterEach(async () => {
    await cleanupTenantData(TEST_TENANT_ID);
  });

  // ==================== Page Load ====================

  test('should display Dealer Management heading', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Dealer Management');
  });

  test('should show empty state when no dealers exist', async ({ page }) => {
    // Reload to trigger fresh API call with tenant context set
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('td', { hasText: 'No dealers found' })).toBeVisible();
  });

  test('should show "Add Dealer" button', async ({ page }) => {
    await expect(page.locator('button', { hasText: '+ Add Dealer' })).toBeVisible();
  });

  // ==================== Create Dealer ====================

  test('should open create dealer modal', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Dealer' }).click();
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText('Add New Dealer');
  });

  test('should create a BASIC dealer successfully', async ({ page }) => {
    await page.reload();
    await page.waitForTimeout(500);
    
    // Open modal
    await page.locator('button', { hasText: '+ Add Dealer' }).click();
    await page.locator('.modal').waitFor({ state: 'visible' });

    // Fill form
    await page.locator('input[name="name"]').fill('Test Dealer Alpha');
    await page.locator('input[name="email"]').fill('alpha@test.com');
    await page.locator('select[name="subscriptionType"]').selectOption({ label: 'BASIC' });

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.locator('.modal').waitFor({ state: 'hidden' });

    // Verify in table
    await expect(page.locator('td', { hasText: 'Test Dealer Alpha' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'alpha@test.com' })).toBeVisible();
    await expect(page.locator('.badge-basic')).toBeVisible();
  });

  test('should create a PREMIUM dealer successfully', async ({ page }) => {
    await page.reload();
    await page.waitForTimeout(500);

    await page.locator('button', { hasText: '+ Add Dealer' }).click();
    await page.locator('.modal').waitFor({ state: 'visible' });

    await page.locator('input[name="name"]').fill('Premium Dealer');
    await page.locator('input[name="email"]').fill('premium@test.com');
    await page.locator('select[name="subscriptionType"]').selectOption({ label: 'PREMIUM' });

    await page.locator('button[type="submit"]').click();
    await page.locator('.modal').waitFor({ state: 'hidden' });

    await expect(page.locator('td', { hasText: 'Premium Dealer' })).toBeVisible();
    await expect(page.locator('.badge-premium')).toBeVisible();
  });

  test('should disable submit button when form is invalid', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Dealer' }).click();
    await page.locator('.modal').waitFor({ state: 'visible' });

    // Form is empty — submit should be disabled
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  // ==================== Edit Dealer ====================

  test('should edit a dealer', async ({ page }) => {
    // Seed data
    await createDealerViaAPI(TEST_TENANT_ID, 'Original Name', 'original@test.com', 'BASIC');
    await page.reload();
    await page.waitForTimeout(1000);

    // Click Edit
    await page.locator('button', { hasText: 'Edit' }).first().click();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await expect(page.locator('.modal-title')).toHaveText('Edit Dealer');

    // Modify name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Name');

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.locator('.modal').waitFor({ state: 'hidden' });

    // Verify updated in table
    await expect(page.locator('td', { hasText: 'Updated Name' })).toBeVisible();
  });

  // ==================== Delete Dealer ====================

  test('should delete a dealer with confirmation', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'To Be Deleted', 'delete@test.com');
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify dealer is visible
    await expect(page.locator('td', { hasText: 'To Be Deleted' })).toBeVisible();

    // Click Delete
    await page.locator('button', { hasText: 'Delete' }).first().click();

    // Confirm modal
    const confirmModal = page.locator('.modal', { hasText: 'Confirm Delete' });
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal.locator('strong')).toHaveText('To Be Deleted');

    // Confirm deletion
    await confirmModal.locator('button', { hasText: 'Delete' }).click();
    await confirmModal.waitFor({ state: 'hidden' });

    // Verify removed
    await expect(page.locator('td', { hasText: 'To Be Deleted' })).not.toBeVisible();
  });

  test('should cancel dealer deletion', async ({ page }) => {
    await createDealerViaAPI(TEST_TENANT_ID, 'Keep This', 'keep@test.com');
    await page.reload();
    await page.waitForTimeout(1000);

    // Click Delete then Cancel
    await page.locator('button', { hasText: 'Delete' }).first().click();
    await page.locator('.modal', { hasText: 'Confirm Delete' }).locator('button', { hasText: 'Cancel' }).click();

    // Dealer should still be visible
    await expect(page.locator('td', { hasText: 'Keep This' })).toBeVisible();
  });

  // ==================== Pagination ====================

  test('should show pagination when multiple dealers exist', async ({ page }) => {
    // Seed 12 dealers (page size is 10)
    for (let i = 1; i <= 12; i++) {
      await createDealerViaAPI(TEST_TENANT_ID, `Dealer ${i}`, `dealer${i}@test.com`);
    }
    await page.reload();
    await page.waitForTimeout(1500);

    // Pagination should show
    const pagination = page.locator('.pagination');
    await expect(pagination).toBeVisible();
    await expect(pagination.locator('.pagination-info')).toContainText('of 12 dealers');

    // Next should be enabled, Previous disabled
    await expect(page.locator('button', { hasText: 'Previous' })).toBeDisabled();
    await expect(page.locator('button', { hasText: 'Next' })).toBeEnabled();

    // Navigate to page 2
    await page.locator('button', { hasText: 'Next' }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('button', { hasText: 'Previous' })).toBeEnabled();
  });
});
