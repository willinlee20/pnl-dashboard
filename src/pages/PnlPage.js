import { useState } from 'react';
import { Save } from 'lucide-react';
import { fmt, getCurrentYM } from '../utils/format';
import { STORES, BRANDS } from '../utils/config';

const EXPENSE_ITEMS = [
  '人員薪資','勞健保','房租','電費','網路費','運費','包材/雜支','平均攤提費用','其他費用',
];

// Demo 收入資料（之後從上傳報表帶入）
const REVENUE_BY_STORE = {
  TOOLA_SHOPLINE: { revenue:68000,  cost:28000 },
  TOOLA_SHOPEE:   { revenue:47300,  cost:18000 },
  MOMO:           { revenue:116000, cost:49000 },
  TAKUYA_SHOPEE:  { revenue:38000,  cost:16000 },
  TAKUYA_SHOPLINE:{ revenue:22000,  cost:9000  },
  ERP:            { revenue:191000, cost:78700 },
};

export default function PnlPage() {
  const { year, month } = getCurrentYM();
  const [tab, setTab] = useState('store'); // 'store' | 'brand' | 'total'

  // 各賣場廣告費
  const [adCost, setAdCost] = useState(
    Object.fromEntries(STORES.map(s => [s.id, 0]))
  );
  // 其他費用（公司整體）
  const [expenses, setExpenses] = useState(
    Object.fromEntries(EXPENSE_ITEMS.map(k => [k, 0]))
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try { localStorage.setItem('pnl_adcost', JSON.stringify(adCost)); } catch(e) {}
    try { localStorage.setItem('pnl_expenses', JSON.stringify(expenses)); } catch(e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 計算各賣場損益
  const storeRows = STORES.map(s => {
    const d = REVENUE_BY_STORE[s.id] || { revenue:0, cost:0 };
    const ad = Number(adCost[s.id]) || 0;
    const gross = d.revenue - d.cost;
    const net   = gross - ad;
    const roi   = ad > 0 ? (d.revenue / ad).toFixed(1) : '–';
    return { ...s, ...d, ad, gross, net, roi };
  });

  // 依品牌加總
  const brandTotals = {};
  storeRows.forEach(s => {
    const bid = s.brand === 'ALL' ? 'SHARED' : s.brand;
    if (!brandTotals[bid]) brandTotals[bid] = { revenue:0, cost:0, ad:0, gross:0, net:0 };
    brandTotals[bid].revenue += s.revenue;
    brandTotals[bid].cost    += s.cost;
    brandTotals[bid].ad      += s.ad;
    brandTotals[bid].gross   += s.gross;
    brandTotals[bid].net     += s.net;
  });

  // 全公司合計
  const totalRevenue  = storeRows.reduce((a,s) => a+s.revenue, 0);
  const totalCost     = storeRows.reduce((a,s) => a+s.cost, 0);
  const totalAd       = storeRows.reduce((a,s) => a+s.ad, 0);
  const totalGross    = totalRevenue - totalCost;
  const totalExpenses = Object.values(expenses).reduce((a,b) => a+(Number(b)||0), 0);
  const totalNet      = totalGross - totalAd - totalExpenses;

  const TABS = [
    { id:'store', label:'各賣場廣告費' },
    { id:'brand', label:'品牌損益' },
    { id:'total', label:'公司損益表' },
  ];

  return (
    <div>
      <div className="flex-between mb-16">
        <div style={{ display:'flex', gap:4 }}>
          {TABS.map(t => (
            <button key={t.id}
              className={`btn btn-sm ${tab===t.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>
          <Save size={13}/> {saved ? '✓ 已儲存' : '儲存'}
        </button>
      </div>

      {/* ── Tab 1：各賣場廣告費 ── */}
      {tab === 'store' && (
        <div>
          <div className="card mb-16" style={{ background:'rgba(0,245,255,0.02)' }}>
            <div className="card-title">各賣場廣告費輸入 <span>{year}年{month}月 · 黃底可直接輸入</span></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>賣場</th><th>品牌</th>
                    <th style={{ textAlign:'right' }}>銷售收入</th>
                    <th style={{ textAlign:'right' }}>銷貨成本</th>
                    <th style={{ textAlign:'right' }}>毛利</th>
                    <th style={{ textAlign:'right', background:'rgba(245,196,0,0.08)', color:'var(--yellow)' }}>廣告費用</th>
                    <th style={{ textAlign:'right' }}>賣場淨利</th>
                    <th style={{ textAlign:'right' }}>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {storeRows.map(s => {
                    const brand = BRANDS[s.brand] || BRANDS.TOOLA;
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight:600, fontSize:17 }}>{s.name}</td>
                        <td>
                          <span style={{ fontSize:14, color:brand.color, background:brand.bg, padding:'2px 6px', borderRadius:3, border:`1px solid ${brand.color}40`, letterSpacing:1 }}>
                            {s.brand === 'ALL' ? '共用' : brand.name}
                          </span>
                        </td>
                        <td className="td-right td-mono" style={{ color:'var(--cyan)' }}>{fmt.currency(s.revenue)}</td>
                        <td className="td-right td-mono" style={{ color:'var(--pink)' }}>{fmt.currency(s.cost)}</td>
                        <td className="td-right td-mono" style={{ color:'var(--green)' }}>{fmt.currency(s.gross)}</td>
                        <td style={{ padding:0 }}>
                          <div className="money-input">
                            <span className="money-input-prefix">$</span>
                            <input type="text" inputMode="numeric"
                              value={adCost[s.id] ? Number(adCost[s.id]).toLocaleString() : ''}
                              placeholder="點擊輸入廣告費"
                              onChange={e => { const v = Number(e.target.value.replace(/,/g,'')); setAdCost(p => ({ ...p, [s.id]:isNaN(v)?0:v })); setSaved(false); }}
                            />
                          </div>
                        </td>
                        <td className="td-right td-mono" style={{ color: s.net>=0 ? 'var(--green)' : 'var(--pink)', fontWeight:600 }}>
                          {fmt.currency(s.net)}
                        </td>
                        <td className="td-right td-mono" style={{ color: s.ad > 0 ? (Number(s.roi)>=3 ? 'var(--green)' : 'var(--yellow)') : 'var(--muted)' }}>
                          {s.ad > 0 ? `${s.roi}x` : '–'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background:'rgba(0,245,255,0.06)', borderTop:'1px solid rgba(0,245,255,0.3)' }}>
                    <td colSpan={2} style={{ fontFamily:'var(--title)', fontWeight:700, color:'var(--cyan)', letterSpacing:2, padding:'10px 12px' }}>合計</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--cyan)', padding:'10px 14px' }}>{fmt.currency(totalRevenue)}</td>
                    <td className="td-right td-mono" style={{ fontWeight:700, color:'var(--pink)' }}>{fmt.currency(totalCost)}</td>
                    <td className="td-right td-mono" style={{ fontWeight:700, color:'var(--green)' }}>{fmt.currency(totalGross)}</td>
                    <td className="td-right td-mono" style={{ fontWeight:700, color:'var(--yellow)', background:'rgba(245,196,0,0.06)' }}>{fmt.currency(totalAd)}</td>
                    <td className="td-right td-mono" style={{ fontWeight:700, color: totalNet>=0 ? 'var(--green)' : 'var(--pink)' }}>{fmt.currency(totalNet + totalExpenses)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div style={{ marginTop:12, fontSize:14, color:'var(--muted)', letterSpacing:1 }}>
              ◈ ROI = 銷售收入 ÷ 廣告費用　◈ ROI ≥ 3x 顯示綠色　◈ 其他費用（薪資/房租等）在「公司損益表」頁面輸入
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2：品牌損益 ── */}
      {tab === 'brand' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
            {['TOOLA','LEON','TAKUYA'].map(bid => {
              const brand = BRANDS[bid];
              // 把共用(ERP/momo)依比例分配或單獨顯示
              const d = brandTotals[bid] || { revenue:0, cost:0, ad:0, gross:0, net:0 };
              return (
                <div key={bid} style={{ background:brand.bg, border:`1px solid ${brand.color}30`, borderRadius:4, padding:18 }}>
                  <div style={{ fontFamily:'var(--title)', fontSize:18, fontWeight:700, color:brand.color, letterSpacing:2, marginBottom:12 }}>{brand.name}</div>
                  {[
                    { label:'銷售收入', value:d.revenue, color:brand.color },
                    { label:'銷貨成本', value:d.cost,    color:'var(--pink)' },
                    { label:'毛利',     value:d.gross,   color:'var(--green)' },
                    { label:'廣告費用', value:d.ad,      color:'var(--yellow)' },
                    { label:'賣場淨利', value:d.net,     color: d.net>=0?'var(--green)':'var(--pink)', big:true },
                  ].map(({ label, value, color, big }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize:18, color:'rgba(180,180,255,0.8)', letterSpacing:1 }}>{label}</span>
                      <span style={{ fontSize:big?14:12, fontWeight:big?700:400, color, fontFamily:'var(--mono)' }}>{fmt.currency(value)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="card" style={{ background:'rgba(0,245,255,0.02)' }}>
            <div className="card-title">momo / 經銷（跨品牌）<span>需依產品代號拆分，串接 Google Sheets 後自動計算</span></div>
            <div style={{ fontSize:14, color:'var(--muted)', letterSpacing:1, lineHeight:2 }}>
              ◈ momo 和經銷報表同時包含多個品牌的商品<br/>
              ◈ 串接 Google Sheets 後，系統會依產品代號前綴自動拆分各品牌收入<br/>
              ◈ 目前本機測試模式顯示的是整體數字
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3：公司損益表 ── */}
      {tab === 'total' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title">公司損益表 <span>{year}年{month}月</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th style={{ width:'65%' }}>項目</th><th style={{ textAlign:'right' }}>金額 (NTD)</th></tr></thead>
                <tbody>
                  <tr className="pnl-section-row"><td colSpan={2} style={{ paddingLeft:16 }}>一、銷貨收入</td></tr>
                  {storeRows.map(s => (
                    <tr key={s.id}>
                      <td style={{ paddingLeft:28, fontSize:17 }}>{s.name}</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color:'var(--cyan)' }}>{fmt.currency(s.revenue)}</td>
                    </tr>
                  ))}
                  <tr className="pnl-total-row">
                    <td style={{ fontWeight:700, paddingLeft:12 }}>銷貨收入合計</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700 }}>{fmt.currency(totalRevenue)}</td>
                  </tr>

                  <tr className="pnl-section-row"><td colSpan={2} style={{ paddingLeft:16 }}>二、銷貨成本</td></tr>
                  <tr>
                    <td style={{ paddingLeft:28, fontSize:17 }}>銷貨成本合計</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color:'var(--pink)' }}>{fmt.currency(totalCost)}</td>
                  </tr>
                  <tr className="pnl-total-row">
                    <td style={{ fontWeight:700, paddingLeft:12 }}>毛利</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--green)' }}>{fmt.currency(totalGross)}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft:12, fontSize:19, color:'rgba(200,200,255,0.9)', fontWeight:600 }}>毛利率</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color:'var(--green)' }}>{fmt.pct(totalGross/totalRevenue)}</td>
                  </tr>

                  <tr className="pnl-section-row"><td colSpan={2} style={{ paddingLeft:16 }}>三、行銷費用（各賣場廣告費）</td></tr>
                  {storeRows.filter(s => s.ad > 0).map(s => (
                    <tr key={s.id}>
                      <td style={{ paddingLeft:28, fontSize:17 }}>{s.name} 廣告費</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color:'var(--yellow)' }}>{fmt.currency(s.ad)}</td>
                    </tr>
                  ))}
                  <tr className="pnl-total-row">
                    <td style={{ fontWeight:700, paddingLeft:12 }}>廣告費合計</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--yellow)' }}>{fmt.currency(totalAd)}</td>
                  </tr>

                  <tr className="pnl-section-row"><td colSpan={2} style={{ paddingLeft:16 }}>四、其他營業費用</td></tr>
                  {EXPENSE_ITEMS.map(item => (
                    <tr key={item}>
                      <td style={{ paddingLeft:28, fontSize:17 }}>{item}</td>
                      <td style={{ padding:0 }}>
                        <div className="money-input">
                          <span className="money-input-prefix">$</span>
                          <input type="text" inputMode="numeric"
                            value={expenses[item] ? Number(expenses[item]).toLocaleString() : ''}
                            placeholder="點擊輸入"
                            onChange={e => { const v = Number(e.target.value.replace(/,/g,'')); setExpenses(p => ({ ...p, [item]:isNaN(v)?0:v })); setSaved(false); }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="pnl-total-row">
                    <td style={{ fontWeight:700, paddingLeft:12 }}>其他費用合計</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--yellow)' }}>{fmt.currency(totalExpenses)}</td>
                  </tr>

                  <tr style={{ background: totalNet>=0 ? 'rgba(0,255,159,0.08)' : 'rgba(255,0,110,0.08)', borderTop:`1px solid ${totalNet>=0?'var(--green)':'var(--pink)'}` }}>
                    <td style={{ fontWeight:700, fontSize:19, paddingLeft:12, color: totalNet>=0 ? 'var(--green)' : 'var(--pink)', fontFamily:'var(--title)', letterSpacing:2 }}>本期淨利</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:21, fontWeight:700, color: totalNet>=0 ? 'var(--green)' : 'var(--pink)', padding:12, textShadow:`0 0 12px ${totalNet>=0?'var(--green)':'var(--pink)'}60` }}>
                      {fmt.currency(totalNet)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft:12, fontSize:19, color:'rgba(200,200,255,0.9)', fontWeight:600 }}>淨利率</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color: totalNet>=0 ? 'var(--green)' : 'var(--pink)' }}>{fmt.pct(totalNet/totalRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 右側摘要 */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'銷貨收入', value:totalRevenue, color:'var(--cyan)',   bg:'rgba(0,245,255,0.06)',   border:'rgba(0,245,255,0.2)' },
              { label:'銷貨成本', value:totalCost,    color:'var(--pink)',   bg:'rgba(255,0,110,0.06)',   border:'rgba(255,0,110,0.2)' },
              { label:'毛利',     value:totalGross,   color:'var(--green)',  bg:'rgba(0,255,159,0.06)',   border:'rgba(0,255,159,0.2)',  sub:`毛利率 ${fmt.pct(totalGross/totalRevenue)}`, subColor:'var(--green)' },
              { label:'廣告費合計',value:totalAd,     color:'var(--yellow)', bg:'rgba(245,196,0,0.06)',   border:'rgba(245,196,0,0.2)' },
              { label:'其他費用', value:totalExpenses,color:'var(--yellow)', bg:'rgba(245,196,0,0.04)',   border:'rgba(245,196,0,0.15)' },
              { label:'本期淨利', value:totalNet,     color: totalNet>=0?'var(--green)':'var(--pink)', bg: totalNet>=0?'rgba(0,255,159,0.08)':'rgba(255,0,110,0.08)', border: totalNet>=0?'rgba(0,255,159,0.3)':'rgba(255,0,110,0.3)', big:true, sub:`淨利率 ${fmt.pct(totalNet/totalRevenue)}`, subColor: totalNet>=0?'var(--green)':'var(--pink)' },
            ].map(({ label, value, color, bg, border, sub, big }) => (
              <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:4, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, color, fontWeight:500, letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>{label}</div>
                  {sub && <div style={{ fontSize:18, color: item.subColor||color, fontWeight:600, marginTop:2, letterSpacing:0.5, textShadow:`0 0 8px ${item.subColor||color}60` }}>{sub}</div>}
                </div>
                <div style={{ fontSize:big?22:16, fontWeight:700, color, fontFamily:big?'var(--title)':'var(--mono)', textShadow:`0 0 ${big?12:6}px ${color}50` }}>
                  {fmt.currency(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}