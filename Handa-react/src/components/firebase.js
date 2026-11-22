import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

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

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Could not set auth persistence:', error);
});

export default app;
