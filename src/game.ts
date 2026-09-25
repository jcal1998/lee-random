import { replaceNames, type Names, type Scene } from "./story";

export interface GameOptions {
  root: HTMLElement;
  story: Scene[];
  names: Names;
  /** Fotos mostradas na tela final (só no modo jolee). */
  photos?: string[];
  onRestart?: () => void;
  /** Chamado quando o jogador escolhe uma opção, com o botão clicado. */
  onChoice?: (button: HTMLElement) => void;
  /** Chamado a cada capítulo mostrado. */
  onSceneChange?: (scene: Scene, index: number) => void;
  /** Chamado quando a tela final aparece. */
  onEnd?: () => void;
}

export class Game {
  private currentSceneIndex = -1;
  private readonly container: HTMLElement;
  private readonly title: HTMLElement;
  private readonly textBox: HTMLElement;
  private readonly choices: HTMLElement;
  private readonly nextBtn: HTMLButtonElement;
  // Opcionais: o jogo funciona sem eles.
  private readonly icon: HTMLElement | null;
  private readonly progress: HTMLElement | null;

  constructor(private readonly options: GameOptions) {
    const { root } = options;
    this.container = query(root, "#game-container");
    this.title = query(root, "#scene-title");
    this.textBox = query(root, "#text-box");
    this.choices = query(root, "#choices-container");
    this.nextBtn = query<HTMLButtonElement>(root, "#next-btn");
    this.icon = root.querySelector("#scene-icon");
    this.progress = root.querySelector("#progress");
    this.nextBtn.addEventListener("click", () => this.next());
    root.ownerDocument.addEventListener("keydown", (e) => {
      const canAdvance = this.nextBtn.isConnected && !this.nextBtn.classList.contains("hidden");
      if (e.key === "ArrowRight" && canAdvance) this.next();
    });
  }

  get sceneIndex(): number {
    return this.currentSceneIndex;
  }

  /** O capítulo na tela, ou `undefined` na tela inicial e na final. */
  get currentScene(): Scene | undefined {
    return this.options.story[this.currentSceneIndex];
  }

  private fill(text: string): string {
    return replaceNames(text, this.options.names);
  }

  showInitialScreen(): void {
    const { dele, dela } = this.options.names;
    this.setIcon("💌");
    this.title.innerText = "Nossa História de Amor";
    this.textBox.innerHTML = `
      <div class="line couple">${dele} <span class="amp">&amp;</span> ${dela}</div>
      <div class="line intro"><p>Um presente para celebrar nossos 9 anos. Clique em 'Começar' para reviver nossa jornada.</p></div>`;
    this.nextBtn.innerText = "Começar";
    this.stagger();
    this.renderProgress();
    this.animateCard();
  }

  next(): void {
    const { story } = this.options;
    if (this.currentSceneIndex < story.length - 1) {
      this.currentSceneIndex++;
      this.renderScene();
    } else if (this.currentSceneIndex === story.length - 1) {
      this.renderEnd();
    }
  }

  private renderScene(): void {
    const scene = this.options.story[this.currentSceneIndex];

    this.setIcon(scene.icon ?? "❤");
    this.title.innerText = scene.title;
    this.textBox.innerHTML = scene.text
      .map((p) => `<div class="line">${this.fill(p)}</div>`)
      .join("");
    this.stagger();

    // --- Gerenciamento de Botões ---
    this.choices.innerHTML = "";
    this.choices.classList.add("hidden");
    this.nextBtn.classList.remove("hidden");

    if (scene.choices) {
      this.nextBtn.classList.add("hidden");
      this.choices.classList.remove("hidden");

      for (const choice of scene.choices) {
        const button = document.createElement("button");
        button.innerText = this.fill(choice.text);
        button.className = "choice-btn";
        button.addEventListener("click", () => {
          this.options.onChoice?.(button);
          this.appendLine("outcome", choice.outcome, 0);
          if (scene.epilogue) this.appendLine("epilogue", scene.epilogue, 1);

          // Limpa e esconde as escolhas após o clique
          this.choices.innerHTML = "";
          this.choices.classList.add("hidden");

          // Mostra os botões de navegação novamente
          this.nextBtn.classList.remove("hidden");
          this.nextBtn.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
        });
        this.choices.appendChild(button);
      }
    }

    this.nextBtn.innerText = scene.final ? "Feliz Aniversário, meu amor!" : "Próximo";
    this.renderProgress();
    this.animateCard();
    this.options.onSceneChange?.(scene, this.currentSceneIndex);
  }

  private renderEnd(): void {
    const { dele, dela } = this.options.names;
    const photos = this.options.photos ?? [];
    const photosHtml = photos.length
      ? `<div id="final-photos">${photos
          .map(
            (src, i) =>
              `<figure class="polaroid"><img src="${src}" alt="Nossa foto ${i + 1}" /></figure>`,
          )
          .join("")}</div>`
      : "";

    this.currentSceneIndex = this.options.story.length;
    this.options.root.classList.add("the-end");
    this.container.innerHTML = `
      <p class="end-kicker">${dele} &amp; ${dela} · 9 anos</p>
      <h2 class="end-title">A nossa história continua... ❤️</h2>
      ${photosHtml}
      <button id="restart-btn" class="nav-btn restart-btn">Jogar de novo</button>
    `;
    this.renderProgress();
    this.animateCard();
    query(this.container, "#restart-btn").addEventListener("click", () =>
      (this.options.onRestart ?? (() => location.reload()))(),
    );
    this.options.onEnd?.();
  }

  private setIcon(icon: string): void {
    if (this.icon) this.icon.textContent = icon;
  }

  /** Uma estrela por capítulo; as já lidas ficam acesas. */
  private renderProgress(): void {
    if (!this.progress) return;
    const { story } = this.options;
    const current = this.currentSceneIndex;
    this.progress.innerHTML = story
      .map((scene, i) => {
        const state = i < current ? "lit" : i === current ? "lit current" : "";
        return `<li class="star ${state}" title="${scene.title}"></li>`;
      })
      .join("");
    const shown = Math.min(Math.max(current + 1, 0), story.length);
    this.progress.setAttribute("aria-label", `Capítulo ${shown} de ${story.length}`);
  }

  private appendLine(kind: string, text: string, delay: number): void {
    this.textBox.insertAdjacentHTML(
      "beforeend",
      `<div class="line ${kind}" style="--i: ${delay}">${this.fill(text)}</div>`,
    );
  }

  /** Faz os parágrafos aparecerem um depois do outro. */
  private stagger(): void {
    this.textBox
      .querySelectorAll<HTMLElement>(".line")
      .forEach((el, i) => el.style.setProperty("--i", String(i)));
  }

  /** Reinicia a animação de entrada do cartão. */
  private animateCard(): void {
    this.container.classList.remove("enter");
    void this.container.offsetWidth;
    this.container.classList.add("enter");
  }
}

function query<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Elemento não encontrado: ${selector}`);
  return el;
}
