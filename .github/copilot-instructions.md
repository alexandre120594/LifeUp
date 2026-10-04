# LifeUp - instrucoes para GitHub Copilot

Siga o contrato completo em `AGENTS.md` e leia `docs/PRODUCT.md`,
`docs/ARCHITECTURE.md`, `docs/CURRENT_STATE.md`, `docs/AI_DEVELOPMENT.md` e
`docs/DECISIONS.md` antes de propor mudancas estruturais.

- Nao invente dominios, entidades, camadas, dependencias ou convencoes.
- Preserve o fluxo Component -> Hook -> Service -> API -> Prisma.
- Todo dado pessoal e filtrado pelo usuario autenticado no servidor.
- Nunca edite `src/generated/client`.
- Reuse SnowUI e as primitivas existentes.
- Preserve mudancas locais e atualize a documentacao afetada.
