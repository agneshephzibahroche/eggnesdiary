// ── Easter Eggs ──────────────────────────────────────────────────

// ── 1. X button → mini desktop ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Wire close button
  const closeBtn = document.querySelector('.win-btn.close');
  if (closeBtn) closeBtn.addEventListener('click', openDesktop);

  // Egg icon triple-click → crack animation
  const icon = document.querySelector('.title-bar .icon');
  if (icon) {
    let clicks = 0, timer;
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 500);
      if (clicks >= 3) {
        clicks = 0;
        crackEgg(icon);
      }
    });
  }

  // Konami code → Matrix rain
  setupKonami();

  // Status bar secret message on idle
  setupIdleMessage();
});

// ── Mini Desktop ──────────────────────────────────────────────────
function openDesktop() {
  if (document.getElementById('xpDesktop')) return;

  const el = document.createElement('div');
  el.id = 'xpDesktop';
  el.innerHTML = `
    <div class="xpd-bliss">
      <div class="xpd-aurora"></div>
      <div class="xpd-moon"></div>
      <span class="xpd-glitter" style="left:18%;top:60%;animation-duration:4s;animation-delay:-.5s">✨</span>
      <span class="xpd-glitter" style="left:42%;top:72%;animation-duration:5s;animation-delay:-1s">💫</span>
      <span class="xpd-glitter" style="left:66%;top:58%;animation-duration:3.5s;animation-delay:-2s">✦</span>
      <span class="xpd-glitter" style="left:78%;top:65%;animation-duration:4.5s;animation-delay:-.8s">⭐</span>
      <span class="xpd-glitter" style="left:88%;top:45%;animation-duration:3.8s;animation-delay:-1.5s">🌸</span>
    </div>

    <!-- Desktop icons -->
    <div class="xpd-icons">
      <div class="xpd-icon" data-app="mycomputer" ondblclick="openApp('mycomputer')">
        <span>🖥️</span><span>My Computer</span>
      </div>
      <div class="xpd-icon" data-app="diary" ondblclick="openApp('diary')">
        <span>🥚</span><span>eggnesdiary</span>
      </div>
      <div class="xpd-icon" data-app="notepad" ondblclick="openApp('notepad')">
        <span>📝</span><span>Notepad</span>
      </div>
      <div class="xpd-icon" data-app="recycle" ondblclick="openApp('recycle')">
        <span>🗑️</span><span>Recycle Bin</span>
      </div>
      <div class="xpd-icon" data-app="ie" ondblclick="openApp('ie')">
        <span>🌐</span><span>Internet<br>Explorer</span>
      </div>
      <div class="xpd-icon" data-app="mspaint" ondblclick="openApp('mspaint')">
        <span>🎨</span><span>MS Paint</span>
      </div>
    </div>

    <!-- Open windows container -->
    <div id="xpdWindows"></div>

    <!-- Taskbar -->
    <div class="xpd-taskbar">
      <button class="xpd-start" onclick="toggleStart()" id="xpdStartBtn">
        <span class="xpd-start-logo">🪟</span> Start
      </button>
      <div class="xpd-taskbtns" id="xpdTaskBtns"></div>
      <div class="xpd-tray">
        <span class="xpd-tray-icon" title="Volume">🔊</span>
        <span class="xpd-tray-icon" title="Network">🌐</span>
        <span class="xpd-clock" id="xpdClock"></span>
      </div>
    </div>

    <!-- Start Menu -->
    <div class="xpd-startmenu" id="xpdStartMenu">
      <div class="xpd-sm-header">
        <span class="xpd-sm-avatar">🥚</span>
        <span class="xpd-sm-user">agnes</span>
      </div>
      <div class="xpd-sm-body">
        <div class="xpd-sm-left">
          <div class="xpd-sm-item" onclick="openApp('diary');toggleStart()">🥚 eggnesdiary</div>
          <div class="xpd-sm-item" onclick="openApp('notepad');toggleStart()">📝 Notepad</div>
          <div class="xpd-sm-item" onclick="openApp('mspaint');toggleStart()">🎨 MS Paint</div>
          <div class="xpd-sm-item" onclick="openApp('ie');toggleStart()">🌐 Internet Explorer</div>
          <hr style="border-color:rgba(255,255,255,.2);margin:4px 0">
          <div class="xpd-sm-item" onclick="openApp('mycomputer');toggleStart()">🖥️ My Computer</div>
        </div>
        <div class="xpd-sm-right">
          <div class="xpd-sm-ritem">📁 My Documents</div>
          <div class="xpd-sm-ritem">🖼️ My Pictures</div>
          <div class="xpd-sm-ritem">🎵 My Music</div>
          <hr style="border-color:rgba(0,0,0,.15);margin:4px 0">
          <div class="xpd-sm-ritem" onclick="toggleStart();setTimeout(()=>closeDesktop(),300)">
            🚪 Close Desktop
          </div>
        </div>
      </div>
      <div class="xpd-sm-footer">
        <button class="xpd-sm-footbtn" onclick="toggleStart();closeDesktop()">🔴 Shut Down</button>
        <button class="xpd-sm-footbtn" onclick="toggleStart()">🟡 Log Off</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  // Click on desktop = close start menu + deselect icons
  el.addEventListener('click', e => {
    if (e.target.closest('.xpd-startmenu') || e.target.closest('.xpd-start')) return;
    closeStart();
    el.querySelectorAll('.xpd-icon.selected').forEach(i => i.classList.remove('selected'));
  });

  // Icon single-click = select
  el.querySelectorAll('.xpd-icon').forEach(ic => {
    ic.addEventListener('click', e => {
      e.stopPropagation();
      el.querySelectorAll('.xpd-icon.selected').forEach(i => i.classList.remove('selected'));
      ic.classList.add('selected');
    });
  });

  tickClock();
  setInterval(tickClock, 1000);
  el.style.animation = 'xpdFadeIn .25s ease';
}

function closeDesktop() {
  const el = document.getElementById('xpDesktop');
  if (el) {
    el.style.animation = 'xpdFadeOut .2s ease forwards';
    setTimeout(() => el.remove(), 200);
  }
}

function tickClock() {
  const el = document.getElementById('xpdClock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Start Menu ────────────────────────────────────────────────────
function toggleStart() {
  const m = document.getElementById('xpdStartMenu');
  const b = document.getElementById('xpdStartBtn');
  if (!m) return;
  const open = m.classList.toggle('open');
  b.classList.toggle('active', open);
}
function closeStart() {
  const m = document.getElementById('xpdStartMenu');
  const b = document.getElementById('xpdStartBtn');
  if (m) m.classList.remove('open');
  if (b) b.classList.remove('active');
}

// ── App Windows ───────────────────────────────────────────────────

// Clamp window size to viewport
function appSize(desiredW, desiredH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight - 34; // minus taskbar
  const mobile = vw <= 500;
  if (mobile) return { w: vw - 8, h: Math.min(desiredH, vh - 44) };
  return {
    w: Math.min(desiredW, vw - 80),
    h: Math.min(desiredH, vh - 60)
  };
}

const appDefs = {
  mycomputer: {
    title: '🖥️ My Computer',
    w: 380, h: 260,
    content: () => `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;padding:10px">
        ${['💾 C: Drive','💿 D: Drive','🖨️ Printer','📱 Phone','📷 Camera','🎧 Audio'].map(d=>`
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:8px 4px;border-radius:6px;text-align:center"
               onmouseover="this.style.background='#ffe0ff'" onmouseout="this.style.background='transparent'">
            <span style="font-size:30px">${d.split(' ')[0]}</span>
            <span style="font-weight:600">${d.split(' ').slice(1).join(' ')}</span>
          </div>`).join('')}
      </div>`
  },
  diary: {
    title: '🥚 eggnesdiary',
    w: 340, h: 220,
    content: () => `
      <div style="padding:18px;font-size:13px;line-height:1.8;font-family:Nunito,Tahoma,sans-serif">
        <p style="font-weight:700;font-size:15px;margin-bottom:8px;color:#880044">Welcome to eggnesdiary 🥚</p>
        <p style="color:#440022">A personal diary disguised as a file explorer.</p>
        <p style="margin-top:8px;color:#888;font-size:11px">Version 1.0 — running on vibes and localStorage.</p>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
          <a href="index.html" style="color:#cc0099;font-weight:700;text-decoration:none;padding:4px 12px;border:1px solid #dd99cc;border-radius:6px">👁 Viewer</a>
          <a href="editor.html" style="color:#cc0099;font-weight:700;text-decoration:none;padding:4px 12px;border:1px solid #dd99cc;border-radius:6px">✏️ Editor</a>
        </div>
      </div>`
  },
  notepad: {
    title: '📝 Notepad',
    w: 380, h: 300,
    content: () => `
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="background:#fce8ff;border-bottom:1px solid #dd99cc;padding:3px 6px;font-size:11px;font-weight:600;display:flex;gap:10px;color:#330033;flex-shrink:0">
          <span>File</span><span>Edit</span><span>Format</span><span>Help</span>
        </div>
        <textarea placeholder="Type here… ✨" style="flex:1;border:none;outline:none;padding:8px;font-family:'Nunito',Tahoma,sans-serif;font-size:13px;resize:none;background:#fff;color:#220033;width:100%;min-height:0"></textarea>
      </div>`
  },
  recycle: {
    title: '🗑️ Recycle Bin',
    w: 300, h: 200,
    content: () => `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;padding:20px;text-align:center">
        <span style="font-size:52px">🗑️</span>
        <p style="font-weight:700;font-size:13px;color:#330033">The Recycle Bin is empty.</p>
        <p style="font-size:11px;color:#885599">Your deleted diary entries are gone forever. 🫀</p>
      </div>`
  },
  ie: {
    title: '🌐 Internet Explorer 6',
    w: 420, h: 300,
    content: () => `
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="background:#fce8ff;border-bottom:1px solid #dd99cc;padding:4px 8px;display:flex;gap:6px;align-items:center;font-size:11px;font-weight:600;color:#330033;flex-shrink:0;flex-wrap:wrap">
          <span style="opacity:.5">◀ ▶ ✕ 🔄</span>
          <div style="flex:1;min-width:80px;background:#fff;border:1px solid #dd99cc;border-radius:4px;padding:2px 6px;font-size:11px;color:#885599">
            about:blank
          </div>
          <span>Go</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#fff;font-size:12px;color:#885599;padding:16px;text-align:center">
          <span style="font-size:44px">🌐</span>
          <p style="font-weight:700;color:#5b0092;font-size:13px">Windows Internet Explorer</p>
          <p>This page cannot be displayed.</p>
          <p style="font-size:10px;line-height:1.7">• Make sure the web address is correct<br>• Check your dial-up connection<br>• Try again later</p>
        </div>
      </div>`
  },
  mspaint: {
    title: '🎨 Paint',
    w: 440, h: 340,
    content: () => {
      const id = 'paintCanvas_' + Date.now();
      setTimeout(() => initPaint(id), 50);
      return `
        <div style="display:flex;flex-direction:column;height:100%">
          <div style="background:#fce8ff;border-bottom:1px solid #dd99cc;padding:3px 6px;font-size:11px;font-weight:600;display:flex;gap:10px;color:#330033;flex-shrink:0">
            <span>File</span><span>Edit</span><span>View</span><span>Image</span><span>Colors</span>
          </div>
          <div style="display:flex;flex:1;overflow:hidden;min-height:0">
            <div style="width:40px;background:#fce8ff;border-right:1px solid #dd99cc;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 2px;font-size:18px;flex-shrink:0">
              ✏️🔲⭕🪣🧹
            </div>
            <div id="${id}_wrap" style="flex:1;overflow:auto;background:#aa66aa;padding:4px;position:relative">
              <canvas id="${id}" width="400" height="260" style="background:#fff;cursor:crosshair;display:block;max-width:100%;touch-action:none"></canvas>
            </div>
          </div>
          <div style="background:#fce8ff;border-top:1px solid #dd99cc;padding:4px 8px;font-size:11px;display:flex;gap:12px;align-items:center;flex-shrink:0;flex-wrap:wrap">
            <label style="display:flex;align-items:center;gap:4px;font-weight:600;color:#330033">
              Color <input type="color" id="${id}_color" value="#cc0099" style="width:28px;height:20px;padding:0;border:none;cursor:pointer;border-radius:3px">
            </label>
            <label style="display:flex;align-items:center;gap:4px;font-weight:600;color:#330033">
              Size <input type="range" id="${id}_size" min="1" max="24" value="5" style="width:70px">
            </label>
            <button onclick="document.getElementById('${id}').getContext('2d').clearRect(0,0,9999,9999)"
              style="padding:2px 8px;border:1px solid #dd99cc;border-radius:4px;background:#fff0fc;font-size:10px;cursor:pointer;color:#cc0099;font-weight:700">Clear</button>
          </div>
        </div>`;
    }
  }
};

function initPaint(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let lastX = 0, lastY = 0;

  const getColor = () => document.getElementById(id + '_color')?.value || '#cc0099';
  const getSize  = () => parseInt(document.getElementById(id + '_size')?.value || 5);

  function getPos(e, canvas) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / r.width;
    const scaleY = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return [(src.clientX - r.left) * scaleX, (src.clientY - r.top) * scaleY];
  }

  function startDraw(e) {
    drawing = true;
    [lastX, lastY] = getPos(e, canvas);
    ctx.beginPath();
    ctx.arc(lastX, lastY, getSize() / 2, 0, Math.PI * 2);
    ctx.fillStyle = getColor();
    ctx.fill();
  }
  function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    const [x, y] = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = getColor();
    ctx.lineWidth = getSize();
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [x, y];
  }
  function stopDraw() { drawing = false; }

  canvas.addEventListener('mousedown',  startDraw);
  canvas.addEventListener('mousemove',  moveDraw);
  canvas.addEventListener('mouseup',    stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove',  moveDraw,  { passive: false });
  canvas.addEventListener('touchend',   stopDraw);
}

let winZ = 10;
const openWindows = {};

function openApp(app) {
  if (openWindows[app]) {
    openWindows[app].style.zIndex = ++winZ;
    return;
  }
  const def = appDefs[app];
  if (!def) return;

  const { w, h } = appSize(def.w, def.h);
  const vw = window.innerWidth;
  const mobile = vw <= 500;

  const container = document.getElementById('xpdWindows');
  const count  = Object.keys(openWindows).length;
  const offset = mobile ? 0 : count * 20;

  // Center on mobile, cascade on desktop
  const x = mobile ? Math.round((vw - w) / 2) : Math.min(90 + offset, vw - w - 10);
  const y = mobile ? 4 : Math.min(30 + offset, window.innerHeight - h - 60);

  const win = document.createElement('div');
  win.className = 'xpd-window';
  win.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${++winZ}`;
  win.innerHTML = `
    <div class="xpd-win-title" data-app="${app}">
      <span>${def.title}</span>
      <div class="xpd-win-btns">
        <button class="xpd-wbtn" onclick="minimizeApp('${app}')">─</button>
        <button class="xpd-wbtn" onclick="maximizeApp('${app}')">□</button>
        <button class="xpd-wbtn close" onclick="closeApp('${app}')">✕</button>
      </div>
    </div>
    <div class="xpd-win-body">${def.content()}</div>`;

  container.appendChild(win);
  openWindows[app] = win;
  addTaskBtn(app, def.title);
  makeDraggable(win, win.querySelector('.xpd-win-title'));
  makeResizable(win);

  win.addEventListener('mousedown',  () => { win.style.zIndex = ++winZ; });
  win.addEventListener('touchstart', () => { win.style.zIndex = ++winZ; }, { passive: true });
}

// ── Maximize mini app window ──────────────────────────────────────
const winPrevState = {};
function maximizeApp(app) {
  const win = openWindows[app];
  if (!win) return;
  if (win._maximized) {
    const s = winPrevState[app];
    if (s) { win.style.left = s.l; win.style.top = s.t; win.style.width = s.w; win.style.height = s.h; }
    win._maximized = false;
  } else {
    winPrevState[app] = { l: win.style.left, t: win.style.top, w: win.style.width, h: win.style.height };
    win.style.left   = '0';
    win.style.top    = '0';
    win.style.width  = '100%';
    win.style.height = (window.innerHeight - 34) + 'px';
    win._maximized   = true;
  }
}

function closeApp(app) {
  const win = openWindows[app];
  if (win) win.remove();
  delete openWindows[app];
  removeTaskBtn(app);
}

function minimizeApp(app) {
  const win = openWindows[app];
  if (!win) return;
  win.style.display = win.style.display === 'none' ? '' : 'none';
}

function addTaskBtn(app, title) {
  const bar = document.getElementById('xpdTaskBtns');
  if (!bar) return;
  const btn = document.createElement('button');
  btn.className = 'xpd-taskbtn';
  btn.id = 'taskbtn_' + app;
  btn.textContent = title.slice(0, 18);
  btn.onclick = () => minimizeApp(app);
  bar.appendChild(btn);
}
function removeTaskBtn(app) {
  const btn = document.getElementById('taskbtn_' + app);
  if (btn) btn.remove();
}

// ── Draggable windows ─────────────────────────────────────────────
function makeDraggable(win, handle) {
  let ox = 0, oy = 0, mx = 0, my = 0;
  handle.style.cursor = 'move';

  function startDrag(clientX, clientY) {
    mx = clientX; my = clientY;
    ox = win.offsetLeft; oy = win.offsetTop;
  }
  function doDrag(clientX, clientY) {
    win.style.left = (ox + clientX - mx) + 'px';
    win.style.top  = (oy + clientY - my) + 'px';
  }

  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.xpd-win-btns')) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    const onMove = e => doDrag(e.clientX, e.clientY);
    const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  handle.addEventListener('touchstart', e => {
    if (e.target.closest('.xpd-win-btns')) return;
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  handle.addEventListener('touchmove', e => {
    e.preventDefault();
    doDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
}

// ── Resizable mini windows ────────────────────────────────────────
function makeResizable(win) {
  const handle = document.createElement('div');
  handle.className = 'xpd-resize-handle';
  win.appendChild(handle);

  let startX, startY, startW, startH;
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    startX = e.clientX; startY = e.clientY;
    startW = win.offsetWidth; startH = win.offsetHeight;
    const onMove = e => {
      win.style.width  = Math.max(200, startW + e.clientX - startX) + 'px';
      win.style.height = Math.max(120, startH + e.clientY - startY) + 'px';
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  handle.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startW = win.offsetWidth; startH = win.offsetHeight;
  }, { passive: true });
  handle.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    win.style.width  = Math.max(200, startW + t.clientX - startX) + 'px';
    win.style.height = Math.max(120, startH + t.clientY - startY) + 'px';
  }, { passive: false });
}

// ── Easter Egg 2: Triple-click egg icon → crack ───────────────────
function crackEgg(icon) {
  const frames = ['🥚','🥚','🐣','🐥'];
  let i = 0;
  const iv = setInterval(() => {
    icon.textContent = frames[i++];
    if (i >= frames.length) {
      clearInterval(iv);
      setTimeout(() => { icon.textContent = '🥚'; }, 3000);
    }
  }, 200);
}

// ── Easter Egg 3: Konami code → Matrix rain ───────────────────────
function setupKonami() {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    if (e.key === code[pos]) {
      pos++;
      if (pos === code.length) { pos = 0; matrixRain(); }
    } else {
      pos = e.key === code[0] ? 1 : 0;
    }
  });
}

function matrixRain() {
  if (document.getElementById('matrixCanvas')) return;

  const overlay = document.createElement('div');
  overlay.id = 'matrixOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:pointer;background:#000';
  overlay.title = 'Click to close';

  const canvas = document.createElement('canvas');
  canvas.id = 'matrixCanvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  overlay.appendChild(canvas);

  const msg = document.createElement('div');
  msg.textContent = 'Click to return to reality';
  msg.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#0f0;font-family:monospace;font-size:13px;opacity:.7;letter-spacing:2px';
  overlay.appendChild(msg);

  document.body.appendChild(overlay);

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const cols = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const iv = setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '15px monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > .95 ? '#fff' : '#0f0';
      ctx.fillText(char, i * 16, y * 16);
      if (y * 16 > canvas.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    });
  }, 50);

  overlay.addEventListener('click', () => {
    clearInterval(iv);
    overlay.remove();
  });
}

// ── Easter Egg 4: Idle status messages ───────────────────────────
function setupIdleMessage() {
  const messages = [
    'System idle. Have you drunk water today?',
    'Tip: Ctrl+F to search your memories.',
    'Error 404: Motivation not found.',
    'Scanning for good reads… please wait.',
    'eggnesdiary.exe is not responding.',
    'Your hard drive contains multitudes.',
    'Press any key to continue… any key.',
    'All your entries are belong to us.',
    'It\'s dangerous to go alone. Take a notebook.',
    'Low ink warning. (Emotional cartridge.)',
  ];
  const statusSel = document.getElementById('statusSel');
  if (!statusSel) return;
  let idle, shown = false;
  const resetIdle = () => {
    clearTimeout(idle);
    if (shown) { statusSel.textContent = 'Nothing selected'; shown = false; }
    idle = setTimeout(() => {
      if (statusSel.textContent === 'Nothing selected') {
        statusSel.textContent = messages[Math.floor(Math.random() * messages.length)];
        shown = true;
      }
    }, 12000);
  };
  document.addEventListener('mousemove', resetIdle);
  document.addEventListener('keydown', resetIdle);
  resetIdle();
}
