# Accessibility

## Estado atual

Pontos positivos:

- `html lang="pt-BR"` definido.
- Radix usado para Dialog, Select, Sidebar/Sheet e outros primitives.
- Botoes icon-only em Goals possuem `aria-label`.
- Toast tem botao de dismiss com `aria-label`.
- Foco visivel existe em primitives shadcn.

## Problemas encontrados

- Interface majoritariamente em ingles com `lang=pt-BR`.
- Inputs usam placeholder como rotulo em Goals, Inbox, Notes e Login.
- Textareas manuais sem label persistente.
- Selects nativos e Radix coexistem.
- Delete sem confirmacao em algumas telas.
- `window.confirm` em Focus nao segue o sistema visual/acessivel.
- Estados de erro por campo sao incompletos.
- Cor comunica status/progresso em alguns pontos e precisa sempre de texto complementar.

## Objetivo UX

Garantir que o redesign seja navegavel por teclado, compreensivel por leitores de tela, legivel em light/dark e consistente em PT-BR.

## Arquitetura da informacao

Acessibilidade deve fazer parte da IA:

- rotulos claros;
- heading hierarchy;
- landmarks;
- foco previsivel;
- mensagens de erro proximas da causa;
- navegacao reconhecivel.

## Componentes envolvidos

- `AppShell`
- `AppSidebar`
- `MenuPageHeader` / futuro `PageHeader`
- `Button`
- `Input`
- futuro `Textarea`
- `Select`
- `Dialog`
- `Toast`
- `Badge`
- estados globais

## Heuristicas relacionadas

- H2: correspondencia com mundo real.
- H4: consistencia.
- H5: prevencao de erros.
- H6: reconhecimento.
- H9: recuperacao de erros.
- H10: ajuda/documentacao.

## Estados necessarios

- foco;
- hover;
- active;
- disabled;
- invalid;
- selected;
- expanded/collapsed;
- busy/loading;
- success/error;
- destructive confirmation.

## Responsividade

- Alvos de toque confortaveis.
- Sidebar acessivel no mobile.
- Dialogs com scroll interno quando necessario.
- Textos nao devem truncar informacao essencial.

## Acessibilidade

Checklist para implementacao futura:

- labels persistentes para campos;
- `aria-describedby` para helper/error text;
- `aria-current` em nav ativa;
- headings em ordem;
- contraste minimo validado em light/dark;
- foco visivel consistente;
- dialog com foco inicial e retorno;
- toasts com semantica correta;
- status sem depender apenas de cor;
- idioma do texto alinhado com `lang`.

## Criterios de aceite

- Fluxos principais podem ser usados por teclado.
- Form errors sao lidos por tecnologia assistiva.
- Nav ativa e anunciada.
- Light/dark mantem contraste.
- Textos do produto seguem idioma definido.

## Pendencias para detalhamento

- Rodar auditoria com ferramenta automatizada apos implementacao visual.
- Definir padrao de copy PT-BR.
- Definir matriz de contraste para tokens SnowUI.
