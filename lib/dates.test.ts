import { describe, expect, it } from "vitest";
import {
  addDays,
  dateKey,
  isDateKey,
  monthGrid,
  parseKey,
  shiftMonth,
  weekdayOf,
} from "@/lib/dates";

describe("dateKey e parseKey", () => {
  it("formata com zeros à esquerda", () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("ida e volta devolvem a mesma chave", () => {
    expect(dateKey(parseKey("2026-11-14"))).toBe("2026-11-14");
  });
});

describe("isDateKey", () => {
  it("aceita datas reais e recusa o resto", () => {
    expect(isDateKey("2026-02-28")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("2026-2-3")).toBe(false);
    expect(isDateKey("amanhã")).toBe(false);
    expect(isDateKey(20260214)).toBe(false);
  });
});

describe("addDays e weekdayOf", () => {
  it("atravessa mês e ano", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("anda no ano bissexto", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("0 é domingo e 6 é sábado", () => {
    expect(weekdayOf("2026-11-15")).toBe(0);
    expect(weekdayOf("2026-11-14")).toBe(6);
  });
});

describe("monthGrid", () => {
  it("começa no domingo e completa as semanas com vazios", () => {
    const weeks = monthGrid(2026, 10); // novembro de 2026 começa num domingo
    expect(weeks[0][0]).toBe("2026-11-01");
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks[weeks.length - 1].at(-1)).toBeNull();
  });

  it("põe vazios antes do dia 1 quando o mês não começa no domingo", () => {
    const weeks = monthGrid(2026, 11); // dezembro de 2026 começa numa terça
    expect(weeks[0].slice(0, 2)).toEqual([null, null]);
    expect(weeks[0][2]).toBe("2026-12-01");
  });

  it("fevereiro bissexto tem 29 dias", () => {
    expect(monthGrid(2028, 1).flat().filter(Boolean)).toHaveLength(29);
  });
});

describe("shiftMonth", () => {
  it("vira o ano nos dois sentidos", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});
