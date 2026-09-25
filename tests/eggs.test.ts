import { describe, expect, it, vi } from "vitest";
import { createClickCounter, createWordListener, huskyRun, shout } from "../src/eggs";

const type = (listen: (key: string) => void, text: string) => [...text].forEach(listen);

describe("palavras secretas", () => {
  it("reconhece a palavra no meio de outras teclas, sem diferenciar maiúsculas", () => {
    const onWord = vi.fn();
    const listen = createWordListener(["bolt", "luna"], onWord);
    type(listen, "xxBoL");
    listen("Shift");
    listen("t");
    expect(onWord).toHaveBeenCalledWith("bolt");
    type(listen, "luna");
    expect(onWord).toHaveBeenLastCalledWith("luna");
    expect(onWord).toHaveBeenCalledTimes(2);
  });

  it("não dispara com a palavra incompleta", () => {
    const onWord = vi.fn();
    const listen = createWordListener(["luna"], onWord);
    type(listen, "lun");
    expect(onWord).not.toHaveBeenCalled();
  });
});

describe("cliques seguidos", () => {
  it("dispara com 5 cliques rápidos, mas não com cliques espaçados", () => {
    let t = 0;
    const onBurst = vi.fn();
    const click = createClickCounter(5, 1000, onBurst, () => t);
    for (let i = 0; i < 5; i++) {
      click();
      t += 600;
    }
    expect(onBurst).not.toHaveBeenCalled();
    for (let i = 0; i < 5; i++) {
      click();
      t += 100;
    }
    expect(onBurst).toHaveBeenCalledOnce();
  });
});

describe("animações dos easter eggs", () => {
  it("o husky corre e some no fim", () => {
    const layer = document.createElement("div");
    const run = huskyRun(layer, "Luna");
    expect(layer.textContent).toContain("Luna!");
    run.dispatchEvent(new Event("animationend"));
    expect(layer.children).toHaveLength(0);
  });

  it("o grito aparece e some", () => {
    const layer = document.createElement("div");
    const el = shout(layer, "AUUUUU!");
    expect(layer.textContent).toBe("AUUUUU!");
    el.dispatchEvent(new Event("animationend"));
    expect(layer.children).toHaveLength(0);
  });
});
