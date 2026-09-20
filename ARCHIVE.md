# ARCHIVE.md

Running handoff log for LifeUp.

## Current Snapshot

Date of latest update:
- 2026-09-20

Current app position:
- `/` is a full-viewport Goal dashboard.
- `/goals` is the Goal management page.
- main Life domain is `User -> Goal`.
- Dashboard uses only Goals for main metrics and content.
- Goal list scrolls internally; page-level vertical scroll is disabled by layout.
- Inbox is independent.
- Notes are independent.
- Pomodoro is independent and study-subject based.
- Study and finance areas remain available.
- LifeHabit remains a separate legacy quit-habit tool, outside main navigation and not integrated with Goal.

## Completed Recently

### Goal Refactor

Implemented:
- added `GoalStatus` and `Goal` to Prisma.
- added `User.goals`.
- removed persisted Project, Habit, Task, and Weekly Plan models.
- removed old main-Life routes, APIs, services, hooks, store, calendar, weekly planner, streak helpers, and creation dialog.
- added authenticated Goal CRUD API.
- added `GoalServices`.
- added `useGoals`.
- added Goal dashboard and management UI.
- rewired sidebar to Life Dashboard, Goals, Inbox, Notes, Finance, Spend Tracker, and Study tools.
- decoupled Notes from old entity links.
- decoupled Inbox from old entity links.
- removed Pomodoro task relation.
- updated seed data to create Goals plus Study demo data.
- added specs under `specs/goal-refactor/`.

Main files:
- `prisma/schema.prisma`
- `src/types/Goal.ts`
- `src/lib/goals.ts`
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/services/GoalServices.ts`
- `src/hooks/useGoals.ts`
- `src/components/goals/GoalBoard.tsx`
- `src/app/page.tsx`
- `src/app/goals/page.tsx`
- `src/components/app-sidebar.tsx`
- `src/app/inbox/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/api/inbox/*`
- `src/app/api/notes/*`
- `src/app/api/pomodoro/*`
- `prisma/seed.ts`
- `README.md`
- `ARCHIVE.md`

## Current Architecture Notes

Goal flow:

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

Dashboard metrics:
- active Goals
- completed Goals
- average progress
- Goals due soon

## Migration Note

Spec strategy is `Project -> Goal` for useful data only:
- title
- description, if present
- due date, if present
- color
- initial progress only during migration if old data is available

No automatic Habit or Task migration into Goal.

## Validation Status

Validated:
- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npx prisma db push --accept-data-loss` on local database
- authenticated Goal CRUD over HTTP on local dev server

## Stop Point

Development currently stops at:
- Goal domain implemented.
- old main-Life hierarchy removed from active app code.
- docs and specs updated.
- validation passed.
