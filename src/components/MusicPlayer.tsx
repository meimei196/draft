import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, ListMusic, X, Youtube, Repeat } from 'lucide-react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Track {
  title: string;
  artist?: string;
  url: string;
}

const DEFAULT_PLAYLIST: Track[] = [
        {
    title: "bởi vì vết thương lòng, đâm sâu em trở thành chiếc xương rồng",
    artist: "ZANG",
    url: "https://youtu.be/k-X4GJSzD8c?list=RDk-X4GJSzD8c"
  },
      {
    title: "Quên Đi",
    artist: "EREN, BAN",
    url: "https://youtu.be/k-dZw0dcWdg?list=RDk-dZw0dcWdg"
  },
        {
    title: "語音鈴聲",
    artist: "韋德 WADE",
    url: "https://youtu.be/g6FAFfDzZFk?list=RDg6FAFfDzZFk"
  },
    {
    title: "Quá đủ rồi",
    artist: "COOLKID",
    url: "https://youtu.be/PX59XGUwtg0?list=LM"
  },
  {
    title: "Đường ranh đỏ",
    artist: "Trâu Bái Bái, Pank",
    url: "https://youtu.be/-elf4OMkOqk?list=RD-elf4OMkOqk"
  },
  {
    title: "Tìm Thấy Nhau",
    artist: "SIVAN",
    url: "https://youtu.be/QTULiXpMgLk?list=RDrYWLIJB214Q"
  },
    {
    title: "xương rồng",
    artist: "Dangrangto",
    url: "https://youtu.be/4jjOH2FR6-E?list=RD4jjOH2FR6-E"
  },
  {
    title: "hate that i made you love me",
    artist: "🤍",
    url: "https://youtu.be/v1t4MTqdfyI?list=RDv1t4MTqdfyI"
  },
  {
    title: "Pray",
    artist: "đức mẹ Lana",
    url: "https://youtu.be/H86JZTaEnHM?list=RDH86JZTaEnHM"
  },
  {
    title: "孤独Person",
    artist: "Chillex",
    url: "https://youtu.be/BR9hc_PedHE?list=RDBR9hc_PedHE"
  },
    {
    title: "Buông Bỏ Sự Phụ Thuộc Nơi Anh♪",
    artist: "Vương Diễm Vi",
    url: "https://youtu.be/iu6qVH-ERUQ?list=RDiu6qVH-ERUQ"
  },
      {
    title: "Trong Nháy Mắt",
    artist: "Trịnh Nhuận Trạch",
    url: "https://youtu.be/lFeQdR16uQ8?list=RDlFeQdR16uQ8"
  },
  {
    title: "Star Crossing Night",
    artist: "THE 8",
    url: "https://youtu.be/wBKET1fSxnQ?list=RDwBKET1fSxnQ"
  },
      {
    title: "intentions",
    artist: "starfall",
    url: "https://youtu.be/bj9S1AyVJAc?list=RDbj9S1AyVJAc"
  },
    {
    title: "bye [Altare Remix]",
    artist: "Ariana Grande",
    url: "https://youtu.be/gqaVSkZJTQk?list=RDgqaVSkZJTQk"
  },
  {
    title: "🤍",
    artist: "🖤",
    url: "https://youtu.be/NV3UdUKWPIo?list=RDNV3UdUKWPIo"
  },
];

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAutoplayTip, setShowAutoplayTip] = useState(true);
  const [isYtReady, setIsYtReady] = useState(false);

  const ytPlayerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoopingRef = useRef(isLooping);
  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const currentTrackIndexRef = useRef(currentTrackIndex);

  // Keep refs in sync with states for event listeners
  isLoopingRef.current = isLooping;
  isPlayingRef.current = isPlaying;
  isMutedRef.current = isMuted;
  currentTrackIndexRef.current = currentTrackIndex;

  const currentTrack = DEFAULT_PLAYLIST[currentTrackIndex];
  const currentYoutubeId = getYoutubeId(currentTrack.url);

  // Next Track function
  const handleNext = useCallback(() => {
    setShowAutoplayTip(false);
    const nextIndex = (currentTrackIndexRef.current + 1) % DEFAULT_PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);

    const nextTrack = DEFAULT_PLAYLIST[nextIndex];
    const nextYtId = getYoutubeId(nextTrack.url);

    if (nextYtId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(nextYtId);
      } catch (err) {
        console.warn('YT loadVideoById error:', err);
      }
    }
  }, []);

  const handlePrev = useCallback(() => {
    setShowAutoplayTip(false);
    const prevIndex = (currentTrackIndexRef.current - 1 + DEFAULT_PLAYLIST.length) % DEFAULT_PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);

    const prevTrack = DEFAULT_PLAYLIST[prevIndex];
    const prevYtId = getYoutubeId(prevTrack.url);

    if (prevYtId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(prevYtId);
      } catch (err) {
        console.warn('YT loadVideoById error:', err);
      }
    }
  }, []);

  const handleSelectTrack = (index: number) => {
    setShowAutoplayTip(false);
    setCurrentTrackIndex(index);
    setIsPlaying(true);

    const selectedTrack = DEFAULT_PLAYLIST[index];
    const targetYtId = getYoutubeId(selectedTrack.url);

    if (targetYtId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(targetYtId);
      } catch (err) {
        console.warn('YT loadVideoById error:', err);
      }
    }
  };

  // Initialize YouTube Iframe API
  useEffect(() => {
    let isSubscribed = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (ytPlayerRef.current) return;

      const container = document.getElementById('yt-player-container');
      if (!container) return;

      try {
        const initialYtId = getYoutubeId(DEFAULT_PLAYLIST[0].url) || 'QTULiXpMgLk';
        ytPlayerRef.current = new window.YT.Player('yt-player-container', {
          height: '120',
          width: '120',
          videoId: initialYtId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isSubscribed) return;
              setIsYtReady(true);
              try {
                event.target.setVolume(50);
                if (isMutedRef.current) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                }
                if (isPlayingRef.current) {
                  event.target.playVideo();
                }
              } catch (e) {
                console.warn('YT onReady event handling:', e);
              }
            },
            onStateChange: (event: any) => {
              if (!isSubscribed) return;
              // YT.PlayerState.ENDED is 0
              if (event.data === 0) {
                if (isLoopingRef.current) {
                  try {
                    event.target.seekTo(0);
                    event.target.playVideo();
                  } catch (e) {
                    console.warn(e);
                  }
                } else {
                  handleNext();
                }
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Player Error code:', event.data);
              if (isSubscribed) {
                // Auto-skip unplayable/restricted videos to keep music flowing
                handleNext();
              }
            },
          },
        });
      } catch (err) {
        console.error('Failed to instantiate YT.Player:', err);
      }
    };

    if (!window.YT || !window.YT.Player) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isSubscribed = false;
    };
  }, [handleNext]);

  // One-time interaction unlock for modern browser Autoplay Policy
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      setShowAutoplayTip(false);
      if (isPlayingRef.current && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        try {
          ytPlayerRef.current.playVideo();
          if (!isMutedRef.current && typeof ytPlayerRef.current.unMute === 'function') {
            ytPlayerRef.current.unMute();
          }
        } catch (e) {
          console.warn('Autoplay unlock interaction:', e);
        }
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  // HTML5 audio fallback for non-youtube URLs
  useEffect(() => {
    if (currentYoutubeId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentTrack.url);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : 0.5;
    audio.loop = isLooping;

    audio.onended = () => {
      if (!isLooping) {
        handleNext();
      }
    };

    if (isPlaying) {
      audio.play().catch((err) => console.log('Audio playback waiting:', err));
    }

    return () => {
      audio.pause();
    };
  }, [currentTrackIndex, currentYoutubeId, isLooping, isMuted, isPlaying, handleNext, currentTrack.url]);

  // Toggle Play / Pause
  const togglePlay = () => {
    setShowAutoplayTip(false);
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (currentYoutubeId && ytPlayerRef.current) {
      try {
        if (nextState && typeof ytPlayerRef.current.playVideo === 'function') {
          ytPlayerRef.current.playVideo();
        } else if (!nextState && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn('YT togglePlay error:', e);
      }
    } else if (audioRef.current) {
      if (nextState) {
        audioRef.current.play().catch(console.warn);
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setShowAutoplayTip(false);
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (currentYoutubeId && ytPlayerRef.current) {
      try {
        if (nextMute && typeof ytPlayerRef.current.mute === 'function') {
          ytPlayerRef.current.mute();
        } else if (!nextMute && typeof ytPlayerRef.current.unMute === 'function') {
          ytPlayerRef.current.unMute();
        }
      } catch (e) {
        console.warn('YT toggleMute error:', e);
      }
    } else if (audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : 0.5;
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  return (
    <>
      {/* Background Official YouTube Player Container (Invisible & Isolated) */}
      <div className="fixed -top-[9999px] -left-[9999px] w-20 h-20 opacity-0 pointer-events-none z-[-999] overflow-hidden">
        <div id="yt-player-container" />
      </div>

      {/* Floating Circular Compact Music Bubble */}
      <div className="fixed bottom-6 left-6 z-[999] flex flex-col items-start gap-2">
        {/* Autoplay Helper Tooltip */}
        <AnimatePresence>
          {showAutoplayTip && isPlaying && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="px-3 py-1.5 rounded-xl bg-zinc-950/90 text-zinc-300 border border-zinc-800 text-[10px] font-medium shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none select-none relative mb-1"
            >
              welcome my babies🌟
              <div className="absolute -bottom-1 left-5 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="floating-music-bubble"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowAutoplayTip(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-lg select-none ${
            isPlaying 
              ? 'bg-zinc-100 text-zinc-950 border-white shadow-zinc-100/10' 
              : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 border-zinc-800 backdrop-blur-md'
          }`}
          title="Trình phát nhạc thư giãn"
        >
          {isPlaying ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Spinning vinyl effect */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Music className="w-5 h-5 stroke-[2.5]" />
              </motion.div>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-zinc-100 animate-ping" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-zinc-100" />
            </div>
          ) : (
            <Music className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Glassmorphic Player Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[1000]" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed bottom-20 left-6 z-[1001] w-[290px] sm:w-[310px] bg-zinc-950/95 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-lg flex flex-col gap-4 select-none text-zinc-200"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-400 to-transparent"></div>

              {/* Top Row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                  <Music className="w-3.5 h-3.5 text-zinc-300" />
                  MÚC NHẠC COZY 𝜗ৎ
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Active Track Info Card */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3 items-center relative overflow-hidden">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isPlaying ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-500'
                }`}>
                  {currentYoutubeId ? (
                    <Youtube className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-100 truncate">{currentTrack.title}</p>
                  <p className="text-[9px] text-zinc-400 truncate mt-0.5">{currentTrack.artist || 'Unknown'}</p>
                </div>
              </div>

              {/* Playback Controls Row */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={toggleLoop}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    isLooping 
                      ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                  title={isLooping ? "Đang bật lặp lại bài" : "Đang tắt lặp lại bài"}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
                  title="Bài trước"
                >
                  <SkipForward className="w-4 h-4 rotate-180" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md shadow-zinc-100/5"
                  title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current text-zinc-950" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-zinc-950 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
                  title="Bài tiếp theo"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleMute}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isMuted 
                      ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Playlist Section Header */}
              <div className="border-t border-white/5 pt-3">
                <p className="text-[10px] font-bold text-zinc-400 tracking-wide uppercase mb-2 flex items-center gap-1 font-mono">
                  <ListMusic className="w-3.5 h-3.5" />
                  DANH SÁCH BÀI HÁT
                </p>

                <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {DEFAULT_PLAYLIST.map((track, idx) => {
                    const isSelected = currentTrackIndex === idx;
                    const isTrackYt = getYoutubeId(track.url) !== null;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectTrack(idx)}
                        className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between text-[11px] cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 font-bold'
                            : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate flex items-center gap-1">
                            {isTrackYt && <Youtube className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-zinc-950' : 'text-zinc-500'}`} />}
                            {track.title}
                          </p>
                        </div>
                        {isSelected && isPlaying ? (
                          <div className="flex gap-0.5 items-end h-3 shrink-0">
                            <span className={`w-0.5 animate-bounce ${isSelected ? 'bg-zinc-950' : 'bg-zinc-200'}`} style={{ height: '60%', animationDelay: '0.1s' }} />
                            <span className={`w-0.5 animate-bounce ${isSelected ? 'bg-zinc-950' : 'bg-zinc-200'}`} style={{ height: '100%', animationDelay: '0.3s' }} />
                            <span className={`w-0.5 animate-bounce ${isSelected ? 'bg-zinc-950' : 'bg-zinc-200'}`} style={{ height: '40%', animationDelay: '0.5s' }} />
                          </div>
                        ) : (
                          isSelected && <span className="text-[9px] opacity-75">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
