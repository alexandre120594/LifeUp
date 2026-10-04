# Desenvolvimento com IA

## Finalidade

Este guia torna o trabalho de agentes previsivel, auditavel e facil de retomar.
Ele complementa `AGENTS.md`; em caso de conflito, `AGENTS.md` vence.

## Protocolo obrigatorio

### 1. Descobrir

- Leia as fontes canonicas indicadas em `AGENTS.md`.
- Verifique `git status` antes de editar e preserve o trabalho do usuario.
- Localize o fluxo completo da funcionalidade, da pagina ate o schema.
- Pesquise implementacoes equivalentes com `rg` antes de criar arquivo novo.
- Diferencie estado implementado de planos antigos ou comentarios.

### 2. Delimitar

- Escreva mentalmente o resultado observavel pedido pelo usuario.
- Identifique arquivos que realmente precisam mudar.
- Liste invariantes de auth, dados, cache e UI que a mudanca toca.
- Se faltar uma decisao que altere produto ou arquitetura, pare e pergunte.
- Para detalhes reversiveis, escolha a opcao mais simples coerente com o codigo.

### 3. Implementar

- Faca a menor mudanca completa, vertical e funcional.
- Reuse contratos, componentes e helpers existentes.
- Mantenha tipos alinhados entre API, service, hook e UI.
- Nao misture refatoracao cosmetica sem relacao com o objetivo.
- Nao edite arquivos gerados.

### 4. Verificar

- Revise o diff e procure alteracoes acidentais.
- Rode validacoes focadas e depois validacoes amplas proporcionais ao risco.
- Teste ao menos sucesso, vazio/ausencia e erro do fluxo alterado.
- Em API protegida, teste sem sessao e com recurso de outro usuario quando
  aplicavel.
- Confirme layout em viewport estreito quando houver mudanca visual.

### 5. Registrar

- Atualize a documentacao na mesma mudanca.
- Em `docs/CURRENT_STATE.md`, mantenha fatos atuais e pendencias concretas.
- Nao transforme documentos canonicos em diario de sessoes.
- Na entrega, informe resultado, validacoes e qualquer risco restante.

## Regra anti-invencao

Um agente nao deve criar algo apenas porque seria uma "boa pratica" generica.
Antes de introduzir qualquer elemento, precisa apontar pelo menos uma destas
evidencias:

- requisito explicito do usuario;
- necessidade demonstrada pelo fluxo atual;
- padrao ja usado no repositorio;
- decisao registrada em `docs/DECISIONS.md`.

Sem evidencia, nao crie:

- novas tabelas ou relacoes;
- novos stores globais;
- repositories, use cases, controllers ou outras camadas paralelas;
- design system alternativo;
- endpoints duplicados;
- dependencias;
- abstracoes para um unico uso hipotetico;
- integracoes automaticas entre modulos independentes.

## Fonte de verdade por assunto

| Assunto | Fonte primaria |
| --- | --- |
| Visao e escopo | `docs/PRODUCT.md` |
| Regras para agentes | `AGENTS.md` |
| Fronteiras tecnicas | `docs/ARCHITECTURE.md` |
| Dados persistidos | `prisma/schema.prisma` |
| Estado e pendencias | `docs/CURRENT_STATE.md` |
| Decisoes estruturais | `docs/DECISIONS.md` |
| Dependencias/comandos | `package.json` |
| Comportamento real | codigo executavel |

Se documentacao e codigo divergirem, nao escolha silenciosamente. Confirme o
comportamento real, corrija o documento obsoleto e registre a divergencia quando
ela afetar a tarefa.

## Matriz de atualizacao

| Mudanca | Documentos obrigatorios |
| --- | --- |
| Nova capacidade visivel | `README.md`, `docs/CURRENT_STATE.md` |
| Mudanca de escopo/conceito | `docs/PRODUCT.md`, `README.md` |
| Nova entidade ou relacao | `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, estado atual |
| Nova camada/dependencia estrutural | arquitetura, decisoes, README se operacional |
| Comando ou setup | `README.md` |
| Divida ou trabalho interrompido | `docs/CURRENT_STATE.md` |
| Apenas correcao interna | estado atual somente se houver impacto relevante |

## Definition of Done

- O requisito observavel foi atendido.
- Nenhuma mudanca do usuario foi sobrescrita.
- Auth e isolamento por usuario permanecem corretos.
- Tipos e contratos estao alinhados ponta a ponta.
- Loading, vazio, erro e sucesso foram considerados.
- Queries afetadas sao atualizadas ou invalidadas.
- Validacoes apropriadas foram executadas.
- O diff nao contem arquivos gerados ou mudancas fora de escopo.
- Documentos canonicos continuam verdadeiros.
- Pendencias restantes estao explicitas.

## Modelo de entrega para outro agente

```md
Objetivo:
Estado atual:
Arquivos alterados:
Validacoes executadas:
Decisoes tomadas:
Pendente / proxima acao:
```

Use esse modelo somente quando houver trabalho incompleto ou transferencia real;
nao gere relatorios burocraticos para mudancas triviais.
