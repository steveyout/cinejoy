import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA support & offline performance
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Popcorn PWA ServiceWorker active:', registration.scope);
      })
      .catch((err) => {
        console.warn('Popcorn PWA ServiceWorker registration failed:', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // In development, also register service worker for testing PWA capabilities
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
