// Audio Synthesizer for GPSWOX alerts and click feedback
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playBeep(freq = 880, type = "sine", duration = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay restriction fallback
    }
  }

  playAlert() {
    if (this.muted) return;
    this.playBeep(920, "triangle", 0.1);
    setTimeout(() => {
      this.playBeep(1240, "sine", 0.18);
    }, 120);
  }

  playWarning() {
    if (this.muted) return;
    this.playBeep(440, "sawtooth", 0.2);
    setTimeout(() => {
      this.playBeep(520, "sawtooth", 0.25);
    }, 180);
  }

  playClick() {
    if (this.muted) return;
    this.playBeep(1200, "sine", 0.04);
  }
}

export const soundFX = new SoundFX();
