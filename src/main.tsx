import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for offline PWA & Android installation
if ('serviceWorker' in navigator && !window.location.host.includes('localhost:3000')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('ServiceWorker registered:', reg.scope))
      .catch((err) => console.log('ServiceWorker registration error:', err));
  });
}

createRoot(document.getElementById('root')!).render(<App />);

