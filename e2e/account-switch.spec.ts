import { createWorkout, expect, signUpByApi, test, title } from "./fixtures";

// Aparelho dividido: A deixou uma aba aberta e B entrou em outra.

test("o treino criado na aba de A não é gravado na conta de B", async ({ page, baseURL }) => {
  await page.goto("/app/treino/novo");
  await page.getByLabel("Nome do treino").fill("Treino da conta A");

  await page.context().clearCookies();
  await signUpByApi(page.request, baseURL!);

  await page.getByRole("button", { name: "Criar treino" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "salvar" })).toBeVisible();

  const other = await page.context().newPage();
  await other.goto("/app/treinos");
  await expect(title(other, "Treinos")).toBeVisible();
  await expect(other.getByText("Treino da conta A")).toHaveCount(0);
});

test("apagar tudo na aba de A não apaga os dados de B", async ({ page, baseURL }) => {
  await page.goto("/app/ajustes");
  await page.getByRole("button", { name: "Apagar todos os dados" }).click();

  await page.context().clearCookies();
  await signUpByApi(page.request, baseURL!);
  const other = await page.context().newPage();
  await createWorkout(other, "Treino da conta B", ["Supino reto"]);

  await page.getByRole("button", { name: "Apagar tudo" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "salvar" })).toBeVisible();

  await other.goto("/app/treinos");
  await expect(other.getByRole("link", { name: /Treino da conta B/ })).toBeVisible();
});

test("excluir conta na aba de A não apaga a conta de B", async ({ page, baseURL }) => {
  await page.goto("/app/ajustes");
  await page.getByRole("button", { name: "Excluir conta" }).click();

  await page.context().clearCookies();
  await signUpByApi(page.request, baseURL!);
  const other = await page.context().newPage();
  await other.goto("/app");
  await expect(title(other, "FitLog")).toBeVisible();

  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir conta" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Outra conta entrou" })).toBeVisible();

  await other.reload();
  await expect(title(other, "FitLog")).toBeVisible();
});
