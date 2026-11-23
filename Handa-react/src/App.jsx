import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage.jsx';
import { auth, googleProvider } from './components/firebase.js';
import Display from './pages/Display.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '')).replace(/\/$/, '');

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setProfileError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setProfileError('');

      try {
        if (!API_BASE_URL) {
          throw new Error('Production API URL is not configured. Set VITE_API_URL in your Netlify environment variables to the public URL of the Handa backend, then redeploy the frontend.');
        }

        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Resident',
            photoURL: currentUser.photoURL || ''
          })
        });

        const profile = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(profile.message || `Profile API failed (HTTP ${response.status}). Check the backend URL, CORS, Firebase Admin credentials, and MySQL connection.`);
        }

        const currentRole = profile.role === 'admin' ? 'admin' : 'resident';
        setUser({
          uid: currentUser.uid,
          email: profile.email || currentUser.email || '',
          name: profile.name || currentUser.displayName || 'User',
          displayName: profile.name || currentUser.displayName || '',
          photoURL: profile.photo_url || currentUser.photoURL || '',
          barangay: profile.barangay || 'B. Del Mundo',
          role: currentRole
        });
        setRole(currentRole);
      } catch (error) {
        console.error('Error loading MySQL profile:', error);
        setUser(null);
        setRole(null);
        setProfileError(error.message || 'Unable to connect to the Handa database.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setProfileError('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="fw-bold">Loading Application...</h5>
        </div>
      </div>
    );
  }

  if (profileError && auth.currentUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ maxWidth: 520 }}>
          <div className="text-danger fs-1 mb-2"><i className="bi bi-database-exclamation" /></div>
          <h4 className="fw-bold">Database connection required</h4>
          <p className="text-secondary">Your Firebase account is signed in, but Handa could not load your MySQL profile.</p>
          <div className="alert alert-warning">{profileError}</div>
          <p className="small text-secondary">For local testing, start XAMPP MySQL and the Handa backend. For the deployed website, VITE_API_URL must point to a publicly hosted backend connected to a hosted MySQL database. A deployed website cannot connect to localhost on your computer.</p>
          <button className="btn btn-success" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-vh-100">
        {!user ? (
          <LoginPage onLogin={handleLogin} isOnline={isOnline} />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to={role === 'admin' ? '/display' : '/dashboard'} replace />} />
            <Route path="/home" element={<LandingPage user={user} role={role} onLogin={handleLogin} onLogout={handleLogout} isOnline={isOnline} />} />
            <Route path="/dashboard" element={role === 'resident' ? <Dashboard user={user} onLogout={handleLogout} isOnline={isOnline} /> : <Navigate to="/" replace />} />
            <Route path="/display" element={role === 'admin' ? <Display user={user} role={role} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}
