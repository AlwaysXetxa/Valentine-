
/* ============================================================
   ⚙️  EDIT DI SINI — Semua isi personal ada di satu tempat.
   Tinggal ganti "url" di bawah dengan link foto/audio kamu.
   ============================================================ */
const CONFIG = {
  password: "0101",
  passwordClue: "Tanggal & Bulan Ulang Tahun kita.",

  audio: {
    // musik latar, otomatis play saat password benar / masuk hub
    bgm: "",           // contoh: "https://example.com/musik-latar.mp3"
    // suara saat password salah
    wrongPin: ""       // contoh: "https://example.com/wrong.mp3"
  },

  letters: [
    {
      eyebrow: "Dear,",
      title: "My Favorite Person",
      body: "Kalau kamu sedang membaca ini, berarti kamu sudah membuka sedikit bagian dari hatiku. Aku bukan orang yang pandai merangkai kata, tapi semoga lewat surat kecil ini kamu bisa merasakan semuanya."
    },
    {
      eyebrow: "A Little",
      title: "Reminder",
      body: "Kalau suatu hari nanti kamu merasa lelah atau mulai meragukan dirimu sendiri, ingatlah selalu ada seseorang yang melihatmu dengan penuh bangga. Kamu tidak perlu sempurna untuk pantas dicintai — dirimu yang sekarang saja sudah lebih dari cukup."
    }
  ],

  reasons: [
    "Kamu selalu mendukung mimpiku",
    "Kamu selalu mengerti diriku",
    "Kamu membuat hidupku lebih cerah",
    "Kamu selalu membuatku tersenyum",
    "Kamu selalu ada di sampingku",
    "Kamu selalu peduli padaku"
  ],

  // 3 foto — taruh file fotomu di folder "foto/" lalu ganti nama file di bawah ini.
  // Contoh: foto/foto1.jpg, foto/couple-2.png, dsb. (bukan lagi link URL)
  photos: [
    { url: "foto1.jpg", caption: "I love you, always" },
    { url: "foto2.jpg", caption: "My favorite memory" },
    { url: "foto3.jpg", caption: "Forever & always" }
  ],

  // setiap lagu bisa diisi "url" audio langsung supaya benar-benar bisa diputar
  playlist: [
    { title: "You!", artist: "Lany", url: "https://files.catbox.moe/v288ag.m4a" },
    { title: "Risk It All", artist: "Bruno Mars", url: "" },
    { title: "About You", artist: "The 1975", url: "" },
    { title: "Star", artist: "Colde", url: "" }
  ]
};
/* ============================================================ */

let enteredPin = "";
let currentLetter = 0;
let currentTrack = 0;
let currentPhoto = 0;
let isPlaying = false;
let bgmOn = true;

const bgmAudio = document.getElementById('bgmAudio');
const wrongAudio = document.getElementById('wrongAudio');
const trackAudio = document.getElementById('trackAudio');
if (CONFIG.audio.bgm) bgmAudio.src = CONFIG.audio.bgm;
if (CONFIG.audio.wrongPin) wrongAudio.src = CONFIG.audio.wrongPin;

function safePlay(el){
  if(!el.src) return;
  el.currentTime = el.paused ? el.currentTime : el.currentTime;
  const p = el.play();
  if(p && p.catch) p.catch(()=>{ /* autoplay diblokir browser, abaikan diam-diam */ });
}

const hubVisited = new Set();
const HUB_SECTIONS = ['scene-reasons','scene-photo','scene-playlist'];

function goTo(id){
  const current = document.querySelector('.scene.active');
  const target = document.getElementById(id);

  // tandai section hub sudah dikunjungi saat user kembali darinya
  if(current && HUB_SECTIONS.includes(current.id) && id === 'scene-hub'){
    hubVisited.add(current.id);
    updateHubProgress();
  }

  const doSwitch = ()=>{
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active','blur-out','blur-in'));
    target.classList.add('active','blur-in');
    setTimeout(()=> target.classList.remove('blur-in'), 600);

    const kids = target.querySelectorAll(':scope > *:not(.corner-orn)');
    kids.forEach((el,i)=>{
      el.classList.remove('rise');
      void el.offsetWidth;
      el.style.animationDelay = (i * 70) + 'ms';
      el.classList.add('rise');
    });

    if(id === 'scene-photo') renderPhotoBook();
    if(id === 'scene-reasons') initPetals();
    if(id === 'scene-hub') updateHubProgress();
    if(id === 'scene-ending') startEnding();
  };

  if(current){
    current.classList.add('blur-out');
    setTimeout(doSwitch, 260);
  } else {
    doSwitch();
  }
}

function updateHubProgress(){
  const badge = document.getElementById('hubProgressBadge');
  const cta = document.getElementById('hubFinaleCta');
  if(!badge) return;
  const n = hubVisited.size;
  badge.innerHTML = '<svg class="icon"><use href="#i-heart-fill"/></svg><span>' + n + '/' + HUB_SECTIONS.length + ' terbuka</span>';
  badge.classList.toggle('complete', n === HUB_SECTIONS.length);
  HUB_SECTIONS.forEach(sid=>{
    const key = sid.replace('scene-','');
    const card = document.querySelector('.hub-card[data-section="'+key+'"]');
    if(card) card.classList.toggle('visited', hubVisited.has(sid));
  });
  if(cta) cta.classList.toggle('show', n === HUB_SECTIONS.length);
}

/* ---------- password keypad ---------- */
const pinBoxesEl = document.getElementById('pinBoxes');
function renderPin(){
  const boxes = pinBoxesEl.children;
  for(let i=0;i<4;i++){
    boxes[i].textContent = enteredPin[i] ? '•' : '';
    boxes[i].classList.toggle('filled', !!enteredPin[i]);
  }
}
document.getElementById('keypad').addEventListener('click', (e)=>{
  const btn = e.target.closest('.key');
  if(!btn) return;
  const k = btn.dataset.k;
  if(k === 'clear'){ enteredPin = ""; renderPin(); return; }
  if(k === 'back'){ enteredPin = enteredPin.slice(0,-1); renderPin(); return; }
  if(enteredPin.length >= 4) return;
  enteredPin += k;
  renderPin();
  if(enteredPin.length === 4){
    setTimeout(checkPassword, 220);
  }
});
function checkPassword(){
  if(enteredPin === CONFIG.password){
    safePlay(bgmAudio); // autoplay musik saat pin benar
    playHeartBurst(()=> goTo('scene-unlocked'));
  } else {
    safePlay(wrongAudio); // suara pin salah
    Array.from(pinBoxesEl.children).forEach(b=>b.classList.add('shake'));
    document.getElementById('clueText').innerHTML = 'Clue: ' + CONFIG.passwordClue;
    document.getElementById('clueToast').classList.add('show');
    setTimeout(()=>{
      Array.from(pinBoxesEl.children).forEach(b=>b.classList.remove('shake'));
      document.getElementById('clueToast').classList.remove('show');
      enteredPin = ""; renderPin();
    }, 1400);
  }
}

/* ---------- heart burst (pin benar) — animasi love selama 5 detik ---------- */
function playHeartBurst(done){
  const stage = document.getElementById('stage');
  const burst = document.createElement('div');
  burst.className = 'heart-burst';
  burst.innerHTML = '<svg class="icon hb-core"><use href="#i-heart-fill"/></svg>';

  // ledakan hati ke segala arah
  const n = 16;
  for(let i=0;i<n;i++){
    const piece = document.createElement('div');
    piece.className = 'hb-piece';
    const angle = (Math.PI * 2 * i) / n;
    const dist = 90 + Math.random()*70;
    piece.style.setProperty('--hx', Math.cos(angle)*dist + 'px');
    piece.style.setProperty('--hy', Math.sin(angle)*dist + 'px');
    piece.style.animationDelay = (Math.random()*400) + 'ms';
    piece.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%"><use href="#i-heart-fill"/></svg>';
    burst.appendChild(piece);
  }

  // hati-hati kecil yang mengambang naik perlahan sepanjang 5 detik
  const floaters = 12;
  for(let i=0;i<floaters;i++){
    const f = document.createElement('div');
    f.className = 'hb-float';
    f.style.left = (8 + Math.random()*84) + '%';
    f.style.setProperty('--fs', (0.7 + Math.random()*0.7).toFixed(2));
    f.style.animationDelay = (Math.random()*3200) + 'ms';
    f.style.animationDuration = (2200 + Math.random()*1800) + 'ms';
    f.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%"><use href="#i-heart-fill"/></svg>';
    burst.appendChild(f);
  }

  stage.appendChild(burst);
  burst.classList.add('show');
  setTimeout(()=>{ burst.classList.add('fade-out'); }, 4300);
  setTimeout(()=>{ burst.remove(); if(done) done(); }, 5000);
}

/* ---------- bgm toggle ---------- */
function toggleBgm(){
  bgmOn = !bgmOn;
  if(bgmOn){ safePlay(bgmAudio); }
  else{ bgmAudio.pause(); }
  document.getElementById('soundIcon').innerHTML = '<use href="' + (bgmOn ? '#i-vol' : '#i-mute') + '"/>';
}

/* ---------- envelope: dibuka perlahan & smooth (~6 detik) ---------- */
function openEnvelope(){
  const wrap = document.getElementById('envelopeWrap');
  if(wrap.classList.contains('opened')) return;
  wrap.classList.add('opened');
  document.querySelector('.envelope-hint')?.classList.add('hide');
  spawnEnvelopeSparkles(wrap);

  setTimeout(()=>{ wrap.classList.add('leaving'); }, 5100);
  setTimeout(()=>{ renderLetter(); goTo('scene-letter'); }, 6000);
}

function spawnEnvelopeSparkles(wrap){
  const box = document.createElement('div');
  box.className = 'envelope-sparkles';
  const n = 14;
  for(let i=0;i<n;i++){
    const s = document.createElement('div');
    s.className = 'env-spark';
    s.style.left = (6 + Math.random()*88) + '%';
    s.style.top = (6 + Math.random()*88) + '%';
    s.style.animationDelay = (400 + Math.random()*4200) + 'ms';
    s.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-sparkle"/></svg>';
    box.appendChild(s);
  }
  wrap.appendChild(box);
}

/* ---------- letters (dengan typing effect) ---------- */
let typeTimer = null;
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeWriter(el, text, speed){
  clearInterval(typeTimer);
  el.textContent = '';
  el.classList.add('typing');
  if(reduceMotion){ el.textContent = text; el.classList.remove('typing'); return; }
  let i = 0;
  typeTimer = setInterval(()=>{
    i++;
    el.textContent = text.slice(0, i);
    if(i >= text.length){
      clearInterval(typeTimer);
      el.classList.remove('typing');
    }
  }, speed || 22);
}

function renderLetter(){
  const L = CONFIG.letters[currentLetter];
  document.getElementById('letterEyebrow').textContent = L.eyebrow;
  document.getElementById('letterTitle').textContent = L.title;
  typeWriter(document.getElementById('letterBody'), L.body, 20);
  const dotsWrap = document.getElementById('letterDots');
  dotsWrap.innerHTML = '';
  CONFIG.letters.forEach((_, i)=>{
    const d = document.createElement('div');
    d.className = 'dot' + (i === currentLetter ? ' on' : '');
    dotsWrap.appendChild(d);
  });
  const counter = document.getElementById('letterCounter');
  if(counter) counter.textContent = (currentLetter+1) + '/' + CONFIG.letters.length;
  document.getElementById('letterNextBtn').textContent =
    currentLetter === CONFIG.letters.length - 1 ? 'Masuk' : 'Lanjut';
}
function nextLetter(){
  currentLetter++;
  if(currentLetter >= CONFIG.letters.length){
    goTo('scene-hub');
    return;
  }
  renderLetter();
}

/* ---------- reasons ---------- */
function renderReasons(){
  const grid = document.getElementById('reasonGrid');
  grid.innerHTML = '';
  CONFIG.reasons.forEach(r=>{
    const chip = document.createElement('div');
    chip.className = 'reason-chip';
    chip.innerHTML = '<svg class="icon"><use href="#i-heart-fill"/></svg><span>'+r+'</span>';
    grid.appendChild(chip);
  });
}

/* ---------- petal particles (reasons scene) ---------- */
let petalsInit = false;
function initPetals(){
  const wrap = document.getElementById('petals');
  wrap.innerHTML = '';
  const count = 10;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 10 + Math.random()*10;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random()*94 + '%';
    p.style.color = Math.random() > .5 ? 'var(--blush)' : 'var(--gold-light)';
    p.style.animationDuration = (6 + Math.random()*5) + 's';
    p.style.animationDelay = (Math.random()*6) + 's';
    p.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-petal"/></svg>';
    wrap.appendChild(p);
  }
}

/* ---------- photo book (3 halaman) ---------- */
function renderPhotoBook(){
  const book = document.getElementById('photoBook');
  book.innerHTML = '';
  CONFIG.photos.forEach((ph, i)=>{
    const page = document.createElement('div');
    page.className = 'book-page';
    const img = ph.url
      ? '<img src="'+ph.url+'" alt="foto">'
      : '<svg class="icon"><use href="#i-photo"/></svg>';
    const isLast = i === CONFIG.photos.length - 1;
    const decor = isLast ? `
      <div class="flower3d">
        <div class="petal3d"></div><div class="petal3d"></div><div class="petal3d"></div>
        <div class="petal3d"></div><div class="petal3d"></div>
        <div class="center3d"></div>
      </div>
      <svg class="icon p3-char"><use href="#i-cat"/></svg>
      <div class="p3-overlay show"><span>Selamanya milikku &#10084;</span></div>
    ` : '';
    const sparkles = `
      <div class="cap-sparkle" style="left:12%;bottom:38px;animation-delay:.1s"><svg viewBox="0 0 24 24"><use href="#i-sparkle"/></svg></div>
      <div class="cap-sparkle" style="left:82%;bottom:44px;animation-delay:.9s"><svg viewBox="0 0 24 24"><use href="#i-sparkle"/></svg></div>
      <div class="cap-sparkle" style="left:50%;bottom:26px;animation-delay:1.6s"><svg viewBox="0 0 24 24"><use href="#i-sparkle"/></svg></div>`;
    page.innerHTML = '<div class="frame">'+img+decor+
      '<div class="cap-wrap"><div class="cap-bg"></div>'+sparkles+'<div class="cap">'+(ph.caption || '')+'</div></div>'+
      '</div>';
    book.appendChild(page);
  });
  updatePhotoBook();
}
function updatePhotoBook(){
  const pages = document.querySelectorAll('#photoBook .book-page');
  pages.forEach((p,i)=>{
    p.classList.remove('current','prev','next');
    if(i === currentPhoto) p.classList.add('current');
    else if(i === (currentPhoto - 1 + pages.length) % pages.length) p.classList.add('prev');
    else if(i === (currentPhoto + 1) % pages.length) p.classList.add('next');
  });
  document.getElementById('photoCaptionText').textContent = CONFIG.photos[currentPhoto].caption || '';
  initCaptionParticles();
  const dotsWrap = document.getElementById('photoDots');
  dotsWrap.innerHTML = '';
  CONFIG.photos.forEach((_, i)=>{
    const d = document.createElement('div');
    d.className = 'dot' + (i === currentPhoto ? ' on' : '');
    dotsWrap.appendChild(d);
  });
}
/* partikel lembut di belakang teks ucapan di bawah foto */
function initCaptionParticles(){
  const wrap = document.getElementById('captionParticles');
  if(!wrap) return;
  wrap.innerHTML = '';
  const n = 9;
  for(let i=0;i<n;i++){
    const s = document.createElement('div');
    s.className = 'cap-spark';
    s.style.left = (Math.random()*96) + '%';
    s.style.top = (Math.random()*80) + '%';
    s.style.animationDelay = (Math.random()*3.4) + 's';
    s.style.animationDuration = (2.6 + Math.random()*2.2) + 's';
    s.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-sparkle"/></svg>';
    wrap.appendChild(s);
  }
}
function photoNext(){ currentPhoto = (currentPhoto + 1) % CONFIG.photos.length; updatePhotoBook(); }
function photoPrev(){ currentPhoto = (currentPhoto - 1 + CONFIG.photos.length) % CONFIG.photos.length; updatePhotoBook(); }

// swipe gesture untuk buku foto
let touchStartX = null;
document.getElementById('photoBook').addEventListener('touchstart', e=>{
  touchStartX = e.touches[0].clientX;
}, {passive:true});
document.getElementById('photoBook').addEventListener('touchend', e=>{
  if(touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(dx > 40) photoPrev();
  else if(dx < -40) photoNext();
  touchStartX = null;
}, {passive:true});

/* ---------- playlist ---------- */
function renderPlaylist(){
  const list = document.getElementById('playlistList');
  list.innerHTML = '';
  CONFIG.playlist.forEach((t,i)=>{
    const row = document.createElement('div');
    row.className = 'track' + (i===currentTrack ? ' active-track' : '');
    row.innerHTML = `<span class="num">${i+1}</span><div><b>${t.title}</b><span>${t.artist}</span></div>`;
    row.onclick = ()=>{ currentTrack = i; loadTrack(true); };
    list.appendChild(row);
  });
}
function loadTrack(autoplay){
  const t = CONFIG.playlist[currentTrack];
  document.getElementById('npTitle').textContent = t.title;
  document.getElementById('npArtist').textContent = t.artist;
  document.getElementById('progressBar').style.width = '0%';
  renderPlaylist();
  trackAudio.pause();
  if(t.url){ trackAudio.src = t.url; }
  isPlaying = false;
  setPlayIcon(false);
  document.getElementById('vinyl').classList.remove('playing');
  document.getElementById('eq').classList.remove('playing');
  if(autoplay && t.url){ togglePlay(); }
}
function setPlayIcon(playing){
  document.getElementById('playIcon').innerHTML =
    '<use href="' + (playing ? '#i-pause' : '#i-play') + '"/>';
}
function togglePlay(){
  if(!CONFIG.playlist[currentTrack].url){
    // tidak ada url audio: tampilkan animasi saja
    isPlaying = !isPlaying;
    setPlayIcon(isPlaying);
    document.getElementById('vinyl').classList.toggle('playing', isPlaying);
    document.getElementById('eq').classList.toggle('playing', isPlaying);
    return;
  }
  if(isPlaying){
    trackAudio.pause();
  } else {
    safePlay(trackAudio);
  }
}
trackAudio.addEventListener('play', ()=>{
  isPlaying = true;
  setPlayIcon(true);
  document.getElementById('vinyl').classList.add('playing');
  document.getElementById('eq').classList.add('playing');
});
trackAudio.addEventListener('pause', ()=>{
  isPlaying = false;
  setPlayIcon(false);
  document.getElementById('vinyl').classList.remove('playing');
  document.getElementById('eq').classList.remove('playing');
});
trackAudio.addEventListener('timeupdate', ()=>{
  if(trackAudio.duration){
    document.getElementById('progressBar').style.width = (trackAudio.currentTime/trackAudio.duration*100) + '%';
  }
});
trackAudio.addEventListener('ended', nextTrack);
function nextTrack(){
  currentTrack = (currentTrack + 1) % CONFIG.playlist.length;
  loadTrack(isPlaying);
}
function prevTrack(){
  currentTrack = (currentTrack - 1 + CONFIG.playlist.length) % CONFIG.playlist.length;
  loadTrack(isPlaying);
}

/* ---------- ambient particles (dengan wrapper parallax) ---------- */
const parallaxItems = [];
function initParticles(){
  const wrap = document.getElementById('particles');
  wrap.innerHTML = '';
  parallaxItems.length = 0;
  for(let i=0;i<10;i++){
    const outer = document.createElement('div');
    outer.className = 'parallax-item';
    outer.style.left = Math.random()*100 + '%';
    outer.style.top = Math.random()*100 + '%';
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = 0; s.style.top = 0;
    s.style.animationDelay = (Math.random()*6) + 's';
    s.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-sparkle"/></svg>';
    outer.appendChild(s);
    wrap.appendChild(outer);
    parallaxItems.push({ el: outer, depth: 6 + Math.random()*10 });
  }
  for(let i=0;i<6;i++){
    const outer = document.createElement('div');
    outer.className = 'parallax-item';
    outer.style.left = Math.random()*90 + '%';
    outer.style.bottom = '-30px';
    const h = document.createElement('div');
    h.className = 'heart-drift';
    h.style.left = 0;
    h.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%"><use href="#i-heart-fill"/></svg>';
    h.style.animationDelay = (Math.random()*7) + 's';
    h.style.animationDuration = (7 + Math.random()*4) + 's';
    outer.appendChild(h);
    wrap.appendChild(outer);
    parallaxItems.push({ el: outer, depth: 14 + Math.random()*16 });
  }
}

/* ---------- parallax: hati & bintang ikuti sentuhan/scroll ---------- */
const stageEl = document.getElementById('stage');
function applyParallax(px, py){
  // px, py dalam rentang -1..1
  parallaxItems.forEach(item=>{
    const dx = px * item.depth;
    const dy = py * item.depth;
    item.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
}
if(!reduceMotion){
  stageEl.addEventListener('pointermove', (e)=>{
    const r = stageEl.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - .5) * 2;
    const py = ((e.clientY - r.top) / r.height - .5) * 2;
    applyParallax(px, py);
  });
  stageEl.addEventListener('touchmove', (e)=>{
    if(!e.touches || !e.touches[0]) return;
    const r = stageEl.getBoundingClientRect();
    const t = e.touches[0];
    const px = ((t.clientX - r.left) / r.width - .5) * 2;
    const py = ((t.clientY - r.top) / r.height - .5) * 2;
    applyParallax(px, py);
  }, {passive:true});
  stageEl.addEventListener('wheel', (e)=>{
    const py = Math.max(-1, Math.min(1, e.deltaY / 200));
    applyParallax(0, py);
  }, {passive:true});
}

/* ---------- scene ending (penutup) ---------- */
let endingStarted = false;
function startEnding(){
  if(endingStarted) return;
  endingStarted = true;
  const wrap = document.getElementById('endingConfetti');
  if(!wrap) return;
  for(let i=0;i<14;i++){
    const h = document.createElement('div');
    h.className = 'heart-drift';
    h.style.position='absolute';
    h.style.left = Math.random()*100 + '%';
    h.style.bottom = '-30px';
    h.style.width='13px'; h.style.height='13px';
    h.style.animationDelay = (Math.random()*6) + 's';
    h.style.animationDuration = (6 + Math.random()*5) + 's';
    h.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%"><use href="#i-heart-fill"/></svg>';
    wrap.appendChild(h);
  }
}
function replayJourney(){
  enteredPin = ''; currentLetter = 0; currentPhoto = 0; hubVisited.clear();
  renderPin();
  document.getElementById('envelopeWrap').classList.remove('opened');
  updateHubProgress();
  goTo('scene-lock');
}

/* ---------- splash / opening animation (3.5 detik) ---------- */
function initSplash(){
  const splash = document.getElementById('splash');
  if(!splash) return;
  const dur = reduceMotion ? 300 : 3500;
  setTimeout(()=>{ splash.classList.add('hide'); }, dur);
}

/* ---------- init ---------- */
renderPin();
renderReasons();
loadTrack(false);
initParticles();
initSplash();
