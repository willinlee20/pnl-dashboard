import { fmt } from '../utils/format';
import { STORES } from '../utils/config';

// 平台欄顏色（深色背景友好）
const COL_COLORS = {
  官網: { bg:'rgba(0,245,255,0.12)', color:'var(--cyan)',   border:'rgba(0,245,255,0.3)' },
  momo: { bg:'rgba(255,0,110,0.12)', color:'var(--pink)',   border:'rgba(255,0,110,0.3)' },
  蝦皮: { bg:'rgba(245,196,0,0.12)', color:'var(--yellow)', border:'rgba(245,196,0,0.3)' },
  經銷: { bg:'rgba(0,255,159,0.12)', color:'var(--green)',  border:'rgba(0,255,159,0.3)' },
};

const PRODUCTS = [
  {code:'BDLN201', name:'麗容酵素入浴劑 880g',           cost:186, qW:5,  qM:19, qS:0,  qE:240, u:1},
  {code:'BDLN203', name:'麗容酵素入浴劑 880g 3入組',     cost:558, qW:3,  qM:0,  qS:21, qE:0,   u:3},
  {code:'BDLN103', name:'麗容酵素入浴劑 600g 3入組',     cost:480, qW:0,  qM:0,  qS:4,  qE:0,   u:3},
  {code:'BDLN101', name:'麗容酵素入浴劑 600g',           cost:160, qW:0,  qM:0,  qS:0,  qE:936, u:1},
  {code:'BDTL101', name:'多樂 B5 多效保濕修護霜',        cost:150, qW:8,  qM:0,  qS:1,  qE:24,  u:1},
  {code:'BDTL201', name:'多樂 嬰幼兒洗沐泡泡露－英國梨', cost:81,  qW:12, qM:0,  qS:0,  qE:53,  u:1},
  {code:'BDTL301', name:'多樂慕絲－英國梨&麝香',         cost:62,  qW:10, qM:0,  qS:1,  qE:95,  u:1},
  {code:'BDTL401', name:'多樂慕絲－純淨無香',            cost:62,  qW:8,  qM:0,  qS:0,  qE:65,  u:1},
  {code:'BDTL0029',name:'多樂 嬰幼兒全系列體驗組',      cost:293, qW:6,  qM:0,  qS:0,  qE:0,   u:1},
];

const PLATFORMS = [
  { key:'qW', label:'官網' },
  { key:'qM', label:'momo' },
  { key:'qS', label:'蝦皮' },
  { key:'qE', label:'經銷' },
];

// Number formatter with consistent right alignment
const NUM_CELL = { textAlign:'right', fontFamily:'var(--mono)', fontSize:18, padding:'11px 14px' };
const HDR_RIGHT = { textAlign:'right !important', padding:'10px 14px' };

export default function SalesPage() {
  const rows = PRODUCTS.map(p => {
    const total = p.qW + p.qM + p.qS + p.qE;
    const units = total * p.u;
    const rev   = (p.qW * p.cost / 0.45) + (p.qM * p.cost / 0.45) +
                  (p.qS * p.cost / 0.45) + (p.qE * (p.cost / 0.35) * 1.05);
    const costTotal = total * p.cost;
    return { ...p, total, units, rev, costTotal, gross: rev - costTotal };
  });

  const T = rows.reduce((a, r) => ({
    sets:  a.sets  + r.total,
    units: a.units + r.units,
    rev:   a.rev   + r.rev,
    cost:  a.cost  + r.costTotal,
    gross: a.gross + r.gross,
  }), { sets:0, units:0, rev:0, cost:0, gross:0 });

  return (
    <div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth:90 }}>代號</th>
                <th style={{ minWidth:180 }}>品名</th>
                <th style={{ textAlign:'right' }}>含稅成本</th>
                {PLATFORMS.map(({ label }) => {
                  const c = COL_COLORS[label];
                  return (
                    <th key={label} style={{ textAlign:'right', background:c.bg, color:c.color, borderBottom:`1px solid ${c.border}` }}>
                      {label}
                    </th>
                  );
                })}
                <th style={{ textAlign:'right', background:'rgba(180,79,255,0.12)', color:'var(--purple)' }}>套組合計</th>
                <th style={{ textAlign:'right', background:'rgba(245,196,0,0.12)', color:'var(--yellow)' }}>單品換算</th>
                <th style={{ textAlign:'right', background:'rgba(0,245,255,0.08)', color:'var(--cyan)' }}>銷售金額</th>
                <th style={{ textAlign:'right', background:'rgba(255,0,110,0.08)', color:'var(--pink)' }}>銷貨成本</th>
                <th style={{ textAlign:'right', background:'rgba(0,255,159,0.08)', color:'var(--green)' }}>毛利</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const c = COL_COLORS;
                return (
                  <tr key={p.code}>
                    {/* 代號 — 亮青色，清楚可見 */}
                    <td style={{ fontFamily:'var(--mono)', fontSize:17, fontWeight:700, color:'var(--cyan)', letterSpacing:1 }}>
                      {p.code}
                    </td>
                    {/* 品名 */}
                    <td style={{ fontSize:18, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)' }}>
                      {p.name}
                    </td>
                    {/* 含稅成本 */}
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color:'var(--muted)' }}>
                      {fmt.currency(p.cost)}
                    </td>
                    {/* 各平台數量 */}
                    {PLATFORMS.map(({ key, label }) => {
                      const col = COL_COLORS[label];
                      const val = p[key];
                      return (
                        <td key={key} style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, background:col.bg, color: val > 0 ? col.color : 'rgba(255,255,255,0.2)', fontWeight: val > 0 ? 600 : 400 }}>
                          {val > 0 ? val : '–'}
                        </td>
                      );
                    })}
                    {/* 套組合計 */}
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, fontWeight:700, color:'var(--purple)', background:'rgba(180,79,255,0.08)' }}>
                      {p.total}
                    </td>
                    {/* 單品換算 */}
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, fontWeight:700, color:'var(--yellow)', background:'rgba(245,196,0,0.08)' }}>
                      {p.units}
                      {p.u > 1 && <span style={{ fontSize:14, color:'rgba(245,196,0,0.5)', marginLeft:3 }}>×{p.u}</span>}
                    </td>
                    {/* 銷售金額 */}
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, fontWeight:600, color:'var(--cyan)' }}>
                      {fmt.currency(p.rev)}
                    </td>
                    {/* 銷貨成本 */}
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, color:'var(--pink)' }}>
                      {fmt.currency(p.costTotal)}
                    </td>
                    {/* 毛利 */}
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontSize:17, fontWeight:600, color: p.gross >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {fmt.currency(p.gross)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background:'rgba(0,245,255,0.06)', borderTop:'2px solid var(--cyan)' }}>
                <td colSpan={3} style={{ fontFamily:'var(--title)', fontWeight:700, fontSize:18, color:'var(--cyan)', padding:'10px 12px', letterSpacing:2 }}>合　計</td>
                {PLATFORMS.map(({ label }) => (
                  <td key={label} style={{ background:COL_COLORS[label].bg }}/>
                ))}
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--purple)', fontSize:18 }}>{T.sets}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--yellow)', fontSize:18 }}>{T.units}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--cyan)',   fontSize:18 }}>{fmt.currency(T.rev)}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--pink)',   fontSize:18 }}>{fmt.currency(T.cost)}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--green)',  fontSize:18 }}>{fmt.currency(T.gross)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}