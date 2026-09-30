import React, { useState, useEffect, useRef, useCallback } from 'react';
import './stardew.css';
import { X } from 'lucide-react';

interface PixelGardenGameProps {
  onClose: () => void;
}

interface StreakData {
  last: string;
  count: number;
}

interface InventoryData {
  petals: number;
  fish: number;
  stars: number;
  lastStar: string;
}

interface PrefsData {
  gender: 'girl' | 'boy';
  mood: 'happy' | 'shy' | 'surprised' | 'sad';
  weather: 'morning' | 'night' | 'rain' | 'sunny' | 'storm' | 'snow';
}

const STREAK_KEY = 'mong-mien-pixel-garden-v1';
const INVENTORY_KEY = 'mong-mien-garden-inventory-v3';
const PREF_KEY = 'mong-mien-garden-preferences-v2';

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

const formatDay = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const formatYesterday = () => formatDay(new Date(Date.now() - 86400000));

export function PixelGardenGame({ onClose }: PixelGardenGameProps) {
  // Safe storage helper
  const safeRead = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? { ...fallback, ...JSON.parse(item) } : fallback;
    } catch {
      return fallback;
    }
  };

  const save = (key: string, val: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // ignore
    }
  };

  // Synchronize with MeiMei existing flower streak if available
  const getInitialStreak = (): StreakData => {
    const raw = safeRead<StreakData>(STREAK_KEY, { last: '', count: 0 });
    if (!raw.last) {
      try {
        const legacy = localStorage.getItem('meimei_flower_streak');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (parsed.lastWateredDate) {
            raw.last = parsed.lastWateredDate;
            raw.count = parsed.streak || 0;
            save(STREAK_KEY, raw);
          }
        }
      } catch {
        // ignore
      }
    }
    return raw;
  };

  const [prefs, setPrefs] = useState<PrefsData>(() =>
    safeRead<PrefsData>(PREF_KEY, { gender: 'girl', mood: 'happy', weather: 'morning' })
  );

  const [inventory, setInventory] = useState<InventoryData>(() =>
    safeRead<InventoryData>(INVENTORY_KEY, { petals: 0, fish: 0, stars: 0, lastStar: '' })
  );

  const [rawStreak, setRawStreak] = useState<StreakData>(getInitialStreak);

  // Position and walking state of character
  const [actorPos, setActorPos] = useState({ left: 52, top: 67 });
  const [isWalking, setIsWalking] = useState(false);
  const [isReactionVisible, setIsReactionVisible] = useState(false);
  const [reactionTimer, setReactionTimer] = useState<any>(null);

  // Activity Sheet dialog state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetActivity, setSheetActivity] = useState<'garden' | 'fish' | 'stars'>('garden');
  const [isWatering, setIsWatering] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const [fishReady, setFishReady] = useState(false);
  const [fishCaughtAnim, setFishCaughtAnim] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Audio system state
  const [soundOn, setSoundOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Canvas weather ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<HTMLElement | null>(null);

  // Compute active streak status
  const currentDay = formatDay();
  const yesterdayStr = formatYesterday();
  const streakCount =
    rawStreak.last === currentDay || rawStreak.last === yesterdayStr ? rawStreak.count : 0;
  const isWateredToday = rawStreak.last === currentDay;

  // Web Audio Synthesizer
  const ensureAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playTone = useCallback(
    (frequency: number, duration = 0.14, type: OscillatorType = 'sine', level = 0.035, offset = 0) => {
      if (!soundOn) return;
      ensureAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    },
    [soundOn, ensureAudio]
  );

  const playStep = useCallback(() => {
    playTone(100, 0.085, 'triangle', 0.045);
    playTone(170, 0.055, 'sine', 0.015, 0.035);
  }, [playTone]);

  const playWater = useCallback(() => {
    [610, 480, 360].forEach((f, i) => playTone(f, 0.19, 'sine', 0.032, i * 0.14));
  }, [playTone]);

  const playFish = useCallback(() => {
    [160, 110, 230].forEach((f, i) => playTone(f, 0.16, 'triangle', 0.04, i * 0.09));
  }, [playTone]);

  const playStars = useCallback(() => {
    [523, 659, 784, 1046].forEach((f, i) => playTone(f, 0.7, 'sine', 0.028, i * 0.16));
  }, [playTone]);

  const updateAmbient = useCallback(
    (weatherName: string, activeSound: boolean) => {
      if (ambientSourceRef.current) {
        try {
          ambientSourceRef.current.stop();
        } catch {
          // ignore
        }
        ambientSourceRef.current = null;
      }
      if (!activeSound || !['rain', 'storm'].includes(weatherName)) return;

      ensureAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const length = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = weatherName === 'storm' ? 900 : 1550;

      const gain = ctx.createGain();
      gain.gain.value = weatherName === 'storm' ? 0.035 : 0.022;

      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      ambientSourceRef.current = source;
      ambientGainRef.current = gain;
    },
    [ensureAudio]
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      ensureAudio();
      playTone(660, 0.2, 'sine', 0.035);
    }
    updateAmbient(prefs.weather, next);
  };

  // Weather change handler
  const setWeather = (name: PrefsData['weather']) => {
    const nextPrefs = { ...prefs, weather: name };
    setPrefs(nextPrefs);
    save(PREF_KEY, nextPrefs);
    updateAmbient(name, soundOn);
  };

  // Mood change handler
  const triggerReaction = () => {
    setIsReactionVisible(true);
    if (reactionTimer) clearTimeout(reactionTimer);
    const t = setTimeout(() => setIsReactionVisible(false), 2400);
    setReactionTimer(t);
  };

  const setMood = (m: PrefsData['mood'], showReaction = true) => {
    const nextPrefs = { ...prefs, mood: m };
    setPrefs(nextPrefs);
    save(PREF_KEY, nextPrefs);
    if (showReaction) triggerReaction();
  };

  const setGender = (g: PrefsData['gender']) => {
    const nextPrefs = { ...prefs, gender: g };
    setPrefs(nextPrefs);
    save(PREF_KEY, nextPrefs);
    triggerReaction();
  };

  // Canvas weather particles loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0;
    let H = 0;
    let particles: { x: number; y: number; speed: number; size: number; phase: number }[] = [];

    const seedParticles = () => {
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
    };

    const resizeCanvas = () => {
      if (!gameRef.current || !canvas) return;
      const r = gameRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    const frame = (t: number) => {
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
      animId = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(gameRef.current);
    resizeCanvas();
    animId = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [prefs.weather]);

  // Character walking logic
  const walkTo = (x: number, y: number, onArrival?: () => void) => {
    if (isWalking) return;
    setIsWalking(true);
    setActorPos({ left: x, top: y });

    let steps = 0;
    const timer = setInterval(() => {
      playStep();
      if (++steps >= 4) clearInterval(timer);
    }, 180);

    setTimeout(() => {
      setIsWalking(false);
      onArrival?.();
    }, 900);
  };

  const handleGameGroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .controls, .top, .reaction, .veil')) return;
    if (!gameRef.current) return;
    const r = gameRef.current.getBoundingClientRect();
    const x = Math.max(32, Math.min(70, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(35, Math.min(68, ((e.clientY - r.top) / r.height) * 100));
    walkTo(x, y);
  };

  // Open Activity
  const openActivity = (place: 'garden' | 'fish' | 'stars') => {
    if (isWalking || sheetOpen) return;
    if (place === 'stars' && prefs.weather !== 'night') {
      setWeather('night');
    }

    const targets: Record<string, [number, number]> = {
      garden: [39, 47],
      fish: [65, 48],
      stars: [53, 33]
    };

    walkTo(targets[place][0], targets[place][1], () => {
      setSheetActivity(place);
      setFishReady(false);
      setFishCaughtAnim(false);
      setIsBlooming(false);
      setIsWatering(false);
      setSheetOpen(true);
    });
  };

  const closeActivity = () => {
    setSheetOpen(false);
    setIsWatering(false);
    setIsBlooming(false);
  };

  // Water / Fish / Star Action
  const handleSheetAction = () => {
    if (isBusy) return;

    if (sheetActivity === 'garden') {
      if (isWateredToday) return;
      setIsBusy(true);
      setIsWatering(true);
      playWater();

      const newStreakCount = rawStreak.last === yesterdayStr ? rawStreak.count + 1 : 1;
      const newStreak = { last: currentDay, count: newStreakCount };
      setRawStreak(newStreak);
      save(STREAK_KEY, newStreak);

      // Sync with Legacy MeiMei Flower Streak for backward compatibility
      try {
        localStorage.setItem(
          'meimei_flower_streak',
          JSON.stringify({
            streak: newStreakCount,
            lastWateredDate: currentDay,
            totalBlooms: Math.floor(newStreakCount / 7)
          })
        );
      } catch {
        // ignore
      }

      const nextInv = { ...inventory, petals: inventory.petals + 10 };
      setInventory(nextInv);
      save(INVENTORY_KEY, nextInv);

      setTimeout(() => {
        setIsWatering(false);
        setIsBlooming(true);
        setMood('happy', false);
        setIsBusy(false);
      }, 900);
    } else if (sheetActivity === 'fish') {
      if (!fishReady) {
        setIsBusy(true);
        playTone(270, 0.2, 'sine', 0.025);
        setTimeout(() => {
          setFishReady(true);
          setIsBusy(false);
          playFish();
        }, 1200);
      } else {
        setFishReady(false);
        const nextInv = {
          ...inventory,
          fish: inventory.fish + 1,
          petals: inventory.petals + 2
        };
        setInventory(nextInv);
        save(INVENTORY_KEY, nextInv);
        setFishCaughtAnim(true);
        playFish();
        setMood('surprised', false);
        setTimeout(() => setFishCaughtAnim(false), 1200);
      }
    } else {
      if (inventory.lastStar === currentDay) return;
      const nextInv = {
        ...inventory,
        lastStar: currentDay,
        stars: inventory.stars + 1
      };
      setInventory(nextInv);
      save(INVENTORY_KEY, nextInv);
      playStars();
      setMood('happy', false);
    }
  };

  const handleResetDemo = () => {
    try {
      localStorage.removeItem(STREAK_KEY);
      localStorage.removeItem(INVENTORY_KEY);
      localStorage.removeItem('meimei_flower_streak');
    } catch {
      // ignore
    }
    setRawStreak({ last: '', count: 0 });
    setInventory({ petals: 0, fish: 0, stars: 0, lastStar: '' });
    setIsWatering(false);
    setIsBlooming(false);
  };

  const activeMoodObj = moodMap[prefs.mood] || moodMap.happy;
  const isBoy = prefs.gender === 'boy';
  const currentBodySrc = isBoy ? boyBody : girlBody;
  const currentFaceSrc = isBoy ? boyFaces : girlFaces;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-hidden stardew-scope">
      {/* Outer Shell */}
      <div className="shell w-full h-full flex items-center justify-center">
        {/* Game Main Frame */}
        <main
          ref={gameRef}
          className={`game relative ${prefs.weather}`}
          id="game"
          data-weather={prefs.weather}
          onClick={handleGameGroundClick}
          aria-label="Khu vườn hoa pixel có thể tương tác"
        >
          {/* Garden World Image */}
          <div className="world pointer-events-none">
            <img
              id="gardenImage"
              src="/stardew/gardenImage.webp"
              alt="Khu vườn hoa pixel với nhà kính, hồ nhỏ và lối đi bằng đá"
              className="pointer-events-none select-none"
            />
          </div>

          <div className="weather-light pointer-events-none" />
          <div className="mist pointer-events-none" />
          <canvas ref={canvasRef} className="weather-canvas pointer-events-none" aria-hidden="true" />
          <div className="grain pointer-events-none" />

          {/* Top Header Bar */}
          <header className="top select-none">
            <div>
              <div className="overline">Mộng Miên · khu vườn nhỏ</div>
              <h1>Vườn hoa</h1>
            </div>
            <div className="top-actions">
              <button
                className={`sound-btn ${soundOn ? 'on' : ''}`}
                id="sound"
                type="button"
                onClick={toggleSound}
                aria-pressed={soundOn}
                title="Bật/Tắt âm thanh"
              >
                {soundOn ? '♪ Bật' : '♪ Tắt'}
              </button>
              <div className="streak-pill" id="pill">
                ✦ {streakCount} ngày
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-[#f3eee5a1] bg-[#262c27a8] text-[#f5ede3] flex items-center justify-center hover:bg-[#3b453d] active:scale-95 transition-all cursor-pointer ml-1"
                title="Đóng vườn hoa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Weather Selector */}
          <div className="weather-picker" aria-label="Chọn thời tiết">
            {(
              [
                ['morning', '🌤 Sáng'],
                ['night', '☾ Tối'],
                ['rain', '☂ Mưa'],
                ['sunny', '☀ Nắng'],
                ['storm', 'ϟ Bão'],
                ['snow', '❄ Tuyết']
              ] as const
            ).map(([wKey, wLabel]) => (
              <button
                key={wKey}
                type="button"
                className={prefs.weather === wKey ? 'active' : ''}
                onClick={() => setWeather(wKey)}
              >
                {wLabel}
              </button>
            ))}
          </div>

          {/* Fireflies floating */}
          <span className="firefly f1" />
          <span className="firefly f2" />
          <span className="firefly f3" />
          <span className="firefly f4" />

          {/* Interactive Hotspots */}
          <button
            className="hotspot greenhouse cursor-pointer"
            type="button"
            onClick={() => openActivity('garden')}
            title="Đến Nhà kính"
          >
            <span>✿</span>Nhà kính
          </button>
          <button
            className="hotspot pond cursor-pointer"
            type="button"
            onClick={() => openActivity('fish')}
            title="Đến Hồ nhỏ"
          >
            <span>♒</span>Hồ nhỏ
          </button>
          <button
            className="hotspot sky cursor-pointer"
            type="button"
            onClick={() => openActivity('stars')}
            title="Đến Ngắm sao"
          >
            <span>✧</span>Ngắm sao
          </button>

          {/* Character Actor */}
          <div
            className={`character ${isWalking ? 'walk' : ''}`}
            id="character"
            data-mood={prefs.mood}
            role="img"
            aria-label="Nhân vật pixel đang đứng trên lối đá"
            style={{
              left: `${actorPos.left}%`,
              top: `${actorPos.top}%`
            }}
          >
            <div className="body-crop">
              <img
                className="pose-sheet"
                id="bodySprite"
                src={currentBodySrc}
                alt=""
                style={
                  {
                    '--px': activeMoodObj.x,
                    '--py': activeMoodObj.y
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="emote-bubble" id="emoteBubble" aria-hidden="true">
              {activeMoodObj.icon}
            </div>
          </div>

          {/* Reaction Portrait Toast */}
          <div className={`reaction ${isReactionVisible ? 'show' : ''}`} id="reaction" aria-live="polite">
            <div className="portrait-clip">
              <img
                className="portrait-img"
                id="reactionPortrait"
                src={currentFaceSrc}
                alt=""
                style={
                  {
                    '--px': activeMoodObj.x,
                    '--py': activeMoodObj.y
                  } as React.CSSProperties
                }
              />
            </div>
            <span id="reactionLabel">{activeMoodObj.label}</span>
          </div>

          {/* Bottom HUD Controls */}
          <div className="controls">
            <div className="control-top">
              <div>
                <span>Chapter 01 / Daily garden</span>
                <b>Một khu vườn để đi dạo.</b>
              </div>
              <em id="status">
                {inventory.petals} cánh · {inventory.fish} cá · {inventory.stars} sao
              </em>
            </div>

            <div className="control-bottom">
              <button className="action cursor-pointer" type="button" onClick={() => openActivity('garden')}>
                <strong>✿</strong>Chăm cây
              </button>
              <button className="action cursor-pointer" type="button" onClick={() => openActivity('fish')}>
                <strong>♒</strong>Câu cá
              </button>
              <button className="action cursor-pointer" type="button" onClick={() => openActivity('stars')}>
                <strong>✧</strong>Ngắm sao
              </button>
            </div>

            <div className="avatar-tools">
              <div className="portrait-clip">
                <img
                  className="portrait-img"
                  id="portrait"
                  src={currentFaceSrc}
                  alt="Biểu cảm nhân vật"
                  style={
                    {
                      '--px': activeMoodObj.x,
                      '--py': activeMoodObj.y
                    } as React.CSSProperties
                  }
                />
              </div>
              <div className="avatar-choice">
                <div className="choice-line gender" aria-label="Chọn nhân vật">
                  <button
                    type="button"
                    className={prefs.gender === 'girl' ? 'active' : ''}
                    onClick={() => setGender('girl')}
                  >
                    ♀ Nữ
                  </button>
                  <button
                    type="button"
                    className={prefs.gender === 'boy' ? 'active' : ''}
                    onClick={() => setGender('boy')}
                  >
                    ♂ Nam
                  </button>
                </div>
                <div className="choice-line mood" aria-label="Chọn biểu cảm">
                  {(
                    [
                      ['happy', 'Vui'],
                      ['shy', 'Ngại'],
                      ['surprised', 'Ngạc nhiên'],
                      ['sad', 'Buồn']
                    ] as const
                  ).map(([mKey, mLabel]) => (
                    <button
                      key={mKey}
                      type="button"
                      className={prefs.mood === mKey ? 'active' : ''}
                      onClick={() => setMood(mKey)}
                    >
                      {mLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="tap-hint">Chạm vào lối đá để nhân vật đi dạo · bật ♪ để nghe âm thanh</div>
          </div>
        </main>
      </div>

      {/* Activity Veil & Sheet Dialog */}
      <div
        className={`veil ${sheetOpen ? 'open' : ''}`}
        id="veil"
        aria-hidden={!sheetOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeActivity();
        }}
      >
        <div
          className={`sheet ${isWatering ? 'watering' : ''} ${isBlooming ? 'blooming' : ''}`}
          id="sheet"
          role="dialog"
          aria-modal="true"
          data-activity={sheetActivity}
        >
          {/* Flying Petal Burst Animation for Blooming */}
          <div className="petal-burst" aria-hidden="true">
            <i style={{ '--dx': '-105px', '--dy': '-75px', '--rot': '-60deg', '--delay': '0s' } as any} />
            <i style={{ '--dx': '105px', '--dy': '-60px', '--rot': '95deg', '--delay': '.1s' } as any} />
            <i style={{ '--dx': '-90px', '--dy': '70px', '--rot': '160deg', '--delay': '.14s' } as any} />
            <i style={{ '--dx': '83px', '--dy': '80px', '--rot': '-100deg', '--delay': '.06s' } as any} />
            <i style={{ '--dx': '12px', '--dy': '-110px', '--rot': '220deg', '--delay': '.2s' } as any} />
          </div>

          <div className="sheet-inner">
            <button type="button" className="close cursor-pointer" onClick={closeActivity} aria-label="Đóng">
              ×
            </button>

            {sheetActivity === 'garden' && (
              <>
                <div className="journal-top" id="journalTop">
                  botanical journal · nhà kính
                </div>
                <h2 id="dialogTitle">{isWateredToday ? 'Hoa đã được chăm rồi.' : 'Một chút nước cho hoa.'}</h2>
                <p id="dialogSub">
                  {isWateredToday ? 'Mai lại ghé nhà kính nhé.' : 'Ghé qua mỗi ngày để khu vườn lớn lên.'}
                </p>

                <div className="specimen">
                  <img
                    className="specimen-flower"
                    src="/stardew/specimenFlower.webp"
                    alt="Bông hồng pixel nhiều lớp cánh"
                  />
                  <div className="droplets" aria-hidden="true">
                    <i className="drop" style={{ '--x': '-40px', '--delay': '0s' } as any} />
                    <i className="drop" style={{ '--x': '-14px', '--delay': '.12s' } as any} />
                    <i className="drop" style={{ '--x': '15px', '--delay': '.2s' } as any} />
                    <i className="drop" style={{ '--x': '40px', '--delay': '.32s' } as any} />
                  </div>
                </div>

                <div className="streak-title">
                  <span id="progressLabel">Nhật ký chăm hoa</span>
                  <strong id="count">{streakCount} ngày liên tiếp</strong>
                </div>

                {/* 7 Days tracker */}
                <div className="week" aria-label="Bảy ngày chăm hoa">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isOn = streakCount >= num;
                    const isToday = isWateredToday && streakCount === num;
                    return (
                      <div
                        key={num}
                        className={`day ${isOn ? 'on' : ''} ${isToday ? 'today' : ''}`}
                        data-day={num}
                      >
                        <div className="bud">✿</div>
                        <small>{num < 10 ? `0${num}` : num}</small>
                      </div>
                    );
                  })}
                </div>

                <div className="reward">
                  <span>✧</span>
                  <span id="rewardText">
                    {isWateredToday ? (
                      <>
                        Đã nhận <b>+10 cánh hoa</b> hôm nay
                      </>
                    ) : (
                      <>
                        Hôm nay sẽ nhận <b>+10 cánh hoa</b>
                      </>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  className="water cursor-pointer"
                  id="water"
                  onClick={handleSheetAction}
                  disabled={isWateredToday || isBusy}
                >
                  {isWateredToday ? 'Đã chăm cây hôm nay ✓' : 'Tưới cây · nhận 10 cánh'}
                </button>
              </>
            )}

            {sheetActivity === 'fish' && (
              <>
                <div className="journal-top" id="journalTop">
                  pond journal · hồ nhỏ
                </div>
                <h2 id="dialogTitle">{fishCaughtAnim ? 'Câu được một con cá!' : 'Có gì dưới mặt hồ?'}</h2>
                <p id="dialogSub">
                  {fishCaughtAnim
                    ? 'Mặt hồ lại yên. Bạn có thể thả câu tiếp.'
                    : fishReady
                    ? 'Phao vừa động. Giật cần ngay!'
                    : 'Thả câu, đợi phao động rồi giật cần.'}
                </p>

                <div className={`activity-scene fish-scene ${fishCaughtAnim ? 'caught' : ''}`} id="fishScene">
                  <span className="bobber" />
                  <span className="fish-silhouette">⌁</span>
                </div>

                <div className="streak-title">
                  <span id="progressLabel">Bộ sưu tập</span>
                  <strong id="count">{inventory.fish} con cá</strong>
                </div>

                <div className="reward">
                  <span>✧</span>
                  <span id="rewardText">
                    Mỗi lần câu được cá nhận <b>+2 cánh hoa</b>
                  </span>
                </div>

                <button
                  type="button"
                  className="water cursor-pointer"
                  id="water"
                  onClick={handleSheetAction}
                  disabled={isBusy}
                >
                  {isBusy ? 'Phao đang chờ cá…' : fishReady ? 'Giật cần!' : 'Thả câu'}
                </button>
              </>
            )}

            {sheetActivity === 'stars' && (
              <>
                {(() => {
                  const found = inventory.lastStar === currentDay;
                  return (
                    <>
                      <div className="journal-top" id="journalTop">
                        sky journal · đêm nay
                      </div>
                      <h2 id="dialogTitle">
                        {found ? 'Đã tìm thấy một chòm sao.' : 'Ngẩng lên nhìn trời.'}
                      </h2>
                      <p id="dialogSub">
                        {found ? 'Đêm mai bầu trời sẽ kể tiếp.' : 'Nối ánh sáng của bốn ngôi sao trên cao.'}
                      </p>

                      <div className={`activity-scene star-scene ${found ? 'found' : ''}`} id="starScene">
                        <svg className="constellation" viewBox="0 0 300 188">
                          <path d="M72 126 L129 53 L192 78 L234 32" />
                        </svg>
                        <i className="star-dot s1" />
                        <i className="star-dot s2" />
                        <i className="star-dot s3" />
                        <i className="star-dot s4" />
                      </div>

                      <div className="streak-title">
                        <span id="progressLabel">Bản đồ sao</span>
                        <strong id="count">{inventory.stars} mảnh sao</strong>
                      </div>

                      <div className="reward">
                        <span>✧</span>
                        <span id="rewardText">
                          {found ? (
                            <>
                              Đã nhặt <b>1 mảnh sao</b> đêm nay
                            </>
                          ) : (
                            <>
                              Khám phá nhận <b>1 mảnh sao</b>
                            </>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="water cursor-pointer"
                        id="water"
                        onClick={handleSheetAction}
                        disabled={found}
                      >
                        {found ? 'Đã ngắm sao đêm nay ✓' : 'Tìm chòm sao'}
                      </button>
                    </>
                  );
                })()}
              </>
            )}

            <button type="button" className="reset cursor-pointer" id="reset" onClick={handleResetDemo}>
              Làm mới bản demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
