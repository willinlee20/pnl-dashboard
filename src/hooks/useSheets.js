import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
const SHEET_ID = process.env.REACT_APP_SHEET_ID || 'YOUR_SHEET_ID_HERE';
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
export function useSheets() {
  const { token } = useAuth();
  const hdrs = useCallback(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);
  const read = useCallback(async (range) => {
    const res = await fetch(`${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}`, { headers: hdrs() });
    if (!res.ok) throw new Error(`Sheets read error: ${res.status}`);
    return (await res.json()).values || [];
  }, [hdrs]);
  const append = useCallback(async (range, values) => {
    const res = await fetch(`${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST', headers: hdrs(), body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
    });
    if (!res.ok) throw new Error(`Sheets append error: ${res.status}`);
    return res.json();
  }, [hdrs]);
  const clear = useCallback(async (range) => {
    const res = await fetch(`${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:clear`,
      { method: 'POST', headers: hdrs() });
    if (!res.ok) throw new Error(`Sheets clear error: ${res.status}`);
    return res.json();
  }, [hdrs]);
  const writePlatformData = useCallback(async (platform, rows) => {
    const map = { '官網':'官網_原始','momo':'momo_原始','蝦皮':'蝦皮_原始','經銷':'經銷_原始' };
    const sheet = map[platform];
    if (!sheet) throw new Error('Unknown platform');
    await clear(`${sheet}!A4:Z1000`);
    if (rows.length > 0) await append(`${sheet}!A4`, rows);
    return rows.length;
  }, [clear, append]);
  const readExpenses = useCallback(async () => {
    try {
      const rows = await read('損益表!A5:C60');
      const expenses = {};
      rows.forEach(r => { if (r[0] && r[2] && !isNaN(Number(r[2]))) expenses[r[0]] = Number(r[2]); });
      return expenses;
    } catch { return {}; }
  }, [read]);
  const writeExpenses = useCallback(async (expenseMap) => {
    try {
      const rows = await read('損益表!A5:A60');
      const updates = rows.map((r, i) =>
        r[0] && expenseMap[r[0]] !== undefined
          ? { range: `損益表!C${5+i}`, values: [[expenseMap[r[0]]]] } : null
      ).filter(Boolean);
      if (!updates.length) return;
      await fetch(`${BASE}/${SHEET_ID}/values:batchUpdate`, {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: updates }),
      });
    } catch { /* demo mode */ }
  }, [read, hdrs]);
  return { read, append, clear, writePlatformData, readExpenses, writeExpenses };
}