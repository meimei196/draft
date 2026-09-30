import React from 'react';

export interface FrameOption {
  id: string;
  name: string;
  badge: string;
  borderColor: string;
  glowColor: string;
  decorTop?: string;
  decorBottom?: string;
  ringClass: string;
  frameOverlayUrl?: string; // Optional custom PNG frame overlay
}

export const ADMIN_FRAMES: FrameOption[] = [
  {
    id: 'frame-sakura-rose-overlay',
    name: 'Sakura & Rose Crest',
    badge: 'Khung hoa hồng & anh đào độc quyền',
    borderColor: 'border-transparent',
    glowColor: '',
    decorTop: '',
    decorBottom: '',
    ringClass: '',
    frameOverlayUrl: 'https://files.catbox.moe/w16o7y.png',
  },
  {
    id: 'frame-crown-rose',
    name: 'Royal Rose',
    badge: 'Vương miện hồng ngọc & hoa hồng hoàng gia',
    borderColor: 'border-pink-300',
    glowColor: 'shadow-[0_0_16px_rgba(244,114,182,0.9)]',
    decorTop: '👑',
    decorBottom: '𝜗ৎ',
    ringClass: 'ring-2 ring-pink-300/90 ring-offset-2 ring-offset-black',
  },
  {
    id: 'frame-angel-halo',
    name: 'Angelic Halo',
    badge: 'Hào quang thiên thần & ánh ngọc trai trắng hồng',
    borderColor: 'border-rose-200',
    glowColor: 'shadow-[0_0_16px_rgba(253,242,248,0.95)]',
    decorTop: '🪽',
    decorBottom: '✨',
    ringClass: 'ring-2 ring-rose-200/90 ring-offset-2 ring-offset-zinc-950',
  },
  {
    id: 'frame-coquette-ribbon',
    name: 'Coquette Velvet',
    badge: 'Nơ nhung đen hồng tiểu thư kiêu kỳ',
    borderColor: 'border-pink-400',
    glowColor: 'shadow-[0_0_15px_rgba(244,114,182,0.85)]',
    decorTop: '🎀',
    decorBottom: '🖤',
    ringClass: 'ring-2 ring-pink-400/80 ring-offset-2 ring-offset-black',
  },
  {
    id: 'frame-gothic-cross',
    name: 'Gothic Thorns',
    badge: 'Hoa hồng gai ma mị & thập tự giá',
    borderColor: 'border-rose-400',
    glowColor: 'shadow-[0_0_16px_rgba(251,113,133,0.7)]',
    decorTop: '🥀',
    decorBottom: '✝',
    ringClass: 'ring-2 ring-rose-400/80 ring-offset-2 ring-offset-black',
  },
  {
    id: 'frame-starlight-moon',
    name: 'Moonlit Celestial',
    badge: 'Trăng khuyết & ánh sao đêm huyền ảo',
    borderColor: 'border-pink-200',
    glowColor: 'shadow-[0_0_15px_rgba(244,114,182,0.75)]',
    decorTop: '🌙',
    decorBottom: '✦',
    ringClass: 'ring-2 ring-pink-200/80 ring-offset-2 ring-offset-black',
  },
  {
    id: 'frame-fairy-butterfly',
    name: 'Fairy Butterfly',
    badge: 'Cánh bướm tiên dạ quang',
    borderColor: 'border-rose-300',
    glowColor: 'shadow-[0_0_15px_rgba(253,164,175,0.8)]',
    decorTop: '🦋',
    decorBottom: '✧',
    ringClass: 'ring-2 ring-rose-300/80 ring-offset-2 ring-offset-black',
  },
  {
    id: 'frame-devil-cat',
    name: 'Dark Cat',
    badge: 'Sừng quỷ nhỏ & dấu chân mèo tinh nghịch',
    borderColor: 'border-pink-400',
    glowColor: 'shadow-[0_0_15px_rgba(244,114,182,0.8)]',
    decorTop: '😈',
    decorBottom: '🐾',
    ringClass: 'ring-2 ring-pink-400/80 ring-offset-2 ring-offset-black',
  },
  {
    id: 'frame-sakura-bloom',
    name: 'Sakura Bloom',
    badge: 'Cánh hoa anh đào phất phới',
    borderColor: 'border-rose-300',
    glowColor: 'shadow-[0_0_15px_rgba(253,164,175,0.85)]',
    decorTop: '🌸',
    decorBottom: '🌸',
    ringClass: 'ring-2 ring-rose-300/90 ring-offset-2 ring-offset-black',
  },
];

export function getFrameById(frameId?: string | null): FrameOption {
  return ADMIN_FRAMES.find((f) => f.id === frameId) || ADMIN_FRAMES[0];
}

interface AvatarWithFrameProps {
  avatarUrl: string;
  frameId?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDecor?: boolean;
  className?: string;
}

export function AvatarWithFrame({
  avatarUrl,
  frameId,
  size = 'md',
  showDecor = true,
  className = '',
}: AvatarWithFrameProps) {
  const frame = getFrameById(frameId);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  const decorTopSizes = {
    sm: '-top-2 text-[10px]',
    md: '-top-2.5 text-[11px]',
    lg: '-top-3 text-[14px]',
    xl: '-top-4 text-[18px]',
  }[size];

  const decorBottomSizes = {
    sm: '-bottom-1.5 text-[8px]',
    md: '-bottom-2 text-[9px]',
    lg: '-bottom-2.5 text-[12px]',
    xl: '-bottom-3 text-[15px]',
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Top Decor Badge */}
      {showDecor && frame.decorTop && (
        <span
          className={`absolute ${decorTopSizes} z-20 select-none animate-bounce filter drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]`}
          style={{ animationDuration: '2.5s' }}
        >
          {frame.decorTop}
        </span>
      )}

      {/* Main Circular Avatar with Frame */}
      <div
        className={`${sizeClasses} rounded-full overflow-hidden ${frame.ringClass} ${frame.glowColor} transition-all duration-300 bg-black relative`}
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover select-none"
        />
      </div>

      {/* Custom Frame Overlay Image (e.g. avatar-frame-sakura-rose.png) */}
      {frame.frameOverlayUrl && (
        <img
          src={frame.frameOverlayUrl}
          alt="Frame Overlay"
          className="absolute inset-[-14%] w-[128%] h-[128%] max-w-none pointer-events-none select-none z-25 object-contain filter drop-shadow-[0_0_10px_rgba(244,114,182,0.7)]"
        />
      )}

      {/* Bottom Decor Badge */}
      {showDecor && frame.decorBottom && (
        <span
          className={`absolute ${decorBottomSizes} z-20 select-none filter drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] text-pink-300`}
        >
          {frame.decorBottom}
        </span>
      )}
    </div>
  );
}
