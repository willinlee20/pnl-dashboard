import * as XLSX from 'xlsx';

// ── Barcode → 標準產品代號對照表 ───────────────────────────────
// 當蝦皮商品選項貨號填的是 Barcode 而不是產品代號時，在此轉換
const BARCODE_TO_CODE = {
  '4711263761459': 'BDLN201',  // 麗容酵素入浴劑 880g
  '4711263333335': 'BDLN101',  // 麗容酵素入浴劑 600g
  '4711263669991': 'BDLN301',  // 蔬果奶瓶洗滌劑 500ml
  '4711263663333': 'BDLN401',  // 抗菌防螨洗衣精 1000ml
  '4711035553015': 'BDTL101',  // 多樂 B5 多效保濕修護霜
  '4711035550700': 'BDTL201',  // 多樂 嬰幼兒洗沐泡泡露－英國梨
  '4711035550724': 'BDTL301',  // 多樂 嬰幼兒多用途保濕慕絲－英國梨
  '4711035550731': 'BDTL401',  // 多樂 嬰幼兒多用途保濕慕絲－純淨無香
  '4711035550038': 'BDTL501',  // 極韌安全 無毒防護角四入－粉直角
  '4711035550014': 'BDTL601',  // 極韌安全 無毒防護角四入－棕圓角
  '4711035550021': 'BDTL701',  // 極韌安全 無毒防護角四入－棕直角
  '4711035550045': 'BDTL801',  // 極韌安全 無毒防護角四入－白直角
  '4711035550137': 'BDTL901',  // 太陽便盆 多階段學習馬桶－藍
  '4711035550113': 'BDTL1001', // 太陽便盆 多階段學習馬桶－粉
  '4711035550120': 'BDTL1101', // 太陽便盆 多階段學習馬桶墊－藍
  '4711035550106': 'BDTL1201', // 太陽便盆 多階段學習馬桶墊－粉
};

// 將任意代號標準化（Barcode → 產品代號，並去除空格）
function normalizeCode(raw) {
  if (!raw) return '';
  const cleaned = String(raw).trim().replace(/\s+/g, '');
  return BARCODE_TO_CODE[cleaned] || cleaned;
}

// ── 通用：讀取 Excel ──────────────────────────────────────────
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        resolve(wb);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function sheetToRows(ws) {
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
}

function findIdx(headers, keywords) {
  for (const kw of keywords) {
    const i = headers.findIndex(h => String(h).includes(kw));
    if (i !== -1) return i;
  }
  return -1;
}

// ── 自動偵測平台 ───────────────────────────────────────────────
export function detectPlatform(wb) {
  const sheets = wb.SheetNames;
  const ws = wb.Sheets[sheets[0]];
  const rows = sheetToRows(ws);
  const header = (rows[0] || []).join(',');

  // 蝦皮：有「商品選項貨號」或「蝦皮商品編碼」
  if (header.includes('商品選項貨號') || header.includes('蝦皮商品編碼')) return '蝦皮';
  // 官網 Shopline：有「商品貨號」且有「訂單號碼」
  if ((header.includes('商品貨號') || header.includes('商品結帳價')) && header.includes('訂單')) return '官網';
  // momo：有「品號」且有「進價(含稅)」
  if (header.includes('品號') && header.includes('進價(含稅)')) return 'momo';
  // 經銷 ERP：有客戶代號或銷貨明細特徵
  if (header.includes('客戶代號') || header.includes('銷貨明細') || header.includes('BTB')) return '經銷';
  // 嘗試從工作表名稱判斷
  if (sheets.some(s => s.includes('orders'))) return '蝦皮';
  if (sheets.some(s => s.includes('Sales'))) return '官網';
  return null;
}

// ── 官網 (Shopline) ────────────────────────────────────────────
export function parseShopline(wb) {
  const ws = wb.Sheets['Sales'] || wb.Sheets[wb.SheetNames[0]];
  const rows = sheetToRows(ws);
  if (rows.length < 2) return { rows: [], summary: {} };

  const headers = rows[0];
  const iOrder  = findIdx(headers, ['訂單號碼']);
  const iDate   = findIdx(headers, ['訂單日期']);
  const iStatus = findIdx(headers, ['訂單狀態']);
  const iSku    = findIdx(headers, ['商品貨號']);
  const iName   = findIdx(headers, ['商品名稱']);
  const iQty    = findIdx(headers, ['數量']);
  const iPrice  = findIdx(headers, ['商品結帳價']);
  const iTotal  = findIdx(headers, ['付款總金額']);

  const validStatuses = ['已完成', '已確認'];
  const result = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!validStatuses.includes(String(r[iStatus] || ''))) continue;
    const sku = normalizeCode(r[iSku]);
    if (!sku) continue;

    result.push([
      String(r[iOrder] || '').trim(),
      formatDate(r[iDate]),
      String(r[iStatus] || '').trim(),
      String(r[iName] || '').trim(),
      sku,
      Number(r[iQty]) || 0,
      Number(r[iPrice]) || 0,
      Number(r[iTotal]) || 0,
    ]);
  }

  const revenue = result.reduce((s, r) => s + r[6] * r[5], 0);
  return { rows: result, summary: { platform: '官網', count: result.length, revenue } };
}

// ── momo ──────────────────────────────────────────────────────
export function parseMomo(wb) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = sheetToRows(ws);
  if (rows.length < 2) return { rows: [], summary: {} };

  const headers = rows[0];
  const iOrder  = findIdx(headers, ['訂單編號']);
  const iDate   = findIdx(headers, ['轉單日']);
  const iCode   = findIdx(headers, ['品號']);
  const iName   = findIdx(headers, ['品名']);
  const iQty    = findIdx(headers, ['數量']);
  const iCost   = findIdx(headers, ['進價(含稅)']);
  const iPrice  = findIdx(headers, ['售價(含稅)']);
  const iReturn = findIdx(headers, ['退貨原因']);

  const result = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!String(r[iOrder] || '').trim()) continue;
    // 排除退貨
    const returnReason = String(r[iReturn] || '').trim();
    if (returnReason && returnReason !== 'nan' && returnReason !== '-') continue;

    const code = normalizeCode(r[iCode]);
    result.push([
      String(r[iOrder] || '').trim(),
      formatDate(r[iDate]),
      code,
      String(r[iName] || '').trim(),
      Number(r[iQty]) || 0,
      Number(r[iCost]) || 0,
      Number(r[iPrice]) || 0,
    ]);
  }

  const revenue = result.reduce((s, r) => s + r[6] * r[4], 0);
  return { rows: result, summary: { platform: 'momo', count: result.length, revenue } };
}

// ── 蝦皮 (根據實際報表結構更新) ───────────────────────────────
// 欄位：訂單編號[0] / 訂單狀態[1] / 退貨退款狀態[3] / 訂單成立日期[5]
//       商品名稱[24] / 商品選項貨號[32] / 主商品貨號[31]
//       數量[33] / 退貨數量[34] / 商品活動價格[30] / 商品原價[29]
export function parseShopee(wb) {
  const sheetName = wb.SheetNames.find(s =>
    s.toLowerCase().includes('orders') || s.includes('訂單') || s.includes('order')
  ) || wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  const rows = sheetToRows(ws);
  if (rows.length < 2) return { rows: [], summary: {} };

  const headers = rows[0];
  const iOrder      = findIdx(headers, ['訂單編號']);
  const iStatus     = findIdx(headers, ['訂單狀態']);
  const iReturnSt   = findIdx(headers, ['退貨 / 退款狀態', '退貨/退款狀態']);
  const iDate       = findIdx(headers, ['訂單成立日期']);
  const iName       = findIdx(headers, ['商品名稱']);
  const iSkuOpt     = findIdx(headers, ['商品選項貨號']);  // 優先用這個
  const iSkuMain    = findIdx(headers, ['主商品貨號']);    // 備用
  const iQty        = findIdx(headers, ['數量']);
  const iReturnQty  = findIdx(headers, ['退貨數量']);
  const iPrice      = findIdx(headers, ['商品活動價格']);  // 單價（用這個計算收入）
  const iOrigPrice  = findIdx(headers, ['商品原價']);

  const result = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const orderNo = String(r[iOrder] || '').trim();
    if (!orderNo) continue;

    // 排除有退貨退款狀態的（空值 = 正常）
    const returnStatus = String(r[iReturnSt] || '').trim();
    if (returnStatus && returnStatus !== '-' && returnStatus !== 'nan') continue;

    // 退貨數量 > 0 也排除
    const returnQty = Number(r[iReturnQty]) || 0;
    if (returnQty > 0) continue;

    // 取產品代號：優先用商品選項貨號，沒有就用主商品貨號
    const rawCode = r[iSkuOpt] || r[iSkuMain] || '';
    const code = normalizeCode(rawCode);
    if (!code) continue;

    const qty   = Number(r[iQty]) || 0;
    const price = Number(r[iPrice]) || Number(r[iOrigPrice]) || 0;

    result.push([
      orderNo,
      String(r[iStatus] || '').trim(),
      formatDate(r[iDate]),
      String(r[iName] || '').trim(),
      code,
      qty,
      price,                    // 商品活動價格（單價）
      price * qty,              // 計算收入 = 單價 × 數量
    ]);
  }

  const revenue = result.reduce((s, r) => s + r[7], 0);
  return { rows: result, summary: { platform: '蝦皮', count: result.length, revenue } };
}

// ── 經銷 ERP ──────────────────────────────────────────────────
export function parseERP(wb) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = sheetToRows(ws);

  const result = [];
  let currentClientCode = '';
  let currentClient = '';

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const vals = r.map(v => String(v || '').trim());

    // 客戶列：BTBxxxxxx 開頭
    if (vals[0] && vals[0].startsWith('BTB')) {
      currentClientCode = vals[0];
      currentClient = vals[1] || '';
    }

    // 產品列：BD 或 NEW 開頭的產品代號
    const possibleCode = vals[2] || vals[0];
    if (possibleCode && (possibleCode.startsWith('BD') || possibleCode.startsWith('NEW'))) {
      const code     = normalizeCode(possibleCode);
      const name     = vals[3] || vals[1] || '';
      const qty      = Number(vals[4]) || 0;
      const untaxAmt = Number(vals[6]) || 0;
      const taxAmt   = Number(vals[7]) || 0;
      const totalAmt = Number(vals[8]) || 0;  // 含稅總額 = 實際發票金額

      if (code && qty > 0) {
        result.push([
          currentClientCode,
          currentClient,
          code,
          name,
          qty,
          untaxAmt,
          taxAmt,
          totalAmt,
        ]);
      }
    }
  }

  const revenue = result.reduce((s, r) => s + r[7], 0);
  return { rows: result, summary: { platform: '經銷', count: result.length, revenue } };
}

// ── 日期格式化 ─────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return '';
  const s = String(val);
  // 已是 YYYY-MM-DD 或 YYYY/MM/DD 格式
  if (/^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(s)) return s.slice(0, 10).replace(/\//g, '-');
  // Excel 數字型日期
  if (!isNaN(Number(val))) {
    try {
      const d = XLSX.SSF.parse_date_code(Number(val));
      if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
    } catch { return s; }
  }
  return s.slice(0, 10);
}

// ── 主入口：自動解析 ───────────────────────────────────────────
export async function autoParsePlatform(file) {
  let wb;
  try {
    wb = await parseExcel(file);
  } catch (e) {
    return { platform: null, error: `檔案讀取失敗：${e.message}` };
  }

  const platform = detectPlatform(wb);
  if (!platform) {
    return { platform: null, error: '無法辨識平台格式，請確認欄位是否正確（官網/momo/蝦皮/經銷）' };
  }

  let result;
  try {
    switch (platform) {
      case '官網': result = parseShopline(wb); break;
      case 'momo': result = parseMomo(wb); break;
      case '蝦皮': result = parseShopee(wb); break;
      case '經銷': result = parseERP(wb); break;
      default: return { platform: null, error: '未知平台' };
    }
  } catch (e) {
    return { platform, error: `解析失敗：${e.message}` };
  }

  return { platform, ...result };
}
