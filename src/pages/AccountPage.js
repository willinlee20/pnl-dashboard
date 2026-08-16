import { useState } from 'react';
import { useAccount } from '../context/AccountContext';
import { PERMISSIONS, DEFAULT_ROLES } from '../utils/config';

const PERM_LIST = Object.values(PERMISSIONS).filter(p => p.id !== 'MASTER');

function PermBadge({ perm, active }) {
  return (
    <span style={{
      fontSize:14, padding:'2px 7px', borderRadius:3, letterSpacing:1,
      background: active ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.04)',
      color:      active ? 'var(--cyan)' : 'var(--muted)',
      border:     `1px solid ${active ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      {perm.label}
    </span>
  );
}

function AccountRow({ account, onEdit, isSelf }) {
  const role = Object.values(DEFAULT_ROLES).find(r =>
    r.perms.length === account.perms.length &&
    r.perms.every(p => account.perms.includes(p))
  );
  const isMaster = account.perms.includes('MASTER');
  return (
    <tr style={{ opacity: account.active ? 1 : 0.45 }}>
      <td>
        <div style={{ fontWeight:600, fontSize:18, color: isMaster ? 'var(--pink)' : 'var(--text)' }}>
          {account.name} {isSelf && <span style={{ fontSize:14, color:'var(--cyan)', marginLeft:4 }}>（你）</span>}
        </div>
        <div style={{ fontSize:14, color:'var(--muted)', marginTop:1 }}>{account.email}</div>
      </td>
      <td>
        {isMaster
          ? <span className="badge badge-danger">MASTER</span>
          : <span className="badge badge-blue">{role?.label || '自訂'}</span>
        }
      </td>
      <td>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {PERM_LIST.map(p => (
            <PermBadge key={p.id} perm={p} active={account.perms.includes(p.id)}/>
          ))}
        </div>
      </td>
      <td>
        <span className={`badge ${account.active ? 'badge-ok' : 'badge-gray'}`}>
          {account.active ? '啟用' : '停用'}
        </span>
      </td>
      <td>
        {!isMaster && (
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(account)}>
            ✏ 編輯
          </button>
        )}
      </td>
    </tr>
  );
}

function EditModal({ account, onSave, onClose, onDeactivate }) {
  const [perms, setPerms] = useState(account.perms || []);
  const [name,  setName]  = useState(account.name  || '');

  const togglePerm = (id) => {
    setPerms(prev => prev.includes(id) ? prev.filter(p => p!==id) : [...prev, id]);
  };
  const applyRole = (roleKey) => {
    setPerms([...DEFAULT_ROLES[roleKey].perms]);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border-strong)', borderRadius:6, padding:28, width:560, maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ fontFamily:'var(--title)', fontSize:20, fontWeight:700, color:'var(--cyan)', letterSpacing:3, marginBottom:18 }}>
          編輯帳號
        </div>

        <div style={{ marginBottom:14 }}>
          <label className="form-label">姓名</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)}/>
        </div>
        <div style={{ marginBottom:4 }}>
          <div style={{ fontSize:14, color:'var(--muted)', marginBottom:6, letterSpacing:1 }}>{account.email}</div>
        </div>

        {/* 快速套用角色 */}
        <div style={{ marginBottom:16 }}>
          <label className="form-label">快速套用角色</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
            {Object.entries(DEFAULT_ROLES).filter(([k]) => k !== 'master').map(([key, role]) => (
              <button key={key}
                className="btn btn-ghost btn-sm"
                style={{ borderColor:role.color, color:role.color }}
                onClick={() => applyRole(key)}>
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* 權限勾選 */}
        <div style={{ marginBottom:20 }}>
          <label className="form-label">個別權限設定</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
            {PERM_LIST.map(p => (
              <label key={p.id} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'8px 12px', borderRadius:4, background: perms.includes(p.id) ? 'rgba(0,245,255,0.06)' : 'rgba(255,255,255,0.02)', border:`1px solid ${perms.includes(p.id) ? 'rgba(0,245,255,0.25)' : 'var(--border)'}` }}>
                <input type="checkbox" checked={perms.includes(p.id)} onChange={() => togglePerm(p.id)}
                  style={{ width:14, height:14, accentColor:'var(--cyan)', cursor:'pointer' }}/>
                <div>
                  <div style={{ fontSize:17, fontWeight:600, color: perms.includes(p.id) ? 'var(--cyan)' : 'var(--text)' }}>{p.label}</div>
                  <div style={{ fontSize:14, color:'var(--muted)', marginTop:1 }}>{p.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}
            onClick={() => onSave(account.email, { name, perms })}>
            ◈ 儲存權限設定
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDeactivate(account.email)}>
            停用帳號
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { accounts, currentAccount, auditLogs, addAccount, updateAccount, deactivateAccount } = useAccount();
  const [editing, setEditing]   = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [newAcc,  setNewAcc]    = useState({ email:'', name:'', perms:['VIEW_ALL'] });
  const [tab, setTab]           = useState('accounts'); // 'accounts' | 'logs'

  const handleSave = (email, updates) => {
    updateAccount(email, updates);
    setEditing(null);
  };

  const handleDeactivate = (email) => {
    deactivateAccount(email);
    setEditing(null);
  };

  const handleAddAccount = () => {
    if (!newAcc.email || !newAcc.name) return;
    addAccount(newAcc);
    setNewAcc({ email:'', name:'', perms:['VIEW_ALL'] });
    setShowAdd(false);
  };

  const importantLogs = auditLogs.filter(l => l.important);

  return (
    <div>
      {/* Tab 切換 */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {[
          { id:'accounts', label:`帳號管理 (${accounts.length})` },
          { id:'logs',     label:`操作日誌 (${importantLogs.length})` },
        ].map(t => (
          <button key={t.id}
            className={`btn btn-sm ${tab===t.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius:'4px 4px 0 0', borderBottom:'none', marginBottom:-1 }}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 帳號列表 ── */}
      {tab === 'accounts' && (
        <div>
          <div className="card mb-16">
            <div className="card-title">
              系統帳號
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(v => !v)}>
                {showAdd ? '✕ 取消' : '＋ 新增帳號'}
              </button>
            </div>

            {/* 新增帳號表單 */}
            {showAdd && (
              <div style={{ marginBottom:16, padding:14, background:'var(--bg3)', borderRadius:4, border:'1px solid rgba(0,245,255,0.3)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <label className="form-label">Google 帳號（Email）</label>
                    <input className="form-input" placeholder="colleague@gmail.com"
                      value={newAcc.email} onChange={e => setNewAcc(p => ({ ...p, email:e.target.value }))}/>
                  </div>
                  <div>
                    <label className="form-label">姓名</label>
                    <input className="form-input" placeholder="同事名稱"
                      value={newAcc.name} onChange={e => setNewAcc(p => ({ ...p, name:e.target.value }))}/>
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label className="form-label">快速套用角色</label>
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    {Object.entries(DEFAULT_ROLES).filter(([k]) => k !== 'master').map(([key, role]) => (
                      <button key={key} className="btn btn-ghost btn-sm"
                        style={{ borderColor:role.color, color:role.color }}
                        onClick={() => setNewAcc(p => ({ ...p, perms:[...role.perms] }))}>
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize:14, color:'var(--muted)', marginBottom:10, letterSpacing:1 }}>
                  已選權限：{newAcc.perms.join(', ')}
                </div>
                <button className="btn btn-primary" onClick={handleAddAccount} style={{ justifyContent:'center', width:'100%' }}>
                  ◈ 確認新增帳號
                </button>
                <div style={{ fontSize:14, color:'var(--muted)', marginTop:8, letterSpacing:1 }}>
                  ◈ 帳號新增後，對方用該 Google Email 登入就會自動套用這裡的權限設定
                </div>
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth:160 }}>帳號</th>
                    <th>角色</th>
                    <th>權限</th>
                    <th>狀態</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(a => (
                    <AccountRow key={a.email} account={a}
                      isSelf={a.email === currentAccount?.email}
                      onEdit={setEditing}/>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 權限說明 */}
          <div className="card" style={{ background:'rgba(0,245,255,0.02)' }}>
            <div className="card-title">權限模組說明</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {PERM_LIST.map(p => (
                <div key={p.id} style={{ padding:'10px 12px', background:'var(--bg3)', borderRadius:4, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--cyan)', marginBottom:3, letterSpacing:1 }}>{p.label}</div>
                  <div style={{ fontSize:14, color:'var(--muted)' }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 操作日誌 ── */}
      {tab === 'logs' && (
        <div className="card">
          <div className="card-title">
            重要操作日誌
            <span>只記錄金額、庫存、帳號等重要異動</span>
          </div>
          {importantLogs.length === 0
            ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
                <div style={{ fontSize:30, marginBottom:8 }}>◻</div>
                <div style={{ fontSize:14, letterSpacing:1 }}>尚無操作紀錄</div>
                <div style={{ fontSize:14, color:'var(--muted)', marginTop:4 }}>修改費用、廣告費、盤點調整、帳號設定時會自動記錄</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>時間</th>
                      <th>帳號</th>
                      <th>動作</th>
                      <th>說明</th>
                      <th>修改前</th>
                      <th>修改後</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importantLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize:14, color:'var(--muted)', whiteSpace:'nowrap' }}>{log.timestamp}</td>
                        <td>
                          <div style={{ fontSize:17, fontWeight:600 }}>{log.account}</div>
                          <div style={{ fontSize:14, color:'var(--muted)' }}>{log.email}</div>
                        </td>
                        <td>
                          <span style={{ fontSize:14 }}>{log.icon} </span>
                          <span className="badge badge-blue">{log.label}</span>
                        </td>
                        <td style={{ fontSize:17, maxWidth:200 }}>{log.detail}</td>
                        <td style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--pink)' }}>
                          {log.oldVal || '–'}
                        </td>
                        <td style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--green)' }}>
                          {log.newVal || '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* 編輯 Modal */}
      {editing && (
        <EditModal account={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          onDeactivate={handleDeactivate}/>
      )}
    </div>
  );
}