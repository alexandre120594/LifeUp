# Estudos UX — Arquitetura

## Fluxo preservado

```text
src/app/study/page.tsx
  -> useStudyWorkspace e mutations
  -> StudyWorkspaceServices
  -> /api/study e APIs CRUD existentes
  -> Prisma
```

O workspace continua consumindo um único payload canônico (`StudyWorkspace`). A navegação por abas é estado local de apresentação e não cria novos endpoints, stores ou dependências.

## Responsabilidades

- `src/app/study/page.tsx`
  - composição full-screen;
  - aba ativa e ação principal contextual;
  - reutilização dos dialogs e confirmações existentes;
  - nenhuma regra de persistência.
- `src/lib/study-core.ts`
  - recomendação e atenção por matéria existentes;
  - métricas semanais existentes;
  - resumo diário derivado de sessões, matérias e revisões.
- `src/hooks/useStudyWorkspace.ts`
  - cache e invalidação do workspace após mutations.
- `src/services/StudyWorkspaceServices.ts`
  - cliente das APIs existentes.
- `/pomodoro`
  - único timer de foco; `/study` apenas navega para ele.

## Regra da meta diária

A meta diária não é persistida. Ela é uma projeção simples da soma das metas semanais das matérias ativas dividida por sete, arredondada em minutos. O progresso usa apenas sessões iniciadas no dia local. Se não houver meta semanal, a interface orienta a configurá-la e mostra progresso zero.

## Regra da taxa de acertos

A taxa diária só aparece como percentual quando existem questões registradas no dia. Sem questões, a interface mostra `Sem dados`, evitando comunicar `0%` como desempenho real.

## Layout e overflow

`DashboardViewport` e o workspace usam `h-full`, `min-h-0`, `min-w-0` e `overflow-hidden`. O seletor de abas permanece fixo; somente a região de conteúdo da aba ativa usa `overflow-y-auto`. O controle segmentado ocupa toda a largura e suas quatro opções encolhem no mobile sem criar scroll horizontal na página.

## Evolução por etapa

- Etapa 1: contrato, abas, Hoje e acesso preservado às funções atuais.
- Etapa 2: aperfeiçoar Matérias e seu CRUD.
- Etapa 3: aperfeiçoar Revisões sem trocar o algoritmo atual.
- Etapa 4: aperfeiçoar Histórico, filtros mês/ano e revisão responsiva final.

