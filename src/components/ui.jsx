import { C } from '../lib/theme';

export const inp = { width: '100%', padding: '9px 11px', borderRadius: 4, border: `1px solid ${C.line}`, background: '#fff', fontSize: 13.5, color: C.ink, fontFamily: 'system-ui', boxSizing: 'border-box' };
export const btnPrimary = { background: C.husk, color: C.paper, border: 'none', padding: '10px 18px', borderRadius: 4, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'system-ui' };
export const btnGhost = { background: 'transparent', color: C.husk, border: `1px solid ${C.husk}`, padding: '9px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui' };
export const chip = { background: C.card, border: `1px solid ${C.line}`, color: C.muted, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13 };
export const chipActive = { ...chip, background: C.husk, color: C.paper, borderColor: C.husk };

export function KPI({ label, value, sub, accent, accent2 }) {
  return (
    <div style={{ background: accent ? C.husk : accent2 ? C.ink : C.card, color: (accent || accent2) ? C.paper : C.ink, border: `1px solid ${accent ? C.husk : accent2 ? C.ink : C.line}`, borderRadius: 5, padding: '15px 16px' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 23, fontFamily: 'Georgia, serif', fontWeight: 600, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export function Card({ title, sub, children, style }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, padding: 16, ...style }}>
      {title && <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 15.5 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>}
      {children}
    </div>
  );
}

export function Pill({ text, color }) {
  return <span style={{ display: 'inline-block', fontSize: 10.5, padding: '2px 8px', borderRadius: 20, background: color + '22', color, fontWeight: 600, whiteSpace: 'nowrap' }}>{text}</span>;
}

export function Toggle({ on, onLabel, offLabel, color, onClick }) {
  return <button onClick={onClick} style={{ background: on ? color : 'transparent', color: on ? (color === C.gold ? C.ink : C.paper) : color, border: `1px solid ${color}`, padding: '5px 11px', borderRadius: 20, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>{on ? '✓ ' + onLabel : offLabel}</button>;
}

export const KPIGrid = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 18 }}>{children}</div>;
