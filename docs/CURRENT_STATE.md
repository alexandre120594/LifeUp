# Estado atual

Atualizado em: 2026-10-13

Este documento descreve onde o produto esta agora. Ele nao e um historico de
commits. Mantenha apenas fatos que ajudam o proximo desenvolvedor a continuar.

## Capacidades ativas

- Dashboard autenticado em `/` com resumo de metas e proximas acoes.
- Gestao de metas em `/goals`.
- Captura rapida em `/inbox`.
- Biblioteca de notas em `/notes`.
- Timer e sessoes de foco em `/pomodoro`.
- Tracker independente de habitos em `/life-habits`, com tipos normal,
  abstinencia e quantidade, agendas diaria/semanal/mensal/dias escolhidos/
  intervalo, checklists, dias de descanso, foco e metricas de sequencia e forca.
- Workspace de estudos em `/study`, com materias, topicos, sessoes, revisoes e
  cronograma TRT-PI de 150 dias. As marcacoes e percentuais de acerto do
  cronograma persistem por usuario no PostgreSQL.
- Workspace financeiro em `/finance`, com contas, transacoes, compromissos e
  objetivos de reserva. A aba Compromissos compara a renda do periodo com os
  vencimentos pendentes e explicita valor, percentual, sobra e total futuro.
- Login e logout por cookie de sessao simples.
- Cliente Android nativo em `android/LifeUp-Kotlin` consumindo a API existente.

## Estado tecnico

- Next.js App Router 16, React 19 e TypeScript strict.
- Tailwind CSS 4 e primitivas SnowUI/Radix para interface.
- TanStack Query para estado remoto.
- Prisma 7 com adapter PostgreSQL e client gerado em `src/generated/client`.
- Dev server configurado para `http://localhost:3001`.
- A API filtra registros pessoais pelo usuario autenticado.
- O schema atual nao possui `Project`, `Task` ou a hierarquia legada.

## Pontos de atencao

- A autenticacao atual confia em um identificador de usuario no cookie e ainda
  nao representa uma solucao robusta de identidade/sessao para producao.
- Parte das mensagens internas e dos toasts ainda esta em ingles, apesar de a
  interface ter portugues do Brasil como padrao.
- Algumas strings antigas apresentam problemas de codificacao; evite propagar
  mojibake e use UTF-8 em novos textos.
- A API ainda nao usa um formato uniforme de erro em todos os endpoints.
- Os modelos com campos `String` para status/tipo podem precisar de enums, mas
  isso exige migracao planejada, nao uma troca oportunista.
- Habitos usam registros diarios estruturados em `completions`; `checkins`,
  `badEvents`, `lastBadAt`, `targetDays` e `reward` permanecem legados enquanto o
  cliente Android ainda consome o contrato antigo.
- O editor web persiste configuracao de foco, mas a integracao automatica entre
  uma sessao Pomodoro e a conclusao do habito ainda nao foi implementada.
- Lembretes, anexos/fotos, importacao, exportacao e widgets do Streak nao fazem
  parte desta fatia web; exigem fluxos e infraestrutura proprios.
- Nao ha suite automatizada abrangente registrada no `package.json`; build,
  lint, validacao Prisma e testes manuais sao a verificacao disponivel.
- O diretorio `specs/` pode conter planos historicos removidos ou divergentes;
  o codigo e os documentos canonicos em `docs/` prevalecem.

## Ordem recomendada de evolucao

1. Fortalecer autenticacao e sessao para uso de producao.
2. Uniformizar validacao e respostas de erro da API.
3. Consolidar idioma e corrigir strings com codificacao incorreta.
4. Adicionar testes automatizados aos fluxos de maior risco.
5. Migrar o Android para o contrato estruturado de habitos e depois remover os
   campos legados com uma migracao auditada.
6. Evoluir analytics apenas com eventos historicos confiaveis.

## Trabalho em andamento no worktree

Antes de iniciar qualquer tarefa, execute `git status`. Em 2026-10-03 havia
alteracoes locais em Habitos, Estudos, sidebar, README, package.json e no cliente
Android, alem da remocao de documentos/specs antigos. Considere essas mudancas
trabalho do usuario e nao as reverta sem pedido explicito.

## Como manter este arquivo

- Atualize a data quando alterar seu conteudo.
- Remova itens concluidos; nao acumule diario de desenvolvimento.
- Registre apenas pendencias confirmadas no codigo ou decididas pelo usuario.
- Mantenha a proxima acao especifica o bastante para outro agente executa-la.
