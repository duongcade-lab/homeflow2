(function(){
  const HF = window.HF = window.HF || {};

  const WEEKDAY_RE = /(ch\u1ee7\s*nh\u1eadt|th\u1ee9\s*[2-7]|cn\b)/i;
  const TIME_RE = /(?:l\u00fac\s*)?(\d{1,2})(?::(\d{2})|\s*(?:h|gi\u1edd)(?:\s*(\d{1,2}))?)/i;
  const TIME_G_RE = new RegExp(TIME_RE.source, 'gi');
  const FREQ_RE = /(h\u00e0ng|h\u1eb1ng|m\u1ed7i)\s*(bu\u1ed5i\s*)?(ng\u00e0y|s\u00e1ng|tr\u01b0a|chi\u1ec1u|t\u1ed1i|\u0111\u00eam)/i;
  const TRANSPORT_RE = /(\u0111\u01b0a|ch\u1edf|\u0111\u00f3n)/i;

  const CAT_KEYWORDS = [
    {cat:'school', kw:['h\u1ecdc','ti\u1ebfng anh','l\u1edbp','b\u00e0i t\u1eadp','l\u1ecbch h\u1ecdc','\u0111i h\u1ecdc','ki\u1ec3m tra','\u00f4n','tr\u01b0\u1eddng']},
    {cat:'bill', kw:['\u0111\u00f3ng ti\u1ec1n','h\u00f3a \u0111\u01a1n','ti\u1ec1n \u0111i\u1ec7n','ti\u1ec1n n\u01b0\u1edbc','h\u1ecdc ph\u00ed','thanh to\u00e1n','chuy\u1ec3n kho\u1ea3n','n\u1ed9p ti\u1ec1n','internet','ti\u1ec1n']},
    {cat:'health', kw:['kh\u00e1m','r\u0103ng','b\u00e1c s\u0129','ti\u00eam','thu\u1ed1c','b\u1ec7nh','s\u1ee9c kh\u1ecfe','vitamin']},
    {cat:'event', kw:['sinh nh\u1eadt','qu\u00e0','k\u1ef7 ni\u1ec7m','gi\u1ed7','ti\u1ec7c','li\u00ean hoan','\u0111\u00e1m c\u01b0\u1edbi','m\u1eebng','ch\u00fac m\u1eebng']},
    {cat:'shopping', kw:['mua','si\u00eau th\u1ecb','ch\u1ee3','mua s\u1eafm','order','ship','giao h\u00e0ng']},
    {cat:'kids', kw:['balo','b\u00e9','con','ch\u00e1u','truy\u1ec7n','\u0111\u1ed3 ch\u01a1i','b\u00ecnh s\u1eefa','t\u00e3']},
    {cat:'home', kw:['d\u1ecdn','lau','v\u1ec7 sinh','r\u1eeda','gi\u1eb7t','n\u1ea5u','\u0103n c\u01a1m','r\u00e1c','t\u01b0\u1edbi c\u00e2y','c\u00e1 \u0103n','ph\u00f2ng','nh\u00e0 c\u1eeda','qu\u1ea7n \u00e1o','b\u1ebfp']}
  ];

  const PLANNER_KW = ['nh\u1edb','\u0111\u1eb7t l\u1ecbch','chu\u1ea9n b\u1ecb','li\u00ean h\u1ec7','g\u1ecdi \u0111i\u1ec7n','t\u00ecm','s\u1eafp x\u1ebfp','book','\u0111\u1eb7t','gi\u1ea5y t\u1edd','\u0111\u01a1n','\u0111\u0103ng k\u00fd','mua qu\u00e0','nh\u1eafc','\u0111\u1eebng qu\u00ean','qu\u00ean'];
  const SHARED_RE = /c\u1ea3 nh\u00e0|c\u1ea3 gia \u0111\u00ecnh|m\u1ecdi ng\u01b0\u1eddi/i;

  function wp(word){
    return '(?<!\\p{L})' + word + '(?!\\p{L})';
  }
  const WORD_BO = wp('b\u1ed1'), WORD_CHA = wp('cha'), WORD_BA = wp('ba');
  const WORD_ME = wp('m\u1eb9'), WORD_MA = wp('m\u00e1');
  const WORD_BIN = '(?<!\\p{L})(b\u1ea1n\\s*l\u1edbn|bin)(?!\\p{L})';
  const WORD_SU = '(?<!\\p{L})(b\u1ea1n\\s*nh\u1ecf|su)(?!\\p{L})';
  const WORD_CON = wp('con'), WORD_BE = wp('b\u00e9');

  function norm(s){
    return s.toLowerCase()
      .replace(/[.!?;]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function splitSentences(text){
    const parts = text.split(/\n+|(?<=[.!?;])\s+/i);
    const out = [];
    for(const p of parts){
      const t = p.replace(/^[\s,.\u2013\-]+/,'').trim();
      if(t.length > 2) out.push(t);
    }
    return out;
  }

  function nextWeekday(jsDay){
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = (jsDay - now.getDay() + 7) % 7;
    const d = new Date(now);
    d.setDate(d.getDate()+diff);
    return d;
  }

  function parseWeekday(s){
    const m = s.match(WEEKDAY_RE);
    if(!m) return null;
    const w = m[0].toLowerCase().replace(/\s+/g,' ');
    if(w.includes('ch\u1ee7 nh\u1eadt') || w==='cn') return nextWeekday(0);
    const num = w.match(/th\u1ee9\s*([2-7])/);
    if(num) return nextWeekday(parseInt(num[1],10)-1);
    return null;
  }

  function parseTime(s){
    const m = s.match(TIME_RE);
    if(!m) return '';
    const h = parseInt(m[1],10);
    const mi = m[2] ? parseInt(m[2],10) : (m[3] ? parseInt(m[3],10) : 0);
    return String(h).padStart(2,'0') + ':' + String(mi).padStart(2,'0');
  }

  function parseTimes(s){
    const out = [];
    const re = new RegExp(TIME_RE.source, 'gi');
    let m;
    while((m = re.exec(s))){
      const h = parseInt(m[1],10);
      const mi = m[2] ? parseInt(m[2],10) : (m[3] ? parseInt(m[3],10) : 0);
      out.push(String(h).padStart(2,'0') + ':' + String(mi).padStart(2,'0'));
    }
    return out;
  }

  function detectFrequency(s){
    return FREQ_RE.test(s) ? 'daily' : null;
  }

  function parseWeekdayRange(s){
    const re = /(?:t\u1eeb\s*)?th\u1ee9\s*([2-7])\s*(?:\u0111\u1ebfn|t\u1edbi|t\u1edbi\s*h\u1ebft|\u2013|-|~)\s*(?:h\u1ebft\s*)?(?:th\u1ee9\s*([2-7])|ch\u1ee7\s*nh\u1eadt|cn\b)/i;
    const m = s.match(re);
    if(!m) return null;
    const a = parseInt(m[1],10);
    const b = m[2] ? parseInt(m[2],10) : 8; // ch\u1ee7 nh\u1eadt = 8
    if(b < a) return null;
    const days = [];
    for(let n=a;n<=b;n++){
      const jsDay = n===8 ? 0 : n-1;
      days.push(nextWeekday(jsDay));
    }
    return days;
  }

  function multiply(tasks, days){
    const out = [];
    for(const t of tasks){
      const times = (t.times && t.times.length) ? t.times : [t.time||''];
      for(const d of days){
        for(const tm of times){
          out.push(Object.assign({}, t, { due: d, time: tm }));
        }
      }
    }
    return out;
  }

  HF.detectFrequency = detectFrequency;
  HF.parseWeekdayRange = parseWeekdayRange;

  function detectCategory(s){
    let best = null, bestScore = 0;
    for(const row of CAT_KEYWORDS){
      let score = 0;
      for(const kw of row.kw){
        if(s.includes(kw)) score += kw.length > 6 ? 2 : 1;
      }
      if(score > bestScore){ best = row.cat; bestScore = score; }
    }
    return best || 'home';
  }

  function detectDoer(s, cat){
    const shared = SHARED_RE.test(s);
    const transport = TRANSPORT_RE.test(s);
    const hasBo = new RegExp(WORD_BO+'|'+WORD_CHA+'|'+WORD_BA,'iu').test(s);
    const hasMe = new RegExp(WORD_ME+'|'+WORD_MA,'iu').test(s);
    const hasBin = new RegExp(WORD_BIN,'iu').test(s);
    const hasSu = new RegExp(WORD_SU,'iu').test(s);
    const hasKidWord = new RegExp(WORD_CON+'|'+WORD_BE,'iu').test(s);

    const parent = hasBo ? 'bo' : (hasMe ? 'me' : null);
    const kidByName = (HF.MEMBERS||[]).find(m=>m.kind==='kid' && m.name.toLowerCase().length>1 && s.includes(m.name.toLowerCase()));
    const kidId = hasBin ? 'bin' : (hasSu ? 'su' : (kidByName ? kidByName.id : null));

    if(shared) return {owner:'me', shared:true, kid:kidId, parent, transport, known:true};
    if(parent && (transport || cat==='health')) return {owner:parent, shared:false, kid:kidId, parent, transport, known:true};
    if(parent) return {owner:parent, shared:false, kid:kidId, parent, transport, known:true};
    if(kidId && cat==='health') return {owner:'bo', shared:false, kid:kidId, parent:null, transport, known:true};
    if(kidId) return {owner:kidId, shared:false, kid:kidId, parent:null, transport, known:true};
    if(hasKidWord && cat==='health') return {owner:'bo', shared:false, kid:null, parent:null, transport, known:true};
    if(cat==='event' || cat==='shopping') return {owner:'me', shared:true, kid:kidId, parent:null, transport, known:true};
    return {owner:'me', shared:false, kid:kidId, parent:null, transport, known:false};
  }

  function resolveRole(role, low){
    const list = HF.MEMBERS||[];
    if(role && list.some(m=>m.id===role)) return role;
    const roleKws = {bo:['b\u1ed1','cha','ba'], me:['m\u1eb9','m\u00e1'], bin:['b\u1ea1n l\u1edbn','bin'], su:['b\u1ea1n nh\u1ecf','su']};
    const kws = roleKws[role]||[];
    const wantKid = (role==='bin'||role==='su');
    const byText = list.find(m=>m.kind==='kid'===wantKid && m.name.toLowerCase().length>1 && low.includes(m.name.toLowerCase()));
    const byKw = list.find(m=>m.kind==='kid'===wantKid && kws.includes(m.name.toLowerCase()));
    const m = byText || byKw;
    return m ? m.id : (role==='me' ? 'me' : null);
  }

  function detectPlanner(s, doer, cat){
    const hasKw = PLANNER_KW.some(kw=>s.includes(kw));
    const hasBo = new RegExp(WORD_BO+'|'+WORD_CHA+'|'+WORD_BA,'iu').test(s);
    const hasMe = new RegExp(WORD_ME+'|'+WORD_MA,'iu').test(s);
    if(hasKw){
      if(hasBo) return 'bo';
      if(hasMe) return 'me';
      return 'me';
    }
    if(doer.kid) return 'me';
    if(doer.shared) return 'me';
    if(cat==='event' || cat==='bill') return 'me';
    return null;
  }

  function cleanTitle(chunk, doer){
    let t = chunk;
    t = t.replace(WEEKDAY_RE,' ');
    t = t.replace(TIME_G_RE,' ');
    t = t.replace(/tr\u01b0\u1edbc\s+th\u1ee9\s*\d/g,' ');
    t = t.replace(/ng\u00e0y\s+\d{1,2}(\s*[/\-.]\s*\d{1,2})?/g,' ');
    t = t.replace(/\d{1,2}\s*,\s*\d{1,2}\s*[/\-.]\s*\d{1,2}/g,' ');
    t = t.replace(/\d{1,2}\s*[/\-.]\s*\d{1,2}/g,' ');
    t = t.replace(/\d{1,2}\s*th\u00e1ng\s*\d{1,2}/g,' ');
    t = t.replace(/\b(v\u00e0o|v\u00e0|l\u00fac|n\u00ean|th\u00ec|s\u1ebd|r\u1ed3i|cho|cho c\u1ea3)\b/g,' ');
    t = t.replace(new RegExp('('+WORD_BO+'|'+WORD_CHA+'|'+WORD_BA+'|'+WORD_ME+'|'+WORD_MA+'|'+WORD_BIN+'|'+WORD_SU+')','giu'),' ');
    t = t.replace(new RegExp('('+WORD_CON+'|'+WORD_BE+')','giu'),' ');
    t = t.replace(/(c\u1ea3 nh\u00e0|c\u1ea3 gia \u0111\u00ecnh|m\u1ecdi ng\u01b0\u1eddi|\u0111\u1eebng qu\u00ean|nh\u1edb|qu\u00ean|cu\u1ed1i tu\u1ea7n|tu\u1ea7n sau|tu\u1ea7n n\u00e0y)/g,' ');
    t = t.replace(FREQ_RE,' ');
    t = t.replace(/\b(s\u00e1ng|tr\u01b0a|chi\u1ec1u|t\u1ed1i|\u0111\u00eam)\s*(nay|mai|h\u00f4m nay)\b/g,' ');
    if(doer.transport && doer.kid){
      const kidName = doer.kid==='bin' ? 'B\u1ea1n l\u1edbn' : (doer.kid==='su' ? 'B\u1ea1n nh\u1ecf' : (HF.memberById(doer.kid).name || 'con'));
      if(doer.kid!=='bin' && doer.kid!=='su'){
        t = t.replace(new RegExp('(?<!\\p{L})'+HF.memberById(doer.kid).name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?!\\p{L})','giu'),' ');
      }
      t = t.replace(/(\u0111\u01b0a|ch\u1edf|\u0111\u00f3n)\s+(con|b\u00e9)?\s*/g,' ');
      t = t.replace(/\s+/g,' ').trim();
      t = t ? '\u0110\u01b0a '+kidName+' '+t : '\u0110\u01b0a '+kidName;
    }else{
      t = t.replace(/(\u0111\u01b0a|ch\u1edf|\u0111\u00f3n)\s+(con|b\u00e9)?\s*/g,' ');
    }
    t = t.replace(/\s+/g,' ').trim();
    t = t.replace(/^[\s,.\u2013\-]+/,'');
    t = t.replace(/[,\s.]+$/,'').trim();
    if(!t) t = chunk.replace(/^[\s,.\u2013\-]+/,'').trim();
    t = t.replace(/ti\u1ebfng anh/g,'ti\u1ebfng Anh');
    for(const m of HF.MEMBERS){
      const nm = m.name.toLowerCase();
      if(nm.length>1){
        const re = new RegExp('(?<!\\p{L})'+nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?!\\p{L})','giu');
        t = t.replace(re, m.name);
      }
    }
    t = t.charAt(0).toUpperCase() + t.slice(1);
    if(t.length > 60) t = t.slice(0,60).replace(/\s+\S*$/,'') + '\u2026';
    return t;
  }

  function inferDue(s, weekday){
    const low = s.toLowerCase();
    if(weekday) return weekday;
    if(/\bh\u00f4m nay\b|\b(s\u00e1ng|tr\u01b0a|chi\u1ec1u|t\u1ed1i|\u0111\u00eam)\s*nay\b|\bnay\b/.test(low)) return HF.dayOffset(0);
    if(/\b(s\u00e1ng|tr\u01b0a|chi\u1ec1u|t\u1ed1i|\u0111\u00eam)\s*mai\b|\bmai\b|ng\u00e0y mai/.test(low)) return HF.dayOffset(1);
    if(/cu\u1ed1i tu\u1ea7n/.test(low)) return HF.dayOffset((7 - new Date().getDay() + 6) % 7 || 7);
    if(/tu\u1ea7n sau/.test(low)) return HF.dayOffset(7);
    if(/tu\u1ea7n n\u00e0y/.test(low)) return HF.dayOffset(3);
    return HF.dayOffset(3);
  }

  function parseExplicitDates(s){
    const dates = [];
    const now = new Date();
    const curY = now.getFullYear(), curM = now.getMonth();
    function push(d, mo){
      if(d>=1 && d<=31 && mo>=1 && mo<=12){
        dates.push(new Date(curY, mo-1, d));
      }
    }
    // "26, 27/10" — shared denominator
    const sharedRe = /(\d{1,2})\s*,\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})/g;
    let m;
    while((m = sharedRe.exec(s))){
      push(parseInt(m[1],10), parseInt(m[3],10));
      push(parseInt(m[2],10), parseInt(m[3],10));
    }
    // "27/10", "27-10", "27.10"
    const dmRe = /(\d{1,2})\s*[/\-.]\s*(\d{1,2})(?!\s*[/\-.]\s*\d)/g;
    while((m = dmRe.exec(s))){
      push(parseInt(m[1],10), parseInt(m[2],10));
    }
    // "26 tháng 10"
    const tmRe = /(\d{1,2})\s*th\u00e1ng\s*(\d{1,2})/g;
    while((m = tmRe.exec(s))){
      push(parseInt(m[1],10), parseInt(m[2],10));
    }
    // "ngày 26" / "ngày 26/10"
    const ngRe = /ng\u00e0y\s+(\d{1,2})(?:\s*[/\-.]\s*(\d{1,2}))?/g;
    while((m = ngRe.exec(s))){
      const d = parseInt(m[1],10);
      if(m[2]) push(d, parseInt(m[2],10));
      else if(d>=1 && d<=31){
        dates.push(new Date(curY, curM, d));
      }
    }
    const seen = new Set();
    return dates.filter(d=>{
      const k = d.getTime();
      if(seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function buildTask(low, due, dueKnown){
    const times = parseTimes(low);
    const time = times[0] || '';
    const cat = detectCategory(low);
    const doer = detectDoer(low, cat);
    const doerResolved = {
      owner: resolveRole(doer.owner, low) || 'me',
      kid: doer.kid ? resolveRole(doer.kid, low) : null,
      shared: doer.shared, parent: doer.parent, transport: doer.transport, known: doer.known
    };
    const plannerRole = detectPlanner(low, doer, cat);
    const planner = plannerRole ? (resolveRole(plannerRole, low) || 'me') : null;
    const mental = !!planner;
    const title = cleanTitle(low, doerResolved);
    let confidence = 0.72;
    if(parseWeekday(low)) confidence += 0.08;
    if(time) confidence += 0.05;
    if(doerResolved.owner !== 'me' || doerResolved.parent) confidence += 0.07;
    if(planner) confidence += 0.05;
    confidence = Math.min(0.98, confidence);
    return {
      title,
      cat,
      due,
      time,
      times,
      owner: doerResolved.owner,
      planner: mental ? planner : null,
      mental,
      shared: !!doerResolved.shared,
      kidOk: ['home','shopping','kids'].includes(cat),
      confidence: Math.round(confidence*100),
      dueKnown: !!dueKnown,
      doerKnown: !!doerResolved.known
    };
  }

  HF.parseBrainDump = function(text){
    const sentences = splitSentences(text);
    const tasks = [];

    for(const s of sentences){
      let low = norm(s);
      const nParts = low.split(/\s+n\u00ean\s+/);
      if(nParts.length > 1){
        const ctx = nParts[0];
        const act = nParts.slice(1).join(' ');
        const ctxClean = cleanTitle(ctx, {transport:false, kid:null}).toLowerCase();
        if(/sinh nh\u1eadt|k\u1ef7 ni\u1ec7m|gi\u1ed7|ti\u1ec7c|li\u00ean hoan|\u0111\u00e1m c\u01b0\u1edbi|m\u1eebng/.test(ctxClean)){
          low = act + ' ' + ctxClean;
        }else{
          low = act;
        }
      }
      const weekday = parseWeekday(low);
      const explicitDates = parseExplicitDates(low);
      const rangeDates = parseWeekdayRange(low);
      const freq = detectFrequency(low);
      const dueKnown = !!(weekday || explicitDates.length || rangeDates || freq ||
        /\bh\u00f4m nay\b|\bnay\b|\bmai\b|ng\u00e0y mai|cu\u1ed1i tu\u1ea7n|tu\u1ea7n sau|tu\u1ea7n n\u00e0y/.test(low));
      const sentenceTasks = [];
      if(rangeDates){
        sentenceTasks.push(buildTask(low, rangeDates[0], true));
        tasks.push(...multiply(sentenceTasks, rangeDates));
      }else if(explicitDates.length){
        for(const d of explicitDates){
          sentenceTasks.push(buildTask(low, d, dueKnown));
        }
        tasks.push(...sentenceTasks);
      }else{
        sentenceTasks.push(buildTask(low, inferDue(low, weekday), dueKnown));
        if(freq){
          const days = [];
          for(let i=0;i<7;i++) days.push(HF.dayOffset(i));
          tasks.push(...multiply(sentenceTasks, days));
        }else{
          tasks.push(...sentenceTasks);
        }
      }
    }
    return tasks;
  };

  HF.AI_STATES = [
    {ico:'\u2728', t:'HomeFlow \u0111ang l\u1eafng nghe'},
    {ico:'\u{1F9E0}', t:'\u0110ang nh\u1eadn di\u1ec7n nh\u1eefng vi\u1ec7c c\u1ea7n nh\u1edb'},
    {ico:'\u{1F5D3}\uFE0F', t:'\u0110ang s\u1eafp x\u1ebfp l\u1ecbch gia \u0111\u00ecnh'},
    {ico:'\u{1F91D}', t:'\u0110ang x\u00e1c \u0111\u1ecbnh ai c\u1ea7n chu\u1ea9n b\u1ecb v\u00e0 ai th\u1ef1c hi\u1ec7n'}
  ];

  HF.EXAMPLE_DUMPS = [
    'Th\u1ee9 7 B\u1ea1n l\u1edbn h\u1ecdc ti\u1ebfng Anh l\u00fac 9h, b\u1ed1 \u0111\u01b0a con \u0111i. Ch\u1ee7 nh\u1eadt sinh nh\u1eadt b\u00e0 n\u00ean th\u1ee9 6 nh\u1edb mua qu\u00e0.',
    'Th\u1ee9 4 B\u1ea1n nh\u1ecf \u0111i kh\u00e1m r\u0103ng l\u00fac 14h. \u0110\u1eebng qu\u00ean \u0111\u00f3ng ti\u1ec1n \u0111i\u1ec7n tr\u01b0\u1edbc th\u1ee9 5.',
    'Cu\u1ed1i tu\u1ea7n c\u1ea3 nh\u00e0 d\u1ecdn ph\u00f2ng kh\u00e1ch. Mai mua \u0111\u1ed3 \u0103n s\u00e1ng cho c\u1ea3 tu\u1ea7n.'
  ];
})();