import { test, expect, type Page } from "@playwright/test";

/**
 * Landing de Ativação de Marca (/ativacao-de-marca/).
 * Conteúdo estático (Canva "Plano de Ativação de Marcas"): não depende do Supabase.
 * Vídeos e mecanismo de contato são PENDENTES — os testes garantem que o
 * placeholder está lá e que nada é coletado nem enviado.
 */

const URL = "./ativacao-de-marca/";

const COTAS = [
  { id: "cota-01", nome: "Cota 01", valor: "R$ 2.000,00", beneficios: 3 },
  { id: "cota-02", nome: "Cota 02", valor: "R$ 5.000,00", beneficios: 5 },
  { id: "cota-03", nome: "Cota 03", valor: "R$ 15.000,00", beneficios: 10 },
  { id: "cota-04", nome: "Cota 04", valor: "R$ 25.000,00", beneficios: 9 },
];

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test.describe("Ativação de Marca", () => {
  test("carrega com um único H1 e sem erro no console", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(URL);
    await expect(page).toHaveTitle(/Ativação de Marca/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ative sua marca no Encontro 2027");
    await page.waitForLoadState("networkidle");
    expect(errors, "console sem erros").toEqual([]);
  });

  test("hero leva às cotas e à área de interesse", async ({ page }) => {
    await page.goto(URL);
    const hero = page.locator("main > header");
    await expect(hero.getByRole("link", { name: "Conhecer as cotas" })).toHaveAttribute("href", "#cotas");
    await expect(hero.getByRole("link", { name: "Quero ativar minha marca" })).toHaveAttribute("href", "#interesse");
    await hero.getByRole("link", { name: "Conhecer as cotas" }).click();
    await expect(page.locator("#cotas")).toBeInViewport();
  });

  test("todas as âncoras internas apontam para um alvo existente", async ({ page }) => {
    await page.goto(URL);
    const alvos = await page.locator('main a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    expect(alvos.length).toBeGreaterThan(0);
    for (const alvo of new Set(alvos)) {
      await expect(page.locator(alvo), `alvo ${alvo}`).toHaveCount(1);
    }
  });

  test("convidados: os 5 palestrantes do Canva com foto carregada", async ({ page }) => {
    await page.goto(URL);
    const secao = page.locator("#convidados");
    await expect(secao.getByRole("heading", { level: 2 })).toHaveText("O Congresso");
    const nomes = ["Esquadrão do Altar", "Jaeder Barreto", "Taís Vaz", "Fabi Moura", "Daniel Del Rio"];
    await expect(secao.locator("figcaption")).toHaveText(nomes);
    const fotos = secao.locator("figure > div > img");
    await expect(fotos).toHaveCount(5);
    await secao.scrollIntoViewIfNeeded();
    for (const foto of await fotos.all()) {
      await expect.poll(() => foto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
  });

  test("quatro cotas com nome, valor, benefícios e CTA visíveis", async ({ page }) => {
    await page.goto(URL);
    for (const c of COTAS) {
      const card = page.locator(`article#${c.id}`);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(c.nome);
      await expect(card).toContainText(c.valor);
      await expect(card.getByRole("list", { name: `Benefícios da ${c.nome}` }).getByRole("listitem")).toHaveCount(c.beneficios);
      await expect(card.getByRole("button", { name: `Tenho interesse na ${c.nome}` })).toBeVisible();
    }
    await expect(page.locator("main article[id^='cota-']")).toHaveCount(4);
  });

  test("CTA da cota leva à área de interesse com a cota marcada e na URL", async ({ page }) => {
    await page.goto(URL);
    await page.getByRole("button", { name: "Tenho interesse na Cota 03" }).click();

    await expect(page).toHaveURL(/[?&]cota=cota-03/);
    await expect(page.locator("#interesse")).toBeInViewport();
    await expect(page.getByRole("radio", { name: /Cota 03/ })).toBeChecked();
    await expect(page.locator("[data-resumo-cota]")).toContainText("Cota 03");
    await expect(page.locator("[data-captacao]")).toHaveAttribute("data-cota", "cota-03");
    await expect(page.locator("#interesse-titulo")).toBeFocused();
    await expect(page.locator("article#cota-03")).toHaveAttribute("data-escolhida", "true");
  });

  test("cota vinda na URL já chega marcada e pode ser trocada", async ({ page }) => {
    await page.goto(`${URL}?cota=cota-02`);
    await expect(page.getByRole("radio", { name: /Cota 02/ })).toBeChecked();
    await page.getByRole("radio", { name: /Cota 04/ }).check();
    await expect(page).toHaveURL(/[?&]cota=cota-04/);
    await expect(page.locator("[data-resumo-cota]")).toContainText("Cota 04");
  });

  test("valor de cota inválido na URL é ignorado", async ({ page }) => {
    await page.goto(`${URL}?cota=cota-99`);
    await expect(page.locator("[data-resumo-cota]")).toHaveText("Nenhuma cota escolhida ainda.");
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  });

  test("vídeos: aftermovie + 3 verticais publicados, sem pré-carga e com arquivo no ar", async ({ page }) => {
    await page.goto(URL);
    const videos = page.locator("#videos video");
    await expect(videos).toHaveCount(4);
    await expect(page.locator("[data-video-pendente]")).toHaveCount(0);
    // Só o vídeo principal toca sozinho ao rolar; os verticais esperam o play.
    await expect(page.locator("#videos video[data-autoplay]")).toHaveCount(1);
    await expect(videos.first()).toHaveAttribute("data-autoplay", "true");
    for (const v of await videos.all()) {
      await expect(v).toHaveAttribute("preload", "none");
      await expect(v).toHaveAttribute("poster", /-capa\.webp$/);
      const src = await v.locator("source").getAttribute("src");
      const resp = await page.request.head(new globalThis.URL(src!, page.url()).href);
      expect(resp.status(), src!).toBe(200);
    }
    await expect(page.locator("#videos figcaption")).toHaveText([
      "Almoço de Negócios",
      "Imersão + Jantar dos VIPs",
      "Imersão + Festa de Encerramento",
    ]);
  });

  test("contato pelo WhatsApp: área de interesse e botão flutuante levam a cota na mensagem", async ({ page }) => {
    await page.goto(URL);
    const flutuante = page.locator("[data-whatsapp-flutuante]");
    // Escondido no topo; aparece ao rolar.
    await expect(flutuante).toHaveCSS("opacity", "0");
    await page.getByRole("button", { name: "Tenho interesse na Cota 03" }).click();
    await expect(flutuante).toHaveCSS("opacity", "1");

    const area = page.locator("[data-captacao='whatsapp']");
    const cta = area.getByRole("link", { name: /Quero ativar minha marca/ });
    for (const link of [cta, flutuante]) {
      const href = (await link.getAttribute("href"))!;
      expect(href).toMatch(/^https:\/\/wa\.me\/5586999811935\?text=/);
      expect(decodeURIComponent(href.split("text=")[1])).toContain("Cota 03 (R$ 15.000,00)");
      await expect(link).toHaveAttribute("target", "_blank");
    }
    // Nada é coletado no site.
    await expect(page.locator("main form")).toHaveCount(0);
    await expect(page.locator("main input:not([type='radio']), main textarea, main select")).toHaveCount(0);
  });

  test("comunicação centrada em ativação, sem chamadas de patrocínio", async ({ page }) => {
    await page.goto(URL);
    const texto = await page.locator("main").innerText();
    expect(texto).not.toMatch(/seja (nosso )?patrocinador|patrocine|pacote de patroc[ií]nio|cotas de patroc[ií]nio/i);
    expect(texto).not.toMatch(/mais popular|recomendad[ao]|lorem ipsum/i);
  });

  test("sem rolagem horizontal da página", async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState("networkidle");
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
