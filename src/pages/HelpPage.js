import { useState } from 'react';

const SECTIONS = [
  {
    id:'overview', icon:'◈', title:'系統總覽',
    content: [
      { subtitle:'系統架構', text:'損益彙整系統分為三層：資料庫（Google Sheets）、每月輸入（各平台報表上傳）、自動產出（損益表＋銷貨總表）。日常操作只需要每月上傳報表，其他數字自動計算。' },
      { subtitle:'支援平台', text:'官網（Shopline）、momo、蝦皮、ERP 經銷。蝦皮和官網各有多個賣場，上傳時需選擇對應賣場（TOOLA 或 拓屋）。' },
      { subtitle:'品牌管理', text:'系統支援 TOOLA 多樂、麗容酵素 LEON KOSO、Takuya 拓屋三個品牌。momo 和經銷的報表會依產品代號前綴自動拆分品牌。' },
    ]
  },
  {
    id:'upload', icon:'↑', title:'報表上傳',
    content: [
      { subtitle:'每月操作流程', text:'1. 進入「報表上傳」頁面\n2. 拖曳各平台 Excel 檔案至上傳區（可一次拖多個）\n3. 系統自動辨識平台格式\n4. 蝦皮和官網需選擇賣場（TOOLA / 拓屋）\n5. 預覽確認後按「確認匯入」' },
      { subtitle:'官網（Shopline）', text:'Shopline 後台 → 訂單管理 → 匯出 Sales 報表。只會匯入「已確認」和「已完成」的訂單，其他狀態自動排除。' },
      { subtitle:'momo', text:'廠商後台 → 訂單 → 廠商出貨報表。有填退貨原因的訂單會自動排除。momo品號與標準代號不同，需在平台代號對應表維護對應關係。' },
      { subtitle:'蝦皮', text:'賣場中心 → 訂單 → 匯出已完成訂單（Order_completed 格式）。商品選項貨號或 Barcode 均可被辨識，系統內建 Barcode→產品代號轉換表。' },
      { subtitle:'ERP 經銷', text:'ERP 系統 → 銷貨明細表（含稅金額）。收入以實際開立發票含稅金額認列，系統依產品代號自動拆分品牌。' },
    ]
  },
  {
    id:'sales', icon:'▦', title:'銷貨總表',
    content: [
      { subtitle:'套組與單品換算', text:'銷貨總表以套組為銷售單位，同時自動換算單品數量。例如賣出 3 組「880g 3入組」，單品換算數量為 9 瓶。換算邏輯依套組成分表自動展開。' },
      { subtitle:'混合套組', text:'如「多樂全系列體驗組」包含多個不同單品，系統依套組成分表展開各單品數量。新增混合套組時需在套組成分表補充成分。' },
      { subtitle:'各平台欄位', text:'青色=官網、粉紅=momo、黃色=蝦皮、綠色=經銷。數字為零時顯示「–」。' },
    ]
  },
  {
    id:'pnl', icon:'$', title:'損益表',
    content: [
      { subtitle:'三個 Tab', text:'①各賣場廣告費：每個賣場獨立填入廣告費，即時顯示 ROI。②品牌損益：TOOLA、麗容酵素、拓屋各自損益彙整。③公司損益表：完整損益表，費用輸入區（黃底）可直接點擊編輯。' },
      { subtitle:'廣告費 ROI', text:'ROI = 銷售收入 ÷ 廣告費。ROI ≥ 3x 顯示綠色，代表每 1 元廣告帶來 3 元以上收入。ROI < 3x 顯示黃色，需關注。' },
      { subtitle:'費用科目', text:'廣告費在「各賣場廣告費」Tab 輸入，自動帶入損益表。其他費用（薪資、房租等）在「公司損益表」Tab 直接填入黃底欄位。' },
    ]
  },
  {
    id:'inventory', icon:'▣', title:'庫存管理',
    content: [
      { subtitle:'三個 Tab', text:'①成品庫存：所有產品的庫存數量、安全庫存、預警狀態。②耗材/包材：包裝材料、耗材的庫存管理。③庫存資產總表：依成本價計算的庫存資產總值。' },
      { subtitle:'新增商品', text:'成品庫存頁面右上角「＋ 新增商品」，填入產品代號、品名、品牌、含稅成本、安全庫存量、初始庫存數量。代號確認後不可重複。' },
      { subtitle:'入庫登錄', text:'選擇商品 → 填入入庫數量 → 填備註（廠商、批號）→ 確認入庫。庫存數量自動增加，並記錄入庫紀錄。' },
      { subtitle:'盤點調整', text:'點擊「⊞ 盤點調整」進入盤點模式，直接在表格輸入實際盤點數量，按「儲存盤點結果」一次更新。所有調整會記錄在入庫紀錄中標註「盤點」。' },
      { subtitle:'耗材/包材', text:'可新增耗材品項，填入品名、規格/尺寸、對應產品、生產廠商（含電話）、單位成本。同樣支援入庫登錄和庫存預警。' },
      { subtitle:'庫存資產總表', text:'依「庫存數量 × 含稅成本」計算，成品依品牌分組顯示，耗材另計。三個總額卡片：成品資產、耗材資產、庫存總資產。' },
    ]
  },
  {
    id:'order', icon:'◇', title:'手動開單',
    content: [
      { subtitle:'適用情境', text:'適合現場銷售、非平台訂單、或平台報表未能涵蓋的銷售。手動開單後，數據自動計入銷貨總表和損益表。' },
      { subtitle:'操作步驟', text:'1. 選擇銷售管道（官網/momo/蝦皮/經銷/現場/其他）\n2. 填入客戶名稱\n3. 選擇商品並輸入數量（單價可調整）\n4. 可新增多個品項\n5. 確認金額後按「確認建立訂單」' },
      { subtitle:'即時計算', text:'輸入商品和數量後，頁面即時顯示銷售金額、銷貨成本、毛利。' },
    ]
  },
  {
    id:'accounts', icon:'🔐', title:'帳號與權限',
    content: [
      { subtitle:'權限層級', text:'Master 帳號擁有所有功能。一般帳號可自訂權限組合，可快速套用預設角色：財務、倉管、業務、唯讀。' },
      { subtitle:'新增帳號', text:'帳號管理 → 新增帳號 → 填入對方的 Google Email 和姓名 → 選擇角色或自訂權限。對方用該 Google 帳號登入後自動套用設定的權限。' },
      { subtitle:'操作日誌', text:'重要操作（費用修改、廣告費、盤點調整、帳號變更）自動記錄到「操作日誌」，可查看誰在什麼時間做了什麼修改，修改前後的數值都有記錄。' },
    ]
  },
  {
    id:'sheets', icon:'⊞', title:'Google Sheets 串接',
    content: [
      { subtitle:'資料庫架構', text:'系統使用 Google Sheets 作為資料庫，包含：商品總表（成本唯一來源）、套組成分表、平台代號對應表、各平台原始資料頁、損益表。' },
      { subtitle:'串接設定', text:'系統設定頁面 → 填入 Google Sheets ID 和 Google OAuth Client ID。Client ID 需要從 Google Cloud Console 申請。' },
      { subtitle:'商品總表維護', text:'新增產品時在商品總表加一列（代號、品名、含稅成本）。套組需在套組成分表補充成分。代號前綴規則請維持一致（BDTL=多樂、BDLN=麗容酵素）。' },
    ]
  },
];

export default function HelpPage() {
  const [active, setActive] = useState('overview');
  const section = SECTIONS.find(s => s.id === active);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:16, minHeight:500 }}>
      {/* 左側目錄 */}
      <div className="card" style={{ padding:12, height:'fit-content' }}>
        <div style={{ fontFamily:'var(--title)', fontSize:14, fontWeight:700, color:'var(--cyan)', letterSpacing:2, marginBottom:12, textTransform:'uppercase' }}>
          操作手冊
        </div>
        {SECTIONS.map(s => (
          <div key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              padding:'8px 10px', borderRadius:4, cursor:'pointer', marginBottom:3,
              background: active===s.id ? 'rgba(0,245,255,0.08)' : 'transparent',
              borderLeft: `2px solid ${active===s.id ? 'var(--cyan)' : 'transparent'}`,
              color: active===s.id ? 'var(--cyan)' : 'var(--muted)',
              fontSize:17, letterSpacing:1,
              transition:'all .15s',
            }}>
            <span style={{ marginRight:6 }}>{s.icon}</span>{s.title}
          </div>
        ))}
      </div>

      {/* 右側內容 */}
      <div className="card">
        <div style={{ fontFamily:'var(--title)', fontSize:23, fontWeight:700, color:'var(--cyan)', letterSpacing:3, marginBottom:20, textTransform:'uppercase', textShadow:'var(--glow-cyan)' }}>
          {section.icon} {section.title}
        </div>
        {section.content.map((item, i) => (
          <div key={i} style={{ marginBottom:20, paddingBottom:20, borderBottom: i < section.content.length-1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily:'var(--title)', fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:2, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:4, height:14, background:'var(--cyan)', borderRadius:2, display:'inline-block', boxShadow:'var(--glow-cyan)' }}/>
              {item.subtitle}
            </div>
            <div style={{ fontSize:18, color:'rgba(224,224,255,0.8)', lineHeight:1.9, whiteSpace:'pre-line', paddingLeft:12 }}>
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}