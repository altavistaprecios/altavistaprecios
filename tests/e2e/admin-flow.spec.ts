import { test, expect } from '@playwright/test'

test.describe('Admin User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('complete admin workflow', async ({ page }) => {
    // 1. Login as admin
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin-password')
    await page.click('button[type="submit"]')

    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin')
    await expect(page.locator('h1')).toContainText('Admin Dashboard')

    // 2. Navigate to products management
    await page.click('nav >> text=Products')
    await page.waitForURL('/admin/products')

    // 3. Add a new product
    await page.click('button:has-text("Add Product")')
    await page.fill('input[name="name"]', 'Test Progressive Lens')
    await page.fill('input[name="code"]', 'TPL-E2E-001')
    await page.fill('input[name="base_price_usd"]', '299.99')
    await page.selectOption('select[name="category_id"]', { label: 'Progressive Lenses' })

    // Add specifications
    await page.fill('input[name="spherical_range"]', '-8.00 to +8.00')
    await page.fill('input[name="cylindrical_range"]', '-4.00 to +4.00')
    await page.fill('input[name="delivery_time"]', '5-7 business days')

    await page.click('button:has-text("Save Product")')

    // Verify product was created
    await expect(page.locator('text=Product created successfully')).toBeVisible()
    await expect(page.locator('text=Test Progressive Lens')).toBeVisible()

    // 4. Edit the product
    await page.click('button[aria-label="Edit Test Progressive Lens"]')
    await page.fill('input[name="base_price_usd"]', '279.99')
    await page.click('button:has-text("Update Product")')

    // Verify price update
    await expect(page.locator('text=Product updated successfully')).toBeVisible()
    await expect(page.locator('text=$279.99')).toBeVisible()

    // 5. Navigate to clients management
    await page.click('nav >> text=Clients')
    await page.waitForURL('/admin/clients')

    // 6. Invite a new client
    await page.click('button:has-text("Invite Client")')
    await page.fill('input[name="email"]', 'newclient@example.com')
    await page.fill('input[name="companyName"]', 'Test Optical Store')
    await page.click('button:has-text("Send Invitation")')

    // Verify invitation sent
    await expect(page.locator('text=Invitation sent successfully')).toBeVisible()
    await expect(page.locator('text=Test Optical Store')).toBeVisible()

    // 7. View price history
    await page.click('nav >> text=Price History')
    await page.waitForURL('/admin/history')

    // Verify price change is logged
    await expect(page.locator('text=Test Progressive Lens')).toBeVisible()
    await expect(page.locator('text=$299.99 → $279.99')).toBeVisible()

    // 8. Logout
    await page.click('button[aria-label="User menu"]')
    await page.click('text=Sign Out')
    await page.waitForURL('/login')
  })

  test('manage product categories', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin-password')
    await page.click('button[type="submit"]')

    // Navigate to products
    await page.goto('/admin/products')

    // Open categories management
    await page.click('button:has-text("Manage Categories")')

    // Add new category
    await page.fill('input[name="name"]', 'Specialty Lenses')
    await page.fill('input[name="slug"]', 'specialty-lenses')
    await page.fill('textarea[name="description"]', 'Special purpose optical lenses')
    await page.click('button:has-text("Add Category")')

    // Verify category created
    await expect(page.locator('text=Specialty Lenses')).toBeVisible()

    // Edit category
    await page.click('button[aria-label="Edit Specialty Lenses"]')
    await page.fill('input[name="display_order"]', '5')
    await page.click('button:has-text("Update")')

    // Verify update
    await expect(page.locator('text=Category updated')).toBeVisible()
  })

  test('bulk product operations', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin-password')
    await page.click('button[type="submit"]')

    // Navigate to products
    await page.goto('/admin/products')

    // Select multiple products
    await page.check('input[data-product-id="1"]')
    await page.check('input[data-product-id="2"]')
    await page.check('input[data-product-id="3"]')

    // Open bulk actions
    await page.click('button:has-text("Bulk Actions")')

    // Apply 10% price increase
    await page.click('text=Adjust Prices')
    await page.fill('input[name="percentage"]', '10')
    await page.click('button:has-text("Apply Increase")')

    // Verify bulk update
    await expect(page.locator('text=3 products updated')).toBeVisible()
  })

  test('responsive mobile layout', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    // Login on mobile
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin-password')
    await page.click('button[type="submit"]')

    // Check mobile navigation
    await page.click('button[aria-label="Menu"]')
    await expect(page.locator('nav[role="navigation"]')).toBeVisible()

    // Navigate to products on mobile
    await page.click('nav >> text=Products')

    // Verify responsive table
    await expect(page.locator('[data-mobile-card]')).toBeVisible()

    // Check horizontal scroll for detailed view
    await page.click('button:has-text("Table View")')
    const table = page.locator('table')
    await expect(table).toHaveCSS('overflow-x', 'auto')
  })
})