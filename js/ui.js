(function(){
  const HF = window.HF = window.HF || {};

  const el = HF.el = function(tag, attrs, children){
    const node = document.createElement(tag);
    if(attrs){
      for(const k in attrs){
        if(k==='class') node.className = attrs[k];
        else if(k==='html') node.innerHTML = attrs[k];
        else if(k.startsWith('on') && typeof attrs[k]==='function') node.addEventListener(k.slice(2), attrs[k]);
        else if(k==='dataset') Object.assign(node.dataset, attrs[k]);
        else node.setAttribute(k, attrs[k]);
      }
    }
    if(children == null) children = [];
    else if(!Array.isArray(children)) children = [children];
    (function flat(list){
      for(const c of list){
        if(c==null) continue;
        if(Array.isArray(c)){ flat(c); continue; }
        node.appendChild(typeof c==='string'||typeof c==='number' ? document.createTextNode(String(c)) : c);
      }
    })(children);
    return node;
  };

  HF.esc = function(s){
    return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  };

  HF.avatar = function(member, cls){
    const m = typeof member === 'object' ? member : HF.memberById(member);
    return el('span',{class:'avatar '+(cls||''),style:`background:${m.color}`},[m.short]);
  };

  HF.avatarRow = function(ids, cls){
    return el('div',{class:'avatar-row '+(cls||''),style:'display:flex'}, ids.map(id=>{
      const a = HF.avatar(id,'sm');
      a.style.boxShadow = '0 0 0 2px #fff';
      return a;
    }));
  };

  HF.toast = function(msg, ico){
    const wrap = document.getElementById('toastWrap');
    const t = el('div',{class:'toast'},[(ico?'':''), el('span',{},[ico||'\u2728']), el('span',{},[msg])]);
    wrap.appendChild(t);
    setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),320); }, 2400);
  };

  const canvasConfetti = (function(){
    let cv, ctx, parts=[], raf=null;
    function init(){
      cv = document.getElementById('confettiCanvas');
      ctx = cv.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }
    function resize(){
      cv.width = window.innerWidth * devicePixelRatio;
      cv.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    const COLORS = ['#8B6FB8','#E8936F','#F2C94C','#7FA98B','#EF8FA3','#5B9BD5'];
    function burst(){
      if(!cv){ init(); }
      const cx = window.innerWidth/2, cy = window.innerHeight*0.42;
      for(let i=0;i<90;i++){
        const ang = Math.random()*Math.PI*2;
        const sp = 4 + Math.random()*9;
        parts.push({
          x:cx, y:cy,
          vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp - 3,
          s:5+Math.random()*6,
          c:COLORS[i%COLORS.length],
          rot:Math.random()*Math.PI*2,
          vr:(Math.random()-0.5)*0.3,
          life:1
        });
      }
      if(!raf) loop();
    }
    function loop(){
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
      parts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.16; p.vx*=0.985; p.rot+=p.vr; p.life-=0.008;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0,p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*0.66);
        ctx.restore();
      });
      parts = parts.filter(p=>p.life>0 && p.y < window.innerHeight+40);
      if(!parts.length){ cancelAnimationFrame(raf); raf=null; ctx.clearRect(0,0,window.innerWidth,window.innerHeight); }
    }
    return {burst};
  })();
  HF.confetti = canvasConfetti.burst;

  HF.sheet = function(opts){
    const layer = document.getElementById('sheetLayer');
    layer.innerHTML = '';
    const overlay = el('div',{class:'sheet-overlay'});
    const sheet = el('div',{class:'sheet'});
    const grab = el('div',{class:'sheet-grab'});
    const head = el('div',{class:'sheet-head'},[
      el('div',{class:'sheet-title'},[opts.title||'']),
      el('button',{class:'btn btn-ghost',style:'padding:8px 14px;font-size:13px',onclick:close},['\u0110\u00f3ng'])
    ]);
    sheet.append(grab, head, opts.body());
    layer.append(overlay, sheet);
    requestAnimationFrame(()=>{ overlay.classList.add('show'); sheet.classList.add('show'); });
    function close(){
      overlay.classList.remove('show');
      sheet.classList.remove('show');
      setTimeout(()=>{ layer.innerHTML=''; },350);
      if(opts.onClose) opts.onClose();
    }
    overlay.addEventListener('click', close);
    const onKey = (e)=>{ if(e.key==='Escape') close(); };
    document.addEventListener('keydown', onKey);
    return {close, _onKey:onKey};
  };

  HF.ring = function(segments, centerBig, centerLbl, size){
    size = size || 172;
    const r = Math.round(size*0.415), sw = Math.round(size*0.115), cx = size/2, cy = size/2;
    const circ = 2*Math.PI*r;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox',`0 0 ${size} ${size}`);
    svg.setAttribute('width',size); svg.setAttribute('height',size);
    const bg = document.createElementNS(svgNS,'circle');
    bg.setAttribute('cx',cx); bg.setAttribute('cy',cy); bg.setAttribute('r',r);
    bg.setAttribute('fill','none'); bg.setAttribute('stroke','rgba(141,114,130,.10)');
    bg.setAttribute('stroke-width',sw);
    svg.appendChild(bg);
    let offset = 0;
    for(const seg of segments){
      const len = seg.frac*circ;
      if(len < 0.5) continue;
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',r);
      c.setAttribute('fill','none');
      c.setAttribute('stroke',seg.member.color);
      c.setAttribute('stroke-width',sw);
      c.setAttribute('stroke-linecap','round');
      c.setAttribute('stroke-dasharray',`${len-1.5} ${circ-len+1.5}`);
      c.setAttribute('stroke-dashoffset',-(offset + 0.75));
      c.setAttribute('transform',`rotate(-90 ${cx} ${cy})`);
      c.style.transition = 'stroke-dasharray .9s cubic-bezier(.22,1,.36,1), stroke-dashoffset .9s';
      svg.appendChild(c);
      offset += len;
    }
    const wrap = el('div',{class:'ring-wrap'},[
      svg,
      el('div',{class:'ring-center'},[
        el('div',{class:'big'},[centerBig]),
        el('div',{class:'lbl'},[centerLbl])
      ])
    ]);
    return wrap;
  };

  HF.contrib = function(task, opts){
    opts = opts||{};
    const planner = HF.memberById(task.planner || task.owner);
    const doer = task.shared ? null : HF.memberById(task.owner);
    const planItems = opts.planItems || HF.planningItems(task);
    const execItems = HF.executionItems(task, opts.execItems);

    const planCol = el('div',{class:'contrib-col contrib-plan'},[
      el('div',{class:'contrib-head'},['\u{1F9E0} '+planner.short+' lo']),
      ...planItems.map(it=>el('div',{class:'contrib-item'},[it]))
    ]);

    const doHead = task.shared ? 'C\u1ea3 nh\u00e0 l\u00e0m' : doer.short+' l\u00e0m';
    const doCol = el('div',{class:'contrib-col contrib-do'+(task.shared?' contrib-shared':''), style: task.shared?'':`background:${doer.soft};border-color:${doer.color}66`},[
      el('div',{class:'contrib-head',style:task.shared?'':`color:${doer.color}`},['\u25CF '+doHead]),
      ...execItems.map(it=>el('div',{class:'contrib-item'},[it]))
    ]);

    return el('div',{class:'contrib'},[planCol, doCol]);
  };

  HF.taskCard = function(task, opts){
    opts = opts||{};
    const m = HF.categoryById(task.cat);
    const owner = HF.memberById(task.owner);
    const done = task.status==='done';
    const dueLabel = HF.formatDay(task.due) + (task.time ? ' \u00b7 '+task.time : '');

    const check = el('button',{
      class:'check'+(done?' on':''), 'aria-label':done?'\u0110\u00e1nh d\u1ea5u ch\u01b0a xong':'Ho\u00e0n th\u00e0nh',
      onclick:()=>opts.onToggle && opts.onToggle(task)
    }, done?['\u2713']:[]);

    const meta = el('div',{class:'task-meta'},[
      el('span',{class:'chip',style:`background:${m.soft};color:${m.color}`},[m.emoji+' '+m.label]),
      opts.compact ? null : el('span',{class:'chip ghost'},['\u{1F5D3}\uFE0F '+dueLabel])
    ]);

    if(task.planner && (!HF.prefs || HF.prefs.showPlanner !== false)){
      const pl = HF.memberById(task.planner);
      meta.appendChild(el('span',{class:'chip-lo'},['\u{1F9E0} '+pl.short+' lo']));
    }
    if(!HF.prefs || HF.prefs.showDoer !== false){
      meta.appendChild(task.shared
        ? el('span',{class:'chip-lam chip-shared'},['C\u1ea3 nh\u00e0 l\u00e0m'])
        : el('span',{class:'chip-lam',style:'background:'+owner.color},[owner.short+' l\u00e0m']));
    }

    const body = el('div',{class:'task-body',style:'flex:1;min-width:0'},[
      el('div',{class:'task-title'},[task.title]),
      meta
    ]);

    const caret = el('span',{class:'expand-caret'+(task.planner?'':' inert')},['\u25BE']);

    const inner = el('div',{class:'list-row'},[
      check, body,
      HF.avatar(task.owner,'sm'),
      caret
    ]);

    const wrap = el('div',{class:'task-item'+(done?' task-done':''), style:'animation-delay:'+(opts.delay||0)+'ms'},[inner]);

    if(task.planner){
      const contribBox = el('div',{class:'task-contrib'},[HF.contrib(task)]);
      body.addEventListener('click', ()=>wrap.classList.toggle('expanded'));
      caret.addEventListener('click', ()=>wrap.classList.toggle('expanded'));
      wrap.appendChild(contribBox);
    }

    return wrap;
  };

  HF.ownerSelect = function(value, onChange, exclude){
    const sel = el('select',{class:'input'});
    for(const m of HF.MEMBERS){
      if(exclude && exclude.includes(m.id)) continue;
      const o = el('option',{value:m.id},[m.name]);
      sel.appendChild(o);
    }
    sel.value = value;
    sel.addEventListener('change', ()=>onChange(sel.value));
    return sel;
  };

  HF.dateSelect = function(value, onChange){
    const sel = el('select',{class:'input'});
    const opts = [];
    for(let i=-1;i<=14;i++){
      const d = HF.dayOffset(i);
      const lbl = i===0?'H\u00f4m nay':(i===1?'Ng\u00e0y mai':HF.formatDay(d));
      opts.push({d,lbl});
    }
    const vISO = new Date(value).toISOString();
    if(!opts.some(o=>o.d.toISOString()===vISO)){
      opts.unshift({d:new Date(value), lbl:'\u{1F4C5} '+HF.formatDay(new Date(value))});
    }
    for(const o of opts){
      const opt = el('option',{value:o.d.toISOString()},[o.lbl]);
      sel.appendChild(opt);
    }
    sel.value = vISO;
    sel.addEventListener('change', ()=>onChange(new Date(sel.value)));
    return sel;
  };

  HF.animateCount = function(node, to, suffix){
    const dur = 650;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1,(now-start)/dur);
      const eased = 1-Math.pow(1-p,3);
      node.textContent = Math.round(to*eased)+(suffix||'');
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  HF.todayGreeting = function(){
    const h = new Date().getHours();
    if(h<11) return 'Ch\u00e0o bu\u1ed5i s\u00e1ng';
    if(h<18) return 'Ch\u00e0o bu\u1ed5i chi\u1ec1u';
    return 'Ch\u00e0o bu\u1ed5i t\u1ed1i';
  };

  HF.todayEmptyMsg = function(){
    const d = new Date();
    const day = d.getDay();
    if(day===0 || day===6){
      return {ico:'\u{1F49C}', t:'Cu\u1ed1i tu\u1ea7n th\u1ea3nh th\u01a1i', s:'T\u1eadn h\u01b0\u1edfng th\u1eddi gian b\u00ean nhau nh\u00e9.'};
    }
    const h = d.getHours();
    if(h < 12){
      return {ico:'\u{1F324}\uFE0F', t:'H\u00f4m nay ch\u01b0a c\u00f3 vi\u1ec7c n\u00e0o c\u1ea7n nh\u1edb', s:'C\u1ea3 nh\u00e0 m\u00ecnh c\u1ee9 thong th\u1ea3 nh\u00e9.'};
    }
    if(h < 18){
      return {ico:'\u{1F33F}', t:'H\u00f4m nay nh\u1eb9 nh\u00e0ng r\u1ed3i', s:'D\u00e0nh th\u00eam th\u1eddi gian cho nhau nh\u00e9.'};
    }
    return {ico:'\u2615', t:'M\u1ed9t ng\u00e0y thong th\u1ea3', s:'D\u00e0nh th\u00eam th\u1eddi gian cho nhau nh\u00e9.'};
  };

  HF.helpItems = function(){
    function item(ico, t, s){
      return el('div',{class:'help-item'},[
        el('span',{class:'help-ico'},[ico]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'help-t'},[t]),
          el('div',{class:'help-s'},[s])
        ])
      ]);
    }
    return [
      item('\u2728','N\u00f3i v\u1edbi HomeFlow','K\u1ec3 vi\u1ec7c b\u1eb1ng l\u1eddi t\u1ef1 nhi\u00ean, HomeFlow t\u1ef1 hi\u1ec3u, s\u1eafp x\u1ebfp ng\u00e0y gi\u1edd v\u00e0 ph\u00e2n c\u00f4ng ng\u01b0\u1eddi ph\u1ee5 tr\u00e1ch.'),
      item('\u{1F9E0}','Ng\u01b0\u1eddi lo \u2260 ng\u01b0\u1eddi l\u00e0m','M\u1ed9t ng\u01b0\u1eddi nh\u1edb v\u00e0 l\u00ean k\u1ebf ho\u1ea1ch (lo), m\u1ed9t ng\u01b0\u1eddi th\u1ef1c hi\u1ec7n (l\u00e0m) \u2014 vi\u1ec7c nh\u1edb \u0111\u01b0\u1ee3c chia s\u1ebb, kh\u00f4ng ai g\u00e1nh m\u1ecdi th\u1ee9.'),
      item('\u2696\uFE0F','C\u00e2n b\u1eb1ng','Xem ai \u0111ang g\u00e1nh nhi\u1ec1u nh\u1ea5t v\u00e0 nh\u1eadn g\u1ee3i \u00fd chia s\u1ebb l\u1ea1i vi\u1ec7c cho c\u00e2n b\u1eb1ng.'),
      item('\u{1F4DD}','B\u1ea3n tin tu\u1ea7n','T\u1ed5ng k\u1ebft nh\u1eb9 nh\u00e0ng m\u1ed7i tu\u1ea7n: vi\u1ec7c \u0111\u00e3 xong, vi\u1ec7c c\u00f2n l\u1ea1i v\u00e0 \u0111i\u1ec1u c\u1ea7n nh\u1edb.'),
      item('\u{1F4CB}','Vi\u1ec7c nh\u00e0','Xem to\u00e0n b\u1ed9 vi\u1ec7c, \u0111\u00e1nh d\u1ea5u ho\u00e0n th\u00e0nh, th\u00eam vi\u1ec7c th\u1ee7 c\u00f4ng.')
    ];
  };

  HF.confirmDelete = function(opts){
    const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
      el('div',{style:'font-size:13.5px;font-weight:800'},[opts.title||'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a?']),
      opts.message ? el('div',{style:'font-size:12.5px;color:var(--muted);line-height:1.6'},[opts.message]) : null,
      opts.note ? el('div',{style:'font-size:11.5px;color:var(--danger);background:var(--danger-soft);border-radius:10px;padding:9px 11px;line-height:1.5'},[opts.note]) : null,
      el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
        el('button',{class:'btn btn-ghost',style:'flex:1;padding:13px 10px;font-size:13.5px'},['H\u1ee7y']),
        el('button',{class:'btn btn-danger',style:'flex:1;padding:13px 10px;font-size:13.5px'},['X\u00f3a'])
      ])
    ]);
    const sheet = HF.sheet({title:opts.head||'X\u00f3a?', body:()=>body});
    body.querySelector('.btn-ghost').addEventListener('click', ()=>sheet.close());
    body.querySelector('.btn-danger').addEventListener('click', ()=>{ sheet.close(); opts.onConfirm(); });
  };

  HF.confirmIssue = function(opts){
    const editMode = opts.mode==='edit';
    const overlay = el('div',{class:'issue-overlay'});
    const box = el('div',{class:'issue-box'},[
      el('div',{style:'font-size:13.5px;font-weight:800'},[opts.title||'C\u00f3 v\u1ebb ch\u01b0a \u1ed5n']),
      opts.message ? el('div',{style:'font-size:12.5px;color:var(--muted);line-height:1.6;margin-top:8px'},[opts.message]) : null,
      opts.note ? el('div',{style:'font-size:11.5px;color:#B96A43;background:#FBE9E0;border-radius:10px;padding:9px 11px;line-height:1.5;font-weight:600;margin-top:10px'},[opts.note]) : null,
      el('div',{style:'display:flex;gap:10px;margin-top:14px'},[
        el('button',{class:'btn btn-ghost',style:'flex:1;padding:13px 10px;font-size:13.5px'},[editMode?'H\u1ee7y':'\u0110\u1ed5i']),
        el('button',{class:'btn btn-primary',style:'flex:1;padding:13px 10px;font-size:13.5px'},[editMode?'Ch\u1ec9nh s\u1eeda':'V\u1eabn th\u00eam'])
      ])
    ]);
    document.body.appendChild(overlay);
    document.body.appendChild(box);
    requestAnimationFrame(()=>{ overlay.classList.add('show'); box.classList.add('show'); });
    function close(){
      overlay.classList.remove('show');
      box.classList.remove('show');
      setTimeout(()=>{ overlay.remove(); box.remove(); }, 300);
    }
    overlay.addEventListener('click', close);
    box.querySelector('.btn-ghost').addEventListener('click', ()=>{
      close();
      if(editMode){ opts.onCancel && opts.onCancel(); }
      else{ opts.onChange && opts.onChange(); }
    });
    box.querySelector('.btn-primary').addEventListener('click', ()=>{
      close();
      if(editMode){ opts.onEdit && opts.onEdit(); }
      else{ opts.onKeep && opts.onKeep(); }
    });
  };

  HF.openHelp = function(){
    HF.sheet({
      title:'Tr\u1ee3 gi\u00fap',
      body:()=>el('div',{style:'display:flex;flex-direction:column;gap:14px'},[
        ...HF.helpItems(),
        el('div',{style:'font-size:11.5px;color:var(--muted);text-align:center;margin-top:2px'},['C\u1ea7n h\u1ed7 tr\u1ee3 th\u00eam? Xem C\u00e0i \u0111\u1eb7t \u2192 Tr\u1ee3 gi\u00fap & Ph\u1ea3n h\u1ed3i \u2728'])
      ])
    });
  };
})();