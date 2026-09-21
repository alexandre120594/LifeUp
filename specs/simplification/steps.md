# Plano de simplificacao

Execucao sequencial e sob comando. Cada etapa termina antes da seguinte comecar.

## Status

| Etapa | Nome | Status |
| --- | --- | --- |
| 1 | Auditoria atual | Concluida |
| 2 | Simplificacao do dominio | Concluida |
| 3 | Novos fluxos | Concluida |
| 4 | Especificacao do layout | Concluida |
| 5 | Refatorar dominio de Financas | Concluida |
| 6 | Refatorar UI de Financas | Concluida |
| 7 | Refatorar dominio de Estudos | Concluida |
| 8 | Refatorar UI de Estudos | Concluida |
| 9 | Limpeza | Concluida |
| 10 | Validacao final | Concluida |

## Etapa 1 - Auditoria atual

Objetivo: mapear paginas, componentes, hooks, services, schemas, tipos, APIs, entidades, rotas e regras de Financas e Estudos.

Classificar funcionalidades como `CORE`, `SUPPORT`, `ADVANCED` ou `REMOVE`.

Arquivos:

- `specs/simplification/current-state.md`
- `specs/simplification/feature-audit.md`

Restricao: nao alterar codigo funcional.

## Etapa 2 - Simplificacao do dominio

Objetivo: definir dominio simplificado usando `KEEP`, `MERGE` e `REMOVE`, registrar `ANTES -> DEPOIS`, impactos e dependencias.

Entrada:

- specs da etapa 1

Arquivo:

- `specs/simplification/domain.md`

Restricao: nao implementar codigo.

## Etapa 3 - Novos fluxos

Objetivo: definir acao principal, acoes secundarias, informacoes necessarias e recursos removidos do fluxo principal.

Financas:

```text
Visao -> Nova movimentacao -> Compromissos -> Objetivos
```

Estudos:

```text
Proxima acao -> Sessao -> Resultado -> Revisao
```

Arquivo:

- `specs/simplification/flows.md`

Restricao: nao implementar codigo.

## Etapa 4 - Especificacao do layout

Objetivo: definir estrutura full-screen, `100dvh`, grids, scroll interno, hierarquia e comportamento desktop, tablet e mobile.

Arquivo:

- `specs/simplification/layout.md`

Restricao: nao implementar codigo.

## Etapa 5 - Refatorar dominio de Financas

Objetivo: implementar somente simplificacao estrutural definida nas specs.

Pode alterar:

- tipos
- schema e models
- services
- hooks
- APIs
- estado

Regras:

- nao redesenhar dashboard;
- remover legado somente depois da substituicao funcionar;
- validar areas alteradas;
- atualizar specs apenas quando descoberta mudar decisao.

## Etapa 6 - Refatorar UI de Financas

Objetivo: implementar dashboard operacional com uma acao principal, menos cards/graficos, formularios progressivos, full-screen e scroll interno.

Regras:

- remover UI obsoleta;
- preservar funcionalidades essenciais;
- validar experiencia e codigo alterado.

## Etapa 7 - Refatorar dominio de Estudos

Objetivo: implementar simplificacao estrutural de entidades, tipos, sessoes, questoes, revisoes, metricas, hooks e services.

Regras:

- nao redesenhar dashboard;
- validar areas alteradas;
- seguir dominio definido nas specs.

## Etapa 8 - Refatorar UI de Estudos

Objetivo principal: responder `O que devo estudar agora?`.

Implementar:

- proxima acao
- metricas essenciais
- revisoes pendentes
- materias que precisam de atencao
- full-screen
- scroll interno

Regras:

- remover UI obsoleta;
- validar experiencia e codigo alterado.

## Etapa 9 - Limpeza

Objetivo: remover apenas codigo obsoleto depois das refatoracoes.

Escopo:

- componentes
- hooks
- services
- tipos
- schemas
- imports
- rotas
- helpers

Restricao: nao criar novas funcionalidades.

## Etapa 10 - Validacao final

Executar comandos disponiveis, incluindo quando aplicaveis:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Criar:

- `specs/simplification/result.md`

Registrar antes, depois, removido e consolidado para Financas e Estudos, alem dos resultados de typecheck, lint, testes e build.

Restricao: nao iniciar nova refatoracao.

## Regras permanentes

- Executar somente etapa solicitada.
- Nao iniciar etapa futura automaticamente.
- Alterar apenas arquivos necessarios para etapa ativa.
- Preservar funcionalidades essenciais.
- Preferir menos entidades, CRUDs, telas, estados e regras.
- Nao criar entidade quando tipo ou campo resolver.
- Nao considerar modalizacao como simplificacao de dominio.
- Usar Git como historico; nao manter codigo comentado.
- Atualizar specs quando descoberta mudar decisao anterior.
- Encerrar cada etapa com resumo curto e aguardar novo comando.
