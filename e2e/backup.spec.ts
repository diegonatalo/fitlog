import { expect, test } from "@playwright/test";
import { createWorkout } from "./fixtures";

test("exporta o backup, apaga tudo e importa de volta", async ({ page }, testInfo) => {
  await createWorkout(page, "Treino Costas", ["Supino reto"]);

  await page.goto("/ajustes");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar backup" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^fitlog-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);

  await page.getByRole("button", { name: "Apagar todos os dados" }).click();
  await page.getByRole("button", { name: "Apagar tudo" }).click();
  await expect(page.getByRole("status")).toHaveText("Dados apagados.");
  await page.goto("/treinos");
  await expect(page.getByText("Monte seu primeiro treino")).toBeVisible();

  await page.goto("/ajustes");
  await page.locator('input[type="file"]').setInputFiles(file);
  // O app já vem com treinos de exemplo, então o backup tem mais de um.
  await expect(page.getByText(/O backup tem \d+ treinos/)).toBeVisible();
  await page.getByRole("button", { name: "Importar", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Backup importado com sucesso.");

  await page.goto("/treinos");
  await expect(page.getByRole("link", { name: /Treino Costas/ })).toBeVisible();
});

test("recusa um arquivo que não é backup", async ({ page }) => {
  await page.goto("/ajustes");
  await page.locator('input[type="file"]').setInputFiles({
    name: "qualquer.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"nada": true}'),
  });
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("button", { name: "Importar", exact: true })).toHaveCount(0);
});
