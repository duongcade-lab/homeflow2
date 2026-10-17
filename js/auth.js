(function(){
  const HF = window.HF = window.HF || {};

  const AUTH = HF.auth = {};

  AUTH.mode = 'off';            // 'supabase' | 'mock' | 'off'
  AUTH.state = 'unconfigured';  // 'unconfigured'|'logged_out'|'logging_in'|'error'|'authenticated'|'signing_out'
  AUTH.error = '';
  AUTH.user = null;
  AUTH._sb = null;
  AUTH._cb = [];

  AUTH.onChange = function(cb){
    AUTH._cb.push(cb);
    return ()=>{ AUTH.off(cb); };
  };
  AUTH.off = function(cb){
    AUTH._cb = AUTH._cb.filter(x=>x!==cb);
  };

  function setState(s, err){
    AUTH.state = s;
    if(err !== undefined) AUTH.error = err || '';
    emit();
  }
  function emit(){
    AUTH._cb.forEach(cb=>{ try{ cb(AUTH.user, AUTH.state); }catch(e){} });
  }

  function toUser(session){
    if(!session || !session.user) return null;
    const u = session.user;
    return {
      id: u.id,
      email: u.email || '',
      name: u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name) || u.email || 'Th\u00e0nh vi\u00ean',
      avatar: u.user_metadata && (u.user_metadata.avatar_url || u.user_metadata.picture) || ''
    };
  }

  // Hash-router SPA: return to origin+pathname; default route (#/today) renders safely — no blank screen.
  AUTH.redirectTo = function(){
    return location.origin + location.pathname;
  };

  AUTH.signIn = async function(){
    if(AUTH.mode==='supabase'){
      setState('logging_in');
      try{
        const { error } = await AUTH._sb.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: AUTH.redirectTo() }
        });
        if(error){ setState('error', error.message); throw error; }
      }catch(e){
        setState('error', e.message || 'login_failed');
        throw e;
      }
      return;
    }
    if(AUTH.mode==='mock'){
      setState('logging_in');
      await new Promise(r=>setTimeout(r, 650));
      const user = { id:'mock-user', email:'demo@homeflow.family', name:'Demo', avatar:'' };
      localStorage.setItem('hf_mock_session', JSON.stringify({ user:user, exp: Date.now()+2592000000 }));
      AUTH.user = user;
      setState('authenticated');
      return;
    }
    setState('error', 'unconfigured');
    throw new Error('auth not configured');
  };

  AUTH.signOut = async function(){
    if(AUTH.mode==='supabase'){
      setState('signing_out');
      try{ await AUTH._sb.auth.signOut(); }catch(e){}
    }
    if(AUTH.mode==='mock'){ localStorage.removeItem('hf_mock_session'); }
    AUTH.user = null;
    setState('logged_out');
  };

  AUTH.init = async function(){
    let cfg = { supabaseUrl:'', supabaseAnonKey:'' };
    try{
      const r = await fetch('/api/config', { cache:'no-store' });
      if(r.ok) cfg = await r.json();
    }catch(e){ /* local preview has no /api/config */ }

    const mockFlag = localStorage.getItem('hf_mock_auth')==='1' || /[?&]mock=1/.test(location.search);

    if(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase){
      AUTH.mode = 'supabase';
      AUTH._sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await AUTH._sb.auth.getSession();
      AUTH.user = toUser(data.session);
      AUTH.state = AUTH.user ? 'authenticated' : 'logged_out';
      AUTH._sb.auth.onAuthStateChange((event, session)=>{
        AUTH.user = toUser(session);
        if(event==='SIGNED_OUT') setState('logged_out');
        else if(event==='SIGNED_IN' || event==='INITIAL_SESSION' || event==='TOKEN_REFRESHED') setState(AUTH.user?'authenticated':'logged_out');
        else emit();
      });
    } else if(mockFlag){
      AUTH.mode = 'mock';
      try{
        const raw = localStorage.getItem('hf_mock_session');
        if(raw){
          const s = JSON.parse(raw);
          if(s.exp > Date.now()){ AUTH.user = s.user; AUTH.state = 'authenticated'; }
        }
      }catch(e){}
      if(!AUTH.user) AUTH.state = 'logged_out';
    } else {
      AUTH.mode = 'off';
      AUTH.state = 'unconfigured';
    }
    return AUTH.user;
  };
})();