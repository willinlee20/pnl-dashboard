import { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_ACCOUNTS, PERMISSIONS, DEFAULT_ROLES, hasPermission } from '../utils/config';

const AccountContext = createContext(null);

// 重要操作類型（只記錄這些）
export const LOG_ACTIONS = {
  FINANCE_EDIT:    { label:'修改費用',    icon:'💰', important:true },
  AD_COST_EDIT:    { label:'修改廣告費',  icon:'📢', important:true },
  STOCKTAKE:       { label:'盤點調整',    icon:'📦', important:true },
  PRODUCT_ADD:     { label:'新增商品',    icon:'➕', important:true },
  PRODUCT_EDIT:    { label:'修改商品',    icon:'✏️', important:true },
  ACCOUNT_CHANGE:  { label:'帳號權限異動', icon:'🔐', important:true },
  RESTOCK:         { label:'入庫登錄',    icon:'📥', important:false },
  UPLOAD:          { label:'報表上傳',    icon:'📤', important:false },
};

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [currentAccount, setCurrentAccount] = useState(INITIAL_ACCOUNTS[0]);
  const [auditLogs, setAuditLogs] = useState([]);

  // 記錄操作日誌
  const addLog = useCallback((action, detail, oldVal = null, newVal = null) => {
    const logDef = LOG_ACTIONS[action];
    if (!logDef) return;
    setAuditLogs(prev => [{
      id:        Date.now(),
      timestamp: new Date().toLocaleString('zh-TW'),
      account:   currentAccount?.name || '未知',
      email:     currentAccount?.email || '',
      action,
      label:     logDef.label,
      icon:      logDef.icon,
      important: logDef.important,
      detail,
      oldVal:    oldVal !== null ? String(oldVal) : null,
      newVal:    newVal !== null ? String(newVal) : null,
    }, ...prev].slice(0, 200)); // 最多保留 200 筆
  }, [currentAccount]);

  // 檢查權限
  const can = useCallback((permId) => {
    return hasPermission(currentAccount, permId);
  }, [currentAccount]);

  // 新增帳號
  const addAccount = useCallback((account) => {
    setAccounts(prev => [...prev, { ...account, active:true }]);
    addLog('ACCOUNT_CHANGE', `新增帳號 ${account.email}`, null, account.role);
  }, [addLog]);

  // 更新帳號權限
  const updateAccount = useCallback((email, updates) => {
    setAccounts(prev => prev.map(a => a.email === email ? { ...a, ...updates } : a));
    if (updates.perms) {
      addLog('ACCOUNT_CHANGE', `修改 ${email} 的權限`, null, updates.perms.join(', '));
    }
  }, [addLog]);

  // 停用帳號
  const deactivateAccount = useCallback((email) => {
    setAccounts(prev => prev.map(a => a.email === email ? { ...a, active:false } : a));
    addLog('ACCOUNT_CHANGE', `停用帳號 ${email}`);
  }, [addLog]);

  return (
    <AccountContext.Provider value={{
      accounts, currentAccount, setCurrentAccount,
      auditLogs, addLog,
      can, addAccount, updateAccount, deactivateAccount,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => useContext(AccountContext);