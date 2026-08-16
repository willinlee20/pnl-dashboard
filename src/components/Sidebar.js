import { useAccount } from '../context/AccountContext';
import { PERMISSIONS } from '../utils/config';

const NAV_MAIN = [
  { id:'dashboard',  label:'首頁總覽',  icon:'◈', perm:null },
  { id:'upload',     label:'報表上傳',  icon:'↑', perm:'UPLOAD' },
  { id:'sales',      label:'銷貨總表',  icon:'▦', perm:null },
  { id:'pnl',        label:'損益表',    icon:'$', perm:'FINANCE' },
];
const NAV_OPS = [
  { id:'order',      label:'手動開單',  icon:'◇', perm:'ORDER' },
  { id:'inventory',  label:'庫存管理',  icon:'▣', perm:'INVENTORY' },
  { id:'crm',        label:'客戶管理',  icon:'◉', perm:'ORDER' },
];
const NAV_SYS = [
  { id:'accounts',   label:'帳號管理',  icon:'🔐', perm:'MASTER' },
  { id:'settings',   label:'系統設定',  icon:'⊞', perm:'SETTINGS' },
  { id:'help',       label:'操作手冊',  icon:'?',  perm:null },
];

export default function Sidebar({ page, setPage }) {
  const { currentAccount, can } = useAccount();
  const initials = currentAccount?.name
    ? currentAccount.name.slice(0,2).toUpperCase()
    : '?';

  const NavItem = ({ item }) => {
    const allowed = !item.perm || can(item.perm);
    if (!allowed) return null;
    return (
      <div
        className={`nav-item${page===item.id?' active':''}`}
        onClick={() => setPage(item.id)}
        style={{ opacity: allowed ? 1 : 0.3 }}>
        <span style={{ width:14, textAlign:'center', fontSize:14 }}>{item.icon}</span>
        {item.label}
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>損益彙整系統</h1>
        <p>MVP v1.0 · 本機測試模式</p>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">主選單</div>
        {NAV_MAIN.map(item => <NavItem key={item.id} item={item}/>)}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">進階功能</div>
        {NAV_OPS.map(item => <NavItem key={item.id} item={item}/>)}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">系統</div>
        {NAV_SYS.map(item => <NavItem key={item.id} item={item}/>)}
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="user-name">{currentAccount?.name || '使用者'}</div>
          <div className="user-email" style={{ fontSize:14 }}>
            {currentAccount?.perms?.includes('MASTER') ? '🔐 Master' : '一般成員'}
          </div>
        </div>
        <span style={{ fontSize:17, color:'var(--muted)', cursor:'pointer' }}
          onClick={() => setPage('accounts')}>⚙</span>
      </div>
    </aside>
  );
}