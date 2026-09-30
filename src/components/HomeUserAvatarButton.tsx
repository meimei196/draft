import React, { useState } from 'react';
import { User } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';
import { AppUser } from '../lib/userAuth';
import { AvatarWithFrame } from './AvatarFrame';
import { UserAuthModal } from './UserAuthModal';
import { UserProfileModal } from './UserProfileModal';

interface HomeUserAvatarButtonProps {
  currentUser: AppUser | null;
  onUserChange: (user: AppUser | null) => void;
  onOpenGarden?: () => void;
  requireLoginNotice?: string;
  isLoginModalOpen?: boolean;
  onCloseLoginModal?: () => void;
}

export function HomeUserAvatarButton({
  currentUser,
  onUserChange,
  onOpenGarden,
  requireLoginNotice,
  isLoginModalOpen = false,
  onCloseLoginModal,
}: HomeUserAvatarButtonProps) {
  const [internalAuthOpen, setInternalAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const showAuthModal = isLoginModalOpen || internalAuthOpen;

  const handleClick = () => {
    playFortuneClickSound();
    if (currentUser) {
      setIsProfileOpen(true);
    } else {
      setInternalAuthOpen(true);
    }
  };

  const handleCloseAuth = () => {
    setInternalAuthOpen(false);
    onCloseLoginModal?.();
  };

  return (
    <>
      <div className="absolute right-3 top-4 sm:right-6 sm:top-6 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="relative group flex items-center justify-center p-0.5 rounded-full transition-transform active:scale-95 cursor-pointer focus:outline-none"
          title={currentUser ? `Tài khoản: ${currentUser.nickname}` : 'Đăng nhập / Đăng ký tài khoản'}
          aria-label={currentUser ? `Tài khoản ${currentUser.nickname}` : 'Đăng nhập'}
        >
          {currentUser ? (
            <div className="relative">
              <AvatarWithFrame
                avatarUrl={currentUser.avatarUrl}
                frameId={currentUser.frameId}
                size="md"
                showDecor={true}
              />
            </div>
          ) : (
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-900/90 to-zinc-800/80 border border-pink-400/50 hover:border-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:shadow-[0_0_20px_rgba(244,114,182,0.55)] flex items-center justify-center text-pink-300 group-hover:text-pink-100 transition-all overflow-hidden backdrop-blur-md">
              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform" />
            </div>
          )}
        </button>
      </div>

      {/* Auth Modal (Login / Register) */}
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuth}
        onSuccess={(user) => {
          onUserChange(user);
        }}
        noticeMessage={requireLoginNotice}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUserUpdate={(updated) => {
            onUserChange(updated);
          }}
          onLogout={() => {
            onUserChange(null);
          }}
          onOpenGarden={onOpenGarden}
        />
      )}
    </>
  );
}
