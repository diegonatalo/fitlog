import type { Browser, Page } from "@playwright/test";
import { createWorkout, expect, saved, test, title } from "./fixtures";

// A mesma conta em dois aparelhos: o segundo abriu a tela antes de o primeiro salvar.

const NAME = "Treino dos dois aparelhos";

const secondDevice = async (page: Page, browser: Browser, baseURL: string, url = page.url()) => {
  const context = await browser.newContext({
    baseURL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    storageState: await page.context().storageState(),
  });
  const other = await context.newPage();
  await other.goto(url);
  return { context, other };
};

const warning = (page: Page) => page.getByRole("alert").filter({ hasText: "mudou em outro aparelho" });

const editWorkout = async (page: Page) => {
  await page.getByRole("link", { name: "Editar treino", exact: true }).click();
  await expect(page.getByLabel("Nome do treino")).toHaveValue(NAME);
};

const addExercise = async (page: Page, exercise: string) => {
  await page.getByLabel("Buscar exercício").fill(exercise);
  await page.getByRole("button", { name: new RegExp(exercise), pressed: false }).first().click();
};

const saveWorkout = async (page: Page) => {
  await page.getByRole("button", { name: "Salvar treino" }).click();
  await expect(page.getByRole("link", { name: "Editar treino", exact: true })).toBeVisible();
};

test("mudar os exercícios numa tela desatualizada mantém o nome que o outro salvou", async ({ page, browser, baseURL }) => {
  await createWorkout(page, NAME, ["Supino reto"]);
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await editWorkout(other);

  await editWorkout(page);
  await page.getByLabel("Nome do treino").fill("Nome novo");
  await saveWorkout(page);
  await saved(page);

  await addExercise(other, "Agachamento");
  await saveWorkout(other);
  await saved(other);

  await page.reload();
  await expect(title(page, "Nome novo")).toBeVisible();
  await expect(page.getByRole("main").getByText(/Agachamento/).first()).toBeVisible();
  await context.close();
});

test("o mesmo campo mudado nos dois avisa em vez de sobrescrever", async ({ page, browser, baseURL }) => {
  await createWorkout(page, NAME, ["Supino reto"]);
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await editWorkout(other);

  await editWorkout(page);
  await page.getByLabel("Nome do treino").fill("Nome do primeiro");
  await saveWorkout(page);
  await saved(page);

  await other.getByLabel("Nome do treino").fill("Nome do segundo");
  await saveWorkout(other);
  await expect(warning(other)).toBeVisible();

  await page.reload();
  await expect(title(page, "Nome do primeiro")).toBeVisible();
  await context.close();
});

test("treino apagado num aparelho não volta pelo outro", async ({ page, browser, baseURL }) => {
  await createWorkout(page, NAME, ["Supino reto"]);
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await editWorkout(other);

  await page.getByRole("button", { name: "Excluir treino" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /Excluir|Apagar/ }).click();
  await saved(page);

  await addExercise(other, "Agachamento");
  await saveWorkout(other);
  await expect(warning(other)).toBeVisible();

  await page.goto("/app/treinos");
  await expect(title(page, "Treinos")).toBeVisible();
  await expect(page.getByText(NAME)).toHaveCount(0);
  await context.close();
});

test("cada aparelho planeja um dia e os dois ficam", async ({ page, browser, baseURL }) => {
  await page.goto("/app/agenda");
  await expect(page.getByRole("region", { name: "Calendário" })).toBeVisible();
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await expect(other.getByRole("region", { name: "Calendário" })).toBeVisible();

  // as células do mês começam com o dia da semana
  const days = (device: Page) =>
    device
      .getByRole("region", { name: "Calendário" })
      .getByRole("button", { name: /^(domingo|segunda|terça|quarta|quinta|sexta|sábado)/i });
  const rest = async (device: Page, index: number) => {
    await days(device).nth(index).click();
    await device.getByRole("radio", { name: /Descanso/ }).click();
    await device.getByRole("button", { name: "Salvar dia" }).click();
    await saved(device);
  };

  await rest(page, 9);
  await rest(other, 10);

  await page.reload();
  await expect(days(page).nth(9)).toHaveAccessibleName(/Descanso/i);
  await expect(days(page).nth(10)).toHaveAccessibleName(/Descanso/i);
  await context.close();
});

test("editar a série numa tela desatualizada mantém a carga que o outro salvou", async ({ page, browser, baseURL }) => {
  await createWorkout(page, NAME, ["Supino reto"]);
  await page.getByRole("main").getByRole("button", { name: "Iniciar treino" }).click();
  await page.getByRole("spinbutton", { name: "Peso (kg)" }).fill("60");
  await page.getByRole("spinbutton", { name: "Repetições" }).fill("10");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await saved(page);

  const { context, other } = await secondDevice(page, browser, baseURL!);
  await other.getByRole("button", { name: "Editar série" }).click();

  const dialog = (device: Page) => device.getByRole("dialog", { name: "Editar série" });
  await page.getByRole("button", { name: "Editar série" }).click();
  await dialog(page).getByRole("spinbutton", { name: "Peso (kg)" }).fill("72.5");
  await dialog(page).getByRole("button", { name: "Salvar", exact: true }).click();
  await saved(page);

  await dialog(other).getByRole("spinbutton", { name: "Repetições" }).fill("8");
  await dialog(other).getByRole("button", { name: "Salvar", exact: true }).click();
  await saved(other);

  await page.reload();
  await page.getByRole("button", { name: "Editar série" }).click();
  await expect(dialog(page).getByRole("spinbutton", { name: "Peso (kg)" })).toHaveValue("72.5");
  await expect(dialog(page).getByRole("spinbutton", { name: "Repetições" })).toHaveValue("8");
  await context.close();
});
