import { describe, expect, it } from "vitest";
import {
  DEFAULT_REST_SECONDS,
  MAX_REST_SECONDS,
  MIN_REST_SECONDS,
  clampRest,
} from "@/lib/rest";

describe("clampRest", () => {
  it("mantém valores dentro do limite", () => {
    expect(clampRest(75)).toBe(75);
  });

  it("arredonda para segundos inteiros", () => {
    expect(clampRest(74.6)).toBe(75);
  });

  it("limita ao mínimo e ao máximo", () => {
    expect(clampRest(0)).toBe(MIN_REST_SECONDS);
    expect(clampRest(-30)).toBe(MIN_REST_SECONDS);
    expect(clampRest(99999)).toBe(MAX_REST_SECONDS);
  });

  it("valores inválidos voltam ao padrão", () => {
    expect(clampRest(Number.NaN)).toBe(DEFAULT_REST_SECONDS);
    expect(clampRest(Infinity)).toBe(DEFAULT_REST_SECONDS);
  });
});
