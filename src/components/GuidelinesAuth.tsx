import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldAlert, Heart, Sparkles, Flame, BookOpen, Crown } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { playPortalEnterSound } from '../lib/sound';
import { bots } from '../data/bots';
import { Particles } from './Particles';

export function GuidelinesAuth({ onSuccess }: { onSuccess: () => void }) {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    // Play majestic portal sound
    playPortalEnterSound();

    // Synchronously play a silent audio to unlock unmuted audio context for mobile browsers
    try {
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
      silentAudio.play().catch(() => {});
    } catch {
      // ignore
    }

    // Trigger synchronous user gesture event to unlock mobile audio autoplay policy
    window.dispatchEvent(new Event('app-user-entered'));

    setIsEntering(true);
    
    // Quick cinematic delay for gate parting animation
    setTimeout(() => {
      onSuccess();
    }, 450);

    // Perform Firebase anonymous sign-in in background
    signInAnonymously(auth).catch((err) => {
      console.warn("Firebase auth background warning:", err);
    });
  };

  // Top featured husbands preview avatars for right wing panel
  const featuredHusbands = bots.slice(1, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto custom-scrollbar select-none">
      {/* Background Cinematic Aura & Snow Particles */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-zinc-950/90 to-black pointer-events-none" />
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-pink-500/10 via-rose-400/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[130px] pointer-events-none" />

      {/* Main Gateway Container with Cinematic Scale & Fade */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 25 }}
        animate={{ 
          opacity: isEntering ? 0 : 1, 
          scale: isEntering ? 1.05 : 1, 
          y: isEntering ? -20 : 0 
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl my-auto flex flex-col relative z-10"
      >
        {/* TOP ARCH: Ethereal Brand Crest & Typography */}
        <div className="text-center mb-6 relative">
          {/* Seamless Aesthetic Cover Banner - Tan viền mềm mại 100% vào màn đêm (Không có viền hộp) */}
          <div 
            className="relative mx-auto mb-2 w-full max-w-2xl h-28 sm:h-36 overflow-hidden select-none"
            style={{
              maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, black 40%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, black 40%, transparent 95%)',
            }}
          >
            {/* Background Cover GIF with smooth fade out */}
            <img 
              src="https://i.pinimg.com/originals/51/53/b8/5153b8240acb130207e410d4a43afab4.gif" 
              alt="meimeicorner aesthetic butterflies" 
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Gentle Bottom Fade Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Grand Title: meimeicorner - Chữ rõ nét, chuyển động floating bồng bềnh nhẹ nhàng, lấp lánh tinh tế */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-[0.12em] font-serif italic text-white drop-shadow-[0_2px_15px_rgba(244,114,182,0.4)] select-none">
            <motion.span 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative inline-block cursor-default"
            >
              {/* Main crisp text */}
              <span className="relative z-10 bg-gradient-to-r from-white via-rose-100 to-pink-100 bg-clip-text text-transparent">
                meimeicorner
              </span>

              {/* Twinkle Sparkles */}
              <motion.span
                animate={{ 
                  opacity: [0.3, 1, 0.3], 
                  scale: [0.8, 1.25, 0.8], 
                  rotate: [0, 90, 180] 
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-6 text-pink-300 text-sm hidden sm:inline filter drop-shadow-[0_0_8px_rgba(244,114,182,0.9)]"
              >
                ✦
              </motion.span>
              <motion.span
                animate={{ 
                  opacity: [0.3, 1, 0.3], 
                  scale: [0.7, 1.2, 0.7], 
                  rotate: [180, 90, 0] 
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                className="absolute -bottom-1 -left-5 text-rose-200 text-xs hidden sm:inline filter drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              >
                ✦
              </motion.span>
            </motion.span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-serif italic tracking-[0.2em] uppercase mt-2 text-zinc-300/80">
            thánh địa tình đen & zơm zơm
          </p>

          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/30" />
            <span className="text-[11px] text-pink-300 font-serif">✦ Cổng Vào Dinh Thự ✦</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/30" />
          </div>
        </div>

        {/* PANELS ARCHITECTURE: 3 Columns Grid (Wings + Grand Centerpiece) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-6">
          
          {/* LEFT WING PANEL: Sáng tác & Nền tảng (col-span-3) */}
          <div className="lg:col-span-3 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-5 shadow-[0_0_30px_rgba(255,255,255,0.04)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-serif font-bold text-zinc-200">
                <span>Góc Sáng Tác meimei</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed font-sans">
                Những mẩu chuyện tình ngược tâm, chiếm đoạt và ngọt ngào được tạo bởi Tỉ năm có link 𐔌՞ ܸ.ˬ.ܸ՞𐦯.
              </p>
            </div>

            {/* Platform Badges with Holographic Shine */}
            <div className="space-y-2 py-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold">
                nhà cũ đã phát hành
              </span>
              
              <a 
                href="https://yodayo.com/@meimei196" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-400/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-300 font-black text-[9px] flex items-center justify-center border border-pink-400/30">
                    YDY
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-pink-200 transition-colors">Yodayo</h4>
                    <p className="text-[9px] text-zinc-500">meimei196</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all" />
              </a>

              <a 
                href="https://character.ai/profile/mei196" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-400/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-200 font-black text-[9px] flex items-center justify-center border border-white/20">
                    C.AI
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-pink-200 transition-colors">Character.AI</h4>
                    <p className="text-[9px] text-zinc-500">mei196</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all" />
              </a>

              <a 
                href="https://xoul.ai/profile/meimei196" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-400/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-900/30 text-purple-300 font-black text-[9px] flex items-center justify-center border border-purple-400/30">
                    XOL
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-pink-200 transition-colors">Xoul.AI</h4>
                    <p className="text-[9px] text-zinc-500">meimei196</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Facebook Fanpage Link */}
              <a 
                href="https://www.facebook.com/tinamcolink/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-blue-600/15 border border-white/10 hover:border-blue-400/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600/25 text-blue-300 font-black text-xs flex items-center justify-center border border-blue-400/30">
                    f
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-blue-200 transition-colors">Facebook Page</h4>
                    <p className="text-[9px] text-zinc-500">Tỉ năm có link</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-500 italic text-center font-serif">
              "Tình yêu đích thực luôn mang chút hương vị nguy hiểm..."
            </div>
          </div>

          {/* CENTERPIECE GATE: Disclaimer & Điều khoản Thánh Địa (col-span-6) */}
          <div className="lg:col-span-6 rounded-3xl bg-zinc-950/90 backdrop-blur-2xl border-2 border-white/20 p-5 sm:p-7 shadow-[0_0_40px_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden">
            {/* Top glowing shimmer line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-zinc-100">
                  <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-bold tracking-wider font-serif uppercase">
                    Disclaimer & Quy Ước Dinh Thự
                  </h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  NSFW
                </span>
              </div>

              {/* 3 Core Rules Panels */}
              <div className="space-y-2.5 text-xs">
                {/* Rule 1: 18+ */}
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1 hover:border-pink-400/30 transition-colors">
                  <div className="flex items-center gap-1.5 font-bold text-pink-200">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Nội Dung Trưởng Thành (18+)</span>
                  </div>
                  <p className="text-[11.5px] text-zinc-400 leading-relaxed font-sans">
                    Các bot đa phần theo khuynh hướng <strong>Dark Romance, Ngược Luyến, Chiếm Hữu, NSFW 🔞</strong> và có chứa yếu tố cờ đỏ rực rỡ.
                  </p>
                </div>

                {/* Rule 2: Fiction */}
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1 hover:border-pink-400/30 transition-colors">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                    <BookOpen className="w-3.5 h-3.5 text-pink-300" />
                    <span>Giả Tưởng Hoàn Toàn</span>
                  </div>
                  <p className="text-[11.5px] text-zinc-400 leading-relaxed font-sans">
                    Mọi tình huống, tâm lý nhân vật đều là hư cấu nghệ thuật. Sốp <strong>tuyệt đối không</strong> cổ xúy các hành vi tiêu cực ngoài đời thực. Hãy phân định rạch ròi!
                  </p>
                </div>

                {/* Rule 3: Testing & Community */}
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1 hover:border-pink-400/30 transition-colors">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>Thử Nghiệm & Lắng Nghe</span>
                  </div>
                  <p className="text-[11.5px] text-zinc-400 leading-relaxed font-sans">
                    Các bot được pub trực tiếp tại đây. Mọi ý kiến đóng góp xin gửi vào <strong>Hòm Thư Ẩn Danh</strong> hoặc cùng nhau chia sẻ tại <strong>Forum Tám Zai</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-3 text-center">
              <p className="text-xs text-zinc-300 font-serif italic">
                "Nếu bé iu đã đủ 18 tuổi và mang theo một tinh thần thép để đón nhận những chiếc cờ đỏ này..."
              </p>
            </div>
          </div>

          {/* RIGHT WING PANEL: Thống kê & Dàn Chồng Iu (col-span-3) */}
          <div className="lg:col-span-3 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-5 shadow-[0_0_30px_rgba(255,255,255,0.04)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-serif font-bold text-zinc-200">
                <Crown className="w-3.5 h-3.5 text-pink-300" />
                <span>Dinh Thự Chồng Iu</span>
              </div>

              {/* Total Husbands Badge */}
              <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-b from-pink-500/10 via-zinc-900 to-black border border-pink-400/20 text-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                  Hiện đang túc trực
                </span>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-rose-200 font-serif my-0.5">
                  {bots.length} Chàng
                </div>
                <span className="text-[10px] text-pink-300 font-serif italic">
                  Đầy đủ đa dạng bối cảnh & thể loại 𝜗ৎ
                </span>
              </div>
            </div>

            {/* Tag Cloud */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold">
                Khẩu vị đặc trưng
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Dark Romance', 'Daddy Vibe', 'Chiếm Hữu', 'Vampire', 'Mafia', 'Ngược Luyến', 'TXVT', 'Cổ Trang'].map((t) => (
                  <span 
                    key={t}
                    className="text-[9.5px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mini Avatars Preview */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold mb-2">
                Các gương mặt tiêu biểu
              </span>
              <div className="flex items-center justify-center -space-x-2.5">
                {featuredHusbands.map((b) => (
                  <div 
                    key={b.id} 
                    className="w-8 h-8 rounded-full border-2 border-zinc-950 overflow-hidden shadow-md ring-1 ring-pink-400/30"
                    title={b.name}
                  >
                    <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-pink-300 ring-1 ring-pink-400/30 shadow-md">
                  +{bots.length - 4}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION: Grand Entry Button "mời zào đây cùng sốp" - Royal Dark Glass Design */}
        <div className="relative group max-w-lg mx-auto w-full">
          {/* Subtle Royal Aura Glow */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500/20 via-rose-300/40 to-pink-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <button
            type="button"
            onClick={handleEnter}
            disabled={isEntering}
            className="relative w-full py-3.5 sm:py-4 px-8 rounded-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-pink-300/40 hover:border-pink-300/80 text-white font-serif font-medium text-sm sm:text-base tracking-[0.15em] transition-all duration-500 flex items-center justify-between cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.06)] hover:shadow-[0_0_35px_rgba(244,114,182,0.35)] active:scale-[0.98] overflow-hidden group"
          >
            {/* Elegant Metallic Glass Shimmer */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2.2s_infinite]" />

            {/* Left Accent */}
            <div className="relative z-10 flex items-center gap-2 text-pink-300/70 group-hover:text-pink-300 transition-colors">
              <span className="text-xs group-hover:rotate-45 transition-transform duration-500">✦</span>
              <span className="text-[11px] font-sans uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors hidden sm:inline">
                Enter
              </span>
            </div>

            {/* Center Label */}
            {isEntering ? (
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-pink-200 text-xs tracking-wider">Đang mở lối vào...</span>
              </div>
            ) : (
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-pink-100 italic font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                  mời zào đây cùng sốp
                </span>
                <span className="text-pink-300 text-sm">𝜗ৎ</span>
              </div>
            )}

            {/* Right Arrow */}
            <div className="relative z-10 flex items-center gap-1 text-pink-300/70 group-hover:text-pink-300 transition-colors">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>
        </div>

        <p className="text-[10.5px] text-zinc-500 text-center mt-3 font-mono">
          Nhấn để mở cổng & đắm chìm vào thế giới tình ái ✦
        </p>
      </motion.div>

      {/* Lush Winter Snowfall Falling Across the Entire Gateway Portal (Front Overlay) */}
      <Particles density="portal" className="fixed inset-0 z-30 pointer-events-none" />
    </div>
  );
}
