import { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccountProvider, useAccount } from './context/AccountContext';
import { CustomerProvider } from './context/CustomerContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import SalesPage from './pages/SalesPage';
import PnlPage from './pages/PnlPage';
import InventoryPage from './pages/InventoryPage';
import OrderPage from './pages/OrderPage';
import AccountPage from './pages/AccountPage';
import CrmPage from './pages/CrmPage';
import SettingsPage from './pages/Settings';
import HelpPage from './pages/HelpPage';
import { getCurrentYM } from './utils/format';

const DEV_MODE = true;
const DEV_USER = { name: 'Willie', email: 'willie@company.com' };

const PAGE_TITLES = {
  dashboard: { title:'首頁總覽',  sub:'即時數據更新自 Google Sheets' },
  upload:    { title:'報表上傳',  sub:'拖曳上傳各平台 Excel，系統自動解析' },
  sales:     { title:'銷貨總表',  sub:'套組銷量 × 單品換算 × 各平台金額' },
  pnl:       { title:'損益表',    sub:'費用手動輸入，收入自動帶入' },
  order:     { title:'手動開單',  sub:'手動建立銷售訂單，自動更新銷貨和庫存' },
  inventory: { title:'庫存管理',  sub:'成品庫存 · 耗材包材 · 資產總表' },
  crm:      { title:'客戶管理',  sub:'客戶資料 · 訂單紀錄 · 購買歷史' },
  accounts:  { title:'帳號管理',  sub:'帳號權限設定 · 操作日誌' },
  settings:  { title:'系統設定',  sub:'Google Sheets 連線 & 建置說明' },
  help:      { title:'操作手冊',  sub:'系統功能說明與操作指引' },
};

function AppInner() {
  const auth = useAuth();
  const { currentAccount, setCurrentAccount } = useAccount();
  const [page, setPage] = useState('dashboard');
  const [uploadStatus, setUploadStatus] = useState({
    TOOLA_SHOPLINE:{done:false}, TOOLA_SHOPEE:{done:false},
    MOMO:{done:false}, TAKUYA_SHOPEE:{done:false},
    TAKUYA_SHOPLINE:{done:false}, ERP:{done:false},
  });
  const { year, month } = getCurrentYM();

  const user = DEV_MODE ? DEV_USER : auth.user;
  const loading = DEV_MODE ? false : auth.loading;

  // 本機 DEV 模式：自動設定 Master 帳號
  if (DEV_MODE && !currentAccount) {
    setCurrentAccount({
      email: DEV_USER.email, name: DEV_USER.name,
      perms: ['MASTER'], active: true,
    });
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner" style={{ width:32, height:32 }}/>
    </div>
  );
  if (!user) return <LoginPage/>;

  const { title, sub } = PAGE_TITLES[page] || PAGE_TITLES.dashboard;

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage}/>
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
          <div className="topbar-right">
            {DEV_MODE && (
              <div style={{ background:'rgba(245,196,0,0.1)', color:'var(--yellow)', border:'1px solid rgba(245,196,0,0.3)', borderRadius:3, padding:'3px 10px', fontSize:9, letterSpacing:1 }}>
                ◈ 測試模式
              </div>
            )}
            <div className="month-pill">▣ {year} 年 {month} 月</div>
          </div>
        </div>
        <div className="page-body">
          {page==='dashboard' && <Dashboard setPage={setPage} uploadStatus={uploadStatus}/>}
          {page==='upload'    && <UploadPage onUploadDone={(p,sid,d) => setUploadStatus(prev=>({...prev,[sid||p]:{done:true,date:d}}))}/>}
          {page==='sales'     && <SalesPage/>}
          {page==='pnl'       && <PnlPage/>}
          {page==='order'     && <OrderPage/>}
          {page==='inventory' && <InventoryPage/>}
          {page==='accounts'  && <AccountPage/>}
          {page==='crm'       && <CrmPage/>}
          {page==='settings'  && <SettingsPage/>}
          {page==='help'      && <HelpPage/>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccountProvider>
        <CustomerProvider>
        <AppInner/>
        </CustomerProvider>
      </AccountProvider>
    </AuthProvider>
  );
}