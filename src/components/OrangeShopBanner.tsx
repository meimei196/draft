import React from 'react';
import { playFortuneClickSound } from '../lib/sound';

export function OrangeShopBanner() {
  const storeUrl = 'https://collshp.com/meimei_corner?view=storefront';

  return (
    <div className="mt-2.5 max-w-md mx-auto w-full select-none px-1">
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          playFortuneClickSound();
        }}
        className="group relative flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-950/40 via-black/70 to-amber-950/40 hover:from-orange-950/60 hover:via-black/80 hover:to-amber-950/60 border border-orange-500/35 hover:border-orange-400/60 backdrop-blur-xl shadow-[0_0_16px_rgba(249,115,22,0.15)] hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] transition-all cursor-pointer overflow-hidden active:scale-[0.99] text-center"
        title="Ghé gian hàng sàn cam của MeiMei Corner"
      >
        {/* Subtle orange shimmer effect */}
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-orange-400/15 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center gap-2">
          {/* Badge icon sàn cam */}
          <span className="text-sm leading-none group-hover:scale-110 transition-transform">🍊</span>

          {/* Slogan căn giữa */}
          <span className="font-serif italic font-medium text-xs sm:text-[13px] text-orange-200 group-hover:text-orange-100 transition-colors">
            ủng hộ 1 đơn cam cho sốp tại đây
          </span>

          <span className="text-xs text-orange-300/80 font-serif group-hover:scale-125 transition-transform">𝜗ৎ</span>
        </div>
      </a>
    </div>
  );
}
