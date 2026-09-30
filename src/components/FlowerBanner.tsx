import React from 'react';
import { playFortuneClickSound } from '../lib/sound';

export function FlowerBanner({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex justify-center my-3 sm:my-3.5 px-4 select-none">
      <div 
        onClick={() => {
          playFortuneClickSound();
          onClick?.();
        }}
        className="relative w-full max-w-lg h-22 sm:h-24 overflow-hidden flex items-center justify-center [mask-image:radial-gradient(ellipse_65%_55%_at_center,black_20%,transparent_95%)] [-webkit-mask-image:radial-gradient(ellipse_65%_55%_at_center,black_20%,transparent_95%)] cursor-pointer group active:scale-[0.98] transition-transform"
        title="Đến vườn hoa MeiMei (/meimeigarden)"
      >
        {/* Background GIF hòa quyện loang mềm mại 4 phía vào nền đen */}
        <img
          src="https://i.pinimg.com/originals/78/17/b2/7817b2cf90b9144bc972b7950a9aebf3.gif"
          alt="Hoa meimei"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        />

        {/* Lớp gradient phụ trợ 2 bên sườn trái/phải để 2 cạnh tuyệt đối tan mờ êm dịu */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none opacity-80" />

        {/* Center Content: Chữ màu trắng style serif thanh lịch trên nền loang */}
        <div className="relative z-10 flex items-center justify-center p-2 text-center pointer-events-none">
          <span className="font-serif italic text-base sm:text-lg text-white tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] group-hover:text-pink-100 transition-colors">
            người ơi nhớ đến chăm hoa
          </span>
        </div>
      </div>
    </div>
  );
}
