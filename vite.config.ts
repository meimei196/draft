import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

function setupApiMiddlewares(middlewares: any) {
  // 1. Pinned Post
  middlewares.use('/api/backup-pinned-post', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const filePath = path.resolve(__dirname, 'src/data/pinnedPostBackup.json');
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 2. Atomic Toggle Bot Like (PC incognito, mobile, normal PC all sync to this source of truth)
  middlewares.use('/api/toggle-bot-like', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const { botId, delta, username } = JSON.parse(body);
          if (!botId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'botId required' }));
            return;
          }

          const statsPath = path.resolve(__dirname, 'src/data/botStatsBackup.json');
          let stats: Record<string, { chatCount: number; likesCount: number }> = {};
          try {
            if (fs.existsSync(statsPath)) {
              stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
            }
          } catch {}

          const currentLikes = typeof stats[botId]?.likesCount === 'number' ? stats[botId].likesCount : 0;
          const currentChats = typeof stats[botId]?.chatCount === 'number' ? stats[botId].chatCount : 0;
          const change = typeof delta === 'number' ? delta : 1;
          const newLikes = Math.max(0, currentLikes + change);

          stats[botId] = {
            chatCount: currentChats,
            likesCount: newLikes,
          };

          fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');

          // If username is supplied, also update user account likedBots
          let finalLikedList: string[] = [];
          if (username) {
            try {
              const userPath = path.resolve(__dirname, 'src/data/userAccountsBackup.json');
              let accounts: Record<string, any> = {};
              if (fs.existsSync(userPath)) {
                accounts = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
              }
              const targetKey = (username === 'admin_meimei') ? 'meinguyen18' : username;
              const userAcc = accounts[targetKey] || { username: targetKey, likedBots: [] };
              let likedList: string[] = Array.isArray(userAcc.likedBots) ? userAcc.likedBots : [];
              if (change > 0) {
                if (!likedList.includes(botId)) {
                  likedList.push(botId);
                }
              } else {
                likedList = likedList.filter((id) => id !== botId);
              }
              userAcc.likedBots = likedList;
              userAcc.updatedAt = Date.now();
              accounts[targetKey] = userAcc;
              if (targetKey === 'meinguyen18') {
                accounts['admin_meimei'] = { ...userAcc, username: 'admin_meimei' };
              }
              finalLikedList = likedList;
              fs.writeFileSync(userPath, JSON.stringify(accounts, null, 2), 'utf-8');
            } catch (err) {
              console.error('Error updating user likedBots on disk:', err);
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, botId, likesCount: newLikes, stats, likedBots: finalLikedList }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 3. Backup Bot Stats (safe merge: never overwrites with lower likesCount)
  middlewares.use('/api/backup-bot-stats', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body);
          const filePath = path.resolve(__dirname, 'src/data/botStatsBackup.json');
          let existing: Record<string, any> = {};
          try {
            if (fs.existsSync(filePath)) {
              existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }
          } catch {}

          const merged: Record<string, any> = { ...existing };
          if (incoming && typeof incoming === 'object') {
            for (const [id, stat] of Object.entries(incoming as Record<string, any>)) {
              if (!merged[id]) {
                merged[id] = stat;
              } else {
                // Ensure like count does not regress due to stale browser cache
                merged[id] = {
                  chatCount: Math.max(merged[id].chatCount || 0, stat?.chatCount || 0),
                  likesCount: Math.max(merged[id].likesCount || 0, stat?.likesCount || 0),
                };
              }
            }
          }

          fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, stats: merged }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 4. Get Bot Stats (with anti-cache headers)
  middlewares.use('/api/get-bot-stats', (_req: any, res: any) => {
    try {
      const filePath = path.resolve(__dirname, 'src/data/botStatsBackup.json');
      const data = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '{}';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.end(data);
    } catch (e) {
      res.statusCode = 500;
      res.end('{}');
    }
  });

  // 5. Backup User Account
  middlewares.use('/api/backup-user-account', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body);
          if (incoming.username) {
            const filePath = path.resolve(__dirname, 'src/data/userAccountsBackup.json');
            let accounts: Record<string, any> = {};
            try {
              if (fs.existsSync(filePath)) {
                accounts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              }
            } catch {}
            accounts[incoming.username] = {
              ...(accounts[incoming.username] || {}),
              ...incoming,
            };
            fs.writeFileSync(filePath, JSON.stringify(accounts, null, 2), 'utf-8');
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 6. Get User Account
  middlewares.use('/api/get-user-account', (req: any, res: any) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      let username = url.searchParams.get('username') || '';
      if (username === 'admin_meimei') username = 'meinguyen18';
      const filePath = path.resolve(__dirname, 'src/data/userAccountsBackup.json');
      const accounts = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {};
      const userAccount = username ? (accounts[username] || accounts['meinguyen18'] || null) : null;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.end(JSON.stringify(userAccount));
    } catch (e) {
      res.statusCode = 500;
      res.end('null');
    }
  });

  // 7. React to Forum Post (persists reaction to server disk atomically)
  middlewares.use('/api/react-forum-post', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const { postId, userId, reactionType, reactions, userReactions } = JSON.parse(body);
          if (!postId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'postId required' }));
            return;
          }

          function updateTargetPost(p: any) {
            if (p.id !== postId) return p;
            if (!p.reactions) p.reactions = { heart: 0, haha: 0, sad: 0, boom: 0, wow: 0 };
            if (!p.userReactions) p.userReactions = {};

            if (reactions && userReactions) {
              p.reactions = reactions;
              p.userReactions = userReactions;
            } else if (userId) {
              const oldType = p.userReactions[userId];
              if (oldType && p.reactions[oldType] !== undefined) {
                p.reactions[oldType] = Math.max(0, (p.reactions[oldType] || 1) - 1);
                delete p.userReactions[userId];
              }
              if (reactionType) {
                p.reactions[reactionType] = (p.reactions[reactionType] || 0) + 1;
                p.userReactions[userId] = reactionType;
              }
            } else if (reactions) {
              p.reactions = reactions;
              if (userReactions) p.userReactions = { ...p.userReactions, ...userReactions };
            }
            return p;
          }

          let updatedPost: any = null;

          // Check pinned post
          const pinnedPath = path.resolve(__dirname, 'src/data/pinnedPostBackup.json');
          if (fs.existsSync(pinnedPath)) {
            try {
              let pinnedList = JSON.parse(fs.readFileSync(pinnedPath, 'utf-8'));
              if (Array.isArray(pinnedList)) {
                let updated = false;
                pinnedList = pinnedList.map((p: any) => {
                  if (p.id === postId) {
                    updated = true;
                    const res = updateTargetPost(p);
                    updatedPost = res;
                    return res;
                  }
                  return p;
                });
                if (updated) {
                  fs.writeFileSync(pinnedPath, JSON.stringify(pinnedList, null, 2), 'utf-8');
                }
              }
            } catch {}
          }

          // Check forum posts
          const postsPath = path.resolve(__dirname, 'src/data/forumPostsBackup.json');
          if (fs.existsSync(postsPath)) {
            try {
              let postsList = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
              if (Array.isArray(postsList)) {
                let updated = false;
                postsList = postsList.map((p: any) => {
                  if (p.id === postId) {
                    updated = true;
                    const res = updateTargetPost(p);
                    updatedPost = res;
                    return res;
                  }
                  return p;
                });
                if (updated) {
                  fs.writeFileSync(postsPath, JSON.stringify(postsList, null, 2), 'utf-8');
                }
              }
            } catch {}
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, post: updatedPost }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 8. Backup Forum Post
  middlewares.use('/api/backup-forum-post', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const newPost = JSON.parse(body);
          if (newPost && newPost.id) {
            const postsPath = path.resolve(__dirname, 'src/data/forumPostsBackup.json');
            let posts: any[] = [];
            if (fs.existsSync(postsPath)) {
              try { posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8')); } catch {}
            }
            if (!Array.isArray(posts)) posts = [];
            const idx = posts.findIndex((p: any) => p.id === newPost.id);
            if (idx >= 0) {
              posts[idx] = { ...posts[idx], ...newPost };
            } else {
              posts.unshift(newPost);
            }
            fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf-8');
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 9. Get Forum Posts (merges pinned + regular forum posts from server disk)
  middlewares.use('/api/get-forum-posts', (_req: any, res: any) => {
    try {
      const pinnedPath = path.resolve(__dirname, 'src/data/pinnedPostBackup.json');
      const postsPath = path.resolve(__dirname, 'src/data/forumPostsBackup.json');
      let pinned: any[] = [];
      let regular: any[] = [];
      if (fs.existsSync(pinnedPath)) {
        try { pinned = JSON.parse(fs.readFileSync(pinnedPath, 'utf-8')); } catch {}
      }
      if (fs.existsSync(postsPath)) {
        try { regular = JSON.parse(fs.readFileSync(postsPath, 'utf-8')); } catch {}
      }
      const combined: any[] = [];
      const seen = new Set<string>();
      for (const p of [...(Array.isArray(pinned) ? pinned : []), ...(Array.isArray(regular) ? regular : [])]) {
        if (p && p.id && !seen.has(p.id)) {
          combined.push(p);
          seen.add(p.id);
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.end(JSON.stringify(combined));
    } catch (e) {
      res.statusCode = 500;
      res.end('[]');
    }
  });

  // 10. Backup Forum Comment (saves comment to server disk)
  middlewares.use('/api/backup-forum-comment', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const comment = JSON.parse(body);
          if (comment && comment.id) {
            const commentsPath = path.resolve(__dirname, 'src/data/forumCommentsBackup.json');
            let comments: any[] = [];
            if (fs.existsSync(commentsPath)) {
              try { comments = JSON.parse(fs.readFileSync(commentsPath, 'utf-8')); } catch {}
            }
            if (!Array.isArray(comments)) comments = [];
            const idx = comments.findIndex((c: any) => c.id === comment.id);
            if (idx >= 0) {
              comments[idx] = { ...comments[idx], ...comment };
            } else {
              comments.push(comment);
            }
            fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2), 'utf-8');
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 11. Get Forum Comments
  middlewares.use('/api/get-forum-comments', (_req: any, res: any) => {
    try {
      const commentsPath = path.resolve(__dirname, 'src/data/forumCommentsBackup.json');
      const data = fs.existsSync(commentsPath) ? fs.readFileSync(commentsPath, 'utf-8') : '[]';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.end(data);
    } catch (e) {
      res.statusCode = 500;
      res.end('[]');
    }
  });

  // 12. Backup Bot Comment
  middlewares.use('/api/backup-bot-comment', (req: any, res: any) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          const comment = JSON.parse(body);
          if (comment && comment.id) {
            const commentsPath = path.resolve(__dirname, 'src/data/botCommentsBackup.json');
            let comments: any[] = [];
            if (fs.existsSync(commentsPath)) {
              try { comments = JSON.parse(fs.readFileSync(commentsPath, 'utf-8')); } catch {}
            }
            if (!Array.isArray(comments)) comments = [];
            const idx = comments.findIndex((c: any) => c.id === comment.id);
            if (idx >= 0) {
              comments[idx] = { ...comments[idx], ...comment };
            } else {
              comments.push(comment);
            }
            fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2), 'utf-8');
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
  });

  // 13. Get Bot Comments
  middlewares.use('/api/get-bot-comments', (req: any, res: any) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      const botId = url.searchParams.get('botId');
      const commentsPath = path.resolve(__dirname, 'src/data/botCommentsBackup.json');
      const all: any[] = fs.existsSync(commentsPath) ? JSON.parse(fs.readFileSync(commentsPath, 'utf-8')) : [];
      const filtered = botId ? all.filter((c: any) => c.botId === botId) : all;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.end(JSON.stringify(filtered));
    } catch (e) {
      res.statusCode = 500;
      res.end('[]');
    }
  });
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'cloud-backup-apis',
        configureServer(server) {
          setupApiMiddlewares(server.middlewares);
        },
        configurePreviewServer(server) {
          setupApiMiddlewares(server.middlewares);
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
