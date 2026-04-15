# ARCHIVE.md

This file is the running handoff log for the repository.
If a new agent needs to know where work stopped, start here.

## Current Snapshot

Date of latest update:
- 2026-04-15

Current app position:
- dashboard exists and is actively used as the main overview
- project detail page exists and includes analytics
- local seed data exists for visual/testing flows
- Prisma relations were hardened with cascade behavior
- chart colors now follow the active app theme

## Completed Recently

### Dashboard analytics and layout

Implemented:
- main dashboard metrics
- radial completion chart
- 7-day activity trend chart
- project throughput chart
- structured dashboard layout with clearer sections

Main files:
- `src/app/page.tsx`
- `src/components/ChartsComponent/InsightsCharts.tsx`
- `src/components/ChartsComponent/RadialChart.tsx`
- `src/lib/analytics.ts`
- `src/components/counter-with-icon.tsx`

### Project detail analytics

Implemented:
- project summary section
- project-level activity chart
- habit performance chart

Main file:
- `src/app/projects/[id]/page.tsx`

### Theme-aware charts

Implemented:
- chart tokens now derive from theme hue/chroma variables
- graphs update visually when theme changes

Main file:
- `src/app/globals.css`

### Data wiring fixes

Implemented:
- aligned task filters across API route, service layer, and React Query hooks
- fixed habit hook behavior so project-filtered habits actually load

Main files:
- `src/app/api/tasks/route.ts`
- `src/services/TasksServices.ts`
- `src/hooks/useTaskMutation.ts`
- `src/hooks/useHabitMutations.ts`

### Prisma relation hardening

Implemented:
- explicit cascade behavior on key relations

Main file:
- `prisma/schema.prisma`

### Local test data

Implemented:
- repeatable seed script
- test projects/habits/tasks for graphs and dashboard states

Main files:
- `prisma/seed.ts`
- `package.json`

Seed snapshot:
- user `id = 1`
- 3 projects
- 5 habits
- 9 tasks

Seeded project names:
- `Health Reset`
- `Frontend Mastery`
- `Language Sprint`

## Current Architecture Notes

### Main dashboard flow

Page:
- `src/app/page.tsx`

Data flow:
- hooks load `projects`, `tasks`, and `habits`
- `src/lib/analytics.ts` derives chart-ready metrics
- chart components render those metrics

### Project detail flow

Page:
- `src/app/projects/[id]/page.tsx`

Data flow:
- `useProjectsById(id)` loads the project with habits and tasks
- analytics are derived from the project payload
- project detail charts render from that derived data

### Theme system

Theme source:
- `src/app/ThemeSwitcher.tsx`

Theme tokens:
- `src/app/globals.css`

Important detail:
- chart tokens now inherit from the same hue/chroma variables as the broader theme

## What Is Still Weak

These are known unfinished areas:

- auth is not implemented
- some server logic still assumes a development user
- older pages are not fully aligned with the new dashboard architecture:
  - `src/app/tasks/page.tsx`
  - `src/app/habits/page.tsx`
- analytics are currently derived from task timestamps and habit history arrays
- there is no dedicated historical events model yet
- repo-wide lint baseline is still noisy outside recently touched files

## Recommended Next Steps

Recommended order:

1. Add real auth/session handling and remove hardcoded user assumptions.
2. Decide whether analytics should keep using derived data or move to a dedicated history/event model.
3. Refactor older pages so they follow the same data and UI patterns as the dashboard.
4. Add request validation and cleaner error responses to route handlers.
5. Improve repo-wide lint health incrementally while touching adjacent files.

## If You Need To Continue Analytics Work

Start with:
- `src/lib/analytics.ts`
- `src/components/ChartsComponent/InsightsCharts.tsx`
- `src/app/page.tsx`
- `src/app/projects/[id]/page.tsx`

If analytics become more advanced, likely next schema work is:
- a habit completion event table
- a task activity/history table
- normalized daily aggregates if performance becomes an issue

## If You Need To Continue UI Work

Start with:
- `src/app/page.tsx`
- `src/components/counter-with-icon.tsx`
- `src/components/ui/*`
- `src/app/globals.css`

Priority UI debt:
- unify the older `tasks` and `habits` pages with the newer dashboard styling
- reduce mixed old/new wording across pages
- clean up inconsistent spacing and naming

## Validation Status

Validated recently:
- targeted ESLint on touched TypeScript files
- `npx prisma validate`
- local seed execution through `npm run db:seed`

Not claimed:
- full repo lint clean
- full production build verification after every recent change

## Stop Point

Development currently stops at:
- dashboard and project-detail analytics working
- seeded local data available
- docs updated to reflect current structure

The next meaningful product decision is whether to keep analytics derived from existing records or introduce dedicated history tables.
