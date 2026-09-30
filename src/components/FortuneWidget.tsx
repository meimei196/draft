import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';
import { TarotCard, TAROT_78_CARDS } from '../data/tarot78';
import { getCurrentUser, subscribeAuth, AppUser } from '../lib/userAuth';
import { getLocalFortune, saveDailyFortune, fetchCloudDailyFortune, ONE_DAY_MS } from '../lib/fortuneSync';

export function FortuneWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [card, setCard] = useState<TarotCard | null>(null);
  const [drawTimestamp, setDrawTimestamp] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remainingTime, setRemainingTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());

  useEffect(() => {
    return subscribeAuth((user) => {
      setCurrentUser(user);
    });
  }, []);

  // Check local storage and restore from cloud across devices (PC / mobile)
  useEffect(() => {
    const loadFortune = async () => {
      // 1. Initial quick load from local storage
      const local = getLocalFortune(currentUser?.username);
      if (local) {
        setCard(local.card);
        setDrawTimestamp(local.timestamp);
      } else {
        setCard(null);
        setDrawTimestamp(null);
      }

      // 2. If logged in, fetch cloud record to sync from other devices (e.g. PC -> Mobile)
      if (currentUser?.username) {
        const cloud = await fetchCloudDailyFortune(currentUser.username);
        if (cloud) {
          setCard(cloud.card);
          setDrawTimestamp(cloud.timestamp);
        }
      }
    };

    loadFortune();
  }, [currentUser?.username]);

  // Real-time 24h Countdown Timer
  useEffect(() => {
    if (!drawTimestamp) {
      setRemainingTime(null);
      return;
    }

    const updateRemaining = () => {
      const elapsed = Date.now() - drawTimestamp;
      const leftMs = ONE_DAY_MS - elapsed;
      if (leftMs <= 0) {
        setRemainingTime(null);
        setCard(null);
        setDrawTimestamp(null);
        localStorage.removeItem('dailyTarotCard');
        if (currentUser?.username) {
          localStorage.removeItem(`dailyTarotCard_${currentUser.username}`);
        }
      } else {
        const totalSec = Math.floor(leftMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        setRemainingTime({ hours, minutes, seconds });
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [drawTimestamp, currentUser?.username]);

  const drawFortune = () => {
    playFortuneClickSound();

    // If card was already drawn within 24h, simply open to view - strict 1 draw per 24 hours
    if (card && drawTimestamp && Date.now() - drawTimestamp < ONE_DAY_MS) {
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    setIsDrawing(true);

    setTimeout(async () => {
      const random = TAROT_78_CARDS[Math.floor(Math.random() * TAROT_78_CARDS.length)];
      const now = Date.now();
      setCard(random);
      setDrawTimestamp(now);
      setIsDrawing(false);
      await saveDailyFortune(currentUser?.username, random, now);
    }, 1200);
  };

  const isDrawnWithin24h = !!(card && drawTimestamp && Date.now() - drawTimestamp < ONE_DAY_MS);

  return (
    <>
      <div className="flex justify-center mt-2">
        <button
          onClick={drawFortune}
          className="relative flex items-center justify-center px-6 py-2 rounded-full bg-zinc-900/60 border border-zinc-700 text-zinc-300 text-sm font-serif italic hover:bg-zinc-800 hover:text-zinc-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(244,114,182,0.25)] hover:border-pink-400/40 group overflow-hidden cursor-pointer"
        >
          {/* Subtle glowing sweep effect */}
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-pink-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          <span className="relative z-10 flex items-center gap-1.5 text-zinc-200 group-hover:text-pink-200 transition-colors">
            Thông điệp hôm nay ✦
            <span className="text-pink-300 text-xs">𝜗ৎ</span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-2xl rounded-3xl p-[1.5px] shadow-[0_0_40px_rgba(244,114,182,0.35)] relative text-center overflow-hidden border border-pink-400/40"
            >
              {/* Animated pastel glow border */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-rose-300/40 to-pink-500/20 animate-pulse pointer-events-none" />
              
              <div className="relative w-full h-full bg-zinc-950/95 rounded-3xl p-6 sm:p-7 z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-pink-300 text-xs">𝜗ৎ</span>
                  <h3 className="text-lg font-bold text-zinc-100 serif-title tracking-wide italic">
                    Thông Điệp Tarot Định Mệnh
                  </h3>
                  <span className="text-pink-300 text-xs">𝜗ৎ</span>
                </div>
                <p className="text-[10px] text-zinc-400 mb-3">Chỉ dẫn năng lượng & tâm thức trong ngày</p>
                
                {isDrawing ? (
                  <div className="py-12 flex flex-col items-center gap-5">
                    <motion.div 
                      animate={{ rotateY: [0, 180, 360], scale: [1, 1.08, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-16 h-24 bg-gradient-to-b from-pink-950 via-zinc-900 to-black border-2 border-pink-400/60 rounded-xl shadow-[0_0_25px_rgba(244,114,182,0.5)] flex items-center justify-center"
                    >
                      <span className="text-3xl text-pink-300">🎴</span>
                    </motion.div>
                    <p className="text-xs text-pink-300 animate-pulse font-serif italic">
                      Đang xào 78 lá bài Tarot và kết nối năng lượng...
                    </p>
                  </div>
                ) : (
                  card && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center w-full"
                    >
                      {/* Tarot Card Display Box */}
                      <div className="relative group my-2 p-4 w-28 h-40 rounded-2xl bg-gradient-to-b from-pink-950/40 via-zinc-900 to-black border-2 border-pink-300/80 shadow-[0_0_25px_rgba(244,114,182,0.45)] flex flex-col items-center justify-between overflow-hidden">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-pink-300/80">
                          {card.arcana === 'major' ? 'Major Arcana' : 'Minor Arcana'}
                        </span>
                        
                        <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(244,114,182,0.8)] my-auto animate-pulse">
                          {card.symbol}
                        </div>

                        <span className="text-[10px] text-zinc-400 font-mono">
                          {card.nameEn}
                        </span>
                      </div>
                      
                      {/* Card Title */}
                      <h4 className="text-base font-bold text-pink-100 tracking-wide font-serif italic mt-2.5 mb-1">
                        {card.name}
                      </h4>

                      {/* Keywords Badge */}
                      <p className="text-[11px] text-pink-300/90 font-medium px-3 py-1 rounded-full bg-pink-500/10 border border-pink-400/30 mb-3">
                        ✨ {card.keywords}
                      </p>
                      
                      {/* Meaning & Interpretation */}
                      <div className="text-left w-full space-y-2.5 bg-black/50 p-3.5 rounded-2xl border border-white/10 text-xs">
                        <div>
                          <span className="text-pink-300 font-bold text-[11px] block mb-0.5">✦ Ý nghĩa thông điệp:</span>
                          <p className="text-zinc-300 leading-relaxed font-sans text-[11.5px]">
                            {card.meaning}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <span className="text-rose-300 font-bold text-[11px] block mb-0.5">✦ Lời chỉ dẫn hôm nay:</span>
                          <p className="text-zinc-300 font-serif italic leading-relaxed text-[11.5px]">
                            {card.advice}
                          </p>
                        </div>
                      </div>

                      {/* Real-time 24h Countdown Notice */}
                      {isDrawnWithin24h && (
                        <div className="w-full mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-pink-300" />
                            <span>Lá bài mới sau:</span>
                          </div>
                          {remainingTime ? (
                            <span className="font-mono font-bold text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-lg border border-pink-400/30 text-xs">
                              {String(remainingTime.hours).padStart(2, '0')}:
                              {String(remainingTime.minutes).padStart(2, '0')}:
                              {String(remainingTime.seconds).padStart(2, '0')}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px]">Đã sẵn sàng</span>
                          )}
                        </div>
                      )}

                      <p className="text-[10px] text-zinc-400 text-center mt-2 italic">
                        Mỗi ngày chỉ bốc 1 lá bài duy nhất (chu kỳ 24h real-time)
                      </p>

                      {/* Close button */}
                      <div className="mt-3.5 flex items-center justify-center w-full pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-6 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs shadow-md active:scale-95 cursor-pointer"
                        >
                          Đã hiểu 𝜗ৎ
                        </button>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
