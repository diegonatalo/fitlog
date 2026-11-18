import { expect, test } from "@playwright/test";
import { title } from "./fixtures";

const PAGES = [
  { path: "/", heading: "FitLog" },
  { path: "/agenda", heading: "Agenda" },
  { path: "/treinos", heading: "Treinos" },
  { path: "/biblioteca", heading: "Exercícios" },
  { path: "/historico", heading: "Histórico" },
  { path: "/cardio", heading: "Cardio" },
  { path: "/ajustes", heading: "Ajustes" },
];

for (const { path, heading } of PAGES) {
  test(`abre ${path} sem erros no console`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(path);
    await expect(title(page, heading)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("endereço desconhecido volta para o início", async ({ page }) => {
  await page.goto("/nao-existe");
  await expect(page).toHaveURL("/");
  await expect(title(page, "FitLog")).toBeVisible();
});
