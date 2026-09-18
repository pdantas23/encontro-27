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

## Área administrativa (`/admin`) — mocks e rota aberta

Mesmo tratamento (dados mock + rota aberta) para dar pra visualizar o painel
sem precisar logar como admin. Todos com a mesma constante `PREVIEW_FAKE = true`
e o mesmo comentário de aviso no topo:

- [ ] `src/hooks/useAdminAuth.ts` — pula a checagem de sessão/perfil e libera
      `/admin/**` direto (a proteção real já está pronta, só está sendo pulada).
- [ ] `src/app/admin/dashboard/page.tsx` — estatísticas e vendas por modalidade falsas.
- [ ] `src/app/admin/pedidos/page.tsx` — 4 pedidos falsos (aprovado, aguardando pagamento, recusado e um com "lote sem vaga"), com os participantes de cada um.
- [ ] `src/app/admin/participantes/page.tsx` — 2 participantes falsos.
- [ ] `src/app/admin/ingressos/page.tsx` — as 4 modalidades reais, com dados falsos no resto dos campos.
- [ ] `src/app/admin/lotes/page.tsx` — 1 lote falso por modalidade.
- [ ] `src/app/admin/relatorios/page.tsx` — números falsos.
- [ ] `src/app/admin/configuracoes/page.tsx` — formulário pré-preenchido com dados falsos (não veio do banco).
- `src/app/admin/check-in/page.tsx` não tem dados mock (não busca nada ao carregar) — só se beneficia do bypass do `useAdminAuth`.

Nestas páginas, ações que **gravam** no banco (Salvar, Editar, etc.) continuam
chamando a Supabase de verdade — sem sessão real elas vão falhar (mensagem de
erro na tela), o que é esperado: é só a **visualização inicial** que está
mockada, não a escrita.

## Área administrativa — acabamento visual das abas

O painel nasceu com markup simples (h1, table, inline style). O acabamento
está sendo feito aba por aba, com dados mock, no mesmo ritmo da área do
participante.

**Feitas:** Dashboard, Pedidos.

**Faltam ajustar** (ainda no visual "cru" original, só com o layout/fonte
globais do painel aplicados):

- [ ] Participantes (`/admin/participantes`)
- [ ] Modalidades (`/admin/ingressos`)
- [ ] Lotes (`/admin/lotes`)
- [ ] Check-in (`/admin/check-in`)
- [ ] Relatórios (`/admin/relatorios`)
- [ ] Configurações (`/admin/configuracoes`)

### Decisões já tomadas (aplicar nas abas restantes)

- **Fonte:** fonte do sistema (`system-ui`) em todo o painel, títulos
  inclusive (classe `.admin-shell` em `globals.css`). Nada de Quicksand /
  Oranienbaum no admin.
- **Alinhamento:** textos e títulos à esquerda; só a logo do menu lateral é
  centralizada. Tabelas com cabeçalho e células centralizados e alinhados ao
  meio na vertical. Botões de modal centralizados.
- **Sem rodapé** em nenhuma aba do admin. Menu lateral só com a logo (sem
  texto "O Encontro", sem selo "Admin"/role) e "Sair" só como ícone ao lado
  do e-mail.
- **Componentes próprios** em `src/components/ui/` (usar em vez de
  elementos nativos): `Dropdown` (no lugar de `<select>`), `Modal` (fundo só
  com blur, sem scroll interno, aceita `tituloExtra` e `rodape`),
  `WhatsAppIcon`.
- **Padrão de lista** (ver Pedidos): busca + filtro lado a lado ocupando a
  largura da tabela; busca só nos dados do nosso sistema e com placeholder
  curto ("Buscar"); ação da linha é um ícone sem texto que abre um modal
  (a linha não expande); status como selo colorido com nome legível.
- **Armadilha de CSS:** `.admin-content th/td/a/h1/h2` (em `globals.css`) têm
  especificidade maior que uma utility do Tailwind — alinhamento, sublinhado
  etc. dessas tags precisam de `style` inline (ou de ajuste na regra global).

### Decisões em aberto

- [ ] **Aprovar/recusar pedido manualmente:** os botões saíram do modal de
      Pedidos. O `README.md` ainda diz que eventos do webhook da Hypercash
      `nao_correlacionado`/`ambiguo` ficam "para aprovação manual em
      `/admin/pedidos`" — hoje isso só dá pra fazer direto no banco. Decidir:
      voltar com "Confirmar pagamento" só para pedidos aguardando pagamento,
      ou atualizar o README.
- [ ] **"Lote sem vaga"** virou um status exclusivo (ocupa o lugar do
      selo de pagamento). O filtro de status de Pedidos continua por status
      de pagamento e não tem opção "Lote sem vaga". Decidir se vira opção.
- [ ] **Busca por dados da Hypercash** (ex.: id da transação) ficou de fora
      da busca de Pedidos ("pode ser uma opção").
- [ ] `ConfirmModal` (confirmação da transferência, área do participante)
      ainda usa fundo colorido (`bg-marrom/40`); só o `Modal` do admin usa
      apenas blur.
- [ ] Interações de `Dropdown`/`Modal` (teclado, clique fora, animações)
      foram validadas só por build/lint/HTML — falta uma passada no navegador.

## Cadastro de participante sem confirmação de e-mail

O `signUp` público do Supabase responde `500 Error sending confirmation email`:
o servidor de autenticação (compartilhado com outros projetos) exige confirmação,
mas o SMTP dele é o de teste (`supabase-mail`, remetente `fake_sender`) e não
entrega nada. Por decisão do dono do projeto, o cadastro passa pela nossa API
(`POST /cadastro`, `api/src/routes/cadastro.ts`), que cria a conta com o e-mail
já marcado como confirmado, e o navegador faz o login em seguida.

- [ ] **Risco aceito:** sem confirmação, quem cadastra o e-mail de outra pessoa
      passa a ver os ingressos/QR codes dela e a receber transferências
      destinadas a ela (tudo é ligado ao e-mail da sessão).
- [ ] Quando houver SMTP real no servidor de autenticação: voltar ao `signUp`
      do Supabase com confirmação por e-mail e remover a rota `/cadastro`.
- [ ] A rota tem limite de 10 cadastros por IP a cada 15 min, só em memória
      (zera quando a API reinicia).

## Antes de lançar

- [ ] Confirmar que nenhum `PREVIEW_FAKE` (ou equivalente) restou no código.
- [ ] Testar login real de participante e de admin ponta a ponta.
- [ ] Fechar as decisões em aberto acima.
- [ ] Apagar este arquivo quando tudo acima estiver revertido.
