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
      el('div',{class:'sub'},[todays.length===0
        ? 'H\u00f4m nay nh\u1eb9 nh\u00e0ng \u2014 c\u00f9ng nhau t\u1eadn h\u01b0\u1edfng nh\u00e9'
        : 'H\u00f4m nay c\u00f3 '+todays.length+' vi\u1ec7c \u2014 c\u00f9ng nhau san s\u1ebb nh\u00e9 \u{1F49C}'])
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
        ? [emptyTodayCard(state, nav)]
        : todays.slice(0,2).map((t,i)=>HF.taskCard(t,{compact:true, delay:i*60, onToggle:()=>toggleTask(state,t,nav)}))),
      todays.length>2 ? el('div',{style:'text-align:center;margin-top:10px'},
        el('button',{class:'btn btn-soft',style:'padding:9px 18px;font-size:13px',onclick:()=>nav('tasks')},['Xem t\u1ea5t c\u1ea3 '+todays.length+' vi\u1ec7c'])) : null
    ]);

    const maxTotal = Math.max(...HF.MEMBERS.map(m=>load[m.id].total), 1);
    const loadCard = el('div',{class:'card compact',style:'cursor:pointer;padding-top:13px;padding-bottom:13px',onclick:()=>nav('balance')},[
      el('div',{class:'section-label',style:'margin-bottom:12px'},[el('span',{class:'bar'}),'C\u00e2n b\u1eb1ng vi\u1ec7c nh\u00e0']),
      el('div',{class:'stacked-bar'}, HF.MEMBERS.map(m=>
        el('div',{style:`flex:${load[m.id].total};background:${m.color}`})
      )),
      el('div',{class:'load-legend'}, HF.MEMBERS.map(m=>
        el('span',{},[el('i',{style:'background:'+m.color}), m.name+' '+load[m.id].share+'%'])
      )),
      el('div',{class:'load-status'},[
        imb
          ? '\u2696\uFE0F '+imb.max.member.name+' \u0111ang g\u00e1nh nhi\u1ec1u nh\u1ea5t \u2014 c\u00f9ng san s\u1ebb nh\u00e9'
          : '\u{1F31F} C\u1ea3 nh\u00e0 m\u00ecnh \u0111ang san s\u1ebb r\u1ea5t \u0111\u1ec1u',
        el('span',{style:'color:var(--primary-deep);font-weight:800'},['\u2192'])
      ])
    ]);

    const briefTeaser = el('div',{class:'card',style:'cursor:pointer;background:linear-gradient(135deg,#FFF7E8,#FDE9EE)',onclick:()=>nav('brief')},[
      el('div',{style:'display:flex;align-items:center;gap:12px'},[
        el('span',{style:'font-size:30px'},['\u{1F4DD}']),
        el('div',{style:'flex:1'},[
          el('div',{style:'font-weight:800;font-size:14.5px'},['B\u1ea3n tin tu\u1ea7n c\u1ee7a c\u1ea3 nh\u00e0 \u0111\u00e3 s\u1eb5n s\u00e0ng']),
          el('div',{class:'sub',style:'font-size:12px'},[brief.doneCount+' vi\u1ec7c \u0111\u00e3 xong, '+brief.openSoonCount+' vi\u1ec7c s\u1eafp t\u1edbi'])
        ]),
        el('span',{style:'color:var(--primary-deep);font-weight:800'},['\u2192'])
      ])
    ]);

    const kidOpenCount = state.tasks.filter(t=>HF.memberById(t.owner).kind==='kid' && t.status==='open').length;
    const missionsTeaser = el('div',{class:'card',style:'cursor:pointer;background:linear-gradient(135deg,#FFF3E0,#FDE9EE)',onclick:()=>nav('missions')},[
      el('div',{style:'display:flex;align-items:center;gap:12px'},[
        el('span',{style:'font-size:30px'},['\u2B50']),
        el('div',{style:'flex:1'},[
          el('div',{style:'font-weight:800;font-size:14.5px'},['Nhi\u1ec7m v\u1ee5 c\u1ee7a con']),
          el('div',{class:'sub',style:'font-size:12px'},[kidOpenCount>0 ? kidOpenCount+' nhi\u1ec7m v\u1ee5 \u0111ang ch\u1edd con' : 'H\u00f4m nay con ch\u01b0a c\u00f3 nhi\u1ec7m v\u1ee5 n\u00e0o'])
        ]),
        el('span',{style:'color:var(--primary-deep);font-weight:800'},['\u2192'])
      ])
    ]);

    const footer = el('div',{class:'footer-note'},['\u{1F49C} HomeFlow']);

    screen.push(header, speakCard, todayCard, loadCard, missionsTeaser, briefTeaser, footer);
    return screen;
  };

  V.Tasks = function(state, nav, filter){
    const showDone = !HF.prefs || HF.prefs.showCompleted !== false;
    const segs = [
      {id:'all', label:'T\u1ea5t c\u1ea3'},
      {id:'today', label:'H\u00f4m nay'},
      {id:'week', label:'Tu\u1ea7n n\u00e0y'},
      {id:'month', label:'Th\u00e1ng'}
    ];
    if(showDone) segs.push({id:'done', label:'\u0110\u00e3 xong'});
    if(filter==='done' && !showDone) filter = 'all';
    let list = state.tasks.slice();
    if(filter==='today') list = list.filter(t=>t.status==='open' && HF.isSameDay(t.due, HF.dayOffset(0)));
    else if(filter==='week') list = list.filter(t=>t.status==='open' && t.due <= HF.dayOffset(7));
    else if(filter==='done') list = list.filter(t=>t.status==='done');
    else if(filter!=='month') list = list.filter(t=>t.status==='open');

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
      el('div',{style:'margin-top:14px'}, filter==='month'
        ? monthCalendar(state, nav)
        : (list.length===0
          ? el('div',{class:'card empty'},[
              el('span',{class:'e-ico'},[filter==='today' ? HF.todayEmptyMsg().ico : '\u{1F33F}']),
              el('div',{class:'e-t'},[filter==='today' ? HF.todayEmptyMsg().t : 'Ch\u01b0a c\u00f3 vi\u1ec7c n\u00e0o']),
              el('div',{class:'e-s'},[filter==='today' ? HF.todayEmptyMsg().s : 'C\u1ea3 nh\u00e0 m\u00ecnh b\u1eaft \u0111\u1ea7u nh\u1eb9 nh\u00e0ng nh\u00e9']),
              el('button',{class:'btn btn-soft',style:'margin-top:14px;width:100%;padding:12px;font-size:13.5px',onclick:()=>openAddSheet(state,nav)},[
                '+ Th\u00eam vi\u1ec7c'
              ])
            ])
          : list.map((t,i)=>HF.taskCard(t,{delay:i*40, onToggle:()=>toggleTask(state,t,nav)}))))
    ];

    screen.push(el('div',{style:'margin-top:16px'},
      el('button',{class:'btn btn-soft',style:'width:100%',onclick:()=>openAddSheet(state,nav)},['+ Th\u00eam vi\u1ec7c th\u1ee7 c\u00f4ng'])));
    return screen;
  };

  let calCursor = null;

  function openTaskSheet(state, nav, task){
    const cat = HF.categoryById(task.cat);
    const done = task.status==='done';
    const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
      el('div',{style:'display:flex;gap:8px;flex-wrap:wrap'},[
        el('span',{class:'chip',style:`background:${cat.soft};color:${cat.color}`},[cat.emoji+' '+cat.label]),
        el('span',{class:'chip ghost'},['\u{1F5D3}\uFE0F '+HF.formatDay(task.due)+(task.time?' \u00b7 '+task.time:'')])
      ]),
      HF.contrib(task),
      el('button',{class:'btn '+(done?'btn-ghost':'btn-primary'),style:'width:100%',onclick:()=>{
        if(done){ task.status='open'; task.doneAt=null; }
        else{ task.status='done'; task.doneAt=new Date(); HF.confetti(); }
        HF.saveState(state);
        sheet.close();
        nav('tasks',{filter:'month'});
      }},[done?'\u21A9\uFE0F M\u1edf l\u1ea1i vi\u1ec7c':'\u2713 \u0110\u00e1nh d\u1ea5u ho\u00e0n th\u00e0nh'])
    ]);
    const sheet = HF.sheet({title:task.title, body:()=>body});
  }

  function openDaySheet(state, nav, year, month, day){
    const d = new Date(year, month, day);
    const dayTasks = state.tasks.filter(t=>HF.isSameDay(new Date(t.due), d))
      .sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    const body = el('div',{style:'display:flex;flex-direction:column;gap:8px'},[
      ...dayTasks.map(t=>{
        const cat = HF.categoryById(t.cat);
        const owner = HF.memberById(t.owner);
        return el('div',{class:'day-task',onclick:()=>openTaskSheet(state, nav, t)},[
          el('span',{class:'day-task-ico',style:'background:'+cat.soft},[cat.emoji]),
          el('div',{style:'flex:1;min-width:0'},[
            el('div',{class:'day-task-t'+(t.status==='done'?' done':'')},[t.title]),
            el('div',{class:'day-task-m'},[(t.time?'\u23F0 '+t.time+' \u00b7 ':'')+owner.short+' l\u00e0m'])
          ]),
          t.status==='done' ? el('span',{class:'day-task-done'},['\u2713']) : null
        ]);
      }),
      el('button',{class:'btn btn-soft',style:'width:100%;margin-top:6px',onclick:()=>openAddSheet(state, nav, d, 'month')},[
        '+ Th\u00eam vi\u1ec7c'
      ])
    ]);
    const sheet = HF.sheet({title:HF.formatDay(d), body:()=>body});
  }

  function openEmptyDaySheet(state, nav, year, month, day){
    const d = new Date(year, month, day);
    const body = el('div',{style:'display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center;padding:6px 0 2px'},[
      el('div',{style:'font-size:42px'},['\u{1F33F}']),
      el('div',{style:'font-size:15px;font-weight:800'},['Ng\u00e0y n\u00e0y c\u00f2n tr\u1ed1ng, th\u1eadt tho\u1ea3i m\u00e1i']),
      el('div',{style:'font-size:12.5px;color:var(--muted);line-height:1.5'},['Ch\u01b0a c\u00f3 vi\u1ec7c n\u00e0o c\u1ea7n nh\u1edb trong '+HF.formatDay(d)+'.']),
      el('button',{class:'btn btn-primary',style:'width:100%;margin-top:6px'},['+ Th\u00eam vi\u1ec7c cho ng\u00e0y n\u00e0y'])
    ]);
    const sheet = HF.sheet({title:HF.formatDay(d), body:()=>body});
    body.querySelector('.btn-primary').addEventListener('click', ()=>{
      openAddSheet(state, nav, d, 'month');
    });
  }

  function monthCalendar(state, nav){
    const now = new Date();
    const cursor = calCursor || new Date(now.getFullYear(), now.getMonth(), 1);
    const year = cursor.getFullYear(), month = cursor.getMonth();
    const weekStart = (HF.prefs && HF.prefs.weekStart==='sun') ? 0 : 1;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
    const MONTHS = ['Th\u00e1ng 1','Th\u00e1ng 2','Th\u00e1ng 3','Th\u00e1ng 4','Th\u00e1ng 5','Th\u00e1ng 6','Th\u00e1ng 7','Th\u00e1ng 8','Th\u00e1ng 9','Th\u00e1ng 10','Th\u00e1ng 11','Th\u00e1ng 12'];

    const tasksByDay = {};
    const showDone = !HF.prefs || HF.prefs.showCompleted !== false;
    state.tasks.forEach(t=>{
      if(t.status==='done' && !showDone) return;
      const d = new Date(t.due);
      if(d.getFullYear()===year && d.getMonth()===month){
        (tasksByDay[d.getDate()] = tasksByDay[d.getDate()]||[]).push(t);
      }
    });

    const cells = [];
    for(let i=0;i<42;i++){
      const n = i - offset + 1;
      let day, inMonth;
      if(n<1){ day = daysInPrev + n; inMonth = false; }
      else if(n>daysInMonth){ day = n - daysInMonth; inMonth = false; }
      else { day = n; inMonth = true; }
      const isToday = inMonth && day===now.getDate() && month===now.getMonth() && year===now.getFullYear();
      const tasks = inMonth ? (tasksByDay[day]||[]) : [];
      cells.push({day, inMonth, isToday, tasks});
    }

    const wdNames = weekStart===1 ? ['T2','T3','T4','T5','T6','T7','CN'] : ['CN','T2','T3','T4','T5','T6','T7'];

    const grid = el('div',{class:'cal-grid'}, cells.map(c=>{
      const chips = c.tasks.slice(0,2).map(t=>{
        const cat = HF.categoryById(t.cat);
        return el('div',{class:'cal-chip'+(t.status==='done'?' done':''),style:`background:${cat.soft};color:${cat.color}`,onclick:(e)=>{e.stopPropagation(); openTaskSheet(state, nav, t);}},[cat.emoji+' '+t.title]);
      });
      if(c.tasks.length>2){
        chips.push(el('div',{class:'cal-more'},['+'+(c.tasks.length-2)+' n\u1eefa']));
      }
      return el('div',{class:'cal-cell'+(c.inMonth?'':' out')+(c.inMonth&&c.tasks.length===0?' empty':(c.inMonth&&c.tasks.length>0?' has-tasks':'')),onclick:c.inMonth?(c.tasks.length===0?()=>openEmptyDaySheet(state, nav, year, month, c.day):()=>openDaySheet(state, nav, year, month, c.day)):null},[
        el('div',{class:'cal-day'+(c.isToday?' today':'')},[c.day]),
        ...chips
      ]);
    }));

    const head = el('div',{class:'cal-head'},[
      el('div',{class:'cal-nav'},[
        el('button',{class:'cal-nav-btn',onclick:()=>{calCursor=new Date(year, month-1, 1); nav('tasks',{filter:'month'});}},[
          el('span',{},['\u2039'])
        ]),
        el('div',{class:'cal-title'},[MONTHS[month]+' '+year]),
        el('button',{class:'cal-nav-btn',onclick:()=>{calCursor=new Date(year, month+1, 1); nav('tasks',{filter:'month'});}},[
          el('span',{},['\u203A'])
        ])
      ]),
      el('button',{class:'btn btn-soft',style:'padding:7px 13px;font-size:12px',onclick:()=>{calCursor=null; nav('tasks',{filter:'month'});}},[
        'H\u00f4m nay'
      ])
    ]);

    return el('div',{class:'card compact cal-card'},[
      head,
      el('div',{class:'cal-wd'}, wdNames.map(w=>el('span',{},[w]))),
      grid
    ]);
  }

  function emptyTodayCard(state, nav){
    const em = HF.todayEmptyMsg();
    return el('div',{class:'card empty'},[
      el('span',{class:'e-ico'},[em.ico]),
      el('div',{class:'e-t'},[em.t]),
      el('div',{class:'e-s'},[em.s]),
      el('button',{class:'btn btn-soft',style:'margin-top:14px;width:100%;padding:12px;font-size:13.5px',onclick:()=>openAddSheet(state,nav)},[
        '+ Th\u00eam vi\u1ec7c'
      ])
    ]);
  }

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
    let editing = false;

    const header = el('div',{},[
      el('div',{class:'eyebrow'},['\u2728 N\u00f3i v\u1edbi HomeFlow']),
      el('h1',{class:'page-title',style:'margin-top:4px;font-size:21px'},['C\u1ee9 n\u00f3i ra,', el('br'), 'HomeFlow lo ph\u1ea7n c\u00f2n l\u1ea1i']),
      el('div',{class:'sub'},['M\u1ed9t \u0111o\u1ea1n nh\u1eafn l\u00e0 AI hi\u1ec3u vi\u1ec7c, s\u1eafp l\u1ecbch v\u00e0 g\u1ee3i \u00fd ai lo \u2014 ai l\u00e0m.'])
    ]);

    const ta = el('textarea',{class:'input',rows:6,placeholder:'VD: Th\u1ee9 7 Bin h\u1ecdc ti\u1ebfng Anh l\u00fac 9h, b\u1ed1 \u0111\u01b0a con \u0111i. Ch\u1ee7 nh\u1eadt sinh nh\u1eadt b\u00e0 n\u00ean th\u1ee9 6 nh\u1edb mua qu\u00e0.'});

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recog = null, listening = false, manualStop = false;

    const micBtn = el('button',{class:'btn btn-soft mic-toggle'},['\u{1F3A4} B\u1ea5m \u0111\u1ec3 n\u00f3i']);
    if(SR){
      micBtn.addEventListener('click', ()=>{
        if(listening){ stopListen(); return; }
        startListen();
      });
    }else{
      micBtn.classList.add('disabled');
      micBtn.disabled = true;
      micBtn.textContent = '\u{1F3A4} Tr\u00ecnh duy\u1ec7t ch\u01b0a h\u1ed7 tr\u1ee3 thu \u00e2m \u2014 b\u1ea1n c\u00f3 th\u1ec3 g\u00f5 text';
    }

    function startListen(){
      listening = true;
      manualStop = false;
      micBtn.classList.add('listening');
      micBtn.textContent = '\u23F9 \u0110ang nghe \u2014 b\u1ea5m \u0111\u1ec3 d\u1eebng';
      recog = new SR();
      recog.lang = 'vi-VN';
      recog.interimResults = true;
      recog.continuous = false;
      recog.onresult = (e)=>{
        let txt = '';
        for(let i=0;i<e.results.length;i++) txt += e.results[i][0].transcript;
        ta.value = txt;
        ta.focus();
      };
      recog.onend = ()=>{
        listening = false;
        micBtn.classList.remove('listening');
        micBtn.textContent = '\u{1F3A4} B\u1ea5m \u0111\u1ec3 n\u00f3i';
        if(!manualStop){
          const txt = ta.value.trim();
          if(txt.length >= 8){
            setTimeout(()=>submitDump(), 500);
          }
        }
      };
      recog.onerror = (e)=>{
        listening = false;
        micBtn.classList.remove('listening');
        micBtn.textContent = '\u{1F3A4} B\u1ea5m \u0111\u1ec3 n\u00f3i';
        if(e.error==='not-allowed' || e.error==='service-not-allowed'){
          HF.toast('Ch\u01b0a c\u1ea5p quy\u1ec1n micro \u2014 cho ph\u00e9p trong tr\u00ecnh duy\u1ec7t nh\u00e9','\u{1F3A4}');
        }else if(e.error==='no-speech'){
          HF.toast('Ch\u01b0a nghe th\u1ea5y g\u00ec \u2014 th\u1eed l\u1ea1i nh\u00e9','\u{1F914}');
        }else{
          HF.toast('Kh\u00f4ng nghe \u0111\u01b0\u1ee3c \u2014 b\u1ea1n v\u1eabn c\u00f3 th\u1ec3 g\u00f5 text','\u{1F914}');
        }
      };
      try{ recog.start(); }catch(err){ listening = false; }
    }

    function stopListen(){
      manualStop = true;
      if(recog) recog.stop();
    }

    const exampleBox = el('div',{class:'field-hint'},['Th\u1eed m\u1ed9t m\u1eabu:']);
    const chips = el('div',{class:'example-chips'}, HF.EXAMPLE_DUMPS.map((ex,i)=>
      el('button',{class:'example-chip',onclick:()=>{ta.value=ex; ta.focus();}},['M\u1eabu '+(i+1)])
    ));
    exampleBox.appendChild(chips);

    const goBtn = el('button',{class:'btn btn-speak',style:'flex:1'},['\u2728 HomeFlow hi\u1ec3u gi\u00fap']);

    const stageBox = el('div',{style:'display:none'});

    const resultBox = el('div',{style:'display:none'});

    const dumpCard = el('div',{class:'card dump-card',style:'display:flex;flex-direction:column'},[
      el('div',{class:'field'},[
        el('label',{},['\u0110i\u1ec1u b\u1ea1n \u0111ang ngh\u0129']),
        ta,
        exampleBox
      ]),
      el('div',{style:'display:flex;gap:8px;align-items:stretch;margin-top:4px'},[
        micBtn,
        goBtn
      ]),
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

    function submitDump(){
      if(dumpCard.style.display === 'none') return;
      const text = ta.value.trim();
      if(text.length < 8){
        HF.toast('K\u1ec3 th\u00eam m\u1ed9t ch\u00fat chi ti\u1ebft nh\u00e9','\u{1F914}');
        ta.focus();
        return;
      }
      const tasksPromise = (async ()=>{
        const llm = await tryLLM(text);
        return llm || HF.parseBrainDump(text);
      })();
      runAI(tasksPromise);
    }

    goBtn.addEventListener('click', submitDump);

    async function tryLLM(text){
      try{
        const ctrl = new AbortController();
        const t = setTimeout(()=>ctrl.abort(), 9000);
        const resp = await fetch('/api/parse', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            text,
            members: HF.MEMBERS.map(m=>({id:m.id, name:m.name, role:m.role, kind:m.kind}))
          }),
          signal: ctrl.signal
        });
        clearTimeout(t);
        if(!resp.ok) return null;
        const data = await resp.json();
        if(!data.tasks || !data.tasks.length) return null;
        return normalizeLLMTasks(data.tasks);
      }catch(e){ return null; }
    }

    function normalizeLLMTasks(llmTasks){
      const validMembers = new Set(HF.MEMBERS.map(m=>m.id));
      const validCats = Object.keys(HF.CATEGORIES);
      return llmTasks.map(t=>{
        const cat = validCats.includes(t.category) ? t.category : 'home';
        const owner = validMembers.has(t.owner) ? t.owner : 'me';
        const planner = t.planner && validMembers.has(t.planner) ? t.planner : owner;
        let due = t.date ? new Date(t.date+'T00:00:00') : HF.dayOffset(1);
        if(isNaN(due.getTime())) due = HF.dayOffset(1);
        return {
          title: String(t.title||'').trim(),
          cat, due, time: t.time||'',
          owner, planner, shared: !!t.shared,
          mental: true, status:'open', pts:1, src:'llm',
          dueKnown: !!t.date,
          doerKnown: true
        };
      }).filter(t=>t.title);
    }

    function runAI(tasksPromise){
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
          setTimeout(async ()=>{
            stageBox.style.display='none';
            const tasks = await tasksPromise;
            renderResults(tasks);
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
        const doAdd = ()=>{
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
              src: t.src || 'brain',
              createdAt: now
            });
          }
          state.dumpCount = (state.dumpCount||0)+1;
          state.lastDump = {text: ta.value.trim(), at: now.toISOString(), count: parsedTasks.length};
          HF.saveState(state);
          showSuccess(parsedTasks.length);
        };
        const dupTask = parsedTasks.find(t=>HF.findDuplicateTask(state, {title:t.title, due:t.due, time:t.time, owner:t.owner, shared:!!t.shared}));
        if(dupTask){
          const existing = HF.findDuplicateTask(state, {title:dupTask.title, due:dupTask.due, time:dupTask.time, owner:dupTask.owner, shared:!!dupTask.shared});
          confirmDuplicate(existing, doAdd);
          return;
        }
        const noDoer = parsedTasks.find(t=>t.doerKnown===false);
        const noDate = parsedTasks.find(t=>t.dueKnown===false);
        if(noDoer || noDate){
          const msgs = [];
          if(noDoer) msgs.push('Kh\u00f4ng r\u00f5 ai l\u00e0m vi\u1ec7c \u201c'+noDoer.title+'\u201d');
          if(noDate) msgs.push('Kh\u00f4ng x\u00e1c \u0111\u1ecbnh \u0111\u01b0\u1ee3c ng\u00e0y cho \u201c'+noDate.title+'\u201d');
          HF.confirmIssue({
            head:'C\u1ea7n ki\u1ec3m tra l\u1ea1i',
            title: msgs.join('. ')+'.',
            note:'Vui l\u00f2ng ch\u1ec9nh s\u1eeda l\u1ea1i tr\u01b0\u1edbc khi th\u00eam.',
            mode:'edit',
            onEdit: ()=>{ setEditing(true); }
          });
          return;
        }
        const issueTask = parsedTasks.find(t=>HF.isPastDate(t.due) || HF.timeConflict(state, t));
        if(issueTask){
          const past = HF.isPastDate(issueTask.due);
          const conflict = HF.timeConflict(state, issueTask);
          const msgs = [];
          if(past) msgs.push('\u201c'+issueTask.title+'\u201d c\u00f3 ng\u00e0y \u0111\u00e3 qua ('+HF.formatDay(issueTask.due)+')');
          if(conflict) msgs.push('\u201c'+issueTask.title+'\u201d tr\u00f9ng gi\u1edd v\u1edbi \u201c'+conflict.title+'\u201d ('+conflict.time+')');
          HF.confirmIssue({
            head: past&&conflict ? 'C\u00f3 v\u1ebb ch\u01b0a \u1ed5n' : (past ? 'Ng\u00e0y \u0111\u00e3 qua' : 'Gi\u1edd b\u1ecb tr\u00f9ng'),
            title: msgs.join('. ')+'.',
            note: conflict
              ? 'Vui l\u00f2ng ch\u1ec9nh s\u1eeda l\u1ea1i ng\u00e0y/gi\u1edd \u0111\u1ec3 tr\u00e1nh tr\u00f9ng.'
              : 'B\u1ea1n c\u00f3 mu\u1ed1n \u0111\u1ed5i ng\u00e0y kh\u00f4ng?',
            mode: conflict ? 'edit' : 'confirm',
            onChange: ()=>{ HF.toast('Ch\u1ecdn ng\u00e0y kh\u00e1c nh\u00e9','\u{1F5D3}\uFE0F'); },
            onEdit: ()=>{ setEditing(true); },
            onKeep: doAdd
          });
          return;
        }
        doAdd();
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
        el('div',{class:'section-label'},[el('span',{class:'bar'}),'G\u1ee3i \u00fd san s\u1ebb vi\u1ec7c']),
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
            el('div',{style:'font-weight:800;font-size:14.5px'},['C\u1ea3 nh\u00e0 m\u00ecnh \u0111ang san s\u1ebb r\u1ea5t \u0111\u1ec1u!']),
            el('div',{class:'sub',style:'font-size:12px'},['Gi\u1eef nh\u1ecbp nh\u00e9. Xem b\u1ea3n tin tu\u1ea7n \u2192'])
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
        el('div',{class:'eyebrow'},['B\u1ea3n tin gia \u0111\u00ecnh']),
        el('h1',{class:'page-title',style:'margin-top:4px'},['\u{1F49C} Tu\u1ea7n n\u00e0y c\u1ee7a gia \u0111\u00ecnh']),
        el('div',{class:'sub'},['Tu\u1ea7n '+brief.weekLabel+' \u2014 m\u1ed9t nh\u1ecbp th\u1edf b\u00ecnh y\u00ean'])
      ])
    ];

    const doneMsg = brief.doneCount>0
      ? 'Tu\u1ea7n n\u00e0y c\u1ea3 nh\u00e0 \u0111\u00e3 c\u00f9ng nhau ho\u00e0n th\u00e0nh '+brief.doneCount+' vi\u1ec7c'+(brief.openCount>0 ? ', c\u00f2n '+brief.openCount+' vi\u1ec7c ph\u00eda tr\u01b0\u1edbc' : '')+' \u2014 c\u00f9ng nhau san s\u1ebb nh\u00e9 \u{1F49C}'
      : 'Tu\u1ea7n n\u00e0y c\u1ea3 nh\u00e0 \u0111ang c\u00f9ng nhau b\u1eaft \u0111\u1ea7u \u2014 c\u00f2n '+brief.openCount+' vi\u1ec7c ph\u00eda tr\u01b0\u1edbc, c\u00f9ng nhau san s\u1ebb nh\u00e9 \u{1F49C}';
    screen.push(el('div',{class:'card brief-card brief-hello'},[
      el('div',{class:'brief-hello-t'},['G\u1eedi c\u1ea3 nh\u00e0 y\u00eau th\u01b0\u01a1ng \u{1F49C}']),
      el('div',{class:'brief-hello-msg'},[doneMsg])
    ]));

    const todayOpen = state.tasks.filter(t=>t.status==='open' && HF.isSameDay(t.due, HF.dayOffset(0)));
    const tomorrowOpen = state.tasks.filter(t=>t.status==='open' && HF.isSameDay(t.due, HF.dayOffset(1)));
    const nextWeek = state.tasks.filter(t=>t.status==='open' && t.due > HF.dayOffset(1) && t.due <= HF.dayOffset(7)).sort((a,b)=>a.due-b.due);

    function briefSection(ico, label, items, showWhen){
      if(items.length===0) return null;
      return el('div',{class:'card brief-card'},[
        el('div',{class:'brief-label brief-next'},[ico+' '+label]),
        ...items.map(t=>el('div',{class:'brief-item'},[
          el('span',{class:'brief-mark'},['\u2022']),
          el('span',{class:'brief-text'},[t.title]),
          showWhen ? el('span',{class:'brief-when'},[t.time || HF.formatDay(t.due)]) : null
        ]))
      ]);
    }
    screen.push(briefSection('\u{1F514}','H\u00f4m nay c\u1ea7n ch\u00fa \u00fd', todayOpen, true));
    screen.push(briefSection('\u{1F324}\uFE0F','Ng\u00e0y mai chu\u1ea9n b\u1ecb', tomorrowOpen, true));
    screen.push(briefSection('\u{1F4C5}','Tu\u1ea7n t\u1edbi \u0111\u1eebng qu\u00ean', nextWeek, true));
    if(todayOpen.length===0 && tomorrowOpen.length===0 && nextWeek.length===0){
      screen.push(el('div',{class:'card brief-card'},[
        el('div',{class:'brief-empty'},['Kh\u00f4ng c\u00f2n vi\u1ec7c n\u00e0o ph\u00eda tr\u01b0\u1edbc \u2014 c\u1ea3 nh\u00e0 c\u1ee9 t\u1eadn h\u01b0\u1edfng nh\u00e9 \u{1F33F}'])
      ]));
    }

    const balLine = (imb && !state.rebalanced)
      ? 'Tu\u1ea7n n\u00e0y, ph\u1ea7n l\u1edbn vi\u1ec7c nh\u1edb v\u00e0 l\u00ean k\u1ebf ho\u1ea1ch v\u1eabn do '+imb.max.member.name+' g\u00e1nh \u2014 c\u1ea3 nh\u00e0 c\u00f9ng chia s\u1ebb th\u00eam nh\u00e9 \u{1F49C}'
      : 'Tu\u1ea7n n\u00e0y c\u1ea3 nh\u00e0 \u0111\u00e3 chia s\u1ebb tr\u00e1ch nhi\u1ec7m \u0111\u1ec1u h\u01a1n \u2014 gi\u1eef nh\u1ecbp nh\u00e9 \u{1F49C}';
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

V.Missions = function(state, nav){
    const kids = HF.MEMBERS.filter(m=>m.kind==='kid');
    const screen = [
      el('div',{},[
        el('div',{class:'eyebrow'},['\u2B50 Nhi\u1ec7m v\u1ee5 c\u1ee7a con']),
        el('h1',{class:'page-title',style:'margin-top:4px'},['\u2B50 Nhi\u1ec7m v\u1ee5 c\u1ee7a con']),
        el('div',{class:'sub'},['M\u1ed7i ng\u01b0\u1eddi chia s\u1ebb m\u1ed9t ch\u00fat, c\u1ea3 nh\u00e0 m\u00ecnh nh\u1eb9 nh\u00e0ng h\u01a1n \u{1F49C}'])
      ])
    ];
    if(kids.length===0){
      screen.push(el('div',{class:'card empty'},[
        el('span',{class:'e-ico'},['\u{1F476}']),
        el('div',{class:'e-t'},['Ch\u01b0a c\u00f3 con trong gia \u0111\u00ecnh']),
        el('div',{class:'e-s'},['Th\u00eam con \u1edf C\u00e0i \u0111\u1eb7t \u2192 Gia \u0111\u00ecnh & Th\u00e0nh vi\u00ean'])
      ]));
      return screen;
    }
    const all = HF.kidMissions(state);
    kids.forEach(kid=>{
      const mine = all.filter(t=>t.owner===kid.id)
        .sort((a,b)=>(a.status==='done')-(b.status==='done') || new Date(a.due)-new Date(b.due));
      const open = mine.filter(t=>t.status==='open');
      const done = mine.filter(t=>t.status==='done');
      screen.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),kid.emoji+' '+kid.name]));
      screen.push(el('div',{class:'card compact'},[
        ...(open.length===0
          ? [el('div',{class:'mission-empty'},[el('span',{},['\u2B50']), el('span',{},['H\u00f4m nay con ch\u01b0a c\u00f3 nhi\u1ec7m v\u1ee5 n\u00e0o.'])])]
          : open.map(t=>missionCard(state, nav, t, ()=>nav('missions')))),
        ...(done.length ? [el('div',{class:'mission-done-head'},['\u2713 \u0110\u00e3 xong']), ...done.slice(0,3).map(t=>missionCard(state, nav, t, ()=>nav('missions')))] : []),
        el('button',{class:'btn btn-soft',style:'width:100%;margin-top:10px;padding:12px;font-size:13.5px',onclick:()=>openMissionSheet(state, nav, kid, null, ()=>nav('missions'))},[
          '+ Th\u00eam nhi\u1ec7m v\u1ee5 cho '+kid.name
        ])
      ]));
    });
    return screen;
  };

  function missionCard(state, nav, t, onChange){
    const cat = HF.categoryById(t.cat);
    const planner = t.planner ? HF.memberById(t.planner) : null;
    const done = t.status==='done';
    return el('div',{class:'mission-card'+(done?' done':''),onclick:()=>openMissionSheet(state, nav, null, t, onChange)},[
      el('div',{style:'display:flex;align-items:center;gap:10px;width:100%'},[
        el('span',{class:'mission-ico',style:'background:'+cat.soft},[cat.emoji]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'mission-title'},[t.title]),
          el('div',{class:'mission-meta'},[(planner?'\u{1F9E0} '+planner.short+' lo \u00b7 ':'')+HF.formatDay(t.due)+(t.time?' \u00b7 '+t.time:'')])
        ]),
        el('button',{class:'icon-btn',style:'color:var(--primary-deep)',onclick:(e)=>{e.stopPropagation(); openMissionSheet(state, nav, null, t, onChange);}},[
          '\u270F\uFE0F'
        ]),
        el('button',{class:'icon-btn',style:'color:var(--danger)',onclick:(e)=>{e.stopPropagation(); confirmDeleteMission(state, nav, t, onChange);}},[
          '\u{1F5D1}\uFE0F'
        ])
      ]),
      t.note ? el('div',{class:'mission-note'},['\u{1F4DD} '+t.note]) : null,
      done
        ? el('div',{class:'mission-done-line'},['\u2713 Xong r\u1ed3i! \u2B50'])
        : el('div',{style:'display:flex;flex-direction:column;gap:8px;margin-top:10px'},[
            el('div',{class:'mission-journey'},[
              el('span',{class:'mj on'},['NH\u1eda']),
              el('span',{class:'mj-arrow'},['\u2192']),
              el('span',{class:'mj on'},['CHU\u1EA8N B\u1ECA']),
              el('span',{class:'mj-arrow'},['\u2192']),
              el('span',{class:'mj'},['\u0110\u00c3 XONG'])
            ]),
            el('button',{class:'mission-done-btn',onclick:(e)=>{e.stopPropagation(); completeMission(state, nav, t, onChange);}},[
              '\u2713 Xong r\u1ed3i! \u2B50'
            ])
          ])
    ]);
  }

  function completeMission(state, nav, t, onChange){
    t.status='done';
    t.doneAt=new Date();
    HF.saveState(state);
    HF.confetti();
    HF.toast('Xong r\u1ed3i! \u2B50 +1','\u{1F389}');
    onChange();
  }

  function confirmDeleteMission(state, nav, t, onChange){
    HF.confirmDelete({
      head:'X\u00f3a nhi\u1ec7m v\u1ee5?',
      title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+t.title+'\u201d?',
      message:'Nhi\u1ec7m v\u1ee5 n\u00e0y s\u1ebd b\u1ecb x\u00f3a v\u0129nh vi\u1ec5n kh\u1ecfi HomeFlow.',
      onConfirm:()=>{
        HF.deleteTask(state, t.id);
        HF.toast('\u0110\u00e3 x\u00f3a nhi\u1ec7m v\u1ee5','\u{1F5D1}\uFE0F');
        onChange();
      }
    });
  }

  function openMissionSheet(state, nav, kid, mission, onChange){
    const isEdit = !!mission;
    const m = mission ? Object.assign({}, mission) : {title:'', cat:'home', due:HF.dayOffset(1), note:''};
    const EXAMPLES = [
      ['\u{1F392}','T\u1ef1 chu\u1ea9n b\u1ecb c\u1eb7p'],
      ['\u{1F331}','T\u01b0\u1edbi c\u00e2y'],
      ['\u{1F9F8}','Thu d\u1ecdn \u0111\u1ed3 ch\u01a1i'],
      ['\u{1F37D}\uFE0F','Gi\u00fap chu\u1ea9n b\u1ecb b\u00e0n \u0103n'],
      ['\u{1F4DA}','S\u1eafp x\u1ebfp s\u00e1ch'],
      ['\u{1F9FA}','Chu\u1ea9n b\u1ecb qu\u1ea7n \u00e1o']
    ];
    const title = el('input',{class:'input',value:m.title,placeholder:'VD: T\u1ef1 chu\u1ea9n b\u1ecb c\u1eb7p'});
    const kidSel = el('select',{class:'input'});
    HF.MEMBERS.filter(x=>x.kind==='kid').forEach(k=>kidSel.appendChild(el('option',{value:k.id},[k.emoji+' '+k.name])));
    kidSel.value = m.owner || (kid?kid.id:'');
    const dateSel = HF.dateSelect(m.due, ()=>{});
    const catSel = el('select',{class:'input'});
    ['home','kids','school'].forEach(k=>catSel.appendChild(el('option',{value:k},[HF.CATEGORIES[k].emoji+' '+HF.CATEGORIES[k].label])));
    catSel.value = m.cat||'home';
    const note = el('input',{class:'input',value:m.note||'',placeholder:'Con c\u1ea7n chu\u1ea9n b\u1ecb g\u00ec? (t\u00f9y ch\u1ecdn)'});
    const exampleChips = el('div',{class:'example-chips'}, EXAMPLES.map(([ico,lbl])=>{
      return el('button',{class:'example-chip',onclick:()=>{ title.value=lbl; title.focus(); }},[ico+' '+lbl]);
    }));

    const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
      el('div',{class:'rs-field'},[el('span',{},['T\u00ean nhi\u1ec7m v\u1ee5']), title]),
      el('div',{style:'font-size:11px;color:var(--muted);font-weight:600'},['G\u1ee3i \u00fd:']),
      exampleChips,
      el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
        el('div',{class:'rs-field'},[el('span',{},['\u25CF Ng\u01b0\u1eddi th\u1ef1c hi\u1ec7n']), kidSel]),
        el('div',{class:'rs-field'},[el('span',{},['Ng\u00e0y']), dateSel])
      ]),
      el('div',{class:'rs-field'},[el('span',{},['Danh m\u1ee5c']), catSel]),
      el('div',{class:'rs-field'},[el('span',{},['Ghi ch\u00fa']), note]),
      el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
        isEdit ? el('button',{class:'btn btn-danger',style:'flex:0.8;padding:13px 10px;font-size:13.5px'},['\u{1F5D1}\uFE0F X\u00f3a']) : null,
        el('button',{class:'btn btn-primary',style:'flex:1.6;padding:13px 10px;font-size:13.5px'},['\u{1F4BE} L\u01b0u nhi\u1ec7m v\u1ee5'])
      ])
    ]);
    const sheet = HF.sheet({title:isEdit?'S\u1eeda nhi\u1ec7m v\u1ee5':'Th\u00eam nhi\u1ec7m v\u1ee5 cho con', body:()=>body});

    const delBtn = body.querySelector('.btn-danger');
    if(delBtn){
      delBtn.addEventListener('click', ()=>{
        HF.confirmDelete({
          head:'X\u00f3a nhi\u1ec7m v\u1ee5?',
          title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+m.title+'\u201d?',
          message:'Nhi\u1ec7m v\u1ee5 n\u00e0y s\u1ebd b\u1ecb x\u00f3a v\u0129nh vi\u1ec5n kh\u1ecfi HomeFlow.',
          onConfirm:()=>{
            HF.deleteTask(state, m.id);
            HF.toast('\u0110\u00e3 x\u00f3a nhi\u1ec7m v\u1ee5','\u{1F5D1}\uFE0F');
            onChange();
          }
        });
      });
    }

    const saveBtn = body.querySelector('.btn-primary');
    saveBtn.addEventListener('click', ()=>{
      const n = title.value.trim();
      if(!n){ HF.toast('Nh\u1eadp t\u00ean nhi\u1ec7m v\u1ee5 tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
      const data = {title:n, owner:kidSel.value, due:new Date(dateSel.value), cat:catSel.value, note:note.value.trim()};
      if(isEdit){
        HF.updateTask(state, m.id, data);
        HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt nhi\u1ec7m v\u1ee5','\u270F\uFE0F');
      }else{
        HF.addMission(state, data);
        HF.toast('\u0110\u00e3 th\u00eam nhi\u1ec7m v\u1ee5 cho '+HF.memberById(data.owner).name,'\u2B50');
      }
      sheet.close();
      onChange();
    });
  }

V.Expenses = function(state, nav, filter){
    filter = filter || 'today';
    const cur = state.expenses.currency || 'VND';
    const recs = state.expenses.records || [];
    const CAT_COLORS = ['#8B6FB8','#5B9BD5','#F2A65A','#EF8FA3','#7FA98B','#E8936F','#E05D5D','#6BB5A9'];

    function field(label, control){
      return el('div',{class:'rs-field'},[el('span',{},[label]), control]);
    }

    function periodRange(f){
      const now = new Date();
      if(f==='today'){
        const d0 = HF.dayOffset(0); d0.setHours(0,0,0,0);
        const d1 = new Date(d0); d1.setDate(d1.getDate()+1);
        return {start:d0, end:d1, label:'h\u00f4m nay'};
      }
      if(f==='prev'){
        const y = now.getFullYear(), m = now.getMonth()-1;
        return {start:new Date(y,m,1), end:new Date(y,m+1,1), label:'th\u00e1ng tr\u01b0\u1edbc'};
      }
      const y = now.getFullYear(), m = now.getMonth();
      return {start:new Date(y,m,1), end:new Date(y,m+1,1), label:'th\u00e1ng n\u00e0y'};
    }
    const range = periodRange(filter);
    const inPeriod = r=>{
      const d = new Date(r.date+'T00:00:00');
      return d>=range.start && d<range.end;
    };
    const periodRecs = recs.filter(inPeriod);
    const paid = periodRecs.filter(r=>r.status==='paid');
    const pending = periodRecs.filter(r=>r.status==='pending');
    const totalPaid = paid.reduce((s,r)=>s+(+r.amount||0),0);

    const byCat = {};
    paid.forEach(r=>{
      const id = r.catId||'';
      byCat[id] = (byCat[id]||0) + (+r.amount||0);
    });
    const catRows = Object.keys(byCat).map(id=>({cat:HF.expenseCatById(state,id), amt:byCat[id]})).sort((a,b)=>b.amt-a.amt);
    const maxCat = Math.max(...catRows.map(c=>c.amt), 1);

    function expRow(r){
      const cat = HF.expenseCatById(state, r.catId);
      const m = r.memberId ? HF.memberById(r.memberId) : null;
      return el('div',{class:'exp-row',onclick:()=>openExpenseSheet(state, nav, r)},[
        el('span',{class:'exp-row-ico'},[cat.emoji]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'exp-row-name'},[r.name]),
          el('div',{class:'exp-row-meta'},[(m?m.name+' \u00b7 ':'')+HF.formatDay(new Date(r.date+'T00:00:00'))+(r.note?' \u00b7 '+r.note:'')])
        ]),
        el('div',{style:'text-align:right;flex:none'},[
          el('div',{class:'exp-row-amt'},[HF.fmtMoney(r.amount, cur)]),
          el('div',{class:'exp-row-status '+(r.status==='paid'?'paid':'pending')},[r.status==='paid'?'\u2713 \u0110\u00e3 thanh to\u00e1n':'\u23F3 S\u1eafp thanh to\u00e1n'])
        ])
      ]);
    }

    const segBar = el('div',{class:'seg'}, [['today','H\u00f4m nay'],['month','Th\u00e1ng n\u00e0y'],['prev','Th\u00e1ng tr\u01b0\u1edbc']].map(([id,lbl])=>{
      return el('button',{class:filter===id?'active':'',onclick:()=>nav('expenses',{filter:id})},[lbl]);
    }));

    const screen = [
      el('div',{},[
        el('div',{class:'eyebrow'},['Chi ti\u00eau gia \u0111\u00ecnh']),
        el('h1',{class:'page-title',style:'margin-top:4px'},['\u{1F4B0} Chi ph\u00ed']),
        el('div',{class:'sub'},['C\u00f9ng nh\u00ecn l\u1ea1i \u2014 c\u00f9ng nhau hi\u1ec3u chi ti\u00eau c\u1ee7a c\u1ea3 nh\u00e0'])
      ]),
      segBar,
      el('div',{class:'card compact exp-summary'},[
        el('div',{class:'exp-sum-label'},['T\u1ed5ng chi '+range.label]),
        el('div',{class:'exp-sum-amount'},[HF.fmtMoney(totalPaid, cur)]),
        el('div',{class:'exp-sum-sub'},[paid.length+' kho\u1ea3n \u0111\u00e3 thanh to\u00e1n'+(pending.length?' \u00b7 '+pending.length+' kho\u1ea3n s\u1eafp thanh to\u00e1n':'')])
      ])
    ];

    if(catRows.length){
      screen.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Chi theo danh m\u1ee5c']));
      screen.push(el('div',{class:'card compact'}, catRows.map((c,i)=>{
        return el('div',{class:'exp-cat'},[
          el('span',{class:'exp-cat-ico'},[c.cat.emoji]),
          el('div',{style:'flex:1;min-width:0'},[
            el('div',{style:'display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:4px'},[
              el('span',{},[c.cat.name]),
              el('span',{},[HF.fmtMoney(c.amt, cur)])
            ]),
            el('div',{class:'exp-cat-track'},[el('div',{class:'exp-cat-fill',style:`width:${Math.round(c.amt/maxCat*100)}%;background:${CAT_COLORS[i%CAT_COLORS.length]}`})])
          ])
        ]);
      })));
    }

    if(pending.length){
      screen.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'S\u1eafp thanh to\u00e1n']));
      screen.push(el('div',{class:'card compact'}, pending.map(r=>expRow(r))));
    }

    screen.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'\u0110\u00e3 thanh to\u00e1n']));
    screen.push(el('div',{class:'card compact'}, periodRecs.length===0
      ? el('div',{class:'brief-empty'},['Ch\u01b0a c\u00f3 kho\u1ea3n chi n\u00e0o trong '+range.label+' \u2014 th\u00eam kho\u1ea3n \u0111\u1ea7u ti\u00ean nh\u00e9'])
      : paid.map(r=>expRow(r))));

    screen.push(el('div',{style:'margin-top:16px'},
      el('button',{class:'btn btn-soft',style:'width:100%;padding:13px;font-size:13.5px',onclick:()=>openExpenseSheet(state, nav, null)},[
        '+ Th\u00eam kho\u1ea3n chi'
      ])));

    return screen;
  };

  function openExpenseSheet(state, nav, exp){
    const isEdit = !!exp;
    const e = exp ? Object.assign({}, exp) : {
      name:'', amount:'', date:HF.isoDate(new Date()),
      catId:(state.expenses.categories[0]||{}).id||'', memberId:'', status:'paid', note:''
    };
    const cur = state.expenses.currency || 'VND';
    const name = el('input',{class:'input',value:e.name,placeholder:'VD: H\u1ecdc ph\u00ed ti\u1ebfng Anh'});
    const amount = el('input',{class:'input',type:'number',min:'0',step:'1000',value:e.amount,placeholder:'VD: 1500000'});
    const date = el('input',{class:'input',type:'date',value:e.date});
    const catSel = el('select',{class:'input'});
    (state.expenses.categories||[]).forEach(c=>catSel.appendChild(el('option',{value:c.id},[c.emoji+' '+c.name])));
    catSel.value = e.catId;
    const memberSel = el('select',{class:'input'});
    memberSel.appendChild(el('option',{value:''},['\u2014 Kh\u00f4ng ch\u1ecdn']));
    HF.MEMBERS.forEach(m=>memberSel.appendChild(el('option',{value:m.id},[m.emoji+' '+m.name])));
    memberSel.value = e.memberId||'';
    const note = el('input',{class:'input',value:e.note||'',placeholder:'Ghi ch\u00fa (t\u00f9y ch\u1ecdn)'});
    const statusBtns = [['paid','\u2713 \u0110\u00e3 thanh to\u00e1n'],['pending','\u23F3 S\u1eafp thanh to\u00e1n']].map(([id,lbl])=>{
      const b = el('button',{class:'exp-status-btn'+(e.status===id?' on':''),onclick:()=>{
        e.status=id;
        statusBtns.forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
      }},[lbl]);
      return b;
    });

    const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
      el('div',{class:'rs-field'},[el('span',{},['T\u00ean kho\u1ea3n chi']), name]),
      el('div',{style:'display:grid;grid-template-columns:1fr 1fr;gap:12px'},[
        el('div',{class:'rs-field'},[el('span',{},['S\u1ed1 ti\u1ec1n ('+cur+')']), amount]),
        el('div',{class:'rs-field'},[el('span',{},['Ng\u00e0y']), date])
      ]),
      el('div',{class:'rs-field'},[el('span',{},['Danh m\u1ee5c']), catSel]),
      el('div',{class:'rs-field'},[el('span',{},['Th\u00e0nh vi\u00ean li\u00ean quan']), memberSel]),
      el('div',{class:'rs-field'},[el('span',{},['Tr\u1ea1ng th\u00e1i']), el('div',{class:'exp-status-row'},statusBtns)]),
      el('div',{class:'rs-field'},[el('span',{},['Ghi ch\u00fa']), note]),
      el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
        isEdit ? el('button',{class:'btn btn-danger',style:'flex:0.8;padding:13px 10px;font-size:13.5px'},['\u{1F5D1}\uFE0F X\u00f3a']) : null,
        el('button',{class:'btn btn-primary',style:'flex:1.6;padding:13px 10px;font-size:13.5px'},['\u{1F4BE} L\u01b0u kho\u1ea3n chi'])
      ])
    ]);
    const sheet = HF.sheet({title:isEdit?'Ch\u1ec9nh s\u1eeda kho\u1ea3n chi':'Th\u00eam kho\u1ea3n chi', body:()=>body});

    const delBtn = body.querySelector('.btn-danger');
    if(delBtn){
      delBtn.addEventListener('click', ()=>{
        HF.confirmDelete({
          head:'X\u00f3a kho\u1ea3n chi?',
          title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+e.name+'\u201d?',
          message:'Kho\u1ea3n chi n\u00e0y s\u1ebd b\u1ecb x\u00f3a v\u0129nh vi\u1ec5n kh\u1ecfi HomeFlow.',
          onConfirm:()=>{
            HF.deleteExpense(state, e.id);
            HF.toast('\u0110\u00e3 x\u00f3a kho\u1ea3n chi','\u{1F5D1}\uFE0F');
            nav('expenses',{filter:location.hash.includes('filter=')?location.hash.split('filter=')[1]:'today'});
          }
        });
      });
    }

    const saveBtn = body.querySelector('.btn-primary');
    saveBtn.addEventListener('click', ()=>{
      const n = name.value.trim();
      const amt = parseFloat(amount.value);
      if(!n){ HF.toast('Nh\u1eadp t\u00ean kho\u1ea3n chi tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
      if(isNaN(amt)||amt<=0){ HF.toast('Nh\u1eadp s\u1ed1 ti\u1ec1n h\u1ee3p l\u1ec7','\u{1F914}'); return; }
      if(!date.value){ HF.toast('Ch\u1ecdn ng\u00e0y tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
      const data = {
        name:n, amount:Math.round(amt), date:date.value,
        catId:catSel.value, memberId:memberSel.value||'',
        status:e.status, note:note.value.trim()
      };
      if(isEdit){
        HF.updateExpense(state, e.id, data);
        HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt kho\u1ea3n chi','\u270F\uFE0F');
      }else{
        HF.addExpense(state, data);
        HF.toast('\u0110\u00e3 th\u00eam kho\u1ea3n chi','\u{1F4B0}');
      }
      sheet.close();
      nav('expenses',{filter:location.hash.includes('filter=')?location.hash.split('filter=')[1]:'today'});
    });
  }

V.Settings = function(state, nav, params){
    params = params||{};
    const path = params.path||[];
    const root = el('div',{});
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

      if(HF.auth && HF.auth.mode!=='off' && HF.auth.user){
        const u = HF.auth.user;
        const hh = HF.db && HF.db.household;
        s.push(el('div',{class:'card compact'},[
          el('div',{class:'set-head'},[
            el('span',{class:'set-ico'},[u.avatar ? el('img',{src:u.avatar,style:'width:34px;height:34px;border-radius:50%',alt:''}) : '\u{1F464}']),
            el('div',{style:'flex:1;min-width:0'},[
              el('div',{class:'set-t'},['T\u00e0i kho\u1ea3n']),
              el('div',{class:'set-s',style:'overflow-wrap:anywhere'},[u.name+(u.email?' \u00b7 '+u.email:'')]),
              hh ? el('div',{class:'set-s',style:'margin-top:3px'},['\u{1F3E0} '+hh.name+' \u00b7 '+(hh.role==='owner'?'Ch\u1ee7 gia \u0111\u00ecnh':'Th\u00e0nh vi\u00ean')]) : null
            ])
          ]),
          el('button',{class:'btn btn-ghost',style:'width:100%;margin-top:10px;color:var(--danger)',onclick:()=>{
            HF.confirmDelete({
              head:'\u0110\u0103ng xu\u1ea5t?',
              title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n \u0111\u0103ng xu\u1ea5t kh\u1ecfi HomeFlow?',
              message:'B\u1ea1n s\u1ebd c\u1ea7n \u0111\u0103ng nh\u1eadp l\u1ea1i b\u1eb1ng Google \u0111\u1ec3 ti\u1ebfp t\u1ee5c.',
              confirmLabel:'\u0110\u0103ng xu\u1ea5t',
              onConfirm:()=>HF.auth.signOut()
            });
          }},['\u{1F6AA} \u0110\u0103ng xu\u1ea5t'])
        ]));
      } else if(HF.auth && HF.auth.mode==='off'){
        s.push(el('div',{class:'card compact'},[
          el('div',{class:'set-head'},[
            el('span',{class:'set-ico'},['\u{1F527}']),
            el('div',{style:'flex:1;min-width:0'},[
              el('div',{class:'set-t'},['\u0110\u0103ng nh\u1eadp']),
              el('div',{class:'set-s'},['\u0110\u0103ng nh\u1eadp ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5u h\u00ecnh cho m\u00f4i tr\u01b0\u1eddng n\u00e0y.'])
            ])
          ]),
          el('div',{class:'set-s',style:'margin-top:8px'},['Thi\u1ebft l\u1eadp SUPABASE_URL v\u00e0 SUPABASE_ANON_KEY \u0111\u1ec3 b\u1eadt \u0111\u0103ng nh\u1eadp Google.'])
        ]));
      }

      s.push(el('div',{class:'card compact set-menu'},[
        menuRow('\u{1F4CB}','Vi\u1ec7c nh\u00e0','Ch\u1ec9nh s\u1eeda, x\u00f3a vi\u1ec7c', ()=>nav('settings',{path:['tasks']})),
        menuRow('\u{1F46B}','Gia \u0111\u00ecnh & Th\u00e0nh vi\u00ean','T\u00ean gia \u0111\u00ecnh, th\u00e0nh vi\u00ean, h\u1ed3 s\u01a1 con', ()=>nav('settings',{path:['family']})),
        menuRow('\u{1F514}','Nh\u1eafc vi\u1ec7c','Nh\u1eafc vi\u1ec7c, h\u00f3a \u0111\u01a1n, b\u1ea3n tin tu\u1ea7n', ()=>nav('settings',{path:['reminders']})),
        menuRow('\u{1F5D3}\uFE0F','L\u1ecbch & Hi\u1ec3n th\u1ecb','View l\u1ecbch, ng\u00e0y \u0111\u1ea7u tu\u1ea7n, hi\u1ec3n th\u1ecb', ()=>nav('settings',{path:['display']})),
        menuRow('\u{1F4B0}','Chi ph\u00ed','Ti\u1ec1n t\u1ec7, danh m\u1ee5c chi ph\u00ed', ()=>nav('settings',{path:['expenses']})),
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
      HF.confirmDelete({
        head:'X\u00f3a vi\u1ec7c n\u00e0y?',
        title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+t.title+'\u201d?',
        message:'Vi\u1ec7c n\u00e0y s\u1ebd b\u1ecb x\u00f3a v\u0129nh vi\u1ec5n kh\u1ecfi HomeFlow.',
        onConfirm:()=>{
          HF.deleteTask(state, t.id);
          HF.toast('\u0110\u00e3 x\u00f3a vi\u1ec7c','\u{1F5D1}\uFE0F');
          rerender();
        }
      });
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
        HF.confirmDelete({
          head:'X\u00f3a vi\u1ec7c n\u00e0y?',
          title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+draft.title+'\u201d?',
          message:'Vi\u1ec7c n\u00e0y s\u1ebd b\u1ecb x\u00f3a v\u0129nh vi\u1ec5n kh\u1ecfi HomeFlow.',
          onConfirm:()=>{
            HF.deleteTask(state, draft.id);
            HF.toast('\u0110\u00e3 x\u00f3a vi\u1ec7c','\u{1F5D1}\uFE0F');
            rerender();
          }
        });
      });

      const saveBtn = body.querySelector('.btn-primary');
      saveBtn.addEventListener('click', ()=>{
        const nt = title.value.trim();
        if(!nt){ HF.toast('Nh\u1eadp t\u00ean vi\u1ec7c tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        const patch = {
          title: nt,
          cat: catSel.value,
          due: draft.due,
          time: time.value||'',
          planner: draft.planner,
          owner: doerSel.value==='__shared__' ? draft.owner : doerSel.value,
          shared: doerSel.value==='__shared__'
        };
        const doSave = ()=>{
          HF.updateTask(state, draft.id, patch);
          HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt vi\u1ec7c','\u270F\uFE0F');
          sheet.close();
          rerender();
        };
        const past = HF.isPastDate(patch.due);
        const conflict = HF.timeConflict(state, Object.assign({id:draft.id}, patch));
        if(past || conflict){
          const msgs = [];
          if(past) msgs.push('Ng\u00e0y n\u00e0y \u0111\u00e3 qua ('+HF.formatDay(patch.due)+')');
          if(conflict) msgs.push('\u0110\u00e3 c\u00f3 vi\u1ec7c \u201c'+conflict.title+'\u201d v\u00e0o '+conflict.time+' h\u00f4m \u0111\u00f3');
          HF.confirmIssue({
            head: past&&conflict ? 'C\u00f3 v\u1ebb ch\u01b0a \u1ed5n' : (past ? 'Ng\u00e0y \u0111\u00e3 qua' : 'Gi\u1edd b\u1ecb tr\u00f9ng'),
            title: msgs.join('. ')+'.',
            note: conflict
              ? 'Vui l\u00f2ng ch\u1ec9nh s\u1eeda l\u1ea1i ng\u00e0y/gi\u1edd \u0111\u1ec3 tr\u00e1nh tr\u00f9ng.'
              : 'B\u1ea1n c\u00f3 mu\u1ed1n \u0111\u1ed5i ng\u00e0y kh\u00f4ng?',
            mode: conflict ? 'edit' : 'confirm',
            onChange: ()=>{ HF.toast('Ch\u1ecdn ng\u00e0y kh\u00e1c nh\u00e9','\u{1F5D3}\uFE0F'); },
            onEdit: ()=>{ HF.toast('Ch\u1ecdn ng\u00e0y/gi\u1edd kh\u00e1c nh\u00e9','\u{1F5D3}\uFE0F'); },
            onKeep: doSave
          });
          return;
        }
        doSave();
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
      const taskCount = state.tasks.filter(t=>t.owner===m.id || t.planner===m.id).length;
      const notes = [];
      if(taskCount>0) notes.push(taskCount+' vi\u1ec7c \u0111ang li\u00ean quan s\u1ebd \u0111\u01b0\u1ee3c chuy\u1ec3n cho M\u1eb9.');
      if(m.kind==='kid') notes.push('L\u1ecbch s\u1eed s\u1ee9c kh\u1ecfe, h\u1ecdc t\u1eadp v\u00e0 ch\u1ec9 s\u1ed1 ph\u00e1t tri\u1ec3n c\u1ee7a '+m.name+' s\u1ebd b\u1ecb x\u00f3a.');
      HF.confirmDelete({
        head:'X\u00f3a th\u00e0nh vi\u00ean?',
        title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+m.name+'\u201d?',
        message:'Th\u00e0nh vi\u00ean n\u00e0y s\u1ebd b\u1ecb x\u00f3a kh\u1ecfi gia \u0111\u00ecnh.',
        note: notes.join(' '),
        onConfirm:()=>{
          HF.removeMember(m.id, state);
          HF.toast('\u0110\u00e3 x\u00f3a '+m.name,'\u{1F5D1}\uFE0F');
          rerender();
        }
      });
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
    function missionsTab(kid){
      const s = [];
      const mine = state.tasks.filter(t=>t.owner===kid.id)
        .sort((a,b)=>(a.status==='done')-(b.status==='done') || new Date(a.due)-new Date(b.due));
      const open = mine.filter(t=>t.status==='open');
      const done = mine.filter(t=>t.status==='done');
      s.push(el('div',{class:'card compact'},[
        ...(open.length===0
          ? [el('div',{class:'mission-empty'},[el('span',{},['\u2B50']), el('span',{},['H\u00f4m nay con ch\u01b0a c\u00f3 nhi\u1ec7m v\u1ee5 n\u00e0o.'])])]
          : open.map(t=>missionCard(state, nav, t, ()=>rerender()))),
        ...(done.length ? [el('div',{class:'mission-done-head'},['\u2713 \u0110\u00e3 xong']), ...done.slice(0,3).map(t=>missionCard(state, nav, t, ()=>rerender()))] : []),
        el('button',{class:'btn btn-soft',style:'width:100%;margin-top:10px;padding:12px;font-size:13.5px',onclick:()=>openMissionSheet(state, nav, kid, null, ()=>rerender())},[
          '+ Th\u00eam nhi\u1ec7m v\u1ee5 cho '+kid.name
        ])
      ]));
      return s;
    }

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
            HF.confirmDelete({
              head:'X\u00f3a ghi ch\u00fa?',
              title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+r.title+'\u201d?',
              message:'Ghi ch\u00fa n\u00e0y s\u1ebd b\u1ecb x\u00f3a v\u0129nh vi\u1ec5n kh\u1ecfi l\u1ecbch s\u1eed.',
              onConfirm:()=>{
                HF.deleteHistory(state, type, r.id);
                HF.toast('\u0110\u00e3 x\u00f3a ghi ch\u00fa','\u{1F5D1}\uFE0F');
                rerender();
              }
            });
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
          HF.confirmDelete({
            head:'X\u00f3a ch\u1ec9 s\u1ed1?',
            title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a ch\u1ec9 s\u1ed1 ng\u00e0y '+fmtDate(rec.date)+'?',
            message:'Ch\u1ec9 s\u1ed1 n\u00e0y s\u1ebd b\u1ecb x\u00f3a kh\u1ecfi l\u1ecbch s\u1eed ph\u00e1t tri\u1ec3n.',
            onConfirm:()=>{
              HF.deleteGrowth(state, rec.id);
              HF.toast('\u0110\u00e3 x\u00f3a ch\u1ec9 s\u1ed1','\u{1F5D1}\uFE0F');
              rerender();
            }
          });
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
      HF.confirmDelete({
        head:'X\u00f3a ch\u1ec9 s\u1ed1?',
        title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a ch\u1ec9 s\u1ed1 ng\u00e0y '+fmtDate(rec.date)+'?',
        message:'Ch\u1ec9 s\u1ed1 n\u00e0y s\u1ebd b\u1ecb x\u00f3a kh\u1ecfi l\u1ecbch s\u1eed ph\u00e1t tri\u1ec3n.',
        onConfirm:()=>{
          HF.deleteGrowth(state, rec.id);
          HF.toast('\u0110\u00e3 x\u00f3a ch\u1ec9 s\u1ed1','\u{1F5D1}\uFE0F');
          rerender();
        }
      });
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
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'profile-name'},[kid.name]),
          el('div',{class:'profile-sub'},[(kid.role||'Con')+(kid.dob?' \u00b7 '+ageFrom(kid.dob):'')])
        ])
      ]));

      const tabs = el('div',{class:'prof-tabs'},[
        ['overview','\u{1F464} T\u1ed5ng quan'],
        ['growth','\u{1F4C8} Ph\u00e1t tri\u1ec3n'],
        ['health','\u{1FA7A} S\u1ee9c kh\u1ecfe'],
        ['study','\u{1F392} H\u1ecdc t\u1eadp'],
        ['missions','\u2B50 Nhi\u1ec7m v\u1ee5']
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
      }else if(profileTab==='missions'){
        s.push(...missionsTab(kid));
      }

      return s;
    }

    function buildData(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['D\u1eef li\u1ec7u & Quy\u1ec1n ri\u00eang t\u01b0']));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'D\u1eef li\u1ec7u HomeFlow l\u01b0u g\u00ec']));
      const stored = [
        ['\u{1F4CB}','Vi\u1ec7c nh\u00e0 & ph\u00e2n c\u00f4ng','Ti\u00eau \u0111\u1ec1, ng\u00e0y gi\u1edd, ng\u01b0\u1eddi lo & ng\u01b0\u1eddi l\u00e0m, tr\u1ea1ng th\u00e1i'],
        ['\u{1F46B}','Th\u00e0nh vi\u00ean','T\u00ean, ng\u00e0y sinh, vai tr\u00f2, gi\u1edbi t\u00ednh, \u1ea3nh \u0111\u1ea1i di\u1ec7n'],
        ['\u{1FA7A}','L\u1ecbch s\u1eed s\u1ee9c kh\u1ecfe & h\u1ecdc t\u1eadp c\u1ee7a con','C\u00e1c b\u1ea3n ghi do gia \u0111\u00ecnh nh\u1eadp'],
        ['\u{1F4C8}','Ch\u1ec9 s\u1ed1 ph\u00e1t tri\u1ec3n','Chi\u1ec1u cao, c\u00e2n n\u1eb7ng theo th\u1eddi gian'],
        ['\u{1F4B0}','C\u1ea5u h\u00ecnh chi ph\u00ed','Ti\u1ec1n t\u1ec7, danh m\u1ee5c chi ph\u00ed'],
        ['\u2699\uFE0F','C\u00e0i \u0111\u1eb7t kh\u00e1c','T\u00ean gia \u0111\u00ecnh, t\u00f9y ch\u1ecdn hi\u1ec3n th\u1ecb, ph\u1ea3n h\u1ed3i']
      ];
      s.push(el('div',{class:'card compact'},[
        ...stored.map(([ico,lbl,sub])=>{
          return el('div',{class:'pref-row'},[
            el('span',{style:'font-size:17px;width:30px;text-align:center;flex:none'},[ico]),
            el('div',{style:'flex:1;min-width:0'},[
              el('div',{class:'set-row-t'},[lbl]),
              el('div',{class:'set-row-s'},[sub])
            ])
          ]);
        }),
        el('div',{style:'font-size:11.5px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px dashed var(--hairline);line-height:1.6'},[
          'T\u1ea5t c\u1ea3 d\u1eef li\u1ec7u \u0111\u01b0\u1ee3c l\u01b0u ngay tr\u00ean thi\u1ebft b\u1ecb n\u00e0y (tr\u00ecnh duy\u1ec7t) \u2014 kh\u00f4ng g\u1eedi l\u00ean m\u00e1y ch\u1ee7 n\u00e0o, kh\u00f4ng c\u00f3 t\u00e0i kho\u1ea3n hay \u0111\u1ed3ng b\u1ed9 \u0111\u00e1m m\u00e2y. N\u1ebfu x\u00f3a d\u1eef li\u1ec7u tr\u00ecnh duy\u1ec7t ho\u1eb7c m\u1edf tr\u00ean thi\u1ebft b\u1ecb kh\u00e1c, d\u1eef li\u1ec7u s\u1ebd kh\u00f4ng c\u00f2n.'
        ])
      ]));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Qu\u1ea3n l\u00fd d\u1eef li\u1ec7u']));
      const resetBtn = el('button',{class:'btn btn-danger',style:'width:100%;padding:12px'},['\u21BA Reset d\u1eef li\u1ec7u HomeFlow']);
      resetBtn.addEventListener('click', ()=>openResetConfirm());
      s.push(el('div',{class:'card compact'},[
        el('div',{style:'font-size:12.5px;font-weight:700'},['Reset d\u1eef li\u1ec7u HomeFlow']),
        el('div',{style:'font-size:11.5px;color:var(--muted);margin:5px 0 12px;line-height:1.5'},['\u0110\u01b0a HomeFlow v\u1ec1 b\u1ed9 d\u1eef li\u1ec7u demo ban \u0111\u1ea7u \u2014 d\u00f9ng khi tr\u00ecnh di\u1ec5n ho\u1eb7c mu\u1ed1n b\u1eaft \u0111\u1ea7u l\u1ea1i.']),
        resetBtn,
        el('div',{style:'font-size:11px;color:var(--muted);margin-top:12px;padding-top:10px;border-top:1px dashed var(--hairline);line-height:1.6'},[
          '\u201cX\u00f3a d\u1eef li\u1ec7u c\u1ee7a t\u00f4i\u201d s\u1ebd c\u00f3 khi t\u00e0i kho\u1ea3n v\u00e0 m\u00e1y ch\u1ee7 ra m\u1eaft \u2014 hi\u1ec7n t\u1ea1i m\u1ecdi d\u1eef li\u1ec7u ch\u1ec9 n\u1eb1m tr\u00ean thi\u1ebft b\u1ecb c\u1ee7a b\u1ea1n.'
        ])
      ]));
      return s;
    }

    function openResetConfirm(){
      const body = el('div',{style:'display:flex;flex-direction:column;gap:14px'},[
        el('div',{style:'font-size:13.5px;font-weight:800'},['B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n reset d\u1eef li\u1ec7u HomeFlow?']),
        el('div',{style:'font-size:12.5px;color:var(--muted);line-height:1.6'},[
          'To\u00e0n b\u1ed9 vi\u1ec7c nh\u00e0, l\u1ecbch s\u1eed s\u1ee9c kh\u1ecfe & h\u1ecdc t\u1eadp, ch\u1ec9 s\u1ed1 ph\u00e1t tri\u1ec3n, th\u00e0nh vi\u00ean m\u1edbi, c\u1ea5u h\u00ecnh chi ph\u00ed v\u00e0 c\u00e0i \u0111\u1eb7t s\u1ebd \u0111\u01b0\u1ee3c \u0111\u1eb7t l\u1ea1i v\u1ec1 b\u1ed9 d\u1eef li\u1ec7u demo ban \u0111\u1ea7u.'
        ]),
        el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
          el('button',{class:'btn btn-ghost',style:'flex:1;padding:13px 10px;font-size:13.5px'},['H\u1ee7y']),
          el('button',{class:'btn btn-danger',style:'flex:1.2;padding:13px 10px;font-size:13.5px'},['\u21BA Reset d\u1eef li\u1ec7u'])
        ])
      ]);
      const sheet = HF.sheet({title:'Reset d\u1eef li\u1ec7u?', body:()=>body});
      body.querySelector('.btn-ghost').addEventListener('click', ()=>sheet.close());
      body.querySelector('.btn-danger').addEventListener('click', ()=>{
        HF.resetState();
        location.reload();
      });
    }

function buildHelp(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['Tr\u1ee3 gi\u00fap & Ph\u1ea3n h\u1ed3i']));
      s.push(el('div',{class:'sub'},['Hi\u1ec3u HomeFlow trong 2 ph\u00fat \u2014 kh\u00f4ng c\u1ea7n ai ng\u1ed3i c\u1ea1nh']));

      function topic(ico, title, content){
        const box = el('div',{class:'help-a',style:'display:none'},content);
        const row = el('div',{class:'faq-q',onclick:()=>{
          const open = box.style.display!=='none';
          box.style.display = open ? 'none' : 'block';
          row.classList.toggle('open', !open);
        }},[
          el('span',{style:'flex:1'},[ico+' '+title]),
          el('span',{class:'faq-chev'},['\u25BE'])
        ]);
        return el('div',{},[row, box]);
      }

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'B\u1eaft \u0111\u1ea7u']));
      s.push(el('div',{class:'card compact'},[
        topic('\u{1F680}','B\u1eaft \u0111\u1ea7u v\u1edbi HomeFlow',[
          el('div',{class:'help-a-inner'}, HF.helpItems())
        ]),
        topic('\u25B6\uFE0F','Xem Video Demo',[
          el('div',{class:'help-a-inner'},[
            el('div',{style:'display:flex;gap:10px;align-items:flex-start'},[
              el('span',{style:'font-size:20px'},['\u{1F3AC}']),
              el('div',{style:'flex:1'},[
                el('div',{style:'font-weight:700;font-size:13px'},['Video demo ch\u01b0a c\u00f3 trong phi\u00ean b\u1ea3n n\u00e0y']),
                el('div',{style:'font-size:12px;color:var(--muted);margin-top:2px;line-height:1.5'},['B\u1ea1n v\u1eabn c\u00f3 th\u1ec3 t\u1ef1 kh\u00e1m ph\u00e1 qua c\u00e1c m\u1ee5c h\u01b0\u1edbng d\u1eabn b\u00ean d\u01b0\u1edbi \u2014 m\u1ed7i m\u1ee5c ch\u1ec9 m\u1ea5t 30 gi\u00e2y.'])
              ])
            ])
          ])
        ]),
        topic('\u2728','C\u00e1ch d\u00f9ng \u201cN\u00f3i v\u1edbi HomeFlow\u201d',[
          el('div',{class:'help-a-inner'},[
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['1']),'B\u1ea5m n\u00fat \u{1F9E0} gi\u1eefa thanh \u0111i\u1ec1u h\u01b0\u1edbng']),
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['2']),'K\u1ec3 vi\u1ec7c b\u1eb1ng l\u1eddi t\u1ef1 nhi\u00ean']),
            el('div',{class:'help-ex'},['\u201cTh\u1ee9 7 Bin h\u1ecdc ti\u1ebfng Anh l\u00fac 9h, b\u1ed1 \u0111\u01b0a con \u0111i\u201d']),
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['3']),'HomeFlow t\u1ef1 hi\u1ec3u ng\u00e0y gi\u1edd, ph\u00e2n c\u00f4ng ng\u01b0\u1eddi lo v\u00e0 ng\u01b0\u1eddi l\u00e0m']),
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['4']),'B\u1ea5m \u201cTh\u00eam v\u00e0o HomeFlow\u201d \u2014 xong!'])
          ])
        ]),
        topic('\u{1F9E0}','Planning Owner l\u00e0 g\u00ec?',[
          el('div',{class:'help-a-inner'},[
            el('div',{class:'help-roles'},[
              el('div',{class:'role-block role-plan'},[
                el('div',{class:'role-label'},['\u{1F9E0} PLANNING OWNER']),
                el('div',{class:'role-name help-role-name'},['Ng\u01b0\u1eddi nh\u1edb, chu\u1ea9n b\u1ecb, l\u00ean k\u1ebf ho\u1ea1ch ho\u1eb7c \u0111i\u1ec1u ph\u1ed1i.'])
              ]),
              el('div',{class:'role-vs'},['\u2260']),
              el('div',{class:'role-block role-do',style:'background:#8B6FB8'},[
                el('div',{class:'role-label'},['\u25CF TASK OWNER']),
                el('div',{class:'role-name help-role-name'},['Ng\u01b0\u1eddi tr\u1ef1c ti\u1ebfp th\u1ef1c hi\u1ec7n.'])
              ])
            ]),
            el('div',{style:'font-size:12px;color:var(--muted);margin-top:10px;line-height:1.5'},['M\u1ed9t ng\u01b0\u1eddi c\u00f3 th\u1ec3 lo nh\u01b0ng kh\u00f4ng l\u00e0m, ho\u1eb7c l\u00e0m vi\u1ec7c ng\u01b0\u1eddi kh\u00e1c lo \u2014 \u0111\u00f3 l\u00e0 c\u00e1ch HomeFlow chia s\u1ebb g\u00e1nh n\u1eb7ng nh\u1edb vi\u1ec7c c\u1ee7a gia \u0111\u00ecnh.'])
          ])
        ]),
        topic('\u2696\uFE0F','Family Balance ho\u1ea1t \u0111\u1ed9ng th\u1ebf n\u00e0o?',[
          el('div',{class:'help-a-inner'},[
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['1']),'HomeFlow \u0111\u1ebfm vi\u1ec7c \u201clo\u201d v\u00e0 vi\u1ec7c \u201cl\u00e0m\u201d c\u1ee7a t\u1eebng ng\u01b0\u1eddi']),
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['2']),'Khi m\u1ed9t ng\u01b0\u1eddi \u0111ang g\u00e1nh nhi\u1ec1u, HomeFlow g\u1ee3i \u00fd chuy\u1ec3n vi\u1ec7c cho ng\u01b0\u1eddi kh\u00e1c']),
            el('div',{class:'help-step'},[el('span',{class:'help-step-n'},['3']),'B\u1ea5m \u201c\u0110\u1ed3ng \u00fd\u201d \u0111\u1ec3 \u00e1p d\u1ee5ng \u2014 c\u1ea3 nh\u00e0 c\u00e2n b\u1eb1ng h\u01a1n'])
          ])
        ]),
        topic('\u{1F4B0}','Qu\u1ea3n l\u00fd chi ph\u00ed',[
          el('div',{class:'help-a-inner'},[
            el('div',{style:'font-size:12.5px;color:var(--muted);line-height:1.55'},['Trong C\u00e0i \u0111\u1eb7t \u2192 Chi ph\u00ed, b\u1ea1n c\u00f3 th\u1ec3 ch\u1ecdn ti\u1ec1n t\u1ec7 (VND, USD\u2026) v\u00e0 t\u00f9y ch\u1ec9nh danh m\u1ee5c chi ph\u00ed c\u1ee7a gia \u0111\u00ecnh. T\u00ednh n\u0103ng ghi chi ti\u00eau s\u1ebd ra m\u1eaft trong b\u1ea3n c\u1eadp nh\u1eadt t\u1edbi.'])
          ])
        ]),
        topic('\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}','Qu\u1ea3n l\u00fd th\u00e0nh vi\u00ean',[
          el('div',{class:'help-a-inner'},[
            el('div',{style:'font-size:12.5px;color:var(--muted);line-height:1.55'},['Trong C\u00e0i \u0111\u1eb7t \u2192 Gia \u0111\u00ecnh & Th\u00e0nh vi\u00ean, b\u1ea1n th\u00eam/s\u1eeda/x\u00f3a th\u00e0nh vi\u00ean v\u00e0 m\u1edf h\u1ed3 s\u01a1 con (T\u1ed5ng quan, Ph\u00e1t tri\u1ec3n, S\u1ee9c kh\u1ecfe, H\u1ecdc t\u1eadp).'])
          ])
        ])
      ]));

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
      s.push(buildFeedback());
      return s;
    }

    function buildFeedback(){
      const ratings = ['R\u1ea5t h\u1eefu \u00edch','H\u1eefu \u00edch','B\u00ecnh th\u01b0\u1eddng','Ch\u01b0a h\u1eefu \u00edch'];
      const areas = ['N\u00f3i v\u1edbi HomeFlow','Planner','Vi\u1ec7c gia \u0111\u00ecnh','Family Balance','Family Profile','Chi ph\u00ed','H\u01b0\u1edbng d\u1eabn','Kh\u00e1c'];
      let rating = '';
      const selAreas = new Set();

      const ratingChips = ratings.map(r=>{
        const b = el('button',{class:'chip-f',onclick:()=>{
          rating = r;
          ratingChips.forEach(x=>x.classList.remove('on'));
          b.classList.add('on');
        }},[r]);
        return b;
      });
      const areaChips = areas.map(a=>{
        const b = el('button',{class:'chip-f',onclick:()=>{
          if(selAreas.has(a)){ selAreas.delete(a); b.classList.remove('on'); }
          else{ selAreas.add(a); b.classList.add('on'); }
        }},[a]);
        return b;
      });
      const desc = el('textarea',{class:'input',rows:3,placeholder:'M\u00f4 t\u1ea3 th\u00eam (t\u00f9y ch\u1ecdn)\u2026'});
      const send = el('button',{class:'btn btn-primary',style:'margin-top:12px'},['G\u1eedi ph\u1ea3n h\u1ed3i']);
      send.addEventListener('click', ()=>{
        if(!rating){ HF.toast('Ch\u1ecdn m\u1ee9c h\u1eefu \u00edch tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        state.feedback = state.feedback||[];
        state.feedback.push({rating:rating, areas:[...selAreas], desc:desc.value.trim(), at:new Date().toISOString()});
        HF.saveState(state);
        rating=''; selAreas.clear();
        ratingChips.forEach(x=>x.classList.remove('on'));
        areaChips.forEach(x=>x.classList.remove('on'));
        desc.value='';
        HF.toast('\u0110\u00e3 l\u01b0u ph\u1ea3n h\u1ed3i tr\u00ean thi\u1ebft b\u1ecb n\u00e0y \u2014 c\u1ea3m \u01a1n b\u1ea1n!','\u{1F49C}');
      });

      return el('div',{class:'card compact'},[
        el('div',{style:'font-size:13px;font-weight:800;margin-bottom:8px'},['HomeFlow h\u1eefu \u00edch v\u1edbi b\u1ea1n \u1edf m\u1ee9c n\u00e0o?']),
        el('div',{class:'chart-filters',style:'flex-wrap:wrap'}, ratingChips),
        el('div',{style:'font-size:13px;font-weight:800;margin:14px 0 8px'},['B\u1ea1n g\u1eb7p v\u1ea5n \u0111\u1ec1 \u1edf \u0111\u00e2u? (c\u00f3 th\u1ec3 ch\u1ecdn nhi\u1ec1u)']),
        el('div',{class:'chart-filters',style:'flex-wrap:wrap'}, areaChips),
        el('div',{style:'font-size:13px;font-weight:800;margin:14px 0 8px'},['M\u00f4 t\u1ea3 th\u00eam']),
        desc,
        send,
        el('div',{style:'font-size:11px;color:var(--muted);margin-top:10px;line-height:1.5'},['Phi\u00ean b\u1ea3n th\u1eed nghi\u1ec7m: ph\u1ea3n h\u1ed3i \u0111\u01b0\u1ee3c l\u01b0u ngay tr\u00ean thi\u1ebft b\u1ecb c\u1ee7a b\u1ea1n, ch\u01b0a g\u1eedi l\u00ean m\u00e1y ch\u1ee7.'])
      ]);
    }
function buildReminders(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['Nh\u1eafc vi\u1ec7c']));
      s.push(el('div',{class:'card compact',style:'background:var(--sun-soft);border-color:rgba(214,168,52,.35)'},[
        el('div',{style:'display:flex;gap:10px;align-items:flex-start'},[
          el('span',{style:'font-size:20px'},['\u2139\uFE0F']),
          el('div',{style:'flex:1'},[
            el('div',{style:'font-weight:800;font-size:13.5px;color:#8A6A10'},['Th\u00f4ng b\u00e1o ch\u01b0a kh\u1ea3 d\u1ee5ng trong b\u1ea3n n\u00e0y']),
            el('div',{style:'font-size:12px;color:#8A6A10;margin-top:3px;line-height:1.55'},['Phi\u00ean b\u1ea3n hi\u1ec7n t\u1ea1i ch\u01b0a h\u1ed7 tr\u1ee3 th\u00f4ng b\u00e1o \u0111\u1ea9y (push notification). Khi t\u00ednh n\u0103ng s\u1eb5n s\u00e0ng, b\u1ea1n s\u1ebd ch\u1ecdn \u0111\u01b0\u1ee3c th\u1eddi gian nh\u1eafc: 15 ph\u00fat, 1 gi\u1edd ho\u1eb7c 1 ng\u00e0y tr\u01b0\u1edbc gi\u1edd l\u00e0m vi\u1ec7c.'])
          ])
        ])
      ]));
      const items = [
        ['\u{1F514}','Nh\u1eafc vi\u1ec7c & s\u1ef1 ki\u1ec7n','Nh\u1eafc tr\u01b0\u1edbc gi\u1edd l\u00e0m vi\u1ec7c'],
        ['\u23F0','Nh\u1eafc vi\u1ec7c s\u1eafp \u0111\u1ebfn h\u1ea1n','Nh\u1eafc khi vi\u1ec7c g\u1ea7n \u0111\u1ebfn h\u1ea1n'],
        ['\u{1F4B3}','Nh\u1eafc chi ph\u00ed / h\u00f3a \u0111\u01a1n','Nh\u1eafc h\u1ea1n thanh to\u00e1n h\u00f3a \u0111\u01a1n'],
        ['\u{1F4DD}','Weekly Family Brief','B\u1ea3n tin t\u1ed5ng k\u1ebft tu\u1ea7n']
      ];
      s.push(el('div',{class:'card compact'}, items.map(([ico,lbl,sub])=>{
        return el('div',{class:'pref-row'},[
          el('span',{class:'set-ico',style:'width:36px;height:36px;font-size:17px'},[ico]),
          el('div',{style:'flex:1;min-width:0'},[
            el('div',{class:'set-row-t'},[lbl]),
            el('div',{class:'set-row-s'},[sub])
          ]),
          el('span',{class:'soon-tag'},['S\u1eafp c\u00f3'])
        ]);
      })));
      return s;
    }

    function prefToggle(key){
      const b = el('button',{class:'tg'+(state.prefs[key]?' on':''),role:'switch','aria-checked':state.prefs[key]?'true':'false',onclick:()=>{
        state.prefs[key] = !state.prefs[key];
        HF.prefs = state.prefs;
        HF.saveState(state);
        rerender();
        HF.toast(state.prefs[key]?'\u0110\u00e3 b\u1eadt':'\u0110\u00e3 t\u1eaft','\u2705');
      }},[el('span',{class:'tg-knob'})]);
      return b;
    }

    function prefRow(ico, label, sub, control){
      return el('div',{class:'pref-row'},[
        el('span',{class:'set-ico',style:'width:36px;height:36px;font-size:17px'},[ico]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'set-row-t'},[label]),
          sub ? el('div',{class:'set-row-s'},[sub]) : null
        ]),
        control
      ]);
    }

    function buildDisplay(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['L\u1ecbch & Hi\u1ec3n th\u1ecb']));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'View l\u1ecbch m\u1eb7c \u0111\u1ecbnh']));
      const viewSeg = el('div',{class:'seg'}, [['day','Ng\u00e0y'],['week','Tu\u1ea7n'],['month','Th\u00e1ng']].map(([id,lbl])=>{
        return el('button',{class:state.prefs.defaultView===id?'active':'',onclick:()=>{state.prefs.defaultView=id; HF.prefs=state.prefs; HF.saveState(state); rerender();}},[lbl]);
      }));
      s.push(el('div',{class:'card compact'},[
        prefRow('\u{1F5C5}\uFE0F','View l\u1ecbch m\u1eb7c \u0111\u1ecbnh','Ch\u1ecdn c\u00e1ch hi\u1ec3n th\u1ecb l\u1ecbch', viewSeg),
        el('div',{style:'font-size:11.5px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px dashed var(--hairline)'},['L\u1ecbch gia \u0111\u00ecnh s\u1ebd ra m\u1eaft trong b\u1ea3n c\u1eadp nh\u1eadt t\u1edbi \u2014 l\u1ef1a ch\u1ecdn n\u00e0y s\u1ebd \u0111\u01b0\u1ee3c \u00e1p d\u1ee5ng khi t\u00ednh n\u0103ng c\u00f3 m\u1eb7t.'])
      ]));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Ng\u00e0y b\u1eaft \u0111\u1ea7u tu\u1ea7n']));
      const wsSeg = el('div',{class:'seg'}, [['mon','Th\u1ee9 2'],['sun','Ch\u1ee7 nh\u1eadt']].map(([id,lbl])=>{
        return el('button',{class:state.prefs.weekStart===id?'active':'',onclick:()=>{state.prefs.weekStart=id; HF.prefs=state.prefs; HF.saveState(state); rerender();}},[lbl]);
      }));
      s.push(el('div',{class:'card compact'},[
        prefRow('\u{1F4C5}','Ng\u00e0y b\u1eaft \u0111\u1ea7u tu\u1ea7n','\u00c1p d\u1ee5ng khi L\u1ecbch gia \u0111\u00ecnh ra m\u1eaft', wsSeg)
      ]));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Hi\u1ec3n th\u1ecb']));
      s.push(el('div',{class:'card compact'},[
        prefRow('\u2705','Hi\u1ec3n th\u1ecb vi\u1ec7c \u0111\u00e3 ho\u00e0n th\u00e0nh','\u1ea8n m\u1ee5c \u201c\u0110\u00e3 xong\u201d tr\u00ean trang Vi\u1ec7c nh\u00e0', prefToggle('showCompleted')),
        prefRow('\u{1F9E0}','Planning Owner','Hi\u1ec7n ng\u01b0\u1eddi l\u1eadp k\u1ebf ho\u1ea1ch (lo) tr\u00ean vi\u1ec7c', prefToggle('showPlanner')),
        prefRow('\u25CF','Task Owner','Hi\u1ec7n ng\u01b0\u1eddi th\u1ef1c hi\u1ec7n (l\u00e0m) tr\u00ean vi\u1ec7c', prefToggle('showDoer'))
      ]));
      return s;
    }

    function buildExpenses(){
      const s = [];
      s.push(backRow('C\u00e0i \u0111\u1eb7t','settings'));
      s.push(el('h1',{class:'page-title',style:'margin-top:10px'},['Chi ph\u00ed']));
      s.push(el('div',{class:'sub'},['C\u1ea5u h\u00ecnh ti\u1ec1n t\u1ec7 v\u00e0 danh m\u1ee5c chi ph\u00ed c\u1ee7a gia \u0111\u00ecnh']));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Ti\u1ec1n t\u1ec7']));
      const curSel = el('select',{class:'input'});
      HF.CURRENCIES.forEach(([id,lbl])=>curSel.appendChild(el('option',{value:id},[lbl])));
      curSel.value = state.expenses.currency||'VND';
      curSel.addEventListener('change', ()=>{
        state.expenses.currency = curSel.value;
        HF.saveState(state);
        HF.toast('\u0110\u00e3 \u0111\u1ed5i ti\u1ec1n t\u1ec7 sang '+curSel.value,'\u{1F4B0}');
      });
      s.push(el('div',{class:'card compact'},[
        el('div',{style:'font-size:12px;color:var(--muted);margin-bottom:8px'},['\u0110\u01a1n v\u1ecb ti\u1ec1n d\u00f9ng khi ghi l\u1ea1i chi ph\u00ed.']),
        curSel
      ]));

      s.push(el('div',{class:'section-label'},[el('span',{class:'bar'}),'Danh m\u1ee5c chi ph\u00ed']));
      const catCard = el('div',{class:'card compact'}, [
        ...state.expenses.categories.map(catRow),
        el('button',{class:'btn btn-soft',style:'width:100%;margin-top:10px;padding:12px;font-size:13.5px',onclick:()=>openCatSheet(null)},[
          '+ Th\u00eam danh m\u1ee5c'
        ])
      ]);
      s.push(catCard);
      return s;
    }

    function catRow(cat){
      return el('div',{class:'mgmt-row'},[
        el('span',{class:'avatar',style:'background:var(--primary-soft)'},[cat.emoji]),
        el('div',{style:'flex:1;min-width:0'},[
          el('div',{class:'mgmt-title'},[cat.name])
        ]),
        el('button',{class:'icon-btn',style:'color:var(--primary-deep)',onclick:()=>openCatSheet(cat)},['\u270F\uFE0F']),
        el('button',{class:'icon-btn',style:'color:var(--danger)',onclick:()=>confirmDeleteCat(cat)},['\u{1F5D1}\uFE0F'])
      ]);
    }

    function confirmDeleteCat(cat){
      const used = (state.expenses.records||[]).filter(r=>r.catId===cat.id).length;
      if(used>0){
        HF.toast('Danh m\u1ee5c \u201c'+cat.name+'\u201d \u0111ang \u0111\u01b0\u1ee3c '+used+' kho\u1ea3n chi s\u1eed d\u1ee5ng \u2014 kh\u00f4ng th\u1ec3 x\u00f3a','\u26A0\uFE0F');
        return;
      }
      HF.confirmDelete({
        head:'X\u00f3a danh m\u1ee5c?',
        title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+cat.name+'\u201d?',
        message:'Danh m\u1ee5c n\u00e0y s\u1ebd b\u1ecb x\u00f3a kh\u1ecfi c\u1ea5u h\u00ecnh chi ph\u00ed.',
        onConfirm:()=>{
          HF.deleteExpenseCat(state, cat.id);
          HF.toast('\u0110\u00e3 x\u00f3a danh m\u1ee5c','\u{1F5D1}\uFE0F');
          rerender();
        }
      });
    }

    function openCatSheet(cat){
      const isEdit = !!cat;
      const c = cat ? Object.assign({}, cat) : {name:'', emoji:'\u{1F4E6}'};
      const EMOJIS = ['\u{1F3E0}','\u{1F35C}','\u{1F393}','\u{1FA7A}','\u{1F6D2}','\u{1F697}','\u{1F381}','\u{1F389}','\u{1F4E6}','\u{1F3AC}','\u{1F6B2}','\u{1F4B8}'];
      const name = el('input',{class:'input',value:c.name,placeholder:'T\u00ean danh m\u1ee5c (VD: Th\u00fa c\u01b0ng)'});
      const emojiBtns = EMOJIS.map(em=>{
        const b = el('button',{class:'ava-pick'+(em===c.emoji?' on':''),onclick:()=>{
          c.emoji=em;
          emojiBtns.forEach(x=>x.classList.remove('on'));
          b.classList.add('on');
        }},[em]);
        return b;
      });
      const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
        field('Bi\u1ec3u t\u01b0\u1ee3ng', el('div',{class:'ava-row'},emojiBtns)),
        field('T\u00ean danh m\u1ee5c', name),
        el('div',{style:'display:flex;gap:10px;margin-top:6px'},[
          isEdit ? el('button',{class:'btn btn-danger',style:'flex:0.8;padding:13px 10px;font-size:13.5px'},['\u{1F5D1}\uFE0F X\u00f3a']) : null,
          el('button',{class:'btn btn-primary',style:'flex:1.6;padding:13px 10px;font-size:13.5px'},[isEdit?'\u{1F4BE} L\u01b0u thay \u0111\u1ed5i':'+ Th\u00eam danh m\u1ee5c'])
        ])
      ]);
      const sheet = HF.sheet({title:isEdit?'Ch\u1ec9nh s\u1eeda danh m\u1ee5c':'Th\u00eam danh m\u1ee5c', body:()=>body});

      const delBtn = body.querySelector('.btn-danger');
      if(delBtn){
        delBtn.addEventListener('click', ()=>{
          HF.confirmDelete({
            head:'X\u00f3a danh m\u1ee5c?',
            title:'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u201c'+c.name+'\u201d?',
            message:'Danh m\u1ee5c n\u00e0y s\u1ebd b\u1ecb x\u00f3a kh\u1ecfi c\u1ea5u h\u00ecnh chi ph\u00ed.',
            onConfirm:()=>{
              HF.deleteExpenseCat(state, c.id);
              HF.toast('\u0110\u00e3 x\u00f3a danh m\u1ee5c','\u{1F5D1}\uFE0F');
              rerender();
            }
          });
        });
      }

      body.querySelector('.btn-primary').addEventListener('click', ()=>{
        const n = name.value.trim();
        if(!n){ HF.toast('Nh\u1eadp t\u00ean danh m\u1ee5c tr\u01b0\u1edbc nh\u00e9','\u{1F914}'); return; }
        if(state.expenses.categories.some(x=>x.name===n && x.id!==c.id)){
          HF.toast('\u0110\u00e3 c\u00f3 danh m\u1ee5c t\u00ean n\u00e0y','\u{1F60A}');
          return;
        }
        if(isEdit){
          HF.updateExpenseCat(state, c.id, {name:n, emoji:c.emoji});
          HF.toast('\u0110\u00e3 c\u1eadp nh\u1eadt danh m\u1ee5c','\u270F\uFE0F');
        }else{
          HF.addExpenseCat(state, {name:n, emoji:c.emoji});
          HF.toast('\u0110\u00e3 th\u00eam danh m\u1ee5c','\u2705');
        }
        sheet.close();
        rerender();
      });
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
      if(path[0]==='reminders') return buildReminders();
      if(path[0]==='display') return buildDisplay();
      if(path[0]==='expenses') return buildExpenses();
      return buildLanding();
    }

    function rerender(){
      root.innerHTML='';
      build().forEach(n=>root.appendChild(n));
    }

    rerender();
    return [root];
  };

  function confirmDuplicate(existing, onAdd){
    const cat = HF.categoryById(existing.cat);
    const owner = HF.memberById(existing.owner);
    const body = el('div',{style:'display:flex;flex-direction:column;gap:12px'},[
      el('div',{style:'display:flex;gap:10px;align-items:flex-start'},[
        el('span',{style:'font-size:20px'},['\u{1F49C}']),
        el('div',{style:'flex:1'},[
          el('div',{style:'font-weight:800;font-size:14px'},['Vi\u1ec7c n\u00e0y c\u00f3 v\u1ebb \u0111\u00e3 c\u00f3 trong HomeFlow']),
          el('div',{style:'font-size:12px;color:var(--muted);margin-top:2px;line-height:1.5'},['B\u1ea1n c\u00f3 mu\u1ed1n xem vi\u1ec7c hi\u1ec7n c\u00f3 tr\u01b0\u1edbc, hay v\u1eabn mu\u1ed1n th\u00eam m\u1ed9t vi\u1ec7c t\u01b0\u01a1ng t\u1ef1?'])
        ])
      ]),
      el('div',{class:'dup-preview'},[
        el('div',{class:'dup-preview-t'},[existing.title]),
        el('div',{class:'dup-preview-m'},[
          el('span',{class:'chip',style:`background:${cat.soft};color:${cat.color}`},[cat.emoji+' '+cat.label]),
          el('span',{class:'chip ghost'},['\u{1F5D3}\uFE0F '+HF.formatDay(existing.due)+(existing.time?' \u00b7 '+existing.time:'')]),
          existing.shared
            ? el('span',{class:'chip-lam chip-shared'},['C\u1ea3 nh\u00e0 l\u00e0m'])
            : el('span',{class:'chip-lam',style:'background:'+owner.color},[owner.short+' l\u00e0m'])
        ])
      ]),
      el('div',{style:'display:flex;flex-direction:column;gap:8px;margin-top:4px'},[
        el('button',{class:'btn btn-soft',style:'padding:12px;font-size:13.5px'},['\u{1F440} Xem vi\u1ec7c hi\u1ec7n c\u00f3']),
        el('button',{class:'btn btn-primary',style:'padding:12px;font-size:13.5px'},['V\u1eabn th\u00eam']),
        el('button',{class:'btn btn-ghost',style:'padding:12px;font-size:13.5px'},['H\u1ee7y'])
      ])
    ]);
    const sheet = HF.sheet({title:'C\u00f3 v\u1ebb tr\u00f9ng l\u1eb7p', body:()=>body});
    const btns = body.querySelectorAll('.btn');
    btns[0].addEventListener('click', ()=>{ sheet.close(); nav('tasks'); });
    btns[1].addEventListener('click', ()=>{ sheet.close(); onAdd(); });
    btns[2].addEventListener('click', ()=>sheet.close());
  }

  function openAddSheet(state, nav, presetDate, backFilter){
    HF.sheet({
      title:'Th\u00eam vi\u1ec7c th\u1ee7 c\u00f4ng',
      body:()=>{
        const title = el('input',{class:'input',placeholder:'VD: Lau d\u1ecdn ph\u00f2ng ng\u1ee7'});
        const catSel = el('select',{class:'input'});
        Object.keys(HF.CATEGORIES).forEach(k=>{
          catSel.appendChild(el('option',{value:k},[HF.CATEGORIES[k].emoji+' '+HF.CATEGORIES[k].label]));
        });
        const ownerSel = HF.ownerSelect('me',()=>{});
        const dateSel = HF.dateSelect(presetDate || HF.dayOffset(1),()=>{});
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
          const candidate = {
            title: t,
            due: new Date(dateSel.value),
            time: '',
            owner: ownerSel.value,
            planner: plannerSel.value,
            shared: false
          };
          const doAdd = ()=>{
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
            nav('tasks',{filter:backFilter||'all'});
            document.getElementById('sheetLayer').innerHTML='';
          };
          const dup = HF.findDuplicateTask(state, candidate);
          if(dup){ confirmDuplicate(dup, doAdd); return; }
          const past = HF.isPastDate(candidate.due);
          const conflict = HF.timeConflict(state, candidate);
          if(past || conflict){
            const msgs = [];
            if(past) msgs.push('Ng\u00e0y n\u00e0y \u0111\u00e3 qua ('+HF.formatDay(candidate.due)+')');
            if(conflict) msgs.push('\u0110\u00e3 c\u00f3 vi\u1ec7c \u201c'+conflict.title+'\u201d v\u00e0o '+conflict.time+' h\u00f4m \u0111\u00f3');
            HF.confirmIssue({
              head: past&&conflict ? 'C\u00f3 v\u1ebb ch\u01b0a \u1ed5n' : (past ? 'Ng\u00e0y \u0111\u00e3 qua' : 'Gi\u1edd b\u1ecb tr\u00f9ng'),
              title: msgs.join('. ')+'.',
              note: conflict
                ? 'Vui l\u00f2ng ch\u1ec9nh s\u1eeda l\u1ea1i ng\u00e0y/gi\u1edd \u0111\u1ec3 tr\u00e1nh tr\u00f9ng.'
                : 'B\u1ea1n c\u00f3 mu\u1ed1n \u0111\u1ed5i ng\u00e0y kh\u00f4ng?',
              mode: conflict ? 'edit' : 'confirm',
              onChange: ()=>{ HF.toast('Ch\u1ecdn ng\u00e0y kh\u00e1c nh\u00e9','\u{1F5D3}\uFE0F'); },
              onEdit: ()=>{ HF.toast('Ch\u1ecdn ng\u00e0y/gi\u1edd kh\u00e1c nh\u00e9','\u{1F5D3}\uFE0F'); },
              onKeep: doAdd
            });
            return;
          }
          doAdd();
        });
        return body;
      }
    });
  }

  function el(tag, attrs, children){
    return HF.el(tag, attrs, children);
  }
})();