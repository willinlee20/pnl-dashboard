import { useState } from 'react';
import { fmt } from '../utils/format';
import { CustomerSearch, CustomerModal } from './CrmPage';
import { useCustomer } from '../context/CustomerContext';

const PRODUCTS = [
  {code:'BDLN101',name:'麗容酵素入浴劑 600g',cost:160,price:369},
  {code:'BDLN201',name:'麗容酵素入浴劑 880g',cost:186,price:499},
  {code:'BDLN203',name:'麗容酵素入浴劑 880g 3入組',cost:558,price:1299},
  {code:'BDTL101',name:'多樂 B5 多效保濕修護霜',cost:150,price:390},
  {code:'BDTL201',name:'多樂 嬰幼兒洗沐泡泡露－英國梨',cost:81,price:220},
  {code:'BDTL301',name:'多樂慕絲－英國梨&麝香',cost:62,price:199},
  {code:'BDTL401',name:'多樂慕絲－純淨無香',cost:62,price:199},
  {code:'BDTL0029',name:'多樂 嬰幼兒全系列體驗組',cost:293,price:890},
  {code:'NEW499TL02',name:'多樂 新生兒套組-梨香',cost:293,price:499},
];

const CHANNELS = ['官網','momo','蝦皮','經銷','現場','其他'];

export default function OrderPage() {
  const { addCustomer, addOrderToCustomer } = useCustomer();
  const [items, setItems] = useState([{code:'',name:'',qty:1,price:0,cost:0}]);
  const [channel, setChannel] = useState('經銷');
  const [customer, setCustomer] = useState(null);   // selected customer object
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const addItem = () => setItems(prev => [...prev, {code:'',name:'',qty:1,price:0,cost:0}]);
  const removeItem = idx => setItems(prev => prev.filter((_,i) => i!==idx));

  const selectProduct = (idx, code) => {
    const p = PRODUCTS.find(p => p.code === code);
    if (!p) return;
    setItems(prev => prev.map((item,i) => i===idx ? {...item, code:p.code, name:p.name, price:p.price, cost:p.cost} : item));
  };

  const updateItem = (idx, field, val) =>
    setItems(prev => prev.map((item,i) => i===idx ? {...item,[field]:val} : item));

  const subtotal  = items.reduce((s,item) => s + (Number(item.price)||0)*(Number(item.qty)||0), 0);
  const totalCost = items.reduce((s,item) => s + (Number(item.cost)||0)*(Number(item.qty)||0), 0);
  const gross     = subtotal - totalCost;

  const handleSelectCustomer = (c) => {
    if (c._new) {
      // 搜不到 → 開啟新增客戶 Modal，帶入已輸入的名稱
      setShowNewCustomer(true);
      setCustomerName(c.name);
    } else {
      setCustomer(c);
      setCustomerName(c.name);
    }
  };

  const handleNewCustomerSave = (data) => {
    const newC = addCustomer(data);
    setCustomer(newC);
    setCustomerName(newC.name);
    setShowNewCustomer(false);
  };

  const handleSubmit = () => {
    if (!customerName) { alert('請填入或選擇客戶'); return; }
    if (items.every(i => !i.code)) { alert('請選擇至少一項商品'); return; }
    const order = {
      id:      `ORD-${Date.now()}`,
      date:    new Date().toLocaleDateString('zh-TW'),
      channel, note,
      customer: customer?.name || customerName,
      customerId: customer?.id || null,
      items:   items.filter(i => i.code),
      subtotal, totalCost, gross,
    };
    setOrders(prev => [order, ...prev]);
    // 更新客戶訂單紀錄
    if (customer?.id) addOrderToCustomer(customer.id, order);
    // Reset
    setItems([{code:'',name:'',qty:1,price:0,cost:0}]);
    setCustomer(null); setCustomerName(''); setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="grid-2">
        {/* 開單表單 */}
        <div className="card">
          <div className="card-title">建立新訂單</div>

          {/* 管道 + 客戶 */}
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div style={{ width:120, flexShrink:0 }}>
              <label className="form-label">銷售管道</label>
              <select className="form-input" value={channel} onChange={e => setChannel(e.target.value)}>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label className="form-label">客戶 <span style={{ color:'var(--muted)', fontWeight:400 }}>（搜尋或建立）</span></label>
              <CustomerSearch
                value={customerName}
                onChange={setCustomerName}
                onSelect={handleSelectCustomer}
              />
            </div>
          </div>

          {/* 已選客戶資訊 */}
          {customer && (
            <div style={{ marginBottom:14, padding:'8px 12px', background:'rgba(0,245,255,0.06)', border:'1px solid rgba(0,245,255,0.2)', borderRadius:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <span style={{ fontSize:17, color:'var(--cyan)', fontWeight:600 }}>{customer.name}</span>
                <span style={{ fontSize:14, color:'var(--muted)', marginLeft:10 }}>{customer.code} · {customer.phone}</span>
              </div>
              <div style={{ fontSize:17, color:'var(--muted)' }}>
                累計 {fmt.currency(customer.totalAmount)} · {customer.orders.length} 筆
                <button className="btn btn-ghost btn-sm" style={{ marginLeft:8 }}
                  onClick={() => { setCustomer(null); setCustomerName(''); }}>
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 品項表格 */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>商品</th>
                  <th style={{ textAlign:'right', width:70 }}>數量</th>
                  <th style={{ textAlign:'right', width:100 }}>單價</th>
                  <th style={{ textAlign:'right', width:100 }}>小計</th>
                  <th style={{ width:36 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ minWidth:200 }}>
                      <select className="form-input" style={{ fontSize:18 }} value={item.code}
                        onChange={e => selectProduct(idx, e.target.value)}>
                        <option value="">-- 選擇商品 --</option>
                        {PRODUCTS.map(p => <option key={p.code} value={p.code}>{p.code}  {p.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <input className="form-input" type="number" min="1" value={item.qty}
                        style={{ textAlign:'right', width:60 }}
                        onChange={e => updateItem(idx,'qty',Number(e.target.value))}/>
                    </td>
                    <td>
                      <input className="form-input" type="number" value={item.price}
                        style={{ textAlign:'right', color:'var(--cyan)', width:80 }}
                        onChange={e => updateItem(idx,'price',Number(e.target.value))}/>
                    </td>
                    <td className="td-right td-mono" style={{ color:'var(--green)' }}>
                      {fmt.currency((item.price||0)*(item.qty||0))}
                    </td>
                    <td style={{ textAlign:'center' }}>
                      {items.length > 1 && (
                        <span style={{ color:'var(--muted)', cursor:'pointer', fontSize:20 }}
                          onClick={() => removeItem(idx)}>✕</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop:10, display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={addItem}>＋ 新增品項</button>
          </div>

          <div style={{ marginTop:12 }}>
            <label className="form-label">備註</label>
            <input className="form-input" placeholder="折扣說明、交貨條件等" value={note}
              onChange={e => setNote(e.target.value)}/>
          </div>

          {/* 金額摘要 */}
          <div style={{ marginTop:14, padding:14, background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border)' }}>
            {[
              { label:'銷售金額', value:subtotal, color:'var(--cyan)' },
              { label:'銷貨成本', value:totalCost, color:'var(--pink)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:18 }}>
                <span style={{ color:'var(--muted)' }}>{label}</span>
                <span style={{ color, fontFamily:'var(--mono)', fontWeight:600 }}>{fmt.currency(value)}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:10, fontSize:19 }}>
              <span style={{ color:'var(--text)', fontFamily:'var(--title)', letterSpacing:1 }}>毛利</span>
              <span style={{ color:'var(--green)', fontFamily:'var(--mono)', fontWeight:700, fontSize:20 }}>{fmt.currency(gross)}</span>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width:'100%', marginTop:14, justifyContent:'center', fontSize:18 }}
            onClick={handleSubmit}>
            {saved ? '✓ 訂單已建立' : '◈ 確認建立訂單'}
          </button>
        </div>

        {/* 訂單紀錄 */}
        <div className="card">
          <div className="card-title">本月手動開單紀錄 <span>{orders.length} 筆</span></div>
          {orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
              <div style={{ fontSize:30, marginBottom:10 }}>◻</div>
              <div style={{ fontSize:18, letterSpacing:1 }}>尚無手動訂單</div>
              <div style={{ fontSize:14, marginTop:6 }}>在左側填寫並確認建立</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>訂單編號</th><th>日期</th><th>管道</th>
                    <th>客戶</th>
                    <th style={{ textAlign:'right' }}>金額</th>
                    <th style={{ textAlign:'right' }}>毛利</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="td-mono" style={{ color:'var(--cyan)', fontSize:17 }}>{o.id}</td>
                      <td style={{ fontSize:17, color:'var(--muted)' }}>{o.date}</td>
                      <td><span className="badge badge-blue">{o.channel}</span></td>
                      <td style={{ fontSize:18 }}>{o.customer}</td>
                      <td className="td-right td-mono" style={{ color:'var(--cyan)', fontWeight:600 }}>{fmt.currency(o.subtotal)}</td>
                      <td className="td-right td-mono" style={{ color:'var(--green)', fontWeight:600 }}>{fmt.currency(o.gross)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop:14, padding:12, background:'rgba(0,245,255,0.03)', border:'1px solid var(--border)', borderRadius:3, fontSize:17, color:'var(--muted)', lineHeight:2 }}>
            ◈ 手動開單後數據自動計入銷貨總表和損益表<br/>
            ◈ 選擇已存在的客戶，訂單紀錄自動串連到 CRM<br/>
            ◈ 搜不到客戶時，系統會引導建立新客戶
          </div>
        </div>
      </div>

      {/* 新增客戶 Modal（從開單頁觸發） */}
      {showNewCustomer && (
        <CustomerModal
          initial={{ name:customerName }}
          onSave={handleNewCustomerSave}
          onClose={() => setShowNewCustomer(false)}
        />
      )}
    </div>
  );
}