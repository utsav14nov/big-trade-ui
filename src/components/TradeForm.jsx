import { useState } from 'react';
import { tradesApi } from '../api/client';
import { C, fmtFull } from '../lib/theme';
import { inp, btnPrimary, btnGhost } from './ui';

const OPTIONS = ['Naya katta', 'Machine silai', 'Branded', 'New gunny', 'Good condition', 'Old gunny', 'Old bag'];

export default function TradeForm({ trade, onSaved, onClose }) {
  const isEdit = !!trade;
  const [d, setD] = useState(() => trade ? {
    trade_date: trade.trade_date,
    from_party: trade.from_party?.name || '', to_party: trade.to_party?.name || '',
    commodity: trade.commodity, rate_per_kg: trade.rate_per_kg ?? '', quantity_tonnes: trade.quantity_tonnes ?? '',
    quantity_text: trade.quantity_text || '', count: trade.count || '', moisture: trade.moisture || '',
    loading_days: trade.loading_days || '', category: trade.category || '', dryer: trade.dryer || '',
    options: trade.options || [], cash_discount_pct: trade.cash_discount_pct ?? '',
    bsu: trade.brokerage_self_unit || 'per100', bsv: trade.brokerage_self_value ?? 50,
    bou: trade.brokerage_other_unit || 'per100', bov: trade.brokerage_other_value ?? 50,
    status: trade.status, payment_collected: trade.payment_collected, brokerage_collected: trade.brokerage_collected,
  } : {
    trade_date: new Date().toISOString().slice(0, 10), from_party: '', to_party: '', commodity: 'Groundnut',
    rate_per_kg: '', quantity_tonnes: '', quantity_text: '', count: '', moisture: '', loading_days: '',
    category: '', dryer: '', options: [], cash_discount_pct: '',
    bsu: 'per100', bsv: 50, bou: 'per100', bov: 50,
    status: 'active', payment_collected: false, brokerage_collected: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const toggle = (o) => setD((p) => ({ ...p, options: p.options.includes(o) ? p.options.filter((x) => x !== o) : [...p.options, o] }));

  const brokPreview = () => {
    const qty = parseFloat(d.quantity_tonnes); if (!qty) return 0;
    const kg = qty * 1000, v = parseFloat(d.bsv) || 0;
    if (d.bsu === 'pct') return (parseFloat(d.rate_per_kg) || 0) * kg * v / 100;
    if (d.bsu === 'per50') return kg / 50 * v;
    return kg / 100 * v;
  };

  const save = async () => {
    setErr(''); setBusy(true);
    try {
      const body = {
        trade_date: d.trade_date, from_party: d.from_party, to_party: d.to_party, commodity: d.commodity,
        rate_per_kg: d.rate_per_kg === '' ? null : Number(d.rate_per_kg),
        quantity_tonnes: d.quantity_tonnes === '' ? null : Number(d.quantity_tonnes),
        quantity_text: d.quantity_text || null, count: d.count || null, moisture: d.moisture || null,
        loading_days: d.loading_days || null, category: d.category || null, dryer: d.dryer || null,
        options: d.options, cash_discount_pct: d.cash_discount_pct === '' ? null : Number(d.cash_discount_pct),
        brokerage_self: { unit: d.bsu, value: Number(d.bsv) || 0 },
        brokerage_other: { unit: d.bou, value: Number(d.bov) || 0 },
      };
      if (isEdit) {
        await tradesApi.update(trade.id, { ...body, status: d.status, payment_collected: d.payment_collected, brokerage_collected: d.brokerage_collected });
      } else {
        await tradesApi.create(body);
      }
      onSaved();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Could not save. Check the fields and try again.');
    } finally { setBusy(false); }
  };

  const Field = ({ label, children, flex }) => (
    <div style={{ marginBottom: 12, flex: flex ? `${flex} 1 0` : '1 1 0' }}>
      <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{label}</div>{children}
    </div>
  );
  const Row = ({ children }) => <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,33,24,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', zIndex: 50, padding: '30px 14px' }}>
      <div style={{ background: C.card, borderRadius: 6, width: '100%', maxWidth: 720 }}>
        <div style={{ padding: '18px 24px', background: C.ink, color: C.paper, borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18 }}>{isEdit ? 'Edit trade' : 'Add a trade'}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.shell, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <Row>
            <Field label="From party (seller)" flex={2}><input value={d.from_party} onChange={(e) => set('from_party', e.target.value)} style={inp} /></Field>
            <Field label="To party (buyer)" flex={2}><input value={d.to_party} onChange={(e) => set('to_party', e.target.value)} style={inp} /></Field>
          </Row>
          <Row>
            <Field label="Commodity"><input value={d.commodity} onChange={(e) => set('commodity', e.target.value)} style={inp} /></Field>
            <Field label="Date"><input type="date" value={d.trade_date} onChange={(e) => set('trade_date', e.target.value)} style={inp} /></Field>
          </Row>
          <Row>
            <Field label="Rate ₹/kg"><input type="number" value={d.rate_per_kg} onChange={(e) => set('rate_per_kg', e.target.value)} style={inp} /></Field>
            <Field label="Quantity (tonnes)"><input type="number" value={d.quantity_tonnes} onChange={(e) => set('quantity_tonnes', e.target.value)} style={inp} /></Field>
            <Field label="Loading days"><input value={d.loading_days} onChange={(e) => set('loading_days', e.target.value)} style={inp} /></Field>
          </Row>

          {d.commodity.toLowerCase().includes('groundnut') && (
            <div style={{ background: C.paper, borderRadius: 4, padding: '14px 16px', margin: '4px 0 14px', border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 12, color: C.husk, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, fontWeight: 600 }}>Groundnut details</div>
              <Row>
                <Field label="Count"><input value={d.count} onChange={(e) => set('count', e.target.value)} placeholder="60-70" style={inp} /></Field>
                <Field label="Moisture %"><input value={d.moisture} onChange={(e) => set('moisture', e.target.value)} placeholder="under 10" style={inp} /></Field>
                <Field label="Category"><select value={d.category} onChange={(e) => set('category', e.target.value)} style={inp}><option value="">—</option><option value="Sortex">Sortex</option><option value="Non-Sortex">Non-Sortex</option></select></Field>
                <Field label="Dryer"><select value={d.dryer} onChange={(e) => set('dryer', e.target.value)} style={inp}><option value="">—</option><option value="Dryer">Dryer</option><option value="Non-Dryer">Non-Dryer</option></select></Field>
              </Row>
              <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 4 }}>Optional points</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {OPTIONS.map((o) => <button key={o} onClick={() => toggle(o)} style={{ padding: '6px 11px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', border: `1px solid ${d.options.includes(o) ? C.husk : C.line}`, background: d.options.includes(o) ? C.husk : 'transparent', color: d.options.includes(o) ? C.paper : C.muted }}>{o}</button>)}
              </div>
            </div>
          )}

          <div style={{ background: C.paper, borderRadius: 4, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 12, color: C.husk, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, fontWeight: 600 }}>Brokerage & discount</div>
            <Row>
              <Field label="Cash discount %"><input value={d.cash_discount_pct} onChange={(e) => set('cash_discount_pct', e.target.value)} style={inp} /></Field>
              <Field label="Brokerage — your side">
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="number" value={d.bsv} onChange={(e) => set('bsv', e.target.value)} style={{ ...inp, flex: 1 }} />
                  <select value={d.bsu} onChange={(e) => set('bsu', e.target.value)} style={{ ...inp, flex: 1.2 }}><option value="per100">₹/100kg</option><option value="per50">₹/50kg</option><option value="pct">% value</option></select>
                </div>
              </Field>
              <Field label="Brokerage — other side">
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="number" value={d.bov} onChange={(e) => set('bov', e.target.value)} style={{ ...inp, flex: 1 }} />
                  <select value={d.bou} onChange={(e) => set('bou', e.target.value)} style={{ ...inp, flex: 1.2 }}><option value="per100">₹/100kg</option><option value="per50">₹/50kg</option><option value="pct">% value</option></select>
                </div>
              </Field>
            </Row>
            {d.quantity_tonnes && <div style={{ fontSize: 12.5, color: C.sprout }}>Est. brokerage this side: <b>{fmtFull(brokPreview())}</b></div>}
          </div>

          {isEdit && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <button onClick={() => set('status', d.status === 'cancelled' ? 'active' : 'cancelled')} style={{ ...btnGhost, borderColor: C.clay, color: d.status === 'cancelled' ? C.paper : C.clay, background: d.status === 'cancelled' ? C.clay : 'transparent' }}>{d.status === 'cancelled' ? '● Cancelled — reactivate' : 'Mark cancelled'}</button>
              <button onClick={() => set('payment_collected', !d.payment_collected)} style={{ ...btnGhost, borderColor: C.sprout, color: d.payment_collected ? C.paper : C.sprout, background: d.payment_collected ? C.sprout : 'transparent' }}>{d.payment_collected ? '✓ Payment collected' : 'Mark payment collected'}</button>
              <button onClick={() => set('brokerage_collected', !d.brokerage_collected)} style={{ ...btnGhost, borderColor: C.gold, color: d.brokerage_collected ? C.ink : C.gold, background: d.brokerage_collected ? C.gold : 'transparent' }}>{d.brokerage_collected ? '✓ Brokerage collected' : 'Mark brokerage collected'}</button>
            </div>
          )}

          {err && <div style={{ color: C.clay, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose} style={btnGhost}>Cancel</button>
            <button onClick={save} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.7 : 1 }}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add trade'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
