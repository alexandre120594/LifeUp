# ARCHIVE.md

This file is the running handoff log for the repository.
If a new agent needs to know where work stopped, start here.

## Current Snapshot

Date of latest update:
- 2026-06-21

Current app position:
- `/` is the Life Dashboard and focuses on projects, routines, tasks, planning, and finance
- `/study` is the Study Dashboard and focuses on subjects, scheduled study hours, mistake review pressure, weak subjects, and question practice
- dashboard top line now includes current finance income, expenses, and total cash
- sidebar navigation is split into Life, Life Planning, and Study groups; habits and tasks are reached through project context
- Life Planning navigation contains the good/bad Habit Tracker, task calendar, and weekly plan; App Tracker still exists as a route but is no longer a primary sidebar item
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
- project detail pages now show habits and the task queue in tabs before analytics
- habit and task detail pages now exist and include contextual analytics
- local seed data exists for visual/testing flows
- Prisma relations were hardened with cascade behavior
- chart colors now follow the active app theme
- task creation supports optional scheduled hours, and the calendar displays tasks by time inside each day
- task queues now use responsive cards with status counters, metadata chips, and compact pagination
- Focus Timer now lives under Study, saves named standalone study sessions without project/task/habit association, supports focus/break cycles, and keeps the countdown state while navigating away
- Focus Timer now asks for name, subject, focus/break duration, cycles, and notes when starting; its side panel only summarizes time by subject
- Focus Timer history now filters by subject, supports editing saved session names and subjects, and supports deleting sessions with subject-hour totals refreshing after changes
- Study Dashboard now includes a Focus Timer graph grouped by subject
- Inbox page captures unprocessed ideas, reminders, study topics, and loose work, paginates the queue, supports popup editing with project/habit/task linking, and can convert items into notes
- Notes page stores searchable categorized notes with pagination, popup editing, and optional project, habit, and task links
- dashboard now shows a daily/weekly tracker snapshot instead of the project throughput graph
- dashboard no longer shows the full project list; project records live on the Projects page
- weekly organizer page derives Monday-to-Sunday weeks from the selected date, persists one habit board per user/week, supports previous/next week navigation, and schedules multiple habits into hourly cells from 00:00 through 23:00
- weekly organizer slot dialog now filters by project and can assign both habits and tasks to an hour
- weekly organizer is Life-planning only, with a restored hero and habit/task planning board
- Life Habit Tracker is available under Life Planning for independent good habit checkouts and bad habit days-without counters
- Study now has its own sidebar group, study dashboard, and subject-based mistake log for review workflows
- Study Plan is available as a Study menu page with week-specific planned blocks and manual studied-hour registration
- Study Plan now includes subject management for editing names, weekly hours, notes, and deleting subjects
- Study Plan now registers actual study sessions from begin/finish datetimes, calculates studied minutes, lets week board study entries and their matching question counts be edited/deleted in popups, compares planned versus studied hours, and filters the week board by subject
- Study Plan planned blocks can now be finished from the week board by entering actual studied minutes and optional question counts, which saves a studied session for that subject and lets the session plus matching question tracker entry be edited later from the board
- Study Plan block completion can now record aggregate total/right/wrong question counts, shows weekly question totals, and lets saved count entries be edited or deleted without changing existing mistake data
- Study Dashboard charts weak study subjects from logged mistakes and includes a due-review queue
- Study Dashboard charts day/week/month/year study question practice with right/wrong counts and accuracy; the Life Dashboard no longer includes study widgets
- Study Dashboard also charts registered right/wrong question totals by subject with current day, Monday-Sunday week, calendar month, calendar year, and single-subject filters, without changing saved practice records
- Questions by subject now renders every matching subject in one radar without pagination
- Question practice and Question accuracy now share the same day/week/month/year calendar filter
- Studied time by subject now includes configured subjects with zero registered study time
- mistake log now has paginated weak-subject and due-review panels in addition to the filterable detailed queue
- mistake log captures question, user's answer, correct answer, error type, correct rule, trap word, review date, and unresolved/reviewed/mastered status
- mistake log now supports Guided Correction for new wrong or doubtful-hit records, blocking reviewed/mastered status until microtopic, error reason, charged detail, memorization phrase, corrective action, and review date are saved
- legacy mistake records can now be manually sent to Guided Correction one by one without a bulk migration
- project lists now paginate
- project lists now include search, active/done filters, recent/progress/name sorting, progress bars, clearer project cards, and delete confirmation
- project and habit charts now use combined bars and lines for workload, completion rate, check-ins, and streak context
- project and habit chart axes now use compact labels and horizontal overflow for crowded datasets
- habit listing now filters by project, and task listing now filters by project and habit with summaries/charts scoped to those selections
- project streaks now use a per-project daily completed-task target, defaulting to 1, so task execution drives the main streak instead of requiring every habit to stay active
- mutation flows now force fresh API reads, await React Query invalidations, and show toast feedback for save, update, delete, and failed actions so edited content appears without leaving and returning to the page

## Completed Recently

### Life Planning good/bad habit tracker

Implemented:
- added `/life-habits` as a Life Planning page
- good habits have a one-tap daily checkout, streak, and total checkouts
- bad habits automatically count days since the last bad-habit reset
- bad habit cards include an `I did it` reset action and reset count
- tracker is independent from project habits, tasks, and weekly plan records
- sidebar Life Planning now includes Habit Tracker with a habit count badge

Main files:
- `prisma/schema.prisma`
- `src/app/life-habits/page.tsx`
- `src/app/api/life-habits/route.ts`
- `src/app/api/life-habits/[id]/route.ts`
- `src/hooks/useLifeHabitMutations.ts`
- `src/services/LifeHabitServices.ts`
- `src/components/app-sidebar.tsx`
- `README.md`
- `ARCHIVE.md`

### Study tools UX polish

Implemented:
- Focus Timer now saves sessions to a selected study subject and shows hours by subject
- Focus Timer includes quick subject creation without linking to projects, tasks, or habits
- Study Plan now has a Manage subjects popup for subject update and delete flows
- Study Dashboard now opens with visual action tiles for Study Plan, Mistake Log, and Focus Timer
- top-level study metrics now use compact visual cards
- question practice has a clearer accuracy summary with right/wrong totals and a progress bar
- question analytics now include a right/wrong radar comparison by subject with total and accuracy tooltips plus an empty state for periods or subjects without registrations
- Study Dashboard UX now groups actions and analytics into named sections, keeps filters beside their context, and uses ranked horizontal focus bars with totals, subject count, leader summary, and per-subject share tooltips
- subject question and focus charts now share a compact responsive two-column row on large screens, with matched heights and mobile stacking
- focus-by-subject uses thinner horizontal bars and five-subject pagination while totals and the leader summary continue to cover every subject
- Study Dashboard hero metrics prioritize questions today, seven-day accuracy, Study Plan time for the current week, due reviews, mastery, and active subjects in a responsive six-metric grid, alongside contextual next-action guidance and direct actions
- Study Dashboard subject-time analytics now derive from actual `StudySession` records created through Study Plan instead of Focus Timer sessions
- Focus Timer Hours by subject remains timer-specific and paginates three compact subject rows at a time
- Question practice and accuracy now share day/week/month/year calendar filtering
- Study Dashboard keeps all question subjects in one radar while studied-time subjects, due reviews, and subject pressure use compact in-card pagination
- due review and subject pressure are easier to scan, with subject pressure bars linked back to the mistake workflow
- Study Plan now has a cleaner control bar, separate planned-vs-studied and question-performance panels, and a responsive card-based week board
- Mistake Log create/edit/correction dialogs now use resilient long-text fields so pasted questions, answers, rules, and correction notes wrap and scroll without stretching the layout
- Add Mistake and Guided Correction dialogs now use clearer step-based sections, with Guided Correction explaining classify, diagnose, and remember/schedule steps
- Add Mistake and Guided Correction popups are wider and use shorter copy plus safer grids so fields do not overlap
- Select controls now constrain and truncate long selected values, preventing long subject/topic text from bleeding into neighboring fields

Main file:
- `src/app/study/page.tsx`
- `src/app/study/planner/page.tsx`
- `src/app/study/mistakes/page.tsx`
- `src/components/ui/select.tsx`
- `src/app/api/pomodoro/route.ts`
- `src/lib/pomodoro.ts`
- `prisma/schema.prisma`

### Study-only Focus Timer

Implemented:
- removed App Tracker from primary sidebar navigation
- moved Focus Timer into the Study sidebar group only
- changed Focus Timer into a standalone Study tool with no project, task, or habit picker
- new saved focus sessions no longer write a task association; older task-linked sessions can still be read
- Pomodoro session persistence now has nullable `taskId`, so existing environments need the current Prisma schema applied before saving standalone focus sessions

Main files:
- `prisma/schema.prisma`
- `src/app/pomodoro/page.tsx`
- `src/components/pomodoro-panel.tsx`
- `src/app/api/pomodoro/route.ts`
- `src/lib/pomodoro.ts`
- `src/components/app-sidebar.tsx`

### Life and Study UX split

Implemented:
- `/` now reads as the Life Dashboard and no longer loads or renders study widgets
- `/study` remains the Study Dashboard for subjects, scheduled study hours, mistake pressure, due review, weak subjects, and question-practice accuracy
- sidebar navigation now separates Life, Life Planning, and Study; Finance and Spend Tracker live under Life, App Tracker is removed from the sidebar, and Focus Timer lives under Study
- Study Dashboard links to the standalone Focus Timer for study sessions without moving the timer route
- this was a UX/navigation/dashboard split only; no Prisma schema change, data migration, deletion, hiding, or automatic classification was introduced

Main files:
- `src/app/page.tsx`
- `src/app/study/page.tsx`
- `src/components/app-sidebar.tsx`
- `src/components/app-shell.tsx`
- `src/app/weekly-organizer/page.tsx`
- `README.md`
- `ARCHIVE.md`

### Dashboard analytics and layout

Implemented:
- simple authenticated app shell with login/logout
- main dashboard metrics
- current finance income, expenses, and total cash in the dashboard top line
- calendar page with a large month view, task names on each day, selected-day popup with edit/delete actions, and button-triggered future-date task creation
- weekly organizer page for database-backed weekly habit time planning
- study subject and repeating schedule data still exists, but study review now lives under Study instead of the weekly organizer
- scheduled task hours on task creation/editing, with calendar day cells and day detail popups sorted by task time
- pagination on the project list
- richer combined charts for project throughput, habit performance, task-by-project, and activity trend sections
- app tracker page with project daily streak targets and today's task progress
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
- `src/app/api/study-subjects/route.ts`
- `src/app/api/study-subjects/[id]/route.ts`
- `src/app/api/study-schedule/route.ts`
- `src/app/study/page.tsx`
- `src/app/study/mistakes/page.tsx`
- `src/app/study/planner/page.tsx`
- `src/app/api/study-plan/route.ts`
- `src/app/api/study-plan/blocks/route.ts`
- `src/app/api/study-plan/blocks/[id]/route.ts`
- `src/app/api/study-sessions/route.ts`
- `src/app/api/study-sessions/[id]/route.ts`
- `src/app/api/study-question-practice/route.ts`
- `src/app/api/study-question-practice/[id]/route.ts`
- `src/app/api/study-mistakes/route.ts`
- `src/app/api/study-mistakes/[id]/route.ts`
- `src/hooks/useStudyMistakeMutations.ts`
- `src/services/StudyMistakeServices.ts`
- `src/hooks/useStudyMutations.ts`
- `src/services/StudyServices.ts`
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
- sidebar navigation no longer exposes direct Habits or Tasks menu entries; users enter those workflows from Projects
- new projects index page with project throughput overview
- inbox page with fast capture, status filtering, pagination, linked entity display, popup view/edit, project/habit/task linking, note conversion, completion, and deletion
- notes page with search, categories, pagination, creation, popup view/edit, project/habit/task linking, and deletion
- habits index page with streak/check-in analytics and drill-down links
- tasks index page with the task queue shown before analytics and creation context
- habit detail page with linked task completion and habit activity charts
- task detail page with parent-project activity context
- Focus Timer page with standalone persisted study sessions, configurable focus/break cycles, navigation-persistent countdown state, study totals, and focus history

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
- project streak is recomputed from persisted completed task dates and each project's daily target when tasks or target settings change
- habit history and streak are recomputed from persisted completed habit-task dates when tasks change
- one-time backfill script is available for existing databases with drifted streak values

Main files:
- `src/app/api/habits/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/projects/[id]/route.tsx`
- `src/lib/streaks.ts`
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
- disabled client-side fetch caching for API wrapper reads after stale save/update/delete behavior
- added app-level toast feedback through React Query mutation events
- updated project, habit, task, inbox, notes, finance, weekly plan, study, mistake log, and Pomodoro mutation hooks to await affected query invalidations with active/inactive refetching

Main files:
- `src/app/api/tasks/route.ts`
- `src/services/TasksServices.ts`
- `src/hooks/useTaskMutation.ts`
- `src/hooks/useHabitMutations.ts`
- `src/services/api-client.ts`
- `src/components/providers.tsx`
- `src/components/ui/toast.tsx`

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
- repeatable Study Dashboard demo data for every existing local user, with three subjects, seven days of question practice, and at least 120 current-day questions per subject

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
- existing environments still need `npx prisma db push` for the project streak target column and `npm run db:backfill-streaks` once if they were populated before the streak fix
- existing environments should run `npx prisma db push` after schema changes such as `SavingsContribution`, planned income/expense type tracking, `PomodoroSession`, `InboxItem`, `Note`, and weekly plan tables; finance reads and add-cash stay usable before the savings migration, but true contribution edit/delete history, Pomodoro persistence, Inbox, Notes, and persisted weekly habit boards require the current schema
- existing environments should also run `npx prisma db push` for the account spend tracker tables before importing CSV or OFX files
- existing environments should run `npx prisma db push` for study subject, repeating study schedule, and week-specific study plan tables before using persisted study planning data
- existing environments should run `npx prisma db push` for the study mistake table before using the mistake log and its Guided Correction fields
- existing environments should run `npx prisma db push` for the additive study question-practice table before saving right/wrong question totals
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
- weekly organizer is dedicated to Life habit/task scheduling; study review workflows are separate under Study
- Study workspace available for review-first study workflows, including a dashboard and mistake log
- Guided Correction is additive: older mistake records keep their previous status behavior, while new wrong or doubtful-hit records carry correction pending/completed state
- sending a legacy mistake to Guided Correction changes only that selected record to pending correction and resets it to unresolved
- Study Plan question totals are additive study data: existing sessions and mistake records are not rewritten, and saved count entries can be corrected or removed from the planner
- streak persistence now centers on project daily completed-task targets, with habit streaks kept as secondary check-in analytics
- seeded local data available
- docs updated to reflect current structure

The next meaningful product decision is whether to keep analytics derived from existing records or introduce dedicated history tables.
