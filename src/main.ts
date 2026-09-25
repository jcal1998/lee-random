import "./style.css";
import foto1 from "./assets/foto-1.jpg";
import foto2 from "./assets/foto-2.jpg";
import { Game } from "./game";
import { buildStory, getNames, isJoleeMode } from "./story";

const jolee = isJoleeMode(window.location.search);

const game = new Game({
  root: document.body,
  story: buildStory(jolee),
  names: getNames(jolee),
  photos: jolee ? [foto1, foto2] : [],
});

game.showInitialScreen();
