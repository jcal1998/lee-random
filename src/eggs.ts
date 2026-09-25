// Easter eggs: palavras secretas digitadas no teclado e cliques repetidos.

/**
 * Devolve uma função que recebe cada tecla (event.key) e chama `onWord`
 * quando as últimas teclas formam uma das palavras.
 */
export function createWordListener(
  words: string[],
  onWord: (word: string) => void,
): (key: string) => void {
  const longest = Math.max(...words.map((w) => w.length));
  let typed = "";
  return (key: string) => {
    if (key.length !== 1) return;
    typed = (typed + key.toLowerCase()).slice(-longest);
    const word = words.find((w) => typed.endsWith(w));
    if (word) {
      typed = "";
      onWord(word);
    }
  };
}

/** Chama `onBurst` quando há `count` cliques em até `windowMs` milissegundos. */
export function createClickCounter(
  count: number,
  windowMs: number,
  onBurst: () => void,
  now: () => number = Date.now,
): () => void {
  let clicks: number[] = [];
  return () => {
    const t = now();
    clicks = [...clicks.filter((c) => t - c < windowMs), t];
    if (clicks.length >= count) {
      clicks = [];
      onBurst();
    }
  };
}

/** Um husky atravessa a tela correndo, deixando pegadas. */
export function huskyRun(layer: HTMLElement, name: string): HTMLElement {
  const run = document.createElement("div");
  run.className = "husky-run";
  run.innerHTML = `<span class="husky">🐺</span><span class="husky-name">${name}!</span>`;
  run.addEventListener("animationend", (e) => {
    if (e.target === run) run.remove();
  });
  layer.appendChild(run);
  return run;
}

/** Um texto grande que aparece no meio da tela e some. */
export function shout(layer: HTMLElement, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "shout";
  el.textContent = text;
  el.addEventListener("animationend", () => el.remove());
  layer.appendChild(el);
  return el;
}
