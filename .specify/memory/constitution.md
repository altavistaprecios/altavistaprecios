<!--
Sync Impact Report
Version Change: 0.0.0 → 1.0.0 (Initial ratification)
Modified Principles: N/A (new constitution)
Added Sections: All sections (initial creation)
Removed Sections: N/A
Templates requiring updates: ✅ plan-template.md / ✅ spec-template.md / ✅ tasks-template.md / ✅ agent-file-template.md
Follow-up TODOs: None
-->

# Platform App Constitution

## Core Principles

### I. Latest Stack Only
Every technology choice MUST use the latest stable version available. When encountering version conflicts or deprecation warnings, upgrade to the newest compatible version. Never downgrade to solve problems - find forward-compatible solutions instead. This ensures the codebase remains modern, secure, and benefits from the latest performance improvements and features.

### II. Package Management with pnpm
All package management MUST use pnpm exclusively. This provides efficient disk space usage through content-addressable storage, strict dependency resolution preventing phantom dependencies, and faster installation times. Use workspace features for monorepo structures. Never mix package managers - convert any npm or yarn references to pnpm equivalents.

### III. Component-First Architecture
All UI development MUST prioritize using standard shadcn/ui components. Before creating custom components, verify if shadcn/ui provides a suitable solution. When customization is needed, extend shadcn components rather than replacing them. This ensures consistent design language, accessibility compliance, and reduced maintenance burden.

### IV. Type Safety Throughout
TypeScript MUST be used for all JavaScript code with strict mode enabled. No `any` types allowed except in exceptional circumstances with documented justification. All API contracts, data models, and component props require explicit type definitions. This prevents runtime errors and improves developer experience through IDE support.

### V. Test Coverage Requirements
Every feature MUST include automated tests covering happy paths, error scenarios, and edge cases. Unit tests for business logic, integration tests for API endpoints, and E2E tests for critical user journeys are mandatory. Minimum 80% code coverage enforced through CI/CD gates.

## Development Standards

### Technology Stack
- **Runtime**: Latest Node.js LTS version
- **Framework**: Next.js (latest stable)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS (latest version)
- **Database**: PostgreSQL with Prisma ORM (latest versions)
- **API**: tRPC or REST with proper OpenAPI documentation
- **Testing**: Vitest for unit/integration, Playwright for E2E
- **Package Manager**: pnpm exclusively

### Code Quality Gates
- ESLint with recommended rulesets must pass
- Prettier formatting required (no manual formatting)
- TypeScript compilation with no errors
- All tests must pass before merge
- Bundle size analysis for frontend changes
- Lighthouse performance scores maintained above 90

## Platform Architecture

### Monorepo Structure
The platform uses a monorepo structure managed by pnpm workspaces:
- `apps/` - Application packages (web, mobile, admin)
- `packages/` - Shared libraries and utilities
- `config/` - Shared configuration (ESLint, TypeScript, etc.)
- Each package maintains its own package.json and dependencies
- Shared dependencies hoisted to root for efficiency

### Deployment Requirements
- Containerized deployments using Docker
- Environment-specific configurations via .env files
- Health check endpoints mandatory
- Graceful shutdown handling
- Structured JSON logging for observability
- Zero-downtime deployments through rolling updates

## Governance

### Amendment Process
1. Proposed changes must be documented in a pull request
2. Major principle changes require team consensus
3. Version bump following semantic versioning
4. All dependent templates and documentation must be updated
5. Migration plan required for breaking changes

### Compliance Verification
- All pull requests must verify constitutional compliance
- Automated checks enforce principle adherence
- Architecture Decision Records (ADRs) document deviations
- Quarterly reviews ensure principles remain relevant
- New team members must review constitution during onboarding

### Version Control
Constitution changes tracked through semantic versioning:
- MAJOR: Removing principles or fundamental architecture changes
- MINOR: Adding new principles or significant clarifications
- PATCH: Typo fixes, formatting, minor clarifications

**Version**: 1.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23