import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import botStatsBackup from '../data/botStatsBackup.json';

export interface UserPersona {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  appearance?: string;
  gender?: string;
  age?: string;
  basicInfo: string;
}

export interface AppState {
  likedBots: string[];
  toggleLike: (botId: string) => void;
  setLikedBots: (likedBots: string[]) => void;
  botStats: Record<string, { chatCount: number, likesCount: number }>;
  setBotStats: (stats: Record<string, { chatCount: number, likesCount: number }>) => void;
  updateSingleBotStat: (botId: string, stats: { chatCount?: number; likesCount?: number }) => void;
  subscribeToBotStats: (botId: string) => () => void;
  resetState: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      likedBots: [],
      setLikedBots: (likedBots) => set({ likedBots }),
      toggleLike: (botId) => {
        set((state) => {
          const isLiked = state.likedBots.includes(botId);
          const newLikes = isLiked
            ? state.likedBots.filter((id) => id !== botId)
            : [...state.likedBots, botId];
          
          const currentStats = state.botStats[botId] || { chatCount: 0, likesCount: 0 };
          const newStats = {
            ...state.botStats,
            [botId]: {
              ...currentStats,
              likesCount: Math.max(0, currentStats.likesCount + (isLiked ? -1 : 1))
            }
          };

          return { likedBots: newLikes, botStats: newStats };
        });
      },
      botStats: (botStatsBackup as Record<string, { chatCount: number, likesCount: number }>) || {},
      setBotStats: (stats) => set((state) => ({
        botStats: { ...state.botStats, ...stats }
      })),
      updateSingleBotStat: (botId, stat) => set((state) => ({
        botStats: {
          ...state.botStats,
          [botId]: {
            chatCount: stat.chatCount ?? state.botStats[botId]?.chatCount ?? 0,
            likesCount: stat.likesCount ?? state.botStats[botId]?.likesCount ?? 0,
          }
        }
      })),
      subscribeToBotStats: (_botId) => {
        return () => {};
      },
      resetState: () => set({
        likedBots: [],
        botStats: (botStatsBackup as Record<string, { chatCount: number, likesCount: number }>) || {},
      }),
    }),
    {
      name: 'meimeicorner-storage-gallery',
      version: 8,
      partialize: (state) => ({
        likedBots: state.likedBots,
        botStats: state.botStats,
      }),
      migrate: (persistedState: any) => {
        return {
          likedBots: Array.isArray(persistedState?.likedBots) ? persistedState.likedBots : [],
          botStats: (persistedState?.botStats && typeof persistedState.botStats === 'object')
            ? persistedState.botStats
            : (botStatsBackup as any) || {},
        };
      },
    }
  )
);
