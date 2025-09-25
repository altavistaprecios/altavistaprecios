# Implementation Plan: Optics Factory B2B Pricing Platform

**Branch**: `001-im-building-a` | **Date**: 2025-09-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-im-building-a/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Building a B2B pricing platform for an optics factory that allows admin CRUD operations on products/prices and enables clients to customize pricing for their B2C customers. Using Next.js 15.5.4 with Supabase for auth/database, shadcn/ui components with Zinc theme, and mobile-responsive design. Platform supports 10-50 concurrent clients with up to 100 products.

## Technical Context
**Language/Version**: TypeScript 5.9 / Node.js 20 LTS
**Primary Dependencies**: Next.js 15.5.4, Supabase Client, shadcn/ui, Tailwind CSS v4, Zustand, TanStack Query
**Storage**: Supabase (PostgreSQL) with Row Level Security
**Testing**: Vitest for unit/integration, Playwright for E2E, React Testing Library
**Target Platform**: Web (responsive for mobile), deployed on Vercel
**Project Type**: web - Next.js application with API routes
**Performance Goals**: <3s initial load, <500ms search response, Lighthouse score >90
**Constraints**: No Docker, use existing Supabase MCP, pnpm only, latest versions only
**Scale/Scope**: 10-50 clients, 100 products, 1 year price history retention

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Latest Stack Only ✅
- Using Next.js 15.5.4 (latest stable as of 2025-09-24)
- Tailwind CSS v4.1.13 (latest) with @tailwindcss/postcss for PostCSS compatibility
- All dependencies at latest versions
- No downgrading planned
- **UPDATED 2025-09-24**: Upgraded from Next.js 15.1.0 to 15.5.4 to maintain constitutional compliance
- **UPDATED 2025-09-24**: Configured Tailwind CSS v4 with @tailwindcss/postcss plugin

### II. Package Management with pnpm ✅
- Exclusive use of pnpm
- Workspace structure for potential packages
- No npm or yarn usage

### III. Component-First Architecture ✅
- shadcn/ui components with Zinc theme
- No custom components unless extending shadcn
- Dashboard components from shadcn

### IV. Type Safety Throughout ✅
- TypeScript strict mode enabled
- Zod for runtime validation
- Generated types from Supabase
- No `any` types

### V. Test Coverage Requirements ✅
- Vitest for unit tests
- Playwright for E2E tests
- Contract tests for API
- Target 80% coverage

## Project Structure

### Documentation (this feature)
```
specs/001-im-building-a/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command) ✅
├── data-model.md        # Phase 1 output (/plan command) ✅
├── quickstart.md        # Phase 1 output (/plan command) ✅
├── contracts/           # Phase 1 output (/plan command) ✅
│   └── api-spec.yaml    # OpenAPI specification
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Next.js App Structure (App Router)
app/
├── (auth)/
│   ├── login/
│   ├── set-password/
│   └── reset-password/
├── (dashboard)/
│   ├── layout.tsx       # Dashboard layout with sidebar
│   ├── admin/
│   │   ├── products/
│   │   ├── clients/
│   │   └── history/
│   └── client/
│       ├── products/
│       ├── pricing/
│       └── history/
├── api/
│   ├── auth/
│   ├── products/
│   ├── client-prices/
│   └── users/
└── layout.tsx           # Root layout

components/
├── ui/                  # shadcn/ui components
├── dashboard/
├── products/
└── pricing/

lib/
├── supabase/
├── validations/
└── utils/

tests/
├── contract/
├── integration/
└── e2e/
```

**Structure Decision**: Web application with Next.js App Router structure

## Phase 0: Outline & Research ✅
1. **Extract unknowns from Technical Context** above:
   - All clarified through /clarify command
   - Technology stack decided based on requirements

2. **Generate and dispatch research agents**:
   - Research completed for Next.js 15 best practices
   - Supabase RLS patterns researched
   - shadcn/ui dashboard components identified

3. **Consolidate findings** in `research.md` using format:
   - Decisions documented with rationales
   - Alternatives considered and rejected
   - Security and performance strategies defined

**Output**: research.md with all NEEDS CLARIFICATION resolved ✅

## Phase 1: Design & Contracts ✅
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - User, Product, ProductCategory, ProductSpecification
   - ClientPrice, Treatment, ProductTreatment, PriceHistory
   - Validation rules and state transitions defined
   - RLS policies specified

2. **Generate API contracts** from functional requirements:
   - OpenAPI 3.0 specification created
   - All endpoints mapped to requirements
   - Authentication flows documented
   - Request/response schemas defined

3. **Generate contract tests** from contracts:
   - Test structure planned for Vitest
   - Schema validation with Zod
   - Tests will fail initially (TDD approach)

4. **Extract test scenarios** from user stories:
   - Admin journey tests defined
   - Client journey tests defined
   - Mobile responsiveness tests included

5. **Update agent file incrementally** (O(1) operation):
   - CLAUDE.md updated with project context
   - Technologies and structure documented
   - Recent changes tracked

**Output**: data-model.md ✅, /contracts/* ✅, failing tests (planned), quickstart.md ✅, CLAUDE.md ✅

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Setup tasks: Project initialization, Supabase setup, dependencies
- Database tasks: Migrations, RLS policies, seed data
- Auth tasks: Login, invitation, password flows
- Admin tasks: CRUD operations, client management
- Client tasks: Price customization, history viewing
- Testing tasks: Contract tests, integration tests, E2E tests
- UI tasks: Dashboard layouts, responsive design

**Ordering Strategy**:
- Database setup before application code
- Auth implementation before protected features
- Admin features before client features
- Tests written before implementation (TDD)
- Parallel execution for independent components

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md covering:
- Project setup (3-4 tasks)
- Database and migrations (5-6 tasks)
- Authentication flows (5-6 tasks)
- Admin features (6-7 tasks)
- Client features (5-6 tasks)
- Testing implementation (5-6 tasks)
- Deployment setup (1-2 tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations - all constitutional principles are being followed.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*