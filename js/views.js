(function(){
  const HF = window.HF = window.HF || {};
  const V = HF.views = {};

  function todayTasks(state){
    const today = HF.dayOffset(0);
    return state.tasks.filter(t=>t.status==='open' && HF.isSameDay(t.due, today));
  }

  V.Today = function(state, nav){
    const load = HF.computeLoad(state.tasks);
    const todays = todayTasks(state);
    const brief = HF.buildBrief(state);
    const imb = HF.findImbalance(load);

    const screen = [];

    const header = el('div',{},[
      el('div',{class:'eyebrow'},['HomeFlow \u00b7 '+HF.formatDay(HF.dayOffset(0))]),
      el('h1',{class:'page-title',style:'margin-top:4px'},[HF.todayGreeting()+', c\u1ea3 nh\u00e0 \u{1F44B}']),
      el('div',{class:'sub'},['H\u00f4m nay c\u00f3 '+todays.length+' vi\u1ec7c \u0111ang ch\u1edd \u2014 chia s\u1ebb \u0111\u1ec3 nh\u1eb9 vai h\u01a1n'])
    ]);

    const speakCard = el('div',{class:'speak-card',onclick:()=>nav('dump')},[
      el('div',{class:'speak-mic'},['\u{1F399}\uFE0F']),
      el('div',{class:'speak-title'},['N\u00f3i v\u1edbi HomeFlow']),
      el('div',{class:'speak-sub'},['C\u1ee9 n\u00f3i ra \u2014 HomeFlow lo ph\u1ea7n c\u00f2n l\u1ea1i.']),
      el('div',{class:'speak-btn'},['\u{1F399}\uFE0F B\u1eaft \u0111\u1ea7u n\u00f3i'])
    ]);

const todayCard = el('div',{class:'card compact',style:'padding-top:13px;padding-bottom:13px'},[
      el('div',{class:'section-label with-hint'},[
        el('span',{class:'bar'}),
        el('span',{style:'white-space:nowrap'},['H\u00f4m nay c\u1ea7n nh\u1edb']),
        el('span',{style:'font-size:9px;font-weight:600;color:var(--muted);text-transform:none;letter-spacing:0;white-space:nowrap'},['lo = nh\u1edb \u00b7 l\u00e0m = th\u1ef1c hi\u1ec7n'])
      ]),
      ...(todays.length===0
        ? [el('div',{class:'empty'},[el('span',{class:'e-ico'},['\u{1F389}']), el('div',{class:'e-t'},['H\u00f4m nay r\u1ea3nh r\u1ed3i!']), el('div',{class:'e-s'},['T\u1eadn h\u01b0\u1edfng kho\u1ea3nh kh\u1eafc b\u00ean gia \u0111\u00ecnh nh\u00e9'])])]
        : todays.slice(0,2).map((t,i)=>HF.taskCard(t,{compact:true, delay:i*60, onToggle:()=>toggleTask(state,t,nav)}))),
      todays.length>2 ? el('div',{style:'text-align:center;margin-top:10px'},
        el('button',{class:'btn btn-soft',style:'padding:9px 18px;font-size:13px',onclick:()=>nav('tasks')},['Xem t\u1ea5t c\u1ea3 '+todays.length+' vi\u1ec7c'])) : null
    ]);

    const maxTotal = Math.max(...HF.MEMBERS.map(m=>load[m.id].total), 1);
    const loadCard = el('div',{class:'card compact',style:'cursor:pointer;padding-top:13px;padding-bottom:13px',onclick:()=>nav('balance')},[
      el('div',{class:'section-label',style:'margin-bottom:12px'},[el('span',{class:'bar'}),'Family Load']),
      el('div',{class:'stacked-bar'}, HF.MEMBERS.map(m=>
        el('div',{style:`flex:${load[m.id].total};background:${m.color}`})
      )),
      el('div',{class:'load-legend'}, HF.MEMBERS.map(m=>
        el('span',{},[el('i',{style:'background:'+m.color}), m.name+' '+load[m.id].share+'%'])
      )),
      el('div',{class:'load-status'},[
        imb
          ? '\u2696\uFE0F '+imb.max.member.name+' \u0111ang g\u00e1nh nhi\u1ec1u nh\u1ea5t'
          : '\u{1F31F} C\u1ea3 nh\u00e0 \u0111ang c\u00e2n b\u1eb1ng t\u1ed1t',
        el('span',{style:'color:var(--primary-deep);font-weight:800'},['\u2192'])
      ])
    ]);

    const briefTeaser = el('div',{class:'card',style:'cursor:pointer;background:linear-gradient(135deg,#FFF7E8,#FDE9EE)',onclick:()=>nav('brief')},[
      el('div',{style:'display:flex;align-items:center;gap:12px'},[
        el('span',{style:'font-size:30px'},['\u{1F4DD}']),
        el('div',{style:'flex:1'},[
          el('div',{style:'font-weight:800;font-size:14.5px'},['B\u1ea3n tin tu\u1ea7n \u0111\u00e3 s\u1eb5n s\u00e0ng']),
          el('div',{class:'sub',style:'font-size:12px'},[brief.doneCount+' vi\u1ec7c \u0111\u00e3 xong, '+brief.openSoonCount+' vi\u1ec7c s\u1eafp t\u1edbi'])
        ]),
        el('span',{style:'color:var(--primary-deep);font-weight:800'},['\u2192'])
      ])
    ]);

    const footer = el('div',{class:'footer-note'},['\u{1F49C} HomeFlow']);

    screen.push(header, speakCard, todayCard, loadCard, briefTeaser, footer);
    return screen;
  };

  V.Tasks = function(state, nav, filter){
    const segs = [
      {id:'all', label:'T\u1ea5t c\u1ea3'},
      {id:'today', label:'H\u00f4m nay'},
      {id:'week', label:'Tu\u1ea7n n\u00e0y'},
      {id:'done', label:'\u0110\u00e3 xong'}
    ];
    let list = state.tasks.slice();
    if(filter==='today') list = list.filter(t=>t.status==='open' && HF.isSameDay(t.due, HF.dayOffset(0)));
    else if(filter==='week') list = list.filter(t=>t.status==='open' && t.due <= HF.dayOffset(7));
    else if(filter==='done') list = list.filter(t=>t.status==='done');
    else list = list.filter(t=>t.status==='open');

    list.sort((a,b)=>{
      if(a.status!==b.status) return a.status==='done'?1:-1;
      return a.due-b.due;
    });

    const segBar = el('div',{class:'seg'}, segs.map(s=>{
      const b = el('button',{class:filter===s.id?'active':'',onclick:()=>nav('tasks',{filter:s.id})},[s.label]);
      return b;
    }));

    const openCount = state.tasks.filter(t=>t.status==='open').length;

    const screen = [
      el('div',{},[
        el('div',{class:'eyebrow'},['Chia sẻ việc nhà']),
        el('h1',{class:'page-title',style:'margin-top:4px'},['Vi\u1ec7c nh\u00e0']),
        el('div',{class:'sub'},[openCount+' vi\u1ec7c \u0111ang m\u1edf \u2014 c\u00f9ng ph\u00e2n c\u00f4ng, c\u00f9ng ho\u00e0n th\u00e0nh'])
      ]),
      segBar,
      el('div',{style:'margin-top:14px'}, list.length===0
        ? el('div',{class:'card empty'},[el('span',{class:'e-ico'},['\u{1F389}']), el('div',{class:'e-t'},['Kh\u00f4ng c\u00f3 vi\u1ec7c n\u00e0o']), el('div',{class:'e-s'},['Th\u00eam vi\u1ec7c m\u1edbi ho\u1eb7c k\u1ec3 HomeFlow nghe'])])
        : list.map((t,i)=>HF.taskCard(t,{delay:i*40, onToggle:()=>toggleTask(state,t,nav)})))
    ];

    screen.push(el('div',{style:'margin-top:16px'},
      el('button',{class:'btn btn-soft',style:'width:100%',onclick:()=>openAddSheet(state,nav)},['+ Th\u00eam vi\u1ec7c th\u1ee7 c\u00f4ng'])));
    return screen;
  };

  function toggleTask(state, task, nav){
    if(task.status==='done'){
      task.status='open';
      task.doneAt=null;
      HF.saveState(state);
      HF.toast('\u0110\u00e3 m\u1edf l\u1ea1i vi\u1ec7c \u201c'+task.title+'\u201d','\u21A9\uFE0F');
    }else{
      task.status='done';
      task.doneAt=new Date();
      HF.saveState(state);
      HF.confetti();
      HF.toast('Ho\u00e0n th\u00e0nh \u201c'+task.title+'\u201d \u2014 c\u1ea3 nh\u00e0 gi\u1ecfi qu\u00e1!','\u{1F389}');
    }
    nav('tasks',{filter:location.hash.includes('filter=')?location.hash.split('filter=')[1]:'all'});
  }

  V.Dump = function(state, nav){
    const screen = [];
    let parsed = null;
    let editing = false;

    const header = el('div',{},[
      el('div',{class:'eyebrow'},['\u{1F399}\uFE0F N\u00f3i v\u1edbi HomeFlow']),
      el('h1',{class:'page-title',style:'margin-top:4px;font-size:21px'},['C\u1ee9 n\u00f3i ra,', el('br'), 'HomeFlow lo ph\u1ea7n c\u00f2n l\u1ea1i']),
      el('div',{class:'sub'},['M\u1ed9t \u0111o\u1ea1n nh\u1eafn l\u00e0 AI hi\u1ec3u vi\u1ec7c, s\u1eafp l\u1ecbch v\u00e0 g\u1ee3i \u00fd ai lo \u2014 ai l\u00e0m.'])
    ]);

    const ta = el('textarea',{class:'input',rows:6,placeholder:'VD: Th\u1ee9 7 Bin h\u1ecdc ti\u1ebfng Anh l\u00fac 9h, b\u1ed1 \u0111\u01b0a con \u0111i. Ch\u1ee7 nh\u1eadt sinh nh\u1eadt b\u00e0 n\u00ean th\u1ee9 6 nh\u1edb mua qu\u00e0.'});

    const exampleBox = el('div',{class:'field-hint'},['Th\u1eed m\u1ed9t m\u1eabu:']);
    const chips = el('div',{class:'example-chips'}, HF.EXAMPLE_DUMPS.map((ex,i)=>
      el('button',{class:'example-chip',onclick:()=>{ta.value=ex; ta.focus();}},['M\u1eabu '+(i+1)])
    ));
    exampleBox.appendChild(chips);

    const goBtn = el('button',{class:'btn btn-speak'},['\u{1F399}\uFE0F N\u00f3i v\u1edbi HomeFlow']);

    const stageBox = el('div',{style:'display:none'});

    const resultBox = el('div',{style:'display:none'});

    const dumpCard = el('div',{class:'card',style:'display:flex;flex-direction:column'},[
      el('div',{class:'field'},[
        el('label',{},['\u0110i\u1ec1u b\u1ea1n \u0111ang ngh\u0129']),
        ta, exampleBox
      ]),
      goBtn,
      el('div',{class:'dump-trust'},['\u2728 AI hi\u1ec3u ti\u1ebfng Vi\u1ec7t t\u1ef1 nhi\u00ean \u2014 c\u1ee9 n\u00f3i nh\u01b0 \u0111ang nh\u1eafn cho ng\u01b0\u1eddi th\u00e2n.'])
    ]);

    screen.push(header, dumpCard, stageBox, resultBox);

    const helpCard = el('div',{class:'card compact',style:'margin-top:14px'},[
      el('div',{class:'section-label',style:'margin-bottom:4px'},[el('span',{class:'bar'}),'HomeFlow s\u1ebd gi\u00fap c\u1ea3 nh\u00e0']),
      el('div',{class:'help-row'},['\u{1F9E0}', 'Nh\u00ecn th\u1ea5y nh\u1eefng vi\u1ec7c kh\u00f4ng t\u00ean trong \u0111\u1ea7u b\u1ea1n']),
      el('div',{class:'help-row'},['\u{1F5D3}\uFE0F', 'T\u1ef1 \u0111\u1eb7t deadline v\u00e0 l\u1ecbch nh\u1eafc cho c\u1ea3 nh\u00e0']),
      el('div',{class:'help-row'},['\u{1F91D}', 'G\u1ee3i \u00fd ai lo \u2014 ai l\u00e0m, c\u00e2n b\u1eb1ng vi\u1ec7c nh\u00e0'])
    ]);
    screen.push(helpCard);

    goBtn.addEventListener('click', ()=>{
      const text = ta.value.trim();
      if(text.length < 8){
        HF.toast('K\u1ec3 th\u00eam m\u1ed9t ch\u00fat chi ti\u1ebft nh\u00e9','\u{1F914}');
        ta.focus();
        return;
      }
      parsed = HF.parseBrainDump(text);
      runAI(parsed);
    });

    function runAI(parsedTasks){
      dumpCard.style.display='none';
      stageBox.style.display='';
      stageBox.innerHTML='';

      const orb = el('div',{class:'ai-orb'},[
        el('span',{class:'ai-orb-ring r1'}),
        el('span',{class:'ai-orb-ring r2'}),
        el('span',{class:'ai-orb-core'},['\u{1F49C}'])
      ]);
      const stageTitle = el('div',{class:'ai-stage-title'},['HomeFlow \u0111ang hi\u1ec3u vi\u1ec7c nh\u00e0 c\u1ee7a b\u1ea1n']);
      const rowsWrap = el('div',{class:'ai-states'});
      stageBox.append(orb, stageTitle, rowsWrap);

      const rows = HF.AI_STATES.map((s,i)=>{
        const row = el('div',{class:'ai-state'},[
          el('span',{class:'ai-state-ico'},[s.ico]),
          el('span',{class:'ai-state-t'},[s.t])
        ]);
        rowsWrap.appendChild(row);
        return row;
      });

      let idx = 0;
      function advance(){
        if(idx >= rows.length){
          setTimeout(()=>{
            stageBox.style.display='none';
            renderResults(parsedTasks);
          }, 320);
          return;
        }
        const row = rows[idx];
        row.classList.add('active');
        const tEl = row.querySelector('.ai-state-t');
        tEl.innerHTML = tEl.textContent + '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        setTimeout(()=>{
          row.classList.remove('active');
          row.classList.add('done');
          const ico = row.querySelector('.ai-state-ico');
          ico.textContent = '\u2713';
          ico.classList.add('ok');
          idx++;
          setTimeout(advance, 110);
        }, 960);
      }
      setTimeout(advance, 380);
    }

    function renderResults(parsedTasks){
      resultBox.style.display='';
      resultBox.innerHTML='';

      resultBox.appendChild(el('div',{class:'result-headline'},[
        el('span',{style:'font-size:22px'},['\u2728']),
        el('div',{},[
          el('div',{class:'result-headline-t'},['HomeFlow \u0111\u00e3 hi\u1ec3u '+parsedTasks.length+' vi\u1ec7c']),
          el('div',{class:'result-headline-s'},['Ki\u1ec3m tra nhanh r\u1ed3i th\u00eam v\u00e0o HomeFlow nh\u00e9'])
        ])
      ]));

      const cards = parsedTasks.map((t,i)=>{
        const cat = HF.categoryById(t.cat);
        const planner = HF.memberById(t.planner||'me');
        const doer = t.shared ? null : HF.memberById(t.owner);

        const roleBlocks = el('div',{class:'rcard-roles'},[
          el('div',{class:'role-block role-plan'},[
            el('div',{class:'role-label'},['\u{1F9E0} L\u1eacP K\u1ebe HO\u1ea0CH']),
            el('div',{class:'role-name'},[planner.short])
          ]),
          el('div',{class:'role-vs'},['\u2260']),
          el('div',{class:'role-block role-do'+(t.shared?' role-shared':''),style:t.shared?'':`background:${doer.color}`},[
            el('div',{class:'role-label'},['\u25CF TH\u1ef0C HI\u1ec6N']),
            el('div',{class:'role-name'},[t.shared?'C\u1ea3 nh\u00e0':doer.short])
          ])
        ]);

        const rolesWrap = el('div',{class:'rcard-roles-wrap'},[
          roleBlocks,
          el('div',{class:'rcard-roles-more'},['Xem ai \u0111\u00f3ng g\u00f3p g\u00ec ', el('span',{class:'more-caret'},['\u25BE'])]),
          el('div',{class:'rcard-contrib'},[HF.contrib(t)])
        ]);
        roleBlocks.addEventListener('click', ()=>rolesWrap.classList.toggle('expanded'));

        const editFields = el('div',{class:'rcard-edit'},[
          el('div',{class:'rs-field'},[
            el('span',{},['\u25B6 Ai th\u1ef1c hi\u1ec7n']),
            HF.ownerSelect(t.owner, v=>{t.owner=v; t.shared=false;})
          ]),
          el('div',{class:'rs-field'},[
            el('span',{},['\u{1F9E0} Ai l\u1eadp k\u1ebf ho\u1ea1ch']),
            HF.ownerSelect(t.planner||'me', v=>{t.planner=v; t.mental=true;})
          ]),
          el('div',{class:'rs-field'},[
            el('span',{},['\u{1F5D3}\uFE0F Deadline']),
            HF.dateSelect(t.due, v=>{t.due=v;})
          ])
        ]);

        const card = el('div',{class:'rcard',style:'animation-delay:'+(i*110)+'ms'},[
          el('div',{class:'rcard-head'},[
            el('div',{class:'rcard-emoji',style:'background:'+cat.soft},[cat.emoji]),
            el('div',{class:'rcard-main'},[
              el('div',{class:'rcard-title'},[t.title]),
              el('div',{class:'rcard-when'},['\u{1F5D3}\uFE0F '+HF.formatDay(t.due)+(t.time?' \u00b7 '+t.time:'')])
            ]),
            el('span',{class:'conf-badge'},['\u2713 \u0110\u00e3 hi\u1ec3u'])
          ]),
          rolesWrap,
          editFields
        ]);
        return card;
      });
      cards.forEach(c=>resultBox.appendChild(c));

      const editBtn = el('button',{class:'btn btn-ghost',style:'flex:0.55;font-size:13px;padding:14px 10px'},['\u270F\uFE0F Ch\u1ec9nh s\u1eeda']);
      const confirmBtn = el('button',{class:'btn btn-speak',style:'flex:1.45'},['\u2713 Th\u00eam v\u00e0o HomeFlow']);
      const btnRow = el('div',{class:'dump-actions'},[editBtn, confirmBtn]);
      resultBox.appendChild(btnRow);

      function setEditing(on){
        editing = on;
        resultBox.classList.toggle('editing', on);
        editBtn.innerHTML = on ? '\u2713 Xong' : '\u270F\uFE0F Ch\u1ec9nh s\u1eeda';
      }

      editBtn.addEventListener('click', ()=>setEditing(!editing));

      confirmBtn.addEventListener('click', ()=>{
        const now = new Date();
        for(const t of parsedTasks){
          state.tasks.push({
            id: HF.uid('ai'),
            title: t.title,
            cat: t.cat,
            due: t.due,
            time: t.time,
            owner: t.owner,
            planner: t.mental ? (t.planner||'me') : null,
            mental: t.mental,
            shared: !!t.shared,
            status: 'open',
            pts: t.pts || 1,
            src: 'brain',
            createdAt: now
          });
        }
        state.dumpCount = (state.dumpCount||0)+1;
        state.lastDump = {text: ta.value.trim(), at: now.toISOString(), count: parsedTasks.length};
        HF.saveState(state);
        showSuccess(parsedTasks.length);
      });
    }

    function showSuccess(count){
      const ov = el('div',{class:'success-overlay'},[
        el('div',{class:'success-check',html:'<svg viewBox="0 0 64 64" width="86" height="86"><circle cx="32" cy="32" r="29" fill="none" stroke="#7FA98B" stroke-width="4"/><path d="M19 33 L28 42 L46 23" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>'}),
        el('div',{class:'success-t'},['\u0110\u00e3 th\u00eam '+count+' vi\u1ec7c v\u00e0o HomeFlow']),
        el('div',{class:'success-s'},['HomeFlow s\u1ebd nh\u1eafc c\u1ea3 nh\u00e0 \u0111\u00fang l\u00fac \u2014 gi\u1edd th\u00ec nh\u1eb9 \u0111\u1ea7u h\u01a1n r\u1ed3i \u2728'])
      ]);
      document.body.appendChild(ov);
      requestAnimationFrame(()=>ov.classList.add('show'));
      HF.confetti();
      setTimeout(()=>{
        ov.classList.add('hide');
        setTimeout(()=>ov.remove(), 450);
        nav('today');
      }, 1500);
    }

    return screen;
  };

  V.Balance = function(state, nav){
    let load = HF.computeLoad(state.tasks);
    const imb = HF.findImbalance(load);
    const sug = HF.suggestRebalance(state);
    const insight = HF.balanceInsight(load);

    const screen = [
      el('div',{},[
        el('div',{class:'eyebrow'},['Cân bằng gia đình']),
        el('h1',{class:'page-title',style:'margin-top:4px'},['C\u00e2n b\u1eb1ng']),
        el('div',{class:'sub'},['M\u1ed7i ng\u01b0\u1eddi \u0111\u00f3ng g\u00f3p theo c\u00e1ch ri\u00eang \u2014 c\u1ea3 vi\u1ec7c nh\u1edb l\u1eabn vi\u1ec7c l\u00e0m'])
      ])
    ];

    const vizWrap = el('div',{class:'viz-wrap'},[
      el('div',{class:'viz-badge'},['TR\u01af\u1edaC \u2192 SAU'])
    ]);
    const viz = el('div',{class:'mb-grid'});
    vizWrap.appendChild(viz);
    const barRefs = {};

    function buildViz(loadData){
      viz.innerHTML='';
      const maxP = Math.max(...HF.MEMBERS.map(m=>loadData[m.id].planning),1);
      const maxE = Math.max(...HF.MEMBERS.map(m=>loadData[m.id].doing),1);
      HF.MEMBERS.forEach(m=>{
        const l = loadData[m.id];
        const planBar = el('span',{class:'mb-bar',style:`width:${Math.round(l.planning/maxP*100)}%;background:#D99A2B`});
        const execBar = el('span',{class:'mb-bar',style:`width:${Math.round(l.doing/maxE*100)}%;background:${m.color}`});
        const planNum = el('span',{class:'mb-num'},[String(l.planningCount)]);
        const execNum = el('span',{class:'mb-num'},[String(l.doingCount)]);
        const share = el('span',{class:'mb-share'},[l.share+'%']);
        const card = el('div',{class:'mb-card'},[
          el('div',{class:'mb-head'},[
            HF.avatar(m.id,'sm'),
            el('span',{class:'mb-name'},[m.name]),
            share
          ]),
          el('div',{class:'mb-load'},[
            el('span',{class:'mb-lab'},['\u{1F9E0} L\u1eadp k\u1ebf ho\u1ea1ch']),
            el('div',{class:'mb-track'},[planBar]),
            planNum
          ]),
          el('div',{class:'mb-load'},[
            el('span',{class:'mb-lab'},['\u25CF Th\u1ef1c hi\u1ec7n']),
            el('div',{class:'mb-track'},[execBar]),
            execNum
          ])
        ]);
        barRefs[m.id] = {planBar, execBar, planNum, execNum, share};
        viz.appendChild(card);
      });
    }
    buildViz(load);
    screen.push(vizWrap);

    function animateViz(loadData){
      vizWrap.classList.add('animating');
      const maxP = Math.max(...HF.MEMBERS.map(m=>loadData[m.id].planning),1);
      const maxE = Math.max(...HF.MEMBERS.map(m=>loadData[m.id].doing),1);
      HF.MEMBERS.forEach(m=>{
        const l = loadData[m.id];
        const ref = barRefs[m.id];
        ref.planBar.style.width = Math.round(l.planning/maxP*100)+'%';
        ref.execBar.style.width = Math.round(l.doing/maxE*100)+'%';
        ref.planNum.textContent = l.planningCount;
        ref.execNum.textContent = l.doingCount;
        ref.share.textContent = l.share+'%';
      });
      setTimeout(()=>vizWrap.classList.remove('animating'), 1500);
    }

    const insightCard = el('div',{class:'card insight-card'},[
      el('div',{class:'insight-row'},[
        el('span',{style:'font-size:17px;flex:none'},['\u{1F4A1}']),
        el('div',{style:'font-size:13.5px;font-weight:600;line-height:1.5'},[insight.insight])
      ]),
      insight.suggest ? el('div',{class:'insight-suggest'},[
        el('div',{class:'insight-suggest-label'},['\u{1F49C} HomeFlow g\u1ee3i \u00fd']),
        el('div',{class:'insight-suggest-text'},['\u201C'+insight.suggest+'\u201D'])
      ]) : null
    ]);
    screen.push(insightCard);

    const sampleTask = {title:'Kh\u00e1m b\u1ec7nh cho con', cat:'health', owner:'bo', planner:'me'};
    const mentalCard = el('div',{class:'card',style:'background:linear-gradient(135deg,#FCF3D8,#FBE9E0)'},[
      el('div',{style:'display:flex;gap:12px;align-items:flex-start'},[
        el('span',{style:'font-size:26px'},['\u{1F9E0}']),
        el('div',{style:'flex:1'},[
          el('div',{style:'font-weight:800;font-size:14.5px'},['Mental Load \u2014 ph\u1ea7n vi\u1ec7c v\u00f4 h\u00ecnh']),
          el('div',{class:'sub',style:'font-size:12px;margin-top:2px'},['C\u00f9ng m\u1ed9t vi\u1ec7c, hai c\u00e1ch \u0111\u00f3ng g\u00f3p:'])
        ])
      ]),
      el('div',{style:'font-weight:700;font-size:13.5px;margin:12px 0 10px;color:var(--ink)'},['\u201CKh\u00e1m b\u1ec7nh cho con\u201D']),
      HF.contrib(sampleTask, {execItems:['\u0110\u01b0a con \u0111i kh\u00e1m']}),
      el('div',{class:'sub',style:'font-size:12px;margin-top:12px;line-height:1.55'},[
        'Ng\u01b0\u1eddi lo ghi nh\u1eadn 4 vi\u1ec7c v\u00f4 h\u00ecnh \u0111\u1ec3 ng\u01b0\u1eddi l\u00e0m ho\u00e0n th\u00e0nh 1 vi\u1ec7c h\u1eefu h\u00ecnh \u2014 HomeFlow ghi nh\u1eadn c\u1ea3 hai.'
      ]),
      el('div',{style:'margin-top:10px;padding-top:10px;border-top:1px dashed rgba(138,106,16,.25);font-size:12px;font-weight:600;color:#8A6A10'},[
        'Tu\u1ea7n n\u00e0y c\u00f3 '+HF.MEMBERS.map(m=>load[m.id].planningCount).reduce((a,b)=>a+b,0)+' vi\u1ec7c l\u1eadp k\u1ebf ho\u1ea1ch \u0111\u01b0\u1ee3c ghi nh\u1eadn.'
      ])
    ]);
    screen.push(mentalCard);

    let approved = 0;
    const total = sug.suggestions.length;

    if(imb && total>0){
      const rb = el('div',{class:'card rebalance-card'},[
        el('div',{class:'section-label'},[el('span',{class:'bar'}),'Smart Rebalance']),
        el('div',{class:'sub',style:'font-size:12.5px;margin-top:2px'},['Nh\u1eefng c\u01a1 h\u1ed9i nh\u1ecf \u0111\u1ec3 c\u1ea3 nh\u00e0 chia s\u1ebb vi\u1ec7c nh\u1eb9 nh\u00e0ng h\u01a1n:']),
        ...sug.suggestions.map(s=>{
          const row = el('div',{class:'sug-row'},[
            el('div',{class:'sug-main'},[
              el('div',{class:'sug-to'},[
                HF.avatar(s.to.id,'sm'),
                el('span',{class:'sug-to-name'},[s.to.name])
              ]),
              el('div',{class:'sug-task'},['\u2192 '+s.task.title]),
              el('div',{class:'sug-reason'},[s.reason])
            ]),
            el('div',{class:'sug-actions'},[
              el('button',{class:'sug-btn sug-switch'},['\u2194 \u0110\u1ed5i ng\u01b0\u1eddi']),
              el('button',{class:'sug-btn sug-ok'},['\u2713 \u0110\u1ed3ng \u00fd'])
            ])
          ]);
          const toAvatar = row.querySelector('.sug-to .avatar');
          const toName = row.querySelector('.sug-to-name');
          const reasonEl = row.querySelector('.sug-reason');
          const okBtn = row.querySelector('.sug-ok');
          const swBtn = row.querySelector('.sug-switch');

          function refreshPerson(){
            const nm = HF.memberById(s.to.id);
            toAvatar.style.background = nm.color;
            toAvatar.textContent = nm.short;
            toName.textContent = nm.name;
            reasonEl.textContent = HF.buildReason(s.task, s.from, s.to);
          }

          swBtn.addEventListener('click', ()=>{
            if(row.classList.contains('done')) return;
            const idx = s.candidates.indexOf(s.to);
            s.to = s.candidates[(idx+1) % s.candidates.length];
            refreshPerson();
          });

          if(s.candidates.length < 2){
            swBtn.style.display = 'none';
          }

          okBtn.addEventListener('click', ()=>{
            if(row.classList.contains('done')) return;
            HF.applyRebalance(state, s);
            state.rebalanced = true;
            row.classList.add('done');
            okBtn.textContent = '\u2713 \u0110\u00e3 \u0111\u1ed3ng \u00fd';
            approved++;
            load = HF.computeLoad(state.tasks);
            viz.scrollIntoView({behavior:'smooth', block:'center'});
            setTimeout(()=>animateViz(load), 350);
            if(approved >= total){
              HF.confetti();
              HF.toast('C\u1ea3 nh\u00e0 \u0111\u00e3 chia s\u1ebb vi\u1ec7c \u0111\u1ec1u h\u01a1n r\u1ed3i!','\u{1F49C}');
              const done = el('div',{class:'banner success',style:'margin-top:14px'},[
                '\u2728',
                el('div',{},['Tuy\u1ec7t v\u1eddi! Tu\u1ea7n t\u1edbi s\u1ebd nh\u1eb9 nh\u00e0ng h\u01a1n v\u00ec c\u1ea3 nh\u00e0 c\u00f9ng chia s\u1ebb.'])
              ]);
              rb.appendChild(done);
            }
          });
          return row;
        })
      ]);
      screen.push(rb);
    }else{
      screen.push(el('div',{class:'card',style:'background:linear-gradient(135deg,#E8F1EA,#FCF3D8)',onclick:()=>nav('brief')},[
        el('div',{style:'display:flex;gap:12px;align-items:center'},[
          el('span',{style:'font-size:28px'},['\u{1F31F}']),
          el('div',{style:'flex:1'},[
            el('div',{style:'font-weight:800;font-size:14.5px'},['C\u1ea3 nh\u00e0 \u0111ang c\u00e2n b\u1eb1ng r\u1ea5t t\u1ed1t!']),
            el('div',{class:'sub',style:'font-size:12px'},['Ti\u1ebfp t\u1ee5c duy tr\u00ec nh\u00e9. Xem b\u1ea3n tin tu\u1ea7n \u2192'])
          ])
        ])
      ]));
    }

    return screen;
  };

  V.Brief = function(state, nav){
    const brief = HF.buildBrief(state);
    const load = HF.computeLoad(state.tasks);
    const imb = HF.findImbalance(load);

    const screen = [
      el('div',{},[
        el('div',{class:'eyebrow'},['Bản tin gia đình']),
        el('h1',{class:'page-title',style:'margin-top:4px'},['\u{1F49C} Tu\u1ea7n n\u00e0y c\u1ee7a gia \u0111\u00ecnh']),
        el('div',{class:'sub'},['Tu\u1ea7n '+brief.weekLabel+' \u2014 m\u1ed9t nh\u1ecbp th\u1edf b\u00ecnh y\u00ean'])
      ])
    ];

    const doneList = brief.doneThisWeek.slice(0,4);
    screen.push(el('div',{class:'card brief-card'},[
      el('div',{class:'brief-label brief-done'},['\u2713 \u0110\u00c3 HO\u00c0N TH\u00c0NH']),
      doneList.length===0
        ? el('div',{class:'brief-empty'},['Tu\u1ea7n n\u00e0y ch\u01b0a c\u00f3 vi\u1ec7c n\u00e0o xong \u2014 kh\u00f4ng sao, c\u00f9ng nhau b\u1eaft \u0111\u1ea7u nh\u00e9'])
        : doneList.map(t=>el('div',{class:'brief-item brief-done-item'},[
            el('span',{class:'brief-mark'},['\u2713']),
            el('span',{class:'brief-text'},[t.title])
          ])),
      doneList.length < brief.doneCount
        ? el('div',{class:'brief-more'},['v\u00e0 '+ (brief.doneCount-doneList.length) +' vi\u1ec7c n\u1eefa \u0111\u00e3 xong \u2728'])
        : null
    ]));

    const openList = state.tasks.filter(t=>t.status==='open').sort((a,b)=>a.due-b.due).slice(0,4);
    screen.push(el('div',{class:'card brief-card'},[
      el('div',{class:'brief-label brief-open'},['\u2022 C\u00d2N L\u1ea0I']),
      openList.length===0
        ? el('div',{class:'brief-empty'},['Kh\u00f4ng c\u00f2n vi\u1ec7c n\u00e0o \u2014 t\u1eadn h\u01b0\u1edfng th\u00f4i!'])
        : openList.map(t=>el('div',{class:'brief-item'},[
            el('span',{class:'brief-mark'},['\u2022']),
            el('span',{class:'brief-text'},[t.title])
          ])),
      openList.length < brief.openCount
        ? el('div',{class:'brief-more'},['c\u00f2n '+ (brief.openCount-openList.length) +' vi\u1ec7c n\u1eefa \u0111ang ch\u1edd'])
        : null
    ]));

    const nextList = brief.nextWeek.slice(0,3);
    screen.push(el('div',{class:'card brief-card'},[
      el('div',{class:'brief-label brief-next'},['\u{1F5D3}\uFE0F TU\u1ea6N T\u1edaI C\u1ea6N NH\u1eda']),
      nextList.length===0
        ? el('div',{class:'brief-empty'},['Tu\u1ea7n t\u1edbi r\u1ea3nh rang \u2014 c\u00f3 th\u1ec3 l\u00ean k\u1ebf ho\u1ea1ch vui ch\u01a1i!'])
        : nextList.map(t=>el('div',{class:'brief-item'},[
            el('span',{class:'brief-mark'},['\u2022']),
            el('span',{class:'brief-text'},[t.title]),
            el('span',{class:'brief-when'},[HF.formatDay(t.due)])
          ]))
    ]));

    const balLine = (imb && !state.rebalanced)
      ? 'Tu\u1ea7n n\u00e0y, ph\u1ea7n l\u1edbn vi\u1ec7c nh\u1edb v\u00e0 l\u00ean k\u1ebf ho\u1ea1ch v\u1eabn do '+imb.max.member.name+' g\u00e1nh \u2014 c\u1ea3 nh\u00e0 c\u00f9ng chia s\u1ebb th\u00eam nh\u00e9 \u{1F49C}'
      : 'Tu\u1ea7n n\u00e0y c\u1ea3 nh\u00e0 \u0111\u00e3 chia s\u1ebb tr\u00e1ch nhi\u1ec7m \u0111\u1ec1u h\u01a1n \u{1F49C}';
    screen.push(el('div',{class:'card bal-summary'},[
      el('span',{class:'bal-summary-ico'},['\u2696\uFE0F']),
      el('div',{class:'bal-summary-text'},[balLine])
    ]));

    screen.push(el('div',{class:'manifesto'},[
      el('div',{class:'manifesto-tag'},[
        el('div',{},['Less to remember.']),
        el('div',{},['More time to live.'])
      ]),
      el('div',{class:'manifesto-line'}),
      el('div',{class:'manifesto-msg'},[
        el('div',{},['HomeFlow kh\u00f4ng gi\u00fap ph\u1ee5 n\u1eef l\u00e0m \u0111\u01b0\u1ee3c nhi\u1ec1u vi\u1ec7c h\u01a1n.']),
        el('div',{},['HomeFlow gi\u00fap ph\u1ee5 n\u1eef kh\u00f4ng ph\u1ea3i m\u1ed9t m\u00ecnh nh\u1edb v\u00e0 g\u00e1nh m\u1ecdi vi\u1ec7c.'])
      ]),
      el('div',{class:'manifesto-heart'},[el('span',{},['\u{1F49C}'])])
    ]));

    const footer = el('div',{class:'footer-note'},[
      el('div',{style:'margin-top:4px'},['\u{1F49C} HomeFlow'])
    ]);
    screen.push(footer);

    return screen;
  };

V.Settings = function(state, nav, params){
    params = params||{};
    const path = params.path||[];
    const root = el('div',{});
    const confirmIds = new Set();
    let taskLimit = 8;
    let profileTab = 'overview';

    function field(label, control){
      return el('div',{class:'rs-field'},[el('span',{},[label]), control]);
    }

    function ageFrom(dob){
      if(!dob) return '';
      const d = new Date(dob);
      const now = new Date();
      let age = now.getFullYear()-d.getFullYear();
      if(now.getMonth()<d.getMonth() || (now.getMonth()===d.getMonth() && now.getDate()<d.getDate())) age--;
      return age>=0 ? age+' tu\u1ed5i' : '';
    }

    function fmtDate(iso){
      if(!iso) return '';
      const d = new Date(iso);
      return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
    }

    function backRow(label, target, targetParams){
      return el('div',{class:'back-row',onclick:()=>nav(target, targetParams)},[
        el('span',{class:'back-chev'},['\u2039']),
        el('span',{},[label])
      ]);
    }

    function placeholderToast(){
      HF.toast('S\u1eafp ra m\u1eaft trong b\u1ea3n c\u1eadp nh\u1eadt t\u1edbi \u2728','\u{1F4A1}');
    }

    // ---------------- Landing ----------------
    function menuRow(ico, label, sub, onClick){
      return el('div',{class:'set-row',onclick:onClick},[
        el('span',{class:'set-ico'},[ico]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'set-row-t'},[label]),
          sub ? el('div',{class:'set-row-s'},[sub]) : null
        ]),
        el('span',{class:'set-chev'},['\u203A'])
      ]);
    }

    function buildLanding(){
      const s = [];
      s.push(el('div',{class:'eyebrow'},['C\u00e0i \u0111\u1eb7t']));
      s.push(el('h1',{class:'page-title',style:'margin-top:4px'},['C\u00e0i \u0111\u1eb7t']));
      s.push(el('div',{class:'sub'},['Qu\u1ea3n l\u00fd gia \u0111\u00ecnh v\u00e0 \u1ee9ng d\u1ee5ng']));

      s.push(el('div',{class:'card compact set-menu'},[
        menuRow('\u{1F4CB}','Vi\u1ec7c nh\u00e0','Ch\u1ec9nh s\u1eeda, x\u00f3a vi\u1ec7c', ()=>nav('settings',{path:['tasks']})),
        menuRow('\u{1F46B}','Gia \u0111\u00ecnh & Th\u00e0nh vi\u00ean','T\u00ean gia \u0111\u00ecnh, th\u00e0nh vi\u00ean, h\u1ed3 s\u01a1 con', ()=>nav('settings',{path:['family']})),
        menuRow('\u{1F514}','Nh\u1eafc vi\u1ec7c','Th\u1eddi gian v\u00e0 c\u00e1ch nh\u1eafc nh\u1edf', placeholderToast),
        menuRow('\u{1F5D3}\uFE0F','L\u1ecbch & Hi\u1ec3n th\u1ecb','Ng\u00f4n ng\u1eef, giao di\u1ec7n', placeholderToast),
        menuRow('\u{1F4B0}','Chi ph\u00ed','Theo d\u00f5i chi ti\u00eau gia \u0111\u00ecnh', placeholderToast),
        menuRow('\u2753','Tr\u1ee3 gi\u00fap & Ph\u1ea3n h\u1ed3i','H\u01b0\u1edbng d\u1eabn, c\u00e2u h\u1ecfi, g\u1eedi \u00fd ki\u1ebfn', ()=>nav('settings',{path:['help']})),
        menuRow('\u{1F510}','D\u1eef li\u1ec7u & Quy\u1ec1n ri\u00eang t\u01b0','Xu\u1ea5t d\u1eef li\u1ec7u, b\u1ea3o m\u1eadt', ()=>nav('settings',{path:['data']}))
      ]));

      s.push(el('div',{class:'footer-note'},['\u{1F49C} HomeFlow']));
      return s;
    }

    // ---------------- Task management (preserved) ----------------
    function taskRow(t){
      const cat = HF.categoryById(t.cat);
      const d = new Date(t.due);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      return el('div',{class:'mgmt-row'},[
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'mgmt-title'},[t.title]),
          el('div',{style:'display:flex;gap:6px;margin-top:4px;flex-wrap:wrap'},[
            el('span',{class:'chip',style:`background:${cat.soft};color:${cat.color}`},[cat.emoji+' '+cat.label]),
            el('span',{class:'chip ghost',style:'white-space:nowrap'},['\u{1F5D3}\uFE0F '+dd+'/'+mm+(t.time?' \u00b7 '+t.time:'')])
          ])
        ]),
        el('button',{class:'icon-btn',style:'color:var(--primary-deep)',onclick:()=>openEditSheet(t)},['\u270F\uFE0F']),
        el('button',{class:'icon-btn',style:'color:var(--danger)',onclick:()=>confirmDeleteTask(t)},['\u{1F5D1}\uFE0F'])
      ]);
    }

    function confirmDeleteTask(t){
      if(confirmIds.has(t.id)){
        confirmIds.delete(t.id);
        HF.deleteTask(state, t.id);
        HF.toast('\u0110\u00e3 x\u00f3a \u201c'+t.title+'\u201d','\u{1F5D1}\uFE0F');
        rerender();
      }else{
        confirmIds.add(t.id);
        HF.toast('B\u1ea5m l\u1ea7n n\u1eefa \u0111\u1ec3 x\u00e1c nh\u1eadn x\u00f3a','\u26A0\uFE0F');
        setTimeout(()=>confirmIds.delete(t.id), 3500);
      }
    }

    function openEditSheet(t){
      const draft = Object.assign({}, t);
      const title = el('input',{class:'input',value:draft.title});
      const dateSel = HF.dateSelect(draft.due, v=>{draft.due=v;});
      const time = el('input',{class:'input',type:'time',value:draft.time||'',style:'padding:10px 12px'});
      const catSel = el('select',{class:'input'});
      Object.keys(HF.CATEGORIES).forEach(k=>catSel.appendChild(el('option',{value:k},[HF.CATEGORIES[k].emoji+' '+HF.CATEGORIES[k].label])));
      catSel.value = draft.cat;
      const plannerSel = HF.ownerSelect(draft.planner||'me', v=>{draft.planner=v;});
      const doerSel = el('select',{class:'input'});
      doerSel.appendChild(el('option',{value:'__shared__'},['\u{1F46B} C\u1ea3 nh\u00e0']));
      HF.MEMBERS.forEach(m=>doerSel.appendChild(el('option',{value:m.id},[m.emoji+' '+m.name])));
      doerSel.value = draft.shared ? '__shared__' : draft.owner;

      const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
        field('Ti\u00eau \u0111\u1ec1', title),
        el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
          field('Ng\u00e0y', dateSel),
          field('Gi\u1edd (t\u00f9y ch\u1ecdn)', time)
        ]),
        field('Danh m\u1ee5c', catSel),
        el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
          field('\u{1F9E0} Ai lo', plannerSel),
          field('\u25CF Ai l\u00e0m', doerSel)
        ]),
        el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
          el('button',{class:'btn btn-danger',style:'flex:0.8;padding:13px 10px;font-size:13.5px'},['\u{1F5D1}\uFE0F X\u00f3a']),
          el('button',{class:'btn btn-primary',style:'flex:1.6;padding:13px 10px;font-size:13.5px'},['\u{1F4BE} L\u01b0u thay \u0111\u1ed5i'])
        ])
      ]);

      const sheet = HF.sheet({title:'Ch\u1ec9nh s\u1eeda vi\u1ec7c', body:()=>body});

      const delBtn = body.querySelector('.btn-danger');
      delBtn.addEventListener('click', ()=>{
        if(delBtn.dataset.confirm){
          HF.deleteTask(state, draft.id);
          HF.toast('\u0110\u00e3 x\u00f3a vi\u1ec7c','\u{1F5D1}\uFE0F');
          sheet.close();
          rerender();
        }else{
          delBtn.dataset.confirm='1';
          delBtn.textContent='\u26A0\uFE0F Ch\u1eafc ch\u1eafn x\u00f3a?';
          setTimeout(()=>{ delete delBtn.dataset.confirm; delBtn.textContent='\u{1F5D1}\uFE0F X\u00f3a'; }, 3000);
        }
      });

      const saveBtn = body.querySelector('.btn-primary');
      saveBtn.addEventListener('click', ()=>{
        const nt = title.value.trim();
        if(!nt){ HF.toast('Nh\u1eadp t\u00ean vi\u1ec7c tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        HF.updateTask(state, draft.id, {
          title: nt,
          cat: catSel.value,
          due: draft.due,
          time: time.value||'',
          planner: draft.planner,
          owner: doerSel.value==='__shared__' ? draft.owner : doerSel.value,
          shared: doerSel.value==='__shared__'
        });
        HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt vi\u1ec7c','\u270F\uFE0F');
        sheet.close();
        rerender();
      });
    }

    function buildTasks(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['Vi\u1ec7c nh\u00e0']));
      s.push(el('div',{class:'sub'},['Ch\u1ec9nh s\u1eeda ho\u1eb7c x\u00f3a vi\u1ec7c \u0111ang m\u1edf']));
      const openTasks = state.tasks.filter(t=>t.status!=='done').sort((a,b)=>a.due-b.due);
      const visible = taskLimit>=openTasks.length ? openTasks : openTasks.slice(0,taskLimit);
      const listCard = el('div',{class:'card compact'}, openTasks.length===0
        ? [el('div',{style:'color:var(--muted);font-size:13px'},['Kh\u00f4ng c\u00f3 vi\u1ec7c n\u00e0o \u0111ang m\u1edf'])]
        : visible.map(taskRow));
      if(openTasks.length>taskLimit){
        listCard.appendChild(el('button',{class:'btn btn-ghost',style:'width:100%;margin-top:10px;padding:11px;font-size:13px',onclick:()=>{taskLimit=999; rerender();}},[
          'Xem t\u1ea5t c\u1ea3 '+openTasks.length+' vi\u1ec7c \u25BE'
        ]));
      }
      s.push(listCard);
      return s;
    }

    // ---------------- Family & Members ----------------
    function memberRow(m){
      const canRemove = HF.MEMBERS.length>1;
      const isKid = m.kind==='kid';
      return el('div',{class:'mgmt-row set-member',onclick:()=>{
        if(isKid) nav('settings',{path:['family', m.id]});
        else openMemberSheet(m);
      }},[
        el('span',{class:'avatar',style:`background:${m.color}`},[m.emoji]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'mgmt-title'},[m.name]),
          el('div',{class:'kind-tag'},[(m.role||(m.kind==='kid'?'Con':'Kh\u00e1c'))+(m.dob?' \u00b7 '+ageFrom(m.dob):'')])
        ]),
        el('button',{class:'icon-btn',style:'color:var(--primary-deep)',onclick:(e)=>{e.stopPropagation(); openMemberSheet(m);}},[
          '\u270F\uFE0F'
        ]),
        canRemove ? el('button',{class:'icon-btn',style:'color:var(--danger)',onclick:(e)=>{e.stopPropagation(); confirmRemoveMember(m);}},[
          '\u{1F5D1}\uFE0F'
        ]) : null
      ]);
    }

    function confirmRemoveMember(m){
      if(confirmIds.has('m'+m.id)){
        confirmIds.delete('m'+m.id);
        HF.removeMember(m.id, state);
        HF.toast('\u0110\u00e3 x\u00f3a '+m.name,'\u{1F5D1}\uFE0F');
        rerender();
      }else{
        confirmIds.add('m'+m.id);
        HF.toast('B\u1ea5m l\u1ea7n n\u1eefa \u0111\u1ec3 x\u00f3a '+m.name+' \u2014 vi\u1ec7c c\u1ee7a '+m.name+' s\u1ebd chuy\u1ec3n cho M\u1eb9','\u26A0\uFE0F');
        setTimeout(()=>confirmIds.delete('m'+m.id), 4000);
      }
    }

    function openMemberSheet(member){
      const isEdit = !!member;
      const m = member ? Object.assign({}, member) : {name:'', role:'Kh\u00e1c', dob:'', gender:'', emoji:''};
      const AVATARS = ['\u{1F469}','\u{1F468}','\u{1F9D2}','\u{1F467}','\u{1F466}','\u{1F475}','\u{1F474}','\u{1F476}'];

      const name = el('input',{class:'input',value:m.name,placeholder:'H\u1ecd v\u00e0 t\u00ean'});
      const dob = el('input',{class:'input',type:'date',value:m.dob||''});
      const role = el('select',{class:'input'});
      HF.ROLES.forEach(r=>role.appendChild(el('option',{value:r},[r])));
      role.value = m.role||'Kh\u00e1c';
      const gender = el('select',{class:'input'});
      gender.appendChild(el('option',{value:''},['\u2014']));
      ['Nam','N\u1eef'].forEach(g=>gender.appendChild(el('option',{value:g},[g])));
      gender.value = m.gender||'';

      const emojiBtns = AVATARS.map(em=>{
        const b = el('button',{class:'ava-pick'+(em===m.emoji?' on':''),onclick:()=>{
          m.emoji=em;
          emojiBtns.forEach(x=>x.classList.remove('on'));
          b.classList.add('on');
        }},[em]);
        return b;
      });

      const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
        field('\u{1F464} \u1ea2nh \u0111\u1ea1i di\u1ec7n', el('div',{class:'ava-row'},emojiBtns)),
        field('H\u1ecd v\u00e0 t\u00ean', name),
        el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
          field('Ng\u00e0y sinh', dob),
          field('Gi\u1edbi t\u00ednh', gender)
        ]),
        field('Vai tr\u00f2 trong gia \u0111\u00ecnh', role),
        el('div',{style:'font-size:11.5px;color:var(--muted);line-height:1.5'},[
          isEdit ? 'Thay \u0111\u1ed5i t\u00ean s\u1ebd c\u1eadp nh\u1eadt \u1edf m\u1ecdi n\u01a1i trong HomeFlow.' : ''
        ]),
        el('button',{class:'btn btn-primary'},[isEdit?'\u{1F4BE} L\u01b0u thay \u0111\u1ed5i':'+ Th\u00eam th\u00e0nh vi\u00ean'])
      ]);

      const sheet = HF.sheet({title:isEdit?'Ch\u1ec9nh s\u1eeda th\u00e0nh vi\u00ean':'Th\u00eam th\u00e0nh vi\u00ean', body:()=>body});

      body.querySelector('.btn-primary').addEventListener('click', ()=>{
        const n = name.value.trim();
        if(!n){ HF.toast('Nh\u1eadp h\u1ecd t\u00ean tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        if(!isEdit && HF.MEMBERS.some(x=>x.name===n)){ HF.toast('\u0110\u00e3 c\u00f3 th\u00e0nh vi\u00ean t\u00ean n\u00e0y','\u{1F60A}'); return; }
        const profile = {
          name:n, role:role.value, dob:dob.value||'', gender:gender.value||'',
          emoji:m.emoji||AVATARS[0], kind:role.value==='Con'?'kid':'adult'
        };
        if(isEdit){
          HF.updateMember(m.id, profile, state);
          HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt '+n,'\u270F\uFE0F');
        }else{
          HF.addMember(profile);
          HF.saveState(state);
          HF.toast('\u0110\u00e3 th\u00eam '+n,'\u{1F389}');
        }
        sheet.close();
        rerender();
      });
    }

    function buildFamily(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['Gia \u0111\u00ecnh & Th\u00e0nh vi\u00ean']));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Gia \u0111\u00ecnh c\u1ee7a t\u00f4i']));
      const famName = el('input',{class:'input',value:state.family.name||'',style:'flex:1;min-width:0'});
      const FAM_AVATARS = ['\u{1F3E1}','\u{1F3E0}','\u{1F3E2}','\u{1F3E8}','\u{1F3EC}','\u{1F46B}','\u{1F469}\u200D\u{1F468}\u200D\u{1F467}','\u2764\uFE0F'];
      const famAvatar = el('span',{class:'fam-avatar'},[state.family.avatar||'\u{1F3E1}']);
      const famPicker = el('div',{class:'ava-row fam-picker',style:'display:none'}, FAM_AVATARS.map(em=>{
        const b = el('button',{class:'ava-pick'+(em===(state.family.avatar||'\u{1F3E1}')?' on':''),onclick:()=>{
          state.family.avatar = em;
          famAvatar.textContent = em;
          famPicker.querySelectorAll('.ava-pick').forEach(x=>x.classList.remove('on'));
          b.classList.add('on');
          HF.saveState(state);
        }},[em]);
        return b;
      }));
      famAvatar.addEventListener('click', ()=>{
        famPicker.style.display = famPicker.style.display==='none' ? 'flex' : 'none';
      });
      const famCard = el('div',{class:'card compact'},[
        el('div',{style:'display:flex;gap:12px;align-items:center'},[
          famAvatar,
          el('div',{style:'flex:1;min-width:0'},[
            famName,
            el('div',{style:'font-size:11px;color:var(--muted);margin-top:5px'},[HF.MEMBERS.length+' th\u00e0nh vi\u00ean'])
          ]),
          el('button',{class:'btn btn-soft',style:'padding:9px 14px;font-size:12.5px'},['L\u01b0u'])
        ]),
        famPicker
      ]);
      famCard.querySelector('.btn-soft').addEventListener('click', ()=>{
        const n = famName.value.trim();
        if(!n){ HF.toast('Nh\u1eadp t\u00ean gia \u0111\u00ecnh tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        state.family.name = n;
        HF.saveState(state);
        HF.toast('\u0110\u00e3 l\u01b0u t\u00ean gia \u0111\u00ecnh','\u2705');
      });
      s.push(famCard);

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Th\u00e0nh vi\u00ean']));
      s.push(el('div',{class:'card compact'},[
        ...HF.MEMBERS.map(memberRow),
        el('button',{class:'btn btn-soft',style:'width:100%;margin-top:10px;padding:12px;font-size:13.5px',onclick:()=>openMemberSheet(null)},[
          '+ Th\u00eam th\u00e0nh vi\u00ean'
        ])
      ]));
      return s;
    }

    // ---------------- Child profile ----------------
    function historyBlock(kid, type, label, ico){
      const recs = state.history[type].filter(r=>r.kidId===kid.id).sort((a,b)=>new Date(b.date)-new Date(a.date));

      function histRow(r){
        return el('div',{class:'hist-row'},[
          el('div',{class:'hist-date'},[HF.formatDay(new Date(r.date))]),
          el('div',{style:'flex:1;min-width:0'},[
            el('div',{class:'hist-title'},[r.title]),
            r.note ? el('div',{class:'hist-note'},[r.note]) : null
          ]),
          el('button',{class:'icon-btn',style:'color:var(--danger)',onclick:()=>{
            HF.deleteHistory(state, type, r.id);
            rerender();
          }},['\u{1F5D1}\uFE0F'])
        ]);
      }

      const list = el('div',{class:'card compact hist-card'},[
        el('div',{class:'hist-head'},[
          el('div',{},[ico+' '+label]),
          el('button',{class:'btn btn-soft',style:'padding:7px 12px;font-size:12px'},['+ Th\u00eam'])
        ]),
        ...(recs.length===0 ? [el('div',{class:'hist-empty'},['Ch\u01b0a c\u00f3 ghi ch\u00fa n\u00e0o'])] : recs.map(histRow))
      ]);

      const form = el('div',{class:'hist-form',style:'display:none'},[
        el('input',{class:'input',type:'date',value:HF.dayOffset(0).toISOString().slice(0,10)}),
        el('input',{class:'input',placeholder:'N\u1ed9i dung (VD: Kh\u00e1m r\u0103ng \u0111\u1ecbnh k\u1ef3)'}),
        el('input',{class:'input',placeholder:'Ghi ch\u00fa (t\u00f9y ch\u1ecdn)'}),
        el('div',{style:'display:flex;gap:8px;margin-top:8px'},[
          el('button',{class:'btn btn-primary',style:'flex:1;padding:11px 10px;font-size:13px'},['L\u01b0u']),
          el('button',{class:'btn btn-ghost',style:'flex:0.6;padding:11px 10px;font-size:13px'},['H\u1ee7y'])
        ])
      ]);
      list.appendChild(form);

      list.querySelector('.hist-head .btn').addEventListener('click', ()=>{
        form.style.display = form.style.display==='none' ? 'block' : 'none';
      });
      form.querySelector('.btn-primary').addEventListener('click', ()=>{
        const inp = form.querySelectorAll('.input');
        const t = inp[1].value.trim();
        if(!t){ HF.toast('Nh\u1eadp n\u1ed9i dung tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        HF.addHistory(state, type, {
          kidId: kid.id,
          date: new Date(inp[0].value),
          title: t,
          note: inp[2].value.trim()
        });
        HF.toast('\u0110\u00e3 th\u00eam v\u00e0o l\u1ecbch s\u1eed','\u2705');
        rerender();
      });
      form.querySelector('.btn-ghost').addEventListener('click', ()=>{ form.style.display='none'; });

      return list;
    }

    // ---------------- Growth (Phát triển) ----------------
    let growthFilter = 'all';

    function fmtShort(iso){
      const d = new Date(iso);
      return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
    }

    function openGrowthSheet(kid, rec){
      const isEdit = !!rec;
      const date = el('input',{class:'input',type:'date',value:rec?String(rec.date).slice(0,10):HF.dayOffset(0).toISOString().slice(0,10)});
      const height = el('input',{class:'input',type:'number',inputmode:'decimal',step:'0.1',min:'0',placeholder:'VD: 128',value:rec?rec.height:''});
      const weight = el('input',{class:'input',type:'number',inputmode:'decimal',step:'0.1',min:'0',placeholder:'VD: 27.5',value:rec?rec.weight:''});
      const note = el('input',{class:'input',placeholder:'Ghi ch\u00fa (t\u00f9y ch\u1ecdn)',value:rec?(rec.note||''):''});

      const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
        field('Ng\u00e0y \u0111o', date),
        el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
          field('Chi\u1ec1u cao (cm)', height),
          field('C\u00e2n n\u1eb7ng (kg)', weight)
        ]),
        field('Ghi ch\u00fa', note),
        el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
          isEdit ? el('button',{class:'btn btn-danger',style:'flex:0.8;padding:13px 10px;font-size:13.5px'},['\u{1F5D1}\uFE0F X\u00f3a']) : null,
          el('button',{class:'btn btn-primary',style:'flex:1.6;padding:13px 10px;font-size:13.5px'},[isEdit?'\u{1F4BE} L\u01b0u thay \u0111\u1ed5i':'\u2795 L\u01b0u ch\u1ec9 s\u1ed1'])
        ])
      ]);

      const sheet = HF.sheet({title:isEdit?'Ch\u1ec9nh s\u1eeda ch\u1ec9 s\u1ed1':'Th\u00eam ch\u1ec9 s\u1ed1 ph\u00e1t tri\u1ec3n', body:()=>body});

      const delBtn = body.querySelector('.btn-danger');
      if(delBtn){
        delBtn.addEventListener('click', ()=>{
          if(delBtn.dataset.confirm){
            HF.deleteGrowth(state, rec.id);
            HF.toast('\u0110\u00e3 x\u00f3a ch\u1ec9 s\u1ed1','\u{1F5D1}\uFE0F');
            sheet.close();
            rerender();
          }else{
            delBtn.dataset.confirm='1';
            delBtn.textContent='\u26A0\uFE0F Ch\u1eafc ch\u1eafn x\u00f3a?';
            setTimeout(()=>{ delete delBtn.dataset.confirm; delBtn.textContent='\u{1F5D1}\uFE0F X\u00f3a'; }, 3000);
          }
        });
      }

      const saveBtn = body.querySelector('.btn-primary');
      saveBtn.addEventListener('click', ()=>{
        if(!date.value){ HF.toast('Ch\u1ecdn ng\u00e0y \u0111o tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        const h = parseFloat(height.value);
        const w = parseFloat(weight.value);
        if(isNaN(h)||h<=0){ HF.toast('Nh\u1eadp chi\u1ec1u cao h\u1ee3p l\u1ec7 (cm)','\u{1F914}'); return; }
        if(isNaN(w)||w<=0){ HF.toast('Nh\u1eadp c\u00e2n n\u1eb7ng h\u1ee3p l\u1ec7 (kg)','\u{1F914}'); return; }
        const data = {kidId:kid.id, date:new Date(date.value).toISOString(), height:h, weight:w, note:note.value.trim()};
        if(isEdit){
          HF.updateGrowth(state, rec.id, data);
          HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt ch\u1ec9 s\u1ed1','\u270F\uFE0F');
        }else{
          HF.addGrowth(state, data);
          HF.toast('\u0110\u00e3 th\u00eam ch\u1ec9 s\u1ed1','\u{1F4C8}');
        }
        sheet.close();
        rerender();
      });
    }

    function confirmDeleteGrowth(rec){
      if(confirmIds.has('g'+rec.id)){
        confirmIds.delete('g'+rec.id);
        HF.deleteGrowth(state, rec.id);
        HF.toast('\u0110\u00e3 x\u00f3a ch\u1ec9 s\u1ed1','\u{1F5D1}\uFE0F');
        rerender();
      }else{
        confirmIds.add('g'+rec.id);
        HF.toast('B\u1ea5m l\u1ea7n n\u1eefa \u0111\u1ec3 x\u00f3a ch\u1ec9 s\u1ed1 n\u00e0y','\u26A0\uFE0F');
        setTimeout(()=>confirmIds.delete('g'+rec.id), 3500);
      }
    }

    function trendChart(points, color, unit){
      if(points.length===0){
        return el('div',{class:'chart-empty'},['Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u trong kho\u1ea3ng n\u00e0y']);
      }
      const W=300,H=100,PAD_L=36,PAD_R=10,PAD_T=12,PAD_B=20;
      const pw=W-PAD_L-PAD_R, ph=H-PAD_T-PAD_B;
      const vals = points.map(p=>p.value);
      const min=Math.min(...vals), max=Math.max(...vals);
      const span=(max-min)||1;
      const pad=span*0.15;
      const yMin=min-pad, yMax=max+pad;
      const t0=new Date(points[0].date).getTime();
      const t1=new Date(points[points.length-1].date).getTime();
      const tSpan=(t1-t0)||1;
      const xy = points.map(p=>({
        x: PAD_L + ((new Date(p.date).getTime()-t0)/tSpan)*pw,
        y: PAD_T + (1-(p.value-yMin)/(yMax-yMin))*ph
      }));
      if(points.length===1){ xy[0].x = PAD_L + pw/2; }
      const line = xy.length===1
        ? (Math.round(xy[0].x-9)+','+Math.round(xy[0].y)+' '+(Math.round(xy[0].x+9))+','+Math.round(xy[0].y))
        : xy.map(pt=>Math.round(pt.x)+','+Math.round(pt.y)).join(' ');
      const dots = xy.map(pt=>'<circle cx="'+Math.round(pt.x)+'" cy="'+Math.round(pt.y)+'" r="3.5" fill="'+color+'"/>').join('');
      const sameVal = max===min;
      const svg = '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="xMidYMid meet">'+
        '<polyline points="'+line+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
        dots+
        '<text x="'+PAD_L+'" y="'+PAD_T+'" font-size="9" fill="#9A8590" font-weight="700">'+Math.round(max)+unit+'</text>'+
        (sameVal ? '' : '<text x="'+PAD_L+'" y="'+(H-PAD_B)+'" font-size="9" fill="#9A8590" font-weight="700">'+Math.round(min)+unit+'</text>')+
        '<text x="'+PAD_L+'" y="'+(H-4)+'" font-size="8.5" fill="#B3A3AC">'+fmtShort(points[0].date)+'</text>'+
        '<text x="'+(W-PAD_R)+'" y="'+(H-4)+'" font-size="8.5" fill="#B3A3AC" text-anchor="end">'+fmtShort(points[points.length-1].date)+'</text>'+
        '</svg>';
      return el('div',{class:'chart-svg',html:svg});
    }

    function chartBlock(title, points, color, unit){
      const FILTERS = [['6m','6 th\u00e1ng'],['1y','1 n\u0103m'],['all','T\u1ea5t c\u1ea3']];
      const cutoff = growthFilter==='6m' ? 180 : (growthFilter==='1y' ? 365 : null);
      const filtered = cutoff ? points.filter(p=>new Date(p.date).getTime() >= Date.now()-cutoff*86400000) : points;
      return el('div',{class:'card compact chart-card'},[
        el('div',{class:'chart-title'},[title]),
        el('div',{class:'chart-filters'}, FILTERS.map(([id,lbl])=>{
          return el('button',{class:'chip-f'+(growthFilter===id?' on':''),onclick:()=>{growthFilter=id; rerender();}},[lbl]);
        })),
        trendChart(filtered, color, unit)
      ]);
    }

    function growthTab(kid){
      const s = [];
      const recs = HF.growthFor(state, kid.id);
      const latest = recs.length ? recs[recs.length-1] : null;

      if(!latest){
        const emptyCard = el('div',{class:'card compact growth-empty'},[
          el('div',{style:'font-size:36px'},['\u{1F4C8}']),
          el('div',{class:'growth-empty-t'},['Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u ph\u00e1t tri\u1ec3n']),
          el('div',{class:'growth-empty-s'},['Th\u00eam chi\u1ec1u cao v\u00e0 c\u00e2n n\u1eb7ng \u0111\u1ec3 b\u1eaft \u0111\u1ea7u theo d\u00f5i qu\u00e1 tr\u00ecnh ph\u00e1t tri\u1ec3n.']),
          el('button',{class:'btn btn-primary',style:'margin-top:16px;width:100%'},['\u2795 Th\u00eam ch\u1ec9 s\u1ed1 \u0111\u1ea7u ti\u00ean'])
        ]);
        emptyCard.querySelector('.btn-primary').addEventListener('click', ()=>openGrowthSheet(kid, null));
        s.push(emptyCard);
        return s;
      }

      function metric(ico, val, lbl){
        return el('div',{class:'growth-metric'},[
          el('div',{class:'growth-metric-ico'},[ico]),
          el('div',{class:'growth-metric-val'},[val]),
          el('div',{class:'growth-metric-lbl'},[lbl])
        ]);
      }

      const ov = el('div',{class:'card compact growth-ov'},[
        el('div',{class:'growth-ov-grid'},[
          metric('\u{1F4CF}',''+latest.height+' cm','Chi\u1ec1u cao'),
          metric('\u2696\uFE0F',''+latest.weight+' kg','C\u00e2n n\u1eb7ng')
        ]),
        el('div',{class:'growth-ov-foot'},[
          el('span',{class:'growth-ov-date'},['C\u1eadp nh\u1eadt: '+fmtDate(latest.date)]),
          el('button',{class:'btn btn-soft',style:'padding:8px 14px;font-size:12.5px'},['\u2795 Th\u00eam ch\u1ec9 s\u1ed1'])
        ])
      ]);
      ov.querySelector('.btn-soft').addEventListener('click', ()=>openGrowthSheet(kid, null));
      s.push(ov);

      s.push(chartBlock('Chi\u1ec1u cao theo th\u1eddi gian', recs.map(r=>({date:r.date, value:+r.height})), '#8B6FB8', ' cm'));
      s.push(chartBlock('C\u00e2n n\u1eb7ng theo th\u1eddi gian', recs.map(r=>({date:r.date, value:+r.weight})), '#E8936F', ' kg'));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'L\u1ecbch s\u1eed \u0111o']));
      s.push(el('div',{class:'card compact'}, recs.slice().reverse().map(rec=>{
        return el('div',{class:'growth-row'},[
          el('div',{class:'growth-date'},[fmtDate(rec.date)]),
          el('div',{style:'flex:1;min-width:0'},[
            el('div',{class:'growth-val'},[rec.height+' cm \u00b7 '+rec.weight+' kg']),
            rec.note ? el('div',{class:'growth-note'},[rec.note]) : null
          ]),
          el('button',{class:'icon-btn',style:'color:var(--primary-deep)',onclick:()=>openGrowthSheet(kid, rec)},['\u270F\uFE0F']),
          el('button',{class:'icon-btn',style:'color:var(--danger)',onclick:()=>confirmDeleteGrowth(rec)},['\u{1F5D1}\uFE0F'])
        ]);
      })));

      return s;
    }

    function buildProfile(kid){
      const s = [];
      s.push(backRow('Th\u00e0nh vi\u00ean','settings',{path:['family']}));
      s.push(el('div',{class:'profile-head'},[
        el('span',{class:'avatar',style:`width:64px;height:64px;font-size:28px;background:${kid.color}`},[kid.emoji]),
        el('div',{},[
          el('div',{class:'profile-name'},[kid.name]),
          el('div',{class:'profile-sub'},[(kid.role||'Con')+(kid.dob?' \u00b7 '+ageFrom(kid.dob):'')])
        ])
      ]));

      const tabs = el('div',{class:'prof-tabs'},[
        ['overview','\u{1F464} T\u1ed5ng quan'],
        ['growth','\u{1F4C8} Ph\u00e1t tri\u1ec3n'],
        ['health','\u{1FA7A} S\u1ee9c kh\u1ecfe'],
        ['study','\u{1F392} H\u1ecdc t\u1eadp']
      ].map(([id,lbl])=>{
        return el('button',{class:'prof-tab'+(profileTab===id?' on':''),onclick:()=>{profileTab=id; rerender();}},[lbl]);
      }));
      s.push(tabs);

      if(profileTab==='overview'){
        const rows = [
          ['Ng\u00e0y sinh', kid.dob ? fmtDate(kid.dob) : '\u2014'],
          ['Gi\u1edbi t\u00ednh', kid.gender || '\u2014'],
          ['Vai tr\u00f2', kid.role || 'Con']
        ];
        s.push(el('div',{class:'card compact prof-info'}, rows.map(([k,v])=>{
          return el('div',{class:'prof-row'},[
            el('span',{class:'prof-k'},[k]),
            el('span',{class:'prof-v'},[v])
          ]);
        })));
        s.push(el('button',{class:'btn btn-soft',style:'width:100%;margin-top:14px;padding:13px',onclick:()=>openMemberSheet(kid)},[
          '\u270F\uFE0F Ch\u1ec9nh s\u1eeda h\u1ed3 s\u01a1'
        ]));
      }else if(profileTab==='growth'){
        s.push(...growthTab(kid));
      }else if(profileTab==='health'){
        s.push(historyBlock(kid, 'health', 'S\u1ee9c kh\u1ecfe', '\u{1FA7A}'));
      }else if(profileTab==='study'){
        s.push(historyBlock(kid, 'study', 'H\u1ecdc t\u1eadp', '\u{1F392}'));
      }

      return s;
    }

    function buildData(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['D\u1eef li\u1ec7u & Quy\u1ec1n ri\u00eang t\u01b0']));
      const resetBtn = el('button',{class:'btn btn-danger',style:'width:100%;padding:12px'},['\u21BA \u0110\u1eb7t l\u1ea1i d\u1eef li\u1ec7u demo']);
      resetBtn.addEventListener('click', ()=>{
        if(resetBtn.dataset.confirm){
          HF.resetState();
          location.reload();
        }else{
          resetBtn.dataset.confirm='1';
          resetBtn.textContent='\u26A0\uFE0F Ch\u1eafc ch\u1eafn \u0111\u1eb7t l\u1ea1i?';
          setTimeout(()=>{ delete resetBtn.dataset.confirm; resetBtn.textContent='\u21BA \u0110\u1eb7t l\u1ea1i d\u1eef li\u1ec7u demo'; }, 3500);
        }
      });
      s.push(el('div',{class:'card compact'},[
        el('div',{style:'display:flex;gap:10px;align-items:flex-start'},[
          el('span',{style:'font-size:20px'},['\u{1F510}']),
          el('div',{style:'flex:1'},[
            el('div',{style:'font-weight:800;font-size:14px'},['D\u1eef li\u1ec7u c\u1ee7a b\u1ea1n']),
            el('div',{class:'sub',style:'font-size:12.5px;margin-top:3px'},['HomeFlow l\u01b0u d\u1eef li\u1ec7u ngay tr\u00ean thi\u1ebft b\u1ecb n\u00e0y \u2014 kh\u00f4ng g\u1eedi l\u00ean m\u00e1y ch\u1ee7 n\u00e0o.'])
          ])
        ]),
        el('div',{style:'margin-top:14px;padding-top:12px;border-top:1px dashed var(--hairline)'},[
          el('div',{style:'font-size:12.5px;font-weight:700;margin-bottom:6px'},['\u0110\u1eb7t l\u1ea1i d\u1eef li\u1ec7u demo']),
          el('div',{style:'font-size:11.5px;color:var(--muted);margin-bottom:10px'},['X\u00f3a to\u00e0n b\u1ed9 d\u1eef li\u1ec7u v\u00e0 quay v\u1ec1 b\u1ed9 vi\u1ec7c m\u1eabu ban \u0111\u1ea7u.']),
          resetBtn
        ])
      ]));
      return s;
    }

    function buildHelp(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['Tr\u1ee3 gi\u00fap & Ph\u1ea3n h\u1ed3i']));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'H\u01b0\u1edbng d\u1eabn s\u1eed d\u1ee5ng']));
      s.push(el('div',{class:'card compact help-list'}, HF.helpItems()));

      const FAQ = [
        ['D\u1eef li\u1ec7u c\u1ee7a t\u00f4i l\u01b0u \u1edf \u0111\u00e2u?','HomeFlow l\u01b0u d\u1eef li\u1ec7u ngay tr\u00ean thi\u1ebft b\u1ecb c\u1ee7a b\u1ea1n (localStorage) \u2014 kh\u00f4ng g\u1eedi l\u00ean m\u00e1y ch\u1ee7 n\u00e0o.'],
        ['L\u00e0m sao \u0111\u1ed5i t\u00ean th\u00e0nh vi\u00ean?','V\u00e0o C\u00e0i \u0111\u1eb7t \u2192 Gia \u0111\u00ecnh & Th\u00e0nh vi\u00ean \u2192 b\u1ea5m \u270F\uFE0F b\u00ean c\u1ea1nh th\u00e0nh vi\u00ean. T\u00ean m\u1edbi s\u1ebd c\u1eadp nh\u1eadt \u1edf m\u1ecdi n\u01a1i trong HomeFlow.'],
        ['L\u00e0m sao \u0111\u1eb7t l\u1ea1i d\u1eef li\u1ec7u demo?','V\u00e0o C\u00e0i \u0111\u1eb7t \u2192 D\u1eef li\u1ec7u & Quy\u1ec1n ri\u00eang t\u01b0 \u2192 \u0110\u1eb7t l\u1ea1i d\u1eef li\u1ec7u demo.'],
        ['Ng\u01b0\u1eddi lo v\u00e0 ng\u01b0\u1eddi l\u00e0m kh\u00e1c nhau th\u1ebf n\u00e0o?','Ng\u01b0\u1eddi lo (\u{1F9E0}) nh\u1edb v\u00e0 l\u00ean k\u1ebf ho\u1ea1ch, ng\u01b0\u1eddi l\u00e0m (\u25CF) th\u1ef1c hi\u1ec7n. Hai vi\u1ec7c c\u00f3 th\u1ec3 do hai ng\u01b0\u1eddi kh\u00e1c nhau \u0111\u1ea3m nh\u1eadn \u2014 \u0111\u00f3 l\u00e0 c\u00e1ch HomeFlow chia s\u1ebb g\u00e1nh n\u1eb7ng nh\u1edb vi\u1ec7c.']
      ];
      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'C\u00e2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p']));
      const faqCard = el('div',{class:'card compact'}, FAQ.map(([q,a])=>{
        const ans = el('div',{class:'faq-a',style:'display:none'},[a]);
        const row = el('div',{class:'faq-q',onclick:()=>{
          const open = ans.style.display!=='none';
          ans.style.display = open ? 'none' : 'block';
          row.classList.toggle('open', !open);
        }},[
          el('span',{style:'flex:1'},[q]),
          el('span',{class:'faq-chev'},['\u25BE'])
        ]);
        return el('div',{},[row, ans]);
      }));
      s.push(faqCard);

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'G\u1eedi ph\u1ea3n h\u1ed3i']));
      const fb = el('textarea',{class:'input',rows:3,placeholder:'\u00dd ki\u1ebfn, g\u00f3p \u00fd ho\u1eb7c b\u00e1o l\u1ed7i\u2026'});
      const send = el('button',{class:'btn btn-primary',style:'margin-top:10px'},['G\u1eedi ph\u1ea3n h\u1ed3i']);
      send.addEventListener('click', ()=>{
        const txt = fb.value.trim();
        if(!txt){ HF.toast('Nh\u1eadp n\u1ed9i dung ph\u1ea3n h\u1ed3i tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        state.feedback = state.feedback||[];
        state.feedback.push({text:txt, at:new Date().toISOString()});
        HF.saveState(state);
        fb.value='';
        HF.toast('C\u1ea3m \u01a1n ph\u1ea3n h\u1ed3i c\u1ee7a b\u1ea1n!','\u{1F49C}');
      });
      s.push(el('div',{class:'card compact'},[
        el('div',{style:'font-size:12px;color:var(--muted);margin-bottom:8px'},['G\u00f3p \u00fd gi\u00fap HomeFlow t\u1ed1t h\u01a1n cho c\u1ea3 gia \u0111\u00ecnh b\u1ea1n.']),
        fb,
        send
      ]));
      return s;
    }

    function build(){
      if(path[0]==='family'){
        if(path[1]){
          const kid = HF.memberById(path[1]);
          return kid && kid.kind==='kid' ? buildProfile(kid) : buildFamily();
        }
        return buildFamily();
      }
      if(path[0]==='tasks') return buildTasks();
      if(path[0]==='data') return buildData();
      if(path[0]==='help') return buildHelp();
      return buildLanding();
    }

    function rerender(){
      root.innerHTML='';
      build().forEach(n=>root.appendChild(n));
    }

    rerender();
    return [root];
  };

  function openAddSheet(state, nav){
    HF.sheet({
      title:'Th\u00eam vi\u1ec7c th\u1ee7 c\u00f4ng',
      body:()=>{
        const title = el('input',{class:'input',placeholder:'VD: Lau d\u1ecdn ph\u00f2ng ng\u1ee7'});
        const catSel = el('select',{class:'input'});
        Object.keys(HF.CATEGORIES).forEach(k=>{
          catSel.appendChild(el('option',{value:k},[HF.CATEGORIES[k].emoji+' '+HF.CATEGORIES[k].label]));
        });
        const ownerSel = HF.ownerSelect('me',()=>{});
        const dateSel = HF.dateSelect(HF.dayOffset(1),()=>{});
        const plannerSel = HF.ownerSelect('me',()=>{});

        const body = el('div',{},[
          el('div',{class:'field'},[el('label',{},['T\u00ean vi\u1ec7c']), title]),
          el('div',{class:'field'},[el('label',{},['Danh m\u1ee5c']), catSel]),
          el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
            el('div',{class:'field'},[el('label',{},['\u25B6 Ng\u01b0\u1eddi th\u1ef1c hi\u1ec7n']), ownerSel]),
            el('div',{class:'field'},[el('label',{},['\u{1F9E0} L\u1eadp k\u1ebf ho\u1ea1ch']), plannerSel])
          ]),
          el('div',{class:'field'},[el('label',{},['Deadline']), dateSel]),
          el('button',{class:'btn btn-primary'},['\u2705 Th\u00eam v\u00e0o k\u1ebf ho\u1ea1ch'])
        ]);

        const saveBtn = body.querySelector('.btn-primary');
        saveBtn.addEventListener('click', ()=>{
          const t = title.value.trim();
          if(!t){ HF.toast('Nh\u1eadp t\u00ean vi\u1ec7c tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
          state.tasks.push({
            id: HF.uid('m'),
            title: t,
            cat: catSel.value,
            due: new Date(dateSel.value),
            time: '',
            owner: ownerSel.value,
            planner: plannerSel.value,
            mental: true,
            status: 'open',
            pts: 1,
            src: 'manual'
          });
          HF.saveState(state);
          HF.toast('\u0110\u00e3 th\u00eam \u201c'+t+'\u201d','\u2705');
          nav('tasks',{filter:'all'});
          document.getElementById('sheetLayer').innerHTML='';
        });
        return body;
      }
    });
  }

  function el(tag, attrs, children){
    return HF.el(tag, attrs, children);
  }
})();