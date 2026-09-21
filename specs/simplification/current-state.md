# Estado atual: Financas e Estudos

Auditoria da etapa 1. Documento descritivo; nao define ainda o dominio final.

## Contexto compartilhado

- Stack: Next.js App Router, React 19, TypeScript, Prisma/PostgreSQL e TanStack Query.
- Todas as rotas auditadas usam `requireCurrentUserId`; os registros sao filtrados por `userId`.
- Tipos dos dois modulos vivem no arquivo compartilhado `src/types/BaseInterfaces.ts`.
- Fluxo predominante: pagina -> hook React Query -> service -> route handler -> Prisma.
- `AppShell` ja fixa a area da aplicacao com `h-dvh`, `min-h-0` e `overflow-hidden`.
- `DashboardViewport` fixa o container, mas aplica `overflow-y-auto` em todo o conteudo. Assim, os dashboards atuais rolam como pagina interna inteira, nao apenas em listas.
- Sidebar expoe 2 entradas de Financas e 5 de Estudos, alem de Foco/Pomodoro.

## Financas

### Paginas e componentes

| Arquivo | Responsabilidade atual | Observacao |
| --- | --- | --- |
| `src/app/finance/page.tsx` | Dashboard, filtros mensal/anual, criacao de 5 tipos de registro, metricas, 3 graficos, insights e listas | 1511 linhas; concentra consulta, derivacao, formularios e apresentacao |
| `src/app/finance/tracker/page.tsx` | Importacao CSV de extrato/fatura, filtros, resumo, tabela paginada e exclusao de importacao | 487 linhas; fluxo isolado das transacoes financeiras |
| `src/app/finance/components/FinanceRecordActions.tsx` | Edicao/exclusao de transacao, categoria, orcamento, recorrencia, compromisso, meta e aportes | 811 linhas; varios formularios e dialogs no mesmo componente |

Componentes auxiliares como cards, graficos e formularios de criacao estao definidos dentro de `finance/page.tsx`, nao em modulos de dominio separados.

### Hooks, services e helpers

- `src/hooks/useFinanceMutations.ts`
  - 2 queries: dashboard e tracker.
  - 23 mutations: importacao/exclusao de importacao e CRUDs separados para categorias, transacoes, orcamentos, recorrencias, compromissos, metas e aportes.
  - Quase toda mutation invalida a chave ampla `['finance']`.
- `src/services/FinanceServices.ts`
  - Cliente para todos os endpoints financeiros.
  - Repete a separacao por entidade presente nos hooks e APIs.
- `src/lib/finance.ts`
  - Conversao monetaria, periodo mensal/anual, resumos e insights.
  - `buildFinanceSummary` e `buildFinancePeriodSummary` repetem grande parte do calculo.
- `src/lib/finance-defaults.ts`
  - Categorias padrao criadas automaticamente ao consultar o dashboard.
- Tipos: bloco financeiro de `src/types/BaseInterfaces.ts`.

### Entidades persistidas

| Entidade | Papel atual | Relacoes/regras relevantes |
| --- | --- | --- |
| `FinancialCategory` | Classifica entrada ou saida | Unica por usuario, nome e tipo; referenciada por 4 entidades |
| `FinancialTransaction` | Movimento realizado | Tipo `income/expense`; exige categoria; nao possui conta |
| `Budget` | Limite mensal por categoria | Unico por usuario, categoria e mes |
| `RecurringBill` | Conta recorrente | Frequencia textual, dia de vencimento e estado ativo |
| `PlannedExpense` | Entrada ou saida futura | Apesar do nome, aceita `income/expense`; pode ser convertida em transacao ao pagar |
| `SavingsGoal` | Meta com saldo acumulado | Mantem `currentAmount` e estado concluido |
| `SavingsContribution` | Aporte separado em meta | Atualiza tambem `SavingsGoal.currentAmount` |
| `FinancialSummary` | Snapshot mensal | Existe no schema, mas nao e usado pelas rotas/UI auditadas |
| `AccountSpendImport` | Lote CSV importado | Origem `extrato/fatura`, mes e contagem de linhas |
| `AccountSpendEntry` | Linha importada | Nao vira `FinancialTransaction`; fica em trilha paralela |

Lacuna estrutural: nao existe entidade `Account`. Saldo exibido e fluxo liquido calculado, nao saldo por conta nem saldo acumulado real.

### APIs

| Rota | Metodos | Papel |
| --- | --- | --- |
| `/api/finance` | GET | Cria categorias padrao e agrega dashboard |
| `/api/finance/transactions` | POST | Cria transacao |
| `/api/finance/transactions/:id` | PATCH, DELETE | Edita/exclui transacao |
| `/api/finance/categories` | POST | Cria categoria |
| `/api/finance/categories/:id` | PATCH, DELETE | Edita/exclui categoria com protecao de uso |
| `/api/finance/budgets` | POST | Faz upsert de orcamento mensal/categoria |
| `/api/finance/budgets/:id` | PATCH, DELETE | Edita/exclui orcamento |
| `/api/finance/recurring-bills` | POST | Cria recorrencia |
| `/api/finance/recurring-bills/:id` | PATCH, DELETE | Edita/exclui recorrencia |
| `/api/finance/planned-expenses` | POST | Cria compromisso futuro |
| `/api/finance/planned-expenses/:id` | PATCH, DELETE | Edita/exclui compromisso |
| `/api/finance/planned-expenses/:id/pay` | POST | Cria transacao e remove compromisso em transacao atomica |
| `/api/finance/savings-goals` | POST | Cria meta |
| `/api/finance/savings-goals/:id` | PATCH, DELETE | Edita/exclui meta |
| `/api/finance/savings-goals/:id/contributions` | POST | Cria aporte e atualiza saldo da meta |
| `/api/finance/savings-goals/:id/contributions/:contributionId` | PATCH, DELETE | Edita/exclui aporte e recalcula saldo |
| `/api/finance/spending-tracker` | GET, POST, DELETE | Consulta, importa CSV e exclui lote |

### Regras e fluxos atuais

- Dashboard alterna mes/ano e filtra transacoes e compromissos no cliente.
- Acao `Add record` abre seletor com transacao, compromisso, meta, orcamento e categoria.
- Categorias precisam ter mesmo tipo do registro.
- Compromisso marcado como pago gera transacao e deixa de existir.
- Meta guarda saldo derivado dos aportes, com fallback para saldo legado caso tabela de aportes nao exista.
- Dashboard retorna `recurringBills: []`; CRUD de recorrencias existe, mas recorrencias persistidas nao entram na consulta, no resumo nem na UI principal.
- `FinancialSummary` nao participa dos calculos; resumos sao derivados em tempo de requisicao e novamente no cliente.
- Tracker importa e analisa movimentos, mas nao alimenta dashboard nem transacoes.

### Superficie visual atual

- Cabecalho com periodo, `Add record` e link para tracker.
- Painel geral, 3 metricas adicionais, 3 graficos e painel de insights.
- Listas de transacoes, compromissos, orcamentos, recorrencias, metas e aportes.
- Conteudo completo rola no `DashboardViewport`; dashboard nao cabe como composicao operacional em uma viewport.

## Estudos

### Paginas e componentes

| Arquivo/rota | Responsabilidade atual | Observacao |
| --- | --- | --- |
| `src/app/study/page.tsx` (`/study`) | Dashboard de questoes, tempo, revisoes e materias fracas | 655 linhas; agrega 4 consultas e oferece 5 atalhos |
| `src/app/study/planner/page.tsx` (`/study/planner`) | Materias, plano semanal, blocos, sessoes e resultados de questoes | 1654 linhas; concentra quase todo CRUD operacional |
| `src/app/study/mistakes/page.tsx` (`/study/mistakes`) | Caderno de erros, filtros, revisoes, diagnostico e correcao guiada | 1399 linhas; formulario e estado de dominio muito extensos |
| `src/app/study/trt-plan/page.tsx` | Plano estatico Dataprev, busca, filtros, checklist e progresso | 594 linhas; usa JSON especifico e progresso generico |
| `src/app/study/trt-audit-plan/page.tsx` | Plano estatico TRT Auditoria, trilhas, busca, filtros e progresso | 683 linhas; usa outro JSON e UI propria |
| `src/app/pomodoro/page.tsx` | Timer de foco ligado a materia | Fora de `/study`, mas compartilha `StudySubject` e persiste `PomodoroSession` |

Nao ha pasta de componentes de Estudos: paineis, formularios e dialogs ficam dentro das paginas grandes.

### Hooks, services e helpers

- `src/hooks/useStudyMutations.ts`
  - 6 queries: materias, grade fixa, sessoes, praticas, quadro semanal e progresso de plano.
  - 11 mutations: progresso, materias, grade, blocos, sessoes e praticas.
- `src/hooks/useStudyMistakeMutations.ts`
  - Query filtravel e CRUD de erros.
- `src/services/StudyServices.ts`
  - Cliente de materias, duas formas de planejamento, sessoes, praticas e progresso dos planos estaticos.
- `src/services/StudyMistakeServices.ts`
  - Cliente separado para erros, com 5 filtros.
- `src/lib/analytics.ts`
  - Periodos, sessoes por periodo, revisoes vencidas, pressao por materia, resumo/tendencia de questoes e tempo por materia.
- `src/types/trt-study-plan.ts` e `src/types/trt-audit-study-plan.ts`
  - Tipos exclusivos dos dois planos estaticos.
- Dados: `src/data/trt-study-plan.json` e `src/data/trt-audit-study-plan.json`.
- Tipos principais: bloco de Estudos em `src/types/BaseInterfaces.ts`.

### Entidades persistidas

| Entidade | Papel atual | Relacoes/regras relevantes |
| --- | --- | --- |
| `StudySubject` | Materia | Guarda meta semanal e se relaciona com todos os registros de estudo |
| `StudySession` | Tempo estudado | Inicio/fim/duracao e materia |
| `StudyQuestionPractice` | Resultado agregado de questoes | Totais de certas/erradas por data e materia |
| `StudyMistake` | Questao errada e revisao | 23 campos de conteudo/classificacao; status textual e data de revisao |
| `StudyScheduleBlock` | Grade recorrente por dia/hora | Permite varias materias no mesmo slot |
| `StudyPlanBoard` | Quadro de uma semana | Unico por usuario e inicio da semana |
| `StudyPlanBlock` | Bloco planejado | Horario textual, duracao, materia e notas |
| `StudyPlanProgress` | Checklist generico dos planos estaticos | `planKey + itemId`; restrito em API a dois planos |
| `PomodoroSession` | Sessao de foco | Sobrepoe parte de `StudySession`; materia opcional |

Lacunas estruturais: nao existe `Topic` persistido; topico aparece apenas como campos textuais em `StudyMistake`. Nao existe entidade `Review`; revisao e representada por `reviewDate` e `status` no erro.

### APIs

| Rota | Metodos | Papel |
| --- | --- | --- |
| `/api/study-subjects` | GET, POST | Lista/cria materia |
| `/api/study-subjects/:id` | PATCH, DELETE | Edita/exclui materia |
| `/api/study-sessions` | GET, POST | Lista/cria sessao |
| `/api/study-sessions/:id` | PATCH, DELETE | Edita/exclui sessao |
| `/api/study-question-practice` | GET, POST | Filtra/lista/cria resultado agregado |
| `/api/study-question-practice/:id` | PATCH, DELETE | Edita/exclui resultado |
| `/api/study-mistakes` | GET, POST | Filtra/lista/cria erro |
| `/api/study-mistakes/:id` | PATCH, DELETE | Correcao, status, revisao e exclusao |
| `/api/study-schedule` | GET, POST | Le e substitui materias de um slot recorrente |
| `/api/study-plan` | GET | Le quadro por semana |
| `/api/study-plan/blocks` | POST | Cria bloco semanal |
| `/api/study-plan/blocks/:id` | PATCH, DELETE | Edita/exclui bloco semanal |
| `/api/study-plan-progress` | GET, PUT | Le/substitui checklist de plano estatico |
| `/api/pomodoro` | GET, POST | Lista/cria sessao de foco |
| `/api/pomodoro/:id` | PATCH, DELETE | Edita/exclui sessao de foco |

### Regras e fluxos atuais

- Dashboard consulta materias, sessoes, praticas e erros independentemente.
- Periodos `day/week/month/year` sao aplicados em helpers; parte dos filtros ocorre no cliente.
- Materias possuem horas planejadas semanais, mas dashboard nao deriva uma proxima acao unica.
- Planner mantem quadro semanal navegavel e permite criar/editar/excluir blocos.
- Concluir bloco pode criar `StudySession` e `StudyQuestionPractice` em chamadas separadas; nao ha transacao entre elas.
- Edicao de sessao tenta manter pratica correspondente por materia/data, criando, editando ou excluindo outro registro.
- Caderno de erros usa estados `unresolved/reviewed/mastered`; correcao guiada adiciona classificacoes e pode bloquear mudancas de status incompletas.
- Revisao vencida significa erro nao dominado com `reviewDate <= hoje`.
- Materia fraca e calculada pela quantidade de erros, nao por uma combinacao unica de acuracia, recencia e revisao.
- Dois planejadores estaticos possuem regras, tipos, dados e telas proprias, mas compartilham apenas persistencia de item concluido.
- `StudyScheduleBlock` e `StudyPlanBlock` representam duas agendas diferentes; a grade fixa nao aparece no fluxo principal do planner atual.
- `StudySession` e `PomodoroSession` registram tempo de estudo em trilhas paralelas.

### Superficie visual atual

- Dashboard destaca volume de questoes, acuracia, tempo, revisoes e materias fracas.
- Atalhos levam a planner, caderno de erros, Pomodoro e dois planos TRT.
- Falta resposta explicita e acionavel para "o que estudar agora?".
- Planner e caderno de erros dependem de varios dialogs, formularios e estados locais.
- Todas as paginas usam rolagem do conteudo inteiro via `DashboardViewport`; somente algumas listas/dialogs possuem scroll local.

## Dependencias cruzadas e riscos

- Exclusao em cascata de `StudySubject` remove sessoes, erros, praticas, grades e blocos; Pomodoro usa `SetNull`.
- Categorias financeiras usam `Restrict` em transacoes, recorrencias e compromissos, mas `Cascade` em orcamentos.
- `SavingsGoal.currentAmount` duplica valor derivavel de `SavingsContribution`.
- `FinancialSummary` duplica dados derivaveis e esta inativo.
- Entradas importadas e transacoes manuais formam duas fontes financeiras sem reconciliacao.
- Resultado de questoes e erro detalhado formam duas fontes de desempenho sem vinculo entre si.
- APIs repetem normalizacao e validacao por rota; nao ha camada unica de schema/validator para esses modulos.
- Pages grandes misturam regra, derivacao, mutacao, formulario e UI, elevando custo de alteracao.
