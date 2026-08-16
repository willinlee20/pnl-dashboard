export const fmt = {
  currency: (n) => {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return `$${Math.round(n).toLocaleString('zh-TW')}`;
  },
  pct: (n, d = 1) => {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return `${(n * 100).toFixed(d)}%`;
  },
  number: (n) => {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return Math.round(n).toLocaleString('zh-TW');
  },
};
export const PLATFORM_COLORS = { '官網':'#2F5496','momo':'#C00000','蝦皮':'#FF6600','經銷':'#0F6E56' };
export const PLATFORM_BG    = { '官網':'#D6E4F7','momo':'#FAECE7','蝦皮':'#FFE8D6','經銷':'#E1F5EE' };
export function getCurrentYM() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
