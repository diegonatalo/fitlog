import { test as anonymous, type Page } from "@playwright/test";
import { expect, test, title } from "./fixtures";

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

const PAGES = [
  { path: "/app", heading: "Hoje" },
  { path: "/app/agenda", heading: "Agenda" },
  { path: "/app/treinos", heading: "Treinos" },
  { path: "/app/biblioteca", heading: "Exercícios" },
  { path: "/app/historico", heading: "Histórico" },
  { path: "/app/progresso", heading: "Progresso" },
  { path: "/app/cardio", heading: "Cardio" },
  { path: "/app/ajustes", heading: "Ajustes" },
];

for (const { path, heading } of PAGES) {
  test(`abre ${path} sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await expect(title(page, heading)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

// sem conferir o console: o Chromium registra a própria resposta 404 como erro
test("a 404 avisa e leva de volta ao início do app", async ({ page }) => {
  await page.goto("/nao-existe");
  await expect(title(page, "Página não encontrada")).toBeVisible();
  await page.getByRole("link", { name: "Voltar para o app" }).click();
  await expect(page).toHaveURL("/app");
  await expect(title(page, "Hoje")).toBeVisible();
});

anonymous("a página inicial apresenta o FitLog e leva ao login", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/caderninho/);
  await page.getByRole("main").getByRole("link", { name: "Abrir o app" }).click();
  await expect(page).toHaveURL("/entrar");
  await expect(page.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible();
  // A marca volta para a página inicial.
  await page.getByRole("link", { name: "FitLog, página inicial" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});

test("a marca no app volta para a página inicial", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("link", { name: "FitLog, página inicial" }).click();
  await expect(page).toHaveURL("/");
});

anonymous("os endereços antigos redirecionam para /app", async ({ request }) => {
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
  anonymous(`abre ${path} pelo rodapé sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: heading }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const { path, heading } of [
  { path: "/entrar", heading: "Entrar" },
  { path: "/cadastro", heading: "Criar conta" },
]) {
  anonymous(`abre ${path} sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
