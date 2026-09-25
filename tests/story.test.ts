import { describe, expect, it } from "vitest";
import {
  buildStory,
  getNames,
  isJoleeMode,
  NOME_DELA_JOLEE,
  NOME_DELA_PADRAO,
  NOME_DELE,
  replaceNames,
  type Scene,
} from "../src/story";

const allTexts = (scene: Scene): string[] => [
  scene.title,
  ...scene.text,
  ...(scene.choices ?? []).flatMap((c) => [c.text, c.outcome]),
  ...(scene.epilogue ? [scene.epilogue] : []),
];

describe("isJoleeMode", () => {
  it.each([
    ["?jolee", true],
    ["?jolee=1", true],
    ["?foo=bar&jolee", true],
    ["", false],
    ["?foo=jolee", false],
  ])("%j -> %s", (search, expected) => {
    expect(isJoleeMode(search)).toBe(expected);
  });
});

describe("getNames / replaceNames", () => {
  it("usa o nome padrão sem ?jolee", () => {
    expect(getNames(false)).toEqual({ dele: NOME_DELE, dela: NOME_DELA_PADRAO });
  });

  it("troca o nome dela com ?jolee", () => {
    expect(getNames(true)).toEqual({ dele: NOME_DELE, dela: NOME_DELA_JOLEE });
  });

  it("substitui todos os marcadores", () => {
    const text = "${NOME_DELE} e ${NOME_DELA}, ${NOME_DELE}!";
    expect(replaceNames(text, getNames(true))).toBe("Lee e Joropopo, Lee!");
    expect(replaceNames(text, getNames(false))).toBe("Lee e Mozinha, Lee!");
  });
});

describe.each([false, true])("buildStory(jolee=%s)", (jolee) => {
  const story = buildStory(jolee);
  const names = getNames(jolee);

  it("tem o número certo de capítulos", () => {
    expect(story).toHaveLength(jolee ? 10 : 9);
  });

  it("só inclui 'Pontes Aéreas' no modo jolee", () => {
    const has = story.some((s) => s.title.includes("Pontes Aéreas"));
    expect(has).toBe(jolee);
  });

  it("termina com um único capítulo final", () => {
    expect(story.at(-1)?.final).toBe(true);
    expect(story.filter((s) => s.final)).toHaveLength(1);
  });

  it("todo capítulo tem título e texto", () => {
    for (const scene of story) {
      expect(scene.title.trim()).not.toBe("");
      expect(scene.text.length).toBeGreaterThan(0);
    }
  });

  it("toda escolha tem texto e resultado, e todo capítulo com escolhas tem epílogo", () => {
    for (const scene of story.filter((s) => s.choices)) {
      expect(scene.choices?.length).toBeGreaterThanOrEqual(2);
      for (const choice of scene.choices ?? []) {
        expect(choice.text.trim()).not.toBe("");
        expect(choice.outcome.trim()).not.toBe("");
      }
      expect(scene.epilogue?.trim()).toBeTruthy();
    }
  });

  it("não sobra nenhum marcador depois de trocar os nomes", () => {
    for (const scene of story) {
      for (const text of allTexts(scene)) {
        expect(replaceNames(text, names)).not.toMatch(/\$\{/);
      }
    }
  });

  it("o nome dela aparece na história e o outro nome não", () => {
    const other = jolee ? NOME_DELA_PADRAO : NOME_DELA_JOLEE;
    const full = story
      .flatMap(allTexts)
      .map((t) => replaceNames(t, names))
      .join("\n");
    expect(full).toContain(names.dela);
    expect(full).not.toContain(other);
  });
});
