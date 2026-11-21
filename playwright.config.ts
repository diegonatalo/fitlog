import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const CI = Boolean(process.env.CI);

// Roda contra o build de produção. No CI o `pnpm build` já rodou no passo anterior.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: CI ? `pnpm start --port ${PORT}` : `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 180_000,
    // O banco vem do DATABASE_URL (no CI, um Postgres só para os testes; aqui,
    // a branch de dev do Neon no .env.local). Cada teste cria a própria conta,
    // então o limite de tentativas de login fica desligado.
    env: {
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      AUTH_RATE_LIMIT: "off",
    },
  },
});
