# LifeUp

LifeUp is a Next.js productivity app for managing projects, habits, tasks, and personal finance basics, with dashboard analytics layered on top of the current operational data.

## What Exists Now

The app currently supports:
- project creation and listing
- habit creation and editing inside projects
- task creation, completion, and listing
- pagination for project lists, task queues, and the habit tracker grid
- popup creation for projects, habits, and tasks across the main menu pages
- section navigation for dashboard, projects, habits, tasks, and finance
- simple email login with per-user project, habit, task, and finance data isolation
- task calendar menu for day-level planning
- task creation supports an optional scheduled hour, and the calendar shows tasks by time inside each day
- habit creation flows include daily/weekly frequency, and the habit tracker adds reminder time, completions, streaks, and statistics progress
- responsive layouts for mobile, tablet, and desktop screens
- updated theme palettes with compact swatch switching and stronger contrast
- Personal Financial Organizer MVP for:
  - income and expense tracking
  - spending categories
  - monthly budgets
  - planned expenses
  - savings goals
  - simple cash-flow insights
  - total tracked money, planned expense, and savings visualizations
  - monthly and yearly finance period tracking
  - editing and deleting finance records
- dedicated detail pages for habits and tasks
- persisted project and habit streaks derived from real task completion dates
- dashboard analytics for:
  - overall task completion
  - 7-day activity trend
  - project throughput
  - top-line finance income, expenses, and total cash
- calendar page for reviewing tasks by day and scheduling future tasks
- weekly organizer for planning the current Monday-to-Sunday week from today's date, with habits shown only on days that have a project focus and a popup for days with more than 5 habits
- dashboard includes a daily/weekly tracker snapshot instead of the project throughput graph
- project detail analytics for:
  - project-level activity trend
  - habit performance
- habit detail analytics for:
  - habit-specific activity trend
  - linked task completion
- task detail analytics for:
  - project context activity trend
  - parent project completion snapshot

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
  - root layout, providers, app shell, theme bootstrap script
- `src/components/app-shell.tsx`
  - authenticated app chrome, sidebar/header, logout action
- `src/app/ThemeSwitcher.tsx`
  - updates theme hue/chroma values in CSS variables and stores theme in `localStorage`
- `src/app/globals.css`
  - theme tokens, chart tokens, global UI variables

### Pages

- `src/app/page.tsx`
  - main dashboard
- `src/app/login/page.tsx`
  - simple email login page
- `src/app/projects/[id]/page.tsx`
  - project detail page with project-specific analytics
- `src/app/projects/page.tsx`
  - project index page with throughput overview and navigation into project detail
- `src/app/habits/page.tsx`
  - habit index page with streak, check-in, and linked-task analytics
- `src/app/habits/[id]/page.tsx`
  - habit detail page with linked tasks and habit-specific charts
- `src/app/habit-tracker/page.tsx`
  - habit tracker page with a recent-day completion grid
- `src/app/tasks/page.tsx`
  - task index page with queue overview, creation form, and task list
- `src/app/tasks/[id]/page.tsx`
  - task detail page with parent project context
- `src/app/calendar/page.tsx`
  - task calendar page for day-level planning, scheduled task hours, and future task creation
- `src/app/weekly-organizer/page.tsx`
  - current-week organizer for distributing existing projects and habits by day, editing project cards, hiding habits on days without a project focus, opening a habit popup when a day has more than 5 habits, and keeping task progress visible
- `src/app/finance/page.tsx`
  - Personal Financial Organizer MVP with summary, one-popup creation, visual totals, recent transactions, plans, and insights

### Charts and Analytics

- `src/components/ChartsComponent/InsightsCharts.tsx`
  - activity trend, project throughput, habit performance charts
- `src/components/ChartsComponent/RadialChart.tsx`
  - radial progress summary
- `src/components/entity-create-dialog.tsx`
  - shared popup creation flow for projects, habits, and tasks
- `src/components/overview-panel.tsx`
  - reusable overview/focus layout used by the main menu pages
- `src/components/task-calendar.tsx`
  - task calendar for day-level task review and future task scheduling
- `src/components/habit-tracker.tsx`
  - recent-day habit completion grid with check-in toggles
- `src/lib/analytics.ts`
  - shared metric builders for charts
- `src/lib/weekly-organizer.ts`
  - current-week date helpers and weekly project/day planning derivations
- `src/lib/finance.ts`
  - shared finance calculations for cash flow, budgets, savings progress, and insights

### Data Fetching

- `src/hooks/useProjectMutations.ts`
- `src/hooks/useHabitMutations.ts`
- `src/hooks/useTaskMutation.ts`
- `src/hooks/useFinanceMutations.ts`
  - React Query hooks for fetching and mutations

- `src/services/ProjectsServices.ts`
- `src/services/HabitsServices.ts`
- `src/services/TasksServices.ts`
- `src/services/FinanceServices.ts`
  - API client wrappers

### API

- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.tsx`
- `src/app/api/habits/route.ts`
- `src/app/api/habits/[id]/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/finance/route.ts`
- `src/app/api/finance/categories/route.ts`
- `src/app/api/finance/transactions/route.ts`
- `src/app/api/finance/budgets/route.ts`
- `src/app/api/finance/recurring-bills/route.ts`
- `src/app/api/finance/planned-expenses/route.ts`
- `src/app/api/finance/savings-goals/route.ts`

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
  - owns many projects and finance records
- `Project`
  - belongs to user
  - owns many habits
  - owns many tasks
- `Habit`
  - belongs to project
  - owns many tasks
  - stores streak, daily/weekly frequency, reminder time, and `history` array used by current analytics and habit tracking
- `Task`
  - belongs to project
  - optionally belongs to habit
  - stores `completed`, `date`, `dateFinish`, and scheduled `time`
- `FinancialCategory`
  - belongs to user
  - organizes income and expense records
- `FinancialTransaction`
  - belongs to user and category
  - stores income or expense records
- `Budget`
  - belongs to user and category
  - stores monthly category limits
- `RecurringBill`
  - belongs to user and category
  - legacy recurring bill model retained for existing data compatibility
- `PlannedExpense`
  - belongs to user and category
  - tracks expected one-time spending until it is marked done
- `SavingsGoal`
  - belongs to user
  - tracks current amount against a target
- `SavingsContribution`
  - belongs to user and savings goal
  - tracks each added cash entry so it can be edited or removed

Current Prisma relations use explicit cascade behavior for cleanup.
The finance dashboard read path tolerates databases that have not yet been
updated with the `SavingsContribution` table by returning existing savings
goals with an empty contribution history. Adding cash also falls back to
updating the savings goal total when that table is missing, but editable
contribution history still requires applying the current Prisma schema.

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

Backfill persisted streaks from existing task data:

```bash
npm run db:backfill-streaks
```

Validate Prisma:

```bash
npx prisma validate
```

Apply the current Prisma schema to a local database after schema changes:

```bash
npx prisma db push
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
- dashboard top line includes current finance income, expenses, and total cash from the finance summary
- login stores the current user in an HTTP-only cookie and API routes scope records to that user
- the dashboard greeting shows the logged-in user name or email prefix instead of a fixed placeholder
- calendar page shows task names in a large month view, opens selected-day tasks in a popup, supports task edit/delete, and creates multiple future-dated tasks from an Add task button
- weekly organizer builds the current week from today's date, distributes existing projects and habits by day, supports adding existing projects to weekdays, and keeps task progress visible as a tracker
- calendar tasks can carry scheduled hours and are shown in time order inside day cells and day detail popups
- habit tracker page creates habits, marks daily progress, stores daily/weekly frequency and reminder time, and shows streak/calendar/statistics progress
- chart colors now follow the active app theme
- project and habit charts use combined bars and lines for workload, completion rate, check-ins, and streak context
- project and habit chart axes use compact initials/starting letters with horizontal overflow for crowded datasets
- dashboard layout is more structured than before
- app shell, overview panels, charts, lists, dialogs, and detail pages are responsive across smaller and larger screens
- theme colors now use richer primary, secondary, and accent tokens so the sidebar, buttons, cards, and charts read more clearly
- dashboard and section-page creation are consolidated into a shared popup so overview pages stay lighter
- dashboard now uses a daily/weekly tracker snapshot for today's scheduled tasks and habit cadence instead of a project throughput chart
- finance MVP is available from the sidebar and persists finance records through Prisma
- finance creation now uses a single Add record popup for transactions, planned expenses, savings goals, budgets, and categories
- finance displays total tracked money from real transactions plus savings, planned expenses, savings totals, and progress charts
- marking a planned expense done creates one expense transaction and removes that plan from the active list
- savings goals keep a recent added-cash history with edit/delete controls for each contribution
- finance totals, insights, and recent transactions can switch between monthly and yearly tracking
- finance records can be edited or deleted from the Finance management section; default categories are protected from deletion
- section pages for projects, habits, and tasks now follow the newer dashboard structure
- project detail analytics are present and usable
- habit and task detail pages are present and usable
- project and habit streak persistence now derives from stored completed task dates
- seed data is available for testing visual states
- project lists and the habit tracker grid paginate so larger local datasets remain usable

What is still incomplete or older:
- login is intentionally simple and email-only; there is no password, OAuth, or production-grade session hardening yet
- some lower-level list item components still carry older interaction patterns internally
- the analytics layer is derived from task dates and habit history arrays, not from a dedicated historical events table
- existing databases may need the streak backfill command run once if they contain older fake or drifted streak values
- the repository still has an older global lint baseline outside the touched files

## Where To Continue

Recommended next work order:

1. Replace simple email login with a production-grade auth/session path when needed.
2. Normalize historical tracking if analytics need to become more accurate.
3. Continue unifying the remaining lower-level components with the newer dashboard/project-detail design and data patterns.
4. Add validation and cleaner error handling to API routes.
5. Reduce the old lint baseline incrementally in files that are actively touched.

## Handoff

For active repo rules and implementation expectations, read `AGENTS.md`.

For project status, completed work, and next-step mapping, read `ARCHIVE.md`.
