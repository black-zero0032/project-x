(() => {
  'use strict';
  const E = Outpost;
  const $ = id => document.getElementById(id);
  const key = 'project-x-benteng-lembah-v1';
  const labels = {
    food: 'Pangan', wood: 'Kayu', stone: 'Batu', core: 'Pusat peradaban', wall: 'Tembok timur',
    house: 'Hunian', farm: 'Kebun', store: 'Gudang', tower: 'Pos jaga', '': 'Petak kosong'
  };
  const professions = {
    food: ['Pengumpul pangan', '#dfab5c'], wood: ['Penebang', '#d28a62'],
    stone: ['Penambang', '#a7b7b8'], builder: ['Pembangun', '#edce82'],
    guard: ['Penjaga', '#db7264'], porter: ['Pengangkut', '#82c4ae'], '': ['Cadangan', '#a6a38f']
  };
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

  function tree(x, y, variant) {
    rect(x - 6, y + 3, 13, 3, '#203d34');
    rect(x - 1, y - 1, 3, 6, '#704b3a');
    rect(x - 7, y - 7, 14, 9, '#294b3d');
    rect(x - 5, y - 11, 10, 12, variant ? '#50724a' : '#3e6447');
    rect(x - 2, y - 13, 5, 6, variant ? '#74864e' : '#577b50');
    rect(x - 5, y - 6, 4, 3, '#648052');
  }

  const landscape = document.createElement('canvas');
  landscape.width = 432;
  landscape.height = 240;
  function paintLandscape() {
    const land = landscape.getContext('2d');
    for (let y = 0; y < 240; y += 4) {
      for (let x = 0; x < 432; x += 4) {
        const roll = random(x, y);
        const river = 20 + Math.round(Math.sin(y / 31) * 10);
        const path = Math.abs(y - (107 + Math.round(Math.sin(x / 27) * 6))) < 6 ||
          (x > 176 && x < 198 && y > 58 && y < 177);
        const palette = x < river ? ['#254e53', '#29565a', '#2d5e61'] :
          x < river + 5 ? ['#57766a', '#638272', '#688574'] :
          path ? ['#737358', '#797859', '#807b5b'] : ['#435d45', '#465f47', '#49634a', '#4d664b'];
        land.fillStyle = palette[roll % palette.length];
        land.fillRect(x, y, 4, 4);
        if (roll > 91 && !path && x > river + 5) {
          land.fillStyle = '#718258';
          land.fillRect(x + 1, y + 1, 1, 2);
        }
      }
    }
  }
  paintLandscape();

  function building(p, id) {
    const x = p.x * 16, y = p.y * 16;
    if (p.type === 'wall') return;
    if (p.job?.action === 'build' || !p.type) {
      rect(x - 13, y - 9, 26, 19, p.job ? '#806e4d' : '#415544');
      ctx.strokeStyle = p.job ? '#e6b473' : '#95a277';
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(x - 12.5, y - 8.5, 25, 17);
      ctx.setLineDash([]);
      if (p.job) {
        rect(x - 10, y - 1, 20, 3, '#aa8759');
        rect(x - 9, y - 5, 2, 13, '#d4a770');
        rect(x + 7, y - 5, 2, 13, '#d4a770');
      }
    } else if (!p.hp) {
      rect(x - 12, y - 5, 24, 11, '#3e4037');
      for (let i = 0; i < 7; i++) rect(x - 12 + i * 3, y - random(i, id) % 6, 4, 3, '#8c8271');
    } else {
      rect(x - 15, y + 4, 31, 7, '#293d33');
      if (p.type === 'farm') {
        rect(x - 13, y - 9, 26, 18, '#775942');
        for (let i = -9; i <= 9; i += 6) {
          rect(x + i, y - 7, 2, 14, '#b3aa62');
          for (let j = -6; j < 7; j += 4) rect(x + i - 1, y + j, 4, 2, '#c3bd76');
        }
      } else {
        const wide = p.type === 'core' ? 15 : p.type === 'tower' ? 8 : 11;
        const top = p.type === 'tower' ? 21 : 14;
        const roof = { core: '#53817a', tower: '#b27351', house: '#b46e4e', store: '#aa9160' }[p.type];
        rect(x - wide, y - top + 5, wide * 2, top + 3, '#4b4436');
        rect(x - wide + 2, y - top + 5, wide * 2 - 4, top + 1, '#a88c64');
        for (let i = 0; i < 4; i++) rect(x - wide - 2 + i, y - top + (3 - i) * 2, (wide + 2 - i) * 2, 3, roof);
        rect(x - 2, y, 5, 7, '#594636');
        rect(x - wide + 3, y - 4, 4, 4, '#f0bc69');
        if (p.type === 'core') rect(x + 6, y - 5, 5, 4, '#e9d297');
        if (p.type === 'store') {
          rect(x + 5, y + 1, 7, 6, '#604631');
          rect(x + 6, y + 2, 5, 3, '#bf995f');
        }
      }
      if (p.hp < p.max) {
        rect(x - 12, y + 11, 24, 2, '#382923');
        rect(x - 12, y + 11, Math.ceil(24 * p.hp / p.max), 2, '#d98366');
      }
    }
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    screen.scale = zoom ? 1.47 : 1;
    screen.x = zoom ? 73 : 0;
    screen.y = zoom ? 33 : 0;
    ctx.setTransform(screen.scale, 0, 0, screen.scale, -screen.x * screen.scale, -screen.y * screen.scale);
    ctx.drawImage(landscape, 0, 0);
    for (let y = 10; y < 239; y += 13) {
      for (let x = 36; x < 432; x += 14) {
        const roll = random(x, y);
        if ((x < 67 || x > 367 || y < 35 || y > 193) && roll > 31) tree(x + roll % 5, y, roll > 62);
      }
    }
    const wall = state.plots[1];
    if (wall.hp) {
      const wallColor = wall.hp > 30 ? '#9c9a81' : '#8a7562';
      for (let x = 114; x <= 304; x += 6) {
        rect(x, 51, 5, 6, wallColor);
        rect(x, 173, 5, 7, wallColor);
      }
      for (let y = 53; y < 175; y += 6) {
        if (y < 101 || y > 117) rect(113, y, 6, 5, wallColor);
        rect(304, y, 7, 5, wallColor);
      }
      rect(297, 101, 20, 20, '#715845');
      rect(300, 104, 14, 14, '#a3825d');
      rect(294, 124, 25, 3, '#513832');
      rect(294, 124, Math.ceil(25 * wall.hp / wall.max), 3, '#d6ae6b');
    } else {
      for (let i = 0; i < 7; i++) rect(295 + i * 3, 104 + random(i, 1) % 15, 5, 4, '#8a7765');
    }
    for (const d of state.deposits) {
      const x = d.x * 16, y = d.y * 16;
      if (d.kind === 'wood' && d.left) {
        tree(x - 6, y + 2, true); tree(x + 6, y + 1, false); tree(x, y - 4, true);
      } else if (d.kind === 'stone' && d.left) {
        rect(x - 9, y - 4, 18, 9, '#596e6c');
        rect(x - 6, y - 8, 13, 11, '#9aaea7');
        rect(x - 4, y - 9, 7, 3, '#cad0b3');
      } else if (d.kind === 'food' && d.left) {
        rect(x - 8, y - 5, 16, 11, '#365341');
        for (let i = -6; i <= 6; i += 3) rect(x + i, y - random(i, d.y) % 5, 2, 3, '#e2a568');
      } else {
        rect(x - 6, y - 3, 12, 6, '#655746');
      }
      rect(x - 8, y + 8, 16, 2, '#263733');
      rect(x - 8, y + 8, Math.ceil(16 * d.left / d.max), 2, '#e1b168');
    }
    state.plots.forEach(building);
    for (const w of [...state.workers].sort((a, b) => a.y - b.y)) {
      const x = w.x * 16 + (w.id % 3 - 1) * 3;
      const y = w.y * 16 + w.id % 4;
      rect(x - 2, y + 2, 6, 2, '#233632');
      rect(x - 1, y - 6, 4, 3, '#e0b490');
      rect(x - 2, y - 3, 6, 5, professions[w.role][1]);
      rect(x - 2, y + 2, 2, 2, '#2d3030');
      rect(x + 2, y + 2, 2, 2, '#2d3030');
      if (w.cargo) rect(x + 3, y - 2, 4, 4, professions[w.cargo.g][1]);
    }
    for (const e of state.enemies) {
      const x = e.x * 16 + e.id % 3, y = e.y * 16 + e.id % 4;
      rect(x - 2, y - 5, 5, 4, '#9eb296');
      rect(x - 3, y - 1, 7, 5, '#895b61');
      rect(x + 1, y - 4, 1, 1, '#ed876c');
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
    if (p.type) html += `<p>HP ${p.hp}/${p.max}${p.hp === 0 ? ' · reruntuhan' : E.efficiency(p) === 0 ? ' · berhenti' : ''}</p>`;
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
      storageAvailable ? '' : 'Simpan otomatis tidak tersedia di browser ini.'].filter(Boolean).join(' ');
    if ($('notice').textContent !== alert) $('notice').textContent = alert;
    const idle = E.count(state, '');
    $('idle').textContent = `${idle} cadangan`;
    replace($('roles'), E.roles.map(r => `<div class="role"><span><i class="chip" style="--role:${professions[r][1]}"></i>${professions[r][0]}</span>
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
})();
