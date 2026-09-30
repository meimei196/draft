import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
    localCache: isBrowser
      ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      : memoryLocalCache(),
  },
  (firebaseConfig as any).firestoreDatabaseId || '(default)'
);
export const auth = getAuth(app);

// Automatically sign in anonymously immediately on load if not signed in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((err) => {
      console.warn("Auto anonymous sign-in warning:", err);
    });
  }
});
