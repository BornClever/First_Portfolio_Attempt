// Futuristic Mechanical Sound Effects for Character Picker
// Uses Web Audio API to generate synthetic mechanical sounds

class MechanicalSoundEngine {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.3;
  private hasUserInteracted: boolean = false;

  constructor() {
    // Initialize on first user interaction to comply with autoplay policies
  }

  private async initializeAudio(): Promise<void> {
    if (!this.audioContext && this.hasUserInteracted) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } catch (error) {
        console.warn('Failed to initialize audio context:', error);
      }
    }
  }

  public enable(): void {
    this.hasUserInteracted = true;
    this.isEnabled = true;
    this.initializeAudio();
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Character change sound - metallic click with digital harmonics
  public playCharacterChange(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Main metallic click
    const clickOsc = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();
    const clickFilter = this.audioContext.createBiquadFilter();
    
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 1200;
    clickFilter.Q.value = 8;
    
    clickGain.gain.setValueAtTime(this.volume * 0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    // Digital harmonic
    const harmonicOsc = this.audioContext.createOscillator();
    const harmonicGain = this.audioContext.createGain();
    
    harmonicOsc.type = 'triangle';
    harmonicOsc.frequency.setValueAtTime(1600, now);
    harmonicOsc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    
    harmonicGain.gain.setValueAtTime(this.volume * 0.2, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    // Mechanical servo sound
    const servoOsc = this.audioContext.createOscillator();
    const servoGain = this.audioContext.createGain();
    const servoFilter = this.audioContext.createBiquadFilter();
    
    servoOsc.type = 'sawtooth';
    servoOsc.frequency.setValueAtTime(100, now);
    servoOsc.frequency.linearRampToValueAtTime(150, now + 0.03);
    servoOsc.frequency.linearRampToValueAtTime(120, now + 0.06);
    
    servoFilter.type = 'highpass';
    servoFilter.frequency.value = 80;
    
    servoGain.gain.setValueAtTime(this.volume * 0.3, now);
    servoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    // Connect and play
    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.audioContext.destination);
    
    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(this.audioContext.destination);
    
    servoOsc.connect(servoFilter);
    servoFilter.connect(servoGain);
    servoGain.connect(this.audioContext.destination);
    
    clickOsc.start(now);
    clickOsc.stop(now + 0.1);
    
    harmonicOsc.start(now);
    harmonicOsc.stop(now + 0.08);
    
    servoOsc.start(now);
    servoOsc.stop(now + 0.06);
  }

  // Number change sound - electronic beep with mechanical undertone
  public playNumberChange(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Electronic beep
    const beepOsc = this.audioContext.createOscillator();
    const beepGain = this.audioContext.createGain();
    const beepFilter = this.audioContext.createBiquadFilter();
    
    beepOsc.type = 'sine';
    beepOsc.frequency.setValueAtTime(1000, now);
    beepOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
    
    beepFilter.type = 'lowpass';
    beepFilter.frequency.value = 1500;
    beepFilter.Q.value = 5;
    
    beepGain.gain.setValueAtTime(this.volume * 0.35, now);
    beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    // Mechanical gear sound
    const gearOsc = this.audioContext.createOscillator();
    const gearGain = this.audioContext.createGain();
    const gearFilter = this.audioContext.createBiquadFilter();
    
    gearOsc.type = 'square';
    gearOsc.frequency.setValueAtTime(60, now);
    gearOsc.frequency.linearRampToValueAtTime(80, now + 0.02);
    gearOsc.frequency.linearRampToValueAtTime(65, now + 0.05);
    
    gearFilter.type = 'bandpass';
    gearFilter.frequency.value = 120;
    gearFilter.Q.value = 3;
    
    gearGain.gain.setValueAtTime(this.volume * 0.25, now);
    gearGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    // Digital pulse
    const pulseOsc = this.audioContext.createOscillator();
    const pulseGain = this.audioContext.createGain();
    
    pulseOsc.type = 'square';
    pulseOsc.frequency.setValueAtTime(2000, now);
    
    pulseGain.gain.setValueAtTime(this.volume * 0.15, now);
    pulseGain.gain.setValueAtTime(0, now + 0.002);
    pulseGain.gain.setValueAtTime(this.volume * 0.15, now + 0.004);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    
    // Connect and play
    beepOsc.connect(beepFilter);
    beepFilter.connect(beepGain);
    beepGain.connect(this.audioContext.destination);
    
    gearOsc.connect(gearFilter);
    gearFilter.connect(gearGain);
    gearGain.connect(this.audioContext.destination);
    
    pulseOsc.connect(pulseGain);
    pulseGain.connect(this.audioContext.destination);
    
    beepOsc.start(now);
    beepOsc.stop(now + 0.08);
    
    gearOsc.start(now);
    gearOsc.stop(now + 0.05);
    
    pulseOsc.start(now);
    pulseOsc.stop(now + 0.02);
  }

  // Combo mode activation sound - futuristic transformation
  public playComboModeActivation(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Rising transformation sweep
    const sweepOsc = this.audioContext.createOscillator();
    const sweepGain = this.audioContext.createGain();
    const sweepFilter = this.audioContext.createBiquadFilter();
    
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(200, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(400, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    sweepFilter.Q.value = 2;
    
    sweepGain.gain.setValueAtTime(this.volume * 0.4, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    // Harmonic resonance
    const resonanceOsc = this.audioContext.createOscillator();
    const resonanceGain = this.audioContext.createGain();
    const resonanceFilter = this.audioContext.createBiquadFilter();
    
    resonanceOsc.type = 'triangle';
    resonanceOsc.frequency.setValueAtTime(600, now + 0.05);
    resonanceOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    resonanceOsc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    
    resonanceFilter.type = 'bandpass';
    resonanceFilter.frequency.value = 800;
    resonanceFilter.Q.value = 6;
    
    resonanceGain.gain.setValueAtTime(0, now);
    resonanceGain.gain.setValueAtTime(this.volume * 0.3, now + 0.05);
    resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    // Digital activation clicks
    for (let i = 0; i < 3; i++) {
      const clickTime = now + (i * 0.04);
      const clickOsc = this.audioContext.createOscillator();
      const clickGain = this.audioContext.createGain();
      
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(1500 + (i * 200), clickTime);
      
      clickGain.gain.setValueAtTime(this.volume * 0.2, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
      
      clickOsc.connect(clickGain);
      clickGain.connect(this.audioContext.destination);
      
      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.02);
    }
    
    // Connect main sounds
    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.audioContext.destination);
    
    resonanceOsc.connect(resonanceFilter);
    resonanceFilter.connect(resonanceGain);
    resonanceGain.connect(this.audioContext.destination);
    
    sweepOsc.start(now);
    sweepOsc.stop(now + 0.25);
    
    resonanceOsc.start(now + 0.05);
    resonanceOsc.stop(now + 0.25);
  }

  // Game start sound - boot-up sequence
  public playGameStart(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Boot-up sequence
    const bootOsc = this.audioContext.createOscillator();
    const bootGain = this.audioContext.createGain();
    const bootFilter = this.audioContext.createBiquadFilter();
    
    bootOsc.type = 'sawtooth';
    bootOsc.frequency.setValueAtTime(100, now);
    bootOsc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    bootOsc.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    
    bootFilter.type = 'lowpass';
    bootFilter.frequency.setValueAtTime(200, now);
    bootFilter.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    bootFilter.Q.value = 2;
    
    bootGain.gain.setValueAtTime(this.volume * 0.3, now);
    bootGain.gain.setValueAtTime(this.volume * 0.4, now + 0.3);
    bootGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    // System ready beep
    const readyOsc = this.audioContext.createOscillator();
    const readyGain = this.audioContext.createGain();
    
    readyOsc.type = 'sine';
    readyOsc.frequency.setValueAtTime(800, now + 0.5);
    readyOsc.frequency.setValueAtTime(1000, now + 0.52);
    
    readyGain.gain.setValueAtTime(this.volume * 0.4, now + 0.5);
    readyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    
    // Connect and play
    bootOsc.connect(bootFilter);
    bootFilter.connect(bootGain);
    bootGain.connect(this.audioContext.destination);
    
    readyOsc.connect(readyGain);
    readyGain.connect(this.audioContext.destination);
    
    bootOsc.start(now);
    bootOsc.stop(now + 0.6);
    
    readyOsc.start(now + 0.5);
    readyOsc.stop(now + 0.65);
  }

  // Font style change sound - subtle interface click
  public playFontStyleChange(): void {
    if (!this.isEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Interface click
    const clickOsc = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();
    const clickFilter = this.audioContext.createBiquadFilter();
    
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    
    clickFilter.type = 'highpass';
    clickFilter.frequency.value = 400;
    clickFilter.Q.value = 3;
    
    clickGain.gain.setValueAtTime(this.volume * 0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    // Subtle harmonic
    const harmonicOsc = this.audioContext.createOscillator();
    const harmonicGain = this.audioContext.createGain();
    
    harmonicOsc.type = 'sine';
    harmonicOsc.frequency.setValueAtTime(2400, now);
    
    harmonicGain.gain.setValueAtTime(this.volume * 0.1, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    
    // Connect and play
    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.audioContext.destination);
    
    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(this.audioContext.destination);
    
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);
    
    harmonicOsc.start(now);
    harmonicOsc.stop(now + 0.02);
  }

  public dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const mechanicalSounds = new MechanicalSoundEngine();