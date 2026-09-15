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
  test("carrega com H1, proposta e CTA principal visível sem rolar", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto("./");

    await expect(page).toHaveTitle(/O Encontro 2027/);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toContainText("O Encontro");
    await expect(page.getByText("Natureza que conecta. Cultura que transforma.", { exact: true })).toBeVisible();

    const ctaHero = page.getByRole("main").getByRole("link", { name: "Comprar ingresso" }).first();
    await expect(ctaHero).toBeInViewport();
    await expect(ctaHero).toHaveAttribute("href", /#ingressos$/);

    expect(errors, "console sem erros").toEqual([]);
  });

  test("não mostra placeholders de desenvolvimento nem 'a definir'", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("heading", { name: /Como você quer participar/ }).waitFor();
    // aguarda as ilhas client terminarem de carregar
    await expect(page.locator(".animate-pulse")).toHaveCount(0);
    const texto = await page.locator("main").innerText();
    expect(texto).not.toMatch(/\[PENDENTE\]|a definir|lorem ipsum/i);
  });

  test("seções na ordem aprovada", async ({ page }) => {
    await page.goto("./");
    const titulos = await page.getByRole("heading", { level: 2 }).allInnerTexts();
    const ordem = [
      /O que acontece no Encontro/,
      /Inspirado no cajueiro/,
      /Almoço de Negócios e Jantar/,
      /^Convidados$/,
      /Como você quer participar/,
      /^Tire suas dúvidas$/,
      /Momentos que continuam presentes/,
      /Da mesma origem/,
    ];
    let cursor = 0;
    for (const re of ordem) {
      const idx = titulos.findIndex((t, i) => i >= cursor && re.test(t));
      expect(idx, `seção ${re} na ordem`).toBeGreaterThanOrEqual(cursor);
      cursor = idx + 1;
    }
  });

  test("CTA do hero e CTA final levam à seção de ingressos", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".animate-pulse")).toHaveCount(0);
    await page.getByRole("main").getByRole("link", { name: "Comprar ingresso" }).first().click();
    await expect(page.getByRole("heading", { name: /Como você quer participar/ })).toBeInViewport();

    await page.getByRole("link", { name: "Ver ingressos" }).click();
    await expect(page.getByRole("heading", { name: /Como você quer participar/ })).toBeInViewport();
  });

  test("4 modalidades públicas com estado real e sem preço fixo (Almoço — Start só na conta)", async ({ page }) => {
    await page.goto("./#ingressos");
    const cards = page.locator("#ingressos li");
    await expect(cards).toHaveCount(4);

    for (const nome of ["Start", "Almoço Não Participante", "Jantar de Conexões", "VIP"]) {
      await expect(page.locator("#ingressos").getByRole("heading", { name: nome, exact: true })).toBeVisible();
    }

    for (const card of await cards.all()) {
      const comprar = card.getByRole("link", { name: /^Comprar / });
      const indisponivel = card.getByRole("button", { name: /Em breve|Esgotado|Vendas encerradas/ });
      if (await comprar.count()) {
        await expect(comprar).toHaveAttribute("href", /\/checkout\/?\?lote=[0-9a-f-]{36}$/);
        await expect(card.getByText(/R\$\s?\d/)).toBeVisible();
      } else {
        await expect(indisponivel).toBeDisabled();
        await expect(card.getByText(/R\$\s?\d/)).toHaveCount(0);
      }
    }
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await page.goto("./");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
});

test.describe("Fluxo até o checkout", () => {
  test("/ingressos usa os mesmos cards", async ({ page }) => {
    await page.goto("./ingressos/");
    await expect(page.getByRole("heading", { name: /Como você quer participar/ })).toBeVisible();
    await expect(page.locator("main li")).toHaveCount(4);
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

test.describe("Motion da flor (Hero → 5 anos)", () => {
  test("com prefers-reduced-motion a flor original fica estática e o clone não aparece", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await expect(page.locator(".animate-pulse")).toHaveCount(0);
    await expect(page.locator("[data-flor-origem]")).toBeVisible();
    await expect(page.locator("main > img[aria-hidden]")).toBeHidden();
  });

  test("sem redução de movimento, o clone assume o lugar da original sem deslocar layout", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("./");
    await expect(page.locator("main > img[aria-hidden]")).toBeVisible();
    const [orig, clone] = await page.evaluate(() => {
      const r = (s: string) => {
        const b = document.querySelector(s)!.getBoundingClientRect();
        return [Math.round(b.left), Math.round(b.top), Math.round(b.width)];
      };
      return [r("[data-flor-origem]"), r("main > img[aria-hidden]")];
    });
    expect(clone).toEqual(orig);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
});
