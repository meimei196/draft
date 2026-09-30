import { useState, useRef, ReactNode, useEffect } from 'react';
import { Bot, bots } from '../data/bots';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useStore } from '../lib/store';
import { BotComments } from './BotComments';
import { playFortuneClickSound } from '../lib/sound';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getCurrentUser } from '../lib/userAuth';
import { toggleBotLike, syncBotStatsFromServer } from '../lib/botLikeSync';

interface CollapsibleSectionProps {
  title: string;
  content: ReactNode;
}

function CollapsibleSection({ title, content }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors group select-none"
      >
        <h3 className="text-sm uppercase tracking-widest text-[#d4d4d8] font-bold group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-all">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform duration-300" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {content}
        </div>
      )}
    </div>
  );
}

export function BotProfile({ botId, onBack }: { botId: string; onBack: () => void }) {
  const bot = bots.find(b => b.id === botId);
  const isLiked = useStore((state) => state.likedBots.includes(botId));
  const likesCount = useStore((state) => state.botStats[botId]?.likesCount) || 0;
  
  const [linkNotice, setLinkNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    syncBotStatsFromServer();
    const handleFocus = () => syncBotStatsFromServer();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [botId]);

  const handleToggleLike = async () => {
    playFortuneClickSound();
    const user = getCurrentUser();
    await toggleBotLike(botId, user?.username);
    syncBotStatsFromServer();
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };
  
  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <p className="text-zinc-400 text-sm font-serif italic">Không tìm thấy thông tin nhân vật này 𝜗ৎ</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-semibold transition-all cursor-pointer shadow-md"
        >
          ← Quay về meimeicorner
        </button>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        return <strong key={index} className="font-bold text-zinc-100">{cleanText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <header className="sticky top-0 z-50 p-4 flex items-center justify-center bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm relative">
        <button 
          onClick={onBack}
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-zinc-100 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center truncate max-w-[70%]">
          <h1 className="text-base sm:text-lg font-bold truncate bot-title-effect">{bot.name}</h1>
          <p className="text-[10px] text-zinc-400 truncate">{bot.description}</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
          
          {/* Cover & Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-zinc-700 shadow-xl mb-6 relative">
               <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="relative inline-flex items-center justify-center gap-2 mb-2 select-none">
              <span className="text-zinc-500 text-xs">⋆˙</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-center bot-title-effect italic tracking-wide">
                {bot.name}
              </h1>
              <span className="text-zinc-500 text-xs">⟡</span>
            </div>
            <p className="text-sm text-zinc-400 italic text-center mb-4">{bot.description}</p>
            
            {/* Nút Like & Hiển thị số lượt Tim (Chỉ giữ icon tim và số lượt) */}
            <div className="flex items-center justify-center mb-5 select-none">
              <button
                type="button"
                onClick={handleToggleLike}
                className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 cursor-pointer active:scale-90 shadow-md ${
                  isLiked
                    ? 'bg-pink-500/20 border-pink-400 text-pink-200 shadow-[0_0_20px_rgba(244,114,182,0.4)]'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 hover:border-pink-400/40 text-zinc-300 hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.4)]'
                }`}
                title={isLiked ? 'Bỏ thích' : 'Thả tim cho chàng'}
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isLiked
                      ? 'fill-pink-500 text-pink-400 scale-110 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                      : 'text-zinc-400 group-hover:text-pink-300 group-hover:scale-110'
                  }`}
                />
                <span className={`text-xs font-bold font-serif ${isLiked ? 'text-pink-300' : 'text-zinc-200'}`}>
                  {formatNumber(likesCount)}
                </span>
                <span className="text-[10px] text-pink-300/80">𝜗ৎ</span>
              </button>
            </div>

            {/* Hashtags */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {bot.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 text-zinc-200 rounded-full text-[10px] font-semibold border border-white/10 shadow-sm backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <a 
                href={bot.link || "#"}
                target={bot.link ? "_blank" : "_self"}
                rel="noreferrer"
                onClick={(e) => {
                  if (!bot.link) {
                    e.preventDefault();
                    setLinkNotice(`Sắp ra mắt! Link tới model trò chuyện của ${bot.name} chưa được gắn.`);
                    setTimeout(() => setLinkNotice(null), 3500);
                  }
                }}
                className="group flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-7 py-3 rounded-full font-bold shadow-md transition-all hover:-translate-y-1 text-sm cursor-pointer"
              >
                Chơi với {bot.name}
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
              {linkNotice && (
                <p className="text-xs text-pink-300 bg-black/60 px-3 py-1 rounded-full border border-pink-500/30 animate-in fade-in">
                  {linkNotice}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            {bot.backstory && (
            <div className="glass-panel p-6 rounded-3xl border-white/10">
               <h3 className="text-sm uppercase tracking-widest text-[#d4d4d8] font-bold mb-3">Backstory</h3>
               <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(bot.backstory)}</p>
            </div>
            )}

            <div className="glass-panel p-6 rounded-3xl border-white/10">
               <h3 className="text-sm uppercase tracking-widest text-[#d4d4d8] font-bold mb-3">Mở đầu</h3>
               <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed italic">{renderFormattedText(bot.greeting)}</p>
            </div>
            
            {bot.charProfile && (
              <CollapsibleSection
                title="Hồ sơ nhân vật"
                content={<p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(bot.charProfile)}</p>}
              />
            )}
            
            {bot.lore && (
              <CollapsibleSection
                title="HIDDEN LORE (spoil⚠️)"
                content={<p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(bot.lore)}</p>}
              />
            )}

            {bot.worldBuilding && (
              <CollapsibleSection
                title="World-Building"
                content={<p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(bot.worldBuilding)}</p>}
              />
            )}

            {bot.NPCsProfile && (
              <CollapsibleSection
                title="Các nhân vật phụ"
                content={<p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(bot.NPCsProfile)}</p>}
              />
            )}
            
            {bot.command && (
              <CollapsibleSection
                title="Các lệnh"
                content={<p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(bot.command)}</p>}
              />
            )}  

            {(bot.charPrompt && bot.charPrompt.length > 0) && (
              <CollapsibleSection
                title="Tính cách / Tương tác"
                content={<p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed opacity-80">{renderFormattedText(bot.charPrompt)}</p>}
              />
            )}
          </div>

          {/* Anonymous Comments & Real-time Replies Section */}
          <BotComments botId={bot.id} botName={bot.name} />

        </div>

        {/* Floating Quick Scroll Top / Bottom Buttons (Mobile & Desktop optimized) */}
        <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-2">
          <button
            type="button"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-pink-300 hover:text-white hover:bg-black/95 flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer group"
            title="Cuộn lên đầu trang"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={scrollToBottom}
            className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-pink-300 hover:text-white hover:bg-black/95 flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer group"
            title="Cuộn xuống cuối trang"
          >
            <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
