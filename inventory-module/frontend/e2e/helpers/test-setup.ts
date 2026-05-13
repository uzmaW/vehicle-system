import { Page } from '@playwright/test';

/**
 * Test constants used across all E2E tests.
 */
export const TEST_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_TENANT_ID_2 = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_USER_ID = 'test-user-001';
export const BACKEND_URL = 'http://localhost:8080';

/**
 * Sets the tenant context in the Angular app via the Settings panel.
 */
export async function setTenantContext(
  page: Page,
  tenantId: string,
  role: 'STANDARD' | 'GLOBAL_ADMIN' | 'TENANT_ADMIN' = 'STANDARD',
  userId: string = TEST_USER_ID
): Promise<void> {
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Open settings panel - try both button and auto-show
  const settingsBtn = page.locator('button', { hasText: 'Settings' });
  const settingsPanel = page.locator('.settings-panel');
  const hideBtn = page.locator('button', { hasText: 'Hide' });

  // Check if settings panel is already visible (auto-show on no tenant)
  if (await settingsPanel.isVisible()) {
    // Settings already open - good
  } else if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await settingsPanel.waitFor({ state: 'visible', timeout: 5000 });
  } else if (await hideBtn.isVisible()) {
    // Already open but shows Hide
  } else {
    // Try waiting a bit and check again
    await page.waitForTimeout(1000);
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await settingsPanel.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  // Now fill the form
  const tenantInput = page.locator('input[placeholder="Enter tenant UUID"]');
  await tenantInput.fill(tenantId);

  const userIdInput = page.locator('input[placeholder="Enter user ID"]');
  await userIdInput.fill(userId);

  // Select role - find the role dropdown
  const roleSelect = page.locator('select');
  await roleSelect.selectOption(role);

  // Close settings if open
  const closeBtn = page.locator('button', { hasText: 'Hide' });
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await settingsPanel.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

/**
 * Creates a dealer directly via the backend API (bypassing the UI).
 * Used for test data setup.
 */
export async function createDealerViaAPI(
  tenantId: string,
  name: string,
  email: string,
  subscriptionType: 'BASIC' | 'PREMIUM' = 'BASIC'
): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/dealers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
      'X-User-Id': TEST_USER_ID,
      'X-User-Role': 'STANDARD',
    },
    body: JSON.stringify({ name, email, subscriptionType }),
  });
  return response.json();
}

/**
 * Creates a vehicle directly via the backend API.
 */
export async function createVehicleViaAPI(
  tenantId: string,
  dealerId: string,
  model: string,
  price: number,
  status: 'AVAILABLE' | 'SOLD' = 'AVAILABLE'
): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
      'X-User-Id': TEST_USER_ID,
      'X-User-Role': 'STANDARD',
    },
    body: JSON.stringify({ dealerId, model, price, status }),
  });
  return response.json();
}

/**
 * Deletes all dealers for a tenant via API (cleanup).
 */
export async function cleanupTenantData(tenantId: string): Promise<void> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/dealers?page=0&size=100&sortBy=createdAt&sortDirection=DESC`,
      {
        headers: {
          'X-Tenant-Id': tenantId,
          'X-User-Id': TEST_USER_ID,
          'X-User-Role': 'STANDARD',
        },
      }
    );
    const data = await response.json();
    for (const dealer of data.content || []) {
      await fetch(`${BACKEND_URL}/dealers/${dealer.id}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-Id': tenantId,
          'X-User-Id': TEST_USER_ID,
          'X-User-Role': 'STANDARD',
        },
      });
    }
  } catch {
    // Ignore cleanup errors — backend may not be running
  }
}
