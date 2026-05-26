# LifeUp

LifeUp is a Next.js productivity app for managing projects, habits, tasks, and personal finance basics, with dashboard analytics layered on top of the current operational data.

## What Exists Now

The app currently supports:
- project creation and listing
- habit creation and editing inside projects
- task creation, completion, and listing
- pagination for project lists and task queues
- popup creation for projects, habits, and tasks across the main menu pages
- essential sidebar navigation for dashboard, projects, inbox, notes, and finance; habits and tasks are reached through projects
- simple email login with per-user project, habit, task, and finance data isolation
- secondary planning tools for app streak tracking, task calendar, and weekly planning
- study records for subjects, planned weekly hours, and repeating day/hour study blocks in the data layer
- dedicated Study Tools workspace with a study dashboard and subject-based mistake log
- Study Plan page for week-specific planned study blocks and manual studied-time registration
- Study Plan registers actual study sessions from begin/finish datetimes, calculates studied duration, compares planned versus studied hours, and filters the week board by subject
- mistake log records questions, user's answer, correct answer, error type, correct rule, trap word, review date, and unresolved/reviewed/mastered status
- weekly organizer focuses on personal habit/task planning only
- task creation supports an optional scheduled hour, and the calendar shows tasks by time inside each day
- task queues use responsive cards with pending-first sorting, status counters, and compact pagination
- Pomodoro page organizes work/study focus cycles with breaks, task association, progress, navigation-persistent countdown state, and productivity history by project and habit
- Inbox page captures temporary ideas, reminders, study topics, and loose work, paginates the queue, and uses a popup to view/edit links to projects, habits, tasks, or converted notes
- Notes page stores searchable long-term notes with pagination, view/edit popups, categories, and optional project, habit, and task context
- habit creation flows include daily/weekly frequency, reminder time, and secondary habit statistics
- responsive layouts for mobile, tablet, and desktop screens
- updated modern Grove, Harbor, Vault, Sentinel, and Graphite theme palettes with compact swatch switching, light/night mode, and stronger contrast
- Personal Financial Organizer MVP for:
  - income and expense tracking
  - spending categories
  - monthly budgets
  - planned monthly income and expenses
  - savings goals
  - simple cash-flow insights
  - total tracked money, planned cash-flow, and savings visualizations
  - monthly and yearly finance period tracking
  - editing and deleting finance records
- separate Account Spend Tracker for importing and deleting bank CSV or OFX files as `Extrato` or `Fatura`, saving rows outside the Financial Organizer, reviewing month-paginated signed account movement, and visualizing credit/debit totals
- dedicated detail pages for habits and tasks
- persisted project streaks derive from daily completed-task targets, while habit streaks remain secondary check-in analytics
- dashboard analytics for:
  - overall task completion
  - 7-day activity trend
  - project throughput
  - top-line finance income, expenses, and total cash
- save, update, and delete actions show toast feedback and refresh affected lists/details immediately
- calendar page for reviewing tasks by day and scheduling future tasks
- weekly organizer for creating database-backed Monday-to-Sunday habit boards with previous/next navigation and hourly scheduling from 00:00 through 23:00
- weekly organizer focuses on selected-week habit/task planning
- dashboard includes a daily/weekly tracker snapshot instead of the project throughput graph
- dashboard keeps project access summarized and leaves the full project list on the Projects page
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
  - project detail page with tabbed habits/tasks boards above project-specific analytics
- `src/app/projects/page.tsx`
  - project index page with throughput overview and navigation into project detail
- `src/app/habits/page.tsx`
  - habit index page with streak, check-in, and linked-task analytics
- `src/app/habits/[id]/page.tsx`
  - habit detail page with linked tasks and habit-specific charts
- `src/app/habit-tracker/page.tsx`
  - app tracker page for project daily streak targets and today's task progress
- `src/app/tasks/page.tsx`
  - task index page with the task queue prioritized above summaries and charts
- `src/app/inbox/page.tsx`
  - fast capture page for unprocessed ideas, reminders, study topics, and loose work with paginated cards, project/habit/task links, popup editing, and note conversion
- `src/app/notes/page.tsx`
  - searchable paginated notes library with categories, popup editing, and optional project, habit, and task links
- `src/app/pomodoro/page.tsx`
  - Pomodoro focus page with work/study cycles, break planning, task association, progress, navigation-persistent countdown state, and productivity history
- `src/app/tasks/[id]/page.tsx`
  - task detail page with parent project context
- `src/app/calendar/page.tsx`
  - task calendar page for day-level planning, scheduled task hours, and future task creation
- `src/app/weekly-organizer/page.tsx`
  - weekly board for personal habit/task slots with a restored planning hero
- `src/app/study/page.tsx`
  - study dashboard for review pressure, weak subjects, due mistakes, subjects, and scheduled study hours
- `src/app/study/mistakes/page.tsx`
  - subject-based mistake log with search, filters, review dates, status changes, and edit/delete dialogs
- `src/app/study/planner/page.tsx`
  - week-specific study board with planned blocks, manual studied sessions, subject filtering, and planned-vs-actual totals
- `src/app/finance/page.tsx`
  - Personal Financial Organizer MVP with summary, one-popup creation, visual totals, recent transactions, plans, and insights
- `src/app/finance/tracker/page.tsx`
  - account spend tracker for importing or deleting CSV or OFX statements as `Extrato` or `Fatura`, splitting rows by their own month, reviewing saved statement rows with database-backed pagination, and charting monthly credits and debits

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
  - legacy recent-day habit completion grid component retained for older habit check-in surfaces
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
- `src/hooks/useInboxMutations.ts`
- `src/hooks/useNoteMutations.ts`
- `src/hooks/useWeeklyPlanMutations.ts`
  - React Query hooks for fetching and mutations

- `src/services/ProjectsServices.ts`
- `src/services/HabitsServices.ts`
- `src/services/TasksServices.ts`
- `src/services/FinanceServices.ts`
- `src/services/InboxServices.ts`
- `src/services/NotesServices.ts`
- `src/services/WeeklyPlanServices.ts`
  - API client wrappers

### API

- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.tsx`
- `src/app/api/habits/route.ts`
- `src/app/api/habits/[id]/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/inbox/route.ts`
- `src/app/api/inbox/[id]/route.ts`
- `src/app/api/notes/route.ts`
- `src/app/api/notes/[id]/route.ts`
- `src/app/api/weekly-plan/route.ts`
- `src/app/api/weekly-plan/slots/route.ts`
- `src/app/api/weekly-plan/slots/[id]/route.ts`
- `src/app/api/study-subjects/route.ts`
- `src/app/api/study-subjects/[id]/route.ts`
- `src/app/api/study-schedule/route.ts`
- `src/app/api/study-plan/route.ts`
- `src/app/api/study-plan/blocks/route.ts`
- `src/app/api/study-plan/blocks/[id]/route.ts`
- `src/app/api/study-sessions/route.ts`
- `src/app/api/study-sessions/[id]/route.ts`
- `src/app/api/study-mistakes/route.ts`
- `src/app/api/study-mistakes/[id]/route.ts`
- `src/app/api/pomodoro/route.ts`
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
- `src/app/api/finance/spending-tracker/route.ts`

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
  - stores a `dailyStreakTarget`, current project streak, and last qualifying activity date
- `Habit`
  - belongs to project
  - owns many tasks
  - stores secondary streak/check-in analytics, daily/weekly frequency, reminder time, and `history` array used by current analytics and habit tracking
- `Task`
  - belongs to project
  - optionally belongs to habit
  - stores `completed`, `date`, `dateFinish`, and scheduled `time`
- `WeeklyPlanBoard`
  - belongs to user
  - stores one habit schedule board per `weekStartKey`
- `WeeklyPlanSlot`
  - belongs to a weekly board
  - stores one `dayIndex` and `hour` cell
- `WeeklyPlanSlotHabit`
  - joins scheduled hourly slots to one or more habits
- `StudySubject`
  - belongs to user and stores a subject name, color, notes, and planned weekly study hours
- `StudyScheduleBlock`
  - belongs to user and study subject, and stores repeating weekly day/hour study blocks
- `StudyPlanBoard`
  - belongs to user and stores one study planning board per `weekStartKey`
- `StudyPlanBlock`
  - belongs to a study plan board and subject, and stores concrete weekday, start time, duration, and optional notes
- `StudySession`
  - belongs to user and study subject, and stores begin time, finish time, calculated duration minutes, and optional notes
- `StudyMistake`
  - belongs to user and study subject, and stores question, user's answer, correct answer, error type, correct rule, trap word, review date, and review status
- `InboxItem`
  - belongs to user
  - stores temporary capture records with type, status, content, and optional project, habit, task, or note links
- `Note`
  - belongs to user
  - stores searchable long-term content with optional category and project, habit, or task links
- `PomodoroSession`
  - belongs to user and task
  - stores completed work or study focus blocks so task time rolls up through project and habit context
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
  - tracks expected one-time income or spending until it is marked done
- `SavingsGoal`
  - belongs to user
  - tracks current amount against a target
- `SavingsContribution`
  - belongs to user and savings goal
  - tracks each added cash entry so it can be edited or removed
- `AccountSpendImport`
  - belongs to user
  - stores a named CSV or OFX import for account-spending visualization
- `AccountSpendEntry`
  - belongs to user and an account spend import
  - stores each imported row with `sourceType`, `type`, signed amount, description, and denormalized `month` for fast month/type filtering and pagination

Current Prisma relations use explicit cascade behavior for cleanup.
The finance dashboard read path tolerates databases that have not yet been
updated with the `SavingsContribution` table by returning existing savings
goals with an empty contribution history. Adding cash also falls back to
updating the savings goal total when that table is missing; in that older
database mode, the UI shows the saved balance as a non-editable recent row.
Editable contribution history still requires applying the current Prisma schema.
Planned income also requires the current schema because planned records now
store whether they are income or expense.
Inbox, Notes, and the weekly habit board require the current Prisma schema
because they add their own persisted tables plus optional links back to
projects, habits, and tasks.
Study subjects, repeating study schedule blocks, and week-specific study plan
boards also require the current Prisma schema before study planning can persist
weekly routines and concrete planned blocks.
Study mistakes also require the current Prisma schema before the mistake log can
persist review records.
The account spend tracker also requires the current schema because it stores
monthly CSV/OFX imports and their paginated rows in dedicated tables outside the
Financial Organizer records.

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
- client API reads bypass browser caching, and mutation hooks await affected React Query invalidations so saved records appear without leaving and returning to a page
- app-level toast feedback is wired through React Query mutations for save, update, delete, and failed actions
- login stores the current user in an HTTP-only cookie and API routes scope records to that user
- the dashboard greeting shows the logged-in user name or email prefix instead of a fixed placeholder
- calendar page shows task names in a large month view, opens selected-day tasks in a popup, supports task edit/delete, and creates multiple future-dated tasks from an Add task button
- weekly organizer builds Monday-to-Sunday habit boards from the selected week, persists them per user, supports previous/next week navigation, and schedules multiple habits into hourly cells from 00:00 through 23:00
- weekly organizer is dedicated to personal habit/task planning; study review lives under Study Tools
- calendar tasks can carry scheduled hours and are shown in time order inside day cells and day detail popups
- study plan planned blocks can be finished directly from the week board, prompting for actual minutes studied and saving that time under the block's subject
- dashboard shows study mistake pressure with a weak-subject chart and paginated due-review queue
- mistake log shows paginated weak-subject and due-review panels above the detailed review queue
- app tracker page shows project streak targets and today's task progress from completed tasks
- project streaks now count days where completed tasks in that project meet the project's daily target, defaulting to 1 completed task per day
- chart colors now follow the active app theme
- project and habit charts use combined bars and lines for workload, completion rate, check-ins, and streak context
- project and habit chart axes use compact initials/starting letters with horizontal overflow for crowded datasets
- dashboard layout is more structured than before
- app shell, overview panels, charts, lists, dialogs, and detail pages are responsive across smaller and larger screens
- theme colors now use richer primary, secondary, and accent tokens so the sidebar, buttons, cards, and charts read more clearly
- dashboard and section-page creation are consolidated into a shared popup so overview pages stay lighter
- dashboard now uses a daily/weekly tracker snapshot for today's scheduled tasks and habit cadence instead of a project throughput chart
- finance MVP is available from the sidebar and persists finance records through Prisma
- finance creation now uses a single Add record popup for transactions, planned income and expenses, savings goals, budgets, and categories
- finance displays total tracked money from real transactions plus savings, planned cash flow, savings totals, and progress charts
- marking a planned income or expense done creates one matching transaction and removes that plan from the active list
- savings goals keep a recent added-cash history with edit/delete controls for each contribution
- finance totals, insights, and recent transactions can switch between monthly and yearly tracking
- finance records can be edited or deleted from the Finance management section; default categories are protected from deletion
- finance account-spend tracking is intentionally separate from organizer transactions and imports CSV or OFX rows into dedicated tables by each row month
- section pages for projects, habits, and tasks now follow the newer dashboard structure
- Habit and task section pages still exist, but primary navigation now routes users through Projects before managing habits and tasks
- Inbox and Notes pages are available from the sidebar and connect captured information back to projects, habits, and tasks
- Pomodoro page includes task association, work/break cycles, study/work tracking, and productivity history by project and habit
- project detail analytics are present and usable
- habit and task detail pages are present and usable
- project streak persistence now derives from stored completed task dates and each project's daily target
- seed data is available for testing visual states
- project lists paginate so larger local datasets remain usable

What is still incomplete or older:
- login is intentionally simple and email-only; there is no password, OAuth, or production-grade session hardening yet
- some lower-level list item components still carry older interaction patterns internally
- the analytics layer is derived from task dates and habit history arrays, not from a dedicated historical events table
- existing databases need `npx prisma db push` for `Project.dailyStreakTarget`, study subject tables, and repeating study schedule tables, then may need the streak backfill command run once if they contain older fake or drifted streak values
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
