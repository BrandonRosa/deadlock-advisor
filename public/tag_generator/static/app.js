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

  const showBanner = S.currentBuildIdx === 0 && !S.currentHero.is_preset && isBuildEmpty(build);
  const banner = document.getElementById('preset-banner');
  banner.classList.toggle('hidden', !showBanner);
  if (showBanner) populatePresetBannerHeroes();

  renderHeroTagTable(build);
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

// ── Hero Tag Table ────────────────────────────────────────────────────────────
const HERO_COLS = [
  { key: 'ally_weight',  label: 'Ally Weight'  },
  { key: 'self_weight',  label: 'Self Item Weight'        },
  { key: 'enemy_weight', label: 'Enemy Weight'            },
  { key: 'self_score',   label: 'Playstyle/Ability Score' },
];

function renderHeroTagTable(build) {
  const tbody = document.getElementById('hero-tag-body');
  tbody.innerHTML = '';
  S.tags.forEach(tag => {
    const tr = document.createElement('tr');
    // Tag name cell
    const nameTd = document.createElement('td');
    nameTd.className = 'col-tag';
    nameTd.dataset.colIdx = '0';
    nameTd.innerHTML = `<div class="tag-name">${tag.name}</div><div class="tag-code">${tag.code}</div>`;
    tr.appendChild(nameTd);

    HERO_COLS.forEach((col, ci) => {
      const td = document.createElement('td');
      td.dataset.colIdx = String(ci + 1);
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.placeholder = '—';
      input.className = 'val-input';
      input.dataset.col = col.key;
      input.dataset.tag = tag.code;
      valToInput(input, (build.values[col.key] || {})[tag.code]);
      input.addEventListener('input', () => {
        const b = S.currentHero.builds[S.currentBuildIdx];
        if (!b.values[col.key]) b.values[col.key] = {};
        b.values[col.key][tag.code] = inputToVal(input);
        applyValClass(input);
        setHeroDirty(true);
      });
      input.addEventListener('focus', () => {
        tr.classList.add('row-active');
        const table = tr.closest('table');
        table.querySelectorAll(`[data-col-idx="${td.dataset.colIdx}"]`).forEach(el => el.classList.add('col-active'));
      });
      input.addEventListener('blur', () => {
        tr.classList.remove('row-active');
        const table = tr.closest('table');
        table.querySelectorAll('.col-active').forEach(el => el.classList.remove('col-active'));
      });
      td.appendChild(input);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
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
  S.itemDirty = false;

  // Ensure all tags present
  if (!S.currentItem.values) S.currentItem.values = {};
  if (!S.currentItem.values.self_score) S.currentItem.values.self_score = {};
  S.tags.forEach(t => {
    if (!(t.code in S.currentItem.values.self_score)) S.currentItem.values.self_score[t.code] = null;
  });

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
  document.getElementById('if-remarks').value = it.remarks           || '';

  const catBadge = document.getElementById('item-cat-badge');
  catBadge.textContent = it.category;
  catBadge.className   = `cat-badge ${it.category}`;
  document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
  setImg('item-icon-img', it.image_path);
  setItemDirty(false);
  renderItemTagTable();
}

// Item field changes
['if-name','if-cat','if-tier','if-wiki','if-image','if-remarks'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const it = S.currentItem;
    if (!it) return;
    it.name       = document.getElementById('if-name').value;
    it.category   = document.getElementById('if-cat').value;
    it.tier       = parseInt(document.getElementById('if-tier').value) || 0;
    it.wiki_url   = document.getElementById('if-wiki').value;
    it.image_path = document.getElementById('if-image').value;
    it.remarks    = document.getElementById('if-remarks').value;
    setImg('item-icon-img', it.image_path);
    document.getElementById('item-cat-badge').textContent = it.category;
    document.getElementById('item-cat-badge').className   = `cat-badge ${it.category}`;
    document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
    setItemDirty(true);
  });
});

function renderItemTagTable() {
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
      const table = tr.closest('table');
      table.querySelectorAll('[data-col-idx="1"]').forEach(el => el.classList.add('col-active'));
    });
    input.addEventListener('blur', () => {
      tr.classList.remove('row-active');
      const table = tr.closest('table');
      table.querySelectorAll('.col-active').forEach(el => el.classList.remove('col-active'));
    });
    td.appendChild(input);
    tr.appendChild(td);
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
  },
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
['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy'].forEach(id => {
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

function computeResults() {
  // Always read current input values so changes made without blur are captured
  ['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy'].forEach(id => {
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
      let allyScore = 0, enemyScore = 0;
      const allyBD = {}, enemyBD = {};

      S.tags.forEach(tag => {
        const t  = tag.code;
        const aw = tv(build.values?.ally_weight,  t);
        const ew = tv(build.values?.enemy_weight, t);

        myAllies.forEach(an => {
          const ss = tv(srcBuild(an)?.values?.self_score, t);
          const c  = aw * ss;
          allyScore += c;
          allyBD[an] = (allyBD[an] || 0) + c;
        });

        myEnemies.forEach(en => {
          const ss = tv(srcBuild(en)?.values?.self_score, t);
          const c  = ew * ss;
          enemyScore += c;
          enemyBD[en] = (enemyBD[en] || 0) + c;
        });
      });

      // Average by team size
      const numAllies  = myAllies.length  || 1;
      const numEnemies = myEnemies.length || 1;
      allyScore  /= numAllies;
      enemyScore /= numEnemies;
      Object.keys(allyBD).forEach(k  => allyBD[k]  /= numAllies);
      Object.keys(enemyBD).forEach(k => enemyBD[k] /= numEnemies);

      const itemPool = MATCH.include9999 ? MATCH.itemData : MATCH.itemData.filter(it => it.tier !== 9999);
      const items = itemPool.map(item => {
        let iAlly = 0, iSelf = 0, iEnemy = 0;
        S.tags.forEach(tag => {
          const t  = tag.code;
          const is = tv(item.values?.self_score, t);
          const sw = tv(build.values?.self_weight, t);
          iSelf += is * sw;
          myAllies.forEach(an => {
            iAlly += is * tv(srcBuild(an)?.values?.ally_weight, t);
          });
          myEnemies.forEach(en => {
            iEnemy += is * tv(srcBuild(en)?.values?.enemy_weight, t) * -1;
          });
        });
        iAlly  /= numAllies;
        iEnemy /= numEnemies;
        return {
          key: item.normalized_name, name: item.name,
          category: item.category, tier: item.tier, imagePath: item.image_path,
          values:   item.values?.self_score || {},
          remarks:  item.remarks || '',
          total: iAlly * MATCH.mult.itemAlly + iSelf + iEnemy * MATCH.mult.itemEnemy,
          ally: iAlly, self: iSelf, enemy: iEnemy,
        };
      });

      // Items to Assist: item × build.ally_weight (highest = best assist)
      // Items to Counter: item × build.enemy_weight (lowest = best counter)
      const assistItems = itemPool.map(item => {
        let score = 0;
        S.tags.forEach(tag => {
          const t = tag.code;
          if (t === 'assist_importance' || t === 'counter_importance') return;
          score += tv(item.values?.self_score, t) * tv(build.values?.ally_weight, t);
        });
        const aImp = tv(item.values?.self_score, 'assist_importance');
        return { name: item.name, imagePath: item.image_path, score: score * (aImp || 1) };
      }).sort((a, b) => b.score - a.score).slice(0, 3);

      const counterItems = itemPool.map(item => {
        let score = 0;
        S.tags.forEach(tag => {
          const t = tag.code;
          if (t === 'assist_importance' || t === 'counter_importance') return;
          score += tv(item.values?.self_score, t) * tv(build.values?.enemy_weight, t);
        });
        const cImp = tv(item.values?.self_score, 'counter_importance');
        return { name: item.name, imagePath: item.image_path, score: score * (cImp || 1) };
      }).sort((a, b) => a.score - b.score).slice(0, 3);

      return {
        buildIdx: bi, name: build.name || `Build ${bi + 1}`, isGeneral: bi === 0,
        total: allyScore * MATCH.mult.buildAlly + enemyScore * MATCH.mult.buildEnemy,
        ally: allyScore, enemy: enemyScore,
        allyBD, enemyBD, items, assistItems, counterItems,
      };
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
function computeStrengthsWeaknesses(buildData) {
  const selfScores   = buildData?.values?.self_score   || {};
  const enemyWeights = buildData?.values?.enemy_weight || {};

  const strengths = S.tags
    .map(t => ({ code: t.code, name: t.name, val: tv(selfScores, t.code) }))
    .filter(x => x.val > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  const weaknesses = S.tags
    .map(t => ({ code: t.code, name: t.name, val: tv(enemyWeights, t.code) }))
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
    val: heroNames.reduce((s, nm) => s + tv(srcBuild(nm)?.values?.self_score,   t.code), 0) / n,
  })).filter(x => x.val > 0).sort((a, b) => b.val - a.val).slice(0, 3);

  const weaknesses = S.tags.map(t => ({
    code: t.code, name: t.name,
    val: heroNames.reduce((s, nm) => s + tv(srcBuild(nm)?.values?.enemy_weight, t.code), 0) / n,
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

  card.innerHTML = `
    <div class="sc-header">
      ${img
        ? `<img class="sc-img" src="${img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="sc-img sc-no-img" ${img ? 'style="display:none"' : ''}>🦸</div>
      <div class="sc-info">
        <div class="sc-name">${r.isSelf ? '★ ' : ''}${r.engName}</div>
        <div class="sc-role">${r.isSelf ? 'You' : r.isEnemy ? 'Enemy' : 'Ally'}</div>
      </div>
    </div>
    <div class="sc-builds">
      ${r.topBuilds.map(b => `
        <div class="sc-build-row">
          <span class="sc-bname">${b.name}</span>
          <span class="sc-bscore">${fmtScore(b.total)}</span>
        </div>`).join('')}
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
    const sw = computeStrengthsWeaknesses(topBuildData);
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

  // Per-hero best/worst matchups from top build's enemyBD
  if (topBuild && Object.keys(topBuild.enemyBD || {}).length) {
    const sorted   = Object.entries(topBuild.enemyBD).sort((a, b) => b[1] - a[1]);
    const best     = sorted.slice(0, 2);
    const worst    = sorted.slice(-2).reverse();
    const muEl     = document.createElement('div');
    muEl.className = 'sc-matchups';

    const mkMuRow = (entries, label, cls) => {
      if (!entries.length) return;
      const sec = document.createElement('div');
      sec.className = `sc-mu-section ${cls}`;
      sec.innerHTML = `<span class="sc-mu-lbl">${label}</span>`;
      entries.forEach(([eName]) => {
        const hd  = MATCH.heroData[eName];
        const img = srcUrl(hd?.image_path || '');
        const span = document.createElement('span');
        span.className = 'sc-mu-hero';
        span.innerHTML = `${img ? `<img class="sc-mu-img" src="${img}" alt="">` : ''}${hd?.eng_name || eName}`;
        sec.appendChild(span);
      });
      muEl.appendChild(sec);
    };

    mkMuRow(best,  'Best vs',  'mu-best');
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
  if (heroData?.image_path) {
    const banner = document.createElement('div');
    banner.className = 'ch-hero-banner';
    banner.innerHTML = `<img class="ch-hero-img" src="${srcUrl(heroData.image_path)}" alt="${r.engName}">
      <div class="ch-hero-banner-name">${r.engName}</div>`;
    el.appendChild(banner);
  }

  const hdr = document.createElement('div');
  hdr.className = 'ch-header-row';
  hdr.innerHTML = '<span>Build</span><span>Ally</span><span>Enemy</span><span>Total</span>';
  el.appendChild(hdr);

  const sortedBuilds = [...r.builds].sort((a, bld) => bld.total - a.total);
  sortedBuilds.forEach(b => {
    const row = document.createElement('div');
    row.className = 'ch-build-row' + (b.isGeneral ? ' is-general' : '');
    row.innerHTML = `
      <span class="ch-bname">${b.name}</span>
      <span class="ch-score ally-clr">${fmtScore(b.ally)}</span>
      <span class="ch-score enemy-clr">${fmtScore(b.enemy)}</span>
      <span class="ch-score total-clr">${fmtScore(b.total)}</span>`;

    const buildData = MATCH.heroData[name]?.builds[b.buildIdx];
    if (buildData) {
      const sw = computeStrengthsWeaknesses(buildData);
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
  return mkPanel('Build Score', `
    <div class="score-trio">
      <div class="score-block"><div class="score-val ally-clr">${fmtScore(b.ally)}</div><div class="score-lbl">Ally</div></div>
      <div class="score-block"><div class="score-val enemy-clr">${fmtScore(b.enemy)}</div><div class="score-lbl">Enemy</div></div>
      <div class="score-block"><div class="score-val total-clr">${fmtScore(b.total)}</div><div class="score-lbl">Total</div></div>
    </div>`);
}

function mkTagPanel(heroName, buildIdx) {
  const buildData = MATCH.heroData[heroName]?.builds[buildIdx];
  const d         = document.createElement('div');
  d.className     = 'calc-panel';
  d.innerHTML     = '<div class="calc-panel-title">Tag Profile</div>';
  if (buildData) {
    const sw = computeStrengthsWeaknesses(buildData);
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

  addBD(Object.entries(b.allyBD).sort((a, x) => x[1] - a[1]),  'Ally Contributions',  'ally-clr');
  addBD(Object.entries(b.enemyBD).sort((a, x) => x[1] - a[1]), 'Enemy Contributions', 'enemy-clr');
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
  const SKIP_TAGS   = new Set(['assist_importance', 'counter_importance']);

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
        return sum + tv(it.values, tag.code) * tv(srcBuild(an)?.values?.ally_weight, tag.code);
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
        return sum + tv(it.values, tag.code) * tv(srcBuild(en)?.values?.enemy_weight, tag.code);
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
    .filter(it => (it.total < 1.0 && it.enemy < 0) || it.self < 0.5)
    .sort((a, b) => a.total - b.total);
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
