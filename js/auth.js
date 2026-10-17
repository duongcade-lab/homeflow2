(function(){
  const HF = window.HF = window.HF || {};

  const AUTH = HF.auth = {};

  AUTH.mode = 'off';      // 'supabase' | 'mock' | 'off'
  AUTH.user = null;       // {id, email, name, avatar}
  AUTH._sb = null;
  AUTH._cb = [];

  AUTH.onChange = function(cb){ AUTH._cb.push(cb); };

  function emit(){
    AUTH._cb.forEach(cb=>{ try{ cb(AUTH.user); }catch(e){} });
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

  AUTH.signIn = async function(){
    if(AUTH.mode==='supabase'){
      const { error } = await AUTH._sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.origin + location.pathname + location.hash }
      });
      if(error) throw error;
      return;
    }
    if(AUTH.mode==='mock'){
      const user = { id:'mock-user', email:'demo@homeflow.family', name:'Demo', avatar:'' };
      localStorage.setItem('hf_mock_session', JSON.stringify({ user:user, exp: Date.now()+2592000000 }));
      AUTH.user = user;
      emit();
      return;
    }
    throw new Error('auth not configured');
  };

  AUTH.signOut = async function(){
    if(AUTH.mode==='supabase'){ try{ await AUTH._sb.auth.signOut(); }catch(e){} }
    if(AUTH.mode==='mock'){ localStorage.removeItem('hf_mock_session'); }
    AUTH.user = null;
    emit();
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
      AUTH._sb.auth.onAuthStateChange((event, session)=>{
        AUTH.user = toUser(session);
        emit();
      });
    } else if(mockFlag){
      AUTH.mode = 'mock';
      try{
        const raw = localStorage.getItem('hf_mock_session');
        if(raw){
          const s = JSON.parse(raw);
          if(s.exp > Date.now()) AUTH.user = s.user;
        }
      }catch(e){}
    } else {
      AUTH.mode = 'off';
    }
    return AUTH.user;
  };
})();