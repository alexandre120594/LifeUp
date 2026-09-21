# UX Redesign Implementation Plan

## Status geral

- [x] Task 1 - Auditoria e preparacao
- [x] Task 2 - Design System Foundation
- [x] Task 3 - Information Architecture
- [x] Task 4 - App Shell
- [x] Task 5 - Dashboard
- [x] Task 6 - Goals
- [x] Task 7 - Inbox
- [x] Task 8 - Focus
- [x] Task 9 - Notes
- [x] Task 10 - Global States
- [x] Task 11 - Accessibility
- [x] Task 12 - Responsive Review
- [x] Task 13 - Final Nielsen Audit

## Task 1 - Auditoria e preparacao

Objetivo:

- Auditar o estado atual, criar specs e plano de migracao.

Dependencias:

- Codigo atual.
- `productivity-design-system-snowui.html`.

Arquivos previstos:

- `specs/ux-redesign/**`

Riscos:

- Codigo em worktree ja possui alteracoes anteriores.
- Documentacao antiga pode citar entidades removidas.

Criterios de aceite:

- Specs criadas.
- Nenhuma alteracao em `src`, Prisma, rotas, CSS ou componentes.
- Auditoria Nielsen documentada.

Status:

- Concluida.

## Task 2 - Design System Foundation

Objetivo:

- Integrar fundacao SnowUI sem migrar telas completas.

Dependencias:

- Task 1.

Arquivos previstos:

- `src/app/globals.css`
- `src/components/ui/*`
- possivel documentacao complementar em `specs/ux-redesign/01-design-system.md`

Riscos:

- Conflito entre Yevox tokens atuais e SnowUI.
- Regressao light/dark.

Criterios de aceite:

- Tokens base definidos.
- Primitives principais preservam API ou possuem plano de compatibilidade.
- Estados default/hover/focus/disabled documentados.

Status:

- Concluida.

Implementado:

- adicionados aliases SnowUI em `src/app/globals.css` sem remover os tokens Yevox/shadcn existentes;
- adicionados tokens semanticos de superficie, texto secundario/terciario, hover, pressed, status, spacing, radius, shadow, motion e layout;
- `data-theme="dark"` agora compartilha a mesma base visual de `.dark`;
- `ThemeSwitcher` e bootstrap em `src/app/layout.tsx` escrevem `data-theme` junto com a classe `.dark`;
- primitives principais preservam API atual e usam a fundacao nova:
  - `Button`
  - `Card`
  - `Input`
  - `Badge`
  - `Select`
  - `Dialog`
  - `Skeleton`
  - `Toast`

Estados documentados/garantidos nesta fundacao:

- default: superficie `panel`/acao `primary`;
- hover: `hover`/`pressed` por token;
- active: leve deslocamento em `Button`;
- focus-visible: ring tokenizado via `ring`;
- disabled: opacidade reduzida, cursor e superficie sutil em controles;
- destructive/error: `destructive`/`danger`, com toast de erro usando `role="alert"`.

## Task 3 - Information Architecture

Objetivo:

- Ajustar navegacao e nomes conforme arquitetura centrada em Goal.

Dependencias:

- Task 2 recomendada.

Arquivos previstos:

- `src/components/app-sidebar.tsx`
- `src/components/app-shell.tsx`
- docs/specs se necessario

Riscos:

- Study/Finance podem perder descoberta se forem escondidos demais.
- `Settings` nao existe como rota atual.

Criterios de aceite:

- Navegacao principal clara.
- Rotulos definidos.
- Nenhuma funcionalidade real desaparece sem decisao explicita.

Status:

- Concluida.

Implementado:

- navegacao principal reorganizada em `Hoje`, `Metas`, `Captura`, `Foco` e `Notas`;
- Estudos e Financas foram mantidos acessiveis como grupos secundarios;
- rotulos da sidebar e topbar foram migrados para PT-BR sem remover rotas existentes;
- `Foco` foi promovido para o fluxo principal usando a rota atual `/pomodoro`;
- `Settings`/Configuracoes nao foi criada, pois nao existe rota real hoje.

Validacao:

- Task 4 foi revalidada apos esta task.

## Task 4 - App Shell

Objetivo:

- Migrar shell, topbar, sidebar e controles globais para SnowUI.

Dependencias:

- Task 2.
- Task 3.

Arquivos previstos:

- `src/components/app-shell.tsx`
- `src/components/app-sidebar.tsx`
- `src/components/dashboard-viewport.tsx`
- `src/components/menu-page-header.tsx`
- `src/app/ThemeSwitcher.tsx`

Riscos:

- Responsividade do sidebar.
- Scroll interno em viewport.

Criterios de aceite:

- Estado ativo claro.
- Topbar mostra contexto correto.
- Mobile/desktop validados.

Status:

- Concluida.

Implementado:

- `AppShell` migrado para tokens SnowUI/SnowUI-compatible de superficie, borda, sombra e texto.
- Topbar mostra contexto correto por rota ja com os novos nomes de IA.
- `ThemeSwitcher` permanece compacto para desktop e mobile.
- Sidebar mantem ativo claro com `aria-current`, icone destacado, tooltip no modo colapsado e badges apenas quando relevantes.
- `DashboardViewport` e `MenuPageHeader` seguem alinhados aos tokens compartilhados e mantem scroll interno.

Observacao:

- A Task 4 havia sido executada antes da Task 3. Apos a Task 3, a Task 4 foi revisada e ajustada aos nomes/grupos finais.

## Task 5 - Dashboard

Objetivo:

- Transformar `/` em visao "Hoje" orientada a progresso e proxima acao.

Dependencias:

- Task 2.
- Task 3.
- Task 4 recomendada.

Arquivos previstos:

- `src/app/page.tsx`
- componentes derivados de GoalBoard se necessario

Riscos:

- Duplicar logica de Goal se separacao for mal feita.
- Reintroduzir hierarquia antiga indevidamente.

Criterios de aceite:

- Dashboard nao duplica Goals.
- Mantem dominio `Goal`.
- Estados loading/empty/error claros.

Status:

- Concluida.

Implementado:

- `/` deixou de renderizar `GoalBoard` e virou a visao `Hoje`.
- adicionados cards de resumo, proxima acao, metas com prazo/progresso e atalhos para Captura, Foco e Notas.
- estados de carregamento, erro com retry e vazio foram definidos.
- dominio continua exclusivamente em `Goal`, sem Project/Habit/Task.

## Task 6 - Goals

Objetivo:

- Migrar experiencia de gestao de Goals.

Dependencias:

- Task 2.
- Task 10 recomendada para estados globais.

Arquivos previstos:

- `src/app/goals/page.tsx`
- `src/components/goals/GoalBoard.tsx`
- possiveis componentes compartilhados

Riscos:

- Quebrar CRUD.
- Aumentar complexidade alem do modelo simples `Goal`.

Criterios de aceite:

- Criar/editar/pausar/completar/deletar funcionam.
- Delete seguro.
- Validacao clara.
- Sem Project/Habit/Task.

Status:

- Concluida.

Implementado:

- `/goals` usa `GoalBoard` como tela de gestao de Metas.
- formulario tem validacao local de titulo.
- selects de area/status usam primitive `Select`.
- labels e status foram localizados para PT-BR.
- exclusao exige confirmacao.
- lista tem estados de loading, error/retry e vazio por filtro.

## Task 7 - Inbox

Objetivo:

- Migrar Inbox/Captura para SnowUI e estados padronizados.

Dependencias:

- Task 2.
- Task 10 recomendada.

Arquivos previstos:

- `src/app/inbox/page.tsx`
- hooks/services apenas se contrato de erro exigir

Riscos:

- Alterar sem querer relacao atual com Notes.

Criterios de aceite:

- Captura, processamento, conversao em nota e delete funcionam.
- Campos obrigatorios com erro local.
- Empty/error states claros.

Status:

- Concluida.

Implementado:

- `/inbox` foi renomeado na UI para `Captura`.
- formulario tem erro local para titulo vazio.
- tipo/status usam primitive `Select`.
- estados loading, error/retry e empty foram explicitados.
- delete exige confirmacao.
- status e tipos foram localizados em PT-BR.

## Task 8 - Focus

Objetivo:

- Migrar Focus/Pomodoro para UX consistente.

Dependencias:

- Task 2.
- Task 10 recomendada.

Arquivos previstos:

- `src/app/pomodoro/page.tsx`
- `src/components/pomodoro-panel.tsx`

Riscos:

- Quebrar persistencia localStorage.
- Confundir foco geral com Study Subject.

Criterios de aceite:

- Timer, setup, salvar, editar e deletar sessoes funcionam.
- Confirmacao de delete padronizada.
- Estados sem subject e historico vazio claros.

Status:

- Concluida.

Implementado:

- `/pomodoro` foi localizado para `Foco`, mantendo a persistencia localStorage do timer.
- `PomodoroPanel` passou a usar estados reutilizaveis de loading, error/retry e empty.
- setup de sessao e criacao de materia receberam validacao local com erros associados.
- historico de foco manteve editar/salvar/deletar sessoes e ganhou confirmacao de delete por dialog.
- estados sem materia, sem horas por materia e historico vazio ficaram explicitos.

## Task 9 - Notes

Objetivo:

- Migrar Notes para biblioteca escaneavel e edicao clara.

Dependencias:

- Task 2.
- Task 10 recomendada.

Arquivos previstos:

- `src/app/notes/page.tsx`

Riscos:

- Edicao inline atual pode ser simplificada demais.
- Busca/categorias precisam de comportamento definido.

Criterios de aceite:

- Criar, buscar, editar e deletar notas funcionam.
- Validacao por campo.
- Delete seguro.

Status:

- Concluida.

Implementado:

- `/notes` foi migrada para biblioteca escaneavel com busca, filtros por categoria e cards de leitura.
- criacao e edicao de notas usam validacao de titulo/conteudo com erros associados aos campos.
- edicao ficou explicita por card, com cancelar/salvar.
- exclusao usa confirmacao padronizada.
- estados loading, error/retry e empty usam componentes globais.

## Task 10 - Global States

Objetivo:

- Criar padroes reutilizaveis de loading, empty, error, confirmacao e field errors.

Dependencias:

- Task 2.

Arquivos previstos:

- `src/components/ui/*`
- `src/components/*` para componentes globais
- possivel ajuste em `src/services/api-client.ts`

Riscos:

- Mudanca no contrato de erro afetar varias features.

Criterios de aceite:

- Estados reutilizaveis definidos.
- Mutacoes e queries principais usam padrao.
- Sem regressao de toast global.

Status:

- Concluida.

Implementado:

- adicionados componentes reutilizaveis em `src/components/ui/app-state.tsx`:
  - `LoadingState`
  - `EmptyState`
  - `ErrorState`
  - `RetryButton`
  - `FieldError`
- adicionada confirmacao reutilizavel em `src/components/ui/confirm-dialog.tsx`.
- Focus e Notes passaram a usar os novos padroes.
- toast global foi preservado sem mudar contrato.

## Task 11 - Accessibility

Objetivo:

- Aplicar checklist acessivel nas telas migradas.

Dependencias:

- Tasks 2 a 10.

Arquivos previstos:

- componentes e paginas tocadas nas tasks anteriores

Riscos:

- Ajustes de acessibilidade exigirem mudancas estruturais tardias.

Criterios de aceite:

- Navegacao por teclado.
- Labels/erros associados.
- Contraste validado.
- Dialogs e toasts acessiveis.

Status:

- Concluida.

Implementado:

- campos obrigatorios de Focus e Notes usam `label`, `aria-invalid` e `aria-describedby`.
- botoes de icone em Focus/Notes mantem `aria-label`.
- confirmacoes usam `Dialog`, preservando foco e fechamento acessivel via Radix.
- loading usa `role="status"` e error usa `role="alert"`.
- estados vazios/erro foram escritos com mensagens claras e acoes de retry quando aplicavel.

## Task 12 - Responsive Review

Objetivo:

- Revisar desktop/mobile das telas migradas.

Dependencias:

- Tasks 4 a 11.

Arquivos previstos:

- paginas e componentes migrados

Riscos:

- Scroll interno gerar conteudo inacessivel em alturas pequenas.

Criterios de aceite:

- Mobile, tablet e desktop sem sobreposicao.
- Textos nao quebram containers.
- Acoes principais continuam acessiveis.

Status:

- Concluida.

Implementado:

- revisados os padroes responsivos das telas migradas: Hoje, Metas, Captura, Foco e Notas;
- confirmado uso de `h-dvh`, `min-h-0`, `overflow-hidden` no shell e scroll interno nas areas de conteudo;
- confirmados grids responsivos com empilhamento em mobile e colunas em desktop;
- confirmados `min-w-0`, `break-words`, `truncate`, `overflow-x-auto` em pontos sensiveis a textos longos;
- substituidas confirmacoes destrutivas restantes de Metas e Captura por `ConfirmDialog` compartilhado;
- verificado que `window.confirm` restante fica fora do escopo primario desta redesign: LifeHabit legado e Study Planner.

Validacao:

- `npx tsc --noEmit`
- `npm run lint`

## Task 13 - Final Nielsen Audit

Objetivo:

- Reauditar as 10 heuristicas apos redesign.

Dependencias:

- Tasks 2 a 12.

Arquivos previstos:

- `specs/ux-redesign/00-current-state.md` ou novo relatorio final

Riscos:

- Problemas residuais descobertos tarde.

Criterios de aceite:

- Tabela Nielsen atualizada.
- P0/P1 resolvidos ou explicitamente aceitos.
- Riscos restantes documentados.

Status:

- Concluida.

Implementado:

- auditoria final Nielsen registrada em `specs/ux-redesign/00-current-state.md`;
- P0 nao encontrados nesta rodada final;
- P1 originais do escopo principal foram resolvidos por rotulos PT-BR, separacao Hoje/Metas, validacao inline, estados globais, retry visual e confirmacao destrutiva padronizada;
- riscos residuais explicitamente aceitos: telas especializadas de Study/Finance ainda sao densas, Login e areas legadas nao receberam a mesma profundidade de redesign, e o produto ainda convive com Yevox/shadcn/SnowUI-compatible durante a migracao.

Validacao:

- `npx tsc --noEmit`
- `npm run lint`
