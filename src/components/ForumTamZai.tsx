import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Image as ImageIcon, 
  X, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  CornerDownRight, 
  Loader2, 
  Trash2, 
  Sparkles,
  Filter,
  PlusCircle,
  ArrowUpRight,
  Link2,
  Camera,
  KeyRound,
  Crown,
  Pin,
  ShieldAlert,
  Edit3,
  Eye,
  EyeOff,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  setDoc,
  getDocs 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { playFortuneClickSound, playCardClickSound } from '../lib/sound';
import { AvatarWithFrame, ADMIN_FRAMES } from './AvatarFrame';
import { getCurrentUser, subscribeAuth, DEFAULT_ADMIN_AVATAR, DEFAULT_AVATARS, AppUser, getEffectiveUserId } from '../lib/userAuth';
import { UserProfileModal } from './UserProfileModal';
import { UserAuthModal } from './UserAuthModal';
import pinnedPostBackup from '../data/pinnedPostBackup.json';

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1530072747177414779/dMR0IXkoakW3bgaZ1vVSK1nCJS8xTw4PrcYoBF1YKqsQYJnSLwF1aK1HeJKX8K8kP0ei";

export interface ForumPost {
  id: string;
  title?: string;
  content: string;
  nickname: string;
  category: string;
  images?: string[];
  linkUrl?: string;
  linkTitle?: string;
  reactions: {
    heart: number;
    haha: number;
    sad: number;
    boom: number;
    wow: number;
  };
  userReactions?: Record<string, string>; // userId -> 'heart' | 'haha' | 'sad' | 'boom' | 'wow'
  createdAt: number;
  isAdmin?: boolean;
  userAvatar?: string | null;
  frameId?: string | null;
  isPinned?: boolean;
  isNsfw?: boolean;
  isSpoiler?: boolean;
  authorUsername?: string | null;
}

export interface ForumComment {
  id: string;
  postId: string;
  parentId?: string | null;
  replyToNickname?: string | null;
  nickname: string;
  content: string;
  images?: string[];
  likes: number;
  likedBy?: string[];
  createdAt: number;
  isAdmin?: boolean;
  userAvatar?: string | null;
  frameId?: string | null;
  authorUsername?: string | null;
}

const CATEGORIES = [
  'Tất cả',
  'Tâm sự',
  'Feedback',
  'Hỗ trợ',
  'Phòng tranh'
];

const REACTION_CONFIG = [
  { type: 'heart', emoji: '❤️', label: 'Thả tim' },
  { type: 'haha', emoji: '😆', label: 'Haha' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'boom', emoji: '🤯', label: 'Bùng lổ' },
  { type: 'wow', emoji: '😮', label: 'Ngạc nhiên' },
];

async function compressImage(file: File, maxDimension = 800, quality = 0.7): Promise<string> {
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  if (isGif) {
    if (file.size > 1.2 * 1024 * 1024) {
      throw new Error('GIF_TOO_LARGE');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

interface SpoilerNoiseContentProps {
  content: string;
  isRevealed: boolean;
  onToggleReveal: () => void;
}

interface TextParticle {
  origX: number;
  origY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  decay: number;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const resultLines: string[] = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (!para.trim()) {
      resultLines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine !== '') {
        resultLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }
  return resultLines;
}

function SpoilerNoiseContent({ content, isRevealed, onToggleReveal }: SpoilerNoiseContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TextParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isDispersingRef = useRef(false);
  const wasRevealedRef = useRef(isRevealed);

  // Initialize and spawn micro-particles along text glyphs
  const initParticles = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rect.width;
    const height = Math.max(rect.height, 40);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 640;
    const fontSize = isMobile ? 12 : 14;
    const lineHeight = fontSize * 1.625;
    const paddingX = 16;
    const paddingTop = 16;
    const maxTextWidth = Math.max(20, width - paddingX * 2);

    // Offscreen canvas for sampling text pixels
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.font = `600 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    offCtx.fillStyle = '#ffffff';

    const lines = wrapTextLines(offCtx, content, maxTextWidth);

    let curY = paddingTop + fontSize;
    for (const line of lines) {
      if (line) {
        offCtx.fillText(line, paddingX, curY);
      }
      curY += lineHeight;
    }

    // Sample pixels where text glyphs are drawn
    const imgData = offCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const step = isMobile ? 2 : 2; // high density micro dots
    const newParticles: TextParticle[] = [];

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const alpha = pixels[idx + 3];
        if (alpha > 75) {
          // 80% sampling probability for fine stardust grain
          if (Math.random() < 0.8) {
            const jitterX = (Math.random() - 0.5) * 1.2;
            const jitterY = (Math.random() - 0.5) * 1.2;
            newParticles.push({
              origX: x + jitterX,
              origY: y + jitterY,
              x: x + jitterX,
              y: y + jitterY,
              vx: 0,
              vy: 0,
              size: 1 + Math.random() * 0.7, // 1px - 1.7px tiny dust speckles
              baseAlpha: 0.4 + Math.random() * 0.6,
              alpha: 0.4 + Math.random() * 0.6,
              twinkleSpeed: 0.05 + Math.random() * 0.1,
              twinkleOffset: Math.random() * Math.PI * 2,
              decay: 0.025 + Math.random() * 0.03,
            });
          }
        }
      }
    }

    particlesRef.current = newParticles;
  }, [content]);

  // Main Animation Loop
  useEffect(() => {
    initParticles();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      if (isDispersingRef.current) {
        // Dispersing ("tan ra") physics animation
        let anyAlive = false;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.alpha <= 0) continue;
          anyAlive = true;

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.alpha -= p.decay;

          if (p.alpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.alpha)})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
        }

        if (!anyAlive) {
          isDispersingRef.current = false;
          ctx.clearRect(0, 0, width, height);
          ctx.restore();
          return; // Stop animation loop when fully dissolved
        }
      } else if (!isRevealed) {
        // Idle Shimmering / Sparkling text stardust (Threads / Telegram style)
        const time = performance.now() * 0.001;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpeed * 15 + p.twinkleOffset);
          const currentAlpha = p.baseAlpha * (0.35 + 0.65 * twinkle);

          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.fillRect(p.origX, p.origY, p.size, p.size);
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles, isRevealed]);

  // Handle reveal state transition ("tan ra" when toggling to revealed)
  useEffect(() => {
    if (!wasRevealedRef.current && isRevealed) {
      // User clicked to reveal: initiate particle explosion / dissolution outwards
      isDispersingRef.current = true;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 3.5;
        p.x = p.origX;
        p.y = p.origY;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 0.7; // slight upward float
        p.alpha = p.baseAlpha;
      }

      // Re-trigger animation frame if needed
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const width = canvas.width / dpr;
          const height = canvas.height / dpr;

          const disperseLoop = () => {
            if (!isDispersingRef.current) return;
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, width, height);

            let alive = false;
            for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              if (p.alpha <= 0) continue;
              alive = true;

              p.x += p.vx;
              p.y += p.vy;
              p.vx *= 0.93;
              p.vy *= 0.93;
              p.alpha -= p.decay;

              if (p.alpha > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.alpha)})`;
                ctx.fillRect(p.x, p.y, p.size, p.size);
              }
            }

            ctx.restore();
            if (alive) {
              animFrameRef.current = requestAnimationFrame(disperseLoop);
            } else {
              isDispersingRef.current = false;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          };
          animFrameRef.current = requestAnimationFrame(disperseLoop);
        }
      }
    } else if (wasRevealedRef.current && !isRevealed) {
      // User clicked "Làm mờ": reset particles back to text positions
      isDispersingRef.current = false;
      initParticles();
    }
    wasRevealedRef.current = isRevealed;
  }, [isRevealed, initParticles]);

  // ResizeObserver to adapt to container layout changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimer: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isRevealed) {
          initParticles();
        }
      }, 150);
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [initParticles, isRevealed]);

  return (
    <div
      ref={containerRef}
      onClick={!isRevealed ? onToggleReveal : undefined}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isRevealed
          ? 'cursor-default select-text'
          : 'cursor-pointer select-none active:scale-[0.99] group/spoiler'
      }`}
      title={isRevealed ? undefined : 'Click để làm tan hiệu ứng noise & xem nội dung spoil'}
    >
      {/* The Actual Text (Cleanly visible when revealed, invisible when spoiler is active) */}
      <div className="p-3 sm:p-4">
        <p
          className={`text-xs sm:text-sm whitespace-pre-wrap leading-relaxed transition-opacity duration-500 ease-out ${
            isRevealed
              ? 'opacity-100 text-zinc-200 select-text'
              : 'opacity-0 text-transparent select-none pointer-events-none'
          }`}
        >
          {content}
        </p>
      </div>

      {/* Sparkling Text Dust & Dispersion Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}

export function ForumTamZai({ onBack }: { onBack: () => void }) {
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const list: ForumPost[] = [];
    const seen = new Set<string>();

    // 1. Read cached posts first so user's recent reactions/edits are not reset by static backup
    try {
      const saved = localStorage.getItem('mei_forum_posts_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const p of parsed) {
            if (p && p.id && !seen.has(p.id)) {
              list.push(p);
              seen.add(p.id);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading cached forum posts:', e);
    }

    // 2. Add pinned post backup or self-heal existing pinned post
    if (Array.isArray(pinnedPostBackup) && pinnedPostBackup.length > 0) {
      for (const p of pinnedPostBackup as ForumPost[]) {
        if (p && p.id) {
          if (!seen.has(p.id)) {
            list.push(p);
            seen.add(p.id);
          } else {
            // Self-heal: ensure pinned post always retains its pinned flag, title, content, and author avatar
            const idx = list.findIndex(item => item.id === p.id);
            if (idx !== -1) {
              list[idx] = {
                ...p,
                ...list[idx],
                isPinned: true,
                isAdmin: true,
                nickname: p.nickname || 'giáo chủ hội zơm👑',
                userAvatar: p.userAvatar || DEFAULT_ADMIN_AVATAR,
                frameId: p.frameId || 'frame-crown-rose',
                reactions: {
                  heart: Math.max(list[idx].reactions?.heart || 0, p.reactions?.heart || 0),
                  haha: Math.max(list[idx].reactions?.haha || 0, p.reactions?.haha || 0),
                  sad: Math.max(list[idx].reactions?.sad || 0, p.reactions?.sad || 0),
                  boom: Math.max(list[idx].reactions?.boom || 0, p.reactions?.boom || 0),
                  wow: Math.max(list[idx].reactions?.wow || 0, p.reactions?.wow || 0),
                },
                userReactions: { ...(p.userReactions || {}), ...(list[idx].userReactions || {}) }
              };
            }
          }
        }
      }
    }

    return list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);
  });
  const [comments, setComments] = useState<ForumComment[]>(() => {
    try {
      const saved = localStorage.getItem('mei_forum_comments_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading cached forum comments:', e);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const saved = localStorage.getItem('mei_forum_posts_cache');
      return !saved && (!Array.isArray(pinnedPostBackup) || pinnedPostBackup.length === 0);
    } catch {
      return true;
    }
  });
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Admin & user state synced with Auth
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync all user profiles in real time so avatar & frame changes reflect immediately everywhere
  const [userProfiles, setUserProfiles] = useState<Record<string, { username?: string; avatarUrl?: string; frameId?: string }>>(() => {
    try {
      const saved = localStorage.getItem('mei_user_profiles_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    getDocs(collection(db, 'user_profiles'))
      .then((snap) => {
        const map: Record<string, { username?: string; avatarUrl?: string; frameId?: string }> = {};
        snap.forEach((d) => {
          map[d.id] = d.data();
        });
        setUserProfiles(map);
        try {
          localStorage.setItem('mei_user_profiles_cache', JSON.stringify(map));
        } catch {}
      })
      .catch((err) => {
        console.warn('user_profiles getDocs notice:', err);
      });
  }, []);

  const [isAdmin, setIsAdmin] = useState(() => {
    const user = getCurrentUser();
    return Boolean(user?.isAdmin);
  });

  const [adminAvatar, setAdminAvatar] = useState(() => {
    const user = getCurrentUser();
    if (user?.isAdmin && user.avatarUrl && user.avatarUrl !== DEFAULT_AVATARS[0]) return user.avatarUrl;
    try {
      const saved = localStorage.getItem('mei_admin_avatar');
      if (saved && saved !== DEFAULT_AVATARS[0]) return saved;
      return DEFAULT_ADMIN_AVATAR;
    } catch {
      return DEFAULT_ADMIN_AVATAR;
    }
  });

  const [adminFrame, setAdminFrame] = useState(() => {
    const user = getCurrentUser();
    if (user?.isAdmin && user.frameId) return user.frameId;
    try {
      return localStorage.getItem('mei_admin_frame') || 'frame-crown-rose';
    } catch {
      return 'frame-crown-rose';
    }
  });

  // Admin dropdown menu toggle per post
  const [activePostAdminMenuId, setActivePostAdminMenuId] = useState<string | null>(null);

  // Post form state
  const [isPosting, setIsPosting] = useState(false);
  const [isPostAnonymous, setIsPostAnonymous] = useState(false);
  const [postAnonymousNickname, setPostAnonymousNickname] = useState('');
  const [nickname, setNickname] = useState(() => {
    const user = getCurrentUser();
    return user ? user.nickname : '';
  });

  // Anonymous state for comments & replies per post/key
  const [commentIsAnonymous, setCommentIsAnonymous] = useState<Record<string, boolean>>({});
  const [commentAnonNicknames, setCommentAnonNicknames] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(Boolean(user.isAdmin));
        setNickname(user.nickname);
        if (user.isAdmin) {
          const av = (user.avatarUrl && user.avatarUrl !== DEFAULT_AVATARS[0]) ? user.avatarUrl : DEFAULT_ADMIN_AVATAR;
          setAdminAvatar(av);
          setAdminFrame(user.frameId || 'frame-crown-rose');
        }
      } else {
        setIsAdmin(false);
        setNickname('');
        setAdminAvatar(DEFAULT_ADMIN_AVATAR);
        setAdminFrame('frame-crown-rose');
      }
    });
    return unsub;
  }, []);

  const getForumAvatarAndFrame = (item: {
    isAdmin?: boolean;
    nickname: string;
    userAvatar?: string | null;
    frameId?: string | null;
    authorUsername?: string | null;
  }) => {
    const isItemAdmin = item.isAdmin || item.nickname.includes('giáo chủ');
    if (isItemAdmin) {
      return {
        avatarUrl: item.userAvatar || adminAvatar || DEFAULT_ADMIN_AVATAR,
        frameId: item.frameId || adminFrame || 'frame-crown-rose',
      };
    }
    // If authored by the currently logged-in account, synchronize with their latest changed avatar and frame:
    if (
      currentUser &&
      ((item.authorUsername && item.authorUsername === currentUser.username) ||
        (!item.authorUsername && item.nickname === currentUser.nickname))
    ) {
      return {
        avatarUrl: currentUser.avatarUrl || item.userAvatar || null,
        frameId: currentUser.frameId || item.frameId || 'frame-sakura-rose-overlay',
      };
    }
    // If authored by a registered account, synchronize with their live Firestore profile:
    if (item.authorUsername && userProfiles[item.authorUsername]) {
      return {
        avatarUrl: userProfiles[item.authorUsername].avatarUrl || item.userAvatar || null,
        frameId: userProfiles[item.authorUsername].frameId || item.frameId || 'frame-sakura-rose-overlay',
      };
    }
    return {
      avatarUrl: item.userAvatar || null,
      frameId: item.frameId || (item.userAvatar ? 'frame-sakura-rose-overlay' : null),
    };
  };
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Tâm sự');
  const [isPostPinned, setIsPostPinned] = useState(false);
  const [isPostNsfw, setIsPostNsfw] = useState(false);
  const [isPostSpoiler, setIsPostSpoiler] = useState(false);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postLinkUrl, setPostLinkUrl] = useState('');
  const [postLinkTitle, setPostLinkTitle] = useState('');
  const [showImgUrlInput, setShowImgUrlInput] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Reveal toggles for current user session
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [revealedNsfw, setRevealedNsfw] = useState<Record<string, boolean>>({});

  // Admin Edit Post state
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('Tâm sự');
  const [editIsNsfw, setEditIsNsfw] = useState(false);
  const [editIsSpoiler, setEditIsSpoiler] = useState(false);
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Active comments per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentNicknames, setCommentNicknames] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string[]>>({});
  const [expandedInputs, setExpandedInputs] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; nickname: string } | null>(null);

  // Lightbox Modal state
  const [lightbox, setLightbox] = useState<{ images: string[]; currentIndex: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = getEffectiveUserId(currentUser);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowLeft') {
        setLightbox(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
        } : null);
      } else if (e.key === 'ArrowRight') {
        setLightbox(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.images.length
        } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  // Real-time Firestore sync for Forum Posts, Comments, and Global Admin Profile
  useEffect(() => {
    // Sync live Admin Profile from Firestore so all posts & comments stay 100% updated in real-time
    const unsubAdmin = onSnapshot(
      doc(db, 'user_profiles', 'admin_meimei'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.avatarUrl) {
            setAdminAvatar(data.avatarUrl);
            localStorage.setItem('mei_admin_avatar', data.avatarUrl);
          }
          if (data.frameId) {
            setAdminFrame(data.frameId);
            localStorage.setItem('mei_admin_frame', data.frameId);
          }
        }
      },
      (err) => console.warn('Sync admin profile err:', err)
    );

    // 1. Load forum posts and comments from server disk backup immediately (resilient fallback for quota limits)
    const loadServerBackup = () => {
      fetch('/api/get-forum-posts')
        .then((r) => r.json())
        .then((serverPosts) => {
          if (Array.isArray(serverPosts) && serverPosts.length > 0) {
            setPosts((prev) => {
              const map = new Map<string, ForumPost>();
              serverPosts.forEach((p) => { if (p?.id) map.set(p.id, p); });
              prev.forEach((p) => {
                if (!map.has(p.id)) {
                  map.set(p.id, p);
                } else {
                  const sp = map.get(p.id)!;
                  map.set(p.id, {
                    ...sp,
                    reactions: sp.reactions || p.reactions,
                    userReactions: sp.userReactions || p.userReactions,
                  });
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);
              try { localStorage.setItem('mei_forum_posts_cache', JSON.stringify(merged)); } catch {}
              return merged;
            });
            setLoading(false);
          }
        })
        .catch(() => {});

      fetch('/api/get-forum-comments')
        .then((r) => r.json())
        .then((serverComments) => {
          if (Array.isArray(serverComments) && serverComments.length > 0) {
            setComments((prev) => {
              const map = new Map<string, ForumComment>();
              serverComments.forEach((c) => { if (c?.id) map.set(c.id, c); });
              prev.forEach((c) => {
                if (!map.has(c.id)) {
                  map.set(c.id, c);
                } else {
                  const sc = map.get(c.id)!;
                  map.set(c.id, {
                    ...c,
                    likes: typeof sc.likes === 'number' ? sc.likes : c.likes,
                    likedBy: Array.isArray(sc.likedBy) ? sc.likedBy : c.likedBy,
                  });
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
              try { localStorage.setItem('mei_forum_comments_cache', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        })
        .catch(() => {});
    };

    loadServerBackup();
    const serverInterval = setInterval(loadServerBackup, 10000);
    const handleFocus = () => loadServerBackup();
    window.addEventListener('focus', handleFocus);

    setLoading(true);
    const qPosts = query(collection(db, 'forum_posts'));
    const unsubPosts = onSnapshot(
      qPosts,
      (snapshot) => {
        const list: ForumPost[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            content: data.content || '',
            nickname: data.nickname || 'vợ iu bí mật',
            category: data.category || 'Tâm sự',
            images: Array.isArray(data.images) ? data.images : [],
            linkUrl: data.linkUrl || null,
            linkTitle: data.linkTitle || null,
            reactions: data.reactions || { heart: 0, haha: 0, sad: 0, boom: 0, wow: 0 },
            userReactions: data.userReactions || {},
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            isAdmin: !!data.isAdmin,
            userAvatar: data.userAvatar || null,
            frameId: data.frameId || null,
            isPinned: !!data.isPinned,
            isNsfw: !!data.isNsfw,
            isSpoiler: !!data.isSpoiler,
            authorUsername: data.authorUsername || null,
          });
        });
        // Always ensure official pinned post from backup is present
        if (Array.isArray(pinnedPostBackup) && pinnedPostBackup.length > 0) {
          for (const bp of pinnedPostBackup as ForumPost[]) {
            if (bp && bp.id && !list.some(p => p.id === bp.id)) {
              list.push(bp);
            }
          }
        }
        list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);
        setPosts(list);
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(list));
        } catch {}
        setLoading(false);
        setIsQuotaExceeded(false);
      },
      (error) => {
        const errMsg = String((error as any)?.message || error || '');
        const isQuota = (error as any)?.code === 'resource-exhausted' || errMsg.includes('Quota limit exceeded');
        console.warn('Firestore forum_posts onSnapshot handled via server backup:', errMsg);
        if (!isQuota) {
          handleFirestoreError(error, OperationType.LIST, 'forum_posts');
        }
        setLoading(false);
        if (isQuota) {
          setIsQuotaExceeded(true);
        }
      }
    );

    // Sync comments
    const qComments = query(collection(db, 'forum_comments'));
    const unsubComments = onSnapshot(
      qComments,
      (snapshot) => {
        const list: ForumComment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            postId: data.postId,
            parentId: data.parentId || null,
            replyToNickname: data.replyToNickname || null,
            nickname: data.nickname || 'vợ iu bí mật',
            content: data.content || '',
            images: Array.isArray(data.images) ? data.images : [],
            likes: typeof data.likes === 'number' ? data.likes : 0,
            likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            isAdmin: !!data.isAdmin,
            userAvatar: data.userAvatar || null,
            frameId: data.frameId || null,
            authorUsername: data.authorUsername || null,
          });
        });
        list.sort((a, b) => a.createdAt - b.createdAt);
        setComments(list);
        try {
          localStorage.setItem('mei_forum_comments_cache', JSON.stringify(list));
        } catch {}
      },
      (error) => {
        const errMsg = String((error as any)?.message || error || '');
        const isQuota = (error as any)?.code === 'resource-exhausted' || errMsg.includes('Quota limit exceeded');
        console.warn('Firestore forum_comments onSnapshot handled via server backup:', errMsg);
        if (!isQuota) {
          handleFirestoreError(error, OperationType.LIST, 'forum_comments');
        }
        if (isQuota) {
          setIsQuotaExceeded(true);
        }
      }
    );

    return () => {
      clearInterval(serverInterval);
      window.removeEventListener('focus', handleFocus);
      unsubAdmin();
      unsubPosts();
      unsubComments();
    };
  }, []);

  // Image / GIF Upload handler for Post
  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
    if (!files.length) return;

    const remainingSlots = 3 - postImages.length;
    if (remainingSlots <= 0) {
      showToast('Nàng chỉ được kèm tối đa 3 ảnh thôi nè baby! 𝜗ৎ');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const compressedList: string[] = [];

    for (const f of filesToProcess) {
      try {
        const c = await compressImage(f);
        compressedList.push(c);
      } catch (err: any) {
        if (err?.message === 'GIF_TOO_LARGE') {
          showToast('File GIF nên dưới 1.2MB để tải lên mượt mà nha! 𝜗ৎ');
        } else {
          console.warn('Lỗi xử lý ảnh:', err);
        }
      }
    }

    setPostImages(prev => [...prev, ...compressedList]);
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!imgUrlInput.trim()) return;
    if (postImages.length >= 3) {
      showToast('Nàng chỉ được kèm tối đa 3 ảnh thôi nè! 𝜗ৎ');
      return;
    }
    setPostImages(prev => [...prev, imgUrlInput.trim()]);
    setImgUrlInput('');
    setShowImgUrlInput(false);
    playFortuneClickSound();
  };

  // Image / GIF Upload handler for Comments & Replies
  const handleCommentImageUpload = async (inputKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
    if (!files.length) return;

    const currentImgs = commentImages[inputKey] || [];
    const remainingSlots = 3 - currentImgs.length;
    if (remainingSlots <= 0) {
      showToast('Nàng chỉ được kèm tối đa 3 ảnh thôi nè! 𝜗ৎ');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const compressedList: string[] = [];

    for (const f of filesToProcess) {
      try {
        const c = await compressImage(f);
        compressedList.push(c);
      } catch (err: any) {
        if (err?.message === 'GIF_TOO_LARGE') {
          showToast('File GIF nên dưới 1.2MB để tải lên mượt mà nha! 𝜗ৎ');
        } else {
          console.warn('Lỗi xử lý ảnh comment:', err);
        }
      }
    }

    setCommentImages(prev => ({
      ...prev,
      [inputKey]: [...(prev[inputKey] || []), ...compressedList]
    }));
    e.target.value = '';
  };

  // Submit Post
  const handleSubmitPost = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!postContent.trim() && postImages.length === 0 && !postTitle.trim()) {
      showToast('Nàng ơi, bài viết cần có nội dung hoặc ảnh/GIF nhé! 𝜗ৎ');
      return;
    }

    setSubmittingPost(true);
    const useAnon = !currentUser || isPostAnonymous;
    const finalNickname = useAnon
      ? (postAnonymousNickname.trim() || nickname.trim() || 'vợ iu bí mật')
      : (isAdmin ? 'giáo chủ hội zơm👑' : currentUser.nickname);
    const userAvatar = useAnon
      ? null
      : (isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0]));
    const frameId = useAnon
      ? null
      : (isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay'));
    const authorUsername = useAnon ? null : currentUser.username;
    const cleanLinkUrl = postLinkUrl.trim();
    const cleanLinkTitle = postLinkTitle.trim();

    try {
      const newPostData = {
        title: postTitle.trim() || null,
        content: postContent.trim(),
        nickname: finalNickname,
        category: postCategory,
        images: postImages,
        linkUrl: cleanLinkUrl || null,
        linkTitle: cleanLinkTitle || null,
        reactions: { heart: 0, haha: 0, sad: 0, boom: 0, wow: 0 },
        userReactions: {},
        createdAt: Date.now(),
        isAdmin: !useAnon && !!isAdmin,
        isPinned: isAdmin ? isPostPinned : false,
        isNsfw: !!isPostNsfw,
        isSpoiler: !!isPostSpoiler,
        userAvatar: userAvatar || null,
        frameId: frameId || null,
        authorUsername: authorUsername || null,
      };

      let postId = 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      try {
        const docRef = await addDoc(collection(db, 'forum_posts'), newPostData);
        postId = docRef.id;
      } catch (cloudErr) {
        console.warn('Firestore addDoc forum_posts error (quota/network):', cloudErr);
      }

      // Immediately cache locally so user never loses their post if offline or quota limit hits
      const createdPost: ForumPost = {
        id: postId,
        ...newPostData,
        title: newPostData.title || '',
      };
      setPosts((prev) => {
        const updated = [createdPost, ...prev.filter(p => p.id !== postId)]
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Backup post to server disk
      fetch('/api/backup-forum-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdPost),
      }).catch(() => {});

      // Send Discord notification to user's bot webhook
      try {
        const discordContent = `**🎀 BÀI VIẾT MỚI TẠI FORUM TÁM ZAI 𝜗ৎ**\n\n**Chủ đề:** [${postCategory}] ${postTitle.trim() ? `**${postTitle.trim()}**` : ''}\n**Người đăng:** ${finalNickname}\n**Nội dung:**\n> ${postContent.trim() || '*(Chỉ có ảnh)*'}\n${cleanLinkUrl ? `**🔗 Link đính kèm:** [${cleanLinkTitle || cleanLinkUrl}](${cleanLinkUrl.startsWith('http') ? cleanLinkUrl : `https://${cleanLinkUrl}`})\n` : ''}${postImages.length > 0 ? `*(Kèm ${postImages.length} ảnh${isPostNsfw ? ' - 🔞 NSFW' : ''})*\n` : ''}${isPostSpoiler ? `*(⚠️ Chứa spoil)*\n` : ''}---`;
        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: discordContent }),
        }).catch(err => console.warn('Discord webhook error:', err));
      } catch (err) {
        console.warn('Webhook dispatch failed:', err);
      }

      setPostTitle('');
      setPostContent('');
      setIsPostPinned(false);
      setIsPostNsfw(false);
      setIsPostSpoiler(false);
      setPostImages([]);
      setPostLinkUrl('');
      setPostLinkTitle('');
      setShowImgUrlInput(false);
      setIsPosting(false);
      playFortuneClickSound();
    } catch (err) {
      console.error('Submit post error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'forum_posts');
      showToast('Có lỗi khi đăng bài, vui lòng kiểm tra kết nối mạng và thử lại!');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Open Edit Post Modal (Admin Only)
  const handleOpenEditPost = (post: ForumPost) => {
    playFortuneClickSound();
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditCategory(post.category || 'Tâm sự');
    setEditIsNsfw(!!post.isNsfw);
    setEditIsSpoiler(!!post.isSpoiler);
    setEditIsPinned(!!post.isPinned);
  };

  // Save Edit Post (Admin Only)
  const handleSaveEditPost = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!editingPost || !isAdmin) return;
    setIsSavingEdit(true);
    try {
      playFortuneClickSound();
      const updatedFields = {
        title: editTitle.trim() || null,
        content: editContent.trim(),
        category: editCategory,
        isNsfw: !!editIsNsfw,
        isSpoiler: !!editIsSpoiler,
        isPinned: !!editIsPinned,
      };

      setPosts((prev) => {
        const updated = prev
          .map((p) => (p.id === editingPost.id ? { ...p, ...updatedFields } : p))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      await updateDoc(doc(db, 'forum_posts', editingPost.id), updatedFields);
      showToast('Đã cập nhật bài viết thành công! ✨');
      setEditingPost(null);
    } catch (err) {
      console.error('Save edit post error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `forum_posts/${editingPost.id}`);
      showToast('Có lỗi khi cập nhật bài viết, vui lòng thử lại!');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Quick Toggle NSFW for Admin directly from post
  const handleQuickToggleNsfw = async (post: ForumPost) => {
    if (!isAdmin) return;
    try {
      playFortuneClickSound();
      const newNsfw = !post.isNsfw;
      setPosts((prev) => {
        const updated = prev.map((p) => (p.id === post.id ? { ...p, isNsfw: newNsfw } : p));
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      await updateDoc(doc(db, 'forum_posts', post.id), { isNsfw: newNsfw });
      showToast(newNsfw ? 'Đã bật làm mờ ảnh NSFW cho bài viết! 🔞' : 'Đã gỡ chế độ NSFW cho ảnh!');
    } catch (err) {
      console.error('Toggle NSFW error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `forum_posts/${post.id}`);
    }
  };

  // Toggle Pin Post (Admin Only)
  const handleTogglePinPost = async (post: ForumPost) => {
    if (!isAdmin) return;
    const newPinned = !post.isPinned;
    try {
      playFortuneClickSound();
      setPosts(prev => {
        const updated = prev.map(p => p.id === post.id ? { ...p, isPinned: newPinned } : p)
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt);
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      await updateDoc(doc(db, 'forum_posts', post.id), {
        isPinned: newPinned,
        createdAt: post.createdAt,
      });
      showToast(newPinned ? 'Đã ghim bài viết lên đầu forum! 📌' : 'Đã gỡ ghim bài viết!');
    } catch (err) {
      console.error('Toggle pin error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `forum_posts/${post.id}`);
      showToast('Có lỗi khi ghim/gỡ ghim bài viết!');
    }
  };

  // Delete Post (Admin Only)
  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) return;
    try {
      playFortuneClickSound();
      setPosts(prev => {
        const updated = prev.filter(p => p.id !== postId);
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      const relatedComments = comments.filter(c => c.postId === postId);
      setComments(prev => {
        const updated = prev.filter(c => c.postId !== postId);
        try {
          localStorage.setItem('mei_forum_comments_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      await Promise.all([
        deleteDoc(doc(db, 'forum_posts', postId)),
        ...relatedComments.map(c =>
          deleteDoc(doc(db, 'forum_comments', c.id)).catch(err =>
            console.warn('Delete post comment error:', err)
          )
        )
      ]);
    } catch (err) {
      console.error('Delete post error:', err);
      handleFirestoreError(err, OperationType.DELETE, `forum_posts/${postId}`);
    }
  };

  // Delete Comment (Admin Only)
  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    try {
      playFortuneClickSound();
      const childIds = comments
        .filter(c => c.parentId === commentId)
        .map(c => c.id);
      const allIdsToDelete = [commentId, ...childIds];

      setComments(prev => prev.filter(c => !allIdsToDelete.includes(c.id)));

      await Promise.all(
        allIdsToDelete.map(id =>
          deleteDoc(doc(db, 'forum_comments', id)).catch(err =>
            console.warn('Delete comment error:', err)
          )
        )
      );
    } catch (err) {
      console.error('Delete comment error:', err);
      handleFirestoreError(err, OperationType.DELETE, `forum_comments/${commentId}`);
    }
  };

  // React to a post (Heart, Haha, Sad, Boom, Wow)
  const handleReactPost = async (post: ForumPost, reactionType: string) => {
    playFortuneClickSound();
    const currentReaction = post.userReactions?.[currentUserId];
    const postRef = doc(db, 'forum_posts', post.id);

    const newReactions = { ...(post.reactions || { heart: 0, haha: 0, sad: 0, boom: 0, wow: 0 }) };
    const newUserReactions = { ...(post.userReactions || {}) };

    if (currentReaction === reactionType) {
      // Toggle off
      newReactions[reactionType as keyof typeof newReactions] = Math.max(0, (newReactions[reactionType as keyof typeof newReactions] || 1) - 1);
      delete newUserReactions[currentUserId];
    } else {
      // If switching from another reaction, decrement old
      if (currentReaction && newReactions[currentReaction as keyof typeof newReactions] !== undefined) {
        newReactions[currentReaction as keyof typeof newReactions] = Math.max(0, (newReactions[currentReaction as keyof typeof newReactions] || 1) - 1);
      }
      // Increment new
      newReactions[reactionType as keyof typeof newReactions] = (newReactions[reactionType as keyof typeof newReactions] || 0) + 1;
      newUserReactions[currentUserId] = reactionType;
    }

    try {
      setPosts(prev => {
        const updated = prev.map(p => p.id === post.id ? { ...p, reactions: newReactions, userReactions: newUserReactions } : p);
        try {
          localStorage.setItem('mei_forum_posts_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Backup reaction to server disk atomically so it persists across reloads even if Firestore quota is exceeded
      fetch('/api/react-forum-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: currentUserId,
          reactionType: currentReaction === reactionType ? null : reactionType,
          reactions: newReactions,
          userReactions: newUserReactions,
        }),
      }).catch(() => {});

      try {
        await setDoc(postRef, {
          reactions: newReactions,
          userReactions: newUserReactions,
        }, { merge: true });
      } catch (cloudErr) {
        console.warn('Sync post reaction to Firestore (quota/network):', cloudErr);
      }
    } catch (err) {
      console.warn('React post error:', err);
    }
  };

  // Submit comment for a post
  const handleSubmitComment = async (postId: string, parentId: string | null = null, replyToName: string | null = null) => {
    const inputKey = parentId ? `${postId}_${parentId}` : postId;
    const text = commentInputs[inputKey] || '';
    const imgs = commentImages[inputKey] || [];
    if (!text.trim() && imgs.length === 0) return;

    const useAnon = !currentUser || commentIsAnonymous[inputKey];
    const finalNick = useAnon
      ? (commentAnonNicknames[inputKey]?.trim() || commentNicknames[inputKey]?.trim() || 'vợ iu bí mật')
      : (isAdmin ? 'giáo chủ hội zơm👑' : currentUser.nickname);

    const userAvatar = useAnon
      ? null
      : (isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0]));
    const frameId = useAnon
      ? null
      : (isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay'));
    const authorUsername = useAnon ? null : currentUser.username;

    try {
      const newCommentData = {
        postId,
        parentId: parentId || null,
        replyToNickname: replyToName || null,
        nickname: finalNick,
        content: text.trim(),
        images: imgs,
        likes: 0,
        likedBy: [] as string[],
        createdAt: Date.now(),
        isAdmin: !useAnon && !!isAdmin,
        userAvatar: userAvatar || null,
        frameId: frameId || null,
        authorUsername: authorUsername || null,
      };

      let docId = 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      try {
        const docRef = await addDoc(collection(db, 'forum_comments'), newCommentData);
        docId = docRef.id;
      } catch (cloudErr) {
        console.warn('Firestore addDoc forum_comment error (quota/network):', cloudErr);
      }

      const createdComment: ForumComment = {
        id: docId,
        ...newCommentData,
      };

      setComments(prev => {
        const updated = [...prev, createdComment].sort((a, b) => a.createdAt - b.createdAt);
        try {
          localStorage.setItem('mei_forum_comments_cache', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Automatically open the comments drawer so user sees their new comment immediately
      setExpandedComments(prev => ({ ...prev, [postId]: true }));

      // Backup comment to server disk so it is immediately visible to PC, Mobile, and all devices
      fetch('/api/backup-forum-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdComment),
      }).catch(() => {});

      // Send Discord notification to user's bot webhook
      try {
        const discordContent = `**💬 CÓ BÌNH LUẬN MỚI TẠI FORUM TÁM ZAI 𝜗ৎ**\n\n**Người gửi:** ${finalNick}\n${replyToName ? `**Trả lời bạn:** @${replyToName}\n` : ''}**Nội dung:**\n> ${text.trim() || '*(Chỉ có ảnh)*'}\n${imgs.length > 0 ? `*(Kèm ${imgs.length} ảnh)*\n` : ''}---`;
        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: discordContent }),
        }).catch(err => console.warn('Discord webhook error:', err));
      } catch (err) {
        console.warn('Webhook dispatch failed:', err);
      }

      setCommentInputs(prev => ({ ...prev, [inputKey]: '' }));
      setCommentImages(prev => ({ ...prev, [inputKey]: [] }));
      setReplyingTo(null);
      if (useAnon) {
        setCommentAnonNicknames(prev => ({ ...prev, [inputKey]: '' }));
      }
      playFortuneClickSound();
    } catch (err) {
      console.error('Submit forum comment error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'forum_comments');
      showToast('Có lỗi khi gửi bình luận, vui lòng thử lại!');
    }
  };

  // Toggle Like for Forum Comment
  const handleToggleCommentLike = async (comment: ForumComment) => {
    playFortuneClickSound();
    const isLiked = comment.likedBy?.includes(currentUserId);
    const newLikes = isLiked ? Math.max(0, (comment.likes || 1) - 1) : (comment.likes || 0) + 1;
    const newLikedBy = isLiked
      ? (comment.likedBy || []).filter((id) => id !== currentUserId)
      : [...(comment.likedBy || []), currentUserId];

    const updatedComment: ForumComment = {
      ...comment,
      likes: newLikes,
      likedBy: newLikedBy,
    };

    // 1. Optimistic UI update
    setComments((prev) => prev.map((c) => (c.id === comment.id ? updatedComment : c)));

    // 2. Persist to server disk backup immediately (resilient for reload and quota limits)
    fetch('/api/backup-forum-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedComment),
    }).catch(() => {});

    // 3. Sync to Firestore (in background, safe try/catch for quota limits)
    try {
      const commentRef = doc(db, 'forum_comments', comment.id);
      if (isLiked) {
        await updateDoc(commentRef, {
          likes: newLikes,
          likedBy: arrayRemove(currentUserId),
        });
      } else {
        await updateDoc(commentRef, {
          likes: newLikes,
          likedBy: arrayUnion(currentUserId),
        });
      }
    } catch (err) {
      console.warn('Sync forum comment like to Firestore:', err);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (p.isPinned) return true;
    if (selectedCategory === 'Tất cả') return true;
    if (selectedCategory === 'Phòng tranh') {
      return p.category === 'Phòng tranh' || p.category === 'Góc đu zai';
    }
    return p.category === selectedCategory;
  });

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-black/95 border border-pink-500/50 text-pink-200 text-xs sm:text-sm font-semibold shadow-[0_4px_25px_rgba(244,114,182,0.4)] backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <span>🎀</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <header className="sticky top-0 z-40 p-4 flex items-center justify-between bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg">
        {/* Back Button (Only icon, no text) */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div 
          className="text-center select-none"
        >
          <h1 className="text-base sm:text-lg font-bold text-zinc-100 font-serif flex items-center justify-center gap-1.5">
            <span>Forum Tám Zai</span>
            <span className="text-pink-300">𝜗ৎ</span>
            {isAdmin && <Crown className="w-3.5 h-3.5 text-pink-300 animate-pulse ml-0.5" />}
          </h1>
          <p className="text-[10px] text-zinc-400">Ẩn danh tâm sự & kết nối đồng dâm</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playCardClickSound();
              setIsPosting(!isPosting);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo bài viết</span>
            <span className="sm:hidden">Viết</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playFortuneClickSound();
              if (currentUser) {
                setIsProfileOpen(true);
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="p-0.5 rounded-full transition-transform active:scale-95 cursor-pointer focus:outline-none shrink-0"
            title={currentUser ? `Tài khoản: ${currentUser.nickname}` : 'Đăng nhập / Đăng ký tài khoản'}
          >
            {currentUser ? (
              <AvatarWithFrame
                avatarUrl={currentUser.isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0])}
                frameId={currentUser.isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay')}
                size="sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-pink-400/50 flex items-center justify-center text-xs text-pink-300">
                🎭
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Forum Content Container */}
      <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playCardClickSound();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(244,114,182,0.5)] scale-105'
                  : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post Creation Modal / Box */}
        <AnimatePresence>
          {isPosting && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-5 sm:p-6 rounded-3xl border-pink-500/30 shadow-2xl relative space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-1.5 font-serif">
                  <span className="text-sm">🎀</span>
                  Đăng bài tâm sự ẩn danh
                </span>
                <button
                  onClick={() => setIsPosting(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nickname & Category Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1">
                  {currentUser && !isPostAnonymous ? (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/60 border border-white/10 shadow-inner">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarWithFrame
                          avatarUrl={currentUser.isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0])}
                          frameId={currentUser.isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay')}
                          size="sm"
                        />
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          {currentUser.isAdmin ? (
                            <span className="font-bold text-xs neon-twinkle-admin">
                              👑 giáo chủ hội zơm👑
                            </span>
                          ) : (
                            <span className="font-bold text-xs sm:text-sm text-pink-200 truncate">
                              {currentUser.nickname}
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-medium">
                            @{currentUser.username}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPostAnonymous(true)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-pink-300 border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                        title="Chuyển sang đăng bài ẩn danh"
                      >
                        <span>🎭</span>
                        <span>Đăng ẩn danh</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10">
                      <span className="text-xs pl-1">🎭</span>
                      <input
                        type="text"
                        value={currentUser ? postAnonymousNickname : nickname}
                        onChange={(e) => {
                          if (currentUser) {
                            setPostAnonymousNickname(e.target.value);
                          } else {
                            setNickname(e.target.value);
                          }
                        }}
                        placeholder="Nickname ẩn danh (để trống: 'vợ iu bí mật')"
                        maxLength={32}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-black/70 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50"
                      />
                      {currentUser && (
                        <button
                          type="button"
                          onClick={() => setIsPostAnonymous(false)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
                          title={`Dùng tài khoản ${currentUser.nickname}`}
                        >
                          <span>✨</span>
                          <span className="truncate max-w-[90px]">{currentUser.nickname}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-zinc-200 focus:outline-none focus:border-pink-500/50 sm:w-44"
                >
                  {CATEGORIES.filter(c => c !== 'Tất cả').map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Pin Toggle */}
              {isAdmin && (
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPostPinned}
                    onChange={(e) => setIsPostPinned(e.target.checked)}
                    className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                  <Pin className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Ghim bài viết này lên đầu làm thông báo quan trọng 📌</span>
                </label>
              )}

              {/* Notice when selecting Phòng tranh in post form */}
              {postCategory === 'Phòng tranh' && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>STRICT NO-AI TRAINING & REPOST NOTICE</span>
                  </div>
                  <p className="text-rose-100/80 leading-relaxed">
                    By posting artworks here, you confirm that you own the rights. <strong>All content is protected against AI training and unauthorized reproduction.</strong>
                  </p>
                </div>
              )}

              {/* Post Title (Tùy chọn) */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết (tùy chọn)"
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-black/60 border border-pink-500/30 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-500/30"
                />
              </div>

              {/* Spoiler Toggle Checkbox (above content area) */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-500/50 text-xs text-purple-200 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={isPostSpoiler}
                  onChange={(e) => setIsPostSpoiler(e.target.checked)}
                  className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="text-amber-300">⚠️</span>
                  <span>Có nội dung spoil</span>
                </span>
                <span className="text-[10px] text-purple-300/80 ml-auto hidden sm:inline">(Hiệu ứng noise tan ra khi click)</span>
              </label>

              {/* Post Content */}
              <div className="space-y-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Chia sẻ tâm sự, feedback bot, câu chuyện tình iu hay thắc mắc của bạn... 𝜗ৎ"
                  rows={4}
                  maxLength={3000}
                  className="w-full p-3.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 bg-black/70 border border-white/10 rounded-2xl resize-none focus:outline-none focus:border-pink-500/40 overflow-y-auto custom-scrollbar"
                />
                <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1">
                  <span>Tối đa 3000 ký tự</span>
                  <span>{postContent.length}/3000</span>
                </div>
              </div>

              {/* NSFW Images Toggle Checkbox (above attach images) */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/50 text-xs text-rose-200 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={isPostNsfw}
                  onChange={(e) => setIsPostNsfw(e.target.checked)}
                  className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold flex items-center gap-1.5">
                  <span>🔞</span>
                  <span>Nội dung NSFW (vui lòng tick vào đây để làm mờ)</span>
                </span>
                <span className="text-[10px] text-rose-300/80 ml-auto hidden sm:inline">(Làm mờ / Làm rõ)</span>
              </label>

              {/* Attached Link (Optional) */}
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-medium text-pink-300">
                    <Link2 className="w-3.5 h-3.5" />
                    Đính kèm đường link (nếu có)
                  </span>
                  <span className="text-[10px] text-zinc-500">Tùy chọn</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={postLinkUrl}
                    onChange={(e) => setPostLinkUrl(e.target.value)}
                    placeholder="Link URL (https://...)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50"
                  />
                  <input
                    type="text"
                    value={postLinkTitle}
                    onChange={(e) => setPostLinkTitle(e.target.value)}
                    placeholder="Tên link (VD: Xem bot tại đây, ...)"
                    maxLength={60}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {postImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {postImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/20">
                      <img src={img} alt="Post preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Post Actions Toolbar */}
              <div className="flex flex-col gap-2 pt-2">
                {showImgUrlInput && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-pink-500/30">
                    <input
                      type="url"
                      value={imgUrlInput}
                      onChange={(e) => setImgUrlInput(e.target.value)}
                      placeholder="Dán link ảnh hoặc link GIF (https://...)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-black/50 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-pink-500 hover:bg-pink-400 text-white transition-all cursor-pointer"
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImgUrlInput(false)}
                      className="p-1.5 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.gif"
                      multiple
                      onChange={handlePostImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={postImages.length >= 3}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-zinc-300 hover:text-pink-300 hover:border-pink-500/40 bg-white/5 active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Kèm ảnh ({postImages.length}/3)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowImgUrlInput(!showImgUrlInput)}
                      disabled={postImages.length >= 3}
                      className="p-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-pink-300 bg-white/5 hover:border-pink-500/40 active:scale-95 disabled:opacity-40 cursor-pointer"
                      title="Chèn ảnh / GIF bằng link"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPosting(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitPost}
                      disabled={submittingPost || (!postContent.trim() && postImages.length === 0 && !postTitle.trim())}
                      className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-400 text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      {submittingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Đăng ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notice for 'Phòng tranh' category in English */}
        {selectedCategory === 'Phòng tranh' && (
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-black/60 to-rose-950/40 backdrop-blur-md shadow-xl space-y-1.5 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>STRICT NO-AI TRAINING & COPYRIGHT POLICY</span>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-100/90 leading-relaxed font-sans">
              với mọi pức tranh up dưới đây phiền mng chèn watermak để đảm báo nhé!
              <strong> KHÔNG feed cho AI dưới mọi hình thức</strong>
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center gap-3 border-white/10">
            <Loader2 className="w-6 h-6 animate-spin text-pink-300" />
            <p className="text-xs text-zinc-400">Đang tải các bài tâm sự trong forum...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border-white/10">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-pink-300 mx-auto text-xl">
              𝜗ৎ
            </div>
            <p className="text-sm font-bold text-zinc-200">Chưa có bài viết nào trong mục này</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Hãy là người đầu tiên mở màn tâm sự hoặc chia sẻ feedback cho cả nhà cùng hóng nè!
            </p>
            <button
              onClick={() => setIsPosting(true)}
              className="mt-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-bold hover:bg-pink-500/30 transition-all cursor-pointer"
            >
              Viết bài đầu tiên
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const postCommentsList = comments.filter(c => c.postId === post.id);
            const isCommentsOpen = !!expandedComments[post.id];
            const myReaction = post.userReactions?.[currentUserId];
            const isPostAdmin = post.isAdmin || post.nickname.includes('giáo chủ');

            // Top-level comments and replies for this post
            const topLevelPostComments = postCommentsList.filter(c => !c.parentId);
            const topLevelPostIds = new Set(topLevelPostComments.map(c => c.id));
            const repliesByParent = postCommentsList.reduce((acc, c) => {
              if (c.parentId && topLevelPostIds.has(c.parentId)) {
                if (!acc[c.parentId]) acc[c.parentId] = [];
                acc[c.parentId].push(c);
              }
              return acc;
            }, {} as Record<string, ForumComment[]>);
            const validPostRepliesCount = (Object.values(repliesByParent) as ForumComment[][]).reduce((sum, list) => sum + list.length, 0);
            const postCommentsCount = topLevelPostComments.length + validPostRepliesCount;

            return (
              <div 
                key={post.id}
                className={`glass-panel p-5 sm:p-6 rounded-3xl space-y-4 transition-all relative ${
                  post.isPinned
                    ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-zinc-950/80 to-zinc-950/90 shadow-[0_0_25px_rgba(251,191,36,0.18)] ring-1 ring-amber-400/30'
                    : 'border-white/10 hover:border-white/15'
                }`}
              >
                {/* Pinned Post Badge */}
                {post.isPinned && (
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-200 text-xs w-fit shadow-sm">
                    <Pin className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span className="font-serif italic tracking-wide">𝒑𝒊𝒏𝒏𝒆𝒅 𝒑𝒐𝒔𝒕</span>
                  </div>
                )}

                {/* Post Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Poster Avatar with Frame */}
                    {(() => {
                      const { avatarUrl: postAvatar, frameId: postFrame } = getForumAvatarAndFrame(post);
                      return postAvatar ? (
                        <AvatarWithFrame
                          avatarUrl={postAvatar}
                          frameId={postFrame || 'frame-sakura-rose-overlay'}
                          size="md"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-300 shadow-sm shrink-0">
                          {post.nickname.charAt(0).toUpperCase() || '♡'}
                        </div>
                      );
                    })()}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPostAdmin ? (
                          <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-amber-300 via-pink-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] tracking-wide animate-pulse">
                            giáo chủ hội zơm👑
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-zinc-100">
                            {post.nickname}
                          </span>
                        )}

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-pink-300 border border-white/10">
                          {post.category}
                        </span>

                        {isPostAdmin ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/40 font-bold shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                            👑 GIÁO CHỦ
                          </span>
                        ) : post.nickname === 'vợ iu bí mật' ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                            vợ iu
                          </span>
                        ) : (post.authorUsername || (currentUser && post.nickname === currentUser.nickname)) ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                            @{post.authorUsername || currentUser?.username}
                          </span>
                        ) : null}

                        {post.category === 'Phòng tranh' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40 font-medium flex items-center gap-1 shadow-sm">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            <span>No-AI Protection</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Post Actions: Discreet Menu */}
                  {isAdmin && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playCardClickSound();
                          setActivePostAdminMenuId(prev => prev === post.id ? null : post.id);
                        }}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          activePostAdminMenuId === post.id
                            ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40'
                            : 'text-zinc-500 hover:text-amber-300 hover:bg-white/10'
                        }`}
                        title="Tùy chọn quản trị (Quyền Giáo Chủ)"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activePostAdminMenuId === post.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-20" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePostAdminMenuId(null);
                            }} 
                          />
                          <div 
                            className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-zinc-950/95 border border-amber-400/40 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_15px_rgba(251,191,36,0.15)] backdrop-blur-xl z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-2.5 py-1 text-[10px] font-bold text-amber-300/80 border-b border-white/10 flex items-center gap-1.5 mb-1">
                              <Crown className="w-3 h-3 text-amber-300" />
                              <span>Quyền Giáo Chủ</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setActivePostAdminMenuId(null);
                                handleOpenEditPost(post);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-pink-200 hover:bg-pink-500/15 transition-colors cursor-pointer text-left"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-pink-300" />
                              <span>Sửa bài viết</span>
                            </button>

                            {post.images && post.images.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePostAdminMenuId(null);
                                  handleQuickToggleNsfw(post);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors cursor-pointer text-left"
                              >
                                <span className="text-xs">🔞</span>
                                <span>{post.isNsfw ? 'Gỡ che NSFW' : 'Bật che NSFW'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setActivePostAdminMenuId(null);
                                handleTogglePinPost(post);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-amber-200 hover:bg-amber-500/15 transition-colors cursor-pointer text-left"
                            >
                              <Pin className={`w-3.5 h-3.5 ${post.isPinned ? 'fill-amber-300 text-amber-300' : 'text-zinc-400'}`} />
                              <span>{post.isPinned ? 'Bỏ ghim bài' : 'Ghim bài lên đầu'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActivePostAdminMenuId(null);
                                handleDeletePost(post.id);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-colors cursor-pointer text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Xóa bài viết</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Title */}
                {post.title && (
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-serif">
                    {post.title}
                  </h3>
                )}

                {/* 1 subtle line under title indicating spoiler content */}
                {post.isSpoiler && (
                  <div className="flex items-center justify-between text-xs text-purple-300/90 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className="text-amber-400">⚠️</span>
                      <span>Có nội dung spoil</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setRevealedSpoilers(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-[11px] text-purple-300 hover:text-white underline cursor-pointer"
                    >
                      {revealedSpoilers[post.id] ? 'Làm mờ' : 'Làm rõ'}
                    </button>
                  </div>
                )}

                {/* Post Body Content with Threads-style animated Noise that dissolves on click */}
                {post.isSpoiler ? (
                  <SpoilerNoiseContent
                    content={post.content}
                    isRevealed={!!revealedSpoilers[post.id]}
                    onToggleReveal={() => setRevealedSpoilers(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                )}

                {/* Attached Link (If any) */}
                {post.linkUrl && (
                  <div className="pt-1">
                    <a
                      href={post.linkUrl.startsWith('http') ? post.linkUrl : `https://${post.linkUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 hover:border-pink-400/60 text-pink-200 hover:text-pink-100 text-xs font-medium transition-all group/link max-w-full"
                    >
                      <span className="truncate max-w-[280px] sm:max-w-md">{post.linkTitle?.trim() || post.linkUrl}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-pink-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
                    </a>
                  </div>
                )}

                {/* Attached Images (Up to 3 small thumbnails) with NSFW Blur */}
                {post.images && post.images.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {post.isNsfw && (
                      <div className="flex items-center justify-between text-[11px] text-rose-300/90 bg-rose-950/30 px-3 py-1 rounded-xl border border-rose-500/30 w-fit gap-2.5">
                        <span className="flex items-center gap-1 font-semibold">
                          <span>🔞</span>
                          <span>Ảnh NSFW</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedNsfw(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className="text-[11px] text-rose-200 underline hover:text-white font-medium cursor-pointer"
                        >
                          {revealedNsfw[post.id] ? 'Làm mờ' : 'Làm rõ'}
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2.5">
                      {post.images.map((imgUrl, imgIdx) => {
                        const isBlurred = post.isNsfw && !revealedNsfw[post.id];
                        return (
                          <div
                            key={imgIdx}
                            onClick={() => {
                              if (isBlurred) {
                                setRevealedNsfw(prev => ({ ...prev, [post.id]: true }));
                              } else {
                                setLightbox({ images: post.images || [], currentIndex: imgIdx });
                              }
                            }}
                            className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/15 shadow-md cursor-pointer hover:border-pink-400/50 hover:scale-105 active:scale-95 transition-all"
                            title={isBlurred ? "Click để làm rõ ảnh" : "Click để phóng to ảnh"}
                          >
                            <img
                              src={imgUrl}
                              alt={`Thumbnail ${imgIdx + 1}`}
                              className={`w-full h-full object-cover transition-all duration-300 ${
                                isBlurred ? 'filter blur-[9px] scale-110' : ''
                              }`}
                            />
                            {isBlurred ? (
                              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center p-1 text-center select-none">
                                <span className="text-[10px] font-bold text-rose-200 bg-rose-950/90 px-2 py-0.5 rounded-full border border-rose-500/40 shadow-sm">
                                  Làm rõ
                                </span>
                              </div>
                            ) : (
                              <span className="absolute bottom-1 right-1.5 px-1 py-0.2 text-[9px] rounded bg-black/60 text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                {imgIdx + 1}/{post.images.length}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5 Reaction Icons Bar + Comments Toggle */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Reactions: Heart, Haha, Sad, Boom, Wow */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    {REACTION_CONFIG.map(({ type, emoji, label }) => {
                      const count = post.reactions?.[type as keyof typeof post.reactions] || 0;
                      const isReacted = myReaction === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleReactPost(post, type)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer active:scale-90 ${
                            isReacted
                              ? 'bg-pink-500/25 border border-pink-400/60 text-pink-300 font-bold scale-105 shadow-[0_0_8px_rgba(244,114,182,0.4)]'
                              : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
                          }`}
                          title={label}
                        >
                          <span className="text-xs">{emoji}</span>
                          <span>{count > 0 ? count : ''}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Toggle Comments Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-pink-300 font-medium cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Bình luận ({postCommentsCount})</span>
                  </button>
                </div>

                {/* Comment Section (Collapsible) */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                    {/* Comment Input */}
                    <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Viết bình luận cho bài đăng này:</span>
                      </div>

                      {currentUser && !commentIsAnonymous[post.id] ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/60 border border-white/10 shadow-inner">
                          <div className="flex items-center gap-2 min-w-0">
                            <AvatarWithFrame
                              avatarUrl={currentUser.isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0])}
                              frameId={currentUser.isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay')}
                              size="sm"
                            />
                            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                              {currentUser.isAdmin ? (
                                <span className="font-bold text-xs neon-twinkle-admin">
                                  👑 giáo chủ hội zơm👑
                                </span>
                              ) : (
                                <span className="font-bold text-xs text-pink-200 truncate">
                                  {currentUser.nickname}
                                </span>
                              )}
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-medium">
                                @{currentUser.username}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCommentIsAnonymous(prev => ({ ...prev, [post.id]: true }))}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-pink-300 border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                            title="Chuyển sang bình luận ẩn danh"
                          >
                            <span>🎭</span>
                            <span>Ẩn danh</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10">
                          <span className="text-xs pl-1">🎭</span>
                          <input
                            type="text"
                            value={currentUser ? (commentAnonNicknames[post.id] || '') : (commentNicknames[post.id] || '')}
                            onChange={(e) => {
                              if (currentUser) {
                                setCommentAnonNicknames(prev => ({ ...prev, [post.id]: e.target.value }));
                              } else {
                                setCommentNicknames(prev => ({ ...prev, [post.id]: e.target.value }));
                              }
                            }}
                            placeholder="Nickname ẩn danh (để trống: 'vợ iu bí mật')"
                            maxLength={32}
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-black/70 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/40"
                          />
                          {currentUser && (
                            <button
                              type="button"
                              onClick={() => setCommentIsAnonymous(prev => ({ ...prev, [post.id]: false }))}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
                              title={`Dùng tài khoản ${currentUser.nickname}`}
                            >
                              <span>✨</span>
                              <span className="truncate max-w-[80px]">{currentUser.nickname}</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="rounded-xl bg-black/60 border border-white/10 overflow-hidden focus-within:border-pink-500/40 transition-all">
                        <textarea
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onFocus={() => setExpandedInputs(prev => ({ ...prev, [post.id]: true }))}
                          placeholder="Nhập nội dung bình luận... 𝜗ৎ"
                          rows={expandedInputs[post.id] ? 3 : 2}
                          className={`w-full p-2.5 text-xs text-zinc-200 placeholder-zinc-500 bg-transparent resize-none focus:outline-none overflow-y-auto custom-scrollbar transition-all duration-200 ${
                            expandedInputs[post.id] ? 'min-h-[80px] max-h-40' : 'min-h-[44px]'
                          }`}
                        />

                        {/* Preview of attached images for comment */}
                        {commentImages[post.id]?.length > 0 && (
                          <div className="flex flex-wrap gap-2 px-2.5 py-1.5 bg-black/40 border-t border-white/5">
                            {commentImages[post.id].map((img, i) => (
                              <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                                <img src={img} alt="Comment preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setCommentImages(prev => ({
                                    ...prev,
                                    [post.id]: prev[post.id].filter((_, idx) => idx !== i)
                                  }))}
                                  className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center text-[10px]"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Submit comment action */}
                        <div className="px-2.5 py-1.5 bg-white/5 border-t border-white/5 flex items-center justify-between">
                          <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:border-pink-500/40 text-[11px] text-zinc-300 hover:text-pink-300 bg-white/5 cursor-pointer transition-all active:scale-95">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Kèm ảnh ({commentImages[post.id]?.length || 0}/3)</span>
                            <input
                              type="file"
                              accept="image/*,.gif"
                              multiple
                              onChange={(e) => handleCommentImageUpload(post.id, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim() && (!commentImages[post.id] || commentImages[post.id].length === 0)}
                            className="flex items-center gap-1 px-4 py-1 text-xs font-bold rounded-lg bg-pink-500 hover:bg-pink-400 text-white transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                          >
                            <span>Gửi</span>
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 pl-1 sm:pl-2">
                      {topLevelPostComments.length === 0 ? (
                        <p className="text-[11px] text-zinc-500 italic text-center py-2">
                          Chưa có ai bình luận bài viết này. Hãy là người đầu tiên!
                        </p>
                      ) : (
                        topLevelPostComments.map((cmt) => {
                          const isCmtLiked = cmt.likedBy?.includes(currentUserId);
                          const replies = repliesByParent[cmt.id] || [];
                          const isCmtAdmin = cmt.isAdmin || cmt.nickname.includes('giáo chủ');
                          const isReplyingThis = replyingTo?.commentId === cmt.id;

                          return (
                            <div key={cmt.id} className="space-y-2 pt-1 border-b border-white/5 pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const { avatarUrl: cmtAvatar, frameId: cmtFrame } = getForumAvatarAndFrame(cmt);
                                    return cmtAvatar ? (
                                      <AvatarWithFrame
                                        avatarUrl={cmtAvatar}
                                        frameId={cmtFrame || 'frame-sakura-rose-overlay'}
                                        size="sm"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] font-bold text-pink-300 shrink-0">
                                        {cmt.nickname.charAt(0).toUpperCase() || '♡'}
                                      </div>
                                    );
                                  })()}

                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isCmtAdmin ? (
                                      <span className="text-xs font-black bg-gradient-to-r from-amber-300 via-pink-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] tracking-wide animate-pulse">
                                        giáo chủ hội zơm👑
                                      </span>
                                    ) : (
                                      <span className="text-xs font-bold text-zinc-100">
                                        {cmt.nickname}
                                      </span>
                                    )}

                                    {isCmtAdmin ? (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/40 font-bold">
                                        👑 GIÁO CHỦ
                                      </span>
                                    ) : cmt.nickname === 'vợ iu bí mật' ? (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                                        vợ iu
                                      </span>
                                    ) : (cmt.authorUsername || (currentUser && cmt.nickname === currentUser.nickname)) ? (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                                        @{cmt.authorUsername || currentUser?.username}
                                      </span>
                                    ) : null}

                                    <span className="text-[10px] text-zinc-500">
                                      {formatRelativeTime(cmt.createdAt)}
                                    </span>
                                  </div>
                                </div>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(cmt.id)}
                                    className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                                    title="Xóa bình luận"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs text-zinc-200 pl-8 pr-1 whitespace-pre-wrap">
                                {cmt.content}
                              </p>

                              {/* Attached Images/GIFs in Comment */}
                              {cmt.images && cmt.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 pl-8 pt-1">
                                  {cmt.images.map((img, i) => (
                                    <div
                                      key={i}
                                      onClick={() => setLightbox({ images: cmt.images || [], currentIndex: i })}
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-pink-400/50 hover:scale-105 transition-all"
                                    >
                                      <img src={img} alt="Comment attachment" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Comment actions */}
                              <div className="flex items-center gap-3 pl-8 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCommentLike(cmt)}
                                  className={`flex items-center gap-1 cursor-pointer select-none ${
                                    isCmtLiked ? 'text-pink-400 font-bold' : 'text-zinc-400 hover:text-pink-300'
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${isCmtLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                                  <span>{cmt.likes > 0 ? cmt.likes : 'Thích'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isReplyingThis) {
                                      setReplyingTo(null);
                                    } else {
                                      setReplyingTo({ postId: post.id, commentId: cmt.id, nickname: cmt.nickname });
                                      setExpandedInputs(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: true }));
                                    }
                                  }}
                                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                                >
                                  Trả lời
                                </button>
                              </div>

                              {/* Nested Replies */}
                              {replies.length > 0 && (
                                <div className="mt-2 ml-4 pl-3 border-l border-pink-500/20 space-y-2">
                                  {replies.map((rep) => {
                                    const isRepLiked = rep.likedBy?.includes(currentUserId);
                                    const isRepAdmin = rep.isAdmin || rep.nickname.includes('giáo chủ');
                                    return (
                                      <div key={rep.id} className="space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            {(() => {
                                              const { avatarUrl: repAvatar, frameId: repFrame } = getForumAvatarAndFrame(rep);
                                              return repAvatar ? (
                                                <AvatarWithFrame
                                                  avatarUrl={repAvatar}
                                                  frameId={repFrame || 'frame-sakura-rose-overlay'}
                                                  size="sm"
                                                />
                                              ) : (
                                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-pink-200">
                                                  {rep.nickname.charAt(0).toUpperCase()}
                                                </div>
                                              );
                                            })()}
                                            <span className="text-[11px] font-bold text-zinc-200">{rep.nickname}</span>
                                            {isRepAdmin ? (
                                              <span className="text-[8px] px-1 py-0.2 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/40 font-bold">
                                                👑 GIÁO CHỦ
                                              </span>
                                            ) : (rep.authorUsername || (currentUser && rep.nickname === currentUser.nickname)) ? (
                                              <span className="text-[8px] px-1 py-0.2 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                                                @{rep.authorUsername || currentUser?.username}
                                              </span>
                                            ) : null}
                                            {rep.replyToNickname && (
                                              <span className="text-[9px] text-pink-300 flex items-center gap-0.5">
                                                <CornerDownRight className="w-2.5 h-2.5" />
                                                @{rep.replyToNickname}
                                              </span>
                                            )}
                                            <span className="text-[9px] text-zinc-500">· {formatRelativeTime(rep.createdAt)}</span>
                                          </div>

                                          {isAdmin && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteComment(rep.id)}
                                              className="text-zinc-500 hover:text-red-400 text-xs"
                                            >
                                              <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-xs text-zinc-300 pl-7">{rep.content}</p>

                                        {/* Attached Images/GIFs in Reply */}
                                        {rep.images && rep.images.length > 0 && (
                                          <div className="flex flex-wrap gap-2 pl-7 pt-1">
                                            {rep.images.map((img, i) => (
                                              <div
                                                key={i}
                                                onClick={() => setLightbox({ images: rep.images || [], currentIndex: i })}
                                                className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-pink-400/50 hover:scale-105 transition-all"
                                              >
                                                <img src={img} alt="Reply attachment" className="w-full h-full object-cover" />
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <div className="pl-7 flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleCommentLike(rep)}
                                            className={`text-[10px] flex items-center gap-1 ${
                                              isRepLiked ? 'text-pink-400 font-bold' : 'text-zinc-400'
                                            }`}
                                          >
                                            <Heart className={`w-2.5 h-2.5 ${isRepLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                                            <span>{rep.likes > 0 ? rep.likes : 'Thích'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setReplyingTo({ postId: post.id, commentId: cmt.id, nickname: rep.nickname });
                                              setExpandedInputs(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: true }));
                                            }}
                                            className="text-zinc-500 hover:text-zinc-200 text-[10px] cursor-pointer"
                                          >
                                            Trả lời
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Inline Reply Input with Full Nickname and Auto-expanding Scrollable Textarea */}
                              {isReplyingThis && (
                                <div className="mt-2 ml-4 pl-3 border-l-2 border-pink-400 space-y-2 bg-black/60 p-3 rounded-2xl border border-white/10 shadow-inner">
                                  <div className="flex items-center justify-between text-[11px] text-pink-300 font-medium">
                                    <span className="flex items-center gap-1">
                                      <CornerDownRight className="w-3.5 h-3.5" />
                                      Đang trả lời @{replyingTo?.nickname}:
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={() => setReplyingTo(null)} 
                                      className="text-zinc-400 hover:text-white"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Nickname & Account info */}
                                  {currentUser && !commentIsAnonymous[`${post.id}_${cmt.id}`] ? (
                                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-black/70 border border-white/10">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <AvatarWithFrame
                                          avatarUrl={currentUser.isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0])}
                                          frameId={currentUser.isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay')}
                                          size="sm"
                                        />
                                        <div className="min-w-0 flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-pink-200 truncate">
                                            {currentUser.isAdmin ? '👑 giáo chủ hội zơm👑' : currentUser.nickname}
                                          </span>
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                                            @{currentUser.username}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setCommentIsAnonymous(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: true }))}
                                        className="px-2 py-0.5 text-[10px] rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-pink-300 border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer"
                                        title="Chuyển sang trả lời ẩn danh"
                                      >
                                        <span>🎭</span>
                                        <span>Ẩn danh</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/70 border border-white/10">
                                      <span className="text-xs pl-1">🎭</span>
                                      <input
                                        type="text"
                                        value={currentUser ? (commentAnonNicknames[`${post.id}_${cmt.id}`] || '') : (commentNicknames[`${post.id}_${cmt.id}`] || '')}
                                        onChange={(e) => {
                                          if (currentUser) {
                                            setCommentAnonNicknames(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: e.target.value }));
                                          } else {
                                            setCommentNicknames(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: e.target.value }));
                                          }
                                        }}
                                        placeholder="Nickname ẩn danh (để trống: 'vợ iu bí mật')"
                                        maxLength={32}
                                        className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-black/70 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50"
                                      />
                                      {currentUser && (
                                        <button
                                          type="button"
                                          onClick={() => setCommentIsAnonymous(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: false }))}
                                          className="px-2 py-0.5 text-[10px] rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
                                          title={`Dùng tài khoản ${currentUser.nickname}`}
                                        >
                                          <span>✨</span>
                                          <span className="truncate max-w-[80px]">{currentUser.nickname}</span>
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Expandable Scrollable Textarea */}
                                  <div className="rounded-xl bg-black/70 border border-white/10 overflow-hidden focus-within:border-pink-500/50 transition-all">
                                    <textarea
                                      value={commentInputs[`${post.id}_${cmt.id}`] || ''}
                                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: e.target.value }))}
                                      onFocus={() => setExpandedInputs(prev => ({ ...prev, [`${post.id}_${cmt.id}`]: true }))}
                                      placeholder={`Viết câu trả lời cho @${replyingTo?.nickname}... 𝜗ৎ`}
                                      rows={expandedInputs[`${post.id}_${cmt.id}`] ? 3 : 2}
                                      className={`w-full p-2.5 text-xs text-zinc-200 placeholder-zinc-500 bg-transparent resize-none focus:outline-none overflow-y-auto custom-scrollbar transition-all duration-200 ${
                                        expandedInputs[`${post.id}_${cmt.id}`] ? 'min-h-[85px] max-h-44' : 'min-h-[44px]'
                                      }`}
                                    />

                                    {/* Preview of attached images for reply */}
                                    {commentImages[`${post.id}_${cmt.id}`]?.length > 0 && (
                                      <div className="flex flex-wrap gap-2 px-2.5 py-1.5 bg-black/40 border-t border-white/5">
                                        {commentImages[`${post.id}_${cmt.id}`].map((img, i) => (
                                          <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                                            <img src={img} alt="Reply preview" className="w-full h-full object-cover" />
                                            <button
                                              type="button"
                                              onClick={() => setCommentImages(prev => ({
                                                ...prev,
                                                [`${post.id}_${cmt.id}`]: prev[`${post.id}_${cmt.id}`].filter((_, idx) => idx !== i)
                                              }))}
                                              className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center text-[10px]"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="px-2.5 py-1.5 bg-white/5 border-t border-white/5 flex items-center justify-between">
                                      <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 hover:border-pink-500/40 text-[11px] text-zinc-300 hover:text-pink-300 bg-white/5 cursor-pointer transition-all active:scale-95">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Kèm ảnh ({commentImages[`${post.id}_${cmt.id}`]?.length || 0}/3)</span>
                                        <input
                                          type="file"
                                          accept="image/*,.gif"
                                          multiple
                                          onChange={(e) => handleCommentImageUpload(`${post.id}_${cmt.id}`, e)}
                                          className="hidden"
                                        />
                                      </label>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setReplyingTo(null)}
                                          className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                          Hủy
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSubmitComment(post.id, cmt.id, replyingTo?.nickname || null)}
                                          disabled={!commentInputs[`${post.id}_${cmt.id}`]?.trim() && (!commentImages[`${post.id}_${cmt.id}`] || commentImages[`${post.id}_${cmt.id}`].length === 0)}
                                          className="flex items-center gap-1 px-3.5 py-1 text-xs font-bold rounded-lg bg-pink-500 hover:bg-pink-400 text-white transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-md"
                                        >
                                          <span>Gửi</span>
                                          <Send className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal (Clean: Click outside to close) */}
      <AnimatePresence>
        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 cursor-zoom-out select-none"
          >
            <div onClick={(e) => e.stopPropagation()} className="relative max-w-4xl w-full flex flex-col items-center cursor-default">
              <div className="w-full flex items-center justify-center mb-3">
                <span className="text-xs sm:text-sm font-medium text-zinc-300 bg-black/60 px-4 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  Ảnh {lightbox.currentIndex + 1} / {lightbox.images.length}
                </span>
              </div>

              <div className="relative flex items-center justify-center w-full max-h-[75vh]">
                <img
                  src={lightbox.images[lightbox.currentIndex]}
                  alt={`Ảnh phóng to`}
                  className="max-h-[75vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/15"
                />

                {lightbox.images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox(prev => prev ? {
                        ...prev,
                        currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                      } : null);
                    }}
                    className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center shadow-2xl active:scale-90 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {lightbox.images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox(prev => prev ? {
                        ...prev,
                        currentIndex: (prev.currentIndex + 1) % prev.images.length
                      } : null);
                    }}
                    className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center shadow-2xl active:scale-90 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {lightbox.images.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto py-1 px-3 max-w-full">
                  {lightbox.images.map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightbox(prev => prev ? { ...prev, currentIndex: idx } : null)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === lightbox.currentIndex
                          ? 'border-pink-500 scale-105 shadow-[0_0_10px_rgba(244,114,182,0.5)]'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Edit Post Modal */}
      <AnimatePresence>
        {editingPost && (
          <div
            onClick={() => setEditingPost(null)}
            className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative max-w-lg w-full bg-zinc-950/95 border border-pink-500/40 rounded-3xl p-6 shadow-[0_0_35px_rgba(244,114,182,0.25)] space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 font-serif">Chỉnh sửa bài viết</h3>
                    <p className="text-[10px] text-pink-300">Quyền Giáo Chủ • Điều chỉnh nội dung & kiểm duyệt</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditPost} className="space-y-3.5">
                {/* Category selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Chủ đề:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-zinc-200 focus:outline-none focus:border-pink-500/50"
                  >
                    {CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Tiêu đề bài viết:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Tiêu đề (tùy chọn)"
                    maxLength={100}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Nội dung bài viết:</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    maxLength={3000}
                    className="w-full p-3 text-xs text-zinc-200 bg-black/70 border border-white/10 rounded-xl resize-none focus:outline-none focus:border-pink-500/40 overflow-y-auto custom-scrollbar"
                  />
                </div>

                {/* Toggles: NSFW, Spoilers, Pin */}
                <div className="space-y-2 pt-1">
                  {/* NSFW Checkbox */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/50 text-xs text-rose-200 cursor-pointer select-none transition-all">
                    <input
                      type="checkbox"
                      checked={editIsNsfw}
                      onChange={(e) => setEditIsNsfw(e.target.checked)}
                      className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🔞</span>
                        <span>Nội dung NSFW (Bắt buộc làm mờ ảnh)</span>
                      </span>
                      <p className="text-[10px] text-rose-300/70">
                        Tự động phủ lớp mờ nhẹ lên ảnh của bài viết này, chỉ rõ khi người dùng bấm vào.
                      </p>
                    </div>
                  </label>

                  {/* Spoiler Checkbox */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/50 text-xs text-purple-200 cursor-pointer select-none transition-all">
                    <input
                      type="checkbox"
                      checked={editIsSpoiler}
                      onChange={(e) => setEditIsSpoiler(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="text-amber-300">⚠️</span>
                        <span>Có nội dung spoil (Làm nhiễu chữ)</span>
                      </span>
                      <p className="text-[10px] text-purple-300/70">
                        Nội dung văn bản sẽ bị che mờ kiểu Threads, người xem click vào mới hiện chữ.
                      </p>
                    </div>
                  </label>

                  {/* Pin Checkbox */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 text-xs text-amber-200 cursor-pointer select-none transition-all">
                    <input
                      type="checkbox"
                      checked={editIsPinned}
                      onChange={(e) => setEditIsPinned(e.target.checked)}
                      className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <Pin className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Ghim bài viết lên đầu forum</span>
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 text-xs rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-pink-500 hover:bg-pink-400 text-white shadow-lg active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Auth Modal */}
      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUserUpdate={(updated) => {
            setCurrentUser(updated);
          }}
          onLogout={() => {
            setCurrentUser(null);
            setIsProfileOpen(false);
          }}
        />
      )}
    </div>
  );
}
