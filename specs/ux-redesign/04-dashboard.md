# Dashboard

## Estado atual

Rota atual:

```text
/
```

Arquivo:

```text
src/app/page.tsx
```

A tela renderiza:

- `MenuPageHeader` com `Welcome back` e `CurrentUserName`;
- `GoalBoard`, o mesmo componente usado em `/goals`.

## Problemas encontrados

- Dashboard e Goals sao praticamente a mesma tela.
- A tela inicial mistura metricas, filtros, formulario e colunas de gestao.
- A acao principal nao e claramente diferente da pagina Goals.
- Labels estao em ingles.
- Empty/loading states sao simples e pouco orientativos.

## Objetivo UX

Transformar Dashboard em "Hoje": uma visao operacional de progresso, prioridades e proximas acoes, sem recriar a hierarquia antiga.

## Arquitetura da informacao

Conteudo futuro recomendado:

- resumo de metas ativas;
- metas com vencimento proximo;
- progresso medio;
- metas por area;
- entrada rapida para capturar algo;
- CTA para criar meta ou continuar foco.

Nao incluir:

- Project;
- Habit;
- Task;
- sub-hierarquia de Goal.

## Componentes envolvidos

- `DashboardViewport`
- `MenuPageHeader` ou futuro `PageHeader`
- `GoalMetrics`
- `GoalBoard` atualmente, mas deve ser separado futuramente em componentes menores
- futuros `MetricCard`, `PriorityList`, `GoalSummaryCard`, `EmptyState`

## Heuristicas relacionadas

- H1: estado do sistema.
- H2: linguagem do mundo real.
- H6: reconhecimento.
- H8: minimalismo.

## Estados necessarios

- carregando metas;
- sem metas;
- metas ativas;
- metas completas;
- erro ao carregar;
- meta vencendo em breve;
- usuario sem nome.

## Responsividade

- Mobile deve priorizar resumo e proxima acao antes de formularios.
- Desktop pode mostrar metricas e listas lado a lado.
- Evitar tres colunas de conteudo denso em telas medias.

## Acessibilidade

- Metric cards com labels textuais claros.
- Progresso nao deve depender apenas de cor.
- Datas devem ser legiveis e localizadas.
- Header deve usar hierarquia de heading correta.

## Criterios de aceite

- Dashboard nao parece duplicata de Metas.
- Usuario entende qual meta exige atencao hoje.
- Estado vazio orienta criacao da primeira meta.
- Erro de carregamento oferece retry.
- Conteudo e rotulos estao em PT-BR quando a migracao textual for executada.

## Pendencias para detalhamento

- Definir se Inbox/Foco aparecem como widgets em Hoje.
- Definir quais metricas sao essenciais.
- Definir comportamento de "due soon" em metas sem targetDate.
