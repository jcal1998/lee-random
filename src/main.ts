import "./style.css";
import foto1 from "./assets/foto-1.jpg";
import foto2 from "./assets/foto-2.jpg";
import { burstHearts } from "./effects";
import { Game } from "./game";
import { Sky } from "./sky";
import { buildStory, getNames, isJoleeMode } from "./story";

const jolee = isJoleeMode(window.location.search);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sky = new Sky(document.querySelector("#sky") as HTMLCanvasElement, reducedMotion);
sky.start();

const heartsLayer = document.querySelector("#hearts") as HTMLElement;
const burst = (x: number, y: number, count?: number) => {
  if (!reducedMotion) burstHearts(heartsLayer, x, y, count);
};

const game = new Game({
  root: document.body,
  story: buildStory(jolee),
  names: getNames(jolee),
  photos: jolee ? [foto1, foto2] : [],
  onChoice: (button) => {
    const rect = button.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  },
  onEnd: () => {
    sky.formHeart();
    burst(window.innerWidth / 2, window.innerHeight * 0.6, 30);
  },
});

game.showInitialScreen();
