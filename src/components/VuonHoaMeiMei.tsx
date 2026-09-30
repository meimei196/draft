import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import './vuonhoa.css';

interface VuonHoaMeiMeiProps {
  onBack: () => void;
}

export function VuonHoaMeiMei({ onBack }: VuonHoaMeiMeiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Helper functions
    const $ = (id: string) => root.querySelector<HTMLElement>(`#${id}`);
    const game = $('game');
    const veil = $('veil');
    const sheet = $('sheet');
    const actor = $('character');
    const canvas = root.querySelector<HTMLCanvasElement>('#weatherCanvas');
    if (!game || !veil || !sheet || !actor || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const streakKey = 'mong-mien-pixel-garden-v1';
    const inventoryKey = 'mong-mien-garden-inventory-v3';
    const prefKey = 'mong-mien-garden-preferences-v2';

    const girlBody = '/stardew/bodySprite.webp';
    const girlFaces = '/stardew/portrait.webp';
    const boyBody = '/stardew/boyAsset.webp';
    const boyFaces = '/stardew/boyEmotes.webp';

    const moodMap: Record<string, { x: string; y: string; icon: string; label: string }> = {
      happy: { x: '0%', y: '0%', icon: '♡', label: 'Vui quá!' },
      shy: { x: '-100%', y: '0%', icon: '✧', label: 'Hơi ngại một chút…' },
      surprised: { x: '0%', y: '-100%', icon: '!', label: 'Ơ, chuyện gì thế?' },
      sad: { x: '-100%', y: '-100%', icon: '…', label: 'Cần nghỉ một chút.' }
    };

    const safeRead = <T,>(key: string, fallback: T): T => {
      try {
        const item = localStorage.getItem(key);
        return item ? { ...fallback, ...JSON.parse(item) } : { ...fallback };
      } catch {
        return { ...fallback };
      }
    };

    const save = (key: string, value: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    };

    const day = (date = new Date()) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);

    const yesterday = () => day(new Date(Date.now() - 86400000));

    let prefs = safeRead(prefKey, { gender: 'girl', mood: 'happy', weather: 'morning' });
    let inventory = safeRead(inventoryKey, { petals: 0, fish: 0, stars: 0, lastStar: '' });
    let activity = 'garden';
    let traveling = false;
    let busy = false;
    let fishReady = false;
    let reactionTimer: any = null;
    let soundOn = false;
    let audioContext: AudioContext | null = null;
    let ambientSource: AudioBufferSourceNode | null = null;
    let ambientGain: GainNode | null = null;
    let ambientDroneOsc1: OscillatorNode | null = null;
    let ambientDroneOsc2: OscillatorNode | null = null;
    let ambientDroneGain: GainNode | null = null;
    let peaceMelodyTimer: any = null;
    let natureBirdTimer: any = null;
    let animationFrameId: number | null = null;
    let clockIntervalId: any = null;

    function streak() {
      const s = safeRead(streakKey, { last: '', count: 0 });
      return {
        ...s,
        count: s.last === day() || s.last === yesterday() ? s.count : 0,
        done: s.last === day()
      };
    }

    function updateHud() {
      const s = streak();
      const pill = $('pill');
      if (pill) pill.textContent = 'ngày ' + Math.max(1, s.count);
      const status = $('status');
      if (status) status.textContent = `${inventory.petals} cánh · ${inventory.fish} cá · ${inventory.stars} sao`;
    }

    function updateClock() {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(new Date());

      const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0);
      const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0);

      const hourHand = $('hourHand');
      const minuteHand = $('minuteHand');
      const clock = $('clock');

      if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${(hour % 12) * 30 + minute * 0.5}deg)`;
      if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${minute * 6}deg)`;
      if (clock)
        clock.setAttribute(
          'aria-label',
          `Đồng hồ ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
    }

    function setSheetPosition(img: HTMLElement | null, mood: string) {
      if (!img) return;
      const m = moodMap[mood] || moodMap.happy;
      img.style.setProperty('--px', m.x);
      img.style.setProperty('--py', m.y);
    }

    function updateCharacter(showReaction = false) {
      const m = moodMap[prefs.mood] || moodMap.happy;
      const male = prefs.gender === 'boy';
      const body = male ? boyBody : girlBody;
      const faces = male ? boyFaces : girlFaces;

      const bodySprite = root?.querySelector<HTMLImageElement>('#bodySprite');
      const portrait = root?.querySelector<HTMLImageElement>('#portrait');
      const reactionPortrait = root?.querySelector<HTMLImageElement>('#reactionPortrait');

      if (bodySprite && bodySprite.src !== body) bodySprite.src = body;
      if (portrait && portrait.src !== faces) portrait.src = faces;
      if (reactionPortrait && reactionPortrait.src !== faces) reactionPortrait.src = faces;

      setSheetPosition(bodySprite, prefs.mood);
      setSheetPosition(portrait, prefs.mood);
      setSheetPosition(reactionPortrait, prefs.mood);

      actor.dataset.mood = prefs.mood;
      actor.setAttribute('aria-label', `Nhân vật ${male ? 'nam' : 'nữ'} đang ${prefs.mood} trên lối đá`);

      const emoteBubble = $('emoteBubble');
      if (emoteBubble) emoteBubble.textContent = m.icon;

      const reactionLabel = $('reactionLabel');
      if (reactionLabel) reactionLabel.textContent = m.label;

      root?.querySelectorAll<HTMLElement>('[data-gender]').forEach((el) => {
        const on = el.dataset.gender === prefs.gender;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', String(on));
      });

      root?.querySelectorAll<HTMLElement>('[data-mood-choice]').forEach((el) => {
        const on = el.dataset.moodChoice === prefs.mood;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', String(on));
      });

      if (showReaction) {
        clearTimeout(reactionTimer);
        const reaction = $('reaction');
        if (reaction) {
          reaction.classList.add('show');
          reactionTimer = setTimeout(() => reaction.classList.remove('show'), 2600);
        }
        playTone(prefs.mood === 'sad' ? 330 : 620, 0.12, 'sine', 0.025);
      }
    }

    function setMood(mood: string, show = true) {
      prefs.mood = mood;
      save(prefKey, prefs);
      updateCharacter(show);
    }

    function setWeather(weather: string) {
      prefs.weather = weather;
      save(prefKey, prefs);
      game.dataset.weather = weather;

      root?.querySelectorAll<HTMLElement>('[data-weather-choice]').forEach((el) => {
        const on = el.dataset.weatherChoice === weather;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', String(on));
      });

      seedParticles();
      updateAmbient();
      if (weather === 'storm') setMood('surprised', true);
    }

    function ensureAudio() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }

    function playTone(
      frequency: number,
      duration = 0.14,
      type: OscillatorType = 'sine',
      level = 0.035,
      offset = 0
    ) {
      if (!soundOn) return;
      ensureAudio();
      if (!audioContext) return;
      const t = audioContext.currentTime + offset;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain).connect(audioContext.destination);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    }

    function playStep() {
      playTone(100, 0.085, 'triangle', 0.045);
      playTone(170, 0.055, 'sine', 0.015, 0.035);
    }

    function playWater() {
      [610, 480, 360].forEach((f, i) => playTone(f, 0.19, 'sine', 0.032, i * 0.14));
    }

    function playFish() {
      [160, 110, 230].forEach((f, i) => playTone(f, 0.16, 'triangle', 0.04, i * 0.09));
    }

    function playStars() {
      [523, 659, 784, 1046].forEach((f, i) => playTone(f, 0.7, 'sine', 0.028, i * 0.16));
    }

    function playPeaceChime(freq: number, offset = 0, vol = 0.024) {
      if (!soundOn || !audioContext) return;
      ensureAudio();
      const t = audioContext.currentTime + offset;
      const osc = audioContext.createOscillator();
      const overtone = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(t);
      overtone.start(t);
      osc.stop(t + 1.9);
      overtone.stop(t + 1.9);
    }

    function playBirdChirp() {
      if (!soundOn || !audioContext) return;
      if (!['morning', 'sunny'].includes(prefs.weather)) return;
      ensureAudio();
      const t = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(3200, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(2800, t + 0.12);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.012, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

      osc.connect(gain).connect(audioContext.destination);
      osc.start(t);
      osc.stop(t + 0.14);

      setTimeout(() => {
        if (!soundOn || !audioContext) return;
        const t2 = audioContext.currentTime;
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2800, t2);
        osc2.frequency.exponentialRampToValueAtTime(3500, t2 + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(3100, t2 + 0.11);
        gain2.gain.setValueAtTime(0.0001, t2);
        gain2.gain.linearRampToValueAtTime(0.01, t2 + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.12);
        osc2.connect(gain2).connect(audioContext.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.13);
      }, 160);
    }

    const pentatonicNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

    function scheduleNextMelody() {
      if (!soundOn) return;
      const delay = 3400 + Math.random() * 2800;
      peaceMelodyTimer = setTimeout(() => {
        if (!soundOn) return;
        const note1 = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
        playPeaceChime(note1, 0, 0.02);
        if (Math.random() > 0.45) {
          const note2 = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
          playPeaceChime(note2, 0.32, 0.016);
        }
        scheduleNextMelody();
      }, delay);
    }

    function scheduleNextBird() {
      if (!soundOn) return;
      const delay = 9000 + Math.random() * 7000;
      natureBirdTimer = setTimeout(() => {
        if (!soundOn) return;
        playBirdChirp();
        scheduleNextBird();
      }, delay);
    }

    function startPeacefulAudio() {
      stopPeacefulAudio();
      if (!soundOn) return;
      ensureAudio();
      if (!audioContext) return;

      try {
        ambientDroneOsc1 = audioContext.createOscillator();
        ambientDroneOsc2 = audioContext.createOscillator();
        const droneFilter = audioContext.createBiquadFilter();
        ambientDroneGain = audioContext.createGain();

        const isNight = prefs.weather === 'night';
        ambientDroneOsc1.type = 'sine';
        ambientDroneOsc1.frequency.setValueAtTime(isNight ? 146.83 : 174.61, audioContext.currentTime);

        ambientDroneOsc2.type = 'triangle';
        ambientDroneOsc2.frequency.setValueAtTime(isNight ? 220.0 : 261.63, audioContext.currentTime);

        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(isNight ? 240 : 360, audioContext.currentTime);

        ambientDroneGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        ambientDroneGain.gain.exponentialRampToValueAtTime(0.015, audioContext.currentTime + 1.6);

        ambientDroneOsc1.connect(droneFilter);
        ambientDroneOsc2.connect(droneFilter);
        droneFilter.connect(ambientDroneGain);
        ambientDroneGain.connect(audioContext.destination);

        ambientDroneOsc1.start();
        ambientDroneOsc2.start();
      } catch (err) {
        console.warn('Drone error:', err);
      }

      scheduleNextMelody();
      scheduleNextBird();
    }

    function stopPeacefulAudio() {
      if (peaceMelodyTimer) {
        clearTimeout(peaceMelodyTimer);
        peaceMelodyTimer = null;
      }
      if (natureBirdTimer) {
        clearTimeout(natureBirdTimer);
        natureBirdTimer = null;
      }
      if (ambientDroneOsc1) {
        try {
          ambientDroneOsc1.stop();
          ambientDroneOsc1.disconnect();
        } catch {}
        ambientDroneOsc1 = null;
      }
      if (ambientDroneOsc2) {
        try {
          ambientDroneOsc2.stop();
          ambientDroneOsc2.disconnect();
        } catch {}
        ambientDroneOsc2 = null;
      }
      if (ambientDroneGain) {
        try {
          ambientDroneGain.disconnect();
        } catch {}
        ambientDroneGain = null;
      }
    }

    function updateAmbient() {
      if (ambientSource) {
        try {
          ambientSource.stop();
        } catch {}
        ambientSource = null;
      }

      if (!soundOn) {
        stopPeacefulAudio();
        return;
      }

      ensureAudio();
      if (!audioContext) return;

      // Start peaceful chimes, nature birds, and warm ambient pad
      startPeacefulAudio();

      // If rain or storm, also add gentle rain noise layer
      if (['rain', 'storm'].includes(prefs.weather)) {
        const length = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;

        ambientSource = audioContext.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = prefs.weather === 'storm' ? 900 : 1550;

        ambientGain = audioContext.createGain();
        ambientGain.gain.value = prefs.weather === 'storm' ? 0.035 : 0.022;

        ambientSource.connect(filter).connect(ambientGain).connect(audioContext.destination);
        ambientSource.start();
      }
    }

    const soundBtn = $('sound');
    soundBtn?.addEventListener('click', () => {
      soundOn = !soundOn;
      if (soundOn) {
        ensureAudio();
        playTone(660, 0.2, 'sine', 0.035);
      }
      updateAmbient();
      soundBtn.classList.toggle('on', soundOn);
      soundBtn.setAttribute('aria-pressed', String(soundOn));
      soundBtn.setAttribute('aria-label', soundOn ? 'Tắt âm thanh' : 'Bật âm thanh');
      soundBtn.title = soundOn ? 'Tắt âm thanh' : 'Bật âm thanh';
    });

    let W = 0;
    let H = 0;
    let particles: Array<{ x: number; y: number; speed: number; size: number; phase: number }> = [];

    function resizeCanvas() {
      const r = game.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    }

    function seedParticles() {
      const w = prefs.weather;
      const count =
        w === 'storm' ? 115 : w === 'rain' ? 75 : w === 'snow' ? 58 : w === 'night' ? 42 : 18;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * Math.max(W, 1),
        y: Math.random() * Math.max(H, 1),
        speed: 1 + Math.random() * 3,
        size: 1 + Math.random() * 2,
        phase: Math.random() * 6.28
      }));
    }

    function frame(t: number) {
      ctx.clearRect(0, 0, W, H);
      const w = prefs.weather;
      if (w === 'rain' || w === 'storm') {
        const storm = w === 'storm';
        ctx.strokeStyle = storm ? 'rgba(225,235,232,.39)' : 'rgba(231,239,236,.32)';
        ctx.lineWidth = storm ? 1.25 : 0.9;
        particles.forEach((p) => {
          const len = (storm ? 11 : 7) + p.size * 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (storm ? 5 : 2), p.y + len);
          ctx.stroke();
          p.x -= (storm ? 1.9 : 0.7) * p.speed;
          p.y += (storm ? 5.2 : 3.3) * p.speed;
          if (p.y > H + 20 || p.x < -20) {
            p.y = -20;
            p.x = Math.random() * W + 20;
          }
        });
      } else if (w === 'snow') {
        ctx.fillStyle = 'rgba(255,255,250,.82)';
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed * 0.55;
          p.x += Math.sin(t * 0.001 + p.phase) * 0.32;
          if (p.y > H + 5) {
            p.y = -5;
            p.x = Math.random() * W;
          }
        });
      } else if (w === 'night') {
        particles.forEach((p) => {
          const a = 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.002 + p.phase));
          ctx.fillStyle = `rgba(255,244,203,${a})`;
          ctx.fillRect(p.x, p.y * 0.58, p.size, p.size);
        });
      } else if (w === 'sunny' || w === 'morning') {
        particles.forEach((p) => {
          ctx.fillStyle = `rgba(255,242,199,${0.13 + 0.12 * Math.sin(t * 0.001 + p.phase)})`;
          ctx.fillRect(p.x, p.y, p.size * 1.3, p.size * 1.3);
          p.y -= 0.14;
          if (p.y < 0) p.y = H;
        });
      }
      animationFrameId = requestAnimationFrame(frame);
    }

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(game);
    resizeCanvas();
    animationFrameId = requestAnimationFrame(frame);

    function walkTo(x: number, y: number, onArrival?: () => void) {
      if (traveling) return;
      traveling = true;
      actor.classList.add('walk');
      actor.style.left = x + '%';
      actor.style.top = y + '%';
      let steps = 0;
      const timer = setInterval(() => {
        playStep();
        if (++steps >= 4) clearInterval(timer);
      }, 180);
      setTimeout(() => {
        actor.classList.remove('walk');
        traveling = false;
        onArrival?.();
      }, 900);
    }

    function openAvatarPanel() {
      const panel = $('avatarPanel');
      const trig = $('avatarTrigger');
      if (panel) {
        panel.hidden = false;
        panel.removeAttribute('hidden');
        panel.classList.remove('is-hidden');
        panel.style.display = 'block';
      }
      if (trig) trig.setAttribute('aria-expanded', 'true');
    }

    function closeAvatarPanel() {
      const panel = $('avatarPanel');
      const trig = $('avatarTrigger');
      if (panel) {
        panel.hidden = true;
        panel.setAttribute('hidden', '');
        panel.classList.add('is-hidden');
        panel.style.display = 'none';
      }
      if (trig) trig.setAttribute('aria-expanded', 'false');
    }

    function toggleAvatarPanel(e?: Event) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const panel = $('avatarPanel');
      if (!panel) return;
      const isHidden =
        panel.hidden ||
        panel.hasAttribute('hidden') ||
        panel.classList.contains('is-hidden') ||
        panel.style.display === 'none';
      if (isHidden) {
        openAvatarPanel();
      } else {
        closeAvatarPanel();
      }
    }

    function visit(place: string) {
      if (traveling || veil.classList.contains('open')) return;
      closeAvatarPanel();
      if (place === 'stars' && prefs.weather !== 'night') setWeather('night');
      const targets: Record<string, [number, number]> = {
        garden: [39, 47],
        fish: [65, 48],
        stars: [53, 33]
      };
      const dest = targets[place] || [50, 50];
      walkTo(dest[0], dest[1], () => openActivity(place));
    }

    const handleGameClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, .top, .reaction, .weather-picker, .avatar-panel, .avatar-dock, #avatarTrigger, #avatarPanel, .dock-hint')) {
        return;
      }
      closeAvatarPanel();

      const r = game.getBoundingClientRect();
      const x = Math.max(32, Math.min(70, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.max(35, Math.min(68, ((e.clientY - r.top) / r.height) * 100));
      walkTo(x, y);
    };
    game.addEventListener('click', handleGameClick);

    root.querySelectorAll<HTMLElement>('[data-place]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.dataset.place) visit(el.dataset.place);
      });
    });

    root.querySelectorAll<HTMLElement>('[data-weather-choice]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.dataset.weatherChoice) setWeather(el.dataset.weatherChoice);
      });
    });

    root.querySelectorAll<HTMLElement>('[data-gender]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.dataset.gender) {
          prefs.gender = el.dataset.gender;
          save(prefKey, prefs);
          updateCharacter(true);
        }
      });
    });

    root.querySelectorAll<HTMLElement>('[data-mood-choice]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.dataset.moodChoice) setMood(el.dataset.moodChoice, true);
      });
    });

    const avatarTrigger = $('avatarTrigger');
    avatarTrigger?.addEventListener('click', toggleAvatarPanel);

    const dockHint = root.querySelector<HTMLElement>('.dock-hint');
    dockHint?.addEventListener('click', toggleAvatarPanel);

    const avatarPanel = $('avatarPanel');
    avatarPanel?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    $('closeAvatar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAvatarPanel();
    });

    function renderActivity() {
      const s = streak();
      sheet.dataset.activity = activity;
      $('fishScene')?.classList.remove('caught');
      $('starScene')?.classList.toggle('found', inventory.lastStar === day());

      const journalTop = $('journalTop');
      const dialogTitle = $('dialogTitle');
      const dialogSub = $('dialogSub');
      const progressLabel = $('progressLabel');
      const count = $('count');
      const rewardText = $('rewardText');
      const waterBtn = root?.querySelector<HTMLButtonElement>('#water');

      if (activity === 'garden') {
        if (journalTop) journalTop.textContent = 'botanical journal · nhà kính';
        if (dialogTitle) dialogTitle.textContent = s.done ? 'Hoa đã được chăm rồi.' : 'Một chút nước cho hoa.';
        if (dialogSub)
          dialogSub.textContent = s.done ? 'Mai lại ghé nhà kính nhé.' : 'Ghé qua mỗi ngày để khu vườn lớn lên.';
        if (progressLabel) progressLabel.textContent = 'Nhật ký chăm hoa';
        if (count) count.textContent = s.count + ' ngày liên tiếp';
        if (rewardText)
          rewardText.innerHTML = s.done ? 'Đã nhận <b>+10 cánh hoa</b>' : 'Nhận <b>+10 cánh hoa</b> hôm nay';
        if (waterBtn) {
          waterBtn.textContent = s.done ? 'Đã chăm cây hôm nay ✓' : 'Tưới cây · nhận 10 cánh';
          waterBtn.disabled = s.done;
        }

        root?.querySelectorAll<HTMLElement>('.day').forEach((el) => {
          const n = Number(el.dataset.day);
          el.classList.toggle('on', s.count >= n);
          el.classList.toggle('today', s.done && s.count === n);
        });
      } else if (activity === 'fish') {
        fishReady = false;
        if (journalTop) journalTop.textContent = 'pond journal · hồ nhỏ';
        if (dialogTitle) dialogTitle.textContent = 'Có gì dưới mặt hồ?';
        if (dialogSub) dialogSub.textContent = 'Thả câu, đợi phao động rồi giật cần.';
        if (progressLabel) progressLabel.textContent = 'Bộ sưu tập';
        if (count) count.textContent = inventory.fish + ' con cá';
        if (rewardText) rewardText.innerHTML = 'Mỗi lần câu được cá nhận <b>+2 cánh hoa</b>';
        if (waterBtn) {
          waterBtn.textContent = 'Thả câu';
          waterBtn.disabled = false;
        }
      } else {
        const found = inventory.lastStar === day();
        if (journalTop) journalTop.textContent = 'sky journal · đêm nay';
        if (dialogTitle) dialogTitle.textContent = found ? 'Đã tìm thấy một chòm sao.' : 'Ngẩng lên nhìn trời.';
        if (dialogSub)
          dialogSub.textContent = found ? 'Đêm mai bầu trời sẽ kể tiếp.' : 'Nối ánh sáng của bốn ngôi sao trên cao.';
        if (progressLabel) progressLabel.textContent = 'Bản đồ sao';
        if (count) count.textContent = inventory.stars + ' mảnh sao';
        if (rewardText)
          rewardText.innerHTML = found ? 'Đã nhặt <b>1 mảnh sao</b> đêm nay' : 'Khám phá nhận <b>1 mảnh sao</b>';
        if (waterBtn) {
          waterBtn.textContent = found ? 'Đã ngắm sao đêm nay ✓' : 'Tìm chòm sao';
          waterBtn.disabled = found;
        }
      }
      updateHud();
    }

    function openActivity(place: string) {
      activity = place;
      renderActivity();
      veil.classList.add('open');
      veil.setAttribute('aria-hidden', 'false');
      $('close')?.focus();
    }

    function closeActivity() {
      veil.classList.remove('open');
      veil.setAttribute('aria-hidden', 'true');
      sheet.classList.remove('watering', 'blooming');
    }

    $('close')?.addEventListener('click', closeActivity);
    veil.addEventListener('click', (e) => {
      if (e.target === veil) closeActivity();
    });

    const waterBtn = root.querySelector<HTMLButtonElement>('#water');
    waterBtn?.addEventListener('click', () => {
      if (busy) return;
      if (activity === 'garden') {
        if (streak().done) return;
        busy = true;
        sheet.classList.add('watering');
        playWater();
        const s = streak();
        save(streakKey, { last: day(), count: s.last === yesterday() ? s.count + 1 : 1 });
        inventory.petals += 10;
        save(inventoryKey, inventory);
        setTimeout(() => {
          sheet.classList.remove('watering');
          sheet.classList.add('blooming');
          setMood('happy', false);
          renderActivity();
          busy = false;
        }, 900);
      } else if (activity === 'fish') {
        if (!fishReady) {
          busy = true;
          waterBtn.disabled = true;
          waterBtn.textContent = 'Phao đang chờ cá…';
          playTone(270, 0.2, 'sine', 0.025);
          setTimeout(() => {
            fishReady = true;
            busy = false;
            waterBtn.disabled = false;
            waterBtn.textContent = 'Giật cần!';
            const sub = $('dialogSub');
            if (sub) sub.textContent = 'Phao vừa động. Giật cần ngay!';
            playFish();
          }, 1200);
        } else {
          fishReady = false;
          inventory.fish++;
          inventory.petals += 2;
          save(inventoryKey, inventory);
          const fishScene = $('fishScene');
          if (fishScene) {
            fishScene.classList.remove('caught');
            void fishScene.offsetWidth;
            fishScene.classList.add('caught');
          }
          playFish();
          setMood('surprised', false);
          renderActivity();
          const dTitle = $('dialogTitle');
          const dSub = $('dialogSub');
          if (dTitle) dTitle.textContent = 'Câu được một con cá!';
          if (dSub) dSub.textContent = 'Mặt hồ lại yên. Bạn có thể thả câu tiếp.';
        }
      } else {
        if (inventory.lastStar === day()) return;
        inventory.lastStar = day();
        inventory.stars++;
        save(inventoryKey, inventory);
        $('starScene')?.classList.add('found');
        playStars();
        setMood('happy', false);
        renderActivity();
      }
    });

    $('reset')?.addEventListener('click', () => {
      try {
        localStorage.removeItem(streakKey);
        localStorage.removeItem(inventoryKey);
      } catch {}
      inventory = { petals: 0, fish: 0, stars: 0, lastStar: '' };
      sheet.classList.remove('watering', 'blooming');
      renderActivity();
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (!veil.classList.contains('open')) return;
      if (e.key === 'Escape') closeActivity();
    };
    window.addEventListener('keydown', handleKeydown);

    // Initial setup
    updateCharacter(false);
    setWeather(prefs.weather);
    updateHud();
    updateClock();
    clockIntervalId = setInterval(updateClock, 30000);

    return () => {
      stopPeacefulAudio();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (clockIntervalId) clearInterval(clockIntervalId);
      if (reactionTimer) clearTimeout(reactionTimer);
      if (ambientSource) {
        try {
          ambientSource.stop();
        } catch {}
      }
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch {}
      }
      resizeObserver.disconnect();
      game.removeEventListener('click', handleGameClick);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <div className="vuon-hoa-page relative w-full h-full min-h-screen overflow-x-hidden bg-[#292c27] select-none">
      {/* Floating Back Navigation Button (Icon Only) */}
      <div className="fixed top-3.5 left-3.5 z-[100]">
        <button
          onClick={onBack}
          type="button"
          aria-label="Quay lại"
          title="Quay lại"
          className="w-9 h-9 rounded-full bg-[#1b221d]/85 hover:bg-[#2e3b31] border border-[#dcd3bf]/40 text-[#f5efe4] flex items-center justify-center shadow-lg backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#f5efe4]" />
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full">
        <div className="shell">
          <main
            className="game"
            id="game"
            data-weather="morning"
            aria-label="Khu vườn hoa pixel có thể tương tác"
          >
            <div className="world">
              <img
                id="gardenImage"
                src="/stardew/gardenImage.webp"
                alt="Khu vườn hoa pixel với nhà kính, hồ nhỏ và lối đi bằng đá"
              />
              {/* Mặt hồ nước động (Animated Pond Water Layer) */}
              <div className="pond-water-layer" aria-hidden="true">
                <div className="pond-water-caustic"></div>
                <div className="pond-water-shimmer"></div>
                <div className="pond-water-wave-grid"></div>
                <div className="p-ripple pr1"></div>
                <div className="p-ripple pr2"></div>
                <div className="p-ripple pr3"></div>
                <div className="p-ripple pr4"></div>
                <span className="p-sparkle sp1">✦</span>
                <span className="p-sparkle sp2">✧</span>
                <span className="p-sparkle sp3">✦</span>
                <span className="p-sparkle sp4">✧</span>
              </div>
            </div>
            <div className="weather-light"></div>
            <div className="mist"></div>
            <canvas className="weather-canvas" id="weatherCanvas" aria-hidden="true"></canvas>
            <div className="grain"></div>

            <header className="top">
              <div className="top-actions">
                <button
                  className="sound-btn"
                  id="sound"
                  type="button"
                  aria-label="Bật âm thanh"
                  title="Bật âm thanh"
                  aria-pressed="false"
                >
                  <svg className="sound-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 9h4l5-4v14l-5-4H3z" />
                    <path className="sound-wave" d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14" />
                    <path className="sound-slash" d="M3 21 21 3" />
                  </svg>
                  <span className="music-note" aria-hidden="true">
                    ♪
                  </span>
                </button>
                <span className="streak-pill" id="pill">
                  ngày 1
                </span>
                <div className="clock" id="clock" role="img" aria-label="Đồng hồ">
                  <span className="clock-face">
                    <i className="hour-hand" id="hourHand"></i>
                    <i className="minute-hand" id="minuteHand"></i>
                    <i className="clock-pin"></i>
                  </span>
                </div>
              </div>
            </header>

            <div className="weather-picker" role="group" aria-label="Chọn thời tiết">
              <button
                type="button"
                data-weather-choice="morning"
                aria-label="Buổi sáng"
                title="Buổi sáng"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 7h3V4h6v3h3v3h-2v2H6v-2H4zM2 14h16v2H2z" />
                </svg>
              </button>
              <button
                type="button"
                data-weather-choice="sunny"
                aria-label="Nắng"
                title="Nắng"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M8 1h4v3H8zm0 15h4v3H8zM1 8h3v4H1zm15 0h3v4h-3zM5 5h2v2H5zm8 8h2v2h-2zM8 6h4v2h2v4h-2v2H8v-2H6V8h2z" />
                </svg>
              </button>
              <button
                type="button"
                data-weather-choice="rain"
                aria-label="Mưa"
                title="Mưa"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5 6h2V4h6v2h2v2h2v4H3V8h2zM5 14h2v3H5zm5 1h2v3h-2zm5-1h2v3h-2z" />
                </svg>
              </button>
              <button
                type="button"
                data-weather-choice="storm"
                aria-label="Bão"
                title="Bão"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5 5h9v2h3v5H3V8h2zM10 12h4l-3 3h3l-6 4 1-4H7z" />
                </svg>
              </button>
              <button
                type="button"
                data-weather-choice="snow"
                aria-label="Tuyết"
                title="Tuyết"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9 1h2v18H9zM1 9h18v2H1zM3 4l1-1 13 13-1 1zM16 3l1 1L4 17l-1-1z" />
                </svg>
              </button>
              <button
                type="button"
                data-weather-choice="night"
                aria-label="Ban đêm"
                title="Ban đêm"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M11 2C6 3 4 7 5 11c1 4 5 6 9 5-3 3-9 3-12-2C-1 8 3 2 11 2zm5 1h2v2h-2zm-1 6h2v2h-2z" />
                </svg>
              </button>
            </div>

            <span className="firefly f1"></span>
            <span className="firefly f2"></span>
            <span className="firefly f3"></span>
            <span className="firefly f4"></span>

            <button
              className="hotspot greenhouse"
              data-place="garden"
              type="button"
              aria-label="Đến nhà kính chăm cây"
              title="Chăm cây"
            >
              <span className="garden-glint g1">✦</span>
              <span className="garden-glint g2">✧</span>
              <span className="garden-glint g3">✦</span>
            </button>
            <button
              className="hotspot pond"
              data-place="fish"
              type="button"
              aria-label="Đến hồ câu cá"
              title="Câu cá"
            >
              <span className="ripple r1"></span>
              <span className="ripple r2"></span>
              <span className="pond-glint">✧</span>
            </button>
            <button
              className="hotspot sky"
              data-place="stars"
              type="button"
              aria-label="Ngắm sao"
              title="Ngắm sao"
            >
              <span className="sky-star s1">✦</span>
              <span className="sky-star s2">✧</span>
              <span className="sky-star s3">✦</span>
            </button>

            <div
              className="character"
              id="character"
              data-mood="happy"
              role="img"
              aria-label="Nhân vật pixel đang đứng trên lối đá"
            >
              <div className="body-crop">
                <img
                  className="pose-sheet"
                  id="bodySprite"
                  src="/stardew/bodySprite.webp"
                  alt=""
                />
              </div>
              <div className="emote-bubble" id="emoteBubble" aria-hidden="true">
                ♡
              </div>
            </div>

            <div className="reaction" id="reaction" aria-live="polite">
              <div className="portrait-clip">
                <img
                  className="portrait-img"
                  id="reactionPortrait"
                  src="/stardew/portrait.webp"
                  alt=""
                />
              </div>
              <span id="reactionLabel">Vui quá!</span>
            </div>

            <div className="avatar-dock">
              <button
                className="avatar-trigger"
                id="avatarTrigger"
                type="button"
                aria-label="Chọn nhân vật và biểu cảm"
                aria-expanded="false"
                aria-controls="avatarPanel"
              >
                <span className="portrait-clip">
                  <img
                    className="portrait-img"
                    id="portrait"
                    src="/stardew/portrait.webp"
                    alt=""
                  />
                </span>
                <span className="avatar-plus" aria-hidden="true">
                  ✦
                </span>
              </button>
              <span className="dock-hint">Chạm ánh sáng để khám phá</span>
            </div>

            <div className="avatar-panel is-hidden" id="avatarPanel" hidden>
              <div className="panel-head">
                <span>Nhân vật của bạn</span>
                <button type="button" id="closeAvatar" aria-label="Đóng chọn nhân vật">
                  ×
                </button>
              </div>
              <div className="choice-line gender" role="group" aria-label="Chọn nhân vật">
                <button type="button" data-gender="girl">
                  Nữ
                </button>
                <button type="button" data-gender="boy">
                  Nam
                </button>
              </div>
              <div className="choice-line mood" role="group" aria-label="Chọn biểu cảm">
                <button type="button" data-mood-choice="happy">
                  Vui
                </button>
                <button type="button" data-mood-choice="shy">
                  Ngại
                </button>
                <button type="button" data-mood-choice="surprised">
                  Ngạc nhiên
                </button>
                <button type="button" data-mood-choice="sad">
                  Buồn
                </button>
              </div>
              <small id="status">0 cánh · 0 cá · 0 sao</small>
            </div>
          </main>
        </div>

        <div className="veil" id="veil" aria-hidden="true">
          <div
            className="sheet"
            id="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialogTitle"
            tabIndex={-1}
          >
            <div className="petal-burst" aria-hidden="true">
              <i style={{ ['--dx' as any]: '-105px', ['--dy' as any]: '-75px', ['--rot' as any]: '-60deg', ['--delay' as any]: '0s' }}></i>
              <i style={{ ['--dx' as any]: '105px', ['--dy' as any]: '-60px', ['--rot' as any]: '95deg', ['--delay' as any]: '.1s' }}></i>
              <i style={{ ['--dx' as any]: '-90px', ['--dy' as any]: '70px', ['--rot' as any]: '160deg', ['--delay' as any]: '.14s' }}></i>
              <i style={{ ['--dx' as any]: '83px', ['--dy' as any]: '80px', ['--rot' as any]: '-100deg', ['--delay' as any]: '.06s' }}></i>
              <i style={{ ['--dx' as any]: '12px', ['--dy' as any]: '-110px', ['--rot' as any]: '220deg', ['--delay' as any]: '.2s' }}></i>
            </div>
            <div className="sheet-inner">
              <button type="button" className="close" id="close" aria-label="Đóng">
                ×
              </button>
              <div className="journal-top" id="journalTop">
                botanical journal · entry 001
              </div>
              <h2 id="dialogTitle">Hoa đợi bạn ghé.</h2>
              <p id="dialogSub">Tưới một chút nước để giữ lại hôm nay.</p>

              <div className="specimen">
                <img
                  className="specimen-flower"
                  src="/stardew/specimenFlower.webp"
                  alt="Bông hồng pixel nhiều lớp cánh"
                />
                <div className="droplets" aria-hidden="true">
                  <i className="drop" style={{ ['--x' as any]: '-40px', ['--delay' as any]: '0s' }}></i>
                  <i className="drop" style={{ ['--x' as any]: '-14px', ['--delay' as any]: '.12s' }}></i>
                  <i className="drop" style={{ ['--x' as any]: '15px', ['--delay' as any]: '.2s' }}></i>
                  <i className="drop" style={{ ['--x' as any]: '40px', ['--delay' as any]: '.32s' }}></i>
                </div>
              </div>

              <div className="activity-scene fish-scene" id="fishScene" aria-hidden="true">
                <span className="bobber"></span>
                <span className="fish-silhouette">⌁</span>
              </div>
              <div className="activity-scene star-scene" id="starScene" aria-hidden="true">
                <svg className="constellation" viewBox="0 0 300 188">
                  <path d="M72 126 L129 53 L192 78 L234 32" />
                </svg>
                <i className="star-dot s1"></i>
                <i className="star-dot s2"></i>
                <i className="star-dot s3"></i>
                <i className="star-dot s4"></i>
              </div>

              <div className="streak-title">
                <span id="progressLabel">Nhật ký chăm hoa</span>
                <strong id="count">0 ngày liên tiếp</strong>
              </div>

              <div className="week" aria-label="Bảy ngày chăm hoa">
                <div className="day" data-day="1">
                  <div className="bud">✿</div>
                  <small>01</small>
                </div>
                <div className="day" data-day="2">
                  <div className="bud">✿</div>
                  <small>02</small>
                </div>
                <div className="day" data-day="3">
                  <div className="bud">✿</div>
                  <small>03</small>
                </div>
                <div className="day" data-day="4">
                  <div className="bud">✿</div>
                  <small>04</small>
                </div>
                <div className="day" data-day="5">
                  <div className="bud">✿</div>
                  <small>05</small>
                </div>
                <div className="day" data-day="6">
                  <div className="bud">✿</div>
                  <small>06</small>
                </div>
                <div className="day" data-day="7">
                  <div className="bud">✿</div>
                  <small>07</small>
                </div>
              </div>

              <div className="reward">
                <span>✧</span>
                <span id="rewardText">
                  Hôm nay sẽ nhận <b>+10 cánh hoa</b>
                </span>
              </div>

              <button type="button" className="water" id="water">
                Tưới hoa hôm nay
              </button>
              <button type="button" className="reset" id="reset">
                Làm mới bản demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
