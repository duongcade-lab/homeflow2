(function(){
  const HF = window.HF = window.HF || {};

  const state = HF.loadState();
  HF.prefs = state.prefs;

  const TABS = [
    {id:'today', ico:'\u{1F31E}', label:'H\u00f4m nay'},
    {id:'tasks', ico:'\u{1F4CB}', label:'Vi\u1ec7c nh\u00e0'},
    {id:'dump', ico:'\u{1F9E0}', label:'Brain Dump'},
    {id:'balance',ico:'\u2696\uFE0F', label:'C\u00e2n b\u1eb1ng'},
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
    TABS.forEach((t,i)=>{
      if(t.id==='dump'){
        bar.appendChild(el('button',{class:'fab-btn','aria-label':'N\u00f3i v\u1edbi HomeFlow',onclick:()=>navigate('dump')},[
          el('span',{class:'fab-ring'}),
          '\u{1F9E0}'
        ]));
        return;
      }
      bar.appendChild(el('button',{class:'tab-btn'+(route.name===t.id?' active':''),onclick:()=>navigate(t.id)},[
        el('span',{class:'ico'},[t.ico]),
        el('span',{},[t.label])
      ]));
    });
  }

  function navigate(name, params){
    let hash = '#/'+name;
    if(params){
      if(params.path && params.path.length) hash += '/'+params.path.join('/');
      if(params.filter) hash += '?filter='+params.filter;
    }
    location.hash = hash;
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
      case 'dump': nodes = HF.views.Dump(state, navigate); break;
      case 'balance': nodes = HF.views.Balance(state, navigate); break;
      case 'brief': nodes = HF.views.Brief(state, navigate); break;
      case 'settings': nodes = HF.views.Settings(state, navigate, route.params); break;
      default: nodes = HF.views.Today(state, navigate); break;
    }
    nodes.forEach(n=>{ if(n) screen.appendChild(n); });
    renderTopbar(route);
    renderTabbar(route);
  }

  window.addEventListener('hashchange', render);

  function el(tag, attrs, children){
    return HF.el(tag, attrs, children);
  }

  render();
})();