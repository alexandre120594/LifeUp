# LifeUp

LifeUp is a Next.js productivity app whose main Life domain is now `Goal`.

## What Exists Now

- authenticated Goal dashboard
- Goal create, edit, progress, pause, complete, delete, and list flows
- independent Inbox capture
- independent Notes library
- independent Study workspace
- independent Study Focus Timer
- finance tools
- account spend tracker
- legacy/separate LifeHabit quit-habit tracker kept outside main navigation and not connected to Goal

## Main Domain

`User 1 -> N Goal`

Goal fields:
- `id`
- `userId`
- `title`
- `description`
- `status`
- `progress`
- `targetDate`
- `color`
- `createdAt`
- `updatedAt`

Goal status:
- `ACTIVE`
- `PAUSED`
- `COMPLETED`

Goal does not own subrecords, actions, checklists, or another hierarchy.

## Goal Flow

```text
UI
 ↓
useGoals
 ↓
GoalServices
 ↓
/api/goals
 ↓
Prisma
 ↓
Goal
```

## Main File Map

- `src/app/page.tsx`
  - full-viewport Goal dashboard
- `src/app/goals/page.tsx`
  - Goal management page
- `src/components/goals/GoalBoard.tsx`
  - Goal form, metrics, cards, and internal list scroll
- `src/hooks/useGoals.ts`
  - React Query Goal state and mutations
- `src/services/GoalServices.ts`
  - Goal API client
- `src/app/api/goals/route.ts`
  - `GET /api/goals`, `POST /api/goals`
- `src/app/api/goals/[id]/route.ts`
  - `GET`, `PATCH`, `DELETE /api/goals/:id`
- `src/types/Goal.ts`
  - Goal types
- `src/lib/goals.ts`
  - Goal input validation
- `prisma/schema.prisma`
  - source of truth for persistence

## Preserved Areas

- `src/app/inbox/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/pomodoro/page.tsx`
- `src/app/study/*`
- `src/app/finance/*`
- `src/app/life-habits/page.tsx`

Inbox, Notes, and Pomodoro are independent and do not require Goal IDs.

## Removed Main-Life Legacy

The old `Project -> Habit -> Task` chain is removed from the main Life domain.

Removed from active app code:
- old routes and APIs
- old services and hooks
- old weekly planner
- old calendar route
- old streak and planning helpers

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- TanStack Query
- Zustand
- Recharts

## Local Development

Install:

```bash
npm install
```

Run app:

```bash
npm run dev
```

Validate Prisma:

```bash
npx prisma validate
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed local data:

```bash
npm run db:seed
```

Build:

```bash
npm run build
```

App URL:
- `http://localhost:3001`

## Specs

Goal refactor specs live in `specs/goal-refactor/`.
