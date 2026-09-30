import React, { useEffect, useState } from 'react';
import { ArrowLeft, Lock, LogIn } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';
import { AppUser, getCurrentUser } from '../lib/userAuth';
import { restoreGardenFromCloud, syncGardenToCloud, saveGardenSubKeyToCloud } from '../lib/gardenSync';

interface MeiMeiGardenProps {
  onBack: () => void;
  currentUser?: AppUser | null;
  onRequestLogin?: () => void;
}

export function MeiMeiGarden({ onBack, currentUser, onRequestLogin }: MeiMeiGardenProps) {
  const activeUser = currentUser !== undefined ? currentUser : getCurrentUser();
  const [isRestored, setIsRestored] = useState(false);

  // Restore garden save data from Firestore before or on iframe mount
  useEffect(() => {
    if (activeUser?.username) {
      restoreGardenFromCloud(activeUser.username).finally(() => {
        setIsRestored(true);
      });
    } else {
      setIsRestored(true);
    }
  }, [activeUser?.username]);

  // Listen to postMessage from garden game iframe for real-time cloud sync
  useEffect(() => {
    if (!activeUser?.username) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'GARDEN_SYNC_DATA' && e.data.accountId === activeUser.username) {
        saveGardenSubKeyToCloud(activeUser.username, e.data.subKey, e.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Flush current local snapshot to Firestore on exit
      syncGardenToCloud(activeUser.username);
    };
  }, [activeUser?.username]);

  const handleBackClick = () => {
    playFortuneClickSound();
    if (activeUser?.username) {
      syncGardenToCloud(activeUser.username);
    }
    onBack();
  };

  // If user is not logged in, enforce login requirement as requested
  if (!activeUser) {
    return (
      <div className="fixed inset-0 z-40 w-screen h-[100dvh] m-0 p-0 bg-[#0d1410] flex flex-col items-center justify-center text-center p-6 select-none">
        <button
          type="button"
          onClick={handleBackClick}
          className="absolute top-[max(12px,env(safe-area-inset-top,12px))] left-[max(12px,env(safe-area-inset-left,12px))] z-50 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1b251f]/85 hover:bg-[#26372c] active:scale-90 text-[#f7edd7] hover:text-white border border-[#e8dcc0]/35 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all cursor-pointer select-none group"
          aria-label="Quay lại"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4 text-[#e8dcc0] group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="max-w-md p-8 rounded-3xl bg-zinc-950/90 border border-pink-400/30 shadow-[0_0_40px_rgba(244,114,182,0.25)] space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-500/15 border border-pink-400/40 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.4)]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-white italic">
            Xin Hãy Đăng Nhập
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed font-serif">
            Nàng cần đăng nhập tài khoản để vào vườn Mộng Miên, chăm sóc hoa hồng và lưu chuỗi ngày điểm danh daily trên đám mây nhé ♡
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => {
                playFortuneClickSound();
                onBack();
                onRequestLogin?.();
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-serif font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(244,114,182,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập ngay</span>
            </button>
            <button
              type="button"
              onClick={handleBackClick}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userEmail = activeUser.email || (activeUser.isAdmin ? 'meinguyen18@gmail.com' : '');
  const iframeSrc = `/garden/index.html?account=${encodeURIComponent(activeUser.username)}&name=${encodeURIComponent(activeUser.nickname)}&email=${encodeURIComponent(userEmail)}`;

  return (
    <div className="fixed inset-0 z-40 w-screen h-[100dvh] m-0 p-0 border-0 rounded-none bg-[#111915] overflow-hidden select-none touch-manipulation overscroll-none">
      {/* Floating minimalist back button */}
      <button
        type="button"
        onClick={handleBackClick}
        className="absolute top-[max(12px,env(safe-area-inset-top,12px))] left-[max(12px,env(safe-area-inset-left,12px))] z-50 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1b251f]/85 hover:bg-[#26372c] active:scale-90 text-[#f7edd7] hover:text-white border border-[#e8dcc0]/35 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all cursor-pointer select-none group"
        aria-label="Quay lại"
        title="Quay lại"
      >
        <ArrowLeft className="w-4 h-4 text-[#e8dcc0] group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Fullscreen garden iframe */}
      {isRestored && (
        <iframe
          src={iframeSrc}
          title="Vườn Mộng Miên"
          className="w-full h-full m-0 p-0 border-0 block bg-[#111915]"
          allow="autoplay; fullscreen"
        />
      )}
    </div>
  );
}
