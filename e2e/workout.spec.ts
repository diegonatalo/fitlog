import { createWorkout, expect, saved, test, title } from "./fixtures";

test("monta um treino, registra uma série e salva no histórico", async ({ page }) => {
  await createWorkout(page, "Treino A", ["Supino reto"]);

  await page.getByRole("main").getByRole("button", { name: "Iniciar treino" }).click();
  await expect(page).toHaveURL(/\/sessao\/[^/]+$/);

  await page.getByRole("spinbutton", { name: "Peso (kg)" }).fill("60");
  await page.getByRole("spinbutton", { name: "Repetições" }).fill("10");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Editar série" })).toHaveCount(1);

  await page.getByRole("button", { name: "Finalizar treino" }).click();
  await expect(page).toHaveURL(/\/historico\/[^/]+$/);
  await expect(title(page, "Treino A")).toBeVisible();
  await saved(page);

  // Depois de recarregar, a sessão continua no histórico.
  await page.goto("/app/historico");
  await page.reload();
  await expect(page.getByText("Treino A").first()).toBeVisible();
});

test("o treino em andamento sobrevive a recarregar a página", async ({ page }) => {
  await createWorkout(page, "Treino B", ["Supino reto"]);
  await page.getByRole("main").getByRole("button", { name: "Iniciar treino" }).click();
  await page.getByRole("spinbutton", { name: "Peso (kg)" }).fill("40");
  await page.getByRole("spinbutton", { name: "Repetições" }).fill("12");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await saved(page);

  await page.reload();
  await expect(page.getByRole("main").getByText("Ao vivo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Editar série" })).toHaveCount(1);
});

test("não cria treino sem nome", async ({ page }) => {
  await page.goto("/app/treino/novo");
  await expect(page.getByRole("button", { name: "Criar treino" })).toBeDisabled();
});
