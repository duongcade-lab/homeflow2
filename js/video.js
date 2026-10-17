(function(){
  if(window.HF && HF.playVideo) return;
  const el = HF.el;

  function fmt(t){
    if(!isFinite(t) || t<0) t = 0;
    const m = Math.floor(t/60), s = Math.floor(t%60);
    return m + ':' + String(s).padStart(2,'0');
  }

  HF.playVideo = function(opts){
    const srcs = (Array.isArray(opts.srcs) && opts.srcs.length) ? opts.srcs : [{src:opts.src}];
    const title = opts.title||'Video';
    const endLabel = opts.endLabel||'';
    const endNav = opts.endNav||null;
    const nav = opts.nav||null;

    const overlay = el('div',{class:'video-overlay'});
    const player = el('div',{class:'video-player'});
    const video = el('video',{class:'video-el', playsInline:'', preload:'auto', 'webkit-playsinline':''});

    let srcIdx = 0;
    function pickSrc(){
      const probe = document.createElement('video');
      for(let i=0;i<srcs.length;i++){
        const s = srcs[i];
        try{
          const sig = (s.mime||'video/mp4') + (s.codecs ? '; codecs="'+s.codecs+'"' : '');
          if(probe.canPlayType(sig)) return i;
        }catch(e){}
      }
      return 0;
    }
    function loadSrc(){
      if(srcIdx >= srcs.length) return false;
      video.src = srcs[srcIdx].src;
      video.load();
      return true;
    }
    srcIdx = pickSrc();
    loadSrc();

    const topBar = el('div',{class:'video-top'},[
      el('div',{class:'video-top-title'},[title]),
      el('button',{class:'video-close','aria-label':'Đóng video'},['\u2715'])
    ]);

    const playBtn = el('button',{class:'video-btn','aria-label':'Tạm dừng'},['\u23F8']);
    const progWrap = el('div',{class:'video-prog'});
    const progFill = el('div',{class:'video-prog-fill'});
    const progKnob = el('div',{class:'video-prog-knob'});
    progWrap.appendChild(progFill);
    progWrap.appendChild(progKnob);
    const timeEl = el('div',{class:'video-time'},['0:00 / 0:00']);
    const volBtn = el('button',{class:'video-btn','aria-label':'Âm lượng'},['\u{1F50A}']);
    const fsBtn = el('button',{class:'video-btn','aria-label':'Toàn màn hình'},['\u26F6']);
    const ctrlBar = el('div',{class:'video-controls'},[playBtn, progWrap, timeEl, volBtn, fsBtn]);

    const endOverlay = el('div',{class:'video-end'},[
      el('div',{class:'video-end-ico'},['\u{1F389}']),
      el('div',{class:'video-end-t'},['Xem xong r\u1ed3i!']),
      endLabel ? el('button',{class:'btn btn-primary video-end-action'},[endLabel]) : null,
      el('button',{class:'btn btn-ghost video-replay'},['\u21BA Xem l\u1ea1i'])
    ]);

    player.append(topBar, video, ctrlBar, endOverlay);
    overlay.appendChild(player);
    document.body.appendChild(overlay);

    let hideTimer = null;
    function showControls(){
      player.classList.remove('hide-ui');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(()=>{
        if(!video.paused && !video.ended) player.classList.add('hide-ui');
      }, 2600);
    }
    function updatePlay(){
      playBtn.textContent = video.paused ? '\u25B6' : '\u23F8';
      playBtn.setAttribute('aria-label', video.paused ? 'Phát' : 'Tạm dừng');
    }
    function updateProgress(){
      const d = video.duration||0;
      const pct = d ? (video.currentTime/d)*100 : 0;
      progFill.style.width = pct+'%';
      progKnob.style.left = 'calc('+pct+'% - 6px)';
      timeEl.textContent = fmt(video.currentTime)+' / '+fmt(d);
    }
    function seekFromEvent(e){
      const r = progWrap.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left)/r.width));
      const d = video.duration;
      if(isFinite(d) && d>0) video.currentTime = x*d;
    }
    function close(){
      video.pause();
      video.removeAttribute('src');
      video.load();
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e){
      if(e.key==='Escape') close();
      if(e.key===' ' || e.key==='Spacebar'){ e.preventDefault(); togglePlay(); }
    }
    function togglePlay(){
      if(video.paused){ video.play().catch(()=>{}); } else { video.pause(); }
      showControls();
    }
    function hasAudio(){
      try{
        if(video.mozHasAudio) return true;
        if(video.audioTracks && video.audioTracks.length) return true;
        if(video.webkitAudioDecodedByteCount > 0) return true;
      }catch(e){}
      return false;
    }

    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', ()=>{ player.classList.contains('hide-ui') ? showControls() : player.classList.add('hide-ui'); });
    video.addEventListener('play', ()=>{ updatePlay(); showControls(); });
    video.addEventListener('pause', ()=>{ updatePlay(); player.classList.remove('hide-ui'); clearTimeout(hideTimer); });
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', ()=>{
      timeEl.textContent = '0:00 / '+fmt(video.duration||0);
      if(!hasAudio()) volBtn.style.display = 'none';
    });
    video.addEventListener('ended', ()=>{
      updatePlay();
      player.classList.remove('hide-ui');
      clearTimeout(hideTimer);
      endOverlay.classList.add('show');
    });
    video.addEventListener('error', ()=>{
      srcIdx++;
      if(!loadSrc()) HF.toast('Không phát được video','\u{1F914}');
    });

    progWrap.addEventListener('click', seekFromEvent);
    progWrap.addEventListener('touchstart', seekFromEvent, {passive:true});

    volBtn.addEventListener('click', ()=>{
      video.muted = !video.muted;
      volBtn.textContent = video.muted ? '\u{1F507}' : '\u{1F50A}';
    });

    fsBtn.addEventListener('click', ()=>{
      const el_ = player;
      if(document.fullscreenElement || document.webkitFullscreenElement){
        (document.exitFullscreen||document.webkitExitFullscreen).call(document);
      }else{
        (el_.requestFullscreen||el_.webkitRequestFullscreen).call(el_);
      }
    });

    overlay.addEventListener('mousemove', showControls);
    overlay.addEventListener('touchstart', showControls, {passive:true});
    topBar.querySelector('.video-close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);

    endOverlay.querySelector('.video-replay').addEventListener('click', ()=>{
      endOverlay.classList.remove('show');
      video.currentTime = 0;
      video.play().catch(()=>{});
      showControls();
    });
    const actionBtn = endOverlay.querySelector('.video-end-action');
    if(actionBtn){
      actionBtn.addEventListener('click', ()=>{
        close();
        if(nav && endNav) nav(endNav);
      });
    }

    video.play().catch(()=>{});
    showControls();
    return { close: close, el: overlay };
  };
})();