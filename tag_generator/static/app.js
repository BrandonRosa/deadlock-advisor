// ── State ────────────────────────────────────────────────────────────────────
const S = {
  tags:           [],
  heroList:       [],
  currentHero:    null,
  currentBuildIdx: 0,
  heroDirty:      false,
  itemList:       [],
  currentItem:    null,
  itemDirty:      false,
  itemCat:        'All',
  itemSearch:     '',
  editingTagCode: null,   // null = new tag, else code being edited
};

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  get:  (url)      => fetch(url).then(r => r.json()),
  post: (url, d)   => fetch(url, { method:'POST',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(r => r.json()),
  put:  (url, d)   => fetch(url, { method:'PUT',   headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(r => r.json()),
  del:  (url)      => fetch(url, { method:'DELETE' }).then(r => r.json()),
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === id);
  });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page === 'heroes') loadHeroes();
    else if (page === 'items') loadItems();
    else if (page === 'tags') loadTags();
    else if (page === 'calc') loadCalc();
    else if (page === 'qa') loadQA();
    showPage(page);
  });
});

// ── Image helpers ─────────────────────────────────────────────────────────────
function srcUrl(path) {
  if (!path) return '';
  return `/src/${path.replace(/^\//, '')}`;
}

function setImg(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  if (path) { el.src = srcUrl(path); el.style.display = ''; }
  else el.style.display = 'none';
}

// ── Tag value input utils ─────────────────────────────────────────────────────
function applyValClass(input) {
  input.classList.remove('is-null','is-zero','is-pos','is-neg');
  const v = input.value;
  if (v === '' || v === null || v === undefined) { input.classList.add('is-null'); return; }
  const n = parseFloat(v);
  if (isNaN(n))                                  { input.classList.add('is-null'); return; }
  if (n === 0)  input.classList.add('is-zero');
  else if (n > 0) input.classList.add('is-pos');
  else          input.classList.add('is-neg');
}

function inputToVal(input) {
  const v = input.value.trim();
  if (v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function valToInput(input, val) {
  input.value = (val === null || val === undefined) ? '' : String(val);
  applyValClass(input);
}

// ── Follow-chain utilities ─────────────────────────────────────────────────────
function parseWeightEntry(raw) {
  if (raw === null || raw === undefined) return { value: null, rel: '=' };
  if (typeof raw === 'number')           return { value: raw,  rel: '=' };
  if (typeof raw === 'string') {
    if (raw[0] === '+') return { value: parseFloat(raw.slice(1)), rel: '+' };
    if (raw[0] === 'x') return { value: parseFloat(raw.slice(1)), rel: 'x' };
  }
  return { value: null, rel: '=' };
}

function formatWeightEntry(value, rel) {
  if (value === null || value === undefined) return null;
  if (rel === '+') return `+${value}`;
  if (rel === 'x') return `x${value}`;
  return value; // '='
}

function applyRelation(parent, child, rel) {
  if (child === null || child === undefined) return parent ?? null;
  if (rel === '+') return (parent ?? 0) + child;
  if (rel === 'x') return (parent ?? 0) * child;
  return child; // '='
}

function resolveBuildValues(build, heroBuilds, visited) {
  visited = visited || new Set();
  const COLS = ['ally_weight','self_weight','enemy_weight','self_score'];
  if (visited.has(build.name)) {
    const r = {};
    COLS.forEach(col => {
      r[col] = {};
      Object.entries(build.values[col] || {}).forEach(([tag, raw]) => {
        r[col][tag] = parseWeightEntry(raw).value;
      });
    });
    return r;
  }
  visited.add(build.name);
  let parent = null;
  if (build.followed_build) {
    const pb = heroBuilds.find(b => b.name === build.followed_build);
    if (pb) parent = resolveBuildValues(pb, heroBuilds, new Set(visited));
  }
  const r = {};
  COLS.forEach(col => {
    r[col] = {};
    const allTags = new Set([
      ...Object.keys(build.values[col] || {}),
      ...(parent ? Object.keys(parent[col] || {}) : []),
    ]);
    allTags.forEach(tag => {
      const raw = (build.values[col] || {})[tag];
      const { value, rel } = parseWeightEntry(raw !== undefined ? raw : null);
      r[col][tag] = applyRelation(parent ? (parent[col][tag] ?? null) : null, value, rel);
    });
  });
  return r;
}

// ── Resolve build constraints through the follow chain ─────────────────────
// Returns the effective constraints for `build`, merging in everything inherited
// from the chain it follows. Inherited item lists are augmented by own additions
// and reduced by own *_excluded entries. Counter slots fall through cell-by-cell.
const _BC_DEFAULT_SLOTS_RESOLVE = [[0,1],[0,2],[1,2],[2,3],[2,4]];
function resolveBuildConstraints(build, heroBuilds, visited) {
  visited = visited || new Set();
  let parent = null;
  if (build.followed_build && !visited.has(build.name)) {
    const pb = heroBuilds.find(b => b.name === build.followed_build);
    if (pb) {
      const next = new Set(visited); next.add(build.name);
      parent = resolveBuildConstraints(pb, heroBuilds, next);
    }
  }
  const ownSig = new Set(build.signature_items || []);
  const ownReq = new Set(build.required_items  || []);
  const ownBl  = new Set(build.blacklist_items || []);
  const exSig  = new Set(build.signature_items_excluded || []);
  const exReq  = new Set(build.required_items_excluded  || []);
  const exBl   = new Set(build.blacklist_items_excluded || []);

  function merge(parentSet, own, excluded) {
    const out = new Set(parentSet || []);
    excluded.forEach(k => { if (!own.has(k)) out.delete(k); });
    own.forEach(k => out.add(k));
    return out;
  }
  const sig = merge(parent?.signature_items, ownSig, exSig);
  const req = merge(parent?.required_items,  ownReq, exReq);
  const bl  = merge(parent?.blacklist_items, ownBl,  exBl);

  const ownSlots = Array.isArray(build.counter_phase_slots) ? build.counter_phase_slots : [];
  const slots = _BC_DEFAULT_SLOTS_RESOLVE.map((def, i) => {
    const parentCell = parent?.counter_phase_slots?.[i] || def;
    const oc = ownSlots[i];
    if (!Array.isArray(oc)) return parentCell;
    const blank = v => v === null || v === undefined || v === '';
    const lo = blank(oc[0]) ? parentCell[0] : Number(oc[0]);
    const hi = blank(oc[1]) ? parentCell[1] : Number(oc[1]);
    return [Number.isFinite(lo) ? lo : parentCell[0], Number.isFinite(hi) ? hi : parentCell[1]];
  });

  return {
    signature_items: sig,
    required_items:  req,
    blacklist_items: bl,
    counter_phase_slots: slots,
    // For UI: which items came from parent chain, and which the user has excluded
    _parent: {
      signature_items: parent?.signature_items || new Set(),
      required_items:  parent?.required_items  || new Set(),
      blacklist_items: parent?.blacklist_items || new Set(),
      counter_phase_slots: parent?.counter_phase_slots || _BC_DEFAULT_SLOTS_RESOLVE,
    },
    _excluded: { signature_items: exSig, required_items: exReq, blacklist_items: exBl },
  };
}

function wouldCreateCycleJS(builds, buildIdx, targetName) {
  const selfName = builds[buildIdx].name;
  let cur = builds.find(b => b.name === targetName);
  const seen = new Set();
  while (cur && cur.followed_build) {
    if (cur.followed_build === selfName) return true;
    if (seen.has(cur.followed_build)) break;
    seen.add(cur.followed_build);
    cur = builds.find(b => b.name === cur.followed_build);
  }
  return false;
}

function getAvailableFollowOptionsJS(builds, buildIdx) {
  return builds.filter((b, i) =>
    i !== buildIdx && !wouldCreateCycleJS(builds, buildIdx, b.name)
  );
}

// ── Ensure all tags present in a values dict ──────────────────────────────────
function ensureTags(valuesObj, columns) {
  columns.forEach(col => {
    if (!valuesObj[col]) valuesObj[col] = {};
    S.tags.forEach(t => {
      if (!(t.code in valuesObj[col])) valuesObj[col][t.code] = null;
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// TAGS PAGE
// ════════════════════════════════════════════════════════════════════════════
async function loadTags() {
  S.tags = await api.get('/api/tags');
  renderTagsTable();
}

let _dragSrcIdx = null;

function renderTagsTable() {
  const tbody = document.getElementById('tags-body');
  tbody.innerHTML = '';
  S.tags.forEach((tag, idx) => {
    const tr = document.createElement('tr');
    tr.draggable = true;
    tr.dataset.idx = String(idx);
    tr.innerHTML = `
      <td class="drag-cell"><span class="drag-handle" title="Drag to reorder">⠿</span></td>
      <td><span class="tag-code-chip">${tag.code}</span></td>
      <td>${tag.name}</td>
      <td style="color:var(--muted)">${tag.description || ''}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon edit" title="Edit">✏️</button>
          <button class="btn-icon del"  title="Delete">🗑️</button>
        </div>
      </td>`;
    tr.addEventListener('dragstart', e => {
      _dragSrcIdx = idx;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => tr.classList.add('dragging'), 0);
    });
    tr.addEventListener('dragend', () => {
      tr.classList.remove('dragging');
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
    });
    tr.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    tr.addEventListener('dragenter', e => {
      e.preventDefault();
      if (parseInt(tr.dataset.idx) !== _dragSrcIdx) tr.classList.add('drag-over');
    });
    tr.addEventListener('dragleave', () => tr.classList.remove('drag-over'));
    tr.addEventListener('drop', async e => {
      e.preventDefault();
      tr.classList.remove('drag-over');
      const targetIdx = parseInt(tr.dataset.idx);
      if (targetIdx === _dragSrcIdx || _dragSrcIdx === null) return;
      const [moved] = S.tags.splice(_dragSrcIdx, 1);
      S.tags.splice(targetIdx, 0, moved);
      renderTagsTable();
      await api.put('/api/tags', S.tags);
      toast('Order saved');
    });
    tr.querySelector('.btn-icon.edit').addEventListener('click', () => openTagModal(tag));
    tr.querySelector('.btn-icon.del').addEventListener('click',  () => deleteTag(tag.code));
    tbody.appendChild(tr);
  });
}

function openTagModal(tag = null) {
  S.editingTagCode = tag ? tag.code : null;
  document.getElementById('modal-tag-title').textContent = tag ? 'Edit Tag' : 'Add Tag';
  document.getElementById('mt-code').value = tag ? tag.code : '';
  document.getElementById('mt-code').disabled = !!tag;
  document.getElementById('mt-name').value = tag ? tag.name : '';
  document.getElementById('mt-desc').value = tag ? (tag.description || '') : '';
  document.getElementById('modal-tag').classList.remove('hidden');
  document.getElementById('mt-name').focus();
}

document.getElementById('btn-add-tag').addEventListener('click', () => openTagModal());
document.getElementById('mt-cancel').addEventListener('click', () => document.getElementById('modal-tag').classList.add('hidden'));

document.getElementById('mt-save').addEventListener('click', async () => {
  const code = document.getElementById('mt-code').value.trim();
  const name = document.getElementById('mt-name').value.trim();
  const desc = document.getElementById('mt-desc').value.trim();
  if (!code || !name) { toast('Code and name required', 'error'); return; }

  if (S.editingTagCode) {
    await api.put(`/api/tags/${S.editingTagCode}`, { name, description: desc });
  } else {
    const res = await api.post('/api/tags', { code, name, description: desc });
    if (res.error) { toast(res.error, 'error'); return; }
  }
  document.getElementById('modal-tag').classList.add('hidden');
  await loadTags();
  toast('Tag saved');
});

async function deleteTag(code) {
  if (!confirm(`Delete tag "${code}"?`)) return;
  await api.del(`/api/tags/${code}`);
  await loadTags();
  toast('Tag deleted');
}

// ════════════════════════════════════════════════════════════════════════════
// HEROES PAGE
// ════════════════════════════════════════════════════════════════════════════
async function loadHeroes() {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.heroList = await api.get('/api/heroes');
  renderHeroGrid();
}

function makeHeroCard(h) {
  const card = document.createElement('div');
  card.className = 'hero-card' + (h.is_preset ? ' is-preset' : '');
  const imgSrc = srcUrl(h.image_path);
  card.innerHTML = `
    ${imgSrc
      ? `<img class="hero-card-img" src="${imgSrc}" alt="${h.eng_name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="hero-card-img-placeholder" ${imgSrc ? 'style="display:none"' : ''}>${h.is_preset ? '⭐' : '🦸'}</div>
    <div class="hero-card-body">
      <div class="hero-card-name">${h.eng_name || h.normalized_name}</div>
      <div class="hero-card-builds">${h.build_count} build${h.build_count !== 1 ? 's' : ''}</div>
    </div>`;
  card.addEventListener('click', () => openHeroEdit(h.normalized_name));
  return card;
}

function gridSection(label) {
  const el = document.createElement('div');
  el.className = 'grid-section-label';
  el.textContent = label;
  return el;
}

function renderHeroGrid() {
  const grid = document.getElementById('hero-grid');
  grid.innerHTML = '';
  const presets = S.heroList.filter(h => h.is_preset);
  const regular = S.heroList.filter(h => !h.is_preset);
  if (presets.length) {
    grid.appendChild(gridSection('⭐ Presets'));
    presets.forEach(h => grid.appendChild(makeHeroCard(h)));
    grid.appendChild(gridSection('Heroes'));
  }
  regular.forEach(h => grid.appendChild(makeHeroCard(h)));
}

// ── New Hero ──────────────────────────────────────────────────────────────────
document.getElementById('btn-new-hero').addEventListener('click', () => {
  document.getElementById('nh-name').value = '';
  document.getElementById('nh-key').value  = '';
  document.getElementById('modal-new-hero').classList.remove('hidden');
  document.getElementById('nh-name').focus();
});
document.getElementById('nh-cancel').addEventListener('click',  () => document.getElementById('modal-new-hero').classList.add('hidden'));
document.getElementById('nh-name').addEventListener('input', e => {
  document.getElementById('nh-key').value = e.target.value.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_&]/g,'');
});
document.getElementById('nh-confirm').addEventListener('click', async () => {
  const eng_name = document.getElementById('nh-name').value.trim();
  const normalized_name = document.getElementById('nh-key').value.trim();
  if (!eng_name || !normalized_name) { toast('Name and key required', 'error'); return; }
  const res = await api.post('/api/heroes', { eng_name, normalized_name });
  if (res.error) { toast(res.error, 'error'); return; }
  document.getElementById('modal-new-hero').classList.add('hidden');
  await loadHeroes();
  toast(`Hero "${eng_name}" created`);
  openHeroEdit(normalized_name);
});

// ── Hero Edit ─────────────────────────────────────────────────────────────────
async function openHeroEdit(name) {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.currentHero = await api.get(`/api/heroes/${name}`);
  S.currentBuildIdx = 0;
  S.heroDirty = false;

  // Ensure every build has all current tags
  S.currentHero.builds.forEach(b => ensureTags(b.values, HERO_COLS_KEYS));

  renderHeroEditPage();
  showPage('hero-edit');
}

function renderHeroEditPage() {
  const h = S.currentHero;
  document.getElementById('hero-edit-title').textContent = h.eng_name || h.normalized_name;
  document.getElementById('hf-eng-name').value = h.eng_name        || '';
  document.getElementById('hf-key').value      = h.normalized_name || '';
  document.getElementById('hf-desc').value     = h.desc_eng        || '';
  document.getElementById('hf-portrait').value = h.image_path      || '';
  document.getElementById('hf-mini').value     = h.mini_image_path || '';
  document.getElementById('hf-wiki').value     = h.wiki_url        || '';

  setImg('hero-portrait-img', h.image_path);
  setImg('hero-mini-img', h.mini_image_path);
  setHeroDirty(false);
  renderBuildTabs();
  renderBuildContent();
}

// ── Hero field changes ────────────────────────────────────────────────────────
['hf-eng-name','hf-key','hf-desc','hf-portrait','hf-mini','hf-wiki'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const h = S.currentHero;
    if (!h) return;
    h.eng_name        = document.getElementById('hf-eng-name').value;
    h.normalized_name = document.getElementById('hf-key').value;
    h.desc_eng        = document.getElementById('hf-desc').value;
    h.image_path      = document.getElementById('hf-portrait').value;
    h.mini_image_path = document.getElementById('hf-mini').value;
    h.wiki_url        = document.getElementById('hf-wiki').value;
    setImg('hero-portrait-img', h.image_path);
    setImg('hero-mini-img', h.mini_image_path);
    setHeroDirty(true);
  });
});

// ── Build Tabs ────────────────────────────────────────────────────────────────
function renderBuildTabs() {
  const bar = document.getElementById('build-tabs');
  bar.innerHTML = '';
  S.currentHero.builds.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i === S.currentBuildIdx ? ' active' : '');
    btn.innerHTML = `${b.name || `Build ${i+1}`}${i > 0 ? '<span class="tab-close" title="Delete">×</span>' : ''}`;
    btn.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) { deleteBuild(i); return; }
      S.currentBuildIdx = i;
      renderBuildTabs();
      renderBuildContent();
    });
    bar.appendChild(btn);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'tab-add';
  addBtn.title = 'Add Build';
  addBtn.textContent = '+';
  addBtn.addEventListener('click', openAddBuildModal);
  bar.appendChild(addBtn);
}

// ── Build Content ─────────────────────────────────────────────────────────────
const HERO_COLS_KEYS = ['ally_weight','self_weight','enemy_weight','self_score'];

function isBuildEmpty(build) {
  return HERO_COLS_KEYS.every(col => {
    const dict = build.values[col] || {};
    return Object.values(dict).every(v => v === null || v === undefined);
  });
}

function renderBuildContent() {
  const build = S.currentHero.builds[S.currentBuildIdx];
  document.getElementById('bf-name').value = build.name                  || '';
  document.getElementById('bf-code').value = build.normalized_build_name || '';
  document.getElementById('bf-desc').value = build.build_description_eng || '';
  document.getElementById('btn-delete-build').style.display = S.currentBuildIdx === 0 ? 'none' : '';

  // Follow dropdown
  const isGeneral  = (build.name === 'General');
  const followRow  = document.getElementById('bf-follow-row');
  const followSel  = document.getElementById('bf-follow');
  if (followRow) followRow.style.display = isGeneral ? 'none' : '';
  if (followSel && !isGeneral) {
    followSel.innerHTML = '<option value="">— none —</option>';
    getAvailableFollowOptionsJS(S.currentHero.builds, S.currentBuildIdx).forEach(b => {
      const o = document.createElement('option');
      o.value = b.name;
      o.textContent = b.name;
      followSel.appendChild(o);
    });
    followSel.value = build.followed_build || '';
  }

  const showBanner = S.currentBuildIdx === 0 && !S.currentHero.is_preset && isBuildEmpty(build);
  const banner = document.getElementById('preset-banner');
  banner.classList.toggle('hidden', !showBanner);
  if (showBanner) populatePresetBannerHeroes();

  renderHeroTagTable(build);
  renderBuildConstraints();
}

function populatePresetBannerHeroes() {
  const sel = document.getElementById('pb-hero-sel');
  const prev = sel.value;
  sel.innerHTML = '<option value="">— select hero —</option>';

  const presets  = S.heroList.filter(h => h.is_preset);
  const regulars = S.heroList.filter(h => !h.is_preset && h.normalized_name !== S.currentHero.normalized_name);

  function addOption(h) {
    const o = document.createElement('option');
    o.value = h.normalized_name;
    o.textContent = h.eng_name || h.normalized_name;
    return o;
  }

  if (presets.length) {
    const grp = document.createElement('optgroup');
    grp.label = '⭐ Presets';
    presets.forEach(h => grp.appendChild(addOption(h)));
    sel.appendChild(grp);
  }
  if (regulars.length) {
    const grp = document.createElement('optgroup');
    grp.label = 'Heroes';
    regulars.forEach(h => grp.appendChild(addOption(h)));
    sel.appendChild(grp);
  }

  if (prev) { sel.value = prev; populatePresetBannerBuilds(prev); }
  else document.getElementById('pb-build-sel').innerHTML = '<option value="">— select hero first —</option>';
}

async function populatePresetBannerBuilds(heroName) {
  const sel = document.getElementById('pb-build-sel');
  if (!heroName) { sel.innerHTML = '<option value="">— select hero first —</option>'; return; }
  const hero = await api.get(`/api/heroes/${heroName}`);
  sel.innerHTML = '';
  hero.builds.forEach((b, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = b.name || `Build ${i + 1}`;
    sel.appendChild(o);
  });
}

document.getElementById('pb-hero-sel').addEventListener('change', e => {
  populatePresetBannerBuilds(e.target.value);
});

document.getElementById('pb-apply').addEventListener('click', async () => {
  const heroName = document.getElementById('pb-hero-sel').value;
  const buildIdx = parseInt(document.getElementById('pb-build-sel').value || '0');
  if (!heroName) { toast('Select a preset first', 'error'); return; }
  const srcHero  = await api.get(`/api/heroes/${heroName}`);
  const srcBuild = srcHero.builds[buildIdx];
  if (!srcBuild) return;
  const destBuild = S.currentHero.builds[0];
  HERO_COLS_KEYS.forEach(c => {
    destBuild.values[c] = {};
    S.tags.forEach(t => {
      const v = (srcBuild.values[c] || {})[t.code];
      destBuild.values[c][t.code] = (v === undefined) ? null : v;
    });
  });
  setHeroDirty(true);
  renderBuildContent();
  toast('Preset applied');
});

// ── Build meta field changes ──────────────────────────────────────────────────
['bf-name','bf-code','bf-desc'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const b = S.currentHero.builds[S.currentBuildIdx];
    if (!b) return;
    b.name                  = document.getElementById('bf-name').value;
    b.normalized_build_name = document.getElementById('bf-code').value;
    b.build_description_eng = document.getElementById('bf-desc').value;
    // Update tab label live
    document.querySelectorAll('#build-tabs .tab-btn')[S.currentBuildIdx].childNodes[0].textContent = b.name || `Build ${S.currentBuildIdx+1}`;
    setHeroDirty(true);
  });
});

document.getElementById('bf-follow').addEventListener('change', () => {
  const b = S.currentHero.builds[S.currentBuildIdx];
  if (!b) return;
  const val = document.getElementById('bf-follow').value;
  b.followed_build = val || undefined;
  setHeroDirty(true);
  renderHeroTagTable(b);
  renderBuildConstraints();
});

// ── Delete build ──────────────────────────────────────────────────────────────
document.getElementById('btn-delete-build').addEventListener('click', () => {
  if (S.currentBuildIdx === 0) return;
  deleteBuild(S.currentBuildIdx);
});
function deleteBuild(idx) {
  if (!confirm(`Delete build "${S.currentHero.builds[idx].name}"?`)) return;
  S.currentHero.builds.splice(idx, 1);
  S.currentBuildIdx = Math.max(0, idx - 1);
  setHeroDirty(true);
  renderBuildTabs();
  renderBuildContent();
}

// ─── Build Constraints UI (signature/required/blacklist/counter slots) ────────
let _bcItemData = null;   // cached item list for dropdowns
const BC_PHASE_NAMES   = ['Lane','Early','Mid','Late','Extra Late'];
const BC_DEFAULT_SLOTS = [[0,1],[0,2],[1,2],[2,3],[2,4]];

const BC_PICKERS = [
  { field: 'signature_items', exField: 'signature_items_excluded', search: 'bc-sig-search', dropdown: 'bc-sig-dropdown', chips: 'bc-sig-chips' },
  { field: 'required_items',  exField: 'required_items_excluded',  search: 'bc-req-search', dropdown: 'bc-req-dropdown', chips: 'bc-req-chips'  },
  { field: 'blacklist_items', exField: 'blacklist_items_excluded', search: 'bc-bl-search',  dropdown: 'bc-bl-dropdown',  chips: 'bc-bl-chips'   },
];

async function ensureBCItems() {
  if (!_bcItemData) _bcItemData = await api.get('/api/items/all');
  return _bcItemData;
}

function _bcResolvedForCurrentBuild() {
  const builds = S.currentHero?.builds || [];
  const b = builds[S.currentBuildIdx];
  if (!b) return null;
  return resolveBuildConstraints(b, builds);
}

function bcRenderChips(b, cfg) {
  const cont = document.getElementById(cfg.chips);
  if (!cont) return;
  const own = new Set(b[cfg.field] || []);
  const excluded = new Set(b[cfg.exField] || []);
  const resolved = _bcResolvedForCurrentBuild();
  const inherited = resolved?._parent[cfg.field] || new Set();
  // Display order: inherited (excluded last), then own additions not in inherited.
  const ordered = [];
  [...inherited].forEach(k => { if (!own.has(k)) ordered.push({ key: k, kind: excluded.has(k) ? 'excluded' : 'inherited' }); });
  [...own].forEach(k => ordered.push({ key: k, kind: inherited.has(k) ? 'inherited-own' : 'own' }));

  cont.innerHTML = '';
  ordered.forEach(({ key, kind }) => {
    const it = (_bcItemData || []).find(x => x.normalized_name === key);
    const chip = document.createElement('div');
    chip.className = 'bc-chip ' + (
      kind === 'excluded' ? 'bc-chip-excluded' :
      kind === 'inherited' ? 'bc-chip-inherited' :
      kind === 'inherited-own' ? 'bc-chip-inherited-own' : ''
    );
    const img = it ? srcUrl(it.image_path) : '';
    const badge = (kind === 'inherited' || kind === 'excluded' || kind === 'inherited-own')
      ? '<span class="bc-chip-follow" title="Inherited from followed build">↳</span>' : '';
    const xTitle = kind === 'excluded' ? 'Restore (un-exclude)' : (kind === 'inherited' ? 'Exclude (strike out)' : 'Remove');
    chip.innerHTML = `
      ${badge}
      ${img ? `<img class="bc-chip-img" src="${img}" alt="">` : ''}
      <span class="bc-chip-name">${it ? it.name : key}</span>
      <button class="bc-chip-x" title="${xTitle}">×</button>`;
    chip.querySelector('.bc-chip-x').addEventListener('click', () => {
      if (kind === 'inherited') {
        // Add to excluded
        const ex = b[cfg.exField] || [];
        ex.push(key); b[cfg.exField] = ex;
      } else if (kind === 'excluded') {
        // Restore: remove from excluded
        const ex = (b[cfg.exField] || []).filter(x => x !== key);
        if (ex.length) b[cfg.exField] = ex; else delete b[cfg.exField];
      } else {
        // Own — remove from own list
        const cur = (b[cfg.field] || []).filter(x => x !== key);
        if (cur.length) b[cfg.field] = cur; else delete b[cfg.field];
      }
      setHeroDirty(true);
      bcRenderChips(b, cfg);
    });
    cont.appendChild(chip);
  });
}

function bcWireSearch(b, cfg) {
  const input = document.getElementById(cfg.search);
  const dd    = document.getElementById(cfg.dropdown);
  if (!input || !dd) return;
  // Replace the input to drop any prior listeners (renderBuildContent re-runs on tab switch)
  const fresh = input.cloneNode(true);
  input.parentNode.replaceChild(fresh, input);
  fresh.addEventListener('input', () => {
    const q = fresh.value.trim().toLowerCase();
    if (!q) { dd.classList.add('hidden'); dd.innerHTML = ''; return; }
    const own = new Set(b[cfg.field] || []);
    const resolved = _bcResolvedForCurrentBuild();
    const inherited = resolved?._parent[cfg.field] || new Set();
    const excluded = new Set(b[cfg.exField] || []);
    // Hide items already shown (own, inherited-not-excluded). Excluded items can be re-added by clicking the chip.
    const visible = new Set([...own, ...[...inherited].filter(k => !excluded.has(k))]);
    const matches = (_bcItemData || [])
      .filter(it => !visible.has(it.normalized_name) && it.name.toLowerCase().includes(q))
      .slice(0, 25);
    dd.innerHTML = '';
    if (!matches.length) { dd.classList.add('hidden'); return; }
    matches.forEach(it => {
      const row = document.createElement('div');
      row.className = 'bc-dd-item';
      const img = srcUrl(it.image_path);
      row.innerHTML = `
        ${img ? `<img class="bc-dd-img" src="${img}" alt="">` : ''}
        <span>${it.name}</span>
        <span class="bc-dd-tier">${it.tier ? it.tier : ''}</span>`;
      row.addEventListener('mousedown', e => {
        e.preventDefault();
        const cur = b[cfg.field] || [];
        cur.push(it.normalized_name);
        b[cfg.field] = cur;
        // If the item was previously excluded, drop the exclusion (own takes priority anyway)
        if (excluded.has(it.normalized_name)) {
          const ex = (b[cfg.exField] || []).filter(x => x !== it.normalized_name);
          if (ex.length) b[cfg.exField] = ex; else delete b[cfg.exField];
        }
        setHeroDirty(true);
        bcRenderChips(b, cfg);
        fresh.value = '';
        dd.classList.add('hidden'); dd.innerHTML = '';
      });
      dd.appendChild(row);
    });
    dd.classList.remove('hidden');
  });
  fresh.addEventListener('blur', () => setTimeout(() => dd.classList.add('hidden'), 120));
  fresh.addEventListener('focus', () => { if (dd.innerHTML) dd.classList.remove('hidden'); });
}

function bcRenderCounterSlots(b) {
  const cont = document.getElementById('bc-counter-slots');
  if (!cont) return;
  const slots = Array.isArray(b.counter_phase_slots) ? b.counter_phase_slots : [];
  // Parent's resolved counter slots — used as inheritance placeholders when the child leaves
  // a cell blank. Falls back to global defaults when no follow chain exists.
  const builds = S.currentHero?.builds || [];
  let parentSlots = BC_DEFAULT_SLOTS;
  if (b.followed_build) {
    const pb = builds.find(x => x.name === b.followed_build);
    if (pb) {
      const pr = resolveBuildConstraints(pb, builds);
      parentSlots = pr.counter_phase_slots;
    }
  }
  cont.innerHTML = '';
  const h1 = document.createElement('div'); h1.className = 'bc-cs-head'; h1.textContent = 'Phase';
  const h2 = document.createElement('div'); h2.className = 'bc-cs-head'; h2.textContent = 'Min';
  const h3 = document.createElement('div'); h3.className = 'bc-cs-head'; h3.textContent = 'Max';
  cont.append(h1, h2, h3);

  BC_PHASE_NAMES.forEach((pn, i) => {
    const inh = parentSlots[i] || BC_DEFAULT_SLOTS[i];
    const cur = Array.isArray(slots[i]) ? slots[i] : [];
    const lbl = document.createElement('div'); lbl.className = 'bc-cs-name'; lbl.textContent = pn;
    const minIn = document.createElement('input');
    minIn.className = 'bc-cs-input'; minIn.type = 'number'; minIn.min = '0';
    minIn.placeholder = String(inh[0]);
    if (cur[0] !== null && cur[0] !== undefined && cur[0] !== '') minIn.value = String(cur[0]);
    const maxIn = document.createElement('input');
    maxIn.className = 'bc-cs-input'; maxIn.type = 'number'; maxIn.min = '0';
    maxIn.placeholder = String(inh[1]);
    if (cur[1] !== null && cur[1] !== undefined && cur[1] !== '') maxIn.value = String(cur[1]);

    function commit() {
      if (!Array.isArray(b.counter_phase_slots)) b.counter_phase_slots = [];
      while (b.counter_phase_slots.length < BC_PHASE_NAMES.length) b.counter_phase_slots.push(null);
      const lo = minIn.value === '' ? null : Number(minIn.value);
      const hi = maxIn.value === '' ? null : Number(maxIn.value);
      if (lo === null && hi === null) b.counter_phase_slots[i] = null;
      else b.counter_phase_slots[i] = [lo, hi];
      while (b.counter_phase_slots.length && b.counter_phase_slots[b.counter_phase_slots.length - 1] === null) {
        b.counter_phase_slots.pop();
      }
      if (!b.counter_phase_slots.length) delete b.counter_phase_slots;
      setHeroDirty(true);
    }
    minIn.addEventListener('change', commit);
    maxIn.addEventListener('change', commit);
    cont.append(lbl, minIn, maxIn);
  });
}

async function renderBuildConstraints() {
  const b = S.currentHero?.builds[S.currentBuildIdx];
  if (!b) return;
  await ensureBCItems();
  BC_PICKERS.forEach(cfg => { bcRenderChips(b, cfg); bcWireSearch(b, cfg); });
  bcRenderCounterSlots(b);
}

// ── Hero Tag Table ────────────────────────────────────────────────────────────
const HERO_COLS = [
  { key: 'ally_weight',  label: 'Ally Weight'  },
  { key: 'self_weight',  label: 'Self Item Weight'        },
  { key: 'enemy_weight', label: 'Enemy Weight'            },
  { key: 'self_score',   label: 'Playstyle/Ability Score' },
];

function renderHeroTagTable(build) {
  const tbody    = document.getElementById('hero-tag-body');
  tbody.innerHTML = '';
  const allBuilds  = S.currentHero.builds;
  const isGeneral  = (build.name === 'General');

  // Pre-resolve parent values for non-General builds that follow another
  let parentResolved = null;
  if (!isGeneral && build.followed_build) {
    const pb = allBuilds.find(b => b.name === build.followed_build);
    if (pb) parentResolved = resolveBuildValues(pb, allBuilds);
  }

  // Pre-compute range/avg stats for the General build cell
  let generalStats = null;
  if (isGeneral) {
    const nonGen = allBuilds.filter(b => b.name !== 'General');
    if (nonGen.length) {
      const resolved = nonGen.map(b => resolveBuildValues(b, allBuilds));
      generalStats = {};
      HERO_COLS.forEach(col => {
        generalStats[col.key] = {};
        S.tags.forEach(tag => {
          const vals = resolved.map(r => r[col.key][tag.code] ?? null).filter(v => v !== null);
          if (!vals.length) { generalStats[col.key][tag.code] = null; return; }
          const min = Math.min(...vals), max = Math.max(...vals);
          generalStats[col.key][tag.code] = { min, max, avg: vals.reduce((s, v) => s + v, 0) / vals.length };
        });
      });
    }
  }

  S.tags.forEach(tag => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.className = 'col-tag';
    nameTd.dataset.colIdx = '0';
    nameTd.innerHTML = `<div class="tag-name">${tag.name}</div><div class="tag-code">${tag.code}</div>`;
    tr.appendChild(nameTd);

    HERO_COLS.forEach((col, ci) => {
      const td = document.createElement('td');
      td.dataset.colIdx = String(ci + 1);

      const rawVal = (build.values[col.key] || {})[tag.code];
      const { value: numVal, rel } = parseWeightEntry(rawVal !== undefined ? rawVal : null);

      if (isGeneral) {
        const stats = generalStats && generalStats[col.key][tag.code];
        td.innerHTML = _buildGeneralCell(stats, numVal);
      } else {
        const parentVal = parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null;
        td.innerHTML = _buildSemiCell(numVal, rel, parentVal, !!build.followed_build);
      }

      const input  = td.querySelector('.val-input');
      const relBtn = td.querySelector('.rel-toggle');

      if (input) {
        applyValClass(input);
        input.addEventListener('input', () => {
          const b = S.currentHero.builds[S.currentBuildIdx];
          if (!b.values[col.key]) b.values[col.key] = {};
          const curRel = relBtn ? relBtn.dataset.rel : '=';
          const v = inputToVal(input);
          b.values[col.key][tag.code] = formatWeightEntry(v, curRel);
          applyValClass(input);
          setHeroDirty(true);
          if (relBtn) _refreshDiff(td, v, curRel, parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null);
        });
        input.addEventListener('focus', () => {
          tr.classList.add('row-active');
          tr.closest('table').querySelectorAll(`[data-col-idx="${ci + 1}"]`).forEach(el => el.classList.add('col-active'));
        });
        input.addEventListener('blur', () => {
          tr.classList.remove('row-active');
          tr.closest('table').querySelectorAll('.col-active').forEach(el => el.classList.remove('col-active'));
        });
      }

      if (relBtn) {
        relBtn.addEventListener('click', () => {
          const b = S.currentHero.builds[S.currentBuildIdx];
          if (!b.values[col.key]) b.values[col.key] = {};
          const cycle = { '=': '+', '+': 'x', 'x': '=' };
          const newRel = cycle[relBtn.dataset.rel] || '=';
          relBtn.dataset.rel = newRel;
          relBtn.textContent = newRel === 'x' ? '×' : newRel;
          const v = inputToVal(input);
          b.values[col.key][tag.code] = formatWeightEntry(v, newRel);
          setHeroDirty(true);
          _refreshDiff(td, v, newRel, parentResolved ? (parentResolved[col.key][tag.code] ?? null) : null);
        });
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function _buildSemiCell(numVal, rel, parentVal, hasParent) {
  const relLabel = rel === 'x' ? '×' : rel;
  const inputVal = numVal !== null && numVal !== undefined ? numVal : '';
  let sideHtml = '';
  if (hasParent) {
    const resolved = rel === '+' ? (parentVal ?? 0) + (numVal ?? 0)
                   : rel === 'x' ? (parentVal ?? 0) * (numVal ?? 0)
                   : numVal;
    const dc = _diffClass(resolved, parentVal);
    const ds = _diffSymbol(resolved, parentVal);
    const pv = parentVal !== null ? parentVal.toFixed(2) : '—';
    sideHtml = `<div class="semicell-side"><span class="diff-ind ${dc}">${ds}</span><span class="parent-val">${pv}</span><button class="rel-toggle" data-rel="${rel}">${relLabel}</button></div>`;
  }
  return `<div class="semicell"><input type="number" step="any" placeholder="—" class="val-input" value="${inputVal}" />${sideHtml}</div>`;
}

function _buildGeneralCell(stats, numVal) {
  const inputVal = numVal !== null && numVal !== undefined ? numVal : '';
  const rangeHtml = stats ? `<div class="gen-range">${stats.min.toFixed(2)} – ${stats.max.toFixed(2)}</div>` : '';
  const avgHtml   = stats ? `<div class="gen-avg">avg ${stats.avg.toFixed(2)}</div>` : '';
  return `<div class="semicell">${rangeHtml}<input type="number" step="any" placeholder="—" class="val-input" value="${inputVal}" />${avgHtml}</div>`;
}

function _diffClass(resolved, parent) {
  if (resolved === null || parent === null) return 'diff-eq';
  const d = resolved - parent;
  if (d > 0.5) return 'diff-up2';
  if (d > 0)   return 'diff-up1';
  if (d < -0.5) return 'diff-dn2';
  if (d < 0)   return 'diff-dn1';
  return 'diff-eq';
}

function _diffSymbol(resolved, parent) {
  if (resolved === null || parent === null) return '=';
  const d = resolved - parent;
  if (d > 0.5)  return '^^';
  if (d > 0)    return '^';
  if (d < -0.5) return 'vv';
  if (d < 0)    return 'v';
  return '=';
}

function _refreshDiff(td, numVal, rel, parentVal) {
  const diffEl = td.querySelector('.diff-ind');
  if (!diffEl) return;
  const resolved = rel === '+' ? (parentVal ?? 0) + (numVal ?? 0)
                 : rel === 'x' ? (parentVal ?? 0) * (numVal ?? 0)
                 : numVal;
  diffEl.className = `diff-ind ${_diffClass(resolved, parentVal)}`;
  diffEl.textContent = _diffSymbol(resolved, parentVal);
}

// ── Dirty state ───────────────────────────────────────────────────────────────
function setHeroDirty(val) {
  S.heroDirty = val;
  document.getElementById('dirty-badge').classList.toggle('hidden', !val);
}

// ── Save hero ─────────────────────────────────────────────────────────────────
document.getElementById('btn-save-hero').addEventListener('click', saveHero);
async function saveHero() {
  const res = await api.put(`/api/heroes/${S.currentHero.normalized_name}`, S.currentHero);
  if (res.error) { toast(res.error, 'error'); return; }
  delete _rsvCache[S.currentHero.normalized_name];
  setHeroDirty(false);
  toast('Hero saved ✓');
}

// ── Back to heroes ────────────────────────────────────────────────────────────
document.getElementById('back-heroes').addEventListener('click', async () => {
  if (S.heroDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
  setHeroDirty(false);
  await loadHeroes();
  showPage('heroes');
});

// ════════════════════════════════════════════════════════════════════════════
// ADD BUILD MODAL
// ════════════════════════════════════════════════════════════════════════════
async function openAddBuildModal() {
  document.getElementById('mb-name').value  = '';
  document.getElementById('mb-code').value  = '';
  document.getElementById('mb-desc').value  = '';
  document.getElementById('mb-preset-toggle').checked = false;
  document.getElementById('mb-preset-section').classList.add('hidden');

  // Populate hero dropdown — presets pinned first
  const heroSel = document.getElementById('mb-hero-sel');
  heroSel.innerHTML = '<option value="">— pick a hero —</option>';
  const presetHeroes  = S.heroList.filter(h => h.is_preset);
  const regularHeroes = S.heroList.filter(h => !h.is_preset);

  if (presetHeroes.length) {
    const grpP = document.createElement('optgroup');
    grpP.label = '⭐ Presets';
    presetHeroes.forEach(h => {
      const o = document.createElement('option');
      o.value = h.normalized_name;
      o.textContent = h.eng_name || h.normalized_name;
      grpP.appendChild(o);
    });
    heroSel.appendChild(grpP);
    const grpH = document.createElement('optgroup');
    grpH.label = 'Heroes';
    regularHeroes.forEach(h => {
      const o = document.createElement('option');
      o.value = h.normalized_name;
      o.textContent = h.eng_name || h.normalized_name;
      grpH.appendChild(o);
    });
    heroSel.appendChild(grpH);
  } else {
    regularHeroes.forEach(h => {
      const o = document.createElement('option');
      o.value = h.normalized_name;
      o.textContent = h.eng_name || h.normalized_name;
      heroSel.appendChild(o);
    });
  }
  document.getElementById('mb-build-sel').innerHTML = '';
  document.getElementById('modal-build').classList.remove('hidden');
  document.getElementById('mb-name').focus();
}

// Auto-fill code from name
document.getElementById('mb-name').addEventListener('input', e => {
  const base = S.currentHero?.normalized_name || '';
  const slug = e.target.value.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  document.getElementById('mb-code').value = slug ? `${base}_${slug}` : '';
});

// Preset toggle
document.getElementById('mb-preset-toggle').addEventListener('change', e => {
  document.getElementById('mb-preset-section').classList.toggle('hidden', !e.target.checked);
});

// Hero selection → populate build dropdown
document.getElementById('mb-hero-sel').addEventListener('change', async e => {
  const name = e.target.value;
  const buildSel = document.getElementById('mb-build-sel');
  buildSel.innerHTML = '';
  if (!name) return;
  const hero = await api.get(`/api/heroes/${name}`);
  hero.builds.forEach((b, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = b.name || `Build ${i+1}`;
    buildSel.appendChild(o);
  });
});

document.getElementById('mb-cancel').addEventListener('click',  () => document.getElementById('modal-build').classList.add('hidden'));

document.getElementById('mb-confirm').addEventListener('click', async () => {
  const name = document.getElementById('mb-name').value.trim();
  const code = document.getElementById('mb-code').value.trim();
  const desc = document.getElementById('mb-desc').value.trim();
  if (!name) { toast('Build name required', 'error'); return; }

  let values = {};
  HERO_COLS_KEYS.forEach(c => { values[c] = {}; S.tags.forEach(t => { values[c][t.code] = null; }); });

  // Copy from preset?
  if (document.getElementById('mb-preset-toggle').checked) {
    const heroName  = document.getElementById('mb-hero-sel').value;
    const buildIdx  = parseInt(document.getElementById('mb-build-sel').value || '0');
    if (heroName) {
      const srcHero = await api.get(`/api/heroes/${heroName}`);
      const srcBuild = srcHero.builds[buildIdx];
      if (srcBuild) {
        // Deep copy values
        HERO_COLS_KEYS.forEach(c => {
          values[c] = {};
          S.tags.forEach(t => {
            const v = (srcBuild.values[c] || {})[t.code];
            values[c][t.code] = (v === undefined) ? null : v;
          });
        });
      }
    }
  }

  S.currentHero.builds.push({ name, normalized_build_name: code, build_description_eng: desc, values });
  S.currentBuildIdx = S.currentHero.builds.length - 1;
  document.getElementById('modal-build').classList.add('hidden');
  setHeroDirty(true);
  renderBuildTabs();
  renderBuildContent();
  toast(`Build "${name}" added`);
});

// ════════════════════════════════════════════════════════════════════════════
// REVERSE ENGINEER BUILD
// ════════════════════════════════════════════════════════════════════════════

const RE = {
  items: [],              // { key, name, tier, imagePath, selfScore }
  enemies: [],            // normalized_names (selected)
  allies: [],             // normalized_names (selected)
  impactfulEnemies: new Set(),
  impactfulAllies:  new Set(),
  _itemData: null,
};

async function openReverseEngineer() {
  if (!S.currentHero) return;
  RE.items = []; RE.enemies = []; RE.allies = [];
  RE.impactfulEnemies = new Set(); RE.impactfulAllies = new Set();
  document.getElementById('re-hero-label').textContent = S.currentHero.eng_name || S.currentHero.normalized_name;
  document.getElementById('re-build-name').value = '';
  document.getElementById('re-algo').value = 'items+context';
  document.getElementById('re-item-search').value = '';
  document.getElementById('re-item-dropdown').classList.add('hidden');
  document.getElementById('re-preview').classList.add('hidden');
  if (!RE._itemData) RE._itemData = await api.get('/api/items/all');
  renderReHeroPicker('enemy');
  renderReHeroPicker('ally');
  renderReChips();
  showPage('reverse-engineer');
}

function renderReHeroPicker(type) {
  const grid = document.getElementById(`re-${type}-grid`);
  if (!grid) return;
  const filterEl = document.getElementById(`re-${type}-search`);
  const q = (filterEl?.value || '').trim().toLowerCase();
  const sel = type === 'enemy' ? RE.enemies : RE.allies;
  const imp = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
  grid.innerHTML = '';
  S.heroList.filter(h => !h.is_preset && (!q || h.eng_name.toLowerCase().includes(q))).forEach(h => {
    const name   = h.normalized_name;
    const isImp  = imp.has(name);
    const isOn   = sel.includes(name);
    let cls = 're-hero-btn';
    if (isImp) cls += ' impactful';
    else if (isOn) cls += ' on';
    const btn = document.createElement('button');
    btn.className = cls;
    const img = srcUrl(h.image_path);
    btn.innerHTML = `${img ? `<img class="re-hero-btn-img" src="${img}" alt="">` : ''}<span>${h.eng_name || name}</span>`;
    btn.addEventListener('click', () => {
      const arr    = type === 'enemy' ? RE.enemies : RE.allies;
      const impSet = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
      const idx    = arr.indexOf(name);
      if (idx < 0) {
        arr.push(name);           // off → normal
      } else if (!impSet.has(name)) {
        impSet.add(name);         // normal → impactful
      } else {
        arr.splice(idx, 1);       // impactful → off
        impSet.delete(name);
      }
      renderReHeroPicker(type);
      renderReChips();
    });
    grid.appendChild(btn);
  });
}

function renderReChips() {
  // Item chips (ordered list)
  const itemCont = document.getElementById('re-item-chips');
  itemCont.innerHTML = '';
  RE.items.forEach((it, i) => {
    const chip = document.createElement('div');
    chip.className = 're-chip re-item-chip';
    const img = srcUrl(it.imagePath);
    chip.innerHTML = `
      ${img ? `<img class="re-chip-img" src="${img}" alt="">` : ''}
      <span class="re-chip-pos">${i + 1}</span>
      <span class="re-chip-name">${it.name}</span>
      <span class="re-chip-tier re-tier-${it.tier}">${it.tier}★</span>
      <button class="re-chip-x" title="Remove">×</button>`;
    chip.querySelector('.re-chip-x').addEventListener('click', () => { RE.items.splice(i, 1); renderReChips(); });
    itemCont.appendChild(chip);
  });

  // Enemy / ally chips
  ['enemy', 'ally'].forEach(type => {
    const arr = type === 'enemy' ? RE.enemies : RE.allies;
    const imp = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
    const cont = document.getElementById(`re-${type}-chips`);
    if (!cont) return;
    cont.innerHTML = '';
    arr.forEach(name => {
      const hd = S.heroList.find(h => h.normalized_name === name);
      if (!hd) return;
      const isImp = imp.has(name);
      const chip = document.createElement('div');
      chip.className = 're-chip' + (isImp ? ' re-chip-impactful' : '');
      const img = srcUrl(hd.image_path);
      chip.innerHTML = `
        ${img ? `<img class="re-chip-img" src="${img}" alt="">` : ''}
        <span class="re-chip-name">${hd.eng_name || name}</span>
        ${isImp ? '<span class="re-chip-impact-badge">★</span>' : ''}
        <button class="re-chip-x" title="Remove">×</button>`;
      chip.querySelector('.re-chip-x').addEventListener('click', () => {
        const a  = type === 'enemy' ? RE.enemies : RE.allies;
        const is = type === 'enemy' ? RE.impactfulEnemies : RE.impactfulAllies;
        a.splice(a.indexOf(name), 1);
        is.delete(name);
        renderReHeroPicker(type);
        renderReChips();
      });
      cont.appendChild(chip);
    });
  });
}

async function submitReverseEngineer() {
  if (!RE.items.length) { toast('Add at least one item to reverse engineer from.', true); return; }

  const buildName = document.getElementById('re-build-name').value.trim() || 'Reverse Engineered';
  const algo      = document.getElementById('re-algo').value;
  const btn       = document.getElementById('btn-re-submit');
  btn.disabled = true; btn.textContent = 'Working…';

  try {
    // Fetch hero data needed for enemy/ally inference
    if (algo !== 'items-only') {
      for (const name of [...RE.enemies, ...RE.allies]) {
        if (!_rsvCache[name]) {
          const data = await api.get(`/api/heroes/${name}`);
          if (data && !data.error) { MATCH.heroData[name] = data; cacheHeroBuilds(name); }
        }
      }
    }

    const tagCodes = S.tags.map(t => t.code).filter(t => !SKIP_TAGS.has(t));
    const TIER_W   = { 800: 1.0, 1600: 1.35, 3200: 1.75, 6400: 2.2, 9999: 3.0 };

    // ── Self weight: revealed-preference delta from tier average ─────────
    // For each item the player chose, compute how much its self_score exceeds
    // the average for items at that tier. The delta reveals WHY they picked
    // that item over alternatives at the same budget. Earlier purchases get
    // higher positional weight (the core build intent is set early).
    const VALID_TIERS = [800, 1600, 3200, 6400];
    const tierAvg = {};
    VALID_TIERS.forEach(tier => {
      const pool = (RE._itemData || []).filter(it => it.tier === tier);
      const avg  = {}; tagCodes.forEach(t => avg[t] = 0);
      pool.forEach(it => { tagCodes.forEach(t => { avg[t] += it.values?.self_score?.[t] || 0; }); });
      if (pool.length) tagCodes.forEach(t => { avg[t] /= pool.length; });
      tierAvg[tier] = avg;
    });

    const swRaw = {}; tagCodes.forEach(t => swRaw[t] = 0);
    let totalW = 0;
    RE.items.forEach((it, i) => {
      const posW  = 1 / (1 + i * 0.12);   // earlier = more weight; decay ~50% by item 6
      const tierW = TIER_W[it.tier] || 1.0;
      const w     = posW * tierW;
      totalW += w;
      const avg = tierAvg[it.tier] || {};
      tagCodes.forEach(t => {
        const delta = (it.selfScore[t] || 0) - (avg[t] || 0);
        swRaw[t] += delta * w;
      });
    });
    if (totalW > 0) tagCodes.forEach(t => { swRaw[t] /= totalW; });

    // ── Enemy / ally influence on self_weight ───────────────────────────
    // Normal hero: tiny baseline influence (player was in the matchup but hero wasn't the focus).
    // Impactful hero: aggressively subtracts their counter/synergy signal so items bought
    // specifically to answer that hero don't inflate the hero's personal self_weight.
    const NORMAL_INF = 0.05;
    const IMPACT_INF = 0.8;

    const ewRaw = {}; tagCodes.forEach(t => ewRaw[t] = 0);
    if (algo !== 'items-only' && RE.enemies.length) {
      RE.enemies.forEach(en => {
        const ew  = resolvedSrcBuildVals(en)?.enemy_weight || {};
        const inf = RE.impactfulEnemies.has(en) ? IMPACT_INF : NORMAL_INF;
        tagCodes.forEach(t => {
          const counter = Math.max(0, -(ew[t] || 0));
          ewRaw[t]    += inf * counter;
          swRaw[t]    -= inf * counter;
        });
      });
    }

    const awRaw = {}; tagCodes.forEach(t => awRaw[t] = 0);
    if (algo !== 'items-only' && RE.allies.length) {
      RE.allies.forEach(al => {
        const aw  = resolvedSrcBuildVals(al)?.ally_weight || {};
        const inf = RE.impactfulAllies.has(al) ? IMPACT_INF : NORMAL_INF;
        tagCodes.forEach(t => {
          const synergy = Math.max(0, aw[t] || 0);
          awRaw[t]    += inf * synergy;
          swRaw[t]    -= inf * synergy;
        });
      });
    }

    // ── Normalize + prune: keep top N tags, scale so peak ≈ maxCap ───────
    function scaleVec(raw, maxCap) {
      const absMax = Math.max(...Object.values(raw).map(Math.abs), 0.001);
      if (absMax < 0.01) return {};
      const scale = maxCap / absMax;
      const out = {};
      Object.keys(raw).forEach(t => {
        const v = raw[t] * scale;
        if (Math.abs(v) >= 0.05) out[t] = parseFloat(v.toFixed(3));
      });
      return out;
    }
    function prunedVec(raw, maxCap, keepTop) {
      const sorted = Object.entries(raw).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      if (!sorted.length) return {};
      const topVal = Math.abs(sorted[0][1]) || 0.001;
      const out = {};
      sorted.slice(0, keepTop).forEach(([t, v]) => {
        const scaled = (v / topVal) * maxCap;
        if (Math.abs(scaled) >= 0.1) out[t] = parseFloat(scaled.toFixed(3));
      });
      return out;
    }

    const selfW  = scaleVec(swRaw, 1.5);
    // Enemy/ally weights: top ~4 tags, peak ≤0.5; rest fall naturally below
    const enemyW = (algo !== 'items-only' && RE.enemies.length) ? prunedVec(ewRaw, 0.5, 4) : {};
    const allyW  = (algo !== 'items-only' && RE.allies.length)  ? prunedVec(awRaw, 0.75, 4) : {};

    // ── Build values object ──────────────────────────────────────────────
    const buildValues = { ally_weight: {}, self_weight: {}, enemy_weight: {}, self_score: {} };
    S.tags.forEach(({ code: t }) => {
      buildValues.self_weight[t]  = selfW[t]  ?? null;
      buildValues.enemy_weight[t] = enemyW[t] ?? null;
      buildValues.ally_weight[t]  = allyW[t]  ?? null;
      buildValues.self_score[t]   = null;
    });

    // ── Construct build entry ────────────────────────────────────────────
    const heroKey = S.currentHero.normalized_name;
    const slug    = buildName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '');
    let code      = `${heroKey}_${slug}`;
    if (S.currentHero.builds.some(b => b.normalized_build_name === code)) code += '_re';

    const itemList   = RE.items.slice(0, 5).map(it => it.name).join(', ') + (RE.items.length > 5 ? '…' : '');
    const enemyList  = RE.enemies.map(n => S.heroList.find(h => h.normalized_name === n)?.eng_name || n).join(', ');
    const allyList   = RE.allies.map(n => S.heroList.find(h => h.normalized_name === n)?.eng_name || n).join(', ');
    let desc = `RE from: ${itemList}`;
    if (enemyList) desc += ` | Enemies: ${enemyList}`;
    if (allyList)  desc += ` | Allies: ${allyList}`;

    S.currentHero.builds.push({
      name: buildName, normalized_build_name: code,
      build_description_eng: desc,
      followed_build: 'General',
      values: buildValues,
    });
    S.currentBuildIdx = S.currentHero.builds.length - 1;
    setHeroDirty(true);

    renderRePreview(selfW, enemyW, allyW);
    toast(`Build "${buildName}" created`);
    setTimeout(() => { renderBuildTabs(); renderBuildContent(); showPage('hero-edit'); }, 1500);

  } finally {
    btn.disabled = false; btn.textContent = 'Reverse Engineer Build →';
  }
}

function renderRePreview(selfW, enemyW, allyW) {
  document.getElementById('re-preview').classList.remove('hidden');
  const body = document.getElementById('re-preview-body');
  body.innerHTML = '';
  [
    { data: selfW,  label: 'Self Weight',  cls: '' },
    { data: enemyW, label: 'Enemy Weight', cls: 'enemy-clr' },
    { data: allyW,  label: 'Ally Weight',  cls: 'ally-clr' },
  ].forEach(({ data, label, cls }) => {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!entries.length) return;
    const col = document.createElement('div');
    col.className = 're-prev-col';
    col.innerHTML = `<div class="re-prev-lbl ${cls}">${label}</div>`;
    entries.forEach(([code, val]) => {
      const tag = S.tags.find(t => t.code === code);
      const row = document.createElement('div');
      row.className = 're-prev-row';
      row.innerHTML = `<span class="re-prev-tag">${tag?.name || code}</span>
        <span class="re-prev-val ${val >= 0 ? 'pct-pos' : 'pct-neg'}">${val >= 0 ? '+' : ''}${val.toFixed(2)}</span>`;
      col.appendChild(row);
    });
    body.appendChild(col);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ITEMS PAGE
// ════════════════════════════════════════════════════════════════════════════
async function loadItems() {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.itemList = await api.get('/api/items');
  renderItemGrid();
}

function renderItemGrid() {
  const grid = document.getElementById('item-grid');
  grid.innerHTML = '';
  const filtered = S.itemList.filter(it => {
    const catOk = S.itemCat === 'All' || it.category === S.itemCat;
    const searchOk = !S.itemSearch || it.name.toLowerCase().includes(S.itemSearch.toLowerCase());
    return catOk && searchOk;
  });
  filtered.forEach(it => {
    const card = document.createElement('div');
    card.className = 'item-card';
    const imgSrc = srcUrl(it.image_path);
    card.innerHTML = `
      ${imgSrc
        ? `<img class="item-card-img" src="${imgSrc}" alt="${it.name}" onerror="this.style.display='none'">`
        : `<div class="item-card-img" style="display:flex;align-items:center;justify-content:center;font-size:28px">⚔️</div>`}
      <div class="item-card-body">
        <div class="item-card-name">${it.name}</div>
        <div class="item-badges">
          <span class="cat-badge ${it.category}">${it.category}</span>
          <span class="tier-badge">${it.tier}</span>
        </div>
      </div>`;
    card.addEventListener('click', () => openItemEdit(it.normalized_name));
    grid.appendChild(card);
  });
  if (!filtered.length) {
    grid.innerHTML = '<div style="color:var(--muted);padding:24px">No items found.</div>';
  }
}

// Category filter
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    S.itemCat = btn.dataset.cat;
    renderItemGrid();
  });
});

// Search
document.getElementById('item-search').addEventListener('input', e => {
  S.itemSearch = e.target.value;
  renderItemGrid();
});

// ── Item Edit ─────────────────────────────────────────────────────────────────
async function openItemEdit(name) {
  if (!S.tags.length) S.tags = await api.get('/api/tags');
  S.currentItem = await api.get(`/api/items/${name}`);
  S.compareItems = [];
  S.itemDirty = false;

  if (!S.currentItem.values) S.currentItem.values = {};
  if (!S.currentItem.values.self_score) S.currentItem.values.self_score = {};
  if (!S.currentItem.upgrades_from) S.currentItem.upgrades_from = [];
  if (!S.currentItem.compare_to) S.currentItem.compare_to = [];
  S.tags.forEach(t => {
    if (!(t.code in S.currentItem.values.self_score)) S.currentItem.values.self_score[t.code] = null;
  });

  // Load compare_to items in parallel
  if (S.currentItem.compare_to.length) {
    S.compareItems = await Promise.all(S.currentItem.compare_to.map(k => api.get(`/api/items/${k}`)));
  }

  renderItemEditPage();
  showPage('item-edit');
}

function renderItemEditPage() {
  const it = S.currentItem;
  document.getElementById('item-edit-title').textContent = it.name;
  document.getElementById('if-name').value  = it.name              || '';
  document.getElementById('if-key').value   = it.normalized_name   || '';
  document.getElementById('if-cat').value   = it.category          || '';
  document.getElementById('if-tier').value  = it.tier              || '';
  document.getElementById('if-wiki').value  = it.wiki_url          || '';
  document.getElementById('if-image').value   = it.image_path        || '';
  document.getElementById('if-remarks').value       = it.remarks           || '';
  document.getElementById('if-upgrades-from').value = (it.upgrades_from || []).join(', ');

  const catBadge = document.getElementById('item-cat-badge');
  catBadge.textContent = it.category;
  catBadge.className   = `cat-badge ${it.category}`;
  document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
  setImg('item-icon-img', it.image_path);
  setItemDirty(false);
  renderCompareTo();
  renderItemTagTable();
}

function renderCompareTo() {
  const chips = document.getElementById('compare-to-chips');
  if (!chips) return;
  chips.innerHTML = '';
  (S.currentItem.compare_to || []).forEach(key => {
    const chip = document.createElement('span');
    chip.className = 'compare-chip';
    chip.innerHTML = `${key} <button class="chip-x" data-key="${key}">×</button>`;
    chip.querySelector('.chip-x').addEventListener('click', () => removeCompareTo(key));
    chips.appendChild(chip);
  });
}

async function addCompareTo() {
  const sel = document.getElementById('compare-to-search');
  if (!sel) return;
  const key = sel.value.trim();
  if (!key || key === S.currentItem.normalized_name) return;
  if ((S.currentItem.compare_to || []).includes(key)) return;
  const item = await api.get(`/api/items/${key}`);
  if (item.error) { toast('Item not found', 'error'); return; }
  if (!S.currentItem.compare_to) S.currentItem.compare_to = [];
  S.currentItem.compare_to.push(key);
  S.compareItems.push(item);
  sel.value = '';
  setItemDirty(true);
  renderCompareTo();
  renderItemTagTable();
}

async function removeCompareTo(key) {
  S.currentItem.compare_to = (S.currentItem.compare_to || []).filter(k => k !== key);
  S.compareItems = S.compareItems.filter(it => it.normalized_name !== key);
  setItemDirty(true);
  renderCompareTo();
  renderItemTagTable();
}

// Item field changes
['if-name','if-cat','if-tier','if-wiki','if-image','if-remarks','if-upgrades-from'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const it = S.currentItem;
    if (!it) return;
    it.name          = document.getElementById('if-name').value;
    it.category      = document.getElementById('if-cat').value;
    it.tier          = parseInt(document.getElementById('if-tier').value) || 0;
    it.wiki_url      = document.getElementById('if-wiki').value;
    it.image_path    = document.getElementById('if-image').value;
    it.remarks       = document.getElementById('if-remarks').value;
    it.upgrades_from = document.getElementById('if-upgrades-from').value
      .split(',').map(s => s.trim()).filter(Boolean);
    setImg('item-icon-img', it.image_path);
    document.getElementById('item-cat-badge').textContent = it.category;
    document.getElementById('item-cat-badge').className   = `cat-badge ${it.category}`;
    document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
    setItemDirty(true);
  });
});

function renderItemTagTable() {
  // Rebuild column headers
  const thead = document.querySelector('#item-tag-table thead tr');
  thead.innerHTML = '<th class="col-tag" data-col-idx="0">Tag</th><th data-col-idx="1" title="Used in item recommendation scoring.">Item Score</th>';
  (S.compareItems || []).forEach((cit, ci) => {
    const th = document.createElement('th');
    th.dataset.colIdx = String(ci + 2);
    th.title = cit.name;
    th.textContent = cit.name;
    thead.appendChild(th);
  });

  const tbody = document.getElementById('item-tag-body');
  tbody.innerHTML = '';
  const scores = S.currentItem.values.self_score;
  S.tags.forEach(tag => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.className = 'col-tag';
    nameTd.dataset.colIdx = '0';
    nameTd.innerHTML = `<div class="tag-name">${tag.name}</div><div class="tag-code">${tag.code}</div>`;
    tr.appendChild(nameTd);

    // Editable score column
    const td = document.createElement('td');
    td.dataset.colIdx = '1';
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.placeholder = '—';
    input.className = 'val-input';
    input.dataset.tag = tag.code;
    valToInput(input, scores[tag.code]);
    input.addEventListener('input', () => {
      S.currentItem.values.self_score[tag.code] = inputToVal(input);
      applyValClass(input);
      setItemDirty(true);
    });
    input.addEventListener('focus', () => {
      tr.classList.add('row-active');
      tr.closest('table').querySelectorAll('[data-col-idx="1"]').forEach(el => el.classList.add('col-active'));
    });
    input.addEventListener('blur', () => {
      tr.classList.remove('row-active');
      tr.closest('table').querySelectorAll('.col-active').forEach(el => el.classList.remove('col-active'));
    });
    td.appendChild(input);
    tr.appendChild(td);

    // Read-only compare columns
    (S.compareItems || []).forEach((cit, ci) => {
      const ctd = document.createElement('td');
      ctd.dataset.colIdx = String(ci + 2);
      const cval = (cit.values?.self_score || {})[tag.code] ?? null;
      const ci2 = document.createElement('input');
      ci2.type = 'number'; ci2.readOnly = true; ci2.tabIndex = -1;
      ci2.className = 'val-input'; ci2.placeholder = '—';
      valToInput(ci2, cval);
      ctd.appendChild(ci2);
      tr.appendChild(ctd);
    });

    tbody.appendChild(tr);
  });
}

function setItemDirty(val) {
  S.itemDirty = val;
  document.getElementById('item-dirty-badge').classList.toggle('hidden', !val);
}

document.getElementById('btn-save-item').addEventListener('click', async () => {
  const res = await api.put(`/api/items/${S.currentItem.normalized_name}`, S.currentItem);
  if (res.error) { toast(res.error, 'error'); return; }
  setItemDirty(false);
  toast('Item saved ✓');
});

document.getElementById('back-items').addEventListener('click', async () => {
  if (S.itemDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
  setItemDirty(false);
  await loadItems();
  showPage('items');
});

// ════════════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════════════
(async () => {
  S.tags     = await api.get('/api/tags');
  S.heroList = await api.get('/api/heroes');
  renderHeroGrid();
  showPage('heroes');
})();

// ════════════════════════════════════════════════════════════════════════════
// MATCH CALCULATOR
// ════════════════════════════════════════════════════════════════════════════


// ── State ─────────────────────────────────────────────────────────────────
const MATCH = {
  multiMode:      false,
  uncapped:       false,
  include9999:    false,
  teamCap:        6,
  self:           null,
  allies:         [],
  enemies:        [],
  heroData:       {},
  itemData:       [],
  results:        null,
  selectedBuilds: {},
  viewHeroName:   null,
  viewBuildIdx:   null,
  mult: {
    buildAlly:  1.5,
    buildEnemy: 1.5,
    itemAlly:   1.5,
    itemEnemy:  1.5,
    allyBuild:  0.75,  // V2: allies benefit from my build
    enemyBuild: 0.75,  // V2: enemies react to my build
  },
  // Set to true to replace eager build-path computation with a per-build "Calculate" button
  lazyBuildPaths: false,
  bpAlgo: 'lookahead',
  scoreFormula: 'v2',
};

// ── Effectiveness thresholds — edit these values to adjust cutoffs ─────────
// ally:  Σ(item.self_score × ally.ally_weight).          > norm = synergizes, > super = VERY
// enemy: -Σ(item.self_score × enemy.enemy_weight) (neg). > norm = effective,  > super = VERY
//        (only items with a genuine negative raw product show — score <= 0 is hidden)
// self:  item self score from build weights.             > norm = effective,  > super = VERY
const EFFECT_THRESH = {
  ally:  { norm: 1.0, super: 1.5 },
  enemy: { norm: 1.5, super: 2.5 },
  self:  { norm: 1.5, super: 2.5 },
};

// Tags excluded from effectiveness notes and regular item scoring
const SKIP_TAGS = new Set(['assist_importance', 'counter_importance']);

// ── Load ──────────────────────────────────────────────────────────────────
async function loadCalc() {
  if (!S.tags.length)     S.tags     = await api.get('/api/tags');
  if (!S.heroList.length) S.heroList = await api.get('/api/heroes');
  renderCalcSetup();
}

// ════════════════════════════════════════════════════════════════════════════
// SETUP
// ════════════════════════════════════════════════════════════════════════════

function renderCalcSetup() {
  document.getElementById('calc-multi-mode').checked    = MATCH.multiMode;
  document.getElementById('calc-uncap').checked         = MATCH.uncapped;
  document.getElementById('calc-include9999').checked   = MATCH.include9999;
  document.getElementById('mult-build-ally').value      = MATCH.mult.buildAlly;
  document.getElementById('mult-build-enemy').value     = MATCH.mult.buildEnemy;
  document.getElementById('mult-item-ally').value       = MATCH.mult.itemAlly;
  document.getElementById('mult-item-enemy').value      = MATCH.mult.itemEnemy;
  document.getElementById('mult-ally-build').value      = MATCH.mult.allyBuild;
  document.getElementById('mult-enemy-build').value     = MATCH.mult.enemyBuild;
  document.getElementById('bp-algo-sel').value          = MATCH.bpAlgo;
  document.getElementById('score-formula-sel').value    = MATCH.scoreFormula;
  document.getElementById('v2-mult-group').style.display = (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') ? '' : 'none';
  renderTeamBars();
  renderCalcRoster();
}

function renderTeamBars() {
  const cap = MATCH.uncapped ? '∞' : MATCH.teamCap;
  document.getElementById('ally-count').textContent  = `${MATCH.allies.length}/${cap}`;
  document.getElementById('enemy-count').textContent = `${MATCH.enemies.length}/${cap}`;

  const renderChips = (list, containerId) => {
    const cont = document.getElementById(containerId);
    cont.innerHTML = '';
    const counts = {};
    list.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
    Object.entries(counts).forEach(([name, cnt]) => {
      const h = S.heroList.find(x => x.normalized_name === name);
      if (!h) return;
      const isSelf = MATCH.self === name;
      const chip = document.createElement('div');
      chip.className = 'team-chip' + (isSelf ? ' is-self' : '');
      chip.innerHTML = `
        <span>${isSelf ? '★ ' : ''}${h.eng_name || name}</span>
        ${cnt > 1 ? `<span class="chip-count">×${cnt}</span>` : ''}
        <button class="chip-x" title="Remove">×</button>`;
      chip.querySelector('.chip-x').addEventListener('click', () => removeFromTeam(name));
      cont.appendChild(chip);
    });
  };

  renderChips(MATCH.allies,  'ally-chips');
  renderChips(MATCH.enemies, 'enemy-chips');
}

function renderCalcRoster() {
  const grid = document.getElementById('calc-roster');
  grid.innerHTML = '';
  S.heroList.filter(h => !h.is_preset).forEach(h => grid.appendChild(makeCalcCard(h)));
}

function makeCalcCard(h) {
  const name    = h.normalized_name;
  const isAlly  = MATCH.allies.includes(name);
  const isEnemy = MATCH.enemies.includes(name);
  const isSelf  = MATCH.self === name;
  const imgSrc  = srcUrl(h.image_path);

  const card = document.createElement('div');
  card.className = 'calc-card'
    + (isAlly  ? ' c-ally'  : '')
    + (isEnemy ? ' c-enemy' : '')
    + (isSelf  ? ' c-self'  : '');

  card.innerHTML = `
    ${imgSrc
      ? `<img class="hero-card-img" src="${imgSrc}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="hero-card-img-placeholder" ${imgSrc ? 'style="display:none"' : ''}>🦸</div>
    <div class="hero-card-body">
      <div class="hero-card-name">${h.eng_name || name}</div>
    </div>
    <div class="calc-assign-btns">
      <button class="asgn-btn asgn-ally${isAlly && !isSelf ? ' on' : ''}"  title="Add as Ally">⬅</button>
      <button class="asgn-btn asgn-self${isSelf             ? ' on' : ''}"  title="Mark as You (self)">★</button>
      <button class="asgn-btn asgn-enemy${isEnemy           ? ' on' : ''}"  title="Add as Enemy">➡</button>
    </div>`;

  card.querySelector('.asgn-ally').addEventListener('click',  e => { e.stopPropagation(); assignHero(name, 'ally'); });
  card.querySelector('.asgn-self').addEventListener('click',  e => { e.stopPropagation(); assignHero(name, 'self'); });
  card.querySelector('.asgn-enemy').addEventListener('click', e => { e.stopPropagation(); assignHero(name, 'enemy'); });
  return card;
}

function assignHero(name, role) {
  const inAllies  = MATCH.allies.includes(name);
  const inEnemies = MATCH.enemies.includes(name);
  const isSelf    = MATCH.self === name;

  if (!MATCH.multiMode) {
    if (role === 'ally'  && inAllies  && !isSelf) { removeFromTeam(name); return; }
    if (role === 'self'  && isSelf)               { removeFromTeam(name); return; }
    if (role === 'enemy' && inEnemies)            { removeFromTeam(name); return; }
    MATCH.allies  = MATCH.allies.filter(n => n !== name);
    MATCH.enemies = MATCH.enemies.filter(n => n !== name);
    if (MATCH.self === name) MATCH.self = null;
  }

  const cap = MATCH.teamCap;
  if (role === 'ally' || role === 'self') {
    if (!MATCH.uncapped && MATCH.allies.length >= cap) { toast(`Ally team full (max ${cap})`, 'error'); return; }
    MATCH.allies.push(name);
    if (role === 'self') MATCH.self = name;
  } else {
    if (!MATCH.uncapped && MATCH.enemies.length >= cap) { toast(`Enemy team full (max ${cap})`, 'error'); return; }
    MATCH.enemies.push(name);
  }
  renderTeamBars();
  renderCalcRoster();
}

function removeFromTeam(name) {
  if (MATCH.self === name) MATCH.self = null;
  MATCH.allies  = MATCH.allies.filter(n => n !== name);
  MATCH.enemies = MATCH.enemies.filter(n => n !== name);
  renderTeamBars();
  renderCalcRoster();
}

document.getElementById('calc-multi-mode').addEventListener('change', e => { MATCH.multiMode = e.target.checked; });
document.getElementById('calc-include9999').addEventListener('change', e => { MATCH.include9999 = e.target.checked; });
document.getElementById('calc-uncap').addEventListener('change', e => {
  MATCH.uncapped = e.target.checked;
  renderTeamBars();
});
['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy','mult-ally-build','mult-enemy-build'].forEach(id => {
  document.getElementById(id).addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v) || v < 0) return;
    const key = id.replace('mult-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    MATCH.mult[key] = v;
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CALCULATION
// ════════════════════════════════════════════════════════════════════════════

async function runCalculation() {
  if (!MATCH.allies.length && !MATCH.enemies.length) {
    toast('Add heroes to teams first', 'error'); return;
  }
  // Always re-fetch so edits made during the session are reflected
  const allNames = [...new Set([...MATCH.allies, ...MATCH.enemies])];
  toast('Loading data...');
  for (const name of allNames) {
    MATCH.heroData[name] = await api.get(`/api/heroes/${name}`);
    cacheHeroBuilds(name);
  }
  MATCH.itemData = await api.get('/api/items/all');
  MATCH.results = computeResults();
  renderCalcSummary();
  showPage('calc-summary');
}

function tv(dict, tag) {
  const v = (dict || {})[tag];
  return (v === null || v === undefined) ? 0 : v;
}

function srcBuild(name) {
  const hero = MATCH.heroData[name];
  if (!hero) return null;
  const idx = MATCH.selectedBuilds[name] ?? 0;
  return hero.builds[idx] || hero.builds[0];
}

// _rsvCache[heroName][buildName] = fully-resolved numeric values for that build.
// Populated when hero data is fetched; invalidated on save.
let _rsvCache = {};

function cacheHeroBuilds(name) {
  const hero = MATCH.heroData[name];
  if (!hero) return;
  _rsvCache[name] = {};
  hero.builds.forEach(build => {
    _rsvCache[name][build.name] = resolveBuildValues(build, hero.builds);
  });
}

// Returns resolved values for the currently-selected build of a hero. O(1) lookup.
function resolvedSrcBuildVals(name) {
  const hero = MATCH.heroData[name];
  if (!hero) return null;
  const idx  = MATCH.selectedBuilds[name] ?? 0;
  const build = hero.builds[idx] || hero.builds[0];
  if (!build) return null;
  return _rsvCache[name]?.[build.name] ?? resolveBuildValues(build, hero.builds);
}

function computeResults() {
  // Always read current input values so changes made without blur are captured
  ['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy','mult-ally-build','mult-enemy-build'].forEach(id => {
    const v = parseFloat(document.getElementById(id)?.value);
    if (!isNaN(v) && v >= 0) {
      const key = id.replace('mult-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      MATCH.mult[key] = v;
    }
  });

  const allNames = [...new Set([...MATCH.allies, ...MATCH.enemies])];
  const out = [];

  allNames.forEach(name => {
    const heroData = MATCH.heroData[name];
    if (!heroData) return;

    const onAlly  = MATCH.allies.includes(name);
    const isSelf  = MATCH.self === name;
    const myAllies  = onAlly ? MATCH.allies.filter(n => n !== name) : MATCH.enemies.filter(n => n !== name);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const buildResults = heroData.builds.map((build, bi) => {
      // Use pre-computed cache; fall back to live resolve if cache miss.
      const rv = _rsvCache[name]?.[build.name] ?? resolveBuildValues(build, heroData.builds);

      // V3: narrow enemy pool to top-2 targets this hero is best at countering.
      let activeEnemies = myEnemies;
      const v3Targets = [];
      if (MATCH.scoreFormula === 'v3' && myEnemies.length > 1) {
        const selfRaw = {};
        S.tags.forEach(tag => { if (!SKIP_TAGS.has(tag.code)) selfRaw[tag.code] = Math.max(0, rv.self_weight?.[tag.code] || 0); });
        const selfMag = Math.sqrt(S.tags.reduce((s, tag) => s + (selfRaw[tag.code]||0)**2, 0)) || 1;
        const selfNorm = {};
        S.tags.forEach(tag => selfNorm[tag.code] = (selfRaw[tag.code]||0) / selfMag);
        const ranked = myEnemies.map(en => {
          const ev = resolvedSrcBuildVals(en)?.enemy_weight || {};
          let sc = 0;
          S.tags.forEach(tag => { if (!SKIP_TAGS.has(tag.code)) sc += (selfNorm[tag.code]||0) * Math.max(0, -(ev[tag.code]||0)); });
          return { name: en, score: sc };
        }).sort((a, b) => b.score - a.score);
        activeEnemies = ranked.slice(0, 2).map(x => x.name);
        activeEnemies.forEach(n => v3Targets.push(n));
      }

      let allyScore = 0, enemyScore = 0;
      const allyBD = {}, enemyBD = {};

      S.tags.forEach(tag => {
        const t  = tag.code;
        const aw = rv.ally_weight[t]  ?? 0;
        const ew = rv.enemy_weight[t] ?? 0;

        myAllies.forEach(an => {
          const ss = resolvedSrcBuildVals(an)?.self_score?.[t] ?? 0;
          const c  = aw * ss;
          allyScore += c;
          allyBD[an] = (allyBD[an] || 0) + c;
        });

        activeEnemies.forEach(en => {
          const ss = resolvedSrcBuildVals(en)?.self_score?.[t] ?? 0;
          const c  = ew * ss;
          enemyScore += c;
          enemyBD[en] = (enemyBD[en] || 0) + c;
        });
      });

      // Average by team size
      const numAllies  = myAllies.length       || 1;
      const numEnemies = activeEnemies.length  || 1;
      allyScore  /= numAllies;
      enemyScore /= numEnemies;
      Object.keys(allyBD).forEach(k  => allyBD[k]  /= numAllies);
      Object.keys(enemyBD).forEach(k => enemyBD[k] /= numEnemies);

      // V2/V3: symmetric perspectives — how allies/enemies react to this build's output
      let allyScoreSelf = 0, enemyScoreSelf = 0;
      const allyBDSelf = {}, enemyBDSelf = {};
      if (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') {
        S.tags.forEach(tag => {
          const t  = tag.code;
          const ss = rv.self_score[t] ?? 0;
          myAllies.forEach(an => {
            const c = ss * (resolvedSrcBuildVals(an)?.ally_weight?.[t] ?? 0);
            allyScoreSelf += c;
            allyBDSelf[an] = (allyBDSelf[an] || 0) + c;
          });
          activeEnemies.forEach(en => {
            const c = ss * (resolvedSrcBuildVals(en)?.enemy_weight?.[t] ?? 0);
            enemyScoreSelf += c;
            enemyBDSelf[en] = (enemyBDSelf[en] || 0) + c;
          });
        });
        allyScoreSelf  /= numAllies;
        enemyScoreSelf /= numEnemies;
        Object.keys(allyBDSelf).forEach(k  => allyBDSelf[k]  /= numAllies);
        Object.keys(enemyBDSelf).forEach(k => enemyBDSelf[k] /= numEnemies);
      }

      // vsBreakdown: how well each enemy counters this build (high = bad for us)
      // = Σ_t(build.self_score[t] × enemy.enemy_weight[t])
      const vsBreakdown = {};
      S.tags.forEach(tag => {
        const ss = rv.self_score[tag.code] ?? 0;
        myEnemies.forEach(en => {
          vsBreakdown[en] = (vsBreakdown[en] || 0) + ss * (resolvedSrcBuildVals(en)?.enemy_weight?.[tag.code] ?? 0);
        });
      });

      const itemPool = MATCH.include9999 ? MATCH.itemData : MATCH.itemData.filter(it => it.tier !== 9999);
      const items = itemPool.map(item => {
        let iAlly = 0, iSelf = 0, iEnemy = 0;
        S.tags.forEach(tag => {
          const t  = tag.code;
          const is = tv(item.values?.self_score, t);
          const sw = rv.self_weight[t] ?? 0;
          iSelf += is * sw;
          myAllies.forEach(an => {
            iAlly += is * (resolvedSrcBuildVals(an)?.ally_weight?.[t] ?? 0);
          });
          activeEnemies.forEach(en => {
            iEnemy += is * (resolvedSrcBuildVals(en)?.enemy_weight?.[t] ?? 0) * -1;
          });
        });
        iAlly  /= numAllies;
        iEnemy /= numEnemies;
        const tm = tierMult(item.tier);
        return {
          key: item.normalized_name, name: item.name,
          category: item.category, tier: item.tier, imagePath: item.image_path,
          values:   item.values?.self_score || {},
          remarks:  item.remarks || '',
          upgrades_from: item.upgrades_from || [],
          total: (iAlly * MATCH.mult.itemAlly + iSelf + iEnemy * MATCH.mult.itemEnemy) * tm,
          ally: iAlly * tm, self: iSelf * tm, enemy: iEnemy * tm,
        };
      });

      // Items to Assist: item × build.ally_weight (highest = best assist)
      // Items to Counter: item × build.enemy_weight (lowest = best counter)
      const assistItems = itemPool.map(item => {
        let score = 0;
        S.tags.forEach(tag => {
          const t = tag.code;
          if (t === 'assist_importance' || t === 'counter_importance') return;
          score += tv(item.values?.self_score, t) * (rv.ally_weight[t] ?? 0);
        });
        const aImp = tv(item.values?.self_score, 'assist_importance');
        return { name: item.name, imagePath: item.image_path, score: score * (aImp || 1), _assist_imp: aImp };
      }).filter(x => x._assist_imp > 0)
        .sort((a, b) => b.score - a.score).slice(0, 3);

      const counterItems = itemPool.map(item => {
        let score = 0;
        S.tags.forEach(tag => {
          const t = tag.code;
          if (t === 'assist_importance' || t === 'counter_importance') return;
          score += tv(item.values?.self_score, t) * (rv.enemy_weight[t] ?? 0);
        });
        const cImp = tv(item.values?.self_score, 'counter_importance');
        return { name: item.name, imagePath: item.image_path, score: score * (cImp || 1), _raw_values: item.values?.self_score || {} };
      }).filter(x => tv(x._raw_values, 'counter_importance') > 0)
        .sort((a, b) => a.score - b.score).slice(0, 3);

      const total = (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3')
        ? allyScore     * MATCH.mult.buildAlly   +
          allyScoreSelf * MATCH.mult.allyBuild   +
          enemyScore    * MATCH.mult.buildEnemy  +
          enemyScoreSelf * MATCH.mult.enemyBuild
        : allyScore * MATCH.mult.buildAlly + enemyScore * MATCH.mult.buildEnemy;

      const buildResult = {
        buildIdx: bi, name: build.name || `Build ${bi + 1}`, isGeneral: bi === 0,
        total,
        ally: allyScore, enemy: enemyScore,
        allyScoreSelf, enemyScoreSelf, allyBDSelf, enemyBDSelf,
        allyBD, enemyBD, vsBreakdown, items, assistItems, counterItems,
        rv, heroName: name, v3Targets,
      };
      buildResult.buildPath = computeBuildPath(buildResult, MATCH.bpAlgo);
      return buildResult;
    });

    const nonGen    = buildResults.filter(b => !b.isGeneral);
    const ranked    = nonGen.length ? [...nonGen].sort((a, b) => b.total - a.total) : [buildResults[0]];
    const topBuilds = ranked.slice(0, 3);

    out.push({
      name, engName: heroData.eng_name || name, imagePath: heroData.image_path,
      isSelf, isEnemy: !onAlly, builds: buildResults, topBuilds,
    });
  });

  out.sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    if (!a.isEnemy && b.isEnemy) return -1;
    if (a.isEnemy && !b.isEnemy) return 1;
    return 0;
  });
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// STRENGTHS / WEAKNESSES HELPERS
// ════════════════════════════════════════════════════════════════════════════

// Per-build: strengths = top self_score tags, weaknesses = lowest enemy_weight tags
function computeStrengthsWeaknesses(heroName, buildName) {
  const rv = _rsvCache[heroName]?.[buildName] || {};
  const selfScores   = rv.self_score   || {};
  const enemyWeights = rv.enemy_weight || {};

  const strengths = S.tags
    .map(t => ({ code: t.code, name: t.name, val: selfScores[t.code] ?? 0 }))
    .filter(x => x.val > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  const weaknesses = S.tags
    .map(t => ({ code: t.code, name: t.name, val: enemyWeights[t.code] ?? 0 }))
    .sort((a, b) => a.val - b.val)
    .filter(x => x.val !== 0)
    .slice(0, 3);

  return { strengths, weaknesses };
}

// Team: aggregate self_score and enemy_weight across all heroes
function computeTeamStrengthsWeaknesses(heroNames) {
  const n = heroNames.length || 1;
  const strengths = S.tags.map(t => ({
    code: t.code, name: t.name,
    val: heroNames.reduce((s, nm) => s + (resolvedSrcBuildVals(nm)?.self_score?.[t.code] ?? 0), 0) / n,
  })).filter(x => x.val > 0).sort((a, b) => b.val - a.val).slice(0, 3);

  const weaknesses = S.tags.map(t => ({
    code: t.code, name: t.name,
    val: heroNames.reduce((s, nm) => s + (resolvedSrcBuildVals(nm)?.enemy_weight?.[t.code] ?? 0), 0) / n,
  })).sort((a, b) => a.val - b.val).filter(x => x.val !== 0).slice(0, 3);

  return { strengths, weaknesses };
}

function mkStrengthsWeaknessesEl(sw, compact = false) {
  const d = document.createElement('div');
  d.className = 'tag-affinity' + (compact ? ' ta-compact' : '');
  if (sw.strengths.length) {
    const row = document.createElement('div');
    row.className = 'ta-row';
    row.innerHTML = `<span class="ta-lbl ta-good-lbl">Strengths:</span>`
      + sw.strengths.map(t => `<span class="ta-tag ta-good" title="${fmtScore(t.val)}">${t.name}</span>`).join('');
    d.appendChild(row);
  }
  if (sw.weaknesses.length) {
    const row = document.createElement('div');
    row.className = 'ta-row';
    row.innerHTML = `<span class="ta-lbl ta-bad-lbl">Countered by:</span>`
      + sw.weaknesses.map(t => `<span class="ta-tag ta-bad" title="${fmtScore(t.val)}">${t.name}</span>`).join('');
    d.appendChild(row);
  }
  return d;
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════

function renderCalcSummary() {
  const tagPanel = document.getElementById('summary-tag-panel');
  tagPanel.innerHTML = '';

  // Tag profiles — ally team and enemy team side by side
  const profileRow = document.createElement('div');
  profileRow.className = 'ta-profile-row';

  if (MATCH.allies.length) {
    const sw    = computeTeamStrengthsWeaknesses(MATCH.allies);
    const panel = document.createElement('div');
    panel.className = 'calc-panel ta-team-panel';
    panel.innerHTML = '<div class="calc-panel-title">Ally Team Tag Profile</div>';
    panel.appendChild(mkStrengthsWeaknessesEl(sw));
    profileRow.appendChild(panel);
  }

  if (MATCH.enemies.length) {
    const sw    = computeTeamStrengthsWeaknesses(MATCH.enemies);
    const panel = document.createElement('div');
    panel.className = 'calc-panel ta-team-panel';
    panel.innerHTML = '<div class="calc-panel-title">Enemy Team Tag Profile</div>';
    panel.appendChild(mkStrengthsWeaknessesEl(sw));
    profileRow.appendChild(panel);
  }

  if (profileRow.children.length) tagPanel.appendChild(profileRow);

  // Best / Worst matchups panel
  if (MATCH.allies.length && MATCH.enemies.length) {
    const matchupScores = {};
    MATCH.results.filter(r => !r.isEnemy).forEach(r => {
      const b = r.topBuilds[0];
      if (!b) return;
      Object.entries(b.enemyBD || {}).forEach(([en, score]) => {
        matchupScores[en] = (matchupScores[en] || 0) + score;
      });
    });
    const sorted       = Object.entries(matchupScores).sort((a, b) => b[1] - a[1]);
    const bestMatchups = sorted.slice(0, 2);
    const worstMatchups= sorted.slice(-2).reverse();

    if (sorted.length) {
      const mp = document.createElement('div');
      mp.className = 'calc-panel ta-team-panel';
      mp.innerHTML = '<div class="calc-panel-title">Matchups</div>';
      const grid = document.createElement('div');
      grid.className = 'matchup-grid';

      const mkMatchupCol = (label, cls, entries) => {
        const col = document.createElement('div');
        col.className = `matchup-col ${cls}`;
        col.innerHTML = `<div class="matchup-col-lbl">${label}</div>`;
        entries.forEach(([name, score]) => {
          const heroData = MATCH.heroData[name];
          const engName  = heroData?.eng_name || name;
          const img      = srcUrl(heroData?.image_path || '');
          const row = document.createElement('div');
          row.className = 'matchup-row';
          row.innerHTML = `
            ${img ? `<img class="matchup-img" src="${img}" alt="">` : '<div class="matchup-img no-img">🦸</div>'}
            <span class="matchup-name">${engName}</span>
            <span class="matchup-score">${fmtScore(score)}</span>`;
          col.appendChild(row);
        });
        return col;
      };

      grid.appendChild(mkMatchupCol('Best Matchup',  'best-col',  bestMatchups));
      grid.appendChild(mkMatchupCol('Worst Matchup', 'worst-col', worstMatchups));
      mp.appendChild(grid);
      tagPanel.appendChild(mp);
    }
  }

  const grid = document.getElementById('summary-grid');
  grid.innerHTML = '';
  const allies  = MATCH.results.filter(r => !r.isEnemy);
  const enemies = MATCH.results.filter(r =>  r.isEnemy);

  function addSection(label, cls, list) {
    if (!list.length) return;
    const lbl = document.createElement('div');
    lbl.className = `summary-section ${cls}`;
    lbl.textContent = label;
    grid.appendChild(lbl);
    list.forEach(r => grid.appendChild(makeSummaryCard(r)));
  }
  addSection('Ally Team',   'ally-section',  allies);
  addSection('Enemy Team',  'enemy-section', enemies);
  renderRegenPanel();
}

function makeSummaryCard(r) {
  const card = document.createElement('div');
  card.className = 'summary-card'
    + (r.isSelf  ? ' sc-self'  : '')
    + (r.isEnemy ? ' sc-enemy' : '');

  const topBuild = r.topBuilds[0];
  const topItems = topBuild
    ? [...topBuild.items].sort((a, b) => b.total - a.total).slice(0, 3)
    : [];
  const img = srcUrl(r.imagePath);
  const genBuild = r.builds.find(x => x.isGeneral);
  const genTotal = genBuild?.total ?? 0;
  const maxVsBreak = topBuild
    ? Math.max(0, ...Object.values(topBuild.vsBreakdown || {}).filter(s => s > 0), 0)
    : 0;
  const isHeavilyCountered = maxVsBreak > 2.0;

  function scBuildRow(b) {
    let pctHtml = '';
    if (!b.isGeneral && genTotal !== 0) {
      const pct  = (b.total - genTotal) / Math.abs(genTotal) * 100;
      const sign = pct >= 0 ? '+' : '';
      const pcls = pct >= 0 ? 'pct-pos' : 'pct-neg';
      pctHtml = `<span class="sc-build-pct ${pcls}">${sign}${pct.toFixed(0)}%</span>`;
    }
    return `<div class="sc-build-row">
      <span class="sc-bname">${b.name}</span>
      ${pctHtml}
      <span class="sc-bscore">${fmtScore(b.total)}</span>
    </div>`;
  }

  card.innerHTML = `
    <div class="sc-header">
      ${img
        ? `<img class="sc-img" src="${img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="sc-img sc-no-img" ${img ? 'style="display:none"' : ''}>🦸</div>
      <div class="sc-info">
        <div class="sc-name">${r.isSelf ? '★ ' : ''}${r.engName}${isHeavilyCountered ? ' <span class="counter-warn" title="Heavily countered by enemy">!</span>' : ''}</div>
        <div class="sc-role">${r.isSelf ? 'You' : r.isEnemy ? 'Enemy' : 'Ally'}</div>
      </div>
    </div>
    <div class="sc-builds">
      ${r.topBuilds.map(b => scBuildRow(b)).join('')}
    </div>
    ${topItems.length ? `<div class="sc-items">
      <div class="sc-items-lbl">Top Items (${topBuild.name}):</div>
      ${topItems.map(it => `
        <div class="sc-item-row">
          ${it.imagePath ? `<img class="sc-item-img" src="${srcUrl(it.imagePath)}" alt="">` : ''}
          <span class="sc-item-name">${it.name}</span>
          <span class="sc-item-score">${fmtScore(it.total)}</span>
        </div>`).join('')}
    </div>` : ''}`;

  // Per-hero strengths / weaknesses (compact, using top build)
  const topBuildData = r.topBuilds[0]
    ? MATCH.heroData[r.name]?.builds[r.topBuilds[0].buildIdx]
    : null;
  if (topBuildData) {
    const sw = computeStrengthsWeaknesses(r.name, topBuildData.name);
    if (sw.strengths.length || sw.weaknesses.length) {
      const swEl = mkStrengthsWeaknessesEl(sw, true);
      swEl.classList.add('sc-tags');
      card.appendChild(swEl);
    }
  }

  // Items to Assist / Items to Counter (from top build)
  if (topBuild && (topBuild.assistItems?.length || topBuild.counterItems?.length)) {
    const acEl = document.createElement('div');
    acEl.className = 'sc-assist-counter';

    const mkAcCol = (label, cls, items) => {
      const col = document.createElement('div');
      col.className = `sc-ac-col ${cls}`;
      col.innerHTML = `<div class="sc-ac-lbl">${label}</div>`;
      items.forEach(it => {
        const img = srcUrl(it.imagePath);
        const row = document.createElement('div');
        row.className = 'sc-ac-item';
        row.innerHTML = `${img ? `<img class="sc-ac-img" src="${img}" alt="">` : ''}
          <span class="sc-ac-name">${it.name}</span>`;
        col.appendChild(row);
      });
      return col;
    };

    if (topBuild.assistItems?.length)
      acEl.appendChild(mkAcCol('Items to Assist', 'sc-ac-assist', topBuild.assistItems));
    if (topBuild.counterItems?.length)
      acEl.appendChild(mkAcCol('Items to Counter', 'sc-ac-counter', topBuild.counterItems));
    card.appendChild(acEl);
  }

  // Per-hero best/worst matchups (best from enemyBD, worst from vsBreakdown so V3 targeting doesn't overlap)
  if (topBuild && (Object.keys(topBuild.enemyBD || {}).length || Object.keys(topBuild.vsBreakdown || {}).length)) {
    const sorted   = Object.entries(topBuild.enemyBD || {}).sort((a, b) => b[1] - a[1]);
    const best     = sorted.slice(0, 2);
    const worst    = Object.entries(topBuild.vsBreakdown || {}).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 2);
    const muEl     = document.createElement('div');
    muEl.className = 'sc-matchups';

    const mkMuRow = (names, label, cls) => {
      if (!names.length) return;
      const sec = document.createElement('div');
      sec.className = `sc-mu-section ${cls}`;
      sec.innerHTML = `<span class="sc-mu-lbl">${label}</span>`;
      names.forEach(n => {
        const eName = Array.isArray(n) ? n[0] : n;
        const hd  = MATCH.heroData[eName];
        const img = srcUrl(hd?.image_path || '');
        const span = document.createElement('span');
        span.className = 'sc-mu-hero';
        span.innerHTML = `${img ? `<img class="sc-mu-img" src="${img}" alt="">` : ''}${hd?.eng_name || eName}`;
        sec.appendChild(span);
      });
      muEl.appendChild(sec);
    };

    if (MATCH.scoreFormula === 'v3' && topBuild.v3Targets?.length) {
      mkMuRow(topBuild.v3Targets, 'Targeting', 'mu-target');
    } else {
      mkMuRow(best,  'Best vs',  'mu-best');
    }
    mkMuRow(worst, 'Worst vs', 'mu-worst');
    card.appendChild(muEl);
  }

  card.addEventListener('click', () => openCalcHero(r.name));
  return card;
}

// ════════════════════════════════════════════════════════════════════════════
// HERO DETAIL
// ════════════════════════════════════════════════════════════════════════════

function openCalcHero(name) {
  MATCH.viewHeroName = name;
  const r = MATCH.results.find(x => x.name === name);
  if (!r) return;
  document.getElementById('calc-hero-name').textContent = r.engName;
  const el = document.getElementById('calc-hero-detail');
  el.innerHTML = '';

  // Hero portrait
  const heroData = MATCH.heroData[name];
  const topBldForBanner = r.topBuilds[0];
  const bannerMaxVs = topBldForBanner
    ? Math.max(0, ...Object.values(topBldForBanner.vsBreakdown || {}).filter(s => s > 0), 0)
    : 0;
  const bannerCountered = bannerMaxVs > 2.0;
  if (heroData?.image_path) {
    const banner = document.createElement('div');
    banner.className = 'ch-hero-banner';
    banner.innerHTML = `<img class="ch-hero-img" src="${srcUrl(heroData.image_path)}" alt="${r.engName}">
      <div class="ch-hero-banner-name">${r.engName}${bannerCountered ? ' <span class="counter-warn" title="Heavily countered by enemy">!</span>' : ''}</div>`;
    el.appendChild(banner);
  }

  const isV2 = MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3';
  const hdr = document.createElement('div');
  hdr.className = 'ch-header-row' + (isV2 ? ' v2' : '');
  hdr.innerHTML = isV2
    ? '<span>Build</span><span title="Your build benefits from allies">Ally</span><span title="Allies benefit from your build">+Ally</span><span title="Your build counters enemies">Enemy</span><span title="Enemies react to your build">+Enemy</span><span>Total</span>'
    : '<span>Build</span><span>Ally</span><span>Enemy</span><span>Total</span>';
  el.appendChild(hdr);

  const genBuild     = r.builds.find(x => x.isGeneral);
  const genTotal     = genBuild?.total ?? 0;
  const sortedBuilds = [...r.builds].sort((a, bld) => bld.total - a.total);
  sortedBuilds.forEach(b => {
    let totalHtml;
    if (!b.isGeneral && genTotal !== 0) {
      const pct  = (b.total - genTotal) / Math.abs(genTotal) * 100;
      const sign = pct >= 0 ? '+' : '';
      const pcls = pct >= 0 ? 'pct-pos' : 'pct-neg';
      totalHtml = `<span class="ch-pct ${pcls}">${sign}${pct.toFixed(0)}%</span><span class="ch-score-dim total-clr">${fmtScore(b.total)}</span>`;
    } else {
      totalHtml = `<span class="ch-score total-clr">${fmtScore(b.total)}</span>`;
    }
    const row = document.createElement('div');
    row.className = 'ch-build-row' + (b.isGeneral ? ' is-general' : '') + (isV2 ? ' v2' : '');
    row.innerHTML = isV2
      ? `<span class="ch-bname">${b.name}</span>
         <span class="ch-score ally-clr">${fmtScore(b.ally)}</span>
         <span class="ch-score ally-dim-clr">${fmtScore(b.allyScoreSelf)}</span>
         <span class="ch-score enemy-clr">${fmtScore(b.enemy)}</span>
         <span class="ch-score enemy-dim-clr">${fmtScore(b.enemyScoreSelf)}</span>
         <div class="ch-total-wrap">${totalHtml}</div>`
      : `<span class="ch-bname">${b.name}</span>
         <span class="ch-score ally-clr">${fmtScore(b.ally)}</span>
         <span class="ch-score enemy-clr">${fmtScore(b.enemy)}</span>
         <div class="ch-total-wrap">${totalHtml}</div>`;

    const buildData = MATCH.heroData[name]?.builds[b.buildIdx];
    if (buildData) {
      const sw = computeStrengthsWeaknesses(name, buildData.name);
      if (sw.strengths.length || sw.weaknesses.length) {
        const swEl = mkStrengthsWeaknessesEl(sw, true);
        swEl.classList.add('ch-ta-row');
        row.appendChild(swEl);
      }
    }

    // Top 5 items by type (spans full row)
    const itemsByType = document.createElement('div');
    itemsByType.className = 'ch-items-row';
    const sortedItems = [...b.items].sort((a, x) => x.total - a.total);
    ['Weapon', 'Vitality', 'Spirit'].forEach(cat => {
      const catItems = sortedItems.filter(it => it.category === cat && it.total > 0).slice(0, 5);
      if (!catItems.length) return;
      const col = document.createElement('div');
      col.className = 'ch-items-col';
      col.innerHTML = `<div class="it-cat-hdr it-cat-${cat.toLowerCase()}">${cat}</div>`;
      catItems.forEach(it => {
        const irow = document.createElement('div');
        irow.className = 'ch-item-mini';
        const img = srcUrl(it.imagePath);
        irow.innerHTML = `
          ${img ? `<img class="ch-item-img" src="${img}" alt="">` : '<div class="ch-item-img no-img"></div>'}
          <span class="ch-item-name">${it.name}</span>
          <span class="ch-item-score total-clr">${fmtScore(it.total)}</span>`;
        col.appendChild(irow);
      });
      itemsByType.appendChild(col);
    });
    if (itemsByType.children.length) row.appendChild(itemsByType);

    // Per-build matchup chips
    const bEnemyBD = Object.entries(b.enemyBD || {}).sort((a, x) => x[1] - a[1]);
    const bGoodVs  = bEnemyBD.slice(0, 2);
    const bBadVs   = Object.entries(b.vsBreakdown || {}).filter(([, s]) => s > 0).sort((a, x) => x[1] - a[1]).slice(0, 2);
    const bV3Tgts  = MATCH.scoreFormula === 'v3' && b.v3Targets?.length ? b.v3Targets : [];
    if (bGoodVs.length || bBadVs.length || bV3Tgts.length) {
      const muEl = document.createElement('div');
      muEl.className = 'sc-matchups ch-mu-row';
      const mkChips = (entries, label, cls, getName) => {
        if (!entries.length) return;
        const sec = document.createElement('div');
        sec.className = `sc-mu-section ${cls}`;
        sec.innerHTML = `<span class="sc-mu-lbl">${label}</span>`;
        entries.forEach(e => {
          const n = getName(e);
          const hd = MATCH.heroData[n];
          const img = srcUrl(hd?.image_path || '');
          const span = document.createElement('span');
          span.className = 'sc-mu-hero';
          span.innerHTML = `${img ? `<img class="sc-mu-img" src="${img}" alt="">` : ''}${hd?.eng_name || n}`;
          sec.appendChild(span);
        });
        muEl.appendChild(sec);
      };
      if (bV3Tgts.length) mkChips(bV3Tgts, 'Targeting', 'mu-target', n => n);
      else mkChips(bGoodVs, 'Best vs', 'mu-best', ([n]) => n);
      mkChips(bBadVs, 'Bad vs', 'mu-worst', ([n]) => n);
      row.appendChild(muEl);
    }

    row.addEventListener('click', () => openCalcBuild(name, b.buildIdx));
    el.appendChild(row);
  });
  showPage('calc-hero');
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD DETAIL
// ════════════════════════════════════════════════════════════════════════════

function openCalcBuild(heroName, buildIdx) {
  MATCH.viewBuildIdx = buildIdx;
  const r = MATCH.results.find(x => x.name === heroName);
  const b = r?.builds[buildIdx];
  if (!r || !b) return;
  document.getElementById('calc-build-name').textContent = `${r.engName} — ${b.name}`;
  const desc = MATCH.heroData[heroName]?.builds[buildIdx]?.build_description_eng || '';
  const descEl = document.getElementById('calc-build-desc');
  descEl.textContent = desc;
  descEl.classList.toggle('hidden', !desc);
  const el = document.getElementById('calc-build-detail');
  el.innerHTML = '';
  el.appendChild(mkScorePanel(b));
  el.appendChild(mkTagPanel(heroName, buildIdx));
  el.appendChild(mkBestWorstVsPanel(b));
  el.appendChild(mkAssistCounterBuildPanel(b, heroName, buildIdx));
  el.appendChild(mkBuildPathPanel(b));
  el.appendChild(mkBreakdownPanel(b));
  el.appendChild(mkItemsPanel(b, heroName));
  showPage('calc-build');
}

function mkPanel(title, inner) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = `<div class="calc-panel-title">${title}</div>`;
  if (typeof inner === 'string') d.innerHTML += inner;
  else d.appendChild(inner);
  return d;
}

function mkScorePanel(b) {
  const isV2 = MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3';
  const panel = mkPanel('Build Score', `
    <div class="score-trio">
      <div class="score-block"><div class="score-val ally-clr">${fmtScore(b.ally)}</div><div class="score-lbl">Ally</div></div>
      ${isV2 ? `<div class="score-block"><div class="score-val ally-dim-clr">${fmtScore(b.allyScoreSelf)}</div><div class="score-lbl">+Ally</div></div>` : ''}
      <div class="score-block"><div class="score-val enemy-clr">${fmtScore(b.enemy)}</div><div class="score-lbl">Enemy</div></div>
      ${isV2 ? `<div class="score-block"><div class="score-val enemy-dim-clr">${fmtScore(b.enemyScoreSelf)}</div><div class="score-lbl">+Enemy</div></div>` : ''}
      <div class="score-block"><div class="score-val total-clr">${fmtScore(b.total)}</div><div class="score-lbl">Total</div></div>
    </div>`);
  if (MATCH.scoreFormula === 'v3' && b.v3Targets?.length) {
    const names = b.v3Targets.map(n => MATCH.heroData[n]?.eng_name || n).join(', ');
    panel.innerHTML += `<div class="v3-targets-lbl">Targeting: <span class="v3-targets">${names}</span></div>`;
  }
  return panel;
}

function mkTagPanel(heroName, buildIdx) {
  const buildData = MATCH.heroData[heroName]?.builds[buildIdx];
  const d         = document.createElement('div');
  d.className     = 'calc-panel';
  d.innerHTML     = '<div class="calc-panel-title">Tag Profile</div>';
  if (buildData) {
    const sw = computeStrengthsWeaknesses(heroName, buildData.name);
    d.appendChild(mkStrengthsWeaknessesEl(sw));
  }
  return d;
}

function mkBreakdownPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Score Sources</div>';

  function addBD(entries, label, cls) {
    if (!entries.length) return;
    const sec = document.createElement('div');
    sec.className = 'bd-section';
    sec.innerHTML = `<div class="bd-label ${cls}">${label}</div>`;
    entries.forEach(([name, score]) => {
      const row = document.createElement('div');
      row.className = 'bd-row';
      row.innerHTML = `<span>${MATCH.heroData[name]?.eng_name || name}</span><span class="${cls}">${fmtScore(score)}</span>`;
      sec.appendChild(row);
    });
    d.appendChild(sec);
  }

  addBD(Object.entries(b.allyBD).sort((a, x) => x[1] - a[1]),  'Ally Contributions (you benefit from allies)',  'ally-clr');
  if (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') {
    addBD(Object.entries(b.allyBDSelf || {}).sort((a, x) => x[1] - a[1]), '+Ally Contributions (allies benefit from you)', 'ally-dim-clr');
  }
  addBD(Object.entries(b.enemyBD).sort((a, x) => x[1] - a[1]), 'Enemy Contributions (you counter enemies)', 'enemy-clr');
  if (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') {
    addBD(Object.entries(b.enemyBDSelf || {}).sort((a, x) => x[1] - a[1]), '+Enemy Contributions (enemies react to you)', 'enemy-dim-clr');
  }
  return d;
}

function mkItemsPanel(b, heroName) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Item Recommendations</div>';

  const notRecItems = computeNotRec(b.items);
  const notRecSet   = new Set(notRecItems.map(x => x.key));
  const mainItems   = b.items.filter(it => !notRecSet.has(it.key));

  const UNGROUPED_LIMIT = 30;
  const GROUPED_LIMIT   = 10;
  const NCOLS = 7;  // total column count for colspan
  const CATS  = ['Weapon', 'Vitality', 'Spirit'];
  const catState = { Weapon: 'summary', Vitality: 'summary', Spirit: 'summary', Other: 'summary' };
  const CAT_CYCLE = { summary: 'expanded', expanded: 'hidden', hidden: 'summary' };
  const CAT_ICON  = { summary: '▾', expanded: '▾', hidden: '▸' };

  const sortState = { col: 'total', dir: -1 };
  let groupByType = false;

  // Hero context for effectiveness notes
  const heroResult  = heroName ? MATCH.results.find(x => x.name === heroName) : null;
  const effAllies   = heroResult ? (heroResult.isEnemy ? MATCH.enemies.filter(n => n !== heroName) : MATCH.allies.filter(n => n !== heroName)) : [];
  const effEnemies  = heroResult ? (heroResult.isEnemy ? MATCH.allies : MATCH.enemies) : [];

  const COLS = [
    { key: 'name',          label: 'Item',          sortable: true  },
    { key: 'remarks',       label: 'Remarks',       sortable: false },
    { key: 'effectiveness', label: 'Effectiveness', sortable: false },
    { key: 'ally',          label: 'Ally',          sortable: true  },
    { key: 'self',          label: 'Self',          sortable: true  },
    { key: 'enemy',         label: 'Enemy',         sortable: true  },
    { key: 'total',         label: 'Total',         sortable: true  },
  ];

  // Controls
  const ctrlBar = document.createElement('div');
  ctrlBar.className = 'ci-ctrl-bar';
  ctrlBar.innerHTML = `<label class="ci-bytype-lbl"><input type="checkbox" class="ci-bytype-chk"> Group by Type</label>`;
  d.appendChild(ctrlBar);

  const wrap = document.createElement('div');
  wrap.className = 'ci-table-wrap';
  d.appendChild(wrap);

  function sortedList(items) {
    return [...items].sort((a, x) => {
      if (sortState.col === 'name') return sortState.dir * a.name.localeCompare(x.name);
      return sortState.dir * ((a[sortState.col] ?? 0) - (x[sortState.col] ?? 0));
    });
  }

  function mkEffCell(it) {
    const td = document.createElement('td');
    td.className = 'ci-eff';

    // Self (yellow) — show current hero icon if above threshold
    if (heroResult && it.self >= EFFECT_THRESH.self.norm) {
      const hd  = MATCH.heroData[heroName];
      td.appendChild(mkEffIcon(
        srcUrl(hd?.image_path || ''),
        hd?.eng_name || heroName,
        'eff-self',
        it.self >= EFFECT_THRESH.self.super,
        `Self: ${fmtScore(it.self)}`
      ));
    }

    // Ally synergy (green)
    effAllies.forEach(an => {
      const score = S.tags.reduce((sum, tag) => {
        if (SKIP_TAGS.has(tag.code)) return sum;
        return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(an)?.ally_weight?.[tag.code] ?? 0);
      }, 0);
      if (score < EFFECT_THRESH.ally.norm) return;
      const hd = MATCH.heroData[an];
      td.appendChild(mkEffIcon(
        srcUrl(hd?.image_path || ''),
        hd?.eng_name || an,
        'eff-ally',
        score >= EFFECT_THRESH.ally.super,
        `${hd?.eng_name || an}: ${fmtScore(score)}`
      ));
    });

    // Enemy counter (red) — negate raw score so positive = effective counter
    effEnemies.forEach(en => {
      const raw = S.tags.reduce((sum, tag) => {
        if (SKIP_TAGS.has(tag.code)) return sum;
        return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(en)?.enemy_weight?.[tag.code] ?? 0);
      }, 0);
      const score = -raw;   // mirror iEnemy which uses ×-1 in total calc
      if (score <= 0 || score < EFFECT_THRESH.enemy.norm) return;
      const hd = MATCH.heroData[en];
      td.appendChild(mkEffIcon(
        srcUrl(hd?.image_path || ''),
        hd?.eng_name || en,
        'eff-enemy',
        score >= EFFECT_THRESH.enemy.super,
        `vs ${hd?.eng_name || en}: ${fmtScore(score)}`
      ));
    });

    return td;
  }

  function mkItemTr(it) {
    const tr  = document.createElement('tr');
    const img = srcUrl(it.imagePath);
    tr.innerHTML = `
      <td class="ci-item-cell">
        ${img ? `<img class="ci-item-img" src="${img}" alt="" onerror="this.style.display='none'">` : ''}
        <span class="ci-item-name">${it.name}</span>
        <span class="ci-tier">${it.tier ? it.tier + '★' : ''}</span>
      </td>
      <td class="ci-remarks-cell">${it.remarks ? `<span class="ci-remarks-txt">${it.remarks}</span>` : ''}</td>`;
    tr.appendChild(mkEffCell(it));
    tr.insertAdjacentHTML('beforeend', `
      <td class="ci-num ally-clr">${fmtScore(it.ally)}</td>
      <td class="ci-num">${fmtScore(it.self)}</td>
      <td class="ci-num enemy-clr">${fmtScore(it.enemy)}</td>
      <td class="ci-num total-clr"><b>${fmtScore(it.total)}</b></td>`);
    return tr;
  }

  function appendCatGroup(tbody, cat, items, cls) {
    if (!items.length) return;
    const state = catState[cat];
    const hdr = document.createElement('tr');
    hdr.className = 'ci-cat-sep ci-cat-clickable';
    hdr.innerHTML = `<td colspan="${NCOLS}" class="ci-cat-sep-cell it-cat-${cls}">
      <span class="ci-cat-icon">${CAT_ICON[state]}</span> ${cat}
      <span class="ci-cat-count">${state === 'summary' ? Math.min(items.length, GROUPED_LIMIT) : items.length} / ${items.length}</span>
      <span class="ci-cat-state-hint">${state === 'hidden' ? '(hidden)' : state === 'expanded' ? '(all)' : ''}</span>
    </td>`;
    hdr.addEventListener('click', () => { catState[cat] = CAT_CYCLE[state]; buildTable(); });
    tbody.appendChild(hdr);
    if (state === 'hidden') return;
    const visible = state === 'summary' ? items.slice(0, GROUPED_LIMIT) : items;
    visible.forEach(it => tbody.appendChild(mkItemTr(it)));
    if (state === 'summary' && items.length > GROUPED_LIMIT) {
      const moreRow = document.createElement('tr');
      moreRow.className = 'ci-show-more-row';
      moreRow.innerHTML = `<td colspan="${NCOLS}"><button class="ci-show-more-btn">Show ${items.length - GROUPED_LIMIT} more…</button></td>`;
      moreRow.querySelector('button').addEventListener('click', e => {
        e.stopPropagation(); catState[cat] = 'expanded'; buildTable();
      });
      tbody.appendChild(moreRow);
    }
  }

  function buildTable() {
    wrap.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'ci-sort-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    COLS.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      if (col.sortable) {
        th.className = 'ci-sortable';
        if (sortState.col === col.key) th.classList.add(sortState.dir === -1 ? 'sort-desc' : 'sort-asc');
        th.addEventListener('click', () => {
          if (sortState.col === col.key) sortState.dir *= -1;
          else { sortState.col = col.key; sortState.dir = -1; }
          buildTable();
        });
      }
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const sorted = sortedList(mainItems);

    if (groupByType) {
      CATS.forEach(cat => appendCatGroup(tbody, cat, sorted.filter(it => it.category === cat), cat.toLowerCase()));
      const other = sorted.filter(it => !CATS.includes(it.category));
      if (other.length) appendCatGroup(tbody, 'Other', other, '');
    } else {
      const visible = sorted.slice(0, UNGROUPED_LIMIT);
      if (visible.length) visible.forEach(it => tbody.appendChild(mkItemTr(it)));
      else {
        const er = document.createElement('tr');
        er.innerHTML = `<td colspan="${NCOLS}" class="empty-msg">No items scored.</td>`;
        tbody.appendChild(er);
      }
    }

    table.appendChild(tbody);
    wrap.appendChild(table);
  }

  buildTable();

  d.querySelector('.ci-bytype-chk').addEventListener('change', e => {
    groupByType = e.target.checked;
    buildTable();
  });

  // ── Not Recommended block ─────────────────────────────────────────────────
  if (notRecItems.length) {
    const nrBlock = document.createElement('div');
    nrBlock.className = 'ci-not-rec-block';
    let nrOpen = false;

    const nrHdr = document.createElement('div');
    nrHdr.className = 'ci-not-rec-hdr';
    nrHdr.innerHTML =
      `<span class="ci-nr-toggle">▸</span>
       <span class="ci-nr-title">Not Recommended</span>
       <span class="ci-not-rec-count">${notRecItems.length}</span>
       <span class="ci-nr-hint">(total &lt; 1.0 &amp; enemy &lt; 0) or self &lt; 0.5</span>`;
    nrBlock.appendChild(nrHdr);

    const nrWrap = document.createElement('div');
    nrWrap.className = 'ci-nr-body hidden';
    const nrTable = document.createElement('table');
    nrTable.className = 'ci-sort-table';
    nrTable.innerHTML = `<thead><tr>
      <th class="ci-sortable">Item</th>
      <th class="ci-sortable ci-num">Ally</th>
      <th class="ci-sortable ci-num">Self</th>
      <th class="ci-sortable ci-num enemy-clr">Enemy</th>
      <th class="ci-sortable ci-num total-clr">Total</th>
      <th></th>
    </tr></thead>`;
    const nrBody = document.createElement('tbody');
    notRecItems.forEach(it => {
      const tr = mkItemTr(it);
      tr.className = 'ci-not-rec-row';
      nrBody.appendChild(tr);
    });
    nrTable.appendChild(nrBody);
    nrWrap.appendChild(nrTable);
    nrBlock.appendChild(nrWrap);

    nrHdr.addEventListener('click', () => {
      nrOpen = !nrOpen;
      nrWrap.classList.toggle('hidden', !nrOpen);
      nrHdr.querySelector('.ci-nr-toggle').textContent = nrOpen ? '▾' : '▸';
    });

    d.appendChild(nrBlock);
  }

  return d;
}

function computeNotRec(items) {
  return items
    .filter(it => (it.total < 1.0 && it.enemy < 0) || (it.self < 0.5 && it.enemy < EFFECT_THRESH.enemy.norm))
    .sort((a, b) => a.total - b.total);
}

// ── Tier score multiplier ─────────────────────────────────────────────────────
// Higher-tier items receive a slight bonus to account for their greater impact.
// Edit these values to adjust tier scaling.
function tierMult(tier) {
  if (tier <= 800)  return 1.0;
  if (tier <= 1600) return 1.2;
  if (tier <= 3200) return 1.4;
  if (tier <= 6400) return 1.6;
  return 2.0;
}

// ── Effectiveness icon helper (module scope) ──────────────────────────────────
function mkEffIcon(imgSrc, _name, colorCls, isVery, titleText) {
  const el = document.createElement('span');
  el.className = `eff-icon ${colorCls}${isVery ? ' eff-very' : ''}`;
  el.title = titleText;
  if (imgSrc) {
    const i = document.createElement('img');
    i.src = imgSrc; i.alt = '';
    el.appendChild(i);
  }
  if (isVery) {
    const badge = document.createElement('span');
    badge.className = 'eff-super-badge';
    badge.textContent = '!';
    el.appendChild(badge);
  }
  return el;
}

// Returns a span containing effectiveness icons for a scored item (used in build path / assist panels)
function mkEffIcons(it, heroName) {
  const heroResult = heroName ? MATCH.results.find(x => x.name === heroName) : null;
  const effAllies  = heroResult ? (heroResult.isEnemy ? MATCH.enemies.filter(n => n !== heroName) : MATCH.allies.filter(n => n !== heroName)) : [];
  const effEnemies = heroResult ? (heroResult.isEnemy ? MATCH.allies : MATCH.enemies) : [];
  const wrap = document.createElement('span');
  wrap.className = 'bp-eff-icons';

  if (heroResult && it.self >= EFFECT_THRESH.self.norm) {
    const hd = MATCH.heroData[heroName];
    wrap.appendChild(mkEffIcon(srcUrl(hd?.image_path || ''), hd?.eng_name || heroName, 'eff-self',
      it.self >= EFFECT_THRESH.self.super, `Self: ${fmtScore(it.self)}`));
  }
  effAllies.forEach(an => {
    const score = S.tags.reduce((sum, tag) => {
      if (SKIP_TAGS.has(tag.code)) return sum;
      return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(an)?.ally_weight?.[tag.code] ?? 0);
    }, 0);
    if (score < EFFECT_THRESH.ally.norm) return;
    const hd = MATCH.heroData[an];
    wrap.appendChild(mkEffIcon(srcUrl(hd?.image_path || ''), hd?.eng_name || an, 'eff-ally',
      score >= EFFECT_THRESH.ally.super, `${hd?.eng_name || an}: ${fmtScore(score)}`));
  });
  effEnemies.forEach(en => {
    const raw = S.tags.reduce((sum, tag) => {
      if (SKIP_TAGS.has(tag.code)) return sum;
      return sum + tv(it.values, tag.code) * (resolvedSrcBuildVals(en)?.enemy_weight?.[tag.code] ?? 0);
    }, 0);
    const score = -raw;
    if (score <= 0 || score < EFFECT_THRESH.enemy.norm) return;
    const hd = MATCH.heroData[en];
    wrap.appendChild(mkEffIcon(srcUrl(hd?.image_path || ''), hd?.eng_name || en, 'eff-enemy',
      score >= EFFECT_THRESH.enemy.super, `vs ${hd?.eng_name || en}: ${fmtScore(score)}`));
  });
  return wrap;
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD DETAIL — EXTRA PANELS
// ════════════════════════════════════════════════════════════════════════════

function mkBestWorstVsPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Matchups</div>';

  const goodVs = Object.entries(b.enemyBD    || {}).sort((a, x) => x[1] - a[1]).slice(0, 2);
  const badVs  = Object.entries(b.vsBreakdown || {}).filter(([, s]) => s > 0).sort((a, x) => x[1] - a[1]).slice(0, 2);

  if (!goodVs.length && !badVs.length) {
    d.innerHTML += '<div class="calc-empty">No enemy matchup data.</div>';
    return d;
  }

  const grid = document.createElement('div');
  grid.className = 'matchup-grid';

  const mkCol = (label, cls, entries) => {
    if (!entries.length) return;
    const col = document.createElement('div');
    col.className = `matchup-col ${cls}`;
    col.innerHTML = `<div class="matchup-col-lbl">${label}</div>`;
    entries.forEach(([name, score]) => {
      const hd  = MATCH.heroData[name];
      const img = srcUrl(hd?.image_path || '');
      const row = document.createElement('div');
      row.className = 'matchup-row';
      row.innerHTML = `
        ${img ? `<img class="matchup-img" src="${img}" alt="">` : '<div class="matchup-img no-img">🦸</div>'}
        <span class="matchup-name">${hd?.eng_name || name}</span>
        <span class="matchup-score">${fmtScore(score)}</span>`;
      col.appendChild(row);
    });
    grid.appendChild(col);
  };

  if (MATCH.scoreFormula === 'v3' && b.v3Targets?.length) {
    const tgtEntries = b.v3Targets.map(n => [n, b.enemyBD?.[n] ?? 0]);
    mkCol('Targeting', 'target-col', tgtEntries);
  } else {
    mkCol('Good vs', 'best-col', goodVs);
  }
  mkCol('Bad vs', 'worst-col', badVs);
  d.appendChild(grid);
  return d;
}

// heroName + buildIdx needed to access build.ally_weight / enemy_weight for correct scoring
function mkAssistCounterBuildPanel(b, heroName, buildIdx) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = `<div class="calc-panel-title">Situational Items</div>
    <div class="sit-panel-note">
      <span class="sit-note-ally">Ally Items</span> — items teammates should buy when playing alongside this hero &nbsp;|&nbsp;
      <span class="sit-note-enemy">Counter Items</span> — items opponents should buy to counter this hero
    </div>`;

  const buildData = MATCH.heroData[heroName]?.builds[buildIdx];
  const rv     = _rsvCache[heroName]?.[buildData?.name] || {};
  const allyW  = rv.ally_weight  || {};
  const enemyW = rv.enemy_weight || {};

  // assistScore: Σ(item.self_score × build.ally_weight) — items allies should buy
  // counterScore: Σ(item.self_score × build.enemy_weight) — LOWEST = items enemies buy to counter this build
  const scored = b.items.map(it => {
    let assistScore = 0, counterScore = 0;
    S.tags.forEach(tag => {
      if (SKIP_TAGS.has(tag.code)) return;
      const is = tv(it.values, tag.code);
      assistScore  += is * (allyW[tag.code]  ?? 0);
      counterScore += is * (enemyW[tag.code] ?? 0);
    });
    return { ...it, assistScore, counterScore };
  });

  const assistItems  = [...scored].sort((a, x) => x.assistScore  - a.assistScore ).slice(0, 15);
  const counterItems = [...scored].sort((a, x) => a.counterScore - x.counterScore).slice(0, 15); // lowest first

  if (!assistItems.length && !counterItems.length) {
    d.innerHTML += '<div class="calc-empty">No situational item data.</div>';
    return d;
  }

  const row = document.createElement('div');
  row.className = 'sit-items-row';

  const mkCol = (label, cls, items, scoreKey) => {
    if (!items.length) return;
    const col = document.createElement('div');
    col.className = `sit-col ${cls}`;
    col.innerHTML = `<div class="sit-col-lbl">${label}</div>`;
    items.forEach(it => {
      const img  = srcUrl(it.imagePath);
      const item = document.createElement('div');
      item.className = 'sit-item';
      item.innerHTML = `
        ${img ? `<img class="sc-ac-img" src="${img}" alt="">` : ''}
        <span class="sc-ac-name">${it.name}</span>
        <span class="sit-score">${fmtScore(it[scoreKey])}</span>`;
      col.appendChild(item);
    });
    row.appendChild(col);
  };

  mkCol('Ally Items',    'sit-assist',  assistItems,  'assistScore');
  mkCol('Counter Items', 'sit-counter', counterItems, 'counterScore');
  d.appendChild(row);
  return d;
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD PATH GUIDE
// ════════════════════════════════════════════════════════════════════════════

// Phase definitions — addBudget is the ADDITIONAL souls earned entering this phase.
// maxSells: max sell operations allowed this phase (0 = no selling in Lane/Early).
const BUILD_PHASES = [
  { name: 'Lane',       addBudget: 3200,    totalSlots: 9,  minSlots: 3,  maxSells: 0 },
  { name: 'Early',      addBudget: 6400,    totalSlots: 9,  minSlots: 6,  maxSells: 0 },
  { name: 'Mid',        addBudget: 12800,   totalSlots: 10, minSlots: 9,  maxSells: 2 },
  { name: 'Late',       addBudget: 19800,   totalSlots: 12, minSlots: 11, maxSells: 3 },
  { name: 'Extra Late', addBudget: 1000000, totalSlots: 12, minSlots: 12, maxSells: 5 },
];

// Per-phase assist/counter tier options.
// Multiple options are tried; the one with the highest total score is used.
const ASSIST_PHASE_OPTIONS = {
  'Lane':       [{ tier: 800,  max: 2 }, { tier: 1600, max: 1 }],
  'Early':      [{ tier: 1600, max: 2 }, { tier: 3200, max: 1 }],
  'Mid':        [{ tier: 3200, max: 2 }, { tier: 6400, max: 1 }],
  'Late':       [{ tier: 6400, max: 2 }, { tier: 3200, max: 2 }],
  'Extra Late': [{ tier: 6400, max: 2 }],
};

// Per-phase tier preference multipliers — edit to tune which item tiers are preferred per phase.
//   index 0=T1(800), 1=T2(1600), 2=T3(3200), 3=T4(6400+)
const PHASE_TIER_MULTS = {
  //              T1(800)  T2(1600)  T3(3200)  T4(6400+)
  'Lane':       [ 1.3,     0.95,      0.15,     0.0  ],
  'Early':      [ 0.8,    0.95,      0.55,      0.05 ],
  'Mid':        [ 0.45,     0.8,     1.05,      0.65  ],
  'Late':       [ 0.0,     0.2,     1.1,      1.55  ],
  'Extra Late': [ 0.0,     0,      0.55,      2.05  ],
};

function getPhaseTierMult(phaseName, tier) {
  const m = PHASE_TIER_MULTS[phaseName] ?? PHASE_TIER_MULTS['Mid'];
  if (tier <= 800)  return m[0];
  if (tier <= 1600) return m[1];
  if (tier <= 3200) return m[2];
  return m[3];
}

// Build-path score: strips the global tier mult, applies phase tier mult, uses 0.75× ally/enemy
// so self-score drives the path more than team synergy numbers.
function bpScore(it, phaseName) {
  const tier    = bpItemMap[it.key]?.tier ?? 800;
  const gm      = tierMult(tier) || 1;
  const base    = (it.ally / gm) * 0.75 + (it.self / gm) + (it.enemy / gm);
  return base * getPhaseTierMult(phaseName, tier);
}

// ── Build-path algorithm utilities ────────────────────────────────────────
const COSINE_MATCH_MULT  = 0.5;
const COSINE_ENEMY_MULT  = 0.75;  // used by cosine-match (linear)
const COSINE_ENEMY_K    = 1.37;   // power-func scale: matches 0.75× linear at |signal|=0.30
const COSINE_ENEMY_POW  = 1.5;    // super-linear: amplifies strong enemy signals, spares weak ones
const COSINE_SW_DAMP    = 4;      // dampens enemy correction when hero already has self_weight for that tag
const COSINE_CTR_BOOST  = 2.0;    // boost multiplier for counter-direction (negative enemy signal)

function vecMagBP(v, keys) {
  return Math.sqrt(keys.reduce((s, t) => s + (v[t] || 0) ** 2, 0));
}
function cosineSimBP(a, b, keys) {
  const dot = keys.reduce((s, t) => s + (a[t] || 0) * (b[t] || 0), 0);
  const mag  = vecMagBP(a, keys) * vecMagBP(b, keys);
  return mag > 0 ? dot / mag : 0;
}
function vecNormalizeBP(v, keys) {
  const mag = vecMagBP(v, keys);
  const out = {};
  keys.forEach(t => { out[t] = mag > 0 ? (v[t] || 0) / mag : 0; });
  return out;
}
function bpDeficit(targetNorm, owned, scoredMap, keys) {
  const invVec = {};
  keys.forEach(t => { invVec[t] = 0; });
  owned.forEach(k => {
    const it = scoredMap[k];
    if (!it) return;
    keys.forEach(t => { invVec[t] += (it.values?.[t] || 0); });
  });
  const invNorm = vecNormalizeBP(invVec, keys);
  const deficit = {};
  keys.forEach(t => { deficit[t] = Math.max(0, (targetNorm[t] || 0) - invNorm[t]); });
  return deficit;
}
function bpSoulIncome(totalEarned) {
  if (totalEarned < 3200)  return 200;
  if (totalEarned < 9600)  return 533;
  if (totalEarned < 22400) return 1280;
  return 1067;
}
function bpAvgRsvVec(heroNames, weightKey) {
  const vectors = heroNames.map(n => {
    const hero  = MATCH.heroData[n];
    if (!hero) return null;
    const idx   = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    return build ? (_rsvCache[n]?.[build.name]?.[weightKey] || null) : null;
  }).filter(Boolean);
  if (!vectors.length) return {};
  const avg = {};
  vectors.forEach(v => Object.keys(v).forEach(t => { avg[t] = (avg[t] || 0) + v[t]; }));
  Object.keys(avg).forEach(t => { avg[t] /= vectors.length; });
  return avg;
}

// Enemy-team vector with convex team-fraction scaling for the adaptive algorithm.
// Unlike bpAvgRsvVec, nulls/zeros are excluded from the significant-value count so
// that 1 extremely spirit-heavy enemy out of 6 barely nudges spirit_resistance,
// while 4-6 spirit-heavy enemies push it strongly (fraction^1.5 curve).
function bpEnemyTeamVec(heroNames, threshold = 0.05) {
  const N = heroNames.length;
  if (!N) return {};
  const vectors = heroNames.map(n => {
    const hero  = MATCH.heroData[n];
    if (!hero) return null;
    const idx   = MATCH.selectedBuilds[n] ?? 0;
    const build = hero.builds[idx] || hero.builds[0];
    return build ? (_rsvCache[n]?.[build.name]?.['enemy_weight'] || null) : null;
  }).filter(Boolean);
  if (!vectors.length) return {};
  const allTags = new Set();
  vectors.forEach(v => Object.keys(v).forEach(t => allTags.add(t)));
  const result = {};
  if (_bpDbg) _bpDbg.enemyFactorDetail = {};
  allTags.forEach(t => {
    const vals    = vectors.map(v => v[t] || 0);
    const sigVals = vals.filter(v => Math.abs(v) > threshold);
    if (!sigVals.length) { result[t] = 0; return; }
    const fraction = sigVals.length / N;
    const scale    = Math.pow(fraction, 1.5);
    const avgSig   = sigVals.reduce((s, v) => s + v, 0) / sigVals.length;
    result[t]      = avgSig * scale;
    if (_bpDbg) _bpDbg.enemyFactorDetail[t] = { sigCount: sigVals.length, N, fraction, scale, avgSig, result: result[t] };
  });
  return result;
}

// Module-level map populated at the start of each computeBuildPath call.
let bpItemMap = {};
// Set to a plain object before computeBuildPath to enable debug capture; null = off.
let _bpDbg = null;

function computeBuildPath(b, algo = 'greedy-phase') {
  bpItemMap = {};
  MATCH.itemData.forEach(it => { bpItemMap[it.normalized_name] = it; });

  const scoredMap = {};
  const consumedComponents = new Set();
  b.items.forEach(it => { scoredMap[it.key] = it; });

  const tagKeys = S.tags.map(t => t.code);

  // Reverse map: component key → upgrades that consume it
  const upgradesTo = {};
  Object.keys(bpItemMap).forEach(k => {
    (bpItemMap[k].upgrades_from || []).forEach(comp => {
      if (!upgradesTo[comp]) upgradesTo[comp] = [];
      upgradesTo[comp].push(k);
    });
  });

  // Item k is pointless to buy if we already own one of its upgrades
  function isSubsumed(k, owned) {
    return (upgradesTo[k] || []).some(u => owned.has(u));
  }

  // ── Build-level constraints (signature / required / blacklist / counter slots) ──
  const SIG_MULT             = 1.5;   // sig/required boost for greedyMain (greedy/marginal/cosine/lookahead)
  const SIG_MULT_STRONG      = 2.0;   // stronger boost for non-greedy algos (beam/expert/assassin/hybrid)
                                      // — needed because their cosine-style scoring dampens overlapping tags.
  const REQ_STICKY_MULT      = 1.5;   // sell-swap stickiness for required items
  const COUNTER_TAG_THRESH   = 0.3;   // item.values.counter_importance > X → counter item
  const COUNTER_FORCE_FRAC   = 0.5;   // soft-min: force counter buy only if its score ≥ X × best non-counter
  const COUNTER_BOOST_LOW    = 1.8;   // in-loop multiplier for counter items when below this phase's min
  const DEFAULT_COUNTER_SLOTS = [[0,1],[0,2],[1,2],[2,3],[2,4]];  // Lane, Early, Mid, Late, Extra Late

  // Resolve constraints through the follow chain (inherited items + own additions − exclusions).
  // Falls back to the raw build object's own fields when hero data isn't loaded.
  const _hbList = MATCH.heroData[b.heroName]?.builds || null;
  const _ownBuild = _hbList ? (_hbList[b.buildIdx] || _hbList.find(hb => hb.name === b.name)) : null;
  const _bcResolved = (_hbList && _ownBuild)
    ? resolveBuildConstraints(_ownBuild, _hbList)
    : {
        signature_items: new Set(b.signature_items || []),
        required_items:  new Set(b.required_items  || []),
        blacklist_items: new Set(b.blacklist_items || []),
        counter_phase_slots: DEFAULT_COUNTER_SLOTS.map((d, i) => {
          const u = (b.counter_phase_slots || [])[i];
          if (!Array.isArray(u)) return d;
          const lo = (u[0] === null || u[0] === undefined || u[0] === '') ? d[0] : Number(u[0]);
          const hi = (u[1] === null || u[1] === undefined || u[1] === '') ? d[1] : Number(u[1]);
          return [Number.isFinite(lo) ? lo : d[0], Number.isFinite(hi) ? hi : d[1]];
        }),
      };
  const signatureSet = _bcResolved.signature_items;
  const requiredSet  = _bcResolved.required_items;
  const blacklistSet = _bcResolved.blacklist_items;
  const counterSlots = _bcResolved.counter_phase_slots;

  function isCounterItem(it) {
    return (it?.values?.counter_importance || 0) > COUNTER_TAG_THRESH;
  }
  function itemBoostMult(k) {
    return (signatureSet.has(k) || requiredSet.has(k)) ? SIG_MULT : 1.0;
  }
  // Stronger boost for non-greedy algorithms whose cosine-style scoring otherwise
  // dampens signature/required items via tag-coverage saturation.
  function itemBoostMultStrong(k) {
    return (signatureSet.has(k) || requiredSet.has(k)) ? SIG_MULT_STRONG : 1.0;
  }
  function isFlaggedItem(k) {
    return signatureSet.has(k) || requiredSet.has(k);
  }
  function countCounterItems(ownedSet) {
    let n = 0;
    ownedSet.forEach(k => { if (isCounterItem(scoredMap[k])) n++; });
    return n;
  }

  // Budget to acquire k from current state.
  // When no prereqs are owned: = item.tier (prereq cost + upgrade cost nets to item.tier).
  // When some prereqs are owned: = item.tier − (sum of owned prereq tiers).
  function chainCost(k, owned) {
    const item = bpItemMap[k];
    if (!item) return Infinity;
    const disc = (item.upgrades_from || [])
      .filter(c => owned.has(c))
      .reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
    return item.tier - disc;
  }

  // Emit the full purchase chain for k, mutate owned+changes, return souls spent.
  function emitChain(k, owned, changes) {
    const item = bpItemMap[k];
    if (!item) return 0;
    let spent = 0;
    // Buy unowned prerequisites first (Deadlock upgrade chains are depth-1)
    (item.upgrades_from || []).forEach(c => {
      if (!owned.has(c) && bpItemMap[c]) {
        const cCost = bpItemMap[c].tier;
        owned.add(c);
        spent += cCost;
        changes.push({ action: 'buy', key: c, components: [], cost: cCost });
      }
    });
    const comps    = (item.upgrades_from || []).filter(c => owned.has(c));
    const mainCost = item.tier - comps.reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
    comps.forEach(c => { owned.delete(c); consumedComponents.add(c); });
    owned.add(k);
    spent += mainCost;
    changes.push({ action: comps.length ? 'upgrade' : 'buy', key: k, components: comps, cost: mainCost });
    return spent;
  }

  // ── Algorithm: marginal value ──────────────────────────────────────────────
  // When scoring an upgrade whose component is already owned, subtract the component's
  // phase-score so only the *incremental* gain is compared against other candidates.
  function marginalScoreFn(k, it, phaseName, owned) {
    const base = bpScore(it, phaseName);
    const comps = bpItemMap[k]?.upgrades_from || [];
    const ownedCompScore = comps
      .filter(c => owned.has(c) && scoredMap[c])
      .reduce((sum, c) => sum + bpScore(scoredMap[c], phaseName), 0);
    return Math.max(0, base - ownedCompScore);
  }

  // ── Algorithms: cosine deficit & cosine match ──────────────────────────────
  const rv = b.rv || {};

  // Lazily computed raw guide vector (NOT normalized — preserves magnitude).
  // cosine:       self_weight - 0.5*enemyAvg, clamped ≥ 0
  // cosine-match: self_weight + 0.5*allyAvg - 0.75*enemyAvg, clamped ≥ 0
  // adaptive:     blend like cosine-match but uses team-fraction-scaled enemy vec,
  //               then normalized back to self_weight's magnitude (rotation, not inflation)
  let _cosineGuide = null;
  function getCosineGuide() {
    if (_cosineGuide) return _cosineGuide;
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myAllies  = onAlly ? MATCH.allies.filter(n => n !== heroName) : MATCH.enemies.filter(n => n !== heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    if (algo === 'adaptive') {
      const allyAvg     = bpAvgRsvVec(myAllies, 'ally_weight');
      const enemyFactor = bpEnemyTeamVec(myEnemies);
      const blended = {};
      tagKeys.forEach(t => {
        const ef = enemyFactor[t] || 0;
        const sw = rv.self_weight?.[t] || 0;
        const rawCorr = ef !== 0
          ? Math.sign(-ef) * COSINE_ENEMY_K * Math.pow(Math.abs(ef), COSINE_ENEMY_POW)
          : 0;
        // Reduce the enemy push when the hero already has self_weight for this tag
        const enemyCorr = rawCorr > 0 ? rawCorr / (1 + sw * COSINE_SW_DAMP) : rawCorr;
        blended[t] = Math.max(0,
          sw
          + COSINE_MATCH_MULT * (allyAvg[t] || 0)
          + enemyCorr
        );
      });
      _cosineGuide = blended;
      if (_bpDbg) {
        _bpDbg.guide      = blended;
        _bpDbg.selfWeight = rv.self_weight || {};
        _bpDbg.allyAvg    = allyAvg;
        _bpDbg.enemyFactor = enemyFactor;
        _bpDbg.guideMeta  = { myAllies, myEnemies };
      }
    } else {
      const enemyAvg = bpAvgRsvVec(myEnemies, 'enemy_weight');
      const guide = {};
      tagKeys.forEach(t => {
        const ea = enemyAvg[t] || 0;
        guide[t] = Math.max(0,
          (rv.self_weight?.[t] || 0)
          + (ea < 0 ? -ea * COSINE_CTR_BOOST : -ea * COSINE_MATCH_MULT)
        );
      });
      _cosineGuide = guide;
      if (_bpDbg) {
        _bpDbg.guide      = guide;
        _bpDbg.selfWeight = rv.self_weight || {};
        _bpDbg.enemyAvg   = enemyAvg;
        _bpDbg.guideMeta  = { myAllies, myEnemies };
      }
    }
    return _cosineGuide;
  }

  function cosineScoreFn(k, it, phaseName, owned, totalEarned) {
    const guide = getCosineGuide();
    const tier  = bpItemMap[k]?.tier ?? 800;

    // Target magnitude grows with souls earned so coverage never saturates — the build
    // keeps accumulating power rather than locking into one direction after a few items.
    // At lane start (~3200) soulScale≈3; by extra-late (~42200) soulScale≈27.
    const soulScale = 1 + totalEarned / 1600;

    // Inventory contribution in guide-space: sum(self_score[t] × guide[t]) for owned items.
    const invContrib = {};
    tagKeys.forEach(t => { invContrib[t] = 0; });
    owned.forEach(ok => {
      const oit = scoredMap[ok];
      if (!oit) return;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        invContrib[t] += (oit.values?.[t] || 0) * (guide[t] || 0);
      });
    });

    // Item contribution vector in the same space.
    let itemContrib = {};
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t)) return;
      itemContrib[t] = (it.values?.[t] || 0) * (guide[t] || 0);
    });

    // adaptive: scale item vector by assist/counter importance tags.
    if (algo === 'adaptive') {
      const assistImp  = Math.max(0, it.values?.assist_importance  || 0);
      const counterImp = Math.max(0, it.values?.counter_importance || 0);
      if (assistImp > 0 || counterImp > 0) {
        const scale  = 1 + COSINE_MATCH_MULT * (assistImp + counterImp);
        const scaled = {};
        tagKeys.forEach(t => { scaled[t] = (itemContrib[t] || 0) * scale; });
        itemContrib = scaled;
      }
    }

    // Diversity-weighted score.
    // coverage[t] = invContrib[t] / (guide[t] × soulScale)
    //   → 0 when tag is empty, 1 when we've matched the soul-scaled target.
    // deficitMult[t] = 1 / (1 + coverage) → 1.0 when empty, never reaches 0.
    // Items that fill undercovered tags score higher; but high-contrib items in
    // well-covered tags still score well because itemContrib[t] is large.
    // Signature/required items bypass deficit dampening — they're part of the
    // build identity and shouldn't be penalised for tag-overlap with other picks.
    const flaggedItem = isFlaggedItem(k);
    let baseScore = 0;
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t) || (guide[t] || 0) <= 0) return;
      if (flaggedItem) {
        baseScore += (itemContrib[t] || 0);
      } else {
        const coverage    = invContrib[t] / (guide[t] * soulScale);
        const deficitMult = 1 / (1 + coverage);
        baseScore += (itemContrib[t] || 0) * deficitMult;
      }
    });

    // Phase-aware tier preference (same table as greedy).
    baseScore *= getPhaseTierMult(phaseName, tier);

    // Cost-normalisation blend: early → efficient cheap items, late → raw power.
    const gamePhase = Math.min(1.0, totalEarned / 42200);
    const costNorm  = baseScore / Math.log2(Math.max(2, tier));
    const blended   = baseScore * gamePhase + costNorm * (1 - gamePhase);

    // Path value: best upgrade this item enables, discounted by time to afford.
    const income = bpSoulIncome(totalEarned);
    let pathValue = 0;
    (upgradesTo[k] || []).forEach(uk => {
      const upgrade = scoredMap[uk];
      if (!upgrade) return;
      const flaggedUpg = isFlaggedItem(uk);
      let upgradeScore = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || (guide[t] || 0) <= 0) return;
        if (flaggedUpg) {
          upgradeScore += (upgrade.values?.[t] || 0) * (guide[t] || 0);
        } else {
          const coverage    = invContrib[t] / (guide[t] * soulScale);
          const deficitMult = 1 / (1 + coverage);
          upgradeScore += (upgrade.values?.[t] || 0) * (guide[t] || 0) * deficitMult;
        }
      });
      const testOwned = new Set([...owned, k]);
      const upgCost   = Math.max(0, chainCost(uk, testOwned));
      const minutes   = income > 0 ? upgCost / income : 10;
      pathValue = Math.max(pathValue, upgradeScore * Math.exp(-0.1 * minutes));
    });
    const futureWeight = 1.0 - gamePhase * 0.6;
    return blended + pathValue * futureWeight;
  }

  // ── Main greedy for one phase ─────────────────────────────────────────────
  // phaseIdx: index into counterSlots (0=Lane … 4=Extra Late). Used for counter min/max.
  function greedyMain(ownedIn, budget, maxSlots, minSlots, phaseName, maxSells, scoreFn, sellThreshold = 2.0, phaseIdx = 0) {
    const owned       = new Set(ownedIn);
    let   remaining   = budget;
    const changes     = [];
    const soldInPhase = new Set();   // items sold this phase — never re-buy
    let   sellCount   = 0;

    const [counterMin, counterMax] = counterSlots[phaseIdx] || [0, 99];

    const _dbgPhase = _bpDbg ? { phaseName, steps: [], swaps: [] } : null;
    if (_bpDbg) _bpDbg.phases.push(_dbgPhase);

    for (let iter = 0; iter < 100; iter++) {
      const slots   = owned.size;
      const filling = slots < minSlots;
      const counterCount = countCounterItems(owned);
      const belowMin     = counterCount < counterMin;
      const atMax        = counterCount >= counterMax;

      // Required items: force-buy as soon as affordable. Required items HAVE to make
      // it in (or be consumed as a component). Cheapest unsatisfied first so the
      // constraint locks early; OK if an upgrade later consumes the component.
      const unsatReq = [...requiredSet]
        .filter(k => !owned.has(k) && !consumedComponents.has(k) && !blacklistSet.has(k) && !soldInPhase.has(k) && !isSubsumed(k, owned))
        .map(k => ({ k, cost: chainCost(k, owned) }))
        .filter(({ cost }) => cost > 0 && cost <= remaining && slots + 1 <= maxSlots)
        .sort((a, b) => a.cost - b.cost);
      if (unsatReq.length) {
        const forcedKey = unsatReq[0].k;
        const beforeLen = changes.length;
        remaining -= emitChain(forcedKey, owned, changes);
        if (changes.length > beforeLen) changes[changes.length - 1].forcedRequired = true;
        continue;
      }

      let bestKey = null, bestVal = -Infinity;
      let bestNonCounterKey = null, bestNonCounterVal = -Infinity;  // for soft-min force decision
      let bestCounterKey = null, bestCounterVal = -Infinity;
      const altCands = []; // top runners-up sorted by val
      const _dbgCands = _dbgPhase ? [] : null;

      for (const k of Object.keys(scoredMap)) {
        const it = scoredMap[k];
        if (blacklistSet.has(k)) continue;
        if (owned.has(k) || isSubsumed(k, owned) || soldInPhase.has(k) || consumedComponents.has(k)) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining || slots + 1 > maxSlots) continue;
        const isCtr = isCounterItem(it);
        if (atMax && isCtr) continue;   // hard cap on counters this phase
        let ps = scoreFn(k, it, phaseName, owned) * itemBoostMult(k);
        if (ps <= 0) continue;
        if (belowMin && isCtr) ps *= COUNTER_BOOST_LOW;  // in-loop counter push when below min
        // Fill mode: phase-score per soul spent (prefers cheap, phase-appropriate items)
        // Quality mode: absolute phase-score
        const val = filling ? (ps / cost) : ps;
        if (val > bestVal) { bestVal = val; bestKey = k; }
        if (isCtr) {
          if (val > bestCounterVal) { bestCounterVal = val; bestCounterKey = k; }
        } else if (val > bestNonCounterVal) {
          bestNonCounterVal = val; bestNonCounterKey = k;
        }
        altCands.push({ k, val });
        if (_dbgCands) _dbgCands.push({ key: k, ps, cost, val });
      }

      // Soft-min force: if below counter min and best pick is non-counter, prefer the best
      // counter only when its score is at least COUNTER_FORCE_FRAC × the non-counter alternative.
      if (belowMin && bestCounterKey && bestKey !== bestCounterKey) {
        const ref = bestNonCounterVal > 0 ? bestNonCounterVal : bestVal;
        if (bestCounterVal >= ref * COUNTER_FORCE_FRAC) {
          bestKey = bestCounterKey;
          bestVal = bestCounterVal;
        }
      }

      if (bestKey) {
        if (_dbgPhase) {
          _dbgCands.sort((a, b) => b.val - a.val);
          _dbgPhase.steps.push({ type: filling ? 'fill' : 'quality', chosen: bestKey, top5: _dbgCands.slice(0, 5) });
        }
        // Keep top 3 alts (excluding winner) that scored within 72% of best
        const threshold = bestVal * 0.72;
        const runnerUps = altCands
          .filter(x => x.k !== bestKey && x.val >= threshold)
          .sort((a, b) => b.val - a.val)
          .slice(0, 3)
          .map(x => x.k);
        const beforeLen = changes.length;
        remaining -= emitChain(bestKey, owned, changes);
        if (runnerUps.length && changes.length > beforeLen) changes[changes.length - 1].runnerUps = runnerUps;
        continue;
      }

      // No affordable buy — try sell-swap ONLY when slots are at the hard cap
      if (maxSells > 0 && sellCount < maxSells && owned.size >= maxSlots) {
        let worstKey = null, worstPS = Infinity;
        owned.forEach(k => {
          if (soldInPhase.has(k)) return;
          let ps = scoredMap[k] ? scoreFn(k, scoredMap[k], phaseName, owned) * itemBoostMult(k) : 0;
          // Required items get a stickiness multiplier — harder to displace.
          if (requiredSet.has(k)) ps *= REQ_STICKY_MULT;
          if (ps < worstPS) { worstPS = ps; worstKey = k; }
        });
        if (!worstKey) break;

        const refund     = Math.floor((bpItemMap[worstKey]?.tier ?? 0) / 2);
        const testOwned  = new Set(owned); testOwned.delete(worstKey);
        const testBudget = remaining + refund;
        const wouldDropCounter = isCounterItem(scoredMap[worstKey]);

        let swapKey = null, swapPS = -Infinity;
        for (const k of Object.keys(scoredMap)) {
          const it = scoredMap[k];
          if (blacklistSet.has(k)) continue;
          if (testOwned.has(k) || isSubsumed(k, testOwned) || soldInPhase.has(k)) continue;
          const cost = chainCost(k, testOwned);
          if (cost <= 0 || cost > testBudget || testOwned.size + 1 > maxSlots) continue;
          // Don't swap into a counter if we're already at max (counting after the prospective sell)
          const projectedCounters = countCounterItems(testOwned) + (isCounterItem(it) ? 1 : 0);
          if (projectedCounters > counterMax) continue;
          // Don't sell the only counter when below min unless replacing with another counter
          if (wouldDropCounter && !isCounterItem(it) && (counterCount - 1) < counterMin) continue;
          const ps = scoreFn(k, it, phaseName, testOwned) * itemBoostMult(k);
          if (ps > swapPS) { swapPS = ps; swapKey = k; }
        }

        // Require 2× phase-score improvement — selling costs 50% of item value, so bar is high
        if (swapKey && swapPS > worstPS * sellThreshold) {
          if (_dbgPhase) _dbgPhase.swaps.push({ sold: worstKey, soldPS: worstPS, bought: swapKey, boughtPS: swapPS, ratio: worstPS > 0 ? swapPS / worstPS : 99 });
          owned.delete(worstKey);
          soldInPhase.add(worstKey);
          remaining += refund;
          changes.push({ action: 'sell', key: worstKey, refund });
          sellCount++;
        } else { break; }
      } else { break; }
    }
    return { changes, owned, remaining };
  }

  // ── Side columns: Assist / Counter ────────────────────────────────────────
  // buildPathBlacklist = owned ∪ consumedComponents — items already in the main path.
  // globalUsed persists across ALL phases to prevent duplicates between phases.
  function greedyAssist(buildPathBlacklist, globalUsed, phaseName, scoreKey) {
    const importanceTag = scoreKey === 'ally' ? 'assist_importance' : 'counter_importance';
    const options = ASSIST_PHASE_OPTIONS[phaseName] || [{ tier: 1600, max: 1 }];

    function evalOption({ tier, max }) {
      const pool = Object.keys(scoredMap)
        .filter(k => {
          if (buildPathBlacklist.has(k) || globalUsed.has(k)) return false;
          if ((bpItemMap[k]?.tier ?? 0) !== tier) return false;
          return tv(scoredMap[k].values, importanceTag) > 0;
        })
        .map(k => {
          const it = scoredMap[k];
          const score = scoreKey === 'ally' ? it.ally * 0.75 : it.enemy * 0.75;
          return { key: k, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, max);
      return { pool, totalScore: pool.reduce((s, x) => s + x.score, 0) };
    }

    let bestPool = [], bestScore = -Infinity;
    for (const opt of options) {
      const { pool, totalScore } = evalOption(opt);
      if (totalScore > bestScore) { bestScore = totalScore; bestPool = pool; }
    }
    bestPool.forEach(x => globalUsed.add(x.key));
    return { changes: bestPool.map(x => ({ action: 'buy', key: x.key, cost: bpItemMap[x.key]?.tier ?? 0 })) };
  }

  // ── Shared helpers for Beam Search & Lookahead ────────────────────────────
  // Beam-local emit: same as emitChain but takes `consumed` explicitly instead of
  // mutating the outer consumedComponents — required for parallel beam simulation.
  function beamEmit(k, owned, consumed, changes) {
    const item = bpItemMap[k];
    if (!item) return 0;
    let spent = 0;
    (item.upgrades_from || []).forEach(c => {
      if (!owned.has(c) && bpItemMap[c]) {
        owned.add(c); spent += bpItemMap[c].tier;
        changes.push({ action: 'buy', key: c, components: [], cost: bpItemMap[c].tier });
      }
    });
    const comps    = (item.upgrades_from || []).filter(c => owned.has(c));
    const mainCost = item.tier - comps.reduce((s, c) => s + (bpItemMap[c]?.tier ?? 0), 0);
    comps.forEach(c => { owned.delete(c); consumed.add(c); });
    owned.add(k); spent += mainCost;
    changes.push({ action: comps.length ? 'upgrade' : 'buy', key: k, components: comps, cost: mainCost });
    return spent;
  }

  // Coverage-satisfaction holistic score: credit for filling guide-weighted tag targets
  // up to a soul-scaled magnitude ceiling; over-coverage earns nothing (forces build breadth).
  const _beamGuide = getCosineGuide();
  function beamHolisticScore(ownedSet, totalEarned) {
    const soulScale = 1 + totalEarned / 1600;
    const inv = {};
    tagKeys.forEach(t => { inv[t] = 0; });
    ownedSet.forEach(ok => {
      const oit = scoredMap[ok];
      if (!oit) return;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        inv[t] += (oit.values?.[t] || 0) * (_beamGuide[t] || 0);
      });
    });
    let score = 0;
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t) || (_beamGuide[t] || 0) <= 0) return;
      score += Math.min(inv[t], (_beamGuide[t] || 0) * soulScale);
    });
    return score;
  }

  // ── Algorithm: 1-Step Lookahead ───────────────────────────────────────────
  // Scores each candidate item by simulating: buy it, then greedily fill 2 more
  // items using bpScore, then evaluate holistically. Catches synergies that a
  // single-step greedy misses — e.g. buying a cheap component now unlocks a
  // dominant T3 next step. Deterministic, O(N²) per phase (same asymptotic as
  // greedy but with a more informed cost-per-step estimate).
  function lookaheadScoreFn(k, phaseName, owned, budget, te, maxSlots) {
    const simOwned    = new Set(owned);
    const simConsumed = new Set(consumedComponents);
    let   simBudget   = budget - chainCost(k, simOwned);
    if (simBudget < 0) return -Infinity;
    beamEmit(k, simOwned, simConsumed, []);
    for (let i = 0; i < 2; i++) {
      if (simOwned.size >= maxSlots) break;
      let bk = null, bv = -Infinity;
      for (const ck of Object.keys(scoredMap)) {
        if (simOwned.has(ck) || isSubsumed(ck, simOwned) || simConsumed.has(ck)) continue;
        const cc = chainCost(ck, simOwned);
        if (cc <= 0 || cc > simBudget) continue;
        // Lightweight guide-dot scorer — O(tags), not O(owned×tags) like cosineScoreFn.
        // Holistic evaluation at the end uses getCosineGuide(), so counter-awareness is preserved.
        const sit = scoredMap[ck];
        const sg  = getCosineGuide();
        let ps = 0;
        tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) ps += (sit.values?.[t] || 0) * (sg[t] || 0); });
        ps *= getPhaseTierMult(phaseName, bpItemMap[ck]?.tier ?? 800);
        if (ps > bv) { bv = ps; bk = ck; }
      }
      if (!bk) break;
      simBudget -= chainCost(bk, simOwned);
      beamEmit(bk, simOwned, simConsumed, []);
    }
    return beamHolisticScore(simOwned, te);
  }

  // ── Algorithm: Beam Search ─────────────────────────────────────────────────
  // Maintains K=3 candidate builds simultaneously. At each phase, expands each
  // beam with K scoring strategies (standard, tier-push, cost-efficient), producing
  // up to K² candidates; prunes back to K by holistic coverage score. Explores
  // item combinations that single-trajectory greedy cannot find because they appear
  // locally suboptimal but produce superior inventories across phases.
  // (Ref: Beam Search for Multi-Objective Combinatorial Opt., 2015; game AI literature)
  function runBeamSearch() {
    const K = 3;
    const beamScorers = [
      (_k, it, pn) => bpScore(it, pn),
      ( k, it, pn) => bpScore(it, pn) * ((bpItemMap[k]?.tier ?? 800) >= 3200 ? 1.35 : (bpItemMap[k]?.tier ?? 800) <= 800 ? 0.65 : 1.0),
      ( k, it, pn) => bpScore(it, pn) / Math.log2(Math.max(2, bpItemMap[k]?.tier ?? 800)),
    ];

    function beamPhase(ownedIn, consumedIn, budget, phase, scorerFn) {
      const owned = new Set(ownedIn), consumed = new Set(consumedIn);
      let remaining = budget;
      const changes = [], soldInPhase = new Set();
      let sellCount = 0;
      const bsPhaseIdx = BUILD_PHASES.indexOf(phase);
      const [, bsCounterMax] = counterSlots[bsPhaseIdx] || [0, 99];
      for (let iter = 0; iter < 100; iter++) {
        const slots = owned.size, filling = slots < phase.minSlots;
        const bsCtrCount = countCounterItems(owned);
        const bsAtMax    = bsCtrCount >= bsCounterMax;
        let bestKey = null, bestVal = -Infinity;
        const bsAltCands = [];
        for (const k of Object.keys(scoredMap)) {
          if (blacklistSet.has(k)) continue;
          if (owned.has(k) || isSubsumed(k, owned) || soldInPhase.has(k) || consumed.has(k)) continue;
          const cost = chainCost(k, owned);
          if (cost <= 0 || cost > remaining || slots + 1 > phase.totalSlots) continue;
          if (bsAtMax && isCounterItem(scoredMap[k])) continue;
          const ps = scorerFn(k, scoredMap[k], phase.name) * itemBoostMultStrong(k);
          if (ps <= 0) continue;
          const val = filling ? (ps / cost) : ps;
          if (val > bestVal) { bestVal = val; bestKey = k; }
          bsAltCands.push({ k, val });
        }
        if (bestKey) {
          const bsRunnerUps = bsAltCands.filter(x => x.k !== bestKey && x.val >= bestVal * 0.72).sort((a, b) => b.val - a.val).slice(0, 3).map(x => x.k);
          const bsBefore = changes.length;
          remaining -= beamEmit(bestKey, owned, consumed, changes);
          if (bsRunnerUps.length && changes.length > bsBefore) changes[changes.length - 1].runnerUps = bsRunnerUps;
          continue;
        }
        if (phase.maxSells > 0 && sellCount < phase.maxSells && owned.size >= phase.totalSlots) {
          let worstKey = null, worstPS = Infinity;
          owned.forEach(k => {
            if (soldInPhase.has(k)) return;
            let ps = scoredMap[k] ? scorerFn(k, scoredMap[k], phase.name) * itemBoostMultStrong(k) : 0;
            if (requiredSet.has(k)) ps *= REQ_STICKY_MULT;
            if (ps < worstPS) { worstPS = ps; worstKey = k; }
          });
          if (!worstKey) break;
          const refund = Math.floor((bpItemMap[worstKey]?.tier ?? 0) / 2);
          const testOwned = new Set(owned); testOwned.delete(worstKey);
          let swapKey = null, swapPS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (blacklistSet.has(k)) continue;
            if (testOwned.has(k) || isSubsumed(k, testOwned) || soldInPhase.has(k)) continue;
            const cost = chainCost(k, testOwned);
            if (cost <= 0 || cost > remaining + refund || testOwned.size + 1 > phase.totalSlots) continue;
            if (isCounterItem(scoredMap[k]) && (countCounterItems(testOwned) + 1 > bsCounterMax)) continue;
            const ps = scorerFn(k, scoredMap[k], phase.name) * itemBoostMultStrong(k);
            if (ps > swapPS) { swapPS = ps; swapKey = k; }
          }
          if (swapKey && swapPS > worstPS * 2.5) {
            owned.delete(worstKey); soldInPhase.add(worstKey);
            remaining += refund;
            changes.push({ action: 'sell', key: worstKey, refund });
            sellCount++;
          } else break;
        } else break;
      }
      return { owned, consumed, remaining, changes };
    }

    let beams = beamScorers.map(sc => ({ owned: new Set(), consumed: new Set(), budget: 0, phaseData: [], scorer: sc }));
    let bsTotal = 0;
    const bsAssist = new Set(), bsCounter = new Set();

    for (const phase of BUILD_PHASES) {
      bsTotal += phase.addBudget;
      beams.forEach(bm => { bm.budget += phase.addBudget; });

      const candidates = [];
      for (const bm of beams) {
        for (const sc of beamScorers) {
          const { owned, consumed, remaining, changes } = beamPhase(bm.owned, bm.consumed, bm.budget, phase, sc);
          candidates.push({ owned, consumed, budget: remaining, phaseData: [...bm.phaseData, changes], scorer: sc, _h: beamHolisticScore(owned, bsTotal) });
        }
      }
      const seen = new Set();
      const unique = candidates.filter(c => { const fp = [...c.owned].sort().join(','); if (seen.has(fp)) return false; seen.add(fp); return true; });
      unique.sort((a, b) => b._h - a._h);
      beams = unique.slice(0, K);
    }

    const best = beams[0];

    // Full blacklist from ALL beam phases before computing any assist/counter.
    const beamFullBPBlacklist = new Set();
    best.phaseData.forEach(changes => {
      changes.forEach(ch => {
        beamFullBPBlacklist.add(ch.key);
        (ch.components || []).forEach(c => beamFullBPBlacklist.add(c));
      });
    });

    return best.phaseData.map((changes, i) => {
      const phase = BUILD_PHASES[i];
      const { changes: ac } = greedyAssist(beamFullBPBlacklist, bsAssist,  phase.name, 'ally');
      const { changes: cc } = greedyAssist(beamFullBPBlacklist, bsCounter, phase.name, 'enemy');
      return { phase: phase.name, changes, assistChanges: ac, counterChanges: cc };
    });
  }

  // ── Algorithm: Hybrid Vector Rotation + Beam Search ─────────────────────
  // Replaces 'adaptive'. Guide vector: normalised self_weight rotated toward
  // allies' avg ally_weight by assistPct, then toward enemies' avg enemy_weight
  // by counterPct. Both percentages derive from the build's own
  // assist/counter_importance tag values.
  //
  // Simulation: tick-by-tick budget schedule. Items are scored by
  // dot(self_score, guideAtTick) × tierMult; unaffordable items are discounted
  // by ticks-until-affordable. A K=3 beam search explores buy/hold/swap paths
  // simultaneously, pruning each tick by holistic inventory score.
  // Sell-swap requires 1.8× score gain to offset the 50% refund loss penalty.

  // ── Expert Greedy ──────────────────────────────────────────────────────────
  // Tick-based pure greedy (no beam). Uses cosine-deficit diversity scoring so
  // already-covered tags score less, naturally promoting build breadth. Blends
  // a consensus enemy-counter bonus (20%) into a static guide. Upgrade path
  // value gives T1 components a forward-looking bonus for the chain they unlock.
  // Sell only when at slot cap with nothing to buy, 4.5× threshold.
  function runExpertGreedy() {
    // ── Guide ────────────────────────────────────────────────────────────────
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.self_weight?.[t] || 0); });
    const selfNorm = vecNormalizeBP(selfRaw, tagKeys);

    // Consensus enemy counter: tags where ≥50% of enemies share weakness, top 6
    const ctrRaw = {};
    const N = myEnemies.length;
    if (N > 0) {
      const avg = {}, sig = {};
      tagKeys.forEach(t => { avg[t] = 0; sig[t] = 0; });
      myEnemies.forEach(en => {
        const hero = MATCH.heroData[en]; if (!hero) return;
        const idx  = MATCH.selectedBuilds[en] ?? 0;
        const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return;
        const v    = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
        tagKeys.forEach(t => { const val = v[t]||0; avg[t]+=val; if(Math.abs(val)>=0.1) sig[t]++; });
      });
      tagKeys.forEach(t => { avg[t] /= N; });
      const entries = [];
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || sig[t]/N < 0.5) return;
        const val = Math.max(0, -(avg[t]));
        if (val > 0) entries.push([t, val]);
      });
      entries.sort((a, b) => b[1]-a[1]).slice(0, 6).forEach(([t, v]) => { ctrRaw[t] = v; });
    }
    const ctrNorm = vecNormalizeBP(ctrRaw, tagKeys);

    // Static guide: self + equal-weight enemy counter
    const guideRaw = {};
    tagKeys.forEach(t => { guideRaw[t] = (selfNorm[t]||0) + 1.00 * (ctrNorm[t]||0); });
    const guide = vecNormalizeBP(guideRaw, tagKeys);

    if (_bpDbg) {
      _bpDbg.guide      = guide;
      _bpDbg.selfWeight = rv.self_weight || {};
      _bpDbg.enemyAvg   = ctrNorm;
      _bpDbg.guideMeta  = { myEnemies };
    }

    // ── Tier multipliers (softer ceiling; T4 in mid is natural, not forced) ─
    const EG_TIER = { 800:1.0, 1600:1.55, 3200:2.1, 6400:2.8, 9999:3.8 };
    function egTierMult(k) { return EG_TIER[bpItemMap[k]?.tier||800] || 1.0; }

    // ── Budget / slot schedule ───────────────────────────────────────────────
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    // ── State ────────────────────────────────────────────────────────────────
    const owned = new Set(), sold = new Set(), consumed = new Set();
    let remaining = 0, totalEarned = 0;
    const changes = { Lane:[], Early:[], Mid:[], Late:[], 'Extra Late':[] };

    // ── Deficit scoring ──────────────────────────────────────────────────────
    // deficitMult[t] = 1/(1 + invContrib[t]/(guide[t]*soulScale))
    // Items that fill undercovered tags score higher; coverage grows with soulScale
    // so the guide's "appetite" expands with income, preventing premature saturation.
    // When `k` is signature/required the deficit term is bypassed — flagged items
    // get full credit even when their tags overlap existing inventory.
    function egDeficit(k, it, invContrib, soulScale) {
      const flagged = isFlaggedItem(k);
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || !(guide[t] > 0)) return;
        if (flagged) {
          s += (it.values?.[t]||0) * guide[t];
        } else {
          const cov = (invContrib[t]||0) / (guide[t] * soulScale);
          s += (it.values?.[t]||0) * guide[t] * (1 / (1 + cov));
        }
      });
      return Math.max(0, s);
    }
    function egScore(k, it, invContrib, soulScale) {
      return egDeficit(k, it, invContrib, soulScale) * egTierMult(k);
    }
    // Marginal for upgrades: net gain above the consumed component
    function egMarginal(k, it, invContrib, soulScale) {
      const base = egScore(k, it, invContrib, soulScale);
      const compS = (bpItemMap[k]?.upgrades_from||[])
        .filter(c => owned.has(c) && scoredMap[c])
        .reduce((s, c) => s + egScore(c, scoredMap[c], invContrib, soulScale), 0);
      return Math.max(0, base - compS);
    }

    // ── Tick loop ────────────────────────────────────────────────────────────
    for (let tick = 0; tick < NUM_TICKS; tick++) {
      remaining   += TICK_INCOME[tick];
      totalEarned += TICK_INCOME[tick];
      const maxSlots  = TICK_MAX_SLOTS[tick];
      const phaseName = TICK_PHASE[tick];
      const soulScale = 1 + totalEarned / 1600;
      // Path value weight: forward-looking early game, purely immediate in late
      const futureW = 0.5 * (1 - tick / NUM_TICKS);

      // Current inventory contribution in guide-space (recomputed each tick)
      const invContrib = {};
      tagKeys.forEach(t => { invContrib[t] = 0; });
      owned.forEach(k => {
        const it = scoredMap[k]; if (!it) return;
        tagKeys.forEach(t => {
          if (!SKIP_TAGS.has(t)) invContrib[t] += (it.values?.[t]||0) * (guide[t]||0);
        });
      });

      // Find best affordable item
      const egPhaseIdx     = PHASE_NAMES.indexOf(phaseName);
      const [, egCounterMax] = counterSlots[egPhaseIdx] || [0, 99];
      const egCtrCount     = countCounterItems(owned);
      const egAtMax        = egCtrCount >= egCounterMax;
      let bestKey = null, bestScore = -Infinity;
      const egAltCands = [];
      for (const k of Object.keys(scoredMap)) {
        if (blacklistSet.has(k)) continue;
        if (owned.has(k)||sold.has(k)||consumed.has(k)) continue;
        if (isSubsumed(k, owned)) continue;
        if ((bpItemMap[k]?.upgrades_from||[]).some(c => !owned.has(c) && sold.has(c))) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining) continue;
        const hasComp = (bpItemMap[k]?.upgrades_from||[]).some(c => owned.has(c));
        if (!hasComp && owned.size >= maxSlots) continue;
        const it = scoredMap[k];
        if (egAtMax && isCounterItem(it)) continue;
        let s = (hasComp ? egMarginal(k, it, invContrib, soulScale) : egScore(k, it, invContrib, soulScale)) * itemBoostMultStrong(k);
        // Path value: bonus for components that unlock a strong next-tier upgrade
        if (futureW > 0.01) {
          (upgradesTo[k]||[]).forEach(uk => {
            const upgIt = scoredMap[uk]; if (!upgIt) return;
            const upgS    = egDeficit(uk, upgIt, invContrib, soulScale) * egTierMult(uk);
            const upgCost = Math.max(0, (bpItemMap[uk]?.tier||0) - (bpItemMap[k]?.tier||0));
            const ticksAway = upgCost > 0 ? upgCost / 1500 : 0;
            s += futureW * upgS * Math.exp(-0.12 * ticksAway);
          });
        }
        if (s > bestScore) { bestScore = s; bestKey = k; }
        egAltCands.push({ k, val: s });
      }

      if (bestKey) {
        const egRunnerUps = egAltCands.filter(x => x.k !== bestKey && x.val >= bestScore * 0.72).sort((a, b) => b.val - a.val).slice(0, 3).map(x => x.k);
        const egBefore = changes[phaseName].length;
        remaining -= beamEmit(bestKey, owned, consumed, changes[phaseName]);
        if (egRunnerUps.length && changes[phaseName].length > egBefore) changes[phaseName][changes[phaseName].length - 1].runnerUps = egRunnerUps;
        continue;
      }

      // Sell-swap: slot cap, nothing to buy, 4.5× threshold
      if (owned.size >= maxSlots) {
        let worstKey = null, worstS = Infinity;
        owned.forEach(k => {
          if (!scoredMap[k]) return;
          let s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
          if (requiredSet.has(k)) s *= REQ_STICKY_MULT;
          if (s < worstS) { worstS = s; worstKey = k; }
        });
        if (worstKey) {
          const refund  = Math.floor((bpItemMap[worstKey]?.tier??0) / 2);
          const tmpOwnd = new Set(owned); tmpOwnd.delete(worstKey);
          const tmpSold = new Set([...sold, worstKey]);
          let swapKey = null, swapS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (blacklistSet.has(k)) continue;
            if (tmpOwnd.has(k)||tmpSold.has(k)||consumed.has(k)) continue;
            if (isSubsumed(k, tmpOwnd)) continue;
            if ((bpItemMap[k]?.upgrades_from||[]).some(c => !tmpOwnd.has(c) && tmpSold.has(c))) continue;
            const cost = chainCost(k, tmpOwnd);
            if (cost <= 0 || cost > remaining + refund) continue;
            if (isCounterItem(scoredMap[k]) && (countCounterItems(tmpOwnd) + 1 > egCounterMax)) continue;
            const s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
            if (s > swapS) { swapS = s; swapKey = k; }
          }
          if (swapKey && swapS > worstS * 4.5) {
            owned.delete(worstKey); sold.add(worstKey);
            remaining += refund;
            changes[phaseName].push({ action:'sell', key:worstKey, refund });
            remaining -= beamEmit(swapKey, owned, consumed, changes[phaseName]);
          }
        }
      }
    }

    // ── Assist / counter ─────────────────────────────────────────────────────
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => {
      changes[p].forEach(ch => {
        fullBPBlacklist.add(ch.key);
        (ch.components||[]).forEach(c => fullBPBlacklist.add(c));
      });
    });
    const globalAssistUsed = new Set(), globalCounterUsed = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, phaseName, 'enemy');
      return { phase:phaseName, changes:changes[phaseName], assistChanges, counterChanges };
    });
  }

  // ── Shared: build a counter vector from a specific list of target enemies ───
  // Returns { ctrNorm, targets } where targets = top-k enemies by matchup score.
  // matchup score = how well selfNorm exploits each enemy's weaknesses.
  function findTargetCounter(selfNorm, myEnemies, k, topTags) {
    const ranked = myEnemies.map(en => {
      const hero = MATCH.heroData[en]; if (!hero) return { name: en, score: 0 };
      const idx  = MATCH.selectedBuilds[en] ?? 0;
      const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return { name: en, score: 0 };
      const v    = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
      let score  = 0;
      tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) score += (selfNorm[t]||0) * Math.max(0, -(v[t]||0)); });
      return { name: en, score };
    }).sort((a, b) => b.score - a.score);
    const targets = ranked.slice(0, Math.min(k, ranked.length)).map(e => e.name);

    const avg = {};
    tagKeys.forEach(t => { avg[t] = 0; });
    targets.forEach(en => {
      const hero = MATCH.heroData[en]; if (!hero) return;
      const idx  = MATCH.selectedBuilds[en] ?? 0;
      const bld  = hero.builds[idx] || hero.builds[0]; if (!bld) return;
      const v    = _rsvCache[en]?.[bld.name]?.['enemy_weight'] || {};
      tagKeys.forEach(t => { avg[t] += (v[t]||0); });
    });
    const Nt = targets.length || 1;
    const entries = [];
    tagKeys.forEach(t => {
      if (SKIP_TAGS.has(t)) return;
      const val = Math.max(0, -(avg[t] / Nt));
      if (val > 0) entries.push([t, val]);
    });
    const ctrRaw = {};
    entries.sort((a, b) => b[1]-a[1]).slice(0, topTags).forEach(([t, v]) => { ctrRaw[t] = v; });
    return { ctrNorm: vecNormalizeBP(ctrRaw, tagKeys), targets };
  }

  // ── Play to Strengths ────────────────────────────────────────────────────────
  // Finds the 2 enemies this hero naturally counters best and focuses the build
  // on beating them. Guide = 65% self + 35% targeted enemy counter. Plays your
  // kit but sharpens it toward your best matchups. Same scoring as Expert Greedy.
  function runPlayToStrengths() {
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.self_weight?.[t] || 0); });
    const selfNorm = vecNormalizeBP(selfRaw, tagKeys);

    const { ctrNorm, targets } = findTargetCounter(selfNorm, myEnemies, 2, 8);

    const guideRaw = {};
    tagKeys.forEach(t => { guideRaw[t] = (selfNorm[t]||0) + 1.00 * (ctrNorm[t]||0); });
    const guide = vecNormalizeBP(guideRaw, tagKeys);

    if (_bpDbg) { _bpDbg.guide = guide; _bpDbg.selfWeight = rv.self_weight||{}; _bpDbg.enemyAvg = ctrNorm; _bpDbg.guideMeta = { targets, myEnemies }; }

    const EG_TIER = { 800:1.0, 1600:1.55, 3200:2.1, 6400:2.8, 9999:3.8 };
    function egTierMult(k) { return EG_TIER[bpItemMap[k]?.tier||800] || 1.0; }
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    const owned = new Set(), sold = new Set(), consumed = new Set();
    let remaining = 0, totalEarned = 0;
    const changes = { Lane:[], Early:[], Mid:[], Late:[], 'Extra Late':[] };

    function egDeficit(it, invContrib, soulScale) {
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || !(guide[t] > 0)) return;
        s += (it.values?.[t]||0) * guide[t] * (1 / (1 + (invContrib[t]||0) / (guide[t] * soulScale)));
      });
      return Math.max(0, s);
    }
    function egScore(k, it, ic, ss) { return egDeficit(it, ic, ss) * egTierMult(k); }
    function egMarginal(k, it, ic, ss) {
      return Math.max(0, egScore(k, it, ic, ss) - (bpItemMap[k]?.upgrades_from||[]).filter(c => owned.has(c) && scoredMap[c]).reduce((s, c) => s + egScore(c, scoredMap[c], ic, ss), 0));
    }

    for (let tick = 0; tick < NUM_TICKS; tick++) {
      remaining += TICK_INCOME[tick]; totalEarned += TICK_INCOME[tick];
      const maxSlots = TICK_MAX_SLOTS[tick], phaseName = TICK_PHASE[tick];
      const soulScale = 1 + totalEarned / 1600, futureW = 0.5 * (1 - tick / NUM_TICKS);
      const invContrib = {};
      tagKeys.forEach(t => { invContrib[t] = 0; });
      owned.forEach(k => { const it = scoredMap[k]; if (it) tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) invContrib[t] += (it.values?.[t]||0) * (guide[t]||0); }); });

      let bestKey = null, bestScore = -Infinity;
      const psAltCands = [];
      for (const k of Object.keys(scoredMap)) {
        if (owned.has(k)||sold.has(k)||consumed.has(k)) continue;
        if (isSubsumed(k, owned)) continue;
        if ((bpItemMap[k]?.upgrades_from||[]).some(c => !owned.has(c) && sold.has(c))) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining) continue;
        const hasComp = (bpItemMap[k]?.upgrades_from||[]).some(c => owned.has(c));
        if (!hasComp && owned.size >= maxSlots) continue;
        const it = scoredMap[k];
        let s = hasComp ? egMarginal(k, it, invContrib, soulScale) : egScore(k, it, invContrib, soulScale);
        if (futureW > 0.01) (upgradesTo[k]||[]).forEach(uk => {
          const upgIt = scoredMap[uk]; if (!upgIt) return;
          const upgS = egDeficit(upgIt, invContrib, soulScale) * egTierMult(uk);
          const ticksAway = Math.max(0, (bpItemMap[uk]?.tier||0) - (bpItemMap[k]?.tier||0)) / 1500;
          s += futureW * upgS * Math.exp(-0.12 * ticksAway);
        });
        if (s > bestScore) { bestScore = s; bestKey = k; }
        psAltCands.push({ k, val: s });
      }
      if (bestKey) {
        const psRunnerUps = psAltCands.filter(x => x.k !== bestKey && x.val >= bestScore * 0.72).sort((a, b) => b.val - a.val).slice(0, 3).map(x => x.k);
        const psBefore = changes[phaseName].length;
        remaining -= beamEmit(bestKey, owned, consumed, changes[phaseName]);
        if (psRunnerUps.length && changes[phaseName].length > psBefore) changes[phaseName][changes[phaseName].length - 1].runnerUps = psRunnerUps;
        continue;
      }

      if (owned.size >= maxSlots) {
        let worstKey = null, worstS = Infinity;
        owned.forEach(k => { if (!scoredMap[k]) return; const s = egScore(k, scoredMap[k], invContrib, soulScale); if (s < worstS) { worstS = s; worstKey = k; } });
        if (worstKey) {
          const refund = Math.floor((bpItemMap[worstKey]?.tier??0) / 2);
          const tmpOwnd = new Set(owned); tmpOwnd.delete(worstKey);
          const tmpSold = new Set([...sold, worstKey]);
          let swapKey = null, swapS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (tmpOwnd.has(k)||tmpSold.has(k)||consumed.has(k)) continue;
            if (isSubsumed(k, tmpOwnd)) continue;
            if ((bpItemMap[k]?.upgrades_from||[]).some(c => !tmpOwnd.has(c) && tmpSold.has(c))) continue;
            const cost = chainCost(k, tmpOwnd);
            if (cost <= 0 || cost > remaining + refund) continue;
            const s = egScore(k, scoredMap[k], invContrib, soulScale);
            if (s > swapS) { swapS = s; swapKey = k; }
          }
          if (swapKey && swapS > worstS * 4.5) {
            owned.delete(worstKey); sold.add(worstKey); remaining += refund;
            changes[phaseName].push({ action:'sell', key:worstKey, refund });
            remaining -= beamEmit(swapKey, owned, consumed, changes[phaseName]);
          }
        }
      }
    }
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => { changes[p].forEach(ch => { fullBPBlacklist.add(ch.key); (ch.components||[]).forEach(c => fullBPBlacklist.add(c)); }); });
    const globalAssistUsed2 = new Set(), globalCounterUsed2 = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed2,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed2, phaseName, 'enemy');
      return { phase:phaseName, changes:changes[phaseName], assistChanges, counterChanges };
    });
  }

  // ── Target Assassin ──────────────────────────────────────────────────────────
  // Same target selection as Play to Strengths but guide flips to 60% enemy-counter.
  // You're building to KILL those two specific targets. More aggressive tier mults
  // reward high-damage T3/T4 items. Slightly lower sell threshold (4.0×) so the
  // build can pivot faster to better kill options.
  function runTargetAssassin() {
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.self_weight?.[t] || 0); });
    const selfNorm = vecNormalizeBP(selfRaw, tagKeys);

    const { ctrNorm, targets } = findTargetCounter(selfNorm, myEnemies, 2, 8);

    // Guide heavily weighted toward enemy weaknesses — you're building to kill them
    const guideRaw = {};
    tagKeys.forEach(t => { guideRaw[t] = 0.40 * (selfNorm[t]||0) + 0.60 * (ctrNorm[t]||0); });
    const guide = vecNormalizeBP(guideRaw, tagKeys);

    if (_bpDbg) { _bpDbg.guide = guide; _bpDbg.selfWeight = rv.self_weight||{}; _bpDbg.enemyAvg = ctrNorm; _bpDbg.guideMeta = { targets, myEnemies }; }

    // Steeper tier mults: reward investing in high-damage T3/T4 items
    const EG_TIER = { 800:1.0, 1600:1.65, 3200:2.3, 6400:3.2, 9999:4.5 };
    function egTierMult(k) { return EG_TIER[bpItemMap[k]?.tier||800] || 1.0; }
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    const owned = new Set(), sold = new Set(), consumed = new Set();
    let remaining = 0, totalEarned = 0;
    const changes = { Lane:[], Early:[], Mid:[], Late:[], 'Extra Late':[] };

    function egDeficit(k, it, invContrib, soulScale) {
      const flagged = isFlaggedItem(k);
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t) || !(guide[t] > 0)) return;
        if (flagged) {
          s += (it.values?.[t]||0) * guide[t];
        } else {
          s += (it.values?.[t]||0) * guide[t] * (1 / (1 + (invContrib[t]||0) / (guide[t] * soulScale)));
        }
      });
      return Math.max(0, s);
    }
    function egScore(k, it, ic, ss) { return egDeficit(k, it, ic, ss) * egTierMult(k); }
    function egMarginal(k, it, ic, ss) {
      return Math.max(0, egScore(k, it, ic, ss) - (bpItemMap[k]?.upgrades_from||[]).filter(c => owned.has(c) && scoredMap[c]).reduce((s, c) => s + egScore(c, scoredMap[c], ic, ss), 0));
    }

    for (let tick = 0; tick < NUM_TICKS; tick++) {
      remaining += TICK_INCOME[tick]; totalEarned += TICK_INCOME[tick];
      const maxSlots = TICK_MAX_SLOTS[tick], phaseName = TICK_PHASE[tick];
      // Higher futureW starting point: prioritize chains that lead to kill-focused T4s
      const soulScale = 1 + totalEarned / 1600, futureW = 0.6 * (1 - tick / NUM_TICKS);
      const invContrib = {};
      tagKeys.forEach(t => { invContrib[t] = 0; });
      owned.forEach(k => { const it = scoredMap[k]; if (it) tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) invContrib[t] += (it.values?.[t]||0) * (guide[t]||0); }); });

      const taPhaseIdx = PHASE_NAMES.indexOf(phaseName);
      const [, taCounterMax] = counterSlots[taPhaseIdx] || [0, 99];
      const taAtMax = countCounterItems(owned) >= taCounterMax;
      let bestKey = null, bestScore = -Infinity;
      for (const k of Object.keys(scoredMap)) {
        if (blacklistSet.has(k)) continue;
        if (owned.has(k)||sold.has(k)||consumed.has(k)) continue;
        if (isSubsumed(k, owned)) continue;
        if ((bpItemMap[k]?.upgrades_from||[]).some(c => !owned.has(c) && sold.has(c))) continue;
        const cost = chainCost(k, owned);
        if (cost <= 0 || cost > remaining) continue;
        const hasComp = (bpItemMap[k]?.upgrades_from||[]).some(c => owned.has(c));
        if (!hasComp && owned.size >= maxSlots) continue;
        const it = scoredMap[k];
        if (taAtMax && isCounterItem(it)) continue;
        let s = (hasComp ? egMarginal(k, it, invContrib, soulScale) : egScore(k, it, invContrib, soulScale)) * itemBoostMultStrong(k);
        if (futureW > 0.01) (upgradesTo[k]||[]).forEach(uk => {
          const upgIt = scoredMap[uk]; if (!upgIt) return;
          const upgS = egDeficit(uk, upgIt, invContrib, soulScale) * egTierMult(uk);
          const ticksAway = Math.max(0, (bpItemMap[uk]?.tier||0) - (bpItemMap[k]?.tier||0)) / 1500;
          s += futureW * upgS * Math.exp(-0.12 * ticksAway);
        });
        if (s > bestScore) { bestScore = s; bestKey = k; }
      }
      if (bestKey) { remaining -= beamEmit(bestKey, owned, consumed, changes[phaseName]); continue; }

      // Sell threshold 4.0× — more willing to swap for a better kill item
      if (owned.size >= maxSlots) {
        let worstKey = null, worstS = Infinity;
        owned.forEach(k => {
          if (!scoredMap[k]) return;
          let s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
          if (requiredSet.has(k)) s *= REQ_STICKY_MULT;
          if (s < worstS) { worstS = s; worstKey = k; }
        });
        if (worstKey) {
          const refund = Math.floor((bpItemMap[worstKey]?.tier??0) / 2);
          const tmpOwnd = new Set(owned); tmpOwnd.delete(worstKey);
          const tmpSold = new Set([...sold, worstKey]);
          let swapKey = null, swapS = -Infinity;
          for (const k of Object.keys(scoredMap)) {
            if (blacklistSet.has(k)) continue;
            if (tmpOwnd.has(k)||tmpSold.has(k)||consumed.has(k)) continue;
            if (isSubsumed(k, tmpOwnd)) continue;
            if ((bpItemMap[k]?.upgrades_from||[]).some(c => !tmpOwnd.has(c) && tmpSold.has(c))) continue;
            const cost = chainCost(k, tmpOwnd);
            if (cost <= 0 || cost > remaining + refund) continue;
            if (isCounterItem(scoredMap[k]) && (countCounterItems(tmpOwnd) + 1 > taCounterMax)) continue;
            const s = egScore(k, scoredMap[k], invContrib, soulScale) * itemBoostMultStrong(k);
            if (s > swapS) { swapS = s; swapKey = k; }
          }
          if (swapKey && swapS > worstS * 4.0) {
            owned.delete(worstKey); sold.add(worstKey); remaining += refund;
            changes[phaseName].push({ action:'sell', key:worstKey, refund });
            remaining -= beamEmit(swapKey, owned, consumed, changes[phaseName]);
          }
        }
      }
    }
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => { changes[p].forEach(ch => { fullBPBlacklist.add(ch.key); (ch.components||[]).forEach(c => fullBPBlacklist.add(c)); }); });
    const globalAssistUsed3 = new Set(), globalCounterUsed3 = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed3,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed3, phaseName, 'enemy');
      return { phase:phaseName, changes:changes[phaseName], assistChanges, counterChanges };
    });
  }

  function runHybridRotation(variant = 'adaptive') {
    // ─── Guide vector ───────────────────────────────────────────────────────
    const heroName  = b.heroName || '';
    const onAlly    = MATCH.allies.includes(heroName);
    const myAllies  = onAlly ? MATCH.allies.filter(n => n !== heroName) : MATCH.enemies.filter(n => n !== heroName);
    const myEnemies = onAlly ? MATCH.enemies : MATCH.allies;

    const assistImp  = Math.max(0, rv.self_weight?.assist_importance  || 0);
    const counterImp = Math.max(0, rv.self_weight?.counter_importance || 0);

    const ROT_CAP    = variant === 'adaptive' ? 0.6 : 0.5;
    const HR_CTR_MIN = 1.0;
    const HR_CTR_CAP = 1.5;
    const assistPct  = Math.min(ROT_CAP, Math.max(0, (assistImp  + 2) / 4));
    const counterPct = Math.min(HR_CTR_CAP, Math.max(HR_CTR_MIN, (counterImp + 2) / 4));

    // Build normalised self-weight (non-negative, skip special tags)
    const selfRaw = {};
    tagKeys.forEach(t => { if (!SKIP_TAGS.has(t)) selfRaw[t] = Math.max(0, rv.self_weight?.[t] || 0); });
    const buildNorm = vecNormalizeBP(selfRaw, tagKeys);

    // Consensus-pruned rotation target for a hero group.
    // Only keeps tags where >= 50% of heroes have |value| >= threshold; then top topN
    // by average magnitude. This prevents a single hero's outlier tags from
    // pulling the guide off course for the whole team.
    // negate=true flips the sign (used for enemy_weight, where negative = weak to it).
    const CONSENSUS_THRESHOLD = 0.1;
    const CONSENSUS_MIN_FRAC  = 0.5;
    function buildRotationTarget(heroNames, weightKey, topN, negate) {
      const N = heroNames.length;
      if (!N) return {};
      const vectors = heroNames.map(n => {
        const hero = MATCH.heroData[n];
        if (!hero) return null;
        const idx   = MATCH.selectedBuilds[n] ?? 0;
        const build = hero.builds[idx] || hero.builds[0];
        return build ? (_rsvCache[n]?.[build.name]?.[weightKey] || null) : null;
      }).filter(Boolean);
      if (!vectors.length) return {};

      const avg = {}, sigCount = {};
      tagKeys.forEach(t => { avg[t] = 0; sigCount[t] = 0; });
      vectors.forEach(v => {
        tagKeys.forEach(t => {
          const val = v[t] || 0;
          avg[t] += val;
          if (Math.abs(val) >= CONSENSUS_THRESHOLD) sigCount[t]++;
        });
      });
      tagKeys.forEach(t => { avg[t] /= vectors.length; });

      // Apply consensus filter and direction (negate = counter, non-negate = synergy)
      const consensus = {};
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        if (sigCount[t] / N < CONSENSUS_MIN_FRAC) return;
        const val = negate ? Math.max(0, -(avg[t])) : Math.max(0, avg[t]);
        if (val > 0) consensus[t] = val;
      });

      // Keep top N by magnitude, then normalise to unit vector
      const pruned = {};
      Object.entries(consensus)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .forEach(([t, v]) => { pruned[t] = v; });
      return vecNormalizeBP(pruned, tagKeys);
    }

    const allyNorm  = buildRotationTarget(myAllies,  'ally_weight',  6, false);
    const enemyNorm = buildRotationTarget(myEnemies, 'enemy_weight', 6, true);

    // Single combined rotation: buildNorm anchors at weight 1.0, ally and enemy
    // contribute additively at their respective percentages. No compounding.
    // guide = normalize(buildNorm + assistPct × allyNorm + counterPct × enemyNorm)
    const combined = {};
    tagKeys.forEach(t => {
      combined[t] = (buildNorm[t] || 0)
        + assistPct  * (allyNorm[t]  || 0)
        + counterPct * (enemyNorm[t] || 0);
    });
    const finalGuide = vecNormalizeBP(combined, tagKeys);

    if (_bpDbg) {
      _bpDbg.guide      = finalGuide;
      _bpDbg.selfWeight = rv.self_weight || {};
      _bpDbg.allyAvg    = allyNorm;   // pruned consensus ally vector
      _bpDbg.enemyAvg   = enemyNorm;  // pruned negated enemy counter vector
      _bpDbg.guideMeta  = { assistImp, counterImp, assistPct, counterPct, myAllies, myEnemies };
    }

    // ─── Budget / slot schedule ─────────────────────────────────────────────
    // Late ends at 3500; Extra Late continues at +100/tick increments, all 12 slots
    const TICK_INCOME    = [800,800,800,900,900,1100,1200,1200,1200,1300,1400,1400,1400,1500,1500,1600,1700,1800,1800,1900,2000,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300];
    const TICK_MAX_SLOTS = [1,2,3,4,5,6,8,9,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12];
    const TICK_PHASE     = ['Lane','Lane','Lane','Lane','Lane','Lane','Early','Early','Early','Early','Early','Early','Mid','Mid','Mid','Mid','Mid','Mid','Late','Late','Late','Late','Late','Late','Late','Late','Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late','Extra Late'];
    const NUM_TICKS      = TICK_INCOME.length;
    const PHASE_NAMES    = ['Lane','Early','Mid','Late','Extra Late'];

    // ─── Scoring helpers ────────────────────────────────────────────────────
    const HR_TIER = { 800: 1.0, 1600: 1.8, 3200: 2.5, 6400: 3.5, 9999: 5.0 };
    function hrTierMult(k) { return HR_TIER[bpItemMap[k]?.tier || 800] || 1.0; }

    // Cyclic Focus schedule: teamWeight = how much ally/enemy rotation applies this tick.
    // Lane 50/50 → Early selfish first half → Early 50/50 second half →
    // Mid full-team first third → Mid selfish middle → Mid 50/50 last third →
    // Late 50/50 → Extra Late 75% team.
    function cyclicTeamWeight(tick) {
      if (tick <  6) return 0.50;  // Lane: 50/50
      if (tick <  9) return 0.00;  // Early first half: selfish
      if (tick < 12) return 0.50;  // Early second half: 50/50
      if (tick < 14) return 1.00;  // Mid first third: full team
      if (tick < 16) return 0.00;  // Mid middle: selfish
      if (tick < 18) return 0.50;  // Mid last third: 50/50
      if (tick < 27) return 0.50;  // Late: 50/50
      return 0.75;                  // Extra Late: mostly team
    }

    // Guide at tick T: finalGuide scaled to magnitude (T + 1).
    // Fusion: sqrt-ramp from self → team. Cyclic: phase-schedule teamWeight blend.
    function guideAt(tick) {
      if (variant === 'fusion') {
        const pf = tick / (NUM_TICKS - 1);
        const pa = assistPct  * Math.sqrt(pf);
        const pc = counterPct * Math.sqrt(pf);
        const c = {};
        tagKeys.forEach(t => {
          c[t] = (buildNorm[t] || 0) + pa * (allyNorm[t] || 0) + pc * (enemyNorm[t] || 0);
        });
        const dir = vecNormalizeBP(c, tagKeys);
        const g = {};
        tagKeys.forEach(t => { g[t] = (dir[t] || 0) * (tick + 1); });
        return g;
      }
      if (variant === 'cyclic') {
        const tw = cyclicTeamWeight(tick);
        const c = {};
        tagKeys.forEach(t => {
          c[t] = (buildNorm[t] || 0) + tw * (assistPct * (allyNorm[t] || 0) + counterPct * (enemyNorm[t] || 0));
        });
        const dir = vecNormalizeBP(c, tagKeys);
        const g = {};
        tagKeys.forEach(t => { g[t] = (dir[t] || 0) * (tick + 1); });
        return g;
      }
      const s = tick + 1, g = {};
      tagKeys.forEach(t => { g[t] = (finalGuide[t] || 0) * s; });
      return g;
    }

    // Raw power score — no coverage cap, over-coverage is rewarded
    function hrScore(k, it, g) {
      let s = 0;
      tagKeys.forEach(t => {
        if (SKIP_TAGS.has(t)) return;
        s += (it.values?.[t] || 0) * (g[t] || 0);
      });
      return Math.max(0, s * hrTierMult(k));
    }

    // Marginal score for upgrades: net gain above the component being replaced
    function hrMarginal(k, it, g, owned) {
      const base = hrScore(k, it, g);
      const compSum = (bpItemMap[k]?.upgrades_from || [])
        .filter(c => owned.has(c) && scoredMap[c])
        .reduce((acc, c) => acc + hrScore(c, scoredMap[c], g), 0);
      return Math.max(0, base - compSum);
    }

    // Ticks until item k is affordable from current budget
    function hrTicksAway(k, owned, remaining, fromTick) {
      const cost = chainCost(k, owned);
      if (cost <= remaining) return 0;
      let deficit = cost - remaining;
      for (let t = fromTick + 1; t < NUM_TICKS; t++) {
        deficit -= TICK_INCOME[t];
        if (deficit <= 0) return t - fromTick;
      }
      return NUM_TICKS;
    }

    // Holistic score: sum of hrScore across all owned items (beam pruning)
    function hrHolistic(owned, tick) {
      const g = guideAt(tick);
      let s = 0;
      owned.forEach(k => { const it = scoredMap[k]; if (it) s += hrScore(k, it, g); });
      return s;
    }

    // ─── Rollout helpers (Oracle / Rollout Greedy) ───────────────────────────
    // Simulates remaining ticks greedily from startBm; returns end-state holistic score.
    function greedyRollout(startBm, fromTick, maxTick = NUM_TICKS) {
      const rb = cloneBeam(startBm);
      const endTick = Math.min(maxTick, NUM_TICKS);
      for (let t = fromTick; t < endTick; t++) {
        rb.remaining += TICK_INCOME[t];
        const maxS = TICK_MAX_SLOTS[t];
        const g = guideAt(t);
        let bestKey = null, bestScore = -Infinity;
        for (const k of Object.keys(scoredMap)) {
          if (rb.owned.has(k) || rb.sold.has(k) || rb.consumed.has(k)) continue;
          if (isSubsumed(k, rb.owned)) continue;
          if ((bpItemMap[k]?.upgrades_from || []).some(c => !rb.owned.has(c) && rb.sold.has(c))) continue;
          const cost = chainCost(k, rb.owned);
          if (cost <= 0 || cost > rb.remaining) continue;
          const hasComp = (bpItemMap[k]?.upgrades_from || []).some(c => rb.owned.has(c));
          if (!hasComp && rb.owned.size >= maxS) continue;
          const it = scoredMap[k];
          const s = hasComp ? hrMarginal(k, it, g, rb.owned) : hrScore(k, it, g);
          if (s > bestScore) { bestScore = s; bestKey = k; }
        }
        if (bestKey) rb.remaining -= beamEmit(bestKey, rb.owned, rb.consumed, []);
      }
      return hrHolistic(rb.owned, Math.max(0, endTick - 1));
    }

    // Scoring function used to prune/select candidates each tick.
    // Oracle: holistic + 5-tick greedy rollout for lookahead. Default: immediate holistic.
    function candidateScore(bm, tick) {
      if (variant === 'oracle') return hrHolistic(bm.owned, tick) + 0.4 * greedyRollout(bm, tick + 1, tick + 6);
      return hrHolistic(bm.owned, tick);
    }

    // ─── Beam search tick simulation ────────────────────────────────────────
    const BEAM_K         = variant === 'oracle' ? 6 : variant === 'fusion' ? 4 : 3;
    const SELL_THRESHOLD = variant === 'fusion' ? 6.0 : 5.0;
    const EXPAND_K       = BEAM_K;

    function makeBeam() {
      return { owned: new Set(), sold: new Set(), consumed: new Set(), remaining: 0, changes: { Lane: [], Early: [], Mid: [], Late: [], 'Extra Late': [] } };
    }
    function cloneBeam(bm) {
      const changes = {};
      PHASE_NAMES.forEach(p => { changes[p] = [...bm.changes[p]]; });
      return { owned: new Set(bm.owned), sold: new Set(bm.sold), consumed: new Set(bm.consumed), remaining: bm.remaining, changes };
    }

    let beams = Array.from({ length: BEAM_K }, makeBeam);

    for (let tick = 0; tick < NUM_TICKS; tick++) {
      const income    = TICK_INCOME[tick];
      const maxSlots  = TICK_MAX_SLOTS[Math.min(tick, TICK_MAX_SLOTS.length - 1)];
      const phaseName = TICK_PHASE[tick];
      const g         = guideAt(tick);
      const hrPhaseIdx = PHASE_NAMES.indexOf(phaseName);
      const [, hrCounterMax] = counterSlots[hrPhaseIdx] || [0, 99];

      beams.forEach(bm => { bm.remaining += income; });

      const candidates = [];

      for (const bm of beams) {
        // Option: hold (no purchase this tick)
        candidates.push({ bm, _h: candidateScore(bm, tick) });

        const bmAtCtrMax = countCounterItems(bm.owned) >= hrCounterMax;

        // Score all items (affordable = raw score; unaffordable = score / ticksAway)
        const ranked = [];
        for (const k of Object.keys(scoredMap)) {
          if (blacklistSet.has(k)) continue;
          if (bm.owned.has(k) || bm.sold.has(k) || bm.consumed.has(k)) continue;
          if (isSubsumed(k, bm.owned)) continue;
          // Never buy an item whose unowned component was previously sold
          if ((bpItemMap[k]?.upgrades_from || []).some(c => !bm.owned.has(c) && bm.sold.has(c))) continue;
          const cost = chainCost(k, bm.owned);
          if (cost <= 0) continue;
          const it = scoredMap[k];
          if (bmAtCtrMax && isCounterItem(it)) continue;
          const hasComp = (bpItemMap[k]?.upgrades_from || []).some(c => bm.owned.has(c));
          const base = (hasComp ? hrMarginal(k, it, g, bm.owned) : hrScore(k, it, g)) * itemBoostMultStrong(k);
          if (base <= 0) continue;
          const tAway = hrTicksAway(k, bm.owned, bm.remaining, tick);
          ranked.push({ k, adj: tAway > 0 ? base / tAway : base, tAway });
        }
        ranked.sort((a, b) => b.adj - a.adj);

        // Expand top BEAM_K affordable buys.
        // Upgrades that consume an owned component don't add a slot, so allow them
        // even at the cap. A straight buy requires a free slot.
        let expanded = 0;
        for (const { k, tAway } of ranked) {
          if (tAway > 0) continue;
          const hasOwnedComp = (bpItemMap[k]?.upgrades_from || []).some(c => bm.owned.has(c));
          if (!hasOwnedComp && bm.owned.size >= maxSlots) continue;
          const nb = cloneBeam(bm);
          nb.remaining -= beamEmit(k, nb.owned, nb.consumed, nb.changes[phaseName]);
          candidates.push({ bm: nb, _h: candidateScore(nb, tick) });
          if (++expanded >= EXPAND_K) break;
        }

        // Sell-swap: only at slot cap; new item must score ≥ 1.8× sold item
        if (bm.owned.size >= maxSlots) {
          let worstKey = null, worstS = Infinity;
          bm.owned.forEach(k => {
            if (!scoredMap[k]) return;
            let s = hrScore(k, scoredMap[k], g) * itemBoostMultStrong(k);
            if (requiredSet.has(k)) s *= REQ_STICKY_MULT;
            if (s < worstS) { worstS = s; worstKey = k; }
          });
          if (worstKey) {
            const refund = Math.floor((bpItemMap[worstKey]?.tier ?? 0) / 2);
            const nb = cloneBeam(bm);
            nb.owned.delete(worstKey); nb.sold.add(worstKey);
            nb.remaining += refund;
            nb.changes[phaseName].push({ action: 'sell', key: worstKey, refund });
            let swapKey = null, swapS = -Infinity;
            for (const k of Object.keys(scoredMap)) {
              if (blacklistSet.has(k)) continue;
              if (nb.owned.has(k) || nb.sold.has(k) || nb.consumed.has(k)) continue;
              if (isSubsumed(k, nb.owned)) continue;
              if ((bpItemMap[k]?.upgrades_from || []).some(c => !nb.owned.has(c) && nb.sold.has(c))) continue;
              const cost = chainCost(k, nb.owned);
              if (cost <= 0 || cost > nb.remaining) continue;
              if (isCounterItem(scoredMap[k]) && (countCounterItems(nb.owned) + 1 > hrCounterMax)) continue;
              const s = hrScore(k, scoredMap[k], g) * itemBoostMultStrong(k);
              if (s > swapS) { swapS = s; swapKey = k; }
            }
            if (swapKey && swapS > worstS * SELL_THRESHOLD) {
              nb.remaining -= beamEmit(swapKey, nb.owned, nb.consumed, nb.changes[phaseName]);
              candidates.push({ bm: nb, _h: candidateScore(nb, tick) });
            }
          }
        }
      }

      // Prune to BEAM_K unique beams by holistic score
      candidates.sort((a, b) => b._h - a._h);
      const seen = new Set();
      beams = [];
      for (const c of candidates) {
        const fp = [...c.bm.owned].sort().join(',');
        if (!seen.has(fp)) { seen.add(fp); beams.push(c.bm); }
        if (beams.length >= BEAM_K) break;
      }
      while (beams.length < BEAM_K) beams.push(cloneBeam(beams[0]));
    }

    const best = beams[0];

    // ─── Assist / counter side lanes ────────────────────────────────────────
    const fullBPBlacklist = new Set();
    PHASE_NAMES.forEach(p => {
      best.changes[p].forEach(ch => {
        fullBPBlacklist.add(ch.key);
        (ch.components || []).forEach(c => fullBPBlacklist.add(c));
      });
    });
    const globalAssistUsed  = new Set();
    const globalCounterUsed = new Set();
    return PHASE_NAMES.map(phaseName => {
      const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  phaseName, 'ally');
      const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, phaseName, 'enemy');
      return { phase: phaseName, changes: best.changes[phaseName], assistChanges, counterChanges };
    });
  }

  // ── Phase loop ─────────────────────────────────────────────────────────────
  if (algo === 'expert')    return runExpertGreedy();
  if (algo === 'assassin')  return runTargetAssassin();
  if (algo === 'adaptive') return runHybridRotation('adaptive');
  if (algo === 'fusion')   return runHybridRotation('fusion');
  if (algo === 'oracle')   return runHybridRotation('oracle');
  if (algo === 'beam')     return runBeamSearch();

  const useCosine = algo === 'cosine';

  // Pass 1: run all main-path phases to get the complete purchase list.
  let owned = new Set();
  let remainingBudget = 0;
  let totalEarned     = 0;
  const mainPhaseData = [];

  for (let phaseIdx = 0; phaseIdx < BUILD_PHASES.length; phaseIdx++) {
    const phase = BUILD_PHASES[phaseIdx];
    remainingBudget += phase.addBudget;
    totalEarned     += phase.addBudget;
    const te = totalEarned;

    const phaseScorerFn =
      useCosine           ? (k, it, pn, ow) => cosineScoreFn(k, it, pn, ow, te) :
      algo === 'marginal' ? marginalScoreFn :
      algo === 'lookahead'? (k, _it, pn, ow) => lookaheadScoreFn(k, pn, ow, remainingBudget, te, phase.totalSlots) :
                            (_k, it, pn)    => bpScore(it, pn);

    const { changes, owned: newOwned, remaining: newBudget } =
      greedyMain(owned, remainingBudget, phase.totalSlots, phase.minSlots, phase.name, phase.maxSells, phaseScorerFn, useCosine ? 3.5 : 2.0, phaseIdx);
    owned           = newOwned;
    remainingBudget = newBudget;
    mainPhaseData.push({ phase, changes });
  }

  // Full blacklist from ALL phases (past and future) so assist/counter never
  // recommends an item the main path already plans to buy at any point.
  const fullBPBlacklist = new Set();
  mainPhaseData.forEach(({ changes }) => {
    changes.forEach(ch => {
      fullBPBlacklist.add(ch.key);
      (ch.components || []).forEach(c => fullBPBlacklist.add(c));
    });
  });

  // Pass 2: compute assist/counter per phase using the full blacklist.
  const globalAssistUsed  = new Set();
  const globalCounterUsed = new Set();
  return mainPhaseData.map(({ phase, changes }) => {
    const { changes: assistChanges  } = greedyAssist(fullBPBlacklist, globalAssistUsed,  phase.name, 'ally');
    const { changes: counterChanges } = greedyAssist(fullBPBlacklist, globalCounterUsed, phase.name, 'enemy');
    if (_bpDbg) {
      const ph = (_bpDbg.phases || []).find(p => p.phaseName === phase.name);
      if (ph) {
        ph.assistItems  = assistChanges.map(c => ({ key: c.key, cost: c.cost }));
        ph.counterItems = counterChanges.map(c => ({ key: c.key, cost: c.cost }));
      }
    }
    return { phase: phase.name, changes, assistChanges, counterChanges };
  });
}

function formatBpDebug(allHeroDbgList) {
  const iname = k => bpItemMap[k]?.name || k;
  const itier = k => { const t = bpItemMap[k]?.tier || 0; return t ? `T${Math.round(t/800)}` : '?'; };
  const lines = ['=== BUILD PATH DEBUG ==='];
  const algo  = allHeroDbgList[0]?.algo || '?';
  lines.push(`Algorithm: ${algo}`);
  lines.push(`Allies:  ${(MATCH.allies  || []).join(', ') || '—'}`);
  lines.push(`Enemies: ${(MATCH.enemies || []).join(', ') || '—'}`);

  for (const dbg of allHeroDbgList) {
    lines.push('', '─'.repeat(64));
    const side = (MATCH.allies || []).includes(dbg.hero) ? 'ALLY' : 'ENEMY';
    lines.push(`HERO: ${dbg.hero}  [${side}]  algo=${algo}`);

    if (dbg.guide) {
      lines.push('');
      lines.push('  Guide vector (top 15 tags by guide value):');
      Object.entries(dbg.guide)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([t, v]) => {
          const sw = (dbg.selfWeight?.[t]    || 0).toFixed(3);
          const aa = (dbg.allyAvg?.[t]       || 0).toFixed(3);
          const ef = (dbg.enemyFactor?.[t] ?? dbg.enemyAvg?.[t] ?? 0).toFixed(3);
          lines.push(`    ${t.padEnd(32)} guide=${v.toFixed(4)}  sw=${sw}  ally=${aa}  enemy=${ef}`);
        });
      const m = dbg.guideMeta || {};
      if (m.selfMag !== undefined)
        lines.push(`  Mags: self=${m.selfMag.toFixed(4)}  blended=${m.blendedMag.toFixed(4)}  normFactor=${m.normFactor.toFixed(4)}`);
      lines.push(`  My allies:  ${(m.myAllies  || []).join(', ') || '—'}`);
      lines.push(`  My enemies: ${(m.myEnemies || []).join(', ') || '—'}`);
    } else {
      lines.push('  Guide: N/A (non-cosine algorithm)');
    }

    if (dbg.enemyFactorDetail) {
      const sig = Object.entries(dbg.enemyFactorDetail)
        .filter(([, d]) => Math.abs(d.result) > 0.005)
        .sort((a, b) => Math.abs(b[1].result) - Math.abs(a[1].result))
        .slice(0, 12);
      if (sig.length) {
        lines.push('', '  Enemy factor breakdown (adaptive — tags with |result|>0.005):');
        sig.forEach(([t, d]) => {
          lines.push(`    ${t.padEnd(32)} sig=${d.sigCount}/${d.N}  frac=${d.fraction.toFixed(2)}  scale=${d.scale.toFixed(3)}  avgSig=${d.avgSig.toFixed(3)}  result=${d.result.toFixed(4)}`);
        });
      }
    }

    for (const ph of (dbg.phases || [])) {
      lines.push('', `  Phase: ${ph.phaseName}  (${ph.steps.length} buys, ${ph.swaps.length} swaps)`);
      ph.steps.forEach((s, si) => {
        const mode = s.type === 'fill' ? 'FILL' : 'QUAL';
        const cn   = iname(s.chosen);
        const ct   = itier(s.chosen);
        lines.push(`    Step ${si+1} [${mode}] chose: ${cn} ${ct}`);
        s.top5.forEach((c, ci) => {
          const nt = itier(c.key);
          lines.push(`      ${ci+1}. ${iname(c.key)} (${nt})  ps=${c.ps.toFixed(4)}  val=${c.val.toFixed(6)}  cost=${c.cost}`);
        });
      });
      ph.swaps.forEach(sw => {
        lines.push(`    [SWAP] sold ${iname(sw.sold)} ${itier(sw.sold)} (ps=${sw.soldPS.toFixed(4)}) => bought ${iname(sw.bought)} ${itier(sw.bought)} (ps=${sw.boughtPS.toFixed(4)})  ratio=${sw.ratio.toFixed(2)}x`);
      });
      if (ph.counterItems?.length) {
        const cs = ph.counterItems.map(c => `${iname(c.key)} (${itier(c.key)})`).join(', ');
        lines.push(`    [COUNTER] ${cs}`);
      }
      if (ph.assistItems?.length) {
        const as = ph.assistItems.map(c => `${iname(c.key)} (${itier(c.key)})`).join(', ');
        lines.push(`    [ASSIST]  ${as}`);
      }
    }
  }
  return lines.join('\n');
}

function mkBuildPathPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';

  if (MATCH.lazyBuildPaths) {
    d.innerHTML = '<div class="calc-panel-title">Build Path Guide</div>';
    const btn = document.createElement('button');
    btn.className = 'btn-primary btn-sm';
    btn.textContent = 'Calculate Build Path';
    btn.addEventListener('click', () => {
      btn.disabled = true; btn.textContent = 'Calculating…';
      const pathData = computeBuildPath(b, MATCH.bpAlgo);
      d.innerHTML = '';
      d.appendChild(buildPathPanelContents(pathData, b));
    });
    d.appendChild(btn);
    return d;
  }

  const pathData = b.buildPath || computeBuildPath(b);
  d.appendChild(buildPathPanelContents(pathData, b));
  return d;
}

// Builds the full panel contents (title bar + summary + detail toggle)
function buildPathPanelContents(pathData, b) {
  const wrap = document.createElement('div');

  // ── Summary view (default): end-of-Late inventory ─────────────────────────
  // Reconstruct the set of items owned after the Late phase
  const latePhaseIdx = BUILD_PHASES.findIndex(p => p.name === 'Late');
  const summaryOwned = new Set();
  for (let i = 0; i <= latePhaseIdx && i < pathData.length; i++) {
    pathData[i].changes.forEach(c => {
      if (c.action === 'sell')    summaryOwned.delete(c.key);
      else if (c.action === 'buy' || c.action === 'upgrade') summaryOwned.add(c.key);
    });
  }

  const itemNameMap = {};
  b.items.forEach(it => { itemNameMap[it.key] = it; });

  // Staple: top 4 self-score per tier, in final inventory, never sold
  const soldEver = new Set();
  pathData.forEach(({ changes }) => {
    changes.forEach(c => { if (c.action === 'sell') soldEver.add(c.key); });
  });
  const tierGroups = {};
  b.items.forEach(it => {
    if (it.self > 0) {
      const t = it.tier || 0;
      if (!tierGroups[t]) tierGroups[t] = [];
      tierGroups[t].push(it);
    }
  });
  const topSelfKeys = new Set();
  Object.values(tierGroups).forEach(group => {
    group.sort((a, bc) => bc.self - a.self).slice(0, 4).forEach(it => topSelfKeys.add(it.key));
  });
  const stapleKeys = new Set([...summaryOwned].filter(k =>
    topSelfKeys.has(k) && !soldEver.has(k)
  ));

  // Title bar with toggle + debug
  let detailOpen = false;
  const titleBar = document.createElement('div');
  titleBar.className = 'bp-title-bar';
  titleBar.innerHTML = `<span class="calc-panel-title" style="margin:0">Build Path Guide</span>
    <div style="display:flex;gap:6px;align-items:center;">
      <button class="btn-ghost btn-sm bp-debug-btn">Debug Roster</button>
      <button class="btn-ghost btn-sm bp-detail-toggle">Show Step-by-Step &#9662;</button>
    </div>`;
  wrap.appendChild(titleBar);

  titleBar.querySelector('.bp-debug-btn').addEventListener('click', () => {
    const debugBtn = titleBar.querySelector('.bp-debug-btn');
    debugBtn.disabled = true; debugBtn.textContent = 'Collecting…';
    const allHeroes = [...(MATCH.allies || []), ...(MATCH.enemies || [])];
    const allDbgData = [];
    allHeroes.forEach(heroName => {
      const r    = (MATCH.results || []).find(x => x.name === heroName);
      const bidx = MATCH.selectedBuilds?.[heroName] ?? 0;
      const b2   = r?.builds?.[bidx];
      if (!b2) return;
      _bpDbg = { hero: heroName, algo: MATCH.bpAlgo || 'greedy-phase', phases: [] };
      try { computeBuildPath(b2, MATCH.bpAlgo); } catch (e) { _bpDbg.error = String(e); }
      allDbgData.push(_bpDbg);
      _bpDbg = null;
    });
    const text = formatBpDebug(allDbgData);
    navigator.clipboard.writeText(text).then(() => {
      debugBtn.disabled = false; debugBtn.textContent = 'Copied!';
      setTimeout(() => { debugBtn.textContent = 'Debug Roster'; }, 2500);
    }).catch(() => {
      debugBtn.disabled = false; debugBtn.textContent = 'Failed';
      setTimeout(() => { debugBtn.textContent = 'Debug Roster'; }, 2500);
    });
  });

  // Summary row of item icons (end of Late)
  const summaryEl = document.createElement('div');
  summaryEl.className = 'bp-summary-row';
  if (summaryOwned.size) {
    summaryOwned.forEach(k => {
      const it  = itemNameMap[k];
      const img = srcUrl(it?.imagePath || '');
      const chip = document.createElement('span');
      chip.className = 'bp-summary-chip' + (stapleKeys.has(k) ? ' bp-staple' : '');
      chip.title = (stapleKeys.has(k) ? '★ Staple — ' : '') + (it?.name || k);
      chip.innerHTML = img ? `<img class="bp-item-img" src="${img}" alt="${it?.name || k}">` : `<span class="bp-empty-img"></span>`;
      const nameLbl = document.createElement('span');
      nameLbl.className = 'bp-summary-name';
      nameLbl.textContent = it?.name || k;
      chip.appendChild(nameLbl);
      summaryEl.appendChild(chip);
    });
  } else {
    summaryEl.innerHTML = '<div class="bp-empty">No items scored for build path.</div>';
  }
  wrap.appendChild(summaryEl);

  // Detail view (hidden by default)
  const detailEl = document.createElement('div');
  detailEl.className = 'bp-detail hidden';
  detailEl.appendChild(renderBuildPath(pathData, b, itemNameMap, stapleKeys));
  wrap.appendChild(detailEl);

  titleBar.querySelector('.bp-detail-toggle').addEventListener('click', () => {
    detailOpen = !detailOpen;
    detailEl.classList.toggle('hidden', !detailOpen);
    titleBar.querySelector('.bp-detail-toggle').textContent =
      detailOpen ? 'Hide Step-by-Step ▴' : 'Show Step-by-Step ▾';
  });

  return wrap;
}

function renderBuildPath(pathData, b, itemNameMap, stapleKeys = new Set()) {
  if (!itemNameMap) { itemNameMap = {}; b.items.forEach(it => { itemNameMap[it.key] = it; }); }
  const container = document.createElement('div');
  container.className = 'bp-container';

  // Items bought so far in build order — runner-up hides only if already bought before this decision
  const buyHistory = new Set();

  let hasAny = false;
  pathData.forEach(({ phase, changes, assistChanges, counterChanges }) => {
    const allEmpty = !changes.length && !assistChanges.length && !counterChanges.length;
    if (allEmpty) return;
    hasAny = true;

    const phaseEl = document.createElement('div');
    phaseEl.className = 'bp-phase';

    const phaseHdr = document.createElement('div');
    phaseHdr.className = 'bp-phase-hdr';
    phaseHdr.textContent = phase;
    phaseEl.appendChild(phaseHdr);

    const cols = document.createElement('div');
    cols.className = 'bp-cols';

    const mainCol = document.createElement('div');
    mainCol.className = 'bp-main-col';

    if (changes.length) {
      changes.forEach(c => {
        const scored  = itemNameMap[c.key] || { name: c.key, imagePath: '' };
        const img     = srcUrl(scored.imagePath || '');
        // Runner-up: hide only if it was already bought before this decision
        const altKey  = c.runnerUp && !buyHistory.has(c.runnerUp) ? c.runnerUp : null;
        const altItem = altKey ? (itemNameMap[altKey] || { name: altKey, imagePath: '' }) : null;
        const hasAlt  = c.action !== 'sell' && !!altItem;
        const row     = document.createElement('div');
        row.className = `bp-change bp-${c.action}` +
          (stapleKeys.has(c.key) && c.action !== 'sell' ? ' bp-staple' : '') +
          (hasAlt ? ' bp-has-alt' : '');
        const badge   = c.action === 'sell' ? '−' : c.action === 'upgrade' ? '↑' : '+';
        const costTxt = c.action === 'sell' ? `+${c.refund}s` : `-${c.cost}s`;
        row.innerHTML = `
          <span class="bp-action-badge bp-${c.action}-badge">${badge}</span>
          ${img ? `<img class="bp-item-img" src="${img}" alt="">` : ''}
          <span class="bp-item-name">${scored.name}</span>
          <span class="bp-cost">${costTxt}</span>`;
        if (hasAlt) {
          const altImg = srcUrl(altItem.imagePath || '');
          const panel = document.createElement('div');
          panel.className = 'bp-alt-panel';
          panel.innerHTML = `<span class="bp-alt-lbl">Close alt:</span>
            ${altImg ? `<img class="bp-item-img" src="${altImg}" alt="">` : ''}
            <span class="bp-alt-name">${altItem.name}</span>`;
          row.appendChild(panel);
        }
        mainCol.appendChild(row);
        if (c.action === 'buy' || c.action === 'upgrade') buyHistory.add(c.key);
        if (c.action === 'upgrade' && c.components?.length) {
          const compNames = c.components.map(k => itemNameMap[k]?.name || k).join(', ');
          const hint = document.createElement('div');
          hint.className = 'bp-upgrade-from';
          hint.textContent = `from: ${compNames}`;
          mainCol.appendChild(hint);
        }
      });
    } else {
      mainCol.innerHTML = '<div class="bp-empty">— no changes —</div>';
    }
    cols.appendChild(mainCol);

    const mkSideCol = (label, cls, sideChanges) => {
      const col = document.createElement('div');
      col.className = `bp-side-col ${cls}`;
      col.innerHTML = `<div class="bp-side-lbl">${label}</div>`;
      if (sideChanges.length) {
        sideChanges.forEach(c => {
          const scored = itemNameMap[c.key] || { name: c.key, imagePath: '' };
          const img    = srcUrl(scored.imagePath || '');
          const row    = document.createElement('div');
          row.className = 'bp-side-item';
          row.innerHTML = `${img ? `<img class="bp-item-img" src="${img}" alt="">` : ''}
            <span class="bp-item-name">${scored.name}</span>`;
          const icons = mkEffIcons(scored, null);
          if (icons.children.length) row.appendChild(icons);
          col.appendChild(row);
        });
      } else {
        col.innerHTML += '<div class="bp-empty">—</div>';
      }
      return col;
    };

    cols.appendChild(mkSideCol('Assist',  'bp-assist-col',  assistChanges));
    cols.appendChild(mkSideCol('Counter', 'bp-counter-col', counterChanges));
    phaseEl.appendChild(cols);
    container.appendChild(phaseEl);
  });

  if (!hasAny) {
    container.innerHTML = '<div class="calc-empty">Not enough scored items for build path.</div>';
  }
  return container;
}

function mkItemRow(item, hiCol, isNotRec = false) {
  const row = document.createElement('div');
  row.className = 'item-row' + (isNotRec ? ' not-rec' : '');
  const img = srcUrl(item.imagePath);
  row.innerHTML = `
    ${img
      ? `<img class="item-row-img" src="${img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="item-row-img no-img" ${img ? 'style="display:none"' : ''}></div>
    <div class="item-row-info">
      <span class="item-row-name">${item.name}</span>
      <span class="item-row-cat it-cat-${(item.category || '').toLowerCase()}">${item.category || ''}</span>
      ${item.tier ? `<span class="item-row-tier">${item.tier}s</span>` : ''}
    </div>
    <div class="item-row-scores">
      <span class="irs ally-clr${hiCol === 'ally'  ? ' irs-hi' : ''}" title="Ally score">A:${fmtScore(item.ally)}</span>
      <span class="irs${hiCol === 'self'  ? ' irs-hi' : ''}"           title="Self score">S:${fmtScore(item.self)}</span>
      <span class="irs enemy-clr${hiCol === 'enemy' ? ' irs-hi' : ''}" title="Enemy score">E:${fmtScore(item.enemy)}</span>
      <span class="irs total-clr${hiCol === 'total' ? ' irs-hi' : ''}" title="Total"><b>T:${fmtScore(item.total)}</b></span>
    </div>`;
  return row;
}

// ════════════════════════════════════════════════════════════════════════════
// RE-GENERATE PANEL
// ════════════════════════════════════════════════════════════════════════════

function renderRegenPanel() {
  const allyCont  = document.getElementById('regen-allies');
  const enemyCont = document.getElementById('regen-enemies');
  allyCont.innerHTML  = '';
  enemyCont.innerHTML = '';

  const mkRow = (name) => {
    const hero = MATCH.heroData[name];
    if (!hero) return null;
    const row = document.createElement('div');
    row.className = 'regen-row';
    row.innerHTML = `<span class="regen-name">${hero.eng_name || name}</span>`;
    const sel = document.createElement('select');
    sel.className = 'regen-sel';
    hero.builds.forEach((bd, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = bd.name || `Build ${i + 1}`;
      if (i === (MATCH.selectedBuilds[name] ?? 0)) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => { MATCH.selectedBuilds[name] = parseInt(sel.value); });
    row.appendChild(sel);
    return row;
  };

  [...new Set(MATCH.allies)].forEach(n => { const r = mkRow(n); if (r) allyCont.appendChild(r); });
  [...new Set(MATCH.enemies)].forEach(n => { const r = mkRow(n); if (r) enemyCont.appendChild(r); });
}

// ── Score formatter ────────────────────────────────────────────────────────
function fmtScore(n) {
  if (!n) return '0';
  const abs  = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10000) return sign + (abs / 1000).toFixed(0) + 'k';
  if (abs >= 1000)  return sign + (abs / 1000).toFixed(1) + 'k';
  if (abs >= 100)   return sign + Math.round(abs).toString();
  if (abs >= 10)    return sign + abs.toFixed(1);
  return sign + abs.toFixed(2);
}

// ── Button listeners ───────────────────────────────────────────────────────
document.getElementById('btn-calculate').addEventListener('click', runCalculation);
document.getElementById('back-to-setup').addEventListener('click', () => { showPage('calc'); renderCalcSetup(); });
document.getElementById('btn-show-regen').addEventListener('click', () => {
  document.getElementById('regen-panel').classList.toggle('hidden');
});
document.getElementById('btn-regen-run').addEventListener('click', () => {
  MATCH.results = computeResults();
  renderCalcSummary();
  document.getElementById('regen-panel').classList.add('hidden');
  toast('Recalculated');
});
document.getElementById('back-to-summary').addEventListener('click', () => showPage('calc-summary'));
document.getElementById('back-to-hero').addEventListener('click', () => openCalcHero(MATCH.viewHeroName));
document.getElementById('bp-algo-sel').addEventListener('change', e => { MATCH.bpAlgo = e.target.value; });
document.getElementById('score-formula-sel').addEventListener('change', e => {
  MATCH.scoreFormula = e.target.value;
  document.getElementById('v2-mult-group').style.display = (MATCH.scoreFormula === 'v2' || MATCH.scoreFormula === 'v3') ? '' : 'none';
});

// ── Reverse Engineer listeners ─────────────────────────────────────────────
document.getElementById('btn-reverse-engineer').addEventListener('click', openReverseEngineer);
document.getElementById('back-re').addEventListener('click', () => showPage('hero-edit'));
document.getElementById('btn-re-submit').addEventListener('click', submitReverseEngineer);

document.getElementById('re-item-search').addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  const dd = document.getElementById('re-item-dropdown');
  if (q.length < 2 || !RE._itemData) { dd.classList.add('hidden'); return; }
  const matches = RE._itemData.filter(it => it.tier !== 9999 && it.name.toLowerCase().includes(q)).slice(0, 12);
  if (!matches.length) { dd.classList.add('hidden'); return; }
  dd.innerHTML = '';
  matches.forEach(it => {
    const opt = document.createElement('div');
    opt.className = 're-item-opt';
    const img = srcUrl(it.image_path);
    opt.innerHTML = `${img ? `<img class="re-item-opt-img" src="${img}" alt="">` : ''}
      <span class="re-item-opt-name">${it.name}</span>
      <span class="re-item-opt-tier">${it.tier}★</span>`;
    opt.addEventListener('mousedown', e => {
      e.preventDefault();
      RE.items.push({ key: it.normalized_name, name: it.name, tier: it.tier, imagePath: it.image_path, selfScore: it.values?.self_score || {} });
      this.value = ''; dd.classList.add('hidden');
      renderReChips();
    });
    dd.appendChild(opt);
  });
  dd.classList.remove('hidden');
});
document.getElementById('re-item-search').addEventListener('blur', () => {
  setTimeout(() => document.getElementById('re-item-dropdown').classList.add('hidden'), 150);
});
document.getElementById('re-enemy-search').addEventListener('input', () => renderReHeroPicker('enemy'));
document.getElementById('re-ally-search').addEventListener('input', () => renderReHeroPicker('ally'));

// ══════════════════════════════════════════════════════════════════════════════
// QA TAB
// ══════════════════════════════════════════════════════════════════════════════

const BP_ALGO_OPTIONS = [
  { value: 'greedy-phase', label: 'Greedy (Phase)' },
  { value: 'marginal',     label: 'Marginal Value' },
  { value: 'cosine',       label: 'Cosine Deficit' },
  { value: 'beam',         label: 'Beam Search' },
  { value: 'lookahead',    label: '1-Step Lookahead' },
  { value: 'expert',       label: 'Expert Greedy' },
  { value: 'assassin',     label: 'Target Assassin' },
  { value: 'adaptive',     label: 'Hybrid Rotation' },
  { value: 'fusion',       label: 'Fusion (Best of All)' },
  { value: 'oracle',       label: 'Oracle (Deep/Slow)' },
];

const QA = {
  scenarios:      [],
  reports:        [],
  editId:         null,
  editAllies:     [],
  editEnemies:    [],
  editAddSide:    'ally',
  editHeroSearch: '',
  editHeroNotes:  {},
  runScenarioId:  null,
  runResults:     {},
  runAlgo:        null,
  runNotes:       {},
};

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Load & Render List ────────────────────────────────────────────────────────

async function loadQA() {
  if (!S.heroList.length) S.heroList = await api.get('/api/heroes');
  const [scenarios, reports] = await Promise.all([
    api.get('/api/qa/scenarios'),
    api.get('/api/qa/reports'),
  ]);
  QA.scenarios = scenarios;
  QA.reports   = reports;
  renderQAScenarioList();
  renderQAReportsList(reports);
}

function renderQAScenarioList() {
  const el = document.getElementById('qa-scenario-list');
  if (!QA.scenarios.length) {
    el.innerHTML = '<p class="qa-empty">No scenarios yet — create one to get started.</p>';
    return;
  }
  el.innerHTML = '';
  QA.scenarios.forEach(s => {
    const div = document.createElement('div');
    div.className = 'qa-scenario-card';
    div.innerHTML = `
      <div class="qa-sc-info">
        <div class="qa-sc-name">${escHtml(s.name)}</div>
        <div class="qa-sc-meta">${s.algos.length} algo${s.algos.length !== 1 ? 's' : ''} · ${s.allies.length} allies · ${s.enemies.length} enemies · ${escHtml(s.scoreFormula || 'v2')}</div>
      </div>
      <div class="qa-sc-actions">
        <button class="btn-ghost btn-sm">Edit</button>
        <button class="btn-primary btn-sm">&#9654; Run</button>
        <button class="btn-danger btn-sm">Delete</button>
      </div>`;
    div.querySelector('.btn-ghost').addEventListener('click', () => editQAScenario(s.id));
    div.querySelector('.btn-primary').addEventListener('click', () => runQAScenario(s.id));
    div.querySelector('.btn-danger').addEventListener('click', () => deleteQAScenario(s.id));
    el.appendChild(div);
  });
}

function renderQAReportsList(reports) {
  const el = document.getElementById('qa-reports-list');
  if (!reports.length) {
    el.innerHTML = '<p class="qa-empty">No saved reports.</p>';
    return;
  }
  el.innerHTML = '';
  reports.forEach(r => {
    const div = document.createElement('div');
    div.className = 'qa-report-card';
    div.innerHTML = `
      <div class="qa-sc-info">
        <div class="qa-sc-name">${escHtml(r.scenario_name)}</div>
        <div class="qa-sc-meta">${escHtml(r.run_at ? new Date(r.run_at).toLocaleString() : '')}</div>
      </div>
      <div class="qa-sc-actions">
        <button class="btn-ghost btn-sm">View</button>
        <button class="btn-danger btn-sm">Delete</button>
      </div>`;
    div.querySelector('.btn-ghost').addEventListener('click', () => viewQAReport(r.id));
    div.querySelector('.btn-danger').addEventListener('click', () => deleteQAReport(r.id));
    el.appendChild(div);
  });
}

// ── Scenario Edit ─────────────────────────────────────────────────────────────

function newQAScenario() { renderQAEditPage(null); }

function editQAScenario(id) {
  const s = QA.scenarios.find(x => x.id === id);
  if (s) renderQAEditPage(s);
}

function renderQAEditPage(s) {
  QA.editId         = s ? s.id : null;
  QA.editAllies     = s ? [...s.allies]  : [];
  QA.editEnemies    = s ? [...s.enemies] : [];
  QA.editAddSide    = 'ally';
  QA.editHeroSearch = '';
  QA.editHeroNotes  = s ? { ...(s.heroNotes || {}) } : {};

  document.getElementById('qa-edit-title').textContent      = s ? `Edit: ${s.name}` : 'New Scenario';
  document.getElementById('qe-name').value                  = s ? s.name : '';
  document.getElementById('qe-score-formula').value         = s ? (s.scoreFormula || 'v2') : 'v2';

  const algosSelected = s ? new Set(s.algos) : new Set(['cosine']);
  const container = document.getElementById('qe-algo-checkboxes');
  container.innerHTML = BP_ALGO_OPTIONS.map(opt => `
    <label class="qa-algo-check">
      <input type="checkbox" value="${opt.value}"${algosSelected.has(opt.value) ? ' checked' : ''}>
      ${escHtml(opt.label)}
    </label>`).join('');
  document.getElementById('qe-algo-all').checked = BP_ALGO_OPTIONS.every(o => algosSelected.has(o.value));

  document.querySelectorAll('.qa-side-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.side === 'ally');
  });

  renderQETeams();
  renderQEHeroNotes(QA.editHeroNotes);
  renderQEHeroGrid();
  showPage('qa-edit');
}

async function saveQAScenario() {
  const name = document.getElementById('qe-name').value.trim();
  if (!name) { toast('Scenario name is required', 'error'); return; }

  const algos = Array.from(document.querySelectorAll('#qe-algo-checkboxes input:checked')).map(cb => cb.value);
  if (!algos.length) { toast('Select at least one algorithm', 'error'); return; }

  const payload = {
    name,
    scoreFormula: document.getElementById('qe-score-formula').value,
    algos,
    allies:    QA.editAllies,
    enemies:   QA.editEnemies,
    heroNotes: getQEHeroNotes(),
  };

  const res = QA.editId
    ? await api.put(`/api/qa/scenarios/${QA.editId}`, payload)
    : await api.post('/api/qa/scenarios', payload);

  if (res.error) { toast(res.error, 'error'); return; }
  toast('Scenario saved');
  await loadQA();
  showPage('qa');
}

async function deleteQAScenario(id) {
  if (!confirm('Delete this scenario?')) return;
  const res = await api.del(`/api/qa/scenarios/${id}`);
  if (res.error) { toast(res.error, 'error'); return; }
  toast('Scenario deleted');
  await loadQA();
}

// ── QA Edit: Roster & Hero Picker ─────────────────────────────────────────────

function qeSetAddSide(side) {
  QA.editAddSide = side;
  document.querySelectorAll('.qa-side-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.side === side);
  });
}

function qeSelectHero(name) {
  if (QA.editAllies.includes(name) || QA.editEnemies.includes(name)) return;
  const arr   = QA.editAddSide === 'ally' ? QA.editAllies : QA.editEnemies;
  const label = QA.editAddSide === 'ally' ? 'allies' : 'enemies';
  if (arr.length >= 6) { toast(`Max 6 ${label}`, 'error'); return; }
  arr.push(name);
  renderQETeams();
  renderQEHeroNotes(QA.editHeroNotes);
  renderQEHeroGrid();
}

function qeRemoveHero(side, name) {
  const arr = side === 'ally' ? QA.editAllies : QA.editEnemies;
  const idx = arr.indexOf(name);
  if (idx >= 0) arr.splice(idx, 1);
  delete QA.editHeroNotes[name];
  renderQETeams();
  renderQEHeroNotes(QA.editHeroNotes);
  renderQEHeroGrid();
}

function renderQETeams() {
  document.getElementById('qe-ally-count').textContent  = `${QA.editAllies.length}/6`;
  document.getElementById('qe-enemy-count').textContent = `${QA.editEnemies.length}/6`;

  const mkChips = (list, containerId, side) => {
    const cont = document.getElementById(containerId);
    cont.innerHTML = '';
    list.forEach(name => {
      const h    = S.heroList.find(x => x.normalized_name === name);
      const chip = document.createElement('div');
      chip.className = 'team-chip';
      chip.innerHTML = `<span>${escHtml(h?.eng_name || name)}</span><button class="chip-x" title="Remove">×</button>`;
      chip.querySelector('.chip-x').addEventListener('click', () => qeRemoveHero(side, name));
      cont.appendChild(chip);
    });
  };
  mkChips(QA.editAllies,  'qe-ally-chips',  'ally');
  mkChips(QA.editEnemies, 'qe-enemy-chips', 'enemy');
}

function renderQEHeroGrid() {
  const q    = QA.editHeroSearch.toLowerCase();
  const list = q
    ? S.heroList.filter(h => h.normalized_name.includes(q) || (h.eng_name || '').toLowerCase().includes(q))
    : S.heroList;

  const cont = document.getElementById('qe-hero-grid');
  cont.innerHTML = '';
  list.forEach(h => {
    const inAlly  = QA.editAllies.includes(h.normalized_name);
    const inEnemy = QA.editEnemies.includes(h.normalized_name);
    const taken   = inAlly || inEnemy;
    const imgSrc  = h.image_path ? srcUrl(h.image_path) : '';

    const card = document.createElement('div');
    card.className = `qa-pick-card${taken ? ' taken' : ''}`;
    card.innerHTML = `
      ${imgSrc
        ? `<img src="${imgSrc}" class="qa-pick-img" alt="">`
        : '<div class="qa-pick-img qa-pick-placeholder">🦸</div>'}
      <div class="qa-pick-name">${escHtml(h.eng_name || h.normalized_name)}</div>
      ${inAlly  ? '<div class="qa-pick-badge ally-badge">Ally</div>'   : ''}
      ${inEnemy ? '<div class="qa-pick-badge enemy-badge">Enemy</div>' : ''}`;
    if (!taken) card.addEventListener('click', () => qeSelectHero(h.normalized_name));
    cont.appendChild(card);
  });
}

function renderQEHeroNotes(existing = {}) {
  QA.editHeroNotes = existing;
  const all  = [...QA.editAllies, ...QA.editEnemies];
  const cont = document.getElementById('qe-hero-notes');
  if (!all.length) {
    cont.innerHTML = '<p style="color:var(--muted);font-size:12px">Add heroes to roster first.</p>';
    return;
  }
  cont.innerHTML = all.map(name => {
    const display = S.heroList.find(h => h.normalized_name === name)?.eng_name || name;
    return `
      <div class="qa-note-row">
        <label class="qa-note-lbl">${escHtml(display)}</label>
        <input type="text" class="qa-note-input" data-hero="${escHtml(name)}"
               placeholder="Note (optional)" value="${escHtml(existing[name] || '')}">
      </div>`;
  }).join('');
}

function getQEHeroNotes() {
  const notes = {};
  document.querySelectorAll('#qe-hero-notes .qa-note-input').forEach(inp => {
    const v = inp.value.trim();
    if (v) notes[inp.dataset.hero] = v;
  });
  return notes;
}

function toggleQEAlgos(show) {
  document.querySelectorAll('#qe-algo-checkboxes input[type=checkbox]').forEach(cb => { cb.checked = show; });
}

// ── Run Scenario ──────────────────────────────────────────────────────────────

async function runQAScenario(id) {
  const scenario = QA.scenarios.find(x => x.id === id);
  if (!scenario) { toast('Scenario not found', 'error'); return; }
  if (!scenario.allies.length && !scenario.enemies.length) {
    toast('Add heroes to the scenario first', 'error'); return;
  }

  toast('Loading data…');

  if (!S.tags.length)     S.tags     = await api.get('/api/tags');
  if (!S.heroList.length) S.heroList = await api.get('/api/heroes');

  const allNames = [...new Set([...scenario.allies, ...scenario.enemies])];
  for (const name of allNames) {
    MATCH.heroData[name] = await api.get(`/api/heroes/${name}`);
    cacheHeroBuilds(name);
  }
  if (!MATCH.itemData.length) MATCH.itemData = await api.get('/api/items/all');

  const savedAllies  = MATCH.allies;
  const savedEnemies = MATCH.enemies;
  const savedFormula = MATCH.scoreFormula;
  const savedAlgo    = MATCH.bpAlgo;

  MATCH.allies       = scenario.allies;
  MATCH.enemies      = scenario.enemies;
  MATCH.scoreFormula = scenario.scoreFormula;

  QA.runScenarioId = id;
  QA.runResults    = {};
  QA.runNotes      = {};

  const total = scenario.algos.length;
  for (let i = 0; i < total; i++) {
    const algo = scenario.algos[i];
    toast(`Running ${i + 1}/${total}: ${BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo}…`);
    await new Promise(r => setTimeout(r, 0)); // yield to browser between algos
    MATCH.bpAlgo = algo;
    const results = computeResults();
    QA.runResults[algo] = results.map(r => ({
      name:      r.name,
      engName:   r.engName,
      imagePath: r.imagePath,
      isEnemy:   r.isEnemy,
      builds:    r.builds.map(b => ({ ...b, buildPath: computeBuildPath(b, algo) })),
    }));
  }

  MATCH.allies       = savedAllies;
  MATCH.enemies      = savedEnemies;
  MATCH.scoreFormula = savedFormula;
  MATCH.bpAlgo       = savedAlgo;

  QA.runAlgo = scenario.algos[0];
  renderQARunPage(scenario);
  showPage('qa-run');
  toast('Done');
}

function renderQARunPage(scenario) {
  document.getElementById('qa-run-title').textContent = scenario.name;

  const tabs = document.getElementById('qa-run-algo-tabs');
  tabs.innerHTML = '';
  scenario.algos.forEach(algo => {
    const label = BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo;
    const btn   = document.createElement('button');
    btn.className   = `qa-algo-tab${algo === QA.runAlgo ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', () => selectQARunAlgo(algo));
    tabs.appendChild(btn);
  });

  renderQARunResults();
}

function selectQARunAlgo(algo) {
  QA.runAlgo = algo;
  const label = BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo;
  document.querySelectorAll('.qa-algo-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === label);
  });
  renderQARunResults();
}

function renderQARunResults() {
  const results   = QA.runResults[QA.runAlgo] || [];
  const container = document.getElementById('qa-run-results');
  container.innerHTML = '';

  if (!results.length) {
    container.innerHTML = '<p style="color:var(--muted)">No results.</p>';
    return;
  }

  results.forEach(r => { container.innerHTML += renderQABuildRow(r); });

  container.querySelectorAll('.qa-note-input[data-key]').forEach(inp => {
    inp.addEventListener('input', () => { QA.runNotes[inp.dataset.key] = inp.value; });
  });
}

function renderQABuildRow(heroResult) {
  const isAlly    = !heroResult.isEnemy;
  const sideClass = isAlly ? 'ally-hdr' : 'enemy-hdr';
  const sideLabel = isAlly ? 'Ally' : 'Enemy';
  const img = heroResult.imagePath
    ? `<img src="${srcUrl(heroResult.imagePath)}" class="qa-hero-thumb" alt="">`
    : '';

  const buildsHtml = heroResult.builds.map(b => {
    const noteKey = `${QA.runAlgo}::${heroResult.name}::${b.name}`;
    const noteVal = escHtml(QA.runNotes[noteKey] || '');
    return `
      <div class="qa-build-entry">
        <div class="qa-build-name">${escHtml(b.name)} <span class="qa-build-score">${b.total.toFixed(2)}</span></div>
        <div class="qa-build-path-wrap">${renderQABuildPath(b.buildPath, b)}</div>
        <div class="qa-note-row">
          <label class="qa-note-lbl">Note</label>
          <input type="text" class="qa-note-input" data-key="${escHtml(noteKey)}" placeholder="Optional note" value="${noteVal}">
        </div>
      </div>`;
  }).join('');

  return `
    <div class="qa-hero-block">
      <div class="qa-hero-hdr ${sideClass}">
        ${img}
        <span class="qa-hero-name">${escHtml(heroResult.engName)}</span>
        <span class="qa-hero-side-badge">${sideLabel}</span>
      </div>
      <div class="qa-hero-builds">${buildsHtml}</div>
    </div>`;
}

function renderQABuildPath(bp, b) {
  if (!bp || !bp.length) return '<span style="color:var(--muted);font-size:12px">No path computed</span>';
  const itemNameMap = {};
  (b?.items || []).forEach(it => { itemNameMap[it.key] = it; });

  const phaseHtml = bp.map(({ phase, changes }) => {
    if (!changes || !changes.length) return '';
    const rows = changes.map(ch => {
      const it  = itemNameMap[ch.key];
      const img = it?.imagePath ? `<img src="${srcUrl(it.imagePath)}" class="qa-bp-img" alt="">` : '';
      const lbl = escHtml(it?.name || ch.key);
      const badge = ch.action === 'sell' ? '−' : ch.action === 'upgrade' ? '↑' : '+';
      const badgeClass = `qa-bp-badge qa-bp-badge-${ch.action}`;
      return `<div class="qa-bp-row"><span class="${badgeClass}">${badge}</span>${img}<span class="qa-bp-name">${lbl}</span></div>`;
    }).join('');
    return `<div class="qa-bp-phase"><div class="qa-bp-phase-hdr">${escHtml(phase)}</div>${rows}</div>`;
  }).join('');

  return phaseHtml || '<span style="color:var(--muted);font-size:12px">No items in path</span>';
}

// ── Save / View Reports ───────────────────────────────────────────────────────

async function saveQAReport() {
  const scenario = QA.scenarios.find(x => x.id === QA.runScenarioId);
  if (!scenario) { toast('Scenario not found', 'error'); return; }

  document.querySelectorAll('#qa-run-results .qa-note-input[data-key]').forEach(inp => {
    const v = inp.value.trim();
    if (v) QA.runNotes[inp.dataset.key] = v;
  });

  const algoResults = {};
  for (const [algo, results] of Object.entries(QA.runResults)) {
    algoResults[algo] = results.map(r => ({
      name:      r.name,
      engName:   r.engName,
      imagePath: r.imagePath,
      isEnemy:   r.isEnemy,
      builds:    r.builds.map(b => ({
        name:      b.name,
        total:     b.total,
        buildPath: (b.buildPath || []).flatMap(phase => (phase.changes || []).map(ch => ch.key)),
        note:      QA.runNotes[`${algo}::${r.name}::${b.name}`] || '',
      })),
    }));
  }

  const res = await api.post('/api/qa/reports', {
    scenario_id:   scenario.id,
    scenario_name: scenario.name,
    allies:        scenario.allies,
    enemies:       scenario.enemies,
    algos:         scenario.algos,
    scoreFormula:  scenario.scoreFormula,
    heroNotes:     scenario.heroNotes || {},
    algoResults,
    buildNotes:    QA.runNotes,
  });

  if (res.error) { toast(res.error, 'error'); return; }
  toast('Report saved');
  QA.reports = await api.get('/api/qa/reports');
  renderQAReportsList(QA.reports);
}

async function viewQAReport(id) {
  const report = await api.get(`/api/qa/reports/${id}`);
  if (report.error) { toast(report.error, 'error'); return; }
  document.getElementById('qa-report-title').textContent   = `Report: ${report.scenario_name}`;
  document.getElementById('btn-delete-qa-report').dataset.rid = id;
  renderQAReportContent(report);
  showPage('qa-report');
}

function renderQAReportContent(report) {
  const container = document.getElementById('qa-report-content');

  const allies  = (report.allies  || []).map(n => `<div class="team-chip">${escHtml(n)}</div>`).join('');
  const enemies = (report.enemies || []).map(n => `<div class="team-chip">${escHtml(n)}</div>`).join('');

  const heroNotesHtml = Object.keys(report.heroNotes || {}).length
    ? `<div class="qa-report-section">
        <div class="qa-section-hdr">Hero Notes</div>
        ${Object.entries(report.heroNotes).map(([hero, note]) =>
          `<div class="qa-note-row">
            <span class="qa-note-lbl">${escHtml(hero)}</span>
            <span>${escHtml(note)}</span>
          </div>`).join('')}
      </div>`
    : '';

  const algosHtml = (report.algos || []).map(algo => {
    const label       = BP_ALGO_OPTIONS.find(o => o.value === algo)?.label ?? algo;
    const heroResults = (report.algoResults || {})[algo] || [];
    const heroHtml    = heroResults.map(r => {
      const buildsHtml = (r.builds || []).map(b => `
        <div class="qa-build-entry">
          <div class="qa-build-name">${escHtml(b.name)} <span class="qa-build-score">${typeof b.total === 'number' ? b.total.toFixed(2) : b.total}</span></div>
          <div class="qa-bp-list">${(b.buildPath || []).map((k, i) => `<span class="qa-bp-pill">${i + 1}. ${escHtml(k)}</span>`).join('')}</div>
          ${b.note ? `<div class="qa-build-note">${escHtml(b.note)}</div>` : ''}
        </div>`).join('');
      return `
        <div class="qa-hero-block">
          <div class="qa-hero-hdr ${r.isEnemy ? 'enemy-hdr' : 'ally-hdr'}">
            <span class="qa-hero-name">${escHtml(r.engName)}</span>
          </div>
          <div class="qa-hero-builds">${buildsHtml}</div>
        </div>`;
    }).join('');
    return `<div class="qa-report-algo">
      <div class="qa-report-algo-name">${escHtml(label)}</div>
      ${heroHtml}
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="qa-report-meta">
      <span>Scenario: <strong>${escHtml(report.scenario_name)}</strong></span>
      <span>Formula: <strong>${escHtml(report.scoreFormula || 'v2')}</strong></span>
      <span>Saved: <strong>${escHtml(report.timestamp || '')}</strong></span>
    </div>
    <div class="qa-report-section">
      <div class="qa-section-hdr">Roster</div>
      <div class="calc-teams-bar">
        <div class="calc-team">
          <div class="calc-team-hdr ally-hdr">Allies</div>
          <div class="team-chips">${allies}</div>
        </div>
        <div class="calc-team">
          <div class="calc-team-hdr enemy-hdr">Enemies</div>
          <div class="team-chips">${enemies}</div>
        </div>
      </div>
    </div>
    ${heroNotesHtml}
    <div class="qa-report-section">
      <div class="qa-section-hdr">Algorithm Results</div>
      ${algosHtml}
    </div>`;
}

async function deleteQAReport(id) {
  if (!confirm('Delete this report?')) return;
  const res = await api.del(`/api/qa/reports/${id}`);
  if (res.error) { toast(res.error, 'error'); return; }
  toast('Report deleted');
  await loadQA();
  showPage('qa');
}

// ── QA Event Listeners ────────────────────────────────────────────────────────

document.getElementById('btn-new-qa-scenario').addEventListener('click', newQAScenario);

document.getElementById('back-qa-edit').addEventListener('click', async () => {
  await loadQA(); showPage('qa');
});

document.getElementById('btn-save-qa-scenario').addEventListener('click', saveQAScenario);

document.getElementById('qe-algo-all').addEventListener('change', function () {
  toggleQEAlgos(this.checked);
});

document.getElementById('qe-hero-search').addEventListener('input', function () {
  QA.editHeroSearch = this.value;
  renderQEHeroGrid();
});

document.querySelectorAll('.qa-side-btn').forEach(btn => {
  btn.addEventListener('click', () => qeSetAddSide(btn.dataset.side));
});

document.getElementById('back-qa-run').addEventListener('click', async () => {
  await loadQA(); showPage('qa');
});

document.getElementById('btn-save-qa-report').addEventListener('click', saveQAReport);

document.getElementById('back-qa-report').addEventListener('click', async () => {
  await loadQA(); showPage('qa');
});

document.getElementById('btn-delete-qa-report').addEventListener('click', function () {
  deleteQAReport(this.dataset.rid);
});
