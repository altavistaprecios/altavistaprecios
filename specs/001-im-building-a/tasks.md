# Tasks: Optics Factory B2B Pricing Platform

**Input**: Design documents from `/specs/001-im-building-a/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `app/` for pages, `components/` for React components
- **API Routes**: `app/api/` for backend endpoints
- **Utilities**: `lib/` for shared logic
- **Tests**: `tests/` at repository root

## Phase 3.1: Setup & Configuration
- [x] T001 Initialize Next.js 15 project with TypeScript and pnpm in repository root (upgraded to 15.5.4 on 2025-09-24)
- [x] T002 Install core dependencies: supabase-js, @supabase/ssr, @tanstack/react-query, zustand
- [x] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [x] T004 [P] Set up ESLint and Prettier configs for Next.js and TypeScript
- [x] T005 [P] Initialize shadcn/ui with Zinc theme: pnpm dlx shadcn@latest init
- [x] T006 Create .env.local with Supabase connection from existing MCP config
- [x] T007 Set up Tailwind CSS v4 configuration with responsive breakpoints

## Phase 3.2: Database Setup
- [ ] T008 Create Supabase database migrations in supabase/migrations/001_initial_schema.sql
- [ ] T009 Define tables: users, products, product_categories, product_specifications, client_prices, treatments, product_treatments, price_history
- [ ] T010 [P] Create RLS policies for user data isolation in supabase/migrations/002_rls_policies.sql
- [ ] T011 [P] Add database indexes for performance in supabase/migrations/003_indexes.sql
- [ ] T012 Create seed data script in supabase/seed.sql with product categories and initial products
- [ ] T013 Generate TypeScript types from Supabase schema: pnpm supabase gen types

## Phase 3.3: Authentication Setup
- [x] T014 Create Supabase client utilities in lib/supabase/client.ts and lib/supabase/server.ts
- [x] T015 [P] Create auth context provider in components/providers/auth-provider.tsx
- [x] T016 [P] Build login page component in app/(auth)/login/page.tsx
- [x] T017 [P] Build set-password page for first-time users in app/(auth)/set-password/page.tsx
- [x] T018 [P] Build password reset page in app/(auth)/reset-password/page.tsx
- [x] T019 Create auth middleware in middleware.ts for route protection
- [x] T020 [P] Create useAuth hook in lib/hooks/use-auth.ts

## Phase 3.4: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.5
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T021 [P] Contract test for POST /api/auth/login in tests/contract/auth.test.ts
- [x] T022 [P] Contract test for POST /api/auth/invite in tests/contract/auth-invite.test.ts
- [x] T023 [P] Contract test for GET /api/products in tests/contract/products-get.test.ts
- [x] T024 [P] Contract test for POST /api/products in tests/contract/products-post.test.ts
- [x] T025 [P] Contract test for PUT /api/products/[id] in tests/contract/products-update.test.ts
- [x] T026 [P] Contract test for GET /api/client-prices in tests/contract/client-prices.test.ts
- [x] T027 [P] Contract test for POST /api/client-prices in tests/contract/client-prices-post.test.ts
- [x] T028 [P] Integration test for admin product CRUD in tests/integration/admin-products.test.ts
- [x] T029 [P] Integration test for client price customization in tests/integration/client-pricing.test.ts
- [x] T030 [P] E2E test for complete admin journey in tests/e2e/admin-flow.spec.ts
- [x] T031 [P] E2E test for complete client journey in tests/e2e/client-flow.spec.ts

## Phase 3.5: Core Implementation (ONLY after tests are failing)
- [x] T032 [P] Create Product model with Zod validation in lib/models/product.ts
- [x] T033 [P] Create User model with Zod validation in lib/models/user.ts
- [x] T034 [P] Create ClientPrice model with Zod validation in lib/models/client-price.ts
- [x] T035 [P] Create ProductCategory model in lib/models/product-category.ts
- [x] T036 [P] Create PriceHistory model in lib/models/price-history.ts
- [x] T037 Implement ProductService CRUD operations in lib/services/product-service.ts
- [x] T038 Implement ClientPriceService in lib/services/client-price-service.ts
- [x] T039 Implement UserService for client management in lib/services/user-service.ts
- [x] T040 Create API route POST /api/auth/login in app/api/auth/login/route.ts
- [x] T041 Create API route POST /api/auth/invite in app/api/auth/invite/route.ts
- [x] T042 Create API routes for /api/products (GET, POST) in app/api/products/route.ts
- [x] T043 Create API routes for /api/products/[id] (GET, PUT, DELETE) in app/api/products/[id]/route.ts
- [x] T044 Create API routes for /api/client-prices in app/api/client-prices/route.ts
- [x] T045 Create API route for /api/categories in app/api/categories/route.ts
- [x] T046 Create API route for /api/price-history in app/api/price-history/route.ts

## Phase 3.6: UI Components
- [x] T047 [P] Install shadcn/ui dashboard components: button, card, table, form, dialog, toast
- [x] T048 Create dashboard layout with sidebar in app/(dashboard)/layout.tsx
- [x] T049 [P] Build ProductCard component in components/products/product-card.tsx
- [x] T050 [P] Build ProductForm component in components/products/product-form.tsx
- [x] T051 [P] Build ProductTable component in components/products/product-table.tsx
- [x] T052 [P] Build PricingForm for clients in components/pricing/pricing-form.tsx
- [x] T053 [P] Build PriceHistoryTable in components/pricing/price-history-table.tsx
- [x] T054 [P] Build ClientInviteDialog in components/clients/invite-dialog.tsx
- [x] T055 Create responsive navigation component in components/navigation/sidebar.tsx

## Phase 3.7: Page Implementation
- [x] T056 Build admin dashboard home in app/(dashboard)/admin/page.tsx
- [x] T057 Build admin products page in app/(dashboard)/admin/products/page.tsx
- [x] T058 Build admin clients page in app/(dashboard)/admin/clients/page.tsx
- [x] T059 Build admin price history page in app/(dashboard)/admin/history/page.tsx
- [x] T060 Build client dashboard home in app/(dashboard)/client/page.tsx
- [x] T061 Build client products page in app/(dashboard)/client/products/page.tsx
- [x] T062 Build client pricing page in app/(dashboard)/client/pricing/page.tsx
- [x] T063 Build client history page in app/(dashboard)/client/history/page.tsx

## Phase 3.8: State Management & Data Fetching
- [x] T064 [P] Create Zustand store for user state in lib/stores/user-store.ts
- [x] T065 [P] Create Zustand store for products in lib/stores/product-store.ts
- [x] T066 [P] Set up React Query hooks for products in lib/queries/use-products.ts
- [x] T067 [P] Set up React Query hooks for pricing in lib/queries/use-pricing.ts
- [x] T068 [P] Create React Query mutations for CRUD operations in lib/mutations/
- [x] T069 Implement optimistic updates for price changes

## Phase 3.9: Mobile Responsiveness
- [ ] T070 Add responsive utilities to all tables (horizontal scroll on mobile)
- [ ] T071 Implement mobile-friendly navigation drawer
- [ ] T072 Optimize forms for touch input and mobile keyboards
- [ ] T073 Test and fix layout issues on common mobile viewports

## Phase 3.10: Polish & Optimization
- [ ] T074 [P] Add loading skeletons for all data-fetching components
- [ ] T075 [P] Implement error boundaries and fallback UI
- [ ] T076 [P] Add input validation feedback with react-hook-form and Zod
- [ ] T077 Optimize images with Next.js Image component
- [ ] T078 Implement pagination for product lists
- [ ] T079 Add search and filter functionality for products
- [ ] T080 [P] Write unit tests for services in tests/unit/
- [ ] T081 Run Lighthouse audit and fix performance issues
- [ ] T082 Add proper SEO meta tags and Open Graph data

## Phase 3.11: Deployment
- [ ] T083 Configure Vercel project settings and environment variables
- [ ] T084 Set up GitHub Actions for CI/CD in .github/workflows/ci.yml
- [ ] T085 Create production database migrations and verify RLS policies
- [ ] T086 Deploy to Vercel and verify all features working
- [ ] T087 Set up monitoring and error tracking (Sentry or similar)
- [ ] T088 Document deployment process in README.md

## Dependencies
- Database setup (T008-T013) blocks all data operations
- Auth setup (T014-T020) blocks all protected routes
- Tests (T021-T031) must fail before implementation (T032-T046)
- Core implementation (T032-T046) blocks UI components
- UI components (T047-T055) block page implementation
- State management (T064-T069) should be done with pages

## Parallel Example
```bash
# Launch contract tests together (after database setup):
Task: "Contract test for POST /api/auth/login in tests/contract/auth.test.ts"
Task: "Contract test for POST /api/auth/invite in tests/contract/auth-invite.test.ts"
Task: "Contract test for GET /api/products in tests/contract/products-get.test.ts"
Task: "Contract test for POST /api/products in tests/contract/products-post.test.ts"

# Launch model creation in parallel:
Task: "Create Product model with Zod validation in lib/models/product.ts"
Task: "Create User model with Zod validation in lib/models/user.ts"
Task: "Create ClientPrice model with Zod validation in lib/models/client-price.ts"

# Launch UI component creation in parallel:
Task: "Build ProductCard component in components/products/product-card.tsx"
Task: "Build ProductForm component in components/products/product-form.tsx"
Task: "Build ProductTable component in components/products/product-table.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing features
- Commit after each completed phase
- Use Supabase MCP for all database operations
- Follow shadcn/ui patterns for all components
- Maintain TypeScript strict mode throughout

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**: Each endpoint → contract test + implementation
2. **From Data Model**: Each entity → model + service + migration
3. **From User Stories**: Each journey → integration/E2E test
4. **From Tech Stack**: Each tool → setup and configuration

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All API endpoints have contract tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Total tasks: 88 (comprehensive coverage)