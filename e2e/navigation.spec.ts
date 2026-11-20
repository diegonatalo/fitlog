import { expect, test } from "@playwright/test";
import { title } from "./fixtures";

const PAGES = [
  { path: "/app", heading: "FitLog" },
  { path: "/app/agenda", heading: "Agenda" },
  { path: "/app/treinos", heading: "Treinos" },
  { path: "/app/biblioteca", heading: "Exercícios" },
  { path: "/app/historico", heading: "Histórico" },
  { path: "/app/cardio", heading: "Cardio" },
  { path: "/app/ajustes", heading: "Ajustes" },
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

test("endereço desconhecido volta para o início do app", async ({ page }) => {
  await page.goto("/nao-existe");
  await expect(page).toHaveURL("/app");
  await expect(title(page, "FitLog")).toBeVisible();
});

const collectErrors = (page: import("@playwright/test").Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

test("a página inicial apresenta o FitLog e leva ao app", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/caderninho/);
  await page.getByRole("main").getByRole("link", { name: "Abrir o FitLog" }).click();
  await expect(page).toHaveURL("/app");
  await expect(title(page, "FitLog")).toBeVisible();
  // A marca no app volta para a página inicial.
  await page.getByRole("link", { name: "FitLog, página inicial" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});

test("os endereços antigos redirecionam para /app", async ({ request }) => {
  for (const [from, to] of [
    ["/agenda", "/app/agenda"],
    ["/treino/novo", "/app/treino/novo"],
    ["/historico/abc", "/app/historico/abc"],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(response.headers().location, from).toBe(to);
  }
});

for (const { path, heading } of [
  { path: "/privacidade", heading: "Privacidade" },
  { path: "/termos", heading: "Termos de uso" },
]) {
  test(`abre ${path} pelo rodapé sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: heading }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
