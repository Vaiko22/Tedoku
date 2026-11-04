import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/Overview';
import { VerificationPage } from './pages/Verification';
import { ProvidersPage } from './pages/Providers';
import { EscrowPage } from './pages/Escrow';
import { DisputesPage } from './pages/Disputes';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OverviewPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="escrow" element={<EscrowPage />} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
