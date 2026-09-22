# Estudos UX — Objetivo

## Problema

A área de Estudos reúne recomendação, matérias, revisões e sessões em uma única composição. As funções existem, mas competem pela atenção e tornam menos direta a decisão principal: o que estudar agora.

## Objetivo do produto

Organizar `/study` como um workspace full-screen simples, responsivo e orientado a ação, sem remover dados ou regras existentes. A pessoa deve conseguir:

- decidir rapidamente o próximo estudo;
- abrir o Pomodoro já existente como único fluxo de foco;
- acompanhar a meta diária derivada das metas semanais;
- acessar matérias, revisões e histórico sem sair do workspace;
- manter as operações existentes de criação, edição e exclusão.

## Estrutura canônica

O workspace possui quatro abas de largura total:

1. `Hoje`: resumo, recomendação, foco, meta diária e revisões vencidas;
2. `Matérias`: matérias, metas semanais, tópicos e CRUD;
3. `Revisões`: fila, resposta, resultado, reagendamento e CRUD;
4. `Histórico`: sessões, resultados, filtros e CRUD.

## Critérios de UX

- ocupar toda a área oferecida pelo app shell;
- impedir scroll vertical e horizontal da página;
- delegar overflow apenas ao conteúdo interno da aba ativa;
- manter uma ação principal clara por aba;
- reutilizar tokens, componentes e estados do design system;
- evitar cards aninhados e alturas fixas grandes;
- manter o mobile utilizável sem scroll horizontal da página.

## Fora do escopo

- duplicar o timer do Pomodoro;
- alterar schema, migrar ou apagar dados;
- substituir o algoritmo de recomendação ou reagendamento;
- alterar Finanças, Hábitos, Captura, Metas ou Notas;
- executar as etapas 2, 3 ou 4 junto com a Etapa 1.

