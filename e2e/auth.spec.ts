import { expect, test } from "@playwright/test";
import { PASSWORD, createWorkout, signUpByApi, title, uniqueEmail } from "./fixtures";

test("sem login, o app manda para entrar e volta para a página pedida depois", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();

  await page.goto("/app/historico");
  await expect(page).toHaveURL("/entrar?de=%2Fapp%2Fhistorico");

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/app/historico");
  await expect(title(page, "Histórico")).toBeVisible();
});

test("cria a conta pela tela, os dados ficam na conta e voltam ao entrar de novo", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Ana");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL("/app");

  // A conta nova já vem com os treinos de exemplo.
  await page.goto("/app/treinos");
  await expect(page.getByRole("link", { name: /Push/ })).toBeVisible();

  await createWorkout(page, "Treino da Ana", ["Supino reto"]);
  await page.reload();
  await expect(title(page, "Treino da Ana")).toBeVisible();

  await page.goto("/app/ajustes");
  await expect(page.getByRole("main").getByText(email)).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/app");
  await expect(page).toHaveURL("/entrar");

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/app");
  await page.goto("/app/treinos");
  await expect(page.getByRole("link", { name: /Treino da Ana/ })).toBeVisible();
});

test("senha errada mostra o erro e não entra", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-errada-000");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
  await expect(page).toHaveURL("/entrar");
});

test("não cria duas contas com o mesmo e-mail", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Outra pessoa");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Já existe uma conta com esse e-mail");
});

test("uma conta não vê os dados de outra", async ({ browser, baseURL }) => {
  const ana = await browser.newContext({ baseURL });
  const anaPage = await ana.newPage();
  await signUpByApi(anaPage.request, baseURL!);
  await createWorkout(anaPage, "Só da Ana", ["Supino reto"]);

  const bia = await browser.newContext({ baseURL });
  const biaPage = await bia.newPage();
  await signUpByApi(biaPage.request, baseURL!);
  await biaPage.goto("/app/treinos");
  await expect(biaPage.getByRole("link", { name: /Push/ })).toBeVisible();
  await expect(biaPage.getByText("Só da Ana")).toHaveCount(0);

  await ana.close();
  await bia.close();
});

test("excluir a conta apaga tudo e não deixa entrar de novo", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.goto("/app/ajustes");
  await page.getByRole("button", { name: "Excluir conta" }).click();
  await page.getByRole("alertdialog").getByLabel("Sua senha").fill(PASSWORD);
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir conta" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
});

test("excluir a conta com a senha errada não apaga nada", async ({ page, baseURL }) => {
  await signUpByApi(page.request, baseURL!);
  await page.goto("/app/ajustes");
  await page.getByRole("button", { name: "Excluir conta" }).click();
  await page.getByRole("alertdialog").getByLabel("Sua senha").fill("senha-errada-123");
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir conta" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Senha incorreta. A conta não foi excluída.");

  await page.reload();
  await expect(page.getByRole("button", { name: "Excluir conta" })).toBeVisible();
});
