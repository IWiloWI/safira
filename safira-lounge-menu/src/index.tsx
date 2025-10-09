import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './styles/globalNeonStyles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for instant loads and offline support
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('App installed and ready for offline use');
  },
  onUpdate: (registration) => {
    console.log('New version available');
    // Auto-update in background
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
});

reportWebVitals();