import { describe, expect, it } from "vitest";
import { MemoryMap, renderMapSvg, storyPlaces, visitedPlaces } from "../src/memory-map";
import { buildStory } from "../src/story";

describe("mapa das memórias", () => {
  const story = buildStory(false);

  it("lista os lugares na ordem da história, sem repetir", () => {
    expect(visitedPlaces(story, -1)).toEqual([]);
    expect(visitedPlaces(story, 0)).toEqual(["ufg"]);
    expect(visitedPlaces(story, 2)).toEqual(["ufg", "flamboyant"]);
    expect(storyPlaces(story)).toEqual(["ufg", "flamboyant", "banana", "mutirama", "casa"]);
  });

  it("São Paulo só aparece no modo jolee", () => {
    expect(storyPlaces(story)).not.toContain("sao-paulo");
    expect(storyPlaces(buildStory(true))).toContain("sao-paulo");
  });

  it("esconde o nome dos lugares que ainda não apareceram", () => {
    const svg = renderMapSvg(story, 1);
    expect(svg).toContain("UFG");
    expect(svg).toContain("Flamboyant");
    expect(svg).not.toContain("Mutirama");
    expect(svg).toContain("???");
    expect(svg).toContain('class="route"');
  });

  it("abre, acende os lugares e fecha", () => {
    document.body.innerHTML = `
      <button id="b"></button>
      <dialog id="d"><div id="m"></div><button data-close>Fechar</button></dialog>`;
    const button = document.querySelector("#b") as HTMLButtonElement;
    const dialog = document.querySelector("#d") as HTMLDialogElement;
    const body = document.querySelector("#m") as HTMLElement;
    const map = new MemoryMap(button, dialog, body, story);

    expect(body.querySelectorAll(".pin.on")).toHaveLength(0);
    map.update(3);
    expect(body.querySelectorAll(".pin.on")).toHaveLength(3);
    expect(button.classList.contains("ping")).toBe(true);

    button.click();
    expect(dialog.open).toBe(true);
    (dialog.querySelector("[data-close]") as HTMLElement).click();
    expect(dialog.open).toBe(false);
  });
});
