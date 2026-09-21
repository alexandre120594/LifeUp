# Arquitetura da Informacao

## Base conceitual

A auditoria considera arquitetura da informacao como organizacao de conteudo, taxonomia, navegacao, rotulagem, contexto e acessibilidade para que o usuario entenda:

- onde esta;
- para onde pode ir;
- o que pode fazer agora;
- qual informacao importa para a tarefa atual.

Referencia conceitual usada: PM3, "Arquitetura da informacao: o que e, importancia e como aplicar".

## Arquitetura atual

Navegacao atual:

```text
LifeUp Workspace
  Life Dashboard
  Goals
  Inbox
  Notes
  Finance
  Spend Tracker

Study tools
  Study Dashboard
  Mistake Log
  Study Plan
  Dataprev Plan
  TRT Audit Plan
  Focus Timer
```

Rotas fora da navegacao:

```text
Login
LifeHabit legado
```

Dominio principal:

```text
Goal
```

Areas de Goal:

```text
Body
Mind
Home
```

## Problemas

### Hierarquia

`Goal` e o dominio principal, mas a navegacao abre com `Life Dashboard`, `Goals`, `Inbox`, `Notes`, `Finance` e `Spend Tracker` como pares visuais. Isso enfraquece a ideia de que Goals sao o eixo principal.

### Navegacao

O usuario consegue se mover pela sidebar, mas o contexto da pagina depende muito do header interno. O topbar nao mostra a pagina atual com precisao em Inbox, Notes, Finance e Goals.

### Taxonomia

Finance e Study aparecem na mesma sidebar do fluxo principal. Isso e util para acesso, mas a taxonomia nao deixa claro:

- o que e vida pessoal central;
- o que e modulo auxiliar;
- o que e ferramenta especializada.

### Rotulagem

Rotulos estao em ingles, embora `html lang="pt-BR"` esteja configurado:

- Life Dashboard
- Goals
- Inbox
- Notes
- Finance
- Spend Tracker
- Study tools
- Focus Timer

### Profundidade

Study tem muitos destinos especializados no primeiro nivel de sidebar. Isso reduz profundidade de cliques, mas aumenta carga cognitiva no menu global.

### Carga cognitiva

Dashboard e Goals usam a mesma UI com metricas, formulario, filtros e colunas. A tela inicial nao diferencia claramente "ver o dia" de "gerenciar metas".

### Contexto

Badges numericas nao comunicam se representam pendencia, total, progresso ou valor fixo.

## Arquitetura proposta

Proposta centrada em Goal, derivada das features reais encontradas:

```text
Hoje
Metas
Captura
Notas
Foco

Secundario / Ferramentas
  Estudos
  Financas
  Importacoes
  Planos de estudo

Conta
  Configuracoes
  Sair
```

Observacao:

- `Configuracoes` nao foi encontrada como rota atual. Deve ser documentada como destino futuro somente se a Task 3 criar/planejar rota. Para Task 1, nao assumir existencia.
- `LifeHabit` legado nao deve voltar para a navegacao principal sem decisao explicita.

## Motivo

`Hoje` deve ser a entrada operacional do produto:

- progresso recente;
- metas ativas;
- proximos vencimentos;
- acoes primarias de continuidade.

`Metas` deve ser gestao:

- criar;
- editar;
- pausar;
- completar;
- excluir;
- filtrar por area/status.

`Captura` substitui ou renomeia `Inbox`:

- captura rapida;
- processamento;
- conversao para nota.

`Notas`:

- biblioteca e edicao de conhecimento;
- busca e categorias.

`Foco`:

- timer e historico de foco;
- hoje esta em `/pomodoro`, mas o rotulo de produto pode ser `Foco`.

`Estudos` e `Financas`:

- existem no app, mas nao sao parte da task de feature specs principais.
- devem permanecer acessiveis como grupo secundario se o produto continuar incluindo essas areas.

## Navegacao principal proposta

Para o redesign das features pedidas:

| Rotulo proposto | Rota atual | Papel |
| --- | --- | --- |
| Hoje | `/` | Visao inicial orientada a progresso e proxima acao |
| Metas | `/goals` | Gestao completa de Goals |
| Captura | `/inbox` | Entrada rapida e processamento |
| Foco | `/pomodoro` | Timer e historico de foco |
| Notas | `/notes` | Biblioteca de notas |

## Navegacao secundaria proposta

| Grupo | Rotas atuais | Observacao |
| --- | --- | --- |
| Estudos | `/study`, `/study/mistakes`, `/study/planner`, `/study/trt-plan`, `/study/trt-audit-plan` | Manter agrupado; avaliar subnavegacao interna |
| Financas | `/finance`, `/finance/tracker` | Manter agrupado; Spend Tracker como subitem |
| Conta | `/login`, logout atual | Configuracoes nao existe no codigo atual |

## Nomes

Vocabulário recomendado em PT-BR:

| Atual | Proposto |
| --- | --- |
| Life Dashboard | Hoje |
| Goals | Metas |
| Inbox | Captura |
| Notes | Notas |
| Focus Timer / Pomodoro | Foco |
| Finance | Financas |
| Spend Tracker | Gastos importados ou Rastreador de gastos |
| Study Dashboard | Estudos |
| Mistake Log | Caderno de erros |
| Study Plan | Plano de estudos |

## Agrupamentos

Primario:

- Hoje
- Metas
- Captura
- Foco
- Notas

Secundario:

- Estudos
- Financas

Sistema:

- Tema
- Conta/Sair

## Hierarquia

Cada tela deve responder:

1. Onde estou?
2. Qual e a acao principal?
3. Qual informacao exige atencao agora?
4. Onde estao filtros e acoes secundarias?

## Localizacao das acoes principais

Recomendacao:

- PageHeader deve expor acao primaria quando existir.
- Formularios longos devem abrir em Dialog/Panel ou ocupar uma area clara.
- Acoes destrutivas devem ficar agrupadas e exigir confirmacao/undo.
- Filtros devem ficar perto da lista que afetam.

## Pendencias

- Decidir se Study e Finance continuam no escopo principal do produto ou viram areas secundarias.
- Decidir se `Settings` sera criado; rota nao existe atualmente.
- Definir idioma oficial da interface.
- Definir semantica de badges da sidebar.
