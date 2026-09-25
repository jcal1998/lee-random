import "./style.css";
import foto1 from "./assets/foto-1.jpg";
import foto2 from "./assets/foto-2.jpg";
import { burstHearts } from "./effects";
import { createClickCounter, createWordListener, huskyRun, shout } from "./eggs";
import { Game } from "./game";
import { MemoryMap } from "./memory-map";
import { Music } from "./music";
import { playScenery } from "./scenery";
import { Sky } from "./sky";
import { buildStory, getNames, isJoleeMode } from "./story";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

const jolee = isJoleeMode(window.location.search);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const story = buildStory(jolee);

const sky = new Sky($<HTMLCanvasElement>("#sky"), reducedMotion);
sky.start();

const heartsLayer = $("#hearts");
const sceneryLayer = $("#scenery");
const burst = (x: number, y: number, count?: number) => {
  if (!reducedMotion) burstHearts(heartsLayer, x, y, count);
};

// --- Música ---
const SOUND_KEY = "lee-random:som";
const music = new Music();
const musicBtn = $<HTMLButtonElement>("#music-btn");
const soundWanted = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
};
const setMusic = (on: boolean) => {
  if (on) music.play();
  else music.pause();
  musicBtn.textContent = on ? "🎵" : "🔇";
  musicBtn.setAttribute("aria-pressed", String(on));
  musicBtn.setAttribute("aria-label", on ? "Desligar a música" : "Ligar a música");
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // Sem armazenamento (aba anônima): só não lembra a escolha.
  }
};
if (Music.supported) {
  musicBtn.addEventListener("click", () => setMusic(!music.playing));
} else {
  musicBtn.hidden = true;
}

// --- Mapa das memórias ---
const map = new MemoryMap(
  $<HTMLButtonElement>("#map-btn"),
  $<HTMLDialogElement>("#memory-map"),
  $("#map-body"),
  story,
);

// --- O jogo ---
const game = new Game({
  root: document.body,
  story,
  names: getNames(jolee),
  photos: jolee ? [foto1, foto2] : [],
  onChoice: (button) => {
    music.sparkle();
    const rect = button.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  },
  onSceneChange: (scene, index) => {
    // A música começa no primeiro clique em "Começar" (o navegador só deixa
    // tocar som depois de uma interação), a não ser que tenha sido desligada.
    if (index === 0 && Music.supported && soundWanted() && !music.playing) setMusic(true);
    music.chime();
    map.update(index);
    if (!reducedMotion) playScenery(sceneryLayer, scene.scenery ?? null);
  },
  onEnd: () => {
    sky.formHeart();
    burst(window.innerWidth / 2, window.innerHeight * 0.6, 30);
  },
});

game.showInitialScreen();

// --- Easter eggs ---
const bolt = () => {
  music.howl();
  shout(heartsLayer, "AUUUUU! 🐺");
  if (!reducedMotion) huskyRun(heartsLayer, "Bolt");
};
const luna = () => {
  music.sparkle();
  if (!reducedMotion) huskyRun(heartsLayer, "Luna");
  else shout(heartsLayer, "Luninha! 🐾");
};
const love = () => {
  music.sparkle();
  shout(heartsLayer, "Te amo! 💖");
  burst(window.innerWidth / 2, window.innerHeight / 2, 40);
};

const onKey = createWordListener(
  ["bolt", "luna", "potito", "tampinha", "teamo", "amor"],
  (word) => {
    if (word === "bolt" || word === "potito") bolt();
    else if (word === "luna" || word === "tampinha") luna();
    else love();
  },
);
document.addEventListener("keydown", (e) => onKey(e.key));

// Clicar 5 vezes seguidas no ícone do capítulo.
const icon = $("#scene-icon");
const iconSecret = createClickCounter(5, 2500, () => {
  const scenery = game.currentScene?.scenery;
  if (scenery === "bolt") bolt();
  else if (scenery === "luna") luna();
  else love();
});
icon.addEventListener("click", () => {
  icon.classList.remove("boop");
  void icon.offsetWidth;
  icon.classList.add("boop");
  const rect = icon.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 3);
  iconSecret();
});
