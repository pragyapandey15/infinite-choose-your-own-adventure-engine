
class AudioService {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientSource: OscillatorNode | AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentAmbienceType: string | null = null;

  constructor() {
    // Context is initialized on first user interaction
  }

  public init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.3; // Default volume
      
      this.ambientGain = this.context.createGain();
      this.ambientGain.connect(this.masterGain);
      this.ambientGain.gain.value = 0; // Start silent
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      // Ramp to avoid clicks
      const now = this.context!.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.3, now + 0.1);
    }
    return this.isMuted;
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  // Procedural Sound Effects
  public playClick() {
    if (this.isMuted || !this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    // High pitch "blip"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  public playHover() {
    if (this.isMuted || !this.context) return;
    // Subtle click
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.context.currentTime);
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  public playSuccess() {
    if (this.isMuted || !this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
    osc.frequency.setValueAtTime(659.25, now + 0.2); // E
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playCraft() {
    if (this.isMuted || !this.context) return;
    const now = this.context.currentTime;
    
    // Metallic strike (FM Synthesis)
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();
    const modGain = this.context.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, now);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(200, now); // Modulator frequency
    
    modGain.gain.setValueAtTime(1000, now);
    modGain.gain.exponentialRampToValueAtTime(1, now + 0.3);

    osc2.connect(modGain);
    modGain.connect(osc1.frequency);
    
    osc1.connect(gain);
    gain.connect(this.masterGain!);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  public playEquip() {
    if (this.isMuted || !this.context) return;
    const now = this.context.currentTime;
    // Leather/Cloth shuffle sound
    const bufferSize = this.context.sampleRate * 0.3;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(100, now + 0.3);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start(now);
  }

  public playTransition() {
    if (this.isMuted || !this.context) return;
    // White noise swoosh
    const bufferSize = this.context.sampleRate * 1.5; // 1.5 seconds
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.context.currentTime + 0.5);
    filter.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 1.5);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    noise.start();
  }

  public playHint() {
    if (this.isMuted || !this.context) return;
    const now = this.context.currentTime;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    // Gentle bell-like chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    osc.start(now);
    osc.stop(now + 1.5);
  }

  // Ambient Drones
  public setAmbience(type: 'nature' | 'dungeon' | 'city' | 'battle' | 'mystic' | 'none') {
    if (this.currentAmbienceType === type || !this.context) return;
    this.currentAmbienceType = type;

    // Fade out existing
    const now = this.context.currentTime;
    if (this.ambientGain) {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 1);
    }

    // Stop old source after fade
    const oldSource = this.ambientSource;
    setTimeout(() => {
      if (oldSource) {
        try { (oldSource as any).stop(); } catch(e) {} 
      }
    }, 1100);

    if (type === 'none') return;

    // Create new source
    setTimeout(() => {
      if (!this.context) return;
      this.createAmbienceSource(type);
      // Fade in
      const rampNow = this.context.currentTime;
      this.ambientGain!.gain.linearRampToValueAtTime(0.15, rampNow + 2);
    }, 1000);
  }

  private createAmbienceSource(type: string) {
    if (!this.context) return;
    
    // We'll use noise + filters for generic atmospheric generation
    const bufferSize = this.context.sampleRate * 2; // 2 sec loop
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate Pink Noise approximation
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.context.createBiquadFilter();
    
    switch (type) {
      case 'nature': // Wind/Leaves
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        break;
      case 'dungeon': // Deep rumble
        filter.type = 'lowpass';
        filter.frequency.value = 80;
        break;
      case 'city': // Distant hum
        filter.type = 'bandpass';
        filter.frequency.value = 300;
        break;
      case 'battle': // Gritty low mid
        filter.type = 'peaking';
        filter.frequency.value = 150;
        filter.gain.value = 10;
        break;
      case 'mystic': // High shimmer
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        break;
      default:
        filter.type = 'lowpass';
        filter.frequency.value = 200;
    }

    noise.connect(filter);
    filter.connect(this.ambientGain!);
    noise.start();
    this.ambientSource = noise;
  }
}

export const audioManager = new AudioService();
