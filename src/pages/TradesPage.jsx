import { useState, useEffect, useCallback } from 'react';
import { tradesApi } from '../api/client';
import { C, fmtINR } from '../lib/theme';
import { KPI, KPIGrid, Pill, btnPrimary, btnGhost, inp } from '../components/ui';
import TradeForm from '../components/TradeForm';

export default function TradesPage() {
  const [trades, setTrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // trade | 'new' | null
  const [filters, setFilters] = useState({ q: '', date_from: '', date_to: '', status: '', category: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, page_size: 200 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await tradesApi.list(params);
      setTrades(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const onSaved = () => { setEditing(null); load(); };

  const active = trades.filter((t) => t.status !== 'cancelled');
  const totalVal = active.reduce((s, t) => s + Number(t.trade_value || 0), 0);
  const totalQty = active.reduce((s, t) => s + Number(t.quantity_tonnes || 0), 0);
  const totalBrok = active.reduce((s, t) => s + Number(t.brokerage_total || 0), 0);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const td = { padding: '10px 12px', verticalAlign: 'top' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, margin: 0 }}>Trade book</h2>
        <button onClick={() => setEditing('new')} style={btnPrimary}>+ Add trade</button>
      </div>

      <KPIGrid>
        <KPI label="Trades shown" value={total} sub={`${active.length} active on page`} />
        <KPI label="Total value (page)" value={fmtINR(totalVal)} accent />
        <KPI label="Total quantity" value={totalQty.toFixed(1) + ' t'} sub={(totalQty * 10).toFixed(0) + ' qtl'} />
        <KPI label="Brokerage (page)" value={fmtINR(totalBrok)} accent2 />
      </KPIGrid>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 200px' }}>
          <Lbl>Search party</Lbl>
          <input value={filters.q} onChange={(e) => set('q', e.target.value)} placeholder="e.g. Verma, Varanasi" style={inp} />
        </div>
        <div style={{ flex: '1 1 130px' }}><Lbl>From date</Lbl><input type="date" value={filters.date_from} onChange={(e) => set('date_from', e.target.value)} style={inp} /></div>
        <div style={{ flex: '1 1 130px' }}><Lbl>To date</Lbl><input type="date" value={filters.date_to} onChange={(e) => set('date_to', e.target.value)} style={inp} /></div>
        <div style={{ flex: '1 1 120px' }}><Lbl>Status</Lbl>
          <select value={filters.status} onChange={(e) => set('status', e.target.value)} style={inp}>
            <option value="">All</option><option value="active">Active</option><option value="cancelled">Cancelled</option>
          </select></div>
        <div style={{ flex: '1 1 120px' }}><Lbl>Category</Lbl>
          <select value={filters.category} onChange={(e) => set('category', e.target.value)} style={inp}>
            <option value="">All</option><option value="Sortex">Sortex</option><option value="Non-Sortex">Non-Sortex</option>
          </select></div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#F0E7D6', textAlign: 'left' }}>
              {['Date', 'From', 'To', 'Qty', 'Rate', 'Value', 'Brokerage', 'Cat', 'Status', ''].map((h, i) =>
                <th key={i} style={{ padding: '11px 12px', fontWeight: 600, color: C.husk, whiteSpace: 'nowrap', borderBottom: `1px solid ${C.line}` }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {trades.map((t) => {
                const cancelled = t.status === 'cancelled';
                return (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${C.paper}`, opacity: cancelled ? 0.5 : 1 }}>
                    <td style={{ ...td, whiteSpace: 'nowrap', textDecoration: cancelled ? 'line-through' : 'none' }}>{fmtDate(t.trade_date)}</td>
                    <td style={td}><div style={{ fontWeight: 500 }}>{t.from_party?.name}</div>{t.from_party?.location && <div style={{ fontSize: 11, color: C.muted }}>{t.from_party.location}</div>}</td>
                    <td style={td}><div style={{ fontWeight: 500 }}>{t.to_party?.name}</div>{t.to_party?.location && <div style={{ fontSize: 11, color: C.muted }}>{t.to_party.location}</div>}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{t.quantity_text || (t.quantity_tonnes + ' t')}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{t.rate_per_kg ? '₹' + t.rate_per_kg : '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtINR(t.trade_value)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: C.sprout }}>{fmtINR(t.brokerage_total)}</td>
                    <td style={td}>{t.category ? <Pill text={t.category} color={t.category === 'Sortex' ? C.sprout : C.husk} /> : <span style={{ color: C.muted }}>—</span>}</td>
                    <td style={td}>{cancelled ? <Pill text="Cancelled" color={C.clay} /> :
                      <div style={{ display: 'flex', gap: 4 }}>
                        {t.payment_collected && <Pill text="Paid" color={C.sprout} />}
                        {t.brokerage_collected && <Pill text="Brok✓" color={C.gold} />}
                        {!t.payment_collected && !t.brokerage_collected && <Pill text="Open" color={C.muted} />}
                      </div>}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}><button onClick={() => setEditing(t)} style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.husk, padding: '5px 11px', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && <div style={{ padding: 30, textAlign: 'center', color: C.muted }}>Loading…</div>}
        {!loading && trades.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No trades match. Adjust filters or add one.</div>}
      </div>

      {editing && <TradeForm trade={editing === 'new' ? null : editing} onSaved={onSaved} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Lbl({ children }) { return <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{children}</div>; }
function fmtDate(iso) { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y.slice(2)}`; }
