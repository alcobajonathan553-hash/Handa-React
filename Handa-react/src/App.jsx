import React, { useEffect, useState } from 'react';

import LoginPage from './components/LoginPage.jsx';
import { auth, googleProvider, db } from './components/firebase.js';

import Display from './pages/Display.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import {
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  // Internet connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firebase authentication + Firestore role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (!currentUser) {
            setUser(null);
            setRole(null);
            setLoading(false);
            return;
          }

          const userRef = doc(
            db,
            'users',
            currentUser.uid
          );

          const userSnap = await getDoc(userRef);

          let profileData;

          if (userSnap.exists()) {
            profileData = userSnap.data();

            // ONLY resident and admin are valid roles.
            // If the existing role is invalid/missing,
            // default to resident.
            const firestoreRole =
              profileData.role === 'admin' ||
              profileData.role === 'resident'
                ? profileData.role
                : 'resident';

            if (profileData.role !== firestoreRole) {
              await updateDoc(userRef, {
                role: firestoreRole
              });

              profileData = {
                ...profileData,
                role: firestoreRole
              };
            }
          } else {
            // New account = resident by default
            profileData = {
              name:
                currentUser.displayName ||
                currentUser.email?.split('@')[0] ||
                'Resident',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              barangay: 'B. Del Mundo',
              role: 'resident',
              createdAt: serverTimestamp()
            };

            await setDoc(userRef, profileData);
          }

          const currentRole =
            profileData.role === 'admin'
              ? 'admin'
              : 'resident';

          // Combine Firebase Auth data + Firestore profile
          const appUser = {
            uid: currentUser.uid,
            email:
              profileData.email ||
              currentUser.email ||
              '',
            name:
              profileData.name ||
              profileData.displayName ||
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              'User',
            displayName:
              profileData.displayName ||
              currentUser.displayName ||
              profileData.name ||
              '',
            photoURL:
              profileData.photoURL ||
              currentUser.photoURL ||
              '',
            barangay:
              profileData.barangay ||
              'B. Del Mundo',
            role: currentRole
          };

          setUser(appUser);
          setRole(currentRole);
        } catch (error) {
          console.error(
            'Error loading authentication/profile:',
            error
          );

          setUser(null);
          setRole(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Google login
  const handleLogin = async () => {
    try {
      await signInWithPopup(
        auth,
        googleProvider
      );

      /*
        IMPORTANT:
        Do NOT create/update the Firestore role here.

        App.jsx will read the existing role from:
        users/{uid}

        Therefore:
        resident stays resident
        admin stays admin
      */
    } catch (error) {
      console.error(
        'Google login failed:',
        error
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setRole(null);
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      );
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-success mb-3"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <h5 className="fw-bold">
            Loading Application...
          </h5>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-vh-100">

        {!user ? (
          <LoginPage
            onLogin={handleLogin}
            isOnline={isOnline}
          />
        ) : (
          <Routes>

            {/* LANDING PAGE */}
            <Route
              path="/"
              element={
                <LandingPage
                  user={user}
                  role={role}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  isOnline={isOnline}
                />
              }
            />

            {/* RESIDENT DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                role === 'resident' ? (
                  <Dashboard
                    user={user}
                    onLogout={handleLogout}
                    isOnline={isOnline}
                  />
                ) : (
                  <Navigate
                    to="/"
                    replace
                  />
                )
              }
            />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/display"
              element={
                role === 'admin' ? (
                  <Display
                    user={user}
                    role={role}
                  />
                ) : (
                  <Navigate
                    to="/"
                    replace
                  />
                )
              }
            />

            {/* UNKNOWN ROUTE */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        )}

      </div>
    </BrowserRouter>
  );
}