// Helper to register service worker for PWA functionality
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && (import.meta.env.PROD || true)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}
