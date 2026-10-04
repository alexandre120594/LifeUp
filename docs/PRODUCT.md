# Produto LifeUp

## Visao

LifeUp e um gerenciador geral de vida pessoal. Ele deve ajudar uma pessoa a
decidir o que importa, executar o proximo passo, registrar o que aconteceu e
entender sua evolucao sem precisar espalhar essas informacoes por varios apps.

O produto combina areas diferentes em uma unica experiencia, mas cada modulo
preserva sua propria linguagem e seus dados. Integracao deve nascer de um caso
de uso real, nunca apenas da possibilidade tecnica de relacionar tabelas.

## Promessa central

Em poucos minutos por dia, o usuario consegue:

- enxergar prioridades e prazos;
- acompanhar metas e habitos;
- organizar estudos e sessoes de foco;
- registrar e compreender sua vida financeira;
- capturar ideias antes de perde-las;
- transformar informacao solta em notas uteis;
- revisar progresso sem alimentar um sistema burocratico.

## Principios de produto

1. **Clareza antes de quantidade**: mostrar a proxima decisao util antes de
   oferecer mais configuracoes.
2. **Baixo atrito**: capturar e atualizar informacoes deve exigir poucos passos.
3. **Dados pertencem ao usuario**: todo registro pessoal tem dono e isolamento
   no servidor.
4. **Modulos coerentes, nao artificialmente acoplados**: compartilhar shell,
   componentes e linguagem visual nao significa compartilhar todas as entidades.
5. **Progresso explicavel**: metricas devem ser derivadas de dados identificaveis
   e ter significado claro.
6. **Uso diario primeiro**: a tela Hoje e os fluxos recorrentes tem prioridade
   sobre relatorios sofisticados.
7. **Evolucao incremental**: uma funcionalidade so entra quando seu problema,
   fluxo e criterio de sucesso estiverem claros.

## Areas do produto

### Hoje

Visao operacional do dia. Resume prioridades e oferece atalhos para agir. Nao e
um novo dominio de persistencia: compoe dados dos modulos existentes.

### Metas

Direcao de medio e longo prazo nas areas Corpo, Mente e Casa. `Goal` possui
status, progresso e prazo opcional. No modelo atual, nao possui tarefas,
checklists ou subregistros.

### Habitos

Acompanhamento diario de comportamentos a construir ou evitar, com check-ins,
recaidas, sequencias, marcos e recompensas. E independente de metas.

### Estudos e foco

Organizacao de materias, topicos, sessoes e revisoes. Pomodoro registra sessoes
de foco e pode se associar a materia/topico de estudo quando aplicavel.

### Financas

Contas, categorias, transacoes, compromissos e objetivos de reserva. Saldos e
progresso sao derivados dos registros financeiros, nao armazenados em paralelo.

### Inbox e notas

Inbox e a entrada rapida para conteudo ainda nao processado. Notes e o espaco de
conhecimento organizado. Uma captura pode apontar para uma nota, mas ambos nao
dependem de Goal.

## Fora do escopo por padrao

Os itens abaixo nao devem ser presumidos por uma IA:

- rede social, gamificacao competitiva ou ranking;
- equipes, organizacoes ou colaboracao multiusuario;
- hierarquia generica que conecte todos os modulos;
- recriacao de Project, Task ou da cadeia antiga de produtividade;
- automacoes, inteligencia artificial no produto ou notificacoes externas sem
  uma especificacao aprovada;
- novos campos e relacoes apenas para um uso futuro hipotetico.

Isso nao significa que nunca poderao existir. Significa que exigem uma decisao
de produto explicita e documentada antes da implementacao.

## Linguagem

- Nome do produto: `LifeUp`.
- Idioma da interface: portugues do Brasil.
- `Goal` na implementacao corresponde a **Meta** na interface.
- `LifeHabit` corresponde a **Habito**.
- Termos tecnicos do codigo podem permanecer em ingles para seguir o ecossistema.
- Evite alternar nomes para o mesmo conceito dentro de um fluxo.

## Criterio para novas funcionalidades

Antes de adicionar uma funcionalidade, responda:

1. Qual problema recorrente do usuario ela resolve?
2. A qual modulo ela pertence?
3. Quais dados existentes ela reutiliza?
4. Qual e o menor fluxo completo que entrega valor?
5. Como o usuario percebe sucesso?
6. Ela exige uma decisao arquitetural ou nova entidade?

Sem respostas concretas, a funcionalidade ainda e uma ideia, nao uma tarefa de
implementacao.
