# SPEC — Life Planner

## 1. Contexto técnico atual

Stack identificada:

```text
Next.js App Router
React
TypeScript
Prisma
PostgreSQL
TanStack React Query
Tailwind
SnowUI / componentes próprios
```

Padrão existente:

```text
types
↓
services
↓
hooks React Query
↓
components/pages
↓
Next.js API Routes
↓
Prisma
```

O Planner deve seguir exatamente esse padrão.

---

# 2. Nova rota

Criar:

```text
/planner
```

Adicionar ao grupo `Principal` do:

```text
src/components/app-sidebar.tsx
```

Sugestão:

```text
Hoje
Planner
Metas
Hábitos
Captura
Notas
```

Ícone sugerido:

```text
ListTodo
```

ou:

```text
CalendarCheck2
```

---

# 3. Novos domínios

Criar somente:

```text
PlannerTask
PlannedPurchase
```

Não criar:

```text
PlannerExpense
PlannerIncome
PlannerGoal
```

Esses conceitos já existem no Finance e Goals.

---

# 4. Prisma — PlannerTask

Adicionar relação no `User`.

Modelo conceitual:

```prisma
model PlannerTask {
  id          String   @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime?
  priority    String   @default("medium")
  status      String   @default("pending")

  goalId      String?
  goal        Goal?    @relation(fields: [goalId], references: [id], onDelete: SetNull)

  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, status, dueDate])
  @@index([userId, goalId])
}
```

Status:

```text
pending
in_progress
done
cancelled
```

Prioridade:

```text
low
medium
high
```

---

# 5. Prisma — PlannedPurchase

Modelo:

```prisma
model PlannedPurchase {
  id                    String   @id @default(cuid())
  title                 String
  description           String?
  estimatedAmount       Decimal? @db.Decimal(12, 2)
  plannedDate           DateTime?

  priority              String   @default("medium")
  necessity             String   @default("want")
  status                String   @default("idea")

  goalId                String?
  goal                  Goal?    @relation(fields: [goalId], references: [id], onDelete: SetNull)

  financialCommitmentId String?  @unique
  financialCommitment   FinancialCommitment? @relation(
    fields: [financialCommitmentId],
    references: [id],
    onDelete: SetNull
  )

  userId                Int
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId, status, plannedDate])
  @@index([userId, goalId])
}
```

Status:

```text
idea
planned
bought
cancelled
```

Necessidade:

```text
need
want
```

---

# 6. Relação com Goal

Adicionar relações inversas no `Goal`:

```prisma
plannerTasks     PlannerTask[]
plannedPurchases PlannedPurchase[]
```

Um Goal não será obrigatório.

Exemplo:

```text
Goal:
Melhorar setup

├── Comprar monitor
├── Comprar cadeira
└── Organizar escritório
```

Se a Goal for removida:

```text
goalId = null
```

Os itens devem continuar existindo.

---

# 7. Finance não será duplicado

Compra `idea`:

```text
PlannedPurchase
```

somente.

Não cria compromisso financeiro.

---

Compra `planned`:

```text
PlannedPurchase
+
FinancialCommitment
```

O `FinancialCommitment` existente será a fonte financeira da compra.

---

Compra `bought`:

usar o comportamento existente de:

```text
POST
/api/finance/commitments/:id/pay
```

que já cria:

```text
FinancialTransaction
```

e conclui o compromisso.

Depois marcar:

```text
PlannedPurchase.status = bought
```

---

# 8. Planejar compra

Criar operação:

```text
POST /api/planner/purchases/:id/plan
```

Payload:

```json
{
  "plannedDate": "2026-11-20",
  "estimatedAmount": 1500,
  "accountId": "...",
  "categoryId": "..."
}
```

Regra:

```text
IDEA
↓
PLANNED
```

Dentro de uma transação Prisma:

1. validar que Purchase pertence ao usuário;
2. validar valor > 0;
3. validar data;
4. criar `FinancialCommitment`;
5. salvar `financialCommitmentId`;
6. alterar status para `planned`.

O compromisso deve ser:

```text
type = expense
recurrence = none
status = active
```

---

# 9. Comprar item

Criar:

```text
POST /api/planner/purchases/:id/buy
```

Payload:

```json
{
  "accountId": "...",
  "date": "..."
}
```

Somente compras:

```text
planned
```

podem utilizar esse fluxo.

Resultado:

```text
FinancialCommitment
↓
FinancialTransaction

PlannedPurchase
planned
↓
bought
```

A operação deve ser atômica sempre que possível.

---

# 10. Cancelamento

### IDEA

Cancelar somente:

```text
PlannedPurchase.status = cancelled
```

### PLANNED

Também cancelar o compromisso financeiro associado.

Não deixar compromisso ativo de uma compra cancelada.

---

# 11. APIs — Tasks

Criar:

```text
GET    /api/planner/tasks
POST   /api/planner/tasks

PATCH  /api/planner/tasks/:id
DELETE /api/planner/tasks/:id
```

GET deve aceitar:

```text
status
from
to
goalId
```

---

# 12. APIs — Purchases

Criar:

```text
GET    /api/planner/purchases
POST   /api/planner/purchases

PATCH  /api/planner/purchases/:id
DELETE /api/planner/purchases/:id
```

Ações:

```text
POST /api/planner/purchases/:id/plan
POST /api/planner/purchases/:id/buy
POST /api/planner/purchases/:id/cancel
```

---

# 13. Workspace do Planner

Assim como existe:

```text
GET /api/finance
```

criar um agregador:

```text
GET /api/planner
```

Parâmetros:

```text
month
year
```

Resposta conceitual:

```ts
interface PlannerWorkspace {
  tasks: PlannerTask[];
  purchases: PlannedPurchase[];

  upcomingCommitments: FinancialCommitment[];

  summary: {
    pendingTasks: number;
    plannedPurchases: number;
    plannedPurchasesAmount: number;
    financialCommitments: number;
  };
}
```

O Planner pode consultar Finance no servidor através do Prisma.

Não fazer fetch HTTP de `/api/finance` dentro de `/api/planner`.

---

# 14. Types

Criar:

```text
src/types/Planner.ts
```

Com:

```ts
PlannerTask
PlannerTaskStatus
PlannerTaskPriority
PlannerTaskInput

PlannedPurchase
PlannedPurchaseStatus
PlannedPurchaseNecessity
PlannedPurchaseInput

PlannerWorkspace
```

Seguir o padrão atual de:

```text
src/types/Finance.ts
src/types/Goal.ts
```

---

# 15. Services

Criar:

```text
src/services/PlannerServices.ts
```

Responsabilidades:

```text
getWorkspace
createTask
updateTask
deleteTask

createPurchase
updatePurchase
deletePurchase

planPurchase
buyPurchase
cancelPurchase
```

---

# 16. React Query

Criar:

```text
src/hooks/usePlanner.ts
```

Query principal:

```ts
["planner", period]
```

Mutations devem invalidar:

```text
["planner"]
```

Quando alterar uma compra planejada/comprada também invalidar:

```text
["finance"]
```

Quando necessário:

```text
["goals"]
```

---

# 17. Página `/planner`

Utilizar:

```text
DashboardViewport
MenuPageHeader
Card
Button
Badge
Dialog
ConfirmDialog
Checkbox
Select
Input
Textarea
```

Já existentes no projeto.

Evitar criar componentes visuais paralelos.

---

# 18. Layout

Desktop:

```text
┌─────────────────────────────────────────────┐
│ Planner                         + Adicionar │
├─────────────────────────────────────────────┤
│ Pendentes │ Compras │ Comprometido │ Próximo│
├──────────────────────────────┬──────────────┤
│ Hoje / Próximos              │ Compras      │
│                              │ planejadas   │
│ □ Pagar documento            │              │
│ □ Resolver tarefa            │ Monitor      │
│ □ Estudar                    │ R$ 1.500     │
│                              │              │
├──────────────────────────────┴──────────────┤
│ Próximos compromissos financeiros          │
└─────────────────────────────────────────────┘
```

Manter:

```text
h-full
min-h-0
overflow-hidden
```

seguindo o restante do LifeUp.

Scroll somente nas regiões internas quando necessário.

---

# 19. Mobile

Layout em uma coluna.

Ordem:

```text
Resumo
Hoje
Próximos
Compras
Compromissos
```

Evitar tabela.

Utilizar rows/cards compactos.

---

# 20. Captura rápida

No Planner:

```text
+ Adicionar
```

Ao clicar:

```text
O que deseja adicionar?

Tarefa
Compra
```

Não incluir Finance nesse modal.

Finance já possui fluxo próprio.

---

# 21. Nova tarefa

Campos obrigatórios:

```text
Título
```

Opcionais:

```text
Descrição
Data
Prioridade
Meta
```

Defaults:

```text
priority = medium
status = pending
```

---

# 22. Nova compra

Campos:

```text
Título *
Valor estimado
Data planejada
Prioridade
Necessidade
Meta
Descrição
```

Default:

```text
status = idea
necessity = want
priority = medium
```

Cadastrar uma compra NÃO significa automaticamente assumir um compromisso financeiro.

---

# 23. Wishlist

Compras:

```text
status = idea
```

funcionam como wishlist.

Exemplo:

```text
Monitor OLED
R$ 4.500
Quero
Prioridade baixa

[Planejar]
```

---

# 24. Compra planejada

Quando:

```text
status = planned
```

exibir:

```text
Monitor
R$ 4.500
20 nov

Financeiro planejado

[Comprar]
[Editar]
[Cancelar]
```

---

# 25. Tasks

Usar visual semelhante ao `TaskRow` já existente:

```text
□ Renovar documento

Hoje
Alta

[...]
```

Ao marcar:

```text
pending → done
```

Não excluir.

---

# 26. Integração com Inbox

A Inbox atual já possui:

```text
convertToNote
```

Adicionar posteriormente:

```text
convertToTask
convertToPurchase
```

Fluxo:

```text
InboxItem

"Comprar SSD"
      ↓
Converter
      ↓
Compra
      ↓
PlannedPurchase(status=idea)

InboxItem.status = processed
```

Para tarefa:

```text
"Resolver documentação"
      ↓
PlannerTask(status=pending)
```

Essa integração deve ocorrer depois do CRUD principal do Planner estar estável.

---

# 27. Home `/`

Hoje a Home usa praticamente apenas Goals.

Depois do Planner estabilizado, alterar "Próxima ação" para priorizar:

```text
PlannerTask vencida
PlannerTask de hoje
PlannerTask prioridade alta
Goal próxima
```

Mas isso NÃO faz parte da primeira etapa.

---

# 28. Finance

A página:

```text
/finance
```

continua responsável por:

```text
Transações
Compromissos
Objetivos financeiros
Contas
Categorias
```

O Planner apenas exibe um resumo.

---

# 29. SavingsGoal x Goal

Manter separados no MVP.

Hoje existem:

```text
Goal
SavingsGoal
```

Não refatorar isso durante a implementação do Planner.

Isso ampliaria muito o escopo.

---

# 30. Regras de negócio

### PL-01

Task exige título.

### PL-02

Purchase exige título.

### PL-03

`estimatedAmount`, quando informado:

```text
> 0
```

### PL-04

`idea` não cria impacto financeiro.

### PL-05

`planned` deve possuir:

```text
estimatedAmount
plannedDate
financialCommitmentId
```

### PL-06

Não criar dois FinancialCommitments para a mesma compra.

### PL-07

`bought` deve possuir compromisso previamente planejado.

### PL-08

Comprar deve gerar FinancialTransaction usando o fluxo financeiro existente.

### PL-09

Cancelar uma compra planejada deve impedir que seu compromisso continue ativo.

### PL-10

Task concluída permanece no histórico.

### PL-11

Purchase comprada permanece no histórico.

### PL-12

Todo acesso deve filtrar por:

```text
userId
```

seguindo o padrão atual.

---

# 31. Critérios de aceite

O MVP estará pronto quando for possível:

1. abrir `/planner`;
2. cadastrar uma tarefa;
3. editar uma tarefa;
4. concluir uma tarefa;
5. cancelar uma tarefa;
6. cadastrar uma compra como ideia;
7. editar a compra;
8. transformar ideia em compra planejada;
9. gerar automaticamente FinancialCommitment;
10. visualizar a compra no Finance;
11. marcar compra como comprada;
12. gerar FinancialTransaction;
13. relacionar Task com Goal;
14. relacionar Purchase com Goal;
15. visualizar compromissos financeiros próximos;
16. filtrar o Planner pelo período;
17. funcionar no desktop e mobile;
18. manter o padrão visual SnowUI.

---

# 32. Estrutura prevista

```text
src/
├── app/
│   ├── planner/
│   │   └── page.tsx
│   │
│   └── api/
│       └── planner/
│           ├── route.ts
│           ├── tasks/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           └── purchases/
│               ├── route.ts
│               └── [id]/
│                   ├── route.ts
│                   ├── plan/
│                   │   └── route.ts
│                   ├── buy/
│                   │   └── route.ts
│                   └── cancel/
│                       └── route.ts
│
├── components/
│   └── planner/
│       ├── PlannerTaskDialog.tsx
│       ├── PlannerPurchaseDialog.tsx
│       ├── PlannerTaskList.tsx
│       ├── PlannerPurchaseList.tsx
│       └── PlannerSummary.tsx
│
├── hooks/
│   └── usePlanner.ts
│
├── services/
│   └── PlannerServices.ts
│
├── types/
│   └── Planner.ts
│
└── lib/
    └── planner.ts
```

---

# 33. Ordem obrigatória de implementação

## Etapa 1 — Domínio

Implementar somente:

```text
Prisma
PlannerTask
PlannedPurchase
migration
types
validações centrais
```

Validar.

Parar.

---

## Etapa 2 — CRUD Tasks

Implementar:

```text
API
Service
React Query
```

Validar.

Parar.

---

## Etapa 3 — CRUD Purchases

Ainda sem Finance automático.

Validar.

Parar.

---

## Etapa 4 — Integração Finance

Implementar:

```text
IDEA → PLANNED
PLANNED → BOUGHT
cancel
```

com `FinancialCommitment` e `FinancialTransaction`.

Validar.

Parar.

---

## Etapa 5 — UI `/planner`

Criar dashboard e formulários.

Validar desktop/mobile.

Parar.

---

## Etapa 6 — Integração Goals

Adicionar seleção de Goal.

Validar.

Parar.

---

## Etapa 7 — Inbox

Adicionar:

```text
Converter em tarefa
Converter em compra
```

Validar.

Parar.

---

## Etapa 8 — Home

Somente depois de tudo estável, avaliar usar Planner na página Hoje.

---

# 34. Regra para agente de implementação

Não refatorar funcionalidades existentes fora do necessário.

Não alterar:

```text
Study
LifeHabit
Pomodoro
Notes
```

Não substituir Finance.

Não substituir Goals.

Não implementar etapas futuras antecipadamente.

Executar uma etapa por vez e parar após:

```text
build
lint
testes relevantes
```

A próxima etapa só começa depois da validação da anterior.