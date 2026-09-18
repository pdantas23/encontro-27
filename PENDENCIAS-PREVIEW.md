# Pendências de preview (dados mock / rotas abertas)

Enquanto a área do participante e a área administrativa estavam sendo
desenhadas, algumas proteções e dados reais foram temporariamente trocados
por mock, só para visualização. **Nada disso pode ir para produção assim.**
Este arquivo é o checklist para reverter tudo antes do lançamento.

## Área do participante (`/minha-conta`)

Bypass ativo via uma constante `PREVIEW_FAKE = true` em três arquivos,
todos com o mesmo comentário de aviso no topo:

- [ ] `src/hooks/useMeusPedidos.ts` — pula a checagem de sessão e retorna um
      pedido falso. Reverter para `PREVIEW_FAKE = false` restaura o redirect
      para `/login` quando não há sessão (a lógica real já está pronta, só
      está sendo pulada).
- [ ] `src/hooks/useMeusIngressos.ts` — mesmo padrão, ingresso falso.
- [ ] `src/components/conta/TransferenciasRecebidas.tsx` — mesmo padrão,
      convite de transferência falso.

Depois de reverter os três: `/minha-conta/**` volta a exigir login de
verdade (a proteção já existe no código, só estava desativada).

## Área administrativa (`/admin`)

Em andamento nesta sessão: mesmo tratamento (dados mock + rota aberta) para
dar pra visualizar o painel sem precisar logar como admin.

- [ ] Reverter o bypass em `src/hooks/useAdminAuth.ts`.
- [ ] Reverter os dados mock inseridos em cada página de `/admin/**` (a
      lista exata fica registrada aqui conforme forem sendo implementadas).

## Antes de lançar

- [ ] Confirmar que nenhum `PREVIEW_FAKE` (ou equivalente) restou no código.
- [ ] Testar login real de participante e de admin ponta a ponta.
- [ ] Apagar este arquivo quando tudo acima estiver revertido.
