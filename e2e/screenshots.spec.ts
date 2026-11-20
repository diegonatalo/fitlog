import { expect, test, type Page } from "@playwright/test";
import { createWorkout } from "./fixtures";

// Gera os prints da landing em public/landing/. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");

/** Registra uma série no primeiro exercício do treino. */
const logSet = async (page: Page, weight: string, reps: string) => {
  await page.getByRole("button", { name: "Registrar série" }).first().click();
  await page.getByRole("spinbutton", { name: "Peso (kg)" }).first().fill(weight);
  await page.getByRole("spinbutton", { name: "Repetições" }).first().fill(reps);
  await page.getByRole("button", { name: "Salvar", exact: true }).first().click();
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
    await page.waitForTimeout(1_000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const name = scheme === "light" ? "treino-claro" : "treino-escuro";
    await page.screenshot({ path: `public/landing/${name}.png` });
  });
}
