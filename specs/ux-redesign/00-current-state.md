# Estado Atual do Produto

## Arquitetura atual

LifeUp e um app Next.js App Router cujo dominio principal atual e `Goal`, nao mais `Project -> Habit -> Task`.

Fluxo principal de Goal:

```text
UI
-> useGoals
-> GoalServices
-> /api/goals
-> Prisma
-> Goal
```

Arquitetura global observada:

- `src/app`: rotas App Router, layouts, paginas e route handlers.
- `src/components`: App Shell, Sidebar, componentes compartilhados e UI primitives.
- `src/components/ui`: primitives estilo shadcn/Radix, incluindo Button, Card, Dialog, Select, Sheet, Sidebar, Toast, Skeleton, Badge, Input, Chart.
- `src/components/goals/GoalBoard.tsx`: UI principal de Goals, usada no Dashboard e na pagina Goals.
- `src/hooks`: hooks TanStack Query para Goals, Inbox, Notes, Pomodoro, Study, Finance e LifeHabit.
- `src/services`: wrappers de API por dominio.
- `src/lib`: Prisma, auth, analytics, finance, pomodoro, validacao de goals e utilitarios.
- `src/types`: tipos compartilhados.
- `prisma/schema.prisma`: fonte de verdade de persistencia.

Dominio principal atual:

- `User -> Goal`
- `Goal.area`: `BODY`, `MIND`, `HOME`
- `Goal.status`: `ACTIVE`, `PAUSED`, `COMPLETED`

Areas independentes existentes:

- Inbox
- Notes
- Study
- Study Focus Timer/Pomodoro
- Finance
- Account Spend Tracker
- LifeHabit legado, fora da navegacao principal

## Rotas

Rotas de UI confirmadas no codigo:

| Rota | Tela | Status no produto |
| --- | --- | --- |
| `/login` | Login | Ativa, publica |
| `/` | Life Dashboard | Ativa, dashboard de Goals |
| `/goals` | Goals | Ativa, usa o mesmo GoalBoard do dashboard |
| `/inbox` | Inbox | Ativa, captura independente |
| `/notes` | Notes | Ativa, biblioteca independente |
| `/pomodoro` | Focus Timer | Ativa, sessoes de foco por Study Subject |
| `/study` | Study Dashboard | Ativa |
| `/study/mistakes` | Mistake Log | Ativa |
| `/study/planner` | Study Plan | Ativa |
| `/study/trt-plan` | Dataprev Plan | Ativa |
| `/study/trt-audit-plan` | TRT Audit Plan | Ativa |
| `/finance` | Finance | Ativa |
| `/finance/tracker` | Spend Tracker | Ativa |
| `/life-habits` | LifeHabit legado | Existe, mas fora da navegacao principal |

Route handlers relevantes:

- `/api/auth/*`
- `/api/goals/*`
- `/api/inbox/*`
- `/api/notes/*`
- `/api/pomodoro/*`
- `/api/study-*`
- `/api/finance/*`
- `/api/life-habits/*`

## Features

Features encontradas:

- Login simples por email/nome, com cookie `lifeup_user_id`.
- App Shell autenticado com sidebar, topbar, theme switcher e logout.
- Dashboard de Goals por area, metricas e filtros.
- CRUD de Goal inline.
- Inbox com captura rapida, filtro por status, marcar concluido/reabrir, converter em Note e deletar.
- Notes com criacao, busca, categorias derivadas, edicao inline e delete.
- Focus Timer/Pomodoro com timer persistido em localStorage, setup dialog, historico, metricas e subject selection.
- Study Dashboard com metricas, graficos, filas de revisao e links para estudo.
- Finance Dashboard e Spend Tracker.
- LifeHabit legado de quit-habit, separado do dominio principal.

## Layout global

O `RootLayout` aplica `Plus_Jakarta_Sans`, `Providers` e `AppShell`.

O `AppShell`:

- remove shell na rota `/login`;
- usa `SidebarProvider`, `AppSidebar`, topbar fixa dentro de viewport `h-dvh`;
- usa `overflow-hidden` no main e delega scroll as areas internas;
- mostra titulo generico `Life Dashboard` ou `Study Dashboard` conforme rota;
- inclui `ThemeSwitcher` e botao `Logout`.

Padrao de pagina:

- paginas principais usam `DashboardViewport` ou containers equivalentes;
- layout full-viewport com `overflow-hidden`;
- conteudo interno normalmente usa `overflow-y-auto`.

## Navegacao atual

Navegacao principal no sidebar:

- LifeUp Workspace
  - Life Dashboard
  - Goals
  - Inbox
  - Notes
  - Finance
  - Spend Tracker
- Study tools
  - Study Dashboard
  - Mistake Log
  - Study Plan
  - Dataprev Plan
  - TRT Audit Plan
  - Focus Timer

Observacoes:

- A rota ativa e detectada por pathname.
- Cada item pode mostrar badge numerica.
- `LifeHabit` existe mas nao aparece na navegacao principal.
- A navegacao mistura dominios centrais do produto com areas especializadas de estudo/financas.
- O titulo do shell muda apenas entre Life e Study, deixando Finance/Inbox/Notes dependendo do header interno para contexto.

## Componentes compartilhados

Componentes compartilhados observados:

- `AppShell`
- `AppSidebar`
- `DashboardViewport`
- `MenuPageHeader`
- `CurrentUserName`
- `GoalBoard`
- `PomodoroPanel`
- `OverviewPanel`
- `ListSection`
- `CreationFlowCard`
- `CounterWithIcon`
- `MoneyInput`
- Charts em `src/components/ChartsComponent`
- UI primitives em `src/components/ui`

## UI Libraries

Bibliotecas de UI/estado/visual:

- Tailwind CSS 4
- Radix UI: Dialog, Select, Checkbox, Separator, Tooltip, Slot
- shadcn-style local components via `components.json`
- Lucide React
- Recharts
- TanStack Query
- React Hook Form em Finance
- Zustand instalado, mas nao foi encontrada pasta `src/store` na arvore atual listada

## Estilos e tokens existentes

`src/app/globals.css` define tokens Tailwind via `@theme inline`, incluindo:

- `--background`, `--foreground`, `--card`, `--popover`
- `--primary`, `--secondary`, `--accent`, `--muted`
- `--destructive`, `--border`, `--input`, `--ring`
- `--chart-1` a `--chart-5`
- tokens de sidebar
- tokens Yevox: `--primary-yevox`, `--secondary-yevox`, `--background-yevox`, `--accent-yevox`, `--border-yevox`

Tema atual:

- usa OKLCH e variaveis dinamicas de hue/chroma;
- suporta `.dark`;
- `ThemeSwitcher` troca familias de cores (`grove`, `harbor`, `vault`, `sentinel`, `graphite`) e modo light/night por localStorage;
- fonte atual e Plus Jakarta Sans.

SnowUI disponivel:

- `specs/design-system/productivity-design-system-snowui.html`
- contem contrato visual com tokens `--bg`, `--panel`, `--text`, `--border`, `--primary`, estados, spacing 4px, radius 12/16px, shadows leves, light/dark e componentes referencia.

## Responsividade

Padroes positivos:

- grids usam breakpoints `sm`, `md`, `lg`, `xl`, `2xl`;
- sidebar usa componente responsivo;
- cards e listas usam `min-w-0`, `truncate`, `break-words` em varios pontos;
- Focus Timer tem layout adaptativo e botoes que viram largura total em telas menores.

Riscos:

- viewport travada com scroll interno pode esconder conteudo se areas internas nao tiverem altura bem calculada;
- formularios inline de Goal, Inbox e Notes podem competir com lista em telas menores;
- algumas paginas especializadas, como Finance e Study, sao densas e podem aumentar carga cognitiva em mobile;
- labels e conteudo estao majoritariamente em ingles, apesar do app estar com `lang="pt-BR"`.

## Loading states

Encontrados:

- Goals: texto `Loading goals.`
- Inbox: texto `Loading inbox.`
- Notes: texto `Loading notes.`
- Study: textos como `Loading study review queue...`
- Finance: usa `isLoading`, padrao precisa ser revisado em detalhe na task da feature.

Problemas:

- existe componente `Skeleton`, mas e pouco usado nas telas principais auditadas;
- loading states sao textuais e inconsistentes;
- nao ha padrao global de busy state para areas ou cards;
- queries com erro geralmente dependem do comportamento global de fetch/mutation ou ficam sem estado visual especifico na tela.

## Empty states

Encontrados:

- Goals: `No goals here.`
- Inbox: `No inbox items.`
- Notes: `No notes found.`
- Focus: `Save a focus session to see subject hours.` e `Complete a study focus cycle to build your history.`
- Study: empty states especificos, por exemplo `No due mistakes.`

Problemas:

- empty states variam em densidade, tom e acao sugerida;
- Goals nao orienta claramente qual proxima acao tomar;
- Inbox/Notes mostram texto simples, sem CTA contextual;
- alguns textos estao em ingles, desalinhados com `pt-BR`.

## Error states

Encontrados:

- `Providers` usa `MutationCache.onError` para toast global em mutacoes.
- Login mostra erro inline.
- `api-client` le `errorData.message` ou usa `Something went wrong`.
- Alguns route handlers retornam `{ error: ... }`, outros `{ message: ... }`.

Problemas:

- inconsistencias entre `error` e `message` podem ocultar mensagens melhores no cliente;
- queries (`useQuery`) nao tem padrao visivel de erro nas telas auditadas;
- validacoes client-side em formulacoes muitas vezes apenas retornam sem feedback;
- delete de Goal/Inbox/Notes nao pede confirmacao; Pomodoro usa `window.confirm`, destoando dos dialogs do app.

## Feedback de acoes

Existe feedback global por toast para mutacoes:

- sucesso: `Saved`, `Updated`, `Deleted` etc.
- erro: `Action failed`

Problemas:

- alguns fluxos de validacao local retornam silenciosamente antes da mutacao;
- feedback visual no proprio elemento nem sempre existe;
- `window.confirm` aparece em Focus History, mas delete de Goal, Inbox e Note ocorre direto;
- labels de toasts e botoes estao em ingles.

## Problemas de arquitetura da informacao

Base conceitual usada: a referencia da PM3 descreve AI como organizacao de conteudo, navegacao, taxonomia, rotulagem, busca/conteudo e acessibilidade para ajudar o usuario a entender onde esta, para onde pode ir e o que pode fazer.

Problemas observados:

- A hierarquia do sidebar mistura Life, Finance e Study sem deixar claro se Study/Finance sao modulos secundarios ou pilares equivalentes.
- O dominio principal e Goal, mas a palavra Life Dashboard compete com Goals e pode parecer uma camada separada.
- Dashboard e Goals usam o mesmo `GoalBoard`, reduzindo diferenciacao entre visao de hoje e gestao completa.
- Rotulos estao em ingles apesar de `pt-BR`, por exemplo `Life Dashboard`, `Goals`, `Inbox`, `Notes`, `Focus Timer`.
- `Study Dashboard`, `Mistake Log`, `Study Plan`, `Dataprev Plan`, `TRT Audit Plan` criam um grupo profundo e especializado dentro da mesma navegacao principal.
- Badges numericas aparecem em quase todos os itens, mas o significado varia: contagem de goals, inbox, notes, study subjects, mistakes, numeros fixos de planos.
- Acoes principais mudam de lugar por tela: formulario lateral em Goals/Inbox/Notes, botoes no hero em Study, dialog em Finance, setup dialog em Focus.

## Problemas de consistencia visual

- SnowUI usa Inter, radius 12/16px, superfícies tonais e tokens `--bg/--panel/--text`; app atual usa Plus Jakarta Sans, Yevox OKLCH e shadcn defaults.
- Formularios usam mix de `Input`, `textarea` manual e `select` nativo.
- Select Radix existe, mas Goals/Inbox ainda usam `<select>` nativo.
- Dialogs existem em Finance/Focus/LifeHabit, mas Goal edita inline.
- Loading e empty states variam por tela.
- Algumas telas usam gradientes/hero mais expressivos, outras sao utilitarias.
- Idioma e casing variam entre ingles e portugues.

## Problemas de acessibilidade

- `html lang="pt-BR"` conflita com interface majoritariamente em ingles.
- Alguns inputs dependem apenas de placeholder, sem label visivel ou `aria-label`.
- `textarea` manual em Inbox/Notes nao tem label explicito.
- Botoes icon-only em Goals tem `aria-label`, ponto positivo.
- Toast usa `role="status"`, ponto positivo, mas errors poderiam usar `role="alert"` em casos criticos.
- `window.confirm` nao segue padrao acessivel/visual do app.
- Badges e cores comunicam estado, mas nem sempre com texto em portugues claro.
- Falta um padrao documentado de foco, contraste, estados disabled e mensagens de erro por campo.

## Auditoria Nielsen

| ID | Tela | Problema | Impacto | Heuristica | Prioridade | Proposta |
| -- | ---- | -------- | ------- | ---------- | ---------- | -------- |
| UX-001 | Goals/Dashboard | Criar/editar Goal tem toast global, mas nao ha erro por campo quando a validacao local falha antes da mutacao. | Usuario pode clicar e nao entender por que nada aconteceu. | H1, H9 | P1 | Padronizar FieldError inline e feedback de formulario. |
| UX-002 | Goals/Dashboard | Delete de Goal executa direto, sem confirmacao ou undo. | Perda acidental de informacao. | H3, H5 | P1 | Usar confirm dialog ou undo toast para exclusoes destrutivas. |
| UX-003 | Goals/Dashboard | Dashboard e `/goals` usam praticamente a mesma composicao. | Usuario nao entende diferenca entre visao inicial e gestao. | H2, H6 | P1 | Definir Dashboard como visao de hoje/progresso e Goals como gestao completa. |
| UX-004 | App Shell | Titulo do topbar e generico: Life Dashboard ou Study Dashboard. | Contexto fraco em Finance, Inbox, Notes e Goals. | H1, H6 | P2 | Topbar deve refletir rota atual e breadcrumb/contexto. |
| UX-005 | Sidebar | Badges tem significados diferentes e alguns valores fixos. | Usuario interpreta contagens como alertas equivalentes. | H2, H4 | P2 | Definir semantica de badge: pendencias, total ou remover. |
| UX-006 | Global | Labels do produto estao em ingles com `lang=pt-BR`. | Reduz clareza e consistencia para publico PT-BR. | H2, H4 | P1 | Definir vocabulario PT-BR no redesign. |
| UX-007 | Goals/Inbox/Notes | Formularios principais ficam sempre visiveis ao lado da lista. | Aumenta carga cognitiva em fluxo de consulta. | H8 | P2 | Priorizar acao primaria compacta e abrir composicao dedicada/dialog quando apropriado. |
| UX-008 | Inbox | `Capture` retorna silenciosamente se titulo estiver vazio. | Usuario nao recebe ajuda para corrigir. | H5, H9 | P1 | Validacao inline com mensagem e foco no campo. |
| UX-009 | Notes | Criar nota exige titulo e conteudo, mas falha local sem mensagem. | Usuario nao entende por que a nota nao salva. | H5, H9 | P1 | Mensagens de erro por campo. |
| UX-010 | Notes | Cada nota renderiza editor completo inline. | Lista fica densa, pouco escaneavel e pesada visualmente. | H8 | P2 | Separar modo leitura/lista e modo edicao. |
| UX-011 | Focus | Excluir sessao usa `window.confirm`; outras areas nao confirmam. | Padrao de controle/liberdade inconsistente. | H3, H4 | P2 | Criar Dialog de confirmacao padrao para acoes destrutivas. |
| UX-012 | Focus | Botao Start abre setup dialog apenas em certas condicoes; se nao houver subject, acao pode parecer bloqueada. | Descoberta fraca do pre-requisito. | H1, H6 | P2 | Mostrar pre-requisito e CTA para criar subject antes do start. |
| UX-013 | Global | Loading states textuais e sem skeleton padronizado. | Interface parece instavel e menos polida. | H1, H4 | P2 | Criar padrao de skeleton/placeholder por tipo de area. |
| UX-014 | Global | Query errors nao tem tratamento visual consistente. | Falhas de rede podem virar tela vazia ou estado indefinido. | H1, H9 | P1 | Criar ErrorState reutilizavel com retry. |
| UX-015 | Global | Inputs usam placeholder como rotulo em varias telas. | Acessibilidade e compreensao sofrem apos preenchimento. | H2, H10 | P1 | Label persistente para campos, com helper/error text. |
| UX-016 | App Shell | Navegacao mistura Life, Study e Finance sem arquitetura clara de prioridades. | Usuario novo pode nao entender caminho principal. | H6, H8 | P1 | Reorganizar IA por primario/secundario e objetivo. |
| UX-017 | Theme | ThemeSwitcher atual e Yevox podem conflitar com SnowUI. | Migracao visual pode gerar dois sistemas concorrentes. | H4 | P1 | Mapear tokens atuais para SnowUI e descontinuar aliases duplicados gradualmente. |
| UX-018 | Global | Textos de empty state raramente indicam proxima acao. | Usuario recebe informacao, mas nao orientacao. | H10 | P2 | Empty states com mensagem, causa e CTA principal. |
| UX-019 | Responsivo | Scroll interno em muitas areas exige disciplina de altura. | Conteudo pode ficar inacessivel se um painel crescer demais. | H7, H8 | P2 | Definir padrao responsivo para shells, panels e scroll zones. |
| UX-020 | Login | Login tem erro inline, mas sem labels persistentes e sem contexto do produto. | Entrada inicial pouco clara. | H2, H9 | P2 | Padronizar formulario de auth com labels e mensagem contextual. |

## Auditoria Nielsen final

Data da revisao final:

- 2026-09-20

Escopo reavaliado:

- App Shell
- Hoje
- Metas
- Captura
- Foco
- Notas
- estados globais compartilhados criados na redesign

Resumo:

- P0: nenhum encontrado.
- P1 do escopo principal: resolvidos.
- P2 restantes: aceitos como proximos passos ou fora do escopo desta rodada.

| ID inicial | Status final | Evidencia |
| -- | -- | -- |
| UX-001 | Resolvido | Metas, Captura, Foco e Notas usam validacao local visivel para campos obrigatorios. |
| UX-002 | Resolvido | Delete de Metas usa `ConfirmDialog`. |
| UX-003 | Resolvido | `/` virou Hoje; `/goals` ficou como gestao de Metas. |
| UX-004 | Resolvido | Topbar usa contexto por rota em PT-BR. |
| UX-005 | Aceito | Badges foram reduzidos/recontextualizados na navegacao principal, mas modulos especializados ainda podem evoluir. |
| UX-006 | Resolvido no escopo | Rotulos principais migrados para PT-BR; telas especializadas antigas podem manter residuos. |
| UX-007 | Aceito | Formularios principais continuam visiveis, mas com grids responsivos e scroll interno controlado. |
| UX-008 | Resolvido | Captura mostra erro de titulo vazio. |
| UX-009 | Resolvido | Notas mostram erros de titulo/conteudo. |
| UX-010 | Resolvido | Notas mostram cards de leitura e editor apenas quando acionado. |
| UX-011 | Resolvido no escopo | Foco, Metas, Captura e Notas usam dialog compartilhado; LifeHabit legado e Study Planner permanecem fora do escopo. |
| UX-012 | Resolvido | Foco explicita estados sem materia e setup de sessao. |
| UX-013 | Resolvido no escopo | `LoadingState` foi criado e aplicado nas telas redesenhadas principais. |
| UX-014 | Resolvido no escopo | `ErrorState`/retry foram criados e aplicados nas telas redesenhadas principais. |
| UX-015 | Resolvido no escopo | Campos tocados ganharam labels persistentes e erros associados. |
| UX-016 | Resolvido | Navegacao principal agora prioriza Hoje, Metas, Captura, Foco e Notas. |
| UX-017 | Aceito | Tokens SnowUI-compatible convivem com Yevox/shadcn durante migracao gradual. |
| UX-018 | Resolvido no escopo | Empty states principais passaram a orientar proxima acao. |
| UX-019 | Resolvido no escopo | Shell, viewport e paineis revisados com `min-h-0`, scroll interno e grids responsivos. |
| UX-020 | Aceito | Login nao foi redesenhado nesta rodada. |

Riscos restantes aceitos:

- Study e Finance seguem densos em algumas rotas especializadas.
- Login e LifeHabit legado nao receberam o mesmo nivel de redesenho.
- `window.confirm` restante existe apenas em LifeHabit legado e Study Planner.
- O design system ainda esta em migracao gradual entre Yevox/shadcn e tokens SnowUI-compatible.

## Debitos tecnicos relacionados a UI/UX

- Dois sistemas visuais coexistem: Yevox/shadcn atual e SnowUI HTML futuro.
- `textarea` e `select` manuais duplicam comportamento que ja existe em primitives.
- Falta padrao formal de `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmDialog` e `FieldError`.
- A lingua do produto precisa ser decidida e aplicada.
- Topbar/sidebar precisam de IA mais explicita.
- Query errors e validacoes client-side precisam de superficie visual consistente.
- Alguns docs antigos ainda citam arquitetura anterior em AGENTS.md, mas README/ARCHIVE atuais ja afirmam Goal como dominio principal.
