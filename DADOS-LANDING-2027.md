# Dados da landing — O Encontro 2027

Formulário de coleta de conteúdo para colocar a página de vendas no ar com dados reais.

**Como preencher**
- Substitua o texto após o `→` de cada linha. Onde estiver escrito *(deixar em branco se não houver)*, pode deixar vazio.
- Campos marcados com **Obrigatório** precisam estar preenchidos para aquela parte do site funcionar.
- Não invente nada: se um dado ainda não foi decidido, escreva **PENDENTE** e o site esconde aquela informação até ela chegar.
- Os nomes entre parênteses (ex.: `preco`) são só referência técnica; ignore.

---

## 1. Dados críticos para venda

Sem estes dados o botão **"Comprar"** fica desativado e o card mostra "Em breve". Preencha para cada uma das 4 modalidades. Todas estão no **Lote 1** — se o nome oficial do primeiro lote for outro (ex.: "Lote Promocional"), informe no final desta seção.

### 1.1 Start
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Preço do Lote 1** (`preco`) → | Obrigatório | `490,00` | Card do ingresso na Home e em /ingressos; página de detalhe; valor registrado no pedido |
| **Link de pagamento** (`hypercash_checkout_url`) → | Obrigatório | `https://pay.hypercash.com.br/xxxxx` | Para onde o comprador é enviado ao finalizar o checkout. Um link por modalidade |
| **Quantidade de ingressos neste lote** (`quantidade`) → | Opcional | `150` | Mostra "N vagas restantes" e vira "Esgotado" automaticamente. Em branco = sem limite exibido |
| **Início das vendas** (`inicio_venda`) → | Opcional | `01/10/2026 00:00` | Antes dessa data o card fica "Em breve" |
| **Fim das vendas** (`fim_venda`) → | Opcional | `31/12/2026 23:59` | Depois dessa data o card fica "Vendas encerradas" |

### 1.2 VIP
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Preço do Lote 1** (`preco`) → | Obrigatório | `990,00` | Card, detalhe, pedido |
| **Link de pagamento** (`hypercash_checkout_url`) → | Obrigatório | `https://pay.hypercash.com.br/xxxxx` | Destino do checkout |
| **Quantidade de ingressos neste lote** (`quantidade`) → | Opcional | `50` | Vagas restantes / Esgotado |
| **Início das vendas** (`inicio_venda`) → | Opcional | `01/10/2026 00:00` | Card "Em breve" até a data |
| **Fim das vendas** (`fim_venda`) → | Opcional | `31/12/2026 23:59` | Card "Vendas encerradas" após a data |

### 1.3 Almoço Não Participante
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Preço do Lote 1** (`preco`) → | Obrigatório | `180,00` | Card, detalhe, pedido |
| **Link de pagamento** (`hypercash_checkout_url`) → | Obrigatório | `https://pay.hypercash.com.br/xxxxx` | Destino do checkout |
| **Quantidade de ingressos neste lote** (`quantidade`) → | Opcional | `80` | Vagas restantes / Esgotado |
| **Início das vendas** (`inicio_venda`) → | Opcional | `01/10/2026 00:00` | Card "Em breve" até a data |
| **Fim das vendas** (`fim_venda`) → | Opcional | `31/12/2026 23:59` | Card "Vendas encerradas" após a data |

### 1.4 Jantar de Conexões
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Preço do Lote 1** (`preco`) → | Obrigatório | `250,00` | Card, detalhe, pedido |
| **Link de pagamento** (`hypercash_checkout_url`) → | Obrigatório | `https://pay.hypercash.com.br/xxxxx` | Destino do checkout |
| **Quantidade de ingressos neste lote** (`quantidade`) → | Opcional | `60` | Vagas restantes / Esgotado |
| **Início das vendas** (`inicio_venda`) → | Opcional | `01/10/2026 00:00` | Card "Em breve" até a data |
| **Fim das vendas** (`fim_venda`) → | Opcional | `31/12/2026 23:59` | Card "Vendas encerradas" após a data |

**Nome oficial do primeiro lote** (`nome`, hoje "Lote 1") → *(deixar em branco para manter "Lote 1")*

---

## 2. Ingressos / modalidades — textos de cada card

Estes textos explicam o que cada ingresso é. É aqui que o visitante entende a diferença entre Start e VIP, e que Almoço e Jantar são vendidos à parte. Preencha para cada modalidade.

### 2.1 Start
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Descrição curta** (`descricao`) → | Recomendado | `Acesso completo aos dois dias de palestras e networking.` | Abaixo do nome, no card e na página de detalhe |
| **Para quem é** (`para_quem_e`) → | Recomendado | `Para quem quer viver o evento completo com a melhor relação custo-benefício.` | Linha "Para quem é:" no card e seção própria no detalhe |
| **O que está incluído** (`itens_incluidos`) → | Recomendado | Um item por linha:<br>`Acesso aos 2 dias de programação`<br>`Credencial e kit do participante`<br>`Coffee break` | Lista com ✦ no card (até 5 itens) e lista completa no detalhe |
| **O que NÃO está incluído** (`itens_nao_incluidos`) → | Opcional | Um item por linha:<br>`Almoço de Negócios`<br>`Jantar de Conexões` | Só na página de detalhe |
| **Condições** (`condicoes`) → | Opcional | `Ingresso nominal. Meia-entrada mediante comprovação.` | Só na página de detalhe |

### 2.2 VIP
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Descrição curta** (`descricao`) → | Recomendado | `A experiência completa: programação, Almoço e Jantar inclusos.` | Card e detalhe |
| **Para quem é** (`para_quem_e`) → | Recomendado | `Para quem quer aproveitar todas as experiências sem se preocupar com nada.` | Card e detalhe |
| **O que está incluído** (`itens_incluidos`) → | Recomendado | Um item por linha | Card (até 5) e detalhe |
| **O que NÃO está incluído** (`itens_nao_incluidos`) → | Opcional | Um item por linha | Detalhe |
| **Condições** (`condicoes`) → | Opcional | texto livre | Detalhe |

### 2.3 Almoço Não Participante
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Descrição curta** (`descricao`) → | Recomendado | `Participe do Almoço de Negócios mesmo sem ingresso para o evento.` | Card e detalhe |
| **Para quem é** (`para_quem_e`) → | Recomendado | `Para acompanhantes e convidados que querem estar no almoço.` | Card e detalhe |
| **O que está incluído** (`itens_incluidos`) → | Recomendado | Um item por linha | Card (até 5) e detalhe |
| **O que NÃO está incluído** (`itens_nao_incluidos`) → | Opcional | `Acesso às palestras` | Detalhe |
| **Condições** (`condicoes`) → | Opcional | texto livre | Detalhe |

### 2.4 Jantar de Conexões
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Descrição curta** (`descricao`) → | Recomendado | `Jantar exclusivo de networking na noite do primeiro dia.` | Card e detalhe |
| **Para quem é** (`para_quem_e`) → | Recomendado | `Para quem quer aprofundar conexões em um ambiente reservado.` | Card e detalhe |
| **O que está incluído** (`itens_incluidos`) → | Recomendado | Um item por linha | Card (até 5) e detalhe |
| **O que NÃO está incluído** (`itens_nao_incluidos`) → | Opcional | Um item por linha | Detalhe |
| **Condições** (`condicoes`) → | Opcional | texto livre | Detalhe |

---

## 3. Evento

| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Data do evento** (`date`) → | Recomendado | `12/03/2027` (se forem 2 dias, informe o primeiro e escreva a duração ao lado: `12/03/2027 — 2 dias`) | Topo da Home, logo abaixo dos botões ("Data · 12 de março de 2027"). Enquanto vazio, não aparece nada |
| **Local** (`location`) → | Recomendado | `Blue Tree Towers, Teresina – PI` | Topo da Home ("Local · …") e rodapé |
| **Descrição do evento para buscadores** (`description`) → | Opcional | `O Encontro 2027 é a edição comemorativa de 5 anos do evento que reúne cerimonialistas e profissionais de eventos do Piauí.` (até 300 caracteres) | Não aparece na tela; vai para Google e redes sociais |
| **WhatsApp de suporte** (`whatsapp_support`) → | Recomendado | `+55 86 99999-9999` | Rodapé, link "Suporte: WhatsApp". Enquanto vazio, não aparece |
| **Instagram oficial** → | Opcional | `@oencontropi` | Rodapé *(ainda não existe no site — será adicionado se informado)* |
| **Site/e-mail de contato** → | Opcional | `contato@oencontropi.com.br` | Rodapé *(idem)* |

---

## 4. Convidados / palestrantes

A Home mostra os **8 primeiros** na ordem que você definir; a página /convidados mostra todos. Copie o bloco abaixo para cada pessoa.

### Convidado 1
| Campo | Obrigatório? | Exemplo | Onde aparece |
|---|---|---|---|
| **Nome** (`nome`) → | Obrigatório | `Maria Silva` | Card na Home e em /convidados |
| **Função / destaque** (`funcao`) → | Recomendado | `Cerimonialista · Teresina` ou `Palestrante principal` | Linha abaixo do nome |
| **Foto** (`foto_url`) → | Recomendado | Envie o arquivo junto com este formulário ou cole um link público. Ideal: quadrada, rosto centralizado, mínimo 400×400 px | Círculo do card. Sem foto, aparece a inicial do nome |
| **Minibiografia** (`bio`) → | Opcional | 2–3 frases | Só na página /convidados |
| **Ordem de exibição** (`ordem`) → | Opcional | `1` | Define a posição (1 = primeiro) |

### Convidado 2
*(repetir o bloco)*

---

## 5. Programação

Enquanto não houver programação cadastrada, a Home **não mostra** esse bloco e a página /programacao mostra "em breve". Quando você preencher, eu adiciono o resumo na Home. Uma linha por atividade.

| Dia (`dia`) | Horário (`horario`) | Atividade (`atividade`) — obrigatório | Convidado (`palestrante_id`) — nome exato da seção 4, ou vazio | Local / sala (`local`) — opcional |
|---|---|---|---|---|
| `1` | `08:30` | `Credenciamento e boas-vindas` | | `Foyer` |
| `1` | `09:30` | `Abertura oficial` | | `Auditório` |
| `1` | `12:30` | `Almoço de Negócios` | | `Restaurante` |
| `1` | `20:00` | `Jantar de Conexões` | | |
| `2` | `09:00` | `…` | `Maria Silva` | |

*(apague os exemplos e preencha com a programação real)*

Onde aparece: página /programacao (tabela por dia) e bloco "Programação" na Home (resumo dos destaques de cada dia).

---

## 6. Perguntas frequentes (FAQ)

A Home mostra as **6 primeiras** perguntas **que tiverem resposta**; a página /faq mostra todas. Pergunta sem resposta fica invisível. Temas sugeridos pelo levantamento: ingressos, pagamento, acesso, programação, almoço, jantar, VIP, transferência, cancelamento, localização, suporte, recebimento do ingresso, check-in.

| Ordem (`ordem`) | Tema (`tema`) | Pergunta (`pergunta`) — obrigatório | Resposta (`resposta`) — obrigatório para aparecer |
|---|---|---|---|
| `1` | `Ingressos` | `Qual a diferença entre Start e VIP?` | `…` |
| `2` | `Pagamento` | `Quais formas de pagamento são aceitas?` | `…` |
| `3` | `Recebimento` | `Como recebo meu ingresso?` | `…` |
| `4` | `Almoço` | `O almoço está incluído no Start?` | `…` |
| `5` | `Cancelamento` | `Posso cancelar ou transferir meu ingresso?` | `…` |
| `6` | `Localização` | `Onde será o evento?` | `…` |

*(exemplos apenas de perguntas; as respostas precisam vir da organização)*

---

## 7. Variáveis de produção

Não são conteúdo — são configurações do site publicado. Quem responde: quem cuida do domínio/hospedagem e do marketing.

| Campo | Obrigatório? | Exemplo | Para que serve |
|---|---|---|---|
| **Endereço do site em produção** (`NEXT_PUBLIC_SITE_URL`) → | Obrigatório para publicar | `https://oencontropi.com.br` | Links canônicos, imagem de compartilhamento no WhatsApp/Instagram, sitemap |
| **ID do Google Tag Manager** (`NEXT_PUBLIC_GTM_ID`) → | Recomendado | `GTM-XXXXXXX` | Liga a medição do funil (GA4, Meta Pixel e Google Ads entram dentro do GTM) |
| **Hospedagem / pasta** → | Informativo | `Hostinger, pasta /encontro27` | Confirmar que o site ficará em `/encontro27` ou na raiz do domínio (muda a configuração de build) |

---

## Checklist antes de devolver
- [ ] Seção 1 completa para as 4 modalidades (preço + link de pagamento no mínimo)
- [ ] Seção 2: descrição e "para quem é" das 4 modalidades
- [ ] Seção 3: data e local
- [ ] Seção 4: pelo menos os convidados já confirmados publicamente
- [ ] Seção 5 e 6: o que já estiver aprovado (podem vir depois)
- [ ] Seção 7: endereço do site
- [ ] Fotos dos convidados anexadas
