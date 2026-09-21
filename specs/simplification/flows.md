# Novos fluxos

Definicao da etapa 3. Este documento descreve a ordem operacional, as acoes, as informacoes necessarias e o que deixa de fazer parte do caminho principal. Nao especifica layout nem implementa codigo.

## Regras compartilhadas

- Cada modulo possui uma acao primaria visivel por contexto.
- Criacao pede primeiro o minimo necessario; detalhes opcionais aparecem como complemento.
- Acoes secundarias ficam junto do objeto a que pertencem ou em configuracao.
- Sucesso devolve o usuario ao proximo estado util e atualiza os resumos afetados.
- Erro preserva os dados digitados, explica o campo ou operacao e permite tentar novamente.
- Exclusao destrutiva exige confirmacao; arquivamento e preferido quando existe historico.
- Filtros refinam historico e consulta, mas nao bloqueiam a acao principal.

## Financas

Fluxo principal:

```text
Visao -> Nova movimentacao -> Compromissos -> Objetivos
```

### 1. Visao

Pergunta respondida: `Como estao minhas financas agora?`

Acao principal:

- `Nova movimentacao`.

Acoes secundarias:

- trocar periodo de leitura;
- trocar ou filtrar conta;
- abrir todas as movimentacoes;
- abrir compromissos;
- abrir objetivos;
- acessar importacao e configuracao de contas/categorias.

Informacoes necessarias:

- saldo atual total e por conta;
- entradas, saidas e resultado do periodo;
- movimentacoes recentes;
- compromissos vencidos e proximos;
- progresso resumido dos objetivos ativos;
- periodo e conta atualmente considerados.

Ordem de atencao:

1. compromisso vencido;
2. saldo e resultado do periodo;
3. movimentacoes recentes;
4. proximos compromissos;
5. objetivos.

Estados:

- sem conta: orientar criacao da primeira conta antes da movimentacao;
- conta sem movimento: mostrar saldo inicial e CTA de nova movimentacao;
- sem compromisso ou objetivo: omitir urgencia e oferecer criacao contextual, sem falso alerta;
- falha parcial: identificar a regiao indisponivel sem esconder dados ja carregados.

Sai do fluxo principal:

- seletor `Add record` com cinco entidades;
- CRUD de categoria como tipo de registro;
- tres graficos e painel de insights;
- orcamento mensal;
- link de destaque para tracker isolado;
- saldo calculado apenas pelo recorte mensal/anual.

### 2. Nova movimentacao

Pergunta respondida: `O que entrou ou saiu?`

Acao principal:

- `Salvar movimentacao`.

Primeiro passo, obrigatorio:

- tipo: entrada ou saida;
- valor;
- descricao;
- conta;
- data, preenchida inicialmente com hoje.

Detalhes opcionais:

- categoria compativel com o tipo;
- observacao.

Acoes secundarias:

- criar categoria sem abandonar o formulario;
- importar arquivo, em um fluxo separado;
- cancelar.

Resultado de sucesso:

- cria uma unica `FinancialTransaction`;
- atualiza saldo, resumo e lista recente;
- confirma a operacao sem abrir outro cadastro;
- retorna a Visao ou permanece em captura rapida se o usuario escolher adicionar outra.

Validacoes:

- valor maior que zero;
- descricao nao vazia;
- conta ativa e pertencente ao usuario;
- categoria, se informada, pertence ao usuario e corresponde ao tipo;
- data valida.

Importacao secundaria:

```text
Selecionar arquivo e conta -> Pre-visualizar -> Corrigir/ignorar linhas -> Confirmar -> Criar movimentacoes
```

A importacao nunca cria `AccountSpendEntry`; cada linha confirmada vira movimentacao com referencia ao lote.

### 3. Compromissos

Pergunta respondida: `O que preciso pagar ou receber a seguir?`

Acao principal:

- no conjunto vazio: `Novo compromisso`;
- com itens vencidos ou proximos: `Quitar` no compromisso prioritario.

Acoes secundarias:

- criar compromisso;
- editar;
- cancelar;
- ativar ou pausar recorrencia;
- filtrar por pendente, concluido ou cancelado;
- consultar movimentacoes originadas pelo compromisso.

Informacoes necessarias na lista:

- descricao;
- valor e tipo;
- vencimento;
- indicador de atraso;
- recorrencia, quando mensal;
- conta e categoria previstas, quando informadas;
- estado.

Criacao progressiva:

- obrigatorio: descricao, valor, tipo e vencimento;
- opcional: mensal, conta prevista, categoria e observacao.

Quitacao:

```text
Quitar -> Confirmar valor, conta e data -> Criar movimentacao vinculada
       -> Unico: concluir compromisso
       -> Mensal: avancar proximo vencimento
```

Regras de excecao:

- compromisso vencido permanece visivel ate quitar ou cancelar;
- editar recorrencia nao reescreve movimentacoes passadas;
- cancelar nao apaga movimentacoes ja geradas;
- falha ao criar movimentacao nao altera o estado/vencimento do compromisso.

Sai do fluxo principal:

- paginas e formularios distintos para `PlannedExpense` e `RecurringBill`;
- frequencias sem uso alem de mensal;
- pagamento que apaga o compromisso;
- recorrencias persistidas mas ausentes da consulta operacional.

### 4. Objetivos

Pergunta respondida: `Quanto falta para meus objetivos financeiros?`

Acao principal:

- no conjunto vazio: `Novo objetivo`;
- com objetivos ativos: `Adicionar aporte` no objetivo selecionado.

Acoes secundarias:

- criar, editar, arquivar ou cancelar objetivo;
- editar ou excluir aporte com confirmacao;
- consultar historico de aportes;
- filtrar ativos e encerrados.

Informacoes necessarias:

- titulo;
- valor atual derivado;
- valor-alvo;
- percentual e valor restante;
- prazo opcional;
- estado.

Criacao progressiva:

- obrigatorio: titulo e valor-alvo;
- opcional: prazo.

Aporte:

- obrigatorio: valor e data;
- opcional: observacao;
- ao salvar, recalcula o progresso pela soma dos aportes;
- ao atingir o alvo, apresenta conclusao sem exigir outro cadastro.

Sai do fluxo principal:

- campo persistido de saldo atual editado em paralelo;
- paginacao de aportes dentro do dashboard geral;
- grafico dedicado quando valor atual, restante e progresso ja respondem a pergunta.

### Navegacao secundaria de Financas

- `Movimentacoes`: historico, busca, filtros e edicao eventual.
- `Contas e categorias`: configuracao e arquivamento.
- `Importar`: recurso avancado acessado pela Visao ou pelo historico.

Essas superficies nao adicionam novos tipos de registro ao CTA principal.

## Estudos

Fluxo principal:

```text
Proxima acao -> Sessao -> Resultado -> Revisao
```

### 1. Proxima acao

Pergunta respondida: `O que devo estudar agora?`

Acao principal:

- `Iniciar sessao` para a recomendacao atual.

Acoes secundarias:

- trocar materia ou topico;
- registrar sessao ja realizada;
- abrir revisoes pendentes;
- consultar materias e historico;
- editar meta semanal.

Informacoes necessarias:

- materia recomendada;
- topico, quando houver base para recomendar;
- motivo curto e verificavel: revisao vencida, deficit semanal, baixa acuracia ou tempo sem estudar;
- duracao sugerida, inicialmente 25 minutos, ajustavel;
- revisoes vencidas;
- tempo, questoes e acuracia da semana;
- materias que precisam de atencao, em lista curta.

Prioridade:

1. revisao vencida mais antiga;
2. maior deficit da meta semanal;
3. menor acuracia recente com volume minimo;
4. materia estudada ha mais tempo;
5. primeira materia ativa sem historico.

Estados:

- sem materia: CTA `Criar primeira materia`;
- materia sem topico: permitir iniciar somente com a materia;
- sem historico: explicar que a recomendacao inicial usa a primeira materia ativa;
- sem revisao vencida: nao exibir urgencia artificial;
- recomendacao indisponivel por erro: permitir escolha manual e nova tentativa.

Sai do fluxo principal:

- cinco atalhos equivalentes;
- escolha obrigatoria entre dashboard, planner e caderno antes de estudar;
- planos TRT;
- quadro semanal e grade recorrente;
- paineis duplicados de revisao.

### 2. Sessao

Pergunta respondida: `Estou estudando o que decidi?`

Acao principal:

- durante execucao: `Concluir sessao`;
- no registro manual: `Salvar sessao`.

Antes de iniciar:

- materia obrigatoria;
- topico opcional;
- duracao sugerida ajustavel;
- notas opcionais.

Durante a sessao:

- exibir materia, topico e tempo;
- permitir pausar, retomar e encerrar;
- navegacao nao deve criar outra sessao nem perder o timer ativo.

Registro manual:

- materia, inicio/fim ou duracao;
- topico e notas opcionais;
- segue para o mesmo Resultado.

Resultado de sucesso:

- existe exatamente um `StudySession`;
- timer e registro manual produzem o mesmo tipo de dado;
- a sessao segue para Resultado sem criar `PomodoroSession` paralela.

Excecoes:

- sessao cancelada nao entra nas metricas;
- restauracao do timer deve retomar o mesmo rascunho local;
- falha ao salvar preserva os dados e permite tentar novamente;
- materia arquivada nao inicia nova sessao, mas permanece no historico antigo.

### 3. Resultado

Pergunta respondida: `O que fiz e como fui?`

Acao principal:

- `Concluir resultado`.

Informacoes ja preenchidas:

- materia e topico;
- inicio, fim e duracao.

Informacoes opcionais:

- total de questoes;
- quantidade de acertos;
- notas da sessao;
- zero ou mais itens para revisar, cada um com pergunta/ponto de lembranca e resposta/nota opcional.

Validacoes:

- totais inteiros e nao negativos;
- acertos nao superam o total;
- item de revisao exige `prompt`;
- materia e topico do item herdam a sessao, com possibilidade de ajuste.

Resultado de sucesso:

- atualiza a mesma `StudySession` com os totais;
- cria as revisoes informadas em uma unica operacao coerente;
- atualiza tempo, questoes, acuracia e prioridade;
- oferece `Voltar para proxima acao` ou `Revisar agora` quando houver item devido.

Sai do fluxo principal:

- formulario separado de pratica por materia/data;
- sincronizacao manual entre sessao e pratica;
- formulario de erro com taxonomia extensa;
- campos `initialTopic`, `generalSubject`, `topic` e `microTopic` concorrentes;
- estados distintos de correcao e dominio.

### 4. Revisao

Pergunta respondida: `O que preciso recuperar hoje?`

Acao principal:

- `Revisar proximo`.

Acoes secundarias:

- escolher outro item;
- filtrar por materia;
- editar conteudo;
- capturar revisao manual;
- consultar dominados;
- excluir com confirmacao.

Informacoes necessarias na fila:

- pergunta ou ponto de lembranca;
- materia e topico;
- vencimento e atraso;
- resposta inicialmente oculta;
- notas, quando existirem.

Ciclo de um item:

```text
Abrir -> Tentar lembrar -> Revelar resposta
      -> Reagendar: escolher proxima data, continua pendente
      -> Dominar: sai da fila ativa, preserva historico
```

Ordenacao:

1. vencidos, do mais antigo para o mais recente;
2. de hoje;
3. futuros, por data.

Regras de excecao:

- item sem resposta ainda pode ser revisado pelas notas;
- item dominado nao volta sozinho para pendente;
- editar materia/topico nao altera sessoes anteriores;
- falha ao reagendar ou dominar mantem o item na posicao atual e permite repetir.

Sai do fluxo principal:

- caderno de erros como segunda aplicacao dentro de Estudos;
- sete filtros antes de iniciar revisao;
- diagnostico e correcao guiada obrigatorios;
- estados `unresolved`, `reviewed`, `mastered` junto de `correctionStatus`;
- fila repetida no dashboard e em outra pagina.

### Navegacao secundaria de Estudos

- `Historico`: sessoes com filtros e edicao eventual.
- `Materias e topicos`: configuracao, meta semanal e arquivamento.
- `Revisoes`: fila completa e historico dominado.

Nao permanecem como entradas principais: planner semanal, grade fixa, caderno de erros separado e planos TRT.

## Criterios de aceite dos fluxos

### Financas

- Da Visao, uma movimentacao e salva sem passar por seletor de entidade.
- Um compromisso quitado gera uma unica movimentacao e preserva rastreabilidade.
- Uma recorrencia mensal avanca sem apagar o historico pago.
- Saldo usa conta e movimentacoes; objetivo usa aportes; importacao nao cria saldo paralelo.
- Categoria, conta e importacao continuam acessiveis sem dominar o dashboard.

### Estudos

- A primeira superficie oferece uma recomendacao com motivo compreensivel.
- Timer e registro manual terminam na mesma entidade de sessao.
- Resultado de questoes pertence a sessao e atualiza uma unica metrica canonica.
- Revisao pode ser criada no Resultado e processada com apenas reagendar ou dominar.
- O usuario completa o ciclo sem entrar em planner, plano TRT ou caderno de erros separado.
