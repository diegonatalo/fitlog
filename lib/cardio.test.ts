import { describe, expect, it } from "vitest";
import {
  ZONES,
  compare,
  estimate,
  maxHeartRate,
  oxygenCost,
  tips,
  zoneFor,
} from "@/lib/cardio";
import type { CardioProfile } from "@/types";

const profile: CardioProfile = { weightKg: 70, age: 30, sex: "male" };

describe("maxHeartRate", () => {
  it("usa Tanaka para homens e Gulati para mulheres", () => {
    expect(maxHeartRate(30, "male")).toBe(187);
    expect(maxHeartRate(30, "female")).toBe(180);
  });
});

describe("oxygenCost", () => {
  it("usa a equação de caminhada abaixo de 8 km/h", () => {
    // 6 km/h = 100 m/min: 3,5 + 0,1·100 + 1,8·100·0,05
    expect(oxygenCost({ speedKmh: 6, inclinePct: 5, minutes: 30 })).toBeCloseTo(22.5);
  });

  it("usa a equação de corrida a partir de 8 km/h", () => {
    // 12 km/h = 200 m/min: 3,5 + 0,2·200 + 0,9·200·0,02
    expect(oxygenCost({ speedKmh: 12, inclinePct: 2, minutes: 30 })).toBeCloseTo(47.1);
  });

  it("a inclinação aumenta o custo de oxigênio", () => {
    const flat = oxygenCost({ speedKmh: 6, inclinePct: 0, minutes: 30 });
    const steep = oxygenCost({ speedKmh: 6, inclinePct: 10, minutes: 30 });
    expect(steep).toBeGreaterThan(flat);
  });
});

describe("zoneFor", () => {
  it.each([
    [0, 1],
    [0.39, 1],
    [0.4, 2],
    [0.6, 3],
    [0.8, 4],
    [0.9, 5],
    [1, 5],
  ])("intensidade %s cai na zona %s", (intensity, zone) => {
    expect(zoneFor(intensity).id).toBe(zone);
  });

  it("as zonas começam em ordem crescente", () => {
    const starts = ZONES.map((zone) => zone.from);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });
});

describe("estimate", () => {
  const input = { speedKmh: 6, inclinePct: 5, minutes: 30 };

  it("calcula calorias proporcionais ao tempo", () => {
    const result = estimate(input, profile);
    expect(result.kcalPerMin).toBeCloseTo((22.5 * 70 * 5) / 1000);
    expect(result.kcal).toBe(Math.round(result.kcalPerMin * 30));
  });

  it("mantém a frequência cardíaca entre repouso e máxima", () => {
    const result = estimate(input, profile);
    expect(result.maxHr).toBe(187);
    expect(result.avgHr).toBeGreaterThan(70);
    expect(result.avgHr).toBeLessThanOrEqual(result.maxHr);
  });

  it("limita a intensidade a 1 em esforços extremos", () => {
    const result = estimate({ speedKmh: 25, inclinePct: 20, minutes: 10 }, profile);
    expect(result.intensity).toBe(1);
    expect(result.zone.id).toBe(5);
    expect(result.avgHr).toBe(result.maxHr);
  });

  it("limita a intensidade a 0 em esforços abaixo do repouso", () => {
    const result = estimate({ speedKmh: 0, inclinePct: 0, minutes: 10 }, profile);
    expect(result.intensity).toBe(0);
    expect(result.zone.id).toBe(1);
  });

  it("uma pessoa mais pesada gasta mais calorias no mesmo esforço", () => {
    const light = estimate(input, { ...profile, weightKg: 60 });
    const heavy = estimate(input, { ...profile, weightKg: 90 });
    expect(heavy.kcal).toBeGreaterThan(light.kcal);
  });
});

describe("compare", () => {
  const input = { speedKmh: 6, inclinePct: 5, minutes: 30 };

  it("cria uma curva por inclinação, incluindo a do usuário, em ordem", () => {
    const { curves } = compare(input, profile, "kcal");
    expect(curves.map((curve) => curve.incline)).toEqual([0, 5, 6, 12, 18]);
  });

  it("não repete a inclinação quando ela já está na base", () => {
    const { curves } = compare({ ...input, inclinePct: 6 }, profile, "kcal");
    expect(curves.map((curve) => curve.incline)).toEqual([0, 6, 12, 18]);
  });

  it("cobre de 3 a 12 km/h em passos de 0,5 e amplia para a velocidade do usuário", () => {
    const { speeds } = compare(input, profile, "hr");
    expect(speeds[0]).toBe(3);
    expect(speeds.at(-1)).toBe(12);
    expect(speeds[1] - speeds[0]).toBe(0.5);

    const fast = compare({ ...input, speedKmh: 14.2 }, profile, "hr").speeds;
    expect(fast.at(-1)).toBe(15);
  });

  it("cada curva tem um ponto por velocidade, com a métrica escolhida", () => {
    const kcal = compare(input, profile, "kcal");
    const hr = compare(input, profile, "hr");
    expect(kcal.curves[0].points).toHaveLength(kcal.speeds.length);

    const direct = estimate({ ...input, speedKmh: 6, inclinePct: 0 }, profile);
    const point = (c: typeof kcal, speed: number) =>
      c.curves[0].points.find((p) => p.speed === speed)!.value;
    expect(point(kcal, 6)).toBe(direct.kcal);
    expect(point(hr, 6)).toBe(direct.avgHr);
  });
});

describe("tips", () => {
  const titles = (input: Parameters<typeof tips>[0]) => {
    const result = estimate(input, profile);
    return tips(input, profile, result).map((tip) => tip.title);
  };

  it("sempre começa com a dica da zona", () => {
    const input = { speedKmh: 6, inclinePct: 5, minutes: 30 };
    const result = estimate(input, profile);
    expect(tips(input, profile, result)[0].title).toBe(
      { 1: "Ritmo de aquecimento", 2: "Zona de base", 3: "Zona aeróbica", 4: "Zona intensa", 5: "Perto do limite" }[
        result.zone.id
      ],
    );
  });

  it("sugere mais inclinação em esforço leve", () => {
    expect(titles({ speedKmh: 4, inclinePct: 0, minutes: 30 })).toContain("Mais gasto sem correr");
  });

  it("não sugere subir a inclinação quando já está no máximo", () => {
    expect(titles({ speedKmh: 4, inclinePct: 20, minutes: 30 })).not.toContain(
      "Mais gasto sem correr",
    );
  });

  it("avisa para soltar as barras em caminhada muito inclinada", () => {
    expect(titles({ speedKmh: 5, inclinePct: 10, minutes: 30 })).toContain("Solte as barras");
    expect(titles({ speedKmh: 10, inclinePct: 10, minutes: 30 })).not.toContain("Solte as barras");
  });

  it("recomenda mais tempo em sessões curtas e leves", () => {
    expect(titles({ speedKmh: 4, inclinePct: 0, minutes: 10 })).toContain("Tempo de sessão");
  });

  it("avisa sobre sessões longas e intensas", () => {
    expect(titles({ speedKmh: 14, inclinePct: 10, minutes: 90 })).toContain("Sessão longa demais");
  });
});
