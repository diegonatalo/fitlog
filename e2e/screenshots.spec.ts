import type { Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { createWorkout, expect, saved, test } from "./fixtures";

// Gera os prints da landing em public/landing/ (WebP). Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");

/** Registra uma série no primeiro exercício do treino. */
const logSet = async (page: Page, weight: string, reps: string) => {
  await page.getByRole("spinbutton", { name: "Peso (kg)" }).first().fill(weight);
  await page.getByRole("spinbutton", { name: "Repetições" }).first().fill(reps);
  await page.getByRole("button", { name: "Salvar", exact: true }).first().click();
};

/** Tira o print da tela do topo e grava como WebP, convertendo no próprio navegador. */
const shoot = async (page: Page, name: string) => {
  await page.waitForTimeout(1_000);
  await page.evaluate(() => window.scrollTo(0, 0));
  const png = (await page.screenshot()).toString("base64");
  const webp = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    return canvas.toDataURL("image/webp", 0.85);
  }, `data:image/png;base64,${png}`);
  writeFileSync(`public/landing/${name}.webp`, Buffer.from(webp.split(",")[1], "base64"));
};

/** Um treino planejado para hoje, com uma sessão terminada e um recorde. */
const trainToday = async (page: Page) => {
  await createWorkout(page, "Treino A · Peito e tríceps", ["Supino reto", "Tríceps", "Crucifixo", "Desenvolvimento"]);

  // planeja hoje na agenda: as células do mês vêm em ordem, a partir do dia 1
  await page.goto("/app/agenda");
  const days = page
    .getByRole("region", { name: "Calendário" })
    .getByRole("button", { name: /^(domingo|segunda|terça|quarta|quinta|sexta|sábado)/i });
  await days.nth(new Date().getDate() - 1).click();
  await page.getByRole("dialog").getByRole("radio", { name: /Treino A/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Salvar dia" }).click();
  await saved(page);

  await page.goto("/app");
  await page.getByRole("button", { name: "Iniciar treino" }).click();
  await expect(page).toHaveURL(/\/sessao\/[^/]+$/);
  await logSet(page, "60", "10");
  // o formulário continua aberto: a segunda série, mais pesada, vira recorde
  await page.getByRole("spinbutton", { name: "Peso (kg)" }).first().fill("62.5");
  await page.getByRole("button", { name: "Salvar", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Editar série" })).toHaveCount(2);
  await page.getByRole("button", { name: "Finalizar treino" }).click();
  await expect(page).toHaveURL(/\/historico\/[^/]+$/);
  await saved(page);
};

for (const scheme of ["light", "dark"] as const) {
  test(`print do treino (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await createWorkout(page, "Treino A · Peito e tríceps", ["Supino reto", "Tríceps"]);
    await page.getByRole("button", { name: "Iniciar treino" }).click();
    await expect(page).toHaveURL(/\/sessao\/[^/]+$/);
    await logSet(page, "60", "10");
    await expect(page.getByRole("button", { name: "Editar série" })).toHaveCount(1);
    await shoot(page, scheme === "light" ? "treino-claro" : "treino-escuro");
  });
}

test("prints do início e do progresso", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await trainToday(page);

  await page.goto("/app");
  await expect(page.getByRole("heading", { level: 1, name: "Hoje" })).toBeVisible();
  await shoot(page, "inicio-escuro");

  await page.goto("/app/progresso");
  await expect(page.getByRole("heading", { level: 1, name: "Progresso" })).toBeVisible();
  await shoot(page, "progresso-escuro");

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/app");
  await expect(page.getByRole("heading", { level: 1, name: "Hoje" })).toBeVisible();
  await shoot(page, "inicio-claro");
});
