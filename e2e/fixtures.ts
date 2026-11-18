import { expect, type Page } from "@playwright/test";

/** Cria um treino pela tela "Novo treino" com exercícios da biblioteca. */
export const createWorkout = async (page: Page, name: string, exercises: string[]) => {
  await page.goto("/treino/novo");
  await page.getByLabel("Nome do treino").fill(name);
  for (const exercise of exercises) {
    await page.getByLabel("Buscar exercício").fill(exercise);
    await page.getByRole("button", { name: new RegExp(exercise), pressed: false }).first().click();
  }
  await page.getByRole("button", { name: "Criar treino" }).click();
  await expect(page).toHaveURL(/\/treino\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
};

export const title = (page: Page, name: string) =>
  page.getByRole("heading", { level: 1, name, exact: true });
