// Coraçõezinhos que sobem e somem, usados nas escolhas e no final.

const SYMBOLS = ["❤", "💕", "💖", "✨", "💗"];

export function burstHearts(layer: HTMLElement, x: number, y: number, count = 12): HTMLElement[] {
  const hearts: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = SYMBOLS[i % SYMBOLS.length];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 220)}px`);
    heart.style.setProperty("--dy", `${Math.round(-120 - Math.random() * 180)}px`);
    heart.style.setProperty("--rot", `${Math.round((Math.random() - 0.5) * 70)}deg`);
    heart.style.setProperty("--delay", `${Math.round(Math.random() * 180)}ms`);
    heart.style.fontSize = `${14 + Math.random() * 16}px`;
    heart.addEventListener("animationend", () => heart.remove());
    layer.appendChild(heart);
    hearts.push(heart);
  }
  return hearts;
}
