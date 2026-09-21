 # Implementar SnowUI Design System no LifeUp

  ## Resumo

  Migrar o app atual para usar integralmente o contrato visual de specs/design-system/productivity-design-system-snowui.html, preservando a arquitetura Next.js,
  os dados e as APIs existentes. A implementação será uma normalização visual completa: tokens SnowUI como fonte de verdade, primitivos consistentes, padrões de
  produtividade reutilizáveis e telas principais refeitas sobre esses blocos.

  ## Mudanças Principais

  - Substituir a base visual híbrida Yevox/SnowUI em src/app/globals.css pelos tokens do HTML: --bg, --panel, --text, --border, --primary, status, spacing,
    radius, shadow, motion e layout.

  - Manter compatibilidade com shadcn/Tailwind mapeando os tokens existentes (background, foreground, card, popover, muted, sidebar, etc.) para os tokens SnowUI,
    evitando cores diretas em componentes.

  - Simplificar ThemeSwitcher: manter alternância claro/escuro via data-theme e .dark; remover ou rebaixar os temas Yevox coloridos, já que o SnowUI define uma
    identidade visual própria.

  - Ajustar AppShell, AppSidebar, DashboardViewport e MenuPageHeader para o layout do spec: app full-screen, sidebar 236px/colapsável, topbar 64px, conteúdo
    central com overflow interno e superfícies leves.

  - Atualizar primitivos em src/components/ui: Button, Input, Select, Card, Badge, Dialog, Checkbox, Skeleton, Toast e estados compartilhados para alturas,
    raios, foco, hover, pressed, disabled e sombras do spec.

  - Adicionar primitivos/padrões faltantes, sem criar nova hierarquia pesada:
      - Progress
      - SegmentedControl ou equivalente para filtros
      - Textarea
      - StatCard
      - GoalCard
      - TaskRow/linha de ação genérica
      - FocusCard
      - StreakCard, usado onde fizer sentido no legado life-habits

  - Migrar as telas principais para os padrões SnowUI:
      - /: dashboard “Hoje” com métricas, próxima ação, objetivos e atalhos no estilo do app-frame do HTML.
      - /goals: formulário, filtros segmentados, métricas e cards de meta usando os novos padrões.
      - /inbox: captura rápida, lista processável e filtros com superfícies/inputs do design system.
      - /pomodoro: remover gradientes pesados e alinhar com FocusCard e painéis SnowUI.
      - /notes: biblioteca, busca, categorias e editor usando os novos componentes.

  - Estender a normalização visual para /study/*, /finance/* e /life-habits sem alterar regras de negócio, apenas removendo estilos fora do sistema e usando
    tokens/padrões compartilhados.

  - Atualizar README.md e ARCHIVE.md descrevendo que o SnowUI Design System é a camada visual canônica do app.

  ## Interfaces e Compatibilidade

  - Não mudar endpoints, Prisma schema, tipos de domínio ou contratos dos hooks.
  - Preservar imports públicos dos componentes UI existentes sempre que possível.
  - Quando adicionar componentes novos, colocá-los em src/components/ui para primitivos e em src/components/productivity ou equivalente para padrões de domínio.
  - Não editar src/generated/client.

  ## Testes e Validação

  - Rodar npx tsc --noEmit.
  - Rodar npm run lint.
  - Rodar npm run build.
  - Confirmar que não há scroll duplo: shell ocupa a viewport e apenas a área de conteúdo rola.

  ## Assumptions

  - “Usar ele” significa adotar o HTML SnowUI como fonte visual de verdade para o app inteiro, não apenas para uma página de demonstração.
  - O escopo é visual/UX; dados, autenticação, Prisma e rotas de API ficam preservados.
  - O app continua em PT-BR e com lucide-react como família única de ícones.
  - A implementação pode tocar todos os arquivos necessários, mas deve evitar refatoração de domínio não relacionada.