import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { configureApi } from '@tedoku/shared';
import './styles.css';
import App from './App';

const apiUrl = import.meta.env.VITE_API_URL;
configureApi({
  baseUrl: apiUrl ?? '',
  // Placeholder data until VITE_API_URL points at the backend.
  useMocks: !apiUrl,
  getToken: () => localStorage.getItem('tedoku.admin.token'),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
