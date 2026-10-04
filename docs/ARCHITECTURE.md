# Arquitetura do LifeUp

## Objetivo arquitetural

Manter um monolito modular simples: uma aplicacao Next.js entrega interface e
API, enquanto Prisma centraliza o acesso ao PostgreSQL. Cada dominio possui
fronteiras reconheciveis e reutiliza infraestrutura transversal sem criar um
framework interno.

## Visao geral

```text
Browser
  -> Next.js App Router pages/components
  -> TanStack Query hooks
  -> typed services + apiClient
  -> Next.js route handlers (/api)
  -> validation/domain helpers
  -> Prisma Client
  -> PostgreSQL
```

O repositorio tambem contem um cliente Android em `android/LifeUp-Kotlin`. A API
web existente e o contrato de integracao; mudancas incompativeis precisam
considerar os dois clientes.

## Camadas e dependencias permitidas

| Camada | Local | Responsabilidade | Pode depender de |
| --- | --- | --- | --- |
| Pagina | `src/app/**/page.tsx` | Compor tela e fluxo | components, hooks, types, lib pura |
| Componente | `src/components` | UI e interacao local | ui, hooks, types, lib pura |
| Hook | `src/hooks` | Query, mutation e cache | services, types |
| Service | `src/services` | HTTP tipado | api-client, types |
| API | `src/app/api` | Auth, validacao e orquestracao | lib, Prisma, tipos server-safe |
| Dominio/helper | `src/lib` | Regras reutilizaveis e infraestrutura | tipos e bibliotecas essenciais |
| Persistencia | `prisma/schema.prisma` | Forma e integridade dos dados | PostgreSQL |

Dependencias apontam para baixo. Prisma nunca chega ao componente; componentes
nao pulam services/hooks para executar CRUD; route handlers nao importam UI.

## Fronteiras server/client

- Use `"use client"` apenas quando houver hooks, eventos ou APIs do navegador.
- Segredos e `DATABASE_URL` permanecem no servidor.
- Acesso ao banco ocorre somente em codigo de servidor.
- Dados retornados pela API devem ser serializaveis e tipados no consumidor.
- `NEXT_PUBLIC_API_URL` e a unica base publica prevista pelo `apiClient` atual.

## Autenticacao e autorizacao

O estado atual usa o cookie `lifeup_user_id`.

1. O login grava o identificador do usuario no cookie.
2. `getCurrentUserId()` interpreta esse cookie no servidor.
3. Route handlers protegidos chamam `requireCurrentUserId()`.
4. Toda consulta e escrita de dados pessoais inclui o `userId` retornado.
5. IDs recebidos em path, query ou body nunca substituem a verificacao de dono.

Autenticacao por cookie simples nao deve ser confundida com uma solucao final de
identidade. Uma troca futura do mecanismo deve preservar a regra de isolamento.

## Dominios persistidos

`prisma/schema.prisma` e a fonte de verdade. O mapa atual e:

```text
User
  |- Goal
  |- LifeHabit
  |- InboxItem -> Note (opcional)
  |- Note
  |- PomodoroSession -> StudySubject/StudyTopic (opcional)
  |- StudySubject -> StudyTopic -> StudySession/StudyReview
  |- FinancialCategory
  |- FinancialAccount -> FinancialTransaction
  |- FinancialCommitment -> FinancialTransaction
  |- FinancialImport -> FinancialTransaction
  |- SavingsGoal -> SavingsContribution
  `- Notification
```

Regras importantes:

- Todo dominio pessoal pertence diretamente a `User`, mesmo quando tambem possui
  uma relacao com outro registro.
- Relacoes devem declarar comportamento de exclusao conscientemente.
- Valores financeiros usam `Decimal`, nunca ponto flutuante como fonte de verdade.
- Saldos e progresso financeiro sao calculados a partir de movimentos.
- Arrays de datas de `LifeHabit` sao a persistencia atual; normalize apenas com
  migracao planejada e decisao registrada.

## Padrao de uma funcionalidade CRUD

Use Goal como referencia de fluxo:

```text
src/types/Goal.ts
src/lib/goals.ts
src/services/GoalServices.ts
src/hooks/useGoals.ts
src/app/api/goals/route.ts
src/app/api/goals/[id]/route.ts
src/components/goals/GoalBoard.tsx
src/app/goals/page.tsx
```

Nem toda funcionalidade precisa de todos os arquivos. Crie apenas o que tiver
responsabilidade real; nao adicione wrappers vazios para satisfazer a arvore.

## Estado

- Estado remoto: TanStack Query.
- Estado efemero de formulario/dialogo: React local ou React Hook Form.
- Estado global de cliente: Zustand somente quando varias arvores distantes
  realmente compartilham estado que nao pertence ao servidor.
- Preferencias persistidas no navegador: `localStorage` apenas para dados nao
  sensiveis e explicitamente locais, como tema.
- Nao duplique dados do servidor em um store global.

## Cache e mutations

- Query keys comecam pelo dominio: `['goals', ...]`, `['finance', ...]` etc.
- Parametros que mudam o resultado fazem parte da query key.
- Mutation bem-sucedida invalida as listas, detalhes e agregados afetados.
- Atualizacao otimista so e usada quando rollback e concorrencia estao tratados.
- Requests do `apiClient` usam JSON e propagam erro como `Error`.

## UI e design system

SnowUI e a linguagem visual vigente:

- tokens globais em `src/app/globals.css`;
- primitivas em `src/components/ui`;
- shell em `src/components/app-shell.tsx` e `app-sidebar.tsx`;
- padroes de produtividade em `src/components/productivity`;
- icones de `lucide-react`.

Estenda primitivas existentes antes de criar variacoes locais. Telas operacionais
devem respeitar `h-dvh`, rolagem interna e responsividade do shell atual.

## Validacao e erros

- Valide entrada na fronteira da API, mesmo que o formulario tambem valide.
- Helpers de normalizacao e regras compartilhadas ficam em `src/lib/<dominio>.ts`.
- Use status HTTP coerentes: 400 entrada invalida, 401 sem sessao, 404 recurso
  inexistente ou nao pertencente ao usuario, 409 conflito e 500 falha inesperada.
- Nao exponha stack, segredo ou objeto bruto de erro ao cliente.
- Mensagens visiveis ao usuario devem ser acionaveis e em portugues.

## Como evoluir a arquitetura

Uma alteracao e arquitetural quando cria ou remove camada, muda fluxo de dados,
adiciona dependencia estrutural, modifica fronteira entre dominios ou altera o
modelo de identidade/persistencia.

Para esse tipo de mudanca:

1. descreva contexto e problema;
2. compare a opcao proposta com a arquitetura atual;
3. registre decisao e consequencias em `docs/DECISIONS.md`;
4. implemente a menor fatia coerente;
5. atualize este documento e `docs/CURRENT_STATE.md`.

Se a tarefa nao exige uma mudanca arquitetural, siga o padrao existente.
