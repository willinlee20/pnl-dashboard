import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { fmt, PLATFORM_COLORS, getCurrentYM } from '../utils/format';
const DEMO = {
  revenue:482300, cost:198700, gross:283600, expenses:141500, net:142100,
  grossRate:0.588, netRate:0.295,
  byPlatform:[{name:'經銷',value:251000},{name:'momo',value:116000},{name:'官網',value:68000},{name:'蝦皮',value:47300}],
};
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return <div style={{background:'#fff',border:'1px solid #eee',borderRadius:8,padding:'8px 12px',fontSize:17}}>
    <div style={{fontWeight:600}}>{payload[0].payload.name}</div>
    <div style={{color:'#2F5496',fontFamily:'DM Mono'}}>{fmt.currency(payload[0].value)}</div>
  </div>;
};
export default function Dashboard({ setPage, uploadStatus }) {
  const { year, month } = getCurrentYM();
  const status = uploadStatus || { '官網':{done:false},'momo':{done:false},'蝦皮':{done:false},'經銷':{done:false} };
  const doneCount = Object.values(status).filter(v => v.done).length;
  return (
    <div>
      <div className="metrics-grid">
        {[
          { label:'本月銷售收入', value:DEMO.revenue, change:0.124, cls:'blue', Icon:DollarSign },
          { label:'銷貨成本合計', value:DEMO.cost,    change:0.082, cls:'red',  Icon:ShoppingCart },
          { label:'毛利 / 毛利率',value:DEMO.gross,   sub:`毛利率 ${fmt.pct(DEMO.grossRate)}`, cls:'teal', Icon:TrendingUp },
          { label:'本月淨利',     value:DEMO.net,     sub:`淨利率 ${fmt.pct(DEMO.netRate)}`,   cls:'amber',Icon:Package },
        ].map(({ label, value, sub, change, cls, Icon }) => (
          <div key={label} className={`metric-card c-${cls}`}>
            <div className={`metric-icon c-${cls}`}><Icon size={18}/></div>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{fmt.currency(value)}</div>
            {sub && <div className="metric-change neutral" style={{fontSize:18,color:'rgba(200,200,255,0.9)'}}>{sub}</div>}
            {change !== undefined && <div className={`metric-change ${change>0?'up':'down'}`}>
              {change>0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
              {fmt.pct(Math.abs(change))} 較上月
            </div>}
          </div>
        ))}
      </div>
      <div className="grid-2 mb-16">
        <div className="card">
          <div className="card-title">各平台銷售金額 <span>{year}年{month}月</span></div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DEMO.byPlatform} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
              <XAxis type="number" hide/>
              <YAxis type="category" dataKey="name" width={36} tick={{fontSize:17,fill:'#8A93A2'}}/>
              <Tooltip content={<CustomTooltip/>} cursor={{fill:'#F5F7FA'}}/>
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {DEMO.byPlatform.map(e => <Cell key={e.name} fill={PLATFORM_COLORS[e.name]||'#ccc'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">
            本月報表上傳狀態
            <span style={{display:'flex',alignItems:'center',gap:4}}>
              {doneCount<4 && <AlertTriangle size={12} style={{color:'#BA7517'}}/>}
              {doneCount}/4 已上傳
            </span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {Object.entries(status).map(([platform, s]) => (
              <div key={platform} className={`platform-chip${s.done?' done':''}`} onClick={() => setPage('upload')}>
                <div className={`platform-dot ${s.done?'done':'pending'}`}/>
                <div className="platform-chip-info">
                  <div className="platform-chip-name">{platform} 報表</div>
                  <div className="platform-chip-status">{s.done ? `✓ 已上傳 ${s.date||''}` : '待上傳 — 點擊前往'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">本月損益摘要</div>
          {[
            {label:'銷貨收入',value:DEMO.revenue,color:'#2F5496',pct:1.0},
            {label:'銷貨成本',value:DEMO.cost,   color:'#C00000',pct:DEMO.cost/DEMO.revenue},
            {label:'營業費用',value:DEMO.expenses,color:'#BA7517',pct:DEMO.expenses/DEMO.revenue},
          ].map(({label,value,color,pct}) => (
            <div key={label} style={{marginBottom:14}}>
              <div className="flex-between mb-4">
                <span style={{fontSize:14,color:'#8A93A2'}}>{label}</span>
                <span style={{fontSize:17,fontWeight:600,fontFamily:'DM Mono',color}}>{fmt.currency(value)}</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${pct*100}%`,background:color}}/></div>
            </div>
          ))}
          <div style={{background:'#E1F5EE',borderRadius:8,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
            <div>
              <div style={{fontSize:14,color:'#0F6E56',fontWeight:500}}>本月淨利</div>
              <div style={{fontSize:23,fontWeight:700,color:'#0F6E56',fontFamily:'DM Mono'}}>{fmt.currency(DEMO.net)}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:14,color:'#0F6E56'}}>淨利率</div>
              <div style={{fontSize:24,fontWeight:700,color:'#0F6E56',fontFamily:'DM Mono'}}>{fmt.pct(DEMO.netRate)}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">費用明細 <span>本月</span></div>
          {[['人員薪資',80000],['勞健保',12000],['房租',15000],['行銷廣告費',18000],['行銷搭贈',8500],['運費',4000],['包材/雜支',4000]].map(([l,v]) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #F5F7FA',fontSize:17}}>
              <span style={{color:'#8A93A2'}}>{l}</span>
              <span style={{fontWeight:600,fontFamily:'DM Mono'}}>{fmt.currency(v)}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'2px solid #eee',fontSize:18,fontWeight:700}}>
            <span>費用合計</span>
            <span style={{fontFamily:'DM Mono',color:'#BA7517'}}>{fmt.currency(DEMO.expenses)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}