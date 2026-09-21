# Plano de implementacao do SnowUI

Fonte visual canonica: `productivity-design-system-snowui.html`.

Este plano divide a migracao visual em partes pequenas. O escopo preserva rotas,
APIs, hooks, tipos de dominio e schema Prisma.

## Parte 1 - Fundacao SnowUI

Status: concluida em 2026-09-20.

- substituir a paleta hibrida Yevox/SnowUI pelos tokens exatos do HTML;
- manter aliases compativeis com Tailwind e shadcn;
- reduzir o tema a claro/escuro com `data-theme` e `.dark` sincronizados;
- atualizar o bootstrap de tema e os metadados do produto.

## Parte 2 - App shell e navegacao

Status: concluida em 2026-09-20.

- aplicar sidebar de 236 px, topbar de 64 px e viewport sem scroll duplo;
- alinhar `AppShell`, `AppSidebar`, `DashboardViewport` e `MenuPageHeader`;
- preservar sidebar recolhivel, drawer mobile e contexto de rota.

## Parte 3 - Primitivos UI

Status: concluida em 2026-09-20.

- normalizar Button, Input, Select, Card, Badge, Dialog, Checkbox, Skeleton,
  Toast e estados compartilhados;
- adicionar Textarea, Progress e SegmentedControl;
- preservar as APIs publicas existentes e estados acessiveis.

## Parte 4 - Padroes de produtividade

Status: concluida em 2026-09-20.

- criar StatCard, GoalCard, TaskRow, FocusCard e StreakCard em
  `src/components/productivity`;
- manter esses componentes apenas visuais e compostos sobre os primitivos.

## Parte 5 - Telas principais

Status: concluida em 2026-09-20.

- migrar Hoje, Metas, Captura, Foco e Notas para os novos padroes;
- manter dados, regras de negocio e contratos atuais.

## Parte 6 - Areas secundarias

Status: concluida em 2026-09-20.

- normalizar `study`, `finance`, `finance/tracker` e `life-habits`;
- remover estilos diretos fora do sistema sem alterar comportamento.

## Parte 7 - Revisao final e documentacao

Status: concluida em 2026-09-20.

- revisar responsividade, foco, contraste e scroll interno;
- executar TypeScript, lint e build completos;
- atualizar `README.md` e `ARCHIVE.md` com o estado final da migracao.

## Validacao das Partes 1 a 3

- `npx tsc --noEmit`: passou;
- `npm run lint`: passou;
- `npm run build`: passou;
- o build manteve apenas avisos preexistentes sobre
  `baseline-browser-mapping` e a convencao de `middleware` do Next.js.

## Validacao final das Partes 4 a 7

- `StatCard`, `GoalCard`, `TaskRow`, `FocusCard` e `StreakCard` foram criados
  como composicoes visuais em `src/components/productivity`;
- Hoje, Metas, Captura, Foco e Notas usam a fundacao e os padroes SnowUI,
  preservando hooks e regras de negocio;
- Estudos, Financas, Gastos importados e Life Habits tiveram cores de estado,
  superficies e destaques normalizados para tokens semanticos;
- os aliases temporarios Yevox foram removidos depois da ultima referencia;
- o shell permanece em `100dvh`, com topbar/sidebar fixos e rolagem restrita
  ao conteudo central;
- `npx tsc --noEmit`: passou;
- `npm run lint`: passou;
- `npm run build`: passou.
