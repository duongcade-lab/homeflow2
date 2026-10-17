(async function(){
  const HF = window.HF = window.HF || {};

  let state = null;
  let householdChecked = false;
  let pendingInvite = null;
  (function(){
    const m = location.search.match(/[?&]invite=([A-Za-z0-9\-]+)/i);
    if(m) pendingInvite = m[1];
  })();

  async function loadAppState(){
    if(state) return state;
    if(HF.auth.mode!=='off' && HF.db && HF.db.household){
      HF.setStateKey('homeflow_state_hh_'+HF.db.household.household_id);
      try{
        const remote = await HF.db.loadHouseholdData();
        if(remote){
          state = remote;
          HF.prefs = state.prefs;
          HF.MEMBERS.length = 0;
          HF.MEMBERS.push(...(remote.members||[]));
          HF.db.resetSyncBaseline();
          return state;
        }
      }catch(e){ console.warn('loadHouseholdData:', e.message); }
    }
    state = HF.loadState();
    HF.prefs = state.prefs;
    if(HF.auth.mode!=='off' && HF.db && HF.db.household){
      HF.sanitizeIds(state);
      HF.saveState(state);
    }
    return state;
  }

  const TABS = [
    {id:'today', ico:'\u{1F31E}', label:'H\u00f4m nay'},
    {id:'tasks', ico:'\u{1F4CB}', label:'Vi\u1ec7c nh\u00e0'},
    {id:'balance',ico:'\u2696\uFE0F', label:'C\u00e2n b\u1eb1ng'},
    {id:'expenses',ico:'\u{1F4B0}', label:'Chi ph\u00ed'},
    {id:'brief', ico:'\u{1F4DD}', label:'B\u1ea3n tin'},
    {id:'settings',ico:'\u2699\uFE0F', label:'C\u00e0i \u0111\u1eb7t'}
  ];

  function renderTopbar(route){
    const bar = document.getElementById('topbar');
    bar.innerHTML='';
    if(route.name==='today'){
      bar.appendChild(el('div',{style:'display:flex;align-items:center;justify-content:space-between'},[
        el('div',{style:'display:flex;align-items:center;gap:9px'},[
          el('span',{style:'width:34px;height:34px;border-radius:12px;background:linear-gradient(145deg,#9B7FC6,#7A5CA6);display:flex;align-items:center;justify-content:center;font-size:17px',class:'heartbeat'},['\u{1F49C}']),
          el('div',{},[
            el('div',{style:'font-weight:900;font-size:16px;letter-spacing:-.01em'},['HomeFlow']),
            el('div',{style:'font-size:10.5px;color:var(--muted);font-weight:600'},['Share the load. Enjoy the moments.'])
          ])
        ]),
        el('button',{class:'btn btn-soft',style:'padding:8px 14px;font-size:12.5px',onclick:()=>navigate('settings',{path:['help']})},['\u2753 Tr\u1ee3 gi\u00fap'])
      ]));
    }
  }

  function renderTabbar(route){
    const bar = document.getElementById('tabbar');
    bar.innerHTML='';
    TABS.forEach(t=>{
      bar.appendChild(el('button',{class:'tab-btn'+(route.name===t.id?' active':''),onclick:()=>navigate(t.id)},[
        el('span',{class:'ico'},[t.ico]),
        el('span',{},[t.label])
      ]));
    });
  }

  const speakFab = el('button',{class:'speak-fab','aria-label':'N\u00f3i v\u1edbi HomeFlow',onclick:()=>navigate('dump')},[
    el('span',{class:'speak-fab-ico'},['\u{1F399}\uFE0F']),
    el('span',{},['N\u00f3i v\u1edbi HomeFlow'])
  ]);
  document.body.appendChild(speakFab);

  function navigate(name, params){
    let hash = '#/'+name;
    if(params){
      if(params.path && params.path.length) hash += '/'+params.path.join('/');
      if(params.filter) hash += '?filter='+params.filter;
    }
    if(location.hash === hash) render();
    else location.hash = hash;
  }

  function routeFromHash(){
    const raw = location.hash.replace(/^#\/?/,'') || 'today';
    const [pathPart, qs] = raw.split('?');
    const parts = pathPart.split('/').filter(Boolean);
    const name = parts[0] || 'today';
    const params = {path: parts.slice(1)};
    if(qs){
      qs.split('&').forEach(p=>{
        const [k,v]=p.split('=');
        params[k]=decodeURIComponent(v||'');
      });
    }
    return {name, params};
  }

  function render(){
    if(!state && HF.auth.mode==='off') loadAppState();
    const route = routeFromHash();
    const screen = document.getElementById('screen');
    screen.innerHTML='';
    window.scrollTo({top:0});

    let nodes;
    switch(route.name){
      case 'tasks': nodes = HF.views.Tasks(state, navigate, route.params.filter||'all'); break;
      case 'expenses': nodes = HF.views.Expenses(state, navigate, route.params.filter||'today'); break;
      case 'missions': nodes = HF.views.Missions(state, navigate); break;
      case 'dump': nodes = HF.views.Dump(state, navigate); break;
      case 'balance': nodes = HF.views.Balance(state, navigate); break;
      case 'brief': nodes = HF.views.Brief(state, navigate); break;
      case 'settings': nodes = HF.views.Settings(state, navigate, route.params); break;
      default: nodes = HF.views.Today(state, navigate); break;
    }
    nodes.forEach(n=>{ if(n) screen.appendChild(n); });
    renderTopbar(route);
    renderTabbar(route);
    speakFab.style.display = route.name==='dump' ? 'none' : '';
  }

  function renderLogin(){
    const screen = document.getElementById('screen');
    screen.innerHTML='';
    document.getElementById('topbar').innerHTML='';
    document.getElementById('tabbar').innerHTML='';
    speakFab.style.display='none';

    const googleIcon = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.4 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.4 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';
    const spinner = '<span class="spin" aria-hidden="true"></span>';

    const st = HF.auth.state;
    let actionArea;
    if(HF.auth.mode==='supabase' || HF.auth.mode==='mock'){
      const busy = st==='logging_in' || st==='signing_out';
      const btnAttrs = {class:'login-google'+(busy?' busy':''),onclick:async()=>{
        try{ await HF.auth.signIn(); }
        catch(e){ /* state 'error' already emitted — UI reflects it */ }
      }};
      if(busy) btnAttrs.disabled = true;
      actionArea = el('div',{style:'width:100%'},[
        el('button',btnAttrs,[
          el('span',{html:busy?spinner:googleIcon}),
          el('span',{},[busy ? (st==='signing_out'?'\u0110ang \u0111\u0103ng xu\u1ea5t...':'\u0110ang \u0111\u0103ng nh\u1eadp...') : 'Ti\u1ebfp t\u1ee5c v\u1edbi Google'])
        ]),
        st==='error' ? el('div',{class:'login-err'},['\u0110\u0103ng nh\u1eadp ch\u01b0a th\u00e0nh c\u00f4ng, th\u1eed l\u1ea1i nh\u00e9']) : null,
        HF.auth.mode==='mock' ? el('div',{class:'login-dev'},['\u2699\uFE0F Ch\u1ebf \u0111\u1ed9 demo \u2014 ch\u01b0a c\u1ea5u h\u00ecnh Supabase']) : null
      ]);
    } else {
      actionArea = el('div',{class:'login-unconfigured'},[
        el('div',{class:'login-err-ico'},['\u{1F527}']),
        el('div',{style:'font-weight:800;font-size:13.5px'},['\u0110\u0103ng nh\u1eadp ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5u h\u00ecnh cho m\u00f4i tr\u01b0\u1eddng n\u00e0y.']),
        el('div',{class:'login-dev'},['Thi\u1ebft l\u1eadp SUPABASE_URL v\u00e0 SUPABASE_ANON_KEY \u0111\u1ec3 b\u1eadt \u0111\u0103ng nh\u1eadp Google.'])
      ]);
    }

    const box = el('div',{class:'login-wrap'},[
      el('div',{class:'login-card'},[
        el('div',{class:'login-logo heartbeat'},['\u{1F49C}']),
        el('div',{class:'login-brand'},['HomeFlow']),
        el('div',{class:'login-tag'},['Share the load. Enjoy the moments.']),
        el('div',{class:'login-sub'},['\u201CC\u00f9ng nhau chia s\u1ebb nh\u1eefng vi\u1ec7c c\u1ea7n nh\u1edb.\u201D']),
        el('div',{class:'login-sec'},['\u0110\u0103ng nh\u1eadp \u0111\u1ec3 gia \u0111\u00ecnh b\u1ea1n c\u00f3 m\u1ed9t kh\u00f4ng gian ri\u00eang v\u00e0 c\u00f9ng nhau chia s\u1ebb c\u00f4ng vi\u1ec7c.']),
        actionArea,
        el('div',{class:'login-foot'},['\u{1F49C} HomeFlow \u2014 c\u1ea3 nh\u00e0 nh\u1eb9 nh\u00e0ng h\u01a1n'])
      ])
    ]);
    screen.appendChild(box);
  }

  function renderOrLogin(){
    if(HF.auth.mode==='off') return render();
    if(!HF.auth.user) return renderLogin();
    if(!householdChecked) return renderSplash();
    if(!HF.db.household) return renderOnboarding();
    render();
  }

  async function checkHousehold(){
    if(HF.auth.mode==='off' || !HF.auth.user){ householdChecked = true; renderOrLogin(); return; }
    await HF.db.getMyHousehold();
    householdChecked = true;
    if(HF.db.household){ await loadAppState(); renderOrLogin(); return; }
    if(pendingInvite){ renderAcceptInvite(); return; }
    renderOrLogin();
  }

  function renderAcceptInvite(){
    const screen = document.getElementById('screen');
    screen.innerHTML='';
    document.getElementById('topbar').innerHTML='';
    document.getElementById('tabbar').innerHTML='';
    speakFab.style.display='none';
    const box = el('div',{class:'login-wrap'},[
      el('div',{class:'login-card'},[
        el('div',{class:'login-logo heartbeat'},['\u{1F49C}']),
        el('div',{class:'login-brand'},['B\u1ea1n \u0111\u01b0\u1ee3c m\u1eddi tham gia m\u1ed9t gia \u0111\u00ecnh']),
        el('div',{class:'login-sec'},['M\u1ed9t ng\u01b0\u1eddi th\u00e2n \u0111\u00e3 m\u1eddi b\u1ea1n c\u00f9ng chia s\u1ebb vi\u1ec7c nh\u00e0 tr\u00ean HomeFlow \u2764\uFE0F']),
        el('button',{class:'btn btn-primary',style:'width:100%;margin-top:22px;padding:14px',onclick:async()=>{
          const btn = box.querySelector('.btn-primary');
          btn.disabled = true;
          btn.textContent = '\u0110ang x\u00e1c nh\u1eadn...';
          try{
            await HF.db.acceptInvitation(pendingInvite);
            pendingInvite = null;
            history.replaceState(null,'',location.pathname);
            renderFamilyLink();
          }catch(e){
            btn.disabled = false;
            btn.textContent = '\u2713 Ch\u1ea5p nh\u1eadn l\u1eddi m\u1eddi';
            HF.toast(e.message==='this account already belongs to a household' ? 'T\u00e0i kho\u1ea3n n\u00e0y \u0111\u00e3 thu\u1ed9c m\u1ed9t gia \u0111\u00ecnh kh\u00e1c' : 'L\u1eddi m\u1eddi kh\u00f4ng h\u1ee3p l\u1ec7 ho\u1eb7c \u0111\u00e3 h\u1ebft h\u1ea1n','\u{1F914}');
          }
        }},['\u2713 Ch\u1ea5p nh\u1eadn l\u1eddi m\u1eddi'])
      ])
    ]);
    screen.appendChild(box);
  }

  async function renderFamilyLink(){
    const screen = document.getElementById('screen');
    screen.innerHTML='';
    document.getElementById('topbar').innerHTML='';
    document.getElementById('tabbar').innerHTML='';
    speakFab.style.display='none';
    let adults = [];
    try{ adults = await HF.db.listAdultProfiles(); }catch(e){}
    const nameInput = el('input',{class:'input',placeholder:'VD: M\u1eb9',maxlength:30});
    const box = el('div',{class:'login-wrap'},[
      el('div',{class:'login-card',style:'align-items:stretch;text-align:left'},[
        el('div',{class:'login-logo heartbeat',style:'align-self:center'},['\u{1F49C}']),
        el('div',{class:'login-brand',style:'text-align:center'},['Ch\u00e0o m\u1eebng \u0111\u1ebfn gia \u0111\u00ecnh!']),
        el('div',{class:'login-sec',style:'text-align:center'},['B\u1ea1n l\u00e0 th\u00e0nh vi\u00ean n\u00e0o trong gia \u0111\u00ecnh?']),
        el('div',{style:'display:flex;flex-direction:column;gap:8px;margin-top:16px'},[
          ...adults.map(a=>el('button',{class:'btn btn-soft',style:'width:100%;padding:13px;font-size:14px;text-align:left',onclick:async()=>{
            try{
              await HF.db.linkFamilyMember(a.id);
              await loadAppState();
              HF.toast('\u0110\u00e3 li\u00ean k\u1ebft h\u1ed3 s\u01a1 '+a.name,'\u2705');
              render();
            }catch(e){ HF.toast('Ch\u01b0a li\u00ean k\u1ebft \u0111\u01b0\u1ee3c','\u{1F914}'); }
          }},[a.emoji+' '+a.name])),
          el('div',{style:'display:flex;gap:8px;margin-top:4px'},[
            nameInput,
            el('button',{class:'btn btn-primary',style:'padding:13px 16px;font-size:13.5px;white-space:nowrap',onclick:async()=>{
              const n = nameInput.value.trim();
              if(!n){ HF.toast('Nh\u1eadp t\u00ean h\u1ed3 s\u01a1 nh\u00e9','\u{1F914}'); return; }
              try{
                const created = await HF.db.createFamilyMember({ name:n });
                await HF.db.linkFamilyMember(created.id);
                await loadAppState();
                HF.toast('\u0110\u00e3 t\u1ea1o h\u1ed3 s\u01a1 '+n,'\u2705');
                render();
              }catch(e){ HF.toast('Ch\u01b0a t\u1ea1o \u0111\u01b0\u1ee3c','\u{1F914}'); }
            }},['T\u1ea1o h\u1ed3 s\u01a1'])
          ])
        ])
      ])
    ]);
    screen.appendChild(box);
  }

  function renderSplash(){
    const screen = document.getElementById('screen');
    screen.innerHTML='';
    document.getElementById('topbar').innerHTML='';
    document.getElementById('tabbar').innerHTML='';
    speakFab.style.display='none';
    screen.appendChild(el('div',{class:'login-wrap'},[
      el('div',{class:'login-card',style:'padding:34px 26px'},[
        el('div',{class:'login-logo heartbeat'},['\u{1F49C}']),
        el('div',{class:'login-dev',style:'margin-top:16px'},['\u0110ang chu\u1ea9n b\u1ecb kh\u00f4ng gian gia \u0111\u00ecnh...'])
      ])
    ]));
  }

  function renderOnboarding(){
    const screen = document.getElementById('screen');
    screen.innerHTML='';
    document.getElementById('topbar').innerHTML='';
    document.getElementById('tabbar').innerHTML='';
    speakFab.style.display='none';

    const nameInput = el('input',{class:'input',placeholder:'VD: Gia \u0111\u00ecnh Bin',maxlength:40});
    const box = el('div',{class:'login-wrap'},[
      el('div',{class:'login-card'},[
        el('div',{class:'login-logo heartbeat'},['\u{1F49C}']),
        el('div',{class:'login-brand'},['Ch\u00e0o m\u1eebng \u0111\u1ebfn HomeFlow \u{1F49C}']),
        el('div',{class:'login-sec'},['M\u1ed7i gia \u0111\u00ecnh c\u00f3 m\u1ed9t kh\u00f4ng gian ri\u00eang \u0111\u1ec3 c\u00f9ng nhau chia s\u1ebb nh\u1eefng vi\u1ec7c c\u1ea7n nh\u1edb.']),
        el('button',{class:'btn btn-primary',style:'width:100%;margin-top:22px;padding:14px',onclick:()=>{
          const sheetBody = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
            el('div',{class:'rs-field'},[el('span',{},['T\u00ean gia \u0111\u00ecnh']), nameInput]),
            el('div',{style:'font-size:12px;color:var(--muted);font-weight:600'},['B\u1ea1n s\u1ebd tr\u1edf th\u00e0nh ch\u1ee7 gia \u0111\u00ecnh (Owner).']),
            el('button',{class:'btn btn-primary',style:'width:100%;padding:13px'},['\u{1F3E0} T\u1ea1o gia \u0111\u00ecnh'])
          ]);
          const sheet = HF.sheet({title:'\u{1F3E0} T\u1ea1o gia \u0111\u00ecnh m\u1edbi', body:()=>sheetBody});
          const createBtn = sheetBody.querySelector('.btn-primary');
          createBtn.addEventListener('click', async ()=>{
            const n = nameInput.value.trim();
            if(!n){ HF.toast('Nh\u1eadp t\u00ean gia \u0111\u00ecnh tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
            createBtn.disabled = true;
            createBtn.textContent = '\u0110ang t\u1ea1o...';
            try{
              await HF.db.createHousehold(n);
              await loadAppState();
              sheet.close();
              HF.toast('\u0110\u00e3 t\u1ea1o gia \u0111\u00ecnh '+n+' \u{1F49C}','\u{1F3E0}');
              householdChecked = true;
              render();
            }catch(e){
              createBtn.disabled = false;
              createBtn.textContent = '\u{1F3E0} T\u1ea1o gia \u0111\u00ecnh';
              HF.toast('Ch\u01b0a t\u1ea1o \u0111\u01b0\u1ee3c gia \u0111\u00ecnh, th\u1eed l\u1ea1i nh\u00e9','\u{1F914}');
            }
          });
        }},['\u{1F3E0} T\u1ea1o gia \u0111\u00ecnh m\u1edbi'])
      ])
    ]);
    screen.appendChild(box);
  }

  window.addEventListener('hashchange', renderOrLogin);

  function el(tag, attrs, children){
    return HF.el(tag, attrs, children);
  }

  await HF.auth.init();
  if(HF.auth.mode!=='off'){
    HF.auth.onChange(()=>{
      state = null;
      householdChecked = false;
      checkHousehold();
    });
  }
  checkHousehold();
})();