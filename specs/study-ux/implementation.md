# Estudos UX — Plano de implementação

## Etapa 1 — concluída

- [x] Auditar schema, workspace, hooks, serviços, regras e integração com Foco.
- [x] Registrar objetivo e arquitetura antes da mudança de UI.
- [x] Criar as abas `Hoje`, `Matérias`, `Revisões` e `Histórico` em largura total.
- [x] Garantir viewport full-screen com scroll apenas no conteúdo interno.
- [x] Criar resumo diário compacto: tempo, revisões vencidas, acertos disponíveis e meta diária.
- [x] Manter a recomendação explicável como próxima matéria.
- [x] Integrar `Iniciar foco` à rota `/pomodoro`, sem duplicar timer.
- [x] Exibir e operar revisões vencidas em Hoje.
- [x] Preservar acesso aos CRUDs atuais nas três abas restantes.

## Etapa 2 — concluída

- [x] Refinar a lista de Matérias, metas, progresso e tópicos vinculados.
- [x] Melhorar criação, edição e exclusão sem trocar os contratos atuais.

## Etapa 3 — concluída

- [x] Exibir uma revisão por vez.
- [x] Refinar revelar resposta, registrar resultado, reagendar, editar e apagar.
- [x] Preservar integralmente as regras atuais de reagendamento.

## Etapa 4 — concluída

- [x] Refinar sessões, tempo por matéria, questões e acertos.
- [x] Adicionar filtros por mês e ano.
- [x] Finalizar revisão responsiva e de UX.

## Validação da Etapa 1

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Validação das Etapas 2 a 4

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
