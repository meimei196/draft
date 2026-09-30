import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Image as ImageIcon, 
  X, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  CornerDownRight, 
  Loader2,
  Trash2,
  Crown,
  KeyRound,
  CheckCircle2,
  Upload,
  Camera
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  setDoc 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { playFortuneClickSound } from '../lib/sound';
import { ADMIN_FRAMES, AvatarWithFrame } from './AvatarFrame';
import { getCurrentUser, subscribeAuth, DEFAULT_ADMIN_AVATAR, DEFAULT_AVATARS, AppUser, getEffectiveUserId } from '../lib/userAuth';

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1530072747177414779/dMR0IXkoakW3bgaZ1vVSK1nCJS8xTw4PrcYoBF1YKqsQYJnSLwF1aK1HeJKX8K8kP0ei";

export interface BotComment {
  id: string;
  botId: string;
  parentId?: string | null;
  replyToNickname?: string | null;
  nickname: string;
  content: string;
  images?: string[];
  likes: number;
  likedBy?: string[];
  createdAt: number;
  userAvatar?: string | null;
  isAdmin?: boolean;
  frameId?: string | null;
  authorUsername?: string | null;
}

// Generate or retrieve persistent anonymous user identifier
function getOrCreateAnonymousUserId(): string {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  const storageKey = 'mei_anon_uid';
  let uid = '';
  try {
    uid = localStorage.getItem(storageKey) || '';
  } catch {
    // ignore
  }
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    try {
      localStorage.setItem(storageKey, uid);
    } catch {
      // ignore
    }
  }
  return uid;
}

// Client-side image compression to small Data URL (under 60KB each) to preserve Firestore 1MB quota
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
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
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

const DECOR_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
];

export function BotComments({ botId, botName }: { botId: string; botName: string }) {
  const [allComments, setAllComments] = useState<BotComment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Persistent Auth State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousNickname, setAnonymousNickname] = useState('');
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);
  const [replyAnonymousNickname, setReplyAnonymousNickname] = useState('');

  const [isAdmin, setIsAdmin] = useState(() => {
    const user = getCurrentUser();
    return Boolean(user?.isAdmin);
  });

  const [adminAvatar, setAdminAvatar] = useState(() => {
    const user = getCurrentUser();
    if (user?.isAdmin && user.avatarUrl) return user.avatarUrl;
    try {
      return localStorage.getItem('mei_admin_avatar') || DEFAULT_ADMIN_AVATAR;
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

  // Persistent anonymous nickname
  const [nickname, setNickname] = useState(() => {
    const user = getCurrentUser();
    return user ? user.nickname : '';
  });

  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(Boolean(user.isAdmin));
        setNickname(user.nickname);
        if (user.isAdmin) {
          setAdminAvatar(user.avatarUrl || DEFAULT_ADMIN_AVATAR);
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
    const unsubProfiles = onSnapshot(
      collection(db, 'user_profiles'),
      (snap) => {
        const map: Record<string, { username?: string; avatarUrl?: string; frameId?: string }> = {};
        snap.forEach((d) => {
          map[d.id] = d.data();
        });
        setUserProfiles(map);
        try {
          localStorage.setItem('mei_user_profiles_cache', JSON.stringify(map));
        } catch {}
      },
      (err) => {
        console.warn('BotComments unsubProfiles notice:', err);
      }
    );
    return unsubProfiles;
  }, []);

  const getCommentAvatarAndFrame = (item: {
    isAdmin?: boolean;
    nickname: string;
    userAvatar?: string | null;
    frameId?: string | null;
    authorUsername?: string | null;
  }) => {
    const isItemAdmin = item.isAdmin || item.nickname.includes('giáo chủ');
    if (isItemAdmin) {
      return {
        avatarUrl: adminAvatar || item.userAvatar || DEFAULT_ADMIN_AVATAR,
        frameId: adminFrame || item.frameId || 'frame-crown-rose',
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

  // Top-level comment input state
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null);
  const [replyNickname, setReplyNickname] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const [isReplyInputExpanded, setIsReplyInputExpanded] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Lightbox Modal Gallery state
  const [lightbox, setLightbox] = useState<{ images: string[]; currentIndex: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = getEffectiveUserId(currentUser);

  // Save nickname to localStorage on change
  const handleNicknameChange = (val: string) => {
    setNickname(val);
    try {
      localStorage.setItem('mei_comment_nickname', val);
    } catch {
      // ignore
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null);
      } else if (e.key === 'ArrowLeft') {
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  // Real-time Firestore sync
  useEffect(() => {
    // Sync live Admin Profile from Firestore so all comments & replies stay 100% updated in real-time
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

    setLoading(true);

    // Load from server disk backup immediately (resilient fallback for quota limits)
    const loadServerComments = () => {
      fetch(`/api/get-bot-comments?botId=${encodeURIComponent(botId)}`)
        .then(r => r.json())
        .then((serverList) => {
          if (Array.isArray(serverList) && serverList.length > 0) {
            setAllComments((prev) => {
              const map = new Map<string, BotComment>();
              serverList.forEach((c: any) => { if (c?.id) map.set(c.id, c); });
              prev.forEach((c) => { if (!map.has(c.id)) map.set(c.id, c); });
              return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
            });
            setLoading(false);
          }
        })
        .catch(() => {});
    };

    loadServerComments();
    const pollInterval = setInterval(loadServerComments, 10000);
    const handleFocus = () => loadServerComments();
    window.addEventListener('focus', handleFocus);

    const q = query(collection(db, 'bot_comments'), where('botId', '==', botId));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: BotComment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            botId: data.botId,
            parentId: data.parentId || null,
            replyToNickname: data.replyToNickname || null,
            nickname: data.nickname || 'vợ iu bí mật',
            content: data.content || '',
            images: data.images || [],
            likes: typeof data.likes === 'number' ? data.likes : 0,
            likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            userAvatar: data.userAvatar || null,
            isAdmin: data.isAdmin || false,
            frameId: data.frameId || null,
            authorUsername: data.authorUsername || null,
          });
        });
        list.sort((a, b) => a.createdAt - b.createdAt);
        setAllComments(list);
        setLoading(false);
      },
      (error) => {
        console.warn('bot_comments onSnapshot handled via server backup:', (error as any)?.message || error);
        setLoading(false);
      }
    );

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      unsubAdmin();
      unsubscribe();
    };
  }, [botId]);

  // Handle image upload for main comment (Max 3)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
    const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
    if (!files.length) return;

    const currentImages = isReply ? replyImages : images;
    const remainingSlots = 3 - currentImages.length;
    if (remainingSlots <= 0) {
      showToast('Nàng chỉ được kèm tối đa 3 ảnh thôi nè baby! 𝜗ৎ');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const compressedList: string[] = [];

    for (const file of filesToProcess) {
      try {
        const compressed = await compressImage(file);
        compressedList.push(compressed);
      } catch (err: any) {
        if (err?.message === 'GIF_TOO_LARGE') {
          showToast('File GIF nên dưới 1.2MB để tải lên mượt mà nha! 𝜗ৎ');
        } else {
          console.warn('Lỗi xử lý ảnh:', err);
        }
      }
    }

    if (isReply) {
      setReplyImages(prev => [...prev, ...compressedList]);
    } else {
      setImages(prev => [...prev, ...compressedList]);
    }

    e.target.value = '';
  };

  const removeImage = (index: number, isReply = false) => {
    if (isReply) {
      setReplyImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Submit top-level comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    setIsSubmitting(true);
    const useAnon = !currentUser || isAnonymous;
    const finalNickname = useAnon
      ? (anonymousNickname.trim() || nickname.trim() || 'vợ iu bí mật')
      : (isAdmin ? 'giáo chủ hội zơm👑' : currentUser.nickname);

    const userAvatar = useAnon
      ? null
      : (isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0]));
    const frameId = useAnon
      ? null
      : (isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay'));

    const commentData = {
      botId,
      parentId: null,
      replyToNickname: null,
      nickname: finalNickname,
      content: content.trim(),
      images,
      likes: 0,
      likedBy: [] as string[],
      createdAt: Date.now(),
      userAvatar: userAvatar || null,
      isAdmin: !useAnon && !!isAdmin,
      frameId: frameId || null,
      authorUsername: useAnon ? null : currentUser.username,
    };

    let docId = 'bcmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    try {
      const docRef = await addDoc(collection(db, 'bot_comments'), commentData);
      docId = docRef.id;
    } catch (cloudErr) {
      console.warn('Firestore addDoc bot_comments error (quota/network):', cloudErr);
    }

    const newComment: BotComment = { id: docId, ...commentData };
    setAllComments((prev) => [...prev, newComment].sort((a, b) => a.createdAt - b.createdAt));

    // Backup to server disk immediately
    fetch('/api/backup-bot-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    }).catch(() => {});

    try {
      // Send Discord notification to user's bot webhook
      try {
        const discordContent = `**💬 CÓ BÌNH LUẬN MỚI CHO CHỒNG IU 𝜗ৎ**\n\n**Chồng iu:** ${botName}\n**Người bình luận:** ${finalNickname}\n**Nội dung:**\n> ${content.trim() || '*(Chỉ có ảnh)*'}\n${images.length > 0 ? `*(Kèm ${images.length} ảnh)*\n` : ''}---`;
        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: discordContent }),
        }).catch(err => console.warn('Discord webhook error:', err));
      } catch (err) {
        console.warn('Webhook dispatch failed:', err);
      }

      setContent('');
      setImages([]);
      setIsInputExpanded(false);
      playFortuneClickSound();
    } catch (err) {
      console.error('Submit bot comment error:', err);
      showToast('Có lỗi xảy ra khi gửi bình luận, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() && replyImages.length === 0) return;

    setIsSubmittingReply(true);
    const useAnon = !currentUser || isReplyAnonymous;
    const finalNickname = useAnon
      ? (replyAnonymousNickname.trim() || replyNickname.trim() || 'vợ iu bí mật')
      : (isAdmin ? 'giáo chủ hội zơm👑' : currentUser.nickname);

    const userAvatar = useAnon
      ? null
      : (isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0]));
    const frameId = useAnon
      ? null
      : (isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay'));

    const replyData = {
      botId,
      parentId: parentCommentId,
      replyToNickname: replyingTo?.nickname || null,
      nickname: finalNickname,
      content: replyContent.trim(),
      images: replyImages,
      likes: 0,
      likedBy: [] as string[],
      createdAt: Date.now(),
      userAvatar: userAvatar || null,
      isAdmin: !useAnon && !!isAdmin,
      frameId: frameId || null,
      authorUsername: useAnon ? null : currentUser.username,
    };

    let docId = 'bcmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    try {
      const docRef = await addDoc(collection(db, 'bot_comments'), replyData);
      docId = docRef.id;
    } catch (cloudErr) {
      console.warn('Firestore addDoc bot reply error (quota/network):', cloudErr);
    }

    const newReply: BotComment = { id: docId, ...replyData };
    setAllComments((prev) => [...prev, newReply].sort((a, b) => a.createdAt - b.createdAt));

    // Backup reply to server disk immediately
    fetch('/api/backup-bot-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReply),
    }).catch(() => {});

    try {
      // Send Discord notification to user's bot webhook
      try {
        const discordContent = `**💬 CÓ CÂU TRẢ LỜI MỚI CHO BÌNH LUẬN 𝜗ৎ**\n\n**Chồng iu:** ${botName}\n**Người trả lời:** ${finalNickname}\n**Trả lời bạn:** @${replyingTo?.nickname || 'vợ iu'}\n**Nội dung:**\n> ${replyContent.trim() || '*(Chỉ có ảnh)*'}\n${replyImages.length > 0 ? `*(Kèm ${replyImages.length} ảnh)*\n` : ''}---`;
        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: discordContent }),
        }).catch(err => console.warn('Discord webhook error:', err));
      } catch (err) {
        console.warn('Webhook dispatch failed:', err);
      }

      setReplyContent('');
      setReplyImages([]);
      setReplyingTo(null);
      setIsReplyInputExpanded(false);
      playFortuneClickSound();
    } catch (err) {
      console.error('Submit bot reply error:', err);
      showToast('Có lỗi xảy ra khi gửi trả lời, vui lòng thử lại!');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete comment / reply (Admin Only privilege)
  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    try {
      playFortuneClickSound();
      // Find all IDs to delete (the target comment + any replies to it)
      const childIds = allComments
        .filter((c) => c.parentId === commentId)
        .map((c) => c.id);
      const allIdsToDelete = [commentId, ...childIds];

      // Optimistic instant UI update
      setAllComments((prev) => prev.filter((c) => !allIdsToDelete.includes(c.id)));

      // Delete all target docs from Firestore
      await Promise.all(
        allIdsToDelete.map((id) =>
          deleteDoc(doc(db, 'bot_comments', id)).catch((err) =>
            console.warn('Delete doc error:', err)
          )
        )
      );
    } catch (err) {
      console.error('Delete error:', err);
      handleFirestoreError(err, OperationType.DELETE, `bot_comments/${commentId}`);
    }
  };

  // Toggle Heart / Like in real-time
  const handleToggleLike = async (comment: BotComment) => {
    playFortuneClickSound();
    const isLiked = comment.likedBy?.includes(currentUserId);
    const newLikes = isLiked ? Math.max(0, (comment.likes || 1) - 1) : (comment.likes || 0) + 1;
    const newLikedBy = isLiked
      ? (comment.likedBy || []).filter((id) => id !== currentUserId)
      : [...(comment.likedBy || []), currentUserId];

    const updatedComment: BotComment = {
      ...comment,
      likes: newLikes,
      likedBy: newLikedBy,
    };

    // 1. Optimistic UI update
    setAllComments((prev) => prev.map((c) => (c.id === comment.id ? updatedComment : c)));

    // 2. Persist to server disk backup immediately (resilient for reload and quota limits)
    fetch('/api/backup-bot-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedComment),
    }).catch(() => {});

    // 3. Sync to Firestore (in background, safe try/catch for quota limits)
    try {
      const commentRef = doc(db, 'bot_comments', comment.id);
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
      console.warn('Sync bot comment like to Firestore:', err);
    }
  };

  // Group top-level comments and replies
  const topLevelComments = allComments
    .filter((c) => !c.parentId)
    .sort((a, b) => b.createdAt - a.createdAt); // newest first

  const topLevelIds = new Set(topLevelComments.map((c) => c.id));

  // Only group and count replies whose parent actually exists
  const repliesByParentId = allComments.reduce((acc, c) => {
    if (c.parentId && topLevelIds.has(c.parentId)) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {} as Record<string, BotComment[]>);

  // Total valid comments = valid top-level comments + valid replies
  const validRepliesCount = (Object.values(repliesByParentId) as BotComment[][]).reduce(
    (sum, list) => sum + list.length,
    0
  );
  const totalCount = topLevelComments.length + validRepliesCount;

  return (
    <div className="w-full mt-10 space-y-6 relative">
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

      {/* Section Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 select-none"
              title="Góc tâm tình"
            >
              {isAdmin ? <Crown className="w-4 h-4 text-pink-300 animate-pulse" /> : <MessageCircle className="w-4 h-4" />}
            </div>
            <div>
              <h3 
                className="text-base sm:text-lg font-bold text-zinc-100 serif-title flex items-center gap-2 select-none"
              >
                <span>Bình luận ẩn danh</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-pink-300 font-sans font-semibold border border-white/10">
                  {totalCount}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Góc tâm sự, cảm nhận & thả thính cho {botName} 𝜗ৎ
              </p>
            </div>
          </div>
        </div>

        {/* Top-level Comment Input Form */}
        <form onSubmit={handleSubmitComment} className="mt-4 space-y-3">
          {/* Identity & Nickname Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-black/50 border border-white/10 shadow-inner">
            {currentUser && !isAnonymous ? (
              <div className="flex items-center justify-between w-full gap-2">
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
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-medium">
                      @{currentUser.username}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className="px-2.5 py-1 text-[11px] rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-pink-300 border border-white/10 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Chuyển sang bình luận ẩn danh"
                >
                  <span>🎭</span>
                  <span>Bình luận ẩn danh</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 shrink-0">
                  🎭
                </div>
                <input
                  type="text"
                  value={currentUser ? anonymousNickname : nickname}
                  onChange={(e) => {
                    if (currentUser) {
                      setAnonymousNickname(e.target.value);
                    } else {
                      handleNicknameChange(e.target.value);
                    }
                  }}
                  placeholder="Nickname ẩn danh (để trống sẽ là 'vợ iu bí mật')"
                  maxLength={32}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 transition-all shadow-inner"
                />
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(false)}
                    className="px-2.5 py-1 text-[11px] rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                    title={`Quay về tài khoản ${currentUser.nickname}`}
                  >
                    <span>✨</span>
                    <span className="hidden sm:inline">Dùng nick</span>
                    <span className="font-semibold max-w-[100px] truncate">{currentUser.nickname}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comment Textarea (Expands on click / focus, scrollable) */}
          <div className="relative rounded-2xl bg-black/70 border border-white/10 focus-within:border-pink-500/40 transition-all shadow-inner overflow-hidden">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsInputExpanded(true)}
              onClick={() => setIsInputExpanded(true)}
              placeholder={`Viết bình luận cho ${botName}... 𝜗ৎ`}
              rows={isInputExpanded ? 4 : 2}
              className={`w-full p-3.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 bg-transparent resize-none focus:outline-none overflow-y-auto custom-scrollbar transition-all duration-300 ${
                isInputExpanded ? 'min-h-[100px] max-h-52' : 'min-h-[50px] max-h-24'
              }`}
            />

            {/* Selected Images Thumbnails Preview (Max 3) */}
            {images.length > 0 && (
              <div className="p-3 pt-0 flex flex-wrap gap-2.5 items-center">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/20 shadow-md">
                    <img 
                      src={imgUrl} 
                      alt={`Preview ${idx + 1}`} 
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setLightbox({ images, currentIndex: idx })}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-dashed border-white/20 hover:border-pink-400/50 flex flex-col items-center justify-center text-zinc-400 hover:text-pink-300 text-[10px] gap-1 transition-all active:scale-95"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>+{3 - images.length}</span>
                  </button>
                )}
              </div>
            )}

            {/* Input Action Toolbar */}
            <div className="px-3 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.gif"
                  multiple
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 3}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    images.length >= 3
                      ? 'opacity-40 cursor-not-allowed border-white/5 text-zinc-500'
                      : 'border-white/10 hover:border-pink-500/40 text-zinc-300 hover:text-pink-300 bg-white/5 hover:bg-white/10 active:scale-95'
                  }`}
                  title="Đính kèm tối đa 3 ảnh"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Ảnh ({images.length}/3)</span>
                </button>

                {isInputExpanded && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!content && images.length === 0) {
                        setIsInputExpanded(false);
                      }
                    }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1"
                  >
                    Thu gọn
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && images.length === 0)}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-md hover:shadow-pink-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-zinc-400 gap-3 border-white/10">
            <Loader2 className="w-6 h-6 animate-spin text-pink-300" />
            <p className="text-xs">Đang tải bình luận theo thời gian thực...</p>
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center text-zinc-400 gap-2 border-white/10">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-pink-300/80 mb-1">
              ♡
            </div>
            <p className="text-sm font-medium text-zinc-300">Chưa có bình luận nào cho {botName}</p>
            <p className="text-xs text-zinc-500 max-w-sm">
              Hãy là người đầu tiên để lại lời nhắn yêu thương hoặc chia sẻ trải nghiệm của bạn nè!
            </p>
          </div>
        ) : (
          topLevelComments.map((comment) => {
            const isLiked = comment.likedBy?.includes(currentUserId);
            const replies = repliesByParentId[comment.id] || [];
            const isReplyingThis = replyingTo?.id === comment.id;
            const isCommentAdmin = comment.isAdmin || comment.nickname.includes('giáo chủ');

            return (
              <div 
                key={comment.id}
                className="glass-panel p-4 sm:p-5 rounded-3xl border-white/10 space-y-3 transition-all hover:border-white/15 relative group/item"
              >
                {/* Main Comment Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    {(() => {
                      const { avatarUrl, frameId } = getCommentAvatarAndFrame(comment);

                      return avatarUrl ? (
                        <AvatarWithFrame
                          avatarUrl={avatarUrl}
                          frameId={frameId || 'frame-sakura-rose-overlay'}
                          size="md"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-300 shadow-sm shrink-0">
                          {comment.nickname.charAt(0).toUpperCase() || '♡'}
                        </div>
                      );
                    })()}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCommentAdmin ? (
                          <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-amber-300 via-pink-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] tracking-wide animate-pulse">
                            giáo chủ hội zơm👑
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-zinc-100 hover:text-pink-300 transition-colors">
                            {comment.nickname}
                          </span>
                        )}

                        {isCommentAdmin ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/40 font-bold shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                            👑 GIÁO CHỦ
                          </span>
                        ) : comment.nickname === 'vợ iu bí mật' ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                            vợ iu
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Delete Comment Button */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Xóa bình luận này (Quyền Giáo Chủ)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Text Content */}
                {comment.content && (
                  <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed pl-10 pr-2">
                    {comment.content}
                  </p>
                )}

                {/* Attached Images (Up to 3 small thumbnails) */}
                {comment.images && comment.images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pl-10 pt-1">
                    {comment.images.map((imgUrl, imgIdx) => (
                      <div 
                        key={imgIdx}
                        onClick={() => setLightbox({ images: comment.images || [], currentIndex: imgIdx })}
                        className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/15 shadow-md cursor-pointer hover:border-pink-400/50 hover:scale-105 active:scale-95 transition-all"
                        title="Click để phóng to ảnh"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Thumbnail ${imgIdx + 1}`} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <span className="absolute bottom-1 right-1.5 px-1 py-0.2 text-[9px] rounded bg-black/60 text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {imgIdx + 1}/{comment.images.length}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons: Like / Thả tim & Reply / Trả lời */}
                <div className="flex items-center gap-4 pl-10 pt-1 text-xs">
                  {/* Real-time Heart / Like */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(comment)}
                    className={`flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-90 ${
                      isLiked ? 'text-pink-400 font-bold' : 'text-zinc-400 hover:text-pink-300'
                    }`}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-transform ${
                        isLiked ? 'fill-pink-500 text-pink-500 scale-110' : 'hover:scale-110'
                      }`} 
                    />
                    <span>{comment.likes > 0 ? comment.likes : 'Thích'}</span>
                  </button>

                  {/* Reply Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isReplyingThis) {
                        setReplyingTo(null);
                      } else {
                        setReplyingTo({ id: comment.id, nickname: comment.nickname });
                        setReplyNickname(isAdmin ? 'giáo chủ hội zơm👑' : nickname);
                        setIsReplyAnonymous(false);
                        setReplyAnonymousNickname('');
                        setIsReplyInputExpanded(true);
                      }
                    }}
                    className={`flex items-center gap-1 transition-all cursor-pointer select-none ${
                      isReplyingThis ? 'text-pink-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Trả lời</span>
                    {replies.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300">
                        {replies.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Nested Replies Thread (Facebook Style) */}
                {replies.length > 0 && (
                  <div className="mt-3 ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-pink-500/20 space-y-3 pt-1">
                    {replies.map((reply) => {
                      const isReplyLiked = reply.likedBy?.includes(currentUserId);
                      const isReplyAdmin = reply.isAdmin || reply.nickname.includes('giáo chủ');

                      return (
                        <div key={reply.id} className="space-y-1.5 pt-1 relative group/reply">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Reply Avatar */}
                              {(() => {
                                const { avatarUrl: replyAvatar, frameId: replyFrame } = getCommentAvatarAndFrame(reply);

                                return replyAvatar ? (
                                  <AvatarWithFrame
                                    avatarUrl={replyAvatar}
                                    frameId={replyFrame || 'frame-sakura-rose-overlay'}
                                    size="sm"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] font-bold text-pink-200 shrink-0">
                                    {reply.nickname.charAt(0).toUpperCase() || '♡'}
                                  </div>
                                );
                              })()}

                              <div className="flex items-center gap-2 flex-wrap">
                                {isReplyAdmin ? (
                                  <span className="text-xs font-black bg-gradient-to-r from-amber-300 via-pink-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] tracking-wide animate-pulse">
                                    giáo chủ hội zơm👑
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-zinc-100">
                                    {reply.nickname}
                                  </span>
                                )}

                                {reply.replyToNickname && (
                                  <span className="text-[10px] text-pink-300/80 flex items-center gap-1">
                                    <CornerDownRight className="w-2.5 h-2.5" />
                                    @{reply.replyToNickname}
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-500">
                                  · {formatRelativeTime(reply.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Admin Delete Reply Button */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(reply.id)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                                title="Xóa câu trả lời này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {reply.content && (
                            <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed pl-8 pr-1">
                              {reply.content}
                            </p>
                          )}

                          {/* Reply thumbnails */}
                          {reply.images && reply.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 pl-8 pt-1">
                              {reply.images.map((rImg, rIdx) => (
                                <div
                                  key={rIdx}
                                  onClick={() => setLightbox({ images: reply.images || [], currentIndex: rIdx })}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/15 shadow cursor-pointer hover:border-pink-400 hover:scale-105 active:scale-95 transition-all"
                                >
                                  <img 
                                    src={rImg} 
                                    alt={`Reply thumbnail ${rIdx + 1}`} 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Actions */}
                          <div className="flex items-center gap-3 pl-8 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleToggleLike(reply)}
                              className={`flex items-center gap-1 cursor-pointer select-none transition-all active:scale-90 ${
                                isReplyLiked ? 'text-pink-400 font-bold' : 'text-zinc-500 hover:text-pink-300'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isReplyLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                              <span>{reply.likes > 0 ? reply.likes : 'Thích'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo({ id: comment.id, nickname: reply.nickname });
                                setReplyNickname(isAdmin ? 'giáo chủ hội zơm👑' : nickname);
                                setIsReplyAnonymous(false);
                                setReplyAnonymousNickname('');
                                setIsReplyInputExpanded(true);
                              }}
                              className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
                            >
                              Trả lời
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline Reply Input Box */}
                <AnimatePresence>
                  {isReplyingThis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-pink-500/40 pt-2 space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5 text-pink-300">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Đang trả lời <strong>@{replyingTo?.nickname}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reply identity bar */}
                      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-black/50 border border-white/10">
                        {currentUser && !isReplyAnonymous ? (
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <AvatarWithFrame
                                avatarUrl={currentUser.isAdmin ? (adminAvatar || currentUser.avatarUrl || DEFAULT_ADMIN_AVATAR) : (currentUser.avatarUrl || DEFAULT_AVATARS[0])}
                                frameId={currentUser.isAdmin ? (adminFrame || currentUser.frameId || 'frame-crown-rose') : (currentUser.frameId || 'frame-sakura-rose-overlay')}
                                size="sm"
                              />
                              <span className="font-bold text-xs text-pink-200 truncate">
                                {currentUser.isAdmin ? '👑 giáo chủ hội zơm👑' : currentUser.nickname}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsReplyAnonymous(true)}
                              className="px-2 py-0.5 text-[10px] rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-pink-300 border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Chuyển sang trả lời ẩn danh"
                            >
                              <span>🎭</span>
                              <span>Ẩn danh</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs">🎭</span>
                            <input
                              type="text"
                              value={currentUser ? replyAnonymousNickname : replyNickname}
                              onChange={(e) => {
                                if (currentUser) {
                                  setReplyAnonymousNickname(e.target.value);
                                } else {
                                  setReplyNickname(e.target.value);
                                }
                              }}
                              placeholder="Nickname ẩn danh (để trống: 'vợ iu bí mật')"
                              maxLength={32}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/40"
                            />
                            {currentUser && (
                              <button
                                type="button"
                                onClick={() => setIsReplyAnonymous(false)}
                                className="px-2 py-0.5 text-[10px] rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
                                title={`Dùng tài khoản ${currentUser.nickname}`}
                              >
                                <span>✨</span>
                                <span>Nick</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reply Textarea */}
                      <div className="rounded-xl bg-black/70 border border-white/10 focus-within:border-pink-500/40 transition-all overflow-hidden">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onFocus={() => setIsReplyInputExpanded(true)}
                          placeholder={`Viết câu trả lời... 𝜗ৎ`}
                          rows={isReplyInputExpanded ? 3 : 2}
                          className={`w-full p-2.5 text-xs text-zinc-200 placeholder-zinc-500 bg-transparent resize-none focus:outline-none overflow-y-auto custom-scrollbar ${
                            isReplyInputExpanded ? 'min-h-[70px] max-h-40' : 'min-h-[44px]'
                          }`}
                        />

                        {/* Reply thumbnails */}
                        {replyImages.length > 0 && (
                          <div className="p-2 pt-0 flex flex-wrap gap-2 items-center">
                            {replyImages.map((imgUrl, idx) => (
                              <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/20">
                                <img src={imgUrl} alt={`Reply preview ${idx}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx, true)}
                                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Action toolbar */}
                        <div className="px-2.5 py-1.5 bg-white/5 border-t border-white/5 flex items-center justify-between gap-2">
                          <div>
                            <input
                              ref={replyFileInputRef}
                              type="file"
                              accept="image/*,.gif"
                              multiple
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => replyFileInputRef.current?.click()}
                              disabled={replyImages.length >= 3}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${
                                replyImages.length >= 3
                                  ? 'opacity-40 cursor-not-allowed border-white/5 text-zinc-500'
                                  : 'border-white/10 hover:border-pink-500/40 text-zinc-300 hover:text-pink-300 bg-white/5'
                              }`}
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>Ảnh ({replyImages.length}/3)</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={isSubmittingReply || (!replyContent.trim() && replyImages.length === 0)}
                              className="flex items-center gap-1 px-4 py-1 text-xs font-bold rounded-lg bg-pink-500 hover:bg-pink-400 text-white transition-all disabled:opacity-40"
                            >
                              {isSubmittingReply ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <span>Trả lời</span>
                                  <Send className="w-2.5 h-2.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal Gallery (Clean: Click outside backdrop to close, no X or prompt text) */}
      <AnimatePresence>
        {lightbox && (
          <div 
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 cursor-zoom-out select-none"
          >
            {/* Modal Container: stopPropagation so clicking inside does not close */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-4xl w-full flex flex-col items-center cursor-default"
            >
              {/* Top Bar with Counter only */}
              <div className="w-full flex items-center justify-center mb-3 px-2">
                <span className="text-xs sm:text-sm font-medium text-zinc-300 bg-black/60 px-4 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  Ảnh {lightbox.currentIndex + 1} / {lightbox.images.length}
                </span>
              </div>

              {/* Main Image Display */}
              <div className="relative flex items-center justify-center w-full max-h-[75vh]">
                <img
                  src={lightbox.images[lightbox.currentIndex]}
                  alt={`Phóng to ảnh ${lightbox.currentIndex + 1}`}
                  className="max-h-[75vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/15"
                />

                {/* Left Button */}
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
                    className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90 cursor-pointer"
                    title="Ảnh trước đó"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Right Button */}
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
                    className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90 cursor-pointer"
                    title="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnails Strip (Scroll/Click to view other images) */}
              {lightbox.images.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto py-1 px-3 max-w-full">
                  {lightbox.images.map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightbox(prev => prev ? { ...prev, currentIndex: idx } : null)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === lightbox.currentIndex 
                          ? 'border-pink-500 scale-105 shadow-[0_0_10px_rgba(244,114,182,0.5)]' 
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={thumbUrl} alt={`Thumbnail nav ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
