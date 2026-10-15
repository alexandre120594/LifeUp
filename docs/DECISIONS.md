# Decisoes de arquitetura e produto

Este e o registro leve de decisoes duradouras do LifeUp. O objetivo e impedir
que uma nova sessao de IA reabra ou contradiga decisoes sem contexto.

## Registro atual

### D001 - Monolito modular com Next.js e Prisma

- **Status:** aceita
- **Decisao:** manter interface e API no mesmo projeto Next.js; Prisma e o unico
  caminho de acesso ao PostgreSQL.
- **Consequencia:** nao criar backend, repository layer ou ORM paralelo sem um
  problema concreto que justifique uma nova decisao.

### D002 - Fluxo de dados do cliente

- **Status:** aceita
- **Decisao:** Page/Component -> React Query hook -> Service -> API route ->
  Prisma.
- **Consequencia:** CRUD direto em componentes e acesso Prisma no cliente nao sao
  permitidos.

### D003 - Goal e o dominio principal de direcao pessoal

- **Status:** aceita
- **Decisao:** `Goal` representa Meta e nao possui hierarquia de subitens.
  A antiga cadeia `Project -> Habit -> Task` permanece removida.
- **Consequencia:** recriar tarefas, projetos ou checklists dentro de Goal exige
  nova decisao de produto e desenho de migracao.

### D004 - Modulos independentes por padrao

- **Status:** aceita
- **Decisao:** Habitos, Inbox, Notas, Foco, Estudos e Financas compartilham a
  experiencia LifeUp, mas nao ganham relacoes entre si sem um caso de uso real.
- **Consequencia:** o dashboard pode compor dados; a persistencia nao precisa
  formar uma arvore universal.

### D005 - Isolamento por usuario no servidor

- **Status:** aceita
- **Decisao:** todo acesso a dados pessoais usa o usuario autenticado no servidor.
- **Consequencia:** IDs enviados pelo cliente nunca sao prova de propriedade.

### D006 - SnowUI como linguagem visual canonica

- **Status:** aceita
- **Decisao:** tokens globais e primitivas existentes formam o design system.
- **Consequencia:** novos componentes devem compor ou estender esse sistema, nao
  criar uma segunda linguagem visual.

### D007 - Documentacao canonica curta e atual

- **Status:** aceita
- **Decisao:** `AGENTS.md` e `docs/*.md` descrevem contrato, produto, arquitetura,
  estado e decisoes; documentos historicos nao prevalecem sobre codigo atual.
- **Consequencia:** toda mudanca estrutural atualiza esses documentos no mesmo
  trabalho.

### D008 - Registros estruturados e compatibilidade de habitos

- **Data:** 2026-10-04
- **Status:** aceita
- **Contexto:** o tracker anterior representava apenas conclusoes e recaidas em
  arrays de datas, insuficientes para quantidades, checklist e agendas flexiveis.
  O cliente Android existente ainda depende desses arrays e dos valores
  `good`/`bad`.
- **Decisao:** `LifeHabit.completions` passa a representar os registros diarios
  estruturados. Configuracao, agenda e subetapas permanecem no proprio habito.
  A API faz dual-write dos arrays legados e preserva `good`/`bad` no transporte
  bruto; o service web normaliza esses valores para o novo dominio.
- **Alternativas:** criar um segundo modulo/API foi descartado por duplicar o
  dominio; remover imediatamente o legado foi descartado por quebrar o Android.
- **Consequencias:** o web pode oferecer os tres tipos e metricas corretas sem
  perda do historico atual. Os campos legados so podem ser removidos depois da
  migracao do Android e de uma verificacao de equivalencia dos registros.

### D009 - Conteudo estatico e progresso persistente para cronogramas de estudo

- **Data:** 2026-10-13
- **Status:** aceita
- **Contexto:** o cronograma TRT-PI possui 150 dias de conteudo editorial fixo,
  enquanto conclusoes e percentuais de acerto pertencem a cada usuario e nao
  podem depender do armazenamento de um unico navegador.
- **Decisao:** manter o conteudo versionado em JSON e persistir somente o estado
  mutavel de cada dia em `StudyPlanProgress`, identificado por usuario, plano e
  numero do dia.
- **Alternativas:** `localStorage` foi descartado por perder sincronizacao e
  recuperacao entre navegadores; criar 150 registros de conteudo no banco foi
  descartado porque o plano nao e editavel nesta fatia.
- **Consequencias:** o conteudo continua auditavel no repositorio, enquanto as
  marcacoes sobrevivem a recarregamentos e dispositivos. Alterar IDs ou a ordem
  dos dias exige preservar a correspondencia com o progresso existente.

## Quando adicionar uma decisao

Adicione uma entrada quando a mudanca:

- cria/remove uma entidade ou relacao importante;
- muda autenticacao, persistencia ou fluxo de dados;
- adiciona uma camada ou dependencia estrutural;
- conecta dominios antes independentes;
- altera um principio de produto ou uma invariante deste repositorio.

Correcoes locais e escolhas facilmente reversiveis nao precisam de registro.

## Modelo

```md
### DNNN - Titulo

- **Data:** AAAA-MM-DD
- **Status:** proposta | aceita | substituida por DNNN
- **Contexto:** problema e restricoes verificadas.
- **Decisao:** o que sera adotado.
- **Alternativas:** opcoes relevantes descartadas e por que.
- **Consequencias:** custos, riscos e trabalho futuro.
```

Nunca apague uma decisao substituida. Marque seu status e aponte para a nova.
