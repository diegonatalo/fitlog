import { describe, expect, it } from "vitest";
import { THEME_KEY, uid } from "@/lib/storage";

describe("chave do tema", () => {
  it("segue o formato <projeto>:<nome>:v1", () => {
    expect(THEME_KEY).toMatch(/^fitlog:[a-z-]+:v1$/);
  });
});

describe("uid", () => {
  it("gera ids diferentes", () => {
    expect(new Set(Array.from({ length: 50 }, uid)).size).toBe(50);
  });
});
