import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// Firebase error codes turned into Tagalog messages the user can understand.
function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Mukhang mali ang format ng email.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Mali ang email o password.';
    case 'auth/email-already-in-use':
      return 'May account na sa email na iyan.';
    case 'auth/weak-password':
      return 'Kailangan ay hindi bababa sa 6 na karakter ang password.';
    case 'auth/too-many-requests':
      return 'Masyadong maraming subok. Maghintay muna sandali.';
    case 'auth/network-request-failed':
      return 'Walang koneksyon sa internet. Kailangan ng signal para mag-log in sa bagong account.';
    case 'auth/popup-closed-by-user':
      return 'Nasara ang Google sign-in bago matapos.';
    default:
      return 'May problema sa pag-log in. Subukan ulit.';
  }
}

export default function LoginPage({ onBack, isOnline }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
  };

  // App.jsx listens to onAuthStateChanged, so a successful sign-in
  // moves the user to the dashboard on its own. No onLogin call needed.
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name || email.split('@')[0] });

        // Matching profile document, so the app can read the user's
        // name, barangay and role without touching Auth.
        await setDoc(doc(db, 'users', credential.user.uid), {
          name: name || email.split('@')[0],
          email,
          barangay: 'B. Del Mundo',
          role: 'resident',
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setNotice('');
    setGoogleLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          name: credential.user.displayName || '',
          email: credential.user.email || '',
          role: 'resident',
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError('Ilagay muna ang email para makapagpadala ng reset link.');
      return;
    }
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice('Nagpadala kami ng reset link sa email mo.');
    } catch (err) {
      setError(friendlyError(err.code));
    }
  }

  const busy = loading || googleLoading;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '420px', width: '100%' }}>

        {/* header */}
        <div className="bg-ready-green text-white text-center p-4 position-relative">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn btn-sm btn-link text-white position-absolute top-0 start-0 m-2 text-decoration-none"
            >
              <i className="bi bi-arrow-left"></i> Bumalik
            </button>
          )}
          <div className="d-flex justify-content-center align-items-center gap-2 mb-1 pt-2">
            <i className="bi bi-shield-check fs-2"></i>
            <h3 className="m-0 fw-bold">Handa</h3>
          </div>
          <p className="m-0 text-white-50 small">Disaster Preparedness Guide</p>
        </div>

        {/* live connection status */}
        <div
          className={`d-flex align-items-center justify-content-center gap-2 small fw-semibold py-2 text-center ${
            isOnline ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-25 text-dark'
          }`}
        >
          <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'}`}></i>
          {isOnline ? 'Konektado sa internet' : 'Offline — kailangan ng signal para mag-log in'}
        </div>

        <div className="card-body p-4 p-sm-5">
          {error && (
            <div className="alert alert-danger py-2 small rounded-3 mb-3 text-center" role="alert">
              <i className="bi bi-exclamation-circle me-1"></i> {error}
            </div>
          )}
          {notice && (
            <div className="alert alert-success py-2 small rounded-3 mb-3 text-center" role="status">
              <i className="bi bi-check-circle me-1"></i> {notice}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="mb-3">
                <label className="form-label fw-semibold small text-secondary" htmlFor="handa-name">
                  Buong Pangalan
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border-end-0">
                    <i className="bi bi-person-badge"></i>
                  </span>
                  <input
                    id="handa-name"
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary" htmlFor="handa-email">
                Email
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  id="handa-email"
                  type="email"
                  autoComplete="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="juan@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary" htmlFor="handa-password">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  id="handa-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="form-control border-start-0 ps-0"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Itago ang password' : 'Ipakita ang password'}
                  disabled={busy}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-end mb-3">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none text-ready-green"
                  onClick={handleResetPassword}
                  disabled={busy}
                >
                  Nakalimutan ang password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-ready w-100 py-2 fw-bold rounded-3 shadow-sm mb-2"
              disabled={busy}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sandali lang...
                </>
              ) : mode === 'login' ? 'Log In' : 'Gumawa ng Account'}
            </button>
          </form>

          <div className="d-flex align-items-center gap-2 my-3">
            <hr className="flex-grow-1 m-0" />
            <span className="text-secondary small">o</span>
            <hr className="flex-grow-1 m-0" />
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleLogin}
            disabled={busy}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width="20"
              height="20"
            />
            {googleLoading ? 'Sandali lang...' : 'Magpatuloy gamit ang Google'}
          </button>

          <p className="text-center text-secondary small mt-4 mb-0">
            {mode === 'login' ? 'Wala pang account? ' : 'May account na? '}
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold text-ready-green"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              disabled={busy}
            >
              {mode === 'login' ? 'Mag-sign up' : 'Mag-log in'}
            </button>
          </p>
        </div>

        <div className="card-footer bg-white border-0 text-center pb-4 pt-0">
          <small className="text-muted">Official Emergency Safety Portal</small>
        </div>

      </div>
    </div>
  );
}
