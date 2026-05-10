# ARCHIVE.md

This file is the running handoff log for the repository.
If a new agent needs to know where work stopped, start here.

## Current Snapshot

Date of latest update:
- 2026-05-02

Current app position:
- dashboard exists and is actively used as the main overview
- dashboard top line now includes current finance income, expenses, and total cash
- essential sidebar menu now focuses on dashboard, projects, tasks, inbox, notes, habits, and finance
- secondary planning tools now contain the task calendar, weekly plan, and habit tracker
- all habit creation flows now ask for daily or weekly frequency
- simple email login now gates the app and scopes projects, habits, tasks, and finance records to the logged-in user
- dashboard greeting now resolves the current logged-in user's name from the session instead of a fixed placeholder
- dashboard and main section pages now use a lighter reusable overview layout with popup creation
- shared app shell, charts, lists, cards, and main page layouts now respond better across phone, tablet, and desktop widths
- theme system now has modern Grove, Harbor, Vault, Sentinel, and Graphite palettes plus light/night mode with improved contrast
- section pages exist for projects, habits, and tasks
- inbox and notes sections now exist and connect capture/knowledge records to projects, habits, and tasks
- finance section exists as a Phase 1 Personal Financial Organizer MVP
- finance now surfaces a total tracked money view from real transactions plus savings, monthly/yearly tracking, planned cash-flow visualization, savings visualization, and single-popup creation flow
- finance now also has a separate Account Spend Tracker at `/finance/tracker` for CSV or OFX imports tagged as `Extrato` or `Fatura`, not associated with Financial Organizer records, split rows by month, and can be deleted with their rows
- finance dashboard reads now fall back to a non-editable saved-balance contribution row if an older database has not yet received the `SavingsContribution` table, and add-cash falls back to updating the savings total
- planned income and expenses can be marked done from finance management, which creates one matching transaction and removes the plan
- savings goals now include an add-cash field, and savings are shown outside the transaction-tracked total
- savings added cash is now persisted as contribution history, with recent entries editable and removable from the savings section
- project detail page exists and includes analytics
- habit and task detail pages now exist and include contextual analytics
- local seed data exists for visual/testing flows
- Prisma relations were hardened with cascade behavior
- chart colors now follow the active app theme
- task creation supports optional scheduled hours, and the calendar displays tasks by time inside each day
- Pomodoro page now saves work/study focus sessions against tasks, supports work/break cycles, keeps the countdown state while navigating away, and rolls time through projects and habits
- Inbox page captures unprocessed ideas, reminders, study topics, and loose work, paginates the queue, supports popup editing with project/habit/task linking, and can convert items into notes
- Notes page stores searchable categorized notes with pagination, popup editing, and optional project, habit, and task links
- dashboard now shows a daily/weekly tracker snapshot instead of the project throughput graph
- weekly organizer page derives Monday-to-Sunday weeks from the selected date, persists one habit board per user/week, supports previous/next week navigation, and schedules multiple habits into hourly cells from 00:00 through 23:00
- project lists and the habit tracker grid now paginate
- project and habit charts now use combined bars and lines for workload, completion rate, check-ins, and streak context
- project and habit chart axes now use compact labels and horizontal overflow for crowded datasets

## Completed Recently

### Dashboard analytics and layout

Implemented:
- simple authenticated app shell with login/logout
- main dashboard metrics
- current finance income, expenses, and total cash in the dashboard top line
- calendar page with a large month view, task names on each day, selected-day popup with edit/delete actions, and button-triggered future-date task creation
- weekly organizer page for database-backed weekly habit time planning
- scheduled task hours on task creation/editing, with calendar day cells and day detail popups sorted by task time
- pagination on the project list and habit tracker grid
- richer combined charts for project throughput, habit performance, task-by-project, and activity trend sections
- habit tracker page with habit creation, a 21-day completion grid, daily/weekly cadence, reminder time, current streaks, calendar progress, and basic statistics
- radial completion chart
- 7-day activity trend chart
- project throughput chart
- structured dashboard layout with clearer sections
- shared popup creation flow for projects, habits, and tasks from main menu pages
- reusable header and overview panel for Dashboard, Projects, Habits, and Tasks
- responsive shell/content behavior, safer chart sizing, wrapping list controls, and mobile-friendly action rows

Main files:
- `src/app/login/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/components/app-shell.tsx`
- `src/middleware.ts`
- `src/app/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/habits/page.tsx`
- `src/app/habit-tracker/page.tsx`
- `src/app/tasks/page.tsx`
- `src/app/calendar/page.tsx`
- `src/app/weekly-organizer/page.tsx`
- `src/app/api/weekly-plan/route.ts`
- `src/app/api/weekly-plan/slots/route.ts`
- `src/app/api/weekly-plan/slots/[id]/route.ts`
- `src/hooks/useWeeklyPlanMutations.ts`
- `src/services/WeeklyPlanServices.ts`
- `src/components/task-calendar.tsx`
- `src/components/entity-create-dialog.tsx`
- `src/components/menu-page-header.tsx`
- `src/components/overview-panel.tsx`
- `src/components/habit-tracker.tsx`
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

### Section navigation and detail routes

Implemented:
- sidebar navigation now groups essential routes above secondary planning tools
- new projects index page with project throughput overview
- inbox page with fast capture, status filtering, pagination, linked entity display, popup view/edit, project/habit/task linking, note conversion, completion, and deletion
- notes page with search, categories, pagination, creation, popup view/edit, project/habit/task linking, and deletion
- habits index page with streak/check-in analytics and drill-down links
- tasks index page with queue analytics and improved creation flow
- habit detail page with linked task completion and habit activity charts
- task detail page with parent-project activity context
- Pomodoro page with persisted task-linked sessions, configurable work/break cycles, navigation-persistent countdown state, work/study totals, project/habit time summaries, productivity history, and task/project/habit detail focus totals

Main files:
- `src/components/app-sidebar.tsx`
- `src/app/projects/page.tsx`
- `src/app/inbox/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/habits/page.tsx`
- `src/app/tasks/page.tsx`
- `src/app/habits/[id]/page.tsx`
- `src/app/tasks/[id]/page.tsx`
- `src/app/pomodoro/page.tsx`
- `src/components/pomodoro-panel.tsx`
- `src/app/api/pomodoro/route.ts`
- `src/app/api/inbox/route.ts`
- `src/app/api/inbox/[id]/route.ts`
- `src/app/api/notes/route.ts`
- `src/app/api/notes/[id]/route.ts`
- `src/hooks/useInboxMutations.ts`
- `src/hooks/useNoteMutations.ts`
- `src/services/InboxServices.ts`
- `src/services/NotesServices.ts`
- `src/hooks/usePomodoroMutations.ts`
- `src/services/PomodoroServices.ts`
- `src/lib/pomodoro.ts`
- `src/app/finance/page.tsx`
- `src/app/habits/components/InputHabit.tsx`
- `src/app/tasks/components/TaskInput.tsx`

### Streak persistence hardening

Implemented:
- new habits no longer start with fake streak/history values
- project streak is recomputed from persisted completed task dates when tasks change
- habit history and streak are recomputed from persisted completed habit-task dates when tasks change
- one-time backfill script is available for existing databases with drifted streak values

Main files:
- `src/app/api/habits/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `prisma/backfill-streaks.ts`
- `package.json`

### Theme-aware charts

Implemented:
- chart tokens now derive from theme hue/chroma variables
- graphs update visually when theme changes
- app theme tokens now include primary, secondary, and accent hues for clearer sidebar, card, button, and chart contrast
- theme switcher is now a compact swatch control for the responsive header

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
- added `InboxItem` and `Note` models with user ownership and optional project, habit, and task links

Main file:
- `prisma/schema.prisma`

### Personal Financial Organizer Phase 1

Implemented:
- finance menu entry and `/finance` page
- persisted finance categories, transactions, budgets, recurring bills, planned income/expense records, savings goals, summaries, and notifications schema
- default finance categories generated on first finance dashboard load
- finance summary calculations for income, expenses, net cash flow, budgets, planned income and expenses, savings progress, and basic insights
- legacy recurring bill persistence remains for compatibility, but bills are no longer part of the visible finance workflow
- create flows for transactions, custom categories, monthly budgets, planned income and expenses, and savings goals
- single Add record popup that switches between transaction, planned income/expense, savings, budget, and category creation
- visual planned cash-flow, savings, and total money sections on the finance page
- planned income/expense completion creates a matching transaction, then removes that plan so it cannot be applied twice
- savings contributions persist each added cash entry and update the parent goal total transactionally on create, edit, and delete
- savings contributions can be added directly to a goal and are included in total tracked money
- finance dashboard loading and add-cash remain compatible with existing databases that still need `npx prisma db push` for the savings contribution table, with saved balances shown as non-editable legacy rows
- monthly/yearly period selector for finance totals, insights, and recent transaction history
- edit and delete flows for finance transactions, categories, budgets, planned income/expense records, and savings goals
- default finance categories are protected from deletion
- account spend tracker imports CSV files with `tipo`, `Data`, `valor`, and `descricao` columns or OFX files with equivalent transaction tags into dedicated tables, preserves signed amounts, supports import deletion, reviews rows with month filtering plus database-backed pagination, and charts monthly credits and debits

Main files:
- `prisma/schema.prisma`
- `src/app/finance/page.tsx`
- `src/app/api/finance/route.ts`
- `src/app/api/finance/categories/route.ts`
- `src/app/api/finance/transactions/route.ts`
- `src/app/api/finance/budgets/route.ts`
- `src/app/api/finance/recurring-bills/route.ts`
- `src/app/api/finance/planned-expenses/route.ts`
- `src/app/api/finance/savings-goals/route.ts`
- `src/app/api/finance/categories/[id]/route.ts`
- `src/app/api/finance/transactions/[id]/route.ts`
- `src/app/api/finance/budgets/[id]/route.ts`
- `src/app/api/finance/recurring-bills/[id]/route.ts`
- `src/app/api/finance/planned-expenses/[id]/route.ts`
- `src/app/api/finance/savings-goals/[id]/route.ts`
- `src/app/finance/components/FinanceRecordActions.tsx`
- `src/hooks/useFinanceMutations.ts`
- `src/services/FinanceServices.ts`
- `src/lib/finance.ts`

### Account Spend Tracker

Implemented:
- separate `/finance/tracker` page outside the Financial Organizer workflow
- named CSV or OFX imports with required `tipo`, `Data`, `valor`, and `descricao` fields
- multi-month files are accepted and each row is saved under its own statement month
- statement type split for `Extrato` and `Fatura`, selectable on import and on the tracker view
- CSV parsing for comma or semicolon delimiters, Brazilian or ISO dates, and decimal comma values
- OFX parsing from `TRNTYPE`, `DTPOSTED`, `TRNAMT`, and `MEMO`/`NAME`
- signed amount totals where negative values subtract and positive values add
- import deletion through the tracker page, cascading associated rows
- compact tracker UI with import in a popup, credit/debit row badges, and separate income/expense charts fed by server-side daily aggregates
- dedicated `AccountSpendImport` and `AccountSpendEntry` tables with user ownership
- denormalized month indexing for fast month filtering and paginated row reads
- batched `createMany` inserts so larger CSV files avoid per-row database writes

Main files:
- `prisma/schema.prisma`
- `src/app/finance/tracker/page.tsx`
- `src/app/api/finance/spending-tracker/route.ts`
- `src/hooks/useFinanceMutations.ts`
- `src/services/FinanceServices.ts`

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

- login is simple and email-only, without password/OAuth/session rotation
- some older seed/dev assumptions remain in local seed data and docs, but primary app APIs now use the login cookie
- section pages are aligned, but some lower-level item components still reflect older implementation style
- analytics are currently derived from task timestamps and habit history arrays
- there is no dedicated historical events model yet
- existing environments still need `npm run db:backfill-streaks` once if they were populated before the streak fix
- existing environments should run `npx prisma db push` after schema changes such as `SavingsContribution`, planned income/expense type tracking, `PomodoroSession`, `InboxItem`, `Note`, and weekly plan tables; finance reads and add-cash stay usable before the savings migration, but true contribution edit/delete history, Pomodoro persistence, Inbox, Notes, and persisted weekly habit boards require the current schema
- existing environments should also run `npx prisma db push` for the account spend tracker tables before importing CSV or OFX files
- repo-wide lint baseline is still noisy outside recently touched files

## Recommended Next Steps

Recommended order:

1. Replace simple email login with a production-grade auth/session path when needed.
2. Decide whether analytics should keep using derived data or move to a dedicated history/event model.
3. Continue cleaning lower-level components so their interactions and styling fully match the new section pages.
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
- keep refining list item interactions so they feel as cohesive as the new section pages
- reduce mixed old/new wording across pages
- clean up inconsistent spacing and naming

## Validation Status

Validated recently:
- targeted ESLint on touched TypeScript files
- `npx prisma validate`
- `npm run build`
- local seed execution through `npm run db:seed`

Not claimed:
- full repo lint clean

## Stop Point

Development currently stops at:
- dashboard, section pages, and detail analytics working
- dashboard daily/weekly tracker snapshot replacing the project throughput graph
- scheduled task hours shown in the calendar daily view
- weekly organizer available for planning current, previous, and next weeks through persisted hourly habit boards
- streak persistence logic corrected for new and updated records
- seeded local data available
- docs updated to reflect current structure

The next meaningful product decision is whether to keep analytics derived from existing records or introduce dedicated history tables.
