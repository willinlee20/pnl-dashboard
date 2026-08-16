import { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';
import { autoParsePlatform } from '../utils/excelParser';
import { fmt, PLATFORM_COLORS } from '../utils/format';
import { STORES, PLATFORM_STORES, getStoreName } from '../utils/config';

if (!window._localData) window._localData = {};

const PLATFORMS = ['官網','momo','蝦皮','經銷'];

function StoreSelector({ platform, value, onChange }) {
  const options = (PLATFORM_STORES[platform] || []).map(id => STORES.find(s => s.id === id)).filter(Boolean);
  if (options.length <= 1) return null;
  return (
    <div style={{ marginTop:10 }}>
      <label className="form-label">這份報表是哪個賣場？</label>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
        {options.map(s => (
          <button key={s.id}
            className={`btn btn-sm ${value===s.id ? 'btn-primary' : 'btn-ghost'}`}
            style={ value===s.id ? { borderColor:s.color, color:s.color, background:`${s.color}15`, boxShadow:`0 0 8px ${s.color}30` } : {} }
            onClick={() => onChange(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function FileCard({ result, onRemove, onConfirm, confirming }) {
  const [showPreview, setShowPreview] = useState(false);
  const [storeId, setStoreId] = useState(() => {
    const opts = PLATFORM_STORES[result.platform] || [];
    return opts.length === 1 ? opts[0] : '';
  });
  const color = PLATFORM_COLORS[result.platform] || '#00f5ff';
  const preview = (result.rows || []).slice(0, 5);
  const needsStore = (PLATFORM_STORES[result.platform] || []).length > 1;
  const canConfirm = !needsStore || storeId;

  return (
    <div className="card mt-12" style={{ borderLeft:`3px solid ${color}`, boxShadow:`0 0 12px ${color}15` }}>
      <div className="flex-between">
        <div className="flex-center gap-8">
          <div style={{ width:32, height:32, borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', background:`${color}18`, fontSize:14, fontWeight:700, color, border:`1px solid ${color}40`, letterSpacing:1 }}>
            {result.platform}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:600, color:'var(--text)', letterSpacing:1 }}>{result.filename}</div>
            <div style={{ fontSize:14, color:'var(--muted)', marginTop:2 }}>
              {result.summary?.count} 筆有效資料 ·
              銷售金額 <span style={{ color:'var(--cyan)' }}>{fmt.currency(result.summary?.revenue)}</span>
              {storeId && <span style={{ marginLeft:8, color:'var(--yellow)' }}>▸ {getStoreName(storeId)}</span>}
            </div>
          </div>
        </div>
        <div className="flex-center gap-8">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(v => !v)}>
            <Eye size={13}/> {showPreview ? '收起' : '預覽'}
          </button>
          {!result.confirmed
            ? <button className="btn btn-primary btn-sm"
                onClick={() => onConfirm(result, storeId)}
                disabled={confirming || !canConfirm}
                title={!canConfirm ? '請先選擇賣場' : ''}>
                {confirming ? '存入中…' : canConfirm ? '◈ 確認匯入' : '請先選擇賣場'}
              </button>
            : <span className="badge badge-ok"><CheckCircle size={11}/> 已匯入</span>
          }
          <X size={14} style={{ cursor:'pointer', color:'var(--muted)' }} onClick={() => onRemove(result.id)}/>
        </div>
      </div>

      {/* 賣場選擇（蝦皮/官網才會出現） */}
      {!result.confirmed && (
        <StoreSelector platform={result.platform} value={storeId} onChange={setStoreId}/>
      )}
      {result.confirmed && result.storeId && (
        <div style={{ marginTop:8, fontSize:14, color:'var(--green)', letterSpacing:1 }}>
          ✓ 已匯入至賣場：{getStoreName(result.storeId)}
        </div>
      )}

      {showPreview && preview.length > 0 && (
        <div className="table-wrap mt-12">
          <table>
            <thead><tr>{preview[0].map((_, i) => <th key={i}>欄 {i+1}</th>)}</tr></thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => (
                  <td key={j} className="td-mono" style={{ maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:14 }}>
                    {String(cell || '–')}
                  </td>
                ))}</tr>
              ))}
            </tbody>
          </table>
          {result.rows.length > 5 && (
            <div style={{ fontSize:14, color:'var(--muted)', padding:'6px 0', textAlign:'right', letterSpacing:1 }}>
              顯示前 5 筆，共 {result.rows.length} 筆
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadPage({ onUploadDone }) {
  const [files, setFiles]           = useState([]);
  const [dragging, setDragging]     = useState(false);
  const [parsing, setParsing]       = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [error, setError]           = useState('');
  const inputRef = useRef();

  const processFiles = useCallback(async (fileList) => {
    setParsing(true); setError('');
    for (const file of Array.from(fileList)) {
      try {
        const result = await autoParsePlatform(file);
        if (!result.platform) { setError(`無法辨識「${file.name}」的平台格式`); continue; }
        setFiles(prev => [...prev, { ...result, filename:file.name, id:Date.now()+Math.random(), confirmed:false }]);
      } catch (e) { setError(`解析「${file.name}」失敗：${e.message}`); }
    }
    setParsing(false);
  }, []);

  const handleConfirm = useCallback(async (result, storeId) => {
    setConfirming(result.id);
    await new Promise(r => setTimeout(r, 500));
    // 累加模式：依訂單編號（第一欄）去重
    const key = storeId || result.platform;
    const existing = window._localData[key] || [];
    const existingIds = new Set(existing.map(r => Array.isArray(r) ? r[0] : r._id));
    const newRows = result.rows.filter(row => {
      const id = Array.isArray(row) ? row[0] : row._id;
      return id && !existingIds.has(id);
    });
    const dupeCount = result.rows.length - newRows.length;
    window._localData[key] = [
      ...existing,
      ...newRows.map(row => Array.isArray(row) ? row : { ...row, _storeId:storeId, _platform:result.platform }),
    ];
    setFiles(prev => prev.map(f => f.id === result.id
      ? { ...f, confirmed:true, storeId, dupeCount, newCount:newRows.length }
      : f
    ));
    onUploadDone?.(result.platform, storeId, new Date().toLocaleDateString('zh-TW'));
    setConfirming(null);
  }, [onUploadDone]);

  // 已上傳的賣場統計
  const uploadedStores = new Set(files.filter(f => f.confirmed && f.storeId).map(f => f.storeId));
  const uploadedPlatforms = new Set(files.filter(f => f.confirmed).map(f => f.platform));

  return (
    <div>
      {/* 賣場狀態 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {STORES.map(s => {
          const done = uploadedStores.has(s.id) || (s.id==='MOMO' && uploadedPlatforms.has('momo')) || (s.id==='ERP' && uploadedPlatforms.has('經銷'));
          return (
            <div key={s.id} className={`platform-chip${done ? ' done' : ''}`}>
              <div className="platform-dot" style={{ background: done ? s.color : 'var(--muted)', boxShadow: done ? `0 0 6px ${s.color}` : 'none' }}/>
              <div className="platform-chip-info">
                <div className="platform-chip-name" style={{ color: done ? s.color : 'var(--text)' }}>{s.name}</div>
                <div className="platform-chip-status" style={!done ? {color:'var(--yellow)'} : {}}>
                  {done ? `✓ 已匯入` : `⚠ ${s.platform} · 待上傳`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 拖曳區 */}
      <div
        className={`upload-zone${dragging ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" multiple hidden onChange={e => processFiles(e.target.files)}/>
        <div className="upload-zone-icon">
          {parsing ? <div className="spinner" style={{ width:32, height:32, margin:'0 auto' }}/> : <Upload size={32}/>}
        </div>
        <h3>{parsing ? '解析中…' : '拖曳 Excel 至此，或點擊選擇'}</h3>
        <p>支援 .xlsx / .xls · 自動辨識<strong> 官網、momo、蝦皮、經銷 </strong>格式</p>
        <p style={{ marginTop:8, fontSize:17, color:'var(--yellow)' }}>⚠ 蝦皮和官網上傳後需選擇賣場（TOOLA / 拓屋）</p>
        <p style={{ marginTop:4, fontSize:14, color:'var(--muted)' }}>◈ 累加模式：重複訂單編號自動去重，分批上傳也不會重複計算</p>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,0,110,0.08)', border:'1px solid rgba(255,0,110,0.3)', borderRadius:3, padding:'10px 14px', marginTop:12, fontSize:17, color:'var(--pink)' }}>
          <AlertCircle size={14}/> {error}
          <X size={12} style={{ marginLeft:'auto', cursor:'pointer' }} onClick={() => setError('')}/>
        </div>
      )}

      {/* 檔案卡片 */}
      {files.map(result => (
        <FileCard key={result.id} result={result}
          onRemove={id => setFiles(prev => prev.filter(f => f.id !== id))}
          onConfirm={handleConfirm}
          confirming={confirming === result.id}
        />
      ))}

      {/* 說明 */}
      <div className="card mt-20" style={{ background:'rgba(0,245,255,0.02)', border:'1px solid var(--border)' }}>
        <div className="card-title">各賣場報表說明</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, fontSize:14 }}>
          {[
            { name:'TOOLA 官網 / 拓屋 官網', tip:'Shopline 後台 → 訂單管理 → 匯出 Sales 報表', note:'上傳後選擇對應賣場' },
            { name:'TOOLA 蝦皮 / 拓屋 蝦皮', tip:'賣場中心 → 訂單 → 匯出已完成訂單（Order_completed）', note:'上傳後選擇對應賣場' },
            { name:'momo', tip:'廠商後台 → 訂單 → 廠商出貨報表', note:'系統自動依產品代號拆分品牌' },
            { name:'經銷 ERP', tip:'ERP → 銷貨明細表（含稅金額）', note:'系統自動依產品代號拆分品牌' },
          ].map(({ name, tip, note }) => (
            <div key={name} style={{ padding:12, background:'var(--bg3)', borderRadius:3, border:'1px solid var(--border)' }}>
              <div style={{ fontWeight:700, color:'var(--cyan)', marginBottom:6, letterSpacing:1, fontSize:14 }}>{name}</div>
              <div style={{ color:'var(--text)', marginBottom:6, lineHeight:1.6 }}>{tip}</div>
              <div style={{ color:'var(--yellow)', fontSize:17, marginTop:4 }}>⚠ {note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}