import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register Service Worker for PWA (vite-plugin-pwa virtual module)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // vite-plugin-pwa registers SW automatically via virtual:registerSW
    // This is handled by the plugin, but we can also do manual registration if needed
  });
}

// Install prompt handling
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e: any) => {
  e.preventDefault();
  deferredPrompt = e;
  // Could show custom install banner here
  console.log('PWA install prompt available');
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
