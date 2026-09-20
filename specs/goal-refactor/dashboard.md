# Dashboard

Dashboard usa somente Goal como dominio principal.

## Layout

```text
viewport
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│ Goal metrics                 │
├──────────────────────────────┤
│                              │
│ Goals                        │
│                              │
└──────────────────────────────┘
```

## Viewport

Obrigatorio:
- `height: 100dvh`
- `overflow: hidden`
- sem scroll vertical global na pagina

Usar:
- `h-dvh`
- `h-full`
- `min-h-0`
- `flex-1`
- `overflow-hidden`

Scroll permitido somente em areas internas, como lista de Goals:
- `overflow-y-auto`

## Responsividade

Desktop:
- Header
- Metrics
- Goal content

Tablet:
- reduzir colunas automaticamente.

Mobile:
- cards compactos.
- sem overflow horizontal.
- scroll interno quando necessario.

Evitar altura fixa em pixels para conteudo principal. Preferir `flex`, `grid`, `minmax()` e `min-h-0`.

## Metricas

Permitir apenas:
- Goals ativos
- Goals concluidos
- Progresso medio
- Goals proximos do prazo

Nao recriar:
- task analytics
- habit analytics
- task streak
- habit streak
- activity baseada em tasks
