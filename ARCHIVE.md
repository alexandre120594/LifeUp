# ARCHIVE.md

Running handoff log for LifeUp.

## Current Snapshot

Date of latest update:
- 2026-09-21

Current app position:
- `/` is a full-viewport Goal dashboard.
- `/goals` is the Goal management page.
- `/goals` uses the Metas redesign: header action, metrics, area/status filters, search, modal create/edit, and table-style internal scrolling list.
- `/` now acts as "Hoje": progress summary, next Goal actions, and shortcuts instead of duplicating Goal management.
- main Life domain is `User -> Goal`.
- Goals now carry a simple `area`: `BODY`, `MIND`, or `HOME`.
- Dashboard uses only Goals for main metrics and content, grouped by area.
- Goal list scrolls internally; page-level vertical scroll is disabled by layout.
- Design System Foundation is active: SnowUI-compatible semantic tokens are layered over the existing Yevox theme system.
- App Shell redesign is active: PT-BR route-aware topbar, compact theme controls, clearer sidebar active states, and tokenized shared viewport/header.
- Information Architecture now centers primary navigation on Hoje, Metas, Captura, Foco, and Notas, with Estudos and Financas secondary.
- Inbox/Captura is independent.
- Notes are independent.
- Pomodoro is independent and study-subject based.
- Study and finance areas remain available.
- Estudos exposes Dataprev and TRT static plan references inside the full-viewport dashboard.
- LifeHabit remains a separate legacy quit-habit tool, outside main navigation and not integrated with Goal.

## Completed Recently

### Study Clean Dashboard Refactor

Implemented:
- refactored `/study` using `specs/design-system/estudos-clean.html` as the visual base.
- replaced the heavier stacked-card composition with a clean next-action hero, weekly metric strip, focused subject-attention list, review summary, review queue, and compact recent history.
- kept the existing Study workspace data flow, session/result dialog, subject/topic creation, review capture, review reveal, reschedule, mastered actions, and Dataprev/TRT plan links.
- preserved the full-viewport internal-scroll model for desktop and mobile.

Validation:
- `npx tsc --noEmit`
- `npm run lint`

### Study Plan Links and Full-Viewport Fit

Implemented:
- exposed Dataprev Plan and TRT em estudos cards inside `/study`.
- copied both existing plan HTMLs into `public/study-plans/` so they open from the app.
- tightened `DashboardViewport` to use the full viewport width and reduced header/content padding.
- made the Study dashboard height-owned, with internal scroll on dense panels instead of page-level vertical scroll.

Validation:
- `npx tsc --noEmit`

### Notes Full-Viewport Dashboard

Implemented:
- rebuilt `/notes` as a responsive full-viewport dashboard with no page-level vertical scrolling.
- kept the summary, filters, and search fixed while the notes library owns its internal scroll.
- moved note creation and editing out of the page into responsive modal forms.
- added a dedicated read-only modal for viewing complete note content.
- preserved validation, query filters, mutation behavior, loading/error/empty states, and safe delete confirmation.

Validation:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

### Simplification - Steps 8 to 10

Implemented:
- replaced `/study` with the full-viewport workspace centered on an explainable next action.
- added the unified session -> result dialog, atomic review capture, manual review capture, answer reveal, reschedule/master actions, canonical weekly metrics, attention ranking, and recent history.
- kept subject/topic creation secondary and added the required first-subject empty state.
- removed the old Study planner, mistake log, TRT plans, question-practice APIs, schedule/plan APIs, hooks, services, data files, import scripts, analytics helpers, types, and Prisma models.
- removed the old Finance tracker, budget, planned-expense and recurring-bill APIs/UI, duplicated helpers/types, compatibility migration code, fields, and Prisma models.
- made savings-goal progress contribution-derived only and removed persisted duplicate balance/completion fields.
- simplified sidebar/topbar navigation to one Studies and one Finance destination.
- updated the seed to create unified Study sessions instead of parallel question-practice rows.
- created `specs/simplification/result.md` and marked steps 8, 9, and 10 complete.

Validation:
- `npx prisma validate`
- `npx prisma generate`
- `npx prisma db push --accept-data-loss`
- `npm run db:seed`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- smoke HTTP autenticado: `/api/study` e `/api/finance` (`200`), API legada removida (`404`)
- no `npm test` script is configured

Remaining:
- no work remains in the simplification plan; future changes should start from a new spec.

### Simplification - Steps 4 to 7

Implemented:
- added the full-screen responsive layout contract in `specs/simplification/layout.md`.
- introduced Financial Accounts, unified Financial Commitments, Financial Imports, account-linked transactions, and contribution-derived savings progress.
- added idempotent compatibility migration for existing transactions, planned expenses, recurring bills, and legacy savings balances without deleting source records.
- replaced `/finance` with the operational workspace: one primary transaction action, balances, recent movements, commitments, goals, progressive forms, and owned internal scroll.
- redirected the obsolete standalone tracker UI to the consolidated Finance workspace; persisted legacy import data remains for the cleanup stage.
- introduced Study Topics and Reviews, expanded Study Sessions with topic and question results, and added canonical metrics plus explainable next-action derivation.
- added an atomic session/result/review write path and review reschedule/master operations.
- added idempotent compatibility migration from Study mistakes and Pomodoro sessions, plus conservative practice-to-session merging only when the match is unambiguous.
- added focused Finance and Study workspace services and React Query hooks.
- kept the current Study UI unchanged because its redesign is step 8.

Validation:
- `npx prisma format`
- `npx prisma validate`
- `npx prisma generate`
- `npx prisma db push`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- authenticated `GET /api/finance` and `GET /api/study` smoke tests (`200`)

Remaining:
- step 8: refactor the Study UI around the new workspace and next action.
- step 9: remove legacy models, APIs, pages, types, and persisted compatibility fields after migration is confirmed.
- step 10: final validation and result report.

### Metas Redesign Reference Implementation

Implemented:
- used `specs/design-system/lifeup-metas-redesign.html` as the base for the real `/goals` experience.
- moved Goal creation and editing into a modal form with area, status, color, date, description, and progress controls.
- replaced the previous area-column management view with a responsive table-style Goal list.
- added client-side search over the currently filtered Goal list while preserving existing area/status API filters.
- kept existing pause, complete, edit, delete, validation, and confirmation behavior on the real Goal hooks.
- simplified `src/app/goals/page.tsx` so `GoalBoard` owns the page header and primary action.

Validation:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

### SnowUI Design System - Parts 4 to 7

Implemented:
- added visual-only `StatCard`, `GoalCard`, `TaskRow`, `FocusCard`, and `StreakCard` patterns under `src/components/productivity`.
- migrated Hoje metrics, next Goals, focus shortcut, Goal management metrics/cards/filters, and Capture rows to the shared patterns.
- removed the heavy decorative Focus background and aligned its page frame with SnowUI panels, borders, radii, and shadows.
- normalized fixed status colors and hero surfaces across Study, Finance, spending tracker, and Life Habits while preserving user-selected persisted colors.
- removed the temporary Yevox aliases after eliminating their final component references.
- reviewed the shell overflow contract: the app remains fixed to `100dvh`, and page content owns internal scrolling.
- completed the design-system plan and closed `specs/design-system/remaining-work.md`.

Validation:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

### SnowUI Design System - Parts 1 to 3

Implemented:
- replaced the hybrid color foundation with the canonical SnowUI light/dark tokens while retaining temporary compatibility aliases for unmigrated secondary screens.
- simplified theme selection to light/dark and synchronized `data-theme`, `.dark`, and `color-scheme` during bootstrap and interaction.
- aligned the global shell to a 236px collapsible sidebar, 64px topbar, 1320px content boundary, and internal content scrolling.
- normalized Button, Input, Select, Card, Badge, Dialog, Checkbox, Skeleton, Toast, and shared state components.
- added Textarea, Progress, and SegmentedControl primitives.
- recorded the phased plan and remaining work in `specs/design-system/`.

Validation:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

Stop point:
- Parts 1 to 3 are complete.
- Parts 4 to 7 are intentionally not started; resume from `specs/design-system/remaining-work.md`.

### Design System Foundation

Implemented:
- added SnowUI-compatible semantic aliases in `src/app/globals.css` while preserving existing Yevox/shadcn tokens.
- added surface, text, status, spacing, radius, shadow, motion, and layout tokens.
- made `[data-theme="dark"]` share the same dark contract as `.dark`.
- updated `ThemeSwitcher` and the layout bootstrap to write `data-theme`.
- tuned core UI primitives without changing their public API: Button, Card, Input, Badge, Select, Dialog, Skeleton, and Toast.
- documented Task 2 completion in `specs/ux-redesign/`.

Validation:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

### UX Redesign Task 4 - App Shell

Implemented:
- migrated `AppShell` topbar to SnowUI-compatible panel, border, shadow, and text tokens.
- added route-aware topbar context for Life, Capture, Library, Finance, and Study routes.
- compacted `ThemeSwitcher` with icon mode controls and a theme select for better mobile fit.
- updated sidebar active state, icon treatment, badges, and collapsed tooltips.
- aligned `DashboardViewport` and `MenuPageHeader` with shared shell tokens and internal-scroll expectations.
- marked Task 4 complete in `specs/ux-redesign/implementation.md`.

Validation:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run build`

### UX Redesign Tasks 3, 5, 6, and 7

Implemented:
- Task 3 Information Architecture: renamed and regrouped navigation around Hoje, Metas, Captura, Foco, and Notas; kept Estudos and Financas discoverable as secondary groups.
- Task 4 was reviewed after Task 3 and remains valid, with route context updated to the final IA labels.
- Task 5 Dashboard: `/` no longer duplicates `GoalBoard`; it shows progress metrics, next Goal actions, empty/error/loading states, and shortcuts.
- Task 6 Goals: `/goals` is the management surface with PT-BR labels, local title validation, design-system selects, error/retry state, filter empty state, and delete confirmation.
- Task 7 Inbox: `/inbox` presents Captura with local title validation, design-system selects, localized labels, empty/error/loading states, and delete confirmation.

### UX Redesign Tasks 8, 9, 10, and 11

Implemented:
- Task 8 Focus: `/pomodoro` is localized as Foco, keeps timer localStorage persistence, adds setup/subject validation, uses standardized loading/error/empty states, and replaces session delete `window.confirm` with a shared confirmation dialog.
- Task 9 Notes: `/notes` is now a scannable library with search, category filters, clear create/edit forms, field validation, safe delete confirmation, and loading/error/empty states.
- Task 10 Global States: added reusable `LoadingState`, `EmptyState`, `ErrorState`, `RetryButton`, `FieldError`, and `ConfirmDialog` components.
- Task 11 Accessibility: touched Focus and Notes fields now have labels plus `aria-invalid`/`aria-describedby`; icon actions keep labels; loading/error regions expose status/alert semantics; confirmations use the shared dialog primitive.

Validation:
- `npx tsc --noEmit`
- `npm run lint`

### UX Redesign Tasks 12 and 13

Implemented:
- Task 12 Responsive Review: reviewed Hoje, Metas, Captura, Foco, and Notas against the shared shell/viewport scroll model, responsive grids, text wrapping, and action accessibility.
- Replaced remaining destructive `window.confirm` usage in the redesigned Metas and Captura flows with the shared `ConfirmDialog`.
- Task 13 Final Nielsen Audit: added the final audit status to `specs/ux-redesign/00-current-state.md`, with primary-scope P1 items resolved and residual risks explicitly accepted.
- Marked Tasks 12 and 13 complete in `specs/ux-redesign/implementation.md`.

Validation:
- `npx tsc --noEmit`
- `npm run lint`

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

### Goal Areas

Implemented:
- added `GoalArea` enum with `BODY`, `MIND`, and `HOME`.
- added required `Goal.area` with safe default `MIND` for existing rows.
- added Goal area validation in shared input normalization.
- added API query filters for `area` and `status`.
- added Body, Mind, and Home selection to Goal create/edit.
- grouped dashboard Goals by Body, Mind, and Home with compact cards.
- added simple area and status filters.
- added specs under `specs/goal-areas/`.

Main files:
- `prisma/schema.prisma`
- `src/types/Goal.ts`
- `src/lib/goals.ts`
- `src/app/api/goals/route.ts`
- `src/services/GoalServices.ts`
- `src/hooks/useGoals.ts`
- `src/components/goals/GoalBoard.tsx`
- `prisma/seed.ts`
- `README.md`
- `ARCHIVE.md`

Validation:
- `npx prisma validate`
- `npx prisma generate`
- `npx prisma db push`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Stop Point

Development currently stops at:
- Goal domain implemented with Body, Mind, and Home areas.
- simplification steps 1 through 10 complete.
- Finance domain and UI use the simplified operational workspace.
- Study domain and UI use the simplified next-action workspace.
- obsolete Finance/Study persistence, routes, services, hooks, types, and screens are removed.
- old main-Life hierarchy removed from active app code.
- docs and specs updated.
- validation passed.
