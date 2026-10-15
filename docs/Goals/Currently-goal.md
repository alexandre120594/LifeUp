# GOAL — Life Planner

## Objetivo

Adicionar ao LifeUp um módulo `/planner` para centralizar:

- coisas que preciso fazer;
- coisas que pretendo comprar;
- compromissos financeiros já existentes;
- metas relacionadas;
- planejamento do período.

O Planner deve funcionar como uma camada de planejamento sobre os módulos existentes.

Ele NÃO deve substituir:

- `/finance`;
- `/goals`;
- `/inbox`;
- `/study`;
- `/life-habits`.

---

# Princípio arquitetural

Não duplicar domínio existente.

O LifeUp já possui:

```text
FinancialTransaction
FinancialCommitment
SavingsGoal
Goal
InboxItem
```

Portanto:

```text
PlannerTask       → novo
PlannedPurchase   → novo

Finance           → reutilizado
Goal              → reutilizado
Inbox             → integrado
```

---

# Experiência desejada

O usuário deve abrir `/planner` e conseguir responder rapidamente:

1. O que tenho para fazer?
2. O que pretendo comprar?
3. O que vence em breve?
4. Quanto já comprometi financeiramente?
5. Quais itens são prioridade?
6. Quais itens pertencem a alguma meta?

---

# Fluxo principal

```text
Captura
   ↓
Classificação
   ├── Tarefa
   ├── Compra
   ├── Nota
   └── Financeiro
        ↓
Planejamento
        ↓
Execução
        ↓
Concluído / Comprado / Pago
```

---

# Exemplo

Entrada:

"Comprar monitor"

Inicialmente:

```text
PlannedPurchase
status = IDEA
estimatedAmount = 1500
```

Nesse estágio:

- aparece no Planner;
- funciona como wishlist;
- NÃO afeta Finanças.

Quando o usuário escolher:

```text
Planejar compra
```

passa para:

```text
status = PLANNED
plannedDate = 2026-11-10
```

Nesse momento o sistema cria um:

```text
FinancialCommitment
type = expense
amount = 1500
dueDate = 2026-11-10
```

Assim o Finance passa a considerar a compra sem duplicar cálculo financeiro.

Quando comprar:

```text
PLANNED
↓
BOUGHT
```

o fluxo financeiro existente transforma o compromisso em `FinancialTransaction`.

---

# Resultado esperado

O LifeUp passa a possuir três níveis claros:

```text
CAPTURAR
Inbox

PLANEJAR
Planner

ACOMPANHAR DOMÍNIOS
Goals
Finance
Study
Habits
Notes
```

---

# Restrições

Não criar:

- novo controle de saldo;
- nova tabela de receitas/despesas;
- nova implementação de transações financeiras;
- nova implementação de Goals;
- sistema complexo de projetos;
- subtarefas no MVP;
- calendário completo;
- IA no MVP.

---

# Critério principal de sucesso

Registrar uma nova tarefa ou compra deve exigir poucos segundos.

O módulo deve continuar seguindo o princípio atual do LifeUp:

> simples, visual, direto e sem excesso de navegação.