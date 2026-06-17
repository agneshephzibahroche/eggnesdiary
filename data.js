// Data layer — Firebase Realtime Database (REST API)

const DB_URL = 'https://eggnesdiary-2a9e2-default-rtdb.asia-southeast1.firebasedatabase.app/diary';

const DEFAULT_FOLDERS = [
  { id: 'reads',   name: 'Reads',   icon: '📚' },
  { id: 'links',   name: 'Links',   icon: '🔗' },
  { id: 'essays',  name: 'Essays',  icon: '📝' },
  { id: 'outfits', name: 'Outfits', icon: '👗' },
  { id: 'media',   name: 'Media',   icon: '🎬' },
  { id: 'misc',    name: 'Misc',    icon: '📁' },
];

let _cache = null;

// ── Bootstrap ─────────────────────────────────────────────────────
async function initData() {
  try {
    const r = await fetch(DB_URL + '.json');
    const d = await r.json();
    _cache = (d && Array.isArray(d.entries)) ? d : { folders: DEFAULT_FOLDERS, entries: [] };
  } catch (_) {
    _cache = { folders: DEFAULT_FOLDERS, entries: [] };
  }
}

function _data() { return _cache || { folders: DEFAULT_FOLDERS, entries: [] }; }

// ── Write to Firebase ─────────────────────────────────────────────
function _persist() {
  return fetch(DB_URL + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(_cache),
  });
}

// ── Real-time subscription (SSE) ──────────────────────────────────
// Used by the viewer to update live when editor saves.
function subscribeToChanges(callback) {
  const es = new EventSource(DB_URL + '.json');
  es.addEventListener('put', e => {
    try {
      const msg = JSON.parse(e.data);
      // msg.path '/' means full replace; deeper paths mean partial update
      if (msg.path === '/' && msg.data) {
        _cache = msg.data;
        callback();
      } else if (msg.data !== null) {
        // Refetch on partial update to keep things simple
        fetch(DB_URL + '.json').then(r => r.json()).then(d => {
          if (d) { _cache = d; callback(); }
        });
      }
    } catch (_) {}
  });
  es.addEventListener('patch', () => {
    fetch(DB_URL + '.json').then(r => r.json()).then(d => {
      if (d) { _cache = d; callback(); }
    });
  });
  return es;
}

// ── Read helpers (synchronous — use after initData) ───────────────
function getFolders()          { return _data().folders; }
function getEntries(folderId)  {
  const { entries } = _data();
  return folderId ? entries.filter(e => e.folderId === folderId) : entries;
}
function getEntry(id)          { return _data().entries.find(e => e.id === id) || null; }

// ── Write helpers ─────────────────────────────────────────────────
function createEntry(entry) {
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...entry,
  };
  _cache.entries.unshift(newEntry);
  _persist();
  return newEntry;
}

function updateEntry(id, patch) {
  const idx = _cache.entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  _cache.entries[idx] = { ..._cache.entries[idx], ...patch, updatedAt: new Date().toISOString() };
  _persist();
  return _cache.entries[idx];
}

function deleteEntry(id) {
  _cache.entries = _cache.entries.filter(e => e.id !== id);
  _persist();
}

// ── Import / Export ───────────────────────────────────────────────
function exportData() {
  return JSON.stringify(_data(), null, 2);
}

async function importData(json) {
  const parsed = JSON.parse(json);
  _cache = parsed;
  await _persist();
}

// ── Formatting helpers ────────────────────────────────────────────
const TYPE_ICONS = {
  reads: '📖', links: '🌐', essays: '📄',
  outfits: '👗', media: '🎞️', misc: '📋',
};

function fileIcon(folderId)  { return TYPE_ICONS[folderId] || '📋'; }

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatSize(content) {
  const len = (content || '').length;
  if (len < 1024) return len + ' B';
  return (len / 1024).toFixed(1) + ' KB';
}
