# Migracao

Estrategia principal:

```text
Project -> Goal
```

Migrar somente dados uteis:
- `Project.title` -> `Goal.title`
- `Project.description` -> `Goal.description`, se existir
- `Project.dueDate` -> `Goal.targetDate`, se existir
- `Project.color` -> `Goal.color`

Se Project nao tiver progresso persistido, calcular progresso inicial apenas durante migracao quando dados antigos existirem.

Apos migracao:
- `Goal.progress` e fonte de verdade.

Nao transformar automaticamente:
- `Habit -> Goal`
- `Task -> Goal`

## Corte do Legado

Depois que Goal estiver funcional, remover consumidores e codigo antigo ligado a:
- Project
- Habit
- Task
- Weekly Plan baseado em Habit/Task
- Calendar baseado em Habit/Task
- analytics/streaks baseados em Habit/Task

Antes de remover arquivo:
- buscar imports e consumidores.
