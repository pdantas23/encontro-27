import { test, expect, type Page } from "@playwright/test";

/**
 * Jornada de venda da landing (cap. 04 do levantamento):
 * chegada → entendimento → escolha do ingresso → início da compra.
 * Os dados de ingresso vêm do Supabase real: os testes aceitam os dois
 * estados válidos hoje (comprável → /checkout?lote=…; em breve → botão
 * desabilitado) e falham em qualquer outro.
 */

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test.describe("Home", () => {
  test("carrega com H1 e proposta, sem erro no console", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto("./");

    await expect(page).toHaveTitle(/O Encontro 2027/);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toContainText("O Encontro");
    await expect(page.getByText("Natureza que conecta. Cultura que transforma.", { exact: true })).toBeVisible();

    expect(errors, "console sem erros").toEqual([]);
  });

  test("não mostra placeholders de desenvolvimento nem 'a definir'", async ({ page }) => {
    await page.goto("./");
    // aguarda as ilhas client terminarem de carregar
    await expect(page.locator(".animate-pulse")).toHaveCount(0);
    const texto = await page.locator("main").innerText();
    expect(texto).not.toMatch(/\[PENDENTE\]|a definir|lorem ipsum/i);
  });

  test("blocos da descrição na ordem aprovada", async ({ page }) => {
    await page.goto("./");
    const titulos = await page.getByRole("heading", { level: 2 }).allInnerTexts();
    const ordem = [/^Edições anteriores$/, /^Ingressos$/, /^Sobre o evento$/, /^Experiências$/, /^Convidados$/, /^Perguntas frequentes$/];
    let cursor = 0;
    for (const re of ordem) {
      const idx = titulos.findIndex((t, i) => i >= cursor && re.test(t));
      expect(idx, `seção ${re} na ordem`).toBeGreaterThanOrEqual(cursor);
      cursor = idx + 1;
    }
  });

  test("desktop: caixa de ingressos acompanha a rolagem", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./");
    await page.getByRole("heading", { name: "Perguntas frequentes" }).scrollIntoViewIfNeeded();
    await expect(page.locator("#ingressos")).toBeInViewport();
  });

  test("celular: barra 'a partir de' aparece quando a caixa sai da tela e leva a ela", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");
    await expect(page.locator("#ingressos .animate-pulse")).toHaveCount(0);
    const verIngressos = page.getByRole("link", { name: "Ver ingressos" });
    test.skip((await page.locator("#ingressos").getByRole("link", { name: /^Comprar / }).count()) === 0, "Nenhum lote comprável.");

    await page.getByRole("heading", { name: "Perguntas frequentes" }).scrollIntoViewIfNeeded();
    await expect(verIngressos).toBeInViewport();
    await verIngressos.click();
    await expect(page.getByRole("heading", { name: "Ingressos", exact: true })).toBeInViewport();
  });

  test("4 modalidades públicas com estado real e sem preço fixo (Almoço — Start só na conta)", async ({ page }) => {
    await page.goto("./#ingressos");
    const linhas = page.locator("#ingressos li");
    await expect(linhas).toHaveCount(4);

    for (const nome of ["Start", "Almoço Não Participante", "Jantar de Conexões", "VIP"]) {
      await expect(page.locator("#ingressos").getByRole("heading", { name: nome, exact: true })).toBeVisible();
    }

    for (const linha of await linhas.all()) {
      const comprar = linha.getByRole("link", { name: /^Comprar / });
      const indisponivel = linha.getByRole("button", { name: /Em breve|Esgotado|Vendas encerradas/ });
      if (await comprar.count()) {
        await expect(comprar).toHaveAttribute("href", /\/checkout\/?\?lote=[0-9a-f-]{36}$/);
        await expect(linha.getByText(/R\$\s?\d/)).toBeVisible();
      } else {
        await expect(indisponivel).toBeDisabled();
        await expect(linha.getByText(/R\$\s?\d/)).toHaveCount(0);
      }
    }
  });

  test("sem rolagem horizontal", async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("./");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `largura ${width}`).toBe(0);
    }
  });
});

test.describe("Fluxo até o checkout", () => {
  test("/ingressos usa a mesma caixa de ingressos", async ({ page }) => {
    await page.goto("./ingressos/");
    await expect(page.getByRole("heading", { name: /Como você quer participar/ })).toBeVisible();
    await expect(page.locator("#ingressos li")).toHaveCount(4);
  });

  test("checkout: 1 ingresso por pedido, 2 etapas, termos com basePath", async ({ page }) => {
    await page.goto("./#ingressos");
    await expect(page.locator("#ingressos .animate-pulse")).toHaveCount(0);
    const comprar = page.locator("#ingressos").getByRole("link", { name: /^Comprar / }).first();
    test.skip((await comprar.count()) === 0, "Nenhum lote comprável no banco.");
    await comprar.click();
    await expect(page).toHaveURL(/\/checkout\/?\?lote=/);

    await expect(page.getByText("Etapa 1 de 2")).toBeVisible();
    await expect(page.getByRole("spinbutton")).toHaveCount(0); // sem seletor de quantidade
    await expect(page.getByText("Quantidade: 1 ingresso por pedido")).toBeVisible();

    await page.getByRole("textbox", { name: "Nome completo" }).fill("Teste E2E");
    await page.getByRole("textbox", { name: "E-mail" }).fill("e2e@exemplo.invalid");
    await page.getByRole("textbox", { name: "WhatsApp (com DDD)" }).fill("86999999999");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByText("Etapa 2 de 2")).toBeVisible();
    await expect(page.getByText("Participante: Teste E2E")).toBeVisible();
    await expect(page.getByRole("link", { name: "termos de compra" })).toHaveAttribute("href", /\/encontro27\/termos\/?$/);
    // não confirma: confirmar cria pedido real e sai para a Hypercash
    await expect(page.getByRole("button", { name: /Confirmar e ir para pagamento/ })).toBeDisabled();
  });

  test("card comprável chega ao checkout com o lote (quando houver)", async ({ page }) => {
    await page.goto("./#ingressos");
    // espera a ilha de ingressos terminar de carregar antes de decidir
    await expect(page.locator("#ingressos .animate-pulse")).toHaveCount(0);
    const comprar = page.locator("#ingressos").getByRole("link", { name: /^Comprar / }).first();
    test.skip((await comprar.count()) === 0, "Nenhum lote comprável no banco ainda (preço/checkout URL pendentes).");
    await comprar.click();
    await expect(page).toHaveURL(/\/checkout\/?\?lote=/);
  });
});
