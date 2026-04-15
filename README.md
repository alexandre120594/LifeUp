# LifeUp

LifeUp is a Next.js productivity app for managing projects, habits, and tasks, with dashboard analytics layered on top of the current operational data.

## What Exists Now

The app currently supports:
- project creation and listing
- habit creation and editing inside projects
- task creation, completion, and listing
- dashboard analytics for:
  - overall task completion
  - 7-day activity trend
  - project throughput
- project detail analytics for:
  - project-level activity trend
  - habit performance

There is also repeatable local seed data for testing charts and flows.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- TanStack Query
- Zustand
- Recharts

## Main File Map

### App Shell

- `src/app/layout.tsx`
  - root layout, providers, sidebar, header, theme bootstrap script
- `src/app/ThemeSwitcher.tsx`
  - updates theme hue/chroma values in CSS variables and stores theme in `localStorage`
- `src/app/globals.css`
  - theme tokens, chart tokens, global UI variables

### Pages

- `src/app/page.tsx`
  - main dashboard
- `src/app/projects/[id]/page.tsx`
  - project detail page with project-specific analytics
- `src/app/habits/page.tsx`
  - older habit page, currently less integrated than the project detail flow
- `src/app/tasks/page.tsx`
  - older task page, still contains development assumptions and is not the primary workflow

### Charts and Analytics

- `src/components/ChartsComponent/InsightsCharts.tsx`
  - activity trend, project throughput, habit performance charts
- `src/components/ChartsComponent/RadialChart.tsx`
  - radial progress summary
- `src/lib/analytics.ts`
  - shared metric builders for charts

### Data Fetching

- `src/hooks/useProjectMutations.ts`
- `src/hooks/useHabitMutations.ts`
- `src/hooks/useTaskMutation.ts`
  - React Query hooks for fetching and mutations

- `src/services/ProjectsServices.ts`
- `src/services/HabitsServices.ts`
- `src/services/TasksServices.ts`
  - API client wrappers

### API

- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.tsx`
- `src/app/api/habits/route.ts`
- `src/app/api/habits/[id]/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[id]/route.ts`

### Data Layer

- `prisma/schema.prisma`
  - source of truth for the current schema
- `src/lib/prisma.ts`
  - Prisma client bootstrap
- `src/generated/client`
  - generated Prisma client, do not edit manually

### Seed Data

- `prisma/seed.ts`
  - repeatable demo data for local testing

## Current Data Model

- `User`
  - owns many projects
- `Project`
  - belongs to user
  - owns many habits
  - owns many tasks
- `Habit`
  - belongs to project
  - owns many tasks
  - stores streak and `history` array used by current analytics
- `Task`
  - belongs to project
  - optionally belongs to habit
  - stores `completed`, `date`, `dateFinish`, and `time`

Current Prisma relations use explicit cascade behavior for cleanup.

## Local Development

Install:

```bash
npm install
```

Run app:

```bash
npm run dev
```

Run local seed:

```bash
npm run db:seed
```

Validate Prisma:

```bash
npx prisma validate
```

Targeted lint example:

```bash
npx eslint src/app/page.tsx
```

App URL:

- `http://localhost:3001`

## Current Seed Snapshot

The current seed creates test data for the dev user `id = 1`:
- 3 projects
- 5 habits
- 9 tasks

Seeded project names:
- `Health Reset`
- `Frontend Mastery`
- `Language Sprint`

## Current State and Limits

What is stable enough to continue from:
- dashboard charts are wired through shared analytics helpers
- chart colors now follow the active app theme
- dashboard layout is more structured than before
- project detail analytics are present and usable
- seed data is available for testing visual states

What is still incomplete or older:
- authentication is not implemented; current code still relies on a dev user assumption
- some older pages and components are still inconsistent with the newer dashboard structure
- the analytics layer is derived from task dates and habit history arrays, not from a dedicated historical events table
- the repository still has an older global lint baseline outside the touched files

## Where To Continue

Recommended next work order:

1. Replace hardcoded user assumptions with a real auth/session path.
2. Normalize historical tracking if analytics need to become more accurate.
3. Unify older pages (`tasks`, `habits`) with the newer dashboard/project-detail design and data patterns.
4. Add validation and cleaner error handling to API routes.
5. Reduce the old lint baseline incrementally in files that are actively touched.

## Handoff

For active repo rules and implementation expectations, read `AGENTS.md`.

For project status, completed work, and next-step mapping, read `ARCHIVE.md`.
