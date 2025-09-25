# Quickstart: Optics Factory B2B Pricing Platform

## Prerequisites

- Node.js 20+ LTS installed
- pnpm 9+ installed (`npm install -g pnpm`)
- Supabase account (already configured in `.env.local`)
- Access to Supabase MCP connection

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up Supabase Database

```bash
# The Supabase MCP connection is already configured
# Run migrations to create tables
pnpm supabase:migrate
```

### 3. Seed Initial Data

```bash
# Load product categories and initial products
pnpm seed:initial
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Testing the Application

### Admin User Journey

1. **Login as Admin**
   - Navigate to `http://localhost:3000`
   - Click "Sign In"
   - Enter email: `anibalin@gmail.com`
   - Enter password: `1234Petunias`
   - You should see the admin dashboard

2. **Create a Product**
   - Click "Products" in the sidebar
   - Click "Add Product"
   - Fill in:
     - Code: `TEST001`
     - Name: `Test Lens`
     - Category: `MONOFOCALES FUTURE-X`
     - Base Price: `150.00` USD
   - Click "Save"
   - Product should appear in the list

3. **Invite a Client**
   - Click "Clients" in the sidebar
   - Click "Invite Client"
   - Enter client email: `client@example.com`
   - Click "Send Invitation"
   - Invitation email should be sent

4. **Update Product Price**
   - Go back to "Products"
   - Click on the test product
   - Change base price to `175.00` USD
   - Click "Update"
   - Price history should show the change

### Client User Journey

1. **First-Time Setup**
   - Open invitation email
   - Click the invitation link
   - Set password (minimum 8 characters)
   - Click "Set Password"
   - Automatically logged in to client dashboard

2. **View Products**
   - Products page shows all active products
   - Base prices are displayed in USD
   - Search and filter by category works

3. **Customize Pricing**
   - Click on any product
   - Click "Set Custom Price"
   - Enter your selling price: `200.00` USD
   - Markup percentage is calculated automatically
   - Click "Save"
   - Custom price is saved for your account only

4. **View Price History**
   - Click "Price History" in the sidebar
   - See all your price customizations
   - Filter by date range
   - Export as CSV (if needed)

### Mobile Testing

1. **Responsive Design**
   - Open DevTools (F12)
   - Toggle device toolbar
   - Test on iPhone 12 (390x844)
   - Navigation should collapse to hamburger menu
   - Tables should be scrollable
   - Forms should be touch-friendly

2. **Touch Interactions**
   - Price input should show numeric keyboard
   - Dropdowns should be native on mobile
   - Buttons should have adequate touch targets (44x44px minimum)

## Validation Checklist

### Authentication
- [ ] Admin can login with credentials
- [ ] Client receives invitation email
- [ ] Client can set password on first access
- [ ] Password reset email is sent
- [ ] Invalid login shows error message
- [ ] Session persists on page refresh
- [ ] Logout clears session

### Admin Features
- [ ] View all products
- [ ] Create new product with specifications
- [ ] Update product and base price
- [ ] Soft delete product (becomes inactive)
- [ ] View all clients
- [ ] Invite new clients
- [ ] Deactivate client accounts
- [ ] View complete price history

### Client Features
- [ ] View product catalog
- [ ] See base prices in USD
- [ ] Set custom prices for products
- [ ] Update existing custom prices
- [ ] Remove custom price (revert to base)
- [ ] View own price history
- [ ] Cannot see other clients' prices

### Data Validation
- [ ] Prices must be positive numbers
- [ ] Email format validation works
- [ ] Required fields show errors
- [ ] Form submission shows loading state
- [ ] Success messages display correctly
- [ ] Error messages are user-friendly

### Performance
- [ ] Page loads under 3 seconds
- [ ] Search responds within 500ms
- [ ] No layout shift on load
- [ ] Images are optimized
- [ ] Pagination works for large lists

### Security
- [ ] Clients cannot access admin pages
- [ ] Direct URL access requires authentication
- [ ] API endpoints check authorization
- [ ] Passwords are not visible
- [ ] Session timeout after inactivity

## Troubleshooting

### Database Connection Issues
```bash
# Check Supabase connection
pnpm supabase:status

# Verify environment variables
cat .env.local | grep SUPABASE
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

### Type Errors
```bash
# Generate fresh types from Supabase
pnpm supabase:types
```

## Production Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] TypeScript builds without errors
- [ ] Lighthouse score > 90
- [ ] Security headers configured
- [ ] Environment variables set in Vercel

### Deploy Command
```bash
# Deploy to production
pnpm deploy:prod
```

## Support

For issues or questions:
1. Check the error logs in browser console
2. Review Supabase logs for database errors
3. Verify all environment variables are set
4. Ensure latest versions of dependencies

## Success Criteria

The platform is considered successfully deployed when:
1. Admin can perform all CRUD operations
2. Clients can customize prices independently
3. Data isolation is verified (no cross-client data leaks)
4. Mobile experience is smooth
5. Page performance meets targets
6. All validation tests pass