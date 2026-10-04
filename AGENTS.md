# AGENTS.md

Este arquivo e o contrato principal para qualquer agente de IA que trabalhe no
LifeUp. Seu escopo e todo o repositorio.

## Regra central

Antes de alterar codigo, reconstrua o contexto a partir das fontes canonicas.
Nao invente dominios, entidades, camadas, dependencias, rotas ou convencoes.
Primeiro procure o padrao existente; se ele nao existir, documente a decisao
antes de introduzir um novo padrao estrutural.

## Ordem obrigatoria de leitura

1. `AGENTS.md` - contrato de trabalho e limites para agentes.
2. `docs/PRODUCT.md` - visao, escopo e linguagem do produto.
3. `docs/ARCHITECTURE.md` - fronteiras e fluxo tecnico permitido.
4. `docs/CURRENT_STATE.md` - estado atual, dividas e proximos passos.
5. `docs/AI_DEVELOPMENT.md` - processo de implementacao e validacao.
6. `prisma/schema.prisma` - unica fonte de verdade para dados persistidos.
7. Os arquivos da funcionalidade que sera alterada.

Leia `docs/DECISIONS.md` quando a tarefa puder mudar uma decisao estrutural.
O `README.md` e a porta de entrada para humanos, mas nao substitui as fontes
acima.

## O produto em uma frase

LifeUp e um gerenciador pessoal de vida que reune planejamento diario, metas,
habitos, estudos, financas, foco, capturas e conhecimento em uma experiencia
coerente, sem forcar acoplamento artificial entre esses modulos.

## Arquitetura obrigatoria

Fluxo padrao de dados no cliente:

```text
Page/Component -> React Query hook -> Service -> /api route -> Prisma -> PostgreSQL
```

Responsabilidades:

- `src/app`: paginas, layouts e route handlers do App Router.
- `src/components`: componentes visuais e composicoes reutilizaveis.
- `src/components/ui`: primitivas visuais; estenda antes de duplicar.
- `src/hooks`: estado remoto, mutations e invalidacao via React Query.
- `src/services`: cliente HTTP tipado; componentes nao fazem CRUD direto.
- `src/lib`: regras puras, validacao, autenticacao e infraestrutura compartilhada.
- `src/types`: contratos TypeScript compartilhados entre camadas do cliente.
- `prisma/schema.prisma`: modelos, relacoes, indices e regras de exclusao.
- `src/generated/client`: codigo gerado; nunca editar manualmente.

Excecoes ao fluxo precisam de uma justificativa registrada em
`docs/DECISIONS.md`.

## Invariantes do repositorio

- Todo dado pessoal deve ser filtrado pelo `userId` autenticado no servidor.
- Nunca aceite `userId` enviado pelo cliente como autoridade.
- Route handlers protegidos usam `requireCurrentUserId()`.
- Alteracoes de schema acontecem apenas em `prisma/schema.prisma` e devem manter
  integridade referencial explicita.
- Paginas e componentes nao importam Prisma nem acessam o banco.
- CRUD do cliente passa por `src/services` e por hooks de React Query.
- Regras derivadas reutilizaveis ficam em `src/lib`, nao enterradas em JSX.
- Use os tokens e primitivas existentes de SnowUI em vez de criar estilos
  paralelos.
- Interfaces visiveis ao usuario sao escritas em portugues do Brasil.
- TypeScript permanece estrito; nao introduza `any`.
- Nao adicione dependencia quando o stack atual resolver o problema.
- Nao recrie a antiga hierarquia `Project -> Habit -> Task`; ela foi removida.
- Goal nao possui subitens, tarefas ou checklists sem uma nova decisao de produto.
- Inbox, Notes, Pomodoro e Life Habits continuam independentes de Goal.

## Antes de criar qualquer coisa

Pesquise nesta ordem:

1. componente ou helper equivalente;
2. padrao do mesmo dominio;
3. padrao de outro dominio que possa ser reutilizado;
4. decisao registrada em `docs/DECISIONS.md`;
5. somente entao, a menor abstracao nova necessaria.

Uma nova entidade, camada, dependencia, sistema de estado global ou relacao
entre dominios exige necessidade concreta. Se mudar a arquitetura, registre a
decisao e atualize `docs/ARCHITECTURE.md` no mesmo trabalho.

## Regras de alteracao

- Mantenha mudancas focadas, pequenas e reversiveis.
- Corrija a causa raiz sem refatorar areas nao relacionadas.
- Preserve mudancas existentes do usuario no worktree.
- Remova imports e estado mortos apenas nos arquivos tocados.
- Mantenha filtros de API, parametros de servico e query keys alinhados.
- Em mutations, invalide todas as queries afetadas.
- Trate loading, vazio, erro e confirmacao em fluxos interativos.
- Mudanca de comportamento requer atualizacao da documentacao correspondente.
- Nao trate planos antigos em `specs/` como estado atual; valide no codigo.

## Validacao minima

Escolha validacoes proporcionais ao risco:

```bash
npm run lint
npm run build
npx prisma validate
npx prisma generate
npm run db:seed
```

- Mudanca TypeScript/UI: lint focado quando possivel e build.
- Mudanca de schema/consulta: `prisma validate` e validacao do fluxo afetado.
- Mudanca ampla: lint, build e testes manuais do caminho principal.
- Se a base ja tiver erros, nao aumente o baseline e registre os erros preexistentes.

## Manutencao da memoria do projeto

Ao terminar uma mudanca relevante:

- atualize `docs/CURRENT_STATE.md` com o que mudou e o que ficou pendente;
- atualize `README.md` quando capacidades ou comandos mudarem;
- atualize `docs/PRODUCT.md` quando escopo ou linguagem de produto mudarem;
- atualize `docs/ARCHITECTURE.md` e `docs/DECISIONS.md` quando houver decisao
  estrutural;
- deixe uma proxima acao concreta, sem historico narrativo desnecessario.

## Criterio de conclusao

Uma tarefa so esta concluida quando codigo, tipos, persistencia, estados de UI,
validacao e documentacao afetada contam a mesma historia. Se algo ficar
incompleto, registre claramente em `docs/CURRENT_STATE.md`.
