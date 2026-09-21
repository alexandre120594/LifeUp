# Feedback and States

## Estado atual

Existe `ToastProvider` global em `src/components/ui/toast.tsx`, conectado ao `MutationCache` no `Providers`.

Estados atuais:

- Toast global de sucesso/erro para mutacoes.
- Loading textual em varias telas.
- Empty states simples por feature.
- Login tem erro inline.
- Query errors sem padrao de tela encontrado nas paginas auditadas.

## Problemas encontrados

- Loading states nao usam padrao visual comum.
- Empty states nao orientam sempre a proxima acao.
- Validacoes locais podem falhar silenciosamente.
- `api-client` prioriza `message`, enquanto algumas APIs retornam `error`.
- Confirmacoes destrutivas variam: algumas nao existem; Pomodoro usa `window.confirm`.
- Toast usa `role=status` para sucesso e erro.

## Objetivo UX

Criar um sistema previsivel de feedback para acoes, estados de dados e recuperacao de erros.

## Arquitetura da informacao

Estados globais devem responder:

- o que esta acontecendo?
- o que aconteceu?
- o que deu errado?
- como corrigir?
- como desfazer ou tentar novamente?

## Componentes envolvidos

- `ToastProvider`
- `Skeleton`
- futuros `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `FieldError`, `InlineNotice`

## Heuristicas relacionadas

- H1: visibilidade do estado.
- H3: controle e liberdade.
- H5: prevencao de erros.
- H9: reconhecer e recuperar erros.
- H10: ajuda contextual.

## Estados necessarios

Por feature:

- carregando;
- vazio;
- erro;
- salvando;
- salvo;
- excluindo;
- excluido;
- validacao invalida;
- sem resultados;
- sem permissao;
- offline/retry quando aplicavel.

## Responsividade

- Toasts devem caber em mobile.
- Estados vazios nao devem empurrar acoes criticas para fora da viewport.
- Dialogs de confirmacao devem ser usaveis em telas pequenas.

## Acessibilidade

- Erros criticos devem usar semantica adequada.
- Field errors devem estar ligados aos campos.
- Toasts devem ser dispensaveis.
- Confirm dialogs devem devolver foco ao disparador.

## Criterios de aceite

- Toda query principal tem loading, empty e error.
- Toda mutacao tem pending, success e error.
- Campos obrigatorios mostram mensagem local.
- Delete destrutivo tem confirmacao ou undo.
- Mensagens seguem vocabulario PT-BR definido.

## Pendencias para detalhamento

- Definir matriz de mensagens por dominio.
- Definir quando usar toast vs inline notice.
- Ajustar contrato de erro das APIs.
