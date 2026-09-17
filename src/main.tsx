import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline capability
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    if (r) {
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000); // Check updates every hour
    }
  },
  onOfflineReady() {
    console.log('App pronta per l\'uso offline!');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

