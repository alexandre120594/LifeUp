# Plano de Implementacao

## 1. Schema e tipos Goal

Objetivo:
- adicionar Goal como entidade principal e remover relacoes do dominio antigo.

Arquivos principais:
- `prisma/schema.prisma`
- `src/types/Goal.ts`

Alteracoes:
- `User.goals`
- `GoalStatus`
- `Goal`
- Notes, Inbox e Pomodoro sem Project/Habit/Task.

Validacao:
- `npx prisma validate`

Estado:
- concluido

## 2. API Goal

Objetivo:
- CRUD autenticado de Goals com ownership por userId.

Arquivos principais:
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/lib/auth.ts`, se necessario apenas para reuso.

Alteracoes:
- `GET`, `POST`, `GET :id`, `PATCH :id`, `DELETE :id`.
- validacao de status, progress, datas e strings.

Validacao:
- typecheck/build.

Estado:
- concluido

## 3. Service + hook

Objetivo:
- criar fluxo `useGoals -> GoalServices -> /api/goals`.

Arquivos principais:
- `src/services/GoalServices.ts`
- `src/hooks/useGoals.ts`
- `src/types/Goal.ts`

Alteracoes:
- queries e mutacoes de Goals.

Validacao:
- typecheck.

Estado:
- concluido

## 4. UI Goals

Objetivo:
- criar UI principal de listagem, criacao, edicao, progresso, pausa, conclusao e exclusao.

Arquivos principais:
- `src/components/goals/*`
- `src/app/goals/page.tsx`

Alteracoes:
- formulario e lista de Goals.
- sem Project/Habit/Task.

Validacao:
- criar, editar, alterar progresso, pausar, concluir, excluir, listar.

Estado:
- concluido

## 5. Dashboard

Objetivo:
- dashboard consumir somente Goals e ocupar viewport inteiro sem scroll global.

Arquivos principais:
- `src/app/page.tsx`

Alteracoes:
- metricas permitidas.
- lista interna com scroll.
- remover analytics de Project/Habit/Task.

Validacao:
- responsividade e scroll.

Estado:
- concluido

## 6. Desacoplamento dos modulos existentes

Objetivo:
- preservar Notes, Inbox e Pomodoro independentes.

Arquivos principais:
- `src/app/notes/page.tsx`
- `src/app/inbox/page.tsx`
- `src/app/pomodoro/page.tsx`
- APIs e services relacionados.
- `src/components/app-sidebar.tsx`

Alteracoes:
- remover links/campos de Project/Habit/Task.
- remover Weekly Plan e Calendar da navegacao.
- manter LifeHabit fora do fluxo principal.

Validacao:
- Notes, Inbox e Pomodoro sem ids antigos.

Estado:
- concluido

## 7. Remocao do legado + validacao

Objetivo:
- remover codigo sem consumidores e validar repo.

Arquivos principais:
- APIs, pages, services, hooks, stores, types e componentes legados.
- `README.md`
- `ARCHIVE.md`
- `prisma/seed.ts`

Alteracoes:
- remover Project/Habit/Task sem consumidores.
- atualizar docs.

Validacao:
- buscar `Project`, `project`, `projectId`, `Habit`, `habit`, `habitId`, `Task`, `task`, `taskId`.
- typecheck, lint, tests, build.

Estado:
- concluido
