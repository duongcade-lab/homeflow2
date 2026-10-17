(function(){
  const HF = window.HF = window.HF || {};

  const DB = HF.db = {};

  DB.household = null;   // {household_id, name, role}

  // Real Supabase path: RPC calls (RLS-enforced, atomic in create_household).
  // Mock path (dev/testing only, ?mock=1): stored in localStorage, clearly demo.
  DB.getMyHousehold = async function(){
    if(!HF.auth) return null;
    if(HF.auth.mode==='mock'){
      try{
        const raw = localStorage.getItem('hf_mock_household');
        if(raw) DB.household = JSON.parse(raw);
      }catch(e){ DB.household = null; }
      return DB.household;
    }
    if(!HF.auth._sb) return null;
    const sb = HF.auth._sb;
    const { data, error } = await sb.rpc('get_my_household');
    if(error){ console.warn('get_my_household:', error.message); return null; }
    if(data && data.length) DB.household = data[0];
    return DB.household;
  };

  DB.createHousehold = async function(name){
    const n = String(name||'').trim();
    if(!n) throw new Error('name required');
    if(!HF.auth) throw new Error('auth not ready');
    if(HF.auth.mode==='mock'){
      DB.household = { household_id:'mock-household', name:n, role:'owner' };
      localStorage.setItem('hf_mock_household', JSON.stringify(DB.household));
      return DB.household;
    }
    if(!HF.auth._sb) throw new Error('auth not ready');
    const sb = HF.auth._sb;
    const { data, error } = await sb.rpc('create_household', { h_name: n });
    if(error) throw error;
    DB.household = { household_id: data, name: n, role: 'owner' };
    return DB.household;
  };
})();