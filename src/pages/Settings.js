export default function SettingsPage() {
  return (
    <div>
      <div className="card mb-16">
        <div className="card-title">Google Sheets 連結設定</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <label className="form-label">Google Sheets ID</label>
            <input className="form-input" readOnly defaultValue={process.env.REACT_APP_SHEET_ID||''} placeholder="在 .env 填入 REACT_APP_SHEET_ID"/>
          </div>
          <div>
            <label className="form-label">Google OAuth Client ID</label>
            <input className="form-input" readOnly defaultValue={process.env.REACT_APP_GOOGLE_CLIENT_ID||''} placeholder="在 .env 填入 REACT_APP_GOOGLE_CLIENT_ID"/>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">建置步驟說明</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[
            ['Step 1','申請 GitHub 帳號','前往 github.com → Sign up → 建立新 Repository (pnl-dashboard，設為 Public)'],
            ['Step 2','Google Cloud 設定','console.cloud.google.com → 建立專案 → 啟用 Sheets API + Drive API → 建立 OAuth Client ID'],
            ['Step 3','設定 .env','複製 .env.example 為 .env，填入 Client ID 和 Sheet ID'],
            ['Step 4','修改 homepage','package.json 第4行改為 https://你的帳號.github.io/pnl-dashboard'],
            ['Step 5','部署','npm install → npm run deploy → GitHub Settings → Pages → 選 gh-pages branch'],
          ].map(([step,title,desc]) => (
            <div key={step} style={{display:'flex',gap:12,padding:'10px 12px',background:'#F5F7FA',borderRadius:8}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:'#1F3864',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{step.slice(-1)}</div>
              <div><div style={{fontWeight:600,color:'#1F3864',fontSize:13,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:'#8A93A2'}}>{desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}