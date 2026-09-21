# Goal Areas

Extensao simples do dominio principal `User -> Goal`.

## Modelo

Goal recebe:
- `area`

Valores permitidos:
- `BODY`
- `MIND`
- `HOME`

`area` e obrigatoria para novos Goals.

## Regra de Dominio

`area` e somente um enum/campo de Goal.

Nao criar:
- Area
- Category
- Project
- Habit
- Task
- SubGoal

## Migracao

Goals existentes sem `area` devem receber valor seguro.

Padrao:
- `MIND`

