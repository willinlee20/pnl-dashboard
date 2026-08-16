import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const AuthContext = createContext(null);
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive.file','profile','email'].join(' ');
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.head.appendChild(script);
    const saved = localStorage.getItem('pnl_user');
    if (saved) {
      try {
        const { user: u, token: t, expires } = JSON.parse(saved);
        if (Date.now() < expires) { setUser(u); setToken(t); }
        else localStorage.removeItem('pnl_user');
      } catch { localStorage.removeItem('pnl_user'); }
    }
    setLoading(false);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);
  const login = useCallback(() => {
    if (!gsiLoaded || !window.google) { alert('Google 登入尚未就緒'); return; }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: SCOPES,
      callback: async (resp) => {
        if (resp.error) return;
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${resp.access_token}` } });
        const profile = await res.json();
        const userData = { name: profile.name, email: profile.email, picture: profile.picture };
        setUser(userData); setToken(resp.access_token);
        localStorage.setItem('pnl_user', JSON.stringify({
          user: userData, token: resp.access_token, expires: Date.now() + 55*60*1000
        }));
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  }, [gsiLoaded]);
  const logout = useCallback(() => {
    setUser(null); setToken(null); localStorage.removeItem('pnl_user');
  }, []);
  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);