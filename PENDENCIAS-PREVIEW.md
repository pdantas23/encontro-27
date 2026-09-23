# Pendências (O Encontro 2027)

A área do participante (`/minha-conta`) e a área administrativa (`/admin`) já
estão na versão real: nenhum `PREVIEW_FAKE` (dado mock, rota aberta) resta no
código — toda tela exige login de verdade e lê a Supabase de verdade.

## Acabamento visual das abas do admin

**Feitas:** Dashboard, Pedidos, Produtos, Equipe, Check-in, Relatórios
(Relatórios ficou no visual "cru" original — `h1`/`table`/`style` inline —
por decisão do dono do projeto; não precisa de restyling).

Abas removidas: Participantes e Configurações. Modalidades e Lotes viraram uma
só, **Produtos** (`/admin/produtos`).

### Convenções estabelecidas (aplicar em qualquer tela nova do admin)

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
  No mobile, o hambúrguer fica à esquerda e abre uma barra lateral animada
  (framer-motion), não um dropdown.
- **Roles:** `comercial` e `marketing` veem tudo; `staff` (equipe de campo) só
  vê o Check-in — o menu mostra só ele e qualquer outra rota leva staff de
  volta ao check-in. No banco, `is_admin_encontro27()` não inclui `staff`,
  então a RLS também a mantém fora dos dados (migration 0011).
- **Produtos:** uma linha por lote, com produto, lote, preço, vendidos e
  status (sem colunas de período e de link). O lápis abre um modal só do
  **lote**, em uma coluna, um campo por linha, sem exceção. O primeiro campo é
  um seletor de lote (Lote 1, Lote 2...), não o nome: cada lote tem os
  próprios dados (preço, quantidade, início e fim da venda, status, ordem,
  link da Hypercash) e trocar o lote mostra os valores dele. A última opção do
  seletor é o próximo lote ("Lote 3 (novo)"): abre em branco, começa
  "Encerrado" (pra não entrar à venda sozinho — o site vende o lote ativo) e
  só passa a existir ao salvar; é assim que se cria lote, e o único jeito de
  dar o primeiro lote a um produto sem lote. Cancelar/Salvar à direita. Os
  dados do produto (nome, descrição, itens...) são fixos e não têm tela de
  edição. Não existe botão "Novo lote".
- **Campos numéricos:** nada de setas de incremento — são campos de texto que
  só aceitam o que faz sentido (preço com vírgula/ponto e até 2 casas, aceita
  o formato da tabela "3.300,00"; quantidade e ordem só dígitos).
- **Componentes próprios** em `src/components/ui/` (usar em vez de elementos
  nativos): `Dropdown` (no lugar de `<select>`), `Modal` e `ConfirmModal`
  (fundo só com blur — sem cor —, sem scroll interno; `Modal` aceita
  `tituloExtra` e `rodape`), `WhatsAppIcon`.
- **Padrão de lista** (ver Pedidos): busca + filtro lado a lado ocupando a
  largura da tabela; busca só nos dados do nosso sistema e com placeholder
  curto ("Buscar"); ação da linha é um ícone sem texto que abre um modal (a
  linha não expande); status como selo colorido com nome legível.
- **Armadilha de CSS:** `.admin-content th/td/a/h1/h2` (em `globals.css`) têm
  especificidade maior que uma utility do Tailwind — alinhamento, sublinhado
  etc. dessas tags precisam de `style` inline (ou de ajuste na regra global).

## Configuração hardcoded via `.env` (a aba Configurações não existe mais)

Sem tela pra editar `event_config_encontro27`, o que antes viria de lá agora é
env var (ver `.env.example`):

- `NEXT_PUBLIC_WHATSAPP_SUPPORT` — número do link de suporte no rodapé
  (`SupportLink`).
- `NEXT_PUBLIC_EVENT_DATE_INICIO` / `NEXT_PUBLIC_EVENT_DATE_FIM` — período do
  evento, usado só pelo aviso (não bloqueia) de check-in fora do dia
  (`checkin_encontro27`, migration 0014 — recebe as datas por parâmetro em vez
  de ler a tabela).
- GA4, Meta Pixel e Google Ads não precisam de variável própria: configuram-se
  dentro do próprio container do GTM (`NEXT_PUBLIC_GTM_ID`). `sale_status`
  (coluna de `event_config_encontro27`) não é lido em nenhum lugar do código.
- `event_config_encontro27.date` / `.location` / `.description` continuam
  vindos do banco — usados por `EventInfo`/`EventJsonLd` no site público, fora
  do escopo deste ajuste.

## Decisões em aberto

- [ ] **"Lote sem vaga"** é um status exclusivo (ocupa o lugar do selo de
      pagamento) em Pedidos. O filtro de status continua só por status de
      pagamento, sem opção "Lote sem vaga". Decidir se vira opção de filtro.
- [ ] **Equipe:** dá pra cadastrar (com role escolhida), trocar senha e
      remover acesso. Não dá pra trocar a role de quem já foi cadastrado (só
      recadastrando com outro e-mail).
- [ ] **Check-in em produção:** testado ponta a ponta só com câmera simulada
      (Chromium + dispositivo de vídeo fake lendo um QR real, gerado via
      `qrcode` + `ffmpeg`). Falta uma passada com câmera de verdade num
      celular, em produção — a leitura por câmera exige conexão segura
      (HTTPS ou `localhost`); confirmar que o domínio final serve o site
      assim.

## Cadastro de participante sem confirmação de e-mail

O `signUp` público do Supabase responde `500 Error sending confirmation
email`: o servidor de autenticação (compartilhado com outros projetos) exige
confirmação, mas o SMTP dele é o de teste (`supabase-mail`, remetente
`fake_sender`) e não entrega nada. Sem SMTP real disponível por enquanto,
decisão do dono do projeto: o cadastro passa pela nossa API (`POST /cadastro`,
`api/src/routes/cadastro.ts`), que cria a conta com o e-mail já marcado como
confirmado, e o navegador faz login em seguida. Isso é permanente enquanto não
houver SMTP — não é mais um TODO urgente, mas o risco aceito abaixo continua
valendo.

- **Risco aceito:** sem confirmação, quem cadastra o e-mail de outra pessoa
  passa a ver os ingressos/QR codes dela e a receber transferências
  destinadas a ela (tudo é ligado ao e-mail da sessão).
- [ ] Quando houver SMTP real no servidor de autenticação: voltar ao `signUp`
      do Supabase com confirmação por e-mail e remover a rota `/cadastro`.
- A rota tem limite de 10 cadastros por IP a cada 15 min, só em memória (zera
  quando a API reinicia).

## Antes de lançar

- [x] Nenhum `PREVIEW_FAKE` (ou equivalente) resta no código.
- [x] Testado ponta a ponta com login real: Equipe (cadastrar, trocar senha,
      remover com guarda de auto-remoção e conta Auth preservada), busca por
      Hypercash em Pedidos, aviso de dia do check-in via env var.
- [ ] Testar check-in com câmera de verdade em produção (ver acima).
- [ ] Fechar as decisões em aberto acima ("Lote sem vaga" e troca de role na
      Equipe).
- [ ] Apagar este arquivo quando tudo acima estiver decidido/resolvido.
