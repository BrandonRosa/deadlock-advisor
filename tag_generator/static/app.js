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
  document.getElementById('if-image').value = it.image_path        || '';

  const catBadge = document.getElementById('item-cat-badge');
  catBadge.textContent = it.category;
  catBadge.className   = `cat-badge ${it.category}`;
  document.getElementById('item-tier-badge').textContent = it.tier ? `${it.tier} souls` : '';
  setImg('item-icon-img', it.image_path);
  setItemDirty(false);
  renderItemTagTable();
}

// Item field changes
['if-name','if-cat','if-tier','if-wiki','if-image'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const it = S.currentItem;
    if (!it) return;
    it.name       = document.getElementById('if-name').value;
    it.category   = document.getElementById('if-cat').value;
    it.tier       = parseInt(document.getElementById('if-tier').value) || 0;
    it.wiki_url   = document.getElementById('if-wiki').value;
    it.image_path = document.getElementById('if-image').value;
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

// ── Not-Recommended config — swap method here as needed ───────────────────
const NOT_REC = {
  method:      'rank_diff',  // 'rank_diff' | 'pct_threshold'
  rankDiff:    15,           // rank_diff: flag when (total_rank - self_rank) > N
  selfMinPct:  0.15,         // both: ignore items below X% of max self score
  selfTopPct:  0.35,         // pct_threshold: must be in top 35% by self
  totalBotPct: 0.50,         // pct_threshold: must be in bottom 50% by total
};

// ── State ─────────────────────────────────────────────────────────────────
const MATCH = {
  multiMode:      false,
  uncapped:       false,
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
    buildAlly:  0.75,
    buildEnemy: 0.85,
    itemAlly:   0.75,
    itemEnemy:  0.85,
  },
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
document.getElementById('calc-uncap').addEventListener('change', e => {
  MATCH.uncapped = e.target.checked;
  renderTeamBars();
});
['mult-build-ally','mult-build-enemy','mult-item-ally','mult-item-enemy'].forEach(id => {
  document.getElementById(id).addEventListener('change', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v) || v < 0) return;
    // 'mult-build-ally' → 'buildAlly'
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
  const allNames = [...new Set([...MATCH.allies, ...MATCH.enemies])];
  toast('Loading data...');
  for (const name of allNames) {
    if (!MATCH.heroData[name]) MATCH.heroData[name] = await api.get(`/api/heroes/${name}`);
  }
  if (!MATCH.itemData.length) MATCH.itemData = await api.get('/api/items/all');
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

      const items = MATCH.itemData.map(item => {
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
        return {
          key: item.normalized_name, name: item.name,
          category: item.category, tier: item.tier, imagePath: item.image_path,
          total: iAlly * MATCH.mult.itemAlly + iSelf + iEnemy * MATCH.mult.itemEnemy,
          ally: iAlly, self: iSelf, enemy: iEnemy,
        };
      });

      return {
        buildIdx: bi, name: build.name || `Build ${bi + 1}`, isGeneral: bi === 0,
        total: allyScore * MATCH.mult.buildAlly + enemyScore * MATCH.mult.buildEnemy,
        ally: allyScore, enemy: enemyScore,
        allyBD, enemyBD, items,
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
// TAG AFFINITY HELPERS
// ════════════════════════════════════════════════════════════════════════════

function computeTagAffinity(selfScoreDicts, enemyNames) {
  // score[t] = Σ(self_score[t] for all dicts) - Σ(enemy.enemy_weight[t])
  const entries = S.tags.map(tag => {
    const t = tag.code;
    let score = 0;
    selfScoreDicts.forEach(ss => { score += tv(ss, t); });
    enemyNames.forEach(en => { score -= tv(srcBuild(en)?.values?.enemy_weight, t); });
    return { code: t, name: tag.name, score };
  }).filter(x => x.score !== 0);

  const sorted = [...entries].sort((a, b) => b.score - a.score);
  return {
    good: sorted.slice(0, 3),
    bad:  sorted.length > 0 ? sorted.slice(-3).reverse() : [],
  };
}

function mkTagAffinityEl(aff, compact = false) {
  const d = document.createElement('div');
  d.className = 'tag-affinity' + (compact ? ' ta-compact' : '');
  if (aff.good.length) {
    const row = document.createElement('div');
    row.className = 'ta-row';
    row.innerHTML = `<span class="ta-lbl ta-good-lbl">Good with:</span>`
      + aff.good.map(t => `<span class="ta-tag ta-good" title="${fmtScore(t.score)}">${t.name}</span>`).join('');
    d.appendChild(row);
  }
  if (aff.bad.length) {
    const row = document.createElement('div');
    row.className = 'ta-row';
    row.innerHTML = `<span class="ta-lbl ta-bad-lbl">Bad with:</span>`
      + aff.bad.map(t => `<span class="ta-tag ta-bad" title="${fmtScore(t.score)}">${t.name}</span>`).join('');
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
    const selfDicts = MATCH.allies.map(n => srcBuild(n)?.values?.self_score).filter(Boolean);
    const teamAff   = computeTagAffinity(selfDicts, MATCH.enemies);
    const panel = document.createElement('div');
    panel.className = 'calc-panel ta-team-panel';
    panel.innerHTML = '<div class="calc-panel-title">Ally Team Tag Profile</div>';
    panel.appendChild(mkTagAffinityEl(teamAff));
    profileRow.appendChild(panel);
  }

  if (MATCH.enemies.length) {
    const enemyDicts = MATCH.enemies.map(n => srcBuild(n)?.values?.self_score).filter(Boolean);
    const enemyAff   = computeTagAffinity(enemyDicts, MATCH.allies);
    const panel = document.createElement('div');
    panel.className = 'calc-panel ta-team-panel';
    panel.innerHTML = '<div class="calc-panel-title">Enemy Team Tag Profile</div>';
    panel.appendChild(mkTagAffinityEl(enemyAff));
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

  // Per-hero tag affinity (compact, using top build)
  const topBuildData = r.topBuilds[0]
    ? MATCH.heroData[r.name]?.builds[r.topBuilds[0].buildIdx]
    : null;
  if (topBuildData) {
    const myEnemies = r.isEnemy ? MATCH.allies : MATCH.enemies;
    const aff = computeTagAffinity([topBuildData.values?.self_score], myEnemies);
    if (aff.good.length || aff.bad.length) {
      const taEl = mkTagAffinityEl(aff, true);
      taEl.classList.add('sc-tags');
      card.appendChild(taEl);
    }
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
      entries.forEach(([eName, score]) => {
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

  const myEnemies = r.isEnemy ? MATCH.allies : MATCH.enemies;
  r.builds.forEach(b => {
    const row = document.createElement('div');
    row.className = 'ch-build-row' + (b.isGeneral ? ' is-general' : '');
    row.innerHTML = `
      <span class="ch-bname">${b.name}</span>
      <span class="ch-score ally-clr">${fmtScore(b.ally)}</span>
      <span class="ch-score enemy-clr">${fmtScore(b.enemy)}</span>
      <span class="ch-score total-clr">${fmtScore(b.total)}</span>`;

    const buildData = MATCH.heroData[name]?.builds[b.buildIdx];
    if (buildData) {
      const aff = computeTagAffinity([buildData.values?.self_score], myEnemies);
      if (aff.good.length || aff.bad.length) {
        const taEl = mkTagAffinityEl(aff, true);
        taEl.classList.add('ch-ta-row');
        row.appendChild(taEl);
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
  el.appendChild(mkItemsPanel(b));
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
  const r         = MATCH.results.find(x => x.name === heroName);
  const buildData = MATCH.heroData[heroName]?.builds[buildIdx];
  const d         = document.createElement('div');
  d.className     = 'calc-panel';
  d.innerHTML     = '<div class="calc-panel-title">Tag Profile</div>';
  if (buildData) {
    const myEnemies = r?.isEnemy ? MATCH.allies : MATCH.enemies;
    const aff = computeTagAffinity([buildData.values?.self_score], myEnemies);
    d.appendChild(mkTagAffinityEl(aff));
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

function mkItemsPanel(b) {
  const d = document.createElement('div');
  d.className = 'calc-panel';
  d.innerHTML = '<div class="calc-panel-title">Item Recommendations</div>';

  const TABS = ['By Type', 'Total', 'Ally', 'Self', 'Not Rec'];
  const tabBar = document.createElement('div');
  tabBar.className = 'ci-tab-bar';
  const bodies = [];

  TABS.forEach((lbl, i) => {
    const btn  = document.createElement('button');
    btn.className = 'ci-tab' + (i === 0 ? ' active' : '');
    btn.textContent = lbl;
    const body = document.createElement('div');
    body.className = 'ci-body' + (i !== 0 ? ' hidden' : '');
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.ci-tab').forEach(x => x.classList.remove('active'));
      bodies.forEach(x => x.classList.add('hidden'));
      btn.classList.add('active');
      body.classList.remove('hidden');
    });
    tabBar.appendChild(btn);
    bodies.push(body);
  });
  d.appendChild(tabBar);
  bodies.forEach(body => d.appendChild(body));

  const sorted = [...b.items].sort((a, x) => x.total - a.total);

  // Tab 0: By Type
  ['Weapon', 'Vitality', 'Spirit'].forEach(cat => {
    const catItems = sorted.filter(it => it.category === cat && it.total > 0).slice(0, 10);
    if (!catItems.length) return;
    const sec = document.createElement('div');
    sec.className = 'it-cat-block';
    sec.innerHTML = `<div class="it-cat-hdr it-cat-${cat.toLowerCase()}">${cat}</div>`;
    catItems.forEach(it => sec.appendChild(mkItemRow(it, 'total')));
    bodies[0].appendChild(sec);
  });
  if (!bodies[0].children.length) bodies[0].innerHTML = '<div class="empty-msg">No positive-scoring items.</div>';

  // Tab 1-3
  const filterSort = (arr, key) => [...arr].sort((a, x) => x[key] - a[key]).filter(it => it[key] > 0).slice(0, 30);
  filterSort(b.items, 'total').forEach(it => bodies[1].appendChild(mkItemRow(it, 'total')));
  filterSort(b.items, 'ally').forEach(it  => bodies[2].appendChild(mkItemRow(it, 'ally')));
  filterSort(b.items, 'self').forEach(it  => bodies[3].appendChild(mkItemRow(it, 'self')));
  if (!bodies[1].children.length) bodies[1].innerHTML = '<div class="empty-msg">No items scored.</div>';
  if (!bodies[2].children.length) bodies[2].innerHTML = '<div class="empty-msg">No ally scores.</div>';
  if (!bodies[3].children.length) bodies[3].innerHTML = '<div class="empty-msg">No self scores.</div>';

  // Tab 4: Not Recommended
  const notRec = computeNotRec(b.items);
  if (notRec.length) notRec.forEach(it => bodies[4].appendChild(mkItemRow(it, 'self', true)));
  else bodies[4].innerHTML = '<div class="empty-msg">No items flagged.</div>';

  return d;
}

function computeNotRec(items) {
  const withSelf = items.filter(it => it.self > 0);
  if (!withSelf.length) return [];
  const maxSelf  = Math.max(...withSelf.map(it => it.self));
  const minSelf  = maxSelf * NOT_REC.selfMinPct;
  const byTotal  = [...items].sort((a, b) => b.total - a.total);
  const bySelf   = [...withSelf].sort((a, b) => b.self - a.self);

  if (NOT_REC.method === 'rank_diff') {
    return items.filter(it => {
      if (it.self < minSelf) return false;
      const tr = byTotal.findIndex(x => x.key === it.key);
      const sr = bySelf.findIndex(x => x.key === it.key);
      return sr >= 0 && (tr - sr) > NOT_REC.rankDiff;
    }).sort((a, b) => b.self - a.self);
  }
  // pct_threshold
  const topN   = Math.ceil(bySelf.length * NOT_REC.selfTopPct);
  const botN   = Math.floor(byTotal.length * NOT_REC.totalBotPct);
  const topSet = new Set(bySelf.slice(0, topN).map(x => x.key));
  return byTotal.slice(botN)
    .filter(it => topSet.has(it.key) && it.self >= minSelf)
    .sort((a, b) => b.self - a.self);
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
