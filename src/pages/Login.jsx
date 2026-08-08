import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { C } from '../lib/theme';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(u.trim(), p);
      nav('/', { replace: true });
    } catch (ex) {
      const status = ex.response?.status;
      setErr(status === 423 ? 'Account is temporarily locked after several failed attempts. Try again in a few minutes.'
        : 'Invalid username or password.');
    } finally {
      setBusy(false);
    }
  };

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 4, border: `1px solid ${C.line}`, fontSize: 14, boxSizing: 'border-box', fontFamily: 'system-ui' };

  return (
    <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 380, background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, padding: '40px 34px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 34 }}>🥜</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: C.ink, margin: '14px 0 2px' }}>Mandi Ledger</h1>
          <div style={{ fontSize: 12.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'system-ui' }}>Groundnut brokerage book</div>
        </div>
        <label style={{ fontSize: 12, color: C.muted, fontFamily: 'system-ui' }}>Username</label>
        <input value={u} onChange={(e) => setU(e.target.value)} autoFocus style={{ ...inp, margin: '4px 0 14px' }} />
        <label style={{ fontSize: 12, color: C.muted, fontFamily: 'system-ui' }}>Password</label>
        <input type="password" value={p} onChange={(e) => setP(e.target.value)} style={{ ...inp, margin: '4px 0 14px' }} />
        {err && <div style={{ color: C.clay, fontSize: 12.5, marginBottom: 12, fontFamily: 'system-ui' }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ width: '100%', background: C.husk, color: C.paper, border: 'none', padding: '11px', borderRadius: 4, cursor: busy ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'system-ui', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Signing in…' : 'Open the book'}
        </button>
      </form>
    </div>
  );
}
