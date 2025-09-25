import { test, expect } from '@playwright/test'

test.describe('Client User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('complete client workflow', async ({ page }) => {
    // 1. Login as client
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'client-password')
    await page.click('button[type="submit"]')

    // Wait for redirect to client dashboard
    await page.waitForURL('/client')
    await expect(page.locator('h1')).toContainText('Welcome')

    // 2. Browse products catalog
    await page.click('nav >> text=Products')
    await page.waitForURL('/client/products')

    // Filter by category
    await page.selectOption('select[name="category"]', { label: 'Single Vision' })
    await expect(page.locator('[data-product-card]')).toHaveCount(5) // Assuming 5 single vision products

    // Search for specific product
    await page.fill('input[type="search"]', 'Progressive')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-product-card]')).toContainText('Progressive')

    // 3. View product details
    await page.click('[data-product-card]:first-child')
    await expect(page.locator('h2')).toContainText('Product Details')

    // Check specifications
    await expect(page.locator('text=Spherical Range')).toBeVisible()
    await expect(page.locator('text=Materials')).toBeVisible()
    await expect(page.locator('text=Delivery Time')).toBeVisible()

    // 4. Set custom pricing
    await page.click('nav >> text=Pricing')
    await page.waitForURL('/client/pricing')

    // Select a product to customize
    await page.click('button[aria-label="Customize price for Progressive Lens HD"]')

    // Set custom price
    const basePrice = await page.locator('[data-base-price]').textContent()
    await page.fill('input[name="custom_price"]', '349.99')
    await page.fill('input[name="markup_percentage"]', '40')

    // Save custom price
    await page.click('button:has-text("Save Price")')
    await expect(page.locator('text=Price saved successfully')).toBeVisible()

    // 5. Bulk update prices
    await page.click('button:has-text("Bulk Update")')

    // Apply 25% markup to all products
    await page.fill('input[name="global_markup"]', '25')
    await page.click('button:has-text("Apply to All")')

    // Confirm bulk update
    await page.click('button:has-text("Confirm")')
    await expect(page.locator('text=All prices updated')).toBeVisible()

    // 6. View pricing history
    await page.click('nav >> text=History')
    await page.waitForURL('/client/history')

    // Check history entries
    await expect(page.locator('[data-history-entry]')).toHaveCount(2) // Individual + bulk update
    await expect(page.locator('text=Bulk Update')).toBeVisible()
    await expect(page.locator('text=25% markup applied')).toBeVisible()

    // 7. Export price list
    await page.click('button:has-text("Export Prices")')
    await page.selectOption('select[name="format"]', 'csv')
    await page.click('button:has-text("Download")')

    // Verify download started
    const download = await page.waitForEvent('download')
    expect(download.suggestedFilename()).toContain('price-list')
    expect(download.suggestedFilename()).toContain('.csv')

    // 8. Logout
    await page.click('button[aria-label="User menu"]')
    await page.click('text=Sign Out')
    await page.waitForURL('/login')
  })

  test('first time login and password setup', async ({ page }) => {
    // Navigate to set password page (simulating email link)
    await page.goto('/set-password?token=first-time-token')

    // Set new password
    await page.fill('input[name="password"]', 'NewSecurePassword123!')
    await page.fill('input[name="confirmPassword"]', 'NewSecurePassword123!')
    await page.click('button:has-text("Set Password")')

    // Verify redirect to client dashboard
    await page.waitForURL('/client')
    await expect(page.locator('text=Welcome to your dashboard')).toBeVisible()

    // Check onboarding tour
    await expect(page.locator('[data-tour-step="1"]')).toBeVisible()
    await page.click('button:has-text("Next")')
    await expect(page.locator('[data-tour-step="2"]')).toBeVisible()
  })

  test('price validation and constraints', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'client-password')
    await page.click('button[type="submit"]')

    // Navigate to pricing
    await page.goto('/client/pricing')

    // Try to set price below base
    await page.click('[data-product-id="1"] >> text=Customize')
    const basePrice = await page.locator('[data-base-price="1"]').getAttribute('data-value')
    const belowBase = (parseFloat(basePrice!) * 0.8).toFixed(2)

    await page.fill('input[name="custom_price"]', belowBase)
    await page.click('button:has-text("Save")')

    // Verify error
    await expect(page.locator('text=Price cannot be below base price')).toBeVisible()

    // Set valid price
    const validPrice = (parseFloat(basePrice!) * 1.3).toFixed(2)
    await page.fill('input[name="custom_price"]', validPrice)
    await page.click('button:has-text("Save")')

    // Verify success
    await expect(page.locator('text=Price saved')).toBeVisible()
  })

  test('mobile responsive client interface', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    // Login on mobile
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'client-password')
    await page.click('button[type="submit"]')

    // Check mobile navigation drawer
    await page.click('button[aria-label="Menu"]')
    await expect(page.locator('nav[data-mobile-nav]')).toBeVisible()

    // Navigate to products on mobile
    await page.click('nav >> text=Products')

    // Check product cards are stacked
    const cards = page.locator('[data-product-card]')
    await expect(cards.first()).toHaveCSS('width', '100%')

    // Open price customization modal
    await page.click('[data-product-card]:first-child >> text=Set Price')
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Check form is mobile-optimized
    const input = page.locator('input[name="custom_price"]')
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    await expect(input).toHaveCSS('font-size', /16px|1rem/) // Prevents zoom on iOS
  })

  test('search and filter products', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'client-password')
    await page.click('button[type="submit"]')

    // Navigate to products
    await page.goto('/client/products')

    // Test search functionality
    await page.fill('input[type="search"]', 'HD')
    await page.keyboard.press('Enter')

    const results = page.locator('[data-product-card]')
    await expect(results).toHaveCount(3) // Assuming 3 HD products

    for (const result of await results.all()) {
      await expect(result).toContainText('HD')
    }

    // Clear search
    await page.click('button[aria-label="Clear search"]')

    // Test category filter
    await page.selectOption('select[name="category"]', 'progressive-lenses')
    await expect(page.locator('[data-product-card]')).toContainText('Progressive')

    // Test price range filter
    await page.fill('input[name="min_price"]', '100')
    await page.fill('input[name="max_price"]', '300')
    await page.click('button:has-text("Apply Filters")')

    // Verify filtered results
    const prices = await page.locator('[data-price]').allTextContents()
    prices.forEach(price => {
      const value = parseFloat(price.replace('$', ''))
      expect(value).toBeGreaterThanOrEqual(100)
      expect(value).toBeLessThanOrEqual(300)
    })

    // Test sort functionality
    await page.selectOption('select[name="sort"]', 'price_asc')

    const sortedPrices = await page.locator('[data-price]').allTextContents()
    const values = sortedPrices.map(p => parseFloat(p.replace('$', '')))

    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
    }
  })
})