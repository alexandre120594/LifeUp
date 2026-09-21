# Design System SnowUI

## Estado atual

O app usa Tailwind CSS 4, Radix primitives, componentes locais estilo shadcn e tokens Yevox definidos em `src/app/globals.css`.

Referencia futura:

```text
specs/design-system/productivity-design-system-snowui.html
```

Task 2 implementou a fundacao do Design System sem migrar telas completas.

## Contrato SnowUI identificado

O HTML define:

- fonte: Inter como referencia, com fallback system UI;
- light/dark por `:root` e `[data-theme="dark"]`;
- tokens semanticos: `--bg`, `--panel`, `--panel-elevated`, `--panel-subtle`, `--text`, `--text-secondary`, `--text-tertiary`, `--border`, `--border-strong`, `--hover`, `--pressed`, `--focus`, `--primary`;
- status: `--success`, `--warning`, `--danger`, `--info`;
- escala tipografica de 11px a 32px;
- grid de spacing de 4px: `--s-1` a `--s-16`;
- radius: 4, 8, 12, 16, 20 e pill;
- sombras leves: `--shadow-1`, `--shadow-2`, `--shadow-3`;
- motion: `--fast`, `--normal`, `--slow`, `--ease`;
- layout: sidebar, topbar e content max;
- prioridade visual: texto > estado > estrutura > decoracao.

## Integracao implementada na Task 2

Arquivos alterados:

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/ThemeSwitcher.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/toast.tsx`

Decisoes:

- Yevox continua como fonte cromatica dinamica, mas agora alimenta aliases SnowUI.
- `.dark` continua suportado; `[data-theme="dark"]` passa a apontar para o mesmo contrato.
- A fonte Plus Jakarta Sans foi preservada por compatibilidade visual do produto.
- APIs dos primitives foram preservadas para evitar migracao em massa nas telas.
- Novos componentes devem preferir aliases semanticos: `panel`, `panel-elevated`, `panel-subtle`, `text-secondary`, `text-tertiary`, `hover`, `pressed`, `success`, `warning`, `danger`, `info`.

Estados cobertos nos primitives:

- `Button`: default, hover, active, focus-visible, disabled e destructive.
- `Input`: default, hover, focus-visible, disabled e invalid.
- `Select`: trigger/content/item com hover, checked, focus-visible e disabled.
- `Dialog`: overlay, elevated surface, focus close control e shadow tokenizada.
- `Badge`: default, secondary, destructive e outline.
- `Toast`: success/error, com erro usando `role="alert"`.
- `Skeleton`: superficie sutil tokenizada.

## Estrategia de integracao futura

1. Migrar App Shell e navegacao sobre a fundacao atual.
2. Criar estados globais reutilizaveis: LoadingState, EmptyState, ErrorState, ConfirmDialog e FieldError.
3. Migrar feature por feature.
4. Remover tokens Yevox duplicados apenas quando nao houver uso restante.

Nao feito na Task 2:

- nao trocar fonte;
- nao migrar paginas completas;
- nao alterar contratos de dados;
- nao remover tokens antigos.

## Tokens

Mapeamento futuro sugerido:

| Atual | SnowUI futuro | Observacao |
| --- | --- | --- |
| `--background` | `--bg` | Fundo geral da aplicacao |
| `--card` | `--panel` | Superficie base |
| `--popover` | `--panel-elevated` | Menus, dialogs, popovers |
| `--foreground` | `--text` | Texto principal |
| `--muted-foreground` | `--text-secondary` | Texto secundario |
| `--border` | `--border` | Borda suave |
| `--input` | `--border` ou `--border-strong` | Inputs devem ter estado proprio |
| `--ring` | `--focus` | Foco visivel |
| `--primary` | `--primary` | Acao primaria |
| `--destructive` | `--danger` | Erro/destrutivo |
| `--chart-*` | tokens especificos de data viz | Preservar contraste e semantica |

## Cores

SnowUI usa neutros e acentos suaves:

- preto/branco estaticos;
- escalas alpha para texto/bordas;
- superficies brancas/cinzas no light;
- superficies cinzas escuras no dark;
- acentos: purple, indigo, blue, cyan, mint, green, yellow, orange, red.

Diretriz:

- nao usar hex direto em componentes;
- usar tokens semanticos;
- reservar cores fortes para status, foco e acao primaria;
- Goals por area podem manter diferenciacao de status, mas devem passar por tokens semanticos ou aliases de area.

## Typography

Atual:

- Plus Jakarta Sans via Next font.

SnowUI:

- Inter/system UI.
- Escala de 11, 12, 13, 14, 16, 18, 20, 24, 28, 32px.
- `leading-tight`, `leading-ui`, `leading-body`.

Decisao futura necessaria:

- manter Plus Jakarta Sans como adaptacao da marca ou migrar para Inter.

Recomendacao:

- Definir tokens de tipo primeiro e ajustar componentes, antes de trocar fonte.

## Spacing

SnowUI define grid de 4px:

- `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

App atual ja usa Tailwind spacing proximo disso, mas sem contrato explicito.

Recomendacao:

- padronizar padding de cards, formularios, headers e gaps por densidade;
- evitar valores improvisados em telas novas;
- manter viewport shell com areas internas controlando overflow.

## Radius

SnowUI:

- default 12px;
- cards principais 16px;
- pills 999px.

Atual:

- `--radius: 0.625rem` e shadcn `rounded-md`, `rounded-lg`, `rounded-xl`.

Recomendacao:

- mapear `--radius-md` para 8/10/12 conforme decisao;
- cards de superficie principal devem convergir para 16px;
- controles compactos podem usar 8/10/12px.

## Shadows

SnowUI prioriza bordas suaves e superficies tonais.

Recomendacao:

- usar `--shadow-1` para cards comuns;
- `--shadow-2` para popovers/dialogs;
- evitar sombras pesadas em dashboards densos.

## Surfaces

Superficies futuras:

- `bg`: fundo global;
- `panel`: card ou painel;
- `panel-elevated`: dialog, popover, topbar;
- `panel-subtle`: areas internas, empty states, metric tiles.

Mapear antes de migrar paginas para evitar gradientes e cards com aparencia concorrente.

## Light/Dark

Atual:

- `.dark` controlado por localStorage `app-display-mode`.

SnowUI:

- `[data-theme="dark"]`.

Risco:

- dois mecanismos de tema.

Proposta futura:

- decidir um unico mecanismo;
- manter compatibilidade temporaria com `.dark`;
- fazer `ThemeSwitcher` escrever o atributo/classe definido;
- validar contraste em ambos os modos.

## Componentes

Mapa de componentes atuais para futuros componentes SnowUI:

| Atual | Futuro | Observacao |
| --- | --- | --- |
| `Button` | `Button` | Atualizar variantes, radius, focus e disabled |
| `Input` | `TextField/Input` | Adicionar label, helper e error |
| `<textarea>` manual | `Textarea` | Criar primitive compartilhada |
| `<select>` nativo | `Select` | Migrar Goals/Inbox para Radix/SnowUI |
| `Card` | `Panel/Card` | Densidade e superficies tonais |
| `Badge` | `Badge/StatusTag` | Semantica por estado |
| `Dialog` | `Dialog` | Confirmacoes e formularios |
| `ToastProvider` | `Toast` | Ajustar role, posicao, copy e variantes |
| `Skeleton` | `Skeleton` | Padronizar loading states |
| `Sidebar` | `AppSidebar/NavItem` | Hierarquia e estados ativos |
| `MenuPageHeader` | `PageHeader` | Breadcrumb, titulo e acao primaria |
| `DashboardViewport` | `Viewport/PageFrame` | Scroll zones e responsividade |
| `GoalMetrics` | `MetricCard` | Componente compartilhado |
| `GoalCard` | `GoalCard` | Area/status/progresso |
| `NoteEditor` inline | `EditorPanel` | Separar leitura/edicao |

## Estados

Cada componente migrado deve preservar:

- default;
- hover;
- active/pressed;
- focus-visible;
- disabled;
- loading;
- error;
- selected/active quando aplicavel.

Estados globais a criar futuramente:

- `LoadingState`
- `EmptyState`
- `ErrorState`
- `ConfirmDialog`
- `FieldError`
- `InlineNotice`

## Estrategia para substituir estilos atuais

Ordem recomendada:

1. Tokens e primitives.
2. App Shell e navegacao.
3. Feedback/states globais.
4. Dashboard.
5. Goals.
6. Inbox.
7. Focus.
8. Notes.
9. Auditoria responsiva e acessibilidade.

Regra:

- nenhuma feature deve depender de hex direto;
- nenhuma nova tela deve criar select/textarea manual se houver primitive;
- estilos especificos de pagina devem ser excecao, nao fundacao.
