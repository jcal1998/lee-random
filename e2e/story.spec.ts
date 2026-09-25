import { expect, test, type Page } from "@playwright/test";

async function playToTheEnd(page: Page) {
  const next = page.locator("#next-btn");
  const titles: string[] = [];

  await next.click(); // Começar
  for (;;) {
    titles.push((await page.locator("#scene-title").innerText()).trim());

    const choices = page.locator(".choice-btn");
    if (await choices.count()) {
      await expect(next).toBeHidden();
      await choices.first().click();
      await expect(choices).toHaveCount(0);
    }

    const label = await next.innerText();
    await next.click();
    if (label.includes("Feliz Aniversário")) break;
  }
  return titles;
}

test("joga a história do começo ao fim", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Nossa História de Amor");
  await expect(page.locator("#next-btn")).toHaveText("Começar");

  const titles = await playToTheEnd(page);

  expect(titles).toHaveLength(9);
  expect(titles[0]).toBe("Capítulo 1: O Encontro na UFG");
  expect(titles.at(-1)).toBe("Capítulo Final: O Presente");
  expect(titles.some((t) => t.includes("Pontes Aéreas"))).toBe(false);

  await expect(page.getByText("A nossa história continua... ❤️")).toBeVisible();
  await expect(page.locator("#final-photos img")).toHaveCount(0);

  await page.getByRole("button", { name: "Jogar de novo" }).click();
  await expect(page.locator("#next-btn")).toHaveText("Começar");
});

test("?jolee troca o nome, libera o capítulo extra e as fotos", async ({ page }) => {
  await page.goto("/?jolee");
  await page.locator("#next-btn").click();
  await expect(page.locator("#text-box")).toContainText("Joropopo");
  await expect(page.locator("#text-box")).not.toContainText("Mozinha");
  await page.reload();

  const titles = await playToTheEnd(page);
  expect(titles).toHaveLength(10);
  expect(titles).toContain("Capítulo 9: Pontes Aéreas");

  const photos = page.locator("#final-photos img");
  await expect(photos).toHaveCount(2);
  for (const img of await photos.all()) {
    await expect(img).toHaveJSProperty("complete", true);
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("robots.txt e CNAME vão junto no build", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  const cname = await request.get("/CNAME");
  expect(await cname.text()).toContain("josecarloslee.online");
});
