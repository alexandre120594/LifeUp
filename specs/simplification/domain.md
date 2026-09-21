# Dominio simplificado

Decisoes da etapa 2. Este documento transforma a auditoria da etapa 1 em um contrato de dominio para as futuras refatoracoes. Nao descreve uma migracao ja implementada.

## Principios

- Uma informacao financeira ou de estudo deve ter uma unica fonte de verdade.
- A entidade existe somente quando possui identidade, historico ou ciclo de vida proprio; tipo ou campo resolve os demais casos.
- Configuracao e recursos avancados nao competem com a acao principal.
- Valores derivados nao sao persistidos quando podem ser calculados com seguranca a partir dos registros-base.
- Estados textuais livres devem virar conjuntos pequenos e explicitos durante a implementacao.
- A refatoracao deve substituir primeiro e remover o legado somente depois de preservar os dados essenciais.

## Financas

### Resultado pretendido

O dominio passa a responder quatro perguntas:

1. Quanto existe agora em cada conta e no total?
2. Quais entradas e saidas ja aconteceram?
3. Quais compromissos vencem a seguir?
4. Como estao os objetivos financeiros?

O nucleo alvo e:

```text
User
  -> FinancialAccount
  -> FinancialTransaction -> FinancialCategory
  -> FinancialCommitment -> FinancialCategory
  -> SavingsGoal -> SavingsContribution
  -> FinancialImport -> FinancialTransaction
```

### Decisoes `ANTES -> DEPOIS`

| Antes | Decisao | Depois | Motivo |
| --- | --- | --- | --- |
| Nenhuma conta; saldo e apenas fluxo do periodo | `KEEP` da necessidade e criacao futura | `FinancialAccount` com nome, saldo inicial e estado ativo | Saldo real por conta nao cabe em categoria nem em transacao isolada; conta possui identidade e ciclo de vida proprios |
| `FinancialTransaction` manual | `KEEP` | Uma movimentacao realizada, sempre vinculada a uma conta | E a fonte de verdade para entradas, saidas e saldo atual |
| `AccountSpendEntry` separado | `MERGE` | Linha aceita de importacao vira `FinancialTransaction` | Elimina a trilha paralela que nao altera o dashboard |
| `AccountSpendImport` e tracker proprio | `MERGE` | `FinancialImport` guarda apenas metadados do lote e se relaciona com movimentacoes importadas | Preserva rastreabilidade sem outro livro-caixa ou outra pagina principal |
| `PlannedExpense` | `MERGE` | `FinancialCommitment` de ocorrencia unica | O nome atual nao representa entradas planejadas e duplica a forma de compromisso |
| `RecurringBill` | `MERGE` | O mesmo `FinancialCommitment`, com recorrencia opcional | Um compromisso muda de frequencia, nao de natureza |
| Pagar compromisso cria transacao e apaga o planejamento | `MERGE` | Pagar gera uma movimentacao vinculada; ocorrencia unica termina e recorrente avanca o proximo vencimento | Mantem rastreabilidade e evita destruir o contexto do pagamento |
| `FinancialCategory` como CRUD no seletor principal | `KEEP` secundario | Classificacao reutilizada por movimentacao e compromisso, gerida em configuracao contextual | Categoria ajuda leitura, mas nao e um tipo de registro |
| `Budget` | `REMOVE` | Sem entidade de orcamento no dominio simplificado | Planejamento por categoria e avancado e amplia CRUD, regras mensais e dashboard sem sustentar o fluxo minimo |
| `SavingsGoal` | `KEEP` | Objetivo com valor-alvo, prazo opcional e estado | Possui identidade e ciclo de vida proprios |
| `SavingsGoal.currentAmount` | `REMOVE` | Progresso derivado da soma dos aportes | Remove saldo duplicado e risco de divergencia |
| `SavingsContribution` | `KEEP` | Aporte imutavel/editavel vinculado ao objetivo | Historico de aporte e informacao real; nao e entrada nem saida da conta por si so |
| `FinancialSummary` | `REMOVE` | Resumo calculado a partir das movimentacoes | Entidade sem consumidor e com dados derivados |
| Resumos duplicados no servidor e no cliente | `MERGE` | Uma regra compartilhada/canonizada por periodo | Evita resultados diferentes para a mesma metrica |
| Cinco tipos em `Add record` | `REMOVE` | `Nova movimentacao` e a unica acao primaria | Compromissos, objetivos e configuracoes ficam nos seus contextos |
| Graficos e insights como estrutura do dashboard | `REMOVE` do fluxo principal | Resumo operacional, proximos compromissos e objetivos | Visualizacao secundaria nao deve ocupar a area necessaria para agir |

### Entidades alvo

#### `FinancialAccount` — nova, necessaria

Campos essenciais:

- `id`, `userId`
- `name`
- `openingBalance`
- `isActive`
- `createdAt`, `updatedAt`

Regras:

- toda movimentacao pertence a uma conta;
- saldo atual = saldo inicial + entradas - saidas;
- conta com movimentacoes nao e excluida de forma destrutiva; pode ser arquivada;
- uma conta padrao deve absorver dados antigos na migracao.

Nao entram agora: instituicao, agencia, numero, cartao, limite, fatura ou conciliacao bancaria.

#### `FinancialTransaction` — mantida e ampliada

Campos essenciais:

- `id`, `userId`, `accountId`
- `title`, `amount`, `type` (`income` ou `expense`)
- `date`, `notes?`, `categoryId?`
- `commitmentId?`, `importId?`
- `createdAt`, `updatedAt`

Regras:

- `amount` e sempre positivo; `type` define o sinal;
- movimentacao e o unico registro que altera saldo;
- categoria e opcional para captura rapida e pode ser completada depois;
- vinculos de compromisso e importacao registram origem, sem criar outra especie de movimento;
- transferencia entre contas fica fora deste ciclo; nao criar terceiro tipo antes de definir sua regra contabil.

#### `FinancialCommitment` — fusao de planejado e recorrente

Campos essenciais:

- `id`, `userId`
- `title`, `amount`, `type`
- `dueDate`, `recurrence` (`none` ou `monthly`)
- `status` (`active`, `completed` ou `cancelled`)
- `categoryId?`, `accountId?`, `notes?`
- `createdAt`, `updatedAt`

Regras:

- compromisso nao altera saldo;
- quitar exige ou confirma conta e data, entao cria `FinancialTransaction` vinculada;
- compromisso unico quitado passa a `completed`;
- compromisso mensal quitado permanece `active` e avanca `dueDate` um mes;
- recorrencias alem de mensal ficam fora ate existir necessidade comprovada;
- nao criar entidade de ocorrencia nesta etapa: a movimentacao vinculada preserva o historico pago.

#### `FinancialCategory` — mantida como apoio

Campos essenciais:

- `id`, `userId`, `name`, `type`, `color?`, `isDefault`

Regras:

- nome e tipo continuam unicos por usuario;
- categoria em uso nao e excluida; pode ser renomeada ou substituida;
- criacao/edicao ocorre como acao secundaria no campo de categoria ou em configuracoes.

#### `SavingsGoal` e `SavingsContribution` — mantidas sem duplicacao

`SavingsGoal` conserva titulo, valor-alvo, prazo opcional e estado. `SavingsContribution` conserva valor, data e nota opcional.

Regras:

- valor atual = soma dos aportes;
- conclusao e derivada quando a soma alcanca o alvo, com possibilidade de arquivar/cancelar separadamente;
- aporte nao altera saldo de conta automaticamente;
- se no futuro um aporte representar transferencia real, a ligacao com movimentacao deve ser especificada antes de ser criada.

#### `FinancialImport` — apoio avancado

Guarda nome do arquivo, tipo de origem, data da importacao, conta de destino e contagem de linhas. Nao guarda um segundo conjunto de lancamentos.

Regras:

- a previa permite revisar linhas antes de confirmar;
- somente a confirmacao cria movimentacoes;
- excluir lote so pode excluir movimentacoes importadas mediante confirmacao explicita;
- importacao nao aparece como acao primaria do dashboard.

### Entidades removidas do alvo

- `Budget`
- `RecurringBill`
- `PlannedExpense`
- `FinancialSummary`
- `AccountSpendEntry`

Os conceitos uteis de recorrencia, planejamento e importacao sobrevivem nas entidades consolidadas. Orcamento e snapshot nao sobrevivem.

### Impactos e dependencias de implementacao

- Prisma: adicionar conta e relacionamentos; consolidar compromissos; ligar importacao a movimentacao; remover saldo duplicado e modelos obsoletos apenas apos migracao.
- Migracao: criar conta padrao por usuario; associar transacoes antigas; converter planejados e recorrencias; transformar entradas importadas aceitas em movimentacoes sem duplicar linhas.
- API: trocar CRUD por entidade por endpoints orientados a movimentacoes, compromissos e objetivos; pagamento deve ser atomico.
- Services/hooks: uma consulta operacional de Financas e mutacoes por fluxo; invalidacao deixa de depender de varias trilhas paralelas.
- Analytics: saldo e resumo por periodo partem apenas de movimentacoes; progresso de objetivo parte apenas de aportes.
- UI: categorias/importacao ficam secundarias; orcamento, tracker isolado, graficos redundantes e seletor de cinco registros deixam o fluxo principal.
- Integridade: exclusao/arquivamento de conta, categoria, compromisso, objetivo e lote precisa respeitar registros historicos.

## Estudos

### Resultado pretendido

O dominio passa a responder quatro perguntas:

1. O que devo estudar agora?
2. O que foi feito nesta sessao?
3. Qual foi o resultado?
4. O que precisa ser revisado e quando?

O nucleo alvo e:

```text
User
  -> StudySubject -> StudyTopic
  -> StudySession -> StudySubject / StudyTopic
  -> StudyReview -> StudySubject / StudyTopic
```

### Decisoes `ANTES -> DEPOIS`

| Antes | Decisao | Depois | Motivo |
| --- | --- | --- | --- |
| `StudySubject` | `KEEP` | Materia com meta semanal opcional | E a unidade estavel de agrupamento e priorizacao |
| Topicos apenas como textos sobrepostos em erro | `MERGE` e estruturacao | `StudyTopic` simples, filho de materia | Topico possui reutilizacao entre sessao e revisao; substitui quatro campos textuais |
| `StudySession` | `KEEP` | Registro unico de tempo e resultado | E o evento central de execucao |
| `PomodoroSession` | `MERGE` | Timer finalizado cria/atualiza `StudySession` | Elimina duas trilhas de tempo |
| `StudyQuestionPractice` separado | `MERGE` | Totais de questoes ficam na propria sessao | Evita sincronizacao por materia/data e divergencia |
| `StudyMistake` com 23 campos | `MERGE` e reducao | `StudyReview` com conteudo minimo, vencimento e estado | Preserva fila de revisao sem manter taxonomia e correcao paralelas |
| `reviewDate`, `status` e `correctionStatus` | `MERGE` | Um estado de revisao e uma proxima data | Um unico ciclo de vida operacional |
| `StudyScheduleBlock` | `REMOVE` | Sem grade recorrente | Duplica planejamento e nao orienta o fluxo atual |
| `StudyPlanBoard` e `StudyPlanBlock` | `REMOVE` do dominio simplificado | Proxima acao derivada diretamente dos dados essenciais | Quadro semanal e CRUD de blocos sao avancados e antecedem desnecessariamente a sessao |
| `StudyPlanProgress` | `REMOVE` | Sem checklist generico de JSON estatico | Existe apenas para duas experiencias especificas |
| Planos TRT e tipos/JSONs proprios | `REMOVE` do modulo principal | Conteudo especifico pode existir futuramente fora do dominio generico | Nao deve definir entidades, navegacao ou prioridade de Estudos |
| Metricas calculadas em varias paginas | `MERGE` | Uma derivacao canonica de prioridade e metricas | Dashboard, sessao e revisao devem concordar |
| Dashboard, planner e caderno como centros separados | `MERGE` | Um workspace orientado a proxima acao, com historicos secundarios | Reduz navegacao e repeticao de formularios/filtros |

### Entidades alvo

#### `StudySubject` — mantida

Campos essenciais:

- `id`, `userId`
- `name`, `color?`
- `plannedMinutesPerWeek?`
- `notes?`
- `isActive`
- `createdAt`, `updatedAt`

Regras:

- nome permanece unico por usuario;
- materia com historico e arquivada, nao apagada em cascata pela UI comum;
- meta semanal ajuda a prioridade, mas nao bloqueia uma sessao.

#### `StudyTopic` — nova, necessaria

Campos essenciais:

- `id`, `userId`, `subjectId`
- `name`, `isActive`
- `createdAt`, `updatedAt`

Regras:

- nome e unico dentro da materia;
- topico e opcional na sessao e na revisao para permitir captura rapida;
- nao existem niveis `initialTopic`, `generalSubject`, `topic` e `microTopic` em paralelo;
- topico com historico e arquivado.

#### `StudySession` — evento unico de execucao e resultado

Campos essenciais:

- `id`, `userId`, `subjectId`, `topicId?`
- `startedAt`, `endedAt`, `durationMinutes`
- `totalQuestions?`, `correctQuestions?`
- `notes?`
- `createdAt`, `updatedAt`

Regras:

- uma sessao pode ser iniciada por timer ou registrada manualmente, mas termina no mesmo modelo;
- `wrongQuestions` e derivado de total menos acertos;
- resultado de questoes e opcional; quando informado, `0 <= correctQuestions <= totalQuestions`;
- sessao concluida atualiza as metricas sem criar pratica paralela;
- editar uma sessao edita o mesmo registro, sem sincronizacao entre APIs.

#### `StudyReview` — substitui erro e agenda de revisao

Campos essenciais:

- `id`, `userId`, `subjectId`, `topicId?`
- `prompt`
- `answer?`, `notes?`
- `dueAt`
- `status` (`pending` ou `mastered`)
- `lastReviewedAt?`
- `createdAt`, `updatedAt`

Regras:

- revisao pode nascer do resultado de uma sessao ou de captura manual;
- item pendente e vencido quando `dueAt <= hoje`;
- revisar registra `lastReviewedAt` e exige escolher `reagendar` ou `dominar`;
- reagendar mantem `pending` e define nova data;
- dominar encerra a fila sem apagar o historico;
- nao ha entidade de tentativa nem taxonomia extensa neste ciclo.

### Derivacao da proxima acao

A recomendacao deve ser deterministica e explicavel, nesta ordem:

1. revisao pendente vencida mais antiga;
2. materia ativa mais abaixo da meta semanal;
3. materia ativa com menor acuracia recente, desde que tenha volume minimo de questoes;
4. materia ativa estudada ha mais tempo;
5. primeira materia ativa, quando ainda nao existe historico.

O topico recomendado e, quando houver dados, o topico com revisao vencida ou menor acuracia recente dentro da materia. A interface deve mostrar o motivo da escolha. Nao criar modelo persistido de recomendacao.

### Metricas canonicas

- tempo estudado: soma de `StudySession.durationMinutes` no periodo;
- questoes: soma de `StudySession.totalQuestions` informado;
- acuracia: soma de acertos / soma de questoes, nunca media de percentuais;
- revisoes pendentes: `StudyReview.status = pending`;
- revisoes vencidas: pendentes com `dueAt <= hoje`;
- atencao da materia: revisoes vencidas, deficit da meta semanal e acuracia recente, nesta ordem de explicacao.

### Entidades removidas do alvo

- `PomodoroSession`
- `StudyQuestionPractice`
- `StudyMistake`
- `StudyScheduleBlock`
- `StudyPlanBoard`
- `StudyPlanBlock`
- `StudyPlanProgress`

Tempo e resultado sobrevivem em `StudySession`; erros e agenda sobrevivem em `StudyReview`. As duas agendas e o progresso de planos estaticos nao sobrevivem.

### Impactos e dependencias de implementacao

- Prisma: criar topico e revisao enxuta; ampliar sessao; migrar registros antes de remover os modelos antigos.
- Migracao: converter a melhor classificacao textual de cada erro em topico; mapear erro para revisao; combinar pratica com sessao apenas quando a correspondencia for inequivoca; preservar registros ambiguos sem inventar vinculo.
- Pomodoro: timer passa a gravar sessao; migrar sessoes antigas com materia quando houver e tratar registros sem materia de forma explicita.
- API: operacoes principais passam a sessao, resultado e revisao; conclusao de sessao com criacao de revisoes deve ser atomica quando enviada no mesmo formulario.
- Services/hooks: uma consulta do workspace e mutacoes por fluxo substituem consultas independentes para os mesmos indicadores.
- Analytics: centralizar prioridade, acuracia, deficit semanal e vencimento em funcoes compartilhadas e testaveis.
- UI: planner, grade, caderno extenso e atalhos TRT saem do fluxo principal; historico, materias e topicos ficam secundarios.
- Dados especificos TRT: remover da aplicacao somente depois de decidir se serao exportados, arquivados ou descartados; nao converter checklist em sessao automaticamente.

## Fora do escopo desta definicao

- Implementar schema, migracao, APIs, hooks ou UI.
- Definir layout responsivo; isso pertence a etapa 4.
- Criar transferencias, cartoes, faturas, conciliacao ou orcamentos financeiros.
- Criar repeticao financeira alem de mensal.
- Criar algoritmo opaco, IA ou entidade persistida para recomendacao de estudo.
- Criar cursos, concursos, trilhas, subtarefas, calendario ou novo planejador de estudos.

## Criterio de aceite para as etapas de implementacao

- Cada fato possui uma fonte de verdade.
- O fluxo essencial funciona sem abrir configuracoes ou recursos avancados.
- Nenhum dado essencial e removido antes de sua migracao ou substituicao.
- As regras derivadas sao centralizadas e cobertas por validacao focada.
- Entidades e telas legadas so sao removidas quando seus substitutos estiverem operacionais.
