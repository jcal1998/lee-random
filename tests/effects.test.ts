import { describe, expect, it } from "vitest";
import { burstHearts } from "../src/effects";

describe("burstHearts", () => {
  it("cria coraçõezinhos no ponto pedido e remove cada um no fim da animação", () => {
    const layer = document.createElement("div");
    const hearts = burstHearts(layer, 50, 80, 5);

    expect(layer.children).toHaveLength(5);
    expect(hearts[0].style.left).toBe("50px");
    expect(hearts[0].style.top).toBe("80px");

    hearts[0].dispatchEvent(new Event("animationend"));
    expect(layer.children).toHaveLength(4);
  });
});
