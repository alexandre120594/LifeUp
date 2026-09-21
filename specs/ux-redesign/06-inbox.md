# Inbox

## Estado atual

Rota atual:

```text
/inbox
```

Arquivos:

- `src/app/inbox/page.tsx`
- `src/hooks/useInboxMutations.ts`
- `src/services/InboxServices.ts`
- `src/app/api/inbox/*`

Funcionalidades:

- criar item com titulo, conteudo e tipo;
- filtrar por status `unprocessed`, `processed`, `all`;
- marcar como processado/reabrir;
- converter em Note;
- deletar.

## Problemas encontrados

- Rotulo `Inbox` pode ser menos claro que `Captura` para PT-BR.
- Formulario sempre visivel ocupa uma coluna.
- Campo de detalhes e `textarea` manual sem label persistente.
- Titulo vazio retorna sem feedback local.
- Delete nao pede confirmacao.
- Converter para Note nao mostra destino/resultado alem do toast global.

## Objetivo UX

Transformar Inbox/Captura em entrada rapida de baixo atrito, com processamento claro e seguro.

## Arquitetura da informacao

Secoes futuras:

- captura rapida;
- itens a processar;
- processados;
- filtros por tipo/status;
- acoes por item: concluir, reabrir, converter em nota, excluir.

## Componentes envolvidos

- `DashboardViewport`
- `MenuPageHeader`
- `Card`
- `Input`
- `Button`
- `Badge`
- futuro `Textarea`
- futuro `Select`
- futuro `ConfirmDialog`
- futuro `EmptyState`

## Heuristicas relacionadas

- H1: feedback de captura/processamento.
- H5: prevencao de erros em envio vazio.
- H6: reconhecimento por filtros visiveis.
- H9: recuperacao de erros.

## Estados necessarios

- carregando itens;
- sem itens;
- sem resultados no filtro;
- criando;
- atualizando status;
- convertendo para nota;
- deletando;
- erro de criacao;
- erro por campo.

## Responsividade

- Mobile deve priorizar campo de captura compacto.
- Lista deve ser escaneavel antes de exibir conteudo longo.
- Acoes por item podem virar menu ou linha de botoes responsiva.

## Acessibilidade

- Campos com labels.
- Tipo e status com nomes localizados.
- Botoes de acao com labels especificos.
- Conversao para nota deve informar resultado.

## Criterios de aceite

- Captura vazia mostra erro por campo.
- Usuario entende diferenca entre pendente/processado.
- Converter para nota informa sucesso e atualiza a lista.
- Exclusao tem confirmacao/undo.
- Empty state indica como capturar o primeiro item.

## Pendencias para detalhamento

- Decidir nome final: Inbox ou Captura.
- Definir tipos validos em PT-BR.
- Decidir se item processado some automaticamente ou permanece com filtro.
