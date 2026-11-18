import { describe, expect, it } from "vitest";
import { parseSetInput } from "@/lib/set-input";
import { loadTypeMeta } from "@/types";

const weight = loadTypeMeta("weight");
const bodyweight = loadTypeMeta("bodyweight");
const time = loadTypeMeta("time");

describe("parseSetInput", () => {
  it("lê carga e repetições válidas", () => {
    expect(parseSetInput("60", "10", weight)).toEqual({ load: 60, reps: 10, valid: true });
    expect(parseSetInput("22.5", "8", weight)).toEqual({ load: 22.5, reps: 8, valid: true });
  });

  it("recusa carga vazia, zero ou negativa quando o tipo não aceita zero", () => {
    expect(parseSetInput("", "10", weight).valid).toBe(false);
    expect(parseSetInput("0", "10", weight).valid).toBe(false);
    expect(parseSetInput("-5", "10", weight).valid).toBe(false);
  });

  it("aceita carga zero no peso corporal, mas não negativa", () => {
    expect(parseSetInput("0", "12", bodyweight).valid).toBe(true);
    expect(parseSetInput("-1", "12", bodyweight).valid).toBe(false);
  });

  it("recusa repetições vazias ou zero", () => {
    expect(parseSetInput("60", "", weight).valid).toBe(false);
    expect(parseSetInput("60", "0", weight).valid).toBe(false);
  });

  it("em exercícios por tempo, ignora as repetições e conta 1", () => {
    expect(parseSetInput("20", "", time)).toEqual({ load: 20, reps: 1, valid: true });
  });
});
