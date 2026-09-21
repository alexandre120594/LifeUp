# Especificacao de layout simplificado

Definicao da etapa 4. Este documento estabelece o contrato responsivo de Financas e Estudos sem implementar componentes.

## Contrato compartilhado

- O shell ocupa `100dvh`, com sidebar/topbar fixos no fluxo do shell e sem rolagem no `body`.
- A area de cada modulo usa `min-h-0`, `min-w-0` e `overflow-hidden`; cabecalho, resumo e acao primaria permanecem visiveis.
- Apenas regioes de conteudo potencialmente longas usam `overflow-y-auto` e `overscroll-contain`.
- O limite de conteudo segue o shell (`max-width: 1320px`), com espacamento de 12 a 24 px conforme a largura.
- Dialogs nunca ultrapassam `calc(100dvh - 32px)` e possuem cabecalho/rodape fixos e corpo rolavel.
- Estados de carregamento, vazio e erro ocupam a mesma regiao do conteudo substituido, evitando saltos de layout.
- A ordem visual e tambem a ordem de foco e leitura. Nenhuma informacao essencial depende apenas de cor ou hover.

## Breakpoints e comportamento

### Desktop (`>= 1200px`)

- Cabecalho em uma linha, com contexto a esquerda e acao primaria a direita.
- Workspace em grid de 12 colunas.
- Resumo operacional ocupa a faixa superior; conteudo principal usa 8 colunas e painel contextual usa 4.
- Listas longas rolam dentro do painel; metricas e CTA nao rolam.
- Formularios progressivos abrem em dialog de ate 720 px; detalhes opcionais ficam recolhidos inicialmente.

### Tablet (`768px` a `1199px`)

- Grid de 8 colunas; resumo pode quebrar em duas linhas.
- Conteudo principal e contextual ficam empilhados quando cada um teria menos de 320 px.
- Acoes secundarias migram para menu contextual, preservando um unico CTA destacado.
- Tabelas viram listas densas antes de exigir rolagem horizontal.

### Mobile (`< 768px`)

- Uma coluna, largura total e espacamento de 12 a 16 px.
- Cabecalho permite duas linhas; CTA principal ocupa largura total quando necessario.
- Navegacao interna usa controles segmentados rolaveis horizontalmente, sem quebrar labels.
- Formularios usam painel quase full-screen; campos obrigatorios aparecem antes dos opcionais.
- Apenas uma regiao vertical rola por vez. Cards nao criam scroll aninhado em listas curtas.

## Financas

### Estrutura

```text
Cabecalho: periodo/conta                         [Nova movimentacao]
Resumo: saldo | entradas | saidas | resultado
---------------------------------------------------------------
Movimentacoes recentes (principal, scroll) | Compromissos
                                            | Objetivos
```

- O saldo total e a hierarquia primaria; entradas, saidas e resultado sao secundarios.
- Compromisso vencido aparece antes das demais informacoes contextuais.
- A lista de movimentacoes mostra descricao, conta, data, categoria opcional e valor com sinal sem depender da cor.
- Compromissos e objetivos exibem no maximo os itens mais relevantes; `Ver todos` troca a regiao principal, nao cria outro dashboard.
- Conta e periodo sao filtros compactos. Categorias e importacao ficam em acoes secundarias.
- O formulario de movimentacao mostra primeiro tipo, valor, descricao, conta e data; categoria e observacao aparecem em `Mais detalhes`.
- Compromissos e objetivos possuem formularios contextuais proprios, nunca entram no seletor da acao primaria.

### Scroll

- Desktop: somente a lista central rola; o painel direito pode rolar apenas se ultrapassar a viewport.
- Tablet/mobile: o workspace vira um unico painel rolavel abaixo do cabecalho e do resumo; secoes internas nao recebem altura fixa.

## Estudos

### Estrutura

```text
Cabecalho: semana atual                             [Iniciar sessao]
Proxima acao: materia, topico, motivo e duracao sugerida
Metricas: tempo | questoes | acuracia | revisoes vencidas
---------------------------------------------------------------
Materias que precisam de atencao (principal) | Revisoes pendentes
                                              | Historico recente
```

- `Proxima acao` e o elemento de maior peso e sempre explica a recomendacao.
- A acao primaria inicia a sessao recomendada; troca de materia/topico e registro manual sao secundarios.
- Metricas usam somente a semana atual por padrao e nao competem visualmente com a recomendacao.
- Revisoes vencidas aparecem antes das futuras; resposta permanece oculta ate acao explicita.
- O fluxo Sessao -> Resultado reutiliza o mesmo painel/dialog: o resultado atualiza a sessao existente e permite adicionar revisoes.
- Materias, topicos e historico usam superficies secundarias, sem atalhos equivalentes ao CTA principal.

### Scroll

- Desktop: lista de atencao/historico rola; recomendacao e metricas permanecem visiveis.
- Tablet/mobile: recomendacao permanece no topo do conteudo; abaixo dela existe uma unica rolagem vertical.
- Durante uma sessao ativa, o timer permanece visivel e nao cria uma segunda sessao ao navegar.

## Criterios de aceite

- Shell e modulos medem `100dvh` e o documento nao ganha rolagem vertical propria.
- Desktop mantem acao primaria, resumo e urgencias visiveis sem rolar.
- Tablet e mobile preservam a mesma ordem de informacao e nao exigem rolagem horizontal.
- Listas extensas, dialogs e estados vazios foram definidos com proprietario de scroll explicito.
- Financas destaca `Nova movimentacao`; Estudos destaca `Iniciar sessao` para uma recomendacao explicavel.
