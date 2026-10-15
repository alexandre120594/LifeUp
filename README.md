# LifeUp

LifeUp is a Next.js productivity app whose main Life domain is now `Goal`.

## What Exists Now

- authenticated Goal dashboard
- Goal create/edit modal, searchable management list, progress, pause, complete, delete, and filter flows
- SnowUI-compatible app shell with PT-BR route-aware topbar, compact theme controls, and responsive sidebar
- SnowUI is the canonical visual layer for tokens, light/dark themes, the app shell, and core UI primitives
- reusable SnowUI productivity patterns (`StatCard`, `GoalCard`, `TaskRow`, `FocusCard`, and `StreakCard`)
- "Hoje" dashboard separated from Goal management, focused on progress and next actions
- full-viewport Inbox capture with internal list scrolling and view/edit dialogs
- full-viewport Notes dashboard with internal scrolling, search, category filters, modal create/edit, and dedicated note viewing
- clean operational Study workspace whose Hoje tab prioritizes the next subject, with a TRT-PI 150-day schedule whose completion and scores persist per user; Matérias, Revisões, and Histórico retain their dedicated flows
- clean full-viewport Study Focus workspace with a dominant timer, three-part focus summary, subject distribution, and session history grouped by month, available inside the Studies navigation group
- reusable loading, empty, error, field-error, and confirmation UI states across redesigned Focus and Notes flows
- operational Finance workspace with accounts, transactions, commitments, and savings goals
- independent Habit Tracker for daily positive habits and habits to avoid, available from the main navigation and not connected to Goal
- native Android client in `android/LifeUp-Kotlin`, mapped to the existing backend with CRUD flows for Goals, Life Habits, Study Subjects, Finance Transactions, Commitments, Savings Goals, Inbox, and Notes

## Main Domain

`User 1 -> N Goal`

Goal fields:
- `id`
- `userId`
- `title`
- `description`
- `area`
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

Goal area:
- `BODY`
- `MIND`
- `HOME`

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

## Finance Domain

```text
User -> FinancialAccount -> FinancialTransaction
User -> FinancialCommitment -> FinancialTransaction
User -> SavingsGoal -> SavingsContribution
```

`/finance` is a full-viewport operational workspace with month/year navigation, an annual `Todos os meses` view, a light summary strip, and full-width tabs for transactions, commitments, and savings goals. The commitments tab compares period income with pending expenses, showing the committed amount and percentage, remaining income, and active commitments after the selected period. Each tab keeps its individual actions and adds confirmed bulk selection/deletion; transaction period deletion is server-side and always scoped by both the active period and authenticated user. Account balance is derived from opening balance plus transactions, commitment settlement creates a linked transaction atomically, and goal progress is derived only from contributions. The former tracker, budget, planned-expense, and recurring-bill surfaces were removed after consolidation.

## Study Domain

```text
User -> StudySubject -> StudyTopic
User -> StudySession (time + optional question result)
User -> StudyReview
User -> StudyPlanProgress
```

`/study` is a full-viewport workspace organized into Hoje, Cronograma, Matérias, Revisões, and Histórico. Hoje prioritizes a recommended next subject, daily progress, compact metrics, and urgent reviews with a direct handoff to `/pomodoro`. Cronograma presents the fixed TRT-PI 150-day plan with search, phase/subject/status filters, daily details, completion and accuracy tracking persisted in PostgreSQL through `/api/study-plan-progress`. The other tabs retain their existing composition and behavior. Matérias exposes weekly goals, progress, linked topics and CRUD; Revisões presents one pending item at a time while preserving the existing scheduling actions; Histórico adds month/year filters, period metrics, subject totals and session CRUD. `GET /api/study` remains the canonical workspace source for the original study flows.

## Main File Map

- `src/app/page.tsx`
  - "Hoje" dashboard with Goal progress, next actions, and shortcuts
- `src/app/goals/page.tsx`
  - Goal management page
- `src/components/goals/GoalBoard.tsx`
  - Goal management header, metrics, filters, search, modal form, table-style list, validation, and internal list scroll
- `src/components/productivity`
  - visual-only SnowUI patterns shared by dashboard, Goal, capture, focus, and streak surfaces
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

## Other Areas

- `src/app/inbox/page.tsx`
- `src/app/notes/page.tsx`
  - full-viewport Notes dashboard, library filters, summary metrics, and create/edit/view dialogs
- `src/app/pomodoro/page.tsx`
- `src/components/ui/app-state.tsx`
- `src/components/ui/confirm-dialog.tsx`
- `src/app/study/page.tsx` (simplified Study workspace)
- `src/app/finance/*` (simplified workspace active)
- `src/app/life-habits/page.tsx`

Inbox, Notes, and Pomodoro are independent and do not require Goal IDs.

## Habit Tracker

`/life-habits` e um tracker independente inspirado no modelo comportamental do
Streak, reimplementado na arquitetura do LifeUp e no SnowUI. Ele oferece habitos
normais, de abstinencia e quantitativos; agendas flexiveis; checklist; dias de
descanso; configuracao de foco; registro historico; sequencia atual/recorde;
taxa de conclusao e forca ponderada. As regras derivadas ficam em
`src/lib/life-habits.ts` e o modulo nao depende de Goal.

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

## Canonical Documentation

- `AGENTS.md`: repository-wide contract for AI-assisted development
- `docs/PRODUCT.md`: product vision, scope, and shared vocabulary
- `docs/ARCHITECTURE.md`: technical boundaries and approved data flow
- `docs/CURRENT_STATE.md`: implemented capabilities, known debt, and next work
- `docs/AI_DEVELOPMENT.md`: repeatable workflow and definition of done
- `docs/DECISIONS.md`: durable product and architecture decisions

Files under `specs/`, when present, are historical or feature-specific planning
material. The canonical documents above, the Prisma schema, and executable code
define the current system.
