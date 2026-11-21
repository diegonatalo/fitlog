import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";

export const PASSWORD = "senha-de-teste-123";

/** E-mail único por teste: cada um começa com uma conta nova e vazia. */
export const uniqueEmail = () =>
  `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@fitlog.test`;

/**
 * Cria uma conta pela API do Better Auth. A resposta já traz o cookie de
 * sessão, que fica no contexto do navegador do teste.
 */
export const signUpByApi = async (request: APIRequestContext, baseURL: string, email = uniqueEmail()) => {
  const response = await request.post("/api/auth/sign-up/email", {
    data: { name: "Pessoa de Teste", email, password: PASSWORD },
    headers: { origin: baseURL },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return email;
};

/**
 * Testes do app: cada um roda com uma conta nova, já logada. Para testar sem
 * login, use o `test` do próprio Playwright.
 */
export const test = base.extend({
  page: async ({ page, baseURL }, provide) => {
    await signUpByApi(page.request, baseURL!);
    await provide(page);
  },
});

export { expect };

/** Espera as mudanças chegarem ao banco (o app salva em segundo plano). */
export const saved = (page: Page) => expect(page.locator("[data-saving]")).toHaveCount(0);

/** Cria um treino pela tela "Novo treino" com exercícios da biblioteca. */
export const createWorkout = async (page: Page, name: string, exercises: string[]) => {
  await page.goto("/app/treino/novo");
  await page.getByLabel("Nome do treino").fill(name);
  for (const exercise of exercises) {
    await page.getByLabel("Buscar exercício").fill(exercise);
    await page.getByRole("button", { name: new RegExp(exercise), pressed: false }).first().click();
  }
  await page.getByRole("button", { name: "Criar treino" }).click();
  await expect(page).toHaveURL(/\/treino\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await saved(page);
};

export const title = (page: Page, name: string) =>
  page.getByRole("heading", { level: 1, name, exact: true });
