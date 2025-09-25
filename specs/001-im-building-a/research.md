# Research: Optics Factory B2B Pricing Platform

## Technology Stack Decisions

### Framework Choice
**Decision**: Next.js 15.5.4 with App Router
**Rationale**: Latest stable version aligns with constitution's "Latest Stack Only" principle. App Router provides better server components support, improved performance, and built-in layouts for role-based dashboards.
**Update 2025-09-24**: Upgraded from 15.1.0 to 15.5.4 to maintain constitutional compliance with latest stable version.
**Alternatives considered**: Remix, SvelteKit - rejected as Next.js has better Supabase integration and shadcn/ui ecosystem support.

### Database & Auth
**Decision**: Supabase (PostgreSQL + Auth)
**Rationale**: Already configured in project (.env.local), provides built-in auth with email/password, RLS for data isolation, real-time capabilities for price updates.
**Alternatives considered**: Custom auth - rejected due to complexity and Supabase's superior security features.

### UI Components
**Decision**: shadcn/ui with Zinc theme
**Rationale**: Specified requirement, provides complete dashboard components, fully accessible, mobile-responsive by default.
**Alternatives considered**: None - constitutional requirement.

### Styling
**Decision**: Tailwind CSS v4.1.13 with @tailwindcss/postcss
**Rationale**: Latest version required by constitution, perfect integration with shadcn/ui, excellent responsive utilities. Tailwind v4 requires @tailwindcss/postcss for PostCSS plugin compatibility.
**Update 2025-09-24**: Upgraded to v4.1.13 and configured with @tailwindcss/postcss plugin for Next.js 15.5.4 compatibility.
**Alternatives considered**: None - constitutional requirement.

### State Management
**Decision**: Zustand for client state + React Query (TanStack Query) for server state
**Rationale**: Lightweight, TypeScript-first, works well with Supabase real-time subscriptions, handles cache invalidation elegantly.
**Alternatives considered**: Redux - too complex for this scale; Context API - insufficient for server state.

### Testing Strategy
**Decision**: Vitest + Playwright + React Testing Library
**Rationale**: Constitutional requirement, Vitest is faster than Jest, Playwright handles E2E across browsers.
**Alternatives considered**: None - constitutional requirement.

## Architecture Patterns

### Authentication Flow
**Decision**: Supabase Auth with email + password, magic link for password reset
**Rationale**: Built-in security, handles session management, supports pre-authorized email invites.
**Implementation**: Row Level Security (RLS) policies for data isolation.

### Data Isolation Strategy
**Decision**: PostgreSQL Row Level Security (RLS) with user_id foreign keys
**Rationale**: Database-level security, impossible to bypass at application layer, automatic with Supabase auth.
**Implementation**: Each client sees only their pricing through RLS policies.

### Pricing Model Architecture
**Decision**: Base prices table + client overrides table with view materialization
**Rationale**: Efficient queries, maintains data integrity, easy to track changes, supports soft deletes.
**Implementation**:
- `products` table with base prices
- `client_prices` table for overrides
- Database view combining both for client-specific pricing

### Mobile Responsiveness
**Decision**: Mobile-first responsive design using Tailwind breakpoints
**Rationale**: Better performance, progressive enhancement, aligns with shadcn/ui patterns.
**Implementation**: Use Tailwind's responsive utilities (sm:, md:, lg:)

## Security Considerations

### Authentication Security
- Supabase handles password hashing (bcrypt)
- JWT tokens with secure httpOnly cookies
- Email verification for new accounts
- Rate limiting on auth endpoints

### Data Access Security
- Row Level Security (RLS) enforced at database
- No client can access another's pricing
- Admin role checked via custom claims
- API routes protected by middleware

### Input Validation
- Zod schemas for all forms
- Server-side validation mandatory
- Price constraints (positive numbers, max values)
- SQL injection prevention via parameterized queries

## Performance Optimizations

### Database Performance
- Indexes on frequently queried columns (user_id, product_id)
- Materialized views for complex pricing calculations
- Connection pooling via Supabase
- Pagination for product lists

### Frontend Performance
- Server Components for initial render
- Client components only for interactivity
- Image optimization with Next.js Image
- Code splitting per route
- Prefetching for navigation

### Caching Strategy
- Static assets via CDN
- Database query caching with React Query
- Stale-while-revalidate for pricing data
- Browser caching headers for images

## Deployment Strategy

### Hosting
**Decision**: Vercel for Next.js app
**Rationale**: Zero-config deployment, automatic scaling, excellent Next.js integration, preview deployments.

### Environment Management
- `.env.local` for local development (already configured)
- Environment variables in Vercel dashboard
- Separate Supabase projects for staging/production

### CI/CD Pipeline
- GitHub Actions for testing
- Automatic deployment on main branch
- Preview deployments for PRs
- Database migrations via Supabase CLI

## Resolved Clarifications

All technical decisions have been made based on:
1. Constitutional requirements (latest versions, pnpm, shadcn/ui)
2. User specifications (Next.js, Supabase, no Docker)
3. Feature requirements from spec (auth, pricing, mobile-responsive)
4. Scale requirements (10-50 clients, 100 products)

No remaining NEEDS CLARIFICATION items for technical implementation.