# AGENTS.md

This file defines the default development contract for the whole repository.
Scope: everything under the repo root.

## Objective

`LifeUp` is a Next.js productivity app centered on:
- Projects
- Habits
- Tasks
- Lightweight analytics derived from those records

Another agent should be able to continue work from here without rediscovering the system.

## Ground Truth Files

Before changing anything substantial, use these files to rebuild context:

- `README.md`
  - high-level architecture and current app map
- `ARCHIVE.md`
  - current status, recent completed work, open issues, and next steps
- `prisma/schema.prisma`
  - source of truth for relations and persisted shape
- `src/app/page.tsx`
  - current dashboard composition
- `src/app/projects/[id]/page.tsx`
  - current project-detail analytics flow
- `src/lib/analytics.ts`
  - shared analytics derivation logic

## Current Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- TanStack Query
- Zustand
- Recharts

Dev server:
- `npm run dev`
- app runs on `http://localhost:3001`

## Main Structure

- `src/app`
  - pages, layouts, route handlers
- `src/components`
  - reusable UI building blocks
- `src/components/ChartsComponent`
  - analytics and progress charts
- `src/hooks`
  - React Query hooks
- `src/services`
  - API wrappers
- `src/lib`
  - utilities, Prisma bootstrap, analytics helpers
- `src/types`
  - shared TypeScript interfaces
- `src/store`
  - Zustand stores
- `prisma`
  - schema and seed script
- `src/generated/client`
  - generated Prisma client, never edit manually

## Working Rules

### General

- Keep changes focused and reversible.
- Prefer fixing root causes instead of patching symptoms.
- Do not refactor unrelated areas just because they are imperfect.
- Do not edit generated Prisma client files.
- Do not add dependencies unless the feature clearly requires them.

### TypeScript and React

- Avoid `any`.
- Remove dead imports and dead state in files you touch.
- Reuse existing React Query and service patterns before inventing new fetch paths.
- Keep page-level metric shaping out of pages when it can live in `src/lib/analytics.ts`.
- Reuse chart primitives and shared card/layout patterns where possible.

### Prisma and API

- Make schema changes only in `prisma/schema.prisma`.
- Keep route filters aligned with service-layer and hook-layer parameters.
- Preserve data integrity when parent-child cleanup matters.
- When changing persisted behavior, update the markdown docs in the same task.

### Documentation

When meaningful behavior changes:
- update `README.md`
- update `ARCHIVE.md`
- update this file only if the repo contract or expected workflow changed

## Quality Bar

Run focused validation on touched areas when practical.

Useful commands:
- `npm run dev`
- `npm run lint`
- `npm run db:seed`
- `npx prisma validate`

If full-repo lint is already noisy, do not make that baseline worse.

## Current Known State

- Dashboard and project-detail analytics are active.
- Chart colors follow the current theme tokens.
- Seed data exists for local visual testing.
- The app still assumes a development user in some server logic.
- Older pages such as `src/app/tasks/page.tsx` and `src/app/habits/page.tsx` are not yet fully aligned with the newer dashboard patterns.

## Preferred Next Work Order

1. Replace dev-user assumptions with real auth/session context.
2. Normalize analytics history if the product needs more trustworthy time-series data.
3. Bring older pages and components into the same design/data architecture as the dashboard.
4. Improve API validation and error handling.
5. Reduce the older lint baseline gradually in touched files.

## Stop / Resume Rule

Before ending a task that changes behavior:
- leave `README.md` accurate
- leave `ARCHIVE.md` accurate
- leave a clear note of what remains unfinished

If you need to know where previous work stopped, start with `ARCHIVE.md`.
