export const C = {
  shell: '#C9A876', husk: '#8A6D3B', ink: '#2A2118', paper: '#F6EFE2',
  card: '#FFFDF8', sprout: '#6B8E4E', clay: '#B4472E', line: '#E4D9C4',
  muted: '#8B7E68', gold: '#D9A441',
};
export const fmtINR = (n) => {
  if (n == null || isNaN(n)) return '—';
  n = Number(n);
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1) + 'k';
  return '₹' + Math.round(n).toLocaleString('en-IN');
};
export const fmtFull = (n) => n == null || isNaN(n) ? '—' : '₹' + Math.round(Number(n)).toLocaleString('en-IN');
