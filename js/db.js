(function(){
  const HF = window.HF = window.HF || {};

  const DB = HF.db = {};

  DB.household = null;   // {household_id, name, role}
  DB.invites = [];       // household invitations (owner view)

  // ---------------------------------------------------------------- helpers
  function sb(){
    return HF.auth && HF.auth._sb;
  }
  function isMock(){
    return HF.auth && HF.auth.mode==='mock';
  }
  function mockStore(key, val){
    if(val === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, JSON.stringify(val));
  }

  // ------------------------------------------------------------ household
  DB.getMyHousehold = async function(){
    if(!HF.auth) return null;
    if(isMock()){
      try{
        const raw = localStorage.getItem('hf_mock_household');
        if(raw) DB.household = JSON.parse(raw);
      }catch(e){ DB.household = null; }
      return DB.household;
    }
    if(!sb()) return null;
    const { data, error } = await sb().rpc('get_my_household');
    if(error){ console.warn('get_my_household:', error.message); return null; }
    if(data && data.length) DB.household = data[0];
    return DB.household;
  };

  DB.createHousehold = async function(name){
    const n = String(name||'').trim();
    if(!n) throw new Error('name required');
    if(!HF.auth) throw new Error('auth not ready');
    if(isMock()){
      DB.household = { household_id:'mock-household', name:n, role:'owner' };
      mockStore('hf_mock_household', DB.household);
      return DB.household;
    }
    if(!sb()) throw new Error('auth not ready');
    const { data, error } = await sb().rpc('create_household', { h_name: n });
    if(error) throw error;
    DB.household = { household_id: data, name: n, role: 'owner' };
    return DB.household;
  };

  DB.renameHousehold = async function(name){
    const n = String(name||'').trim();
    if(!n) throw new Error('name required');
    if(!HF.auth) throw new Error('auth not ready');
    if(isMock()){
      if(!DB.household) throw new Error('no household');
      DB.household.name = n;
      mockStore('hf_mock_household', DB.household);
      return DB.household;
    }
    if(!sb() || !DB.household) throw new Error('no household');
    const { error } = await sb().from('households').update({ name: n }).eq('id', DB.household.household_id);
    if(error) throw error;
    DB.household.name = n;
    return DB.household;
  };

  // ------------------------------------------------------------ invitations
  DB.createInvitation = async function(email){
    const e = String(email||'').trim().toLowerCase();
    if(!e) throw new Error('email required');
    if(isMock()){
      const inv = { id:'inv_'+Date.now(), household_id:'mock-household', invited_email:e, token:'mock-token-'+Date.now(), status:'pending', created_at:new Date().toISOString(), expires_at:new Date(Date.now()+604800000).toISOString() };
      const list = JSON.parse(mockStore('hf_mock_invites')||'[]');
      list.push(inv);
      mockStore('hf_mock_invites', list);
      return inv.token;
    }
    if(!sb()) throw new Error('auth not ready');
    const { data, error } = await sb().rpc('create_invitation', { invited_email: e });
    if(error) throw error;
    return data;
  };

  DB.listInvitations = async function(){
    if(!HF.auth || !DB.household) return [];
    if(isMock()){
      try{ return JSON.parse(mockStore('hf_mock_invites')||'[]'); }catch(e){ return []; }
    }
    if(!sb()) return [];
    const { data, error } = await sb().from('household_invitations')
      .select('id,invited_email,status,created_at,expires_at')
      .eq('household_id', DB.household.household_id)
      .order('created_at', { ascending: false });
    if(error){ console.warn('listInvitations:', error.message); return []; }
    DB.invites = data || [];
    return DB.invites;
  };

  DB.cancelInvitation = async function(id){
    if(isMock()){
      const list = JSON.parse(mockStore('hf_mock_invites')||'[]').map(i=>i.id===id?Object.assign({},i,{status:'cancelled'}):i);
      mockStore('hf_mock_invites', list);
      return;
    }
    if(!sb()) throw new Error('auth not ready');
    const { error } = await sb().rpc('cancel_invitation', { inv_id: id });
    if(error) throw error;
  };

  DB.acceptInvitation = async function(token){
    if(isMock()){
      const list = JSON.parse(mockStore('hf_mock_invites')||'[]');
      const inv = list.find(i=>i.status==='pending' && i.token===token);
      if(!inv) throw new Error('invitation not found');
      DB.household = { household_id: inv.household_id, name:'Gia \u0111\u00ecnh \u0111\u01b0\u1ee3c m\u1eddi', role:'adult' };
      mockStore('hf_mock_household', DB.household);
      return DB.household;
    }
    if(!sb()) throw new Error('auth not ready');
    const { data, error } = await sb().rpc('accept_invitation', { inv_token: token });
    if(error) throw error;
    if(data && data.length) DB.household = { household_id: data[0].household_id, name: data[0].name, role: 'adult' };
    return DB.household;
  };

  DB.removeMember = async function(userId){
    if(isMock()) return;
    if(!sb()) throw new Error('auth not ready');
    const { error } = await sb().rpc('remove_member', { user_id: userId });
    if(error) throw error;
  };

  DB.removeMemberByEmail = async function(email){
    if(isMock()) return;
    if(!sb()) throw new Error('auth not ready');
    const { error } = await sb().rpc('remove_member_by_email', { invited_email: email });
    if(error) throw error;
  };

  // ------------------------------------------------- family-member linking
  DB.linkFamilyMember = async function(memberId){
    if(isMock()){
      const members = JSON.parse(mockStore('hf_mock_members')||'[]');
      mockStore('hf_mock_members', members.map(m=>m.id===memberId?Object.assign({},m,{linked_user_id:'mock-user'}):m));
      return;
    }
    if(!sb()) throw new Error('auth not ready');
    const { error } = await sb().rpc('link_family_member', { member_id: memberId });
    if(error) throw error;
  };

  DB.listAdultProfiles = async function(){
    if(!HF.auth || !DB.household) return [];
    if(isMock()){
      try{ return JSON.parse(mockStore('hf_mock_members')||'[]').filter(m=>m.kind!=='kid'); }catch(e){ return []; }
    }
    if(!sb()) return [];
    const { data, error } = await sb().from('family_members')
      .select('id,name,emoji,color,kind')
      .eq('household_id', DB.household.household_id)
      .eq('kind','adult');
    if(error) return [];
    return data||[];
  };

  DB.createFamilyMember = async function(member){
    if(!HF.auth || !DB.household) throw new Error('no household');
    if(isMock()){
      const list = JSON.parse(mockStore('hf_mock_members')||'[]');
      const m = Object.assign({id:'fm_'+Date.now(), kind:'adult', emoji:'\u{1F465}', color:'#9B7FC6'}, member);
      list.push(m);
      mockStore('hf_mock_members', list);
      return m;
    }
    if(!sb()) throw new Error('auth not ready');
    const { data, error } = await sb().from('family_members').insert({
      household_id: DB.household.household_id, kind:'adult', name: member.name,
      short: member.name, emoji: member.emoji||'\u{1F465}', color: member.color||'#9B7FC6'
    }).select('id,name,emoji,color,kind').single();
    if(error) throw error;
    return data;
  };

  // ------------------------------------------------------- shared data load
  // Maps Supabase rows -> in-memory app state (source of truth = Supabase).
  DB.loadHouseholdData = async function(){
    if(!HF.auth || !DB.household) return null;
    if(isMock()) return null; // mock keeps using localStorage state
    if(!sb()) return null;
    const hid = DB.household.household_id;

    const [fm, tk, ex, gr, he, ed] = await Promise.all([
      sb().from('family_members').select('*').eq('household_id', hid),
      sb().from('tasks').select('*').eq('household_id', hid),
      sb().from('expenses').select('*').eq('household_id', hid),
      sb().from('child_growth_records').select('*').eq('household_id', hid),
      sb().from('health_records').select('*').eq('household_id', hid),
      sb().from('education_records').select('*').eq('household_id', hid)
    ]);
    if(fm.error) throw fm.error;
    if(tk.error) throw tk.error;
    if(ex.error) throw ex.error;
    if(gr.error) throw gr.error;
    if(he.error) throw he.error;
    if(ed.error) throw ed.error;

    const members = (fm.data||[]).map(r=>({
      id: r.id, name: r.name, short: r.short||r.name, emoji: r.emoji||'\u{1F465}',
      color: r.color||'#9B7FC6', kind: r.kind, role: r.kind==='kid'?'Con':'Ng\u01b0\u1eddi l\u1edbn',
      dob: r.dob||'', linked_user_id: r.linked_user_id||null
    }));

    const tasks = (tk.data||[]).map(r=>({
      id: r.id, title: r.title, cat: r.cat||'home', due: new Date(r.due), time: r.time||'',
      owner: r.owner_id, planner: r.planner_id, shared: !!r.shared, mental: !!r.mental,
      status: r.status, pts: r.pts||1, kidOk: !!r.kid_ok, note: r.note||'',
      src: r.src||'sync', createdAt: r.created_at, doneAt: r.done_at?new Date(r.done_at):null
    }));

    const expenses = (ex.data||[]).map(r=>({
      id: r.id, title: r.title, amount: Number(r.amount), date: r.date,
      category: r.category, memberId: r.member_id, status: r.status, note: r.note||''
    }));

    const growth = (gr.data||[]).map(r=>({ id:r.id, kidId:r.kid_id, date:r.date, weight:r.weight, height:r.height, note:r.note||'' }));
    const health = (he.data||[]).map(r=>({ id:r.id, kidId:r.kid_id, date:r.date, note:r.note||'' }));
    const study  = (ed.data||[]).map(r=>({ id:r.id, kidId:r.kid_id, date:r.date, subject:r.subject||'', grade:r.grade||'', note:r.note||'' }));

    const state = {
      tasks, lastDump:null, dumpCount:0,
      history: { growth, health, study },
      family:{ name: DB.household.name, avatar:'' },
      feedback:[], growth:[],
      members,
      prefs:{ defaultView:'day', weekStart:'mon', showCompleted:true, showPlanner:true, showDoer:true },
      expenses:{ currency:'VND', categories: HF.CATEGORIES ? Object.values(HF.CATEGORIES).map(c=>({id:c.label, label:c.label, emoji:c.emoji})) : [], records: expenses }
    };
    return state;
  };

  // ------------------------------------------------------------- sync (upsert + delete diff)
  const _lastIds = { tasks:null, members:null, expenses:null, growth:null, health:null, study:null };
  let _syncTimer = null;

  function idSet(arr){ return new Set((arr||[]).map(x=>x.id)); }

  DB.flushSync = async function(state){
    if(!sb() || !DB.household || isMock()) return;
    const hid = DB.household.household_id;
    const cur = {
      tasks: idSet(state.tasks),
      members: idSet(HF.MEMBERS),
      expenses: idSet(state.expenses && state.expenses.records),
      growth: idSet(state.history && state.history.growth),
      health: idSet(state.history && state.history.health),
      study: idSet(state.history && state.history.study)
    };
    const del = (name, curSet) => {
      const prev = _lastIds[name];
      if(!prev) return [];
      return [...prev].filter(id=>!curSet.has(id));
    };

    // family members
    const memberRows = (HF.MEMBERS||[]).map(m=>({
      id: m.id, household_id: hid, kind: m.kind||'adult', name: m.name,
      short: m.short||m.name, emoji: m.emoji||'\u{1F465}', color: m.color||'#9B7FC6', dob: m.dob||null
    }));
    const dm = del('members', cur.members);
    if(memberRows.length) await sb().from('family_members').upsert(memberRows, { onConflict:'id' });
    if(dm.length) await sb().from('family_members').delete().in('id', dm);

    // tasks
    const taskRows = (state.tasks||[]).map(t=>({
      id: t.id, household_id: hid, title: t.title, cat: t.cat||'home',
      due: t.due instanceof Date ? t.due.toISOString().slice(0,10) : t.due,
      time: t.time||'', owner_id: t.owner||null, planner_id: t.planner||null,
      shared: !!t.shared, mental: !!t.mental, status: t.status||'open', pts: t.pts||1,
      kid_ok: !!t.kidOk, note: t.note||'', src: t.src||'sync',
      done_at: t.doneAt ? new Date(t.doneAt).toISOString() : null
    }));
    const dt = del('tasks', cur.tasks);
    if(taskRows.length) await sb().from('tasks').upsert(taskRows, { onConflict:'id' });
    if(dt.length) await sb().from('tasks').delete().in('id', dt);

    // expenses
    const expRows = ((state.expenses&&state.expenses.records)||[]).map(e=>({
      id: e.id, household_id: hid, title: e.title, amount: e.amount,
      date: e.date, category: e.category, member_id: e.memberId||null,
      status: e.status||'pending', note: e.note||''
    }));
    const de = del('expenses', cur.expenses);
    if(expRows.length) await sb().from('expenses').upsert(expRows, { onConflict:'id' });
    if(de.length) await sb().from('expenses').delete().in('id', de);

    // records
    const gRows = ((state.history&&state.history.growth)||[]).map(r=>({ id:r.id, household_id:hid, kid_id:r.kidId, date:r.date, weight:r.weight, height:r.height, note:r.note||'' }));
    const hRows = ((state.history&&state.history.health)||[]).map(r=>({ id:r.id, household_id:hid, kid_id:r.kidId, date:r.date, note:r.note||'' }));
    const sRows = ((state.history&&state.history.study)||[]).map(r=>({ id:r.id, household_id:hid, kid_id:r.kidId, date:r.date, subject:r.subject||'', grade:r.grade||'', note:r.note||'' }));
    const dg = del('growth', cur.growth), dh = del('health', cur.health), ds = del('study', cur.study);
    if(gRows.length) await sb().from('child_growth_records').upsert(gRows, { onConflict:'id' });
    if(hRows.length) await sb().from('health_records').upsert(hRows, { onConflict:'id' });
    if(sRows.length) await sb().from('education_records').upsert(sRows, { onConflict:'id' });
    if(dg.length) await sb().from('child_growth_records').delete().in('id', dg);
    if(dh.length) await sb().from('health_records').delete().in('id', dh);
    if(ds.length) await sb().from('education_records').delete().in('id', ds);

    _lastIds.tasks = cur.tasks;
    _lastIds.members = cur.members;
    _lastIds.expenses = cur.expenses;
    _lastIds.growth = cur.growth;
    _lastIds.health = cur.health;
    _lastIds.study = cur.study;
  };

  DB.sync = function(state){
    if(!sb() || !DB.household || isMock()) return;
    if(_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(()=>{ _syncTimer = null; DB.flushSync(state).catch(e=>console.warn('sync:', e.message)); }, 400);
  };

  DB.resetSyncBaseline = function(){
    _lastIds.tasks = _lastIds.members = _lastIds.expenses = _lastIds.growth = _lastIds.health = _lastIds.study = null;
  };
})();