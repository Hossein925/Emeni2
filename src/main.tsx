import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadStoredAppIcon } from './utils/appIconHelper';

// Initialize stored custom app icon and PWA manifest
loadStoredAppIcon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
