# Plano de Implementacao

## 1. Schema e tipos

Adicionar `GoalArea` e `Goal.area`.

Arquivos:
- `prisma/schema.prisma`
- `src/types/Goal.ts`
- `src/lib/goals.ts`

Validar:
- area obrigatoria em criacao.
- area opcional em update.
- valor default seguro `MIND` para dados existentes quando o schema exigir.

## 2. API, service e hook

Arquivos:
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/services/GoalServices.ts`
- `src/hooks/useGoals.ts`

Alteracoes:
- aceitar e persistir `area`.
- permitir filtro simples por `area`.
- manter filtros simples por status quando usados.

## 3. Criacao e edicao de Goal

Arquivo:
- `src/components/goals/GoalBoard.tsx`

Alteracoes:
- formulario deve selecionar Body, Mind ou Home.
- `area` obrigatoria.
- sem etapas novas.

## 4. Dashboard

Arquivos:
- `src/components/goals/GoalBoard.tsx`
- `src/app/page.tsx`

Alteracoes:
- resumo geral preservado.
- goals organizados por Body, Mind e Home.
- filtros `ALL`, `BODY`, `MIND`, `HOME`.
- filtro de status simples pode existir sem virar sistema avancado.
- manter viewport travada e scroll interno.

## 5. Documentacao e validacao

Atualizar:
- `README.md`
- `ARCHIVE.md`

Validar quando pratico:
- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run lint`

