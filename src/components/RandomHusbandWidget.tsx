import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, MessageSquare, Gift } from 'lucide-react';
import { Bot, bots } from '../data/bots';
import { playRandomHusbandSound } from '../lib/sound';

interface RandomHusbandWidgetProps {
  onSelectBot: (id: string) => void;
}

export function RandomHusbandWidget({ onSelectBot }: RandomHusbandWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [shuffleBot, setShuffleBot] = useState<Bot | null>(null);

  // Filter only real bots (no system-osin, no placeholders)
  const realBots = bots.filter(
    (b) => b.id !== 'system-osin' && !b.id.startsWith('placeholder-')
  );

  const startRandomizer = () => {
    if (realBots.length === 0) return;
    playRandomHusbandSound();
    setIsOpen(true);
    setIsSpinning(true);
    setSelectedBot(null);

    let duration = 2000; // total animation time in ms
    let intervalTime = 60; // initial speed
    let elapsed = 0;

    const runShuffle = () => {
      const randomIndex = Math.floor(Math.random() * realBots.length);
      setShuffleBot(realBots[randomIndex]);

      elapsed += intervalTime;
      // Exponentially slow down the shuffle
      if (elapsed < duration) {
        intervalTime = 60 + Math.pow(elapsed / duration, 3) * 300;
        setTimeout(runShuffle, intervalTime);
      } else {
        // Final selection
        const finalBot = realBots[Math.floor(Math.random() * realBots.length)];
        setSelectedBot(finalBot);
        setShuffleBot(finalBot);
        setIsSpinning(false);
      }
    };

    runShuffle();
  };

  const handleSelect = (botId: string) => {
    onSelectBot(botId);
    setIsOpen(false);
  };

  // Add custom event listener so other parts of the app (like header) can trigger the randomizer
  useEffect(() => {
    const handleTrigger = () => {
      startRandomizer();
    };
    window.addEventListener('trigger-random-husband', handleTrigger);
    return () => window.removeEventListener('trigger-random-husband', handleTrigger);
  }, [realBots]);

  return (
    <>
      {/* TRIGGER BUTTONS */}
      {/* Desktop View: floating card on the right middle margin of the screen */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed right-6 top-[35%] -translate-y-1/2 hidden md:flex flex-col items-center justify-center p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-white/5 transition-all w-24 h-28 z-40 text-center backdrop-blur-md gap-1.5 group select-none"
        onClick={startRandomizer}
      >
        <div className="relative">
          <Gift className="w-8 h-8 text-zinc-300 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300"></span>
          </span>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-tight">
          Hôm nay
        </span>
        <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider leading-tight">
          póc ai?
        </span>
      </motion.div>

      {/* Mobile View: Floating Action Button (FAB) at bottom-right of viewport */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-4 md:hidden flex items-center gap-1.5 bg-zinc-900/95 border border-zinc-800 backdrop-blur-md py-2.5 px-4 rounded-full shadow-lg z-[999] text-xs font-bold text-zinc-200 hover:scale-105 active:scale-95 transition-all select-none"
        onClick={startRandomizer}
      >
        <Sparkles className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
        <span>Hôm nay póc ai? 𝜗ৎ</span>
      </motion.button>

      {/* INTERACTIVE RANDOMIZER OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => !isSpinning && setIsOpen(false)}
            />

            {/* Modal Card Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-zinc-950/95 border border-zinc-800 rounded-[32px] p-6 text-center shadow-2xl overflow-hidden z-10 select-none"
            >
              {/* Background flares (subtle, neutral silver/grey) */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-zinc-800/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-zinc-700/10 blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSpinning}
                className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6 mt-2">
                <span className="inline-flex items-center gap-1 bg-zinc-900 text-zinc-300 border border-zinc-850 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                  Duyên Phận Của Bạn
                </span>
                <h3 className="text-lg font-bold text-zinc-100 serif-title">
                  {isSpinning ? 'Đang xoay nhân duyên...' : 'Chúc mừng! Chồng của bạn là:'}
                </h3>
              </div>

              {/* SHUFFLE CARD AREA */}
              <div className="relative h-64 w-full bg-zinc-900/50 border border-zinc-850 rounded-2xl overflow-hidden flex items-center justify-center p-4 mb-6">
                <AnimatePresence mode="popLayout">
                  {shuffleBot && (
                    <motion.div
                      key={shuffleBot.id + (isSpinning ? '-spinning' : '-selected')}
                      initial={isSpinning ? { y: 60, opacity: 0 } : { scale: 0.9, opacity: 0 }}
                      animate={isSpinning ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
                      exit={isSpinning ? { y: -60, opacity: 0 } : { opacity: 0 }}
                      transition={
                        isSpinning
                          ? { type: 'spring', damping: 15, stiffness: 200 }
                          : { type: 'spring', damping: 20, stiffness: 250 }
                      }
                      className="flex flex-col items-center justify-center h-full w-full"
                    >
                      {/* Avatar with subtle borders */}
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-zinc-700 shadow-md mb-3.5 flex-shrink-0">
                        <img
                          src={shuffleBot.avatar}
                          alt={shuffleBot.name}
                          className="w-full h-full object-cover"
                        />
                        {isSpinning && (
                          <div className="absolute inset-0 bg-zinc-500/10 animate-pulse pointer-events-none" />
                        )}
                      </div>

                      {/* Bot details */}
                      <h4 className="text-base font-bold text-zinc-100 tracking-tight line-clamp-1">
                        {shuffleBot.name}
                      </h4>
                      {shuffleBot.age && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          Tuổi: {shuffleBot.age}
                        </span>
                      )}
                      <p className="text-xs text-zinc-400 italic line-clamp-2 mt-1 px-4 text-center leading-relaxed">
                        {shuffleBot.description}
                      </p>

                      {!isSpinning && (
                        <div className="flex flex-wrap justify-center gap-1 mt-2.5 max-w-[250px]">
                          {shuffleBot.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2">
                {!isSpinning && selectedBot ? (
                  <button
                    onClick={() => handleSelect(selectedBot.id)}
                    className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 border border-zinc-300"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Trò chuyện ngay
                  </button>
                ) : (
                  <div className="w-full h-10 flex items-center justify-center text-zinc-500 text-xs italic">
                    Đang chọn chồng hoàn hảo...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}