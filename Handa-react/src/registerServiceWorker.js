export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    });

    return;
  }

  // Do not let an old production service worker interfere with Vite dev mode.
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      const workerUrls = [
        registration.active?.scriptURL,
        registration.waiting?.scriptURL,
        registration.installing?.scriptURL,
      ].filter(Boolean);

      if (workerUrls.some((url) => new URL(url).pathname.endsWith('/service-worker.js'))) {
        registration.unregister();
      }
    });
  }).catch((error) => {
    console.warn('Could not clean up the development service worker:', error);
  });
}
