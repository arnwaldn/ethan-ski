/**
 * AUDIO SYSTEM - Immersive Sound Effects for Ski Game
 * Procedural audio using Web Audio API
 */

// ==================== AUDIO CONTEXT ====================

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isAudioInitialized = false;

/**
 * Initialize audio context (must be called after user interaction)
 */
export function initAudio(): boolean {
  if (isAudioInitialized) return true;

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(audioContext.destination);
    isAudioInitialized = true;
    console.log('🔊 Audio system initialized');
    return true;
  } catch (e) {
    console.warn('Audio not supported:', e);
    return false;
  }
}

/**
 * Resume audio context if suspended
 */
export function resumeAudio(): void {
  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  }
}

// ==================== AMBIENT SOUNDS ====================

let windNode: AudioBufferSourceNode | null = null;
let windGain: GainNode | null = null;

/**
 * Create wind noise buffer
 */
function createNoiseBuffer(duration: number, type: 'white' | 'pink' | 'brown' = 'pink'): AudioBuffer {
  if (!audioContext) throw new Error('Audio not initialized');

  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white * 0.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        // Brown noise
        b0 = (b0 + (0.02 * white)) / 1.02;
        data[i] = b0 * 3.5;
      }
    }
  }

  return buffer;
}

/**
 * Start wind ambiance
 */
export function startWindAmbiance(): void {
  if (!audioContext || !masterGain || windNode) return;

  try {
    const noiseBuffer = createNoiseBuffer(4, 'brown');

    // Create filter for wind sound
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;
    lowpass.Q.value = 1;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 80;

    windGain = audioContext.createGain();
    windGain.gain.value = 0.15;

    windNode = audioContext.createBufferSource();
    windNode.buffer = noiseBuffer;
    windNode.loop = true;

    windNode.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(windGain);
    windGain.connect(masterGain);

    windNode.start();
    console.log('🌬️ Wind ambiance started');
  } catch (e) {
    console.warn('Failed to start wind:', e);
  }
}

/**
 * Update wind intensity based on speed
 */
export function updateWindIntensity(speed: number, maxSpeed: number): void {
  if (!windGain) return;
  // Reduced volume to not interfere with music
  const intensity = 0.05 + (speed / maxSpeed) * 0.15;
  windGain.gain.setTargetAtTime(intensity, audioContext!.currentTime, 0.2);
}

/**
 * Stop wind ambiance
 */
export function stopWindAmbiance(): void {
  if (windNode) {
    windNode.stop();
    windNode.disconnect();
    windNode = null;
  }
  if (windGain) {
    windGain.disconnect();
    windGain = null;
  }
}

// ==================== SKI SOUNDS ====================

let skiNode: AudioBufferSourceNode | null = null;
let skiGain: GainNode | null = null;
let skiFilter: BiquadFilterNode | null = null;

/**
 * Start ski carving sound
 */
export function startSkiSound(): void {
  if (!audioContext || !masterGain || skiNode) return;

  try {
    const noiseBuffer = createNoiseBuffer(2, 'white');

    skiFilter = audioContext.createBiquadFilter();
    skiFilter.type = 'bandpass';
    skiFilter.frequency.value = 2000;
    skiFilter.Q.value = 2;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1500;

    skiGain = audioContext.createGain();
    skiGain.gain.value = 0;

    skiNode = audioContext.createBufferSource();
    skiNode.buffer = noiseBuffer;
    skiNode.loop = true;

    skiNode.connect(skiFilter);
    skiFilter.connect(highpass);
    highpass.connect(skiGain);
    skiGain.connect(masterGain);

    skiNode.start();
  } catch (e) {
    console.warn('Failed to start ski sound:', e);
  }
}

/**
 * Update ski sound based on speed and turning
 */
export function updateSkiSound(speed: number, maxSpeed: number, turning: number): void {
  if (!skiGain || !skiFilter || !audioContext) return;

  const speedRatio = speed / maxSpeed;

  // Volume - reduced to not interfere with music
  const volume = speedRatio * 0.10;
  skiGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);

  // Pitch increases with speed - smoother transitions
  const freq = 2000 + speedRatio * 2000;
  skiFilter.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.2);

  // Carving sound - reduced Q variation
  const q = 1 + Math.abs(turning) * 2;
  skiFilter.Q.setTargetAtTime(q, audioContext.currentTime, 0.1);
}

/**
 * Stop ski sound
 */
export function stopSkiSound(): void {
  if (skiNode) {
    skiNode.stop();
    skiNode.disconnect();
    skiNode = null;
  }
  if (skiGain) {
    skiGain.disconnect();
    skiGain = null;
  }
  if (skiFilter) {
    skiFilter.disconnect();
    skiFilter = null;
  }
}

// ==================== SNOW CRUNCH (Realistic snow crunching) ====================

let snowCrunchNode: AudioBufferSourceNode | null = null;
let snowCrunchGain: GainNode | null = null;
let snowCrunchModGain: GainNode | null = null;

/**
 * Start snow crunch sound - simulates granular snow texture
 */
export function startSnowCrunch(): void {
  if (!audioContext || !masterGain || snowCrunchNode) return;

  try {
    // Create pink noise for base snow sound
    const noiseBuffer = createNoiseBuffer(2, 'pink');

    // Bandpass filter for snow frequencies (500-3000 Hz)
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1500;
    bandpass.Q.value = 0.8;

    // Modulation for "crunchy" texture
    const modulator = audioContext.createOscillator();
    const modGain = audioContext.createGain();
    modulator.type = 'sine';
    modulator.frequency.value = 30; // 30Hz modulation for crunch
    modGain.gain.value = 0.3;
    modulator.connect(modGain);

    snowCrunchModGain = audioContext.createGain();
    snowCrunchModGain.gain.value = 0;
    modGain.connect(snowCrunchModGain.gain);

    snowCrunchGain = audioContext.createGain();
    snowCrunchGain.gain.value = 0;

    snowCrunchNode = audioContext.createBufferSource();
    snowCrunchNode.buffer = noiseBuffer;
    snowCrunchNode.loop = true;

    snowCrunchNode.connect(bandpass);
    bandpass.connect(snowCrunchModGain);
    snowCrunchModGain.connect(snowCrunchGain);
    snowCrunchGain.connect(masterGain);

    snowCrunchNode.start();
    modulator.start();
    console.log('❄️ Snow crunch started');
  } catch (e) {
    console.warn('Failed to start snow crunch:', e);
  }
}

/**
 * Update snow crunch based on speed
 */
export function updateSnowCrunch(speed: number, maxSpeed: number): void {
  if (!snowCrunchGain || !audioContext) return;

  const speedRatio = speed / maxSpeed;
  // Volume increases with speed - boosted for audibility
  const volume = speedRatio * 0.45;
  snowCrunchGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
}

/**
 * Stop snow crunch
 */
export function stopSnowCrunch(): void {
  if (snowCrunchNode) {
    snowCrunchNode.stop();
    snowCrunchNode.disconnect();
    snowCrunchNode = null;
  }
  if (snowCrunchGain) {
    snowCrunchGain.disconnect();
    snowCrunchGain = null;
  }
  if (snowCrunchModGain) {
    snowCrunchModGain.disconnect();
    snowCrunchModGain = null;
  }
}

// ==================== CARVING SOUND (Edge scraping) ====================

let carvingNode: AudioBufferSourceNode | null = null;
let carvingGain: GainNode | null = null;
let carvingFilter: BiquadFilterNode | null = null;

/**
 * Start carving sound - sharp edge scraping on snow
 */
export function startCarving(): void {
  if (!audioContext || !masterGain || carvingNode) return;

  try {
    const noiseBuffer = createNoiseBuffer(2, 'white');

    // Highpass + resonant peak for metallic edge sound
    carvingFilter = audioContext.createBiquadFilter();
    carvingFilter.type = 'highpass';
    carvingFilter.frequency.value = 4000;
    carvingFilter.Q.value = 5; // High resonance for sharp sound

    const notch = audioContext.createBiquadFilter();
    notch.type = 'peaking';
    notch.frequency.value = 6000;
    notch.Q.value = 3;
    notch.gain.value = 6;

    carvingGain = audioContext.createGain();
    carvingGain.gain.value = 0;

    carvingNode = audioContext.createBufferSource();
    carvingNode.buffer = noiseBuffer;
    carvingNode.loop = true;

    carvingNode.connect(carvingFilter);
    carvingFilter.connect(notch);
    notch.connect(carvingGain);
    carvingGain.connect(masterGain);

    carvingNode.start();
    console.log('🎿 Carving sound started');
  } catch (e) {
    console.warn('Failed to start carving:', e);
  }
}

/**
 * Update carving sound based on turning intensity
 */
export function updateCarving(turning: number, speed: number, maxSpeed: number): void {
  if (!carvingGain || !carvingFilter || !audioContext) return;

  const turnIntensity = Math.abs(turning);
  const speedRatio = speed / maxSpeed;

  // Volume based on turn intensity and speed - boosted for audibility
  const volume = turnIntensity * speedRatio * 0.55;
  carvingGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.05);

  // Higher frequency for sharper turns
  const freq = 4000 + turnIntensity * 3000;
  carvingFilter.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.1);
}

/**
 * Stop carving sound
 */
export function stopCarving(): void {
  if (carvingNode) {
    carvingNode.stop();
    carvingNode.disconnect();
    carvingNode = null;
  }
  if (carvingGain) {
    carvingGain.disconnect();
    carvingGain = null;
  }
  if (carvingFilter) {
    carvingFilter.disconnect();
    carvingFilter = null;
  }
}

// ==================== POWDER SPRAY (High speed snow spray) ====================

let sprayNode: AudioBufferSourceNode | null = null;
let sprayGain: GainNode | null = null;

/**
 * Start powder spray sound - soft airy sound of snow spraying
 */
export function startSpray(): void {
  if (!audioContext || !masterGain || sprayNode) return;

  try {
    const noiseBuffer = createNoiseBuffer(2, 'pink');

    // Very low pass for soft spray sound
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    lowpass.Q.value = 0.5;

    // Slight highpass to remove rumble
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200;

    sprayGain = audioContext.createGain();
    sprayGain.gain.value = 0;

    sprayNode = audioContext.createBufferSource();
    sprayNode.buffer = noiseBuffer;
    sprayNode.loop = true;

    sprayNode.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(sprayGain);
    sprayGain.connect(masterGain);

    sprayNode.start();
    console.log('💨 Powder spray started');
  } catch (e) {
    console.warn('Failed to start spray:', e);
  }
}

/**
 * Update spray sound - only at high speeds
 */
export function updateSpray(speed: number, maxSpeed: number): void {
  if (!sprayGain || !audioContext) return;

  const speedRatio = speed / maxSpeed;
  // Only activate above 60% speed - boosted for audibility
  const volume = speedRatio > 0.6 ? (speedRatio - 0.6) * 0.6 : 0;
  sprayGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.2);
}

/**
 * Stop spray sound
 */
export function stopSpray(): void {
  if (sprayNode) {
    sprayNode.stop();
    sprayNode.disconnect();
    sprayNode = null;
  }
  if (sprayGain) {
    sprayGain.disconnect();
    sprayGain = null;
  }
}

// ==================== TUCK WIND (Aerodynamic position) ====================

let tuckWindNode: OscillatorNode | null = null;
let tuckWindNoiseNode: AudioBufferSourceNode | null = null;
let tuckWindGain: GainNode | null = null;

/**
 * Start tuck wind sound - low rumble when in aerodynamic position
 */
export function startTuckWind(): void {
  if (!audioContext || !masterGain || tuckWindNode) return;

  try {
    // Low frequency oscillator for wind rumble
    tuckWindNode = audioContext.createOscillator();
    tuckWindNode.type = 'sine';
    tuckWindNode.frequency.value = 80;

    // Add noise for texture
    const noiseBuffer = createNoiseBuffer(2, 'brown');
    tuckWindNoiseNode = audioContext.createBufferSource();
    tuckWindNoiseNode.buffer = noiseBuffer;
    tuckWindNoiseNode.loop = true;

    const noiseLowpass = audioContext.createBiquadFilter();
    noiseLowpass.type = 'lowpass';
    noiseLowpass.frequency.value = 300;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.5;

    const oscGain = audioContext.createGain();
    oscGain.gain.value = 0.3;

    tuckWindGain = audioContext.createGain();
    tuckWindGain.gain.value = 0;

    // Mix oscillator and noise
    tuckWindNode.connect(oscGain);
    oscGain.connect(tuckWindGain);

    tuckWindNoiseNode.connect(noiseLowpass);
    noiseLowpass.connect(noiseGain);
    noiseGain.connect(tuckWindGain);

    tuckWindGain.connect(masterGain);

    tuckWindNode.start();
    tuckWindNoiseNode.start();
    console.log('🌀 Tuck wind started');
  } catch (e) {
    console.warn('Failed to start tuck wind:', e);
  }
}

/**
 * Update tuck wind based on tucking state and speed
 */
export function updateTuckWind(isTucking: boolean, speed: number, maxSpeed: number): void {
  if (!tuckWindGain || !tuckWindNode || !audioContext) return;

  const speedRatio = speed / maxSpeed;

  if (isTucking && speedRatio > 0.2) {
    // Active when tucking at reasonable speed - boosted for audibility
    const volume = (speedRatio - 0.2) * 0.50;
    tuckWindGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);

    // Frequency increases with speed
    const freq = 60 + speedRatio * 80;
    tuckWindNode.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.2);
  } else {
    // Silent when not tucking
    tuckWindGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.2);
  }
}

/**
 * Stop tuck wind
 */
export function stopTuckWind(): void {
  if (tuckWindNode) {
    tuckWindNode.stop();
    tuckWindNode.disconnect();
    tuckWindNode = null;
  }
  if (tuckWindNoiseNode) {
    tuckWindNoiseNode.stop();
    tuckWindNoiseNode.disconnect();
    tuckWindNoiseNode = null;
  }
  if (tuckWindGain) {
    tuckWindGain.disconnect();
    tuckWindGain = null;
  }
}

// ==================== GATE SOUNDS ====================

/**
 * Play gate pass sound (success)
 */
export function playGatePass(): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    // Two-tone chime
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 880; // A5

    osc2.type = 'sine';
    osc2.frequency.value = 1318.5; // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.25);
  } catch (e) {
    console.warn('Failed to play gate pass:', e);
  }
}

/**
 * Play gate miss sound (penalty)
 */
export function playGateMiss(): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn('Failed to play gate miss:', e);
  }
}

// ==================== COUNTDOWN SOUNDS ====================

/**
 * Play countdown beep
 */
export function playCountdownBeep(final: boolean = false): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = final ? 880 : 440;

    const duration = final ? 0.4 : 0.15;
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Failed to play countdown:', e);
  }
}

/**
 * Play start sound (GO!)
 */
export function playStartSound(): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioContext!.createOscillator();
      const gain = audioContext!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.setTargetAtTime(0.01, startTime + 0.1, 0.05);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch (e) {
    console.warn('Failed to play start sound:', e);
  }
}

// ==================== FINISH SOUNDS ====================

/**
 * Play finish line sound
 */
export function playFinishSound(): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    // Victory fanfare
    const notes = [
      { freq: 523.25, time: 0, duration: 0.15 },      // C5
      { freq: 659.25, time: 0.15, duration: 0.15 },   // E5
      { freq: 783.99, time: 0.3, duration: 0.15 },    // G5
      { freq: 1046.5, time: 0.45, duration: 0.4 },    // C6
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = audioContext!.createOscillator();
      const gain = audioContext!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = now + time;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.setTargetAtTime(0.01, startTime + duration * 0.7, 0.05);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Add shimmer effect
    setTimeout(() => playShimmer(), 500);
  } catch (e) {
    console.warn('Failed to play finish sound:', e);
  }
}

/**
 * Play shimmer effect
 */
function playShimmer(): void {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;

  for (let i = 0; i < 8; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 2000 + Math.random() * 2000;

    const startTime = now + i * 0.05;
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.setTargetAtTime(0, startTime, 0.1);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }
}

// ==================== SPEED WHOOSH ====================

let whooshNode: OscillatorNode | null = null;
let whooshGain: GainNode | null = null;
let whooshFilter: BiquadFilterNode | null = null;

/**
 * Start speed whoosh sound
 */
export function startWhoosh(): void {
  if (!audioContext || !masterGain || whooshNode) return;

  try {
    const noiseBuffer = createNoiseBuffer(2, 'white');
    const source = audioContext.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    whooshFilter = audioContext.createBiquadFilter();
    whooshFilter.type = 'bandpass';
    whooshFilter.frequency.value = 500;
    whooshFilter.Q.value = 0.5;

    whooshGain = audioContext.createGain();
    whooshGain.gain.value = 0;

    source.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(masterGain);

    source.start();

    // Store reference (using any since we're storing a BufferSourceNode as whooshNode)
    (whooshNode as any) = source;
  } catch (e) {
    console.warn('Failed to start whoosh:', e);
  }
}

/**
 * Update whoosh based on speed
 */
export function updateWhoosh(speed: number, maxSpeed: number): void {
  if (!whooshGain || !whooshFilter || !audioContext) return;

  const speedRatio = speed / maxSpeed;

  // Reduced volume - only at very high speeds
  const volume = Math.max(0, (speedRatio - 0.6) * 0.2);
  whooshGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.2);

  // Higher pitch at higher speeds
  const freq = 400 + speedRatio * 600;
  whooshFilter.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.2);
}

/**
 * Stop whoosh sound
 */
export function stopWhoosh(): void {
  if (whooshNode) {
    (whooshNode as any).stop?.();
    (whooshNode as any).disconnect?.();
    whooshNode = null;
  }
  if (whooshGain) {
    whooshGain.disconnect();
    whooshGain = null;
  }
  if (whooshFilter) {
    whooshFilter.disconnect();
    whooshFilter = null;
  }
}

// ==================== UI SOUNDS ====================

/**
 * Play button click sound
 */
export function playButtonClick(): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    console.warn('Failed to play click:', e);
  }
}

/**
 * Play hover sound
 */
export function playButtonHover(): void {
  if (!audioContext || !masterGain) return;

  try {
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 800;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.setTargetAtTime(0, now, 0.02);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch (e) {
    // Silent fail for hover
  }
}

// ==================== MASTER CONTROLS ====================

/**
 * Set master volume
 */
export function setMasterVolume(volume: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Mute all audio
 */
export function muteAudio(): void {
  if (masterGain) {
    masterGain.gain.value = 0;
  }
}

/**
 * Unmute audio
 */
export function unmuteAudio(volume: number = 0.7): void {
  if (masterGain) {
    masterGain.gain.value = volume;
  }
}

/**
 * Stop all sounds
 */
export function stopAllSounds(): void {
  stopWindAmbiance();
  stopSkiSound();
  stopWhoosh();
  stopSnowCrunch();
  stopCarving();
  stopSpray();
  stopTuckWind();
}

/**
 * Clean up audio system
 */
export function disposeAudio(): void {
  stopAllSounds();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  masterGain = null;
  isAudioInitialized = false;
}

// ==================== MARIO KART STYLE CHIPTUNE MUSIC ====================
// Style: Upbeat 8-bit racing music with catchy melody

let musicGain: GainNode | null = null;
let musicPlaying = false;
let nextNoteTime = 0;
let currentStep = 0;
let timerID: number | null = null;
const BPM = 140;
const STEP_TIME = 60 / BPM / 4; // 16th notes

// Pre-created noise buffer for drums (created once, reused)
let noiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(): AudioBuffer {
  if (!noiseBuffer && audioContext) {
    noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer!;
}

// Mario Kart style melody - C major, upbeat and catchy
// Pattern: 64 steps (4 bars of 16th notes)
const MELODY = [
  523, 0, 659, 0, 784, 0, 659, 0, 523, 0, 659, 0, 784, 1047, 0, 0,  // Bar 1
  880, 0, 784, 0, 659, 0, 523, 0, 587, 0, 659, 0, 523, 0, 0, 0,     // Bar 2
  523, 0, 659, 0, 784, 0, 880, 0, 1047, 0, 880, 0, 784, 659, 0, 0,  // Bar 3
  784, 0, 659, 0, 523, 0, 587, 0, 523, 0, 0, 0, 0, 0, 0, 0,         // Bar 4
];

// Bass line - follows chord progression
const BASS = [
  131, 0, 0, 131, 0, 0, 131, 0, 165, 0, 0, 165, 0, 0, 165, 0,  // C, E
  175, 0, 0, 175, 0, 0, 175, 0, 196, 0, 0, 196, 0, 0, 196, 0,  // F, G
  131, 0, 0, 131, 0, 0, 131, 0, 165, 0, 0, 165, 0, 0, 165, 0,  // C, E
  175, 0, 0, 175, 0, 0, 196, 0, 131, 0, 0, 0, 0, 0, 0, 0,      // F, G, C
];

// Arpeggio pattern for sparkle
const ARP = [
  0, 1047, 0, 1319, 0, 1568, 0, 1319, 0, 1047, 0, 1319, 0, 1568, 0, 0,
  0, 1175, 0, 1397, 0, 1760, 0, 1397, 0, 1175, 0, 1397, 0, 1760, 0, 0,
  0, 1047, 0, 1319, 0, 1568, 0, 1319, 0, 1047, 0, 1319, 0, 1568, 0, 0,
  0, 1175, 0, 1568, 0, 1976, 0, 1568, 0, 1047, 0, 0, 0, 0, 0, 0,
];

// Drum pattern
const KICK_PATTERN =  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
const SNARE_PATTERN = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
const HAT_PATTERN =   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0];

/**
 * Schedule a chiptune note (square wave)
 */
function scheduleNote(freq: number, time: number, duration: number, volume: number, type: OscillatorType = 'square'): void {
  if (!audioContext || !musicGain || freq <= 0) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(volume, time);
  gain.gain.setValueAtTime(volume * 0.8, time + duration * 0.5);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  osc.connect(gain);
  gain.connect(musicGain);

  osc.start(time);
  osc.stop(time + duration + 0.01);
}

/**
 * Schedule kick drum
 */
function scheduleKick(time: number): void {
  if (!audioContext || !musicGain) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);

  gain.gain.setValueAtTime(0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  osc.connect(gain);
  gain.connect(musicGain);

  osc.start(time);
  osc.stop(time + 0.1);
}

/**
 * Schedule snare
 */
function scheduleSnare(time: number): void {
  if (!audioContext || !musicGain) return;

  const noise = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  noise.buffer = getNoiseBuffer();
  filter.type = 'highpass';
  filter.frequency.value = 3000;

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);

  noise.start(time);
  noise.stop(time + 0.08);
}

/**
 * Schedule hi-hat
 */
function scheduleHiHat(time: number): void {
  if (!audioContext || !musicGain) return;

  const noise = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  noise.buffer = getNoiseBuffer();
  filter.type = 'highpass';
  filter.frequency.value = 8000;

  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);

  noise.start(time);
  noise.stop(time + 0.03);
}

/**
 * Scheduler - runs ahead of time to schedule notes
 * CRITICAL: Uses 500ms lookahead to survive main thread blocking during animations
 */
function scheduler(): void {
  if (!audioContext || !musicPlaying) return;

  // Schedule notes 500ms ahead - this survives heavy animation frame drops
  // The audio thread plays scheduled notes on time regardless of main thread
  while (nextNoteTime < audioContext.currentTime + 0.5) {
    const step = currentStep % 64;
    const drumStep = currentStep % 16;

    // Melody (square wave - classic chiptune)
    const melodyNote = MELODY[step];
    if (melodyNote > 0) {
      scheduleNote(melodyNote, nextNoteTime, STEP_TIME * 1.5, 0.12, 'square');
    }

    // Bass (triangle wave - softer)
    const bassNote = BASS[step];
    if (bassNote > 0) {
      scheduleNote(bassNote, nextNoteTime, STEP_TIME * 2, 0.2, 'triangle');
    }

    // Arpeggio (pulse for sparkle)
    const arpNote = ARP[step];
    if (arpNote > 0) {
      scheduleNote(arpNote, nextNoteTime, STEP_TIME * 0.8, 0.06, 'square');
    }

    // Drums
    if (KICK_PATTERN[drumStep]) {
      scheduleKick(nextNoteTime);
    }
    if (SNARE_PATTERN[drumStep]) {
      scheduleSnare(nextNoteTime);
    }
    if (HAT_PATTERN[drumStep]) {
      scheduleHiHat(nextNoteTime);
    }

    // Advance
    nextNoteTime += STEP_TIME;
    currentStep++;
  }
}

/**
 * Start Mario Kart style chiptune music - 140 BPM
 */
export function startBackgroundMusic(): void {
  if (!audioContext || !masterGain || musicPlaying) return;

  try {
    musicGain = audioContext.createGain();
    musicGain.gain.value = 0.18; // Balanced with sound effects
    musicGain.connect(masterGain);

    // Initialize noise buffer
    getNoiseBuffer();

    musicPlaying = true;
    currentStep = 0;
    nextNoteTime = audioContext.currentTime;

    // Schedule first batch of notes immediately
    scheduler();

    // Use lookahead scheduler with 50ms interval
    // With 500ms lookahead, we can survive up to 450ms of main thread blocking
    timerID = window.setInterval(scheduler, 50);

    console.log('🏎️ Mario Kart style music started! 140 BPM');
  } catch (e) {
    console.warn('Failed to start music:', e);
  }
}

/**
 * Stop background music
 */
export function stopBackgroundMusic(): void {
  musicPlaying = false;

  if (timerID !== null) {
    clearInterval(timerID);
    timerID = null;
  }

  if (musicGain) {
    musicGain.disconnect();
    musicGain = null;
  }

  console.log('🏎️ Music stopped');
}

/**
 * Set music volume (0-1)
 */
export function setMusicVolume(volume: number): void {
  if (musicGain) {
    musicGain.gain.value = Math.max(0, Math.min(1, volume)) * 0.5;
  }
}

// ==================== GAME AUDIO MANAGER ====================

export interface GameAudioState {
  isPlaying: boolean;
  isMuted: boolean;
  musicEnabled: boolean;
}

const audioState: GameAudioState = {
  isPlaying: false,
  isMuted: false,
  musicEnabled: true,
};

/**
 * Start all game audio
 */
export function startGameAudio(): void {
  if (audioState.isPlaying) return;

  initAudio();
  resumeAudio();
  startWindAmbiance();
  startSkiSound();
  startWhoosh();

  // Start realistic winter sports sounds
  startSnowCrunch();
  startCarving();
  startSpray();
  startTuckWind();

  // Start music if enabled
  if (audioState.musicEnabled) {
    startBackgroundMusic();
  }

  audioState.isPlaying = true;
  console.log('🎵 Game audio started with winter sports sounds');
}

/**
 * Stop all game audio
 */
export function stopGameAudio(): void {
  stopAllSounds();
  stopBackgroundMusic();
  audioState.isPlaying = false;
}

/**
 * Update all game audio based on game state
 */
export function updateGameAudio(
  speed: number,
  maxSpeed: number,
  turning: number,
  isTucking: boolean = false
): void {
  if (!audioState.isPlaying || audioState.isMuted) return;

  // Base ambient sounds
  updateWindIntensity(speed, maxSpeed);
  updateSkiSound(speed, maxSpeed, turning);
  updateWhoosh(speed, maxSpeed);

  // Realistic winter sports sounds
  updateSnowCrunch(speed, maxSpeed);
  updateCarving(turning, speed, maxSpeed);
  updateSpray(speed, maxSpeed);
  updateTuckWind(isTucking, speed, maxSpeed);
}

/**
 * Toggle mute
 */
export function toggleMute(): boolean {
  audioState.isMuted = !audioState.isMuted;
  if (audioState.isMuted) {
    muteAudio();
  } else {
    unmuteAudio();
  }
  return audioState.isMuted;
}

/**
 * Toggle background music
 */
export function toggleMusic(): boolean {
  audioState.musicEnabled = !audioState.musicEnabled;
  if (audioState.musicEnabled && audioState.isPlaying) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
  console.log(`🎸 Music ${audioState.musicEnabled ? 'enabled' : 'disabled'}`);
  return audioState.musicEnabled;
}
