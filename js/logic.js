(function(){
  const HF = window.HF = window.HF || {};

  HF.computeLoad = function(tasks){
    const load = {};
    for(const m of HF.MEMBERS){
      load[m.id] = {doing:0, planning:0, doingCount:0, planningCount:0, done:0, doneCount:0};
    }
    for(const t of tasks){
      if(t.status === 'done'){
        const o = load[t.owner] || load.me;
        o.done += t.pts;
        o.doneCount++;
        continue;
      }
      const o = load[t.owner] || load.me;
      o.doing += t.pts;
      o.doingCount++;
      if(t.planner){
        const p = load[t.planner] || load.me;
        p.planning += t.pts;
        p.planningCount++;
      }
    }
    let grand = 0;
    for(const m of HF.MEMBERS){
      load[m.id].total = load[m.id].doing + load[m.id].planning;
      grand += load[m.id].total;
    }
    for(const m of HF.MEMBERS){
      load[m.id].share = grand ? Math.round(load[m.id].total / grand * 100) : 0;
    }
    load.grand = grand;
    return load;
  };

  HF.ringSegments = function(load){
    let acc = 0;
    const segs = [];
    for(const m of HF.MEMBERS){
      const frac = load[m.id].total / (load.grand || 1);
      segs.push({
        member:m,
        frac,
        start:acc,
        end:acc+frac,
        share:load[m.id].share
      });
      acc += frac;
    }
    return segs;
  };

  HF.findImbalance = function(load){
    const arr = HF.MEMBERS.map(m=>({member:m, total:load[m.id].total}));
    arr.sort((a,b)=>b.total-a.total);
    const max = arr[0], min = arr[arr.length-1];
    const spread = max.total - min.total;
    const maxShare = load[max.member.id].share;
    const minShare = load[min.member.id].share;
    if(spread >= 2 && (maxShare - minShare) >= 12){
      return {max, min, spread, gap: maxShare - minShare};
    }
    return null;
  };

  const KID_OK = ['home','shopping','kids'];
  const ADULT_ONLY = ['health','bill'];

  HF.canDo = function(task, member){
    if(member.kind === 'kid') return !!(task.kidOk);
    return true;
  };

  HF.suggestRebalance = function(state){
    const load = HF.computeLoad(state.tasks);
    const imb = HF.findImbalance(load);
    if(!imb) return {imbalance:null, suggestions:[]};

    const from = imb.max.member;
    const others = HF.MEMBERS
      .filter(m=>m.id!==from.id)
      .sort((a,b)=>load[a.id].total-load[b.id].total);

    const candidates = state.tasks.filter(t=>
      t.status==='open' && t.owner===from.id
    ).sort((a,b)=>b.pts-a.pts);

    const suggestions = [];
    const used = new Set();
    for(const to of others){
      const t = candidates.find(c=>!used.has(c.id) && HF.canDo(c, to));
      if(!t) continue;
      used.add(t.id);
      const eligibles = t.kidOk
        ? others.filter(m=>m.kind==='kid')
        : others.filter(m=>m.kind==='adult');
      suggestions.push({
        type:'task',
        task:t,
        from,
        to,
        candidates: eligibles,
        reason: HF.buildReason(t, from, to)
      });
    }
    return {imbalance:imb, suggestions};
  };

  HF.buildReason = function(task, from, to){
    const tName = to.name;
    const reasons = {
      home: `${tName} l\u00e0m vi\u1ec7c n\u00e0y r\u1ea5t \u0111\u00e1ng y\u00eau \u2014 ${from.name} s\u1ebd c\u00f3 th\u00eam th\u1eddi gian ngh\u1ec9 ng\u01a1i`,
      shopping: `Mua s\u1eafm l\u00e0 k\u1ef9 n\u0103ng hay ho \u0111\u1ec3 ${tName} t\u1eadp luy\u1ec7n d\u1ea7n`,
      kids: `${tName} s\u1ebd c\u1ea3m th\u1ea5y \u0111\u01b0\u1ee3c tin t\u01b0\u1edfng khi t\u1ef1 l\u00e0m vi\u1ec7c n\u00e0y`,
      school: `${tName} c\u00f3 th\u1ec3 h\u1ed7 tr\u1ee3 m\u1ed9t ph\u1ea7n, c\u1ea3 nh\u00e0 c\u00f9ng chia s\u1ebb`,
      event: `${tName} \u0111\u1ea3m nh\u1eadn vi\u1ec7c n\u00e0y s\u1ebd gi\u00fap ${from.name} nh\u1eb9 g\u00e1nh h\u01a1n`,
      health: `${tName} \u0111\u1ed3ng h\u00e0nh c\u00f9ng ${from.name} trong vi\u1ec7c n\u00e0y`
    };
    return reasons[task.cat] || reasons.home;
  };

  HF.applyRebalance = function(state, suggestion){
    const t = state.tasks.find(x=>x.id===suggestion.task.id);
    if(!t) return false;
    t.owner = suggestion.to.id;
    HF.saveState(state);
    return true;
  };

  HF.balanceInsight = function(load){
    const totalPlan = HF.MEMBERS.reduce((s,m)=>s+load[m.id].planningCount,0);
    if(totalPlan === 0){
      return {insight:'C\u1ea3 nh\u00e0 m\u00ecnh \u0111ang san s\u1ebb r\u1ea5t \u0111\u1ec1u \u2014 gi\u1eef nh\u1ecbp nh\u00e9 \u{1F49C}', suggest:null};
    }
    const sorted = HF.MEMBERS.slice().sort((a,b)=>load[b.id].planningCount-load[a.id].planningCount);
    const top = sorted[0];
    const share = load[top.id].planningCount/totalPlan;
    if(share > 0.5){
      return {
        insight: `Tu\u1ea7n n\u00e0y, ph\u1ea7n l\u1edbn vi\u1ec7c ph\u1ea3i nh\u1edb v\u00e0 l\u00ean k\u1ebf ho\u1ea1ch \u0111ang t\u1eadp trung v\u00e0o ${top.name}.`,
        suggest: 'C\u00f9ng nhau san s\u1ebb m\u1ed9t v\u00e0i vi\u1ec7c \u0111\u1ec3 tu\u1ea7n t\u1edbi nh\u1eb9 nh\u00e0ng h\u01a1n nh\u00e9 \u{1F49C}'
      };
    }
    const doer = HF.MEMBERS.slice().sort((a,b)=>load[b.id].doingCount-load[a.id].doingCount)[0];
    return {
      insight: `${doer.name} \u0111ang th\u1ef1c hi\u1ec7n nhi\u1ec1u vi\u1ec7c nh\u1ea5t tu\u1ea7n n\u00e0y \u2014 c\u1ea3 nh\u00e0 c\u00f9ng ghi nh\u1eadn \u0111\u00f3ng g\u00f3p c\u1ee7a ${doer.name} nh\u00e9!`,
      suggest: null
    };
  };

  HF.buildBrief = function(state){
    const load = HF.computeLoad(state.tasks);
    const weekAgo = HF.dayOffset(-6);
    const doneThisWeek = state.tasks.filter(t=>t.status==='done' && t.doneAt && t.doneAt >= weekAgo);
    const open = state.tasks.filter(t=>t.status==='open');
    const openSoon = open.filter(t=>t.due <= HF.dayOffset(7));
    const overdue = open.filter(t=>t.due < HF.dayOffset(0));

    const byMember = {};
    for(const t of doneThisWeek){
      byMember[t.owner] = (byMember[t.owner]||0)+1;
    }
    let star = null, starCount = 0;
    for(const m of HF.MEMBERS){
      const c = byMember[m.id]||0;
      if(c > starCount){ starCount = c; star = m; }
    }

    const plannerTotals = HF.MEMBERS.map(m=>({member:m, n:load[m.id].planningCount}))
      .sort((a,b)=>b.n-a.n);
    const topPlanner = plannerTotals[0];

    const nextWeek = open.filter(t=>t.due >= HF.dayOffset(1) && t.due <= HF.dayOffset(7))
      .sort((a,b)=>a.due-b.due).slice(0,3);

    const mentalTotal = open.reduce((s,t)=>s+(t.mental?1:0),0);

    const tips = [];
    if(topPlanner && topPlanner.n > 0){
      tips.push(`${topPlanner.member.name} \u0111ang l\u1eadp k\u1ebf ho\u1ea1ch cho ${topPlanner.n} vi\u1ec7c \u2014 th\u1eed giao cho c\u00e1c con m\u1ed9t vi\u1ec7c \u0111\u1ec3 gi\u1ea3m t\u1ea3i`);
    }
    const kidOpen = open.filter(t=>HF.memberById(t.owner).kind==='kid').length;
    if(kidOpen === 0){
      tips.push('Giao cho Bin ho\u1eb7c Su m\u1ed9t vi\u1ec7c nh\u1ecf trong tu\u1ea7n t\u1edbi \u0111\u1ec3 c\u1ea3 nh\u00e0 c\u00f9ng g\u00e1nh');
    }
    if(overdue.length > 0){
      tips.push(`C\u00f3 ${overdue.length} vi\u1ec7c qu\u00e1 h\u1ea1n \u2014 c\u00f9ng nhau x\u1eed l\u00fd trong h\u00f4m nay nh\u00e9`);
    }
    if(tips.length === 0){
      tips.push('C\u1ea3 nh\u00e0 \u0111ang c\u00e2n b\u1eb1ng r\u1ea5t t\u1ed1t, ti\u1ebfp t\u1ee5c duy tr\u00ec nh\u00e9!');
    }

    return {
      doneThisWeek,
      doneCount: doneThisWeek.length,
      openCount: open.length,
      openSoonCount: openSoon.length,
      overdue,
      star, starCount,
      topPlanner,
      mentalTotal,
      nextWeek,
      tips,
      weekLabel: `${HF.formatDay(weekAgo).split(' ')[1]} \u2013 ${HF.formatDay(HF.dayOffset(0)).split(' ')[1]}`
    };
  };
})();