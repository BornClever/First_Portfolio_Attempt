export class WebAudioSynthesizer {
  private audioContext: AudioContext | null = null;

  private createSynthBeat(): AudioContext | null {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  playSynthTone(frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.3): void {
    const ctx = this.createSynthBeat();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Setup synthesizer chain: Oscillator -> Filter -> Gain -> Output
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure synthesizer settings
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
    filter.Q.setValueAtTime(15, ctx.currentTime);

    // Create retro envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  playRetroArpeggio(volume: number = 0.3): void {
    const notes = [220, 277, 330, 440, 554, 660]; // A minor pentatonic
    notes.forEach((freq, i) => {
      setTimeout(() => this.playSynthTone(freq, 0.3, 'sawtooth', volume), i * 150);
    });
  }

  playEDMBeat(volume: number = 0.3): void {
    const ctx = this.createSynthBeat();
    if (!ctx) return;

    // Create a simple EDM-style beat pattern
    const beatPattern = [
      { freq: 60, time: 0, duration: 0.1, type: 'sine' as OscillatorType }, // Kick
      { freq: 440, time: 0.25, duration: 0.05, type: 'square' as OscillatorType }, // Hi-hat
      { freq: 120, time: 0.5, duration: 0.1, type: 'sine' as OscillatorType }, // Kick
      { freq: 880, time: 0.75, duration: 0.05, type: 'square' as OscillatorType }, // Hi-hat
    ];

    beatPattern.forEach(beat => {
      setTimeout(() => {
        this.playSynthTone(beat.freq, beat.duration, beat.type, volume);
      }, beat.time * 1000);
    });
  }

  playChiptuneMelody(volume: number = 0.3): void {
    // Classic 8-bit melody pattern
    const melody = [
      { freq: 523, duration: 0.2 }, // C5
      { freq: 587, duration: 0.2 }, // D5
      { freq: 659, duration: 0.2 }, // E5
      { freq: 784, duration: 0.4 }, // G5
      { freq: 659, duration: 0.2 }, // E5
      { freq: 587, duration: 0.2 }, // D5
      { freq: 523, duration: 0.4 }, // C5
    ];

    let totalTime = 0;
    melody.forEach(note => {
      setTimeout(() => this.playSynthTone(note.freq, note.duration, 'square', volume), totalTime);
      totalTime += note.duration * 1000;
    });
  }
}