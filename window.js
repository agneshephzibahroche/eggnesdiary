// ── Window chrome behaviour ───────────────────────────────────────
// Handles minimize (─) and maximize/restore (□) for the main app window

document.addEventListener('DOMContentLoaded', () => {
  const minBtn  = document.querySelector('.win-btn:nth-child(1)');
  const maxBtn  = document.querySelector('.win-btn:nth-child(2)');
  if (minBtn) minBtn.addEventListener('click', toggleMinimize);
  if (maxBtn) maxBtn.addEventListener('click', toggleMaximize);

  // Restore windowed state from session (persist across soft-navs)
  if (sessionStorage.getItem('eggnesdiary_windowed') === '1') {
    requestAnimationFrame(enterWindowed);
  }
});

// ── State ─────────────────────────────────────────────────────────
let isMinimized  = false;
let isWindowed   = false;   // false = maximized (default), true = floating window

// ── Minimize ──────────────────────────────────────────────────────
function toggleMinimize() {
  isMinimized ? restoreFromMinimize() : minimize();
}

function minimize() {
  isMinimized = true;

  // Collapse everything below the title bar
  const body = document.querySelector('body');
  body.classList.add('minimized');

  // Show taskbar chip
  ensureTaskbar();
  const chip = document.getElementById('mainTaskChip');
  if (chip) chip.style.display = 'flex';

  // Animate roll-up
  const sections = [...document.querySelectorAll('.menu-bar, .toolbar, .explorer, .status-bar')];
  sections.forEach(el => {
    el.style.transition = 'max-height .22s ease, opacity .18s ease';
    el.style.overflow   = 'hidden';
    el.style.maxHeight  = '0';
    el.style.opacity    = '0';
  });

  // Update button tooltip
  document.querySelector('.win-btn:nth-child(1)').title = 'Restore';
}

function restoreFromMinimize() {
  isMinimized = false;

  const sections = [...document.querySelectorAll('.menu-bar, .toolbar, .explorer, .status-bar')];
  sections.forEach(el => {
    el.style.maxHeight  = '2000px';
    el.style.opacity    = '1';
  });

  setTimeout(() => {
    sections.forEach(el => {
      el.style.transition = '';
      el.style.overflow   = '';
      el.style.maxHeight  = '';
      el.style.opacity    = '';
    });
  }, 260);

  document.querySelector('body').classList.remove('minimized');
  const chip = document.getElementById('mainTaskChip');
  if (chip) chip.style.display = 'none';
  document.querySelector('.win-btn:nth-child(1)').title = 'Minimize';
}

// ── Floating taskbar chip ─────────────────────────────────────────
function ensureTaskbar() {
  if (document.getElementById('mainTaskbar')) return;

  const bar = document.createElement('div');
  bar.id = 'mainTaskbar';
  bar.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 36px;
    background: linear-gradient(to bottom, #245eda 0%, #3f8cf3 8%, #245eda 9%, #1b52c8 50%, #1344b4 51%, #1b52c8 100%);
    border-top: 1px solid #1030a0;
    display: flex; align-items: center; padding: 0 6px; gap: 6px;
    z-index: 300;
    box-shadow: 0 -2px 8px rgba(0,0,0,.4);
    font-family: Tahoma, sans-serif;
  `;

  const chip = document.createElement('button');
  chip.id = 'mainTaskChip';
  chip.style.cssText = `
    display: none;
    align-items: center; gap: 6px;
    padding: 3px 12px; height: 26px;
    background: linear-gradient(to bottom, #1b52c8, #1344b4);
    border: 1px solid #0a2a8a; border-top-color: #4a80e8;
    color: #fff; font-size: 11px; font-family: Tahoma, sans-serif;
    border-radius: 2px; cursor: pointer;
  `;
  chip.innerHTML = '🥚 eggnesdiary';
  chip.onclick = restoreFromMinimize;

  const clock = document.createElement('span');
  clock.style.cssText = `
    margin-left: auto; color: #fff; font-size: 10px;
    padding: 0 8px; border-left: 1px solid rgba(255,255,255,.2);
    white-space: nowrap;
  `;
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  tick();
  setInterval(tick, 1000);

  bar.appendChild(chip);
  bar.appendChild(clock);
  document.body.appendChild(bar);
}

// ── Maximize / Restore (Windowed mode) ───────────────────────────
function toggleMaximize() {
  isWindowed ? exitWindowed() : enterWindowed();
}

function enterWindowed() {
  isWindowed = true;
  sessionStorage.setItem('eggnesdiary_windowed', '1');

  // Inject desktop background
  ensureDesktopBg();

  // Shrink body to a floating window
  document.body.style.transition  = 'all .2s ease';
  document.body.style.position    = 'fixed';
  document.body.style.top         = '30px';
  document.body.style.left        = '30px';
  document.body.style.right       = '30px';
  document.body.style.bottom      = '30px';
  document.body.style.borderRadius = '6px 6px 0 0';
  document.body.style.boxShadow   = '0 8px 40px rgba(0,0,0,.6)';
  document.body.style.overflow    = 'hidden';
  document.body.style.height      = 'auto';

  // Make it draggable by the title bar
  makeDraggableWindow();

  // Update button to restore icon
  const maxBtn = document.querySelector('.win-btn:nth-child(2)');
  if (maxBtn) maxBtn.textContent = '❐';
  if (maxBtn) maxBtn.title = 'Maximize';
}

function exitWindowed() {
  isWindowed = false;
  sessionStorage.removeItem('eggnesdiary_windowed');

  // Remove desktop bg
  const bg = document.getElementById('windowDesktopBg');
  if (bg) { bg.style.opacity = '0'; setTimeout(() => bg.remove(), 200); }

  // Restore full-screen
  document.body.style.transition   = 'all .2s ease';
  document.body.style.position     = '';
  document.body.style.top          = '';
  document.body.style.left         = '';
  document.body.style.right        = '';
  document.body.style.bottom       = '';
  document.body.style.borderRadius = '';
  document.body.style.boxShadow    = '';
  document.body.style.height       = '100vh';

  setTimeout(() => { document.body.style.transition = ''; }, 220);

  // Remove resize handle
  const rh = document.getElementById('winResizeHandle');
  if (rh) rh.remove();

  const maxBtn = document.querySelector('.win-btn:nth-child(2)');
  if (maxBtn) maxBtn.textContent = '□';
  if (maxBtn) maxBtn.title = 'Restore window';
}

// ── Desktop wallpaper background ─────────────────────────────────
function ensureDesktopBg() {
  if (document.getElementById('windowDesktopBg')) return;
  const bg = document.createElement('div');
  bg.id = 'windowDesktopBg';
  bg.style.cssText = `
    position: fixed; inset: 0; z-index: -1;
    background:
      radial-gradient(ellipse 80% 60% at 50% 110%, #4a9e3f 0%, #2d7a24 40%, transparent 70%),
      radial-gradient(ellipse 60% 40% at 30% 120%, #5db84e 0%, transparent 60%),
      linear-gradient(to bottom,
        #5ba8e5 0%, #7bbcf0 18%, #a8d4f7 32%, #c5e3fa 42%,
        #6ab84a 43%, #4ea83a 55%, #3d9230 70%, #2d7020 100%
      );
    transition: opacity .2s;
  `;
  // Cloud puffs
  bg.innerHTML = `<div style="
    position:absolute;top:8%;left:5%;width:160px;height:55px;
    background:rgba(255,255,255,.82);border-radius:50px;
    box-shadow:60px -10px 0 20px rgba(255,255,255,.7),
               120px 5px 0 10px rgba(255,255,255,.6),
               320px -5px 0 30px rgba(255,255,255,.75),
               500px -15px 0 25px rgba(255,255,255,.8);
    filter:blur(2px);
  "></div>`;
  document.body.insertBefore(bg, document.body.firstChild);
  requestAnimationFrame(() => { bg.style.opacity = '1'; });
}

// ── Drag the floating window by its title bar ─────────────────────
function makeDraggableWindow() {
  const handle = document.querySelector('.title-bar');
  if (!handle || handle._dragWired) return;
  handle._dragWired = true;
  handle.style.cursor = 'move';

  let startX, startY, startLeft, startTop;

  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.win-controls')) return;
    e.preventDefault();
    startX    = e.clientX;
    startY    = e.clientY;
    startLeft = parseInt(document.body.style.left)   || 30;
    startTop  = parseInt(document.body.style.top)    || 30;

    const onMove = e => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      document.body.style.left = Math.max(0, startLeft + dx) + 'px';
      document.body.style.top  = Math.max(0, startTop  + dy) + 'px';
      document.body.style.right  = '';
      document.body.style.bottom = '';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Touch drag support
  handle.addEventListener('touchstart', e => {
    if (e.target.closest('.win-controls')) return;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startLeft = parseInt(document.body.style.left) || 30;
    startTop  = parseInt(document.body.style.top)  || 30;
  }, { passive: true });
  handle.addEventListener('touchmove', e => {
    const t = e.touches[0];
    document.body.style.left  = Math.max(0, startLeft + t.clientX - startX) + 'px';
    document.body.style.top   = Math.max(0, startTop  + t.clientY - startY) + 'px';
    document.body.style.right  = '';
    document.body.style.bottom = '';
  }, { passive: true });

  // Resize handle (SE corner)
  const rh = document.createElement('div');
  rh.id = 'winResizeHandle';
  rh.style.cssText = `
    position:fixed; width:16px; height:16px;
    cursor:se-resize; z-index:9999;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; color:rgba(0,0,0,.3); user-select:none;
  `;
  rh.textContent = '⠿';
  document.body.appendChild(rh);

  const posRh = () => {
    const r = document.body.getBoundingClientRect();
    rh.style.left = (r.right - 16) + 'px';
    rh.style.top  = (r.bottom - 16) + 'px';
  };
  posRh();

  rh.addEventListener('mousedown', e => {
    e.preventDefault();
    const startW = document.body.offsetWidth;
    const startH = document.body.offsetHeight;
    const sx = e.clientX, sy = e.clientY;

    const onMove = e => {
      const w = Math.max(320, startW + e.clientX - sx);
      const h = Math.max(240, startH + e.clientY - sy);
      document.body.style.right  = '';
      document.body.style.bottom = '';
      document.body.style.width  = w + 'px';
      document.body.style.height = h + 'px';
      posRh();
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Keep resize handle in corner on drag
  const observer = new MutationObserver(posRh);
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
}
