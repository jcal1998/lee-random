import { describe, expect, it } from "vitest";
import { arpeggio, CHORDS, midiToFreq, Music } from "../src/music";

describe("música", () => {
  it("converte notas MIDI em frequência", () => {
    expect(midiToFreq(69)).toBe(440);
    expect(midiToFreq(81)).toBe(880);
    expect(midiToFreq(60)).toBeCloseTo(261.63, 1);
  });

  it("o arpejo tem 8 notas, todas do acorde", () => {
    for (const chord of CHORDS) {
      const notes = arpeggio(chord);
      expect(notes).toHaveLength(8);
      const pitchClasses = new Set(chord.map((n) => n % 12));
      for (const n of notes) expect(pitchClasses.has(n % 12)).toBe(true);
    }
  });

  it("não quebra quando o navegador não tem Web Audio", () => {
    expect(Music.supported).toBe(false); // jsdom não tem AudioContext
    const music = new Music();
    music.play();
    music.chime();
    music.howl();
    expect(music.playing).toBe(false);
  });
});
