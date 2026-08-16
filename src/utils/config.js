// 賣場 & 品牌 & 權限設定檔
// 新增賣場、品牌、角色時只需修改這個檔案

// ── 品牌 ────────────────────────────────────────────────────
export const BRANDS = {
  TOOLA:  { id:'TOOLA',  name:'TOOLA 多樂',        color:'#00f5ff', bg:'rgba(0,245,255,0.08)' },
  LEON:   { id:'LEON',   name:'麗容酵素 LEON KOSO', color:'#b44fff', bg:'rgba(180,79,255,0.08)' },
  TAKUYA: { id:'TAKUYA', name:'Takuya 拓屋',        color:'#f5c400', bg:'rgba(245,196,0,0.08)' },
  ALL:    { id:'ALL',    name:'全品牌',              color:'#e0e0ff', bg:'rgba(224,224,255,0.08)' },
};

// ── 產品代號前綴 → 品牌 ──────────────────────────────────────
export const CODE_PREFIX_BRAND = {
  'BDTL': 'TOOLA',
  'BDLN': 'LEON',
  // 'TKYA': 'TAKUYA',  ← Takuya 代號確定後取消註解
};

// ── 賣場 ────────────────────────────────────────────────────
export const STORES = [
  { id:'TOOLA_SHOPLINE', name:'TOOLA 官網',   brand:'TOOLA',  platform:'官網',  color:'#00f5ff' },
  { id:'TOOLA_SHOPEE',   name:'TOOLA 蝦皮',   brand:'TOOLA',  platform:'蝦皮',  color:'#00f5ff' },
  { id:'MOMO',           name:'momo',          brand:'ALL',    platform:'momo',  color:'#ff006e' },
  { id:'TAKUYA_SHOPEE',  name:'拓屋 蝦皮',    brand:'TAKUYA', platform:'蝦皮',  color:'#f5c400' },
  { id:'TAKUYA_SHOPLINE',name:'拓屋 官網',    brand:'TAKUYA', platform:'官網',  color:'#f5c400' },
  { id:'ERP',            name:'經銷',          brand:'ALL',    platform:'經銷',  color:'#00ff9f' },
];

export const PLATFORM_STORES = {
  '官網': ['TOOLA_SHOPLINE', 'TAKUYA_SHOPLINE'],
  'momo': ['MOMO'],
  '蝦皮': ['TOOLA_SHOPEE', 'TAKUYA_SHOPEE'],
  '經銷': ['ERP'],
};

// ── 權限模組定義 ─────────────────────────────────────────────
export const PERMISSIONS = {
  VIEW_ALL:   { id:'VIEW_ALL',   label:'查看所有頁面',          desc:'可以查看所有報表和數據（唯讀）' },
  UPLOAD:     { id:'UPLOAD',     label:'上傳平台報表',          desc:'可以上傳官網、momo、蝦皮、經銷報表' },
  ORDER:      { id:'ORDER',      label:'手動開單',              desc:'可以建立手動銷售訂單' },
  INVENTORY:  { id:'INVENTORY',  label:'庫存查看與入庫',        desc:'可以查看庫存並登錄入庫' },
  STOCKTAKE:  { id:'STOCKTAKE',  label:'盤點調整',              desc:'可以調整庫存盤點數量（高風險）' },
  FINANCE:    { id:'FINANCE',    label:'損益表與廣告費',        desc:'可以輸入費用、廣告費' },
  SETTINGS:   { id:'SETTINGS',   label:'商品設定與新增',        desc:'可以新增商品、修改商品總表' },
  MASTER:     { id:'MASTER',     label:'Master（最高權限）',   desc:'帳號管理、權限設定、所有功能' },
};

// ── 預設角色（方便快速指派） ─────────────────────────────────
export const DEFAULT_ROLES = {
  master:  { label:'Master',  color:'#ff006e', perms: Object.keys(PERMISSIONS) },
  finance: { label:'財務',    color:'#00f5ff', perms: ['VIEW_ALL','FINANCE','UPLOAD'] },
  warehouse:{ label:'倉管',   color:'#00ff9f', perms: ['VIEW_ALL','INVENTORY','STOCKTAKE','ORDER'] },
  sales:   { label:'業務',    color:'#f5c400', perms: ['VIEW_ALL','ORDER','UPLOAD'] },
  viewer:  { label:'唯讀',    color:'#7070b8', perms: ['VIEW_ALL'] },
};

// ── 初始帳號（本機測試用，正式版從 Google Sheets 讀取） ──────
export const INITIAL_ACCOUNTS = [
  {
    email: 'willie@company.com',
    name:  'Willie',
    role:  'master',
    perms: Object.keys(PERMISSIONS),
    active: true,
  },
];

// ── 帳號是否有某權限 ─────────────────────────────────────────
export function hasPermission(account, permId) {
  if (!account) return false;
  if (account.perms?.includes('MASTER')) return true;
  return account.perms?.includes(permId) || false;
}

// ── 輔助函式 ─────────────────────────────────────────────────
export function getBrandByCode(code) {
  if (!code) return 'TOOLA';
  const upper = String(code).toUpperCase();
  for (const [prefix, brand] of Object.entries(CODE_PREFIX_BRAND)) {
    if (upper.startsWith(prefix)) return brand;
  }
  return 'TOOLA';
}

export function getStore(storeId) {
  return STORES.find(s => s.id === storeId) || STORES[0];
}

export function getStoreName(storeId) {
  return getStore(storeId)?.name || storeId;
}