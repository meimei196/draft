import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, LogOut, Check, Edit2, Camera, Flower2, Heart } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';
import { AppUser, updateUserProfile, logoutUser } from '../lib/userAuth';
import { ADMIN_FRAMES, AvatarWithFrame } from './AvatarFrame';
import { compressImage } from '../lib/imageUtils';
import {
  getLocalFlowerData,
  FlowerData,
  restoreGardenFromCloud,
  getGardenDailyActivities,
  GardenDailyActivity,
} from '../lib/gardenSync';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
  onUserUpdate: (updated: AppUser) => void;
  onLogout: () => void;
  onOpenGarden?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  onLogout,
  onOpenGarden,
}: UserProfileModalProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [flowerData, setFlowerData] = useState<FlowerData>(() => getLocalFlowerData(user.username));
  const [activities, setActivities] = useState<GardenDailyActivity[]>(() =>
    getGardenDailyActivities(user.username)
  );
  const [, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showNotice = (msg: string, duration = 3000) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setSaveNotice(msg);
    noticeTimerRef.current = setTimeout(() => {
      setSaveNotice('');
    }, duration);
  };

  // Sync garden status and activities on modal open
  useEffect(() => {
    if (isOpen) {
      setNickname(user.nickname);
      setFlowerData(getLocalFlowerData(user.username));
      setActivities(getGardenDailyActivities(user.username));

      restoreGardenFromCloud(user.username).then((cloud) => {
        if (cloud?.flowerData) {
          setFlowerData(cloud.flowerData);
        }
        setActivities(getGardenDailyActivities(user.username));
      });
    }
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, [isOpen, user.username, user.nickname]);

  if (!isOpen) return null;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    showNotice('Đang xử lý ảnh...');

    try {
      let finalAvatar = '';
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

      if (isGif) {
        // Read raw data URL for GIF to preserve animated frames
        finalAvatar = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        finalAvatar = await compressImage(file, 400, 0.8);
      }

      const res = await updateUserProfile({ avatarUrl: finalAvatar });
      if (res.success && res.user) {
        onUserUpdate(res.user);
        playFortuneClickSound();
        showNotice('Đã đổi avatar thành công! ✧', 3000);
      } else {
        showNotice(res.error || 'Không thể cập nhật profile!', 3000);
      }
    } catch (_err) {
      showNotice('Không thể cập nhật profile, nàng thử lại nhé!', 3000);
    } finally {
      if (e.target) e.target.value = '';
      setSaving(false);
    }
  };

  const handleSelectFrame = async (frameId: string) => {
    playFortuneClickSound();
    setSaving(true);
    try {
      const res = await updateUserProfile({ frameId });
      if (res.success && res.user) {
        onUserUpdate(res.user);
        showNotice('Đã đổi khung trang trí! ✧', 3000);
      } else if (res.error) {
        showNotice(res.error, 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!nickname.trim() || nickname.trim() === user.nickname) {
      setIsEditingNick(false);
      return;
    }
    setSaving(true);
    try {
      const res = await updateUserProfile({ nickname: nickname.trim() });
      if (res.success && res.user) {
        onUserUpdate(res.user);
        setIsEditingNick(false);
        playFortuneClickSound();
        showNotice('Đã đổi biệt danh thành công! ✧', 3000);
      } else if (res.error) {
        showNotice(res.error, 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    playFortuneClickSound();
    logoutUser();
    onLogout();
    onClose();
  };

  const completedCount = activities.filter((a) => a.done).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-zinc-950/95 border border-pink-400/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_40px_rgba(244,114,182,0.25)] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Decorative backgrounds */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-pink-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
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

        {/* Header Section: Avatar with Frame + Nickname */}
        <div className="flex flex-col items-center text-center pb-3 border-b border-white/10 shrink-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Chạm để đổi ảnh đại diện (hỗ trợ ảnh tĩnh và GIF động)"
          >
            <AvatarWithFrame
              avatarUrl={user.avatarUrl}
              frameId={user.frameId}
              size="xl"
              showDecor={true}
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-sans font-medium transition-opacity z-30">
              <Camera className="w-4 h-4 mb-0.5 text-pink-300" />
              <span>Đổi ảnh</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.gif"
            onChange={handleAvatarFile}
            className="hidden"
          />

          {/* Nickname & Edit */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {isEditingNick ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="px-2.5 py-1 text-sm rounded-lg bg-zinc-900 border border-pink-400/50 text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveNickname}
                  className="p-1 rounded-lg bg-pink-500/30 text-pink-200 hover:bg-pink-500/50 text-xs px-2 cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide">
                  {user.nickname}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingNick(true)}
                  className="text-zinc-500 hover:text-pink-300 transition-colors cursor-pointer"
                  title="Đổi biệt danh"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-zinc-400">@{user.username}</span>
            {user.isAdmin ? (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/25 border border-pink-400/50 text-pink-200 text-[10px] font-semibold flex items-center gap-1 shadow-[0_0_8px_rgba(244,114,182,0.4)]">
                <span>👑</span>
                <span>Giáo Chủ Hội Zơm (Admin)</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 border border-white/10 text-zinc-300 text-[10px] font-medium">
                𝜗ৎ Thành viên Vườn
              </span>
            )}
          </div>

          {saveNotice && (
            <p className="text-xs text-pink-300 mt-2 font-medium animate-in fade-in">
              {saveNotice}
            </p>
          )}
        </div>

        {/* Scrollable Body: Daily Chăm (5 hoạt động vườn) + Khung Avatar Decor */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-4 pr-1">
          {/* Card: daily chăm */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-pink-950/40 border border-pink-400/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-200 font-serif">
                <Flower2 className="w-4 h-4 text-pink-400" />
                <span>daily chăm</span>
              </div>
              <span className="text-[10px] text-pink-300 font-sans font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                {completedCount}/5 xong
              </span>
            </div>

            {/* Streak & Cánh hoa tích lũy (Cập nhật tăng/giảm theo hoạt động vườn) */}
            <div className="grid grid-cols-2 gap-2 text-center my-2.5">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-zinc-400">Chuỗi ngày chăm hoa</p>
                <p className="text-lg font-bold font-serif text-pink-200 mt-0.5">
                  {flowerData.streak} <span className="text-xs font-sans font-normal text-zinc-400">ngày</span>
                </p>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-zinc-400">Cánh hoa tích luỹ</p>
                <p className="text-lg font-bold font-serif text-pink-200 mt-0.5">
                  {flowerData.petals} <span className="text-xs font-sans font-normal text-zinc-400">✿</span>
                </p>
              </div>
            </div>

            {/* Danh sách 5 hoạt động trong vườn với đánh tick bên phải */}
            <div className="space-y-1.5 pt-1.5 border-t border-white/10">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                    act.done
                      ? 'bg-pink-500/10 border-pink-400/35 text-zinc-200'
                      : 'bg-black/30 border-white/5 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm shrink-0">{act.icon}</span>
                    <div className="min-w-0">
                      <p className={`font-medium leading-tight text-[11px] ${act.done ? 'text-pink-100 font-semibold' : 'text-zinc-300'}`}>
                        {act.title}
                      </p>
                      <p className="text-[9px] text-zinc-400 leading-tight mt-0.5">{act.reward}</p>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0 pl-2">
                    {act.done ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/25 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 text-[10px]" title="Chưa hoàn thành">
                        ○
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {onOpenGarden && (
              <button
                type="button"
                onClick={() => {
                  playFortuneClickSound();
                  onClose();
                  onOpenGarden();
                }}
                className="w-full mt-3 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-serif italic transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Vào Vườn Mộng Miên Chăm Daily</span>
                <span className="text-pink-300">𝜗ৎ</span>
              </button>
            )}
          </div>

          {/* Frame Decor Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5 text-pink-300">
                <Heart className="w-3.5 h-3.5 fill-pink-400/20" />
                <span>Khung Avatar Decor</span>
              </span>
              <span className="text-[10.5px] text-zinc-400 font-normal">Chạm để đổi khung</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-0.5">
              {ADMIN_FRAMES.map((f) => {
                const isSelected = user.frameId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFrame(f.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? 'bg-pink-500/25 border-pink-300 text-pink-200 shadow-[0_0_15px_rgba(244,114,182,0.45)]'
                        : 'bg-black/50 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-pink-400/30'
                    }`}
                  >
                    <span className="text-xl shrink-0 filter drop-shadow-[0_0_4px_rgba(244,114,182,0.6)]">
                      {f.decorTop || '✨'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold truncate leading-tight flex items-center gap-1">
                        <span>{f.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-pink-300 inline" />}
                      </p>
                      <p className="text-[9px] text-zinc-400 truncate mt-0.5">{f.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: Centered Logout Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-2 px-7 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium cursor-pointer transition-colors active:scale-95 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
