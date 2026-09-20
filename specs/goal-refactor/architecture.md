# Arquitetura

Arquitetura alvo para o dominio principal:

```text
UI
 ↓
useGoals
 ↓
GoalServices
 ↓
/api/goals
 ↓
Prisma
 ↓
Goal
```

## Responsabilidades

UI:
- renderizacao e interacao.

Hook:
- estado e operacoes relacionadas a Goals.
- invalida queries de Goals apos mutacoes.

Service:
- comunicacao HTTP.
- sem regra de dominio.

API:
- validacao.
- autenticacao.
- ownership por userId.
- persistencia.

Prisma:
- persistencia do modelo Goal.

## Limites

- Evitar abstracoes adicionais sem necessidade.
- Notes, Inbox e Pomodoro permanecem independentes.
- Calendar sai da navegacao se perder funcao util.
- Weekly Plan sai da nova versao.
- LifeHabit fica legado/separado e fora do fluxo principal se conflitar com dominio unico.
