import { describe, expect, it } from "vitest";
import { playScenery, sceneryPlan } from "../src/scenery";
import { buildStory, type Scenery } from "../src/story";

const KINDS: Scenery[] = [
  "estudos",
  "cinema",
  "segredo",
  "lanche",
  "montanha-russa",
  "bolt",
  "luna",
  "casa",
  "aviao",
  "fogos",
];

describe("sceneryPlan", () => {
  it.each(KINDS)("%s tem animações com posição e tempo válidos", (kind) => {
    const plan = sceneryPlan(kind);
    expect(plan.length).toBeGreaterThan(0);
    for (const sprite of plan) {
      expect(sprite.text.trim()).not.toBe("");
      expect(sprite.duration).toBeGreaterThan(0);
      expect(sprite.delay).toBeGreaterThanOrEqual(0);
    }
  });

  it("cinema tem pipoca caindo", () => {
    const plan = sceneryPlan("cinema");
    expect(plan.some((s) => s.text === "🍿")).toBe(true);
    expect(plan.every((s) => s.motion === "fall")).toBe(true);
  });

  it("Bolt deixa um rastro de pegadas em sequência", () => {
    const paws = sceneryPlan("bolt").filter((s) => s.motion === "paw");
    expect(paws.length).toBeGreaterThan(5);
    const delays = paws.map((p) => p.delay);
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
  });

  it("todo capítulo da história tem uma animação", () => {
    for (const scene of buildStory(true)) expect(scene.scenery).toBeDefined();
  });
});

describe("playScenery", () => {
  it("desenha as animações e limpa ao trocar", () => {
    const layer = document.createElement("div");
    playScenery(layer, "cinema", () => 0.5);
    expect(layer.children.length).toBe(sceneryPlan("cinema", () => 0.5).length);
    const first = layer.children[0] as HTMLElement;
    expect(first.className).toBe("sprite fall");
    expect(first.style.animationDuration).toMatch(/ms$/);

    playScenery(layer, "fogos", () => 0.5);
    expect(layer.querySelector(".fall")).toBeNull();
    expect((layer.children[0] as HTMLElement).style.getPropertyValue("--dx")).toMatch(/px$/);

    playScenery(layer, null);
    expect(layer.children).toHaveLength(0);
  });
});
