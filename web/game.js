(() => {
  'use strict';

  const S = Settlement;
  const $ = id => document.getElementById(id);
  const assets = '../assets/project-x-v0.1/';
  const saveKey = 'project-x-settlement-foundation-v2';
  const goods = { food: 'Daging', grain: 'Gandum', wood: 'Kayu', scrap: 'Besi tua', stone: 'Batu' };
  const materialIcons = { food: 'food', grain: 'food', wood: 'wood', scrap: 'ingot', stone: 'stone' };
  const jobs = {
    forager: ['Pemburu', 'forager'], logger: ['Penebang', 'woodcutter'], scavenger: ['Pemulung', 'hauler'],
    miner: ['Penambang', 'miner'], builder: ['Pembangun', 'builder'],
    guard: ['Petarung pisau', 'guard'], hauler: ['Pengangkut', 'hauler'], farmer: ['Petani', 'forager'],
  };
  const names = {
    hall: 'Pusat permukiman', cabin: 'Hunian', garden: 'Kebun', warehouse: 'Gudang',
    workshop: 'Bengkel', tower: 'Menara jaga', wall: 'Tembok', rack: 'Rak pengering',
    axe: 'Kapak', pickaxe: 'Beliung', bow: 'Busur', knife: 'Pisau', saw: 'Gergaji', hoe: 'Cangkul',
    east: 'Timur', west: 'Barat', north: 'Utara', south: 'Selatan',
    build: 'Konstruksi', repair: 'Perbaikan', clear: 'Pembersihan', craft: 'Pembuatan alat', upgrade: 'Peningkatan',
  };
  const headings = { jobs: 'Profesi', status: 'Status permukiman', build: 'Bangun',
    tools: 'Alat', defense: 'Pertahanan', inspect: 'Petak', menu: 'Menu sesi' };
  let state = null;
  let saved = null;
  let storageMessage = '';
  let artMessage = '';
  try {
    const raw = localStorage.getItem(saveKey);
    if (raw) saved = S.restore(raw);
  } catch {
    storageMessage = 'Sesi lama gagal dibaca. Kamu dapat memulai sesi baru.';
  }
  const demo = S.create();
  let speed = 0;
  let active = '';
  let selection = '';
  let started = false;
  let previous = 0;
  let accumulator = 0;
  let uiTimer = 0;
  let saveTimer = 0;
  const map = makeSettlementMap($('map'));
  const icon = (file, cls = 'icon') => `<img class="${cls}" src="${assets}${file}.png" alt="">`;
  const button = (action, label, value = '', disabled = false, extra = '') =>
    `<button data-action="${action}" data-value="${value}" ${disabled ? 'disabled' : ''} ${extra}>${label}</button>`;
  const bar = (value, max, label, health = false) =>
    `<progress aria-label="${label}" value="${value}" max="${max}"${health ? ' class="health"' : ''}></progress>`;
  const cost = amounts => S.goods.filter(g => amounts[g]).map(g =>
    `<span title="${goods[g]}">${icon('ui/icons/' + materialIcons[g])} ${amounts[g]}</span>`).join('');
  const plotName = p => p.wall ? 'Tembok ' + names[p.id] : names[p.type] || 'Petak ' + (Number(p.id.slice(3)) + 1);
  const select = () => state && (S.get(state, selection) || state.deposits.find(d => d.id === selection));
  const pct = p => Math.ceil(p.hp);
  const clockText = value => String(Math.floor(value)).padStart(2, '0');

  function html(node, value) {
    if (node.dataset.current === value) return;
    const focused = node.contains(document.activeElement) ? document.activeElement.dataset : null;
    node.innerHTML = value;
    node.dataset.current = value;
    if (focused) [...node.querySelectorAll('button')].find(b =>
      b.dataset.action === focused.action && b.dataset.value === focused.value)?.focus({ preventScroll: true });
  }

  function save() {
    if (!state) return;
    saved = state;
    try {
      localStorage.setItem(saveKey, JSON.stringify(state));
      storageMessage = '';
    } catch {
      storageMessage = 'Browser tidak mengizinkan penyimpanan sesi.';
    }
  }

  function title() {
    $('title-screen').hidden = started;
    for (const id of ['hud', 'dock', 'brief']) $(id).hidden = !started;
    if (started) return;
    $('title-name').innerHTML = saved?.loss ? 'GAME<br><em>OVER</em>' : 'PROJECT<br><em>X</em>';
    document.querySelector('.subtitle').textContent = saved?.loss
      ? saved.loss + ' · Hari ' + S.day(saved) : 'BENTENG LEMBAH';
    html($('title-actions'), (saved && !saved.loss ? button('resume', 'Lanjutkan · Hari ' + S.day(saved)) : '') +
      button('new', icon('ui/buttons/play') + ' Mulai ekspedisi', '', false, 'class="primary"'));
  }

  function enter(s) {
    state = s;
    active = '';
    selection = '';
    speed = 0;
    accumulator = 0;
    started = true;
    save();
    title();
    render();
  }

  function getForecast() {
    const first = state.enemies[0];
    if (first) return 'SERANGAN · ' + names[first.target].toUpperCase() + ' · ' + state.enemies.length + ' ancaman';
    const next = S.nextWave(state);
    const days = 4 - state.lastWave % 4;
    return (next.large ? 'GELOMBANG BESAR' : 'SERANGAN MALAM') + ' · ' +
      names[next.side].toUpperCase() + ' · 20:00' + (next.large ? '' : ' · GELOMBANG BESAR ' + days + ' MALAM');
  }

  function roles() {
    const idle = S.count(state, '');
    const requirements = { builder: 'Butuh gergaji', miner: 'Butuh beliung', farmer: 'Butuh cangkul dan kebun', hauler: 'Pusat level 2' };
    return `<div class="role-summary">
      <strong>${icon('ui/icons/citizen')} ${idle} tidak ditugaskan</strong>
      <span>${state.workers.length}/${S.housing(state)} hunian
      ${bar(state.workers.length, S.housing(state) || 1, 'Kapasitas hunian')}</span>
      </div><div class="roles">${S.roles.map(role => {
      const [label, portrait] = jobs[role];
      const n = S.count(state, role);
      const limit = S.roleLimit(state, role);
      return `<article class="role-card${limit ? '' : ' locked'}"><h3>${label}</h3>${icon('portraits/' + portrait, 'portrait')}
        ${!limit && !n ? `<div class="lock-note">${icon('ui/buttons/locked')} ${requirements[role]}</div>` : `
        <div class="role-controls">
          ${button('less', icon('ui/buttons/subtract'), role, !n, `aria-label="Kurangi ${label}"`)}
          <strong>${n}</strong>
          ${button('more', icon('ui/buttons/add'), role, !idle || n >= limit, `aria-label="Tambah ${label}"`)}
        </div>`}</article>`;
    }).join('')}</div>`;
  }

  function status() {
    const hungry = state.workers.filter(w => w.hungry).length;
    return `<div class="status-grid"><div class="list">${S.goods.map(g => {
      const amount = S.total(state, g);
      const max = S.stores(state).reduce((sum, p) => sum + S.capacity(p, g), 0);
      const destination = S.get(state, state.destinations[g]);
      const source = S.source(state, g);
      return `<div class="status-row">${icon('ui/icons/' + materialIcons[g])}<div>
        <strong>${goods[g]} <span>${amount} / ${max}</span></strong>${bar(amount, max || 1, goods[g])}
        <small>${source?.quantity ? 'Deposit ' + source.quantity + ' tersisa' : 'Perlu sumber baru'}
        · ${destination?.type ? plotName(destination) : 'Atur penyimpanan'}</small>
      </div></div>`;
    }).join('')}</div><div class="list">
      <div class="status-row">${icon('ui/icons/citizen')}<div><strong>${state.workers.length} warga</strong>
        <small>${state.workers.length - hungry} diberi makan · ${hungry} kelaparan</small></div></div>
      <div class="status-row">${icon('ui/icons/sun')}<div><strong>${state.nights} malam terlewati</strong>
        <small>${state.enemies.length ? state.enemies.length + ' musuh terlihat' : 'Peta aman saat ini'}</small></div></div>
      <div class="status-row"><div><strong>Distribusi</strong><small>${state.delivered} bahan masuk gudang · ${state.built} bangunan baru</small></div></div>
      </div></div>`;
  }

  function defense() {
    const reserves = S.count(state, 'guard') - S.sides.reduce((n, side) => n + state.posts[side], 0);
    return `<p>${S.count(state, 'guard')} petarung · ${reserves} cadangan</p>
      <p><small>Bagikan petarung ke sisi tembok. Gunakan peringatan arah serangan di peta.</small></p>
      <div class="defense-grid">${S.sides.map(side => {
      const p = S.get(state, side);
      return `<div class="lot"><div><strong>${plotName(p)}</strong>
        <small> HP ${pct(p)}/${p.max}</small>${bar(p.hp, p.max || 1, 'HP ' + plotName(p), true)}</div>
        <div class="wall-crew">${button('post-less', '−', side, !state.posts[side], `aria-label="Tarik petarung ${names[side]}"`)}
        <strong>${state.posts[side]}</strong>
        ${button('post-more', '+', side, !reserves || !S.efficiency(p), `aria-label="Tempatkan petarung ${names[side]}"`)}
        ${button('pick', 'Lihat', side)}</div></div>`;
      }).join('')}</div>`;
  }

  function tools() {
    const shops = state.plots.filter(p => p.type === 'workshop' && S.efficiency(p));
    const level = Math.max(0, ...shops.map(p => p.level));
    const pending = state.plots.find(p => p.job?.action === 'craft');
    return `<p>${level ? 'Bahan diantar ke bengkel. Warga cadangan atau pembangun mengerjakan pesanan.' :
      'Bangun bengkel agar resep awal terbuka.'}</p>
      <div class="list actions">${Object.entries(S.recipes).map(([id, recipe]) => {
      const ready = shops.some(p => p.level >= recipe.level && !p.job);
      return `<article class="recipe"><span class="cost">${cost(recipe.cost)}</span><span class="arrow">➜</span>
        <div>${icon('ui/icons/' + recipe.icon)} <strong>${names[id]} ×${state.tools[id]}</strong>
        <br><small>${jobs[recipe.role][0]}</small></div>
        ${button('craft', ready ? 'Buat' : level < recipe.level ? 'Bengkel Lv ' + recipe.level : 'Sibuk',
          id, !ready, 'class="primary"')}</article>`;
      }).join('')}</div>
      ${pending ? `<p>${button('pick', 'Lihat pesanan', pending.id)}</p>` : ''}`;
  }

  function build() {
    return `<p>Pilih kotak kosong pada grid untuk membangun, atau gunakan daftar ini. Warga cadangan mengerjakan proyek awal.</p><div class="actions">
      ${state.plots.filter(p => !p.type || p.job).map(p => button('pick', plotName(p), p.id)).join('')}
      </div>`;
  }

  function inspect(item) {
    if (!item) return build();
    if (item.good) {
      const assigned = state.sources[item.good] === item.id;
      return `<p>${icon('ui/icons/' + materialIcons[item.good])} ${goods[item.good]} · ${item.quantity}/${item.max}</p>
        ${bar(item.quantity, item.max, 'Cadangan deposit')}
        <div class="actions">${button('source', assigned ? 'Sumber aktif' : 'Jadikan sumber', item.id, !item.quantity || assigned)}
        ${['food', 'wood'].includes(item.good) ? button('renew', 'Pulihkan · 3 daging', item.id, item.quantity === item.max || S.total(state, 'food') < 3) : ''}</div>`;
    }
    const p = item;
    let result = p.type ? `<p>HP ${pct(p)}/${p.max} · Level ${p.level}
      ${p.hp === 0 ? '· Reruntuhan' : S.efficiency(p) ? '' : '· Operasional berhenti'}</p>${bar(p.hp, p.max, 'HP bangunan', true)}` : '';
    if (p.job) {
      const j = p.job;
      const missing = Object.fromEntries(S.goods.map(g => [g, Math.max(0, (j.cost[g] || 0) - j.received[g])]));
      const awaiting = cost(missing);
      return result + `<p>${names[j.action]} ${names[j.type] || ''} · ${Math.floor(100 * j.done / j.work)}%</p>
        ${bar(j.done, j.work, 'Progres pekerjaan')}
        <p>${awaiting ? 'Menunggu bahan <span class="cost">' + awaiting + '</span>' :
          'Bahan siap. Pekerjaan berjalan saat pembangun tiba.'}</p>
        <div class="actions">${button('crew', 'Regu: ' + j.crew, p.id)}
        ${button('priority', state.priority === p.id ? 'Prioritas aktif' : 'Prioritaskan', p.id)}
        ${button('cancel', 'Batalkan', p.id)}</div>`;
    }
    if (!p.type) {
      return `<div class="list">${Object.entries(S.plans).filter(([type]) => p.wall === (type === 'wall')).map(([type, plan]) =>
        `<div class="lot"><div><strong>${names[type]}</strong><br><small>${({ rack: 'Kapasitas daging +5', cabin: 'Kapasitas warga +3', warehouse: 'Kapasitas material +50 per jenis', workshop: 'Buka resep alat level 1', garden: 'Menanam dan memanen gandum', tower: 'Pos menara', wall: 'Pulihkan sektor tembok' })[type]}</small>
        <br><span class="cost">${cost(plan.cost)}</span></div>
        ${button('build', (plan.level || 1) > S.get(state, 'hall').level ? 'Pusat Lv ' + plan.level : 'Bangun ' + names[type], type,
          (plan.level || 1) > S.get(state, 'hall').level, 'class="primary"')}</div>`).join('')}</div>`;
    }
    if (p.stock) {
      result += `<p>${S.goods.map(g => goods[g] + ' ' + p.stock[g] + '/' + S.capacity(p, g)).join(' · ')}</p>
        <div class="actions">${S.goods.map(g => button('destination', 'Terima ' + goods[g].toLowerCase(), g,
          !S.efficiency(p) || !S.capacity(p, g) || state.destinations[g] === p.id)).join('')}</div>`;
    }
    const crop = state.deposits.find(d => d.id === p.id + '-crop');
    if (crop && p.hp) result += `<p>Gandum ${crop.quantity}/${crop.max}</p>` +
      bar(crop.quantity ? 60 : crop.growth, 60, 'Pertumbuhan gandum');
    const upgradeable = p.level === 1 && S.efficiency(p) && (p.id === 'hall' ||
      ((p.stock || p.type === 'workshop') && S.get(state, 'hall').level >= 2));
    if (p.level === 1 && p.id === 'hall') result += '<p><small>Level 2 · hunian 5 → 10 · kayu 150 → 300 · besi tua 20 → 40 · buka kebun.</small></p>';
    if (p.level === 1 && p.type === 'workshop') result += '<p><small>Level 2 · buka gergaji, beliung, dan cangkul · perlu Pusat Lv 2.</small></p>';
    const actions = [
      p.hp && p.hp < p.max ? button('repair', 'Perbaiki · ' + Math.ceil((p.max - p.hp) / 18) + ' kayu', p.id) : '',
      upgradeable ? button('upgrade', 'Tingkatkan · ' + (p.id === 'hall' ? 200 : 80) + ' kayu', p.id) : '',
      p.id !== 'hall' && (!p.hp || !p.wall && !p.stock) ? button('clear', p.hp ? 'Bongkar' : 'Bersihkan', p.id) : '',
      p.wall ? button('defense', 'Atur petarung') : '',
      S.efficiency(p) && crop ? button('source', 'Jadikan kebun aktif', crop.id, state.sources.grain === crop.id) : '',
    ].join('');
    return result + `<div class="actions">${actions}</div>`;
  }

  function render() {
    if (!started) return;
    const h = S.hour(state);
    const time = clockText(h) + ':' + clockText(h % 1 * 60);
    html($('hud'), `<div class="hud-item clock">${icon('ui/icons/' + (S.night(state) ? 'moon' : 'sun'))}
      <div>HARI ${S.day(state)}<small>${time} · ${S.night(state) ? 'MALAM' : 'SIANG'}</small></div></div>
      <div class="hud-item" aria-label="Warga">${icon('ui/icons/citizen')} <span>${state.workers.length}</span></div>
      ${S.goods.map(g => `<div class="hud-item" aria-label="${goods[g]}" title="${goods[g]}">
        ${icon('ui/icons/' + materialIcons[g])} <span>${S.total(state, g)}</span></div>`).join('')}`);
    $('forecast').textContent = getForecast();
    let guide = '';
    if (!state.lastWave && !state.enemies.length) {
      if (!S.count(state, 'forager')) guide = 'jobs';
      else if (S.count(state, 'guard') && !state.posts[S.nextWave(state).side]) guide = 'defense';
      else if (!state.built && !state.plots.some(p => p.job)) guide = 'build';
    }
    const tip = { jobs: 'Buka Profesi dan tugaskan pemburu.', defense: 'Buka Jaga dan tempatkan petarung di sisi yang diperingatkan.',
      build: 'Klik kotak kosong pada grid. Sisakan warga cadangan untuk membangun.' }[guide];
    const message = [tip || state.message, storageMessage, artMessage].filter(Boolean).join(' ');
    if ($('notice').textContent !== message) $('notice').textContent = message;
    for (const b of $('dock').querySelectorAll('[data-panel]')) {
      b.setAttribute('aria-expanded', String(b.dataset.panel === active));
      b.toggleAttribute('data-guide', b.dataset.panel === guide && b.dataset.panel !== active);
    }
    for (const b of $('dock').querySelectorAll('[data-speed]')) b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === speed));
    $('panel').hidden = !active;
    $('panel').classList.toggle('compact', active === 'inspect' || active === 'menu');
    if (!active) return;
    const item = select();
    $('panel-title').textContent = active === 'inspect' && item
      ? item.good ? 'Deposit ' + goods[item.good] : plotName(item)
      : headings[active];
    const content = {
      jobs: roles, status, defense, tools, build, inspect: () => inspect(item),
      menu: () => '<p>Sesi disimpan otomatis di browser. Waktu berhenti saat tab ditinggalkan.</p><div class="actions">' +
        button('save', 'Simpan') + button('title', 'Ke layar judul') + button('new', 'Sesi baru') + '</div>',
    };
    html($('panel-content'), content[active]());
  }

  function openPanel(name, id = '') {
    active = name;
    selection = id;
    $('panel-content').scrollTop = 0;
    render();
  }

  function newGame() {
    if (!saved || saved.loss) enter(S.create());
    else {
      $('confirm').dataset.speed = speed;
      speed = 0;
      render();
      $('confirm').showModal();
    }
  }

  document.addEventListener('click', event => {
    const b = event.target.closest('button');
    if (!b) return;
    const { panel, speed: rate, action, value } = b.dataset;
    if (action === 'resume') return enter(saved);
    if (action === 'new') return newGame();
    if (!started) return;
    if (panel) return openPanel(active === panel ? '' : panel);
    if (rate !== undefined) {
      speed = Number(rate);
      save();
      render();
      return;
    }
    if (!action) return;
    const p = S.get(state, value);
    const d = state.deposits.find(deposit => deposit.id === value);
    if (action === 'pick') return openPanel('inspect', value);
    if (action === 'defense') return openPanel('defense');
    if (action === 'title') {
      save();
      speed = 0;
      active = '';
      started = false;
      $('panel').hidden = true;
      title();
      return;
    }
    if (action === 'more' || action === 'less') S.assign(state, value, action === 'more' ? 1 : -1);
    if (action === 'source' && d && (d.quantity || d.good === 'grain')) {
      state.sources[d.good] = d.id;
      state.message = goods[d.good] + ' kini dikumpulkan dari sumber pilihan.';
    }
    if (action === 'renew' && d && d.good !== 'stone' && S.total(state, 'food') >= 3) {
      let needed = 3;
      for (const store of S.stores(state)) {
        const spent = Math.min(needed, store.stock.food);
        store.stock.food -= spent;
        needed -= spent;
      }
      d.quantity = Math.min(d.max, d.quantity + 24);
    }
    if (action === 'destination' && select()?.stock) state.destinations[value] = selection;
    if (action === 'post-more' || action === 'post-less') S.postGuard(state, value, action === 'post-more' ? 1 : -1);
    if (action === 'build') S.order(state, selection, 'build', value);
    if (['repair', 'upgrade', 'clear'].includes(action)) S.order(state, value, action);
    if (action === 'craft') {
      const shop = state.plots.find(p => p.type === 'workshop' && S.efficiency(p) && !p.job && p.level >= S.recipes[value]?.level);
      if (shop) S.order(state, shop.id, 'craft', value);
    }
    if (action === 'crew' && p?.job) p.job.crew = p.job.crew === 2 ? 1 : 2;
    if (action === 'priority' && p?.job) state.priority = state.priority === p.id ? null : p.id;
    if (action === 'cancel' && p) S.cancel(state, p);
    if (action === 'save') state.message = 'Sesi disimpan.';
    save();
    render();
  });

  $('close-panel').addEventListener('click', () => openPanel(''));
  $('cancel-confirm').addEventListener('click', () => $('confirm').close('cancel'));
  $('new-game').addEventListener('click', () => {
    $('confirm').close('new');
    enter(S.create());
  });
  $('confirm').addEventListener('close', () => {
    if ($('confirm').returnValue !== 'new' && started) speed = Number($('confirm').dataset.speed);
    $('confirm').returnValue = '';
    render();
  });
  document.addEventListener('keydown', event => {
    if (!started || $('confirm').open || event.target.matches('button, select')) return;
    if (event.code === 'Space') {
      event.preventDefault();
      speed = speed ? 0 : 1;
      render();
    }
    if (event.key === 'Escape' && active) openPanel('');
  });
  const canvas = $('map');
  let pointer = null;
  canvas.addEventListener('pointerdown', event => {
    if (!started) return;
    pointer = { x: event.clientX, y: event.clientY, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.moved && Math.hypot(dx, dy) < 5) return;
    map.move(dx, dy);
    pointer = { x: event.clientX, y: event.clientY, moved: true };
  });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('pointerup', event => {
    if (pointer && !pointer.moved) {
      const at = map.coords(event.clientX, event.clientY);
      const tile = S.plotAt(state, at.x, at.y);
      const options = [...state.plots.filter(p => p.wall), ...state.deposits.filter(d => d.good !== 'grain')];
      const distance = item => Math.hypot(at.x - item.x, at.y - item.y);
      options.sort((a, b) => distance(a) - distance(b));
      if (tile) openPanel('inspect', tile.id);
      else if (distance(options[0]) < 1.2) openPanel('inspect', options[0].id);
      else openPanel('');
    }
    pointer = null;
  });
  canvas.addEventListener('wheel', event => {
    if (!started) return;
    event.preventDefault();
    map.zoomBy(event.deltaY < 0 ? .15 : -.15);
  }, { passive: false });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && started) {
      speed = 0;
      save();
      render();
    }
  });
  window.addEventListener('pagehide', () => { if (started) save(); });
  map.loaded.then(results => {
    if (results.some(r => r.status === 'rejected')) artMessage = 'Sebagian aset gagal dimuat. Ekstrak seluruh paket.';
  });

  function frame(now) {
    const elapsed = Math.min(.12, (now - previous) / 1000);
    previous = now;
    if (started && speed && !document.hidden && !$('confirm').open) {
      accumulator += elapsed * speed;
      while (accumulator >= .12 && !state.loss) {
        S.advance(state, .12);
        accumulator -= .12;
      }
      if (now - saveTimer > 900) {
        save();
        saveTimer = now;
      }
      if (state.loss) {
        save();
        started = false;
        speed = 0;
        $('panel').hidden = true;
        title();
      }
    }
    if (now - uiTimer > 150) {
      render();
      uiTimer = now;
    }
    map.draw(started ? state : demo, started ? select() : null, !started, now);
    requestAnimationFrame(frame);
  }
  title();
  requestAnimationFrame(frame);
})();
