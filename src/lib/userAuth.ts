import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from './firebase';
import { restoreGardenFromCloud } from './gardenSync';
import { fetchCloudDailyFortune } from './fortuneSync';
import { fetchCloudLikedBots } from './botLikeSync';

export interface AppUser {
  username: string;
  email?: string;
  nickname: string;
  avatarUrl: string;
  frameId: string;
  isAdmin?: boolean;
  createdAt: number;
}

export function syncUserDataOnLogin(username: string) {
  if (!username) return;
  try {
    restoreGardenFromCloud(username).catch(() => {});
    fetchCloudDailyFortune(username).catch(() => {});
    fetchCloudLikedBots(username).catch(() => {});
  } catch (_e) {}
}

export const DEFAULT_AVATARS = [
  'https://i.pinimg.com/736x/87/40/e9/8740e9477b73c2474944b2a8d5f308bc.jpg',
  'https://i.pinimg.com/736x/a2/27/cb/a227cb9ea2ef968ef96d66e744ec1c65.jpg',
  'https://i.pinimg.com/736x/89/3e/26/893e26f8745582c3f875dc06c4bfe100.jpg',
  'https://i.pinimg.com/736x/de/07/26/de0726b27d42cf38a0c2e92c687e35b7.jpg',
  'https://i.pinimg.com/736x/ec/48/43/ec4843f886f7b11d948ea235bf755b41.jpg',
];

export const ADMIN_EMAIL = 'meinguyen18@gmail.com';
export const DEFAULT_ADMIN_AVATAR = 'https://i.pinimg.com/736x/9c/22/0f/9c220f853800c55d195ed122379f4d9d.jpg';
export const ADMIN_PASSWORD = 'meimei196';
export const ADMIN_DEFAULT_NICKNAME = 'giáo chủ hội zơm👑';
export const ADMIN_DEFAULT_FRAME = 'frame-crown-rose';

type AuthListener = (user: AppUser | null) => void;
const listeners = new Set<AuthListener>();

export function getEffectiveUserId(user?: AppUser | null): string {
  const u = user || getCurrentUser();
  if (u?.username) {
    const clean = (u.username === 'admin_meimei' || u.isAdmin) ? 'meinguyen18' : u.username.toLowerCase();
    return 'usr_' + clean;
  }
  const storageKey = 'mei_anon_uid';
  let uid = '';
  try {
    uid = localStorage.getItem(storageKey) || '';
  } catch {}
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    try {
      localStorage.setItem(storageKey, uid);
    } catch {}
  }
  return uid;
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem('mei_current_user');
    if (!raw) return null;
    const user: AppUser = JSON.parse(raw);
    const isOwner = user && (user.isAdmin || user.username === 'meinguyen18' || user.username === 'admin_meimei');
    if (isOwner) {
      user.username = 'meinguyen18';
      if (!user.email) user.email = ADMIN_EMAIL;
      user.isAdmin = true;
      if (!user.avatarUrl || user.avatarUrl === DEFAULT_AVATARS[0]) {
        user.avatarUrl = DEFAULT_ADMIN_AVATAR;
      }
    }
    return user;
  } catch (_e) {
    return null;
  }
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyAuth(user: AppUser | null) {
  if (user?.username) {
    syncUserDataOnLogin(user.username);
  }
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (_e) {}
  });
}

export async function loginWithGoogle(): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    if (!fbUser) {
      return { success: false, error: 'Không thể đăng nhập bằng Google!' };
    }

    const email = (fbUser.email || '').toLowerCase().trim();
    let cleanUsername = email
      ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      : `user_${fbUser.uid.slice(0, 8)}`;
    if (cleanUsername.length < 2) {
      cleanUsername = `user_${cleanUsername}`;
    }

    const isAdmin = email === ADMIN_EMAIL.toLowerCase();

    let userNickname = isAdmin ? ADMIN_DEFAULT_NICKNAME : (fbUser.displayName || cleanUsername);
    let userAvatar = isAdmin ? DEFAULT_ADMIN_AVATAR : (fbUser.photoURL || DEFAULT_AVATARS[0]);
    let userFrame = isAdmin ? ADMIN_DEFAULT_FRAME : 'frame-sakura-rose-overlay';

    if (isAdmin) {
      cleanUsername = 'meinguyen18';
      try {
        const snap = await getDoc(doc(db, 'user_profiles', 'admin_meimei'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.avatarUrl) userAvatar = data.avatarUrl;
          if (data.frameId) userFrame = data.frameId;
          if (data.username) userNickname = data.username;
        } else {
          const localAv = localStorage.getItem('mei_admin_avatar');
          const localFr = localStorage.getItem('mei_admin_frame');
          if (localAv && localAv !== DEFAULT_AVATARS[0]) userAvatar = localAv;
          if (localFr) userFrame = localFr;
        }
      } catch (_err) {
        const localAv = localStorage.getItem('mei_admin_avatar');
        const localFr = localStorage.getItem('mei_admin_frame');
        if (localAv && localAv !== DEFAULT_AVATARS[0]) userAvatar = localAv;
        if (localFr) userFrame = localFr;
      }
    } else {
      const userRef = doc(db, 'user_accounts', cleanUsername);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const existingData = snap.data();
        if (existingData.nickname) userNickname = existingData.nickname;
        if (existingData.avatarUrl) userAvatar = existingData.avatarUrl;
        if (existingData.frameId) userFrame = existingData.frameId;
      } else {
        await setDoc(userRef, {
          username: cleanUsername,
          email,
          nickname: userNickname,
          avatarUrl: userAvatar,
          frameId: userFrame,
          isAdmin: false,
          googleUid: fbUser.uid,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    const appUser: AppUser = {
      username: cleanUsername,
      email: isAdmin ? ADMIN_EMAIL : (email || undefined),
      nickname: userNickname,
      avatarUrl: userAvatar,
      frameId: userFrame,
      isAdmin,
      createdAt: Date.now(),
    };

    localStorage.setItem('mei_is_admin', isAdmin ? 'true' : 'false');
    localStorage.setItem('mei_comment_nickname', userNickname);
    if (isAdmin) {
      localStorage.setItem('mei_admin_avatar', userAvatar);
      localStorage.setItem('mei_admin_frame', userFrame);
    } else {
      localStorage.setItem('mei_user_avatar', userAvatar);
      localStorage.setItem('mei_user_frame', userFrame);
    }
    localStorage.setItem('mei_current_user', JSON.stringify(appUser));

    notifyAuth(appUser);
    return { success: true, user: appUser };
  } catch (err: any) {
    console.error('Google Sign-in error:', err);
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'Cửa sổ đăng nhập đã được đóng.' };
    }
    return { success: false, error: 'Không thể đăng nhập bằng Gmail: ' + (err.message || 'Lỗi mạng') };
  }
}

export async function loginUser(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!username) {
    return { success: false, error: 'Vui lòng nhập tên đăng nhập!' };
  }
  if (!password) {
    return { success: false, error: 'Vui lòng nhập mật khẩu!' };
  }

  // 1. Check for Admin password
  if (password === ADMIN_PASSWORD) {
    let adminAvatar = DEFAULT_ADMIN_AVATAR;
    let adminFrame = ADMIN_DEFAULT_FRAME;
    let adminNickname = ADMIN_DEFAULT_NICKNAME;

    try {
      const snap = await getDoc(doc(db, 'user_profiles', 'admin_meimei'));
      if (snap.exists()) {
        const data = snap.data();
        if (data.avatarUrl) adminAvatar = data.avatarUrl;
        if (data.frameId) adminFrame = data.frameId;
        if (data.username) adminNickname = data.username;
      } else {
        const localAv = localStorage.getItem('mei_admin_avatar');
        const localFr = localStorage.getItem('mei_admin_frame');
        if (localAv && localAv !== DEFAULT_AVATARS[0]) adminAvatar = localAv;
        if (localFr) adminFrame = localFr;
      }
    } catch (_err) {
      const localAv = localStorage.getItem('mei_admin_avatar');
      const localFr = localStorage.getItem('mei_admin_frame');
      if (localAv && localAv !== DEFAULT_AVATARS[0]) adminAvatar = localAv;
      if (localFr) adminFrame = localFr;
    }

    const adminUser: AppUser = {
      username: 'meinguyen18',
      email: ADMIN_EMAIL,
      nickname: adminNickname,
      avatarUrl: adminAvatar,
      frameId: adminFrame,
      isAdmin: true,
      createdAt: Date.now(),
    };

    localStorage.setItem('mei_is_admin', 'true');
    localStorage.setItem('mei_comment_nickname', adminNickname);
    localStorage.setItem('mei_admin_avatar', adminAvatar);
    localStorage.setItem('mei_admin_frame', adminFrame);
    localStorage.setItem('mei_current_user', JSON.stringify(adminUser));

    notifyAuth(adminUser);
    return { success: true, user: adminUser };
  }

  // 2. Regular user verification via Firestore
  try {
    const userDocRef = doc(db, 'user_accounts', username);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      return { success: false, error: 'Tên đăng nhập không tồn tại. Nàng hãy đăng ký nhé!' };
    }

    const data = snap.data();
    if (data.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác, nàng kiểm tra lại nha!' };
    }

    const loggedUser: AppUser = {
      username: data.username || username,
      email: data.email || undefined,
      nickname: data.nickname || username,
      avatarUrl: data.avatarUrl || DEFAULT_AVATARS[1],
      frameId: data.frameId || 'frame-sakura-rose-overlay',
      isAdmin: Boolean(data.isAdmin),
      createdAt: data.createdAt || Date.now(),
    };

    localStorage.setItem('mei_is_admin', loggedUser.isAdmin ? 'true' : 'false');
    localStorage.setItem('mei_comment_nickname', loggedUser.nickname);
    localStorage.setItem('mei_user_avatar', loggedUser.avatarUrl);
    localStorage.setItem('mei_user_frame', loggedUser.frameId);
    localStorage.setItem('mei_current_user', JSON.stringify(loggedUser));

    notifyAuth(loggedUser);
    return { success: true, user: loggedUser };
  } catch (err: any) {
    console.error('Login error:', err);
    return { success: false, error: 'Không thể kết nối máy chủ để đăng nhập: ' + (err.message || 'Lỗi mạng') };
  }
}

export async function registerUser(
  usernameInput: string,
  passwordInput: string,
  nicknameInput: string,
  avatarUrlInput?: string,
  frameIdInput?: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();
  const nickname = nicknameInput.trim() || username;

  if (username.length < 2) {
    return { success: false, error: 'Tên đăng nhập cần ít nhất 2 ký tự!' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Tên đăng nhập chỉ gồm chữ cái không dấu, số và dấu gạch dưới (_)!' };
  }
  if (password.length < 3) {
    return { success: false, error: 'Mật khẩu cần ít nhất 3 ký tự!' };
  }

  // If registering with admin secret password, automatically bind as admin
  if (password === ADMIN_PASSWORD) {
    return loginUser(username, password);
  }

  try {
    const userDocRef = doc(db, 'user_accounts', username);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return { success: false, error: 'Tên đăng nhập này đã có người dùng rồi nàng ơi!' };
    }

    const avatarUrl = avatarUrlInput || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    const frameId = frameIdInput || 'frame-sakura-rose-overlay';
    const now = Date.now();

    const newUser: AppUser = {
      username,
      nickname,
      avatarUrl,
      frameId,
      isAdmin: false,
      createdAt: now,
    };

    // Save to user_accounts
    await setDoc(userDocRef, {
      username,
      password,
      nickname,
      avatarUrl,
      frameId,
      isAdmin: false,
      createdAt: now,
      updatedAt: now,
    });

    // Also populate user_profiles for comment/forum visibility
    try {
      await setDoc(doc(db, 'user_profiles', username), {
        username: nickname,
        avatarUrl,
        frameId,
        updatedAt: now,
      }, { merge: true });
    } catch (_e) {}

    localStorage.setItem('mei_is_admin', 'false');
    localStorage.setItem('mei_comment_nickname', nickname);
    localStorage.setItem('mei_user_avatar', avatarUrl);
    localStorage.setItem('mei_user_frame', frameId);
    localStorage.setItem('mei_current_user', JSON.stringify(newUser));

    notifyAuth(newUser);
    return { success: true, user: newUser };
  } catch (err: any) {
    console.error('Register error:', err);
    return { success: false, error: 'Không thể đăng ký: ' + (err.message || 'Lỗi mạng') };
  }
}

export async function updateUserProfile(
  updates: Partial<Pick<AppUser, 'nickname' | 'avatarUrl' | 'frameId'>>
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const current = getCurrentUser();
  if (!current) {
    return { success: false, error: 'Chưa đăng nhập!' };
  }

  const updated: AppUser = {
    ...current,
    ...updates,
  };

  try {
    const now = Date.now();

    if (current.isAdmin) {
      localStorage.setItem('mei_admin_avatar', updated.avatarUrl);
      localStorage.setItem('mei_admin_frame', updated.frameId);
      localStorage.setItem('mei_comment_nickname', updated.nickname);

      try {
        await setDoc(doc(db, 'user_profiles', 'admin_meimei'), {
          username: updated.nickname,
          avatarUrl: updated.avatarUrl,
          frameId: updated.frameId,
          updatedAt: now,
        }, { merge: true });
      } catch (fireErr) {
        console.warn('Persist admin avatar to Firestore warning (likely GIF size):', fireErr);
      }
    } else {
      localStorage.setItem('mei_user_avatar', updated.avatarUrl);
      localStorage.setItem('mei_user_frame', updated.frameId);
      localStorage.setItem('mei_comment_nickname', updated.nickname);

      try {
        await setDoc(doc(db, 'user_accounts', current.username), {
          nickname: updated.nickname,
          avatarUrl: updated.avatarUrl,
          frameId: updated.frameId,
          updatedAt: now,
        }, { merge: true });
      } catch (fireErr) {
        console.warn('Persist user_accounts avatar warning (likely GIF size):', fireErr);
      }

      try {
        await setDoc(doc(db, 'user_profiles', current.username), {
          username: updated.nickname,
          avatarUrl: updated.avatarUrl,
          frameId: updated.frameId,
          updatedAt: now,
        }, { merge: true });
      } catch (_e) {}
    }

    localStorage.setItem('mei_current_user', JSON.stringify(updated));
    notifyAuth(updated);
    return { success: true, user: updated };
  } catch (err: any) {
    console.error('Update profile error:', err);
    return { success: false, error: 'Không thể cập nhật profile: ' + (err.message || 'Lỗi mạng') };
  }
}

export function logoutUser(): void {
  localStorage.removeItem('mei_current_user');
  localStorage.removeItem('mei_is_admin');
  localStorage.removeItem('mei_comment_nickname');
  localStorage.removeItem('mei_user_avatar');
  localStorage.removeItem('mei_user_frame');
  localStorage.removeItem('mei_admin_avatar');
  localStorage.removeItem('mei_admin_frame');
  notifyAuth(null);
}
