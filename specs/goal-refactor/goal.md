# Goal

Fonte de verdade do dominio principal do LifeUp apos a refatoracao.

## Modelo

Goal
- id
- userId
- title
- description?
- status
- progress
- targetDate?
- color?
- createdAt
- updatedAt

## Status

- ACTIVE
- PAUSED
- COMPLETED

## Progress

- inteiro entre 0 e 100
- fonte de verdade para progresso apos migracao

## Relacao

- User 1 -> N Goal

## Fora do Dominio

Goal nao possui:
- projects
- habits
- tasks
- subgoals
- actions
- checklists

Nao substituir `Project -> Habit -> Task` por outra hierarquia equivalente.
