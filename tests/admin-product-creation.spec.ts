import { test, expect } from '@playwright/test';

test.describe('Admin Product Creation', () => {
  test('should login as admin and create a product', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@altavista.com');
    await page.fill('input[type="password"]', 'Admin123!@#');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect to admin page
    await page.waitForURL('**/admin/**', { timeout: 10000 });

    // Navigate to product creation page
    await page.goto('http://localhost:3000/admin/monofocales-future-x');

    // Fill product form
    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('input[name="description"]', 'Test product description');
    await page.fill('input[name="code"]', 'TEST-001');
    await page.fill('input[name="retail_price_usd"]', '99.99');
    await page.fill('input[name="wholesale_price_usd"]', '49.99');
    await page.fill('input[name="stock_quantity"]', '100');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message or product list update
    await page.waitForResponse(response =>
      response.url().includes('/api/products') && response.status() === 201,
      { timeout: 10000 }
    );

    // Verify the product was added to the list
    await expect(page.locator('text=TEST-001')).toBeVisible({ timeout: 5000 });

    console.log('✅ Admin login and product creation successful');
  });
});