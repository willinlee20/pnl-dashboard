import { createContext, useContext, useState, useCallback } from 'react';

const CustomerContext = createContext(null);

// 客戶分類
export const CUSTOMER_TYPES = {
  DEALER:   { id:'DEALER',   label:'經銷商',   color:'#00f5ff', bg:'rgba(0,245,255,0.08)' },
  VIP:      { id:'VIP',      label:'VIP',       color:'#f5c400', bg:'rgba(245,196,0,0.08)' },
  GENERAL:  { id:'GENERAL',  label:'一般消費者', color:'#7070b8', bg:'rgba(112,112,184,0.08)' },
  COMPANY:  { id:'COMPANY',  label:'企業客戶',  color:'#b44fff', bg:'rgba(180,79,255,0.08)' },
};

// 產生客戶代號
const genCode = (type) => {
  const prefix = { DEALER:'DLR', VIP:'VIP', GENERAL:'GEN', COMPANY:'CMP' }[type] || 'CST';
  return `${prefix}-${Date.now().toString().slice(-6)}`;
};

// 初始示範客戶
const INIT_CUSTOMERS = [
  {
    id:'DLR-001', code:'DLR-001', name:'欣立峰有限公司', type:'DEALER',
    contact:'王大明', phone:'02-12345678', email:'wang@example.com',
    taxId:'12345678', address:'台北市中山區XX路1號',
    addresses:[{ label:'主要地址', address:'台北市中山區XX路1號', default:true }],
    note:'主要北部經銷商', createdAt:'2025-01-15',
    orders:[], totalAmount:0, lastOrderDate:null,
  },
  {
    id:'DLR-002', code:'DLR-002', name:'南部通路股份有限公司', type:'DEALER',
    contact:'李小華', phone:'07-98765432', email:'li@example.com',
    taxId:'87654321', address:'高雄市前金區XX路2號',
    addresses:[{ label:'主要地址', address:'高雄市前金區XX路2號', default:true }],
    note:'南部主力經銷', createdAt:'2025-03-01',
    orders:[], totalAmount:0, lastOrderDate:null,
  },
];

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(INIT_CUSTOMERS);

  // 搜尋客戶
  const searchCustomers = useCallback((query) => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.contact && c.contact.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.taxId && c.taxId.includes(q))
    ).slice(0, 8);
  }, [customers]);

  // 新增客戶
  const addCustomer = useCallback((data) => {
    const code = genCode(data.type);
    const newCustomer = {
      ...data, id:code, code,
      addresses: data.address ? [{ label:'主要地址', address:data.address, default:true }] : [],
      orders:[], totalAmount:0, lastOrderDate:null,
      createdAt: new Date().toLocaleDateString('zh-TW'),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  // 更新客戶
  const updateCustomer = useCallback((id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // 新增訂單到客戶紀錄
  const addOrderToCustomer = useCallback((customerId, order) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const orders = [order, ...c.orders];
      const totalAmount = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
      return { ...c, orders, totalAmount, lastOrderDate: order.date };
    }));
  }, []);

  // 取得客戶
  const getCustomer = useCallback((id) => {
    return customers.find(c => c.id === id);
  }, [customers]);

  return (
    <CustomerContext.Provider value={{
      customers, searchCustomers, addCustomer, updateCustomer,
      addOrderToCustomer, getCustomer,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);