import React, { useState, useRef, useEffect, UIEvent, useMemo, useCallback } from 'react';
import { Bot, UpcomingBot, bots as allBots, upcomingBots } from '../data/bots';
import { Filter, ArrowUp, ArrowDown, Facebook, ChevronLeft, ChevronRight, X, Sparkles, BookOpen, Heart, Crown, ArrowLeft } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { AnonymousFeedback } from './AnonymousFeedback';
import { FortuneWidget } from './FortuneWidget';
import { BeginnerGuideModal } from './BeginnerGuideModal';
import { DateIdeaWidget } from './DateIdeaWidget';
import { FlowerBanner } from './FlowerBanner';
import { HomeNoticeBanner } from './HomeNoticeBanner';
import { OrangeShopBanner } from './OrangeShopBanner';
import { HomeUserAvatarButton } from './HomeUserAvatarButton';
import { motion, AnimatePresence } from 'motion/react';
import { playCardClickSound, playFortuneClickSound } from '../lib/sound';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../lib/store';
import { getCurrentUser, subscribeAuth, AppUser } from '../lib/userAuth';
import { toggleBotLike, syncBotStatsFromServer } from '../lib/botLikeSync';

export function Home({ 
  onSelectBot, 
  onOpenForum, 
  onBackToGate,
  onOpenGarden 
}: { 
  onSelectBot: (id: string) => void; 
  onOpenForum?: () => void; 
  onBackToGate?: () => void; 
  onOpenGarden?: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedUpcomingBot, setSelectedUpcomingBot] = useState<UpcomingBot | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTop10Modal, setShowTop10Modal] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // User Auth & Avatar state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [requireLoginNotice, setRequireLoginNotice] = useState('');

  useEffect(() => {
    return subscribeAuth((u) => {
      setCurrentUser(u);
    });
  }, []);

  const handleGardenBannerClick = () => {
    if (!currentUser) {
      playFortuneClickSound();
      setRequireLoginNotice('Nàng ơi, hãy đăng nhập để vào vườn Mộng Miên và duy trì chuỗi chăm hoa nhé ♡');
      setIsLoginModalOpen(true);
      return;
    }
    if (onOpenGarden) {
      onOpenGarden();
    }
  };

  // Đồng bộ số lượt like từ Server (hoàn toàn MIỄN PHÍ, KHÔNG TỐN QUOTA FIREBASE)
  useEffect(() => {
    // 1. Tải số like mới nhất từ server ngay khi mở trang
    syncBotStatsFromServer();

    // 2. Đồng bộ ngầm mỗi 30 giây (hoặc khi đổi tab/mở lại điện thoại)
    // Server nội bộ chạy không tốn hạn ngạch Firebase Cloud!
    const interval = setInterval(() => {
      syncBotStatsFromServer();
    }, 30000);

    // 3. Tự động đồng bộ ngay khi người dùng quay lại tab hoặc mở lại màn hình điện thoại
    const handleFocus = () => {
      syncBotStatsFromServer();
    };
    const handleVisibility = () => {
      if (!document.hidden) {
        syncBotStatsFromServer();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const filterTags = [
    'TXVT',
    'FWB',
    'Tsundere',
    'Trọng sinh',
    'Xuyên sách',
    'Hệ thống',
    'Chiếm hữu',
    'Thống trị',
    'Trêu chọc',
    'Bạo ngược',
    'Drama',
    'Ngược',
    'Chú già',
    'Daddy vibe',
    'Dead Dove',
    'Ma cà rồng',
    'Người yêu cũ',
    'Kẻ thù',
    'Mafia',
    'Hắc đạo',
    'Yêu thầm',
    'Hôn nhân sắp đặt',
    'Hoàng gia',
    'Bắt nạt',
    'Đại tá',
    'Bé trai',
    'Thanh mai trúc mã',
    'Thầy trò',
    'Cổ trang',
    'Hiện đại',
    'Kỳ ảo',
    'Chữa lành',
    'Hài hước',
    '18+'
  ];

  const filteredBots = useMemo(() => {
    return [...allBots]
      .reverse() // Bot mới thêm ở cuối mảng sẽ được đưa lên đầu
      .sort((a, b) => ((b as any).isNew ? 1 : 0) - ((a as any).isNew ? 1 : 0)) // Ưu tiên tuyệt đối bot có tag isNew
      .filter(
        (b) =>
          b.id !== 'system-osin' &&
          (b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) &&
          (!activeTag || b.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase() || t === activeTag))
      );
  }, [search, activeTag]);

  // Trích xuất Top 5 bot đề cử (Ưu tiên thuộc tính isRecommended)
  const topBots = useMemo(() => {
    const recommended = allBots.filter(b => b.id !== 'system-osin' && (b as any).isRecommended);
    if (recommended.length > 0) return recommended.slice(0, 5);
    // Fallback nếu chưa set đề cử thì lấy 5 người đầu tiên
    return [...allBots].filter(b => b.id !== 'system-osin').slice(0, 5);
  }, [allBots]);

  // BXH Top 3 Chồng Iu Đắc Sủng Nhất (xếp hạng dựa trên số tim real-time)
  const botStats = useStore((state) => state.botStats);
  const topRankedHusbands = useMemo(() => {
    return [...allBots]
      .filter((b) => b.id !== 'system-osin')
      .sort((a, b) => {
        const likesA = botStats[a.id]?.likesCount || 0;
        const likesB = botStats[b.id]?.likesCount || 0;
        if (likesB !== likesA) return likesB - likesA;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3);
  }, [allBots, botStats]);

  // BXH Top 10 Chồng Đắc Sủng
  const top10Husbands = useMemo(() => {
    return [...allBots]
      .filter((b) => b.id !== 'system-osin')
      .sort((a, b) => {
        const likesA = botStats[a.id]?.likesCount || 0;
        const likesB = botStats[b.id]?.likesCount || 0;
        if (likesB !== likesA) return likesB - likesA;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);
  }, [allBots, botStats]);

  // Carousel Logic
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCarouselIndex((prev) => (prev + 1) % topBots.length);
  }, [topBots.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCarouselIndex((prev) => (prev - 1 + topBots.length) % topBots.length);
  }, [topBots.length]);

  useEffect(() => {
    if (topBots.length <= 1 || search || activeTag) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [topBots.length, search, activeTag, nextSlide]);

  const containerRef = useRef<HTMLDivElement>(null);

  const getScrollContainer = useCallback(() => {
    if (!containerRef.current) return window as unknown as HTMLElement;
    let el: HTMLElement | null = containerRef.current.parentElement;
    while (el) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return el;
      }
      el = el.parentElement;
    }
    return window as unknown as HTMLElement;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagsRef.current && !tagsRef.current.contains(event.target as Node)) {
        setShowTags(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const parentEl = containerRef.current?.parentElement;
      const parentScroll = parentEl ? parentEl.scrollTop : 0;
      const winScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const currentScroll = Math.max(parentScroll, winScroll);
      setShowScrollTop(currentScroll > 10);
    };

    window.addEventListener('scroll', handleScroll, true);
    const parentEl = containerRef.current?.parentElement;
    if (parentEl) {
      parentEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (parentEl) {
        parentEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    if (containerRef.current?.parentElement) {
      containerRef.current.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    const parentEl = containerRef.current?.parentElement;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      parentEl ? parentEl.scrollHeight : 0
    );
    window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
    document.body.scrollTo({ top: maxScroll, behavior: 'smooth' });
    if (parentEl) {
      parentEl.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col min-h-full max-w-5xl mx-auto relative">
      <header className="p-6 text-center relative">
        {/* Mũi tên back ở góc trái trên giao diện Home để quay lại cổng chào */}
        {onBackToGate && (
          <button
            type="button"
            onClick={() => {
              playFortuneClickSound();
              onBackToGate();
            }}
            className="absolute left-3 top-4 sm:left-6 sm:top-6 z-30 p-2 text-zinc-400 hover:text-white transition-colors active:scale-90 cursor-pointer"
            title="Quay lại cổng chào"
            aria-label="Quay lại cổng chào"
          >
            <ArrowLeft className="w-5 h-5 hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Ô tròn Login Avatar ở góc phải tại Home */}
        <HomeUserAvatarButton
          currentUser={currentUser}
          onUserChange={(u) => setCurrentUser(u)}
          onOpenGarden={handleGardenBannerClick}
          isLoginModalOpen={isLoginModalOpen}
          requireLoginNotice={requireLoginNotice}
          onCloseLoginModal={() => {
            setIsLoginModalOpen(false);
            setRequireLoginNotice('');
          }}
        />

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 serif-title mb-1 neon-title">
          <span className="relative inline-block">
            meimeicorner
            <motion.span
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8], rotate: [0, 45, 90] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-3 -right-6 text-zinc-300"
            >
              ✦
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [90, 45, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute -bottom-1 -left-4 text-zinc-400 text-sm"
            >
              ✦
            </motion.span>
          </span>
        </h1>
        <p className="text-xs text-zinc-400 mb-4 drop-shadow-md">.✦ pick your husbandos and try 𝜗ৎ ݁˖</p>

        <FortuneWidget />
        <AnonymousFeedback />

        {/* Nút Forum Tám Zai */}
        <div className="flex justify-center mt-2.5">
          <button
            onClick={() => {
              playFortuneClickSound();
              if (onOpenForum) onOpenForum();
              else {
                window.history.pushState(null, '', '/forumtamzai');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="relative flex items-center justify-center px-6 py-2 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 border border-pink-400/40 text-pink-200 text-sm font-serif italic hover:bg-pink-500/30 hover:border-pink-300 transition-all shadow-[0_0_15px_rgba(244,114,182,0.15)] hover:shadow-[0_0_20px_rgba(244,114,182,0.35)] group overflow-hidden cursor-pointer active:scale-95"
          >
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            <span className="relative z-10 flex items-center gap-1.5 font-bold">
              <span>forum tám zai</span>
              <span className="text-pink-300 group-hover:scale-125 transition-transform">𝜗ৎ</span>
            </span>
          </button>
        </div>

        <div className="flex justify-center items-center mt-6">
          <div className="relative w-full max-w-md flex items-center" ref={tagsRef}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 select-none text-zinc-400">🔎</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-12 py-3 rounded-full glass-input focus:outline-none shadow-sm text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              onClick={() => setShowTags(!showTags)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors z-10"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Tags Dropdown */}
            {showTags && (
              <div className="absolute top-12 right-0 bg-black/80 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl p-4 w-64 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                  {filterTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`px-3 py-1 border rounded-full transition-colors ${
                        activeTag === tag ? 'bg-zinc-800 text-white border-zinc-500 shadow-sm' : 'bg-black/50 border-white/10 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📢 Dải thông báo chuyển động dưới thanh tìm kiếm (Bấm để xem toàn bộ chi tiết) */}
        {!search && !activeTag && (
          <>
            <HomeNoticeBanner />
            <OrangeShopBanner />
          </>
        )}
      </header>

      {/* Mục Chồng iu sắp đến - Teaser Banner */}
      {!search && !activeTag && upcomingBots.length > 0 && (
        <div className="w-full max-w-[800px] mx-auto px-8 mb-10">
          <div className="flex items-center justify-center mb-5 select-none gap-2">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/30"></span>
            <h2 className="text-sm sm:text-base font-bold tracking-[0.22em] uppercase font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              ⋆˙chồng iu sắp đến♡
            </h2>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/30"></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingBots.map((bot) => (
              <div 
                key={bot.id} 
                onClick={() => {
                  playCardClickSound();
                  setSelectedUpcomingBot(bot);
                }}
                className="relative group p-4 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:border-white/25 hover:bg-zinc-900/80 active:scale-[0.99]"
              >
                {/* Minimal Lock Icon & Arrow */}
                <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <span className="text-xs" title={bot.releaseDate || 'Sắp ra mắt'}>🔒</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="flex gap-3.5 items-center">
                  {/* Avatar image - Crisp & clear without blur or overlay lock */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-500 shadow-lg">
                    <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info Teaser */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-base font-bold text-zinc-100 tracking-tight font-serif truncate group-hover:text-pink-100 transition-colors">
                      {bot.name}
                    </h3>
                    <p className="text-[11px] font-medium text-pink-200/80 mb-1.5 truncate">
                      {bot.role}
                    </p>

                    <p className="text-[10px] text-zinc-400 line-clamp-2 italic leading-relaxed">
                      "{bot.teaser}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal chi tiết Chồng iu sắp đến */}
      <AnimatePresence>
        {selectedUpcomingBot && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedUpcomingBot(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-white/15 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedUpcomingBot(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/15 shadow-xl mb-4">
                  <img src={selectedUpcomingBot.avatar} alt={selectedUpcomingBot.name} className="w-full h-full object-cover" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium mb-2.5">
                  <span>🔒</span>
                  <span>{selectedUpcomingBot.releaseDate || 'Sắp ra mắt 𝜗ৎ'}</span>
                </div>

                <h3 className="text-xl font-bold text-zinc-100 font-serif mb-1">
                  {selectedUpcomingBot.name}
                </h3>

                <p className="text-xs font-semibold text-pink-300/90 mb-3 px-2">
                  {selectedUpcomingBot.role}
                </p>

                {selectedUpcomingBot.tags && selectedUpcomingBot.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {selectedUpcomingBot.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left mb-5">
                  <p className="text-xs text-zinc-300/90 italic leading-relaxed whitespace-pre-line">
                    "{selectedUpcomingBot.teaser}"
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUpcomingBot(null)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-medium text-xs transition-all border border-white/10 active:scale-95 cursor-pointer"
                >
                  Đóng thông tin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mục Đề cử chồng iu - Horizontal Scroll */}
      {topBots.length > 0 && !search && !activeTag && (
        <div className="w-full max-w-[800px] mx-auto px-8 mb-8">
          <div className="flex items-center justify-center mb-6 select-none gap-2">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/30"></span>
            <h2 className="text-sm sm:text-base font-bold tracking-[0.22em] uppercase font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              ⋆˙ đề cử chồng iu ⟡♡
            </h2>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/30"></span>
          </div>
          
          {/* Khung nền kính mờ (Glassmorphism) bao quanh toàn bộ Carousel */}
          <div className="relative p-[1px] rounded-[40px] bg-gradient-to-b from-white/10 via-white/0 to-white/5 shadow-2xl">
            <div className="relative group px-12 py-10 bg-white/[0.005] backdrop-blur-[0.5px] rounded-[39px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={topBots[carouselIndex]?.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <div className="w-full max-w-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[20px]">
                    <BotCard
                      bot={topBots[carouselIndex]}
                      onClick={() => {
                        playCardClickSound();
                        onSelectBot(topBots[carouselIndex].id);
                      }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BXH TOP CÁC CHỒNG ĐẮC SỦNG */}
      {!search && !activeTag && topRankedHusbands.length >= 3 && (
        <div className="w-full max-w-[800px] mx-auto px-4 sm:px-8 mb-8">
          <div className="flex items-center justify-center mb-4 select-none gap-2">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-pink-400/50"></span>
            <button
              type="button"
              onClick={() => {
                playFortuneClickSound();
                setShowTop10Modal(true);
              }}
              className="group inline-flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
              title="Click để xem bảng xếp hạng Top 10 cụ thể"
            >
              <motion.span 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="text-sm sm:text-base font-bold tracking-[0.14em] uppercase font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-100 to-pink-200 drop-shadow-[0_0_10px_rgba(244,114,182,0.6)] group-hover:text-pink-100"
              >
                Top Các Chồng Đắc Sủng
              </motion.span>
              <ChevronRight className="w-4 h-4 text-pink-300/80 group-hover:text-pink-200 group-hover:translate-x-0.5 transition-all" />
            </button>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-pink-400/50"></span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end select-none">
            {/* RANK 2 🥈 */}
            {topRankedHusbands[1] && (() => {
              const b = topRankedHusbands[1];
              const likes = botStats[b.id]?.likesCount || 0;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    playCardClickSound();
                    onSelectBot(b.id);
                  }}
                  className="flex flex-col items-center justify-center py-3 px-2 sm:py-3.5 sm:px-3 rounded-2xl sm:rounded-3xl bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-zinc-800/30 border border-zinc-400/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-zinc-200 transition-all active:scale-[0.98] space-y-1.5"
                >
                  <span className="text-xs sm:text-sm font-semibold text-zinc-300">🥈</span>
                  <div className="relative group/avatar my-0.5">
                    <span className="absolute -top-1 -right-1 text-[9px] z-10 text-zinc-300">✧</span>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-zinc-200 ring-2 ring-white/20 shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform shrink-0">
                      <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="w-full text-center space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 font-serif text-center truncate w-full group-hover:text-pink-200 transition-colors">
                      {b.name}
                    </h3>
                    <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-400">
                      <Heart className="w-2.5 h-2.5 fill-pink-400 text-pink-400" />
                      <span>{likes} tim</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* RANK 1 👑 (Snug compact spacing, black & pastel pink luxury aesthetic) */}
            {topRankedHusbands[0] && (() => {
              const b = topRankedHusbands[0];
              const likes = botStats[b.id]?.likesCount || 0;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    playCardClickSound();
                    onSelectBot(b.id);
                  }}
                  className="flex flex-col items-center justify-center py-3.5 px-2.5 sm:py-4 sm:px-3 rounded-2xl sm:rounded-3xl bg-gradient-to-t from-black via-zinc-950 to-rose-950/60 border-2 border-pink-400/80 shadow-[0_0_25px_rgba(244,114,182,0.45)] relative overflow-hidden group cursor-pointer hover:border-pink-300 transition-all active:scale-[0.98] space-y-1.5 -translate-y-1.5"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-400 via-rose-200 to-pink-400" />
                  
                  {/* Floating Rose Pink Royal Crown right above avatar - no dead space */}
                  <motion.div
                    animate={{ y: [-2, 0, -2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-xl sm:text-2xl filter drop-shadow-[0_0_12px_rgba(244,114,182,0.85)] z-10 leading-none -mb-1"
                  >
                    👑
                  </motion.div>

                  <div className="relative group/avatar my-0.5">
                    <span className="absolute -top-1 -right-1 text-[10px] z-10 text-pink-300 animate-pulse">✨</span>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-pink-300 ring-3 ring-pink-400/35 shadow-[0_0_18px_rgba(244,114,182,0.55)] group-hover:scale-105 transition-transform shrink-0">
                      <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-1 -left-1 text-[9px] z-10 text-pink-300">𝜗ৎ</span>
                  </div>
                  
                  <div className="w-full text-center space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-pink-100 font-serif text-center truncate w-full group-hover:text-pink-200 transition-colors drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]">
                      {b.name}
                    </h3>

                    <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-pink-200 bg-pink-500/25 px-2 py-0.5 rounded-full border border-pink-400/40 shadow-sm">
                      <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-300 animate-pulse" />
                      <span>{likes} tim</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* RANK 3 🥉 */}
            {topRankedHusbands[2] && (() => {
              const b = topRankedHusbands[2];
              const likes = botStats[b.id]?.likesCount || 0;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    playCardClickSound();
                    onSelectBot(b.id);
                  }}
                  className="flex flex-col items-center justify-center py-3 px-2 sm:py-3.5 sm:px-3 rounded-2xl sm:rounded-3xl bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-rose-950/20 border border-rose-500/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-rose-300 transition-all active:scale-[0.98] space-y-1.5"
                >
                  <span className="text-xs sm:text-sm font-semibold text-rose-300">🥉</span>
                  <div className="relative group/avatar my-0.5">
                    <span className="absolute -top-1 -left-1 text-[9px] z-10 text-rose-300">𝜗ৎ</span>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-rose-300 ring-2 ring-rose-400/20 shadow-[0_0_12px_rgba(244,114,182,0.3)] group-hover:scale-105 transition-transform shrink-0">
                      <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="w-full text-center space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 font-serif text-center truncate w-full group-hover:text-pink-200 transition-colors">
                      {b.name}
                    </h3>
                    <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-400">
                      <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                      <span>{likes} tim</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Bubble Gợi ý Idea Hẹn Hò & Chat */}
      {!search && !activeTag && (
        <>
          <DateIdeaWidget />
          <FlowerBanner onClick={handleGardenBannerClick} />
        </>
      )}

      {/* Modal Bảng Xếp Hạng Top 10 Chồng Đắc Sủng */}
      <AnimatePresence>
        {showTop10Modal && (
          <div
            onClick={() => setShowTop10Modal(false)}
            className="fixed inset-0 z-[3500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full bg-zinc-950/95 border border-pink-400/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(244,114,182,0.3)] relative overflow-hidden cursor-default space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-rose-300 to-pink-500" />
              
              <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👑</span>
                  <h3 className="text-base font-bold text-pink-200 font-serif italic">
                    Bảng Xếp Hạng Top 10 Chồng Đắc Sủng
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTop10Modal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {top10Husbands.map((b, idx) => {
                  const likes = botStats[b.id]?.likesCount || 0;
                  const isTop1 = idx === 0;
                  const isTop2 = idx === 1;
                  const isTop3 = idx === 2;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        playCardClickSound();
                        setShowTop10Modal(false);
                        onSelectBot(b.id);
                      }}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                        isTop1
                          ? 'bg-pink-500/15 border-pink-400/60 shadow-[0_0_15px_rgba(244,114,182,0.25)] hover:bg-pink-500/25'
                          : isTop2
                          ? 'bg-zinc-800/40 border-zinc-400/40 hover:bg-zinc-800/60'
                          : isTop3
                          ? 'bg-rose-950/30 border-rose-500/40 hover:bg-rose-950/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-bold text-xs shrink-0 font-serif">
                          {isTop1 ? '👑' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`}
                        </span>

                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-white/20 shrink-0">
                          <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                            {b.name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {b.tags?.slice(0, 2).join(' · ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-pink-300 shrink-0 ml-2">
                        <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-400" />
                        <span>{likes}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Banner "Nàng là người mới?" nằm dưới mục Đề cử chồng iu */}
      {!search && !activeTag && (
        <div className="w-full max-w-[800px] mx-auto px-8 mb-8">
          <div 
            onClick={() => {
              playCardClickSound();
              setIsGuideOpen(true);
            }}
            className="group relative p-4 sm:p-4.5 rounded-2xl bg-zinc-950/80 border border-white/15 backdrop-blur-md shadow-xl hover:border-white/30 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between gap-3 select-none active:scale-[0.99]"
          >
            {/* Subtle glow behind banner */}
            <div className="absolute -inset-1 bg-white/5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shrink-0 text-zinc-200 shadow-inner group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-serif tracking-wide group-hover:text-white transition-colors">
                  Nàng là người mới? 𝜗ৎ
                </h3>
                <p className="text-[11px] text-zinc-400 font-medium line-clamp-1 mt-0.5">
                  Bấm vào đây để xem hướng dẫn chọn Model AI & video thao tác nhé!
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[11px] font-semibold text-zinc-200 group-hover:bg-white/20 group-hover:text-white transition-all flex items-center gap-1 shadow-md">
              <span>Xem ngay</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Số tổng anh ck hiện tại nhỏ nhắn */}
          <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-zinc-400 select-none">
            <span className="w-1 h-1 rounded-full bg-pink-400/60 animate-pulse"></span>
            <span>
              Hiện đang có <strong className="text-pink-300 font-serif font-bold text-xs">{allBots.length}</strong> anh chồng iu đang túc trực bên nàng
            </span>
            <span className="text-[10px] text-pink-300/80">𝜗ৎ</span>
          </div>
        </div>
      )}

      {/* Modal Hướng dẫn người mới */}
      <BeginnerGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />

      <main 
        ref={mainRef}
        className="px-8 pb-8 flex flex-col items-center"
      >
        <div className="w-full max-w-[800px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[260px] gap-4 mb-12">
          {filteredBots.map((bot) => (
            <div key={bot.id}>
              <BotCard
                bot={bot}
                onClick={() => onSelectBot(bot.id)}
              />
            </div>
          ))}
        </div>

        <footer className="w-full max-w-[800px] py-6 text-center text-[11px] text-zinc-500 border-t border-white/5 flex flex-col items-center gap-2 select-none shrink-0 mt-auto">
          <p>© 2026 meimeicorner. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <a
              href="https://www.facebook.com/tinamcolink/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-1.5"
            >
              <Facebook className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
            </a>
            <span className="w-px h-3 bg-white/10" />
            <a 
              href="https://yodayo.com/@meimei196" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-pink-300 hover:border-pink-500/20 transition-all shadow-sm"
              title="Yodayo"
            >
              <span className="text-[6px] font-black tracking-tighter">YDY</span>
            </a>
            <a 
              href="https://character.ai/profile/mei196" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-pink-300 hover:border-pink-500/20 transition-all shadow-sm"
              title="Character.AI"
            >
              <span className="text-[6px] font-black tracking-tighter">C.AI</span>
            </a>
            <a 
              href="https://xoul.ai/profile/meimei196" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-pink-300 hover:border-pink-500/20 transition-all shadow-sm"
              title="Xoul"
            >
              <span className="text-[6px] font-black tracking-tighter">XOL</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Nhóm nút điều hướng Top/Down - Luôn hiển thị nổi bật phía trên mục "Hôm nay póc ai?" */}
      {/* Mobile View: Đặt ngay phía trên nút FAB "Hôm nay póc ai?" (bottom-right) */}
      <div 
        className="fixed right-4 bottom-[74px] md:hidden z-[2000] flex flex-col gap-2 transition-all duration-300"
      >
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-zinc-950/90 border border-zinc-700/80 text-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4 text-zinc-200 stroke-[2.5]" />
        </button>
        <button
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full bg-zinc-950/90 border border-zinc-700/80 text-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
          title="Xuống cuối trang"
        >
          <ArrowDown className="w-4 h-4 text-zinc-200 stroke-[2.5]" />
        </button>
      </div>

      {/* PC / Desktop View: Đặt ngay phía trên thẻ "Hôm nay póc ai?" (top-[35%]) */}
      <div 
        className="fixed right-6 top-[35%] -translate-y-[calc(50%+76px)] hidden md:flex items-center gap-2 z-[2000] transition-all duration-300"
      >
        <button
          onClick={scrollToTop}
          className="w-11 h-10 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center justify-center hover:bg-zinc-800 hover:text-white hover:border-zinc-500 active:scale-95 transition-all cursor-pointer group"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4 text-zinc-200 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
        </button>
        <button
          onClick={scrollToBottom}
          className="w-11 h-10 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center justify-center hover:bg-zinc-800 hover:text-white hover:border-zinc-500 active:scale-95 transition-all cursor-pointer group"
          title="Xuống cuối trang"
        >
          <ArrowDown className="w-4 h-4 text-zinc-200 stroke-[2.5] group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}

function BotCard({ bot, onClick }: { bot: Bot; onClick: () => void }) {
  const isLiked = useStore((state) => state.likedBots.includes(bot.id));
  const likesCount = useStore((state) => state.botStats[bot.id]?.likesCount) || 0;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playFortuneClickSound();
    const user = getCurrentUser();
    await toggleBotLike(bot.id, user?.username);
  };

  return (
    <div
      onClick={() => {
        playCardClickSound();
        onClick();
      }}
      className={`h-[260px] transition-transform hover:-translate-y-1 relative rounded-[20px] overflow-hidden cursor-pointer shadow-sm group border border-white/10 isolate`}
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      <img src={bot.avatar} alt={bot.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      
      {/* Badge "new try" cho bot mới */}
      {(bot as any).isNew && (
        <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 backdrop-blur-md animate-pulse shadow-[0_0_10px_rgba(244,114,182,0.3)]">
          <span className="text-[8px] font-bold text-pink-100 uppercase tracking-wider flex items-center gap-1">
            new try <span className="text-[10px]">𝜗ৎ</span>
          </span>
        </div>
      )}

      {/* Heart Like Button at Top-Right Corner (Borderless, delicate & non-overlapping) */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <button
          type="button"
          onClick={handleLikeClick}
          className={`flex items-center gap-1 p-1 rounded-full cursor-pointer select-none active:scale-75 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
            isLiked
              ? 'text-pink-400 font-bold drop-shadow-[0_0_8px_rgba(244,114,182,0.9)]'
              : 'text-white/60 hover:text-pink-300'
          }`}
          title={isLiked ? "Bỏ thích" : "Thả tim cho anh"}
        >
          <Heart 
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${
              isLiked ? 'fill-pink-500 text-pink-400 scale-110' : 'hover:scale-110'
            }`} 
          />
          <span className={`text-[10px] leading-none font-semibold ${isLiked ? 'text-pink-300 font-bold' : 'text-white/70'}`}>
            {likesCount}
          </span>
        </button>
      </div>

      {/* Subtle bottom gradient to make text readable without stark border */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" style={{ transform: 'translateZ(0)' }}></div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pointer-events-none w-full" style={{ transform: 'translateZ(0)' }}>
        <h3 className="text-sm font-bold leading-tight drop-shadow-md text-white line-clamp-1">{bot.name}</h3>
        <p className="text-[10px] italic text-zinc-300 drop-shadow-md mt-1 line-clamp-1">{bot.description}</p>
        <p className="text-[9px] font-medium drop-shadow-md text-zinc-300 mt-1.5 line-clamp-1">
          {bot.tags.map(t => `#${t}`).join(' ')}
        </p>
      </div>
    </div>
  );
}