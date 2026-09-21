# App Shell

## Estado atual

O App Shell existe em `src/components/app-shell.tsx` e envolve todas as rotas exceto `/login`.

Componentes envolvidos:

- `AppShell`
- `AppSidebar`
- `SidebarProvider`
- `SidebarTrigger`
- `ThemeSwitcher`
- `Button`

## Problemas encontrados

- Topbar mostra apenas `Life Dashboard` ou `Study Dashboard`, mesmo em outras paginas.
- Logout aparece como texto em ingles e sempre com destaque similar a controles de pagina.
- Sidebar mistura dominios primarios e ferramentas especializadas.
- Badges de sidebar possuem significados inconsistentes.
- Acoes de tema e conta nao estao organizadas como area de sistema.

## Objetivo UX

Criar uma estrutura global previsivel, responsiva e centrada em Goals, onde o usuario reconhece:

- pagina atual;
- grupo de navegacao;
- acao principal;
- estado ativo;
- caminho de retorno.

## Arquitetura da informacao

Proposta inicial:

- Primario: Hoje, Metas, Captura, Foco, Notas.
- Secundario: Estudos, Financas.
- Sistema: Tema, Conta/Sair.

## Componentes envolvidos

- `AppShell`
- `AppSidebar`
- `DashboardViewport`
- `MenuPageHeader`
- `ThemeSwitcher`
- futuros `PageHeader`, `NavItem`, `NavGroup`, `Breadcrumb`, `UserMenu`

## Heuristicas relacionadas

- H1: Visibilidade do estado do sistema.
- H4: Consistencia e padroes.
- H6: Reconhecimento em vez de memorizacao.
- H8: Estetica e design minimalista.

## Estados necessarios

- rota ativa;
- grupo expandido/colapsado;
- desktop sidebar;
- mobile sheet/sidebar;
- usuario autenticado;
- logout em progresso;
- tema light/dark;
- badges com semantica definida.

## Responsividade

- Sidebar desktop deve preservar area util.
- Mobile deve usar trigger acessivel e navegacao de facil fechamento.
- Topbar nao deve truncar informacao critica.
- Conteudo deve manter scroll interno controlado.

## Acessibilidade

- Nav com landmarks apropriados.
- Estados ativos com `aria-current="page"` quando aplicavel.
- Botao de sidebar com label claro.
- Tema com labels PT-BR.
- Logout como acao identificavel e nao ambigua.

## Criterios de aceite

- O usuario identifica a pagina atual pelo topbar/page header.
- Navegacao principal reflete o dominio Goal.
- Itens secundarios nao competem visualmente com o fluxo principal.
- Todos os itens de navegacao possuem rotulos consistentes.
- Estado ativo e perceptivel por texto, cor e semantica.

## Pendencias para detalhamento

- Confirmar se Study e Finance seguem no menu global.
- Definir se Configuracoes sera uma rota real.
- Definir padrao final do ThemeSwitcher no SnowUI.
