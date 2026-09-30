import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Sparkles, Megaphone, Bell } from 'lucide-react';
import { homeNoticeConfig, NoticeItem } from '../data/homeNotice';
import { playFortuneClickSound, playCardClickSound } from '../lib/sound';

export function HomeNoticeBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const items = (homeNoticeConfig.items || []).filter(
    (item) => item && typeof item.content === 'string' && item.content.trim().length > 0
  );

  // Auto-cycle notices every 4 seconds when banner is active
  useEffect(() => {
    if (!homeNoticeConfig.isEnabled || items.length <= 1 || isPaused || isDetailOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [items.length, isPaused, isDetailOpen]);

  if (!homeNoticeConfig.isEnabled || items.length === 0) return null;

  const currentItem: NoticeItem = items[currentIndex] || items[0];

  const getBadgeStyle = (type: NoticeItem['badgeType']) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      case 'warning':
        return 'bg-amber-400/20 text-amber-200 border-amber-400/40';
      case 'pink':
        return 'bg-pink-500/20 text-pink-200 border-pink-400/40';
      case 'info':
        return 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40';
      default:
        return 'bg-white/10 text-zinc-300 border-white/20';
    }
  };

  return (
    <>
      {/* Sleek Ticker Banner below Search Bar */}
      <div 
        className="mt-3.5 max-w-md mx-auto w-full select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          onClick={() => {
            playFortuneClickSound();
            setIsDetailOpen(true);
          }}
          className="group relative flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-pink-400/35 hover:border-pink-300/60 backdrop-blur-xl shadow-[0_0_16px_rgba(244,114,182,0.15)] hover:shadow-[0_0_22px_rgba(244,114,182,0.3)] transition-all cursor-pointer overflow-hidden active:scale-[0.99]"
          title="Chạm để xem chi tiết toàn bộ bản tin cập nhật"
        >
          {/* Subtle Pink Shimmer */}
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-pink-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] pointer-events-none" />

          {/* Left Icon with Pulse Dot */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-xs">📢</span>
          </div>

          {/* Rotating Message Ticker */}
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden h-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id || currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="flex items-center gap-1.5 min-w-0 w-full"
              >
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded border ${getBadgeStyle(currentItem.badgeType)}`}>
                  {currentItem.badge}
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-200 truncate group-hover:text-white transition-colors">
                  {currentItem.content}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Action Hint: Count & Chevron */}
          <div className="flex items-center gap-1 shrink-0 text-zinc-400 group-hover:text-pink-300 transition-colors">
            <span className="text-[10px] text-zinc-500 group-hover:text-pink-300 font-mono">
              {currentIndex + 1}/{items.length}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Full Detailed Modal Popup */}
      <AnimatePresence>
        {isDetailOpen && (
          <div 
            onClick={() => setIsDetailOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-950/95 border border-pink-400/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(244,114,182,0.25)] relative overflow-hidden flex flex-col gap-4 text-left"
            >
              {/* Top Accent Neon Line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-rose-300 to-pink-500" />

              {/* Modal Header */}
              <div className="flex flex-col items-center justify-center text-center pb-3 border-b border-white/10 relative">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <span className="text-xs">📢</span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide flex items-center gap-1.5">
                    <span>News Update</span>
                    <span className="text-pink-300 text-xs">𝜗ৎ</span>
                  </h3>
                </div>
                <p className="text-[10px] text-zinc-400">
                  {homeNoticeConfig.updatedDate}
                </p>
              </div>

              {/* Modal Body: List of all notices */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {items.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-pink-500/30 transition-all flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle(item.badgeType)} w-fit`}>
                        {item.badge}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              {homeNoticeConfig.footerNote && (
                <div className="pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-pink-200/85 italic font-serif leading-relaxed">
                  {homeNoticeConfig.footerNote}
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="w-full py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 font-semibold text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                Đã nắm thông tin ♡
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
