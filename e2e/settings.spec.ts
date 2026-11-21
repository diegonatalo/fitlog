import { createWorkout, expect, saved, test } from "./fixtures";

test("apagar todos os dados limpa a conta, e continua limpa depois de recarregar", async ({ page }) => {
  await createWorkout(page, "Treino Costas", ["Supino reto"]);

  await page.goto("/app/ajustes");
  await expect(page.getByRole("button", { name: /backup/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Apagar todos os dados" }).click();
  await page.getByRole("button", { name: "Apagar tudo" }).click();
  await expect(page.getByRole("main").getByRole("status")).toHaveText("Dados apagados.");
  await saved(page);

  await page.goto("/app/treinos");
  await page.reload();
  await expect(page.getByText("Monte seu primeiro treino")).toBeVisible();
  await expect(page.getByText("Treino Costas")).toHaveCount(0);

  // a conta continua: dá para usar o app de novo
  await page.goto("/app/ajustes");
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
