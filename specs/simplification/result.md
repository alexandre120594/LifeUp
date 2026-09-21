# Resultado da simplificacao

Conclusao das etapas 8, 9 e 10 em 2026-09-21.

## Financas

### Antes

- movimentacoes divididas entre transacoes e um tracker de extratos/faturas;
- compromissos divididos entre despesas planejadas e contas recorrentes;
- objetivos mantinham saldo persistido em paralelo ao historico de aportes;
- dashboard, tracker, budgets e formularios CRUD competiam no fluxo principal.

### Depois

- `/finance` e o unico workspace operacional;
- conta + movimentacao formam a fonte unica de saldo;
- `FinancialCommitment` representa compromissos unicos ou mensais;
- `SavingsContribution` e a fonte unica do progresso de objetivos;
- nova movimentacao permanece a acao primaria, com compromissos e objetivos contextuais;
- layout usa `100dvh`, lista central e painel lateral com scroll interno.

### Removido e consolidado

- removidos tracker standalone, budgets, planned expenses, recurring bills e financial summaries;
- removidos APIs, componentes, hooks, service, helpers e tipos sem consumidor dessas superficies;
- removidos `AccountSpendImport`, `AccountSpendEntry`, `Budget`, `PlannedExpense`, `RecurringBill` e `FinancialSummary` do Prisma;
- removidos `SavingsGoal.currentAmount` e `SavingsGoal.isCompleted`; ambos sao derivados dos aportes;
- removidos campos de compatibilidade `legacyKey` depois da migracao.

## Estudos

### Antes

- dashboard centrado em graficos e filtros, sem uma recomendacao operacional;
- planner, caderno de erros, pratica de questoes, grade semanal e planos TRT mantinham fluxos paralelos;
- resultado de questoes e revisao nao pertenciam necessariamente a sessao.

### Depois

- `/study` responde primeiro `O que devo estudar agora?`, com materia/topico, motivo e duracao;
- sessao e resultado reutilizam o mesmo dialog e salvam questoes e revisoes atomicamente;
- metricas essenciais mostram tempo, questoes, acuracia e revisoes vencidas da semana;
- materias que precisam de atencao usam a derivacao canonica de revisoes, deficit e acuracia;
- revisoes vencidas aparecem primeiro, com resposta oculta ate acao explicita e operacoes de reagendar/dominar;
- historico, materia, topico e captura manual permanecem secundarios;
- desktop usa regioes internas de scroll; tablet/mobile preservam a ordem sem scroll horizontal.

### Removido e consolidado

- removidos planner, caderno de erros, planos TRT, JSONs e scripts de importacao;
- removidos APIs, hooks, services, analytics e tipos dos fluxos antigos;
- removidos `StudyMistake`, `StudyQuestionPractice`, `StudyScheduleBlock`, `StudyPlanBoard`, `StudyPlanBlock` e `StudyPlanProgress` do Prisma;
- removidos campos de compatibilidade e `plannedHoursPerWeek`; a meta usa somente minutos;
- sidebar e topbar agora expõem apenas o workspace consolidado de Estudos.

## Validacao final

| Verificacao | Resultado |
| --- | --- |
| `npx prisma validate` | passou |
| `npx prisma generate` | passou |
| `npx prisma db push --accept-data-loss` | passou; schema local sincronizado |
| `npm run db:seed` | passou; 21 sessoes unificadas por usuario de seed |
| `npx tsc --noEmit` | passou sem erros |
| `npm run lint` | passou sem erros ou avisos |
| `npm test` | nao aplicavel; nao existe script `test` |
| `npm run build` | passou; 31 paginas geradas |
| smoke HTTP autenticado | `/api/study` 200, `/api/finance` 200 e API removida 404 |

O build ainda informa avisos externos nao bloqueantes: dados de `baseline-browser-mapping` desatualizados e convencao `middleware` depreciada pelo Next.js.
