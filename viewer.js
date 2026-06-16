// ── Viewer state ────────────────────────────────────────────────
let currentFolder = 'all';
let currentView   = 'icons';
let selectedId    = null;

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTree();
  renderFiles();
  document.getElementById('btnSearch').addEventListener('click', openSearch);
  document.getElementById('btnUp').addEventListener('click', () => selectFolder('all'));
  document.getElementById('btnBack').addEventListener('click', () => selectFolder('all'));

  // Live sync: re-render when editor saves in another tab
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) {
      renderTree();
      renderFiles();
      if (selectedId) {
        const still = getEntry(selectedId);
        if (still) openEntry(selectedId);
        else closeDetail();
      }
    }
  });

  // Close search on overlay click
  document.getElementById('searchModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSearch();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDetail(); closeSearch(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); openSearch(); }
  });
});

// ── Tree ──────────────────────────────────────────────────────────
function renderTree() {
  const folders  = getFolders();
  const entries  = getEntries();
  const treeList = document.getElementById('treeList');

  document.getElementById('count-all').textContent = entries.length;

  treeList.innerHTML = folders.map(f => {
    const cnt = entries.filter(e => e.folderId === f.id).length;
    return `
      <div class="tree-item ${currentFolder === f.id ? 'active' : ''}"
           data-folder="${f.id}"
           onclick="selectFolder('${f.id}')">
        <span class="folder-icon">${f.icon}</span>
        <span>${f.name}</span>
        <span class="count" id="count-${f.id}">${cnt}</span>
      </div>`;
  }).join('');

  // Highlight all
  document.querySelector('.tree-item[data-folder="all"]')
    .classList.toggle('active', currentFolder === 'all');
}

// ── Folder selection ──────────────────────────────────────────────
function selectFolder(id) {
  currentFolder = id;
  selectedId    = null;
  closeDetail();
  renderTree();
  renderFiles();
  updateAddress();
  document.getElementById('btnBack').disabled = id === 'all';
  document.getElementById('btnUp').disabled   = id === 'all';
}

// ── Address bar ───────────────────────────────────────────────────
function updateAddress() {
  const folders = getFolders();
  const f = folders.find(x => x.id === currentFolder);
  const path = document.getElementById('addressPath');
  if (!f) {
    path.innerHTML = '<span class="address-crumb" onclick="selectFolder(\'all\')">eggnesdiary</span>';
  } else {
    path.innerHTML =
      `<span class="address-crumb" onclick="selectFolder('all')">eggnesdiary</span>` +
      ` › ${f.icon} ${f.name}`;
  }
  document.getElementById('statusFolder').textContent =
    f ? `eggnesdiary › ${f.name}` : 'eggnesdiary';
}

// ── Files ─────────────────────────────────────────────────────────
function getSorted(entries) {
  const sort = document.getElementById('sortSelect').value;
  return [...entries].sort((a, b) => {
    if (sort === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'date-asc')  return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'name-asc')  return a.title.localeCompare(b.title);
    if (sort === 'name-desc') return b.title.localeCompare(a.title);
    return 0;
  });
}

function renderFiles() {
  const raw     = getEntries(currentFolder === 'all' ? null : currentFolder);
  const entries = getSorted(raw);
  const grid    = document.getElementById('fileGrid');

  document.getElementById('statusCount').textContent =
    `${entries.length} item${entries.length !== 1 ? 's' : ''}`;

  if (entries.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">📂</div>
        <div class="es-title">This folder is empty</div>
        <div class="es-sub">Add entries from the <a href="editor.html" style="color:var(--accent)">Editor</a>.</div>
      </div>`;
    return;
  }

  if (currentView === 'icons') {
    grid.className = 'file-grid view-icons';
    grid.innerHTML = entries.map(e => iconCard(e)).join('');
  } else {
    grid.className = 'file-grid view-list';
    const folders = getFolders();
    const header = `
      <div class="list-header">
        <span></span>
        <span onclick="sortBy('name')">Name</span>
        <span onclick="sortBy('date')">Date</span>
        <span>Type</span>
        <span>Size</span>
      </div>`;
    grid.innerHTML = header + entries.map(e => listRow(e, folders)).join('');
  }

  // Bind clicks
  grid.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => openEntry(el.dataset.id));
    el.addEventListener('dblclick', () => openEntry(el.dataset.id, true));
  });
}

function iconCard(e) {
  const icon = fileIcon(e.folderId);
  const sel  = selectedId === e.id ? 'selected' : '';
  return `
    <div class="file-icon-item ${sel}" data-id="${e.id}">
      <span class="fi-icon">${icon}</span>
      <span class="fi-name">${esc(e.title)}</span>
    </div>`;
}

function listRow(e, folders) {
  const icon = fileIcon(e.folderId);
  const f    = folders.find(x => x.id === e.folderId);
  const sel  = selectedId === e.id ? 'selected' : '';
  return `
    <div class="file-list-item ${sel}" data-id="${e.id}">
      <span class="fl-icon">${icon}</span>
      <span class="fl-name">${esc(e.title)}</span>
      <span class="fl-date">${formatDate(e.createdAt)}</span>
      <span class="fl-type">${f ? f.name : ''}</span>
      <span class="fl-size">${formatSize(e.content)}</span>
    </div>`;
}

// ── Entry detail ──────────────────────────────────────────────────
function openEntry(id, expand) {
  selectedId = id;
  renderFiles(); // re-render to update selection highlight

  const entry   = getEntry(id);
  if (!entry) return;
  const folders = getFolders();
  const f       = folders.find(x => x.id === entry.folderId);

  document.getElementById('detailPanel').classList.remove('hidden');
  document.getElementById('dhIcon').textContent  = fileIcon(entry.folderId);
  document.getElementById('dhTitle').textContent = entry.title;
  document.getElementById('dhSub').textContent   =
    `${f ? f.name : ''} · ${formatDate(entry.createdAt)}`;

  document.getElementById('statusSel').textContent = `"${entry.title}" selected`;

  const body = document.getElementById('detailBody');
  let html = '';

  // Meta
  if (entry.tags && entry.tags.length) {
    html += `<div class="tag-list">${entry.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
  }

  html += `<div class="meta-row"><strong>Date</strong>${formatDate(entry.createdAt)}</div>`;
  if (entry.author) html += `<div class="meta-row"><strong>Author</strong>${esc(entry.author)}</div>`;
  if (entry.source) html += `<div class="meta-row"><strong>Source</strong><a class="entry-link" href="${esc(entry.source)}" target="_blank" rel="noreferrer">${esc(entry.source)}</a></div>`;

  // Image
  if (entry.imageUrl) {
    html += `<img class="entry-image" src="${esc(entry.imageUrl)}" alt="${esc(entry.title)}">`;
  }

  // Content
  if (entry.content) {
    html += `<div class="entry-content">${esc(entry.content)}</div>`;
  }

  // Link
  if (entry.url && !entry.source) {
    html += `<a class="entry-link" href="${esc(entry.url)}" target="_blank" rel="noreferrer">🔗 ${esc(entry.url)}</a>`;
  }

  body.innerHTML = html;
}

function closeDetail() {
  document.getElementById('detailPanel').classList.add('hidden');
  selectedId = null;
  document.getElementById('statusSel').textContent = 'Nothing selected';
  renderFiles();
}

// ── View toggle ───────────────────────────────────────────────────
function setView(v) {
  currentView = v;
  document.getElementById('viewIcons').classList.toggle('active', v === 'icons');
  document.getElementById('viewList').classList.toggle('active', v === 'list');
  renderFiles();
}

// ── Search ────────────────────────────────────────────────────────
function openSearch() {
  document.getElementById('searchModal').classList.add('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  setTimeout(() => document.getElementById('searchInput').focus(), 50);
}
function closeSearch() {
  document.getElementById('searchModal').classList.remove('open');
}
function doSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const out = document.getElementById('searchResults');
  if (!q) { out.innerHTML = ''; return; }

  const results = getEntries().filter(e =>
    e.title.toLowerCase().includes(q) ||
    (e.content || '').toLowerCase().includes(q) ||
    (e.tags || []).some(t => t.toLowerCase().includes(q)) ||
    (e.author || '').toLowerCase().includes(q)
  );

  if (!results.length) {
    out.innerHTML = `<div style="color:var(--text-muted);font-size:12px;padding:8px 0">No results for "${esc(q)}"</div>`;
    return;
  }

  out.innerHTML = results.map(e => `
    <div class="file-list-item" data-id="${e.id}"
         style="border:1px solid var(--border);border-radius:4px;margin-bottom:4px"
         onclick="(function(){closeSearch();selectFolder('${e.folderId}');setTimeout(()=>openEntry('${e.id}'),80);})()">
      <span class="fl-icon">${fileIcon(e.folderId)}</span>
      <span class="fl-name">${esc(e.title)}</span>
      <span class="fl-date">${formatDate(e.createdAt)}</span>
      <span class="fl-type"></span>
      <span class="fl-size"></span>
    </div>`).join('');
}

// ── Sidebar (mobile drawer) ───────────────────────────────────────
function toggleSidebar() {
  const panel   = document.querySelector('.tree-panel');
  const backdrop = document.getElementById('sidebarBackdrop');
  const isOpen  = panel.classList.toggle('open');
  backdrop.classList.toggle('open', isOpen);
}
function closeSidebar() {
  document.querySelector('.tree-panel').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('open');
}

// Auto-close sidebar when folder is selected on mobile
const _origSelectFolder = selectFolder;
// patch selectFolder to close sidebar on narrow screens
const _selectFolderPatched = function(id) {
  if (window.innerWidth <= 600) closeSidebar();
  _origSelectFolder(id);
};
// Override on mobile
window.addEventListener('load', () => {
  document.querySelectorAll('.tree-item').forEach(el => {
    el.addEventListener('click', () => { if (window.innerWidth <= 600) closeSidebar(); });
  });
});

// ── Helpers ───────────────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
