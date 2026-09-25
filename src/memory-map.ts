// Mapa das memórias: um mapinha ilustrado de Goiânia (fora de escala) em que
// os lugares da história acendem conforme ela avança.
import type { Place, Scene } from "./story";

interface PlaceInfo {
  label: string;
  x: number;
  y: number;
}

export const PLACES: Record<Place, PlaceInfo> = {
  ufg: { label: "UFG", x: 214, y: 58 },
  mutirama: { label: "Mutirama", x: 168, y: 104 },
  banana: { label: "Banana Shopping", x: 104, y: 128 },
  flamboyant: { label: "Flamboyant", x: 238, y: 170 },
  casa: { label: "Nossa casa", x: 120, y: 206 },
  "sao-paulo": { label: "São Paulo", x: 300, y: 236 },
};

/** Lugares já visitados, na ordem em que apareceram, sem repetir. */
export function visitedPlaces(story: Scene[], sceneIndex: number): Place[] {
  const seen: Place[] = [];
  for (const scene of story.slice(0, sceneIndex + 1)) {
    if (scene.place && !seen.includes(scene.place)) seen.push(scene.place);
  }
  return seen;
}

/** Todos os lugares que aparecem nesta versão da história. */
export function storyPlaces(story: Scene[]): Place[] {
  return visitedPlaces(story, story.length - 1);
}

export function renderMapSvg(story: Scene[], sceneIndex: number): string {
  const visited = visitedPlaces(story, sceneIndex);
  const route = visited.map((p) => `${PLACES[p].x},${PLACES[p].y}`).join(" ");
  const pins = storyPlaces(story)
    .map((place) => {
      const { label, x, y } = PLACES[place];
      const on = visited.includes(place);
      const text = on ? label : "???";
      const anchor = x > 250 ? "end" : "middle";
      return `<g class="pin ${on ? "on" : ""}" data-place="${place}">
        <circle cx="${x}" cy="${y}" r="${on ? 7 : 5}" />
        <text x="${x}" y="${y - 13}" text-anchor="${anchor}">${text}</text>
      </g>`;
    })
    .join("");

  return `<svg viewBox="0 0 320 260" role="img" aria-label="Mapa com ${visited.length} lugares da nossa história">
    <rect class="land" x="4" y="4" width="312" height="252" rx="18" />
    <path class="river" d="M20 30 C 90 60, 60 120, 140 150 S 250 180, 300 250" />
    <path class="road" d="M10 110 H 310 M 170 10 V 250 M 40 230 L 280 40" />
    ${route ? `<polyline class="route" points="${route}" />` : ""}
    ${pins}
    <text class="compass" x="290" y="36" text-anchor="middle">N ↑</text>
  </svg>`;
}

export class MemoryMap {
  private sceneIndex = -1;

  constructor(
    private readonly button: HTMLButtonElement,
    private readonly dialog: HTMLDialogElement,
    private readonly body: HTMLElement,
    private readonly story: Scene[],
  ) {
    button.addEventListener("click", () => this.open());
    dialog.addEventListener("click", (e) => {
      // Clicar fora do mapa (no fundo escuro) ou no botão de fechar fecha.
      const target = e.target as HTMLElement;
      if (target === dialog || target.closest("[data-close]")) this.close();
    });
    this.render();
  }

  update(sceneIndex: number): void {
    const before = visitedPlaces(this.story, this.sceneIndex).length;
    this.sceneIndex = sceneIndex;
    this.render();
    // Um lugar novo apareceu: o botão do mapa pisca.
    if (visitedPlaces(this.story, sceneIndex).length > before) {
      this.button.classList.remove("ping");
      void this.button.offsetWidth;
      this.button.classList.add("ping");
    }
  }

  open(): void {
    this.render();
    if (typeof this.dialog.showModal === "function") this.dialog.showModal();
    else this.dialog.setAttribute("open", "");
  }

  close(): void {
    if (typeof this.dialog.close === "function") this.dialog.close();
    else this.dialog.removeAttribute("open");
  }

  private render(): void {
    this.body.innerHTML = renderMapSvg(this.story, this.sceneIndex);
  }
}
