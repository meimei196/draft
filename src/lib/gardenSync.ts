import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface FlowerData {
  last: string;
  streak: number;
  petals: number;
}

export interface GardenSaveData {
  username: string;
  flowerData?: FlowerData;
  playerData?: any;
  starData?: any;
  shopData?: any;
  fishData?: any;
  petData?: any;
  rewardData?: any;
  dailyFortune?: any;
  updatedAt: number;
}

/**
 * Reads local streak and flower data for an account
 */
export function getLocalFlowerData(accountId: string): FlowerData {
  try {
    const raw = localStorage.getItem('mong-mien-garden:release:v1:flower:' + accountId);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        last: typeof parsed.last === 'string' ? parsed.last : '',
        streak: Number.isSafeInteger(parsed.streak) && parsed.streak >= 0 ? parsed.streak : 0,
        petals: Number.isSafeInteger(parsed.petals) && parsed.petals >= 0 ? parsed.petals : 0,
      };
    }
  } catch (_e) {}
  return { last: '', streak: 0, petals: 0 };
}

export interface GardenDailyActivity {
  id: string;
  title: string;
  reward: string;
  icon: string;
  done: boolean;
}

export function getGardenDailyActivities(username: string): GardenDailyActivity[] {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // 1. Tưới hoa hồng
  const flower = getLocalFlowerData(username);
  const isWatered = flower.last === today;

  // 2. Ngắm sao đêm
  let isStarWatched = false;
  try {
    const raw = localStorage.getItem('mong-mien-garden:release:v1:stars:' + username);
    if (raw) {
      const parsed = JSON.parse(raw);
      isStarWatched = parsed.last === today;
    }
  } catch (_e) {}

  // 3. Câu cá hồ nước
  let isFishingDone = false;
  try {
    const raw = localStorage.getItem('mong-mien-garden:release:v1:fish:' + username);
    if (raw) {
      const parsed = JSON.parse(raw);
      isFishingDone = parsed.lastDay === today && Number(parsed.usedToday) > 0;
    }
  } catch (_e) {}

  // 4. Chăm sóc thú cưng tại cottage
  let isPetCared = false;
  try {
    const raw = localStorage.getItem('mong-mien-garden:release:v1:pets:' + username) || localStorage.getItem('mong-mien-garden:release:v1:pet:' + username);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.needs && typeof parsed.needs === 'object') {
        const now = Date.now();
        const isToday = (ts: any) => {
          if (!ts || typeof ts !== 'number') return false;
          const dateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(ts));
          return dateStr === today || (now - ts < 18 * 3600000);
        };
        for (const petId of Object.keys(parsed.needs)) {
          const p = parsed.needs[petId];
          if (p && (isToday(p.feed) || isToday(p.water) || isToday(p.play) || isToday(p.sleep))) {
            isPetCared = true;
            break;
          }
        }
      }
    }
  } catch (_e) {}

  // 5. Thăm Tiệm & Nhận nuôi thú cưng
  let isShopOrMeadow = false;
  try {
    const rawShop = localStorage.getItem('mong-mien-garden:release:v1:shop:' + username);
    const rawPet = localStorage.getItem('mong-mien-garden:release:v1:pets:' + username) || localStorage.getItem('mong-mien-garden:release:v1:pet:' + username);
    if (rawShop) {
      const pShop = JSON.parse(rawShop);
      if (pShop.rod || pShop.pate > 0 || pShop.toy || (pShop.frames && pShop.frames.length > 0)) {
        isShopOrMeadow = true;
      }
    }
    if (rawPet) {
      const pPet = JSON.parse(rawPet);
      if (pPet.owned && pPet.owned.length > 0) {
        isShopOrMeadow = true;
      }
    }
  } catch (_e) {}

  return [
    {
      id: 'bloom',
      title: 'Tưới hoa hồng nở thêm',
      reward: '+10 cánh hoa · tăng streak',
      icon: '🌹',
      done: isWatered,
    },
    {
      id: 'stars',
      title: 'Ngắm sao & xem chòm sao',
      reward: '+1 sao · +5 cánh hoa ✿',
      icon: '✨',
      done: isStarWatched,
    },
    {
      id: 'fish',
      title: 'Thả câu cá bên bờ hồ',
      reward: 'Thu hoạch cá, bán cá & rong',
      icon: '🎣',
      done: isFishingDone,
    },
    {
      id: 'pet_care',
      title: 'Chăm thú cưng tại cottage',
      reward: 'Cho ăn, uống nước, chơi bóng len',
      icon: '🐾',
      done: isPetCared,
    },
    {
      id: 'shop_adopt',
      title: 'Ghé tiệm hoặc nhận nuôi pet',
      reward: 'Đổi cánh hoa lấy đồ & thú cưng',
      icon: '🛍️',
      done: isShopOrMeadow,
    },
  ];
}

/**
 * Downloads cloud garden save data from Firestore into local storage before the garden starts
 */
export async function restoreGardenFromCloud(username: string): Promise<GardenSaveData | null> {
  if (!username) return null;
  try {
    const ref = doc(db, 'garden_records', username);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data() as GardenSaveData;

    // Restore to localStorage so garden iframe reads current cloud progress
    if (data.flowerData) {
      localStorage.setItem('mong-mien-garden:release:v1:flower:' + username, JSON.stringify(data.flowerData));
    }
    if (data.playerData) {
      localStorage.setItem('mong-mien-garden:release:v1:player:' + username, JSON.stringify(data.playerData));
    }
    if (data.starData) {
      localStorage.setItem('mong-mien-garden:release:v1:stars:' + username, JSON.stringify(data.starData));
    }
    if (data.shopData) {
      localStorage.setItem('mong-mien-garden:release:v1:shop:' + username, JSON.stringify(data.shopData));
    }
    if (data.fishData) {
      localStorage.setItem('mong-mien-garden:release:v1:fish:' + username, JSON.stringify(data.fishData));
    }
    if (data.petData) {
      localStorage.setItem('mong-mien-garden:release:v1:pets:' + username, JSON.stringify(data.petData));
      localStorage.setItem('mong-mien-garden:release:v1:pet:' + username, JSON.stringify(data.petData));
    }
    if (data.rewardData || (data as any).rewards) {
      const rw = data.rewardData || (data as any).rewards;
      localStorage.setItem('mong-mien-garden:release:v1:rewards:' + username, JSON.stringify(rw));
    }
    if (data.dailyFortune) {
      try {
        const fortuneStr = JSON.stringify(data.dailyFortune);
        localStorage.setItem('dailyTarotCard', fortuneStr);
        localStorage.setItem(`dailyTarotCard_${username}`, fortuneStr);
      } catch (_e) {}
    }

    return data;
  } catch (err) {
    console.warn('Restore garden from cloud failed:', err);
    return null;
  }
}

/**
 * Flushes all current local garden data for a user to Firestore
 */
export async function syncGardenToCloud(username: string): Promise<void> {
  if (!username) return;
  try {
    const readKey = (prefix: string) => {
      try {
        const val = localStorage.getItem(prefix + username);
        return val ? JSON.parse(val) : null;
      } catch (_e) {
        return null;
      }
    };

    const flowerData = readKey('mong-mien-garden:release:v1:flower:');
    const playerData = readKey('mong-mien-garden:release:v1:player:');
    const starData = readKey('mong-mien-garden:release:v1:stars:');
    const shopData = readKey('mong-mien-garden:release:v1:shop:');
    const fishData = readKey('mong-mien-garden:release:v1:fish:');
    const petData = readKey('mong-mien-garden:release:v1:pets:') || readKey('mong-mien-garden:release:v1:pet:');
    const rewardData = readKey('mong-mien-garden:release:v1:rewards:');

    const payload: Partial<GardenSaveData> = {
      username,
      updatedAt: Date.now(),
    };
    if (flowerData) payload.flowerData = flowerData;
    if (playerData) payload.playerData = playerData;
    if (starData) payload.starData = starData;
    if (shopData) payload.shopData = shopData;
    if (fishData) payload.fishData = fishData;
    if (petData) payload.petData = petData;
    if (rewardData) payload.rewardData = rewardData;

    await setDoc(doc(db, 'garden_records', username), payload, { merge: true });
  } catch (err) {
    console.warn('Sync garden to cloud failed:', err);
  }
}

/**
 * Saves a single sub-key update from the garden to Firestore (e.g. flower, star, shop)
 */
export async function saveGardenSubKeyToCloud(username: string, subKey: string, data: any): Promise<void> {
  if (!username) return;
  try {
    const keyMap: Record<string, string> = {
      flower: 'flowerData',
      player: 'playerData',
      stars: 'starData',
      shop: 'shopData',
      fish: 'fishData',
      pet: 'petData',
      rewards: 'rewardData',
    };
    const fieldName = keyMap[subKey] || subKey;
    await setDoc(
      doc(db, 'garden_records', username),
      {
        username,
        [fieldName]: data,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Save garden sub-key to cloud failed:', err);
  }
}
