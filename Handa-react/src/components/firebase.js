import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBXg4ZuZR_y2r-fpzMt8-Lf9LD3zGKVYAA',
  authDomain: 'disaster-firebase-bfa1c.firebaseapp.com',
  projectId: 'disaster-firebase-bfa1c',
  storageBucket: 'disaster-firebase-bfa1c.firebasestorage.app',
  messagingSenderId: '848246382415',
  appId: '1:848246382415:web:15fb3a298661b12768af3a',
  measurementId: 'G-FV24NCG1HY',
};

const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Keep the session on the device. This is what lets a user who already logged
// in stay logged in during a brownout or when the signal drops.
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Could not set auth persistence:', error);
});

// Firestore with a persistent offline cache, so saved guides and checklists
// still load with no internet.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
