// Trilha sonora gerada no navegador (Web Audio): uma caixinha de música
// tocando arpejos em Dó - Lá menor - Fá - Sol, e alguns efeitos sonoros.
// Nenhum arquivo de áudio é baixado.

/** Acordes em notas MIDI (60 = Dó central). */
export const CHORDS: number[][] = [
  [60, 64, 67], // Dó
  [57, 60, 64], // Lá menor
  [53, 57, 60], // Fá
  [55, 59, 62], // Sol
];

const BEAT = 60 / 76 / 2; // colcheia a 76 bpm, em segundos
const NOTES_PER_BAR = 8;

export function midiToFreq(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

/** As 8 notas (MIDI) do arpejo de um compasso, uma oitava acima. */
export function arpeggio(chord: number[]): number[] {
  const [a, b, c] = chord.map((n) => n + 12);
  return [a, b, c, a + 12, c, b, c, a + 12];
}

type AudioCtor = typeof AudioContext;

function audioCtor(): AudioCtor | undefined {
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext;
}

export class Music {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private echo: AudioNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextAt = 0;
  private _playing = false;

  static get supported(): boolean {
    return typeof window !== "undefined" && audioCtor() !== undefined;
  }

  get playing(): boolean {
    return this._playing;
  }

  private setup(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = audioCtor();
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Eco suave para dar a sensação de caixinha de música num quarto.
    const delay = ctx.createDelay(2);
    delay.delayTime.value = BEAT * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2200;
    delay.connect(tone).connect(feedback).connect(delay);
    tone.connect(master);

    this.ctx = ctx;
    this.master = master;
    this.echo = delay;
    return ctx;
  }

  play(): void {
    const ctx = this.setup();
    if (!ctx || !this.master || this._playing) return;
    void ctx.resume();
    this._playing = true;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(0.16, ctx.currentTime, 0.8);
    this.nextAt = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 100);
  }

  pause(): void {
    if (!this.ctx || !this.master || !this._playing) return;
    this._playing = false;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Três notinhas subindo, ao virar o capítulo. */
  chime(): void {
    this.effect([84, 88, 91], 0.09, 0.5);
  }

  /** Brilhinho ao fazer uma escolha. */
  sparkle(): void {
    this.effect([91, 96, 93, 100], 0.05, 0.35);
  }

  /** Uivo de husky: um tom que sobe e desce, com vibrato. */
  howl(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this._playing) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(470, t + 1.8);
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 6;
    const depth = ctx.createGain();
    depth.gain.value = 12;
    vibrato.connect(depth).connect(osc.frequency);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.25);
    env.gain.setTargetAtTime(0, t + 1.5, 0.25);
    osc.connect(filter).connect(env).connect(this.master);
    osc.start(t);
    vibrato.start(t);
    osc.stop(t + 2.6);
    vibrato.stop(t + 2.6);
  }

  private effect(notes: number[], gap: number, volume: number): void {
    const ctx = this.ctx;
    if (!ctx || !this._playing) return;
    notes.forEach((n, i) => this.bell(midiToFreq(n), ctx.currentTime + i * gap, volume));
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextAt < ctx.currentTime + 0.3) {
      const bar = Math.floor(this.step / NOTES_PER_BAR);
      const chord = CHORDS[bar % CHORDS.length];
      const beat = this.step % NOTES_PER_BAR;
      this.bell(midiToFreq(arpeggio(chord)[beat]), this.nextAt, beat === 0 ? 0.55 : 0.4);
      if (beat === 0) this.pad(chord, this.nextAt, BEAT * NOTES_PER_BAR);
      this.nextAt += BEAT;
      this.step++;
    }
  }

  /** Nota de caixinha de música: ataque rápido e um decaimento longo. */
  private bell(freq: number, at: number, volume: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(volume, at + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
    env.connect(this.master);
    if (this.echo) env.connect(this.echo);
    for (const [mult, type, gain] of [
      [1, "sine", 1],
      [3, "sine", 0.18],
      [2, "triangle", 0.12],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(env);
      osc.start(at);
      osc.stop(at + 1.7);
    }
  }

  /** Um acorde grave e bem baixinho por baixo do arpejo. */
  private pad(chord: number[], at: number, length: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.07, at + 0.8);
    env.gain.linearRampToValueAtTime(0, at + length + 0.4);
    env.connect(this.master);
    for (const note of [chord[0] - 12, ...chord]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = midiToFreq(note);
      osc.connect(env);
      osc.start(at);
      osc.stop(at + length + 0.5);
    }
  }
}
