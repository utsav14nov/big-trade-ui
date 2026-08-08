import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { C } from '../lib/theme';

export default function Shell() {
  const { user, logout } = useAuth();
  const tabs = [['/', 'Trade book'], ['/brokerage', 'Brokerage & collection'], ['/analytics', 'Analytics']];

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: 'system-ui, sans-serif', color: C.ink }}>
      <div style={{ background: C.ink, color: C.paper, borderBottom: `3px solid ${C.gold}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>🥜</span>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 19 }}>Mandi Ledger</div>
              <div style={{ fontSize: 10.5, color: C.shell, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Groundnut brokerage book</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: C.shell }}>{user?.username} · {user?.role}</span>
            <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${C.husk}`, color: C.shell, padding: '7px 12px', borderRadius: 3, cursor: 'pointer', fontSize: 12.5 }}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 18px', display: 'flex', gap: 4 }}>
          {tabs.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                padding: '14px 16px', textDecoration: 'none', fontSize: 14,
                color: isActive ? C.ink : C.muted, fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? `3px solid ${C.husk}` : '3px solid transparent',
              })}>{label}</NavLink>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 18px 60px' }}>
        <Outlet />
      </div>
    </div>
  );
}
