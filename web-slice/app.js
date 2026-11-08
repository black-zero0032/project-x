(() => {
  'use strict';
  const E = Outpost;
  const $ = id => document.getElementById(id);
  const key = 'project-x-benteng-lembah-v1';
  const labels = {
    food: 'Pangan', wood: 'Kayu', stone: 'Batu', core: 'Pusat peradaban', wall: 'Tembok timur',
    house: 'Hunian', farm: 'Kebun', store: 'Gudang', tower: 'Pos jaga', '': 'Petak kosong'
  };
  const assetRoot = '../assets/project-x-v0.1/';
  const professions = {
    food: ['Pengumpul pangan', 'forager'], wood: ['Penebang', 'woodcutter'],
    stone: ['Penambang', 'miner'], builder: ['Pembangun', 'builder'],
    guard: ['Penjaga', 'guard'], porter: ['Pengangkut', 'hauler']
  };
  const structures = { core: 'hut', house: 'hut', farm: 'garden', store: 'warehouse', tower: 'watchtower' };
  const sprites = {};
  const spritePaths = [
    'tiles/grass', 'tiles/road', 'world/tree-large', 'world/tree-small', 'world/stone',
    'world/stump', 'world/rubble', 'world/wall-intact', 'world/wall-damaged',
    'world/hut', 'world/garden', 'world/warehouse', 'world/watchtower',
    'citizens/idle', 'citizens/carrier', 'citizens/guard', 'threats/mutant'
  ];
  let missingArt = false;
  let state = E.create();
  let saved = false;
  let storageAvailable = true;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      state = E.restore(raw);
      saved = true;
    }
  } catch {
    storageAvailable = false;
  }
  let speed = 0;
  let selection = 'p0';
  let zoom = false;
  let tutorial = true;
  const canvas = $('world');
  const ctx = canvas.getContext('2d');
  const screen = { x: 0, y: 0, scale: 1 };
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const random = (x, y) => ((Math.imul(x + 59, 73856093) ^ Math.imul(y + 17, 19349663)) >>> 0) % 101;

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
  }

  function sprite(name, x, y, width, height, context = ctx) {
    const image = sprites[name];
    if (!image) return;
    const scale = Math.min(width / image.width, height / image.height);
    const w = Math.max(1, Math.round(image.width * scale));
    const h = Math.max(1, Math.round(image.height * scale));
    context.drawImage(image, Math.round(x - w / 2), Math.round(y - h), w, h);
  }

  function meter(x, y, width, value, max, color) {
    rect(x, y, width, 3, '#382923');
    rect(x, y, Math.ceil(width * value / max), 3, color);
  }

  const landscape = document.createElement('canvas');
  landscape.width = canvas.width;
  landscape.height = canvas.height;
  function paintLandscape() {
    const land = landscape.getContext('2d');
    function terrain(name, fallback) {
      const image = sprites[name];
      if (!image) return fallback;
      const tile = document.createElement('canvas');
      tile.width = tile.height = 32;
      const tileContext = tile.getContext('2d');
      tileContext.imageSmoothingEnabled = false;
      tileContext.drawImage(image, 0, 0, 32, 32);
      return land.createPattern(tile, 'repeat');
    }
    const grass = terrain('tiles/grass', '#667743');
    const road = terrain('tiles/road', '#8a7250');
    land.fillStyle = grass;
    land.fillRect(0, 0, landscape.width, landscape.height);
    for (let y = 0; y < landscape.height; y += 2) {
      const bank = 20 + Math.round(Math.sin(y / 31) * 10);
      land.fillStyle = '#53684f';
      land.fillRect(0, y, bank + 4, 2);
      land.fillStyle = '#2c5356';
      land.fillRect(0, y, bank, 2);
    }
    land.fillStyle = road;
    land.fillRect(68, 105, 263, 10);
    land.fillRect(184, 54, 13, 121);
    land.imageSmoothingEnabled = false;
    for (let y = 20; y < 253; y += 13) {
      for (let x = 38; x < landscape.width; x += 14) {
        const roll = random(x, y);
        if ((x < 65 || x > 386 || y < 35 || y > 212) && roll > 33) {
          sprite(roll > 64 ? 'world/tree-large' : 'world/tree-small',
            x + roll % 5, y, 25, 25, land);
        }
      }
    }
  }
  paintLandscape();

  function building(p) {
    const x = p.x * 16, y = p.y * 16;
    if (p.type === 'wall') return;
    if (p.job?.action === 'build' || !p.type) {
      rect(x - 13, y - 9, 26, 19, p.job ? '#806e4d' : '#617241');
      ctx.strokeStyle = p.job ? '#ffc86a' : '#a8b87a';
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(x - 12.5, y - 8.5, 25, 17);
      ctx.setLineDash([]);
    } else if (!p.hp) {
      sprite('world/rubble', x, y + 8, 27, 19);
    } else {
      const size = p.type === 'core' ? 38 : 29;
      sprite('world/' + structures[p.type], x, y + 8, size, size);
      if (p.type === 'core') rect(x - 2, y + 3, 5, 3, '#ffd37c');
      if (p.hp < p.max) meter(x - 12, y + 11, 24, p.hp, p.max, '#d98366');
    }
    if (p.job) meter(x - 12, y + 15, 24, p.job.done, p.job.work, '#ffcc54');
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    screen.scale = zoom ? 1.47 : 1;
    screen.x = zoom ? 73 : 0;
    screen.y = zoom ? 33 : 0;
    ctx.setTransform(screen.scale, 0, 0, screen.scale, -screen.x * screen.scale, -screen.y * screen.scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(landscape, 0, 0);
    const wall = state.plots[1];
    if (wall.hp) {
      for (let x = 122; x <= 300; x += 16) {
        sprite('world/wall-intact', x, 54, 17, 10);
        sprite('world/wall-intact', x, 186, 17, 10);
      }
      for (let y = 63; y < 185; y += 7) {
        if (y < 104 || y > 122) sprite('world/wall-intact', 113, y, 10, 7);
        if (y < 102 || y > 124) sprite('world/wall-intact', 304, y, 10, 7);
      }
      sprite(wall.hp > 30 ? 'world/wall-intact' : 'world/wall-damaged', 304, 120, 29, 22);
      meter(292, 123, 24, wall.hp, wall.max, '#df9362');
    } else {
      sprite('world/rubble', 304, 120, 27, 19);
    }
    if (wall.job) meter(292, 127, 24, wall.job.done, wall.job.work, '#ffcc54');
    for (const d of state.deposits) {
      const x = d.x * 16, y = d.y * 16;
      if (d.kind === 'wood') {
        sprite(d.left ? 'world/tree-large' : 'world/stump', x, y + 6, 26, 27);
      } else if (d.kind === 'stone' && d.left) {
        sprite('world/stone', x, y + 6, 23, 19);
      } else {
        rect(x - 8, y - 5, 16, 11, '#4d5e30');
        if (d.left) {
          for (let i = -6; i <= 6; i += 3) rect(x + i, y - random(i, d.y) % 5, 2, 3, '#e2a568');
        }
      }
      meter(x - 8, y + 8, 16, d.left, d.max, '#e1b168');
    }
    state.plots.forEach(building);
    for (const w of [...state.workers].sort((a, b) => a.y - b.y)) {
      const x = w.x * 16 + (w.id % 3 - 1) * 5;
      const y = w.y * 16 + 6 + w.id % 4;
      const appearance = w.cargo ? 'carrier' : w.role === 'guard' ? 'guard' : 'idle';
      sprite('citizens/' + appearance, x, y, 16, 17);
    }
    for (const e of state.enemies) {
      const x = e.x * 16 + e.id % 3, y = e.y * 16 + e.id % 4;
      sprite('threats/mutant', x, y + 6, 19, 17);
    }
    if (E.night(state)) {
      rect(0, 0, 432, 240, '#17244975');
      for (const p of state.plots.filter(p => p.hp && ['core', 'tower', 'wall'].includes(p.type))) {
        rect(p.x * 16 - 2, p.y * 16 - 7, 5, 5, '#f7c680');
      }
    }
    const item = selected();
    if (item) {
      ctx.strokeStyle = '#ffe19a';
      ctx.lineWidth = 1;
      ctx.strokeRect(item.x * 16 - 14.5, item.y * 16 - 13.5, 29, 26);
    }
  }

  const selected = () => (selection[0] === 'p' ? state.plots : state.deposits)[Number(selection.slice(1))];
  const money = cost => E.goods.filter(g => cost[g]).map(g => `${cost[g]} ${labels[g].toLowerCase()}`).join(' · ');
  const button = (action, name, value = '', disabled = false) =>
    `<button data-action="${action}" data-value="${value}" ${disabled || state.loss ? 'disabled' : ''}>${name}</button>`;

  function replace(node, html) {
    if (node.dataset.render === html) return;
    const focused = node.contains(document.activeElement) ? document.activeElement.dataset : null;
    node.innerHTML = html;
    node.dataset.render = html;
    if (focused) {
      [...node.querySelectorAll('button')].find(b =>
        b.dataset.action === focused.action && b.dataset.value === focused.value &&
        b.dataset.role === focused.role && b.dataset.delta === focused.delta)?.focus();
    }
  }

  function inspect() {
    const item = selected();
    const id = Number(selection.slice(1));
    if (selection[0] === 'd') {
      const used = state.sources[item.kind] === id && !state.stalled[item.kind];
      const status = item.left ? (used ? 'Aktif' : 'Belum ditugaskan') : 'Habis';
      return `<h2>Deposit ${labels[item.kind]}</h2><p>${item.left}/${item.max} unit · ${status}</p>` +
        button('source', 'Tugaskan pengumpul', '', !item.left || used) +
        (item.kind !== 'stone' ? button('replant', 'Tanam ulang · 4 pangan', '', item.left === item.max || state.plots[0].stock.food < 4) : '');
    }
    const p = item;
    let html = `<h2>${labels[p.type]}${p.type ? ` · Lv ${p.level}` : ''}</h2>`;
    if (p.type) html += `<p>HP ${p.hp}/${p.max}${p.hp === 0 ? ' · reruntuhan' : E.efficiency(p) === 0 ? ' · berhenti' : ''}</p>
      <progress class="health" aria-label="HP bangunan" value="${p.hp}" max="${p.max}"></progress>`;
    if (p.stock) {
      html += `<p>${E.goods.map(g => `${labels[g]} ${p.stock[g]}/${E.capacity(p, g)}`).join(' · ')}</p>`;
      html += E.goods.map(g => button('destination', `Taruh ${labels[g].toLowerCase()} di sini`, g,
        !E.efficiency(p) || state.destinations[g] === id)).join('');
    }
    if (p.job) {
      const j = p.job;
      const missing = Object.fromEntries(E.goods.map(g => [g, (j.cost[g] || 0) - j.delivered[g]]));
      const wait = money(missing);
      return html + `<p>${labels[j.type] || 'Pekerjaan'} · ${Math.floor(j.done * 100 / j.work)}%</p>
        <progress aria-label="Progres proyek" value="${j.done}" max="${j.work}"></progress>
        <p>${wait ? 'Menunggu kiriman ' + wait : 'Bahan siap. Pembangun mengerjakan proyek saat tiba.'}</p>
        <p>Regu: ${j.crew ?? 'otomatis'} · ${state.preferred === id ? 'prioritas tinggi' : 'prioritas normal'}</p>` +
        button('crew', 'Ubah jumlah regu') + button('priority', 'Ubah prioritas') + button('cancel', 'Batalkan proyek');
    }
    if (!p.type) {
      html += '<p>Pilih bangunan. Pembangun mengantar bahan sebelum mulai bekerja.</p>';
      return html + Object.entries(E.plans).filter(([type]) => (id === 1) === (type === 'wall')).map(([type, plan]) =>
        button('build', `${labels[type]} · ${money(plan.cost)}`, type)).join('');
    }
    if (p.hp < p.max && p.hp > 0) html += button('repair', `Perbaiki · ${Math.ceil((p.max - p.hp) / 14)} kayu`);
    if (p.hp && p.level === 1 && ['core', 'store', 'tower'].includes(p.type)) html += button('upgrade', 'Tingkatkan · 10 kayu, 5 batu');
    if ((p.hp === 0 && id !== 0) || (p.hp && ['house', 'farm', 'tower'].includes(p.type))) {
      html += button('clear', p.hp ? 'Bongkar' : 'Bersihkan reruntuhan');
    }
    if (['wall', 'tower'].includes(p.type) && E.efficiency(p)) html += button('post', 'Tempatkan penjaga', '', state.post === id);
    if (p.type === 'farm' && E.efficiency(p)) html += button('farm', 'Tugaskan pengumpul pangan', '', state.sources.food === -id);
    return html;
  }

  function render() {
    for (const g of E.goods) $(g).textContent = E.stock(state, g);
    $('people').textContent = state.workers.length;
    $('clock').textContent = `HARI ${E.day(state)} · ${E.night(state) ? 'MALAM' : 'SIANG'} · ${Math.floor(E.phase(state) * 24 / 84).toString().padStart(2, '0')}:00`;
    const blocked = E.goods.filter(g => state.stalled[g] && E.count(state, g)).map(g => `${E.count(state, g)} ${labels[g].toLowerCase()}`);
    const full = E.goods.filter(g => E.count(state, g) && !state.stalled[g] && !E.room(state.plots[state.destinations[g]], g));
    const alert = [state.notice, blocked.length ? `Menunggu deposit baru: ${blocked.join(', ')}.` : '',
      full.length ? `Gudang tujuan penuh atau nonaktif: ${full.map(g => labels[g]).join(', ')}.` : '',
      storageAvailable ? '' : 'Simpan otomatis tidak tersedia di browser ini.',
      missingArt ? 'Sebagian aset peta gagal dimuat. Periksa folder assets.' : ''].filter(Boolean).join(' ');
    if ($('notice').textContent !== alert) $('notice').textContent = alert;
    const idle = E.count(state, '');
    $('idle').textContent = `${idle} cadangan`;
    replace($('roles'), E.roles.map(r => `<div class="role"><span><img class="portrait" src="${assetRoot}portraits/${professions[r][1]}.png" alt="">${professions[r][0]}</span>
      <button data-role="${r}" data-delta="-1" aria-label="Kurangi ${professions[r][0]}" ${!E.count(state, r) || state.loss ? 'disabled' : ''}>−</button>
      <strong>${E.count(state, r)}</strong>
      <button data-role="${r}" data-delta="1" aria-label="Tambah ${professions[r][0]}" ${!idle || state.loss ? 'disabled' : ''}>+</button></div>`).join(''));
    replace($('target'), state.plots.map((p, i) => `<option value="p${i}">${i + 1} · ${labels[p.type]}${p.job ? ' (proyek)' : ''}</option>`).join('') +
      state.deposits.map((d, i) => `<option value="d${i}">Deposit ${labels[d.kind]} ${i < 3 ? 'A' : 'B'}${d.left ? '' : ' (habis)'}</option>`).join(''));
    $('target').value = selection;
    replace($('inspect'), inspect());
    $('tutorial').hidden = !tutorial;
    let step = 0;
    let title = 'Siapkan regu';
    let line = 'Tugaskan 2 pengumpul pangan, 1 penebang, 1 penambang, dan 2 penjaga. Sisakan 2 warga untuk membangun.';
    if (E.count(state, 'food') >= 2 && E.count(state, 'wood') && E.count(state, 'stone') && E.count(state, 'guard') >= 2) {
      step = 1;
      title = 'Mulai pengumpulan';
      line = 'Tekan 1×. Lihat pekerja membawa hasil dari deposit menuju pusat peradaban.';
    }
    if (state.history.firstDelivery) {
      step = 2;
      title = 'Buka petak pembangunan';
      line = 'Tugaskan 2 pembangun, pilih petak kosong, lalu pesan Kebun. Tunggu pekerja membawa bahan dan menyelesaikannya.';
    }
    if (state.history.built) {
      step = 3;
      title = 'Tahan serangan pertama';
      line = 'Siapkan minimal dua penjaga di tembok awal. Serangan datang dari timur menjelang malam. Perbaiki tembok setelah serangan.';
    }
    if (state.nights) {
      step = 4;
      title = state.milestone ? 'Tiga malam terlewati' : 'Bangun cadangan';
      line = state.milestone ? 'Target playtest tercapai. Serangan terus meningkat jika kamu melanjutkan.' :
        'Pilih Kebun untuk pengumpul. Bangun Pos jaga, lalu pilih “Tempatkan penjaga” di pos itu. Tambah Gudang bila stok penuh.';
    }
    $('step').textContent = `LANGKAH 0${step + 1} / 05`;
    $('lesson').textContent = title;
    $('instruction').textContent = line;
    for (const b of document.querySelectorAll('[data-speed]')) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === speed));
      b.disabled = Boolean(state.loss);
    }
    draw();
  }

  function menu(mode) {
    speed = 0;
    const start = mode === 'start';
    const dead = mode === 'dead';
    $('menu-title').textContent = dead ? 'Permukiman runtuh' : start ? 'Pos terakhir di lembah' : 'Mulai sesi baru?';
    $('menu-text').textContent = dead ? state.loss : start ?
      'Pimpin regu penyintas. Kumpulkan bahan, jaga tembok, dan bertahan sampai fajar ketiga.' :
      'Sesi aktif akan diganti. Kamu bisa kembali untuk melanjutkan.';
    $('resume').hidden = dead;
    $('resume').textContent = start ? saved ? 'Lanjutkan sesi tersimpan' : 'Mulai ekspedisi' : 'Kembali';
    $('confirm-new').hidden = start && !saved;
    if (!$('menu').open) $('menu').showModal();
    render();
  }

  function change() {
    save();
    render();
  }

  $('roles').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b && E.setRole(state, b.dataset.role, Number(b.dataset.delta))) change();
  });
  $('inspect').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || state.loss) return;
    const { action, value } = b.dataset;
    const id = Number(selection.slice(1));
    const p = selected();
    if (action === 'source') E.assignSource(state, id);
    else if (action === 'replant') E.replant(state, id);
    else if (action === 'destination') {
      state.destinations[value] = id;
      for (const w of state.workers) {
        if (w.cargo?.gathered && w.cargo.g === value) w.cargo.to = id;
      }
    } else if (action === 'post') state.post = id;
    else if (action === 'farm') {
      state.sources.food = -id;
      delete state.stalled.food;
    } else if (action === 'crew') {
      const crews = [null, 0, 1, 2, 3];
      p.job.crew = crews[(crews.indexOf(p.job.crew) + 1) % crews.length];
    } else if (action === 'priority') state.preferred = state.preferred === id ? null : id;
    else if (action === 'cancel') E.cancel(state, id);
    else E.order(state, id, action, value);
    change();
  });
  $('target').addEventListener('change', () => { selection = $('target').value; render(); });
  canvas.addEventListener('click', e => {
    const bounds = canvas.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) * canvas.width / bounds.width / screen.scale + screen.x) / 16;
    const y = ((e.clientY - bounds.top) * canvas.height / bounds.height / screen.scale + screen.y) / 16;
    const options = [...state.plots.map((p, i) => [p, 'p' + i]), ...state.deposits.map((d, i) => [d, 'd' + i])];
    options.sort(([a], [b]) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    if (Math.hypot(options[0][0].x - x, options[0][0].y - y) < 1.25) {
      selection = options[0][1];
      render();
    }
  });
  $('zoom').addEventListener('click', () => {
    zoom = !zoom;
    $('zoom').setAttribute('aria-pressed', String(zoom));
    render();
  });
  $('help').addEventListener('click', () => {
    tutorial = !tutorial;
    $('help').setAttribute('aria-pressed', String(tutorial));
    render();
  });
  for (const b of document.querySelectorAll('[data-speed]')) {
    b.addEventListener('click', () => { speed = Number(b.dataset.speed); change(); });
  }
  $('restart').addEventListener('click', () => menu(state.loss ? 'dead' : 'new'));
  $('resume').addEventListener('click', () => $('menu').close());
  $('confirm-new').addEventListener('click', () => {
    state = E.create();
    selection = 'p0';
    saved = false;
    $('menu').close();
    change();
  });
  $('menu').addEventListener('cancel', e => { if (state.loss) e.preventDefault(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      speed = 0;
      change();
    }
  });
  setInterval(() => {
    if (!speed || document.hidden || $('menu').open || state.loss) return;
    for (let i = 0; i < speed; i++) E.tick(state);
    change();
    if (state.loss) menu('dead');
  }, 540);
  menu(state.loss ? 'dead' : 'start');
  Promise.allSettled(spritePaths.map(async path => {
    const image = new Image();
    image.src = assetRoot + path + '.png';
    await image.decode();
    sprites[path] = image;
  })).then(results => {
    missingArt = results.some(result => result.status === 'rejected');
    paintLandscape();
    render();
  });
})();
