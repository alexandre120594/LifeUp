# Goals

## Estado atual

Rota atual:

```text
/goals
```

Arquivos:

- `src/app/goals/page.tsx`
- `src/components/goals/GoalBoard.tsx`
- `src/hooks/useGoals.ts`
- `src/services/GoalServices.ts`
- `src/app/api/goals/*`

Funcionalidades:

- listar Goals;
- criar Goal;
- editar inline;
- pausar/retomar;
- completar;
- deletar;
- filtrar por area;
- filtrar por status;
- agrupar por `BODY`, `MIND`, `HOME`.

## Problemas encontrados

- Mesmo componente e usado no Dashboard.
- Edicao inline altera densidade da lista.
- Delete nao pede confirmacao.
- `select` nativo usado em formulario, apesar de existir primitive `Select`.
- Falhas de validacao client-side sao pouco visiveis.
- Labels em ingles.

## Objetivo UX

Tornar Metas a area de gestao clara do dominio principal `Goal`, com criacao, revisao e manutencao eficientes.

## Arquitetura da informacao

Conteudo principal:

- lista/board de metas por area;
- filtros de area/status;
- acao primaria: criar meta;
- detalhes compactos: titulo, area, status, progresso, data alvo.

Sem reintroduzir:

- Project;
- Habit;
- Task;
- checklists;
- subrecords obrigatorios.

## Componentes envolvidos

- `GoalBoard`
- `GoalForm`
- `GoalCard`
- `GoalMetrics`
- `AreaColumn`
- `Button`
- `Input`
- futuro `Select`
- futuro `ConfirmDialog`
- futuro `FieldError`

## Heuristicas relacionadas

- H1: feedback de salvamento, carregamento e filtros.
- H3: controle em exclusao/edicao.
- H4: consistencia de controles.
- H5: prevencao de erros.
- H9: recuperacao de erros.

## Estados necessarios

- lista carregando;
- erro ao carregar;
- sem metas;
- sem metas no filtro;
- salvando;
- editando;
- excluindo;
- erro por campo;
- confirmacao de exclusao;
- sucesso com toast/undo.

## Responsividade

- Mobile: formulario deve ser reduzido, modal, drawer ou secao expansivel.
- Desktop: filtros e lista podem ficar visiveis simultaneamente.
- Colunas Body/Mind/Home devem empilhar em telas estreitas.

## Acessibilidade

- Labels persistentes em todos os campos.
- `aria-label` em botoes icon-only preservado.
- Progresso com texto percentual.
- Status com texto visivel e nao somente cor.
- ConfirmDialog acessivel para delete.

## Criterios de aceite

- `/goals` funciona como gestao completa, nao como dashboard duplicado.
- Criacao/edicao mostram validacoes claras.
- Exclusao exige confirmacao ou undo.
- Filtros comunicam resultados.
- Todos os controles seguem componentes SnowUI quando implementado.

## Pendencias para detalhamento

- Definir se criacao vira dialog, drawer ou painel fixo.
- Definir se metricas ficam em Goals ou apenas Dashboard.
- Definir vocabulario de status em PT-BR.
