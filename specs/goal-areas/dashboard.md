# Dashboard por Areas

Dashboard continua usando somente Goal como dominio principal.

## Viewport

Obrigatorio manter:
- `height: 100dvh`
- `overflow: hidden`
- sem scroll vertical global

Scroll permitido apenas em conteudo interno quando necessario.

## Organizacao

Estrutura visual:

```text
Dashboard

[ resumo geral ]

Body      Mind      Home
Goals     Goals     Goals
```

Cada area deve ter identificacao visual clara, sem exagero de cores ou componentes.

## Responsividade

Desktop:
- 3 areas lado a lado quando houver espaco.

Tablet:
- grid responsivo.

Mobile:
- areas empilhadas ou navegacao compacta.
- sem overflow horizontal.
- scroll somente dentro do conteudo necessario.

## Goal Card

Mostrar apenas informacoes uteis:
- title
- progress
- status
- targetDate quando existir

Evitar cards grandes.

