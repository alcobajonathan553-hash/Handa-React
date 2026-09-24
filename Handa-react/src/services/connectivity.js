/**
 * Connectivity helper.
 *
 * navigator.onLine only says there is a wifi/data connection, not that the
 * internet actually works — a common false positive on a weak signal. This
 * confirms by requesting a small local file.
 */
export async function checkConnection() {
  if (!navigator.onLine) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch(`/favicon.svg?ping=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

/** Maps a Firebase user object to the shape the rest of the app expects. */
export function toAppUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
  };
}
