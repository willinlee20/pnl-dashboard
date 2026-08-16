import { useState, useRef, useEffect } from 'react';
import { useCustomer, CUSTOMER_TYPES } from '../context/CustomerContext';
import { fmt } from '../utils/format';

// ── 客戶搜尋下拉（開單頁用） ─────────────────────────────────
export function CustomerSearch({ value, onChange, onSelect, placeholder='搜尋客戶名稱、代號、電話…' }) {
  const { searchCustomers } = useCustomer();
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (v) => {
    setQuery(v);
    onChange?.(v);
    if (v.length >= 1) {
      setResults(searchCustomers(v));
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (c) => {
    setQuery(c.name);
    setOpen(false);
    onSelect?.(c);
  };

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <input className="form-input" value={query} placeholder={placeholder}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => query.length >= 1 && setOpen(true)}/>
      {open && results.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--bg2)', border:'1px solid var(--border-strong)', borderRadius:4, zIndex:100, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          {results.map(c => {
            const type = CUSTOMER_TYPES[c.type];
            return (
              <div key={c.id} onClick={() => handleSelect(c)}
                style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}
                onMouseOver={e => e.currentTarget.style.background='rgba(0,245,255,0.05)'}
                onMouseOut={e => e.currentTarget.style.background='transparent'}>
                <span style={{ fontSize:14, padding:'2px 7px', borderRadius:3, background:type?.bg, color:type?.color, border:`1px solid ${type?.color}40`, letterSpacing:1, flexShrink:0 }}>
                  {type?.label}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:18, fontWeight:600 }}>{c.name}</div>
                  <div style={{ fontSize:14, color:'var(--muted)' }}>{c.code} · {c.contact} · {c.phone}</div>
                </div>
                <div style={{ fontSize:17, color:'var(--cyan)', fontFamily:'var(--mono)', flexShrink:0 }}>
                  {fmt.currency(c.totalAmount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {open && results.length === 0 && query.length >= 1 && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:4, zIndex:100, padding:'12px 14px' }}>
          <div style={{ fontSize:17, color:'var(--muted)', marginBottom:8 }}>找不到「{query}」</div>
          <button className="btn btn-primary btn-sm" style={{ width:'100%', justifyContent:'center' }}
            onClick={() => { setOpen(false); onSelect?.({ _new:true, name:query }); }}>
            ＋ 以「{query}」建立新客戶
          </button>
        </div>
      )}
    </div>
  );
}

// ── 新增/編輯客戶表單 Modal ─────────────────────────────────
export function CustomerModal({ initial={}, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || '', type:'DEALER', contact:'',
    phone:'', email:'', taxId:'', address:'', note:'',
    ...initial,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border-strong)', borderRadius:6, padding:28, width:540, maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ fontFamily:'var(--title)', fontSize:21, fontWeight:700, color:'var(--cyan)', letterSpacing:3, marginBottom:20 }}>
          {initial.id ? '編輯客戶' : '新增客戶'}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div style={{ gridColumn:'span 2' }}>
            <label className="form-label">客戶名稱 *</label>
            <input className="form-input" value={form.name} placeholder="公司名稱或個人姓名"
              onChange={e => set('name', e.target.value)}/>
          </div>
          <div>
            <label className="form-label">客戶分類</label>
            <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
              {Object.values(CUSTOMER_TYPES).map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">統一編號（B2B）</label>
            <input className="form-input" value={form.taxId} placeholder="12345678"
              onChange={e => set('taxId', e.target.value)}/>
          </div>
          <div>
            <label className="form-label">聯絡人</label>
            <input className="form-input" value={form.contact} placeholder="姓名"
              onChange={e => set('contact', e.target.value)}/>
          </div>
          <div>
            <label className="form-label">電話</label>
            <input className="form-input" value={form.phone} placeholder="02-12345678"
              onChange={e => set('phone', e.target.value)}/>
          </div>
          <div style={{ gridColumn:'span 2' }}>
            <label className="form-label">Email</label>
            <input className="form-input" value={form.email} placeholder="email@example.com"
              onChange={e => set('email', e.target.value)}/>
          </div>
          <div style={{ gridColumn:'span 2' }}>
            <label className="form-label">主要配送地址</label>
            <input className="form-input" value={form.address} placeholder="縣市區路段號"
              onChange={e => set('address', e.target.value)}/>
          </div>
          <div style={{ gridColumn:'span 2' }}>
            <label className="form-label">備註</label>
            <input className="form-input" value={form.note} placeholder="信用額度、特殊條件等"
              onChange={e => set('note', e.target.value)}/>
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}
            onClick={() => { if (form.name) onSave(form); }}>
            ◈ {initial.id ? '儲存修改' : '確認新增'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
}

// ── 客戶詳情側邊抽屜 ─────────────────────────────────────────
function CustomerDrawer({ customer, onClose, onEdit }) {
  const type = CUSTOMER_TYPES[customer.type];
  return (
    <div style={{ position:'fixed', top:0, right:0, bottom:0, width:420, background:'var(--bg1)', borderLeft:'1px solid var(--border-strong)', zIndex:200, display:'flex', flexDirection:'column', boxShadow:'-8px 0 32px rgba(0,0,0,0.4)' }}>
      {/* Header */}
      <div style={{ padding:'20px 22px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <span style={{ fontSize:14, padding:'2px 8px', borderRadius:3, background:type?.bg, color:type?.color, border:`1px solid ${type?.color}40`, letterSpacing:1 }}>
              {type?.label}
            </span>
            <div style={{ fontFamily:'var(--title)', fontSize:23, fontWeight:700, color:'var(--text)', marginTop:8, letterSpacing:1 }}>{customer.name}</div>
            <div style={{ fontSize:17, color:'var(--muted)', marginTop:2 }}>{customer.code}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onEdit(customer)}>✏ 編輯</button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:16 }}>
          {[
            { label:'累計購買', value:fmt.currency(customer.totalAmount), color:'var(--cyan)' },
            { label:'訂單筆數', value:`${customer.orders.length} 筆`, color:'var(--green)' },
            { label:'最後購買', value:customer.lastOrderDate || '–', color:'var(--muted)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'var(--bg3)', borderRadius:4, padding:'8px 10px', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, color:'var(--muted)', marginBottom:3, letterSpacing:1 }}>{label}</div>
              <div style={{ fontSize:18, fontWeight:600, color, fontFamily:'var(--mono)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 22px' }}>
        {/* Contact info */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:14, color:'var(--cyan)', letterSpacing:2, textTransform:'uppercase', marginBottom:10, fontFamily:'var(--title)' }}>聯絡資訊</div>
          {[
            { label:'聯絡人', value:customer.contact },
            { label:'電話',   value:customer.phone },
            { label:'Email',  value:customer.email },
            { label:'統編',   value:customer.taxId },
            { label:'備註',   value:customer.note },
          ].filter(r => r.value).map(({ label, value }) => (
            <div key={label} style={{ display:'flex', gap:12, padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:14, color:'var(--muted)', width:48, flexShrink:0 }}>{label}</span>
              <span style={{ fontSize:18, color:'var(--text)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Addresses */}
        {customer.addresses?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, color:'var(--cyan)', letterSpacing:2, textTransform:'uppercase', marginBottom:10, fontFamily:'var(--title)' }}>配送地址</div>
            {customer.addresses.map((a, i) => (
              <div key={i} style={{ padding:'8px 10px', background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border)', marginBottom:6 }}>
                <div style={{ fontSize:14, color:'var(--muted)', marginBottom:3 }}>{a.label} {a.default && <span style={{ color:'var(--cyan)', marginLeft:4 }}>◈ 預設</span>}</div>
                <div style={{ fontSize:18 }}>{a.address}</div>
              </div>
            ))}
          </div>
        )}

        {/* Order history */}
        <div>
          <div style={{ fontSize:14, color:'var(--cyan)', letterSpacing:2, textTransform:'uppercase', marginBottom:10, fontFamily:'var(--title)' }}>
            訂單紀錄 ({customer.orders.length})
          </div>
          {customer.orders.length === 0
            ? <div style={{ fontSize:17, color:'var(--muted)', padding:'20px 0', textAlign:'center' }}>◻ 尚無訂單紀錄</div>
            : customer.orders.map((o, i) => (
              <div key={i} style={{ padding:'10px 12px', background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border)', marginBottom:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:17, fontFamily:'var(--mono)', color:'var(--cyan)' }}>{o.id}</span>
                  <span style={{ fontSize:17, fontFamily:'var(--mono)', color:'var(--green)', fontWeight:700 }}>{fmt.currency(o.subtotal)}</span>
                </div>
                <div style={{ fontSize:14, color:'var(--muted)' }}>{o.date} · {o.channel} · {o.items?.length || 0} 品項</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── 主頁面 ────────────────────────────────────────────────────
export default function CrmPage() {
  const { customers, addCustomer, updateCustomer } = useCustomer();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = customers.filter(c => {
    const matchType = filterType === 'ALL' || c.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.contact||'').toLowerCase().includes(q);
    return matchType && matchSearch && c.active !== false;
  });

  const handleSave = (data) => {
    if (editing?.id) {
      updateCustomer(editing.id, data);
    } else {
      addCustomer(data);
    }
    setShowModal(false);
    setEditing(null);
  };

  const totalRevenue = customers.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <div>
      {/* 頂部統計 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'總客戶數',     value:`${customers.length} 位`,          color:'var(--cyan)' },
          { label:'經銷商',       value:`${customers.filter(c=>c.type==='DEALER').length} 位`, color:'var(--green)' },
          { label:'VIP 客戶',    value:`${customers.filter(c=>c.type==='VIP').length} 位`,    color:'var(--yellow)' },
          { label:'累計銷售總額', value:fmt.currency(totalRevenue),         color:'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ borderTop:`2px solid ${color}` }}>
            <div style={{ fontSize:14, color:'var(--muted)', letterSpacing:1, marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:700, color, fontFamily:'var(--title)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 工具列 */}
      <div className="flex-between mb-16">
        <div style={{ display:'flex', gap:8, flex:1, maxWidth:400 }}>
          <input className="form-input" placeholder="搜尋客戶名稱、代號、電話…" value={search}
            onChange={e => setSearch(e.target.value)}/>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['ALL', ...Object.keys(CUSTOMER_TYPES)].map(t => {
            const type = CUSTOMER_TYPES[t];
            return (
              <button key={t}
                className={`btn btn-sm ${filterType===t ? 'btn-primary' : 'btn-ghost'}`}
                style={filterType===t && type ? { borderColor:type.color, color:type.color, background:type.bg } : {}}
                onClick={() => setFilterType(t)}>
                {t === 'ALL' ? '全部' : type.label}
              </button>
            );
          })}
          <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowModal(true); }}>
            ＋ 新增客戶
          </button>
        </div>
      </div>

      {/* 客戶列表 */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>代號</th><th>名稱</th><th>分類</th>
                <th>聯絡人</th><th>電話</th><th>統編</th>
                <th style={{ textAlign:'right' }}>累計購買</th>
                <th style={{ textAlign:'right' }}>訂單數</th>
                <th>最後購買</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                  ◻ 找不到符合的客戶
                </td></tr>
              )}
              {filtered.map(c => {
                const type = CUSTOMER_TYPES[c.type];
                return (
                  <tr key={c.id} style={{ cursor:'pointer' }} onClick={() => setSelected(c)}>
                    <td className="td-mono" style={{ color:'var(--cyan)', fontSize:17 }}>{c.code}</td>
                    <td style={{ fontWeight:600 }}>{c.name}</td>
                    <td>
                      <span style={{ fontSize:14, padding:'2px 7px', borderRadius:3, background:type?.bg, color:type?.color, border:`1px solid ${type?.color}40`, letterSpacing:1 }}>
                        {type?.label}
                      </span>
                    </td>
                    <td style={{ color:'var(--muted)' }}>{c.contact || '–'}</td>
                    <td className="td-mono" style={{ fontSize:17 }}>{c.phone || '–'}</td>
                    <td className="td-mono" style={{ fontSize:17, color:'var(--muted)' }}>{c.taxId || '–'}</td>
                    <td className="td-right td-mono" style={{ color:'var(--cyan)', fontWeight:600 }}>{fmt.currency(c.totalAmount)}</td>
                    <td className="td-right td-mono">{c.orders.length}</td>
                    <td style={{ fontSize:17, color:'var(--muted)' }}>{c.lastOrderDate || '–'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); setEditing(c); setShowModal(true); }}>
                        ✏
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 客戶詳情抽屜 */}
      {selected && (
        <CustomerDrawer
          customer={selected}
          onClose={() => setSelected(null)}
          onEdit={(c) => { setEditing(c); setShowModal(true); setSelected(null); }}
        />
      )}

      {/* 新增/編輯 Modal */}
      {showModal && (
        <CustomerModal
          initial={editing || {}}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}