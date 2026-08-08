import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '../api/client';
import { C, fmtINR } from '../lib/theme';
import { KPI, KPIGrid, Card, chip, chipActive } from '../components/ui';

const ttStyle = { background: C.ink, border: 'none', borderRadius: 4, color: C.paper, fontSize: 12 };
const PIE = [C.sprout, C.husk, C.muted];

export default function AnalyticsPage() {
  const [gran, setGran] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.summary({ granularity: gran })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [gran]);

  if (loading || !data) return <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading analytics…</div>;

  const series = data.series.map((s) => ({
    ...s,
    label: gran === 'day' ? s.period.slice(5) : s.period,
    valueCr: +(s.value / 1e7).toFixed(3),
    brokL: +(s.brokerage / 1e5).toFixed(3),
  }));
  const cats = data.by_category.map((c) => ({ name: c.name, value: +c.value.toFixed(1) }));
  const top = data.top_parties.map((p) => ({ ...p, valueCr: +(p.value / 1e7).toFixed(2), short: p.party.length > 22 ? p.party.slice(0, 22) + '…' : p.party }));

  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, margin: '0 0 16px' }}>Analytics</h2>
      <KPIGrid>
        <KPI label="Total trade value" value={fmtINR(data.total_trade_value)} accent />
        <KPI label="Total quantity" value={Number(data.total_quantity).toFixed(0) + ' t'} sub={(data.total_quantity * 10).toFixed(0) + ' qtl'} />
        <KPI label="Total brokerage" value={fmtINR(data.total_brokerage)} accent2 />
        <KPI label="Active trades" value={data.active_trades} sub={`${data.cancelled_trades} cancelled`} />
      </KPIGrid>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['month', 'Monthly'], ['day', 'Daily']].map(([k, l]) => <button key={k} onClick={() => setGran(k)} style={gran === k ? chipActive : chip}>{l}</button>)}
      </div>

      <Card title={`Trade value per ${gran}`} sub="Gross value = rate × quantity (₹ Crore)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={series} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} width={44} />
            <Tooltip contentStyle={ttStyle} formatter={(v) => ['₹' + v + ' Cr', 'Value']} />
            <Bar dataKey="valueCr" fill={C.husk} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginTop: 16 }}>
        <Card title={`Quantity per ${gran}`} sub="Tonnes">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={series} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} width={40} />
              <Tooltip contentStyle={ttStyle} formatter={(v) => [v + ' t', 'Qty']} />
              <Line type="monotone" dataKey="qty" stroke={C.sprout} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Brokerage per month" sub="Both sides (₹ Lakh)">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={series} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} width={40} />
              <Tooltip contentStyle={ttStyle} formatter={(v) => ['₹' + v + ' L', 'Brokerage']} />
              <Bar dataKey="brokL" fill={C.gold} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Sortex vs Non-Sortex" sub="Share of quantity (tonnes)">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={cats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} label={({ name, value }) => `${name}: ${value}t`} labelLine={false} fontSize={11}>
                {cats.map((e, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip contentStyle={ttStyle} formatter={(v) => [v + ' t', '']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top parties by value" sub="Both sides (₹ Crore)">
          <ResponsiveContainer width="100%" height={Math.max(200, top.length * 32)}>
            <BarChart data={top} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.line} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis type="category" dataKey="short" tick={{ fontSize: 10.5, fill: C.ink }} width={140} />
              <Tooltip contentStyle={ttStyle} formatter={(v, n, p) => ['₹' + v + ' Cr · ' + p.payload.count + ' trades', 'Value']} />
              <Bar dataKey="valueCr" fill={C.husk} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
