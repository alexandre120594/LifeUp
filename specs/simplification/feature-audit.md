# Auditoria de funcionalidades

Classificacao da etapa 1, orientada ao objetivo de simplificacao. `CORE` sustenta o fluxo principal; `SUPPORT` ajuda sem dominar o fluxo; `ADVANCED` tem valor, mas nao deve estruturar o dashboard; `REMOVE` e redundante, desconectado ou especifico demais. Decisoes formais `KEEP/MERGE/REMOVE` pertencem a etapa 2.

## Financas

| Funcionalidade/conceito atual | Classe | Motivo da classificacao |
| --- | --- | --- |
| Registrar entrada/saida realizada | CORE | Evento financeiro basico e fonte de saldo, entradas e saidas |
| Listar movimentacoes recentes | CORE | Permite entender e conferir situacao atual |
| Resumo de entradas, saidas e resultado por periodo | CORE | Leitura minima do dashboard |
| Compromisso futuro (`PlannedExpense`) | CORE | Sustenta proximos compromissos, inclusive entradas planejadas |
| Recorrencia (`RecurringBill`) | CORE | Necessaria para compromissos repetitivos, embora hoje desconectada do dashboard |
| Meta financeira (`SavingsGoal`) | CORE | Sustenta objetivos financeiros |
| Conta/saldo por conta | CORE | Necessidade do fluxo alvo, mas funcionalidade inexistente hoje |
| Filtro de periodo | SUPPORT | Ajuda leitura; mensal/anual nao deve duplicar regras |
| Categoria da movimentacao | SUPPORT | Boa para leitura e analise; CRUD manual exposto nao e fluxo principal |
| Aportes em meta | SUPPORT | Historico util, mas saldo duplicado aumenta complexidade |
| Marcar compromisso como pago e gerar movimento | SUPPORT | Reduz digitacao, mas hoje apaga o compromisso original |
| Ativar/desativar recorrencia | SUPPORT | Controle operacional necessario |
| Importacao CSV de extrato/fatura | ADVANCED | Pode poupar digitacao, mas hoje cria trilha isolada e uma tela inteira |
| Paginacao/filtros do tracker importado | ADVANCED | So existe para sustentar a trilha de importacao separada |
| Orcamento mensal por categoria | ADVANCED | Util para planejamento, mas fora do fluxo minimo solicitado |
| Insights automaticos | ADVANCED | Derivados de regras simples; secundarios ao estado operacional |
| Graficos de fluxo planejado e poupanca | ADVANCED | Visualizacoes secundarias e redundantes com listas/metricas |
| CRUD separado de categorias no modal principal | REMOVE | Transforma configuracao auxiliar em tipo de registro financeiro |
| `FinancialSummary` persistido | REMOVE | Sem consumidores; dados ja sao derivados |
| Resumo duplicado servidor/cliente | REMOVE | Duas implementacoes para mesma regra |
| Tracker sem conversao/reconciliacao com transacoes | REMOVE | Duplica movimentos sem afetar saldo principal |
| `RecurringBill` persistido mas retornado como lista vazia | REMOVE | Superficie morta no estado atual; deve ser conectada ou substituida em etapa futura |
| Cinco tipos no seletor `Add record` | REMOVE | Mistura acao principal com configuracoes e planejamentos diferentes |
| Tres graficos e painel de insights no dashboard | REMOVE | Ocupam viewport sem responder melhor a situacao, compromissos e objetivos |

### CRUDs e estados que geram complexidade

- CRUDs completos: categoria, transacao, orcamento, recorrencia, compromisso, meta e aporte.
- CRUD adicional: lote importado; linhas importadas nao possuem edicao individual.
- Dashboard mantem 5 formularios simultaneos e estados para periodo, tipo de registro e paginacao de aportes.
- `FinanceRecordActions.tsx` repete shell, abertura, submissao e exclusao para cada entidade.

### Redundancias principais

- `FinancialTransaction.type` e `PlannedExpense.type` modelam a mesma distincao em entidades separadas.
- `RecurringBill` e `PlannedExpense` representam compromissos com ciclos de vida diferentes e nenhuma integracao.
- `SavingsGoal.currentAmount` e soma de `SavingsContribution` representam o mesmo saldo.
- `AccountSpendEntry` e `FinancialTransaction` representam movimentos sem fonte comum.
- `buildFinanceSummary` e `buildFinancePeriodSummary` repetem calculos.

## Estudos

| Funcionalidade/conceito atual | Classe | Motivo da classificacao |
| --- | --- | --- |
| Materia (`StudySubject`) | CORE | Unidade principal para decidir e agrupar estudo |
| Topico | CORE | Necessario para granularidade da proxima acao; hoje existe apenas como texto em erros |
| Sessao de estudo | CORE | Registra execucao e tempo |
| Resultado de questoes | CORE | Registra volume, acertos e erros |
| Revisao pendente | CORE | Fecha ciclo estudar, registrar, revisar |
| Proxima acao recomendada | CORE | Pergunta central do novo dashboard; ausente hoje |
| Metricas de questoes, acertos, tempo e revisoes | CORE | Conjunto essencial pedido para dashboard |
| Materias que precisam de atencao | CORE | Prioridade derivada para orientar proxima acao |
| Meta semanal de horas da materia | SUPPORT | Pode ajudar priorizacao sem criar novo fluxo |
| Notas de materia/sessao | SUPPORT | Contexto opcional, nao regra estrutural |
| Timer Pomodoro | SUPPORT | Ajuda executar sessao, mas nao deve manter outro conceito de sessao |
| Filtros por periodo/materia | SUPPORT | Uteis para consulta secundaria |
| Historico de sessoes | SUPPORT | Necessario para conferencia e edicao eventual |
| Fila e estado de revisao | SUPPORT | Operacao da revisao; estados devem permanecer poucos |
| Planejamento semanal por blocos | ADVANCED | Tem valor, mas adiciona quadro, CRUD e varios estados antes de estudar |
| Caderno de erros | ADVANCED | Ajuda revisao qualitativa, mas formulario atual excede fluxo essencial |
| Importacao/planos especificos TRT | ADVANCED | Conteudo especializado, nao dominio generico de Estudos |
| Busca/filtros/checklists dos planos TRT | ADVANCED | So sustentam duas telas de conteudo estatico |
| Grade recorrente (`StudyScheduleBlock`) | REMOVE | Segundo modelo de agenda, sem papel claro no fluxo principal atual |
| Dois planejadores estaticos como rotas principais | REMOVE | Criam tipos, JSONs, estados e navegacao especificos ao concurso |
| `StudyPlanProgress` generico para dois JSONs | REMOVE | Persistencia existe apenas para sustentar telas especificas |
| `PomodoroSession` separado de `StudySession` | REMOVE | Duplica registro de tempo de estudo |
| Pratica agregada sem vinculo com sessao | REMOVE | Exige sincronizacao manual por materia/data e permite divergencia |
| Hierarquia textual `initialTopic/generalSubject/topic/microTopic` | REMOVE | Campos sobrepostos, sem entidade ou regra consistente |
| Taxonomia extensa de erro | REMOVE | `errorType`, motivo, nivel, detalhe, armadilha, palavra, regra, frase e acao elevam formulario e estado |
| Tres estados de erro mais `correctionStatus` | REMOVE | Dois eixos de progresso sobrepostos para correcao/revisao |
| Paineis repetidos de revisao no dashboard e caderno | REMOVE | Mesma fila/pressao apresentada em superficies diferentes |

### CRUDs e estados que geram complexidade

- CRUDs completos: materia, bloco semanal, sessao, pratica de questoes e erro.
- Escrita adicional: substituicao de slot da grade e substituicao completa do progresso de plano.
- Planner mantem navegacao semanal, filtro, formularios de bloco/sessao/materia, dialogs e sincronizacao sessao-pratica.
- Caderno de erros mantem 7 estados de filtro/paginacao antes dos estados dos 3 dialogs extensos.
- Planos TRT repetem busca, filtro, visualizacao, semanas abertas, migracao de `localStorage` e persistencia.

### Redundancias principais

- `StudyScheduleBlock` e `StudyPlanBlock` sao dois modelos de planejamento temporal.
- `StudySession` e `PomodoroSession` sao dois registros de tempo estudado.
- `StudyQuestionPractice` e `StudyMistake` registram resultado em granularidades diferentes sem relacao.
- `reviewDate/status` no erro substituem parcialmente uma revisao, mas misturam conteudo, agenda e progresso.
- `StudyPlanProgress` cria um terceiro conceito de progresso, alem de sessao e revisao.
- Dashboard, planner e caderno recalculam desempenho e prioridades a partir de consultas independentes.

## Prioridade observada para proximas specs

- Financas: resolver fontes paralelas de movimento, ausencia de conta, dois tipos de compromisso e saldo duplicado de meta.
- Estudos: resolver sessoes duplicadas, agendas duplicadas, resultado sem vinculo, ausencia de topico estruturado e revisao embutida em erro.
- Ambos: reduzir CRUDs expostos, mover configuracao para papel secundario e trocar scroll do conteudo inteiro por regioes internas definidas.
