// ── TagVault Shared Data Layer ──────────────────────────────────────
const DB_KEY  = 'tagvault_entries';
const CAT_KEY = 'tagvault_categories';
const ID_KEY  = 'tagvault_next_id';
const SHEET_KEY = 'tagvault_sheets';

const DEFAULT_CATEGORIES = [
  { name: 'CSV',   color: '#a78bfa' },
  { name: 'Excel', color: '#34d399' },
];

const DEFAULT_ENTRIES = [
  { id: 1, title: 'Sample CSV Record',   category: 'CSV',   tags: ['sample', '2024'], createdAt: Date.now() - 86400000 },
  { id: 2, title: 'Sample Excel Report', category: 'Excel', tags: ['report', 'q1'],   createdAt: Date.now() - 3600000  },
];

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || DEFAULT_ENTRIES; }
  catch { return DEFAULT_ENTRIES; }
}

function saveEntries(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function readNextIdSeed() {
  const seededMax = DEFAULT_ENTRIES.reduce((max, entry) => Math.max(max, entry.id), 0);
  try {
    const raw = parseInt(localStorage.getItem(ID_KEY), 10);
    return Number.isFinite(raw) && raw > seededMax ? raw : seededMax;
  } catch {
    return seededMax;
  }
}

function readSheetIdSeed() {
  try {
    const sheets = JSON.parse(localStorage.getItem(SHEET_KEY)) || {};
    return Object.keys(sheets).reduce((max, key) => {
      const id = parseInt(key, 10);
      return Number.isFinite(id) ? Math.max(max, id) : max;
    }, 0);
  } catch {
    return 0;
  }
}

function loadCategories() {
  try { return JSON.parse(localStorage.getItem(CAT_KEY)) || DEFAULT_CATEGORIES; }
  catch { return DEFAULT_CATEGORIES; }
}

function saveCategories(data) {
  localStorage.setItem(CAT_KEY, JSON.stringify(data));
}

function catColor(name, cats) {
  return (cats || loadCategories()).find(c => c.name === name)?.color || '#94a3b8';
}

function tagClass(t) {
  const map = { csv: 'csv', excel: 'excel' };
  return map[t.toLowerCase()] || 'other';
}

function nextId(entries) {
  const currentMax = entries.length ? Math.max(...entries.map(e => e.id)) : 0;
  const next = Math.max(readNextIdSeed(), readSheetIdSeed(), currentMax) + 1;
  localStorage.setItem(ID_KEY, String(next));
  return next;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
