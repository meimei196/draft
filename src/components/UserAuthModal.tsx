import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, LogIn, UserPlus, Lock, User, Heart } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';
import { loginUser, registerUser, loginWithGoogle, AppUser } from '../lib/userAuth';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'register';
  noticeMessage?: string;
}

export function UserAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  noticeMessage,
}: UserAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      playFortuneClickSound();
      const res = await loginWithGoogle();
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể đăng nhập bằng Gmail!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(username, password);
        if (res.success && res.user) {
          playFortuneClickSound();
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Đăng nhập không thành công!');
        }
      } else {
        // Registering without avatar picker; default avatar is set, user can change later in profile
        const res = await registerUser(username, password, nickname || username);
        if (res.success && res.user) {
          playFortuneClickSound();
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Đăng ký không thành công!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-zinc-950/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(255,255,255,0.06)] overflow-hidden"
      >
        {/* Subtle decorative glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            playFortuneClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Notice banner if opening for garden access */}
        {noticeMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-zinc-900/90 border border-white/20 text-center">
            <p className="text-xs text-pink-200 font-serif leading-relaxed flex items-center justify-center gap-1.5">
              <span>🌸</span>
              <span>{noticeMessage}</span>
            </p>
          </div>
        )}

        {/* Header Title (No AI star icon - replaced with delicate floral heart) */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900/90 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)] mb-2">
            <Heart className="w-5 h-5 text-pink-300 fill-pink-400/25" />
          </div>
          <h2 className="text-xl font-bold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-pink-100 via-rose-100 to-pink-200">
            {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Đăng nhập để vào vườn Mộng Miên, lưu streak và decor profile 𝜗ৎ'
              : 'Tạo tài khoản để bắt đầu chuỗi ngày chăm hoa trong vườn ♡'}
          </p>
        </div>

        {/* Fast Google / Gmail Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-2xl bg-zinc-900/95 hover:bg-zinc-850 border border-white/15 hover:border-white/35 text-white font-medium text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50 mb-3 group"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="tracking-wide">Đăng nhập nhanh bằng Gmail</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-sans">
            hoặc bằng tài khoản
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-white/10 mb-4 select-none">
          <button
            type="button"
            onClick={() => {
              playFortuneClickSound();
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-zinc-800 text-pink-200 border border-white/20 shadow-[0_0_12px_rgba(244,114,182,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playFortuneClickSound();
              setMode('register');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-zinc-800 text-pink-200 border border-white/20 shadow-[0_0_12px_rgba(244,114,182,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng ký</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 text-left animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Nickname (Register only) - Left aligned */}
          {mode === 'register' && (
            <div className="text-left">
              <label className="block text-left text-[11px] font-medium text-zinc-300 mb-1">
                Biệt danh hiển thị (Nickname)
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  required
                  placeholder="VD: Bé điệu, vợ 𝜗ৎ..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-left rounded-xl bg-zinc-900/90 border border-white/15 focus:border-white/40 focus:outline-none text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>
          )}

          {/* Username - Strictly left aligned */}
          <div className="text-left">
            <label className="block text-left text-[11px] font-medium text-zinc-300 mb-1">
              Tên đăng nhập (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                placeholder="Chữ cái thường hoặc số"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-left rounded-xl bg-zinc-900/90 border border-white/15 focus:border-white/40 focus:outline-none text-xs text-white placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Password - Strictly left aligned */}
          <div className="text-left">
            <label className="block text-left text-[11px] font-medium text-zinc-300 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu của nàng..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-left rounded-xl bg-zinc-900/90 border border-white/15 focus:border-white/40 focus:outline-none text-xs text-white placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Submit button - Premium Pink-Black Luxury */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-zinc-950 via-[#1b0b16] to-zinc-950 hover:from-black hover:via-[#2b1022] hover:to-black text-pink-200 hover:text-pink-100 font-serif font-bold text-xs tracking-wider border border-pink-500/35 hover:border-pink-400/60 shadow-[0_4px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(244,114,182,0.18)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.95),0_0_22px_rgba(244,114,182,0.32)] transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span>Đang kết nối đám mây...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5 text-pink-300 group-hover:scale-110 transition-transform" />
                <span>Đăng Nhập</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 text-pink-300 group-hover:scale-110 transition-transform" />
                <span>Hoàn Tất Đăng Ký</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 text-center mt-4">
          ♡ Dữ liệu của nàng sẽ được lưu vĩnh viễn trên đám mây MeiMei Corner ♡
        </p>
      </motion.div>
    </div>
  );
}
