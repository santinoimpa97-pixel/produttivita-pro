import confetti from 'canvas-confetti';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant ascending harmonic chime when a task is completed.
 */
export const playTaskCompleteSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

/**
 * Plays a calm bell/chime when a Pomodoro timer expires.
 */
export const playTimerEndSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const fundamental = 440; // A4
    const harmonics = [fundamental, fundamental * 1.5, fundamental * 2];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const initialVolume = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(initialVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.6);
    });
  } catch (e) {
    console.warn('Timer sound failed:', e);
  }
};

/**
 * Fires a colorful celebration confetti blast.
 */
export const triggerCelebrationConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#3b82f6', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.warn('Confetti failed:', e);
  }
};

// Ambient Sound Generator (synthesized brown noise for focus)
let ambientNode: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export const startAmbientSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ambientNode) return; // already playing

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost volume
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.05, ctx.currentTime);

    whiteNoise.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    whiteNoise.start();
    ambientNode = whiteNoise;
  } catch (e) {
    console.warn('Ambient noise failed:', e);
  }
};

export const stopAmbientSound = () => {
  try {
    if (ambientNode) {
      (ambientNode as any).stop?.();
      ambientNode.disconnect();
      ambientNode = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
  } catch (e) {
    console.warn('Stop ambient failed:', e);
  }
};
