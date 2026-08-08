import { useState, useEffect, useCallback } from 'react';
import { tradesApi } from '../api/client';
import { C, fmtINR, fmtFull } from '../lib/theme';
import { KPI, KPIGrid, Toggle, chip, chipActive } from '../components/ui';

export default function BrokeragePage() {
  const [trades, setTrades] = useState([]);
  const [f, setF] = useState('open');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await tradesApi.list({ status: 'active', page_size: 200 });
      setTrades(data.items);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (id, changes) => {
    setTrades((prev) => prev.map((t) => t.id === id ? { ...t, ...changes } : t)); // optimistic
    try { await tradesApi.update(id, changes); } catch { load(); }
  };

  const rows = trades.filter((t) => {
    if (f === 'open') return !t.payment_collected || !t.brokerage_collected;
    if (f === 'paid') return t.payment_collected;
    if (f === 'brokdone') return t.brokerage_collected;
    return true;
  });

  const totalBrok = trades.reduce((s, t) => s + Number(t.brokerage_total || 0), 0);
  const collected = trades.filter((t) => t.brokerage_collected).reduce((s, t) => s + Number(t.brokerage_total || 0), 0);
  const pendingPay = trades.filter((t) => !t.payment_collected).length;
  const td = { padding: '10px 12px' };

  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, margin: '0 0 16px' }}>Brokerage & collection</h2>
      <KPIGrid>
        <KPI label="Total brokerage" value={fmtINR(totalBrok)} sub="both sides, active" accent2 />
        <KPI label="Collected" value={fmtINR(collected)} sub={`${((collected / (totalBrok || 1)) * 100).toFixed(0)}% of total`} accent />
        <KPI label="Pending" value={fmtINR(totalBrok - collected)} />
        <KPI label="Payments pending" value={pendingPay} sub="trades unpaid" />
      </KPIGrid>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['open', 'Needs action'], ['paid', 'Payment collected'], ['brokdone', 'Brokerage collected'], ['all', 'All active']].map(([k, l]) =>
          <button key={k} onClick={() => setF(k)} style={f === k ? chipActive : chip}>{l}</button>)}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#F0E7D6', textAlign: 'left' }}>
              {['Date', 'From → To', 'Value', 'Brokerage', 'Payment', 'Brokerage'].map((h, i) =>
                <th key={i} style={{ padding: '11px 12px', fontWeight: 600, color: C.husk, whiteSpace: 'nowrap', borderBottom: `1px solid ${C.line}` }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.paper}` }}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtDate(t.trade_date)}</td>
                  <td style={td}><b>{t.from_party?.name}</b> <span style={{ color: C.muted }}>→</span> {t.to_party?.name}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtINR(t.trade_value)}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: C.sprout }}>{fmtFull(t.brokerage_total)}</td>
                  <td style={td}><Toggle on={t.payment_collected} onLabel="Collected" offLabel="Mark paid" color={C.sprout} onClick={() => patch(t.id, { payment_collected: !t.payment_collected })} /></td>
                  <td style={td}><Toggle on={t.brokerage_collected} onLabel="Collected" offLabel="Mark collected" color={C.gold} onClick={() => patch(t.id, { brokerage_collected: !t.brokerage_collected })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div style={{ padding: 30, textAlign: 'center', color: C.muted }}>Loading…</div>}
        {!loading && rows.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Nothing here — everything in this view is settled.</div>}
      </div>
    </div>
  );
}
function fmtDate(iso) { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y.slice(2)}`; }
