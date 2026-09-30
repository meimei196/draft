import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Brain, Video, BookOpen, Code2, ExternalLink } from 'lucide-react';
import { playCardClickSound } from '../lib/sound';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccordionItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // Check if Google Drive link
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    if (!useIframeFallback) {
      return (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-lg aspect-video w-full flex items-center justify-center">
          <video
            controls
            playsInline
            preload="metadata"
            src={directUrl}
            onError={() => setUseIframeFallback(true)}
            className="w-full h-full object-contain rounded-2xl"
          >
            Trình duyệt không hỗ trợ xem trực tiếp.
          </video>
        </div>
      );
    }

    // Cleaned-up iframe fallback
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/90 shadow-lg aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          width="100%"
          height="100%"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          className="w-full h-full rounded-2xl border-0"
        ></iframe>
      </div>
    );
  }

  // Check if direct mp4/webm link
  if (url.match(/\.(mp4|webm|mov)(\?.*)?$/i) || url.includes('catbox.moe') || url.includes('dropbox.com')) {
    let videoSrc = url;
    if (url.includes('dropbox.com')) {
      videoSrc = url.replace('dl=0', 'raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-lg aspect-video w-full flex items-center justify-center">
        <video
          controls
          playsInline
          preload="metadata"
          src={videoSrc}
          className="w-full h-full object-contain rounded-2xl"
        >
          Trình duyệt không hỗ trợ xem video trực tiếp.
        </video>
      </div>
    );
  }

  // Fallback iframe (Streamable, etc.)
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-lg aspect-video w-full">
      <iframe
        src={url}
        title={title}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        className="w-full h-full rounded-2xl border-0"
      ></iframe>
    </div>
  );
}

export function BeginnerGuideModal({ isOpen, onClose }: BeginnerGuideModalProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>('model-guide');

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    playCardClickSound();
    setOpenAccordion(prev => (prev === id ? null : id));
  };

  const accordionItems: AccordionItem[] = [
    {
      id: 'model-guide',
      icon: <Brain className="w-4 h-4 text-zinc-300" />,
      title: 'Lựa chọn Model AI & Mẹo giữ trí nhớ Bot',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200">
            <p className="font-semibold mb-1 text-zinc-100 flex items-center gap-1.5">
              <span>💡</span> Khuyên dùng Model:
            </p>
            <p className="text-zinc-300">
              Nàng nên chọn <strong>Gemini 2.5 Pro/3.1 Pro</strong> hoặc <strong>3.7 Flash</strong> (hoặc bất kỳ model nào nàng thích trải nghiệm).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200">
            <p className="font-semibold mb-1 text-zinc-100 flex items-center gap-1.5">
              <span>⚠️</span> Tránh làm bot bị "lỏ":
            </p>
            <p className="text-zinc-300">
              Khuyên nàng nên <strong>chơi duy nhất 1 model xuyên suốt</strong> trong cùng một phiên chat. Tránh chuyển đổi qua lại giữa các model liên tục, vì mỗi model có cách xử lý thông tin khác nhau, việc đổi qua đổi lại dễ khiến AI bị xáo trộn ký ức và nhầm lẫn bối cảnh/xưng hô nhé!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'video-guide',
      icon: <Video className="w-4 h-4 text-zinc-300" />,
      title: 'Video hướng dẫn điền prompt',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
          <p className="text-zinc-400">
            TUT nhỏ điền prompt char của sốp cho các nàng tham khảo!
          </p>

          {/* Video Container - Supports Google Drive, Streamable, and MP4 */}
          <VideoPlayer 
            url="https://www.dropbox.com/scl/fi/yuwomogvvnwc1mxozzk45/1784985620037_1845386796790695614_4291514293052110508.mp4?rlkey=mmw2djeo3ns67gvg9z1fpc9qr&st=woxh1ow9&dlraw=1" 
            title="TUT nhỏ điền prompt char" 
          />
        </div>
      )
    },
    {
      id: 'html-command-guide',
      icon: <Code2 className="w-4 h-4 text-zinc-300" />,
      title: 'Lệnh HTML',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
          <p className="text-zinc-400">
            Các mẫu lệnh HTML trang trí khung chat, màu chữ và hiệu ứng:
          </p>
          <a
            href="https://www.facebook.com/share/p/19cJ86Lgq7/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-pink-400/50 text-pink-200 transition-all group active:scale-[0.99] cursor-pointer"
          >
            <span className="font-semibold text-xs text-zinc-100 group-hover:text-pink-200 transition-colors">
              Click zô đây có 4 mẫu lệnh vọc 𝜗ৎ
            </span>
            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-pink-300 transition-colors shrink-0" />
          </a>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[85vh] bg-zinc-950 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-zinc-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-serif">
                  Cẩm Nang Hướng Dẫn
                </h3>
                <p className="text-[10px] text-zinc-400">Dành cho người mới bắt đầu 𝜗ৎ</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Scrollable Accordion */}
          <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1 custom-scrollbar">
            {accordionItems.map((item) => {
              const isExpanded = openAccordion === item.id;
              return (
                <div 
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 pr-2">
                      <div className="shrink-0">{item.icon}</div>
                      <span className="text-xs font-semibold text-zinc-200">
                        {item.title}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-white' : ''
                      }`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-3.5 pt-0 border-t border-white/5">
                          {item.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footer close button */}
          <div className="pt-3 border-t border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-medium text-xs transition-all border border-white/10 active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <span>GOT IT!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
