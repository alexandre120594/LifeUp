# Focus

## Estado atual

Rota atual:

```text
/pomodoro
```

Arquivos:

- `src/app/pomodoro/page.tsx`
- `src/components/pomodoro-panel.tsx`
- `src/hooks/usePomodoroMutations.ts`
- `src/services/PomodoroServices.ts`
- `src/app/api/pomodoro/*`

Funcionalidades:

- timer foco/pausa;
- persistencia em localStorage;
- setup dialog;
- criacao de Study Subject dentro do fluxo;
- salvar sessao;
- historico paginado;
- editar sessao;
- deletar sessao;
- metricas por subject.

## Problemas encontrados

- Rotulo de produto alterna entre Pomodoro, Study focus, Focus Timer.
- Dependencia de Study Subject pode confundir se a feature for apresentada como foco geral.
- Delete usa `window.confirm`, diferente do resto do app.
- Estado de pre-requisito sem subject poderia ser mais explicito antes do start.
- Tela tem hero visual mais expressivo que outras telas, reduzindo consistencia.

## Objetivo UX

Oferecer uma experiencia de foco clara, confiavel e leve, mantendo a integracao atual com Study Subject sem reintroduzir Tasks.

## Arquitetura da informacao

Secoes atuais/futuras:

- timer principal;
- configuracao da sessao;
- subject;
- metricas de foco;
- historico;
- horas por assunto.

## Componentes envolvidos

- `PomodoroPanel`
- `DashboardViewport`
- `Dialog`
- `Select`
- `Input`
- `Button`
- futuros `ConfirmDialog`, `MetricCard`, `EmptyState`

## Heuristicas relacionadas

- H1: timer e persistencia visiveis.
- H3: pausar, resetar, salvar e excluir com controle.
- H4: confirmacoes consistentes.
- H7: eficiencia para uso repetido.

## Estados necessarios

- sem subjects;
- timer parado;
- timer rodando;
- pausa;
- salvando sessao;
- salvamento automatico ao fim do ciclo;
- erro ao salvar;
- historico vazio;
- confirmacao de delete.

## Responsividade

- Timer deve continuar sendo o foco visual em mobile.
- Historico e graficos devem empilhar abaixo do timer.
- Controles principais devem manter toque confortavel.

## Acessibilidade

- Timer deve ter texto legivel e atualizacao compreensivel.
- Botoes devem ter labels claros.
- Dialogs devem preservar foco.
- Confirmacao de delete deve substituir `window.confirm`.
- Nao depender apenas de cor para fase foco/pausa.

## Criterios de aceite

- Usuario entende pre-requisitos para iniciar.
- Timer comunica fase, progresso e ciclo.
- Sessao salva mostra feedback claro.
- Exclusao segue dialog padrao.
- Historico vazio orienta a primeira sessao.

## Pendencias para detalhamento

- Decidir nome final: Foco, Pomodoro ou Timer de foco.
- Decidir se Foco continua ligado a Study Subject ou vira independente.
- Definir se metricas de foco aparecem no Dashboard Hoje.
