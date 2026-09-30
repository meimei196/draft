import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TarotCard } from '../data/tarot78';

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface DailyFortuneRecord {
  timestamp: number;
  card: TarotCard;
  username?: string;
}

const LOCAL_STORAGE_KEY = 'dailyTarotCard';

function getLocalKey(username?: string): string {
  return username ? `${LOCAL_STORAGE_KEY}_${username}` : LOCAL_STORAGE_KEY;
}

/**
 * Reads daily fortune from localStorage (supports user-specific and legacy fallback)
 */
export function getLocalFortune(username?: string): DailyFortuneRecord | null {
  try {
    const keysToCheck = username ? [getLocalKey(username), LOCAL_STORAGE_KEY] : [LOCAL_STORAGE_KEY];
    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const drawTime = parsed.timestamp || (parsed.date ? new Date(parsed.date).getTime() : 0);
        const elapsed = Date.now() - drawTime;
        if (elapsed < ONE_DAY_MS && parsed.card) {
          return { timestamp: drawTime, card: parsed.card, username: parsed.username || username };
        } else {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (_e) {}
  return null;
}

/**
 * Saves daily fortune to localStorage and cloud Firestore
 */
export async function saveDailyFortune(
  username: string | undefined,
  card: TarotCard,
  timestamp: number
): Promise<void> {
  const record: DailyFortuneRecord = { timestamp, card, username };
  const serialized = JSON.stringify(record);

  // 1. Save locally
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    if (username) {
      localStorage.setItem(getLocalKey(username), serialized);
    }
  } catch (_e) {}

  // 2. Sync to Firestore if user is authenticated
  if (username) {
    try {
      const payload = {
        dailyFortune: {
          timestamp,
          card,
          updatedAt: Date.now(),
        },
      };

      // Sync to garden_records
      await setDoc(doc(db, 'garden_records', username), payload, { merge: true });

      // Sync to user_accounts
      await setDoc(doc(db, 'user_accounts', username), payload, { merge: true });
    } catch (err) {
      console.warn('Failed to sync daily fortune to cloud:', err);
    }
  }
}

/**
 * Restores daily fortune from cloud (Firestore) for an account across PC / mobile
 */
export async function fetchCloudDailyFortune(username: string): Promise<DailyFortuneRecord | null> {
  if (!username) return null;

  try {
    // Check garden_records first, fallback to user_accounts
    let snap = await getDoc(doc(db, 'garden_records', username));
    if (!snap.exists() || !snap.data()?.dailyFortune) {
      snap = await getDoc(doc(db, 'user_accounts', username));
    }

    if (snap.exists()) {
      const data = snap.data();
      const fortune = data?.dailyFortune;
      if (fortune && fortune.card && typeof fortune.timestamp === 'number') {
        const elapsed = Date.now() - fortune.timestamp;
        if (elapsed < ONE_DAY_MS) {
          const record: DailyFortuneRecord = {
            timestamp: fortune.timestamp,
            card: fortune.card,
            username,
          };
          // Cache locally
          const serialized = JSON.stringify(record);
          localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
          localStorage.setItem(getLocalKey(username), serialized);
          return record;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch cloud daily fortune:', err);
  }

  return null;
}
