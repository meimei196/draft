import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dices, Flame, Sparkles } from 'lucide-react';
import { playFortuneClickSound, playCardClickSound } from '../lib/sound';
import { DateIdea, getRandomSfwIdea, getRandomNsfwIdea, SFW_DATE_IDEAS, NSFW_DATE_IDEAS } from '../data/dateIdeas';

export function DateIdeaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sfw' | 'nsfw'>('sfw');
  const [currentIdea, setCurrentIdea] = useState<DateIdea>(() => getRandomSfwIdea());
  const [isSpinning, setIsSpinning] = useState(false);

  const handleTabChange = (tab: 'sfw' | 'nsfw') => {
    if (tab === activeTab) return;
    playFortuneClickSound();
    setActiveTab(tab);
    setCurrentIdea(tab === 'sfw' ? getRandomSfwIdea() : getRandomNsfwIdea());
  };

  const handleSpin = () => {
    playFortuneClickSound();
    setIsSpinning(true);

    const ideaPool = activeTab === 'sfw' ? SFW_DATE_IDEAS : NSFW_DATE_IDEAS;
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentIdea(ideaPool[Math.floor(Math.random() * ideaPool.length)]);
      counter++;
      if (counter > 7) {
        clearInterval(interval);
        const finalChoice = activeTab === 'sfw' ? getRandomSfwIdea() : getRandomNsfwIdea();
        setCurrentIdea(finalChoice);
        setIsSpinning(false);
        playCardClickSound();
      }
    }, 70);
  };

  return (
    <>
      {/* Pastel Pink Bubble Button */}
      <div className="flex justify-center mb-1 select-none">
        <button
          type="button"
          onClick={() => {
            playFortuneClickSound();
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-950/40 via-black/60 to-pink-950/40 hover:from-pink-950/60 hover:via-black/70 hover:to-pink-950/60 border border-pink-400/30 hover:border-pink-300/50 text-pink-200/85 hover:text-pink-100 text-xs font-serif italic shadow-[0_0_12px_rgba(244,114,182,0.12)] hover:shadow-[0_0_20px_rgba(244,114,182,0.25)] transition-all cursor-pointer active:scale-95 overflow-hidden backdrop-blur-md"
          title="Chạm để mở gợi ý idea hẹn hò & chat"
        >
          {/* Subtle pastel shimmer sweep */}
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-pink-300/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          <span className="relative z-10 text-pink-300/80 group-hover:text-pink-200 group-hover:rotate-90 transition-all duration-300 text-sm">
            ✦
          </span>
          <span className="relative z-10 tracking-wide">
            Gợi ý Idea Hẹn Hò & Chat ⟡
          </span>
          <span className="relative z-10 text-xs text-pink-300/80 group-hover:scale-125 transition-transform">𝜗ৎ</span>
        </button>
      </div>

      {/* Pop-up Modal with Pastel Pink / Rose Tone */}
      <AnimatePresence>
        {isOpen && (
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md bg-zinc-950/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 relative text-left overflow-hidden flex flex-col gap-4 border transition-colors duration-300 ${
                activeTab === 'nsfw' 
                  ? 'border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.18),0_0_15px_rgba(244,114,182,0.1)]' 
                  : 'border-pink-300/30 shadow-[0_0_40px_rgba(244,114,182,0.22),0_0_15px_rgba(255,255,255,0.08)]'
              }`}
            >
              {/* Subtle top neon glow accent */}
              <div 
                className={`absolute top-0 inset-x-0 h-1 transition-all duration-300 ${
                  activeTab === 'nsfw' 
                    ? 'bg-gradient-to-r from-transparent via-rose-500/70 to-transparent' 
                    : 'bg-gradient-to-r from-transparent via-pink-300/70 to-transparent'
                }`} 
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-1 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={activeTab === 'nsfw' ? 'text-rose-400 text-sm' : 'text-pink-300 text-sm'}>✦</span>
                    <h3 className="text-base font-bold text-white font-serif tracking-wide">
                      {activeTab === 'nsfw' ? 'Idea Chat Cay Nồng 18+ & 21+' : 'Idea Hẹn Hò'}
                    </h3>
                    <span className={activeTab === 'nsfw' ? 'text-rose-400 text-sm' : 'text-pink-300 text-sm'}>✦</span>
                  </div>
                  <p className="text-[10.5px] text-zinc-400 mt-0.5 font-sans">
                    {activeTab === 'nsfw' 
                      ? 'Kho 69 ý tưởng 18+ & 21+ táo bạo, cuồng nhiệt và kịch tính khi muốn đưa chàng vào tròng' 
                      : 'Kho 69 gợi ý hoạt động hẹn hò ngọt ngào & tình cảm thú vị khi nàng bí idea chat cùng Chồng iu'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Switch Tabs: SFW vs 18+ & 21+ NSFW */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/90 rounded-2xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => handleTabChange('sfw')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'sfw'
                      ? 'bg-gradient-to-r from-pink-300 via-pink-200 to-rose-200 text-zinc-950 font-bold shadow-[0_0_15px_rgba(244,114,182,0.45)]'
                      : 'text-pink-200/70 hover:text-pink-100 hover:bg-pink-500/10'
                  }`}
                >
                  <span className="text-xs">𝜗ৎ</span>
                  <span>Hẹn Hò (69)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('nsfw')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium transition-all cursor-pointer ${
                    activeTab === 'nsfw'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                      : 'text-rose-300/70 hover:text-rose-200 hover:bg-rose-500/10'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Cay Nồng 18+/21+ (69)</span>
                </button>
              </div>

              {/* Main Idea Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3 shadow-inner">
                {/* Category & Emoji */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10.5px] px-3 py-1 rounded-full font-medium tracking-wide ${
                    activeTab === 'nsfw'
                      ? 'bg-rose-500/15 text-rose-200 border border-rose-500/30'
                      : 'bg-pink-500/15 text-pink-200 border border-pink-300/30'
                  }`}>
                    {currentIdea.category}
                  </span>
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
                    {currentIdea.emoji}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm sm:text-base font-bold text-white font-serif tracking-wide leading-snug">
                  {currentIdea.title}
                </h4>

                {/* Scenario Description */}
                <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-sans">
                  {currentIdea.scenario}
                </p>
              </div>

              {/* Centered Reroll Button (No "Đóng" button) */}
              <div className="flex items-center justify-center pt-1 pb-1">
                <button
                  type="button"
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg ${
                    activeTab === 'nsfw'
                      ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]'
                      : 'bg-gradient-to-r from-pink-300 via-pink-200 to-rose-200 hover:from-pink-200 hover:to-rose-100 text-zinc-950 shadow-[0_0_20px_rgba(244,114,182,0.35)] hover:shadow-[0_0_25px_rgba(244,114,182,0.5)]'
                  }`}
                >
                  <Dices className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Đang quay idea...' : 'Quay idea khác ↻'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
