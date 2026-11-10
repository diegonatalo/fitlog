import { describe, expect, it } from "vitest";
import { patterns, paths, tabPatterns } from "@/lib/paths";

describe("paths", () => {
  it("monta as rotas com parâmetros", () => {
    expect(paths.exercise("e1")).toBe("/exercicio/e1");
    expect(paths.workout("w1")).toBe("/treino/w1");
    expect(paths.editWorkout("w1")).toBe("/treino/w1/editar");
    expect(paths.session("s1")).toBe("/sessao/s1");
    expect(paths.sessionDetail("s1")).toBe("/historico/s1");
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

  it("as abas da barra inferior são as quatro telas principais", () => {
    expect(tabPatterns).toEqual([
      patterns.home,
      patterns.library,
      patterns.history,
      patterns.cardio,
    ]);
  });
});
