(function(){
  const HF = window.HF = window.HF || {};

  const WEEKDAYS = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];

  function yearsAgo(years){
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setFullYear(d.getFullYear()-years);
    return d.toISOString().slice(0,10);
  }

  HF.MEMBERS = [
    {id:'me',  name:'M\u1eb9',  short:'M\u1eb9',  color:'#8B6FB8', soft:'#EFE9F8', emoji:'\u{1F469}', kind:'adult', role:'M\u1eb9',  dob:'',    gender:'N\u1eef'},
    {id:'bo',  name:'B\u1ed1',  short:'B\u1ed1',  color:'#5B9BD5', soft:'#E3F0FB', emoji:'\u{1F468}', kind:'adult', role:'B\u1ed1',  dob:'',    gender:'Nam'},
    {id:'bin', name:'B\u1ea1n l\u1edbn', short:'B\u1ea1n l\u1edbn', color:'#F2A65A', soft:'#FDF0E0', emoji:'\u{1F9D2}', kind:'kid', role:'Con', dob:yearsAgo(12), gender:'Nam'},
    {id:'su',  name:'B\u1ea1n nh\u1ecf', short:'B\u1ea1n nh\u1ecf', color:'#EF8FA3', soft:'#FDE9EE', emoji:'\u{1F467}', kind:'kid', role:'Con', dob:yearsAgo(8), gender:'N\u1eef'}
  ];

  HF.ROLES = ['B\u1ed1','M\u1eb9','Ng\u01b0\u1eddi ch\u0103m s\u00f3c','Con','Kh\u00e1c'];
  HF.GENDERS = ['', 'Nam', 'N\u1eef'];

  HF.CATEGORIES = {
    school:   {label:'Học tập',   emoji:'🎒', color:'#5B9BD5', soft:'#E3F0FB'},
    bill:     {label:'Hóa đơn',   emoji:'💳', color:'#8B6FB8', soft:'#EFE9F8'},
    health:   {label:'Sức khỏe',  emoji:'🏥', color:'#E05D5D', soft:'#FBE7E7'},
    event:    {label:'Sự kiện',   emoji:'🎂', color:'#EF8FA3', soft:'#FDE9EE'},
    shopping: {label:'Mua sắm',   emoji:'🛒', color:'#F2A65A', soft:'#FDF0E0'},
    home:     {label:'Việc nhà',  emoji:'🏠', color:'#7FA98B', soft:'#E8F1EA'},
    kids:     {label:'Con cái',   emoji:'⭐', color:'#E8936F', soft:'#FBE9E0'}
  };

  HF.weekdayName = function(date){
    return WEEKDAYS[date.getDay()];
  };

  HF.formatDay = function(date){
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    return `${WEEKDAYS[d.getDay()]} ${dd}/${mm}`;
  };

  HF.dayOffset = function(n){
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate()+n);
    return d;
  };

  HF.isSameDay = function(a,b){
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  };

  HF.memberById = function(id){
    return HF.MEMBERS.find(m=>m.id===id) || HF.MEMBERS[0];
  };

  HF.categoryById = function(id){
    return HF.CATEGORIES[id] || HF.CATEGORIES.home;
  };

  const SEED = [
    {id:'s1', title:'Đưa Bạn lớn đi học tiếng Anh', cat:'school', due:HF.dayOffset(1), time:'09:00', owner:'bo', planner:'me', status:'open', pts:2, mental:true, kidOk:false, src:'seed'},
    {id:'s2', title:'Đi siêu thị mua đồ cuối tuần', cat:'shopping', due:HF.dayOffset(1), time:'', owner:'bo', planner:'me', status:'open', pts:2, mental:true, kidOk:true, src:'seed'},
    {id:'s3', title:'Mua quà sinh nhật bà', cat:'event', due:HF.dayOffset(0), time:'', owner:'bo', planner:'me', status:'open', pts:1, mental:true, kidOk:false, src:'seed'},
    {id:'s4', title:'Chuẩn bị sinh nhật bà', cat:'event', due:HF.dayOffset(2), time:'', owner:'me', planner:'me', status:'open', pts:2, mental:true, kidOk:false, src:'seed'},
    {id:'s5', title:'Bạn nhỏ đi khám răng định kỳ', cat:'health', due:HF.dayOffset(4), time:'14:00', owner:'bo', planner:'me', status:'open', pts:2, mental:true, kidOk:false, src:'seed'},
    {id:'s6', title:'Nộp học phí lớp vẽ của Bạn lớn', cat:'bill', due:HF.dayOffset(3), time:'', owner:'me', planner:'me', status:'open', pts:1, mental:true, kidOk:false, src:'seed'},
    {id:'s7', title:'Đóng tiền điện tháng này', cat:'bill', due:HF.dayOffset(5), time:'', owner:'me', planner:'me', status:'open', pts:1, mental:true, kidOk:false, src:'seed'},
    {id:'s8', title:'Lau dọn phòng khách', cat:'home', due:HF.dayOffset(1), time:'', owner:'bin', planner:null, status:'open', pts:1, mental:false, kidOk:true, src:'seed'},
    {id:'s9', title:'Tưới cây và cho cá ăn', cat:'home', due:HF.dayOffset(1), time:'', owner:'su', planner:null, status:'open', pts:1, mental:false, kidOk:true, src:'seed'},
    {id:'s10', title:'Nấu bữa tối Chủ nhật cho cả nhà', cat:'home', due:HF.dayOffset(2), time:'', owner:'me', planner:'me', status:'open', pts:2, mental:true, kidOk:false, src:'seed'},
    {id:'s11', title:'Giặt đồ và gấp quần áo', cat:'home', due:HF.dayOffset(1), time:'', owner:'bo', planner:'me', status:'open', pts:2, mental:true, kidOk:true, src:'seed'},
    {id:'s12', title:'Nhắc Bạn lớn chuẩn bị balo trước khi ngủ', cat:'kids', due:HF.dayOffset(0), time:'20:30', owner:'bin', planner:'me', status:'open', pts:1, mental:true, kidOk:true, src:'seed'},
    {id:'s13', title:'Đọc truyện cho Bạn nhỏ trước khi ngủ', cat:'kids', due:HF.dayOffset(0), time:'21:00', owner:'bo', planner:null, status:'open', pts:1, mental:false, kidOk:false, src:'seed'},
    {id:'s14', title:'Gấp quần áo của mình', cat:'home', due:HF.dayOffset(1), time:'', owner:'bin', planner:null, status:'open', pts:1, mental:false, kidOk:true, src:'seed'},
    {id:'s15', title:'Lau bàn ăn sau bữa cơm', cat:'home', due:HF.dayOffset(1), time:'', owner:'su', planner:null, status:'open', pts:1, mental:false, kidOk:true, src:'seed'},
    {id:'s16', title:'Chuẩn bị chuyến đi cuối tuần', cat:'event', due:HF.dayOffset(2), time:'', owner:'me', planner:'me', status:'open', pts:3, mental:true, kidOk:false, src:'seed'},
    {id:'s17', title:'Thu dọn đồ chơi', cat:'home', due:HF.dayOffset(1), time:'', owner:'me', planner:'me', status:'open', pts:1, mental:true, kidOk:true, src:'seed'},
    {id:'s18', title:'Chuẩn bị cặp sách', cat:'kids', due:HF.dayOffset(0), time:'19:30', owner:'me', planner:'me', status:'open', pts:1, mental:true, kidOk:true, src:'seed'},
    {id:'d1', title:'Đưa Bạn lớn đi học buổi sáng', cat:'school', due:HF.dayOffset(-1), time:'07:30', owner:'bo', planner:'me', status:'done', doneAt:HF.dayOffset(-1), pts:1, mental:false, src:'seed'},
    {id:'d2', title:'Đổ rác và lau bếp', cat:'home', due:HF.dayOffset(-2), time:'', owner:'bin', planner:'me', status:'done', doneAt:HF.dayOffset(-2), pts:1, mental:false, src:'seed'},
    {id:'d3', title:'Cho cá ăn mỗi sáng', cat:'home', due:HF.dayOffset(-3), time:'', owner:'su', planner:'me', status:'done', doneAt:HF.dayOffset(-3), pts:1, mental:false, src:'seed'},
    {id:'d4', title:'Đặt lịch khám răng cho Su', cat:'health', due:HF.dayOffset(-4), time:'', owner:'me', planner:'me', status:'done', doneAt:HF.dayOffset(-4), pts:1, mental:true, src:'seed'},
    {id:'d5', title:'Thanh toán tiền nước', cat:'bill', due:HF.dayOffset(-5), time:'', owner:'me', planner:'me', status:'done', doneAt:HF.dayOffset(-5), pts:1, mental:true, src:'seed'},
    {id:'d6', title:'Đưa cả nhà đi chơi công viên', cat:'event', due:HF.dayOffset(-6), time:'', owner:'bo', planner:'me', status:'done', doneAt:HF.dayOffset(-6), pts:2, mental:true, src:'seed'}
  ];

  const KEY = 'homeflow_state_v1';

  const MEMBER_COLORS = ['#8B6FB8','#5B9BD5','#F2A65A','#EF8FA3','#7FA98B','#E8936F','#E05D5D','#6BB5A9'];
  const ADULT_EMOJI = ['\u{1F469}','\u{1F468}','\u{1F475}','\u{1F474}'];
  const KID_EMOJI = ['\u{1F9D2}','\u{1F467}','\u{1F466}','\u{1F476}'];

  HF.addMember = function(profile){
    const used = new Set(HF.MEMBERS.map(m=>m.color));
    const color = MEMBER_COLORS.find(c=>!used.has(c)) || MEMBER_COLORS[MEMBER_COLORS.length-1];
    const pool = profile.kind==='kid' ? KID_EMOJI : ADULT_EMOJI;
    const emoji = profile.emoji || pool[HF.MEMBERS.filter(m=>m.kind===profile.kind).length % pool.length];
    const m = Object.assign({
      id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,4),
      name:profile.name, short:profile.name, color, soft:color+'26', emoji,
      kind:profile.kind, role:profile.role||'Kh\u00e1c', dob:profile.dob||'', gender:profile.gender||''
    }, profile.id?{id:profile.id}:{});
    HF.MEMBERS.push(m);
    return m;
  };

  HF.updateMember = function(id, patch, state){
    const m = HF.MEMBERS.find(x=>x.id===id);
    if(!m) return;
    Object.assign(m, patch);
    if(patch.name) m.short = patch.name;
    if(patch.role) m.kind = patch.role==='Con' ? 'kid' : 'adult';
    HF.saveState(state);
  };

  HF.removeMember = function(id, state){
    state.tasks.forEach(t=>{
      if(t.owner===id){ t.owner='me'; t.shared=false; }
      if(t.planner===id){ t.planner='me'; }
    });
    state.history.health = state.history.health.filter(r=>r.kidId!==id);
    state.history.study = state.history.study.filter(r=>r.kidId!==id);
    HF.MEMBERS = HF.MEMBERS.filter(x=>x.id!==id);
    HF.saveState(state);
  };

  HF.updateTask = function(state, id, patch){
    const t = state.tasks.find(x=>x.id===id);
    if(!t) return;
    Object.assign(t, patch);
    HF.saveState(state);
  };

  HF.deleteTask = function(state, id){
    state.tasks = state.tasks.filter(x=>x.id!==id);
    HF.saveState(state);
  };

  HF.addHistory = function(state, type, rec){
    state.history[type].push(Object.assign({id:HF.uid('h')}, rec));
    HF.saveState(state);
  };

  HF.deleteHistory = function(state, type, id){
    state.history[type] = state.history[type].filter(r=>r.id!==id);
    HF.saveState(state);
  };

  HF.addGrowth = function(state, rec){
    state.growth.push(Object.assign({id:HF.uid('g')}, rec));
    HF.saveState(state);
  };

  HF.updateGrowth = function(state, id, patch){
    const r = state.growth.find(x=>x.id===id);
    if(!r) return;
    Object.assign(r, patch);
    HF.saveState(state);
  };

  HF.deleteGrowth = function(state, id){
    state.growth = state.growth.filter(x=>x.id!==id);
    HF.saveState(state);
  };

  HF.growthFor = function(state, kidId){
    return state.growth.filter(r=>r.kidId===kidId).sort((a,b)=>new Date(a.date)-new Date(b.date));
  };

  function serialize(t){
    return Object.assign({}, t, {
      due: t.due instanceof Date ? t.due.toISOString() : t.due,
      doneAt: t.doneAt instanceof Date ? t.doneAt.toISOString() : (t.doneAt||null)
    });
  }

  function hydrate(t){
    t.due = new Date(t.due);
    if(t.doneAt) t.doneAt = new Date(t.doneAt);
    return t;
  }

  const SEED_HISTORY = {
    health: [
      {id:'h1', kidId:'bin', date:HF.dayOffset(-14), title:'Kh\u00e1m r\u0103ng \u0111\u1ecbnh k\u1ef3', note:'S\u1ea1ch, kh\u00f4ng s\u00e2u r\u0103ng'},
      {id:'h2', kidId:'bin', date:HF.dayOffset(-40), title:'Ti\u00eam ph\u00f2ng c\u00fam m\u00f9a', note:''},
      {id:'h3', kidId:'su', date:HF.dayOffset(-7), title:'Kh\u00e1m r\u0103ng \u0111\u1ecbnh k\u1ef3', note:'H\u1eb9n t\u00e1i kh\u00e1m sau 6 th\u00e1ng'},
      {id:'h4', kidId:'su', date:HF.dayOffset(-60), title:'Kh\u00e1m dinh d\u01b0\u1ee1ng', note:'C\u00e2n n\u1eb7ng \u0111\u1ea1t chu\u1ea9n'}
    ],
    study: [
      {id:'s1', kidId:'bin', date:HF.dayOffset(-30), title:'Gi\u1ea3i ba v\u1ebd tranh c\u1ea5p tr\u01b0\u1eddng', note:'C\u1ea3 nh\u00e0 t\u1ef1 h\u00e0o!'},
      {id:'s2', kidId:'bin', date:HF.dayOffset(-70), title:'Cu\u1ed1i k\u1ef3 m\u00f4n To\u00e1n 9/10', note:''},
      {id:'s3', kidId:'su', date:HF.dayOffset(-20), title:'Ho\u00e0n th\u00e0nh kh\u00f3a b\u01a1i c\u01a1 b\u1ea3n', note:'B\u01a1i \u0111\u01b0\u1ee3c 25m'}
    ]
  };

  HF.loadState = function(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw){
        const s = JSON.parse(raw);
        s.tasks = s.tasks.map(hydrate);
        s.lastDump = s.lastDump||null;
        s.history = s.history || JSON.parse(JSON.stringify(SEED_HISTORY));
        s.family = s.family || {name:'Gia \u0111\u00ecnh HomeFlow', avatar:''};
        s.feedback = s.feedback || [];
        s.growth = s.growth || [];
        if(s.members && s.members.length){
          HF.MEMBERS.length = 0;
          HF.MEMBERS.push(...s.members);
        }
        return s;
      }
    }catch(e){}
    const fresh = {tasks: SEED.map(t=>serialize(t)), lastDump:null, dumpCount:0, history: JSON.parse(JSON.stringify(SEED_HISTORY)), family:{name:'Gia \u0111\u00ecnh HomeFlow', avatar:''}, feedback:[], growth:[]};
    try{ localStorage.setItem(KEY, JSON.stringify(fresh)); }catch(e){}
    return {tasks: SEED.slice().map(t=>Object.assign({},t)), lastDump:null, dumpCount:0, history: JSON.parse(JSON.stringify(SEED_HISTORY)), family:{name:'Gia \u0111\u00ecnh HomeFlow', avatar:''}, feedback:[], growth:[]};
  };

  HF.saveState = function(state){
    try{
      localStorage.setItem(KEY, JSON.stringify({
        tasks: state.tasks.map(serialize),
        lastDump: state.lastDump,
        dumpCount: state.dumpCount||0,
        history: state.history||{health:[],study:[]},
        members: HF.MEMBERS,
        family: state.family||{name:'Gia \u0111\u00ecnh HomeFlow', avatar:''},
        feedback: state.feedback||[],
        growth: state.growth||[]
      }));
    }catch(e){}
  };

  HF.resetState = function(){
    try{ localStorage.removeItem(KEY); }catch(e){}
  };

  HF.uid = function(prefix){
    return (prefix||'t') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  };

  const PLAN_ITEMS = {
    school:   ['Nh\u1edb l\u1ecbch h\u1ecdc', '\u0110\u0103ng k\u00fd l\u1edbp', 'Chu\u1ea9n b\u1ecb s\u00e1ch v\u1edf'],
    health:   ['Nh\u1edb l\u1ecbch kh\u00e1m', 'T\u00ecm n\u01a1i kh\u00e1m', '\u0110\u1eb7t l\u1ecbch', 'Chu\u1ea9n b\u1ecb gi\u1ea5y t\u1edd'],
    bill:     ['Nh\u1edb h\u1ea1n thanh to\u00e1n', 'Chu\u1ea9n b\u1ecb ti\u1ec1n', 'Theo d\u00f5i h\u00f3a \u0111\u01a1n'],
    event:    ['Nh\u1edb d\u1ecbp quan tr\u1ecdng', 'Chu\u1ea9n b\u1ecb qu\u00e0', 'S\u1eafp x\u1ebfp th\u1eddi gian'],
    shopping: ['L\u00ean danh s\u00e1ch mua', 'So s\u00e1nh gi\u00e1', 'Nh\u1edb khuy\u1ebfn m\u00e3i'],
    home:     ['Nh\u1edb vi\u1ec7c c\u1ea7n l\u00e0m', 'Chu\u1ea9n b\u1ecb d\u1ee5ng c\u1ee5'],
    kids:     ['Nh\u1edb th\u00f3i quen c\u1ee7a con', 'Chu\u1ea9n b\u1ecb \u0111\u1ed3 d\u00f9ng']
  };

  HF.planningItems = function(task){
    return PLAN_ITEMS[task.cat] || PLAN_ITEMS.home;
  };

  HF.executionItems = function(task, override){
    if(override) return override;
    const t = task.title;
    return [t.charAt(0).toLowerCase() + t.slice(1)];
  };
})();