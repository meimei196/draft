import { doc, onSnapshot, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { useStore } from './store';
import { getEffectiveUserId } from './userAuth';

/**
 * Fetches the latest global bot stats from the server disk backup.
 * This guarantees PC incognito, Mobile, and Main browser all receive the exact same numbers
 * even when Firebase Free Quota is exceeded.
 */
export async function syncBotStatsFromServer(): Promise<Record<string, { chatCount: number; likesCount: number }> | null> {
  try {
    const res = await fetch(`/api/get-bot-stats?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const serverStats = await res.json();
      if (serverStats && typeof serverStats === 'object' && Object.keys(serverStats).length > 0) {
        useStore.getState().setBotStats(serverStats);
        return serverStats;
      }
    }
  } catch (err) {
    console.warn('syncBotStatsFromServer error:', err);
  }
  return null;
}

/**
 * Toggles a like for a bot:
 * 1. Updates Zustand local store immediately for instant UI feedback
 * 2. Calls atomic server endpoint `/api/toggle-bot-like` to increment/decrement on disk
 * 3. Writes the new likesCount to Firestore `bot_stats/{botId}` using atomic increment
 * 4. Persists updated likedBots to server & Firestore
 */
export async function toggleBotLike(botId: string, username?: string): Promise<void> {
  const targetUser = username ? ((username === 'admin_meimei') ? 'meinguyen18' : username) : getEffectiveUserId();
  const state = useStore.getState();
  const wasLiked = state.likedBots.includes(botId);
  const delta = wasLiked ? -1 : 1;

  // 1. Update Zustand store immediately for instant UI feedback
  state.toggleLike(botId);
  const currentLikedBots = useStore.getState().likedBots;

  // 2. Atomic update to server disk immediately (ensures incognito & mobile sync instantly without overwriting other bots)
  try {
    const res = await fetch('/api/toggle-bot-like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        botId, 
        delta, 
        username: targetUser,
        likedBots: currentLikedBots
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.stats) {
        useStore.getState().setBotStats(data.stats);
      }
      if (Array.isArray(data?.likedBots)) {
        useStore.getState().setLikedBots(data.likedBots);
      }
    }
  } catch (e) {
    console.warn('Error syncing toggle-bot-like with server:', e);
  }

  // 3. Persist to Firestore `bot_stats/{botId}` using atomic increment (inside safe try/catch for quota limits)
  try {
    const botStatRef = doc(db, 'bot_stats', botId);
    await setDoc(
      botStatRef,
      { likesCount: delta > 0 ? increment(1) : increment(-1) },
      { merge: true }
    );
  } catch (err) {
    console.warn('Sync bot_stats like to Firestore (quota or network):', err);
  }

  // 4. Persist user's likedBots to Firestore
  if (targetUser && !targetUser.startsWith('anon_')) {
    try {
      const userAccountRef = doc(db, 'user_accounts', targetUser);
      await setDoc(
        userAccountRef,
        {
          likedBots: currentLikedBots,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // If admin, also sync to user_profiles
      if (targetUser === 'admin_meimei' || targetUser === 'meinguyen18') {
        const adminProfileRef = doc(db, 'user_profiles', 'admin_meimei');
        await setDoc(adminProfileRef, { likedBots: currentLikedBots }, { merge: true });
      }
    } catch (err) {
      console.warn('Sync user likedBots error:', err);
    }
  }
}

/**
 * Listens to the user's liked bots in Firestore in real-time and restores from server disk backup.
 */
export function subscribeUserLikedBots(username: string): () => void {
  if (!username) return () => {};
  const normUser = (username === 'admin_meimei') ? 'meinguyen18' : username;

  // First fetch from server disk backup
  fetch(`/api/get-user-account?username=${encodeURIComponent(normUser)}`)
    .then((r) => r.json())
    .then((data) => {
      if (Array.isArray(data?.likedBots)) {
        useStore.getState().setLikedBots(data.likedBots);
      }
    })
    .catch(() => {});

  if (normUser.startsWith('anon_')) {
    return () => {};
  }

  const userAccountRef = doc(db, 'user_accounts', normUser);
  const unsub = onSnapshot(
    userAccountRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.likedBots)) {
          useStore.getState().setLikedBots(data.likedBots);
        }
      }
    },
    (err) => {
      console.warn('subscribeUserLikedBots error:', err);
    }
  );

  return unsub;
}

/**
 * Initial restore of liked bots for a user on login / app start
 */
export async function fetchCloudLikedBots(username: string): Promise<string[] | null> {
  if (!username) return null;
  const normUser = (username === 'admin_meimei') ? 'meinguyen18' : username;

  // 1. Try local server backup first (fast & works in incognito even when Firestore quota exceeded)
  try {
    const res = await fetch(`/api/get-user-account?username=${encodeURIComponent(normUser)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.likedBots)) {
        useStore.getState().setLikedBots(data.likedBots);
        return data.likedBots;
      }
    }
  } catch {}

  // 2. Try Firestore
  try {
    let snap = await getDoc(doc(db, 'user_accounts', normUser));
    if (!snap.exists() || !snap.data()?.likedBots) {
      if (normUser === 'admin_meimei' || normUser === 'meinguyen18') {
        snap = await getDoc(doc(db, 'user_profiles', 'admin_meimei'));
      }
    }
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.likedBots)) {
        useStore.getState().setLikedBots(data.likedBots);
        // Also backup to server
        fetch('/api/backup-user-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: normUser, likedBots: data.likedBots }),
        }).catch(() => {});
        return data.likedBots;
      }
    }
  } catch (err) {
    console.warn('fetchCloudLikedBots error:', err);
  }
  return null;
}
