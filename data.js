// Data layer — localStorage backed

const STORAGE_KEY = 'eggnesdiary_v1';

const DEFAULT_FOLDERS = [
  { id: 'reads',   name: 'Reads',   icon: '📚' },
  { id: 'links',   name: 'Links',   icon: '🔗' },
  { id: 'essays',  name: 'Essays',  icon: '📝' },
  { id: 'outfits', name: 'Outfits', icon: '👗' },
  { id: 'media',   name: 'Media',   icon: '🎬' },
  { id: 'misc',    name: 'Misc',    icon: '📁' },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { folders: DEFAULT_FOLDERS, entries: [] };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getData() { return loadData(); }

function getFolders() { return loadData().folders; }

function getEntries(folderId) {
  const { entries } = loadData();
  return folderId ? entries.filter(e => e.folderId === folderId) : entries;
}

function getEntry(id) {
  return loadData().entries.find(e => e.id === id) || null;
}

function createEntry(entry) {
  const data = loadData();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...entry,
  };
  data.entries.unshift(newEntry);
  saveData(data);
  return newEntry;
}

function updateEntry(id, patch) {
  const data = loadData();
  const idx = data.entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  data.entries[idx] = { ...data.entries[idx], ...patch, updatedAt: new Date().toISOString() };
  saveData(data);
  return data.entries[idx];
}

function deleteEntry(id) {
  const data = loadData();
  data.entries = data.entries.filter(e => e.id !== id);
  saveData(data);
}

function exportData() {
  return JSON.stringify(loadData(), null, 2);
}

function importData(json) {
  const parsed = JSON.parse(json);
  saveData(parsed);
}

// File-type icons based on entry type
const TYPE_ICONS = {
  reads:   '📖',
  links:   '🌐',
  essays:  '📄',
  outfits: '👗',
  media:   '🎞️',
  misc:    '📋',
};

function fileIcon(folderId) {
  return TYPE_ICONS[folderId] || '📋';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatSize(content) {
  const len = (content || '').length;
  if (len < 1024) return len + ' B';
  return (len / 1024).toFixed(1) + ' KB';
}
