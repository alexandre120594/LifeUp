# Notes

## Estado atual

Rota atual:

```text
/notes
```

Arquivos:

- `src/app/notes/page.tsx`
- `src/hooks/useNoteMutations.ts`
- `src/services/NotesServices.ts`
- `src/app/api/notes/*`

Funcionalidades:

- criar nota;
- buscar notas por texto;
- listar categorias derivadas;
- editar nota inline;
- deletar nota.

## Problemas encontrados

- Criar nota falha silenciosamente quando titulo ou conteudo esta vazio.
- Cada nota exibe editor completo inline, aumentando densidade.
- Delete nao pede confirmacao.
- `textarea` manual nao usa primitive compartilhada.
- Categorias aparecem como badges, mas nao funcionam como filtro direto na tela auditada.
- Labels estao em ingles.

## Objetivo UX

Criar uma biblioteca de notas escaneavel, com criacao e edicao claras, sem confundir lista com editor.

## Arquitetura da informacao

Secoes futuras:

- busca;
- filtros/categorias;
- lista de notas;
- detalhe/edicao;
- criacao.

## Componentes envolvidos

- `DashboardViewport`
- `MenuPageHeader`
- `Card`
- `Input`
- `Button`
- `Badge`
- `NoteEditor`
- futuro `Textarea`
- futuro `EditorPanel`
- futuro `ConfirmDialog`
- futuro `EmptyState`

## Heuristicas relacionadas

- H1: feedback de salvar/editar/deletar.
- H5: prevencao de erro em campos obrigatorios.
- H6: busca/categorias reconheciveis.
- H8: reduzir densidade visual.
- H9: recuperacao de erros.

## Estados necessarios

- carregando notas;
- biblioteca vazia;
- busca sem resultados;
- criando;
- editando;
- salvando;
- deletando;
- erro por campo;
- erro ao carregar.

## Responsividade

- Mobile deve evitar multiplos editores abertos na lista.
- Desktop pode usar lista + painel de detalhe.
- Busca deve permanecer proxima da lista.

## Acessibilidade

- Labels persistentes.
- Textarea com nome acessivel.
- Estado de busca sem resultados anunciado por texto.
- Delete com confirmacao/undo.
- Categorias com semantica clara se forem interativas.

## Criterios de aceite

- Criacao invalida mostra mensagens por campo.
- Lista de notas e escaneavel.
- Edicao tem modo claro de entrada/saida.
- Busca mostra resultados, vazio e erro adequadamente.
- Categorias tem comportamento definido.

## Pendencias para detalhamento

- Decidir se categorias viram filtros clicaveis.
- Definir layout lista/detalhe.
- Decidir comportamento de autosave ou save manual.
