import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../src/game";
import { buildStory, getNames } from "../src/story";

const TEMPLATE = `
  <div id="game-container">
    <h2 id="scene-title"></h2>
    <div id="text-box"></div>
    <div id="choices-container"></div>
    <div id="navigation-container">
      <button id="next-btn" class="nav-btn">Começar</button>
    </div>
  </div>`;

const $ = (sel: string) => document.querySelector<HTMLElement>(sel);
const nextBtn = () => $("#next-btn") as HTMLButtonElement;
const choiceButtons = () => [...document.querySelectorAll<HTMLButtonElement>(".choice-btn")];

function setup(jolee = false, photos: string[] = []) {
  document.body.innerHTML = TEMPLATE;
  const onRestart = vi.fn();
  const story = buildStory(jolee);
  const game = new Game({
    root: document.body,
    story,
    names: getNames(jolee),
    photos,
    onRestart,
  });
  game.showInitialScreen();
  return { game, story, onRestart };
}

describe("Game", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra a tela inicial", () => {
    setup();
    expect($("#scene-title")?.innerText).toBe("Nossa História de Amor");
    expect(nextBtn().innerText).toBe("Começar");
  });

  it("avança para o primeiro capítulo com os nomes trocados", () => {
    setup();
    nextBtn().click();
    expect($("#scene-title")?.innerText).toBe("Capítulo 1: O Encontro na UFG");
    expect($("#text-box")?.innerHTML).toContain("Mozinha");
    expect($("#text-box")?.innerHTML).not.toContain("${");
  });

  it("esconde 'Próximo' até escolher, depois mostra resultado e epílogo", () => {
    const { game, story } = setup();
    const idx = story.findIndex((s) => s.choices);
    while (game.sceneIndex < idx) nextBtn().click();

    expect(nextBtn().classList.contains("hidden")).toBe(true);
    expect(choiceButtons()).toHaveLength(story[idx].choices?.length ?? 0);

    choiceButtons()[1].click();

    expect(nextBtn().classList.contains("hidden")).toBe(false);
    expect(choiceButtons()).toHaveLength(0);
    expect($("#text-box")?.innerHTML).toContain("mais gente pra conversar");
    expect($("#text-box")?.innerHTML).toContain("filme Nerve");
  });

  it("chega ao fim sem fotos no modo padrão e reinicia", () => {
    const { story, onRestart } = setup();
    for (let i = 0; i < story.length; i++) {
      nextBtn().click();
      choiceButtons()[0]?.click();
    }
    expect(nextBtn().innerText).toBe("Feliz Aniversário, meu amor!");
    nextBtn().click();

    expect(document.body.textContent).toContain("A nossa história continua...");
    expect($("#final-photos")).toBeNull();
    ($("#restart-btn") as HTMLButtonElement).click();
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("mostra as fotos no fim do modo jolee", () => {
    const { story } = setup(true, ["a.jpg", "b.jpg"]);
    for (let i = 0; i <= story.length; i++) {
      choiceButtons()[0]?.click();
      nextBtn().click();
    }
    const imgs = document.querySelectorAll("#final-photos img");
    expect(imgs).toHaveLength(2);
  });
});
