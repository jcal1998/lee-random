// Animações de fundo, uma para cada capítulo: pipoca caindo no cinema,
// pegadas de husky, aviãozinho cruzando o céu...
import type { Scenery } from "./story";

export type Motion = "fall" | "rise" | "cross" | "cross-back" | "coaster" | "paw" | "burst";

export interface Sprite {
  text: string;
  motion: Motion;
  /** Posição inicial, em % da tela. */
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  /** Deslocamento final (só no "burst"), em px. */
  dx?: number;
  dy?: number;
}

type Rng = () => number;

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

/** Coisas caindo (ou subindo) espalhadas pela tela, cada uma no seu tempo. */
function scatter(emojis: string[], count: number, motion: "fall" | "rise", rng: Rng): Sprite[] {
  return Array.from({ length: count }, () => ({
    text: pick(emojis, rng),
    motion,
    x: rng() * 96 + 2,
    y: motion === "fall" ? -8 : 105,
    delay: Math.round(rng() * 9000),
    duration: Math.round(8000 + rng() * 6000),
    size: Math.round(18 + rng() * 16),
  }));
}

/** Pegadas atravessando a parte de baixo da tela, uma depois da outra. */
function pawTrail(backwards: boolean): Sprite[] {
  const steps = 14;
  const duration = steps * 280 + 2200;
  return Array.from({ length: steps }, (_, i) => ({
    text: "🐾",
    motion: "paw" as const,
    x: backwards ? 94 - i * 7 : 3 + i * 7,
    y: 88 + (i % 2 ? 3 : 0),
    delay: i * 280,
    duration,
    size: 22,
  }));
}

function crossing(text: string, y: number, delay: number, duration: number, size = 40): Sprite {
  return { text, motion: "cross", x: 0, y, delay, duration, size };
}

function fireworks(rng: Rng): Sprite[] {
  const sprites: Sprite[] = [];
  for (let b = 0; b < 4; b++) {
    const x = 15 + rng() * 70;
    const y = 10 + rng() * 35;
    const delay = b * 1400;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 90 + rng() * 40;
      sprites.push({
        text: pick(["✨", "💖", "⭐", "💗"], rng),
        motion: "burst",
        x,
        y,
        delay,
        duration: 5600,
        size: 16,
        dx: Math.round(Math.cos(angle) * dist),
        dy: Math.round(Math.sin(angle) * dist),
      });
    }
  }
  return sprites;
}

/** O que aparece no fundo de cada capítulo. */
export function sceneryPlan(kind: Scenery, rng: Rng = Math.random): Sprite[] {
  switch (kind) {
    case "estudos":
      return scatter(["∫", "π", "√x", "∑", "x²", "∞", "dy/dx", "📐", "✏️"], 16, "rise", rng);
    case "cinema":
      return scatter(["🍿", "🍿", "🍿", "🎞️", "🎬"], 18, "fall", rng);
    case "segredo":
      return scatter(["💋", "💕", "🤫", "💌"], 12, "rise", rng);
    case "lanche":
      return scatter(["🧀", "🍓", "🍇", "🥤", "🍌"], 16, "fall", rng);
    case "montanha-russa":
      return [
        { text: "🎢", motion: "coaster", x: 0, y: 70, delay: 300, duration: 6500, size: 46 },
        ...scatter(["😱", "😂", "🙌"], 6, "rise", rng),
      ];
    case "bolt":
      return [...pawTrail(false), crossing("🐺", 80, 4200, 3200, 44)];
    case "luna":
      return [
        ...pawTrail(true),
        { ...crossing("🐺", 80, 4200, 3000, 40), motion: "cross-back" },
        ...scatter(["🩴", "🧦", "🦴"], 6, "fall", rng),
      ];
    case "casa":
      return [
        crossing("🚗", 86, 800, 7000, 38),
        ...scatter(["🔑", "🏡", "🌊", "🍽️", "🛋️"], 12, "rise", rng),
      ];
    case "aviao":
      return [
        crossing("✈️", 14, 200, 7000, 42),
        { ...crossing("✈️", 30, 4200, 7000, 30), motion: "cross-back" },
        ...scatter(["☁️"], 6, "rise", rng),
      ];
    case "fogos":
      return fireworks(rng);
  }
}

/** Troca a animação de fundo. `null` limpa. */
export function playScenery(layer: HTMLElement, kind: Scenery | null, rng: Rng = Math.random) {
  layer.innerHTML = "";
  if (!kind) return;
  for (const sprite of sceneryPlan(kind, rng)) {
    const el = document.createElement("span");
    el.className = `sprite ${sprite.motion}`;
    el.textContent = sprite.text;
    el.style.left = `${sprite.x}%`;
    el.style.top = `${sprite.y}%`;
    el.style.fontSize = `${sprite.size}px`;
    el.style.animationDelay = `${sprite.delay}ms`;
    el.style.animationDuration = `${sprite.duration}ms`;
    if (sprite.dx !== undefined) el.style.setProperty("--dx", `${sprite.dx}px`);
    if (sprite.dy !== undefined) el.style.setProperty("--dy", `${sprite.dy}px`);
    layer.appendChild(el);
  }
}
