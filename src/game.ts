import { replaceNames, type Names, type Scene } from "./story";

export interface GameOptions {
  root: HTMLElement;
  story: Scene[];
  names: Names;
  /** Fotos mostradas na tela final (só no modo jolee). */
  photos?: string[];
  onRestart?: () => void;
}

export class Game {
  private currentSceneIndex = -1;
  private readonly container: HTMLElement;
  private readonly title: HTMLElement;
  private readonly textBox: HTMLElement;
  private readonly choices: HTMLElement;
  private readonly nextBtn: HTMLButtonElement;

  constructor(private readonly options: GameOptions) {
    const { root } = options;
    this.container = query(root, "#game-container");
    this.title = query(root, "#scene-title");
    this.textBox = query(root, "#text-box");
    this.choices = query(root, "#choices-container");
    this.nextBtn = query<HTMLButtonElement>(root, "#next-btn");
    this.nextBtn.addEventListener("click", () => this.next());
  }

  get sceneIndex(): number {
    return this.currentSceneIndex;
  }

  private fill(text: string): string {
    return replaceNames(text, this.options.names);
  }

  showInitialScreen(): void {
    this.title.innerText = "Nossa História de Amor";
    this.textBox.innerHTML =
      "<p>Um presente para celebrar nossos 9 anos. Clique em 'Começar' para reviver nossa jornada.</p>";
    this.nextBtn.innerText = "Começar";
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

    this.title.innerText = scene.title;
    this.textBox.innerHTML = scene.text.map((p) => this.fill(p)).join(" ");

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
          this.textBox.innerHTML += `<br><p><i>${this.fill(choice.outcome)}</i></p>`;
          if (scene.epilogue) {
            this.textBox.innerHTML += `<p>${this.fill(scene.epilogue)}</p>`;
          }
          // Limpa e esconde as escolhas após o clique
          this.choices.innerHTML = "";
          this.choices.classList.add("hidden");

          // Mostra os botões de navegação novamente
          this.nextBtn.classList.remove("hidden");
        });
        this.choices.appendChild(button);
      }
    }

    this.nextBtn.innerText = scene.final ? "Feliz Aniversário, meu amor!" : "Próximo";
  }

  private renderEnd(): void {
    const photos = this.options.photos ?? [];
    const photosHtml = photos.length
      ? `<div id="final-photos">${photos
          .map((src, i) => `<img src="${src}" alt="Nossa foto ${i + 1}" />`)
          .join("")}</div>`
      : "";

    this.container.innerHTML = `
      <h2 class="end-title">A nossa história continua... ❤️</h2>
      ${photosHtml}
      <button id="restart-btn" class="nav-btn restart-btn">Jogar de novo</button>
    `;
    query(this.container, "#restart-btn").addEventListener("click", () =>
      (this.options.onRestart ?? (() => location.reload()))(),
    );
  }
}

function query<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Elemento não encontrado: ${selector}`);
  return el;
}
