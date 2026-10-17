(async function(){
  const HF = window.HF = window.HF || {};

  const state = HF.loadState();
  HF.prefs = state.prefs;

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
        el('button',{class:'btn btn-soft',style:'padding:8px 14px;font-size:12.5px',onclick:()=>HF.openHelp()},['\u2753 Tr\u1ee3 gi\u00fap'])
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

    const box = el('div',{class:'login-wrap'},[
      el('div',{class:'login-card'},[
        el('div',{class:'login-logo heartbeat'},['\u{1F49C}']),
        el('div',{class:'login-brand'},['HomeFlow']),
        el('div',{class:'login-tag'},['Share the load. Enjoy the moments.']),
        el('div',{class:'login-sub'},['\u201CC\u00f9ng nhau chia s\u1ebb nh\u1eefng vi\u1ec7c c\u1ea7n nh\u1edb.\u201D']),
        el('button',{class:'login-google',onclick:async()=>{
          const btn = box.querySelector('.login-google');
          btn.classList.add('busy');
          btn.disabled = true;
          try{
            await HF.auth.signIn();
          }catch(e){
            HF.toast('\u0110\u0103ng nh\u1eadp ch\u01b0a th\u00e0nh c\u00f4ng, th\u1eed l\u1ea1i nh\u00e9','\u{1F914}');
            btn.classList.remove('busy');
            btn.disabled = false;
          }
        }},[
          el('span',{style:'display:inline-flex;align-items:center'},[googleIcon]),
          el('span',{},['Continue with Google'])
        ]),
        el('div',{class:'login-foot'},['\u{1F49C} HomeFlow \u2014 c\u1ea3 nh\u00e0 nh\u1eb9 nh\u00e0ng h\u01a1n'])
      ])
    ]);
    screen.appendChild(box);
  }

  function renderOrLogin(){
    if(HF.auth.mode!=='off' && !HF.auth.user) renderLogin();
    else render();
  }

  window.addEventListener('hashchange', renderOrLogin);

  function el(tag, attrs, children){
    return HF.el(tag, attrs, children);
  }

  await HF.auth.init();
  if(HF.auth.mode!=='off'){
    HF.auth.onChange(()=>{ renderOrLogin(); });
  }
  renderOrLogin();
})();