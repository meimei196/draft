/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from './components/Home';
import { BotProfile } from './components/BotProfile';
import { ForumTamZai } from './components/ForumTamZai';
import { MeiMeiGarden } from './components/MeiMeiGarden';
import { GuidelinesAuth } from './components/GuidelinesAuth';
import { RandomHusbandWidget } from './components/RandomHusbandWidget';
import { MusicPlayer } from './components/MusicPlayer';
import { Particles } from './components/Particles';
import { HeartTrail } from './components/HeartTrail';
import { bots } from './data/bots';
import { getCurrentUser, subscribeAuth, AppUser, syncUserDataOnLogin, getEffectiveUserId } from './lib/userAuth';
import { subscribeUserLikedBots, syncBotStatsFromServer } from './lib/botLikeSync';

export default function App() {
  const getBotFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const queryBot = params.get('bot');
    if (queryBot) {
      const match = bots.find((b) => b.id.toLowerCase() === queryBot.toLowerCase());
      if (match) return match.id;
    }

    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && hash !== 'forumtamzai' && !hash.includes('vuonhoa') && !hash.includes('garden')) {
      const candidate = hash.startsWith('bot=') ? hash.replace('bot=', '') : hash;
      const match = bots.find((b) => b.id.toLowerCase() === candidate.toLowerCase());
      if (match) return match.id;
    }
    return null;
  };

  const getIsForumFromUrl = () => {
    const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    const params = new URLSearchParams(window.location.search);
    return pathname === '/forumtamzai' || hash === 'forumtamzai' || params.get('page') === 'forumtamzai';
  };

  const getIsGardenFromUrl = () => {
    const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    const params = new URLSearchParams(window.location.search);
    return (
      pathname === '/meimeigarden' ||
      hash === 'meimeigarden' ||
      hash.includes('vuonhoa') ||
      params.get('page') === 'meimeigarden'
    );
  };

  const [selectedBotId, setSelectedBotId] = useState<string | null>(() => getBotFromUrl());
  const [isForumOpen, setIsForumOpen] = useState<boolean>(() => getIsForumFromUrl());
  const [isGardenOpen, setIsGardenOpen] = useState<boolean>(() => getIsGardenFromUrl());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  // Always show Grand Cổng on reload/fresh load
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    return subscribeAuth((u) => {
      setCurrentUser(u);
    });
  }, []);

  // Global real-time sync of bot stats from server immediately on app mount, window focus, and periodic polling
  useEffect(() => {
    syncBotStatsFromServer();
    const interval = setInterval(() => {
      syncBotStatsFromServer();
    }, 15000);
    const handleFocus = () => {
      syncBotStatsFromServer();
    };
    const handleVisibility = () => {
      if (!document.hidden) {
        syncBotStatsFromServer();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const effectiveUser = currentUser?.username || getEffectiveUserId();
    if (currentUser?.username) {
      syncUserDataOnLogin(currentUser.username);
    }
    const unsub = subscribeUserLikedBots(effectiveUser);
    return () => unsub();
  }, [currentUser?.username]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    // If the visitor arrived via a direct link to a bot, forum, or garden, navigate straight to it after the disclaimer!
    const targetBot = getBotFromUrl();
    const targetForum = getIsForumFromUrl();
    const targetGarden = getIsGardenFromUrl();

    if (targetBot) {
      setSelectedBotId(targetBot);
      setIsForumOpen(false);
      setIsGardenOpen(false);
      window.history.replaceState({ botId: targetBot }, '', `/?bot=${encodeURIComponent(targetBot)}`);
    } else if (targetForum) {
      setSelectedBotId(null);
      setIsForumOpen(true);
      setIsGardenOpen(false);
      window.history.replaceState({ page: 'forum' }, '', '/forumtamzai');
    } else if (targetGarden) {
      setSelectedBotId(null);
      setIsForumOpen(false);
      setIsGardenOpen(true);
      window.history.replaceState({ page: 'garden' }, '', '/meimeigarden');
    } else {
      setSelectedBotId(null);
      setIsForumOpen(false);
      setIsGardenOpen(false);
      window.history.replaceState(null, '', '/');
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      if (hash === 'forumtamzai') {
        window.history.replaceState(null, '', '/forumtamzai');
      } else if (hash === 'meimeigarden' || hash.includes('vuonhoa')) {
        window.history.replaceState(null, '', '/meimeigarden');
      }

      setSelectedBotId(getBotFromUrl());
      setIsForumOpen(getIsForumFromUrl());
      setIsGardenOpen(getIsGardenFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleSelectBot = (id: string | null) => {
    setSelectedBotId(id);
    setIsForumOpen(false);
    setIsGardenOpen(false);
    if (id) {
      const newUrl = `/?bot=${encodeURIComponent(id)}`;
      window.history.pushState({ botId: id }, '', newUrl);
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  const handleOpenForum = () => {
    setSelectedBotId(null);
    setIsGardenOpen(false);
    setIsForumOpen(true);
    window.history.pushState({ page: 'forum' }, '', '/forumtamzai');
  };

  const handleOpenGarden = () => {
    setSelectedBotId(null);
    setIsForumOpen(false);
    setIsGardenOpen(true);
    window.history.pushState({ page: 'garden' }, '', '/meimeigarden');
  };

  const handleBackToHome = () => {
    setSelectedBotId(null);
    setIsForumOpen(false);
    setIsGardenOpen(false);
    window.history.pushState(null, '', '/');
  };

  const handleBackToGate = () => {
    setSelectedBotId(null);
    setIsForumOpen(false);
    setIsGardenOpen(false);
    setIsAuthenticated(false);
    window.history.pushState(null, '', '/');
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full font-sans overflow-hidden flex flex-col relative selection:bg-zinc-500/30 selection:text-white bg-[#0a0a0a]">
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-500/10 blur-3xl pointer-events-none"></div>
        <GuidelinesAuth onSuccess={handleAuthenticated} />
        <Particles density="portal" className="z-[80]" />
        <HeartTrail />
      </div>
    );
  }

  return (
    <div className="h-screen w-full font-sans overflow-hidden flex flex-col relative selection:bg-zinc-500/30 selection:text-white">
      {/* Background Decorators */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-500/10 blur-3xl pointer-events-none"></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedBotId ? (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full w-full">
              <BotProfile botId={selectedBotId} onBack={() => handleSelectBot(null)} />
            </motion.div>
          ) : isForumOpen ? (
            <motion.div key="forum" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="h-full w-full">
              <ForumTamZai onBack={handleBackToHome} />
            </motion.div>
          ) : isGardenOpen ? (
            <motion.div key="garden" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="h-full w-full">
              <MeiMeiGarden onBack={handleBackToHome} currentUser={currentUser} />
            </motion.div>
          ) : (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full overflow-y-auto w-full">
              <Home 
                onSelectBot={handleSelectBot} 
                onOpenForum={handleOpenForum} 
                onOpenGarden={handleOpenGarden} 
                onBackToGate={handleBackToGate} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lớp sao rơi của web chính - Tự động ẩn khi vào route vườn meimeigarden và khôi phục khi về trang chủ */}
      {!isGardenOpen && <Particles density="normal" className="z-[80]" />}
      {!selectedBotId && !isForumOpen && !isGardenOpen && <RandomHusbandWidget onSelectBot={handleSelectBot} />}
      <MusicPlayer />
      <HeartTrail />
    </div>
  );
}