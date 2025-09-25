# altavista6 Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-24

## Active Technologies
- Next.js 15.5.4 (upgraded from 15.1.0 on 2025-09-24)
- TypeScript 5.9
- React 19.1.1
- Tailwind CSS v4
- Supabase
- shadcn/ui with Zinc theme
- (001-im-building-a)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
# Add commands for 

## Code Style
- Follow standard conventions
- **IMPORTANT: Consistent Component Usage** - ALWAYS use shadcn/ui components. Never use native HTML form elements with custom styling (e.g., no `<input type="checkbox" class="border-gray-300">` - use `<Checkbox>` from shadcn/ui instead). All UI components must follow the zinc theme and use shadcn/ui components for consistency.

## Recent Changes
- 2025-09-24: Upgraded Next.js from 15.1.0 to 15.5.4 to maintain constitutional compliance with "Latest Stack Only" principle
- 2025-09-24: Updated all dependencies to latest versions (TypeScript 5.9, React 19.1.1, Tailwind CSS v4.1.13)
- 2025-09-23: Phase 3.6 completed - UI Components (shadcn/ui dashboard components, product/pricing/client forms)
- 2025-09-23: Phase 3.7 completed - Page Implementation (all admin and client dashboard pages)
- 001-im-building-a: Added

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
- when using chrome mcp do not add a new localhost port, use the running one. If you find you need to ran be sure to kill all localhost 300X ports instead of addning a new one.