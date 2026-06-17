// ── Editor state ─────────────────────────────────────────────────
let currentFolder = 'all';
let currentView   = 'icons';
let selectedId    = null;
let editingId     = null;   // null = new entry

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  showSkeleton();
  await initData();
  renderTree();
  renderFiles();

  document.getElementById('btnUp').addEventListener('click',   () => selectFolder('all'));
  document.getElementById('btnBack').addEventListener('click', () => selectFolder('all'));

  // Close modals on overlay click
  ['entryModal','dataModal','confirmModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target === e.currentTarget) document.getElementById(id).classList.remove('open');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeEntryModal(); closeDetail(); closeDataModal(); closeConfirm();
    }
  });

  // Seed demo data only if Firebase is completely empty
  if (getEntries().length === 0) seedDemo();
});

// ── Skeleton ──────────────────────────────────────────────────────
function showSkeleton() {
  const grid = document.getElementById('fileGrid');
  grid.className = 'file-grid view-icons';
  grid.innerHTML = Array(8).fill(0).map(() =>
    `<div class="file-icon-item skeleton-card"></div>`
  ).join('');
}

// ── Demo seed ─────────────────────────────────────────────────────
function seedDemo() {
  createEntry({ folderId: 'reads',   title: 'Parable of the Sower',      author: 'Octavia Butler',    tags: ['scifi','favourite','dystopia'],  content: 'A stunning vision of a near-future America. Lauren\'s journal entries feel terrifyingly real. The concept of Earthseed is one of the most compelling fictional religions ever written.' });
  createEntry({ folderId: 'links',   title: 'The Web We Lost',           url: 'https://anildash.com/2012/12/13/the_web_we_lost/', author: 'Anil Dash', tags: ['internet','nostalgia'], content: 'A beautiful essay about what the early web felt like before platforms swallowed everything.' });
  createEntry({ folderId: 'essays',  title: 'On Keeping a Notebook',     author: 'Joan Didion',       tags: ['writing','memory','favourite'], content: '"We are well advised to keep on nodding terms with the people we used to be, whether we find them attractive company or not."' });
  createEntry({ folderId: 'outfits', title: 'Vintage corduroy moment',   tags: ['autumn','thrifted'], content: 'Brown wide-leg cords from the charity shop on Brick Lane. Cream knit tucked in. Loafers. This is the formula.' });
  createEntry({ folderId: 'media',   title: 'Portrait of a Lady on Fire', author: 'Céline Sciamma',   tags: ['film','favourite','love'],      content: 'Every single frame could be printed and hung. The look-back at the end destroyed me completely.' });
}

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
        <div class="es-sub">Click <strong>+ New Entry</strong> to add something.</div>
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
        <span>Name</span>
        <span>Date</span>
        <span>Type</span>
        <span>Size</span>
      </div>`;
    grid.innerHTML = header + entries.map(e => listRow(e, folders)).join('');
  }

  grid.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click',    () => openEntry(el.dataset.id));
    el.addEventListener('dblclick', () => editEntry(el.dataset.id));
    el.addEventListener('contextmenu', e => { e.preventDefault(); showCtxMenu(e, el.dataset.id); });
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
function openEntry(id) {
  selectedId = id;
  renderFiles();

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

  if (entry.tags && entry.tags.length) {
    html += `<div class="tag-list">${entry.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`;
  }
  html += `<div class="meta-row"><strong>Date</strong>${formatDate(entry.createdAt)}</div>`;
  if (entry.updatedAt !== entry.createdAt) {
    html += `<div class="meta-row"><strong>Edited</strong>${formatDate(entry.updatedAt)}</div>`;
  }
  if (entry.author)   html += `<div class="meta-row"><strong>Author</strong>${esc(entry.author)}</div>`;
  if (entry.source)   html += `<div class="meta-row"><strong>Source</strong>${esc(entry.source)}</div>`;
  if (entry.url)      html += `<div class="meta-row"><strong>URL</strong><a class="entry-link" href="${esc(entry.url)}" target="_blank" rel="noreferrer">${esc(entry.url)}</a></div>`;
  if (entry.imageUrl) html += `<img class="entry-image" src="${esc(entry.imageUrl)}" alt="${esc(entry.title)}">`;
  if (entry.content)  html += `<div class="entry-content">${renderContent(entry.content)}</div>`;

  body.innerHTML = html;
}

function closeDetail() {
  document.getElementById('detailPanel').classList.add('hidden');
  selectedId = null;
  document.getElementById('statusSel').textContent = 'Nothing selected';
  renderFiles();
}

function editCurrentEntry() { if (selectedId) editEntry(selectedId); }

// ── Context menu ──────────────────────────────────────────────────
function showCtxMenu(e, id) {
  removeCtxMenu();
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  menu.id = 'ctxMenu';
  menu.style.left = e.clientX + 'px';
  menu.style.top  = e.clientY + 'px';
  menu.innerHTML = `
    <div class="ctx-item" onclick="openEntry('${id}');removeCtxMenu()">👁 Preview</div>
    <div class="ctx-item" onclick="editEntry('${id}');removeCtxMenu()">✏️ Edit</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" onclick="promptDelete('${id}');removeCtxMenu()">🗑 Delete</div>`;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', removeCtxMenu, { once: true }), 0);
}
function removeCtxMenu() {
  const m = document.getElementById('ctxMenu');
  if (m) m.remove();
}

// ── New / Edit Modal ──────────────────────────────────────────────
function buildFolderGrid(selected) {
  const folders = getFolders();
  return folders.map(f => `
    <div class="folder-choice ${selected === f.id ? 'selected' : ''}"
         onclick="pickFolder('${f.id}')">
      <span>${f.icon}</span><span>${f.name}</span>
    </div>`).join('');
}

function pickFolder(id) {
  document.getElementById('fieldFolder').value = id;
  document.getElementById('folderGrid').innerHTML = buildFolderGrid(id);
}

function openNewEntry() {
  editingId = null;
  document.getElementById('modalTitle').textContent = '📄 New Entry';
  clearForm();
  const defaultFolder = currentFolder !== 'all' ? currentFolder : 'reads';
  pickFolder(defaultFolder);
  document.getElementById('entryModal').classList.add('open');
  setTimeout(() => document.getElementById('fieldTitle').focus(), 80);
}

function editEntry(id) {
  const entry = getEntry(id);
  if (!entry) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = '✏️ Edit Entry';
  clearForm();
  pickFolder(entry.folderId);
  document.getElementById('fieldTitle').value   = entry.title || '';
  document.getElementById('fieldAuthor').value  = entry.author || '';
  document.getElementById('fieldTags').value    = (entry.tags || []).join(', ');
  document.getElementById('fieldUrl').value     = entry.url || '';
  document.getElementById('fieldSource').value  = entry.source || '';
  document.getElementById('fieldImageUrl').value = entry.imageUrl || '';
  document.getElementById('fieldContent').innerHTML = entry.content || '';
  previewImg();
  countChars();
  document.getElementById('entryModal').classList.add('open');
  setTimeout(() => document.getElementById('fieldTitle').focus(), 80);
}

function clearForm() {
  ['fieldTitle','fieldAuthor','fieldTags','fieldUrl','fieldSource','fieldImageUrl'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fieldContent').innerHTML = '';
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('charCount').textContent = '0 characters';
  document.getElementById('folderGrid').innerHTML = buildFolderGrid('reads');
  document.getElementById('fieldFolder').value = 'reads';
}

function closeEntryModal() {
  document.getElementById('entryModal').classList.remove('open');
  editingId = null;
}

function saveEntry() {
  const title = document.getElementById('fieldTitle').value.trim();
  if (!title) {
    document.getElementById('fieldTitle').focus();
    document.getElementById('fieldTitle').style.borderColor = '#e81123';
    return;
  }
  document.getElementById('fieldTitle').style.borderColor = '';

  const tagsRaw = document.getElementById('fieldTags').value;
  const tags    = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const data = {
    folderId: document.getElementById('fieldFolder').value || 'misc',
    title,
    author:   document.getElementById('fieldAuthor').value.trim()   || undefined,
    tags:     tags.length ? tags : undefined,
    url:      document.getElementById('fieldUrl').value.trim()      || undefined,
    source:   document.getElementById('fieldSource').value.trim()   || undefined,
    imageUrl: document.getElementById('fieldImageUrl').value.trim() || undefined,
    content:  document.getElementById('fieldContent').innerHTML.trim() || undefined,
  };

  if (editingId) {
    updateEntry(editingId, data);
  } else {
    const entry = createEntry(data);
    selectedId = entry.id;
  }

  closeEntryModal();
  currentFolder = data.folderId;
  renderTree();
  renderFiles();
  updateAddress();
  if (selectedId) setTimeout(() => openEntry(selectedId), 60);
}

// ── Delete ────────────────────────────────────────────────────────
let pendingDeleteId = null;

function deleteCurrentEntry() {
  if (selectedId) promptDelete(selectedId);
}

function promptDelete(id) {
  const entry = getEntry(id);
  if (!entry) return;
  pendingDeleteId = id;
  document.getElementById('confirmName').textContent = `"${entry.title}"`;
  document.getElementById('confirmModal').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirmModal').classList.remove('open');
  pendingDeleteId = null;
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  deleteEntry(pendingDeleteId);
  if (selectedId === pendingDeleteId) closeDetail();
  pendingDeleteId = null;
  document.getElementById('confirmModal').classList.remove('open');
  renderTree();
  renderFiles();
}

// ── View toggle ───────────────────────────────────────────────────
function setView(v) {
  currentView = v;
  document.getElementById('viewIcons').classList.toggle('active', v === 'icons');
  document.getElementById('viewList').classList.toggle('active',  v === 'list');
  renderFiles();
}

// ── Image preview ─────────────────────────────────────────────────
function previewImg() {
  const url = document.getElementById('fieldImageUrl').value.trim();
  const img = document.getElementById('imgPreview');
  if (url) { img.src = url; img.style.display = 'block'; }
  else     { img.src = ''; img.style.display = 'none'; }
}

// ── Char count ────────────────────────────────────────────────────
function countChars() {
  const len = (document.getElementById('fieldContent').innerText || '').length;
  document.getElementById('charCount').textContent =
    len.toLocaleString() + ' character' + (len !== 1 ? 's' : '');
}

// ── Rich text formatting ──────────────────────────────────────────
function fmt(cmd) {
  document.getElementById('fieldContent').focus();
  document.execCommand(cmd, false, null);
}
function fmtHeading() {
  document.getElementById('fieldContent').focus();
  document.execCommand('formatBlock', false, 'h2');
}
function fmtLink() {
  const url = prompt('Enter URL:');
  if (!url) return;
  document.getElementById('fieldContent').focus();
  document.execCommand('createLink', false, url);
}

// ── Import / Export ───────────────────────────────────────────────
function openImportExport() {
  document.getElementById('dataMsg').textContent = '';
  document.getElementById('dataModal').classList.add('open');
}
function closeDataModal() {
  document.getElementById('dataModal').classList.remove('open');
}

function doExport() {
  const json = exportData();
  const blob = new Blob([json], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `eggnesdiary-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  document.getElementById('dataMsg').textContent = '✓ Exported successfully.';
}

function doImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      await importData(ev.target.result);
      document.getElementById('dataMsg').textContent = '✓ Imported successfully. Reloading…';
      setTimeout(() => location.reload(), 900);
    } catch (_) {
      document.getElementById('dataMsg').textContent = '✗ Invalid JSON file.';
    }
  };
  reader.readAsText(file);
}

// ── Sidebar (mobile drawer) ───────────────────────────────────────
function toggleSidebar() {
  const panel    = document.querySelector('.tree-panel');
  const backdrop = document.getElementById('sidebarBackdrop');
  const isOpen   = panel.classList.toggle('open');
  backdrop.classList.toggle('open', isOpen);
}
function closeSidebar() {
  document.querySelector('.tree-panel').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('open');
}

// Auto-close sidebar when a folder is tapped on mobile
const _origSelectFolderEd = selectFolder;
window.addEventListener('load', () => {
  document.querySelectorAll('.tree-item').forEach(el => {
    el.addEventListener('click', () => { if (window.innerWidth <= 600) closeSidebar(); });
  });
});

// ── Helpers ───────────────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderContent(content) {
  if (!content) return '';
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return typeof DOMPurify !== 'undefined'
      ? DOMPurify.sanitize(content)
      : content.replace(/<script[\s\S]*?<\/script>/gi, '');
  }
  return esc(content).replace(/\n/g, '<br>');
}
