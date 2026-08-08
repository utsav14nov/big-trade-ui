import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { C } from './lib/theme';
import Login from './pages/Login';
import Shell from './components/Shell';
import TradesPage from './pages/TradesPage';
import BrokeragePage from './pages/BrokeragePage';
import AnalyticsPage from './pages/AnalyticsPage';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontFamily: 'system-ui' }}>
      Loading your book…
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={loading ? <Splash /> : user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Protected><Shell /></Protected>}>
        <Route index element={<TradesPage />} />
        <Route path="brokerage" element={<BrokeragePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
