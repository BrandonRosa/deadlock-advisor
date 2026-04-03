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
