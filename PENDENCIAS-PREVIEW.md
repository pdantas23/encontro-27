# Pendências de preview (dados mock / rotas abertas)

A área administrativa está sendo desenhada com proteções e dados reais
temporariamente trocados por mock, só para visualização. **Nada disso pode ir
para produção assim.** Este arquivo é o checklist para reverter tudo antes do
lançamento.

A **área do participante (`/minha-conta`) já está no formato final**: os
bypasses `PREVIEW_FAKE` (`useMeusPedidos`, `useMeusIngressos`,
`TransferenciasRecebidas`) foram removidos e a rota volta a exigir login de
verdade.

## Área administrativa (`/admin`) — mocks e rota aberta

Mesmo tratamento (dados mock + rota aberta) para dar pra visualizar o painel
sem precisar logar como admin. Todos com a mesma constante `PREVIEW_FAKE = true`
e o mesmo comentário de aviso no topo:

- [ ] `src/hooks/useAdminAuth.ts` — pula a checagem de sessão/perfil e libera
      `/admin/**` direto (a proteção real já está pronta, inclusive a regra da
      role `staff`, só está sendo pulada).
- [ ] `src/app/admin/dashboard/page.tsx` — estatísticas e vendas por modalidade falsas.
- [ ] `src/app/admin/pedidos/page.tsx` — 4 pedidos falsos (aprovado, aguardando pagamento, recusado e um com "lote sem vaga"), com os participantes de cada um.
- [ ] `src/app/admin/produtos/page.tsx` — 5 produtos falsos (um com 2 lotes, um esgotado, um oculto e sem lote).
- [ ] `src/app/admin/relatorios/page.tsx` — números falsos.
- [ ] `src/app/admin/equipe/page.tsx` — 4 pessoas falsas (comercial, marketing e 2 staff).
- `src/app/admin/check-in/page.tsx` não tem dados mock (não busca nada ao carregar) — só se beneficia do bypass do `useAdminAuth`.

Nestas páginas, ações que **gravam** no banco (Salvar, Editar, etc.) continuam
chamando a Supabase de verdade — sem sessão real elas vão falhar (mensagem de
erro na tela), o que é esperado: é só a **visualização inicial** que está
mockada, não a escrita.

## Área administrativa — acabamento visual das abas

O painel nasceu com markup simples (h1, table, inline style). O acabamento
está sendo feito aba por aba, com dados mock, no mesmo ritmo da área do
participante.

**Feitas:** Dashboard, Pedidos, Produtos, Equipe, Check-in.

**Faltam ajustar** (ainda no visual "cru" original, só com o layout/fonte
globais do painel aplicados):

- [ ] Relatórios (`/admin/relatorios`)

Abas removidas: Participantes e Configurações. Modalidades e Lotes viraram uma
só, **Produtos** (`/admin/produtos`).

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
- **Menu:** cada aba tem um ícone (lucide) à esquerda; a ordem é Dashboard,
  Pedidos, Produtos, Check-in, Relatórios, Equipe (Equipe sempre por último).
- **Roles:** `comercial` e `marketing` veem tudo; `staff` (equipe de campo) só
  vê o Check-in — o menu mostra só ele e qualquer outra rota leva a staff de
  volta ao check-in. No banco, `is_admin_encontro27()` não inclui `staff`, então
  a RLS também a mantém fora dos dados (migration 0011).
- **Produtos:** uma linha por lote, com produto, lote, preço, vendidos e status
  (sem colunas de período e de link). O lápis abre um modal só do **lote**, em
  uma coluna, um campo por linha, sem exceção. O primeiro campo é um seletor de
  lote (Lote 1, Lote 2...), não o nome: cada lote tem os próprios dados (preço,
  quantidade, início e fim da venda, status, ordem, link da Hypercash) e trocar
  o lote mostra os valores dele. A última opção do seletor é o próximo lote ("Lote
  3 (novo)"): abre em branco, começa "Encerrado" (pra não entrar à venda sozinho
  — o site vende o lote ativo) e só passa a existir ao salvar; é assim que se
  cria lote, e o único jeito de dar o primeiro lote a um produto sem lote.
  Cancelar/Salvar à direita. Os dados do produto (nome, descrição, itens...) são
  fixos e não têm tela de edição. Não existe botão "Novo lote".
- **Campos numéricos:** nada de setas de incremento — são campos de texto que só
  aceitam o que faz sentido (preço com vírgula/ponto e até 2 casas, aceita o
  formato da tabela "3.300,00"; quantidade e ordem só dígitos).
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
- [ ] **Aba Configurações removida:** `event_config_encontro27` (WhatsApp de
      suporte, IDs de GA4/GTM/Pixel/Ads, status das vendas) não tem mais tela —
      só dá pra editar direto no banco, e o site (`SupportLink`, tracking) ainda
      lê essa tabela.
- [ ] **Equipe:** o cadastro deixa escolher a role (staff/comercial/marketing).
      Não há remover pessoa, trocar role nem redefinir senha na tela;
      `scripts/seed-admin.mjs` continua sendo outra forma de criar admin.
- [ ] **API `/equipe`** (`api/src/routes/equipe.ts`) precisa ser publicada
      (push + redeploy no EasyPanel) pra o cadastro da equipe funcionar em
      produção. A conta staff é criada com e-mail já confirmado e senha inicial
      definida por quem cadastra.
- [ ] `ConfirmModal` (confirmação da transferência, área do participante)
      ainda usa fundo colorido (`bg-marrom/40`); só o `Modal` do admin usa
      apenas blur.
- [ ] Interações de `Dropdown`/`Modal` (teclado, clique fora, animações)
      foram validadas só por build/lint/HTML — falta uma passada no navegador.
- [ ] **Check-in:** busca por nome é a tela principal; o ícone de QR abre a
      câmera num modal (`@zxing/browser`, nova dependência em `package.json`).
      Não tem mais busca manual por identificador — a busca por nome cobre
      esse caso. Exige câmera do navegador, que só funciona em conexão segura
      (HTTPS ou `localhost`) — confirmar que o domínio final serve o site em
      HTTPS. Testado com câmera de verdade (Chromium com dispositivo de vídeo
      simulado, lendo um QR real); não testado ainda num celular real.
- [ ] **Check-in avisa (não bloqueia) fora do dia do evento:** migration 0013
      acrescentou `event_config_encontro27.date_fim` (evento de vários dias:
      `date` = primeiro dia, `date_fim` = último). Sem essas datas
      preenchidas — como hoje —, o aviso simplesmente não aparece. Preencher
      quando as datas do evento forem definidas (não tem tela pra isso desde
      que Configurações saiu; só dá pra editar direto no banco).
- [ ] Achei (não apaguei) dois participantes de teste antigos e sem relação
      com esta sessão — `Teste` (`teste@exemplo.com`) e `Teste Clone Limpo`
      (`clone@teste.com`) — direto na tabela `participantes_encontro27` de
      produção. Provavelmente sobraram de um teste manual seu; apagar se não
      forem mais necessários.

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
- [ ] Testar login real de admin ponta a ponta (o do participante já roda de verdade).
- [ ] Fechar as decisões em aberto acima.
- [ ] Apagar este arquivo quando tudo acima estiver revertido.
