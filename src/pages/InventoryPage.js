import { useState } from 'react';
import { fmt } from '../utils/format';
import { BRANDS, getBrandByCode } from '../utils/config';

const INIT_PRODUCTS = [
  { code:'BDLN101', name:'麗容酵素入浴劑 600g',           brand:'LEON',  cost:160, stock:145, safety:60,  sold:38  },
  { code:'BDLN201', name:'麗容酵素入浴劑 880g',           brand:'LEON',  cost:186, stock:12,  safety:50,  sold:68  },
  { code:'BDTL101', name:'多樂 B5 多效保濕修護霜',        brand:'TOOLA', cost:150, stock:28,  safety:60,  sold:142 },
  { code:'BDTL201', name:'多樂 嬰幼兒洗沐泡泡露－英國梨', brand:'TOOLA', cost:81,  stock:88,  safety:80,  sold:94  },
  { code:'BDTL301', name:'多樂慕絲－英國梨&麝香',         brand:'TOOLA', cost:62,  stock:35,  safety:80,  sold:198 },
  { code:'BDTL401', name:'多樂慕絲－純淨無香',            brand:'TOOLA', cost:62,  stock:62,  safety:80,  sold:112 },
  { code:'BDLN401', name:'麗容酵素 抗菌防螨洗衣精',       brand:'LEON',  cost:75,  stock:120, safety:100, sold:55  },
  { code:'BDTL901', name:'太陽便盆 學習馬桶－藍',         brand:'TOOLA', cost:310, stock:18,  safety:20,  sold:12  },
  { code:'BDTL1001',name:'太陽便盆 學習馬桶－粉',        brand:'TOOLA', cost:310, stock:22,  safety:20,  sold:8   },
];

const INIT_MATERIALS = [
  { id:1, name:'PE 夾鏈袋 A4',   size:'22×32cm',   unit:'個', forProduct:'通用',      stock:2000, safety:500,  cost:2.5,  vendor:'聯強包材', vendorTel:'02-12345678' },
  { id:2, name:'瓦楞紙箱 小',    size:'30×20×15cm', unit:'個', forProduct:'BDTL系列',  stock:350,  safety:100,  cost:18,   vendor:'大聯紙業', vendorTel:'02-87654321' },
  { id:3, name:'瓦楞紙箱 中',    size:'40×30×20cm', unit:'個', forProduct:'BDLN系列',  stock:120,  safety:80,   cost:25,   vendor:'大聯紙業', vendorTel:'02-87654321' },
  { id:4, name:'氣泡布捲',       size:'50cm寬',     unit:'捲', forProduct:'易碎品',    stock:8,    safety:5,    cost:220,  vendor:'包材王',   vendorTel:'03-11223344' },
  { id:5, name:'品牌貼紙 TOOLA', size:'5×5cm',      unit:'張', forProduct:'TOOLA系列', stock:5000, safety:1000, cost:0.8,  vendor:'彩虹印刷', vendorTel:'02-55556666' },
  { id:6, name:'品牌貼紙 LEON',  size:'5×5cm',      unit:'張', forProduct:'麗容系列',  stock:3000, safety:1000, cost:0.8,  vendor:'彩虹印刷', vendorTel:'02-55556666' },
];

const statusOf = (stock, safety) => {
  if (stock <= 0)            return { label:'缺貨',    cls:'badge-danger', color:'var(--red)'    };
  if (stock < safety * 0.5) return { label:'嚴重不足', cls:'badge-danger', color:'var(--pink)'   };
  if (stock < safety)       return { label:'庫存偏低', cls:'badge-warn',   color:'var(--yellow)' };
  return                           { label:'正常',     cls:'badge-ok',     color:'var(--green)'  };
};

// ── 新增商品表單 ──────────────────────────────────────────────
function AddProductForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    code:'', name:'', brand:'TOOLA', cost:0, safety:50, stock:0, sold:0
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.code.trim()) { setError('請填入產品代號'); return; }
    if (!form.name.trim()) { setError('請填入品名');     return; }
    if (!form.cost)        { setError('請填入含稅成本'); return; }
    onAdd({ ...form, code: form.code.trim().toUpperCase(), cost: Number(form.cost), safety: Number(form.safety), stock: Number(form.stock), sold: Number(form.sold) });
    onClose();
  };

  return (
    <div style={{ marginBottom:16, padding:16, background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border-strong)' }}>
      <div style={{ fontFamily:'var(--title)', fontSize:18, fontWeight:700, color:'var(--cyan)', letterSpacing:2, marginBottom:14 }}>新增商品</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10, marginBottom:10 }}>
        <div>
          <label className="form-label">產品代號 *</label>
          <input className="form-input" placeholder="例：BDTL501" value={form.code}
            onChange={e => set('code', e.target.value)}
            style={{ fontFamily:'var(--mono)', color:'var(--cyan)' }}/>
        </div>
        <div>
          <label className="form-label">品名 *</label>
          <input className="form-input" placeholder="例：多樂 嬰幼兒防護角 4入－粉直角" value={form.name}
            onChange={e => set('name', e.target.value)}/>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
        <div>
          <label className="form-label">品牌</label>
          <select className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)}>
            <option value="TOOLA">TOOLA 多樂</option>
            <option value="LEON">麗容酵素 LEON</option>
            <option value="TAKUYA">Takuya 拓屋</option>
          </select>
        </div>
        <div>
          <label className="form-label">含稅成本 *</label>
          <input className="form-input" type="number" min="0" placeholder="0" value={form.cost || ''}
            onChange={e => set('cost', e.target.value)}
            style={{ fontFamily:'var(--mono)', color:'var(--yellow)' }}/>
        </div>
        <div>
          <label className="form-label">安全庫存量</label>
          <input className="form-input" type="number" min="0" placeholder="50" value={form.safety || ''}
            onChange={e => set('safety', e.target.value)}/>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <div>
          <label className="form-label">初始庫存數量</label>
          <input className="form-input" type="number" min="0" placeholder="0" value={form.stock || ''}
            onChange={e => set('stock', e.target.value)}
            style={{ fontFamily:'var(--mono)', color:'var(--green)' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
          <div style={{ flex:1 }}>
            {error && <div style={{ fontSize:14, color:'var(--pink)', marginBottom:8 }}>⚠ {error}</div>}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSubmit}>
          ◈ 確認新增商品
        </button>
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
      </div>

      <div style={{ marginTop:10, fontSize:14, color:'var(--muted)', letterSpacing:1, lineHeight:1.8 }}>
        ◈ 串接 Google Sheets 後，此商品會自動同步到商品總表<br/>
        ◈ 如果是套組，請在套組成分表另外設定成分
      </div>
    </div>
  );
}

// ── 盤點調整 Modal ────────────────────────────────────────────
function StocktakeModal({ product, onSave, onClose }) {
  const [newStock, setNewStock] = useState(product.stock);
  const [note, setNote] = useState('');
  const diff = newStock - product.stock;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border-strong)', borderRadius:6, padding:24, width:380, boxShadow:'0 0 40px rgba(0,245,255,0.1)' }}>
        <div style={{ fontFamily:'var(--title)', fontSize:18, fontWeight:700, color:'var(--cyan)', letterSpacing:2, marginBottom:4 }}>盤點調整</div>
        <div style={{ fontSize:14, color:'var(--muted)', marginBottom:16, letterSpacing:1 }}>{product.code} {product.name}</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div style={{ padding:12, background:'var(--bg3)', borderRadius:3, textAlign:'center' }}>
            <div style={{ fontSize:14, color:'var(--muted)', letterSpacing:1, marginBottom:4 }}>系統庫存</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:24, fontWeight:700, color:'var(--muted)' }}>{product.stock}</div>
          </div>
          <div style={{ padding:12, background:'var(--bg3)', borderRadius:3, textAlign:'center', border:'1px solid rgba(0,245,255,0.3)' }}>
            <div style={{ fontSize:14, color:'var(--cyan)', letterSpacing:1, marginBottom:4 }}>實際盤點數量</div>
            <input type="number" min="0" value={newStock}
              onChange={e => setNewStock(Number(e.target.value))}
              style={{ fontFamily:'var(--mono)', fontSize:24, fontWeight:700, color:'var(--cyan)', background:'transparent', border:'none', outline:'none', textAlign:'center', width:'100%' }}/>
          </div>
        </div>

        {diff !== 0 && (
          <div style={{ padding:'8px 12px', marginBottom:12, borderRadius:3, background: diff > 0 ? 'rgba(0,255,159,0.08)' : 'rgba(255,0,110,0.08)', border:`1px solid ${diff > 0 ? 'rgba(0,255,159,0.3)' : 'rgba(255,0,110,0.3)'}`, fontSize:17, color: diff > 0 ? 'var(--green)' : 'var(--pink)', textAlign:'center' }}>
            差異：{diff > 0 ? '+' : ''}{diff} 個（{diff > 0 ? '盤盈' : '盤虧'}）
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label className="form-label">盤點備註</label>
          <input className="form-input" placeholder="例：月底盤點、倉庫核對..." value={note} onChange={e => setNote(e.target.value)}/>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}
            onClick={() => { onSave(product.code, newStock, diff, note); onClose(); }}>
            ◈ 確認盤點
          </button>
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
}

// ── Tab 1：成品庫存 ───────────────────────────────────────────
function ProductStock({ products, setProducts }) {
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [showAddForm, setShowAddForm]   = useState(false);
  const [stocktakeTarget, setStocktakeTarget] = useState(null);
  const [restock, setRestock] = useState({ code:'', qty:0, note:'' });
  const [logs, setLogs] = useState([]);

  const filtered = filterBrand === 'ALL' ? products : products.filter(p => p.brand === filterBrand);
  const warnings = products.filter(p => p.stock < p.safety).length;

  const handleAddProduct = (newProd) => {
    setProducts(prev => [...prev, newProd]);
    setLogs(prev => [{ type:'新增', date:new Date().toLocaleDateString('zh-TW'), code:newProd.code, name:newProd.name, qty:newProd.stock, note:'新商品建立' }, ...prev]);
  };

  const handleRestock = () => {
    if (!restock.code || !restock.qty) return;
    setProducts(prev => prev.map(p => p.code === restock.code ? { ...p, stock: p.stock + Number(restock.qty) } : p));
    const prod = products.find(p => p.code === restock.code);
    setLogs(prev => [{ type:'入庫', date:new Date().toLocaleDateString('zh-TW'), code:restock.code, name:prod?.name||'', qty:Number(restock.qty), note:restock.note }, ...prev]);
    setRestock({ code:'', qty:0, note:'' });
  };

  const handleStocktake = (code, newStock, diff, note) => {
    setProducts(prev => prev.map(p => p.code === code ? { ...p, stock: newStock } : p));
    const prod = products.find(p => p.code === code);
    setLogs(prev => [{ type:'盤點', date:new Date().toLocaleDateString('zh-TW'), code, name:prod?.name||'', qty:diff, note: note || `盤點調整（${diff > 0 ? '+' : ''}${diff}）` }, ...prev]);
  };

  return (
    <div>
      {stocktakeTarget && (
        <StocktakeModal product={stocktakeTarget} onSave={handleStocktake} onClose={() => setStocktakeTarget(null)}/>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            成品庫存
            {warnings > 0 && <span style={{ color:'var(--pink)' }}>⚠ {warnings} 項預警</span>}
          </div>

          {/* 篩選 + 新增按鈕 */}
          <div style={{ display:'flex', gap:6, marginBottom:14, justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:4 }}>
              {['ALL','TOOLA','LEON','TAKUYA'].map(b => {
                const brand = BRANDS[b];
                return (
                  <button key={b}
                    className={`btn btn-sm ${filterBrand===b ? 'btn-primary' : 'btn-ghost'}`}
                    style={filterBrand===b && brand ? { borderColor:brand.color, color:brand.color, background:brand.bg } : {}}
                    onClick={() => setFilterBrand(b)}>
                    {b === 'ALL' ? '全部' : brand?.name || b}
                  </button>
                );
              })}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(v => !v)}>
              {showAddForm ? '✕ 取消' : '＋ 新增商品'}
            </button>
          </div>

          {showAddForm && <AddProductForm onAdd={handleAddProduct} onClose={() => setShowAddForm(false)}/>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>代號</th><th>品名</th><th>品牌</th>
                  <th style={{ textAlign:'right' }}>現有庫存</th>
                  <th style={{ textAlign:'right' }}>安全庫存</th>
                  <th style={{ textAlign:'right' }}>含稅成本</th>
                  <th>狀態</th><th>進度</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const s = statusOf(p.stock, p.safety);
                  const brand = BRANDS[p.brand];
                  const pct = Math.min(100, Math.round((p.stock / p.safety) * 100));
                  return (
                    <tr key={p.code}>
                      <td style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:700, color:'var(--cyan)', letterSpacing:1 }}>{p.code}</td>
                      <td style={{ fontSize:17, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</td>
                      <td>
                        <span style={{ fontSize:14, color:brand?.color||'var(--muted)', background:brand?.bg, padding:'2px 6px', borderRadius:3, border:`1px solid ${brand?.color||'var(--muted)'}40`, letterSpacing:1 }}>
                          {brand?.name || p.brand}
                        </span>
                      </td>
                      <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:s.color, fontWeight:700 }}>{p.stock}</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)', fontSize:14 }}>{p.safety}</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--yellow)', fontSize:14 }}>{fmt.currency(p.cost)}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ width:70 }}>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width:`${pct}%`, background:s.color, boxShadow:`0 0 4px ${s.color}` }}/>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize:14, padding:'3px 8px' }}
                          onClick={() => setStocktakeTarget(p)}>盤點</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* 入庫登錄 */}
          <div className="card">
            <div className="card-title">成品入庫登錄</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <label className="form-label">選擇商品</label>
                <select className="form-input" value={restock.code} onChange={e => setRestock(p => ({ ...p, code:e.target.value }))}>
                  <option value="">-- 選擇品項 --</option>
                  {products.map(p => <option key={p.code} value={p.code}>{p.code}　{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">入庫數量</label>
                <input className="form-input" type="number" min="1" placeholder="0"
                  value={restock.qty || ''} onChange={e => setRestock(p => ({ ...p, qty:e.target.value }))}
                  style={{ fontFamily:'var(--mono)', color:'var(--green)' }}/>
              </div>
              <div>
                <label className="form-label">備註（廠商、批號）</label>
                <input className="form-input" placeholder="選填" value={restock.note} onChange={e => setRestock(p => ({ ...p, note:e.target.value }))}/>
              </div>
              <button className="btn btn-primary" onClick={handleRestock} style={{ justifyContent:'center' }}>◈ 確認入庫</button>
            </div>
          </div>

          {/* 入庫紀錄 */}
          <div className="card">
            <div className="card-title">操作紀錄 <span>{logs.length} 筆</span></div>
            {logs.length === 0
              ? <div style={{ textAlign:'center', padding:'20px 0', color:'var(--muted)', fontSize:14, letterSpacing:1 }}>◻ 尚無紀錄</div>
              : <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>日期</th><th>類型</th><th>代號</th><th style={{ textAlign:'right' }}>數量</th><th>備註</th></tr>
                    </thead>
                    <tbody>
                      {logs.map((l, i) => {
                        const typeColor = l.type === '入庫' ? 'var(--green)' : l.type === '盤點' ? 'var(--yellow)' : 'var(--cyan)';
                        return (
                          <tr key={i}>
                            <td style={{ fontSize:14, color:'var(--muted)' }}>{l.date}</td>
                            <td><span className="badge" style={{ background:`${typeColor}15`, color:typeColor, border:`1px solid ${typeColor}40` }}>{l.type}</span></td>
                            <td style={{ fontFamily:'var(--mono)', color:'var(--cyan)', fontSize:14 }}>{l.code}</td>
                            <td style={{ textAlign:'right', fontFamily:'var(--mono)', color: l.qty >= 0 ? 'var(--green)' : 'var(--pink)' }}>
                              {l.qty >= 0 ? '+' : ''}{l.qty}
                            </td>
                            <td style={{ fontSize:14, color:'var(--muted)' }}>{l.note || '–'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2：耗材/包材 ──────────────────────────────────────────
function MaterialStock({ materials, setMaterials }) {
  const [showForm, setShowForm] = useState(false);
  const [restock, setRestock] = useState({ id:'', qty:0, note:'' });
  const [newItem, setNewItem] = useState({ name:'', size:'', unit:'個', forProduct:'', stock:0, safety:0, cost:0, vendor:'', vendorTel:'' });
  const [logs, setLogs] = useState([]);

  const handleRestock = () => {
    if (!restock.id || !restock.qty) return;
    setMaterials(prev => prev.map(m => m.id === Number(restock.id) ? { ...m, stock: m.stock + Number(restock.qty) } : m));
    const mat = materials.find(m => m.id === Number(restock.id));
    setLogs(prev => [{ date:new Date().toLocaleDateString('zh-TW'), name:mat?.name||'', qty:Number(restock.qty), note:restock.note }, ...prev]);
    setRestock({ id:'', qty:0, note:'' });
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    setMaterials(prev => [...prev, { ...newItem, id:Date.now(), stock:Number(newItem.stock), safety:Number(newItem.safety), cost:Number(newItem.cost) }]);
    setNewItem({ name:'', size:'', unit:'個', forProduct:'', stock:0, safety:0, cost:0, vendor:'', vendorTel:'' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="card mb-16">
        <div className="card-title">
          耗材 / 包材庫存
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ 取消' : '＋ 新增耗材'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom:16, padding:14, background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border-strong)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:10 }}>
              {[
                { label:'品名 *', key:'name', placeholder:'例：PE夾鏈袋' },
                { label:'規格/尺寸', key:'size', placeholder:'例：22×32cm' },
                { label:'單位', key:'unit', placeholder:'個/張/捲/箱' },
                { label:'對應產品', key:'forProduct', placeholder:'例：BDTL系列' },
                { label:'生產廠商', key:'vendor', placeholder:'廠商名稱' },
                { label:'廠商電話', key:'vendorTel', placeholder:'聯絡電話' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" placeholder={placeholder}
                    value={newItem[key]} onChange={e => setNewItem(p => ({ ...p, [key]:e.target.value }))}/>
                </div>
              ))}
              {[
                { label:'現有數量', key:'stock' },
                { label:'安全庫存', key:'safety' },
                { label:'單位成本', key:'cost' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type="number" placeholder="0"
                    value={newItem[key] || ''} onChange={e => setNewItem(p => ({ ...p, [key]:e.target.value }))}
                    style={{ fontFamily:'var(--mono)', color:'var(--yellow)' }}/>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleAddItem} style={{ width:'100%', justifyContent:'center' }}>◈ 確認新增</button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>品名</th><th>規格</th><th>單位</th><th>對應產品</th><th style={{ textAlign:'right' }}>現有</th><th style={{ textAlign:'right' }}>安全</th><th style={{ textAlign:'right' }}>單位成本</th><th>狀態</th><th>廠商</th></tr>
            </thead>
            <tbody>
              {materials.map(m => {
                const s = statusOf(m.stock, m.safety);
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight:600, fontSize:17 }}>{m.name}</td>
                    <td style={{ fontSize:14, color:'var(--muted)' }}>{m.size}</td>
                    <td style={{ fontSize:14, color:'var(--muted)' }}>{m.unit}</td>
                    <td style={{ fontSize:14, color:'var(--cyan)' }}>{m.forProduct}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:s.color, fontWeight:700 }}>{m.stock}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)', fontSize:14 }}>{m.safety}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--yellow)', fontSize:14 }}>{fmt.currency(m.cost)}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td style={{ fontSize:14 }}>{m.vendor}<br/><span style={{ color:'var(--muted)', fontSize:14 }}>{m.vendorTel}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">耗材入庫登錄</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div>
              <label className="form-label">選擇耗材</label>
              <select className="form-input" value={restock.id} onChange={e => setRestock(p => ({ ...p, id:e.target.value }))}>
                <option value="">-- 選擇品項 --</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name}（{m.size}）</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">入庫數量</label>
              <input className="form-input" type="number" min="1" placeholder="0"
                value={restock.qty || ''} onChange={e => setRestock(p => ({ ...p, qty:e.target.value }))}
                style={{ fontFamily:'var(--mono)', color:'var(--green)' }}/>
            </div>
            <div>
              <label className="form-label">備註</label>
              <input className="form-input" placeholder="批號、廠商出貨單號（選填）" value={restock.note} onChange={e => setRestock(p => ({ ...p, note:e.target.value }))}/>
            </div>
            <button className="btn btn-primary" onClick={handleRestock} style={{ justifyContent:'center' }}>◈ 確認入庫</button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">耗材入庫紀錄 <span>{logs.length} 筆</span></div>
          {logs.length === 0
            ? <div style={{ textAlign:'center', padding:'20px 0', color:'var(--muted)', fontSize:14 }}>◻ 尚無紀錄</div>
            : <div className="table-wrap">
                <table>
                  <thead><tr><th>日期</th><th>品名</th><th style={{ textAlign:'right' }}>數量</th><th>備註</th></tr></thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={i}>
                        <td style={{ fontSize:14, color:'var(--muted)' }}>{l.date}</td>
                        <td style={{ fontSize:17 }}>{l.name}</td>
                        <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--green)' }}>+{l.qty}</td>
                        <td style={{ fontSize:14, color:'var(--muted)' }}>{l.note || '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Tab 3：庫存資產總表 ───────────────────────────────────────
function AssetSummary({ products, materials }) {
  const brandGroups = {};
  products.forEach(p => {
    if (!brandGroups[p.brand]) brandGroups[p.brand] = { items:[], total:0 };
    const value = p.stock * p.cost;
    brandGroups[p.brand].items.push({ ...p, value });
    brandGroups[p.brand].total += value;
  });
  const productTotal  = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const materialTotal = materials.reduce((s, m) => s + m.stock * m.cost, 0);
  const grandTotal    = productTotal + materialTotal;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'成品庫存資產',  value:productTotal,  color:'var(--cyan)',   bg:'rgba(0,245,255,0.06)',   border:'rgba(0,245,255,0.2)' },
          { label:'耗材/包材資產', value:materialTotal, color:'var(--purple)', bg:'rgba(180,79,255,0.06)',  border:'rgba(180,79,255,0.2)' },
          { label:'庫存總資產',    value:grandTotal,    color:'var(--green)',  bg:'rgba(0,255,159,0.08)',   border:'rgba(0,255,159,0.3)', big:true },
        ].map(({ label, value, color, bg, border, big }) => (
          <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:4, padding:'18px 20px' }}>
            <div style={{ fontSize:14, color, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:big?28:22, fontWeight:700, color, fontFamily:'var(--title)', textShadow:`0 0 ${big?16:8}px ${color}60` }}>
              {fmt.currency(value)}
            </div>
            <div style={{ fontSize:14, color:'var(--muted)', marginTop:4, letterSpacing:1 }}>數量 × 含稅成本</div>
          </div>
        ))}
      </div>

      <div className="card mb-16">
        <div className="card-title">成品庫存資產明細（依品牌）</div>
        {Object.entries(brandGroups).map(([brandId, group]) => {
          const brand = BRANDS[brandId] || { name:brandId, color:'var(--muted)', bg:'transparent' };
          return (
            <div key={brandId} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, padding:'7px 12px', background:brand.bg, borderRadius:3, border:`1px solid ${brand.color}30` }}>
                <span style={{ fontFamily:'var(--title)', fontSize:18, fontWeight:700, color:brand.color, letterSpacing:2 }}>{brand.name}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color:brand.color }}>{fmt.currency(group.total)}</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>代號</th><th>品名</th><th style={{ textAlign:'right' }}>庫存數量</th><th style={{ textAlign:'right' }}>含稅成本</th><th style={{ textAlign:'right' }}>資產金額</th><th>庫存狀態</th></tr></thead>
                  <tbody>
                    {group.items.map(p => {
                      const s = statusOf(p.stock, p.safety);
                      return (
                        <tr key={p.code}>
                          <td style={{ fontFamily:'var(--mono)', color:'var(--cyan)', fontSize:14 }}>{p.code}</td>
                          <td style={{ fontSize:17 }}>{p.name}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--mono)' }}>{p.stock}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)' }}>{fmt.currency(p.cost)}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:brand.color, fontWeight:600 }}>{fmt.currency(p.value)}</td>
                          <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">耗材/包材資產明細</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>品名</th><th>規格</th><th style={{ textAlign:'right' }}>數量</th><th>單位</th><th style={{ textAlign:'right' }}>單位成本</th><th style={{ textAlign:'right' }}>資產金額</th><th>狀態</th></tr></thead>
            <tbody>
              {materials.map(m => {
                const s = statusOf(m.stock, m.safety);
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight:600, fontSize:17 }}>{m.name}</td>
                    <td style={{ fontSize:14, color:'var(--muted)' }}>{m.size}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)' }}>{m.stock}</td>
                    <td style={{ fontSize:14, color:'var(--muted)' }}>{m.unit}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)' }}>{fmt.currency(m.cost)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--purple)', fontWeight:600 }}>{fmt.currency(m.stock * m.cost)}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background:'rgba(180,79,255,0.08)', borderTop:'1px solid rgba(180,79,255,0.3)' }}>
                <td colSpan={5} style={{ fontWeight:700, color:'var(--purple)', padding:'10px 12px', fontFamily:'var(--title)', letterSpacing:1 }}>耗材合計</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--purple)', fontSize:18, padding:'10px 12px' }}>{fmt.currency(materialTotal)}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 主頁面 ────────────────────────────────────────────────────
export default function InventoryPage() {
  const [tab, setTab]             = useState('products');
  const [products, setProducts]   = useState(INIT_PRODUCTS);
  const [materials, setMaterials] = useState(INIT_MATERIALS);

  const prodWarnings = products.filter(p => p.stock < p.safety).length;
  const matWarnings  = materials.filter(m => m.stock < m.safety).length;

  const TABS = [
    { id:'products',  label:'成品庫存',    badge: prodWarnings > 0 ? prodWarnings : null },
    { id:'materials', label:'耗材/包材',   badge: matWarnings  > 0 ? matWarnings  : null },
    { id:'assets',    label:'庫存資產總表', badge: null },
  ];

  return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id}
            className={`btn ${tab===t.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius:'4px 4px 0 0', borderBottom:'none', position:'relative', marginBottom:-1 }}
            onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge && (
              <span style={{ marginLeft:6, background:'var(--pink)', color:'#fff', borderRadius:10, fontSize:14, padding:'1px 6px', fontWeight:700 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === 'products'  && <ProductStock  products={products}   setProducts={setProducts}/>}
      {tab === 'materials' && <MaterialStock materials={materials} setMaterials={setMaterials}/>}
      {tab === 'assets'    && <AssetSummary  products={products}   materials={materials}/>}
    </div>
  );
}