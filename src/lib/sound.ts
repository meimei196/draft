// Web Audio API Sound Effects for UI Interactions

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Animated pop / chime sound when clicking a bot card
 */
export function playCardClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    console.debug('Audio play failed:', e);
  }
}

/**
 * Sparkly chime sound when clicking "Thông điệp hôm nay"
 */
export function playFortuneClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fast ascending sparkly chime arpeggio (C5, E5, G5, B5, C6)
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch (e) {
    console.debug('Audio play failed:', e);
  }
}

/**
 * Majestic portal sound when entering through the gate
 */
export function playPortalEnterSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Ethereal chord progression (E4, B4, E5, G#5, B5)
    const freqs = [329.63, 493.88, 659.25, 830.61, 987.77];
    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    console.debug('Audio play failed:', e);
  }
}

export function playRandomHusbandSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Bouncy energetic gacha sequence
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  } catch (e) {
    console.debug('Audio play failed:', e);
  }
}

/**
 * Gentle water droplet sound followed by a blossoming chime
 */
export function playWaterBloomSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Water droplet sound (pitch glide down then up)
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(600, now);
    dropOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    dropGain.gain.setValueAtTime(0.2, now);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    dropOsc.connect(dropGain);
    dropGain.connect(ctx.destination);
    dropOsc.start(now);
    dropOsc.stop(now + 0.12);

    // Blooming chord chime (F5, A5, C6, E6)
    const chord = [698.46, 880.00, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      const startTime = now + 0.1 + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    console.debug('Audio play failed:', e);
  }
}
