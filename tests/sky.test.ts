import { describe, expect, it } from "vitest";
import { heartPoint, heartShape } from "../src/sky";

describe("heartPoint", () => {
  it("começa no vão de cima do coração e desce até a ponta", () => {
    const top = heartPoint(0);
    const tip = heartPoint(Math.PI);
    expect(top.x).toBeCloseTo(0);
    expect(tip.x).toBeCloseTo(0);
    // y cresce para baixo: a ponta fica abaixo do vão.
    expect(tip.y).toBeGreaterThan(top.y);
  });

  it("é simétrico", () => {
    const a = heartPoint(1);
    const b = heartPoint(Math.PI * 2 - 1);
    expect(a.x).toBeCloseTo(-b.x);
    expect(a.y).toBeCloseTo(b.y);
  });
});

describe("heartShape", () => {
  it("gera a quantidade pedida de pontos em volta do centro", () => {
    const center = { x: 200, y: 100 };
    const points = heartShape(60, center, 5);
    expect(points).toHaveLength(60);
    for (const p of points) {
      expect(Math.abs(p.x - center.x)).toBeLessThanOrEqual(16 * 5 + 1e-9);
      expect(Math.abs(p.y - center.y)).toBeLessThanOrEqual(17 * 5 + 1e-9);
    }
  });
});
