import { describe, expect, it } from "vitest";
import { patterns, paths, signInPath, tabPatterns } from "@/lib/paths";

describe("paths", () => {
  it("monta as rotas com parâmetros", () => {
    expect(paths.exercise("e1")).toBe("/app/exercicio/e1");
    expect(paths.workout("w1")).toBe("/app/treino/w1");
    expect(paths.editWorkout("w1")).toBe("/app/treino/w1/editar");
    expect(paths.session("s1")).toBe("/app/sessao/s1");
    expect(paths.sessionDetail("s1")).toBe("/app/historico/s1");
  });

  it("cada rota gerada casa com o padrão de mesmo nome", () => {
    const toRegex = (pattern: string) =>
      new RegExp(`^${pattern.replace(/:\w+/g, "[^/]+")}$`);

    expect(toRegex(patterns.exercise).test(paths.exercise("abc"))).toBe(true);
    expect(toRegex(patterns.workout).test(paths.workout("abc"))).toBe(true);
    expect(toRegex(patterns.editWorkout).test(paths.editWorkout("abc"))).toBe(true);
    expect(toRegex(patterns.session).test(paths.session("abc"))).toBe(true);
    expect(toRegex(patterns.sessionDetail).test(paths.sessionDetail("abc"))).toBe(true);
  });

  it("o link de login guarda a página de volta, menos quando é o início do app", () => {
    expect(signInPath()).toBe("/entrar");
    expect(signInPath("/app")).toBe("/entrar");
    expect(signInPath("/app/treino/abc?x=1")).toBe("/entrar?de=%2Fapp%2Ftreino%2Fabc%3Fx%3D1");
  });

  it("as abas da barra inferior são as cinco telas principais", () => {
    expect(tabPatterns).toEqual([
      patterns.home,
      patterns.schedule,
      patterns.workouts,
      patterns.history,
      patterns.cardio,
    ]);
  });
});
